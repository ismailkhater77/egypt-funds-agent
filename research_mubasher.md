# Mubasher Asset Management source research

## Initial official-source findings

The official Mubasher Capital pages reviewed were:

- https://mubashercapital.com/asset-management/
- https://mubashercapital.com/mutual-funds

The asset-management page links to a Mutual Funds product page, but the page is a general product description and does not expose a fund list, NAV table, valuation date, downloadable price file, or visible API endpoint. It identifies Mubasher Capital as a Category 1 regulated investment firm by the Central Bank of Bahrain and lists contact details in Bahrain. This does not by itself prove that it is the Egyptian fund manager or a daily NAV source.

Search results also surfaced Mubasher Info articles with dates and investment-fund certificate prices, but Mubasher Info is a financial-news/data website and must not be treated as the asset manager's official primary source without verifying the article provenance and stability of a daily feed.

## Additional findings

Mubasher Info publishes historical articles listing fund certificate prices and dates, including Cash Mubasher and Mubasher Equity, but the inspected article is dated 21 December 2025 and describes prices as of 20 December 2025. It is not yet verified as a stable daily API or a primary asset-manager feed.

The search results also surfaced an EGX page listing fund data and a Mubasher Gold Fund row with a NAV and date. This is a potentially authoritative exchange-level source for Mubasher Gold, but the page did not render readable content in the browser and requires passive HTML/API inspection before implementation.

The current database contains three Mubasher-managed funds: Mubasher Equity, Cash Mubasher, and Mubasher Gold. None currently has a `price_update_url` or `source_id` assigned.

## EGX dynamic source finding

The EGX page is an official exchange page titled "Gold Investment Fund indicators". Its rendered table defines Fund Name, management services company, average execution price, NAV Price, and Date, and states that values are supplied by fund management services companies. The row data is loaded dynamically (the initial HTML/browser view showed "Loading Gold Prices..."), so an endpoint must be identified before using it as an automated source. The page is therefore a promising official source for Mubasher Gold, but not yet a verified daily feed for Mubasher Equity or Cash Mubasher.

## Mubasher Funds portal finding

The dedicated portal https://mubasherfunds.info/ has a current homepage dated 26 August 2026 and links daily price articles, including "أسعار وثائق صناديق الاستثمار المصرية 25 أغسطس 2026" and category-specific articles for dollar, equity, money-market/fixed-income, real-estate equity, and precious-metal funds. This is a stronger operational candidate than the Mubasher Capital marketing page, but it is still a secondary publication portal; the article structure and provenance must be verified before it is used as the automated NAV source. It may nevertheless provide a stable daily official-affiliated publication path for Mubasher Equity, Cash Mubasher, and Mubasher Gold.

## Verified Mubasher Funds article

URL: https://mubasherfunds.info/8482/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D8%A7%D9%84%D9%86%D9%82%D8%AF%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AF%D8%AE%D9%84-%D8%A7%D9%84%D8%AB%D8%A7%D8%A8%D8%AA-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026

The article is published 26 August 2026 and states that it publishes updated prices for funds traded through the Mubasher Trade application as of 25 August 2026. It contains a structured table with fund names and certificate prices. It lists "كاش مباشر" (Cash Mubasher) at 24.03852 EGP, along with other funds. This is a usable structured publication candidate for Cash Mubasher, but it is a secondary Mubasher Funds publication rather than a direct Mubasher Asset Management NAV endpoint. Provenance and daily article discovery should be handled explicitly if implemented.

## Verified Mubasher Equity article

URL: https://mubasherfunds.info/8483/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D8%A3%D8%B3%D9%87%D9%85-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026

The article was published 26 August 2026 and reports prices as of 25 August 2026. Its table lists "أسهم مباشر" (Mubasher Equity) at 2.0182 EGP. It explicitly says the prices are for funds available through the Mubasher Trade application. This provides a current structured publication candidate for Mubasher Equity, but it is a publication article rather than a direct manager API.

## Verified Mubasher Gold candidate

URL: https://mubasherfunds.info/8480/article/%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D9%88%D8%AB%D8%A7%D8%A6%D9%82-%D8%B5%D9%86%D8%A7%D8%AF%D9%8A%D9%82-%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1-%D9%81%D9%8A-%D8%A7%D9%84%D9%85%D8%B9%D8%A7%D8%AF%D9%86-%D8%A7%D9%84%D9%86%D9%81%D9%8A%D8%B3%D8%A9-25-%D8%A3%D8%BA%D8%B3%D8%B7%D8%B3-2026

The article reports precious-metal fund certificate prices as of 25 August 2026 and lists "دهب مباشر" at 13.0276 EGP. This is the likely Arabic listing corresponding to Mubasher Gold, but the English/Arabic name equivalence should be confirmed against the fund directory or an official manager identifier before writing a validated snapshot.

## Provenance assessment

Mubasher Capital's official asset-management and mutual-funds pages describe asset-management/mutual-fund services but, in the extracted public content reviewed on 26 August 2026, expose no NAV table, fund-price feed, or direct Mubasher Equity/Cash Mubasher/Mubasher Gold price endpoint. The official MubasherTrade page identifies Mubasher Trade as a trading name wholly owned by Mubasher Financial Services BSC and links Egypt access, but it does not expose public NAV data. Mubasher Funds is branded as a Mubasher investment-funds publication and publishes daily tables, but the reviewed pages do not explicitly state that it is operated by Mubasher Asset Management. Therefore, the implemented source is currently best classified as an affiliated/publication source, not a verified primary asset-manager NAV feed. The system should preserve this provenance distinction in support reporting and not describe it as a primary official manager source without stronger ownership evidence.
