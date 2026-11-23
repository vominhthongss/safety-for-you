# Panduan publikasi ke Google Play dan Apple App Store

Panduan ini berlaku untuk Safety For You (Expo SDK 58), aplikasi informasi bencana yang gratis, nirlaba, dan independen. Aplikasi ini tidak menggantikan JMA, J-Alert, pemerintah setempat, atau siaran darurat. Persetujuan toko aplikasi tidak dijamin.

## 1. Prasyarat dan pemeriksaan

Siapkan Node.js 22+, lingkungan Expo yang sesuai, akun Expo, serta akun pengembang Google Play dan Apple. Repositori ini belum mempunyai npm lockfile maupun `eas.json`. Perintah berikut hanya memeriksa JavaScript, bukan membuktikan kesiapan build native.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. Konfigurasi EAS, identitas, dan penandatanganan

Sebelum rilis pertama, tentukan `ANDROID_PACKAGE` dan `IOS_BUNDLE_ID` unik yang Anda kendalikan di `.env`. Nilainya dibaca oleh `app.config.js` dan harus sama dengan pendaftaran toko; perubahan sesudah publikasi dapat dianggap aplikasi berbeda. Jalankan `build:configure` untuk membuat `eas.json` dan memeriksa tautan proyek Expo.

```bash
cp .env.example .env
# Set ANDROID_PACKAGE and IOS_BUNDLE_ID in .env before the first release.
npx eas-cli login
npx eas-cli build:configure
```

`eas.json` (example; review after generation):

```json
{
  "cli": { "appVersionSource": "remote" },
  "build": {
    "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
    "production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
  }
}
```

Contoh menggunakan nomor build yang dikelola dan dinaikkan otomatis oleh EAS. Sesuaikan `expo.version` dalam `app.config.js` dengan versi rilis. Jangan menggunakan ulang Android versionCode atau iOS buildNumber. Simpan kredensial penandatanganan dan kunci unggah secara aman, bukan di Git.

Atur variabel yang diperlukan di lingkungan production EAS. Variabel `EXPO_PUBLIC_*` terlihat di aplikasi yang dipublikasikan, sehingga tidak boleh berisi rahasia. Worker JMA dan layanan Romaji bersifat opsional; tampilkan status tidak tersedia jika belum dipasang.

## 3. Google Play: Android App Bundle (AAB)

Daftar ke Play Console, buat aplikasi, masukkan ID paket Android yang tepat, lengkapi informasi toko, lalu aktifkan Play App Signing. Kunci penandatanganan aplikasi oleh Google berbeda dengan kunci unggah EAS. Jangan simpan kunci di Git.

Bangun AAB production. Unggahan pertama dapat dilakukan secara manual di Play Console; Expo Submit dapat digunakan setelah Google Play API dan akun layanan disetel dengan aman. Mengunggah build tidak otomatis menerbitkannya.

```bash
npx eas-cli build --platform android --profile production
# After configuring Google Play API access and service-account credentials:
npx eas-cli submit --platform android --latest
```

Gunakan Internal testing atau Closed testing terlebih dahulu untuk menguji crash, izin lokasi, peta, dan gangguan jaringan. Akun pengembang pribadi yang dibuat setelah 13 November 2023 mungkin diwajibkan memiliki sedikitnya 12 penguji selama 14 hari berturut-turut serta persetujuan akses production. Periksa ketentuan akun di Play Console.

Lengkapi Data safety, URL kebijakan privasi di toko dan aplikasi, klasifikasi konten, target pengguna, akses aplikasi, tangkapan layar, kontak, dan deklarasi izin. Pastikan AAB memenuhi target API yang berlaku (API 36 untuk aplikasi ponsel baru per November 2026), bukan hanya lolos ekspor JavaScript.

## 4. Apple App Store: arsip iOS bertanda tangan (IPA)

Ikuti Apple Developer Program, buat App ID dan aplikasi App Store Connect dengan Bundle ID yang sama. Konfigurasikan sertifikat distribusi dan provisioning profile melalui EAS, lalu periksa Apple team yang benar.

Bangun IPA bertanda tangan, unggah ke App Store Connect, dan uji build melalui TestFlight di perangkat nyata. Expo Submit hanya mengunggah dan tidak menerbitkan secara otomatis.

```bash
npx eas-cli build --platform ios --profile production
# After configuring Apple credentials and App Store Connect:
npx eas-cli submit --platform ios --latest
```

Di App Store Connect, isi App Privacy, tautan kebijakan privasi dan dukungan yang dapat diakses, deskripsi yang akurat, rating umur, tangkapan layar iPhone serta iPad yang diwajibkan (`supportsTablet: true`), catatan peninjau, dan akun uji bila diperlukan. Pilih build untuk App Review, lalu publikasikan setelah disetujui.

## 5. Keamanan dan pemeriksaan rilis

Uji Apple Maps pada iOS dan Leaflet pada Android di perangkat nyata, 13 bahasa, aksesibilitas, izin lokasi diterima atau ditolak, berita lama atau hilang, keadaan offline, dan atribusi peta. Jangan menjanjikan peringatan resmi waktu nyata, status peringatan dari judul JMA saja, simulasi rambatan tsunami, atau jaminan lokasi evakuasi sedang dibuka.

**Hal yang masih kurang: `eas.json`, aset toko dan tangkapan layar, URL kebijakan privasi, validasi build native bertanda tangan, dan hasil peninjauan toko. Dokumen ini tidak menggantikan langkah tersebut.**

## 6. Pembaruan dan pemeliharaan

Naikkan versi dan nomor build setiap pembaruan, uji ulang perangkat, gunakan peluncuran bertahap bila tersedia, pantau crash dan aturan penyedia data, serta perbarui pengungkapan privasi saat pengolahan data berubah. Jika sumber gagal, tampilkan status kegagalan dan arahkan pengguna ke saluran peringatan resmi.

## Official references

- [Expo: build setup](https://docs.expo.dev/build/setup/)
- [Expo: version management](https://docs.expo.dev/build-reference/app-versions/)
- [Expo: submit Android](https://docs.expo.dev/submit/android/)
- [Expo: submit iOS](https://docs.expo.dev/submit/ios/)
- [Google Play: testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Google Play: Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Apple: submit for review](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-app)
- [Apple: privacy details](https://developer.apple.com/app-store/app-privacy-details/)

[Deployment overview](../deploy/DEPLOY.id.md) · [Documentation index](../README.md)
