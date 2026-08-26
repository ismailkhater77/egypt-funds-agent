from pathlib import Path
import json
from datetime import datetime, timezone

report = json.loads(Path('/tmp/upload-coverage-report.json').read_text(encoding='utf-8'))
covered = report['covered']
uncovered = report['not_covered']
matched_without_price = [item for item in uncovered if item.get('fund_id')]
unmatched = [item for item in uncovered if not item.get('fund_id')]
lines = []
lines += ['# تقرير مقارنة ملف الصناديق مع قاعدة البيانات', '', f"تاريخ التحليل: {datetime.now(timezone.utc).isoformat()}", '', '## الخلاصة التنفيذية', '', f"يحتوي الملف المرفق على **{report['file_fund_count']} صندوقًا/صفًا**. تحتوي قاعدة البيانات الحالية على **{report['database_fund_count']} سجل صندوق** و**{report['database_price_row_count']} سجل سعر**. بعد توحيد الأسماء ومقارنتها مع `canonical_name` و`eima_name_raw`، تم ربط **{report['matched_to_database_count']} صندوقًا** بقاعدة البيانات، ومن بينها **{report['covered_with_validated_price_count']} صندوقًا** لها سجل سعر بحالة `validated`. توجد **{report['not_covered_count']} صناديق غير مغطاة حاليًا** ضمن الملف: **{len(matched_without_price)}** موجودة في قاعدة البيانات بلا سجل سعر validated، و**{len(unmatched)}** لم يتم العثور على سجل قاعدة بيانات مطابق لها.", '', '## ما تم بناؤه في قاعدة البيانات', '', '| البند | العدد |', '|---|---:|', f"| صفوف الصناديق في الملف | {report['file_fund_count']} |", f"| سجلات الصناديق في Supabase | {report['database_fund_count']} |", f"| سجلات الأسعار في Supabase | {report['database_price_row_count']} |", f"| صفوف الملف المرتبطة بسجل صندوق | {report['matched_to_database_count']} |", f"| صفوف الملف ذات سعر `validated` | {report['covered_with_validated_price_count']} |", f"| صفوف الملف غير المغطاة | {report['not_covered_count']} |", '', '> التغطية هنا تعني وجود صندوق مطابق في قاعدة البيانات مع سجل سعر بحالة `validated`. وجود الصندوق في جدول `funds` وحده لا يعني أن الوكيل حدّث سعره.', '', '## الصناديق المغطاة', '', 'تم العثور على سجل سعر validated لـ **' + str(len(covered)) + '** صندوقًا من الملف. التفاصيل الكاملة محفوظة في ملف JSON الداعم، وتتضمن اسم الملف واسم قاعدة البيانات و`fund_id` وآخر سعر وتاريخ التقييم.', '', '## موجودة في قاعدة البيانات ولكن بلا سعر validated', '', '| صف Excel | اسم الصندوق في الملف | الاسم في قاعدة البيانات | الشركة المديرة |', '|---:|---|---|---|']
for item in matched_without_price:
    lines.append(f"| {item['row']} | {item['file_name']} | {item.get('db_name','')} | {item.get('db_company','') or ''} |")
lines += ['', '## غير موجودة في قاعدة البيانات أو لم تُربط', '', '| صف Excel | اسم الصندوق | الشركة المديرة في الملف |', '|---:|---|---|']
for item in unmatched:
    lines.append(f"| {item['row']} | {item['file_name']} | {item['company']} |")
lines += ['', '## منهجية المطابقة والقيود', '', 'تمت المطابقة أولًا بعد توحيد حالة الأحرف والمسافات والشرطات والكيانات النصية، ومقارنة اسم الملف مع `canonical_name` و`eima_name_raw`. استُخدمت مطابقة تشابه عالية فقط عندما كان المرشح فريدًا وبفارق واضح، ولم تُقبل المطابقات الملتبسة. لذلك فإن قائمة عدم التغطية محافظة؛ وقد تحتاج بعض الأسماء غير المطابقة إلى aliases يدوية إذا كانت تمثل صناديق موجودة تحت اسم تجاري أو عربي مختلف.', '', 'التحليل يعتمد على نسخة قاعدة البيانات وقت التنفيذ وعلى الملف المرفق كما هو، ولا يغيّر قاعدة البيانات ولا ينشئ أسعارًا افتراضية.']
Path('/home/ubuntu/egypt-funds-agent/reports/upload-coverage-report.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
Path('/home/ubuntu/egypt-funds-agent/reports/upload-coverage-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'markdown': 'reports/upload-coverage-report.md', 'json': 'reports/upload-coverage-report.json', 'covered': len(covered), 'matched_without_price': len(matched_without_price), 'unmatched': len(unmatched), 'not_covered': len(uncovered)}, ensure_ascii=False, indent=2))
