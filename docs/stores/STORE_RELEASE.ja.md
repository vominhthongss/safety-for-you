# Google Play・App Store 公開手順

本書は Safety For You（Expo SDK 58）の公開手順です。無料・非営利・独立した防災情報アプリであり、気象庁、J-Alert、自治体の指示や緊急放送に代わるものではありません。ストア審査の承認は保証されません。

## 1. 前提条件と事前確認

Node.js 22以上、対応するExpo環境、Expoアカウント、Google PlayとAppleの各開発者アカウントを準備します。現時点でリポジトリにnpmロックファイルと`eas.json`はありません。以下の検証コマンドはJavaScript側の確認であり、ネイティブアプリの実機検証ではありません。

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. EAS・識別子・署名の設定

初回公開前に`.env`の`ANDROID_PACKAGE`と`IOS_BUNDLE_ID`を管理可能な固有の値に設定します。`app.config.js`が参照する値とストア登録情報を一致させてください。公開後の変更は別アプリ扱いになる可能性があります。`build:configure`で`eas.json`を生成し、Expoプロジェクトとの関連付けを確認します。

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — 設定例（生成後に確認）:

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

例ではEAS側でビルド番号を管理し、自動更新します。`app.config.js`の`expo.version`も公開バージョンに合わせます。同一アプリでAndroidのversionCodeまたはiOSのbuildNumberを再利用しないでください。署名情報とアップロード鍵は安全に保管し、Gitに登録しません。

EASのproduction環境にビルド時の変数を設定します。`EXPO_PUBLIC_*`は配布アプリから参照できるため、秘密情報を設定してはいけません。JMA Workerとローマ字サービスは任意で、未設定時の案内表示を維持します。

## 3. Google Play：Android App Bundle（AAB）

Play Consoleに登録し、アプリを作成して正しいAndroidパッケージIDを登録します。ストア情報を整備し、Play App Signingを有効にします。Googleが管理するアプリ署名鍵とEASで使うアップロード鍵は別です。鍵をリポジトリに含めないでください。

production向けAABをビルドします。初回はPlay Consoleから手動アップロードできます。Google Play APIとサービスアカウントの権限を安全に設定するとExpo Submitでも送信可能です。アップロードだけでは一般公開されません。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

まずInternal testingまたはClosed testingで配布し、クラッシュ、位置情報許可、地図、通信障害を確認します。2023年11月13日以降に作成した個人開発者アカウントでは、12人以上が14日連続で参加するクローズドテストと本番公開権限の承認が求められる場合があります。自身のPlay Consoleで要件を確認してください。

Data safety、アプリ内とストア上のプライバシーポリシーURL、年齢区分、対象ユーザー、アプリへのアクセス、スクリーンショット、連絡先、位置情報権限を申告します。完成したAABのtarget APIが最新要件（2026年11月時点の新規スマートフォンアプリはAPI 36）を満たすか確認します。

## 4. App Store：署名済みiOSアーカイブ（IPA）

Apple Developer Programに参加し、同一Bundle IDのApp IDとApp Store Connectのアプリを作成します。EASで配布証明書とプロビジョニングプロファイルを管理し、正しいApple Teamに紐付いていることを確認します。

署名済みIPAをビルドしてApp Store Connectにアップロードし、TestFlightで実機テストを行います。Expo Submitはアップロードを行うだけで、公開は自動的には完了しません。

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

App Store ConnectでApp Privacy、動作するプライバシーポリシーURL、サポート先、正確な説明、年齢区分、指定サイズのiPhoneおよび必要なiPad用スクリーンショット（`supportsTablet: true`）、審査メモ、必要に応じてテスト用アカウントを設定します。ビルドを選択して審査提出し、承認後に公開します。

## 5. 安全性と公開前ゲート

iOSのApple MapsとAndroidのLeafletを実機で検証します。13言語、文字拡大、読み上げ、位置情報の許可・拒否、古い情報や欠損情報、オフライン状態、地図の帰属表示を確認してください。速報のリアルタイム配信、見出しだけからの現行警報判定、津波伝播のシミュレーション、避難施設の開設状況を保証してはいけません。

**災害警報と通知:** 通知の許可は、利用者が警報音のスイッチをオンにした後にのみ要求します。プライバシーに関する回答で警報のための端末内での位置情報利用を開示し、警報画面・振動・通知音を実機で確認し、警報はアプリを開いている間のみ動作し国の緊急速報の代わりにならないことをストア情報に明記してください。

**現状の未完了事項：`eas.json`、ストア掲載用画像・スクリーンショットとプライバシーポリシーURLの整備、署名済み実機ビルドの検証、ストア審査結果。公開前に別途対応してください。**

## 6. 更新と運用

更新時には公開バージョンとビルド番号を増やし、実機再検証、段階公開、クラッシュ監視、データ提供元の利用条件確認、プライバシー申告の更新を行います。情報源に障害がある場合は劣化状態を明示し、公的な警報経路へ案内してください。

## 公式参考資料

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[デプロイ概要](../deploy/DEPLOY.ja.md) · [ドキュメント一覧](../README.md)
