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

/* ---------- 2. ГРАВЮРНАЯ ГРАФИКА (всё нарисовано вручную) ----------
   Стиль: чёрная тушь по светлой бумаге, как в старых детективных
   гравюрах. Лица — бумага с тонким контуром, волосы, шляпы и одежда —
   сплошная заливка тушью, характер задают предметы: шляпа, очки,
   трубка, борода, фотоаппарат.                                        */
const INK = '#211d18';
const PAPER = '#f1e8d2';
const LIGHT = '#ddd2b6';

const FACE = `
  <ellipse cx="33.5" cy="46" rx="3.2" ry="4.4" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="66.5" cy="46" rx="3.2" ry="4.4" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
  <ellipse cx="50" cy="43" rx="16.5" ry="19.5" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
  <path d="M40.5 39.5q3.5-2 7 0M52.5 39.5q3.5-2 7 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="43.7" cy="45" r="1.7" fill="${INK}"/>
  <circle cx="56.3" cy="45" r="1.7" fill="${INK}"/>
  <path d="M50 47v5l-2.5 2" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M45.5 56q4.5 3.2 9 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

const NECK = `<path d="M43 55h14v21H43z" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`;
const BODY = `<path d="M9 112c0-24 19-38 41-38s41 14 41 38z" fill="${INK}"/>`;
const COLLAR = `<path d="M50 74l-11 6 11 12 11-12z" fill="${PAPER}"/>`;

function silhouette(kind) {
  const open = '<svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg">';
  const close = '</svg>';

  const shapes = {
    /* ---------- портреты гостей ---------- */
    // Никита — знаток напитков: гладкая причёска, бабочка
    man: `${NECK}${BODY}${COLLAR}
      <path d="M50 84l-10-6v12zM50 84l10-6v12z" fill="${INK}"/>
      <rect x="47" y="80.5" width="6" height="7" rx="1.6" fill="${INK}"/>
      ${FACE}
      <path d="M32 41c0-14 8-23 18-23s18 9 18 23c-2-7-4-11-8-13 2 3 2 6 1 8-3-6-9-9-16-8-6 1-10 5-13 13z" fill="${INK}"/>`,

    // Алёна — каре и жемчуг
    woman: `${NECK}${BODY}
      <path d="M27 47c0-17 10-29 23-29s23 12 23 29c0 11-2 19-4 25h-7c4-10 4-20 4-20-7 5-25 5-32 0 0 0 0 10 4 20h-7c-2-6-4-14-4-25z" fill="${INK}"/>
      ${FACE}
      <path d="M28 42c0-15 9-25 22-25s22 10 22 25c-4-11-11-16-22-16s-18 5-22 16z" fill="${INK}"/>
      <g fill="${PAPER}"><circle cx="40" cy="87" r="2.5"/><circle cx="46.5" cy="90" r="2.5"/>
      <circle cx="53.5" cy="90" r="2.5"/><circle cx="60" cy="87" r="2.5"/></g>`,

    // Мигаль — широкие плечи, короткий ёжик
    strong: `<path d="M38 52h24v24H38z" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <path d="M0 112c0-28 22-44 50-44s50 16 50 44z" fill="${INK}"/>
      ${FACE}
      <path d="M31 37h38v-6c0-10-8-17-19-17s-19 7-19 17z" fill="${INK}"/>`,

    // Матвей — костюм, круглые очки, галстук
    suit: `${NECK}${BODY}
      <path d="M50 74l-13 6 13 14 13-14z" fill="${PAPER}"/>
      <path d="M50 90l-4.5 6 4.5 16 4.5-16z" fill="${INK}"/>
      ${FACE}
      <path d="M32 41c0-14 8-23 18-23 8 0 14 5 17 12-6-5-13-7-20-5-6 2-12 6-15 16z" fill="${INK}"/>
      <g fill="none" stroke="${INK}" stroke-width="2">
        <circle cx="43.5" cy="45" r="6.6"/><circle cx="56.5" cy="45" r="6.6"/>
        <path d="M50.1 45h-0.2"/><path d="M36.9 44l-3.4-1.6M63.1 44l3.4-1.6"/></g>`,

    // Лера — пучок, серьги, фотоаппарат на шее
    updo: `${NECK}${BODY}
      <circle cx="50" cy="16" r="9.5" fill="${INK}"/>
      ${FACE}
      <path d="M31 43c0-16 9-26 19-26s19 10 19 26c-3-11-9-16-19-16s-16 5-19 16z" fill="${INK}"/>
      <circle cx="32.5" cy="52" r="2.7" fill="${INK}"/><circle cx="67.5" cy="52" r="2.7" fill="${INK}"/>
      <path d="M40 78l-4 12M60 78l4 12" stroke="${PAPER}" stroke-width="2"/>
      <rect x="36" y="89" width="28" height="17" rx="3.5" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <circle cx="50" cy="97.5" r="5.4" fill="${INK}"/><circle cx="50" cy="97.5" r="2" fill="${PAPER}"/>`,

    // Софья — широкополая шляпа и светлое платье
    dressLady: `<path d="M43 58h14v20H43z" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <path d="M9 112c0-24 19-38 41-38s41 14 41 38z" fill="${LIGHT}" stroke="${INK}" stroke-width="2"/>
      <path d="M50 76l-9 5 9 10 9-10z" fill="${PAPER}"/>
      <ellipse cx="50" cy="46" rx="16.5" ry="19" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
      <path d="M40.5 43q3.5-2 7 0M52.5 43q3.5-2 7 0" stroke="${INK}" stroke-width="1.9" fill="none" stroke-linecap="round"/>
      <circle cx="43.7" cy="48" r="1.7" fill="${INK}"/><circle cx="56.3" cy="48" r="1.7" fill="${INK}"/>
      <path d="M45.5 58q4.5 3 9 0" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="31" rx="31" ry="7.5" fill="${INK}"/>
      <path d="M34 31c0-12 6-19 16-19s16 7 16 19z" fill="${INK}"/>
      <rect x="34" y="25.5" width="32" height="4.5" fill="${LIGHT}"/>`,

    // Денис (гость) — борода и кепка
    beard: `${NECK}${BODY}${COLLAR}
      ${FACE}
      <path d="M32.5 44c0 17 8 26 17.5 26s17.5-9 17.5-26c-3 11-9 15-17.5 15s-14.5-4-17.5-15z" fill="${INK}"/>
      <path d="M45 62q5 3 10 0" stroke="${PAPER}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M31 35c0-12 8-19 19-19s19 7 19 19z" fill="${INK}"/>
      <path d="M27 35h46c0 3.5-2.5 6-6 6H33c-3.5 0-6-2.5-6-6z" fill="${INK}"/>`,

    // Даша — кудри и круглые очки
    curly: `${NECK}${BODY}
      <g fill="${INK}"><circle cx="34" cy="33" r="9.5"/><circle cx="45" cy="25" r="10.5"/>
      <circle cx="57" cy="26" r="10"/><circle cx="67" cy="35" r="9"/>
      <circle cx="30" cy="45" r="7.5"/><circle cx="70" cy="45" r="7.5"/></g>
      ${FACE}
      <g fill="${INK}"><circle cx="35" cy="30" r="8"/><circle cx="47" cy="23" r="9"/>
      <circle cx="59" cy="24" r="8.5"/><circle cx="67" cy="32" r="7.5"/></g>
      <g fill="none" stroke="${INK}" stroke-width="2">
        <circle cx="43.5" cy="45" r="6.2"/><circle cx="56.5" cy="45" r="6.2"/><path d="M49.7 45h0.6"/></g>`,

    // Артём — плоская кепка
    cap: `${NECK}${BODY}${COLLAR}
      ${FACE}
      <path d="M30 36c0-13 9-20 20-20s20 7 20 20z" fill="${INK}"/>
      <circle cx="50" cy="15.5" r="3.2" fill="${INK}"/>
      <path d="M26 36h32c0 4.5-3.5 7-9 7H33c-4 0-7-2.5-7-7z" fill="${INK}"/>`,

    /* ---------- предметные снимки ---------- */
    bottleShot: `<rect x="42" y="10" width="16" height="16" rx="2" fill="${INK}"/>
      <path d="M36 26h28v11c0 7 8 10 8 22v42a7 7 0 0 1-7 7H35a7 7 0 0 1-7-7V59c0-12 8-15 8-22z"
        fill="${INK}"/>
      <rect x="30" y="62" width="40" height="20" fill="${PAPER}"/>
      <path d="M35 68h30M35 73h22M35 78h26" stroke="${INK}" stroke-width="2"/>`,

    receiptShot: `<path d="M25 8h50v88l-7-6-7 6-7-6-7 6-7-6-8 6-7-6z" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>
      <path d="M33 22h34M33 32h34M33 42h24M33 52h30M33 62h20" stroke="${INK}" stroke-width="2.4"/>
      <rect x="33" y="72" width="26" height="8" fill="${INK}"/>`,

    clockShot: `<circle cx="50" cy="55" r="36" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
      <circle cx="50" cy="55" r="30" fill="none" stroke="${INK}" stroke-width="1.5"/>
      <path d="M50 55V29" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M50 55l16 10" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="50" cy="55" r="3.4" fill="${INK}"/>
      <g fill="${INK}"><rect x="48.5" y="24" width="3" height="6"/><rect x="76" y="53.5" width="6" height="3"/>
      <rect x="48.5" y="80" width="3" height="6"/><rect x="18" y="53.5" width="6" height="3"/></g>
      <path d="M40 12h20l-3 8H43z" fill="${INK}"/>`,

    stairsShot: `<path d="M2 112h26V92h22V72h22V52h26" stroke="${INK}" stroke-width="7" fill="none"/>
      <path d="M64 60l-11 26h22z" fill="${LIGHT}" stroke="${INK}" stroke-width="2"/>
      <path d="M57 59c0-7 3-11 7.5-11s7.5 4 7.5 11z" fill="${LIGHT}" stroke="${INK}" stroke-width="2"/>
      <circle cx="64.5" cy="39" r="9" fill="${INK}"/>
      <path d="M8 20l14 10M12 12l4 16" stroke="${INK}" stroke-width="2.5" opacity="0.5"/>`,

    /* ---------- варианты одежды для опознания ---------- */
    figSuit: `<path d="M50 40l-15 7v65h30V47z" fill="${INK}"/>
      <path d="M50 47l-7 5 7 10 7-10z" fill="${PAPER}"/>
      <path d="M50 60l-3 5 3 14 3-14z" fill="${PAPER}"/>
      <circle cx="50" cy="24" r="13" fill="${INK}"/>`,
    figDress: `<path d="M50 50L30 112h40z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.5"/>
      <path d="M39 49c0-9 5-14 11-14s11 5 11 14z" fill="${LIGHT}" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="50" cy="24" r="13" fill="${INK}"/>`,
    figSport: `<path d="M30 56c0-10 9-17 20-17s20 7 20 17v24H30z" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>
      <rect x="33" y="80" width="34" height="32" fill="${INK}"/>
      <rect x="18" y="55" width="9" height="32" rx="4.5" fill="${INK}"/>
      <rect x="73" y="55" width="9" height="32" rx="4.5" fill="${INK}"/>
      <circle cx="50" cy="24" r="13" fill="${INK}"/>`,
    figCoat: `<path d="M50 40l-18 8v64h36V48z" fill="${INK}"/>
      <path d="M50 48v64" stroke="${PAPER}" stroke-width="2.5"/>
      <path d="M32 48l9-7 9 7-9 9z" fill="${PAPER}"/>
      <path d="M68 48l-9-7-9 7 9 9z" fill="${PAPER}"/>
      <circle cx="50" cy="24" r="13" fill="${INK}"/>`,

    /* ---------- реквизит на доску ---------- */
    magnifier: `<circle cx="42" cy="42" r="27" fill="${PAPER}" opacity="0.5"/>
      <circle cx="42" cy="42" r="27" fill="none" stroke="${INK}" stroke-width="8"/>
      <circle cx="42" cy="42" r="20" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.6"/>
      <path d="M33 32q9-5 18 2" stroke="${PAPER}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M61 61l26 30" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
      <path d="M63 66l20 23" stroke="${PAPER}" stroke-width="2" opacity="0.35" stroke-linecap="round"/>`,

    pipe: `<path d="M20 44h34v14a17 17 0 0 1-17 17 17 17 0 0 1-17-17z" fill="${INK}"/>
      <ellipse cx="37" cy="44" rx="17" ry="6" fill="${INK}"/>
      <ellipse cx="37" cy="44" rx="11" ry="3.4" fill="${PAPER}"/>
      <path d="M54 52q22 2 30-14" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M82 40q6-8 12-6" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>`,

    deerstalker: `<path d="M7 60q-11-8-3-19 9 6 15 13z" fill="${INK}"/>
      <path d="M93 60q11-8 3-19-9 6-15 13z" fill="${INK}"/>
      <ellipse cx="50" cy="76" rx="45" ry="10" fill="${INK}"/>
      <path d="M12 76c0-27 17-46 38-46s38 19 38 46z" fill="${INK}"/>
      <path d="M50 30v46" stroke="${PAPER}" stroke-width="2.6"/>
      <path d="M25 58q25-13 50 0" stroke="${PAPER}" stroke-width="2.6" fill="none"/>
      <ellipse cx="50" cy="76" rx="45" ry="10" fill="none" stroke="${PAPER}" stroke-width="1.6" opacity="0.5"/>`,

    fingerprint: `<g fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round">
      <path d="M50 22c-14 0-24 11-24 26 0 9 2 16 4 22"/>
      <path d="M50 34c-8 0-13 6-13 14 0 10 2 16 5 22"/>
      <path d="M50 46c-3 0-5 3-5 8 0 9 2 14 4 20"/>
      <path d="M50 22c14 0 24 11 24 26 0 12-4 20-7 26"/>
      <path d="M50 34c8 0 13 6 13 14 0 12-3 19-6 24"/>
      <path d="M50 46c3 0 5 3 5 8 0 10-2 16-4 22"/></g>`,

    pocketwatch: `<circle cx="50" cy="60" r="32" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
      <circle cx="50" cy="60" r="26" fill="none" stroke="${INK}" stroke-width="1.5"/>
      <path d="M50 60V40M50 60l14 9" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="50" cy="60" r="3" fill="${INK}"/>
      <rect x="44" y="16" width="12" height="10" rx="3" fill="${INK}"/>
      <circle cx="50" cy="12" r="7" fill="none" stroke="${INK}" stroke-width="4"/>`,

    footprints: `<g fill="${INK}">
      <ellipse cx="32" cy="30" rx="9" ry="14" transform="rotate(-16 32 30)"/>
      <ellipse cx="30" cy="46" rx="5.5" ry="4" transform="rotate(-16 30 46)"/>
      <ellipse cx="63" cy="62" rx="9" ry="14" transform="rotate(-16 63 62)"/>
      <ellipse cx="61" cy="78" rx="5.5" ry="4" transform="rotate(-16 61 78)"/>
      <ellipse cx="38" cy="94" rx="9" ry="14" transform="rotate(-16 38 94)"/></g>`,
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

  /* ---- винтажный реквизит ---- */
  {
    id: 'prop-magnifier', type: 'prop', art: 'magnifier', x: 48, y: 92, rot: -12,
    detail: {
      eyebrow: 'Реквизит · лупа инспектора',
      text: 'Ею осмотрели скол на крышке ящика. Скол свежий, оставлен в ночь пропажи: ящик вскрывали второпях и явно не тем инструментом, что лежит в кладовой.',
      sign: '— Бочкарёв',
    },
  },
  {
    id: 'prop-pipe', type: 'prop', art: 'pipe', x: 90, y: 29.5, rot: 9,
    detail: {
      eyebrow: 'Реквизит · трубка следователя',
      text: 'Бочкарёв уверяет, что думает лучше, когда трубка погасла. За эту ночь она гасла четыре раза — ровно по числу улик, которые предстоит разобрать.',
      sign: 'к делу не относится',
    },
  },
  {
    id: 'prop-hat', type: 'prop', art: 'deerstalker', x: 8, y: 58, rot: -8,
    detail: {
      eyebrow: 'Реквизит · шляпа из гардероба',
      text: 'Провисела в прихожей весь вечер, никто из гостей её не надевал. Проверено: пыль на полях не тронута.',
      sign: 'исключено из версий',
    },
  },
  {
    id: 'prop-print', type: 'prop', art: 'fingerprint', x: 42, y: 70.5, rot: 5,
    detail: {
      eyebrow: 'Улика без номера · отпечаток',
      text: 'Снят с горлышка соседней бутылки, которую даже не тронули. Смазан настолько, что эксперт отказался делать выводы. Приобщён к делу формально.',
      sign: 'непригоден',
    },
  },
  {
    id: 'prop-watch', type: 'prop', art: 'pocketwatch', x: 90, y: 74.5, rot: -6,
    detail: {
      eyebrow: 'Реквизит · часы кладовщика',
      text: 'Стрелки замерли на 23:50. Механизм сломан больше недели назад и всё это время врал почти на час — ориентироваться по ним нельзя. Точное время придётся считать по показаниям гостей.',
      sign: 'ложный след',
    },
  },
  {
    id: 'prop-steps', type: 'prop', art: 'footprints', x: 8, y: 91.5, rot: 4,
    detail: {
      eyebrow: 'Реквизит · следы у чёрного входа',
      text: 'Пол был мокрый, отпечатки расплылись — ни размер, ни обувь определить не вышло. Ясно одно: выходили именно здесь, а не через главный вход.',
      sign: 'подтверждает версию',
    },
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
    } else if (item.type === 'prop') {
      node = el('button', 'pin prop');
      node.type = 'button';
      node.innerHTML = `<span class="pushpin pushpin-white"></span>
        <span class="prop-art">${silhouette(item.art)}</span>`;
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
  // Заранее резервируем высоту под полный текст, иначе во время печати
  // карточка растёт и кнопки уезжают из-под пальца.
  node.style.minHeight = '';
  node.textContent = text;
  node.style.minHeight = node.offsetHeight + 'px';
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

let lensCloseTimer = null;

function closeLens(instant) {
  // Отложенное закрытие обязательно снимаем: иначе оно сработает уже
  // после того, как пользователь открыл следующую улику, и унесёт её.
  clearTimeout(lensCloseTimer);
  lensCloseTimer = null;
  if (!openDetailNode) return;
  const node = openDetailNode;
  const finish = () => {
    detailStore.appendChild(node);
    if (openDetailNode === node) {
      openDetailNode = null;
      lens.hidden = true;
    }
    lens.classList.remove('closing');
  };
  if (instant) return finish();
  lens.classList.add('closing');
  lensCloseTimer = setTimeout(finish, 260);
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
}

document.getElementById('start-btn').addEventListener('click', startQuest);
document.getElementById('replay-btn').addEventListener('click', startQuest);
document.getElementById('board-viewport').addEventListener('scroll', () => {
  document.getElementById('board-hint').classList.add('gone');
}, { once: true });

/* ---------- 16. ТАЙНЫЕ ЗАДАНИЯ НА ВЕЧЕР ----------
   Конверты анонимные: никаких имён. Задание выдаётся случайно
   в момент вскрытия, и часть конвертов пустая — так никто не
   знает ни чужого задания, ни того, досталось ли соседу вообще
   хоть что-нибудь.                                            */
/* Шаблоны: {а|б|в} — случайный вариант при вскрытии конверта.
   Так даже одинаковая основа выглядит по-разному, и вычислить,
   у кого какое задание, почти невозможно. */
const MISSIONS = [
  'Каждый раз, когда кто-то говорит «спасибо», отвечай «{занесено в протокол|учтено|принято к сведению}». Ни разу не объясняй почему.',
  '{Три|Четыре|Пять} раза за вечер скажи «а вот у нас было по-другому» — про любую мелочь, от салата до музыки.',
  'Про {три|четыре} разные вещи скажи между делом: «у меня похожее, но получше». Спокойно, без нажима.',
  'Весь вечер называй именинника «{шеф|командир|маэстро}» — как будто так всегда и было.',
  'Оценивай любой напиток вслух с видом сомелье, даже воду. Минимум {три|четыре} раза и обязательно со словом «{танины|послевкусие|минеральность}».',
  'Найди повод {два|три} раза употребить в обычном разговоре слово «{единорог|кальмар|акведук|вторник}».',
  'Похвали {трёх|четырёх} разных людей за наряд так искренне, будто это последний писк парижской моды.',
  'Предложи {четверым|пятерым} помочь что-нибудь донести или подвинуть, даже если помощь совсем не нужна.',
  'Сфотографируй еду или бокал как для журнала {три|четыре} раза, вслух комментируя свет и композицию.',
  'Расскажи одну и ту же историю {двум|трём} разным людям, каждый раз меняя в ней ровно одну деталь.',
  '{Два|Три} раза незаметно поменяй местами два предмета на столе и проверь, заметит ли кто-нибудь.',
  'Весь вечер держись версии, что где-то в доме спрятана ещё одна бутылка. Повтори это минимум {два|три} раза разным людям.',
  'Заведи с кем-нибудь долгий серьёзный разговор про {космос и НЛО|глубоководных рыб|древний Рим} с абсолютно честным лицом.',
  '{Два|Три} раза за вечер начни фразу со слов «как говорил мой дед…» и придумай цитату прямо на ходу.',
  'Собери у {трёх|четырёх} гостей автограф на салфетке, представившись коллекционером.',
  'Каждый раз, когда звучит тост, поднимай {левую|правую} руку чуть выше остальных. Не комментируй.',
  '{Два|Три} раза спроси у разных людей, который час, — даже если только что смотрел на часы.',
  'Убеди {одного человека|двух человек} потанцевать, не приглашая словами: просто начни танцевать рядом.',
  'Весь вечер утверждай, что вы с кем-то из гостей уже {дважды|трижды} где-то виделись, но не помнишь где.',
  '{Три|Четыре} раза за вечер скажи «я как раз об этом думал» с абсолютно серьёзным видом.',
  'Незаметно собери со стола {три|четыре} салфетки и сложи их себе в карман. Никому не показывай.',
  'Каждый раз, когда кто-то смеётся, задержи на нём взгляд на секунду дольше обычного. Минимум {четыре|пять} раз.',
  '{Два|Три} раза скажи кому-нибудь «только между нами» и сообщи абсолютно безобидную мелочь.',
  'Весь вечер держи при себе один и тот же предмет ({вилку|салфетку|пробку}) и не выпускай его из рук дольше минуты.',
];

const missionState = { taken: [] };

function fillTemplate(tpl) {
  return tpl.replace(/\{([^}]+)\}/g, (_, group) => {
    const opts = group.split('|');
    return opts[Math.floor(Math.random() * opts.length)];
  });
}

/* Если хозяин раздал парам разные ссылки (?g=1, ?g=2, …), конверты
   берутся из непересекающихся мест списка — совпадения исключены. */
function envelopeTemplates() {
  const g = parseInt(new URLSearchParams(location.search).get('g'), 10);
  if (Number.isInteger(g) && g > 0) {
    const i = ((g - 1) * 2) % MISSIONS.length;
    return [MISSIONS[i], MISSIONS[(i + 1) % MISSIONS.length]];
  }
  return null;
}
const fixedPair = envelopeTemplates();
let fixedIndex = 0;

function drawEnvelope() {
  let tpl;
  if (fixedPair) {
    tpl = fixedPair[fixedIndex % fixedPair.length];
    fixedIndex++;
  } else {
    const pool = MISSIONS.filter((m) => !missionState.taken.includes(m));
    const list = pool.length ? pool : MISSIONS;
    tpl = list[Math.floor(Math.random() * list.length)];
  }
  missionState.taken.push(tpl);
  return fillTemplate(tpl);
}

function resetMissions() {
  missionState.taken = [];
  fixedIndex = 0;
  const card = document.getElementById('mission-card');
  card.hidden = true;
  document.getElementById('mission-text').textContent = '';
  document.querySelectorAll('.envelope').forEach((env) => {
    env.classList.remove('opened');
    env.disabled = false;
    env.querySelector('.env-state').textContent = 'не вскрыт';
  });
}

document.querySelectorAll('.envelope').forEach((env) => {
  env.addEventListener('click', () => {
    if (env.classList.contains('opened')) return;
    const card = document.getElementById('mission-card');
    env.classList.add('opened');
    env.disabled = true;
    env.querySelector('.env-state').textContent = 'вскрыт';
    document.getElementById('mission-eyebrow').textContent = 'Задание на весь вечер · только для тебя';
    card.hidden = false;
    typewrite(document.getElementById('mission-text'), drawEnvelope(), 16);
  });
});

document.getElementById('mission-hide-btn').addEventListener('click', () => {
  const card = document.getElementById('mission-card');
  card.hidden = true;
  document.getElementById('mission-text').textContent = '';
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

const addressQuery = encodeURIComponent('Строитель, улица Северная, 52');
document.getElementById('map-yandex').href = `https://yandex.ru/maps/?text=${addressQuery}`;
document.getElementById('map-google').href = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
