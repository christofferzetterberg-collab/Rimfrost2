// Path finding: a walk grid (1 cell = 1 unit) and A* search, so monsters and click-to-move go around houses, rocks, trees and water.
import {B, WATER, height, colliders} from "./world.js";
import {dgNavGrids} from "./dungeon.js";

const PAD = 0.7, NAV_SLOPE = 1.0;                                     // PAD: body radius used when marking blocked cells
let GRIDS = null;                                    // the open world, and the crypt: {x0, z0, w, h, grid (1 = blocked), hgt}
export function buildNav(){
  const w = B.x1 - B.x0, h = B.z1 - B.z0, grid = new Uint8Array(w * h), hgt = new Float32Array(w * h);
  for(let j = 0; j < h; j++) for(let i = 0; i < w; i++){ const x = B.x0 + i + 0.5, z = B.z0 + j + 0.5, y = height(x, z); hgt[j*w + i] = y;
    if(i < 5 || j < 5 || i >= w - 5 || j >= h - 5 || y < WATER + 0.1) grid[j*w + i] = 1; }
  // slopes too steep to walk up (a little stricter than the movement rule, so paths never lead up a slope you can't climb)
  for(let j = 1; j < h - 1; j++) for(let i = 1; i < w - 1; i++){ const k = j*w + i, y = hgt[k];
    if(Math.max(Math.abs(hgt[k + 1] - y), Math.abs(hgt[k - 1] - y), Math.abs(hgt[k + w] - y), Math.abs(hgt[k - w] - y)) > NAV_SLOPE) grid[k] = 1; }
  for(const c of colliders){ const r = c.r + PAD, i0 = Math.floor(c.x - r - B.x0), i1 = Math.floor(c.x + r - B.x0), j0 = Math.floor(c.z - r - B.z0), j1 = Math.floor(c.z + r - B.z0);
    for(let j = Math.max(0, j0); j <= Math.min(h - 1, j1); j++) for(let i = Math.max(0, i0); i <= Math.min(w - 1, i1); i++){
      const x = B.x0 + i + 0.5, z = B.z0 + j + 0.5; if((x - c.x) ** 2 + (z - c.z) ** 2 < r * r) grid[j*w + i] = 1; } }
  GRIDS = [{x0: B.x0, z0: B.z0, w, h, grid, hgt}, ...dgNavGrids()];
}
// which places can be walked to from the given start (flood fill over the world grid); used so nothing appears inside a ring of cliffs
let REACH = null;
export function reachable(x, z){ if(!GRIDS) buildNav(); if(x > 500) return true; const g = GRIDS[0];
  if(!REACH){ REACH = new Uint8Array(g.w * g.h); const st = []; for(const [sx, sz] of REACH_FROM){ const k = Math.floor(sz - g.z0) * g.w + Math.floor(sx - g.x0); if(!g.grid[k] && !REACH[k]){ REACH[k] = 1; st.push(k); } }
    while(st.length){ const k = st.pop(), i = k % g.w, j = (k / g.w) | 0;
      for(const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const ni = i + di, nj = j + dj; if(ni < 0 || nj < 0 || ni >= g.w || nj >= g.h) continue; const m = nj * g.w + ni;
        if(!REACH[m] && !g.grid[m] && Math.abs(g.hgt[k] - g.hgt[m]) <= NAV_SLOPE){ REACH[m] = 1; st.push(m); } } } }
  const i = Math.floor(x - g.x0), j = Math.floor(z - g.z0); return i >= 0 && j >= 0 && i < g.w && j < g.h && !!REACH[j * g.w + i]; }
let REACH_FROM = [[0, 0]]; export const setReachFrom = list => { REACH_FROM = list; REACH = null; };
const gridAt = x => x > 500 ? GRIDS.find((g, i) => i > 0 && x >= g.x0 - 50 && x < g.x0 + 900) : GRIDS[0];
let G = null, N = 0;                                 // the grid used by the current search (N = its width)
const cell = (x, z) => [Math.floor(x - G.x0), Math.floor(z - G.z0)];
const free = (i, j) => i >= 0 && j >= 0 && i < G.w && j < G.h && !G.grid[j*N + i];
const steep = (a, b) => Math.abs(G.hgt[a] - G.hgt[b]) > NAV_SLOPE * (Math.abs(a - b) === 1 || Math.abs(a - b) === N ? 1 : 1.41);   // too steep between two cells

// nearest walkable cell to (i, j)
function nearestFree(i, j){ if(free(i, j)) return [i, j];
  for(let r = 1; r < 6; r++) for(let dj = -r; dj <= r; dj++) for(let di = -r; di <= r; di++){ if(Math.max(Math.abs(di), Math.abs(dj)) !== r) continue; if(free(i + di, j + dj)) return [i + di, j + dj]; }
  return null; }

// A*: returns a list of {x, z} waypoints (cell centres), or null when there is no way through
const DIRS = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
export function findPath(sx, sz, gx, gz, maxNodes = 9000){
  if(!GRIDS) buildNav();
  if(gridAt(sx) !== gridAt(gx)) return null;           // no walking between the world and a dungeon
  G = gridAt(sx); N = G.w;
  const s = nearestFree(...cell(sx, sz)), g = nearestFree(...cell(gx, gz)); if(!s || !g) return null;
  const start = s[1]*N + s[0], goal = g[1]*N + g[0]; if(start === goal) return [{x: gx, z: gz}];
  const gs = new Map([[start, 0]]), prev = new Map(), closed = new Set();
  const heap = [[0, start]];
  const push = (f, n) => { heap.push([f, n]); let k = heap.length - 1; while(k > 0){ const p = (k - 1) >> 1; if(heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if(heap.length){ heap[0] = last; let k = 0; for(;;){ const l = 2*k + 1, r = l + 1; let m = k;
    if(l < heap.length && heap[l][0] < heap[m][0]) m = l; if(r < heap.length && heap[r][0] < heap[m][0]) m = r; if(m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  const hx = n => { const dx = Math.abs(n % N - g[0]), dz = Math.abs(((n / N) | 0) - g[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
  let found = false, count = 0;
  while(heap.length){ const [, n] = pop(); if(closed.has(n)) continue; if(n === goal){ found = true; break; } closed.add(n); if(++count > maxNodes) break;
    const i = n % N, j = (n / N) | 0, gn = gs.get(n);
    for(const [di, dj, c] of DIRS){ const ni = i + di, nj = j + dj; if(!free(ni, nj)) continue;
      if(di && dj && (!free(i + di, j) || !free(i, j + dj))) continue;               // no cutting corners
      const m = nj*N + ni; if(closed.has(m) || steep(n, m)) continue; const ng = gn + c;
      if(ng < (gs.get(m) ?? 1e9)){ gs.set(m, ng); prev.set(m, n); push(ng + hx(m), m); } } }
  if(!found) return null;
  const out = []; for(let n = goal; n !== start; n = prev.get(n)) out.push({x: n % N + G.x0 + 0.5, z: ((n / N) | 0) + G.z0 + 0.5});
  out.reverse(); out[out.length - 1] = {x: gx, z: gz}; return out;
}

// is the straight line from a to b walkable for a body of radius r?
export function clearLine(blocked, ax, az, bx, bz, r){
  const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.3); let px = ax, pz = az;
  for(let i = 1; i <= n; i++){ const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; if(blocked(x, z, px, pz, r)) return false; px = x; pz = z; }
  return true; }

// move an entity towards (gx, gz): straight when the way is clear, otherwise along an A* path that is refreshed every 0.6 sec.
// Returns the direction {dx, dz} to move this frame (unit vector), or null when already there / no way.
export function steer(e, gx, gz, dt, blocked){
  const r = e.r + 0.08;                               // a little wider than the body, so a "clear" line is really walkable
  if(clearLine(blocked, e.x, e.z, gx, gz, r)){ e.path = null; const d = Math.hypot(gx - e.x, gz - e.z); return d < 0.05 ? null : {dx: (gx - e.x) / d, dz: (gz - e.z) / d}; }
  e.pathT = (e.pathT || 0) - dt;
  const goalMoved = e.pathGoal && Math.hypot(e.pathGoal.x - gx, e.pathGoal.z - gz) > 1.5;
  if(!e.path || e.pathT <= 0 || goalMoved){ e.path = findPath(e.x, e.z, gx, gz); e.pathT = 0.6; e.pathGoal = {x: gx, z: gz}; }
  if(!e.path || !e.path.length){ const d = Math.hypot(gx - e.x, gz - e.z) || 1; return {dx: (gx - e.x) / d, dz: (gz - e.z) / d}; }
  while(e.path.length > 1 && clearLine(blocked, e.x, e.z, e.path[1].x, e.path[1].z, r)) e.path.shift();      // skip corners we can already see past
  const w = e.path[0], d = Math.hypot(w.x - e.x, w.z - e.z);
  if(d < 0.35){ e.path.shift(); if(!e.path.length) return null; return steer(e, gx, gz, 0, blocked); }
  return {dx: (w.x - e.x) / d, dz: (w.z - e.z) / d};
}
