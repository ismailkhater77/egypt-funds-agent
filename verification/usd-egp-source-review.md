# USD/EGP source review

The official Central Bank of Egypt exchange-rate page and homepage were attempted on 2026-08-31, but both returned a web-application rejection page in the sandbox. Search metadata showed CBE buy/sell values, but that metadata is not a sufficient server-side source for ingestion.

AllRatesToday documents a free-tier API that claims to serve CBE's published table, including separate USD/EGP buy and sell rates and the bank publication date. Its latest endpoint requires an API key; no such key has been configured. It is a third-party transport layer, not the primary CBE website. Therefore the production collector continues using the existing Frankfurter USD/EGP reference rate until a directly verifiable CBE feed or an explicitly approved free API credential is available. No estimated rate was inserted.
