# Batch Seven Verification — 2026-08-26

## NI Capital official page

Source: https://nicapital.com.eg/lines-of-business/asset-management/

The official NI Capital Asset Management page exposes certificate prices and dates for the requested NI-managed funds. On the captured page it showed:

| Published name | NAV | Date | Decision |
|---|---:|---|---|
| SAHMY FUND | 40.7555 EGP | 26 August 2026 | Accepted by parser and written to Supabase |
| SAHMY 70 FUND | 22.4184 EGP | 26 August 2026 | Accepted by parser and written to Supabase |
| 15/30 Fixed Income Fund | 21.78483 EGP | 29 August 2026 | Rejected as future-dated on 26 August 2026 |
| MAKASEB 1st Tranche | 20.64864 EGP | 29 August 2026 | Rejected as future-dated on 26 August 2026 |
| MAKASEB 2nd Tranche | 20.60258 EGP | 29 August 2026 | Rejected as future-dated on 26 August 2026 |
| EDUCATION FOR LIFE | 200.417 EGP | 29 August 2026 | Rejected as future-dated on 26 August 2026 |

## FAB Misr official page

Source: https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund

The official FAB Misr page showed Ezdehar Fund (NAV) = 472.6990 EGP, date = 22 August 2026. The parser and unit test accept the structure, but the server-side live fetch failed because DNS resolution for the FAB domain was unavailable from the sandbox. No snapshot was written from a browser-only capture.

## Operational result

The NI Capital live collector fetched 2 records, matched 2, and inserted 2 validated snapshots: NI Capital (Sahmy Fund) and NI Capital EGX 70. The FAB live collector failed at fetch stage and inserted 0 rows. No future-dated NI values were stored. The implementation has parsers, source IDs, aliases, Run All registration, and 18 passing collector tests.

## Latest live run

After registering both official source records and adding them to Run All, the full coverage refresh reports **162/198** workbook funds with validated prices, up from 160. The two additional validated records are NI Capital Sahmy and NI Capital Sahmy 70. The full test suite passes: 20 tests, plus TypeScript with no errors. FAB Misr remains operationally pending because server-side DNS cannot resolve the official domain, although the official page was verified in the browser with NAV 472.6990 EGP dated 22 August 2026.

A second NI Capital run fetched and matched the same two records with **0 inserted, 2 unchanged, and 0 unmatched**, confirming source-level idempotency.

## Weekly pricing policy for FABMISR Ezdehar

Ezdehar is now configured with `schedule: "weekly"`. An HTTP-successful page that yields no current valuation is classified as `status: "success"` and `outcome: "no_new_valuation"`; it is not treated as a parser/source failure. Actual transport errors remain `status: "failed"` and `outcome: "error"`. The current sandbox run still encountered a real DNS fetch error for FABMISR, so it correctly remained an error rather than being mislabeled as a weekly no-update. Coverage remains 162/198 because no new FAB snapshot was written.

## User-provided manager links — Azimut and Alpha Odin

The official Azimut API returned 19 records on the first successful matching run. After adding the future-date guard, 14 records remained valid as of 2026-08-26; five rows dated 2026-08-30 are now rejected by the parser. The official `az– استحقاق T27 USD` row is valid at NAV 10.50287 USD dated 2026-08-25 and matched the existing catalog record unchanged. The API response did not contain names for Ebank El Khabeer, Bank ABC Fund I, Ebank Fund II, or Menthum, so those remain pending rather than being inferred from the manager label.

The official Alpha Odin page loaded successfully but exposed no current fund NAV/date rows in the live DOM, so Odin Trend, Maksab, and Al Masry remain pending. The coverage report now explicitly uses `as_of_date=2026-08-26` and excludes future-dated validated rows.

## EBank official Market Updates — 26 August 2026

The first-party EBank Market Updates page returned three current fund records: El Khabeer NAV 677.3 with closing date 20 August 2026, Money Market Fund NAV 949.6679 as at 26 August 2026, and Konooz Fund NAV 873.2525 with closing date 25 August 2026. All three matched exact catalog records and were inserted into Supabase by `ebank_official_market_updates_v1`; no unmatched or failed records were reported. The source is official EBank, while El Khabeer remains a weekly-priced fund and is not expected to publish a new value every day.

The EBank collector was rerun twice after the initial insertion. Both reruns fetched and matched 3 records and returned `inserted: 0`, `unchanged: 3`, `updated: 0`, `unmatched: []`, and `failed: []`. This proves idempotent persistence for the three official EBank fund snapshots; the raw run outputs were saved under `/tmp/ebank-run-second.json` and `/tmp/ebank-run-third.json` during validation.

## Run All after EBank integration

The post-EBank Run All completed with the coverage report as of 2026-08-26 showing 165 of 198 workbook funds with validated prices, 33 not covered, and zero unmatched or ambiguous workbook rows. The database contains 215 fund records and 313 price rows. The classified duplicate audit still reports zero same-source duplicate groups, 22 legitimate multi-source fund/date groups, and one NAV conflict requiring identity review for Delta Life Insurance.

## PFI official funds page — current validation

The current official PFI page showed GIG Equity Fund NAV 1,387.99 dated 26 August 2026. The live collector fetched and matched one record and returned `inserted: 0`, `unchanged: 1`, with no unmatched or failed records. Mawared Money Market, GIG Money Market, and PFI Cashi displayed 29 August 2026 values and were correctly rejected as future-dated as of 26 August 2026.

## Azimut Target Maturity T27 mapping correction

The official Azimut row `az– استحقاق T27 USD` was initially present in parser output but did not map to the workbook record because its exact alias was missing. The alias `az–استحقاق t27 usd` → `Azimut Target Maturity Fund-Target 2027 USD` was added. The next live run fetched 14 non-future records, matched all 14, inserted 1 new validated snapshot, and returned 13 unchanged with no unmatched or failed records. The T27 snapshot is now linked to the correct workbook fund_id.

The coverage refresh after the T27 correction reports **166/198** validated workbook funds and 32 remaining, with all 198 workbook rows matched exactly and zero unmatched or ambiguous rows. The database contains 314 price rows. The duplicate audit remains unchanged: zero same-source duplicate groups, 22 multi-source groups, and one documented Delta NAV conflict.

## Bank ABC and Pioneers official-source review

The official Bank ABC Egypt mutual-funds page was inspected and confirmed the fund offering but did not expose a current NAV and valuation date for ABC Fund I. The official Pioneers Funds page exposed Al-Raeed at 90.33 dated 2011-05-26, which is materially stale. Both records remain Pending Verification; no secondary tracker value was substituted.
