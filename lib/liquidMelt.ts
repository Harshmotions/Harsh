// Liquid melt for the work cards. On hover, a liquid edge spreads out from the cursor and
// dissolves the still, revealing the live preview already playing underneath, so motion
// starts the instant the cursor arrives. The edge is lit in the brand blue and its ripple
// uses the same flowing noise as the hero background. Leaving melts the still back in.
//
// Each card gets its own WebGL canvas only while it is animating: it is created on hover
// and destroyed once the card is back at rest, so a page full of cards never holds more
// than a couple of GPU contexts at once.

const VERT = `attribute vec2 p; varying vec2 uv;
void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `precision mediump float;
varying vec2 uv;
uniform sampler2D A;
uniform float P; uniform float T; uniform vec2 M; uniform vec2 R;
uniform float AA; // the still's aspect ratio, for object-fit: cover
float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int k = 0; k < 5; k++) { v += a * n(p); p *= 2.0; a *= 0.5; } return v; }
vec2 cover(vec2 q, float img){ float box = R.x / R.y;
  if (img > box) q.x = (q.x - 0.5) * box / img + 0.5; else q.y = (q.y - 0.5) * img / box + 0.5; return q; }
void main(){
  vec2 asp = vec2(R.x / R.y, 1.0);
  float d = distance(uv * asp, M * asp);
  float f = fbm(uv * 3.0 + vec2(T * 0.25, -T * 0.18));
  float front = P * 2.2 - d - (f - 0.5) * 0.55;
  float k = smoothstep(0.0, 0.22, front);
  float band = 1.0 - abs(2.0 * k - 1.0);
  vec2 off = vec2(f - 0.5, n(uv * 4.0 + T * 0.3) - 0.5) * 0.14 * band;
  vec4 ca = texture2D(A, cover(uv + off, AA));
  // Premultiplied output: the still fades out behind the front (alpha 1 - k), revealing the
  // live preview under the canvas; the blue glow on the edge is added on top
  float a = 1.0 - k;
  float glow = pow(band, 2.0);
  gl_FragColor = vec4(ca.rgb * a + vec3(0.31, 0.56, 0.97) * glow * 0.55, clamp(a + glow * 0.35, 0.0, 1.0));
}`;

const IN_MS = 800;
const OUT_MS = 650;

// Decoded images, shared by every card and kept across hovers
const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string) {
  let p = images.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    p.catch(() => images.delete(src));
    images.set(src, p);
  }
  return p;
}

/** Starts downloading a card's still, so the first hover can melt straight away. */
export function warmMelt(still: string) {
  loadImage(still).catch(() => {});
}

interface GLState {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  u: Record<string, WebGLUniformLocation | null>;
  ready: boolean;
  failed: boolean;
}

export class LiquidMelt {
  private host: HTMLElement;
  private still: string;
  private glState: GLState | null = null;
  private P = 0;
  private target = 0;
  private raf = 0;
  private last = 0;
  private t0 = performance.now();
  private onDone: ((target: number) => void) | null = null;
  private onCovered: (() => void) | null = null;
  private drawn = false;
  pointer = { x: 0.5, y: 0.5 };

  /** `host` is the element the canvas is laid over; `still` is a same-origin or CORS-enabled image URL. */
  constructor(host: HTMLElement, still: string) {
    this.host = host;
    this.still = still;
  }

  /**
   * Melt towards the clip (1) or back to the still (0). `onCovered` fires once the canvas
   * shows the still over the whole card, the moment the live layer can go in underneath
   * (straight away if WebGL is unavailable); `onDone` fires on arrival.
   */
  to(target: 0 | 1, opts: { onCovered?: () => void; onDone?: (target: number) => void } = {}) {
    this.target = target;
    this.onDone = opts.onDone ?? null;
    this.onCovered = opts.onCovered ?? null;
    if (target === 1 && !this.glState) this.setup();
    if (this.drawn || !this.glState) this.fireCovered();
    if (!this.raf) this.raf = requestAnimationFrame(this.loop);
  }

  private fireCovered() {
    const cb = this.onCovered;
    this.onCovered = null;
    cb?.();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.teardown();
  }

  private setup() {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', opacity: '0' });
    this.host.appendChild(canvas);
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) {
      canvas.remove();
      return;
    }
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u: GLState['u'] = {};
    for (const name of ['A', 'P', 'T', 'M', 'R', 'AA']) u[name] = gl.getUniformLocation(prog, name);
    const state: GLState = { canvas, gl, u, ready: false, failed: false };
    this.glState = state;

    loadImage(this.still)
      .then((a) => {
        if (this.glState !== state) return;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
        gl.uniform1i(u.A, 0);
        gl.uniform1f(u.AA, a.naturalWidth / a.naturalHeight);
        state.ready = true;
      })
      .catch(() => {
        // No melt possible: let the live layer straight in
        state.failed = true;
        this.fireCovered();
      });
  }

  private teardown() {
    const s = this.glState;
    if (!s) return;
    this.glState = null;
    s.gl.getExtension('WEBGL_lose_context')?.loseContext();
    s.canvas.remove();
    this.drawn = false;
  }

  private draw() {
    const s = this.glState;
    if (!s || !s.ready) return;
    const { canvas, gl, u } = s;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(canvas.clientWidth * dpr);
    const H = Math.round(canvas.clientHeight * dpr);
    if (!W || !H) return;
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
      gl.viewport(0, 0, W, H);
    }
    gl.uniform1f(u.P, this.P);
    gl.uniform1f(u.T, (performance.now() - this.t0) / 1000);
    gl.uniform2f(u.M, this.pointer.x, this.pointer.y);
    gl.uniform2f(u.R, W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    canvas.style.opacity = '1';
    if (!this.drawn) {
      this.drawn = true;
      this.fireCovered();
    }
  }

  private loop = (now: number) => {
    const dt = Math.min(48, now - (this.last || now));
    this.last = now;
    // Hold at the start until the still is on the canvas, so the melt always plays in full
    const waiting = this.target > this.P && this.glState && !this.glState.ready && !this.glState.failed;
    if (waiting) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    if (this.target > this.P) this.P = Math.min(this.target, this.P + dt / IN_MS);
    else this.P = Math.max(this.target, this.P - dt / OUT_MS);
    this.draw();

    const settled = !this.glState || this.glState.ready || this.glState.failed || this.target === 0;
    if (this.P === this.target && settled) {
      this.raf = 0;
      this.last = 0;
      const done = this.onDone;
      this.onDone = null;
      // Back at rest on the still: free the GPU context; the still underneath is identical
      if (this.target === 0) this.teardown();
      done?.(this.target);
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
  };
}
