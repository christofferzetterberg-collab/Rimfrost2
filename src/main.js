// Rimfrost 2 – stage 3: races, classes and Rimfrost's abilities in a low-poly 3D world, seen from an angled top-down camera.
import * as THREE from "three";
import {clamp, lerp, rng} from "./util.js";
import {B, WATER, height, ground, houses, colliders, buildWorld, zoneAt, landAt, hubAt, placeName, openAt, featureAt, roadDist, GROUND, waterColor, SIGNS, DOORS, STABLE_HORSES} from "./world.js";
import {HUBS, ZONES, LAIRS, EXPLORE, RACE_HUB, DG_DOORS} from "./worlddata.js";
import {KINDS, SPAWNS, ZONE_MOB_MULT, FIXED} from "./mobs.js";
import {DUNGEONS, dungeonAt, regionOf, buildDungeons} from "./dungeon.js";
import {makeHero, makeHumanoid, makeBearForm, makeWolfForm, makeLeopardForm, makeMount} from "./models.js";
import {buildNav, steer, findPath, reachable, setReachFrom} from "./nav.js";
import {P, S, mobs, PXU} from "./state.js";
import {RACES, RACE_CLASSES, CLASSES, AB, BARS, RES_NAME, TALENTS, TIER_NEED, abIcon, drawIcon} from "./rimdata.js";
import {ITEMS, QUAL, SLOTS, SLOT_ORDER, STAT_NAME, GEAR_MAX, CLASS_MAIN, canWear, gearTypeName, upgradeGear} from "./items.js";
import * as G from "./engine.js";
import * as Q from "./quests.js";
import * as K from "./keys.js";
import * as CO from "./coop.js";
import {DEV, initDev, toggle as toggleDev} from "./dev.js";
import {gameHour, isNight, daylight, clockText, minutesToNight, minutesToDay, NIGHT_KINDS} from "./clock.js";
import {NPCS, QOBJECTS, QITEMS, GOODS, GOODS_BASIC, MOUNTS, RIDING_LVL, RIDING_COST} from "./content.js";
const {blocked, tryMove, distU, sees, withPx} = G;

// ---------------------------------------------------------------- renderer, scene, lights
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa9d3ea);
scene.fog = new THREE.Fog(0xa9d3ea, 70, 150);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.5, 400);
const hemi = new THREE.HemisphereLight(0xdff2ff, 0x4a5a3a, 1.1); scene.add(hemi); let lastIns = false;
const sun = new THREE.DirectionalLight(0xfff1d6, 2.0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140}); sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);
addEventListener("resize", () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
const {terrain, water} = buildWorld(scene);
["horse", "gray"].forEach((k, i) => { const s = STABLE_HORSES[i]; if(!s) return; const g = makeMount(MOUNTS[k]); g.position.set(s.x, height(s.x, s.z), s.z); g.rotation.y = s.rot; scene.add(g); });   /* horses in Rimhaven's stable */
// ---------------------------------------------------------------- the people in the towns and camps
const hexc = s => parseInt(s.slice(1), 16);
function npcModel(d){ if(d.trains) return makeHero(d.race, d.trains, RACES);                       // trainers look like their class
  const R = RACES[d.race] || {}, o = {shirt: hexc(d.color), cape: null, belt: 0x4a3220, weaponType: d.shop === "smith" ? "hammer" : d.role === "quest" ? "sword" : "none"};
  if(R.skin) o.skin = hexc(R.skin); if(R.hair) o.hair = hexc(R.hair);
  if(d.race === "elf") o.ears = true; if(d.race === "orc") o.tusks = true; if(d.race === "dwarf"){ o.beard = true; o.stocky = true; } if(d.race === "undead"){ o.gaunt = true; o.eyes = 0xffe86a; }
  if(/Alchem|Apothec|Shaman|Brewer|Herb/.test(d.title + d.name)) o.robe = true; if(d.id === "aldric"){ o.cape = 0x7a1a1a; o.shoulders = 0xd8b04a; }
  return makeHumanoid(o); }
const npcs = NPCS.map(d => { const mesh = npcModel(d); mesh.position.set(d.x, height(d.x, d.z), d.z); mesh.rotation.y = d.rot; scene.add(mesh);
  const n = {...d, mesh, rot0: d.rot, r: 0.45}; mesh.traverse(o => { if(o.isMesh) o.userData.npc = n; }); colliders.push({x: d.x, z: d.z, r: 0.45}); return n; });
// things you can pick up for quests (placed further down, once we know where you can walk)
const nodes = [];
// ---------------------------------------------------------------- dungeons (each its own small map) and the doors in and out
const dgBuilt = buildDungeons(scene);
const portals = [];
{ const mk = (x, z, name, to, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3, 1.2), new THREE.MeshBasicMaterial({visible: false})); m.position.set(x, height(x, z) + 1.5, z); scene.add(m);
    const p = {portal: to, d, name, x, z, mesh: m}; m.userData.node = p; portals.push(p); return p; };
  for(const d of DUNGEONS){ d.door = DOORS[d.id]; mk(d.door.x + d.door.fx * 0.8, d.door.z + d.door.fz * 0.8, "Enter " + d.name, "in", d); const ex = d.tileCenter(...d.exit); mk(ex.x, ex.z - 0.4, "Leave " + d.name, "out", d); } }
const torch = new THREE.PointLight(0xffb070, 0, 32, 1.1); scene.add(torch);
const townLight = new THREE.PointLight(0xffa860, 0, 40, 1.2); scene.add(townLight);
const GHOST_SKY = new THREE.Color(0x26323e), NIGHT_SKY = new THREE.Color(0x0c1424), MOON_COL = new THREE.Color(0x8fa8ff), DUSK_COL = new THREE.Color(0xff9a50);
let sunAng = 1.2, nightNow = false, NIGHT_EXTRA = null, nightT = 0, scaleT = 0;
buildNav();
// where a character starts (and wakes up): next to the square of a town, the fire of a camp, or Rimhaven's fountain
const spotCache = new Map();
const hubSpot = h => { if(spotCache.has(h)) return spotCache.get(h); const rad = h.kind === "camp" ? 2.1 : 4.4; let best = null;
  for(let k = 0; k < 16 && !best; k++){ const a = 0.785 + k * 0.39, x = h.x + Math.cos(a) * rad, z = h.z + Math.sin(a) * rad;
    if(!npcs.some(n => Math.hypot(n.x - x, n.z - z) < 1.9) && !colliders.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.2)) best = {x, z, name: h.name}; }
  best = best || {x: h.x + rad, z: h.z, name: h.name}; spotCache.set(h, best); return best; };
const spawnFor = race => hubSpot(HUBS[RACE_HUB[race] || "frostvik"]);
const SPAWN = spawnFor("human");
setReachFrom(Object.values(HUBS).map(h => { const s = hubSpot(h); return [s.x, s.z]; }));
// a pillar of golden light over things your quests need, seen from afar
const beamGeo = new THREE.CylinderGeometry(0.1, 0.4, 16, 8, 1, true), beamMat = new THREE.MeshBasicMaterial({color: 0xffd84a, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false});
beamGeo.translate(0, 8, 0);
function questBeam(){ const b = new THREE.Mesh(beamGeo, beamMat); b.visible = false; b.raycast = () => {}; b.userData.beam = true; return b; }
const exploreBeams = new Map(Object.values(EXPLORE).map(e => { const b = questBeam(); b.scale.set(2.2, 1.2, 2.2); b.position.set(e.x, height(e.x, e.z), e.z); scene.add(b); return [e, b]; }));
// things you pick up for quests: herbs, ore, crates, sacks…  spread over their zone where you can walk
{ const r = rng(77), herbGeo = new THREE.ConeGeometry(0.22, 0.6, 5), budGeo = new THREE.SphereGeometry(0.16, 8, 6), L = (c, fs = true) => new THREE.MeshLambertMaterial({color: c, flatShading: fs});
  const glowOf = d => d.color ? [hexc(d.color), new THREE.Color(hexc(d.color)).multiplyScalar(0.55).getHex()] : null;
  for(const d of QOBJECTS){ const Z = ZONES[d.zone], spots = [];
    // spread over the whole zone: away from towns and camps, and well apart from each other
    for(let i = 0; spots.length < d.count && i < 6000; i++){ const x = Z.cx + (r() - 0.5) * 320, z = Z.cz + (r() - 0.5) * 320, gap = i < 4000 ? 11 : 6;
      if(zoneAt(x, z) !== d.zone || hubAt(x, z) || roadDist(x, z) < 2.5 || featureAt(x, z) || height(x, z) < 0.5 || openAt(x, z) < 0.3) continue;
      if(Object.values(HUBS).some(h => Math.hypot(x - h.x, z - h.z) < h.R + (i < 4000 ? 16 : 8))) continue;
      if(spots.some(o => Math.hypot(o.x - x, o.z - z) < gap)) continue;
      if(d.far && Math.hypot(x - HUBS[d.far].x, z - HUBS[d.far].z) < d.d) continue;
      if(colliders.some(c => Math.abs(c.x - x) < 4 && Math.abs(c.z - z) < 4 && Math.hypot(c.x - x, c.z - z) < c.r + 1) || spots.some(o => Math.hypot(o.x - x, o.z - z) < 6) || !reachable(x, z)) continue;
      spots.push({x, z}); }
    for(const sp of spots){ const g = new THREE.Group(), k = d.kind;
      if(k === "herb" || k === "glow"){ for(let j = 0; j < 3; j++){ const l = new THREE.Mesh(herbGeo, L(0x3f8f7a)); l.position.set(Math.cos(j * 2.1) * 0.15, 0.3, Math.sin(j * 2.1) * 0.15); l.rotation.z = Math.cos(j * 2.1) * 0.4; g.add(l); }
        const bud = new THREE.Mesh(budGeo, new THREE.MeshBasicMaterial({color: 0x9fe8ff})); bud.position.y = 0.65; bud.userData.glow = glowOf(d) || (d.item === "graveflower" ? [0xe8f0ff, 0x8a8a9a] : [0x9fe8ff, 0x5f8f8a]); g.add(bud); }
      else if(k === "ore"){ const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), L(0x7a7d82)); rock.position.y = 0.35; rock.scale.set(1, 0.75, 1); g.add(rock);
        const glint = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({color: 0xffffff})); glint.position.set(0.25, 0.75, 0.3); glint.userData.glow = glowOf(d); g.add(glint); }
      else if(k === "crystal"){ const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({color: 0xbfd8ff})); c.position.y = 0.5; c.scale.set(1, 1.6, 1); c.userData.glow = [0xc8d8ff, 0x6a7a9a]; g.add(c); }
      else if(k === "stone"){ const st = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.25), L(0x8a8d91)); st.position.y = 0.5; g.add(st);
        const rn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), new THREE.MeshBasicMaterial({color: 0x9fd6ff})); rn.position.set(0, 0.65, 0.14); rn.userData.glow = [0x9fd6ff, 0x5a6a7a]; g.add(rn); }
      else if(k === "badge"){ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), new THREE.MeshBasicMaterial({color: 0xd8b04a})); b.position.y = 0.1; b.rotation.x = 0.3; b.userData.glow = [0xffd860, 0x8a7a4a]; g.add(b); }
      else if(k === "mushroom"){ for(let j = 0; j < 3; j++){ const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 6), L(0xe8e0c8)); st.position.set(j * 0.2 - 0.2, 0.15, (j % 2) * 0.15); g.add(st);
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5, 0, 6.3, 0, 1.6), L(0xc87a4a)); cap.position.set(j * 0.2 - 0.2, 0.3, (j % 2) * 0.15); g.add(cap); } }
      else if(k === "totem"){ const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.4, 6), L(0x7a5a3a)); pole.position.y = 0.7; const hd = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), L(0xb0603a)); hd.position.y = 1.5; g.add(pole, hd); }
      else if(k === "sack"){ const sk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), L(0xc8b48a)); sk.position.y = 0.3; sk.scale.set(1, 0.8, 1); g.add(sk); }
      else if(k === "crate"){ const bx = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), L(0x8a6a42)); bx.position.y = 0.37; const bd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.8), L(0x5a4028)); bd.position.y = 0.5; g.add(bx, bd); }
      else { const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.55), L(0x7a5a3a)); box.position.y = 0.28;
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.1, 0.6), L(0xd8b04a, false)); band.position.y = 0.4; g.add(box, band); }
      g.traverse(o => { if(o.isMesh) o.castShadow = true; });
      const beam = questBeam(); g.add(beam);
      g.position.set(sp.x, height(sp.x, sp.z), sp.z); scene.add(g);
      const n = {def: d, item: d.item, name: d.name, x: sp.x, z: sp.z, active: true, respawn: 0, mesh: g, beam, glow: g.children.find(o => o.userData.glow)}; g.traverse(o => { if(o.isMesh) o.userData.node = n; }); nodes.push(n); } } }
const curDungeon = () => dungeonAt(P.x);
const inCrypt = () => P.x > 500;          // (inside any dungeon)
Object.assign(P, {x: SPAWN.x, z: SPAWN.z, rot: 0, walk: 0, dead: false});

// ---------------------------------------------------------------- HUD helpers (also used by the combat engine)
const $ = id => document.getElementById(id);
const hud = $("hud");
let now = 0;
const floats = [];
function floatText(e, txt, color, big){ if(DEV.sim) return; const d = document.createElement("div"); d.className = "ft" + (big ? " big" : ""); d.textContent = txt; d.style.color = color; hud.appendChild(d);
  const h = (e.mesh || hero)?.userData.height || 2.2;
  floats.push({el: d, x: e.x + (Math.random() - 0.5) * 0.6, z: e.z, y: height(e.x, e.z) + h + 0.2, t: 0}); }
function log(txt, color){ if(DEV.sim) return; const d = document.createElement("div"); d.textContent = txt; if(color) d.style.color = color; const l = $("log"); l.appendChild(d); while(l.children.length > 6) l.firstChild.remove(); }
let errT = -1; function err(txt){ if(now - errT < 0.6) return; errT = now; floatText(P, txt, "#ff8a7a"); }
let bannerT = 0; function banner(txt, sub){ if(DEV.sim) return; $("banner").innerHTML = txt + (sub ? `<div style="font:700 16px 'Alegreya Sans';color:#e8eef1;text-align:center">${sub}</div>` : ""); $("banner").style.opacity = 1; bannerT = 3.5; }

// ---------------------------------------------------------------- the hero model (changes with race, class and druid form)
let hero = null;
function buildHero(){
  if(hero) scene.remove(hero);
  const c = S.cur;
  hero = P.form === "bear" ? makeBearForm() : P.form === "cat" ? makeWolfForm() : P.form === "leopard" ? makeLeopardForm() : makeHero(c.race, c.cls, RACES, c.eq || {});
  if(P.ghost) hero.traverse(o => { if(o.isMesh){ o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; o.material.depthWrite = false; if(o.material.color) o.material.color.lerp(new THREE.Color(0xbfe6ff), 0.6); o.castShadow = false; } });
  scene.add(hero); buildMount();
}
// ---------------------------------------------------------------- riding (from level 20): summon your mount, 60% faster
let mountMesh = null;
function buildMount(){ if(mountMesh){ scene.remove(mountMesh); mountMesh = null; } if(P.mount && MOUNTS[P.mount]){ mountMesh = makeMount(MOUNTS[P.mount]); scene.add(mountMesh); } }
function toggleMount(){ const c = S.cur; if(P.dead) return; if(P.mount) return dismount();
  if(P.casting && P.casting.kind === "mount") return G.cancelCast();
  if(!c.riding) return err("You do not know how to ride");
  if(!c.mounts || !c.mounts.length) return err("You have no mount");
  if(P.combatT > 0) return err("You cannot mount in combat"); if(inCrypt()) return err("You cannot ride here"); if(P.form) return err("Return to your normal form first");
  if(P.casting) return; if(P.sitting) G.standUp(); const k = c.mountSel && c.mounts.includes(c.mountSel) ? c.mountSel : c.mounts[0];
  P.casting = {kind: "mount", mount: k, total: 1.5, el: 0, label: MOUNTS[k].name}; P.auto = false; }
function finishMount(k){ if(P.dead || inCrypt()) return; P.mount = k; buildMount(); G.burst(P.px, P.py, "#d8c08a", 12); }
function dismount(){ if(!P.mount) return; P.mount = null; buildMount(); }
function learnRiding(){ const c = S.cur; if(c.riding || c.level < RIDING_LVL) return; if(c.gold < RIDING_COST) return err("You don't have enough gold");
  c.gold -= RIDING_COST; c.riding = true; G.burst(P.px, P.py, "#9fd6e8", 16); log("You have learned Riding.", "#9fd6e8"); save(); refresh(); }
function buyMount(k){ const c = S.cur, M = MOUNTS[k]; if(!M || !c.riding) return; c.mounts = c.mounts || []; if(c.mounts.includes(k)) return; if(c.gold < M.price) return err("You don't have enough gold");
  c.gold -= M.price; c.mounts.push(k); c.mountSel = k; log(`You bought ${M.name}. Press ${K.keyOf("mount")} to mount.`, "#7be08a");
  const bar = curBar(); if(!bar.includes("mount")){ const i = bar.indexOf(null); if(i >= 0){ bar[i] = "mount"; buildBar(); } } save(); refresh(); }

// ---------------------------------------------------------------- monsters (Rimfrost 1's, see mobs.js), spread over their zones
const RESPAWN = 180, RESPAWN_ELITE = 360, ATK_SPEED = 2.0;   // seconds until a killed monster comes back (same as Rimfrost)
// a free spot in a zone (or near a lair) where you can walk, away from towns, camps and roads
const taken = [];
// the race towns, where brand-new characters start: monsters keep their distance from them, the stronger the further away
const RACE_TOWNS = Object.values(RACE_HUB).map(id => HUBS[id]);
const townDist = (x, z) => Math.min(...RACE_TOWNS.map(h => Math.hypot(x - h.x, z - h.z)));
const minTownDist = K => K.passive ? 0 : Math.min(50, 18 + (K.lv[0] - 1) * 7);
function zoneSpot(r, zone, near, far, minTown = 0){
  const Z = ZONES[zone], L = near ? LAIRS[near] : null;
  for(let i = 0; i < 900; i++){ const x = L ? L.x + (r() - 0.5) * 30 : Z.cx + (r() - 0.5) * 320, z = L ? L.z + (r() - 0.5) * 30 : Z.cz + (r() - 0.5) * 320;   // (the whole zone)
    if(L ? Math.hypot(x - L.x, z - L.z) > 14 : zoneAt(x, z) !== zone) continue;
    if(hubAt(x, z) || Object.values(HUBS).some(h => Math.hypot(x - h.x, z - h.z) < h.R + 8)) continue;
    if(!L && Object.values(LAIRS).some(l => Math.hypot(x - l.x, z - l.z) < l.R + 4)) continue;
    if(far && Math.hypot(x - HUBS[far.hub].x, z - HUBS[far.hub].z) < far.d) continue;
    if(minTown && townDist(x, z) < minTown) continue;
    if(roadDist(x, z) < 2 && r() < 0.7) continue;
    if(featureAt(x, z) || height(x, z) < 0.3 || blocked(x, z, x, z, 0.7) || !reachable(x, z) || taken.some(t => Math.abs(t.x - x) < 2.2 && Math.abs(t.z - z) < 2.2)) continue;
    taken.push({x, z}); return {x, z}; }
  return null; }
// the boss of a lair stands near its middle, on a free spot
function lairSpot(l){ for(let k = 0; k < 24; k++){ const a = 1.57 + k * 0.52, rr = 2.4 + Math.floor(k / 12) * 1.6, x = l.x + Math.cos(a) * rr, z = l.z + Math.sin(a) * rr;
  if(!colliders.some(c => Math.hypot(c.x - x, c.z - z) < c.r + 1.3) && reachable(x, z)) return {x, z}; } return {x: l.x, z: l.z + 2.6}; }
// dungeon monsters are tougher than those outside
const DG_HP = 1.6, DG_DMG = 1.3, GROUP_HP = 0.7, GROUP_DMG = 0.1;
function makeMob(kind, p, lvl, r){ const K = KINDS[kind];
  const m = withPx({kind, K, name: K.name, lvl, elite: K.elite, boss: K.boss, dg: K.dg, novaT: K.nova ? K.nova.every : 0, nova: null, x: p.x, z: p.z, hx: p.x, hz: p.z, rot: r() * 6.28, r: K.r, mesh: K.make(), walk: 0, moving: false,
    maxHp: Math.round((30 + lvl * 18 + lvl * lvl * 1.2) * K.hp * (K.dg ? DG_HP : 1)), dmg: (3 + lvl * 2.4) * K.dmg * (K.dg ? DG_DMG : 1), state: "idle", dead: false, wanderT: r() * 4, wx: null, wz: null, atkT: 1, attackAnim: 0, lastHit: 0, deadT: 0, flash: 0,
    dots: [], slowT: 0, slowPct: 0, rootT: 0, stunT: 0, path: null, inScene: false});
  m.nid = mobs.length; m.hp = m.maxHp; m.baseHp = m.maxHp; m.baseDmg = m.dmg; m.scaleN = 1; m.mesh.traverse(o => { if(o.isMesh) o.userData.mob = m; }); mobs.push(m); return m; }   // nid: the same number on every computer in co-op
{ const r = rng(99), lvlOf = K => K.lv[0] + Math.floor(r() * (K.lv[1] - K.lv[0] + 1));
  // in the starting zones a monster's level grows with its distance from the town, so the lowest ones are closest
  const lvlAt = (K, p, zone) => { if(!(ZONES[zone].race && ZONES[zone].lv[0] === 1) || K.passive) return lvlOf(K); const d0 = minTownDist(K), t = clamp((townDist(p.x, p.z) - d0) / 30 + (r() - 0.5) * 0.3, 0, 0.999);
    return K.lv[0] + Math.floor(t * (K.lv[1] - K.lv[0] + 1)); };
  for(const [kind, n0, zone, near] of SPAWNS){ const K = KINDS[kind], zm = ZONE_MOB_MULT[zone] || 1, n = Math.round(n0 * (K.elite ? Math.min(zm, 1.5) : zm)), md = near ? 0 : minTownDist(K);
    for(let i = 0; i < n; i++){ const p = zoneSpot(r, zone, near, null, md) || (md ? zoneSpot(r, zone, near, null, md * 0.7) : null); if(p) makeMob(kind, p, lvlAt(K, p, zone), r); } }
  for(const [kind, o] of FIXED){ const K = KINDS[kind]; const p = o.lair ? lairSpot(LAIRS[o.lair]) : zoneSpot(r, o.zone, null, {hub: o.far, d: o.d}); if(p) makeMob(kind, p, K.lv[0], r); }
  // night: more wolves, undead and spirits come out (extra monsters that are only there at night, one level higher; made last so co-op numbers match)
  NIGHT_EXTRA = () => { const r2 = rng(321); for(const [kind, n0, zone, near] of SPAWNS){ if(!NIGHT_KINDS.has(kind) || near) continue; const K = KINDS[kind], n = Math.round(n0 * (ZONE_MOB_MULT[zone] || 1) * 0.8), md = minTownDist(K) + 6;
    for(let i = 0; i < n; i++){ const p = zoneSpot(r2, zone, null, null, md) || zoneSpot(r2, zone, null, null, md * 0.7); if(!p) continue; const m = makeMob(kind, p, Math.min(K.lv[1] + 1, lvlAt(K, p, zone) + 1), r2);
      m.night = true; m.dead = true; m.state = "dead"; m.deadT = 99; m.mesh.visible = false; m.nightGone = true; } } };
  for(const d of DUNGEONS) for(const [kind, i, j] of d.mobs){ const K = KINDS[kind]; makeMob(kind, d.tileCenter(i, j), K.boss || K.elite ? K.lv[0] : lvlOf(K), r); }
  NIGHT_EXTRA(); }
function respawn(m){ if(m.night && !isNight()){ Object.assign(m, {dead: true, state: "dead", deadT: 99, nightGone: true, x: m.hx, z: m.hz}); m.mesh.visible = false; return; }   // night monsters wait for the dark
  m.nightGone = false; Object.assign(m, {x: m.hx, z: m.hz, hp: m.maxHp, state: "idle", dead: false, deadT: 0, wx: null, path: null, dots: [], slowT: 0, rootT: 0, stunT: 0, novaT: m.K.nova ? m.K.nova.every : 0}); clearNova(m); m.mesh.visible = true; m.mesh.rotation.z = 0; }
function evade(m){ m.state = "return"; m.dots = []; m.path = null; m.thMe = m.thPet = 0; m.tauntT = 0; if(m.nova) clearNova(m); }

// ---------------------------------------------------------------- characters: create, pick, save (kept in this browser)
const KEY = "rimfrost2-chars";
function loadChars(){ try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){ return []; } }
function saveChars(list){ try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){} }
function save(){ const c = S.cur; if(!c || !running || DEV.sim) return; const at = P.corpse || P; c.x = Math.round(at.x * 10) / 10; c.z = Math.round(at.z * 10) / 10; c.t = Date.now();   // a spirit is saved where its body lies
  // health, mana, death and Resurrection Sickness are kept, so reloading the page changes nothing
  c.hpPct = P.maxHp ? Math.round(P.hp / P.maxHp * 1000) / 1000 : 1; c.mpPct = P.maxMana ? Math.round(P.mana / P.maxMana * 1000) / 1000 : 1;
  c.sick = P.buffs.ressick ? Math.round(P.buffs.ressick) : 0;
  c.death = P.dead ? {ghost: !!P.ghost, gx: Math.round(P.x * 10) / 10, gz: Math.round(P.z * 10) / 10} : null;
  const list = loadChars(), i = list.findIndex(o => o.id === c.id); if(i >= 0) list[i] = c; else list.push(c); saveChars(list); saveWorld(); }
// the world remembers what you killed and gathered: monsters and herbs / ore come back on their own timer, also after reloading the page
const WKEY = "rimfrost2-world";
function saveWorld(){ if(CO.COOP.role === "guest" || DEV.sim) return; const now = Date.now(), w = {mobs: {}, nodes: {}};
  for(const m of mobs) if(m.dead && !m.dg && !m.night && !m.dev && m.nid != null){ const left = (m.elite ? RESPAWN_ELITE : RESPAWN) - m.deadT; if(left > 1) w.mobs[m.nid] = Math.round(now + left * 1000); }
  nodes.forEach((n, i) => { if(!n.active && n.respawn > 1) w.nodes[i] = Math.round(now + n.respawn * 1000); });
  w.dg = mobs.filter(m => m.dg && m.dead && m.nid != null).map(m => m.nid);                                   // dungeon monsters stay dead until the dungeon is reset
  try{ localStorage.setItem(WKEY, JSON.stringify(w)); }catch(e){} }
function loadWorld(){ let w = null; try{ w = JSON.parse(localStorage.getItem(WKEY)); }catch(e){} if(!w) return; const now = Date.now();
  for(const [nid, at] of Object.entries(w.mobs || {})){ const m = mobs[+nid]; if(!m || m.nid !== +nid || at <= now) continue;
    Object.assign(m, {dead: true, state: "dead", hp: 0, deadT: (m.elite ? RESPAWN_ELITE : RESPAWN) - (at - now) / 1000}); m.mesh.visible = false; }
  for(const nid of w.dg || []){ const m = mobs[nid]; if(m && m.dg && m.nid === nid){ Object.assign(m, {dead: true, state: "dead", hp: 0, deadT: 99}); m.mesh.visible = false; } }
  for(const [i, at] of Object.entries(w.nodes || {})){ const n = nodes[+i]; if(n && at > now){ n.active = false; n.respawn = (at - now) / 1000; } } }
addEventListener("beforeunload", () => save());
let running = false;
function play(c){
  S.cur = c; K.useChar(c);                                                        /* every character has its own key bindings */ if(!c.learned) c.learned = []; for(const id of Q.starterAbilities(c.cls)) if(!c.learned.includes(id)) c.learned.push(id);   // the abilities every new character starts with if(!c.quests) c.quests = {}; if(!c.qbag) c.qbag = {};
  let moved = false; if(c.world !== 2){ const sp = spawnFor(c.race); c.x = sp.x; c.z = sp.z; c.quests = {}; c.qbag = {}; delete c.pick; c.world = 2; moved = true; }   // a character from the old map: home town, fresh quest log
  for(const m of mobs) respawn(m);
  for(const it of [...Object.values(c.eq || {}), ...(c.gear || [])]) upgradeGear(it, c.cls);   // old gear gets the new stats
  const talReset = G.migrateTalents();
  G.clearFx(); G.resetPlayer(c.x ?? SPAWN.x, c.z ?? SPAWN.z); setGhost(false); $("ghostbar").hidden = true; closeChat();
  if(blocked(P.x, P.z, P.x, P.z, P.r)){ const sp = spawnFor(c.race); P.x = sp.x; P.z = sp.z; }
  G.petLoad(); closePanel();
  buildHero(); buildBar(); $("pname").textContent = c.name; $("dead").hidden = true; $("chars").hidden = true; running = true;
  banner(zoneName(), `${c.name} – ${RACES[c.race].name} ${CLASSES[c.cls].name}`);
  for(const n of nodes){ n.active = true; n.respawn = 0; }
  loadWorld();
  // health and mana as you left them; Resurrection Sickness keeps ticking; and if you were dead, you still are
  if(c.sick > 0){ P.buffs.ressick = c.sick; P.sickOn = true; G.recompute(false); }
  if(c.hpPct != null){ P.hp = Math.max(1, Math.round(P.maxHp * c.hpPct)); P.mana = Math.round(P.maxMana * (c.mpPct ?? 1)); }
  if(c.death){ P.dead = true; P.hp = 0;
    if(c.death.ghost){ P.corpse = {x: P.x, z: P.z}; P.x = c.death.gx; P.z = c.death.gz; G.petStash(); setGhost(true); }
    else $("dead").hidden = false; }
  updTracker();
  if(moved) log("The world map has been updated. You have been returned to your home town and your quest log has been reset. Level, gear and gold are kept.", "#e6bd5c");
  if(talReset) log("Your talents have been reset due to a talent update.", "#e6bd5c");
  if(c.pick) openPick(); updHelp();
}
function showChars(){
  save(); running = false; closePanel(); $("chars").hidden = false; $("cform").hidden = true; $("clistWrap").hidden = false; hideTip();
  const list = loadChars().sort((a, b) => (b.t || 0) - (a.t || 0)), el = $("clist"); el.innerHTML = "";
  for(const c of list){ const d = document.createElement("div"); d.className = "c";
    d.innerHTML = `<div class="n"><b style="color:${CLASSES[c.cls].color}">${c.name}</b><small>Level ${c.level} ${RACES[c.race].name} ${CLASSES[c.cls].name}</small></div><button class="btn">Play</button><button class="btn ghost">Delete</button>`;
    d.children[1].onclick = () => play(c);
    d.children[2].onclick = () => { if(d.dataset.sure){ saveChars(loadChars().filter(o => o.id !== c.id)); showChars(); } else { d.dataset.sure = 1; d.children[2].textContent = "Sure?"; } };
    el.appendChild(d); }
  if(!list.length) newChar();
}
let pickRace = "human", pickCls = "warrior";
function newChar(){ $("clistWrap").hidden = true; $("cform").hidden = false; $("cerr").textContent = ""; $("cname").value = ""; $("ccancel").hidden = !loadChars().length; renderPick(); $("cname").focus(); }
function renderPick(){
  const rb = $("craces"), cb = $("cclasses"); rb.innerHTML = cb.innerHTML = "";
  if(!RACE_CLASSES[pickRace].includes(pickCls)) pickCls = RACE_CLASSES[pickRace][0];
  for(const k in RACES){ const b = document.createElement("button"); b.textContent = RACES[k].name; b.classList.toggle("on", k === pickRace); b.onclick = () => { pickRace = k; renderPick(); }; rb.appendChild(b); }
  for(const k in CLASSES){ const b = document.createElement("button"); b.textContent = CLASSES[k].name; b.style.color = CLASSES[k].color; b.disabled = !RACE_CLASSES[pickRace].includes(k);
    b.title = b.disabled ? `${RACES[pickRace].name}s cannot be ${CLASSES[k].name}s` : ""; b.classList.toggle("on", k === pickCls); b.onclick = () => { pickCls = k; renderPick(); }; cb.appendChild(b); }
  const first = AB[G.allBarIdsFor(pickCls)[0]];
  $("cdesc").innerHTML = `<b>${RACES[pickRace].name}:</b> ${RACES[pickRace].desc}<br><b>${CLASSES[pickCls].name}:</b> uses ${RES_NAME[CLASSES[pickCls].res].toLowerCase()} and starts with ${first.name}.<br><b>Starts in:</b> ${HUBS[RACE_HUB[pickRace]].name} (${ZONES[Object.keys(ZONES).find(k => ZONES[k].race === pickRace && ZONES[k].lv[0] === 1)].name}).`;
}
$("cnew").onclick = newChar; $("ccancel").onclick = showChars;
$("ccreate").onclick = () => { const name = $("cname").value.trim();
  if(name.length < 2) return $("cerr").textContent = "Pick a name of at least 2 letters.";
  if(loadChars().some(c => c.name.toLowerCase() === name.toLowerCase())) return $("cerr").textContent = "You already have a character with that name.";
  const sp = spawnFor(pickRace), c = {id: Date.now().toString(36), name, race: pickRace, cls: pickCls, level: 1, xp: 0, learned: [], x: sp.x, z: sp.z, t: Date.now(), gold: 0, bag: {potHp: 3}, gear: [], eq: {}, talents: {}, world: 2};
  play(c); save(); };
$("pframe").style.pointerEvents = "auto"; $("pframe").style.cursor = "pointer";        // (set here too, so an old cached page still works)
$("pframe").addEventListener("click", () => { if(!running) return; P.target = null; P.auto = false; CO.select(null); P.selfT = true; });   // click your own portrait: target yourself
$("party").addEventListener("click", e => { const b = e.target.closest("[data-pid]"); if(b) CO.select(b.dataset.pid, true); });
$("cname").addEventListener("keydown", e => { e.stopPropagation(); if(e.key === "Enter") $("ccreate").click(); });
addEventListener("beforeunload", save);

// ---------------------------------------------------------------- the two action bars (keys 1–0 and Shift+1–0 by default)
// Each character keeps its own layout (one per druid form). A slot holds an ability id or one of the SPECIALS.
const SPECIALS = {
  attack:  {name: "Attack", icon: "sword", color: "#b0763a", desc: "Starts or stops attacking your target."},
  pothp:   {name: "Healing Potion", icon: "flask", color: "#d8404a", desc: "Drinks your best healing potion. Potions share a 20 sec cooldown."},
  potmana: {name: "Mana Potion", icon: "flask", color: "#3f7fe0", desc: "Drinks your best mana potion. Potions share a 20 sec cooldown."},
  rest:    {name: "Rest", icon: "halo", color: "#7fa8b8", desc: "Sit down to regenerate health and mana 2.5× faster. Out of combat only."},
  mount:   {name: "Mount", icon: "paw", color: "#b08a5a", desc: "Summons your mount, increasing movement speed by 60%. Out of combat only. Cannot be used in dungeons."}
};
const formKey = () => S.cur.cls === "druid" && P.form ? P.form : "normal";
const idsFor = form => BARS[form === "normal" ? S.cur.cls : "druid_" + form].filter(id => S.cur.learned.includes(id));
function defaultBar(form){ const bar = Array(20).fill(null), ids = idsFor(form);
  ids.forEach((id, i) => { if(i < 16) bar[i] = id; }); if(form === "normal") ["attack", "pothp", "potmana", "rest"].forEach((x, i) => bar[16 + i] = x); return bar; }
function curBar(){ const c = S.cur, f = formKey(); if(!c.bars) c.bars = {}; if(!c.barSeen) c.barSeen = {};
  if(!c.bars[f]){ c.bars[f] = defaultBar(f); c.barSeen[f] = idsFor(f).slice(); }
  // newly learned abilities go into the first free slot (once – if you remove one, it stays removed)
  const bar = c.bars[f], seen = c.barSeen[f] || (c.barSeen[f] = []);
  for(const id of idsFor(f)) if(!seen.includes(id)){ seen.push(id); if(!bar.includes(id)){ const i = bar.indexOf(null); if(i >= 0) bar[i] = id; } }
  return bar; }
let slots = [];
const iconOf = x => SPECIALS[x] ? [SPECIALS[x].icon, SPECIALS[x].color] : abIcon(x);
function useSlot(x){ if(!x || !running) return;
  if(x === "attack") return P.auto ? (P.auto = false) : startAttack(); if(x === "pothp") return G.usePotion("hp"); if(x === "potmana") return G.usePotion("mana"); if(x === "rest") return G.toggleRest(); if(x === "mount") return toggleMount();
  G.tryUse(x); }
function slotTip(x){ if(SPECIALS[x]) return `<h4>${SPECIALS[x].name}</h4>${SPECIALS[x].desc}`; return tipFor(x); }
function buildBar(){
  if(!S.cur) return; hideTip(); const bar = curBar(); slots = [];
  for(const [row, el] of [[0, $("bar1")], [1, $("bar2")]]){ el.innerHTML = "";
    for(let i = 0; i < 10; i++){ const idx = row * 10 + i, x = bar[idx], act = (row ? "s" : "b") + (i + 1);
      const s = document.createElement("div"); s.className = "slot" + (x ? "" : " empty"); s.dataset.idx = idx;
      if(x){ const cv = document.createElement("canvas"); cv.width = cv.height = 52; drawIcon(cv, ...iconOf(x)); s.append(cv); s.draggable = true; }
      s.insertAdjacentHTML("beforeend", `<span class="k">${K.short(K.binds[act][0])}</span><span class="cd"></span>${x === "pothp" || x === "potmana" ? `<span class="n"></span>` : ""}`);
      s.onclick = () => useSlot(bar[idx]);
      s.onmouseenter = e => { if(bar[idx]) showTip(e, slotTip(bar[idx])); }; s.onmouseleave = hideTip;
      s.ondragstart = e => { hideTip(); e.dataTransfer.setData("text/plain", JSON.stringify({from: idx, x: bar[idx]})); };
      s.ondragend = e => { if(e.dataTransfer.dropEffect === "none"){ bar[idx] = null; buildBar(); save(); } };   // dropped outside a bar: removed
      s.ondragover = e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; s.classList.add("drop"); }; s.ondragleave = () => s.classList.remove("drop");
      s.ondrop = e => { e.preventDefault(); let d; try{ d = JSON.parse(e.dataTransfer.getData("text/plain")); }catch(_){ return; } if(!d || !d.x) return;
        if(d.from != null){ const old = bar[idx]; bar[idx] = d.x; bar[d.from] = old; } else bar[idx] = d.x;    // swap with another slot, or place from the spellbook
        buildBar(); save(); };
      el.appendChild(s); slots.push({idx, x, el: s, cd: s.querySelector(".cd"), n: s.querySelector(".n")}); } }
  buildPetBar();
}
// the class bar above the action bars: a hunter's pet orders and pet skills (while a pet is out), or a druid's shapeshifts
const FORMS = [["bear", "formBear"], ["cat", "formCat"], ["leopard", "formTravel"]];
let petSlots = [], petBarKind = null;
function classBarKey(){ const c = S.cur; if(!c) return null; if(c.cls === "hunter"){ const pt = G.getPet(); return pt ? "pet:" + pt.kind : null; }
  if(c.cls === "druid"){ const f = FORMS.filter(([id]) => c.learned.includes(id)).map(f => f[0]).join(","); return f ? "forms:" + f : null; } return null; }
function buildPetBar(){ const el = $("petbar"), key = classBarKey(); petBarKind = key; el.hidden = !key; el.innerHTML = ""; petSlots = []; if(!key) return;
  let list;
  if(key.startsWith("pet:")){ const pt = G.getPet();
    list = [{x: "pa", name: "Attack", icon: "fang", color: "#d84a42", key: "petAttack", desc: "Commands your pet to attack your target."},
      {x: "pf", name: "Follow", icon: "leap", color: "#9ccf8a", key: "petFollow", desc: "Commands your pet to stop attacking and return to you."},
      ...G.PET_SKILLS[pt.kind].map((sk, i) => ({...sk, x: sk.id, key: "petSkill" + (i + 1), skill: true, desc: sk.desc + "<br><i>Click to toggle.</i>"}))]; }
  else list = FORMS.filter(([id]) => S.cur.learned.includes(id)).map(([id, key]) => { const [ic, col] = abIcon(id); return {x: "form:" + id, form: id, name: AB[id].name, icon: ic, color: col, key, desc: AB[id].desc()}; });
  for(const it of list){ const s = document.createElement("div"); s.className = "slot"; const cv = document.createElement("canvas"); cv.width = cv.height = 52; drawIcon(cv, it.icon, it.color); s.append(cv);
    s.insertAdjacentHTML("beforeend", `<span class="k">${K.short((K.binds[it.key] || [])[0])}</span><span class="cd"></span>`);
    s.onclick = () => { if(it.form) G.tryUse(it.form); else if(it.x === "pa") G.petAttackCmd(); else if(it.x === "pf") G.petFollowCmd(); else { G.togglePetSkill(it.x); buildPetBar(); } };
    s.onmouseenter = e => showTip(e, `<h4>${it.name}</h4>${it.desc}`); s.onmouseleave = hideTip;
    el.appendChild(s); petSlots.push({it, el: s, cd: s.querySelector(".cd")}); } }
function updPetBar(){ const key = classBarKey(); if(key !== petBarKind) buildPetBar(); if(!key) return;
  const pt = G.getPet();
  for(const p of petSlots){ const x = p.it.x;
    if(p.it.form){ p.el.classList.toggle("on", P.form === p.it.form); const cd = P.cds[p.it.form] || 0; p.cd.textContent = cd > 0 ? Math.ceil(cd) : ""; continue; }
    if(!pt) continue;
    if(x === "pa") p.el.classList.toggle("on", pt.mode === "attack" || (pt.mode === "assist" && petBusy(pt)));
    else if(x === "pf") p.el.classList.toggle("on", pt.mode === "follow");
    else { const on = G.petSkillOn(x); p.el.classList.toggle("off", !on); p.el.classList.toggle("auto", on); const cd = x === "growl" ? pt.growl : x === "maul" ? pt.maulT || 0 : 0; p.cd.textContent = on && cd > 0 && !pt.dead ? Math.ceil(cd) : ""; } } }
const petBusy = pt => !pt.dead && G.petFight();
function tipFor(id){ const a = AB[id], type = a.res || G.resType(), cost = G.costOf(id), bits = [];
  if(cost) bits.push(`${cost} ${RES_NAME[type].toLowerCase()}`); bits.push(a.cast ? `${a.cast} sec cast` : "Instant"); if(a.cd) bits.push(`${a.cd} sec cooldown`);
  if(a.range) bits.push(a.minRange ? `${Math.round(a.minRange / PXU)}–${Math.round(a.range / PXU)} m range` : `${Math.round(a.range / PXU)} m range`);
  return `<h4>${a.name}</h4><div class="m">${bits.join(" · ")}</div>${a.desc()}`; }
function showTip(e, html){ const t = $("tip"); t.innerHTML = html; t.hidden = false; const r = e.currentTarget.getBoundingClientRect();
  t.style.left = clamp(r.left + r.width / 2 - 140, 8, innerWidth - 290) + "px"; t.style.top = (r.top - t.offsetHeight - 10) + "px"; }
function hideTip(){ $("tip").hidden = true; }

// ---------------------------------------------------------------- character, bag and talent panel
let panelTab = null, sureId = null, talTree = null;
function togglePanel(tab){ if(!running) return; if(panelTab === tab && !$("panel").hidden) return closePanel(); panelTab = tab; sureId = null; hideTip(); $("panel").hidden = false; renderPanel(); }
function openPick(){ if(!S.cur || !S.cur.pick) return; panelTab = "pick"; sureId = null; hideTip(); $("panel").hidden = false; renderPanel(); }
function closePanel(){ if(panelTab === "trade" && (CO.TR.open || CO.TR.waiting)) CO.cancelTrade(); $("panel").hidden = true; panelTab = null; talkNpc = null; capture = null; hideTip(); }
// the threat meter (under the target frame): who the monster you target wants to attack most; on/off in the Esc menu
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const THREAT_KEY = "rimfrost2-threat"; let THREAT_ON = true, threatKey = "";
try{ THREAT_ON = localStorage.getItem(THREAT_KEY) !== "0"; }catch(e){}
function updThreat(){ const el = $("threat"), t = P.target, tf = $("tframe");
  const L = THREAT_ON && t && !t.dead && t.state === "chase" && !tf.hidden ? CO.threatList(t) : [];
  if(!L.length){ if(!el.hidden){ el.hidden = true; threatKey = ""; } return; }
  el.hidden = false; const left = tf.offsetLeft + "px", top = tf.offsetTop + tf.offsetHeight + 6 + "px"; if(el.style.left !== left) el.style.left = left; if(el.style.top !== top) el.style.top = top;
  const rows = L.slice(0, 6).map((e, i) => `<div class="tr${i === 0 ? " top" : ""}${e.me ? " me" : e.mine ? " mine" : ""}"><i style="width:${e.pct}%"></i><span>${esc(e.name)}</span><b>${e.pct}%</b></div>`).join("");
  if(rows !== threatKey){ threatKey = rows; el.innerHTML = `<h4>Threat</h4>` + rows; } }
// trapped in a spot you cannot climb out of (a pit or ledge below steep slopes): after a few seconds of trying, you are moved to the nearest open ground
function unstuck(dt, ok){
  if(P.x > 500 || reachable(P.x, P.z)){ P.trapT = 0; P.trapHit = false; return; }
  P.trapT = (P.trapT || 0) + dt; if(!ok) P.trapHit = true;
  if(P.trapT < 2.5 || !P.trapHit) return;
  P.trapT = 0; P.trapHit = false;
  const cx = Math.floor(P.x) + 0.5, cz = Math.floor(P.z) + 0.5;
  for(let r = 1; r <= 20; r++){ let best = null, bd = 1e9;
    for(let j = -r; j <= r; j++) for(let i = -r; i <= r; i++){ if(Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const x = cx + i, z = cz + j;
      if(!reachable(x, z) || blocked(x, z, x, z, P.r)) continue; const d = Math.hypot(x - P.x, z - P.z); if(d < bd){ bd = d; best = {x, z}; } }
    if(best){ P.x = best.x; P.z = best.z; P.dest = null; marker.visible = false; return; } } }
// the Esc menu
function openGameMenu(){ closePanel(); $("gmenu").hidden = false; $("gthr").textContent = THREAT_ON ? "On" : "Off"; updHelp(); }
function closeGameMenu(){ $("gmenu").hidden = true; }
document.querySelectorAll("#gmenu [data-g]").forEach(b => b.onclick = () => { const g = b.dataset.g; closeGameMenu();
  if(g === "map"){ toggleMap(); return; }
  if(g === "threat"){ THREAT_ON = !THREAT_ON; try{ localStorage.setItem(THREAT_KEY, THREAT_ON ? "1" : "0"); }catch(e){} log(`Threat meter ${THREAT_ON ? "enabled" : "disabled"}.`, "#9fd6e8"); return; }
  if(g === "logout"){ CO.leave(true); showChars(); } else if(g !== "resume") togglePanel(g); });
document.querySelectorAll("#panel .tabs button[data-tab]").forEach(b => b.onclick = () => togglePanel(b.dataset.tab));
document.querySelector("#panel .tabs .x").onclick = closePanel;
// item pictures, drawn once per kind and quality
const GEAR_GLYPH = {sword: "sword", axe: "axe", mace: "hammer", bow: "arrow", staff: "star", wand: "spark", shield: "shield", tome: "mind",
  head: "halo", shoulder: "shield", chest: "shield", hands: "fist", legs: "boot", feet: "boot", neck: "bubble", ring: "nova"};
const icoCache = new Map();
function iconURL(icon, color){ const k = icon + color; if(!icoCache.has(k)){ const cv = document.createElement("canvas"); cv.width = cv.height = 64; drawIcon(cv, icon, color); icoCache.set(k, cv.toDataURL()); } return icoCache.get(k); }
const gearImg = it => `<img src="${iconURL(GEAR_GLYPH[it.wt || it.slot] || "shield", QUAL[it.q].color === "#ffffff" ? "#8c939a" : QUAL[it.q].color)}" style="border-color:${QUAL[it.q].color}">`;
const ITEM_GLYPH = {potHp: ["flask", "#d8404a"], potHp2: ["flask", "#d8404a"], potHp3: ["flask", "#d8404a"], potMana: ["flask", "#3f7fe0"], potMana2: ["flask", "#3f7fe0"]};
const itemImg = k => `<img src="${iconURL(...(ITEM_GLYPH[k] || (k.startsWith("elixir") ? ["flask", "#e0b84a"] : ["claw", "#8c7a5a"])))}">`;
function statLines(it, cmp){
  return Object.keys(STAT_NAME).filter(k => it.st[k] || (cmp && cmp.st[k])).map(k => {
    const v = it.st[k] || 0, unit = (k === "crit" || k === "def") ? "%" : "";
    let diff = ""; if(cmp){ const d = Math.round((v - (cmp.st[k] || 0)) * 10) / 10; if(d) diff = ` <span style="color:${d > 0 ? "#7be08a" : "#ff6b5e"}">(${d > 0 ? "+" : ""}${d}${unit})</span>`; }
    return v ? `+${v}${unit} ${STAT_NAME[k]}${diff}` : `<span class="muted">${STAT_NAME[k]}${diff}</span>`; }).join("<br>");
}
function gearTip(it){ const c = S.cur, cur = c.eq[it.slot], cmp = cur && cur !== it ? cur : null, ok = canWear(it, c.cls);
  return `<h4 style="color:${QUAL[it.q].color}">${it.n}</h4><div class="m">${QUAL[it.q].name} · ${SLOTS[it.slot].name} · ${gearTypeName(it)}</div>${statLines(it, cmp)}
    <div class="m" style="margin-top:4px">${ok ? "" : `<span style="color:#ff6b5e">Cannot be used by ${CLASSES[c.cls].name}s. </span>`}<span style="color:${c.level >= it.il ? "" : "#ff6b5e"}">Requires level ${it.il}</span>${cmp ? ` · compared to ${cmp.n}` : ""}</div>`; }
function showTipAt(e, html){ const t = $("tip"); t.innerHTML = html; t.hidden = false; t.style.left = clamp(e.clientX - 300, 8, innerWidth - 290) + "px"; t.style.top = clamp(e.clientY - 20, 8, innerHeight - t.offsetHeight - 8) + "px"; }
const pct = v => (Math.round(v * 1000) / 10) + "%";
function renderPanel(){
  if($("panel").hidden || !S.cur) return;
  const c = S.cur, b = $("pbody"); let h = "";
  document.querySelectorAll("#panel .tabs button[data-tab]").forEach(x => x.classList.toggle("on", x.dataset.tab === panelTab));
  document.querySelector("#panel .tabs").style.display = panelTab === "dgenter" || panelTab === "npc" || panelTab === "trade" || panelTab === "pick" ? "none" : "";
  if(panelTab === "pick"){ const p = c.pick; if(!p) return closePanel(); const q = Q.qById(p.qid);
    h += `<h3>Choose your reward</h3><div class="muted" style="margin-bottom:6px">${q ? q.name : ""} – take one of these:</div>`;
    p.items.forEach((it, i) => { h += `<div class="it" data-tip="pick:${i}">${gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${it.n}</b><small>${SLOTS[it.slot].name} · ${gearTypeName(it)} · level ${it.il}</small></div><button class="sbtn pri" data-act="takepick" data-id="${i}">Take</button></div>`; }); }
  else if(panelTab === "dgenter"){ if(!dgAsk) return closePanel(); h += dgEnterHTML(dgAsk); }
  else if(panelTab === "npc"){ if(!talkNpc) return closePanel(); h += `<div style="text-align:right;margin:-2px -4px 0"><button class="sbtn" data-act="close">✕</button></div>` + npcHTML(talkNpc); }
  else if(panelTab === "quests"){
    const list = Q.activeQuests(); h += `<h3>Quest log</h3>`;
    if(!list.length) h += `<div class="muted">You have no active quests. Look for a yellow ! above people in your home town.</div>`;
    for(const q of list) h += questCard(q).replace(`<span class="muted">In progress</span>`, `<button class="sbtn" data-act="abandon" data-id="${q.id}">${sureId === q.id ? "Sure?" : "Abandon"}</button>`);
    const done = Q.QUESTS_LIST().filter(Q.qDone); h += `<h3>Completed</h3><div class="muted">${done.map(q => q.name).join(", ") || "None yet."}</div>`;
  } else if(panelTab === "coop"){ h += CO.coopHTML();
  } else if(panelTab === "trade"){ h += `<div style="text-align:right;margin:-2px -4px 0"><button class="sbtn" data-act="close">✕</button></div>` + CO.tradeHTML();
  } else if(panelTab === "spells"){
    h += `<div class="muted" style="margin:4px 0 8px">Drag an ability onto a slot on one of the two action bars. Drag a slot off the bars to empty it, or onto another slot to swap them.</div>`;
    const groups = c.cls === "druid" ? [["Abilities", BARS.druid], ["Bear Form", BARS.druid_bear], ["Wolf Form", BARS.druid_cat]] : [["Abilities", BARS[c.cls]]];
    for(const [title, list] of groups){ const ids = [...new Set(list)].filter(id => c.learned.includes(id) && (title === "Abilities" || !AB[id].form));
      h += `<h3>${title}${c.cls === "druid" && title !== "Abilities" ? " – change to this form to place these on its bar" : ""}</h3><div class="book">`;
      for(const id of ids) h += `<div class="bk" draggable="true" data-drag="${id}" data-tipab="${id}"><canvas width="36" height="36" data-icon="${id}"></canvas><span>${AB[id].name}</span></div>`;
      h += `</div>`; }
    h += `<h3>Other</h3><div class="book">`; for(const x in SPECIALS) if(x !== "mount" || c.riding) h += `<div class="bk" draggable="true" data-drag="${x}" data-tipab="${x}"><canvas width="36" height="36" data-icon="${x}"></canvas><span>${SPECIALS[x].name}</span></div>`; h += `</div>`;
    const later = Q.trainable(); if(later.length) h += `<h3>Not learned yet</h3><div class="muted">${later.map(id => `${AB[id].name} (level ${AB[id].lvl})`).join(", ")} – learn them from your class trainer.</div>`;
  } else if(panelTab === "keys"){
    h += `<div class="row" style="justify-content:space-between;margin:4px 0"><span class="muted">Click a key, then press the new one. Backspace removes it, Esc cancels.</span><button class="sbtn" data-act="resetkeys">${sureId === "resetkeys" ? "Sure?" : "Reset all"}</button></div>`;
    for(const [group, list] of K.groupsFor(c.cls)){ h += `<h3>${group}</h3>`;
      for(const [id, label] of list){ h += `<div class="kb"><span>${label}</span>`;
        for(const slot of [0, 1]){ const waiting = capture && capture.action === id && capture.slot === slot;
          h += `<button class="sbtn ${waiting ? "pri" : ""}" data-act="bind" data-id="${id}" data-slot="${slot}">${waiting ? "Press a key…" : K.pretty(K.binds[id][slot]) || "–"}</button>`; }
        h += `</div>`; } }
  } else if(panelTab === "char"){
    const av = G.avoidChances();
    h += `<div class="row" style="justify-content:space-between"><b style="font-size:16px;color:${CLASSES[c.cls].color}">${c.name}</b><span class="muted">Level ${c.level} ${RACES[c.race].name} ${CLASSES[c.cls].name}</span></div>`;
    h += `<h3>Equipment</h3>`;
    for(const slot of SLOT_ORDER){ const it = c.eq[slot];
      h += it ? `<div class="it" data-tip="eq:${slot}">${gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${it.n}</b><small>${SLOTS[slot].name}</small></div><button class="sbtn" data-act="uneq" data-id="${slot}">Remove</button></div>`
        : `<div class="it"><div style="width:32px;height:32px;border-radius:4px;border:1px dashed #3a4a54"></div><div class="nm muted">${SLOTS[slot].name}<small>empty</small></div></div>`; }
    const MAIN = CLASS_MAIN[c.cls], an = {str: "Strength", agi: "Agility", int: "Intellect", sta: "Stamina"};
    h += `<h3>Attributes</h3><div class="muted" style="font-size:12px;margin-bottom:4px">Main stats for a ${CLASSES[c.cls].name}: ${MAIN.map(k => an[k]).join(", ")}</div><div class="stats">
      ${["str", "agi", "int", "sta"].map(k => `<span${MAIN.includes(k) ? ` style="color:#ffd36b"` : ""}>${an[k]}</span><b>${Math.round(G.attr(k))}</b>`).join("")}
      <span>Spell Damage</span><b>${Math.round(G.gearStat("sd"))}</b><span>Spell Healing</span><b>${Math.round(G.gearStat("sh"))}</b></div>
      <div class="muted" style="font-size:11.5px;margin-top:4px">Strength: attack power${G.STR_FULL.has(c.cls) ? "" : " (less for your class)"} · Agility: ${c.cls === "hunter" || c.cls === "druid" ? "attack power" + (c.cls === "druid" ? " in Bear and Wolf Form" : "") + ", " : ""}attack crit and dodge · Intellect: ${CLASSES[c.cls].res === "mana" ? "mana, spell power and " : ""}spell crit · Stamina: 10 health each</div>`;
    const mu = CLASSES[c.cls].res === "mana";
    h += `<h3>Stats</h3><div class="stats">
      <span>Health</span><b>${P.maxHp}</b>${mu ? `<span>Mana</span><b>${P.maxMana}</b>` : ""}
      <span>Attack Power</span><b>${Math.round(G.pow())}</b>${mu ? `<span>Spell Power</span><b>${Math.round(G.spow())}</b>` : ""}
      <span>Attack Crit</span><b>${pct(G.critChance(null, "phys"))}</b>${mu ? `<span>Spell Crit</span><b>${pct(G.critChance(null, "fire"))}</b><span>Healing bonus</span><b>+${Math.round((G.healMult() - 1) * 100)}%</b>` : ""}<span>Dodge</span><b>${pct(av.dodge)}</b><span>Parry</span><b>${pct(av.parry)}</b>
      <span>Damage taken</span><b>${pct(G.takenMult())}</b><span>Gold</span><b>${c.gold}</b></div>`;
    h += `<h3>Gathering</h3><div class="stats">${Object.entries(Q.PROF).map(([k, nm]) => `<span>${nm}</span><b>${Q.profSkill(k)} / ${Q.PROF_MAX}</b>`).join("")}</div>
      <div class="muted" style="font-size:12px;margin-top:4px">Right-click or press F to gather herbs and ore. Rare nodes require higher skill.</div>`;
  } else if(panelTab === "bag"){
    h += `<div class="row" style="justify-content:space-between"><span><b>${c.gold}</b> gold</span><span class="muted">Equipment ${c.gear.length} / ${GEAR_MAX}</span></div>`;
    h += `<h3>Equipment</h3>`;
    if(!c.gear.length) h += `<div class="muted">No equipment.</div>`;
    for(const it of c.gear){ const ok = canWear(it, c.cls) && c.level >= it.il;
      h += `<div class="it" data-tip="gear:${it.id}">${gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${it.n}</b><small>${SLOTS[it.slot].name} · ${gearTypeName(it)} · level ${it.il}</small></div>
        <button class="sbtn" data-act="equip" data-id="${it.id}" ${ok ? "" : "disabled"}>Equip</button><button class="sbtn" data-act="destroy" data-id="${it.id}">${sureId === it.id ? "Sure?" : "Destroy"}</button></div>`; }
    const keys = Object.keys(c.bag).filter(k => ITEMS[k]);
    h += `<h3>Items</h3>`;
    if(!keys.length) h += `<div class="muted">Your bag is empty.</div>`;
    for(const k of keys){ const I = ITEMS[k];
      h += `<div class="it">${itemImg(k)}<div class="nm"><b>${I.name}</b> <span class="muted">× ${c.bag[k]}</span><small>${I.desc || (I.kind === "junk" ? `Sell price: ${I.sell} gold.` : I.kind === "ore" || I.kind === "herb" ? `Trade good. Sell price: ${I.sell} gold.` : "")}</small></div>${I.kind === "use" ? `<button class="sbtn" data-act="use" data-id="${k}">Use</button>` : ""}</div>`; }
  } else if(panelTab === "tal"){
    const pts = G.talentPoints(), spent = G.talentsSpent(), left = pts - spent;
    if(c.level < 10) h += `<div class="muted" style="margin:4px 0 8px">Talents unlock at level 10. One talent point is awarded per level, up to 21 at level 30.</div>`;
    else h += `<div class="row" style="justify-content:space-between;margin:4px 0"><span><b>${left}</b> point${left === 1 ? "" : "s"} left · ${spent} spent</span></div>`;
    // one specialization at a time: tabs with the points spent in each
    const trees = G.TREES[c.cls]; if(!trees.some(t => t.id === talTree)) talTree = (trees.find(t => G.treePoints(t.id) > 0) || trees[0]).id;
    h += `<div class="tabs vtabs">${trees.map(t => `<button class="${t.id === talTree ? "on" : ""}" data-act="taltree" data-id="${t.id}">${t.name} <span class="muted">${G.treePoints(t.id)}</span></button>`).join("")}</div>`;
    const tr = trees.find(t => t.id === talTree); h += `<div class="muted" style="margin:2px 0 4px">${tr.d}</div>`;
    for(const tier of [1, 2, 3, 4, 5]){ const need = TIER_NEED[tier], open = G.treePoints(talTree) >= need;
      h += `<h3${open ? "" : ` style="opacity:.6"`}>Tier ${tier}${need ? ` · ${need} points in ${tr.name}` : ""}</h3><div class="tier">`;
      for(const t of TALENTS[c.cls].filter(t => t.tier === tier && t.tree === talTree)){ const r = G.T(t.id), can = G.canLearnTalent(t);
        h += `<button class="tal ${can ? "can" : ""} ${r === t.max ? "max" : ""}" data-act="tal" data-id="${t.id}"><div class="n"><span>${t.name}</span><span class="r">${r}/${t.max}</span></div><div class="d">${t.d(Math.max(1, r))}</div></button>`; }
      h += `</div>`; }
  }
  b.innerHTML = h;
  b.querySelectorAll("canvas[data-icon]").forEach(cv => drawIcon(cv, ...iconOf(cv.dataset.icon)));
  b.querySelectorAll("[data-drag]").forEach(el => el.ondragstart = e => { hideTip(); e.dataTransfer.setData("text/plain", JSON.stringify({x: el.dataset.drag})); });
}
$("pbody").addEventListener("click", e => { const el = e.target.closest("[data-act]"); if(!el || el.disabled) return; const a = el.dataset.act, id = el.dataset.id;
  if(a === "equip") G.equipGear(id); else if(a === "uneq") G.unequipGear(id); else if(a === "use") G.useItem(id); else if(a === "tal") G.learnTalent(id);
  else if(a === "close"){ closePanel(); return; }
  else if(a === "coophost"){ CO.host(); return; } else if(a === "coopleave"){ CO.leave(); renderPanel(); return; }
  else if(a === "coopjoin"){ CO.join(($("coopcode") || {}).value); return; }
  else if(a === "tyes") CO.answerTrade(true); else if(a === "tno") CO.answerTrade(false); else if(a === "tcancel") CO.cancelTrade(); else if(a === "taccept") CO.acceptTrade();
  else if(a === "toffer") CO.offerGear(id); else if(a === "tunoffer") CO.unofferGear(id); else if(a === "titem") CO.offerItem(id, +el.dataset.n); else if(a === "tgold") CO.offerGold(($("tgold") || {}).value);
  else if(a === "bind"){ capture = {action: id, slot: +el.dataset.slot}; renderPanel(); return; }
  else if(a === "resetkeys"){ if(sureId === "resetkeys"){ sureId = null; K.resetKeys(); buildBar(); updHelp(); } else sureId = "resetkeys"; renderPanel(); return; }
  else if(a === "spiritres"){ resurrectAtSpirit(); return; }
  else if(a === "dgenter"){ if(dgAsk && distU(P, dgAsk.door) < 8) enterDungeon(dgAsk); return; }
  else if(a === "dgreset"){ if(sureId !== "dgreset"){ sureId = "dgreset"; renderPanel(); return; } sureId = null; if(dgAsk && CO.COOP.role !== "guest" && !CO.anyRemoteIn(regionOf(dgAsk.x0))){ resetDungeon(dgAsk); enterDungeon(dgAsk); } return; }
  else if(a === "taltree") talTree = id;
  else if(a === "learnriding") learnRiding(); else if(a === "buymount") buyMount(id); else if(a === "pickmount"){ S.cur.mountSel = id; if(P.mount){ P.mount = id; buildMount(); } save(); }
  else if(a === "takepick"){ Q.takePick(+id); if(!S.cur.pick) closePanel(); return; }
  else if(a === "accept") Q.acceptQuest(id); else if(a === "turnin") Q.turnIn(id); else if(a === "learn") Q.learnAbility(id);
  else if(a === "buy") Q.buyGoods(id); else if(a === "sell") Q.sellItem(id); else if(a === "sellall") Q.sellItem(id, true); else if(a === "vtab") vendorTab = id; else if(a === "selljunk") Q.sellJunk(); else if(a === "sellgear") Q.sellGear(id);
  else if(a === "buygear"){ const it = shopStock.find(x => x.id === id); if(it) Q.buyGear(it); }
  else if(a === "abandon"){ if(sureId === id){ sureId = null; Q.abandonQuest(id); } else { sureId = id; renderPanel(); } return; }
  else if(a === "buyrespec"){ if(sureId === "buyrespec"){ sureId = null; Q.buyRespec(); } else { sureId = "buyrespec"; renderPanel(); } return; }
  else if(a === "destroy"){ if(sureId === id){ sureId = null; G.destroyGear(id); } else { sureId = id; renderPanel(); } return; }
  sureId = null; hideTip(); renderPanel(); });
$("pbody").addEventListener("mousemove", e => { const ab = e.target.closest("[data-tipab]"); if(ab) return showTipAt(e, slotTip(ab.dataset.tipab)); const el = e.target.closest("[data-tip]"); if(!el) return hideTip(); const [kind, id] = el.dataset.tip.split(":");
  const it = kind === "pick" ? (S.cur.pick && S.cur.pick.items[+id]) : kind === "eq" ? S.cur.eq[id] : kind === "shop" ? shopStock.find(x => x.id === id) : kind === "trade" ? CO.TR.theirs.gear.find(x => x.id === id) : S.cur.gear.find(x => x.id === id); if(it) showTipAt(e, gearTip(it)); });
$("pbody").addEventListener("mouseleave", hideTip);

// ---------------------------------------------------------------- talking to people and picking things up
const USE_RANGE = 3.2;
function nearestUsable(range){ let best = null, bd = range; for(const n of P.ghost ? [...portals, ...graveyards] : [...npcs, ...portals, ...nodes.filter(n => n.active && n.mesh.visible)]){ const d = distU(P, n); if(d < bd){ bd = d; best = n; } } return best; }
function useThing(n){
  if(P.dead && !(P.ghost && (n.spirit || n.portal))) return;                                 // a spirit can only use doors and talk to the Spirit Guide
  if(distU(P, n) > USE_RANGE) return err(n.role ? `Get closer to talk to ${n.name}` : "Get closer to pick that up");
  P.pendingUse = null; P.dest = null;
  if(n.role){ talkTo(n); return; }
  if(n.portal){ if(P.combatT > 0) return err("You cannot do that in combat"); if(n.portal === "in") askEnter(n.d); else exitDungeon(n.d); return; }
  if(!n.active) return;
  const gath = !!Q.gatherReq(n.item);                    // herbs and ore can always be gathered (with enough skill); other things only for a quest
  if(!gath && !Q.needsQItem(n.item)) return err("You do not need this item");
  if(n.def.night && !isNight()) return err("Moonbloom can only be gathered at night");
  if(gath){ const ok = Q.canGather(n.item); if(ok !== true) return err(ok); }
  if(P.combatT > 0) return err("You cannot pick that up in combat");
  if(P.sitting) G.standUp(); dismount();
  P.casting = {kind: "gather", node: n, total: gath ? 1.8 : 1.2, el: 0, label: (gath ? (n.def.kind === "ore" ? "Mining " : "Picking ") : "Picking up ") + n.name};
}
function finishGather(n){ if(!n.active) return; n.active = false; n.respawn = 180; G.burst(n.x * PXU, n.z * PXU, "#f2e2a0", 10); floatText(n, "+1 " + n.name, "#f2e2a0");
  const gath = !!Q.gatherReq(n.item); if(gath) Q.gainProf(n.item);
  if(Q.needsQItem(n.item)) Q.gotQItem(n.item);           // for a quest: it goes to the quest
  else if(gath){ G.addItem(n.item, 1); log(`You receive ${n.name}.`, "#d9e3e7"); save(); refresh(); } }
let talkNpc = null, vendorTab = "buy";
function talkTo(n){ talkNpc = n; vendorTab = "buy"; panelTab = "npc"; sureId = null; hideTip(); $("panel").hidden = false; n.mesh.rotation.y = Math.atan2(P.x - n.x, P.z - n.z); renderPanel(); }
// the quest tracker on the right side of the screen
function updTracker(){
  const el = $("tracker"); if(!running || !S.cur){ el.innerHTML = ""; return; }
  const list = Q.activeQuests();
  el.innerHTML = list.map(q => { const ready = Q.qReady(q);
    const here = curDungeon() ? curDungeon().name : (ZONES[zoneAt(P.x, P.z)] || {}).name;
    const where = o => { if(Q.qProg(q, o) >= q.obj[o][2]) return ""; const ob = q.obj[o], a = ob[0] === "explore" ? null : nearestArea(ob), w = ob[0] === "explore" ? placeName(EXPLORE[ob[1]].x, EXPLORE[ob[1]].z) : a && a.where;
      const nk = (ob[0] === "kill" && NIGHT_KINDS.has(ob[1])) || (ob[0] === "loot" && NIGHT_KINDS.has(ob[3])), no = ob[0] === "collect" && ob[1] === "moonbloom";
      const nh = no ? (isNight() ? ` <span class="wh nt">· Night only (available now)</span>` : ` <span class="wh nt">· Night only (in ${Math.ceil(minutesToNight())} min)</span>`) : nk ? ` <span class="wh nt">· ${isNight() ? "More common at night (now)" : "More common at night"}</span>` : "";
      return (w && w !== here ? ` <span class="wh">· ${w}</span>` : "") + nh; };
    const tn = Q.npcById(Q.qTurnInNpc(q)), th = tn && HUBS[tn.hub];
    return `<div class="tq"><b>${q.name}</b>${dgTag(q)}${ready ? `<div class="ok">Return to ${tn.name}${th && Math.hypot(th.x - P.x, th.z - P.z) > th.R + 10 ? ` <span class="wh">· ${th.name}</span>` : ""}</div>` : q.obj.map((o, i) => `<div>${Q.objName(o)}: ${Q.qProg(q, i)}/${o[2]}${where(i)}</div>`).join("")}</div>`; }).join("");
}
// quests whose monsters live in a dungeon say so ("Dungeon: The Iron Mine")
const qdCache = new Map();
function questDungeon(q){ if(qdCache.has(q.id)) return qdCache.get(q.id); let name = null;
  for(const o of q.obj){ const kind = o[0] === "kill" ? o[1] : o[0] === "loot" ? o[3] : null; if(!kind) continue; const ms = mobs.filter(m => m.kind === kind && !m.dev);
    if(ms.length && ms.every(m => m.dg)){ const d = dungeonAt(ms[0].hx); if(d) name = d.name; } }
  qdCache.set(q.id, name); return name; }
const dgTag = q => { const d = questDungeon(q); return d ? ` <span class="dgtag">Dungeon: ${d}</span>` : ""; };
function questCard(q){
  const ready = Q.qReady(q), active = Q.qActive(q), gq = Q.questGearQ(q);
  const rew = `${Q.qXP(q)} XP · ${Q.qGold(q)} gold${q.items ? " · " + Object.entries(q.items).map(([k, n]) => `${n} × ${ITEMS[k].name}`).join(", ") : ""}${gq >= 0 ? ` · <span style="color:${QUAL[gq].color}">${QUAL[gq].name.toLowerCase()} equipment</span>` : ""}${q.pick ? ` · <span style="color:${QUAL[q.pick.q].color}">your choice of ${QUAL[q.pick.q].name.toLowerCase()} equipment</span>` : ""}`;
  const objs = q.obj.map((o, i) => `<div>${Q.objName(o)}: ${active ? Q.qProg(q, i) : 0}/${o[2]}</div>`).join("") || (q.to ? `<div>Talk to ${Q.npcById(q.to).name}</div>` : "");
  const btn = ready && Q.qTurnInNpc(q) === talkNpc?.id ? `<button class="sbtn pri" data-act="turnin" data-id="${q.id}">Complete quest</button>` : !active ? `<button class="sbtn pri" data-act="accept" data-id="${q.id}">Accept</button>` : `<span class="muted">In progress</span>`;
  return `<div class="qc"><div class="row" style="justify-content:space-between"><b>${q.name}${dgTag(q)}</b><span class="muted">level ${q.lvl}</span></div>
    <div class="qt">${ready && Q.qTurnInNpc(q) === talkNpc?.id ? (q.done || "Well done.") : q.text}</div><div class="qo">${objs}</div><div class="muted" style="font-size:12px">Reward: ${rew}</div><div style="margin-top:6px">${btn}</div></div>`;
}
function npcHTML(n){
  const c = S.cur;
  if(n.role === "spirit") return `<div class="row" style="justify-content:space-between"><b style="font-size:16px;color:#9fd6ff">Spirit Guide</b><span class="muted">${n.name}</span></div>
    <div class="qt" style="margin:6px 0 10px">${P.ghost ? "Your time has not yet come. Return to your corpse, or I can resurrect you here at a cost." : "The living have no business here."}</div>
    ${P.ghost ? `<div class="it"><div class="nm"><b>Resurrect here</b><small>Resurrect now with Resurrection Sickness: damage, healing, health, mana and stats reduced by 75% for ${SICK_TIME / 60} min.</small></div><button class="sbtn pri" data-act="spiritres">Resurrect</button></div>
    <div class="muted" style="margin-top:8px">Alternatively, return to your corpse (marked on your maps) to resurrect with 50% health and mana.</div>` : ""}`; let h = `<div class="row" style="justify-content:space-between"><b style="font-size:16px;color:#7be08a">${n.name}</b><span class="muted">${n.title}</span></div><div class="qt" style="margin:6px 0 4px">${n.hello}</div>`;
  const QUESTS_HERE = [...Q.activeQuests().filter(q => Q.qTurnInNpc(q) === n.id && Q.qReady(q)), ...Q.activeQuests().filter(q => (q.npc === n.id || Q.qTurnInNpc(q) === n.id) && !Q.qReady(q))];
  for(const q of Q.QUESTS_LIST()) if(q.npc === n.id && Q.qAvailable(q)) QUESTS_HERE.push(q);
  if(QUESTS_HERE.length){ h += `<h3>Quests</h3>`; for(const q of [...new Set(QUESTS_HERE)]) h += questCard(q); }
  else if(n.role === "quest") h += `<div class="muted" style="margin-top:8px">${Q.QUESTS_LIST().some(q => q.npc === n.id && Q.qSoon(q)) ? "Return when you have gained more experience." : "I have no tasks for you at this time."}</div>`;
  if(n.role === "trainer" && n.trains !== c.cls) h += `<div class="muted" style="margin-top:8px">I train only ${CLASSES[n.trains].name}s. Seek out a ${CLASSES[c.cls].name} trainer.</div>`;
  else if(n.role === "trainer"){
    h += `<h3>Abilities · you have <b>${c.gold}</b> gold</h3>`;
    const list = Q.trainable();
    if(!list.length) h += `<div class="muted">You have learned all available abilities.</div>`;
    for(const id of list.slice(0, 8)){ const a = AB[id], cost = Q.abCost(id), ok = c.level >= a.lvl;
      h += `<div class="it"><canvas width="32" height="32" data-icon="${id}"></canvas><div class="nm"><b>${a.name}</b> <span class="muted">· ${cost ? cost + " gold" : "free"}</span><small>${ok ? a.desc() : `Requires level ${a.lvl}`}</small></div>
        <button class="sbtn" data-act="learn" data-id="${id}" ${ok && c.gold >= cost ? "" : "disabled"}>Learn</button></div>`; }
    if(c.level >= 10){ const rc = Q.respecCost(c.level), sp = G.talentsSpent();
      h += `<h3>Talents</h3><div class="it"><div class="nm"><b>Reset all talents</b> <span class="muted">· ${rc} gold</span><small>${sp ? `Refunds ${sp} talent points.` : "No talent points spent."}</small></div>
        <button class="sbtn" data-act="buyrespec" ${sp && c.gold >= rc ? "" : "disabled"}>${sureId === "buyrespec" ? "Sure?" : "Reset"}</button></div>`; }
  }
  if(n.role === "stable"){
    h += `<h3>Riding · you have <b>${c.gold}</b> gold</h3>`;
    if(c.riding) h += `<div class="muted">Riding learned.</div>`;
    else h += `<div class="it"><div class="nm"><b>Riding</b> <span class="muted">· ${RIDING_COST} gold</span><small>${c.level >= RIDING_LVL ? "Allows you to ride mounts. Increases movement speed by 60%." : `Requires level ${RIDING_LVL}`}</small></div><button class="sbtn" data-act="learnriding" ${c.level >= RIDING_LVL && c.gold >= RIDING_COST ? "" : "disabled"}>Learn</button></div>`;
    h += `<h3>Mounts</h3>`;
    for(const [k, M] of Object.entries(MOUNTS)){ const own = (c.mounts || []).includes(k), sel = own && (c.mountSel || c.mounts[0]) === k;
      h += `<div class="it"><div style="width:32px;height:32px;border-radius:4px;background:${M.color};border:2px solid ${M.mane}"></div><div class="nm"><b>${M.name}</b> <span class="muted">· ${own ? "yours" : M.price + " gold"}</span><small>${own ? (sel ? "Active mount." : "Owned.") : c.riding ? "Increases movement speed by 60%." : "Requires Riding."}</small></div>
        ${own ? `<button class="sbtn" data-act="pickmount" data-id="${k}" ${sel ? "disabled" : ""}>${sel ? "Riding" : "Ride"}</button>` : `<button class="sbtn" data-act="buymount" data-id="${k}" ${c.riding && c.gold >= M.price ? "" : "disabled"}>Buy</button>`}</div>`; }
    if(c.cls === "druid") h += `<div class="muted" style="margin-top:8px">Druids also learn Travel Form at level ${RIDING_LVL}.</div>`;
  }
  if(n.role === "vendor"){
    h += `<div class="tabs vtabs"><button class="${vendorTab === "buy" ? "on" : ""}" data-act="vtab" data-id="buy">Buy</button><button class="${vendorTab === "sell" ? "on" : ""}" data-act="vtab" data-id="sell">Sell</button><span class="muted" style="margin-left:auto">you have <b>${c.gold}</b> gold</span></div>`;
    if(vendorTab === "buy"){
      if(n.shop === "goods" || n.shop === "basic") for(const [k, price] of (n.shop === "basic" ? GOODS_BASIC : GOODS)) h += `<div class="it">${itemImg(k)}<div class="nm"><b>${ITEMS[k].name}</b> <span class="muted">· ${price} gold</span><small>${ITEMS[k].desc || ""}</small></div><button class="sbtn" data-act="buy" data-id="${k}" ${c.gold >= price ? "" : "disabled"}>Buy</button></div>`;
      if(n.shop.includes("smith")){ shopStock = Q.smithStock(n);
        for(const it of shopStock){ const price = Q.gearPrice(it); h += `<div class="it" data-tip="shop:${it.id}">${gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${it.n}</b><small>${SLOTS[it.slot].name} · level ${it.il} · ${price} gold</small></div><button class="sbtn" data-act="buygear" data-id="${it.id}" ${c.gold >= price && c.level >= it.il ? "" : "disabled"}>Buy</button></div>`; } }
    } else {
      const sell = Object.keys(c.bag).filter(k => ITEMS[k]), jv = Q.junkValue();
      h += `<div class="row" style="justify-content:space-between;margin:4px 0 8px"><span class="muted">Sells all gray items and poor equipment.</span><button class="sbtn pri" data-act="selljunk" ${jv ? "" : "disabled"}>Sell all junk${jv ? ` (${jv} gold)` : ""}</button></div>`;
      if(sell.length) h += `<h3>Items</h3>`;
      for(const k of sell) h += `<div class="it">${itemImg(k)}<div class="nm"><b>${ITEMS[k].name}</b> <span class="muted">× ${c.bag[k]}</span><small>${ITEMS[k].sell} gold each</small></div><button class="sbtn" data-act="sell" data-id="${k}">Sell 1</button>${c.bag[k] > 1 ? `<button class="sbtn" data-act="sellall" data-id="${k}">All</button>` : ""}</div>`;
      if(c.gear.length) h += `<h3>Equipment</h3>`;
      for(const it of c.gear) h += `<div class="it" data-tip="gear:${it.id}">${gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${it.n}</b><small>${Q.gearSell(it)} gold</small></div><button class="sbtn" data-act="sellgear" data-id="${it.id}">Sell</button></div>`;
      if(!sell.length && !c.gear.length) h += `<div class="muted">You have nothing to sell.</div>`;
    }
  }
  return h;
}
let shopStock = [];

// ---------------------------------------------------------------- death
function onDeath(){ $("dead").hidden = false; $("ghostbar").hidden = true; log("You have died.", "#ff6b5e"); }
// ---------------------------------------------------------------- graveyards: one in every zone, seen only by spirits
// Release Spirit takes you there as a spirit. Walk back to your body to come back with half your health and mana,
// or let the Spirit Guide bring you back at once with Resurrection Sickness (everything at 25% for a while).
const SICK_TIME = 180;
const graveyards = [];
{ const r = rng(4242), stoneGeo = new THREE.BoxGeometry(0.55, 0.8, 0.18), crossGeo = new THREE.BoxGeometry(0.14, 1.1, 0.14), armGeo = new THREE.BoxGeometry(0.6, 0.14, 0.14);
  const stoneMat = new THREE.MeshLambertMaterial({color: 0x8a8f96, flatShading: true}), glowMat = new THREE.MeshBasicMaterial({color: 0x9fd6ff, transparent: true, opacity: 0.55, depthWrite: false});
  for(const [zid, Z] of Object.entries(ZONES)){ let spot = null;
    for(let k = 0; k < 900 && !spot; k++){ const rr = 8 + r() * 46, a = r() * 6.283, x = Z.cx + Math.cos(a) * rr, z = Z.cz + Math.sin(a) * rr;
      if(zoneAt(x, z) !== zid || hubAt(x, z) || roadDist(x, z) < 3 || featureAt(x, z) || !reachable(x, z) || height(x, z) < 0.6) continue;
      if(Object.values(HUBS).some(h => Math.hypot(x - h.x, z - h.z) < h.R + 6) || Object.values(LAIRS).some(l => Math.hypot(x - l.x, z - l.z) < l.R + 8)) continue;
      if(colliders.some(c => Math.abs(c.x - x) < 5 && Math.abs(c.z - z) < 5 && Math.hypot(c.x - x, c.z - z) < c.r + 3.2)) continue;
      if(Math.abs(height(x + 2, z) - height(x - 2, z)) > 1.2 || Math.abs(height(x, z + 2) - height(x, z - 2)) > 1.2) continue;
      spot = {x, z}; }
    if(!spot) continue;
    const g = new THREE.Group(); g.position.set(spot.x, height(spot.x, spot.z), spot.z); g.visible = false; scene.add(g);
    for(let k = 0; k < 6; k++){ const a = k / 6 * 6.283 + 0.4, x = Math.cos(a) * 2.6, z = Math.sin(a) * 2.6, st = new THREE.Mesh(k % 2 ? crossGeo : stoneGeo, stoneMat);
      st.position.set(x, height(spot.x + x, spot.z + z) - g.position.y + 0.4, z); st.rotation.y = -a; g.add(st);
      if(k % 2){ const arm = new THREE.Mesh(armGeo, stoneMat); arm.position.set(x, st.position.y + 0.2, z); arm.rotation.y = -a + 1.57; g.add(arm); } }
    // the Spirit Guide: a pale, glowing figure
    const guide = makeHumanoid({shirt: 0xbfe6ff, robe: true, cape: 0x9fd6ff, hair: 0xf4f8fa, skin: 0xdff4ff, beard: true, weaponType: "staff", weapon: 0x9fd6ff});
    guide.traverse(o => { if(o.isMesh){ o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.6; o.material.emissive && o.material.emissive.setHex(0x3a6a8a); } });
    guide.position.set(0, 0, 0); g.add(guide);
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.6, 32), glowMat); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.08; halo.raycast = () => {}; g.add(halo);   // a faint ring on the ground
    const gy = {zone: zid, name: Z.name + " Graveyard", x: spot.x, z: spot.z, mesh: guide, group: g, spirit: true, role: "spirit", r: 0.5, title: "Spirit Guide"};
    guide.traverse(o => { if(o.isMesh) o.userData.npc = gy; }); graveyards.push(gy); } }
// the body you left behind: a glowing mark while you are a spirit
const corpseMark = (() => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 40, 12, 1, true), new THREE.MeshBasicMaterial({color: 0xbfe6ff, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, fog: false, blending: THREE.AdditiveBlending}));
  m.position.y = 20; m.raycast = () => {}; g.add(m); const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 28), new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.7, side: THREE.DoubleSide}));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.1; g.add(ring); g.visible = false; scene.add(g); return g; })();
const CORPSE_RANGE = 6, GHOST_SIGHT = 9;          // a spirit only sees monsters and people within a few yards
// the graveyard you go to: the nearest one – after dying in a dungeon, the nearest to its door, out in the world
function nearestGraveyard(){ const inDg = curDungeon(), from = inDg ? inDg.door : P;
  const list = graveyards.length ? graveyards : Object.values(HUBS).map(hubSpot);
  return list.slice().sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z))[0]; }
// where your body is shown on the maps: in a dungeon, at its door (seen from outside)
function corpseMark2(){ if(!P.corpse) return null; const d = dungeonAt(P.corpse.x); return d && !curDungeon() ? {x: d.door.x, z: d.door.z, dg: d} : {x: P.corpse.x, z: P.corpse.z}; }
function setGhost(on){ P.ghost = on; renderer.domElement.style.filter = on ? "grayscale(.55) saturate(.7) brightness(.92)" : "";
  for(const gy of graveyards) gy.group.visible = on; corpseMark.visible = on && !!P.corpse;
  if(on && P.corpse) corpseMark.position.set(P.corpse.x, height(P.corpse.x, P.corpse.z), P.corpse.z);
  buildHero(); updGhostBar(); }
function releaseSpirit(){ if(!P.dead || P.ghost) return;
  P.corpse = {x: P.x, z: P.z}; G.petStash(); P.target = null; P.auto = false; P.combatT = 0; CO.select(null);
  const sp = nearestGraveyard(); P.x = sp.x + 1.6; P.z = sp.z + 1.6; P.hp = 0; $("dead").hidden = true; setGhost(true);
  log(`You have released your spirit at ${sp.name}. Return to your corpse to resurrect.`, "#9fd6e8"); save(); }
function comeBack(hpPct){ P.dead = false; P.corpse = null; P.shield = 0; P.hots = []; setGhost(false); G.recompute(false); P.hp = Math.max(1, P.maxHp * hpPct); P.mana = P.maxMana * hpPct; P.combatT = 0; G.petLoad(); }
function resurrectAtCorpse(){ if(!P.ghost || !P.corpse || Math.hypot(P.x - P.corpse.x, P.z - P.corpse.z) > CORPSE_RANGE) return;
  P.x = P.corpse.x; P.z = P.corpse.z; comeBack(0.5); G.burst(P.px, P.py, "#ffffff", 20); log("You have been resurrected.", "#7be08a"); save(); }
function resurrectAtSpirit(){ if(!P.ghost) return; closePanel();
  P.buffs.ressick = SICK_TIME; P.sickOn = true; comeBack(1); G.burst(P.px, P.py, "#9fd6ff", 24);
  log(`You have been resurrected with Resurrection Sickness (${SICK_TIME / 60} min).`, "#e6bd5c"); save(); }
// the bar at the top while you are a spirit
function updGhostBar(){ const el = $("ghostbar"); el.hidden = !P.ghost; if(!P.ghost) return;
  const cm = corpseMark2(), d = cm ? Math.hypot(P.x - cm.x, P.z - cm.z) : 1e9, near = !!cm && !cm.dg && P.corpse && Math.hypot(P.x - P.corpse.x, P.z - P.corpse.z) <= CORPSE_RANGE;
  const html = cm && cm.dg ? `<b>You are dead.</b> Your corpse is inside ${cm.dg.name} (${Math.round(d)} m). Enter the dungeon to resurrect.`
    : `<b>You are dead.</b> ${near ? "You are at your corpse." : `Corpse: ${Math.round(d)} m.`} <button id="gres" ${near ? "" : "disabled"}>Resurrect</button>`;
  if(el.dataset.h !== html){ el.dataset.h = html; el.innerHTML = html; } }
$("ghostbar").addEventListener("click", e => { if(e.target.id === "gres") resurrectAtCorpse(); });
// ---------------------------------------------------------------- going into and out of dungeons
// group scaling: every extra player inside a dungeon gives its monsters +70% health and +10% damage (the host decides; health keeps its share when it changes)
function dgPlayers(d){ const reg = regionOf(d.x0); return (regionOf(P.x) === reg && !P.ghost ? 1 : 0) + Object.values(CO.COOP.remotes).filter(r => regionOf(r.x) === reg && !r.gh).length; }
function scaleDungeons(){ if(CO.COOP.role === "guest") return;
  for(const d of DUNGEONS){ const n = Math.max(1, dgPlayers(d)); d.players = n;
    for(const m of mobs){ if(!m.dg || dungeonAt(m.hx) !== d || m.scaleN === n) continue; if(m.state === "chase" && n < m.scaleN) continue;   // (no weakening mid-fight)
      const pct = m.maxHp ? m.hp / m.maxHp : 1; m.maxHp = Math.round(m.baseHp * (1 + GROUP_HP * (n - 1))); m.dmg = m.baseDmg * (1 + GROUP_DMG * (n - 1)); if(!m.dead) m.hp = Math.max(1, Math.round(m.maxHp * pct)); m.scaleN = n; } } }
// a dungeon keeps its state: what you killed stays dead until you choose to reset it at the door
const dgDead = d => mobs.filter(m => m.dg && dungeonAt(m.hx) === d);
const resetDungeon = d => { for(const m of mobs) if(m.dg && dungeonAt(m.hx) === d){ respawn(m); m.dead = false; } saveWorld(); log(`${d.name} has been reset.`, "#e6bd5c"); };
let dgAsk = null;
function askEnter(d){ if(P.ghost) return ghostEnter(d); dgAsk = d; panelTab = "dgenter"; sureId = null; hideTip(); $("panel").hidden = false; renderPanel(); }
function dgEnterHTML(d){ const all = dgDead(d), dead = all.filter(m => m.dead).length, guest = CO.COOP.role === "guest", inside = CO.anyRemoteIn(regionOf(d.x0));
  const lv = DG_DOORS[d.id] ? DG_DOORS[d.id].lv : "";
  return `<div style="text-align:right;margin:-2px -4px 0"><button class="sbtn" data-act="close">✕</button></div><h3>${d.name}</h3><div class="qt">${d.sub || ""}</div><div class="muted" style="margin:6px 0">Dungeon · Level ${lv} · Group recommended</div>
    <div class="muted" style="margin-bottom:4px">${(() => { const n = CO.on() ? 1 + Object.keys(CO.COOP.remotes).length : 1; return n > 1 ? `Monster strength scales with group size (${n} players).` : "Monster strength scales with group size."; })()}</div>
    <div class="muted" style="margin-bottom:8px">${dead ? `Defeated: ${dead} / ${all.length}. Reset the dungeon to respawn all monsters.` : `Monsters: ${all.length}.`}</div>
    <div class="row" style="gap:6px"><button class="sbtn pri" data-act="dgenter">Enter</button>
    <button class="sbtn" data-act="dgreset" ${dead && !guest && !inside ? "" : "disabled"} title="${guest ? "Only the host can reset a dungeon" : inside ? "Someone is inside" : ""}">${sureId === "dgreset" ? "Sure? Reset and enter" : "Reset and enter"}</button></div>
    ${guest ? `<div class="muted" style="margin-top:6px;font-size:12px">Only the group host can reset the dungeon.</div>` : ""}`; }
function enterDungeon(d){ dismount(); closePanel();
  const s = d.tileCenter(...d.start); P.x = s.x; P.z = s.z + 1; P.rot = 0; P.target = null; P.auto = false; P.path = null;
  cam.yaw = cam.yawT = Math.PI; banner(d.name, d.sub); log(`You enter ${d.name}.`, "#e6bd5c"); save(); }
// a spirit at the door of the dungeon where its body lies: going in brings it back to life at the entrance
function ghostEnter(d){ if(!P.corpse || dungeonAt(P.corpse.x) !== d) return err("Your corpse is not in this dungeon");
  enterDungeon(d); comeBack(0.5); G.burst(P.px, P.py, "#ffffff", 20); log(`You have been resurrected at the entrance of ${d.name}.`, "#7be08a"); save(); }
function exitDungeon(d){
  d = d || curDungeon(); if(!d) return;
  P.x = d.door.x + d.door.fx * 3.2; P.z = d.door.z + d.door.fz * 3.2; P.rot = d.door.rot; P.target = null; P.auto = false; P.path = null;
  for(const m of mobs) if(m.dg && m.state === "chase" && dungeonAt(m.hx) === d) evade(m);
  banner(zoneName(), ""); log(`You leave ${d.name}.`, "#93a4ad"); save(); }
$("revive").addEventListener("click", releaseSpirit);

function refresh(){ if(!$("panel").hidden) renderPanel(); updTracker(); }
// ---------------------------------------------------------------- dungeon loot rolls: Need / Greed / Pass (30 sec)
const rollEls = new Map();
function rollShow(d){ if(rollEls.has(d.rid)) return; const it = d.item, el = document.createElement("div"); el.className = "rollbox";
  el.innerHTML = `<div class="rt">${d.from} dropped</div><div class="ri" data-tip="1">${gearImg(it)}<b style="color:${QUAL[it.q].color}">${it.n}</b></div><div class="rb"><button data-c="need">Need</button><button data-c="greed">Greed</button><button data-c="pass">Pass</button></div><div class="rbar"><i></i></div>`;
  el.querySelector(".ri").onmouseenter = e => showTipAt(e, gearTip(it)); el.querySelector(".ri").onmouseleave = hideTip;
  el.querySelectorAll("button").forEach(b => b.onclick = () => { CO.rollChoose(d.rid, b.dataset.c); el.querySelector(".rb").innerHTML = `<span class="muted">You chose ${b.dataset.c} – waiting for the others…</span>`; });
  $("rolls").appendChild(el); rollEls.set(d.rid, {el, t: now}); }
function rollHide(rid){ const r = rollEls.get(rid); if(r){ r.el.remove(); rollEls.delete(rid); hideTip(); } }
function updRolls(){ for(const [rid, r] of rollEls){ const left = Math.max(0, 1 - (now - r.t) / 30); r.el.querySelector(".rbar i").style.width = left * 100 + "%"; if(now - r.t > 34) rollHide(rid); } }
// ---------------------------------------------------------------- co-op chat: Enter opens the box, Enter sends, Esc cancels
function openChat(){ if(!CO.on()) return;                                     /* (only in co-op) */ const box = $("chatbox"); box.hidden = false; down.clear(); setTimeout(() => $("chatin").focus(), 0); }
function closeChat(){ $("chatbox").hidden = true; $("chatin").value = ""; $("chatin").blur(); }
$("chatin").addEventListener("keydown", e => { e.stopPropagation();
  if(e.key === "Enter"){ e.preventDefault(); const t = $("chatin").value; if(t.trim()) CO.chat(t); closeChat(); } else if(e.key === "Escape"){ e.preventDefault(); closeChat(); } });
$("chatin").addEventListener("blur", () => { if(!$("chatin").value.trim()) $("chatbox").hidden = true; });
function chatLine(name, cls, text){ const d = document.createElement("div"); d.className = "chat"; const b = document.createElement("b"); b.textContent = `[${name}]: `; b.style.color = (CLASSES[cls] || {}).color || "#7fc4ff";
  d.append(b, document.createTextNode(text)); const l = $("log"); l.appendChild(d); while(l.children.length > 8) l.firstChild.remove(); }
G.initEngine(scene, {floatText, log, err, banner, now: () => now, onForm: buildHero, onDeath, buildBar, save, refresh, onKill: k => Q.questKill(k), finishGather, finishMount, dismount});
CO.initCoop({scene, hud, log, err, save, floatText, chat: chatLine, rollShow, rollHide, explored: (place, by) => Q.friendExplored(place, by), mountMesh: k => MOUNTS[k] ? makeMount(MOUNTS[k]) : null, toScreen: (...a) => toScreen(...a), refresh: () => { if(panelTab === "coop" || panelTab === "trade") renderPanel(); }, running: () => running,
  openTrade: () => { if(panelTab !== "trade"){ panelTab = "trade"; $("panel").hidden = false; } renderPanel(); }, gearImg: it => gearImg(it), itemImg: k => itemImg(k),
  leaveCrypt: () => exitDungeon(), respawnVis, novaVis: (m, t) => novaVis(m, t),
  someoneEnters: () => {}});
K.setOnSave(() => save());
Q.initQuests({shareExplore: CO.shareExplore, log, err, banner, save, refresh, buildBar, openPick, mobName: k => KINDS[k].name});

// ---------------------------------------------------------------- targeting
const selRing = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.95, 28), new THREE.MeshBasicMaterial({color: 0xff4a3a, transparent: true, opacity: 0.85, depthWrite: false}));
selRing.rotation.x = -Math.PI / 2; selRing.visible = false; scene.add(selRing);
function cycleTarget(){ CO.select(null); const list = mobs.filter(m => !m.dead && distU(P, m) < 30 && sees(P, m)).sort((a, b) => distU(P, a) - distU(P, b)); if(!list.length){ P.target = null; return; } const i = list.indexOf(P.target); P.target = list[(i + 1) % list.length]; }
function startAttack(m){ if(m || !P.target) CO.select(null); m = m || (P.target && !P.target.dead ? P.target : null) || G.nearestEnemy(25); if(!m) return err("No enemy nearby"); if(P.dead) return; dismount(); if(P.form === "leopard") return err("You cannot attack in Travel Form");
  P.target = m; P.auto = true; P.dest = null; marker.visible = false; if(!G.inMeleeOrRange(m)) err("Too far away"); }

// ---------------------------------------------------------------- input (keys can be changed in the Key bindings window)
const down = new Set();                     // physical keys held right now
const cam = {dist: 26, distT: 26, yaw: Math.PI / 4, yawT: Math.PI / 4, pitch: 0.95};
let capture = null;                         // {action, slot} while waiting for a new key in the Key bindings window
function doAction(a, e){
  if(a === "zoomIn") cam.distT = clamp(cam.distT - 3, 12, 48); else if(a === "zoomOut") cam.distT = clamp(cam.distT + 3, 12, 48);
  else if(a === "attack") startAttack(); else if(a === "target") cycleTarget(); else if(a === "rest") G.toggleRest();
  else if(a === "interact"){ if(P.ghost && P.corpse && Math.hypot(P.x - P.corpse.x, P.z - P.corpse.z) <= CORPSE_RANGE) return resurrectAtCorpse();
    const n = nearestUsable(USE_RANGE); if(n) useThing(n); else err("Nothing to interact with"); }
  else if(a === "potHp") G.usePotion("hp"); else if(a === "potMana") G.usePotion("mana");
  else if(a === "map") toggleMap();
  else if(a === "petAttack"){ if(S.cur.cls === "hunter") G.petAttackCmd(); } else if(a === "petFollow"){ if(S.cur.cls === "hunter") G.petFollowCmd(); }
  else if(a === "formBear" || a === "formCat" || a === "formTravel"){ const f = FORMS.find(x => x[1] === a); if(S.cur.cls === "druid" && f && S.cur.learned.includes(f[0])) G.tryUse(f[0]); }
  else if(a === "mount") toggleMount();
  else if(a === "chat") openChat();
  else if(/^petSkill[123]$/.test(a) && S.cur.cls === "hunter"){ const pt = G.getPet(), sk = pt && G.PET_SKILLS[pt.kind][+a.slice(-1) - 1]; if(sk){ G.togglePetSkill(sk.id); buildPetBar(); } }
  else if(["quests", "char", "bag", "spells", "tal", "keys", "coop"].includes(a)) togglePanel(a);
  else if(/^[bs]\d+$/.test(a)){ const idx = (a[0] === "s" ? 10 : 0) + (+a.slice(1)) - 1; useSlot(curBar()[idx]); }
}
addEventListener("keydown", e => {
  if(e.target.tagName === "INPUT") return;
  if(capture){ e.preventDefault(); if(e.code === "Escape"){ capture = null; renderPanel(); return; }
    const combo = (e.code === "Backspace" || e.code === "Delete") ? null : K.comboOf(e); if(combo === null && e.code !== "Backspace" && e.code !== "Delete") return;
    const took = K.setBind(capture.action, capture.slot, combo); capture = null;
    if(took) log(`Key binding removed from “${actionLabel(took)}”.`, "#e6bd5c"); buildBar(); updHelp(); renderPanel(); return; }
  if(!running) return;
  down.add(e.code);
  // Esc: close a window, then cancel a cast, then clear the target, then open the menu
  if(e.code === "Escape"){ if(!$("bigmap").hidden) toggleMap(); else if(!$("gmenu").hidden) closeGameMenu(); else if(!$("panel").hidden) closePanel(); else if(P.casting) G.cancelCast(); else if(P.target || P.ftarget || P.selfT){ P.target = null; P.auto = false; P.selfT = false; CO.select(null); } else openGameMenu(); return; }
  if(!$("gmenu").hidden) return;
  const combo = K.comboOf(e); if(!combo) return;
  const a = K.actionFor(combo) || (e.shiftKey || e.ctrlKey || e.altKey ? null : null);
  if(!a) return;
  if(a === "target" || combo.includes("Tab") || e.ctrlKey || e.altKey) e.preventDefault();
  if(K.isMoveAction(a)) return;                                  // movement is read every frame
  if(e.repeat && /^[bs]\d+$/.test(a)) return;
  doAction(a, e);
});
addEventListener("keyup", e => down.delete(e.code));
addEventListener("blur", () => down.clear());
addEventListener("wheel", e => { if(running && !e.target.closest("#panel") && $("bigmap").hidden) cam.distT = clamp(cam.distT + Math.sign(e.deltaY) * 3, 12, 48); }, {passive: true});
const actionLabel = a => { for(const [, list] of K.ACTIONS) for(const [id, label] of list) if(id === a) return label; return a; };
// the short help box in the corner always shows your current keys
function updHelp(){ for(const b of document.querySelectorAll("#gmenu [data-g]")){ const a = b.dataset.g; if(!b.dataset.label) b.dataset.label = b.textContent;
  b.innerHTML = b.dataset.label + (K.binds[a] && K.binds[a][0] ? ` <small>${K.keyOf(a)}</small>` : ""); } }
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.55, 20), new THREE.MeshBasicMaterial({color: 0xffe08a, transparent: true, opacity: 0.9}));
marker.rotation.x = -Math.PI / 2; marker.visible = false; scene.add(marker);
function pick(e){ mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const meshes = []; for(const m of mobs) if(!m.dead) m.mesh.traverse(o => { if(o.isMesh) meshes.push(o); });
  if(!P.ghost) for(const n of npcs) n.mesh.traverse(o => { if(o.isMesh) meshes.push(o); });
  else for(const gy of graveyards) gy.mesh.traverse(o => { if(o.isMesh) meshes.push(o); });                // a spirit can talk to the Spirit Guide
  for(const n of nodes) if(n.active && n.mesh.visible) n.mesh.traverse(o => { if(o.isMesh) meshes.push(o); });
  for(const p of portals) meshes.push(p.mesh);
  for(const r of Object.values(CO.COOP.remotes)) if(r.mesh && r.mesh.visible) r.mesh.traverse(o => { if(o.isMesh) meshes.push(o); });
  const hm = ray.intersectObjects(meshes, false)[0];
  if(hm){ const u = hm.object.userData; if(u.mob) return {mob: u.mob}; if(u.remote) return {friend: u.remote}; if(u.npc) return {use: u.npc}; if(u.node) return {use: u.node}; }
  const ht = ray.intersectObject(terrain)[0]; return ht ? {point: ht.point} : null; }
renderer.domElement.addEventListener("contextmenu", e => e.preventDefault());
// mouse: left click targets, right click attacks / talks / picks up, hold the right button and move the mouse to turn the camera
const rmb = {down: false, moved: 0, x: 0, y: 0};
renderer.domElement.addEventListener("pointerdown", e => {
  if(!running) return;
  if(e.button === 2){ rmb.down = true; rmb.moved = 0; rmb.x = e.clientX; rmb.y = e.clientY; renderer.domElement.setPointerCapture(e.pointerId); return; }
  if(e.button !== 0 || P.dead) return; const h = pick(e);
  if(h && h.mob){ P.target = h.mob; CO.select(null); }                                                 // left = select only
  else if(h && h.friend) CO.select(h.friend.id);                                                         // a friend: your heals go to them
  else if(!h || h.point){ P.target = null; P.auto = false; CO.select(null); P.selfT = false; }                           // clicking nothing clears your target
});
renderer.domElement.addEventListener("pointermove", e => {
  if(!rmb.down) return; const dx = e.clientX - rmb.x, dy = e.clientY - rmb.y; rmb.x = e.clientX; rmb.y = e.clientY; rmb.moved += Math.abs(dx) + Math.abs(dy);
  if(rmb.moved > 4){ cam.yaw = cam.yawT = cam.yaw - dx * 0.008; cam.pitch = clamp(cam.pitch + dy * 0.004, 0.45, 1.35); renderer.domElement.style.cursor = "grabbing"; }
});
renderer.domElement.addEventListener("pointerup", e => {
  if(e.button !== 2 || !rmb.down) return; rmb.down = false; renderer.domElement.style.cursor = "";
  if(rmb.moved > 4 || (P.dead && !P.ghost) || !running) return;                                   // (a spirit can still right-click the Spirit Guide)                                                     // it was a camera turn, not a click
  const h = pick(e); if(!h) return;
  if(h.mob) startAttack(h.mob); else if(h.use) useThing(h.use); else if(h.friend) CO.tradeRequest(h.friend.id);   // right-click a friend: ask to trade
});

// ---------------------------------------------------------------- monster AI
function turnTo(e, dx, dz, dt, rate = 14){ const want = Math.atan2(dx, dz); let dr = want - e.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); e.rot += dr * Math.min(1, dt * rate); }
function moveMob(m, gx, gz, speed, dt){            // walks around houses, rocks and trees (see nav.js)
  const dir = steer(m, gx, gz, dt, blocked); if(!dir) return false;
  if(tryMove(m, dir.dx * speed * dt, dir.dz * speed * dt)){ m.moving = true; turnTo(m, dir.dx, dir.dz, dt, 10); return true; }
  return false;
}
function updMob(m, dt){
  m.flash = Math.max(0, m.flash - dt); m.attackAnim = Math.max(0, m.attackAnim - dt * 3);
  if(m.dead){ m.deadT += dt; m.mesh.rotation.z = Math.min(1.4, m.deadT * 4);   // tips over, then sinks and respawns
    if(m.deadT > 4) m.mesh.position.y -= dt * 0.6; if(m.deadT > 6) m.mesh.visible = false; if(!m.dg && !CO.guestMob(m) && !(m.night && (m.nightGone || !nightNow)) && m.deadT > (m.elite ? RESPAWN_ELITE : RESPAWN)) respawn(m); return; }
  if(CO.guestMob(m)){ CO.guestUpd(m, dt); return; }                                        // a friend hosts this monster: just follow what they send
  const dp = P.dead || !running ? 1e9 : distU(m, P);
  m.moving = false;
  const free = G.updMobStatus(m, dt); if(m.dead) return;
  if(m.state === "idle"){
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.1 * dt);
    if(m.far) return;                                                                        // nobody near: it just stands there
    if(!m.K.passive) for(const c of CO.cands(m)){ if(c.pet) continue; const range = clamp(9 + (m.lvl - c.lvl) * 1.2, 5, 13) * (nightNow ? 0.85 : 1);   // harder to see you at night
      if(distU(m, c.e) < range && sees(m, c.e)){ G.aggro(m); G.social(m); if(CO.coopMob(m)){ m.threat = m.threat || {}; m.threat[c.id] = (m.threat[c.id] || 0) + 1; } if(c.me) log(`${m.name} attacks you!`, "#ff9a7a"); return; } }
    m.wanderT -= dt; if(m.wanderT <= 0){ m.wanderT = 3 + Math.random() * 5; const a = Math.random() * 6.28, d = Math.random() * 5; m.wx = m.hx + Math.cos(a) * d; m.wz = m.hz + Math.sin(a) * d; }
    if(m.wx != null){ const dx = m.wx - m.x, dz = m.wz - m.z, d = Math.hypot(dx, dz); if(d < 0.3) m.wx = null; else { if(tryMove(m, dx / d * 1.6 * dt, dz / d * 1.6 * dt)) m.moving = true; else m.wx = null; turnTo(m, dx, dz, dt, 6); } }
  } else if(m.state === "chase"){
    const c = CO.mobTarget(m); if(!c){ evade(m); return; }                                   // nobody left to fight
    const tg = c.e, toPet = !!c.pet; m.tgtPet = toPet; m.tgtId = c.id;                        // you, a friend, or a pet – whoever holds the monster's attention
    if(c.me || c.mine) P.combatT = Math.max(P.combatT, 2);
    if(Math.hypot(m.x - m.hx, m.z - m.hz) > 40 || (now - m.lastHit > 10 && distU(m, tg) > 30)){ evade(m); if(c.me) log(`${m.name} is evading.`, "#93a4ad"); return; }
    if(!free) return;                                                                         // stunned
    const dt2 = distU(m, tg), seen = sees(m, tg), rg = m.K.ranged, reach = rg && !m.nova ? rg.range : m.K.reach + tg.r;   // casters stay at range and throw bolts
    if(m.nova){ m.nova.t -= dt; m.nova.mesh.scale.setScalar(1 - Math.max(0, m.nova.t) / m.K.nova.warn * 0.85); if(m.nova.t <= 0) novaBlast(m); else if(!m.K.nova.atTarget) return; }   // Morvane holds still while his nova builds
    else if(m.K.nova){ m.novaT -= dt; if(m.novaT <= 0 && dt2 < 14){ m.novaT = m.K.nova.every; startNova(m, tg); if(!m.K.nova.atTarget) return; } }
    if((dt2 > reach || !seen) && m.rootT <= 0){ const ok = moveMob(m, tg.x, tg.z, m.K.speed * (m.slowT > 0 ? 1 - m.slowPct : 1), dt);
      m.stuckT = ok ? 0 : (m.stuckT || 0) + dt; if(m.stuckT > 3){ m.stuckT = 0; evade(m); if(c.me) log(`${m.name} is evading.`, "#93a4ad"); return; } }   // can't get there (a cliff in the way): give up
    else m.stuckT = 0;
    if(dt2 <= reach + 0.5) turnTo(m, tg.x - m.x, tg.z - m.z, dt, 10);
    m.atkT -= dt;
    if(dt2 <= reach + 0.3 && seen && m.atkT <= 0){ m.atkT = ATK_SPEED; m.attackAnim = 1;
      if(rg && dt2 > m.K.reach + tg.r + 0.5) mobBolt(m, c, m.dmg, rg.color);                     // a spell from range
      else CO.mobAttack(m, c, m.dmg, "melee"); }
  } else if(m.state === "return"){
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * 0.5 * dt); m.slowT = m.rootT = m.stunT = 0;
    const d = Math.hypot(m.hx - m.x, m.hz - m.z);
    if(d < 0.6){ m.state = "idle"; m.hp = m.maxHp; m.path = null; }
    else if(!moveMob(m, m.hx, m.hz, m.K.speed * 1.3, dt)){ m.x += (m.hx - m.x) / d * m.K.speed * dt; m.z += (m.hz - m.z) / d * m.K.speed * dt; m.moving = true; }   // stuck: slip through
  }
  m.walk = m.moving ? m.walk + dt * (m.state === "chase" ? 10 : 6) : m.walk * 0.85;
}
// ranged monsters: a bolt that flies to its target
const bolts = [], boltGeo = new THREE.SphereGeometry(0.18, 8, 6);
function mobBolt(m, c, dmg, color){ const b = new THREE.Mesh(boltGeo, new THREE.MeshBasicMaterial({color: new THREE.Color(color)})); b.position.set(m.x, height(m.x, m.z) + 1.5, m.z); scene.add(b); bolts.push({b, m, c, tg: c.e, dmg}); }
function updBolts(dt){ for(const o of bolts){ const t = o.tg, tx = t.x, ty = height(t.x, t.z) + 1.1, tz = t.z, p = o.b.position, dx = tx - p.x, dy = ty - p.y, dz = tz - p.z, d = Math.hypot(dx, dy, dz), sp = 16 * dt;
    if(d < sp + 0.2 || t.dead){ if(!t.dead) CO.mobAttack(o.m, o.c, o.dmg, "spell"); scene.remove(o.b); o.b.material.dispose(); o.done = true; continue; }
    p.x += dx / d * sp; p.y += dy / d * sp; p.z += dz / d * sp; }
  for(let i = bolts.length - 1; i >= 0; i--) if(bolts[i].done) bolts.splice(i, 1); }
// Morvane's Ashen Nova: a red circle grows under him – get out before it fills, or take a big hit
// Grizzik's Cave-in works the same way, but the circle appears under his target and he keeps fighting while it fills
function startNova(m, tg){ const N = m.K.nova, g = new THREE.CircleGeometry(N.r, 40); g.rotateX(-Math.PI / 2); const at = N.atTarget && tg ? tg : m;
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: 0xff3a2a, transparent: true, opacity: 0.35, depthWrite: false})); mesh.position.set(at.x, height(at.x, at.z) + 0.1, at.z); scene.add(mesh);
  m.nova = {t: N.warn, mesh, x: at.x, z: at.z}; m.attackAnim = 1; const nm = N.name || "Ashen Nova";
  log(N.atTarget ? `${m.name} brings the ceiling down – get out of the red circle!` : `${m.name} begins to cast ${nm} – get away from ${N.she ? "her" : "him"}!`, "#ff8a7a"); floatText(m, nm + "!", "#ff5a2a", true); }
// a guest sees the host's nova (t = seconds left, 0 = none)
function novaVis(m, nv){ const t = nv ? nv[0] : 0; if(t > 0){ if(!m.nova){ const N = m.K.nova, g = new THREE.CircleGeometry(N.r, 40); g.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({color: 0xff3a2a, transparent: true, opacity: 0.35, depthWrite: false})); scene.add(mesh); m.nova = {t, mesh}; }
    m.nova.t = t; m.nova.x = nv[1]; m.nova.z = nv[2]; m.nova.mesh.position.set(nv[1], height(nv[1], nv[2]) + 0.1, nv[2]); m.nova.mesh.scale.setScalar(1 - t / m.K.nova.warn * 0.85); }
  else if(m.nova) clearNova(m); }
function respawnVis(m){ m.dead = false; m.deadT = 0; m.mesh.visible = true; m.mesh.rotation.z = 0; }
function clearNova(m){ if(m.nova){ scene.remove(m.nova.mesh); m.nova.mesh.geometry.dispose(); m.nova = null; } }
function novaBlast(m){ const N = m.K.nova, at = {x: m.nova.x, z: m.nova.z}; G.ring(at.x * PXU, at.z * PXU, N.r * PXU, N.atTarget ? "#a8a08a" : "#ff5a2a"); G.burst(at.x * PXU, at.z * PXU, N.atTarget ? "#8a8070" : "#ff7a3a", 30);
  for(const c of CO.cands(m)) if(distU(c.e, at) < N.r) CO.mobAttack(m, c, m.dmg * N.dmg, "spell");       // everyone standing in it
  clearNova(m); }
function separate(){ const act = mobs.filter(m => m.state === "chase");
  for(let i = 0; i < act.length; i++) for(let j = i + 1; j < act.length; j++){ const a = act[i], b = act[j], d = distU(a, b), min = a.r + b.r; if(d < min && d > 0.01){ const p = (min - d) / 2, ux = (a.x - b.x) / d, uz = (a.z - b.z) / d; tryMove(a, ux * p, uz * p); tryMove(b, -ux * p, -uz * p); } } }

// ---------------------------------------------------------------- the player moving
function updMovement(dt){
  P.moving = false; let voluntary = false;
  if(P.dead && !P.ghost) return false;                                                       // (a spirit can walk)
  if(P.target && P.target.dead){ P.target = null; P.auto = false; }
  if(P.dash){                                                                                // Charge: rush to the target
    const t = P.dash.t; P.dash.el = (P.dash.el || 0) + dt;
    if(!t || t.dead || P.dash.el > 0.6) P.dash = null;
    else { const d = distU(P, t), dx = (t.x - P.x) / d, dz = (t.z - P.z) / d, sp = P.dash.speed / PXU;
      tryMove(P, dx * sp * dt, dz * sp * dt); turnTo(P, dx, dz, dt, 30); P.moving = true;
      if(d < t.r + P.r + 0.6){ G.stun(t, 1); P.dash = null; } }
    return false;
  }
  if(P.leap){ tryMove(P, P.leap.vx / PXU * dt, P.leap.vy / PXU * dt); P.leap.t -= dt; P.moving = true; if(P.leap.t <= 0) P.leap = null; return false; }   // Disengage
  let dir = null;
  // camera-relative keys: W is always "up" on the screen
  let ix = 0, iz = 0;
  if(K.held("up", down)) iz -= 1; if(K.held("down", down)) iz += 1;
  if(K.held("left", down)) ix -= 1; if(K.held("right", down)) ix += 1;
  if(ix || iz){ const l = Math.hypot(ix, iz), s = Math.sin(cam.yaw), c = Math.cos(cam.yaw); dir = {dx: (ix * c + iz * s) / l, dz: (-ix * s + iz * c) / l}; voluntary = true; }
  else if(P.dest){ dir = Math.hypot(P.dest.x - P.x, P.dest.z - P.z) < 0.3 ? null : steer(P, P.dest.x, P.dest.z, dt, blocked); if(!dir){ P.dest = null; marker.visible = false; } else voluntary = true; }
   // walk up to what you attack
  if(dir){ const sp = G.playerSpeed(), ok = tryMove(P, dir.dx * sp * dt, dir.dz * sp * dt); if(ok) P.moving = true; else if(P.dest){ P.dest = null; marker.visible = false; }
    turnTo(P, dir.dx, dir.dz, dt); P.lastMv = {px: dir.dx, py: dir.dz}; unstuck(dt, ok); }
  else if(P.auto && P.target && G.inMeleeOrRange(P.target)) turnTo(P, P.target.x - P.x, P.target.z - P.z, dt);
  else if(P.casting && P.casting.t) turnTo(P, P.casting.t.x - P.x, P.casting.t.z - P.z, dt);
  return voluntary && P.moving;
}

// ---------------------------------------------------------------- HUD
const plates = new Map();
function plateFor(m){ let p = plates.get(m); if(!p){ p = document.createElement("div"); p.className = "plate"; p.innerHTML = `<span></span><div class="hb"><i></i></div>`; hud.appendChild(p); plates.set(m, p); } return p; }
const v3 = new THREE.Vector3();
function toScreen(x, y, z){ v3.set(x, y, z).project(camera); return {x: (v3.x + 1) / 2 * innerWidth, y: (1 - v3.y) / 2 * innerHeight, on: v3.z < 1 && Math.abs(v3.x) < 1.1 && Math.abs(v3.y) < 1.1}; }
const lvlColor = l => { const d = l - S.cur.level; return d >= 4 ? "#ff5a4f" : d >= 2 ? "#ff9a3c" : d >= -2 ? "#f3dc55" : d > -6 ? "#62d36b" : "#8d979c"; };
const npcPlates = new Map(), signPlates = new Map();
function npcPlate(n){ let p = npcPlates.get(n); if(!p){ p = document.createElement("div"); p.className = "plate npc"; p.innerHTML = `<div class="mk"></div><span>${n.name}</span><small>&lt;${n.title}&gt;</small>`; hud.appendChild(p); npcPlates.set(n, p); } return p; }
// buffs and debuffs: small icons with the seconds left, under your frame and the target frame
const AURA = {   // buff key → ability whose icon it uses
  shout: "shout", bark: "bark", avenging: "avenging", bubble: "bubble", dash: "dash", hotstreak: "pyroblast",
  ignite: "fireball", deep: "rend", burn: "firearrow", pyro: "pyroblast"};
const ITEM_BUFF = {elixir: ["Elixir of Strength", "#e0b84a"], ironskin: ["Elixir of Ironskin", "#a8b0bc"], keen: ["Elixir of Keenness", "#ff9a4a"], sage: ["Elixir of Wisdom", "#9fd6e8"]};
function abAura(id, left, good, name){ const [ic, col] = abIcon(id); return {url: iconURL(ic, col), name: name || AB[id].name, left, good}; }
function playerAuras(){ const L = [];
  for(const k in P.buffs){ if(ITEM_BUFF[k]) L.push({url: iconURL("flask", ITEM_BUFF[k][1]), name: ITEM_BUFF[k][0], left: P.buffs[k], good: true});
    else if(AURA[k] && AB[AURA[k]]) L.push(abAura(AURA[k], P.buffs[k], true, k === "hotstreak" ? "Hot Streak" : null)); }
  for(const h of P.hots) L.push(AB[h.key] ? abAura(h.key, h.left, true) : {url: iconURL("bloom", "#7be08a"), name: "Healing", left: h.left, good: true});
  if(P.shield > 0) L.push({url: iconURL("shield", "#fff2b0"), name: `Shield (${Math.ceil(P.shield)} left)`, left: P.shieldT, good: true});
  if(P.sitting) L.push({url: iconURL("halo", "#7fa8b8"), name: "Resting", left: null, good: true});
  if(P.potCd > 0) L.push({url: iconURL("flask", "#8a8a8a"), name: "Potion cooldown", left: P.potCd, good: false});
  return L; }
function targetAuras(m){ const L = [];
  for(const d of m.dots){ const id = AURA[d.key] || (AB[d.key] ? d.key : null); L.push(id ? abAura(id, d.left, false) : {url: iconURL("drop", "#d0453a"), name: d.key, left: d.left, good: false}); }
  if(m.stunT > 0) L.push({url: iconURL("fist", "#e0b050"), name: "Stunned", left: m.stunT, good: false});
  if(m.rootT > 0) L.push({url: iconURL("roots", "#a0b860"), name: "Rooted", left: m.rootT, good: false});
  if(m.slowT > 0) L.push({url: iconURL("snowflake", "#8fd8ff"), name: `Slowed ${Math.round(m.slowPct * 100)}%`, left: m.slowT, good: false});
  if(m.tauntT > 0) L.push({url: iconURL("roar", "#e6bd5c"), name: "Taunted by your pet", left: m.tauntT, good: false});
  return L; }
const fmtLeft = s => s == null ? "" : s >= 60 ? Math.ceil(s / 60) + "m" : Math.ceil(s) + "";
function setAuras(el, list){ const html = list.map(a => `<span class="aura ${a.good ? "" : "bad"}" title="${a.name}"><img src="${a.url}"><b>${fmtLeft(a.left)}</b></span>`).join("");
  if(el.innerHTML !== html) el.innerHTML = html; }
const BUFF_NAMES = {shout: "War Cry", bark: "Barkskin", avenging: "Righteous Wrath", bubble: "Divine Shield", dash: "Dash"};
function updHUD(dt){
  for(const f of floats){ f.t += dt; const s = toScreen(f.x, f.y + f.t * 1.2, f.z); f.el.style.left = s.x + "px"; f.el.style.top = s.y + "px"; f.el.style.opacity = Math.min(1, 2.2 - f.t * 2); if(f.t > 1.1) f.el.remove(); }
  for(let i = floats.length - 1; i >= 0; i--) if(floats[i].t > 1.1) floats.splice(i, 1);
  if(bannerT > 0){ bannerT -= dt; if(bannerT <= 0) $("banner").style.opacity = 0; }
  hud.style.visibility = running ? "" : "hidden";
  if(!running) return;
  const c = S.cur;
  $("plvl").textContent = "Level " + c.level; $("phpi").style.width = (P.hp / P.maxHp * 100) + "%"; $("phpt").textContent = `${Math.ceil(P.hp)} / ${P.maxHp}`;
  const rt = G.resType(), rmax = G.maxRes(rt); $("presi").style.width = (P[rt] / rmax * 100) + "%"; $("presi").style.background = `var(--${rt})`; $("prest").textContent = `${Math.floor(P[rt])} / ${rmax}`;
  { const html = P.form === "cat" ? Array.from({length: 5}, (_, i) => `<i class="${i < P.cp ? "on" : ""}"></i>`).join("") : ""; if($("pcp").innerHTML !== html) $("pcp").innerHTML = html; }
  setAuras($("pbuffs"), playerAuras());
  // your pet: its health and rage (bear) or energy (wolf), under your frame
  { const pt = c.cls === "hunter" ? G.getPet() : null; $("ppet").hidden = !pt;
    if(pt){ $("ppetn").textContent = pt.name; $("ppetm").textContent = pt.dead ? "Dead" : pt.mode === "follow" ? "Following" : pt.mode === "attack" ? "Attacking" : "Assisting";
      $("ppethi").style.width = (pt.hp / pt.maxHp * 100) + "%"; $("ppethi").style.background = pt.dead ? "#555" : ""; $("ppetht").textContent = `${Math.ceil(pt.hp)} / ${pt.maxHp}`;
      const rk = pt.kind === "bear" ? "rage" : "energy"; $("ppetri").style.width = Math.min(100, pt.res) + "%"; $("ppetri").style.background = `var(--${rk})`; $("ppetrt").textContent = `${Math.floor(pt.res)} / 100`; } }
  updPetBar(); if(P.ghost) updGhostBar();
  { const pf = $("pframe"), top = pf.offsetTop + pf.offsetHeight + 8 + "px"; if($("party").style.top !== top) $("party").style.top = top; }
  CO.partyHUD();
  updThreat();
  const need = G.xpNeed(c.level); $("xpi").style.width = (c.xp / need * 100) + "%"; $("xpt").textContent = `${c.xp} / ${need} XP`;
  if(P.target || P.ftarget) P.selfT = false;
  { const pf = $("pframe"), left = pf.offsetLeft + pf.offsetWidth + 12 + "px"; if($("tframe").style.left !== left) $("tframe").style.left = left; }   // the target frame sits right of yours
  const t = P.target, tf = $("tframe"), fr = !t && P.ftarget ? CO.remoteById(P.ftarget) : null, me = !t && !fr && P.selfT; setAuras($("tauras"), t && !t.dead ? targetAuras(t) : []);
  tf.classList.toggle("friend", !!fr); tf.classList.toggle("self", !!me);
  if(me){ tf.hidden = false; $("tname").textContent = c.name; $("tlvl").textContent = "Level " + c.level; $("tlvl").style.color = "#7be08a";
    $("thpi").style.width = (P.hp / P.maxHp * 100) + "%"; $("thpt").textContent = `${Math.ceil(P.hp)} / ${P.maxHp}`; $("tstate").textContent = ""; }
  else
  if(fr){ tf.hidden = false; $("tname").textContent = fr.name; $("tlvl").textContent = "Level " + fr.lvl; $("tlvl").style.color = "#7fc4ff";
    $("thpi").style.width = Math.max(0, Math.min(100, fr.hp / (fr.mhp || 1) * 100)) + "%"; $("thpt").textContent = `${Math.round(fr.hp)} / ${fr.mhp}`;
    $("tstate").textContent = fr.gh ? "Spirit" : fr.dead ? "Dead" : ""; }
  else if(t && !t.dead){ tf.hidden = false; $("tname").textContent = t.name; $("tlvl").textContent = "Level " + t.lvl; $("tlvl").style.color = lvlColor(t.lvl);
    $("thpi").style.width = (t.hp / t.maxHp * 100) + "%"; $("thpt").textContent = `${Math.ceil(t.hp)} / ${t.maxHp}`;
    $("tstate").textContent = t.stunT > 0 ? "Stunned" : t.rootT > 0 ? "Rooted" : t.slowT > 0 ? "Slowed" : t.state === "chase" ? (P.auto ? "Attacking" : "In combat") : t.state === "return" ? "Evading" : "Calm"; }
  else tf.hidden = true;
  // cast bar
  const cb = $("cast");
  if(P.casting){ cb.style.visibility = "visible"; cb.firstElementChild.style.width = (P.casting.el / P.casting.total * 100) + "%"; cb.lastElementChild.textContent = P.casting.label; }
  else if(P.castDone){ cb.style.visibility = "visible"; cb.firstElementChild.style.width = "100%"; cb.lastElementChild.textContent = P.castDone.label; }
  else cb.style.visibility = "hidden";
  // action bar: cooldowns, range, resources
  document.querySelector("#gmenu [data-g=tal]").classList.toggle("glow", G.talentPoints() - G.talentsSpent() > 0);
  const potN = keys => keys.reduce((a, k) => a + (c.bag[k] || 0), 0);
  for(const s of slots){ const x = s.x; if(!x) continue;
    if(SPECIALS[x]){
      if(x === "pothp" || x === "potmana"){ const n = potN(x === "pothp" ? ["potHp", "potHp2", "potHp3"] : ["potMana", "potMana2"]); s.n.textContent = n; s.el.classList.toggle("nores", !n); s.cd.textContent = P.potCd > 0 ? Math.ceil(P.potCd) : ""; }
      s.el.classList.toggle("on", (x === "attack" && !!P.auto) || (x === "rest" && !!P.sitting) || (x === "mount" && (!!P.mount || P.casting?.kind === "mount"))); continue; }
    const a = AB[x], own = P.cds[x] || 0, gcd = a.offGcd ? 0 : P.gcd;
    s.cd.textContent = own > 0 ? Math.ceil(own) : gcd > 0 ? " " : "";
    const type = a.res || G.resType(); s.el.classList.toggle("nores", !a.form && P[type] < G.costOf(x));
    { const dd = t && !t.dead ? (distU(P, t) - t.r) * PXU : 0; s.el.classList.toggle("oor", !!(a.tgt === "enemy" && t && !t.dead && (dd > a.range || (a.minRange && dd < a.minRange)))); }   // red: too far, or too close for a bow
    s.el.classList.toggle("on", !!(a.form && P.form === x) || P.casting?.id === x); }
  // names and quest marks over the people
  for(const n of npcs){ const p = npcPlate(n), s = distU(P, n) < (P.ghost ? GHOST_SIGHT : 30) ? toScreen(n.x, height(n.x, n.z) + n.mesh.userData.height + 0.3, n.z) : {on: false};
    if(!s.on){ p.style.display = "none"; continue; } p.style.display = ""; p.style.left = s.x + "px"; p.style.top = s.y + "px";
    const mk = Q.npcMarker(n.id); p.firstChild.textContent = mk === "…" ? "?" : mk || ""; p.firstChild.className = "mk" + (mk === "…" ? " gray" : ""); }
  // names over sign posts (Rimhaven's districts and the places quests send you to)
  for(const sg of SIGNS){ let p = signPlates.get(sg); const near = distU(P, sg) < 24 && !inCrypt();
    if(!p){ if(!near) continue; p = document.createElement("div"); p.className = "plate sign"; p.innerHTML = `<span>${sg.name}</span>`; hud.appendChild(p); signPlates.set(sg, p); }
    const s = near ? toScreen(sg.x, height(sg.x, sg.z) + 2.3, sg.z) : {on: false}; if(!s.on){ p.style.display = "none"; continue; } p.style.display = ""; p.style.left = s.x + "px"; p.style.top = s.y + "px"; }
  // nameplates for monsters near you
  for(const m of mobs){ const p = plateFor(m), qm = questMob(m), near = !m.dead && distU(P, m) < (P.ghost ? GHOST_SIGHT : qm ? 40 : 26);
    if(!near){ p.style.display = "none"; continue; } const s = toScreen(m.x, height(m.x, m.z) + m.mesh.userData.height + 0.3, m.z); if(!s.on){ p.style.display = "none"; continue; }
    p.style.display = ""; p.style.left = s.x + "px"; p.style.top = s.y + "px"; const sp = p.firstChild; sp.textContent = `${m.name} (${m.lvl}${m.boss ? " Boss" : m.elite ? " Elite" : ""})`; sp.style.color = lvlColor(m.lvl);
    p.lastChild.style.display = (m.hp < m.maxHp || m === P.target) ? "" : "none"; p.lastChild.firstChild.style.width = (m.hp / m.maxHp * 100) + "%"; p.classList.toggle("sel", m === P.target); p.classList.toggle("q", qm); }
}

// ---------------------------------------------------------------- minimap: turns with the camera, so up is always the way W walks
const MM = $("minimap"), mm = MM.getContext("2d"), MM_PX = 2, MM_R = 45;           // MM_PX pixels per world unit in the map picture, MM_R units from centre to edge
const mapImg = (() => { const cv = document.createElement("canvas"), w = (B.x1 - B.x0) * MM_PX, h = (B.z1 - B.z0) * MM_PX; cv.width = w; cv.height = h; const g = cv.getContext("2d"), img = g.createImageData(w, h);
  const rgb = v => [v >> 16 & 255, v >> 8 & 255, v & 255], COL = {}; for(const k in GROUND) COL[k] = rgb(GROUND[k][0]);
  for(let j = 0; j < h; j++) for(let i = 0; i < w; i++){ const x = i / MM_PX + B.x0, z = j / MM_PX + B.z0, hh = height(x, z), k = (j * w + i) * 4;
    let c = hh < WATER ? rgb(waterColor(x, z)) : COL[ground(x, z)]; const shade = hh < WATER ? 1 : 0.82 + Math.min(0.3, hh * 0.012);
    img.data[k] = c[0] * shade; img.data[k + 1] = c[1] * shade; img.data[k + 2] = c[2] * shade; img.data[k + 3] = 255; }
  g.putImageData(img, 0, 0);
  g.fillStyle = "rgba(30,55,28,.6)"; for(const c of colliders) if(!c.los && c.r < 0.9){ g.beginPath(); g.arc((c.x - B.x0) * MM_PX, (c.z - B.z0) * MM_PX, 1.4, 0, 7); g.fill(); }   // trees
  g.fillStyle = "#6a4a36"; for(const h of houses){ g.save(); g.translate((h.position.x - B.x0) * MM_PX, (h.position.z - B.z0) * MM_PX); g.rotate(-h.rotation.y); g.fillRect(-4.5, -4, 9, 8); g.restore(); }
  return cv; })();
// each dungeon's map: floor tiles
const dgImgs = new Map(DUNGEONS.map(d => [d, (() => { const cv = document.createElement("canvas"), t = d.T * MM_PX; cv.width = d.W * t; cv.height = d.H * t; const g = cv.getContext("2d");
  g.fillStyle = "#1a1612"; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = "#6a6258";
  for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++) if(!d.wallTile(i, j)) g.fillRect(i * t, j * t, t + 0.5, t + 0.5); return cv; })()]));
function drawMinimap(){
  const W = MM.width, c = W / 2, s = c / MM_R, cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const to = (x, z) => { const dx = x - P.x, dz = z - P.z; return [c + s * (dx * cy - dz * sy), c + s * (dx * sy + dz * cy)]; };
  mm.setTransform(1, 0, 0, 1, 0, 0); mm.clearRect(0, 0, W, W); mm.save(); mm.beginPath(); mm.arc(c, c, c, 0, 7); mm.clip();
  const dg = curDungeon(); mm.fillStyle = "#0a0806"; mm.fillRect(0, 0, W, W);
  mm.setTransform(s / MM_PX * cy, s / MM_PX * sy, -s / MM_PX * sy, s / MM_PX * cy, ...(dg ? to(dg.x0, dg.z0) : to(B.x0, B.z0))); mm.drawImage(dg ? dgImgs.get(dg) : mapImg, 0, 0); mm.setTransform(1, 0, 0, 1, 0, 0);
  const dot = (x, z, r, col) => { const [px, py] = to(x, z); if(Math.hypot(px - c, py - c) > c - 2) return; mm.fillStyle = col; mm.beginPath(); mm.arc(px, py, r, 0, 7); mm.fill(); };
  const gh = P.ghost, seen = (x, z) => !gh || Math.hypot(x - P.x, z - P.z) < GHOST_SIGHT;   // a spirit sees only what is close
  if(!dg && !gh){ mm.fillStyle = "rgba(255,216,74,.13)"; mm.strokeStyle = "rgba(255,216,74,.5)"; mm.lineWidth = 1;
    for(const a of questAreas()){ if(Math.hypot(a.x - P.x, a.z - P.z) > MM_R + a.r) continue; const [px, py] = to(a.x, a.z); mm.beginPath(); mm.arc(px, py, a.r * s, 0, 7); mm.fill(); mm.stroke(); } }
  for(const n of nodes) if(n.active && n.mesh.visible && !gh){ if(needSet.has(n.item)) dot(n.x, n.z, 2.8, "#ffd84a"); else if(Q.gatherReq(n.item) && Q.canGather(n.item) === true) dot(n.x, n.z, 2, n.def.kind === "ore" ? "#e0a070" : "#8fe08a"); }
  for(const p of portals) dot(p.x, p.z, 3.5, "#9fd6e8");
  if(P.ghost){ for(const gy of graveyards) dot(gy.x, gy.z, 3.5, "#9fd6ff"); const cm = corpseMark2(); if(cm) dot(cm.x, cm.z, 4.5, "#ffffff"); }
  if(!dg && !gh) for(const e of exploreTargets()) dot(e.x, e.z, 3.5, "#ffd84a");
  for(const m of mobs) if(!m.dead && seen(m.x, m.z)) dot(m.x, m.z, m.boss ? 4.2 : m.elite ? 3.2 : 2.2, m.state === "chase" ? "#ff4a3a" : m === P.target ? "#ffffff" : questMob(m) ? "#ffd84a" : "#d8645a");
  const pet = G.getPet(); if(pet && !pet.dead) dot(pet.x, pet.z, 2.4, "#7be08a");
  for(const r of CO.visible()) dot(r.x, r.z, 3, "#7fc4ff");
  mm.font = "800 14px 'Alegreya Sans', sans-serif"; mm.textAlign = "center";
  for(const n of npcs){ const mk = Q.npcMarker(n.id), [px, py] = to(n.x, n.z); if(Math.hypot(px - c, py - c) > c - 6 || !seen(n.x, n.z)) continue;
    if(mk && mk !== "…"){ mm.fillStyle = "#000"; mm.fillText(mk, px + 1, py + 6); mm.fillStyle = "#ffd84a"; mm.fillText(mk, px, py + 5); } else dot(n.x, n.z, 2, "#e8e0a0"); }
  // you: an arrow pointing the way you face
  mm.translate(c, c); mm.rotate(cam.yaw - P.rot); mm.fillStyle = "#fff"; mm.strokeStyle = "#000"; mm.lineWidth = 1.5;
  mm.beginPath(); mm.moveTo(0, 7); mm.lineTo(5, -5); mm.lineTo(0, -2); mm.lineTo(-5, -5); mm.closePath(); mm.stroke(); mm.fill();
  mm.restore();
}

// ---------------------------------------------------------------- the world map (M): the whole world, north up
// names on the world map: zones (big), towns and camps, dungeon doors
const MAP_LABELS = [...Object.values(ZONES).map(z => [z.name, z.cx, z.cz + (Object.values(HUBS).some(h => Math.hypot(h.x - z.cx, h.z - z.cz) < 20) ? 16 : 0), 15, "#f2ead8"]), ...Object.values(HUBS).map(h => [h.name, h.x, h.z - h.R - 2, 12, "#ffe8a0"]),
  ...DUNGEONS.map(d => [d.name, d.door.x, d.door.z + 5, 11, "#9fd6e8"])];
// places your active quests send you to
const exploreTargets = () => { const out = []; for(const q of Q.activeQuests()) q.obj.forEach((o, i) => { if(o[0] === "explore" && Q.qProg(q, i) < o[2]) out.push(EXPLORE[o[1]]); }); return out; };
// where your active quests want you: the areas where the monsters you need live, or where the things to pick up lie (worked out once and kept)
const areaCache = new Map();
function objAreas(o){
  const key = o.slice(0, 4).join("|"); if(areaCache.has(key)) return areaCache.get(key);
  let pts = [], out = [];
  if(o[0] === "kill" || o[0] === "loot"){ const kind = o[0] === "kill" ? o[1] : o[3], ms = mobs.filter(m => m.kind === kind);
    pts = ms.filter(m => !m.dg).map(m => ({x: m.hx, z: m.hz}));
    if(!pts.length){ const ds = [...new Set(ms.map(m => dungeonAt(m.hx)).filter(Boolean))]; out = ds.map(d => ({x: d.door.x, z: d.door.z, r: 7, where: d.name, dg: true})); } }
  else if(o[0] === "collect") pts = nodes.filter(n => n.item === o[1]).map(n => ({x: n.x, z: n.z}));
  if(pts.length){ const groups = {}; for(const p of pts){ const z = zoneAt(p.x, p.z) || "?"; (groups[z] = groups[z] || []).push(p); }
    for(const [zid, g] of Object.entries(groups)){ const cx = g.reduce((a, p) => a + p.x, 0) / g.length, cz = g.reduce((a, p) => a + p.z, 0) / g.length;
      const ds = g.map(p => Math.hypot(p.x - cx, p.z - cz)).sort((a, b) => a - b), r = clamp((ds[Math.floor(ds.length * 0.8)] || 0) + 5, 9, 48);
      out.push({x: cx, z: cz, r, where: ZONES[zid] ? ZONES[zid].name : "", n: g.length}); }
    out.sort((a, b) => b.n - a.n); out = out.slice(0, 3); }
  areaCache.set(key, out); return out; }
function questAreas(){ const out = [];
  for(const q of Q.activeQuests()){ if(Q.qReady(q)) continue; q.obj.forEach((o, i) => { if(Q.qProg(q, i) >= o[2]) return; const nightK = (o[0] === "kill" && NIGHT_KINDS.has(o[1])) || (o[0] === "loot" && NIGHT_KINDS.has(o[3])) || (o[0] === "collect" && o[1] === "moonbloom");
    for(const a of objAreas(o)) out.push({...a, q, nightK}); }); }
  return out; }
// the nearest of those areas to you, for the quest tracker
function nearestArea(o){ const list = objAreas(o); if(!list.length) return null; return list.reduce((b, a) => Math.hypot(a.x - P.x, a.z - P.z) < Math.hypot(b.x - P.x, b.z - P.z) ? a : b); }
let mapZoom = 1;
function toggleMap(){ const el = $("bigmap"); if(!running) return; el.hidden = !el.hidden; if(!el.hidden){ closePanel(); hideTip(); mapZoom = 1; drawBigMap(); } }
$("bigmap").addEventListener("wheel", e => { e.preventDefault(); mapZoom = clamp(mapZoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 1, 4); drawBigMap(); }, {passive: false});
$("bigmap").addEventListener("pointerdown", e => { if(e.target === $("bigmap")) toggleMap(); });
function drawBigMap(){
  const cv = $("mapcv"), dg = curDungeon(), img = dg ? dgImgs.get(dg) : mapImg, ox = dg ? dg.x0 : B.x0, oz = dg ? dg.z0 : B.z0;
  const maxW = innerWidth * 0.86, maxH = innerHeight * 0.8, fit = Math.min(maxW / img.width, maxH / img.height);
  cv.width = Math.round(img.width * fit); cv.height = Math.round(img.height * fit); $("mapTitle").textContent = dg ? dg.name : "World map";
  const g = cv.getContext("2d"), sc = fit * mapZoom * MM_PX;                           // pixels per world unit
  // keep you in view when zoomed in
  let cx = (P.x - ox) * sc - cv.width / 2, cz = (P.z - oz) * sc - cv.height / 2; cx = clamp(cx, 0, Math.max(0, img.width * fit * mapZoom - cv.width)); cz = clamp(cz, 0, Math.max(0, img.height * fit * mapZoom - cv.height));
  if(mapZoom === 1){ cx = 0; cz = 0; }
  const to = (x, z) => [(x - ox) * sc - cx, (z - oz) * sc - cz];
  g.fillStyle = "#0a0806"; g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(img, -cx, -cz, img.width * fit * mapZoom, img.height * fit * mapZoom);
  const dot = (x, z, r, col, stroke) => { const [px, py] = to(x, z); g.fillStyle = col; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); if(stroke){ g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); } };
  g.textAlign = "center"; g.font = "700 13px 'Alegreya Sans', sans-serif";
  if(!dg && !P.ghost){ const areas = questAreas(); g.setLineDash([6, 4]);
    for(const a of areas){ const [px, py] = to(a.x, a.z), rr = a.r * sc, glow = a.nightK && nightNow; g.beginPath(); g.arc(px, py, rr, 0, 7); g.fillStyle = glow ? "rgba(159,180,255,.28)" : "rgba(255,216,74,.16)"; g.fill(); g.strokeStyle = glow ? "rgba(190,205,255,.95)" : "rgba(255,216,74,.85)"; g.lineWidth = glow ? 2.2 : 1.5; g.stroke(); }
    g.setLineDash([]); g.font = "italic 700 12px 'Alegreya Sans', sans-serif";
    const seen = new Set(); for(const a of areas){ const k = a.q.id + "|" + Math.round(a.x) + "|" + Math.round(a.z); if(seen.has(k)) continue; seen.add(k); const [px, py0] = to(a.x, a.z), py = py0 - a.r * sc - 5;
      g.lineWidth = 3; g.strokeStyle = "rgba(0,0,0,.8)"; g.strokeText(a.q.name, px, py); g.fillStyle = "#ffe48a"; g.fillText(a.q.name, px, py); } }
  if(!dg) for(const [name, x, z, size, col] of MAP_LABELS){ const [px, py] = to(x, z); g.font = `${size >= 15 ? 800 : 700} ${Math.round(size * (0.85 + mapZoom * 0.15))}px 'Alegreya Sans', sans-serif`; g.lineWidth = 3; g.strokeStyle = "rgba(0,0,0,.75)"; g.strokeText(name, px, py); g.fillStyle = col; g.fillText(name, px, py); }
  if(!dg && !P.ghost) for(const e of exploreTargets()){ dot(e.x, e.z, 6, "#ffd84a", "#000"); const [px, py] = to(e.x, e.z); g.font = "700 12px 'Alegreya Sans', sans-serif"; g.lineWidth = 3; g.strokeStyle = "#000"; g.strokeText(e.name, px, py - 9); g.fillStyle = "#ffd84a"; g.fillText(e.name, px, py - 9); }
  for(const p of portals) if(!!dungeonAt(p.x) === !!dg && (!dg || dungeonAt(p.x) === dg)) dot(p.x, p.z, 5, "#9fd6e8", "#000");
  for(const n of nodes) if(n.active && needSet.has(n.item) && !dg && !P.ghost && (!n.def.night || nightNow)) dot(n.x, n.z, 3.5, "#ffd84a", "#000");
  if(!dg && !P.ghost){ g.font = "800 18px 'Alegreya Sans', sans-serif";
    for(const n of npcs){ const mk = Q.npcMarker(n.id), [px, py] = to(n.x, n.z); if(mk && mk !== "…"){ g.lineWidth = 3; g.strokeStyle = "#000"; g.strokeText(mk, px, py + 6); g.fillStyle = "#ffd84a"; g.fillText(mk, px, py + 6); } } }
  for(const r of CO.visible()) dot(r.x, r.z, 4.5, "#7fc4ff", "#000");
  if(P.ghost && !dg){ for(const gy of graveyards) dot(gy.x, gy.z, 4, "#9fd6ff", "#000"); }
  const cm2 = P.ghost ? corpseMark2() : null;
  if(cm2 && !!dungeonAt(cm2.x) === !!dg){ dot(cm2.x, cm2.z, 6, "#ffffff", "#000"); const [px, py] = to(cm2.x, cm2.z); g.font = "700 12px 'Alegreya Sans', sans-serif"; g.lineWidth = 3; g.strokeStyle = "#000"; g.strokeText("Your body", px, py - 10); g.fillStyle = "#fff"; g.fillText("Your body", px, py - 10); }
  // you
  { const [px, py] = to(P.x, P.z); g.save(); g.translate(px, py); g.rotate(-P.rot); g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 9); g.lineTo(6, -6); g.lineTo(0, -2); g.lineTo(-6, -6); g.closePath(); g.stroke(); g.fill(); g.restore(); }
}

// ---------------------------------------------------------------- game loop
const zoneEl = $("zone"), fpsEl = $("fps");
const SKIES = {out: [0xa9d3ea, 70, 150], mist: [0x9db8a4, 40, 105], gloom: [0x6e6e80, 35, 95], ash: [0x9a7a68, 45, 115], snow: [0xd8e6ee, 55, 130], blight: [0x9aa08a, 50, 120], in: [0x0a0806, 18, 48]};
const SKY_OF = {swamp: "mist", gloom: "gloom", ash: "ash", snow: "snow", snowhigh: "snow", blight: "blight"}, skyCol = new THREE.Color();
let exploreT = 0, needSet = new Set(), mobNeedSet = new Set();
const questMob = m => mobNeedSet.has(m.kind);
let last = performance.now(), fpsT = 0, frames = 0, saveT = 0, trackT = 0;
function zoneName(){ const dg = curDungeon(); return dg ? dg.name : placeName(P.x, P.z); }
function update(dt){
  now += dt;
  if(running){
    const moved = updMovement(dt);
    G.updPlayer(dt, moved);
    saveT += dt; if(saveT > 10){ saveT = 0; save(); }
    trackT += dt; if(trackT > 2){ trackT = 0; updTracker(); }
    scaleT -= dt; if(scaleT <= 0){ scaleT = 1; scaleDungeons(); }
    nightT -= dt; if(nightT <= 0){ nightT = 2; const was = nightNow; nightNow = isNight();
      if(was !== nightNow) log(nightNow ? "Night falls." : "Dawn breaks over Rimfrost.", nightNow ? "#9fb4ff" : "#ffd36b");
      for(const m of mobs){ if(!m.night || CO.guestMob(m)) continue;
        if(nightNow && m.dead && m.nightGone) respawn(m);
        else if(!nightNow && !m.dead && m.state === "idle" && Math.hypot(m.x - P.x, m.z - P.z) > 35){ m.dead = true; m.state = "dead"; m.deadT = 99; m.nightGone = true; m.mesh.visible = false; } } }        // (the "· place" hints change as you travel)
  }
  // the hero
  if(hero){ P.walk = P.moving ? P.walk + dt * 9 : P.walk * 0.85;
    const pose = P.sitting ? "sit" : P.pose || (P.attackAnim > 0 && P.attackKind === "cast" ? "cast" : null);
    hero.userData.animate(P.walk, P.moving, P.attackKind === "cast" ? 0 : P.attackAnim, pose);
    hero.position.set(P.x, height(P.x, P.z) + (P.moving ? Math.abs(Math.sin(P.walk)) * 0.06 : 0), P.z); hero.rotation.set(P.dead && !P.ghost ? -1.4 : 0, P.rot, 0); if(P.dead && !P.ghost) hero.position.y += 0.3;
    if(P.ghost) hero.position.y += 0.25 + Math.sin(now * 2) * 0.08;                            // a spirit floats
    if(mountMesh){ const gy = height(P.x, P.z); mountMesh.position.set(P.x, gy, P.z); mountMesh.rotation.y = P.rot; mountMesh.userData.animate(P.walk * 0.75, P.moving, 0); hero.position.y = gy + mountMesh.userData.saddle - 0.38 + (P.moving ? Math.abs(Math.sin(P.walk * 0.75)) * 0.08 : 0); } }
  // monsters: only the ones near you (or a friend) are drawn and move about
  { const rs = CO.visible(), reg0 = curDungeon();
    for(const m of mobs){ const d = Math.hypot(m.x - P.x, m.z - P.z), dr = rs.length ? Math.min(...rs.map(r => Math.hypot(m.x - r.x, m.z - r.z))) : 1e9;
      m.far = Math.min(d, dr) > 110 && m.state === "idle"; const show = running && d < (P.ghost ? GHOST_SIGHT : 80) && dungeonAt(m.x) === reg0;
      if(show !== m.inScene){ m.inScene = show; if(show) scene.add(m.mesh); else scene.remove(m.mesh); } } }
  for(const m of mobs) updMob(m, dt); separate();
  if(running && !inCrypt() && (exploreT -= dt) <= 0){ exploreT = 0.4; Q.questExplore(P.x, P.z); }
  if(running) G.updPet(dt, blocked, tryMove, turnTo);
  CO.update(dt); if(running){ CO.render(); CO.tradeTick(); CO.rollTick(); updRolls(); }
  if(running && P.pendingUse && !P.dead){ if(!P.dest) P.pendingUse = null; else if(distU(P, P.pendingUse) < USE_RANGE){ const n = P.pendingUse; P.dest = null; marker.visible = false; useThing(n); } }
  if(talkNpc && distU(P, talkNpc) > 7) closePanel();
  for(const n of npcs){ const d = distU(P, n), want = talkNpc === n && running && !P.dead ? Math.atan2(P.x - n.x, P.z - n.z) : n.rot0;   // people only turn to you while you talk to them
    n.mesh.visible = !P.ghost || d < GHOST_SIGHT; let dr = want - n.mesh.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); n.mesh.rotation.y += dr * Math.min(1, dt * 4); n.mesh.userData.animate(0, false, 0, null); }
  needSet = running ? Q.neededItems() : new Set(); mobNeedSet = running ? Q.neededMobs() : new Set();
  for(const n of nodes){ if(!n.active){ n.respawn -= dt; if(n.respawn <= 0) n.active = true; }
    const need = needSet.has(n.item), gath = running && Q.gatherReq(n.item) && Q.canGather(n.item) === true;
    n.mesh.visible = n.active && (!!n.glow || need) && (!n.def.night || nightNow);   // Moonbloom only shows at night
    n.beam.visible = n.mesh.visible && need && !P.ghost && Math.hypot(n.x - P.x, n.z - P.z) < 70;
    if(n.mesh.visible && n.glow){ const [on, off] = n.glow.userData.glow; n.glow.material.color.setHex(need || gath ? on : off); n.glow.scale.setScalar(need ? 1 + Math.sin(now * 4 + n.x) * 0.2 : gath ? 0.95 : 0.8); } }
  { const ex = new Set(running && !inCrypt() && !P.ghost ? exploreTargets() : []); for(const [e, b] of exploreBeams) b.visible = ex.has(e); }
  beamMat.opacity = 0.26 + Math.sin(now * 2.5) * 0.08;
  updBolts(dt);
  // inside the crypt it is dark: torchlight around you and flickering braziers
  { const ins = running && inCrypt(), look = ins ? "in" : running ? (SKY_OF[landAt(P.x, P.z)] || "out") : "out", S2 = SKIES[look];   // each kind of land has its own sky and mist
    const dl = ins ? 1 : daylight(), hr = gameHour();                                   // the game clock: day, dusk, night and dawn
    if(look !== lastIns){ const first = lastIns === false || ins || lastIns === "in"; lastIns = look;
      if(first){ skyCol.setHex(S2[0]).lerp(NIGHT_SKY, (1 - dl) * 0.88); scene.background.copy(skyCol); scene.fog.color.copy(skyCol); scene.fog.near = S2[1]; scene.fog.far = S2[2]; } }
    if(ins){ hemi.intensity = 1.3; sun.intensity = 0.6; torch.intensity = 60; torch.distance = 32; sun.color.setHex(0xfff1d6); hemi.color.setHex(0xdff2ff); townLight.intensity = 0; }
    else { hemi.intensity = lerp(0.2, 1.1, dl); sun.intensity = lerp(0.35, 2.0, dl); hemi.color.setHex(0xdff2ff).lerp(MOON_COL, 1 - dl);
      const dusk = dl > 0 && dl < 1 ? Math.sin(dl * Math.PI) : 0; sun.color.setHex(0xfff1d6).lerp(MOON_COL, 1 - dl).lerp(DUSK_COL, dusk * 0.6);
      torch.intensity = (1 - dl) * 9; torch.distance = 11; torch.position.set(P.x, height(P.x, P.z) + 3, P.z);          // a little lantern light around you at night
      const hb = Object.values(HUBS).find(h => Math.hypot(h.x - P.x, h.z - P.z) < h.R + 25);                      // towns and camps glow with fires at night
      townLight.intensity = hb ? (1 - dl) * 22 : 0; if(hb){ townLight.position.set(hb.x, height(hb.x, hb.z) + 5, hb.z); townLight.distance = hb.R * 1.9 + 6; } }
    const k = Math.min(1, dt * 1.2); skyCol.setHex(S2[0]).lerp(NIGHT_SKY, (1 - dl) * 0.88); if(P.ghost) skyCol.lerp(GHOST_SKY, 0.7);   // the spirit world: dim blue mist scene.background.lerp(skyCol, k); scene.fog.color.copy(scene.background);
    const gf = P.ghost ? 0.55 : 1;                                                    // a spirit sees less far
    scene.fog.near = lerp(scene.fog.near, S2[1] * (0.75 + dl * 0.25) * gf, k); scene.fog.far = lerp(scene.fog.far, S2[2] * (0.8 + dl * 0.2) * gf, k);
    sunAng = dl > 0 ? (hr - 4.5) / 15 * Math.PI : (hr >= 21 ? hr - 21 : hr + 3) / 6 * Math.PI;
    if(ins){ torch.position.set(P.x, height(P.x, P.z) + 3.5, P.z); for(const db of dgBuilt) for(const b of db.braziers) b.fire.scale.setScalar(0.85 + Math.sin(now * 9 + b.x) * 0.15); } }
  { const pt = G.getPet(); if(pt){ pt.mesh.visible = !(pt.dead && pt.deadT > 3); pt.mesh.position.set(pt.x, height(pt.x, pt.z), pt.z); pt.mesh.rotation.set(0, pt.rot, pt.dead ? Math.min(1.4, pt.deadT * 4) : 0);
    pt.mesh.userData.animate(pt.walk, pt.moving, pt.attackAnim); } }
  for(const m of mobs){ if(!m.inScene || (m.dead && m.deadT > 4)) continue; m.mesh.position.set(m.x, height(m.x, m.z), m.z); m.mesh.rotation.y = m.rot; m.mesh.userData.animate(m.walk, m.moving, m.attackAnim);
    m.mesh.traverse(o => { if(o.isMesh){ if(m.flash > 0 && !o.userData.fl){ o.userData.fl = o.material; o.material = o.material.clone(); if(o.material.emissive) o.material.emissive.setHex(0x883322); } else if(m.flash <= 0 && o.userData.fl){ o.material = o.userData.fl; o.userData.fl = null; } } }); }
  G.updFx(dt);
  // the ring under your target: pulsing red while you attack it, calm yellow when you don't, green for a friend
  { const fr = !P.target && P.ftarget ? CO.remoteById(P.ftarget) : null, tg = P.target && !P.target.dead ? P.target : fr && !fr.gh && CO.sameRegion(fr, P) ? fr : P.selfT && !P.dead ? P : null;
    if(tg){ selRing.visible = true; selRing.position.set(tg.x, height(tg.x, tg.z) + 0.08, tg.z); const base = (tg.r || 0.4) / 0.6 + 0.3, atk = tg === P.target && P.auto;
      selRing.scale.setScalar(base * (atk ? 1 + Math.sin(now * 7) * 0.12 : 1)); selRing.material.color.setHex(fr || tg === P ? 0x5adc6a : atk ? 0xff3a2a : 0xffc84a); selRing.material.opacity = atk ? 0.65 + Math.sin(now * 7) * 0.3 : 0.8; }
    else selRing.visible = false; }
  // camera: angled from above, follows you, smooth zoom and turning
  cam.dist = lerp(cam.dist, cam.distT, Math.min(1, dt * 8)); cam.yaw = lerp(cam.yaw, cam.yawT, Math.min(1, dt * 8));
  const cy = Math.sin(cam.pitch) * cam.dist, ch = Math.cos(cam.pitch) * cam.dist;
  camera.position.set(P.x + Math.sin(cam.yaw) * ch, height(P.x, P.z) + cy, P.z + Math.cos(cam.yaw) * ch); camera.lookAt(P.x, height(P.x, P.z) + 1, P.z); camera.updateMatrixWorld();   // (so name plates use this frame's camera, not the last one)
  sun.position.set(P.x - Math.cos(sunAng) * 45, 22 + Math.sin(Math.max(0.15, Math.min(Math.PI - 0.15, sunAng))) * 45, P.z + 20); sun.target.position.set(P.x, 0, P.z);
  // houses between the camera and you turn see-through, so you never lose your character
  { const cx = camera.position.x - P.x, cz = camera.position.z - P.z, cl = Math.hypot(cx, cz) || 1;
    for(const h of houses){ const hx = h.position.x - P.x, hz = h.position.z - P.z, along = (hx*cx + hz*cz) / cl, side = Math.abs(hx*cz - hz*cx) / cl;
      const op = along > -1 && along < 14 && side < 4.2 ? 0.28 : 1;
      h.traverse(o => { if(o.material){ o.material.opacity = lerp(o.material.opacity, op, Math.min(1, dt * 10)); o.material.depthWrite = o.material.opacity > 0.95; } }); } }
  if(marker.visible){ marker.userData.t += dt; marker.scale.setScalar(1 + Math.sin(marker.userData.t * 6) * 0.15); }
  water.material.opacity = 0.8 + Math.sin(performance.now() / 900) * 0.03;
  zoneEl.textContent = running ? zoneName() : "";
  { const ce = $("clock"), nt = isNight(), txt = running ? `${nt ? "☾" : "☀"} ${clockText()}${nt ? ` · night (${Math.ceil(minutesToDay())} min left)` : daylight() < 1 ? (gameHour() >= 18 ? " · dusk" : " · dawn") : ""}` : "";
    if(ce.textContent !== txt){ ce.textContent = txt; ce.classList.toggle("night", nt); } }
}
function loop(t){
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if(DEV.sim){ requestAnimationFrame(loop); return; }                       // the balance test runs the game on its own
  update(dt); updHUD(dt); if(running) drawMinimap(); if(!$("bigmap").hidden) drawBigMap(); renderer.render(scene, camera);
  frames++; fpsT += dt; if(fpsT > 1){ fpsEl.textContent = frames + " fps"; frames = 0; fpsT = 0; }
  requestAnimationFrame(loop);
}
$("load").hidden = true; updHelp();
showChars();
// dev tools (?dev): cheats, teleports and the class balance test
const ARENA = (() => { let a = null; return () => { if(a) return a; const s = hubSpot(HUBS.jarnfastet);
  for(let k = 0; k < 24 && !a; k++){ const ang = k * 0.26, mx = s.x + Math.cos(ang) * 11, mz = s.z + Math.sin(ang) * 11;
    if(reachable(mx, mz) && !blocked(mx, mz, mx, mz, 0.8) && findPath(s.x, s.z, mx, mz)) a = {x: s.x, z: s.z, mx, mz}; }
  return a || (a = {x: s.x, z: s.z, mx: s.x + 8, mz: s.z}); }; })();
initDev({update, save, refresh, buildBar, buildHero, hubSpot, log, arena: ARENA,
  teleport: (x, z) => { if(curDungeon()) exitDungeon(); dismount(); P.x = x; P.z = z; P.target = null; P.path = null; save(); },
  makeMob: (kind, p, lvl) => { const m = makeMob(kind, p, lvl, rng(7)); m.dev = true; return m; },
  removeMob: m => { const i = mobs.indexOf(m); if(i >= 0) mobs.splice(i, 1); scene.remove(m.mesh); const pl = plates.get(m); if(pl){ pl.remove(); plates.delete(m); } if(P.target === m) P.target = null; },
  restore: c => { G.clearFx(); play(c); }});
window.R2 = {setReachFrom, graveyards, pick, LAIRS, DOORS, hubSpot, HUBS, KINDS, zoneAt, reachable, DUNGEONS, EXPLORE, CO, portals, findPath, ABL: id => AB[id].lvl, screenOf: n => toScreen(n.x, height(n.x, n.z) + 1.2, n.z), buildBar, closePanel, npcs, nodes, Q, talkTo, useThing, renderPanel, togglePanel, scene, P, S, cam, mobs, height, update, startAttack, play, showChars, G, tryUse: G.tryUse, steer};   // handy for testing in the browser console
requestAnimationFrame(loop);
