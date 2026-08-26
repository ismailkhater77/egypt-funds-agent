# Uncovered-fund source discovery

## NI Capital
Official page: https://nicapital.com.eg/lines-of-business/asset-management/

The page identifies official mutual funds including Siula Money Market Fund, 15/30 Fixed Income Fund, Makaseb GIG Islamic Money Market Fund, Sahmy Equity Fund, Sahmy 70 Equity Fund, and Education for Life Fund. It provides prospectus and fact-sheet links, but the extracted page does not expose a live daily NAV table. This is a verified ownership/source page, not yet a daily price endpoint.

## National Bank of Kuwait Egypt
Official page: https://www.nbk.com/egypt/financial-markets/investment/mutual-funds.html

The page is the official NBK Egypt mutual-funds page. The extracted content did not expose current NAV rows for Namaa, Hayat, or Ishraq; further HTML/API inspection is required before parser work. Search result discovery also surfaced the official NBE price page and EGX mutual-fund pages as possible cross-provider sources, but they require separate validation.
## NBK fund detail pages

Official Ishraq page: https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/ishraq.html

The page exposes `Ishraq Fund Unit Price`: EGP 69.92017, closing date 25/08/2026.

Official Namaa page: https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/namaa.html

The page exposes `Namaa Fund Unit Price`: EGP 82.61618, closing date 20/08/2026.

These are suitable primary official endpoints. The next step is to inspect the corresponding official Hayat/Al-Mizan pages or their exact URLs, then add a detail-page parser and source mappings for the uncovered NBK funds.
## NBK additional official fund detail pages

Official Al-Hayah page: https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/al-hayah.html

The page exposes Al-Hayah Fund Unit Price: EGP 95.38395, closing date 20/08/2026.

Official Al-Mizan page: https://www.nbk.com/egypt/financial-markets/investment/mutual-funds/mizan.html

The page exposes Al-Mizan Fund Unit Price: EGP 12.87255, closing date 20/08/2026.

NBK now has four official detail-page sources with NAV/date: Ishraq, Namaa, Al-Hayah, and Al-Mizan.
## PFI Asset Management official funds page

Official page: https://pfi-am.com.eg/funds/

DOM inspection exposes current published values:

| Fund | NAV | Published date |
|---|---:|---|
| GIG Money Market Fund | 18.9972 | 29-08-2026 |
| GIG Equity Fund | 1,387.99 | 26-08-2026 |
| Mawared Money Market Fund | 71.4934 | 29-08-2026 |
| PFI Cashi Money Market Fund | 11.6242 | 29-08-2026 |

The page is the official PFI Asset Management website and identifies all four funds. The future-dated values relative to the current system date should be treated carefully and revalidated at fetch time; the parser must accept the site-published date but never fabricate a date.
## Secondary-source caution

The Mubasher ABK page was checked at https://english.mubasher.info/countries/IQ/funds/2732/. It identifies ABK Egypt Equity Fund and Sigma as manager, but the extracted page exposes performance percentages rather than a current NAV/date table. It is therefore not sufficient for a NAV snapshot.

A Starta Markets URL tested during discovery pointed to National Bank of Egypt Mutual Fund 9, not Ebank El Khabeer. Although it displayed a NAV and date, it was rejected for this task because the fund identity did not match the uncovered catalog row. No price was inserted from either page.
## PFI live validation

The PFI parser ran against the live official page. Because the system date is 26 August 2026, the three rows dated 29 August 2026 were rejected as future-dated; the GIG Equity Fund row dated 26 August 2026 was matched and inserted successfully. A second run returned one unchanged record with no duplicate snapshot. Workbook coverage consequently improved from 49 to **48 uncovered rows** and validated coverage increased to **150/198**.
## Granite and EGX checks

Official Granite page: https://www.granite.eg/fund

The page identifies Granite EGP as a daily money-market fund managed by Granite Asset Management, but the displayed NAV is `1 EGP` dated 24 November 2025. It is too stale to use as a current validated snapshot for the uncovered Granite First Fund row; it should remain a potential source endpoint for future updates, subject to confirmation that the catalog name maps to this fund.

EGX mutual-funds page: https://www.egx.com.eg/en/MutulFunds.aspx

The page timed out in the browser during this check, so no data was extracted or stored from it.
## Delta Life discovery

Search results located the official Delta Life Egypt site but only corporate/news pages, not a current NAV feed. Secondary pages such as FoudaLens and Mubasher publish Delta Life fund values, but their primary ownership/data provenance still requires validation before any snapshot is stored. No Delta Life price was inserted during this check.

Search result references retained for follow-up: https://deltalifeegypt.com/en/news/6 and https://foudalens.com/en/fund/MUB-5808.
## EFG official page re-check

Official page: https://efgholding.com/en/our-services/mutual-funds

The current DOM exposes live tables with IC Price and As of Date. Relevant rows from the uncovered backlog include:

| Published fund | IC Price | As of Date |
|---|---:|---|
| Egyptian Gulf Bank Mutual Fund | 1,374.7 | 20/08/2026 |
| SAIB’s Third Investment Fund (El Rabeh) | 453.86963 | 25/08/2026 |
| Egyptian Agricultural Bank (Al Massy) | 76.69 | 20/08/2026 |
| KFH-Alpha-Shariaa Compliant Equity Fund | 129.29733 | 22/08/2026 |
| Al Baraka Capital Fund - Manasek | 109.03426 | 25/08/2026 |

The existing EFG parser/source should be re-run against this current page to test whether these rows are being parsed and matched; no new hardcoded values were added from the browser inspection.
## Mubasher daily category sources discovered

The 25 August 2026 article links to current category pages for real-estate, money-market/fixed-income, equity, dollar, and Islamic funds:

- https://mubasherfunds.info/8481/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026
- https://mubasherfunds.info/8482/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D9%86%D9%82%D8%AF%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AF%D8%AE%D9%84-%D8%A7%D9%84%D8%AB27282a-25-%D8%A33A333733-2026
- https://mubasherfunds.info/8483/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D0646272f4a42-%D8%A74427332a2b452731-%D06414a-%D8%A74423334745-25-%D8%A33a333733-2026
- https://mubasherfunds.info/8484/article/%D8%A3%D8%B3392731-%D06482b272642-%D8%B546272f4a42-%D8%A74427332a2b452731-%D064427442f484427314a29-25-%D8%A33a333733-2026
- https://mubasherfunds.info/8487/article/%D8%A333392731-%D06482b272642-%D8%B546272f4a42-%D8%A74427332a2b4527%D8%B1-%D8%A74425334427%D06454A29-25-%D8%A33a333733-2026

All are secondary/publication sources; manager ownership is not treated as independently verified.
## Bank ABC and Naeem checks

Bank ABC official mutual-funds page: https://www.bank-abc.com/en/CountrySites/Egypt/AboutABC/Pages/ABC-Mutual-Funds.aspx

The browser returned a blank page with no extractable table or current NAV, so no Bank ABC price was stored.

Naeem official funds page: https://www.naeemholding.com/asset-management/investment-offerings/our-funds/

The page exposes two strategy rows, but both have `Last Update` 31/03/2021 (Egypt Equity Growth Islamic NAV 163.43 and Egypt Balanced Islamic NAV 94.91). These are stale and were not inserted as current validated prices for Naeem Misr Fund.
## Menthum, Odin, and remaining-manager discovery

Search results identified official fund/manager pages for Menthum (https://www.menthum.com/) and Odin Investments (https://www.odin-investments.com/en/investment-funds/ and https://odinfundmanagement.com/our-funds/). These pages are candidates for direct NAV extraction. Search also found current-looking secondary pages for Odin Equity Fund Trend and historical Mubasher/Decypha articles, but those are not yet accepted as current primary feeds. No prices were stored from this search alone.
## Odin official page check

Official page: https://www.odin-investments.com/en/investment-funds/

The page identifies Odin's KASAB equity fund and Maksab-OZ fixed-income fund, along with real-estate funds, but the current DOM contains no NAV table, valuation date, or usable pricing endpoint. No Odin price was inserted from this page.
## Snduk secondary source check

URL: https://snduk.com/sa/fund-prices?lang=en

Snduk presents a dedicated daily Egyptian mutual-fund prices page and explicitly references Pharos First Fund and other Egyptian funds in its page navigation. However, the dynamic page returned an empty body to the controlled DOM inspection, so no NAV/date was extracted or stored. A server-side API/network inspection is required before integrating it.
## ABK-Egypt official fund-price source

Official URL: https://w.abkegypt.com/Business/Treasury/Investments/Equity-Fund

The page reports Today's ABK-Egypt Equity Fund Price as 410.52 EGP with Last Update 8/26/2026 and identifies Sigma Asset Management as fund manager. This is a primary source for the ABK Egypt Fund I catalog row. The page does not establish a separate current NAV endpoint for ABK Egypt Fund II.

## Priority-group recheck — 26 August 2026

- **BLOMINVEST Pyramids Fund:** the official page `https://www.blominvestbank.com/BlomInvest/BLOM-Pyramids-Fund` identifies a USD balanced fund and displays NAV 5,111.71, but the page's displayed date is 10 February 2016. It is not a current Egyptian BLOM Bank Fund I/II NAV feed, so no snapshot was stored.
- **EBank El Khabeer:** EBank's official homepage was unreachable during the controlled check. EIMA search results identify the fund and provide historical performance PDFs, but not a current official daily NAV endpoint. No current snapshot was stored.
- **Pharos Fund I / Pioneers Fund I:** Pharos's official site `https://www.pharosholding.com/` confirms the holding company and services but exposes no current fund NAV table in the inspected page. EGX PDFs and third-party tracking pages contain historical or secondary values, not a current primary manager feed. No snapshot was stored.
- **Data-integrity decision:** these groups remain `pending` rather than accepting stale, secondary, or identity-mismatched values. This is intentional and avoids fabricating a current valuation date.

## User-provided source batch — 26 August 2026

- NI Capital official Asset Management page: https://nicapital.com.eg/lines-of-business/asset-management/ — current certificate-price section is the primary source for Sahmy, Sahmy 70, 15/30, GIG Makaseb tranches, and Education for Life. The collector accepted Sahmy and Sahmy 70 on 26 August 2026; the other displayed rows were dated 29 August 2026 and were rejected as future-dated at that run.
- PFI official funds page: https://pfi-am.com.eg/funds/ — the server parser fetched one current matched record, GIG Equity Fund, and returned unchanged on rerun. The page showed other rows with future-dated values at the run time; no unsupported snapshot was inserted.
- Azimut official funds page: https://azimut.eg/funds — the official dynamic table yielded 19 parsed records in the collector, but the subsequent Supabase request returned HTTP 401 `JWT issued at future`, so no matching or writing decision was made from that run.
- Alpha Odin official funds page: https://alpha-odin.com/funds/ — search discovery shows Odin Trend price 1.24156 EGP with last update 20 August 2026 and additional fund cards; direct page verification is still required before accepting snapshots for Odin Trend, Maksab, or Al Masry.
- Aton/Pharos social and hosted pages remain candidate discovery sources only. Authority, ownership, current NAV, and explicit valuation date must be established before integration.

## Alpha Odin direct verification — 26 August 2026

The official page https://alpha-odin.com/funds/ loaded successfully and identifies Alpha Odin's Funds Management service, but the current DOM exposed no fund cards, NAV values, or valuation dates. Search-result snippets are not sufficient evidence for a validated snapshot. Odin Trend, Maksab tranches, and Al Masry therefore remain Pending Verification until a first-party page or fact sheet with an actual NAV and clear date is extracted.

## User-provided source verification update — 26 August 2026

- Azimut's official JSON endpoint used by the collector, `https://app.azimut.eg/api/fund/list?size=100&web=true`, returned 19 records and all 19 matched existing catalog records on the retry. The published target-maturity USD record was `az– استحقاق T27 USD`, NAV 10.50287 USD, valuation date 2026-08-25. This corresponds to the catalog's `AZ - Estehkak T27 USD`; the run was 19 unchanged. The endpoint did not publish names matching Ebank El Khabeer, Bank ABC Fund I, Ebank Fund II, or Menthum in the returned 19 records.
- The official Alpha Odin page `https://alpha-odin.com/funds/` loaded, but its current page/DOM contained no fund cards, NAV values, or valuation dates. No Odin Trend, Maksab, or Al Masry snapshot was accepted.
- The official PFI page remains usable for GIG Equity; the currently returned Mawared row was future-dated in the latest run and was not accepted under the collector's date rule.
