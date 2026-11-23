# Safety For You — Architecture Decision Record & Deployment

Safety For You is **free, nonprofit, open-source software under the MIT license**. It helps foreign residents and others read disaster information in Japan. It is **not** an official warning channel, and never replaces JMA, J-Alert or local instructions.

The ADR is one architectural decision translated into every locale supported by `src/i18n.js`. Deployment guides explain local development, optional services, production builds, permissions and store-readiness limits.

| Language | ADR | Deployment |
| --- | --- | --- |
| English (`en`) | [ADR](adr/ADR-0001.en.md) | [Deploy](deploy/DEPLOY.en.md) |
| 日本語 (`ja`) | [ADR](adr/ADR-0001.ja.md) | [Deploy](deploy/DEPLOY.ja.md) |
| Tiếng Việt (`vi`) | [ADR](adr/ADR-0001.vi.md) | [Deploy](deploy/DEPLOY.vi.md) |
| 简体中文 (`zh-CN`) | [ADR](adr/ADR-0001.zh-CN.md) | [Deploy](deploy/DEPLOY.zh-CN.md) |
| 繁體中文 (`zh-TW`) | [ADR](adr/ADR-0001.zh-TW.md) | [Deploy](deploy/DEPLOY.zh-TW.md) |
| 한국어 (`ko`) | [ADR](adr/ADR-0001.ko.md) | [Deploy](deploy/DEPLOY.ko.md) |
| Filipino (`tl`) | [ADR](adr/ADR-0001.tl.md) | [Deploy](deploy/DEPLOY.tl.md) |
| नेपाली (`ne`) | [ADR](adr/ADR-0001.ne.md) | [Deploy](deploy/DEPLOY.ne.md) |
| Bahasa Indonesia (`id`) | [ADR](adr/ADR-0001.id.md) | [Deploy](deploy/DEPLOY.id.md) |
| Português (`pt`) | [ADR](adr/ADR-0001.pt.md) | [Deploy](deploy/DEPLOY.pt.md) |
| မြန်မာ (`my`) | [ADR](adr/ADR-0001.my.md) | [Deploy](deploy/DEPLOY.my.md) |
| ไทย (`th`) | [ADR](adr/ADR-0001.th.md) | [Deploy](deploy/DEPLOY.th.md) |
| हिन्दी (`hi`) | [ADR](adr/ADR-0001.hi.md) | [Deploy](deploy/DEPLOY.hi.md) |

## Architectural source of truth

- Implementation is authoritative: `App.js`, `src/`, `server/`, `app.config.js` and `package.json`.
- Locale content is intentionally parallel, but if a translated guide is ambiguous, check the commands and architectural source files before deploying.
- Risk: data feeds and map tiles may fail, and historical notices are not active alerts. Do not claim a verified alert, a tsunami propagation simulation, an available shelter, or App Store certification.
- See [Apple UI guidance](UI_DESIGN.md), [architecture](ARCHITECTURE.md), [MIT License](../LICENSE).
