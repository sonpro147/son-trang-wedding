# Khắc Sơn & Huyền Trang — thiệp cưới online

Thiệp cưới tĩnh, responsive, chạy trực tiếp trên GitHub Pages. Phong cách botanical editorial, lấy ý tưởng từ lời mời mở đầu, thông tin nghi lễ, album, đếm ngược, lịch, địa điểm và lời chúc trên trang tham khảo; thiết kế và nội dung được dựng riêng cho Sơn & Trang.

## Xem demo

Sau khi bật GitHub Pages, trang sẽ ở `https://sonpro147.github.io/son-trang-wedding/`.

## Sửa thông tin

- Tìm các ô nền vàng nhạt trên thiệp: đây là thông tin còn thiếu và cần thay bằng dữ liệu thật.
- Ảnh đang là khung trắng. Trong `index.html`, thay các khối `photo-placeholder` / `gallery-frame` bằng `<img src="images/ten-anh.jpg" alt="...">` và thêm ảnh vào thư mục `images/`.
- Khi có ngày cưới, sửa `weddingDate` trong `script.js` theo định dạng `YYYY-MM-DD`; sau đó cập nhật các ô ngày, giờ, tháng và năm trong `index.html`.
- Thay địa điểm và liên kết Google Maps, thông tin liên hệ; kết nối RSVP nếu muốn khách xác nhận tham dự trực tuyến.
- Phần nhạc hiện tạo giai điệu demo bằng Web Audio, không dùng tệp nhạc có bản quyền.

## Chạy tại máy

Mở `index.html` trong trình duyệt hoặc chạy một máy chủ static đơn giản từ thư mục này.

