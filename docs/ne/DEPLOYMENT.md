# Safety For You — परिचय र डिप्लोय मार्गदर्शन

[आर्किटेक्चर निर्णय अभिलेख](ADR.md) · [🌐](../README.md)

## 1. परियोजना र खुला स्रोत

Safety For You जापानमा बस्ने वा भ्रमण गर्ने व्यक्तिका लागि निःशुल्क, गैरनाफामूलक मोबाइल एप हो। यसले भूकम्प, सुनामी, हालैका मौसम सूचना, नक्सा र तोकिएका आपत्कालीन निकासी स्थान देखाउँछ। यो स्वतन्त्र परियोजना हो, सरकारी सेवा होइन। एप खुला हुँदा मात्र अद्यावधिक हुन्छ; पृष्ठभूमिको आपत्कालीन पुश वा अफलाइन सुरक्षाको प्रत्याभूति छैन।

मौलिक कोड र कागजात [MIT](../../LICENSE) अन्तर्गत छन्। प्रतिलिपि अधिकार र अनुमति सूचना राखेर प्रयोग, परिवर्तन, पुनर्वितरण र बिक्री गर्न सकिन्छ। गैरनाफामूलक उद्देश्यले व्यावसायिक fork रोक्दैन। कुनै वारेन्टी छैन। बाह्य डेटा, नक्सा र पुस्तकालयका [छुट्टै सर्त](../../THIRD_PARTY_NOTICES.md) लागू हुन्छन्। योगदानका लागि fork, शाखा, परीक्षण र PR प्रयोग गर्नुहोस्; गोप्य विवरण वा हस्ताक्षर कुञ्जी Git मा नराख्नुहोस्।

## 2. आवश्यकता

Node.js 22+, npm, Git र SDK 58 मिल्ने Expo Go चाहिन्छ। स्थानीय iOS बिल्डका लागि macOS/Xcode, Android का लागि मिल्ने SDK/JDK चाहिन्छ। क्लाउडमा Expo खाता र स्टोरका लागि आफ्नै Apple Developer/Google Play Console खाता चाहिन्छ। डेटाबेस वा Google Maps कुञ्जी आवश्यक छैन।

## 3. स्थानीय रूपमा चलाउने

रिपोजिटरीको मूल फोल्डरमा चलाउनुहोस्। पुरानो `.env` नलेख्नुहोस्; तलका मान भरेर Expo Go बाट QR स्क्यान गर्नुहोस्। स्थापना गर्दा Leaflet बन्डल हुन्छ; उत्पन्न फाइल नभए `npm run bundle:maps` चलाउनुहोस्। १३ भाषा छान्न सकिन्छ, तर ja/en/vi बाहिरका केही पुराना वाक्य अंग्रेजीमा देखिन्छन्।

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| चर | अर्थ |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | सुरुको वैकल्पिक ढिलाइ, ०–६०० मिलिसेकेन्ड। |
| `EXPO_PUBLIC_REFRESH_SECONDS` | खुला एपको रिफ्रेस अन्तराल: कम्तीमा ६० सेकेन्ड, पूर्वनिर्धारित १२०। |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker को HTTPS मूल URL; /hazards नराख्नुहोस्। खाली भए मौसम स्रोत बन्द। |
| `EXPO_PUBLIC_ROMAJI_API_URL` | Romaji को HTTPS मूल URL; /romaji नराख्नुहोस्। खाली भए स्थानीय पढाइ मात्र। |
| `ANDROID_PACKAGE` | आफ्नो Android application ID। |
| `IOS_BUNDLE_ID` | आफ्नो iOS bundle ID। |
| `EAS_PROJECT_ID` | Expo परियोजनाको UUID; Expo Go मा वैकल्पिक, EAS मा आफ्नै परियोजना जोड्न आवश्यक। |

## 4. वैकल्पिक JMA Worker

`wrangler.toml` मा छुट्टै नाम राखी Cloudflare मा लगइन गरेर मूल फोल्डरबाट डिप्लोय गर्नुहोस्। उदाहरण होस्टलाई Wrangler को URL ले बदल्नुहोस्। `/hazards` को JSON मा `items` र `kind` हुनुपर्छ; `degraded: true` ले केही स्रोत असफल भएको जनाउँछ। मूल URL `.env` मा राख्नुहोस्। Worker ले JMA Atom शीर्षक मात्र वर्गीकरण गर्छ, सक्रिय चेतावनी वा मापन पुष्टि गर्दैन।

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. वैकल्पिक Romaji सेवा

VPS को अर्को टर्मिनलमा चलाउनुहोस्। उत्पादनमा systemd, container वा process manager प्रयोग गरी पोर्ट 3088 अगाडि HTTPS reverse proxy राख्नुहोस्; सीधा पहुँच, अनुरोधको आकार र दर सीमित गर्नुहोस्। `/health` मा `{"ok":true}` र POST `/romaji` मा पढाइको array जाँचेर मूल URL सेट गर्नुहोस्। स्थान, सूचना र आश्रयको ठेगाना पठाइन सक्छ; अनुरोधको पूरा पाठ अनावश्यक रूपमा लग नगर्नुहोस्। सेवा असफल हुँदा स्थानीय शब्दकोश/Kana चलिरहन्छ।

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Android र iOS बिल्ड

Expo dashboard मा आफ्नै परियोजना बनाई UUID लाई `EAS_PROJECT_ID` मा राख्नुहोस्। पहिलो बिल्डअघि दुवै ID छान्नुहोस्; fork गर्दा `app.config.js` को नाम/slug/scheme बदल्नुहोस्। `eas.json` मा preview (Android APK/iOS ad hoc), simulator (iOS Simulator), production (Android AAB/iOS store) छन्। Expo को preview र production दुवै वातावरणमा तालिकाका भरिएका मान राख्नुहोस्। Git ले बेवास्ता गर्ने `.env` क्लाउडमा आफैँ जाँदैन। यी सार्वजनिक सेटिङ हुन्; गोप्य कुरा नराख्नुहोस्। परिवर्तनपछि Metro पुनः सुरु वा बिल्ड गर्नुहोस्।

लगइनपछि आवश्यक कमान्ड छान्नुहोस्; EAS ले डाउनलोड URL दिन्छ। iOS ad hoc का लागि `npx eas-cli device:create` र Apple हस्ताक्षर चाहिन्छ। Simulator बिल्ड iPhone मा चल्दैन। स्थानीय उपकरण तयार भए `--local` थप्न सकिन्छ।

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. स्टोरमा पेश गर्ने

production बिल्ड गरेर आवश्यक प्लेटफर्म पेश गर्नुहोस्। हस्ताक्षर EAS बाट व्यवस्थापन गर्नुहोस्, कुञ्जी Git मा नराख्नुहोस्। Google Play मा AAB र iOS मा App Store Connect/TestFlight प्रयोग हुन्छ; पेश गर्दैमा सार्वजनिक हुँदैन। विवरण, आइकन, स्क्रिनसट, गोपनीयता नीति, डेटा विवरण र वास्तविक उपकरण परीक्षणपछि समीक्षा माग्नुहोस्। App Store Connect ID र Google service-account कुञ्जी आफ्नै वितरण खातामा राख्नुहोस्।

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. परीक्षण

तलको परीक्षणपछि वास्तविक iOS/Android मा १३ भाषा, 日本語 नाम, जारी/घटना समय, अर्को समयक्षेत्रबाट जापानको मध्यरात, उज्यालो/अँध्यारो/उच्च कन्ट्रास्ट, २००% अक्षर, VoiceOver/TalkBack र मोडल फोकस, Reduce Motion, स्थान अस्वीकार, नेटवर्क त्रुटि, नक्सा स्रोत र रङको अर्थ जाँच्नुहोस्। JS export सफल हुनु native परीक्षण वा Apple स्वीकृति होइन। [UI जाँच](../UI_DESIGN.md) हेर्नुहोस्।

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. अद्यावधिक र पुनर्स्थापना

परीक्षण गरिएको commit र बिल्ड नम्बर लेखेर राख्नुहोस्। `app.config.js` को version बदल्नुहोस्; EAS ले production नम्बर बढाउँछ। EAS Update सेट छैन, त्यसैले नयाँ native बिल्ड चाहिन्छ। Worker लाई स्थिर commit वा Cloudflare rollback, Romaji लाई पुरानो संस्करण पुनः सुरु गरेर फर्काउनुहोस्। स्टोर एप चुपचाप घटाउन मिल्दैन; पुरानो स्रोतलाई ठूलो बिल्ड नम्बरमा पुनः बनाउनुहोस्। endpoint र नक्सा सीमाहरू निगरानी गर्नुहोस्।

## 10. सन्दर्भ

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
