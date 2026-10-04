# 06 – Lộ trình và checklist

Làm lần lượt từng mốc. Hoàn thành mốc nào thì đổi `[ ]` thành `[x]`. Mỗi mốc phải chạy được và không lỗi Console trước khi sang mốc tiếp theo.

## M0 – Chuẩn bị
- [x] Tạo thư mục `admin_video/`, chép bộ tài liệu này vào
- [x] Cài VS Code + extension Live Server (hoặc có sẵn Python/Node)
- [x] Tạo cấu trúc thư mục rỗng theo `README.md`
- [x] Chạy thử một `index.html` đơn giản qua `http://localhost`

## M1 – Nền tảng giao diện
- [x] `css/base.css`: biến màu, reset, typography
- [x] `css/components.css`: button, input, card, table, badge, modal, toast
- [x] `css/layout.css`: sidebar, topbar, lưới nội dung
- [x] Trang thử `components-demo.html` hiển thị mọi component (xóa sau khi xong)

## M2 – Dữ liệu CSV
- [x] Tạo 5 file CSV mẫu trong `data/` (theo `03-DATABASE.md`)
- [x] `js/core/csv.js`: `parse()` và `stringify()` xử lý đúng dấu phẩy, nháy kép, xuống dòng, BOM
- [x] `js/core/db.js`: `init`, `getAll`, `getById`, `find`, `insert`, `update`, `remove`
- [x] `exportCsv`, `importCsv`, `reset`
- [x] Kiểm tra bằng Console: thêm/sửa/xóa, tải lại vẫn còn, export mở được bằng Excel

## M3 – Xác thực
- [x] `js/core/auth.js`: băm SHA-256, `login`, `register`, `logout`, `currentUser`, `requireAuth`
- [x] `login.html` + `js/pages/login.js` + `css/auth.css`
- [x] `register.html` + validate
- [x] `forgot-password.html` (3 bước mô phỏng)
- [x] Đăng nhập được `admin1` và `user1`; tài khoản khóa bị chặn
- [x] Chưa đăng nhập vào trang bảo vệ thì chuyển về login

## M4 – Layout chính
- [x] Sidebar + topbar dùng chung (`js/components/sidebar.js`)
- [x] Menu ẩn/hiện theo role
- [x] Đăng xuất hoạt động
- [x] Responsive: sidebar thành ngăn kéo trên màn hình nhỏ

## M5 – List Video
- [x] Bảng 5 cột: id, title, thumbnail, views, action
- [x] Tìm kiếm, lọc, sắp xếp, phân trang
- [x] Thêm / Sửa (modal) / Xóa (xác nhận)
- [x] USER chỉ xem, không thấy nút Edit/Delete
- [x] Trạng thái tải, rỗng, lỗi

## M6 – Dashboard
- [x] 3 thẻ số liệu: tổng video, tổng lượt xem, storage
- [x] Biểu đồ cột Top 10 video
- [x] Biểu đồ line theo ngày / theo tháng (nút chuyển)
- [x] Số liệu khớp công thức, cập nhật sau khi sửa dữ liệu

## M7 – Users và Categories
- [x] `users.html`: bảng, tìm kiếm, sửa role/trạng thái, khóa, xóa, thêm
- [x] Các ràng buộc: không xóa chính mình, không hạ ADMIN cuối cùng
- [x] `categories.html`: CRUD, chặn xóa khi còn video
- [x] Chỉ ADMIN truy cập được

## M8 – Hoàn thiện
- [x] Menu Import / Export / Reset dữ liệu
- [x] Rà soát toàn bộ thông báo tiếng Việt
- [x] Kiểm tra truy cập (label, focus, tương phản)
- [x] Không còn lỗi đỏ ở Console, thử trên Chrome và Edge
- [x] Viết mục "Hướng dẫn sử dụng" ngắn trong README

## Checklist kiểm thử cuối

| # | Kịch bản | Kết quả mong đợi |
|---|---|---|
| 1 | Đăng nhập `admin1@gmail.com / 123456` | Vào Dashboard, thấy đủ menu |
| 2 | Đăng nhập `user1@gmail.com / 123456` | Không thấy Users, Categories; không có nút Edit/Delete |
| 3 | Đăng nhập sai mật khẩu | Thông báo "Email hoặc mật khẩu không đúng." |
| 4 | Đăng ký email đã tồn tại | Báo email đã được sử dụng |
| 5 | Quên mật khẩu → đặt mật khẩu mới → đăng nhập lại | Thành công; liên kết dùng lần 2 bị từ chối |
| 6 | Thêm video, tải lại trang | Video còn nguyên, Dashboard tăng số liệu |
| 7 | Xóa video | Biến mất khỏi bảng và Top 10 |
| 8 | Xóa category đang có video | Bị chặn kèm thông báo |
| 9 | Export videos.csv, mở bằng Excel | Hiển thị đúng tiếng Việt |
| 10 | Reset dữ liệu mẫu | Quay về dữ liệu CSV ban đầu |
| 11 | Vào `dashboard.html` khi chưa đăng nhập | Chuyển về `login.html` |
