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
