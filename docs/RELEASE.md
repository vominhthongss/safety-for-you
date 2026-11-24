# Releasing Safety For You on Google Play and the App Store

Ordered steps. Mark `[x]` when done. Background and localized versions of the store procedure: [docs/stores/](stores/STORE_RELEASE.en.md). Audit and remaining risks: [RELEASE-AUDIT.md](RELEASE-AUDIT.md). The app contains no ads: [ADS-A-Z.md](ADS-A-Z.md).

- **Shared steps** (1–3): once, for both platforms.
- **Part A: Android / Google Play** (4–8).
- **Part B: iOS / App Store** (9–13).
- **Appendix**: testing without devices, common problems.

Suggested order: Android first. While the 14-day closed test runs (step 7), do Part B in parallel.

> **Where shared settings live**
> - App name, version, icons, permissions, privacy manifest: `app.config.js`.
> - Package / bundle ID: `ANDROID_PACKAGE`, `IOS_BUNDLE_ID` (default `com.vominhthongss.safetyforyou`). **They cannot change after the first upload.**
> - EAS project: `extra.eas.projectId` in `app.config.js` (`@vominhthongss/safety-for-you`); build profiles in `eas.json`.
> - Privacy policy URL: `CONFIG.privacyPolicyUrl` in `src/config.js`, overridable with `EXPO_PUBLIC_PRIVACY_POLICY_URL`.

## Already done

- [x] EAS profiles: `preview` (internal APK) and `production` (AAB, auto-incremented build numbers stored on EAS).
- [x] EAS project linked in `app.config.js` (a dynamic config cannot be written by `eas init`).
- [x] R8 and resource shrinking off for Android release (`expo-build-properties`).
- [x] Icons: app icon (RGB, no alpha), Android adaptive and monochrome, iOS 18 dark and tinted, Android notification icon, splash logo; Play icon 512 and feature graphic in `store/google-play/`.
- [x] App-level privacy manifest, `ITSAppUsesNonExemptEncryption = false`, specific location purpose strings, unused Android permissions blocked, backup off.
- [x] Privacy policy written in `docs/privacy/` (English, Japanese, Vietnamese) and linked from Home.

## 1. Code and configuration

- [ ] `version` in `app.config.js`: set the marketing version for the first release (for example `1.0.0`). Build numbers are incremented by EAS (`appVersionSource: remote`).
- [ ] `npm install && npm test` pass.
- [ ] Optional services: set `EXPO_PUBLIC_JMA_PROXY_URL` and `EXPO_PUBLIC_ROMAJI_API_URL` in the EAS environment if they are deployed; otherwise the app shows its "not configured" states.

## 2. Website and links

- [ ] GitHub → **Settings → Pages** → Deploy from a branch → `main` / `/docs`. Open `https://vominhthongss.github.io/safety-for-you/privacy/` and check the English, Japanese and Vietnamese pages. (Pages on a private repository requires a paid plan.)
- [ ] Support URL: `https://github.com/vominhthongss/safety-for-you/issues` opens without signing in.

## 3. Screenshots

- [ ] Capture from a real build with `scripts/capture-store-screenshot.sh`, then `npm run check:screenshots` passes. Folders, sizes and the shot list: [store/screenshots/README.md](../store/screenshots/README.md).

---

# Part A: Android / Google Play

## 4. Tools (once)

- [ ] Node.js 22+, then `npx eas-cli login` with the Expo account that owns `@vominhthongss/safety-for-you`.
- [ ] Android device with USB debugging, or Android Studio with an emulator (needed for screenshots).

## 5. Test on a phone

- [ ] `npx eas-cli build --platform android --profile preview`. The first build asks to create a keystore: answer **Yes** (EAS stores it). Never commit keystores.
- [ ] Install the APK from the build page link or QR code.
- [ ] Check:
  - Location prompt appears once; denying it keeps every screen usable.
  - Home: hazard list, latest updates, pull to refresh.
  - Earthquake: tap a report; the map shows the epicenter Shindo badge and your position; the round map button re-frames both.
  - Tsunami: coast colors and legend when a bulletin exists.
  - Evacuation places: list and map for each hazard.
  - "Alarm sound" switch asks for notification permission; denied state shows the explanation.
  - When a notification appears (an alarm while the app is open), the status-bar icon is the white shield, not a white square.
  - Japanese: Kanji shows Romaji; language menu and Light/Dark work.
  - Home → Privacy policy opens the published page.

## 6. Build the release `.aab`

- [ ] `npx eas-cli build --platform android --profile production`.
- [ ] Download the `.aab` from the build page (the first upload to Play is manual).

## 7. Google Play Console

- [ ] Developer account at play.google.com/console: **USD 25 one-time**, identity verification. Personal accounts must run closed testing (below); organization accounts need a D-U-N-S number.
- [ ] Create app: name **Safety For You**, type **App**, **Free**.
- [ ] Store listing: short and full description, icon `store/google-play/icon-512.png`, feature graphic `store/google-play/feature-graphic.png`, phone screenshots `store/screenshots/android-phone/`.
- [ ] App content: answers in [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md) (privacy policy, ads **No**, Data safety, target audience 13+, IARC, app access without login).
- [ ] **Testing → Closed testing**: create a release, upload the `.aab`.
- [ ] Personal account created after 2023-11-13: at least **12 opted-in testers for 14 consecutive days**, and they should actually use the app. Invite 15–20 people; record their feedback and the fixes.
- [ ] After 14 days: **Apply for production access** with specific answers (what testers reported, what changed).
- [ ] Trader status (EEA/UK) declared before 2027-02-01.
- [ ] Later uploads can use `npx eas-cli submit --platform android --latest` once a Google service-account key is configured in EAS (keep the JSON key out of Git).

## 8. After the Play release

- [ ] Check Android vitals (crashes, ANRs) and the pre-launch report.
- [ ] Before February 2027: review the Play technical quality requirements (R8 optimization coverage) and decide whether to turn R8 back on.

---

# Part B: iOS / App Store

## 9. Preparation (once)

- [ ] **Apple Developer Program**: **USD 99 per year** (the app is removed if the membership lapses). Individual accounts show the owner's legal name as the seller.
- [ ] EAS builds iOS in the cloud, so a Mac is not required to build. A Mac with Xcode is required for Simulator screenshots.
- [ ] Apple reviews more strictly than Google (crashes, broken links or missing information lead to rejection), but has no 12-tester rule.

## 10. Build and TestFlight

- [ ] `npx eas-cli build --platform ios --profile production`. Sign in with the Apple Developer account when asked; let EAS manage certificates and profiles.
- [ ] `npx eas-cli submit --platform ios --latest` uploads the build to App Store Connect.
- [ ] TestFlight: install on an iPhone (and an iPad if `supportsTablet` stays `true`) and repeat the step 5 checks, plus the iOS-specific items: large titles collapse, edge-swipe back, language menu in the navigation bar, Apple Maps.

## 11. Release build checks

- [ ] No export-compliance question appears (key set in the build).
- [ ] The build in App Store Connect shows the correct version and build number.

## 12. App Store Connect

- [ ] **My Apps → New App**: iOS, name **Safety For You**, bundle ID `com.vominhthongss.safetyforyou`, SKU (for example `safetyforyou`).
- [ ] App Information: category **Weather** (secondary **Reference**), privacy policy URL, 2026 age rating questionnaire (answers in [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md)).
- [ ] App Privacy: Coarse Location, App Functionality, not linked, no tracking.
- [ ] Version page: description, keywords, support URL, screenshots from `store/screenshots/iphone-6.9/` and `ipad-13/`. The icon comes from the build; do not upload it.
- [ ] App Review Information: notes from [REVIEW-NOTES.md](REVIEW-NOTES.md), demo video URL, phone number with country code.
- [ ] EU: trader status (DSA).
- [ ] Select the build → **Add for Review** → **Submit**. Review usually takes one to three days.

## 13. After the App Store release

- [ ] Watch crash reports in App Store Connect and TestFlight feedback.
- [ ] Keep store text accurate: never describe the app as official, real-time or guaranteed.

---

# Appendix

## Testing without physical devices

- **Android Studio emulator** (arm64 on Apple silicon): full app, screenshots with `scripts/capture-store-screenshot.sh android-phone <name>`.
- **iOS Simulator** (Xcode): `npx expo run:ios --configuration Release`, then `scripts/capture-store-screenshot.sh iphone-6.9 <name>`. Notifications and location can be simulated (Features → Location).
- A JavaScript export (`npx expo export`) only checks the bundle; it does not validate MapKit, WebView, signing or store review.

## Common problems

| Symptom | Fix |
| --- | --- |
| `Cannot automatically write to dynamic config` | Already handled: the project ID is set in `app.config.js`. For a fork, set `EAS_PROJECT_ID` in `eas.json` `build.base.env` |
| `eas.json is not valid … not allowed to be empty` | Do not leave empty strings in `env`; remove the key instead |
| Status-bar notification shows a white square | Rebuild: the notification icon is configured in `expo-notifications`; old builds lack it |
| Reviewer asks why "Always" location text exists | The location library references the API; the app never requests it (see [REVIEW-NOTES.md](REVIEW-NOTES.md)) |
| Map blank on Android | OSM Japan tiles need network; the app shows an error state instead of implying safety |
| Privacy policy link 404 | GitHub Pages not enabled, or the repository is private on a free plan |
