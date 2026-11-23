# Architecture: Safety For You

## Frontend

- Expo SDK 58 + React Native 0.88, **JavaScript**.
- `src/SafetyMap.js` dispatches by platform: iOS mounts `src/AppleSafetyMap.js` (native Apple Maps/MapKit via Expo-supported `react-native-maps`), Android retains `react-native-webview` and the locally bundled Leaflet engine. No Google Maps key or MapLibre plugin.
- `scripts/bundle-leaflet.cjs` runs during `npm install`, reads Leaflet 1.9.4 CSS/JS from `node_modules`, and generates `src/generated/leafletAssets.js` (intentionally gitignored).
- WebView runs a self-contained map HTML. Raster basemap tiles use OSM Japan's English-label raster service; GSI separately provides designated evacuation-place GeoJSON. Preserve each data provider's attribution and usage terms.
- Native-to-WebView messages pass serialized JSON into a **restricted update function**, not executable API data. Label popups use `textContent`, not `innerHTML`.
- `src/mapViewport.cjs` computes verified user + selected-event bounds. Leaflet `fitBounds` on Android and MapKit `fitToCoordinates` on iOS keep user, epicenter and JMA-published affected areas visible. A regional warning without verified event coordinates gets no fake event pin.
- `src/mapFeatures.cjs` converts verified JMA area polygons/coastal lines into both the native overlays and **area-center intensity badges** (e.g. Shindo 1/3/5-). Badge positions are representative coordinates derived from the official area geometry, **not** station measurements. Long boundaries are simplified for display.
- `src/theme.js` provides semantic iOS and explicit Android Light/Dark colors. The preference uses AsyncStorage and React Native Appearance.

## Data

- `src/data.js` normalizes P2PQuake 551/552/556 events and queries GSI hazard-specific GeoJSON evacuation points.
- `src/hazardFacts.cjs` and `src/hazardView.cjs` maintain source-backed earthquake magnitude, Shindo, tsunami region/height/grade and optional weather measurements. JMA Atom headlines are **not** real-time active alert state.
- `server/worker.js` is an optional Cloudflare Worker that categorizes *recent* JMA Atom bulletins. It does not provide structured warning severity, geometry, or numerical weather measurement.
- `src/romanization.js` uses WanaKana on-device for Kana. An optional Node Kuroshiro/Kuromoji service handles Kanji. Readings for rare place names need review.

## Boundaries / risks

- **Expo Go supported**, but requires a version matching SDK 58; `react-native-maps` 1.29.11 and WebView are included there. Validate Apple Maps on a real iOS device, Android Leaflet separately and all CI builds.
- The Leaflet engine is bundled locally; GSI raster and P2PQuake/JMA data require Internet, so no offline emergency guarantee.
- GSI map tiles are generally appropriate for Japan and surroundings; using the map from elsewhere may show areas without tile coverage.
- GSI evacuation facility listings are not live opening-status information.
- No emergency alert latency guarantee; use J-Alert, JMA, official municipality announcements and broadcasts.
- Validate Expo Go on real iOS and Android devices, user GPS denied, dark mode, connectivity failures, screen readers and small screens before release.

## References

- https://docs.expo.dev/versions/v58.0.0/sdk/webview/
- https://leafletjs.com/reference.html
- https://maps.gsi.go.jp/development/ichiran.html

## Official JMA hazard map boundaries

- Earthquake: P2PQuake `points[].isArea === true` Shindo reading can be matched to the corresponding official JMA `earthquake.json` area boundary. **Individual station readings have no coordinates** in P2PQuake's payload and therefore are not plotted or used to assign intensities to entire municipalities.
- Tsunami: `areas[].name/code/grade` from P2PQuake code 552 is matched to official JMA `tsunami.json` coastal geometry. This highlights an issued coastal *warning area*, not the actual wave propagation or predicted flood depth.
- `src/hazardZones.cjs` contains deterministic matching and scale/grade colors; `src/hazardGeo.js` retrieves official JMA GeoJSON (24h cache) when a report is selected, not every frame. `src/SafetyMap.js` paints Leaflet geographic features and fits map bounds to official regions plus GPS/epicenter.
- The base layer switches from GSI standard tiles to OSM Japan `maptiler-basic-en` raster labels, under OpenStreetMap attribution and tile service usage restrictions. Nearby evacuation shelters still use the separate GSI designated-place GeoJSON service.

## Severity and Romanization coverage

`src/hazardSeverity.cjs` maps **P2PQuake/JMA Shindo codes** independently of magnitude to colors, labels and ranks for cards, pins and observation polygons. `src/hazardZones.cjs` uses these same colors. Tsunami color is based on published warning grade per affected coast, not estimated wave height or geographic proximity. No realtime active level is derived from historic JMA Atom headlines. A future structured adapter must explicitly mark `severityVerified: true` and a supported `warningGrade` to color meteorological reports.

`src/placeReadings.cjs` includes reviewed names for 47 prefectures and frequent epicenter/coastal regions and common JMA fixed phrases; `src/romajiComposition.cjs` joins reliable readings in multi-prefecture headlines without guessing unknown Kanji. `src/romanization.js` prefers exact online Kuroshiro readings when the optional service is configured and uses local reviewed/Kana fallback when absent. Arbitrary Kanji names cannot safely be transliterated by WanaKana alone.

## ADR, deployment and licensing

See [localized ADR/deployment guides](README.md) for all 13 interface languages. Day-sensitive bulletin rendering is centralized in `src/dateTime.cjs` using `Asia/Tokyo`; `src/i18n.js` provides translated same-day labels. Timestamp tint is semantic/system indigo and is deliberately independent from `src/hazardSeverity.cjs`. The codebase is released under [MIT](../LICENSE), while external map/data services have separate terms. App Store builds require a publisher-managed EAS configuration and manual safety/accessibility validation.

## Romaji normalization for native and WebView maps

`src/romajiLabel.cjs` is shared by `src/romanization.js` and both map renderers. It uses **WanaKana 5.3.1** for Kana, then the reviewed Japanese place-name dictionary and optional morphological-analysis service for Kanji. Known Japanese + Romaji labels are passed to native Apple Maps callouts on iOS and to the safe Leaflet text popup on Android. Never infer Kanji pronunciation from WanaKana alone. Regression coverage: `tests/romajiLabel.test.cjs`.
