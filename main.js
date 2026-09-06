/* =========================================================
   ДЕЛО № 24 — «ПРОПАВШИЙ КУПАЖ»
   Весь сайт — доска расследования: улики приколоты к столу,
   по клику улика приближается к зрителю и открывает содержимое.

   Четыре улики нельзя решить по отдельности — ответы разбросаны
   по показаниям девяти свидетелей, читать нужно всё.
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
const FIG_LIGHT = '#cdc5b1';

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
    curly: `
      <path d="M24 102c0-17 11-28 26-28s26 11 26 28z" fill="${FIG}"/>
      <circle cx="50" cy="40" r="16" fill="${FIG}"/>
      <circle cx="35" cy="28" r="8" fill="${FIG_2}"/>
      <circle cx="50" cy="22" r="9" fill="${FIG_2}"/>
      <circle cx="65" cy="28" r="8" fill="${FIG_2}"/>`,
    dressLady: `
      <path d="M50 60l-20 42h40z" fill="${FIG_LIGHT}"/>
      <path d="M38 58c0-9 5-15 12-15s12 6 12 15z" fill="${FIG_LIGHT}"/>
      <circle cx="50" cy="30" r="14" fill="${FIG}"/>
      <path d="M34 44c0-14 6-22 16-22s16 8 16 22c-4-8-9-11-16-11s-12 3-16 11z" fill="${FIG_2}"/>`,
    beard: `
      <path d="M22 102c0-18 12-30 28-30s28 12 28 30z" fill="${FIG}"/>
      <circle cx="50" cy="37" r="17" fill="${FIG}"/>
      <path d="M35 44c0 9 7 14 15 14s15-5 15-14c0 0-4 5-15 5s-15-5-15-5z" fill="${FIG_2}"/>
      <path d="M32 32c1-12 9-18 18-18s17 6 18 18c-5-7-11-9-18-9s-13 2-18 9z" fill="${FIG_2}"/>`,
    /* предметные снимки */
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
    clockShot: `
      <circle cx="50" cy="51" r="34" fill="none" stroke="${FIG}" stroke-width="5"/>
      <circle cx="50" cy="51" r="3" fill="${FIG}"/>
      <path d="M50 51V26" stroke="${FIG}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M50 51l15 9" stroke="${FIG_3}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="20" r="2.5" fill="${FIG_2}"/>
      <circle cx="81" cy="51" r="2.5" fill="${FIG_2}"/>
      <circle cx="50" cy="82" r="2.5" fill="${FIG_2}"/>
      <circle cx="19" cy="51" r="2.5" fill="${FIG_2}"/>`,
    stairsShot: `
      <path d="M0 102h30V80h22V58h22V36h26" stroke="${FIG_2}" stroke-width="6" fill="none"/>
      <path d="M62 52l-9 22h18z" fill="${FIG_LIGHT}" opacity="0.9"/>
      <path d="M56 51c0-6 3-10 7-10s7 4 7 10z" fill="${FIG_LIGHT}" opacity="0.9"/>
      <circle cx="63" cy="33" r="8" fill="${FIG}" opacity="0.85"/>`,
    /* варианты одежды для опознания */
    figSuit: `
      <path d="M50 40l-14 6v56h28V46z" fill="${FIG_2}"/>
      <path d="M50 46l-7 4 7 9 7-9z" fill="${FIG_3}"/>
      <circle cx="50" cy="24" r="12" fill="${FIG}"/>`,
    figDress: `
      <path d="M50 48L32 102h36z" fill="${FIG_LIGHT}"/>
      <path d="M40 47c0-8 4-13 10-13s10 5 10 13z" fill="${FIG_LIGHT}"/>
      <circle cx="50" cy="24" r="12" fill="${FIG}"/>`,
    figSport: `
      <path d="M30 52c0-9 9-15 20-15s20 6 20 15v22H30z" fill="${FIG_3}"/>
      <rect x="34" y="76" width="32" height="26" fill="${FIG_2}"/>
      <rect x="20" y="52" width="8" height="30" rx="4" fill="${FIG}"/>
      <rect x="72" y="52" width="8" height="30" rx="4" fill="${FIG}"/>
      <circle cx="50" cy="24" r="12" fill="${FIG}"/>`,
    figCoat: `
      <path d="M50 38l-17 8v56h34V46z" fill="${FIG}"/>
      <path d="M50 46v56" stroke="${FIG_2}" stroke-width="2.5"/>
      <path d="M33 46l8-6 9 6-9 8z" fill="${FIG_2}"/>
      <path d="M67 46l-8-6-9 6 9 8z" fill="${FIG_2}"/>
      <circle cx="50" cy="24" r="12" fill="${FIG}"/>`,
  };
  return open + (shapes[kind] || shapes.man) + close;
}

function bottleSVG(color, w) {
  const width = w || 38;
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
  strip.innerHTML = ['man', 'bottleShot', 'dressLady']
    .map((k) => `<div class="mini-shot">${silhouette(k)}</div>`).join('');
}

/* ---------- 3. ОТВЕТЫ ---------- */
const FRAG = { a: 'ЛЕС', b: '2002', c: '00:22', d: 'СВЕТЛОЕ ПЛАТЬЕ' };
const CULPRIT = ['софья', 'софия', 'соня'];

/* ---------- 4. КОНФИГ ДОСКИ ---------- */
const BOARD_ITEMS = [
  {
    id: 'brief', type: 'note', x: 50, y: 3.5, rot: -1.2,
    head: 'Дело № 24 · рапорт',
    body: 'Ночью из погреба «3 Резиденции» пропала бутылка особой выдержки.',
    more: 'нажми — прочесть целиком',
    detail: {
      eyebrow: 'Инспектор Бочкарёв · вечерняя смена',
      text: 'Замок цел, окно закрыто, свет в погребе кто-то выключил. На полу — еловые иголки, на крышке ящика свежий скол. Девять человек были в доме и все дали показания. Четыре улики ждут разбора, но по отдельности ни одна не сходится: ответ на каждую спрятан в чужих словах. Читайте всех, сверяйте время, вычёркивайте лишнее. Сейф в кабинете откроется, только когда сойдутся все четыре замка — и когда вы назовёте того, кто спускался в погреб.',
      sign: '— Бочкарёв',
    },
  },

  /* ---- свидетели ---- */
  {
    id: 'nikita', type: 'polaroid', fig: 'man', x: 20, y: 11, rot: -4.5, label: 'Никита',
    detail: {
      eyebrow: 'Свидетель · разбирается в напитках',
      fig: 'man', shotCap: 'Никита',
      quote: '«Янтарную можете сразу вычеркнуть — мы открыли её за ужином, я сам её и допил, пустая стоит на кухне. Пропавшая пахла иначе: хвоя, смола, будто её держали в еловом ящике. Я выходил покурить в 00:10, вернулся в 00:35 — никого не встретил, к сожалению».',
      sign: 'алиби нет',
    },
  },
  {
    id: 'alena', type: 'polaroid', fig: 'woman', x: 74, y: 11.5, rot: 3.5, label: 'Алёна',
    detail: {
      eyebrow: 'Свидетель · разбирается в напитках',
      fig: 'woman', shotCap: 'Алёна',
      quote: '«Красную я узнала бы из тысячи, но её увезли ещё днём — спросите Матвея. А около полуночи в погреб спускалась фигура в светлом. Светлое в тот вечер было ровно на одном человеке, остальные все в тёмном. Я весь вечер была в зале, меня видели все».',
      sign: 'алиби подтверждено',
    },
  },
  {
    id: 'migal', type: 'polaroid', fig: 'strong', x: 72, y: 21.5, rot: -3, label: 'Мигаль',
    detail: {
      eyebrow: 'Свидетель · алиби железное',
      fig: 'strong', shotCap: 'Мигаль',
      quote: '«Чёрная бутылка — моя минералка, не трогайте её вообще. Я с 23:30 до 00:40 был у штанги, весь зал подтвердит. И вот что важно: через главный вход за это время никто не выходил, я бы заметил. Значит, выносили через чёрный».',
      sign: 'исключён из подозреваемых',
    },
  },
  {
    id: 'matvey', type: 'polaroid', fig: 'suit', x: 24, y: 30, rot: 2.5, label: 'Матвей',
    detail: {
      eyebrow: 'Свидетель',
      fig: 'suit', shotCap: 'Матвей',
      quote: '«Красную бутылку я забрал днём к себе домой, Алёна не даст соврать. Видел машину у чёрного входа около полуночи — не моя, моя стояла спереди. И да, Софья была в светлом платье, она специально подбирала под скатерти. Весь вечер я провёл с Лерой».',
      sign: 'алиби подтверждено',
    },
  },
  {
    id: 'lera', type: 'polaroid', fig: 'updo', x: 70, y: 30.5, rot: -2, label: 'Лера',
    detail: {
      eyebrow: 'Свидетель · снимала весь вечер',
      fig: 'updo', shotCap: 'Лера',
      quote: '«На моём кадре 23:47 бутылка ещё стоит на стойке. Золотую я снимала до самого утра — она никуда не девалась, стояла на виду. А на одном снимке за спиной случайно попал человек, спускающийся в погреб. Отдаю снимок следствию».',
      sign: 'снимок — улика Г',
    },
  },
  {
    id: 'sofya', type: 'polaroid', fig: 'dressLady', x: 76, y: 39, rot: 3, label: 'Софья',
    detail: {
      eyebrow: 'Свидетель · жена именинника',
      fig: 'dressLady', shotCap: 'Софья',
      quote: '«Я весь вечер встречала гостей у входа, никуда не отлучалась. Торт заказывала сама: свечей ровно столько, сколько ему исполняется — двадцать четыре. И утром я привезла еловые ветки, украшать зал, — если где-то нашли иголки, это наверняка мои».',
      sign: 'алиби со слов свидетеля',
    },
  },
  {
    id: 'denis', type: 'polaroid', fig: 'beard', x: 22, y: 47, rot: -3.5, label: 'Денис (гость)',
    detail: {
      eyebrow: 'Свидетель',
      fig: 'beard', shotCap: 'Денис',
      quote: '«Ровно в 00:15 в погребе погас свет — я ещё пошутил про пробки. Пошёл к щитку один, провозился минут десять. Когда возвращался, у чёрного входа хлопнула дверь, но я никого не разглядел».',
      sign: 'время отмечено точно',
    },
  },
  {
    id: 'dasha', type: 'polaroid', fig: 'curly', x: 58, y: 47.5, rot: 2, label: 'Даша',
    detail: {
      eyebrow: 'Свидетель',
      fig: 'curly', shotCap: 'Даша',
      quote: '«Сигнализация на чёрном входе пикнула ровно через семь минут после того, как погас свет, — я как раз смотрела на часы. И ещё: у главного входа в тот момент вообще никого не было, мы с Денисом сами открывали дверь опоздавшим гостям».',
      sign: 'важно для времени',
    },
  },
  {
    id: 'artem', type: 'polaroid', fig: 'cap', x: 20, y: 64, rot: -4, label: 'Артём',
    detail: {
      eyebrow: 'Свидетель · нашёл квитанцию',
      fig: 'cap', shotCap: 'Артём',
      quote: '«Стыдно признаться: я уснул в машине с полуночи до часа ночи. Проснулся, зашёл в дом — на столе кладовщика лежала квитанция. Сфотографировал на всякий случай, вдруг пригодится следствию».',
      sign: 'алиби нет',
    },
  },

  /* ---- улики ---- */
  {
    id: 'evidence-a', type: 'polaroid', fig: 'bottleShot', x: 22, y: 21, rot: -2.5,
    label: 'Улика А', evidence: 'a',
  },
  {
    id: 'evidence-g', type: 'polaroid', fig: 'stairsShot', x: 45, y: 37.5, rot: 3.5,
    label: 'Улика Г', evidence: 'd',
  },
  {
    id: 'evidence-v', type: 'polaroid', fig: 'clockShot', x: 30, y: 55.5, rot: -2,
    label: 'Улика В', evidence: 'c',
  },
  {
    id: 'evidence-b', type: 'polaroid', fig: 'receiptShot', x: 64, y: 65, rot: 3,
    label: 'Улика Б', evidence: 'b',
  },

  /* ---- декор и подсказки ---- */
  { id: 'sticky1', type: 'sticky', x: 47, y: 17.5, rot: 4, text: 'свечей = ?' },
  { id: 'sticky2', type: 'sticky', x: 13, y: 38.5, rot: -6, text: 'светлое — одно!' },
  { id: 'sticky3', type: 'sticky', x: 88, y: 46.5, rot: 5, text: '00:15 + 7 =' },
  { id: 'sticky4', type: 'sticky', x: 12, y: 73, rot: -4, text: 'вычеркни лишние' },
  {
    id: 'news', type: 'news', x: 68, y: 57, rot: -3,
    brand: 'ВЕЧЕРНИЙ СТРОИТЕЛЬ',
    head: 'Резиденция закрыта на спецобслуживание',
    detail: {
      eyebrow: 'Вырезка · вчерашний выпуск',
      text: '«Заведение на Северной закрыто на спецобслуживание: готовится частное торжество. Владелец сообщил, что к вечеру пятницы всё будет готово, а гостей ждёт сюрприз из погреба». Заметка выцвела, дата оторвана.',
      sign: 'приобщено к делу',
    },
  },
  { id: 'final', type: 'map', x: 50, y: 82, rot: -1 },
];

const STRINGS = [
  ['brief', 'nikita'], ['brief', 'alena'],
  ['nikita', 'evidence-a'], ['alena', 'evidence-a'], ['migal', 'evidence-a'],
  ['lera', 'evidence-g'], ['alena', 'evidence-g'], ['matvey', 'sofya'],
  ['denis', 'evidence-v'], ['dasha', 'evidence-v'],
  ['artem', 'evidence-b'], ['sofya', 'evidence-b'],
  ['evidence-a', 'final'], ['evidence-b', 'final'],
  ['evidence-v', 'final'], ['evidence-g', 'final'],
];

/* ---------- 5. СБОРКА ДОСКИ ---------- */
const boardCanvas = document.getElementById('board-canvas');
const detailStore = document.getElementById('detail-store');
const quest = { solved: { a: false, b: false, c: false, d: false }, timerId: null };

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

    if (item.type === 'polaroid') {
      node = el('button', 'pin polaroid' + (item.evidence ? ' is-evidence' : ''));
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
          <span class="lock-badge"><span class="lock-ico">🔒</span>нужны все четыре улики</span>
        </span>
        <span class="cap">старый сейф резиденции</span>`;
    }

    node.style.setProperty('--x', item.x + '%');
    node.style.setProperty('--y', item.y + '%');
    node.style.setProperty('--rot', (item.rot || 0) + 'deg');
    node.style.setProperty('--delay', `${0.045 * i}s`);
    node.dataset.id = item.id;
    if (item.evidence) node.dataset.evidence = item.evidence;

    if (item.type !== 'sticky') node.addEventListener('click', () => onPinClick(item, node));
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
  if (item.evidence === 'c') return buildEvidenceC();
  if (item.evidence === 'd') return buildEvidenceD();
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

/* ---------- 6. УЛИКА А: КАКАЯ БУТЫЛКА ПРОПАЛА ---------- */
const BOTTLES = [
  { key: 'amber', color: '#c9772a', name: 'янтарная' },
  { key: 'forest', color: '#1b3f2c', name: 'тёмно-зелёная' },
  { key: 'wine', color: '#6d1c20', name: 'красная' },
  { key: 'gold', color: '#b8a06a', name: 'золотая' },
  { key: 'charcoal', color: '#2a2a28', name: 'чёрная' },
  { key: 'clear', color: '#d8dcd2', name: 'прозрачная' },
];

function buildEvidenceA() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика А · шесть бутылок с места'));
  const p = el('p', 'd-text');
  p.dataset.text = 'Эксперт уверен только в одном: пропавшая пахла хвоей и смолой, и стекло было тёмным. Остальное — в показаниях. Четверо гостей случайно вычеркнули по одной бутылке: кто-то допил, кто-то увёз, кто-то снимал её весь вечер, а одна вообще чужая. Вычеркни лишние и укажи ту, что унесли.';
  box.appendChild(p);
  const row = el('div', 'bottle-row');
  row.id = 'bottle-row';
  box.appendChild(row);
  const fb = el('p', 'd-feedback');
  fb.id = 'visual-feedback';
  box.appendChild(fb);
  return box;
}

function renderBottleRow() {
  const row = document.getElementById('bottle-row');
  if (!row) return;
  row.innerHTML = '';
  [...BOTTLES].sort(() => Math.random() - 0.5).forEach(({ key, color, name }) => {
    const btn = el('button', 'bottle-btn', bottleSVG(color, 38) + `<span class="bottle-name">${name}</span>`);
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
    fb.classList.remove('ok');
    fb.textContent = 'Не она. Сверься с показаниями: кто какую бутылку вычеркнул?';
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Она. На донышке нацарапаны три буквы: ' + FRAG.a;
  solveEvidence('a', 'evidence-a', FRAG.a);
}

/* ---------- 7. УЛИКА Б: ГОД ЗАКЛАДКИ ---------- */
function buildEvidenceB() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика Б · кадр с телефона Артёма'));
  box.appendChild(el('div', 'd-shot',
    `<div class="shot-inner">${silhouette('receiptShot')}</div><div class="shot-cap">квитанция склада</div>`));
  const p = el('p', 'd-text');
  p.dataset.text = 'Год на штампе размыт, читается только текущий — 2026-й. Ниже приписка кладовщика: «Бочку заложили ровно за столько лет до сегодняшнего дня, сколько свечей будет на праздничном торте». Сколько свечей — кладовщик не знал. Зато знает та, кто торт заказывала. Введи год закладки.';
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

function onLogicSubmit(e) {
  e.preventDefault();
  const fb = document.getElementById('logic-feedback');
  if (document.getElementById('logic-input').value.trim() !== FRAG.b) {
    fb.classList.remove('ok');
    fb.textContent = 'Не сходится. Найди, кто заказывал торт, и узнай число свечей.';
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Верно. На обороте проступает год: ' + FRAG.b;
  solveEvidence('b', 'evidence-b', FRAG.b);
}

/* ---------- 8. УЛИКА В: ТОЧНОЕ ВРЕМЯ ---------- */
function buildEvidenceC() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика В · часы в коридоре'));
  box.appendChild(el('div', 'd-shot',
    `<div class="shot-inner">${silhouette('clockShot')}</div><div class="shot-cap">часы остановились</div>`));
  const p = el('p', 'd-text');
  p.dataset.text = 'Бутылку вынесли через чёрный вход — в этом сходятся все. На чёрном входе стоит сигнализация: один короткий сигнал в момент открытия двери. Никто не смотрел на часы в ту секунду, но двое гостей независимо друг от друга назвали то, из чего время складывается. Введи время срабатывания сигнализации в формате 00:00.';
  box.appendChild(p);
  const form = el('form', 'd-form');
  form.id = 'time-form';
  form.autocomplete = 'off';
  form.innerHTML = `
    <input type="text" inputmode="numeric" id="time-input" placeholder="00:00" maxlength="5">
    <button type="submit" class="btn btn-primary">Проверить</button>`;
  form.addEventListener('submit', onTimeSubmit);
  box.appendChild(form);
  const fb = el('p', 'd-feedback');
  fb.id = 'time-feedback';
  box.appendChild(fb);
  return box;
}

function normTime(v) {
  const digits = v.replace(/\D/g, '');
  if (digits.length === 4) return digits;
  if (digits.length === 3) return '0' + digits;
  if (digits.length === 2) return '00' + digits;
  return digits;
}

function onTimeSubmit(e) {
  e.preventDefault();
  const fb = document.getElementById('time-feedback');
  if (normTime(document.getElementById('time-input').value) !== '0022') {
    fb.classList.remove('ok');
    fb.textContent = 'Мимо. Кто-то назвал точное время, а кто-то — сколько минут прошло после.';
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Сходится: ' + FRAG.c + '. Именно тогда хлопнула дверь чёрного входа.';
  solveEvidence('c', 'evidence-v', FRAG.c);
}

/* ---------- 9. УЛИКА Г: КТО НА СНИМКЕ ---------- */
const OUTFITS = [
  { key: 'figSuit', name: 'тёмный костюм' },
  { key: 'figDress', name: 'светлое платье' },
  { key: 'figSport', name: 'спортивная форма' },
  { key: 'figCoat', name: 'длинный плащ' },
];

function buildEvidenceD() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Улика Г · случайный кадр Леры'));
  box.appendChild(el('div', 'd-shot',
    `<div class="shot-inner">${silhouette('stairsShot')}</div><div class="shot-cap">лестница в погреб, 23:47</div>`));
  const p = el('p', 'd-text');
  p.dataset.text = 'Снимок засвечен, лица не видно — различима только одежда фигуры, спускающейся по лестнице. Выбери, во что она одета: это и будет ниточкой к имени. Один из гостей уже сказал, что в тот вечер такое было ровно на одном человеке.';
  box.appendChild(p);
  const row = el('div', 'outfit-row');
  row.id = 'outfit-row';
  box.appendChild(row);
  const fb = el('p', 'd-feedback');
  fb.id = 'outfit-feedback';
  box.appendChild(fb);
  return box;
}

function renderOutfitRow() {
  const row = document.getElementById('outfit-row');
  if (!row) return;
  row.innerHTML = '';
  [...OUTFITS].sort(() => Math.random() - 0.5).forEach(({ key, name }) => {
    const btn = el('button', 'outfit-btn',
      `<span class="outfit-shot">${silhouette(key)}</span><span class="outfit-name">${name}</span>`);
    btn.type = 'button';
    btn.addEventListener('click', () => onOutfitClick(key, btn));
    row.appendChild(btn);
  });
}

function onOutfitClick(key, btn) {
  const fb = document.getElementById('outfit-feedback');
  if (key !== 'figDress') {
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    fb.classList.remove('ok');
    fb.textContent = 'На снимке светлое пятно, а не тёмный силуэт. Присмотрись ещё раз.';
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Да: светлое платье. Теперь вспомни, на ком оно было в тот вечер.';
  solveEvidence('d', 'evidence-g', 'СВЕТЛОЕ ПЛАТЬЕ');
}

/* ---------- 10. ПРОГРЕСС ---------- */
function solveEvidence(key, itemId, fragment) {
  quest.solved[key] = true;
  markSolved(itemId, fragment);
  setTimeout(() => closeLens(), 1800);
}

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

function solvedCount() {
  return Object.values(quest.solved).filter(Boolean).length;
}

function updateProgress() {
  const n = solvedCount();
  document.getElementById('case-progress').textContent = `Улик: ${n} / 4`;
  const map = boardCanvas.querySelector('.map-pin');
  if (map && n === 4) {
    map.classList.remove('locked');
    map.classList.add('unlocked');
    const badge = map.querySelector('.lock-badge');
    if (badge) badge.remove();
    const cap = map.querySelector('.cap');
    if (cap) cap.textContent = 'сейф готов — четыре замка';
  }
}

/* ---------- 11. СЕЙФ: ЧЕТЫРЕ ЗАМКА И ИМЯ ---------- */
function buildFinal() {
  const box = el('div', 'detail');
  box.appendChild(el('p', 'd-eyebrow', 'Старый сейф резиденции'));
  const p = el('p', 'd-text');
  p.dataset.text = 'На дверце четыре наборных замка и латунная табличка: «Кто знает дело — знает и код». Под ними — прорезь для последнего ответа: имя того, кто спускался в погреб в светлом платье. Проверь показания ещё раз: у этого человека алиби рассыпается от слов другого гостя.';
  box.appendChild(p);

  const form = el('form', 'safe-form');
  form.id = 'final-form';
  form.autocomplete = 'off';
  form.innerHTML = `
    <div class="safe-lock"><label for="lock-a">Слово с донышка бутылки</label>
      <input type="text" id="lock-a" placeholder="—"></div>
    <div class="safe-lock"><label for="lock-b">Год закладки</label>
      <input type="text" inputmode="numeric" id="lock-b" maxlength="4" placeholder="—"></div>
    <div class="safe-lock"><label for="lock-c">Время у чёрного входа</label>
      <input type="text" inputmode="numeric" id="lock-c" maxlength="5" placeholder="—"></div>
    <div class="safe-lock"><label for="lock-d">Одежда на снимке</label>
      <input type="text" id="lock-d" placeholder="—"></div>
    <div class="safe-lock safe-lock-name"><label for="lock-name">Кто спускался в погреб</label>
      <input type="text" id="lock-name" placeholder="имя"></div>
    <button type="submit" class="btn btn-primary safe-submit">Открыть сейф</button>`;
  form.addEventListener('submit', onFinalSubmit);
  box.appendChild(form);

  const fb = el('p', 'd-feedback');
  fb.id = 'final-feedback';
  box.appendChild(fb);
  return box;
}

const norm = (v) => v.trim().toLowerCase().replace(/\s+/g, ' ');

function onFinalSubmit(e) {
  e.preventDefault();
  const fb = document.getElementById('final-feedback');
  const checks = [
    ['lock-a', norm(document.getElementById('lock-a').value) === norm(FRAG.a)],
    ['lock-b', document.getElementById('lock-b').value.replace(/\D/g, '') === FRAG.b],
    ['lock-c', normTime(document.getElementById('lock-c').value) === '0022'],
    ['lock-d', norm(document.getElementById('lock-d').value).replace(/ё/g, 'е') === 'светлое платье'],
    ['lock-name', CULPRIT.includes(norm(document.getElementById('lock-name').value).replace(/ё/g, 'е'))],
  ];
  let wrong = 0;
  checks.forEach(([id, ok]) => {
    const field = document.getElementById(id).closest('.safe-lock');
    field.classList.toggle('lock-ok', ok);
    field.classList.toggle('lock-bad', !ok);
    if (!ok) wrong++;
  });
  if (wrong) {
    fb.classList.remove('ok');
    fb.textContent = wrong === 1
      ? 'Один замок не поддался — он отмечен красным.'
      : `Не поддались ${wrong} замка — они отмечены красным.`;
    return;
  }
  fb.classList.add('ok');
  fb.textContent = 'Щелчок, ещё щелчок… сейф открыт.';
  setTimeout(() => { closeLens(); finishQuest(); }, 1000);
}

/* ---------- 12. КРАСНАЯ НИТЬ ---------- */
function drawStrings() {
  const svg = document.getElementById('board-strings');
  const byId = Object.fromEntries(BOARD_ITEMS.map((it) => [it.id, it]));
  svg.innerHTML = STRINGS.map(([a, b]) => {
    const A = byId[a], B = byId[b];
    if (!A || !B) return '';
    const mx = (A.x + B.x) / 2 + (Math.random() - 0.5) * 4;
    const my = (A.y + B.y) / 2 + (Math.random() - 0.5) * 1.2;
    return `<path d="M${A.x} ${A.y} Q${mx} ${my} ${B.x} ${B.y}"
      fill="none" stroke="#b5342c" stroke-width="1.5"
      vector-effect="non-scaling-stroke" opacity="0.68"/>`;
  }).join('');
}

/* ---------- 13. ЛИНЗА: УЛИКА ПРИБЛИЖАЕТСЯ ---------- */
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
  }, speed || 12);
}

function openLens(detailId) {
  const detail = document.getElementById(detailId);
  if (!detail) return;
  closeLens(true);
  openDetailNode = detail;
  lensSlot.appendChild(detail);
  lens.hidden = false;
  lens.classList.remove('closing');
  lens.scrollTop = 0;
  const typed = detail.querySelector('.d-text[data-text]');
  if (typed) typewrite(typed, typed.dataset.text, 11);
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

  if (item.type === 'map' && solvedCount() < 4) {
    node.animate(
      [{ transform: 'translate(-50%,-50%) rotate(-1deg) translateX(-7px)' },
       { transform: 'translate(-50%,-50%) rotate(-1deg) translateX(7px)' },
       { transform: 'translate(-50%,-50%) rotate(-1deg) translateX(0)' }],
      { duration: 320, easing: 'ease' });
    const badge = node.querySelector('.lock-badge');
    if (badge) badge.lastChild.textContent = `собрано ${solvedCount()} из 4 улик`;
    return;
  }
  if (item.evidence && quest.solved[item.evidence]) return;

  openLens('detail-' + item.id);
  if (item.evidence === 'a') renderBottleRow();
  if (item.evidence === 'd') renderOutfitRow();
}

/* ---------- 14. ТАЙМЕР ---------- */
const QUEST_SECONDS = 30 * 60;

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
    node.classList.toggle('warn', left <= 120);
  }, 1000);
}

/* ---------- 15. ПОТОК ЭКРАНОВ ---------- */
function startQuest() {
  quest.solved = { a: false, b: false, c: false, d: false };
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
  setTimeout(openInvite, 3200);
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

/* ---------- 16. ТАЙНЫЕ ЗАДАНИЯ НА ВЕЧЕР ---------- */
const GUEST_MISSIONS = {
  'Никита': 'Весь вечер оценивай ЛЮБОЙ напиток вслух с лицом сомелье — даже воду. Обязательно вставляй «танины», «долгое послевкусие», «нотки дуба».',
  'Алёна': 'Каждый раз, когда кто-то наливает себе выпить, молча и со знанием дела покачай головой — будто не одобряешь выбор бокала.',
  'Денис': 'Весь вечер как бы невзначай напоминай, что у тебя тоже почти день рождения — скажи это минимум дважды с абсолютно серьёзным лицом.',
  'Даша': 'Найди повод трижды сказать «а вот у нас было по-другому» — про любую мелочь, от салата до музыки.',
  'Мигаль': 'Весь вечер предлагай всем помочь что-нибудь донести или подвинуть, даже если помощь не нужна. Минимум пять раз.',
  'Матвей': 'Про любую вещь, которую увидишь за вечер, между делом скажи: «у меня похожее, но получше». Минимум трижды.',
  'Лера': 'Сфотографируй свою тарелку или бокал как для журнала минимум четыре раза, вслух комментируя свет и композицию.',
  'Артём': 'Расскажи всем одну и ту же историю про Дениса несколько раз за вечер — но каждый раз меняй в ней одну деталь.',
  'Софья': 'Ты знала о сюрпризе с самого начала — держи лицо. Минимум трижды за вечер скажи «я тут ни при чём» без всякого повода.',
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

/* ---------- 17. ПРИГЛАШЕНИЕ: КАЛЕНДАРЬ, КАРТЫ, QR ---------- */
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
