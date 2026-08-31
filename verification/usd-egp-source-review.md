# USD/EGP source review

## Current finding

The official Central Bank of Egypt exchange-rate page and homepage were attempted on 2026-08-31, but both returned a web-application rejection page in the sandbox. Search metadata showed that the CBE table has separate USD buy and sell values, but search metadata is not a sufficient server-side source for ingestion.

AllRatesToday documents a free-tier API that claims to serve the CBE published table, including separate USD/EGP buy and sell rates and the bank publication date. Its latest endpoint requires an API key; no such key has been configured. It is a third-party transport layer, not the primary CBE website. Apify's community actor is paid per event and is not acceptable under the free-only requirement.

## Decision

The production collector continues using the existing verified Frankfurter USD/EGP reference rate until a directly verifiable CBE feed or an explicitly approved free API credential is available. Do not use a search snippet, guessed value, or unverified third-party fallback. No estimated rate was inserted.

When a valid feed is available, persist the selected CBE field explicitly (buy, sell, or a documented midpoint) and preserve the source publication date.
