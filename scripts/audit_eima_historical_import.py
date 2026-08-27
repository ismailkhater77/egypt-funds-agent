#!/usr/bin/env python3
"""Read-only integrity audit for EIMA historical review records."""

from __future__ import annotations

import json
import os
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SOURCE_ID = "src_eima_historical_weekly_reports"


def request_json(url: str, api_key: str):
    request = Request(url, headers={"apikey": api_key, "Authorization": f"Bearer {api_key}"})
    with urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def page_all(base_url: str, api_key: str, query: dict[str, str]):
    page_size = 1000
    rows = []
    offset = 0
    while True:
        response = request_json(
            f"{base_url}/rest/v1/fund_prices?{urlencode({**query, 'order': 'fund_id.asc,valuation_date.asc', 'limit': str(page_size), 'offset': str(offset)})}",
            api_key,
        )
        rows.extend(response)
        if len(response) < page_size:
            return rows
        offset += page_size


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: audit_eima_historical_import.py <as-of-date> <output.json>")
    as_of_date, output_file = sys.argv[1], Path(sys.argv[2]).resolve()
    base_url = os.environ.get("SUPABASE_URL")
    api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not api_key:
        raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

    sources = request_json(
        f"{base_url}/rest/v1/sources?{urlencode({'select': 'source_id,source_name,source_url,source_kind,active', 'source_id': f'eq.{SOURCE_ID}', 'limit': '2'})}",
        api_key,
    )
    rows = page_all(
        base_url,
        api_key,
        {
            "select": "id,fund_id,source_id,nav,currency,valuation_date,status,raw_payload",
            "source_id": f"eq.{SOURCE_ID}",
        },
    )
    bad_status = [row for row in rows if row.get("status") != "review"]
    bad_observation_state = [
        row
        for row in rows
        if row.get("raw_payload", {}).get("observation_state") != "historical_import_eima_review"
    ]
    future_dates = [row for row in rows if row.get("valuation_date", "") > as_of_date]
    duplicate_keys = Counter((row["fund_id"], row["valuation_date"], row["source_id"], row.get("status")) for row in rows)
    duplicate_groups = [
        {"fund_id": key[0], "valuation_date": key[1], "source_id": key[2], "status": key[3], "count": count}
        for key, count in duplicate_keys.items()
        if count > 1
    ]
    audit = {
        "as_of_date": as_of_date,
        "source_rows": sources,
        "source_exists_exactly_once": len(sources) == 1,
        "historical_review_rows": len(rows),
        "currency_counts": dict(Counter(row.get("currency") for row in rows)),
        "valuation_date_min": min((row.get("valuation_date") for row in rows), default=None),
        "valuation_date_max": max((row.get("valuation_date") for row in rows), default=None),
        "non_review_rows": len(bad_status),
        "wrong_observation_state_rows": len(bad_observation_state),
        "future_dated_eima_rows": len(future_dates),
        "same_source_duplicate_groups": len(duplicate_groups),
        "same_source_duplicate_groups_sample": duplicate_groups[:25],
        "coverage_rule": "All EIMA rows are review records and excluded from validated coverage by status.",
    }
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
