# 02 – Kiến trúc

## 1. Tổng quan

```
Trình duyệt
 ├─ HTML/CSS (giao diện)
 ├─ js/pages/*.js      → logic từng trang
 ├─ js/components/*.js → sidebar, modal, toast
 └─ js/core/
     ├─ csv.js   → parse / stringify CSV
     ├─ db.js    → "database": CRUD trên các bảng
     ├─ auth.js  → đăng nhập, phiên, phân quyền
     └─ utils.js → format số, ngày, escapeHtml...

data/*.csv  ──(fetch lần đầu)──▶  localStorage  ◀──(đọc/ghi mọi lúc)── db.js
                                       │
                                       └──(nút Export CSV)──▶ file .csv tải về
```

Quy tắc: **trang chỉ nói chuyện với `db.js` và `auth.js`**, không đọc CSV hay `localStorage` trực tiếp.

## 2. Vòng đời dữ liệu

1. Lần đầu mở app, `db.init()` kiểm tra `localStorage` có key `vadmin:<table>` chưa.
2. Chưa có: `fetch('data/<table>.csv')` → `csv.parse()` → lưu JSON vào `localStorage`.
3. Mọi thao tác thêm/sửa/xóa chỉ thay đổi bản trong `localStorage`.
4. **Export CSV**: `csv.stringify()` → tạo `Blob` → tải file. Chép file này đè vào `data/` để dữ liệu gốc được cập nhật.
5. **Import CSV**: chọn file → parse → thay thế bảng trong `localStorage`.
6. **Reset dữ liệu mẫu**: xóa các key `vadmin:*` rồi chạy lại `db.init()`.

Khi file CSV gốc đã đổi và bạn muốn app nhận dữ liệu mới: bấm Reset dữ liệu mẫu (hoặc xóa `localStorage` trong DevTools → Application).

## 3. API của `db.js`

```js
await db.init();                          // nạp tất cả bảng
db.getAll('videos');                      // → mảng object
db.getById('videos', 5);                  // → object | null
db.find('videos', v => v.views > 1000);   // → mảng đã lọc
db.insert('videos', { title: '...' });    // tự gán id = max(id)+1, created_at
db.update('videos', 5, { title: '...' }); // tự cập nhật updated_at nếu bảng có cột này
db.remove('videos', 5);                   // xóa theo id
db.exportCsv('videos');                   // tải file videos.csv
await db.importCsv('videos', file);       // thay dữ liệu bảng từ file
await db.reset();                         // khôi phục từ CSV gốc
```

Giữ nguyên kiểu dữ liệu: số lưu dạng number, boolean dạng boolean, chuỗi rỗng trong CSV thành `null`. Việc ép kiểu theo schema khai báo trong `db.js` (xem `03-DATABASE.md`).

## 4. Xác thực (`auth.js`)

- **Băm mật khẩu:** SHA-256 bằng `crypto.subtle.digest` (chỉ hoạt động trên `http://localhost` hoặc `https`). CSV lưu cột `password_hash`, **không lưu mật khẩu thô**.
- **Phiên đăng nhập:** key `vadmin:session` = `{ userId, role, expiresAt }`.
  - Tick "Ghi nhớ đăng nhập": lưu `localStorage`, hạn 7 ngày.
  - Không tick: lưu `sessionStorage`, mất khi đóng tab.
- **Hàm chính:**
  ```js
  await auth.login(email, password);   // trả user hoặc ném lỗi có message tiếng Việt
  await auth.register({ username, email, password });
  auth.logout();
  auth.currentUser();                  // user đang đăng nhập hoặc null
  auth.requireAuth(['ADMIN']);         // gọi đầu mỗi trang bảo vệ, tự chuyển hướng
  ```
- Tài khoản `status = LOCKED` không đăng nhập được.
- Sau đăng nhập thành công: cập nhật `users.last_login_at`.
- Chống đoán mật khẩu cơ bản: sai quá 5 lần liên tiếp thì chờ 30 giây (đếm trong `sessionStorage`).

> Đây chỉ là bảo mật mô phỏng. Người dùng có thể mở DevTools sửa `localStorage`. Trong dự án thật, xác thực phải nằm ở server.

## 5. Phân quyền

| Trang / hành động | ADMIN | USER | Chưa đăng nhập |
|---|:-:|:-:|:-:|
| login, register, forgot-password | ✅ | ✅ | ✅ |
| dashboard | ✅ | ✅ | ❌ |
| videos (xem danh sách) | ✅ | ✅ | ❌ |
| videos (thêm, sửa, xóa) | ✅ | ❌ | ❌ |
| categories | ✅ | ❌ | ❌ |
| users | ✅ | ❌ | ❌ |
| Import / Export / Reset dữ liệu | ✅ | ❌ | ❌ |

- Không đủ quyền khi vào trang: chuyển về `dashboard.html` kèm toast "Bạn không có quyền truy cập".
- Chưa đăng nhập: chuyển về `login.html?redirect=<trang đang vào>`.
- Menu sidebar chỉ hiện mục phù hợp với role. Nút Edit/Delete ẩn với USER (và `db` vẫn kiểm tra lại ở hàm xử lý).

## 6. Biểu đồ (Chart.js)

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
```

- Tạo biểu đồ trong `js/pages/dashboard.js`, khi chuyển chế độ phải `chart.destroy()` rồi tạo lại để tránh lỗi trùng canvas.
- Biểu đồ phải đổi màu theo bảng màu ở `05-UI-GUIDELINES.md`.

## 7. Xử lý lỗi
- Mọi lỗi người dùng nhìn thấy đều là toast hoặc thông báo trong form, bằng tiếng Việt.
- Mất file CSV (404): hiện thông báo "Không tải được data/xxx.csv. Hãy chạy bằng http://localhost".
- `localStorage` đầy hoặc bị tắt: hiện cảnh báo và vẫn chạy ở chế độ chỉ đọc.
