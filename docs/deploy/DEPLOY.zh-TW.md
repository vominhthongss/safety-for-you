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

- `EXPO_PUBLIC_REFRESH_SECONDS`: 更新間隔（秒，至少60秒）。
- `EXPO_PUBLIC_JMA_PROXY_URL`: 選用的JMA標題Cloudflare Worker網址。
- `EXPO_PUBLIC_ROMAJI_API_URL`: 選用的自架Kanji轉Romaji服務網址。
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Android/iOS簽署版本的固定識別碼。
- `EXPO_PUBLIC_*`: 公開變數會包含在客戶端中，不可儲存機密。
- `Leaflet 1.9.4`: `postinstall`產生`src/generated/leafletAssets.js`；地圖圖磚仍需網路。

## 選用服務

可選 Cloudflare Worker 在 /hazards 提供近期 JMA 公告標題，並非有效警報。Romaji 服務亦為選用，公開時須設定 HTTPS 與請求速率限制。

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

漢字轉羅馬字服務請參閱`romaji-service/README.md`（Node.js 22+、HTTPS代理及速率限制）。未部署時保留空白URL；沒有Worker時天氣標題可能不可用。設定`.env`中的Worker網址後請重新啟動Expo。

## 商店建置

發布至商店前須登入 Expo/EAS 並設定建置專案，再建立 Android、iOS 正式版本。應用識別碼由發布者管理。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

儲存庫目前沒有`eas.json`。先執行一次`build:configure`，檢查產生的production設定，再配置簽署憑證、商店帳戶、應用識別碼與正式環境變數。完整流程請見下文。

## 發佈檢查

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

上架前需備妥隱私揭露、圖示、截圖、聯絡資訊、實機與無障礙測試，以及非官方警報聲明。JS 匯出成功不代表安全認證或通過 App Store 審核。

## 開源條款

依照[MIT授權](../../LICENSE)，保留實質複本中的版權及授權聲明後，可使用、修改和重新散布程式碼，包括商業用途。第三方套件、地圖、圖磚和資料來源適用個別條款。貢獻時須保留來源標示、事實查證和安全提示。

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.zh-TW.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## 發佈至應用商店

請參閱[Google Play與Apple App Store詳細發佈指南](../stores/STORE_RELEASE.zh-TW.md)，了解簽署、測試、隱私揭露、審核與目前待完成事項。
