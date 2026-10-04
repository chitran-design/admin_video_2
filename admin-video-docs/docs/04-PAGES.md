# 04 – Đặc tả chi tiết từng trang

Quy ước chung:
- Mọi trang (trừ 3 trang auth) dùng layout: **sidebar trái 240px + topbar + vùng nội dung**.
- Topbar hiển thị tên và role người dùng, nút Đăng xuất.
- Mọi văn bản hiển thị bằng tiếng Việt.
- Trạng thái bắt buộc có cho mỗi trang dữ liệu: **đang tải**, **rỗng**, **lỗi**.

---

## 1. Login (`login.html`)

**Mục đích:** đăng nhập vào hệ thống.

**Thành phần:** logo "Video Admin", tiêu đề "Đăng nhập", mô tả "Quản lý video của bạn", ô Email, ô Mật khẩu (có nút ẩn/hiện), checkbox "Ghi nhớ đăng nhập", liên kết "Quên mật khẩu?", nút "Đăng nhập", liên kết "Chưa có tài khoản? Đăng ký".

**Hành vi**
1. Kiểm tra ô không rỗng và email đúng định dạng.
2. Băm mật khẩu, so khớp với `users.password_hash` (email không phân biệt hoa thường).
3. Thành công: tạo phiên, cập nhật `last_login_at`, chuyển tới `redirect` (nếu có) hoặc `dashboard.html`.
4. Thất bại: thông báo trong form.

**Thông báo lỗi**

| Tình huống | Thông báo |
|---|---|
| Sai email hoặc mật khẩu | Email hoặc mật khẩu không đúng. |
| Tài khoản bị khóa | Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên. |
| Sai quá 5 lần | Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 30 giây. |
| Không tải được dữ liệu | Không tải được dữ liệu. Hãy chạy trang bằng http://localhost. |

**Nghiệm thu:** admin1 và user1 (mật khẩu `123456`) đăng nhập được; đã đăng nhập mà vào lại `login.html` thì tự chuyển sang dashboard.

---

## 2. Register (`register.html`)

**Trường:** Tên đăng nhập, Email, Mật khẩu, Nhập lại mật khẩu, checkbox đồng ý điều khoản (tùy chọn).

**Kiểm tra dữ liệu**

| Trường | Quy tắc | Thông báo |
|---|---|---|
| username | 3–30 ký tự, chỉ chữ/số/`_`, chưa tồn tại | Tên đăng nhập không hợp lệ hoặc đã tồn tại. |
| email | đúng định dạng, chưa tồn tại | Email không hợp lệ hoặc đã được sử dụng. |
| password | tối thiểu 6 ký tự | Mật khẩu phải có ít nhất 6 ký tự. |
| confirm | trùng password | Mật khẩu nhập lại không khớp. |

**Hành vi:** tạo user với `role = USER`, `status = ACTIVE`, mật khẩu đã băm. Thành công → chuyển `login.html` kèm toast "Đăng ký thành công, hãy đăng nhập". Lỗi hiện ngay dưới từng ô.

---

## 3. Forgot Password (`forgot-password.html`)

Không gửi được email thật, nên mô phỏng 3 bước trên cùng một trang:

1. **Nhập email** → bấm "Gửi liên kết đặt lại".
2. Nếu email tồn tại: tạo bản ghi `password_resets` (token ngẫu nhiên, hết hạn sau 15 phút) và **hiển thị khung "Email giả lập"** chứa nút/liên kết `forgot-password.html?token=...`. Ghi chú nhỏ: "Trong hệ thống thật, liên kết này sẽ được gửi qua email."
3. Mở liên kết có token hợp lệ → hiện form **Mật khẩu mới + Nhập lại**. Lưu thành công thì đánh dấu `used = TRUE`, cập nhật `password_hash`, chuyển về login với toast thành công.

Lỗi cần xử lý: email không tồn tại, token sai, token hết hạn, token đã dùng ("Liên kết không hợp lệ hoặc đã hết hạn.").

---

## 4. Dashboard (`dashboard.html`) – ADMIN, USER

**Hàng 1: 3 thẻ số liệu**

| Thẻ | Giá trị | Phụ đề |
|---|---|---|
| Tổng số video | số nguyên, có dấu chấm ngăn cách nghìn (vd `1.234`) | "N video đã xuất bản" |
| Tổng lượt xem | số nguyên, rút gọn khi lớn (vd `1,2M` kèm tooltip số đầy đủ) | |
| Dung lượng storage | `KB/MB/GB` | |

Mỗi thẻ có biểu tượng và màu nhấn riêng (xem `05-UI-GUIDELINES.md`).

**Hàng 2: Biểu đồ cột "Top 10 video nhiều lượt xem nhất"**
- Trục X: tiêu đề video (cắt bớt kèm `…`, tooltip hiện tên đầy đủ). Có thể dùng cột ngang nếu tiêu đề dài.
- Trục Y: lượt xem.
- Sắp xếp giảm dần; ít hơn 10 video thì hiển thị đúng số hiện có.

**Hàng 3: Biểu đồ line "Lượt xem theo thời gian"**
- Nút chuyển **Theo ngày** (30 ngày gần nhất) / **Theo tháng** (12 tháng gần nhất).
- Ngày/tháng không có dữ liệu vẫn hiển thị với giá trị 0.
- Nhãn trục X định dạng `dd/MM` (ngày) và `MM/yyyy` (tháng). Tooltip hiện số lượt xem đã định dạng.

**Nghiệm thu:** số liệu khớp với công thức ở `03-DATABASE.md` mục 4. Sau khi thêm/xóa video, Dashboard cập nhật đúng khi tải lại.

---

## 5. List Video (`videos.html`) – ADMIN (đầy đủ), USER (chỉ xem)

**Bảng gồm đúng 5 cột:**

| Cột | Hiển thị |
|---|---|
| ID | số |
| Title | tiêu đề, cắt 2 dòng |
| Thumbnail | ảnh 96×54px, bo góc, có ảnh dự phòng khi lỗi |
| Views | số có dấu phân cách |
| Action | nút **Edit** và **Delete** (ẩn với USER) |

**Thanh công cụ phía trên bảng:** ô tìm kiếm theo title, lọc danh mục, lọc trạng thái, sắp xếp (mới nhất, nhiều view nhất, tên A–Z), nút **+ Thêm video**, nút **Export CSV**.

**Phân trang:** 10 dòng/trang, hiển thị "Hiển thị 1–10 trên 15 video".

**Thêm / Sửa video (modal):** Title\*, Mô tả, Danh mục\*, Thumbnail URL (có xem trước), Video URL, Thời lượng (giây), Dung lượng (MB, lưu thành bytes), Trạng thái, Lượt xem (chỉ ở form sửa). Lỗi hiển thị dưới từng ô.

**Xóa:** hiện hộp xác nhận "Bạn có chắc muốn xóa video "<title>"? Hành động này không thể hoàn tác." → Xóa thành công thì toast và tải lại bảng.

**Nghiệm thu:** tìm kiếm không phân biệt dấu/hoa thường (gõ `hoc html` tìm ra "Học HTML"); tải lại trang vẫn giữ thay đổi.

---

## 6. Users (`users.html`) – chỉ ADMIN

**Bảng:** ID, Avatar + Username, Email, Role (badge), Trạng thái (badge), Ngày tạo, Action.

**Chức năng**
- Tìm kiếm theo username/email, lọc theo role và trạng thái.
- **Sửa** (modal): đổi role, đổi trạng thái; có thể đặt lại mật khẩu (nhập mật khẩu mới).
- **Khóa / Mở khóa** nhanh bằng nút.
- **Xóa** có xác nhận.
- **Thêm user** do admin tạo (chọn role).

**Ràng buộc:** không xóa/khóa chính mình; không hạ quyền hoặc xóa ADMIN cuối cùng (hiện thông báo giải thích).

---

## 7. Categories (`categories.html`) – chỉ ADMIN

**Bảng:** ID, Tên, Slug, Số video, Ngày tạo, Action (Edit/Delete).

- `slug` tự sinh từ tên (bỏ dấu, chữ thường, nối bằng `-`), cho phép sửa tay.
- Xóa danh mục đang có video: bị chặn kèm thông báo.

---

## 8. Thành phần dùng chung

| Thành phần | Mô tả |
|---|---|
| Sidebar | Logo, menu: Dashboard, Videos, Categories*, Users* (*chỉ ADMIN), highlight mục đang mở |
| Topbar | Tên + role người dùng, menu "Đăng xuất", cuộn mobile có nút ☰ mở sidebar |
| Toast | Thông báo thành công/lỗi góc phải, tự tắt sau 3 giây |
| Modal | Form thêm/sửa, đóng bằng nút X, phím Esc, bấm nền |
| Confirm dialog | Dùng cho mọi thao tác xóa |
| Menu dữ liệu (ADMIN) | Import CSV, Export tất cả bảng, Reset dữ liệu mẫu (có xác nhận) |
