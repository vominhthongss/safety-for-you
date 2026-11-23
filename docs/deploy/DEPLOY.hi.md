# डिप्लॉयमेंट मार्गदर्शिका — Safety For You (हिन्दी)

Safety For You जापान की आपदा जानकारी के लिए निःशुल्क, गैर-लाभकारी और ओपन-सोर्स ऐप है, जिसका कोड MIT लाइसेंस के अंतर्गत है। यह JMA, J-Alert या स्थानीय प्रशासन के निर्देशों का विकल्प नहीं है।

## पूर्व आवश्यकताएँ

Node.js 22+ और SDK 58 के अनुकूल Expo Go चाहिए। इस रिपॉज़िटरी में lockfile नहीं है; npm install चलाएँ।

## स्थानीय संचालन

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

## वैकल्पिक सेवाएँ

वैकल्पिक Cloudflare Worker /hazards पर हाल के JMA बुलेटिन शीर्षक देता है, सक्रिय चेतावनी नहीं। Romaji सेवा भी वैकल्पिक है; सार्वजनिक करने पर HTTPS और अनुरोध सीमा लगाएँ।

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## स्टोर बिल्ड

स्टोर प्रकाशन के लिए Expo/EAS में लॉगिन करें, बिल्ड प्रोजेक्ट कॉन्फ़िगर करें और Android/iOS प्रोडक्शन बिल्ड बनाएँ। ऐप पहचानकर्ता प्रकाशक के नियंत्रण में होने चाहिए।

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## रिलीज़ जाँच

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

प्रकाशन से पहले गोपनीयता विवरण, आइकन, स्क्रीनशॉट, संपर्क, वास्तविक डिवाइस/accessibility परीक्षण और गैर-आधिकारिक चेतावनी का स्पष्टीकरण तैयार करें। JS export पास होने से सुरक्षा प्रमाणन या App Store स्वीकृति नहीं मिलती।

## ओपन-सोर्स शर्तें

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.hi.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
