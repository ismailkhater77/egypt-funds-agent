#!/usr/bin/env python3
"""Reconcile the 31-report EIMA manifest against the uploaded historical CSV.

No fund-price row is changed. Optional --apply-source-index only updates the
single inactive EIMA source record to point at the official reports index.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


SOURCE_ID = "src_eima_historical_weekly_reports"
REPORTS_INDEX_URL = "https://eima.org.eg/?page_id=1886"
REPORT_MANIFEST = [
    ("2025-12-31", "December 31st, 2025", "http://eima.org.eg/wp-content/uploads/2026/04/Performance-31-December-2025-Time-Weighted-Final.pdf"),
    ("2026-01-08", "January 08th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-8-January-2026-Time-Weighted.pdf"),
    ("2026-01-15", "January 15th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-15-January-2026-Time-Weighted.pdf"),
    ("2026-01-22", "January 22th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-22-January-2026-Time-Weighted.pdf"),
    ("2026-01-29", "January 29th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-29-January-2026-Time-Weighted.pdf"),
    ("2026-02-05", "February 05th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-5-February-2026-Time-Weighted.pdf"),
    ("2026-02-12", "February 12th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-12-February-2026-Time-Weighted.pdf"),
    ("2026-02-19", "February 19th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-19-February-2026-Time-Weighted.pdf"),
    # The live EIMA index labels this as "February 29th" but links a 26-Feb PDF;
    # 2026 has no 29 February and the CSV stores the valid 2026-02-26 report date.
    ("2026-02-26", "February 29th, 2026 (site label; PDF filename confirms 26-Feb)", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-26-February-2026-Time-Weighted.pdf"),
    ("2026-03-05", "March 05th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-5-March-2026-Time-Weighted.pdf"),
    ("2026-03-12", "March 12th, 2026", "http://eima.org.eg/wp-content/uploads/2026/03/Performance-12-March-2026-Time-Weighted.pdf"),
    ("2026-03-19", "March 19th, 2026", "http://eima.org.eg/wp-content/uploads/2026/04/Performance-19-March-2026-Time-Weighted.pdf"),
    ("2026-03-26", "March 26th, 2026", "http://eima.org.eg/wp-content/uploads/2026/04/Performance-26-March-2026-Time-Weighted.pdf"),
    ("2026-04-02", "April 02nd, 2026 (Amended)", "http://eima.org.eg/wp-content/uploads/2026/04/Amended-Performance-02-April-2026-Time-Weighted1.pdf"),
    ("2026-04-09", "April 09th, 2026", "http://eima.org.eg/wp-content/uploads/2026/04/Performance-09-April-2026-Time-Weighted.pdf"),
    ("2026-04-16", "April 16th, 2026 (Edited)", "http://eima.org.eg/wp-content/uploads/2026/04/Edited-Performance-16-April-2026-Time-Weighted.pdf"),
    ("2026-04-23", "April 23rd, 2026", "http://eima.org.eg/wp-content/uploads/2026/04/Performance-23-April-2026-Time-Weighted.pdf"),
    ("2026-04-30", "April 30th, 2026", "http://eima.org.eg/wp-content/uploads/2026/05/Performance-30-April-2026-Time-Weighted.pdf"),
    ("2026-05-07", "May 07th, 2026", "http://eima.org.eg/wp-content/uploads/2026/05/Performance-07-May-2026-Time-Weighted.pdf"),
    ("2026-05-14", "May 14th, 2026", "http://eima.org.eg/wp-content/uploads/2026/05/Performance-14-May-2026-Time-Weighted.pdf"),
    ("2026-05-21", "May 21st, 2026", "http://eima.org.eg/wp-content/uploads/2026/06/Performance-21-May-2026-Time-Weighted.pdf"),
    ("2026-05-28", "May 28th, 2026", "http://eima.org.eg/wp-content/uploads/2026/06/Performance-28-May-2026-Time-Weighted.pdf"),
    ("2026-06-04", "June 04th, 2026", "http://eima.org.eg/wp-content/uploads/2026/06/Performance-04-June-2026-Time-Weighted.pdf"),
    ("2026-06-11", "June 11th, 2026", "http://eima.org.eg/wp-content/uploads/2026/06/Performance-11-June-2026-Time-Weighted.pdf"),
    ("2026-06-18", "June 18th, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-18-June-2026-Time-Weighted.pdf"),
    ("2026-06-25", "June 25th, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-25-June-2026-Time-Weighted.pdf"),
    ("2026-07-02", "July 02nd, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-02-of-July-2026-Time-Weighted.pdf"),
    ("2026-07-09", "July 09th, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-09-of-July-2026-Time-Weighted.pdf"),
    ("2026-07-16", "July 16th, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-16-of-July-2026-Time-Weighted.pdf"),
    ("2026-07-23", "July 23rd, 2026", "http://eima.org.eg/wp-content/uploads/2026/07/Performance-23-of-July-2026-Time-Weighted1.pdf"),
    ("2026-07-30", "July 30th, 2026", "http://eima.org.eg/wp-content/uploads/2026/08/Performance-30-of-July-2026-Time-Weighted.pdf"),
]


def load_csv_dates(path: Path) -> Counter[str]:
    dates: Counter[str] = Counter()
    with path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        for row in csv.DictReader(csv_file):
            dates[(row.get("report_date") or "").strip()] += 1
    return dates


def update_source_index() -> dict[str, object]:
    base_url = os.environ.get("SUPABASE_URL")
    api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not base_url or not api_key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    headers = {"apikey": api_key, "Authorization": f"Bearer {api_key}", "Content-Type": "application/json", "Prefer": "return=representation"}
    url = f"{base_url}/rest/v1/sources?{urlencode({'source_id': f'eq.{SOURCE_ID}'})}"
    request = Request(
        url,
        method="PATCH",
        headers=headers,
        data=json.dumps(
            {
                "source_name": "EIMA Historical Weekly Fund Performance Reports (31-report user-provided import)",
                "source_url": REPORTS_INDEX_URL,
                "source_kind": "industry_association_historical_report",
                "active": False,
            }
        ).encode("utf-8"),
    )
    with urlopen(request, timeout=30) as response:
        rows = json.loads(response.read().decode("utf-8"))
    if len(rows) != 1:
        raise RuntimeError(f"Expected exactly one source update row; got {len(rows)}")
    return rows[0]


def markdown_report(manifest: list[tuple[str, str, str]], csv_dates: Counter[str]) -> str:
    manifest_dates = {date_value for date_value, _, _ in manifest}
    csv_date_set = set(csv_dates)
    missing_from_csv = sorted(manifest_dates - csv_date_set)
    extra_in_csv = sorted(csv_date_set - manifest_dates)
    lines = [
        "# EIMA 31-Report Manifest Reconciliation — 27 August 2026",
        "",
        "The user confirmed that the uploaded CSV is a consolidation of 31 weekly EIMA fund-performance reports listed on EIMA’s official reports index.[1] This reconciliation compares those 31 canonical report dates with the CSV `report_date` field. It does not change fund-price observations.",
        "",
        "| Control | Result |",
        "| --- | --- |",
        f"| Reports in reconciled manifest | {len(manifest)} |",
        f"| Distinct `report_date` values in CSV | {len(csv_dates)} |",
        f"| Manifest dates absent from CSV | {len(missing_from_csv)} |",
        f"| CSV dates absent from manifest | {len(extra_in_csv)} |",
        "| Source classification | Review-only historical association source; not validated NAV |",
        "",
        "## Explicit date correction",
        "",
        "The EIMA page visually labels the final February entry as **February 29th, 2026**, but 2026 is not a leap year. Its linked PDF filename states `Performance-26-February-2026-Time-Weighted.pdf`, and the CSV correctly uses **2026-02-26**. The canonical date used in the import is consequently 26 February 2026; the page label is preserved below for audit clarity.",
        "",
        "## Reconciled report manifest",
        "",
        "| Canonical report date | EIMA page label | CSV rows | Official PDF |",
        "| --- | --- | ---: | --- |",
    ]
    for date_value, label, url in manifest:
        lines.append(f"| {date_value} | {label} | {csv_dates.get(date_value, 0)} | [Report PDF]({url}) |")
    lines.extend(
        [
            "",
            "## References",
            "",
            f"[1] [EIMA Reports Index]({REPORTS_INDEX_URL})",
        ]
    )
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--apply-source-index", action="store_true")
    args = parser.parse_args()

    csv_dates = load_csv_dates(args.csv.resolve())
    manifest_dates = {date_value for date_value, _, _ in REPORT_MANIFEST}
    result = {
        "report_manifest_count": len(REPORT_MANIFEST),
        "csv_distinct_dates": len(csv_dates),
        "missing_manifest_dates_in_csv": sorted(manifest_dates - set(csv_dates)),
        "extra_csv_dates_not_in_manifest": sorted(set(csv_dates) - manifest_dates),
        "february_label_correction": {"page_label": "February 29th, 2026", "canonical_date": "2026-02-26"},
    }
    if args.apply_source_index:
        result["source_update"] = update_source_index()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(markdown_report(REPORT_MANIFEST, csv_dates), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
