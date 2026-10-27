// Small math helpers shared by every module.
// ---------------------------------------------------------------- helpers
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export function rng(seed){ return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// value noise
const PERM = (() => { const r = rng(7), p = [...Array(256).keys()]; for(let i = 255; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p.concat(p); })();
const hash2 = (x, y) => PERM[(PERM[x & 255] + y) & 255] / 255;
function vnoise(x, y){ const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf);
  return lerp(lerp(hash2(xi, yi), hash2(xi+1, yi), u), lerp(hash2(xi, yi+1), hash2(xi+1, yi+1), u), v); }
export const fbm = (x, y) => vnoise(x, y)*0.55 + vnoise(x*2.1, y*2.1)*0.28 + vnoise(x*4.3, y*4.3)*0.17;

