# Safety For You — Architecture decision records

Accepted · 2026-11-23 · describes the code on this branch

[Introduction and deployment](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo and a bundled WebView map

**Context:** The map must work in SDK 58 Expo Go on iOS and Android.

**Decision:** Use JavaScript, Expo 58, React Native 0.88 and Leaflet 1.9.4 inside react-native-webview. Bundle the map engine during npm install; request OSM Japan English-label tiles over HTTPS.

**Consequences:** A custom MapLibre native build is avoided. Tiles still need connectivity, attribution and provider capacity; native-device QA remains necessary.


## ADR-002 — Source-backed hazard data

**Context:** Magnitude, Shindo and tsunami grade mean different things; historical reports can be mistaken for active warnings.

**Decision:** Normalize P2PQuake 551/552/556, retain issue/event times, and use published Shindo or tsunami grades for text and colors. Match only verified regions to JMA geometry. The optional Worker supplies recent JMA headlines.

**Consequences:** Never infer current alerts, coordinates or missing measurements. Coastal lines and polygons are issued areas, not wave propagation or inundation forecasts. Keep official links and neutral unknown/cancelled states.


## ADR-003 — Foreground refresh and local preferences

**Context:** A lightweight informational app has no monitored push infrastructure.

**Decision:** Use foreground REST refresh (at least 60 seconds) and WebSocket reconnect/backoff; stop the connection in background. Store language and appearance in AsyncStorage.

**Consequences:** No background emergency notifications or delivery SLA. Location is requested after a user action; existing permission may be reused. GPS denial must leave reports accessible.


## ADR-004 — Localization and Japanese readings

**Context:** The app offers 13 selectable languages; place names must remain recognizable.

**Decision:** Use src/i18n.js with English fallback. Keep the language autonym 日本語 without Romaji. Preserve Japanese bulletin text; add reviewed dictionary/Kana readings or optional Kuroshiro readings.

**Consequences:** Documentation has all 13 languages; existing UI translations are partial outside ja/en/vi. Unknown names are not guessed, and romanization is not a safety translation.


## ADR-005 — Japan time and accessible UI

**Context:** A viewer abroad must not mistake yesterday’s bulletin for today’s. Small controls and overlapping map labels hinder access.

**Decision:** Parse unzoned P2PQuake dates as JST, preserve explicit offsets, and compare calendar days in Asia/Tokyo. Prefix localized Today, retain full date and JST, update at minute boundaries and foreground resume. Use distinct time colors, 44pt targets, scalable text, modal focus, reduced motion and labels alongside severity colors.

**Consequences:** Issue time and earthquake occurrence time remain distinct. Map legends flow below the map. Apple HIG guides implementation; exports and this ADR do not certify store approval or accessibility.


## ADR-006 — Optional services and data boundaries

**Context:** Rare Kanji readings and JMA headlines need server-side processing without making the core app depend on an account.

**Decision:** Deploy server/worker.js to Cloudflare and romaji-service separately to Node. Configure HTTPS base URLs with EXPO_PUBLIC variables. Render remote labels as text, not executable HTML.

**Consequences:** The Worker is public/cacheable; the Romaji service needs operational rate limits and monitoring. EXPO_PUBLIC values are embedded in the app. Providers receive network metadata, map requests and, if enabled, conversion text.


## ADR-007 — MIT and independent releases

**Context:** Contributors need explicit reuse rights and a reproducible release path.

**Decision:** License original code/docs under MIT; keep third-party terms. Separate preview, simulator and production EAS profiles and environments. Keep signing credentials outside Git.

**Consequences:** Forks may be commercial but retain notices. Hosting, store accounts and credentials belong to each operator. There is no OTA pipeline or guarantee of official endorsement.

## References

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
