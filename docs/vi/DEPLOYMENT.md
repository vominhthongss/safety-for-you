# Safety For You — Giới thiệu và hướng dẫn triển khai

[Hồ sơ quyết định kiến trúc](ADR.md) · [🌐](../README.md)

## 1. Dự án và mã nguồn mở

Safety For You là ứng dụng di động miễn phí, phi lợi nhuận dành cho người sống hoặc du lịch tại Nhật. Ứng dụng tổng hợp tin động đất, sóng thần, bản tin thời tiết gần đây, bản đồ và địa điểm sơ tán khẩn cấp được chỉ định. Đây là dự án độc lập, không phải ứng dụng của chính phủ. Dữ liệu được cập nhật khi ứng dụng đang mở; chưa có thông báo đẩy nền hoặc cam kết hoạt động ngoại tuyến.

Mã nguồn và tài liệu gốc được phát hành theo [MIT](../../LICENSE): được sử dụng, sửa đổi, phân phối và bán lại, với điều kiện giữ thông báo bản quyền và giấy phép. Mục tiêu phi lợi nhuận của dự án không cấm các bản fork thương mại. Phần mềm không có bảo hành. Dữ liệu, bản đồ và thư viện bên ngoài vẫn theo điều khoản riêng: [thông báo bên thứ ba](../../THIRD_PARTY_NOTICES.md). Đóng góp bằng cách fork, tạo nhánh, chạy kiểm tra và gửi PR; không đưa thông tin đăng nhập hoặc khóa ký vào Git.

## 2. Chuẩn bị

Cần Node.js 22+, npm, Git và Expo Go tương thích SDK 58. Build iOS tại máy cá nhân cần macOS/Xcode; Android cần Android SDK/JDK phù hợp phiên bản Expo. Build trên EAS cần tài khoản Expo; phát hành cần tài khoản Apple Developer hoặc Google Play Console của bạn. Không cần cơ sở dữ liệu hoặc khóa Google Maps.

## 3. Chạy tại máy cá nhân

Chạy lệnh tại thư mục gốc repo. Nếu đã có `.env`, giữ cấu hình hiện tại thay vì chép đè. Điền biến trong bảng dưới rồi quét QR bằng Expo Go. `npm install` tự đóng gói Leaflet; nếu thiếu `src/generated/leafletAssets.js`, chạy `npm run bundle:maps`. App có 13 ngôn ngữ lựa chọn; các chuỗi cũ ngoài Nhật/Anh/Việt vẫn có thể hiển thị tiếng Anh khi chưa có bản dịch.

```bash
git clone https://github.com/vominhthongss/safety-for-you.git
cd safety-for-you
npm install
cp .env.example .env
npx expo start --go -c
```

| Biến | Ý nghĩa |
| --- | --- |
| `EXPO_PUBLIC_SPLASH_MIN_MS` | Độ trễ mở app tùy chọn, 0–600 ms. |
| `EXPO_PUBLIC_REFRESH_SECONDS` | Chu kỳ lấy tin khi mở app, tối thiểu 60 giây, mặc định 120. |
| `EXPO_PUBLIC_JMA_PROXY_URL` | URL HTTPS gốc của Worker, không thêm /hazards; để trống thì tắt nguồn thời tiết. |
| `EXPO_PUBLIC_ROMAJI_API_URL` | URL HTTPS gốc của Romaji, không thêm /romaji; để trống thì chỉ đọc bằng dữ liệu cục bộ. |
| `ANDROID_PACKAGE` | Application ID Android riêng của bạn. |
| `IOS_BUNDLE_ID` | Bundle ID iOS riêng của bạn. |
| `EAS_PROJECT_ID` | UUID dự án Expo; Expo Go có thể để trống, EAS cần liên kết đúng dự án. |

## 4. Worker JMA tùy chọn

Đặt tên Worker riêng trong `wrangler.toml`, đăng nhập Cloudflare và deploy từ thư mục gốc. Thay tên miền ví dụ bằng URL Wrangler trả về. `/hazards` phải trả JSON có `items` và `kind`; `degraded: true` nghĩa là một số nguồn gặp lỗi. Điền URL gốc vào `.env`. Worker chỉ phân loại tiêu đề Atom JMA, chưa xác nhận cảnh báo đang hiệu lực hay số đo thời tiết. App không cần chứa khóa bí mật của Cloudflare.

```bash
npx wrangler login
npx wrangler deploy
curl -f https://your-worker.workers.dev/hazards
```

## 5. Dịch vụ Romaji tùy chọn

Chạy các lệnh dưới trên VPS trong terminal thứ hai. Khi vận hành thực tế, quản lý tiến trình bằng systemd, container hoặc công cụ của nhà cung cấp. Đặt HTTPS reverse proxy trước cổng 3088, hạn chế truy cập trực tiếp và giới hạn tốc độ/kích thước request. `/health` cần trả `{"ok":true}`; POST `/romaji` trả mảng phiên âm. Điền URL HTTPS gốc vào `.env`. Nội dung gửi đi có thể gồm địa danh, bản tin và địa chỉ nơi sơ tán; tránh ghi toàn bộ request vào log. Dịch vụ lỗi thì từ điển và Kana cục bộ vẫn hoạt động.

```bash
cd romaji-service
npm install
PORT=3088 npm start
```

```bash
curl -f https://romaji.example.com/health
curl -f https://romaji.example.com/romaji -H 'Content-Type: application/json' --data '{"texts":["名古屋市"]}'
```

## 6. Build Android và iOS

Tạo dự án riêng trên Expo dashboard, lấy UUID điền vào `EAS_PROJECT_ID`. Chọn hai mã định danh trước lần build đầu; nếu fork, sửa tên, slug và scheme trong `app.config.js`. `eas.json` đã có `preview` (APK Android / ad hoc iOS), `simulator` (iOS Simulator), `production` (AAB Android / iOS cửa hàng). Trong phần cấu hình Expo, tạo các biến đã điền ở bảng cho cả môi trường `preview` và `production`: `.env` bị Git bỏ qua nên không tự có trên máy build cloud. Đây là cấu hình công khai, không phải bí mật. Đổi biến thì khởi động lại Metro hoặc build lại.

Đăng nhập bằng lệnh đầu, sau đó chọn lệnh build phù hợp. EAS trả đường dẫn tải file. APK preview cài trực tiếp lên Android; ad hoc iOS cần đăng ký máy bằng `npx eas-cli device:create` và chứng chỉ Apple. Bản Simulator không cài lên iPhone. Muốn build tại máy cá nhân, thêm `--local` trên máy đã có bộ công cụ tương ứng.

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform ios --profile simulator
```

## 7. Phát hành lên cửa hàng

Build production rồi submit nền tảng cần phát hành. Quản lý khóa ký qua EAS, không commit vào Git. Google Play nhận AAB production; APK preview chỉ để thử. Bản iOS gửi lên App Store Connect/TestFlight, chưa tự công khai trên cửa hàng. Hoàn thiện tên/mô tả, icon, ảnh chụp, chính sách riêng tư, khai báo dữ liệu và kiểm tra máy thật trước khi gửi duyệt. EAS có thể yêu cầu App Store Connect app ID hoặc khóa service account Google; thiết lập trong tài khoản phát hành, không để trong source.

```bash
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
npx eas-cli submit --platform android --profile production
npx eas-cli submit --platform ios --profile production
```

## 8. Kiểm tra

Chạy các lệnh dưới và thử trên iPhone/Android thật: 13 ngôn ngữ; nhãn 日本語 không Romaji; giờ phát tin khác giờ xảy ra; qua nửa đêm Nhật khi máy đặt múi giờ khác; sáng/tối, tăng tương phản; chữ 200%; VoiceOver/TalkBack đọc sheet và các nút bản tin; giảm chuyển động; từ chối vị trí; mất mạng; ghi nguồn và chú giải màu. Export JavaScript thành công không thay thế kiểm tra native hoặc xác nhận duyệt Apple. Xem [rà soát UI](../UI_DESIGN.md).

```bash
npm test
npx expo install --check
npx expo export --platform ios --output-dir dist-ios
npx expo export --platform android --output-dir dist-android
```

## 9. Cập nhật và khôi phục

Ghi lại commit và mã build đã kiểm tra. Đổi version trong `app.config.js`; số build production được EAS tăng tự động. Repo chưa cấu hình EAS Update nên thay đổi cần phát hành bản native mới. Worker có thể deploy lại commit ổn định hoặc rollback trên Cloudflare; Romaji cần khởi động lại phiên bản trước. App trên cửa hàng không âm thầm hạ phiên bản: build lại source ổn định với số build lớn hơn. Theo dõi `/hazards`, `/health`, hạn mức bản đồ và nguồn dữ liệu.

## 10. Tài liệu tham khảo

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
