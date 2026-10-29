// Animal models (CC0, Quaternius Animal Pack Vol. 2): skinned and animated, used for the hunter's wolf and the druid's Wolf and Leopard Forms.
// Converted from FBX to glTF for the game. If a file is missing, the shape-built animals in models.js are used.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/animals/";
const FILES = ["wolf", "cat"];
const assets = {}; let READY = false;
export async function preloadBeasts(){ const got = await Promise.all(FILES.map(n => load(A + n + ".gltf"))); FILES.forEach((n, i) => assets[n] = got[i]); READY = true; }

// file, length in the world (nose to tail), and colours per material (by race for the druid forms)
const KINDS = {
  petWolf:  {file: "wolf", len: 2.2, col: {Wolf: 0x8a7560}},
  wolfForm: {file: "wolf", len: 2.5, col: {Wolf: 0x56616c}, race: {elf: {Wolf: 0xd6dbe2}}},
  leopard:  {file: "cat", len: 2.6, col: {Grey: 0xc99a3c, White: 0xefe0b8, Pink: 0x4a3226}, race: {elf: {Grey: 0xdedad0, White: 0xf6f3ec, Pink: 0x5a5660}}},
};
const matCache = new Map();
const matFor = (base, hex) => { const k = base.uuid + hex; if(!matCache.has(k)){ const m = base.clone(); m.color.setHex(hex); matCache.set(k, m); } return matCache.get(k); };

export function makeAnimal(kind, race){
  const K = KINDS[kind]; if(!READY || !K || !assets[K.file]) return null;
  const asset = assets[K.file], model = build(asset), col = Object.assign({}, K.col, (K.race || {})[race] || {});
  for(const m of model.userData.meshes) m.material = matFor(m.material, col[m.material.name] ?? 0x9a9a9a);
  // size and facing: measured once in the rest pose, then centred with the nose towards +z
  model.updateMatrixWorld(true); const b = new THREE.Box3(); for(const m of model.userData.meshes) b.expandByObject(m);
  const s = K.len / ((b.max.x - b.min.x) || 1), inner = new THREE.Group(), g = new THREE.Group();
  model.scale.setScalar(s); model.position.set(-(b.min.x + b.max.x) / 2 * s, -b.min.y * s, -(b.min.z + b.max.z) / 2 * s);
  inner.add(model); inner.rotation.y = -Math.PI / 2; g.add(inner);
  const mixer = new THREE.AnimationMixer(model), clip = n => asset.clips.find(c => c.name === n);
  const idle = mixer.clipAction(clip("Idle")), walkA = mixer.clipAction(clip("Walking"));
  idle.play(); walkA.play(); walkA.setEffectiveWeight(0); let w = 0, last = performance.now();
  g.userData.animate = (walk, moving, attack) => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    w += ((moving ? 1 : 0) - w) * Math.min(1, dt * 8); walkA.setEffectiveWeight(w); idle.setEffectiveWeight(1 - w); walkA.timeScale = 1.7;
    mixer.update(dt);
    const a = attack > 0 ? Math.sin(attack * Math.PI) : 0;                                         // lunge and bite
    inner.position.z = a * 0.5; inner.rotation.x = a * 0.18; inner.position.y = a * 0.12;
  };
  g.userData.animate(0, false, 0);
  g.userData.height = (b.max.y - b.min.y) * s + 0.3; g.userData.animal = true;
  return g;
}
