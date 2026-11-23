# Safety For You — မိတ်ဆက်နှင့် တင်သွင်းလည်ပတ်ခြင်း လမ်းညွှန်

[ဆော့ဖ်ဝဲဖွဲ့စည်းပုံ ဆုံးဖြတ်ချက်မှတ်တမ်း](ADR.md) · [🌐](../README.md)

## 1. စီမံကိန်းနှင့် အများသုံးရင်းမြစ်ကုဒ်

Safety For You သည် ဂျပန်တွင်နေထိုင်သူများနှင့် ခရီးသွားများအတွက် အခမဲ့၊ အကျိုးအမြတ်မယူသော မိုဘိုင်းအက်ပ်ဖြစ်သည်။ ငလျင်၊ ဆူနာမီ၊ မကြာသေးမီက မိုးလေဝသသတင်း၊ မြေပုံနှင့် သတ်မှတ်ထားသော အရေးပေါ်ရွှေ့ပြောင်းနေရာများကို စုစည်းပေးသည်။ အစိုးရဝန်ဆောင်မှုမဟုတ်သော သီးခြားစီမံကိန်းဖြစ်သည်။ အက်ပ်ဖွင့်ထားချိန်တွင်သာ သတင်းမွမ်းမံပြီး နောက်ခံအရေးပေါ် push သို့မဟုတ် အင်တာနက်မရှိဘဲ လုံခြုံရေးကို အာမမခံပါ။

မူရင်း code နှင့် စာရွက်စာတမ်းကို [MIT](../../LICENSE) ဖြင့် ဖြန့်ဝေသည်။ မူပိုင်ခွင့်နှင့် ခွင့်ပြုချက်စာသားကို ထိန်းသိမ်း၍ အသုံးပြု၊ ပြုပြင်၊ ပြန်လည်ဖြန့်ဝေ၊ ရောင်းချနိုင်သည်။ စီးပွားဖြစ် fork ကိုလည်း ခွင့်ပြုသော်လည်း အာမခံမရှိပါ။ ပြင်ပဒေတာ၊ မြေပုံနှင့် library များတွင် [သီးခြားစည်းမျဉ်း](../../THIRD_PARTY_NOTICES.md) ရှိသည်။ ပါဝင်ကူညီရန် fork၊ branch၊ စစ်ဆေးခြင်းနှင့် PR ကိုအသုံးပြုပြီး လျှို့ဝှက်အချက်အလက်နှင့် signing key များကို Git ထဲမထည့်ပါနှင့်။

## 2. လိုအပ်ချက်များ

Node.js 22+၊ npm၊ Git နှင့် SDK 58 ကိုက်ညီသော Expo Go လိုအပ်သည်။ မိမိစက်တွင် iOS build အတွက် macOS/Xcode၊ Android အတွက် ကိုက်ညီသော SDK/JDK လိုအပ်သည်။ Cloud build တွင် Expo အကောင့်၊ စတိုးတင်ရန် မိမိ Apple Developer/Google Play Console အကောင့်လိုအပ်သည်။ Database သို့မဟုတ် Google Maps key မလိုပါ။

## 3. မိမိစက်တွင် စတင်ခြင်း

Repository အမြစ်ဖိုလ်ဒါတွင် လုပ်ဆောင်ပါ။ ရှိပြီးသား `.env` ကို မရေးထပ်ဘဲ အောက်ပါဇယားဖြည့်ပြီး Expo Go မှ QR ဖတ်ပါ။ Install တွင် Leaflet ကို ထည့်ပေးသည်။ ထုတ်လုပ်ထားသည့်ဖိုင်မရှိပါက `npm run bundle:maps` လုပ်ပါ။ ဘာသာစကား ၁၃ မျိုးရှိသော်လည်း ja/en/vi ပြင်ပရှိ UI စာသားအချို့မှာ အင်္ဂလိပ်ဘာသာသို့ ပြန်သွားနိုင်သည်။

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Variable | အဓိပ္ပာယ် |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | စတင်ချိန် စောင့်ဆိုင်းမှု 0–600 ms။ |
| `EXPO_PUBLIC_REFRESH_SECONDS` | အက်ပ်ဖွင့်ထားချိန် refresh အနည်းဆုံး 60 စက္ကန့်၊ ပုံမှန် 120။ |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker HTTPS အခြေခံ URL၊ /hazards မပါရ။ ဗလာဆို မိုးလေဝသရင်းမြစ်ပိတ်မည်။ |
| `EXPO_PUBLIC_ROMAJI_API_URL` | Romaji HTTPS အခြေခံ URL၊ /romaji မပါရ။ ဗလာဆို စက်တွင်းဖတ်ပုံသာ။ |
| `ANDROID_PACKAGE` | မိမိ Android application ID။ |
| `IOS_BUNDLE_ID` | မိမိ iOS bundle ID။ |
| `EAS_PROJECT_ID` | Expo project UUID။ Expo Go တွင် ချန်ထားနိုင်ပြီး EAS တွင် မိမိ project ကို ချိတ်ရမည်။ |

## 4. ရွေးချယ်နိုင်သော JMA Worker

`wrangler.toml` တွင် မတူညီသောအမည်သတ်မှတ်၍ Cloudflare login ဝင်ပြီး အမြစ်ဖိုလ်ဒါမှ deploy လုပ်ပါ။ နမူနာ host ကို Wrangler ပေးသည့် URL ဖြင့် အစားထိုးပါ။ `/hazards` JSON တွင် `items` နှင့် `kind` ရှိရမည်။ `degraded: true` သည် ရင်းမြစ်တချို့ မအောင်မြင်ခြင်းဖြစ်သည်။ အခြေခံ URL ကို `.env` တွင် ထည့်ပါ။ Worker သည် JMA Atom ခေါင်းစဉ်များသာ ခွဲပြီး လက်ရှိသတိပေးချက် အကျုံးဝင်မှု သို့မဟုတ် တိုင်းတာချက်ကို အတည်မပြုပါ။

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. ရွေးချယ်နိုင်သော Romaji ဝန်ဆောင်မှု

VPS ၏ အခြား terminal တွင် စတင်ပါ။ အမှန်တကယ်လည်ပတ်ရန် systemd၊ container သို့မဟုတ် process manager၊ port 3088 ရှေ့တွင် HTTPS reverse proxy နှင့် တိုက်ရိုက်ဝင်ရောက်မှု၊ request အရွယ်နှင့် အကြိမ်ရေကန့်သတ်ချက် ထားပါ။ `/health` မှ `{"ok":true}` နှင့် POST `/romaji` မှ ဖတ်ပုံ array ကိုစစ်ပြီး အခြေခံ URL သတ်မှတ်ပါ။ နေရာအမည်၊ သတင်းနှင့် ခိုလှုံရာလိပ်စာများ ပို့နိုင်သဖြင့် request body log ကို လျှော့ပါ။ ဝန်ဆောင်မှုပျက်လည်း စက်တွင်းအဘိဓာန်/Kana ဆက်လက်အလုပ်လုပ်သည်။

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Android နှင့် iOS build

Expo dashboard တွင် မိမိ project ဖန်တီးပြီး UUID ကို `EAS_PROJECT_ID` တွင်ထည့်ပါ။ ပထမ build မတိုင်မီ ID နှစ်ခုကို ရွေးပြီး fork ဆို `app.config.js` ၏ name/slug/scheme ပြောင်းပါ။ `eas.json` တွင် preview (Android APK/iOS ad hoc)၊ simulator (iOS Simulator)၊ production (Android AAB/iOS store) ရှိသည်။ ဇယားမှဖြည့်ထားသည့် variable များကို Expo preview နှင့် production နှစ်ခုလုံးတွင် သတ်မှတ်ပါ။ Git ချန်ထားသည့် `.env` သည် cloud သို့ အလိုအလျောက်မတက်ပါ။ ဤတန်ဖိုးများသည် အများမြင်နိုင်သော config ဖြစ်သည်။ ပြောင်းလဲပြီး Metro ပြန်စ သို့မဟုတ် build ပြန်လုပ်ပါ။

Login ဝင်ပြီး လိုအပ်သည့် command ရွေးပါ။ EAS မှ download URL ပေးမည်။ iOS ad hoc အတွက် `npx eas-cli device:create` နှင့် Apple signing လိုသည်။ Simulator build ကို iPhone တွင် မတင်နိုင်ပါ။ မိမိစက်တွင် tools အဆင်သင့်ဆို `--local` ထည့်နိုင်သည်။

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. အက်ပ်စတိုးသို့ ပို့ခြင်း

production build ပြီး လိုသည့် platform ကိုတင်ပါ။ Signing ကို EAS မှ စီမံပြီး key ကို Git ထဲမထည့်ပါနှင့်။ Google Play အတွက် AAB၊ iOS အတွက် App Store Connect/TestFlight ဖြစ်ပြီး အလိုအလျောက် အများပြည်သူထံ မထုတ်ပြန်ပါ။ ဖော်ပြချက်၊ icon၊ screenshot၊ privacy policy၊ ဒေတာကြေညာချက်နှင့် စက်အစစ်စမ်းသပ်မှု ပြီးမှ review တောင်းပါ။ App Store Connect ID နှင့် Google service-account key ကို မိမိဖြန့်ဝေမှုအကောင့်တွင် ထိန်းသိမ်းပါ။

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. စစ်ဆေးခြင်း

အောက်ပါ command များပြီး စက်အစစ်နှစ်မျိုးတွင် ဘာသာ ၁၃ မျိုး၊ 日本語 အမည်၊ ထုတ်ပြန်/ဖြစ်ပွားချိန်၊ အခြား timezone မှ ဂျပန်သန်းခေါင်၊ light/dark/high contrast၊ စာလုံး 200%၊ VoiceOver/TalkBack နှင့် modal focus၊ Reduce Motion၊ တည်နေရာငြင်းပယ်ခြင်း၊ ကွန်ရက်ပျက်ခြင်းနှင့် မြေပုံရင်းမြစ်တို့ကိုစစ်ပါ။ JS export အောင်မြင်ခြင်းသည် native စမ်းသပ်မှု သို့မဟုတ် Apple ခွင့်ပြုချက် မဟုတ်ပါ။ [UI စစ်ဆေးချက်](../UI_DESIGN.md) ကိုကြည့်ပါ။

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. မွမ်းမံခြင်းနှင့် ပြန်လည်ရယူခြင်း

စစ်ပြီး commit နှင့် build နံပါတ်ကို မှတ်ပါ။ `app.config.js` version ကိုပြောင်းပြီး production နံပါတ်ကို EAS ကတိုးပေးသည်။ EAS Update မတပ်ဆင်ထားသဖြင့် native build အသစ်လိုသည်။ Worker ကို တည်ငြိမ်သော commit/Cloudflare rollback၊ Romaji ကို ယခင်ဗားရှင်းပြန်စ၍ ပြန်ယူပါ။ Store app ကို တိတ်တဆိတ် downgrade မရဘဲ ယခင် source ကို နံပါတ်ပိုကြီးဖြင့် build လုပ်ပါ။ Endpoint နှင့် မြေပုံသတ်မှတ်ချက်များကို စောင့်ကြည့်ပါ။

## 10. ကိုးကားချက်များ

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
