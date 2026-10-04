/**
 * js/pages/forgot-password.js
 * Logic cho quy trình khôi phục mật khẩu 3 bước
 */

import { auth } from '../core/auth.js';
import { getQueryParam } from '../core/utils.js';
import { showToast } from '../components/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = getQueryParam('token');

  const pageTitle = document.getElementById('page-title');
  const pageDesc = document.getElementById('page-desc');
  const stepRequest = document.getElementById('step-request');
  const stepReset = document.getElementById('step-reset');
  const alertBox = document.getElementById('alert-box');

  const requestForm = document.getElementById('request-form');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  const btnRequest = document.getElementById('btn-request');
  const simEmailBox = document.getElementById('simulated-email-box');
  const resetLinkBtn = document.getElementById('reset-link-btn');

  const resetForm = document.getElementById('reset-form');
  const newPasswordInput = document.getElementById('new-password');
  const confirmNewPasswordInput = document.getElementById('confirm-new-password');
  const newPasswordError = document.getElementById('new-password-error');
  const confirmNewPasswordError = document.getElementById('confirm-new-password-error');
  const btnSavePassword = document.getElementById('btn-save-password');

  // Nếu có token trên URL: chuyển sang chế độ đặt lại mật khẩu
  if (token) {
    const check = auth.verifyResetToken(token);
    if (!check.valid) {
      stepRequest.style.display = 'none';
      stepReset.style.display = 'none';
      alertBox.className = 'alert alert--danger';
      alertBox.style.display = 'block';
      alertBox.textContent = check.message || 'Liên kết không hợp lệ hoặc đã hết hạn.';
      return;
    }

    // Token hợp lệ
    stepRequest.style.display = 'none';
    stepReset.style.display = 'block';
    pageTitle.textContent = 'Đặt lại mật khẩu';
    pageDesc.textContent = 'Nhập mật khẩu mới cho tài khoản của bạn';

    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      newPasswordError.textContent = '';
      confirmNewPasswordError.textContent = '';
      newPasswordInput.classList.remove('has-error');
      confirmNewPasswordInput.classList.remove('has-error');
      alertBox.style.display = 'none';

      const newPass = newPasswordInput.value;
      const confirmPass = confirmNewPasswordInput.value;

      let hasErr = false;
      if (!newPass || newPass.length < 6) {
        newPasswordError.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
        newPasswordInput.classList.add('has-error');
        hasErr = true;
      }
      if (newPass !== confirmPass) {
        confirmNewPasswordError.textContent = 'Mật khẩu nhập lại không khớp.';
        confirmNewPasswordInput.classList.add('has-error');
        hasErr = true;
      }

      if (hasErr) return;

      btnSavePassword.disabled = true;
      btnSavePassword.textContent = 'Đang lưu mật khẩu...';

      try {
        await auth.resetPassword(token, newPass);
        window.location.href = 'login.html?msg=password_reset';
      } catch (err) {
        alertBox.className = 'alert alert--danger';
        alertBox.style.display = 'block';
        alertBox.textContent = err.message || 'Không thể đặt lại mật khẩu.';
        btnSavePassword.disabled = false;
        btnSavePassword.textContent = 'Lưu mật khẩu mới';
      }
    });

  } else {
    // Chế độ yêu cầu gửi link (Bước 1)
    stepRequest.style.display = 'block';
    stepReset.style.display = 'none';

    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      emailError.textContent = '';
      emailInput.classList.remove('has-error');
      alertBox.style.display = 'none';

      const email = emailInput.value.trim();
      if (!email) {
        emailError.textContent = 'Vui lòng nhập địa chỉ email.';
        emailInput.classList.add('has-error');
        return;
      }

      btnRequest.disabled = true;
      btnRequest.textContent = 'Đang xử lý...';

      try {
        const res = await auth.requestReset(email);
        btnRequest.style.display = 'none';
        emailInput.disabled = true;

        // Hiển thị khung giả lập email
        const targetUrl = `forgot-password.html?token=${res.token}`;
        resetLinkBtn.href = targetUrl;
        simEmailBox.style.display = 'block';

        showToast('Đã tạo liên kết đặt lại mật khẩu.', 'info');
      } catch (err) {
        alertBox.className = 'alert alert--danger';
        alertBox.style.display = 'block';
        alertBox.textContent = err.message || 'Không thể tạo yêu cầu đặt lại mật khẩu.';
        btnRequest.disabled = false;
        btnRequest.textContent = 'Gửi liên kết đặt lại mật khẩu';
      }
    });
  }
});
