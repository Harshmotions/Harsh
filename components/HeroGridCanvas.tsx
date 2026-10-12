'use client';

import { useEffect, useRef } from 'react';

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.1 + vec2(1.7, 9.2);
    a *= 0.52;
  }
  return v;
}

void main() {
  float G = 10.0; // cell size in px — large enough to see clearly

  vec2 fc = gl_FragCoord.xy;

  // Crisp seam lines: 12% border on every side of every cell
  vec2 cl = fract(fc / G);
  float seam = 0.12;
  float cellMask = step(seam, cl.x) * step(seam, cl.y) *
                   step(cl.x, 1.0 - seam) * step(cl.y, 1.0 - seam);

  // Sample FBM at the cell center (whole cell = one uniform color)
  vec2 cellCenter = (floor(fc / G) + 0.5) / u_res;
  float ar = u_res.x / u_res.y;
  float t  = u_time * 0.18;

  vec2 p = cellCenter * vec2(ar, 1.0) * 3.8;

  // Two FBM layers moving in opposing directions
  float w1 = fbm(p + vec2(t * 0.80, t * 0.30));
  float w2 = fbm(p * 1.5 - vec2(t * 0.50, t * 0.85) + vec2(4.1, 1.7));

  // Harmonic current on top
  float current = 0.12 * sin(cellCenter.x * 11.0 + t * 1.4)
                       * cos(cellCenter.y * 8.5 - t * 1.0);

  float wave = clamp(w1 * 0.55 + w2 * 0.45 + current, 0.0, 1.0);

  wave = smoothstep(0.18, 0.88, wave);

  // Floor = site bg, ceiling = visible steel blue — wide enough to show movement
  // Seams slightly below floor so cell borders read as fine lines, not black holes
  vec3 seamsColor = vec3(0.018, 0.032, 0.058);
  vec3 c0 = vec3(0.028, 0.052, 0.095);  // #071118 — just above site bg, no black
  vec3 c1 = vec3(0.048, 0.098, 0.192);  // #0C1931 — dark navy
  vec3 c2 = vec3(0.082, 0.170, 0.345);  // #152B58 — medium dark blue
  vec3 c3 = vec3(0.118, 0.245, 0.470);  // #1E3E78 — steel blue, max brightness

  vec3 col = mix(c0, c1, smoothstep(0.00, 0.33, wave));
  col      = mix(col, c2, smoothstep(0.28, 0.66, wave));
  col      = mix(col, c3, smoothstep(0.60, 1.00, wave));

  // Faint shimmer only at wave peaks — adds life without brightness spike
  float sh = fbm(cellCenter * 7.0 + vec2(t * 2.4, -t * 1.7));
  col += 0.06 * vec3(0.40, 0.62, 1.00)
       * smoothstep(0.80, 1.00, sh)
       * smoothstep(0.82, 1.00, wave);

  // Micro per-cell brightness variance so adjacent cells aren't identical
  col *= 0.92 + 0.08 * hash(floor(fc / G));

  // Apply the seam mask — gap lines go near-black
  col = mix(seamsColor, col, cellMask);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroGridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup = () => {};
    // Compile the shader after the page has painted and hydrated, so it doesn't
    // compete with the first render (the canvas stays transparent until then).
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = idle(() => {
      cleanup = start(canvas);
    });

    return () => {
      cancelIdle(idleId);
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

function start(canvas: HTMLCanvasElement): () => void {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return () => {};

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_res');

    let raf: number;

    const resize = () => {
      // Use CSS pixels — keeps cell size consistent across DPRs
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      gl.uniform1f(uTime, (now - t0) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const t0 = performance.now();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(t0 + 8000); // one still frame, no animation loop
      return () => {
        ro.disconnect();
        gl.deleteProgram(prog);
      };
    }

    // The waves move slowly, so 30fps looks the same on phones while halving GPU work.
    const minFrameMs = window.matchMedia('(pointer: coarse)').matches ? 1000 / 30 : 0;
    let last = 0;
    let onScreen = true;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < minFrameMs) return;
      last = now;
      draw(now);
    };
    // Only animate while the hero is visible and the tab is in front
    const sync = () => {
      cancelAnimationFrame(raf);
      if (onScreen && document.visibilityState === 'visible') raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      ro.disconnect();
      gl.deleteProgram(prog);
    };
}
