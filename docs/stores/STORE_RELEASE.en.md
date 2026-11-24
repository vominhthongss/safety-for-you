# Publishing to Google Play and the Apple App Store

This guide applies to Safety For You (Expo SDK 58). The application is independent, free, nonprofit disaster-information software. It does not replace JMA, J-Alert, local authorities, or emergency broadcasts. Store approval is not guaranteed.

## 1. Prerequisites and verification

Use Node.js 22+, a compatible Expo environment, an Expo account, and separate developer accounts for Google Play and Apple. The repository includes `package-lock.json` and `eas.json` (profiles `preview` and `production`). The commands below first validate the JavaScript project; they do not validate native store builds.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. Configure EAS, identifiers, and signing

Set `ANDROID_PACKAGE` and `IOS_BUNDLE_ID` in `.env` to identifiers you control before the first published release. These come from `app.config.js` and must match the store records; changing them later can create a different app. Run `build:configure` once to generate `eas.json` and link an Expo project, then review the resulting file.

```bash
cp .env.example .env
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` — Configuration example (review after generation):

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

**EAS project ID:** `app.config.js` is a dynamic configuration, so `eas init` cannot write `extra.eas.projectId` into it and stops with "Cannot automatically write to dynamic config". Run `npx eas-cli init`, copy the project ID it prints, and set `"env": { "EAS_PROJECT_ID": "<project-id>" }` in the `base` profile of `eas.json`. `app.config.js` copies this value to `extra.eas.projectId`. The project ID is an identifier, not a secret; never put credentials in `eas.json`. In this repository, `app.config.js` already contains the project ID of `@vominhthongss/safety-for-you` and sets `owner`; the `eas.json` step is needed only for a fork linked to a different EAS project.

The sample uses EAS-managed build numbers and automatic incrementing. Keep `expo.version` in `app.config.js` aligned with the marketed release. Never reuse an Android version code or an iOS build number for the same app version. Verify credentials and ownership in EAS; keep Android upload credentials and Apple signing keys private.

Set required build-time environment variables in the EAS production environment. `EXPO_PUBLIC_*` values are readable in the shipped app and must never contain secrets. The JMA Worker and Romaji service are optional; if absent, preserve the app's explicit unavailable/fallback states.

## 3. Google Play: Android App Bundle (AAB)

Enroll in Play Console, create an app, register the exact Android package ID, complete the store listing, and enable Play App Signing. EAS credentials sign the upload artifact; Google's app-signing key is managed separately. Store the upload keystore securely; never commit it.

Build an AAB for the production track. The first upload may be done manually in Play Console; later uploads can use Expo Submit once Google Play service-account credentials and API access are configured securely. An upload is not the same as public release.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli submit --platform android --latest
```

Upload to Internal testing or Closed testing first, invite testers, and check crashes, permissions, map rendering, and network failures. For personal developer accounts created after November 13, 2023, Google may require at least 12 opted-in testers for 14 consecutive days and approval for production access. Confirm the account's current requirements in Play Console.

Complete Data safety, the privacy policy URL (also accessible in-app), content rating, target audience, app access, data practices, screenshots, contact details, and requested permissions. Check the final AAB targets the currently required Play API level (API 36 for new phone apps as of November 2026); do not assume the SDK target from a JavaScript export.

## 4. Apple App Store: signed iOS archive (IPA)

Enroll in the Apple Developer Program, create the App ID and App Store Connect app with the identical iOS bundle identifier, and configure distribution certificates/provisioning through EAS. Ensure the correct Apple team owns the credentials.

Build a signed IPA, upload it to App Store Connect (Expo Submit uploads but does not publish), and test the processed build with TestFlight before submitting for App Review.

```bash
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform ios --latest
```

In App Store Connect, supply App Privacy answers, a working privacy policy URL, support contact/URL, accurate metadata, age rating, screenshots for required iPhone sizes and iPad where applicable (`supportsTablet: true`), review notes, and any demo access reviewers need. Select the build and submit it for App Review. Release only after approval.

## 5. Safety and release gate

Before any submission, test both iOS Apple Maps and Android Leaflet on physical devices; verify all 13 languages, large text and screen readers, foreground location denied/allowed, stale or missing bulletins, offline/error states, and map/data-provider attribution. Do not promise real-time emergency notifications, active warnings derived from JMA headlines, simulated tsunami propagation, or verified shelter opening status.

**Hazard alarm and notifications:** The app requests notification permission only after the user turns on the alarm-sound switch. Disclose on-device location use for the alarm in the privacy answers, verify the alarm screen, vibration and notification sound on physical devices, and state in store metadata that the alarm works only while the app is open and does not replace Japan's official Emergency Alerts.

**Privacy and permissions:** `app.config.js` sets an app-level privacy manifest (`ios.privacyManifests`, coarse location for app functionality, no tracking), `ITSAppUsesNonExemptEncryption = false`, specific location purpose strings, `android.allowBackup: false` and blocks `SYSTEM_ALERT_WINDOW` and the legacy storage permissions. The privacy policy is in `docs/privacy/` (English, Japanese, Vietnamese) and must be published, for example with GitHub Pages from `/docs`, before submission. Suggested questionnaire answers are in `docs/PRIVACY-DECLARATIONS.md`, `docs/REVIEW-NOTES.md`. Capture screenshots with `scripts/capture-store-screenshot.sh` and validate them with `npm run check:screenshots` (see `store/screenshots/README.md`).

**Current repository readiness gaps: no store screenshots (iPhone 6.9" or 6.5", iPad 13", Android phone) or privacy-policy URL; app icons, splash logo, Google Play icon and feature graphic are in `assets/` and `store/` (see `store/README.md`), no demonstrated signed device builds, and no verified store-review outcome. Complete these outside the documentation change before publishing.**

## 6. Releases and ongoing maintenance

Increment the public app version and build identifiers before updates, repeat device testing, use staged rollout where available, monitor crash reports and the providers' data policies, and update privacy disclosures when data practices change. If feeds fail, maintain an explicit degraded state and direct users to official emergency channels.

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

[Deployment overview](../deploy/DEPLOY.en.md) · [Documentation index](../README.md)
