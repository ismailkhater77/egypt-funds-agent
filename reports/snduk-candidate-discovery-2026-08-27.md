# Snduk Candidate Discovery — 2026-08-27

## Scope and validation boundary

The user requested that discovery be limited to these 22 active uncovered catalog funds: Al Baraka Bank Egypt (Al Motawazen), Aman Micro Finance, Arope Insurance Misr Fund, Aspire Rawajj, Aspire Waffrah Plus, Bank ABC Fund I, BLOM Bank Fund I, BLOM Bank Fund II, Bokra Shakmagia, Egyptian Gulf Bank (Tharaa), both GIG Makaseb tranches, Housing & Development Bank (Mawared), Momentum, Naeem Misr Fund, NI Capital 15/30, Pharos Fund I, Pioneers Fund I, Prime NMOW, Stream, The charitable education Fund, and Zaldi Star (Money Market).

Snduk identifies itself as an independent fund-comparison platform and states that its data is based on available sources at publication. Its public funds directory is powered by a publicly reachable `funds.list` response and exposes fund names, manager labels, a `currentPrice` field, and record-maintenance timestamps. These are useful discovery fields, but the displayed record timestamp is not by itself a valuation/as-of date, and Snduk is not the fund manager, sponsor bank, or regulator. Consequently, no Snduk value is eligible for `fund_prices.status = validated` without separate primary evidence of the exact identity, actual NAV, and explicit valuation date.

Snduk’s own public Investment Disclaimer, last updated 26-Jan-2026, says that its information is based on available sources at publication, that it cannot guarantee every item is complete, accurate, or up to date, and that users should verify information independently. The page does not identify an original data source or ingestion method for each fund price. This explicit limitation confirms that its displayed `Document Price` label cannot prove a first-party valuation route by itself.

## Initial observations

The public directory confirms that it holds records for at least Pharos Fund I, Pioneers Fund I, Al Baraka Bank Egypt balanced / Al Motawazen, Naeem Misr Fund, and the Prime-managed fund family. It also reveals nearby but non-equivalent records, including the CIB/Faisal Aman fund and a distinct EFG-managed Al Baraka periodic fund. These similarly named entries must not be substituted for the 22 in scope. Candidate records will be evaluated one fund at a time and their direct URLs, displayed NAVs, any historical-price dates, and official-source corroboration will be recorded before any write.

## First candidate batch

| Requested catalog fund | Snduk candidate | Displayed NAV / currency | Snduk record timestamp | Discovery conclusion |
|---|---|---:|---|---|
| Al Baraka Bank Egypt (Al Motawazen) | `al-baraka-bank-shariah-balanced-fund`; fund code BMT; NAEEM manager label | 311.44 EGP | 2026-07-29T14:08:23.201Z | Exact product-family and manager alignment; the detail page visibly labels its price as updated on 06-Aug-2026. It remains third-party discovery evidence pending dated NAEEM/bank/FRA corroboration. |
| Aman Micro Finance | No unambiguous matching record found under this exact identity | — | — | The visible CIB/Faisal Aman product is not the catalog fund and must not be substituted. |
| Arope Insurance Misr Fund | `arope-money-market-fund`; Arope Money Market Fund; CFH manager label | 447.56 EGP | 2026-07-29T11:19:04.742Z | Exact fund-family candidate; manager-only official page still has no dated NAV. |
| Aspire Rawajj | `rawajj-money-market-fund`; Aspire Capital | 109.4609 EGP | 2026-07-29T11:34:31.004Z | Exact candidate; pending dated Aspire primary disclosure. |
| Aspire Waffrah Plus | `waffrah-plus-fund-aspire`; Aspire Capital | 11.99 EGP | 2026-07-29T10:26:54.490Z | Exact candidate; pending dated Aspire primary disclosure. |
| Bank ABC Fund I | Only Mazaya Money Market Fund appeared under broad Bank ABC matching | 74.30 EGP | 2026-07-30T16:17:11.831Z | **Rejected identity match**: Mazaya is the separate Bank ABC money-market product and cannot replace the requested ABC equity fund. |

## Second candidate batch

| Requested catalog fund | Snduk candidate | Displayed NAV / currency | Snduk record timestamp | Discovery conclusion |
|---|---|---:|---|---|
| BLOM Bank Fund I | No candidate found | — | — | No record was returned by Arabic/English BLOM matching. No successor or other fund was inferred. |
| BLOM Bank Fund II | No candidate found | — | — | No record was returned by Arabic/English BLOM matching. No successor or other fund was inferred. |
| Bokra Shakmagia | `el-shakmagya-bokra-gold-fund`; Bokra Asset Management | 0.9556 EGP | 2026-08-11T15:13:40.750Z | Exact fund-family candidate; pending a dated Bokra primary source. |
| Egyptian Gulf Bank (Tharaa) | `tharaa-fund`; Prime Investments asset-management label | 45.811 EGP | 2026-07-29T11:17:45.359Z | Exact identity candidate; the undated Prime table remains insufficient for validation. |
| GIG Makaseb Fund First Tranche | No candidate found under tranche-specific matching | — | — | No first-tranche record was identified. |
| GIG Makaseb Fund Second Tranche | No candidate found under tranche-specific matching | — | — | No second-tranche record was identified. |
| Housing & Development Bank (Mawared) | `mawared-fund`; PFI Asset Management | 71.3532 EGP | 2026-07-29T11:16:31.565Z | Exact candidate; PFI remains the primary route, and a source-side valuation date is still required. |

Snduk does contain one broader `makaseb-fund-gig-shariah` record, labelled Makaseb Money Market Fund — GIG Egypt Takaful Shariah, with displayed price 20.5617 EGP. Its public description expressly says the fund has **two separate issuances with independent accounts** and notes a difference in the second issue’s insurance feature and costs. However, it does not label the displayed price as either the first or the second tranche. The combined record is therefore not matched to either requested Makaseb tranche and cannot be used for a price write.

## Third candidate batch

| Requested catalog fund | Snduk candidate | Displayed NAV / currency | Snduk record timestamp | Discovery conclusion |
|---|---|---:|---|---|
| Momentum | `momentum-cairo-capital-fund`; Cairo Capital Momentum Cumulative Fund; CFH label | 14.3748 EGP | 2026-07-29T10:13:03.681Z | Exact candidate; Cairo Capital official web presence still exposes no dated NAV. |
| Naeem Misr Fund | `naeem-misr-sharia-fund`; NAEEM manager label | 50.74 EGP | Listing: 2026-07-29T10:59:28.450Z; detail-page Document Price label: 26-Aug-2026 | Exact candidate. The Snduk detail page expressly labels the value as a Document Price and presents 26-Aug-2026 as Last Updated, but this remains a third-party date pending updated primary NAEEM disclosure. |
| NI Capital 15/30 | `15-30-fixed-income-fund`; NI Capital | 21.7419 EGP | 2026-07-29T12:38:22.305Z | Exact candidate; the official NI value previously observed remains future-dated relative to the current collection reference and is not promoted by Snduk. |
| Pharos Fund I | `pharos-fund-1`; Aton Pharos label | 792.04 EGP | 2026-07-29T09:57:18.873Z | Exact candidate; official social evidence exists, but the server-side Facebook transport blocker remains unresolved. |
| Pioneers Fund I | `al-raeed-fund-Pioneers`; AIM for Financial Investments label | 292.94 EGP | 2026-07-29T09:59:16.139Z | Exact candidate; pending a dated first-party disclosure. |

## Final candidate batch

| Requested catalog fund | Snduk candidate | Displayed NAV / currency | Snduk record timestamp | Discovery conclusion |
|---|---|---:|---|---|
| Prime NMOW | `prime-nmw-fund`; Prime Investments asset-management label | 12.9026 EGP | 2026-07-29T14:35:47.110Z | Exact candidate; Prime’s public manager table carries an NAV but no valuation date. |
| Stream | `stream-fixed-income-fund`; Cairo Capital / CFH label | 1.2397 EGP | 2026-07-29T12:41:33.217Z | Exact candidate; pending a dated Cairo Capital, sponsor-bank, or FRA disclosure. |
| The charitable education Fund | No candidate found | — | — | No exact educational-charitable fund record was returned. No NI fund was inferred from a similar name. |
| Zaldi Star (Money Market) | `zaldi-star-fund`; Zaldi Capital label | 112.6561 EGP | 2026-07-29T11:32:14.109Z | Exact candidate; current primary-page issue remains the absence of an actual valuation date distinct from its prospective daily update date. |

## Inventory result

Snduk returned exact or strong exact-identity candidates for **15** of the 22 requested catalog funds: Al Motawazen, Arope, Aspire Rawajj, Aspire Waffrah Plus, Bokra Shakmagia, Tharaa, Mawared, Momentum, Naeem Misr, NI Capital 15/30, Pharos Fund I, Pioneers Fund I, Prime NMOW, Stream, and Zaldi Star. It returned **no exact candidate** for Aman Micro Finance, Bank ABC Fund I, BLOM Bank Fund I, BLOM Bank Fund II, either GIG Makaseb tranche, or The charitable education Fund. The separately returned Bank ABC Mazaya record was rejected as an identity mismatch.

## Primary-source cross-check in progress

The official Aton Pharos Asset Management Facebook page confirmed by the user was accessible in a public browser view. Its latest visible post names `صندوق استثمار فاروس الأول` and publishes `سعر الوثيقة 792.60` with `26 أغسطس 2026`. This is direct manager-channel NAV/date evidence for the exact Pharos identity and is directionally consistent with Snduk’s 792.04 display, which has a separate and older Snduk record timestamp. The two values must not be conflated: the primary value is 792.60 EGP on 26-Aug-2026; the Snduk value remains discovery/comparison data only. No new write was made because the collector's server-side Facebook request still returns HTTP 400 and must be made stable before the source can join the automated run.

## Snduk detail-page price labels

The following values were displayed by Snduk under its `Document Price — Last Updated` label during this inventory. They are recorded for comparison with primary disclosures only. The date label is still not an official manager/bank/regulator valuation date.

| Fund | Snduk Document Price | Snduk Last Updated |
|---|---:|---|
| Arope | 447.56 EGP | 01-Aug-2026 |
| Aspire Rawajj | 109.4609 EGP | 16-Aug-2026 |
| Aspire Waffrah Plus | 11.99 EGP | 26-Aug-2026 |
| Bokra Shakmagia | 0.9556 EGP | 25-Aug-2026 |
| Tharaa | 45.811 EGP | 24-Aug-2026 |
| Mawared | 71.3532 EGP | 25-Aug-2026 |
| Momentum | 14.3748 EGP | 26-Aug-2026 |
| Naeem Misr | 50.74 EGP | 26-Aug-2026 |
| NI Capital 15/30 | 21.7419 EGP | 25-Aug-2026 |
| Pharos Fund I | 792.04 EGP | 25-Aug-2026 |
| Pioneers Fund I | 292.94 EGP | 06-Aug-2026 |
| Prime NMOW | 12.9026 EGP | 24-Aug-2026 |
| Stream | 1.2397 EGP | 26-Aug-2026 |
| Zaldi Star | 112.6561 EGP | 26-Aug-2026 |

The same batched extraction encountered unparseable markup around the date labels for Al Motawazen and Zaldi Star after returning a valid price; their dates are therefore not recorded from that extraction. Both require the same primary-source corroboration as every other candidate.

## Decision matrix after primary-source review

| Fund or group | Result of primary-source review | Snduk value treatment | Automated-status decision |
|---|---|---|---|
| Al Motawazen | NAEEM/FRA confirms identity; current NAEEM page has no current dated NAV | Comparison only | Pending |
| Arope, Momentum, Stream | Cairo Capital/CFH presence proves manager relationship but has no public dated NAV | Comparison only | Pending |
| Aspire Rawajj, Aspire Waffrah Plus | Primary PDFs describe products but contain no current dated NAV | Comparison only | Pending |
| Bokra Shakmagia | Bokra primary site identifies product but has no dated NAV | Comparison only | Pending |
| Tharaa, Prime NMOW, Aman Micro Finance | Prime table proves fund identities and displays values but lacks valuation dates; Aman has no Snduk exact record | Comparison only | Pending |
| Mawared | PFI primary page is dated but its current 71.4934 EGP / 29-Aug-2026 observation is future-dated on 27-Aug-2026 and the source is not a proven weekly channel | Snduk’s 71.3532 / 25-Aug-2026 is not substituted | Pending |
| Naeem Misr | NAEEM primary detail page proves identity and weekly dealing but has no current NAV/date; a LinkedIn lead is sign-in-blocked | Comparison only | Pending |
| NI Capital 15/30 and Education | Official NI product/fact-sheet route proves identity but not a readable current dated NAV; LinkedIn price-post lead is access-blocked; Education has no Snduk exact record | Comparison only where available | Pending |
| GIG Makaseb tranches | Official manager and Snduk description confirm two separate issues, but neither assigns a current value to an individual tranche | Combined Snduk record rejected for allocation | Pending |
| Bank ABC Fund I | Primary Bank ABC/Azimut route proves capital-growth identity but presents no current NAV/date; Snduk Mazaya hit is a separate product | Rejected identity mismatch | Pending |
| BLOM I and II | No Snduk record; bank route has no current dated NAV | No candidate | Pending |
| Pioneers Fund I | Snduk has a matching candidate; primary route has no current dated NAV | Comparison only | Pending |
| Pharos Fund I | Direct manager Facebook post publicly displays 792.60 EGP on 26-Aug-2026; server-side Facebook fetch remains HTTP 400 | Snduk’s 792.04 EGP / 25-Aug-2026 remains comparison only | Primary source qualified, automation blocked |
| Zaldi Star | Primary page is an exact daily-product source but exposes 112.88191 EGP dated 30-Aug-2026, future-dated on 27-Aug-2026 | Snduk’s different 112.6561 EGP / 26-Aug-2026 is not substituted | Pending |

**Conclusion:** no Snduk value was added to `fund_prices`, no Snduk source was made active, and the operational validated coverage remains unchanged by this pass. The only independently qualified primary observation identified is Pharos, which awaits a stable server-side retrieval path before it can be automated.

## Live database audit after this pass

The live read-only audit at 27-Aug-2026 confirms **213 active** catalog funds, **191** with at least one `validated` NAV dated on or before the database current date, and **22** active funds still uncovered. It also confirms **0** future-dated `validated` rows and **0** duplicate groups under the `(fund_id, source_id, valuation_date, status)` key.

`fund_prices` contains **6,036** rows in total: **5,690** EIMA historical rows classified as `review` from `src_eima_historical_weekly_reports`, and **346** non-EIMA operational/audit rows. Of the total, **305** rows are `validated`; this row count is deliberately distinct from the **191/213** active-fund coverage metric because a covered fund can have multiple validated snapshots.

## Source

- [Snduk Egypt public funds directory](https://snduk.com/eg/funds?lang=en)
- [Snduk Investment Disclaimer](https://snduk.com/eg/disclaimer?lang=en)
