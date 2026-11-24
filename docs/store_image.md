# Checklist tài nguyên hình ảnh lên store — Safety For You

Quy định kiểm tra ngày 2026-11-24 — store hay đổi, nên xem lại link nguồn trước mỗi lần submit.

Ký hiệu: ✅ Đạt · ❌ Thiếu · ➖ Tùy chọn / không áp dụng

## Google Play

| Tài nguyên | Quy định chính thức | Safety For You |
|---|---|---|
| App Icon | Bắt buộc. PNG 32-bit (có alpha), 512 × 512, tối đa 1024 KB | ✅ |
| Feature Graphic | Bắt buộc. JPEG hoặc PNG 24-bit (**hông alpha**), 1024 × 500 | ✅ |
| Phone Screenshot | Tối thiểu 2, tối đa 8 | ❌ |
| Tablet Screenshot | Không bắt buộc, nên có nếu app hỗ trợ tablet | ➖ |
| Preview Video | Không bắt buộc | ➖ |

## App Store

| Tài nguyên | Quy định chính thức | Safety For You |
|---|---|---|
| App Icon | 1024 × 1024, PNG, hông alpha/trong suốt, hông bo góc | ✅ |
| iPhone Screenshot — Dynamic Island cỡ trung (**bắt buộc**) | 1206 × 2622 hoặc 1179 × 2556 | ❌ |
| iPhone Screenshot — Dynamic Island cỡ lớn | 1320 × 2868, 1290 × 2796 hoặc 1260 × 2736 (không bắt buộc) | ➖ |
| iPad Screenshot 13" | 2064 × 2752 hoặc 2048 × 2732. Bắt buộc nếu app chạy trên iPad | ❌ |
| Số lượng screenshot | 1–10 ảnh mỗi kích thước, JPEG/PNG, hông alpha | ❌ |
| Launch Screen | Bắt buộc launch storyboard (Expo tạo từ expo-splash-screen) | ✅ |
| Preview Video | Không bắt buộc | ➖ |

## Lỗi hay gặp

- Icon iOS hoặc Feature Graphic còn kênh alpha → bị từ chối khi upload.
- Thiếu bộ iPhone cỡ trung (1206 × 2622) → hông submit được.
- Bật hỗ trợ iPad mà hông có ảnh iPad 13".

## Nguồn

- [Google Play — Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)
- [App Store Connect — Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications)
