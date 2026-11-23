# ဖြန့်ချိခြင်း လမ်းညွှန် — Safety For You (မြန်မာ)

Safety For You သည် ဂျပန်သဘာဝဘေးသတင်းအတွက် အခမဲ့၊ အကျိုးအမြတ်မယူသော open-source app ဖြစ်ပြီး MIT လိုင်စင်ဖြင့် ထုတ်ဝေထားသည်။ JMA၊ J-Alert သို့မဟုတ် ဒေသန္တရအစိုးရ ညွှန်ကြားချက်များကို အစားမထိုးပါ။

## လိုအပ်ချက်များ

Node.js 22+ နှင့် SDK 58 နှင့် ကိုက်ညီသော Expo Go လိုအပ်သည်။ Repository တွင် lockfile မရှိသဖြင့် npm install ကို လုပ်ဆောင်ပါ။

## စက်တွင် စမ်းသပ်ခြင်း

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: Refresh interval ကို စက္ကန့်ဖြင့် သတ်မှတ်သည် (အနည်းဆုံး 60)။
- `EXPO_PUBLIC_JMA_PROXY_URL`: JMA ခေါင်းစဉ်များအတွက် ရွေးချယ်နိုင်သော Cloudflare Worker URL။
- `EXPO_PUBLIC_ROMAJI_API_URL`: ရွေးချယ်နိုင်သော Kanji-to-Romaji ကိုယ်ပိုင် service URL။
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: လက်မှတ်ထိုး Android/iOS build များအတွက် တည်ငြိမ်သော ID။
- `EXPO_PUBLIC_*`: Public variable များသည် app တွင် ပါဝင်သဖြင့် လျှို့ဝှက်ချက် မထားပါနှင့်။
- `Leaflet 1.9.4`: `postinstall` က `src/generated/leafletAssets.js` ဖန်တီးပြီး map tile များအတွက် Internet လိုအပ်သည်။

## ရွေးချယ်နိုင်သော ဝန်ဆောင်မှုများ

ရွေးချယ်နိုင်သော Cloudflare Worker သည် /hazards တွင် JMA သတင်းခေါင်းစဉ်များ ပေးသည်။ လက်ရှိအရေးပေါ်သတိပေးချက် မဟုတ်ပါ။ Romaji service လည်း ရွေးချယ်နိုင်ပြီး အများပြည်သူသို့ ဖွင့်လှစ်ပါက HTTPS နှင့် rate limit လိုအပ်သည်။

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Kanji/Romaji အတွက်`romaji-service/README.md`ကို ကြည့်ပါ (Node.js 22+, HTTPS, request limit)။ Service မတင်ထားပါက URL အလွတ်ထားပါ။ Worker မရှိလျှင် weather headline မရနိုင်ပါ။ `.env` ပြင်ဆင်ပြီး Expo ပြန်စတင်ပါ။

## Store build

App Store များတွင် ဖြန့်ချိရန် Expo/EAS သို့ ဝင်ရောက်ပြီး build ကို သတ်မှတ်ကာ Android နှင့် iOS production build ပြုလုပ်ပါ။ App ID များကို ထုတ်ဝေသူက စီမံရမည်။

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Repository တွင်`eas.json`မရှိသေးပါ။ `build:configure` ကို တစ်ကြိမ်လုပ်ဆောင်ပြီး production setting စစ်ဆေးပါ။ Build မပြုလုပ်မီ signing credential၊ store account၊ ID နှင့် environment variable တို့ကို ပြင်ဆင်ပါ။ အသေးစိတ်အတွက် အောက်ပါလမ်းညွှန်ကို ကြည့်ပါ။

## မထုတ်ဝေမီ စစ်ဆေးရန်

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

မထုတ်ဝေမီ privacy အချက်အလက်၊ icon၊ screenshot၊ ဆက်သွယ်ရန်လိပ်စာ၊ ဖုန်းအစစ်/accessibility စမ်းသပ်မှုနှင့် တရားဝင်သတိပေးစနစ် မဟုတ်ကြောင်း ရှင်းလင်းချက် ထည့်ပါ။ JS export အောင်မြင်ခြင်းသည် ဘေးကင်းရေး သို့မဟုတ် App Store ခွင့်ပြုချက် မဟုတ်ပါ။

## Open-source စည်းကမ်းချက်များ

[MIT လိုင်စင်](../../LICENSE)အရ အရေးကြီးသော မိတ္တူများတွင် မူပိုင်ခွင့်နှင့် လိုင်စင်စာတမ်းကို ထိန်းသိမ်းထားပါက ကုန်သွယ်ရေးအပါအဝင် အသုံးပြုခြင်း၊ ပြင်ဆင်ခြင်း၊ ပြန်လည်ဖြန့်ချိခြင်းတို့ ပြုလုပ်နိုင်သည်။ Third-party library၊ map၊ tile နှင့် data feed များတွင် သီးခြားစည်းမျဉ်းရှိသည်။ ပံ့ပိုးမှုတိုင်းတွင် source attribution နှင့် ဘေးကင်းရေးအသိပေးချက် ထိန်းသိမ်းပါ။

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.my.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## App Store များသို့ ထုတ်ဝေခြင်း

Signing၊ testing၊ privacy၊ store review နှင့် ကျန်ရှိသော လုပ်ငန်းများအတွက်[Google Play နှင့် Apple App Store လမ်းညွှန်](../stores/STORE_RELEASE.my.md)ကို ဖတ်ပါ။
