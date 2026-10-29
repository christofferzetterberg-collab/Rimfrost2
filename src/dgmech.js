// Dungeon mechanics: every dungeon has its own dangers.
//  Iron Mine: mine carts roll along the tracks, and rocks fall from unstable ceilings.
//  Drowned Temple: water slows you down, and every so often the tide surges and hurts everyone standing in it.
//  Ember Forge: lava can't be crossed, and fire vents erupt now and then.
//  Frost Vault: ice is slippery, and freezing gusts blow through the wind tunnels.
//  Draug King's Crypt: the gates only open when every monster before them is dead.
// Mine carts, falling rocks and fire vents are deadly along the way (not in the boss's hall, where they only hurt); the tide and the gusts, which can't be avoided, only hurt.
// Everything runs on the computer's clock, so every player in co-op sees the same carts, rocks, vents and gusts.
import * as THREE from "three";
import {P, mobs} from "./state.js";
import {DUNGEONS, dungeonAt} from "./dungeon.js";
import * as G from "./engine.js";
import {refreshDgNav} from "./nav.js";

let H = null, BUILT = [];
const now = () => Date.now() / 1000;
const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const dmgBase = d => 3 + d.lv[1] * 2.4;
const mat = (c, o = 1) => new THREE.MeshBasicMaterial({color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1});
const hurt = (d, mult, name, color) => { if(P.dead || P.ghost) return; G.playerDamage(dmgBase(d) * mult, null, "env"); H.floatText(P, name, color); };
// deadly away from the boss (its hall is about nine tiles across): otherwise just a hard hit
const inBossHall = (d, x, z) => { if(!d.bossTile) return false; const c = d.tileCenter(...d.bossTile); return Math.hypot(x - c.x, z - c.z) < 9 * d.T; };
const deadly = (d, mult, name, color, how) => { if(P.dead || P.ghost) return; if(inBossHall(d, P.x, P.z)) return hurt(d, mult, name, color);
  G.playerDamage(P.maxHp * 50 + 99999, null, "env"); H.floatText(P, name, color); if(P.dead) H.log(how, "#ff8a7a"); };

const CART_SPEED = 6, ROCK_EVERY = 6, ROCK_WARN = 1.8, SURGE_EVERY = 20, SURGE_WARN = 3, VENT_EVERY = 8, VENT_WARN = 1.5, VENT_BURN = 1.2, GUST_EVERY = 12, GUST_WARN = 2, GUST_LEN = 2.5;

export function initMech(built, hooks){ H = hooks; BUILT = built;
  for(const db of built){ const d = db.d, Y = d.floorY;
    // mine carts
    db.carts = d.tracks.map((tr, k) => { const a = d.tileCenter(...tr.a), b = d.tileCenter(...tr.b), cart = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.1), new THREE.MeshLambertMaterial({color: 0x5a4a3a, flatShading: true})); body.position.y = 0.7; cart.add(body);
      const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), new THREE.MeshLambertMaterial({color: 0x7a7068, flatShading: true})); ore.position.y = 1.15; cart.add(ore);
      for(const [x, z] of [[-0.5, -0.55], [0.5, -0.55], [-0.5, 0.55], [0.5, 0.55]]){ const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8), new THREE.MeshLambertMaterial({color: 0x2a2a2a})); w.rotation.x = Math.PI / 2; w.position.set(x, 0.25, z); cart.add(w); }
      if(tr.a[1] !== tr.b[1]) cart.rotation.y = Math.PI / 2;
      cart.position.set(a.x, Y, a.z); db.group.add(cart); return {a, b, len: Math.hypot(b.x - a.x, b.z - a.z), seed: hash(k, 7), mesh: cart}; });
    // falling rocks: three warning rings and three rocks per unstable area
    db.rocks = d.rockZones.map((tiles, k) => ({tiles, off: k * 1.7, last: -1, drops: [0, 1, 2].map(() => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.6, 20), mat(0xd8b070, 0.55)); ring.rotation.x = -Math.PI / 2; ring.visible = false; db.group.add(ring);
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), new THREE.MeshLambertMaterial({color: 0x6a6258, flatShading: true})); rock.visible = false; db.group.add(rock);
      return {ring, rock, x: 0, z: 0}; })}));
    // wind tunnels: streaks of snow
    db.gusts = d.lanes.map((ln, k) => ({ln, set: new Set(ln.tiles.map(t => t[0] + "," + t[1])), off: k * 4, last: -1, streaks: Array.from({length: 26}, (_, n) => {
      const s = new THREE.Mesh(new THREE.BoxGeometry(ln.horiz ? 1.6 : 0.08, 0.08, ln.horiz ? 0.08 : 1.6), mat(0xf4fbff, 0.7)); s.visible = false; db.group.add(s);
      return {s, u: hash(k, n), v: hash(n, k + 99), h: 0.3 + hash(n, 5) * 1.8}; })}));
    db.surgeLast = -1; db.ventHit = 0; }
}

// how fast you (or a monster) can move on this spot: water in the Drowned Temple slows everyone
export function envSpeed(x, z){ const d = dungeonAt(x); return d && d.kindAt(x, z) === "~" ? 0.55 : 1; }
export const onIce = (x, z) => { const d = dungeonAt(x); return !!d && d.kindAt(x, z) === "i"; };

let gateT = 0;
export function updMech(dt){
  if(!H) return;
  // gates (every dungeon, so they are right for monsters and friends even while you are somewhere else)
  if((gateT -= dt) <= 0){ gateT = 0.4;
    for(const db of BUILT) for(const g of db.gates){ const d = db.d, gt = g.gt;
      const open = mobs.every(m => !m.dg || m.boss || m.dead || dungeonAt(m.hx) !== d || d.tileAt(m.hx, m.hz)[1] >= gt.j);
      if(open !== gt.open || g.bars.visible === open){ const was = gt.open; d.setGate(gt, open); g.bars.visible = !open; refreshDgNav(d);
        if(open && !was && dungeonAt(P.x) === d) H.log("The gate opens.", "#9aff8a"); } } }
  const d = dungeonAt(P.x); P.envSpeed = 1;
  if(!d) return;
  const db = BUILT.find(b => b.d === d), t = now(), Y = d.floorY, here = d.kindAt(P.x, P.z), alive = !P.dead && !P.ghost;
  // ---- Iron Mine
  for(const c of db.carts){ const L = Math.max(0.1, c.len), p = (t * CART_SPEED + c.seed * 2 * L) % (2 * L), s = p < L ? p : 2 * L - p, k = s / L;
    const x = c.a.x + (c.b.x - c.a.x) * k, z = c.a.z + (c.b.z - c.a.z) * k; c.mesh.position.set(x, Y, z);
    if(alive && Math.hypot(P.x - x, P.z - z) < 1.3 && !(P.cartT > 0)){ P.cartT = 1.5; deadly(d, 1.8, "Mine Cart", "#ffb060", "You were crushed by a mine cart.");
      const hx = c.a.z === c.b.z, side = hx ? Math.sign(P.z - z) || 1 : Math.sign(P.x - x) || 1;               // knocked off the track
      for(let n = 0; n < 10; n++) G.tryMove(P, hx ? 0 : side * 0.3, hx ? side * 0.3 : 0); } }
  if(P.cartT > 0) P.cartT -= dt;
  for(const z of db.rocks){ const tt = t + z.off, cyc = Math.floor(tt / ROCK_EVERY), f = tt - cyc * ROCK_EVERY;
    z.drops.forEach((dr, n) => { const tile = z.tiles[Math.floor(hash(cyc, n * 31 + z.off * 10) * z.tiles.length)], c = d.tileCenter(...tile); dr.x = c.x; dr.z = c.z;
      dr.ring.visible = f < ROCK_WARN + 0.4; dr.ring.position.set(c.x, Y + 0.05, c.z); dr.ring.scale.setScalar(0.4 + Math.min(1, f / ROCK_WARN) * 0.6);
      dr.rock.visible = f > ROCK_WARN - 0.5 && f < ROCK_WARN + 0.9; dr.rock.position.set(c.x, Y + 0.5 + Math.max(0, (ROCK_WARN - f) * 12), c.z); dr.rock.rotation.set(f * 3, f * 2, 0); });
    if(f >= ROCK_WARN && z.last !== cyc){ z.last = cyc; if(alive && z.drops.some(dr => Math.hypot(P.x - dr.x, P.z - dr.z) < 1.7)) deadly(d, 2.2, "Falling Rocks", "#d8b070", "You were buried by falling rocks."); } }
  // ---- Drowned Temple
  if(here === "~") P.envSpeed = 0.55;
  if(db.waterMat){ const cyc = Math.floor(t / SURGE_EVERY), f = t - cyc * SURGE_EVERY, warn = f > SURGE_EVERY - SURGE_WARN, surge = f < 1.2;
    db.waterMat.emissiveIntensity = warn ? 0.3 + (f - (SURGE_EVERY - SURGE_WARN)) / SURGE_WARN * 1.2 * (0.7 + 0.3 * Math.sin(t * 12)) : surge ? 1.4 : 0.3;
    db.waterMat.emissive.setHex(warn || surge ? 0x2a8ad0 : 0x0a3050);
    if(warn && db.surgeWarned !== cyc){ db.surgeWarned = cyc; if(alive) H.floatText(P, "The tide is rising", "#7fd0ff"); }
    if(surge && db.surgeLast !== cyc){ db.surgeLast = cyc; if(alive && here === "~") hurt(d, 1.5, "Tidal Surge", "#7fd0ff"); } }
  // ---- Ember Forge
  for(const v of db.vents){ const off = hash(v.i, v.j) * VENT_EVERY, tt = t + off, f = tt - Math.floor(tt / VENT_EVERY) * VENT_EVERY;
    const warn = f < VENT_WARN, burn = f >= VENT_WARN && f < VENT_WARN + VENT_BURN;
    v.glow.material.color.setHex(burn ? 0xffd06a : warn ? (Math.sin(t * 18) > 0 ? 0xff6a1a : 0xc0300a) : 0x4a140a);
    v.flame.visible = burn; if(burn){ v.flame.scale.set(1, 0.7 + Math.sin(t * 20 + v.i) * 0.2 + Math.min(1, (f - VENT_WARN) * 5) * 0.3, 1); }
    if(burn && alive && Math.hypot(P.x - v.x, P.z - v.z) < 1.5 && !(P.ventT > 0)){ P.ventT = 0.5; deadly(d, 0.9, "Fire Vent", "#ff8a2a", "You were burned to ashes by a fire vent."); } }
  if(P.ventT > 0) P.ventT -= dt;
  // ---- Frost Vault
  for(const gs of db.gusts){ const ln = gs.ln, tt = t + gs.off, cyc = Math.floor(tt / GUST_EVERY), f = tt - cyc * GUST_EVERY, warn = f < GUST_WARN, gust = f >= GUST_WARN && f < GUST_WARN + GUST_LEN;
    const dir = cyc % 2 ? 1 : -1, a = d.tileCenter(ln.i0, ln.j0), b = d.tileCenter(ln.i1, ln.j1), span = ln.horiz ? b.x - a.x + d.T : b.z - a.z + d.T, wid = ln.horiz ? b.z - a.z + d.T : b.x - a.x + d.T;
    for(const st of gs.streaks){ st.s.visible = warn ? st.u < f / GUST_WARN * 0.5 : gust; if(!st.s.visible) continue;
      const speed = gust ? 14 : 2, u = ((st.u * span + (gust ? f - GUST_WARN : f) * speed * dir) % span + span) % span, w = st.v * wid - wid / 2;
      if(ln.horiz) st.s.position.set(a.x - d.T / 2 + u, Y + st.h, (a.z + b.z) / 2 + w); else st.s.position.set((a.x + b.x) / 2 + w, Y + st.h, a.z - d.T / 2 + u); }
    if(gust && alive){ const [i, j] = d.tileAt(P.x, P.z);
      if(gs.set.has(i + "," + j)){ const push = 5.5 * dt * dir; G.tryMove(P, ln.horiz ? push : 0, ln.horiz ? 0 : push);
        if(gs.last !== cyc){ gs.last = cyc; P.buffs.chill = 4; hurt(d, 0.8, "Freezing Gust", "#bfe9ff"); } } } }
}
