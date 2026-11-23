# Safety For You

A free, nonprofit mobile app for people living in or visiting Japan. It brings together earthquake and tsunami reports, recent weather bulletins, maps and designated emergency evacuation places. Built with JavaScript, Expo SDK 58 and React Native 0.88 for iOS and Android.

This is an independent community project, not a government service. Follow JMA and local authorities. An empty feed does not mean an area is safe; the app has no background emergency push service or offline safety guarantee.

## Documentation in all 13 app languages

Each language has a project introduction, deployment guide and seven architecture decision records (ADRs):

| Language | Introduction & deployment | ADRs |
| --- | --- | --- |
| 日本語 | [デプロイ手順](docs/ja/DEPLOYMENT.md) | [決定記録](docs/ja/ADR.md) |
| English | [Deployment](docs/en/DEPLOYMENT.md) | [Decisions](docs/en/ADR.md) |
| Tiếng Việt | [Hướng dẫn triển khai](docs/vi/DEPLOYMENT.md) | [Quyết định kiến trúc](docs/vi/ADR.md) |
| 简体中文 | [部署指南](docs/zh-CN/DEPLOYMENT.md) | [决策记录](docs/zh-CN/ADR.md) |
| 繁體中文 | [部署指南](docs/zh-TW/DEPLOYMENT.md) | [決策紀錄](docs/zh-TW/ADR.md) |
| 한국어 | [배포 안내](docs/ko/DEPLOYMENT.md) | [결정 기록](docs/ko/ADR.md) |
| Filipino | [Deployment](docs/tl/DEPLOYMENT.md) | [Mga pasya](docs/tl/ADR.md) |
| नेपाली | [डिप्लोय मार्गदर्शन](docs/ne/DEPLOYMENT.md) | [निर्णय अभिलेख](docs/ne/ADR.md) |
| Bahasa Indonesia | [Penerapan](docs/id/DEPLOYMENT.md) | [Keputusan](docs/id/ADR.md) |
| Português | [Implantação](docs/pt/DEPLOYMENT.md) | [Decisões](docs/pt/ADR.md) |
| မြန်မာ | [လမ်းညွှန်](docs/my/DEPLOYMENT.md) | [ဆုံးဖြတ်ချက်](docs/my/ADR.md) |
| ไทย | [คู่มือ](docs/th/DEPLOYMENT.md) | [การตัดสินใจ](docs/th/ADR.md) |
| हिन्दी | [डिप्लॉय मार्गदर्शिका](docs/hi/DEPLOYMENT.md) | [निर्णय अभिलेख](docs/hi/ADR.md) |

## Run in Expo Go

Use Node.js 22+ and Expo Go compatible with SDK 58:

```bash
npm install
cp .env.example .env
npx expo start --go -c
```

Keep an existing `.env` instead of overwriting it. The map uses bundled Leaflet 1.9.4 in `react-native-webview`; no MapLibre rebuild or Google Maps key is required. If generated assets are missing, run `npm run bundle:maps`.

## Features and data boundaries

- P2PQuake REST and foreground WebSocket supply earthquake/tsunami reports. Magnitude, observed or forecast Shindo, depth, coastal tsunami grade/height and arrival estimates are shown only when published.
- OSM Japan supplies the English-label basemap. GSI supplies hazard-specific designated evacuation locations, which do not guarantee a facility is open. JMA geometry outlines verified observed shaking regions and issued coastal warning areas, not wave propagation or inundation simulations.
- The optional Cloudflare Worker categorizes recent JMA Atom headlines. It does not verify active weather warnings or invent measurements. An unconfigured feed is explicitly identified.
- The optional Node Romaji service supplements local place dictionaries and Kana conversion. Japanese bulletin text remains available; uncertain readings are not guessed.
- Thirteen language choices, saved light/dark preference, location permission after a user action, distinct time colors and localized “Today” based on Japan time. Issue time and earthquake occurrence time remain separate.
- Apple HIG improvements include scalable text, 44pt controls, modal focus, reduced motion and map legends below the map. See the [UI audit](docs/UI_DESIGN.md) for device checks still required. Existing UI translations outside Japanese, English and Vietnamese remain partial with English fallback.

## Build and verify

[eas.json](eas.json) defines Android APK/iOS ad hoc preview, iOS Simulator and production store builds. Follow your language's deployment guide to configure Expo project ownership, environment variables, signing and optional services. This repository is a mobile app; `expo export` produces JavaScript bundles, not a deployed website, APK or IPA.

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

CI runs tests, dependency checking and both exports. Real-device accessibility, WebView, location, connectivity and store review remain separate checks.

## Open source and contributing

Original code and documentation are licensed under [MIT](LICENSE). You may use, modify, redistribute and sell copies while preserving the copyright and permission notice. This project's nonprofit purpose does not restrict commercial forks. The software comes without warranty; no official endorsement is implied.

Dependencies, datasets and map tiles retain their own licenses and service terms; see [third-party notices](THIRD_PARTY_NOTICES.md). Fork the repository, create a branch, describe the behavior change, run the checks, update the corresponding ADR/deployment translations and open a PR. Keep credentials and signing files out of Git. `private: true` in package.json only prevents accidental npm publication; it does not restrict MIT reuse.
