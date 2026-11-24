# Safety For You — Technical documentation

Safety For You is free, nonprofit, open-source software under the [MIT License](../LICENSE). It provides supplementary disaster information for Japan; it does **not** replace JMA, J-Alert, municipalities, or emergency broadcasts.

Each supported locale has an architecture decision record (ADR), a development/deployment guide, and a dedicated Google Play / Apple App Store publication guide. All guides describe the same source implementation; technical commands and file paths must remain consistent.

| Language | Architecture decision | Deployment | Google Play / App Store |
| --- | --- | --- | --- |
| English (`en`) | [ADR](adr/ADR-0001.en.md) | [Deploy](deploy/DEPLOY.en.md) | [Store release](stores/STORE_RELEASE.en.md) |
| 日本語 (`ja`) | [ADR](adr/ADR-0001.ja.md) | [Deploy](deploy/DEPLOY.ja.md) | [Store release](stores/STORE_RELEASE.ja.md) |
| Tiếng Việt (`vi`) | [ADR](adr/ADR-0001.vi.md) | [Deploy](deploy/DEPLOY.vi.md) | [Store release](stores/STORE_RELEASE.vi.md) |
| 简体中文 (`zh-CN`) | [ADR](adr/ADR-0001.zh-CN.md) | [Deploy](deploy/DEPLOY.zh-CN.md) | [Store release](stores/STORE_RELEASE.zh-CN.md) |
| 繁體中文 (`zh-TW`) | [ADR](adr/ADR-0001.zh-TW.md) | [Deploy](deploy/DEPLOY.zh-TW.md) | [Store release](stores/STORE_RELEASE.zh-TW.md) |
| 한국어 (`ko`) | [ADR](adr/ADR-0001.ko.md) | [Deploy](deploy/DEPLOY.ko.md) | [Store release](stores/STORE_RELEASE.ko.md) |
| Filipino (`tl`) | [ADR](adr/ADR-0001.tl.md) | [Deploy](deploy/DEPLOY.tl.md) | [Store release](stores/STORE_RELEASE.tl.md) |
| नेपाली (`ne`) | [ADR](adr/ADR-0001.ne.md) | [Deploy](deploy/DEPLOY.ne.md) | [Store release](stores/STORE_RELEASE.ne.md) |
| Bahasa Indonesia (`id`) | [ADR](adr/ADR-0001.id.md) | [Deploy](deploy/DEPLOY.id.md) | [Store release](stores/STORE_RELEASE.id.md) |
| Português (`pt`) | [ADR](adr/ADR-0001.pt.md) | [Deploy](deploy/DEPLOY.pt.md) | [Store release](stores/STORE_RELEASE.pt.md) |
| မြန်မာ (`my`) | [ADR](adr/ADR-0001.my.md) | [Deploy](deploy/DEPLOY.my.md) | [Store release](stores/STORE_RELEASE.my.md) |
| ไทย (`th`) | [ADR](adr/ADR-0001.th.md) | [Deploy](deploy/DEPLOY.th.md) | [Store release](stores/STORE_RELEASE.th.md) |
| हिन्दी (`hi`) | [ADR](adr/ADR-0001.hi.md) | [Deploy](deploy/DEPLOY.hi.md) | [Store release](stores/STORE_RELEASE.hi.md) |

## Source of truth and publishing safeguards

- The application source of truth is `App.js`, `src/`, `server/`, `app.config.js`, `package.json`, and `.env.example`.
- Native map providers differ: Apple Maps on iOS; Leaflet/OSM Japan in WebView on Android. Neither a JS export nor an Expo Go test proves signed-store-build compatibility.
- Store guides provide procedures, not proof of successful signing, approval, or a production release. The repository contains `eas.json`, app icons, the splash logo and Google Play listing graphics ([store/README.md](../store/README.md)); store screenshots are still missing, and the [privacy policy](privacy/index.md) must be published (GitHub Pages from `/docs`) before submission.
- Historical or missing bulletins do not establish a current warning state. Do not imply official affiliation, tsunami propagation forecasts, live shelter availability, or verified real-time alerting.
- Avoid committing certificates, upload keystores, service-account files, API tokens or other credentials. Public `EXPO_PUBLIC_*` values are not secrets.

## Release working documents (English)

Practical, English-only checklists for the publisher. They complement the localized store guides above and must stay consistent with them.

| Document | Content |
| --- | --- |
| [RELEASE.md](RELEASE.md) | Ordered steps from configuration to Google Play and App Store release |
| [RELEASE-AUDIT.md](RELEASE-AUDIT.md) | app-store-compliance audit results, verdicts and the publisher checklist |
| [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md) | Data safety, App Privacy, age rating and other console answers |
| [REVIEW-NOTES.md](REVIEW-NOTES.md) | Notes for App Review and Play app access |
| [ADS-A-Z.md](ADS-A-Z.md) | Statement that the app has no ads, related store answers, rules if that ever changes |
| [store_image.md](store_image.md) | Store image status |
| [privacy/](privacy/index.md) | Public privacy policy (English, Japanese, Vietnamese) |

## Maintenance references

- [Documentation style guide](STYLE_GUIDE.md): formal technical writing, 13-language consistency, and review criteria.
- [AI contributor instructions](../AGENTS.md) and [ChatGPT entry point](../CHATGPT.md).
- [Store graphics and remaining publisher tasks](../store/README.md), [privacy declarations](PRIVACY-DECLARATIONS.md), [privacy policy](privacy/index.md).
- [Architecture overview](ARCHITECTURE.md), [iOS UI guidance](UI_DESIGN.md), [MIT License](../LICENSE).
- [Expo deployment documentation](https://docs.expo.dev/deploy/submit-to-app-stores/), [Google Play Console Help](https://support.google.com/googleplay/android-developer/), [Apple App Store Connect Help](https://developer.apple.com/help/app-store-connect/).
