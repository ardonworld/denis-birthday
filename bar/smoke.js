/* =========================================================
   Живой дым: WebGL-шейдер поверх фотографии.
   Видео-генерация на тарифе закрыта, да и видео повторяется —
   этот дым никогда не повторяется, тянется за мышью и умеет
   «выдыхать» облаком. Рисуется в пониженном разрешении:
   дым мягкий, лишние пиксели ему не нужны.
   ========================================================= */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uRes;
uniform vec2  uSrc;      // откуда идёт дым, доли кадра (0,0 — низ слева)
uniform vec3  uTint;
uniform float uAmount;   // плотность 0..1
uniform float uSpread;   // как широко расходится столб
uniform float uRise;     // как высоко поднимается
uniform float uWind;     // снос по горизонтали (мышь)
uniform float uSparks;   // искры от углей 0..1
uniform float uFill;     // 0 — столб из точки, 1 — туман на весь кадр

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
  vec2 p = vec2((vUv.x - uSrc.x) * asp, vUv.y - uSrc.y);
  float t = uTime;

  /* столб: чем выше, тем шире и тем сильнее его изгибает */
  float h = max(p.y, 0.0);
  float bend = (fbm(vec2(h * 2.2 - t * 0.18, t * 0.07)) - 0.5) * h * 0.9 + uWind * h * h * 1.6;
  float width = 0.02 + h * uSpread;
  float column = exp(-pow(p.x - bend, 2.0) / (width * width)) * smoothstep(0.0, 0.035, p.y);
  column *= exp(-h / max(uRise, 0.05));

  /* туман на весь кадр для переходных сцен */
  float fog = smoothstep(1.15, -0.1, vUv.y) * uFill;
  float shape = max(column, fog);

  /* сама фактура дыма: искажённый шум, который ползёт вверх */
  vec2 q = vec2(p.x * 3.2, p.y * 2.4 - t * 0.42);
  vec2 warp = vec2(fbm(q + vec2(0.0, t * 0.1)), fbm(q + vec2(5.2, 1.3 - t * 0.08)));
  float d = fbm(q + warp * 1.8);
  d = smoothstep(0.32, 0.92, d);

  float a = clamp(d * shape * uAmount * 1.35, 0.0, 1.0);
  vec3 col = mix(vec3(0.92, 0.93, 0.95), uTint, 0.38) * a;

  /* искры: поднимаются от углей, мерцают и гаснут */
  if (uSparks > 0.01){
    for (int i = 0; i < 26; i++){
      float fi = float(i);
      float sp = 0.18 + hash(vec2(fi, 3.1)) * 0.3;
      float life = fract(t * sp + hash(vec2(fi, 7.7)));
      vec2 sPos = vec2(uSrc.x + (hash(vec2(fi, 1.3)) - 0.5) * 0.42
                       + sin(t * 1.3 + fi) * 0.02 * life,
                       uSrc.y + life * 0.55);
      vec2 dd = vec2((vUv.x - sPos.x) * asp, vUv.y - sPos.y);
      float g = 0.0022 / (dot(dd, dd) + 0.00035);
      float flick = 0.55 + 0.45 * sin(t * 18.0 + fi * 3.7);
      float fade = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.55, 1.0, life));
      col += vec3(1.0, 0.52, 0.16) * g * 0.012 * fade * flick * uSparks;
    }
  }
  float outA = clamp(max(a, max(col.r, max(col.g, col.b))), 0.0, 1.0);
  gl_FragColor = vec4(col, outA);
}`;

export class Smoke {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.scale = opts.scale || 0.5;              // разрешение от размера на экране
    this.state = {
      src: [0.5, 0.2], tint: [1, 1, 1], amount: 0.8, spread: 0.32,
      rise: 0.55, wind: 0, sparks: 0, fill: 0, ...opts,
    };
    this.cur = JSON.parse(JSON.stringify(this.state));
    this.burstAt = 0;
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
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uTime', 'uRes', 'uSrc', 'uTint', 'uAmount', 'uSpread', 'uRise', 'uWind', 'uSparks', 'uFill']
      .forEach((n) => { this.u[n] = gl.getUniformLocation(prog, n); });
    gl.clearColor(0, 0, 0, 0);
    this.gl = gl;
    this.t0 = performance.now();
    return true;
  }

  set(next) { Object.assign(this.state, next); }

  /* выдох: облако резко густеет и расходится шире, потом оседает */
  burst() { this.burstAt = performance.now(); }

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
      this.frame();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  frame() {
    const gl = this.gl, s = this.state, c = this.cur;
    this.resize();
    /* всё меняется плавно: смена вкуса перетекает, а не щёлкает */
    const k = 0.06;
    ['amount', 'spread', 'rise', 'wind', 'sparks', 'fill'].forEach((n) => { c[n] += (s[n] - c[n]) * k; });
    for (let i = 0; i < 2; i++) c.src[i] += (s.src[i] - c.src[i]) * 0.09;
    for (let i = 0; i < 3; i++) c.tint[i] += (s.tint[i] - c.tint[i]) * 0.05;

    let amount = c.amount, spread = c.spread;
    if (this.burstAt) {
      const b = (performance.now() - this.burstAt) / 2600;
      if (b >= 1) this.burstAt = 0;
      else { const e = Math.sin(Math.min(b, 1) * Math.PI) * (1 - b * 0.4); amount += e * 0.7; spread += e * 0.35; }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.u.uTime, (performance.now() - this.t0) / 1000);
    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.u.uSrc, c.src[0], c.src[1]);
    gl.uniform3f(this.u.uTint, c.tint[0], c.tint[1], c.tint[2]);
    gl.uniform1f(this.u.uAmount, amount);
    gl.uniform1f(this.u.uSpread, spread);
    gl.uniform1f(this.u.uRise, c.rise);
    gl.uniform1f(this.u.uWind, c.wind);
    gl.uniform1f(this.u.uSparks, c.sparks);
    gl.uniform1f(this.u.uFill, c.fill);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

export const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
