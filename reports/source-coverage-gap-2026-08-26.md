# Source-Coverage Gap Report — 2026-08-26

This report is a **read-only** Supabase audit. “No update source at all” means `price_update_url IS NULL`; it does not mean that an external source can never be found. “Linked but no validated snapshot” means a URL exists in the fund catalog but there is no validated price dated on or before 2026-08-26.

| Category | Count |
| --- | ---: |
| Catalog funds | 215 |
| Funds with no update-source URL at all | 45 |
| Funds linked to a URL but without a validated snapshot as of 2026-08-26 | 2 |
| Funds with no validated snapshot as of 2026-08-26 (functional coverage gap) | 29 |
| Funds with at least one validated snapshot as of 2026-08-26 | 186 |

## A. Funds with no update-source URL at all (45)

| Canonical fund name | Imported/EIMA name | Source URL |
| --- | --- | --- |
| *National Bank of Kuwait (Al Mizan) | *National Bank of Kuwait (Al Mizan) | — |
| Al Ahli Bank of Kuwait - Egypt Fund I | Al Ahli Bank of Kuwait - Egypt Fund I | — |
| Al Ahli Bank of Kuwait - Egypt Fund II | Al Ahli Bank of Kuwait - Egypt Fund II | — |
| Al Baraka Bank Egypt (Al Motawazen) | Al Baraka Bank Egypt (Al Motawazen) | — |
| Aman Micro Finance | Aman Micro Finance | — |
| Arope Insurance Misr Fund | Arope Insurance Misr Fund | — |
| Aspire Rawajj | Aspire Rawajj | — |
| Aspire Waffrah Plus | Aspire Waffrah Plus | — |
| Blom Bank Fund I | Blom Bank Fund I | — |
| Blom Bank Fund II | Blom Bank Fund II | — |
| Bokra Shakmagia | Bokra Shakmagia | — |
| Delta Life Insurance | Delta Life Insurance | — |
| Ebank Fund III (Konooz) | Ebank Fund III (Konooz) | — |
| Egyptian Arab Land Bank Fund (Al Masry) | Egyptian Arab Land Bank Fund (Al Masry) | — |
| Egyptian Gulf Bank (Tharaa) | Egyptian Gulf Bank (Tharaa) | — |
| FAB Misr Fund (Ezdhar) | FAB Misr Fund (Ezdhar) | — |
| GIG Insurance | GIG Insurance | — |
| GIG Insurance - Egypt Fund I | GIG Insurance - Egypt Fund I | — |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | — |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | — |
| Granite First Fund | Granite First Fund | — |
| Housing & Development Bank (Mawared) | Housing & Development Bank (Mawared) | — |
| Maksab First Tranche USD $ | Maksab First Tranche USD $ | — |
| Maksab Second Tranche (Euro) | Maksab Second Tranche (Euro) | — |
| Market Return | Market Return | — |
| Momentum | Momentum | — |
| Naeem Misr Fund | Naeem Misr Fund | — |
| National Bank of Kuwait (Hayat) | National Bank of Kuwait (Hayat) | — |
| National Bank of Kuwait Fund (Ishraq) | National Bank of Kuwait Fund (Ishraq) | — |
| National Bank of Kuwait Fund (Namaa) | National Bank of Kuwait Fund (Namaa) | — |
| NI Capital (Sahmy Fund) | NI Capital (Sahmy Fund) | — |
| NI Capital 15/30 | NI Capital 15/30 | — |
| NI Capital EGX 70 | NI Capital EGX 70 | — |
| Odin 4 | Odin 4 | — |
| Odin Trend | Odin Trend | — |
| PFI Cashi | PFI Cashi | — |
| Pharos Fund I | Pharos Fund I | — |
| Pioneers Fund I | Pioneers Fund I | — |
| Prime NMOW | Prime NMOW | — |
| Sigma Traded Fund | Sigma Traded Fund | — |
| Siula Money Market | Siula Money Market | — |
| Stream | Stream | — |
| Target First Fund | Target First Fund | — |
| The charitable education Fund | The charitable education Fund | — |
| صندوق استثمار العربية المصرية للتأمين | Arabia Egypt Insurance Investment Fund | — |

## B. Funds linked to a source URL but with no validated snapshot as of 2026-08-26 (2)

These are **not** part of the “no source at all” count. They are included so that stale, undated, future-dated, blocked, or unmatched source situations remain visibly separate.

| Canonical fund name | Imported/EIMA name | Linked source URL |
| --- | --- | --- |
| Bank ABC Fund I | Bank ABC Fund I | https://azimut.eg/funds |
| Zaldi Star Equity | Zaldi Star Equity | https://zaldi-capital.com/ |

## C. Funds with no validated snapshot as of 2026-08-26 (29)

This is the operational priority list. It contains all funds not yet covered by a validated NAV snapshot, whether the catalog currently has a source URL or not.

| Canonical fund name | Imported/EIMA name | Linked source URL |
| --- | --- | --- |
| Al Ahli Bank of Kuwait - Egypt Fund II | Al Ahli Bank of Kuwait - Egypt Fund II | null |
| Al Baraka Bank Egypt (Al Motawazen) | Al Baraka Bank Egypt (Al Motawazen) | null |
| Aman Micro Finance | Aman Micro Finance | null |
| Arope Insurance Misr Fund | Arope Insurance Misr Fund | null |
| Aspire Rawajj | Aspire Rawajj | null |
| Aspire Waffrah Plus | Aspire Waffrah Plus | null |
| Bank ABC Fund I | Bank ABC Fund I | https://azimut.eg/funds |
| Blom Bank Fund I | Blom Bank Fund I | null |
| Blom Bank Fund II | Blom Bank Fund II | null |
| Bokra Shakmagia | Bokra Shakmagia | null |
| Egyptian Arab Land Bank Fund (Al Masry) | Egyptian Arab Land Bank Fund (Al Masry) | null |
| Egyptian Gulf Bank (Tharaa) | Egyptian Gulf Bank (Tharaa) | null |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | null |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | null |
| Housing & Development Bank (Mawared) | Housing & Development Bank (Mawared) | null |
| Maksab First Tranche USD $ | Maksab First Tranche USD $ | null |
| Maksab Second Tranche (Euro) | Maksab Second Tranche (Euro) | null |
| Market Return | Market Return | null |
| Momentum | Momentum | null |
| Naeem Misr Fund | Naeem Misr Fund | null |
| NI Capital 15/30 | NI Capital 15/30 | null |
| Odin Trend | Odin Trend | null |
| Pharos Fund I | Pharos Fund I | null |
| Pioneers Fund I | Pioneers Fund I | null |
| Prime NMOW | Prime NMOW | null |
| Sigma Traded Fund | Sigma Traded Fund | null |
| Stream | Stream | null |
| The charitable education Fund | The charitable education Fund | null |
| Zaldi Star Equity | Zaldi Star Equity | https://zaldi-capital.com/ |
