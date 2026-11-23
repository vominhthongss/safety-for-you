# Deployment guide — Safety For You (English)

Safety For You is free, nonprofit, open-source disaster-information software for Japan under the MIT license. It complements, but never replaces, JMA, J-Alert, municipality instructions or emergency broadcasts.

## Prerequisites

Install Node.js 22+ and an Expo Go version compatible with SDK 58. There is no lockfile in this repository; install the pinned dependencies with npm install.

## Local run

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: refresh interval (minimum 60 s).
- `EXPO_PUBLIC_JMA_PROXY_URL`: optional Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: optional self-hosted Kanji/Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: app identifiers for native builds.
- `EXPO_PUBLIC_*` values are embedded in public client bundles; never put secrets in them.
- Leaflet 1.9.4 is generated locally by `postinstall` into `src/generated/leafletAssets.js`. Map raster tiles still require network access.

## Optional services

The Cloudflare Worker exposes recent JMA bulletin headlines at /hazards. It is optional, NOT verified active alerts. The Romaji service is also optional; protect its public endpoint with HTTPS and rate limits.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Store builds

For store builds, sign in to Expo/EAS, configure the build project and create Android/iOS production builds. Android package and iOS bundle identifiers must be unique and controlled by the publisher.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## Release checklist

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Before publishing, provide accurate privacy disclosures, an app icon, screenshots, legal contact information, accessibility/device tests and an explicit unofficial emergency-information disclaimer. Expo export checks JavaScript only; it does not certify safety or App Store acceptance.

## Open-source terms

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.en.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
