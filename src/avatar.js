// Player characters made from the KayKit models (CC0, Kay Lousberg): a skinned model with weapons in its hands and real animations.
// Every race (skin colour, build, ears, tusks, beards) and every class (its own model, colours and weapons). The shape-built models (models.js) stay as the fallback.
import * as THREE from "three";
import {load, build} from "./glb.js";

const A = "./assets/kaykit/";
const ANIMS = ["General", "MovementBasic", "MovementAdvanced", "CombatMelee", "CombatRanged", "Simulation"];
const CHARS = ["Knight", "Barbarian", "Mage", "Ranger", "Rogue", "Druid", "Tiefling", "FrostGolem", "Rogue_Hooded", "Barbarian_Large", "Skeleton_Minion", "Skeleton_Warrior", "Skeleton_Rogue", "Skeleton_Mage", "Necromancer",
  "OrcBrute", "OrcRaider", "BlackKnight", "Monstrosity", "Witch", "Lorekeeper", "Cleric", "Caveman"];
const LARGE = new Set(["FrostGolem", "Barbarian_Large", "OrcBrute", "BlackKnight", "Monstrosity"]);                             // models on the large rig
// other colourings of the models (NPCs and monsters)
const ALTS = ["barbarian", "druid", "knight", "mage", "ranger", "rogue"].flatMap(n => ["A", "B", "C"].map(k => n + "_texture_alt_" + k)).concat(["skeleton_texture_B", "orcbrute_texture_B", "orc_texture_B", "blackknight_texture_alt", "monstrosity_texture_B", "witch_texture_B", "orc_texture_A"]); const altImg = {};
const ANIMS_L = ["General", "MovementBasic", "CombatMelee"];                       // the large rig (big creatures)
const ITEMS = ["sword_1handed", "axe_1handed", "dagger", "staff", "wand", "bow_withString", "shield_round", "shield_badge_color", "shield_round_barbarian", "spellbook_closed", "druid_staff",
  "axe_2handed", "axe_2handed_Large", "sword_2handed", "crossbow_1handed", "shield_spikes", "shield_square", "Skeleton_Blade", "Skeleton_Shield_Small_A", "Skeleton_Staff", "Skeleton_Dagger", "Skeleton_Axe",
  "Orc_Axe", "Orc_Axe_Large", "BlackKnight_Sword", "BlackKnight_Sword_Large", "BlackKnight_Shield", "BlackKnight_Shield_Large", "Monstrosity_Pitchfork_Large", "Broom", "Lorekeeper_Staff", "Cleric_Mace", "Caveman_Club"];
const HEIGHT = 2.15;                                 // how tall a character is in the world (the old models are about 2.2 to the top of the head)
let CLIPS = null, CLIPS_L = {}, READY = false, RIG_SCALE = 1; const assets = {};
export const avatarReady = () => READY;

// load everything once (if a file is missing the game just keeps the old models)
export async function preloadAvatars(){
  const [anims, chars, items] = await Promise.all([Promise.all(ANIMS.map(n => load(A + "anims/Rig_Medium_" + n + ".glb"))), Promise.all(CHARS.map(n => load(A + "chars/" + n + ".glb"))), Promise.all(ITEMS.map(n => load(A + "items/" + n + ".gltf")))]);
  CLIPS = {}; for(const a of anims) for(const c of a.clips) if(!CLIPS[c.name]) CLIPS[c.name] = c;
  for(const a of await Promise.all(ANIMS_L.map(n => load(A + "anims/Rig_Large_" + n + ".glb")))) for(const c of a.clips) if(!CLIPS_L[c.name]) CLIPS_L[c.name] = c;
  CHARS.forEach((n, i) => assets[n] = chars[i]); ITEMS.forEach((n, i) => assets[n] = items[i]);
  await Promise.all(ALTS.map(n => fetch(A + "alt/" + n + ".png").then(r => r.ok ? r.blob() : null).then(b => b && createImageBitmap(b, {imageOrientation: "none"})).then(im => { if(im) altImg[n] = im; }).catch(() => {})));
  // versions of the clips with only the legs, or everything but the legs: you can swing a sword while running
  const legs = /^(root|hips|upperleg|lowerleg|foot|toes)/;
  for(const c of Object.values(CLIPS)){ c.legs = new THREE.AnimationClip(c.name + "_legs", c.duration, c.tracks.filter(t => legs.test(t.name)));
    c.upper = new THREE.AnimationClip(c.name + "_upper", c.duration, c.tracks.filter(t => !legs.test(t.name))); }
  // one size for every model (they share the same skeleton): measured on the Knight's body and head
  { const k = build(assets.Knight), b = new THREE.Box3(); k.updateMatrixWorld(true); for(const m of k.userData.meshes) if(/_(Body|Head|LegLeft|LegRight)$/.test(m.name)) b.expandByObject(m); RIG_SCALE = HEIGHT / ((b.max.y - b.min.y) || 1); }
  READY = true;
}

// which model, weapons and colours a race and class get (null = use the old model)
// recolour: [hue from, hue to, new hue (or -1 = grey), saturation, lightness factor, lightness add] for the class's cloth and trim
const CLASS = {
  warrior: {char: "Knight", right: "sword_1handed", shield: "shield_round", melee: "1H"},
  paladin: {char: "Knight", right: "sword_1handed", shield: "shield_badge_color", melee: "1H", recolor: [[320, 360, 220, 0.6, 0.9, 0], [0, 12, 220, 0.6, 0.9, 0]], warm: 0.22},
  shaman:  {char: "Barbarian", right: "axe_1handed", shield: "shield_round_barbarian", melee: "1H", recolor: [[340, 360, 205, 0.55, 1, 0], [0, 6, 205, 0.55, 1, 0]]},
  mage:    {char: "Mage", right: "staff", caster: true, melee: "1H"},
  priest:  {char: "Mage", right: "staff", caster: true, melee: "1H", recolor: [[200, 280, -1, 0.06, 0.45, 0.5], [290, 345, 45, 0.7, 1.1, 0]]},
  warlock: {char: "Mage", right: "staff", caster: true, melee: "1H", recolor: [[200, 280, 280, 0.35, 0.38, 0], [290, 345, 110, 0.6, 0.85, 0]]},
  druid:   {char: "Druid", right: "druid_staff", caster: true, melee: "1H"},
  hunter:  {char: "Ranger", right: null, left: "bow_withString", melee: "1H", bow: true},
  rogue:   {char: "Rogue", right: "dagger", left: "dagger", melee: "DW"}
};
const UPRIGHT = {staff: 1, druid_staff: 1, Skeleton_Staff: 1};                             // items held upright, and which end of them goes up                                       // items held upright (a staff stands next to you instead of pointing ahead)
const WEAPON = {sword: "sword_1handed", axe: "axe_1handed", mace: "sword_1handed", dagger: "dagger", staff: "staff", wand: "wand", bow: "bow_withString"};
function specFor(race, cls, over){ return over ? Object.assign({}, CLASS[cls] || {}, over) : CLASS[cls] || null; }
// the races: skin and hair colour, build (width, height, depth) and extra parts
const RACE = {
  human:  {scale: [1, 1, 1]},
  orc:    {skin: 0x6f9a4a, locks: 0x2e2a26, scale: [1.12, 1.05, 1.12], tusks: true},
  elf:    {skin: 0xf2dccc, scale: [0.93, 1.06, 0.93], ears: true},
  dwarf:  {hair: 0x9a4a22, scale: [1.22, 0.84, 1.18], beard: true},
  undead: {skin: 0xa8b89a, locks: 0x3a3a3a, scale: [0.9, 1.0, 0.9], eyes: 0x9aff8a}
};
// ---------------------------------------------------------------- recolouring a character's texture: the skin (and for dwarves the beard) in the race's colour
const texCache = new Map();
function rgb2hsl(r, g, b){ r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if(mx !== mn){ const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
// the textures are a grid of 8 x 4 colour tiles: the skin is the tile top left (and any other tile of the same colour), the hair the one next to it
const SKIN0 = [246, 192, 156];
function raceTexture(asset, char, race, cls, alt){
  const R = RACE[race] || {}, C = (CLASS[cls] && CLASS[cls].char === char && CLASS[cls]) || {}, hairCol = R.locks ?? (R.hair && char === "Barbarian" ? R.hair : null);
  const key = char + ":" + race + ":" + (C.recolor || C.warm ? cls : "") + ":" + (alt || ""), aimg = alt && altImg[alt]; if(!R.skin && hairCol == null && !C.recolor && !C.warm && !aimg) return null; if(texCache.has(key)) return texCache.get(key);
  const base = asset.materials[0] && asset.materials[0].map; if(!aimg && (!base || !base.image)) return null;
  const img = aimg || base.image, W = img.width, H = img.height, cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, W, H), px = d.data, TW = W / 8, TH = H / 4;
  const at = (x, y) => (Math.floor(y) * W + Math.floor(x)) * 4, mid = (i, j) => at((i + 0.5) * TW, (j + 0.5) * TH);
  const skinTile = new Set([0]); for(let i = 0; i < 8; i++) for(let j = 0; j < 4; j++){ const q = mid(i, j); if(Math.hypot(px[q] - SKIN0[0], px[q + 1] - SKIN0[1], px[q + 2] - SKIN0[2]) < 24) skinTile.add(i + j * 8); }
  const lum = q => (px[q] + px[q + 1] + px[q + 2]) / 3, skinL = lum(mid(0, 0)), hairL = Math.max(20, lum(mid(1, 0)));
  const sk = R.skin != null ? new THREE.Color(R.skin) : null, hc = hairCol != null ? new THREE.Color(hairCol) : null, out = new THREE.Color();
  const hcS = hc && (R.locks != null ? hc.getRGB({r: 0, g: 0, b: 0}, THREE.SRGBColorSpace) : hc);                    // hair in the colour as written (the skin keeps its tested look)
  const paint = (p, c, k) => { px[p] = Math.min(255, c.r * 255 * k); px[p + 1] = Math.min(255, c.g * 255 * k); px[p + 2] = Math.min(255, c.b * 255 * k); };
  for(let p = 0; p < px.length; p += 4){ const n = p / 4, tile = Math.floor((n % W) / TW) + Math.floor(Math.floor(n / W) / TH) * 8;
    if(skinTile.has(tile)){ if(sk) paint(p, sk, lum(p) / skinL); continue; }
    if(tile === 1){ if(hc) paint(p, hcS, Math.min(1.6, lum(p) / hairL)); continue; }
    const [h, s, l] = rgb2hsl(px[p], px[p + 1], px[p + 2]); let done = false;                                       // the class's colours
    for(const [h0, h1, nh, ns, lf, la] of C.recolor || []) if(s > 0.22 && h >= h0 && h < h1){ out.setHSL(nh < 0 ? 0 : nh / 360, ns, Math.min(0.97, l * lf + la)); done = true; break; }
    if(!done && C.warm && s < 0.12 && l > 0.3){ out.setRGB(px[p] / 255, px[p + 1] / 255, px[p + 2] / 255, THREE.SRGBColorSpace); out.lerp(new THREE.Color(0.92, 0.74, 0.32), C.warm); done = true; }
    if(done){ const c = out.getRGB({r: 0, g: 0, b: 0}, THREE.SRGBColorSpace); px[p] = c.r * 255; px[p + 1] = c.g * 255; px[p + 2] = c.b * 255; } }
  g.putImageData(d, 0, 0); const tex = new THREE.CanvasTexture(cv); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; texCache.set(key, tex); return tex; }

const LARGE_HITS = ["Melee_2H_Attack", "Melee_2H_Slam", "Melee_1H_Slash"];
const MELEE_HITS = {"1H": ["Melee_1H_Attack_Chop", "Melee_1H_Attack_Slice_Diagonal", "Melee_1H_Attack_Slice_Horizontal"], "DW": ["Melee_Dualwield_Attack_Chop", "Melee_Dualwield_Attack_Slice", "Melee_Dualwield_Attack_Stab"]};
// look: a model for NPCs and monsters: {char, right, left, shield, alt (texture), helm (show helmets), scale, large}
export function makeAvatar(race, cls, eq = {}, look = null){
  if(!READY) return null; const spec = specFor(race, cls, look); if(!spec || !assets[spec.char]) return null;
  const R = RACE[race] || RACE.human, model = build(assets[spec.char]), g = new THREE.Group(); g.add(model);
  const N = model.userData.nodes, meshes = model.userData.meshes;
  // dwarves: the bearded head from the Barbarian (moved onto this skeleton)
  if(R.beard && spec.char !== "Barbarian"){ const old = meshes.find(m => /_Head$/.test(m.name)), donor = build(assets.Barbarian), nh = donor.userData.meshes.find(m => /_Head$/.test(m.name));
    if(old && nh){ const sm = new THREE.SkinnedMesh(nh.geometry, nh.material); sm.name = nh.name; sm.castShadow = true; sm.frustumCulled = false; old.parent.add(sm);
      sm.bind(new THREE.Skeleton(nh.skeleton.bones.map(b => N[b.name]), nh.skeleton.boneInverses), old.bindMatrix); old.parent.remove(old); meshes[meshes.indexOf(old)] = sm; sm.userData.char = "Barbarian"; } }
  // a helmet only with something on your head (dwarves keep the visor open so the beard shows)
  for(const m of meshes) if(/_(Helmet|HelmetVisor|Hat|BearHat)$/.test(m.name)) m.visible = (!!eq.head || !!spec.helm) && !(R.beard && /Visor$/.test(m.name));
  for(const m of meshes){ const ch = m.userData.char || spec.char, tex = spec.tint ? tintTexture(assets[ch], "tint:" + ch + ":" + spec.tint.join(","), spec.tint, spec.alt) : raceTexture(assets[ch], ch, race, cls, ch === spec.char ? spec.alt : null); m.material = m.material.clone(); if(tex && !m.material.transparent){ m.material.map = tex; m.material.needsUpdate = true; } if(spec.glow) m.material.emissive = new THREE.Color(spec.glow); }   // own materials (ghosts and glows change them)
  // extra parts on the head: elf ears, orc tusks, undead eyes (placed from the head's size)
  const headMesh = meshes.find(m => /_Head$/.test(m.name));
  if(headMesh && N.head && (R.ears || R.tusks || R.eyes)){ model.updateMatrixWorld(true); const hb = new THREE.Box3().setFromObject(headMesh), c = hb.getCenter(new THREE.Vector3()), sz = hb.getSize(new THREE.Vector3());
    const at = (x, y, z) => N.head.worldToLocal(new THREE.Vector3(c.x + x * sz.x, c.y + y * sz.y, c.z + z * sz.z));
    const skinMat = new THREE.MeshLambertMaterial({color: R.skin || 0xf0c8a0}), add = (geo, mat, p, rot, scl) => { const m = new THREE.Mesh(geo, mat); m.position.copy(p); if(rot) m.rotation.set(...rot); if(scl) m.scale.setScalar(scl); m.castShadow = true; N.head.add(m); return m; };
    const hs = sz.y / N.head.getWorldScale(new THREE.Vector3()).y;
    if(R.ears && spec.char !== "Druid") for(const s2 of [-1, 1]) add(new THREE.ConeGeometry(0.1, 0.75, 5), skinMat, at(s2 * 0.5, 0.06, -0.04), [-0.45, 0, -s2 * 1.1], hs * 0.85);
    if(R.tusks) for(const s2 of [-1, 1]) add(new THREE.ConeGeometry(0.035, 0.14, 5), new THREE.MeshLambertMaterial({color: 0xf0e6cc}), at(s2 * 0.13, -0.28, 0.43), [0.2, 0, 0], hs * 0.9);
    if(R.eyes) for(const s2 of [-1, 1]) add(new THREE.SphereGeometry(0.035, 6, 4), new THREE.MeshBasicMaterial({color: R.eyes}), at(s2 * 0.14, -0.02, 0.45), null, hs * 0.9); }
  const hold = (slot, item) => { if(!item || !assets[item] || !N[slot]) return; const w = build(assets[item]); w.traverse(o => { if(o.isMesh){ o.castShadow = true; } }); N[slot].add(w); if(UPRIGHT[item]){ w.userData.up = UPRIGHT[item]; uprights.push(w); }
    if(item === "bow_withString"){ const b = new THREE.Box3(); w.traverse(o => { if(o.isMesh){ o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox); } });      // turned so the string faces you
      const sz = b.getSize(new THREE.Vector3()); w.rotateOnAxis(sz.x > sz.y && sz.x > sz.z ? new THREE.Vector3(1, 0, 0) : sz.y > sz.z ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1), Math.PI); } };
  const uprights = [];
  const wt = eq.weapon && eq.weapon.wt, ot = eq.offhand && eq.offhand.wt;
  if(spec.bow) hold("handslotl", "bow_withString");
  else hold("handslotr", wt === "staff" && spec.right === "druid_staff" ? "druid_staff" : WEAPON[wt] || spec.right);
  if(ot === "shield") hold("handslotl", spec.shield || "shield_round"); else if(ot === "tome") hold("handslotl", "spellbook_closed"); else if(ot === "dagger" || ot === "sword") hold("handslotl", WEAPON[ot]);
  else if(spec.left && !spec.bow && !eq.weapon) hold("handslotl", spec.left);
  // size: scale the model to the world
  const sc = RIG_SCALE * (spec.scale || 1); model.scale.set(sc * R.scale[0], sc * R.scale[1], sc * R.scale[2]);
  // animation
  const mixer = new THREE.AnimationMixer(model), acts = new Map();
  const large = LARGE.has(spec.char), CL = large ? CLIPS_L : CLIPS;
  const act = (name, part) => { const c = CL[name] || CL[name.replace(/_B$/, "_A")]; if(!c) return null; if(part && !c[part]) part = null; if(!c) return null; const key = name + (part || ""); if(!acts.has(key)) acts.set(key, mixer.clipAction(part ? c[part] : c)); return acts.get(key); };
  let base = null, baseKey = "", over = null, overEnd = 0, last = performance.now(), prevAtk = 0, t = 0;
  const setBase = (name, part, fade = 0.2, once = false) => { const key = name + (part || ""); if(key === baseKey) return; const a = act(name, part); if(!a) return;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once; a.enabled = true; a.setEffectiveWeight(1); a.play();
    if(base) base.crossFadeTo(a, fade, false); base = a; baseKey = key; };
  const swing = (name, part) => { const a = act(name, part); if(!a) return; if(over && over !== a) over.fadeOut(0.1);
    a.reset(); a.setLoop(THREE.LoopOnce); a.clampWhenFinished = false; a.enabled = true; a.setEffectiveWeight(1); a.fadeIn(0.08); a.play(); over = a; overEnd = t + a.getClip().duration * 0.9; };
  g.userData.animate = (walk, moving, attack, pose, o = {}) => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;
    const attacking = over && t < overEnd;
    if(over && !attacking){ over.fadeOut(0.15); over = null; }
    if(attack > 0.9 && prevAtk < 0.5){                                                      // an attack just started
      const kind = o.kind || "melee", list = large ? LARGE_HITS : MELEE_HITS[spec.melee] || MELEE_HITS["1H"];
      const name = kind === "bow" ? "Ranged_Bow_Release" : kind === "cast" ? "Ranged_Magic_Shoot" : list[Math.floor(Math.random() * list.length)];
      swing(name, moving ? "upper" : null); }
    prevAtk = attack;
    const busy = over && t < overEnd;
    if(o.dead) setBase("Death_A", null, 0.2, true);
    else if(pose === "sit") setBase(o.mount ? "Sit_Chair_Idle" : "Sit_Floor_Idle", null, 0.3);
    else if(pose === "cast") setBase("Ranged_Magic_Spellcasting", moving ? "upper" : null, 0.15);
    else if(pose === "bow") setBase("Ranged_Bow_Aiming_Idle", moving ? "upper" : null, 0.15);
    else if(moving) setBase(spec.bow && !busy ? "Running_HoldingBow" : o.speed > 9 ? "Running_B" : "Running_A", busy ? "legs" : null, 0.15);
    else setBase(spec.bow && !busy ? "Ranged_Bow_Idle" : "Idle_A", busy ? "legs" : null, 0.25);
    mixer.update(dt);
  };
  g.userData.animate(0, false, 0, null);
  // turn upright items so they point up in the idle pose (worked out once, then they move with the hand)
  if(uprights.length){ g.updateMatrixWorld(true); for(const w of uprights){ const b = new THREE.Box3(); w.traverse(o => { if(o.isMesh){ o.geometry.computeBoundingBox(); b.union(o.geometry.boundingBox); } });
    const sz = b.getSize(new THREE.Vector3()), ax = sz.x > sz.y && sz.x > sz.z ? new THREE.Vector3(1, 0, 0) : sz.y > sz.z ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
    if(Math.abs(b.max.dot(ax)) < Math.abs(b.min.dot(ax))) ax.negate(); if(w.userData.up < 0) ax.negate();                       // towards the long (head) end
    const wq = w.getWorldQuaternion(new THREE.Quaternion()), dir = ax.clone().applyQuaternion(wq).normalize();
    const turn = new THREE.Quaternion().setFromUnitVectors(dir, new THREE.Vector3(0, 0.97, 0.24).normalize()), pq = w.parent.getWorldQuaternion(new THREE.Quaternion());
    w.quaternion.copy(pq.invert().multiply(turn.multiply(wq))); } }
  g.userData.height = HEIGHT * R.scale[1] * (spec.scale || 1) * (large ? 1.45 : 1); g.userData.skinned = true; g.userData.ownDeath = true;
  return g;
}

// ---------------------------------------------------------------- creatures on the same rigs: the warlock's demons
// tint: [new hue, saturation, lightness factor] applied to every pixel of the texture
const CREATURE = {
  imp:        {char: "Tiefling", height: 1.35, move: "Running_A", hits: ["Ranged_Magic_Shoot"]},
  voidwalker: {char: "FrostGolem", large: true, height: 2.9, move: "Walking_A", hits: ["Melee_Unarmed_Punch", "Melee_Unarmed_Smash"], tint: [266, 0.55, 0.42], glow: 0x24103e},
};
function tintTexture(asset, key, [hue, sat, lf], alt){ key += ":" + (alt || ""); if(texCache.has(key)) return texCache.get(key);
  const base = asset.materials[0] && asset.materials[0].map, aimg = alt && altImg[alt]; if(!aimg && (!base || !base.image)) return null;
  const img = aimg || base.image, cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data, out = new THREE.Color();
  for(let p = 0; p < px.length; p += 4){ const [, , l] = rgb2hsl(px[p], px[p + 1], px[p + 2]); out.setHSL(hue / 360, sat, Math.min(0.95, l * lf), THREE.SRGBColorSpace); const c = out.getRGB({r: 0, g: 0, b: 0}, THREE.SRGBColorSpace); px[p] = c.r * 255; px[p + 1] = c.g * 255; px[p + 2] = c.b * 255; }
  g.putImageData(d, 0, 0); const tex = new THREE.CanvasTexture(cv); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; texCache.set(key, tex); return tex; }
export function makeCreature(kind){
  const K = CREATURE[kind]; if(!READY || !K || !assets[K.char]) return null;
  const clips = K.large ? CLIPS_L : CLIPS, model = build(assets[K.char]), g = new THREE.Group(); g.add(model);
  const tex = K.tint ? tintTexture(assets[K.char], "tint:" + kind, K.tint) : null;
  for(const m of model.userData.meshes){ m.material = m.material.clone(); if(tex) m.material.map = tex; if(K.glow){ m.material.emissive = new THREE.Color(K.glow); } }
  model.updateMatrixWorld(true); const b = new THREE.Box3(); for(const m of model.userData.meshes) b.expandByObject(m); model.scale.setScalar(K.height / ((b.max.y - b.min.y) || 1));
  const mixer = new THREE.AnimationMixer(model), acts = new Map(), act = n => { const c = clips[n]; if(!c) return null; if(!acts.has(n)) acts.set(n, mixer.clipAction(c)); return acts.get(n); };
  let base = null, baseKey = "", over = null, overEnd = 0, last = performance.now(), prevAtk = 0, t = 0;
  const setBase = n => { if(n === baseKey) return; const a = act(n); if(!a) return; a.reset(); a.setLoop(THREE.LoopRepeat); a.enabled = true; a.setEffectiveWeight(1); a.play(); if(base) base.crossFadeTo(a, 0.2, false); base = a; baseKey = n; };
  g.userData.animate = (walk, moving, attack) => {
    const now = performance.now(), dt = Math.min(0.1, (now - last) / 1000); last = now; t += dt;
    if(over && t >= overEnd){ over.fadeOut(0.15); over = null; }
    if(attack > 0.9 && prevAtk < 0.5){ const a = act(K.hits[Math.floor(Math.random() * K.hits.length)]);
      if(a){ if(over && over !== a) over.fadeOut(0.1); a.reset(); a.setLoop(THREE.LoopOnce); a.enabled = true; a.setEffectiveWeight(1); a.fadeIn(0.08); a.play(); over = a; overEnd = t + a.getClip().duration * 0.9; } }
    prevAtk = attack; setBase(moving ? K.move : "Idle_A"); mixer.update(dt); };
  g.userData.animate(0, false, 0);
  g.userData.height = K.height + 0.2; g.userData.skinned = true;
  return g;
}
