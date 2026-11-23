# Safety For You — Expo SDK 58

A **free, nonprofit** React Native application (JavaScript only) for natural-disaster information in Japan.

> **Important:** This prototype complements Japan's official emergency alerts. A missing or delayed feed is **not** an all-clear. Follow J-Alert, JMA, local authorities, and your surroundings.

## Run in Expo Go (iOS + Android)

Use Node.js 22+ with an **Expo Go app that supports SDK 58**:

```bash
npm install
cp .env.example .env
npx expo start --go -c
```

Open with Expo Go compatible with SDK 58 on iOS/Android or a matching simulator. **iOS now uses native Apple Maps (MapKit) through `react-native-maps` 1.29.11; Android keeps the existing WebView + Leaflet map.** No Google Maps key or custom development client is required for these providers in Expo Go. Production builds still need platform signing and device QA.

- **iPhone/iPad:** native Apple Maps using `react-native-maps` (Expo SDK 58 compatible), with region overlays and source-backed Shindo area badges. **Android:** `react-native-webview` 14.0.1 + Leaflet, preserving the existing raster basemap.
- **Leaflet 1.9.4** is packaged **inside the Android map** by `postinstall` (`scripts/bundle-leaflet.cjs`). This avoids downloading Leaflet from a CDN at runtime. If Metro cannot find `src/generated/leafletAssets.js`, rerun `npm install` or `npm run bundle:maps`.
- Raster basemap tiles come from **OpenStreetMap Japan** over HTTPS; the separate **GSI** service provides designated evacuation places. No Google Maps API key or native map plugin is required. Respect both map/data-provider terms and preserve the visible OSM/GSI attributions.
- The old native MapLibre package and Expo config plugin are **removed**; `MLRNCameraModule` is no longer referenced by the app.
- If Expo Go itself runs a different SDK than 58, install a compatible Expo Go version. This is an **SDK mismatch**, not a MapLibre dependency.

## User-facing features

- Quick configurable splash (`EXPO_PUBLIC_SPLASH_MIN_MS`), Japan-local date, consent-based location permission and compact 10-hazard grid.
- Earthquake and tsunami reports from P2PQuake v2, a foreground WebSocket and REST history. Earthquakes show **Magnitude (M), JMA Shindo (measured/predicted) and hypocenter depth** when reported. Tsunami warnings show **wave-height forecasts per coastal region**, warning level, arrival estimates, and cancellation where available.
- Other JMA categories (typhoon, heavy rain, flood, landslide, volcano, heavy snow, extreme heat) use a separately deployed optional JMA Atom-feed Worker (`EXPO_PUBLIC_JMA_PROXY_URL`). This Worker currently categorizes **recent bulletin titles only**, not active warnings or verified numerical observations. The app never invents wind, flood, or rainfall figures.
- **Apple Maps on iOS / Leaflet + OpenStreetMap Japan on Android**, each with the user's foreground location, a distinct verified earthquake epicenter marker, source-backed JMA observed Shindo region polygons and area badges (e.g. 1, 3, 5-). Badge anchors represent the *area*, not an individual seismic measurement station. Both platforms show selected-event + user coordinates together. Tsunami warning boundaries remain issued coastal zones, not modeled wave propagation.
- Original Android Leaflet map with markers for the user and verified hazard coordinates. Select an event and `fitBounds` automatically frames both the event and GPS location. Regional warnings without confirmed coordinates **do not get a fake pin**. If GPS is denied, focus the event only.
- Nearby GSI **designated emergency evacuation locations** filtered by the relevant hazard, including safety notes for foreign residents (papers, passport/residence card if within reach, medication, water, travel light).
- 13 languages: ja, en, vi, zh-CN, zh-TW, ko, tl, ne, id, pt, my, th, hi. Japanese static interface strings may include verified Romaji, but the language picker uses **日本語** without Romaji. WanaKana converts Kana locally; dynamic Kanji readings optionally come from the Kuroshiro/Kuromoji service (`EXPO_PUBLIC_ROMAJI_API_URL`). Unverified readings remain in Japanese without a misleading placeholder.
- A sun/moon toggle next to the language picker saves Light/Dark Mode locally.

## Deploy the optional weather news Worker

```bash
npx wrangler login
npx wrangler deploy
```

Add its URL (for example `https://your-worker.workers.dev`) to `EXPO_PUBLIC_JMA_PROXY_URL` in `.env` and restart Expo. Details in `server/worker.js`. Without this backend, weather category pages show an explicit not-configured state, not mock warnings.

## Tests

```bash
npm install
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

The CI exports JavaScript bundles on **both platforms**, but a successful JS bundle is **not** a physical-device, WebView, network, or emergency safety certification. Check real hardware, accessibility zoom, GPS denied, poor connections, and map attribution.

## Safety / production limits

- Leaflet JS/CSS are bundled for offline *engine* availability, but **GSI map imagery still requires Internet**. Do not treat this as an offline navigation app or rely on a map during an outage.
- GSI designations do **not** guarantee evacuation sites are open or accessible.
- P2PQuake and JMA headlines are not a guaranteed real-time emergency warning service. WebSocket runs only in the foreground. Add a reliable monitored server-side alert pipeline, full JMA structured severity/cancellation parsing, geographic areas, and qualified translations before providing push emergency warnings.
- The user's GPS is shared only as necessary for map tiles/local area queries. Publish a privacy policy and test accessibility and user safety before distribution.

Sources: [Expo WebView v58](https://docs.expo.dev/versions/v58.0.0/sdk/webview/), [Leaflet reference](https://leafletjs.com/reference.html), [GSI map tiles](https://maps.gsi.go.jp/development/ichiran.html), [JMA](https://www.jma.go.jp/), [P2PQuake](https://www.p2pquake.net/develop/json_api_v2/).

## Better basemap + verified hazard zones

- **New basemap:** OpenStreetMap Japan's `MapTiler Basic EN` raster style. Its clean English-label map is easier to read and displays Japanese place names primarily in Latin script. No commercial API key and still works inside **Expo Go (WebView + Leaflet)**. Provider information: https://wiki.openstreetmap.org/wiki/Japan/OSMFJ_Tileserver . The basemap uses OSM copyright attribution; for significant traffic, obtain a hosting arrangement or host your own raster tiles.
- The selected **earthquake** may show shaded region polygons in colors corresponding to reported **JMA Shindo**. The shapes are fetched from JMA's published `earthquake.json` GIS boundaries and only shown if P2PQuake reported a matching area-level Shindo. It does **not** simulate seismic waves or infer station coordinates.
- The selected **tsunami** may show colored affected **coastal forecast-zone lines**, using the selected P2PQuake warning grade. The lines are matched to JMA's published `tsunami.json` coastal geometry. They **do not** show tsunami propagation, water travel time or inundation inland.
- The map fits both the user's GPS, selected epicenter and any loaded official areas, where available. No location is invented. A canceled tsunami report does not paint a still-active warning.
- All interactive markers and zone popups use **Japanese + Romaji when a verified/local reading is available**, and the English-label base map avoids Kanji-only base labels. For Kanji names with no built-in reading, configure the optional `EXPO_PUBLIC_ROMAJI_API_URL` Kuroshiro service; the app will keep the source name rather than guess.
- Area boundaries are cached for 24 hours. If JMA GIS loading fails or no location areas match, no colored overlay is shown and a visible status message appears.
- OSM Japan basemap data: https://wiki.openstreetmap.org/wiki/Japan/OSMFJ_Tileserver . JMA earthquake areas: https://www.jma.go.jp/bosai/common/const/geojson/earthquake.json . JMA tsunami forecast coasts: https://www.jma.go.jp/bosai/common/const/geojson/tsunami.json .

**This is NOT a dynamic earthquake wave or tsunami propagation simulation.** Colored lines represent named **issued warning regions**, not a predicted ocean wavefront or street-level inundation. Do not use the visual alone to make evacuation decisions.

### Romaji fallback for place names

The app bundles a reviewed dictionary of prefectures and common Japanese coastal-region names in `src/placeReadings.cjs`, so map names such as **宮城県 / Miyagi-ken** work offline. Kana-only text is converted by WanaKana locally. For uncommon Kanji proper names, the existing optional Kuroshiro/Kuromoji service produces contextual Romaji; no made-up reading is shown when unavailable. The basemap itself uses **English/Latin-script place labels** for better accessibility.

## Source-backed severity colors and more Romaji

- **JMA Shindo (震度)** severity has an explicit, progressive palette: 1 light blue, 2 blue, 3 green, 4 yellow, 5- orange, 5+ deeper orange, 6- red, 6+ magenta, 7 dark purple. The color is based on **maximum published Shindo**, NOT earthquake magnitude (M); a strong M earthquake can have only Shindo 1 in an observed area.
- Cards have a colored left bar + a text label ("Shindo 1", "Shindo 3" etc.) so severity isn't communicated only by color. Map event pins and published observation-area polygons share the exact same color definitions in `src/hazardSeverity.cjs`.
- For tsunami **advisory**, **warning**, and **major warning**, colors are yellow, red, and purple. The coastal segments use the corresponding color for their own issued grade. Canceled bulletins use neutral gray, never a green all-clear.
- Weather reports must carry a validated JMA warning grade from structured data before they gain a severity color. This repository's headline-only JMA Worker has no verified warning grade, so its weather items remain neutral. **Do not infer current alert levels from a headline or numeric wind/rainfall measurement.**
- Improved Japanese/Romaji handling recognizes additional geographic names, JMA information phrases and combined names such as `宮城県 · 岩手県` → `Miyagi-ken · Iwate-ken`. Known names are converted locally without an extra network call; rare Kanji place names still require the optional Kuroshiro/Kuromoji service (set `EXPO_PUBLIC_ROMAJI_API_URL`). Never guess an unverified name reading.

The colors are an accessible **application visualization**, not a claim of official JMA color certification. Always show the text severity and official issued timestamp. The geography overlays remain observed areas or issued coastal warning zones, **not** dynamic wave propagation forecasts.

## Documentation in all 13 languages

The [documentation index](docs/README.md) contains an **Architecture Decision Record (ADR-0001)**, a **deployment guide**, and a dedicated **Google Play / Apple App Store publication guide** for every one of the app's 13 locales. Store guides cover EAS production configuration, Android AAB / iOS IPA signing, internal and TestFlight testing, privacy and data disclosures, review submissions, and release-readiness gaps. Follow the [documentation style guide](docs/STYLE_GUIDE.md) and [AI contributor instructions](AGENTS.md) for consistent maintenance.

## Open source and license

Safety For You is **free, nonprofit and open source under the [MIT License](LICENSE)**. Anyone may read, fork, modify, redistribute or use the source commercially, provided the MIT copyright and license notice is preserved in substantial copies. Third-party map tiles, official data, libraries and other assets retain their own terms; MIT does not override them.

This project is an independent disaster-information aid, **not** a government app or a certified real-time emergency-alert system. Data availability, bulletin validity, map access and evacuation-site availability are not guaranteed. In an emergency, follow JMA, J-Alert, authorities and local broadcasts. Contributions and issues are welcome; please preserve factual source checks and accessible, safety-first UI.

## Platform map implementation (2026-11-23)

- `src/SafetyMap.js` chooses Apple Maps on iOS and keeps OSM Japan/Leaflet WebView on Android. `src/AppleSafetyMap.js` uses MapKit through `react-native-maps` (`provider` left at default; do **not** set `PROVIDER_GOOGLE`). The SDK 58 compatible version is **1.29.11**.
- `src/mapFeatures.cjs` converts only verified JMA GeoJSON polygons/coastlines into native overlays and area markers. A displayed Shindo number is the **observed intensity assigned to a published area**, not a sensor pin or earthquake propagation model.
- Map viewport includes the user's last known/foreground location, the confirmed epicenter and affected-region bounds. When the user denies location, do not fabricate a user pin.
- Android uses existing OSM Japan tile services and Leaflet, while iOS uses native Apple Maps terms/attribution. GSI evacuation-place data is shared on both platforms.
- Test real devices for marker overlap, map accessibility, large polygons, permission denial, offline map failures and iOS dark appearance. Exporting JS bundles alone does not validate the native MapKit component.

Expo SDK 58 mapping reference: https://docs.expo.dev/versions/v58.0.0/sdk/map-view/ .

### WanaKana Romaji for Apple Maps and Android maps

The app already depends on **WanaKana 5.3.1**. `src/romajiLabel.cjs` now centralizes Kana → Romaji for both map providers; Japanese/Kana labels appear with Romaji in pin callouts and verified JMA region labels. MapKit displays the original name as the callout title and Romaji as the detail; Android Leaflet popups display both lines. When a trusted reading for Kanji comes from the reviewed local place-name dictionary or optional Romaji service as Kana, WanaKana transliterates it. Unknown Kanji names stay in Japanese instead of showing fabricated readings. The language selection option itself remains `日本語` without Romaji.
