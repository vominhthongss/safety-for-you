---
title: Safety For You — Chính sách quyền riêng tư
lang: vi
---

# Chính sách quyền riêng tư

**Ứng dụng:** Safety For You (iOS và Android)
**Ngày hiệu lực:** 24/11/2026
**Ngôn ngữ khác:** [English](index.md) · [日本語](ja.md)

Safety For You là ứng dụng miễn phí, phi lợi nhuận, mã nguồn mở (giấy phép MIT), hiển thị thông tin thiên tai tại Nhật Bản. Ứng dụng hoạt động độc lập và không liên kết với Cơ quan Khí tượng Nhật Bản (JMA), bất kỳ cơ quan nhà nước hay dịch vụ khẩn cấp nào.

## Tóm tắt

- Ứng dụng không có tài khoản, quảng cáo, công cụ phân tích hay theo dõi.
- Đơn vị phát hành không bán hoặc chia sẻ dữ liệu cá nhân và không lập hồ sơ người dùng.
- Vị trí chỉ được sử dụng khi ứng dụng đang mở và sau khi người dùng cho phép.
- Thông báo được tạo trên thiết bị. Ứng dụng không đăng ký push token.

## 1. Vị trí

Khi được cho phép, ứng dụng đọc vị trí thiết bị **chỉ khi đang mở** (tiền cảnh), nhằm:

1. hiển thị vị trí của người dùng trên bản đồ thiên tai và khoảng cách tới sự kiện được công bố;
2. tìm nơi sơ tán gần người dùng;
3. xác định bản tin gần đây có bao gồm vị trí của người dùng hay không để hiển thị cảnh báo.

Đơn vị phát hành không nhận và không lưu trữ vị trí của người dùng. Để hoạt động, ứng dụng gửi yêu cầu tới các dịch vụ sau, và các yêu cầu này có thể cho biết **khu vực gần đúng** của người dùng:

| Dịch vụ | Nội dung được gửi | Mục đích |
|---|---|---|
| Cơ quan Thông tin Không gian Địa lý Nhật Bản (GSI) | Số hiệu ô bản đồ quanh vị trí (phạm vi vài chục km) | Tải danh sách nơi sơ tán được chỉ định |
| Máy chủ ô bản đồ OpenStreetMap Japan (Android) | Số hiệu ô bản đồ của vùng đang hiển thị | Hiển thị bản đồ |
| Apple Maps (iOS) | Vùng bản đồ đang hiển thị, do Apple xử lý | Hiển thị bản đồ |
| Dịch vụ mã hóa địa lý của thiết bị (Apple trên iOS, Google trên Android) | Tọa độ của người dùng | Hiển thị tên thành phố hoặc khu vực |

Mỗi dịch vụ xử lý yêu cầu theo chính sách quyền riêng tư của mình. Người dùng có thể từ chối hoặc thu hồi quyền vị trí bất cứ lúc nào trong phần cài đặt của thiết bị; ứng dụng vẫn hoạt động nhưng không thể hiển thị vị trí, nơi sơ tán gần đó hoặc cảnh báo dựa trên vị trí.

## 2. Thông báo và báo động

Khi người dùng bật "Âm thanh báo động", ứng dụng xin quyền thông báo và hiển thị **thông báo cục bộ** được tạo trên thiết bị. Ứng dụng không tạo push token và không gửi dữ liệu thông báo tới máy chủ. Báo động chỉ hoạt động khi ứng dụng đang mở.

## 3. Dữ liệu lưu trên thiết bị

Ứng dụng lưu ngôn ngữ, lựa chọn giao diện sáng/tối, thiết lập âm thanh báo động và mã định danh của các bản tin đã kích hoạt báo động. Dữ liệu này chỉ nằm trên thiết bị, không được sao lưu lên đám mây và bị xóa khi gỡ ứng dụng.

## 4. Kết nối mạng

Ứng dụng tải thông tin thiên tai công khai từ P2PQuake (api.p2pquake.net), JMA (www.jma.go.jp) và GSI. Nếu đơn vị phát hành bật, ứng dụng còn sử dụng:

- dịch vụ chuyển tiếp tiêu đề bản tin JMA (Cloudflare Worker), không nhận dữ liệu cá nhân;
- dịch vụ chuyển chữ Nhật sang Romaji, nhận các chuỗi tiếng Nhật hiển thị trong ứng dụng như tiêu đề bản tin, tên nơi sơ tán và **tên thành phố hoặc khu vực của người dùng**.

Như mọi dịch vụ Internet, mỗi máy chủ có thể thấy địa chỉ IP và thông tin cơ bản của yêu cầu. Đơn vị phát hành không sử dụng thông tin này để nhận dạng người dùng.

## 5. Trẻ em

Đây là ứng dụng an toàn dành cho mọi đối tượng. Ứng dụng không cố ý thu thập thông tin cá nhân của trẻ em.

## 6. Lựa chọn của người dùng

- Cho phép hoặc từ chối quyền vị trí và thông báo trong phần cài đặt của thiết bị.
- Gỡ ứng dụng để xóa toàn bộ dữ liệu lưu trên thiết bị.

## 7. Thay đổi

Mọi thay đổi của chính sách này được công bố tại địa chỉ này kèm ngày hiệu lực mới.

## 8. Liên hệ

Câu hỏi hoặc yêu cầu: tạo issue tại <https://github.com/vominhthongss/safety-for-you/issues>.
