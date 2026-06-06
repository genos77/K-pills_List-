const SEED = [
  "Debapriya Kalpa","Asif Siraj","Tahasin Ahmed","Jay Patel","Tejas Patel",
  "Manthan Solanki","Komal Rajput","Falguni Makwana","Makwana Nirav","Ravi Damodar",
  "Shivani Ashokkumar","Smriti Sha","Vipul Pratapgiri","Devendrakumar Yashvant",
  "Lalita Hankori","Jainil Kamal","Kishan Vyas","Shivani Pancholi","Jitesh Popat",
  "Sarika Popat","Payal Jain","Shaily Desai","Sonam Singh","Ilsa Sayed","Nisha Nupur",
  "Gulshan","Sana Shaikh","Alisher Iqbal","Usman Qamar","Hetvi Darji","Sakshi Darji",
  "Hardik Suratia","Ayushi Soni","Opali Agarwal","Aryan Dave","Pavan Patel",
  "Sapna Narotam","Heer Isvar","Nithu","Hetvi","Tanisha Sony Pereira","Niharika Rajesh",
  "Vimal","Kimal","Janvi","Jigar","Hemali","Ronil","Reshma","Dikhsil","Mitesh",
  "Cristina","Payal","Diviesh","Hritik","Parth","Aman Raheja","Saysha Shah",
  "Shubham Gupta","Vishal Kumar","Kiranjeet Riar","Mahesh","Parvati","Swati",
  "Vishvesh","Neel","Prachi Parihar","Oishi Datta","Meet Shah","Veeru","Parthbhai",
  "Mihirbhai","Rahul","Rohit","Garima","Seema Shaikh","Raffin and Masood","Kiran",
  "Bhargavi","Meet Suthar","Himani","Yakin","Pooja","Hardik","Shristi","Utsav",
  "Nandini","Harshit","Rajvi","Abhishek","Jinal","Bhumi","Parth","Bhumi","Rajan",
  "Bhaumik + 1","Ruchi","Antra","Smakshi","Harsh","Sakshi Gaikwad","Drashti",
  "Prapti","Sugandha Kapoor","Zubi","Puneet","Vishal","Dhruv","Hunny","Mahnoor",
  "Disha","Riya","Shristi Gupta","Nagina","Diyaa","Sera + 1","Dhwani","Aman Abbas",
  "Pruthvi Nayak","Vidhi Nayak","nalz_974","Arooj Nayyar","Ghaniya Manzoor","Any",
  "DJ Romil","Sonia Phalswal","DJ Voix","Mansi","Gracie","Arya","Pratik",
  "Pratham Bhatt","Tamanna Bhatt","Jothy Nagalingam","Mitul Barot","Bhavin Dixit",
  "Vanshika Patel","Ayushi Mogera","Shitansh","Shivam Kapoor","Rumi","Yamini",
  "Krisha","Karan Ghoda","Aman Patel"
];

const KEY = 'kpills-guestlist-v1';

let state = { guests: [], updated: 0 };
let filter = 'all'; // 'all' | 'in' | 'out'

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

function seedState() {
  return {
    guests: SEED.map((name, i) => ({
      id: 'seed' + i, name, walkin: false, checked: false
    })),
    updated: Date.now()
  };
}

function save() {
  state.updated = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    setSync('ok');
  } catch(e) {
    setSync('error');
    console.error('Save failed', e);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.guests)) {
        state = parsed;
        return true;
      }
    }
  } catch(e) { console.error('Load failed', e); }
  return false;
}

function setSync(s) {
  syncDot.className = '';
  if (s === 'ok') {
    syncDot.classList.add('active');
    syncText.textContent = 'saved';
  } else if (s === 'error') {
    syncDot.classList.add('error');
    syncText.textContent = 'save error';
  } else {
    syncText.textContent = 'ready';
  }
}

function updateCounter() {
  countNum.textContent = state.guests.filter(g => g.checked).length;
  totalCount.textContent = state.guests.length;
}

function toggle(id) {
  const g = state.guests.find(x => x.id === id);
  if (!g) return;
  g.checked = !g.checked;
  render();
  updateCounter();
  save();
}

function addGuest(input) {
  if (!input) return;
  const names = input.split(',').map(n => n.trim()).filter(Boolean);
  if (names.length === 0) return;
  names.forEach(name => {
    state.guests.push({ id: newId(), name, walkin: true, checked: true });
  });
  addInput.value = '';
  render();
  updateCounter();
  save();
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.innerHTML = '';
  const filtered = state.guests.filter(g => {
    if (filter === 'in' && !g.checked) return false;
    if (filter === 'out' && g.checked) return false;
    if (q && !g.name.toLowerCase().includes(q)) return false;
    return true;
  });

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

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});
addBtn.addEventListener('click', () => addGuest(addInput.value));
addInput.addEventListener('keydown', e => { if (e.key === 'Enter') addGuest(addInput.value); });

// init
if (!load()) {
  state = seedState();
  save();
}
render();
updateCounter();
setSync('ok');
