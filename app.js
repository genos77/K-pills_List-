const API = 'api.php';
const SYNC_MS = 4000;

// state model: { guests: [{id, name, walkin, checked}], updated: <ts> }
let state = { guests: [], updated: 0 };
let dirty = false;

const listEl = document.getElementById('list');
const searchEl = document.getElementById('search');
const clearBtn = document.getElementById('clear-btn');
const countNum = document.getElementById('count-num');
const totalCount = document.getElementById('total-count');
const resultCount = document.getElementById('result-count');
const emptyEl = document.getElementById('empty');
const addInput = document.getElementById('add-input');
const addBtn = document.getElementById('add-btn');
const syncDot = document.getElementById('sync-dot');
const syncText = document.getElementById('sync-text');

function newId() {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

// merge remote into local: union of guests by id, last-write-wins on checked
function mergeRemote(remote) {
  if (!remote || !Array.isArray(remote.guests)) return;
  const byId = {};
  state.guests.forEach(g => { byId[g.id] = g; });
  remote.guests.forEach(rg => {
    if (!byId[rg.id]) {
      byId[rg.id] = { ...rg };
      state.guests.push(byId[rg.id]);
    }
  });
  if ((remote.updated || 0) > (state.updated || 0)) {
    remote.guests.forEach(rg => {
      if (byId[rg.id]) byId[rg.id].checked = rg.checked;
    });
    state.updated = remote.updated;
  }
}

async function pull() {
  try {
    const r = await fetch(API, { cache: 'no-store' });
    if (!r.ok) throw new Error('http ' + r.status);
    const remote = await r.json();
    mergeRemote(remote);
    render();
    updateCounter();
    setSync('ok');
  } catch(e) {
    setSync('error');
  }
}

async function push() {
  if (!dirty) return;
  state.updated = Date.now();
  dirty = false;
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
    if (!r.ok) throw new Error('http ' + r.status);
    setSync('ok');
  } catch(e) {
    dirty = true;
    setSync('error');
    console.error('Push failed', e);
  }
}

function setSync(s) {
  syncDot.className = '';
  if (s === 'ok') {
    syncDot.classList.add('active');
    syncText.textContent = 'synced';
    setTimeout(() => { if (syncDot.classList.contains('active')) syncText.textContent = 'live'; }, 1000);
  } else if (s === 'error') {
    syncDot.classList.add('error');
    syncText.textContent = 'retrying...';
  } else {
    syncText.textContent = 'syncing...';
  }
}

function updateCounter() {
  const checkedCount = state.guests.filter(g => g.checked).length;
  countNum.textContent = checkedCount;
  totalCount.textContent = state.guests.length;
}

function toggle(id) {
  const g = state.guests.find(x => x.id === id);
  if (!g) return;
  g.checked = !g.checked;
  dirty = true;
  state.updated = Date.now();
  render();
  updateCounter();
  push();
}

function addGuest(name) {
  name = name.trim();
  if (!name) return;
  state.guests.push({ id: newId(), name, walkin: true, checked: true });
  dirty = true;
  state.updated = Date.now();
  searchEl.value = '';
  render();
  updateCounter();
  push();
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.innerHTML = '';
  const filtered = state.guests.filter(g => !q || g.name.toLowerCase().includes(q));

  clearBtn.style.display = q ? 'block' : 'none';
  resultCount.textContent = q ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : '';
  emptyEl.style.display = filtered.length === 0 ? 'block' : 'none';

  const frag = document.createDocumentFragment();
  filtered.forEach(g => {
    const row = document.createElement('div');
    row.className = 'guest-row' + (g.checked ? ' checked' : '') + (g.walkin ? ' walkin' : '');
    row.innerHTML = `
      <div class="dot">
        <svg class="checkmark" width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path d="M1 4L4.5 7.5L11 1" stroke="#0a0a0a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="guest-name"></span>
      <span class="in-badge">IN</span>
    `;
    row.querySelector('.guest-name').textContent = g.name;
    row.addEventListener('click', () => toggle(g.id));
    frag.appendChild(row);
  });
  listEl.appendChild(frag);
}

searchEl.addEventListener('input', render);
clearBtn.addEventListener('click', () => { searchEl.value = ''; render(); searchEl.focus(); });

addBtn.addEventListener('click', () => addGuest(addInput.value));
addInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { addGuest(addInput.value); addInput.value = ''; }
});

async function init() {
  setSync('syncing');
  try {
    const r = await fetch(API, { cache: 'no-store' });
    if (r.ok) {
      state = await r.json();
    }
  } catch(e) { setSync('error'); }
  render();
  updateCounter();
  setSync('ok');
  setInterval(async () => {
    await push();
    await pull();
  }, SYNC_MS);
}

init();
