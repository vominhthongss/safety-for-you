# Interface guidelines (Apple HIG-inspired)

Safety For You uses restrained grouped surfaces, native SF Symbols on iOS, localized accessibility labels, 44pt minimum touch targets and semantic Light/Dark colors.

## Home and navigation

- Home starts with Japan-local date and optional location, **without** the redundant "Today" heading.
- All ten disaster categories fit in a responsive non-horizontal grid (small screens may use more rows). Latest Reports follows immediately after.
- Sun/moon Light/Dark toggle sits alongside language choice. Saved locally and restored after app relaunch.
- Japanese static strings show original Japanese + Romaji; dynamic readings are only added when reliable.

## Leaflet + GSI map

- Expo Go-compatible WebView displays Leaflet, packaged locally during `npm install`, with GSI raster tiles. No MapLibre native SDK, Mapbox account or Google Maps key.
- Panning, pinching, zoom controls, individual interactive markers and a clearly visible GSI attribution/terms link.
- When an event with verified coordinates is selected, its pin and user GPS pin are both visible via `fitBounds` (including geographically distant points). No false event pin for area warnings. If GPS is denied, the event is centered.
- On slow/no network, map imagery may be unavailable; the app should show an error and must never imply there is no danger.
- Map source GSI tiles keep their standard colors in both themes for road/contour legibility.

## QA

- [ ] Expo Go SDK 58 iOS Simulator and physical iPhone; no `MLRNCameraModule` error.
- [ ] Expo Go SDK 58 Android emulator and device; no Google Maps key.
- [ ] Tap an earthquake with known epicenter; verify both pins are framed correctly.
- [ ] Select a tsunami/weather regional bulletin; map must not invent a point.
- [ ] GPS denied and low connectivity; map fallback and official bulletin remain accessible.
- [ ] GSI attribution visible; major labels readable with VoiceOver and large system font.
