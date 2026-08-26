# AAIM official source verification

Checked on 2026-08-26: https://aaim.com.eg/en/what-we-offer/funds

The official AAIM Funds page exposes 19 fund cards with fund name, category, price, currency, and last-update date in the rendered page. The observed cards were: Shield (842.26 EGP, 22 Aug 2026), Juman (795.1005 EGP, 24 Aug 2026), Iskan (19.73626 EGP, 24 Aug 2026), Diamond (213.94846 EGP, 24 Aug 2026), Gozoor (55.95519 EGP, 24 Aug 2026), Guard (36.64568 EGP, 24 Aug 2026), Afaaq (264.0854 EGP, 24 Aug 2026), Istsmar w Aman (221.7608 EGP, 24 Aug 2026), Misr Takaful (211.95786 EGP, 24 Aug 2026), Bareeq (212.76253 EGP, 24 Aug 2026), El Fanar (175.22114 EGP, 24 Aug 2026), Al Tameer (928.78 EGP, 22 Aug 2026), Kenz Foras (153.97 EGP, 24 Aug 2026), Kenz Shariah (181.09 EGP, 24 Aug 2026), Sarwaty (222.24643 EGP, 24 Aug 2026), Gosour (11.34 EGP, 24 Aug 2026), Bond$ (10.29709 USD, 24 Aug 2026), Kenz EGX70 EWI (111.67 EGP, 24 Aug 2026), and Kenz EGX35-LV (105.03 EGP, 24 Aug 2026).

The page is official and provides exactly the fields required by the project. Next step is to inspect the page HTML/JS for a stable data endpoint or implement a conservative parser against the rendered card markup, then match these names to the existing funds table before writing snapshots.
