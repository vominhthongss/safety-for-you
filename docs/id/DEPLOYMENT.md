# Safety For You — Pengenalan dan panduan penerapan

[Catatan keputusan arsitektur](ADR.md) · [🌐](../README.md)

## 1. Proyek dan sumber terbuka

Safety For You adalah aplikasi seluler gratis dan nirlaba untuk penduduk serta pengunjung Jepang. Aplikasi menggabungkan laporan gempa/tsunami, buletin cuaca terkini, peta dan lokasi evakuasi darurat yang ditetapkan. Ini proyek independen, bukan layanan pemerintah. Pembaruan hanya saat aplikasi terbuka; tidak ada push darurat latar belakang atau jaminan keselamatan luring.

Kode dan dokumentasi asli berlisensi [MIT](../../LICENSE): boleh dipakai, diubah, disebarkan dan dijual dengan mempertahankan pemberitahuan hak cipta dan izin. Tujuan nirlaba tidak melarang fork komersial. Tidak ada garansi. Data, peta dan dependensi tunduk pada [ketentuan masing-masing](../../THIRD_PARTY_NOTICES.md). Kontribusi melalui fork, cabang, verifikasi dan PR; jangan commit kredensial atau kunci penandatanganan.

## 2. Persyaratan

Siapkan Node.js 22+, npm, Git dan Expo Go yang mendukung SDK 58. Build iOS lokal memerlukan macOS/Xcode; Android memerlukan SDK/JDK yang sesuai. Gunakan akun Expo sendiri untuk cloud, Apple Developer/Google Play Console untuk toko. Tidak memerlukan database atau kunci Google Maps.

## 3. Menjalankan secara lokal

Jalankan dari akar repositori; jangan timpa `.env` yang sudah ada. Isi tabel berikut dan pindai QR dengan Expo Go. Leaflet dibundel saat instalasi; jika berkas hasilnya hilang, jalankan `npm run bundle:maps`. Ada 13 pilihan bahasa, tetapi sebagian teks UI lama selain ja/en/vi masih kembali ke bahasa Inggris.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Variabel | Arti |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | Jeda awal opsional, 0–600 ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | Interval pembaruan aktif: minimal 60 detik, standar 120. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | URL dasar HTTPS Worker tanpa /hazards; kosong menonaktifkan sumber cuaca. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | URL dasar HTTPS Romaji tanpa /romaji; kosong hanya memakai pembacaan lokal. |
| `ANDROID_PACKAGE` | ID aplikasi Android milik Anda. |
| `IOS_BUNDLE_ID` | Bundle ID iOS milik Anda. |
| `EAS_PROJECT_ID` | UUID proyek Expo; opsional untuk Expo Go, EAS harus terhubung ke proyek Anda. |

## 4. JMA Worker opsional

Atur nama unik di `wrangler.toml`, masuk ke Cloudflare lalu deploy dari akar repositori. Ganti host contoh dengan URL hasil Wrangler. `/hazards` harus mengembalikan JSON dengan `items` dan `kind`; `degraded: true` berarti sebagian sumber gagal. Masukkan URL dasar ke `.env`. Worker hanya mengelompokkan judul Atom JMA, bukan memverifikasi status peringatan aktif atau hasil pengukuran.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. Layanan Romaji opsional

Jalankan di terminal VPS lain. Untuk produksi gunakan systemd, container atau pengelola proses, reverse proxy HTTPS di depan port 3088, serta pembatasan akses langsung, ukuran dan laju permintaan. Pastikan `/health` menghasilkan `{"ok":true}` dan POST `/romaji` menghasilkan larik pembacaan. Atur URL dasarnya. Permintaan dapat berisi nama tempat, buletin dan alamat evakuasi; minimalkan log isi. Kamus/Kana lokal tetap bekerja jika layanan gagal.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Membangun Android dan iOS

Buat proyek sendiri di Expo dashboard, masukkan UUID ke `EAS_PROJECT_ID`. Tetapkan kedua ID sebelum build pertama; ubah name/slug/scheme dalam `app.config.js` jika fork. `eas.json` menyediakan preview (APK Android/ad hoc iOS), simulator (iOS Simulator), production (AAB Android/toko iOS). Daftarkan variabel yang diisi pada lingkungan preview dan production di Expo; `.env` yang diabaikan Git tidak ikut diunggah. Nilai ini konfigurasi publik, bukan rahasia. Setelah perubahan, mulai ulang Metro atau build lagi.

Login lalu pilih perintah build; EAS memberikan tautan unduhan. iOS ad hoc perlu `npx eas-cli device:create` dan penandatanganan Apple. Build Simulator tidak dapat dipasang ke iPhone. Tambahkan `--local` jika perangkat Anda memiliki toolchain yang sesuai.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. Pengiriman ke toko

Build production lalu kirim untuk platform yang dipilih. Kelola penandatanganan lewat EAS, tanpa menyimpan kunci di Git. Google Play menerima AAB; iOS menuju App Store Connect/TestFlight dan tidak otomatis terbit. Lengkapi deskripsi, ikon, tangkapan layar, kebijakan privasi, pengungkapan data serta tes perangkat sebelum review. Kelola app ID dan kunci service account Google di akun distribusi sendiri.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. Verifikasi

Jalankan perintah berikut, lalu uji kedua perangkat nyata: 13 bahasa, label 日本語, waktu terbit/kejadian, tengah malam Jepang dari zona lain, terang/gelap/kontras tinggi, teks 200%, VoiceOver/TalkBack dan fokus modal, Reduce Motion, penolakan lokasi, jaringan putus, atribusi serta legenda. Ekspor JS bukan tes native atau persetujuan Apple. Lihat [audit UI](../UI_DESIGN.md).

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. Pembaruan dan pemulihan

Catat commit dan build yang diuji. Ubah version di `app.config.js`; nomor production bertambah otomatis melalui EAS. EAS Update belum diatur sehingga perlu build native baru. Pulihkan Worker dengan commit stabil atau rollback Cloudflare, dan mulai ulang versi lama Romaji. Toko tidak menurunkan versi secara diam-diam: build sumber stabil dengan nomor lebih tinggi. Pantau endpoint, kuota peta dan sumber.

## 10. Referensi

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
