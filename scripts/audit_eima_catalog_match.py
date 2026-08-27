#!/usr/bin/env python3
"""Read-only EIMA history to catalog identity audit.

This script deliberately performs no database writes. It creates a batch Entity Card
for every distinct raw fund/manager pair and separates deterministic matches from
ambiguous or unmatched observations before an import path is considered.
"""

from __future__ import annotations

import csv
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def clean(value: str | None) -> str:
    return (value or "").strip()


def normalize(value: str | None) -> str:
    text = unicodedata.normalize("NFKD", clean(value)).casefold()
    text = text.replace("*", "")
    text = text.replace("$", " usd ")
    text = re.sub(r"[()\[\]{}'’`.,:/\\&-]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def supabase_funds() -> list[dict[str, object]]:
    base_url = os.environ.get("SUPABASE_URL")
    api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not api_key:
        raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    query = urlencode(
        {
            "select": "fund_id,canonical_name,eima_name_raw,category,active,price_update_url",
            "order": "canonical_name.asc",
            "limit": "1000",
        }
    )
    request = Request(
        f"{base_url}/rest/v1/funds?{query}",
        headers={"apikey": api_key, "Authorization": f"Bearer {api_key}"},
    )
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def score(raw_name: str, fund: dict[str, object]) -> float:
    names = [clean(fund.get("canonical_name")), clean(fund.get("eima_name_raw"))]
    return max(SequenceMatcher(None, normalize(raw_name), normalize(name)).ratio() for name in names if name)


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Usage: audit_eima_catalog_match.py <input.csv> <audit.json> <entity-card.md>")

    input_path = Path(sys.argv[1]).resolve()
    audit_path = Path(sys.argv[2]).resolve()
    entity_card_path = Path(sys.argv[3]).resolve()

    observations: dict[tuple[str, str, str, str, str], int] = defaultdict(int)
    source_files = Counter()
    with input_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            report_date = clean(row.get("report_date"))
            fund_name = clean(row.get("fund_name_raw"))
            manager = clean(row.get("management_company_raw"))
            nav = clean(row.get("nav_value"))
            if not report_date or not fund_name or not nav:
                continue
            try:
                if float(nav) <= 0:
                    continue
            except ValueError:
                continue
            key = (report_date, fund_name, manager, nav, clean(row.get("source_page")))
            observations[key] += 1
            source_files[clean(row.get("source_file"))] += 1

    catalog = supabase_funds()
    exact_index: dict[str, list[dict[str, object]]] = defaultdict(list)
    for fund in catalog:
        for name_key in {normalize(fund.get("canonical_name")), normalize(fund.get("eima_name_raw"))}:
            if name_key:
                exact_index[name_key].append(fund)

    entity_keys = sorted({(obs[1], obs[2]) for obs in observations})
    entity_rows: list[dict[str, object]] = []
    classification = Counter()
    matched_observations = 0
    active_matched_observations = 0

    for raw_name, raw_manager in entity_keys:
        direct_matches = exact_index.get(normalize(raw_name), [])
        unique_ids = {str(fund["fund_id"]) for fund in direct_matches}
        if len(unique_ids) == 1:
            catalog_fund = direct_matches[0]
            status = "EXACT_ACTIVE" if catalog_fund.get("active") else "EXACT_INACTIVE"
            matched_observations += sum(
                count for key, count in observations.items() if key[1] == raw_name and key[2] == raw_manager
            )
            if catalog_fund.get("active"):
                active_matched_observations += sum(
                    count for key, count in observations.items() if key[1] == raw_name and key[2] == raw_manager
                )
            candidate_details = [
                {
                    "fund_id": catalog_fund["fund_id"],
                    "canonical_name": catalog_fund.get("canonical_name"),
                    "eima_name_raw": catalog_fund.get("eima_name_raw"),
                    "active": catalog_fund.get("active"),
                    "score": 1.0,
                }
            ]
        elif len(unique_ids) > 1:
            status = "AMBIGUOUS_EXACT"
            candidate_details = [
                {
                    "fund_id": fund["fund_id"],
                    "canonical_name": fund.get("canonical_name"),
                    "eima_name_raw": fund.get("eima_name_raw"),
                    "active": fund.get("active"),
                    "score": 1.0,
                }
                for fund in direct_matches
            ]
        else:
            ranked = sorted(((score(raw_name, fund), fund) for fund in catalog), key=lambda item: item[0], reverse=True)[:3]
            if ranked and ranked[0][0] >= 0.92 and (len(ranked) == 1 or ranked[0][0] - ranked[1][0] >= 0.05):
                status = "FUZZY_REVIEW"
            else:
                status = "UNMATCHED"
            candidate_details = [
                {
                    "fund_id": fund["fund_id"],
                    "canonical_name": fund.get("canonical_name"),
                    "eima_name_raw": fund.get("eima_name_raw"),
                    "active": fund.get("active"),
                    "score": round(match_score, 4),
                }
                for match_score, fund in ranked
            ]

        dates = sorted({key[0] for key in observations if key[1] == raw_name and key[2] == raw_manager})
        nav_observations = sum(count for key, count in observations.items() if key[1] == raw_name and key[2] == raw_manager)
        entity_rows.append(
            {
                "raw_fund_name": raw_name,
                "raw_manager_name": raw_manager,
                "classification": status,
                "report_date_min": dates[0],
                "report_date_max": dates[-1],
                "unique_dates": len(dates),
                "source_row_count": nav_observations,
                "candidates": candidate_details,
            }
        )
        classification[status] += 1

    audit = {
        "input_file": str(input_path),
        "catalog_fund_count": len(catalog),
        "candidate_nav_observations": len(observations),
        "candidate_source_rows_after_horizon_dedup": sum(observations.values()),
        "entity_count": len(entity_rows),
        "entity_classifications": dict(classification),
        "source_files": dict(source_files.most_common()),
        "matched_source_rows": matched_observations,
        "active_matched_source_rows": active_matched_observations,
        "entities": entity_rows,
    }
    audit_path.parent.mkdir(parents=True, exist_ok=True)
    audit_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# EIMA Historical NAV Import — Batch Entity Card",
        "",
        "This file is a read-only identity register generated before any import. `EXACT_ACTIVE` uses a normalized exact match to one active catalog row; all other classifications require explicit review and are excluded from automatic import.",
        "",
        "| Raw fund | Raw manager | Identity status | Date range | Dates | Candidate catalog identity |",
        "| --- | --- | --- | --- | ---: | --- |",
    ]
    for entity in entity_rows:
        candidates = entity["candidates"]
        candidate_text = "; ".join(
            f"{candidate['canonical_name']} ({candidate['fund_id']}, {candidate['score']})"
            for candidate in candidates
        ) or "—"
        lines.append(
            "| {raw_fund_name} | {raw_manager_name} | {classification} | {report_date_min} to {report_date_max} | {unique_dates} | {candidates} |".format(
                raw_fund_name=entity["raw_fund_name"],
                raw_manager_name=entity["raw_manager_name"],
                classification=entity["classification"],
                report_date_min=entity["report_date_min"],
                report_date_max=entity["report_date_max"],
                unique_dates=entity["unique_dates"],
                candidates=candidate_text.replace("|", "/"),
            )
        )
    entity_card_path.parent.mkdir(parents=True, exist_ok=True)
    entity_card_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({key: audit[key] for key in audit if key != "entities"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
