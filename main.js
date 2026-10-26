/* =========================================================
   Subnet Summer — site behaviour
   ========================================================= */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   CONTENT YOU EDIT
   Add post links to each client's `posts` array, e.g.
   posts: ['https://x.com/SubnetSummerT/status/123...', ...]
   X/Twitter links render as embedded posts; other links render as link cards.
   --------------------------------------------------------- */
const CLIENTS = [
  { name: '404-GEN',  tags: ['Visuals', 'Branding', 'Creative'], variant: 'yellow',  size: 'lg', posts: [] },
  { name: 'Trishool', tags: ['Visuals', 'Branding', 'Creative'], variant: 'white',   size: 'lg', posts: [] },
  { name: 'Verathos', tags: ['Visuals', 'Branding', 'Creative'], variant: 'outline', posts: [] },
  { name: 'Numinous', tags: ['Visuals', 'Branding', 'Creative'], variant: 'yellow',  posts: [] },
  { name: 'NIOME',    tags: ['Visuals', 'Branding', 'Creative'], variant: 'paper',   posts: [] },
];

const TESTIMONIALS = [
  { quote: 'Client testimonial goes here. One or two lines on how Subnet Summer changed their visibility.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
  { quote: 'Second testimonial placeholder. A short line on community growth, Spaces or campaign results.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
  { quote: 'Third testimonial placeholder. Keep it to a punchy sentence or two for the best layout.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* =========================================================
   WORK CARDS
   ========================================================= */
const grid = $('#workGrid');
CLIENTS.forEach((c, i) => {
  const n = c.posts.length;
  const tile = `<div class="ptile"><div class="pt-head"><span class="pt-av"></span><span class="pt-lines"><i></i><i></i></span></div><div class="pt-media">${n ? '' : 'Post soon'}</div><div class="pt-text"><i></i><i></i></div></div>`;
  const card = document.createElement('article');
  card.className = `wcard wcard--${c.variant}${c.size === 'lg' ? ' wcard--lg' : ''}`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open ${c.name} work`);
  card.dataset.reveal = '';
  card.innerHTML = `
    <div class="wmedia">
      <div class="wmeta"><span>${pad(i + 1)} / ${pad(CLIENTS.length)}</span><span>${n ? `${n} post${n > 1 ? 's' : ''}` : 'Posts coming soon'}</span></div>
      <div class="wname">${esc(c.name)}</div>
      <div class="wtiles">${tile}${tile}${tile}</div>
    </div>
    <div class="winfo"><h3>${esc(c.name)}</h3><p>${c.tags.map(esc).join(' / ')}</p><span class="wlink">View posts ↗</span></div>`;
  card.addEventListener('click', () => openModal(i));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); } });
  grid.appendChild(card);
});

/* ---------- modal ---------- */
const modal = $('#modal');
let lastFocus = null, twttrLoading = false;
function loadTwitter(cb) {
  if (window.twttr && window.twttr.widgets) return cb();
  if (!twttrLoading) {
    twttrLoading = true;
    const s = document.createElement('script');
    s.src = 'https://platform.twitter.com/widgets.js'; s.async = true;
    document.body.appendChild(s);
  }
  const t = setInterval(() => { if (window.twttr && window.twttr.widgets) { clearInterval(t); cb(); } }, 120);
}
function openModal(i) {
  const c = CLIENTS[i];
  lastFocus = document.activeElement;
  $('#modalIdx').textContent = `Client ${pad(i + 1)} / ${pad(CLIENTS.length)}`;
  $('#modalTitle').textContent = c.name;
  $('#modalTags').textContent = c.tags.join(' / ');
  const body = $('#modalBody');
  if (!c.posts.length) {
    body.innerHTML = Array.from({ length: 6 }, (_, k) =>
      `<div class="slot"><span>Post ${pad(k + 1)}</span><b>Post preview<br>coming soon</b><span>Placeholder</span></div>`).join('');
  } else {
    const isX = u => /^https?:\/\/(www\.)?(x|twitter)\.com\/.+\/status\//i.test(u);
    body.innerHTML = c.posts.map((u, k) => isX(u)
      ? `<div class="embed"><blockquote class="twitter-tweet" data-theme="light" data-dnt="true"><a href="${esc(u.replace('//x.com', '//twitter.com'))}">View post</a></blockquote></div>`
      : `<a class="post-link" href="${esc(u)}" target="_blank" rel="noopener"><b>Post ${pad(k + 1)} ↗</b><span>${esc(u)}</span></a>`).join('');
    if (c.posts.some(isX)) loadTwitter(() => window.twttr.widgets.load(body));
  }
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('open')));
  setTimeout(() => $('.modal-x').focus(), 60);
}
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modal.hidden = true; lastFocus && lastFocus.focus(); }, 560);
}
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });

/* =========================================================
   TESTIMONIALS
   ========================================================= */
const qWrap = $('#quotes');
qWrap.innerHTML = TESTIMONIALS.map((t, i) => `
  <figure class="quote${i === 0 ? ' on' : ''}" aria-hidden="${i !== 0}">
    <blockquote>${esc(t.quote)}</blockquote>
    <figcaption class="who">
      <span class="who-av">${esc(t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>
      <div><b>${esc(t.name)}${t.placeholder ? '<span class="ph-pill">Placeholder</span>' : ''}</b><span class="who-role">${esc(t.role)}</span></div>
    </figcaption>
  </figure>`).join('') +
  `<div class="t-dots">${TESTIMONIALS.map((_, i) => `<button aria-label="Show testimonial ${i + 1}"${i === 0 ? ' class="on"' : ''}></button>`).join('')}</div>`;
let tIdx = 0, tTimer;
function showQuote(i) {
  tIdx = (i + TESTIMONIALS.length) % TESTIMONIALS.length;
  $$('.quote', qWrap).forEach((q, k) => { q.classList.toggle('on', k === tIdx); q.setAttribute('aria-hidden', k !== tIdx); });
  $$('.t-dots button', qWrap).forEach((d, k) => d.classList.toggle('on', k === tIdx));
  $('#tCount').textContent = `${pad(tIdx + 1)} / ${pad(TESTIMONIALS.length)}`;
}
const autoQ = () => { clearInterval(tTimer); if (!reduce) tTimer = setInterval(() => showQuote(tIdx + 1), 7000); };
$('#tPrev').onclick = () => { showQuote(tIdx - 1); autoQ(); };
$('#tNext').onclick = () => { showQuote(tIdx + 1); autoQ(); };
$$('.t-dots button', qWrap).forEach((d, k) => d.onclick = () => { showQuote(k); autoQ(); });
$('#testimonials').addEventListener('mouseenter', () => clearInterval(tTimer));
$('#testimonials').addEventListener('mouseleave', autoQ);
autoQ();

/* =========================================================
   BILLING TOGGLE
   ========================================================= */
const BILL = {
  year:  { n: '150', p: '/ year',  note: 'Priority execution across every service. Saves 30 TAO against monthly.' },
  month: { n: '15',  p: '/ month', note: 'Flexible, rolling month to month. Switch to yearly any time.' },
};
$$('.billing button').forEach(b => b.addEventListener('click', () => {
  if (b.getAttribute('aria-selected') === 'true') return;
  $$('.billing button').forEach(x => x.setAttribute('aria-selected', x === b));
  const d = BILL[b.dataset.bill], n = $('#priceN');
  n.classList.add('swap');
  setTimeout(() => { n.textContent = d.n; $('#priceP').textContent = d.p; $('#priceNote').textContent = d.note; n.classList.remove('swap'); }, 220);
}));

/* =========================================================
   REVEAL + COUNTERS
   ========================================================= */
const groups = new Map();
$$('[data-reveal]').forEach(el => {
  const p = el.parentElement;
  const k = (groups.get(p) || 0);
  groups.set(p, k + 1);
  el.style.transitionDelay = `${Math.min(k, 6) * 70}ms`;
});
function countUp(el) {
  const to = +el.dataset.count, t0 = performance.now(), dur = 1600;
  const step = t => {
    const p = clamp((t - t0) / dur), e = 1 - Math.pow(2, -10 * p);
    el.textContent = Math.round(to * (p === 1 ? 1 : e)).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  $$('[data-count]', en.target).forEach(c => !reduce && countUp(c));
  io.unobserve(en.target);
}), { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach(el => io.observe(el));

/* =========================================================
   HERO — intro + scroll expansion
   ========================================================= */
const hero = $('#hero');
let base = { pl: 22, pt: 13, pr: 1.6, pb: 2.4 };
function readBase() {
  ['--pl', '--pt', '--pr', '--pb'].forEach(v => hero.style.removeProperty(v));
  const cs = getComputedStyle(hero);
  base = { pl: parseFloat(cs.getPropertyValue('--pl')), pt: parseFloat(cs.getPropertyValue('--pt')), pr: parseFloat(cs.getPropertyValue('--pr')), pb: parseFloat(cs.getPropertyValue('--pb')) };
}
let introDone = reduce;
readBase();
if (!reduce) {
  hero.classList.add('pre');
  const go = () => requestAnimationFrame(() => {
    hero.classList.add('intro');
    hero.classList.remove('pre');
    setTimeout(() => { hero.classList.remove('intro'); introDone = true; onScroll(); }, 1550);
  });
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 120));
}

function heroScroll() {
  if (!introDone) return;
  const p = clamp(scrollY / (hero.offsetHeight * 0.9));
  const e = p * p * (3 - 2 * p);
  hero.style.setProperty('--pl', (base.pl * (1 - e)) + '%');
  hero.style.setProperty('--pt', (base.pt * (1 - e)) + '%');
  hero.style.setProperty('--pr', (base.pr * (1 - e)) + '%');
  $('.hero-left').style.opacity = clamp(1 - p * 3.5);
}

/* =========================================================
   NAV / HUD THEME + DECK NAVIGATION
   ========================================================= */
const nav = $('#nav'), hud = $('#hud');
const sections = $$('main > section');
$('#hudTotal').textContent = pad(sections.length);

function themeAt(y) {
  let theme = 'dark';
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) theme = s.dataset.theme;
  }
  return theme;
}
function currentIndex() {
  const mark = innerHeight * 0.45;
  let idx = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= mark) idx = i; });
  return idx;
}
let ticking = false;
function onScroll() {
  ticking = false;
  heroScroll();
  nav.classList.toggle('is-scrolled', scrollY > 30);
  nav.dataset.theme = themeAt(36);
  hud.dataset.theme = themeAt(innerHeight - 30);
  const i = currentIndex();
  $('#hudNum').textContent = pad(i + 1);
  $('#hudLabel').textContent = sections[i].dataset.label;
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#hudBar').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  hud.classList.toggle('is-hidden', scrollY > max - 260);
  $('.hud-hint').style.display = i === 0 && innerWidth > 860 ? '' : 'none';
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { if (introDone) readBase(); fitWordmark(); onScroll(); });

function goTo(i) {
  i = clamp(i, 0, sections.length - 1);
  scrollTo({ top: sections[i].offsetTop, behavior: reduce ? 'auto' : 'smooth' });
}
addEventListener('keydown', e => {
  if (!modal.hidden) { if (e.key === 'Escape') closeModal(); return; }
  if (e.target.closest('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex() - 1); }
});

/* ---------- mobile menu ---------- */
const burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', open);
  menu.hidden = !open;
});
$$('a', menu).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); menu.hidden = true; }));

/* ---------- footer wordmark fit ---------- */
function fitWordmark() {
  const w = $('.wordmark'), p = w.parentElement, cs = getComputedStyle(p);
  const avail = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  w.style.fontSize = '100px';
  w.style.width = 'max-content';
  const need = w.offsetWidth;
  w.style.width = '';
  w.style.fontSize = Math.floor(100 * avail / need * 0.97) + 'px';
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { fitWordmark(); onScroll(); });
fitWordmark();
onScroll();
