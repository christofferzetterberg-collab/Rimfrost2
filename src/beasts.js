// Animal models (CC0, Quaternius): skinned and animated, used for the hunter's wolf and the druid's Wolf and Leopard Forms.
// If a file is missing, the shape-built animals in models.js are used.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/animals/";
const FILES = ["wolf2", "cat", "fox", "deer", "stag", "bear", "boar", "beetle", "hare", "scorpion", "spider", "rat", "dragon", "goblin"];
const FACE_Z = new Set(["spider", "dragon", "goblin"]);                    // models whose nose already points to +z (wide legs or wings)
const assets = {}; let READY = false;
export async function preloadBeasts(){ const got = await Promise.all(FILES.map(n => load(A + n + ".gltf"))); FILES.forEach((n, i) => assets[n] = got[i]); READY = true; }

// the animations each file has (move: when walking or running, hit: an attack, played once)
const CLIPS = {wolf2: {idle: "Idle", move: "Gallop", hit: "Attack", death: "Death", speed: 1.1}, fox: {idle: "Idle", move: "Gallop", hit: "Attack", death: "Death", speed: 1.1},
  deer: {idle: "Idle", move: "Gallop", hit: "Attack_Headbutt", death: "Death", speed: 1}, stag: {idle: "Idle", move: "Gallop", hit: "Attack_Headbutt", death: "Death", speed: 1}, cat: {idle: "Idle", move: "Walking", speed: 1.7},
  bear: {idle: "Idle", move: "Walk", hit: "Attack", death: "Death", speed: 1}, boar: {idle: "Idle", move: "Walk", hit: "Attack", death: "Death", speed: 1.2},
  beetle: {idle: "Idle", move: "Walk", hit: "Attack", death: "Death", speed: 1.3}, hare: {idle: "Idle", move: "Walk", hit: "Attack", death: "Death", speed: 1},
  scorpion: {idle: "Idle", move: "Walk", hit: "Attack", death: "Death", speed: 1.2}, spider: {idle: "Spider_Idle", move: "Spider_Walk", hit: "Spider_Attack", death: "Spider_Death", speed: 1.3},
  rat: {idle: "Rat_Idle", move: "Rat_Run", hit: "Rat_Attack", death: "Rat_Death", speed: 1}, dragon: {idle: "Dragon_Flying", move: "Dragon_Flying", hit: "Dragon_Attack", death: "Dragon_Death", speed: 1},
  goblin: {idle: "Idle", move: "Run", hit: "Attack", death: "Death", speed: 1}};
// file, length in the world (nose to tail), and colours per material (by race for the druid forms)
const KINDS = {
  petWolf:  {file: "wolf2", len: 2.2, col: {Main: 0x7a6650, Main_Light: 0xb8a68a}},
  wolfForm: {file: "wolf2", len: 2.5, col: {Main: 0x4c5662, Main_Light: 0x8e99a4}, race: {elf: {Main: 0xc9cfd8, Main_Light: 0xf2f4f7}}},
  bearForm: {file: "bear", len: 2.7}, petBear: {file: "bear", len: 2.4},
  leopard:  {file: "cat", len: 2.6, col: {Grey: 0xc99a3c, White: 0xefe0b8, Pink: 0x4a3226}, race: {elf: {Grey: 0xdedad0, White: 0xf6f3ec, Pink: 0x5a5660}}},
};
const matCache = new Map();
const matFor = (base, hex, flat) => { if(hex == null) return base; const k = base.uuid + hex + (flat ? "f" : ""); if(!matCache.has(k)){ const m = base.clone(); m.color.setHex(hex); if(flat){ m.map = null; m.needsUpdate = true; } matCache.set(k, m); } return matCache.get(k); };

// kind: one of KINDS, or a monster: {file, len, col}
export function makeAnimal(kind, race){
  const K = typeof kind === "object" ? kind : KINDS[kind]; if(!READY || !K || !assets[K.file]) return null;
  const asset = assets[K.file], C = CLIPS[K.file], model = build(asset), col = Object.assign({}, K.col, (K.race || {})[race] || {});
  for(const m of model.userData.meshes) m.material = matFor(m.material, col[m.material.name] ?? col["*"], K.flat);
  // size and facing: measured once in the rest pose, then centred with the nose towards +z
  model.updateMatrixWorld(true); const b = new THREE.Box3(); for(const m of model.userData.meshes) b.expandByObject(m);
  const alongX = !FACE_Z.has(K.file) && b.max.x - b.min.x > b.max.z - b.min.z, s = K.height ? K.height / ((b.max.y - b.min.y) || 1) : K.len / ((alongX ? b.max.x - b.min.x : b.max.z - b.min.z) || 1), inner = new THREE.Group(), g = new THREE.Group();
  model.scale.setScalar(s); model.position.set(-(b.min.x + b.max.x) / 2 * s, -b.min.y * s, -(b.min.z + b.max.z) / 2 * s);
  inner.add(model); inner.rotation.y = alongX ? -Math.PI / 2 : 0; g.add(inner);
  const mixer = new THREE.AnimationMixer(model), clip = n => asset.clips.find(c => c.name === n);
  const idle = mixer.clipAction(clip(C.idle)), moveA = mixer.clipAction(clip(C.move)), hitA = C.hit && clip(C.hit) ? mixer.clipAction(clip(C.hit)) : null, dieA = C.death && clip(C.death) ? mixer.clipAction(clip(C.death)) : null;
  idle.play(); moveA.play(); moveA.setEffectiveWeight(0); moveA.timeScale = C.speed;
  if(hitA){ hitA.setLoop(THREE.LoopOnce); hitA.clampWhenFinished = false; } if(dieA){ dieA.setLoop(THREE.LoopOnce); dieA.clampWhenFinished = true; }
  let w = 0, last = performance.now(), prevAtk = 0, dead = false;
  g.userData.animate = (walk, moving, attack, pose, o = {}) => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now;
    if(dieA && !!o.dead !== dead){ dead = !!o.dead; if(dead){ dieA.reset(); dieA.setEffectiveWeight(1); dieA.fadeIn(0.1); dieA.play(); } else dieA.stop(); }
    if(dead){ mixer.update(dt); return; }
    w += ((moving ? 1 : 0) - w) * Math.min(1, dt * 8); moveA.setEffectiveWeight(w); idle.setEffectiveWeight(1 - w);
    if(hitA && attack > 0.9 && prevAtk < 0.5){ hitA.reset(); hitA.setEffectiveWeight(1); hitA.fadeIn(0.05); hitA.play(); }
    prevAtk = attack; mixer.update(dt);
    const a = attack > 0 ? Math.sin(attack * Math.PI) : 0;                                         // lunge forward
    inner.position.z = a * (hitA ? 0.3 : 0.5); if(!hitA){ inner.rotation.x = a * 0.18; inner.position.y = a * 0.12; }
  };
  g.userData.animate(0, false, 0);
  g.userData.height = (b.max.y - b.min.y) * s + 0.3; g.userData.animal = true; g.userData.ownDeath = !!dieA;
  return g;
}

// monsters: an animal model in the monster's colour (light parts a paler shade of it)
const lighter = (c, k) => new THREE.Color(c).lerp(new THREE.Color(0xffffff), k).getHex();
const darker = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
// opts: {height} to size by height instead of length, {flat} to colour without the texture (pale bears)
export function makeMobAnimal(file, len, color, opts = {}){
  if(!READY || !assets[file]) return null;
  const c = color, col = c == null ? {} : file === "fox" ? {Main: c, Main_Light: lighter(c, 0.5)} : file === "spider" ? {Material: darker(c, 0.7)} : file === "scorpion" ? {"1A1A1A": c}
    : file === "dragon" ? {Main: c, Belly: lighter(c, 0.45), Wings: darker(c, 0.55)} : file === "wolf2" ? {Main: c, Main_Light: lighter(c, 0.45)} : {"*": opts.flat ? c : lighter(c, 0.35)};
  return makeAnimal({file, len, col, height: opts.height, flat: opts.flat});
}
