# Current Supabase Audit — 2026-08-26

This is a read-only audit performed after the Pharos parser and date-regression changes. It queried the server-only Supabase REST endpoint and performed no INSERT, UPDATE, or DELETE operation.

| Measure | Result |
| --- | ---: |
| Funds in `public.funds` | 215 |
| Funds with at least one validated row dated on or before 2026-08-26 | 184 |
| Validated price rows returned | 288 |
| Future-dated validated rows after 2026-08-26 | 0 |
| Same-fund/source/date duplicate groups | 0 |
| Funds whose `price_update_url` is null | 46 |

The earlier workbook coverage figure of 168/198 refers to the uploaded master-list comparison. This audit uses the current Supabase catalog (215 rows) and therefore should not be conflated with the workbook denominator. The current database integrity controls remain clean: zero future validated rows and zero same-source duplicate groups.
