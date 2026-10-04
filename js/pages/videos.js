/**
 * js/pages/videos.js
 * Quản lý danh sách video (5 cột), tìm kiếm không dấu, lọc, phân trang, thêm/sửa/xóa
 */

import { auth } from '../core/auth.js';
import { db } from '../core/db.js';
import { renderLayout } from '../components/sidebar.js';
import { showToast } from '../components/toast.js';
import { openModal, closeModal, confirmDialog } from '../components/modal.js';
import { formatNumber, matchesQuery, escapeHtml } from '../core/utils.js';

let currentUser = null;
let currentPage = 1;
const PAGE_SIZE = 10;

let currentVideos = [];
let filteredVideos = [];
let categoriesMap = {};

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = auth.requireAuth(['ADMIN', 'USER']);
  if (!currentUser) return;

  renderLayout({ pageTitle: 'Quản lý Video', activeNav: 'videos' });

  const isAdmin = currentUser.role === 'ADMIN';

  // Hiển thị nút hành động cho ADMIN
  if (isAdmin) {
    document.getElementById('admin-actions').style.display = 'flex';
  } else {
    // Ẩn cột Action với USER
    document.getElementById('th-action').style.display = 'none';
  }

  try {
    await db.init();
    loadCategories();
    setupFilters();
    setupModalEvents();
    loadVideos();
  } catch (err) {
    showToast('Lỗi khi nạp dữ liệu video: ' + err.message, 'error');
  }
});

function loadCategories() {
  const cats = db.getAll('video_categories');
  const catSelectFilter = document.getElementById('filter-category');
  const catSelectForm = document.getElementById('form-video-category');

  categoriesMap = {};
  cats.forEach(c => {
    categoriesMap[c.id] = c.name;
  });

  // Đổ vào bộ lọc
  catSelectFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
    cats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  // Đổ vào form modal
  catSelectForm.innerHTML = '<option value="">-- Chọn danh mục --</option>' +
    cats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function loadVideos() {
  currentVideos = db.getAll('videos');
  applyFiltersAndPagination();
}

function setupFilters() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('filter-category');
  const statusFilter = document.getElementById('filter-status');
  const sortSelect = document.getElementById('sort-select');
  const exportBtn = document.getElementById('btn-export-csv');

  const onFilterChange = () => {
    currentPage = 1;
    applyFiltersAndPagination();
  };

  searchInput.addEventListener('input', onFilterChange);
  categoryFilter.addEventListener('change', onFilterChange);
  statusFilter.addEventListener('change', onFilterChange);
  sortSelect.addEventListener('change', onFilterChange);

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      try {
        db.exportCsv('videos');
        showToast('Đã tải xuống file videos.csv!', 'success');
      } catch (err) {
        showToast('Lỗi xuất file: ' + err.message, 'error');
      }
    });
  }
}

function applyFiltersAndPagination() {
  const search = document.getElementById('search-input').value.trim();
  const catId = document.getElementById('filter-category').value;
  const status = document.getElementById('filter-status').value;
  const sort = document.getElementById('sort-select').value;

  // Lọc
  filteredVideos = currentVideos.filter(v => {
    // 1. Tìm kiếm theo tiêu đề (không phân biệt dấu hoa thường)
    if (search && !matchesQuery(v.title, search)) {
      return false;
    }
    // 2. Lọc danh mục
    if (catId && v.category_id !== parseInt(catId, 10)) {
      return false;
    }
    // 3. Lọc trạng thái
    if (status && v.status !== status) {
      return false;
    }
    return true;
  });

  // Sắp xếp
  filteredVideos.sort((a, b) => {
    switch (sort) {
      case 'newest':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      case 'oldest':
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      case 'views-desc':
        return (b.views || 0) - (a.views || 0);
      case 'views-asc':
        return (a.views || 0) - (b.views || 0);
      case 'title-az':
        return (a.title || '').localeCompare(b.title || '', 'vi');
      default:
        return 0;
    }
  });

  renderTable();
  renderPagination();
}

function renderTable() {
  const tbody = document.getElementById('video-table-body');
  const emptyState = document.getElementById('table-empty-state');
  const isAdmin = currentUser && currentUser.role === 'ADMIN';

  tbody.innerHTML = '';

  if (filteredVideos.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filteredVideos.slice(startIndex, startIndex + PAGE_SIZE);

  pageItems.forEach(v => {
    const tr = document.createElement('tr');

    const catName = categoriesMap[v.category_id] || 'Chưa phân loại';
    const statusClass = v.status === 'PUBLISHED' ? 'badge--published' : (v.status === 'DRAFT' ? 'badge--draft' : 'badge--hidden');
    const thumbUrl = v.thumbnail_url || 'assets/img/thumb-placeholder.jpg';

    tr.innerHTML = `
      <td><span class="font-medium text-muted">#${v.id}</span></td>
      <td>
        <img src="${escapeHtml(thumbUrl)}" 
             alt="${escapeHtml(v.title)}" 
             class="table-thumbnail" 
             loading="lazy"
             onerror="this.src='assets/img/thumb-placeholder.jpg'">
      </td>
      <td>
        <div class="line-clamp-2 font-medium" style="font-size: 15px; margin-bottom: 4px;" title="${escapeHtml(v.title)}">
          ${escapeHtml(v.title)}
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="badge ${statusClass}">${v.status}</span>
          <span class="text-muted" style="font-size: 12px;">${escapeHtml(catName)}</span>
        </div>
      </td>
      <td style="text-align: right; font-weight: 600;">
        ${formatNumber(v.views || 0)}
      </td>
      ${isAdmin ? `
        <td style="text-align: center;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn--secondary btn--sm btn-edit" data-id="${v.id}" title="Chỉnh sửa">
              Sửa
            </button>
            <button class="btn btn--outline-danger btn--sm btn-delete" data-id="${v.id}" title="Xóa video">
              Xóa
            </button>
          </div>
        </td>
      ` : ''}
    `;

    tbody.appendChild(tr);
  });

  // Gắn sự kiện cho các nút Edit & Delete
  if (isAdmin) {
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        openEditVideoModal(id);
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'), 10);
        handleDeleteVideo(id);
      });
    });
  }
}

function renderPagination() {
  const total = filteredVideos.length;
  const paginationInfo = document.getElementById('pagination-info');
  const paginationControls = document.getElementById('pagination-controls');

  if (total === 0) {
    paginationInfo.textContent = 'Hiển thị 0 trên 0 video';
    paginationControls.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, total);

  paginationInfo.textContent = `Hiển thị ${start}–${end} trên ${total} video`;

  let controlsHtml = `
    <button class="pagination__btn" id="pg-prev" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Trước</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    controlsHtml += `
      <button class="pagination__btn ${i === currentPage ? 'is-active' : ''}" data-page="${i}">${i}</button>
    `;
  }

  controlsHtml += `
    <button class="pagination__btn" id="pg-next" ${currentPage === totalPages ? 'disabled' : ''}>Tiếp &raquo;</button>
  `;

  paginationControls.innerHTML = controlsHtml;

  // Lắng nghe sự kiện bấm trang
  document.getElementById('pg-prev')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
      renderPagination();
    }
  });

  document.getElementById('pg-next')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
      renderPagination();
    }
  });

  paginationControls.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.getAttribute('data-page'), 10);
      renderTable();
      renderPagination();
    });
  });
}

function setupModalEvents() {
  const modal = document.getElementById('video-modal');
  const addBtn = document.getElementById('btn-add-video');
  const closeBtn = document.getElementById('video-modal-close');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const form = document.getElementById('video-form');
  const thumbInput = document.getElementById('form-video-thumb');
  const thumbPreview = document.getElementById('thumb-preview');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openAddVideoModal();
    });
  }

  const hide = () => closeModal(modal);
  closeBtn?.addEventListener('click', hide);
  cancelBtn?.addEventListener('click', hide);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hide();
  });

  // Xem trước thumbnail ngay khi gõ
  thumbInput.addEventListener('input', () => {
    const val = thumbInput.value.trim();
    thumbPreview.src = val || 'assets/img/thumb-placeholder.jpg';
  });
  thumbPreview.onerror = () => {
    thumbPreview.src = 'assets/img/thumb-placeholder.jpg';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    handleSaveVideo();
  });
}

function openAddVideoModal() {
  const modal = document.getElementById('video-modal');
  const modalTitle = document.getElementById('video-modal-title');
  const form = document.getElementById('video-form');
  const viewsGroup = document.getElementById('form-group-views');
  const thumbPreview = document.getElementById('thumb-preview');

  modalTitle.textContent = 'Thêm video mới';
  form.reset();
  document.getElementById('video-id').value = '';
  document.getElementById('form-video-status').value = 'PUBLISHED';
  viewsGroup.style.display = 'none';
  thumbPreview.src = 'assets/img/thumb-placeholder.jpg';

  clearModalErrors();
  openModal(modal);
}

function openEditVideoModal(id) {
  const v = db.getById('videos', id);
  if (!v) {
    showToast('Không tìm thấy thông tin video.', 'error');
    return;
  }

  const modal = document.getElementById('video-modal');
  const modalTitle = document.getElementById('video-modal-title');
  const viewsGroup = document.getElementById('form-group-views');
  const thumbPreview = document.getElementById('thumb-preview');

  modalTitle.textContent = `Chỉnh sửa video #${v.id}`;
  clearModalErrors();

  document.getElementById('video-id').value = v.id;
  document.getElementById('form-video-title').value = v.title || '';
  document.getElementById('form-video-category').value = v.category_id || '';
  document.getElementById('form-video-status').value = v.status || 'PUBLISHED';
  document.getElementById('form-video-desc').value = v.description || '';
  document.getElementById('form-video-thumb').value = v.thumbnail_url || '';
  document.getElementById('form-video-url').value = v.video_url || '';
  document.getElementById('form-video-duration').value = v.duration_seconds || '';
  
  // Quy đổi bytes ra MB
  const mb = v.file_size_bytes ? (v.file_size_bytes / (1024 * 1024)).toFixed(1) : '';
  document.getElementById('form-video-size-mb').value = mb;

  // Lượt xem
  viewsGroup.style.display = 'block';
  document.getElementById('form-video-views').value = v.views || 0;

  thumbPreview.src = v.thumbnail_url || 'assets/img/thumb-placeholder.jpg';

  openModal(modal);
}

function clearModalErrors() {
  document.getElementById('err-video-title').textContent = '';
  document.getElementById('err-video-category').textContent = '';
  document.getElementById('form-video-title').classList.remove('has-error');
  document.getElementById('form-video-category').classList.remove('has-error');
}

function handleSaveVideo() {
  clearModalErrors();

  const id = document.getElementById('video-id').value;
  const title = document.getElementById('form-video-title').value.trim();
  const categoryId = document.getElementById('form-video-category').value;
  const status = document.getElementById('form-video-status').value;
  const desc = document.getElementById('form-video-desc').value.trim();
  const thumbUrl = document.getElementById('form-video-thumb').value.trim();
  const videoUrl = document.getElementById('form-video-url').value.trim();
  const duration = parseInt(document.getElementById('form-video-duration').value, 10) || 0;
  const sizeMb = parseFloat(document.getElementById('form-video-size-mb').value) || 0;
  const fileSizeBytes = Math.round(sizeMb * 1024 * 1024);

  let hasErr = false;
  if (!title || title.length < 3 || title.length > 150) {
    document.getElementById('err-video-title').textContent = 'Tiêu đề phải từ 3 đến 150 ký tự.';
    document.getElementById('form-video-title').classList.add('has-error');
    hasErr = true;
  }

  if (!categoryId) {
    document.getElementById('err-video-category').textContent = 'Vui lòng chọn danh mục.';
    document.getElementById('form-video-category').classList.add('has-error');
    hasErr = true;
  }

  if (hasErr) return;

  const recordData = {
    title,
    description: desc,
    thumbnail_url: thumbUrl,
    video_url: videoUrl,
    category_id: parseInt(categoryId, 10),
    uploader_id: currentUser ? currentUser.userId : 1,
    duration_seconds: duration,
    file_size_bytes: fileSizeBytes,
    status
  };

  try {
    if (id) {
      // Sửa video
      const views = parseInt(document.getElementById('form-video-views').value, 10);
      recordData.views = isNaN(views) ? 0 : views;
      db.update('videos', id, recordData);
      showToast('Cập nhật thông tin video thành công!', 'success');
    } else {
      // Thêm video mới
      recordData.views = 0;
      db.insert('videos', recordData);
      showToast('Thêm video mới thành công!', 'success');
    }

    closeModal(document.getElementById('video-modal'));
    loadVideos();
  } catch (err) {
    showToast('Lỗi khi lưu video: ' + err.message, 'error');
  }
}

async function handleDeleteVideo(id) {
  const v = db.getById('videos', id);
  if (!v) return;

  const confirmed = await confirmDialog({
    title: 'Xác nhận xóa video',
    message: `Bạn có chắc muốn xóa video "${v.title}"? Toàn bộ thống kê lượt xem của video này cũng sẽ bị xóa. Hành động này không thể hoàn tác.`,
    confirmText: 'Xóa vĩnh viễn',
    danger: true
  });

  if (confirmed) {
    try {
      db.remove('videos', id);
      showToast('Đã xóa video thành công!', 'success');
      loadVideos();
    } catch (err) {
      showToast('Lỗi khi xóa video: ' + err.message, 'error');
    }
  }
}
