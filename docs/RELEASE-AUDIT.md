# Pre-submission audit and checklist

**Audit date:** 2026-11-24. **Tool:** [mjmirza/app-store-compliance](https://github.com/mjmirza/app-store-compliance) v2.5.1 (rule pack of 112 dated sources, verified between 2026-07-13 and 2026-11-22), plus manual review of the generated native projects.
**Related:** [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md) · [REVIEW-NOTES.md](REVIEW-NOTES.md) · [RELEASE.md](RELEASE.md) · [ADS-A-Z.md](ADS-A-Z.md) · [store_image.md](store_image.md) · [store graphics](../store/README.md)

## How to run the audit again

Safety For You is a managed Expo app: `ios/` and `android/` are generated and are not committed. Run the scanner on a scratch copy after `npx expo prebuild`, so that it reads the real `Info.plist`, `AndroidManifest.xml` and `PrivacyInfo.xcprivacy`.

```bash
git clone --depth 1 https://github.com/mjmirza/app-store-compliance.git ../app-store-compliance
rm -rf ../sfy-audit && mkdir ../sfy-audit && git archive HEAD | tar -x -C ../sfy-audit
cp -R node_modules ../sfy-audit/
(cd ../sfy-audit && CI=1 npx expo prebuild --no-install)
bash ../app-store-compliance/agent-os/hooks/app-store-compliance-guard.sh ../sfy-audit
```

Do not run `expo prebuild` in the repository itself unless you intend to delete `ios/` and `android/` afterwards. The scanner matches text patterns, so check every finding against the source before acting on it (table below).

## Scanner results and verification

### First scan (before fixes)

Result: **BLOCKED**, 1 critical, 12 high, 3 medium.

| Finding | Level | Verdict | Resolution |
| --- | --- | --- | --- |
| RN-PRIVACY-MANIFEST-MISSING | Critical | Correct: modules ship their own manifests, but no app-level `PrivacyInfo.xcprivacy` existed | **Fixed** in #19: `ios.privacyManifests` (required-reason APIs, coarse location, no tracking) |
| APPLE-5.1.1 / GOOGLE missing privacy policy | High | Correct | **Fixed** in #19: `docs/privacy/` (en, ja, vi) and a Home row; must still be published |
| APPLE-EXPORT-COMPLIANCE (`ITSAppUsesNonExemptEncryption`) | High | Correct | **Fixed** in #19: `ios.config.usesNonExemptEncryption: false` |
| Generic "Always" and precise-location purpose strings | High (manual) | Correct; missed by the scanner. `expo-location` inserted `Allow $(PRODUCT_NAME) to access your location` | **Fixed** in #19: specific text stating no background use; keys kept because the native module references those APIs |
| ANDROID-OVERLAY-TAPJACKING / storage permissions | High | Correct for the **release** manifest (template defaults) | **Fixed** in #19: `android.blockedPermissions` |
| ANDROID-INSECURE-BACKUP | High | Low real risk (only preferences stored) | **Fixed** in #19: `android.allowBackup: false` |
| BOTH-UNSAFE-DEEPLINK (`safetyforyou://`) | High | Unused scheme | **Fixed** in #19: `expo.scheme` removed |
| APPLE-PRIVACY-NUTRITION-LABELS | High | Trigger was a translation string, but the App Store form is required | Draft in [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md) |
| ANDROID-R8-OPTIMIZATION-MISSING | High | Correct. R8 was turned off on purpose in #14 | **Kept off** by decision. Google Play requires minimum R8 optimization from February 2027; see the checklist |
| GOOGLE-PAYMENTS-DONATION-LINK | High | **False positive**: `funding` field of Babel in `package-lock.json` | None |
| GOOGLE-DATASAFETY-MISMATCH (ad/analytics SDK) | High | **False positive**: Gradle classpath line; no ad or analytics SDK | None |
| ANDROID-RUNTIME-PERMISSIONS | High | **False positive**: `src/alarmNotify.js` and `App.js` handle denial | None |
| APPLE-ACCESSIBILITY-HAPTICS | Medium | Suggestion, not a guideline requirement | None |
| APPLE-2.3 age rating 2026 / GOOGLE 12-tester rule | Medium | Correct: console tasks | Checklist below |

### Current scan (main after #19 and #20)

Result: **CLEAR**, 0 critical, 7 high, 3 medium.

| Remaining finding | Location | Verdict |
| --- | --- | --- |
| ANDROID-R8-OPTIMIZATION-MISSING | build settings | Intentional (see checklist) |
| BOTH-UNSAFE-DEEPLINK (iOS) | `Info.plist` `CFBundleURLSchemes` | Bundle-ID scheme added by the Expo template; not used by the app |
| BOTH-UNSAFE-DEEPLINK (Android) | `AndroidManifest.xml` `<queries>` | **False positive**: package-visibility query for opening `https` links in the browser |
| ANDROID-OVERLAY-TAPJACKING | `app.config.js` | **False positive**: the line is the `blockedPermissions` entry that removes the permission |
| GOOGLE-PAYMENTS-DONATION-LINK | `package-lock.json` | **False positive** (Babel `funding`) |
| GOOGLE-DATASAFETY-MISMATCH | `android/build.gradle` | **False positive** (classpath) |
| ANDROID-RUNTIME-PERMISSIONS | `src/alarmNotify.js` | **False positive** (denial handled) |

## Done in the repository

| # | Item | Files | PR |
| --- | --- | --- | --- |
| 1 | EAS profiles (`preview` APK, `production` AAB) and linked EAS project | `eas.json`, `app.config.js` | #12, #13 |
| 2 | R8 and resource shrinking off for Android release | `app.config.js` (`expo-build-properties`) | #14 |
| 3 | App icon, Android adaptive and monochrome icons, splash logo, Play icon 512, feature graphic | `assets/`, `store/google-play/` | #16 |
| 4 | App-level privacy manifest, export compliance, specific location strings | `app.config.js` | #19 |
| 5 | Unused Android permissions blocked, backup off, unused scheme removed | `app.config.js` | #19 |
| 6 | Privacy policy (en, ja, vi) and in-app link | `docs/privacy/`, `src/config.js`, `App.js` | #19 |
| 7 | Android notification icon, iOS 18 dark and tinted icons | `assets/`, `app.config.js` | #20 |
| 8 | Screenshot capture and validation tooling | `scripts/capture-store-screenshot.sh`, `scripts/check-store-screenshots.cjs` | #20 |
| 9 | Privacy declarations, review notes, release steps, ads statement, this report | `docs/` | this PR |

## Publisher checklist

Mark `[x]` when done, or write "N/A + reason".

### Decisions

- [ ] Keep iPad support (`ios.supportsTablet: true`) or ship iPhone only. A 13-inch iPad screenshot is required while it is `true`. Once released with iPad support, removing it later is restricted by Apple.
- [ ] Play target audience: 13+ (recommended) or include under-13 groups (Families policy applies).
- [ ] R8: stays off for now. Re-evaluate before February 2027, when Google Play requires at least 25% optimization coverage and may limit visibility or publishing otherwise.
- [ ] Contact channel: GitHub Issues (current) or add a public email to the privacy policy and both consoles.
- [ ] Marketing version: change `version` in `app.config.js` from `0.1.0` to `1.0.0` for the first public release if preferred.

### Links

- [ ] Enable GitHub Pages (Settings → Pages → `main`, `/docs`) and open `https://vominhthongss.github.io/safety-for-you/privacy/`. GitHub Pages on a private repository needs a paid plan.
- [ ] Support URL `https://github.com/vominhthongss/safety-for-you/issues` opens for anonymous visitors (repository must be public).

### Build and device test

- [ ] Android: `npx eas-cli build --platform android --profile preview`, install the APK, follow the test list in [RELEASE.md](RELEASE.md) step 5.
- [ ] iOS: TestFlight build, same test list on an iPhone (and iPad if kept).
- [ ] Notification icon in the Android status bar is the white shield, not a white square.

### Screenshots

- [ ] Capture with `scripts/capture-store-screenshot.sh` and pass `npm run check:screenshots` (iPhone 6.9" or 6.5", iPad 13", Android phone 2–8). See [store/screenshots/README.md](../store/screenshots/README.md).

### Google Play Console

- [ ] Store listing: name, short and full description, icon 512, feature graphic, screenshots.
- [ ] App content: privacy policy, ads (No), Data safety, target audience, IARC rating, app access (no login) — answers in [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md).
- [ ] Personal account created after 2023-11-13: closed testing with at least 12 testers for 14 consecutive days.
- [ ] Trader status declaration (EEA/UK) before 2027-02-01.
- [ ] Japan payments authorization (from 2026-12-01): confirm in Play Console whether any action applies to a free app with no sales.

### App Store Connect

- [ ] App information: category Weather (secondary Reference), privacy policy URL, 2026 age rating questionnaire.
- [ ] App Privacy as in [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md).
- [ ] Version page: description, keywords, support URL, screenshots.
- [ ] App Review Information: paste [REVIEW-NOTES.md](REVIEW-NOTES.md) with a demo video URL and a contact phone number with country code.
- [ ] EU distribution: trader status (DSA).

### Legal (not checked by the stores; ask a qualified person)

- [ ] US state age-assurance laws (for example California AB 1043 from 2027-01-01, Alabama HB 161): obligations mainly fall on app stores; confirm whether any developer duty applies to a general-audience app without accounts.
- [ ] EU AI Act: N/A, the app has no AI features.
- [ ] Disaster information: keep the in-app statements that the app is unofficial and does not replace JMA, municipal or Emergency Alert instructions.
