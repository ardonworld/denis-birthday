/* =========================================================
   Сцена бара: настоящая модель посуды + студийная HDRI-карта
   + световые панели, дающие стеклу длинные блики.

   Модель: "Glass Collection" (RagingCow), лицензия CC-BY-4.0.
   Карта окружения: Poly Haven "Studio Small 09", CC0.
   ========================================================= */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* какой меш из набора под какой коктейль и как наливать жидкость.
   Меш 5 не используем: у него ручка, тело вращения по нему не строится. */
const GLASSES = {
  rocks:     { mesh: 2, fill: 0.55 },
  highball:  { mesh: 7, fill: 0.8 },
  wine:      { mesh: 8, fill: 0.5 },
  coupe:     { mesh: 9, fill: 0.55 },
  hurricane: { mesh: 3, fill: 0.6 },
  tall:      { mesh: 0, fill: 0.82 },
  tumbler:   { mesh: 4, fill: 0.7 },
  footed:    { mesh: 1, fill: 0.5 },
  shot:      { mesh: 6, fill: 0.8 },
};

export class BarScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.ready = false;
    this.group = null;
    this.meshes = [];
    this.pointer = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.pending = null;
    this.quality = 'high';
  }

  async init(opts = {}) {
    this.quality = opts.quality || 'high';
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === 'high' ? 2 : 1.4));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.95, 6.4);

    /* свет как на предметной съёмке: рисующий сверху-сбоку, контровой
       из-за бокала (он подсвечивает кромку) и еле заметная заливка */
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xcfe3ff, 2.2);
    rim.position.set(-2.5, 3.5, -5);
    this.scene.add(rim);
    this.keyLight = key;
    this.rimLight = rim;
    this.setMood('light');
    this.expo = this.mood.exposure;
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    await this.buildEnvironment();
    await this.buildBackdrop();

    if (this.quality === 'high' && opts.bloom) {
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(this.scene, this.camera));
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight), 0.32, 0.9, 0.95));
      composer.addPass(new OutputPass());
      this.composer = composer;
    }

    await this.loadModel();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    this.enabled = true;
    this.loop();
    if (this.pending) { const a = this.pending; this.pending = null; this.build(...a); }
  }

  /* HDRI на внутренней сфере плюс светящиеся панели: именно панели
     дают длинные блики по стенке бокала. */
  async buildEnvironment() {
    const hdr = await new RGBELoader().loadAsync('assets/studio.hdr');

    const envScene = new THREE.Scene();
    /* Купол приглушён: если светло со всех сторон, стекло выглядит пластиком.
       Нужен контраст — светлые полосы на тёмном. */
    envScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(60, 48, 32),
      new THREE.MeshBasicMaterial({ map: hdr, color: new THREE.Color(0x24262b), side: THREE.BackSide })
    ));

    const panel = (w, h, x, y, z, rx, ry, color, power) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power) })
      );
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, 0);
      envScene.add(m);
      return m;
    };
    /* узкие яркие полосы дают чёткий блик по стенке */
    panel(0.9, 18, -6.2, 1, 1.5, 0, Math.PI / 2, '#ffffff', 16);
    panel(0.55, 15, -7.4, 0, -1, 0, Math.PI / 2, '#eaf2ff', 10);
    panel(0.7, 16, 6.6, 0.5, 1, 0, -Math.PI / 2, '#dceaff', 12);
    panel(11, 7, 0, 6.4, 0.5, Math.PI / 2, 0, '#ffffff', 7);
    /* тёмные экраны — от них в стекле появляются глубокие тени */
    panel(6, 18, -3.2, 0, 5.5, 0, 0, '#000000', 1);
    panel(6, 18, 3.2, 0, 5.5, 0, 0, '#000000', 1);
    panel(20, 20, 0, -7.5, 0, -Math.PI / 2, 0, '#000000', 1);
    this.accentPanel = panel(7, 6, 0, -1, -10, 0, 0, '#e0492c', 2.4);

    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.pmrem.compileEquirectangularShader();
    this.envScene = envScene;
    this.scene.environment = this.pmrem.fromScene(envScene, 0.02).texture;
  }

  /* Фон бара живёт ВНУТРИ сцены, а не подложкой под страницу:
     только так стекло преломляет огни стойки, и бокал перестаёт
     висеть в пустоте. Кадр — Higgsfield Soul 2.0. */
  async buildBackdrop() {
    try {
      const tex = await new THREE.TextureLoader().loadAsync('assets/bar-bg.jpg');
      tex.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(17.8, 10),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, depthWrite: false }));
      m.position.set(0, -0.35, -6);
      m.renderOrder = -1;
      this.scene.add(m);
      this.backdrop = m;
      this.bgTint = new THREE.Color(0xffffff);
    } catch (e) {
      /* без фона сцена остаётся рабочей — просто на чёрном */
      this.backdrop = null;
    }
  }

  refreshEnvironment(accent) {
    /* фон слегка подтягиваем к цвету позиции, иначе янтарная стойка
       спорит с розовым космополитеном и зелёным егерем */
    if (accent) this.bgTint = new THREE.Color(0xffffff).lerp(new THREE.Color(accent), 0.22);
    if (!this.accentPanel || !this.pmrem) return;
    this.accentPanel.material.color = new THREE.Color(accent).multiplyScalar(2.4);
    const old = this.scene.environment;
    this.scene.environment = this.pmrem.fromScene(this.envScene, 0.02).texture;
    if (old) old.dispose();
  }

  async loadModel() {
    const gltf = await new GLTFLoader().loadAsync('assets/glasses/scene.gltf');
    const list = [];
    gltf.scene.traverse((o) => { if (o.isMesh) list.push(o); });
    this.meshes = list;

    const hi = this.quality === 'high';
    /* Настоящее стекло выдаёт не блик, а толща: свет, проходя сквозь неё,
       чуть зеленеет и гаснет. Это даёт attenuationColor/Distance. */
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.01,
      ior: 1.51,
      transmission: hi ? 1 : 0,
      thickness: 0.28,
      attenuationColor: new THREE.Color(0xe8f7f0),
      attenuationDistance: 6.5,
      specularIntensity: 1,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 1.45,
      transparent: true,
      opacity: hi ? 1 : 0.32,
      side: THREE.DoubleSide,
      depthWrite: hi,
    });
    this.ready = true;
  }

  /* ---------- ЖИДКОСТЬ ----------
     Три вещи отличают напиток от «заливки цветом»:
     цвет густеет ко дну, поверхность отражает свет отдельно от толщи,
     и по ней всё время идёт волна. Всё это делаем в шейдере. */

  /* общая для тела и поверхности функция волны — иначе они разойдутся */
  static WAVE_GLSL = `
    float waveAt(vec3 p, float t){
      return (sin(p.x * 5.2 + t * 2.9) + sin(p.z * 4.1 - t * 2.2)
            + sin((p.x + p.z) * 7.3 + t * 3.7) * 0.45) * 0.42;
    }`;

  liquidUniforms(color, opts) {
    const c = new THREE.Color(color);
    return {
      uTime:  { value: 0 },
      uWave:  { value: 0.006 },
      uY0:    { value: 0 },
      uY1:    { value: 1 },
      uDeep:  { value: opts.deep ? new THREE.Color(opts.deep)
                        : c.clone().multiplyScalar(0.72) },
      uTop:   { value: c.clone().lerp(new THREE.Color(0xffffff), 0.1).multiplyScalar(1.06) },
      uPure:  { value: c.clone() },
      uFizz:  { value: opts.fizz ? 1 : 0 },
    };
  }

  /* толща напитка: густой у дна, светлее к поверхности, с пузырьками у стенки */
  bodyMaterial(color, opts, u) {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color).multiplyScalar(0.22),
      roughness: 0.16, metalness: 0,
      clearcoat: 0.9, clearcoatRoughness: 0.1,
      envMapIntensity: 0.75,
      transmission: 0, transparent: false,
    });
    m.customProgramCacheKey = () => 'bar-liquid-body';
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = `
        uniform float uTime; uniform float uWave; uniform float uY0; uniform float uY1;
        varying float vH; varying vec2 vLUv;
        ${BarScene.WAVE_GLSL}
      ` + sh.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        vH = clamp((transformed.y - uY0) / max(uY1 - uY0, 0.0001), 0.0, 1.0);
        vLUv = uv;
        transformed.y += waveAt(transformed, uTime) * uWave * pow(vH, 3.0);
      `);
      sh.fragmentShader = `
        uniform float uTime; uniform vec3 uDeep; uniform vec3 uTop; uniform vec3 uPure; uniform float uFizz;
        varying float vH; varying vec2 vLUv;
        float hash(float n){ return fract(sin(n * 43758.5453) * 43758.5453); }
      ` + sh.fragmentShader.replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        /* на просвет напиток горит по касательной — как настоящий в стекле */
        float fres = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.6);
        totalEmissiveRadiance += uPure * fres * 0.4 * (0.3 + vH * 0.7);
      `).replace('#include <color_fragment>', `
        #include <color_fragment>
        /* цвет густеет ко дну */
        diffuseColor.rgb = mix(uDeep, uTop, smoothstep(0.05, 0.95, vH));
        /* пузырьки идут вверх вдоль стенки */
        if (uFizz > 0.5) {
          float b = 0.0;
          for (int i = 0; i < 14; i++) {
            float fi = float(i);
            float cx = hash(fi * 1.37);
            float sp = 0.22 + hash(fi * 3.11) * 0.5;
            float py = fract(uTime * sp * 0.5 + hash(fi * 7.53));
            vec2 d = vLUv - vec2(cx, py);
            d.x = min(abs(d.x), 1.0 - abs(d.x));
            float r = 0.013 + hash(fi * 5.29) * 0.011;
            b += smoothstep(r, r * 0.3, length(vec2(d.x, d.y * 0.5)));
          }
          diffuseColor.rgb += clamp(b, 0.0, 1.6) * 0.55;
        }
      `);
    };
    return m;
  }

  /* гладь напитка: отдельное зеркало со своей нормалью и мениском у стенки */
  surfaceMaterial(color, opts, u) {
    const base = opts.foam ? new THREE.Color(opts.foam) : new THREE.Color(color);
    const m = new THREE.MeshPhysicalMaterial({
      color: base,
      roughness: opts.foam ? 0.6 : 0.14,
      metalness: 0,
      emissive: base.clone().multiplyScalar(0.16),
      clearcoat: opts.foam ? 0.2 : 0.55, clearcoatRoughness: opts.foam ? 0.5 : 0.08,
      envMapIntensity: opts.foam ? 0.45 : 0.9,
      transmission: 0, transparent: false,
      side: THREE.DoubleSide,
    });
    m.customProgramCacheKey = () => 'bar-liquid-surface';
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = `
        uniform float uTime; uniform float uWave;
        varying float vR;
        ${BarScene.WAVE_GLSL}
      ` + sh.vertexShader
        .replace('#include <beginnormal_vertex>', `
          #include <beginnormal_vertex>
          /* нормаль гладит волну аналитически — иначе блик стоит на месте */
          float dx = (waveAt(position + vec3(0.02,0.0,0.0), uTime) - waveAt(position - vec3(0.02,0.0,0.0), uTime)) / 0.04;
          float dz = (waveAt(position + vec3(0.0,0.0,0.02), uTime) - waveAt(position - vec3(0.0,0.0,0.02), uTime)) / 0.04;
          objectNormal = normalize(vec3(-dx * uWave * 9.0, 1.0, -dz * uWave * 9.0));
        `)
        .replace('#include <begin_vertex>', `
          #include <begin_vertex>
          vR = uv.y;
          transformed.y += waveAt(transformed, uTime) * uWave;
        `);
      sh.fragmentShader = `
        varying float vR;
      ` + sh.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        /* мениск: у стенки напиток чуть светлее и ярче */
        float rim = smoothstep(0.82, 1.0, vR);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.7 + 0.05, rim);
      `);
    };
    return m;
  }

  /* Снимаем профиль бокала: на каждой высоте — максимальный радиус.
     По нему строим жидкость, тогда она физически не может вылезти. */
  profileOf(geometry, bins = 96) {
    if (geometry.userData._prof) return geometry.userData._prof;
    const pos = geometry.attributes.position;
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const y0 = bb.min.y, y1 = bb.max.y, h = y1 - y0;
    /* ось бокала — середина габарита, а не ноль: часть мешей смещена */
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    const r = new Float32Array(bins).fill(0);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) - cx, y = pos.getY(i), z = pos.getZ(i) - cz;
      const k = Math.min(bins - 1, Math.max(0, Math.floor(((y - y0) / h) * bins)));
      const rad = Math.hypot(x, z);
      if (rad > r[k]) r[k] = rad;
    }
    for (let i = 1; i < bins; i++) if (r[i] === 0) r[i] = r[i - 1];
    for (let i = bins - 2; i >= 0; i--) if (r[i] === 0) r[i] = r[i + 1];
    let rMax = 0;
    for (let i = 0; i < bins; i++) if (r[i] > rMax) rMax = r[i];
    const prof = { r, y0, y1, h, bins, rMax, cx, cz };
    geometry.userData._prof = prof;
    return prof;
  }

  /* Где начинается чаша: ниже — ножка, туда наливать нельзя */
  bowlBottom(prof) {
    const { r, bins, rMax } = prof;
    /* идём сверху вниз по чаше и останавливаемся там, где она сужается:
       ниже начинается ножка, дальше спускаться нельзя */
    let i = bins - 1;
    while (i > 0 && r[i] > rMax * 0.3) i--;
    return Math.min(i + 1, bins - 6);
  }

  /* Жидкость — тело вращения по профилю бокала с зазором от стенки */
  liquidGeometry(prof, fill, gap = 0.92) {
    const { r, y0, h, bins, cx, cz } = prof;
    const from = this.bowlBottom(prof);
    const to = Math.min(bins - 3, Math.round(from + (bins - from) * fill));
    const yAt = (i) => y0 + (i / bins) * h;
    const pts = [new THREE.Vector2(0, yAt(from))];
    for (let i = from; i <= to; i++) pts.push(new THREE.Vector2(Math.max(r[i] * gap, 0.001), yAt(i)));
    pts.push(new THREE.Vector2(0, yAt(to)));
    const g = new THREE.LatheGeometry(pts, 96);
    g.translate(cx, 0, cz);
    g.userData.top = yAt(to);
    g.userData.rTop = Math.max(r[to] * gap, 0.001);
    g.userData.bottom = yAt(from);
    return g;
  }

  /* Лёд плавает у самой поверхности: три кубика по кругу, каждый
     наполовину утоплен. Уровень им задаёт loop, пока напиток наливается. */
  buildIce(rTop, cx, cz) {
    const grp = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf6ff, metalness: 0, roughness: 0.14,
      emissive: new THREE.Color(0x0d1a24),
      clearcoat: 1, clearcoatRoughness: 0.06,
      envMapIntensity: 1.7, transmission: 0, transparent: false,
    });
    const s = rTop * 0.38;
    for (let i = 0; i < 4; i++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), mat);
      cube.userData.own = true;
      const a2 = (i / 4) * Math.PI * 2 + 0.7;
      const rr = rTop * (0.3 + (i % 2) * 0.22);
      cube.position.set(cx + Math.cos(a2) * rr, 0, cz + Math.sin(a2) * rr);
      cube.rotation.set(0.4 + i * 0.5, a2 * 1.7, 0.25 + i * 0.3);
      cube.userData.phase = i * 2.1;
      grp.add(cube);
    }
    grp.userData.own = true;
    grp.userData.size = s;
    return grp;
  }

  /* Струя: напиток должен именно наливаться сверху, а не просто
     подниматься уровнем. Живёт только пока идёт налив. */
  buildPourStream(rTop, cx, cz, color) {
    const geo = new THREE.CylinderGeometry(rTop * 0.1, rTop * 0.075, 1, 20, 1, true);
    const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color).multiplyScalar(0.45),
      roughness: 0.1, metalness: 0,
      clearcoat: 1, clearcoatRoughness: 0.05,
      envMapIntensity: 1.1,
      transmission: 0, transparent: false,
      side: THREE.DoubleSide,
    }));
    m.position.x = cx; m.position.z = cz;
    m.userData.own = true;
    m.renderOrder = 2;
    return m;
  }

  /* Капли, которые выбивает струя при ударе о поверхность */
  buildDroplets(rTop, cx, cz, color) {
    const grp = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color).multiplyScalar(0.35),
      roughness: 0.08, metalness: 0, clearcoat: 1,
      envMapIntensity: 1.2, transmission: 0, transparent: false,
    });
    for (let i = 0; i < 7; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(rTop * (0.035 + Math.random() * 0.03), 8, 6), mat);
      d.userData.own = true;
      const a = (i / 7) * Math.PI * 2 + Math.random();
      d.userData.dir = new THREE.Vector2(Math.cos(a), Math.sin(a));
      d.userData.speed = 0.55 + Math.random() * 0.6;
      d.userData.lift = 0.7 + Math.random() * 0.7;
      grp.add(d);
    }
    grp.position.set(cx, 0, cz);
    grp.userData.own = true;
    grp.userData.r = rTop;
    return grp;
  }

  /* ---------- ГАРНИР ----------
     Голый бокал — главное, что выдаёт рендер. Долька на кромке,
     соляная кромка и трубочка возвращают предметность. */

  /* Долька цитруса рисуется на канве: мякоть дольками, кожура кольцом */
  citrusTexture(peel, flesh) {
    const key = peel + flesh;
    this._citrus = this._citrus || {};
    if (this._citrus[key]) return this._citrus[key];
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.clearRect(0, 0, 256, 256);
    const R = 124;
    x.fillStyle = peel;
    x.beginPath(); x.arc(128, 128, R, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff6e2';
    x.beginPath(); x.arc(128, 128, R * 0.88, 0, Math.PI * 2); x.fill();
    for (let i = 0; i < 9; i++) {
      const a1 = (i / 9) * Math.PI * 2 + 0.05;
      const a2 = ((i + 1) / 9) * Math.PI * 2 - 0.05;
      x.fillStyle = flesh;
      x.beginPath(); x.moveTo(128, 128);
      x.arc(128, 128, R * 0.8, a1, a2); x.closePath(); x.fill();
    }
    x.fillStyle = 'rgba(255,255,255,0.75)';
    x.beginPath(); x.arc(128, 128, R * 0.1, 0, Math.PI * 2); x.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    this._citrus[key] = t;
    return t;
  }

  buildCitrus(rTop, yTop, cx, cz, kind) {
    const tone = {
      orange:     ['#f08a1c', '#ffb347'],
      lemon:      ['#e8c72b', '#fbe98a'],
      lime:       ['#7fb52c', '#c3e08a'],
      grapefruit: ['#e8703f', '#f4a08a'],
    }[kind] || ['#f08a1c', '#ffb347'];
    const r = rTop * 0.62;
    const g = new THREE.Mesh(
      new THREE.CircleGeometry(r, 40),
      new THREE.MeshPhysicalMaterial({
        map: this.citrusTexture(tone[0], tone[1]),
        roughness: 0.55, metalness: 0,
        clearcoat: 0.6, clearcoatRoughness: 0.3,
        envMapIntensity: 0.9,
        transparent: true, alphaTest: 0.5,
        side: THREE.DoubleSide,
      }));
    /* сажаем на кромку под наклоном, как надевают дольку на бокал */
    g.position.set(cx + rTop * 0.88, yTop - r * 0.08, cz + rTop * 0.25);
    g.rotation.set(0, -0.62, 0.38);
    g.userData.own = true;
    g.renderOrder = 4;
    return g;
  }

  /* Соляная кромка — крупинки по ободку */
  buildRimSalt(rTop, yTop, cx, cz) {
    const g = new THREE.Mesh(
      new THREE.TorusGeometry(rTop * 1.0, rTop * 0.055, 8, 90),
      new THREE.MeshPhysicalMaterial({
        color: 0xf6f9ff, roughness: 0.85, metalness: 0,
        envMapIntensity: 1.1, flatShading: true,
      }));
    g.rotation.x = Math.PI / 2;
    g.position.set(cx, yTop - rTop * 0.03, cz);
    g.userData.own = true;
    g.renderOrder = 4;
    return g;
  }

  /* Трубочка: торчит из бокала под углом */
  buildStraw(rTop, yTop, cx, cz, accent) {
    const len = rTop * 2.1;
    const g = new THREE.Mesh(
      new THREE.CylinderGeometry(rTop * 0.075, rTop * 0.075, len, 12, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(accent),
        roughness: 0.3, metalness: 0,
        clearcoat: 1, clearcoatRoughness: 0.15,
        envMapIntensity: 1.2, side: THREE.DoubleSide,
      }));
    /* уводим вбок: торчащая вверх трубочка залезала в заголовок */
    g.position.set(cx - rTop * 0.5, yTop + len * 0.1, cz + rTop * 0.22);
    g.rotation.z = 0.5;
    g.rotation.x = -0.14;
    g.userData.own = true;
    g.renderOrder = 4;
    return g;
  }

  /* Пятно света под бокалом: напиток бросает цвет на стойку.
     Без него бокал висит в пустоте. */
  causticTexture() {
    if (this._caustic) return this._caustic;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.42)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    this._caustic = new THREE.CanvasTexture(c);
    return this._caustic;
  }

  buildCaustic(width, y, cx, cz, color) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 2.6, width * 2.6),
      new THREE.MeshBasicMaterial({
        map: this.causticTexture(),
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(cx, y + 0.004, cz);
    m.userData.own = true;
    m.renderOrder = 0;
    return m;
  }

  /* гладь напитка: диск из концентрических колец, чтобы по нему шла волна.
     uv.y идёт от центра к стенке — по нему рисуем мениск. */
  surfaceGeometry(rTop, y, cx, cz, rings = 18) {
    const pts = [];
    for (let i = 0; i <= rings; i++) pts.push(new THREE.Vector2((i / rings) * rTop, y));
    const g = new THREE.LatheGeometry(pts, 96);
    g.translate(cx, 0, cz);
    return g;
  }


  /* Характер подачи. Лёгкие — светло и бодро; крепкие — темнее,
     тяжелее, бокал заходит медленно; секретный — выплывает из темноты
     почти без разворота, горит только контровой свет. */
  setMood(name) {
    const M = {
      light:  { exposure: 1.08, key: 1.4,  rim: 2.2, enterMs: 1150, spin: 6.2, sweep: 1,    flash: 0.75, bg: 0.5 },
      strong: { exposure: 0.92, key: 1.05, rim: 2.8, enterMs: 1650, spin: 3.4, sweep: 0.8,  flash: 0.45, bg: 0.32 },
      secret: { exposure: 0.66, key: 0.3,  rim: 3.6, enterMs: 2600, spin: 0.9, sweep: 0.08, flash: 0,    bg: 0.13 },
    };
    this.mood = M[name] || M.light;
  }

  /* бокал уходит с разворотом — потом на его место прилетает следующий */
  leave() {
    if (this.group) this.leaveFrom = performance.now();
  }

  /* сторона, с которой прилетит следующий бокал: чередуем, чтобы
     показ не выглядел одинаково от коктейля к коктейлю */
  nextSide() {
    this.side = this.side === 1 ? -1 : 1;
    return this.side;
  }

  build(kind, liquidColor, accent, opts = {}) {
    if (!this.ready) { this.pending = [kind, liquidColor, accent, opts]; return; }
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse((o) => {
        if (o.geometry && o.userData.own) o.geometry.dispose();
        if (o.material && o.userData.own) o.material.dispose();
      });
    }
    const cfg = GLASSES[kind] || GLASSES.rocks;
    const src = this.meshes[cfg.mesh];
    if (!src) return;

    const g = new THREE.Group();
    const glass = new THREE.Mesh(src.geometry, this.glassMat);
    glass.renderOrder = 3;
    g.add(glass);

    const prof = this.profileOf(src.geometry);
    const geo = this.liquidGeometry(prof, cfg.fill);
    const yBase = prof.y0 + (this.bowlBottom(prof) / prof.bins) * prof.h;

    /* толща и гладь живут одной группой: наливаем — двигается всё разом */
    const u = this.liquidUniforms(liquidColor, opts);
    u.uY0.value = geo.userData.bottom;
    u.uY1.value = geo.userData.top;
    this.liquidU = u;

    const body = new THREE.Mesh(geo, this.bodyMaterial(liquidColor, opts, u));
    body.userData.own = true;
    body.renderOrder = 1;

    const surf = new THREE.Mesh(
      this.surfaceGeometry(geo.userData.rTop * 0.995, geo.userData.top + 0.004, prof.cx, prof.cz),
      this.surfaceMaterial(liquidColor, opts, u));
    surf.userData.own = true;
    surf.renderOrder = 2;

    const liquid = new THREE.Group();
    liquid.add(body);
    liquid.add(surf);
    g.add(liquid);
    this.liquid = liquid;

    /* лёд живёт вне группы напитка: он не должен сплющиваться при наливе */
    this.ice = null;
    if (opts.ice) {
      this.ice = this.buildIce(geo.userData.rTop, prof.cx, prof.cz);
      g.add(this.ice);
    }

    /* струя, капли от удара и пятно света на стойке */
    this.stream = this.buildPourStream(geo.userData.rTop, prof.cx, prof.cz, liquidColor);
    g.add(this.stream);
    this.drops = this.buildDroplets(geo.userData.rTop, prof.cx, prof.cz, liquidColor);
    g.add(this.drops);
    this.caustic = this.buildCaustic(prof.rMax, prof.y0, prof.cx, prof.cz, liquidColor);
    g.add(this.caustic);

    /* гарнир садится на кромку бокала */
    const rimR = prof.r[prof.bins - 4];
    if (opts.garnish) g.add(this.buildCitrus(rimR, prof.y1, prof.cx, prof.cz, opts.garnish));
    if (opts.rim === 'salt') g.add(this.buildRimSalt(rimR, prof.y1, prof.cx, prof.cz));
    if (opts.straw) g.add(this.buildStraw(rimR, prof.y1, prof.cx, prof.cz, accent || '#ffffff'));

    this.glassTop = prof.y1;
    this.tilt = 0; this.tiltV = 0; this.prevX = null;
    this.liquidTop = geo.userData.top;
    this.liquidBase = yBase;
    this.pourFrom = performance.now() + 260;   // наливаем чуть позже появления
    this.splashFrom = this.pourFrom;           // и плещем при наливе

    const box = new THREE.Box3().setFromObject(glass);
    const s2 = new THREE.Vector3(); box.getSize(s2);
    const c2 = new THREE.Vector3(); box.getCenter(c2);
    this.fitScale = 1.5 / Math.max(s2.y, 0.001);
    g.scale.setScalar(this.fitScale);
    g.position.set(-c2.x * this.fitScale, -c2.y * this.fitScale, -c2.z * this.fitScale);
    this.baseY = g.position.y;

    this.group = g;
    this.scene.add(g);
    this.enterFrom = performance.now();
    this.enterSide = this.nextSide();
    this.leaveFrom = 0;
    this.flashFrom = performance.now();   // вспышка света на приходе
    this.dollyFrom = performance.now();   // камера подъезжает и отходит
    if (accent) this.refreshEnvironment(accent);
  }

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  /* прогресс прокрутки в экранах: 0 — бар, 1 — кухня, 2 — табак */
  setScroll(p) { this.scroll = p; }

  loop() {
    requestAnimationFrame(() => this.loop());
    if (!this.enabled) return;
    const sp = this.scroll || 0;
    this.scrollEase = (this.scrollEase ?? sp) + (sp - (this.scrollEase ?? sp)) * 0.08;
    this.pointer.x += (this.target.x - this.pointer.x) * 0.045;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.045;
    const t = performance.now() * 0.001;

    if (this.group) {
      const e = this.scrollEase;
      /* бокал улетает вверх-влево и уменьшается, когда уходим на кухню */
      const away = Math.min(Math.max(e, 0), 2);
      this.group.rotation.y = t * 0.12 + this.pointer.x * 0.35 + away * 0.9;
      this.group.rotation.x = this.pointer.y * 0.06 - away * 0.12;
      this.group.position.x = -away * 3.4;
      this.group.position.y = this.baseY + Math.sin(t * 0.7) * 0.04 + away * 2.2;
      this.group.position.z = -away * 3;
      this.camera.position.z = 6.4 + away * 1.6;
      this.canvas.style.opacity = String(Math.max(0, 1 - away * 1.7));
      /* УХОД: бокал заваливается набок, уносится по дуге и схлопывается */
      if (this.leaveFrom) {
        const lk = Math.min((performance.now() - this.leaveFrom) / 620, 1);
        const le = lk * lk;
        const s = this.side || 1;
        this.group.rotation.y += le * 5.2;
        this.group.rotation.z = -s * le * 1.1;
        this.group.position.x += s * le * 4.2;
        this.group.position.y += le * 0.9 - le * le * 2.6;
        this.group.position.z -= le * 4.4;
        this.group.scale.setScalar(this.fitScale * Math.max(1 - le * 1.15, 0.001));
      }
      /* ПРИХОД: влетает сбоку снизу, доворачивается и слегка перелетает */
      if (this.enterFrom) {
        const k = Math.min((performance.now() - this.enterFrom) / this.mood.enterMs, 1);
        const e = 1 - Math.pow(1 - k, 3);
        /* мягкий перелёт по масштабу — бокал «дышит», встав на место */
        const ov = Math.sin(Math.min(k, 1) * Math.PI) * 0.07 * (1 - k);
        this.group.scale.setScalar(this.fitScale * (0.55 + e * 0.45 + ov));
        const s = -(this.enterSide || 1);
        this.group.rotation.y += (1 - e) * this.mood.spin * s;
        const sw = this.mood.sweep;
        this.group.rotation.z = s * (1 - e) * 0.85 * sw;
        this.group.position.x += s * (1 - e) * 3.6 * sw;
        this.group.position.y -= (1 - e) * (1.5 - sw * 0.2 + (1 - sw) * 0.6);
        this.group.position.z -= (1 - e) * 2.4;
        if (k >= 1) { this.enterFrom = 0; this.group.rotation.z = 0; }
      }
      /* напиток наливается на глазах и чуть плещется у стенки */
      if (this.liquid && this.pourFrom) {
        const pk = Math.min(Math.max((performance.now() - this.pourFrom) / 1300, 0), 1);
        const pe = pk < 0.5 ? 4 * pk * pk * pk : 1 - Math.pow(-2 * pk + 2, 3) / 2;
        const kk = Math.max(pe, 0.001);
        this.liquid.scale.y = kk;
        this.liquid.position.y = this.liquidBase * (1 - kk);
        /* волна: как только налили, жидкость коротко качается */
        const w = pk > 0.55 ? Math.sin((pk - 0.55) * 26) * (1 - pk) * 0.09 : 0;
        this.liquid.rotation.z = w;
        this.pourK = kk;
        if (pk >= 1) { this.pourFrom = 0; this.liquid.rotation.z = 0; }
      }
      /* СТРУЯ: льётся сверху до уровня напитка и обрывается, когда налито */
      if (this.stream) {
        const kk = this.pourK ?? 1;
        const level = this.liquidTop * kk + this.liquidBase * (1 - kk);
        const pk = this.pourFrom
          ? Math.min(Math.max((performance.now() - this.pourFrom) / 1300, 0), 1) : 1;
        /* струя набирает силу в начале и обрывается к концу налива */
        const life = pk < 0.08 ? pk / 0.08 : (pk > 0.82 ? Math.max(0, (1 - pk) / 0.18) : 1);
        this.stream.visible = life > 0.01;
        if (this.stream.visible) {
          const top = this.glassTop + 1.1;
          const h = Math.max(top - level, 0.01);
          this.stream.scale.set(life, h, life);
          this.stream.position.y = level + h / 2;
        }
      }
      /* КАПЛИ: струя выбивает их из поверхности */
      if (this.drops) {
        const pk = this.pourFrom
          ? Math.min(Math.max((performance.now() - this.pourFrom) / 1300, 0), 1) : 1;
        const kk = this.pourK ?? 1;
        const level = this.liquidTop * kk + this.liquidBase * (1 - kk);
        const r = this.drops.userData.r;
        this.drops.visible = pk > 0.1 && pk < 0.95;
        if (this.drops.visible) {
          this.drops.children.forEach((d, i) => {
            /* каждая капля живёт свой короткий цикл и падает обратно */
            const c = ((pk * 3.2) + i * 0.37) % 1;
            const dir = d.userData.dir;
            d.position.set(dir.x * c * r * d.userData.speed, 0, dir.y * c * r * d.userData.speed);
            d.position.y = level + (Math.sin(c * Math.PI) * d.userData.lift * r * 0.55);
            const fade = Math.sin(c * Math.PI);
            d.scale.setScalar(Math.max(fade, 0.001));
          });
        }
      }
      /* ПЯТНО СВЕТА на стойке дышит вместе с напитком */
      if (this.caustic) {
        const kk = this.pourK ?? 1;
        this.caustic.material.opacity = 0.2 + kk * 0.4 + Math.sin(t * 1.7) * 0.05;
      }
      /* ИНЕРЦИЯ: бокал двинулся — напиток качнулся следом с запозданием */
      if (this.liquid && !this.pourFrom) {
        const x = this.group.position.x + this.group.rotation.y * 0.35;
        if (this.prevX === null) this.prevX = x;
        this.tiltV = (this.tiltV + (x - this.prevX) * 0.5) * 0.86;
        this.prevX = x;
        this.tilt = (this.tilt + this.tiltV) * 0.9;
        /* больше 0.05 рад нельзя: напиток начнёт выходить за стенку */
        const lim = Math.max(-0.05, Math.min(0.05, this.tilt));
        this.liquid.rotation.z = lim;
        if (this.ice) this.ice.rotation.z = lim;
      }
      /* лёд всплывает вместе с уровнем и качается на волне */
      if (this.ice) {
        const kk = this.pourK ?? 1;
        const level = this.liquidTop * kk + this.liquidBase * (1 - kk);
        const amp = this.liquidU ? this.liquidU.uWave.value : 0.01;
        this.ice.visible = kk > 0.4;
        this.ice.children.forEach((c, i) => {
          const ph = c.userData.phase + t * 1.6;
          c.position.y = level - this.ice.userData.size * (0.2 + Math.sin(ph) * 0.06)
            + Math.sin(ph * 1.3) * amp * 6;
          c.rotation.z = 0.25 + i * 0.3 + Math.sin(ph * 0.8) * amp * 9;
          c.rotation.x = 0.4 + i * 0.5 + Math.cos(ph * 0.7) * amp * 7;
        });
      }
    }
    /* поверхность напитка живёт всё время: после налива волна затухает
       до едва заметной ряби, но никогда не встаёт колом */
    if (this.liquidU) {
      this.liquidU.uTime.value = t;
      let amp = 0.016;
      if (this.splashFrom) {
        const sk = (performance.now() - this.splashFrom) / 2200;
        if (sk >= 1) this.splashFrom = 0;
        else if (sk > 0) amp += 0.075 * Math.pow(1 - sk, 2.2);
      }
      /* от движения мыши напиток тоже отзывается */
      amp += Math.abs(this.pointer.x - this.target.x) * 0.06;
      this.liquidU.uWave.value += (amp - this.liquidU.uWave.value) * 0.14;
    }
    /* свет и экспозиция плавно перетекают к настроению позиции:
       к секретной свет гаснет постепенно, а не щелчком */
    if (this.mood) {
      const f = 0.035;
      this.expo += (this.mood.exposure - this.expo) * f;
      this.keyLight.intensity += (this.mood.key - this.keyLight.intensity) * f;
      this.rimLight.intensity += (this.mood.rim - this.rimLight.intensity) * f;
      this.renderer.toneMappingExposure = this.expo + (this.flashBoost || 0);
      /* стойка темнеет вместе с настроением и чуть плывёт за мышью —
         глубина кадра читается без единого клика */
      if (this.backdrop) {
        const target = this.bgTint.clone().multiplyScalar(this.mood.bg);
        this.backdrop.material.color.lerp(target, f);
        this.backdrop.position.x += (-this.pointer.x * 0.45 - this.backdrop.position.x) * 0.06;
        this.backdrop.position.y += (-0.35 + this.pointer.y * 0.2 - this.backdrop.position.y) * 0.06;
      }
    }
    /* камера подъезжает на смене коктейля и плавно отходит */
    if (this.dollyFrom) {
      const dk = Math.min((performance.now() - this.dollyFrom) / 1600, 1);
      const de = 1 - Math.pow(1 - dk, 3);
      this.camera.position.z -= (1 - de) * 1.15;
      if (dk >= 1) this.dollyFrom = 0;
    }
    /* короткая вспышка света — как будто включили софит на новую подачу */
    if (this.flashFrom) {
      const fk = Math.min((performance.now() - this.flashFrom) / 900, 1);
      this.flashBoost = (1 - fk) * (1 - fk) * this.mood.flash;
      if (fk >= 1) { this.flashFrom = 0; this.flashBoost = 0; }
    }
    this.camera.lookAt(0, -0.08, 0);
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}

export function detectQuality() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'off';
    const mem = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    if ((mem && mem <= 2) || cores <= 2) return 'off';
    if ((mem && mem <= 4) || cores <= 4) return 'low';
    return 'high';
  } catch (e) { return 'off'; }
}
