# Source-Coverage Gap Report — 2026-08-27

This report is a **read-only** Supabase audit of active fund records. “No update source at all” means `price_update_url IS NULL`; it does not mean that an external source can never be found. “Linked but no validated snapshot” means a URL exists in the active fund catalog but there is no validated price dated on or before 2026-08-27.

| Category | Count |
| --- | ---: |
| Active catalog funds | 213 |
| Funds with no update-source URL at all | 23 |
| Funds linked to a URL but without a validated snapshot as of 2026-08-27 | 1 |
| Funds with no validated snapshot as of 2026-08-27 (functional coverage gap) | 7 |
| Funds with at least one validated snapshot as of 2026-08-27 | 206 |

## A. Funds with no update-source URL at all (23)

| Canonical fund name | Imported/EIMA name | Source URL |
| --- | --- | --- |
| *National Bank of Kuwait (Al Mizan) | *National Bank of Kuwait (Al Mizan) | — |
| Al Ahli Bank of Kuwait - Egypt Fund I | Al Ahli Bank of Kuwait - Egypt Fund I | — |
| Aman Micro Finance | Aman Micro Finance | — |
| Blom Bank Fund I | Blom Bank Fund I | — |
| Blom Bank Fund II | Blom Bank Fund II | — |
| Delta Life Insurance | Delta Life Insurance | — |
| Ebank Fund III (Konooz) | Ebank Fund III (Konooz) | — |
| FAB Misr Fund (Ezdhar) | FAB Misr Fund (Ezdhar) | — |
| GIG Insurance | GIG Insurance | — |
| GIG Insurance - Egypt Fund I | GIG Insurance - Egypt Fund I | — |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | — |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | — |
| Granite First Fund | Granite First Fund | — |
| National Bank of Kuwait (Hayat) | National Bank of Kuwait (Hayat) | — |
| National Bank of Kuwait Fund (Ishraq) | National Bank of Kuwait Fund (Ishraq) | — |
| National Bank of Kuwait Fund (Namaa) | National Bank of Kuwait Fund (Namaa) | — |
| NI Capital (Sahmy Fund) | NI Capital (Sahmy Fund) | — |
| NI Capital EGX 70 | NI Capital EGX 70 | — |
| Odin 4 | Odin 4 | — |
| PFI Cashi | PFI Cashi | — |
| Target First Fund | Target First Fund | — |
| The charitable education Fund | The charitable education Fund | — |
| صندوق استثمار العربية المصرية للتأمين | Arabia Egypt Insurance Investment Fund | — |

## B. Funds linked to a source URL but with no validated snapshot as of 2026-08-27 (1)

These are **not** part of the “no source at all” count. They are included so that stale, undated, future-dated, blocked, or unmatched source situations remain visibly separate.

| Canonical fund name | Imported/EIMA name | Linked source URL |
| --- | --- | --- |
| Bank ABC Fund I | Bank ABC Fund I | https://azimut.eg/funds |

## C. Funds with no validated snapshot as of 2026-08-27 (7)

This is the operational priority list. It contains all active funds not yet covered by a validated NAV snapshot, whether the catalog currently has a source URL or not.

| Canonical fund name | Imported/EIMA name | Linked source URL |
| --- | --- | --- |
| Aman Micro Finance | Aman Micro Finance | null |
| Bank ABC Fund I | Bank ABC Fund I | https://azimut.eg/funds |
| Blom Bank Fund I | Blom Bank Fund I | null |
| Blom Bank Fund II | Blom Bank Fund II | null |
| GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | null |
| GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | null |
| The charitable education Fund | The charitable education Fund | null |
