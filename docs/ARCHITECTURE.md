# Architecture & safety design notes

## Data lifecycle
1. Expo UI starts without waiting for network or GPS. Native splash ends immediately; `EXPO_PUBLIC_SPLASH_MIN_MS` is clamped to 600 ms.
2. Foreground location requested by OS. No background GPS permission, no account or telemetry.
3. P2PQuake WebSocket `wss://api.p2pquake.net/v2/ws` distributes direct foreground reports 551/552/556; `/v2/history` pulls recent records on a configurable interval.
4. Optional Cloudflare Worker polls official JMA Atom long feeds with cache (not an alert-state engine). The client checks every configurable interval; JMA original title remains untranslated.
5. The maps indicate user and verified point positions. Regional reports have no point, explicitly tell user not to expect a precise marker.
6. GSI GeoJSON `skhbXX` disaster-specific tile data at zoom 10 is queried for current 3×3 tile neighborhood and facility flags are used for rendering. No fabricated data.

## Hard safety boundaries
- No user-facing conclusion of **all clear**.
- No background or guaranteed emergency notification claims.
- No app navigation should direct users to a shelter solely based on its listing: its operating status cannot be confirmed.
- An alert without coordinates is **not** placed at a guessed prefecture centroid.
- False certainty is worse than a visible data failure; show unconfigured/error states.
- Users should follow J-Alert, mobile emergency alert, broadcast and municipality directions.

## Next production milestones
- JMA XML parse and prefecture/municipality geocoding with verified gazetteer, typhoon tracks, area alerts, cancellation handling and freshness.
- Push relay with monitored 24/7 SLO/uptime, resilience, geo-fencing and service agreement.
- Real device testing, manual review of translations by native speakers, screen-reader testing and child-accessibility assessment.
- Local government active shelter feed, reliable offline maps and cached local shelter index.
- External legal review, provider attribution/licensing audit, privacy page and data handling assessment.

## Map renderer and appearance

`@maplibre/maplibre-react-native` v11 replaces react-native-maps on both platforms. GSI raster tiles supply the map background, with attribution. Expo Go is unsupported; custom native builds must include the plugin. A saved Light/Dark override uses Appearance and AsyncStorage. iOS semantic and Android explicit palette tokens style application surfaces. Official GSI map tiles are not recolored.
