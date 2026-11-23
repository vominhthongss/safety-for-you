# Safety For You — 项目介绍与部署指南

[架构决策记录](ADR.md) · [🌐](../README.md)

## 1. 项目与开源许可

Safety For You 是面向日本居民和游客的免费、非营利移动应用，汇集地震、海啸、近期天气公告、地图和指定紧急避难场所。项目独立运营，并非政府官方服务。仅在前台更新，没有后台紧急推送或离线安全保证。

原创代码和文档采用 [MIT 许可](../../LICENSE)，保留版权与许可声明即可使用、修改、再分发或销售；非营利目标不限制商业分支，软件不提供担保。地图、数据和依赖遵守[第三方条款](../../THIRD_PARTY_NOTICES.md)。贡献流程为 fork、创建分支、验证、提交 PR；不要提交凭据或签名密钥。

## 2. 环境要求

需要 Node.js 22+、npm、Git 和兼容 SDK 58 的 Expo Go。本地 iOS 构建需要 macOS/Xcode；Android 需要适配的 SDK/JDK。云构建使用 Expo 账户，商店发布需要自己的 Apple Developer / Google Play Console 账户，无需数据库或 Google Maps 密钥。

## 3. 本地运行

在仓库根目录执行命令，已有 `.env` 时不要覆盖。填写下表后用 Expo Go 扫码。安装过程自动打包 Leaflet，缺少生成文件时执行 `npm run bundle:maps`。应用有13种语言选项；日/英/越以外的部分旧界面仍回退到英语。

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| 变量 | 含义 |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | 启动等待时间：0–600毫秒。 |
| `EXPO_PUBLIC_REFRESH_SECONDS` | 前台刷新秒数，至少60，默认120。 |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker HTTPS基础URL，不含 /hazards；留空禁用天气源。 |
| `EXPO_PUBLIC_ROMAJI_API_URL` | 罗马字服务HTTPS基础URL，不含 /romaji；留空仅使用本地读音。 |
| `ANDROID_PACKAGE` | 自己的Android应用ID。 |
| `IOS_BUNDLE_ID` | 自己的iOS Bundle ID。 |
| `EAS_PROJECT_ID` | Expo项目UUID；Expo Go可留空，EAS需要关联自己的项目。 |

## 4. 可选 JMA Worker

在 `wrangler.toml` 设置唯一名称，登录自己的Cloudflare账户并从根目录部署。将示例域名换成Wrangler返回的地址。`/hazards` 应返回含 `items` 和 `kind` 的JSON；`degraded: true` 表示部分上游失败。将基础URL写入 `.env`。Worker仅分类JMA Atom标题，不确认当前有效警报或天气测量值。

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. 可选罗马字服务

在VPS的另一个终端启动。生产环境用systemd、容器或托管进程管理器，端口3088前设置HTTPS反向代理，限制直接访问、请求大小和频率。检查 `/health` 返回 `{"ok":true}`，POST `/romaji` 返回读音数组，再设置HTTPS基础URL。请求可能包含地名、公告和避难场所地址，应减少正文日志。失败时仍保留本地词典和假名转换。

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. 构建 Android 和 iOS

在Expo dashboard创建自己的项目，将UUID填入 `EAS_PROJECT_ID`。首次构建前选定两个应用ID；fork时修改 `app.config.js` 的名称、slug、scheme。`eas.json` 提供 `preview`（Android APK / iOS ad hoc）、`simulator`（iOS模拟器）、`production`（Android AAB / iOS商店）。在Expo的 `preview` 和 `production` 环境中分别配置表中已填写的变量；Git忽略的 `.env` 不会自动上传。所有这些值都是公开配置，不可存放秘密。修改后重启Metro或重新构建。

先登录，再选择需要的构建命令。EAS返回下载链接；iOS ad hoc需要 `npx eas-cli device:create` 注册设备和Apple签名。模拟器包不能安装到iPhone。具备本地工具链时可追加 `--local`。

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. 提交应用商店

构建production后提交对应平台。通过EAS管理签名，密钥不要进入Git。Google Play使用AAB，iOS提交至App Store Connect/TestFlight；提交不会自动公开发布。先完成描述、图标、截图、隐私政策、数据披露和真机测试，再请求审核。App Store Connect应用ID及Google服务账户密钥在自己的发布账户中管理。

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. 验证

执行下列检查，再用两平台真机验证：13语言、日本語标签、发布/发生时间、其他时区下的日本午夜、深浅色和高对比度、200%字体、VoiceOver/TalkBack及弹层焦点、减少动态效果、拒绝定位、断网、来源标注和颜色图例。JS导出成功不代表原生验证或Apple批准。参阅[UI检查](../UI_DESIGN.md)。

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. 更新与回退

记录已验证commit和构建号。修改 `app.config.js` 版本；EAS自动增加production构建号。尚未配置EAS Update，修改需发布新原生版本。Worker重新部署稳定commit或使用Cloudflare回退；Romaji重启旧版。商店应用无法静默降级，应以更高构建号重新打包稳定源码。监控端点、地图额度与数据源。

## 10. 参考资料

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
