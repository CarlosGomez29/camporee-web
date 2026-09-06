(function () {
  const ADMIN_KEY = 'camporee-admin-password';
  const ADMIN_PASSWORD = localStorage.getItem(ADMIN_KEY) || 'Camporee*2026';
  const ADMIN_SESSION_KEY = 'camporee-admin-auth';

  function getStoredPassword() {
    return localStorage.getItem(ADMIN_KEY) || 'Camporee*2026';
  }

  function isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }

  function setAdminLoggedIn(value) {
    localStorage.setItem(ADMIN_SESSION_KEY, value ? 'true' : 'false');
  }

  function closeAuthModal() {
    const modal = document.getElementById('admin-auth-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    const form = modal.querySelector('form');
    if (form) form.reset();
  }

  function showAuthModal(target) {
    const modal = document.getElementById('admin-auth-modal');
    if (!modal) return;

    const actionField = document.getElementById('auth-target');
    if (actionField) actionField.value = target || 'records';

    modal.classList.remove('hidden');
    const passwordInput = document.getElementById('admin-password');
    if (passwordInput) {
      passwordInput.focus();
      passwordInput.select();
    }
  }

  function loginWithPassword(target) {
    const passwordInput = document.getElementById('admin-password');
    const password = passwordInput ? passwordInput.value.trim() : '';
    const actualPassword = getStoredPassword();

    if (password !== actualPassword) {
      const errorEl = document.getElementById('auth-error');
      if (errorEl) {
        errorEl.textContent = 'Credenciales incorrectas.';
      }
      return false;
    }

    setAdminLoggedIn(true);
    closeAuthModal();

    if (target === 'door') {
      window.open('validar.html', '_blank');
      return true;
    }

    if (target === 'records') {
      window.open('admin.html', '_blank');
      return true;
    }

    return true;
  }

  function logoutAdmin() {
    setAdminLoggedIn(false);
    if (window.location.pathname.toLowerCase().endsWith('validar.html')) {
      window.location.href = 'index.html';
      return;
    }
    const modal = document.getElementById('admin-auth-modal');
    if (modal) modal.classList.remove('hidden');
  }

  function guardDoorPage() {
    const protect = document.getElementById('door-protected');
    if (!protect) return;

    if (!isAdminLoggedIn()) {
      protect.classList.add('hidden');
      const gate = document.getElementById('door-gate');
      if (gate) gate.classList.remove('hidden');
      const passwordInput = document.getElementById('door-password');
      if (passwordInput) passwordInput.focus();
      return;
    }

    protect.classList.remove('hidden');
    const gate = document.getElementById('door-gate');
    if (gate) gate.classList.add('hidden');
  }

  function initAuthUI() {
    const modal = document.getElementById('admin-auth-modal');
    if (!modal) return;

    const form = modal.querySelector('form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        const target = document.getElementById('auth-target')?.value || 'records';
        loginWithPassword(target);
      });
    }

    const cancel = document.getElementById('auth-cancel');
    if (cancel) {
      cancel.addEventListener('click', function () {
        closeAuthModal();
      });
    }

    const openButtons = document.querySelectorAll('[data-admin-action]');
    openButtons.forEach((button) => {
      button.addEventListener('click', function (event) {
        const target = button.dataset.adminAction || 'records';
        if (!isAdminLoggedIn()) {
          event.preventDefault();
          event.stopPropagation();
          showAuthModal(target);
          return;
        }

        if (target === 'door') {
          window.open('validar.html', '_blank');
        } else if (target === 'records') {
          window.open('admin.html', '_blank');
        }
      });
    });
  }

  window.CamporeeAuth = {
    ADMIN_PASSWORD,
    getStoredPassword,
    isAdminLoggedIn,
    setAdminLoggedIn,
    openLogin: showAuthModal,
    loginWithPassword,
    logoutAdmin,
    guardDoorPage,
    initAuthUI
  };

  document.addEventListener('DOMContentLoaded', function () {
    initAuthUI();
    guardDoorPage();
  });
})();
