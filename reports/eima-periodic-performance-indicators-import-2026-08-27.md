# EIMA Periodic Performance and Indicator Import — 27 August 2026

## What is now linked

The uploaded file is now represented in Supabase at its original periodic-analysis grain. The historical NAV layer remains separate in `fund_prices` as review-only observations, while the report performance and macro/market context are stored in dedicated tables linked by report date.

| Layer | Table | Rows | Relationship |
|---|---|---:|---|
| Official report manifest | `eima_reports` | 31 | One row per EIMA weekly report; stores report date, report URL, report status, and reference period. |
| Fund periodic performance | `fund_performance_history` | 52,920 | One row per report, source fund label, manager, category, and return horizon. |
| Linked performance rows | `fund_performance_history` | 52,425 | Exact active-catalog identity match via `fund_id`. |
| Unlinked performance rows | `fund_performance_history` | 495 | Retained with raw identity and explicit status because they are unmatched, inactive, or require fuzzy review. |
| Macroeconomic and market indicators | `eima_report_indicators` | 569 | Stored once per report and linked to `eima_reports`, not repeated under every fund row. |
| Review-only historical NAV | `fund_prices` | 5,690 | Separate historical NAV snapshots; remain excluded from operational validated coverage. |

## Preserved performance and context fields

Each periodic fund row retains the original EIMA fund and manager labels, report date, return horizon, category, NAV, return percentage, rank, initial value, report status, source page/file metadata, reference period, currency basis, deterministic source-row key, and identity-match status. The macro and market table stores the economic values published for the corresponding report date, including interest-rate bands, inflation measures, FX buy/sell/spread figures, EGX30 close/high/low, and treasury-bill yield/volume/tenor measures where present.

> The relationship is enforced by database keys: every performance row and every indicator row has a valid `report_date` in `eima_reports`. The final audit found **zero orphan performance rows** and **zero orphan indicator rows**.

## Data-quality and idempotency controls

| Control | Result |
|---|---:|
| CSV rows processed | 52,920 |
| Report dates reconciled to official EIMA index | 31 of 31 |
| Duplicate deterministic source-row keys in CSV | 0 |
| Performance rows with NAV | 51,210 |
| Performance rows with return value | 34,100 |
| Exact active-catalog linked rows | 52,425 |
| Retained but unlinked rows | 495 |
| Second full import: performance unchanged | 52,920 |
| Second full import: reports unchanged | 31 |
| Second full import: indicators unchanged | 569 |
| Import conflicts overwritten | 0 |

The historical-performance NAV column was widened from four to eight decimal places, and the 14,538 values initially rounded by the legacy column were reconciled from the original CSV. A final identical rerun found all 52,920 performance rows unchanged and no conflicts.

## Separation from operational NAV

This import did **not** alter `fund_prices` validation policy. The EIMA historical source remains inactive; its 5,690 NAV records retain `status=review`, and **zero** EIMA records have `status=validated`. The operational coverage baseline therefore remains **191 of 213 active funds** with a validated NAV as of 26 August 2026, leaving 22 funds without validated operational coverage.

## Source and date note

All report links are stored against the official [EIMA Reports Index](https://eima.org.eg/?page_id=1886). The index’s displayed “February 29th, 2026” label is impossible in a non-leap year; its linked PDF filename and the CSV both identify **26 February 2026**, which is the canonical report date used in the database.
