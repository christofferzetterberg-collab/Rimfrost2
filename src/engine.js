// The rules of combat, ported from Rimfrost 1: stats, resources, abilities, casting, damage, healing, buffs, druid forms.
// Rimfrost 1 measured everything in pixels; here 1 world unit = PXU pixels, so the ability data can be reused unchanged.
import * as THREE from "three";
import {P, S, E, mobs, PXU} from "./state.js";
import {AB, BARS, CLASSES, HUNTER_MIN, CLASS_DMG, PLAYER_DMG, MANA_COST_MULT, RES_NAME, SCHOOL_COLOR, TALENTS, TIER_NEED, TREES, TALENT_VERSION, TALENT_CLASS_VER, HEAL_AB} from "./rimdata.js";
import {ITEMS, LOOT, BEASTS, QUAL, GEAR_MAX, makeGear, rollQuality, canWear, gearTypeName} from "./items.js";
import {makeBearForm, makeWolf} from "./models.js";
import {steer} from "./nav.js";
import * as CO from "./coop.js";
import {B, WATER, height, colliders, nearColliders, los} from "./world.js";
import {dgBlocked} from "./dungeon.js";
import {clamp} from "./util.js";

let scene = null, H = {};          // H: hooks from main.js (floatText, log, err, banner, onForm, onLevel, onDeath, buildBar)
export function initEngine(sc, hooks){ scene = sc; H = hooks; }
const C = () => S.cur;
export const MAX_LVL = 30;
export const rand = (a, b) => a + Math.random() * (b - a);
export const fmt = n => Math.round(n);
export const T = id => (C() && C().talents && C().talents[id]) || 0;       // talent rank
export const teff = k => { let v = 0; for(const t of TALENTS[C().cls]) if(t.eff && t.eff[k]) v += t.eff[k] * T(t.id); return v; };
export const talentPoints = () => Math.max(0, C().level - 9);
export const talentsSpent = () => Object.values(C().talents || {}).reduce((a, b) => a + b, 0);
export function gearStat(k){ let v = 0; for(const it of Object.values(C().eq || {})) if(it && it.st[k]) v += it.st[k]; return v; }
export const distU = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export const pdist = (a, b) => Math.hypot(a.px - b.px, a.py - b.py);
export const sees = (a, b) => los(a.x, height(a.x, a.z) + 1.4, a.z, b.x, height(b.x, b.z) + 1.0, b.z);
// pixel coordinates for the Rimfrost 1 ability code
export function withPx(o){ Object.defineProperties(o, {px: {get(){ return this.x * PXU; }, configurable: true}, py: {get(){ return this.z * PXU; }, configurable: true}}); return o; }

// ---------------------------------------------------------------- moving and colliding (you and the monsters)
export const MAX_UP = 1.1, MAX_DOWN = 1.8;          // steepest slope you, pets and monsters can walk up / down (height per unit)
export function blocked(x, z, fromX, fromZ, r){
  if(x > 500) return fromX < 500 || dgBlocked(x, z, r);                                    // inside the crypt: only its walls
  if(x < B.x0 + 4 || x > B.x1 - 4 || z < B.z0 + 4 || z > B.z1 - 4) return true;
  if(height(x, z) < WATER + 0.1) return true;                                              // no swimming yet
  const step = Math.hypot(x - fromX, z - fromZ); if(step > 0.001){ const sl = (height(x, z) - height(fromX, fromZ)) / step; if(sl > MAX_UP || sl < -MAX_DOWN) return true; }   // too steep to climb (you can go down steeper slopes than up)
  for(const c of nearColliders(x, z)){ const dx = x - c.x, dz = z - c.z; if(dx*dx + dz*dz < (c.r + r) ** 2) return true; }
  return false;
}
export function tryMove(e, dx, dz){ const nx = e.x + dx, nz = e.z + dz;
  if(!blocked(nx, nz, e.x, e.z, e.r)){ e.x = nx; e.z = nz; return true; }
  if(!blocked(nx, e.z, e.x, e.z, e.r)){ e.x = nx; return true; }                          // slide along walls
  if(!blocked(e.x, nz, e.x, e.z, e.r)){ e.z = nz; return true; }
  return false; }

// ---------------------------------------------------------------- stats
export const xpNeed = l => Math.round((100 + l*l*12 + l*40) * 2);
export const resType = () => P.form === "bear" ? "rage" : P.form === "cat" ? "energy" : CLASSES[C().cls].res;
export const maxRes = type => type === "mana" ? P.maxMana : 100;
export function addRes(type, n){ P[type] = clamp(P[type] + n, 0, maxRes(type)); }
// ---------------------------------------------------------------- attributes (from gear): Strength, Agility, Intellect, Stamina, and spell damage / spell healing
// Strength: 0.5 attack power (warriors, paladins, druids; 0.25 for others) · Agility: 0.5 attack power for hunters (and druids in Bear/Wolf Form), attack crit (30 = 1%) and dodge
// Intellect: 8 mana, spell crit (30 = 1%), and 0.25 spell power for mana users · Stamina: 10 health · Spell Damage: spell power for damage only · Spell Healing: stronger heals
export const STR_FULL = new Set(["warrior", "paladin", "druid"]);
export const SICK = 0.25;                 // Resurrection Sickness: everything at 25% for a while
const sickM = () => P.buffs && P.buffs.ressick ? SICK : 1;
export const attr = k => gearStat(k) * sickM();
const usesMana = () => CLASSES[C().cls].res === "mana";
export const strAP = () => attr("str") * (STR_FULL.has(C().cls) ? 0.5 : 0.25);
export const agiAP = () => attr("agi") * (C().cls === "hunter" || (C().cls === "druid" && P.form) ? 0.5 : 0.1);
export const intSP = () => usesMana() ? attr("int") * 0.25 : 0;
let HEALING = false;                         // true while a healing ability runs (spell damage then doesn't count, spell healing does)
export const pow = () => 6 + C().level * 2.6 + gearStat("pow") + strAP() + agiAP();
export const spow = () => (6 + C().level * 2.6 + gearStat("sp") + intSP() + (HEALING ? 0 : gearStat("sd"))) * (P.buffs.sage ? 1.2 : 1);
// how much stronger your heals are: spell healing and spell power on gear, Intellect, and healing talents
export const healMult = () => sickM() * (1 + teff("heal") + (gearStat("sh") + gearStat("sp") * 0.5 + intSP()) / (40 + 8 * C().level));
function genMult(){ let m = (1 + teff("dmg")) * (CLASS_DMG[C().cls] || 1) * PLAYER_DMG; if(C().race === "orc") m *= 1.03; if(P.buffs.bloodrage) m *= 1.2; if(P.buffs.shout) m *= 1.15; if(P.buffs.elixir) m *= 1.2;
  if(P.buffs.avenging) m *= 1.2; if(T("trueshot")) m *= 1.1; if(T("heartWild")) m *= 1.1; return m * sickM(); }
export function tmul(ab, school){
  let m = 1; const cls = C().cls;
  if(cls === "mage"){ if(school === "fire") m *= 1 + 0.08*T("impFire"); if(school === "frost") m *= 1 + 0.08*T("iceShards"); }
  if(cls === "warrior"){ if(ab === "heroic") m *= 1 + 0.1*T("impHS"); if(ab === "whirlwind" || ab === "execute") m *= 1 + 0.1*T("bloodFury"); }
  if(cls === "hunter"){ if(ab === "firearrow") m *= 1 + 0.15*T("fireArrows"); }
  if(cls === "priest"){ if(ab === "swp") m *= 1 + 0.1*T("impSWP"); if(school === "shadow") m *= (1 + 0.06*T("shadowWeave")) * (T("shadowform") ? 1.15 : 1); }
  if(cls === "paladin" && school === "holy") m *= 1 + 0.08*T("palHoly");
  if(cls === "druid"){ if(["wrath", "moonfire", "starfire"].includes(ab)) m *= 1 + 0.08*T("moonfury"); if(P.form) m *= 1 + 0.08*T("feral"); }
  if(school) m *= 1 + teff(school); if(P.form) m *= 1 + teff("form");                // specialization talents
  return m;
}
export function critChance(m, school){
  let c = 0.05 + gearStat("crit") / 100 + (P.buffs.keen ? 0.05 : 0);
  c += (school === "phys" || !school ? attr("agi") : attr("int")) / 3000;             // 30 Agility = +1% attack crit, 30 Intellect = +1% spell crit
  c += 0.03*T("cruelty") + 0.03*T("lethal") + teff("crit");
  if(school === "holy") c += 0.03*T("holySpec");
  if(C().cls === "mage" && m && (m.slowT > 0 || m.rootT > 0)) c += 0.12*T("shatter");
  return c;
}
export function takenMult(){ let m = CLASSES[C().cls].armor; if(P.form === "bear") m = 0.7 * (1 - 0.05*T("thickHide")); if(P.form === "cat") m = 0.9; if(T("shadowform")) m *= 0.85;
  if(P.buffs.bark) m *= 0.75; m *= 1 - teff("def"); m *= 1 - Math.min(0.25, gearStat("def") / 100); if(P.buffs.ironskin) m *= 0.85; if(P.buffs.stoneform) m *= 0.8; return m; }
const manaScale = () => (100 + C().level * 22) / 122 * MANA_COST_MULT;
export function costOf(id){ const a = AB[id]; let c = a.cost || 0; if(C().cls === "hunter") c *= 1 - 0.1*T("efficiency"); if((a.res || CLASSES[C().cls].res) === "mana") c *= manaScale(); return Math.round(c); }
export function castTime(id){ let c = AB[id].cast || 0; if(!c) return 0;
  if(["fireball", "frostbolt", "pyroblast"].includes(id)) c -= 0.25*T("quickCast");
  if(["wrath", "starfire"].includes(id)) c -= 0.15*T("naturesGrace");
  if(id === "aimed" && T("trueshot")) c -= 1;
  if(id === "palheal") c -= 0.3*T("palQuick");
  if(id === "pyroblast" && P.buffs.hotstreak) c = 0;
  return Math.max(0, c); }
export function playerSpeed(){ return 7 * (P.form === "cat" ? 1.3 : P.form === "leopard" ? 1.6 : 1) * (P.mount ? 1.6 : 1) * (P.buffs.dash ? 1.7 : 1) * (P.buffs.sprint ? 1.4 : 1) * (P.ghost ? 1.25 : 1) * (P.devSpeed || 1); }
export function recompute(full){
  const c = CLASSES[C().cls]; let hp = (80 + C().level * 22) * c.hp + gearStat("hp") + gearStat("sta") * 10;
  if(C().race === "dwarf") hp *= 1.08;
  hp *= 1 + 0.06*T("toughness") + 0.06*T("endurance") + 0.05*T("naturalist") + teff("hp");
  if(P.form === "bear") hp *= 1.6 * (1 + 0.1*T("heartWild"));
  const pct = P.maxHp ? P.hp / P.maxHp : 1;
  hp *= sickM();
  P.maxHp = Math.round(hp); P.hp = full ? P.maxHp : Math.max(1, P.maxHp * pct);
  let mana = 100 + C().level * 22 + gearStat("mana") + gearStat("int") * 8; mana *= 1 + 0.1*T("arcMind") + 0.1*T("spiritual") + 0.1*T("palWis") + teff("mana");
  mana *= sickM();
  P.maxMana = Math.round(mana); P.mana = full ? P.maxMana : Math.min(P.mana, P.maxMana);
}
// every ability your class has, and the ones you know at your level (trainers come in stage 4: for now you learn them as you level)
export const allBarIdsFor = cls => cls === "druid" ? [...new Set([...BARS.druid, ...BARS.druid_bear, ...BARS.druid_cat])] : BARS[cls];
export const allBarIds = () => allBarIdsFor(C().cls);
export function learnUpTo(level){ const got = []; for(const id of allBarIds()) if(AB[id].lvl <= level && !C().learned.includes(id)){ C().learned.push(id); got.push(id); } return got; }
export function barIds(){ const key = C().cls === "druid" && P.form ? "druid_" + P.form : C().cls; return BARS[key].filter(id => C().learned.includes(id)); }

// ---------------------------------------------------------------- the player
export function resetPlayer(x, z){
  Object.assign(P, {x, z, rot: 0, r: 0.4, walk: 0, moving: false, dest: null, path: null, target: null, auto: false, autoT: 0, attackAnim: 0, pose: null,
    hp: 1, maxHp: 0, mana: 0, maxMana: 0, rage: 0, focus: 100, energy: 100, cp: 0, form: null, buffs: {}, cds: {}, gcd: 0, casting: null, castDone: null, mount: null, ghost: false, corpse: null, sickOn: false,
    hots: [], shield: 0, shieldT: 0, combatT: 0, dash: null, leap: null, lastMv: null, dead: false, sitting: false, sitFull: false, potCd: 0});
  for(const k of ["talents", "eq", "bag"]) if(!C()[k]) C()[k] = {};
  if(!C().gear) C().gear = []; if(C().gold == null) C().gold = 0;
  if(!("px" in P)) withPx(P);
  if(!Object.getOwnPropertyDescriptor(P, "fx")) Object.defineProperty(P, "fx", {get(){ return Math.sin(this.rot) >= 0 ? 1 : -1; }});
  recompute(true);
}

// ---------------------------------------------------------------- monsters taking damage
export const aggroRange = m => clamp(9 + (m.lvl - C().level) * 1.2, 5, 13);
export function aggro(m){ if(m.state !== "chase"){ m.state = "chase"; m.path = null; } m.lastHit = H.now(); }
export function engage(m){ if(CO.guestMob(m)){ P.combatT = 6; return; } if(m && !m.dead && m.state === "idle"){ aggro(m); social(m); } if(CO.isMe()) P.combatT = 6; }
export function social(m){ if(m.K && (m.K.passive || m.boss)) return; for(const o of mobs) if(o !== m && !(o.K && o.K.passive) && !o.dead && o.state === "idle" && o.kind === m.kind && distU(o, m) < 7) aggro(o); }
const lvlPenalty = m => { const d = m.lvl - C().level; return d > 0 ? Math.max(0.5, 1 - 0.06 * d) : 1; };
export function hit(m, base, school, ab){
  if(!m || m.dead) return null;
  if(m.state === "return"){ H.floatText(m, "Evade", "#cfd8dc"); return null; }
  const ld = m.lvl - C().level;
  if(ld > 0 && Math.random() < Math.min(0.35, 0.06 * ld)){ H.floatText(m, "Miss", "#cfd8dc"); engage(m); return null; }
  let amt = base * genMult() * tmul(ab, school) * rand(0.92, 1.08) * lvlPenalty(m);
  const crit = Math.random() < critChance(m, school); if(crit) amt *= 2 * (1 + 0.1*T("mortal"));
  if(crit && pet && !pet.dead && T("h_throat")) pet.res = Math.min(100, pet.res + 10 * T("h_throat"));   // Go for the Throat
  amt = Math.max(1, Math.round(amt));
  damageMob(m, amt, crit, school);
  if(crit){
    if(school === "holy" && T("lightbringer")) healP(amt * 0.3);
    if(school === "fire" && T("ignite")) dot(m, "ignite", amt * 0.15 * T("ignite"), 4, "fire", true);
    if(C().cls === "warrior" && school === "phys" && T("deepWounds")) dot(m, "deep", amt * 0.15 * T("deepWounds"), 4, "phys", true);
    if(T("hotStreak") && (ab === "fireball" || ab === "fireblast")){ buff("hotstreak", 15); H.log("Hot Streak: your next Sunflare is instant.", "#ffb347"); }
  }
  return {amt, crit};
}
export function damageMob(m, amt, crit, school){
  if(m.dead) return;
  if(CO.guestMob(m)){ H.floatText(m, crit ? amt + "!" : "" + amt, crit ? "#ffd36b" : (SCHOOL_COLOR[school] || "#fff"), crit); m.flash = 0.15; P.combatT = 6; CO.op("dmg", m, [amt, crit, school, PET_ATK ? 1 : 0]); return; }   // a friend hosts this monster
  m.hp -= amt; m.flash = 0.15; m.lastHit = H.now();
  if(CO.coopMob(m)) CO.threat(m, amt, PET_ATK);
  else if(pet){ if(PET_ATK) m.thPet = (m.thPet || 0) + amt * PETS[pet.kind].threat; else m.thMe = (m.thMe || 0) + amt * (pet.dead ? 1 : PETS[pet.kind].ownerThreat); }
  if(CO.isMe()) H.floatText(m, crit ? amt + "!" : "" + amt, crit ? "#ffd36b" : (SCHOOL_COLOR[school] || "#fff"), crit);
  engage(m);
  if(m.hp <= 0) killMob(m);
}
export function killMob(m){
  m.hp = 0; m.dead = true; m.state = "dead"; m.deadT = 0; m.dots = []; m.slowT = m.rootT = m.stunT = 0;
  if(P.target === m){ P.auto = false; }
  m.thMe = m.thPet = 0; m.tauntT = 0; m.threat = null;
  const share = CO.killShare(m);                // in co-op everyone near shares the XP (loot is personal)
  if(share > 0) killRewards(m, share);
  if(m.dg && (m.elite || m.boss)) CO.dungeonLoot(m);   // a dungeon elite or boss: one piece of gear for the group to roll for
}
// what you get for a kill (share = how many players split the XP)
export function killRewards(m, share = 1){
  if(P.target === m){ P.auto = false; }
  const diff = m.lvl - C().level;
  const got = [];
  if(!BEASTS.has(m.kind)){ const gold = Math.max(1, Math.round((1 + m.lvl * 0.8) * (m.elite ? 6 : 1) * rand(0.7, 1.3))); C().gold = (C().gold || 0) + gold; got.push(`${gold} gold`); }
  for(const [it, ch] of (LOOT[m.kind] || [])) if(Math.random() < ch){ addItem(it, 1); got.push(ITEMS[it].name); }
  if(m.elite && Math.random() < 0.7){ addItem("potHp2", 1); got.push(ITEMS.potHp2.name); }
  H.log(got.length ? `${m.name} defeated. You looted ${got.join(", ")}.` : `${m.name} defeated.`, "#d9e3e7");
  // equipment: elites often, people sometimes, animals rarely
  const gearChance = m.dg && (m.elite || m.boss) ? 0 : m.elite ? 0.6 : BEASTS.has(m.kind) ? 0.02 : 0.08;   // (dungeon elites and bosses: see the group roll)
  if(Math.random() < gearChance) gainGear(makeGear({q: rollQuality(m.elite ? "elite" : "normal"), il: m.lvl, cls: Math.random() < 0.7 ? C().cls : null}), "Loot");
  burst(m.px, m.py, "#d9c49a", 10);
  if(m.elite) H.banner(`${m.name} has fallen!`, "");
  if(T("bloodthirst")) healP(P.maxHp * 0.15);
  if(diff > -5) gainXP((18 + m.lvl * 9) * (m.elite ? 4 : 1) * clamp(1 + diff * 0.1, 0.3, 1.5) / share);
  H.onKill(m.kind);
  H.refresh();
}
export function gainXP(n){
  if(C().level >= MAX_LVL) return;
  n = Math.round(n * (C().race === "human" ? 1.05 : 1)); C().xp += n; H.floatText(P, `+${n} XP`, "#b79bff");
  while(C().level < MAX_LVL && C().xp >= xpNeed(C().level)){ C().xp -= xpNeed(C().level); C().level++; levelUp(); }
  if(C().level >= MAX_LVL) C().xp = 0;
}
function levelUp(){
  recompute(true); ring(P.px, P.py, 70, "#ffd36b"); burst(P.px, P.py, "#ffd36b", 30);
  const canTrain = allBarIds().some(id => AB[id].lvl === C().level && !AB[id].talent && !C().learned.includes(id));
  const bits = []; if(C().level === 10) bits.push("Talents unlocked"); else if(C().level > 10) bits.push("+1 talent point"); if(canTrain) bits.push("New abilities available at your class trainer");
  H.banner(`Level ${C().level}`, bits.join(" · "));
  H.log(`You reached level ${C().level}.`, "#ffd36b");
  if(canTrain) H.log("New abilities are available from your class trainer.", "#9fd6e8");
  H.buildBar(); H.save();
}
export function dot(m, key, total, dur, school, raw, final){
  if(!m || m.dead || m.state === "return") return;
  if(!final){ if(!raw) total *= genMult(); total *= lvlPenalty(m); }
  if(CO.guestMob(m)){ P.combatT = 6; return CO.op("dot", m, [key, total, dur, school]); }
  m.dots = m.dots.filter(d => d.key !== key); m.dots.push({key, per: total / dur, left: dur, tick: 1, school, owner: CO.attacker()}); engage(m);
}
export function slow(m, pct, dur){ if(!m || m.dead) return; if(CO.guestMob(m)){ P.combatT = 6; return CO.op("slow", m, [pct, dur]); } engage(m); m.slowPct = Math.max(pct, m.slowT > 0 ? m.slowPct : 0); m.slowT = Math.max(m.slowT, dur); }
export function root(m, dur){ if(!m || m.dead || m.boss) return; if(CO.guestMob(m)){ P.combatT = 6; return CO.op("root", m, [dur]); } engage(m); m.rootT = Math.max(m.rootT, dur); }
export function stun(m, dur){ if(!m || m.dead) return; if(CO.guestMob(m)){ P.combatT = 6; return CO.op("stun", m, [dur]); } engage(m); m.stunT = Math.max(m.stunT, m.boss ? dur * 0.4 : dur); }
// everything within r pixels of (x, y) pixels that you can see from there
export function aoe(x, y, r, fn){ const cx = x / PXU, cz = y / PXU, rr = r / PXU, cy = height(cx, cz) + 1.2;
  mobs.filter(m => !m.dead && m.state !== "return" && Math.hypot(m.x - cx, m.z - cz) < rr + m.r && los(cx, cy, cz, m.x, height(m.x, m.z) + 1, m.z)).forEach(fn); }
export function buff(name, dur){ if(CO.cap()) return CO.cap().fx.push(["buff", name, dur]); P.buffs[name] = dur; }
export function shieldP(amt, dur){ if(HEALING) amt *= healMult(); if(CO.cap()) return CO.cap().fx.push(["shield", Math.round(amt * CO.cap().scale), dur]); P.shield = Math.max(P.shield || 0, amt); P.shieldT = dur; }
export function healP(n){ if(HEALING) n *= healMult(); if(CO.cap()) return CO.cap().fx.push(["heal", Math.round(n * CO.cap().scale)]); n = Math.round(n); const before = P.hp; P.hp = Math.min(P.maxHp, P.hp + n); const got = Math.round(P.hp - before); if(got > 0) H.floatText(P, "+" + got, "#7be08a"); }
export function hot(key, total, dur){ if(HEALING) total *= healMult(); if(CO.cap()) return CO.cap().fx.push(["hot", key, total * CO.cap().scale, dur]); P.hots = P.hots.filter(h => h.key !== key); P.hots.push({key, per: total / dur, left: dur, tick: 1}); }
export function addCP(){ P.cp = Math.min(5, P.cp + 1); }
export function setForm(f){
  if(P.casting) cancelCast(); if(P.mount) H.dismount();
  P.form = f; P.cp = 0; P.auto = P.auto && f !== "leopard";
  if(f === "bear") P.rage = Math.max(P.rage, 10);
  if(f === "cat") P.energy = 100;
  recompute(false);
  ring(P.px, P.py, 40, f === "bear" ? "#c89a68" : f === "cat" ? "#9cb0c0" : f === "leopard" ? "#ffd36b" : "#9cf07a");
  H.onForm(); H.buildBar();
}

// ---------------------------------------------------------------- the player taking damage
export function avoidChances(){
  const cls = C().cls, pb = (cls === "warrior" || cls === "paladin") ? 0.04 : cls === "hunter" ? 0.02 : (cls === "druid" && P.form === "bear") ? 0.02 : 0;
  return {dodge: 0.04 + teff("dodge") + (P.form === "cat" ? 0.03 : 0) + (C().race === "elf" ? 0.03 : 0) + attr("agi") / 4000, parry: pb > 0 ? pb + teff("parry") : 0};
}
const mobMiss = m => m ? clamp(0.05 + (C().level - m.lvl) * 0.01, 0.01, 0.1) : 0.05;
export function playerDamage(raw, src, kind = "melee"){
  if(P.dead || P.god) return;                                                   // (god mode: dev tools)
  if(P.sitting) standUp();
  if(P.buffs.bubble){ H.floatText(P, "Immune", "#fff2b0"); return; }
  { const av = avoidChances(), r = Math.random(), mm = mobMiss(src); let txt = null;
    if(r < mm) txt = "Miss"; else if(r < mm + av.dodge) txt = "Dodge"; else if(kind === "melee" && r < mm + av.dodge + av.parry) txt = "Parry";
    if(txt){ H.floatText(P, txt, "#cfe0e6"); P.combatT = 6; if(src && (!P.target || P.target.dead) && !P.ftarget) P.target = src; return; } }
  if(src && src.lvl > C().level) raw *= 1 + 0.1 * (src.lvl - C().level);
  let amt = Math.max(1, Math.round(raw * rand(0.9, 1.1) * takenMult()));
  if(P.shield > 0){ const ab = Math.min(P.shield, amt); P.shield -= ab; amt -= ab; if(ab > 0) H.floatText(P, "Absorbed", "#fff6d0"); }
  if(amt > 0){ P.hp -= amt; H.floatText(P, "-" + amt, "#ff6b5e");
    // spell pushback: each hit sets the cast back 0.5 sec, at most 3 times per cast
    const c = P.casting; if(c && c.kind !== "gather" && (c.pushes || 0) < 3){ c.pushes = (c.pushes || 0) + 1; c.el = Math.max(0, c.el - 0.5); } }
  P.combatT = 6;
  if(resType() === "rage") addRes("rage", 2 + amt / P.maxHp * 60);
  if(src && (!P.target || P.target.dead) && !P.ftarget) P.target = src;
  if(P.hp <= 0){ P.hp = 0; die(); }
}
function die(){
  if(P.mount) H.dismount();
  P.dead = true; P.casting = null; P.auto = false; P.dash = null; P.leap = null; P.dest = null; P.hots = []; P.sitting = false;
  if(P.form) { P.form = null; recompute(false); H.onForm(); H.buildBar(); }
  for(const m of mobs) if(m.state === "chase") m.state = "return";
  H.onDeath();
}

// ---------------------------------------------------------------- using abilities
export function nearestEnemy(range){ let best = null, bd = range; for(const m of mobs){ if(m.dead || m.state === "return") continue; const d = distU(P, m) - m.r; if(d < bd && sees(P, m)){ bd = d; best = m; } } return best; }
const rangePx = t => (distU(P, t) - t.r) * PXU;
export function tryUse(id){
  if(!id) return;
  const a = AB[id]; if(!a || !C().learned.includes(id) || (P.dead && !a.whileDead)) return;
  if(P.casting){ if(P.casting.kind === "gather" || P.casting.kind === "mount") cancelCast(); else return; }
  if(P.mount) H.dismount();                                                     // using an ability gets you off your mount
  if(P.sitting) standUp();
  if(P.form === "leopard" && !a.form && !a.racial) return H.err("You cannot attack or cast spells in Travel Form");
  if(C().cls === "druid"){ if(a.res === "rage" && P.form !== "bear") return H.err("Requires Bear Form"); if(a.res === "energy" && P.form !== "cat") return H.err("Requires Wolf Form");
    if(P.form && !a.form && !a.res && !a.racial) return H.err("Return to your normal form first"); }
  if(!a.offGcd && P.gcd > 0) return;
  if((P.cds[id] || 0) > 0) return H.err("Not ready yet");
  let t = null;
  if(a.tgt === "enemy"){
    t = P.target;
    if(!t || t.dead || t.state === "return"){ t = nearestEnemy((a.range + 60) / PXU); if(!t) return H.err("You have no target"); P.target = t; }
    const d = rangePx(t);
    if(d > a.range) return H.err("Too far away");
    if(!sees(P, t)) return H.err("Target not in line of sight");
    if(a.minRange && d < a.minRange) return H.err("Too close");
  }
  if(a.check){ const c = a.check(t); if(c !== true) return H.err(c); }
  { const fr = CO.friendRange(id); if(fr) return H.err(fr); }
  const type = a.res || resType(), cost = costOf(id);
  if(P[type] < cost) return H.err(`Not enough ${RES_NAME[type].toLowerCase()}`);
  const ct = castTime(id);
  if(!a.offGcd) P.gcd = 1.0;
  if(ct > 0){ P.casting = {id, t, total: ct, el: 0, label: a.name}; P.dest = null; P.path = null; if(t) faceTo(t); }
  else { P[type] -= cost; finishAbility(id, t); }
}
function faceTo(t){ P.rot = Math.atan2(t.x - P.x, t.z - P.z); }
function finishAbility(id, t){ if(id !== "meld") delete P.buffs.meld;
  const a = AB[id];
  if(a.cd) P.cds[id] = a.cd;
  if(id === "pyroblast" && P.buffs.hotstreak) delete P.buffs.hotstreak;
  HEALING = HEAL_AB.has(id);
  try{ const ft = CO.friendTarget(id); if(ft) CO.castOn(ft, a, t); else a.run(t); } finally{ HEALING = false; }   // a heal on a selected friend goes to them
  if(!a.form && !P.form){ const melee = a.tgt === "enemy" && a.range <= 70; P.attackAnim = 1; P.attackKind = melee ? "melee" : (C().cls === "hunter" && a.tgt === "enemy") ? "bow" : "cast"; }
  else if(P.form) P.attackAnim = 1;
  // a monster notices a melee attack at once; a spell or arrow from range only when it lands
  if(t){ faceTo(t); P.combatT = 6; if(P.target !== t) P.target = t; if(a.tgt === "enemy" && t.state === "idle" && a.range <= 70) engage(t); }
  // shots and weapon attacks (not spells) also start auto-attack
  if(t && a.tgt === "enemy" && (C().cls === "hunter" || a.school === "phys" || a.range <= 70 || a.res === "rage" || a.res === "energy")) P.auto = true;
}
export function cancelCast(why){ if(!P.casting) return; if(why) H.err(why); if(P.casting.kind !== "gather") P.gcd = 0; P.casting = null; }   // a cancelled cast frees the global cooldown
function completeCast(){
  const c = P.casting; P.casting = null; P.castDone = {label: c.label, t: 0.3};
  const a = AB[c.id], t = c.t;
  if(a.tgt === "enemy"){ if(!t || t.dead) return; if(rangePx(t) > a.range + 40) return H.err("Too far away"); if(!sees(P, t)) return H.err("Target not in line of sight"); if(a.minRange && rangePx(t) < a.minRange) return H.err("Too close"); }
  const type = a.res || resType(), cost = costOf(c.id);
  if(P[type] < cost) return H.err(`Not enough ${RES_NAME[type].toLowerCase()}`);
  P[type] -= cost; finishAbility(c.id, t);
}

// ---------------------------------------------------------------- auto-attack
export function autoInfo(){
  if(P.form === "bear") return {range: 55, spd: 2.0, mult: 1.0, rage: 8};
  if(P.form === "cat") return {range: 52, spd: 1.1, mult: 0.55};
  const cls = C().cls;
  if(cls === "warrior") return {range: 52, spd: 2.2, mult: 1.0, rage: 9};
  if(cls === "hunter") return {range: 400, minRange: HUNTER_MIN, spd: 2.0, mult: 0.85, ranged: true};
  if(cls === "paladin") return {range: 52, spd: 2.4, mult: 1.0};
  return {range: 52, spd: 2.4, mult: 0.6};
}
function autoAttack(dt){
  const ai = autoInfo(); P.autoT = Math.max(0, P.autoT - dt);
  const t = P.target;
  if(!P.auto || !t || t.dead || t.state === "return" || P.form === "leopard" || P.casting || P.dash || P.autoT > 0) return;
  const d = rangePx(t); if(d > ai.range) return;
  if(!sees(P, t)) return;
  const close = !!(ai.minRange && d < ai.minRange), mel = close && d <= 52;   // too close to shoot: within melee reach hunters strike with a knife (weaker than the bow), a little further out they can't do either
  if(close && !mel) return;
  P.autoT = ai.spd; P.attackAnim = 1; P.attackKind = ai.ranged && !mel ? "bow" : "melee"; faceTo(t);
  if(mel) hit(t, pow() * 0.5, "phys", "auto");
  else if(ai.ranged) proj(t, "#e9e2c8", 3, () => hit(t, pow() * ai.mult, "phys", "auto"), "arrow");
  else { hit(t, pow() * ai.mult, "phys", "auto"); if(ai.rage) addRes("rage", ai.rage); }
  P.combatT = 6;
}
export const inMeleeOrRange = t => rangePx(t) <= autoInfo().range;

// ---------------------------------------------------------------- per-frame updates
export function updPlayer(dt, moving){
  P.attackAnim = Math.max(0, P.attackAnim - dt * 3);
  if(P.castDone){ P.castDone.t -= dt; if(P.castDone.t <= 0) P.castDone = null; }
  if(P.dead) return;
  P.gcd = Math.max(0, P.gcd - dt); P.potCd = Math.max(0, (P.potCd || 0) - dt);
  for(const k in P.cds){ P.cds[k] -= dt; if(P.cds[k] <= 0) delete P.cds[k]; }
  for(const k in P.buffs){ P.buffs[k] -= dt; if(P.buffs[k] <= 0) delete P.buffs[k]; }
  if(P.sickOn && !P.buffs.ressick){ P.sickOn = false; recompute(false); H.log("Resurrection Sickness has faded.", "#7be08a"); }
  if(P.shield > 0){ P.shieldT -= dt; if(P.shieldT <= 0) P.shield = 0; }
  if(P.casting && moving) cancelCast("Interrupted – you moved");
  if(P.buffs.meld && (moving || P.auto || P.casting || P.dash)) delete P.buffs.meld;      // Shadowmeld ends when you move or act
  if(P.casting){ const a = AB[P.casting.id], t = P.casting.t; if(a && a.minRange && t && !t.dead && rangePx(t) < a.minRange) cancelCast("Too close"); }
  if(P.casting && (P.casting.kind === "gather" || P.casting.kind === "mount") && P.combatT > 0){ const k = P.casting.kind; P.casting = null; H.err(k === "mount" ? "You cannot mount in combat" : "You cannot pick that up in combat"); }
  if(P.casting){ P.casting.el += dt; if(P.casting.el >= P.casting.total){ const c = P.casting;
    if(c.kind === "gather" || c.kind === "mount"){ P.casting = null; P.castDone = {label: c.label, t: 0.3}; if(c.kind === "gather") H.finishGather(c.node); else H.finishMount(c.mount); } else completeCast(); } }
  P.pose = P.mount ? "sit" : P.casting ? (P.casting.kind === "gather" || P.casting.kind === "mount" ? "cast" : C().cls === "hunter" ? "bow" : "cast") : null;
  autoAttack(dt);
  if(P.combatT > 0 && !mobs.some(m => m.state === "chase" && !m.dead && CO.targetsMe(m))) P.combatT = Math.min(P.combatT, 0.25);   // nothing is after you: combat ends
  P.combatT -= dt; const inC = P.combatT > 0, rg = C().race === "undead" ? 1.5 : 1;
  if(P.sitting && (moving || P.casting || P.auto || P.dash || P.leap || inC)) standUp();
  if(P.sitting && P.hp >= P.maxHp && P.mana >= P.maxMana && !P.sitFull){ P.sitFull = true; H.log("You are fully rested.", "#7be08a"); }
  const rest = P.sitting ? 2.5 : 1;
  P.mana = Math.min(P.maxMana, P.mana + P.maxMana * (inC ? 0.012 : 0.05 * rg * rest) * dt);
  P.focus = Math.min(100, P.focus + (inC ? 4 : 9) * dt);
  P.energy = Math.min(100, P.energy + 12 * dt);
  if(!inC) P.rage = Math.max(0, P.rage - 3 * dt);
  if(!inC && (P.combatT < -1 || P.sitting)) P.hp = Math.min(P.maxHp, P.hp + P.maxHp * 0.04 * rg * rest * dt);
  for(const h of P.hots){ h.tick -= dt; if(h.tick <= 0){ h.tick += 1; h.left -= 1; healP(h.per); } }
  P.hots = P.hots.filter(h => h.left > 0);
}
// damage over time, slows, roots and stuns on a monster; returns false while it is stunned
export function updMobStatus(m, dt){
  for(const d of m.dots){ d.tick -= dt; if(d.tick <= 0){ d.tick += 1; d.left -= 1; CO.asAttacker(d.owner, () => damageMob(m, Math.max(1, Math.round(d.per)), false, d.school)); if(m.dead) return false; } }
  m.dots = m.dots.filter(d => d.left > 0);
  m.slowT = Math.max(0, m.slowT - dt); m.rootT = Math.max(0, m.rootT - dt); m.stunT = Math.max(0, m.stunT - dt); m.tauntT = Math.max(0, (m.tauntT || 0) - dt);
  return m.stunT <= 0;
}

// ---------------------------------------------------------------- 3D effects: projectiles, rings, bursts, slashes, ground zones
const fx = [], zones = [];
const glow = new Map(); const gmat = c => { if(!glow.has(c)) glow.set(c, new THREE.MeshBasicMaterial({color: new THREE.Color(c), transparent: true})); return glow.get(c); };
const sphereGeo = new THREE.SphereGeometry(1, 8, 6), arrowGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), cubeGeo = new THREE.BoxGeometry(1, 1, 1);
arrowGeo.rotateX(Math.PI / 2);
export function proj(t, color, size, onHit, kind, sp){
  const arrow = kind === "arrow", m = new THREE.Mesh(arrow ? arrowGeo : sphereGeo, gmat(color));
  if(!arrow) m.scale.setScalar(0.08 + size * 0.03);
  m.position.set(P.x + Math.sin(P.rot) * 0.4, height(P.x, P.z) + 1.4, P.z + Math.cos(P.rot) * 0.4); scene.add(m);
  fx.push({kind: "proj", m, t, onHit, sp: (sp || (arrow ? 680 : 540)) / PXU, arrow});
  if(CO.isMe() && t && t.nid != null) CO.sendVfx({k: "p", n: t.nid, c: color, s: size, a: arrow ? 1 : 0});   // friends see it fly
}
// what a friend cast: only the picture
export function vfxProj(x, z, t, color, size, arrow){ const m = new THREE.Mesh(arrow ? arrowGeo : sphereGeo, gmat(color)); if(!arrow) m.scale.setScalar(0.08 + size * 0.03);
  m.position.set(x, height(x, z) + 1.4, z); scene.add(m); fx.push({kind: "proj", m, t, onHit: () => {}, sp: (arrow ? 680 : 540) / PXU, arrow}); }
export function vfxRing(x, z, r, color){ ringAt(x * PXU, z * PXU, r, color, true); }
export function vfxZone(x, z, r, dur, color){ const g = new THREE.CircleGeometry(r / PXU, 32); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, gmat(color).clone()); m.material.opacity = 0.22; m.material.depthWrite = false;
  m.position.set(x, height(x, z) + 0.12, z); scene.add(m); zones.push({x: x * PXU, y: z * PXU, r, left: dur, tick: 1e9, m, visual: true}); }
export function ring(x, y, r, color){ ringAt(x, y, r, color, false); }
function ringAt(x, y, r, color, remote){
  if(!remote && CO.isMe()) CO.sendVfx({k: "r", x: +(x / PXU).toFixed(2), z: +(y / PXU).toFixed(2), r, c: color});
  const g = new THREE.RingGeometry(0.85, 1, 40); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, gmat(color).clone()); m.material.side = THREE.DoubleSide; m.material.depthWrite = false;
  const cx = x / PXU, cz = y / PXU; m.position.set(cx, height(cx, cz) + 0.15, cz); scene.add(m);
  fx.push({kind: "ring", m, r: Math.max(0.5, r / PXU), life: 0.45, max: 0.45});
}
export function burst(x, y, color, n){
  const cx = x / PXU, cz = y / PXU, by = height(cx, cz) + 1;
  for(let i = 0; i < Math.min(n, 30); i++){ const m = new THREE.Mesh(cubeGeo, gmat(color)); m.scale.setScalar(0.1); m.position.set(cx, by, cz); scene.add(m);
    const a = Math.random() * 6.28, s = rand(1.5, 4); fx.push({kind: "spark", m, vx: Math.cos(a) * s, vz: Math.sin(a) * s, vy: rand(1, 4), life: 0.55, max: 0.55}); }
}
export function slash(t){
  if(!t) return; const g = new THREE.RingGeometry(0.9, 1.15, 16, 1, -1, 2); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, gmat("#ffffff").clone()); m.material.side = THREE.DoubleSide; m.material.depthWrite = false;
  m.position.set(t.x, height(t.x, t.z) + 1.0, t.z); m.rotation.y = P.rot + Math.PI / 2; scene.add(m);
  fx.push({kind: "slash", m, life: 0.22, max: 0.22});
}
export function zone(x, y, r, dur, dmg, school, ab, slows){
  const cx = x / PXU, cz = y / PXU, rr = r / PXU, g = new THREE.CircleGeometry(rr, 32); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, gmat(SCHOOL_COLOR[school] || "#fff").clone()); m.material.opacity = 0.22; m.material.depthWrite = false;
  m.position.set(cx, height(cx, cz) + 0.12, cz); scene.add(m);
  zones.push({x, y, r, left: dur, tick: 0.4, dmg, school, ab, slows, m});
  if(CO.isMe()) CO.sendVfx({k: "z", x: +cx.toFixed(2), z: +cz.toFixed(2), r, d: dur, c: SCHOOL_COLOR[school] || "#fff"});
}
function kill(o){ scene.remove(o.m); if(o.kind === "ring" || o.kind === "slash"){ o.m.geometry.dispose(); o.m.material.dispose(); } o.done = true; }
export function updFx(dt){
  for(const o of fx){
    if(o.kind === "proj"){ const t = o.t, tx = t.x, tz = t.z, ty = height(tx, tz) + 1;
      const dx = tx - o.m.position.x, dy = ty - o.m.position.y, dz = tz - o.m.position.z, d = Math.hypot(dx, dy, dz);
      if(t.dead || d < o.sp * dt + 0.3){ if(!t.dead) o.onHit(); kill(o); continue; }
      o.m.position.x += dx / d * o.sp * dt; o.m.position.y += dy / d * o.sp * dt; o.m.position.z += dz / d * o.sp * dt;
      if(o.arrow) o.m.lookAt(tx, ty, tz); continue; }
    o.life -= dt; const k = 1 - o.life / o.max;
    if(o.kind === "ring"){ o.m.scale.setScalar(0.3 + (o.r - 0.3) * Math.min(1, k * 1.6)); o.m.material.opacity = 1 - k; }
    if(o.kind === "spark"){ o.vy -= 9 * dt; o.m.position.x += o.vx * dt; o.m.position.y += o.vy * dt; o.m.position.z += o.vz * dt; o.m.scale.setScalar(0.1 * (1 - k) + 0.02); }
    if(o.kind === "slash"){ o.m.material.opacity = 1 - k; o.m.scale.setScalar(1 + k * 0.4); }
    if(o.life <= 0) kill(o);
  }
  for(let i = fx.length - 1; i >= 0; i--) if(fx[i].done) fx.splice(i, 1);
  for(const z of zones){ z.left -= dt; z.tick -= dt;
    if(z.tick <= 0 && !z.visual){ z.tick += 1; aoe(z.x, z.y, z.r, m => { hit(m, z.dmg, z.school, z.ab); if(z.slows) slow(m, 0.5, 2); }); }
    z.m.material.opacity = 0.22 * Math.min(1, z.left * 2) + Math.sin(H.now() * 6) * 0.03;
    if(z.left <= 0){ scene.remove(z.m); z.m.geometry.dispose(); z.m.material.dispose(); } }
  for(let i = zones.length - 1; i >= 0; i--) if(zones[i].left <= 0) zones.splice(i, 1);
}
export function clearFx(){ for(const o of fx) kill(o); fx.length = 0; for(const z of zones){ scene.remove(z.m); } zones.length = 0; }

// ---------------------------------------------------------------- talents
// points spent in one specialization tree; a talent's tier opens when enough points are in ITS tree
export const treePoints = tree => TALENTS[C().cls].filter(t => t.tree === tree).reduce((a, t) => a + T(t.id), 0);
export function canLearnTalent(t){ const r = T(t.id), left = talentPoints() - talentsSpent(); return C().level >= 10 && left > 0 && r < t.max && treePoints(t.tree) >= TIER_NEED[t.tier]; }
// talents were redesigned into specializations: older characters get their points back once
export function migrateTalents(){ const c = C(), v = TALENT_CLASS_VER[c.cls] || TALENT_VERSION; if(c.talVer === v) return false; const had = talentsSpent(); c.talents = {}; if(c.learned) dropTalentAbilities(); c.talVer = v; return had > 0; }
export {TREES};
export function learnTalent(id){ const t = TALENTS[C().cls].find(x => x.id === id); if(!t || !canLearnTalent(t)) return;
  C().talents[id] = T(id) + 1; if(t.grants && !C().learned.includes(t.grants)){ C().learned.push(t.grants); H.log(`You have learned ${AB[t.grants].name}.`, "#9fd6e8"); H.buildBar(); } recompute(false); H.log(`Talent: ${t.name} ${C().talents[id]}/${t.max}`, "#e6bd5c"); H.save(); H.refresh(); }
const dropTalentAbilities = () => { C().learned = C().learned.filter(id => !AB[id] || !AB[id].talent); };
export function resetTalents(){ if(!talentsSpent()) return; C().talents = {}; dropTalentAbilities(); H.buildBar(); recompute(false); burst(P.px, P.py, "#ffd36b", 16); H.log("Your talents have been reset.", "#e6bd5c"); H.save(); H.refresh(); }

// ---------------------------------------------------------------- bag, gear, gold and potions
export function addItem(k, n){ C().bag[k] = (C().bag[k] || 0) + n; }
export function removeItem(k, n){ C().bag[k] = (C().bag[k] || 0) - n; if(C().bag[k] <= 0) delete C().bag[k]; }
export function gainGear(it, how){
  if(C().gear.length >= GEAR_MAX){ H.log(`Your bag is full. ${it.n} was lost.`, "#ff6b5e"); return false; }
  C().gear.push(it); H.log(`${how || "You received"}: [${it.n}]`, QUAL[it.q].color);
  if(it.q >= 4) H.banner(QUAL[it.q].name + " item!", it.n);
  H.refresh(); return true;
}
export function equipGear(id){
  const g = C().gear, i = g.findIndex(x => x.id === id); if(i < 0) return; const it = g[i];
  if(!canWear(it, C().cls)) return H.err(`A ${CLASSES[C().cls].name} cannot use ${gearTypeName(it).toLowerCase()}.`);
  if(C().level < it.il) return H.err(`Requires level ${it.il}.`);
  g.splice(i, 1); const old = C().eq[it.slot]; if(old) g.push(old);
  C().eq[it.slot] = it; recompute(false); H.log(`You equipped ${it.n}.`, QUAL[it.q].color); H.save(); H.refresh(); H.onForm();
}
export function unequipGear(slot){ const it = C().eq[slot]; if(!it) return; if(C().gear.length >= GEAR_MAX) return H.err("Your bag is full.");
  delete C().eq[slot]; C().gear.push(it); recompute(false); H.save(); H.refresh(); H.onForm(); }
export function destroyGear(id){ C().gear = C().gear.filter(x => x.id !== id); H.save(); H.refresh(); }
export function usePotion(kind){
  if(P.dead) return;
  const k = kind === "hp" ? ["potHp3", "potHp2", "potHp"].find(x => C().bag[x] > 0) : ["potMana2", "potMana"].find(x => C().bag[x] > 0);
  if(!k) return H.err(kind === "hp" ? "You have no healing potions" : "You have no mana potions");
  useItem(k);
}
export function useItem(k){
  if(!C().bag[k] || P.dead) return;
  if(k.startsWith("pot")){ if(P.potCd > 0) return H.err("Potions are not ready yet"); P.potCd = 20; }
  if(k === "potHp") healP(P.maxHp * 0.4);
  else if(k === "potHp2") healP(P.maxHp * 0.75);
  else if(k === "potHp3") healP(P.maxHp);
  else if(k === "potMana" || k === "potMana2"){ P.mana = Math.min(P.maxMana, P.mana + P.maxMana * (k === "potMana2" ? 1 : 0.5)); H.floatText(P, "+mana", "#7fb2ff"); }
  else if(k === "elixir") buff("elixir", 300);
  else if(k === "elixirIron") buff("ironskin", 600);
  else if(k === "elixirKeen") buff("keen", 600);
  else if(k === "elixirSage") buff("sage", 600);
  else return;
  removeItem(k, 1); burst(P.px, P.py, "#ff6b8a", 8); H.refresh();
}

// ---------------------------------------------------------------- resting: sit down out of combat for faster health and mana
export function canRest(){ if(P.dead) return "You cannot rest now"; if(P.combatT > 0) return "You cannot rest in combat"; if(P.form) return "Return to normal form to rest"; return null; }
export function sitDown(){ const why = canRest(); if(why) return H.err(why); if(P.mount) H.dismount(); P.sitting = true; P.sitFull = false; P.casting = null; P.auto = false; P.dest = null; H.floatText(P, "Resting", "#9fd6e8"); }
export function standUp(){ P.sitting = false; }
export function toggleRest(){ if(P.sitting) standUp(); else sitDown(); }

// ---------------------------------------------------------------- hunter pets: a bear (tank) or a wolf (damage), one at a time
const GROWL_CD = 12, GROWL_TAUNT = 3;
// hp = share of your max health, taken = share of damage it takes, coef = attack power per hit, atk = seconds between hits, threat = aggro per damage, ownerThreat = how much of YOUR damage counts while this pet is out
export const PETS = {
  bear: {name: "Bear", sp: 125, hp: 1.2, taken: 0.85, coef: 0.18, atk: 2.0, threat: 4, ownerThreat: 0.8, r: 0.6},
  wolf: {name: "Wolf", sp: 135, hp: 0.8, taken: 1.0, coef: 0.20, atk: 1.1, threat: 0.5, ownerThreat: 1, r: 0.5}
};
// the pet's own skills (shown on the pet bar): each can be switched off so the pet doesn't use it
export const PET_SKILLS = {
  bear: [{id: "growl", name: "Growl", icon: "horn", color: "#e6bd5c", desc: "Taunts the target, forcing it to attack your bear for 3 sec. 12 sec cooldown."},
         {id: "sweep", name: "Sweep", icon: "whirl", color: "#d84a42", desc: "Costs 40 rage. Strikes all nearby enemies. Used when two or more enemies are close."}],
  wolf: [{id: "claw", name: "Claw", icon: "claw", color: "#e8c84a", desc: "Costs 40 energy. A powerful strike."}]
};
export const petSkillOn = id => !(C().petOff && C().petOff[id]);
export function togglePetSkill(id){ const o = C().petOff || (C().petOff = {}); if(o[id]) delete o[id]; else o[id] = true;
  const sk = Object.values(PET_SKILLS).flat().find(x => x.id === id); H.log(`${sk ? sk.name : id} is now ${o[id] ? "off" : "on"}.`, "#e6bd5c"); H.save(); }
// pet orders: "assist" (helps you when you fight), "attack" (goes for the target you gave it), "follow" (stops fighting and stays with you until the fight is over or you order an attack)
export function petAttackCmd(){ if(!pet || pet.dead) return H.err("You have no pet"); const t = P.target;
  if(!t || t.dead || t.state === "return") return H.err("You have no target");
  if(distU(t, P) > 40) return H.err("Too far away"); pet.mode = "attack"; pet.cmdT = t; H.floatText(pet, "Attack!", "#e6bd5c"); }
export function petFollowCmd(){ if(!pet || pet.dead) return H.err("You have no pet"); pet.mode = "follow"; pet.cmdT = null; pet.path = null; H.floatText(pet, "Follow", "#9fd6e8"); }
let pet = null, PET_ATK = false;
export const getPet = () => pet;
export function petFight(){ return P.combatT > 0 || mobs.some(m => !m.dead && m.state === "chase" && distU(m, P) < 40); }
const petMaxHp = kind => Math.round(P.maxHp * PETS[kind].hp * (1 + teff("pethp")));
function petMake(kind){ const d = PETS[kind], mh = petMaxHp(kind);
  const mesh = kind === "bear" ? makeBearForm() : makeWolf(); if(kind === "bear") mesh.scale.setScalar(0.85); else mesh.traverse(o => { if(o.isMesh && o.material.color){ o.material = o.material.clone(); o.material.color.offsetHSL(0.07, 0.25, -0.05); } });
  scene.add(mesh);
  return withPx({kind, name: d.name, x: P.x - Math.sin(P.rot) * 1.4, z: P.z - Math.cos(P.rot) * 1.4, rot: P.rot, r: d.r, hp: mh, maxHp: mh, dead: false, mesh, walk: 0, moving: false, attackAnim: 0, flash: 0,
    atkT: 1, growl: 3, res: kind === "wolf" ? 100 : 0, clawT: 0, sweepT: 0, path: null, owner: C().id, deadT: 0, mode: "assist", cmdT: null}); }
function petRemove(){ if(pet){ scene.remove(pet.mesh); pet = null; } E.pet = null; }
export function petCallCheck(kind){ if(petFight()) return "You cannot call a pet in combat"; if(pet && !pet.dead && pet.kind === kind) return `Your ${PETS[kind].name.toLowerCase()} is already with you`; return true; }
export function petCall(kind){ if(petFight()) return H.err("You cannot call a pet right now");
  petRemove(); C().petType = kind; pet = petMake(kind); E.pet = pet; burst(pet.px, pet.py, "#e6bd5c", 14); H.floatText(pet, PETS[kind].name + " called", "#8fe39a", true); H.log(`You call your ${PETS[kind].name.toLowerCase()}.`, "#8fe39a"); H.save(); }
export function petDismiss(){ if(!pet) return; H.log(`You dismiss your ${PETS[pet.kind].name.toLowerCase()}.`, "#9fd6e8"); burst(pet.px, pet.py, "#9fd6e8", 10); petRemove(); C().petType = null; H.save(); }
export function petMend(){ if(!pet || pet.dead) return; const h = Math.round(pet.maxHp * 0.4 * (1 + 0.25 * T("h_mend"))); if(T("h_mend")) healP(h * 0.15 * T("h_mend")); pet.hp = Math.min(pet.maxHp, pet.hp + h); H.floatText(pet, "+" + h, "#62d36b"); burst(pet.px, pet.py, "#62d36b", 8); }
export function petDamage(raw, src){ if(!pet || pet.dead) return; const amt = Math.max(1, Math.round(raw * rand(0.9, 1.1) * PETS[pet.kind].taken));
  pet.hp -= amt; pet.flash = 0.15; if(pet.kind === "bear") pet.res = Math.min(100, pet.res + 5); H.floatText(pet, "" + amt, "#ff9a7a");
  if(pet.hp <= 0){ pet.hp = 0; pet.dead = true; pet.deadT = 0; H.log(`Your ${pet.name.toLowerCase()} has died.`, "#ff8a7a"); } }
export const petAtk = () => PET_ATK;
function petStrike(t, coef){ if(!t || t.dead) return; const amt = Math.max(1, Math.round(pow() * coef * genMult() * (1 + teff("petdmg")) * (pet && pet.wrathT > 0 ? 1.5 : 1) * rand(0.92, 1.08) * lvlPenalty(t)));
  PET_ATK = true; try{ damageMob(t, amt, false, "phys"); } finally{ PET_ATK = false; } }
// Beast Mastery's active skills: Intimidation (the pet stuns its target) and Bestial Wrath (the pet goes berserk)
const petFoe = () => pet && pet.curT && !pet.curT.dead ? pet.curT : P.target && !P.target.dead ? P.target : null;
export function petIntimidateCheck(){ if(!pet || pet.dead) return "You have no pet"; const t = petFoe(); if(!t) return "Your pet has no target"; if(distU(pet, t) > pet.r + t.r + 3) return "Your pet is too far from its target"; return true; }
export function petIntimidate(){ const t = petFoe(); if(!t) return; stun(t, 3); pet.attackAnim = 1; H.floatText(pet, "Intimidation!", "#e0a050", true); ring(pet.px, pet.py, 35, "#e0a050"); }
export function petWrath(){ if(!pet || pet.dead) return; pet.wrathT = 10; H.floatText(pet, "Bestial Wrath!", "#ff5a3a", true); burst(pet.px, pet.py, "#ff5a3a", 16); }
// your pet goes away while you are a spirit (it comes back when you do)
export function petStash(){ petRemove(); }
// call when the character changes: brings back the pet you had
export function petLoad(){ petRemove(); if(C().cls === "hunter" && C().petType && PETS[C().petType]){ pet = petMake(C().petType); E.pet = pet; } }
export function updPet(dt, blockedFn, tryMoveFn, turnTo){
  if(!pet) return;
  const d = PETS[pet.kind];
  { const mh = petMaxHp(pet.kind); if(mh !== pet.maxHp){ pet.hp = Math.min(mh, pet.hp * mh / pet.maxHp); pet.maxHp = mh; } }
  pet.wrathT = Math.max(0, (pet.wrathT || 0) - dt);
  if(T("h_bond") && !pet.dead && !P.dead){ const k = 0.006 * T("h_bond") * dt; pet.hp = Math.min(pet.maxHp, pet.hp + pet.maxHp * k); P.hp = Math.min(P.maxHp, P.hp + P.maxHp * k); }   // Spirit Bond
  pet.flash = Math.max(0, pet.flash - dt); pet.attackAnim = Math.max(0, pet.attackAnim - dt * 3); pet.atkT -= dt; pet.growl = Math.max(0, pet.growl - dt); pet.clawT = Math.max(0, pet.clawT - dt); pet.sweepT = Math.max(0, pet.sweepT - dt);
  pet.moving = false;
  if(distU(pet, P) > 45 || (P.dead && !pet.dead)){ pet.x = P.x - Math.sin(P.rot) * 1.4; pet.z = P.z - Math.cos(P.rot) * 1.4; pet.path = null; }
  if(pet.dead){ pet.deadT += dt; return; }
  if(P.dead) return;
  const fight = petFight();
  if(!fight) pet.hp = Math.min(pet.maxHp, pet.hp + pet.maxHp * 0.08 * dt);
  if(pet.kind === "wolf") pet.res = Math.min(100, pet.res + 12 * dt); else if(!fight) pet.res = Math.max(0, pet.res - 5 * dt);   // wolf: energy, bear: rage
  // who to fight: the target you ordered it to attack; otherwise what you are attacking, or the nearest enemy that is after you; nothing while told to follow
  let t = null;
  if(pet.mode === "attack"){ const c = pet.cmdT; if(c && !c.dead && c.state !== "return" && distU(c, P) < 45) t = c; else { pet.mode = "assist"; pet.cmdT = null; } }
  if(pet.mode === "follow" && !fight) pet.mode = "assist";
  if(pet.mode === "assist"){
    t = (P.target && !P.target.dead && P.target.state !== "return" && P.combatT > 0 && distU(P.target, P) < 26) ? P.target : null;
    if(!t){ let bd = 18; for(const m of mobs){ if(m.dead || m.state !== "chase") continue; const dd = distU(m, P); if(dd < bd){ bd = dd; t = m; } } } }
  pet.curT = t;
  if(pet.kind === "bear" && petSkillOn("growl") && pet.growl <= 0 && t && distU(pet, t) < pet.r + t.r + 1.7){   // Growl: free, forces the enemy onto the bear for a few seconds
    pet.growl = GROWL_CD; if(CO.coopMob(t)) CO.taunt(t); else { t.tauntT = GROWL_TAUNT; t.thPet = Math.max(t.thPet || 0, (t.thMe || 0) * 1.3 + 40); }
    H.floatText(pet, "Growl!", "#e6bd5c", true); ring(pet.px, pet.py, 40, "#e6bd5c"); pet.attackAnim = 1; }
  if(pet.kind === "bear" && petSkillOn("sweep") && t && pet.res >= 40 && pet.sweepT <= 0){            // Sweep (40 rage): hits every enemy around the bear
    const near = mobs.filter(m => !m.dead && m.state === "chase" && distU(m, pet) < 3.9);
    if(near.length >= 2){ pet.res -= 40; pet.sweepT = 1.5; pet.attackAnim = 1; ring(pet.px, pet.py, 50, "#d84a42"); H.floatText(pet, "Sweep", "#ff8a7a"); for(const m of near) petStrike(m, 0.5); } }
  const sp = (t ? d.sp : null);
  if(t){
    const reach = pet.r + t.r + 0.5;
    if(distU(pet, t) > reach){ const dir = steer(pet, t.x, t.z, dt, blockedFn); if(dir && tryMoveFn(pet, dir.dx * sp / PXU * dt, dir.dz * sp / PXU * dt)){ pet.moving = true; turnTo(pet, dir.dx, dir.dz, dt, 12); } }
    else { turnTo(pet, t.x - pet.x, t.z - pet.z, dt, 12);
      if(pet.atkT <= 0){ pet.atkT = d.atk / ((1 + 0.07 * T("h_frenzy")) * (pet.wrathT > 0 ? 1.3 : 1)); pet.attackAnim = 1; petStrike(t, d.coef); if(pet.kind === "bear") pet.res = Math.min(100, pet.res + 8); }
      if(pet.kind === "wolf" && petSkillOn("claw") && pet.res >= 40 && pet.clawT <= 0 && !t.dead){ pet.res -= 40; pet.clawT = 1.2; pet.attackAnim = 1; H.floatText(pet, "Claw", "#e8c84a"); petStrike(t, 0.55); } }
  } else if(distU(pet, P) > 3){                                              // follow you at your speed (faster when far behind)
    const gx = P.x - Math.sin(P.rot) * 1.6, gz = P.z - Math.cos(P.rot) * 1.6, spd = playerSpeed() * (distU(pet, P) > 9 ? 1.3 : 1);
    const dir = steer(pet, gx, gz, dt, blockedFn); if(dir && tryMoveFn(pet, dir.dx * spd * dt, dir.dz * spd * dt)){ pet.moving = true; turnTo(pet, dir.dx, dir.dz, dt, 10); } }
  // stuck (on a cliff edge or behind rocks) while it should be moving: it finds its way back to you
  const wants = t ? distU(pet, t) > pet.r + t.r + 0.5 : distU(pet, P) > 3;
  pet.stuckT = wants && !pet.moving ? (pet.stuckT || 0) + dt : 0;
  if(pet.stuckT > 2.5 && distU(pet, P) > 3){ pet.x = P.x - Math.sin(P.rot) * 1.4; pet.z = P.z - Math.cos(P.rot) * 1.4; pet.path = null; pet.stuckT = 0; if(pet.mode === "attack"){ pet.mode = "assist"; pet.cmdT = null; } }
  pet.walk = pet.moving ? pet.walk + dt * 10 : pet.walk * 0.85;
}
// who a monster goes after: you, or your pet (highest threat wins; Growl forces the pet for a few seconds)
export function mobTarget(m){
  if(!pet || pet.dead || distU(pet, m) > 30) return P;
  if(P.dead) return pet;
  if(m.tauntT > 0) return pet;
  const tm = m.thMe || 0, tp = m.thPet || 0;
  if(!tm && !tp) return distU(m, pet) < distU(m, P) ? pet : P;
  if(m.tgtPet) return tm > tp * 1.1 ? P : pet;
  return tp > tm * 1.1 ? pet : P;
}

// the helper table the Rimfrost 1 ability code calls
Object.assign(E, {willOfTheDead: () => H.willOfTheDead(), coopGroupFx: (...a) => CO.groupFx(...a), petCallCheck, petCall, petMend, petDismiss, petFight, petIntimidateCheck, petIntimidate, petWrath, pet: null, pow, spow, hit, proj, slash, burst, ring, dot, aoe, healP, buff, stun, slow, zone, tmul, setForm, root, hot, addCP, addRes, shieldP, pdist, fmt, T});
