# Safety For You — 專案介紹與部署指南

[架構決策紀錄](ADR.md) · [🌐](../README.md)

## 1. 專案與開源授權

Safety For You 是供日本居民與旅客使用的免費、非營利行動應用程式，整合地震、海嘯、近期氣象公告、地圖與指定緊急避難場所。這是獨立專案，並非政府官方服務。僅在前景更新，沒有背景緊急推播或離線安全保證。

原創程式碼與文件採用 [MIT](../../LICENSE)：保留著作權及授權聲明即可使用、修改、再散布或販售。非營利宗旨不限制商業分支，軟體不提供擔保。外部資料、地圖與套件遵守[各自條款](../../THIRD_PARTY_NOTICES.md)。貢獻請fork、建立分支、驗證後送出PR；不要提交憑證或簽署金鑰。

## 2. 環境需求

需要Node.js 22+、npm、Git及支援SDK 58的Expo Go。本機iOS建置需要macOS/Xcode；Android需要相容SDK/JDK。雲端建置使用Expo帳號，商店發行使用自己的Apple Developer或Google Play Console帳號。不需要資料庫或Google Maps金鑰。

## 3. 本機執行

在儲存庫根目錄執行，已有 `.env` 請勿覆蓋。填妥下表後以Expo Go掃描QR碼。安裝會自動封裝Leaflet；缺少產出檔時執行 `npm run bundle:maps`。介面提供13語言，日/英/越以外部分舊字串仍回退至英語。

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| 變數 | 用途 |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | 啟動等待0–600毫秒。 |
| `EXPO_PUBLIC_REFRESH_SECONDS` | 前景刷新秒數，至少60，預設120。 |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker HTTPS根URL，不含 /hazards；空白停用氣象來源。 |
| `EXPO_PUBLIC_ROMAJI_API_URL` | 羅馬字服務HTTPS根URL，不含 /romaji；空白僅保留本機讀音。 |
| `ANDROID_PACKAGE` | 自己的Android應用程式ID。 |
| `IOS_BUNDLE_ID` | 自己的iOS Bundle ID。 |
| `EAS_PROJECT_ID` | Expo專案UUID；Expo Go可省略，EAS須連結自己的專案。 |

## 4. 選用 JMA Worker

在 `wrangler.toml` 設定唯一名稱，登入自己的Cloudflare帳號並從根目錄部署。範例網域換成Wrangler回傳URL。`/hazards` 應回傳含 `items`、`kind` 的JSON；`degraded: true` 表示部分上游失敗。將根URL填入 `.env`。Worker只分類JMA Atom標題，不確認目前有效警報或氣象測量值。

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. 選用羅馬字服務

在VPS另一個終端機啟動。正式環境以systemd、容器或程序管理器維持運作，3088埠前設HTTPS反向代理，限制直接存取、請求大小和頻率。確認 `/health` 回傳 `{"ok":true}`，POST `/romaji` 回傳讀音陣列，再設定HTTPS根URL。請求可能包含地名、公告和避難場所地址，應減少本文紀錄。故障時本機字典及假名轉換仍可使用。

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. 建置 Android 與 iOS

在Expo dashboard建立自己的專案，將UUID填入 `EAS_PROJECT_ID`。首次建置前決定兩平台ID；fork請改 `app.config.js` 名稱、slug及scheme。`eas.json` 提供 `preview`（Android APK/iOS ad hoc）、`simulator`（iOS模擬器）與 `production`（Android AAB/iOS商店）。在Expo的preview及production環境各設定表中已填的變數；Git忽略的 `.env` 不會自動上傳。這些都是公開設定，不可放秘密。修改後重啟Metro或重新建置。

先登入再選擇所需命令。EAS提供下載連結；iOS ad hoc需要 `npx eas-cli device:create` 登記裝置及Apple簽署。模擬器版本不能裝到iPhone。具備本機工具鏈時可加 `--local`。

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. 提交應用程式商店

建置production後提交平台。簽署交由EAS管理，金鑰勿進Git。Google Play使用AAB，iOS送至App Store Connect/TestFlight；提交不等於公開發行。先完成說明、圖示、截圖、隱私權政策、資料揭露及實機測試，再申請審查。App Store Connect應用ID與Google服務帳號金鑰應在自己的發行帳號中管理。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. 驗證

執行下列檢查，並以兩平台實機驗證：13語言、日本語標籤、發布/發生時間、其他時區的日本午夜、明暗/高對比、200%字體、VoiceOver/TalkBack及彈出視窗焦點、減少動態效果、拒絕定位、斷網、來源標示與圖例。JS匯出成功不代表原生驗證或Apple核准。參閱[UI檢查](../UI_DESIGN.md)。

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. 更新與回復

記錄已驗證commit及建置號。更新 `app.config.js` version；EAS自動增加production建置號。尚無EAS Update，須發行新原生版本。Worker重新部署穩定commit或Cloudflare回復；Romaji重啟舊版。商店應用無法靜默降版，應以更高建置號重新封裝穩定程式碼。監控端點、地圖額度與來源。

## 10. 參考資料

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
