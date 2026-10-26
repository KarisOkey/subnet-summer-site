/* =========================================================
   Subnet Summer — site behaviour (v3)
   ========================================================= */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   CONTENT YOU EDIT
   posts: add links, e.g. 'https://x.com/SubnetSummerT/status/123...'
   X/Twitter links embed as posts; other links render as link cards.
   ratio = logo width / height (keeps every logo at an even visual weight).
   --------------------------------------------------------- */
const CLIENTS = [
  { name: '404-GEN',         logo: 'assets/logos/404gen.png',   ratio: 5.409, size: 'lg', posts: [] },
  { name: 'Trishool',        logo: 'assets/logos/trishool.svg', ratio: 8.729, size: 'lg', posts: [] },
  { name: 'Verathos',        logo: 'assets/logos/verathos.png', ratio: 3.712,             posts: [] },
  { name: 'Numinous',        logo: 'assets/logos/numinous.png', ratio: 5.702,             posts: [] },
  { name: 'NIOME',           logo: 'assets/logos/niome.png',    ratio: 1,                 posts: [] },
  { name: 'Minotaur',        logo: 'assets/logos/minotaur.svg', ratio: 5.305, size: 'lg', posts: [] },
  { name: 'Nepher Robotics', logo: 'assets/logos/nepher.svg',   ratio: 7.334, size: 'lg', posts: [] },
];
const TAGS = 'Visuals · Branding · Creative';

const TESTIMONIALS = [
  { quote: 'Client testimonial goes here. One or two lines on how Subnet Summer changed their visibility.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
  { quote: 'Second testimonial placeholder. A short line on community growth, Spaces or campaign results.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
  { quote: 'Third testimonial placeholder. Keep it to a sentence or two so the three quotes stay balanced.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const logoH = (r, base) => Math.min(base * 0.78, Math.round(base / Math.sqrt(r)));   // equal optical area

/* =========================================================
   CLIENT LOGO STRIP (in brand colours, moving left → right)
   ========================================================= */
(function buildStrip() {
  const track = $('#logoTrack');
  const small = innerWidth < 760;
  const base = small ? 62 : 84;
  const set = CLIENTS.map(c => `<img src="${c.logo}" alt="${esc(c.name)}" style="--h:${logoH(c.ratio, base)}px">`).join('');
  track.innerHTML = set + set + set + set;          // two identical halves → seamless loop
  $$('img', track).slice(CLIENTS.length).forEach(i => { i.alt = ''; i.setAttribute('aria-hidden', 'true'); });
})();

/* =========================================================
   WORK CARDS
   ========================================================= */
const grid = $('#workGrid');
CLIENTS.forEach((c, i) => {
  const n = c.posts.length;
  const card = document.createElement('article');
  card.className = `wcard${c.size === 'lg' ? ' wcard--lg' : ''}`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Open ${c.name} work`);
  card.dataset.reveal = '';
  card.innerHTML = `
    <div class="wmedia">
      <i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i>
      <div class="wmeta"><span>${pad(i + 1)}</span><span>${n ? `${n} post${n > 1 ? 's' : ''}` : 'Posts coming soon'}</span></div>
      <img src="${c.logo}" alt="${esc(c.name)} logo" style="--wh:${logoH(c.ratio, c.size === 'lg' ? 150 : 118)}px">
    </div>
    <div class="winfo"><h3>${esc(c.name)}</h3><p>${TAGS}</p><span class="wlink">View posts <b>↗</b></span></div>`;
  card.addEventListener('click', () => openModal(i));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); } });
  grid.appendChild(card);
});

/* ---------- modal ---------- */
const modal = $('#modal');
let lastFocus = null, twttrLoading = false;
function loadTwitter(cb) {
  if (window.twttr && window.twttr.widgets) return cb();
  if (!twttrLoading) { twttrLoading = true; const s = document.createElement('script'); s.src = 'https://platform.twitter.com/widgets.js'; s.async = true; document.body.appendChild(s); }
  const t = setInterval(() => { if (window.twttr && window.twttr.widgets) { clearInterval(t); cb(); } }, 120);
}
function openModal(i) {
  const c = CLIENTS[i];
  lastFocus = document.activeElement;
  $('#modalIdx').textContent = `Client ${pad(i + 1)} / ${pad(CLIENTS.length)}`;
  $('#modalTitle').textContent = c.name;
  $('#modalTags').textContent = TAGS;
  const body = $('#modalBody');
  if (!c.posts.length) {
    body.innerHTML = Array.from({ length: 6 }, (_, k) =>
      `<div class="slot"><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i><span>Post ${pad(k + 1)}</span><b>Post preview<br>coming soon</b></div>`).join('');
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
  setTimeout(() => { modal.hidden = true; lastFocus && lastFocus.focus(); }, 800);
}
modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });

/* =========================================================
   TESTIMONIALS
   ========================================================= */
const QMARK = '<svg class="qmark" viewBox="0 0 120 90" aria-hidden="true"><path d="M0 90V52C0 22 15 5 45 0l5 12C33 17 26 28 25 42h22v48H0Zm68 0V52C68 22 83 5 113 0l5 12c-17 5-24 16-25 30h22v48H68Z"/></svg>';
$('#quotes').innerHTML = TESTIMONIALS.map(t => `
  <figure class="quote" data-reveal>
    ${QMARK}
    <blockquote>${esc(t.quote)}</blockquote>
    <figcaption>
      <span class="q-av">${esc(t.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>
      <span><b>${esc(t.name)}${t.placeholder ? '<span class="q-ph">Placeholder</span>' : ''}</b><span class="q-role">${esc(t.role)}</span></span>
    </figcaption>
  </figure>`).join('');

/* =========================================================
   BILLING
   ========================================================= */
const BILL = {
  year:  { n: '150', p: 'per year',  note: 'Recommended. Priority execution across every service, and 30 TAO less than paying monthly.' },
  month: { n: '15',  p: 'per month', note: 'Flexible, rolling month to month. Switch to yearly at any time.' },
};
$$('.billing button').forEach(b => b.addEventListener('click', () => {
  if (b.getAttribute('aria-selected') === 'true') return;
  $$('.billing button').forEach(x => x.setAttribute('aria-selected', x === b));
  const d = BILL[b.dataset.bill], n = $('#priceN');
  n.classList.add('swap');
  setTimeout(() => { n.textContent = d.n; $('#priceP').textContent = d.p; $('#priceNote').textContent = d.note; n.classList.remove('swap'); }, 260);
}));

/* =========================================================
   SPLIT-WORD HEADINGS + REVEALS + COUNTERS
   ========================================================= */
function splitWords(el) {
  let k = 0;
  const walk = node => {
    [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--d', `${(k++ * 0.045).toFixed(3)}s`);
          w.appendChild(s); frag.appendChild(w);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
    });
  };
  walk(el);
}
$$('[data-split]').forEach(splitWords);

const groups = new Map();
$$('[data-reveal]').forEach(el => {
  const p = el.parentElement, k = groups.get(p) || 0;
  groups.set(p, k + 1);
  el.style.transitionDelay = `${Math.min(k, 8) * 90}ms`;
});
function countUp(el) {
  const to = +el.dataset.count, t0 = performance.now(), dur = 2000;
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
}), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal], [data-split]:not(.hero-h)').forEach(el => io.observe(el));

/* =========================================================
   HERO — stepped skyline from the Figma cover
   ========================================================= */
const hero = $('#hero'), sky = $('#skyline');
const STEPS = [675, 270, 945, 135, 810, 540, 476.7, 405, 160.9, 540, 810, 270, 675, 945, 405, 381.8];
let skyPath = null, skyDot = null, skyLen = 0;
function drawSkyline(animate) {
  const W = hero.clientWidth, H = hero.clientHeight;
  const hr = hero.getBoundingClientRect();
  const headTop = $('.hero-h').getBoundingClientRect().top - hr.top;
  const top = $('.nav').offsetHeight + Math.max(28, H * 0.05);
  const span = Math.max(50, Math.min(H * 0.36, headTop - top - 40));
  const cw = W / STEPS.length;
  let d = '';
  STEPS.forEach((h, i) => {
    const y = (top + (h / 1080) * span).toFixed(1);
    d += i === 0 ? `M0 ${y} H${cw.toFixed(1)}` : ` V${y} H${((i + 1) * cw).toFixed(1)}`;
  });
  sky.setAttribute('viewBox', `0 0 ${W} ${H}`);
  sky.innerHTML = `<path d="${d}"/><circle r="4" cx="-10" cy="-10"/>`;
  skyPath = $('path', sky); skyDot = $('circle', sky); skyLen = skyPath.getTotalLength();
  if (animate && !reduce) {
    skyPath.style.strokeDasharray = skyLen; skyPath.style.strokeDashoffset = skyLen;
    skyPath.getBoundingClientRect();
    skyPath.style.transition = 'stroke-dashoffset 2.8s cubic-bezier(.22,.61,.36,1) .3s';
    skyPath.style.strokeDashoffset = 0;
  }
}
let heroVisible = true, dotT0 = 0, dotOn = false;
new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);
function dotLoop(t) {
  if (heroVisible && skyLen) {
    const pt = skyPath.getPointAtLength((((t - dotT0) / 16000) % 1) * skyLen);
    skyDot.setAttribute('cx', pt.x); skyDot.setAttribute('cy', pt.y);
  }
  requestAnimationFrame(dotLoop);
}
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => {
  drawSkyline(true);
  requestAnimationFrame(() => $('.hero-h').classList.add('in'));
  if (!reduce && !dotOn) { dotOn = true; setTimeout(() => { dotT0 = performance.now(); requestAnimationFrame(dotLoop); }, 3100); }
});

/* =========================================================
   THEME FLOW (black ↔ white crossfade) + HUD + DECK KEYS
   ========================================================= */
const root = document.documentElement, hud = $('#hud');
const sections = $$('main > section');
$('#hudTotal').textContent = pad(sections.length - 1);
function sectionAt(y) {
  let idx = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= y) idx = i; });
  return idx;
}
let ticking = false;
function onScroll() {
  ticking = false;
  const max = root.scrollHeight - innerHeight;
  const themeIdx = scrollY >= max - 4 ? sections.length - 1 : sectionAt(innerHeight * 0.52);
  const t = sections[themeIdx].dataset.theme;
  if (root.dataset.theme !== t) root.dataset.theme = t;
  const i = Math.min(sectionAt(innerHeight * 0.45), sections.length - 2);
  $('#hudNum').textContent = pad(i + 1);
  $('#hudLabel').textContent = sections[i].dataset.label;
  $('#hudBar').style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  hud.classList.toggle('is-hidden', i === 0 || scrollY > max - 320);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
let rz;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { drawSkyline(false); onScroll(); }, 140); });

function goTo(i) {
  i = clamp(i, 0, sections.length - 1);
  scrollTo({ top: sections[i].offsetTop - (i ? 72 : 0), behavior: reduce ? 'auto' : 'smooth' });
}
addEventListener('keydown', e => {
  if (!modal.hidden) { if (e.key === 'Escape') closeModal(); return; }
  if (e.target.closest('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); goTo(sectionAt(innerHeight * 0.3) + 1); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(sectionAt(innerHeight * 0.3) - 1); }
});
onScroll();
