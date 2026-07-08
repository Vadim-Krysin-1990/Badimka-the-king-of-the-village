/* ====================================================================
   КАСТОМНЫЕ СПРАЙТЫ (PNG-ассеты)
   Гибридная система: процедурная графика остаётся как fallback, поверх
   подгружаются PNG из папки ./sprites/ или через UI-импорт. Если файл
   найден — заменяет визуал, сохраняя якорь и физические размеры
   процедурного спрайта (это важно для размещения в тайловой сетке).
   ==================================================================== */

import { G } from './globals.js';
import { paintAll } from './sprites.js';
import { T_WATER, T_RIVER, T_SAND, T_GRASS, T_FERT, T_FOREST, T_HILL, T_MTN, T_SWAMP, HW2, HH2 } from './config.js';
import { toast } from './game.js';

/* Находит непрозрачный bbox в изображении (минимум tolerance альфы). */
function _findOpaqueBbox(img) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  const tc = document.createElement('canvas');
  tc.width = w; tc.height = h;
  const tg = tc.getContext('2d');
  tg.drawImage(img, 0, 0);
  let data;
  try { data = tg.getImageData(0, 0, w, h).data; }
  catch (e) { return { l: 0, t: 0, r: w - 1, b: h - 1, w, h }; }
  let bL = w, bT = h, bR = 0, bB = 0;
  const TOL = 20;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > TOL) {
      if (x < bL) bL = x; if (x > bR) bR = x;
      if (y < bT) bT = y; if (y > bB) bB = y;
    }
  }
  if (bL >= bR || bT >= bB) return { l: 0, t: 0, r: w - 1, b: h - 1, w, h };
  return { l: bL, t: bT, r: bR, b: bB, w: bR - bL, h: bB - bT };
}

/* Подменяет визуал target {cv,ax,ay} изображением img. */
export function applyCustomSprite(target, img) {
  if (!target || !img) return false;
  const bbox = _findOpaqueBbox(img);
  const W = target.cv.width, H = target.cv.height;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  const tw = W * 0.94, th = H * 0.94;
  const scale = Math.min(tw / bbox.w, th / bbox.h);
  const drawW = bbox.w * scale, drawH = bbox.h * scale;
  const ox = (W - drawW) / 2;
  const oy = H - drawH - 4;
  g.drawImage(img, bbox.l, bbox.t, bbox.w, bbox.h, ox, oy, drawW, drawH);
  target.cv = c;
  target.ax = W / 2;
  target.ay = oy + drawH;
  return true;
}

/* ---- Кастомные тайлы земли: tile_grass.png, tile_water.png и т.д. ---- */
const TILE_MAP = {
  grass: T_GRASS, water: T_WATER, river: T_RIVER, sand: T_SAND,
  fert: T_FERT, fertile: T_FERT, forest: T_FOREST, hill: T_HILL,
  mtn: T_MTN, mountain: T_MTN, swamp: T_SWAMP, road: 'road'
};
export function applyCustomTile(tkey, img) {
  const c = document.createElement('canvas');
  c.width = HW2 * 2 + 2; c.height = HH2 * 2 + 2;
  const g = c.getContext('2d');
  g.translate(1, 1);
  g.beginPath();
  g.moveTo(HW2, -1.3); g.lineTo(HW2 * 2 + 1.3, HH2);
  g.lineTo(HW2, HH2 * 2 + 1.3); g.lineTo(-1.3, HH2);
  g.closePath(); g.clip();
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(img, -1, -1, HW2 * 2 + 2, HH2 * 2 + 2);
  if (tkey === 'road') G.TSPR.road = c;
  else G.TSPR[tkey] = [c];
  return true;
}

/* Определяет какой спрайт игры соответствует имени файла. */
function _spriteTargetForName(filename) {
  const base = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '').toLowerCase().replace(/-/g, '_');
  const mt = base.match(/^tile[_]?([a-z]+)/);
  if (mt && TILE_MAP[mt[1]] !== undefined) return { tile: TILE_MAP[mt[1]] };
  const mh = base.match(/^house[_]?(?:lvl)?(\d)/);
  if (mh) {
    const lvl = +mh[1];
    if (lvl >= 1 && lvl <= 7 && G.HSPR[lvl - 1]) return G.HSPR[lvl - 1];
  }
  if (/^tree[_]?oak2/.test(base) || base === 'tree2') return G.TREES[1];
  if (/^tree[_]?oak/.test(base) || base === 'tree1' || base === 'tree_deciduous') return G.TREES[0];
  if (/^tree[_]?dark/.test(base)) return G.TREES[2];
  if (/^tree[_]?pine/.test(base) || /^pine/.test(base) || base === 'tree3') return G.TREES[3];
  if (/^rock/.test(base) || /^boulder/.test(base)) return G.ROCKS[0];
  if (G.BSPR[base]) return G.BSPR[base];
  const ids = Object.keys(G.BSPR).sort((a, b) => b.length - a.length);
  for (const id of ids) {
    if (base === id || base.startsWith(id + '_')) return G.BSPR[id];
  }
  return null;
}

function _loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('img load: ' + src.slice(0, 80)));
    if (/^data:/.test(src) || /^blob:/.test(src)) img.src = src;
    else { img.crossOrigin = 'anonymous'; img.src = src; }
  });
}

/* Тихая попытка загрузить все спрайты из ./sprites/ при буте. */
export async function loadSpritesFromFolder(baseUrl) {
  baseUrl = (baseUrl || './sprites/').replace(/\/$/, '') + '/';
  const candidates = [
    'house_lvl1.png', 'house_lvl2.png', 'house_lvl3.png', 'house_lvl4.png',
    'house_lvl5.png', 'house_lvl6.png', 'house_lvl7.png',
    ...Object.keys(G.BSPR).map(id => id + '.png'),
    'tree_oak.png', 'tree_oak2.png', 'tree_dark.png', 'tree_pine.png', 'rock.png',
    'tile_grass.png', 'tile_water.png', 'tile_river.png', 'tile_sand.png', 'tile_fert.png',
    'tile_forest.png', 'tile_hill.png', 'tile_mtn.png', 'tile_swamp.png', 'tile_road.png'
  ];
  let loaded = 0;
  await Promise.allSettled(candidates.map(async fn => {
    try {
      const img = await _loadImg(baseUrl + fn);
      const t = _spriteTargetForName(fn);
      if (t && t.tile !== undefined) { if (applyCustomTile(t.tile, img)) loaded++; }
      else if (t && applyCustomSprite(t, img)) loaded++;
    } catch (e) { /* нет файла — пропускаем */ }
  }));
  if (loaded > 0) {
    paintAll();
    G.covDirty = true;
    console.log('[sprites] loaded ' + loaded + ' custom assets from ' + baseUrl);
  }
  return loaded;
}

/* Загрузить из выбранных через input файлов */
export async function loadSpritesFromFiles(fileList) {
  const files = Array.from(fileList || []).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f.name));
  if (!files.length) { toast('Выберите PNG-файлы', 'bad'); return 0; }
  let loaded = 0, skipped = [];
  await Promise.all(files.map(file => new Promise(res => {
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const img = await _loadImg(ev.target.result);
        const t = _spriteTargetForName(file.name);
        if (t && t.tile !== undefined) { if (applyCustomTile(t.tile, img)) loaded++; else skipped.push(file.name); }
        else if (t && applyCustomSprite(t, img)) loaded++;
        else skipped.push(file.name);
      } catch (e) { skipped.push(file.name); }
      res();
    };
    reader.onerror = () => { skipped.push(file.name); res(); };
    reader.readAsDataURL(file);
  })));
  if (loaded > 0) { paintAll(); G.covDirty = true; }
  const msg = 'Загружено: ' + loaded + (skipped.length ? ' (не распознано: ' + skipped.length + ')' : '');
  toast(msg, loaded ? 'good' : 'bad');
  if (skipped.length) console.log('[sprites] не распознаны:', skipped);
  return loaded;
}
