/* ============== ТОЧКА ВХОДА БАДИМКИ ============== */

import './style.css';
import { G } from './globals.js';
import { BUILD, RI, TECHS, QUESTS, UNITT, FOET } from './data.js';
import {
  buildTiles, buildSprites, buildPeople, mkTree, mkRock, initChunks
} from './sprites.js';
import {
  boot, newGame, saveSlot, loadSlot, startTutorial
} from './game.js';
import { loadSpritesFromFolder, loadSpritesFromFiles } from './customSprites.js';

/* --- Запекание процедурных спрайтов и тайлов --- */
buildTiles();
G.TREES = [mkTree('oak', 3), mkTree('oak', 7), mkTree('dark', 11), mkTree('pine', 5)];
G.ROCKS = [mkRock(2), mkRock(9), mkRock(17)];
buildPeople();
buildSprites();
initChunks();

/* --- Тихая попытка подгрузить кастомные PNG из ./sprites/ --- */
loadSpritesFromFolder('./sprites/').catch(() => {});

/* --- Глобальный хендлер для UI-импорта спрайтов --- */
window.__loadSprites = loadSpritesFromFiles;

/* --- Открытое API для модов / консольных экспериментов --- */
window.BADIMKA = {
  get state() { return G.state; },
  G, BUILD, RI, TECHS, QUESTS, UNITT, FOET,
  newGame, saveSlot, loadSlot
};

/* для кнопки в Помощь */
window.__startTutorial = startTutorial;

/* --- Старт игры --- */
boot();
