import * as THREE from 'three';

/* =========================================================
   1. УПРАВЛЕНИЕ ЭКРАНАМИ
   ========================================================= */
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

/* =========================================================
   2. ФОНОВАЯ 3D-СЦЕНА (Three.js) — стекло + золото
   Обёрнуто в try/catch: если WebGL недоступен (приватный режим,
   старое устройство, отключённое GPU-ускорение), сайт не должен
   ломаться целиком — игра и приглашение обязаны работать всегда.
   ========================================================= */
try {
  init3DBackground();
} catch (err) {
  console.warn('3D-фон недоступен, продолжаем без него:', err);
}

function init3DBackground() {
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);

// Свет — тёмный лес + янтарный отблеск (Jägermeister), тёплое золото (Riscal)
scene.add(new THREE.AmbientLight(0x2f4a3a, 1.1));
const key = new THREE.PointLight(0xffb35e, 3.4, 30);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0x2f6b4a, 2.4, 30);
rim.position.set(-5, -3, 4);
scene.add(rim);
const wineLight = new THREE.PointLight(0x7a1f22, 1.4, 20);
wineLight.position.set(0, -4, 3);
scene.add(wineLight);

const goldMat = new THREE.MeshPhysicalMaterial({
  color: 0xb8a06a,
  metalness: 1,
  roughness: 0.3,
  clearcoat: 0.6,
});
const amberGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffb35e,
  metalness: 0,
  roughness: 0.05,
  transmission: 1,
  thickness: 1.4,
  ior: 1.5,
  clearcoat: 1,
});
const forestMat = new THREE.MeshPhysicalMaterial({
  color: 0x163f2c,
  metalness: 0.6,
  roughness: 0.35,
  clearcoat: 0.5,
});
const wineGlassMat = new THREE.MeshPhysicalMaterial({
  color: 0x7a1f22,
  metalness: 0,
  roughness: 0.08,
  transmission: 0.95,
  thickness: 1.6,
  ior: 1.5,
  clearcoat: 1,
});

const shapes = [];
function addShape(geo, mat, pos, scale, speed) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  mesh.scale.setScalar(scale);
  scene.add(mesh);
  shapes.push({ mesh, speed, offset: Math.random() * Math.PI * 2, tumble: true });
}

// Силуэт бутылки через LatheGeometry (профиль вращается вокруг оси Y)
function makeBottleGeometry() {
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.34, 0),
    new THREE.Vector2(0.36, 0.08),
    new THREE.Vector2(0.36, 0.82),
    new THREE.Vector2(0.3, 0.96),
    new THREE.Vector2(0.15, 1.1),
    new THREE.Vector2(0.13, 1.5),
    new THREE.Vector2(0.13, 1.58),
  ];
  return new THREE.LatheGeometry(profile, 28);
}
function addBottle(mat, capMat, pos, scale, speed) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(makeBottleGeometry(), mat);
  group.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.14, 20), capMat);
  cap.position.y = 1.63;
  group.add(cap);
  group.position.set(...pos);
  group.scale.setScalar(scale);
  group.rotation.z = (Math.random() - 0.5) * 0.5;
  scene.add(group);
  shapes.push({ mesh: group, speed, offset: Math.random() * Math.PI * 2, tumble: false, baseTilt: group.rotation.z });
}

addShape(new THREE.IcosahedronGeometry(1, 0), amberGlassMat, [-2.8, 1.6, -2], 0.7, 0.25);
addShape(new THREE.TorusGeometry(0.9, 0.28, 32, 100), goldMat, [2.6, -1.6, -2.5], 0.85, 0.35);
addShape(new THREE.OctahedronGeometry(0.8, 0), forestMat, [2.2, 1.8, -3], 0.6, 0.3);
addBottle(amberGlassMat, goldMat, [-2.3, -0.8, -1.5], 1, 0.18);
addBottle(wineGlassMat, goldMat, [1.6, 0.4, -1.2], 0.85, 0.22);

// Янтарные частицы — искры/капли выдержанного напитка
const PARTICLES = 260;
const positions = new Float32Array(PARTICLES * 3);
const speeds = new Float32Array(PARTICLES);
for (let i = 0; i < PARTICLES; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 16;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10 - 5;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
  speeds[i] = 0.004 + Math.random() * 0.012;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({
  color: 0xf0d9a8,
  size: 0.045,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

function resize3D() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize3D);

const clock = new THREE.Clock();
function animate3D() {
  requestAnimationFrame(animate3D);
  const t = clock.getElapsedTime();

  shapes.forEach(({ mesh, speed, offset, tumble, baseTilt }) => {
    if (tumble) {
      mesh.rotation.x = t * speed + offset;
      mesh.rotation.y = t * speed * 0.7 + offset;
    } else {
      mesh.rotation.y = t * speed * 0.4 + offset;
      mesh.rotation.z = (baseTilt || 0) + Math.sin(t * 0.5 + offset) * 0.05;
    }
    mesh.position.y += Math.sin(t * 0.6 + offset) * 0.0015;
  });

  camera.position.x = Math.sin(t * 0.08) * 1.4;
  camera.position.y = Math.sin(t * 0.06) * 0.6;
  camera.lookAt(0, 0, 0);

  const pos = particleGeo.attributes.position.array;
  for (let i = 0; i < PARTICLES; i++) {
    pos[i * 3 + 1] += speeds[i];
    if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5;
  }
  particleGeo.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
animate3D();
}

/* =========================================================
   3. КВЕСТ-РАССЛЕДОВАНИЕ «ПРОПАВШИЙ КУПАЖ»
   Улика 1 (визуальная): найти бутылку нужного цвета среди пяти.
   Улика 2 (логическая): арифметика по данным, уже показанным на сайте.
   Обе части складываются в кодовое слово, открывающее координаты.
   ========================================================= */
const BOTTLE_COLORS = [
  { key: 'amber', color: '#e2892e' },
  { key: 'forest', color: '#163f2c' }, // верный ответ — «цвета лесной ночи»
  { key: 'wine', color: '#7a1f22' },
  { key: 'gold', color: '#b8a06a' },
  { key: 'charcoal', color: '#2a2a28' },
];
const FRAGMENT_VISUAL = 'ЛЕС';
const FRAGMENT_LOGIC = '2002';

function bottleSVG(color) {
  return `<svg width="40" height="82" viewBox="0 0 44 90" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="0" width="12" height="16" rx="2" fill="#b8a06a"/>
    <path d="M10 16 h24 v9 c0 5 6 8 6 17 v38 a6 6 0 0 1 -6 6 h-24 a6 6 0 0 1 -6 -6 v-38 c0 -9 6 -12 6 -17 z"
      fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    <rect x="9" y="46" width="26" height="10" fill="#fffdf7" opacity="0.12"/>
  </svg>`;
}

const quest = { visualDone: false, logicDone: false, timerId: null };
const QUEST_SECONDS = 360;

/* Эффект печатной машинки для текста улик — атмосфера детективного досье */
function typewrite(el, text, speed) {
  clearInterval(el._typeTimer);
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  el._typeTimer = setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(el._typeTimer);
      el.classList.remove('typing');
    }
  }, speed || 18);
}

function revealRiddle(cardId) {
  const p = document.querySelector(`#${cardId} .quest-riddle`);
  if (p && p.dataset.text) typewrite(p, p.dataset.text, 16);
}

function formatClock(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startQuestTimer() {
  const el = document.getElementById('quest-timer');
  let remaining = QUEST_SECONDS;
  el.textContent = formatClock(remaining);
  el.classList.remove('warn');
  clearInterval(quest.timerId);
  quest.timerId = setInterval(() => {
    remaining--;
    if (remaining <= 0) {
      clearInterval(quest.timerId);
      el.textContent = 'Не спеши';
      return;
    }
    el.textContent = formatClock(remaining);
    el.classList.toggle('warn', remaining <= 30);
  }, 1000);
}

function stopQuestTimer() {
  clearInterval(quest.timerId);
}

function renderBottleRow() {
  const row = document.getElementById('bottle-row');
  const shuffled = [...BOTTLE_COLORS].sort(() => Math.random() - 0.5);
  row.innerHTML = '';
  shuffled.forEach(({ key, color }) => {
    const btn = document.createElement('button');
    btn.className = 'bottle-btn';
    btn.type = 'button';
    btn.dataset.key = key;
    btn.innerHTML = bottleSVG(color);
    btn.addEventListener('click', () => onBottleClick(key, btn));
    row.appendChild(btn);
  });
}

function onBottleClick(key, btn) {
  const feedback = document.getElementById('visual-feedback');
  if (key === 'forest') {
    quest.visualDone = true;
    feedback.textContent = '';
    setChip('chip-1', FRAGMENT_VISUAL);
    document.getElementById('clue-visual').style.opacity = '0.55';
    document.getElementById('clue-visual').style.pointerEvents = 'none';
    document.getElementById('clue-logic').hidden = false;
    revealRiddle('clue-logic');
    checkQuestComplete();
  } else {
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    feedback.textContent = 'Не тот запах — перечитай отчёт эксперта внимательнее.';
  }
}

function setChip(id, text) {
  const chip = document.getElementById(id);
  chip.classList.add('filled');
  const valueEl = chip.querySelector('.evidence-tag-value');
  if (valueEl) valueEl.textContent = text;
}

/* Переход между главами дела (кнопки с data-next) */
document.querySelectorAll('.chapter-next').forEach((btn) => {
  btn.addEventListener('click', () => {
    const currentCard = btn.closest('.quest-card');
    const nextId = btn.dataset.next;
    if (currentCard) currentCard.hidden = true;
    const next = document.getElementById(nextId);
    if (next) {
      next.hidden = false;
      revealRiddle(nextId);
    }
  });
});

/* Плитки кода — визуализация набираемого шифра сейфа */
function renderCodeTiles(value) {
  const wrap = document.getElementById('code-tiles');
  const chars = value.toUpperCase().replace(/\s+/g, '').split('');
  const shown = chars.length ? chars : [''];
  wrap.innerHTML = shown
    .map((ch) => `<span class="code-tile${ch ? ' filled' : ''}">${ch || ''}</span>`)
    .join('');
}
document.getElementById('final-input').addEventListener('input', (e) => {
  renderCodeTiles(e.target.value);
});
renderCodeTiles('');

function checkQuestComplete() {
  if (quest.visualDone && quest.logicDone) {
    document.getElementById('clue-final').hidden = false;
    revealRiddle('clue-final');
  }
}

document.getElementById('logic-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('logic-input');
  const feedback = document.getElementById('logic-feedback');
  const val = input.value.trim();
  if (val === FRAGMENT_LOGIC) {
    quest.logicDone = true;
    feedback.textContent = '';
    feedback.classList.add('ok');
    setChip('chip-2', FRAGMENT_LOGIC);
    document.getElementById('clue-logic').style.opacity = '0.55';
    document.getElementById('clue-logic').style.pointerEvents = 'none';
    checkQuestComplete();
  } else {
    feedback.classList.remove('ok');
    feedback.textContent = 'Не сходится. Перечитай приписку кладовщика — что значат «24 оборота колец»?';
  }
});

document.getElementById('final-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('final-input');
  const feedback = document.getElementById('final-feedback');
  const normalized = input.value.trim().toUpperCase().replace(/\s+/g, '');
  const code1 = (FRAGMENT_VISUAL + FRAGMENT_LOGIC).toUpperCase();
  const code2 = (FRAGMENT_LOGIC + FRAGMENT_VISUAL).toUpperCase();
  if (normalized === code1 || normalized === code2) {
    feedback.classList.add('ok');
    feedback.textContent = 'Щелчок. Сейф открыт — внутри карта…';
    setTimeout(finishQuest, 900);
  } else {
    feedback.classList.remove('ok');
    feedback.textContent = 'Замок не поддался. Сложи обе находки по порядку без пробела.';
  }
});

function resetQuest() {
  quest.visualDone = false;
  quest.logicDone = false;
  ['chip-1', 'chip-2'].forEach((id) => {
    const chip = document.getElementById(id);
    chip.classList.remove('filled');
    const valueEl = chip.querySelector('.evidence-tag-value');
    if (valueEl) valueEl.textContent = 'не найдена';
  });
  document.getElementById('chapter-cover').hidden = false;
  document.getElementById('chapter-witnesses').hidden = true;
  document.getElementById('clue-visual').hidden = true;
  document.getElementById('clue-visual').style.opacity = '';
  document.getElementById('clue-visual').style.pointerEvents = '';
  document.getElementById('clue-logic').style.opacity = '';
  document.getElementById('clue-logic').style.pointerEvents = '';
  document.getElementById('clue-logic').hidden = true;
  document.getElementById('clue-final').hidden = true;
  document.getElementById('visual-feedback').textContent = '';
  document.getElementById('logic-feedback').textContent = '';
  document.getElementById('logic-feedback').classList.remove('ok');
  document.getElementById('final-feedback').textContent = '';
  document.getElementById('final-feedback').classList.remove('ok');
  document.getElementById('logic-input').value = '';
  document.getElementById('final-input').value = '';
  renderCodeTiles('');
  renderBottleRow();
  resetMissions();
}

function startQuest() {
  resetQuest();
  showScreen('quest');
  revealRiddle('chapter-cover');
  startQuestTimer();
}

function finishQuest() {
  stopQuestTimer();
  showScreen('result');
  setTimeout(openInvite, 2400);
}

function openInvite() {
  showScreen('invite');
  if (window.confetti) {
    const duration = 2200;
    const end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 },
        colors: ['#b8a06a', '#e2892e', '#f3ecd8'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors: ['#b8a06a', '#e2892e', '#f3ecd8'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
  renderQR(`https://yandex.ru/maps/?text=${addressQuery}`);
}

/* =========================================================
   3.1 СЕКРЕТНОЕ ЗАДАНИЕ НА ВЕЧЕР
   У каждого гостя — своё персональное задание. Гость находит
   своё имя, читает и скрывает карточку перед тем, как передать
   телефон дальше — остальные не должны видеть текст.
   ========================================================= */
const GUEST_MISSIONS = {
  'Никита': 'Весь вечер оценивай ЛЮБОЙ напиток вслух с лицом сомелье — даже воду. Используй слова «танины», «долгое послевкусие», «нотки дуба».',
  'Алёна': 'Каждый раз, когда кто-то наливает себе выпить, молча и со знанием дела покачай головой — будто не одобряешь выбор бокала.',
  'Денис': 'Весь вечер как бы невзначай напоминай, что у тебя тоже сегодня почти день рождения — скажи это минимум дважды с серьёзным лицом.',
  'Даша': 'Найди повод трижды сказать «а вот у нас на свадьбе было по-другому» — даже если ты никогда не была на свадьбе.',
  'Мигаль': 'Весь вечер предлагай всем помочь что-нибудь донести или подвинуть, даже если помощь не нужна — покажи силу минимум 5 раз.',
  'Матвей': 'Про любую вещь, которую увидишь за вечером, между делом скажи: «у меня похожее, но получше» — минимум трижды.',
  'Лера': 'Сфотографируй свою тарелку или бокал как для журнала минимум 4 раза, вслух комментируя свет и композицию.',
  'Артём': 'Расскажи всем одну и ту же историю про Дениса несколько раз за вечер — но каждый раз немного меняй детали.',
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
    const textEl = document.getElementById('mission-text');
    document.getElementById('mission-eyebrow').textContent = `Тайное задание · ${name}`;
    card.hidden = false;
    card.dataset.name = name;
    typewrite(textEl, GUEST_MISSIONS[name] || 'Задание не найдено.', 16);
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

function renderQR(text) {
  const container = document.getElementById('qr-code');
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  if (window.QRCode) {
    QRCode.toCanvas(
      canvas,
      text,
      { width: 176, margin: 1, color: { dark: '#241f13', light: '#fffdf7' } },
      (err) => { if (err) console.warn('Не удалось построить QR-код:', err); }
    );
  }
}

document.getElementById('start-btn').addEventListener('click', startQuest);
document.getElementById('replay-btn').addEventListener('click', startQuest);

/* =========================================================
   4. ПРИГЛАШЕНИЕ — календарь и карты
   ========================================================= */
const EVENT = {
  title: 'День рождения Дениса (24 года)',
  start: '20260918T153000',
  end: '20260918T193000',
  location: '3 Резиденция, ул. Северная, 52, Строитель',
  description: 'Приглашение на день рождения! Дресс-код: по желанию.',
};

function pad(n) { return String(n).padStart(2, '0'); }
function icsTimestamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) + 'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) + 'Z'
  );
}

document.getElementById('add-calendar').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Denis Birthday Invite//RU',
    'BEGIN:VEVENT',
    'UID:' + Date.now() + '@denis-birthday-invite',
    'DTSTAMP:' + icsTimestamp(new Date()),
    'DTSTART:' + EVENT.start,
    'DTEND:' + EVENT.end,
    'SUMMARY:' + EVENT.title,
    'LOCATION:' + EVENT.location.replace(/,/g, '\\,'),
    'DESCRIPTION:' + EVENT.description,
    'END:VEVENT',
    'END:VCALENDAR',
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
