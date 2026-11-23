# Safety For You — Catatan keputusan arsitektur

Diterima · 2026-11-23 · sesuai kode pada cabang ini

[Pengenalan dan panduan penerapan](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo dan peta

**Konteks:** Kedua platform harus mendukung Expo Go SDK 58.

**Keputusan:** JavaScript, Expo 58/RN 0.88, Leaflet 1.9.4 dalam WebView dibundel lewat npm; peta dasar OSM Japan berlabel Inggris.

**Konsekuensi:** Tidak perlu ekstensi native MapLibre; ubin tetap memerlukan jaringan, atribusi, kapasitas dan pengujian perangkat.


## ADR-002 — Data sesuai sumber

**Konteks:** Magnitudo, Shindo dan tingkat tsunami berbeda; laporan lama bukan status aktif.

**Keputusan:** Normalisasi P2PQuake 551/552/556, simpan waktu terbit/kejadian dan warna sesuai tingkat resmi; cocokkan hanya wilayah JMA terverifikasi.

**Konsekuensi:** Worker hanya judul terbaru; jangan menebak angka, koordinat atau status. Wilayah bukan simulasi gelombang/genangan. Pertahankan label dan tautan resmi.


## ADR-003 — Pembaruan aktif

**Konteks:** Tidak ada infrastruktur push yang dipantau.

**Keputusan:** REST minimal 60 detik, WebSocket dengan reconnect, berhenti di latar; preferensi AsyncStorage; lokasi diminta sesudah tindakan pengguna.

**Konsekuensi:** Tidak menjamin notifikasi latar atau waktu tiba. Izin lama dapat dipakai kembali; penolakan tidak menghalangi laporan.


## ADR-004 — Bahasa dan pembacaan

**Konteks:** Nama asli harus dikenali.

**Keputusan:** i18n 13 bahasa dengan fallback Inggris; nama bahasa 日本語 tanpa Romaji, label Jepang lain tetap disertai Romaji. Kamus/Kana lokal dan Kuroshiro opsional.

**Konsekuensi:** Dokumen tersedia 13 bahasa; UI lama di luar ja/en/vi sebagian saja. Tidak menebak nama dan Romaji bukan terjemahan keselamatan.


## ADR-005 — Waktu Jepang dan aksesibilitas

**Konteks:** Zona waktu dan teks besar dapat menimbulkan salah baca/tumpang tindih.

**Keputusan:** Waktu tanpa offset dianggap JST, offset ISO dipertahankan; Hari ini menurut Asia/Tokyo, tanggal penuh/JST dan pembaruan tiap menit/saat kembali. Warna waktu, 44pt, teks adaptif, fokus modal dan pengurangan gerak.

**Konsekuensi:** Waktu terbit/kejadian terpisah, legenda di bawah peta. Mengikuti Apple HIG bukan sertifikasi atau persetujuan toko.


## ADR-006 — Layanan terpisah

**Konteks:** Judul JMA dan Kanji langka perlu server.

**Keputusan:** Worker Cloudflare dan Node Romaji terpisah, URL HTTPS EXPO_PUBLIC, teks eksternal tidak dijadikan HTML yang berjalan.

**Konsekuensi:** Cache publik, rate limit dan pemantauan diperlukan. Konfigurasi tertanam di aplikasi; penyedia menerima metadata, permintaan peta dan teks konversi opsional.


## ADR-007 — MIT dan rilis

**Konteks:** Hak penggunaan ulang serta jalur rilis harus jelas.

**Keputusan:** MIT untuk karya asli, ketentuan pihak ketiga tetap; pisahkan EAS preview/simulator/production dan simpan kunci di luar Git.

**Konsekuensi:** Fork komersial boleh dengan pemberitahuan. Operator menyiapkan hosting/akun sendiri; tidak ada OTA atau dukungan resmi pemerintah.

## Referensi

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
