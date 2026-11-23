# Safety For You — Pagpapakilala at gabay sa deployment

[Mga pasya sa arkitektura](ADR.md) · [🌐](../README.md)

## 1. Proyekto at bukas na source code

Ang Safety For You ay libreng nonprofit na mobile app para sa mga nakatira o bumibisita sa Japan. Pinagsasama nito ang ulat ng lindol at tsunami, mga bagong bulletin sa panahon, mapa at itinalagang lugar ng agarang paglikas. Isa itong malayang proyekto, hindi serbisyo ng pamahalaan. Nag-a-update lamang habang bukas ang app; walang garantisadong background emergency push o offline na kaligtasan.

Ang sariling code at dokumentasyon ay nasa [MIT](../../LICENSE): maaaring gamitin, baguhin, ipamahagi at ibenta basta panatilihin ang copyright at pahintulot. Pinapayagan din ang komersiyal na fork; walang warranty. May sariling [kondisyon ang third party](../../THIRD_PARTY_NOTICES.md). Para mag-ambag, mag-fork, gumawa ng branch, magsuri at magbukas ng PR. Huwag i-commit ang credentials o signing keys.

## 2. Mga kailangan

Kailangan ang Node.js 22+, npm, Git at Expo Go na tugma sa SDK 58. Para sa lokal na iOS build, kailangan ang macOS/Xcode; Android ay nangangailangan ng tugmang SDK/JDK. Gumamit ng sariling Expo account para sa cloud build at Apple Developer/Google Play Console para sa store. Walang kailangang database o Google Maps key.

## 3. Pagpapatakbo sa lokal

Patakbuhin sa ugat ng repository. Huwag patungan ang dati nang `.env`; punan ang talahanayan at i-scan ang QR sa Expo Go. Awtomatikong binubuo ang Leaflet assets sa install; kung kulang, patakbuhin ang `npm run bundle:maps`. May 13 pagpipiliang wika; ang ilang lumang teksto sa labas ng ja/en/vi ay bumabalik sa English.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Variable | Kahulugan |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | Opsyonal na paghihintay sa simula, 0–600 ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | Pag-refresh sa foreground: hindi bababa sa 60 segundo, default 120. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | HTTPS base URL ng Worker, walang /hazards; blangko para patayin ang weather feed. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | HTTPS base URL ng Romaji, walang /romaji; blangko para lokal na pagbasa lamang. |
| `ANDROID_PACKAGE` | Sariling Android application ID. |
| `IOS_BUNDLE_ID` | Sariling iOS bundle ID. |
| `EAS_PROJECT_ID` | UUID ng Expo project; opsyonal sa Expo Go, kailangan ang sariling project para sa EAS. |

## 4. Opsyonal na JMA Worker

Pumili ng natatanging pangalan sa `wrangler.toml`, mag-login sa Cloudflare at mag-deploy mula sa ugat. Palitan ang halimbawang hostname ng ibinalik na URL. Dapat may `items` at `kind` ang JSON ng `/hazards`; ang `degraded: true` ay bahagyang kabiguan ng mga source. Ilagay ang base URL sa `.env`. Mga pamagat ng JMA Atom lamang ang ikinakategorya; hindi nito tinitiyak ang kasalukuyang bisa ng babala o sukat ng panahon.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. Opsyonal na serbisyong Romaji

Simulan sa ibang terminal ng VPS. Sa production, gumamit ng systemd, container o process manager; maglagay ng HTTPS reverse proxy sa harap ng port 3088 at limitahan ang direktang access, laki at dami ng request. Suriin ang `{"ok":true}` sa `/health` at array ng pagbasa sa POST `/romaji`, saka itakda ang base URL. Maaaring ipadala ang pangalan, bulletin at address ng silungan, kaya iwasan ang di-kailangang body logs. Mananatili ang lokal na diksyunaryo/Kana kapag pumalya.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Pagbuo para sa Android at iOS

Gumawa ng sariling project sa Expo dashboard at ilagay ang UUID sa `EAS_PROJECT_ID`. Itakda ang parehong app ID bago ang unang build; palitan ang name/slug/scheme sa `app.config.js` kapag nag-fork. Nasa `eas.json` ang preview (Android APK/iOS ad hoc), simulator (iOS Simulator), production (Android AAB/iOS store). Ilagay ang lahat ng nakatakdang variable sa parehong preview at production environment sa Expo. Hindi naiu-upload ang Git-ignored `.env`; pampublikong configuration ang mga ito, hindi lihim. I-restart ang Metro o mag-build muli kapag nagbago.

Mag-login, saka piliin ang build command. Magbibigay ang EAS ng download URL. Kailangan ng iOS ad hoc ang `npx eas-cli device:create` at Apple signing. Hindi puwede ang Simulator build sa iPhone. Idagdag ang `--local` kung handa ang lokal na native tools.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. Pagsumite sa mga store

Gumawa ng production build bago magsumite. Sa EAS pamahalaan ang signing; huwag ilagay ang keys sa Git. AAB para sa Google Play; sa App Store Connect/TestFlight mapupunta ang iOS, hindi awtomatikong nailalathala. Kumpletuhin ang detalye, icon, screenshot, privacy policy, data disclosure at pagsubok sa tunay na device bago review. Sa sariling release account pangasiwaan ang app ID at Google service-account key.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. Pagsusuri

Patakbuhin ang mga pagsusuri at subukan sa tunay na iOS/Android: 13 wika, 日本語, oras ng paglabas/pangyayari, hatinggabi sa Japan mula sa ibang timezone, light/dark/high contrast, 200% na teksto, VoiceOver/TalkBack at modal focus, Reduce Motion, tinanggihang lokasyon, pagkawala ng network at map attribution. Ang JS export ay hindi native test o pahintulot ng Apple. Tingnan ang [UI audit](../UI_DESIGN.md).

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. Pag-update at pagbabalik

Itala ang nasuring commit at build ID. Baguhin ang version sa `app.config.js`; EAS ang nagpapataas ng production build number. Walang EAS Update, kaya kailangan ng bagong native build. I-deploy muli ang matatag na Worker commit o Cloudflare rollback; i-restart ang dating Romaji release. Hindi tahimik na maibababa ang store app: i-build ang dating source gamit ang mas mataas na numero. Bantayan ang endpoints at limitasyon ng mga provider.

## 10. Mga sanggunian

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
