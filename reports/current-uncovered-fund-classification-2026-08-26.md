# Current Uncovered-Fund Classification — 2026-08-26

This is an **exhaustive current** classification of every catalog fund without a validated snapshot dated on or before 2026-08-26. It is distinct from the earlier 31-fund report: Al Wefak was added successfully, so the current denominator is **23**.

| Metric | Count |
| --- | ---: |
| Current funds without a validated snapshot | 23 |
| Recorded catalog URL exists | 2 |
| Catalog URL is blank | 21 |
| Confirmed parser extraction failures from an otherwise published price/date | 0 |
| Confirmed future-date-only rejection | 6 |

## Category totals

| Category | Meaning | Count |
| --- | --- | ---: |
| LINKED_NO_PUBLISHED_NAV | رابط رسمي قائم لكن لا ينشر NAV/تاريخ قابلًا للاعتماد |
| LINKED_GENERIC_OR_UNMAPPED | رابط قائم لكنه صفحة عامة أو غير مثبتة للمنتج المستهدف |
| IDENTITY_UNCONFIRMED | يوجد منتج رسمي محتمل لكن هوية Fund II غير مثبتة |
| OFFICIAL_UNDATED | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| OFFICIAL_STALE | مصدر رسمي موجود لكن NAV/المستند قديم |
| FUTURE_DATE_ONLY | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| OFFICIAL_FETCH_BLOCKED | مصدر رسمي معروف لكن الجلب الخادمي محجوب أو يفشل شبكيًا |
| OFFICIAL_NO_CURRENT_NAV | مصدر رسمي مفحوص لا ينشر NAV حاليًا |
| NO_OFFICIAL_CURRENT_NAV_FOUND | لم يظهر مصدر رسمي حالي لـNAV بعد البحث |

## Per-fund classification

| Fund | Recorded catalog URL | One controlling reason |
| --- | --- | --- |
| Al Ahli Bank of Kuwait - Egypt Fund II | — | يوجد منتج رسمي محتمل لكن هوية Fund II غير مثبتة |
| Al Baraka Bank Egypt (Al Motawazen) | — | مصدر رسمي مفحوص لا ينشر NAV حاليًا |
| Aman Micro Finance | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| Arope Insurance Misr Fund | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| Aspire Rawajj | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| Aspire Waffrah Plus | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| Bank ABC Fund I | https://azimut.eg/funds | رابط رسمي قائم لكن لا ينشر NAV/تاريخ قابلًا للاعتماد |
| Blom Bank Fund I | — | لم يظهر مصدر رسمي حالي لـNAV بعد البحث |
| Blom Bank Fund II | — | لم يظهر مصدر رسمي حالي لـNAV بعد البحث |
| Bokra Shakmagia | — | مصدر رسمي مفحوص لا ينشر NAV حاليًا |
| Egyptian Gulf Bank (Tharaa) | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| GIG Makaseb Fund First Tranche | — | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| GIG Makaseb Fund Second Tranche | — | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| Housing & Development Bank (Mawared) | — | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| Momentum | — | مصدر رسمي مفحوص لا ينشر NAV حاليًا |
| Naeem Misr Fund | — | مصدر رسمي موجود لكن NAV/المستند قديم |
| NI Capital 15/30 | — | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| Pharos Fund I | — | مصدر رسمي معروف لكن الجلب الخادمي محجوب أو يفشل شبكيًا |
| Pioneers Fund I | — | مصدر رسمي موجود لكن NAV/المستند قديم |
| Prime NMOW | — | مصدر رسمي يعرض منتجًا/سعرًا بلا تاريخ تقييم صريح |
| Stream | — | مصدر رسمي مفحوص لا ينشر NAV حاليًا |
| The charitable education Fund | — | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |
| Zaldi Star (Money Market) | https://zaldi-capital.com/zaldi-star/ | NAV رسمي منشور لكن تاريخ التقييم مستقبلي فقط |

## Interpretation

A blank catalog URL does **not** prove that an official source does not exist. Some blank-URL rows have already been researched and assigned a reason such as stale official evidence, an undated official table, or a blocked official endpoint. The current `FUTURE_DATE_ONLY` set contains six daily funds: Mawared from PFI; NI Capital 15/30; the two GIG Makaseb tranches; the charitable education fund from NI Capital; and Zaldi Star from Zaldi Investments. Their official dates are later than the controlled as-of date, so none is validated or treated as scheduled-weekly.
