# Gabay sa paglalathala sa Google Play at Apple App Store

Para sa Safety For You (Expo SDK 58) ang gabay na ito. Libre, hindi pangkalakal, at independiyenteng app ito para sa impormasyon sa sakuna; hindi ito kapalit ng JMA, J-Alert, mga lokal na awtoridad, o emergency broadcast. Hindi garantisado ang pag-apruba ng store.

## 1. Mga kinakailangan at pagsusuri

Ihanda ang Node.js 22+, katugmang Expo environment, Expo account, at magkahiwalay na Google Play at Apple developer account. Wala pang npm lockfile o `eas.json` sa repositoryo. Sinusuri lang ng mga sumusunod na command ang JavaScript, hindi ang native release.

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
# Set ANDROID_PACKAGE and IOS_BUNDLE_ID in .env before the first release.
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` (example; review after generation):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

Pinamamahalaan ng EAS ang build number at awtomatikong itinataas ito sa halimbawa. I-update rin ang `expo.version` sa `app.config.js`. Huwag muling gamitin ang Android versionCode o iOS buildNumber. Panatilihing pribado ang mga signing credential at upload key.

Itakda sa EAS production environment ang mga kinakailangang variable. Nabubuksan sa client app ang `EXPO_PUBLIC_*`, kaya huwag maglagay ng lihim dito. Opsyonal ang JMA Worker at Romaji service; panatilihing malinaw ang estado kapag hindi naka-configure.

## 3. Google Play: Android App Bundle (AAB)

Magrehistro sa Play Console, gumawa ng app, itakda ang eksaktong Android package ID, punan ang store listing, at paganahin ang Play App Signing. Magkaiba ang app signing key ng Google at upload key ng EAS; huwag i-commit ang susi sa Git.

Bumuo ng production AAB. Maaaring mano-manong i-upload ang una sa Play Console; magagamit ang Expo Submit kapag ligtas na na-configure ang Google Play API at service account. Hindi awtomatikong pampubliko ang isang na-upload na build.

```bash
npx eas-cli build --platform android --profile production
# After configuring Google Play API access and service-account credentials:
npx eas-cli submit --platform android --latest
```

Subukan muna sa Internal testing o Closed testing ang crash, pahintulot sa lokasyon, mapa, at pagkawala ng network. Para sa personal developer account na ginawa pagkatapos ng Nobyembre 13, 2023, maaaring hingin ang hindi bababa sa 12 tester na naka-opt in nang 14 na magkakasunod na araw at pag-apruba sa production access. Suriin ang Play Console.

Kumpletuhin ang Data safety, privacy policy URL sa store at app, content rating, target audience, app access, screenshot, contact, at deklarasyon ng pahintulot. Tiyaking natutugunan ng AAB ang target API (API 36 para sa bagong phone app noong Nobyembre 2026), hindi lang JavaScript export.

## 4. Apple App Store: nilagdaang iOS IPA

Sumali sa Apple Developer Program at gumawa ng App ID at App Store Connect app na may magkaparehong Bundle ID. I-configure sa EAS ang distribution certificate at provisioning profile at tiyakin ang tamang Apple team.

Bumuo ng nilagdaang IPA, i-upload sa App Store Connect, at subukan ang naprosesong build sa TestFlight. Nag-a-upload lang ang Expo Submit; hindi ito awtomatikong naglalathala.

```bash
npx eas-cli build --platform ios --profile production
# After configuring Apple credentials and App Store Connect:
npx eas-cli submit --platform ios --latest
```

Sa App Store Connect, punan ang App Privacy, gumaganang privacy policy at support URL, wastong paglalarawan, age rating, kinakailangang iPhone at iPad screenshot (`supportsTablet: true`), review notes, at test account kung kailangan. Piliin ang build, isumite sa App Review, at ilathala kapag naaprubahan.

## 5. Kaligtasan at huling pagsusuri

Subukan sa tunay na iOS at Android device ang Apple Maps at Leaflet, 13 wika, accessibility, pinayagan o tinanggihang lokasyon, luma o nawawalang bulletin, offline state, at pagkilala sa map provider. Huwag mag-angkin ng opisyal na real-time alert, aktibong babala mula lamang sa JMA headline, tsunami simulation, o garantisadong bukas na evacuation center.

**Hindi pa kumpleto sa repositoryo ang `eas.json`, store assets at screenshot, privacy policy URL, pagsusuri sa nilagdaang native build, at resulta ng store review. Kailangang kumpletuhin ang mga ito bago maglathala.**

## 6. Mga update at pagpapanatili

Taasan ang bersyon at build number sa bawat update, ulitin ang device tests, gamitin ang staged release kung available, subaybayan ang crash at data-provider terms, at i-update ang privacy disclosures kung nagbago ang pagproseso ng data. Ipakita ang malinaw na error state at ituro ang opisyal na babala kapag pumalya ang feed.

## Official references

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[Deployment overview](../deploy/DEPLOY.tl.md) · [Documentation index](../README.md)
