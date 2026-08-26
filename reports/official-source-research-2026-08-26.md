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
