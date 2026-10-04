/**
 * js/pages/users.js
 * Quản lý người dùng (chỉ dành cho ADMIN)
 */

import { auth, hashPassword } from '../core/auth.js';
import { db } from '../core/db.js';
import { renderLayout } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmDialog } from '../components/modal.js';
import { formatDateTime, matchesQuery, escapeHtml } from '../core/utils.js';

let currentUser = null;
let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Chỉ ADMIN mới được truy cập trang này
  currentUser = auth.requireAuth(['ADMIN']);
  if (!currentUser) return;

  renderLayout({ pageTitle: 'Quản lý Người dùng', activeNav: 'users' });

  try {
    await db.init();
    setupFilters();
    setupModals();
    loadUsers();
  } catch (err) {
    showToast('Lỗi nạp dữ liệu người dùng: ' + err.message, 'error');
  }
});

function loadUsers() {
  allUsers = db.getAll('users');
  renderUserTable();
}

function setupFilters() {
  const searchInput = document.getElementById('user-search');
  const roleFilter = document.getElementById('user-role-filter');
  const statusFilter = document.getElementById('user-status-filter');

  const onFilterChange = () => renderUserTable();

  searchInput.addEventListener('input', onFilterChange);
  roleFilter.addEventListener('change', onFilterChange);
  statusFilter.addEventListener('change', onFilterChange);
}

function renderUserTable() {
  const search = document.getElementById('user-search').value.trim();
  const role = document.getElementById('user-role-filter').value;
  const status = document.getElementById('user-status-filter').value;

  const filtered = allUsers.filter(u => {
    if (search && !matchesQuery(u.username, search) && !matchesQuery(u.email, search)) {
      return false;
    }
    if (role && u.role !== role) {
      return false;
    }
    if (status && u.status !== status) {
      return false;
    }
    return true;
  });

  const tbody = document.getElementById('user-table-body');
  const emptyState = document.getElementById('user-empty-state');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(u => {
    const isMe = u.id === currentUser.userId;
    const isLocked = u.status === 'LOCKED';
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><span class="font-medium text-muted">#${u.id}</span></td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 13px;">
            ${u.avatar_url ? `<img src="${u.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : u.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold text-primary">
              ${escapeHtml(u.username)}
              ${isMe ? '<span class="badge badge--user" style="font-size: 11px; margin-left: 4px;">Bạn</span>' : ''}
            </div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(u.email)}</td>
      <td>
        <span class="badge ${u.role === 'ADMIN' ? 'badge--admin' : 'badge--user'}">${u.role}</span>
      </td>
      <td>
        <span class="badge ${isLocked ? 'badge--locked' : 'badge--active'}">${u.status}</span>
      </td>
      <td class="text-secondary" style="font-size: 13px;">${formatDateTime(u.created_at)}</td>
      <td style="text-align: center;">
        <div style="display: inline-flex; gap: 6px;">
          <button class="btn btn--secondary btn--sm btn-edit-user" data-id="${u.id}">Sửa</button>
          <button class="btn ${isLocked ? 'btn--secondary' : 'btn--outline-danger'} btn--sm btn-toggle-lock" data-id="${u.id}" ${isMe ? 'disabled title="Không thể tự khóa tài khoản của chính mình"' : ''}>
            ${isLocked ? 'Mở khóa' : 'Khóa'}
          </button>
          <button class="btn btn--outline-danger btn--sm btn-delete-user" data-id="${u.id}" ${isMe ? 'disabled title="Không thể tự xóa tài khoản của chính mình"' : ''}>
            Xóa
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Gắn sự kiện các nút
  tbody.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', () => openEditUser(parseInt(btn.getAttribute('data-id'), 10)));
  });

  tbody.querySelectorAll('.btn-toggle-lock').forEach(btn => {
    btn.addEventListener('click', () => handleToggleLock(parseInt(btn.getAttribute('data-id'), 10)));
  });

  tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteUser(parseInt(btn.getAttribute('data-id'), 10)));
  });
}

function setupModals() {
  // Modal Thêm user
  const addModal = document.getElementById('add-user-modal');
  const btnAdd = document.getElementById('btn-add-user');
  const closeAdd = document.getElementById('add-user-close');
  const cancelAdd = document.getElementById('btn-cancel-add-user');
  const formAdd = document.getElementById('add-user-form');

  btnAdd.addEventListener('click', () => {
    formAdd.reset();
    clearAddErrors();
    openModal(addModal);
  });

  const hideAdd = () => closeModal(addModal);
  closeAdd.addEventListener('click', hideAdd);
  cancelAdd.addEventListener('click', hideAdd);
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) hideAdd();
  });

  formAdd.addEventListener('submit', handleAddUser);

  // Modal Sửa user
  const editModal = document.getElementById('edit-user-modal');
  const closeEdit = document.getElementById('edit-user-close');
  const cancelEdit = document.getElementById('btn-cancel-edit-user');
  const formEdit = document.getElementById('edit-user-form');

  const hideEdit = () => closeModal(editModal);
  closeEdit.addEventListener('click', hideEdit);
  cancelEdit.addEventListener('click', hideEdit);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) hideEdit();
  });

  formEdit.addEventListener('submit', handleSaveEditUser);
}

function clearAddErrors() {
  ['err-new-u-username', 'err-new-u-email', 'err-new-u-password'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  ['new-u-username', 'new-u-email', 'new-u-password'].forEach(id => {
    document.getElementById(id).classList.remove('has-error');
  });
}

async function handleAddUser(e) {
  e.preventDefault();
  clearAddErrors();

  const username = document.getElementById('new-u-username').value.trim();
  const email = document.getElementById('new-u-email').value.trim();
  const password = document.getElementById('new-u-password').value;
  const role = document.getElementById('new-u-role').value;
  const status = document.getElementById('new-u-status').value;

  let hasErr = false;
  if (!username || username.length < 3 || username.length > 30) {
    document.getElementById('err-new-u-username').textContent = 'Tên đăng nhập phải từ 3 đến 30 ký tự.';
    document.getElementById('new-u-username').classList.add('has-error');
    hasErr = true;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    document.getElementById('err-new-u-username').textContent = 'Chỉ gồm chữ cái, số và dấu gạch dưới (_).';
    document.getElementById('new-u-username').classList.add('has-error');
    hasErr = true;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('err-new-u-email').textContent = 'Email không đúng định dạng.';
    document.getElementById('new-u-email').classList.add('has-error');
    hasErr = true;
  }

  if (!password || password.length < 6) {
    document.getElementById('err-new-u-password').textContent = 'Mật khẩu tối thiểu 6 ký tự.';
    document.getElementById('new-u-password').classList.add('has-error');
    hasErr = true;
  }

  if (hasErr) return;

  try {
    const passwordHash = await hashPassword(password);
    db.insert('users', {
      username,
      email,
      password_hash: passwordHash,
      role,
      status,
      avatar_url: '',
      last_login_at: null
    });

    showToast('Thêm người dùng mới thành công!', 'success');
    closeModal(document.getElementById('add-user-modal'));
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditUser(id) {
  const u = db.getById('users', id);
  if (!u) return;

  const modal = document.getElementById('edit-user-modal');
  document.getElementById('edit-u-id').value = u.id;
  document.getElementById('edit-u-username').value = u.username;
  document.getElementById('edit-u-email').value = u.email;
  document.getElementById('edit-u-role').value = u.role;
  document.getElementById('edit-u-status').value = u.status;
  document.getElementById('edit-u-reset-pass').value = '';
  document.getElementById('err-edit-u-pass').textContent = '';

  openModal(modal);
}

async function handleSaveEditUser(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById('edit-u-id').value, 10);
  const role = document.getElementById('edit-u-role').value;
  const status = document.getElementById('edit-u-status').value;
  const newPass = document.getElementById('edit-u-reset-pass').value;

  const passErrEl = document.getElementById('err-edit-u-pass');
  passErrEl.textContent = '';

  const updates = { role, status };

  if (newPass) {
    if (newPass.length < 6) {
      passErrEl.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
      return;
    }
    updates.password_hash = await hashPassword(newPass);
  }

  try {
    db.update('users', id, updates);
    showToast('Cập nhật người dùng thành công!', 'success');
    closeModal(document.getElementById('edit-user-modal'));
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleToggleLock(id) {
  const u = db.getById('users', id);
  if (!u) return;

  if (u.id === currentUser.userId) {
    showToast('Bạn không thể tự khóa tài khoản của chính mình.', 'warning');
    return;
  }

  const willLock = u.status !== 'LOCKED';
  const actionText = willLock ? 'khóa' : 'mở khóa';

  const confirmed = await confirmDialog({
    title: `Xác nhận ${actionText} tài khoản`,
    message: `Bạn có chắc muốn ${actionText} người dùng "${u.username}"? ${willLock ? 'Người dùng này sẽ không thể đăng nhập vào hệ thống.' : ''}`,
    confirmText: willLock ? 'Khóa tài khoản' : 'Mở khóa',
    danger: willLock
  });

  if (confirmed) {
    try {
      db.update('users', id, { status: willLock ? 'LOCKED' : 'ACTIVE' });
      showToast(`Đã ${actionText} tài khoản ${u.username}!`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

async function handleDeleteUser(id) {
  const u = db.getById('users', id);
  if (!u) return;

  if (u.id === currentUser.userId) {
    showToast('Bạn không thể tự xóa tài khoản của chính mình.', 'warning');
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Xác nhận xóa người dùng',
    message: `Bạn có chắc muốn xóa tài khoản "${u.username}" (${u.email})? Hành động này không thể hoàn tác.`,
    confirmText: 'Xóa vĩnh viễn',
    danger: true
  });

  if (confirmed) {
    try {
      db.remove('users', id);
      showToast(`Đã xóa người dùng ${u.username}!`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}
