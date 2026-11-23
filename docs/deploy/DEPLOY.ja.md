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

- `EXPO_PUBLIC_REFRESH_SECONDS`: 更新間隔（秒、最小60秒）。
- `EXPO_PUBLIC_JMA_PROXY_URL`: 気象庁の見出しを取得する任意のCloudflare Worker URL。
- `EXPO_PUBLIC_ROMAJI_API_URL`: 任意の自前Kanji→Romaji変換サービスURL。
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: 署名済みAndroid/iOSビルドの固定識別子。
- `EXPO_PUBLIC_*`: 公開変数は配布アプリに組み込まれます。秘密情報を含めないでください。
- `Leaflet 1.9.4`: `postinstall`で`src/generated/leafletAssets.js`を生成します。地図画像の取得にはネット接続が必要です。

## 任意のサービス

Cloudflare Workerは最近の気象庁の見出しを/hazardsで配信します。現在有効な警報ではなく、設定は任意です。ローマ字変換サービスも任意で、公開時はHTTPSとレート制限が必要です。

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

漢字のローマ字化については`romaji-service/README.md`を参照してください（Node.js 22以上、HTTPSプロキシ、レート制限）。サービス未導入時はURLを空欄にします。Workerがない場合、気象見出しは利用できないことがあります。Worker URLを`.env`に設定した後、Expoを再起動します。

## ストア向けビルド

ストア配布にはExpo/EASにログインし、ビルド設定後にAndroid・iOSの本番ビルドを作成します。パッケージ名とBundle IDは配布者が管理してください。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

現時点で`eas.json`は未登録です。`build:configure`を一度実行し、生成されたproduction設定を確認してください。ビルド前に署名情報、ストアアカウント、識別子、環境変数を設定します。詳しい公開手順は以下をご覧ください。

## 公開前の確認

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

公開前にプライバシー情報、アイコン、スクリーンショット、連絡先、実機とアクセシビリティ検証、非公式の防災情報である旨を整備してください。JSエクスポート成功だけでは安全性やApp Store審査合格を保証しません。

## オープンソースの条件

[MITライセンス](../../LICENSE)では、著作権・ライセンス表示を実質的な複製物に保持する条件で、商用を含む利用、変更、再配布が可能です。外部ライブラリ、地図、タイル、データソースにはそれぞれの利用条件が適用されます。貢献時は出典表示、事実確認、安全上の注意を維持してください。

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ja.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## アプリストアへの公開

署名、テスト、プライバシー申告、審査、未対応事項を含む[Google Play・App Store公開ガイド](../stores/STORE_RELEASE.ja.md)を参照してください。
