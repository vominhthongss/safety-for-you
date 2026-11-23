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

- `EXPO_PUBLIC_REFRESH_SECONDS`: Interval pembaruan dalam detik (minimal 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: URL Cloudflare Worker opsional untuk judul berita JMA.
- `EXPO_PUBLIC_ROMAJI_API_URL`: URL layanan Kanji-ke-Romaji mandiri yang bersifat opsional.
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Pengenal tetap untuk build Android/iOS bertanda tangan.
- `EXPO_PUBLIC_*`: Variabel publik masuk ke aplikasi; jangan simpan rahasia.
- `Leaflet 1.9.4`: `postinstall` menghasilkan `src/generated/leafletAssets.js`; tile peta tetap memerlukan Internet.

## Layanan opsional

Worker Cloudflare opsional menyediakan judul buletin JMA terkini di /hazards, bukan peringatan yang masih berlaku. Layanan Romaji juga opsional dan perlu HTTPS serta pembatasan permintaan jika dipublikasikan.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Untuk konversi Kanji/Romaji, lihat`romaji-service/README.md`(Node.js 22+, HTTPS dan pembatasan permintaan). Kosongkan URL jika belum dipasang; tanpa Worker, judul cuaca mungkin tidak tersedia. Mulai ulang Expo setelah mengubah `.env`.

## Build toko aplikasi

Untuk rilis di toko aplikasi, masuk ke Expo/EAS, atur proyek build, lalu buat build produksi Android dan iOS. Identitas aplikasi harus dikelola penerbit.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Repositori belum mempunyai`eas.json`. Jalankan`build:configure`sekali dan periksa profil production. Atur kredensial penandatanganan, akun toko, pengenal, dan variabel produksi sebelum membangun. Ikuti petunjuk publikasi di bawah.

## Pemeriksaan rilis

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Sebelum merilis, siapkan kebijakan privasi, ikon, tangkapan layar, kontak, uji perangkat nyata/aksesibilitas, dan penafian bukan layanan darurat resmi. Ekspor JS bukan jaminan keamanan atau persetujuan App Store.

## Ketentuan open source

Berdasarkan[Lisensi MIT](../../LICENSE), kode dapat digunakan, diubah, dan didistribusikan kembali termasuk untuk tujuan komersial, dengan tetap menyertakan pemberitahuan hak cipta dan lisensi pada salinan substansial. Pustaka, peta, tile, dan feed pihak ketiga memiliki ketentuan sendiri. Kontribusi harus mempertahankan atribusi, verifikasi sumber, dan peringatan keselamatan.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.id.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## Publikasi ke toko aplikasi

Ikuti[panduan publikasi Google Play dan Apple App Store](../stores/STORE_RELEASE.id.md)untuk penandatanganan, pengujian, privasi, peninjauan, dan pekerjaan yang masih diperlukan.
