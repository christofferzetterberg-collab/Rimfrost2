// Trees, rocks and bushes from the KayKit Forest Nature Pack (CC0, Kay Lousberg), drawn as instanced meshes.
// The leaves are recoloured per kind of tree (birch, violet trees, snowy pines). If the files are missing, world.js keeps its own shapes.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/nature/";
const SETS = {
  oak: ["Tree_1_A", "Tree_1_B", "Tree_7_A", "Tree_2_A", "Tree_2_B"], birch: ["Tree_6_A", "Tree_6_B", "Tree_2_A"], violet: ["Tree_7_A", "Tree_1_A", "Tree_7_B"],
  pine: ["Tree_5_A", "Tree_5_B", "Tree_4_A", "Tree_5_D"], snowpine: ["Tree_5_A", "Tree_5_B", "Tree_5_D"],
  dead: ["Tree_Bare_1_A", "Tree_Bare_1_B", "Tree_Bare_2_A", "Tree_Bare_2_B"],
  rock: ["Rock_1_E", "Rock_3_E", "Rock_2_C", "Rock_6_C", "Rock_3_G", "Rock_5_C"], bush: ["Bush_1_C", "Bush_2_C", "Bush_3_A", "Bush_4_C", "Bush_1_E"]
};
// leaf colours: [new hue, saturation, lightness factor, lightness add] for the green parts of the texture
const LEAVES = {birch: [78, 0.55, 1.05, 0.06], violet: [282, 0.4, 0.85, 0.02], snowpine: [200, 0.12, 0.35, 0.62]};
const assets = {}, textures = {}; let READY = false;
export const natureReady = () => READY;
export async function preloadNature(){
  const names = [...new Set(Object.values(SETS).flat())];
  const got = await Promise.all(names.map(n => load(A + n + "_Color1.gltf"))); names.forEach((n, i) => assets[n] = got[i]); READY = true;
}
function rgb2hsl(r, g, b){ r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if(mx !== mn){ const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function leafTexture(base, kind){
  const L = LEAVES[kind]; if(!L || !base || !base.image) return base; const key = kind; if(textures[key]) return textures[key];
  const img = base.image, cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data, c = new THREE.Color();
  for(let p = 0; p < px.length; p += 4){ const [h, s, l] = rgb2hsl(px[p], px[p + 1], px[p + 2]); if(h < 65 || h > 170 || s < 0.2) continue;
    c.setHSL(L[0] / 360, L[1], Math.min(0.97, l * L[2] + L[3]), THREE.SRGBColorSpace); const o = c.getRGB({r: 0, g: 0, b: 0}, THREE.SRGBColorSpace); px[p] = o.r * 255; px[p + 1] = o.g * 255; px[p + 2] = o.b * 255; }
  g.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(cv); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.magFilter = base.magFilter; return textures[key] = t; }
// one model as merged geometries (one per material), with its node transforms baked in
const merged = {}, CHUNK = 48;
function parts(name){
  if(merged[name]) return merged[name];
  const root = build(assets[name]); root.updateMatrixWorld(true); const byMat = new Map();
  root.traverse(o => { if(!o.isMesh) return; const gg = o.geometry.clone(); gg.applyMatrix4(o.matrixWorld); if(!byMat.has(o.material)) byMat.set(o.material, []); byMat.get(o.material).push(gg); });
  const out = []; for(const [mat, list] of byMat) out.push({geo: mergeGeos(list), mat});
  const b = new THREE.Box3(); for(const p of out){ p.geo.computeBoundingBox(); b.union(p.geo.boundingBox); }
  return merged[name] = {parts: out, box: b};
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
// list: [x, y, z, scale, colour (hex, multiplies the texture; null = white)]; kind picks the models; size: target size at scale 1 (height for trees, width for rocks)
export function natureInstances(scene, kind, list, {size = null, byWidth = false, shadow = true, bright = 1} = {}){
  if(!READY || !list.length) return false;
  const names = SETS[kind === "charred" ? "dead" : kind === "ice" ? "rock" : kind] || SETS.oak, groups = names.map(() => []);
  list.forEach((p, i) => groups[Math.floor(Math.abs(Math.sin(p[0] * 12.9898 + p[2] * 78.233) * 43758.5453) % 1 * names.length)].push(p));
  const o = new THREE.Object3D(), c = new THREE.Color();
  names.forEach((n, k) => { const pts = groups[k]; if(!pts.length) return; const P = parts(n), sz = P.box.getSize(new THREE.Vector3());
    const norm = size ? size / ((byWidth ? Math.max(sz.x, sz.z) : sz.y) || 1) : 1;
    // split into square chunks, so only the chunks on screen are drawn
    const chunks = new Map(); pts.forEach((p, i) => { const key = Math.floor(p[0] / CHUNK) + "," + Math.floor(p[2] / CHUNK); if(!chunks.has(key)) chunks.set(key, []); chunks.get(key).push([p, i]); });
    for(const {geo, mat} of P.parts){ const m = mat.clone(); m.map = leafTexture(mat.map, kind);
      for(const list of chunks.values()){ const im = new THREE.InstancedMesh(geo, m, list.length);
        list.forEach(([p, i], j) => { o.position.set(p[0], p[1], p[2]); o.rotation.set(0, p[0] * 7.3 + p[2], 0); o.scale.setScalar(p[3] * norm); o.updateMatrix(); im.setMatrixAt(j, o.matrix);
          c.setHex(p[4] == null ? 0xffffff : p[4]).multiplyScalar(bright * (1 + ((i * 37) % 10 - 5) * 0.012)); im.setColorAt(j, c); });
        im.computeBoundingSphere(); im.castShadow = shadow; im.receiveShadow = true; scene.add(im); } } });
  return true;
}
