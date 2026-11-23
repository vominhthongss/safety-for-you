# Safety For You — 紹介とデプロイ手順

[アーキテクチャ決定記録](ADR.md) · [🌐](../README.md)

## 1. プロジェクトとオープンソース

Safety For You は、日本で暮らす人や旅行者向けの無料・非営利の防災情報アプリです。地震・津波情報、最近の気象情報、地図、指定緊急避難場所をまとめます。政府の公式アプリではありません。更新はアプリの表示中に行われ、バックグラウンドの緊急プッシュ通知やオフライン利用は保証しません。

独自のコードと文書は [MIT](../../LICENSE) で公開しています。著作権表示と許諾文を残せば、利用、変更、再配布、販売ができます。非営利という目的は商用フォークを禁止しません。無保証です。外部データ、地図、依存ライブラリには[各提供者の条件](../../THIRD_PARTY_NOTICES.md)が適用されます。貢献する場合はフォーク、ブランチ作成、検証、PR提出の順に進め、認証情報や署名鍵をコミットしないでください。

## 2. 必要な環境

Node.js 22以上、npm、Git、SDK 58対応のExpo Goを用意します。ローカルiOSビルドにはmacOS/Xcode、Androidには対応するAndroid SDK/JDKが必要です。クラウドビルドはExpoアカウント、ストア配布は自身のApple DeveloperまたはGoogle Play Consoleアカウントを使用します。DBやGoogle Mapsキーは不要です。

## 3. ローカル起動

リポジトリのルートで実行します。既存の `.env` は上書きせず、下表を設定してください。Expo GoでQRコードを読み取ります。インストール時にLeafletを同梱します。生成ファイルがない場合は `npm run bundle:maps` を実行します。言語選択は13種類ですが、日本語・英語・ベトナム語以外の既存UIには英語へのフォールバックがあります。

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| 変数 | 意味 |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | 起動時の任意の待機時間、0〜600ms。 |
| `EXPO_PUBLIC_REFRESH_SECONDS` | 表示中の更新間隔。最小60秒、標準120秒。 |
| `EXPO_PUBLIC_JMA_PROXY_URL` | WorkerのHTTPSベースURL。/hazardsは付けません。空欄は気象配信を無効化。 |
| `EXPO_PUBLIC_ROMAJI_API_URL` | ローマ字サービスのHTTPSベースURL。/romajiは付けません。空欄はローカル読みのみ。 |
| `ANDROID_PACKAGE` | 自身のAndroidアプリID。 |
| `IOS_BUNDLE_ID` | 自身のiOS Bundle ID。 |
| `EAS_PROJECT_ID` | ExpoプロジェクトUUID。Expo Goでは省略可能、EASでは自身のプロジェクトを指定。 |

## 4. 任意のJMA Worker

`wrangler.toml` に固有のWorker名を設定し、ルートからCloudflareにログインしてデプロイします。例のホスト名を返されたURLに置き換えます。`/hazards` のJSONに `items` と `kind` があることを確認します。`degraded: true` は一部配信元の失敗を表します。ベースURLを `.env` に記入します。このWorkerはJMA Atomの見出しを分類するだけで、警報の現在の有効性や観測値は確認しません。

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. 任意のローマ字サービス

VPSの別ターミナルで起動します。本番ではsystemd、コンテナ等でプロセスを管理し、3088番ポートの前にHTTPSリバースプロキシを設置します。直接アクセスを制限し、レートとリクエストサイズを制限します。`/health` の `{"ok":true}` と `/romaji` の読み配列を確認し、HTTPSベースURLを設定します。地名、本文、避難場所の住所が送信される場合があるため本文ログは最小限にします。障害時もローカル辞書・仮名変換は残ります。

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Android・iOSのビルド

Expo dashboardで自身のプロジェクトを作成し、UUIDを `EAS_PROJECT_ID` に記入します。初回ビルド前に両OSのIDを決め、フォーク時は `app.config.js` の名前・slug・schemeを変更します。`eas.json` の `preview` はAndroid APK/iOS ad hoc、`simulator` はiOS Simulator、`production` はAndroid AAB/iOSストア用です。Expo設定で、表の設定済み変数を `preview` と `production` 両方に登録してください。Git対象外の `.env` はクラウドに自動転送されません。これらは公開設定で、秘密を入れてはいけません。変更後はMetroを再起動するか再ビルドします。

最初にログインし、必要なビルドコマンドを選びます。EASがダウンロードURLを返します。iOS ad hocには `npx eas-cli device:create` による端末登録とApple署名が必要です。Simulator版はiPhoneに入りません。対応ツールを備えたローカル環境では `--local` を追加できます。

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. ストアへの提出

productionをビルド後、対象OSを提出します。EASで署名を管理し、鍵をGitに含めません。Google PlayはAAB、iOSはApp Store Connect/TestFlightへ提出します。提出だけでは公開されません。説明、アイコン、スクリーンショット、プライバシーポリシー、データ申告と実機試験を終えて審査を依頼します。必要なApp Store ConnectのアプリIDやGoogleサービスアカウント鍵は、自身の配布アカウントで管理します。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. 検証

下記の検証後、両OSの実機で13言語、日本語の言語名、発表/発生時刻、他タイムゾーンから見た日本の深夜、明暗・高コントラスト、文字200%、VoiceOver/TalkBackとモーダルのフォーカス、視差効果の低減、位置拒否、通信断、出典と凡例を確認します。JSのexport成功はネイティブ試験やApple承認ではありません。[UI監査](../UI_DESIGN.md)も参照してください。

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. 更新と復旧

検証済みcommitとビルド番号を記録します。`app.config.js` のversionを更新すると、本番のビルド番号はEASで自動加算されます。EAS Updateは未設定なので変更は新しいネイティブビルドで配布します。Workerは安定commitの再デプロイまたはCloudflare rollback、Romajiは旧版の再起動で復旧します。ストア版は自動で旧版に戻せないため、旧ソースをより大きな番号で再ビルドします。エンドポイントと配信元の制限を監視します。

## 10. 参考資料

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
