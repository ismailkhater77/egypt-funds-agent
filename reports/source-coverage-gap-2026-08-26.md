# Source-Coverage Gap Report — 2026-08-26

This report is a **read-only** Supabase audit of active fund records. “No update source at all” means `price_update_url IS NULL`; it does not mean that an external source can never be found. “Linked but no validated snapshot” means a URL exists in the active fund catalog but there is no validated price dated on or before 2026-08-26.

| Category | Count |
| --- | ---: |
| Active catalog funds | 214 |
| Funds with no update-source URL at all | 39 |
| Funds linked to a URL but without a validated snapshot as of 2026-08-26 | 2 |
| Funds with no validated snapshot as of 2026-08-26 (functional coverage gap) | 24 |
| Funds with at least one validated snapshot as of 2026-08-26 | 190 |

## A. Funds with no update-source URL at all (39)

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
| Egyptian Gulf Bank (Tharaa) | Egyptian Gulf Bank (Tharaa) | — |
| FAB Misr Fund (Ezdhar) | FAB Misr Fund (Ezdhar) | — |
| GIG Insurance | GIG Insurance | — |
| GIG Insurance - Egypt Fund I | GIG Insurance - Egypt Fund I | — |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | — |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | — |
| Granite First Fund | Granite First Fund | — |
| Housing & Development Bank (Mawared) | Housing & Development Bank (Mawared) | — |
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
| PFI Cashi | PFI Cashi | — |
| Pharos Fund I | Pharos Fund I | — |
| Pioneers Fund I | Pioneers Fund I | — |
| Prime NMOW | Prime NMOW | — |
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

## C. Funds with no validated snapshot as of 2026-08-26 (24)

This is the operational priority list. It contains all active funds not yet covered by a validated NAV snapshot, whether the catalog currently has a source URL or not.

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
| Egyptian Gulf Bank (Tharaa) | Egyptian Gulf Bank (Tharaa) | null |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | null |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | null |
| Housing & Development Bank (Mawared) | Housing & Development Bank (Mawared) | null |
| Market Return | Market Return | null |
| Momentum | Momentum | null |
| Naeem Misr Fund | Naeem Misr Fund | null |
| NI Capital 15/30 | NI Capital 15/30 | null |
| Pharos Fund I | Pharos Fund I | null |
| Pioneers Fund I | Pioneers Fund I | null |
| Prime NMOW | Prime NMOW | null |
| Stream | Stream | null |
| The charitable education Fund | The charitable education Fund | null |
| Zaldi Star Equity | Zaldi Star Equity | https://zaldi-capital.com/ |
