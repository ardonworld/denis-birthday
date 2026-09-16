/* =========================================================
   Кухня и кальяны: сцены, которыми управляет прокрутка.
   Каждая сцена — высокая секция с приклеенным к экрану кадром;
   прогресс прокрутки внутри секции (0..1) режиссирует всё
   происходящее в кадре. Приём тот же, что у Apple на страницах
   iPhone: не анимация «по таймеру», а плёнка, которую крутит палец.
   ========================================================= */
import { Smoke, hexToRgb } from './smoke.js?v=202609161951';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p, a, b) => clamp((p - a) / (b - a));       // прогресс внутри отрезка
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - t, 3);
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const isPhone = () => innerWidth <= 760;

/* точка на фото → доли канваса. Учитываем, как фото вписано:
   cover или contain, и куда сдвинуто (object-position) */
function coverPoint(box, img, fx, fy) {
  const cw = box.clientWidth, ch = box.clientHeight;
  const iw = img.naturalWidth || 9, ih = img.naturalHeight || 16;
  const cs = getComputedStyle(img);
  const s = cs.objectFit === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
  const [px, py] = cs.objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
  const x = (cw - iw * s) * px + fx * iw * s;
  const y = (ch - ih * s) * py + fy * ih * s;
  return [x / cw, 1 - y / ch];
}

/* мышь (или наклон телефона) — плавно, чтобы кадр «дышал», а не дёргался */
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

const smokes = {};
function smokeFor(name, opts) {
  const cv = document.querySelector(`[data-smoke="${name}"]`);
  if (!cv) return null;
  const s = new Smoke(cv, { scale: isPhone() ? 0.34 : 0.5, ...opts });
  if (!s.ok) { cv.remove(); return null; }
  smokes[name] = s;
  return s;
}

/* ---------- 1. фирменное: рамка вырастает на весь экран ---------- */
function sigScene(root) {
  const frame = root.querySelector('.kx-frame');
  const img = root.querySelector('.kx-frame-img');
  const intro = root.querySelector('.kx-intro');
  const shade = root.querySelector('.kx-shade');
  const copy = root.querySelector('.kx-sig-copy');
  const lines = [...copy.querySelectorAll('.kx-line')];
  const smoke = smokeFor('sig', { tint: [1, 0.72, 0.45], spread: 0.55, rise: 0.5, sparks: 0.6, amount: 0.4 });

  return {
    smoke,
    update(p) {
      const vw = innerWidth, vh = innerHeight;
      const g = easeIO(range(p, 0.03, 0.46));
      const cardW = Math.min(vw * (isPhone() ? 0.86 : 0.5), 780);
      const cardH = Math.min(vh * 0.4, cardW * 0.62);
      const off = vh * (isPhone() ? 0.16 : 0.2) * (1 - g); // карточка стоит ниже заголовка
      const ix = ((vw - cardW) / 2) * (1 - g);
      const iy = ((vh - cardH) / 2) * (1 - g);
      frame.style.clipPath = `inset(${iy + off}px ${ix}px ${Math.max(iy - off, 0)}px ${ix}px round ${lerp(28, 0, g)}px)`;

      const exit = range(p, 0.82, 1);
      const aside = isPhone() ? 0 : ease(range(p, 0.4, 0.62)) * vw * 0.16;   // фото уступает место тексту
      img.style.transform =
        `translate3d(${aside - mouse.x * 14 * g}px, ${-mouse.y * 10 * g - exit * 60}px, 0) scale(${lerp(1.34, 1.1, g)})`;

      const iOut = range(p, 0, 0.2);
      intro.style.opacity = String(1 - iOut);
      intro.style.transform = `translate3d(0, ${-iOut * 90}px, 0) scale(${1 - iOut * 0.06})`;

      shade.style.opacity = String(lerp(0, 0.66, range(p, 0.38, 0.6)));

      /* строки проявляются по одной снизу, из-под маски */
      lines.forEach((l, i) => l.style.setProperty('--t', ease(range(p, 0.5 + i * 0.05, 0.66 + i * 0.05)).toFixed(3)));
      copy.style.transform = `translate3d(0, ${-exit * 70}px, 0)`;
      copy.style.opacity = String(1 - range(p, 0.9, 1));

      if (smoke) {
        smoke.set({ amount: lerp(0.25, 0.85, g), sparks: lerp(0.3, 1, g), wind: mouse.x * 0.4,
          src: coverPoint(frame, img, 0.5, 0.56) });
      }
    },
  };
}

/* ---------- 2. лента блюд в 3D ---------- */
function reelScene(root) {
  const cards = [...root.querySelectorAll('.kx-card')];
  const N = cards.length;
  const nameEl = root.querySelector('.kx-info-name');
  const noteEl = root.querySelector('.kx-info-note');
  const pairEl = root.querySelector('.kx-info-pair');
  const info = root.querySelector('.kx-info');
  const countEl = root.querySelector('.kx-count b');
  const dots = [...root.querySelectorAll('.kx-dots i')];
  const ambient = root.querySelector('.kx-ambient');
  ambient.innerHTML = cards.map((c) => `<img src="${c.querySelector('img').src}" alt="">`).join('');
  const ambImgs = [...ambient.querySelectorAll('img')];
  let active = -1;

  const show = (i) => {
    if (i === active) return;
    active = i;
    const c = cards[i];
    info.classList.remove('swap');
    void info.offsetWidth;
    nameEl.textContent = c.dataset.name;
    noteEl.textContent = c.dataset.note;
    pairEl.textContent = c.dataset.pair;
    info.classList.add('swap');
    countEl.textContent = String(i + 1).padStart(2, '0');
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    ambImgs.forEach((im, k) => im.classList.toggle('on', k === i));
    cards.forEach((cc, k) => cc.classList.toggle('is-active', k === i));
  };

  return {
    update(p) {
      /* на каждом блюде лента задерживается, между ними — быстрый перелёт */
      const raw = p * (N - 1);
      const seg = Math.min(Math.floor(raw), N - 2);
      const local = raw - seg;
      const pos = seg + easeIO(clamp((local - 0.28) / 0.44));
      const phone = isPhone();
      const gap = phone ? innerWidth * 0.66 : Math.min(innerWidth * 0.26, 400);

      cards.forEach((c, i) => {
        const o = i - pos, a = Math.abs(o);
        const x = o * gap;
        const z = -Math.min(a, 3) * (phone ? 240 : 360);
        const ry = clamp(-o * 40, -72, 72);
        const s = 1 - Math.min(a, 2) * 0.1;
        const near = clamp(1 - a * 2);                        // живой тилт только у активного
        const tx = mouse.y * -7 * near, ty = mouse.x * 10 * near;
        c.style.transform =
          `translate3d(${x}px, 0, ${z}px) rotateY(${ry + ty}deg) rotateX(${tx}deg) scale(${s})`;
        c.style.opacity = String(clamp(1.35 - a * 0.42));
        c.style.filter = `brightness(${(1 - Math.min(a, 1.6) * 0.42).toFixed(3)})`;
        c.style.zIndex = String(100 - Math.round(a * 10));
        c.style.setProperty('--gx', `${50 + mouse.x * 30 * near - o * 40}%`);
        c.style.setProperty('--ga', (0.08 + near * 0.22).toFixed(3));
      });
      show(Math.round(pos));
    },
  };
}

/* ---------- 3. туман уводит к кальянам ---------- */
function fogScene(root) {
  const img = root.querySelector('.kx-fog-img');
  const copy = root.querySelector('.kx-fog-copy');
  const lines = [...copy.querySelectorAll('.kx-line')];
  const smoke = smokeFor('fog', { tint: [1, 0.78, 0.55], spread: 1.2, rise: 1.4, fill: 0, amount: 0.8 });
  return {
    smoke,
    update(p) {
      const a = range(p, 0, 0.4);
      img.style.opacity = String(lerp(0, 0.85, a) * (1 - range(p, 0.88, 1)));
      img.style.transform = `translate3d(${-mouse.x * 20}px, ${-p * 60}px, 0) scale(${lerp(1.3, 1.04, ease(range(p, 0, 0.7)))})`;
      lines.forEach((l, i) => l.style.setProperty('--t', ease(range(p, 0.26 + i * 0.09, 0.46 + i * 0.09)).toFixed(3)));
      copy.style.opacity = String(1 - range(p, 0.86, 1));
      copy.style.transform = `translate3d(0, ${-range(p, 0.7, 1) * 60}px, 0) scale(${lerp(0.94, 1.04, p)})`;
      if (smoke) smoke.set({ fill: lerp(0, 0.95, range(p, 0.05, 0.55)), wind: mouse.x * 0.5, src: [0.5, -0.05] });
    },
  };
}

/* ---------- 4. кальяны: прокрутка переключает вкус ---------- */
function hookahScene(root) {
  const shots = [...root.querySelectorAll('.hx-shot')];
  const items = [...root.querySelectorAll('.hx-item')];
  const media = root.querySelector('.hx-media');
  const N = shots.length;
  const smoke = smokeFor('hookah', { spread: 0.34, rise: 0.62, amount: 0.9, tint: hexToRgb(shots[0].dataset.tint) });
  let active = -1;

  const aim = (i) => {
    const sh = shots[i];
    const [fx, fy] = sh.dataset.bowl.split(',').map(Number);
    return coverPoint(media, sh.querySelector('img'), fx, fy);
  };
  const show = (i) => {
    if (i === active) return;
    const first = active === -1;
    active = i;
    shots.forEach((s, k) => s.classList.toggle('is-active', k === i));
    items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    if (smoke) {
      smoke.set({ tint: hexToRgb(shots[i].dataset.tint), src: aim(i) });
      if (!first) smoke.burst();
    }
  };
  /* тап по кальяну — выдох */
  media.addEventListener('pointerdown', () => smoke && smoke.burst());
  addEventListener('resize', () => active >= 0 && smoke && smoke.set({ src: aim(active) }));
  shots.forEach((s) => s.querySelector('img').addEventListener('load', () => active >= 0 && smoke && smoke.set({ src: aim(active) })));

  return {
    smoke,
    update(p) {
      const f = clamp(p * N, 0, N - 0.0001);
      const i = Math.floor(f);
      show(i);
      items.forEach((it, k) => it.style.setProperty('--fill', k < i ? 1 : k > i ? 0 : (f - i).toFixed(3)));
      const img = shots[i].querySelector('img');
      img.style.transform = `translate3d(${-mouse.x * 12}px, ${-mouse.y * 8}px, 0) scale(1.06)`;
      if (smoke) smoke.set({ wind: mouse.x * 0.7 });
    },
  };
}

/* ---------- движок ---------- */
const builders = { sig: sigScene, reel: reelScene, fog: fogScene, hookah: hookahScene };
const scenes = [...document.querySelectorAll('[data-scene]')].map((el) => ({
  el, api: builders[el.dataset.scene](el), visible: false,
}));

if (reduce) {
  /* без движения: всё сразу в финальном состоянии, сцены разложены обычным списком */
  document.body.classList.add('kx-static');
  scenes.forEach((s) => s.api.update(s.el.dataset.scene === 'reel' || s.el.dataset.scene === 'hookah' ? 0 : 0.7));
} else {
  /* дым рисуем только у видимой сцены — на телефоне три шейдера сразу не нужны */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const sc = scenes.find((s) => s.el === e.target);
    if (!sc) return;
    sc.visible = e.isIntersecting;
    if (sc.api.smoke) (sc.visible ? sc.api.smoke.start() : sc.api.smoke.stop());
  }), { rootMargin: '10% 0px' });
  scenes.forEach((s) => io.observe(s.el));

  const tick = () => {
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const vh = innerHeight;
    scenes.forEach((s) => {
      if (!s.visible) return;
      const r = s.el.getBoundingClientRect();
      const total = r.height - vh;
      s.api.update(total > 0 ? clamp(-r.top / total) : 0);
    });
    requestAnimationFrame(tick);
  };
  tick();
}
