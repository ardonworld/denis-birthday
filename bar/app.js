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
  {
    id: 'negroni', name: 'Негрони', accent: '#e0492c',
    art: glassRocks, top: '#f0603a', bottom: '#96150f',
    lead: 'Горький классик на троих равных. Тот случай, когда простая формула держит весь вечер.',
    base: 'Джин', abv: '24%', vol: '90 мл', serve: 'Рокс, крупный лёд',
    recipe: ['Джин — 30 мл', 'Кампари — 30 мл', 'Красный вермут — 30 мл', 'Цедра апельсина'],
    taste: ['горько-сладкий', 'цитрус', 'травы', 'плотный'],
    notes: 'Сначала горечь кампари, следом сладость вермута, в финале — сухой можжевеловый хвост джина и масло апельсиновой цедры.',
    pairing: 'Оливки, вяленое мясо, твёрдый сыр.',
  },
  {
    id: 'mojito', name: 'Мохито', accent: '#63c94f',
    art: glassHighball, top: '#c9f5a8', bottom: '#4d9c3a',
    lead: 'Мята, лайм и лёд. Освежает и не даёт вечеру провалиться в тяжесть.',
    base: 'Белый ром', abv: '12%', vol: '320 мл', serve: 'Хайбол, дроблёный лёд',
    recipe: ['Белый ром — 50 мл', 'Лайм — половина', 'Мята — 10 листьев', 'Тростниковый сахар — 2 ч. л.', 'Содовая'],
    taste: ['свежий', 'кислый', 'мятный', 'лёгкий'],
    notes: 'Холодная мята в носу, кислота лайма по центру, сладость тростника сглаживает финал. Пьётся быстро — в этом и опасность.',
    pairing: 'Севиче, лёгкие закуски, всё острое.',
  },
  {
    id: 'aperol', name: 'Шприц', accent: '#ff8a1f',
    art: glassSpritz, top: '#ffb648', bottom: '#e8590c',
    lead: 'Аперитив, с которого начинают. Пузырьки, апельсин и лёгкая горчинка.',
    base: 'Апероль', abv: '9%', vol: '250 мл', serve: 'Бокал для вина, много льда',
    recipe: ['Апероль — 60 мл', 'Просекко — 90 мл', 'Содовая — 30 мл', 'Долька апельсина'],
    taste: ['лёгкий', 'цитрус', 'сладко-горький', 'игристый'],
    notes: 'Апельсиновая корка и ревень, горечь мягкая и короткая. Просекко держит пузырь до последнего глотка.',
    pairing: 'Брускетта, прошутто, сырная тарелка.',
  },
  {
    id: 'espresso', name: 'Эспрессо', accent: '#c08b4e',
    art: glassCoupe, top: '#8a5a2b', bottom: '#3a1f10',
    lead: 'Кофе и водка в одном бокале. Тот самый коктейль для второй половины вечера.',
    base: 'Водка', abv: '18%', vol: '110 мл', serve: 'Купе, три зерна',
    recipe: ['Водка — 50 мл', 'Свежий эспрессо — 30 мл', 'Кофейный ликёр — 20 мл', 'Сироп — по вкусу'],
    taste: ['кофе', 'какао', 'плотный', 'сладковатый'],
    notes: 'Плотная пенка, обжарка и тёмный шоколад. Горечь кофе перекрывает алкоголь — держите себя в руках.',
    pairing: 'Тирамису, шоколад, орехи.',
  },
  {
    id: 'lagoon', name: 'Лагуна', accent: '#2fb6e8',
    art: glassHurricane, top: '#7ee0ff', bottom: '#1273c4',
    lead: 'Голубой цитрус со льдом. Самый заметный бокал в зале — берут глазами.',
    base: 'Водка', abv: '11%', vol: '280 мл', serve: 'Харрикейн, лёд, трубочка',
    recipe: ['Водка — 40 мл', 'Ликёр блю кюрасао — 20 мл', 'Лимонад — 200 мл', 'Лимон — долька'],
    taste: ['сладкий', 'цитрус', 'освежающий', 'лёгкий'],
    notes: 'Апельсиновый ликёр под маской голубого, кислота лимона в середине и долгий сладкий финал.',
    pairing: 'Фруктовая тарелка, креветки, лёд.',
  },
];

/* ---------- кухня: по блюду на коктейль ---------- */
function dishArt(kind, accent) {
  const plate = `<ellipse cx="150" cy="150" rx="118" ry="86" fill="#ffffff" opacity="0.1"/>
    <ellipse cx="150" cy="146" rx="112" ry="80" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="3"/>`;
  const art = {
    board: `<rect x="52" y="92" width="196" height="116" rx="14" fill="#8a5a33"/>
      <rect x="52" y="92" width="196" height="116" rx="14" fill="none" stroke="#5e3a1e" stroke-width="4"/>
      <g><ellipse cx="104" cy="132" rx="26" ry="18" fill="#c0392b" transform="rotate(-12 104 132)"/>
      <ellipse cx="150" cy="126" rx="26" ry="18" fill="#d9534f" transform="rotate(8 150 126)"/>
      <ellipse cx="196" cy="134" rx="26" ry="18" fill="#b53228" transform="rotate(-6 196 134)"/>
      <rect x="86" y="160" width="52" height="34" rx="6" fill="#f0d68a"/>
      <rect x="150" y="158" width="46" height="38" rx="6" fill="#e8c46a"/>
      <circle cx="216" cy="176" r="12" fill="#5f8d3e"/><circle cx="196" cy="182" r="9" fill="#4c7a30"/></g>`,
    ceviche: `<ellipse cx="150" cy="150" rx="86" ry="58" fill="${accent}" opacity="0.28"/>
      <g fill="#ffd9c2"><ellipse cx="122" cy="138" rx="24" ry="15" transform="rotate(-18 122 138)"/>
      <ellipse cx="166" cy="132" rx="24" ry="15" transform="rotate(12 166 132)"/>
      <ellipse cx="146" cy="164" rx="26" ry="16" transform="rotate(-4 146 164)"/></g>
      <circle cx="188" cy="160" r="10" fill="#7ac74f"/><circle cx="108" cy="166" r="8" fill="#7ac74f"/>
      <path d="M100 120 q16 -14 34 -6" stroke="#e8455f" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    brusch: `<g transform="rotate(-8 150 150)">
      <rect x="66" y="128" width="168" height="42" rx="18" fill="#e3b566"/>
      <rect x="66" y="128" width="168" height="18" rx="9" fill="#f0cd8d"/>
      <circle cx="104" cy="126" r="17" fill="#d94f3d"/><circle cx="146" cy="120" r="17" fill="#c0392b"/>
      <circle cx="188" cy="126" r="17" fill="#e05a45"/>
      <path d="M118 108 q14 -12 28 -4" stroke="#4f9a3a" stroke-width="6" fill="none" stroke-linecap="round"/></g>`,
    dessert: `<path d="M96 108 h108 l-12 96 a16 16 0 0 1 -16 14 h-52 a16 16 0 0 1 -16 -14 z" fill="#e8dcc8" opacity="0.25"/>
      <path d="M100 130 h100 l-10 74 a16 16 0 0 1 -16 14 h-48 a16 16 0 0 1 -16 -14 z" fill="#4a2c18"/>
      <path d="M100 130 h100 l-3 22 h-94 z" fill="#f4e6cd"/>
      <ellipse cx="150" cy="112" rx="34" ry="12" fill="#fbf3e4"/>
      <circle cx="150" cy="100" r="9" fill="#7d2b2b"/>
      <rect x="140" y="212" width="20" height="34" fill="#d8cbb4" opacity="0.4"/>`,
    fruit: `<circle cx="118" cy="140" r="30" fill="#f2b134"/>
      <circle cx="170" cy="126" r="26" fill="#e0576c"/>
      <circle cx="184" cy="172" r="24" fill="#7fc94f"/>
      <circle cx="126" cy="184" r="22" fill="#f0e14a"/>
      <circle cx="152" cy="152" r="20" fill="#ff8f4d"/>
      <path d="M118 106 q6 -14 20 -12" stroke="#4f9a3a" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  }[kind] || '';
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">${plate}${art}</svg>`;
}

const DISHES = [
  { pair: 'к негрони', name: 'Мясная доска', art: 'board', accent: '#e0492c',
    note: 'Вяленая говядина, пармская ветчина, твёрдый сыр, вяленые томаты и оливки.',
    weight: '320 г', price: '1 490 ₽' },
  { pair: 'к мохито', name: 'Севиче из окуня', art: 'ceviche', accent: '#63c94f',
    note: 'Окунь в соке лайма, красный лук, кинза, чили и хрустящий батат.',
    weight: '180 г', price: '1 190 ₽' },
  { pair: 'к шприцу', name: 'Брускетты с томатом', art: 'brusch', accent: '#ff8a1f',
    note: 'Хрустящая чиабатта, томаты конфи, страчателла и базилик.',
    weight: '3 шт · 210 г', price: '890 ₽' },
  { pair: 'к эспрессо', name: 'Тирамису', art: 'dessert', accent: '#c08b4e',
    note: 'Классический, на маскарпоне, с савоярди в кофе и какао сверху.',
    weight: '160 г', price: '650 ₽' },
  { pair: 'к лагуне', name: 'Фруктовая тарелка', art: 'fruit', accent: '#2fb6e8',
    note: 'Сезонные фрукты и ягоды, мята, мёд и лёд.',
    weight: '600 г', price: '1 250 ₽' },
];

/* ---------- табачная карта ---------- */
function tobaccoArt(accent) {
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
    <g stroke="${accent}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85">
      <path d="M116 118 c-22 -20 -6 -40 12 -30 c20 12 4 34 -14 46 c-20 14 -8 40 16 34"/>
      <path d="M164 104 c-20 -18 -4 -38 14 -28 c18 12 2 32 -14 44 c-18 14 -6 38 18 32"/>
    </g>
    <ellipse cx="150" cy="196" rx="46" ry="14" fill="${accent}" opacity="0.5"/>
    <path d="M124 196 h52 l-8 30 h-36 z" fill="#2c3238"/>
    <path d="M138 226 h24 v18 h-24 z" fill="#20262b"/>
    <rect x="126" y="244" width="48" height="12" rx="6" fill="#2c3238"/>
    <path d="M150 256 v22" stroke="#2c3238" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="150" cy="284" rx="40" ry="10" fill="#20262b"/>
  </svg>`;
}

const TOBACCO = [
  { name: 'Северный лес', accent: '#5fb98a', strength: 'средняя',
    note: 'Можжевельник, хвоя и лайм. Сухой и прохладный дым — под негрони.', mix: 'Juniper · Lime · Cool' },
  { name: 'Мятный лёд', accent: '#63c94f', strength: 'лёгкая',
    note: 'Свежая мята и зелёное яблоко. Освежает, не забивает вкус коктейля.', mix: 'Mint · Green Apple' },
  { name: 'Апельсиновый закат', accent: '#ff8a1f', strength: 'лёгкая',
    note: 'Апельсин, грейпфрут и щепотка ванили. Идёт со шприцем.', mix: 'Orange · Grapefruit · Vanilla' },
  { name: 'Тёмная обжарка', accent: '#c08b4e', strength: 'крепкая',
    note: 'Кофе, какао и чуть табачной сладости. Для второй половины вечера.', mix: 'Coffee · Cacao' },
  { name: 'Голубая волна', accent: '#2fb6e8', strength: 'средняя',
    note: 'Черника, лимон и холодок. Самый ароматный микс карты.', mix: 'Blueberry · Lemon · Ice' },
];

/* ---------- состояние и отрисовка ---------- */
let current = 0;
const glassWrap = document.getElementById('glass-wrap');
const switcher = document.getElementById('switcher');

function paint(i, animate) {
  const c = COCKTAILS[i];
  current = i;
  document.documentElement.style.setProperty('--accent', c.accent);
  document.getElementById('drink-title').textContent = c.name;
  document.getElementById('drink-lead').textContent = c.lead;
  document.getElementById('fact-base').textContent = c.base;
  document.getElementById('fact-abv').textContent = c.abv;
  document.getElementById('fact-vol').textContent = c.vol;
  document.getElementById('fact-serve').textContent = c.serve;

  glassWrap.innerHTML = `<div class="glass-tilt">${c.art(c.id, c.top, c.bottom)}</div>`;
  if (animate) {
    glassWrap.classList.remove('swap');
    void glassWrap.offsetWidth;
    glassWrap.classList.add('swap');
  }
  switcher.querySelectorAll('.chip').forEach((b, k) => b.classList.toggle('is-active', k === i));
}

function buildSwitcher() {
  COCKTAILS.forEach((c, i) => {
    const b = el('button', 'chip');
    b.type = 'button';
    b.innerHTML = `<span class="chip-thumb">${c.art('thumb-' + c.id, c.top, c.bottom)}</span>${c.name}`;
    b.addEventListener('click', () => paint(i, true));
    switcher.appendChild(b);
  });
}

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

document.getElementById('open-detail').addEventListener('click', () => {
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

/* ---------- кухня и табак ---------- */
function buildDishes() {
  const box = document.getElementById('dish-list');
  DISHES.forEach((d) => {
    const card = el('button', 'card');
    card.type = 'button';
    card.style.setProperty('--card-accent', d.accent);
    card.innerHTML = `
      <span class="card-art">${dishArt(d.art, d.accent)}</span>
      <span class="card-pair">${d.pair}</span>
      <p class="card-name">${d.name}</p>
      <p class="card-note">${d.note}</p>
      <span class="card-meta"><span>${d.weight}</span><span>${d.price}</span></span>`;
    card.addEventListener('click', () => openSheet(`
      <p class="sheet-eyebrow">Кухня · ${d.pair}</p>
      <h3 class="sheet-title">${d.name}</h3>
      <p class="sheet-sub">${d.note}</p>
      <div class="sheet-grid">
        <div class="sheet-block"><h4>Выход</h4><p>${d.weight}</p></div>
        <div class="sheet-block"><h4>Цена</h4><p>${d.price}</p></div>
      </div>`));
    box.appendChild(card);
  });
}

function buildTobacco() {
  const box = document.getElementById('tobacco-list');
  TOBACCO.forEach((t) => {
    const card = el('button', 'card');
    card.type = 'button';
    card.style.setProperty('--card-accent', t.accent);
    card.innerHTML = `
      <span class="card-art">${tobaccoArt(t.accent)}</span>
      <span class="card-pair">${t.mix}</span>
      <p class="card-name">${t.name}</p>
      <p class="card-note">${t.note}</p>
      <span class="card-meta"><span>крепость: ${t.strength}</span><span>1 200 ₽</span></span>`;
    card.addEventListener('click', () => openSheet(`
      <p class="sheet-eyebrow">Табак · ${t.mix}</p>
      <h3 class="sheet-title">${t.name}</h3>
      <p class="sheet-sub">${t.note}</p>
      <div class="sheet-grid">
        <div class="sheet-block"><h4>Крепость</h4><p>${t.strength}</p></div>
        <div class="sheet-block"><h4>Чаша</h4><p>1 200 ₽ · смена — 600 ₽</p></div>
      </div>`));
    box.appendChild(card);
  });
}

/* ---------- переходы между сценами ---------- */
document.querySelectorAll('.jump').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.to).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const sections = ['drinks', 'kitchen', 'tobacco'].map((id) => document.getElementById(id));
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      document.querySelectorAll('.nav-link').forEach((l) =>
        l.classList.toggle('is-active', l.dataset.nav === e.target.id));
    }
  });
}, { threshold: 0.55 });
sections.forEach((s) => observer.observe(s));

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

/* ---------- старт ---------- */
buildSwitcher();
buildDishes();
buildTobacco();
paint(0, false);
