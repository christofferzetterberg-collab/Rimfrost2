// The world: Rimfrost 1's map in 3D. Fourteen zones, five race towns, camps, Rimhaven, roads, lairs and places to explore.
// The land is worked out once on a grid (1 point per unit) and looked up from there, so height() is fast.
import * as THREE from "three";
import {clamp, lerp, smooth, rng, fbm} from "./util.js";
import {dgLos} from "./dungeon.js";
import {TS, ZONES, HUBS, ROADS, LAIRS, EXPLORE, DG_DOORS, CITY_SIGNS} from "./worlddata.js";

export const B = {x0: -308, x1: 308, z0: -250, z1: 250};        // the edges of the world (1 unit ≈ 1 metre)
export const WATER = 0;                                           // everything lower than this is water (or lava)
const NX = B.x1 - B.x0 + 1, NZ = B.z1 - B.z0 + 1;
const ZIDS = Object.keys(ZONES), ZL = ZIDS.map(id => ZONES[id]);
const HL = Object.values(HUBS);

// what each kind of land looks like: height, roughness, ground colours, and its special feature
// cliff = rocky outcrops you cannot climb, lake = ponds, lava = lava pools, ice = blocks of ice
export const LAND = {
  meadow:   {base: 2.2, amp: 3.5, g: [0x5e9a46, 0x6fae52]},
  forest:   {base: 2.6, amp: 4.5, g: [0x3f6338, 0x4a6e3c]},
  elfwood:  {base: 2.2, amp: 3, g: [0x7cb85c, 0x88c268], lake: 0.629, wc: 0x4a9ac8},
  moonwood: {base: 2.6, amp: 4, g: [0x3e6a64, 0x48766e]},
  highland: {base: 4.5, amp: 7, g: [0x8a8676, 0x958f80], cliff: 0.663, ch: 8, cg: [0x6e7176, 0x7a7d82]},
  snowhigh: {base: 5, amp: 7, g: [0xe2ecf0, 0xf0f6f8], cliff: 0.648, ch: 8, cg: [0x8a9096, 0x9aa0a6]},
  steppe:   {base: 2.2, amp: 2.5, g: [0xb4804e, 0xbe8a58], cliff: 0.745, ch: 6, cg: [0x9a4e36, 0xa65a40]},
  canyon:   {base: 3, amp: 3, g: [0xd4b07a, 0xdcbb86], cliff: 0.604, ch: 10, cg: [0xa0523a, 0xae6046]},
  rock:     {base: 4.5, amp: 6, g: [0x7a7d82, 0x868a8e], cliff: 0.625, ch: 8, cg: [0x5a5d62, 0x64676c]},
  swamp:    {base: 1.1, amp: 1.5, g: [0x4f6a3a, 0x587444], lake: 0.575, wc: 0x3f5a4a},
  ash:      {base: 2.4, amp: 3.5, g: [0x4a4440, 0x55504a], lava: 0.655, wc: 0xff5a1a},
  snow:     {base: 4, amp: 5, g: [0xe8f0f4, 0xf6fbfd], ice: 0.64},
  blight:   {base: 2.2, amp: 2.5, g: [0x6e7058, 0x787a60]},
  gloom:    {base: 1.9, amp: 2.5, g: [0x3e3e48, 0x484852], lake: 0.629, wc: 0x2a3a3a}
};
const ZT = ZL.map(z => LAND[z.t]);
// ground colours (two shades each, picked at random per triangle)
export const GROUND = {dirt: [0x9a7a4e, 0xa88a5a], snowroad: [0xc4bcae, 0xcec6b8], ashroad: [0x6a5a4a, 0x74644f], cobble: [0x8d8a84, 0x9c9891], ice: [0xbfe6ff, 0xcdeeff],
  scorch: [0x2a2220, 0x342a26], mud: [0x5a5236, 0x645a3c], shore: [0xa89a6a, 0xb4a676], camp: [0x8a7250, 0x947c58]};
for(const [k, L] of Object.entries(LAND)){ GROUND[k] = L.g; if(L.cg) GROUND[k + "_c"] = L.cg; }

// ---------------------------------------------------------------- the grids
const ZG = new Uint8Array(NX * NZ);                 // zone index
const RD = new Float32Array(NX * NZ).fill(99);      // distance to the nearest road
const KP = new Float32Array(NX * NZ).fill(1);       // 1 = wild land, 0 = must stay open (roads, towns, lairs…)
const HB = new Int8Array(NX * NZ).fill(-1);         // which town / camp this point is in
const FT = new Uint8Array(NX * NZ), FA = new Float32Array(NX * NZ);   // feature type (1 cliff, 2 lake, 3 lava, 4 ice) and how much
const H = new Float32Array(NX * NZ);                // height
const gi = (x, z) => clamp(Math.round(z - B.z0), 0, NZ - 1) * NX + clamp(Math.round(x - B.x0), 0, NX - 1);
// zones: the nearest zone centre, measured on slightly bent ground so the borders wiggle
function zoneRaw(x, z){ const wx = x + (fbm(x * 0.03 + 3.1, z * 0.03 + 7.7) - 0.5) * 70, wz = z + (fbm(x * 0.03 + 9.4, z * 0.03 + 1.3) - 0.5) * 70;
  let best = 0, bd = 1e9; for(let k = 0; k < ZL.length; k++){ const Z = ZL[k], d = Math.hypot(wx - Z.cx, wz - Z.cz) - Z.wu; if(d < bd){ bd = d; best = k; } } return best; }
for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++) ZG[j * NX + i] = zoneRaw(B.x0 + i, B.z0 + j);
// roads: wavy lines between towns (as in Rimfrost 1), to the lairs and to the dungeon doors
export const ROAD_LINES = [];
function road(a, b, ph){ const L = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(L), nx = -(b.z - a.z) / L, nz = (b.x - a.x) / L, pts = [];
  for(let k = 0; k <= n; k++){ const t = k / n, w = Math.sin(t * Math.PI * 2.5 + ph) * 2.2 * TS * Math.sin(t * Math.PI); pts.push([a.x + (b.x - a.x) * t + nx * w, a.z + (b.z - a.z) * t + nz * w]); }
  ROAD_LINES.push(pts);
  for(const [px, pz] of pts) for(let dz = -7; dz <= 7; dz++) for(let dx = -7; dx <= 7; dx++){ const x = Math.round(px) + dx, z = Math.round(pz) + dz; if(x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) continue;
    const k = gi(x, z), d = Math.hypot(x - px, z - pz); if(d < RD[k]) RD[k] = d; } }
ROADS.forEach(([a, b], i) => road(HUBS[a], HUBS[b], i * 0.7));
for(const [id, l] of Object.entries(LAIRS)) road(HUBS[l.from], l, id.length);
for(const d of Object.values(DG_DOORS)) road(HUBS[d.hub], d, 0.4);
// open places: towns, camps, lairs, places to explore and dungeon doors
const OPEN = [...HL.map(h => ({x: h.x, z: h.z, r: h.R + 4})), ...Object.values(LAIRS).map(l => ({x: l.x, z: l.z, r: l.R + 2})),
  ...Object.values(EXPLORE).map(e => ({x: e.x, z: e.z, r: 5})), ...Object.values(DG_DOORS).map(d => ({x: d.x, z: d.z, r: 7}))];
for(let k = 0; k < KP.length; k++) KP[k] = smooth(2.5, 7, RD[k]);
for(const o of OPEN) for(let z = Math.floor(o.z - o.r - 7); z <= o.z + o.r + 7; z++) for(let x = Math.floor(o.x - o.r - 7); x <= o.x + o.r + 7; x++){
  if(x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) continue; const k = gi(x, z); KP[k] = Math.min(KP[k], smooth(o.r, o.r + 6, Math.hypot(x - o.x, z - o.z))); }
HL.forEach((h, n) => { for(let z = Math.floor(h.z - h.R - 1); z <= h.z + h.R + 1; z++) for(let x = Math.floor(h.x - h.R - 1); x <= h.x + h.R + 1; x++)
  if(Math.hypot(x - h.x, z - h.z) < h.R + 0.5) HB[gi(x, z)] = n; });
// height: each zone's base height and roughness, blended across zone borders
{ const BA = new Float32Array(NX * NZ), AM = new Float32Array(NX * NZ);
  for(let k = 0; k < BA.length; k++){ BA[k] = ZT[ZG[k]].base; AM[k] = ZT[ZG[k]].amp; }
  const blur = (A, r) => { const T = new Float32Array(A.length);
    for(let pass = 0; pass < 2; pass++){
      for(let j = 0; j < NZ; j++){ let s = 0; const row = j * NX; for(let i = -r; i <= r; i++) s += A[row + clamp(i, 0, NX - 1)];
        for(let i = 0; i < NX; i++){ T[row + i] = s / (2 * r + 1); s += A[row + clamp(i + r + 1, 0, NX - 1)] - A[row + clamp(i - r, 0, NX - 1)]; } }
      for(let i = 0; i < NX; i++){ let s = 0; for(let j = -r; j <= r; j++) s += T[clamp(j, 0, NZ - 1) * NX + i];
        for(let j = 0; j < NZ; j++){ A[j * NX + i] = s / (2 * r + 1); s += T[clamp(j + r + 1, 0, NZ - 1) * NX + i] - T[clamp(j - r, 0, NZ - 1) * NX + i]; } } } };
  blur(BA, 10); blur(AM, 10);
  const flatAt = OPEN.map(o => BA[gi(o.x, o.z)] + 0.2);
  for(let j = 0; j < NZ; j++) for(let i = 0; i < NX; i++){ const k = j * NX + i, x = B.x0 + i, z = B.z0 + j, L = ZT[ZG[k]], kp = KP[k];
    let h = BA[k] + (fbm(x * 0.022 + 11, z * 0.022 - 4) - 0.5) * 2 * AM[k], ft = 0, fa = 0;
    if(L.cliff || L.lava || L.ice){ const n = fbm(x / 9 + 3, z / 9 + 5);
      if(L.cliff){ const c = smooth(L.cliff, L.cliff + 0.03, n) * kp; if(c > 0.01){ h += c * L.ch; ft = 1; fa = c; } }
      if(L.ice){ const c = smooth(L.ice, L.ice + 0.03, n) * kp; if(c > 0.01){ h += c * 4.5; ft = 4; fa = c; } }
      if(L.lava){ const c = smooth(L.lava, L.lava + 0.03, n) * kp; if(c > 0.01){ h = lerp(h, -1.2, c); ft = 3; fa = c; } } }
    if(L.lake){ const l = fbm(x / 34 + 17, z / 34 - 9), w = smooth(L.lake, L.lake + 0.03, l) * kp; if(w > 0.01){ h = lerp(h, -1.6, w); ft = 2; fa = w; } }
    if(ft !== 2 && ft !== 3) h = Math.max(h, 0.45);                                       // only ponds and lava go below the water line
    const rd = RD[k]; if(rd < 4) h = lerp(BA[k] + (h - BA[k]) * 0.35, h, smooth(1.5, 4, rd));   // roads run smoother
    OPEN.forEach((o, n) => { const d = Math.hypot(x - o.x, z - o.z); if(d < o.r + 7) h = lerp(flatAt[n], h, smooth(o.r - 2, o.r + 7, d)); });   // flat towns and camps
    const edge = Math.min(x - B.x0, B.x1 - x, z - B.z0, B.z1 - z); h += (1 - smooth(4, 26, edge)) * (16 + fbm(x * 0.08, z * 0.08) * 16);   // mountains all around
    H[k] = h; FT[k] = ft; FA[k] = fa; } }

export function height(x, z){
  if(x > 500) return 2;                                                             // a dungeon (its own flat floor)
  const fx = clamp(x - B.x0, 0, NX - 1.001), fz = clamp(z - B.z0, 0, NZ - 1.001), i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = j * NX + i;
  return (H[k] * (1 - u) + H[k + 1] * u) * (1 - v) + (H[k + NX] * (1 - u) + H[k + NX + 1] * u) * v;
}
export const zoneAt = (x, z) => x > 500 ? null : ZIDS[ZG[gi(x, z)]];
export const landAt = (x, z) => ZL[ZG[gi(x, z)]].t;
export const hubAt = (x, z) => { const n = HB[gi(x, z)]; return n >= 0 ? HL[n] : null; };
export const roadDist = (x, z) => RD[gi(x, z)];
export const openAt = (x, z) => KP[gi(x, z)];                                     // below 1: near a road, town, lair or the like
export const featureAt = (x, z) => { const k = gi(x, z); return FT[k] && FA[k] > 0.1 ? FT[k] : 0; };
// the name shown for where you are: the town or camp, otherwise the zone
export function placeName(x, z){ const h = hubAt(x, z); if(h) return h.name; const id = zoneAt(x, z); return id ? ZONES[id].name : ""; }
// what the ground is made of, for colour
export function ground(x, z){
  const k = gi(x, z), t = ZL[ZG[k]].t, n = HB[k];
  if(n >= 0) return HL[n].kind === "camp" ? "camp" : "cobble";
  if(RD[k] < 1.8) return t === "snow" || t === "snowhigh" ? "snowroad" : t === "ash" ? "ashroad" : "dirt";
  const f = FT[k], a = FA[k];
  if(f === 1 && a > 0.35) return t + "_c";
  if(f === 4 && a > 0.35) return "ice";
  if(f === 3 && a > 0.2) return "scorch";
  if(f === 2 && a > 0.2) return t === "swamp" ? "mud" : "shore";
  return t;
}
// the colour of the water (or lava) here
export const waterColor = (x, z) => ZT[ZG[gi(x, z)]].wc || 0x3f8fbf;

export const colliders = [];                       // circles you cannot walk through: {x, z, r, los}
// colliders sorted into 8×8 unit buckets, so collision and sight checks only look at what is close by
let cgrid = null; const CB = 8;
export function nearColliders(x, z){
  if(!cgrid){ cgrid = new Map(); for(const c of colliders){ const r = c.r + 1;
    for(let i = Math.floor((c.x - r) / CB); i <= Math.floor((c.x + r) / CB); i++) for(let j = Math.floor((c.z - r) / CB); j <= Math.floor((c.z + r) / CB); j++){ const k = i + "," + j; if(!cgrid.has(k)) cgrid.set(k, []); cgrid.get(k).push(c); } } }
  return cgrid.get(Math.floor(x / CB) + "," + Math.floor(z / CB)) || [];
}
export const resetColliderBuckets = () => { cgrid = null; };
export const houses = [];                          // buildings that turn see-through when they hide you
export const SIGNS = [];                           // names shown over sign posts: {name, x, z}

// ---------------------------------------------------------------- terrain (flat-shaded low-poly)
const STEP = 1.5;
function buildTerrain(){
  const NXs = Math.ceil((B.x1 - B.x0) / STEP), NZs = Math.ceil((B.z1 - B.z0) / STEP), tris = NXs * NZs * 2;
  const pos = new Float32Array(tris * 9), col = new Float32Array(tris * 9), c = new THREE.Color(), r = rng(3);
  const hv = new Float32Array((NXs + 1) * (NZs + 1)); for(let j = 0; j <= NZs; j++) for(let i = 0; i <= NXs; i++) hv[j * (NXs + 1) + i] = height(B.x0 + i * STEP, B.z0 + j * STEP);
  let p = 0;
  for(let j = 0; j < NZs; j++) for(let i = 0; i < NXs; i++){
    const V = (a, b) => [B.x0 + (i + a) * STEP, hv[(j + b) * (NXs + 1) + i + a], B.z0 + (j + b) * STEP];
    const A = V(0, 0), Bv = V(1, 0), D = V(0, 1), E = V(1, 1);
    for(const tri of [[A, D, Bv], [Bv, D, E]]){
      const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cz = (tri[0][2] + tri[1][2] + tri[2][2]) / 3;
      c.setHex(GROUND[ground(cx, cz)][r() < 0.5 ? 0 : 1]); c.offsetHSL(0, 0, (r() - 0.5) * 0.04);
      for(const v of tri){ pos[p] = v[0]; pos[p + 1] = v[1]; pos[p + 2] = v[2]; col[p] = c.r; col[p + 1] = c.g; col[p + 2] = c.b; p += 3; } } }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({vertexColors: true, flatShading: true})); m.receiveShadow = true; return m;
}
// one water surface for the whole world, coloured by zone (blue lakes, murky marsh, glowing lava)
function buildWater(){
  const g = new THREE.PlaneGeometry(B.x1 - B.x0, B.z1 - B.z0, Math.ceil((B.x1 - B.x0) / 4), Math.ceil((B.z1 - B.z0) / 4)); g.rotateX(-Math.PI / 2);
  const P = g.attributes.position, cols = new Float32Array(P.count * 3), c = new THREE.Color();
  for(let k = 0; k < P.count; k++){ const x = P.getX(k) + (B.x0 + B.x1) / 2, z = P.getZ(k) + (B.z0 + B.z1) / 2; c.setHex(waterColor(x, z)); cols[k * 3] = c.r; cols[k * 3 + 1] = c.g; cols[k * 3 + 2] = c.b; }
  g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({vertexColors: true, transparent: true, opacity: 0.84, emissive: 0x111111}));
  m.position.set((B.x0 + B.x1) / 2, WATER - 0.05, (B.z0 + B.z1) / 2); return m;
}

// ---------------------------------------------------------------- helpers for building things
const mats = new Map();
const flat = color => { if(!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({color, flatShading: true})); return mats.get(color); };
const glowMat = color => new THREE.MeshBasicMaterial({color});
function mesh(geo, mat, x, y, z){ const m = new THREE.Mesh(geo, typeof mat === "number" ? flat(mat) : mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
// join several shapes into one (each given as [geometry, x, y, z, rx, ry, rz, sx, sy, sz])
function merge(parts){ const pos = [], o = new THREE.Object3D();
  for(const [geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1] of parts){ const g = (geo.index ? geo.toNonIndexed() : geo.clone());
    o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); o.updateMatrix(); g.applyMatrix4(o.matrix); pos.push(...g.attributes.position.array); }
  const out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); out.computeVertexNormals(); return out; }
let SCENE = null;
// place a group at (x, z) on the ground, turned rot; local offsets turn with it
function place(g, x, z, rot = 0, dy = 0){ g.position.set(x, height(x, z) + dy, z); g.rotation.y = rot; SCENE.add(g); return g; }
const turn = (x, z, rot, dx, dz) => ({x: x + dx * Math.cos(rot) + dz * Math.sin(rot), z: z - dx * Math.sin(rot) + dz * Math.cos(rot)});
function solid(x, z, r, los = false){ colliders.push({x, z, r, los}); }
function house(x, z, rot, w, d, wallC, roofC){
  const g = new THREE.Group(), hh = 2.6;
  const roofGeo = new THREE.ConeGeometry(Math.hypot(w, d) / 2 * 1.05, 2.2, 4); roofGeo.rotateY(Math.PI / 4);
  const roof = mesh(roofGeo, roofC, 0, hh + 1.1, 0); roof.scale.set(w / Math.hypot(w, d) * 1.45, 1, d / Math.hypot(w, d) * 1.45);
  g.add(mesh(new THREE.BoxGeometry(w, hh, d), wallC, 0, hh / 2, 0), roof, mesh(new THREE.BoxGeometry(0.9, 1.6, 0.1), 0x4a3220, 0, 0.8, d / 2 + 0.03));
  seeThrough(place(g, x, z, rot)); solid(x, z, Math.max(w, d) * 0.62, true); return g;
}
function hall(x, z, rot, w, d, wallC, roofC){                                    // dwarf halls: stone, flat roofs
  const g = new THREE.Group(), hh = 3;
  g.add(mesh(new THREE.BoxGeometry(w, hh, d), wallC, 0, hh / 2, 0), mesh(new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6), roofC, 0, hh + 0.25, 0), mesh(new THREE.BoxGeometry(1.1, 1.9, 0.1), 0x4a3220, 0, 0.95, d / 2 + 0.03));
  seeThrough(place(g, x, z, rot)); solid(x, z, Math.max(w, d) * 0.62, true); return g;
}
function hut(x, z, rot, rad, wallC, roofC){                                      // orc huts: round, with a hide roof and tusks over the door
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(rad, rad * 1.05, 2.2, 9), wallC, 0, 1.1, 0), mesh(new THREE.ConeGeometry(rad * 1.3, 2.2, 9), roofC, 0, 3.2, 0), mesh(new THREE.BoxGeometry(1, 1.6, 0.1), 0x2a1a10, 0, 0.8, rad + 0.02));
  for(const s of [-1, 1]){ const t = mesh(new THREE.ConeGeometry(0.12, 1.1, 5), 0xf0e6cc, s * 0.6, 2, rad + 0.25); t.rotation.x = 0.9; g.add(t); }
  seeThrough(place(g, x, z, rot)); solid(x, z, rad + 0.3, true); return g;
}
function tent(x, z, rot, color, s = 1){ const t = mesh(new THREE.ConeGeometry(1.6 * s, 2.1 * s, 5), color, 0, 1.05 * s, 0); const g = new THREE.Group(); g.add(t); place(g, x, z, rot); solid(x, z, 1.3 * s, true); return g; }
function fire(x, z){ const g = new THREE.Group(); for(let i = 0; i < 5; i++){ const l = mesh(new THREE.BoxGeometry(0.9, 0.14, 0.14), 0x4a3220, 0, 0.1, 0); l.rotation.y = i * 1.25; g.add(l); }
  g.add(mesh(new THREE.ConeGeometry(0.35, 0.8, 6), glowMat(0xff9a3a), 0, 0.5, 0)); place(g, x, z); solid(x, z, 0.6); return g; }
function brazier(x, z, color = 0xff8a3a){ const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 6), 0x2a2420, 0, 0.45, 0), mesh(new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8), 0x3a3430, 0, 1.0, 0), mesh(new THREE.ConeGeometry(0.25, 0.6, 6), glowMat(color), 0, 1.45, 0));
  place(g, x, z); solid(x, z, 0.4); return g; }
function fountain(x, z, water = 0x3f8fbf, stone = 0x8b8780){ const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(2, 2.2, 0.6, 10), stone, 0, 0.3, 0), mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.1, 10), new THREE.MeshLambertMaterial({color: water, emissive: water, emissiveIntensity: 0.15}), 0, 0.6, 0),
    mesh(new THREE.CylinderGeometry(0.25, 0.3, 1.6, 8), stone, 0, 1.2, 0)); place(g, x, z); solid(x, z, 2.2); return g; }
function signpost(x, z, name){ const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(0.14, 1.8, 0.14), 0x6b4a2e, 0, 0.9, 0), mesh(new THREE.BoxGeometry(1.3, 0.45, 0.08), 0x8a6a42, 0, 1.55, 0));
  place(g, x, z, Math.random() * 0.5); SIGNS.push({name, x, z}); }
function stone(x, z, w, h, d, color, rot = 0, los = true){ const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(w, h, d), color, 0, h / 2 - 0.1, 0)); place(g, x, z, rot); solid(x, z, Math.max(w, d) * 0.55, los); return g; }
function seeThrough(g){ houses.push(g); g.traverse(o => { if(o.material){ o.material = o.material.clone(); o.material.transparent = true; } }); }

// ---------------------------------------------------------------- towns, camps and Rimhaven
const TOWN_LOOK = {
  human:  {walls: [0xd9c7a3, 0xcdb894, 0xe0d2b4], roofs: [0x8f3c2b, 0x7a5a3a, 0x5a6f8f], water: 0x3f8fbf},
  elf:    {walls: [0xeae6d6, 0xdcd8c4, 0xe4ead8], roofs: [0x3a8a7a, 0x4a7aa0, 0x5a9a6a], water: 0x7fd8ff, stone: 0xc8ccc0},
  dwarf:  {walls: [0x8a8f96, 0x7e848a], roofs: [0x5a5f66, 0x4e535a]},
  orc:    {walls: [0x7a5a3a, 0x6a4a2e], roofs: [0x5a3a22, 0x4a3020]},
  undead: {walls: [0x5a5a62, 0x4e4e56, 0x625e66], roofs: [0x3a2a4a, 0x2a2a3a, 0x4a3a2a], water: 0x6a9a40, stone: 0x5a5a5e}
};
// spots around a centre that are not on a road: n positions at radius rad
function ringSpots(c, rad, n, avoid = []){ const out = [];
  for(let k = 0; k < 24 && out.length < n; k++){ const a = k / 24 * Math.PI * 2 + 0.2, x = c.x + Math.cos(a) * rad, z = c.z + Math.sin(a) * rad;
    if(roadDist(x, z) < 4.2 || out.some(o => Math.hypot(o.x - x, o.z - z) < 7) || avoid.some(o => Math.hypot(o.x - x, o.z - z) < o.r)) continue;
    out.push({x, z, rot: Math.atan2(c.x - x, c.z - z)}); }
  return out; }
function buildTown(h){
  const L = TOWN_LOOK[h.race], spots = ringSpots(h, h.R + 2.6, 6);
  spots.forEach((s, i) => {
    if(h.race === "dwarf") hall(s.x, s.z, s.rot, 5, 4.2, L.walls[i % 2], L.roofs[i % 2]);
    else if(h.race === "orc") hut(s.x, s.z, s.rot, 2.2, L.walls[i % 2], L.roofs[i % 2]);
    else house(s.x, s.z, s.rot, 4.6, 4, L.walls[i % L.walls.length], L.roofs[i % L.roofs.length]); });
  if(h.race === "orc"){ fire(h.x, h.z); for(const a of [0.8, 2.4, 4.0, 5.6]){ const x = h.x + Math.cos(a) * 3.2, z = h.z + Math.sin(a) * 3.2;
      const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.6, 6), 0x6a4a2e, 0, 1.3, 0), mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), 0xd8d0b8, 0, 2.7, 0)); place(g, x, z); solid(x, z, 0.3); } }
  else if(h.race === "dwarf"){ const f = new THREE.Group();                         // a great forge in the middle of the square
    f.add(mesh(new THREE.BoxGeometry(3.2, 1.2, 3.2), 0x4a4a50, 0, 0.6, 0), mesh(new THREE.BoxGeometry(2.4, 0.3, 2.4), glowMat(0xff7a2a), 0, 1.25, 0), mesh(new THREE.BoxGeometry(0.9, 3.6, 0.9), 0x5a5a60, 0, 2.6, -1.1),
      mesh(new THREE.BoxGeometry(1.2, 0.5, 0.6), 0x2a2a2e, 0, 0.25, 2.2)); place(f, h.x, h.z); solid(h.x, h.z, 2.2); }
  else fountain(h.x, h.z, L.water, L.stone);
}
function buildCamp(h){
  fire(h.x, h.z);
  const spots = ringSpots(h, h.R + 1.6, 2);
  spots.forEach((s, i) => { if(h.id === "holgerstuga" && i === 0) house(s.x, s.z, s.rot, 4.6, 4, 0x8a6a4a, 0x4a3a2a); else tent(s.x, s.z, s.rot, [0x8a6a4a, 0x6a5a4a][i % 2]); });
}
function buildCity(h){
  const R = h.R, ring = R + 1.2;
  // gates: wherever a road crosses the wall
  const angs = []; for(const L of ROAD_LINES) for(const [x, z] of L){ const d = Math.hypot(x - h.x, z - h.z); if(Math.abs(d - ring) < 1) angs.push(Math.atan2(z - h.z, x - h.x)); }
  const gates = []; for(const a of angs){ const g = gates.find(g => Math.abs(Math.atan2(Math.sin(a - g.a), Math.cos(a - g.a))) < 0.4); if(g){ g.s += a; g.n++; g.a = g.s / g.n; } else gates.push({a, s: a, n: 1}); }
  const atGate = a => gates.some(g => Math.abs(Math.atan2(Math.sin(a - g.a), Math.cos(a - g.a))) < 3.4 / ring);
  const wallC = 0x9a968c, segs = Math.ceil(ring * Math.PI * 2 / 1.9);
  for(let k = 0; k < segs; k++){ const a = k / segs * Math.PI * 2; if(atGate(a)) continue; const x = h.x + Math.cos(a) * ring, z = h.z + Math.sin(a) * ring;
    const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(2.1, 3.4, 1), wallC, 0, 1.7, 0), mesh(new THREE.BoxGeometry(0.6, 0.6, 1.1), 0x8a867c, (k % 2) * 0.7 - 0.35, 3.6, 0)); place(g, x, z, -a + Math.PI / 2); solid(x, z, 1.15, true); }
  for(const gt of gates) for(const s of [-1, 1]){ const a = gt.a + s * 3.9 / ring, x = h.x + Math.cos(a) * ring, z = h.z + Math.sin(a) * ring;
    const t = new THREE.Group(); t.add(mesh(new THREE.CylinderGeometry(1.2, 1.35, 5, 8), 0x8a867c, 0, 2.5, 0), mesh(new THREE.ConeGeometry(1.5, 1.8, 8), 0x5a3a3a, 0, 5.9, 0)); place(t, x, z); solid(x, z, 1.35, true); }
  fountain(h.x, h.z, 0x3f8fbf, 0xa8a49a);
  for(const [dx, dz] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) brazier(h.x + dx * TS, h.z + dz * TS);
  for(const [name, dx, dz] of CITY_SIGNS) signpost(h.x + dx * TS, h.z + dz * TS, name);
  // houses in blocks between the streets (not on the streets, the square or where people stand)
  const keep = CITY_KEEP.map(([dx, dz]) => ({x: h.x + dx * TS, z: h.z + dz * TS}));
  const streets = gates.map(g => g.a), walls = [0xd9c7a3, 0xcdb894, 0xc8bca8, 0xe0d2b4], roofs = [0x5a6f8f, 0x8f3c2b, 0x4a5a6a, 0x7a5a3a]; let n = 0;
  for(const rr of [10.5, 15.5]) for(let k = 0, cnt = Math.round(rr * Math.PI * 2 / 6.2); k < cnt; k++){ const a = k / cnt * Math.PI * 2 + rr, x = h.x + Math.cos(a) * rr, z = h.z + Math.sin(a) * rr;
    if(streets.some(s => { const d = Math.atan2(Math.sin(a - s), Math.cos(a - s)); return Math.abs(Math.sin(d)) * rr < 3.6 && Math.cos(d) > 0; })) continue;
    if(keep.some(o => Math.hypot(o.x - x, o.z - z) < 4.2) || SIGNS.some(o => Math.hypot(o.x - x, o.z - z) < 3.5)) continue;
    house(x, z, Math.atan2(h.x - x, h.z - z), 3.8, 3.4, walls[n % 4], roofs[n % 4]); n++; }
}
export const CITY_KEEP = [[-2, -2], [2, -2], [-2, 2], [2, 2], [-3, -10], [3, -10], [10, -3], [10, 3], [-3, 10], [3, 10], [-10, -4], [-11, -1], [-11, 2], [-9, 5]];   // where Rimhaven's people stand (tiles from the centre)

// ---------------------------------------------------------------- lairs, places to explore, dungeon doors
function buildLair(id, l){
  const at = (dx, dz) => ({x: l.x + dx * TS, z: l.z + dz * TS});
  if(id === "banditcamp"){ fire(l.x, l.z); [[-4, -3], [3, -4], [-5, 2], [4, 3], [0, 5]].forEach(([dx, dz], i) => { const p = at(dx, dz); tent(p.x, p.z, Math.atan2(-dx, -dz), [0x8a6a4a, 0x6a5a4a, 0x7a4a3a][i % 3]); }); }
  if(id === "morvel"){ for(let k = 0; k < 6; k++){ const a = k / 6 * 6.283, x = l.x + Math.cos(a) * 4.6, z = l.z + Math.sin(a) * 4.6; stone(x, z, 0.8, 2.6 + (k % 3) * 0.5, 0.6, 0x4a4060, a, false); }
    const c = new THREE.Group(); c.add(mesh(new THREE.OctahedronGeometry(0.5, 0), glowMat(0xb08aff), 0, 1.4, 0)); place(c, l.x, l.z - 2.5); }
  if(id === "snorre"){ for(const [dx, dz] of [[-3, -2], [3, -3], [0, 3]]){ const p = at(dx, dz); tent(p.x, p.z, 0.5, 0x8a7a5a, 0.85); }
    for(let k = 0; k < 5; k++){ const p = at(Math.cos(k * 1.3) * 4.5, Math.sin(k * 1.3) * 4.5); const o = new THREE.Group(); o.add(mesh(new THREE.DodecahedronGeometry(0.55, 0), 0x9fb8c8, 0, 0.3, 0)); place(o, p.x, p.z); } }
  if(id === "garuk"){ for(const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]){ const p = at(dx, dz), g = new THREE.Group();
      g.add(mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.6, 6), 0x4a3220, 0, 1.8, 0), mesh(new THREE.BoxGeometry(0.06, 1.4, 1), 0x8a1a1a, 0, 2.8, 0.5)); place(g, p.x, p.z); solid(p.x, p.z, 0.3); }
    fire(l.x - 2.5, l.z + 2.5); }
  if(id === "magma"){ for(const [dx, dz] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]){ const p = at(dx, dz); brazier(p.x, p.z, 0xff5a1a); }
    for(let k = 0; k < 6; k++){ const p = at(Math.cos(k) * 5.5, Math.sin(k) * 5.5), o = new THREE.Group(); o.add(mesh(new THREE.ConeGeometry(0.5, 2 + (k % 3), 5), 0x1a1420, 0, 1, 0)); place(o, p.x, p.z); solid(p.x, p.z, 0.5); } }
  if(id === "giant"){ const p = at(0, -4); stone(p.x, p.z, 5, 4.5, 3, 0xbfe6ff, 0, true); const s = at(0, -2.6); stone(s.x, s.z, 3, 1.4, 1.6, 0xa8d8ec, 0, false);
    for(let k = 0; k < 7; k++){ const q = at(Math.cos(k * 0.9) * 7, Math.sin(k * 0.9) * 7), o = new THREE.Group(); o.add(mesh(new THREE.ConeGeometry(0.6, 3 + (k % 3), 5), 0xbfe6ff, 0, 1.5, 0)); place(o, q.x, q.z); solid(q.x, q.z, 0.6); } }
  if(id === "vex"){ const p = at(0, -2.5); stone(p.x, p.z, 1.1, 5, 1.1, 0x2a2430, 0.3, true); const top = new THREE.Group(); top.add(mesh(new THREE.OctahedronGeometry(0.45, 0), glowMat(0x7aff6a), 0, 5.4, 0)); place(top, p.x, p.z);
    for(let k = 0; k < 6; k++){ const q = at(-4 + (k % 3) * 4, 2 + Math.floor(k / 3) * 2.5); stone(q.x, q.z, 0.8, 1.1, 0.25, 0x6a6a6e, 0, false); } }
}
function buildPlace(id, e){
  const x = e.x, z = e.z, nm = e.name[0].toUpperCase() + e.name.slice(1);
  const sp = turn(x, z, 0, 3.2, 3.2); signpost(sp.x, sp.z, nm);
  const g = new THREE.Group();
  const add = (...m) => g.add(...m);
  if(id === "windmill"){ add(mesh(new THREE.CylinderGeometry(1.4, 1.9, 6, 8), 0xd9c7a3, 0, 3, 0), mesh(new THREE.ConeGeometry(2.1, 2, 8), 0x7a5a3a, 0, 7, 0));
    for(let k = 0; k < 4; k++){ const b = mesh(new THREE.BoxGeometry(0.35, 4.2, 0.08), 0x8a6a42, 0, 0, 0); b.position.set(0, 5.6, 2); b.rotation.z = k * Math.PI / 2 + 0.3; b.geometry = b.geometry.clone(); b.geometry.translate(0, 2.1, 0); add(b); } solid(x, z, 2); }
  else if(id === "wolfhill" || id === "skullrock"){ add(mesh(new THREE.DodecahedronGeometry(2.6, 0), id === "skullrock" ? 0xb8a890 : 0x7a7d82, 0, 1.2, 0));
    if(id === "skullrock"){ const sk = mesh(new THREE.SphereGeometry(0.9, 8, 6), 0xf0eadc, 0, 3.3, 0.8); add(sk); for(const s of [-1, 1]) add(mesh(new THREE.SphereGeometry(0.2, 6, 4), 0x2a2420, s * 0.32, 3.4, 1.6)); }
    for(let k = 0; k < 6; k++){ const bn = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 5), 0xe8e0c8, Math.cos(k * 1.7) * 3.2, 0.1, Math.sin(k * 1.7) * 3.2); bn.rotation.set(Math.PI / 2, 0, k); add(bn); } solid(x, z, 2.6, true); }
  else if(id === "hunterscairn"){ for(let k = 0; k < 5; k++) add(mesh(new THREE.DodecahedronGeometry(1.1 - k * 0.18, 0), 0x8a8d91, 0, 0.5 + k * 0.6, 0)); solid(x, z, 1.1); }
  else if(id === "stones"){ for(let k = 0; k < 7; k++){ const a = k / 7 * 6.283, s = mesh(new THREE.BoxGeometry(0.9, 2.6 + (k % 3) * 0.5, 0.6), 0xa8aca0, Math.cos(a) * 4, 1.3, Math.sin(a) * 4); s.rotation.y = -a; add(s); solid(x + Math.cos(a) * 4, z + Math.sin(a) * 4, 0.55); } }
  else if(id === "moonwell"){ add(mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.9, 10), 0xb8bcb0, 0, 0.45, 0), mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.1, 10), glowMat(0x9fd8ff), 0, 0.88, 0)); solid(x, z, 1.8); }
  else if(id === "oldshaft"){ for(const s of [-1.4, 1.4]) add(mesh(new THREE.BoxGeometry(0.4, 2.8, 0.4), 0x6b4a2e, s, 1.4, 0)); add(mesh(new THREE.BoxGeometry(3.6, 0.4, 0.45), 0x6b4a2e, 0, 2.9, 0), mesh(new THREE.BoxGeometry(2.4, 2.6, 0.3), 0x14100c, 0, 1.3, -0.2), mesh(new THREE.DodecahedronGeometry(3.2, 0), 0x7a7d82, 0, 0.8, -3));
    solid(x, z - 3, 3.2, true); }
  else if(id === "frozenfalls"){ add(mesh(new THREE.BoxGeometry(7, 6, 2.5), 0x9aa0a6, 0, 3, -2.5), mesh(new THREE.BoxGeometry(2.6, 5.6, 0.6), 0xbfe6ff, 0, 2.8, -1.1), mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.3, 10), 0xcdeeff, 0, 0.15, 0.8)); solid(x, z - 2.5, 3.6, true); }
  else if(id === "rustcaravan"){ const bed = mesh(new THREE.BoxGeometry(3, 0.6, 1.6), 0x7a5a3a, 0, 0.9, 0); add(bed); const wg = new THREE.CylinderGeometry(0.55, 0.55, 0.15, 10); wg.rotateX(Math.PI / 2);
    for(const [dx, dz] of [[-1.1, 0.85], [1.1, 0.85], [-1.1, -0.85], [1.1, -0.85]]) add(mesh(wg, 0x4a3220, dx, 0.55, dz));
    add(mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), 0x8a6a42, 2.4, 0.4, 0.6), mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), 0x8a6a42, 2.1, 0.35, -0.7)); solid(x, z, 1.8); }
  else if(id === "cryptdoor" || id === "barrow"){ add(mesh(new THREE.DodecahedronGeometry(3.4, 0), id === "barrow" ? 0x5a6a4a : 0x5a5a52, 0, 0.3, -2.6));
    for(const s of [-1.3, 1.3]) add(mesh(new THREE.BoxGeometry(0.7, 2.6, 0.7), 0x8a857c, s, 1.3, 0)); add(mesh(new THREE.BoxGeometry(3.4, 0.6, 0.8), 0x8a857c, 0, 2.8, 0), mesh(new THREE.BoxGeometry(1.9, 2.4, 0.3), 0x14100c, 0, 1.2, -0.2));
    solid(x, z - 2.6, 3, true); solid(x - 1.3, z, 0.5, true); solid(x + 1.3, z, 0.5, true); }
  else if(id === "watchtower"){ add(mesh(new THREE.CylinderGeometry(1.8, 2.1, 6.5, 8), 0x8a857c, 0, 3.25, 0), mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), 0x8a857c, 1, 7.2, 0.6), mesh(new THREE.DodecahedronGeometry(0.7, 0), 0x8a857c, 2.4, 0.3, 1.8)); solid(x, z, 2.1, true); }
  else if(id === "minershrine"){ add(mesh(new THREE.BoxGeometry(1.8, 1.2, 1.2), 0x8a8d91, 0, 0.6, 0), mesh(new THREE.BoxGeometry(2.2, 0.3, 1.5), 0x6e7176, 0, 1.35, 0), mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 6), 0xf0e6cc, 0.4, 1.65, 0), mesh(new THREE.ConeGeometry(0.06, 0.14, 5), glowMat(0xffd060), 0.4, 1.86, 0)); solid(x, z, 1.1); }
  else if(id === "witchhut"){ house(x, z - 2.5, 0.25, 3.8, 3.4, 0x4a4a3a, 0x3a2a3a); const pot = new THREE.Group(); pot.add(mesh(new THREE.SphereGeometry(0.6, 8, 6), 0x2a2a2a, 0, 0.5, 0), mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 8), glowMat(0x7aff6a), 0, 0.9, 0)); place(pot, x + 1.5, z + 1); solid(x + 1.5, z + 1, 0.6); }
  else if(id === "sunkenbell"){ const b = mesh(new THREE.CylinderGeometry(0.9, 1.6, 2.2, 10), 0x9a7a3a, 0, 0.6, 0); b.rotation.z = 0.5; add(b); solid(x, z, 1.6); }
  else if(id === "obelisk"){ add(mesh(new THREE.BoxGeometry(1.3, 6.5, 1.3), 0x1a1618, 0, 3.25, 0), mesh(new THREE.ConeGeometry(0.95, 1.2, 4), glowMat(0xff4a1a), 0, 7.1, 0)); g.children[0].rotation.y = 0.785; solid(x, z, 1); }
  else if(id === "scorchbridge"){ for(let k = 0; k < 6; k++){ const p = mesh(new THREE.BoxGeometry(2.6, 0.15, 0.8), 0x2a2220, 0, 0.35 + (k % 2) * 0.1, -2.5 + k * 1); p.rotation.z = (k % 3 - 1) * 0.15; add(p); }
    for(const s of [-1.3, 1.3]) for(const zz of [-3, 3]) add(mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.6, 5), 0x1a1410, s, 0.6, zz)); }
  else if(id === "frozencamp"){ for(const [dx, dz] of [[-2.2, -1.5], [2.2, -1.8]]){ const t = mesh(new THREE.ConeGeometry(1.4, 1.9, 5), 0xd8e4ea, dx, 0.95, dz); add(t); solid(x + dx, z + dz, 1.2, true); }
    for(let i = 0; i < 4; i++){ const l = mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), 0x2a2420, 0, 0.08, 1.2); l.rotation.y = i * 1.6; add(l); } }
  else if(id === "giantprint"){ const fp = new THREE.Mesh(new THREE.CircleGeometry(2.4, 18), new THREE.MeshLambertMaterial({color: 0x9fb8c8})); fp.rotation.x = -Math.PI / 2; fp.scale.set(0.8, 1.8, 1); fp.position.y = 0.06; add(fp);
    for(let k = 0; k < 5; k++){ const t = new THREE.Mesh(new THREE.CircleGeometry(0.55, 10), new THREE.MeshLambertMaterial({color: 0x9fb8c8})); t.rotation.x = -Math.PI / 2; t.position.set(-1.6 + k * 0.8, 0.06, -4.9 + Math.abs(k - 2) * 0.3); add(t); } }
  place(g, x, z);
}
// dungeon doors: built facing the road from their camp. Returns where the way in is.
export const DOORS = {};
function buildDoor(id, D){
  const hub = HUBS[D.hub], rot = Math.atan2(hub.x - D.x, hub.z - D.z), g = new THREE.Group(), fx = Math.sin(rot), fz = Math.cos(rot);
  const S2 = {d_mine: [0x6b4a2e, 0x7a7d82], d_temple: [0x6a7a6a, 0x5a6a5a], d_forge: [0x2a2624, 0x3a2a24], d_vault: [0xbfe6ff, 0xa8cfe0], d_crypt: [0x7a776e, 0x4a5040]}[id];
  for(const s of [-1.6, 1.6]) g.add(mesh(new THREE.BoxGeometry(0.8, 3.4, 0.8), S2[0], s, 1.7, 0));
  g.add(mesh(new THREE.BoxGeometry(4.2, 0.8, 0.9), S2[0], 0, 3.6, 0), mesh(new THREE.BoxGeometry(2.4, 3, 0.3), id === "d_forge" ? glowMat(0x5a1a0a) : 0x0e0c0a, 0, 1.5, -0.2), mesh(new THREE.DodecahedronGeometry(4, 0), S2[1], 0, 1.2, -3.6));
  if(id === "d_temple"){ const top = mesh(new THREE.ConeGeometry(2.8, 1.6, 4), S2[0], 0, 4.7, 0); top.rotation.y = Math.PI / 4; g.add(top); }
  if(id === "d_vault") for(let k = 0; k < 5; k++) g.add(mesh(new THREE.ConeGeometry(0.4, 2 + k % 2, 5), 0xdff4ff, -3 + k * 1.5, 4.6, -1.5));
  place(g, D.x, D.z, rot);
  for(const [dx, dz, r] of [[-1.6, 0, 0.6], [1.6, 0, 0.6], [0, -3.6, 4]]){ const p = turn(D.x, D.z, rot, dx, dz); solid(p.x, p.z, r, true); }
  for(const s of [-1, 1]){ const p = turn(D.x, D.z, rot, s * 2.8, 1.2); brazier(p.x, p.z, {d_mine: 0xffb060, d_temple: 0x7fffd4, d_forge: 0xff5a1a, d_vault: 0x9fd6ff, d_crypt: 0x9aff8a}[id]); }
  DOORS[id] = {x: D.x, z: D.z, rot, fx, fz};
}

// ---------------------------------------------------------------- trees, rocks and the rest, by zone
const DENS = {   // per 100 square units: trees, rocks, spikes (ice / obsidian)
  meadow: [0.5, 0.12], forest: [3.6, 0.08], elfwood: [1.5, 0.06], moonwood: [2.6, 0.08], highland: [0.5, 0.35], snowhigh: [0.35, 0.2, 0.15],
  steppe: [0.18, 0.2], canyon: [0.15, 0.3], rock: [0.4, 0.5], swamp: [0.9, 0.05], ash: [0.2, 0.2, 0.3], snow: [0.2, 0.1, 0.35], blight: [0.7, 0.25], gloom: [1.5, 0.1]};
const TREE = {meadow: "oak", forest: "pine", elfwood: "birch", moonwood: "violet", highland: "pine", snowhigh: "snowpine", steppe: "cactus", canyon: "cactus", rock: "pine",
  swamp: "dead", ash: "charred", snow: "snowpine", blight: "dead", gloom: "dead"};
const ROCK_COL = {steppe: 0x9a5a40, canyon: 0xa86a48, snowhigh: 0xdde6ea, snow: 0xdde6ea, ash: 0x3a3634, gloom: 0x4a4a52, blight: 0x6a6a5e};
function buildProps(){
  const r = rng(5), T = {trunk: [], crown: [], cone: [], dead: [], cactus: [], rock: [], spike: [], reed: []}, c = new THREE.Color();
  const ok = (x, z, pad) => openAt(x, z) > 0.95 && roadDist(x, z) > pad && !hubAt(x, z) && !featureAt(x, z) && height(x, z) > 0.55;
  for(let z = B.z0 + 6; z < B.z1 - 6; z += 2.2) for(let x = B.x0 + 6; x < B.x1 - 6; x += 2.2){
    const px = x + (r() - 0.5) * 2, pz = z + (r() - 0.5) * 2, t = landAt(px, pz), D = DENS[t], s = r();
    const clump = 0.25 + 1.5 * smooth(0.38, 0.62, fbm(px * 0.05 + 7, pz * 0.05 - 3)), area = 2.2 * 2.2 / 100;
    if(r() < D[0] * area * clump && ok(px, pz, 3)){ const kind = TREE[t], y = height(px, pz), sc = 0.8 + s * 0.6;
      if(kind === "cactus") T.cactus.push([px, y, pz, sc, 0x5a8a3a]);
      else if(kind === "dead" || kind === "charred") T.dead.push([px, y, pz, sc, kind === "charred" ? 0x2a2420 : t === "gloom" ? 0x3a3438 : 0x4a3e32]);
      else { T.trunk.push([px, y, pz, sc, kind === "birch" ? 0xe8e4d8 : kind === "violet" ? 0x3a2a3a : 0x6b4a2e]);
        if(kind === "pine" || kind === "snowpine") T.cone.push([px, y, pz, sc, kind === "snowpine" ? 0xdfe8e4 : t === "rock" || t === "highland" ? 0x3a5a3a : 0x2a5a34]);
        else T.crown.push([px, y, pz, sc, kind === "birch" ? 0x9ac860 : kind === "violet" ? 0x7a5aa8 : 0x4f8f3a]); }
      solid(px, pz, 0.45 * sc); continue; }
    if(r() < D[1] * area && ok(px, pz, 2.5)){ const sc = 0.6 + s; T.rock.push([px, height(px, pz) + 0.2, pz, sc, ROCK_COL[t] || 0x8a8d91]); solid(px, pz, 0.75 * sc, s > 0.55); continue; }
    if(D[2] && r() < D[2] * area && ok(px, pz, 2.5)){ const sc = 0.7 + s * 0.8; T.spike.push([px, height(px, pz), pz, sc, t === "ash" ? 0x1a1420 : 0xbfe6ff]); solid(px, pz, 0.45 * sc); continue; }
    if(t === "swamp"){ const h = height(px, pz); if(h > 0.05 && h < 0.7 && r() < 0.5) T.reed.push([px, h, pz, 0.7 + s * 0.8, 0x8a8a4a]); }
  }
  const pineGeo = new THREE.ConeGeometry(1.3, 3.6, 7); pineGeo.translate(0, 3.1, 0);
  const crownGeo = new THREE.IcosahedronGeometry(1.6, 0); crownGeo.translate(0, 2.6, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.6, 6); trunkGeo.translate(0, 0.8, 0);
  const deadGeo = merge([[new THREE.CylinderGeometry(0.14, 0.26, 3.2, 5), 0, 1.6, 0], [new THREE.CylinderGeometry(0.06, 0.1, 1.4, 4), 0.45, 2.4, 0, 0, 0, -0.8], [new THREE.CylinderGeometry(0.05, 0.09, 1.1, 4), -0.35, 2.9, 0.1, 0.3, 0, 0.9]]);
  const cactusGeo = merge([[new THREE.CylinderGeometry(0.28, 0.32, 2.4, 7), 0, 1.2, 0], [new THREE.CylinderGeometry(0.16, 0.18, 0.9, 6), 0.55, 1.5, 0], [new THREE.CylinderGeometry(0.16, 0.18, 0.5, 6), 0.4, 1.1, 0, 0, 0, 1.57],
    [new THREE.CylinderGeometry(0.15, 0.17, 0.7, 6), -0.5, 1.8, 0], [new THREE.CylinderGeometry(0.15, 0.17, 0.4, 6), -0.36, 1.5, 0, 0, 0, 1.57]]);
  const rockGeo = new THREE.DodecahedronGeometry(0.9, 0), spikeGeo = new THREE.ConeGeometry(0.45, 2.6, 5); spikeGeo.translate(0, 1.2, 0);
  const reedGeo = new THREE.ConeGeometry(0.08, 1.3, 4); reedGeo.translate(0, 0.65, 0);
  const inst = (geo, list, fn, shadow = true) => { if(!list.length) return; const im = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({flatShading: true}), list.length), o = new THREE.Object3D();
    list.forEach((p, i) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[0] * 7.3 + p[2], 0); o.scale.setScalar(p[3]); if(fn) fn(o, p); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, c.setHex(p[4]).offsetHSL(0, 0, ((i * 37) % 10 - 5) * 0.006)); });
    im.castShadow = shadow; im.receiveShadow = true; SCENE.add(im); };
  inst(trunkGeo, T.trunk); inst(pineGeo, T.cone); inst(crownGeo, T.crown, (o, p) => o.scale.set(p[3] * 1.1, p[3] * 0.95, p[3] * 1.1)); inst(deadGeo, T.dead); inst(cactusGeo, T.cactus);
  inst(rockGeo, T.rock, (o, p) => { o.scale.set(p[3], p[3] * 0.7, p[3] * 0.85); o.rotation.set(p[3] * 3, p[0], p[3] * 2); }); inst(spikeGeo, T.spike, (o, p) => o.rotation.set((p[0] % 1) * 0.3, p[2], 0)); inst(reedGeo, T.reed, null, false);
}

export function buildWorld(scene){
  SCENE = scene;
  const terrain = buildTerrain(); scene.add(terrain);
  const water = buildWater(); scene.add(water);
  for(const h of HL){ if(h.kind === "town") buildTown(h); else if(h.kind === "camp") buildCamp(h); else buildCity(h); }
  for(const [id, l] of Object.entries(LAIRS)) buildLair(id, l);
  for(const [id, e] of Object.entries(EXPLORE)) buildPlace(id, e);
  for(const [id, D] of Object.entries(DG_DOORS)) buildDoor(id, D);
  // graves around the Draug King's crypt in Mistmarsh
  { const r = rng(77), D = DG_DOORS.d_crypt; for(let i = 0; i < 18; i++){ const x = D.x + (r() - 0.5) * 40, z = D.z - 8 - r() * 26; if(height(x, z) < 0.6 || featureAt(x, z) || roadDist(x, z) < 2.5) continue; stone(x, z, 0.8, 1.1, 0.25, 0x6a6a6e, r() * 0.4, false); } }
  buildProps();
  resetColliderBuckets();
  return {terrain, water};
}

// line of sight: hills, cliffs, buildings and big rocks block it (trees do not)
export function los(ax, ay, az, bx, by, bz){
  if(ax > 500 || bx > 500) return ax > 500 && bx > 500 && dgLos(ax, az, bx, bz);          // inside a dungeon only its walls count
  const d = Math.hypot(bx - ax, bz - az), n = Math.max(2, Math.ceil(d / 0.6));
  for(let i = 1; i < n; i++){ const t = i / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = ay + (by - ay) * t;
    if(height(x, z) > y) return false;
    for(const c of nearColliders(x, z)){ if(!c.los) continue; const dx = x - c.x, dz = z - c.z; if(dx*dx + dz*dz < c.r * c.r * 0.8) return false; } }
  return true; }
