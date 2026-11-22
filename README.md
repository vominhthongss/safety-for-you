# Safety For You · Expo SDK 58

**Free, nonprofit information app for people living in Japan.** React Native with **JavaScript only**, Expo SDK 58.

> This app complements—but must never replace—Japan's emergency alerts, official evacuation orders and local disaster radio. **No feed entries does not mean safe.** This repository is an MVP; it has not passed production emergency-alert certification.

## Features

- Quick native splash plus optional friendly splash (`.env`, 0–600 ms, **never waits for APIs**).
- Home: Japan-local date, permission-based location, accessible emoji illustrated horizontal 2-row grid, newest hazard **reports**.
- P2PQuake live foreground WebSocket (551 earthquakes, 552 tsunami, 556 emergency earthquake warning), REST history and reconnect/backoff, issue timestamps and source labels.
- JMA weather/bulletin feed adapter (Cloudflare Worker): typhoon, heavy rain, flood, landslide, volcano, snow and heat keyword-classified **recent bulletins**, **not authoritative active warning states**.
- Map with user point and verified epicenter/event point if supplied; no invented coordinates for regional bulletins.
- GSI designated **emergency evacuation places** by hazard, 3×3 nearby z10 tiles. Each facility clearly states which hazards it is designated for; this is not a real-time opening status.
- 13 language choices: Japanese, English, Vietnamese, Simplified Chinese, Traditional Chinese, Korean, Filipino, Nepali, Indonesian, Portuguese, Burmese, Thai, Hindi. Basic navigation and safety phrases are localized, untranslated copy falls back to English. Official JMA headlines **remain Japanese** pending qualified translation.
- No logins, ads, analytics, background tracking or uploaded GPS data in this code.

## Start

Use Node.js 22+, then:

```sh
npm install
cp .env.example .env
npx expo install --fix
npx expo start
```

> SDK 58 on real devices: test with a development build if Expo Go's installed release does not match. `npx expo install --check` checks native dependency versions. For Android maps in a standalone build, configure `GOOGLE_MAPS_ANDROID_API_KEY` in `.env`; enable Maps SDK for Android and limit its usage by package name and signing SHA-1.

## Configure the JMA weather source

The **earthquake and tsunami pages work without your own backend**. The other categories show **not configured** until the Worker is deployed. No mock/dummy hazard data is displayed.

1. Create Cloudflare Workers account, install Wrangler: `npx wrangler login`.
2. Deploy: `npx wrangler deploy` (uses `wrangler.toml` and `server/worker.js`).
3. Set `EXPO_PUBLIC_JMA_PROXY_URL=https://your-worker.workers.dev` in `.env`.
4. Restart Expo with `npx expo start -c`. Visit `https://your-worker.workers.dev/hazards` to validate response.

The Worker fetches JMA official long Atom feeds, classifies bulletin *titles* and caches upstream calls. **It does not parse affected polygons, warning severity, cancellation or validity**. Do not trigger urgent notifications from these categorized headlines. Its `kind` response states `RECENT_JMA_BULLETINS_NOT_ACTIVE_WARNINGS`.

## Shelter map

GSI's `skhb01`–`skhb08` official GeoJSON tiles are retrieved on-demand at zoom **10**, nine tiles near current location, and filtered by disaster designation flags. First grant foreground location permission and choose the hazard you need. Data may be outdated, closed, missing, and local evacuation directives always take priority. An earthquake-designated place is **not necessarily a tsunami-designated place**.

Tips on map: important papers, medication, water, and (for foreigners when easily reachable) passport/residence card; take only light luggage; life is most important. A tsunami: evacuate to high ground promptly, no app wait.

## Important implementation limits / launch checklist

- **Not a production emergency warning service**. Foreground WebSocket connection closes in background and may disconnect. For reliable alerts, a separately operated, monitored push backend, official data supply contract, duplicates/cancellations and latency monitoring are required.
- P2PQuake has IP-based rate limits and WebSocket connection limits. For large-scale usage, run a centralized backend; do **not** connect thousands of clients directly.
- Current JMA adapter classifies recent bulletins, **not in-force, geo-targeted active warnings**. Required next step: parse official XML detail and municipal code/geometry; validated translations and human review before urgent notices.
- GSI is not a real-time occupancy or opening API and shows designated **emergency evacuation places**, distinct from designated long-stay shelters.
- Map requires network; offline maps / stored evacuation map not yet implemented.
- Request only foreground location; on-device geocoding and tile coordinates are shared with map / data providers as needed. Add and publish privacy policy, accessibility testing and approved app icons before public store release.
- Validate on iOS & Android hardware, poor network, denied GPS, missing permissions, stale feeds, screen readers, large font, earthquake/tide drills, and closed facilities.
- Japanese authorities: JMA https://www.jma.go.jp/ ; GSI https://www.gsi.go.jp/bousaichiri/hinanbasho.html ; P2PQuake https://www.p2pquake.net/develop/json_api_v2/

## Test

```sh
npm test
npx expo install --check
```

Tests currently cover configuration/source contract only, not runtime hardware safety scenarios.
