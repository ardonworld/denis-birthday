/* =========================================================
   ДЕЛО № 24 — «ПРОПАВШИЙ КУПАЖ»
   Весь сайт — доска расследования: улики приколоты к столу,
   по клику улика приближается к зрителю и открывает содержимое.
   ========================================================= */

/* ---------- 1. ЭКРАНЫ ---------- */
const screens = {
  intro: document.getElementById('screen-intro'),
  quest: document.getElementById('screen-quest'),
  result: document.getElementById('screen-result'),
  invite: document.getElementById('screen-invite'),
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ---------- 2. РИСОВАННЫЕ УЛИКИ ---------- */
const FIG = '#918978';
const FIG_2 = '#6f6858';
const FIG_3 = '#b3ab99';

function silhouette(kind) {
  const open = '<svg viewBox="0 0 100 102" xmlns="http://www.w3.org/2000/svg">';
  const close = '</svg>';
  const shapes = {
    man: `
      <path d="M22 102c0-18 12-30 28-30s28 12 28 30z" fill="${FIG}"/>
      <circle cx="50" cy="37" r="17" fill="${FIG}"/>
      <path d="M32 32c1-12 9-18 18-18s17 6 18 18c-5-7-11-9-18-9s-13 2-18 9z" fill="${FIG_2}"/>`,
    woman: `
      <path d="M26 66c0-16 10-27 24-27s24 11 24 27c0 14-4 24-6 30H32c-2-6-6-16-6-30z" fill="${FIG_2}"/>
      <path d="M24 102c0-17 11-28 26-28s26 11 26 28z" fill="${FIG}"/>
      <circle cx="50" cy="38" r="16" fill="${FIG}"/>
      <path d="M31 34c1-13 9-19 19-19s18 6 19 19c-4-8-11-11-19-11s-15 3-19 11z" fill="${FIG_2}"/>`,
    strong: `
      <path d="M8 102c0-23 19-38 42-38s42 15 42 38z" fill="${FIG}"/>
      <rect x="42" y="44" width="16" height="24" fill="${FIG}"/>
      <circle cx="50" cy="32" r="16" fill="${FIG}"/>
      <path d="M33 28c1-11 8-17 17-17s16 6 17 17c-5-6-10-8-17-8s-12 2-17 8z" fill="${FIG_2}"/>`,
    suit: `
      <path d="M22 102c0-18 12-29 28-29s28 11 28 29z" fill="${FIG}"/>
      <path d="M50 73l-11 5 11 12 11-12z" fill="${FIG_3}"/>
      <path d="M50 90l-4 12h8z" fill="${FIG_2}"/>
      <circle cx="50" cy="37" r="16" fill="${FIG}"/>
      <path d="M33 33c1-12 8-18 17-18s16 6 17 18c-5-7-10-9-17-9s-12 2-17 9z" fill="${FIG_2}"/>`,
    updo: `
      <path d="M25 102c0-17 11-28 25-28s25 11 25 28z" fill="${FIG}"/>
      <circle cx="50" cy="39" r="16" fill="${FIG}"/>
      <circle cx="50" cy="15" r="9" fill="${FIG_2}"/>
      <path d="M32 36c1-13 9-19 18-19s17 6 18 19c-5-8-11-11-18-11s-13 3-18 11z" fill="${FIG_2}"/>`,
    cap: `
      <path d="M22 102c0-18 12-30 28-30s28 12 28 30z" fill="${FIG}"/>
      <circle cx="50" cy="40" r="16" fill="${FIG}"/>
      <path d="M31 34c0-11 8-19 19-19s19 8 19 19z" fill="${FIG_2}"/>
      <rect x="24" y="33" width="52" height="5" rx="2.5" fill="${FIG_2}"/>`,
    duo: `
      <path d="M14 102c0-14 9-23 21-23s21 9 21 23z" fill="${FIG_2}"/>
      <circle cx="35" cy="55" r="13" fill="${FIG_2}"/>
      <path d="M46 102c0-13 9-22 20-22s20 9 20 22z" fill="${FIG}"/>
      <path d="M52 76c0-11 6-18 14-18s14 7 14 18c0 8-2 13-3 16H55c-1-3-3-8-3-16z" fill="${FIG}"/>
      <circle cx="66" cy="58" r="12" fill="${FIG}"/>`,
    bottleShot: `
      <rect x="42" y="16" width="16" height="18" rx="2" fill="${FIG_2}"/>
      <path d="M36 34h28v10c0 6 7 9 7 20v32a7 7 0 0 1-7 7H36a7 7 0 0 1-7-7V64c0-11 7-14 7-20z" fill="${FIG}"/>
      <rect x="30" y="66" width="40" height="15" fill="${FIG_3}" opacity="0.5"/>`,
    receiptShot: `
      <path d="M28 14h44v70l-6-5-6 5-6-5-6 5-6-5-6 5-8-6z" fill="${FIG_3}"/>
      <rect x="35" y="24" width="30" height="3" fill="${FIG_2}"/>
      <rect x="35" y="33" width="30" height="2.5" fill="${FIG_2}" opacity="0.7"/>
      <rect x="35" y="41" width="22" height="2.5" fill="${FIG_2}" opacity="0.7"/>
      <rect x="35" y="49" width="26" height="2.5" fill="${FIG_2}" opacity="0.7"/>
      <rect x="35" y="60" width="18" height="4" fill="${FIG_2}"/>`,
  };
  return open + (shapes[kind] || shapes.man) + close;
}

function bottleSVG(color, w) {
  const width = w || 40;
  return `<svg width="${width}" height="${Math.round(width * 2.05)}" viewBox="0 0 44 90" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="0" width="12" height="16" rx="2" fill="#b8a06a"/>
    <path d="M10 16h24v9c0 5 6 8 6 17v38a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V42c0-9 6-12 6-17z"
      fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
    <rect x="9" y="46" width="26" height="11" fill="#fffdf7" opacity="0.14"/>
  </svg>`;
}

function mapSVG() {
  return `<svg class="map-art" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="200" fill="#e6dcc0"/>
    <g fill="#d3c8a6">
      <rect x="14" y="16" width="58" height="40"/><rect x="84" y="16" width="46" height="40"/>
      <rect x="142" y="16" width="70" height="26"/><rect x="224" y="16" width="62" height="40"/>
      <rect x="14" y="70" width="40" height="52"/><rect x="66" y="70" width="64" height="30"/>
      <rect x="66" y="110" width="64" height="42"/><rect x="196" y="70" width="52" height="36"/>
      <rect x="260" y="70" width="26" height="80"/><rect x="14" y="136" width="40" height="48"/>
      <rect x="146" y="120" width="40" height="64"/><rect x="200" y="150" width="48" height="34"/>
    </g>
    <g stroke="#f3ecd6" stroke-width="8" fill="none">
      <path d="M0 63h300"/><path d="M0 128h300"/><path d="M60 0v200"/><path d="M190 0v200"/>
      <path d="M0 180 L300 100"/>
    </g>
    <path d="M142 42 L214 42 L214 62" stroke="#c9b78d" stroke-width="4" fill="none"/>
    <path d="M0 20 C60 34 120 6 300 30" stroke="#b9c9bd" stroke-width="11" fill="none" opacity="0.75"/>
    <g>
      <circle cx="214" cy="126" r="15" fill="none" stroke="#b5342c" stroke-width="3.5" stroke-dasharray="4 3"/>
      <path d="M206 118l16 16M222 118l-16 16" stroke="#b5342c" stroke-width="4" stroke-linecap="round"/>
    </g>
    <text x="20" y="196" font-family="Special Elite, monospace" font-size="11" fill="#7a6b48">кв. 3 · северный сектор</text>
  </svg>`;
}

/* Мини-снимки на обложке папки */
const strip = document.getElementById('folder-photo-strip');
if (strip) {
  strip.innerHTML = ['man', 'bottleShot', 'woman']
    .map((k) => `<div class="mini-shot">${silhouette(k)}</div>`).join('');
}

/* ---------- 3. КОНФИГ ДОСКИ ---------- */
const FRAGMENT_A = 'ЛЕС';
const FRAGMENT_B = '2002';

const BOARD_ITEMS = [
  {
    id: 'brief', type: 'note', x: 50, y: 4.5, rot: -1.2,
    head: 'Дело № 24 · рапорт',
    body: 'Ночью из погреба «3 Резиденции» пропал купаж особой выдержки.',
    more: 'нажми — прочесть целиком',
    detail: {
      eyebrow: 'Инспектор Бочкарёв · вечерняя смена',
      text: 'Ночью из погреба пропала бутылка особой выдержки — та самая, что должны были откупорить сегодня на дне рождения Дениса Федука. Замок цел, окно закрыто, на крышке пустой бочки — свежий скол. Сторож клянётся, что почувствовал смолистый хвойный запах, будто бутылку пронесли через лес, а не через погреб. Семеро гостей уже дали показания — они на доске. Собери две улики, и старый сейф отдаст координаты.',
      sign: '— Бочкарёв',
    },
  },
  {
    id: 'nikita', type: 'polaroid', fig: 'man', x: 20, y: 14, rot: -4.5, label: 'Никита',
    detail: {
      eyebrow: 'Свидетель · знаток напитков',
      fig: 'man',
      shotCap: 'Никита',
      quote: '«Я пробовал этот купаж полгода назад. Пахло дубом и вереском — но не тем сортом, что я думал. Кто-то подменил пробку, точно говорю».',
      sign: 'опрошен в 01:14',
    },
  },
  {
    id: 'alena', type: 'polaroid', fig: 'woman', x: 75, y: 14.5, rot: 3.5, label: 'Алёна',
    detail: {
      eyebrow: 'Свидетель · знаток напитков',
      fig: 'woman',
      shotCap: 'Алёна',
      quote: '«Кто бы это ни взял — в биттерах разбирался не хуже меня. Из шести бутылок унесли самую редкую, остальные даже не тронули».',
      sign: 'опрошена в 01:20',
    },
  },
  { id: 'sticky1', type: 'sticky', x: 47, y: 21, rot: 4, text: '24 кольца?' },
  {
    id: 'evidence-a', type: 'polaroid', fig: 'bottleShot', x: 25, y: 27, rot: -2.5,
    label: 'Улика А', evidence: 'a',
  },
  {
    id: 'migal', type: 'polaroid', fig: 'strong', x: 74, y: 27.5, rot: -3, label: 'Мигаль',
    detail: {
      eyebrow: 'Свидетель · алиби проверено',
      fig: 'strong',
      shotCap: 'Мигаль',
      quote: '«Я бы вынес эту бочку одной рукой, не спорю. Но у меня железное алиби — весь зал видел меня у штанги до самой полуночи».',
      sign: 'из подозреваемых исключён',
    },
  },
  { id: 'sticky2', type: 'sticky', x: 13, y: 35, rot: -6, text: '18.09 срок!' },
  {
    id: 'matvey', type: 'polaroid', fig: 'suit', x: 46, y: 36.5, rot: 2.5, label: 'Матвей',
    detail: {
      eyebrow: 'Свидетель',
      fig: 'suit',
      shotCap: 'Матвей',
      quote: '«Видел дорогую машину у чёрного входа около полуночи. Не моя, если что — моя стояла спереди, у фонаря».',
      sign: 'опрошен в 01:32',
    },
  },
  {
    id: 'lera', type: 'polaroid', fig: 'updo', x: 79, y: 38, rot: -2, label: 'Лера',
    detail: {
      eyebrow: 'Свидетель',
      fig: 'updo',
      shotCap: 'Лера',
      quote: '«Матвей весь вечер был рядом со мной. И да — я сфотографировала ужин, на снимке видно время: 23:47».',
      sign: 'фото приобщено к делу',
    },
  },
  {
    id: 'evidence-b', type: 'polaroid', fig: 'receiptShot', x: 24, y: 46.5, rot: 3,
    label: 'Улика Б', evidence: 'b',
  },
  {
    id: 'news', type: 'news', x: 66, y: 48, rot: -3,
    brand: 'ВЕЧЕРНИЙ СТРОИТЕЛЬ',
    head: 'Резиденция закрыта на спецобслуживание',
    detail: {
      eyebrow: 'Вырезка · вчерашний выпуск',
      text: '«Заведение на Северной закрыто на спецобслуживание: готовится частное торжество. Владелец сообщил, что к вечеру пятницы всё будет готово, а гостей ждёт сюрприз из погреба». Заметка выцвела, дата оторвана.',
      sign: 'приобщено к делу',
    },
  },
  {
    id: 'artem', type: 'polaroid', fig: 'cap', x: 22, y: 57.5, rot: -4, label: 'Артём',
    detail: {
      eyebrow: 'Свидетель · нашёл улику Б',
      fig: 'cap',
      shotCap: 'Артём',
      quote: '«Сам ничего не видел. Зато случайно снял стол кладовщика — там лежала какая-то квитанция. Держи фото, вдруг пригодится».',
      sign: 'фото — улика Б',
    },
  },
  {
    id: 'denisdasha', type: 'polaroid', fig: 'duo', x: 62, y: 59, rot: 3, label: 'Денис и Даша',
    detail: {
      eyebrow: 'Свидетели',
      fig: 'duo',
      shotCap: 'Денис и Даша',
      quote: '«Слышали, как кладовщик бормотал что-то про "дубовые кольца" и старый сейф. Он туда прячет всё важное — и, кажется, координаты тоже».',
      sign: 'опрошены в 02:05',
    },
  },
  { id: 'sticky3', type: 'sticky', x: 30, y: 67, rot: 5, text: 'сейф = 2 части' },
  { id: 'final', type: 'map', x: 53, y: 80, rot: -1 },
];

const STRINGS = [
  ['brief', 'nikita'], ['brief', 'alena'],
  ['nikita', 'evidence-a'], ['alena', 'evidence-a'],
  ['migal', 'matvey'], ['artem', 'evidence-b'],
  ['evidence-a', 'final'], ['evidence-b', 'final'],
  ['denisdasha', 'final'], ['lera', 'news'],
];

/* ---------- 4. СБОРКА ДОСКИ ---------- */
const boardCanvas = document.getElementById('board-canvas');
const detailStore = document.getElementById('detail-store');
const quest = { solvedA: false, solvedB: false, timerId: null };

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html != null) node.innerHTML = html;
  return node;
}

function buildBoard() {
  boardCanvas.querySelectorAll('.pin').forEach((n) => n.remove());
  detailStore.innerHTML = '';

  BOARD_ITEMS.forEach((item, i) => {
    let node;
    const delay = `${0.06 * i}s`;

    if (item.type === 'polaroid') {
      node = el('button', 'pin polaroid');
      node.type = 'button';
      node.innerHTML = `
        <span class="pushpin ${i % 3 === 0 ? 'pushpin-yellow' : i % 3 === 1 ? '' : 'pushpin-white'}"></span>
        <span class="frame">
          <span class="shot">${silhouette(item.fig)}</span>
          <span class="cap">${item.label}</span>
        </span>`;
    } else if (item.type === 'sticky') {
      node = el('div', 'pin sticky', `<span class="pushpin pushpin-white"></span>${item.text}`);
    } else if (item.type === 'note') {
      node = el('button', 'pin note');
      node.type = 'button';
      node.innerHTML = `
        <span class="pushpin"></span>
        <span class="note-head">${item.head}</span>
        <span class="note-body">${item.body}</span>
        <span class="note-more">${item.more}</span>`;
    } else if (item.type === 'news') {
      node = el('button', 'pin news');
      node.type = 'button';
      node.innerHTML = `
        <span class="pushpin pushpin-white"></span>
        <span class="news-brand">${item.brand}</span>
        <span class="news-head">${item.head}</span>
        <span class="news-lines"></span>`;
    } else if (item.type === 'map') {
      node = el('button', 'pin map-pin locked');
      node.type = 'button';
      node.innerHTML = `
        <span class="pushpin"></span>
        <span class="frame">
          ${mapSVG()}
          <span class="lock-badge"><span class="lock-ico">🔒</span>нужны обе улики</span>
        </span>
        <span class="cap">старый сейф резиденции</span>`;
    }

    node.style.setProperty('--x', item.x + '%');
    node.style.setProperty('--y', item.y + '%');
    node.style.setProperty('--rot', (item.rot || 0) + 'deg');
    node.style.setProperty('--delay', delay);
    node.dataset.id = item.id;
    if (item.evidence) node.dataset.evidence = item.evidence;

    if (item.type !== 'sticky') {
      node.addEventListener('click', () => onPinClick(item, node));
    }
    boardCanvas.appendChild(node);

    const detail = buildDetail(item);
    if (detail) {
      detail.id = 'detail-' + item.id;
      detailStore.appendChild(detail);
    }
  });

  drawStrings();
}

function buildDetail(item) {
  if (item.evidence === 'a') return buildEvidenceA();
  if (item.evidence === 'b') return buildEvidenceB();
  if (item.type === 'map') return buildFinal();
  if (!item.detail) return null;

  const d = item.detail;
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', d.eyebrow));

  if (d.fig) {
    box.appendChild(el('div', 'd-shot',
      `<div class="shot-inner">${silhouette(d.fig)}</div><div class="shot-cap">${d.shotCap}</div>`));
  }
  if (d.text) {
    const p = el('p', 'd-text');
    p.dataset.text = d.text;
    box.appendChild(p);
  }
  if (d.quote) box.appendChild(el('p', 'd-quote', d.quote));
  if (d.sign) box.appendChild(el('p', 'd-sign', d.sign));
  return box;
}

function buildEvidenceA() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика А · заключение экспертов'));
  const p = el('p', 'd-text');
  p.dataset.text = 'Никита и Алёна описали запах в один голос: «можжевельник, смола, что-то тёмное и дощатое, будто бутылку прятали среди елей». С места происшествия изъяли пять бутылок разного купажа. Только одна пахнет так, как они описали — найди её.';
  box.appendChild(p);

  const row = el('div', 'bottle-row');
  row.id = 'bottle-row';
  box.appendChild(row);

  const fb = el('p', 'd-feedback');
  fb.id = 'visual-feedback';
  box.appendChild(fb);
  return box;
}

function buildEvidenceB() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика Б · кадр с телефона Артёма'));
  box.appendChild(el('div', 'd-shot',
    `<div class="shot-inner">${silhouette('receiptShot')}</div><div class="shot-cap">квитанция склада</div>`));
  const p = el('p', 'd-text');
  p.dataset.text = 'Год на штампе размыт, читается только сегодняшний — 2026-й. Ниже приписка рукой кладовщика: «Бочку заложили ровно за столько лет до сегодняшнего дня, сколько сегодня исполняется имениннику — за двадцать четыре оборота дубовых колец». Вычисли год закладки.';
  box.appendChild(p);

  const form = el('form', 'd-form');
  form.id = 'logic-form';
  form.autocomplete = 'off';
  form.innerHTML = `
    <input type="text" inputmode="numeric" id="logic-input" placeholder="год закладки" maxlength="4">
    <button type="submit" class="btn btn-primary">Проверить</button>`;
  form.addEventListener('submit', onLogicSubmit);
  box.appendChild(form);

  const fb = el('p', 'd-feedback');
  fb.id = 'logic-feedback';
  box.appendChild(fb);
  return box;
}

function buildFinal() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Старый сейф резиденции'));
  const p = el('p', 'd-text');
  p.dataset.text = 'Денис и Даша слышали, как кладовщик бормотал код от сейфа — именно там он прятал координаты нового погреба. На дне бутылки нацарапаны буквы, на обороте квитанции проступили цифры. Сложи обе находки по порядку и набери код.';
  box.appendChild(p);

  const tiles = el('div', 'code-tiles');
  tiles.id = 'code-tiles';
  box.appendChild(tiles);

  const form = el('form', 'd-form');
  form.id = 'final-form';
  form.autocomplete = 'off';
  form.innerHTML = `
    <input type="text" id="final-input" autocomplete="off" spellcheck="false" placeholder="код сейфа">
    <button type="submit" class="btn btn-primary">Открыть сейф</button>`;
  form.addEventListener('submit', onFinalSubmit);
  form.querySelector('#final-input').addEventListener('input', (e) => renderCodeTiles(e.target.value));
  box.appendChild(form);

  const fb = el('p', 'd-feedback');
  fb.id = 'final-feedback';
  box.appendChild(fb);
  return box;
}

/* ---------- 5. КРАСНАЯ НИТЬ ---------- */
function drawStrings() {
  const svg = document.getElementById('board-strings');
  const byId = Object.fromEntries(BOARD_ITEMS.map((it) => [it.id, it]));
  svg.innerHTML = STRINGS.map(([a, b]) => {
    const A = byId[a], B = byId[b];
    if (!A || !B) return '';
    const mx = (A.x + B.x) / 2 + (Math.random() - 0.5) * 4;
    const my = (A.y + B.y) / 2 + (Math.random() - 0.5) * 1.2;
    return `<path d="M${A.x} ${A.y} Q${mx} ${my} ${B.x} ${B.y}"
      fill="none" stroke="#b5342c" stroke-width="1.6"
      vector-effect="non-scaling-stroke" opacity="0.72"/>`;
  }).join('');
}

/* ---------- 6. ЛИНЗА: УЛИКА ПРИБЛИЖАЕТСЯ ---------- */
const lens = document.getElementById('lens');
const lensSlot = document.getElementById('lens-slot');
let openDetailNode = null;

function typewrite(node, text, speed) {
  clearInterval(node._typeTimer);
  node.textContent = '';
  node.classList.add('typing');
  let i = 0;
  node._typeTimer = setInterval(() => {
    i++;
    node.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(node._typeTimer);
      node.classList.remove('typing');
    }
  }, speed || 14);
}

function openLens(detailId) {
  const detail = document.getElementById(detailId);
  if (!detail) return;
  closeLens(true);
  openDetailNode = detail;
  lensSlot.appendChild(detail);
  lens.hidden = false;
  lens.classList.remove('closing');
  const typed = detail.querySelector('.d-text[data-text]');
  if (typed) typewrite(typed, typed.dataset.text, 13);
  const input = detail.querySelector('input');
  if (input) setTimeout(() => input.focus({ preventScroll: true }), 450);
}

function closeLens(instant) {
  if (!openDetailNode) return;
  const finish = () => {
    if (openDetailNode) detailStore.appendChild(openDetailNode);
    openDetailNode = null;
    lens.hidden = true;
    lens.classList.remove('closing');
  };
  if (instant) return finish();
  lens.classList.add('closing');
  setTimeout(finish, 260);
}

document.getElementById('lens-close').addEventListener('click', () => closeLens());
document.getElementById('lens-backdrop').addEventListener('click', () => closeLens());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lens.hidden) closeLens();
});

function onPinClick(item, node) {
  document.getElementById('board-hint').classList.add('gone');

  if (item.type === 'map' && !(quest.solvedA && quest.solvedB)) {
    node.classList.remove('shake-pin');
    void node.offsetWidth;
    node.animate(
      [{ transform: 'translate(-50%,-50%) rotate(-1deg) translateX(-7px)' },
       { transform: 'translate(-50%,-50%) rotate(-1deg) translateX(7px)' },
       { transform: 'translate(-50%,-50%) rotate(-1deg) translateX(0)' }],
      { duration: 320, easing: 'ease' }
    );
    const badge = node.querySelector('.lock-badge');
    if (badge) badge.lastChild.textContent = 'сначала найди обе улики';
    return;
  }
  if (item.evidence === 'a' && quest.solvedA) return;
  if (item.evidence === 'b' && quest.solvedB) return;

  openLens('detail-' + item.id);
  if (item.evidence === 'a') renderBottleRow();
}

/* ---------- 7. УЛИКА А: БУТЫЛКА ПО ЗАПАХУ ---------- */
const BOTTLES = [
  { key: 'amber', color: '#c9772a' },
  { key: 'forest', color: '#1b3f2c' },
  { key: 'wine', color: '#6d1c20' },
  { key: 'gold', color: '#b8a06a' },
  { key: 'charcoal', color: '#2a2a28' },
];

function renderBottleRow() {
  const row = document.getElementById('bottle-row');
  if (!row) return;
  row.innerHTML = '';
  [...BOTTLES].sort(() => Math.random() - 0.5).forEach(({ key, color }) => {
    const btn = el('button', 'bottle-btn', bottleSVG(color, 42));
    btn.type = 'button';
    btn.addEventListener('click', () => onBottleClick(key, btn));
    row.appendChild(btn);
  });
}

function onBottleClick(key, btn) {
  const fb = document.getElementById('visual-feedback');
  if (key !== 'forest') {
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    if (fb) fb.textContent = 'Не тот запах. Перечитай, среди чего прятали бутылку.';
    return;
  }
  quest.solvedA = true;
  if (fb) {
    fb.classList.add('ok');
    fb.textContent = 'Совпадение! На дне бутылки нацарапаны буквы: ' + FRAGMENT_A;
  }
  markSolved('evidence-a', FRAGMENT_A);
  setTimeout(() => closeLens(), 1600);
}

/* ---------- 8. УЛИКА Б: ГОД ЗАКЛАДКИ ---------- */
function onLogicSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('logic-input');
  const fb = document.getElementById('logic-feedback');
  if (input.value.trim() !== FRAGMENT_B) {
    fb.classList.remove('ok');
    fb.textContent = 'Не сходится. «Двадцать четыре кольца» — это годы выдержки.';
    return;
  }
  quest.solvedB = true;
  fb.classList.add('ok');
  fb.textContent = 'Верно. На обороте проступают цифры: ' + FRAGMENT_B;
  markSolved('evidence-b', FRAGMENT_B);
  setTimeout(() => closeLens(), 1600);
}

/* ---------- 9. ПРОГРЕСС И СЕЙФ ---------- */
function markSolved(itemId, fragment) {
  const pin = boardCanvas.querySelector(`.pin[data-id="${itemId}"]`);
  if (pin && !pin.classList.contains('solved')) {
    pin.classList.add('solved');
    const shot = pin.querySelector('.shot');
    if (shot) shot.insertAdjacentHTML('beforeend', '<span class="found-stamp">найдено</span>');
    const cap = pin.querySelector('.cap');
    if (cap) cap.insertAdjacentHTML('beforeend', `<span class="fragment">${fragment}</span>`);
  }
  updateProgress();
}

function updateProgress() {
  const n = (quest.solvedA ? 1 : 0) + (quest.solvedB ? 1 : 0);
  document.getElementById('case-progress').textContent = `Улик: ${n} / 2`;
  const map = boardCanvas.querySelector('.map-pin');
  if (map && n === 2) {
    map.classList.remove('locked');
    map.classList.add('unlocked');
    const badge = map.querySelector('.lock-badge');
    if (badge) badge.remove();
    const cap = map.querySelector('.cap');
    if (cap) cap.textContent = 'сейф готов — набери код';
  }
}

function renderCodeTiles(value) {
  const wrap = document.getElementById('code-tiles');
  if (!wrap) return;
  const chars = value.toUpperCase().replace(/\s+/g, '').split('');
  wrap.innerHTML = (chars.length ? chars : ['']).map(
    (ch) => `<span class="code-tile${ch ? ' filled' : ''}">${ch || ''}</span>`
  ).join('');
}

function onFinalSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('final-input');
  const fb = document.getElementById('final-feedback');
  const got = input.value.trim().toUpperCase().replace(/\s+/g, '');
  const c1 = (FRAGMENT_A + FRAGMENT_B).toUpperCase();
  const c2 = (FRAGMENT_B + FRAGMENT_A).toUpperCase();
  if (got !== c1 && got !== c2) {
    fb.classList.remove('ok');
    fb.textContent = 'Замок не поддался. Сложи обе находки без пробела.';
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Щелчок. Сейф открыт — внутри карта…';
  setTimeout(() => { closeLens(); finishQuest(); }, 900);
}

/* ---------- 10. ТАЙМЕР ---------- */
const QUEST_SECONDS = 360;

function clock(sec) {
  return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
}

function startTimer() {
  const node = document.getElementById('quest-timer');
  let left = QUEST_SECONDS;
  node.textContent = clock(left);
  node.classList.remove('warn');
  clearInterval(quest.timerId);
  quest.timerId = setInterval(() => {
    left--;
    if (left <= 0) {
      clearInterval(quest.timerId);
      node.textContent = 'не спеши';
      node.classList.remove('warn');
      return;
    }
    node.textContent = clock(left);
    node.classList.toggle('warn', left <= 45);
  }, 1000);
}

/* ---------- 11. ПОТОК ЭКРАНОВ ---------- */
function startQuest() {
  quest.solvedA = false;
  quest.solvedB = false;
  closeLens(true);
  buildBoard();
  updateProgress();
  document.getElementById('board-hint').classList.remove('gone');
  document.getElementById('board-viewport').scrollTop = 0;
  resetMissions();
  showScreen('quest');
  startTimer();
}

function finishQuest() {
  clearInterval(quest.timerId);
  showScreen('result');
  setTimeout(openInvite, 2500);
}

function openInvite() {
  showScreen('invite');
  if (window.confetti) {
    const end = Date.now() + 2200;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 62, origin: { x: 0, y: 0.62 },
        colors: ['#b8a06a', '#e2892e', '#f4ecd9'] });
      confetti({ particleCount: 4, angle: 120, spread: 62, origin: { x: 1, y: 0.62 },
        colors: ['#b8a06a', '#e2892e', '#f4ecd9'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
  renderQR(`https://yandex.ru/maps/?text=${addressQuery}`);
}

document.getElementById('start-btn').addEventListener('click', startQuest);
document.getElementById('replay-btn').addEventListener('click', startQuest);
document.getElementById('board-viewport').addEventListener('scroll', () => {
  document.getElementById('board-hint').classList.add('gone');
}, { once: true });

/* ---------- 12. ТАЙНЫЕ ЗАДАНИЯ НА ВЕЧЕР ---------- */
const GUEST_MISSIONS = {
  'Никита': 'Весь вечер оценивай ЛЮБОЙ напиток вслух с лицом сомелье — даже воду. Обязательно вставляй «танины», «долгое послевкусие», «нотки дуба».',
  'Алёна': 'Каждый раз, когда кто-то наливает себе выпить, молча и со знанием дела покачай головой — будто не одобряешь выбор бокала.',
  'Денис': 'Весь вечер как бы невзначай напоминай, что у тебя тоже почти день рождения — скажи это минимум дважды с абсолютно серьёзным лицом.',
  'Даша': 'Найди повод трижды сказать «а вот у нас было по-другому» — про любую мелочь, от салата до музыки.',
  'Мигаль': 'Весь вечер предлагай всем помочь что-нибудь донести или подвинуть, даже если помощь не нужна. Минимум пять раз.',
  'Матвей': 'Про любую вещь, которую увидишь за вечер, между делом скажи: «у меня похожее, но получше». Минимум трижды.',
  'Лера': 'Сфотографируй свою тарелку или бокал как для журнала минимум четыре раза, вслух комментируя свет и композицию.',
  'Артём': 'Расскажи всем одну и ту же историю про Дениса несколько раз за вечер — но каждый раз меняй в ней одну деталь.',
};

function resetMissions() {
  const card = document.getElementById('mission-card');
  card.hidden = true;
  document.getElementById('mission-text').textContent = '';
  document.querySelectorAll('.mission-btn').forEach((b) => b.classList.remove('used', 'active'));
}

document.querySelectorAll('.mission-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const card = document.getElementById('mission-card');
    document.getElementById('mission-eyebrow').textContent = `Тайное задание · ${name}`;
    card.hidden = false;
    card.dataset.name = name;
    typewrite(document.getElementById('mission-text'), GUEST_MISSIONS[name] || '', 16);
    document.querySelectorAll('.mission-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('mission-hide-btn').addEventListener('click', () => {
  const card = document.getElementById('mission-card');
  const name = card.dataset.name;
  card.hidden = true;
  document.getElementById('mission-text').textContent = '';
  const btn = document.querySelector(`.mission-btn[data-name="${name}"]`);
  if (btn) btn.classList.add('used');
});

/* ---------- 13. ПРИГЛАШЕНИЕ: КАЛЕНДАРЬ, КАРТЫ, QR ---------- */
const EVENT = {
  title: 'День рождения Дениса (24 года)',
  start: '20260918T153000',
  end: '20260918T193000',
  location: '3 Резиденция, ул. Северная, 52, Строитель',
  description: 'Приглашение на день рождения! Дресс-код: по желанию.',
};

const pad = (n) => String(n).padStart(2, '0');
function icsStamp(date) {
  return date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate()) + 'T' +
    pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + 'Z';
}

document.getElementById('add-calendar').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Denis Birthday Invite//RU', 'BEGIN:VEVENT',
    'UID:' + Date.now() + '@denis-birthday-invite',
    'DTSTAMP:' + icsStamp(new Date()),
    'DTSTART:' + EVENT.start,
    'DTEND:' + EVENT.end,
    'SUMMARY:' + EVENT.title,
    'LOCATION:' + EVENT.location.replace(/,/g, '\\,'),
    'DESCRIPTION:' + EVENT.description,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'den-rozhdeniya-denisa.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

function renderQR(text) {
  const box = document.getElementById('qr-code');
  const block = document.querySelector('.qr-block');
  box.innerHTML = '';
  if (!window.QRCode) {
    // библиотека не догрузилась — прячем блок, чтобы не осталось пустой рамки
    if (block) block.hidden = true;
    return;
  }
  if (block) block.hidden = false;
  new QRCode(box, {
    text,
    width: 168,
    height: 168,
    colorDark: '#241f13',
    colorLight: '#fffaf0',
    correctLevel: QRCode.CorrectLevel.M,
  });
}

const addressQuery = encodeURIComponent('Строитель, улица Северная, 52');
document.getElementById('map-yandex').href = `https://yandex.ru/maps/?text=${addressQuery}`;
document.getElementById('map-google').href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
