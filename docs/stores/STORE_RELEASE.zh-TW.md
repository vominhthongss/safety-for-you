# 發佈至 Google Play 與 Apple App Store

本指南適用於 Safety For You（Expo SDK 58）。本應用為免費、非營利且獨立的日本防災資訊工具，不能取代 JMA、J-Alert、地方政府指示或緊急廣播。商店審核通過並無保證。

## 1. 準備與檢查

準備 Node.js 22+、相容的 Expo 環境、Expo 帳戶以及 Google Play 與 Apple 開發者帳戶。儲存庫已包含 `package-lock.json` 與 `eas.json`（`preview` 與 `production` 設定檔）。以下指令只檢查 JavaScript 專案，不代表原生版本已驗證。

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. 設定 EAS、識別碼及簽章

首次發佈前，在 `.env` 設定由發佈者管理的唯一 `ANDROID_PACKAGE` 與 `IOS_BUNDLE_ID`，確保其符合 `app.config.js` 及商店登錄資料。發佈後修改可能導致被視為不同應用。執行 `build:configure` 產生 `eas.json` 並連結 Expo 專案，確認內容。

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — 設定範例（產生後檢查）:

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "base": {
      "env": {}
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "extends": "base",
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

**EAS 專案 ID：** `app.config.js` 為動態設定，`eas init` 無法寫入 `extra.eas.projectId`，並會以 "Cannot automatically write to dynamic config" 停止。請執行 `npx eas-cli init`，複製輸出的專案 ID，並在 `eas.json` 的 `base` 設定檔中設定 `"env": { "EAS_PROJECT_ID": "<project-id>" }`。`app.config.js` 會將此值寫入 `extra.eas.projectId`。專案 ID 是識別碼而非機密；請勿在 `eas.json` 中放置憑證。 本儲存庫的 `app.config.js` 已包含 `@vominhthongss/safety-for-you` 的專案 ID 並設定 `owner`；僅當分支專案連結至其他 EAS 專案時，才需要在 `eas.json` 中設定。

範例由 EAS 管理並自動遞增建置編號。同步更新 `app.config.js` 的 `expo.version`，不可重複使用 Android versionCode 或 iOS buildNumber。妥善保護上傳金鑰與簽章憑證，切勿提交至 Git。

在 EAS production 環境設定建置變數。`EXPO_PUBLIC_*` 會包含在客戶端程式，不能存放機密。JMA Worker 與羅馬字服務均屬選用；未設定時應保留明確的不可用狀態。

## 3. Google Play：Android App Bundle（AAB）

註冊 Play Console、建立應用、輸入正確 Android 套件名稱、完成商店資訊並啟用 Play App Signing。Google 管理的應用簽章金鑰與 EAS 使用的上傳金鑰不同，須妥善保管。

建立 production AAB。首次可透過 Play Console 手動上傳；安全設定服務帳戶及 Google Play API 權限後可使用 Expo Submit。上傳成功不代表已公開上架。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

先透過 Internal testing 或 Closed testing 檢查當機、定位授權、地圖與斷線情況。2023 年 11 月 13 日後建立的個人開發者帳戶可能須有至少 12 位測試者連續參與 14 天，並取得正式發佈權限。以 Play Console 顯示的條件為準。

完成 Data safety、商店及應用內的隱私權政策連結、內容分級、目標對象、應用存取方式、截圖、聯絡資料與權限說明。確認完成的 AAB 符合 target API 規定（截至 2026 年 11 月，新手機應用為 API 36），不可單憑 JavaScript 匯出結果推定。

## 4. App Store：已簽署 iOS 套件（IPA）

加入 Apple Developer Program，建立 App ID 及使用同一 Bundle ID 的 App Store Connect 應用。透過 EAS 設定發佈憑證和描述檔，確認正確的 Apple 團隊。

建置已簽署 IPA 並上傳 App Store Connect，先經 TestFlight 在實機測試。Expo Submit 只上傳套件，不會自動公開發佈。

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

在 App Store Connect 提供 App Privacy、有效的隱私權政策與支援網址、正確說明、年齡分級、符合規格的 iPhone 及必要的 iPad 截圖（`supportsTablet: true`）、審核備註與必要測試帳號。選取建置版本提交 App Review，獲准後再上架。

## 5. 安全與發佈檢查

在真實 iOS 與 Android 裝置分別測試 Apple Maps 與 Leaflet、13 種語言、輔助使用、定位授權或拒絕、過期或缺漏公告、離線狀態和地圖來源標註。不得宣稱官方即時緊急通知、僅憑 JMA 標題判斷現行警報、模擬海嘯傳播或保證避難場所開放。

**災害警報與通知：** 應用程式僅在使用者開啟警報聲開關後才要求通知權限。請在隱私問卷中揭露為警報在裝置端使用位置資訊，在實體裝置上驗證警報畫面、震動與通知聲音，並在商店資訊中說明警報僅在應用程式開啟時有效，不能取代日本官方的緊急警報。

**目前尚待完成：準備商店圖示及截圖與隱私權政策網址、驗證已簽署實機版本，以及完成商店審核。文件更新無法取代上述事項。**

## 6. 更新與維護

每次更新提高版本及建置編號，重新實機測試，視情況分階段上架，監控錯誤與資料供應商條款，必要時更新隱私揭露。資料來源中斷時應顯示明確狀態，並引導至官方緊急資訊渠道。

## 官方參考資料

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[部署總覽](../deploy/DEPLOY.zh-TW.md) · [文件目錄](../README.md)
