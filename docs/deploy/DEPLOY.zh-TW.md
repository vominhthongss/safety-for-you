# 部署指南 — Safety For You (繁體中文)

Safety For You 是提供日本防災資訊的免費、非營利、開源應用程式，原始碼採 MIT 授權；不能取代 JMA、J-Alert 或地方政府指示。

## 環境準備

準備 Node.js 22+ 與相容 SDK 58 的 Expo Go。此儲存庫沒有 lockfile，請執行 npm install。

## 本機執行

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

## 選用服務

可選 Cloudflare Worker 在 /hazards 提供近期 JMA 公告標題，並非有效警報。Romaji 服務亦為選用，公開時須設定 HTTPS 與請求速率限制。

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## 商店建置

發布至商店前須登入 Expo/EAS 並設定建置專案，再建立 Android、iOS 正式版本。應用識別碼由發布者管理。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## 發佈檢查

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

上架前需備妥隱私揭露、圖示、截圖、聯絡資訊、實機與無障礙測試，以及非官方警報聲明。JS 匯出成功不代表安全認證或通過 App Store 審核。

## 開源條款

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.zh-TW.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
