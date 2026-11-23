# Panduan deployment — Safety For You (Bahasa Indonesia)

Safety For You adalah aplikasi informasi bencana Jepang yang gratis, nirlaba, dan sumber terbuka dengan lisensi MIT. Bukan pengganti JMA, J-Alert, atau instruksi pemerintah setempat.

## Prasyarat

Siapkan Node.js 22+ dan Expo Go yang mendukung SDK 58. Repo belum memiliki lockfile; jalankan npm install.

## Jalankan lokal

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: refresh interval (minimum 60 s).
- `EXPO_PUBLIC_JMA_PROXY_URL`: optional Cloudflare Worker URL.
- `EXPO_PUBLIC_ROMAJI_API_URL`: optional self-hosted Kanji/Romaji endpoint.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: app identifiers for native builds.
- `EXPO_PUBLIC_*` values are embedded in public client bundles; never put secrets in them.
- Leaflet 1.9.4 is generated locally by `postinstall` into `src/generated/leafletAssets.js`. Map raster tiles still require network access.

## Layanan opsional

Worker Cloudflare opsional menyediakan judul buletin JMA terkini di /hazards, bukan peringatan yang masih berlaku. Layanan Romaji juga opsional dan perlu HTTPS serta pembatasan permintaan jika dipublikasikan.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Build toko aplikasi

Untuk rilis di toko aplikasi, masuk ke Expo/EAS, atur proyek build, lalu buat build produksi Android dan iOS. Identitas aplikasi harus dikelola penerbit.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## Pemeriksaan rilis

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Sebelum merilis, siapkan kebijakan privasi, ikon, tangkapan layar, kontak, uji perangkat nyata/aksesibilitas, dan penafian bukan layanan darurat resmi. Ekspor JS bukan jaminan keamanan atau persetujuan App Store.

## Ketentuan open source

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.id.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
