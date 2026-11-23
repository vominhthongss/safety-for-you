# Safety For You — Introduction and deployment

[Architecture decision records](ADR.md) · [🌐](../README.md)

## 1. Project and open source

Safety For You is a free, nonprofit mobile app for people living in or visiting Japan. It brings together earthquake and tsunami reports, recent weather bulletins, maps, and designated emergency evacuation places. It is an independent project, not a government service. Updates run while the app is open; there is no background push-alert system or offline safety guarantee.

The source code and original documentation are available under the [MIT license](../../LICENSE): you may use, modify, redistribute, and sell copies while retaining the copyright and license notice. The nonprofit purpose of this project does not restrict commercial forks. The software has no warranty. External data, map tiles, and dependencies retain their own terms; see [third-party notices](../../THIRD_PARTY_NOTICES.md). To contribute, fork the repository, create a branch, run the checks below, and open a pull request. Never commit credentials or signing files.

## 2. Requirements

Use Node.js 22+, npm, Git, and an Expo Go version compatible with SDK 58. Native local iOS builds require macOS and Xcode; local Android builds require the Android SDK and JDK supported by this Expo version. Cloud builds use an Expo account. Store distribution also needs your own Apple Developer / Google Play Console account. No database or Google Maps key is required.

## 3. Local setup

Run at the repository root. Configure `.env` from the table below. Keep an existing `.env` instead of overwriting it. The install step bundles Leaflet automatically; if `src/generated/leafletAssets.js` is missing, run `npm run bundle:maps`. Scan the Metro QR code in compatible Expo Go. The UI offers 13 language choices; older strings outside Japanese, English, and Vietnamese may still fall back to English.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Variable | Meaning |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | Optional launch delay, 0–600 ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | Foreground refresh in seconds; minimum 60, default 120. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | Worker base HTTPS URL, without `/hazards`; blank disables weather feed. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | Romaji base HTTPS URL, without `/romaji`; blank keeps local readings only. |
| `ANDROID_PACKAGE` | Unique Android application ID for your store account. |
| `IOS_BUNDLE_ID` | Unique iOS bundle ID for your Apple account. |
| `EAS_PROJECT_ID` | Expo project UUID; optional for Expo Go, required for linked EAS builds. |

## 4. Optional JMA Worker

From the root, set a unique Worker name in `wrangler.toml`, sign in to your Cloudflare account, then deploy. Replace the example hostname with the URL returned by Wrangler. `/hazards` must return JSON containing `items` and `kind`; `degraded: true` means some upstream feeds failed. Set the base URL in `.env`. The Worker classifies JMA Atom headlines; it does not verify current warning status or weather measurements. No API secret is needed in the app.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. Optional Romaji service

On your VPS, run the commands below in a second terminal. For production, manage `npm start` with systemd, a container, or your hosting supervisor. Put an HTTPS reverse proxy in front of port 3088, restrict direct port access, and configure request-size/rate limits. Verify `/health` returns `{"ok":true}` and POST `/romaji` returns an array of readings. Set its base HTTPS URL in `.env`. Requests can contain Japanese place names, bulletin text and shelter addresses; do not log request bodies unnecessarily. If unavailable, local dictionary/Kana readings continue working.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Build Android and iOS

Create your own project in the Expo dashboard and copy its UUID into `EAS_PROJECT_ID`. Set both platform identifiers before the first build; change the name, slug and scheme in `app.config.js` for a fork. The committed `eas.json` contains `preview` (Android APK / iOS ad hoc), `simulator` (iOS Simulator), and `production` (Android AAB / iOS store) profiles. In the Expo project settings, add every configured variable from the table to BOTH the `preview` and `production` environments; `.env` is ignored by Git and is not uploaded to remote builders. These values are public configuration, not secrets. Restart Metro or rebuild after changing them.

The first command logs in; choose one build command for the platform you need. EAS supplies the download URL. Android preview installs an APK; iOS ad hoc requires device registration (`npx eas-cli device:create`) and Apple signing. Simulator builds cannot run on an iPhone. To build locally, append `--local` on a machine with the corresponding native toolchain.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. Store distribution

Build production, then submit the selected platform. Configure your own signing credentials through EAS; never commit them. Android Play distribution uses the production AAB, not the preview APK. iOS submission goes to App Store Connect/TestFlight; it does not automatically publish the app. Complete store metadata, icons/screenshots, privacy policy, data disclosures, and device testing before requesting review. EAS submission may request the App Store Connect app ID or Google service-account key; store those in your account’s credential settings, not the source tree.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. Verification

Run the following checks, then use real iOS/Android devices: all 13 language choices; Japanese label without Romaji; issued vs event time; Tokyo midnight while the device is in another timezone; light/dark and increased contrast; 200% text; VoiceOver/TalkBack modal focus and separate report actions; Reduce Motion; denied location; broken network; map attribution and severity labels. A successful JavaScript export is not a native-device test or Apple approval. Check the [UI audit](../UI_DESIGN.md) for remaining manual checks.

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. Updates and rollback

Record the tested commit and build identifiers. Update the app version in `app.config.js`; production build numbers auto-increment via EAS. This project does not configure EAS Update, so ship a new native build for changes. For the Worker, redeploy a known-good commit (or use Cloudflare rollback); restart the Romaji process with the previous release. Store apps cannot silently downgrade: rebuild the previous working source with a higher build number. Monitor `/hazards`, `/health`, map-provider limits and source availability.

## 10. References

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
