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
- Hai khung bản đồ nhà trai/nhà gái lấy địa chỉ từ `venueLocations` trong `script.js`; điền địa chỉ và từ khoá bản đồ để hiện Google Maps.
- Nút **Mở hộp quà** mở hộp thoại QR. Khi có ảnh QR và hai bạn đồng ý công khai, thêm ảnh vào `assets/qr-chuyen-khoan.png` rồi đặt `giftQrImage` trong `script.js`.
- Hiệu ứng tim được phủ nhẹ trên trang; người xem có thể tắt hiệu ứng động từ cài đặt giảm chuyển động của thiết bị.
- Bản mobile có bố cục một cột và bản đồ co theo chiều rộng màn hình.
- Ảnh thật sẽ tự nằm gọn trong khung, dùng `object-fit: cover` để ảnh dọc/ngang không làm xô bố cục.

## Chạy tại máy

Mở `index.html` trong trình duyệt hoặc chạy một máy chủ static đơn giản từ thư mục này.



