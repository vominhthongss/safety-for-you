# Architecture: Safety For You

## Frontend

- Expo SDK 58 + React Native 0.88, **JavaScript**.
- `src/SafetyMap.js`: `react-native-webview` with a local, npm-packaged Leaflet engine. No native map SDK or custom Expo config plugin.
- `scripts/bundle-leaflet.cjs` runs during `npm install`, reads Leaflet 1.9.4 CSS/JS from `node_modules`, and generates `src/generated/leafletAssets.js` (intentionally gitignored).
- WebView runs a self-contained map HTML. Raster tiles come only from `https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png`. The GSI source link and attribution appear in the React Native overlay.
- Native-to-WebView messages pass serialized JSON into a **restricted update function**, not executable API data. Label popups use `textContent`, not `innerHTML`.
- `src/mapViewport.cjs` computes verified user + selected-event bounds. Leaflet `fitBounds` updates the zoom when a report is selected. A regional warning without coordinates gets no marker.
- `src/theme.js` provides semantic iOS and explicit Android Light/Dark colors. The preference uses AsyncStorage and React Native Appearance.

## Data

- `src/data.js` normalizes P2PQuake 551/552/556 events and queries GSI hazard-specific GeoJSON evacuation points.
- `src/hazardFacts.cjs` and `src/hazardView.cjs` maintain source-backed earthquake magnitude, Shindo, tsunami region/height/grade and optional weather measurements. JMA Atom headlines are **not** real-time active alert state.
- `server/worker.js` is an optional Cloudflare Worker that categorizes *recent* JMA Atom bulletins. It does not provide structured warning severity, geometry, or numerical weather measurement.
- `src/romanization.js` uses WanaKana on-device for Kana. An optional Node Kuroshiro/Kuromoji service handles Kanji. Readings for rare place names need review.

## Boundaries / risks

- **Expo Go supported**, but requires an Expo Go build matching SDK 58. WebView is included natively in that build.
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
