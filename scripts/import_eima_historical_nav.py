#!/usr/bin/env python3
"""Idempotently import EIMA historical observations as *review* records.

EIMA is a professional association supervised by FRA, not a fund manager, bank,
or regulator. This tool deliberately never writes `validated` snapshots. It
keeps historical observations separately under one inactive EIMA source so they
cannot alter coverage, current collector sources, or the scheduled-weekly flow.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SOURCE_ID = "src_eima_historical_weekly_reports"
SOURCE_URL = "https://eima.org.eg/"
SOURCE_NAME = "EIMA Historical Weekly Fund Performance Reports (user-provided import)"
PARSER_NAME = "eima_historical_csv_v1"
STATUS_PRIORITY = {"Original": 1, "Edited": 2, "Amended": 3}


def clean(value: str | None) -> str:
    return (value or "").strip()


def currency_for(row: dict[str, str]) -> tuple[str, str]:
    """Resolve only what the report labels imply, preserving the inference path."""
    category = clean(row.get("category")).casefold()
    fund_name = clean(row.get("fund_name_raw")).casefold()
    if "euro" in category or " eur" in fund_name or "€" in fund_name:
        return "EUR", "explicit_euro_category_or_name"
    if "dollar" in category or "usd" in fund_name or "$" in fund_name:
        return "USD", "explicit_dollar_category_or_name"
    return "EGP", "egp_default_for_egyptian_fund_report"


def load_exact_active_map(path: Path) -> dict[tuple[str, str], str]:
    audit = json.loads(path.read_text(encoding="utf-8"))
    mapping: dict[tuple[str, str], str] = {}
    for entity in audit.get("entities", []):
        if entity.get("classification") != "EXACT_ACTIVE":
            continue
        candidates = entity.get("candidates", [])
        if len(candidates) != 1:
            continue
        fund_id = clean(candidates[0].get("fund_id"))
        if fund_id:
            mapping[(clean(entity.get("raw_fund_name")), clean(entity.get("raw_manager_name")))] = fund_id
    return mapping


def prepare_observations(csv_path: Path, identity_map: dict[tuple[str, str], str], as_of: date) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    excluded = Counter()
    input_rows = 0

    with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row_number, row in enumerate(reader, start=2):
            input_rows += 1
            raw_name = clean(row.get("fund_name_raw"))
            raw_manager = clean(row.get("management_company_raw"))
            fund_id = identity_map.get((raw_name, raw_manager))
            if not fund_id:
                excluded["non_exact_or_inactive_identity"] += 1
                continue
            try:
                valuation_date = date.fromisoformat(clean(row.get("report_date")))
            except ValueError:
                excluded["invalid_valuation_date"] += 1
                continue
            if valuation_date > as_of:
                excluded["future_valuation_date"] += 1
                continue
            try:
                nav = float(clean(row.get("nav_value")))
                if nav <= 0:
                    raise ValueError
            except ValueError:
                excluded["invalid_or_missing_nav"] += 1
                continue
            currency, currency_resolution = currency_for(row)
            grouped[(fund_id, valuation_date.isoformat())].append(
                {
                    "row_number": row_number,
                    "fund_id": fund_id,
                    "raw_name": raw_name,
                    "raw_manager": raw_manager,
                    "nav": nav,
                    "currency": currency,
                    "currency_resolution": currency_resolution,
                    "valuation_date": valuation_date.isoformat(),
                    "report_status": clean(row.get("report_status")),
                    "source_page": clean(row.get("source_page")),
                    "source_file": clean(row.get("source_file")),
                    "horizon": clean(row.get("horizon")),
                }
            )

    prepared: list[dict[str, Any]] = []
    conflicts: list[dict[str, Any]] = []
    for key, rows in sorted(grouped.items()):
        values = {(row["nav"], row["currency"]) for row in rows}
        if len(values) != 1:
            conflicts.append(
                {
                    "fund_id": key[0],
                    "valuation_date": key[1],
                    "nav_currency_values": sorted({f"{nav}|{currency}" for nav, currency in values}),
                    "source_rows": [row["row_number"] for row in rows],
                }
            )
            continue
        selected = max(rows, key=lambda row: (STATUS_PRIORITY.get(row["report_status"], 0), row["row_number"]))
        prepared.append(
            {
                **selected,
                "collapsed_source_row_count": len(rows),
                "horizons_collapsed": sorted({row["horizon"] for row in rows if row["horizon"]}),
                "report_statuses_collapsed": sorted({row["report_status"] for row in rows if row["report_status"]}),
                "source_pages_collapsed": sorted({row["source_page"] for row in rows if row["source_page"]}),
                "source_files_collapsed": sorted({row["source_file"] for row in rows if row["source_file"]}),
            }
        )

    summary: dict[str, Any] = {
        "input_rows": input_rows,
        "exact_active_identity_pairs": len(identity_map),
        "eligible_unique_fund_date_observations": len(prepared),
        "excluded_input_rows": dict(excluded),
        "conflicting_fund_date_groups_excluded": len(conflicts),
        "conflicting_fund_date_groups_sample": conflicts[:50],
        "currency_counts": dict(Counter(row["currency"] for row in prepared)),
    }
    return prepared, summary


def request_json(url: str, api_key: str, method: str = "GET", payload: Any | None = None, prefer: str | None = None) -> Any:
    headers = {"apikey": api_key, "Authorization": f"Bearer {api_key}"}
    body = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    if prefer:
        headers["Prefer"] = prefer
    request = Request(url, data=body, headers=headers, method=method)
    with urlopen(request, timeout=60) as response:
        response_body = response.read().decode("utf-8")
        return json.loads(response_body) if response_body else None


def ensure_eima_source(base_url: str, api_key: str) -> None:
    query = urlencode(
        {
            "select": "source_id,source_name,source_url,source_kind,active",
            "source_id": f"eq.{SOURCE_ID}",
            "limit": "2",
        }
    )
    existing = request_json(f"{base_url}/rest/v1/sources?{query}", api_key)
    if len(existing) > 1:
        raise RuntimeError(f"Expected one or no EIMA source rows; found {len(existing)}")
    if existing:
        source = existing[0]
        expected = {
            "source_id": SOURCE_ID,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "source_kind": "industry_association_historical_report",
            "active": False,
        }
        mismatches = {key: {"expected": value, "actual": source.get(key)} for key, value in expected.items() if source.get(key) != value}
        if mismatches:
            raise RuntimeError(f"Refusing to reuse a conflicting EIMA source record: {json.dumps(mismatches, ensure_ascii=False)}")
        return
    request_json(
        f"{base_url}/rest/v1/sources",
        api_key,
        method="POST",
        payload={
            "source_id": SOURCE_ID,
            "source_name": SOURCE_NAME,
            "source_url": SOURCE_URL,
            "source_kind": "industry_association_historical_report",
            "active": False,
        },
        prefer="return=minimal",
    )


def existing_review_rows(base_url: str, api_key: str) -> dict[tuple[str, str], dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    while True:
        query = urlencode(
            {
                "select": "id,fund_id,valuation_date,nav,currency,status",
                "source_id": f"eq.{SOURCE_ID}",
                "status": "eq.review",
                "order": "fund_id.asc,valuation_date.asc",
                "limit": str(page_size),
                "offset": str(offset),
            }
        )
        page = request_json(f"{base_url}/rest/v1/fund_prices?{query}", api_key)
        rows.extend(page)
        if len(page) < page_size:
            break
        offset += page_size
    return {(row["fund_id"], row["valuation_date"]): row for row in rows}


def payload_for(observation: dict[str, Any]) -> dict[str, Any]:
    return {
        "fund_id": observation["fund_id"],
        "nav": observation["nav"],
        "currency": observation["currency"],
        "valuation_date": observation["valuation_date"],
        "source_id": SOURCE_ID,
        "parser_name": PARSER_NAME,
        "status": "review",
        "raw_name": observation["raw_name"],
        "raw_payload": {
            "source_url": SOURCE_URL,
            "observation_state": "historical_import_eima_review",
            "provenance_class": "professional_association_under_fra_supervision",
            "user_provided_file": "eima_fund_performance_integrated(1).csv",
            "raw_manager_name": observation["raw_manager"],
            "report_status": observation["report_status"],
            "source_pages": observation["source_pages_collapsed"],
            "source_files": observation["source_files_collapsed"],
            "collapsed_source_row_count": observation["collapsed_source_row_count"],
            "horizons_collapsed": observation["horizons_collapsed"],
            "currency_resolution": observation["currency_resolution"],
            "validated_policy_note": "Imported as review because EIMA is not the fund manager, bank, or regulator; never counts toward validated coverage.",
        },
    }


def split_chunks(items: list[dict[str, Any]], size: int = 250) -> list[list[dict[str, Any]]]:
    return [items[index : index + size] for index in range(0, len(items), size)]


def main() -> None:
    parser = argparse.ArgumentParser(description="Import EIMA historical NAVs as review records only.")
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--match-audit", required=True, type=Path)
    parser.add_argument("--as-of", required=True, type=date.fromisoformat)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--apply", action="store_true", help="Write review records. Default is read-only dry run.")
    args = parser.parse_args()

    identity_map = load_exact_active_map(args.match_audit.resolve())
    observations, summary = prepare_observations(args.csv.resolve(), identity_map, args.as_of)
    result: dict[str, Any] = {
        "mode": "apply" if args.apply else "dry_run",
        "as_of_date": args.as_of.isoformat(),
        "source": {"source_id": SOURCE_ID, "source_url": SOURCE_URL, "source_kind": "industry_association_historical_report", "active": False},
        "policy": "All records are status=review / historical_import_eima_review; no record is validated by this importer.",
        **summary,
    }

    if args.apply:
        base_url = os.environ.get("SUPABASE_URL")
        api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not base_url or not api_key:
            raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        ensure_eima_source(base_url, api_key)
        existing = existing_review_rows(base_url, api_key)
        inserts: list[dict[str, Any]] = []
        unchanged = 0
        existing_conflicts: list[dict[str, Any]] = []
        for observation in observations:
            key = (observation["fund_id"], observation["valuation_date"])
            old = existing.get(key)
            if old is None:
                inserts.append(payload_for(observation))
            elif float(old["nav"]) == observation["nav"] and old["currency"] == observation["currency"] and old["status"] == "review":
                unchanged += 1
            else:
                existing_conflicts.append(
                    {
                        "fund_id": observation["fund_id"],
                        "valuation_date": observation["valuation_date"],
                        "existing_nav": old["nav"],
                        "existing_currency": old["currency"],
                        "candidate_nav": observation["nav"],
                        "candidate_currency": observation["currency"],
                    }
                )
        for chunk in split_chunks(inserts):
            request_json(
                f"{base_url}/rest/v1/fund_prices",
                api_key,
                method="POST",
                payload=chunk,
                prefer="return=minimal",
            )
        result.update(
            {
                "inserted": len(inserts),
                "unchanged": unchanged,
                "existing_conflicts_not_overwritten": len(existing_conflicts),
                "existing_conflicts_sample": existing_conflicts[:50],
            }
        )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
