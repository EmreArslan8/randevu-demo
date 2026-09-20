/* ---------- Tema (aydınlık / karanlık) ---------- */
(function themeInit() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  let saved;
  try { saved = localStorage.getItem('theme'); } catch (e) { saved = null; }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const start = saved || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', start);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

/* ---------- Mobil menü ---------- */
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  navToggle.classList.toggle('active');
});
nav.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => nav.classList.remove('open'))
);

/* ---------- Mini takvim (hero) ---------- */
(function buildMiniCal() {
  const grid = document.getElementById('miniCal');
  if (!grid) return;
  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
  days.forEach(d => {
    const el = document.createElement('span');
    el.className = 'head';
    el.textContent = d;
    grid.appendChild(el);
  });
  // Eylül 2026 -> 1 Eylül Salı; başa 1 boş hücre
  const blanks = 1;
  for (let i = 0; i < blanks; i++) {
    const el = document.createElement('span');
    el.className = 'dim';
    grid.appendChild(el);
  }
  const today = 20; // demo: bugün 20
  for (let d = 1; d <= 30; d++) {
    const el = document.createElement('span');
    el.textContent = d;
    if (d === today) el.className = 'active';
    grid.appendChild(el);
  }
})();

/* ---------- Randevu formu ---------- */
const slots = document.getElementById('slots');
const timeInput = document.getElementById('time');
const form = document.getElementById('bookingForm');
const formMsg = document.getElementById('formMsg');

// Tarih için minimum bugün
const dateInput = document.getElementById('date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

slots.addEventListener('click', e => {
  const btn = e.target.closest('button[data-time]');
  if (!btn) return;
  slots.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  timeInput.value = btn.dataset.time;
});

form.addEventListener('submit', e => {
  e.preventDefault();
  formMsg.className = 'form-msg';
  formMsg.textContent = '';

  const required = ['name', 'service', 'date'];
  let ok = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add('invalid'); ok = false; }
    else el.classList.remove('invalid');
  });
  if (!timeInput.value) {
    ok = false;
    slots.querySelectorAll('button').forEach(b => b.classList.add('invalid'));
  }

  if (!ok) {
    formMsg.classList.add('err');
    formMsg.textContent = 'Lütfen tüm alanları doldurun ve bir saat seçin.';
    return;
  }

  const name = document.getElementById('name').value.trim();
  const date = new Date(document.getElementById('date').value)
    .toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  formMsg.classList.add('ok');
  formMsg.textContent = `✓ Teşekkürler ${name}! ${date} ${timeInput.value} randevunuz oluşturuldu.`;
  form.reset();
  slots.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
  timeInput.value = '';
});

/* ---------- AI Asistan (demo) ---------- */
const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatText = document.getElementById('chatText');
const chatSuggest = document.getElementById('chatSuggest');

const KNOWLEDGE = [
  { k: ['saat', 'çalışma', 'açık', 'kapanış', 'ne zaman'], a: 'Hafta içi 09:00 - 18:00, Cumartesi 10:00 - 16:00 arası hizmet veriyoruz. Pazar kapalıyız. 📅' },
  { k: ['randevu', 'nasıl', 'al'], a: 'Çok kolay! Yukarıdaki "Randevu Al" bölümünden tarih ve saati seçip bilgilerinizi girmeniz yeterli. Onay hemen e-postanıza gelir. ✅' },
  { k: ['fiyat', 'ücret', 'para', 'maliyet', 'ne kadar', 'paket'], a: 'Başlangıç paketimiz ücretsiz! Profesyonel paket ₺499/ay, Kurumsal için özel fiyat sunuyoruz. Detaylar "Fiyatlar" bölümünde. 💳' },
  { k: ['iptal', 'değiştir', 'erteleme'], a: 'Randevunuzu, saatinden 2 saat öncesine kadar onay e-postasındaki bağlantıdan ücretsiz iptal edebilir veya değiştirebilirsiniz. 🔄' },
  { k: ['iletişim', 'telefon', 'adres', 'ulaş'], a: 'Bize "İletişim" bölümünden ulaşabilirsiniz. Dilerseniz demo randevusu oluşturun, ekibimiz sizi arasın. 📞' },
  { k: ['yapay zeka', 'ai', 'asistan', 'bot'], a: 'Ben sık sorulan soruları anında yanıtlayan yapay zekâ asistanıyım. Gerçek sürümde işletmenizin verileriyle eğitilirim. 🤖' },
  { k: ['merhaba', 'selam', 'hey', 'iyi günler'], a: 'Merhaba! 😊 Randevu, fiyatlar veya çalışma saatleri hakkında soru sorabilirsiniz.' },
  { k: ['teşekkür', 'sağol', 'eyvallah'], a: 'Rica ederim! Başka bir sorunuz olursa buradayım. 🙌' },
];

function botReply(text) {
  const t = text.toLowerCase();
  for (const item of KNOWLEDGE) {
    if (item.k.some(word => t.includes(word))) return item.a;
  }
  return 'Bunu tam anlayamadım 🤔 Randevu, çalışma saatleri, fiyatlar veya iptal işlemleri hakkında sorabilirsiniz.';
}

function addMsg(text, who) {
  const el = document.createElement('div');
  el.className = 'msg ' + who;
  el.textContent = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
  return el;
}

function sendUser(text) {
  addMsg(text, 'user');
  const typing = document.createElement('div');
  typing.className = 'msg bot typing';
  typing.innerHTML = '<i></i><i></i><i></i>';
  chatBody.appendChild(typing);
  chatBody.scrollTop = chatBody.scrollHeight;
  setTimeout(() => {
    typing.remove();
    addMsg(botReply(text), 'bot');
  }, 700 + Math.random() * 500);
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = chatText.value.trim();
  if (!text) return;
  sendUser(text);
  chatText.value = '';
});

chatSuggest.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  sendUser(btn.textContent);
});

/* ---------- Header gölge (scroll) ---------- */
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 8px 30px rgba(0,0,0,.3)' : 'none';
});
