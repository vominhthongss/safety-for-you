# Apple interface and accessibility audit

Reviewed against Apple's [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) and [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) guidance on 2026-11-23. These are design guidelines; this review is not Apple approval or an accessibility certification.

## Implemented changes

| Area | Implementation |
| --- | --- |
| Touch controls | Shared pressed state; native buttons and attribution use at least 44pt targets. Report actions are siblings rather than nested buttons. Leaflet zoom controls remain 44px. |
| Text and layout | Native text scaling remains enabled. Header/report metadata stack on small screens or larger fonts; hazard grid drops to two columns at 200%; shelter choices wrap; iPad content width is bounded. |
| Time | Indigo text and tinted badges distinguish issue time; earthquake occurrence time is separate. Full localized date plus JST remains visible, with a localized Today prefix for the Japan calendar day. |
| Appearance | System semantic text/surfaces remain. Action foreground no longer reuses a dark-mode surface color. Custom action/time palettes have light, dark and increased-contrast iOS variants. |
| Modal | Language sheet respects bottom/side safe areas, scrolls within available height, hides underlying content from accessibility, focuses its heading and restores trigger focus on iOS dismissal. Close labels are localized; accessibility escape closes the sheet. |
| Language | The language name is 日本語 only. Other Japanese UI retains its Romaji readings. New Today, event-time, close, map controls and source-link labels cover all 13 languages. |
| Motion | Reduce Motion controls sheet transition, programmatic report scrolling and map-camera movement. |
| Map | Legend, status messages and attribution flow below the fixed map frame. Popup text follows system font scale. Zoom controls have localized accessible labels; text reports remain available outside WebView. |
| Permission | Explain location use and request permission after a tap. Previously granted permission may be reused. Reading reports does not require GPS. |

The severity palette remains separate from time styling. Known Shindo/tsunami values always have text labels; no missing data or cancelled report receives a green all-clear.

## Verification recorded for this change

- Automated data and timestamp checks, including Japan midnight/year rollover, explicit timezone offsets, unknown input, localization and existing hazard invariants.
- JavaScript bundle exports for iOS and Android.
- Source-level review of touch dimensions, modal behavior and adaptive layout.
- Custom time/action colors checked numerically for contrast; system semantic colors still require Accessibility Inspector on-device.

## Manual device checks still required

| Scenario | Expected result |
| --- | --- |
| Small iPhone, iPad split view, both platforms | No clipped header, card, sheet or attribution; safe area remains clear. |
| Largest accessibility text sizes, at least 200%, all 13 languages | Text wraps without covering controls; all language choices and map legend values remain reachable. |
| VoiceOver / TalkBack | Full report facts are read, official-link buttons can be reached separately, sheet traps focus and closes predictably. Test focus restoration on both OS versions. |
| Light, dark, Increase Contrast | Text, buttons, severity labels and time badges remain readable; inspect semantic colors and WebView contents separately. |
| Reduce Motion before launch and changed while running | No programmatic map zoom/fly or sheet slide when enabled. |
| GPS denied, slow/offline network | Reports and explanatory errors remain readable; no false all-clear. |
| UTC or another device timezone around Japan midnight | Today appears only for the Japan date; issue/occurrence labels are unambiguous. |
| Leaflet interaction | Check zoom, popup readability, attribution, large text and screen-reader fallback to native report text. |

Device runs and full store review were not performed by the source/bundle checks. Do not claim accessibility support in store metadata before completing the corresponding device evaluation.
