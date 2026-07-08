import { MW, T_WATER, T_SAND, T_GRASS, T_FERT, T_FOREST, T_HILL, T_MTN, T_SWAMP, T_RIVER, BUILDABLE } from './config.js';
import { mulberry32, makeNoise, fbm, ri, clamp } from './utils.js';
import { G } from './globals.js';

/* ---------- Координаты ---------- */
export const idx = (x, y) => y * MW + x;
export const inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MW;
export function ter(x, y) { return inb(x, y) ? G.state.map[idx(x, y)] : T_WATER; }

/* ---------- Генерация ---------- */
export function mapGen(seed) {
  const rng = mulberry32(seed);
  const nE = makeNoise(rng), nM = makeNoise(rng), nF = makeNoise(rng);
  const map = new Uint8Array(MW * MW), forest = new Uint8Array(MW * MW);
  for (let y = 0; y < MW; y++) for (let x = 0; x < MW; x++) {
    const ed = Math.min(x, y, MW - 1 - x, MW - 1 - y) / (MW * 0.5);
    const e = fbm(nE, x / 34, y / 34, 3) * 0.85 + clamp(ed * 1.6, 0, 1) * 0.3 - 0.12;
    const m = fbm(nM, x / 22 + 40, y / 22 + 40, 2);
    let t;
    if (e < 0.30) t = T_WATER;
    else if (e < 0.345) t = T_SAND;
    else if (e > 0.80) t = T_MTN;
    else if (e > 0.70) t = T_HILL;
    else {
      t = T_GRASS;
      if (m > 0.62 && fbm(nF, x / 9, y / 9, 2) > 0.5) t = T_FOREST;
      else if (m < 0.24 && e < 0.42) t = T_SWAMP;
    }
    map[idx(x, y)] = t;
    if (t === T_FOREST) forest[idx(x, y)] = 3;
  }
  // реки
  const nRiv = ri(rng, 1, 2);
  for (let r = 0; r < nRiv; r++) {
    let x = ri(rng, 20, MW - 20), y = 0, dx = rng() * 2 - 1;
    while (y < MW) {
      for (let w = -1; w <= 1; w++) {
        const xi = Math.round(x) + w;
        if (inb(xi, y) && map[idx(xi, y)] !== T_WATER) map[idx(xi, y)] = w === 0 ? T_RIVER : (map[idx(xi, y)] === T_MTN ? T_MTN : T_RIVER);
      }
      for (let w = -3; w <= 3; w++) {
        const xi = Math.round(x) + w;
        if (inb(xi, y) && map[idx(xi, y)] === T_GRASS && Math.abs(w) > 1 && rng() < 0.6) map[idx(xi, y)] = T_FERT;
      }
      x += dx + Math.sin(y * 0.15) * 0.8; dx += (rng() - 0.5) * 0.3; dx = clamp(dx, -1.2, 1.2);
      if (map[idx(clamp(Math.round(x), 0, MW - 1), y)] === T_WATER) break;
      y++;
    }
  }
  // плодородные берега озёр
  for (let y = 1; y < MW - 1; y++) for (let x = 1; x < MW - 1; x++) {
    if (map[idx(x, y)] === T_GRASS) {
      let nw = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx2 = -2; dx2 <= 2; dx2++) {
        const t = map[idx(clamp(x + dx2, 0, MW - 1), clamp(y + dy, 0, MW - 1))];
        if (t === T_WATER || t === T_RIVER) nw++;
      }
      if (nw > 2 && rng() < 0.5) map[idx(x, y)] = T_FERT;
    }
  }
  return { map, forest, rng };
}

export function findSpawn(map) {
  let best = null, bs = -1;
  for (let cy = 10; cy < MW - 10; cy += 3) for (let cx = 10; cx < MW - 10; cx += 3) {
    let flat = 0, water = 0, forest = 0, mtn = 0, bad = 0;
    for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) {
      const t = map[idx(clamp(cx + dx, 0, MW - 1), clamp(cy + dy, 0, MW - 1))];
      if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) { if (BUILDABLE(t)) flat++; else bad++; }
    }
    if (flat < 95) continue;
    for (let dy = -14; dy <= 14; dy++) for (let dx = -14; dx <= 14; dx++) {
      if (!inb(cx + dx, cy + dy)) continue;
      const t = map[idx(cx + dx, cy + dy)];
      if (t === T_WATER || t === T_RIVER) water++;
      else if (t === T_FOREST) forest++;
      else if (t === T_MTN || t === T_HILL) mtn++;
    }
    const s = flat + Math.min(water, 30) * 2 + Math.min(forest, 40) + Math.min(mtn, 20) * 2 - bad * 2;
    if (s > bs) { bs = s; best = [cx, cy]; }
  }
  return best || [MW >> 1, MW >> 1];
}
