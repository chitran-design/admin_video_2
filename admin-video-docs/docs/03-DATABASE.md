# 03 – Thiết kế cơ sở dữ liệu (CSV)

## 1. Quy tắc chung cho mọi file CSV

- Mã hóa **UTF-8 có BOM** (để Excel mở không lỗi tiếng Việt). Khi đọc phải bỏ BOM.
- Dấu phân cách: dấu phẩy `,`. Dòng đầu là **header**.
- Ô có dấu phẩy, xuống dòng hoặc dấu nháy kép phải bọc trong `"..."`; dấu nháy kép bên trong viết thành `""`.
- Ngày giờ: `YYYY-MM-DD HH:mm:ss`. Ngày: `YYYY-MM-DD`.
- Boolean: `TRUE` / `FALSE`. Ô rỗng nghĩa là `null`.
- Cột `id`: số nguyên tăng dần, bắt đầu từ 1, không dùng lại id đã xóa trong cùng phiên.
- Tên bảng và cột: `snake_case`, tiếng Anh.

## 2. Sơ đồ quan hệ

```
users 1 ───< videos >─── 1 video_categories
                │
                ├───< video_views_daily
users 1 ───< password_resets
```

| Quan hệ | Ý nghĩa |
|---|---|
| videos.uploader_id → users.id | người đăng video |
| videos.category_id → video_categories.id | danh mục của video |
| video_views_daily.video_id → videos.id | lượt xem theo ngày |
| password_resets.user_id → users.id | yêu cầu đặt lại mật khẩu |

## 3. Chi tiết các bảng

### 3.1 `users`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | int | PK | |
| username | string | unique, 3–30 ký tự, chữ/số/`_` | |
| email | string | unique, đúng định dạng email, lưu chữ thường | |
| password_hash | string | bắt buộc | SHA-256 dạng hex (64 ký tự) |
| role | enum | `ADMIN` \| `USER` | |
| status | enum | `ACTIVE` \| `LOCKED` | |
| avatar_url | string | tùy chọn | |
| created_at | datetime | | |
| last_login_at | datetime | tùy chọn | |

Dữ liệu mẫu (`password` của cả hai là `123456`):

```csv
id,username,email,password_hash,role,status,avatar_url,created_at,last_login_at
1,admin1,admin1@gmail.com,8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92,ADMIN,ACTIVE,,2026-01-01 08:00:00,
2,user1,user1@gmail.com,8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92,USER,ACTIVE,,2026-01-02 09:30:00,
```

### 3.2 `video_categories`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | int | PK | |
| name | string | unique, bắt buộc | Tên hiển thị |
| slug | string | unique | Dạng không dấu, gạch ngang |
| description | string | tùy chọn | |
| created_at | datetime | | |

```csv
id,name,slug,description,created_at
1,Giáo dục,giao-duc,Video học tập và hướng dẫn,2026-01-01 08:00:00
2,Giải trí,giai-tri,Video vui nhộn và phim ngắn,2026-01-01 08:00:00
3,Âm nhạc,am-nhac,MV và biểu diễn,2026-01-01 08:00:00
4,Công nghệ,cong-nghe,Review và thủ thuật công nghệ,2026-01-01 08:00:00
5,Du lịch,du-lich,Vlog và cẩm nang du lịch,2026-01-01 08:00:00
```

### 3.3 `videos`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | int | PK | |
| title | string | bắt buộc, 3–150 ký tự | |
| description | string | tùy chọn | |
| thumbnail_url | string | tùy chọn | Ảnh trong `assets/img/` hoặc URL ngoài |
| video_url | string | tùy chọn | Liên kết video (không upload) |
| category_id | int | FK → video_categories.id | |
| uploader_id | int | FK → users.id | |
| duration_seconds | int | ≥ 0 | |
| file_size_bytes | int | ≥ 0 | Dùng để tính storage |
| views | int | ≥ 0 | Tổng lượt xem |
| status | enum | `PUBLISHED` \| `DRAFT` \| `HIDDEN` | |
| created_at | datetime | | |
| updated_at | datetime | | |

```csv
id,title,description,thumbnail_url,video_url,category_id,uploader_id,duration_seconds,file_size_bytes,views,status,created_at,updated_at
1,Học HTML trong 30 phút,Nhập môn HTML cho người mới,assets/img/thumb-01.jpg,https://example.com/v/1,1,1,1800,356515840,15420,PUBLISHED,2026-02-01 10:00:00,2026-02-01 10:00:00
2,"Top 10 phim hài, không thể bỏ qua",Tổng hợp phim hài hay nhất,assets/img/thumb-02.jpg,https://example.com/v/2,2,1,925,198180352,9870,PUBLISHED,2026-02-05 14:20:00,2026-02-05 14:20:00
3,Review laptop văn phòng 2026,So sánh 5 mẫu laptop,assets/img/thumb-03.jpg,https://example.com/v/3,4,2,1210,274726912,6310,DRAFT,2026-02-10 09:15:00,2026-02-12 16:40:00
```

Tạo tối thiểu **15 video** mẫu, phân bổ nhiều danh mục, `views` chênh lệch rõ để biểu đồ Top 10 đẹp.

### 3.4 `video_views_daily`

Phục vụ biểu đồ line (theo ngày, gộp theo tháng).

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | int | PK | |
| video_id | int | FK → videos.id | |
| view_date | date | | `YYYY-MM-DD` |
| views | int | ≥ 0 | Lượt xem của video đó trong ngày |

```csv
id,video_id,view_date,views
1,1,2026-09-28,210
2,1,2026-09-29,245
3,2,2026-09-28,130
```

Quy tắc dữ liệu mẫu:
- Sinh dữ liệu cho **ít nhất 12 tháng gần nhất** (để vẽ biểu đồ theo tháng) và mọi ngày trong 90 ngày gần nhất.
- Với mỗi video, **tổng `views` theo ngày = `videos.views`** để số liệu Dashboard khớp nhau.
- Một cặp (`video_id`, `view_date`) chỉ xuất hiện một lần.

### 3.5 `password_resets`

| Cột | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| id | int | PK | |
| user_id | int | FK → users.id | |
| token | string | unique | Chuỗi ngẫu nhiên 32 ký tự |
| expires_at | datetime | | Hết hạn sau 15 phút |
| used | boolean | | `TRUE` sau khi đặt lại thành công |
| created_at | datetime | | |

File mẫu chỉ có dòng header:

```csv
id,user_id,token,expires_at,used,created_at
```

## 4. Công thức thống kê Dashboard

| Số liệu | Cách tính |
|---|---|
| Tổng số video | `COUNT(videos)` (mặc định tính mọi trạng thái; có thể ghi chú số PUBLISHED) |
| Tổng lượt xem | `SUM(videos.views)` |
| Dung lượng storage | `SUM(videos.file_size_bytes)`, hiển thị `KB/MB/GB` (hệ 1024, làm tròn 2 chữ số) |
| Top 10 video | sắp xếp `views` giảm dần, lấy 10 dòng đầu |
| Lượt xem theo ngày | `SUM(views)` nhóm theo `view_date` (30 ngày gần nhất) |
| Lượt xem theo tháng | `SUM(views)` nhóm theo `YYYY-MM` (12 tháng gần nhất) |

## 5. Ràng buộc toàn vẹn (kiểm tra ở tầng `db.js`)

- Xóa **category** đang có video: chặn, báo "Danh mục đang được sử dụng bởi N video".
- Xóa **video**: xóa luôn các dòng `video_views_daily` của video đó.
- Xóa **user** có video: chặn, hoặc chuyển video sang admin (chọn khi triển khai, ghi rõ trong code).
- Không xóa chính mình; không xóa hoặc hạ quyền **ADMIN cuối cùng**.
- `email`, `username`, `slug` không trùng (không phân biệt hoa thường).

## 6. Mở rộng giai đoạn sau (tùy chọn)

| Bảng | Mục đích |
|---|---|
| `video_tags` (id, name) và `video_tag_map` (video_id, tag_id) | gắn thẻ nhiều-nhiều |
| `activity_logs` (id, user_id, action, target_table, target_id, created_at) | nhật ký thao tác |
| `settings` (key, value) | cấu hình như số dòng mỗi trang |
