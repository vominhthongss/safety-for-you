# Safety For You — Expo SDK 58

A **free, nonprofit** React Native application (JavaScript only) for natural-disaster information in Japan.

> **Important:** This prototype complements Japan's official emergency alerts. A missing or delayed feed is **not** an all-clear. Follow J-Alert, JMA, local authorities, and your surroundings.

## Run in Expo Go (iOS + Android)

Use Node.js 22+ with an **Expo Go app that supports SDK 58**:

```bash
npm install
cp .env.example .env
npx expo start --go -c
```

Open with Expo Go on iOS/Android or the matching Simulator. **No Xcode rebuild, `expo prebuild`, Google Maps key, MapLibre or custom development client is needed for the map.**

- The map renders with **react-native-webview 14.0.1** (included in Expo Go 58).
- **Leaflet 1.9.4** is packaged **inside the app** by `postinstall` (`scripts/bundle-leaflet.cjs`). This avoids downloading Leaflet from a CDN at runtime. If Metro cannot find `src/generated/leafletAssets.js`, rerun `npm install` or `npm run bundle:maps`.
- Real map tiles come from the public **Geospatial Information Authority of Japan (GSI)** over HTTPS. No Google Maps API key, account, billing, or Mapbox token is required. GSI tile access still needs Internet and is subject to [GSI terms](https://maps.gsi.go.jp/development/ichiran.html). Always keep the visible `© GSI` attribution.
- The old native MapLibre package and Expo config plugin are **removed**; `MLRNCameraModule` is no longer referenced by the app.
- If Expo Go itself runs a different SDK than 58, install a compatible Expo Go version. This is an **SDK mismatch**, not a MapLibre dependency.

## User-facing features

- Quick configurable splash (`EXPO_PUBLIC_SPLASH_MIN_MS`), Japan-local date, consent-based location permission and compact 10-hazard grid.
- Earthquake and tsunami reports from P2PQuake v2, a foreground WebSocket and REST history. Earthquakes show **Magnitude (M), JMA Shindo (measured/predicted) and hypocenter depth** when reported. Tsunami warnings show **wave-height forecasts per coastal region**, warning level, arrival estimates, and cancellation where available.
- Other JMA categories (typhoon, heavy rain, flood, landslide, volcano, heavy snow, extreme heat) use a separately deployed optional JMA Atom-feed Worker (`EXPO_PUBLIC_JMA_PROXY_URL`). This Worker currently categorizes **recent bulletin titles only**, not active warnings or verified numerical observations. The app never invents wind, flood, or rainfall figures.
- **Leaflet + GSI map** with markers for the user and verified hazard coordinates. Select an event and `fitBounds` automatically frames both the event and GPS location. Regional warnings without confirmed coordinates **do not get a fake pin**. If GPS is denied, focus the event only.
- Nearby GSI **designated emergency evacuation locations** filtered by the relevant hazard, including safety notes for foreign residents (papers, passport/residence card if within reach, medication, water, travel light).
- 13 languages: ja, en, vi, zh-CN, zh-TW, ko, tl, ne, id, pt, my, th, hi. Japanese static interface strings include Romaji. WanaKana converts Kana locally; dynamic Kanji readings optionally come from the Kuroshiro/Kuromoji service (`EXPO_PUBLIC_ROMAJI_API_URL`). Unverified readings remain in Japanese without a misleading placeholder.
- A sun/moon toggle next to the language picker saves Light/Dark Mode locally.

## Deploy the optional weather news Worker

```bash
npx wrangler login
npx wrangler deploy
```

Add its URL (for example `https://your-worker.workers.dev`) to `EXPO_PUBLIC_JMA_PROXY_URL` in `.env` and restart Expo. Details in `server/worker.js`. Without this backend, weather category pages show an explicit not-configured state, not mock warnings.

## Tests

```bash
npm install
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

The CI exports JavaScript bundles on **both platforms**, but a successful JS bundle is **not** a physical-device, WebView, network, or emergency safety certification. Check real hardware, accessibility zoom, GPS denied, poor connections, and map attribution.

## Safety / production limits

- Leaflet JS/CSS are bundled for offline *engine* availability, but **GSI map imagery still requires Internet**. Do not treat this as an offline navigation app or rely on a map during an outage.
- GSI designations do **not** guarantee evacuation sites are open or accessible.
- P2PQuake and JMA headlines are not a guaranteed real-time emergency warning service. WebSocket runs only in the foreground. Add a reliable monitored server-side alert pipeline, full JMA structured severity/cancellation parsing, geographic areas, and qualified translations before providing push emergency warnings.
- The user's GPS is shared only as necessary for map tiles/local area queries. Publish a privacy policy and test accessibility and user safety before distribution.

Sources: [Expo WebView v58](https://docs.expo.dev/versions/v58.0.0/sdk/webview/), [Leaflet reference](https://leafletjs.com/reference.html), [GSI map tiles](https://maps.gsi.go.jp/development/ichiran.html), [JMA](https://www.jma.go.jp/), [P2PQuake](https://www.p2pquake.net/develop/json_api_v2/).
