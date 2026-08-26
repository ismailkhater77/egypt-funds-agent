# Official Source Research — 2026-08-26

## Pharos Holding

Official URL: https://www.pharosholding.com/

The official Pharos Holding homepage identifies the company and provides corporate navigation, but the extracted page contains no fund-price table, NAV value, or valuation date for Pharos Fund I. The fund therefore remains Pending Verification under the project's strict rule.

## Blom

Official URL inspected: https://www.blombank.com/english/products-and-services/investment-services

The page identifies investment services and links to BLOMINVEST, but it does not expose a current NAV or valuation date for Blom Egypt Fund I or II. The page was also protected by a captcha during browser access, so no current price was inferred or accepted. Both records remain Pending Verification.

## ABK-Egypt Money Market

Official URL: https://w.abkegypt.com/en/Business/Treasury/Investments/Money-Market-Fund

The official page exposes `Today's ABK-Egypt Money Market Fund Price` = 72.8897 EGP with `Last Update` = 8/26/2026. This is explicit NAV/date evidence for the ABK-Egypt Money Market Fund. It should be matched only to the corresponding catalog record if the database identity and source mapping are exact; it must not be substituted for ABK-Egypt Fund II without identity confirmation.

The catalog contains `Al Ahli Bank of Kuwait - Egypt Fund II` managed by Sigma Asset Management, but the official ABK page labels the current product only `ABK-Egypt Money Market Fund`; it does not state that this product is Fund II. Because the project forbids identity inference, the NAV 72.8897 was not written to Fund II. An EIMA performance search result naming Fund II was not used as a current NAV source because it is not a current official bank price page for 2026-08-26.

## Naeem Misr Fund

Official URL: https://www.naeemholding.com/asset-management/investment-offerings/our-funds/

Naeem's official funds page identifies NAEEM MISR FUND and shows NAV values of 163.43 and 94.91 with `Last Update` = 31/3/2021. The linked detail URL currently returns Page not found. Because the official evidence is materially stale and no current valuation date is available, Naeem Misr Fund remains Pending Verification.

## Aspire Funds

Official URL: https://aspireholding.com/business/aspire-funds/

The official Aspire Funds page links to first-party PDFs for Rawajj and Waffrah Plus. The PDFs describe the funds and valuation/publication policy, but text extraction did not expose a current NAV with a usable valuation date. Therefore Aspire Waffrah Plus and Aspire Rawajj remain Pending Verification; third-party values were not substituted.

## Prime Nمو

Official URL: https://primeholdingco.com/asset-management/ph_1st_equity_fund/

Prime's official page identifies the first Prime equity issue (Prime Nمو) and explains daily purchase/redemption and NAV calculation, but it does not publish a current NAV value or explicit valuation date. The record `Prime NMOW` therefore remains Pending Verification; no third-party price was accepted.

## Arope and Aman identity review

The official AROPE Life Insurance Egypt page confirms Arope Money Market Fund and states that it is managed by ABC Egypt Investments, but it publishes no NAV or valuation date. It remains Pending Verification.

The official CIB Aman page confirms Aman Fund as an Islamic equity fund sponsored by CIB and Faisal Bank and managed by CI Capital Asset Management. It provides a fact-sheet link and product details but no current NAV or explicit valuation date in the page content. This identity does not prove the separate workbook record `Aman Micro Finance`, so no value was mapped or stored.

## CIB Aman official fact sheet

Official source: https://www.cibeg.com/-/media/project/downloads/personal/funds/most-recent-fact-sheets/aman-fund-fact-sheet.pdf

The first-party CIB/CI Capital fact sheet states `Aman Fund`, managed by CI Capital Asset Management, with official NAV per share **503.476 EGP** and date **31/07/2026**. This is valid official dated NAV evidence for CIB/Faisal Aman Fund, but the workbook's uncovered record is named `Aman Micro Finance`, a different identity. The value was therefore not mapped without explicit identity proof.

The database record for `Aman Micro Finance` explicitly lists `Prime Investments` as management company, while the official CIB Aman fact sheet lists CI Capital Asset Management. This confirms an identity mismatch, so the valid CIB Aman NAV was correctly not assigned to Aman Micro Finance.

## Bokra Shakmagia

Official URL: https://bokra.com/

The official Bokra website confirms the regulated savings platform and lists `الشكمجية` among products, but the public page does not publish a fund NAV or valuation date. The current official evidence is insufficient for a validated price snapshot, so `Bokra Shakmagia` remains Pending Verification and third-party values were not used.

## PFI official page recheck

Official URL: https://pfi-am.com.eg/funds/

The current PFI page explicitly labels NAV per certificate and dates. GIG Equity Fund shows 1,387.99 dated 26-08-2026 and is already covered/unchanged. GIG Money Market shows 18.9972 dated 29-08-2026, Mawared shows 71.4934 dated 29-08-2026, and PFI Cashi shows 11.6242 dated 29-08-2026. Those future-dated values were rejected as of 2026-08-26 and were not stored.

## Al Baraka Al Motawazen

Official URL: https://www.naeemholding.com/asset-management/investment-offerings/our-funds/al-baraka-fund/

The official Naeem page identifies Al Baraka Fund as an open-ended Egyptian balanced Sharia-compliant fund, managed by AT Financial Investments, with weekly subscription/redemption through Al Baraka Bank. It publishes historical return statistics and a 2017 fact sheet link, but no current NAV or explicit current valuation date. The catalog record `Al Baraka Bank Egypt (Al Motawazen)` remains Pending Verification; no third-party NAV was used.

## NI Capital official fact-sheet recheck

Official page: https://nicapital.com.eg/lines-of-business/asset-management/

The current NI Capital page links first-party Fact Sheets for the uncovered funds. The 15/30 sheet reports IC Price 19.27594, the GIG Makaseb sheet reports 18.29768 (first tranche) and 18.22678 (second tranche), and the National Charitable Investment Fund for Education sheet reports IC price 186.3485. However, all three documents are explicitly labeled **December 2025** and do not provide a current 26-Aug-2026 valuation date. They are therefore useful official identity evidence but stale for the daily NAV objective; no snapshots were inserted and NI Capital 15/30, Makaseb tranches, and Education for Life remain Pending Verification.

## Stream / Cairo Capital

Official URL: https://cairocapitalgroup.com/

The official Cairo Capital Group website loads the firm's verticals, insights/news, and contact sections, but no current NAV or explicit valuation date for Stream is published in the accessible content. The catalog record `Stream` (CFH Asset Management) remains Pending Verification; secondary market pages were not used.

## FABMISR endpoint probe

The configured first-party URL `https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund` still fails DNS resolution from the server environment (`curl: Resolving timed out`). The parser and weekly valuation policy remain implemented, but a live snapshot cannot be claimed until the official endpoint is reachable; no value was inserted from a cached or secondary source.

## Prime official funds table — identity resolution

Official URL: https://primeholdingco.com/asset-management/

After opening the official Funds tab, Prime publishes a table that identifies `Aman Micro Finance` as the sponsor and `Aman Money Market Fund` as the fund name, with NAV **1.84978**. The same official table lists Tharaa at 45.8342 and Prime NMW at 12.8894. However, the table does not state a valuation date or an as-of timestamp. Under the strict policy, these values are not validated snapshots and were not inserted. This resolves the Aman identity mismatch for future dated-source work, while current verification remains pending.

The raw HTML of Prime's official page carries `article:modified_time=2026-08-26T06:15:43Z`, but this is the webpage modification timestamp, not a valuation/as-of date for the displayed NAVs. It cannot satisfy the NAV valuation-date requirement, so the values remain excluded from validated coverage.

## Alpha Odin official recheck

Official URLs: https://alpha-odin.com/, https://alpha-odin.com/funds/, and the public first-party card API consumed by the homepage: `https://alphaodinf.uwd.agency/funds/`.

The homepage renders fund cards dynamically from its public first-party API. Its own client script pairs `status=1` with `newprice` and the latest entry in the fund’s `dates` array. The API details established exact identities, currencies, NAVs, and explicit matching evaluation dates for four catalog records: **Odin Trend** at **1.23911 EGP** on **26-Aug-2026**; **Egyptian Arab Land Bank Fund (Al Masry)** at **471.83603 EGP** on **26-Aug-2026**; **Maksab First Tranche USD $** at **1.18012 USD** on **24-Aug-2026**; and **Maksab Second Tranche (Euro)** at **1.07862 EUR** on **24-Aug-2026**. The USD source payload uses `$`, which the collector normalizes to the ISO currency code `USD` before persistence. All four were inserted as validated snapshots from the official Alpha Odin source and the immediate second live run returned unchanged.

The source’s published names and the catalog labels are exact reviewed matches for all four records: “First Issue (USD)” maps to the catalog’s “First Tranche USD,” and “Second Edition (Euro)” maps to “Second Tranche (Euro).” The source also identifies Alpha Financial Investments as manager and the USD/Euro details describe the corresponding issue and currency. No other similarly named Alpha products were inferred or mapped.

## Follow-up on NI/GIG/FAB search

The latest search found an official NI Capital 15/30 fact sheet dated July 2025 and an official NI article dated November 2023, neither of which is a current valuation dated 2026-08-26. Results for GIG Makaseb came from secondary fund aggregators rather than an official GIG or manager NAV feed. Results for FAB Misr Ezdhar repeated NAV 472.699 as at 22 August 2026 through secondary/social pages; the official FAB endpoint remains inaccessible from the server because of DNS. No new validated snapshot was written.

## Mubasher Capital official-site recheck

The official Mubasher Capital homepage and its `/mutual-funds` section identify a Bahrain-regulated investment firm and describe mutual-fund services, but the accessible content contains no Egypt-specific fund NAV table and no valuation-date field. The site therefore does not qualify as a direct dated NAV source for the Egyptian Mubasher fund records. Mubasherfunds.info and Mubasher news articles remain separate publication channels and were not upgraded to primary-manager status by this inspection.

## BLOM Bank Egypt official-site recheck

The accessible BLOM Bank Egypt domain presents a legacy site whose footer states **Copyright © 2017**. Its official sitemap lists consumer banking, corporate banking, institutional banking, rates, exchange rates, and corporate pages, but no investment-fund, NAV, or fund-price section. This cannot support a current dated NAV for BLOM Bank Fund I or BLOM Bank Fund II. The public acquisition history also creates an identity-continuity concern, so no mapping to Bank ABC or another successor source was inferred.

## Cairo Capital / Momentum official-source recheck

The official Cairo Capital website identifies Cairo Capital as an Egyptian asset manager but exposes no Momentum product page, NAV table, or valuation-date field. The official `CairoCapitalGP` Facebook post establishes that **Momentum Fund** is associated with Cairo Capital and ranks it in EIMA weekly-equity performance, but publishes neither a NAV nor an explicit valuation date. The available first-party evidence therefore proves a manager/fund relationship but not a validated price observation; no source mapping or snapshot was added.

## Al Baraka Al Motawazen identity reconciliation — legal identity verified, no qualified current NAV

The Financial Regulatory Authority’s directly readable record confirms `صندوق استثمار بنك البركه ذو العائد الدوري التراكمي المتوازن`, English name `صندوق بنك البركة مصر ... المتوازن`, company number **669355**, license **580**, and investment-fund issuance authorization dated **03-May-2010**. Its official contact email is `mohamed.saif@naeemholding.com`. This establishes the legal fund identity and its NAEEM affiliation as the record corresponding to the catalog row `Al Baraka Bank Egypt (Al Motawazen)`.

The official Naeem Holding product page confirms an Egyptian, Sharia-compliant balanced equity fund in EGP with weekly subscription/redemption through Al Baraka Bank, but names **AT Financial Investments** as investment manager and exposes only historical performance through 2020 and a May-2017 fact sheet. It does not publish a current NAV with valuation date. EFG’s table separately publishes a 26-Aug-2026 value for a similarly named Al Baraka periodic fund, but EFG is not the fund/bank/regulator source established above. The provisional EFG link and alias were removed; no snapshot was stored.

## ABK Egypt Fund II regulator recheck

The Financial Regulatory Authority directly identifies company **669288**, licensed on **24-Mar-2009**, as `صندوق استثمار البنك الاهلي الكويتي مصر ذو التوزيع الدوري التراكمي (صندوق بيريرس مصر سابقا)` — a periodic cumulative-distribution fund formerly associated with Piraeus Egypt. This regulatory record does not publish NAV. It also distinguishes this entity from ABK’s separately named Money Market Fund, whose official bank page has a current NAV but no evidence tying it to the catalog’s `Al Ahli Bank of Kuwait - Egypt Fund II` label. The Money Market NAV remains deliberately unmapped; Fund II stays pending until a first-party source names it explicitly and publishes a dated NAV.

## Sigma Traded Fund catalog correction

The Financial Regulatory Authority’s searchable company-register API identifies `شركة صندوق سيجما لاداره الاسهم المتداوله` as a **fund company** and says it is currently **Beltone Investment Funds** (formerly Sigma). This is an asset/fund-management entity, not an investable mutual fund with a certificate NAV. The imported record `Sigma Traded Fund`, whose raw manager is `Sigma Funds Management`, was retained for audit but marked inactive rather than deleted. It is excluded from active collector matching and active-coverage denominators; no NAV source should be sought for it unless the underlying investable fund is identified from primary records.

## Zaldi Star identity correction and future-date handling

The Financial Regulatory Authority directly identifies company **669776** as `صندوق استثمار زالدي النقدي ذو العائد اليومي التراكمي والدوري (ZALDI STAR)`, licensed on **15-Apr-2025**. Zaldi Investments’ first-party product page likewise describes **Zaldi Star** as a money-market fund with daily accumulated returns, not an equity fund. The imported canonical name and category were therefore corrected to **Zaldi Star (Money Market)** / **Open End – Money Market Funds**, while the original workbook value `Zaldi Star Equity` remains preserved in `eima_name_raw`.

The official page publishes **112.88191 EGP** with date **30-Aug-2026**. Relative to the controlled as-of date **26-Aug-2026**, that date is future-dated. Since the official description is daily rather than weekly, the collector correctly rejects it from `validated` and does not create a `scheduled_weekly` review observation. The live source-only run made no NAV write.

## Bank ABC Fund I direct bank-page recheck

Bank ABC Egypt’s first-party mutual-funds page identifies its capital-growth EGP fund (`صندوق استثمار بنك المؤسسة العربية المصرفية ذو النمو الرأسمالي بالجنية المصري`) and separately identifies the daily money-market **Mazaya** fund. This confirms that the catalog’s **Bank ABC Fund I** belongs to the capital-growth product, not Mazaya. The bank page links prospectuses and historic corporate events only; it publishes no current NAV and no valuation date. The primary page therefore improves identity evidence but cannot replace the existing no-price classification or generate a snapshot.

## BLOM Bank I/II successor-record recheck

The FRA identifies two former BLOM Egypt funds now under Bank ABC Egypt: company **669306** is the current ABC Egypt cumulative money-market fund, formerly BLOM Egypt Money Market Fund (license **525**, 02-Jun-2009); company **669271** is the current ABC Egypt cumulative fund with periodic distribution, formerly BLOM Egypt cumulative fund (license **490**, 01-Dec-2008). Both records use CFH/Cairo Capital contacts and no current NAV is published in the regulator records or Bank ABC’s funds page.

The EIMA performance report dated **14-May-2026** directly resolves the ordinal classes: **Blom Bank Fund I** is an open-end equity fund, CFH Asset Management, inception **Jul-2009**, with report NAV **545.72 EGP**; **Blom Bank Fund II** is an open-end money-market fund, CFH Asset Management, inception **Sep-2009**, with report NAV **700.57 EGP**. These class/inception distinctions align respectively with the 2008 former-BLOM cumulative FRA record (**669271**) and the 2009 former-BLOM money-market record (**669306**). The catalog was enriched with this identity information only.

The EIMA figures are stale relative to the controlled 26-Aug-2026 as-of date and EIMA is not a manager/bank/regulator price publisher under the project rule. Neither NAV was persisted, and no price URL or source link was assigned. The funds remain pending current primary NAV publication.

## Market Return recheck — unresolved catalog identity

The imported record `Market Return` has `EGX 30` in its manager field, which is not a fund manager. An EIMA performance-report result suggests that “Market Return” may be the EGX30 benchmark column rather than a fund name, but the underlying report could not be retrieved as a readable file in the server environment: both direct HTTP and HTTPS downloads returned empty files. The browser preview alone is insufficient to reconstruct the row. No catalog change, source link, or NAV write was made; the record remains an explicitly unresolved identity rather than being treated as a verified fund.

## Pharos non-Facebook first-party route recheck

The official Aton Holding site identifies **Pharos Fund 1** and the **Pharos Company for the Formation and Management of Securities Portfolios and Investment Funds** as subsidiaries, which supports the manager/fund relationship. It does not provide a NAV, valuation date, historical-price document, or machine-readable price endpoint. Pharos Holding’s own current site likewise describes its historical asset-management business but has no fund-price content. Consequently, this first-party route cannot replace the currently blocked Facebook collector; no snapshot was added and Pharos remains excluded from Run All.

## Arope official fund-page recheck

The official Arope Life Insurance Egypt page identifies an **Arope Money Market Fund**, denominated in EGP and managed by **ABC Egypt Investments**, with daily accumulated return. It publishes no NAV, valuation date, or historical-price endpoint. Moreover, this product name does not by itself prove identity with the catalog row `Arope Insurance Misr Fund`. No source link, alias, or snapshot was added.

## Cairo Capital / Stream official-source recheck

An official Cairo Capital Group Facebook post confirms **Stream Fund** and describes a 23.3% annualized return, but does not provide a NAV or explicit valuation date. The logged-out post view is also gated by Facebook and does not expose a durable machine-readable fund-price feed. The manager/fund relationship is therefore documented, but there is no validated price observation and no collector mapping was added.

## NI Capital price-table recheck — future dates retained as ineligible daily observations

NI Capital’s first-party price table publishes **29-Aug-2026** alongside the following records: `15/30` at **21.78483 EGP**; `Makaseb — first issue` at **20.64864 EGP**; `Makaseb — second issue` at **20.60258 EGP**; and `Education Hayah Charitable Fund` at **200.4176 EGP**. The same official page describes 15/30 purchases as daily and Makaseb as a daily accumulated-return money-market fund; no official weekly dealing cycle was established for these observations. With the controlled as-of date of **26-Aug-2026**, the values remain future-dated and are not inserted as `validated` or as `scheduled_weekly`; the uncovered classification is therefore `FUTURE_DATE_ONLY`, not stale-source failure.

## Aspire Waffrah Plus official-document recheck

Aspire’s official funds page links a scanned, FRA-stamped PDF for **Waffrah Plus**. Its cover and opening terms identify it as the *first-issue subscription/issuance document* for Aspire Capital’s multi-issue equity fund, not a periodic NAV statement. It states a nominal issue value of **10 EGP per certificate** and says the certificate price is announced daily, but it does not disclose any actual current price/NAV or a corresponding valuation date. The nominal issuance value is not treated as NAV. Accordingly, no price was extracted or stored; the document is retained only as identity evidence while a current official price feed remains unresolved.

## Follow-up on ABC and ABK

The search located Bank ABC Egypt's official mutual-funds page and ABK's official Equity Fund page, plus an ABK July 2026 monthly report. The available search evidence does not by itself expose a current NAV with an explicit valuation date for Bank ABC Fund I or a separate ABK Fund II; secondary fund pages were not accepted. EIMA's older 2023 performance PDF is stale for the current daily objective. No new validated snapshot was written.

## Pharos official social accounts — identity check

The LinkedIn page `https://www.linkedin.com/company/pharosholding/` identifies **Pharos Holding for Financial Investments** as a Cairo-based financial-services company, links to `www.pharosholding.com`, and describes its investment/asset-management history. The Facebook page `https://www.facebook.com/PharosHoldingEG/about` identifies **Pharos Holding فاروس القابضة**, shows the Cairo address and `pharosholding.com` contact domain, and has approximately 12K followers. These checks support account identity, but the accessible profile/about views did not yet provide a Pharos Fund I NAV with an explicit valuation date. No database mapping or price write was performed.

## User-confirmed Facebook URL redirect

The user-confirmed URL `https://www.facebook.com/share/1bstbdayA7/` redirects to `https://www.facebook.com/AtonPharos`, titled **Aton Pharos Asset Management**. The page identifies itself as a financial service in 6 October City, Egypt, links to `atonholding.godaddysites.com`, provides the email `info@atonpharosam.com`, and links to a LinkedIn company page. This confirms the supplied link points to Aton Pharos Asset Management rather than the generic Pharos Holding page. The accessible post view currently exposes a recent post and photo links but no machine-readable Pharos Fund I NAV plus explicit valuation date yet; no price was written.

## Aton Pharos posts inspection

The user-confirmed URL redirects to the official-looking **Aton Pharos Asset Management** page with a current post and photo links. The public, logged-out page exposes the page identity, contact details, and recent-post timestamps such as `7h`, but the accessible text does not expose a machine-readable Pharos Fund I NAV together with an explicit valuation/as-of date. The visible post image may contain text, but it cannot be treated as verified NAV until the image is read and the fund/date/value are unambiguous. No database write was made.

The attempted image capture from the logged-out Aton page returned a Facebook icon asset rather than the fund-post artwork. It contains no NAV or valuation date and was not used as a financial fixture or database source.

The extracted Aton post-photo URL redirects to Facebook login when opened directly in the public session. Consequently, the post artwork and its caption cannot be independently read here; the page's `7h` timestamp is only a publication timestamp and is not a valuation date. The user-confirmed page is recognized as the official Aton Pharos Asset Management page, but Pharos Fund I remains unverified until a readable post or first-party document exposes NAV and an explicit valuation date.

## User-provided screenshots — Pharos Fund I daily NAV evidence

The user supplied screenshots from the confirmed official **Aton Pharos Asset Management** Facebook page. The screenshots visibly show the Arabic fund name `صندوق فاروس الأول ذو العائد التراكمي` and explicit unit prices with valuation dates:

| Valuation date | Unit price | Evidence |
|---|---:|---|
| 2026-08-26 | EGP 792.60 | Official-page post shown in user screenshot |
| 2026-08-25 | EGP 792.04 | Official-page post shown in user screenshot |
| 2026-08-24 | EGP 789.45 | Official-page post shown in user screenshot |
| 2026-08-23 | EGP 791.97 | Official-page post shown in user screenshot |
| 2026-08-20 | EGP 782.48 | Official-page post shown in user screenshot |
| 2026-08-19 | EGP 776.30 | Official-page post shown in user screenshot |

These screenshots provide strong first-party evidence for fund identity, NAV, and valuation date. The post publication labels (`7h`, `1d`, `2d`, and similar) are not used as valuation dates. Automated ingestion still requires a stable machine-readable access path or an explicitly approved authenticated connector; the screenshots themselves were not inserted as database rows.

## Pharos catalog match

The read-only Supabase catalog inspection found an exact record: `fund_id=fund_catalog_2d0080f3a14a0fb8`, `canonical_name=Pharos Fund I`, and `eima_name_raw=Pharos Fund I`. Its current `price_update_url` is null, so the Facebook evidence can be matched to the fund identity without changing the database. No NAV snapshot was inserted yet because the public browser session cannot reliably retrieve the post artwork/caption for automated daily ingestion.

## Aton LinkedIn link check

The public URL associated with the Aton Facebook page (`https://www.linkedin.com/company/75557969/`) redirects to LinkedIn's authentication wall in this session and does not expose a public company name or post content. It is therefore not used as an independent NAV source. The Facebook page identity remains supported by the user-provided screenshots and the page's own contact/site details.

## Pharos dated NAV evidence captured from first-party HTML

The fetched first-party Facebook HTML exposed the following post text from actor **Aton Pharos Asset Management**: `سعر وثيقة صندوق فاروس الأول ذو العائد التراكمي يوم الأربعاء الموافق ٢٦ أغسطس 2026` and `EGP سعر الوثيقه 792.60`. The same HTML exposed the public post URL `https://www.facebook.com/AtonPharos/posts/pfbid02fEgT91bngiHSwZQtWAkpJXwsJgjfR1QPaTF1URKBk4x946ubyzTMmN66hdLQfCdhl`. This is sufficient to validate the post's fund identity, NAV, currency, and valuation date for parser testing. However, a direct server-side fetch from the sandbox returned HTTP 400 for the page, the `/posts/` path, the direct post URL, and the mobile page. Consequently, the parser and manual endpoint are present, but Pharos is intentionally excluded from `Run All` until a stable first-party machine-readable fetch path is available.

## Pioneers Funds official-site recheck

Official URL: http://www.pioneersfunds.com/

The first-party Pioneers Funds site identifies Pioneers Funds as a subsidiary of Pioneers Holding and describes the fund issuer/manager structure. It exposes an `AL-Raeed Fund's Price` of 90.33 LE with date 2011-05-26. Because the displayed valuation is materially stale and no current NAV/as-of field was exposed, the source is not eligible for the daily 2026 objective. No current secondary value was substituted and the Pioneers record remains Pending Verification.

## BLOM official-site recheck

Official URL: https://www.blombank.com/english/products-and-services/investment-services

The official page identifies BLOM Bank and links to BLOMINVEST Bank, but the page is a Lebanon/Levant investment-services overview. It does not publish an Egypt-specific fund NAV, valuation date, or a current BLOM Egypt fund price. The CAPTCHA encountered during access was not bypassed, and no secondary value was accepted. BLOM-related uncovered records therefore remain Pending Verification.

## Credit Agricole Egypt / HC official cross-source evidence

Official URL: https://www.ca-egypt.com/en/bank-product/cae-mutual-fund-number-4-al-thiqa/

Credit Agricole Egypt's official Mutual Fund Number 4 – Al Thiqa page exposes a performance snapshot `As of closing: 23 August 2026` with `IC Price: EGP 903.73`. The same page states that the fund is professionally managed by HC Securities & Investment and that NAV execution is based on values announced at the end of Sunday or Wednesday. This is a first-party bank page with an explicit current valuation date, NAV, and manager identity. It should be used as a validated alternate official source only after confirming the catalog fund/source mapping and avoiding duplicate same-source writes.

## Credit Agricole Al Thiqa integration result

The official Credit Agricole source was added idempotently as `src_credit_agricole_thiqa`. The live collector fetched one record, matched `fund_7d36b894257db9f9` (`Crédit Agricole – Egypt Fund No.4 Balanced Fund (Al Thiqa)`), and inserted one validated snapshot: NAV 903.73 EGP, valuation date 2026-08-23. This is an independent official bank-source snapshot; the existing HC source mapping was preserved.

## Run All after Credit Agricole integration

A live Run All completed with status `partial` because unresolved/unavailable source rows remain, while the Pharos Facebook source remains intentionally excluded. The aggregate reported 422 fetched records, 170 matched records, 8 inserts, 118 unchanged records, 0 updates, 252 unmatched records, and 44 failed records. A subsequent read-only Supabase audit reported 215 catalog funds, 184 funds covered as of 2026-08-26, 297 validated rows, 0 future-dated validated rows, 0 same-source duplicate groups, and 46 funds without a `price_update_url`. The Al Thiqa source remained idempotent and did not create a duplicate on its second standalone run.

## EFG official mutual-funds table — identity boundaries

Official URL: https://efgholding.com/en/our-services/mutual-funds. The current first-party EFG table publishes `Egyptian Gulf Bank Mutual Fund` at 1,384.44 EGP as of 26-Aug-2026, and `Al Baraka Bank Islamic Fund` at 635.10 EGP as of 26-Aug-2026. It also lists a distinct `Al Baraka Bank Islamic Money Market Fund (Al Barakat)` dated 29-Aug-2026. These are usable source records only for exact catalog identities. They were not mapped to `Egyptian Gulf Bank (Tharaa)` because Tharaa is identified elsewhere as a money-market fund and the EFG record is an equity fund. They were also not mapped to `Al Baraka Bank Egypt (Al Motawazen)` without an exact manager/fund-name bridge. No price was written from these similarly named but unproven identities.

## FABMISR Ezdehar live-access recheck

Official URL: https://www.fabmisr.com.eg/en/personal-banking/investments-funds/ezdehar-fund. The public official page currently exposes Ezdehar NAV **472.6990 EGP** with an actual valuation date of **22 August 2026**, and states that subscription/redemption circulate weekly. However, the application/server runtime still cannot resolve `www.fabmisr.com.eg` (`getent` returned no address; `curl` timed out during DNS resolution), despite the page being viewable through the research browser. The server-side collector therefore remains correctly disabled from creating a live snapshot: browser-only visibility is not a stable production ingestion path. This remains a network/DNS blocker rather than a validation or weekly-pricing failure.

## FABMISR DNS fallback and weekly scheduled policy

The collector now preserves the official hostname and TLS certificate validation while using DNS-over-HTTPS only as a narrow network-resolution fallback when the runtime resolver fails for `www.fabmisr.com.eg`. A successful live run fetched the bank’s official page, matched `fund_catalog_4401d4d4b9314a90` (`FAB Misr Fund (Ezdhar)`), and inserted the actual 22-Aug-2026 NAV 472.6990 EGP. A second run returned one unchanged record.

For any source explicitly configured as `weekly`, an official NAV whose displayed valuation date is in the future is no longer discarded or treated as a source failure. It is persisted with its unmodified source date and `status=review`, with raw payload marker `observation_state=scheduled_weekly`. It remains excluded from validated coverage and the latest-validated history until its date is no longer future. This retains a verifiable published observation without allowing a scheduled date to corrupt historical `validated` NAVs.

## PFI Mawared frequency confirmation

PFI’s official **Mawared Money Market Fund Term Sheet** identifies the vehicle as an **open-ended daily money market fund** and states that subscriptions and redemptions are available **daily**. Accordingly, the future-dated Mawared NAV does not qualify for the weekly scheduled-observation policy. It remains an official source observation, but it cannot be stored as a historical validated NAV until the displayed valuation date is current. [1]

### References

[1] [PFI Asset Management — Mawared Money Market Fund Term Sheet](https://pfi-am.com.eg/wp-content/uploads/2025/02/HDBK-Mawared-Term-Sheet-EN.pdf)

## Al Baraka Al Motawazen — weekly identity confirmed, NAV absent

Naeem Holding’s official Al Baraka Fund page confirms that the fund is an open-ended Egyptian balanced Sharia-compliant fund and that subscription/redemption occur **weekly through Al Baraka Bank**. The page does not display a current NAV, valuation date, or downloadable current price file; its linked fact sheet is from 2017. The fund is therefore eligible for the `scheduled_weekly` policy only if a first-party Al Baraka/Naeem page later publishes a NAV with a future displayed date. It remains uncovered today because no current dated NAV is available. [2]

[2] [Naeem Holding — Al Baraka Fund](https://www.naeemholding.com/asset-management/investment-offerings/our-funds/al-baraka-fund/)

## Bokra Shakmagia — official platform identity, no public NAV

The official Bokra platform identifies itself as an FRA-regulated Egyptian digital savings platform and links the Shakmagia product only through its mobile application. Its public website does not publish a Shakmagia NAV, as-of date, price history, or a public fund-price endpoint. The fund remains Pending Verification; secondary published NAVs were not used. [3]

[3] [Bokra — official platform](https://bokra.com/)

## Arope Money Market Fund — identity confirmed, NAV absent

AROPE Life Insurance Egypt’s official page confirms that Arope Money Market Fund is an Egyptian EGP open-ended fund, managed by **ABC Egypt Investments**, with subscriptions/redemptions through ABC Bank Egypt. It describes a daily accumulated-return objective, but supplies neither NAV nor a valuation/as-of date. The fund is therefore not a weekly-policy candidate and remains Pending Verification until ABC Egypt Investments or AROPE publishes a current dated NAV. [4]

[4] [AROPE Life Insurance Egypt — Arope Money Market Fund](https://aropeegypt.com.eg/Life/en/arope-money-market-fund/)

## Aspire Rawajj and Waffrah Plus — current official fact-sheet route found

Aspire Holding’s official funds page directly links to PDFs for Rawajj and Waffrah Plus, both hosted on the company’s current 2026 website. These first-party files are the correct next sources to inspect for NAV and valuation-date evidence; no third-party price was accepted at this stage. [5]

[5] [Aspire Holding — Aspire Funds](https://aspireholding.com/business/aspire-funds/)

### Rawajj document check

The current Aspire-linked Rawajj PDF is a 28-page scanned legal/prospectus document. It does not yield machine-readable NAV, as-of date, or price-table text, and the public funds page itself contains only document links rather than current prices. No Rawajj NAV was persisted. The Waffrah Plus document remains a first-party candidate for separate review, but neither fund is promoted without a current dated NAV. [6]

[6] [Aspire Holding — Rawajj official PDF](https://aspireholding.com/app/uploads/2026/02/rawajj.pdf)

## Market Return — identity requires correction before source discovery

The imported record `fund_catalog_b54758ef8387b610` contains canonical and raw name “Market Return” but records `management_company_raw = EGX 30`, which is an Egyptian Exchange index rather than an asset manager. Public official EGX material describes EGX30 as an index, not as an investment fund manager or NAV publisher. No first-party NAV source can be safely mapped until the workbook identity is corrected or an authoritative fund manager is supplied. [7]

[7] [The Egyptian Exchange — EGX30 Overview](https://www.egx.com.eg/en/OverviewEGX30.aspx)

## NI Capital Siula — official source mapped, current daily future date retained as non-validated

NI Capital’s current official Funds Certificates Prices section lists **SIULA MONEY MARKET FUND** at **24.59694 EGP** with displayed date **29 August 2026**. Its official fund description states daily purchases and redemptions, so it is not eligible for the weekly scheduled-observation policy. The collector now recognizes and maps the SIULA publication name to `Siula Money Market` and the catalog record is linked to NI Capital’s official page; the future-dated daily value remains outside `validated` storage until its displayed date becomes current. [8]

[8] [NI Capital — Asset Management and Funds Certificates Prices](https://nicapital.com.eg/lines-of-business/asset-management/)

## Naeem Misr — weekly dealing confirmed, NAV absent and dedicated domain unavailable

Naeem Holding’s official page confirms that NAEEM Misr is an EGP Sharia-compliant equity fund managed by NAEEM Financial Investments, with weekly subscription/redemption through Egyptian Gulf Bank. It publishes no current NAV or valuation date. The page links to `naeemmisrfund.com`, but the linked hostname did not resolve from the research environment; no alternate current first-party NAV page was established. The fund should be eligible for `scheduled_weekly` only after a working official page publishes an observable NAV/date. [9]

[9] [Naeem Holding — NAEEM Misr Fund](https://www.naeemholding.com/asset-management/investment-offerings/our-funds/naeem-misr-fund/)

## EGBank Tharaa — official bank site inspected, no public price route found

EGBANK’s official home and Personal Banking pages expose a generic Funds category but do not expose a Tharaa product page, NAV, valuation date, or a public fund-pricing endpoint in their accessible content. The fund’s manager/sponsor identity is not sufficient to map a current price; Tharaa remains Pending Verification. [10]

[10] [EGBANK — Personal Banking](https://www.eg-bank.com/En/Personal)

## Delta Life Insurance — official fund identity and filings, no current NAV

Delta Life Assurance’s official Financial Regulatory page identifies its money-market fund and publishes prospectuses, amendments, and financial statements, including annual 2025 statements and governance notices in 2026. It does not display a current NAV/certificate price or an explicit current valuation date. Historical financial statements are not a substitute for a daily NAV feed, so Delta Life remains Pending Verification. [11]

[11] [Delta Life Assurance — Financial Regulatory / Money Market Fund](https://deltalifeegypt.com/ar/FinancialRegulatory)

## ABK Egypt Fund II — official Money Market NAV found; legal-name mapping pending

ABK Egypt’s official Money Market Fund page identifies a daily-return, daily-subscription/redemption EGP fund managed by Sigma Asset Management and publishes **72.8897 EGP** with last update **26-August-2026**. The official page calls the product “Money Market Fund” and does not explicitly state “ABK Egypt Fund II,” while the catalog record uses that legal/imported label. No snapshot was mapped until the prospectus or another official filing confirms they are the same fund. [12]

The linked official prospectus file is protected by the bank’s request filter when called directly from this environment, so it cannot yet supply the missing legal-name evidence. This is an access limitation, not a parser or NAV-validation failure.

An FRA registry result also appears relevant to a former Piraeus/ABK fund, but the full registry page is access-protected in this environment. Its search snippet alone is not sufficient evidence to map the catalog’s Fund II record to the daily Money Market Fund, so the unresolved identity decision is retained.

[12] [ABK Egypt — Money Market Fund](https://www.abkegypt.com/Business/Treasury/Investments/Money-Market-Fund)
