// Dungeon walls, floors, pillars and props from the KayKit Dungeon Pack (CC0, Kay Lousberg), drawn as instanced meshes.
// If the files are missing, dungeon.js keeps its own shapes.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/dungeon/";
export const KIT = ["wall", "wall_cracked", "wall_broken", "wall_inset_candles", "floor_tile_large", "floor_tile_large_rocks", "floor_dirt_large", "floor_dirt_large_rocky",
  "pillar", "pillar_decorated", "barrel_large", "barrel_small_stack", "crates_stacked", "box_stacked", "chest", "rubble_half", "rocks", "rocks_gold", "bucket_pickaxes",
  "sword_shield_broken", "shelves_decorated", "candle_triple"];
// the look of each dungeon: floor and wall models (the first is the most common), tints and props along the walls
export const DG_LOOK = {
  d_mine:   {floor: ["floor_dirt_large", "floor_dirt_large_rocky"], wall: ["wall", "wall_cracked", "wall_broken"], pillar: "pillar", floorTint: 0xd8c8b0, wallTint: 0xf4e4d0,
             props: ["barrel_small_stack", "crates_stacked", "bucket_pickaxes", "rocks_gold", "rocks", "barrel_large"]},
  d_temple: {floor: ["floor_tile_large", "floor_tile_large_rocks"], wall: ["wall", "wall_cracked", "wall_inset_candles"], pillar: "pillar_decorated", floorTint: 0xa8c8b8, wallTint: 0xdcf0e4,
             props: ["rubble_half", "candle_triple", "sword_shield_broken", "rocks"]},
  d_forge:  {floor: ["floor_tile_large", "floor_tile_large_rocks"], wall: ["wall", "wall_cracked"], pillar: "pillar", floorTint: 0xc89a88, wallTint: 0xf0c8b8,
             props: ["barrel_large", "box_stacked", "sword_shield_broken", "crates_stacked", "rocks"]},
  d_vault:  {floor: ["floor_tile_large", "floor_tile_large_rocks"], wall: ["wall", "wall_cracked"], pillar: "pillar_decorated", floorTint: 0xc8e0ff, wallTint: 0xeaf4ff,
             props: ["chest", "crates_stacked", "rocks", "shelves_decorated"]},
  d_crypt:  {floor: ["floor_tile_large", "floor_tile_large_rocks"], wall: ["wall", "wall_inset_candles", "wall_cracked", "wall_broken"], pillar: "pillar_decorated", floorTint: 0xa8a4a0, wallTint: 0xdcd8e0,
             props: ["candle_triple", "rubble_half", "sword_shield_broken", "chest", "shelves_decorated"]}
};
const assets = {}; let READY = false;
export const kitReady = () => READY;
export async function preloadKit(){
  const got = await Promise.all(KIT.map(n => load(A + n + ".gltf").catch(() => null)));
  KIT.forEach((n, i) => { if(got[i]) assets[n] = got[i]; }); READY = KIT.every(n => assets[n]);
}
// one model as merged geometries (one per material), with its node transforms baked in
const merged = {};
function parts(name){
  if(merged[name]) return merged[name];
  const root = build(assets[name]); root.updateMatrixWorld(true); const byMat = new Map();
  root.traverse(o => { if(!o.isMesh) return; const gg = o.geometry.clone(); gg.applyMatrix4(o.matrixWorld); if(!byMat.has(o.material)) byMat.set(o.material, []); byMat.get(o.material).push(gg); });
  const out = []; for(const [mat, list] of byMat) out.push({geo: mergeGeos(list), mat});
  return merged[name] = out;
}
function mergeGeos(list){
  if(list.length === 1) return list[0];
  const attrs = ["position", "normal", "uv"], data = {}, idx = []; let off = 0;
  for(const a of attrs) data[a] = [];
  for(const gg of list){ const n = gg.attributes.position.count;
    for(const a of attrs){ const at = gg.attributes[a]; if(at) data[a].push(...at.array); else data[a].push(...new Array(n * (a === "uv" ? 2 : 3)).fill(0)); }
    if(gg.index) for(const i of gg.index.array) idx.push(i + off); else for(let i = 0; i < n; i++) idx.push(i + off); off += n; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(data.position, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(data.normal, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(data.uv, 2)); g.setIndex(idx); return g;
}
// list: [{x, y, z, ry, s (scale, or [sx, sy, sz]), c (colour that multiplies the texture)}]
const lifted = new Map();   // walls and pillars glow a little, so their sides are not lost in the dark
const liftMat = m => { if(!lifted.has(m)){ const c = m.clone(); c.emissive = new THREE.Color(0x3a3a3a); c.emissiveMap = m.map; lifted.set(m, c); } return lifted.get(m); };
export function kitInstances(group, name, list, {shadow = true, receive = true} = {}){
  if(!READY || !assets[name] || !list.length) return [];
  const o = new THREE.Object3D(), col = new THREE.Color(), out = [];
  for(const {geo, mat} of parts(name)){ const im = new THREE.InstancedMesh(geo, /^(wall|pillar)/.test(name) ? liftMat(mat) : mat, list.length);
    list.forEach((p, k) => { o.position.set(p.x, p.y, p.z); o.rotation.set(0, p.ry || 0, 0); if(Array.isArray(p.s)) o.scale.set(...p.s); else o.scale.setScalar(p.s ?? 1); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
      im.setColorAt(k, col.setHex(p.c ?? 0xffffff)); });
    im.computeBoundingSphere(); im.castShadow = shadow; im.receiveShadow = receive; group.add(im); out.push(im); }
  return out;
}
