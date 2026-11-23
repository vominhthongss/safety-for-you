# Google Play और Apple App Store पर प्रकाशित करने की मार्गदर्शिका

यह मार्गदर्शिका Safety For You (Expo SDK 58) के लिए है। यह जापान की आपदा जानकारी का निःशुल्क, गैर-लाभकारी और स्वतंत्र ऐप है; JMA, J-Alert, स्थानीय प्रशासन या आपातकालीन प्रसारण का विकल्प नहीं है। स्टोर की स्वीकृति की गारंटी नहीं है।

## 1. आवश्यकताएँ और प्रारंभिक जाँच

Node.js 22+, उपयुक्त Expo वातावरण, Expo खाता और Google Play तथा Apple के अलग डेवलपर खाते तैयार रखें। रिपॉज़िटरी में अभी npm lockfile या `eas.json` नहीं है। नीचे दिए आदेश केवल JavaScript जाँचते हैं; ये native build की पुष्टि नहीं करते।

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. EAS, पहचान और हस्ताक्षर कॉन्फ़िगरेशन

पहली रिलीज़ से पहले `.env` में अपने नियंत्रण वाले अद्वितीय `ANDROID_PACKAGE` और `IOS_BUNDLE_ID` सेट करें। ये `app.config.js` और स्टोर रिकॉर्ड से मिलने चाहिए; बाद में बदलने पर अलग ऐप माना जा सकता है। `build:configure` चलाकर `eas.json` बनाएँ और Expo प्रोजेक्ट का लिंक जाँचें।

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — कॉन्फ़िगरेशन उदाहरण (बनने के बाद जाँचें):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

उदाहरण में EAS build नंबर का प्रबंधन और स्वतः वृद्धि करता है। `app.config.js` का `expo.version` भी अपडेट करें। Android versionCode या iOS buildNumber का पुनः उपयोग न करें। हस्ताक्षर प्रमाणपत्र और upload key सुरक्षित रखें; Git में न डालें।

EAS production environment में आवश्यक चर सेट करें। `EXPO_PUBLIC_*` वितरित ऐप में पढ़े जा सकते हैं, इसलिए इनमें गोपनीय जानकारी न रखें। JMA Worker और Romaji सेवा वैकल्पिक हैं; उनके उपलब्ध न होने पर स्पष्ट सूचना दिखाएँ।

## 3. Google Play: Android App Bundle (AAB)

Play Console में पंजीकरण करें, ऐप बनाएँ, सटीक Android package ID भरें, स्टोर सूची पूरी करें और Play App Signing चालू करें। Google की app-signing key, EAS की upload key से अलग होती है। चाबी Git में जमा न करें।

production AAB बनाएँ। पहला अपलोड Play Console में स्वयं किया जा सकता है; Google Play API और service account सुरक्षित रूप से सेट होने पर Expo Submit भी उपलब्ध है। अपलोड होना सार्वजनिक प्रकाशन नहीं है।

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

पहले Internal testing या Closed testing से क्रैश, स्थान अनुमति, मानचित्र और नेटवर्क समस्या जाँचें। 13 नवंबर 2023 के बाद बने व्यक्तिगत डेवलपर खातों को कम से कम 12 परीक्षक 14 लगातार दिनों तक और production access की स्वीकृति की आवश्यकता हो सकती है। Play Console की मौजूदा शर्त देखें।

Data safety, स्टोर और ऐप के भीतर गोपनीयता नीति URL, सामग्री रेटिंग, लक्षित उपयोगकर्ता, ऐप पहुँच, स्क्रीनशॉट, संपर्क तथा अनुमतियों की जानकारी पूरी करें। अंतिम AAB के target API को वर्तमान मानक (नवंबर 2026 में नए फ़ोन ऐप के लिए API 36) से मिलाएँ; केवल JavaScript export पर निर्भर न रहें।

## 4. Apple App Store: हस्ताक्षरित iOS IPA

Apple Developer Program में शामिल हों और समान Bundle ID वाला App ID तथा App Store Connect ऐप बनाएँ। EAS के माध्यम से वितरण प्रमाणपत्र और provisioning profile सेट करें तथा सही Apple team की पुष्टि करें।

हस्ताक्षरित IPA बनाकर App Store Connect पर अपलोड करें और TestFlight से वास्तविक उपकरणों पर परीक्षण करें। Expo Submit केवल अपलोड करता है, अपने आप प्रकाशित नहीं करता।

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

App Store Connect में App Privacy, सक्रिय गोपनीयता नीति और सहायता URL, सही विवरण, आयु रेटिंग, निर्धारित iPhone तथा आवश्यक iPad स्क्रीनशॉट (`supportsTablet: true`), समीक्षा नोट और जरूरत पड़ने पर परीक्षण खाता दें। build चुनकर App Review को भेजें; स्वीकृति के बाद प्रकाशित करें।

## 5. सुरक्षा और रिलीज़ जाँच

वास्तविक iOS और Android उपकरणों पर Apple Maps तथा Leaflet, सभी 13 भाषाओं, सुलभता, स्थान अनुमति स्वीकृत/अस्वीकृत, पुराने या अनुपलब्ध बुलेटिन, ऑफलाइन स्थिति और मानचित्र स्रोत का परीक्षण करें। आधिकारिक वास्तविक-समय अलर्ट, केवल JMA शीर्षकों से सक्रिय चेतावनी, सुनामी प्रसार का अनुकरण या शरण स्थल खुला होने का दावा न करें।

**वर्तमान शेष कार्य: `eas.json`, स्टोर चित्र/स्क्रीनशॉट, गोपनीयता नीति URL, हस्ताक्षरित native build का उपकरण परीक्षण और स्टोर समीक्षा परिणाम। केवल दस्तावेज़ जोड़ना पर्याप्त नहीं है।**

## 6. अपडेट और रखरखाव

हर अपडेट में संस्करण और build नंबर बढ़ाएँ, उपकरण परीक्षण दोहराएँ, संभव हो तो चरणबद्ध रिलीज़ करें, क्रैश और डेटा प्रदाता की शर्तें जाँचें तथा डेटा उपयोग बदलने पर गोपनीयता विवरण संशोधित करें। स्रोत उपलब्ध न होने पर स्पष्ट संदेश देकर आधिकारिक चेतावनी माध्यमों की ओर निर्देशित करें।

## आधिकारिक संदर्भ

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[डिप्लॉयमेंट का अवलोकन](../deploy/DEPLOY.hi.md) · [दस्तावेज़ सूची](../README.md)
