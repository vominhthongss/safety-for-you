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

- `EXPO_PUBLIC_REFRESH_SECONDS`: रिफ्रेस अन्तराल सेकेन्डमा (कम्तीमा 60)।
- `EXPO_PUBLIC_JMA_PROXY_URL`: JMA शीर्षकको वैकल्पिक Cloudflare Worker URL।
- `EXPO_PUBLIC_ROMAJI_API_URL`: वैकल्पिक स्व-होस्टेड Kanji-to-Romaji सेवा URL।
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: हस्ताक्षरित Android/iOS build का स्थिर परिचय।
- `EXPO_PUBLIC_*`: Public variable हरू एपमा समावेश हुन्छन्; गोप्य जानकारी नराख्नुहोस्।
- `Leaflet 1.9.4`: `postinstall` ले `src/generated/leafletAssets.js` बनाउँछ; नक्सा टाइलका लागि इन्टरनेट चाहिन्छ।

## वैकल्पिक सेवाहरू

वैकल्पिक Cloudflare Worker ले /hazards मा JMA का हालैका शीर्षक दिन्छ, सक्रिय चेतावनी होइन। Romaji सेवा पनि वैकल्पिक हो; सार्वजनिक रूपमा HTTPS र दर सीमा राख्नुहोस्।

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Kanji/Romaji सेवाका लागि`romaji-service/README.md`हेर्नुहोस् (Node.js 22+, HTTPS तथा request limits)। सेवा नभए URL खाली राख्नुहोस्; Worker बिना मौसम शीर्षक उपलब्ध नहुन सक्छ। `.env` परिवर्तनपछि Expo पुनः सुरु गर्नुहोस्।

## स्टोर बिल्ड

स्टोरमा प्रकाशनका लागि Expo/EAS मा लगइन गरी build कन्फिगर गर्नुहोस् र Android/iOS production build तयार गर्नुहोस्। एप पहिचानहरू प्रकाशकको नियन्त्रणमा हुनुपर्छ।

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

रिपोजिटरीमा अहिले`eas.json`छैन। एक पटक`build:configure`चलाएर production सेटिङ जाँच्नुहोस्। निर्माणअघि हस्ताक्षर प्रमाणपत्र, स्टोर खाता, एप परिचय र वातावरण चर मिलाउनुहोस्। विस्तृत प्रकाशन चरण तल छन्।

## प्रकाशनअघि जाँच

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

प्रकाशनअघि गोपनीयता विवरण, आइकन, स्क्रिनसट, सम्पर्क, वास्तविक उपकरण र पहुँच परीक्षण तथा गैरआधिकारिक चेतावनी सूचना तयार गर्नुहोस्। JS export सफल हुँदैमा सुरक्षा प्रमाणित वा App Store स्वीकृत हुँदैन।

## खुला स्रोत सर्तहरू

[MIT इजाजतपत्र](../../LICENSE)अनुसार मुख्य प्रतिलिपिहरूमा प्रतिलिपि अधिकार र इजाजतपत्र सूचना राखेपछि व्यावसायिक प्रयोजनसहित प्रयोग, परिवर्तन र पुनर्वितरण गर्न पाइन्छ। बाह्य लाइब्रेरी, नक्सा, टाइल र डेटाका छुट्टाछुट्टै सर्तहरू लागू हुन्छन्। योगदान गर्दा स्रोत, तथ्य परीक्षण र सुरक्षा सूचना कायम राख्नुहोस्।

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.ne.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## एप स्टोरमा प्रकाशन

हस्ताक्षर, परीक्षण, गोपनीयता, समीक्षा र बाँकी कार्यका लागि[Google Play तथा Apple App Store प्रकाशन मार्गदर्शिका](../stores/STORE_RELEASE.ne.md)हेर्नुहोस्।
