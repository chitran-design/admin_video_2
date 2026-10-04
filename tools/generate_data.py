"""
Script tạo dữ liệu CSV mẫu cho Video Admin:
- users.csv
- video_categories.csv
- videos.csv
- video_views_daily.csv
- password_resets.csv

Tất cả file được lưu với UTF-8 BOM (sig).
Tổng views trong video_views_daily của mỗi video chính xác bằng videos.views.
"""

import os
import csv
import random
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# 1. users.csv
users_data = [
    {
        "id": 1,
        "username": "admin1",
        "email": "admin1@gmail.com",
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", # 123456
        "role": "ADMIN",
        "status": "ACTIVE",
        "avatar_url": "assets/img/avatar-admin.png",
        "created_at": "2026-01-01 08:00:00",
        "last_login_at": "2026-10-04 09:00:00"
    },
    {
        "id": 2,
        "username": "user1",
        "email": "user1@gmail.com",
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", # 123456
        "role": "USER",
        "status": "ACTIVE",
        "avatar_url": "assets/img/avatar-user.png",
        "created_at": "2026-01-02 09:30:00",
        "last_login_at": "2026-10-03 14:15:00"
    },
    {
        "id": 3,
        "username": "admin2",
        "email": "admin2@gmail.com",
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", # 123456
        "role": "ADMIN",
        "status": "ACTIVE",
        "avatar_url": "",
        "created_at": "2026-01-10 11:20:00",
        "last_login_at": "2026-09-20 18:30:00"
    },
    {
        "id": 4,
        "username": "locked_user",
        "email": "locked@gmail.com",
        "password_hash": "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", # 123456
        "role": "USER",
        "status": "LOCKED",
        "avatar_url": "",
        "created_at": "2026-02-15 16:45:00",
        "last_login_at": "2026-03-01 10:00:00"
    }
]

# 2. video_categories.csv
categories_data = [
    {"id": 1, "name": "Giáo dục", "slug": "giao-duc", "description": "Video học tập và hướng dẫn", "created_at": "2026-01-01 08:00:00"},
    {"id": 2, "name": "Giải trí", "slug": "giai-tri", "description": "Video vui nhộn và phim ngắn", "created_at": "2026-01-01 08:00:00"},
    {"id": 3, "name": "Âm nhạc", "slug": "am-nhac", "description": "MV và biểu diễn âm nhạc", "created_at": "2026-01-01 08:00:00"},
    {"id": 4, "name": "Công nghệ", "slug": "cong-nghe", "description": "Review và thủ thuật công nghệ", "created_at": "2026-01-01 08:00:00"},
    {"id": 5, "name": "Du lịch", "slug": "du-lich", "description": "Vlog và cẩm nang du lịch trải nghiệm", "created_at": "2026-01-01 08:00:00"}
]

# 3. videos.csv (16 videos, varied views for clear top 10)
videos_data = [
    {
        "id": 1,
        "title": "Học HTML trong 30 phút",
        "description": "Nhập môn HTML căn bản cho người mới bắt đầu lập trình web.",
        "thumbnail_url": "assets/img/thumb-01.jpg",
        "video_url": "https://example.com/v/1",
        "category_id": 1,
        "uploader_id": 1,
        "duration_seconds": 1800,
        "file_size_bytes": 356515840, # ~340 MB
        "views": 28450,
        "status": "PUBLISHED",
        "created_at": "2026-01-15 10:00:00",
        "updated_at": "2026-01-15 10:00:00"
    },
    {
        "id": 2,
        "title": "Top 10 phim hài, không thể bỏ qua",
        "description": "Tổng hợp những bộ phim hài hước kinh điển cười ra nước mắt.",
        "thumbnail_url": "assets/img/thumb-02.jpg",
        "video_url": "https://example.com/v/2",
        "category_id": 2,
        "uploader_id": 1,
        "duration_seconds": 925,
        "file_size_bytes": 198180352, # ~189 MB
        "views": 22300,
        "status": "PUBLISHED",
        "created_at": "2026-02-01 14:20:00",
        "updated_at": "2026-02-01 14:20:00"
    },
    {
        "id": 3,
        "title": "Review laptop văn phòng 2026",
        "description": "So sánh 5 mẫu laptop văn phòng mỏng nhẹ pin trâu giá dưới 20 triệu.",
        "thumbnail_url": "assets/img/thumb-03.jpg",
        "video_url": "https://example.com/v/3",
        "category_id": 4,
        "uploader_id": 2,
        "duration_seconds": 1210,
        "file_size_bytes": 274726912, # ~262 MB
        "views": 18900,
        "status": "PUBLISHED",
        "created_at": "2026-02-10 09:15:00",
        "updated_at": "2026-02-12 16:40:00"
    },
    {
        "id": 4,
        "title": "Kinh nghiệm du lịch Đà Lạt tự túc 3N2Đ",
        "description": "Lịch trình chi tiết khám phá các quán cafe đẹp và đồi thông săn mây.",
        "thumbnail_url": "assets/img/thumb-04.jpg",
        "video_url": "https://example.com/v/4",
        "category_id": 5,
        "uploader_id": 2,
        "duration_seconds": 1450,
        "file_size_bytes": 412090368, # ~393 MB
        "views": 15720,
        "status": "PUBLISHED",
        "created_at": "2026-03-05 11:30:00",
        "updated_at": "2026-03-05 11:30:00"
    },
    {
        "id": 5,
        "title": "Tuyển tập Acoustic Guitar nhẹ nhàng thư giãn",
        "description": "Những bản nhạc không lời du dương giúp tập trung học tập và làm việc.",
        "thumbnail_url": "assets/img/thumb-05.jpg",
        "video_url": "https://example.com/v/5",
        "category_id": 3,
        "uploader_id": 1,
        "duration_seconds": 3600,
        "file_size_bytes": 820000000, # ~782 MB
        "views": 14100,
        "status": "PUBLISHED",
        "created_at": "2026-03-20 20:00:00",
        "updated_at": "2026-03-20 20:00:00"
    },
    {
        "id": 6,
        "title": "Làm chủ CSS Grid và Flexbox trong thực tế",
        "description": "Hướng dẫn dàn trang web chuẩn responsive từ A đến Z bằng CSS hiện đại.",
        "thumbnail_url": "assets/img/thumb-06.jpg",
        "video_url": "https://example.com/v/6",
        "category_id": 1,
        "uploader_id": 1,
        "duration_seconds": 2100,
        "file_size_bytes": 524288000, # 500 MB
        "views": 11850,
        "status": "PUBLISHED",
        "created_at": "2026-04-02 08:30:00",
        "updated_at": "2026-04-02 08:30:00"
    },
    {
        "id": 7,
        "title": "Đánh giá chi tiết smartphone gập thế hệ mới",
        "description": "Màn hình vô cực, độ bền bản lề và camera chụp đêm xuất sắc.",
        "thumbnail_url": "assets/img/thumb-07.jpg",
        "video_url": "https://example.com/v/7",
        "category_id": 4,
        "uploader_id": 2,
        "duration_seconds": 880,
        "file_size_bytes": 188743680, # 180 MB
        "views": 9650,
        "status": "PUBLISHED",
        "created_at": "2026-04-18 15:45:00",
        "updated_at": "2026-04-18 15:45:00"
    },
    {
        "id": 8,
        "title": "Vlog: Một ngày lang thang phố cổ Hội An",
        "description": "Thưởng thức cao lầu, thả đèn hoa đăng trên sông Hoài thơ mộng.",
        "thumbnail_url": "assets/img/thumb-08.jpg",
        "video_url": "https://example.com/v/8",
        "category_id": 5,
        "uploader_id": 1,
        "duration_seconds": 1050,
        "file_size_bytes": 314572800, # 300 MB
        "views": 8420,
        "status": "PUBLISHED",
        "created_at": "2026-05-10 17:00:00",
        "updated_at": "2026-05-10 17:00:00"
    },
    {
        "id": 9,
        "title": "Lập trình JavaScript từ số 0 cho người mới",
        "description": "Các khái niệm biến, hàm, mảng, object, DOM manipulation và ES6+.",
        "thumbnail_url": "assets/img/thumb-09.jpg",
        "video_url": "https://example.com/v/9",
        "category_id": 1,
        "uploader_id": 1,
        "duration_seconds": 3200,
        "file_size_bytes": 734003200, # 700 MB
        "views": 7500,
        "status": "PUBLISHED",
        "created_at": "2026-05-25 10:15:00",
        "updated_at": "2026-05-25 10:15:00"
    },
    {
        "id": 10,
        "title": "Hài kịch tình huống: Chuyện công sở hài hước",
        "description": "Tiểu phẩm hài ngắn phản ánh cuộc sống văn phòng vui nhộn.",
        "thumbnail_url": "assets/img/thumb-10.jpg",
        "video_url": "https://example.com/v/10",
        "category_id": 2,
        "uploader_id": 2,
        "duration_seconds": 650,
        "file_size_bytes": 146800640, # 140 MB
        "views": 6200,
        "status": "PUBLISHED",
        "created_at": "2026-06-12 19:30:00",
        "updated_at": "2026-06-12 19:30:00"
    },
    {
        "id": 11,
        "title": "Những giai điệu Lo-fi thư giãn đêm khuya",
        "description": "Beat Lo-fi nhẹ nhàng du dương ru ngủ cực êm.",
        "thumbnail_url": "assets/img/thumb-11.jpg",
        "video_url": "https://example.com/v/11",
        "category_id": 3,
        "uploader_id": 1,
        "duration_seconds": 2700,
        "file_size_bytes": 550000000,
        "views": 4850,
        "status": "PUBLISHED",
        "created_at": "2026-06-30 22:00:00",
        "updated_at": "2026-06-30 22:00:00"
    },
    {
        "id": 12,
        "title": "Trên tay bàn phím cơ không dây công thái học",
        "description": "Cảm giác gõ êm ái, kết nối đa thiết bị, switch mượt mà.",
        "thumbnail_url": "assets/img/thumb-12.jpg",
        "video_url": "https://example.com/v/12",
        "category_id": 4,
        "uploader_id": 2,
        "duration_seconds": 720,
        "file_size_bytes": 160000000,
        "views": 3950,
        "status": "PUBLISHED",
        "created_at": "2026-07-14 14:00:00",
        "updated_at": "2026-07-14 14:00:00"
    },
    {
        "id": 13,
        "title": "Chinh phục đỉnh Fansipan 3.143m mùa đông",
        "description": "Hành trình săn tuyết và mây trắng trên nóc nhà Đông Dương.",
        "thumbnail_url": "assets/img/thumb-13.jpg",
        "video_url": "https://example.com/v/13",
        "category_id": 5,
        "uploader_id": 1,
        "duration_seconds": 1620,
        "file_size_bytes": 480000000,
        "views": 3100,
        "status": "PUBLISHED",
        "created_at": "2026-08-01 09:00:00",
        "updated_at": "2026-08-01 09:00:00"
    },
    {
        "id": 14,
        "title": "Bí quyết dựng video ngắn triệu view bằng CapCut",
        "description": "Các kỹ thuật chuyển cảnh, âm thanh, text hiệu ứng bắt mắt.",
        "thumbnail_url": "assets/img/thumb-14.jpg",
        "video_url": "https://example.com/v/14",
        "category_id": 1,
        "uploader_id": 1,
        "duration_seconds": 1150,
        "file_size_bytes": 280000000,
        "views": 2400,
        "status": "DRAFT",
        "created_at": "2026-08-20 16:30:00",
        "updated_at": "2026-08-25 10:00:00"
    },
    {
        "id": 15,
        "title": "Mẹo tối ưu hiệu năng máy tính Windows 11",
        "description": "Tắt ứng dụng chạy ngầm, dọn rác và tăng tốc khởi động.",
        "thumbnail_url": "assets/img/thumb-15.jpg",
        "video_url": "https://example.com/v/15",
        "category_id": 4,
        "uploader_id": 2,
        "duration_seconds": 840,
        "file_size_bytes": 175000000,
        "views": 1550,
        "status": "PUBLISHED",
        "created_at": "2026-09-05 13:20:00",
        "updated_at": "2026-09-05 13:20:00"
    },
    {
        "id": 16,
        "title": "Phỏng vấn hậu trường MV ca nhạc độc quyền",
        "description": "Những thước phim vui nhộn và thử thách của đoàn làm phim.",
        "thumbnail_url": "assets/img/thumb-16.jpg",
        "video_url": "https://example.com/v/16",
        "category_id": 3,
        "uploader_id": 1,
        "duration_seconds": 960,
        "file_size_bytes": 220000000,
        "views": 850,
        "status": "HIDDEN",
        "created_at": "2026-09-18 18:00:00",
        "updated_at": "2026-09-19 09:00:00"
    }
]

# 4. video_views_daily.csv
# Phục vụ biểu đồ line (theo ngày 30/90 ngày, gộp theo tháng 12 tháng).
# Ngày kết thúc chuẩn: 2026-10-04.
# Với mỗi video, SUM(daily.views) == video.views
daily_views_data = []
daily_id = 1

end_date = datetime(2026, 10, 4)
start_date = end_date - timedelta(days=365) # 12 tháng trước (~365 ngày)

random.seed(42)

for v in videos_data:
    vid = v["id"]
    total_views = v["views"]
    created_dt = datetime.strptime(v["created_at"], "%Y-%m-%d %H:%M:%S")
    
    # Những ngày video có thể có views: từ max(created_dt.date, start_date.date) đến end_date
    actual_start = max(start_date.date(), created_dt.date())
    num_days = (end_date.date() - actual_start).days + 1
    
    if num_days <= 0:
        actual_start = end_date.date()
        num_days = 1
        
    date_list = [actual_start + timedelta(days=i) for i in range(num_days)]
    
    # Phân bổ ngẫu nhiên có trọng số (gần đây nhiều hơn hoặc ngẫu nhiên)
    weights = []
    for d in date_list:
        days_ago = (end_date.date() - d).days
        # Trọng số: 90 ngày gần đây có hoạt động đều
        if days_ago <= 90:
            w = random.uniform(2.0, 5.0)
        else:
            w = random.uniform(0.5, 2.0)
        weights.append(w)
        
    sum_w = sum(weights)
    
    # Phân bổ ban đầu dạng float
    alloc = [int(total_views * (w / sum_w)) for w in weights]
    diff = total_views - sum(alloc)
    
    # Bổ sung chênh lệch để SUM(views) đúng tuyệt đối bằng total_views
    for _ in range(abs(diff)):
        idx = random.randrange(len(alloc))
        if diff > 0:
            alloc[idx] += 1
        elif alloc[idx] > 0:
            alloc[idx] -= 1
            
    # Ghi nhận các dòng daily_views_data
    for d, cnt in zip(date_list, alloc):
        if cnt > 0:
            daily_views_data.append({
                "id": daily_id,
                "video_id": vid,
                "view_date": d.strftime("%Y-%m-%d"),
                "views": cnt
            })
            daily_id += 1

# Kiểm tra lại tính toàn vẹn views
for v in videos_data:
    v_views = sum(item["views"] for item in daily_views_data if item["video_id"] == v["id"])
    assert v_views == v["views"], f"Lệch views video {v['id']}: {v_views} != {v['views']}"

# Hàm ghi CSV có BOM
def write_csv_bom(filename, fieldnames, rows):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Recorded {filename} ({len(rows)} rows)")

# Ghi cac file
write_csv_bom("users.csv", ["id","username","email","password_hash","role","status","avatar_url","created_at","last_login_at"], users_data)
write_csv_bom("video_categories.csv", ["id","name","slug","description","created_at"], categories_data)
write_csv_bom("videos.csv", ["id","title","description","thumbnail_url","video_url","category_id","uploader_id","duration_seconds","file_size_bytes","views","status","created_at","updated_at"], videos_data)
write_csv_bom("video_views_daily.csv", ["id","video_id","view_date","views"], daily_views_data)
write_csv_bom("password_resets.csv", ["id","user_id","token","expires_at","used","created_at"], [])

print("Sample CSV data generated successfully! All views match perfectly.")
