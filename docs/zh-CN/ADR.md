# Safety For You — 架构决策记录

已采纳 · 2026-11-23 · 对应本分支代码

[项目介绍与部署指南](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo与内置地图

**背景:** 两平台必须兼容SDK 58 Expo Go。

**决策:** 采用JavaScript、Expo 58/RN 0.88及WebView内的Leaflet 1.9.4；npm安装时打包，加载OSM Japan英文底图。

**影响:** 无需MapLibre原生扩展；地图仍需联网、署名和服务容量，必须真机验证。


## ADR-002 — 基于来源的灾害信息

**背景:** 震级、震度和海啸等级不同，历史公告不等于当前警报。

**决策:** 规范化P2PQuake 551/552/556，保留发布/发生时间；颜色采用公布震度或等级，仅匹配已确认JMA区域。

**影响:** Worker只提供近期标题；不推测测量值、坐标或有效状态。区域不代表波传播或淹没模拟；文字等级和官方链接保留。


## ADR-003 — 前台刷新

**背景:** 没有受监控的推送基础设施。

**决策:** 前台REST间隔至少60秒，WebSocket断线重连，后台停止；偏好保存到AsyncStorage，用户操作后请求位置。

**影响:** 不保证后台通知与时效；可复用已授权位置，拒绝后仍能阅读信息。


## ADR-004 — 语言与读音

**背景:** 需要识别原始地名。

**决策:** 13语言通过i18n及英语回退；语言名显示日本語，其他日语标签保留罗马字。词典/假名及可选Kuroshiro处理动态文本。

**影响:** 文档覆盖13种语言；ja/en/vi外的旧UI仅部分翻译。不猜未知读音，罗马字不是安全信息翻译。


## ADR-005 — 日本时间与无障碍

**背景:** 时区差异和大字体会造成误读或遮挡。

**决策:** 无时区时间按JST，ISO保留偏移；以Asia/Tokyo判断今天并保留完整日期/JST，每分钟和恢复前台时更新。使用独立时间颜色、44pt触控、字体缩放、弹层焦点和减少动画。

**影响:** 发布与发生时间分开；图例放在地图下。遵循Apple HIG不等于审核通过或无障碍认证。


## ADR-006 — 可选服务

**背景:** JMA标题和罕见汉字需要服务端处理。

**决策:** Cloudflare Worker与Node罗马字服务分开部署；HTTPS URL使用EXPO_PUBLIC，外部标签作为文本而非可执行HTML。

**影响:** 公开缓存需监控，罗马字服务需限流；配置嵌入应用，提供者会收到网络信息、地图请求及可选转换文本。


## ADR-007 — MIT与发布

**背景:** 需要明确复用权利和发布路径。

**决策:** 原创代码/文档采用MIT，保留外部条款；EAS分preview/simulator/production，签名留在Git外。

**影响:** 允许保留声明的商业fork；运营者自备托管与商店账户，无OTA或官方背书。

## 参考资料

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
