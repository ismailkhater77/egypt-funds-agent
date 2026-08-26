# تقرير التحقق النهائي: SCB وFaisal

تاريخ التحقق: 26 أغسطس 2026، بتوقيت UTC.

## النتيجة التنفيذية

تمت إضافة مصدرَي بنك قناة السويس وبنك فيصل الإسلامي إلى مسار `Run All` كمصدرين مستقلين. لم يتم استبدال `price_update_url` الأساسي للصناديق الموجودة؛ بل تُحفظ snapshots المصدر البنكي تحت `source_id` الخاص به، وهو ما يسمح بالمقارنة بين المصدر الأساسي والمصدر الثانوي.

| المصدر | السجلات المقروءة | المطابقة | التشغيل الأول | إعادة التشغيل | الحالة |
|---|---:|---:|---:|---:|---|
| Suez Canal Bank | 4 | 4 | 1 inserted + 3 unchanged | 4 unchanged | success |
| Faisal Islamic Bank | 2 | 2 | 1 inserted + 1 unchanged | 2 unchanged | success |

## السجلات والأسعار المنشورة

| المصدر | الاسم المنشور | NAV | تاريخ التقييم | fund_id |
|---|---|---:|---|---|
| SCB | صندوق استثمار بنك قناة السويس | 2043.56 | 2026-08-20 | `fund_472ddcd8c94d7ed3` |
| SCB | صندوق الأجيال | 73.96204 | 2026-08-25 | `fund_58307ef8e9ea2272` |
| SCB | صندوق استثمار العربية المصرية للتأمين | 1376.56 | 2026-08-20 | `fund_catalog_scb_arabia_misr_insurance` |
| SCB | صندوق استثمار السويس اليومى | 25.41787 | 2026-08-25 | `fund_46ddc8f193e74f70` |
| Faisal | صندوق أمان ذو العائد التراكمى | 525.63 | 2026-08-25 | `fund_2daf6f49025a1405` |
| Faisal | صندوق إستثمار بنك فيصل الإسلامى المصرى ذو العائد الدورى | 581.67 | 2026-08-23 | `fund_44166931f38ee123` |

## Alias mapping المستخدم في المطابقة

| المصدر | الاسم المنشور | الاسم الداخلي/مرجع المطابقة | fund_id |
|---|---|---|---|
| SCB | صندوق استثمار بنك قناة السويس | `Suez Canal Bank Fund I` | `fund_472ddcd8c94d7ed3` |
| SCB | صندوق الأجيال | `Suez Canal Bank Fund II (Al Agial)` | `fund_58307ef8e9ea2272` |
| SCB | صندوق استثمار العربية المصرية للتأمين | الاسم العربي نفسه، أُضيف كسجل كتالوج جديد | `fund_catalog_scb_arabia_misr_insurance` |
| SCB | صندوق استثمار السويس اليومى | `Suez Canal Bank (Al Suez Al Youmi)` | `fund_46ddc8f193e74f70` |
| Faisal | صندوق أمان ذو العائد التراكمى | `FIBE & CIB (Aman)` | `fund_2daf6f49025a1405` |
| Faisal | صندوق إستثمار بنك فيصل الإسلامى المصرى ذو العائد الدورى | `Faisal Islamic Bank of Egypt Fund` | `fund_44166931f38ee123` |

تم استخدام alias فقط عندما كان الاسم المنشور مختلفًا عن `canonical_name`/`eima_name_raw`. لم تُستخدم مطابقة fuzzy أو تخمين بالاسم الجزئي.

## المطابقة والكتالوج

تمت إضافة صندوق SCB الخاص بالعربية المصرية للتأمين إلى الكتالوج لأنه كان منشورًا رسميًا ولم يكن له سجل مطابق سابق. أُبقي `source_id` و`price_update_url` الأساسيان فارغين لهذا السجل، مع توثيق رابط SCB في `fund_info_url`، حتى لا ندعي ملكية مدير الأصول أو نستبدل مصدرًا لم يُثبت بعد.

أظهر الفحص الصارم بعد الإدراج وجود **215 سجل صندوق** و**0 مجموعات مكررة** في كل الاختبارات: `canonical_name` exact/normalized، و`eima_name_raw` exact/normalized، وفحص cross-field بين الحقلين. كما تحسنت تغطية ملف المستخدم من **57 إلى 53 صندوقًا غير مغطى**، مع بقاء جميع صفوف الملف الـ198 مرتبطة بسجل في قاعدة البيانات.

## الاختبارات والملفات

أضيف parser مستقل لكل مصدر، وfixtures واقعية البنية، واختبارا Vitest لاستخراج السجلات الستة. آخر تشغيل للاختبارات: **13 اختبارًا ناجحًا**، مع نجاح `tsc --noEmit`. الأدلة التشغيلية محفوظة في `reports/scb-faisal-live-run-v2.json` و`reports/scb-faisal-live-run-v3.json` و`reports/fund-duplicates-after-scb-faisal.json`.

## References

[1]: https://scbank.com.eg/Ar/Fund_Rates.aspx "Suez Canal Bank — Fund Rates"

[2]: https://www.faisalbank.com.eg/ar/Retail/Mutual-Funds "Faisal Islamic Bank Egypt — Mutual Funds"
