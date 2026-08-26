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
