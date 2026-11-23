# 部署指南 — Safety For You (简体中文)

Safety For You 是服务于日本灾害信息的免费、非营利、开源应用，源代码采用 MIT 许可证。它不能取代 JMA、J-Alert 或地方政府的指示。

## 环境准备

准备 Node.js 22+ 及兼容 SDK 58 的 Expo Go。本仓库没有 lockfile，请使用 npm install 安装依赖。

## 本地运行

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

## 可选服务

可选 Cloudflare Worker 在 /hazards 提供近期 JMA 公告标题，并非有效警报。Romaji 服务同样可选；公开部署时须启用 HTTPS 和访问限速。

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## 商店构建

商店发布需登录 Expo/EAS、配置构建项目，然后生成 Android 和 iOS 生产构建。发布者须自行管理应用标识符。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## 发布检查

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

上架前须准备隐私说明、图标、截图、联系方式、真机与无障碍测试，以及非官方警报免责声明。JavaScript 导出成功不代表通过安全评估或 App Store 审核。

## 开源条款

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.zh-CN.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
