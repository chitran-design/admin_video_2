# Quy tắc cho AI khi làm việc trong dự án Video Admin

## Bắt buộc đọc trước khi code
`README.md`, `docs/01-PRD.md` đến `docs/05-UI-GUIDELINES.md`. Nếu yêu cầu của người dùng mâu thuẫn với tài liệu, hãy hỏi lại và cập nhật tài liệu tương ứng.

## Ràng buộc kỹ thuật
- Chỉ dùng **HTML, CSS, JavaScript thuần**. Không React/Vue/jQuery/Bootstrap/Tailwind.
- Ngoại lệ duy nhất: **Chart.js** qua CDN.
- **Không viết code backend** (không Node server, PHP, Python server, Supabase, Firebase...).
- Database là **file CSV** trong thư mục `data/`. Đọc bằng `fetch`, ghi vào `localStorage`, xuất lại bằng nút "Export CSV".
- Dùng ES Modules (`<script type="module">`). Chạy qua `http://localhost`, không dùng `file://`.

## Quy ước code
- Giao diện và thông báo cho người dùng bằng **tiếng Việt**. Tên biến, hàm, class bằng **tiếng Anh**.
- Comment bằng tiếng Việt, ngắn gọn, giải thích "vì sao" thay vì "làm gì".
- CSS: dùng biến trong `css/base.css`, đặt tên class theo kiểu BEM đơn giản (`card`, `card__title`, `btn--primary`).
- Mỗi trang có 1 file JS riêng trong `js/pages/`. Logic dùng chung đặt trong `js/core/`.
- Không truy cập `localStorage` hoặc đọc CSV trực tiếp trong file page. Luôn đi qua `js/core/db.js`.
- Escape dữ liệu người dùng trước khi chèn vào HTML (tránh XSS): dùng `textContent` hoặc hàm `escapeHtml()`.
- Giao diện **light mode**, nền trắng, theo `docs/05-UI-GUIDELINES.md`.

## Quy trình làm việc
1. Mỗi lần chỉ làm **một việc nhỏ**, chạy được rồi mới làm tiếp.
2. Đổi cấu trúc bảng thì phải sửa `docs/03-DATABASE.md` và file CSV mẫu cùng lúc.
3. Sau mỗi bước, nói rõ: đã tạo/sửa file nào, cách kiểm tra, việc tiếp theo.
4. Không xóa hoặc ghi đè dữ liệu mẫu trong `data/` nếu người dùng không yêu cầu.
