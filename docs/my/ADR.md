# Safety For You — ဆော့ဖ်ဝဲဖွဲ့စည်းပုံ ဆုံးဖြတ်ချက်မှတ်တမ်း

လက်ခံထားသည် · 2026-11-23 · ဤ branch ရှိ code အတိုင်း

[မိတ်ဆက်နှင့် တင်သွင်းလည်ပတ်ခြင်း လမ်းညွှန်](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo နှင့် မြေပုံ

**နောက်ခံ:** Platform နှစ်ခုတွင် SDK 58 Expo Go လိုသည်။

**ဆုံးဖြတ်ချက်:** JavaScript၊ Expo 58/RN 0.88၊ WebView ရှိ Leaflet 1.9.4 ကို npm တွင်ထည့်ပြီး OSM Japan အင်္ဂလိပ်မြေပုံသုံးသည်။

**အကျိုးဆက်:** MapLibre native မလိုသော်လည်း ကွန်ရက်၊ ရင်းမြစ်ဖော်ပြမှု၊ capacity နှင့် စက်အစစ်စမ်းသပ်မှုလိုသည်။


## ADR-002 — ရင်းမြစ်အခြေခံသတင်း

**နောက်ခံ:** Magnitude၊ Shindo၊ ဆူနာမီအဆင့် ကွဲပြားပြီး သတင်းဟောင်းသည် လက်ရှိသတိပေးချက်မဟုတ်ပါ။

**ဆုံးဖြတ်ချက်:** P2PQuake 551/552/556၊ ထုတ်ပြန်/ဖြစ်ပွားချိန်နှင့် ထုတ်ပြန်အဆင့်ကို ထိန်းထားပြီး အတည်ပြု JMA နယ်မြေသာ ချိတ်သည်။

**အကျိုးဆက်:** Worker သည် ခေါင်းစဉ်သာဖြစ်သည်။ ကိန်းဂဏန်း၊ တည်နေရာ၊ အကျုံးဝင်မှု မခန့်မှန်းရ။ နယ်မြေသည် လှိုင်း/ရေလွှမ်း simulation မဟုတ်ဘဲ စာသားနှင့် official link ထားသည်။


## ADR-003 — ဖွင့်ထားချိန် update

**နောက်ခံ:** စောင့်ကြည့်ထားသော push infrastructure မရှိပါ။

**ဆုံးဖြတ်ချက်:** REST အနည်းဆုံး 60 စက္ကန့်၊ WebSocket reconnect၊ နောက်ခံတွင်ရပ်၊ AsyncStorage နှင့် အသုံးပြုသူလုပ်ဆောင်ပြီးမှ နေရာခွင့်တောင်းသည်။

**အကျိုးဆက်:** နောက်ခံအရေးပေါ်ပို့မှု/အချိန်ကို မအာမခံပါ။ ယခင်ခွင့်ပြုချက်ပြန်သုံးနိုင်ပြီး ငြင်းလည်းသတင်းဖတ်ရသည်။


## ADR-004 — ဘာသာနှင့် ဖတ်ပုံ

**နောက်ခံ:** မူရင်းနေရာအမည်ကို သိနိုင်ရမည်။

**ဆုံးဖြတ်ချက်:** ၁၃ ဘာသာ i18n၊ အင်္ဂလိပ် fallback၊ picker တွင် 日本語 သာ၊ အခြားဂျပန်စာတွင် Romaji။ အဘိဓာန်/Kana နှင့် ရွေးချယ်နိုင်သော Kuroshiro။

**အကျိုးဆက်:** စာတမ်း ၁၃ ဘာသာရှိပြီး ja/en/vi ပြင်ပ UI ဟောင်းမှာ အစိတ်အပိုင်းသာဖြစ်သည်။ မသိသောအသံ မခန့်မှန်းဘဲ Romaji ကို လုံခြုံရေးဘာသာပြန်ဟု မယူရ။


## ADR-005 — ဂျပန်အချိန်နှင့် လက်လှမ်းမီမှု

**နောက်ခံ:** Timezone နှင့် စာကြီးခြင်းကြောင့် မှားဖတ်/ထပ်ဖုံးနိုင်သည်။

**ဆုံးဖြတ်ချက်:** Offset မပါချိန်ကို JST၊ ISO offset ကိုထိန်းပြီး Asia/Tokyo အရ ယနေ့သတ်မှတ်သည်။ မိနစ်တိုင်း/ပြန်ဖွင့်ချိန် update၊ ရက်/JST အပြည့်၊ အချိန်ရောင်၊ 44pt၊ စာချဲ့၊ modal focus နှင့် Reduce Motion။

**အကျိုးဆက်:** ဖြစ်ပွား/ထုတ်ပြန်ချိန်ခွဲပြီး legend ကိုမြေပုံအောက်ထားသည်။ Apple HIG သည် စတိုးခွင့်ပြုချက် သို့မဟုတ် certification မဟုတ်ပါ။


## ADR-006 — သီးခြားဝန်ဆောင်မှု

**နောက်ခံ:** JMA နှင့် ရှားသော Kanji အတွက် server လိုသည်။

**ဆုံးဖြတ်ချက်:** Cloudflare Worker နှင့် Node Romaji ခွဲထားပြီး HTTPS EXPO_PUBLIC URL၊ ပြင်ပအမည်ကို text အဖြစ်သာပြသည်။

**အကျိုးဆက်:** Public cache၊ rate limit နှင့် monitoring လိုသည်။ Config သည် app ထဲရှိပြီး provider များထံ metadata၊ မြေပုံနှင့် ရွေးချယ်ထားသောစာသား ရောက်သည်။


## ADR-007 — MIT နှင့် ဖြန့်ဝေမှု

**နောက်ခံ:** ပြန်သုံးခွင့်နှင့် release လမ်းကြောင်းရှင်းရမည်။

**ဆုံးဖြတ်ချက်:** မူရင်း code/docs ကို MIT၊ ပြင်ပစည်းကမ်းဆက်ထား၊ EAS profile သုံးခုခွဲ၊ key Git အပြင်ထားသည်။

**အကျိုးဆက်:** Notice ထိန်း၍ commercial fork ရသည်။ Hosting/account ကိုမိမိစီမံပြီး OTA သို့မဟုတ် အစိုးရထောက်ခံမှုမရှိပါ။

## ကိုးကားချက်များ

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
