#!/usr/bin/env python3
"""Read-only comparison of active uncovered funds versus EIMA historical reviews."""

from __future__ import annotations

import json
import os
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


EIMA_SOURCE_ID = "src_eima_historical_weekly_reports"


def request_json(url: str, api_key: str):
    request = Request(url, headers={"apikey": api_key, "Authorization": f"Bearer {api_key}"})
    with urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def page_all(base_url: str, api_key: str, endpoint: str, query: dict[str, str]):
    rows = []
    offset = 0
    page_size = 1000
    while True:
        page = request_json(
            f"{base_url}/rest/v1/{endpoint}?{urlencode({**query, 'limit': str(page_size), 'offset': str(offset)})}",
            api_key,
        )
        rows.extend(page)
        if len(page) < page_size:
            return rows
        offset += page_size


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: report_uncovered_eima_history.py <as-of-date> <output.md>")
    as_of_date, output_path = sys.argv[1], Path(sys.argv[2]).resolve()
    base_url = os.environ.get("SUPABASE_URL")
    api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not api_key:
        raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

    funds = page_all(
        base_url,
        api_key,
        "funds",
        {"select": "fund_id,canonical_name,eima_name_raw,active", "active": "eq.true", "order": "canonical_name.asc"},
    )
    validated = page_all(
        base_url,
        api_key,
        "fund_prices",
        {"select": "fund_id", "status": "eq.validated", "valuation_date": f"lte.{as_of_date}"},
    )
    covered_ids = {row["fund_id"] for row in validated}
    uncovered = [fund for fund in funds if fund["fund_id"] not in covered_ids]
    eima_rows = page_all(
        base_url,
        api_key,
        "fund_prices",
        {
            "select": "fund_id,nav,currency,valuation_date,raw_name,raw_payload",
            "source_id": f"eq.{EIMA_SOURCE_ID}",
            "status": "eq.review",
            "order": "valuation_date.desc",
        },
    )
    latest_by_fund = {}
    for row in eima_rows:
        if row["fund_id"] not in latest_by_fund:
            latest_by_fund[row["fund_id"]] = row

    records = []
    for fund in uncovered:
        historical = latest_by_fund.get(fund["fund_id"])
        records.append(
            {
                "fund_id": fund["fund_id"],
                "canonical_name": fund["canonical_name"],
                "has_eima_history": historical is not None,
                "latest_eima_date": historical.get("valuation_date") if historical else None,
                "latest_eima_nav": historical.get("nav") if historical else None,
                "latest_eima_currency": historical.get("currency") if historical else None,
                "eima_raw_name": historical.get("raw_name") if historical else None,
                "eima_raw_manager": historical.get("raw_payload", {}).get("raw_manager_name") if historical else None,
            }
        )

    history_count = sum(1 for record in records if record["has_eima_history"])
    no_history_count = len(records) - history_count
    markdown = [
        f"# Uncovered Funds vs. EIMA Historical Reviews — {as_of_date}",
        "",
        "This read-only report compares active funds without a validated NAV on or before the as-of date with their latest review-only EIMA historical observation. EIMA observations remain **review** records and cannot close coverage or replace a first-party manager, bank, or regulator source.",
        "",
        "| Measure | Count |",
        "| --- | ---: |",
        f"| Active funds without validated NAV | {len(records)} |",
        f"| Of these, with review-only EIMA history | {history_count} |",
        f"| Of these, without EIMA history | {no_history_count} |",
        "",
        "| Fund | Latest EIMA review date | NAV | Currency | EIMA raw manager | Import status |",
        "| --- | --- | ---: | --- | --- | --- |",
    ]
    for record in records:
        if record["has_eima_history"]:
            markdown.append(
                f"| {record['canonical_name']} | {record['latest_eima_date']} | {record['latest_eima_nav']} | {record['latest_eima_currency']} | {record['eima_raw_manager']} | Review only — requires first-party corroboration |"
            )
        else:
            markdown.append(f"| {record['canonical_name']} | — | — | — | — | No imported EIMA observation |")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(markdown) + "\n", encoding="utf-8")
    print(json.dumps({"asOfDate": as_of_date, "uncovered": len(records), "withEimaHistory": history_count, "withoutEimaHistory": no_history_count, "records": records}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
