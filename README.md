# سفينة الفضاء

تطبيق جوال تعليمي للصف الخامس — القسمة المطولة عبر مغامرة إصلاح محركات سفينة فضاء.

## التشغيل

```bash
cd spaceship-app
npm install
npm start
```

- Android: `npm run android`
- Web للتجربة السريعة: `npm run web`

## نسختا التلميحات

| النسخة | الأمر |
|--------|--------|
| عند الطلب (افتراضي) | `npm start` — `HINT_MODE=on_demand` |
| تلقائي | انسخ `.env.auto` إلى `.env` أو عيّن `EXPO_PUBLIC_HINT_MODE=auto` |

## بناء APK (Android)

```bash
npx eas-cli login
npx eas build -p android --profile preview
```

نسخة التلميحات التلقائية: `--profile preview-auto`

## المسار

شعار → دخول بكود → فيديو → خريطة → تمهيدي / مستوى1 / مستوى2 → بنك مسائل → نهائي
