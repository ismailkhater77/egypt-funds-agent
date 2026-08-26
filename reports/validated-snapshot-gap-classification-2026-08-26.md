# Validated-Snapshot Gap Classification — 2026-08-26

## Scope and definitions

This classification distinguishes catalog metadata from live collection behavior. A blank `price_update_url` means that no URL has been recorded in the `funds` row; it does **not** prove that no first-party page exists anywhere. A “future-date rejection” requires a price and a valuation date that are both present, where the valuation date is after the controlled as-of date.

The Source-Coverage Gap report initially contained **31** funds with no validated snapshot. Subsequent verified integrations, including Banque du Caire Al Wefak, FABMISR Ezdehar, and four exact Alpha Odin products, raised validated coverage. One preserved workbook row, `Sigma Traded Fund`, was later confirmed by the FRA to be a fund-management company rather than an investable fund and was marked inactive without deletion. The current operational universe is therefore **214 active funds**, of which **190** have a validated snapshot and **24** remain uncovered as of 26-Aug-2026.

| Requested measure | Count from the original 31-gap report | Current count after all verified integrations | Evidence / interpretation |
| --- | ---: | ---: | --- |
| Has a recorded `price_update_url` but no validated snapshot | 2 | 2 | Bank ABC Fund I and Zaldi Star (Money Market) |
| Fails because the parser cannot extract an otherwise published NAV/date | 0 | 0 | Bank ABC’s official API has no usable NAV/date; Zaldi’s official page publishes a price/date and is parsed, but its date is in the future |
| Rejected only because a dated NAV is future relative to 26-Aug-2026 | 1 confirmed | 6 confirmed | Daily funds: Mawared, NI Capital 15/30, both GIG Makaseb tranches, the charitable education fund, and Zaldi Star |
| Blank `price_update_url` in the catalog | 29 | 22 within the remaining active uncovered set | This is a metadata count, **not** a claim that no official source exists |

## Linked but unvalidated records

| Fund | Recorded URL | Live diagnosis |
| --- | --- | --- |
| Bank ABC Fund I | `https://azimut.eg/funds` | The official Azimut API responded HTTP 200 and returned the `ABC` entry, but both `last_nav` and history graph were empty. No NAV/date was available to extract or validate. |
| Zaldi Star (Money Market) | `https://zaldi-capital.com/zaldi-star/` | The FRA and first-party page confirmed the corrected money-market identity. The official page published 112.88191 EGP dated 30-Aug-2026; the daily future-dated value was deliberately rejected rather than stored. |

## Date policy

The collector does **not** permit a future valuation date to become a historical `validated` NAV. For a source explicitly configured as weekly, however, an official published NAV with a future displayed date is preserved as `status=review` and `observation_state=scheduled_weekly`; it is not classified as a source failure and remains outside validated coverage until its date becomes current. A weekly source with no new price is classified as `no_new_valuation`, not as a source failure.

The only exception is tightly controlled date resolution: where a provider exposes a future scheduling date but the NAV and currency are unchanged, the collector may reuse the same source’s prior validated **actual** valuation date. If NAV changes and the only supplied date is future, the row is rejected before any database write.
