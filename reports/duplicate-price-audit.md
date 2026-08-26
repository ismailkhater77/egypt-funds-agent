
# Duplicate price audit — 26 August 2026

The catalog has no duplicate canonical or normalized fund-name groups. The initial 22 duplicate fund/date groups are all multi-source groups, not same-source duplicates. After grouping by `(fund_id, valuation_date, source_id, parser_name)`, the same-source duplicate count is zero.

There is one NAV conflict requiring explicit review: `Delta Life Insurance` (`fund_catalog_2a497fc7469ee7ea`) on 2026-08-25 appears as NAV 204.35979 in the general Mubasher article and NAV 188.46222 in the cash/fixed-income Mubasher article. The latter article explicitly lists `الدلتا لتأمينات الحياة النقدى` at 188.46222, while the former mapping is likely a distinct Delta Life equity/fund identity that was over-normalized into the same catalog record. No row was deleted automatically. The conflict remains flagged for identity/source-mapping correction.
