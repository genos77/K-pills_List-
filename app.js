import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

const SEED = [
  "Debapriya kalpa","Asif siraj","Tahasin Ahmed","Jay patel","Tejas patel",
  "Manthan solanki","Komal Rajput","Falguni Makwana","Makwana Nirav","Ravi damodar",
  "Shivani Ashokkumar","Smriti sha","Vipul pratapgiri","Devendrakumar yashvant",
  "Lalita hankori","Jainil kamal","Kishan Vyas","Shivani Pancholi","Jitesh popat",
  "Sarika popat","Payal Jain","Shaily desai","Sonam singh","Ilsa sayed","Nisha nupur",
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
  "Pratham bhatt","Tamanna bhatt","Jothy Nagalingam","Mitul Barot","Bhavin Dixit",
  "Vanshika Patel","Ayushi Mogera","Shitansh","Shivam kapoor","Rumi","Yamini",
  "Krisha","Karan Ghoda","Aman Patel","Amrita","Zeel bhavsar","raj bhavsar",
  "dhrutii sharma","reetal patel","harry patel","parth rana","rajvi rana",
  "shivani vyas","dhrumil vora","Smita Parmar","Parshwa Bhatt","Laksh Sharma",
  "Taran Boodhoo","Shereen maan","Jasleen maan","Dhruv saroha","Iffat Ahmed",
  "Nafisa Tanjeem","Masum Ahmed","Nahid hk","Arif Hasan","DJ Keval",
  "Krishnika Kapoor","Pratap","DJ Ronak","Mohit chandila","Dev rana","Sarthak",
  "Vedika","GL","Anshu","Keval Bhutiya","Shivani Kambariya","Prarthit kumar",
  "Harsh jiyani","Yuvraj Gaur","Chandan Nayak","Riyaa bodiwala + 1","Naaju shah"
];

let guests = [];
let filter = 'all';

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
const errorBanner = document.getElementById('error-banner');

function showError(msg) {
  errorBanner.textContent = 'ERROR: ' + msg;
  errorBanner.classList.add('show');
  console.error(msg);
}

function newId() {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
}

function setSync(s) {
  syncDot.className = '';
  if (s === 'ok')      { syncDot.classList.add('active'); syncText.textContent = 'live'; }
  else if (s === 'error') { syncDot.classList.add('error');  syncText.textContent = 'offline'; }
  else                  { syncText.textContent = 'syncing...'; }
}

function updateCounter() {
  countNum.textContent = guests.filter(g => g.checked).length;
  totalCount.textContent = guests.length;
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.innerHTML = '';
  const filtered = guests.filter(g => {
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
          <path d="M1 4L4.5 7.5L11 1" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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

// ------- Supabase wiring -------
let sb = null;

async function toggle(id) {
  const g = guests.find(x => x.id === id);
  if (!g) return;
  const next = !g.checked;
  g.checked = next;          // optimistic
  render(); updateCounter();
  const { error } = await sb.from('guests').update({ checked: next }).eq('id', id);
  if (error) {
    g.checked = !next; render(); updateCounter(); setSync('error');
    console.error('toggle failed', error);
  }
}

async function addGuest(input) {
  if (!input) return;
  const names = input.split(',').map(n => n.trim()).filter(Boolean);
  if (names.length === 0) return;
  addInput.value = '';
  const rows = names.map(name => ({
    id: newId(), name, walkin: true, checked: true
  }));
  rows.forEach(r => { if (!guests.find(g => g.id === r.id)) guests.push(r); });
  render(); updateCounter();
  const { error } = await sb.from('guests').insert(rows);
  if (error) {
    rows.forEach(r => { guests = guests.filter(g => g.id !== r.id); });
    render(); updateCounter(); setSync('error');
    console.error('add failed', error);
  }
}

async function loadAll() {
  const { data, error } = await sb.from('guests').select('*').order('created_at', { ascending: true });
  if (error) {
    setSync('error');
    showError('Load failed: ' + error.message + ' (code: ' + (error.code || 'none') + ')');
    return;
  }

  if (data.length === 0) {
    const rows = SEED.map((name, i) => ({
      id: 'seed' + i, name, walkin: false, checked: false
    }));
    const { error: e2 } = await sb.from('guests').insert(rows);
    if (e2) {
      setSync('error');
      showError('Seed insert failed: ' + e2.message + ' (code: ' + (e2.code || 'none') + ')');
      return;
    }
    guests = rows;
  } else {
    guests = data;
  }
  render(); updateCounter(); setSync('ok');
}

function subscribe() {
  sb.channel('guests-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, payload => {
      const { eventType, new: row, old } = payload;
      if (eventType === 'INSERT') {
        if (!guests.find(g => g.id === row.id)) guests.push(row);
      } else if (eventType === 'UPDATE') {
        const g = guests.find(x => x.id === row.id);
        if (g) Object.assign(g, row);
      } else if (eventType === 'DELETE') {
        guests = guests.filter(g => g.id !== old.id);
      }
      render(); updateCounter();
    })
    .subscribe(status => { if (status === 'SUBSCRIBED') setSync('ok'); });
}

// ------- listeners -------
searchEl.addEventListener('input', render);
clearBtn.addEventListener('click', () => { searchEl.value = ''; render(); searchEl.focus(); });
addBtn.addEventListener('click', () => addGuest(addInput.value));
addInput.addEventListener('keydown', e => { if (e.key === 'Enter') addGuest(addInput.value); });
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

// ------- init -------
if (SUPABASE_URL.includes('YOUR-PROJECT') || SUPABASE_ANON.includes('YOUR-')) {
  syncDot.className = 'error';
  syncText.textContent = 'config.js missing keys';
  countNum.textContent = '!';
  showError('config.js still has placeholder values. Update SUPABASE_URL and SUPABASE_ANON.');
} else {
  setSync('syncing');
  try {
    sb = createClient(SUPABASE_URL, SUPABASE_ANON);
    await loadAll();
    subscribe();
  } catch (e) {
    setSync('error');
    showError('Init crashed: ' + (e && e.message ? e.message : String(e)));
  }
}
