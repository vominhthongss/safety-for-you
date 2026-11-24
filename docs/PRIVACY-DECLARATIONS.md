# Privacy declarations: Data safety (Google Play) and App Privacy (Apple)

**Status:** draft answers for the publisher to confirm, prepared on 2026-11-24 from the source code. Questionnaires change; reopen the sources at the end before submitting. The app owner is responsible for the final answers.

The answers must stay consistent with the [privacy policy](privacy/index.md) and with `ios.privacyManifests` in `app.config.js`.

## What the app sends off the device

**The publisher receives no personal data.** There are no accounts, no backend that stores user data, no analytics, no advertising and no tracking SDKs. Settings stay on the device (AsyncStorage) and are excluded from backup.

Data that leaves the device goes directly to third-party services the app needs to work:

| Recipient | Data | Trigger | Evidence |
| --- | --- | --- | --- |
| GSI (`cyberjapandata.gsi.go.jp`) | Zoom-10 tile numbers around the user (area of tens of km) | Evacuation places screen | `src/data.js` (`tileCoordinates`, `getShelters`) |
| OSM Japan (`tile.openstreetmap.jp`), Android only | Tile numbers of the visible map | Any map | `src/SafetyMap.js` |
| Apple Maps, iOS only | Visible map area (processed by Apple) | Any map | `src/AppleSafetyMap.js` |
| OS geocoder (Apple / Google) | Device coordinates | Home location line | `App.js` (`reverseGeocodeAsync`) |
| Optional Romaji service (publisher-operated, if configured) | Japanese text shown in the app, including the city or region name | Japanese text on screen | `App.js` (`dynamicJapanese`), `src/romanization.js` |
| P2PQuake, JMA, optional JMA Worker | No user data (public feeds) | Data refresh | `src/data.js`, `server/worker.js` |

Precise coordinates are used on the device only (map position, distance, alarm evaluation in `src/userAlert.cjs`). Notifications are local (`src/alarmNotify.js`); no push token is created.

## Google Play Console → App content → Data safety

| Question | Answer |
| --- | --- |
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS) |
| Do you provide a way for users to request that their data is deleted? | **No**: the publisher holds no user data and there are no accounts; uninstalling removes on-device data |

| Data type (Play) | Collected | Shared | Processed ephemerally | Required / Optional | Purpose |
| --- | --- | --- | --- | --- | --- |
| Location → **Approximate location** | Yes | Yes (GSI, OSM Japan tile requests) | Yes | Optional (location can be denied) | App functionality |

Notes:

- "Shared" is the conservative answer. If the publisher concludes that public tile requests fall under a Data safety exemption, record the reasoning before answering No.
- Precise location is not declared: precise coordinates go only to the operating system's geocoder, which is part of the platform.
- Also in App content: **Ads: No**. **Advertising ID: not used** (the build has no `com.google.android.gms.permission.AD_ID`; see [ADS-A-Z.md](ADS-A-Z.md)).

## App Store Connect → App Privacy

Matches the `PrivacyInfo.xcprivacy` generated from `ios.privacyManifests`: `NSPrivacyTracking = false`, one collected type.

**First question:** "Do you or your third-party partners collect data from this app?" → **Yes**.

| Data type (Apple) | Purpose | Linked to identity | Used for tracking |
| --- | --- | --- | --- |
| Location → **Coarse Location** | App Functionality | No | No |

Result on the App Store page: one group, **"Data Not Linked to You"**: Location.

No App Tracking Transparency prompt and no `NSUserTrackingUsageDescription` are needed, because nothing is used for tracking.

## Other declarations

### Export compliance (Apple)

The build sets `ITSAppUsesNonExemptEncryption = false`, so App Store Connect does not ask per build. If asked, the app uses only exempt encryption (HTTPS through the operating system).

### Age rating (Apple, 2026 questionnaire)

Answer **None / No** to every content item, including medical information, unrestricted web access (links open in the system browser), user-generated content, messaging, **Shared Location** (the app never shares a location with other users), advertising and in-app purchases. Expected rating: the lowest band (4+).

### Content rating (Google Play, IARC)

Category: reference / utility. Answer No to violence, sexual content, language, controlled substances, gambling, user interaction, sharing location with other users and purchases.

### Target audience (Google Play)

13+ age groups. Choosing groups under 13 brings the app under the Families policy.

### Other Play forms

| Form | Answer |
| --- | --- |
| App access | All functionality is available without special access |
| News app | No: the app relays official bulletins and does not publish news |
| Government app | No; the app does not claim affiliation |
| Health, financial features | None |
| Location permission declaration | Not required: no background location |
| Foreground service | None |

## Sources

- [Apple: App privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple: Privacy manifest files](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)
- [Google Play: Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play: Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)
