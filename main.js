/* =========================================================
   Subnet Summer — site behaviour (v2)
   ========================================================= */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   CONTENT YOU EDIT
   posts: add links, e.g. 'https://x.com/SubnetSummerT/status/123...'
   X/Twitter links render as embedded posts; other links render as link cards.
   logo: white-on-transparent mark in /assets (null = name only).
   --------------------------------------------------------- */
const CLIENTS = [
  { name: '404-GEN',  logo: 'assets/logo-404gen.png',   wide: true, tags: ['Visuals', 'Branding', 'Creative'], variant: 'dark',  size: 'lg', posts: [] },
  { name: 'Trishool', logo: 'assets/logo-trishool.svg',             tags: ['Visuals', 'Branding', 'Creative'], variant: 'light', size: 'lg', posts: [] },
  { name: 'Verathos', logo: null,                                   tags: ['Visuals', 'Branding', 'Creative'], variant: 'light',             posts: [] },
  { name: 'Numinous', logo: 'assets/logo-numinous.png',             tags: ['Visuals', 'Branding', 'Creative'], variant: 'dark',              posts: [] },
  { name: 'NIOME',    logo: 'assets/logo-niome.png',                tags: ['Visuals', 'Branding', 'Creative'], variant: 'light',             posts: [] },
];

const TESTIMONIALS = [
  { quote: 'Client testimonial goes here. One or two lines on how Subnet Summer changed their visibility.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
  { quote: 'Second testimonial placeholder. A short line on community growth, Spaces or campaign results.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
  { quote: 'Third testimonial placeholder. Keep it to a sentence or two so the three cards stay balanced.', name: 'Client name', role: 'Role · Subnet', placeholder: true },
];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const logoImg = (c, cls = '') => c.logo ? `<img src="${c.logo}" alt="" class="${[c.wide ? 'wide' : '', cls].join(' ').trim()}">` : '';

/* =========================================================
   CLIENT LOGO MARQUEE (moves left → right, loops)
   ========================================================= */
(function buildMarquee() {
  const track = $('#logoTrack');
  const set = CLIENTS.map(c => `<div class="logo-item">${logoImg(c)}<span>${esc(c.name)}</span></div><i class="logo-sep"></i>`).join('');
  const half = set + set;             // one half wide enough for large screens
  track.innerHTML = half + half;      // two identical halves → seamless loop
  $$('.logo-item', track).slice(CLIENTS.length * 2).forEach(el => el.setAttribute('aria-hidden', 'true'));
})();

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
      <div class="wlogo">${logoImg(c)}<span class="wname">${esc(c.name)}</span></div>
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
  setTimeout(() => { modal.hidden = true; lastFocus && lastFocus.focus(); }, 620);
}
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });

/* =========================================================
   TESTIMONIALS — all three in one row
   ========================================================= */
const QMARK = '<svg class="qmark" viewBox="0 0 120 90" aria-hidden="true"><path d="M0 90V52C0 22 15 5 45 0l5 12C33 17 26 28 25 42h22v48H0Zm68 0V52C68 22 83 5 113 0l5 12c-17 5-24 16-25 30h22v48H68Z"/></svg>';
$('#tGrid').innerHTML = TESTIMONIALS.map(t => `
  <figure class="t-card" data-reveal>
    <div>${QMARK}<blockquote>${esc(t.quote)}</blockquote></div>
    <figcaption class="who">
      <span class="who-av">${esc(t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>
      <div><b>${esc(t.name)}${t.placeholder ? '<span class="ph-pill">Placeholder</span>' : ''}</b><span class="who-role">${esc(t.role)}</span></div>
    </figcaption>
  </figure>`).join('');

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
  setTimeout(() => { n.textContent = d.n; $('#priceP').textContent = d.p; $('#priceNote').textContent = d.note; n.classList.remove('swap'); }, 240);
}));

/* =========================================================
   REVEAL + COUNTERS
   ========================================================= */
const groups = new Map();
$$('[data-reveal]').forEach(el => {
  const p = el.parentElement, k = groups.get(p) || 0;
  groups.set(p, k + 1);
  el.style.transitionDelay = `${Math.min(k, 6) * 80}ms`;
});
function countUp(el) {
  const to = +el.dataset.count, t0 = performance.now(), dur = 1800;
  const step = t => {
    const p = clamp((t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(to * e).toLocaleString('en-US');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  if (!reduce) $$('[data-count]', en.target).forEach(countUp);
  io.unobserve(en.target);
}), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach(el => io.observe(el));

/* =========================================================
   HERO — skyline line (from the Figma cover's stepped bars)
   ========================================================= */
const hero = $('#hero'), sky = $('#skyline');
// Top-segment heights of the 16 columns on the Figma "Slide1" cover (of 1080).
const STEPS = [675, 270, 945, 135, 810, 540, 476.7, 405, 160.9, 540, 810, 270, 675, 945, 405, 381.8];
let skyPath = null, skyDot = null, skyLen = 0;
function drawSkyline(animate) {
  const W = hero.clientWidth, H = hero.clientHeight;
  const headTop = $('.hero-h').getBoundingClientRect().top - hero.getBoundingClientRect().top;
  const top = Math.max(118, H * 0.17);
  const span = Math.max(60, Math.min(H * 0.34, headTop - top - 36));
  const cw = W / STEPS.length;
  let d = '';
  STEPS.forEach((h, i) => {
    const y = (top + (h / 1080) * span).toFixed(1);
    d += i === 0 ? `M0 ${y} H${cw.toFixed(1)}` : ` V${y} H${((i + 1) * cw).toFixed(1)}`;
  });
  sky.setAttribute('viewBox', `0 0 ${W} ${H}`);
  sky.innerHTML = `<path d="${d}"/><circle class="dot" r="4"/>`;
  skyPath = $('path', sky); skyDot = $('.dot', sky);
  skyLen = skyPath.getTotalLength();
  if (animate && !reduce) {
    skyPath.style.strokeDasharray = skyLen;
    skyPath.style.strokeDashoffset = skyLen;
    skyPath.getBoundingClientRect();
    skyPath.style.transition = 'stroke-dashoffset 2.6s cubic-bezier(.22,.61,.36,1)';
    skyPath.style.strokeDashoffset = 0;
  }
}
let heroVisible = true, dotT0 = performance.now();
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
function dotLoop(t) {
  if (heroVisible && skyPath && skyLen) {
    const p = ((t - dotT0) / 14000) % 1;          // one slow pass every 14s
    const pt = skyPath.getPointAtLength(p * skyLen);
    skyDot.setAttribute('cx', pt.x); skyDot.setAttribute('cy', pt.y);
  }
  requestAnimationFrame(dotLoop);
}

if (!reduce) hero.classList.add('pre');
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
  drawSkyline(true);
  requestAnimationFrame(() => hero.classList.remove('pre'));
  if (!reduce) setTimeout(() => { dotT0 = performance.now(); requestAnimationFrame(dotLoop); }, 2600);
});

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
  nav.classList.toggle('is-scrolled', scrollY > 30);
  nav.dataset.theme = themeAt(38);
  hud.dataset.theme = themeAt(innerHeight - 30);
  const i = currentIndex();
  $('#hudNum').textContent = pad(i + 1);
  $('#hudLabel').textContent = sections[i].dataset.label;
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#hudBar').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  hud.classList.toggle('is-hidden', scrollY > max - 260);
  $('.hud-hint').style.display = i === 0 ? '' : 'none';
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { drawSkyline(false); onScroll(); }, 120); });

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

onScroll();
