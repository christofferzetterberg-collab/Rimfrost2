// Low-poly characters and monsters built from simple shapes. Each model has an animate(walk, moving, attack) function.
import * as THREE from "three";

const mats = new Map();
const flat = (color) => { if(!mats.has(color)) mats.set(color, new THREE.MeshLambertMaterial({color, flatShading: true})); return mats.get(color); };
function part(geo, color, x, y, z){ const m = new THREE.Mesh(geo, flat(color)); m.position.set(x, y, z); m.castShadow = true; return m; }
function pivot(x, y, z, ...children){ const g = new THREE.Group(); g.position.set(x, y, z); if(children.length) g.add(...children); return g; }

// a person: the player, bandits and (later) townsfolk.
// Options: colours, weapon ("sword" | "staff" | "bow" | "hammer" | "dagger"), ears (elf), tusks (orc), beard (dwarf), stocky / gaunt body, robe.
export function makeHumanoid(c = {}){
  const col = Object.assign({skin: 0xe0b48c, shirt: 0x3d6fa8, pants: 0x4a3a2a, hair: 0x6a4426, boots: 0x2e2620, cape: 0x8f2f2f, weapon: 0xb8bec4, weaponType: "sword"}, c);
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const torso = part(new THREE.BoxGeometry(0.62, 0.72, 0.36), col.shirt, 0, 1.22, 0);
  const head = part(new THREE.BoxGeometry(0.42, 0.42, 0.42), col.skin, 0, 1.82, 0);
  const hat = part(new THREE.BoxGeometry(0.46, 0.14, 0.46), col.hair, 0, 2.06, 0);
  hat.add(part(new THREE.BoxGeometry(0.46, 0.3, 0.1), col.hair, 0, -0.18, -0.19));                   // hair at the back
  const legCol = col.robe ? col.shirt : col.pants;
  const leg = (x) => pivot(x, 0.86, 0, part(new THREE.BoxGeometry(0.24, 0.8, 0.24), legCol, 0, -0.4, 0), part(new THREE.BoxGeometry(0.27, 0.16, 0.36), col.boots, 0, -0.76, 0.05));
  const arm = (x) => pivot(x, 1.54, 0, part(new THREE.BoxGeometry(0.2, 0.7, 0.2), col.shirt, 0, -0.35, 0), part(new THREE.BoxGeometry(0.18, 0.16, 0.18), col.gloves || col.skin, 0, -0.74, 0));
  const legL = leg(-0.15), legR = leg(0.15), armL = arm(-0.42), armR = arm(0.42);
  const wt = col.weaponType;
  if(wt === "sword"){ const w = part(new THREE.BoxGeometry(0.08, 0.95, 0.12), col.weapon, 0, -0.68, 0.45); w.rotation.x = Math.PI / 2; armR.add(w); }
  if(wt === "dagger"){ const w = part(new THREE.BoxGeometry(0.06, 0.5, 0.1), col.weapon, 0, -0.74, 0.25); w.rotation.x = Math.PI / 2; armR.add(w); }
  if(wt === "hammer"){ const w = part(new THREE.BoxGeometry(0.07, 0.9, 0.07), 0x6b4a2e, 0, -0.72, 0.4); w.rotation.x = Math.PI / 2; w.add(part(new THREE.BoxGeometry(0.34, 0.24, 0.24), col.weapon, 0, 0.45, 0)); armR.add(w); }
  if(wt === "staff"){ const w = part(new THREE.CylinderGeometry(0.04, 0.05, 1.9, 6), 0x7a5a3a, 0, -0.75, 0.12); w.add(part(new THREE.OctahedronGeometry(0.13, 0), col.weapon, 0, 0.98, 0)); armR.add(w); }
  if(wt === "axe"){ const w = part(new THREE.BoxGeometry(0.07, 0.95, 0.07), 0x6b4a2e, 0, -0.72, 0.42); w.rotation.x = Math.PI / 2; const head = part(new THREE.BoxGeometry(0.06, 0.34, 0.3), col.weapon, 0, 0.36, 0.14); w.add(head); armR.add(w); }
  if(wt === "mace"){ const w = part(new THREE.BoxGeometry(0.07, 0.8, 0.07), 0x6b4a2e, 0, -0.72, 0.38); w.rotation.x = Math.PI / 2; w.add(part(new THREE.DodecahedronGeometry(0.17, 0), col.weapon, 0, 0.42, 0)); armR.add(w); }
  if(wt === "wand"){ const w = part(new THREE.CylinderGeometry(0.03, 0.035, 0.5, 6), 0x5a3a2a, 0, -0.75, 0.22); w.rotation.x = Math.PI / 2; w.add(part(new THREE.OctahedronGeometry(0.08, 0), col.weapon, 0, 0.28, 0)); armR.add(w); }
  if(col.offhand === "shield"){ const sh = part(new THREE.BoxGeometry(0.08, 0.62, 0.52), col.offColor || 0x8a8f96, -0.1, -0.5, 0.12); sh.add(part(new THREE.BoxGeometry(0.1, 0.18, 0.18), col.offTrim || 0xd8b04a, -0.01, 0, 0)); armL.add(sh); }
  if(col.offhand === "tome"){ const tb = part(new THREE.BoxGeometry(0.1, 0.3, 0.24), col.offColor || 0x5a2a6a, 0, -0.8, 0.12); armL.add(tb); }
  if(wt === "bow"){ const w = part(new THREE.TorusGeometry(0.5, 0.03, 4, 12, Math.PI), 0x7a5a3a, 0, -0.72, 0.12); w.rotation.set(0, Math.PI / 2, Math.PI / 2); armL.add(w); }
  body.add(torso, head, hat, legL, legR, armL, armR);
  if(col.robe) body.add(part(new THREE.BoxGeometry(0.66, 0.5, 0.4), col.shirt, 0, 0.72, 0));
  if(col.belt) body.add(part(new THREE.BoxGeometry(0.64, 0.1, 0.38), col.belt, 0, 0.9, 0));
  if(col.cape) body.add(part(new THREE.BoxGeometry(0.58, 0.9, 0.05), col.cape, 0, 1.15, -0.21));
  if(col.helm){ const H = col.helm; if(H.type === "plate"){ hat.visible = false; body.add(part(new THREE.BoxGeometry(0.5, 0.36, 0.5), H.color, 0, 1.94, 0)); body.add(part(new THREE.BoxGeometry(0.06, 0.3, 0.1), H.color, 0, 1.8, 0.24)); }
    else if(H.type === "leather"){ hat.visible = false; body.add(part(new THREE.BoxGeometry(0.48, 0.18, 0.48), H.color, 0, 2.06, 0)); body.add(part(new THREE.BoxGeometry(0.52, 0.05, 0.56), H.color, 0, 1.98, 0.02)); }
    else { hat.visible = false; body.add(part(new THREE.BoxGeometry(0.5, 0.3, 0.5), H.color, 0, 2.0, -0.02)); body.add(part(new THREE.ConeGeometry(0.2, 0.3, 4), H.color, 0, 2.25, -0.08)); } }
  if(col.mask) body.add(part(new THREE.BoxGeometry(0.44, 0.16, 0.44), col.mask, 0, 1.76, 0.01));
  if(col.shoulders) for(const s of [-1, 1]) body.add(part(new THREE.BoxGeometry(0.28, 0.14, 0.4), col.shoulders, s * 0.4, 1.62, 0));
  if(col.ears) for(const s of [-1, 1]){ const e = part(new THREE.ConeGeometry(0.06, 0.3, 4), col.skin, s * 0.26, 1.9, -0.02); e.rotation.z = -s * 1.1; body.add(e); }
  if(col.tusks) for(const s of [-1, 1]) body.add(part(new THREE.ConeGeometry(0.035, 0.14, 4), 0xf0e6cc, s * 0.1, 1.72, 0.22));
  if(col.beard) body.add(part(new THREE.BoxGeometry(0.4, 0.32, 0.12), col.hair, 0, 1.62, 0.2));
  if(col.eyes) for(const s of [-1, 1]) body.add(part(new THREE.BoxGeometry(0.07, 0.05, 0.02), col.eyes, s * 0.1, 1.86, 0.215));
  if(col.stocky) body.scale.set(1.18, 0.86, 1.12);
  if(col.gaunt) body.scale.set(0.92, 1.02, 0.92);
  // walk, moving, attack (1 → 0 while swinging), pose: "cast" (both hands up), "bow" (arms out, drawing) or "sit"
  g.userData.animate = (walk, moving, attack, pose) => {
    const sw = Math.sin(walk) * (moving ? 0.7 : 0);
    legL.rotation.x = sw; legR.rotation.x = -sw; armL.rotation.set(-sw * 0.8, 0, 0); armR.rotation.set(sw * 0.8, 0, 0);
    body.position.y = 0;
    if(pose === "sit"){ body.position.y = -0.62 * body.scale.y; legL.rotation.x = legR.rotation.x = -1.45; armL.rotation.set(-0.5, 0, 0.1); armR.rotation.set(-0.5, 0, -0.1); return; }
    if(pose === "cast"){ armL.rotation.set(-1.7, 0, 0.35); armR.rotation.set(-1.7, 0, -0.35); }
    else if(pose === "bow"){ armL.rotation.set(-1.55, 0, 0); armR.rotation.set(-1.45, 0, 0.6); }
    if(attack > 0){ if(wt === "bow") { armL.rotation.set(-1.55, 0, 0); armR.rotation.set(-1.5, 0, 0.6 - (1 - attack) * 0.5); }
      else if(wt === "staff") armR.rotation.set(-1.6 + (1 - attack) * 0.6, 0, 0);
      else armR.rotation.set(-2.2 + (1 - attack) * 2.6, 0, 0); }                                          // overhead swing
  };
  g.userData.height = col.stocky ? 1.95 : 2.2;
  return g;
}

// four-legged animals: wolves and boars
export function makeBeast(o){
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(part(new THREE.BoxGeometry(o.w, o.h, o.l), o.color, 0, o.legH + o.h / 2, 0));
  const head = part(new THREE.BoxGeometry(o.head, o.head * 0.9, o.head * 1.1), o.color, 0, o.legH + o.h * 0.75, o.l / 2 + o.head * 0.4);
  head.add(part(new THREE.BoxGeometry(o.head * 0.55, o.head * 0.45, o.head * 0.6), o.snout, 0, -o.head * 0.15, o.head * 0.75));
  if(o.ears) for(const s of [-1, 1]) head.add(part(new THREE.ConeGeometry(o.head * 0.16, o.head * 0.4, 4), o.color, s * o.head * 0.28, o.head * 0.55, -o.head * 0.1));
  if(o.tusks) for(const s of [-1, 1]) head.add(part(new THREE.ConeGeometry(0.05, 0.28, 4), 0xf0e6cc, s * o.head * 0.3, -o.head * 0.25, o.head * 1.0));
  body.add(head);
  if(o.tail) body.add(pivot(0, o.legH + o.h * 0.8, -o.l / 2, part(new THREE.BoxGeometry(0.12, 0.12, o.tail), o.color, 0, 0.1, -o.tail / 2)));
  const legs = [];
  for(const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]){
    const lg = pivot(sx * (o.w / 2 - 0.08), o.legH, sz * (o.l / 2 - 0.15), part(new THREE.BoxGeometry(0.15, o.legH, 0.15), o.leg, 0, -o.legH / 2, 0)); legs.push(lg); body.add(lg); }
  g.userData.animate = (walk, moving, attack) => {
    const sw = Math.sin(walk * 1.4) * (moving ? 0.8 : 0);
    legs[0].rotation.x = sw; legs[3].rotation.x = sw; legs[1].rotation.x = -sw; legs[2].rotation.x = -sw;
    body.position.z = attack > 0 ? Math.sin(attack * Math.PI) * 0.45 : 0;                               // lunge forward
    head.rotation.x = attack > 0 ? -Math.sin(attack * Math.PI) * 0.5 : 0;
  };
  g.userData.height = o.legH + o.h + 0.5;
  return g;
}
export const makeWolf = () => makeBeast({w: 0.5, h: 0.5, l: 1.2, legH: 0.5, head: 0.42, color: 0x8a8f96, snout: 0x6f747a, leg: 0x6f747a, ears: true, tail: 0.6});
export const makeBoar = () => makeBeast({w: 0.75, h: 0.7, l: 1.3, legH: 0.38, head: 0.55, color: 0x6b4a32, snout: 0xc49a82, leg: 0x4a3222, tusks: true, tail: 0.25});
export const makeBandit = () => makeHumanoid({shirt: 0x5a4632, pants: 0x3a3028, hair: 0x2a2a2a, cape: null, mask: 0x2a2020, weapon: 0x9aa0a6});
// Rurik the Scarred, the bandit leader (an elite)
export const makeRurik = () => { const g = makeHumanoid({shirt: 0x3a2a20, pants: 0x2a2420, hair: 0x5a2a1a, beard: true, cape: 0x7a1a1a, shoulders: 0x4a4a4a, weapon: 0xc8ced4, belt: 0x1a1410}); g.scale.setScalar(1.18); g.userData.height *= 1.18; return g; };
// ---------------- Darkpine Forest and Hollow Crypt monsters
export function makeSpider(o = {}){
  const c = Object.assign({color: 0x2e2a30, belly: 0x5a3a4a, eyes: 0xff4a3a, size: 1}, o), g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const head = part(new THREE.SphereGeometry(0.28, 7, 5), c.color, 0, 0.55, 0.35), abd = part(new THREE.SphereGeometry(0.48, 8, 6), c.belly, 0, 0.7, -0.35); abd.scale.set(1, 0.8, 1.15);
  for(const sx of [-1, 1]) head.add(part(new THREE.SphereGeometry(0.05, 5, 4), c.eyes, sx * 0.1, 0.08, 0.24));
  body.add(head, abd);
  const legs = [];
  for(let k = 0; k < 4; k++) for(const sx of [-1, 1]){ const lg = pivot(sx * 0.22, 0.6, 0.3 - k * 0.2); const seg = part(new THREE.BoxGeometry(0.75, 0.06, 0.06), c.color, sx * 0.36, 0.1, 0); seg.rotation.z = sx * 0.5;
    const seg2 = part(new THREE.BoxGeometry(0.06, 0.6, 0.06), c.color, sx * 0.7, -0.15, 0); lg.add(seg, seg2); lg.rotation.y = sx * (k - 1.5) * -0.35; legs.push(lg); body.add(lg); }
  g.scale.setScalar(c.size);
  g.userData.animate = (walk, moving, attack) => { legs.forEach((l, i) => l.rotation.x = Math.sin(walk * 2 + i * 1.3) * (moving ? 0.4 : 0.05)); head.rotation.x = attack > 0 ? -Math.sin(attack * Math.PI) * 0.6 : 0; body.position.z = attack > 0 ? Math.sin(attack * Math.PI) * 0.3 : 0; };
  g.userData.height = 1.2 * c.size; return g;
}
export const makeTroll = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0x5f8a5a, shirt: 0x4a3a2a, pants: 0x3a2a1a, hair: 0x2a3a2a, tusks: true, cape: null, weaponType: "hammer", weapon: 0x6a5a4a, stocky: true}, o));
  g.scale.setScalar(o.scale || 1.35); g.userData.height *= o.scale || 1.35; return g; };
export const makeCultist = (o = {}) => { const g = makeHumanoid(Object.assign({shirt: 0x3a2a4a, robe: true, cape: 0x1a1220, hair: 0x2a1a2a, mask: 0x1a1220, weaponType: "staff", weapon: 0xb06aff, belt: 0x8a2a2a}, o));
  if(o.scale){ g.scale.setScalar(o.scale); g.userData.height *= o.scale; } return g; };
export const makeSkeleton = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0xe8e0c8, shirt: 0xd8d0b8, pants: 0xd8d0b8, boots: 0xc8c0a8, hair: 0xe8e0c8, cape: null, gaunt: true, eyes: 0x6ae0ff, weaponType: "sword", weapon: 0x8a8f96}, o));
  if(o.scale){ g.scale.setScalar(o.scale); g.userData.height *= o.scale; } return g; };
// ---------------- Frostpeak Highlands and Coldiron Mine monsters
export const makeIceWolf = () => makeBeast({w: 0.55, h: 0.55, l: 1.3, legH: 0.55, head: 0.46, color: 0xdfe8ee, snout: 0x9fb0bc, leg: 0xc8d4dc, ears: true, tail: 0.7});
export const makeYeti = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0x9fb0c0, shirt: 0xeef2f4, pants: 0xe0e6ea, boots: 0xc8d0d6, hair: 0xf4f8fa, gloves: 0xe8eef0, cape: null, weaponType: "none", stocky: true, tusks: true}, o));
  const s2 = o.scale || 1.55; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
export const makeKobold = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0xb0703a, shirt: 0x5a4632, pants: 0x3a3028, hair: 0x6a4a2a, cape: null, ears: true, weaponType: "axe", weapon: 0x8a8f96, belt: 0x2e2620,
    helm: {type: "leather", color: 0x8a6a3a}}, o));
  const s2 = o.scale || 0.78; g.scale.setScalar(s2); g.userData.height *= s2;
  if(!o.noCandle){ const c = part(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 6), 0xf0e6cc, 0, 2.25, 0.05); c.add(part(new THREE.ConeGeometry(0.05, 0.12, 5), 0xffd060, 0, 0.16, 0)); g.children[0].add(c); }
  return g; };
export const makeGolem = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0x6a7076, shirt: 0x5a6066, pants: 0x4a5056, boots: 0x3a4046, hair: 0x5a6066, gloves: 0x7a8086, shoulders: 0x7a8086, cape: null, eyes: 0x6ae0ff, stocky: true, weaponType: "none"}, o));
  const s2 = o.scale || 1.8; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
// ---------------- Mirewood Marsh and Sunken Temple monsters
export const makeLurker = (o = {}) => { const g = makeBeast(Object.assign({w: 0.8, h: 0.42, l: 2.0, legH: 0.28, head: 0.5, color: 0x4a6a3a, snout: 0x6a8a4a, leg: 0x3a5230, tail: 1.2}, o));
  const s2 = o.scale || 1; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
export const makeMirefin = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0x5a9a8a, shirt: 0x3a6a6a, pants: 0x2a4a4a, boots: 0x3a6a5a, hair: 0x2a5a5a, gloves: 0x5a9a8a, cape: null, eyes: 0xffe86a, ears: true, weaponType: "dagger", weapon: 0xd8d0b8, belt: 0x6a5a3a}, o));
  g.children[0].add(part(new THREE.BoxGeometry(0.08, 0.36, 0.4), o.fin || 0x8ad0c0, 0, 2.1, -0.08));                      // head fin
  const s2 = o.scale || 0.95; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
export const makeDrowned = (o = {}) => makeSkeleton(Object.assign({skin: 0x8a9a7a, shirt: 0x5a6a4a, pants: 0x4a5a3a, boots: 0x3a4a2a, hair: 0x3a5a3a, eyes: 0x7fffd4, weapon: 0x5a7a6a}, o));
// ---------------- more of Rimfrost 1's creatures
// a glowing spirit (will-o'-wisps, sprites, embers, ice spirits): a bright orb with small motes around it, floating
export function makeWisp(o = {}){
  const c = Object.assign({color: 0xa8f0c0, size: 1}, o), g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), new THREE.MeshBasicMaterial({color: c.color})); core.position.y = 1.4;
  const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), new THREE.MeshBasicMaterial({color: c.color, transparent: true, opacity: 0.3, depthWrite: false})); halo.position.y = 1.4;
  const motes = []; for(let k = 0; k < 4; k++){ const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({color: c.color})); body.add(m); motes.push(m); }
  body.add(core, halo); g.scale.setScalar(c.size);
  let t = Math.random() * 6;
  g.userData.animate = (walk, moving, attack) => { t += 0.03; body.position.y = Math.sin(t * 2) * 0.15 + (attack > 0 ? Math.sin(attack * Math.PI) * 0.3 : 0);
    motes.forEach((m, k) => { const a = t * 2.2 + k * 1.57; m.position.set(Math.cos(a) * 0.75, 1.4 + Math.sin(a * 1.3) * 0.3, Math.sin(a) * 0.75); }); halo.scale.setScalar(1 + Math.sin(t * 5) * 0.08); };
  g.userData.height = 2.0 * c.size; return g;
}
// small animals: hares, rats and deer
export function makeCritter(kind, color){
  if(kind === "deer"){ const g = makeBeast({w: 0.45, h: 0.55, l: 1.2, legH: 0.8, head: 0.36, color, snout: 0x5a4030, leg: 0x5a4030, ears: true, tail: 0.15});
    const head = g.children[0].children[1]; for(const s of [-1, 1]){ const a = part(new THREE.BoxGeometry(0.05, 0.5, 0.05), 0xd8c8a8, s * 0.12, 0.42, -0.05); a.rotation.z = -s * 0.4; head.add(a); } return g; }
  if(kind === "rat") return makeBeast({w: 0.22, h: 0.2, l: 0.5, legH: 0.12, head: 0.2, color, snout: 0xc8a8a0, leg: 0x3a3a3a, ears: true, tail: 0.5});
  const g = makeBeast({w: 0.28, h: 0.3, l: 0.5, legH: 0.18, head: 0.26, color, snout: 0xe8d8c0, leg: color, tail: 0.1});
  const head = g.children[0].children[1]; for(const s of [-1, 1]) head.add(part(new THREE.BoxGeometry(0.06, 0.34, 0.08), color, s * 0.07, 0.3, -0.04)); return g;   // long ears
}
// a ghoul: hunched, grey-green, long arms
export const makeGhoul = (o = {}) => { const g = makeHumanoid(Object.assign({skin: 0x7a8a6a, shirt: 0x4a5a3a, pants: 0x3a4030, boots: 0x3a4030, hair: 0x2a3020, cape: null, gaunt: true, eyes: 0xd0ff6a, weaponType: "none"}, o));
  g.children[0].rotation.x = 0.25; const s2 = o.scale || 1.05; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
// the Draug King: a huge armoured skeleton with a crown
export const makeDraug = (o = {}) => { const g = makeSkeleton(Object.assign({skin: 0xc8d8dc, shirt: 0x5a7a84, pants: 0x4a5a64, shoulders: 0x7cb3c4, cape: 0x2a3a44, eyes: 0x7fe0ff, weaponType: "sword", weapon: 0x9fd6e8}, o));
  const crown = part(new THREE.CylinderGeometry(0.26, 0.24, 0.16, 8), 0xd8b04a, 0, 2.12, 0); g.children[0].add(crown);
  for(let k = 0; k < 5; k++){ const sp = part(new THREE.ConeGeometry(0.05, 0.18, 4), 0xd8b04a, Math.cos(k * 1.26) * 0.22, 2.27, Math.sin(k * 1.26) * 0.22); g.children[0].add(sp); }
  const s2 = o.scale || 2.0; g.scale.setScalar(s2); g.userData.height *= s2; return g; };
// druid shapes
export const makeBearForm = () => makeBeast({w: 0.95, h: 0.9, l: 1.5, legH: 0.5, head: 0.6, color: 0x6a4a30, snout: 0x9a7a58, leg: 0x4e3622, ears: true, tail: 0.15});
export const makeWolfForm = () => makeBeast({w: 0.55, h: 0.55, l: 1.3, legH: 0.55, head: 0.45, color: 0x4a5866, snout: 0x9fb0bc, leg: 0x3a4652, ears: true, tail: 0.7});
export const makeLeopardForm = () => makeBeast({w: 0.5, h: 0.48, l: 1.4, legH: 0.55, head: 0.42, color: 0xd8b04a, snout: 0xf0dca0, leg: 0xb08a34, ears: true, tail: 0.9});
const hex = s => parseInt(s.slice(1), 16);
const CLASS_LOOK = {
  mage:    {shirt: 0x3a5ab8, robe: true, cape: null, weaponType: "staff", weapon: 0xff9a4a, shoulders: 0x2a3f86, belt: 0xd8b04a},
  warrior: {shirt: 0x8a8f96, pants: 0x4a3a2a, cape: 0x8f2f2f, weaponType: "sword", weapon: 0xc8ced4, shoulders: 0x6a6f76, belt: 0x5a3a22},
  hunter:  {shirt: 0x4f6f3a, pants: 0x5a4632, cape: 0x3a4f2a, weaponType: "bow", belt: 0x6b4a2e},
  priest:  {shirt: 0xe8e4d6, robe: true, cape: null, weaponType: "staff", weapon: 0xffe37a, belt: 0xc8a040},
  druid:   {shirt: 0x7a5a32, robe: true, cape: 0x4f7a3a, weaponType: "staff", weapon: 0x7fdc5a, belt: 0x4f7a3a},
  paladin: {shirt: 0xc8ccd2, pants: 0x6a6f76, cape: 0x2f4f9f, weaponType: "hammer", weapon: 0xe0c050, shoulders: 0xe0c050, belt: 0x8a6a2a}
};
// a player character from race + class (RACES colours come from Rimfrost 1)
// what your equipment looks like: armor type colours, tinted by quality (green, blue, purple, orange)
const QCOL = [0x9d9d9d, 0xffffff, 0x1eff00, 0x0070dd, 0xa335ee, 0xff8000];
const ARMOR_COL = {cloth: 0x5a4a8a, leather: 0x6b4a2e, plate: 0xa8aeb4};
const tint = (base, q, k = 0.3) => q >= 2 ? new THREE.Color(base).lerp(new THREE.Color(QCOL[q]), k).getHex() : base;
const metal = q => q >= 2 ? tint(0xc8ced4, q, 0.45) : 0xb8bec4;
export function makeHero(race = "human", cls = "warrior", RACES = {}, eq = {}){
  const r = RACES[race] || {}, o = Object.assign({}, CLASS_LOOK[cls] || {});
  const arm = it => it.arm === "cloth" ? (CLASS_LOOK[cls].shirt || ARMOR_COL.cloth) : ARMOR_COL[it.arm];
  if(eq.chest){ o.shirt = tint(arm(eq.chest), eq.chest.q); }
  if(eq.legs){ o.pants = tint(arm(eq.legs) === ARMOR_COL.plate ? 0x8a9096 : new THREE.Color(arm(eq.legs)).multiplyScalar(0.75).getHex(), eq.legs.q); }
  if(eq.feet){ o.boots = tint(eq.feet.arm === "plate" ? 0x7a8086 : eq.feet.arm === "leather" ? 0x4a3220 : 0x3a2a4a, eq.feet.q); }
  if(eq.hands){ o.gloves = tint(eq.hands.arm === "plate" ? 0x9aa0a6 : eq.hands.arm === "leather" ? 0x5a3a22 : 0x4a3a6a, eq.hands.q); }
  if(eq.shoulder){ o.shoulders = tint(eq.shoulder.arm === "plate" ? 0xb8bec4 : eq.shoulder.arm === "leather" ? 0x5a3a22 : 0x3a2a5a, eq.shoulder.q, 0.4); }
  if(eq.head){ o.helm = {type: eq.head.arm, color: tint(eq.head.arm === "plate" ? 0xa8aeb4 : eq.head.arm === "leather" ? 0x5a3a22 : (CLASS_LOOK[cls].shirt || 0x4a3a6a), eq.head.q, 0.4)}; }
  if(eq.weapon){ const wt = eq.weapon.wt; o.weaponType = wt === "mace" ? "mace" : wt; o.weapon = wt === "staff" || wt === "wand" ? (eq.weapon.q >= 2 ? QCOL[eq.weapon.q] : 0x9fd6e8) : metal(eq.weapon.q); }
  if(eq.offhand){ o.offhand = eq.offhand.wt; o.offColor = eq.offhand.wt === "shield" ? tint(0x7a7f86, eq.offhand.q, 0.4) : tint(0x5a2a6a, eq.offhand.q, 0.4); o.offTrim = eq.offhand.q >= 2 ? QCOL[eq.offhand.q] : 0xd8b04a; }
  if(r.skin) o.skin = hex(r.skin); if(r.hair) o.hair = hex(r.hair);
  if(race === "elf"){ o.ears = true; }
  if(race === "orc"){ o.tusks = true; }
  if(race === "dwarf"){ o.beard = true; o.stocky = true; }
  if(race === "undead"){ o.gaunt = true; o.eyes = 0xffe86a; }
  return makeHumanoid(o);
}
// ---------------- mounts: a horse, ram or wolf with a saddle; userData.saddle = how high you sit
export function makeMount(d){
  const c = parseInt(d.color.slice(1), 16), mane = parseInt(d.mane.slice(1), 16);
  const g = d.wolf ? makeBeast({w: 0.62, h: 0.62, l: 1.55, legH: 0.7, head: 0.5, color: c, snout: mane, leg: mane, ears: true, tail: 0.8})
    : makeBeast({w: 0.62, h: 0.72, l: 1.7, legH: d.horns ? 0.72 : 0.9, head: 0.46, color: c, snout: d.horns ? 0xe8e0d0 : mane, leg: mane, ears: true, tail: d.horns ? 0.25 : 0.7});
  const legH = d.wolf ? 0.7 : d.horns ? 0.72 : 0.9, top = legH + (d.wolf ? 0.62 : 0.72);
  const body = g.children[0];
  const saddle = part(new THREE.BoxGeometry(0.66, 0.12, 0.6), 0x5a3a22, 0, top + 0.05, -0.05); body.add(saddle);
  const cloth = part(new THREE.BoxGeometry(0.7, 0.4, 0.5), 0x8a2a2a, 0, top - 0.15, -0.05); body.add(cloth);
  if(d.horns) for(const s of [-1, 1]){ const h = part(new THREE.TorusGeometry(0.16, 0.05, 5, 8, 4.2), 0xe0d8c0, s * 0.2, top + 0.25, 1.0); h.rotation.y = s * 1.2; body.add(h); }
  if(!d.wolf) body.add(part(new THREE.BoxGeometry(0.12, 0.35, 0.7), mane, 0, top + 0.12, 0.55));   // mane
  g.userData.saddle = top + 0.1;
  return g;
}
