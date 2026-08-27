# EIMA Historical NAV Import — 27 August 2026

## Scope and source classification

The uploaded file `eima_fund_performance_integrated(1).csv` contains historical weekly fund-performance observations dated from **31 December 2025** through **30 July 2026**. The file carries raw fund and manager labels, the report date, NAV, category, report status, and source-page/file metadata. It repeats a fund’s same NAV across return-horizon rows, so those rows were collapsed before any database operation.

EIMA describes itself as a professional association representing asset and investment managers under FRA supervision and publishes weekly performance reports for public disclosure.[1] It is neither the relevant fund manager nor the custodian bank nor the FRA itself. Therefore, the imported records are deliberately classified as **historical review observations**, not as validated NAVs. They do not improve operational coverage, replace a manager or bank source, alter the latest validated price, or participate in the scheduled-weekly exception.

## Identity and data-quality gate

| Check | Result |
|---|---:|
| Raw CSV rows inspected | 52,920 |
| Distinct raw fund labels | 208 |
| Distinct fund/manager identity pairs | 213 |
| Exact active catalog matches | 207 |
| Fuzzy matches withheld for review | 1 |
| Unmatched identity pairs withheld | 4 |
| Exact inactive identity pair withheld | 1 |
| Candidate NAV observations after horizon de-duplication | 5,744 |
| Eligible exact-active fund/date observations | 5,690 |
| Conflicting NAV groups for one fund/date | 0 |

The importer rejected 495 source rows whose fund/manager pair was not an exact active-catalog match, and 1,746 rows with a missing or invalid NAV. It did not automatically resolve spelling variants, unlisted products, inactive catalog rows, or ambiguous currency labels.

## Persisted historical records

| Persistence control | Result |
|---|---:|
| Dedicated source ID | `src_eima_historical_weekly_reports` |
| Source active flag | `false` |
| Persisted status | `review` |
| Observation state | `historical_import_eima_review` |
| Inserted on first run | 5,690 |
| Unchanged on identical second run | 5,690 |
| Existing conflicting rows overwritten | 0 |
| Currencies preserved | 5,435 EGP; 239 USD; 16 EUR |
| Historical review date range persisted | 31-Dec-2025 to 30-Jul-2026 |
| Historical records dated after 26-Aug-2026 | 0 |
| Same-source duplicate groups | 0 |

Each persisted row retains the uploaded raw fund name, raw manager label, report status, source-page/file metadata, collapsed return horizons, and currency-resolution basis in `raw_payload`. This preserves traceability while separating these records from the operational collectors.

## Impact on the operational NAV agent

The validated operational baseline is unchanged: **213 active catalog funds**, **191** funds with a validated NAV on or before **26 August 2026**, and **22** without a validated NAV. The review-only EIMA history is available for audit and later reconciliation, but a historical price can become validated only after matching it to a qualifying first-party manager, bank, or regulator source under the established policy.

## Validation completed

The post-import audit confirmed that the EIMA source exists once and is inactive, all 5,690 imported rows have `status=review`, every row has the intended observation state, no imported date is future-dated, and no source-local duplicate key exists. The project validation also passed: **53 Vitest tests**, TypeScript compilation without errors, and **6** dedicated Python import-policy tests.

## References

[1] [EIMA — Egyptian Investment Management Association](https://eima.org.eg/)
