const KEY = 'rmpRatings.v1';
const mem = new Map<string, number | null>();

(function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    for (const [k, v] of Object.entries(JSON.parse(raw) as Record<string, number | null>)) {
      mem.set(k, v);
    }
  } catch {}
})();
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(mem))); } catch {}
}

export const rmpCache = {
  get(name: string) { return mem.get(name) ?? null; },
  set(name: string, rating: number | null) { mem.set(name, rating); persist(); },
  has(name: string) { return mem.has(name); },
};