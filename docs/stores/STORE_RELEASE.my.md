# Google Play နှင့် Apple App Store တွင် ထုတ်ဝေရန် လမ်းညွှန်

ဤလမ်းညွှန်သည် Safety For You (Expo SDK 58) အတွက်ဖြစ်သည်။ အခမဲ့၊ အကျိုးအမြတ်မယူသော၊ သီးခြား သဘာဝဘေးအချက်အလက်အက်ပ်ဖြစ်ပြီး JMA၊ J-Alert၊ ဒေသန္တရအာဏာပိုင်များ သို့မဟုတ် အရေးပေါ်ထုတ်လွှင့်ချက်များကို အစားမထိုးပါ။ Store အတည်ပြုချက်ကို အာမမခံနိုင်ပါ။

## 1. ကြိုတင်လိုအပ်ချက်နှင့် စစ်ဆေးခြင်း

Node.js 22+၊ ကိုက်ညီသော Expo environment၊ Expo account နှင့် Google Play/Apple developer account များ ပြင်ဆင်ပါ။ Repository တွင် `package-lock.json` နှင့် `eas.json` (`preview` နှင့် `production` profile) ပါဝင်သည်။ အောက်ပါ command များသည် JavaScript ကိုသာ စစ်ဆေးပြီး native build စမ်းသပ်မှုအစား မဖြစ်နိုင်ပါ။

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. EAS၊ App ID နှင့် လက်မှတ်ပြင်ဆင်ခြင်း

ပထမဆုံးထုတ်ဝေမီ `.env` တွင် မိမိထိန်းချုပ်ထားသော သီးသန့် `ANDROID_PACKAGE` နှင့် `IOS_BUNDLE_ID` တို့ကို သတ်မှတ်ပါ။ `app.config.js` နှင့် store မှတ်ပုံတင်အချက်အလက်တို့ တူညီရပါမည်။ ထုတ်ဝေပြီးနောက် ပြောင်းလဲပါက အက်ပ်အသစ်ဖြစ်နိုင်သည်။ `build:configure` ဖြင့် `eas.json` ဖန်တီးပြီး Expo project ချိတ်ဆက်မှုကို စစ်ဆေးပါ။

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — ပြင်ဆင်မှု ဥပမာ (ဖန်တီးပြီးနောက် စစ်ဆေးပါ):

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

**EAS project ID:** `app.config.js` သည် dynamic configuration ဖြစ်သောကြောင့် `eas init` က `extra.eas.projectId` ကို ရေးထည့်၍မရဘဲ "Cannot automatically write to dynamic config" ဖြင့် ရပ်သွားသည်။ `npx eas-cli init` ကို run ပြီး ပြသသော project ID ကို ကူးယူကာ `eas.json` ၏ `base` profile တွင် `"env": { "EAS_PROJECT_ID": "<project-id>" }` အဖြစ် သတ်မှတ်ပါ။ `app.config.js` က ထိုတန်ဖိုးကို `extra.eas.projectId` သို့ ကူးထည့်သည်။ project ID သည် identifier ဖြစ်ပြီး လျှို့ဝှက်ချက်မဟုတ်ပါ၊ `eas.json` တွင် credential များ မထည့်ပါနှင့်။

ဥပမာတွင် build number များကို EAS က စီမံ၍ အလိုအလျောက်တိုးပေးသည်။ `app.config.js` ရှိ `expo.version` ကိုလည်း ပြင်ဆင်ပါ။ Android versionCode နှင့် iOS buildNumber အဟောင်းကို ပြန်မသုံးပါနှင့်။ Signing credential နှင့် upload key များကို Git တွင် မသိမ်းပါနှင့်။

လိုအပ်သော variable များကို EAS production environment တွင် သတ်မှတ်ပါ။ `EXPO_PUBLIC_*` ကို app အသုံးပြုသူများ မြင်နိုင်သဖြင့် လျှို့ဝှက်ချက် မထည့်ပါနှင့်။ JMA Worker နှင့် Romaji service သည် ရွေးချယ်နိုင်ပြီး မရှိလျှင် မရနိုင်ကြောင်း ဖော်ပြထားပါ။

## 3. Google Play: Android App Bundle (AAB)

Play Console အကောင့်ဖွင့်၊ အက်ပ်ဖန်တီး၊ မှန်ကန်သော Android package ID စာရင်းသွင်း၊ Store စာမျက်နှာဖြည့်ပြီး Play App Signing ဖွင့်ပါ။ Google ၏ app-signing key နှင့် EAS upload key သည် မတူပါ။ Key ကို Git တွင် မတင်ပါနှင့်။

Production AAB တည်ဆောက်ပါ။ ပထမဖိုင်ကို Play Console မှ ကိုယ်တိုင်တင်နိုင်ပြီး Google Play API နှင့် service account လုံခြုံစွာပြင်ဆင်ပြီးနောက် Expo Submit သုံးနိုင်သည်။ Upload လုပ်ခြင်းသည် အများပြည်သူထံ ထုတ်ဝေခြင်းမဟုတ်ပါ။

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

Internal testing သို့မဟုတ် Closed testing ဖြင့် crash၊ location permission၊ map နှင့် network failure များကို ဦးစွာစစ်ဆေးပါ။ 2023-11-13 နောက်ပိုင်းဖွင့်သော personal developer account များတွင် စမ်းသပ်သူ အနည်းဆုံး 12 ဦး 14 ရက်ဆက်တိုက် ပါဝင်ခြင်းနှင့် production access ခွင့်ပြုချက်လိုနိုင်သည်။ Play Console ၏ လက်ရှိစည်းမျဉ်းကို စစ်ဆေးပါ။

Data safety၊ store နှင့် app အတွင်း privacy policy URL၊ content rating၊ audience၊ app access၊ screenshot၊ ဆက်သွယ်ရန်နှင့် permission ကြေညာချက်များ ပြည့်စုံပါစေ။ AAB ၏ target API ကို လက်ရှိသတ်မှတ်ချက်နှင့် စစ်ဆေးပါ (2026 နိုဝင်ဘာတွင် ဖုန်း app အသစ်များအတွက် API 36)။ JavaScript export သာ အားမကိုးပါနှင့်။

## 4. Apple App Store: လက်မှတ်ထိုးထားသော iOS IPA

Apple Developer Program တွင် ပါဝင်၍ တူညီသော Bundle ID ဖြင့် App ID နှင့် App Store Connect app ဖန်တီးပါ။ EAS မှ distribution certificate နှင့် provisioning profile စီမံပြီး Apple team ကို အတည်ပြုပါ။

လက်မှတ်ထိုး IPA တည်ဆောက်ပြီး App Store Connect သို့တင်ကာ TestFlight ဖြင့် အမှန်တကယ်စက်တွင် စမ်းသပ်ပါ။ Expo Submit သည် upload သာလုပ်ပြီး အလိုအလျောက် မထုတ်ဝေပါ။

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

App Store Connect တွင် App Privacy၊ အသုံးပြုနိုင်သော privacy policy နှင့် support URL၊ မှန်ကန်သော ဖော်ပြချက်၊ အသက်ကန့်သတ်ချက်၊ လိုအပ်သော iPhone နှင့် iPad screenshot (`supportsTablet: true`)၊ review note နှင့် စမ်းသပ်အကောင့်ကို ဖြည့်ပါ။ Build ရွေး၍ App Review သို့တင်ပြီး ခွင့်ပြုပြီးမှ ထုတ်ဝေပါ။

## 5. ဘေးကင်းရေးနှင့် မထုတ်ဝေမီ စစ်ဆေးချက်

အမှန်တကယ် iOS/Android စက်များတွင် Apple Maps နှင့် Leaflet၊ ဘာသာစကား 13 မျိုး၊ accessibility၊ location ခွင့်ပြု/ငြင်းပယ်မှု၊ သတင်းဟောင်း/ပျောက်ဆုံးမှု၊ offline state နှင့် map attribution စစ်ဆေးပါ။ တရားဝင် real-time alert၊ JMA ခေါင်းစဉ်မှ active warning၊ tsunami propagation simulation သို့မဟုတ် shelter ဖွင့်ထားခြင်းကို အာမမခံပါနှင့်။

**ဘေးအန္တရာယ် သတိပေးချက်နှင့် အသိပေးချက်များ:** အသုံးပြုသူက သတိပေးသံ ခလုတ်ကို ဖွင့်ပြီးမှသာ အက်ပ်သည် notification ခွင့်ပြုချက် တောင်းသည်။ ကိုယ်ရေးအချက်အလက် အဖြေများတွင် သတိပေးချက်အတွက် စက်ပေါ်တည်နေရာ အသုံးပြုမှုကို ဖော်ပြပါ၊ သတိပေးမျက်နှာပြင်၊ တုန်ခါမှုနှင့် notification အသံကို စက်အစစ်ပေါ်တွင် စစ်ဆေးပါ၊ သတိပေးချက်သည် အက်ပ်ဖွင့်ထားစဉ်သာ အလုပ်လုပ်ပြီး ဂျပန်၏ တရားဝင် အရေးပေါ်သတိပေးချက်ကို အစားမထိုးကြောင်း store အချက်အလက်တွင် ဖော်ပြပါ။

**လက်ရှိလိုအပ်ချက်များမှာ Store ပုံများနှင့် screenshot၊ privacy policy URL၊ လက်မှတ်ထိုးထားသော native build စမ်းသပ်ချက်နှင့် store review ရလဒ်တို့ ဖြစ်သည်။ စာရွက်စာတမ်းထည့်ခြင်းတစ်ခုတည်း မလုံလောက်ပါ။**

## 6. အပ်ဒိတ်နှင့် ထိန်းသိမ်းခြင်း

အပ်ဒိတ်တိုင်း version နှင့် build number တိုးပါ၊ စက်တွင် ထပ်မံစမ်းသပ်ပါ၊ ရနိုင်လျှင် အဆင့်လိုက်ထုတ်ဝေပါ၊ crash နှင့် data provider စည်းမျဉ်းများ စောင့်ကြည့်ပါ၊ privacy disclosure များကို ပြင်ဆင်ပါ။ သတင်းရင်းမြစ် ပျက်ကွက်လျှင် အခြေအနေကို ဖော်ပြ၍ တရားဝင် သတိပေးလမ်းကြောင်းသို့ ညွှန်းပါ။

## တရားဝင် ကိုးကားချက်များ

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[ဖြန့်ချိမှု အကျဉ်းချုပ်](../deploy/DEPLOY.my.md) · [စာရွက်စာတမ်း အညွှန်း](../README.md)
