/**
 * js/pages/categories.js
 * Quản lý danh mục video (chỉ dành cho ADMIN)
 */

import { auth } from '../core/auth.js';
import { db } from '../core/db.js';
import { renderLayout } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmDialog } from '../components/modal.js';
import { formatDateTime, slugify, matchesQuery, escapeHtml } from '../core/utils.js';

let allCategories = [];
let videosList = [];
let isSlugManuallyEdited = false;

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.requireAuth(['ADMIN']);
  if (!user) return;

  renderLayout({ pageTitle: 'Quản lý Danh mục', activeNav: 'categories' });

  try {
    await db.init();
    setupEvents();
    loadCategories();
  } catch (err) {
    showToast('Lỗi nạp dữ liệu danh mục: ' + err.message, 'error');
  }
});

function loadCategories() {
  allCategories = db.getAll('video_categories');
  videosList = db.getAll('videos');
  renderCategoryTable();
}

function setupEvents() {
  const searchInput = document.getElementById('cat-search');
  searchInput.addEventListener('input', () => renderCategoryTable());

  const modal = document.getElementById('category-modal');
  const addBtn = document.getElementById('btn-add-category');
  const closeBtn = document.getElementById('cat-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-cat-modal');
  const form = document.getElementById('category-form');
  const nameInput = document.getElementById('form-cat-name');
  const slugInput = document.getElementById('form-cat-slug');

  addBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-modal-title').textContent = 'Thêm danh mục mới';
    isSlugManuallyEdited = false;
    clearErrors();
    openModal(modal);
  });

  const hide = () => closeModal(modal);
  closeBtn.addEventListener('click', hide);
  cancelBtn.addEventListener('click', hide);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hide();
  });

  // Tự động sinh slug từ tên nếu người dùng chưa sửa tay
  nameInput.addEventListener('input', () => {
    if (!isSlugManuallyEdited) {
      slugInput.value = slugify(nameInput.value);
    }
  });

  slugInput.addEventListener('input', () => {
    isSlugManuallyEdited = true;
  });

  form.addEventListener('submit', handleSaveCategory);
}

function clearErrors() {
  document.getElementById('err-cat-name').textContent = '';
  document.getElementById('err-cat-slug').textContent = '';
  document.getElementById('form-cat-name').classList.remove('has-error');
  document.getElementById('form-cat-slug').classList.remove('has-error');
}

function renderCategoryTable() {
  const search = document.getElementById('cat-search').value.trim();

  const filtered = allCategories.filter(c => {
    if (search && !matchesQuery(c.name, search) && !matchesQuery(c.slug, search)) {
      return false;
    }
    return true;
  });

  const tbody = document.getElementById('category-table-body');
  const emptyState = document.getElementById('cat-empty-state');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach(c => {
    const videoCount = videosList.filter(v => v.category_id === c.id).length;
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td><span class="font-medium text-muted">#${c.id}</span></td>
      <td>
        <div class="font-semibold text-primary" style="font-size: 15px;">
          ${escapeHtml(c.name)}
        </div>
        ${c.description ? `<div class="text-muted" style="font-size: 12px; margin-top: 2px;">${escapeHtml(c.description)}</div>` : ''}
      </td>
      <td>
        <code style="background-color: var(--bg-hover); padding: 3px 8px; border-radius: 4px; font-size: 13px; color: var(--primary);">
          ${escapeHtml(c.slug)}
        </code>
      </td>
      <td style="text-align: right; font-weight: 600;">
        ${videoCount}
      </td>
      <td class="text-secondary" style="font-size: 13px;">${formatDateTime(c.created_at)}</td>
      <td style="text-align: center;">
        <div style="display: inline-flex; gap: 6px;">
          <button class="btn btn--secondary btn--sm btn-edit-cat" data-id="${c.id}">Sửa</button>
          <button class="btn btn--outline-danger btn--sm btn-delete-cat" data-id="${c.id}">Xóa</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-edit-cat').forEach(btn => {
    btn.addEventListener('click', () => openEditCategory(parseInt(btn.getAttribute('data-id'), 10)));
  });

  tbody.querySelectorAll('.btn-delete-cat').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteCategory(parseInt(btn.getAttribute('data-id'), 10)));
  });
}

function openEditCategory(id) {
  const c = db.getById('video_categories', id);
  if (!c) return;

  const modal = document.getElementById('category-modal');
  document.getElementById('cat-modal-title').textContent = `Chỉnh sửa danh mục #${c.id}`;
  document.getElementById('cat-id').value = c.id;
  document.getElementById('form-cat-name').value = c.name;
  document.getElementById('form-cat-slug').value = c.slug;
  document.getElementById('form-cat-desc').value = c.description || '';
  isSlugManuallyEdited = true;

  clearErrors();
  openModal(modal);
}

function handleSaveCategory(e) {
  e.preventDefault();
  clearErrors();

  const id = document.getElementById('cat-id').value;
  const name = document.getElementById('form-cat-name').value.trim();
  const slug = document.getElementById('form-cat-slug').value.trim();
  const desc = document.getElementById('form-cat-desc').value.trim();

  let hasErr = false;
  if (!name) {
    document.getElementById('err-cat-name').textContent = 'Vui lòng nhập tên danh mục.';
    document.getElementById('form-cat-name').classList.add('has-error');
    hasErr = true;
  }

  if (!slug) {
    document.getElementById('err-cat-slug').textContent = 'Vui lòng nhập slug danh mục.';
    document.getElementById('form-cat-slug').classList.add('has-error');
    hasErr = true;
  }

  if (hasErr) return;

  try {
    if (id) {
      db.update('video_categories', id, { name, slug, description: desc });
      showToast('Cập nhật danh mục thành công!', 'success');
    } else {
      db.insert('video_categories', { name, slug, description: desc });
      showToast('Thêm danh mục mới thành công!', 'success');
    }

    closeModal(document.getElementById('category-modal'));
    loadCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleDeleteCategory(id) {
  const c = db.getById('video_categories', id);
  if (!c) return;

  const videoCount = videosList.filter(v => v.category_id === id).length;
  if (videoCount > 0) {
    showToast(`Danh mục "${c.name}" đang được sử dụng bởi ${videoCount} video. Không thể xóa!`, 'warning');
    return;
  }

  const confirmed = await confirmDialog({
    title: 'Xác nhận xóa danh mục',
    message: `Bạn có chắc muốn xóa danh mục "${c.name}" (${c.slug})? Hành động này không thể hoàn tác.`,
    confirmText: 'Xóa danh mục',
    danger: true
  });

  if (confirmed) {
    try {
      db.remove('video_categories', id);
      showToast(`Đã xóa danh mục "${c.name}"!`, 'success');
      loadCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}
