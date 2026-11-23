# Gabay sa pag-deploy — Safety For You (Filipino)

Ang Safety For You ay libre, nonprofit at open-source na app para sa impormasyon sa sakuna sa Japan sa ilalim ng MIT license. Hindi nito pinapalitan ang JMA, J-Alert o mga tagubilin ng lokal na pamahalaan.

## Mga kailangan

Kailangan ng Node.js 22+ at Expo Go na tugma sa SDK 58. Walang lockfile ang repo; gamitin ang npm install.

## Patakbuhin sa lokal

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

## Opsyonal na serbisyo

Ang opsyonal na Cloudflare Worker ay nagbibigay ng mga bagong pamagat ng JMA sa /hazards, hindi aktibong babala. Opsyonal din ang Romaji service; gumamit ng HTTPS at rate limiting kapag pampubliko.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Build para sa store

Para sa mga store, mag-login sa Expo/EAS, i-configure ang build at gumawa ng Android at iOS production builds. Dapat sariling kontrol ng publisher ang app identifiers.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## Checklist bago ilabas

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Bago mag-publish, ihanda ang privacy disclosures, icon, screenshots, contact details, device/accessibility tests at paalalang hindi ito opisyal na alert app. Hindi sapat ang JS export para sa safety approval o App Store review.

## Mga tuntunin ng open source

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.tl.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
