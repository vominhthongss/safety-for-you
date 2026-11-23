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

- `EXPO_PUBLIC_REFRESH_SECONDS`: refresh interval (minimum 60 s).
- `EXPO_PUBLIC_JMA_PROXY_URL`: optional Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: optional self-hosted Kanji/Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: app identifiers for native builds.
- `EXPO_PUBLIC_*` values are embedded in public client bundles; never put secrets in them.
- Leaflet 1.9.4 is generated locally by `postinstall` into `src/generated/leafletAssets.js`. Map raster tiles still require network access.

## ရွေးချယ်နိုင်သော ဝန်ဆောင်မှုများ

ရွေးချယ်နိုင်သော Cloudflare Worker သည် /hazards တွင် JMA သတင်းခေါင်းစဉ်များ ပေးသည်။ လက်ရှိအရေးပေါ်သတိပေးချက် မဟုတ်ပါ။ Romaji service လည်း ရွေးချယ်နိုင်ပြီး အများပြည်သူသို့ ဖွင့်လှစ်ပါက HTTPS နှင့် rate limit လိုအပ်သည်။

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Store build

App Store များတွင် ဖြန့်ချိရန် Expo/EAS သို့ ဝင်ရောက်ပြီး build ကို သတ်မှတ်ကာ Android နှင့် iOS production build ပြုလုပ်ပါ။ App ID များကို ထုတ်ဝေသူက စီမံရမည်။

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## မထုတ်ဝေမီ စစ်ဆေးရန်

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

မထုတ်ဝေမီ privacy အချက်အလက်၊ icon၊ screenshot၊ ဆက်သွယ်ရန်လိပ်စာ၊ ဖုန်းအစစ်/accessibility စမ်းသပ်မှုနှင့် တရားဝင်သတိပေးစနစ် မဟုတ်ကြောင်း ရှင်းလင်းချက် ထည့်ပါ။ JS export အောင်မြင်ခြင်းသည် ဘေးကင်းရေး သို့မဟုတ် App Store ခွင့်ပြုချက် မဟုတ်ပါ။

## Open-source စည်းကမ်းချက်များ

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.my.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
