/* ---------- Tema (aydınlık varsayılan) ---------- */
(function themeInit() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let saved;
  try { saved = localStorage.getItem('theme'); } catch (e) { saved = null; }
  root.setAttribute('data-theme', saved || 'light');
  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

/* ---------- Demo veri ---------- */
const SERVICES_PRICE = {
  'Danışmanlık Görüşmesi': 750,
  'Web Sitesi Sunumu': 500,
  'Teknik Destek': 400,
  'Ürün Demosu': 0,
};
let appointments = [
  { name: 'Ayşe Yılmaz', service: 'Danışmanlık Görüşmesi', date: '2026-09-21', time: '09:00', status: 'confirmed' },
  { name: 'Mehmet Demir', service: 'Web Sitesi Sunumu', date: '2026-09-21', time: '13:00', status: 'pending' },
  { name: 'Zeynep Kaya', service: 'Teknik Destek', date: '2026-09-22', time: '10:30', status: 'confirmed' },
  { name: 'Can Öztürk', service: 'Ürün Demosu', date: '2026-09-22', time: '16:00', status: 'pending' },
  { name: 'Elif Şahin', service: 'Danışmanlık Görüşmesi', date: '2026-09-23', time: '14:30', status: 'cancelled' },
  { name: 'Burak Aydın', service: 'Web Sitesi Sunumu', date: '2026-09-24', time: '11:00', status: 'confirmed' },
];

const STATUS = {
  pending: { label: 'Bekleyen', cls: 'st-pending' },
  confirmed: { label: 'Onaylı', cls: 'st-confirmed' },
  cancelled: { label: 'İptal', cls: 'st-cancelled' },
};

/* ---------- Görünüm geçişi ---------- */
const TITLES = { dashboard: 'Panel', appointments: 'Randevular', assistant: 'AI Ayarları', settings: 'Ayarlar' };
const sidebar = document.getElementById('adminSidebar');
document.querySelectorAll('.admin-nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const view = link.dataset.view;
    document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.admin-view').forEach(v => v.hidden = v.dataset.view !== view);
    document.getElementById('viewTitle').textContent = TITLES[view];
    sidebar.classList.remove('open');
  });
});
document.getElementById('adminMenu').addEventListener('click', () => sidebar.classList.toggle('open'));

/* ---------- İstatistikler ---------- */
function renderStats() {
  const total = appointments.length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const revenue = appointments
    .filter(a => a.status === 'confirmed')
    .reduce((s, a) => s + (SERVICES_PRICE[a.service] || 0), 0);
  document.getElementById('stTotal').textContent = total;
  document.getElementById('stPending').textContent = pending;
  document.getElementById('stConfirmed').textContent = confirmed;
  document.getElementById('stRevenue').textContent = '₺' + revenue.toLocaleString('tr-TR');
}

/* ---------- Haftalık doluluk çubukları ---------- */
function renderBars() {
  const wrap = document.getElementById('bars');
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const values = [60, 85, 45, 90, 70, 40];
  wrap.innerHTML = days.map((d, i) =>
    `<div class="bar-col"><div class="bar" style="height:${values[i]}%"></div><span>${d}</span></div>`
  ).join('');
}

/* ---------- Yaklaşan randevular ---------- */
function renderUpcoming() {
  const ul = document.getElementById('upcoming');
  const list = [...appointments]
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 4);
  ul.innerHTML = list.map(a => `
    <li>
      <span class="up-dot"></span>
      <div><b>${a.name}</b><small>${a.service}</small></div>
      <span class="up-time">${fmtDate(a.date)} · ${a.time}</span>
    </li>`).join('');
}

/* ---------- Tablo ---------- */
const apptBody = document.getElementById('apptBody');
const searchInput = document.getElementById('search');
const filterStatus = document.getElementById('filterStatus');

function fmtDate(d) {
  return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

function renderTable() {
  const q = searchInput.value.toLowerCase().trim();
  const f = filterStatus.value;
  const rows = appointments.filter(a =>
    (!q || a.name.toLowerCase().includes(q) || a.service.toLowerCase().includes(q)) &&
    (!f || a.status === f)
  );
  document.getElementById('emptyRow').hidden = rows.length > 0;
  apptBody.innerHTML = rows.map(a => {
    const i = appointments.indexOf(a);
    const s = STATUS[a.status];
    return `<tr>
      <td data-label="Müşteri"><b>${a.name}</b></td>
      <td data-label="Hizmet">${a.service}</td>
      <td data-label="Tarih">${fmtDate(a.date)}</td>
      <td data-label="Saat">${a.time}</td>
      <td data-label="Durum"><span class="status ${s.cls}">${s.label}</span></td>
      <td data-label="İşlem" class="row-actions">
        ${a.status !== 'confirmed' ? `<button title="Onayla" data-act="confirm" data-i="${i}">✓</button>` : ''}
        ${a.status !== 'cancelled' ? `<button title="İptal et" data-act="cancel" data-i="${i}">✕</button>` : ''}
        <button title="Sil" data-act="delete" data-i="${i}">🗑</button>
      </td>
    </tr>`;
  }).join('');
}

apptBody.addEventListener('click', e => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const i = +btn.dataset.i;
  const act = btn.dataset.act;
  if (act === 'confirm') appointments[i].status = 'confirmed';
  else if (act === 'cancel') appointments[i].status = 'cancelled';
  else if (act === 'delete') appointments.splice(i, 1);
  renderAll();
});

searchInput.addEventListener('input', renderTable);
filterStatus.addEventListener('change', renderTable);

/* ---------- Yeni randevu modalı ---------- */
const modal = document.getElementById('modal');
document.getElementById('addBtn').addEventListener('click', () => modal.hidden = false);
document.getElementById('modalClose').addEventListener('click', () => modal.hidden = true);
modal.addEventListener('click', e => { if (e.target === modal) modal.hidden = true; });

document.getElementById('addForm').addEventListener('submit', e => {
  e.preventDefault();
  appointments.unshift({
    name: document.getElementById('mName').value.trim(),
    service: document.getElementById('mService').value,
    date: document.getElementById('mDate').value,
    time: document.getElementById('mTime').value,
    status: 'pending',
  });
  e.target.reset();
  modal.hidden = true;
  renderAll();
});

/* ---------- Render ---------- */
function renderAll() {
  renderStats();
  renderBars();
  renderUpcoming();
  renderTable();
}
renderAll();
