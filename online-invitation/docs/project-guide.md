# Khắc Sơn & Huyền Trang — thiệp cưới online

Thiệp cưới tĩnh, responsive, chạy trực tiếp trên GitHub Pages. Phong cách botanical editorial, lấy ý tưởng từ lời mời mở đầu, thông tin nghi lễ, album, đếm ngược, lịch, địa điểm và lời chúc trên trang tham khảo; thiết kế và nội dung được dựng riêng cho Sơn & Trang.

## Xem demo

Sau khi bật GitHub Pages, trang sẽ ở `https://sonpro147.github.io/son-trang-wedding/`.

## Sửa thông tin

- Tìm các ô nền vàng nhạt trên thiệp: đây là thông tin còn thiếu và cần thay bằng dữ liệu thật.
- Quản lý nội dung, ảnh và nhạc bằng `tools/admin.html`; xem [cách mở trình quản lý trên máy](admin-setup.md). Các thay đổi chỉ ghi vào project local, chưa đẩy lên GitHub.
- Nội dung nằm trong `site/data/default-content.json`; ảnh và nhạc nằm trong `site/assets/uploads/`.
- Ngày đếm ngược được nhập trong phần quản trị theo ngày tháng; giờ và địa chỉ của từng buổi lễ có ô riêng.
- Biểu mẫu lời chúc gồm tên và nội dung. Phản hồi được lưu trong Google Sheet riêng tư do Google Forms tạo và liên kết; lời chúc chỉ lên sổ công khai sau khi được thêm trong quản trị.
- Dòng “Đăng nhập vào Google để lưu tiến trình” là gợi ý lưu bản nháp, không phải yêu cầu đăng nhập để gửi. Muốn bỏ dòng đó, trong Google Forms vào **Cài đặt → Bản trình bày** và bật **Tắt tự động lưu cho tất cả người trả lời**.
- Thay địa điểm và liên kết Google Maps, thông tin liên hệ khi có dữ liệu thật.
- Nhạc demo Web Audio vẫn là dự phòng. Có thể tải tệp nhạc vào phần quản trị; khách cần bấm nút bật nhạc do trình duyệt không tự phát nhạc nền.
- Hai khung bản đồ nhà trai/nhà gái lấy địa chỉ và từ khóa từ phần quản trị.
- Nút **Mở hộp quà** mở hộp thoại QR. Chỉ tải QR lên khi hai bạn quyết định công khai.
- Hiệu ứng tim được phủ nhẹ trên trang; người xem có thể tắt hiệu ứng động từ cài đặt giảm chuyển động của thiết bị.
- Bản mobile có bố cục một cột và bản đồ co theo chiều rộng màn hình.
- Ảnh thật sẽ tự nằm gọn trong khung, dùng `object-fit: cover` để ảnh dọc/ngang không làm xô bố cục.

## Chạy tại máy

Mở `index.html` ở thư mục gốc để đi qua trang chuyển hướng, hoặc dùng `node tools/admin-server.mjs` để mở thiệp và trình quản lý tại `http://127.0.0.1:4173/`.
