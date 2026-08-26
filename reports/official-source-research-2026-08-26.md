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

Official URLs: https://alpha-odin.com/ and https://alpha-odin.com/funds/

The official Alpha Odin site confirms fund-management activity and lists public funds. The accessible Funds page currently exposes only the Egyptian Real Estate Fund at 19.17 EGP with `Last Update: Jul 31, 2026`; the expected Maksab USD/Euro records and their NAV/date details are not present in the extracted page content. No current dated NAV was accepted for Maksab USD, Maksab Euro, Odin Trend, or Al Masry.

## Follow-up on NI/GIG/FAB search

The latest search found an official NI Capital 15/30 fact sheet dated July 2025 and an official NI article dated November 2023, neither of which is a current valuation dated 2026-08-26. Results for GIG Makaseb came from secondary fund aggregators rather than an official GIG or manager NAV feed. Results for FAB Misr Ezdhar repeated NAV 472.699 as at 22 August 2026 through secondary/social pages; the official FAB endpoint remains inaccessible from the server because of DNS. No new validated snapshot was written.

## Mubasher Capital official-site recheck

The official Mubasher Capital homepage and its `/mutual-funds` section identify a Bahrain-regulated investment firm and describe mutual-fund services, but the accessible content contains no Egypt-specific fund NAV table and no valuation-date field. The site therefore does not qualify as a direct dated NAV source for the Egyptian Mubasher fund records. Mubasherfunds.info and Mubasher news articles remain separate publication channels and were not upgraded to primary-manager status by this inspection.

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
