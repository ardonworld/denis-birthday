import * as THREE from 'three';

/* =========================================================
   1. УПРАВЛЕНИЕ ЭКРАНАМИ
   ========================================================= */
const screens = {
  intro: document.getElementById('screen-intro'),
  game: document.getElementById('screen-game'),
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

// Свет — тёплый, "люксовый"
scene.add(new THREE.AmbientLight(0x6b5a3a, 1.1));
const key = new THREE.PointLight(0xffe1a8, 3.2, 30);
key.position.set(4, 5, 6);
scene.add(key);
const rim = new THREE.PointLight(0xd4af6a, 2, 30);
rim.position.set(-5, -3, 4);
scene.add(rim);

const goldMat = new THREE.MeshPhysicalMaterial({
  color: 0xd8b878,
  metalness: 1,
  roughness: 0.28,
  clearcoat: 0.6,
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0.05,
  transmission: 1,
  thickness: 1.4,
  ior: 1.5,
  clearcoat: 1,
});

const shapes = [];
function addShape(geo, mat, pos, scale, speed) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  mesh.scale.setScalar(scale);
  scene.add(mesh);
  shapes.push({ mesh, speed, offset: Math.random() * Math.PI * 2 });
}

addShape(new THREE.IcosahedronGeometry(1, 0), glassMat, [-2.6, 1.1, -1], 1.1, 0.25);
addShape(new THREE.TorusGeometry(0.9, 0.28, 32, 100), goldMat, [2.4, -0.6, -2], 1, 0.35);
addShape(new THREE.OctahedronGeometry(0.8, 0), glassMat, [1.8, 1.6, -3], 0.9, 0.3);
addShape(new THREE.TorusKnotGeometry(0.55, 0.16, 120, 16), goldMat, [-2.2, -1.4, -2.5], 0.85, 0.4);
addShape(new THREE.SphereGeometry(0.5, 32, 32), glassMat, [0, -2, -1.5], 0.8, 0.2);

// Золотые частицы — "шампанское"
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

  shapes.forEach(({ mesh, speed, offset }) => {
    mesh.rotation.x = t * speed + offset;
    mesh.rotation.y = t * speed * 0.7 + offset;
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
   3. ИГРА «ЛОВИ ПОДАРКИ»
   ========================================================= */
const gameCanvas = document.getElementById('game-canvas');
const gctx = gameCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const finalScoreEl = document.getElementById('final-score');
const resultTextEl = document.getElementById('result-text');

const GAME_DURATION = 20;
const ITEM_EMOJIS = ['🎁', '🎈', '🥂', '⭐', '🍰'];

const game = {
  active: false,
  score: 0,
  timeLeft: GAME_DURATION,
  items: [],
  basketX: 0,
  spawnTimer: null,
  countdownTimer: null,
  raf: null,
};

function fitGameCanvas() {
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;
  game.basketX = window.innerWidth / 2;
}
window.addEventListener('resize', fitGameCanvas);
fitGameCanvas();

function pointerMove(clientX) {
  const rect = gameCanvas.getBoundingClientRect();
  game.basketX = Math.min(Math.max(clientX - rect.left, 36), gameCanvas.width - 36);
}
gameCanvas.addEventListener('pointermove', (e) => pointerMove(e.clientX));
gameCanvas.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches[0]) pointerMove(e.touches[0].clientX);
    e.preventDefault();
  },
  { passive: false }
);
window.addEventListener('keydown', (e) => {
  if (!game.active) return;
  if (e.key === 'ArrowLeft') game.basketX = Math.max(game.basketX - 40, 36);
  if (e.key === 'ArrowRight') game.basketX = Math.min(game.basketX + 40, gameCanvas.width - 36);
});

function spawnItem() {
  game.items.push({
    x: 40 + Math.random() * (gameCanvas.width - 80),
    y: -30,
    r: 22,
    speed: 2.4 + Math.random() * 2.2 + game.score * 0.03,
    emoji: ITEM_EMOJIS[Math.floor(Math.random() * ITEM_EMOJIS.length)],
    rot: Math.random() * Math.PI,
  });
}

function drawBasket() {
  const y = gameCanvas.height - 70;
  gctx.save();
  gctx.translate(game.basketX, y);
  gctx.font = '52px serif';
  gctx.textAlign = 'center';
  gctx.textBaseline = 'middle';
  gctx.shadowColor = 'rgba(212,175,106,0.6)';
  gctx.shadowBlur = 18;
  gctx.fillText('🧺', 0, 0);
  gctx.restore();
}

function gameTick() {
  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  const basketY = gameCanvas.height - 70;
  for (let i = game.items.length - 1; i >= 0; i--) {
    const it = game.items[i];
    it.y += it.speed;
    it.rot += 0.02;

    gctx.save();
    gctx.translate(it.x, it.y);
    gctx.rotate(Math.sin(it.rot) * 0.2);
    gctx.font = '38px serif';
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.fillText(it.emoji, 0, 0);
    gctx.restore();

    const dx = it.x - game.basketX;
    const dy = it.y - basketY;
    if (Math.sqrt(dx * dx + dy * dy) < 46) {
      game.items.splice(i, 1);
      game.score++;
      scoreEl.textContent = game.score;
      continue;
    }
    if (it.y > gameCanvas.height + 40) game.items.splice(i, 1);
  }

  drawBasket();

  if (game.active) game.raf = requestAnimationFrame(gameTick);
}

function startGame() {
  game.active = true;
  game.score = 0;
  game.timeLeft = GAME_DURATION;
  game.items = [];
  scoreEl.textContent = '0';
  timerEl.textContent = GAME_DURATION;
  showScreen('game');

  let spawnDelay = 850;
  function scheduleSpawn() {
    spawnItem();
    spawnDelay = Math.max(380, spawnDelay - 12);
    game.spawnTimer = setTimeout(scheduleSpawn, spawnDelay);
  }
  scheduleSpawn();

  game.countdownTimer = setInterval(() => {
    game.timeLeft--;
    timerEl.textContent = game.timeLeft;
    if (game.timeLeft <= 0) endGame();
  }, 1000);

  game.raf = requestAnimationFrame(gameTick);
}

function endGame() {
  game.active = false;
  clearTimeout(game.spawnTimer);
  clearInterval(game.countdownTimer);
  cancelAnimationFrame(game.raf);

  finalScoreEl.textContent = game.score;
  if (game.score >= 15) {
    resultTextEl.textContent = 'Невероятно! Ты поймал(а) почти всё веселье этого праздника.';
  } else if (game.score >= 8) {
    resultTextEl.textContent = 'Отличный улов! Праздник явно не обойдётся без тебя.';
  } else {
    resultTextEl.textContent = 'Неважно, сколько поймано — главное, что ты будешь там.';
  }

  showScreen('result');
  setTimeout(openInvite, 2600);
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
        colors: ['#d4af6a', '#f3dfb0', '#ffffff'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors: ['#d4af6a', '#f3dfb0', '#ffffff'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('replay-btn').addEventListener('click', startGame);

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
