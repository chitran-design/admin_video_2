# Video Admin – Website quản lý video

Dự án học **Vibe Coding**: xây website admin quản lý video bằng **HTML + CSS + JavaScript thuần**, dữ liệu lưu bằng **file CSV**, **không có backend**.

## Tính năng chính

| Nhóm | Nội dung |
|---|---|
| Dashboard | Tổng số video, tổng lượt xem, dung lượng storage, biểu đồ cột Top 10 video nhiều view, biểu đồ line lượt xem theo ngày/tháng |
| Videos | Danh sách video (id, title, thumbnail, views, action Edit/Delete), thêm/sửa/xóa, tìm kiếm, lọc, phân trang |
| Users | Quản lý người dùng (chỉ ADMIN) |
| Categories | Quản lý danh mục video |
| Auth | Đăng nhập, Đăng ký, Quên mật khẩu |

## Công nghệ

- HTML5, CSS3 (không framework), JavaScript ES Modules
- Thư viện duy nhất được phép: **Chart.js** (qua CDN) để vẽ biểu đồ
- Lưu trữ: CSV (nguồn dữ liệu gốc) + `localStorage` (bản làm việc trên trình duyệt)
- Giao diện: **light mode**, nền trắng

## Tài khoản mẫu

| username | email | password | role |
|---|---|---|---|
| admin1 | admin1@gmail.com | 123456 | ADMIN |
| user1 | user1@gmail.com | 123456 | USER |

## Cách chạy

> ⚠️ **Không mở file bằng đường dẫn `file:///...`**. Trình duyệt sẽ chặn ES Modules và việc đọc file CSV (lỗi CORS). Phải chạy qua web server cục bộ.

Chọn 1 trong 3 cách (chạy trong thư mục dự án):

```bash
# Cách 1: VS Code → cài extension "Live Server" → chuột phải login.html → Open with Live Server
# Cách 2: Python
python -m http.server 5500
# Cách 3: Node.js
npx serve
```

Sau đó mở `http://localhost:5500/login.html`.

## Cấu trúc thư mục đích

```
admin_video/
├── index.html                 # chuyển hướng tới login hoặc dashboard
├── login.html
├── register.html
├── forgot-password.html
├── dashboard.html
├── videos.html
├── users.html
├── categories.html
├── css/
│   ├── base.css               # biến màu, reset, typography
│   ├── layout.css             # sidebar, topbar, grid
│   ├── components.css         # button, input, table, modal, badge, toast
│   └── auth.css               # giao diện 3 trang auth
├── js/
│   ├── core/                  # csv.js, db.js, auth.js, utils.js
│   ├── components/            # sidebar.js, modal.js, toast.js
│   └── pages/                 # login.js, register.js, dashboard.js, videos.js ...
├── data/
│   ├── users.csv
│   ├── video_categories.csv
│   ├── videos.csv
│   ├── video_views_daily.csv
│   └── password_resets.csv
└── assets/img/                # logo, thumbnail mẫu
```

## Danh sách tài liệu

| File | Nội dung |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Quy tắc cho AI coding assistant (đặt ở thư mục gốc dự án) |
| [docs/01-PRD.md](docs/01-PRD.md) | Yêu cầu sản phẩm, phạm vi, giả định |
| [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md) | Kiến trúc, cách đọc/ghi CSV, xác thực, phân quyền |
| [docs/03-DATABASE.md](docs/03-DATABASE.md) | Thiết kế các bảng CSV và dữ liệu mẫu |
| [docs/04-PAGES.md](docs/04-PAGES.md) | Đặc tả chi tiết từng trang |
| [docs/05-UI-GUIDELINES.md](docs/05-UI-GUIDELINES.md) | Màu sắc, font, component |
| [docs/06-TASKS.md](docs/06-TASKS.md) | Lộ trình và checklist |
| [docs/07-PROMPTS.md](docs/07-PROMPTS.md) | Bộ prompt mẫu để vibe code từng bước |

## Cách dùng bộ tài liệu này

1. Giải nén, copy toàn bộ vào thư mục dự án `admin_video/`.
2. Mở dự án bằng công cụ AI coding (Claude Code, Cursor...).
3. Làm theo `docs/07-PROMPTS.md` từng bước, tick vào `docs/06-TASKS.md` khi xong.
