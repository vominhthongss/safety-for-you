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

- `EXPO_PUBLIC_REFRESH_SECONDS`: Agwat ng refresh sa segundo (minimum 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: Opsyonal na Cloudflare Worker URL para sa JMA headlines.
- `EXPO_PUBLIC_ROMAJI_API_URL`: Opsyonal na sariling Kanji-to-Romaji service URL.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Matatag na identifier para sa nilagdaang Android/iOS build.
- `EXPO_PUBLIC_*`: Nasa inilabas na app ang public variable; huwag maglagay ng lihim.
- `Leaflet 1.9.4`: Lumilikha ang `postinstall` ng `src/generated/leafletAssets.js`; kailangan pa rin ng Internet para sa map tiles.

## Opsyonal na serbisyo

Ang opsyonal na Cloudflare Worker ay nagbibigay ng mga bagong pamagat ng JMA sa /hazards, hindi aktibong babala. Opsyonal din ang Romaji service; gumamit ng HTTPS at rate limiting kapag pampubliko.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Tingnan ang`romaji-service/README.md`para sa Kanji/Romaji service (Node.js 22+, HTTPS at request limits). Iwang walang laman ang URL kung hindi pa inilalathala. Maaaring hindi available ang weather headlines kapag walang Worker. I-restart ang Expo matapos baguhin ang `.env`.

## Build para sa store

Para sa mga store, mag-login sa Expo/EAS, i-configure ang build at gumawa ng Android at iOS production builds. Dapat sariling kontrol ng publisher ang app identifiers.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Wala pang`eas.json`sa repositoryo. Patakbuhin ang`build:configure`nang isang beses at suriin ang production profile. Itakda ang signing credentials, store accounts, identifiers at environment variables bago mag-build. Sundin ang detalyadong gabay sa ibaba.

## Checklist bago ilabas

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Bago mag-publish, ihanda ang privacy disclosures, icon, screenshots, contact details, device/accessibility tests at paalalang hindi ito opisyal na alert app. Hindi sapat ang JS export para sa safety approval o App Store review.

## Mga tuntunin ng open source

Sa ilalim ng[MIT License](../../LICENSE), maaaring gamitin, baguhin at ipamahagi ang source code, pati sa negosyo, kung pananatilihin ang copyright at license notice sa mahahalagang kopya. May sariling patakaran ang third-party libraries, maps, tiles at feeds. Panatilihin ang attribution, fact checking at safety notices sa mga kontribusyon.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.tl.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## Paglalathala sa mga app store

Basahin ang[detalyadong gabay sa Google Play at Apple App Store](../stores/STORE_RELEASE.tl.md)para sa signing, testing, privacy, review at mga kinakailangang gawain.
