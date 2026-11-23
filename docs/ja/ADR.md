# Safety For You — アーキテクチャ決定記録

採用済み · 2026-11-23 · このブランチの実装を記録

[紹介とデプロイ手順](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expoと同梱地図

**背景:** Expo Go SDK 58で両OSの地図を動作させる必要がある。

**決定:** JavaScript、Expo 58/RN 0.88、WebView内のLeaflet 1.9.4を採用。npm install時に同梱しOSM Japan英語タイルを取得する。

**結果:** MapLibreの追加ネイティブビルドは不要。タイルの通信、出典表示、利用条件と実機確認は必要。


## ADR-002 — 根拠のある災害情報

**背景:** M、震度、津波区分は別物であり、過去情報は現在の警報ではない。

**決定:** P2PQuake 551/552/556を正規化し、発表/発生時刻と公表された区分を保持する。確認できる地域だけJMA形状に対応させる。

**結果:** Workerは最近の見出しのみ。欠測、位置、現在の有効性を推測しない。色付き区域は波の伝播や浸水予測ではなく、原文リンクと文字ラベルを併記する。


## ADR-003 — 表示中の更新

**背景:** 監視されたプッシュ配信基盤はない。

**決定:** 60秒以上のREST間隔と再接続付きWebSocketを使用し、背景では停止する。言語/外観はAsyncStorageに保存。位置は操作後に要求する。

**結果:** 背景の緊急通知や配信時間を保証しない。既存の位置許可は再利用でき、拒否しても情報を読める。


## ADR-004 — 13言語と読み

**背景:** 地名を認識できるよう原文が必要。

**決定:** i18nと英語フォールバックを使用。言語名は日本語だけを表示し、他の日本語ラベルには読みを維持。辞書/仮名と任意のKuroshiroを併用する。

**結果:** 文書は13言語。ja/en/vi以外の既存UIは部分翻訳。未知の漢字は推測せず、ローマ字は安全情報の翻訳と区別する。


## ADR-005 — 日本時間とUI

**背景:** 端末の時差や大きな文字で誤読・重なりが起こり得る。

**決定:** オフセットのない時刻はJST、ISOは指定オフセットで解釈し、Asia/Tokyoで今日を判定。完全な日付/JSTと色を表示し毎分と復帰時に更新。44pt、拡大文字、フォーカス、動きの低減を採用。

**結果:** 発表/発生時刻を区別し、凡例は地図の下へ配置する。Apple HIGに沿う実装であり、審査やアクセシビリティ認証を意味しない。


## ADR-006 — 任意サービス

**背景:** 見出し取得と難しい漢字の変換はサーバー処理が必要。

**決定:** WorkerはCloudflare、RomajiはNodeで別運用。HTTPSをEXPO_PUBLICで設定し、外部文字列は実行可能HTMLにしない。

**結果:** 公開キャッシュとサービス監視が必要。変数はアプリ内に埋め込まれ、提供者には通信情報、タイル要求、任意の変換文が渡る。


## ADR-007 — MITと配布

**背景:** 再利用権と配布経路を明確にする必要がある。

**決定:** 独自コード/文書はMIT、外部条件は維持。EASのpreview/simulator/productionを分け鍵をGit外で保管する。

**結果:** 商用フォークも表示条件を守る。運営費、ストアと認証は各運営者の責任で、OTA配信や公的認定はない。

## 参考資料

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
