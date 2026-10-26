/* =========================================================
   Subnet Summer — site behaviour (v4)
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
  { name: '404-GEN',         logo: 'assets/logos/404gen.png',   ratio: 5.409, posts: [] },
  { name: 'Trishool',        logo: 'assets/logos/trishool.svg', ratio: 8.729, posts: [] },
  { name: 'Verathos',        logo: 'assets/logos/verathos.png', ratio: 3.712, posts: [] },
  { name: 'Numinous',        logo: 'assets/logos/numinous.png', ratio: 5.702, posts: [] },
  { name: 'NIOME',           logo: 'assets/logos/niome.png',    ratio: 1,     posts: [] },
  { name: 'Minotaur',        logo: 'assets/logos/minotaur.svg', ratio: 5.305, posts: [] },
  { name: 'Nepher Robotics', logo: 'assets/logos/nepher.svg',   ratio: 7.334, posts: [] },
];
const TAGS = 'Visuals, branding and creative';

const TESTIMONIALS = [
  { quote: 'Client testimonial goes here. One or two lines on how Subnet Summer changed their visibility.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
  { quote: 'Second testimonial placeholder. A short line on community growth, Spaces or campaign results.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
  { quote: 'Third testimonial placeholder. Keep it to a sentence or two so the three quotes stay balanced.', name: 'Client name', role: 'Role, Subnet', placeholder: true },
];

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const logoH = (r, base) => Math.min(base * 0.78, Math.round(base / Math.sqrt(r)));   // equal optical area

/* ---------- client logo strip (brand colours, left to right) ---------- */
(function buildStrip() {
  const base = innerWidth < 760 ? 62 : 84;
  const set = CLIENTS.map(c => `<img src="${c.logo}" alt="${esc(c.name)}" style="--h:${logoH(c.ratio, base)}px">`).join('');
  const track = $('#logoTrack');
  track.innerHTML = set + set + set + set;   // two identical halves make a seamless loop
  $$('img', track).slice(CLIENTS.length).forEach(i => { i.alt = ''; i.setAttribute('aria-hidden', 'true'); });
})();

/* ---------- work highlights: equal cards ---------- */
const grid = $('#workGrid');
const cardBase = innerWidth < 760 ? 70 : 104;
CLIENTS.forEach((c, i) => {
  const card = document.createElement('article');
  card.className = 'wcard';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${c.name}: see the work`);
  card.dataset.reveal = '';
  card.innerHTML = `
    <div class="wlogo"><img src="${c.logo}" alt="${esc(c.name)} logo" style="--wh:${logoH(c.ratio, cardBase)}px"></div>
    <div class="winfo"><h3>${esc(c.name)}</h3><p>${TAGS}</p></div>`;
  card.addEventListener('click', () => openModal(i));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(i); } });
  grid.appendChild(card);
});
const cta = document.createElement('a');
cta.className = 'wcard wcard--cta';
cta.href = '#contact';
cta.dataset.reveal = '';
cta.innerHTML = '<div class="wlogo"><span>Your subnet<br>could be next</span></div><div class="winfo"><h3>Work with us</h3><p>Let\'s talk about your launch</p></div>';
grid.appendChild(cta);

/* ---------- posts panel ---------- */
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
  $('#modalLogo').src = c.logo;
  $('#modalTitle').textContent = c.name;
  $('#modalTags').textContent = TAGS;
  const body = $('#modalBody');
  if (!c.posts.length) {
    body.innerHTML = Array.from({ length: 6 }, () => '<div class="slot"><b>Post preview</b><span>Coming soon</span></div>').join('');
  } else {
    const isX = u => /^https?:\/\/(www\.)?(x|twitter)\.com\/.+\/status\//i.test(u);
    body.innerHTML = c.posts.map(u => isX(u)
      ? `<div class="embed"><blockquote class="twitter-tweet" data-theme="dark" data-dnt="true"><a href="${esc(u.replace('//x.com', '//twitter.com'))}">View post</a></blockquote></div>`
      : `<a class="post-link" href="${esc(u)}" target="_blank" rel="noopener"><b>Open post</b><span>${esc(u)}</span></a>`).join('');
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
addEventListener('keydown', e => { if (!modal.hidden && e.key === 'Escape') closeModal(); });

/* ---------- testimonials ---------- */
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

/* ---------- billing ---------- */
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

/* ---------- split-word headings, reveals, counters ---------- */
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
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  io.unobserve(en.target);
}), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
$$('[data-reveal], [data-split]:not(.hero-h)').forEach(el => io.observe(el));
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(() => $('.hero-h').classList.add('in')));

/* ---------- stat count-up ----------
   Each number is pinned to its final width first, so nothing shifts while it counts,
   then held at 0 until the stats are on screen and counted up once. */
(function counters() {
  const els = $$('[data-count]');
  const fmt = n => n.toLocaleString('en-US');
  if (reduce || !els.length) return;
  const pin = () => els.forEach(el => { el.style.minWidth = ''; el.textContent = fmt(+el.dataset.count); el.style.minWidth = el.getBoundingClientRect().width + 'px'; if (!el.dataset.done) el.textContent = '0'; });
  pin();
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(pin);
  addEventListener('resize', pin);
  const run = el => {
    const to = +el.dataset.count, dur = 1800, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(p < 1 ? Math.floor(to * e) : to);
      if (p < 1) requestAnimationFrame(tick); else el.dataset.done = '1';
    };
    requestAnimationFrame(tick);
  };
  const obs = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    els.forEach(run);
    obs.disconnect();
  }, { threshold: 0.4 });
  obs.observe($('.stats'));
})();

/* ---------- nav background once scrolled ---------- */
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
