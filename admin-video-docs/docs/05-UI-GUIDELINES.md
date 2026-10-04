# 05 – Hướng dẫn giao diện (Light mode)

Giữ phong cách trang login hiện có: nền trắng, thẻ bo góc, màu nhấn xanh dương, chữ rõ ràng.

## 1. Bảng màu (khai báo trong `css/base.css`)

```css
:root {
  /* nền */
  --bg-page: #F8FAFC;       /* nền toàn trang */
  --bg-surface: #FFFFFF;    /* thẻ, bảng, modal, sidebar */
  --bg-hover: #F1F5F9;

  /* chữ */
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;

  /* viền */
  --border: #E2E8F0;

  /* màu chính */
  --primary: #2563EB;
  --primary-hover: #1D4ED8;
  --primary-soft: #DBEAFE;

  /* trạng thái */
  --success: #16A34A;  --success-soft: #DCFCE7;
  --warning: #D97706;  --warning-soft: #FEF3C7;
  --danger:  #DC2626;  --danger-soft:  #FEE2E2;

  /* hình khối */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, .06);
  --shadow-md: 0 4px 16px rgba(15, 23, 42, .08);
}
```

Màu nhấn cho 3 thẻ Dashboard: Tổng video = `--primary`, Tổng lượt xem = `--success`, Storage = `--warning`.

Biểu đồ: cột dùng `--primary`, line dùng `--primary` với vùng tô nhạt `--primary-soft`. Lưới biểu đồ dùng `--border`.

## 2. Typography

- Font: `Inter`, dự phòng `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. Nếu dùng Google Fonts, phải có font dự phòng.
- Cỡ chữ: nội dung 14–16px; tiêu đề trang 24px/700; tiêu đề thẻ 16px/600; chú thích 12–13px.
- Số liệu lớn trên thẻ Dashboard: 28–32px/700.

## 3. Bố cục

- Sidebar: rộng 240px, nền trắng, viền phải `--border`. Dưới 900px: thu thành ngăn kéo.
- Nội dung: `max-width: 1280px`, padding 24px (mobile 16px).
- Lưới Dashboard: 3 thẻ số liệu trên 1 hàng (mobile xếp dọc); 2 biểu đồ mỗi cái chiếm 1 hàng hoặc chia 2 cột trên màn rộng.
- Khoảng cách theo bội số của 4px (4, 8, 12, 16, 24, 32).

## 4. Component

| Component | Quy định |
|---|---|
| Button chính | nền `--primary`, chữ trắng, cao 40px, bo `--radius-sm`, hover `--primary-hover` |
| Button phụ | nền trắng, viền `--border`, chữ `--text-primary` |
| Button nguy hiểm | nền `--danger` (xóa), hoặc dạng viền đỏ cho nút trong bảng |
| Input | cao 40px, viền `--border`, focus viền `--primary` + vòng sáng `--primary-soft`, lỗi viền `--danger` |
| Card | nền trắng, viền `--border`, bo `--radius-md`, đổ bóng `--shadow-sm` |
| Table | header nền `--bg-hover`, chữ in đậm cỡ 13px, dòng cao tối thiểu 56px, hover dòng `--bg-hover` |
| Badge | bo tròn, chữ 12px; ADMIN = xanh dương, USER = xám, ACTIVE/PUBLISHED = xanh lá, LOCKED/HIDDEN = đỏ, DRAFT = vàng |
| Modal | nền trắng, bo `--radius-lg`, lớp phủ `rgba(15,23,42,.4)`, rộng tối đa 560px |
| Toast | góc trên phải, viền trái 4px theo màu trạng thái |

## 5. Trạng thái giao diện
- **Đang tải:** khung skeleton xám nhạt hoặc spinner nhỏ.
- **Rỗng:** biểu tượng + dòng "Chưa có dữ liệu" + nút hành động chính.
- **Lỗi:** khung nền `--danger-soft`, chữ `--danger`, kèm gợi ý cách xử lý.

## 6. Khả năng truy cập
- Mọi input có `<label>`; nút chỉ có biểu tượng phải có `aria-label`.
- Tỷ lệ tương phản chữ/nền tối thiểu 4.5:1.
- Có `:focus-visible` rõ ràng; thao tác được bằng Tab, Enter, Esc.
- Ảnh thumbnail có `alt` là tiêu đề video.

## 7. Không làm
- Không dùng dark mode, không dùng nền màu đậm cho toàn trang.
- Không dùng quá 1 màu nhấn chính (xanh dương); màu khác chỉ để biểu thị trạng thái.
- Không dùng emoji thay biểu tượng trong giao diện chính (dùng SVG inline).
