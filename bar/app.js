import * as __THREE from 'three';
import { BarScene, detectQuality } from './scene3d.js?v=202609162124';
import './kitchen.js?v=202609162124';
window.__THREE = __THREE;

/* =========================================================
   3 РЕЗИДЕНЦИЯ — бар, кухня, табак
   Вся графика нарисована вручную в SVG: стекло, лёд, гарнир.
   ========================================================= */

/* ---------- вспомогательное ---------- */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

/* Общие куски стекла: блик, тень, ободок */
function glassDefs(id, liquidTop, liquidBottom) {
  return `<defs>
    <linearGradient id="liq-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${liquidTop}"/>
      <stop offset="55%" stop-color="${liquidBottom}"/>
      <stop offset="100%" stop-color="${liquidBottom}" stop-opacity="0.92"/>
    </linearGradient>
    <linearGradient id="gls-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="18%" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.26"/>
    </linearGradient>
    <linearGradient id="shine-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${liquidTop}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${liquidTop}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-${id}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>`;
}

const shadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="0.5" filter="url(#soft-sh)"/>`;

/* Кружок цитруса */
function citrus(cx, cy, r, rot, outer, inner) {
  let segs = '';
  for (let i = 0; i < 8; i++) {
    const a1 = (i * 45 + 3) * Math.PI / 180, a2 = ((i + 1) * 45 - 3) * Math.PI / 180;
    segs += `<path d="M0 0 L${Math.cos(a1) * r * 0.78} ${Math.sin(a1) * r * 0.78}
      A${r * 0.78} ${r * 0.78} 0 0 1 ${Math.cos(a2) * r * 0.78} ${Math.sin(a2) * r * 0.78} Z" fill="${inner}"/>`;
  }
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <circle r="${r}" fill="${outer}"/>
    <circle r="${r * 0.86}" fill="#fff8e6" opacity="0.9"/>
    ${segs}
    <circle r="${r}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
  </g>`;
}

const mint = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M0 0 C18 -12 34 -6 40 6 C26 20 8 16 0 0 Z" fill="#3f9b46"/>
  <path d="M0 0 C18 -12 34 -6 40 6" fill="none" stroke="#2a6e30" stroke-width="2"/>
  <path d="M8 3 L30 -1M14 8 L34 4" stroke="#2a6e30" stroke-width="1.4" opacity="0.8"/>
</g>`;

const bubbles = (id, n, x0, x1, y0, y1) => {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.random() * (x1 - x0);
    const y = y0 + Math.random() * (y1 - y0);
    const r = 1.8 + Math.random() * 3.4;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.18 + Math.random() * 0.3).toFixed(2)}"/>`;
  }
  return s;
};

const iceCube = (x, y, w, h, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.18}"
    fill="#ffffff" opacity="0.22"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * 0.18}"
    fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="1.6"/>
  <path d="M${-w / 2 + 5} ${-h / 2 + 6} L${-w / 2 + 5} ${h / 2 - 6}" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
</g>`;

/* ---------- стаканы ---------- */
function glassRocks(id, top, bottom) {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    ${glassDefs(id, top, bottom)}
    <filter id="soft-sh" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <ellipse cx="150" cy="255" rx="128" ry="128" fill="url(#glow-${id})"/>
    ${shadow(150, 408, 78, 15)}
    <path d="M92 186 h116 l-9 196 a14 14 0 0 1 -14 13 h-70 a14 14 0 0 1 -14 -13 z" fill="url(#gls-${id})"/>
    <clipPath id="clip-${id}"><path d="M92 186 h116 l-9 196 a14 14 0 0 1 -14 13 h-70 a14 14 0 0 1 -14 -13 z"/></clipPath>
    <g clip-path="url(#clip-${id})">
      <path d="M96 232 h108 l-8 150 a14 14 0 0 1 -14 13 h-64 a14 14 0 0 1 -14 -13 z" fill="url(#liq-${id})"/>
      <ellipse cx="150" cy="232" rx="54" ry="11" fill="${top}" opacity="0.95"/>
      ${iceCube(126, 262, 52, 52, -12)}
      ${iceCube(178, 296, 46, 46, 16)}
      <path d="M92 186 h30 l-8 209 h-24 z" fill="url(#shine-${id})" opacity="0.5"/>
    </g>
    <path d="M92 186 h116 l-9 196 a14 14 0 0 1 -14 13 h-70 a14 14 0 0 1 -14 -13 z"
      fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <ellipse cx="150" cy="186" rx="58" ry="12" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="3.5"/>
    <ellipse cx="150" cy="186" rx="58" ry="12" fill="#fff" opacity="0.07"/>
    <g transform="translate(196 176)">
      <path d="M0 0 C22 -6 34 8 26 24 C18 38 -2 36 -8 22" fill="none" stroke="#f0932b" stroke-width="9" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function glassHighball(id, top, bottom) {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    ${glassDefs(id, top, bottom)}
    <filter id="soft-sh" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <ellipse cx="150" cy="250" rx="126" ry="126" fill="url(#glow-${id})"/>
    ${shadow(150, 418, 62, 13)}
    <path d="M108 96 h84 l-5 300 a12 12 0 0 1 -12 11 h-50 a12 12 0 0 1 -12 -11 z" fill="url(#gls-${id})"/>
    <clipPath id="clip-${id}"><path d="M108 96 h84 l-5 300 a12 12 0 0 1 -12 11 h-50 a12 12 0 0 1 -12 -11 z"/></clipPath>
    <g clip-path="url(#clip-${id})">
      <path d="M110 150 h80 l-5 246 a12 12 0 0 1 -12 11 h-46 a12 12 0 0 1 -12 -11 z" fill="url(#liq-${id})"/>
      <ellipse cx="150" cy="150" rx="40" ry="9" fill="${top}" opacity="0.95"/>
      ${bubbles(id, 26, 116, 184, 168, 390)}
      ${iceCube(133, 210, 40, 40, -14)}
      ${iceCube(166, 268, 36, 36, 12)}
      ${mint(120, 176, 0.85, -20)}
      ${mint(150, 196, 0.7, 150)}
      ${citrus(172, 320, 26, 20, '#8bc34a', '#c7e59a')}
      <path d="M108 96 h22 l-5 311 h-18 z" fill="url(#shine-${id})" opacity="0.45"/>
      <rect x="160" y="60" width="11" height="200" rx="5" fill="#ffffff" opacity="0.5" transform="rotate(9 165 160)"/>
    </g>
    <path d="M108 96 h84 l-5 300 a12 12 0 0 1 -12 11 h-50 a12 12 0 0 1 -12 -11 z"
      fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <ellipse cx="150" cy="96" rx="42" ry="10" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="3.5"/>
    <ellipse cx="150" cy="96" rx="42" ry="10" fill="#fff" opacity="0.07"/>
    <rect x="163" y="42" width="11" height="70" rx="5" fill="#e8f5c9" opacity="0.95" transform="rotate(9 168 70)"/>
    ${mint(178, 72, 0.9, -30)}
  </svg>`;
}

function glassSpritz(id, top, bottom) {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    ${glassDefs(id, top, bottom)}
    <filter id="soft-sh" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <ellipse cx="150" cy="230" rx="130" ry="130" fill="url(#glow-${id})"/>
    ${shadow(150, 424, 66, 13)}
    <path d="M84 120 h132 c0 78 -30 118 -66 124 c-36 -6 -66 -46 -66 -124 z" fill="url(#gls-${id})"/>
    <clipPath id="clip-${id}"><path d="M84 120 h132 c0 78 -30 118 -66 124 c-36 -6 -66 -46 -66 -124 z"/></clipPath>
    <g clip-path="url(#clip-${id})">
      <path d="M88 152 h124 c0 70 -28 106 -62 112 c-34 -6 -62 -42 -62 -112 z" fill="url(#liq-${id})"/>
      <ellipse cx="150" cy="152" rx="62" ry="12" fill="${top}" opacity="0.95"/>
      ${bubbles(id, 22, 96, 204, 160, 240)}
      ${iceCube(124, 182, 44, 44, -10)}
      ${iceCube(172, 196, 38, 38, 18)}
      <path d="M84 120 h24 c2 62 14 96 30 116 l-18 6 c-24 -24 -36 -62 -36 -122 z" fill="url(#shine-${id})" opacity="0.5"/>
    </g>
    <path d="M84 120 h132 c0 78 -30 118 -66 124 c-36 -6 -66 -46 -66 -124 z"
      fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <ellipse cx="150" cy="120" rx="66" ry="13" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="3.5"/>
    <ellipse cx="150" cy="120" rx="66" ry="13" fill="#fff" opacity="0.07"/>
    <path d="M146 244 h8 v122 h-8 z" fill="#ffffff" opacity="0.28"/>
    <path d="M146 244 h8 v122 h-8 z" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="2"/>
    <ellipse cx="150" cy="370" rx="52" ry="11" fill="#ffffff" opacity="0.2"/>
    <ellipse cx="150" cy="370" rx="52" ry="11" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="2.5"/>
    ${citrus(206, 128, 34, -14, '#ff9f1a', '#ffd08a')}
  </svg>`;
}

function glassCoupe(id, top, bottom) {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    ${glassDefs(id, top, bottom)}
    <filter id="soft-sh" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <ellipse cx="150" cy="220" rx="128" ry="128" fill="url(#glow-${id})"/>
    ${shadow(150, 424, 62, 12)}
    <path d="M72 150 h156 c-4 62 -36 98 -78 98 c-42 0 -74 -36 -78 -98 z" fill="url(#gls-${id})"/>
    <clipPath id="clip-${id}"><path d="M72 150 h156 c-4 62 -36 98 -78 98 c-42 0 -74 -36 -78 -98 z"/></clipPath>
    <g clip-path="url(#clip-${id})">
      <path d="M76 168 h148 c-4 56 -34 88 -74 88 c-40 0 -70 -32 -74 -88 z" fill="url(#liq-${id})"/>
      <ellipse cx="150" cy="170" rx="74" ry="15" fill="#c9a06a" opacity="0.95"/>
      <ellipse cx="150" cy="170" rx="74" ry="15" fill="#e3c191" opacity="0.55"/>
      <path d="M72 150 h22 c2 44 14 72 30 88 l-16 8 c-24 -22 -34 -54 -36 -96 z" fill="url(#shine-${id})" opacity="0.5"/>
    </g>
    <path d="M72 150 h156 c-4 62 -36 98 -78 98 c-42 0 -74 -36 -78 -98 z"
      fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <ellipse cx="150" cy="150" rx="78" ry="15" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="3.5"/>
    <g>
      <ellipse cx="132" cy="166" rx="9" ry="6.5" fill="#3a2415" transform="rotate(-16 132 166)"/>
      <ellipse cx="150" cy="162" rx="9" ry="6.5" fill="#3a2415" transform="rotate(6 150 162)"/>
      <ellipse cx="168" cy="167" rx="9" ry="6.5" fill="#3a2415" transform="rotate(20 168 167)"/>
      <path d="M132 160.5v11M150 156.5v11M168 161.5v11" stroke="#miss" stroke-width="0"/>
    </g>
    <path d="M146 248 h8 v120 h-8 z" fill="#ffffff" opacity="0.28"/>
    <path d="M146 248 h8 v120 h-8 z" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="2"/>
    <ellipse cx="150" cy="372" rx="50" ry="11" fill="#ffffff" opacity="0.2"/>
    <ellipse cx="150" cy="372" rx="50" ry="11" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="2.5"/>
  </svg>`;
}

function glassHurricane(id, top, bottom) {
  return `<svg viewBox="0 0 300 460" xmlns="http://www.w3.org/2000/svg">
    ${glassDefs(id, top, bottom)}
    <filter id="soft-sh" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="12"/></filter>
    <ellipse cx="150" cy="240" rx="128" ry="128" fill="url(#glow-${id})"/>
    ${shadow(150, 420, 64, 13)}
    <path d="M96 104 c0 44 -14 62 -14 104 c0 52 26 78 34 132 h68 c8 -54 34 -80 34 -132 c0 -42 -14 -60 -14 -104 z" fill="url(#gls-${id})"/>
    <clipPath id="clip-${id}"><path d="M96 104 c0 44 -14 62 -14 104 c0 52 26 78 34 132 h68 c8 -54 34 -80 34 -132 c0 -42 -14 -60 -14 -104 z"/></clipPath>
    <g clip-path="url(#clip-${id})">
      <path d="M86 168 h128 c4 46 -26 72 -34 172 h-60 c-8 -100 -38 -126 -34 -172 z" fill="url(#liq-${id})"/>
      <ellipse cx="150" cy="170" rx="64" ry="13" fill="${top}" opacity="0.95"/>
      ${bubbles(id, 24, 96, 204, 180, 330)}
      ${iceCube(128, 206, 42, 42, -12)}
      ${iceCube(172, 240, 36, 36, 14)}
      <path d="M96 104 c0 44 -12 62 -12 104 c0 44 18 68 28 116 l-20 4 c-12 -50 -30 -74 -30 -120 c0 -44 14 -62 14 -104 z" fill="url(#shine-${id})" opacity="0.45"/>
    </g>
    <path d="M96 104 c0 44 -14 62 -14 104 c0 52 26 78 34 132 h68 c8 -54 34 -80 34 -132 c0 -42 -14 -60 -14 -104 z"
      fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3"/>
    <ellipse cx="150" cy="104" rx="54" ry="12" fill="none" stroke="#fff" stroke-opacity="0.75" stroke-width="3.5"/>
    <ellipse cx="150" cy="104" rx="54" ry="12" fill="#fff" opacity="0.07"/>
    <ellipse cx="150" cy="352" rx="46" ry="11" fill="#ffffff" opacity="0.2"/>
    <ellipse cx="150" cy="352" rx="46" ry="11" fill="none" stroke="#fff" stroke-opacity="0.45" stroke-width="2.5"/>
    <rect x="178" y="46" width="10" height="90" rx="5" fill="#ffd166" opacity="0.9" transform="rotate(12 183 90)"/>
    ${citrus(112, 100, 30, 16, '#ffd93d', '#fff0a8')}
  </svg>`;
}

/* ---------- данные бара ---------- */
const COCKTAILS = [
  /* ---------- АКТ ПЕРВЫЙ: лёгкие и классика ---------- */
  {
    id: 'bellini', act: 1, name: 'Беллини', accent: '#ff9a6b',
    kind: 'hurricane', liquid: '#f7a35c', fizz: true,
    lead: 'Персик и просекко. С него начинают, когда вечер ещё только разгоняется.',
    base: 'Просекко', abv: '8%', vol: '150 мл', serve: 'Флейта, без льда',
    recipe: ['Просекко — 100 мл', 'Пюре белого персика — 50 мл', 'Капля персикового ликёра'],
    taste: ['персик', 'лёгкий', 'игристый', 'сладковатый'],
    pairing: 'Сырная тарелка, брускетты, лёгкие закуски.',
  },
  {
    id: 'cosmo', act: 1, name: 'Космополитен', accent: '#e8456f',
    kind: 'coupe', liquid: '#c9184a', garnish: 'lime',
    lead: 'Клюква, лайм и холодный бокал. Тот случай, когда простое выглядит дорого.',
    base: 'Водка', abv: '20%', vol: '110 мл', serve: 'Мартини, цедра лайма',
    recipe: ['Водка — 40 мл', 'Куантро — 20 мл', 'Клюквенный морс — 30 мл', 'Сок лайма — 15 мл'],
    taste: ['кисло-сладкий', 'ягодный', 'цитрус', 'освежающий'],
    pairing: 'Севиче, креветки, лёгкие салаты.',
  },
  {
    id: 'sunrise', act: 1, name: 'Текила Санрайз', accent: '#ff7a2f',
    kind: 'highball', liquid: '#ff9e2c', deep: '#c1121f', ice: true, garnish: 'orange', straw: true,
    lead: 'Гренадин оседает на дно, апельсин остаётся сверху — в бокале получается рассвет.',
    base: 'Текила', abv: '11%', vol: '200 мл', serve: 'Хайбол, много льда',
    recipe: ['Текила бланко — 50 мл', 'Апельсиновый сок — 100 мл', 'Гренадин — 15 мл', 'Долька апельсина'],
    taste: ['апельсин', 'сладкий', 'мягкий', 'гранат'],
    pairing: 'Тако, начос, фрукты.',
  },
  {
    id: 'paloma', act: 1, name: 'Палома', accent: '#f2557d',
    kind: 'highball', liquid: '#f06a86', fizz: true, ice: true, garnish: 'grapefruit', rim: 'salt', straw: true,
    lead: 'Грейпфрут, текила и соль на кромке. Мексика без лишнего пафоса.',
    base: 'Текила', abv: '12%', vol: '300 мл', serve: 'Хайбол, соляная кромка',
    recipe: ['Текила бланко — 50 мл', 'Грейпфрутовый содовый — 150 мл', 'Сок лайма — 15 мл', 'Щепотка соли'],
    taste: ['горьковатый', 'цитрус', 'освежающий', 'солоноватый'],
    pairing: 'Тако, начос, острое.',
  },
  {
    id: 'pornstar', act: 1, name: 'Pornstar Martini', accent: '#f0a92e',
    kind: 'wine', liquid: '#f2b33a', foam: '#f9e2a8',
    lead: 'Ваниль и маракуйя в бокале, игристое — отдельным шотом. Выпивается быстрее, чем обсуждается название.',
    base: 'Ванильная водка', abv: '16%', vol: '110 мл + 50 мл', serve: 'Купе, шот просекко рядом',
    recipe: ['Ванильная водка — 45 мл', 'Сок маракуйи — 30 мл', 'Ванильный сироп — 15 мл',
             'Сок лайма — 15 мл', 'Просекко брют — 50 мл отдельно'],
    taste: ['ваниль', 'маракуйя', 'сладко-кислый', 'игристый'],
    pairing: 'Десерты, фрукты, сырная тарелка.',
  },

  /* ---------- АКТ ВТОРОЙ: фирменные крепкие ---------- */
  {
    id: 'tvr', act: 2, name: 'TVR', accent: '#c8571f',
    kind: 'tall', liquid: '#b8621d', fizz: true, ice: true, straw: true,
    lead: 'Назван в честь британского спорткара TVR — разгоняет ровно так же. Брутальный микс из английских пабов.',
    base: 'Текила и водка', abv: '11%', vol: '210 мл', serve: 'Хайбол, много льда',
    recipe: ['Серебряная текила — 30 мл', 'Водка — 30 мл', 'Энергетик — 150 мл', 'Лёд'],
    taste: ['резкий', 'агава', 'сладкий', 'бодрящий'],
    pairing: 'Максимальный эффект минимумом ингредиентов.',
  },
  {
    id: 'ginfizz', act: 2, name: 'Итальянский Джин-Физз', accent: '#f6c445',
    kind: 'tumbler', liquid: '#f0b13c', fizz: true, ice: true, garnish: 'lemon', straw: true,
    lead: 'Джин, лимончелло и маракуйя, сверху просекко. Итальянский ответ на вопрос, что пить, когда жарко.',
    base: 'Джин', abv: '16%', vol: '160 мл', serve: 'Хайбол, много льда',
    recipe: ['Джин — 40 мл', 'Лимончелло — 20 мл', 'Сок с маракуйей — 40 мл', 'Просекко брют — 60 мл'],
    taste: ['цитрус', 'маракуйя', 'игристый', 'сухой'],
    pairing: 'Морепродукты, лёгкие закуски, сыр.',
  },
  {
    id: 'jager', act: 2, name: 'Атомный Егерь', accent: '#4fae5a',
    kind: 'highball', liquid: '#2f6b2f', fizz: true, ice: true,
    lead: 'Усиленная егербомба: здесь ликёр не просто сбрасывают в энергетик, здесь правила жёстче.',
    base: 'Егермейстер и водка', abv: '11%', vol: '210 мл', serve: 'Хайбол, шот внутрь',
    recipe: ['Водка — 30 мл', 'Jägermeister — 30 мл', 'Red Bull — 150 мл'],
    taste: ['горько-сладкий', 'травяной', 'медицинский финиш', 'разрушительный'],
    pairing: 'Водка растворяется незаметно — и в этом весь подвох.',
  },
  {
    id: 'sour', act: 2, name: 'Виски Сауэр', accent: '#d8a24a',
    kind: 'rocks', liquid: '#c98b34', foam: '#f2e0c0',
    lead: 'Бурбон, лимон и та самая легендарная кремовая пенка. Кислое, крепкое и очень взрослое.',
    base: 'Бурбон', abv: '20%', vol: '100 мл', serve: 'Рокс, пенная шапка',
    recipe: ['Бурбон Jim Beam или Bulleit — 50 мл', 'Свежий сок лимона — 25 мл', 'Сахарный сироп 1:1 — 15 мл', 'Яичный белок — для пенки'],
    taste: ['кислый', 'кремовый', 'кукурузная сладость', 'плотный'],
    pairing: 'Орехи, твёрдый сыр, тёмный шоколад.',
  },
  {
    id: 'rdr', act: 2, secret: true, name: 'RDR', accent: '#8e1f2f',
    kind: 'hurricane', liquid: '#4a0d18',
    lead: 'Секретная позиция карты. В меню его нет — просто назовите бармену три буквы.',
    base: 'Не разглашается', abv: '35%', vol: '90 мл', serve: 'Под дымом, под колпаком',
    recipe: [],
    redacted: [66, 44, 74, 38],
    taste: ['дымный', 'крепкий', 'терпкий', 'не для всех'],
    pairing: 'Тишина и хорошая компания.',
  },
];

/* ---------- состояние и отрисовка ---------- */
let current = 0;
const glassWrap = document.getElementById('glass-wrap');
const switcher = document.getElementById('switcher');  // может отсутствовать

/* ---------- движок презентации ----------
   Карта показывает себя сама: коктейль за коктейлем, блок за блоком.
   Клик по чипу перехватывает управление и запускает нужный с начала. */
/* У каждой половины карты свой характер подачи: лёгкие идут бодро,
   крепкие — медленнее и тяжелее, секретная позиция — почти в темноте. */
const MOODS = {
  light:  { ms: 10000, pace: 1 },
  strong: { ms: 12500, pace: 1.18 },
  secret: { ms: 14500, pace: 1.4 },
};
const moodOf = (c) => (c.secret ? 'secret' : c.act === 2 ? 'strong' : 'light');
const show = { timer: 0, raf: 0, startedAt: 0, paused: false };

const $ = (id) => document.getElementById(id);
const revealEls = () => [...document.querySelectorAll('.reveal')];

function clearStage() {
  revealEls().forEach((el) => { el.classList.remove('on'); el.classList.add('out'); });
  document.querySelectorAll('.recipe-list li, .taste').forEach((el) => el.classList.remove('on'));
  /* имя уходит буквами в обратном порядке — как будто его сдувает */
  const chars = [...document.querySelectorAll('#drink-title .ch')].reverse();
  chars.forEach((el, i) => setTimeout(() => el.classList.remove('on'), i * 26));
}

/* Имя коктейля собираем по буквам — каждая встаёт на место отдельно */
function setTitle(name) {
  const box = $('drink-title');
  /* длинные названия ужимаем, иначе они упираются в края экрана */
  box.style.setProperty('--fit', name.length > 15 ? (15 / name.length).toFixed(2) : '1');
  box.innerHTML = [...name].map((ch) =>
    ch === ' ' ? '<i class="ch sp"> </i>' : `<i class="ch">${ch}</i>`).join('');
  const chars = [...box.querySelectorAll('.ch')];
  chars.forEach((el, i) => setTimeout(() => el.classList.add('on'), 60 + i * 42));
}

function fillStage(c) {
  setTitle(c.name);
  $('drink-lead').textContent = c.lead;
  $('fact-base').textContent = c.base;
  $('fact-abv').textContent = c.abv;
  $('fact-vol').textContent = c.vol;
  $('fact-serve').textContent = c.serve;
  $('pairing-text').textContent = c.pairing;
  /* у секретной позиции состав закрашен: её и заказывают вслепую */
  $('recipe-list').innerHTML = c.redacted
    ? c.redacted.map((w) => `<li class="redacted"><i style="--w:${w}%"></i></li>`).join('')
      + '<li class="redact-note">назовите бармену три буквы</li>'
    : c.recipe.map((r) => `<li>${r}</li>`).join('');
  $('taste-row').innerHTML = c.taste.map((t) => `<span class="taste">${t}</span>`).join('');
}

/* расписание появления блоков внутри одного коктейля */
function playStage(pace = 1) {
  const seq = [
    [0,    '#drink-title'],
    [700,  '#drink-lead'],
    [1300, '.facts .fact:nth-child(1)'],
    [1500, '.facts .fact:nth-child(2)'],
    [1700, '.facts .fact:nth-child(3)'],
    [1900, '.facts .fact:nth-child(4)'],
    [2500, '#recipe-block'],
    [4200, '#taste-block'],
    [5200, '#pairing-block'],
  ];
  seq.forEach(([ms, sel]) => setTimeout(() => {
    const el = document.querySelector(sel);
    if (el) { el.classList.remove('out'); el.classList.add('on'); }
  }, ms * pace));

  document.querySelectorAll('#recipe-list li').forEach((li, i) =>
    setTimeout(() => li.classList.add('on'), (2700 + i * 220) * pace));
  document.querySelectorAll('#taste-row .taste').forEach((t, i) =>
    setTimeout(() => t.classList.add('on'), (4400 + i * 160) * pace));
}

/* Цветная штора проносится по экрану — под неё меняется всё остальное */
function runWipe() {
  const w = $('wipe');
  if (!w) return;
  w.classList.remove('run');
  void w.offsetWidth;            // перезапуск анимации
  w.classList.add('run');
}

function paint(i, animate) {
  const c = COCKTAILS[i];
  current = i;
  const mood = moodOf(c);
  if (animate) runWipe();
  /* настроение страницы меняется под шторой, вместе с цветом */
  setTimeout(() => {
    document.body.classList.remove('mood-light', 'mood-strong', 'mood-secret');
    document.body.classList.add('mood-' + mood);
  }, animate ? 380 : 0);
  /* цвет всей страницы переключаем в момент, когда штора закрывает экран */
  setTimeout(() => document.documentElement.style.setProperty('--accent', c.accent),
    animate ? 380 : 0);
  if (scene) {
    const look = { fizz: c.fizz, foam: c.foam, ice: c.ice, deep: c.deep,
                 garnish: c.garnish, rim: c.rim, straw: c.straw };
    const put = () => { scene.setMood(mood); scene.build(c.kind, c.liquid, c.accent, look); };
    if (animate) { scene.leave(); setTimeout(put, 560); }
    else put();
  }
  const num = document.getElementById('show-num');
  const inAct = COCKTAILS.filter((x) => x.act === c.act);
  const idx = inAct.indexOf(c) + 1;
  if (num) num.textContent = String(idx).padStart(2, '0');
  const total = document.getElementById('show-total');
  if (total) total.textContent = String(inAct.length).padStart(2, '0');
  const actLabel = document.getElementById('act-label');
  if (actLabel) actLabel.textContent = c.act === 1 ? 'Лёгкие' : 'Крепкие';
  document.body.classList.toggle('is-secret', !!c.secret);

  if (animate) {
    clearStage();
    setTimeout(() => { fillStage(c); playStage(MOODS[mood].pace); }, 620);
  } else {
    fillStage(c);
    playStage(MOODS[mood].pace);
  }
}

function startShow(i, animate) {
  clearTimeout(show.timer);
  paint(i, animate);
  show.ms = MOODS[moodOf(COCKTAILS[i])].ms;
  show.startedAt = performance.now();
  show.timer = setTimeout(() => {
    const next = (current + 1) % COCKTAILS.length;
    /* смена акта — с отдельной заставкой, как в начале */
    if (COCKTAILS[next].act !== COCKTAILS[current].act) {
      clearStage();
      /* бокал уходит до заставки: под полупрозрачным затемнением он
         выглядел тусклым и «терял текстуру», а потом резко подменялся */
      if (scene) scene.leave();
      const intro = COCKTAILS[next].act === 2
        ? ['Думали, это всё?', 'Фирменные крепкие', 'пять позиций для своих']
        : ['И по кругу', 'Лёгкая половина', 'снова с начала'];
      runInterlude(intro, () => startShow(next, false));
    } else {
      startShow(next, true);
    }
  }, show.ms);
}

function tickBar() {
  show.raf = requestAnimationFrame(tickBar);
  if (show.paused) return;
  const p = Math.min((performance.now() - show.startedAt) / (show.ms || 10000), 1) * 100;
  const bar = $('show-bar');
  if (bar) bar.style.setProperty('--p', p.toFixed(1) + '%');
}

/* презентация замирает, когда вкладка не видна или ушли к меню */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { clearTimeout(show.timer); show.paused = true; }
  else if (show.paused) { show.paused = false; startShow(current, false); }
});

function buildSwitcher() { /* лента убрана: показ идёт сам */ }

/* стрелками можно перескочить вперёд или назад */
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') startShow((current + 1) % COCKTAILS.length, true);
  if (e.key === 'ArrowLeft') startShow((current - 1 + COCKTAILS.length) % COCKTAILS.length, true);
});

/* ---------- карточка с составом ---------- */
const sheet = document.getElementById('sheet');
const sheetBody = document.getElementById('sheet-body');

function openSheet(html) {
  sheetBody.innerHTML = html;
  sheet.hidden = false;
  sheet.classList.remove('closing');
  document.body.style.overflow = 'hidden';
}
function closeSheet() {
  sheet.classList.add('closing');
  setTimeout(() => {
    sheet.hidden = true;
    sheet.classList.remove('closing');
    document.body.style.overflow = '';
  }, 260);
}
document.getElementById('sheet-close').addEventListener('click', closeSheet);
document.getElementById('sheet-backdrop').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

const openDetailBtn = document.getElementById('open-detail');
if (openDetailBtn) openDetailBtn.addEventListener('click', () => {
  const c = COCKTAILS[current];
  openSheet(`
    <p class="sheet-eyebrow">Коктейль · ${c.base} · ${c.abv}</p>
    <h3 class="sheet-title">${c.name}</h3>
    <p class="sheet-sub">${c.lead}</p>
    <div class="sheet-grid">
      <div class="sheet-block">
        <h4>Состав</h4>
        <ul>${c.recipe.map((r) => `<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="sheet-block">
        <h4>Вкус и ноты</h4>
        <p>${c.notes}</p>
        <div class="taste-row">${c.taste.map((t) => `<span class="taste">${t}</span>`).join('')}</div>
      </div>
      <div class="sheet-block">
        <h4>Подача</h4>
        <p>${c.serve}. Объём ${c.vol}.</p>
      </div>
      <div class="sheet-block">
        <h4>С чем подаётся</h4>
        <p>${c.pairing}</p>
      </div>
    </div>`);
});

/* ---------- переходы между сценами ---------- */
document.querySelectorAll('.next-hint').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.to).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* показ на первом экране идёт только пока он на виду */
const drinksSection = document.getElementById('drinks');
new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting && show.paused) { show.paused = false; startShow(current, false); }
    else if (!e.isIntersecting && !show.paused) { clearTimeout(show.timer); show.paused = true; }
  });
}, { threshold: 0.4 }).observe(drinksSection);

/* ---------- лёгкий параллакс стакана ---------- */
const drinksScene = document.getElementById('drinks');
drinksScene.addEventListener('pointermove', (e) => {
  const tilt = glassWrap.querySelector('.glass-tilt');
  if (!tilt) return;
  const r = drinksScene.getBoundingClientRect();
  const dx = (e.clientX - r.left) / r.width - 0.5;
  const dy = (e.clientY - r.top) / r.height - 0.5;
  tilt.style.transform = `translate(${(dx * 26).toFixed(1)}px, ${(dy * 18).toFixed(1)}px) rotate(${(dx * 3).toFixed(2)}deg)`;
});
drinksScene.addEventListener('pointerleave', () => {
  const tilt = glassWrap.querySelector('.glass-tilt');
  if (tilt) tilt.style.transform = '';
});

/* На телефоне бокал ставится в оставленное под него место, а не в центр
   экрана — иначе текст колонкой ложится прямо на него */
function placeGlass() {
  if (!scene || !scene.enabled) return;
  if (innerWidth > 860) { scene.setAnchor(null, 1.5); return; }
  const r = glassWrap.getBoundingClientRect();
  scene.setAnchor(r.top + scrollY + r.height * 0.64, 0.9);
}
addEventListener('resize', () => requestAnimationFrame(placeGlass));

/* ---------- настоящее 3D, если железо тянет ---------- */
let scene = null;
const quality = detectQuality();
if (quality !== 'off' && !new URLSearchParams(location.search).has('no3d')) {
  scene = new BarScene(document.getElementById('scene3d'));
  scene.init({ quality })
    .then(() => {
      document.body.classList.add('has3d');
      window.__scene = scene;
      placeGlass();
      const c = COCKTAILS[current];
      scene.build(c.kind, c.liquid, c.accent, { fizz: c.fizz, foam: c.foam, ice: c.ice,
        deep: c.deep, garnish: c.garnish, rim: c.rim, straw: c.straw });
    })
    .catch((err) => {
      console.warn('3D не поднялось, остаёмся на рисованных бокалах:', err);
      scene = null;
      document.body.classList.remove('has3d');
    });
}

/* ---------- киновступление ---------- */
const titles = document.getElementById('titles');
function runTitles() {
  const lines = [...document.querySelectorAll('.title-line')];
  if (sessionStorage.getItem('seenTitles')) { titles.classList.add('done'); startShow(0, false); return; }
  lines.forEach((l, i) => setTimeout(() => l.classList.add('show'), i * 1250));
  setTimeout(endTitles, lines.length * 1250 + 600);
}
function endTitles() {
  if (titles.classList.contains('done')) return;
  titles.classList.add('done');
  sessionStorage.setItem('seenTitles', '1');
  startShow(0, false);
}
document.getElementById('titles-skip').addEventListener('click', endTitles);
runTitles();

/* ---------- заставка между актами ---------- */
function runInterlude(lines, done) {
  const box = titles.querySelector('.titles-inner');
  box.innerHTML = lines.map((t, i) =>
    `<p class="title-line${i === 1 ? ' title-line-big' : ''}">${t}</p>`).join('');
  titles.classList.remove('done');
  const els = [...box.querySelectorAll('.title-line')];
  els.forEach((l, i) => setTimeout(() => l.classList.add('show'), i * 1150));
  const total = els.length * 1150 + 500;
  const finish = () => { titles.classList.add('done'); done(); };
  const t = setTimeout(finish, total);
  const skip = document.getElementById('titles-skip');
  skip.onclick = () => { clearTimeout(t); finish(); };
}

/* ---------- прокрутка управляет сценой ---------- */
let scrollRaf = 0;
addEventListener('scroll', () => {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0;
    if (scene) scene.setScroll(window.scrollY / Math.max(window.innerHeight, 1));
  });
}, { passive: true });

/* ---------- старт ---------- */
buildSwitcher();
tickBar();
