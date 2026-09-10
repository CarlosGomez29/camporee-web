(function () {
  const ADMIN_KEY = 'camporee-admin-password';
  const ADMIN_SESSION_KEY = 'camporee-admin-auth';
  const DEFAULT_PASSWORD = 'admin';

  function getStoredPassword() {
    return localStorage.getItem(ADMIN_KEY) || DEFAULT_PASSWORD;
  }

  function setStoredPassword(value) {
    localStorage.setItem(ADMIN_KEY, value);
  }

  function getRegs() {
    return JSON.parse(localStorage.getItem('camporee-registrations') || '[]');
  }

  function saveRegs(regs) {
    localStorage.setItem('camporee-registrations', JSON.stringify(regs));
  }

  function openDoor() {
    window.open('validar.html', '_blank');
  }

  function ensureAuth() {
    if (localStorage.getItem(ADMIN_SESSION_KEY) !== 'true') {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  function renderStats() {
    const regs = getRegs();
    const cards = document.getElementById('stats-cards');
    if (!cards) return;

    const total = regs.length;
    const activos = regs.filter(r => !r.used && !r.disabled).length;
    const usados = regs.filter(r => r.used).length;
    const invalid = regs.filter(r => r.disabled).length;

    cards.innerHTML = `
      <div class="camporee-card p-4">
        <p class="eyebrow">Total</p>
        <h3 class="mt-2 text-3xl font-black">${total}</h3>
      </div>
      <div class="camporee-card p-4">
        <p class="eyebrow">Activos</p>
        <h3 class="mt-2 text-3xl font-black text-emerald-700">${activos}</h3>
      </div>
      <div class="camporee-card p-4">
        <p class="eyebrow">Usados</p>
        <h3 class="mt-2 text-3xl font-black text-amber-700">${usados}</h3>
      </div>
      <div class="camporee-card p-4">
        <p class="eyebrow">Desactivados</p>
        <h3 class="mt-2 text-3xl font-black text-red-700">${invalid}</h3>
      </div>
    `;
  }

  function renderList() {
    const tbody = document.getElementById('admin-reg-list');
    if (!tbody) return;

    const regs = getRegs();
    if (!regs.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="py-4 text-slate-500">No hay registros.</td></tr>';
      renderStats();
      return;
    }

    tbody.innerHTML = regs.map((reg) => {
      const disabled = reg.disabled ? 'Desactivado' : (reg.used ? 'Usado' : 'Activo');
      const statusClass = reg.disabled ? 'text-red-600' : (reg.used ? 'text-amber-600' : 'text-emerald-600');
      const qrText = reg.disabled ? 'IQ' : 'QR';
      return `
        <tr class="border-b border-slate-200 align-top">
          <td class="py-3 pr-3 font-mono text-xs">${reg.id}</td>
          <td class="py-3 pr-3">${reg.nombre || ''} ${reg.apellido || ''}</td>
          <td class="py-3 pr-3 capitalize">${reg.category || 'staff'}</td>
          <td class="py-3 pr-3">${reg.placa || '-'}</td>
          <td class="py-3 pr-3"><span class="font-semibold ${statusClass}">${disabled}</span></td>
          <td class="py-3 pr-3">${qrText}</td>
          <td class="py-3 pr-3">
            <div class="flex justify-end gap-2">
              <button type="button" class="secondary-btn" data-action="toggle" data-id="${reg.id}">${reg.disabled ? 'Activar' : 'Desactivar'}</button>
              <button type="button" class="primary-btn" data-action="edit" data-id="${reg.id}">Editar</button>
              <button type="button" class="secondary-btn" data-action="delete" data-id="${reg.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderStats();
  }

  function setPasswordFormMessage(message, isError = true) {
    const feedback = document.getElementById('password-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = isError ? 'min-h-[1.25rem] text-sm text-red-600' : 'min-h-[1.25rem] text-sm text-emerald-600';
  }

  function handlePasswordChange(event) {
    event.preventDefault();
    const current = document.getElementById('current-password')?.value || '';
    const next = document.getElementById('new-password')?.value || '';
    const confirm = document.getElementById('confirm-password')?.value || '';

    if (current !== getStoredPassword()) {
      setPasswordFormMessage('La contraseña actual no coincide.', true);
      return;
    }

    if (!next || next.length < 4) {
      setPasswordFormMessage('La nueva contraseña debe tener al menos 4 caracteres.', true);
      return;
    }

    if (next !== confirm) {
      setPasswordFormMessage('La confirmación no coincide.', true);
      return;
    }

    setStoredPassword(next);
    setPasswordFormMessage('Contraseña actualizada correctamente.', false);
    document.getElementById('password-form')?.reset();
  }

  function openEditModal(regId) {
    const reg = getRegs().find(r => r.id === regId);
    if (!reg) return;

    document.getElementById('edit-id').value = reg.id;
    document.getElementById('edit-nombre').value = reg.nombre || '';
    document.getElementById('edit-apellido').value = reg.apellido || '';
    document.getElementById('edit-telefono').value = reg.telefono || '';
    document.getElementById('edit-placa').value = reg.placa || '';
    document.getElementById('edit-cargo').value = reg.cargo || '';
    document.getElementById('admin-edit-modal').classList.remove('hidden');
  }

  function closeEditModal() {
    document.getElementById('admin-edit-modal').classList.add('hidden');
  }

  function handleEditSubmit(event) {
    event.preventDefault();
    const regs = getRegs();
    const id = document.getElementById('edit-id').value;
    const index = regs.findIndex(r => r.id === id);
    if (index === -1) return;

    regs[index].nombre = document.getElementById('edit-nombre').value.trim();
    regs[index].apellido = document.getElementById('edit-apellido').value.trim();
    regs[index].telefono = document.getElementById('edit-telefono').value.trim();
    regs[index].placa = document.getElementById('edit-placa').value.trim();
    regs[index].cargo = document.getElementById('edit-cargo').value.trim();

    saveRegs(regs);
    renderList();
    closeEditModal();
  }

  function deleteReg(regId) {
    const regs = getRegs().filter(r => r.id !== regId);
    saveRegs(regs);
    renderList();
  }

  function toggleReg(regId) {
    const regs = getRegs();
    const reg = regs.find(r => r.id === regId);
    if (!reg) return;
    reg.disabled = !reg.disabled;
    saveRegs(regs);
    renderList();
  }

  function attachHandlers() {
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', handlePasswordChange);
    }

    document.getElementById('open-door')?.addEventListener('click', openDoor);
    document.getElementById('close-edit-modal')?.addEventListener('click', closeEditModal);
    document.getElementById('cancel-edit')?.addEventListener('click', closeEditModal);
    document.getElementById('refresh-list')?.addEventListener('click', renderList);
    document.getElementById('logout-admin')?.addEventListener('click', () => {
      localStorage.setItem(ADMIN_SESSION_KEY, 'false');
      window.location.href = 'index.html';
    });

    document.getElementById('edit-form')?.addEventListener('submit', handleEditSubmit);

    document.getElementById('admin-reg-list')?.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const regId = button.dataset.id;
      const action = button.dataset.action;

      if (action === 'edit') openEditModal(regId);
      if (action === 'delete') deleteReg(regId);
      if (action === 'toggle') toggleReg(regId);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!ensureAuth()) return;
    attachHandlers();
    renderList();
  });
})();
