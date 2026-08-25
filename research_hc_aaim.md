# HC and AAIM browser findings

## HC Securities & Investment
The official homepage exposes a managed-fund price list with named funds and prices. It links to `https://www.hc-si.com/Service/asset-management#funds`. The visible page text includes Suez Canal Bank Fund No. 1, Agricultural Bank of Egypt Fund No. 2 (Al Hasad Al Yaumy), QNB (Tadawol), Misr Al Mostakbal Company Investment Fund, Credit Agricole Bank Egypt Balanced Fund No. 4, FAB Misr Al Awal, and FAB Misr Etm'nan. The extracted content showed a date of 2026-08-22 for the Al Awal item. The page did not clearly expose a uniform valuation date for every row in the browser extraction.

## Arab African Investment Management (AAIM)
The official page visited was `https://aaim.com.eg/en/news-media/press-releases-and-news`. It is a news page, not a live fund-price table. It includes announcements about Kenz, Gosour, Bond$, Diamond, and other funds, but no current NAV table was exposed. A live price collector should not use this page as a price source; an official funds/prices endpoint or another authorized source is required.
