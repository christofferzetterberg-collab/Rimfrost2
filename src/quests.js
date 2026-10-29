// Quests, trainers and shops: the rules (the windows you see live in main.js).
import {P, S} from "./state.js";
import {AB, CLASSES} from "./rimdata.js";
import {QUESTS, QITEMS, NPCS, GOODS, GATHER, PROF, PROF_MAX, trainCost, respecCost} from "./content.js";
import {EXPLORE} from "./worlddata.js";
import {ITEMS, SLOT_ORDER, CLASS_OFF, GEAR_MAX, makeGear, mulberry, hashStr, gearPrice, gearSell} from "./items.js";
import * as G from "./engine.js";

let H = {};
export function initQuests(hooks){ H = hooks; }
const C = () => S.cur;
const qs = () => C().quests || (C().quests = {});
const qb = () => C().qbag || (C().qbag = {});

// ---------------------------------------------------------------- quest state
export const qById = id => QUESTS.find(q => q.id === id);
export const npcById = id => NPCS.find(n => n.id === id);
const prereqOk = q => (q.req || []).every(r => qs()[r] && qs()[r].state === "done");
export const qAvailable = q => !qs()[q.id] && prereqOk(q) && C().level >= q.lvl;
export const qSoon = q => !qs()[q.id] && prereqOk(q) && C().level < q.lvl;
export const qActive = q => qs()[q.id] && qs()[q.id].state === "active";
export const qDone = q => qs()[q.id] && qs()[q.id].state === "done";
export const qTurnInNpc = q => q.to || q.npc;
export function qProg(q, i){ const o = q.obj[i]; if(o[0] === "collect" || o[0] === "loot") return Math.min(qb()[o[1]] || 0, o[2]); if(o[0] === "skill") return Math.min(profSkill(o[1]), o[2]); return Math.min(qs()[q.id].prog[i] || 0, o[2]); }
export const qReady = q => qActive(q) && q.obj.every((o, i) => qProg(q, i) >= o[2]);
export function qXP(q){ const d = C().level - q.lvl, f = d <= 1 ? 1 : Math.max(0.1, 1 - (d - 1) * 0.2); return Math.round(G.xpNeed(q.lvl) * 0.3 * (q.mult || 1) * f); }
export const qGold = q => Math.round((3 + q.lvl * q.lvl * 0.5) * (q.mult || 1));
// gear rewards (as in Rimfrost 1): in the old quest chains every third quest is green (uncommon) and the last one blue (rare);
// the newer quests (n) give no gear, and "pick" quests let you choose one of three pieces instead
export function questGearQ(q){ if(q.n || q.pick) return -1; const num = +q.id.replace(/\D/g, ""), last = !QUESTS.some(o => o.id[0] === q.id[0] && +o.id.replace(/\D/g, "") > num); return last ? 3 : num % 3 === 0 ? 2 : -1; }
export const objName = o => o[0] === "skill" ? PROF[o[1]] + " skill" : o[0] === "explore" ? "Find " + EXPLORE[o[1]].name : o[0] === "kill" ? H.mobName(o[1]) : QITEMS[o[1]].name;
export const activeQuests = () => QUESTS.filter(qActive);

// what floats over a person's head: "!" a quest to give, "?" a quest to hand in, "…" a quest in progress, "soon" (gray !) one for later
export function npcMarker(npcId){
  if(QUESTS.some(q => qTurnInNpc(q) === npcId && qReady(q))) return "?";
  if(QUESTS.some(q => q.npc === npcId && qAvailable(q))) return "!";
  if(QUESTS.some(q => qTurnInNpc(q) === npcId && qActive(q))) return "…";
  return null;
}

export function acceptQuest(id){ const q = qById(id); if(!q || !qAvailable(q)) return;
  qs()[id] = {state: "active", prog: q.obj.map(() => 0)}; H.log(`New quest: ${q.name}`, "#e6bd5c");
  if(qReady(q) && q.to) H.log(`Go to ${npcById(q.to).name}.`, "#e6bd5c"); H.save(); H.refresh(); }
export function abandonQuest(id){ const q = qById(id); if(!q || !qActive(q)) return; delete qs()[id];
  for(const o of q.obj) if(o[0] === "collect" || o[0] === "loot") delete qb()[o[1]]; H.log(`Abandoned: ${q.name}`, "#93a4ad"); H.save(); H.refresh(); }
export function turnIn(id){
  const q = qById(id); if(!qReady(q)) return;
  for(const o of q.obj) if(o[0] === "collect" || o[0] === "loot"){ qb()[o[1]] -= o[2]; if(qb()[o[1]] <= 0) delete qb()[o[1]]; }
  const xp = qXP(q), gold = qGold(q);
  qs()[id].state = "done"; C().gold += gold;
  if(q.items) for(const [k, n] of Object.entries(q.items)) G.addItem(k, n);
  const gq = questGearQ(q); if(gq >= 0) G.gainGear(makeGear({q: gq, il: q.lvl + 1, cls: C().cls}), "Quest reward");
  if(q.pick){ const slots = SLOT_ORDER.filter(sl => sl !== "offhand" || CLASS_OFF[C().cls].length).sort(() => Math.random() - 0.5).slice(0, 3);
    C().pick = {qid: id, items: slots.map(slot => ({...makeGear({slot, cls: C().cls, q: q.pick.q, il: q.lvl + 1}), id: Math.random().toString(36).slice(2, 10)}))}; setTimeout(() => H.openPick(), 400); }
  H.log(`Quest complete: ${q.name}. +${gold} gold.`, "#7be08a"); H.banner("Quest complete", q.name);
  G.gainXP(xp); H.save(); H.refresh();
}
// a reward you choose: take one of the three pieces
export function takePick(i){ const p = C().pick; if(!p || !p.items[i]) return; if(C().gear.length >= GEAR_MAX) return H.err("Your bag is full");
  G.gainGear(p.items[i], "Quest reward"); delete C().pick; H.save(); H.refresh(); }
// places to explore: walking close enough completes the objective
export function questExplore(x, z){
  for(const q of QUESTS){ if(!qActive(q)) continue; const s = qs()[q.id];
    q.obj.forEach((o, i) => { if(o[0] !== "explore" || s.prog[i] >= o[2]) return; const sp = EXPLORE[o[1]]; if(Math.hypot(x - sp.x, z - sp.z) > 7) return;
      exploreDone(q, i, o[1], ""); if(H.shareExplore) H.shareExplore(o[1]); }); } }
function exploreDone(q, i, place, by){ const s = qs()[q.id], sp = EXPLORE[place]; s.prog[i] = q.obj[i][2]; const nm = sp.name[0].toUpperCase() + sp.name.slice(1);
  H.banner(nm, by ? `Discovered by ${by}` : "Location discovered"); H.log(`${q.name}: ${by ? by + " found" : "discovered"} ${sp.name}.`, "#e6bd5c"); progressLog(q); H.save(); H.refresh(); }
// co-op: a friend near you found a place – it counts for you too
export function friendExplored(place, by){ for(const q of QUESTS){ if(!qActive(q)) continue; const s = qs()[q.id];
  q.obj.forEach((o, i) => { if(o[0] === "explore" && o[1] === place && s.prog[i] < o[2]) exploreDone(q, i, place, by); }); } }
function progressLog(q){ if(qReady(q)) H.log(`${q.name} completed. Return to ${npcById(qTurnInNpc(q)).name}.`, "#7be08a"); }
// a monster died: count kills and roll quest loot
export function questKill(kind){
  for(const q of QUESTS){ if(!qActive(q)) continue; const s = qs()[q.id];
    q.obj.forEach((o, i) => {
      if(o[0] === "kill" && o[1] === kind && s.prog[i] < o[2]){ s.prog[i]++; H.log(`${q.name}: ${objName(o)} ${s.prog[i]}/${o[2]}`, "#e6bd5c"); progressLog(q); }
      if(o[0] === "loot" && o[3] === kind && (qb()[o[1]] || 0) < o[2] && Math.random() < o[4]){ qb()[o[1]] = (qb()[o[1]] || 0) + 1; H.log(`${q.name}: ${objName(o)} ${qProg(q, i)}/${o[2]}`, "#e6bd5c"); progressLog(q); }
    }); }
  H.refresh();
}
// everything your active quests still need, worked out once per frame: quest items to pick up or loot, and monster kinds
export function neededItems(){ const out = new Set(); for(const q of QUESTS) if(qActive(q)) q.obj.forEach((o, i) => { if((o[0] === "collect" || o[0] === "loot") && qProg(q, i) < o[2]) out.add(o[1]); }); return out; }
export function neededMobs(){ const out = new Set(); for(const q of QUESTS) if(qActive(q)) q.obj.forEach((o, i) => { if(qProg(q, i) >= o[2]) return; if(o[0] === "kill") out.add(o[1]); if(o[0] === "loot") out.add(o[3]); }); return out; }
// is this monster needed for one of your active quests (to kill, or for its loot)?
export const mobNeeded = kind => QUESTS.some(q => qActive(q) && q.obj.some((o, i) => (o[0] === "kill" && o[1] === kind || o[0] === "loot" && o[3] === kind) && qProg(q, i) < o[2]));

// ---------------------------------------------------------------- gathering: Mining and Herbalism (1–150)
const prof = () => C().prof || (C().prof = {mining: 1, herb: 1});
export const profSkill = k => prof()[k] || 1;
export const gatherReq = item => GATHER[item] || null;
// how likely a gather raises your skill: always while the node is new to you, then less and less
export function skillUpChance(item){ const g = GATHER[item]; if(!g) return 0; const d = profSkill(g.skill) - g.req;
  return profSkill(g.skill) >= PROF_MAX ? 0 : d < 30 ? 1 : d < 55 ? 0.5 : d < 80 ? 0.2 : 0; }
export function canGather(item){ const g = GATHER[item]; if(!g) return true; return profSkill(g.skill) >= g.req ? true : `Requires ${PROF[g.skill]} ${g.req}`; }
export function gainProf(item){ const g = GATHER[item]; if(!g || Math.random() >= skillUpChance(item)) return;
  const p = prof(); p[g.skill] = Math.min(PROF_MAX, (p[g.skill] || 1) + 1); H.log(`Your ${PROF[g.skill]} skill has increased to ${p[g.skill]}.`, "#7fc4ff");
  for(const q of QUESTS) if(qActive(q) && q.obj.some(o => o[0] === "skill" && o[1] === g.skill && p[g.skill] === o[2])) progressLog(q); }
export {PROF, PROF_MAX};

// do you still need this quest item?
export const needsQItem = item => QUESTS.some(q => qActive(q) && q.obj.some(o => (o[0] === "collect" || o[0] === "loot") && o[1] === item && (qb()[item] || 0) < o[2]));
export function gotQItem(item){ qb()[item] = (qb()[item] || 0) + 1;
  for(const q of QUESTS){ if(!qActive(q)) continue; q.obj.forEach((o, i) => { if(o[0] === "collect" && o[1] === item){ H.log(`${q.name}: ${objName(o)} ${qProg(q, i)}/${o[2]}`, "#e6bd5c"); progressLog(q); } }); }
  H.save(); H.refresh(); }

// ---------------------------------------------------------------- the trainer
// what the trainer can teach you: abilities you don't know yet (some need another one first, like Dismiss Pet after Call Bear)
export function trainable(){ return G.allBarIds().filter(id => !C().learned.includes(id) && !AB[id].talent && (!AB[id].needs || C().learned.includes(AB[id].needs))).sort((a, b) => AB[a].lvl - AB[b].lvl); }
export const abCost = id => AB[id].free ? 0 : trainCost(AB[id].lvl);
export function learnAbility(id){ const a = AB[id], cost = abCost(id);
  if(C().learned.includes(id) || C().level < a.lvl || (a.needs && !C().learned.includes(a.needs))) return; if(C().gold < cost) return H.err("You don't have enough gold");
  C().gold -= cost; C().learned.push(id); G.burst(P.px, P.py, "#9fd6e8", 16); H.log(`You have learned ${a.name}.`, "#9fd6e8"); H.buildBar(); H.save(); H.refresh(); }
export function buyRespec(){ const c = respecCost(C().level); if(!G.talentsSpent()) return; if(C().gold < c) return H.err("You don't have enough gold");
  C().gold -= c; G.resetTalents(); }
// the abilities a new character starts with
export const STARTERS = {druid: ["wrath", "touch"], paladin: ["palstrike", "palheal"], warrior: ["heroic"], priest: ["smite", "heal"], mage: ["fireball"], hunter: ["steady"], warlock: ["shadowbolt", "summonimp", "dismissdemon"], rogue: ["sinister"], shaman: ["lightning"]};
export const starterAbilities = cls => (STARTERS[cls] || [G.allBarIdsFor(cls)[0]]).slice();

// ---------------------------------------------------------------- shops
export function buyGoods(k){ const row = GOODS.find(g => g[0] === k); if(!row) return; if(C().gold < row[1]) return H.err("You don't have enough gold");
  C().gold -= row[1]; G.addItem(k, 1); H.log(`You bought ${ITEMS[k].name}.`, "#d9e3e7"); H.save(); H.refresh(); }
export function sellItem(k, all){ const I = ITEMS[k], n = all ? C().bag[k] : 1; if(!I || !C().bag[k]) return;
  C().gold += I.sell * n; G.removeItem(k, n); H.log(`You sold ${n > 1 ? n + " × " : ""}${I.name} for ${I.sell * n} gold.`, "#d9e3e7"); H.save(); H.refresh(); }
// junk: gray loot and poor (gray) equipment – never quest items, potions, elixirs, herbs or ore
export const isJunkGear = it => it.q === 0;
export function junkValue(){ let g = 0; for(const k of Object.keys(C().bag)) if(ITEMS[k] && ITEMS[k].kind === "junk") g += ITEMS[k].sell * C().bag[k];
  for(const it of C().gear) if(isJunkGear(it)) g += gearSell(it); return g; }
export function sellJunk(){ const g = junkValue(); if(!g) return;
  for(const k of Object.keys(C().bag)) if(ITEMS[k] && ITEMS[k].kind === "junk") delete C().bag[k];
  C().gear = C().gear.filter(it => !isJunkGear(it));
  C().gold += g; H.log(`Sold junk for ${g} gold.`, "#d9e3e7"); H.save(); H.refresh(); }
export function sellGear(id){ const it = C().gear.find(x => x.id === id); if(!it) return; const p = gearSell(it);
  C().gear = C().gear.filter(x => x !== it); C().gold += p; H.log(`You sold ${it.n} for ${p} gold.`, "#d9e3e7"); H.save(); H.refresh(); }
// the smith's stock: one plain item for every slot, plus three better ones; the same for everyone of your class and level band
export function smithStock(npc){
  const top = npc && npc.maxIl === null ? C().level : (npc && npc.maxIl) || 6, il = Math.max(1, Math.min(top, Math.max(C().level, 3))), cls = C().cls, id = (npc && npc.id) || "brokk", r = mulberry(hashStr(id + cls + il)), out = [];
  for(const slot of SLOT_ORDER){ if(slot === "offhand" && !CLASS_OFF[cls].length) continue; out.push(makeGear({slot, cls, q: 1, il, r})); }
  for(let i = 0; i < 3; i++) out.push(makeGear({cls, q: 2, il, r}));
  out.forEach((it, i) => it.id = id + "_" + cls + il + "_" + i);
  return out;
}
export function buyGear(it){ const p = gearPrice(it); if(C().gold < p) return H.err("You don't have enough gold"); if(C().gear.length >= GEAR_MAX) return H.err("Your bag is full");
  C().gold -= p; G.gainGear({...it, st: {...it.st}, id: Math.random().toString(36).slice(2, 10)}, "You bought"); H.save(); }
export {trainCost, respecCost, gearPrice, gearSell};
export const QUESTS_LIST = () => QUESTS;
