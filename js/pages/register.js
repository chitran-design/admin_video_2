/**
 * js/pages/register.js
 * Logic cho trang đăng ký tài khoản
 */

import { auth } from '../core/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  if (auth.currentUser()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('register-form');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const termsCheckbox = document.getElementById('terms-agree');

  const usernameError = document.getElementById('username-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  const termsError = document.getElementById('terms-error');
  const alertBox = document.getElementById('alert-box');
  const submitBtn = document.getElementById('btn-submit');

  const clearErrors = () => {
    [usernameError, emailError, passwordError, confirmPasswordError, termsError].forEach(el => el.textContent = '');
    [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => el.classList.remove('has-error'));
    alertBox.style.display = 'none';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    // Validate username
    if (!username || username.length < 3 || username.length > 30) {
      usernameError.textContent = 'Tên đăng nhập phải từ 3 đến 30 ký tự.';
      usernameInput.classList.add('has-error');
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameError.textContent = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).';
      usernameInput.classList.add('has-error');
      hasError = true;
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = 'Email không hợp lệ hoặc đã được sử dụng.';
      emailInput.classList.add('has-error');
      hasError = true;
    }

    // Validate password
    if (!password || password.length < 6) {
      passwordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
      passwordInput.classList.add('has-error');
      hasError = true;
    }

    // Validate confirm password
    if (confirmPassword !== password) {
      confirmPasswordError.textContent = 'Mật khẩu nhập lại không khớp.';
      confirmPasswordInput.classList.add('has-error');
      hasError = true;
    }

    // Validate terms
    if (!termsCheckbox.checked) {
      termsError.textContent = 'Vui lòng đồng ý với điều khoản sử dụng.';
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang khởi tạo tài khoản...';

    try {
      await auth.register({ username, email, password });
      window.location.href = 'login.html?msg=registered';
    } catch (err) {
      alertBox.className = 'alert alert--danger';
      alertBox.style.display = 'block';
      alertBox.textContent = err.message || 'Đăng ký không thành công.';
      
      if (err.message.includes('Tên đăng nhập')) {
        usernameError.textContent = err.message;
        usernameInput.classList.add('has-error');
      } else if (err.message.includes('Email')) {
        emailError.textContent = err.message;
        emailInput.classList.add('has-error');
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Tạo tài khoản';
    }
  });
});
