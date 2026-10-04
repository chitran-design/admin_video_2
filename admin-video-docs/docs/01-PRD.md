# 01 – Product Requirements (PRD)

## 1. Mục tiêu
Xây website admin giúp quản lý kho video: xem thống kê, quản lý danh sách video, danh mục và người dùng. Đồng thời là dự án thực hành Vibe Coding với công nghệ tối giản.

## 2. Đối tượng sử dụng

| Vai trò | Mô tả | Quyền |
|---|---|---|
| ADMIN | Quản trị viên | Toàn quyền: Dashboard, Videos, Categories, Users |
| USER | Người dùng thường | Xem Dashboard và danh sách Videos (chỉ đọc). Không thấy Users, Categories, không sửa/xóa |

> Giả định: người dùng chưa quy định quyền của USER nên chọn mô hình trên để thực hành phân quyền. Có thể đổi trong `docs/02-ARCHITECTURE.md` mục 5.

## 3. Phạm vi

**Trong phạm vi**
- Dashboard, List Video, Login, Register, Forgot Password
- Quản lý Users, Videos, Categories (CRUD)
- Lưu dữ liệu bằng CSV, xuất/nhập CSV
- Responsive cơ bản (desktop và tablet, mobile dùng được)

**Ngoài phạm vi**
- Upload file video thật, phát video, xử lý video
- Gửi email thật, đăng nhập mạng xã hội
- Backend, API server, database thật
- Đa ngôn ngữ (chỉ tiếng Việt)

## 3.1 Yêu cầu chức năng

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-01 | Đăng nhập bằng email + mật khẩu, tùy chọn "Ghi nhớ đăng nhập" | Cao |
| FR-02 | Đăng ký tài khoản mới, role mặc định USER | Cao |
| FR-03 | Quên mật khẩu (mô phỏng, không gửi email thật) | Trung bình |
| FR-04 | Dashboard: 3 thẻ số liệu (tổng video, tổng lượt xem, dung lượng storage) | Cao |
| FR-05 | Dashboard: biểu đồ cột Top 10 video nhiều lượt xem nhất | Cao |
| FR-06 | Dashboard: biểu đồ line lượt xem theo ngày và theo tháng (chuyển đổi được) | Cao |
| FR-07 | List Video: bảng gồm id, title, thumbnail, views, action (Edit, Delete) | Cao |
| FR-08 | Thêm, sửa, xóa video (có xác nhận khi xóa) | Cao |
| FR-09 | Tìm kiếm theo title, lọc theo danh mục/trạng thái, sắp xếp, phân trang | Trung bình |
| FR-10 | Quản lý Users: xem, sửa role/trạng thái, khóa/mở khóa, xóa (chỉ ADMIN) | Cao |
| FR-11 | Quản lý Categories: thêm, sửa, xóa | Trung bình |
| FR-12 | Xuất từng bảng ra file CSV; nhập CSV để thay dữ liệu | Cao |
| FR-13 | Nút "Reset dữ liệu mẫu" khôi phục từ file CSV gốc | Trung bình |
| FR-14 | Chặn truy cập trang khi chưa đăng nhập hoặc không đủ quyền | Cao |

## 3.2 Yêu cầu phi chức năng
- **Giao diện:** light mode, nền trắng, phong cách sạch, nhất quán với trang login hiện có.
- **Hiệu năng:** tải và hiển thị 1.000 video dưới 1 giây trên máy thường.
- **Khả năng bảo trì:** code tách module, mỗi trang một file JS.
- **Trình duyệt:** Chrome, Edge, Firefox bản mới.
- **Truy cập:** có label cho input, tương phản màu đủ, thao tác được bằng bàn phím.

## 4. Giới hạn đã biết (cần hiểu rõ)
1. **Trình duyệt không thể tự ghi file CSV trên ổ đĩa.** Vì vậy mọi thay đổi được lưu trong `localStorage`; muốn lưu lâu dài phải bấm "Export CSV" và chép file mới đè vào thư mục `data/`.
2. **Bảo mật chỉ mang tính minh họa.** Mọi code chạy ở phía client nên ai cũng xem được dữ liệu. Không dùng cho dữ liệu thật.
3. **Quên mật khẩu không gửi được email.** Hệ thống hiển thị liên kết đặt lại ngay trên màn hình.
4. **Phải chạy qua `http://localhost`**, không mở trực tiếp bằng `file://` (lỗi CORS bạn đã gặp).

## 5. Tiêu chí hoàn thành (Definition of Done)
- Đăng nhập được bằng 2 tài khoản mẫu, đúng quyền.
- Dashboard hiển thị đúng số liệu tính từ CSV, 2 biểu đồ hoạt động.
- CRUD video, user, category chạy được; tải lại trang vẫn giữ dữ liệu.
- Export CSV ra file mở được bằng Excel, tiếng Việt không lỗi font.
- Không có lỗi đỏ trong Console ở mọi trang.
