#!/usr/bin/env python3
"""Import all EIMA periodic performance rows and report-level indicators.

This import deliberately does not write to fund_prices. Fund performance is stored
at report × fund × horizon grain; economic and market data is stored only once per
report-date and linked through eima_reports. All writes are idempotent by stable
source-row keys and leave conflicting existing records untouched.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

SCRIPT_DIRECTORY = str(Path(__file__).resolve().parent)
if SCRIPT_DIRECTORY not in sys.path:
    sys.path.insert(0, SCRIPT_DIRECTORY)

from reconcile_eima_report_manifest import REPORT_MANIFEST, REPORTS_INDEX_URL


SOURCE_ID = "src_eima_historical_weekly_reports"
PERFORMANCE_SOURCE = "EIMA_official_report"


def clean(value: str | None) -> str:
    return (value or "").strip()


def optional_number(value: str | None) -> float | None:
    text = clean(value)
    if not text:
        return None
    return float(text)


def optional_int(value: str | None) -> int | None:
    number = optional_number(value)
    if number is None:
        return None
    if not number.is_integer():
        raise ValueError(f"Expected whole rank, got {value}")
    return int(number)


def currency_for(row: dict[str, str]) -> tuple[str, str]:
    category = clean(row.get("category")).casefold()
    fund_name = clean(row.get("fund_name_raw")).casefold()
    if "euro" in category or " eur" in fund_name or "€" in fund_name:
        return "EUR", "explicit_euro_category_or_name"
    if "dollar" in category or "usd" in fund_name or "$" in fund_name:
        return "USD", "explicit_dollar_category_or_name"
    return "EGP", "egp_default_for_egyptian_fund_report"


def stable_key(parts: list[str]) -> str:
    return hashlib.sha256("\x1f".join(parts).encode("utf-8")).hexdigest()


def performance_source_row_key(row: dict[str, str]) -> str:
    return "eima-performance:" + stable_key(
        [
            clean(row.get("report_date")),
            clean(row.get("category")),
            clean(row.get("row_number")),
            clean(row.get("fund_name_raw")),
            clean(row.get("management_company_raw")),
            clean(row.get("horizon")),
        ]
    )


def performance_legacy_key(row: dict[str, Any]) -> tuple[str, str, str, str, str]:
    return (
        clean(row.get("report_date")),
        clean(row.get("eima_fund_name_raw") or row.get("fund_name_raw")),
        clean(row.get("management_company_raw")),
        clean(row.get("category")),
        clean(row.get("horizon")),
    )


def load_identity_map(path: Path) -> dict[tuple[str, str], tuple[str | None, str]]:
    audit = json.loads(path.read_text(encoding="utf-8"))
    mapping: dict[tuple[str, str], tuple[str | None, str]] = {}
    for entity in audit.get("entities", []):
        raw_pair = (clean(entity.get("raw_fund_name")), clean(entity.get("raw_manager_name")))
        classification = clean(entity.get("classification"))
        candidates = entity.get("candidates", [])
        if classification == "EXACT_ACTIVE" and len(candidates) == 1:
            mapping[raw_pair] = (clean(candidates[0].get("fund_id")), classification)
        else:
            mapping[raw_pair] = (None, classification)
    return mapping


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
        data = response.read().decode("utf-8")
        return json.loads(data) if data else None


def page_all(base_url: str, api_key: str, table: str, query: dict[str, str]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    offset = 0
    page_size = 1000
    while True:
        page = request_json(
            f"{base_url}/rest/v1/{table}?{urlencode({**query, 'limit': str(page_size), 'offset': str(offset)})}",
            api_key,
        )
        rows.extend(page)
        if len(page) < page_size:
            return rows
        offset += page_size


def batch(items: list[dict[str, Any]], size: int = 250):
    for index in range(0, len(items), size):
        yield items[index : index + size]


def consistent_value(rows: list[dict[str, str]], field: str) -> str | None:
    values = {clean(row.get(field)) for row in rows if clean(row.get(field))}
    if len(values) > 1:
        raise ValueError(f"Report metadata conflict for {field}: {sorted(values)}")
    return next(iter(values), None)


INDICATORS: list[tuple[str, str, str, str | None]] = [
    ("interest_deposit_rate_gt_1m_le_3m_pct", "DEPOSIT_RATE_1M_3M", "pct", "interest_source_file"),
    ("interest_deposit_rate_gt_3m_le_6m_pct", "DEPOSIT_RATE_3M_6M", "pct", "interest_source_file"),
    ("interest_deposit_rate_gt_6m_le_1y_pct", "DEPOSIT_RATE_6M_1Y", "pct", "interest_source_file"),
    ("interest_corporate_loan_rate_le_1y_pct", "CORPORATE_LOAN_RATE_LE_1Y", "pct", "interest_source_file"),
    ("inflation_headline_cpi_monthly_change_pct", "CPI_HEADLINE_MONTHLY_CHANGE", "pct", "inflation_source_file"),
    ("inflation_core_cpi_monthly_change_pct", "CPI_CORE_MONTHLY_CHANGE", "pct", "inflation_source_file"),
    ("inflation_administered_prices_monthly_change_pct", "CPI_ADMINISTERED_PRICES_MONTHLY_CHANGE", "pct", "inflation_source_file"),
    ("inflation_vegetables_fruit_monthly_change_pct", "CPI_VEGETABLES_FRUIT_MONTHLY_CHANGE", "pct", "inflation_source_file"),
    ("fx_buy_egp_per_unit", "FX_BUY_EGP_PER_UNIT", "EGP_per_currency_unit", None),
    ("fx_sell_egp_per_unit", "FX_SELL_EGP_PER_UNIT", "EGP_per_currency_unit", None),
    ("fx_spread_egp_per_unit", "FX_SPREAD_EGP_PER_UNIT", "EGP_per_currency_unit", None),
    ("egx30_close_value", "EGX30_CLOSE", "index_points", None),
    ("egx30_high_value", "EGX30_HIGH", "index_points", None),
    ("egx30_low_value", "EGX30_LOW", "index_points", None),
    ("tbill_yield_avg_pct", "TBILL_YIELD_AVG", "pct", None),
    ("tbill_yield_min_pct", "TBILL_YIELD_MIN", "pct", None),
    ("tbill_yield_max_pct", "TBILL_YIELD_MAX", "pct", None),
    ("tbill_volume_total_egp_mn", "TBILL_VOLUME_TOTAL", "EGP_mn", None),
    ("tbill_tenor_count", "TBILL_TENOR_COUNT", "count", None),
]


def prepare(csv_path: Path, identity_map: dict[tuple[str, str], tuple[str | None, str]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    source_rows: list[dict[str, str]] = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as csv_file:
        source_rows = list(csv.DictReader(csv_file))

    key_counts = Counter(performance_source_row_key(row) for row in source_rows)
    duplicate_keys = [key for key, count in key_counts.items() if count > 1]
    if duplicate_keys:
        raise ValueError(f"Duplicate source-row keys in CSV: {len(duplicate_keys)}")

    performances: list[dict[str, Any]] = []
    unmatched_classifications = Counter()
    by_report: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in source_rows:
        report_date = clean(row.get("report_date"))
        if not report_date:
            raise ValueError("Missing report_date")
        raw_pair = (clean(row.get("fund_name_raw")), clean(row.get("management_company_raw")))
        fund_id, identity_status = identity_map.get(raw_pair, (None, "UNCLASSIFIED"))
        if fund_id is None:
            unmatched_classifications[identity_status] += 1
        currency, currency_resolution = currency_for(row)
        performance = {
            "fund_id": fund_id,
            "eima_fund_name_raw": raw_pair[0],
            "report_date": report_date,
            "horizon": clean(row.get("horizon")),
            "category": clean(row.get("category")) or None,
            "management_company_raw": raw_pair[1] or None,
            "nav_value": optional_number(row.get("nav_value")),
            "return_pct": optional_number(row.get("return_pct")),
            "fund_rank": optional_int(row.get("rank")),
            "source": PERFORMANCE_SOURCE,
            "source_row_key": performance_source_row_key(row),
            "report_status": clean(row.get("report_status")) or None,
            "source_page": clean(row.get("source_page")) or None,
            "source_file": clean(row.get("source_file")) or None,
            "reference_period": clean(row.get("ref_period")) or None,
            "initial_value": optional_number(row.get("initial_value")),
            "currency": currency,
            "currency_resolution": currency_resolution,
            "identity_status": identity_status,
        }
        performances.append(performance)
        by_report[report_date].append(row)

    manifest_urls = {date_value: url for date_value, _, url in REPORT_MANIFEST}
    manifest_labels = {date_value: label for date_value, label, _ in REPORT_MANIFEST}
    reports: list[dict[str, Any]] = []
    indicators: list[dict[str, Any]] = []
    for report_date, rows in sorted(by_report.items()):
        if report_date not in manifest_urls:
            raise ValueError(f"CSV report date has no EIMA manifest URL: {report_date}")
        reports.append(
            {
                "report_date": report_date,
                "report_label": manifest_labels[report_date],
                "report_url": manifest_urls[report_date],
                "source_id": SOURCE_ID,
                "report_status": consistent_value(rows, "report_status"),
                "reference_period": consistent_value(rows, "ref_period"),
                "report_note_count": optional_int(consistent_value(rows, "report_note_count")),
                "has_report_notes": clean(consistent_value(rows, "has_report_notes")).casefold() == "true",
            }
        )
        for field, indicator_key, unit, source_field in INDICATORS:
            numeric_values = {clean(row.get(field)) for row in rows if clean(row.get(field))}
            if not numeric_values:
                continue
            if len(numeric_values) != 1:
                raise ValueError(f"Indicator conflict in {report_date} for {field}: {sorted(numeric_values)}")
            source_files = {clean(row.get(source_field)) for row in rows if source_field and clean(row.get(source_field))}
            if len(source_files) > 1:
                raise ValueError(f"Indicator source-file conflict in {report_date} for {field}: {sorted(source_files)}")
            indicators.append(
                {
                    "report_date": report_date,
                    "indicator_key": indicator_key,
                    "value": optional_number(next(iter(numeric_values))),
                    "unit": unit,
                    "reference_period": consistent_value(rows, "ref_period"),
                    "source_file": next(iter(source_files), None),
                    "source_row_key": f"eima-indicator:{report_date}:{indicator_key}",
                }
            )

    summary = {
        "csv_rows": len(source_rows),
        "performance_rows": len(performances),
        "report_rows": len(reports),
        "indicator_rows": len(indicators),
        "unlinked_performance_rows_by_identity_status": dict(unmatched_classifications),
        "performance_rows_with_nav": sum(row["nav_value"] is not None for row in performances),
        "performance_rows_with_return": sum(row["return_pct"] is not None for row in performances),
        "source_row_key_duplicate_count": len(duplicate_keys),
    }
    return performances, reports, indicators, summary


def same_performance(existing: dict[str, Any], candidate: dict[str, Any]) -> bool:
    fields = ["fund_id", "eima_fund_name_raw", "report_date", "horizon", "category", "management_company_raw", "nav_value", "return_pct", "fund_rank"]
    return all(existing.get(field) == candidate.get(field) for field in fields)


def same_legacy_identity(existing: dict[str, Any], candidate: dict[str, Any]) -> bool:
    """Match preliminary rows by their immutable report identity, not rounded values."""
    fields = ["eima_fund_name_raw", "report_date", "horizon", "category", "management_company_raw"]
    return all(existing.get(field) == candidate.get(field) for field in fields)


def apply_import(base_url: str, api_key: str, performances: list[dict[str, Any]], reports: list[dict[str, Any]], indicators: list[dict[str, Any]]) -> dict[str, Any]:
    existing_performance = page_all(
        base_url,
        api_key,
        "fund_performance_history",
        {"select": "id,fund_id,eima_fund_name_raw,report_date,horizon,category,management_company_raw,nav_value,return_pct,fund_rank,source_row_key"},
    )
    existing_by_source_key = {clean(row.get("source_row_key")): row for row in existing_performance if clean(row.get("source_row_key"))}
    existing_legacy_by_key: dict[tuple[str, str, str, str, str], list[dict[str, Any]]] = defaultdict(list)
    for row in existing_performance:
        if not clean(row.get("source_row_key")):
            existing_legacy_by_key[performance_legacy_key(row)].append(row)

    upsert_performance: list[dict[str, Any]] = []
    update_legacy: list[tuple[str, dict[str, Any]]] = []
    performance_unchanged = 0
    performance_conflicts: list[dict[str, Any]] = []
    for candidate in performances:
        old = existing_by_source_key.get(candidate["source_row_key"])
        if old:
            if same_performance(old, candidate):
                performance_unchanged += 1
            elif same_legacy_identity(old, candidate):
                # The deterministic source key and report identity are the same;
                # refresh only from the original user-provided EIMA observation.
                upsert_performance.append(candidate)
            else:
                performance_conflicts.append({"source_row_key": candidate["source_row_key"], "existing_id": old["id"]})
            continue
        legacy = existing_legacy_by_key.get(performance_legacy_key(candidate), [])
        if len(legacy) == 1 and same_legacy_identity(legacy[0], candidate):
            update_legacy.append((str(legacy[0]["id"]), candidate))
        elif len(legacy) > 1:
            performance_conflicts.append({"source_row_key": candidate["source_row_key"], "reason": "multiple_legacy_rows", "existing_ids": [row["id"] for row in legacy]})
        else:
            upsert_performance.append(candidate)

    for row_id, candidate in update_legacy:
        request_json(f"{base_url}/rest/v1/fund_performance_history?id=eq.{row_id}", api_key, method="PATCH", payload=candidate, prefer="return=minimal")
    for chunk in batch(upsert_performance):
        request_json(
            f"{base_url}/rest/v1/fund_performance_history?on_conflict=source_row_key",
            api_key,
            method="POST",
            payload=chunk,
            prefer="resolution=merge-duplicates,return=minimal",
        )

    existing_reports = {row["report_date"]: row for row in page_all(base_url, api_key, "eima_reports", {"select": "report_date,report_label,report_url,source_id,report_status,reference_period,report_note_count,has_report_notes"})}
    report_inserts = [row for row in reports if row["report_date"] not in existing_reports]
    report_conflicts = [row["report_date"] for row in reports if row["report_date"] in existing_reports and any(existing_reports[row["report_date"]].get(key) != row.get(key) for key in row)]
    for chunk in batch(report_inserts):
        request_json(f"{base_url}/rest/v1/eima_reports", api_key, method="POST", payload=chunk, prefer="return=minimal")

    existing_indicators = {clean(row["source_row_key"]): row for row in page_all(base_url, api_key, "eima_report_indicators", {"select": "id,source_row_key,report_date,indicator_key,value,unit,reference_period,source_file"})}
    indicator_inserts: list[dict[str, Any]] = []
    indicator_unchanged = 0
    indicator_conflicts: list[str] = []
    for candidate in indicators:
        old = existing_indicators.get(candidate["source_row_key"])
        if old is None:
            indicator_inserts.append(candidate)
        elif all(old.get(key) == candidate.get(key) for key in candidate):
            indicator_unchanged += 1
        else:
            indicator_conflicts.append(candidate["source_row_key"])
    for chunk in batch(indicator_inserts):
        request_json(f"{base_url}/rest/v1/eima_report_indicators", api_key, method="POST", payload=chunk, prefer="return=minimal")

    return {
        "performance_inserted_or_reconciled": len(upsert_performance),
        "performance_legacy_rows_enriched": len(update_legacy),
        "performance_unchanged": performance_unchanged,
        "performance_conflicts_not_overwritten": len(performance_conflicts),
        "performance_conflicts_sample": performance_conflicts[:25],
        "reports_inserted": len(report_inserts),
        "reports_unchanged": len(reports) - len(report_inserts) - len(report_conflicts),
        "report_conflicts_not_overwritten": report_conflicts,
        "indicators_inserted": len(indicator_inserts),
        "indicators_unchanged": indicator_unchanged,
        "indicator_conflicts_not_overwritten": len(indicator_conflicts),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, type=Path)
    parser.add_argument("--match-audit", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    performances, reports, indicators, summary = prepare(args.csv.resolve(), load_identity_map(args.match_audit.resolve()))
    result: dict[str, Any] = {"mode": "apply" if args.apply else "dry_run", "reports_index_url": REPORTS_INDEX_URL, **summary}
    if args.apply:
        base_url = os.environ.get("SUPABASE_URL")
        api_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not base_url or not api_key:
            raise SystemExit("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        result.update(apply_import(base_url, api_key, performances, reports, indicators))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
