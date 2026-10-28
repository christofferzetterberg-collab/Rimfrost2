// Dungeons: each is its own small map far away from the open world (x > 500), built from square tiles (floor or wall).
// You get in through a door in the world and out through a glowing doorway inside.
// Rimfrost 1's dungeons: the Iron Mine (x from 1000, Iron Ridge), the Drowned Temple (2000, Mistmarsh), the Ember Forge (3000, Ashfields),
// the Frost Vault (4000, Frostcrown) and the Draug King's crypt (5000, Mistmarsh).
import * as THREE from "three";
import {DG_DOORS} from "./worlddata.js";

export const inDungeon = x => x > 500;
export const regionOf = x => x > 500 ? Math.floor(x / 1000) : 0;          // 0 = the open world, 1–5 = a dungeon
function makeDungeon(def){
  const d = Object.assign({T: 2.5, floorY: 2}, def), grid = new Uint8Array(d.W * d.H).fill(1);     // 1 = wall
  for(const [i0, j0, i1, j1] of d.carve) for(let j = j0; j <= j1; j++) for(let i = i0; i <= i1; i++) grid[j * d.W + i] = 0;
  d.tileAt = (x, z) => [Math.floor((x - d.x0) / d.T), Math.floor((z - d.z0) / d.T)];
  d.wallTile = (i, j) => i < 0 || j < 0 || i >= d.W || j >= d.H || grid[j * d.W + i] === 1;
  d.tileCenter = (i, j) => ({x: d.x0 + (i + 0.5) * d.T, z: d.z0 + (j + 0.5) * d.T});
  d.blocked = (x, z, r) => { const [ci, cj] = d.tileAt(x, z);
    for(let j = cj - 1; j <= cj + 1; j++) for(let i = ci - 1; i <= ci + 1; i++){ if(!d.wallTile(i, j)) continue;
      const x0 = d.x0 + i * d.T, z0 = d.z0 + j * d.T, nx = Math.max(x0, Math.min(x, x0 + d.T)), nz = Math.max(z0, Math.min(z, z0 + d.T));
      if((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true; }
    return false; };
  d.los = (ax, az, bx, bz) => { const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
    for(let k = 1; k < n; k++){ const t = k / n; if(d.wallTile(...d.tileAt(ax + (bx - ax) * t, az + (bz - az) * t))) return false; } return true; };
  d.navGrid = () => { const w = Math.ceil(d.W * d.T), h = Math.ceil(d.H * d.T), g = new Uint8Array(w * h);
    for(let j = 0; j < h; j++) for(let i = 0; i < w; i++) g[j * w + i] = d.blocked(d.x0 + i + 0.5, d.z0 + j + 0.5, 0.6) ? 1 : 0;
    return {x0: d.x0, z0: d.z0, w, h, grid: g, hgt: new Float32Array(w * h).fill(d.floorY)}; };
  return d;
}

// mobs: [kind, tile x, tile y]. Pack monsters come in three kinds (p0–p2), m0 / m1 are the two elites, b the boss.
const put = (list, pack, mini, boss) => list.map(([k, i, j]) => [k === "b" ? boss : k[0] === "m" ? mini[+k[1]] : pack[+k[1]], i, j]);
const P15 = (a) => a.map((p, n) => ["p" + (n % 3), ...p]);
export const DUNGEONS = [
  makeDungeon({id: "d_mine", name: "The Iron Mine", sub: "Kobolds, spiders and the creatures of the deep", x0: 1000, z0: 0, W: 30, H: 42, lv: [12, 16],
    door: DG_DOORS.d_mine, floor: [0.08, 0.12, 0.32], wall: [0.07, 0.1, 0.38], fire: 0xffb060,
    carve: [[12, 1, 18, 4], [14, 5, 16, 9], [6, 10, 24, 15], [6, 16, 8, 22], [22, 16, 24, 22], [2, 23, 12, 29], [18, 23, 28, 29], [10, 26, 20, 28], [14, 29, 16, 32], [6, 33, 24, 40]],
    start: [15, 3], exit: [15, 1],
    lights: [[13, 2], [17, 2], [7, 11], [23, 11], [7, 20], [23, 20], [3, 24], [11, 28], [19, 24], [27, 28], [8, 34], [22, 34], [10, 39], [20, 39]],
    mobs: put([...P15([[9, 12], [13, 13], [17, 12], [21, 14], [15, 11], [7, 19], [23, 19], [4, 28], [10, 24], [21, 25], [26, 27], [20, 28], [11, 35], [19, 35], [15, 34]]), ["m0", 6, 26], ["m1", 25, 24], ["b", 15, 38]],
      ["gruvkobold", "gruvspindel", "stenvakt"], ["krakk", "grottbjorn"], "djuptjur")}),
  makeDungeon({id: "d_temple", name: "The Drowned Temple", sub: "A sunken temple ruled by an undying prophet", x0: 2000, z0: 0, W: 30, H: 44, lv: [17, 21],
    door: DG_DOORS.d_temple, floor: [0.42, 0.12, 0.3], wall: [0.4, 0.1, 0.34], fire: 0x7fffd4,
    carve: [[12, 1, 18, 4], [14, 5, 16, 8], [8, 9, 22, 14], [4, 15, 26, 17], [4, 18, 6, 26], [24, 18, 26, 26], [2, 27, 10, 32], [20, 27, 28, 32], [8, 30, 22, 32], [14, 33, 16, 35], [6, 36, 24, 42]],
    start: [15, 3], exit: [15, 1],
    lights: [[13, 2], [17, 2], [9, 10], [21, 10], [5, 16], [25, 16], [3, 28], [9, 31], [21, 31], [27, 28], [8, 37], [22, 37], [10, 41], [20, 41]],
    mobs: put([...P15([[10, 11], [13, 12], [17, 12], [20, 11], [8, 16], [22, 16], [5, 22], [25, 22], [8, 28], [3, 31], [22, 28], [24, 31], [12, 31], [11, 37], [19, 37]]), ["m0", 5, 30], ["m1", 26, 29], ["b", 15, 40]],
      ["kultist", "drunknad", "templebloss"], ["hagga", "templevakt"], "profeten")}),
  makeDungeon({id: "d_forge", name: "The Ember Forge", sub: "The forge of the Fire Tyrant", x0: 3000, z0: 0, W: 28, H: 46, lv: [22, 26],
    door: DG_DOORS.d_forge, floor: [0.03, 0.22, 0.17], wall: [0.02, 0.16, 0.22], fire: 0xff5a1a,
    carve: [[11, 1, 17, 4], [13, 5, 15, 7], [8, 8, 20, 13], [13, 14, 15, 16], [5, 17, 23, 20], [5, 21, 7, 24], [21, 21, 23, 24], [3, 25, 9, 30], [19, 25, 25, 30], [7, 31, 21, 32], [13, 33, 15, 35], [6, 36, 22, 44]],
    start: [14, 3], exit: [14, 1],
    lights: [[12, 2], [16, 2], [9, 9], [19, 9], [6, 18], [22, 18], [4, 26], [24, 26], [8, 37], [20, 37], [10, 43], [18, 43]],
    mobs: put([...P15([[10, 10], [18, 10], [12, 12], [16, 12], [8, 18], [12, 19], [16, 19], [20, 18], [5, 27], [7, 29], [23, 27], [21, 29], [14, 31], [11, 37], [17, 37]]), ["m0", 6, 28], ["m1", 22, 28], ["b", 14, 42]],
      ["smedjeorc", "eldhund", "levandeglod"], ["ignar", "magmagargoyl"], "eldtyrann")}),
  makeDungeon({id: "d_vault", name: "The Frost Vault", sub: "The frozen halls of Skadi the Ice Queen", x0: 4000, z0: 0, W: 32, H: 44, lv: [27, 31],
    door: DG_DOORS.d_vault, floor: [0.55, 0.22, 0.62], wall: [0.56, 0.28, 0.74], fire: 0x9fd6ff,
    carve: [[13, 1, 18, 4], [14, 5, 17, 8], [6, 9, 25, 14], [6, 15, 8, 24], [23, 15, 25, 24], [3, 25, 12, 31], [19, 25, 28, 31], [12, 27, 19, 29], [14, 32, 17, 35], [7, 36, 24, 42]],
    start: [15, 3], exit: [15, 1],
    lights: [[13, 2], [18, 2], [7, 10], [24, 10], [7, 19], [24, 19], [4, 26], [11, 30], [20, 26], [27, 30], [8, 37], [23, 37], [10, 41], [21, 41]],
    mobs: put([...P15([[9, 10], [13, 12], [18, 12], [22, 10], [7, 18], [24, 18], [7, 22], [24, 22], [5, 27], [10, 30], [21, 27], [26, 30], [15, 28], [11, 38], [20, 38]]), ["m0", 4, 29], ["m1", 27, 28], ["b", 15, 40]],
      ["isvaktare", "frostulv", "isande"], ["valvbjorn", "skrymer"], "skadi")}),
  makeDungeon({id: "d_crypt", name: "The Draug King's Crypt", sub: "The tomb of the Draug King", x0: 5000, z0: 0, W: 18, H: 20, lv: [20, 20],
    door: DG_DOORS.d_crypt, floor: [0.25, 0.08, 0.26], wall: [0.25, 0.06, 0.32], fire: 0x9aff8a,
    carve: [[7, 1, 10, 4], [8, 5, 9, 7], [3, 8, 14, 18]], start: [8, 3], exit: [8, 1],
    lights: [[7, 2], [10, 2], [4, 9], [13, 9], [4, 17], [13, 17]],
    mobs: [["boss", 8, 15]]})
];
export const dungeonAt = x => x > 500 ? DUNGEONS.find(d => x >= d.x0 - 50 && x < d.x0 + 900) || null : null;
export const dgBlocked = (x, z, r) => { const d = dungeonAt(x); return !d || d.blocked(x, z, r); };
export const dgLos = (ax, az, bx, bz) => { const d = dungeonAt(ax); return !!d && d === dungeonAt(bx) && d.los(ax, az, bx, bz); };
export const dgNavGrids = () => DUNGEONS.map(d => d.navGrid());

// build every dungeon's floor, walls and braziers (once)
export function buildDungeons(scene){
  const out = [];
  for(const d of DUNGEONS){
    const g = new THREE.Group(), T = d.T, Y = d.floorY, floors = [], walls = [];
    for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++){
      if(!d.wallTile(i, j)) floors.push([i, j]);
      else { let near = false; for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++) if(!d.wallTile(i + di, j + dj)) near = true; if(near) walls.push([i, j]); } }
    const fm = new THREE.InstancedMesh(new THREE.BoxGeometry(T, 0.2, T), new THREE.MeshLambertMaterial({color: 0xffffff, flatShading: true}), floors.length);
    const wm = new THREE.InstancedMesh(new THREE.BoxGeometry(T, 2.2, T), new THREE.MeshLambertMaterial({color: 0xffffff, flatShading: true}), walls.length), o = new THREE.Object3D(), col = new THREE.Color();
    floors.forEach(([i, j], k) => { const c = d.tileCenter(i, j); o.position.set(c.x, Y - 0.1, c.z); o.scale.set(1, 1, 1); o.updateMatrix(); fm.setMatrixAt(k, o.matrix);
      col.setHSL(d.floor[0], d.floor[1], d.floor[2] + ((i * 7 + j * 13) % 5) * 0.015); fm.setColorAt(k, col); });
    walls.forEach(([i, j], k) => { const c = d.tileCenter(i, j); o.position.set(c.x, Y + 1.1, c.z); o.scale.set(1, 1 + ((i * 5 + j * 3) % 4) * 0.06, 1); o.updateMatrix(); wm.setMatrixAt(k, o.matrix);
      col.setHSL(d.wall[0], d.wall[1], d.wall[2] + ((i * 3 + j * 11) % 5) * 0.02); wm.setColorAt(k, col); });
    fm.receiveShadow = true; wm.castShadow = true; wm.receiveShadow = true; g.add(fm, wm);
    const braziers = [];
    for(const [i, j] of d.lights){ const c = d.tileCenter(i, j), b = new THREE.Group();
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8), new THREE.MeshLambertMaterial({color: 0x3a3430})); bowl.position.y = 0.9;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.8, 6), new THREE.MeshLambertMaterial({color: 0x2a2420})); leg.position.y = 0.4;
      const fire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 6), new THREE.MeshBasicMaterial({color: d.fire})); fire.position.y = 1.35;
      b.add(bowl, leg, fire); b.position.set(c.x, Y, c.z); g.add(b); braziers.push({x: c.x, z: c.z, fire}); }
    { const c = d.tileCenter(...d.exit); const door = new THREE.Mesh(new THREE.BoxGeometry(2, 2.6, 0.3), new THREE.MeshBasicMaterial({color: 0x9fd6e8, transparent: true, opacity: 0.55}));
      door.position.set(c.x, Y + 1.3, c.z - 0.9); g.add(door); }
    scene.add(g); out.push({d, braziers}); }
  return out;
}
