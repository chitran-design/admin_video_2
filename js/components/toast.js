/**
 * js/components/toast.js
 * Quản lý thông báo Toast góc trên bên phải
 */

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.getElementById('toast-root');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-root';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

/**
 * Hiển thị thông báo Toast
 * @param {string} message - Nội dung thông báo (tiếng Việt)
 * @param {'success'|'error'|'warning'|'info'} type - Loại thông báo
 * @param {number} duration - Thời gian hiển thị (ms), mặc định 3000
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');

  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast__icon';
  iconSpan.textContent = ICONS[type] || 'ℹ';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'toast__content';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'toast__message';
  msgDiv.textContent = message; // An toàn chống XSS
  contentDiv.appendChild(msgDiv);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast__close';
  closeBtn.setAttribute('aria-label', 'Đóng');
  closeBtn.innerHTML = '&times;';

  toast.appendChild(iconSpan);
  toast.appendChild(contentDiv);
  toast.appendChild(closeBtn);

  const removeToast = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 200);
  };

  closeBtn.addEventListener('click', removeToast);

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }

  return toast;
}
