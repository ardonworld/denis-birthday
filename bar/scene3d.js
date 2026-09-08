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
    this.camera.position.set(0, 0.15, 6.4);

    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3, 5, 4);
    this.scene.add(key);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    await this.buildEnvironment();

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
    panel(9, 2.2, 0, 7.5, -1, Math.PI / 2, 0, '#ffffff', 5);
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

  refreshEnvironment(accent) {
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
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xeef4f8,
      metalness: 0,
      roughness: 0.015,
      ior: 1.52,
      transmission: hi ? 1 : 0,
      thickness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 3.2,
      transparent: true,
      opacity: hi ? 1 : 0.32,
      side: THREE.DoubleSide,
      depthWrite: hi,
    });
    this.ready = true;
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
    return g;
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

  build(kind, liquidColor, accent) {
    if (!this.ready) { this.pending = [kind, liquidColor, accent]; return; }
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse((o) => { if (o.geometry && o.userData.own) o.geometry.dispose(); });
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

    const liquid = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(liquidColor),
      roughness: 0.3,
      metalness: 0,
      ior: 1.34,
      clearcoat: 0.45,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.28,
      transmission: 0,
      transparent: false,
    }));
    liquid.userData.own = true;
    liquid.renderOrder = 1;
    g.add(liquid);
    this.liquid = liquid;
    this.liquidBase = yBase;
    this.pourFrom = performance.now() + 260;   // наливаем чуть позже появления

    const box = new THREE.Box3().setFromObject(g);
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
        const k = Math.min((performance.now() - this.enterFrom) / 1250, 1);
        const e = 1 - Math.pow(1 - k, 3);
        /* мягкий перелёт по масштабу — бокал «дышит», встав на место */
        const ov = Math.sin(Math.min(k, 1) * Math.PI) * 0.07 * (1 - k);
        this.group.scale.setScalar(this.fitScale * (0.55 + e * 0.45 + ov));
        const s = -(this.enterSide || 1);
        this.group.rotation.y += (1 - e) * 6.2 * s;
        this.group.rotation.z = s * (1 - e) * 0.85;
        this.group.position.x += s * (1 - e) * 3.6;
        this.group.position.y -= (1 - e) * 1.5;
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
        if (pk >= 1) { this.pourFrom = 0; this.liquid.rotation.z = 0; }
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
      this.renderer.toneMappingExposure = 1.05 + (1 - fk) * (1 - fk) * 0.75;
      if (fk >= 1) { this.flashFrom = 0; this.renderer.toneMappingExposure = 1.05; }
    }
    this.camera.lookAt(0, 0, 0);
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
