# Validated-Snapshot Gap Classification — 2026-08-26

## Scope and definitions

This classification distinguishes catalog metadata from live collection behavior. A blank `price_update_url` means that no URL has been recorded in the `funds` row; it does **not** prove that no first-party page exists anywhere. A “future-date rejection” requires a price and a valuation date that are both present, where the valuation date is after the controlled as-of date.

The Source-Coverage Gap report initially contained **31** funds with no validated snapshot. The official Banque du Caire Al Wefak feed subsequently inserted a valid 26-Aug-2026 snapshot, and the official FABMISR Ezdehar feed inserted a valid 22-Aug-2026 snapshot. The live gap is therefore **29**.

| Requested measure | Count from the original 31-gap report | Current count after Al Wefak integration | Evidence / interpretation |
| --- | ---: | ---: | --- |
| Has a recorded `price_update_url` but no validated snapshot | 2 | 2 | Bank ABC Fund I and Zaldi Star Equity |
| Fails because the parser cannot extract an otherwise published NAV/date | 0 | 0 | The two linked pages responded successfully, but did not expose a usable current NAV/date for their target records; this is absence of publishable data or an incomplete target page, not a parser failure |
| Rejected only because a dated NAV is future relative to 26-Aug-2026 | 1 confirmed | 1 confirmed | Housing & Development Bank (Mawared): PFI officially displayed 71.4934 dated 29-Aug-2026, so it was intentionally not stored |
| Blank `price_update_url` in the catalog | 29 | 27 within the remaining uncovered set | This is a metadata count, **not** a claim that no official source exists |

## Linked but unvalidated records

| Fund | Recorded URL | Live diagnosis |
| --- | --- | --- |
| Bank ABC Fund I | `https://azimut.eg/funds` | The official Azimut API responded HTTP 200 and returned the `ABC` entry, but both `last_nav` and history graph were empty. No NAV/date was available to extract or validate. |
| Zaldi Star Equity | `https://zaldi-capital.com/` | The official site root responded HTTP 200, but the HTML contained neither `Zaldi Star Equity` nor an `NAV/UNIT` field. The stored URL is a generic root page rather than a verified current detail page for the target fund. |

## Date policy

The collector does **not** permit a future valuation date to become a historical `validated` NAV. For a source explicitly configured as weekly, however, an official published NAV with a future displayed date is preserved as `status=review` and `observation_state=scheduled_weekly`; it is not classified as a source failure and remains outside validated coverage until its date becomes current. A weekly source with no new price is classified as `no_new_valuation`, not as a source failure.

The only exception is tightly controlled date resolution: where a provider exposes a future scheduling date but the NAV and currency are unchanged, the collector may reuse the same source’s prior validated **actual** valuation date. If NAV changes and the only supplied date is future, the row is rejected before any database write.
