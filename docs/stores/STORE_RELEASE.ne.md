# Google Play र Apple App Store मा प्रकाशित गर्ने मार्गदर्शिका

यो मार्गदर्शिका Safety For You (Expo SDK 58) का लागि हो। यो जापानको विपद् सूचनासम्बन्धी निःशुल्क, गैरनाफामूलक तथा स्वतन्त्र एप हो। यसले JMA, J-Alert, स्थानीय अधिकारी वा आपत्कालीन प्रसारणलाई प्रतिस्थापन गर्दैन। स्टोरबाट स्वीकृति निश्चित छैन।

## 1. पूर्वतयारी र परीक्षण

Node.js 22+, उपयुक्त Expo वातावरण, Expo खाता र Google Play तथा Apple का छुट्टाछुट्टै विकासकर्ता खाता तयार गर्नुहोस्। रिपोजिटरीमा `package-lock.json` र `eas.json` (`preview` र `production` प्रोफाइल) समावेश छन्। तलका आदेशले JavaScript मात्र जाँच्छन्; तिनले native build प्रमाणित गर्दैनन्।

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. EAS, परिचय र हस्ताक्षर सेटअप

पहिलो प्रकाशनअघि `.env` मा प्रकाशकको नियन्त्रणमा रहेका अद्वितीय `ANDROID_PACKAGE` र `IOS_BUNDLE_ID` राख्नुहोस्। ती `app.config.js` र स्टोरमा दर्ता गरिएको विवरणसँग मिल्नुपर्छ। पछि परिवर्तन गर्दा अलग एप मानिन सक्छ। `build:configure` चलाएर `eas.json` बनाउनुहोस् र Expo परियोजना लिंक जाँच्नुहोस्।

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — सेटिङ उदाहरण (बनाएपछि जाँच्नुहोस्):

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "base": {
      "env": {}
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "extends": "base",
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

**EAS परियोजना ID:** `app.config.js` गतिशील कन्फिगरेसन भएकाले `eas init` ले यसमा `extra.eas.projectId` लेख्न सक्दैन र "Cannot automatically write to dynamic config" सन्देशसहित रोकिन्छ। `npx eas-cli init` चलाउनुहोस्, देखाइएको परियोजना ID प्रतिलिपि गर्नुहोस् र `eas.json` को `base` प्रोफाइलमा `"env": { "EAS_PROJECT_ID": "<project-id>" }` राख्नुहोस्। `app.config.js` ले यो मान `extra.eas.projectId` मा राख्छ। परियोजना ID पहिचानकर्ता हो, गोप्य जानकारी होइन; `eas.json` मा प्रमाणपत्र वा पासवर्ड नराख्नुहोस्। यस रिपोजिटरीको `app.config.js` मा `@vominhthongss/safety-for-you` को परियोजना ID र `owner` पहिल्यै सेट छन्; `eas.json` को चरण अर्को EAS परियोजनासँग जोडिएको fork का लागि मात्र आवश्यक छ।

उदाहरणमा EAS ले build number व्यवस्थापन र स्वचालित वृद्धि गर्छ। `app.config.js` को `expo.version` पनि मिलाउनुहोस्। Android versionCode वा iOS buildNumber फेरि प्रयोग नगर्नुहोस्। हस्ताक्षर प्रमाणपत्र र upload key गोप्य राख्नुहोस्।

आवश्यक environment variable हरू EAS production मा सेट गर्नुहोस्। `EXPO_PUBLIC_*` प्रयोगकर्ता एपमा देखिन सक्छ, त्यसैले गोप्य मानहरू नराख्नुहोस्। JMA Worker र Romaji सेवा वैकल्पिक हुन्; उपलब्ध नभए स्पष्ट अवस्था देखाउनुपर्छ।

## 3. Google Play: Android App Bundle (AAB)

Play Console मा दर्ता गरेर एप सिर्जना गर्नुहोस्, सही Android package ID राख्नुहोस्, store listing पूरा गर्नुहोस् र Play App Signing सक्रिय गर्नुहोस्। Google को app-signing key र EAS upload key अलग हुन्। key Git मा नराख्नुहोस्।

production AAB बनाउनुहोस्। पहिलो फाइल Play Console मार्फत आफैँ अपलोड गर्न सकिन्छ; सुरक्षित Google Play API र service account सेटअपपछि Expo Submit प्रयोग गर्न सकिन्छ। अपलोड हुनु सार्वजनिक प्रकाशन होइन।

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

पहिले Internal testing वा Closed testing मा क्र्यास, स्थान अनुमति, नक्सा र नेटवर्क असफलता जाँच्नुहोस्। 13 नोभेम्बर 2023 पछि बनेका व्यक्तिगत विकासकर्ता खातामा कम्तीमा 12 परीक्षक 14 दिन लगातार सहभागी हुनुपर्ने तथा production access स्वीकृति आवश्यक पर्न सक्छ। Play Console मा हालको सर्त जाँच्नुहोस्।

Data safety, स्टोर तथा एपभित्रको गोपनीयता नीति URL, सामग्री वर्गीकरण, लक्षित प्रयोगकर्ता, एप पहुँच, स्क्रिनसट, सम्पर्क र अनुमतिसम्बन्धी विवरण पूरा गर्नुहोस्। तयार AAB ले लागू target API (नोभेम्बर 2026 मा नयाँ फोन एपका लागि API 36) पूरा गरेको पुष्टि गर्नुहोस्।

## 4. Apple App Store: हस्ताक्षरित iOS IPA

Apple Developer Program मा सहभागी भएर उही Bundle ID का App ID र App Store Connect एप सिर्जना गर्नुहोस्। EAS बाट वितरण प्रमाणपत्र तथा provisioning profile मिलाउनुहोस् र सही Apple team जाँच्नुहोस्।

हस्ताक्षरित IPA तयार गरी App Store Connect मा अपलोड गर्नुहोस् र TestFlight बाट वास्तविक उपकरणमा जाँच्नुहोस्। Expo Submit ले फाइल मात्र अपलोड गर्छ; आफैँ सार्वजनिक गर्दैन।

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

App Store Connect मा App Privacy, चल्ने गोपनीयता नीति र सहायता URL, सही विवरण, उमेर वर्ग, आवश्यक iPhone तथा iPad स्क्रिनसट (`supportsTablet: true`), समीक्षा टिप्पणी र आवश्यक परे परीक्षण खाता राख्नुहोस्। build छानेर App Review मा पठाउनुहोस् र स्वीकृतिपछि मात्र प्रकाशित गर्नुहोस्।

## 5. सुरक्षा तथा प्रकाशन परीक्षण

वास्तविक iOS/Android उपकरणमा Apple Maps र Leaflet, 13 भाषा, पहुँचयोग्यता, स्थान अनुमति स्वीकार/अस्वीकार, पुराना वा हराएका सूचना, अफलाइन अवस्था तथा नक्साको स्रोत उल्लेख जाँच्नुहोस्। आधिकारिक वास्तविक-समय सूचना, JMA शीर्षकबाट मात्र सक्रिय चेतावनी, सुनामी फैलावट सिमुलेसन वा आश्रयस्थल खुला भएको ग्यारेन्टी नगर्नुहोस्।

**विपद् अलार्म र सूचना:** प्रयोगकर्ताले अलार्म ध्वनि स्विच अन गरेपछि मात्र एपले सूचना अनुमति माग्छ। गोपनीयता उत्तरहरूमा अलार्मका लागि उपकरणभित्र स्थान प्रयोग खुलाउनुहोस्, भौतिक उपकरणमा अलार्म स्क्रिन, कम्पन र सूचना ध्वनि जाँच गर्नुहोस्, र अलार्म एप खुला हुँदा मात्र काम गर्छ तथा जापानको आधिकारिक आपतकालीन चेतावनीको विकल्प होइन भनी स्टोर विवरणमा उल्लेख गर्नुहोस्।

**गोपनीयता र अनुमति:** `app.config.js` ले एप-स्तरको गोपनीयता म्यानिफेस्ट (`ios.privacyManifests`, एपको कार्यका लागि अनुमानित स्थान, ट्र्याकिङ छैन), `ITSAppUsesNonExemptEncryption = false`, स्पष्ट स्थान प्रयोग उद्देश्य वाक्य र `android.allowBackup: false` सेट गर्छ, साथै `SYSTEM_ALERT_WINDOW` र पुराना भण्डारण अनुमतिहरू रोक्छ। गोपनीयता नीति `docs/privacy/` (अङ्ग्रेजी, जापानी, भियतनामी) मा छ र पेस गर्नुअघि प्रकाशित गर्नुपर्छ, उदाहरणका लागि `/docs` बाट GitHub Pages। प्रश्नावलीका सुझाव उत्तरहरू `store/REVIEW-ANSWERS.md` मा छन्। स्क्रिनसट `scripts/capture-store-screenshot.sh` ले लिनुहोस् र `npm run check:screenshots` ले जाँच गर्नुहोस् (`store/screenshots/README.md` हेर्नुहोस्)।

**अहिले स्टोर स्क्रिनसट (iPhone 6.9" वा 6.5", iPad 13", Android फोन; आइकन र feature graphic `assets/` र `store/` मा छन्, `store/README.md` हेर्नुहोस्), गोपनीयता नीति URL, हस्ताक्षरित उपकरण build परीक्षण र स्टोर स्वीकृति बाँकी छन्। कागजात मात्र थपेर एप प्रकाशनका लागि तयार हुँदैन।**

## 6. अद्यावधिक र मर्मत

हरेक अपडेटमा version तथा build number बढाउनुहोस्, उपकरण परीक्षण दोहोर्याउनुहोस्, सम्भव भए चरणबद्ध प्रकाशन गर्नुहोस्, crash र डेटा प्रदायकका सर्तहरू निगरानी गर्नुहोस् र गोपनीयता विवरण अद्यावधिक गर्नुहोस्। स्रोत बन्द हुँदा स्पष्ट समस्या अवस्था देखाई आधिकारिक चेतावनी माध्यमतर्फ पठाउनुहोस्।

## आधिकारिक सन्दर्भ

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[डिप्लोय अवलोकन](../deploy/DEPLOY.ne.md) · [कागजात सूची](../README.md)
