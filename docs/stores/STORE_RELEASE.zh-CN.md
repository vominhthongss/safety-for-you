# 发布到 Google Play 与 Apple App Store

本指南适用于 Safety For You（Expo SDK 58）。这是一款免费、非营利、独立的日本灾害信息应用，不能代替 JMA、J-Alert、地方政府指示或紧急广播。商店审核通过并无保证。

## 1. 准备与检查

准备 Node.js 22+、匹配的 Expo 环境、Expo 账户以及 Google Play 和 Apple 开发者账户。当前仓库没有 npm 锁文件或 `eas.json`。以下命令仅检查 JavaScript 项目，不等于原生应用已经通过验证。

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. 配置 EAS、标识符与签名

首次发布前，在 `.env` 中设定由发布者控制的唯一 `ANDROID_PACKAGE` 和 `IOS_BUNDLE_ID`，并确保它们与 `app.config.js` 和商店登记信息一致。发布后修改可能导致被视为另一个应用。执行 `build:configure` 创建 `eas.json` 并关联 Expo 项目，检查生成的配置。

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — 配置示例（生成后检查）:

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

示例由 EAS 管理并自动递增构建号。同步更新 `app.config.js` 中的 `expo.version`，不得重复使用 Android versionCode 或 iOS buildNumber。签名密钥与上传证书应妥善保管，不能提交到 Git。

在 EAS production 环境配置构建变量。`EXPO_PUBLIC_*` 会包含在客户端应用中，不得存储机密。JMA Worker 和罗马字服务均为可选；未配置时保留明确的不可用提示。

## 3. Google Play：Android App Bundle（AAB）

注册 Play Console、创建应用、填写正确的 Android 包名，完善商店信息并启用 Play App Signing。Google 管理的应用签名密钥与 EAS 使用的上传密钥不同，应安全保存上传密钥。

生成 production AAB。首次上传可在 Play Console 手动进行；配置安全的服务账户和 Google Play API 权限后，可使用 Expo Submit。上传成功不代表已经公开发布。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

先通过 Internal testing 或 Closed testing 测试崩溃、定位权限、地图和断网情况。2023 年 11 月 13 日后创建的个人开发者账户可能需要至少 12 名测试者连续参与 14 天，并申请生产发布权限。以当前 Play Console 要求为准。

完成 Data safety、商店及应用内隐私政策链接、内容分级、目标人群、应用访问方式、截图、联系方式和权限声明。检查最终 AAB 的 target API 满足要求（截至 2026 年 11 月，新手机应用为 API 36），不能根据 JavaScript 导出结果推断。

## 4. App Store：已签名 iOS 安装包（IPA）

加入 Apple Developer Program，创建 App ID 和使用相同 Bundle ID 的 App Store Connect 应用。通过 EAS 配置分发证书和描述文件，并核对正确的 Apple 团队。

生成已签名 IPA 并上传 App Store Connect，通过 TestFlight 在真机测试。Expo Submit 只负责上传，不会自动公开发布。

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

在 App Store Connect 填写 App Privacy、可访问的隐私政策和支持链接、准确描述、年龄分级、指定规格的 iPhone 截图及必要的 iPad 截图（`supportsTablet: true`）、审核备注和必要的测试账户。选择构建版本提交 App Review，获批后再发布。

## 5. 安全与发布检查

分别在真实 iOS 和 Android 设备检查 Apple Maps 与 Leaflet、13 种语言、辅助功能、定位授权与拒绝、旧或缺失的公告、离线状态和地图来源标注。不得宣称具备官方实时紧急通知、仅由 JMA 标题判断现行警报、模拟海啸传播或保证避难所开放。

**当前尚需完成：创建 `eas.json`，准备商店图标、截图及隐私政策链接，验证签名后的真机版本，并完成商店审核。这些工作不能由文档变更替代。**

## 6. 版本更新与维护

每次更新递增版本和构建号，重新进行真机测试，按平台能力分阶段发布，监控崩溃、数据源政策和隐私披露。信息源故障时应明确提示，并引导用户使用官方应急渠道。

## 官方参考资料

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[部署概览](../deploy/DEPLOY.zh-CN.md) · [文档目录](../README.md)
