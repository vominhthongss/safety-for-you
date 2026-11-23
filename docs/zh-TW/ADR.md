# Safety For You — 架構決策紀錄

已採用 · 2026-11-23 · 對應此分支程式碼

[專案介紹與部署指南](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo與內建地圖

**背景:** 兩平台須支援SDK 58 Expo Go。

**決策:** 採JavaScript、Expo 58/RN 0.88及WebView中的Leaflet 1.9.4；npm安裝時封裝並載入OSM Japan英文底圖。

**影響:** 無須MapLibre原生擴充；圖磚仍須網路、來源標示、容量規劃及實機驗證。


## ADR-002 — 有來源的災害資訊

**背景:** 規模、震度和海嘯等級不同，舊公告不等於現行警報。

**決策:** 正規化P2PQuake 551/552/556，保留發布/發生時間，顏色依公表震度或等級，只匹配確認的JMA區域。

**影響:** Worker僅近期標題；不推測測量、位置或效力。區域不是波傳或淹水模擬；保留文字等級和官方連結。


## ADR-003 — 前景更新

**背景:** 沒有受監控的推播設施。

**決策:** 前景REST至少60秒、WebSocket重連、背景停止；偏好存AsyncStorage，操作後請求位置。

**影響:** 不保證背景緊急通知與時效。可重用已授權位置，拒絕仍可閱讀資訊。


## ADR-004 — 語言與讀音

**背景:** 地名需要保留原文以辨識。

**決策:** 13語言i18n及英語回退；語言名稱僅顯示日本語，其餘日文標籤保留羅馬字。採字典/假名與選用Kuroshiro。

**影響:** 文件涵蓋13語言，ja/en/vi外舊介面部分翻譯；不猜未知讀音，羅馬字不是安全資訊翻譯。


## ADR-005 — 日本時間與無障礙

**背景:** 時差和放大文字可能導致誤讀與遮擋。

**決策:** 無時區字串按JST、ISO保留偏移，以Asia/Tokyo判定今天並保留完整日期/JST，每分鐘及回前景更新。採獨立時間色、44pt觸控、可縮放字體、彈窗焦點及減少動畫。

**影響:** 發布與發生時間分開，圖例置於地圖下。Apple HIG實作不等於審查通過或無障礙認證。


## ADR-006 — 選用服務

**背景:** JMA標題和罕見漢字需要伺服器處理。

**決策:** Worker與Node羅馬字服務分開部署，HTTPS根URL透過EXPO_PUBLIC設定，外部文字不作可執行HTML。

**影響:** 公開快取須監控，羅馬字須限流；設定嵌入應用，提供者收到網路資訊、地圖請求和選用轉換本文。


## ADR-007 — MIT與發行

**背景:** 需要明確的再利用權利及發行路徑。

**決策:** 原創程式/文件採MIT，保留第三方條款；EAS分preview/simulator/production，金鑰留在Git外。

**影響:** 商業fork須保留聲明。營運者自備託管及商店帳號，無OTA或官方背書。

## 參考資料

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
