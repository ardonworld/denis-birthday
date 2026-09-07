/* =========================================================
   Настоящее стекло в браузере: Three.js + физический материал
   с преломлением (transmission). Бокалы собраны из профилей
   вращения, лёд и жидкость — отдельные тела со своим IOR.
   ========================================================= */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const V2 = (x, y) => new THREE.Vector2(x, y);

/* ---------- профили бокалов ---------- */
/* Каждый профиль: внешняя стенка вверх, ободок, внутренняя вниз.
   Замкнутый контур даёт корректное преломление толщины стекла. */
const PROFILES = {
  rocks: {
    glass: [
      V2(0, 0), V2(0.95, 0), V2(1.0, 0.08), V2(1.02, 1.35), V2(1.02, 1.42),
      V2(0.9, 1.42), V2(0.88, 0.3), V2(0, 0.3),
    ],
    liquid: [V2(0, 0.31), V2(0.87, 0.31), V2(0.87, 1.0), V2(0, 1.0)],
    ice: 3, iceSize: 0.42, camDist: 4.6, lift: -0.6,
  },
  highball: {
    glass: [
      V2(0, 0), V2(0.72, 0), V2(0.76, 0.08), V2(0.76, 2.55), V2(0.76, 2.62),
      V2(0.66, 2.62), V2(0.64, 0.26), V2(0, 0.26),
    ],
    liquid: [V2(0, 0.27), V2(0.63, 0.27), V2(0.63, 2.25), V2(0, 2.25)],
    ice: 3, iceSize: 0.34, camDist: 5.6, lift: -1.1,
  },
  wine: {
    glass: [
      V2(0, 0), V2(0.85, 0), V2(0.86, 0.06), V2(0.12, 0.12), V2(0.09, 1.15),
      V2(0.55, 1.5), V2(1.05, 2.1), V2(1.12, 2.75), V2(1.12, 2.8),
      V2(1.0, 2.8), V2(0.94, 2.15), V2(0.5, 1.62), V2(0.0, 1.5),
    ],
    liquid: [V2(0, 1.62), V2(0.5, 1.66), V2(0.86, 2.05), V2(0.98, 2.5), V2(0, 2.5)],
    ice: 3, iceSize: 0.34, camDist: 5.8, lift: -1.2,
  },
  coupe: {
    glass: [
      V2(0, 0), V2(0.8, 0), V2(0.81, 0.06), V2(0.11, 0.12), V2(0.08, 1.2),
      V2(0.7, 1.45), V2(1.25, 1.95), V2(1.3, 2.05),
      V2(1.18, 2.05), V2(0.62, 1.58), V2(0, 1.5),
    ],
    liquid: [V2(0, 1.56), V2(0.6, 1.62), V2(1.1, 1.95), V2(0, 1.96)],
    ice: 0, iceSize: 0, camDist: 5.2, lift: -1.05,
  },
  hurricane: {
    glass: [
      V2(0, 0), V2(0.78, 0), V2(0.8, 0.07), V2(0.35, 0.5), V2(0.55, 1.1),
      V2(0.95, 1.75), V2(0.86, 2.5), V2(0.9, 2.72), V2(0.9, 2.78),
      V2(0.78, 2.78), V2(0.74, 2.5), V2(0.83, 1.78), V2(0.44, 1.15), V2(0.24, 0.55), V2(0, 0.5),
    ],
    liquid: [V2(0, 0.58), V2(0.4, 0.62), V2(0.76, 1.2), V2(0.8, 2.4), V2(0, 2.4)],
    ice: 3, iceSize: 0.32, camDist: 6.0, lift: -1.2,
  },
};

export class BarScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.group = null;
    this.spin = 0;
    this.pointer = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
  }

  init() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.4, 5.2);

    /* Студийное окружение — даёт стеклу отражения без внешних файлов */
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    /* Свет: ключевой сверху-сбоку и контровой сзади — стекло живёт бликами */
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(3.5, 6, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfd8ff, 3.2);
    rim.position.set(-4, 2.5, -3.5);
    this.scene.add(rim);
    const fill = new THREE.PointLight(0xffd9b0, 12, 20);
    fill.position.set(-2.5, -1.5, 3);
    this.scene.add(fill);

    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdfeaf2,
      metalness: 0,
      roughness: 0.05,
      ior: 1.5,
      reflectivity: 0.9,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.iceMat = new THREE.MeshPhysicalMaterial({
      color: 0xf2fbff,
      metalness: 0,
      roughness: 0.16,
      ior: 1.31,
      clearcoat: 1,
      envMapIntensity: 2.0,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    /* Подложка: стекло преломляет то, что за ним. Без неё бокал
       выглядит серым пластиком. */
    this.backdropTex = new THREE.CanvasTexture(this.makeBackdrop('#e0492c'));
    this.backdropTex.colorSpace = THREE.SRGBColorSpace;
    this.backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 4.4),
      new THREE.MeshBasicMaterial({ map: this.backdropTex, transparent: true, opacity: 0.75 })
    );
    this.backdrop.position.set(0, 0.1, -2.2);
    this.backdrop.visible = false;
    this.scene.add(this.backdrop);

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('pointermove', (e) => {
      this.target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    this.enabled = true;
    this.loop();
  }

  makeBackdrop(accent) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 640;
    const x = c.getContext('2d');
    x.fillStyle = '#080b0d';
    x.fillRect(0, 0, c.width, c.height);
    const glow = x.createRadialGradient(512, 300, 20, 512, 300, 470);
    glow.addColorStop(0, accent + '88');
    glow.addColorStop(0.45, accent + '22');
    glow.addColorStop(1, 'rgba(8,11,13,0)');
    x.fillStyle = glow;
    x.fillRect(0, 0, c.width, c.height);
    /* мягкие световые полосы — их и ловит стекло бликами */
    x.globalAlpha = 0.75;
    [[170, 90, 60, 460], [850, 120, 44, 420], [520, 60, 26, 520]].forEach(([px, py, w, h]) => {
      const g2 = x.createLinearGradient(px, py, px + w, py + h);
      g2.addColorStop(0, 'rgba(255,255,255,0.85)');
      g2.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g2;
      x.fillRect(px, py, w, h);
    });
    x.globalAlpha = 1;
    return c;
  }

  setAccent(accent) {
    if (!this.backdrop) return;
    this.backdrop.material.map = new THREE.CanvasTexture(this.makeBackdrop(accent));
    this.backdrop.material.map.colorSpace = THREE.SRGBColorSpace;
    this.backdrop.material.needsUpdate = true;
  }

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ---------- сборка бокала ---------- */
  build(kind, liquidColor, garnish) {
    if (!this.enabled) return;
    if (this.group) {
      this.scene.remove(this.group);
      this.group.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    }
    const p = PROFILES[kind] || PROFILES.rocks;
    const g = new THREE.Group();

    const glass = new THREE.Mesh(new THREE.LatheGeometry(p.glass, 96), this.glassMat);
    glass.renderOrder = 3;
    g.add(glass);

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(liquidColor),
      metalness: 0,
      roughness: 0.26,
      ior: 1.36,
      clearcoat: 0.45,
      clearcoatRoughness: 0.12,
      envMapIntensity: 0.45,
      transparent: false,
    });
    const liquid = new THREE.Mesh(new THREE.LatheGeometry(p.liquid, 96), liquidMat);
    liquid.renderOrder = 1;
    g.add(liquid);

    /* лёд */
    for (let i = 0; i < p.ice; i++) {
      const s = p.iceSize * (0.82 + Math.random() * 0.36);
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(s, s, s, 2, 2, 2).toNonIndexed(), this.iceMat);
      const liqTop = p.liquid[p.liquid.length - 2].y;
      const liqBot = p.liquid[0].y;
      const r = (p.liquid[1].x || 0.5) * 0.42;
      const a = Math.random() * Math.PI * 2;
      cube.position.set(Math.cos(a) * r, liqBot + 0.25 + Math.random() * (liqTop - liqBot - 0.55), Math.sin(a) * r);
      cube.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      cube.renderOrder = 2;
      g.add(cube);
    }

    /* гарнир */
    if (garnish === 'citrus' || garnish === 'lime') {
      const col = garnish === 'lime' ? 0x9ccc3a : 0xff9f1a;
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.05, 40),
        new THREE.MeshPhysicalMaterial({
          color: col, roughness: 0.42, transmission: 0.35, thickness: 0.2,
          ior: 1.4, envMapIntensity: 1.1, transparent: true,
        }));
      const rim = p.glass.reduce((m, v) => Math.max(m, v.y), 0);
      const rimR = p.glass.reduce((m, v) => (v.y > rim - 0.12 ? Math.max(m, v.x) : m), 0);
      wheel.position.set(rimR * 0.92, rim - 0.02, 0.06);
      wheel.rotation.set(Math.PI / 2, 0, 0.3);
      g.add(wheel);
    }
    if (garnish === 'beans') {
      const beanMat = new THREE.MeshPhysicalMaterial({ color: 0x3a2415, roughness: 0.5, clearcoat: 0.8 });
      for (let i = 0; i < 3; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 16), beanMat);
        b.scale.set(1, 0.62, 0.8);
        b.position.set((i - 1) * 0.24, 1.99, 0.05);
        g.add(b);
      }
    }
    if (garnish === 'mint') {
      const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x3f9b46, roughness: 0.45, side: THREE.DoubleSide });
      for (let i = 0; i < 4; i++) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), leafMat);
        leaf.scale.set(1, 0.22, 0.6);
        leaf.position.set((Math.random() - 0.5) * 0.5, 2.5 + Math.random() * 0.25, (Math.random() - 0.5) * 0.5);
        leaf.rotation.set(Math.random(), Math.random() * 3, Math.random());
        g.add(leaf);
      }
    }

    /* Автоподгонка: любой бокал занимает одинаковую долю кадра */
    const box = new THREE.Box3().setFromObject(g);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.fitScale = 1.95 / Math.max(size.y, 0.001);
    g.scale.setScalar(this.fitScale);
    g.position.y = -center.y * this.fitScale;
    this.baseY = g.position.y;
    this.group = g;
    this.camera.position.z = 6.1;
    this.scene.add(g);

    /* появление */
    this.enterFrom = performance.now();
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    if (!this.enabled || !this.renderer) return;

    this.pointer.x += (this.target.x - this.pointer.x) * 0.05;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.05;

    const t = performance.now() * 0.001;
    if (this.group) {
      this.group.rotation.y = this.spin + this.pointer.x * 0.32 + Math.sin(t * 0.25) * 0.08;
      this.group.rotation.x = this.pointer.y * 0.1;
      this.group.position.y = this.baseY + Math.sin(t * 0.7) * 0.045;

      if (this.enterFrom) {
        const k = Math.min((performance.now() - this.enterFrom) / 700, 1);
        const e = 1 - Math.pow(1 - k, 3);
        this.group.scale.setScalar(this.fitScale * (0.88 + e * 0.12));
        if (k >= 1) this.enterFrom = 0;
      }
    }
    this.camera.lookAt(0, -0.32, 0);
    this.renderer.render(this.scene, this.camera);
  }

  setSpin(v) { this.spin = v; }
  setVisible(v) { this.canvas.style.opacity = v ? '1' : '0'; }
}

/* Слабое железо и отсутствие WebGL — повод не мучить телефон */
export function canRun3D() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    if (navigator.deviceMemory && navigator.deviceMemory <= 3) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 3) return false;
    return true;
  } catch (e) {
    return false;
  }
}
