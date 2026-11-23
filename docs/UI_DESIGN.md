# Interface guidelines (Apple HIG-inspired)

Safety For You uses restrained grouped surfaces, native SF Symbols on iOS, localized accessibility labels, 44pt minimum touch targets and semantic Light/Dark colors.

## Home and navigation

- Home starts with Japan-local date and optional location, **without** the redundant "Today" heading.
- All ten disaster categories fit in a responsive non-horizontal grid (small screens may use more rows). Latest Reports follows immediately after.
- Sun/moon Light/Dark toggle sits alongside language choice. Saved locally and restored after app relaunch.
- Japanese static strings show original Japanese + Romaji; dynamic readings are only added when reliable.

## Leaflet + OpenStreetMap Japan map

- Expo Go-compatible WebView displays Leaflet, packaged locally during `npm install`, with OpenStreetMap Japan raster tiles. No MapLibre native SDK, Mapbox account or Google Maps key.
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

## Map visual design — OpenStreetMap Japan

- Replaces basic GSI standard raster tiles with a cleaner MapTiler Basic **English-label raster** from nonprofit OSM Japan's tile service.
- Retains Expo Go compatibility through WebView + Leaflet. iOS and Android each show the same visual style and accessibility-friendly GSI/OSM source link (now updated to OSM Japan).
- Source-confirmed quake Shindo region polygons are filled with readable colors. Source-confirmed tsunami forecast-coast lines have graded red, purple and amber strokes. A small legend clearly distinguishes an **issued coast warning** from a simulated moving tsunami.
- Popup titles are passed through the existing Japanese/Romaji formatter, with untrusted text inserted through `textContent`.
- User and event markers remain present, and the camera includes the boundaries when they exist. No fabricated radius or predicted shaking field.
- Missing zone data is explicitly reported; the app never suggests that a lack of colored regions means the coast is safe.

## Unified severity palette and accessible map markers

- Shindo scale 1 and 3 have visibly different colors in both **report cards and map markers**, even when no official area geometry is available. A visible text label accompanies every known intensity.
- Shared mapping in `src/hazardSeverity.cjs` controls event card and pin colors; `src/hazardZones.cjs` uses the same mapping for official observed shaking-region polygons and tsunami forecast coastlines.
- Tsunami grades are yellow (advisory), red (warning), and purple (major warning). Cancellations and unavailable measurements are neutral gray. No generic weather bulletin receives arbitrary red/green severity coloring.
- Common Japanese geographic names, source phrases and joined region titles receive Romaji without depending on optional backend configuration. For unknown Kanji, avoid incorrect pronunciation; no invented Romaji is displayed.

## Apple HIG review (2026-11-23)

Verified design targets against [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) and [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets):

- Main controls and filter chips use at least **44pt** touch targets; category cards can grow when text scales. No deeply nested pressable actions within report selection.
- Report timestamps have a semantic indigo accent **distinct from risk-grade colors** and prepend localized **Today** only on the same calendar date in Japan (`Asia/Tokyo`). Colors never indicate hazard severity by themselves.
- The language selector displays `日本語` without Romaji, has a localized close label, marks the selected option for VoiceOver, provides a scrollable list and a height suitable for the visible screen.
- Semantic iOS system colors adapt to appearance; larger text, VoiceOver, safe areas, compact layouts, reduced contrast and dark mode require device QA.
- This is an **implementation review, not an Apple certification or App Store approval**. Verify contrast, WCAG-equivalent accessibility behavior and human safety copy on physical devices.

### Manual iOS QA still required

- [ ] VoiceOver order/selected language and dismissal of sheet.
- [ ] Dynamic Type at accessibility sizes, long translations and iPad split-screen.
- [ ] Light/Dark/high-contrast, touch targets and report card actions.
- [ ] Screen reader map fallback, denied location and offline feed behavior.
- [ ] App Store privacy/metadata, location permission wording and accurate non-official warning disclaimer.

## iPhone native Apple Maps and Android region intensity badges (2026-11-23)

- iOS uses **native Apple Maps** (MapKit through `react-native-maps`, default provider) rather than the WebView map; Android continues to use Leaflet and OSM Japan tiles.
- A blue dot shows the permitted foreground user position, a separate epicenter pin identifies the verified quake center, and JMA-published affected regions show appropriately colored polygon boundaries and circular **Shindo 1/2/3/4/5-/5+/6-/6+/7** labels.
- Badge coordinates are derived solely from **official JMA polygon geometry**, not invented seismic-station coordinates. The official region's measured intensity is shown as text and color; a general quake magnitude M is never substituted for local intensity.
- On both platforms, selecting an earthquake includes the selected epicenter, GPS and published area bounds in the visible camera. Where GPS or valid JMA coverage is absent, show the explicit unavailable state instead of a made-up marker.
- Tsunami warning coasts retain their official colored lines; the map must not simulate wave motion, travel time or inland inundation.
- On iOS validate native marker size, zoom/gesture interactions, text accessibility, MapKit attribution, long Japanese/Romaji names and dark appearance. On Android validate the WebView region-number badges and map/OSM attribution.

## Map marker readings

- iOS native Apple Maps: original Japanese marker title, verified Romaji in the subtitle, plus reported Shindo when present.
- Android Leaflet: popup label retains original Japanese and Romaji on separate lines; verified area-intensity badges do not represent exact station coordinates.
- WanaKana transliterates Kana locally. Kanji relies on the reviewed `src/placeReadings.cjs` dictionary or optional reading service; unknown readings remain Japanese.
- Language picker keeps plain `日本語`, without the extra Romaji subtitle.
