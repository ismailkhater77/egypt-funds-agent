# تقرير مقارنة ملف الصناديق مع قاعدة البيانات

تاريخ التحليل: 2026-08-26T18:34:53.880316+00:00

## الخلاصة التنفيذية

يحتوي الملف المرفق على **198 صندوقًا/صفًا**. تحتوي قاعدة البيانات الحالية على **215 سجل صندوق** و**314 سجل سعر**. بعد توحيد الأسماء ومقارنتها مع `canonical_name` و`eima_name_raw`، تم ربط **198 صندوقًا** بقاعدة البيانات، ومن بينها **166 صندوقًا** لها سجل سعر بحالة `validated`. توجد **32 صناديق غير مغطاة حاليًا** ضمن الملف: **32** موجودة في قاعدة البيانات بلا سجل سعر validated، و**0** لم يتم العثور على سجل قاعدة بيانات مطابق لها.

## ما تم بناؤه في قاعدة البيانات

| البند | العدد |
|---|---:|
| صفوف الصناديق في الملف | 198 |
| سجلات الصناديق في Supabase | 215 |
| سجلات الأسعار في Supabase | 314 |
| صفوف الملف المرتبطة بسجل صندوق | 198 |
| صفوف الملف ذات سعر `validated` | 166 |
| صفوف الملف غير المغطاة | 32 |

> التغطية هنا تعني وجود صندوق مطابق في قاعدة البيانات مع سجل سعر بحالة `validated`. وجود الصندوق في جدول `funds` وحده لا يعني أن الوكيل حدّث سعره.

## الصناديق المغطاة

تم العثور على سجل سعر validated لـ **166** صندوقًا من الملف. التفاصيل الكاملة محفوظة في ملف JSON الداعم، وتتضمن اسم الملف واسم قاعدة البيانات و`fund_id` وآخر سعر وتاريخ التقييم.

## موجودة في قاعدة البيانات ولكن بلا سعر validated

| صف Excel | اسم الصندوق في الملف | الاسم في قاعدة البيانات | الشركة المديرة |
|---:|---|---|---|
| 20 | Bank ABC Fund I | Bank ABC Fund I | Azimut Egypt Asset Management |
| 22 | Blom Bank Fund I | Blom Bank Fund I | CFH Asset Management |
| 23 | Pharos Fund I | Pharos Fund I | Pharos Asset Management |
| 24 | Pioneers Fund I | Pioneers Fund I | Amwal for Financial Investments |
| 32 | Momentum | Momentum | CFH Asset Management |
| 33 | Odin Trend | Odin Trend | Alpha Financial Investments Management |
| 38 | Aspire Waffrah Plus | Aspire Waffrah Plus | Amwal for Financial Investments |
| 48 | Naeem Misr Fund | Naeem Misr Fund | Naeem for Financial Investments |
| 49 | Agriculural Bank of Egypt (Al Wefak) | Agriculural Bank of Egypt (Al Wefak) | CI Asset Management |
| 63 | Al Ahli Bank of Kuwait - Egypt Fund II | Al Ahli Bank of Kuwait - Egypt Fund II | Sigma Asset Management |
| 66 | Blom Bank Fund II | Blom Bank Fund II | CFH Asset Management |
| 69 | Housing & Development Bank (Mawared) | Housing & Development Bank (Mawared) | PFI Asset Management |
| 72 | Egyptian Gulf Bank (Tharaa) | Egyptian Gulf Bank (Tharaa) | Prime Investments |
| 76 | Arope Insurance Misr Fund | Arope Insurance Misr Fund | CFH Asset Management |
| 88 | Aman Micro Finance | Aman Micro Finance | Prime Investments |
| 89 | Menthum | Menthum | Azimut Egypt Asset Management |
| 105 | Aspire Rawajj | Aspire Rawajj | Amwal for Financial Investments |
| 110 | GIG Makaseb Fund First Tranche | GIG Makaseb Fund First Tranche | NI Capital |
| 111 | GIG Makaseb Fund Second Tranche | GIG Makaseb Fund Second Tranche | NI Capital |
| 119 | Egyptian Arab Land Bank Fund (Al Masry) | Egyptian Arab Land Bank Fund (Al Masry) | Alpha Financial Investment Management |
| 125 | NI Capital 15/30 | NI Capital 15/30 | NI Capital |
| 131 | Stream | Stream | CFH Asset Management |
| 146 | Al Baraka Bank Egypt (Al Motawazen) | Al Baraka Bank Egypt (Al Motawazen) | Naeem Capital for Investments |
| 147 | FAB Misr Fund (Ezdhar) | FAB Misr Fund (Ezdhar) | Acumen Asset Management |
| 149 | Sigma Traded Fund | Sigma Traded Fund | Sigma Funds Management |
| 159 | Prime NMOW | Prime NMOW | Prime Investments |
| 178 | Misr Money Market (Euro) | Misr Money Market (Euro) | CI Asset Management |
| 180 | Maksab First Tranche USD $ | Maksab First Tranche USD $ | Alpha Financial Investments Management & Zaldi Investments |
| 184 | Maksab Second Tranche (Euro) | Maksab Second Tranche (Euro) | Alpha Financial Investments Management & Zaldi Investments |
| 188 | The charitable education Fund | The charitable education Fund | NI Capital |
| 197 | Bokra Shakmagia | Bokra Shakmagia | Bokra |
| 199 | Market Return | Market Return | EGX 30 |

## غير موجودة في قاعدة البيانات أو لم تُربط

| صف Excel | اسم الصندوق | الشركة المديرة في الملف |
|---:|---|---|

## منهجية المطابقة والقيود

تمت المطابقة أولًا بعد توحيد حالة الأحرف والمسافات والشرطات والكيانات النصية، ومقارنة اسم الملف مع `canonical_name` و`eima_name_raw`. استُخدمت مطابقة تشابه عالية فقط عندما كان المرشح فريدًا وبفارق واضح، ولم تُقبل المطابقات الملتبسة. لذلك فإن قائمة عدم التغطية محافظة؛ وقد تحتاج بعض الأسماء غير المطابقة إلى aliases يدوية إذا كانت تمثل صناديق موجودة تحت اسم تجاري أو عربي مختلف.

التحليل يعتمد على نسخة قاعدة البيانات وقت التنفيذ وعلى الملف المرفق كما هو، ولا يغيّر قاعدة البيانات ولا ينشئ أسعارًا افتراضية.
