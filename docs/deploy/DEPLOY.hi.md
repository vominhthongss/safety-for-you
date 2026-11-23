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

- `EXPO_PUBLIC_REFRESH_SECONDS`: रीफ़्रेश का अंतराल सेकंड में (न्यूनतम 60)।
- `EXPO_PUBLIC_JMA_PROXY_URL`: JMA शीर्षकों के लिए वैकल्पिक Cloudflare Worker URL।
- `EXPO_PUBLIC_ROMAJI_API_URL`: वैकल्पिक स्व-होस्टेड Kanji-to-Romaji सेवा URL।
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: हस्ताक्षरित Android/iOS build के स्थायी पहचानकर्ता।
- `EXPO_PUBLIC_*`: सार्वजनिक चर ऐप में शामिल होते हैं; इनमें गोपनीय जानकारी न रखें।
- `Leaflet 1.9.4`: `postinstall` से `src/generated/leafletAssets.js` बनता है; मानचित्र टाइल के लिए इंटरनेट आवश्यक है।

## वैकल्पिक सेवाएँ

वैकल्पिक Cloudflare Worker /hazards पर हाल के JMA बुलेटिन शीर्षक देता है, सक्रिय चेतावनी नहीं। Romaji सेवा भी वैकल्पिक है; सार्वजनिक करने पर HTTPS और अनुरोध सीमा लगाएँ।

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Kanji/Romaji सेवा के लिए`romaji-service/README.md`देखें (Node.js 22+, HTTPS और अनुरोध सीमा)। सेवा न होने पर URL खाली रखें; Worker के बिना मौसम शीर्षक अनुपलब्ध हो सकते हैं। `.env` बदलने के बाद Expo दोबारा चलाएँ।

## स्टोर बिल्ड

स्टोर प्रकाशन के लिए Expo/EAS में लॉगिन करें, बिल्ड प्रोजेक्ट कॉन्फ़िगर करें और Android/iOS प्रोडक्शन बिल्ड बनाएँ। ऐप पहचानकर्ता प्रकाशक के नियंत्रण में होने चाहिए।

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

रिपॉज़िटरी में अभी`eas.json`नहीं है। `build:configure` एक बार चलाएँ और production प्रोफ़ाइल जाँचें। बिल्ड से पहले हस्ताक्षर प्रमाणपत्र, स्टोर खाते, पहचानकर्ता और वातावरण चर सेट करें। विस्तृत प्रकाशन निर्देश नीचे हैं।

## रिलीज़ जाँच

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

प्रकाशन से पहले गोपनीयता विवरण, आइकन, स्क्रीनशॉट, संपर्क, वास्तविक डिवाइस/accessibility परीक्षण और गैर-आधिकारिक चेतावनी का स्पष्टीकरण तैयार करें। JS export पास होने से सुरक्षा प्रमाणन या App Store स्वीकृति नहीं मिलती।

## ओपन-सोर्स शर्तें

[MIT लाइसेंस](../../LICENSE) के अनुसार पर्याप्त प्रतियों में कॉपीराइट और लाइसेंस सूचना बनाए रखकर कोड का उपयोग, संशोधन और पुनर्वितरण, व्यावसायिक उपयोग सहित, किया जा सकता है। बाहरी लाइब्रेरी, मानचित्र, टाइल और डेटा स्रोतों की अलग शर्तें हैं। योगदान में स्रोत श्रेय, सत्यापन और सुरक्षा सूचनाएँ बनाए रखें।

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.hi.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## ऐप स्टोर पर प्रकाशन

हस्ताक्षर, परीक्षण, गोपनीयता, समीक्षा और शेष कार्यों के लिए[Google Play तथा Apple App Store प्रकाशन मार्गदर्शिका](../stores/STORE_RELEASE.hi.md)देखें।
