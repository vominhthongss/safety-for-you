# Safety For You — Mga pasya sa arkitektura

Tinanggap · 2026-11-23 · batay sa code ng branch na ito

[Pagpapakilala at gabay sa deployment](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo at mapa

**Konteksto:** Kailangang gumana sa SDK 58 Expo Go ng dalawang platform.

**Pasya:** JavaScript, Expo 58/RN 0.88 at Leaflet 1.9.4 sa WebView; naka-bundle sa npm install at OSM Japan English tiles.

**Epekto:** Walang dagdag na MapLibre native build; kailangan pa rin ng Internet, attribution, kapasidad at tunay na device testing.


## ADR-002 — Mga ulat na may batayan

**Konteksto:** Magkaiba ang magnitude, Shindo at tsunami grade; hindi laging aktibo ang lumang bulletin.

**Pasya:** I-normalize ang P2PQuake 551/552/556, panatilihin ang issue/event time at opisyal na grade; itugma lamang ang beripikadong JMA region.

**Epekto:** Mga bagong pamagat lamang ang Worker. Huwag manghula ng sukat, lokasyon o bisa. Ang rehiyon ay hindi simulation ng alon o baha; panatilihin ang label at opisyal na link.


## ADR-003 — Foreground update

**Konteksto:** Walang minomonitor na push infrastructure.

**Pasya:** REST nang hindi bababa sa 60 segundo, WebSocket reconnect at paghinto sa background; AsyncStorage para sa preference; lokasyon pagkatapos ng kilos ng user.

**Epekto:** Walang pangakong background alert o latency. Maaaring gamitin ang dating pahintulot; mababasa pa rin ang ulat kapag tinanggihan.


## ADR-004 — Wika at Romaji

**Konteksto:** Kailangang makilala ang orihinal na pangalan.

**Pasya:** 13-wikang i18n at English fallback; 日本語 lamang sa picker, may Romaji pa rin ang ibang Japanese label. Lokal na diksyunaryo/Kana at opsyonal na Kuroshiro.

**Epekto:** 13 wika ang dokumentasyon; bahagya pa ang lumang UI sa labas ng ja/en/vi. Hindi hinuhulaan ang di-alam na pangalan; hindi pagsasaling pangkaligtasan ang Romaji.


## ADR-005 — Oras at accessibility

**Konteksto:** Maaaring mali ang basa dahil sa timezone o malaking teksto.

**Pasya:** Unzoned time bilang JST, panatilihin ang ISO offset, Today ayon sa Asia/Tokyo, buong petsa/JST at update bawat minuto/pagbalik. Ibang kulay ng oras, 44pt, lumalaking teksto, modal focus at Reduce Motion.

**Epekto:** Magkahiwalay ang issue/event time, nasa ibaba ang legend. Hindi Apple approval o certification ang pagsunod sa HIG.


## ADR-006 — Hiwalay na serbisyo

**Konteksto:** Kailangan ng server para sa JMA at bihirang Kanji.

**Pasya:** Cloudflare Worker at Node Romaji na hiwalay, HTTPS EXPO_PUBLIC URL at text-only na remote label.

**Epekto:** Kailangan ang cache monitoring at rate limit. Nasa app ang config; tumatanggap ang provider ng network metadata, tile request at opsyonal na conversion text.


## ADR-007 — MIT at release

**Konteksto:** Kailangan ng malinaw na reuse at release.

**Pasya:** MIT para sa sariling code/docs, hiwalay na third-party terms, EAS preview/simulator/production at keys sa labas ng Git.

**Epekto:** Puwede ang komersiyal na fork na may notices. Sariling hosting/store account ng operator; walang OTA o opisyal na endorsement.

## Mga sanggunian

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
