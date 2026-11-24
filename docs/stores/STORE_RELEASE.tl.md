# Gabay sa paglalathala sa Google Play at Apple App Store

Para sa Safety For You (Expo SDK 58) ang gabay na ito. Libre, hindi pangkalakal, at independiyenteng app ito para sa impormasyon sa sakuna; hindi ito kapalit ng JMA, J-Alert, mga lokal na awtoridad, o emergency broadcast. Hindi garantisado ang pag-apruba ng store.

## 1. Mga kinakailangan at pagsusuri

Ihanda ang Node.js 22+, katugmang Expo environment, Expo account, at magkahiwalay na Google Play at Apple developer account. Kasama na sa repositoryo ang `package-lock.json` at `eas.json` (mga profile na `preview` at `production`). Sinusuri lang ng mga sumusunod na command ang JavaScript, hindi ang native release.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. Pag-configure ng EAS, ID, at paglagda

Bago ang unang release, itakda sa `.env` ang natatanging `ANDROID_PACKAGE` at `IOS_BUNDLE_ID` na kontrolado ng publisher. Kailangang pareho ang mga ito sa `app.config.js` at sa store; ang pagbabago pagkatapos mailathala ay maaaring lumikha ng ibang app. Patakbuhin ang `build:configure` upang likhain ang `eas.json` at suriin ang Expo project link.

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — Halimbawa ng configuration (suriin pagkatapos buuin):

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

**EAS project ID:** Dynamic configuration ang `app.config.js`, kaya hindi maisusulat ng `eas init` ang `extra.eas.projectId` dito at hihinto ito sa "Cannot automatically write to dynamic config". Patakbuhin ang `npx eas-cli init`, kopyahin ang ipinakitang project ID, at itakda ang `"env": { "EAS_PROJECT_ID": "<project-id>" }` sa `base` profile ng `eas.json`. Kinokopya ng `app.config.js` ang value na ito sa `extra.eas.projectId`. Identifier ang project ID at hindi lihim; huwag maglagay ng credentials sa `eas.json`. Sa repositoryong ito, nakatakda na sa `app.config.js` ang project ID ng `@vominhthongss/safety-for-you` at ang `owner`; kailangan lamang ang hakbang sa `eas.json` para sa fork na naka-link sa ibang EAS project.

Pinamamahalaan ng EAS ang build number at awtomatikong itinataas ito sa halimbawa. I-update rin ang `expo.version` sa `app.config.js`. Huwag muling gamitin ang Android versionCode o iOS buildNumber. Panatilihing pribado ang mga signing credential at upload key.

Itakda sa EAS production environment ang mga kinakailangang variable. Nabubuksan sa client app ang `EXPO_PUBLIC_*`, kaya huwag maglagay ng lihim dito. Opsyonal ang JMA Worker at Romaji service; panatilihing malinaw ang estado kapag hindi naka-configure.

## 3. Google Play: Android App Bundle (AAB)

Magrehistro sa Play Console, gumawa ng app, itakda ang eksaktong Android package ID, punan ang store listing, at paganahin ang Play App Signing. Magkaiba ang app signing key ng Google at upload key ng EAS; huwag i-commit ang susi sa Git.

Bumuo ng production AAB. Maaaring mano-manong i-upload ang una sa Play Console; magagamit ang Expo Submit kapag ligtas na na-configure ang Google Play API at service account. Hindi awtomatikong pampubliko ang isang na-upload na build.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

Subukan muna sa Internal testing o Closed testing ang crash, pahintulot sa lokasyon, mapa, at pagkawala ng network. Para sa personal developer account na ginawa pagkatapos ng Nobyembre 13, 2023, maaaring hingin ang hindi bababa sa 12 tester na naka-opt in nang 14 na magkakasunod na araw at pag-apruba sa production access. Suriin ang Play Console.

Kumpletuhin ang Data safety, privacy policy URL sa store at app, content rating, target audience, app access, screenshot, contact, at deklarasyon ng pahintulot. Tiyaking natutugunan ng AAB ang target API (API 36 para sa bagong phone app noong Nobyembre 2026), hindi lang JavaScript export.

## 4. Apple App Store: nilagdaang iOS IPA

Sumali sa Apple Developer Program at gumawa ng App ID at App Store Connect app na may magkaparehong Bundle ID. I-configure sa EAS ang distribution certificate at provisioning profile at tiyakin ang tamang Apple team.

Bumuo ng nilagdaang IPA, i-upload sa App Store Connect, at subukan ang naprosesong build sa TestFlight. Nag-a-upload lang ang Expo Submit; hindi ito awtomatikong naglalathala.

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

Sa App Store Connect, punan ang App Privacy, gumaganang privacy policy at support URL, wastong paglalarawan, age rating, kinakailangang iPhone at iPad screenshot (`supportsTablet: true`), review notes, at test account kung kailangan. Piliin ang build, isumite sa App Review, at ilathala kapag naaprubahan.

## 5. Kaligtasan at huling pagsusuri

Subukan sa tunay na iOS at Android device ang Apple Maps at Leaflet, 13 wika, accessibility, pinayagan o tinanggihang lokasyon, luma o nawawalang bulletin, offline state, at pagkilala sa map provider. Huwag mag-angkin ng opisyal na real-time alert, aktibong babala mula lamang sa JMA headline, tsunami simulation, o garantisadong bukas na evacuation center.

**Alarma sa sakuna at mga notification:** Humihingi lamang ang app ng pahintulot sa notification pagkatapos i-on ng user ang switch ng tunog ng alarma. Ipahayag sa mga sagot sa privacy ang paggamit ng lokasyon sa device para sa alarma, suriin sa pisikal na device ang alarm screen, pag-vibrate at tunog ng notification, at isaad sa store metadata na gumagana lamang ang alarma habang bukas ang app at hindi nito pinapalitan ang opisyal na Emergency Alerts ng Japan.

**Privacy at mga pahintulot:** Itinatakda ng `app.config.js` ang app-level na privacy manifest (`ios.privacyManifests`, tinatayang lokasyon para sa functionality ng app, walang tracking), `ITSAppUsesNonExemptEncryption = false`, tiyak na mga purpose string para sa lokasyon, `android.allowBackup: false`, at hinaharangan ang `SYSTEM_ALERT_WINDOW` at ang lumang storage permission. Nasa `docs/privacy/` (Ingles, Hapon, Vietnamese) ang privacy policy at kailangan itong mailathala bago magsumite, halimbawa gamit ang GitHub Pages mula sa `/docs`. Nasa `store/REVIEW-ANSWERS.md` ang mga iminumungkahing sagot sa mga questionnaire.

**Hindi pa kumpleto sa repositoryo ang mga screenshot para sa store (iPhone 6.9" o 6.5", iPad 13", Android phone; nasa `assets/` at `store/` ang mga icon at feature graphic, tingnan ang `store/README.md`), privacy policy URL, pagsusuri sa nilagdaang native build, at resulta ng store review. Kailangang kumpletuhin ang mga ito bago maglathala.**

## 6. Mga update at pagpapanatili

Taasan ang bersyon at build number sa bawat update, ulitin ang device tests, gamitin ang staged release kung available, subaybayan ang crash at data-provider terms, at i-update ang privacy disclosures kung nagbago ang pagproseso ng data. Ipakita ang malinaw na error state at ituro ang opisyal na babala kapag pumalya ang feed.

## Mga opisyal na sanggunian

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[Pangkalahatang deployment](../deploy/DEPLOY.tl.md) · [Talaan ng dokumentasyon](../README.md)
