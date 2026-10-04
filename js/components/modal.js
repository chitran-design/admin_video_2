/**
 * js/components/modal.js
 * Quản lý Modal và Confirm Dialog
 */

/**
 * Mở modal
 * @param {HTMLElement|string} modal 
 */
export function openModal(modal) {
  const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
  if (!el) return;

  el.classList.add('is-active');
  document.body.style.overflow = 'hidden';

  // Tự động focus vào ô input đầu tiên nếu có
  const firstInput = el.querySelector('input:not([type="hidden"]), select, textarea');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 50);
  }
}

/**
 * Đóng modal
 * @param {HTMLElement|string} modal 
 */
export function closeModal(modal) {
  const el = typeof modal === 'string' ? document.querySelector(modal) : modal;
  if (!el) return;

  el.classList.remove('is-active');
  if (!document.querySelector('.modal-overlay.is-active')) {
    document.body.style.overflow = '';
  }
}

// Lắng nghe phím Esc để đóng modal đang mở
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal-overlay.is-active');
    activeModals.forEach(m => closeModal(m));
  }
});

/**
 * Hộp thoại xác nhận có Promise
 * @param {Object} options
 * @param {string} options.title - Tiêu đề
 * @param {string} options.message - Nội dung thông báo
 * @param {string} [options.confirmText='Xác nhận'] - Nhãn nút xác nhận
 * @param {string} [options.cancelText='Hủy bỏ'] - Nhãn nút hủy
 * @param {boolean} [options.danger=false] - Nút xác nhận màu đỏ hay không
 * @returns {Promise<boolean>}
 */
export function confirmDialog({
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  danger = false
}) {
  return new Promise((resolve) => {
    let dialog = document.getElementById('global-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'global-confirm-dialog';
      dialog.className = 'modal-overlay';
      dialog.innerHTML = `
        <div class="modal-dialog" style="max-width: 440px;">
          <div class="modal-header">
            <h3 class="modal-title" id="global-confirm-title"></h3>
            <button class="modal-close" id="global-confirm-x">&times;</button>
          </div>
          <div class="modal-body">
            <p id="global-confirm-msg" class="text-secondary" style="font-size: 15px; line-height: 1.5;"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--secondary" id="global-confirm-cancel"></button>
            <button class="btn" id="global-confirm-ok"></button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    const titleEl = dialog.querySelector('#global-confirm-title');
    const msgEl = dialog.querySelector('#global-confirm-msg');
    const cancelBtn = dialog.querySelector('#global-confirm-cancel');
    const okBtn = dialog.querySelector('#global-confirm-ok');
    const xBtn = dialog.querySelector('#global-confirm-x');

    titleEl.textContent = title;
    msgEl.textContent = message;
    cancelBtn.textContent = cancelText;
    okBtn.textContent = confirmText;

    okBtn.className = danger ? 'btn btn--danger' : 'btn btn--primary';

    const cleanup = () => {
      closeModal(dialog);
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      xBtn.removeEventListener('click', onCancel);
      dialog.removeEventListener('click', onBackdrop);
    };

    const onOk = () => {
      cleanup();
      resolve(true);
    };

    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    const onBackdrop = (e) => {
      if (e.target === dialog) {
        onCancel();
      }
    };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    xBtn.addEventListener('click', onCancel);
    dialog.addEventListener('click', onBackdrop);

    openModal(dialog);
  });
}
