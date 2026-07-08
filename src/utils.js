/* ---------- DOM хелперы ---------- */
export const $ = id => document.getElementById(id);

/* ---------- Математика ---------- */
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const fmt = n => {
  n = Math.floor(n);
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'М';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'к';
  return '' + n;
};
export const pct = v => Math.round(v) + '%';

/* ---------- Random ---------- */
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

/* ---------- Шум для генератора карты ---------- */
export function makeNoise(rng) {
  const P = new Uint8Array(512);
  const p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0;
    const t = p[i]; p[i] = p[j]; p[j] = t;
  }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
  const grad = (h, x, y) => ((h & 1) ? x : -x) + ((h & 2) ? y : -y);
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const L = (t, A, B) => A + t * (B - A);
  return function (x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const a = P[P[X] + Y], b = P[P[X + 1] + Y], c = P[P[X] + Y + 1], d = P[P[X + 1] + Y + 1];
    return L(v, L(u, grad(a, x, y), grad(b, x - 1, y)), L(u, grad(c, x, y - 1), grad(d, x - 1, y - 1))) * 0.74 + 0.5;
  };
}

export function fbm(noise, x, y, oct) {
  let v = 0, amp = 1, fr = 1, tot = 0;
  for (let i = 0; i < oct; i++) {
    v += noise(x * fr, y * fr) * amp;
    tot += amp; amp *= 0.5; fr *= 2;
  }
  return v / tot;
}

/* ---------- Цвет ---------- */
export function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(((n >> 16) & 255) * f, 0, 255);
  const g = clamp(((n >> 8) & 255) * f, 0, 255);
  const b = clamp((n & 255) * f, 0, 255);
  return 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')';
}
