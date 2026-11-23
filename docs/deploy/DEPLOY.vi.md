# Hướng dẫn triển khai — Safety For You (Tiếng Việt)

Safety For You là ứng dụng mã nguồn mở, miễn phí, phi lợi nhuận, hỗ trợ thông tin thiên tai ở Nhật; phát hành mã nguồn theo MIT. Ứng dụng chỉ bổ trợ, không thay thế JMA, J-Alert hay chỉ dẫn chính quyền.

## Yêu cầu

Cần Node.js 22 trở lên và Expo Go tương thích SDK 58. Kho mã nguồn chưa có lockfile, nên cài thư viện bằng npm install.

## Chạy máy cục bộ

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

- `EXPO_PUBLIC_REFRESH_SECONDS`: Chu kỳ làm mới tính bằng giây (tối thiểu 60).
- `EXPO_PUBLIC_JMA_PROXY_URL`: Địa chỉ Worker Cloudflare tùy chọn cung cấp tiêu đề bản tin JMA.
- `EXPO_PUBLIC_ROMAJI_API_URL`: Địa chỉ dịch vụ tự quản để chuyển chữ Kanji sang Romaji (tùy chọn).
- `ANDROID_PACKAGE` / `IOS_BUNDLE_ID`: Mã định danh ổn định cho bản dựng Android và iOS đã ký.
- `EXPO_PUBLIC_*`: Biến công khai được đóng gói trong ứng dụng; không lưu thông tin bí mật.
- `Leaflet 1.9.4`: Bước `postinstall` tạo `src/generated/leafletAssets.js`; ảnh bản đồ vẫn cần Internet.

## Dịch vụ tùy chọn

Worker Cloudflare tùy chọn cung cấp tiêu đề bản tin JMA tại /hazards; đây không phải cảnh báo còn hiệu lực. Dịch vụ Romaji cũng tùy chọn; khi triển khai công khai cần HTTPS và giới hạn truy cập.

```bash
npx wrangler login
npx wrangler deploy
# Set EXPO_PUBLIC_JMA_PROXY_URL in .env and restart Expo.
```

Để chuyển Kanji sang Romaji, xem `romaji-service/README.md` (Node.js 22 trở lên, HTTPS và giới hạn yêu cầu). Để trống URL nếu chưa triển khai; khi không có Worker, trang tiêu đề bản tin thời tiết có thể không hoạt động. Khai báo URL Worker trong `.env` rồi khởi động lại Expo.

## Build cho cửa hàng ứng dụng

Muốn phát hành lên cửa hàng ứng dụng, đăng nhập Expo/EAS, thiết lập dự án build rồi tạo bản production cho Android và iOS. Package và Bundle ID phải do người phát hành kiểm soát.

```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

Kho mã nguồn hiện chưa có `eas.json`. Chạy `build:configure` một lần và kiểm tra cấu hình production được tạo. Cần thiết lập thông tin ký, tài khoản cửa hàng, mã định danh và biến môi trường production trước khi tạo bản dựng. Xem hướng dẫn phát hành chi tiết bên dưới.

## Kiểm tra trước phát hành

```bash
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

Trước lúc đăng cửa hàng ứng dụng, chuẩn bị chính sách riêng tư, biểu tượng, ảnh chụp, liên hệ pháp lý, kiểm thử máy thật/trợ năng và ghi rõ app không phải nguồn cảnh báo chính thức. Export JS thành công không đồng nghĩa đã đạt chuẩn an toàn hay được Apple duyệt.

## Điều khoản mã nguồn mở

Theo [Giấy phép MIT](../../LICENSE), mã nguồn được phép sử dụng, sửa đổi và phân phối lại, kể cả mục đích thương mại, với điều kiện giữ nguyên thông báo bản quyền và giấy phép trong các bản sao đáng kể. Thư viện, bản đồ, dữ liệu và dịch vụ bên thứ ba có điều khoản riêng. Mọi đóng góp phải bảo đảm ghi công nguồn, kiểm chứng dữ liệu và cảnh báo an toàn.

**Project:** https://github.com/vominhthongss/safety-for-you  
**Related:** `docs/adr/ADR-0001.vi.md`, `docs/UI_DESIGN.md`, `romaji-service/README.md`.

## Phát hành lên cửa hàng ứng dụng

Xem [hướng dẫn chi tiết phát hành Google Play và Apple App Store](../stores/STORE_RELEASE.vi.md), bao gồm ký ứng dụng, kiểm thử, quyền riêng tư, xét duyệt và các hạng mục cần hoàn thiện trước khi phát hành.
