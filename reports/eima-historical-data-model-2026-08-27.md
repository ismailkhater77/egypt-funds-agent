# EIMA Historical Reporting Data Model — 27 August 2026

The uploaded CSV combines **three different analytical layers**. They must not be forced into `fund_prices`, because only one of them is an NAV observation. The model below preserves the report-level relationship through the shared `report_date`.

| Layer | Destination | Grain | Purpose |
|---|---|---|---|
| Historical NAV | `fund_prices` | Fund × valuation date × source | Review-only NAV traceability; already imported under the inactive EIMA source. |
| Periodic fund performance | `fund_performance_history` | Report date × fund × return horizon | Preserves NAV, return, rank, category, manager, and initial value for each EIMA performance row. |
| Report and economic context | `eima_reports`, `eima_report_indicators` | Report date; Report date × indicator | Preserves each official report link and its macro/market values once per report, rather than duplicating them for every fund/horizon row. |

## Relational link

`fund_performance_history.report_date` and `eima_report_indicators.report_date` both connect to `eima_reports.report_date`. A query can therefore retrieve a fund’s periodic return and the corresponding interest, inflation, FX, EGX30, and treasury-bill conditions for the same report date without copying macro values to every fund row.

## Idempotency and source policy

Every imported performance row receives a deterministic source-row key based on the EIMA report date, raw fund/manager label, horizon, category, and source page. Every macro observation receives a deterministic report-date/indicator key. The database enforces uniqueness for these keys. Existing rows are updated only when they are demonstrably the same source observation; conflicting existing data remains unchanged and is reported for review.

EIMA remains an inactive, review-only historical source for NAV. Importing its periodic performance or macroeconomic context does not create `validated` NAVs and does not alter the operational coverage count.
