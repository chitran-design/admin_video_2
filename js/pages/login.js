/**
 * js/pages/login.js
 * Logic cho trang đăng nhập
 */

import { auth } from '../core/auth.js';
import { getQueryParam } from '../core/utils.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Nếu đã đăng nhập thì tự chuyển sang dashboard
  const user = auth.currentUser();
  if (user) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Hiển thị thông báo nếu được chuyển hướng đến với thông điệp
  const msg = getQueryParam('msg');
  if (msg === 'registered') {
    showToast('Đăng ký tài khoản thành công! Vui lòng đăng nhập.', 'success');
  } else if (msg === 'password_reset') {
    showToast('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.', 'success');
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const alertBox = document.getElementById('alert-box');
  const submitBtn = document.getElementById('btn-submit');
  const togglePasswordBtn = document.getElementById('toggle-password');

  // Toggle ẩn/hiện mật khẩu
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    togglePasswordBtn.innerHTML = isPassword
      ? `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"></path></svg>`
      : `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  });

  const clearErrors = () => {
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('has-error');
    passwordInput.classList.remove('has-error');
    alertBox.style.display = 'none';
    alertBox.textContent = '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberCheckbox.checked;

    let hasClientError = false;

    if (!email) {
      emailError.textContent = 'Vui lòng nhập địa chỉ email.';
      emailInput.classList.add('has-error');
      hasClientError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Email không đúng định dạng.';
      emailInput.classList.add('has-error');
      hasClientError = true;
    }

    if (!password) {
      passwordError.textContent = 'Vui lòng nhập mật khẩu.';
      passwordInput.classList.add('has-error');
      hasClientError = true;
    }

    if (hasClientError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng nhập...';

    try {
      await auth.login(email, password, remember);

      const redirect = getQueryParam('redirect');
      if (redirect) {
        window.location.href = decodeURIComponent(redirect);
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      alertBox.className = 'alert alert--danger';
      alertBox.style.display = 'block';
      alertBox.textContent = err.message || 'Không thể đăng nhập.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Đăng nhập';
    }
  });
});
