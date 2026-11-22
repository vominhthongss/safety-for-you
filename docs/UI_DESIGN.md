# Apple HIG-inspired UI: Safety For You

Last reviewed: 2026-11-22. Guidelines are principles, not an Apple design certification. This is React Native, not native UIKit/SwiftUI.

## Layout and navigation

- Minimal top toolbar: brand on Home; Chevron-back text action on detail pages; language opens a modal sheet.
- Home removes redundant **Today** heading. Date is the leading content, location follows.
- All 10 disaster categories visible without horizontal scrolling. Grid calculates columns from window width and system font scale: 5 per row on ordinary iPhones, 4 on smaller, 3 at high text scale. Tiles stay above 44x44pt touch size.
- The **Latest updates** section follows directly beneath the grid with grouped, compact information rows.
- Emergency records never say **all clear**; missing data has explicit states.

## Visual style

- iOS `PlatformColor` semantic system colors: `label`, `secondaryLabel`, `systemGroupedBackground`, `secondarySystemGroupedBackground`, `separator`, `systemBlue`, `systemRed`.
- `expo-symbols`: SF Symbols on Apple devices, Material Symbols on Android, fallback icon for missing glyph.
- System fonts, scaling enabled by default on RN `Text`. Strong contrast and sparse accents; red reserved for risk. Avoid truncating data and evacuation details.
- Control surfaces at least 44pt, meaningful VoiceOver labels / states for language and hazard controls.

## Japanese and Romaji

- Static Japanese UI terms: `src/jaRomaji.js` maps all Japanese translation keys to corresponding Latin-script readings. Labels show both lines to support unfamiliar readers.
- Dynamic Japanese names/messages: configure `EXPO_PUBLIC_ROMAJI_API_URL` with the optional Kuroshiro/Kuromoji Node service. This is a phonetic guide, not an official translated alert.
- Reading may be wrong for rare geographical names. Until a Kanji reading is returned, show the original Japanese without a placeholder. Do not fabricate readings or location coordinates.

## Manual acceptance checklist

- [ ] iPhone SE / 375pt iPhone / iPhone Pro Max / iPad: all ten icons accessible without sideways swipes; Latest updates visible soon after grid.
- [ ] System 100%, 150%, 200% text scale: no overlap or clipped safety messages.
- [ ] iOS Light/Dark Mode / high contrast / VoiceOver / Reduce Motion: legible text and navigable controls.
- [ ] Japanese interface: every static Japanese label includes Romaji; live report names pair when configured.
- [ ] Android: symbol fallback and contrast remain readable.
- [ ] Denied GPS, offline, JMA Worker not configured, invalid Romaji service: no false assurances.
- [ ] Real-device screenshot review before claiming App Store / HIG compliance.

## Official design references

- https://developer.apple.com/design/human-interface-guidelines/layout
- https://developer.apple.com/design/human-interface-guidelines/typography
- https://developer.apple.com/design/human-interface-guidelines/color
- https://developer.apple.com/design/human-interface-guidelines/buttons
- https://developer.apple.com/design/tips/

## Theme and map renderer

- A sun/moon button appears immediately beside language selection, with a 44pt minimum hit area and localized accessibility label.
- Device theme is the default; manual Light / Dark Mode override persists through AsyncStorage and React Native Appearance.
- iOS semantic system colors and Android dark/light tokens style text, backgrounds, separators, controls and map overlays.
- MapLibre renders official GSI raster tiles without Google Maps, and retains original GSI map colors for geographic readability.
- WanaKana reads Kana locally. Kanji readings require Kuroshiro+Kuromoji when configured. Missing readings show original Japanese without a placeholder.

## Report-specific map framing and metric presentation

- Selecting any report shows that exact report first. If it has coordinates, the map camera fits verified event and GPS points using geographic bounds and padding; location permission denied = show event only. Coastal tsunami advisories and weather bulletins without verified event coordinates never acquire a made-up pin.
- The earthquake card clearly distinguishes **M (magnitude)** from **Shindo (Japan intensity)** and labels early-warning Shindo as a prediction.
- Tsunami grade, height and estimated arrival time appear per coastal area. Height labels preserve the published meaning: absolute meters, “over/below” or qualitative high/huge.
- Weather tiles display numbers only when provided in structured official feed fields. The current XML headline adapter cannot supply numeric measures, so it shows a clear absence notice instead of estimates.
