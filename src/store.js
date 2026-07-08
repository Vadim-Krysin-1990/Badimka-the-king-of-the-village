/* ---------- Хранилище сохранений ---------- */
const MEM = {};

export const store = {
  async set(k, v) {
    try { localStorage.setItem(k, v); return 'local'; } catch (e) {}
    MEM[k] = v; return 'mem';
  },
  async get(k) {
    try { const v = localStorage.getItem(k); if (v != null) return v; } catch (e) {}
    return MEM[k] !== undefined ? MEM[k] : null;
  }
};
