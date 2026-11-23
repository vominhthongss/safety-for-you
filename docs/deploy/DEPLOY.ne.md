# प्रकाशन र डिप्लोय मार्गदर्शन — Safety For You (नेपाली)

Safety For You जापानको विपद् जानकारीका लागि निःशुल्क, गैरनाफामूलक खुला स्रोत एप हो। स्रोत कोड MIT इजाजतपत्रमा छ। यसले JMA, J-Alert वा स्थानीय निकायको निर्देशन प्रतिस्थापन गर्दैन।

## आवश्यक सामग्री

Node.js 22+ र SDK 58 सँग मिल्ने Expo Go चाहिन्छ। रिपोजिटरीमा lockfile छैन, त्यसैले npm install चलाउनुहोस्।

## स्थानीय रूपमा चलाउने

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

## वैकल्पिक सेवाहरू

वैकल्पिक Cloudflare Worker ले /hazards मा JMA का हालैका शीर्षक दिन्छ, सक्रिय चेतावनी होइन। Romaji सेवा पनि वैकल्पिक हो; सार्वजनिक रूपमा HTTPS र दर सीमा राख्नुहोस्।

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## स्टोर बिल्ड

स्टोरमा प्रकाशनका लागि Expo/EAS मा लगइन गरी build कन्फिगर गर्नुहोस् र Android/iOS production build तयार गर्नुहोस्। एप पहिचानहरू प्रकाशकको नियन्त्रणमा हुनुपर्छ।

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## प्रकाशनअघि जाँच

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

प्रकाशनअघि गोपनीयता विवरण, आइकन, स्क्रिनसट, सम्पर्क, वास्तविक उपकरण र पहुँच परीक्षण तथा गैरआधिकारिक चेतावनी सूचना तयार गर्नुहोस्। JS export सफल हुँदैमा सुरक्षा प्रमाणित वा App Store स्वीकृत हुँदैन।

## खुला स्रोत सर्तहरू

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ne.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
