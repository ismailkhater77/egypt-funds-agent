# Official provider research notes

## EFG Holding
- URL: https://efgholding.com/en/our-services/mutual-funds
- The HTML table exposes IC Price and As of Date fields.

## Beltone
- Current official URL: https://www.beltoneholding.com/business-line/asset-management-1
- The Fund Sheet exposes fund name, Price (EGP), and Last Update.
- Live extraction found 30 rows; two remain intentionally unmatched: ADIB Islamic and Beltone Gems Equity Fund- USD.

## AFIM
- Listing URL: https://www.afim.com.eg/public/index.php/investment
- The listing exposes fund cards and prices. Detail URLs such as https://www.afim.com.eg/public/index.php/get-service/713 expose Arabic date and document price fields.
- Live completeness verification: 13 mapped, 13 extracted, 0 missing.

## CI Capital
- Official URL: https://www.cicapital.com/fundprice/
- The page exposes a Fund Prices table and a Last update date.
- Automated TLS verification in the sandbox fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE. Do not disable TLS verification in production; require a valid certificate or an official alternate endpoint.

## Zaldi
- Official URLs: https://zaldi-capital.com/zaldi-star/ and https://zaldi-capital.com/zaldi-elmasry/
- Both pages expose NAV/UNIT and Date fields.
- Live test successfully handled two snapshots and a second run returned 2 unchanged.

## Azimut
- Public funds page: https://azimut.eg/funds/
- Official API discovered in the page JavaScript: https://app.azimut.eg/api/fund/list?size=100&web=true
- API records contain `name`, `currency.symbol`, and `last_nav.nav` / `last_nav.date`.
