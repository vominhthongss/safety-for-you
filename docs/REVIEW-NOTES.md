# Review notes

Paste the English block below into:

- **App Store Connect** → version page → **App Review Information** → **Notes**.
- **Google Play Console** → **App content** → **App access**: choose *"All functionality is available without special access"*; reuse the text if the console asks for tester instructions.

Structure follows `templates/REVIEW-NOTES-TEMPLATE.md` of [app-store-compliance](https://github.com/mjmirza/app-store-compliance). Reviewers often reject apps they cannot understand, so the notes give the exact path to every feature. Button names are the English labels, because reviewers usually use an English device.

**Before pasting:** record a 1–2 minute video on a **physical device** (launch, allow location, Home, Earthquake screen with a report selected and the "Show me and the event" button, Tsunami screen, Evacuation places, Alarm sound switch and the notification prompt, Privacy policy row). Upload it as an unlisted video and replace `<DEMO VIDEO URL>`.

```text
1. SCREEN RECORDING
Demo video URL: <DEMO VIDEO URL>
The recording (physical device) shows: first launch and the location permission prompt (When In
Use), Home, the Earthquake screen with a selected report (epicenter Shindo badge and the user's
position framed together), the Tsunami screen, Evacuation places, the "Alarm sound" switch with
the notification permission prompt, and Home > Privacy policy.

2. APP PURPOSE
Safety For You is a free, nonprofit, open-source app that shows disaster information for Japan in
13 languages. It is aimed at residents and visitors who do not read Japanese well: bulletins keep
the original Japanese with Romaji readings, maps show official JMA areas, and simple illustrated
steps explain what to do. It is independent, not affiliated with JMA or any government body, and
states in the app that it does not replace official alerts.

3. ACCESS INSTRUCTIONS AND TEST CREDENTIALS
No login or account is required. Every feature is available right after launch.
- Location: the app asks for location "While Using the App". Allowing it shows the user's
  position; denying it keeps every screen usable.
- Home > "Explore hazards" > Earthquake: tap a report in "Reports" to select it. The map frames
  the epicenter (with its published Shindo number) and the user's position; the round button on
  the map ("Show me and the event") re-frames both. "What to do now" and "What each Shindo feels
  like" are below the list.
- Home > Tsunami: coastlines under a bulletin are colored by grade (advisory, warning, major
  warning); numeric forecast heights are shown on the coast when JMA publishes them.
- Home > Evacuation places: choose a hazard; designated places from GSI appear on the map and
  in the list (requires location).
- Home > "Alarm sound" switch: asks for notification permission. While the app is open, a
  full-screen alarm with vibration appears only when a fresh bulletin covers the device
  location, so it cannot be triggered on demand during review.
- Top right: language menu (13 languages) and Light/Dark switch.
- Home > Privacy policy: opens the policy in the browser.
Test credentials: none needed.

4. EXTERNAL SERVICES
Service / Purpose
P2PQuake (api.p2pquake.net) / earthquake and tsunami bulletins from JMA, REST and WebSocket
Japan Meteorological Agency (www.jma.go.jp) / official area boundaries and links to notices
GSI (cyberjapandata.gsi.go.jp) / designated evacuation places
Apple Maps (iOS) / OpenStreetMap Japan tiles (Android) / maps
Local notifications only / alarm sound; no push service, no backend storing user data
No ads, analytics, tracking or in-app purchases.

5. REGIONAL DIFFERENCES
The app works the same in every region. Its content covers Japan only.

6. REGULATED INDUSTRY DOCUMENTATION
Not applicable. The app shows public bulletins from official Japanese sources with attribution
and does not issue warnings itself.
```

## Notes for the publisher

- If the alarm conditions change in `src/userAlert.cjs` (Shindo 4+, 50 km epicenter fallback, 10 km tsunami coast), update item 3.
- If any service is added or removed, update item 4, [PRIVACY-DECLARATIONS.md](PRIVACY-DECLARATIONS.md) and the [privacy policy](privacy/index.md) together.
- For each update, state briefly **what is new** and attach a screenshot of any new feature a reviewer must see.
