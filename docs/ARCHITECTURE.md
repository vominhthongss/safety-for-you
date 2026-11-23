# Architecture: Safety For You

[ADRs and deployment in 13 languages](README.md) record the decisions, context and tradeoffs. This page maps them to the current implementation.

| Boundary | Implementation | Responsibility |
| --- | --- | --- |
| App shell | `App.js`, `src/Pressable.js`, `src/useReduceMotion.js` | Navigation, permission requests, accessible language sheet, foreground lifecycle and shared press feedback |
| Presentation | `src/theme.js`, `src/i18n.js`, `src/dateTime.cjs` | Semantic surfaces, adaptive contrast, 13 language choices, JST parsing and localized Today |
| Reports | `src/data.js`, `src/hazardFacts.cjs`, `src/hazardView.cjs` | Normalize P2PQuake 551/552/556 and recent JMA headlines; preserve issued/event times and published measurements |
| Severity | `src/hazardSeverity.cjs` | One mapping for Shindo and published tsunami grades across cards, markers and regions; neutral unknown/cancelled state |
| Map | `src/SafetyMap.js`, `src/mapViewport.cjs` | Expo Go WebView with bundled Leaflet, OSM Japan English-label raster tiles, verified GPS/event framing |
| Regions | `src/hazardGeo.js`, `src/hazardZones.cjs` | Fetch/cache JMA boundaries for 24 hours; match reported areas without guessing coordinates |
| Readings | `src/romanization.js`, `src/placeReadings.cjs`, `src/romajiComposition.cjs`, `src/jaRomaji.js` | Reviewed local names, Kana conversion and optional contextual readings; retain Japanese originals |
| Weather adapter | `server/worker.js`, `wrangler.toml` | Optional public Cloudflare endpoint `/hazards` for recent JMA Atom titles |
| Romaji backend | `romaji-service/server.cjs` | Optional Node/Kuroshiro/Kuromoji service, `/health` and POST `/romaji` |
| Distribution | `app.config.js`, `eas.json`, `.env.example` | Public app identifiers/service URLs and separate preview/simulator/production builds |

## Data flow and safety semantics

REST history and a reconnecting foreground WebSocket supply P2PQuake reports. Weather titles arrive through the optional Worker. The app keeps issued time distinct from earthquake event time. Unzoned P2PQuake timestamps are JST; explicit ISO offsets remain authoritative. Sorting, urgency checks and Today formatting share the same parser. The displayed day refreshes at minute boundaries and when returning to the foreground, independently of network success.

Shindo is not magnitude. Only published grades and matched official geometry color hazard regions; station readings without coordinates do not become area polygons. Tsunami coastal lines represent the selected issued bulletin, not wave travel or inland flooding. JMA Atom headlines do not provide live warning validity or verified weather severity. Missing fields remain unknown.

## Map and accessibility boundaries

`npm install` runs `scripts/bundle-leaflet.cjs`, generating ignored `src/generated/leafletAssets.js`. The map engine is available locally; tiles and live feeds still need Internet. The basemap is OSM Japan, while GSI separately supplies evacuation GeoJSON. Keep OSM, GSI and JMA attribution and terms.

The native-to-WebView bridge double-encodes JSON and uses a restricted update function. External labels use DOM `textContent`. Map popups follow the device font scale, camera transitions honor Reduce Motion, and native status, legend and attribution rows flow below the map. Report cards provide the textual alternative to geographic overlays. Screen-reader access to every Leaflet feature still needs physical-device validation.

## State, privacy and operations

AsyncStorage holds language and appearance preferences. Location is requested after an explicit action, or reused if already granted. GSI queries and map tiles reveal approximate viewed areas to providers; reverse geocoding and optional Romaji requests also contact external services. Do not describe this as fully on-device processing. The Romaji service can receive Japanese bulletin text and shelter addresses. It needs HTTPS, request limits and appropriate logging settings in production.

There is no database, account system, background emergency push pipeline, delivery SLA, persisted offline bulletin archive or configured EAS Update channel. Deploy optional services separately. EXPO_PUBLIC values are compiled into the app, never a safe place for credentials. Store signing belongs to each distributor; the MIT license does not license external datasets or replace provider terms.
