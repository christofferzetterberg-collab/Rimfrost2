// Houses, towers, tents, walls and small props from the KayKit Medieval Hexagon Pack (CC0, Kay Lousberg).
// If the files are missing, world.js keeps its own shapes.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/buildings/";
const b = (n, c) => "building_" + n + "_" + c;
// the models each kind of settlement uses
export const LOOKS = {
  human:  [b("home_A", "blue"), b("home_B", "red"), b("tavern", "blue"), b("home_A", "red"), b("blacksmith", "red"), b("home_B", "blue"), b("church", "blue")],
  city:   [b("home_A", "blue"), b("home_B", "blue"), b("tavern", "red"), b("home_A", "red"), b("home_B", "red"), b("blacksmith", "blue"), b("church", "red"), b("tavern", "blue")],
  elf:    [b("home_A", "green"), b("church", "green"), b("home_B", "green"), b("tavern", "green")],
  dwarf:  [b("barracks", "yellow"), b("workshop", "red"), b("mine", "yellow"), b("blacksmith", "yellow"), b("barracks", "red"), b("workshop", "yellow")],
  orc:    [b("tent", "red"), b("tent", "yellow"), b("watchtower", "red"), b("tent", "red"), b("watchtower", "yellow")],
  undead: [b("home_A", "blue"), "building_destroyed", b("church", "blue"), b("home_B", "red")],
  camp:   [b("tent", "yellow"), b("tent", "red")],
  witch:  [b("home_A", "green")]
};
export const PROPS = ["barrel", "crate_A_big", "crate_open", "haybale", "sack", "wheelbarrow", "resource_lumber", "bucket_water", "trough", "weaponrack"];
const EXTRA = ["wall_straight", b("tower_A", "blue")];
const assets = {}; let READY = false;
export const buildingsReady = () => READY;
export async function preloadBuildings(){
  const names = [...new Set([...Object.values(LOOKS).flat(), ...PROPS, ...EXTRA])];
  const got = await Promise.all(names.map(n => load(A + n + ".gltf").catch(() => null)));
  names.forEach((n, i) => { if(got[i]) assets[n] = got[i]; }); READY = names.every(n => assets[n]);
}
// a faded, greyish copy of the texture (the undead towns)
let grimTex = null;
function grim(base){
  if(grimTex || !base || !base.image) return grimTex || base; const img = base.image, cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data;
  for(let p = 0; p < px.length; p += 4){ const l = (px[p] * 0.3 + px[p + 1] * 0.55 + px[p + 2] * 0.15); px[p] = (l + (px[p] - l) * 0.22) * 0.82 + 6; px[p + 1] = (l + (px[p + 1] - l) * 0.22) * 0.78; px[p + 2] = (l + (px[p + 2] - l) * 0.22) * 0.86 + 10; }
  g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(cv); t.flipY = base.flipY; t.colorSpace = base.colorSpace; t.magFilter = base.magFilter; t.minFilter = base.minFilter; t.wrapS = base.wrapS; t.wrapT = base.wrapT; return grimTex = t; }
const sizes = {};
function sizeOf(name){ if(sizes[name]) return sizes[name]; const m = build(assets[name]); m.updateMatrixWorld(true); return sizes[name] = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()); }
// one model as a group, scaled so its widest side is `width` (or by `scale`); tint multiplies the texture (dark towns, the witch's hut)
export function buildingModel(name, {width = null, scale = null, height = null, tint = null, faded = false, shadow = true} = {}){
  if(!assets[name]) return null;
  const m = build(assets[name]), s = sizeOf(name);
  const k = scale ?? (width ? width / Math.max(s.x, s.z) : 1);
  m.scale.set(k, height ? height / s.y : k, k);
  m.traverse(o => { if(!o.isMesh) return; o.frustumCulled = true; o.castShadow = shadow; o.receiveShadow = true; if(tint != null || faded){ o.material = o.material.clone(); if(tint != null) o.material.color.setHex(tint); if(faded) o.material.map = grim(o.material.map); } });
  const g = new THREE.Group(); g.add(m); g.userData.size = new THREE.Vector3(s.x * k, s.y * (height ? height / s.y : k), s.z * k); return g;
}
// a stretched model (walls): sx along its length, sy up, sz across
export function stretchedModel(name, sx, sy, sz, tint = null){
  if(!assets[name]) return null; const m = build(assets[name]); m.scale.set(sx, sy, sz);
  m.traverse(o => { if(!o.isMesh) return; o.frustumCulled = true; o.castShadow = true; o.receiveShadow = true; if(tint != null){ o.material = o.material.clone(); o.material.color.setHex(tint); } });
  const g = new THREE.Group(); g.add(m); return g;
}
