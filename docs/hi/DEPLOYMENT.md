# Safety For You — परिचय और डिप्लॉय मार्गदर्शिका

[आर्किटेक्चर निर्णय अभिलेख](ADR.md) · [🌐](../README.md)

## 1. परियोजना और खुला स्रोत

Safety For You जापान के निवासियों और यात्रियों के लिए मुफ़्त, गैर-लाभकारी मोबाइल ऐप है। इसमें भूकंप, सुनामी, हाल के मौसम बुलेटिन, नक्शे और निर्धारित आपात निकासी स्थल मिलते हैं। यह स्वतंत्र परियोजना है, सरकारी सेवा नहीं। अपडेट केवल ऐप खुला होने पर होते हैं; पृष्ठभूमि में आपात पुश या ऑफ़लाइन सुरक्षा की गारंटी नहीं है।

मूल कोड और दस्तावेज़ [MIT](../../LICENSE) के तहत हैं। कॉपीराइट और अनुमति सूचना बनाए रखते हुए उपयोग, बदलाव, पुनर्वितरण और बिक्री कर सकते हैं। गैर-लाभकारी उद्देश्य व्यावसायिक fork को नहीं रोकता; कोई वारंटी नहीं है। बाहरी डेटा, नक्शे और लाइब्रेरी की [अपनी शर्तें](../../THIRD_PARTY_NOTICES.md) लागू हैं। योगदान के लिए fork, शाखा, जाँच और PR बनाएँ; credentials या signing keys commit न करें।

## 2. आवश्यकताएँ

Node.js 22+, npm, Git और SDK 58 संगत Expo Go चाहिए। स्थानीय iOS बिल्ड के लिए macOS/Xcode, Android के लिए संगत SDK/JDK चाहिए। क्लाउड के लिए Expo खाता, स्टोर के लिए अपने Apple Developer/Google Play Console खाते चाहिए। डेटाबेस या Google Maps key की ज़रूरत नहीं है।

## 3. स्थानीय रूप से चलाना

रिपॉज़िटरी की जड़ में चलाएँ; मौजूदा `.env` न बदलें। तालिका भरकर Expo Go से QR स्कैन करें। इंस्टॉल पर Leaflet बंडल होता है; जनरेटेड फ़ाइल गायब हो तो `npm run bundle:maps` चलाएँ। 13 भाषाएँ हैं, लेकिन ja/en/vi के बाहर कुछ पुराने UI संदेश अंग्रेज़ी में लौटते हैं।

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| चर | अर्थ |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | वैकल्पिक शुरुआती विलंब, 0–600 ms। |
| `EXPO_PUBLIC_REFRESH_SECONDS` | खुले ऐप में रिफ़्रेश: कम से कम 60 सेकंड, डिफ़ॉल्ट 120। |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker का HTTPS base URL, /hazards के बिना; खाली रखने पर मौसम स्रोत बंद। |
| `EXPO_PUBLIC_ROMAJI_API_URL` | Romaji का HTTPS base URL, /romaji के बिना; खाली रखने पर स्थानीय पढ़ाई मात्र। |
| `ANDROID_PACKAGE` | अपना Android application ID। |
| `IOS_BUNDLE_ID` | अपना iOS bundle ID। |
| `EAS_PROJECT_ID` | Expo परियोजना UUID; Expo Go में वैकल्पिक, EAS को अपनी परियोजना से जोड़ना आवश्यक। |

## 4. वैकल्पिक JMA Worker

`wrangler.toml` में अलग नाम रखें, Cloudflare में लॉगिन करें और जड़ से डिप्लॉय करें। उदाहरण host को Wrangler के URL से बदलें। `/hazards` JSON में `items` और `kind` चाहिए; `degraded: true` कुछ स्रोतों की विफलता है। base URL `.env` में रखें। Worker केवल JMA Atom शीर्षक वर्गीकृत करता है, सक्रिय चेतावनी या माप की पुष्टि नहीं करता।

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. वैकल्पिक Romaji सेवा

VPS के दूसरे टर्मिनल में शुरू करें। उत्पादन में systemd, container या process manager, port 3088 के आगे HTTPS reverse proxy तथा सीधे प्रवेश, अनुरोध आकार और दर की सीमाएँ रखें। `/health` का `{"ok":true}` और POST `/romaji` की reading array जाँचकर base URL सेट करें। स्थान, बुलेटिन और निकासी पते भेजे जा सकते हैं; body logs सीमित रखें। सेवा विफल हो तो स्थानीय शब्दकोश/Kana चलता रहता है।

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Android और iOS बिल्ड

Expo dashboard में अपनी परियोजना बनाकर UUID को `EAS_PROJECT_ID` में डालें। पहले बिल्ड से पहले दोनों app ID चुनें; fork पर `app.config.js` के नाम/slug/scheme बदलें। `eas.json` में preview (Android APK/iOS ad hoc), simulator (iOS Simulator), production (Android AAB/iOS store) हैं। Expo के preview और production दोनों वातावरण में तालिका के भरे मान बनाएँ। Git से बाहर `.env` अपने आप अपलोड नहीं होता। ये सार्वजनिक सेटिंग हैं, रहस्य नहीं; बदलने पर Metro पुनः शुरू या बिल्ड करें।

लॉगिन कर आवश्यक बिल्ड चुनें; EAS डाउनलोड URL देता है। iOS ad hoc में `npx eas-cli device:create` और Apple signing चाहिए। Simulator पैकेज iPhone पर नहीं चलेगा। स्थानीय उपकरण उपलब्ध हों तो `--local` जोड़ें।

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. स्टोर में प्रस्तुत करना

production बिल्ड के बाद चुना प्लेटफॉर्म प्रस्तुत करें। signing EAS में रखें, keys Git में नहीं। Google Play में AAB, iOS में App Store Connect/TestFlight इस्तेमाल होता है; प्रस्तुत करना स्वतः प्रकाशन नहीं है। विवरण, icon, screenshot, गोपनीयता नीति, डेटा घोषणा और असली उपकरण परीक्षण के बाद समीक्षा माँगें। App Store Connect app ID और Google service-account key अपने वितरण खाते में सँभालें।

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. जाँच

नीचे की जाँच के बाद वास्तविक iOS/Android पर 13 भाषाएँ, 日本語, जारी/घटना समय, दूसरे timezone में जापानी मध्यरात्रि, light/dark/high contrast, 200% पाठ, VoiceOver/TalkBack और modal focus, Reduce Motion, स्थान अस्वीकृति, नेटवर्क विफलता, स्रोत और legend जाँचें। JS export की सफलता native जाँच या Apple अनुमति नहीं है। [UI समीक्षा](../UI_DESIGN.md) देखें।

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. अपडेट और बहाली

परीक्षित commit और बिल्ड नंबर दर्ज करें। `app.config.js` का version बदलें; EAS production नंबर बढ़ाता है। EAS Update सेट नहीं है, नया native बिल्ड जारी करें। Worker को स्थिर commit/Cloudflare rollback से, Romaji को पुराना संस्करण पुनः शुरू करके बहाल करें। स्टोर ऐप चुपचाप downgrade नहीं होता; स्थिर पुराना source अधिक नंबर से बिल्ड करें। endpoints, नक्शे की सीमाएँ और स्रोत निगरानी में रखें।

## 10. संदर्भ

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
