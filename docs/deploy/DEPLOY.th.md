# คู่มือการติดตั้งและเผยแพร่ — Safety For You (ไทย)

Safety For You เป็นแอปข้อมูลภัยพิบัติญี่ปุ่นแบบฟรี ไม่แสวงหากำไร และโอเพนซอร์สภายใต้สัญญาอนุญาต MIT ไม่สามารถแทน JMA, J-Alert หรือคำสั่งของทางการท้องถิ่นได้

## สิ่งที่ต้องมี

ต้องมี Node.js 22+ และ Expo Go ที่รองรับ SDK 58 โครงการนี้ไม่มี lockfile ให้ติดตั้งด้วย npm install

## เรียกใช้ในเครื่อง

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: refresh interval (minimum 60 s).
- `EXPO_PUBLIC_JMA_PROXY_URL`: optional Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: optional self-hosted Kanji/Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: app identifiers for native builds.
- `EXPO_PUBLIC_*` values are embedded in public client bundles; never put secrets in them.
- Leaflet 1.9.4 is generated locally by `postinstall` into `src/generated/leafletAssets.js`. Map raster tiles still require network access.

## บริการเสริม

Cloudflare Worker เป็นทางเลือกสำหรับหัวข้อประกาศ JMA ล่าสุดที่ /hazards ไม่ใช่คำเตือนที่มีผลอยู่ บริการ Romaji ก็เป็นทางเลือก หากเปิดสาธารณะต้องใช้ HTTPS และจำกัดอัตราคำขอ

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## การ build สำหรับสโตร์

ก่อนเผยแพร่บนสโตร์ ให้เข้าสู่ระบบ Expo/EAS ตั้งค่าโปรเจ็กต์สำหรับ build แล้วสร้าง production build ของ Android/iOS ผู้เผยแพร่ต้องจัดการ app identifiers เอง

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## ตรวจสอบก่อนเผยแพร่

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

ก่อนเผยแพร่ต้องเตรียมข้อมูลความเป็นส่วนตัว ไอคอน ภาพหน้าจอ ช่องทางติดต่อ ทดสอบอุปกรณ์จริง/การเข้าถึง และคำชี้แจงว่าไม่ใช่ระบบเตือนภัยทางการ การ export JS ผ่านไม่ได้รับรองความปลอดภัยหรือการอนุมัติจาก App Store

## เงื่อนไขโอเพนซอร์ส

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.th.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
