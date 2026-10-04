/**
 * js/components/sidebar.js
 * Quản lý Sidebar, Topbar và Menu Quản lý dữ liệu cho các trang admin
 */

import { auth } from '../core/auth.js';
import { db } from '../core/db.js';
import { showToast } from './toast.js';
import { openModal, closeModal, confirmDialog } from './modal.js';
import { getQueryParam, escapeHtml } from '../core/utils.js';

export function renderLayout({ pageTitle = 'Trang quản trị', activeNav = 'dashboard' }) {
  const user = auth.currentUser();
  if (!user) return null;

  // Kiểm tra nếu bị chuyển hướng do thiếu quyền
  if (getQueryParam('error') === 'unauthorized') {
    setTimeout(() => {
      showToast('Bạn không có quyền truy cập trang này.', 'error');
    }, 150);
  }

  const isAdmin = user.role === 'ADMIN';

  // SVG Icons
  const icons = {
    dashboard: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>`,
    videos: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`,
    categories: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>`,
    users: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`,
    database: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z"></path><path d="M9 12h6m-6 4h4"></path></svg>`,
    logout: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>`,
    menu: `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>`
  };

  const navHtml = `
    <!-- Backdrop cho mobile -->
    <div id="sidebar-backdrop" class="sidebar-backdrop"></div>

    <!-- Sidebar Trái -->
    <aside id="sidebar" class="sidebar">
      <a href="dashboard.html" class="sidebar__brand">
        <img src="assets/img/logo.svg" alt="Video Admin" class="sidebar__logo">
        <span class="sidebar__title">Video Admin</span>
      </a>

      <nav class="sidebar__nav">
        <a href="dashboard.html" class="nav-item ${activeNav === 'dashboard' ? 'is-active' : ''}">
          <span class="nav-item__icon">${icons.dashboard}</span>
          <span>Dashboard</span>
        </a>

        <a href="videos.html" class="nav-item ${activeNav === 'videos' ? 'is-active' : ''}">
          <span class="nav-item__icon">${icons.videos}</span>
          <span>Quản lý Video</span>
        </a>

        ${isAdmin ? `
          <a href="categories.html" class="nav-item ${activeNav === 'categories' ? 'is-active' : ''}">
            <span class="nav-item__icon">${icons.categories}</span>
            <span>Danh mục</span>
          </a>

          <a href="users.html" class="nav-item ${activeNav === 'users' ? 'is-active' : ''}">
            <span class="nav-item__icon">${icons.users}</span>
            <span>Người dùng</span>
          </a>
        ` : ''}
      </nav>

      <div class="sidebar__footer">
        ${isAdmin ? `
          <button id="btn-data-tools" class="nav-item w-100" style="background: none; border: none; cursor: pointer;">
            <span class="nav-item__icon">${icons.database}</span>
            <span>Dữ liệu CSV</span>
          </button>
        ` : ''}
      </div>
    </aside>

    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar__left">
        <button id="mobile-toggle-btn" class="mobile-menu-btn" aria-label="Mở Menu">
          ${icons.menu}
        </button>
        <h2 class="topbar__page-title">${escapeHtml(pageTitle)}</h2>
      </div>

      <div class="topbar__right">
        <div class="user-profile">
          <div class="user-avatar">
            ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="${escapeHtml(user.username)}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : user.username.charAt(0).toUpperCase()}
          </div>
          <div class="user-info">
            <span class="user-name">${escapeHtml(user.username)}</span>
            <div>
              <span class="badge ${user.role === 'ADMIN' ? 'badge--admin' : 'badge--user'}">${user.role}</span>
            </div>
          </div>
        </div>

        <button id="btn-logout" class="btn btn--secondary btn--sm" title="Đăng xuất">
          <span>${icons.logout}</span>
          <span style="margin-left: 4px;">Đăng xuất</span>
        </button>
      </div>
    </header>

    <!-- Modal Quản lý dữ liệu CSV (Chỉ Admin) -->
    ${isAdmin ? `
      <div id="data-management-modal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Quản lý cơ sở dữ liệu (CSV)</h3>
            <button id="data-modal-close" class="modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">1. Xuất dữ liệu (Export CSV)</h4>
              <p class="text-secondary" style="font-size: 13px; margin-bottom: 10px;">
                Tải file CSV từ localStorage để lưu trữ hoặc chỉnh sửa bằng Excel (hỗ trợ tiếng Việt UTF-8 có BOM).
              </p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button class="btn btn--secondary btn--sm" data-export="videos">videos.csv</button>
                <button class="btn btn--secondary btn--sm" data-export="video_categories">categories.csv</button>
                <button class="btn btn--secondary btn--sm" data-export="users">users.csv</button>
                <button class="btn btn--secondary btn--sm" data-export="video_views_daily">daily_views.csv</button>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border); margin: 16px 0;">

            <div style="margin-bottom: 20px;">
              <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">2. Nhập dữ liệu (Import CSV)</h4>
              <p class="text-secondary" style="font-size: 13px; margin-bottom: 10px;">
                Chọn bảng cần thay thế và chọn file .csv từ máy tính:
              </p>
              <div style="display: flex; gap: 10px; align-items: center;">
                <select id="import-table-select" class="form-select" style="max-width: 180px;">
                  <option value="videos">videos</option>
                  <option value="video_categories">categories</option>
                  <option value="users">users</option>
                  <option value="video_views_daily">video_views_daily</option>
                </select>
                <input type="file" id="import-file-input" accept=".csv" style="display: none;">
                <button id="btn-trigger-import" class="btn btn--secondary btn--sm">Chọn file & Nhập</button>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border); margin: 16px 0;">

            <div>
              <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 6px; color: var(--danger);">3. Khôi phục dữ liệu gốc</h4>
              <p class="text-secondary" style="font-size: 13px; margin-bottom: 10px;">
                Xóa toàn bộ chỉnh sửa trên trình duyệt và nạp lại từ các file trong thư mục <code>data/*.csv</code>.
              </p>
              <button id="btn-reset-db" class="btn btn--outline-danger btn--sm">Reset dữ liệu mẫu</button>
            </div>
          </div>
          <div class="modal-footer">
            <button id="data-modal-done" class="btn btn--secondary">Đóng</button>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  // Render vào layout container
  const appContainer = document.getElementById('app-layout');
  if (appContainer) {
    const existingSidebar = document.getElementById('sidebar');
    if (!existingSidebar) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = navHtml;
      while (tempDiv.firstChild) {
        appContainer.insertBefore(tempDiv.firstChild, appContainer.firstChild);
      }
    }
  }

  // Đăng ký sự kiện
  setupLayoutEvents(user);

  return user;
}

function setupLayoutEvents(user) {
  // Mobile drawer toggle
  const mobileBtn = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (mobileBtn && sidebar && backdrop) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('is-open');
      backdrop.classList.toggle('is-active');
    };
    mobileBtn.addEventListener('click', toggleSidebar);
    backdrop.addEventListener('click', toggleSidebar);
  }

  // Đăng xuất
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const ok = await confirmDialog({
        title: 'Đăng xuất',
        message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
        confirmText: 'Đăng xuất',
        danger: false
      });
      if (ok) {
        auth.logout();
      }
    });
  }

  // Data Tools Modal (ADMIN)
  if (user.role === 'ADMIN') {
    const dataModal = document.getElementById('data-management-modal');
    const openDataBtn = document.getElementById('btn-data-tools');
    const closeDataBtn = document.getElementById('data-modal-close');
    const doneDataBtn = document.getElementById('data-modal-done');

    if (openDataBtn && dataModal) {
      openDataBtn.addEventListener('click', () => openModal(dataModal));
      closeDataBtn?.addEventListener('click', () => closeModal(dataModal));
      doneDataBtn?.addEventListener('click', () => closeModal(dataModal));
      dataModal.addEventListener('click', (e) => {
        if (e.target === dataModal) closeModal(dataModal);
      });

      // Export CSV buttons
      dataModal.querySelectorAll('[data-export]').forEach(btn => {
        btn.addEventListener('click', () => {
          const tbl = btn.getAttribute('data-export');
          try {
            db.exportCsv(tbl);
            showToast(`Đã xuất file ${tbl}.csv thành công!`, 'success');
          } catch (err) {
            showToast('Lỗi khi xuất file: ' + err.message, 'error');
          }
        });
      });

      // Import CSV
      const tableSelect = document.getElementById('import-table-select');
      const fileInput = document.getElementById('import-file-input');
      const triggerBtn = document.getElementById('btn-trigger-import');

      if (triggerBtn && fileInput && tableSelect) {
        triggerBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files[0];
          if (!file) return;

          const table = tableSelect.value;
          try {
            const count = await db.importCsv(table, file);
            showToast(`Nhập dữ liệu thành công! Đã nạp ${count} dòng vào bảng ${table}.`, 'success');
            setTimeout(() => window.location.reload(), 1000);
          } catch (err) {
            showToast(err.message, 'error');
          } finally {
            fileInput.value = '';
          }
        });
      }

      // Reset DB
      const resetBtn = document.getElementById('btn-reset-db');
      if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
          const confirmed = await confirmDialog({
            title: 'Khôi phục dữ liệu mẫu',
            message: 'Toàn bộ dữ liệu bạn đã thêm, sửa, xóa trên trình duyệt sẽ bị xóa và thay thế bằng dữ liệu gốc từ thư mục data/*. Bạn có muốn tiếp tục?',
            confirmText: 'Khôi phục dữ liệu gốc',
            danger: true
          });

          if (confirmed) {
            try {
              await db.reset();
              showToast('Khôi phục dữ liệu mẫu thành công!', 'success');
              setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
              showToast('Lỗi reset dữ liệu: ' + err.message, 'error');
            }
          }
        });
      }
    }
  }
}
