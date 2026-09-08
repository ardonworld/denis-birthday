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

/* какой меш из набора под какой коктейль и как наливать жидкость */
const GLASSES = {
  rocks:     { mesh: 2, liquid: 'cyl',  fill: 0.5,  inset: 0.86, floor: 0.14 },
  highball:  { mesh: 7, liquid: 'cyl',  fill: 0.78, inset: 0.86, floor: 0.06 },
  wine:      { mesh: 8, liquid: 'bowl', fill: 0.3,  inset: 0.86, floor: 0.52 },
  coupe:     { mesh: 9, liquid: 'cone', fill: 0.28, inset: 0.8,  floor: 0.52 },
  hurricane: { mesh: 3, liquid: 'cyl',  fill: 0.55, inset: 0.8,  floor: 0.3 },
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
    envScene.add(new THREE.Mesh(
      new THREE.SphereGeometry(60, 48, 32),
      new THREE.MeshBasicMaterial({ map: hdr, side: THREE.BackSide })
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
    panel(1.7, 16, -7, 1, 2, 0, Math.PI / 2, '#ffffff', 7);
    panel(1.2, 13, 7, 0.5, 1, 0, -Math.PI / 2, '#dceaff', 5.5);
    panel(12, 3, 0, 8, -2, Math.PI / 2, 0, '#ffffff', 3);
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
      color: 0xf4f8fb,
      metalness: 0,
      roughness: 0.03,
      ior: 1.52,
      transmission: hi ? 1 : 0,
      thickness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.4,
      transparent: true,
      opacity: hi ? 1 : 0.32,
      side: THREE.DoubleSide,
      depthWrite: hi,
    });
    this.ready = true;
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

    src.geometry.computeBoundingBox();
    const bb = src.geometry.boundingBox;
    const size = new THREE.Vector3(); bb.getSize(size);
    const ctr = new THREE.Vector3(); bb.getCenter(ctr);

    const rLiq = (Math.max(size.x, size.z) / 2) * cfg.inset;
    const yBase = bb.min.y + size.y * cfg.floor;
    const hLiq = size.y * cfg.fill;

    let geo;
    if (cfg.liquid === 'cone') {
      geo = new THREE.ConeGeometry(rLiq, hLiq, 64, 1, false);
      geo.rotateX(Math.PI);
      geo.translate(0, yBase + hLiq / 2, 0);
    } else if (cfg.liquid === 'bowl') {
      geo = new THREE.SphereGeometry(rLiq, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      geo.scale(1, hLiq / rLiq, 1);
      geo.translate(0, yBase + hLiq, 0);
    } else {
      geo = new THREE.CylinderGeometry(rLiq, rLiq * 0.94, hLiq, 64, 1);
      geo.translate(0, yBase + hLiq / 2, 0);
    }
    geo.translate(ctr.x, 0, ctr.z);

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
    if (accent) this.refreshEnvironment(accent);
  }

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    if (!this.enabled) return;
    this.pointer.x += (this.target.x - this.pointer.x) * 0.045;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.045;
    const t = performance.now() * 0.001;

    if (this.group) {
      this.group.rotation.y = t * 0.12 + this.pointer.x * 0.35;
      this.group.rotation.x = this.pointer.y * 0.06;
      this.group.position.y = this.baseY + Math.sin(t * 0.7) * 0.04;
      if (this.enterFrom) {
        const k = Math.min((performance.now() - this.enterFrom) / 800, 1);
        const e = 1 - Math.pow(1 - k, 3);
        this.group.scale.setScalar(this.fitScale * (0.9 + e * 0.1));
        if (k >= 1) this.enterFrom = 0;
      }
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
