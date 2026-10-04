/**
 * js/core/auth.js
 * Quản lý xác thực người dùng, phiên làm việc, phân quyền và mật khẩu.
 */

import { db, getCurrentTimestamp } from './db.js';

const SESSION_KEY = 'vadmin:session';
const FAILED_ATTEMPTS_KEY = 'vadmin:failed_login_attempts';
const LOCKOUT_KEY = 'vadmin:login_lockout_until';

/**
 * Băm chuỗi bằng thuật toán SHA-256 trả về chuỗi Hex 64 ký tự
 * @param {string} str 
 * @returns {Promise<string>}
 */
export async function hashPassword(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sinh chuỗi ngẫu nhiên 32 ký tự hex cho reset token
 */
function generateRandomToken() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export const auth = {
  /**
   * Đăng nhập người dùng
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} remember - Ghi nhớ đăng nhập (7 ngày)
   */
  async login(email, password, remember = false) {
    await db.init();

    // 1. Kiểm tra giới hạn số lần thử (khóa 30 giây nếu thử sai >= 5 lần)
    const lockoutUntil = sessionStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil, 10)) {
      const remainingSecs = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
      throw new Error(`Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ${remainingSecs} giây.`);
    }

    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getAll('users');
    const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    const inputHash = await hashPassword(password);

    if (!user || user.password_hash !== inputHash) {
      let attempts = parseInt(sessionStorage.getItem(FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
      sessionStorage.setItem(FAILED_ATTEMPTS_KEY, attempts.toString());

      if (attempts >= 5) {
        sessionStorage.setItem(LOCKOUT_KEY, (Date.now() + 30000).toString());
        sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
        throw new Error('Bạn đã thử quá nhiều lần. Vui lòng thử lại sau 30 giây.');
      }
      throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'LOCKED') {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // Đăng nhập thành công -> xóa đếm số lần sai
    sessionStorage.removeItem(FAILED_ATTEMPTS_KEY);
    sessionStorage.removeItem(LOCKOUT_KEY);

    // Cập nhật last_login_at
    const now = getCurrentTimestamp();
    db.update('users', user.id, { last_login_at: now });

    // Tạo phiên đăng nhập
    const durationDays = remember ? 7 : 1; // 7 ngày nếu ghi nhớ, 1 ngày nếu không
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    const sessionData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url || '',
      expiresAt
    };

    if (remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.removeItem(SESSION_KEY);
    }

    return sessionData;
  },

  /**
   * Đăng ký tài khoản mới (mặc định role = USER, status = ACTIVE)
   * @param {Object} param0 
   */
  async register({ username, email, password }) {
    await db.init();

    if (!username || username.trim().length < 3 || username.trim().length > 30) {
      throw new Error('Tên đăng nhập phải từ 3 đến 30 ký tự.');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      throw new Error('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Email không hợp lệ.');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra trùng lặp
    const users = db.getAll('users');
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error('Tên đăng nhập không hợp lệ hoặc đã tồn tại.');
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email không hợp lệ hoặc đã được sử dụng.');
    }

    const passwordHash = await hashPassword(password);

    const newUser = db.insert('users', {
      username: cleanUsername,
      email: cleanEmail,
      password_hash: passwordHash,
      role: 'USER',
      status: 'ACTIVE',
      avatar_url: '',
      last_login_at: null
    });

    return newUser;
  },

  /**
   * Lấy thông tin phiên người dùng hiện tại
   */
  currentUser() {
    let raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  /**
   * Đăng xuất hệ thống
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  },

  /**
   * Kiểm tra quyền truy cập đầu mỗi trang
   * @param {Array<string>} [allowedRoles=['ADMIN', 'USER']]
   * @returns {Object|null}
   */
  requireAuth(allowedRoles = ['ADMIN', 'USER']) {
    const user = this.currentUser();
    if (!user) {
      const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
      const search = window.location.search;
      const redirect = encodeURIComponent(currentPath + search);
      window.location.href = `login.html?redirect=${redirect}`;
      return null;
    }

    if (!allowedRoles.includes(user.role)) {
      window.location.href = 'dashboard.html?error=unauthorized';
      return null;
    }

    return user;
  },

  /**
   * Bước 1: Yêu cầu đặt lại mật khẩu (mô phỏng)
   * @param {string} email 
   */
  async requestReset(email) {
    await db.init();
    if (!email) throw new Error('Vui lòng nhập email.');

    const cleanEmail = email.trim().toLowerCase();
    const users = db.getAll('users');
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('Email không tồn tại trong hệ thống.');
    }

    const token = generateRandomToken();
    const now = new Date();
    // Hết hạn sau 15 phút
    const expiresDate = new Date(now.getTime() + 15 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    const expiresAt = `${expiresDate.getFullYear()}-${pad(expiresDate.getMonth() + 1)}-${pad(expiresDate.getDate())} ${pad(expiresDate.getHours())}:${pad(expiresDate.getMinutes())}:${pad(expiresDate.getSeconds())}`;

    db.insert('password_resets', {
      user_id: user.id,
      token,
      expires_at: expiresAt,
      used: false
    });

    return { token, email: cleanEmail };
  },

  /**
   * Bước 2: Kiểm tra token đặt lại mật khẩu
   * @param {string} token 
   */
  verifyResetToken(token) {
    if (!token) return { valid: false, message: 'Thiếu mã xác nhận.' };

    const resets = db.getAll('password_resets');
    const record = resets.find(r => r.token === token);

    if (!record) {
      return { valid: false, message: 'Liên kết không hợp lệ hoặc đã hết hạn.' };
    }

    if (record.used === true) {
      return { valid: false, message: 'Liên kết này đã được sử dụng.' };
    }

    const expTime = new Date(record.expires_at.replace(' ', 'T')).getTime();
    if (Date.now() > expTime) {
      return { valid: false, message: 'Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút).' };
    }

    return { valid: true, record };
  },

  /**
   * Bước 3: Đặt mật khẩu mới
   * @param {string} token 
   * @param {string} newPassword 
   */
  async resetPassword(token, newPassword) {
    const check = this.verifyResetToken(token);
    if (!check.valid) {
      throw new Error(check.message);
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    const record = check.record;
    const newHash = await hashPassword(newPassword);

    // Cập nhật bảng users
    db.update('users', record.user_id, {
      password_hash: newHash
    });

    // Đánh dấu used = true trong bảng password_resets
    db.update('password_resets', record.id, {
      used: true
    });

    return true;
  }
};
