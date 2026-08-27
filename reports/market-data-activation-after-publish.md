# تفعيل تحديث بيانات السوق اليومي بعد النشر

**الحالة الحالية:** جامع السوق والجداول موجودة ومتحققة، لكن لا توجد مهمة مجدولة مفعلة. هذا مقصود؛ لا يصل Heartbeat إلى بيئة التطوير، ولا يجب إنشاء تشغيل دوري قبل نشر الموقع.

بعد أن ينشر مالك المشروع الموقع، تُنفذ الأوامر التالية من بيئة المشروع مرة واحدة فقط:

```bash
manus-heartbeat create \
  --name daily-market-data \
  --cron "0 30 21 * * *" \
  --path /api/scheduled/market-data \
  --payload '{}' \
  --description "Daily free market-data refresh after U.S. market close"
```

يعيد الأمر `task_uid`. بعد ذلك فقط يُحفظ هذا المعرف في صف `daily_market_data` ويُفعّل الصف، باستخدام كتابة إدارية محددة لا تعتمد على أي بيانات في طلب HTTP:

```sql
update public.market_data_jobs
set schedule_cron_task_uid = '<task_uid returned above>',
    active = true,
    updated_at = now()
where job_key = 'daily_market_data';
```

> يستخدم الجدول صيغة cron ذات ستة حقول بتوقيت UTC. التشغيل عند `21:30 UTC`، وتبقى تواريخ السوق التي تحفظها المصادر منفصلة عن وقت تشغيل المهمة. يعيد المعالج 2xx عند وجود مهمة يتيمة/غير فعالة لتجنب إعادة المحاولة، ولا يبدأ تجميعًا إلا إذا تطابق `task_uid` وكانت المهمة مفعلة.

يمكن التحقق من المهمة بعد إنشائها عبر:

```bash
manus-heartbeat list
```

ولا يُنفذ هذا الدليل قبل نشر الموقع أو قبل موافقة المستخدم الصريحة على تفعيل التحديث الآلي.
