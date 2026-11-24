# Store questionnaire answers

## Overview

Suggested answers for the App Store Connect and Play Console forms, based on the source code at the time of writing (2026-11-24). They are recommendations, not legal advice. The publisher must confirm each answer in the console, because questionnaires change and some answers depend on account details.

The answers must stay consistent with the [privacy policy](../docs/privacy/index.md) and with `ios.privacyManifests` in `app.config.js`.

## Facts the answers rely on

| Fact | Evidence in the repository |
|---|---|
| No accounts, sign-in, ads, analytics or tracking SDKs | `package.json` dependencies |
| Location: foreground only, optional, never sent to the publisher | `App.js` (`requestForegroundPermissionsAsync`), `app.config.js` (background disabled) |
| Approximate area reaches third parties: GSI shelter tiles (zoom 10 tiles), OSM Japan map tiles (Android), Apple Maps (iOS), OS geocoder | `src/data.js` (`tileCoordinates`), `src/SafetyMap.js`, `App.js` (`reverseGeocodeAsync`) |
| City or region name may be sent to the optional Romaji service | `App.js` (`dynamicJapanese` includes `place`), `src/romanization.js` |
| Local notifications only, no push token | `src/alarmNotify.js` |
| On-device storage: language, theme, alarm setting, alerted bulletin IDs; backup disabled | `App.js` (AsyncStorage keys), `android.allowBackup: false` |
| Only HTTPS; no proprietary encryption | `ios.config.usesNonExemptEncryption: false` |
| Links to official notices open in the system browser, not an in-app browser | `App.js` (`Linking.openURL`) |

## App Store Connect

### App Privacy

1. Data collection: **Yes, we collect data from this app.**
2. Data type: **Location → Coarse Location**.
3. Use: **App Functionality** only.
4. Linked to the user's identity: **No**.
5. Used for tracking: **No**.
6. Privacy policy URL: `https://vominhthongss.github.io/safety-for-you/privacy/` (after GitHub Pages is enabled; see below).

Reasoning: requests to GSI and OSM Japan reveal an approximate area. Declaring Coarse Location matches the app-level privacy manifest. "Precise Location" is not declared, because coordinates are not sent to the publisher or to a third party except the operating system's geocoder.

### Export compliance

The build sets `ITSAppUsesNonExemptEncryption = false`. App Store Connect therefore does not ask the encryption questions for each build. If asked, answer that the app uses only encryption exempt under Category 5 Part 2 (HTTPS through the operating system).

### Age rating

Answer **None / No** to every content question, including:

- violence, sexual content, profanity, horror, alcohol/tobacco/drugs, gambling, contests: None;
- medical or treatment information: No;
- unrestricted web access: No (official links open in the system browser);
- user-generated content, messaging or chat: No;
- **Shared Location** (descriptor announced for January 2027): **No**, because the app never shares a user's location with other users;
- advertising, in-app purchases: No.

Expected rating: the lowest age band (4+).

### Listing

- Primary category: **Weather**; secondary: **Reference**.
- Support URL: `https://github.com/vominhthongss/safety-for-you/issues`.
- Do not describe the app as an official, real-time or guaranteed warning service.

### Review notes (template)

```text
Safety For You is a free, nonprofit, open-source disaster information app for Japan.
No account or sign-in is required; every feature is available immediately.

Data sources: P2PQuake (earthquake/tsunami bulletins from JMA), JMA, GSI evacuation sites.
The app is independent and states in the UI that it does not replace official alerts.

Location (When In Use only) shows the user's position on hazard maps and finds nearby
evacuation places. The app never requests Always access; the Always purpose strings exist
only because the location library references those APIs.

The in-app alarm appears only when a fresh bulletin covers the device location while the
app is open, so it cannot be triggered on demand during review. Recent bulletins are
listed on the Earthquake and Tsunami screens.
```

## Google Play Console

### Data safety

1. Does the app collect or share user data? **Yes.**
2. Data type: **Location → Approximate location**.
   - Collected: **Yes**. Shared: **Yes** (GSI and OSM Japan receive tile requests). If the publisher concludes these requests fall under a Data safety exemption, record the reasoning before answering No.
   - Processed ephemerally: **Yes** (the publisher stores nothing).
   - Required or optional: **Optional** (the user can deny location).
   - Purpose: **App functionality**.
3. Data encrypted in transit: **Yes** (HTTPS).
4. Way to request data deletion: the publisher holds no user data and there are no accounts. State this in the form and the privacy policy.

### App content

| Form | Suggested answer |
|---|---|
| Privacy policy | Same URL as App Store |
| Ads | No ads |
| App access | All functionality is available without special access |
| Content rating (IARC) | Reference/utility category; No to all content questions; no sharing of location with other users; no user interaction features |
| Target audience | 13+ age groups. Selecting groups under 13 brings the app under the Families policy; choose that only after reviewing its extra requirements |
| News app | No: the app relays official bulletins and does not publish news |
| Government apps | Not a government app; the app does not claim affiliation |
| Financial features, health | None |
| Location permissions declaration | Not required: no background location |
| Foreground service | None |

### Account-level items

- **Trader status (EEA/UK)**: declare by 2027-02-01. A free nonprofit app may qualify as non-trader; the publisher decides.
- **Closed testing**: personal accounts created after 2023-11-13 need 12 opted-in testers for 14 days before production access.
- **Japan payments authorization (from 2026-12-01)**: announced for developers selling through Google Play in or from Japan. The app sells nothing; confirm in Play Console whether any action is still requested.

## Publishing the privacy policy

The policy lives in `docs/privacy/` (English `index.md`, Japanese `ja.md`, Vietnamese `vi.md`). To publish it at the default URL used by the app:

1. GitHub → repository **Settings → Pages**.
2. Source: **Deploy from a branch**, branch `main`, folder `/docs`.
3. Wait for the deployment, then open `https://vominhthongss.github.io/safety-for-you/privacy/` and check that it loads.

To host it elsewhere, set `EXPO_PUBLIC_PRIVACY_POLICY_URL` before building; the Home screen link uses that value.
