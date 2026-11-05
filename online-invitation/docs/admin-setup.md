# Dùng trình quản lý thiệp trên máy

Trình quản lý không dùng tài khoản hay dịch vụ lưu trữ bên ngoài. Một server Node.js nhỏ chỉ nghe ở `127.0.0.1`; nội dung được ghi vào `site/data/default-content.json`, ảnh và nhạc nằm trong `site/assets/uploads/`.

## Mở trang quản trị

1. Cài Node.js 18 trở lên nếu máy chưa có.
2. Mở terminal tại thư mục `online-invitation`.
3. Chạy:

   ```powershell
   node tools/admin-server.mjs
   ```

4. Mở `http://127.0.0.1:4173/admin.html`.
5. Sửa nội dung, tải ảnh/nhạc, bấm **Lưu vào project**, rồi chọn **Xem bản local**.
6. Khi xong, dừng server bằng `Ctrl+C`.

## Quản lý lời chúc

- Khách gửi tên và lời chúc qua Google Form. Để đưa một lời chúc lên sổ công khai, thêm thủ công tên, nội dung và thời gian nhận vào mục **Sổ lời chúc** trong quản trị.
- Lưu xong, lời chúc hiện trên bản local. Chỉ hiện với khách sau khi project được đẩy lên GitHub.
- Sửa hoặc xóa lời chúc trong cùng mục. Google Form không tự đồng bộ câu trả lời vào GitHub Pages.

Không có nút đẩy lên GitHub trong trang quản trị. Lúc thiệp đã ổn, hãy gom các file đã sửa vào một commit rồi push theo quy trình GitHub Pages của project.

## Lưu ý

- Ảnh và nhạc được lưu trong chính project để GitHub Pages phục vụ cùng trang.
- Mỗi tệp tải lên cần nhỏ hơn 25 MB. Hỗ trợ JPG, PNG, WebP, MP3, OGG, WAV và M4A.
- Nếu trình duyệt báo không kết nối, kiểm tra terminal vẫn đang chạy `admin-server.mjs`.
- Trình quản lý chỉ bind vào loopback (`127.0.0.1`); API ghi file từ chối request đến từ website khác.
