# Blue Sentinel V3 AI Engine

نسخة Static سهلة التشغيل بدون React أو Supabase.

## الملفات
- `index.html` واجهة العملاء العامة.
- `admin.html` لوحة المشرف بتسجيل دخول.
- `lifeguard.html` صفحة المنقذ بتسجيل دخول.
- `data.js` البيانات الأساسية القابلة للتعديل.
- `ai-engine.js` محرك تقييم البحر والتوصيات.
- `cloudflare-worker-ai.js` Worker اختياري للتشغيل التلقائي الساعة 6 صباحاً.
- `google-sheets-apps-script.js` ربط الحالات والطلبات مع Google Sheets.

## بيانات الدخول
- المشرف: `admin` / `1234`
- المنقذ: اختار الاسم / `1234`

## AI Core
المحرك يقوم بـ:
1. سحب حالة البحر والطقس من Open-Meteo عند الضغط على تحديث حالة البحر الآن.
2. تطبيق Risk Engine:
   - Wave Height > 1.2m أو Wind Speed > 25 km/h = High Risk.
   - Wave Height من 0.5m أو Wind Speed من 15 km/h = Medium Risk.
3. توليد توصيات التشغيل والتحذيرات اليومية.
4. زر اعتماد ونشر أخبار العملاء يحدث واجهة العملاء على نفس المتصفح.

## ملاحظة نشر مهمة
الموقع Static، لذلك أي تعديل من لوحة المشرف يتحفظ على نفس المتصفح فقط باستخدام localStorage.
للتحديث العام لكل الزوار: صدّر البيانات وارفعها، أو فعّل Cloudflare Worker/Google Sheets كخطوة تشغيل لاحقة.
