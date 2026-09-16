/* =========================================================
   Живой дым: WebGL-шейдер поверх фотографий.
   Видео-генерация на тарифе закрыта, да и видео повторяется —
   этот дым никогда не повторяется, тянется за мышью и умеет
   «выдыхать» облаком. Один шейдер держит до четырёх столбов
   сразу — все кальяны дымят одним проходом, а не четырьмя.
   Рисуется в пониженном разрешении: дыму лишние пиксели не нужны.
   ========================================================= */

const MAX = 4;

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uRes;
uniform float uCount;
uniform vec2  uSrc[${MAX}];      // откуда идёт столб, доли канваса (0,0 — низ слева)
uniform vec3  uTint[${MAX}];
uniform float uAmt[${MAX}];
uniform float uSpread[${MAX}];
uniform float uRise[${MAX}];
uniform float uWind;
uniform float uSparks;
uniform vec2  uSparkSrc;
uniform float uSparkW;          // ширина углей, доли канваса

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  float asp = uRes.x / uRes.y;
  float t = uTime;
  vec2 g = vec2(vUv.x * asp, vUv.y);

  /* общая фактура дыма: искажённый шум ползёт вверх */
  vec2 q = vec2(g.x * 3.0, g.y * 2.3 - t * 0.4);
  vec2 warp = vec2(fbm(q + vec2(0.0, t * 0.1)), fbm(q + vec2(5.2, 1.3 - t * 0.08)));
  float d = smoothstep(0.3, 0.92, fbm(q + warp * 1.8));

  float shape = 0.0;
  vec3 tint = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < ${MAX}; i++){
    if (float(i) >= uCount) break;
    vec2 p = vec2((vUv.x - uSrc[i].x) * asp, vUv.y - uSrc[i].y);
    float h = max(p.y, 0.0);
    float fi = float(i);
    float bend = (sin(h * 6.0 - t * 0.9 + fi * 1.7) * 0.5 + sin(h * 11.0 - t * 1.4 + fi) * 0.25) * h * 0.2
               + uWind * h * h * 1.4;
    float w = 0.018 + h * uSpread[i];
    float c = exp(-pow(p.x - bend, 2.0) / (w * w)) * smoothstep(0.0, 0.03, p.y) * exp(-h / max(uRise[i], 0.05));
    c *= uAmt[i];
    shape = max(shape, c);
    tint += uTint[i] * c;
    wsum += c;
  }
  tint = wsum > 0.0001 ? tint / wsum : vec3(1.0);

  float a = clamp(d * shape * 1.4, 0.0, 1.0);
  vec3 col = mix(vec3(0.93, 0.94, 0.96), tint, 0.42) * a;

  /* искры от углей: поднимаются, мерцают, гаснут */
  if (uSparks > 0.01){
    for (int i = 0; i < 26; i++){
      float fi = float(i);
      float sp = 0.16 + hash(vec2(fi, 3.1)) * 0.3;
      float life = fract(t * sp + hash(vec2(fi, 7.7)));
      vec2 sPos = vec2(uSparkSrc.x + (hash(vec2(fi, 1.3)) - 0.5) * uSparkW + sin(t * 1.3 + fi) * 0.012 * life,
                       uSparkSrc.y + life * 0.32);
      vec2 dd = vec2((vUv.x - sPos.x) * asp, vUv.y - sPos.y);
      float gl = 0.0016 / (dot(dd, dd) + 0.00028);
      float flick = 0.55 + 0.45 * sin(t * 18.0 + fi * 3.7);
      float fade = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.5, 1.0, life));
      col += vec3(1.0, 0.52, 0.16) * gl * 0.011 * fade * flick * uSparks;
    }
  }
  float outA = clamp(max(a, max(col.r, max(col.g, col.b))), 0.0, 1.0);
  gl_FragColor = vec4(col, outA);
}`;

const blank = () => ({ src: [0.5, 0.2], tint: [1, 1, 1], amount: 0, spread: 0.3, rise: 0.5 });

export class Smoke {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.scale = opts.scale || 0.5;
    this.state = { sources: [], wind: 0, sparks: 0, sparkSrc: [0.5, 0.3], sparkW: 0.2 };
    this.cur = { sources: Array.from({ length: MAX }, blank), wind: 0, sparks: 0, sparkSrc: [0.5, 0.3], sparkW: 0.2 };
    this.boost = new Array(MAX).fill(0);
    this.running = false;
    this.ok = this.init();
  }

  init() {
    const gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return false;
    const sh = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uTime', 'uRes', 'uCount', 'uSrc', 'uTint', 'uAmt', 'uSpread', 'uRise', 'uWind', 'uSparks', 'uSparkSrc', 'uSparkW']
      .forEach((n) => { this.u[n] = gl.getUniformLocation(prog, n); });
    gl.clearColor(0, 0, 0, 0);
    this.gl = gl;
    this.t0 = performance.now();
    return true;
  }

  set(next) { Object.assign(this.state, next); }

  /* выдох: столб i резко густеет и расходится, потом оседает */
  burst(i = 0) { this.boost[i] = performance.now(); }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(r.width * this.scale));
    const h = Math.max(2, Math.round(r.height * this.scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  start() {
    if (!this.ok || this.running) return;
    this.running = true;
    const tick = () => {
      if (!this.running) return;
      if (this.onFrame) this.onFrame();
      this.frame();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  frame() {
    const gl = this.gl, s = this.state, c = this.cur;
    this.resize();
    const n = Math.min(s.sources.length, MAX);
    const src = new Float32Array(MAX * 2), tint = new Float32Array(MAX * 3);
    const amt = new Float32Array(MAX), spread = new Float32Array(MAX), rise = new Float32Array(MAX);
    const now = performance.now();
    for (let i = 0; i < MAX; i++) {
      const t = s.sources[i] || { ...c.sources[i], amount: 0 };
      const k = c.sources[i];
      /* позиция следует сразу — карточки двигаются, дым не должен отставать */
      k.src[0] += (t.src[0] - k.src[0]) * 0.35;
      k.src[1] += (t.src[1] - k.src[1]) * 0.35;
      for (let j = 0; j < 3; j++) k.tint[j] += ((t.tint || k.tint)[j] - k.tint[j]) * 0.05;
      k.amount += ((t.amount ?? 0) - k.amount) * 0.06;
      k.spread += ((t.spread ?? k.spread) - k.spread) * 0.06;
      k.rise += ((t.rise ?? k.rise) - k.rise) * 0.06;
      let a = k.amount, sp = k.spread;
      if (this.boost[i]) {
        const b = (now - this.boost[i]) / 2600;
        if (b >= 1) this.boost[i] = 0;
        else { const e = Math.sin(b * Math.PI) * (1 - b * 0.4); a += e * 0.7; sp += e * 0.3; }
      }
      src[i * 2] = k.src[0]; src[i * 2 + 1] = k.src[1];
      tint.set(k.tint, i * 3);
      amt[i] = a; spread[i] = sp; rise[i] = k.rise;
    }
    c.wind += (s.wind - c.wind) * 0.06;
    c.sparks += (s.sparks - c.sparks) * 0.06;
    c.sparkSrc[0] += (s.sparkSrc[0] - c.sparkSrc[0]) * 0.35;
    c.sparkSrc[1] += (s.sparkSrc[1] - c.sparkSrc[1]) * 0.35;
    c.sparkW += (s.sparkW - c.sparkW) * 0.2;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.u.uTime, (now - this.t0) / 1000);
    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.u.uCount, Math.max(n, MAX));
    gl.uniform2fv(this.u.uSrc, src);
    gl.uniform3fv(this.u.uTint, tint);
    gl.uniform1fv(this.u.uAmt, amt);
    gl.uniform1fv(this.u.uSpread, spread);
    gl.uniform1fv(this.u.uRise, rise);
    gl.uniform1f(this.u.uWind, c.wind);
    gl.uniform1f(this.u.uSparks, c.sparks);
    gl.uniform2f(this.u.uSparkSrc, c.sparkSrc[0], c.sparkSrc[1]);
    gl.uniform1f(this.u.uSparkW, c.sparkW);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
