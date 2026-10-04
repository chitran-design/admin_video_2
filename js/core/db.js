/**
 * js/core/db.js
 * Quản lý cơ sở dữ liệu giả lập trên localStorage
 * Khởi tạo từ data/*.csv, CRUD, ràng buộc toàn vẹn, import/export CSV.
 */

import * as csv from './csv.js';

const STORAGE_PREFIX = 'vadmin:';

const TABLES = [
  'users',
  'video_categories',
  'videos',
  'video_views_daily',
  'password_resets'
];

// Định nghĩa schema để ép đúng kiểu dữ liệu
const SCHEMAS = {
  users: {
    id: 'int',
    username: 'string',
    email: 'string',
    password_hash: 'string',
    role: 'string',
    status: 'string',
    avatar_url: 'string',
    created_at: 'datetime',
    last_login_at: 'datetime'
  },
  video_categories: {
    id: 'int',
    name: 'string',
    slug: 'string',
    description: 'string',
    created_at: 'datetime'
  },
  videos: {
    id: 'int',
    title: 'string',
    description: 'string',
    thumbnail_url: 'string',
    video_url: 'string',
    category_id: 'int',
    uploader_id: 'int',
    duration_seconds: 'int',
    file_size_bytes: 'int',
    views: 'int',
    status: 'string',
    created_at: 'datetime',
    updated_at: 'datetime'
  },
  video_views_daily: {
    id: 'int',
    video_id: 'int',
    view_date: 'date',
    views: 'int'
  },
  password_resets: {
    id: 'int',
    user_id: 'int',
    token: 'string',
    expires_at: 'datetime',
    used: 'boolean',
    created_at: 'datetime'
  }
};

/**
 * Chuyển đổi giá trị theo schema của cột
 */
function castValue(val, type) {
  if (val === null || val === undefined || val === '') return null;
  switch (type) {
    case 'int':
      const n = parseInt(val, 10);
      return isNaN(n) ? null : n;
    case 'float':
      const f = parseFloat(val);
      return isNaN(f) ? null : f;
    case 'boolean':
      if (typeof val === 'boolean') return val;
      const s = String(val).trim().toUpperCase();
      return s === 'TRUE' || s === '1';
    case 'string':
    case 'datetime':
    case 'date':
    default:
      return String(val);
  }
}

/**
 * Ép kiểu một record theo schema bảng
 */
function castRecord(record, table) {
  const schema = SCHEMAS[table] || {};
  const newObj = {};
  for (const [col, type] of Object.entries(schema)) {
    newObj[col] = castValue(record[col], type);
  }
  return newObj;
}

/**
 * Lấy thời gian hiện tại chuẩn YYYY-MM-DD HH:mm:ss
 */
export function getCurrentTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const db = {
  /**
   * Khởi tạo cơ sở dữ liệu từ file CSV nếu chưa có trong localStorage
   */
  async init() {
    for (const table of TABLES) {
      const key = `${STORAGE_PREFIX}${table}`;
      if (!localStorage.getItem(key)) {
        try {
          const resp = await fetch(`data/${table}.csv`);
          if (!resp.ok) {
            throw new Error(`Không thể nạp file data/${table}.csv (mã ${resp.status}). Hãy chạy bằng http://localhost.`);
          }
          const text = await resp.text();
          const parsed = csv.parse(text);
          const typedData = parsed.map(row => castRecord(row, table));
          localStorage.setItem(key, JSON.stringify(typedData));
        } catch (err) {
          console.error(`Lỗi nạp bảng ${table}:`, err);
          // Đảm bảo không bị null crash nếu là bảng rỗng hoặc lỗi
          if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify([]));
          }
          throw err;
        }
      }
    }
  },

  /**
   * Lấy toàn bộ dữ liệu của một bảng
   * @param {string} table 
   * @returns {Array<Object>}
   */
  getAll(table) {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${table}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Lỗi đọc localStorage bảng ${table}:`, e);
      return [];
    }
  },

  /**
   * Lưu lại toàn bộ dữ liệu vào bảng
   */
  _save(table, data) {
    localStorage.setItem(`${STORAGE_PREFIX}${table}`, JSON.stringify(data));
  },

  /**
   * Lấy một bản ghi theo id
   * @param {string} table 
   * @param {number|string} id 
   * @returns {Object|null}
   */
  getById(table, id) {
    const numId = parseInt(id, 10);
    const list = this.getAll(table);
    return list.find(item => item.id === numId) || null;
  },

  /**
   * Tìm kiếm theo điều kiện predicate
   * @param {string} table 
   * @param {Function} predicate 
   * @returns {Array<Object>}
   */
  find(table, predicate) {
    const list = this.getAll(table);
    return list.filter(predicate);
  },

  /**
   * Thêm một bản ghi mới vào bảng
   * Tự tạo id = max(id)+1, gán created_at
   * @param {string} table 
   * @param {Object} record 
   * @returns {Object}
   */
  insert(table, record) {
    const list = this.getAll(table);
    const newId = list.length > 0 ? Math.max(...list.map(r => r.id || 0)) + 1 : 1;
    const now = getCurrentTimestamp();

    // Ràng buộc toàn vẹn khi insert
    if (table === 'users') {
      if (record.username && list.some(u => u.username.toLowerCase() === record.username.toLowerCase())) {
        throw new Error('Tên đăng nhập đã tồn tại.');
      }
      if (record.email && list.some(u => u.email.toLowerCase() === record.email.toLowerCase())) {
        throw new Error('Email đã được sử dụng.');
      }
    } else if (table === 'video_categories') {
      if (record.name && list.some(c => c.name.toLowerCase() === record.name.toLowerCase())) {
        throw new Error('Tên danh mục đã tồn tại.');
      }
      if (record.slug && list.some(c => c.slug.toLowerCase() === record.slug.toLowerCase())) {
        throw new Error('Slug danh mục đã tồn tại.');
      }
    }

    const newRecord = {
      ...record,
      id: newId,
      created_at: record.created_at || now
    };

    if (SCHEMAS[table]?.updated_at) {
      newRecord.updated_at = now;
    }

    const casted = castRecord(newRecord, table);
    list.push(casted);
    this._save(table, list);
    return casted;
  },

  /**
   * Cập nhật bản ghi theo id
   * @param {string} table 
   * @param {number|string} id 
   * @param {Object} updates 
   * @returns {Object}
   */
  update(table, id, updates) {
    const numId = parseInt(id, 10);
    const list = this.getAll(table);
    const index = list.findIndex(r => r.id === numId);

    if (index === -1) {
      throw new Error(`Không tìm thấy bản ghi với id ${id} trong bảng ${table}`);
    }

    // Ràng buộc toàn vẹn khi update
    if (table === 'users') {
      if (updates.username && list.some(u => u.id !== numId && u.username.toLowerCase() === updates.username.toLowerCase())) {
        throw new Error('Tên đăng nhập đã tồn tại.');
      }
      if (updates.email && list.some(u => u.id !== numId && u.email.toLowerCase() === updates.email.toLowerCase())) {
        throw new Error('Email đã được sử dụng.');
      }

      // Bảo vệ ADMIN cuối cùng
      const currentUser = list[index];
      if (currentUser.role === 'ADMIN') {
        const isDemoting = updates.role && updates.role !== 'ADMIN';
        const isLocking = updates.status && updates.status === 'LOCKED';
        if (isDemoting || isLocking) {
          const activeAdmins = list.filter(u => u.role === 'ADMIN' && u.status === 'ACTIVE');
          if (activeAdmins.length <= 1 && activeAdmins[0]?.id === numId) {
            throw new Error('Không thể khóa hoặc hạ quyền ADMIN cuối cùng của hệ thống.');
          }
        }
      }
    } else if (table === 'video_categories') {
      if (updates.name && list.some(c => c.id !== numId && c.name.toLowerCase() === updates.name.toLowerCase())) {
        throw new Error('Tên danh mục đã tồn tại.');
      }
      if (updates.slug && list.some(c => c.slug !== numId && c.slug.toLowerCase() === updates.slug.toLowerCase())) {
        throw new Error('Slug danh mục đã tồn tại.');
      }
    }

    const now = getCurrentTimestamp();
    const updatedRecord = {
      ...list[index],
      ...updates,
      id: numId // Đảm bảo không đổi id
    };

    if (SCHEMAS[table]?.updated_at) {
      updatedRecord.updated_at = now;
    }

    const casted = castRecord(updatedRecord, table);
    list[index] = casted;
    this._save(table, list);
    return casted;
  },

  /**
   * Xóa bản ghi theo id kèm kiểm tra ràng buộc toàn vẹn
   * @param {string} table 
   * @param {number|string} id 
   * @returns {boolean}
   */
  remove(table, id) {
    const numId = parseInt(id, 10);
    const list = this.getAll(table);
    const target = list.find(r => r.id === numId);

    if (!target) {
      throw new Error(`Không tìm thấy bản ghi với id ${id} trong bảng ${table}`);
    }

    // Ràng buộc toàn vẹn khi xóa
    if (table === 'video_categories') {
      const videos = this.getAll('videos');
      const count = videos.filter(v => v.category_id === numId).length;
      if (count > 0) {
        throw new Error(`Danh mục đang được sử dụng bởi ${count} video. Không thể xóa!`);
      }
    } else if (table === 'videos') {
      // Xóa các dòng video_views_daily liên quan
      const dailyList = this.getAll('video_views_daily');
      const filteredDaily = dailyList.filter(d => d.video_id !== numId);
      this._save('video_views_daily', filteredDaily);
    } else if (table === 'users') {
      // Bảo vệ ADMIN cuối cùng
      if (target.role === 'ADMIN') {
        const adminCount = list.filter(u => u.role === 'ADMIN').length;
        if (adminCount <= 1) {
          throw new Error('Không thể xóa ADMIN cuối cùng trong hệ thống.');
        }
      }
      // Kiểm tra user có video không
      const userVideos = this.find('videos', v => v.uploader_id === numId);
      if (userVideos.length > 0) {
        throw new Error(`Người dùng đang sở hữu ${userVideos.length} video. Hãy xóa hoặc chuyển video trước.`);
      }
    }

    const filtered = list.filter(r => r.id !== numId);
    this._save(table, filtered);
    return true;
  },

  /**
   * Xuất bảng ra file CSV và tải về trình duyệt
   * @param {string} table 
   */
  exportCsv(table) {
    const data = this.getAll(table);
    const schema = SCHEMAS[table];
    const headers = schema ? Object.keys(schema) : null;
    const csvContent = csv.stringify(data, headers);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${table}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Nhập dữ liệu bảng từ file CSV
   * @param {string} table 
   * @param {File} file 
   * @returns {Promise<number>} - Số bản ghi đã nhập
   */
  async importCsv(table, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const parsed = csv.parse(text);
          const typedData = parsed.map(row => castRecord(row, table));
          this._save(table, typedData);
          resolve(typedData.length);
        } catch (err) {
          reject(new Error('Lỗi cấu trúc file CSV nhập vào: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Không thể đọc file CSV đã chọn.'));
      reader.readAsText(file, 'utf-8');
    });
  },

  /**
   * Khôi phục toàn bộ dữ liệu mẫu ban đầu từ thư mục data/*.csv
   */
  async reset() {
    for (const table of TABLES) {
      localStorage.removeItem(`${STORAGE_PREFIX}${table}`);
    }
    await this.init();
  }
};
