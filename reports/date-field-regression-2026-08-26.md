# Date-field regression investigation

## HC Securities

The official page `https://www.hc-si.com/Service/asset-management` visibly lists fund names, but the current DOM exposed by the browser contains no `[data-id][data-slug]` sponsor-card elements. A same-origin AJAX probe therefore returned no cards. No NAV/date was inferred or written from this attempt; the existing server parser remains the only code path pending fixture confirmation.

## Beltone

The official page `https://www.beltoneholding.com/business-line/asset-management-1` exposes columns `Price (EGP)`, `Inception Date`, `Last Update`, and `Year to Date (%)`. The live B-Cobonat row showed price **1.02**, inception date `2026-07-16`, and `Last Update` `2026-08-30`. The latter is future-dated relative to the 2026-08-26 run and cannot be used as a valuation date. The prior validated snapshot for the same fund and price was dated 2026-08-23.

## Azimut

Official list endpoint: `https://app.azimut.eg/api/fund/list?size=100&web=true`. The list's `last_nav.date` can be a future scheduled date (for example `2026-08-30`). The official detail endpoint `https://app.azimut.eg/api/fund/17` exposes a `graph` history; its tail contains actual NAV points through 2026-08-25, while `last_nav.date` is 2026-08-30. The parser must prefer the latest graph point not later than the as-of date over the future `last_nav.date`.

## Zaldi

Official pages `https://zaldi-capital.com/zaldi-star/` and `https://zaldi-capital.com/zaldi-elmasry/` currently print `NAV/UNIT` with `Date: 30/8/2026`, while the server run date is 2026-08-26. Page cache timestamps are not valuation dates. The parser must not convert this future Date into a validated snapshot; it needs an actual dated value from a source field/history or preserve the prior actual snapshot when the NAV is unchanged.

## Beltone B-Cobonat linked PDF

The official page links to a public Google Drive PDF titled `مذكرة معلومات الإصدار الثاني بي-كوبونات المعتمدة.PDF`. The document is an issuance-information memorandum, not a periodic NAV sheet, and the viewer did not expose a current daily valuation date. It is therefore not used to infer the actual date for the live row; the persistence resolver remains the safe path for an unchanged NAV, while a changed NAV with only a future schedule date is rejected.

## Provider-field conclusion

The focused live inspection confirms that **Azimut** has a usable separate historical `graph` field, so its parser can select the latest actual point. In contrast, the current official payloads for **Beltone**, **HC Securities**, and **Zaldi** expose only a single future-labelled field (`Last Update`, `Price per certificate as of Date`, or `Date`) and do not expose a separate actual valuation date in the inspected response. Their changed-NAV records therefore remain rejected rather than being assigned an invented date. For unchanged NAVs, persistence may reuse the latest same-NAV, same-currency validated snapshot; it never writes the future date.

## Final verification after the resolver change

The four-provider rerun completed with the following observed results: Beltone fetched 30 records, matched 30, preserved 3 unchanged snapshots, and rejected 27 future-dated candidates that had no same-NAV validated predecessor; Azimut fetched 24, matched 19, and returned 19 unchanged after using the official detail graphs and existing actual dates; HC Securities fetched and matched 7, preserved 3 unchanged snapshots, and rejected 4 future-dated candidates without same-NAV predecessors; Zaldi matched its available records but rejected future-dated candidates where no same-NAV predecessor was available, with one source fetch failure on the second page.

Run All completed with status `partial`, 238 fetched records, 158 matched records, 0 inserts, 130 unchanged, 0 updates, 80 unmatched, and 28 rejected/failed records. The coverage materializer reports **168/198** with `validated` prices and 30 pending. The database audit reports **0 same-source price-duplicate groups**, **0 fund-name duplicate groups**, 23 legitimate multi-source fund/date groups, and 3 multi-source NAV conflicts retained for review. A separate all-source future-date audit found 41 future-dated rows, all with status `review`, and **0 future-dated validated rows**.

This establishes the safety property requested by the user: no future scheduled date is persisted as a validated valuation date. It does not claim that Beltone, HC Securities, or Zaldi have an actual-date field when their current official payloads do not expose one; changed-NAV records from those sources remain explicitly rejected until the provider publishes a verifiable actual valuation date.

## Follow-up source search

A follow-up search for official historical-price endpoints found only the existing Beltone asset-management page, HC's official managed-fund price list, and Zaldi's official site. The other results were secondary aggregators or social posts and were not used. No additional official endpoint was found that supplies a separate actual valuation date for the Beltone, HC, or Zaldi rows currently carrying future dates.

## Regression suite extension

The suite now contains 32 passing tests. Two reusable B-Cobonat HTML fixtures represent the same NAV (1.02 EGP) first dated 2026-08-23 and then displayed with 2026-08-30. The end-to-end mocked persistence test confirms the second observation is `unchanged`, reuses the prior actual date, and performs no POST. A second end-to-end case changes the NAV to 1.03 while leaving only the future date available; it returns a failure and performs no POST. This prevents both accidental date replacement and silent acceptance of an undated/incorrect future valuation.
