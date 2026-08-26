# Official Source Discovery Queue — 2026-08-26

> **Reference date:** 2026-08-26. This queue covers only active catalog funds without a `validated` NAV on or before that date. A named page is an identity or discovery lead, **not** permission to ingest a price unless the page itself publishes an unambiguous NAV and valuation date.

| Priority | Fund / entity card | Primary route to verify | Current gate | Next admissible outcome |
| ---: | --- | --- | --- | --- |
| 1 | Pharos Fund I | Aton Pharos official Facebook post feed | Dated official post text exists, but server-side fetch returns HTTP 400 | Enable only after a stable first-party server fetch proves the same fund/NAV/date tuple |
| 2 | Al Baraka Bank Egypt (Al Motawazen) | [Naeem Holding Al Baraka page](https://www.naeemholding.com/asset-management/investment-offerings/our-funds/al-baraka-fund/) | Exact legal identity and weekly dealing are confirmed, but no current NAV/date is published | Store a future-dated NAV as `review/scheduled_weekly` only if the official page publishes it |
| 3 | Bank ABC Fund I | [Bank ABC Egypt mutual-funds page](https://www.bank-abc.com/en/CountrySites/Egypt/AboutABC/Pages/ABC-Mutual-Funds.aspx) / Azimut data feed | Capital-growth identity is confirmed, but current NAV/date is absent | Add a source only when the bank or manager publishes a dated price |
| 4 | Blom Bank Fund I / II | Bank ABC successor funds and CFH/Cairo Capital route | Legal successor classes are confirmed; no current primary NAV | Reconcile a current bank/manager price to the exact former-BLOM identity before mapping |
| 5 | Arope Insurance Misr Fund | [AROPE Money Market Fund](https://aropeegypt.com.eg/Life/en/arope-money-market-fund/) / ABC Egypt Investments | The official page confirms a daily fund but no NAV/date and exact catalog-name bridge remains incomplete | Require ABC/AROPE current dated NAV plus exact identity bridge |
| 6 | Egyptian Gulf Bank (Tharaa) | [EGBank funds page](https://www.eg-bank.com/En/Personal) / Prime Investments | EGBank confirms sponsor, manager, and money-market identity, but no NAV/date | Require EGBank or Prime dated NAV rather than an undated Prime table |
| 7 | Aman Micro Finance | [Prime NMW product page](https://primeholdingco.com/asset-management/ph_1st_equity_fund/) and Prime funds table | Prime table identifies an Aman Money Market product but has no valuation date; the dated Faisal/CIB `Al Aman` NAV belongs to a different CI Asset Management fund | Match only after a current dated Prime/issuer disclosure resolves the catalog label |
| 8 | Prime NMOW | [Prime NMW product page](https://primeholdingco.com/asset-management/ph_1st_equity_fund/) | Exact product identity is confirmed; no current NAV/date | Capture only a dated NAV directly from Prime/Prime Investments |
| 9 | Aspire Rawajj / Waffrah Plus | [Aspire funds page](https://aspireholding.com/business/aspire-funds/) | Linked PDFs are issuance/prospectus documents, not current price statements | Find a current Aspire price notice, not an issue value |
| 10 | Momentum / Stream | [Cairo Capital Group](https://cairocapitalgroup.com/) | Manager relationship is known, but no NAV/date is publicly exposed | Find a dated Cairo Capital price file or accessible official post |
| 11 | Naeem Misr Fund | [Naeem funds page](https://www.naeemholding.com/asset-management/investment-offerings/our-funds/) | Only 2021 price material is visible | Require a current Naeem disclosure |
| 12 | Pioneers Fund I | [Pioneers Funds](http://www.pioneersfunds.com/) | Official price display is materially stale | Require a new dated first-party observation |
| 13 | Bokra Shakmagia | [Bokra](https://bokra.com/) and [official newsroom](https://bokra.com/news.html) | Public product and newsroom routes do not expose NAV/date | Require a public first-party fund-price endpoint or disclosure |
| 14 | NI Capital 15/30; GIG Makaseb I/II; Education for Life | [NI Capital prices](https://nicapital.com.eg/lines-of-business/asset-management/) | Official NAVs are present but dated 29-Aug-2026, after the reference date; products are daily | Re-run after the valuation date is current; do not use weekly exception |
| 15 | Housing & Development Bank (Mawared) | [PFI Asset Management funds](https://pfi-am.com.eg/funds/) | Official NAV is future-dated relative to reference date; term sheet establishes daily dealing | Re-run after the valuation date is current; do not use weekly exception |
| 16 | Zaldi Star (Money Market) | [Zaldi Star](https://zaldi-capital.com/zaldi-star/) | Official NAV is future-dated relative to reference date; product is daily | Re-run after the valuation date is current; do not use weekly exception |

## Exclusion rule

Secondary aggregators, stale historical reports, page-modification timestamps, fund objectives, nominal issue values, and social publication times are not valuation dates. They may guide discovery or identity work but never create a `validated` snapshot.
