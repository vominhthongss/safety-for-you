# 部署指南 — Safety For You (简体中文)

Safety For You 是服务于日本灾害信息的免费、非营利、开源应用，源代码采用 MIT 许可证。它不能取代 JMA、J-Alert 或地方政府的指示。

## 环境准备

准备 Node.js 22+ 及兼容 SDK 58 的 Expo Go。本仓库没有 lockfile，请使用 npm install 安装依赖。

## 本地运行

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: 刷新间隔（秒，至少60秒）。
- `EXPO_PUBLIC_JMA_PROXY_URL`: 可选的JMA标题Cloudflare Worker地址。
- `EXPO_PUBLIC_ROMAJI_API_URL`: 可选的自建Kanji转Romaji服务地址。
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Android/iOS签名构建的固定标识符。
- `EXPO_PUBLIC_*`: 公开变量会包含在客户端中，不得放入机密信息。
- `Leaflet 1.9.4`: `postinstall`生成`src/generated/leafletAssets.js`；地图瓦片仍需联网。

## 可选服务

可选 Cloudflare Worker 在 /hazards 提供近期 JMA 公告标题，并非有效警报。Romaji 服务同样可选；公开部署时须启用 HTTPS 和访问限速。

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

汉字转罗马字服务请参考`romaji-service/README.md`（Node.js 22+、HTTPS代理及速率限制）。未部署时保留空URL；缺少Worker时天气标题可能无法显示。修改`.env`里的Worker地址后重启Expo。

## 商店构建

商店发布需登录 Expo/EAS、配置构建项目，然后生成 Android 和 iOS 生产构建。发布者须自行管理应用标识符。

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

仓库目前没有`eas.json`。先执行一次`build:configure`，检查生成的production配置，再设置签名凭证、商店账户、应用标识和生产环境变量。完整流程见下文。

## 发布检查

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

上架前须准备隐私说明、图标、截图、联系方式、真机与无障碍测试，以及非官方警报免责声明。JavaScript 导出成功不代表通过安全评估或 App Store 审核。

## 开源条款

依照[MIT许可证](../../LICENSE)，在保留实质性副本中版权及许可证声明的前提下，可以使用、修改和重新分发源代码，包括商业用途。第三方库、地图、瓦片和数据源适用各自条款。贡献时必须保留来源标注、事实核查及安全提示。

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.zh-CN.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## 发布到应用商店

请参阅[Google Play和Apple App Store详细发布指南](../stores/STORE_RELEASE.zh-CN.md)，了解签名、测试、隐私声明、商店审核与当前待办事项。
