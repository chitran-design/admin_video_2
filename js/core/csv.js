/**
 * js/core/csv.js
 * Phân tích cú pháp (parse) và xuất chuỗi (stringify) chuẩn CSV (RFC 4180)
 * Hỗ trợ UTF-8 BOM, ô có dấu phẩy, nháy kép, xuống dòng.
 */

/**
 * Phân tích chuỗi CSV thành mảng các Object
 * @param {string} csvText - Nội dung file CSV
 * @returns {Array<Object>}
 */
export function parse(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  // Bỏ ký tự BOM nếu có
  let text = csvText.charCodeAt(0) === 0xFEFF ? csvText.slice(1) : csvText;

  // Chuẩn hóa xuống dòng về \n
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Thoát dấu nháy kép bên trong chuỗi "" -> "
          currentVal += '"';
          i += 2;
          continue;
        } else {
          // Đóng dấu nháy kép
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentVal += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentVal);
        currentVal = '';
        i++;
        continue;
      } else if (char === '\n') {
        currentRow.push(currentVal);
        currentVal = '';
        if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentVal += char;
        i++;
        continue;
      }
    }
  }

  // Đẩy giá trị cuối cùng nếu còn
  if (currentVal !== '' || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== '')) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  const result = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const fieldName = headers[c];
      const rawVal = row[c] !== undefined ? row[c] : '';
      obj[fieldName] = rawVal === '' ? null : rawVal;
    }
    result.push(obj);
  }

  return result;
}

/**
 * Chuyển mảng các Object thành chuỗi CSV theo chuẩn RFC 4180 kèm UTF-8 BOM
 * @param {Array<Object>} rows - Dữ liệu cần chuyển
 * @param {Array<string>} [headers] - Danh sách cột (tùy chọn)
 * @returns {string}
 */
export function stringify(rows, headers = null) {
  if (!rows || rows.length === 0) {
    if (headers && headers.length > 0) {
      return '\uFEFF' + headers.join(',') + '\r\n';
    }
    return '\uFEFF';
  }

  const cols = headers || Object.keys(rows[0]);

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    
    const str = String(val);
    // Nếu có chứa dấu phẩy, nháy kép hoặc xuống dòng -> phải bọc trong dấu nháy kép
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = cols.map(escapeCell).join(',');
  const dataLines = rows.map(row => cols.map(col => escapeCell(row[col])).join(','));

  // UTF-8 BOM ở đầu chuỗi để Excel nhận đúng tiếng Việt
  return '\uFEFF' + [headerLine, ...dataLines].join('\r\n') + '\r\n';
}
