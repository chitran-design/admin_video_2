# 07 – Bộ prompt mẫu để Vibe Coding

## Nguyên tắc
1. **Một prompt, một việc.** Chạy thử xong mới sang prompt kế tiếp.
2. Luôn cho AI biết đọc tài liệu nào trước.
3. Lỗi thì dán **nguyên văn lỗi trong Console (F12)** và nói bạn vừa làm gì.
4. Sau mỗi bước, tự hỏi: "Mình hiểu code này làm gì chưa?". Chưa hiểu thì hỏi AI giải thích từng đoạn.
5. Hoàn thành mốc nào thì tick vào `docs/06-TASKS.md`.

---

## Prompt 0 – Khởi động
```
Hãy đọc README.md, CLAUDE.md và toàn bộ thư mục docs/. Sau đó tóm tắt lại bằng tiếng Việt
trong tối đa 10 dòng: dự án làm gì, công nghệ nào, những giới hạn nào cần nhớ.
Liệt kê những điểm chưa rõ (nếu có) trước khi bắt đầu viết code. Chưa viết code ở bước này.
```

## Prompt 1 – Cấu trúc và CSS nền (M0, M1)
```
Theo README.md, hãy tạo cấu trúc thư mục dự án (các thư mục và file rỗng cần thiết).
Sau đó viết css/base.css, css/components.css, css/layout.css theo docs/05-UI-GUIDELINES.md
(light mode, biến màu, button, input, card, table, badge, modal, toast).
Tạo components-demo.html để tôi xem thử mọi component. Chỉ dùng HTML/CSS thuần.
```

## Prompt 2 – Dữ liệu mẫu CSV (M2)
```
Theo docs/03-DATABASE.md, hãy tạo 5 file CSV trong thư mục data/:
users.csv (2 tài khoản admin1, user1, mật khẩu 123456 đã băm SHA-256), video_categories.csv (5 danh mục),
videos.csv (15 video, views chênh lệch rõ), video_views_daily.csv (dữ liệu 12 tháng gần nhất,
tổng views theo ngày của mỗi video phải bằng videos.views), password_resets.csv (chỉ header).
Viết bằng một script Python nhỏ để sinh dữ liệu cho chính xác, lưu script ở tools/generate_data.py
(đây chỉ là công cụ tạo dữ liệu, không thuộc ứng dụng). Cuối cùng kiểm tra tổng views khớp nhau.
```

## Prompt 3 – Lớp dữ liệu (M2)
```
Viết js/core/csv.js và js/core/db.js theo docs/02-ARCHITECTURE.md mục 2 và 3.
Yêu cầu: parse CSV đúng khi có dấu phẩy/nháy kép/xuống dòng trong ô và có BOM; ép kiểu theo schema;
dữ liệu làm việc lưu ở localStorage; có exportCsv, importCsv, reset.
Tạo test-db.html để tôi mở Console và thử các hàm. Giải thích ngắn gọn cách tôi kiểm tra.
```

## Prompt 4 – Xác thực (M3)
```
Viết js/core/auth.js theo docs/02-ARCHITECTURE.md mục 4 và 5, sau đó làm 3 trang
login.html, register.html, forgot-password.html theo docs/04-PAGES.md mục 1–3
(giữ phong cách trang login hiện tại: thẻ trắng bo góc ở giữa, nút xanh dương).
Mỗi trang có file JS riêng trong js/pages/. Báo cho tôi cách thử 11 tình huống trong docs/06-TASKS.md.
```

## Prompt 5 – Layout chính (M4)
```
Làm sidebar và topbar dùng chung (js/components/sidebar.js) theo docs/04-PAGES.md mục 8.
Menu hiển thị theo role. Thêm requireAuth vào các trang bảo vệ. Responsive cho màn hình nhỏ.
Tạo trang dashboard.html tạm với nội dung "Xin chào, <username>" để kiểm tra layout.
```

## Prompt 6 – List Video (M5)
```
Làm videos.html và js/pages/videos.js theo docs/04-PAGES.md mục 5: bảng 5 cột (id, title, thumbnail,
views, action), tìm kiếm không phân biệt dấu, lọc, sắp xếp, phân trang 10 dòng, modal thêm/sửa,
xác nhận xóa. USER chỉ xem. Có đủ trạng thái đang tải, rỗng, lỗi.
Dùng ảnh dự phòng khi thumbnail bị lỗi.
```

## Prompt 7 – Dashboard (M6)
```
Làm dashboard.html và js/pages/dashboard.js theo docs/04-PAGES.md mục 4 và công thức ở
docs/03-DATABASE.md mục 4. Dùng Chart.js qua CDN. Gồm 3 thẻ số liệu, biểu đồ cột Top 10 video,
biểu đồ line có nút chuyển Theo ngày/Theo tháng. Nhớ destroy biểu đồ cũ khi chuyển chế độ.
Hãy in ra Console các số liệu tính được để tôi đối chiếu với file CSV.
```

## Prompt 8 – Users và Categories (M7)
```
Làm users.html và categories.html theo docs/04-PAGES.md mục 6 và 7, gồm các ràng buộc ở
docs/03-DATABASE.md mục 5. Chỉ ADMIN truy cập được; USER bị chuyển về dashboard kèm toast.
```

## Prompt 9 – Hoàn thiện (M8)
```
Thêm menu dữ liệu cho ADMIN (Import CSV, Export tất cả, Reset dữ liệu mẫu có xác nhận).
Rà soát toàn bộ dự án: lỗi Console, thông báo tiếng Việt, truy cập bằng bàn phím, tương phản màu,
code lặp lại có thể gom vào js/core/utils.js. Lập danh sách vấn đề tìm thấy, sửa, và cập nhật docs/06-TASKS.md.
```

---

## Prompt xử lý sự cố

**Gặp lỗi:**
```
Tôi vừa [làm gì]. Lỗi trong Console như sau: [dán nguyên văn].
Hãy giải thích nguyên nhân bằng tiếng Việt dễ hiểu, rồi sửa. Đừng thay đổi phần code không liên quan.
```

**Muốn hiểu code:**
```
Giải thích file js/core/db.js từng phần như cho người mới học: mỗi hàm làm gì,
dữ liệu đi từ đâu tới đâu. Cho một ví dụ chạy thử trong Console.
```

**Muốn thêm tính năng:**
```
Tôi muốn thêm [tính năng]. Trước khi viết code, hãy cho biết cần sửa những file nào,
có ảnh hưởng đến docs/03-DATABASE.md hoặc docs/04-PAGES.md không, rồi đợi tôi xác nhận.
```

## Lưu ý quan trọng khi gặp lại lỗi CORS
Nếu Console báo `Access to script ... has been blocked by CORS policy` hoặc không tải được CSV, nghĩa là bạn đang mở trang bằng `file:///`. Hãy chạy lại qua `http://localhost` (Live Server, `python -m http.server`, hoặc `npx serve`).
