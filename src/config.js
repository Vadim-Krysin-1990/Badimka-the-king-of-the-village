/* ---------- Константы мира ---------- */
export const MW = 128;            // размер карты в тайлах
export const PT = 16;             // пикселей на тайл в пререндере
export const DAY = 5;             // секунд реального времени на 1 игровой день (x1)
export const SPEEDS = [1, 2, 4, 8];
export const SEASONS = ['Весна', 'Лето', 'Осень', 'Зима'];
export const SEASON_FARM = [0.85, 1.3, 1.05, 0.2];

/* Типы тайлов */
export const T_WATER = 0, T_RIVER = 1, T_SAND = 2, T_GRASS = 3, T_FERT = 4,
             T_FOREST = 5, T_HILL = 6, T_MTN = 7, T_SWAMP = 8;
export const TERNAME = ['Море', 'Река', 'Песок', 'Луга', 'Плодородная земля', 'Лес', 'Холмы', 'Горы', 'Болото'];
export const TC = ['#27537a', '#3a6f9a', '#cbb27a', '#5d8a3c', '#7aa843', '#37602b', '#827e60', '#6e6e74', '#4e6b4a'];
export const BUILDABLE = t => t === T_SAND || t === T_GRASS || t === T_FERT;
export const PASSABLE = t => (t >= T_SAND && t <= T_HILL) || t === T_SWAMP || t === T_RIVER;

/* ---------- Рендер ---------- */
export const HW = 128, HH = 64;     // полуширина/полувысота тайла при z=1
export const HW2 = 64, HH2 = 32;    // половинный масштаб для запекания земли

/* Чанки */
export const CS = 32;                            // тайлов в чанке по стороне
export const NCH = MW / CS;
export const CMX = 2 * HW2;
export const CMT = 4 * HH2;
export const CMB = 2 * HH2;
export const CHW = 2 * CS * HW2 + 2 * CMX;
export const CHH = 2 * CS * HH2 + CMT + CMB;
export const ANCX = CS * HW2 + CMX;
export const ANCY = CMT;

/* Сохранение */
export const SKEY = 'bvk-save-';

/* Палитра зданий */
export const PALB = {
  plaster: '#e9dcbe',
  timber: '#54402a',
  thatch: '#c8a44e',
  tile: '#b15233',
  slate: '#5d7486',
  stone: '#9b9485',
  stoneD: '#6e6960',
  wood: '#9a7a4a',
  woodD: '#6b4f2a',
  gold: '#d4a040'
};
