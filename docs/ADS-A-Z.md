# Advertising A to Z: Safety For You has no ads

Safety For You is a free, nonprofit disaster-information app. It contains **no advertising, no in-app purchases, no donation links, no analytics and no tracking**. This document records that state, the store answers that follow from it, and what would have to change if monetization were ever added.

## A. Current state

| Item | State | How to verify |
| --- | --- | --- |
| Ad SDK (AdMob, Meta, AppLovin, …) | None | `package.json` dependencies |
| Analytics / crash SDK | None | `package.json` dependencies |
| In-app purchases, subscriptions | None | No billing library |
| Donation or payment links | None in the app | Search `App.js` and `src/` for payment URLs |
| Android Advertising ID permission (`AD_ID`) | Not in the manifest | `npx expo prebuild` on a scratch copy, then search `AndroidManifest.xml` |
| iOS tracking (IDFA, ATT prompt) | Not used; `NSPrivacyTracking = false` | `ios.privacyManifests` in `app.config.js` |
| `app-ads.txt` | Not needed | Only required for apps that serve ads |

The audit tool reports `GOOGLE-PAYMENTS-DONATION-LINK` and `GOOGLE-DATASAFETY-MISMATCH`. Both are false positives: they come from the Babel `funding` field in `package-lock.json` and a Gradle classpath line (see [RELEASE-AUDIT.md](RELEASE-AUDIT.md)).

## B. Store answers

| Console | Question | Answer |
| --- | --- | --- |
| Google Play → App content → Ads | Does your app contain ads? | **No** |
| Google Play → App content → Advertising ID | Does your app use advertising ID? | **No** |
| Google Play → Data safety | Advertising or marketing purpose | Not selected for any data type |
| App Store Connect → App Privacy | Third-Party Advertising, tracking | Not selected; "Used to track you": none |
| App Store Connect → Age rating | Advertising | No |

Full privacy answers: [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md).

## C. Why no ads

- Emergency screens must stay readable; an interstitial or banner could cover a warning, the map or the protective steps at the worst moment.
- Ads would bring an ad SDK that collects device identifiers and approximate location for advertising, which changes Data safety, App Privacy, the privacy manifest and the privacy policy, and requires consent flows (GDPR via UMP, ATT on iOS).
- The project is nonprofit and MIT-licensed.

## D. Donations

Google Play's Payments policy allows donations outside Play billing only for qualifying tax-exempt charities. Do not add a donation button or link inside the Android app unless that condition is met and documented. A donation link on the GitHub repository or a website is outside the app and is not affected.

## E. If monetization is ever considered

Treat it as a new release decision, not a code change. Minimum work:

1. Write an ADR in all 13 locales explaining the decision and how warnings stay unobstructed.
2. Never show ads on the alarm sheet, hazard maps, protective steps or tsunami notices.
3. Update together: [privacy policy](privacy/index.md), [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md), `ios.privacyManifests` (tracking, collected data types), Data safety and App Privacy answers, [REVIEW-NOTES.md](REVIEW-NOTES.md).
4. Add consent flows (Google UMP for GDPR, ATT with `NSUserTrackingUsageDescription` before any tracking) and `app-ads.txt` on the developer website.
5. Re-run the audit ([RELEASE-AUDIT.md](RELEASE-AUDIT.md)) and update this document.

## F. Verification commands

```bash
# Dependencies that would indicate ads, analytics or billing (expected: no output)
grep -iE '"(react-native-google-mobile-ads|expo-ads-admob|@react-native-firebase/[a-z-]+|react-native-iap|expo-in-app-purchases|react-native-purchases|@sentry/react-native|@amplitude/[a-z-]+|@segment/[a-z-]+|mixpanel-react-native)"' package.json
```
