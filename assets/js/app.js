/*
  app.js
  Lógica front-end para: registro por iglesia, comisión y staff.
  Persistencia simple usando localStorage para prototipo.
  Bibliotecas usadas: qrcodejs (generación), html5-qrcode (escaneo en validar.html).
*/

// --- Mock Data ---
const ZONES = ['Z1','Z2','ZN2','Z3','Z4 SP','Z4 VM','Z5','Z6 F','Z6 C','Z7'];
const CHURCHES = [
  { id: 'c1', name: 'IGLESIA EL BONITO', zone: 'Z5', enabled: true },
  { id: 'c2', name: 'IGLESIA LOS PRADOS', zone: 'Z1', enabled: false },
  { id: 'c3', name: 'ALMA ROSA', zone: 'Z2', enabled: true },
  { id: 'c4', name: 'ÚLTIMO PREGÓN', zone: 'ZN2', enabled: true },
  { id: 'c5', name: 'CENTRAL LOS MINA', zone: 'Z3', enabled: true },
  { id: 'c6', name: 'UNIÓN FORCE', zone: 'Z4 SP', enabled: true },
  { id: 'c7', name: 'GETSEMANÍ CENTRAL', zone: 'Z4 VM', enabled: true },
  { id: 'c8', name: 'ALMIRANTE', zone: 'Z5', enabled: true },
  { id: 'c9', name: 'SAN LUIS', zone: 'Z5', enabled: true },
  { id: 'c10', name: 'PRADO DE LUZ', zone: 'Z5', enabled: true },
  { id: 'c11', name: 'GERIZIM', zone: 'Z5', enabled: true },
  { id: 'c12', name: 'SANTA SHEKINA', zone: 'Z5', enabled: true },
  { id: 'c13', name: 'CIUDAD JUAN BOSCH', zone: 'Z6 C', enabled: true },
  { id: 'c14', name: 'IGLESIA MONTE VERDE', zone: 'Z1', enabled: true },
  { id: 'c15', name: 'IGLESIA NUEVA VIDA', zone: 'Z1', enabled: true },
  { id: 'c16', name: 'IGLESIA SIÓN', zone: 'Z2', enabled: true },
  { id: 'c17', name: 'IGLESIA EL CALVARIO', zone: 'ZN2', enabled: false },
  { id: 'c18', name: 'IGLESIA EL REDENTOR', zone: 'Z3', enabled: true },
  { id: 'c19', name: 'IGLESIA BETEL', zone: 'Z4 SP', enabled: true },
  { id: 'c20', name: 'IGLESIA HOSANNA', zone: 'Z4 VM', enabled: true },
  { id: 'c21', name: 'IGLESIA LA ESPERANZA', zone: 'Z6 F', enabled: true },
  { id: 'c22', name: 'IGLESIA DEL CAMINO', zone: 'Z6 C', enabled: true },
  { id: 'c23', name: 'IGLESIA MADRE DE DIOS', zone: 'Z7', enabled: true },
  { id: 'c24', name: 'IGLESIA LAS FLORES', zone: 'Z7', enabled: true }
];

const COMMISSIONS = [
  { id: 'com1', name: 'Programa', members: ['Ana Perez','Juan Gomez','Luis M.','Carla R.','Pedro'], preset: true },
  { id: 'com2', name: 'Jueces', members: ['María','Carlos','Miguel','Sonia','Raúl','Irene'], preset: true },
  { id: 'com3', name: 'Comunicaciones', members: ['Elena','Tomas'], preset: true }
];

// Persistencia de registros
function loadRegistrations(){
  return JSON.parse(localStorage.getItem('camporee-registrations')||'[]');
}
function saveRegistrations(arr){
  localStorage.setItem('camporee-registrations', JSON.stringify(arr));
}
function addRegistration(reg){
  const regs = loadRegistrations();
  regs.push(reg);
  saveRegistrations(regs);
}

// Control de cupos
function churchHasSlot(churchId){
  // Regla: 1 vehículo por iglesia
  const regs = loadRegistrations();
  return !regs.some(r=>r.category==='iglesia' && r.churchId===churchId);
}

function commissionAvailable(comId){
  const commission = COMMISSIONS.find(c=>c.id===comId);
  if(!commission) return false;
  const quota = Math.max(1, Math.floor(commission.members.length/5));
  const regs = loadRegistrations();
  const used = regs.filter(r=>r.category==='comision' && r.comId===comId).length;
  return used < quota;
}

function plateExists(placa){
  const regs = loadRegistrations();
  return regs.some(r=>r.placa.toLowerCase()===placa.toLowerCase());
}

// UI helpers
const landing = document.getElementById('landing');
const formSection = document.getElementById('form-section');
const formTitle = document.getElementById('form-title');
const dynamicSteps = document.getElementById('dynamic-steps');
const regForm = document.getElementById('reg-form');
const backBtn = document.getElementById('back-btn');
const confirmSection = document.getElementById('confirm-section');
const summaryEl = document.getElementById('summary');
const qrEl = document.getElementById('qrcode');
const downloadBtn = document.getElementById('download-qr');
const newRegBtn = document.getElementById('new-reg');
const listSection = document.getElementById('list-section');
const regList = document.getElementById('reg-list');
const openListBtn = document.getElementById('open-list');
const prevBtn = document.getElementById('prev-step');
const submitBtn = document.getElementById('submit-btn');

let currentCategory = null;
let currentStep = 0;
let stepData = {};
let qrcodeInstance = null;

// Render dynamic steps per category
function openCategory(cat){
  currentCategory = cat;
  currentStep = 0;
  stepData = {};
  landing.classList.add('hidden');
  listSection.classList.add('hidden');
  confirmSection.classList.add('hidden');
  formSection.classList.remove('hidden');
  formTitle.textContent = cat==='iglesia' ? 'Registro por Iglesia' : cat==='comision' ? 'Registro por Comisión' : 'Registro de Staff';
  renderSteps();
}

function isFinalStep(){
  if(currentCategory==='iglesia') return currentStep === 2;
  if(currentCategory==='comision') return currentStep === 1;
  if(currentCategory==='staff') return true;
  return false;
}

function currentStepIsValid(){
  if(!currentCategory) return false;

  if(currentCategory==='iglesia'){
    if(currentStep===0){
      const zone = document.getElementById('zone-select')?.value || '';
      return !!zone;
    }
    if(currentStep===1){
      const churchSelect = document.getElementById('church-select');
      const churchId = churchSelect?.value || '';
      if(!churchId) return false;
      const selected = churchSelect.selectedOptions[0];
      return !!selected && !selected.disabled;
    }
    if(currentStep===2){
      const form = regForm;
      const nombre = form.nombre?.value.trim() || '';
      const apellido = form.apellido?.value.trim() || '';
      const telefono = form.telefono?.value.trim() || '';
      const placa = form.placa?.value.trim() || '';
      const feedback = document.getElementById('placa-feedback');
      if(!nombre || !apellido || !telefono || !placa){
        if(feedback) feedback.textContent = 'Complete todos los campos del formulario.';
        return false;
      }
      if(plateExists(placa)){
        if(feedback) feedback.textContent = 'Placa ya registrada en los pases activos.';
        return false;
      }
      if(feedback) feedback.textContent = '';
      return true;
    }
  }

  if(currentCategory==='comision'){
    if(currentStep===0){
      const comId = document.getElementById('com-select')?.value || '';
      if(!comId) return false;
      return commissionAvailable(comId);
    }
    if(currentStep===1){
      const member = document.getElementById('com-member')?.value.trim() || '';
      const placa = document.getElementById('com-placa')?.value.trim() || '';
      const feedback = document.getElementById('placa-feedback');
      if(!member || !placa){
        if(feedback) feedback.textContent = 'Seleccione el miembro y complete la placa.';
        return false;
      }
      if(plateExists(placa)){
        if(feedback) feedback.textContent = 'Placa ya registrada en los pases activos.';
        return false;
      }
      if(feedback) feedback.textContent = '';
      return true;
    }
  }

  if(currentCategory==='staff'){
    const form = regForm;
    const nombre = form.nombre?.value.trim() || '';
    const apellido = form.apellido?.value.trim() || '';
    const telefono = form.telefono?.value.trim() || '';
    const placa = form.placa?.value.trim() || '';
    const cargo = form.cargo?.value.trim() || '';
    const feedback = document.getElementById('placa-feedback');
    if(!nombre || !apellido || !telefono || !placa || !cargo){
      if(feedback) feedback.textContent = 'Complete todos los campos del formulario.';
      return false;
    }
    if(plateExists(placa)){
      if(feedback) feedback.textContent = 'Placa ya registrada en los pases activos.';
      return false;
    }
    if(feedback) feedback.textContent = '';
    return true;
  }

  return false;
}

function updateActionButtons(){
  const finalStep = isFinalStep();
  const canContinue = currentStepIsValid();

  prevBtn.classList.toggle('hidden', currentStep === 0);
  submitBtn.classList.remove('hidden');
  submitBtn.textContent = finalStep ? 'Generar Pase QR' : 'Siguiente';
  submitBtn.disabled = !canContinue;
  submitBtn.title = canContinue ? (finalStep ? 'Generar pase QR' : 'Continuar al siguiente paso') : 'Complete este paso para continuar';
}

function renderSteps(){
  dynamicSteps.innerHTML = '';
  if(currentCategory==='iglesia'){
    // Step 0: Zona
    if(currentStep===0){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label class="block text-sm font-medium">Seleccione Zona</label>
        <select id="zone-select" class="mt-1 block w-full rounded border p-2">
          <option value="">-- Seleccione --</option>
          ${ZONES.map(z=>`<option value="${z}">${z}</option>`).join('')}
        </select>
      `;
      dynamicSteps.appendChild(wrap);
      document.getElementById('step-note').textContent = 'Paso 1 de 3';
    }
    // Step 1: Iglesia
    if(currentStep===1){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label class="block text-sm font-medium">Seleccione Iglesia</label>
        <select id="church-select" class="mt-1 block w-full rounded border p-2">
          <option value="">-- Seleccione --</option>
          ${CHURCHES.filter(c=>c.zone===stepData.zone).map(c=>`<option value="${c.id}" data-enabled="${c.enabled}">${c.name}${c.enabled? '':' — CUPOS AGOTADOS'}</option>`).join('')}
        </select>
      `;
      dynamicSteps.appendChild(wrap);
      document.getElementById('step-note').textContent = 'Paso 2 de 3';
      // disable options visual
      setTimeout(()=>{
        document.querySelectorAll('#church-select option').forEach(opt=>{
          if(opt.dataset.enabled==='false') opt.style.color='#9CA3AF';
        });
      },0);
    }
    // Step 2: Datos
    if(currentStep===2){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label class="block text-sm">Nombre *</label>
        <input name="nombre" class="mt-1 block w-full rounded border p-2" required />
        <label class="block text-sm mt-2">Apellido *</label>
        <input name="apellido" class="mt-1 block w-full rounded border p-2" required />
        <label class="block text-sm mt-2">Teléfono *</label>
        <input name="telefono" class="mt-1 block w-full rounded border p-2" required />
        <label class="block text-sm mt-2">Placa *</label>
        <input name="placa" id="placa-input" class="mt-1 block w-full rounded border p-2" required />
        <div id="placa-feedback" class="text-sm mt-1 text-red-600"></div>
      `;
      dynamicSteps.appendChild(wrap);
      document.getElementById('step-note').textContent = 'Paso 3 de 3';
    }
  }

  if(currentCategory==='comision'){
    if(currentStep===0){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label class="block text-sm font-medium">Seleccione Comisión</label>
        <select id="com-select" class="mt-1 block w-full rounded border p-2">
          <option value="">-- Seleccione --</option>
          ${COMMISSIONS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      `;
      dynamicSteps.appendChild(wrap);
      document.getElementById('step-note').textContent = 'Paso 1 de 2';
    }
    if(currentStep===1){
      const com = COMMISSIONS.find(c=>c.id===stepData.comId);
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <label class="block text-sm font-medium">Seleccione Nombre</label>
        <select id="com-member" class="mt-1 block w-full rounded border p-2">
          <option value="">-- Seleccione --</option>
          ${com.members.map(m=>`<option value="${m}">${m}</option>`).join('')}
        </select>
        <label class="block text-sm mt-3">Placa *</label>
        <input id="com-placa" class="mt-1 block w-full rounded border p-2" required />
        <div id="placa-feedback" class="text-sm mt-1 text-red-600"></div>
      `;
      dynamicSteps.appendChild(wrap);
      document.getElementById('step-note').textContent = 'Paso 2 de 2';
    }
  }

  if(currentCategory==='staff'){
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <label class="block text-sm">Nombre *</label>
      <input name="nombre" class="mt-1 block w-full rounded border p-2" required />
      <label class="block text-sm mt-2">Apellido *</label>
      <input name="apellido" class="mt-1 block w-full rounded border p-2" required />
      <label class="block text-sm mt-2">Teléfono *</label>
      <input name="telefono" class="mt-1 block w-full rounded border p-2" required />
      <label class="block text-sm mt-2">Placa *</label>
      <input name="placa" id="placa-input" class="mt-1 block w-full rounded border p-2" required />
      <label class="block text-sm mt-2">Cargo / Rol *</label>
      <input name="cargo" class="mt-1 block w-full rounded border p-2" required />
      <div id="placa-feedback" class="text-sm mt-1 text-red-600"></div>
    `;
    dynamicSteps.appendChild(wrap);
    document.getElementById('step-note').textContent = 'Completar datos';
  }

  // Bind events for plate checking
  const placaInput = document.querySelector('#placa-input') || document.querySelector('#com-placa');
  if(placaInput){
    const fb = document.getElementById('placa-feedback');
    placaInput.addEventListener('input', ()=>{
      if(plateExists(placaInput.value.trim())) fb.textContent = 'Placa ya registrada en los pases activos.'; else fb.textContent = '';
      updateActionButtons();
    });
  }

  regForm.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', updateActionButtons);
    el.addEventListener('change', updateActionButtons);
  });

  updateActionButtons();

  // Disable church options that are not enabled or full
  const churchSelect = document.getElementById('church-select');
  if(churchSelect){
    // mark options visually and disable if not available
    Array.from(churchSelect.options).forEach(opt=>{
      const cid = opt.value;
      const c = CHURCHES.find(x=>x.id===cid);
      if(c){
        // check rule: only enabled and not already assigned
        if(!c.enabled || !churchHasSlot(c.id)){
          opt.disabled = true;
          opt.style.color = '#9CA3AF';
          opt.title = 'Cupos agotados o no disponible';
        }
      }
    });
  }
}

// Navigation
document.querySelectorAll('.category-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> openCategory(btn.dataset.type));
});
backBtn.addEventListener('click', ()=>{
  formSection.classList.add('hidden');
  landing.classList.remove('hidden');
});

regForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  if(!currentStepIsValid()){
    alert('Complete este paso antes de continuar.');
    return;
  }

  if(currentCategory==='iglesia'){
    if(currentStep===0){
      const zone = document.getElementById('zone-select').value;
      stepData.zone = zone;
      currentStep = 1; renderSteps(); return;
    }

    if(currentStep===1){
      const churchId = document.getElementById('church-select').value;
      if(!churchHasSlot(churchId)) return alert('Cupo agotado para la iglesia seleccionada.');
      stepData.churchId = churchId;
      currentStep = 2; renderSteps(); return;
    }

    const form = e.target;
    const nombre = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();
    const telefono = form.telefono.value.trim();
    const placa = form.placa.value.trim();
    const church = CHURCHES.find(c=>c.id===stepData.churchId);
    const reg = { id: 'r_'+Date.now(), category:'iglesia', nombre, apellido, telefono, placa, churchId: church.id, churchName: church.name, createdAt: new Date().toISOString(), used: false };
    addRegistration(reg);
    showConfirmation(reg);
    return;
  }

  if(currentCategory==='comision'){
    if(currentStep===0){
      const comId = document.getElementById('com-select').value;
      if(!commissionAvailable(comId)) return alert('Cupos agotados para la comisión seleccionada');
      stepData.comId = comId; currentStep=1; renderSteps(); return;
    }

    const member = document.getElementById('com-member').value.trim();
    const placa = document.getElementById('com-placa').value.trim();
    const com = COMMISSIONS.find(c=>c.id===stepData.comId);
    const reg = { id: 'r_'+Date.now(), category:'comision', nombre: member, apellido:'', telefono:'', placa, comId: com.id, comName: com.name, createdAt: new Date().toISOString(), used:false };
    addRegistration(reg);
    showConfirmation(reg);
    return;
  }

  if(currentCategory==='staff'){
    const form = e.target;
    const nombre = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();
    const telefono = form.telefono.value.trim();
    const placa = form.placa.value.trim();
    const cargo = form.cargo.value.trim();
    const reg = { id: 'r_'+Date.now(), category:'staff', nombre, apellido, telefono, placa, cargo, createdAt: new Date().toISOString(), used:false };
    addRegistration(reg);
    showConfirmation(reg);
  }
});

function showConfirmation(reg){
  formSection.classList.add('hidden');
  confirmSection.classList.remove('hidden');
  summaryEl.innerHTML = `
    <p><strong>Nombre:</strong> ${reg.nombre} ${reg.apellido}</p>
    <p><strong>Tipo:</strong> ${reg.category}</p>
    <p><strong>Placa:</strong> ${reg.placa}</p>
  `;
  // generar QR con formato: camporee|<id>
  qrEl.innerHTML = '';
  qrcodeInstance = new QRCode(qrEl, { text: `camporee|${reg.id}`, width: 200, height: 200 });
}

downloadBtn.addEventListener('click', ()=>{
  // convertir canvas o img a dataURL
  const img = qrEl.querySelector('img');
  const canvas = qrEl.querySelector('canvas');
  let src = null;
  if(img) src = img.src;
  if(canvas) src = canvas.toDataURL();
  if(!src) return alert('No hay QR para descargar');
  const a = document.createElement('a');
  a.href = src;
  a.download = 'pase-qr.png';
  a.click();
});

newRegBtn.addEventListener('click', ()=>{
  confirmSection.classList.add('hidden');
  landing.classList.remove('hidden');
});

window.openRecords = function () {
  landing.classList.add('hidden');
  formSection.classList.add('hidden');
  confirmSection.classList.add('hidden');
  listSection.classList.remove('hidden');
  renderList();
};

openListBtn.addEventListener('click', (event) => {
  if (!window.CamporeeAuth || !window.CamporeeAuth.isAdminLoggedIn()) {
    event.preventDefault();
    event.stopPropagation();
    if (window.CamporeeAuth && window.CamporeeAuth.openLogin) {
      window.CamporeeAuth.openLogin('records');
    }
    return;
  }
  window.openRecords();
});

function renderList(){
  const regs = loadRegistrations();
  if(regs.length===0){ regList.innerHTML = '<div class="text-sm text-slate-600">No hay registros activos</div>'; return; }
  regList.innerHTML = regs.map(r=>{
    return `<div class="p-2 border rounded flex items-center justify-between"><div><div class="text-sm font-semibold">${r.nombre} ${r.apellido}</div><div class="text-xs text-slate-600">${r.category} — ${r.placa}</div></div><div class="text-xs ${r.used? 'text-red-600':'text-emerald-600'}">${r.used? 'Usado':'Activo'}</div></div>`;
  }).join('');
}

// Initialize: nothing to do until user interacts, but we seed mock data into localStorage optionally
(function init(){
  if(!localStorage.getItem('camporee-registrations')) localStorage.setItem('camporee-registrations','[]');
})();

prevBtn && prevBtn.addEventListener('click', ()=>{
  if(currentCategory==='iglesia' && currentStep>0){ currentStep--; renderSteps(); }
  if(currentCategory==='comision' && currentStep>0){ currentStep--; renderSteps(); }
});

// Basic accessibility: close list when clicking outside
window.addEventListener('click', (e)=>{
  if(e.target.id==='open-list') return;
});
