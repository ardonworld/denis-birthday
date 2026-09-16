/* =========================================================
   Кухня и кальяны — по одному экрану на каждое, без длинной
   прокрутки. Композиция живёт сама: ролики блюд и кальянов
   крутятся, карточки плавают на разной глубине и отзываются
   на мышь, активная позиция меняется сама, как показ коктейлей.
   Наведение или нажатие перехватывает показ.
   ========================================================= */
import { Smoke, hexToRgb } from './smoke.js?v=202609162048';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;
const isPhone = () => innerWidth <= 760;

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

/* ролики грузим, только когда до секции докрутили */
const wake = (root) => {
  if (reduce) return;
  root.querySelectorAll('video').forEach((v) => {
    if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
    const p = v.play();
    if (p) p.catch(() => {});
  });
};
const sleep = (root) => root.querySelectorAll('video').forEach((v) => v.pause());

/* ролика ещё нет — остаётся постер, без ошибки в консоли */
document.querySelectorAll('video[data-src]').forEach((v) => {
  v.addEventListener('error', () => { v.removeAttribute('src'); v.load(); }, { once: true });
});

/* точка на медиа (доли кадра) → доли канваса, с учётом object-fit и object-position */
function pointOnCanvas(cv, box, media, fx, fy) {
  const b = box.getBoundingClientRect(), c = cv.getBoundingClientRect();
  const iw = media.videoWidth || media.naturalWidth || 9;
  const ih = media.videoHeight || media.naturalHeight || 16;
  const cs = getComputedStyle(media);
  const s = cs.objectFit === 'contain' ? Math.min(b.width / iw, b.height / ih) : Math.max(b.width / iw, b.height / ih);
  const [px, py] = cs.objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
  const x = b.left + (b.width - iw * s) * px + fx * iw * s;
  const y = b.top + (b.height - ih * s) * py + fy * ih * s;
  return [(x - c.left) / c.width, 1 - (y - c.top) / c.height];
}

/* общий цикл секции: крутится, только пока секция на экране */
function section(root, { frame }) {
  let raf = 0, visible = false;
  const loop = (t) => { frame(t); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !visible) {
      visible = true;
      root.classList.add('in');
      wake(root);
      if (!reduce) raf = requestAnimationFrame(loop);
    } else if (!e.isIntersecting && visible) {
      visible = false;
      cancelAnimationFrame(raf);
      sleep(root);
    }
  }, { threshold: 0.12 }).observe(root);
  return { isVisible: () => visible };
}

/* ---------- кухня ---------- */
(function kitchen() {
  const root = document.getElementById('kitchen');
  if (!root) return;
  const cards = [...root.querySelectorAll('.kx-card')];
  const info = root.querySelector('.kx-info');
  const badge = info.querySelector('.kx-info-badge');
  const nameEl = info.querySelector('.kx-info-name');
  const noteEl = info.querySelector('.kx-info-note');
  const pairEl = info.querySelector('.kx-info-pair');
  const dots = [...info.querySelectorAll('.kx-dots i')];
  const cv = root.querySelector('[data-smoke="kitchen"]');
  const smoke = cv ? new Smoke(cv, { scale: isPhone() ? 0.34 : 0.5 }) : null;
  if (smoke && !smoke.ok) cv.remove();
  const hero = cards[0];
  let active = 0, userUntil = 0;

  const setActive = (i, user) => {
    if (user) userUntil = performance.now() + 12000;
    if (i === active) return;
    active = i;
    const c = cards[i];
    cards.forEach((cc, k) => cc.classList.toggle('is-active', k === i));
    info.classList.remove('swap'); void info.offsetWidth;
    badge.hidden = !c.dataset.badge;
    badge.textContent = c.dataset.badge || '';
    nameEl.textContent = c.dataset.name;
    noteEl.textContent = c.dataset.note;
    pairEl.textContent = c.dataset.pair;
    info.classList.add('swap');
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  cards[0].classList.add('is-active');
  cards.forEach((c, i) => {
    if (canHover) c.addEventListener('pointerenter', () => setActive(i, true));
    c.addEventListener('click', () => setActive(i, true));
  });

  const sec = section(root, {
    frame(t) {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      /* каждая карточка плавает по-своему и сдвигается за мышью
         пропорционально глубине — отсюда объём композиции */
      cards.forEach((c, i) => {
        const d = +c.dataset.depth || 1;
        const ph = i * 1.37;
        const fx = Math.sin(t * 0.00042 + ph) * 7 * d;
        const fy = Math.cos(t * 0.00053 + ph) * 9 * d;
        const tx = -mouse.x * 16 * d + fx, ty = -mouse.y * 11 * d + fy;
        const on = i === active ? 1 : 0.45;
        c.style.transform =
          `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotateX(${(-mouse.y * 5 * on).toFixed(2)}deg) rotateY(${(mouse.x * 7 * on).toFixed(2)}deg) rotate(${(Math.sin(t * 0.0003 + ph) * 0.8).toFixed(2)}deg)`;
        c.style.setProperty('--gx', `${50 + mouse.x * 35}%`);
      });
      if (smoke && smoke.ok) {
        /* над шашлыком — тёплое марево и искры от углей */
        const v = hero.querySelector('.kx-media');
        smoke.set({
          sources: [{ src: pointOnCanvas(cv, hero, v, 0.46, 0.46), tint: [1, 0.72, 0.45],
            amount: active === 0 ? 0.5 : 0.26, spread: 0.3, rise: 0.32 }],
          sparks: active === 0 ? 1 : 0.5,
          sparkSrc: pointOnCanvas(cv, hero, v, 0.46, 0.62),
          sparkW: (hero.getBoundingClientRect().width / cv.getBoundingClientRect().width) * 0.42,
          wind: mouse.x * 0.35,
        });
        smoke.frame();
      }
    },
  });

  /* сама листает блюда, пока её не трогают */
  if (!reduce) setInterval(() => {
    if (!sec.isVisible() || performance.now() < userUntil) return;
    setActive((active + 1) % cards.length);
  }, 4200);
}());

/* ---------- переход от кухни к кальянам ---------- */
(function seam() {
  const root = document.getElementById('seam');
  const kitchenWrap = document.querySelector('#kitchen .kx-wrap');
  const hookahWrap = document.querySelector('#tobacco .hx-wrap');
  if (!root) return;
  const cv = root.querySelector('[data-smoke="seam"]');
  const smoke = cv ? new Smoke(cv, { scale: isPhone() ? 0.3 : 0.4 }) : null;
  if (smoke && !smoke.ok) cv.remove();
  const clamp = (v) => Math.min(1, Math.max(0, v));

  /* кухня уходит в дымку, кальяны выходят из неё — привязано к прокрутке,
     но переход короткий: полэкрана, а не отдельная сцена */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      if (reduce) return;
      const vh = innerHeight;
      const k = kitchenWrap.getBoundingClientRect();
      const out = clamp(-k.top / (k.height * 0.7));
      kitchenWrap.style.opacity = String(1 - out * 0.75);
      kitchenWrap.style.filter = out > 0.01 ? `blur(${(out * 10).toFixed(1)}px)` : '';
      kitchenWrap.style.transform = `scale(${(1 - out * 0.05).toFixed(3)})`;
      const h = hookahWrap.getBoundingClientRect();
      const inn = clamp((vh - h.top) / (vh * 0.8));
      hookahWrap.style.opacity = String(0.25 + inn * 0.75);
      hookahWrap.style.transform = `translate3d(0, ${((1 - inn) * 60).toFixed(1)}px, 0)`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const tints = [[1, 0.62, 0.3], [1, 0.72, 0.5], [0.72, 0.58, 1], [0.6, 0.48, 1]];
  let raf = 0;
  const loop = () => {
    if (smoke && smoke.ok) {
      smoke.set({
        sources: [0.12, 0.38, 0.62, 0.88].map((x, i) => ({
          src: [x, -0.05], tint: tints[i], amount: 0.85, spread: 0.9, rise: 0.9,
        })),
        wind: mouse.x * 0.4,
      });
      smoke.frame();
    }
    raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([e]) => {
    root.classList.toggle('in', e.isIntersecting);
    if (e.isIntersecting && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    else cancelAnimationFrame(raf);
  }, { threshold: 0.2 }).observe(root);
}());

/* ---------- кальяны ---------- */
(function hookahs() {
  const root = document.getElementById('tobacco');
  if (!root) return;
  const cards = [...root.querySelectorAll('.hx-card')];
  const info = root.querySelector('.hx-info');
  const cv = root.querySelector('[data-smoke="hookah"]');
  const smoke = cv ? new Smoke(cv, { scale: isPhone() ? 0.34 : 0.45 }) : null;
  if (smoke && !smoke.ok) cv.remove();
  let active = 0, userUntil = 0;

  const setActive = (i, user) => {
    if (user) userUntil = performance.now() + 14000;
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    const c = cards[i];
    info.classList.remove('swap'); void info.offsetWidth;
    info.querySelector('.hx-name').textContent = c.dataset.name;
    info.querySelector('.hx-desc').textContent = c.dataset.desc;
    info.querySelector('.k-pair').textContent = c.dataset.pair;
    info.style.setProperty('--h-accent', c.style.getPropertyValue('--h-accent'));
    info.classList.add('swap');
    if (smoke && smoke.ok) smoke.burst(i);
  };
  cards[0].classList.add('is-active');
  cards.forEach((c, i) => {
    if (canHover) c.addEventListener('pointerenter', () => setActive(i, true));
    /* нажатие по активному кальяну — выдох, по другому — переключение */
    c.addEventListener('click', () => {
      if (i === active) { userUntil = performance.now() + 14000; if (smoke && smoke.ok) smoke.burst(i); }
      else setActive(i, true);
    });
  });

  const sec = section(root, {
    frame() {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      cards.forEach((c) => {
        const m = c.querySelector('.hx-media');
        m.style.transform = `translate3d(${(-mouse.x * 8).toFixed(1)}px, ${(-mouse.y * 6).toFixed(1)}px, 0) scale(1.06)`;
      });
      if (smoke && smoke.ok) {
        smoke.set({
          sources: cards.map((c, i) => {
            const [fx, fy] = c.dataset.bowl.split(',').map(Number);
            const on = i === active;
            return { src: pointOnCanvas(cv, c, c.querySelector('.hx-media'), fx, fy),
              tint: hexToRgb(c.style.getPropertyValue('--h-accent').trim()),
              amount: on ? 0.8 : 0.3, spread: on ? 0.3 : 0.16, rise: on ? 0.5 : 0.3 };
          }),
          wind: mouse.x * 0.5,
        });
        smoke.frame();
      }
    },
  });

  if (!reduce) setInterval(() => {
    if (!sec.isVisible() || performance.now() < userUntil) return;
    setActive((active + 1) % cards.length);
  }, 5200);
}());
