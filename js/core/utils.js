/**
 * js/core/utils.js
 * Các hàm tiện ích dùng chung trong toàn bộ ứng dụng
 */

/**
 * Thoát các ký tự đặc biệt trong HTML để ngăn chặn tấn công XSS
 * @param {string|any} str 
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (kiểu Việt Nam: 15.420)
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Định dạng rút gọn số lượt xem (vd 1,2M hoặc 15,4K)
 * @param {number} num 
 * @returns {string}
 */
export function formatViewsCompact(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1).replace('.', ',');
    return `${val}M`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(1).replace('.', ',');
    return `${val}K`;
  }
  return formatNumber(num);
}

/**
 * Định dạng dung lượng lưu trữ (KB, MB, GB theo hệ 1024, làm tròn 2 chữ số)
 * @param {number} bytes 
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i]}`;
}

/**
 * Chuyển đổi giây sang định dạng MM:SS hoặc HH:MM:SS
 * @param {number} totalSeconds 
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Định dạng ngày giờ: YYYY-MM-DD HH:mm:ss -> DD/MM/YYYY HH:mm
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Định dạng ngày: YYYY-MM-DD -> DD/MM/YYYY
 * @param {string} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Chuyển đổi chuỗi tiếng Việt thành slug (không dấu, cách bằng '-')
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Phân tách dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng '-'
    .replace(/-+/g, '-'); // Tránh nhiều dấu '-' liền nhau
}

/**
 * Tìm kiếm không phân biệt dấu và chữ hoa thường
 * @param {string} text 
 * @param {string} query 
 * @returns {boolean}
 */
export function matchesQuery(text, query) {
  if (!query) return true;
  if (!text) return false;
  
  const normalize = (s) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

  return normalize(text).includes(normalize(query));
}

/**
 * Lấy giá trị tham số URL Query
 * @param {string} name 
 * @returns {string|null}
 */
export function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
