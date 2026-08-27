# Scheduled Weekly NAV Audit — 2026-08-26

This read-only audit verifies the separation between scheduled weekly observations and validated coverage.

| Measure | Count |
| --- | ---: |
| Future-dated rows with status validated | 0 |
| Rows marked review + scheduled_weekly | 0 |
| Coverage-eligible validated rows (status validated, date ≤ as-of) | 320 |

## Result

Scheduled weekly rows are queried separately from coverage eligibility. A scheduled observation may retain its official future date only under status review; it is excluded from validated coverage and from the collector's prior-validated lookup, which explicitly filters status=eq.validated.

## Scheduled observations currently persisted

| Fund ID | Source ID | NAV | Currency | Displayed valuation date |
| --- | --- | ---: | --- | --- |
| — | — | — | — | — |
