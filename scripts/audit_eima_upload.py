#!/usr/bin/env python3
"""Read-only structural audit for an uploaded EIMA historical NAV CSV."""

from __future__ import annotations

import csv
import json
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path


REQUIRED_COLUMNS = {
    "report_date",
    "report_status",
    "category",
    "fund_name_raw",
    "management_company_raw",
    "nav_value",
    "source_page",
}


def clean(value: str | None) -> str:
    return (value or "").strip()


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: audit_eima_upload.py <input.csv> <output.json>")

    input_path = Path(sys.argv[1]).resolve()
    output_path = Path(sys.argv[2]).resolve()
    if not input_path.is_file():
        raise SystemExit(f"Input file does not exist: {input_path}")

    total_rows = 0
    missing_required = Counter()
    malformed_dates: list[dict[str, str]] = []
    malformed_navs: list[dict[str, str]] = []
    dated_rows: list[date] = []
    report_dates = Counter()
    report_statuses = Counter()
    categories = Counter()
    sources = Counter()
    managers = Counter()
    funds = Counter()
    price_groups: dict[tuple[str, str, str, str, str], int] = defaultdict(int)
    canonical_candidates: dict[tuple[str, str, str], set[str]] = defaultdict(set)

    with input_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        headers = reader.fieldnames or []
        missing_columns = sorted(REQUIRED_COLUMNS.difference(headers))
        if missing_columns:
            raise SystemExit(f"Missing required columns: {', '.join(missing_columns)}")

        for row_number, row in enumerate(reader, start=2):
            total_rows += 1
            for column in REQUIRED_COLUMNS:
                if not clean(row.get(column)):
                    missing_required[column] += 1

            report_date = clean(row.get("report_date"))
            try:
                parsed_date = date.fromisoformat(report_date)
                dated_rows.append(parsed_date)
                report_dates[report_date] += 1
            except ValueError:
                if len(malformed_dates) < 25:
                    malformed_dates.append({"row": str(row_number), "report_date": report_date})

            nav_value = clean(row.get("nav_value"))
            try:
                nav = float(nav_value)
                if nav <= 0:
                    raise ValueError
            except ValueError:
                if len(malformed_navs) < 25:
                    malformed_navs.append(
                        {
                            "row": str(row_number),
                            "fund_name_raw": clean(row.get("fund_name_raw")),
                            "nav_value": nav_value,
                        }
                    )

            fund = clean(row.get("fund_name_raw"))
            manager = clean(row.get("management_company_raw"))
            category = clean(row.get("category"))
            source_page = clean(row.get("source_page"))
            report_statuses[clean(row.get("report_status"))] += 1
            categories[category] += 1
            sources[source_page] += 1
            managers[manager] += 1
            funds[fund] += 1

            # The CSV repeats each NAV once per return horizon. This key deliberately excludes horizon.
            price_groups[(report_date, fund, manager, nav_value, source_page)] += 1
            canonical_candidates[(report_date, fund, manager)].add(nav_value)

    duplicate_horizon_groups = [
        {
            "report_date": key[0],
            "fund_name_raw": key[1],
            "management_company_raw": key[2],
            "nav_value": key[3],
            "source_page": key[4],
            "row_count": count,
        }
        for key, count in price_groups.items()
        if count > 1
    ]
    conflicting_nav_groups = [
        {
            "report_date": key[0],
            "fund_name_raw": key[1],
            "management_company_raw": key[2],
            "nav_values": sorted(values),
        }
        for key, values in canonical_candidates.items()
        if len(values) > 1
    ]

    audit = {
        "input_file": str(input_path),
        "file_size_bytes": input_path.stat().st_size,
        "headers": headers,
        "total_rows": total_rows,
        "unique_raw_funds": len(funds),
        "unique_raw_managers": len(managers),
        "date_range": {
            "minimum": min(dated_rows).isoformat() if dated_rows else None,
            "maximum": max(dated_rows).isoformat() if dated_rows else None,
            "distinct_report_dates": len(report_dates),
            "report_date_row_counts": dict(sorted(report_dates.items())),
        },
        "report_statuses": dict(report_statuses.most_common()),
        "required_field_blanks": dict(missing_required),
        "malformed_dates_sample": malformed_dates,
        "malformed_navs_sample": malformed_navs,
        "source_pages": dict(sources.most_common()),
        "top_categories": dict(categories.most_common(25)),
        "top_managers": dict(managers.most_common(50)),
        "top_funds": dict(funds.most_common(100)),
        "unique_candidate_nav_observations_before_catalog_matching": len(price_groups),
        "duplicate_horizon_group_count": len(duplicate_horizon_groups),
        "duplicate_horizon_groups_sample": duplicate_horizon_groups[:50],
        "conflicting_nav_same_date_fund_manager_count": len(conflicting_nav_groups),
        "conflicting_nav_same_date_fund_manager_sample": conflicting_nav_groups[:50],
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(audit, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
