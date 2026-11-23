# Hướng dẫn triển khai — Safety For You (Tiếng Việt)

Safety For You là ứng dụng mã nguồn mở, miễn phí, phi lợi nhuận, hỗ trợ thông tin thiên tai ở Nhật; phát hành mã nguồn theo MIT. App chỉ bổ trợ, hông thay thế JMA, J-Alert hay chỉ dẫn chính quyền.

## Yêu cầu

Cần Node.js 22 trở lên và Expo Go tương thích SDK 58. Repo chưa có lockfile, nên cài thư viện bằng npm install.

## Chạy local

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

## Dịch vụ tùy chọn

Worker Cloudflare tùy chọn cung cấp tiêu đề bản tin JMA tại /hazards; đây hông phải cảnh báo còn hiệu lực. Dịch vụ Romaji cũng tùy chọn; khi triển khai công khai cần HTTPS và giới hạn truy cập.

```bash
npx wrangler login
npx wrangler deploy
# configure EXPO_PUBLIC_JMA_PROXY_URL=https://YOUR-WORKER.workers.dev
# restart Expo after changing environment variables
```

For Kanji readings, follow `romaji-service/README.md`; the service requires Node.js 22+, HTTPS proxy and request limits. If not configured, leave the URL empty. Weather headline pages may be unavailable without the Worker.

## Build cho store

Muốn phát hành lên store, đăng nhập Expo/EAS, thiết lập dự án build rồi tạo bản production cho Android và iOS. Package và Bundle ID phải do người phát hành kiểm soát.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

This repo does **not** currently include `eas.json`; `build:configure` is a one-time project setup. Ensure build profiles, native credentials, store accounts, and build-time public environment variables are correctly configured before invoking production builds. EAS service availability, pricing and signing requirements depend on the publisher's account.

## Kiểm tra trước phát hành

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Trước lúc đăng store, chuẩn bị chính sách riêng tư, biểu tượng, ảnh chụp, liên hệ pháp lý, kiểm thử máy thật/trợ năng và ghi rõ app hông phải nguồn cảnh báo chính thức. Export JS thành công hông đồng nghĩa đã đạt chuẩn an toàn hay được Apple duyệt.

## Điều khoản mã nguồn mở

MIT: https://github.com/vominhthongss/safety-for-you/blob/main/LICENSE (on the proposed branch until merged). You may use, modify and distribute this code, including commercially, provided that the copyright and MIT license notice remain with substantial copies. Third-party assets, data feeds, fonts and map tiles retain their own licenses and provider terms. Contributions should preserve safety disclaimers, attribution and source verification.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.vi.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.
