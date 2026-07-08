/* ============== ЗВУКОВАЯ СИСТЕМА ==============
   SFX — генерируются на лету через Web Audio API (без файлов).
   Music — фоновый mp3-трек из public/audio/. Можно несколько треков
   с авто-чередованием. Громкость регулируется отдельно для музыки
   и SFX, сохраняется в localStorage. */

let ctx = null;        // AudioContext (создаётся лениво после первого user-action)
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let musicNode = null;
let musicBuffers = [];
let musicIdx = 0;
let muted = false;

/* Громкость 0..1 — сохраняется в localStorage */
const VOL_KEY = 'bvk-vol';
let volMusic = 0.35;
let volSfx = 0.55;

/* загрузить сохранённую громкость */
try {
  const saved = JSON.parse(localStorage.getItem(VOL_KEY) || 'null');
  if (saved) {
    if (typeof saved.m === 'number') volMusic = saved.m;
    if (typeof saved.s === 'number') volSfx = saved.s;
    if (typeof saved.muted === 'boolean') muted = saved.muted;
  }
} catch (e) {}

function saveVol() {
  try { localStorage.setItem(VOL_KEY, JSON.stringify({ m: volMusic, s: volSfx, muted })); } catch (e) {}
}

/* Ленивая инициализация AudioContext — браузеры требуют user-gesture
   перед запуском звука. Вызывается на первый клик/тач. */
function ensureCtx() {
  if (ctx) return ctx;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = volMusic;
    musicGain.connect(masterGain);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = volSfx;
    sfxGain.connect(masterGain);
  } catch (e) { console.warn('AudioContext init failed', e); return null; }
  return ctx;
}

/* ====== SFX-СИНТЕЗАТОР ======
   Каждый звук — короткая комбинация осцилляторов с огибающей.
   Это компактные приятные UI-звуки без mp3-файлов. */

function osc(type, freq, dur, gain, when) {
  if (!ctx) return;
  const t0 = when || ctx.currentTime;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g).connect(sfxGain);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur, gain, hp, lp, when) {
  if (!ctx) return;
  const t0 = when || ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  let node = src;
  if (hp) {
    const f = ctx.createBiquadFilter();
    f.type = 'highpass'; f.frequency.value = hp;
    src.connect(f); node = f;
  }
  if (lp) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = lp;
    node.connect(f); node = f;
  }
  node.connect(g).connect(sfxGain);
  src.start(t0);
}

/* Каталог звуков */
const SFX = {
  click: () => { osc('triangle', 1200, 0.04, 0.18); osc('triangle', 900, 0.05, 0.10, ctx.currentTime + 0.005); },
  build: () => { osc('square', 240, 0.08, 0.22); osc('square', 180, 0.12, 0.15, ctx.currentTime + 0.05); noise(0.12, 0.15, 200, 2000); },
  demolish: () => { noise(0.35, 0.30, 100, 1500); osc('sawtooth', 90, 0.20, 0.15); },
  evolve: () => {
    const t0 = ctx.currentTime;
    osc('triangle', 523, 0.18, 0.22, t0);          // C5
    osc('triangle', 659, 0.18, 0.22, t0 + 0.08);   // E5
    osc('triangle', 784, 0.30, 0.25, t0 + 0.16);   // G5
  },
  coin: () => {
    const t0 = ctx.currentTime;
    osc('sine', 1320, 0.10, 0.25, t0);
    osc('sine', 1760, 0.08, 0.20, t0 + 0.04);
  },
  alert: () => {
    const t0 = ctx.currentTime;
    osc('sawtooth', 220, 0.12, 0.25, t0);
    osc('sawtooth', 180, 0.18, 0.25, t0 + 0.10);
    osc('sawtooth', 220, 0.12, 0.25, t0 + 0.22);
  },
  fire: () => { noise(0.6, 0.28, 80, 800); },
  raid: () => {
    const t0 = ctx.currentTime;
    osc('sawtooth', 110, 0.30, 0.28, t0);
    osc('sawtooth', 165, 0.30, 0.22, t0);
    osc('sawtooth', 130, 0.35, 0.25, t0 + 0.25);
  },
  victory: () => {
    const t0 = ctx.currentTime;
    /* мажорное трезвучие, восходящее, потом октава */
    osc('triangle', 523, 0.20, 0.25, t0);
    osc('triangle', 659, 0.20, 0.25, t0 + 0.12);
    osc('triangle', 784, 0.20, 0.25, t0 + 0.24);
    osc('triangle', 1046, 0.55, 0.28, t0 + 0.40);
    osc('triangle', 1568, 0.55, 0.20, t0 + 0.40);
  },
  milestone: () => {
    /* фанфары для промежуточных вех — короче чем victory */
    const t0 = ctx.currentTime;
    osc('triangle', 659, 0.15, 0.25, t0);
    osc('triangle', 784, 0.15, 0.25, t0 + 0.08);
    osc('triangle', 988, 0.30, 0.28, t0 + 0.16);
    osc('triangle', 1318, 0.30, 0.22, t0 + 0.16);
  },
  toast: () => { osc('sine', 880, 0.08, 0.16); osc('sine', 1320, 0.08, 0.12, ctx.currentTime + 0.05); },
  rejected: () => { osc('square', 180, 0.10, 0.20); osc('square', 130, 0.12, 0.18, ctx.currentTime + 0.06); },
  festival: () => {
    const notes = [523, 659, 784, 988, 784, 659, 523, 659];
    const t0 = ctx.currentTime;
    notes.forEach((f, i) => osc('triangle', f, 0.13, 0.20, t0 + i * 0.10));
  }
};

/* Публичная функция — играть SFX по имени */
export function sfx(name) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume().catch(() => {});
  const fn = SFX[name];
  if (fn) try { fn(); } catch (e) {}
}

/* ====== ФОНОВАЯ МУЗЫКА ======
   Грузим один или несколько mp3-файлов из public/audio/.
   Игра без музыки прекрасно работает — это опциональное украшение. */

const MUSIC_FILES = ['./audio/music.mp3', './audio/music2.mp3', './audio/music3.mp3'];

async function loadOneTrack(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const ab = await r.arrayBuffer();
    return await ctx.decodeAudioData(ab);
  } catch (e) { return null; }
}

async function loadMusic() {
  if (!ctx || musicBuffers.length) return;
  for (const url of MUSIC_FILES) {
    const buf = await loadOneTrack(url);
    if (buf) musicBuffers.push(buf);
  }
  if (musicBuffers.length) console.log('[audio] loaded music tracks:', musicBuffers.length);
}

function playNextTrack() {
  if (!ctx || !musicBuffers.length) return;
  if (musicNode) try { musicNode.stop(); } catch (e) {}
  const node = ctx.createBufferSource();
  node.buffer = musicBuffers[musicIdx % musicBuffers.length];
  node.connect(musicGain);
  node.onended = () => { musicIdx++; setTimeout(playNextTrack, 800); };
  node.start();
  musicNode = node;
}

export async function startMusic() {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') await c.resume().catch(() => {});
  if (!musicBuffers.length) await loadMusic();
  if (!musicNode && musicBuffers.length) playNextTrack();
}

export function stopMusic() {
  if (musicNode) { try { musicNode.stop(); } catch (e) {} musicNode = null; }
}

/* ====== УПРАВЛЕНИЕ ГРОМКОСТЬЮ ====== */

export function setMusicVol(v) {
  volMusic = Math.max(0, Math.min(1, v));
  if (musicGain) musicGain.gain.value = volMusic;
  saveVol();
}
export function setSfxVol(v) {
  volSfx = Math.max(0, Math.min(1, v));
  if (sfxGain) sfxGain.gain.value = volSfx;
  saveVol();
}
export function toggleMute() {
  muted = !muted;
  if (masterGain) masterGain.gain.value = muted ? 0 : 1;
  if (muted) stopMusic();
  else startMusic().catch(() => {});
  saveVol();
  return muted;
}
export function getVolumes() { return { music: volMusic, sfx: volSfx, muted }; }
