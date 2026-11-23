# Hướng dẫn phát hành lên Google Play và Apple App Store

Tài liệu áp dụng cho Safety For You (Expo SDK 58), ứng dụng thông tin thiên tai độc lập, miễn phí, phi lợi nhuận. Ứng dụng không thay thế JMA, J-Alert, chính quyền địa phương hoặc hệ thống cảnh báo khẩn cấp. Việc được cửa hàng phê duyệt không được bảo đảm.

## 1. Điều kiện và kiểm tra ban đầu

Chuẩn bị Node.js 22 trở lên, môi trường Expo phù hợp, tài khoản Expo và tài khoản nhà phát triển riêng cho Google Play và Apple. Kho mã nguồn hiện chưa có tệp khóa phụ thuộc npm hoặc `eas.json`. Các lệnh kiểm tra sau chỉ xác minh dự án JavaScript, không thay thế kiểm thử bản dựng gốc.

```bash
npm install
npm test
npx expo install --check
npx expo export --platform android --output-dir dist-android
npx expo export --platform ios --output-dir dist-ios
```

## 2. Cấu hình EAS, mã định danh và chữ ký

Đặt `ANDROID_PACKAGE` và `IOS_BUNDLE_ID` trong `.env` thành mã định danh do đơn vị phát hành sở hữu trước lần phát hành đầu tiên. Các giá trị được đọc bởi `app.config.js`, phải trùng với hồ sơ trên cửa hàng; thay đổi sau khi phát hành có thể tạo thành ứng dụng khác. Chạy `build:configure` một lần để tạo `eas.json` và liên kết dự án Expo, sau đó kiểm tra cấu hình.

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

Ví dụ sử dụng số bản dựng do EAS quản lý và tự động tăng. Cập nhật `expo.version` trong `app.config.js` theo phiên bản phát hành. Không tái sử dụng Android version code hoặc iOS build number. Xác minh quyền sở hữu thông tin ký; bảo mật khóa tải lên Android và thông tin ký của Apple.

Thiết lập biến môi trường cần thiết trong môi trường production của EAS. Mọi biến `EXPO_PUBLIC_*` đều có thể bị đọc từ ứng dụng đã phát hành, vì vậy không lưu bí mật tại đây. Worker JMA và dịch vụ Romaji là tùy chọn; khi chưa cấu hình phải giữ thông báo trạng thái thiếu dữ liệu rõ ràng.

## 3. Google Play: gói Android App Bundle (AAB)

Đăng ký Google Play Console, tạo ứng dụng, khai báo đúng Android package ID, hoàn thiện trang giới thiệu và bật Play App Signing. Khóa ký ứng dụng do Google quản lý khác với khóa tải lên do EAS quản lý. Bảo quản khóa tải lên an toàn và không đưa vào Git.

Tạo tệp AAB cho môi trường production. Có thể tải bản đầu tiên lên Play Console thủ công; các bản sau có thể sử dụng Expo Submit sau khi cấu hình an toàn tài khoản dịch vụ và quyền truy cập Google Play API. Tải tệp lên không có nghĩa là ứng dụng được phát hành công khai.

```bash
npx eas-cli build --platform android --profile production
# After configuring Google Play API access and service-account credentials:
npx eas-cli submit --platform android --latest
```

Trước tiên phát hành qua Internal testing hoặc Closed testing, mời người kiểm thử và đánh giá lỗi, quyền truy cập, bản đồ cùng tình huống mất kết nối. Tài khoản cá nhân tạo sau ngày 13/11/2023 có thể phải duy trì tối thiểu 12 người tham gia kiểm thử liên tục 14 ngày và được chấp thuận quyền phát hành production. Kiểm tra yêu cầu thực tế trong Play Console.

Hoàn thành biểu mẫu Data safety, URL chính sách quyền riêng tư (cũng phải truy cập được trong ứng dụng), phân loại nội dung, đối tượng người dùng, quyền truy cập ứng dụng, ảnh chụp màn hình và thông tin liên hệ. Kiểm tra AAB đáp ứng target API theo chính sách hiện hành (API 36 đối với ứng dụng điện thoại mới vào tháng 11/2026), không suy ra từ kết quả export JavaScript.

## 4. Apple App Store: tệp iOS đã ký (IPA)

Tham gia Apple Developer Program, tạo App ID và ứng dụng trên App Store Connect với iOS bundle identifier trùng khớp, sau đó cấu hình chứng chỉ phân phối và provisioning profile qua EAS. Xác minh đúng Apple Team sở hữu chứng chỉ.

Tạo bản IPA đã ký, tải lên App Store Connect (Expo Submit chỉ tải bản dựng lên, không tự phát hành) và kiểm thử bản đã xử lý qua TestFlight trước khi gửi xét duyệt.

```bash
npx eas-cli build --platform ios --profile production
# After configuring Apple credentials and App Store Connect:
npx eas-cli submit --platform ios --latest
```

Trong App Store Connect, cung cấp khai báo App Privacy, URL chính sách riêng tư hoạt động, thông tin hỗ trợ, mô tả chính xác, phân loại độ tuổi, ảnh chụp iPhone và iPad theo yêu cầu (`supportsTablet: true`), ghi chú xét duyệt và tài khoản thử nếu cần. Chọn bản dựng, gửi App Review và chỉ phát hành sau khi được chấp thuận.

## 5. Điều kiện an toàn trước khi phát hành

Kiểm thử Apple Maps trên iOS và Leaflet trên Android bằng thiết bị thực; rà soát đủ 13 ngôn ngữ, chữ lớn và trình đọc màn hình, cấp hoặc từ chối vị trí khi sử dụng ứng dụng, bản tin cũ/thiếu, chế độ mất mạng và ghi công nguồn bản đồ. Không quảng bá ứng dụng như hệ thống thông báo khẩn cấp thời gian thực, không suy diễn cảnh báo đang có hiệu lực từ tiêu đề JMA, không mô phỏng phạm vi lan truyền sóng thần và không xác nhận nơi sơ tán đang mở nếu thiếu nguồn đáng tin cậy.

**Các hạng mục hiện còn thiếu trong kho mã nguồn: chưa có `eas.json`, chưa có bộ tài nguyên và ảnh chụp cho cửa hàng hoặc URL chính sách riêng tư đã thiết lập, chưa có bằng chứng kiểm thử bản dựng đã ký trên thiết bị thật và chưa có kết quả xét duyệt của cửa hàng. Phải hoàn tất các hạng mục này trước khi phát hành.**

## 6. Cập nhật và bảo trì

Tăng phiên bản công khai và mã bản dựng trước mỗi lần cập nhật, kiểm thử lại thiết bị, phát hành từng giai đoạn nếu nền tảng hỗ trợ, theo dõi lỗi và điều khoản của nhà cung cấp dữ liệu, cập nhật khai báo quyền riêng tư khi cách xử lý dữ liệu thay đổi. Nếu nguồn dữ liệu gián đoạn, hiển thị trạng thái suy giảm rõ ràng và hướng người dùng đến kênh cảnh báo chính thức.

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

[Deployment overview](../deploy/DEPLOY.vi.md) · [Documentation index](../README.md)
