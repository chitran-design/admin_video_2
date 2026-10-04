# Video Admin - Website Quản Lý Video

Dự án website quản trị video được xây dựng bằng **HTML5, CSS3 và JavaScript thuần (ES Modules)**, lưu trữ dữ liệu dạng **CSV** (qua `localStorage`), **không cần backend server**.

---

## 🚀 Hướng dẫn khởi chạy

> ⚠️ **Lưu ý quan trọng**: ES Modules và đọc file CSV yêu cầu giao thức HTTP, do đó **không mở file trực tiếp bằng `file:///...`** (sẽ gặp lỗi CORS). Hãy chạy thông qua một web server cục bộ.

Chọn 1 trong các cách sau tại thư mục dự án:

### Cách 1: Sử dụng Python
```bash
python -m http.server 5500
```
Sau đó truy cập trình duyệt tại: **[http://localhost:5500/login.html](http://localhost:5500/login.html)** (hoặc `http://localhost:5500/`)

### Cách 2: Sử dụng Node.js
```bash
npx serve -l 5500
```
hoặc
```bash
npx http-server -p 5500
```

### Cách 3: VS Code Live Server
Cài extension **Live Server** trong VS Code, nhấp chuột phải vào `login.html` và chọn **Open with Live Server**.

---

## 🔑 Tài khoản đăng nhập mẫu

| Username | Email | Mật khẩu | Quyền (Role) | Chức năng truy cập |
|---|---|---|---|---|
| **admin1** | `admin1@gmail.com` | `123456` | **ADMIN** | Toàn quyền: Dashboard, Quản lý Video, Danh mục, Người dùng, Import/Export/Reset CSV |
| **user1** | `user1@gmail.com` | `123456` | **USER** | Xem Dashboard, Xem danh sách Video (chỉ đọc, không thêm/sửa/xóa) |
| locked_user | `locked@gmail.com` | `123456` | USER (LOCKED) | Bị khóa, không thể đăng nhập |

---

## 📁 Cấu trúc thư mục

```
admin_video_2/
├── index.html                 # Điều hướng tự động tới login hoặc dashboard
├── login.html                 # Trang đăng nhập (email, password ẩn/hiện, remember me)
├── register.html              # Đăng ký tài khoản mới (vai trò mặc định USER)
├── forgot-password.html       # Quên mật khẩu (mô phỏng 3 bước + hộp thư ảo)
├── dashboard.html             # Thống kê số liệu, biểu đồ Top 10 & xu hướng lượt xem
├── videos.html                # Quản lý video 5 cột, lọc, tìm kiếm không dấu, phân trang
├── users.html                 # Quản lý người dùng, phân quyền, khóa/mở khóa (chỉ ADMIN)
├── categories.html            # Quản lý danh mục video, auto-slug (chỉ ADMIN)
├── components-demo.html       # Trang xem thử toàn bộ các UI components
├── test-db.html               # Trang test kiểm tra cơ sở dữ liệu và CSV
├── css/
│   ├── base.css               # Reset CSS, typography, biến màu light mode
│   ├── layout.css             # Sidebar 240px, topbar, mobile drawer, grid
│   ├── components.css         # Button, input, table, badge, modal, toast
│   └── auth.css               # Giao diện các trang đăng nhập/đăng ký
├── js/
│   ├── core/
│   │   ├── csv.js             # Parser/stringifier RFC 4180 chuẩn kèm UTF-8 BOM
│   │   ├── db.js              # Giả lập DB trên localStorage, CRUD, kiểm tra ràng buộc
│   │   ├── auth.js            # Xác thực, SHA-256, phiên đăng nhập, rate-limit
│   │   └── utils.js           # Format số, ngày, bytes, escapeHtml, slugify
│   ├── components/
│   │   ├── sidebar.js         # Sidebar, topbar responsive, menu theo role, modal data
│   │   ├── modal.js           # Modal và hộp thoại xác nhận Promise confirmDialog
│   │   └── toast.js           # Thông báo Toast tự tắt góc trên bên phải
│   └── pages/
│       ├── login.js
│       ├── register.js
│       ├── forgot-password.js
│       ├── dashboard.js       # Tích hợp Chart.js vẽ biểu đồ cột và line
│       ├── videos.js
│       ├── users.js
│       └── categories.js
├── data/                      # 5 file CSV mẫu chuẩn UTF-8 BOM
│   ├── users.csv
│   ├── video_categories.csv
│   ├── videos.csv
│   ├── video_views_daily.csv
│   └── password_resets.csv
├── assets/img/                # Logo SVG, thumbnails 16:9 và avatars
└── tools/                     # Scripts sinh dữ liệu mẫu và hình ảnh
```

---

## 🛠️ Tính năng nổi bật

1. **Dashboard thông minh**:
   - 3 thẻ chỉ số: Tổng video, Tổng lượt xem, Dung lượng storage.
   - Biểu đồ cột: Top 10 video xem nhiều nhất.
   - Biểu đồ đường (Line chart): Lượt xem theo ngày (30 ngày gần nhất) hoặc theo tháng (12 tháng gần nhất), tự hủy và vẽ lại canvas khi chuyển đổi.
2. **Quản lý Video (5 cột chuẩn PRD)**:
   - ID, Thumbnail (ảnh có fallback), Title (line-clamp 2 dòng), Views (định dạng số), Action (Edit/Delete).
   - Tìm kiếm không phân biệt dấu tiếng Việt (vd: gõ "hoc html" vẫn tìm thấy "Học HTML").
   - Lọc theo danh mục, trạng thái, sắp xếp đa dạng, phân trang 10 dòng/trang.
3. **Phân quyền chặt chẽ (RBAC)**:
   - USER chỉ được xem danh sách video, không thấy menu Users/Categories, không có nút thêm/sửa/xóa.
   - Bảo vệ không cho tự khóa/tự xóa tài khoản của chính mình và không được hạ quyền hoặc xóa ADMIN cuối cùng.
   - Danh mục đang có video sẽ bị chặn không cho xóa.
4. **Quản lý dữ liệu CSV**:
   - Xuất dữ liệu ra file `.csv` hỗ trợ mở trực tiếp bằng Microsoft Excel không lỗi font tiếng Việt (UTF-8 BOM).
   - Nhập dữ liệu file `.csv` từ máy tính đè vào localStorage.
   - Nút khôi phục dữ liệu mẫu (Reset) từ các file CSV gốc.
