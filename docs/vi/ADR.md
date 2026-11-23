# Safety For You — Hồ sơ quyết định kiến trúc

Đã chấp nhận · 2026-11-23 · phản ánh mã nguồn trong nhánh này

[Giới thiệu và hướng dẫn triển khai](DEPLOYMENT.md) · [🌐](../README.md)

## ADR-001 — Expo và bản đồ WebView

**Bối cảnh:** Bản đồ cần chạy bằng Expo Go SDK 58 trên cả hai nền tảng.

**Quyết định:** Chọn JavaScript, Expo 58/RN 0.88, Leaflet 1.9.4 đóng gói khi cài npm và react-native-webview; tải bản đồ nền OSM Japan nhãn tiếng Anh.

**Hệ quả:** Không cần native MapLibre; ảnh bản đồ vẫn cần mạng, ghi nguồn và tuân thủ giới hạn nhà cung cấp.


## ADR-002 — Dữ liệu và mức thiên tai có nguồn

**Bối cảnh:** Độ lớn M, Shindo và cấp sóng thần không đồng nghĩa; tin cũ dễ bị hiểu là cảnh báo đang hiệu lực.

**Quyết định:** Chuẩn hóa P2PQuake 551/552/556, giữ giờ phát/sự kiện, lấy màu theo Shindo hoặc cấp được công bố; chỉ ghép vùng JMA đã xác thực. Worker chỉ cung cấp tiêu đề JMA gần đây.

**Hệ quả:** Không đoán số liệu, tọa độ hay hiệu lực cảnh báo. Vùng màu không mô phỏng sóng lan/ngập. Giữ nhãn chữ, nguồn chính thức và màu trung tính cho dữ liệu thiếu/hủy.


## ADR-003 — Cập nhật tiền cảnh và tùy chọn cục bộ

**Bối cảnh:** Ứng dụng thông tin chưa có hạ tầng thông báo đẩy được giám sát.

**Quyết định:** REST tối thiểu 60 giây và WebSocket có kết nối lại; ngừng kết nối nền. Lưu ngôn ngữ/giao diện bằng AsyncStorage; xin vị trí sau thao tác của người sử dụng.

**Hệ quả:** Không cam kết thời gian gửi hoặc thông báo khẩn cấp nền. Có thể tận dụng quyền vị trí đã cấp; từ chối vị trí vẫn đọc được tin.


## ADR-004 — Đa ngôn ngữ và phiên âm

**Bối cảnh:** Có 13 lựa chọn ngôn ngữ; phải giữ địa danh gốc để nhận diện.

**Quyết định:** Dùng src/i18n.js với tiếng Anh dự phòng. Tên ngôn ngữ là 日本語; các nhãn Nhật khác giữ Romaji. Giữ bản tin Nhật, thêm từ điển/Kana hoặc Kuroshiro tùy chọn.

**Hệ quả:** Tài liệu đủ 13 bản; UI cũ ngoài ja/en/vi chưa dịch hết. Không tự đoán tên chưa biết; phiên âm không phải bản dịch hướng dẫn an toàn.


## ADR-005 — Giờ Nhật và khả năng tiếp cận

**Bối cảnh:** Múi giờ máy có thể khác Nhật; chữ lớn có thể đè lên nút và chú giải.

**Quyết định:** Thời gian P2PQuake thiếu offset được hiểu là JST; giữ offset ISO và so ngày theo Asia/Tokyo. Thêm Hôm nay, ngày đầy đủ và JST; cập nhật theo phút/khi trở lại app. Màu giờ riêng, vùng bấm 44pt, chữ co giãn, focus sheet và giảm chuyển động.

**Hệ quả:** Giữ riêng giờ phát và giờ động đất. Chú giải nằm dưới bản đồ. Áp dụng Apple HIG không đồng nghĩa đã được Apple duyệt hoặc chứng nhận accessibility.


## ADR-006 — Tách dịch vụ tùy chọn

**Bối cảnh:** Tiêu đề JMA và Kanji hiếm cần xử lý phía máy chủ.

**Quyết định:** Worker chạy Cloudflare, Romaji chạy Node riêng; cấu hình URL HTTPS bằng EXPO_PUBLIC. Nhãn từ mạng được chèn như văn bản.

**Hệ quả:** Worker có cache công khai; Romaji cần giới hạn và giám sát. Biến EXPO_PUBLIC nằm trong app; nhà cung cấp nhận metadata, yêu cầu bản đồ và nội dung phiên âm nếu bật.


## ADR-007 — MIT và phát hành độc lập

**Bối cảnh:** Người đóng góp cần quyền tái sử dụng rõ ràng và quy trình build.

**Quyết định:** MIT cho mã/tài liệu gốc, giữ điều khoản bên thứ ba; tách EAS preview/simulator/production và cất khóa ký ngoài Git.

**Hệ quả:** Cho phép fork thương mại nhưng giữ giấy phép. Mỗi bên tự chịu hosting/tài khoản; chưa có OTA và không đại diện cơ quan nhà nước.

## Tài liệu tham khảo

[Architecture](../ARCHITECTURE.md) · [UI](../UI_DESIGN.md) · [MIT](../../LICENSE)

`App.js` · `src/data.js` · `src/dateTime.cjs` · `src/i18n.js` · `src/theme.js` · `src/SafetyMap.js` · `src/hazardSeverity.cjs` · `src/hazardZones.cjs` · `src/romanization.js` · `server/worker.js` · `romaji-service/server.cjs` · `eas.json`

- [Expo: EAS build](https://docs.expo.dev/build/eas-json/)
- [Expo: environment variables](https://docs.expo.dev/eas/environment-variables/)
- [Expo: submission](https://docs.expo.dev/submit/introduction/)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/commands/)
- [Apple: accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple: layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)
