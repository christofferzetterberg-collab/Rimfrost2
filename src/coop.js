// Co-op (PC), ported from Rimfrost 1. One player hosts and gets a short code; friends join with it.
// Connections go directly between the browsers (WebRTC via PeerJS, vendored in lib/peerjs.min.js).
// The host runs every monster; guests send their attacks to the host; the host sends monster states 10 times a second.
// XP is split between everyone nearby, loot is personal, monsters pick targets by threat, and you can heal and buff each other.
import * as THREE from "three";
import {P, S, mobs, PXU} from "./state.js";
import {RACES, CLASSES, SCHOOL_COLOR} from "./rimdata.js";
import {makeHero, makeBearForm, makeWolfForm, makeLeopardForm, makeWolf} from "./models.js";
import {height, los} from "./world.js";
import * as G from "./engine.js";
import {regionOf} from "./dungeon.js";

export const COOP = {peer: null, conns: [], role: null, code: null, status: "", remotes: {}, sendT: 0, mobT: 0, busy: false};
const PEER_PREFIX = "rimfrost2-coop-v1-";
let H = {};                                    // hooks from main.js
export function initCoop(hooks){ H = hooks; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const inCryptX = x => x > 500;
const reg = x => regionOf(x);

// ---------------------------------------------------------------- connecting
function loadLib(){ return new Promise((ok, no) => { if(window.Peer) return ok(); const s = document.createElement("script"); s.src = "./lib/peerjs.min.js"; s.onload = ok; s.onerror = () => no(new Error("The co-op library could not be loaded")); document.head.appendChild(s); }); }
function newCode(){ const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c = ""; for(let i = 0; i < 5; i++) c += A[Math.floor(Math.random() * A.length)]; return c; }
const refresh = () => H.refresh && H.refresh();
export const on = () => COOP.conns.length > 0;
function fail(e){ const t = e && e.type;
  COOP.status = t === "peer-unavailable" ? "No game was found with that code." : t === "network" || t === "server-error" || t === "socket-error" || t === "socket-closed" ? "Could not reach the co-op service. Check your internet connection."
    : t === "browser-incompatible" ? "This browser does not support co-op." : t === "blocked" ? "The game was found, but your computers could not connect directly. A firewall or the network (for example a work computer or work network) is probably blocking it."
    : "Something went wrong: " + (t || (e && e.message) || e);
  COOP.busy = false; refresh(); }
export async function host(){
  if(COOP.busy) return; COOP.busy = true; leave(true); COOP.status = "Starting…"; refresh();
  try{ await loadLib(); }catch(e){ return fail(e); }
  const open = n => { COOP.code = newCode(); const peer = new window.Peer(PEER_PREFIX + COOP.code, window.COOP_SERVER || {debug: 0}); COOP.peer = peer; COOP.role = "host";
    peer.on("open", () => { COOP.busy = false; COOP.status = "Waiting for friends to join…"; refresh(); });
    peer.on("connection", c => attach(c));
    peer.on("disconnected", () => { try{ peer.reconnect(); }catch(e){} });
    peer.on("error", e => { if(e.type === "unavailable-id" && n < 4){ peer.destroy(); open(n + 1); } else fail(e); }); };
  open(0);
}
export async function join(code){
  code = (code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if(code.length !== 5){ COOP.status = "The code has 5 letters or digits."; return refresh(); }
  if(COOP.busy) return; COOP.busy = true; leave(true); COOP.status = "Connecting…"; refresh();
  try{ await loadLib(); }catch(e){ return fail(e); }
  const peer = new window.Peer(undefined, window.COOP_SERVER || {debug: 0}); COOP.peer = peer; COOP.role = "guest"; COOP.code = code;
  peer.on("open", () => { const c = peer.connect(PEER_PREFIX + code, {reliable: true}); attach(c);
    setTimeout(() => { if(COOP.role === "guest" && !on() && COOP.busy) fail({type: "blocked"}); }, 15000); });
  peer.on("error", e => fail(e));
}
function attach(c){
  c.on("open", () => { if(COOP.role === "guest" && inCryptX(P.x)) H.leaveCrypt(); COOP.conns.push(c); COOP.busy = false; COOP.status = "Connected"; sendState(); refresh(); });
  c.on("data", d => data(c, d));
  c.on("close", () => drop(c));
  c.on("error", () => drop(c));
}
function drop(c){
  const i = COOP.conns.indexOf(c); if(i < 0) return; COOP.conns.splice(i, 1);
  for(const [id, r] of Object.entries(COOP.remotes)) if(r.via === c.peer){ H.log(`${r.name} left the game.`, "#93a4ad"); removeRemote(id); if(COOP.role === "host") broadcast({t: "bye", id}); }
  if(COOP.role === "guest"){ COOP.status = "The host closed the game."; for(const id in COOP.remotes) removeRemote(id); if(inCryptX(P.x)) H.leaveCrypt(); }
  else if(!on()) COOP.status = "Waiting for friends to join…";
  refresh();
}
export function leave(silent){
  for(const c of COOP.conns){ try{ c.close(); }catch(e){} }
  if(COOP.peer){ try{ COOP.peer.destroy(); }catch(e){} }
  for(const id in COOP.remotes) removeRemote(id);
  COOP.peer = null; COOP.conns = []; COOP.role = null; COOP.code = null;
  for(const m of mobs) m.threat = null;
  if(!silent){ COOP.status = "You left co-op."; refresh(); }
}
addEventListener("beforeunload", () => { if(on()) leave(true); });
function broadcast(msg, except){ for(const c of COOP.conns) if(c !== except && c.open){ try{ c.send(msg); }catch(e){} } }
function sendTo(id, msg){ const r = COOP.remotes[id]; const c = r && COOP.conns.find(c => c.peer === r.via); if(c && c.open){ try{ c.send(msg); }catch(e){} } }
function data(c, d){
  if(!d || typeof d !== "object") return;
  if(COOP.role === "host" && (d.t === "st" || d.t === "bye" || d.t === "chat")) broadcast(d, c);          // the host relays to the other guests
  if(d.t === "chat"){ if(d.id !== myId() && H.chat) H.chat(d.name, d.cls, d.text); return; }
  if(d.t === "bye"){ const r = COOP.remotes[d.id]; if(r){ H.log(`${r.name} left the game.`, "#93a4ad"); removeRemote(d.id); } return; }
  if(d.t === "op"){ if(COOP.role === "host") hostOp(d); return; }
  if(d.t === "phit"){ if(d.to === myId()) G.petDamage(d.dmg, mobByNid(d.nid)); else if(COOP.role === "host") sendTo(d.to, d); return; }
  if(d.t === "hit"){ if(d.to === myId()) G.playerDamage(d.dmg, mobByNid(d.nid), d.kind); else if(COOP.role === "host") sendTo(d.to, d); return; }
  if(d.t === "kill"){ if(d.to && d.to.includes(myId())){ const m = mobByNid(d.nid); if(m) G.killRewards(m, d.n); } return; }
  if(d.t === "mobs"){ if(COOP.role === "guest") applyMobs(d.m); return; }
  if(d.t === "fx"){ if(d.to === myId()) receiveFx(d); else if(COOP.role === "host") sendTo(d.to, d); return; }
  if(d.t === "trade"){ tradeData(d); return; }
  if(d.t !== "st" || !d.id || (COOP.peer && d.id === COOP.peer.id)) return;
  let r = COOP.remotes[d.id];
  if(!r){ r = COOP.remotes[d.id] = {id: d.id, x: d.x, z: d.z, rot: d.rot, r: 0.4, walk: 0}; H.log(`${d.name} joined the game.`, "#7be08a"); refresh(); }
  const wasReg = reg(r.x);
  Object.assign(r, d, {x: r.x, z: r.z, rot: r.rot, tx: d.x, tz: d.z, trot: d.rot, seen: performance.now(), via: c.peer});
  if(Math.hypot(r.tx - r.x, r.tz - r.z) > 20){ r.x = r.tx; r.z = r.tz; }                   // teleports and dungeon entries snap
  if(COOP.role === "host" && reg(r.tx) > 0 && reg(r.tx) !== wasReg) H.someoneEnters(reg(r.tx));
  syncPet(r);
}
export const myId = () => (COOP.peer && COOP.peer.id) || "me";
// co-op chat: a short message to everyone in the game
export function chat(text){ text = String(text || "").trim().slice(0, 200); if(!text || !on()) return false; broadcast({t: "chat", id: myId(), name: S.cur.name, cls: S.cur.cls, text}); if(H.chat) H.chat(S.cur.name, S.cur.cls, text); return true; }

// ---------------------------------------------------------------- my state → friends, 12 times a second
function lookKey(){ const eq = S.cur.eq || {}, o = {}; for(const k of ["head", "shoulder", "chest", "hands", "legs", "feet", "weapon", "offhand"]) if(eq[k]) o[k] = {arm: eq[k].arm, wt: eq[k].wt, q: eq[k].q}; return o; }
function state(){
  const pet = G.getPet();
  return {t: "st", id: COOP.peer.id, name: S.cur.name, race: S.cur.race, cls: S.cur.cls, lvl: S.cur.level, x: +P.x.toFixed(2), z: +P.z.toFixed(2), rot: +P.rot.toFixed(2), mv: !!P.moving,
    hp: Math.round(P.hp), mhp: P.maxHp, form: P.form || null, dead: !!P.dead, gh: !!P.ghost, mt: P.mount || null, rt: G.resType(), rv: Math.round(P[G.resType()] || 0), rm: G.maxRes(G.resType()), sit: !!P.sitting, atk: +(P.attackAnim || 0).toFixed(2), ak: P.attackKind || null, pose: P.pose || null, eq: lookKey(),
    pet: pet ? {k: pet.kind, x: +pet.x.toFixed(2), z: +pet.z.toFixed(2), rot: +pet.rot.toFixed(2), hp: Math.round(pet.hp), mhp: pet.maxHp, dead: !!pet.dead, mv: !!pet.moving, atk: +(pet.attackAnim || 0).toFixed(2), res: Math.round(pet.res || 0)} : null};
}
function sendState(){ if(!on() || !COOP.peer || !S.cur) return; broadcast(state()); }
export function update(dt){
  if(!on()) return;
  COOP.sendT -= dt; if(COOP.sendT <= 0){ COOP.sendT = 1 / 12; sendState(); }
  if(COOP.role === "host"){ COOP.mobT -= dt; if(COOP.mobT <= 0){ COOP.mobT = 0.1; hostMobs(); } }
  const now = performance.now();
  for(const [id, r] of Object.entries(COOP.remotes)){
    if(now - r.seen > 8000){ H.log(`${r.name} lost connection.`, "#93a4ad"); removeRemote(id); continue; }
    const k = Math.min(1, dt * 12); r.x += (r.tx - r.x) * k; r.z += (r.tz - r.z) * k; let dr = r.trot - r.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); r.rot += dr * k;
    r.walk = r.mv ? r.walk + dt * 9 : r.walk * 0.85;
    const po = r.petObj; if(po){ po.x += (po.tx - po.x) * k; po.z += (po.tz - po.z) * k; po.walk = po.mv ? (po.walk || 0) + dt * 10 : (po.walk || 0) * 0.85; }
  }
}

// ---------------------------------------------------------------- friends in the world: their characters and pets
export const sameRegion = (a, b) => reg(a.x) === reg(b.x);
export const visible = () => Object.values(COOP.remotes).filter(r => sameRegion(r, P));
export const anyRemoteIn = g => Object.values(COOP.remotes).some(r => reg(r.x) === g);
function looks(r){ return [r.race, r.cls, r.form, JSON.stringify(r.eq || {})].join("|"); }
function removeRemote(id){ const r = COOP.remotes[id]; if(!r) return; if(r.mesh) H.scene.remove(r.mesh); if(r.mtMesh) H.scene.remove(r.mtMesh); if(r.petObj && r.petObj.mesh) H.scene.remove(r.petObj.mesh); if(r.plate) r.plate.remove(); if(r.petObj && r.petObj.plate) r.petObj.plate.remove(); delete COOP.remotes[id]; if(P.ftarget === id) P.ftarget = null; }
function syncPet(r){ const p = r.pet; if(!p){ if(r.petObj){ if(r.petObj.mesh) H.scene.remove(r.petObj.mesh); if(r.petObj.plate) r.petObj.plate.remove(); r.petObj = null; } return; }
  let o = r.petObj; if(!o || o.kind !== p.k){ if(o && o.mesh) H.scene.remove(o.mesh); if(o && o.plate) o.plate.remove();
    const mesh = p.k === "bear" ? makeBearForm() : makeWolf(); if(p.k === "bear") mesh.scale.setScalar(0.85); H.scene.add(mesh);
    o = r.petObj = {kind: p.k, name: p.k === "bear" ? "Bear" : "Wolf", x: p.x, z: p.z, r: 0.55, mesh, owner: r.id, walk: 0}; mesh.traverse(m => { if(m.isMesh) m.userData.remotePet = o; }); }
  Object.assign(o, {tx: p.x, tz: p.z, rot: p.rot, hp: p.hp, maxHp: p.mhp, dead: p.dead, mv: p.mv, atk: p.atk});
  if(Math.hypot(o.tx - o.x, o.tz - o.z) > 20){ o.x = o.tx; o.z = o.tz; } }
// draw friends: rebuild their model when their looks change, animate, name plates and health
export function render(){
  for(const r of Object.values(COOP.remotes)){
    if(!r.mesh || r.lk !== looks(r)){ if(r.mesh) H.scene.remove(r.mesh); r.lk = looks(r);
      r.mesh = r.form === "bear" ? makeBearForm() : r.form === "cat" ? makeWolfForm() : r.form === "leopard" ? makeLeopardForm() : makeHero(r.race, r.cls, RACES, r.eq || {});
      r.mesh.traverse(m => { if(m.isMesh) m.userData.remote = r; }); H.scene.add(r.mesh); }
    const vis = sameRegion(r, P) && !r.gh; r.mesh.visible = vis;                     // (a friend's spirit is not seen by the living)
    if((r.mt || null) !== (r.mtShown || null)){ if(r.mtMesh) H.scene.remove(r.mtMesh); r.mtMesh = r.mt && H.mountMesh ? H.mountMesh(r.mt) : null; if(r.mtMesh) H.scene.add(r.mtMesh); r.mtShown = r.mt || null; }
    r.mesh.userData.animate(r.walk, r.mv, r.ak === "cast" ? 0 : r.atk || 0, r.sit || r.mt ? "sit" : r.pose || null);
    r.mesh.position.set(r.x, height(r.x, r.z) + (r.dead ? 0.3 : 0), r.z); r.mesh.rotation.set(r.dead ? -1.4 : 0, r.rot, 0);
    if(r.mtMesh){ r.mtMesh.visible = vis; r.mtMesh.position.set(r.x, height(r.x, r.z), r.z); r.mtMesh.rotation.y = r.rot; r.mtMesh.userData.animate(r.walk * 0.75, r.mv, 0); r.mesh.position.y += r.mtMesh.userData.saddle - 0.38; }
    if(!r.plate){ r.plate = document.createElement("div"); r.plate.className = "plate friend"; r.plate.innerHTML = `<span></span><div class="hb"><i></i></div>`; H.hud.appendChild(r.plate); }
    const s = vis ? H.toScreen(r.x, height(r.x, r.z) + r.mesh.userData.height + 0.35, r.z) : {on: false};
    if(!s.on){ r.plate.style.display = "none"; } else { r.plate.style.display = ""; r.plate.style.left = s.x + "px"; r.plate.style.top = s.y + "px";
      r.plate.firstChild.textContent = `${r.name} (${r.lvl})`; r.plate.lastChild.firstChild.style.width = Math.max(0, Math.min(100, r.hp / (r.mhp || 1) * 100)) + "%"; r.plate.classList.toggle("sel", P.ftarget === r.id); }
    const po = r.petObj;
    if(po){ po.mesh.visible = sameRegion(po, P) && !po.dead; po.mesh.position.set(po.x, height(po.x, po.z), po.z); po.mesh.rotation.y = po.rot; po.mesh.userData.animate(po.walk, po.mv, po.atk || 0);
      if(!po.plate){ po.plate = document.createElement("div"); po.plate.className = "plate friend"; po.plate.innerHTML = `<span></span><div class="hb"><i></i></div>`; H.hud.appendChild(po.plate); }
      const ps = po.mesh.visible ? H.toScreen(po.x, height(po.x, po.z) + po.mesh.userData.height + 0.2, po.z) : {on: false};
      if(!ps.on) po.plate.style.display = "none"; else { po.plate.style.display = ""; po.plate.style.left = ps.x + "px"; po.plate.style.top = ps.y + "px"; po.plate.firstChild.textContent = `${r.name}'s ${po.name}`;
        po.plate.lastChild.firstChild.style.width = Math.max(0, Math.min(100, po.hp / (po.maxHp || 1) * 100)) + "%"; } }
  }
}

// ---------------------------------------------------------------- shared monsters: the host runs them, guests send attacks
let ATK = null;                                  // who is attacking right now (set while the host applies a friend's attack or damage over time)
export const isMe = () => !ATK || ATK === myId();
export const attacker = () => ATK || myId();
export function asAttacker(id, fn){ const old = ATK; ATK = id || null; try{ fn(); } finally{ ATK = old; } }
export const coopMob = m => !!(m && on() && m.nid != null);
export const guestMob = m => COOP.role === "guest" && coopMob(m);
export const targetsMe = m => !coopMob(m) || m.tgtId === myId() || m.tgtId === myId() + ":pet";
const nidMap = new Map(); export function mobByNid(nid){ if(nidMap.size !== mobs.length){ nidMap.clear(); for(const m of mobs) nidMap.set(m.nid, m); } return nidMap.get(nid); }
export function op(kind, m, a){ broadcast({t: "op", op: kind, nid: m.nid, a, from: myId()}); }
function hostOp(d){ const m = mobByNid(d.nid); if(!m || m.dead) return; const a = d.a || [];
  asAttacker(d.from, () => {
    if(d.op === "dmg"){ hostPetAtk = !!a[3]; G.damageMob(m, a[0], a[1], a[2]); hostPetAtk = false; }
    else if(d.op === "taunt") hostTaunt(m, d.from + ":pet");
    else if(d.op === "dot") G.dot(m, a[0], a[1], a[2], a[3], true, true);
    else if(d.op === "slow") G.slow(m, a[0], a[1]); else if(d.op === "root") G.root(m, a[0]); else if(d.op === "stun") G.stun(m, a[0]); }); }
let hostPetAtk = false;
const PET_THREAT = {bear: [4, 0.8], wolf: [0.5, 1]};
export function threat(m, amt, petAtkLocal){
  const id = attacker(), mine = id === myId(), r = COOP.remotes[id], petAtk = petAtkLocal || hostPetAtk;
  const pk = mine ? (G.getPet() && !G.getPet().dead ? G.getPet().kind : null) : (r && r.pet && !r.pet.dead ? r.pet.k : null);
  m.threat = m.threat || {};
  if(petAtk){ const k = id + ":pet"; m.threat[k] = (m.threat[k] || 0) + amt * (pk ? PET_THREAT[pk][0] : 1); return; }
  const tank = mine ? (S.cur.cls === "warrior" || P.form === "bear") : r && (r.cls === "warrior" || r.form === "bear");
  m.threat[id] = (m.threat[id] || 0) + amt * (tank ? 2 : 1) * (pk ? PET_THREAT[pk][1] : 1); }
function hostTaunt(m, id){ m.threat = m.threat || {}; const top = Math.max(0, ...Object.values(m.threat)); m.threat[id] = Math.max(m.threat[id] || 0, top * 1.3 + 40); m.tauntT = 3; m.tauntId = id;
  if(m.state === "idle"){ G.aggro(m); G.social(m); } }
export function taunt(m){ if(COOP.role === "guest") op("taunt", m, []); else hostTaunt(m, myId() + ":pet"); }
// everyone a monster could go after: you, your pet, friends and their pets in the same place
export function cands(m){
  const L = [], inC = reg(m.x), pet = G.getPet();
  if(H.running() && !P.dead && reg(P.x) === inC) L.push({id: myId(), e: P, me: true, lvl: S.cur.level});
  if(pet && !pet.dead && reg(pet.x) === inC) L.push({id: on() ? myId() + ":pet" : "pet", e: pet, pet: true, mine: true});
  if(coopMob(m)) for(const r of Object.values(COOP.remotes)){
    if(!r.dead && reg(r.x) === inC) L.push({id: r.id, e: r, lvl: r.lvl});
    const po = r.petObj; if(po && !po.dead && reg(po.x) === inC) L.push({id: r.id + ":pet", e: po, pet: true, owner: r.id}); }
  return L; }
export function mobTarget(m){
  const L = cands(m); if(!L.length) return null; if(L.length === 1) return L[0];
  if(!coopMob(m)){ const e = G.mobTarget(m); return L.find(c => c.e === e) || L[0]; }      // alone: you and your pet (old rules)
  if(m.tauntT > 0 && m.tauntId){ const c = L.find(c => c.id === m.tauntId); if(c) return c; }
  if(m.threat){ let best = null, bv = 0; for(const c of L){ const v = m.threat[c.id] || 0; if(v > bv && Math.hypot(m.x - c.e.x, m.z - c.e.z) < 30){ bv = v; best = c; } } if(best) return best; }
  let best = null, bd = 1e9; for(const c of L){ const d = Math.hypot(m.x - c.e.x, m.z - c.e.z); if(d < bd){ bd = d; best = c; } } return best; }
export function mobAttack(m, c, dmg, kind){
  if(c.pet && c.owner) sendTo(c.owner, {t: "phit", to: c.owner, nid: m.nid, dmg});
  else if(c.pet) G.petDamage(dmg, m);
  else if(c.me) G.playerDamage(dmg, m, kind);
  else sendTo(c.id, {t: "hit", to: c.id, nid: m.nid, dmg, kind}); }
// who shares a kill: everyone alive nearby (in the crypt: everyone inside). Returns the host's own share (0 = the host gets nothing).
export function killShare(m){ if(!coopMob(m) || COOP.role !== "host") return 1;
  const inC = reg(m.x), near = e => reg(e.x) === inC && (inC || Math.hypot(e.x - m.x, e.z - m.z) < 65);
  const meIn = !P.dead && near(P), ids = Object.values(COOP.remotes).filter(r => !r.dead && near(r)).map(r => r.id);
  const n = ids.length + (meIn ? 1 : 0); if(ids.length) broadcast({t: "kill", nid: m.nid, n, to: ids});
  return meIn ? n : 0; }
// host → guests: monsters near any guest, 10 times a second
const ST = {idle: 0, chase: 1, return: 2, dead: 0};
function hostMobs(){ const rs = Object.values(COOP.remotes); if(!rs.length) return; const out = [];
  for(const m of mobs){ if(m.nid == null) continue;
    if(!rs.some(r => reg(r.x) === reg(m.x) && Math.hypot(r.x - m.x, r.z - m.z) < 90)) continue;
    out.push([m.nid, +m.x.toFixed(2), +m.z.toFixed(2), Math.round(m.hp), ST[m.state] || 0, m.dead ? 1 : 0, +m.rot.toFixed(2), m.moving ? 1 : 0, m.tgtId || 0,
      m.nova ? [+m.nova.t.toFixed(2), +m.nova.x.toFixed(1), +m.nova.z.toFixed(1)] : 0, +m.stunT.toFixed(1), +m.rootT.toFixed(1), +m.slowT.toFixed(1), m.dots.map(d => [d.key, d.left]), +(m.attackAnim || 0).toFixed(2), m.slowPct || 0]); }
  broadcast({t: "mobs", m: out}); }
function applyMobs(list){
  for(const s of list){ const m = mobByNid(s[0]); if(!m) continue;
    const wasDead = m.dead;
    m.nx = s[1]; m.nz = s[2]; if(s[5] || wasDead || Math.hypot(m.nx - m.x, m.nz - m.z) > 15){ m.x = m.nx; m.z = m.nz; }
    if(s[3] < m.hp) m.flash = 0.15; m.hp = s[3];
    if(s[5] && !wasDead){ m.dead = true; m.state = "dead"; m.deadT = 0; m.dots = []; if(P.target === m){ P.target = null; P.auto = false; } G.burst(m.px, m.py, "#d9c49a", 10); }
    else if(!s[5] && wasDead){ H.respawnVis(m); }
    if(!s[5]){ m.dead = false; m.state = ["idle", "chase", "return"][s[4]]; }
    m.trot = s[6]; m.moving = !!s[7]; m.tgtId = s[8] || null; m.stunT = s[10]; m.rootT = s[11]; m.slowT = s[12]; m.slowPct = s[15];
    m.dots = (s[13] || []).map(([key, left]) => ({key, left, per: 0, tick: 1}));
    if(s[14] > (m.attackAnim || 0) + 0.3) m.attackAnim = s[14];
    H.novaVis(m, s[9]);
    m.seenT = performance.now(); } }
export function guestUpd(m, dt){
  m.flash = Math.max(0, (m.flash || 0) - dt); m.attackAnim = Math.max(0, (m.attackAnim || 0) - dt * 3);
  if(m.nx != null && !m.dead){ const k = Math.min(1, dt * 10); m.x += (m.nx - m.x) * k; m.z += (m.nz - m.z) * k; let dr = (m.trot || 0) - m.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); m.rot += dr * k; }
  m.walk = m.moving ? m.walk + dt * (m.state === "chase" ? 10 : 6) : m.walk * 0.85; }

// ---------------------------------------------------------------- healing and buffing each other
let CAP = null;                                  // while set, heals / heal over time / shields / buffs are collected and sent to a friend
export const cap = () => CAP;
const FRIENDLY = new Set(["heal", "renew", "pws", "palheal", "touch", "rejuv", "bloom"]);
function friendSel(){ const r = on() && P.ftarget && COOP.remotes[P.ftarget]; return r && !r.dead && sameRegion(r, P) ? r : null; }
export const friendTarget = id => FRIENDLY.has(id) ? friendSel() : null;
export function friendRange(id){ const r = friendTarget(id); return !r ? null : Math.hypot(r.x - P.x, r.z - P.z) > 17 ? `${r.name} is too far away`
  : !los(P.x, height(P.x, P.z) + 1.4, P.z, r.x, height(r.x, r.z) + 1.2, r.z) ? `${r.name} is not in line of sight` : null; }
export function castOn(r, a, t){ CAP = {scale: (r.mhp || P.maxHp) / P.maxHp, fx: []}; try{ a.run(t); } finally{ const c = CAP; CAP = null; sendFx(r, c.fx, a.name); }
  G.burst(r.x * PXU, r.z * PXU, SCHOOL_COLOR[a.school] || "#fff", 12); }
function sendFx(r, fx, label){ if(!fx.length) return; const msg = {t: "fx", to: r.id, from: S.cur.name, label, fx};
  if(COOP.role === "host") sendTo(r.id, msg); else broadcast(msg);
  for(const f of fx) if(f[0] === "heal") H.floatText(r, "+" + f[1], "#7be08a"); }
// War Cry, Holy Wave and the like also reach friends near you (radius in Rimfrost pixels)
export function groupFx(radius, fx, label){ if(!on()) return; for(const r of visible()) if(!r.dead && Math.hypot(r.x - P.x, r.z - P.z) * PXU < radius) sendFx(r, fx.map(f => f.slice()), label); }
function receiveFx(d){ if(P.dead) return;
  for(const f of d.fx){
    if(f[0] === "heal") G.healP(f[1]); else if(f[0] === "healPct") G.healP(P.maxHp * f[1]);
    else if(f[0] === "hot") G.hot(f[1] + "_" + d.from, f[2], f[3]); else if(f[0] === "shield") G.shieldP(f[1], f[2]); else if(f[0] === "buff") G.buff(f[1], f[2]); }
  G.burst(P.px, P.py, "#9cf07a", 8);
  if(!d.label.startsWith("Holy")) H.log(`${d.from} cast ${d.label} on you.`, "#7be08a"); }
// select a friend as your target (your heals and shields then go to them); toggle: clicking their frame again lets go
export function select(id, toggle){ const was = P.ftarget; P.ftarget = id && !(toggle && was === id) ? id : null; if(P.ftarget){ P.target = null; P.auto = false; } }
export const remoteById = id => COOP.remotes[id];

// ---------------------------------------------------------------- party frames under yours, and the co-op window
// a friend's pet: a small health bar and its rage (bear) or energy (wolf)
function petLine(p){ if(!p) return ""; const hp = Math.max(0, Math.min(1, p.hp / (p.mhp || 1))), rs = Math.max(0, Math.min(100, p.res || 0));
  return `<div class="pp"><span>${p.k === "bear" ? "Bear" : "Wolf"}</span><div class="bar"><i style="width:${hp * 100}%;background:${p.dead ? "#555" : "#3fbf5a"}"></i></div><div class="bar r"><i style="width:${rs}%;background:var(--${p.k === "bear" ? "rage" : "energy"})"></i></div></div>`; }
export function partyHUD(){
  const el = document.getElementById("party");
  if(!on()){ el.innerHTML = ""; return; }
  if(P.ftarget && !COOP.remotes[P.ftarget]) P.ftarget = null;
  const rs = Object.values(COOP.remotes), key = rs.map(r => [r.id, r.name, r.lvl, Math.round(r.hp), r.mhp, r.dead, reg(r.x), P.ftarget === r.id, r.pet ? [r.pet.k, Math.round(r.pet.hp / (r.pet.mhp || 1) * 50), Math.round((r.pet.res || 0) / 10), r.pet.dead].join(":") : "", r.rt, Math.round((r.rv || 0) / (r.rm || 100) * 50), r.gh].join(",")).join("|");
  if(el.dataset.k === key) return; el.dataset.k = key;
  el.innerHTML = rs.map(r => { const pct = Math.max(0, Math.min(1, r.hp / (r.mhp || 1)));
    return `<div class="pmem ${P.ftarget === r.id ? "sel" : ""}" data-pid="${r.id}" title="Click to select – your heals then go to ${esc(r.name)}"><div class="n"><b style="color:${CLASSES[r.cls]?.color || "#fff"}">${esc(r.name)}</b><span>${r.gh ? "Spirit" : r.dead ? "Dead" : reg(r.x) !== reg(P.x) ? (reg(r.x) ? "In a dungeon" : "Outside") : "Level " + r.lvl}</span></div><div class="bar"><i style="width:${pct * 100}%;background:${r.dead ? "#555" : "#3fbf5a"}"></i><b>${Math.round(r.hp)} / ${r.mhp}</b></div>${r.rt ? `<div class="bar rs"><i style="width:${Math.max(0, Math.min(100, (r.rv || 0) / (r.rm || 100) * 100))}%;background:var(--${r.rt})"></i><b>${r.rv || 0} / ${r.rm || 100}</b></div>` : ""}${petLine(r.pet)}</div>`; }).join("");
}
export function coopHTML(){
  let h = `<h3>Co-op</h3><div class="muted" style="margin-bottom:8px">Play together with friends. One of you hosts and gets a code, the others join with it. You fight the same monsters and share the XP; loot is your own. Left-click a friend (or their frame under yours) to select them: your heals and shields then go to them. Click again to heal yourself.</div>`;
  if(on() || COOP.role === "host"){
    if(COOP.role === "host") h += `<div class="it"><div class="nm"><b style="font-size:26px;letter-spacing:6px;color:var(--frost)">${COOP.code || "…"}</b><small>Your code – give it to your friends.</small></div></div>`;
    else h += `<div class="it"><div class="nm"><b>Joined game ${esc(COOP.code)}</b></div></div>`;
    h += `<h3>Players</h3><div class="it"><div class="nm"><b>${esc(S.cur.name)}</b> <span class="muted">· level ${S.cur.level} ${CLASSES[S.cur.cls].name} · you</span></div></div>`;
    for(const r of Object.values(COOP.remotes)) h += `<div class="it"><div class="nm"><b style="color:#7fc4ff">${esc(r.name)}</b> <span class="muted">· level ${r.lvl} ${CLASSES[r.cls]?.name || ""}${reg(r.x) ? " · in a dungeon" : ""}</span></div></div>`;
    h += `<div class="muted" style="margin:8px 0">${esc(COOP.status)}</div><button class="sbtn" data-act="coopleave">Leave co-op</button>`;
  } else {
    h += `<h3>Host a game</h3><button class="sbtn pri" data-act="coophost" ${COOP.busy ? "disabled" : ""}>Host</button>`;
    h += `<h3>Join a friend</h3><div class="row"><input id="coopcode" maxlength="5" placeholder="Code" autocomplete="off" spellcheck="false" style="text-transform:uppercase;letter-spacing:4px;width:120px;font:700 18px 'Alegreya Sans';padding:5px 10px;background:#0d1216;color:var(--text);border:1px solid var(--line);border-radius:6px"><button class="sbtn" data-act="coopjoin" ${COOP.busy ? "disabled" : ""}>Join</button></div>`;
    if(COOP.status) h += `<div class="muted" style="margin-top:8px">${esc(COOP.status)}</div>`;
  }
  return h;
}

// ---------------------------------------------------------------- trading with a friend: both put in equipment, items and gold, and both must accept
export const TR = {with: null, name: "", open: false, req: null, mine: {gear: [], items: {}, gold: 0}, theirs: {gear: [], items: {}, gold: 0}, myOk: false, theirOk: false};
import {ITEMS, QUAL} from "./items.js";
function tsend(to, k, extra){ const msg = Object.assign({t: "trade", to, from: myId(), name: S.cur.name, k}, extra || {}); if(COOP.role === "host") sendTo(to, msg); else broadcast(msg); }
const resetOffers = () => { TR.mine = {gear: [], items: {}, gold: 0}; TR.theirs = {gear: [], items: {}, gold: 0}; TR.myOk = TR.theirOk = false; };
export function tradeRequest(id){ const r = COOP.remotes[id]; if(!r) return;
  if(Math.hypot(r.x - P.x, r.z - P.z) > 10) return H.err(`Get closer to ${r.name} to trade`);
  if(TR.open) return H.err("You are already trading");
  TR.with = id; TR.name = r.name; TR.open = false; TR.waiting = true; resetOffers(); tsend(id, "req"); H.log(`You asked ${r.name} to trade.`, "#9fd6e8"); H.openTrade(); }
function tradeData(d){
  if(d.to !== myId()){ if(COOP.role === "host") sendTo(d.to, d); return; }
  if(d.k === "req"){ if(TR.open){ tsend(d.from, "decline", {why: "busy"}); return; } TR.req = {id: d.from, name: d.name}; H.log(`${d.name} wants to trade with you.`, "#9fd6e8"); H.openTrade(); return; }
  if(d.from !== TR.with && d.k !== "accept") return;
  if(d.k === "accept" && TR.with === d.from){ TR.open = true; TR.waiting = false; resetOffers(); H.log(`Trading with ${d.name}.`, "#9fd6e8"); }
  else if(d.k === "decline"){ H.log(`${TR.name} ${d.why === "busy" ? "is busy" : "declined the trade"}.`, "#93a4ad"); closeTrade(); }
  else if(d.k === "offer"){ TR.theirs = d.offer; TR.myOk = TR.theirOk = false; }
  else if(d.k === "ok"){ TR.theirOk = true; if(TR.myOk) finishTrade(); }
  else if(d.k === "cancel"){ H.log(`${TR.name} cancelled the trade.`, "#93a4ad"); closeTrade(); }
  refresh(); H.openTrade(); }
export function answerTrade(yes){ const q = TR.req; if(!q) return; TR.req = null;
  if(!yes){ tsend(q.id, "decline"); refresh(); return; }
  TR.with = q.id; TR.name = q.name; TR.open = true; TR.waiting = false; resetOffers(); tsend(q.id, "accept"); H.log(`Trading with ${q.name}.`, "#9fd6e8"); refresh(); }
function closeTrade(){ TR.with = null; TR.open = false; TR.waiting = false; resetOffers(); refresh(); }
export function cancelTrade(){ if(TR.with) tsend(TR.with, "cancel"); closeTrade(); }
function sendOffer(){ TR.myOk = TR.theirOk = false; tsend(TR.with, "offer", {offer: TR.mine}); refresh(); }
export function offerGear(id){ const it = S.cur.gear.find(x => x.id === id); if(!it || TR.mine.gear.some(x => x.id === id)) return; TR.mine.gear.push(it); sendOffer(); }
export function unofferGear(id){ TR.mine.gear = TR.mine.gear.filter(x => x.id !== id); sendOffer(); }
export function offerItem(k, n){ const have = S.cur.bag[k] || 0, cur = TR.mine.items[k] || 0, v = Math.max(0, Math.min(have, cur + n)); if(v) TR.mine.items[k] = v; else delete TR.mine.items[k]; sendOffer(); }
export function offerGold(v){ TR.mine.gold = Math.max(0, Math.min(S.cur.gold, Math.floor(+v || 0))); sendOffer(); }
export function acceptTrade(){ if(!TR.open) return;
  const room = 30 - S.cur.gear.length + TR.mine.gear.length; if(TR.theirs.gear.length > room) return H.err("Your bag does not have room for that");
  TR.myOk = true; tsend(TR.with, "ok"); if(TR.theirOk) finishTrade(); refresh(); }
function finishTrade(){
  const c = S.cur, mine = TR.mine, theirs = TR.theirs, name = TR.name;
  // what you give (only what you still have), then what you get
  c.gear = c.gear.filter(x => !mine.gear.some(g => g.id === x.id));
  for(const [k, n] of Object.entries(mine.items)) G.removeItem(k, Math.min(n, c.bag[k] || 0));
  c.gold = Math.max(0, c.gold - mine.gold);
  for(const it of theirs.gear) c.gear.push({...it, st: {...it.st}, id: Math.random().toString(36).slice(2, 10)});
  for(const [k, n] of Object.entries(theirs.items)) if(ITEMS[k]) G.addItem(k, n);
  c.gold += theirs.gold || 0;
  H.log(`Trade with ${name} complete.`, "#7be08a"); H.save(); closeTrade(); }
export function tradeTick(){ if((TR.open || TR.waiting) && TR.with){ const r = COOP.remotes[TR.with]; if(!r || Math.hypot(r.x - P.x, r.z - P.z) > 15){ H.log("The trade was cancelled – you are too far apart.", "#93a4ad"); cancelTrade(); } } }
const offerHTML = (o, mineSide) => {
  const g = o.gear.map(it => `<div class="it" data-tip="trade:${it.id}">${H.gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${esc(it.n)}</b><small>level ${it.il}</small></div>${mineSide ? `<button class="sbtn" data-act="tunoffer" data-id="${it.id}">Take back</button>` : ""}</div>`).join("");
  const it = Object.entries(o.items).map(([k, n]) => `<div class="it">${H.itemImg(k)}<div class="nm"><b>${ITEMS[k] ? ITEMS[k].name : k}</b> <span class="muted">× ${n}</span></div>${mineSide ? `<button class="sbtn" data-act="titem" data-id="${k}" data-n="-1">−1</button>` : ""}</div>`).join("");
  return (g + it) || `<div class="muted">Nothing yet.</div>`; };
export function tradeHTML(){
  if(TR.req && !TR.open) return `<h3>Trade</h3><div class="it"><div class="nm"><b>${esc(TR.req.name)}</b> wants to trade with you.</div><button class="sbtn pri" data-act="tyes">Accept</button><button class="sbtn" data-act="tno">Decline</button></div>`;
  if(TR.waiting) return `<h3>Trade</h3><div class="muted">Waiting for ${esc(TR.name)} to answer…</div><button class="sbtn" data-act="tcancel">Cancel</button>`;
  if(!TR.open) return `<h3>Trade</h3><div class="muted">Right-click a friend who is close to you to ask them to trade.</div>`;
  const c = S.cur;
  let h = `<h3>Trading with ${esc(TR.name)}</h3>`;
  h += `<h3>${esc(TR.name)} offers ${TR.theirOk ? `<span style="color:#7be08a">· accepted</span>` : ""}</h3>${offerHTML(TR.theirs, false)}<div class="muted" style="margin:4px 0">Gold: <b style="color:#ffd36b">${TR.theirs.gold || 0}</b></div>`;
  h += `<h3>You offer ${TR.myOk ? `<span style="color:#7be08a">· accepted</span>` : ""}</h3>${offerHTML(TR.mine, true)}
    <div class="row" style="margin:6px 0">Gold: <input id="tgold" type="number" min="0" max="${c.gold}" value="${TR.mine.gold}" style="width:90px;font:700 14px 'Alegreya Sans';padding:4px 6px;background:#0d1216;color:var(--text);border:1px solid var(--line);border-radius:5px"><button class="sbtn" data-act="tgold">Set</button><span class="muted">you have ${c.gold}</span></div>`;
  h += `<div class="row" style="margin:8px 0"><button class="sbtn pri" data-act="taccept" ${TR.myOk ? "disabled" : ""}>Accept trade</button><button class="sbtn" data-act="tcancel">Cancel</button></div>`;
  const gear = c.gear.filter(it => !TR.mine.gear.some(x => x.id === it.id)), items = Object.keys(c.bag).filter(k => ITEMS[k] && (c.bag[k] - (TR.mine.items[k] || 0)) > 0);
  h += `<h3>Your bag – click to offer</h3>`;
  for(const it of gear) h += `<div class="it" data-tip="gear:${it.id}">${H.gearImg(it)}<div class="nm"><b style="color:${QUAL[it.q].color}">${esc(it.n)}</b><small>level ${it.il}</small></div><button class="sbtn" data-act="toffer" data-id="${it.id}">Offer</button></div>`;
  for(const k of items) h += `<div class="it">${H.itemImg(k)}<div class="nm"><b>${ITEMS[k].name}</b> <span class="muted">× ${c.bag[k] - (TR.mine.items[k] || 0)}</span></div><button class="sbtn" data-act="titem" data-id="${k}" data-n="1">Offer 1</button></div>`;
  if(!gear.length && !items.length) h += `<div class="muted">Your bag is empty.</div>`;
  return h;
}
