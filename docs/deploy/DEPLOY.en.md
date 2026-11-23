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

- `EXPO_PUBLIC_REFRESH_SECONDS`: Refresh interval in seconds (minimum 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: Optional Cloudflare Worker endpoint for JMA headlines.
- `EXPO_PUBLIC_ROMAJI_API_URL`: Optional self-hosted Kanji-to-Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Stable identifiers for signed Android/iOS builds.
- `EXPO_PUBLIC_*`: Public variables are included in the app bundle; never store secrets.
- `Leaflet 1.9.4`: The `postinstall` step creates `src/generated/leafletAssets.js`; raster map tiles still need Internet.

## Optional services

The Cloudflare Worker exposes recent JMA bulletin headlines at /hazards. It is optional, NOT verified active alerts. The Romaji service is also optional; protect its public endpoint with HTTPS and rate limits.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

For Kanji readings, see `romaji-service/README.md` (Node.js 22+, HTTPS proxy and rate limiting). Leave the URL empty if not deployed; weather headlines can be unavailable without the Worker. Set the Worker URL in `.env`, then restart Expo.

## Store builds

For store builds, sign in to Expo/EAS, configure the build project and create Android/iOS production builds. Android package and iOS bundle identifiers must be unique and controlled by the publisher.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

`eas.json` is not yet committed. Run `build:configure` once and review the generated production profile. Set signing credentials, store accounts, identifiers, and production environment variables before building. See the complete store-release guide below.

## Release checklist

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Before publishing, provide accurate privacy disclosures, an app icon, screenshots, legal contact information, accessibility/device tests and an explicit unofficial emergency-information disclaimer. Expo export checks JavaScript only; it does not certify safety or App Store acceptance.

## Open-source terms

Under the [MIT License](../../LICENSE), the source may be used, modified and redistributed, including commercially, if its copyright and license notice is retained in substantial copies. Third-party libraries, maps, tiles and feeds retain their own terms. Contributions must preserve attribution, source verification and safety notices.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.en.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## Publishing to app stores

Follow the step-by-step [Google Play and Apple App Store publication guide](../stores/STORE_RELEASE.en.md), including signing, testing, privacy disclosures, store review, and the current release blockers.
