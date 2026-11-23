# デプロイ手順 — Safety For You (日本語)

Safety For Youは日本の防災情報を扱う無料・非営利のオープンソースアプリです。MITライセンスで公開されています。気象庁、J-Alert、自治体の指示や防災無線の代わりにはなりません。

## 必要な環境

Node.js 22以上とSDK 58対応のExpo Goを準備してください。このリポジトリにはlockfileがないため、npm installで依存関係を導入します。

## ローカル起動

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

## 任意のサービス

Cloudflare Workerは最近の気象庁の見出しを/hazardsで配信します。現在有効な警報ではなく、設定は任意です。ローマ字変換サービスも任意で、公開時はHTTPSとレート制限が必要です。

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## ストア向けビルド

ストア配布にはExpo/EASにログインし、ビルド設定後にAndroid・iOSの本番ビルドを作成します。パッケージ名とBundle IDは配布者が管理してください。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## 公開前の確認

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

公開前にプライバシー情報、アイコン、スクリーンショット、連絡先、実機とアクセシビリティ検証、非公式の防災情報である旨を整備してください。JSエクスポート成功だけでは安全性やApp Store審査合格を保証しません。

## オープンソースの条件

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ja.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
