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
- Reading may be wrong for rare geographical names. Until a reading is returned, show the original plus explicit **Romaji: unavailable**. Do not fabricate readings or location coordinates.

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
