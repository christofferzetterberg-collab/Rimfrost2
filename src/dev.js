// Dev tools (open the game with ?dev in the address, then press F8).
// Cheats for testing, teleports, and a class balance test that fights the same monsters with every class.
import {P, S, mobs, PXU} from "./state.js";
import {AB, CLASSES, HEAL_AB, TALENTS, TREES, TALENT_VERSION, HUNTER_MIN} from "./rimdata.js";
import {makeGear, SLOT_ORDER, CLASS_OFF, mulberry, hashStr, QUAL} from "./items.js";
import {HUBS, DG_DOORS, ZONES} from "./worlddata.js";
import * as G from "./engine.js";
import * as Q from "./quests.js";
import * as CO from "./coop.js";
import {setHour, clockText} from "./clock.js";

export const DEV = {on: /[?&]dev\b/.test(location.search), sim: false, god: false, speed: 1};
let H = {}, el = null;
export function initDev(hooks){ H = hooks; if(!DEV.on) return; build(); addEventListener("keydown", e => { if(e.code === "F8"){ e.preventDefault(); toggle(); } }); }
export const toggle = () => { if(!DEV.on || !el) return; el.hidden = !el.hidden; if(!el.hidden) render(); };
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));

// ---------------------------------------------------------------- the panel
function build(){
  el = document.createElement("div"); el.id = "devpanel"; el.hidden = true; document.body.appendChild(el);
  const st = document.createElement("style"); st.textContent = `
    #devpanel{position:fixed;left:12px;top:90px;width:430px;max-height:calc(100vh - 110px);overflow:auto;background:rgba(12,16,20,.96);border:1px solid #c88a3a;border-radius:8px;padding:10px 12px;z-index:6;font:13px 'Alegreya Sans',sans-serif;color:#e8eef1}
    #devpanel[hidden]{display:none} #devpanel h3{margin:10px 0 4px;font-size:13px;color:#ffb860;text-transform:uppercase;letter-spacing:.5px}
    #devpanel .r{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:3px 0} #devpanel button{font:700 12px 'Alegreya Sans';padding:4px 8px;border-radius:5px;border:1px solid #4a5a64;background:#1c262d;color:#e8eef1;cursor:pointer}
    #devpanel button.on{background:#5a3a1a;border-color:#ffb860} #devpanel button:hover{border-color:#9fd6e8} #devpanel select,#devpanel input{font:12px 'Alegreya Sans';background:#0d1216;color:#e8eef1;border:1px solid #3a4a54;border-radius:4px;padding:3px}
    #devpanel table{border-collapse:collapse;width:100%;font-size:11.5px;margin-top:6px} #devpanel td,#devpanel th{border:1px solid #2c3a43;padding:3px 4px;text-align:left;vertical-align:top} #devpanel th{color:#9fd6e8}
    #devpanel .w{color:#7be08a} #devpanel .l{color:#ff6b5e} #devpanel .d{color:#e6bd5c} #devpanel .m{color:#93a4ad;font-size:11.5px}`;
  document.head.appendChild(st);
  el.addEventListener("click", e => { const b = e.target.closest("[data-dev]"); if(!b) return; act(b.dataset.dev, b.dataset.v); });
  el.addEventListener("change", e => { const s = e.target.closest("[data-set]"); if(s){ BT[s.dataset.set] = s.type === "checkbox" ? s.checked : s.value; } });
}
const BT = {lvl: "10", q: "2", spec: "0", trials: "3", res: null, busy: false, prog: ""};
if(DEV.on) window.__devBT = {BT, run: () => runBalance()};
function render(){
  if(!el || el.hidden) return; const c = S.cur;
  const hubs = Object.entries(HUBS).map(([id, h]) => `<option value="hub:${id}">${esc(h.name)}</option>`).join("") + Object.entries(DG_DOORS).map(([id]) => `<option value="dg:${id}">Door: ${id.replace("d_", "")}</option>`).join("");
  el.innerHTML = `<div class="r" style="justify-content:space-between"><b style="color:#ffb860;font-size:15px">Dev tools</b><span class="m">F8 to close</span></div>
    ${c ? `<div class="m">${esc(c.name)} · level ${c.level} ${CLASSES[c.cls].name} · ${c.gold} gold</div>
    <h3>Character</h3>
    <div class="r">Level <select id="devlvl">${Array.from({length: 40}, (_, i) => `<option ${i + 1 === c.level ? "selected" : ""}>${i + 1}</option>`).join("")}</select><button data-dev="setlvl">Set</button>
      <button data-dev="gold">+1000 gold</button><button data-dev="learn">Learn all abilities</button><button data-dev="riding">Riding + all mounts</button></div>
    <div class="r">Gear <select id="devq">${QUAL.map((q, i) => `<option value="${i}" ${i === 3 ? "selected" : ""}>${q.name}</option>`).join("")}</select><button data-dev="gear">Equip a full set (your level)</button><button data-dev="prof">Mining & Herbalism 150</button></div>
    <div class="r"><button data-dev="heal">Full health & mana</button><button data-dev="cds">Reset cooldowns</button><button data-dev="god" class="${DEV.god ? "on" : ""}">God mode</button>
      <button data-dev="speed" class="${DEV.speed > 1 ? "on" : ""}">Speed ×3</button><button data-dev="kill">Kill target</button><button data-dev="die">Die</button></div>
    <div class="r"><button data-dev="quests">Finish active quests</button><button data-dev="talents">Reset talents</button><button data-dev="unsick">Remove Resurrection Sickness</button></div>
    <h3>Time of day <span class="m">(now ${clockText()}, only on this computer)</span></h3><div class="r">${[["Dawn", 4], ["Noon", 12], ["Dusk", 19], ["Night", 22], ["Midnight", 0]].map(([n, h]) => `<button data-dev="hour" data-v="${h}">${n}</button>`).join("")}</div>
    <h3>Teleport</h3><div class="r"><select id="devtp">${hubs}</select><button data-dev="tp">Go</button></div>` : `<div class="m">Pick a character first.</div>`}
    <h3>Balance test</h3>
    <div class="m">Every class (human, no race bonus) fights the same monsters at the same level with the same quality gear. Hunters are tested with a bear and with a wolf; druids as caster, bear and wolf. The game pauses while it runs.</div>
    <div class="r">Level <select data-set="lvl">${[5, 10, 15, 20, 25, 30, 35, 40].map(l => `<option ${String(l) === BT.lvl ? "selected" : ""}>${l}</option>`).join("")}</select>
      Gear <select data-set="q">${QUAL.map((q, i) => `<option value="${i}" ${String(i) === BT.q ? "selected" : ""}>${q.name}</option>`).join("")}</select>
      Talents <select data-set="spec"><option value="0" ${BT.spec === "0" ? "selected" : ""}>none</option>${[1, 2, 3].map(i => `<option value="${i}" ${BT.spec === String(i) ? "selected" : ""}>tree ${i}</option>`).join("")}</select>
      Runs <select data-set="trials">${[1, 3, 5].map(n => `<option ${String(n) === BT.trials ? "selected" : ""}>${n}</option>`).join("")}</select></div>
    <div class="r"><button data-dev="bt" ${BT.busy || CO.on() ? "disabled" : ""}>${BT.busy ? "Running… " + esc(BT.prog) : "Run balance test"}</button>${BT.res ? `<button data-dev="btcopy">Copy results</button>` : ""}${CO.on() ? `<span class="m">(not in co-op)</span>` : ""}</div>
    ${BT.res ? resultsHTML(BT.res) : ""}`;
}
function act(a, v){
  const c = S.cur; if(!c && a !== "bt" && a !== "btcopy") return;
  if(a === "setlvl"){ const l = +document.getElementById("devlvl").value; c.level = l; c.xp = 0; G.recompute(true); H.buildBar(); }
  else if(a === "gold") c.gold += 1000;
  else if(a === "learn"){ for(const id of G.allBarIds()) if(AB[id].lvl <= c.level && !AB[id].talent && !c.learned.includes(id)) c.learned.push(id); H.buildBar(); }
  else if(a === "riding"){ c.riding = true; c.mounts = ["horse", "gray", "ram", "wolf"]; }
  else if(a === "gear"){ const q = +document.getElementById("devq").value; equipSet(c, q, c.level, Math.random() * 1e9 | 0); G.recompute(true); H.buildHero(); }
  else if(a === "prof"){ c.prof = {mining: 150, herb: 150}; }
  else if(a === "heal"){ P.hp = P.maxHp; P.mana = P.maxMana; P.rage = 100; P.energy = 100; P.focus = 100; }
  else if(a === "cds"){ P.cds = {}; P.gcd = 0; P.potCd = 0; }
  else if(a === "god"){ DEV.god = !DEV.god; P.god = DEV.god; }
  else if(a === "speed"){ DEV.speed = DEV.speed > 1 ? 1 : 3; P.devSpeed = DEV.speed; }
  else if(a === "kill"){ if(P.target && !P.target.dead) G.damageMob(P.target, P.target.hp + 1, false, "phys"); }
  else if(a === "die"){ P.god = false; G.playerDamage(1e9, null); P.god = DEV.god; }
  else if(a === "quests"){ for(const q of Q.activeQuests()){ const s = c.quests[q.id]; q.obj.forEach((o, i) => { if(o[0] === "collect" || o[0] === "loot") c.qbag[o[1]] = Math.max(c.qbag[o[1]] || 0, o[2]); else if(o[0] === "skill"){ c.prof = c.prof || {}; c.prof[o[1]] = Math.max(c.prof[o[1]] || 1, o[2]); } else s.prog[i] = o[2]; }); } }
  else if(a === "talents"){ c.talents = {}; G.recompute(false); }
  else if(a === "unsick"){ delete P.buffs.ressick; }
  else if(a === "tp"){ const [k, id] = document.getElementById("devtp").value.split(":"); if(k === "hub"){ const s = H.hubSpot(HUBS[id]); H.teleport(s.x, s.z); } else { const d = DG_DOORS[id]; H.teleport(d.x + 3, d.z + 3); } }
  else if(a === "hour") setHour(+v);
  else if(a === "bt"){ runBalance(); return; }
  else if(a === "btcopy"){ copyResults(); return; }
  H.save(); H.refresh(); render();
}
// a full set of gear for a class: one item for every slot, the same every time for the same seed
function equipSet(c, q, il, seed){ c.eq = {}; for(const slot of SLOT_ORDER){ if(slot === "offhand" && !CLASS_OFF[c.cls].length) continue;
  c.eq[slot] = makeGear({slot, cls: c.cls, q, il, r: mulberry(hashStr(c.cls + slot + seed))}); } }

// ---------------------------------------------------------------- the balance test
// what each class does in a fight, in order of priority: [ability, when to use it]
const lowHp = f => () => P.hp / P.maxHp < f, near = d => m => G.distU(P, m) - m.r < d, far = d => m => G.distU(P, m) > d;
const noDot = id => m => !m.dots.some(d => d.key === id), noBuff = k => () => !P.buffs[k];
const ROT = {
  warrior: [["recklessness"], ["laststand", lowHp(0.3)], ["shieldwall", lowHp(0.4)], ["sweeping", () => mobs.filter(o => !o.dead && o.state === "chase").length > 1], ["charge", far(7)], ["mortalstrike"], ["secondwind", lowHp(0.3)], ["shout", noBuff("shout")], ["execute"], ["shieldbash"], ["whirlwind", near(2.6)], ["quake", near(2.6)], ["rend", noDot("rend")], ["heroic"]],
  paladin: [["divinefavor"], ["holyshock", lowHp(0.7)], ["divinestorm", near(2.6)], ["avengershield"], ["bubble", lowHp(0.2)], ["palheal", lowHp(0.4)], ["avenging"], ["holyshield", () => !P.shield], ["judge"], ["hammer"], ["crusader"], ["consecrate", near(2.6)], ["palstrike"]],
  hunter: [["rapidfire"], ["counter"], ["explosive"], ["chimera"], ["mendpet", () => G.getPet() && !G.getPet().dead && G.getPet().hp / G.getPet().maxHp < 0.5], ["raptor"], ["wingclip"], ["poison", noDot("poison")], ["stormarrow"], ["aimed"], ["multishot"], ["firearrow"], ["icearrow"], ["steady"]],
  mage: [["presence"], ["arcanepower"], ["combustion"], ["coldsnap", () => (P.cds.frostnova || 0) > 5], ["icearmor", noBuff("icearmor")], ["deepfreeze"], ["frostnova", near(3)], ["meteor"], ["pyroblast"], ["fireblast"], ["blizzard"], ["sparkrain"], ["frostbolt"], ["fireball"]],
  priest: [["guardian", lowHp(0.25)], ["desperate", lowHp(0.35)], ["painsupp", lowHp(0.5)], ["powerinf"], ["innerfocus"], ["voideruption"], ["pws", () => !P.shield && P.hp / P.maxHp < 0.85], ["heal", lowHp(0.45)], ["renew", () => P.hp / P.maxHp < 0.7 && !P.hots.some(h => h.key === "renew")], ["swp", noDot("swp")], ["mindblast"], ["judgment"], ["holynova", near(3)], ["darkpulse", near(3)], ["smite"]],
  druid: [["tranquility", lowHp(0.4)], ["nswift"], ["starsurge"], ["touch", lowHp(0.4)], ["rejuv", () => P.hp / P.maxHp < 0.7 && !P.hots.some(h => h.key === "rejuv")], ["bark", lowHp(0.6)], ["thorns", noBuff("thorns")], ["moonfire", noDot("moonfire")], ["starfire"], ["hurricane"], ["wrath"]],
  druid_bear: [["berserk"], ["frenzy"], ["roar", near(2.6)], ["bash"], ["swipe", near(2.6)], ["maul"]],
  druid_cat: [["berserk"], ["bite", () => P.cp >= 4], ["pounce"], ["rake", noDot("rake")], ["claw"]],
  warlock: [["lifetap", () => P.mana / P.maxMana < 0.25 && P.hp / P.maxHp > 0.5], ["drainlife", lowHp(0.5)], ["deathcoil"], ["shadowburn", m => m.hp / m.maxHp < 0.25], ["corruption", noDot("corruption")], ["agony", noDot("agony")], ["unstable", noDot("unstable")], ["immolate", noDot("immolate")], ["conflagrate"], ["soulfire"], ["shadowburn"], ["shadowbolt"]],
  rogue: [["coldblood"], ["bladeflurry", () => mobs.filter(o => !o.dead && o.state === "chase").length > 1], ["shadowdance"], ["ambush"], ["evasion", lowHp(0.5)], ["slicedice", () => P.cp >= 2 && !P.buffs.slice], ["eviscerate", () => P.cp >= 4], ["kidney", () => P.cp >= 5], ["gouge", () => P.cp < 3], ["backstab"], ["sinister"]],
  shaman: [["elemmastery"], ["ancswift"], ["manatide", () => P.mana / P.maxMana < 0.4], ["healwave", lowHp(0.4)], ["lshield", noBuff("lshield")], ["searing", () => !G.totemList().some(o => o.kind === "searing" || o.kind === "magma")], ["stoneskin", () => !G.totemList().some(o => o.kind === "stoneskin" || o.kind === "strength")], ["flameshock", noDot("flameshock")], ["earthshock"], ["chain"], ["lightning"]]
};
const MELEE = new Set(["warrior", "paladin", "druid_bear", "druid_cat", "rogue"]);
const VARIANTS = lvl => [["warrior", "Warrior"], ["paladin", "Paladin"], ["hunter", "Hunter + bear", {pet: "bear"}], ...(lvl >= 10 ? [["hunter", "Hunter + wolf", {pet: "wolf"}]] : []),
  ["mage", "Mage"], ["priest", "Priest"], ["warlock", "Warlock + imp", {pet: "imp"}], ...(lvl >= 10 ? [["warlock", "Warlock + voidwalker", {pet: "voidwalker"}]] : []), ["rogue", "Rogue"], ["shaman", "Shaman"], ["druid", "Druid (caster)"], ...(lvl >= 10 ? [["druid", "Druid (bear)", {form: "bear"}]] : []), ...(lvl >= 15 ? [["druid", "Druid (wolf)", {form: "cat"}]] : [])];
const SCEN = [{id: "one", name: "1 monster", n: 1}, {id: "two", name: "2 monsters", n: 2}, {id: "elite", name: "Elite (3× health)", n: 1, elite: true}];
function canUse(id, m){ const a = AB[id]; if(!a || !S.cur.learned.includes(id)) return false;
  if((P.cds[id] || 0) > 0 || (!a.offGcd && P.gcd > 0) || P.casting) return false;
  const type = a.res || G.resType(); if(P[type] < G.costOf(id)) return false;
  if(a.tgt === "ground" && (!m || m.dead || G.distU(P, m) * PXU > a.range)) return false;
  if(a.tgt === "enemy"){ if(!m || m.dead) return false; const d = (G.distU(P, m) - m.r) * PXU; if(d > a.range || (a.minRange && d < a.minRange) || !G.sees(P, m)) return false; }
  if(a.check){ try{ if(a.check(m) !== true) return false; }catch(e){ return false; } }
  return true; }
function think(key, m){
  P.target = m;
  const melee = MELEE.has(key), dU = G.distU(P, m) - m.r - P.r;
  if(melee || (key === "hunter" && dU > 15)) P.dest = dU > 1.2 ? {x: m.x, z: m.z} : null; else P.dest = null;
  // a hunter whose pet holds the monster steps back out of the bow's minimum range (as a player would)
  if(key === "hunter" && m.tgtPet && (G.distU(P, m) - m.r) * PXU < HUNTER_MIN + 10){ const d = G.distU(P, m) || 1, want = HUNTER_MIN / PXU + m.r + 2.5;
    P.dest = {x: m.x + (P.x - m.x) / d * want, z: m.z + (P.z - m.z) / d * want}; }
  if(melee || key === "hunter"){ if(!P.auto) P.auto = true; }
  if(P.dest && P.casting) return;
  for(const [id, when] of ROT[key]){ if(!canUse(id, m)) continue; if(when && !when(m)) continue; G.tryUse(id, AB[id].tgt === "ground" ? {x: m.x, z: m.z} : undefined); if(P.casting || P.gcd > 0 || AB[id].offGcd) break; }
}
// one fight: returns {win, t, hp, dps, taken}
function fight(v, sc, lvl, q, spec, seed){
  const [cls, , opt = {}] = v, key = cls === "druid" && opt.form ? "druid_" + opt.form : cls;
  const c = {id: "__sim", name: "Test", race: "human", cls, level: lvl, xp: 0, gold: 0, learned: G.allBarIdsFor(cls).filter(id => AB[id].lvl <= lvl && !AB[id].talent), bag: {}, gear: [], eq: {}, world: 2, talents: {}, talVer: TALENT_VERSION, quests: {}, qbag: {}};
  equipSet(c, q, lvl, seed);
  if(spec && lvl >= 10){ const tree = TREES[cls][spec - 1].id; let pts = lvl - 9; const list = TALENTS[cls].filter(t => t.tree === tree).sort((a, b) => a.tier - b.tier);
    for(let pass = 0; pass < 4 && pts > 0; pass++) for(const t of list){ while(pts > 0 && (c.talents[t.id] || 0) < t.max){ S.cur = c; if(!G.canLearnTalent(t)) break; c.talents[t.id] = (c.talents[t.id] || 0) + 1; pts--; } } }
  for(const t of TALENTS[cls]) if(c.talents[t.id] && t.grants && !c.learned.includes(t.grants)) c.learned.push(t.grants);   // abilities the talents teach
  S.cur = c; const A = H.arena(); G.resetPlayer(A.x, A.z); G.petStash(); P.god = false; P.devSpeed = 1;
  if(opt.pet){ G.petCall(opt.pet); }
  if(opt.form) G.setForm(opt.form);
  // the monsters: a plain level-matched fighter (Bandit), 11 units away
  const test = []; for(let i = 0; i < sc.n; i++){ const p = {x: A.mx + i * 1.6, z: A.mz + i * 0.8}; const m = H.makeMob("bandit", p, lvl);
    if(sc.elite){ m.maxHp = m.hp = Math.round(m.maxHp * 3); m.dmg *= 1.25; m.elite = true; } test.push(m); }
  let t = 0, taken = 0, hp0 = P.hp, dryT = 0; const DT = 0.05, MAX = 150, usesMana = G.resType() === "mana";
  const startHp = test.reduce((a, m) => a + m.maxHp, 0);
  while(t < MAX){
    const alive = test.filter(m => !m.dead); if(!alive.length || P.dead) break;
    const m = alive.find(o => o.state === "chase") || alive[0];
    if(P.hp < hp0) taken += hp0 - P.hp;
    think(key, m); H.update(DT); t += DT; hp0 = P.hp; if(usesMana && P.mana < P.maxMana * 0.1) dryT += DT;
  }
  const left = test.reduce((a, m) => a + (m.dead ? 0 : m.hp), 0), done = startHp - left, win = test.every(m => m.dead) && !P.dead;
  const res = {win, timeout: !win && !P.dead, t, hp: P.dead ? 0 : P.hp / P.maxHp, dps: done / Math.max(1, t), taken, mana: usesMana ? P.mana / P.maxMana : null, dry: usesMana ? dryT / Math.max(1, t) : null};
  for(const m of test) H.removeMob(m);
  G.petStash();
  return res;
}
async function runBalance(){
  if(BT.busy || CO.on()) return; const orig = S.cur; if(!orig) return; H.save(); const home = {x: P.x, z: P.z};
  BT.busy = true; BT.res = null; DEV.sim = true; render();
  const lvl = +BT.lvl, q = +BT.q, spec = +BT.spec, trials = +BT.trials, out = [], vs = VARIANTS(lvl);
  try{
    let k = 0; const total = vs.length * SCEN.length * trials;
    for(const v of vs){ const row = {name: v[1], cells: []};
      for(const sc of SCEN){ const runs = [];
        for(let i = 0; i < trials; i++){ runs.push(fight(v, sc, lvl, q, spec, 1000 + i)); k++; BT.prog = `${k}/${total}`; render(); await new Promise(r => setTimeout(r, 0)); }
        const avg = f => runs.reduce((a, r) => a + f(r), 0) / runs.length, wins = runs.filter(r => r.win).length;
        row.cells.push({wins, n: runs.length, t: avg(r => r.t), hp: avg(r => r.hp), dps: avg(r => r.dps), to: runs.filter(r => r.timeout).length, mana: runs[0].mana == null ? null : avg(r => r.mana), dry: runs[0].dry == null ? null : avg(r => r.dry)}); }
      out.push(row); }
  } catch(e){ console.error(e); H.log("Balance test failed: " + e.message, "#ff6b5e"); }
  DEV.sim = false; BT.busy = false; BT.res = {lvl, q, spec, trials, rows: out}; P.x = home.x; P.z = home.z;   // (so you come back where you were)
  H.restore(orig); P.god = DEV.god; P.devSpeed = DEV.speed; render();
}
const manaTxt = c => c.mana == null ? "" : ` · ${Math.round(c.mana * 100)}% mana${c.dry > 0.05 ? ` (out of mana ${Math.round(c.dry * 100)}% of the fight)` : ""}`;
const cellTxt = c => `${c.wins}/${c.n} won${c.to ? ` (${c.to} too slow)` : ""} · ${Math.round(c.t)}s · ${Math.round(c.hp * 100)}% hp · ${Math.round(c.dps)} dps${manaTxt(c)}`;
function resultsHTML(R){
  const cls = c => c.wins === c.n ? "w" : c.wins === 0 ? "l" : "d";
  return `<div class="m" style="margin-top:6px">Level ${R.lvl} · ${QUAL[R.q].name} gear · talents: ${R.spec ? "tree " + R.spec : "none"} · ${R.trials} run(s). Time = how long the fight took, hp = health left at the end, mana = mana left at the end (dry = share of the fight spent below 10% mana).</div>
    <table><tr><th>Class</th>${SCEN.map(s => `<th>${s.name}</th>`).join("")}</tr>
    ${R.rows.map(r => `<tr><td><b>${esc(r.name)}</b></td>${r.cells.map(c => `<td class="${cls(c)}">${c.wins}/${c.n} won${c.to ? ` (${c.to} too slow)` : ""}<br>${Math.round(c.t)}s · ${Math.round(c.hp * 100)}% hp<br>${Math.round(c.dps)} dps${c.mana == null ? "" : `<br>${Math.round(c.mana * 100)}% mana${c.dry > 0.05 ? ` · dry ${Math.round(c.dry * 100)}%` : ""}`}</td>`).join("")}</tr>`).join("")}</table>`;
}
function copyResults(){ const R = BT.res; if(!R) return;
  const txt = [`Rimfrost 2 balance test – level ${R.lvl}, ${QUAL[R.q].name} gear, talents ${R.spec ? "tree " + R.spec : "none"}, ${R.trials} run(s)`,
    ...R.rows.map(r => `${r.name}: ` + r.cells.map((c, i) => `${SCEN[i].name}: ${cellTxt(c)}`).join(" | "))].join("\n");
  navigator.clipboard.writeText(txt).then(() => H.log("Balance results copied.", "#7be08a"), () => { prompt("Copy the results:", txt); }); }
