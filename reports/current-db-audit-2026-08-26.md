# Current Supabase Audit — 2026-08-26

This is a read-only audit performed after the Pharos parser and date-regression changes. It queried the server-only Supabase REST endpoint and performed no INSERT, UPDATE, or DELETE operation.

| Measure | Result |
| --- | ---: |
| Funds in `public.funds` | 215 |
| Funds with at least one validated row dated on or before 2026-08-26 | 184 |
| Validated price rows returned | 289 |
| Future-dated validated rows after 2026-08-26 | 0 |
| Same-fund/source/date duplicate groups | 0 |
| Funds whose `price_update_url` is null | 46 |

The earlier workbook coverage figure of 168/198 refers to the uploaded master-list comparison. This audit uses the current Supabase catalog (215 rows) and therefore should not be conflated with the workbook denominator. After the official Credit Agricole Al Thiqa insert, the live Supabase audit still reports 184 covered fund IDs as of 2026-08-26 because the newly inserted Al Thiqa valuation is dated 2026-08-23 and its fund was already counted as covered through the existing HC source. Validated rows increased from 288 to 289; the current database integrity controls remain clean: zero future validated rows and zero same-source duplicate groups.
