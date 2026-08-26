# تقرير مقارنة ملف الصناديق مع قاعدة البيانات

تاريخ التحليل: 2026-08-26T13:42:19.895714+00:00

## الخلاصة التنفيذية

يحتوي الملف المرفق على **198 صندوقًا/صفًا**. تحتوي قاعدة البيانات الحالية على **163 سجل صندوق** و**189 سجل سعر**. بعد توحيد الأسماء ومقارنتها مع `canonical_name` و`eima_name_raw`، تم ربط **148 صندوقًا** بقاعدة البيانات، ومن بينها **141 صندوقًا** لها سجل سعر بحالة `validated`. توجد **57 صناديق غير مغطاة حاليًا** ضمن الملف: **7** موجودة في قاعدة البيانات بلا سجل سعر validated، و**50** لم يتم العثور على سجل قاعدة بيانات مطابق لها.

## ما تم بناؤه في قاعدة البيانات

| البند | العدد |
|---|---:|
| صفوف الصناديق في الملف | 198 |
| سجلات الصناديق في Supabase | 163 |
| سجلات الأسعار في Supabase | 189 |
| صفوف الملف المرتبطة بسجل صندوق | 148 |
| صفوف الملف ذات سعر `validated` | 141 |
| صفوف الملف غير المغطاة | 57 |

> التغطية هنا تعني وجود صندوق مطابق في قاعدة البيانات مع سجل سعر بحالة `validated`. وجود الصندوق في جدول `funds` وحده لا يعني أن الوكيل حدّث سعره.

## الصناديق المغطاة

تم العثور على سجل سعر validated لـ **141** صندوقًا من الملف. التفاصيل الكاملة محفوظة في ملف JSON الداعم، وتتضمن اسم الملف واسم قاعدة البيانات و`fund_id` وآخر سعر وتاريخ التقييم.

## موجودة في قاعدة البيانات ولكن بلا سعر validated

| صف Excel | اسم الصندوق في الملف | الاسم في قاعدة البيانات | الشركة المديرة |
|---:|---|---|---|
| 8 | Ebank Fund (El Khabeer) | Ebank Fund (El Khabeer) | Azimut Egypt Asset Management |
| 20 | Bank ABC Fund I | Bank ABC Fund I | Azimut Egypt Asset Management |
| 59 | Ebank Fund II | Ebank Fund II | Azimut Egypt Asset Management |
| 89 | Menthum | Menthum | Azimut Egypt Asset Management |
| 115 | SAIB Fund III (Al Rabeh) | SAIB’s Third Investment Fund (El Rabeh) | Hermes Portfolio and Fund Management |
| 116 | ALEXBANK Fund III | Bank of Alexandria Fund No. 3 | Hermes Portfolio and Fund Management |
| 185 | Azimut Target Maturity Fund-Target 2027 USD | Azimut Target Maturity Fund-Target 2027 USD | Azimut Egypt Asset Management |

## غير موجودة في قاعدة البيانات أو لم تُربط

| صف Excel | اسم الصندوق | الشركة المديرة في الملف |
|---:|---|---|
| 4 | GIG Insurance - Egypt Fund I | *PFI Asset Management |
| 18 | Al Ahli Bank of Kuwait - Egypt Fund I | Sigma Asset Management |
| 22 | Blom Bank Fund I | CFH Asset Management |
| 23 | Pharos Fund I | Pharos Asset Management |
| 24 | Pioneers Fund I | Amwal for Financial Investments |
| 26 | National Bank of Kuwait Fund (Namaa) | NBK Capital Asset Management Egypt |
| 28 | NI Capital (Sahmy Fund) | NI Capital |
| 29 | Mubasher Equity | Mubasher Asset Management |
| 32 | Momentum | CFH Asset Management |
| 33 | Odin Trend | Alpha Financial Investments Management |
| 38 | Aspire Waffrah Plus | Amwal for Financial Investments |
| 46 | National Bank of Kuwait (Hayat) | NBK Capital Asset Management Egypt |
| 48 | Naeem Misr Fund | Naeem for Financial Investments |
| 49 | Agriculural Bank of Egypt (Al Wefak) | CI Asset Management |
| 63 | Al Ahli Bank of Kuwait - Egypt Fund II | Sigma Asset Management |
| 66 | Blom Bank Fund II | CFH Asset Management |
| 67 | National Bank of Kuwait Fund (Ishraq) | NBK Capital Asset Management Egypt |
| 69 | Housing & Development Bank (Mawared) | PFI Asset Management |
| 72 | Egyptian Gulf Bank (Tharaa) | Prime Investments |
| 76 | Arope Insurance Misr Fund | CFH Asset Management |
| 81 | Siula Money Market | NI Capital |
| 85 | Delta Life Insurance | Alpha Financial Investment Management |
| 87 | GIG Insurance | *PFI Asset Management |
| 88 | Aman Micro Finance | Prime Investments |
| 99 | Odin 4 | Alpha Financial Investment Management |
| 101 | Granite First Fund | Granite Fund Management |
| 103 | PFI Cashi | PFI Asset Management |
| 105 | Aspire Rawajj | Amwal for Financial Investments |
| 107 | ADIB Egypt Shari'a Compliant (Al Nahrda Fund) | Beltone Asset Management |
| 110 | GIG Makaseb Fund First Tranche | NI Capital |
| 111 | GIG Makaseb Fund Second Tranche | NI Capital |
| 119 | Egyptian Arab Land Bank Fund (Al Masry) | Alpha Financial Investment Management |
| 125 | NI Capital 15/30 | NI Capital |
| 127 | Cash Mubasher | Mubasher Asset Management |
| 131 | Stream | CFH Asset Management |
| 132 | Target First Fund | Target Asset Management |
| 139 | *National Bank of Kuwait (Al Mizan) | NBK Capital Asset Management Egypt |
| 146 | Al Baraka Bank Egypt (Al Motawazen) | Naeem Capital for Investments |
| 147 | FAB Misr Fund (Ezdhar) | Acumen Asset Management |
| 149 | Sigma Traded Fund | Sigma Funds Management |
| 150 | Ebank Fund III (Konooz) | Prime Investments |
| 157 | NI Capital EGX 70 | NI Capital |
| 159 | Prime NMOW | Prime Investments |
| 178 | Misr Money Market (Euro) | CI Asset Management |
| 180 | Maksab First Tranche USD $ | Alpha Financial Investments Management & Zaldi Investments |
| 184 | Maksab Second Tranche (Euro) | Alpha Financial Investments Management & Zaldi Investments |
| 188 | The charitable education Fund | NI Capital |
| 194 | Mubasher Gold | Mubasher Asset Management |
| 197 | Bokra Shakmagia | Bokra |
| 199 | Market Return | EGX 30 |

## منهجية المطابقة والقيود

تمت المطابقة أولًا بعد توحيد حالة الأحرف والمسافات والشرطات والكيانات النصية، ومقارنة اسم الملف مع `canonical_name` و`eima_name_raw`. استُخدمت مطابقة تشابه عالية فقط عندما كان المرشح فريدًا وبفارق واضح، ولم تُقبل المطابقات الملتبسة. لذلك فإن قائمة عدم التغطية محافظة؛ وقد تحتاج بعض الأسماء غير المطابقة إلى aliases يدوية إذا كانت تمثل صناديق موجودة تحت اسم تجاري أو عربي مختلف.

التحليل يعتمد على نسخة قاعدة البيانات وقت التنفيذ وعلى الملف المرفق كما هو، ولا يغيّر قاعدة البيانات ولا ينشئ أسعارًا افتراضية.
