// Rimfrost's game data, copied from Rimfrost 1 (races, classes, abilities, action bars, talents and the ability icons).
// Generated: positions inside the ability code use px/py (Rimfrost pixels), the engine converts to 3D units.
/* eslint-disable */
import {P, E, S, mobs} from "./state.js";
const pow = (...a) => E.pow(...a);
const spow = (...a) => E.spow(...a);
const hpow = () => (E.pow() + E.spow()) / 2;       // paladins: holy strikes grow with both Strength (attack power) and Intellect (spell power)
const hit = (...a) => E.hit(...a);
const proj = (...a) => E.proj(...a);
const slash = (...a) => E.slash(...a);
const burst = (...a) => E.burst(...a);
const ring = (...a) => E.ring(...a);
const dot = (...a) => E.dot(...a);
const aoe = (...a) => E.aoe(...a);
const healP = (...a) => E.healP(...a);
const buff = (...a) => E.buff(...a);
const stun = (...a) => E.stun(...a);
const slow = (...a) => E.slow(...a);
const zone = (...a) => E.zone(...a);
const tmul = (...a) => E.tmul(...a);
const setForm = (...a) => E.setForm(...a);
const root = (...a) => E.root(...a);
const fear = (...a) => E.fear(...a), polymorph = (...a) => E.polymorph(...a);
const hot = (...a) => E.hot(...a);
const addCP = (...a) => E.addCP(...a);
const addRes = (...a) => E.addRes(...a);
const shieldP = (...a) => E.shieldP(...a);
const pdist = (...a) => E.pdist(...a);
const fmt = (...a) => E.fmt(...a);
const T = (...a) => E.T(...a);
const curse = (...a) => E.curse(...a), totem = (...a) => E.totem(...a), finisher = (...a) => E.finisher(...a), drain = (...a) => E.drain(...a);
const coopGroupFx = (...a) => E.coopGroupFx(...a);
const petCallCheck = (...a) => E.petCallCheck(...a), petCall = (...a) => E.petCall(...a), petMend = (...a) => E.petMend(...a), petDismiss = (...a) => E.petDismiss(...a), petFight = (...a) => E.petFight(...a), PET_CAST = 10;
const MAX_LVL = 40;
export const HUNTER_MIN = 138;      // bows need at least 6 m to the target (in Rimfrost pixels; 23 px = 1 m)
export const RACES = {
  human:{name:"Human", skin:"#e2b48e", desc:"Experience gained increased by 5%. Racial ability: Sprint.", hair:"#5b3a22"},
  orc:{name:"Orc", skin:"#6f9a4a", desc:"Damage dealt increased by 3%. Racial ability: Bloodrage.", hair:"#1e1e1e"},
  elf:{name:"Elf", skin:"#efd8c8", desc:"Chance to dodge increased by 3%. Racial ability: Shadowmeld.", hair:"#e7dca0"},
  dwarf:{name:"Dwarf", skin:"#d9a07c", desc:"Maximum health increased by 8%. Racial ability: Stoneform.", hair:"#a2462a"},
  undead:{name:"Undead", skin:"#b8c4a8", desc:"Health and mana regeneration out of combat increased by 50%. Racial ability: Will of the Dead.", hair:"#3a3a3a"}
};

// each race's racial ability (an ability id in AB)
export const RACIAL = {human:"sprint", orc:"bloodrage", elf:"meld", dwarf:"stoneform", undead:"willdead"};
// which classes each race may choose
export const RACE_CLASSES = {
  human:["mage","warrior","priest","druid","warlock","rogue"],
  orc:["warrior","hunter","mage","warlock","rogue","shaman"],
  elf:["mage","warrior","hunter","priest","druid","rogue"],
  dwarf:["warrior","hunter","paladin","rogue","shaman"],
  undead:["mage","warrior","priest","paladin","warlock","rogue"]
};
export const CLASSES = {
  mage:{name:"Mage", color:"#4a7be0", res:"mana", hp:0.9, armor:1},
  warrior:{name:"Warrior", color:"#b0763a", res:"rage", hp:1.25, armor:0.80},
  hunter:{name:"Hunter", color:"#5f8f3e", res:"focus", hp:1.05, armor:0.92},
  priest:{name:"Priest", color:"#ecebe2", res:"mana", hp:0.95, armor:1},
  druid:{name:"Druid", color:"#b8742f", res:"mana", hp:1.05, armor:0.95},
  paladin:{name:"Paladin", color:"#e0c050", res:"mana", hp:1.15, armor:0.88},
  warlock:{name:"Warlock", color:"#8a5ad0", res:"mana", hp:0.95, armor:1},
  rogue:{name:"Rogue", color:"#e8d84a", res:"energy", hp:1.05, armor:0.92},
  shaman:{name:"Shaman", color:"#3a7ad8", res:"mana", hp:1.1, armor:0.9}
};
// Balance: damage multiplier per class (applies to direct hits and damage-over-time). 1 = unchanged. Tune these after running the dev balance test.
// Balance: PLAYER_DMG scales ALL player damage (every class). MANA_COST_MULT scales every mana cost, so you can cast more before running dry.
export const PLAYER_DMG = 0.8, MANA_COST_MULT = 0.45;
export const CLASS_DMG = {mage:1.0, warrior:0.95, hunter:0.9, priest:0.9, druid:0.95, paladin:0.85, warlock:1.05, rogue:0.9, shaman:1.2};
export const RES_COLOR = {mana:"var(--mana)", rage:"var(--rage)", focus:"var(--focus)", energy:"var(--energy)"};
export const RES_NAME = {mana:"Mana", rage:"Rage", focus:"Focus", energy:"Energy"};
export const SCHOOL_COLOR = {fire:"#ff8a3a", frost:"#8fd8ff", arcane:"#d38cff", nature:"#7fdc5a", holy:"#ffe37a", shadow:"#a77bff", phys:"#f2f2f2"};

// Abilities. run(t) fires when the cast finishes. Helpers (pow, hit, proj, dot...) live in the engine.

export const AB = {
  // ---- Racial abilities: every character of that race has one from level 1 (no cost, no global cooldown)
  sprint:{name:"Sprint", racial:"human", lvl:1, cost:0, cd:120, range:0, school:"phys", icon:"boot", tgt:"self", offGcd:true,
    desc:()=>`Increases movement speed by 40%. Lasts 8 sec.`,
    run:()=>{buff("sprint",8);ring(P.px,P.py,55,"#9fe8ff");burst(P.px,P.py,"#cff4ff",14);}},
  bloodrage:{name:"Bloodrage", racial:"orc", lvl:1, cost:0, cd:120, range:0, school:"phys", icon:"flame", tgt:"self", offGcd:true,
    desc:()=>`Increases damage dealt by 20%. Lasts 8 sec.`,
    run:()=>{buff("bloodrage",8);ring(P.px,P.py,60,"#ff3a2a");burst(P.px,P.py,"#ff5a3a",18);}},
  meld:{name:"Shadowmeld", racial:"elf", lvl:1, cost:0, cd:120, range:0, school:"shadow", icon:"moon", tgt:"self", offGcd:true,
    desc:()=>`Enemies lose track of you and you leave combat. Lasts up to 60 sec. Moving or acting cancels the effect.`,
    run:()=>{P.buffs.meld=60;P.auto=false;P.combatT=0;ring(P.px,P.py,45,"#8a6ab8");burst(P.px,P.py,"#3a2a5a",22);}},
  stoneform:{name:"Stoneform", racial:"dwarf", lvl:1, cost:0, cd:120, range:0, school:"phys", icon:"shield", tgt:"self", offGcd:true,
    desc:()=>`Reduces damage taken by 20%. Lasts 8 sec.`,
    run:()=>{buff("stoneform",8);ring(P.px,P.py,50,"#a8a294");burst(P.px,P.py,"#8a8478",16);}},
  willdead:{name:"Will of the Dead", racial:"undead", whileDead:true, lvl:1, cost:0, cd:1800, range:0, school:"shadow", icon:"skull", tgt:"self", offGcd:true,
    desc:()=>`Returns you to life at your corpse with 30% of your health, without Resurrection Sickness. Usable only while dead.`,
    check:()=>P.dead ? true : "Can only be used while dead",
    run:()=>E.willOfTheDead()},
  // ---- Mage
  fireball:{name:"Fireball", lvl:1, cost:22, cast:2.0, range:300, school:"fire", icon:"orb", tgt:"enemy",
    desc:()=>`Hurls a fiery ball that deals ${fmt(spow()*2.2)} Fire damage.`,
    run:t=>proj(t,"#ff8a3a",7,()=>hit(t,spow()*2.2,"fire","fireball"))},
  frostbolt:{name:"Ice Lance", lvl:2, cost:18, cast:1.7, range:300, school:"frost", icon:"shard", tgt:"enemy",
    desc:()=>`Launches a lance of ice that deals ${fmt(spow()*1.7)} Frost damage and slows the target by 50% for 5 sec.`,
    run:t=>proj(t,"#8fd8ff",6,()=>{hit(t,spow()*1.7,"frost","frostbolt");slow(t,0.5,5);})},
  fireblast:{name:"Ember Blast", lvl:4, cost:20, cd:8, range:220, school:"fire", icon:"burst", tgt:"enemy",
    desc:()=>`Blasts the target for ${fmt(spow()*1.5)} Fire damage.`,
    run:t=>{burst(t.px,t.py,"#ff8a3a",14);hit(t,spow()*1.5,"fire","fireblast");}},
  frostnova:{name:"Frost Ring", lvl:6, cost:25, cd:25, range:0, school:"frost", icon:"nova", tgt:"self",
    desc:()=>`Freezes enemies within 4 m in place for 8 sec and deals ${fmt(spow()*0.5)} Frost damage.`,
    run:()=>{ring(P.px,P.py,100,"#bfe9ff");aoe(P.px,P.py,100,m=>{hit(m,spow()*0.5,"frost","frostnova");root(m,8,true);});}},
  polymorph:{name:"Polymorph", lvl:8, cost:30, cast:1.5, range:300, school:"arcane", icon:"sheep", tgt:"enemy",
    desc:()=>`Transforms the enemy into a sheep for 1 min. A sheep cannot attack and regenerates health quickly. Any damage breaks the effect. Only one target can be polymorphed at a time.`,
    run:t=>{burst(t.px,t.py,"#e8d8ff",14);polymorph(t,60);}},
  blizzard:{name:"Blizzard", lvl:10, cost:45, cd:12, range:300, school:"frost", icon:"storm", tgt:"ground", aoeR:90,
    desc:()=>`Calls down a blizzard at the target area for 4 sec, dealing ${fmt(spow()*0.7)} Frost damage per second and slowing enemies.`,
    run:t=>zone(t.px,t.py,90,4,spow()*0.7,"frost","blizzard",true)},
  pyroblast:{name:"Sunflare", lvl:14, cost:50, cd:10, cast:3.5, range:300, school:"fire", icon:"meteor", tgt:"enemy",
    desc:()=>`Hurls an immense fiery boulder that deals ${fmt(spow()*4.2)} Fire damage and an additional ${fmt(spow()*1.0)} over 8 sec.`,
    run:t=>proj(t,"#ffb347",11,()=>{hit(t,spow()*4.2,"fire","pyroblast");dot(t,"pyro",spow()*1.0,8,"fire");})},
  sparkrain:{name:"Spark Rain", lvl:18, cost:35, cd:6, range:300, school:"arcane", icon:"spark", tgt:"enemy",
    desc:()=>`Fires three arcane sparks, each dealing ${fmt(spow()*0.9)} Arcane damage.`,
    run:t=>{[560,480,400].forEach(sp=>proj(t,"#d38cff",5,()=>hit(t,spow()*0.9,"arcane","sparkrain"),"orb",sp));}},
  icearmor:{name:"Ice Armor", lvl:22, cost:40, cd:30, range:0, school:"frost", icon:"shield", tgt:"self",
    desc:()=>`Encases you in ice that absorbs ${fmt(P.maxHp*0.35)} damage. Lasts 20 sec.`,
    run:()=>{P.shield=P.maxHp*0.35;P.shieldT=20;ring(P.px,P.py,30,"#bfe9ff");}},
  meteor:{name:"Meteor Fall", lvl:26, cost:60, cd:20, cast:2.5, range:300, school:"fire", icon:"meteor", tgt:"ground", aoeR:90,
    desc:()=>`Calls down a meteor that deals ${fmt(spow()*4.0)} Fire damage to enemies within 4 m of the chosen spot.`,
    run:t=>{const x=t.px,y=t.py;ring(x,y,90,"#ff8a3a");burst(x,y,"#ffb347",30);aoe(x,y,90,m=>hit(m,spow()*4.0,"fire","meteor"));}},

  // ---- Warrior
  heroic:{name:"Mighty Strike", lvl:1, cost:15, range:52, school:"phys", icon:"sword", tgt:"enemy",
    desc:()=>`A strong attack that deals ${fmt(pow()*1.7)} damage.`,
    run:t=>{slash(t);hit(t,pow()*1.7,"phys","heroic");}},
  charge:{name:"Charge", lvl:2, cost:0, cd:12, range:260, minRange:60, school:"phys", icon:"dash", tgt:"enemy", offGcd:true,
    desc:()=>`Charges an enemy, stunning it for 1 sec. Generates ${15+10*T("impCharge")} rage.`,
    run:t=>{P.dash={t, speed:900}; addRes("rage",15+10*T("impCharge"));}},
  shout:{name:"War Cry", lvl:4, cost:10, cd:5, range:0, school:"phys", icon:"horn", tgt:"self",
    desc:()=>`Increases damage dealt by you and nearby allies by 15%. Lasts 60 sec.`,
    run:()=>{buff("shout",60);ring(P.px,P.py,60,"#ffd36b");coopGroupFx(300,[["buff","shout",60]],"War Cry");}},
  rend:{name:"Rend", lvl:6, cost:10, range:52, school:"phys", icon:"claw", tgt:"enemy",
    desc:()=>`Wounds the target, causing ${fmt(pow()*2.0)} bleed damage over 9 sec.`,
    run:t=>{slash(t);dot(t,"rend",pow()*2.0,9,"phys");}},
  whirlwind:{name:"Whirlwind", lvl:10, cost:25, cd:8, range:0, school:"phys", icon:"whirl", tgt:"self",
    desc:()=>`Strikes all enemies within 4 m for ${fmt(pow()*1.3)} damage.`,
    run:()=>{ring(P.px,P.py,85,"#ffffff");aoe(P.px,P.py,85,m=>hit(m,pow()*1.3,"phys","whirlwind"));}},
  execute:{name:"Stroke of Mercy", lvl:14, cost:20, range:52, school:"phys", icon:"axe", tgt:"enemy",
    check:t=>t.hp/t.maxHp<0.25||!!P.buffs.sudden||"The target must be below 25% health",
    desc:()=>`Attempts to finish off a wounded enemy, dealing ${fmt(pow()*4.5)} damage. Only usable on enemies below 25% health.`,
    run:t=>{slash(t);if(t.hp/t.maxHp>=0.25)delete P.buffs.sudden;hit(t,pow()*4.5,"phys","execute");}},
  shieldbash:{name:"Shield Bash", lvl:18, cost:15, cd:15, range:52, school:"phys", icon:"fist", tgt:"enemy",
    desc:()=>`Bashes the target with your shield for ${fmt(pow()*1.0)} damage and stuns it for 2 sec.`,
    run:t=>{slash(t);hit(t,pow()*1.0,"phys","shieldbash");stun(t,2);}},
  secondwind:{name:"Second Wind", lvl:22, cost:0, cd:60, range:0, school:"phys", icon:"cross", tgt:"self", offGcd:true,
    desc:()=>`Instantly restores ${fmt(P.maxHp*0.3)} health.`,
    run:()=>{healP(P.maxHp*0.3);burst(P.px,P.py,"#ffd36b",12);}},
  quake:{name:"Earthquake", lvl:26, cost:30, cd:15, range:0, school:"phys", icon:"quake", tgt:"self",
    desc:()=>`Strikes the ground, dealing ${fmt(pow()*2.0)} damage to enemies within 4 m and slowing them.`,
    run:()=>{ring(P.px,P.py,100,"#c8a070");aoe(P.px,P.py,100,m=>{hit(m,pow()*2.0,"phys","quake");slow(m,0.5,4);});}},

  // ---- Hunter
  raptor:{name:"Raptor Strike", lvl:1, cost:15, cd:6, range:70, school:"phys", icon:"axe", tgt:"enemy",
    desc:()=>`A quick melee strike that deals ${fmt(pow()*1.3)} damage.`,
    run:t=>{ hit(t,pow()*1.3,"phys","raptor"); }},
  wingclip:{name:"Wing Clip", lvl:3, cost:10, cd:12, range:70, school:"phys", icon:"boot", tgt:"enemy",
    desc:()=>`Deals ${fmt(pow()*0.8)} damage and slows the target by 60% for 8 sec.`,
    run:t=>{ hit(t,pow()*0.8,"phys","wingclip"); slow(t,0.6,8); }},
  steady:{name:"Steady Shot", lvl:1, cost:0, cast:1.5, minRange:HUNTER_MIN, range:320, school:"phys", icon:"arrow", tgt:"enemy",
    desc:()=>`A steady shot that deals ${fmt(pow()*1.3)} damage and generates 12 focus.`,
    run:t=>{ addRes("focus", 12); proj(t,"#e9e2c8",4,()=>hit(t,pow()*1.3,"phys","steady"),"arrow"); }},
  firearrow:{name:"Fire Arrow", lvl:2, cost:30, cd:6, minRange:HUNTER_MIN, range:320, school:"fire", icon:"firearrow", tgt:"enemy",
    desc:()=>`Fires a burning arrow that deals ${fmt(pow()*1.1)} Fire damage and an additional ${fmt(pow()*1.4)} over 6 sec.`,
    run:t=>proj(t,"#ff7a2e",5,()=>{hit(t,pow()*1.1,"fire","firearrow");dot(t,"burn",pow()*1.4*(1+0.15*T("fireArrows")),6,"fire");},"arrow")},
  icearrow:{name:"Cripple Shot", lvl:4, cost:20, cd:8, minRange:HUNTER_MIN, range:320, school:"phys", icon:"icearrow", tgt:"enemy",
    desc:()=>`Cripples the target, reducing its movement speed by ${50+5*T("iceArrows")}% for 8 sec.`,
    run:t=>proj(t,"#c8b48a",5,()=>{slow(t,0.5+0.05*T("iceArrows"),8);},"arrow")},
  disengage:{name:"Disengage", lvl:6, cost:0, cd:15, range:0, school:"phys", icon:"leap", tgt:"self", offGcd:true,
    desc:()=>`Leaps backwards, away from the direction you last moved.`,
    run:()=>{const m=P.lastMv;let dx,dy;if(m){dx=-m.px;dy=-m.py;}else{const t=P.target&&!P.target.dead?P.target:null;dx=t?P.px-t.px:-P.fx;dy=t?P.py-t.py:0;}const l=Math.hypot(dx,dy)||1;P.leap={vx:dx/l*520,vy:dy/l*520,t:0.32};}},
  multishot:{name:"Triple Shot", lvl:10, cost:40, cd:8, minRange:HUNTER_MIN, range:320, school:"phys", icon:"multi", tgt:"enemy",
    desc:()=>`Fires arrows at the target and up to two nearby enemies, each dealing ${fmt(pow()*1.2)} damage.`,
    run:t=>{const near=mobs.filter(m=>m!==t&&!m.dead&&pdist(m,t)<130).slice(0,2);[t,...near].forEach(m=>proj(m,"#e9e2c8",4,()=>hit(m,pow()*1.2,"phys","multishot"),"arrow"));}},
  aimed:{name:"Aimed Shot", lvl:14, cost:45, cd:10, cast:2.5, minRange:HUNTER_MIN, range:340, school:"phys", icon:"aim", tgt:"enemy",
    desc:()=>`A powerful aimed shot that deals ${fmt(pow()*4.0)} damage.`,
    run:t=>proj(t,"#fff3c4",6,()=>hit(t,pow()*4.0,"phys","aimed"),"arrow")},
  poison:{name:"Poison Arrow", lvl:18, cost:30, minRange:HUNTER_MIN, range:320, school:"nature", icon:"poison", tgt:"enemy",
    desc:()=>`Fires a poisoned arrow that deals ${fmt(pow()*2.6)} Nature damage over 12 sec.`,
    run:t=>proj(t,"#7fdc5a",5,()=>dot(t,"poison",pow()*2.6,12,"nature"),"arrow")},
  snare:{name:"Snare", lvl:22, cost:25, cd:20, minRange:HUNTER_MIN, range:320, school:"nature", icon:"roots", tgt:"enemy",
    desc:()=>`Roots the target in place for 6 sec.`,
    run:t=>{root(t,6);burst(t.px,t.py,"#c8a070",10);}},
  stormarrow:{name:"Storm Arrow", lvl:26, cost:50, cd:20, minRange:HUNTER_MIN, range:340, school:"nature", icon:"storm", tgt:"enemy",
    desc:()=>`Fires an arrow charged with lightning that deals ${fmt(pow()*5.0)} Nature damage.`,
    run:t=>proj(t,"#e8f4ff",7,()=>{hit(t,pow()*5.0,"nature","stormarrow");burst(t.px,t.py,"#e8f4ff",18);},"arrow")},

  // ---- Priest
  smite:{name:"Smite", lvl:1, cost:15, cast:1.5, range:280, school:"holy", icon:"sun", tgt:"enemy",
    desc:()=>`Smites the target for ${fmt(spow()*1.6)} Holy damage.`,
    run:t=>{burst(t.px,t.py,"#ffe37a",12);hit(t,spow()*1.6,"holy","smite");}},
  resurrection:{name:"Resurrection", lvl:10, cost:40, cast:10, range:0, school:"holy", icon:"halo", tgt:"self",
    desc:()=>`Returns a dead ally to life with 20% health and mana. Out of combat only.`,
    check:()=>E.rezCheck(), run:()=>{E.rezSend("Resurrection");burst(P.px,P.py,"#fff2b0",16);}},
  heal:{name:"Healing Light", lvl:2, cost:25, cast:2.0, range:0, school:"holy", icon:"cross", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.35*(1+0.1*T("impHeal")))}.`,
    run:()=>{healP(P.maxHp*0.35*(1+0.1*T("impHeal")));burst(P.px,P.py,"#ffe9a0",12);}},
  swp:{name:"Shadow Pain", lvl:4, cost:18, range:280, school:"shadow", icon:"skull", tgt:"enemy",
    desc:()=>`Inflicts ${fmt(spow()*2.6)} Shadow damage over 12 sec.`,
    run:t=>{burst(t.px,t.py,"#a77bff",8);dot(t,"swp",spow()*2.6*tmul("swp","shadow"),12,"shadow");}},
  pws:{name:"Barrier of Light", lvl:6, cost:25, cd:12, range:0, school:"holy", icon:"shield", tgt:"self",
    desc:()=>`Shields the target, absorbing ${fmt(P.maxHp*0.3*(1+0.15*T("impShield")))} damage. Lasts 20 sec.`,
    run:()=>{shieldP(P.maxHp*0.3*(1+0.15*T("impShield")),20);ring(P.px,P.py,30,"#fff6d0");}},
  mindblast:{name:"Soul Blast", lvl:10, cost:30, cd:7, cast:1.5, range:280, school:"shadow", icon:"mind", tgt:"enemy",
    desc:()=>`Blasts the target for ${fmt(spow()*2.8)} Shadow damage.`,
    run:t=>{burst(t.px,t.py,"#a77bff",14);hit(t,spow()*2.8,"shadow","mindblast");}},
  holynova:{name:"Holy Wave", lvl:14, cost:35, cd:6, range:0, school:"holy", icon:"nova", tgt:"self",
    desc:()=>`Deals ${fmt(spow()*1.1)} Holy damage to enemies within 5 m and heals you and nearby allies for ${fmt(P.maxHp*0.12)}.`,
    run:()=>{ring(P.px,P.py,110,"#ffe37a");aoe(P.px,P.py,110,m=>hit(m,spow()*1.1,"holy","holynova"));healP(P.maxHp*0.12*(1+0.1*T("impHeal")));coopGroupFx(110,[["healPct",0.12*(1+0.1*T("impHeal"))]],"Holy Wave");}},
  renew:{name:"Renewal", lvl:18, cost:25, range:0, school:"holy", icon:"bloom", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.4*(1+0.1*T("impHeal")))} over 12 sec.`,
    run:()=>{hot("renew",P.maxHp*0.4*(1+0.1*T("impHeal")),12);burst(P.px,P.py,"#ffe9a0",10);}},
  darkpulse:{name:"Dark Pulse", lvl:22, cost:35, cd:8, range:0, school:"shadow", icon:"nova", tgt:"self",
    desc:()=>`Deals ${fmt(spow()*1.5)} Shadow damage to enemies within 5 m.`,
    run:()=>{ring(P.px,P.py,110,"#a77bff");aoe(P.px,P.py,110,m=>hit(m,spow()*1.5,"shadow","darkpulse"));}},
  judgment:{name:"Divine Judgment", lvl:26, cost:45, cd:15, range:280, school:"holy", icon:"sun", tgt:"enemy",
    desc:()=>`Deals ${fmt(spow()*5.0)} Holy damage to the target.`,
    run:t=>{burst(t.px,t.py,"#fff2b0",26);hit(t,spow()*5.0,"holy","judgment");}},

  // ---- Druid caster
  wrath:{name:"Nature's Wrath", lvl:1, cost:15, cast:1.5, range:290, school:"nature", icon:"leaf", tgt:"enemy",
    desc:()=>`Deals ${fmt(spow()*1.5)} Nature damage to the target.`,
    run:t=>proj(t,"#7fdc5a",6,()=>hit(t,spow()*1.5,"nature","wrath"))},
  moonfire:{name:"Moonfire", lvl:2, cost:18, range:290, school:"arcane", icon:"moon", tgt:"enemy",
    desc:()=>`Burns the target for ${fmt(spow()*0.8)} Arcane damage and an additional ${fmt(spow()*1.4)} over 9 sec.`,
    run:t=>{burst(t.px,t.py,"#d38cff",10);hit(t,spow()*0.8,"arcane","moonfire");dot(t,"moonfire",spow()*1.4*tmul("moonfire","arcane"),9,"arcane");}},
  revive:{name:"Revive", lvl:10, cost:40, cast:10, range:0, school:"nature", icon:"halo", tgt:"self",
    desc:()=>`Returns a dead ally to life with 20% health and mana. Out of combat only.`,
    check:()=>E.rezCheck(), run:()=>{E.rezSend("Revive");burst(P.px,P.py,"#9cf07a",16);}},
  touch:{name:"Nature's Touch", lvl:1, cost:25, cast:2.5, range:0, school:"nature", icon:"cross", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.35*(1+0.1*T("impRejuv")))}.`,
    run:()=>{healP(P.maxHp*0.35*(1+0.1*T("impRejuv")));burst(P.px,P.py,"#9cf07a",12);}},
  rejuv:{name:"Lifebud", lvl:4, cost:22, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.35*(1+0.1*T("impRejuv")))} over 12 sec.`,
    run:()=>{hot("rejuv",P.maxHp*0.35*(1+0.1*T("impRejuv")),12);burst(P.px,P.py,"#9cf07a",10);}},
  roots:{name:"Entangling Roots", lvl:6, cost:20, cd:20, cast:1.2, range:290, school:"nature", icon:"roots", tgt:"enemy",
    desc:()=>`Roots the target in place for 8 sec and deals ${fmt(spow()*0.6)} Nature damage.`,
    run:t=>{root(t,8);dot(t,"roots",spow()*0.6,8,"nature");burst(t.px,t.py,"#6a9a3a",10);}},
  starfire:{name:"Starfall", lvl:12, cost:40, cast:3.0, range:300, school:"arcane", icon:"star", tgt:"enemy",
    desc:()=>`Calls down starlight that deals ${fmt(spow()*3.8)} Arcane damage.`,
    run:t=>{burst(t.px,t.py,"#e6b3ff",18);hit(t,spow()*3.8,"arcane","starfire");}},
  hurricane:{name:"Tempest", lvl:16, cost:50, cd:15, range:300, school:"nature", icon:"storm", tgt:"ground", aoeR:100,
    desc:()=>`Creates a storm at the target area for 5 sec, dealing ${fmt(spow()*0.6)} Nature damage per second and slowing enemies.`,
    run:t=>zone(t.px,t.py,100,5,spow()*0.6,"nature","hurricane",true)},
  bark:{name:"Barkskin", lvl:18, cost:20, cd:45, range:0, school:"nature", icon:"shield", tgt:"self", offGcd:true,
    desc:()=>`Reduces damage taken by 25%. Lasts 12 sec.`,
    run:()=>{buff("bark",12);ring(P.px,P.py,30,"#a07a4a");}},
  bloom:{name:"Lifebloom", lvl:22, cost:35, cd:20, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Instantly heals the target for ${fmt(P.maxHp*0.4*(1+0.1*T("impRejuv")))}.`,
    run:()=>{healP(P.maxHp*0.4*(1+0.1*T("impRejuv")));burst(P.px,P.py,"#9cf07a",16);}},
  // ---- Paladin
  palstrike:{name:"Holy Strike", lvl:1, cost:12, cd:8, range:52, school:"holy", icon:"sword", tgt:"enemy",
    desc:()=>`Strikes the target with holy power for ${fmt(hpow()*1.5)} Holy damage.`,
    run:t=>{slash(t);hit(t,hpow()*1.5,"holy","palstrike");}},
  redemption:{name:"Redemption", lvl:12, cost:40, cast:10, range:0, school:"holy", icon:"halo", tgt:"self",
    desc:()=>`Returns a dead ally to life with 20% health and mana. Out of combat only.`,
    check:()=>E.rezCheck(), run:()=>{E.rezSend("Redemption");burst(P.px,P.py,"#ffd890",16);}},
  palheal:{name:"Light's Mending", lvl:2, cost:25, cast:2.5, range:0, school:"holy", icon:"cross", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.4*(1+0.1*T("palHeal")))}.`,
    run:()=>{healP(P.maxHp*0.4*(1+0.1*T("palHeal")));burst(P.px,P.py,"#ffe9a0",14);}},
  hammer:{name:"Hammer of Judgment", lvl:4, cost:20, cd:15, range:220, school:"holy", icon:"fist", tgt:"enemy",
    desc:()=>`Hurls a hammer that deals ${fmt(hpow()*1.2)} Holy damage and stuns the target for 2 sec.`,
    run:t=>proj(t,"#ffe37a",7,()=>{hit(t,hpow()*1.2,"holy","hammer");stun(t,2);})},
  holyshield:{name:"Holy Shield", lvl:6, cost:25, cd:20, range:0, school:"holy", icon:"shield", tgt:"self",
    desc:()=>`Your shield absorbs ${fmt(P.maxHp*0.25)} damage. Lasts 15 sec.`,
    run:()=>{P.shield=P.maxHp*0.25;P.shieldT=15;ring(P.px,P.py,30,"#ffe37a");}},
  crusader:{name:"Crusader Strike", lvl:10, cost:20, cd:6, range:52, school:"holy", icon:"axe", tgt:"enemy",
    desc:()=>`An instant strike that deals ${fmt(hpow()*2.2)} Holy damage.`,
    run:t=>{slash(t);hit(t,hpow()*2.2,"holy","crusader");}},
  consecrate:{name:"Hallowed Ground", lvl:14, cost:35, cd:12, range:0, school:"holy", icon:"nova", tgt:"self",
    desc:()=>`Consecrates the ground for 6 sec, dealing ${fmt(hpow()*0.6)} Holy damage per second to enemies within 4 m.`,
    run:()=>{zone(P.px,P.py,90,6,hpow()*0.6,"holy","consecrate",false);ring(P.px,P.py,90,"#ffe37a");}},
  avenging:{name:"Righteous Wrath", lvl:18, cost:0, cd:60, range:0, school:"holy", icon:"horn", tgt:"self", offGcd:true,
    desc:()=>`Increases all damage dealt by 20%. Lasts 15 sec.`,
    run:()=>{buff("avenging",15);ring(P.px,P.py,60,"#ffd36b");}},
  bubble:{name:"Divine Shield", lvl:22, cost:30, cd:120, range:0, school:"holy", icon:"shield", tgt:"self", offGcd:true,
    desc:()=>`Makes you immune to all damage for 6 sec.`,
    run:()=>{buff("bubble",6);ring(P.px,P.py,40,"#fff2b0");}},
  judge:{name:"Heavenly Judgment", lvl:26, cost:40, cd:15, range:220, school:"holy", icon:"sun", tgt:"enemy",
    desc:()=>`Deals ${fmt(hpow()*4.5)} Holy damage to the target.`,
    run:t=>{burst(t.px,t.py,"#fff2b0",24);hit(t,hpow()*4.5,"holy","judge");}},
  bear:{name:"Bear Form", lvl:10, cost:0, range:0, school:"nature", icon:"bear", tgt:"self", offGcd:true, form:true,
    desc:()=>`Shapeshift into a bear. Increases health by 60%, reduces damage taken and uses rage.`,
    run:()=>setForm(P.form==="bear"?null:"bear")},
  cat:{name:"Wolf Form", lvl:15, cost:0, range:0, school:"nature", icon:"cat", tgt:"self", offGcd:true, form:true,
    desc:()=>`Shapeshift into a wolf. Increases movement speed by 30% and uses energy.`,
    run:()=>setForm(P.form==="cat"?null:"cat")},
  leopard:{name:"Travel Form", lvl:20, cost:0, range:0, school:"nature", icon:"dash", tgt:"self", offGcd:true, form:true,
    desc:()=>`Shapeshift into travel form. Increases movement speed by 60%. Cannot attack or cast spells.`,
    run:()=>setForm(P.form==="leopard"?null:"leopard")},
  // bear
  maul:{name:"Maul", lvl:10, cost:15, res:"rage", range:55, school:"phys", icon:"claw", tgt:"enemy",
    desc:()=>`A heavy attack that deals ${fmt(pow()*1.8)} damage.`, run:t=>{slash(t);hit(t,pow()*1.8,"phys","maul");}},
  swipe:{name:"Swipe", lvl:10, cost:20, res:"rage", range:0, school:"phys", icon:"whirl", tgt:"self",
    desc:()=>`Swipes enemies within 3 m for ${fmt(pow()*1.0)} damage.`,
    run:()=>{ring(P.px,P.py,80,"#d9b48a");aoe(P.px,P.py,80,m=>hit(m,pow()*1.0,"phys","swipe"));}},
  frenzy:{name:"Frenzied Regeneration", lvl:12, cost:50, res:"rage", cd:30, range:0, school:"nature", icon:"bloom", tgt:"self",
    check:()=>P.hp/P.maxHp <= 0.3 || "Requires 30% health or lower",
    desc:()=>`Heals you for ${fmt(P.maxHp*0.5*(1+0.1*T("impRejuv")))} over 6 sec. Only usable below 30% health.`, run:()=>hot("frenzy",P.maxHp*0.5*(1+0.1*T("impRejuv")),6)},
  bash:{name:"Bash", lvl:14, cost:10, res:"rage", cd:20, range:55, school:"phys", icon:"fist", tgt:"enemy",
    desc:()=>`Stuns the target for 3 sec and deals ${fmt(pow()*0.5)} damage.`, run:t=>{slash(t);hit(t,pow()*0.5,"phys","bash");stun(t,3);}},
  roar:{name:"Terrifying Roar", lvl:20, cost:15, res:"rage", cd:30, range:0, school:"phys", icon:"horn", tgt:"self",
    desc:()=>`Stuns enemies within 4 m for 2 sec.`, run:()=>{ring(P.px,P.py,90,"#c89a68");aoe(P.px,P.py,90,m=>stun(m,2));}},
  // cat
  claw:{name:"Claw", lvl:15, cost:40, res:"energy", range:52, school:"phys", icon:"claw", tgt:"enemy",
    desc:()=>`Claws the target for ${fmt(pow()*1.6)} damage. Awards 1 combo point.`, run:t=>{slash(t);hit(t,pow()*1.6,"phys","claw");addCP();}},
  rake:{name:"Rake", lvl:16, cost:35, res:"energy", range:52, school:"phys", icon:"claw", tgt:"enemy",
    desc:()=>`Deals ${fmt(pow()*0.5)} damage and an additional ${fmt(pow()*1.6)} bleed damage over 9 sec. Awards 1 combo point.`,
    run:t=>{slash(t);hit(t,pow()*0.5,"phys","rake");dot(t,"rake",pow()*1.6*tmul("rake","phys"),9,"phys");addCP();}},
  bite:{name:"Death Bite", lvl:17, cost:35, res:"energy", range:52, school:"phys", icon:"fang", tgt:"enemy",
    check:()=>P.cp>0||"You need combo points",
    desc:()=>`Finishing move that deals ${fmt(pow()*1.0)} damage plus ${fmt(pow()*0.9)} per combo point.`,
    run:t=>{slash(t);hit(t,pow()*(1+0.9*P.cp),"phys","bite");P.cp=0;}},
  dash:{name:"Dash", lvl:18, cost:0, res:"energy", cd:30, range:0, school:"phys", icon:"leap", tgt:"self", offGcd:true,
    desc:()=>`Increases movement speed by 70% for 5 sec.`, run:()=>buff("dash",5)},
  pounce:{name:"Ambush", lvl:20, cost:60, res:"energy", cd:12, range:52, school:"phys", icon:"fang", tgt:"enemy",
    desc:()=>`Ambushes the target for ${fmt(pow()*3.0)} damage. Awards 1 combo point.`, run:t=>{slash(t);hit(t,pow()*3.0,"phys","pounce");addCP();}}
};

// Hunter pets: one at a time. Call Bear (tank) / Call Wolf (damage) take PET_CAST seconds and only work out of combat.
Object.assign(AB, {
  callbear:{name:"Call Bear", lvl:5, cost:0, cast:10, range:0, school:"nature", icon:"bear", tgt:"self",
    desc:()=>`Summons a bear companion that holds the attention of enemies. Out of combat only.`,
    check:()=>petCallCheck("bear"), run:()=>petCall("bear")},
  dismisspet:{name:"Dismiss Pet", lvl:5, cost:0, cast:5, free:true, needs:"callbear", range:0, school:"nature", icon:"dismiss", tgt:"self",
    desc:()=>`Dismisses your pet. Out of combat only.`,
    check:()=>!E.pet ? "You have no pet" : petFight() ? "You cannot dismiss your pet in combat" : true, run:()=>petDismiss()},
  mendpet:{name:"Mend Pet", lvl:7, cost:20, channel:10, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Heals your pet for 4% of its health every second for 10 sec. You must stand still while channeling.`,
    check:()=>(E.pet && !E.pet.dead) ? true : "You have no pet", tick:()=>E.petHealTick(0.04)},
  icebarrier:{name:"Ice Barrier", lvl:10, talent:"m_barrier", cost:30, cd:60, range:0, school:"frost", icon:"crystal", tgt:"self",
    desc:()=>`Surrounds you with a barrier of ice that absorbs ${fmt(P.maxHp*0.25+spow()*1.5)} damage. Lasts 1 min.`,
    run:()=>{P.shield=Math.max(P.shield||0,P.maxHp*0.25+spow()*1.5);P.shieldT=60;ring(P.px,P.py,40,"#bfe9ff");burst(P.px,P.py,"#dff6ff",16);}},
  intimidate:{name:"Intimidation", lvl:10, talent:"h_intim", cost:10, cd:30, range:0, school:"phys", icon:"roar", tgt:"self", offGcd:true,
    desc:()=>`Your pet stuns its target for 3 sec.`,
    check:()=>E.petIntimidateCheck(), run:()=>E.petIntimidate()},
  bestialwrath:{name:"Bestial Wrath", lvl:10, talent:"h_bestial", cost:0, cd:60, range:0, school:"phys", icon:"fang", tgt:"self", offGcd:true,
    desc:()=>`Your pet deals 50% more damage and attacks 30% faster. Lasts 10 sec.`,
    check:()=>(E.pet && !E.pet.dead) ? true : "You have no pet", run:()=>E.petWrath()},
  callwolf:{name:"Call Wolf", lvl:10, cost:0, cast:10, range:0, school:"nature", icon:"cat", tgt:"self",
    desc:()=>`Summons a wolf companion that deals damage to your enemies. Out of combat only.`,
    check:()=>petCallCheck("wolf"), run:()=>petCall("wolf")}
});

// ---- Warlock: curses and damage over time, Shadow and Fire magic, and a demon at your side (the Imp, later the Voidwalker)
Object.assign(AB, {
  shadowbolt:{name:"Shadow Bolt", lvl:1, cost:18, cast:2.0, range:300, school:"shadow", icon:"orb", tgt:"enemy",
    desc:()=>`Sends a bolt of shadow at the target, dealing ${fmt(spow()*2.1)} Shadow damage.`,
    run:t=>proj(t,"#a77bff",7,()=>hit(t,spow()*2.1,"shadow","shadowbolt"))},
  summonimp:{name:"Summon Imp", lvl:1, cost:0, cast:6, range:0, school:"fire", icon:"imp", tgt:"self",
    desc:()=>`Summons an Imp that hurls Firebolts at your enemies. Out of combat only.`,
    check:()=>petCallCheck("imp"), run:()=>petCall("imp")},
  immolate:{name:"Immolate", lvl:2, cost:22, cast:1.5, range:300, school:"fire", icon:"flame", tgt:"enemy",
    desc:()=>`Burns the target for ${fmt(spow()*0.9)} Fire damage and an additional ${fmt(spow()*1.6)} over 12 sec.`,
    run:t=>{burst(t.px,t.py,"#ff7a2a",12);hit(t,spow()*0.9,"fire","immolate");dot(t,"immolate",spow()*1.6*tmul("immolate","fire"),12,"fire");}},
  corruption:{name:"Corruption", lvl:4, cost:18, range:300, school:"shadow", icon:"drop", tgt:"enemy",
    desc:()=>`Corrupts the target, causing ${fmt(spow()*2.4)} Shadow damage over 15 sec.`,
    run:t=>{burst(t.px,t.py,"#7a4ad0",8);dot(t,"corruption",spow()*2.4*tmul("corruption","shadow"),15,"shadow");}},
  fear:{name:"Fear", lvl:8, cost:25, cd:25, cast:1.5, range:290, school:"shadow", icon:"fear", tgt:"enemy",
    desc:()=>`Strikes fear into the enemy, causing it to run away in terror for 8 sec.`,
    run:t=>{burst(t.px,t.py,"#7a4ad0",12);fear(t,8);}},
  agony:{name:"Curse of Agony", lvl:6, cost:18, range:300, school:"shadow", icon:"skull", tgt:"enemy",
    desc:()=>`Curses the target with agony, causing ${fmt(spow()*2.8)} Shadow damage over 21 sec. Only one curse per target.`,
    run:t=>{burst(t.px,t.py,"#8a5ad0",8);curse(t,"agony");dot(t,"agony",spow()*2.8*tmul("agony","shadow"),21,"shadow");}},
  lifetap:{name:"Life Tap", lvl:8, cost:0, range:0, school:"shadow", icon:"heart", tgt:"self",
    check:()=>P.hp/P.maxHp > 0.2 || "Not enough health",
    desc:()=>`Converts ${fmt(P.maxHp*0.15)} health into ${fmt(P.maxHp*0.15*1.5*(1+0.1*T("wl_tap")))} mana.`,
    run:()=>{const h=P.maxHp*0.15;P.hp=Math.max(1,P.hp-h);addRes("mana",h*1.5*(1+0.1*T("wl_tap")));burst(P.px,P.py,"#8a5ad0",10);}},
  drainlife:{name:"Drain Life", lvl:10, cost:28, channel:8, range:300, school:"shadow", icon:"drop", tgt:"enemy",
    desc:()=>`Drains ${fmt(spow()*0.4)} health from the target every second for 8 sec and heals you for the damage dealt. You must stand still while channeling.`,
    tick:t=>{burst(t.px,t.py,"#5ad06a",6);drain(t,spow()*0.4,"drainlife",1+0.2*T("wl_drain"));}},
  summonvoid:{name:"Summon Voidwalker", lvl:10, cost:0, cast:6, range:0, school:"shadow", icon:"void", tgt:"self",
    desc:()=>`Summons a Voidwalker that holds the attention of enemies. Out of combat only.`,
    check:()=>petCallCheck("voidwalker"), run:()=>petCall("voidwalker")},
  dismissdemon:{name:"Dismiss Demon", lvl:1, cost:0, cast:3, needs:"summonimp", range:0, school:"shadow", icon:"dismiss", tgt:"self",
    desc:()=>`Dismisses your demon. Out of combat only.`,
    check:()=>!E.pet ? "You have no demon" : petFight() ? "You cannot dismiss your demon in combat" : true, run:()=>petDismiss()},
  healthfunnel:{name:"Health Funnel", lvl:12, cost:0, channel:10, range:0, school:"shadow", icon:"heart", tgt:"self",
    check:()=>(E.pet && !E.pet.dead) ? (P.hp/P.maxHp > 0.2 || "Not enough health") : "You have no demon",
    desc:()=>`Gives ${fmt(P.maxHp*0.015)} of your health to your demon every second for 10 sec, healing it for 4% of its maximum health each second. You must stand still while channeling.`,
    tick:()=>{if(P.hp/P.maxHp<=0.05)return false;P.hp=Math.max(1,P.hp-P.maxHp*0.015);return E.petHealTick(0.04);}},
  weakness:{name:"Curse of Weakness", lvl:14, cost:15, range:300, school:"shadow", icon:"skull", tgt:"enemy",
    desc:()=>`Curses the target, reducing the damage it deals by 20% for 2 min. Only one curse per target.`,
    run:t=>{burst(t.px,t.py,"#6a6a7a",8);curse(t,"weak");}},
  rainfire:{name:"Rain of Fire", lvl:18, cost:45, cd:12, range:300, school:"fire", icon:"meteor", tgt:"ground", aoeR:95,
    desc:()=>`Calls down fire on the target area for 6 sec, dealing ${fmt(spow()*0.65)} Fire damage per second.`,
    run:t=>zone(t.px,t.py,95,6,spow()*0.65,"fire","rainfire",T("wl_after")?0.25*T("wl_after"):false)},
  soulfire:{name:"Soul Fire", lvl:22, cost:55, cd:20, cast:4.0, range:300, school:"fire", icon:"flame", tgt:"enemy",
    desc:()=>`Burns the target's soul for ${fmt(spow()*5.0)} Fire damage.`,
    run:t=>proj(t,"#ff4a1a",10,()=>hit(t,spow()*5.0,"fire","soulfire"))},
  deathcoil:{name:"Death Coil", lvl:26, cost:35, cd:30, range:280, school:"shadow", icon:"skull", tgt:"enemy",
    desc:()=>`Deals ${fmt(spow()*2.5)} Shadow damage, heals you for the damage dealt and stuns the target for 3 sec.`,
    run:t=>proj(t,"#5a3a8a",8,()=>{drain(t,spow()*2.5,"deathcoil",1);stun(t,3);})},
  unstable:{name:"Unstable Affliction", lvl:10, talent:"wl_unstable", cost:25, cast:1.5, range:300, school:"shadow", icon:"poison", tgt:"enemy",
    desc:()=>`Deals ${fmt(spow()*3.0)} Shadow damage over 15 sec. If the target dies while afflicted, the affliction spreads to the nearest enemy.`,
    run:t=>{burst(t.px,t.py,"#9a5ae0",12);dot(t,"unstable",spow()*3.0*tmul("unstable","shadow"),15,"shadow");}},
  shadowburn:{name:"Shadowburn", lvl:10, talent:"wl_burn", cost:20, cd:15, range:300, school:"shadow", icon:"burst", tgt:"enemy",
    desc:()=>`Instantly blasts the target for ${fmt(spow()*2.0)} Shadow damage. Deals double damage to enemies below 25% health.`,
    run:t=>{burst(t.px,t.py,"#7a4ad0",14);hit(t,spow()*2.0*(t.hp/t.maxHp<0.25?2:1),"shadow","shadowburn");}},
  conflagrate:{name:"Conflagrate", lvl:10, talent:"wl_conflag", cost:30, cd:10, range:300, school:"fire", icon:"nova", tgt:"enemy",
    check:t=>(t.dots||[]).some(d=>d.key==="immolate")||"The target must be burning with Immolate",
    desc:()=>`Deals ${fmt(spow()*3.5)} Fire damage to a target burning with your Immolate.`,
    run:t=>{burst(t.px,t.py,"#ff6a1a",16);hit(t,spow()*3.5,"fire","conflagrate");}},
  demonfrenzy:{name:"Demonic Frenzy", lvl:10, talent:"wl_frenzy", cost:0, cd:60, range:0, school:"shadow", icon:"fang", tgt:"self", offGcd:true,
    desc:()=>`Your demon deals 50% more damage and attacks 30% faster. Lasts 10 sec.`,
    check:()=>(E.pet && !E.pet.dead) ? true : "You have no demon", run:()=>E.petWrath()},

// ---- Rogue: two weapons, fast attacks, energy and combo points (as in Wolf Form)
  sinister:{name:"Sinister Strike", lvl:1, cost:40, res:"energy", range:52, school:"phys", icon:"sword", tgt:"enemy",
    desc:()=>`A vicious strike that deals ${fmt(pow()*1.4)} damage. Awards 1 combo point.`, run:t=>{slash(t);hit(t,pow()*1.4,"phys","sinister");addCP(t);}},
  eviscerate:{name:"Eviscerate", lvl:2, cost:35, res:"energy", range:52, school:"phys", icon:"fang", tgt:"enemy",
    check:()=>P.cp>0||"You need combo points",
    desc:()=>`Finishing move that deals ${fmt(pow()*0.8)} damage plus ${fmt(pow()*0.85)} per combo point.`,
    run:t=>{slash(t);const cp=finisher(t);hit(t,pow()*(0.8+0.85*cp)*tmul("eviscerate","phys"),"phys","eviscerate");}},
  stealth:{name:"Stealth", lvl:4, cost:0, res:"energy", cd:6, range:0, school:"phys", icon:"moon", tgt:"self", offGcd:true,
    check:()=>P.buffs.stealth ? true : P.combatT > 0 ? "You cannot do that in combat" : true,
    desc:()=>`Conceals you until cancelled. Movement speed reduced by 30%. Attacking or taking damage breaks Stealth.`,
    run:()=>{ if(P.buffs.stealth){ E.breakStealth(); return; } P.buffs.stealth=1e9; P.auto=false; burst(P.px,P.py,"#3a3a4a",14);}},
  gouge:{name:"Gouge", lvl:6, cost:45, res:"energy", cd:10, range:52, school:"phys", icon:"fist", tgt:"enemy",
    desc:()=>`Deals ${fmt(pow()*0.6)} damage and stuns the target for 4 sec. Awards 1 combo point.`, run:t=>{slash(t);hit(t,pow()*0.6,"phys","gouge");stun(t,4);addCP(t);}},
  backstab:{name:"Backstab", lvl:8, cost:60, res:"energy", range:52, school:"phys", icon:"dagger", tgt:"enemy",
    desc:()=>`Stabs the target for ${fmt(pow()*2.6)} damage. Awards 1 combo point.`, run:t=>{slash(t);hit(t,pow()*2.6*tmul("backstab","phys"),"phys","backstab");addCP(t);}},
  slicedice:{name:"Slice and Dice", lvl:10, cost:25, res:"energy", range:52, school:"phys", icon:"swipe", tgt:"enemy",
    check:()=>P.cp>0||"You need combo points",
    desc:()=>`Finishing move that increases attack speed by 30%. Lasts 6 sec plus 3 sec per combo point.`,
    run:t=>{const cp=finisher(t);buff("slice",6+3*cp);burst(P.px,P.py,"#e8d84a",10);}},
  rupture:{name:"Rupture", lvl:12, cost:25, res:"energy", range:52, school:"phys", icon:"rake", tgt:"enemy",
    check:()=>P.cp>0||"You need combo points",
    desc:()=>`Finishing move that causes ${fmt(pow()*1.0)} bleed damage plus ${fmt(pow()*0.6)} per combo point over 8 sec plus 2 sec per combo point.`,
    run:t=>{slash(t);const cp=finisher(t);dot(t,"rupture",pow()*(1+0.6*cp)*tmul("rupture","phys"),8+2*cp,"phys");}},
  evasion:{name:"Evasion", lvl:14, cost:0, res:"energy", cd:90, range:0, school:"phys", icon:"leap", tgt:"self", offGcd:true,
    desc:()=>`Increases dodge chance by 50%. Lasts 10 sec.`, run:()=>{buff("evasion",10);ring(P.px,P.py,40,"#e8d84a");}},
  ambush:{name:"Ambush", lvl:16, cost:60, res:"energy", range:52, school:"phys", icon:"fang", tgt:"enemy",
    check:()=>(P.buffs.stealth||P.buffs.shadowdance)?true:"Requires Stealth",
    desc:()=>`Ambushes the target from Stealth for ${fmt(pow()*3.5)} damage. Awards 2 combo points.`, run:t=>{slash(t);hit(t,pow()*3.5*tmul("ambush","phys"),"phys","ambush");addCP(t);addCP(t);if(Math.random()<[0,0.33,0.66,1][T("r_init")])addCP(t);}},
  fanknives:{name:"Fan of Knives", lvl:18, cost:50, res:"energy", cd:6, range:0, school:"phys", icon:"multi", tgt:"self",
    desc:()=>`Throws knives at all enemies within 4 m, dealing ${fmt(pow()*1.0)} damage. Awards 1 combo point on your target.`,
    run:()=>{ring(P.px,P.py,90,"#e8e8e8");aoe(P.px,P.py,90,m=>hit(m,pow()*1.0,"phys","fanknives"));if(P.target&&!P.target.dead)addCP(P.target);}},
  kidney:{name:"Kidney Shot", lvl:22, cost:25, res:"energy", cd:20, range:52, school:"phys", icon:"fist", tgt:"enemy",
    check:()=>P.cp>0||"You need combo points",
    desc:()=>`Finishing move that stuns the target for 1 sec plus 1 sec per combo point.`,
    run:t=>{slash(t);const cp=finisher(t);hit(t,pow()*0.5,"phys","kidney");stun(t,1+cp);}},
  vanish:{name:"Vanish", lvl:26, cost:0, res:"energy", cd:120, range:0, school:"phys", icon:"moon", tgt:"self", offGcd:true,
    desc:()=>`Vanishes from sight: enemies lose track of you and you enter Stealth.`,
    run:()=>{P.auto=false;P.combatT=0;P.buffs.stealth=1e9;for(const m of mobs) if(m.state==="chase"&&E.targetsMe(m)) E.evade(m);burst(P.px,P.py,"#2a2a3a",24);}},
  adrenaline:{name:"Adrenaline Rush", lvl:10, talent:"r_adren", cost:0, res:"energy", cd:120, range:0, school:"phys", icon:"bolt", tgt:"self", offGcd:true,
    desc:()=>`Doubles your energy regeneration. Lasts 15 sec.`, run:()=>{buff("adren",15);ring(P.px,P.py,50,"#ffd84a");}},

// ---- Shaman: Nature magic, shocks and totems
  lightning:{name:"Lightning Bolt", lvl:1, cost:18, cast:2.0, range:300, school:"nature", icon:"bolt", tgt:"enemy",
    desc:()=>`Casts a bolt of lightning at the target for ${fmt(spow()*2.0)} Nature damage.`,
    run:t=>proj(t,"#cfe8ff",6,()=>hit(t,spow()*2.0,"nature","lightning"))},
  healwave:{name:"Healing Wave", lvl:2, cost:25, cast:2.5, range:0, school:"nature", icon:"wave", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.38)}.`,
    run:()=>{healP(P.maxHp*0.38);burst(P.px,P.py,"#7fd0ff",12);}},
  earthshock:{name:"Earth Shock", lvl:4, cost:20, cd:6, range:220, school:"nature", icon:"quake", tgt:"enemy",
    desc:()=>`Instantly shocks the target for ${fmt(spow()*1.5)} Nature damage. Shares a cooldown with other shocks.`,
    run:t=>{E.shockCd();burst(t.px,t.py,"#9ad06a",12);hit(t,spow()*1.5,"nature","earthshock");}},
  searing:{name:"Searing Totem", lvl:6, cost:15, range:0, school:"fire", icon:"totem", tgt:"self",
    desc:()=>`Places a Fire totem that attacks enemies within 9 m for ${fmt(spow()*0.55)} Fire damage. Lasts 30 sec.`,
    run:()=>totem("searing")},
  flameshock:{name:"Flame Shock", lvl:8, cost:20, cd:6, range:220, school:"fire", icon:"flame", tgt:"enemy",
    desc:()=>`Burns the target for ${fmt(spow()*0.7)} Fire damage and an additional ${fmt(spow()*1.4)} over 12 sec. Shares a cooldown with other shocks.`,
    run:t=>{E.shockCd();burst(t.px,t.py,"#ff8a3a",12);hit(t,spow()*0.7,"fire","flameshock");dot(t,"flameshock",spow()*1.4*tmul("flameshock","fire"),12,"fire");}},
  stoneskin:{name:"Stoneskin Totem", lvl:10, cost:15, range:0, school:"nature", icon:"totem", tgt:"self",
    desc:()=>`Places an Earth totem that reduces damage taken by you and nearby allies by 10%. Lasts 2 min.`,
    run:()=>totem("stoneskin")},
  hstream:{name:"Healing Stream Totem", lvl:12, cost:20, range:0, school:"nature", icon:"totem", tgt:"self",
    desc:()=>`Places a Water totem that heals you and nearby allies for 3% of maximum health every 2 sec. Lasts 1 min.`,
    run:()=>totem("hstream")},
  lshield:{name:"Lightning Shield", lvl:14, cost:45, range:0, school:"nature", icon:"bubble", tgt:"self",
    desc:()=>`Surrounds you with lightning. Melee attackers take ${fmt(spow()*0.6)} Nature damage, at most once every 5 sec. 3 charges. Lasts 10 min.`,
    run:()=>{buff("lshield",600);P.lsCharges=3;ring(P.px,P.py,40,"#cfe8ff");}},
  chain:{name:"Chain Lightning", lvl:16, cost:35, cd:6, cast:2.0, range:300, school:"nature", icon:"bolt", tgt:"enemy",
    desc:()=>`Hurls lightning that strikes the target for ${fmt(spow()*1.6)} Nature damage and jumps to up to 2 nearby enemies.`,
    run:t=>{const near=mobs.filter(m=>m!==t&&!m.dead&&m.state!=="return"&&pdist(m,t)<140).slice(0,2);[t,...near].forEach((m,i)=>proj(m,"#e8f4ff",5,()=>hit(m,spow()*[1.6,1.2,0.9][i],"nature","chain")));}},
  frostshock:{name:"Frost Shock", lvl:18, cost:22, cd:6, range:220, school:"frost", icon:"snowflake", tgt:"enemy",
    desc:()=>`Shocks the target for ${fmt(spow()*1.4)} Frost damage and slows it by 50% for 8 sec. Shares a cooldown with other shocks.`,
    run:t=>{E.shockCd();burst(t.px,t.py,"#8fd8ff",12);hit(t,spow()*1.4,"frost","frostshock");slow(t,0.5,8);}},
  strengthtotem:{name:"Strength of Earth Totem", lvl:20, cost:15, range:0, school:"nature", icon:"totem", tgt:"self",
    desc:()=>`Places an Earth totem that increases damage dealt by you and nearby allies by 10%. Lasts 2 min.`,
    run:()=>totem("strength")},
  magma:{name:"Magma Totem", lvl:22, cost:30, range:0, school:"fire", icon:"totem", tgt:"self",
    desc:()=>`Places a Fire totem that deals ${fmt(spow()*0.6)} Fire damage to enemies within 4 m every 2 sec. Lasts 20 sec.`,
    run:()=>totem("magma")},
  graceair:{name:"Grace of Air Totem", lvl:24, cost:20, range:0, school:"nature", icon:"totem", tgt:"self",
    desc:()=>`Places an Air totem that increases the critical strike chance of you and nearby allies by 3%. Lasts 2 min.`,
    run:()=>totem("graceair")},
  heroism:{name:"Heroism", lvl:26, cost:30, cd:180, range:0, school:"nature", icon:"horn", tgt:"self", offGcd:true,
    desc:()=>`Increases damage dealt by you and nearby allies by 20%. Lasts 15 sec.`,
    run:()=>{buff("heroism",15);ring(P.px,P.py,120,"#ffb84a");coopGroupFx(700,[["buff","heroism",15]],"Heroism");}},
  stormstrike:{name:"Stormstrike", lvl:10, talent:"s_storm", cost:20, cd:10, range:52, school:"nature", icon:"bolt", tgt:"enemy",
    desc:()=>`Strikes the target with lightning-charged weapons for ${fmt(hpow()*2.2)} Nature damage.`,
    run:t=>{slash(t);burst(t.px,t.py,"#cfe8ff",14);hit(t,hpow()*2.2,"nature","stormstrike");}},
  // ---------------- the ranged slot: Shoot (bows, rifles and crossbows for warriors and rogues; wands for mages, priests and warlocks)
  shoot:{name:"Shoot", lvl:1, cost:0, cd:6, range:690, school:"phys", icon:"arrow", tgt:"enemy",
    check:()=>["bow","rifle","crossbow"].includes(S.cur&&S.cur.eq&&S.cur.eq.ranged&&S.cur.eq.ranged.wt)||"Requires a bow, rifle or crossbow",
    desc:()=>`Shoots your ranged weapon at the target for ${fmt(pow()*0.8)} damage. Requires a bow, rifle or crossbow.`,
    run:t=>proj(t,"#e9e2c8",4,()=>hit(t,pow()*0.8,"phys","shoot"),"arrow")},
  wand:{name:"Shoot", lvl:1, cost:0, range:690, school:"arcane", icon:"spark", tgt:"enemy",
    check:()=>(S.cur&&S.cur.eq&&S.cur.eq.ranged&&S.cur.eq.ranged.wt==="wand")||"Requires a wand",
    desc:()=>`Fires your wand at the target every 1.5 sec, dealing ${fmt(spow()*0.45)} damage per shot, until you move or cast a spell. Use again to stop.`,
    run:()=>E.wandToggle()},
  // ---------------- abilities taught by talents (talent reworks)
  presence:{name:"Presence of Mind", lvl:10, talent:"m_presence", cost:0, cd:90, range:0, school:"arcane", icon:"eye", tgt:"self", offGcd:true,
    desc:()=>`Your next spell with a cast time is instant.`, run:()=>{buff("presence",30);ring(P.px,P.py,40,"#c8a8ff");}},
  arcanepower:{name:"Arcane Power", lvl:10, talent:"m_arcpow", cost:0, cd:120, range:0, school:"arcane", icon:"orb", tgt:"self", offGcd:true,
    desc:()=>`Your spells deal 30% more damage and cost 30% more mana. Lasts 15 sec.`, run:()=>{buff("arcanepower",15);burst(P.px,P.py,"#c8a8ff",16);}},
  combustion:{name:"Combustion", lvl:10, talent:"m_combust", cost:0, cd:120, range:0, school:"fire", icon:"flame", tgt:"self", offGcd:true,
    desc:()=>`Your next 3 Fire spells are guaranteed critical strikes.`, run:()=>{buff("combust",60);P.combustN=3;burst(P.px,P.py,"#ff8a3a",16);}},
  coldsnap:{name:"Cold Snap", lvl:10, talent:"m_coldsnap", cost:0, cd:180, range:0, school:"frost", icon:"snowflake", tgt:"self", offGcd:true,
    desc:()=>`Finishes the cooldown of Frost Ring, Blizzard, Ice Barrier and Deep Freeze.`, run:()=>{for(const k of ["frostnova","blizzard","icebarrier","deepfreeze"]) delete P.cds[k];burst(P.px,P.py,"#bfe9ff",14);}},
  deepfreeze:{name:"Deep Freeze", lvl:10, talent:"m_deep", cost:30, cd:30, range:300, school:"frost", icon:"crystal", tgt:"enemy",
    desc:()=>`Stuns the target for 4 sec and deals ${fmt(spow()*1.2)} Frost damage. Deals triple damage to frozen targets.`,
    run:t=>{burst(t.px,t.py,"#bfe9ff",16);hit(t,spow()*1.2*(t.freezeT>0?3:1),"frost","deepfreeze");stun(t,4);}},
  sweeping:{name:"Sweeping Strikes", lvl:10, talent:"w_sweep", cost:10, cd:30, range:0, school:"phys", icon:"whirl", tgt:"self", offGcd:true,
    desc:()=>`Your next 5 melee attacks also strike a nearby enemy.`, run:()=>{buff("sweep",20);P.sweepN=5;}},
  mortalstrike:{name:"Mortal Strike", lvl:10, talent:"w_mortal", cost:30, cd:6, range:52, school:"phys", icon:"sword", tgt:"enemy",
    desc:()=>`A vicious strike that deals ${fmt(pow()*3.0)} damage.`, run:t=>{slash(t);hit(t,pow()*3.0,"phys","mortalstrike");}},
  recklessness:{name:"Recklessness", lvl:10, talent:"w_reck", cost:0, cd:120, range:0, school:"phys", icon:"roar", tgt:"self", offGcd:true,
    desc:()=>`Increases your critical strike chance by 30%. Lasts 12 sec.`, run:()=>{buff("reckless",12);ring(P.px,P.py,50,"#d8302a");}},
  laststand:{name:"Last Stand", lvl:10, talent:"w_last", cost:0, cd:180, range:0, school:"phys", icon:"heart", tgt:"self", offGcd:true,
    desc:()=>`Increases your maximum health by 30%. Lasts 20 sec.`, run:()=>{E.lastStand();burst(P.px,P.py,"#e6bd5c",14);}},
  shieldwall:{name:"Shield Wall", lvl:10, talent:"w_wall", cost:0, cd:180, range:0, school:"phys", icon:"shield", tgt:"self", offGcd:true,
    desc:()=>`Reduces damage taken by 50%. Lasts 10 sec.`, run:()=>{buff("shieldwall",10);ring(P.px,P.py,40,"#c8ced4");}},
  rapidfire:{name:"Rapid Fire", lvl:10, talent:"h_rapid", cost:0, cd:120, range:0, school:"phys", icon:"multi", tgt:"self", offGcd:true,
    desc:()=>`Increases your ranged attack speed by 40%. Lasts 15 sec.`, run:()=>{buff("rapidfire",15);}},
  chimera:{name:"Chimera Shot", lvl:10, talent:"h_chimera", cost:35, cd:10, minRange:HUNTER_MIN, range:320, school:"nature", icon:"firearrow", tgt:"enemy",
    desc:()=>`Deals ${fmt(pow()*2.0)} Nature damage and refreshes your Poison Arrow on the target.`,
    run:t=>proj(t,"#9cf07a",6,()=>{hit(t,pow()*2.0,"nature","chimera");if((t.dots||[]).some(d=>d.key==="poison"))dot(t,"poison",pow()*2.6,12,"nature");},"arrow")},
  counter:{name:"Counterattack", lvl:10, talent:"h_counter", cost:10, cd:5, range:52, school:"phys", icon:"claw", tgt:"enemy",
    check:()=>P.buffs.counter?true:"Usable after you dodge an attack",
    desc:()=>`Usable after you dodge an attack. Strikes the target for ${fmt(pow()*1.5)} damage and roots it for 4 sec.`,
    run:t=>{slash(t);hit(t,pow()*1.5,"phys","counter");root(t,4);delete P.buffs.counter;}},
  explosive:{name:"Explosive Shot", lvl:10, talent:"h_explosive", cost:35, cd:8, minRange:HUNTER_MIN, range:320, school:"fire", icon:"meteor", tgt:"enemy",
    desc:()=>`Deals ${fmt(pow()*1.0)} Fire damage to the target and enemies within 3 m, and an additional ${fmt(pow()*1.5)} over 6 sec to the target.`,
    run:t=>proj(t,"#ff8a3a",7,()=>{ring(t.px,t.py,70,"#ff8a3a");aoe(t.px,t.py,70,m=>hit(m,pow()*1.0,"fire","explosive"));dot(t,"explosive",pow()*1.5,6,"fire");},"arrow")},
  innerfocus:{name:"Inner Focus", lvl:10, talent:"p_focus", cost:0, cd:90, range:0, school:"holy", icon:"eye", tgt:"self", offGcd:true,
    desc:()=>`Your next spell costs no mana and has a 25% higher chance to be a critical strike.`, run:()=>{buff("innerfocus",60);}},
  powerinf:{name:"Power Infusion", lvl:10, talent:"p_pi", cost:0, cd:120, range:0, school:"holy", icon:"sun", tgt:"self", offGcd:true,
    desc:()=>`Increases spell damage and healing by 20% and casting speed by 20%. Lasts 15 sec.`, run:()=>{buff("powerinf",15);burst(P.px,P.py,"#ffe37a",16);}},
  painsupp:{name:"Pain Suppression", lvl:10, talent:"p_painsupp", cost:0, cd:120, range:0, school:"holy", icon:"shield", tgt:"self", offGcd:true,
    desc:()=>`Reduces damage taken by 40%. Lasts 8 sec.`, run:()=>{buff("painsupp",8);ring(P.px,P.py,40,"#fff2b0");}},
  desperate:{name:"Desperate Prayer", lvl:10, talent:"p_desperate", cost:0, cd:120, range:0, school:"holy", icon:"cross", tgt:"self", offGcd:true,
    desc:()=>`Instantly heals you for ${fmt(P.maxHp*0.4)}.`, run:()=>{healP(P.maxHp*0.4);burst(P.px,P.py,"#fff2b0",12);}},
  guardian:{name:"Guardian Spirit", lvl:10, talent:"p_guardian", cost:0, cd:180, range:0, school:"holy", icon:"halo", tgt:"self", offGcd:true,
    desc:()=>`For 10 sec, an attack that would kill you leaves you at 40% health instead.`, run:()=>{buff("guardian",10);ring(P.px,P.py,50,"#fff2b0");}},
  voideruption:{name:"Void Eruption", lvl:10, talent:"p_void", cost:35, cd:15, range:300, school:"shadow", icon:"void", tgt:"enemy",
    desc:()=>`Deals ${fmt(spow()*2.2)} Shadow damage to the target and enemies within 4 m of it.`,
    run:t=>{ring(t.px,t.py,92,"#7a4ad0");aoe(t.px,t.py,92,m=>hit(m,spow()*2.2,"shadow","voideruption"));}},
  starsurge:{name:"Starsurge", lvl:10, talent:"d_surge", cost:25, cd:15, range:300, school:"arcane", icon:"star", tgt:"enemy",
    desc:()=>`Instantly deals ${fmt(spow()*2.4)} Arcane damage.`, run:t=>proj(t,"#c8a8ff",8,()=>hit(t,spow()*2.4,"arcane","starsurge"))},
  berserk:{name:"Berserk", lvl:10, talent:"d_berserk", cost:0, cd:180, range:0, school:"phys", icon:"roar", tgt:"self", offGcd:true, anyForm:true,
    desc:()=>`Reduces the rage and energy cost of your abilities by 30%. Lasts 12 sec.`, run:()=>{buff("berserk",12);ring(P.px,P.py,50,"#d8302a");}},
  nswift:{name:"Nature's Swiftness", lvl:10, talent:"d_swift", cost:0, cd:90, range:0, school:"nature", icon:"leaf", tgt:"self", offGcd:true,
    desc:()=>`Your next Nature spell with a cast time is instant.`, run:()=>{buff("nswift",30);}},
  tranquility:{name:"Tranquility", lvl:10, talent:"d_tranq", cost:40, cd:180, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Heals you for ${fmt(P.maxHp*0.6)} over 8 sec.`, run:()=>{hot("tranquility",P.maxHp*0.6,8);ring(P.px,P.py,60,"#9cf07a");}},
  divinefavor:{name:"Divine Favor", lvl:10, talent:"pal_divine", cost:0, cd:60, range:0, school:"holy", icon:"sun", tgt:"self", offGcd:true,
    desc:()=>`Your next Holy spell or attack is a guaranteed critical strike.`, run:()=>{buff("surecrit",30);}},
  holyshock:{name:"Holy Shock", lvl:10, talent:"pal_shock", cost:25, cd:12, range:300, school:"holy", icon:"cross", tgt:"enemy",
    desc:()=>`Instantly deals ${fmt(hpow()*1.6)} Holy damage to the target and heals you for the damage dealt.`,
    run:t=>{burst(t.px,t.py,"#ffe37a",12);const r=hit(t,hpow()*1.6,"holy","holyshock");if(r)healP(r.amt);}},
  avengershield:{name:"Avenger's Shield", lvl:10, talent:"pal_avenger", cost:25, cd:15, range:250, school:"holy", icon:"shield", tgt:"enemy",
    desc:()=>`Hurls your shield at the target and up to 2 nearby enemies, dealing ${fmt(hpow()*1.8)} Holy damage and slowing them by 50% for 6 sec.`,
    run:t=>{let n=0;const hitOne=m=>{if(n>=3)return;n++;burst(m.px,m.py,"#ffe37a",10);hit(m,hpow()*1.8,"holy","avengershield");slow(m,0.5,6);};hitOne(t);aoe(t.px,t.py,120,m=>{if(m!==t)hitOne(m);});}},
  divinestorm:{name:"Divine Storm", lvl:10, talent:"pal_storm", cost:25, cd:10, range:0, school:"holy", icon:"whirl", tgt:"self",
    desc:()=>`Deals ${fmt(hpow()*1.6)} Holy damage to enemies within 4 m and heals you for 25% of the damage dealt.`,
    run:()=>{ring(P.px,P.py,92,"#ffe37a");let tot=0;aoe(P.px,P.py,92,m=>{const r=hit(m,hpow()*1.6,"holy","divinestorm");if(r)tot+=r.amt;});if(tot)healP(tot*0.25);}},
  coldblood:{name:"Cold Blood", lvl:10, talent:"r_cold", cost:0, cd:90, res:"energy", range:0, school:"phys", icon:"dagger", tgt:"self", offGcd:true,
    desc:()=>`Your next ability is a guaranteed critical strike.`, run:()=>{buff("surecrit",30);}},
  bladeflurry:{name:"Blade Flurry", lvl:10, talent:"r_bflurry", cost:25, cd:60, res:"energy", range:0, school:"phys", icon:"swipe", tgt:"self", offGcd:true,
    desc:()=>`Your attacks also strike a nearby enemy. Lasts 12 sec.`, run:()=>{buff("bladeflurry",12);}},
  premed:{name:"Premeditation", lvl:10, talent:"r_premed", cost:0, cd:60, res:"energy", range:300, school:"phys", icon:"eye", tgt:"enemy", offGcd:true, keepStealth:true,
    check:()=>P.buffs.stealth?true:"Requires Stealth", desc:()=>`Adds 2 combo points to your target. Usable only in Stealth.`, run:t=>{P.target=t;addCP(t);addCP(t);}},
  shadowdance:{name:"Shadow Dance", lvl:10, talent:"r_dance", cost:0, cd:60, res:"energy", range:0, school:"phys", icon:"moon", tgt:"self", offGcd:true,
    desc:()=>`For 6 sec, you can use Ambush without being in Stealth.`, run:()=>{buff("shadowdance",6);burst(P.px,P.py,"#7a5ab0",14);}},
  elemmastery:{name:"Elemental Mastery", lvl:10, talent:"s_em", cost:0, cd:120, range:0, school:"nature", icon:"storm", tgt:"self", offGcd:true,
    desc:()=>`Your next spell is instant and a guaranteed critical strike.`, run:()=>{buff("emastery",30);buff("surecrit",30);}},
  ancswift:{name:"Ancestral Swiftness", lvl:10, talent:"s_swift", cost:0, cd:90, range:0, school:"nature", icon:"wave", tgt:"self", offGcd:true,
    desc:()=>`Your next Lightning Bolt, Chain Lightning or Healing Wave is instant.`, run:()=>{buff("ancswift",30);}},
  manatide:{name:"Mana Tide", lvl:10, talent:"s_tide", cost:0, cd:180, range:0, school:"nature", icon:"totem", tgt:"self", offGcd:true,
    desc:()=>`Restores 30% of your maximum mana over 12 sec.`, run:()=>{buff("manatide",12);ring(P.px,P.py,50,"#5fa8e0");}}

});

export const BARS = {
  mage:["fireball","frostbolt","fireblast","frostnova","polymorph","blizzard","pyroblast","sparkrain","icearmor","meteor","icebarrier","presence","arcanepower","combustion","coldsnap","deepfreeze","wand"],
  warrior:["heroic","charge","shout","rend","whirlwind","execute","shieldbash","secondwind","quake","sweeping","mortalstrike","recklessness","laststand","shieldwall","shoot"],
  hunter:["steady","raptor","wingclip","firearrow","icearrow","disengage","multishot","aimed","poison","snare","stormarrow","callbear","dismisspet","mendpet","callwolf","intimidate","bestialwrath","rapidfire","chimera","counter","explosive"],
  priest:["smite","heal","swp","pws","mindblast","holynova","renew","darkpulse","judgment","resurrection","innerfocus","powerinf","painsupp","desperate","guardian","voideruption","wand"],
  druid:["wrath","touch","moonfire","rejuv","roots","starfire","hurricane","bark","bloom","bear","cat","leopard","revive","starsurge","nswift","tranquility"],
  druid_bear:["maul","swipe","frenzy","bash","roar","bear","cat","leopard","berserk"],
  druid_cat:["claw","rake","bite","dash","pounce","bear","cat","leopard","berserk"],
  druid_leopard:["leopard","bear","cat"],
  paladin:["palstrike","palheal","hammer","holyshield","crusader","consecrate","avenging","bubble","judge","redemption","divinefavor","holyshock","avengershield","divinestorm"],
  warlock:["shadowbolt","summonimp","immolate","corruption","fear","agony","lifetap","drainlife","summonvoid","healthfunnel","weakness","rainfire","soulfire","deathcoil","dismissdemon","demonfrenzy","unstable","shadowburn","conflagrate","wand"],
  rogue:["sinister","eviscerate","stealth","gouge","backstab","slicedice","rupture","evasion","ambush","fanknives","kidney","vanish","adrenaline","coldblood","bladeflurry","premed","shadowdance","shoot"],
  shaman:["lightning","healwave","earthshock","searing","flameshock","stoneskin","hstream","lshield","chain","frostshock","strengthtotem","magma","graceair","heroism","stormstrike","elemmastery","ancswift","manatide"]
};

// the healing abilities: their strength grows with spell healing (and spell power) on your gear and with healing talents
export const HEAL_AB = new Set(["heal", "pws", "holynova", "renew", "touch", "rejuv", "bloom", "palheal", "healwave"]);
// longer reach for bows and spells: every ranged attack of mages, hunters, priests and druids reaches 25% further
for(const c of ["mage", "hunter", "priest", "druid", "warlock", "shaman"]) for(const id of BARS[c]){ const a = AB[id]; if(a && a.tgt === "enemy" && a.range >= 150) a.range = Math.round(a.range * 1.25); }

// Talents: every class has three specializations (trees). A tier opens when you have spent enough points IN THAT TREE: 1:0, 2:3, 3:6, 4:8, 5:10.
// eff = generic bonus per rank: dmg, crit, dodge, parry, def (less damage taken), hp, mana, heal (healing done), form (damage in Bear/Wolf Form),
// petdmg / pethp (hunter pets), and a school name (fire, frost, arcane, nature, holy, shadow, phys) for more damage with that school.
export const TIER_NEED = {1:0, 2:3, 3:6, 4:8, 5:10, 6:14, 7:19};
export const TALENT_VERSION = 4;
export const TALENT_CLASS_VER = {warlock: 3};           // a class whose talents changed again gets its points back once more
export const TREES = {
  mage:[{id:"arcane",name:"Arcane",d:"Mana, critical strikes and arcane power."},{id:"fire",name:"Fire",d:"Fire damage and Hot Streak."},{id:"frost",name:"Frost",d:"Control, Shatter and survivability."}],
  warrior:[{id:"arms",name:"Arms",d:"Powerful strikes and bleeds."},{id:"fury",name:"Fury",d:"Sustained damage and critical strikes."},{id:"prot",name:"Protection",d:"Tanking, health and damage reduction."}],
  hunter:[{id:"beast",name:"Beast Mastery",d:"Pet damage, survivability and pet abilities."},{id:"marks",name:"Marksmanship",d:"Critical strikes and Aimed Shot."},{id:"surv",name:"Survival",d:"Elemental arrows and survivability."}],
  priest:[{id:"disc",name:"Discipline",d:"Shields, mana and survivability."},{id:"holy",name:"Holy",d:"Healing."},{id:"shadow",name:"Shadow",d:"Shadow damage and Shadowform."}],
  druid:[{id:"balance",name:"Balance",d:"Nature and Arcane spells."},{id:"feral",name:"Feral",d:"Wolf Form damage and Bear Form tanking."},{id:"resto",name:"Restoration",d:"Healing."}],
  paladin:[{id:"pholy",name:"Holy",d:"Healing and mana."},{id:"pprot",name:"Protection",d:"Tanking, health and damage reduction."},{id:"ret",name:"Retribution",d:"Holy and physical damage."}],
  warlock:[{id:"affl",name:"Affliction",d:"Curses, damage over time and Drain Life."},{id:"demo",name:"Demonology",d:"Your demon and survivability."},{id:"destr",name:"Destruction",d:"Fire and Shadow damage."}],
  rogue:[{id:"assa",name:"Assassination",d:"Critical strikes and finishing moves."},{id:"combat",name:"Combat",d:"Weapon damage and dual wielding."},{id:"subt",name:"Subtlety",d:"Stealth, Ambush and survivability."}],
  shaman:[{id:"elem",name:"Elemental",d:"Lightning, shocks and Fire totems."},{id:"enh",name:"Enhancement",d:"Melee combat and Stormstrike."},{id:"sresto",name:"Restoration",d:"Healing and mana."}]
};
export const TALENTS = {
  mage:[
    {id:"t6_arcane",tree:"arcane",tier:6,max:5,name:"Arcane Mastery",eff:{dmg:0.015},d:r=>`Increases all damage dealt by ${+(1.5*r).toFixed(1)}%.`},
    {id:"t7_arcane",tree:"arcane",tier:7,max:3,name:"Arcane Fortitude",eff:{mana:0.04},d:r=>`Increases maximum mana by ${+(4.0*r).toFixed(1)}%.`},
    {id:"t6_fire",tree:"fire",tier:6,max:5,name:"Fire Mastery",eff:{fire:0.02},d:r=>`Increases Fire damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_fire",tree:"fire",tier:7,max:3,name:"Pyromaniac",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_frost",tree:"frost",tier:6,max:5,name:"Frost Mastery",eff:{frost:0.02},d:r=>`Increases Frost damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_frost",tree:"frost",tier:7,max:3,name:"Ice Ward",eff:{def:0.02},d:r=>`Reduces damage taken by ${+(2.0*r).toFixed(1)}%.`},
    {id:"arcMind",tree:"arcane",tier:1,max:3,name:"Arcane Mind",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"m_conc",tree:"arcane",tier:1,max:3,name:"Arcane Concentration",d:r=>`Your damaging spells have a ${3*r}% chance to make your next spell cost no mana.`},
    {id:"m_medit",tree:"arcane",tier:2,max:3,name:"Arcane Meditation",d:r=>`Increases your mana regeneration in combat by ${50*r}%.`},
    {id:"m_sharp",tree:"arcane",tier:2,max:3,name:"Keen Mind",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"m_presence",tree:"arcane",tier:3,max:1,name:"Presence of Mind",grants:"presence",d:()=>`Teaches Presence of Mind: your next spell with a cast time is instant. 1.5 min cooldown.`},
    {id:"m_arcpow",tree:"arcane",tier:4,max:1,name:"Arcane Power",grants:"arcanepower",d:()=>`Teaches Arcane Power: your spells deal 30% more damage and cost 30% more mana for 15 sec. 2 min cooldown.`},
    {id:"m_arch",tree:"arcane",tier:5,max:1,name:"Archmage",d:()=>`Every 4th spell you cast is instant and costs no mana.`},
    {id:"impFire",tree:"fire",tier:1,max:3,name:"Burning Soul",d:r=>`Increases Fire spell damage by ${8*r}%.`},
    {id:"quickCast",tree:"fire",tier:1,max:2,name:"Quick Casting",d:r=>`Reduces the cast time of Fireball, Ice Lance and Sunflare by ${(0.25*r).toFixed(2)} sec.`},
    {id:"ignite",tree:"fire",tier:2,max:3,name:"Ignite",d:r=>`Your Fire critical strikes burn the target for an additional ${15*r}% of the damage over 4 sec.`},
    {id:"m_critmass",tree:"fire",tier:2,max:3,name:"Critical Mass",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"hotStreak",tree:"fire",tier:3,max:1,name:"Hot Streak",d:()=>`Critical strikes with Fireball or Ember Blast make your next Sunflare instant.`},
    {id:"m_impact",tree:"fire",tier:4,max:3,name:"Impact",d:r=>`Your Fire spells have a ${3*r}% chance to stun the target for 2 sec.`},
    {id:"m_combust",tree:"fire",tier:5,max:1,name:"Combustion",grants:"combustion",d:()=>`Teaches Combustion: your next 3 Fire spells are guaranteed critical strikes. 2 min cooldown.`},
    {id:"iceShards",tree:"frost",tier:1,max:3,name:"Ice Shards",d:r=>`Increases Frost spell damage by ${8*r}%.`},
    {id:"m_frostchan",tree:"frost",tier:1,max:3,name:"Frost Channeling",d:r=>`Reduces the mana cost of your Frost spells by ${5*r}%.`},
    {id:"shatter",tree:"frost",tier:2,max:3,name:"Shatter",d:r=>`Increases critical strike chance against frozen targets by ${12*r}%.`},
    {id:"m_frostbite",tree:"frost",tier:2,max:3,name:"Frostbite",d:r=>`Ice Lance has a ${5*r}% chance to freeze the target for 3 sec.`},
    {id:"m_barrier",tree:"frost",tier:3,max:1,name:"Ice Barrier",grants:"icebarrier",d:()=>`Teaches Ice Barrier: absorbs damage for 1 min. 1 min cooldown.`},
    {id:"m_coldsnap",tree:"frost",tier:4,max:1,name:"Cold Snap",grants:"coldsnap",d:()=>`Teaches Cold Snap: finishes the cooldown of your Frost spells. 3 min cooldown.`},
    {id:"m_deep",tree:"frost",tier:5,max:1,name:"Deep Freeze",grants:"deepfreeze",d:()=>`Teaches Deep Freeze: stuns the target for 4 sec and deals Frost damage, tripled against frozen targets. 30 sec cooldown.`}],
  warrior:[
    {id:"t6_arms",tree:"arms",tier:6,max:5,name:"Weapon Mastery",eff:{phys:0.02},d:r=>`Increases physical damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_arms",tree:"arms",tier:7,max:3,name:"Deadly Precision",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_fury",tree:"fury",tier:6,max:5,name:"Unbridled Fury",eff:{dmg:0.015},d:r=>`Increases all damage dealt by ${+(1.5*r).toFixed(1)}%.`},
    {id:"t7_fury",tree:"fury",tier:7,max:3,name:"Bloodlust",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_prot",tree:"prot",tier:6,max:5,name:"Ironclad",eff:{def:0.015},d:r=>`Reduces damage taken by ${+(1.5*r).toFixed(1)}%.`},
    {id:"t7_prot",tree:"prot",tier:7,max:3,name:"Bulwark",eff:{hp:0.03},d:r=>`Increases maximum health by ${+(3.0*r).toFixed(1)}%.`},
    {id:"impHS",tree:"arms",tier:1,max:3,name:"Improved Strike",d:r=>`Increases the damage of Mighty Strike by ${10*r}%.`},
    {id:"w_weapon",tree:"arms",tier:1,max:3,name:"Weapon Mastery",eff:{phys:0.03},d:r=>`Increases physical damage by ${3*r}%.`},
    {id:"deepWounds",tree:"arms",tier:2,max:3,name:"Deep Wounds",d:r=>`Your critical strikes cause the target to bleed for an additional ${15*r}% of the damage over 4 sec.`},
    {id:"impCharge",tree:"arms",tier:2,max:2,name:"Swift Feet",d:r=>`Charge generates ${10*r} additional rage.`},
    {id:"w_sweep",tree:"arms",tier:3,max:1,name:"Sweeping Strikes",grants:"sweeping",d:()=>`Teaches Sweeping Strikes: your next 5 melee attacks also strike a nearby enemy. 30 sec cooldown.`},
    {id:"w_sudden",tree:"arms",tier:4,max:3,name:"Sudden Death",d:r=>`Your melee attacks have a ${3*r}% chance to make Stroke of Mercy usable on any target for 10 sec.`},
    {id:"w_mortal",tree:"arms",tier:5,max:1,name:"Mortal Strike",grants:"mortalstrike",d:()=>`Teaches Mortal Strike: a vicious strike that deals heavy damage. 6 sec cooldown.`},
    {id:"cruelty",tree:"fury",tier:1,max:3,name:"Cruelty",d:r=>`Increases critical strike chance by ${3*r}%.`},
    {id:"w_unbridled",tree:"fury",tier:1,max:3,name:"Unbridled Wrath",d:r=>`Your auto attacks have a ${8*r}% chance to generate 5 additional rage.`},
    {id:"w_craze",tree:"fury",tier:2,max:3,name:"Blood Craze",d:r=>`When you are hit, you have a 10% chance to regenerate ${3*r}% of your maximum health over 6 sec.`},
    {id:"w_enrage",tree:"fury",tier:2,max:3,name:"Enrage",d:r=>`Your critical strikes increase your damage by ${5*r}% for 8 sec.`},
    {id:"bloodthirst",tree:"fury",tier:3,max:1,name:"Bloodthirst",d:()=>`Killing an enemy restores 15% of your maximum health.`},
    {id:"w_flurry",tree:"fury",tier:4,max:3,name:"Flurry",d:r=>`Your critical strikes make your next 3 auto attacks ${10*r}% faster.`},
    {id:"w_reck",tree:"fury",tier:5,max:1,name:"Recklessness",grants:"recklessness",d:()=>`Teaches Recklessness: increases your critical strike chance by 30% for 12 sec. 2 min cooldown.`},
    {id:"toughness",tree:"prot",tier:1,max:3,name:"Toughness",d:r=>`Increases maximum health by ${6*r}%.`},
    {id:"w_parry",tree:"prot",tier:1,max:3,name:"Art of Parrying",eff:{parry:0.01},d:r=>`Increases parry chance by ${r}%.`},
    {id:"w_will",tree:"prot",tier:2,max:3,name:"Will of Steel",eff:{def:0.03},d:r=>`Reduces damage taken by ${3*r}%.`},
    {id:"w_shield",tree:"prot",tier:2,max:3,name:"Shield Specialization",d:r=>`Parrying an attack generates ${5*r} rage.`},
    {id:"w_last",tree:"prot",tier:3,max:1,name:"Last Stand",grants:"laststand",d:()=>`Teaches Last Stand: increases your maximum health by 30% for 20 sec. 3 min cooldown.`},
    {id:"w_bash",tree:"prot",tier:4,max:2,name:"Improved Shield Bash",d:r=>`Reduces the cooldown of Shield Bash by ${3*r} sec.`},
    {id:"w_wall",tree:"prot",tier:5,max:1,name:"Shield Wall",grants:"shieldwall",d:()=>`Teaches Shield Wall: reduces damage taken by 50% for 10 sec. 3 min cooldown.`}],
  hunter:[
    {id:"t6_beast",tree:"beast",tier:6,max:5,name:"Pack Leader",eff:{petdmg:0.04},d:r=>`Increases your pet's damage by ${+(4.0*r).toFixed(1)}%.`},
    {id:"t7_beast",tree:"beast",tier:7,max:3,name:"Thick Fur",eff:{pethp:0.05},d:r=>`Increases your pet's maximum health by ${+(5.0*r).toFixed(1)}%.`},
    {id:"t6_marks",tree:"marks",tier:6,max:5,name:"Sharpshooter",eff:{phys:0.02},d:r=>`Increases physical damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_marks",tree:"marks",tier:7,max:3,name:"Eagle Eye",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_surv",tree:"surv",tier:6,max:5,name:"Survivalist",eff:{hp:0.02},d:r=>`Increases maximum health by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_surv",tree:"surv",tier:7,max:3,name:"Elemental Arrows",eff:{fire:0.03,frost:0.03,nature:0.03},d:r=>`Increases Fire, Frost and Nature damage by ${+(3.0*r).toFixed(1)}%.`},
    {id:"h_pethp",tree:"beast",tier:1,max:3,name:"Endurance Training",eff:{pethp:0.08},d:r=>`Increases your pet\'s health by ${8*r}%.`},
    {id:"h_throat",tree:"beast",tier:1,max:3,name:"Go for the Throat",d:r=>`Your critical strikes grant your pet ${10*r} rage or energy.`},
    {id:"h_frenzy",tree:"beast",tier:2,max:3,name:"Frenzy",d:r=>`Increases your pet\'s attack speed by ${7*r}%.`},
    {id:"h_mend",tree:"beast",tier:2,max:2,name:"Improved Mend Pet",d:r=>`Increases the healing of Mend Pet by ${25*r}%. Mend Pet also heals you for ${15*r}% of the amount.`},
    {id:"h_intim",tree:"beast",tier:3,max:1,name:"Intimidation",grants:"intimidate",d:()=>`Teaches Intimidation: your pet stuns its target for 3 sec. 30 sec cooldown.`},
    {id:"h_bond",tree:"beast",tier:4,max:3,name:"Spirit Bond",d:r=>`You and your pet regenerate ${(0.6*r).toFixed(1)}% of maximum health every 5 sec.`},
    {id:"h_bestial",tree:"beast",tier:5,max:1,name:"Bestial Wrath",grants:"bestialwrath",d:()=>`Teaches Bestial Wrath: your pet deals 50% more damage and attacks 30% faster for 10 sec. 1 min cooldown.`},
    {id:"lethal",tree:"marks",tier:1,max:3,name:"Lethal Shots",d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"efficiency",tree:"marks",tier:1,max:2,name:"Efficiency",d:r=>`Reduces the focus cost of your shots by ${10*r}%.`},
    {id:"h_isteady",tree:"marks",tier:2,max:3,name:"Improved Steady Shot",d:r=>`Steady Shot has a ${5*r}% chance to make your next Aimed Shot instant.`},
    {id:"h_barrage",tree:"marks",tier:2,max:2,name:"Concussive Barrage",d:r=>`Triple Shot slows its targets by ${25*r}% for 4 sec.`},
    {id:"trueshot",tree:"marks",tier:3,max:1,name:"Master Marksman",d:()=>`Critical strikes with Aimed Shot finish its cooldown.`},
    {id:"h_rapid",tree:"marks",tier:4,max:1,name:"Rapid Fire",grants:"rapidfire",d:()=>`Teaches Rapid Fire: increases your ranged attack speed by 40% for 15 sec. 2 min cooldown.`},
    {id:"h_chimera",tree:"marks",tier:5,max:1,name:"Chimera Shot",grants:"chimera",d:()=>`Teaches Chimera Shot: deals Nature damage and refreshes your Poison Arrow on the target. 10 sec cooldown.`},
    {id:"fireArrows",tree:"surv",tier:1,max:3,name:"Glowing Arrowheads",d:r=>`Increases the damage of Fire Arrow by ${15*r}%.`},
    {id:"iceArrows",tree:"surv",tier:1,max:3,name:"Crippling Arrows",d:r=>`Increases the slowing effect of Cripple Shot by ${5*r}%.`},
    {id:"h_idis",tree:"surv",tier:2,max:2,name:"Improved Disengage",d:r=>`Reduces the cooldown of Disengage by ${5*r} sec.`},
    {id:"h_survivalist",tree:"surv",tier:2,max:3,name:"Survivalist",eff:{hp:0.03,def:0.01},d:r=>`Increases maximum health by ${3*r}% and reduces damage taken by ${r}%.`},
    {id:"h_counter",tree:"surv",tier:3,max:1,name:"Counterattack",grants:"counter",d:()=>`Teaches Counterattack: usable after you dodge an attack. Strikes the target and roots it for 4 sec.`},
    {id:"h_thrill",tree:"surv",tier:4,max:3,name:"Thrill of the Hunt",d:r=>`Your critical strikes restore ${5*r} focus.`},
    {id:"h_explosive",tree:"surv",tier:5,max:1,name:"Explosive Shot",grants:"explosive",d:()=>`Teaches Explosive Shot: an arrow that explodes, dealing Fire damage to the target and nearby enemies. 8 sec cooldown.`}],
  priest:[
    {id:"t6_disc",tree:"disc",tier:6,max:5,name:"Disciplined Mind",eff:{mana:0.03},d:r=>`Increases maximum mana by ${+(3.0*r).toFixed(1)}%.`},
    {id:"t7_disc",tree:"disc",tier:7,max:3,name:"Resolve",eff:{def:0.02},d:r=>`Reduces damage taken by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t6_holy",tree:"holy",tier:6,max:5,name:"Holy Mastery",eff:{heal:0.02},d:r=>`Increases healing done by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_holy",tree:"holy",tier:7,max:3,name:"Divine Clarity",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_shadow",tree:"shadow",tier:6,max:5,name:"Shadow Mastery",eff:{shadow:0.02},d:r=>`Increases Shadow damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_shadow",tree:"shadow",tier:7,max:3,name:"Dark Vigor",eff:{hp:0.03},d:r=>`Increases maximum health by ${+(3.0*r).toFixed(1)}%.`},
    {id:"spiritual",tree:"disc",tier:1,max:3,name:"Spiritual Strength",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"impShield",tree:"disc",tier:1,max:2,name:"Reinforced Barrier",d:r=>`Increases the damage absorbed by Barrier of Light by ${15*r}%.`},
    {id:"p_borrowed",tree:"disc",tier:2,max:3,name:"Borrowed Time",d:r=>`After you cast Barrier of Light, your next spell casts ${10*r}% faster.`},
    {id:"p_agility",tree:"disc",tier:2,max:3,name:"Mental Agility",d:r=>`Reduces the mana cost of your instant spells by ${4*r}%.`},
    {id:"p_focus",tree:"disc",tier:3,max:1,name:"Inner Focus",grants:"innerfocus",d:()=>`Teaches Inner Focus: your next spell costs no mana and has a 25% higher chance to be a critical strike. 1.5 min cooldown.`},
    {id:"p_pi",tree:"disc",tier:4,max:1,name:"Power Infusion",grants:"powerinf",d:()=>`Teaches Power Infusion: increases spell damage and healing by 20% and casting speed by 20% for 15 sec. 2 min cooldown.`},
    {id:"p_painsupp",tree:"disc",tier:5,max:1,name:"Pain Suppression",grants:"painsupp",d:()=>`Teaches Pain Suppression: reduces damage taken by 40% for 8 sec. 2 min cooldown.`},
    {id:"holySpec",tree:"holy",tier:1,max:3,name:"Holy Specialization",d:r=>`Increases critical strike chance with Holy spells by ${3*r}%.`},
    {id:"impHeal",tree:"holy",tier:1,max:3,name:"Improved Healing",d:r=>`Increases healing done by ${10*r}%.`},
    {id:"p_surge",tree:"holy",tier:2,max:3,name:"Surge of Light",d:r=>`Your critical strikes have a ${20*r}% chance to make your next Smite instant and free.`},
    {id:"p_grace",tree:"holy",tier:2,max:3,name:"Divine Grace",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"p_desperate",tree:"holy",tier:3,max:1,name:"Desperate Prayer",grants:"desperate",d:()=>`Teaches Desperate Prayer: instantly heals you for 40% of your maximum health. 2 min cooldown.`},
    {id:"p_empower",tree:"holy",tier:4,max:3,name:"Empowered Healing",d:r=>`Increases the healing of Healing Light and Renewal by ${5*r}% and reduces the cast time of Healing Light by ${(0.1*r).toFixed(1)} sec.`},
    {id:"p_guardian",tree:"holy",tier:5,max:1,name:"Guardian Spirit",grants:"guardian",d:()=>`Teaches Guardian Spirit: for 10 sec, an attack that would kill you leaves you at 40% health instead. 3 min cooldown.`},
    {id:"impSWP",tree:"shadow",tier:1,max:3,name:"Improved Pain",d:r=>`Increases the damage of Shadow Pain by ${10*r}%.`},
    {id:"p_dark",tree:"shadow",tier:1,max:3,name:"Darkness",eff:{shadow:0.03},d:r=>`Increases Shadow spell damage by ${3*r}%.`},
    {id:"shadowWeave",tree:"shadow",tier:2,max:3,name:"Shadow Weave",d:r=>`Increases Shadow spell damage by ${6*r}%.`},
    {id:"p_vamp",tree:"shadow",tier:2,max:3,name:"Vampiric Embrace",d:r=>`Your Shadow damage heals you for ${5*r}% of the damage dealt.`},
    {id:"shadowform",tree:"shadow",tier:3,max:1,name:"Shadowform",d:()=>`Increases Shadow damage by 15% and reduces damage taken by 15%.`},
    {id:"p_affinity",tree:"shadow",tier:4,max:3,name:"Shadow Affinity",d:r=>`Each time Shadow Pain deals damage, you regain ${(0.3*r).toFixed(1)}% of your maximum mana.`},
    {id:"p_void",tree:"shadow",tier:5,max:1,name:"Void Eruption",grants:"voideruption",d:()=>`Teaches Void Eruption: deals Shadow damage to the target and nearby enemies. 15 sec cooldown.`}],
  druid:[
    {id:"t6_balance",tree:"balance",tier:6,max:5,name:"Moonglow",eff:{nature:0.02,arcane:0.02},d:r=>`Increases Nature and Arcane damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_balance",tree:"balance",tier:7,max:3,name:"Celestial Focus",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_feral",tree:"feral",tier:6,max:5,name:"Primal Fury",eff:{form:0.02},d:r=>`Increases damage dealt in Bear and Wolf Form by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_feral",tree:"feral",tier:7,max:3,name:"Hardened Hide",eff:{def:0.02},d:r=>`Reduces damage taken by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t6_resto",tree:"resto",tier:6,max:5,name:"Nature's Gift",eff:{heal:0.02},d:r=>`Increases healing done by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_resto",tree:"resto",tier:7,max:3,name:"Living Spirit",eff:{mana:0.04},d:r=>`Increases maximum mana by ${+(4.0*r).toFixed(1)}%.`},
    {id:"moonfury",tree:"balance",tier:1,max:3,name:"Moonfury",d:r=>`Increases the damage of Nature's Wrath, Moonfire and Starfall by ${8*r}%.`},
    {id:"naturesGrace",tree:"balance",tier:1,max:3,name:"Nature's Grace",d:r=>`Reduces the cast time of Nature's Wrath and Starfall by ${(0.15*r).toFixed(2)} sec.`},
    {id:"d_omen",tree:"balance",tier:2,max:3,name:"Omen of Clarity",d:r=>`Your damaging spells have a ${3*r}% chance to make your next spell cost no mana.`},
    {id:"d_vengeance",tree:"balance",tier:2,max:3,name:"Vengeance",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"d_surge",tree:"balance",tier:3,max:1,name:"Starsurge",grants:"starsurge",d:()=>`Teaches Starsurge: instantly deals Arcane damage. 15 sec cooldown.`},
    {id:"d_owlkin",tree:"balance",tier:4,max:3,name:"Owlkin Frenzy",d:r=>`When you are hit, you have a ${5*r}% chance to make your next Starfall instant.`},
    {id:"d_eclipse",tree:"balance",tier:5,max:1,name:"Eclipse",d:()=>`Critical strikes with Nature's Wrath make your next Starfall instant. Critical strikes with Starfall increase the damage of Nature's Wrath by 30% for 10 sec.`},
    {id:"feral",tree:"feral",tier:1,max:3,name:"Feral Instinct",d:r=>`Increases damage dealt in Bear Form and Wolf Form by ${8*r}%.`},
    {id:"d_dodge",tree:"feral",tier:1,max:3,name:"Wolf Reflexes",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"thickHide",tree:"feral",tier:2,max:2,name:"Thick Hide",d:r=>`Reduces damage taken in Bear Form by ${5*r}%.`},
    {id:"d_primal",tree:"feral",tier:2,max:2,name:"Primal Fury",d:r=>`Your critical strikes in Wolf Form have a ${50*r}% chance to award an extra combo point. In Bear Form they generate ${5*r} rage.`},
    {id:"d_leader",tree:"feral",tier:3,max:1,name:"Leader of the Pack",d:()=>`Your critical strikes in Bear Form and Wolf Form heal you for 4% of your maximum health. Can occur once every 6 sec.`},
    {id:"d_infected",tree:"feral",tier:4,max:2,name:"Infected Wounds",d:r=>`Maul and Claw slow the target by ${25*r}% for 8 sec.`},
    {id:"d_berserk",tree:"feral",tier:5,max:1,name:"Berserk",grants:"berserk",d:()=>`Teaches Berserk: reduces the rage and energy cost of your abilities by 30% for 12 sec. 3 min cooldown.`},
    {id:"impRejuv",tree:"resto",tier:1,max:3,name:"Improved Rejuvenation",d:r=>`Increases healing done by ${10*r}%.`},
    {id:"naturalist",tree:"resto",tier:1,max:3,name:"Naturalist",d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"d_gift",tree:"resto",tier:2,max:3,name:"Gift of Nature",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"d_intensity",tree:"resto",tier:2,max:3,name:"Intensity",d:r=>`Increases your mana regeneration in combat by ${50*r}%.`},
    {id:"d_swift",tree:"resto",tier:3,max:1,name:"Nature's Swiftness",grants:"nswift",d:()=>`Teaches Nature's Swiftness: your next Nature spell with a cast time is instant. 1.5 min cooldown.`},
    {id:"d_ilb",tree:"resto",tier:4,max:2,name:"Improved Lifebloom",d:r=>`Reduces the cooldown of Lifebloom by ${5*r} sec.`},
    {id:"d_tranq",tree:"resto",tier:5,max:1,name:"Tranquility",grants:"tranquility",d:()=>`Teaches Tranquility: heals you for 60% of your maximum health over 8 sec. 3 min cooldown.`}],
  paladin:[
    {id:"t6_pholy",tree:"pholy",tier:6,max:5,name:"Holy Guidance",eff:{heal:0.02},d:r=>`Increases healing done by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_pholy",tree:"pholy",tier:7,max:3,name:"Divine Intellect",eff:{mana:0.04},d:r=>`Increases maximum mana by ${+(4.0*r).toFixed(1)}%.`},
    {id:"t6_pprot",tree:"pprot",tier:6,max:5,name:"Sacred Bulwark",eff:{def:0.015},d:r=>`Reduces damage taken by ${+(1.5*r).toFixed(1)}%.`},
    {id:"t7_pprot",tree:"pprot",tier:7,max:3,name:"Steadfast",eff:{hp:0.03},d:r=>`Increases maximum health by ${+(3.0*r).toFixed(1)}%.`},
    {id:"t6_ret",tree:"ret",tier:6,max:5,name:"Crusade",eff:{holy:0.02,phys:0.02},d:r=>`Increases Holy and physical damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_ret",tree:"ret",tier:7,max:3,name:"Sanctified Strikes",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"palWis",tree:"pholy",tier:1,max:3,name:"Wisdom",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"palHeal",tree:"pholy",tier:1,max:3,name:"Improved Mending",d:r=>`Increases the healing of Light's Mending by ${10*r}%.`},
    {id:"palQuick",tree:"pholy",tier:2,max:2,name:"Swift Prayer",d:r=>`Reduces the cast time of Light's Mending by ${(0.3*r).toFixed(1)} sec.`},
    {id:"pal_hlight",tree:"pholy",tier:2,max:3,name:"Healing Light",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"pal_illum",tree:"pholy",tier:3,max:1,name:"Illumination",d:()=>`Your Holy critical strikes restore 3% of your maximum mana.`},
    {id:"pal_divine",tree:"pholy",tier:4,max:1,name:"Divine Favor",grants:"divinefavor",d:()=>`Teaches Divine Favor: your next Holy spell or attack is a guaranteed critical strike. 1 min cooldown.`},
    {id:"pal_shock",tree:"pholy",tier:5,max:1,name:"Holy Shock",grants:"holyshock",d:()=>`Teaches Holy Shock: instantly deals Holy damage and heals you for the damage dealt. 12 sec cooldown.`},
    {id:"palTough",tree:"pprot",tier:1,max:3,name:"Hardened Faith",eff:{hp:0.05},d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"pal_parry",tree:"pprot",tier:1,max:3,name:"Shield Practice",eff:{parry:0.01},d:r=>`Increases parry chance by ${r}%.`},
    {id:"pal_bastion",tree:"pprot",tier:2,max:3,name:"Bastion",eff:{def:0.03},d:r=>`Reduces damage taken by ${3*r}%.`},
    {id:"pal_redoubt",tree:"pprot",tier:2,max:3,name:"Redoubt",d:r=>`Parrying an attack heals you for ${2*r}% of your maximum health.`},
    {id:"pal_ardent",tree:"pprot",tier:3,max:1,name:"Ardent Defender",d:()=>`While below 35% health, you take 30% less damage.`},
    {id:"pal_reckon",tree:"pprot",tier:4,max:3,name:"Reckoning",d:r=>`When you are hit, you have a ${5*r}% chance to finish the cooldown of Holy Strike.`},
    {id:"pal_avenger",tree:"pprot",tier:5,max:1,name:"Avenger's Shield",grants:"avengershield",d:()=>`Teaches Avenger's Shield: hurls your shield at up to 3 enemies, dealing Holy damage and slowing them. 15 sec cooldown.`},
    {id:"palHoly",tree:"ret",tier:1,max:3,name:"Power of the Light",d:r=>`Increases Holy damage by ${8*r}%.`},
    {id:"pal_conv",tree:"ret",tier:1,max:3,name:"Conviction",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${r}%.`},
    {id:"pal_veng",tree:"ret",tier:2,max:3,name:"Vengeance",d:r=>`Your critical strikes increase your damage by ${3*r}% for 10 sec.`},
    {id:"pal_vindic",tree:"ret",tier:2,max:2,name:"Vindication",d:r=>`Your melee attacks have a ${10*r}% chance to reduce the target's damage by 20% for 10 sec.`},
    {id:"lightbringer",tree:"ret",tier:3,max:1,name:"Lightbringer",d:()=>`Your Holy critical strikes heal you for 30% of the damage dealt.`},
    {id:"pal_aow",tree:"ret",tier:4,max:3,name:"The Art of War",d:r=>`Your melee critical strikes have a ${20*r}% chance to make your next Light's Mending instant.`},
    {id:"pal_storm",tree:"ret",tier:5,max:1,name:"Divine Storm",grants:"divinestorm",d:()=>`Teaches Divine Storm: deals Holy damage to nearby enemies and heals you for part of it. 10 sec cooldown.`}]

  ,warlock:[
    {id:"t6_affl",tree:"affl",tier:6,max:5,name:"Shadow Embrace",eff:{shadow:0.02},d:r=>`Increases Shadow damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_affl",tree:"affl",tier:7,max:3,name:"Fel Vitality",eff:{hp:0.03},d:r=>`Increases maximum health by ${+(3.0*r).toFixed(1)}%.`},
    {id:"t6_demo",tree:"demo",tier:6,max:5,name:"Master Demonologist",eff:{petdmg:0.04},d:r=>`Increases your demon's damage by ${+(4.0*r).toFixed(1)}%.`},
    {id:"t7_demo",tree:"demo",tier:7,max:3,name:"Demonic Resilience",eff:{pethp:0.05},d:r=>`Increases your demon's maximum health by ${+(5.0*r).toFixed(1)}%.`},
    {id:"t6_destr",tree:"destr",tier:6,max:5,name:"Emberstorm",eff:{fire:0.02},d:r=>`Increases Fire damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_destr",tree:"destr",tier:7,max:3,name:"Devastation",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"wl_agony",tree:"affl",tier:1,max:3,name:"Improved Curse of Agony",d:r=>`Increases the damage of Curse of Agony and Corruption by ${10*r}%.`},
    {id:"wl_tap",tree:"affl",tier:1,max:3,name:"Improved Life Tap",d:r=>`Increases the mana gained from Life Tap by ${10*r}%.`},
    {id:"wl_conc",tree:"affl",tier:2,max:3,name:"Fel Concentration",d:r=>`Reduces the casting time lost when you take damage while casting by ${[0,33,66,100][r]}%.`},
    {id:"wl_drain",tree:"affl",tier:2,max:3,name:"Improved Drain Life",d:r=>`Increases the healing of Drain Life by ${20*r}%.`},
    {id:"wl_night",tree:"affl",tier:3,max:1,name:"Nightfall",d:()=>`Your Corruption and Curse of Agony have a 4% chance each time they deal damage to make your next Shadow Bolt instant.`},
    {id:"wl_siphon",tree:"affl",tier:4,max:3,name:"Soul Siphon",d:r=>`Your damage-over-time effects heal you for ${5*r}% of the damage they deal.`},
    {id:"wl_unstable",tree:"affl",tier:5,max:1,name:"Unstable Affliction",grants:"unstable",d:()=>`Teaches Unstable Affliction: Shadow damage over 15 sec. If the target dies while afflicted, the affliction spreads to a nearby enemy.`},
    {id:"wl_pethp",tree:"demo",tier:1,max:3,name:"Fel Vitality",eff:{pethp:0.08},d:r=>`Increases your demon's health by ${8*r}%.`},
    {id:"wl_embrace",tree:"demo",tier:1,max:3,name:"Demonic Embrace",eff:{hp:0.03},d:r=>`Increases maximum health by ${3*r}%.`},
    {id:"wl_dom",tree:"demo",tier:2,max:3,name:"Fel Domination",d:r=>`Reduces the cast time of your summoning spells by ${(1.5*r).toFixed(1)} sec.`},
    {id:"wl_unholy",tree:"demo",tier:2,max:3,name:"Unholy Power",eff:{petdmg:0.08},d:r=>`Increases your demon's damage by ${8*r}%.`},
    {id:"wl_soul",tree:"demo",tier:3,max:1,name:"Soul Link",d:()=>`20% of the damage you take is taken by your demon instead.`},
    {id:"wl_master",tree:"demo",tier:4,max:3,name:"Master Demonologist",d:r=>`Grants you a bonus that depends on your demon. Imp: increases your damage by ${3*r}%. Voidwalker: reduces damage taken by ${3*r}%.`},
    {id:"wl_frenzy",tree:"demo",tier:5,max:1,name:"Demonic Frenzy",grants:"demonfrenzy",d:()=>`Teaches Demonic Frenzy: your demon deals 50% more damage and attacks 30% faster for 10 sec. 1 min cooldown.`},
    {id:"wl_bane",tree:"destr",tier:1,max:3,name:"Bane",d:r=>`Reduces the cast time of Shadow Bolt and Soul Fire by ${(0.1*r).toFixed(1)} sec.`},
    {id:"wl_cata",tree:"destr",tier:1,max:3,name:"Cataclysm",d:r=>`Reduces the mana cost of your Destruction spells by ${3*r}%.`},
    {id:"wl_devast",tree:"destr",tier:2,max:3,name:"Devastation",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"wl_backlash",tree:"destr",tier:2,max:3,name:"Backlash",d:r=>`When an enemy hits you, you have a ${3*r}% chance to make your next Shadow Bolt or Soul Fire instant.`},
    {id:"wl_burn",tree:"destr",tier:3,max:1,name:"Shadowburn",grants:"shadowburn",d:()=>`Teaches Shadowburn: instantly blasts the target with Shadow damage, doubled against enemies below 25% health. 15 sec cooldown.`},
    {id:"wl_after",tree:"destr",tier:4,max:2,name:"Aftermath",d:r=>`Rain of Fire slows enemies by ${25*r}%.`},
    {id:"wl_conflag",tree:"destr",tier:5,max:1,name:"Conflagrate",grants:"conflagrate",d:()=>`Teaches Conflagrate: deals heavy Fire damage to a target burning with your Immolate. 10 sec cooldown.`}],
  rogue:[
    {id:"t6_assa",tree:"assa",tier:6,max:5,name:"Lethality",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t7_assa",tree:"assa",tier:7,max:3,name:"Vile Poisons",eff:{dmg:0.02},d:r=>`Increases all damage dealt by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t6_combat",tree:"combat",tier:6,max:5,name:"Weapon Expertise",eff:{phys:0.02},d:r=>`Increases physical damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_combat",tree:"combat",tier:7,max:3,name:"Lightning Reflexes",eff:{dodge:0.01},d:r=>`Increases your chance to dodge by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_subt",tree:"subt",tier:6,max:5,name:"Elusiveness",eff:{dodge:0.01},d:r=>`Increases your chance to dodge by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t7_subt",tree:"subt",tier:7,max:3,name:"Deadened Nerves",eff:{hp:0.03},d:r=>`Increases maximum health by ${+(3.0*r).toFixed(1)}%.`},
    {id:"r_malice",tree:"assa",tier:1,max:3,name:"Malice",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${r}%.`},
    {id:"r_evisc",tree:"assa",tier:1,max:3,name:"Improved Eviscerate",d:r=>`Increases the damage of Eviscerate and Rupture by ${10*r}%.`},
    {id:"r_lethal",tree:"assa",tier:2,max:3,name:"Lethality",d:r=>`Increases critical strike damage by ${10*r}%.`},
    {id:"r_ruth",tree:"assa",tier:2,max:3,name:"Ruthlessness",d:r=>`Your finishing moves have a ${20*r}% chance to award a combo point.`},
    {id:"r_relentless",tree:"assa",tier:3,max:1,name:"Relentless Strikes",d:()=>`Your finishing moves restore 20 energy.`},
    {id:"r_seal",tree:"assa",tier:4,max:3,name:"Seal Fate",d:r=>`Critical strikes with abilities that award combo points have a ${[0,33,66,100][r]}% chance to award an extra combo point.`},
    {id:"r_cold",tree:"assa",tier:5,max:1,name:"Cold Blood",grants:"coldblood",d:()=>`Teaches Cold Blood: your next ability is a guaranteed critical strike. 1.5 min cooldown.`},
    {id:"r_precision",tree:"combat",tier:1,max:3,name:"Precision",eff:{dmg:0.02},d:r=>`Increases all damage dealt by ${2*r}%.`},
    {id:"r_impss",tree:"combat",tier:1,max:2,name:"Improved Sinister Strike",d:r=>`Reduces the energy cost of Sinister Strike by ${3*r}.`},
    {id:"r_dual",tree:"combat",tier:2,max:3,name:"Dual Wield Specialization",d:r=>`Increases the damage of your off-hand weapon by ${10*r}%.`},
    {id:"r_reflex",tree:"combat",tier:2,max:3,name:"Lightning Reflexes",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"r_bflurry",tree:"combat",tier:3,max:1,name:"Blade Flurry",grants:"bladeflurry",d:()=>`Teaches Blade Flurry: your attacks also strike a nearby enemy for 12 sec. 1 min cooldown.`},
    {id:"r_potency",tree:"combat",tier:4,max:3,name:"Combat Potency",d:r=>`Your off-hand hits have a 20% chance to generate ${5*r} energy.`},
    {id:"r_adren",tree:"combat",tier:5,max:1,name:"Adrenaline Rush",grants:"adrenaline",d:()=>`Teaches Adrenaline Rush: doubles your energy regeneration for 15 sec. 2 min cooldown.`},
    {id:"r_camo",tree:"subt",tier:1,max:3,name:"Camouflage",d:r=>`Reduces the movement speed penalty of Stealth by ${10*r}%.`},
    {id:"r_opp",tree:"subt",tier:1,max:3,name:"Opportunity",d:r=>`Increases the damage of Ambush and Backstab by ${10*r}%.`},
    {id:"r_elusive",tree:"subt",tier:2,max:2,name:"Elusiveness",d:r=>`Reduces the cooldown of Vanish and Evasion by ${30*r} sec.`},
    {id:"r_vigor",tree:"subt",tier:2,max:3,name:"Vigor",eff:{hp:0.03},d:r=>`Increases maximum health by ${3*r}%.`},
    {id:"r_premed",tree:"subt",tier:3,max:1,name:"Premeditation",grants:"premed",d:()=>`Teaches Premeditation: adds 2 combo points to your target. Usable only in Stealth. 1 min cooldown.`},
    {id:"r_init",tree:"subt",tier:4,max:3,name:"Initiative",d:r=>`Ambush has a ${[0,33,66,100][r]}% chance to award an extra combo point.`},
    {id:"r_dance",tree:"subt",tier:5,max:1,name:"Shadow Dance",grants:"shadowdance",d:()=>`Teaches Shadow Dance: for 6 sec, you can use Ambush without being in Stealth. 1 min cooldown.`}],
  shaman:[
    {id:"t6_elem",tree:"elem",tier:6,max:5,name:"Elemental Fury",eff:{nature:0.02,fire:0.02},d:r=>`Increases Nature and Fire damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_elem",tree:"elem",tier:7,max:3,name:"Storm Focus",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_enh",tree:"enh",tier:6,max:5,name:"Weapon Mastery",eff:{phys:0.02},d:r=>`Increases physical damage by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_enh",tree:"enh",tier:7,max:3,name:"Anticipation",eff:{dodge:0.01},d:r=>`Increases your chance to dodge by ${+(1.0*r).toFixed(1)}%.`},
    {id:"t6_sresto",tree:"sresto",tier:6,max:5,name:"Purification",eff:{heal:0.02},d:r=>`Increases healing done by ${+(2.0*r).toFixed(1)}%.`},
    {id:"t7_sresto",tree:"sresto",tier:7,max:3,name:"Ancestral Knowledge",eff:{mana:0.04},d:r=>`Increases maximum mana by ${+(4.0*r).toFixed(1)}%.`},
    {id:"s_concuss",tree:"elem",tier:1,max:3,name:"Concussion",eff:{nature:0.04},d:r=>`Increases Nature damage by ${4*r}%.`},
    {id:"s_flame",tree:"elem",tier:1,max:3,name:"Call of Flame",d:r=>`Increases the damage of Fire totems by ${10*r}%.`},
    {id:"s_efocus",tree:"elem",tier:2,max:3,name:"Elemental Focus",d:r=>`After a spell critical strike, your next 2 spells cost ${15*r}% less mana.`},
    {id:"s_reverb",tree:"elem",tier:2,max:2,name:"Reverberation",d:r=>`Reduces the cooldown of your shocks by ${(0.5*r).toFixed(1)} sec.`},
    {id:"s_em",tree:"elem",tier:3,max:1,name:"Elemental Mastery",grants:"elemmastery",d:()=>`Teaches Elemental Mastery: your next spell is instant and a guaranteed critical strike. 2 min cooldown.`},
    {id:"s_lmastery",tree:"elem",tier:4,max:3,name:"Lightning Mastery",d:r=>`Reduces the cast time of Lightning Bolt and Chain Lightning by ${(0.1*r).toFixed(1)} sec.`},
    {id:"s_overload",tree:"elem",tier:5,max:1,name:"Lightning Overload",d:()=>`Lightning Bolt and Chain Lightning have a 20% chance to strike the target a second time for half damage.`},
    {id:"s_ancest",tree:"enh",tier:1,max:3,name:"Ancestral Knowledge",eff:{mana:0.05},d:r=>`Increases maximum mana by ${5*r}%.`},
    {id:"s_shield",tree:"enh",tier:1,max:3,name:"Shield Specialization",eff:{parry:0.01},d:r=>`Increases parry chance by ${r}%.`},
    {id:"s_thunder",tree:"enh",tier:2,max:3,name:"Thundering Strikes",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"s_tough",tree:"enh",tier:2,max:3,name:"Toughness",eff:{hp:0.04},d:r=>`Increases maximum health by ${4*r}%.`},
    {id:"s_flurry",tree:"enh",tier:3,max:1,name:"Flurry",d:()=>`Your critical strikes make your next 3 auto attacks 30% faster.`},
    {id:"s_maelstrom",tree:"enh",tier:4,max:3,name:"Maelstrom Weapon",d:r=>`Your melee attacks have a ${6*r}% chance to make your next Lightning Bolt or Healing Wave instant.`},
    {id:"s_storm",tree:"enh",tier:5,max:1,name:"Stormstrike",grants:"stormstrike",d:()=>`Teaches Stormstrike: strikes the target with lightning-charged weapons. 10 sec cooldown.`},
    {id:"s_tidal",tree:"sresto",tier:1,max:3,name:"Tidal Focus",eff:{heal:0.03},d:r=>`Increases healing done by ${3*r}%.`},
    {id:"s_totemic",tree:"sresto",tier:1,max:3,name:"Totemic Focus",eff:{mana:0.05},d:r=>`Increases maximum mana by ${5*r}%.`},
    {id:"s_way",tree:"sresto",tier:2,max:3,name:"Healing Way",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"s_guide",tree:"sresto",tier:2,max:3,name:"Nature's Guidance",eff:{crit:0.01,dodge:0.01},d:r=>`Increases critical strike chance and dodge chance by ${r}%.`},
    {id:"s_swift",tree:"sresto",tier:3,max:1,name:"Ancestral Swiftness",grants:"ancswift",d:()=>`Teaches Ancestral Swiftness: your next Lightning Bolt, Chain Lightning or Healing Wave is instant. 1.5 min cooldown.`},
    {id:"s_earthliving",tree:"sresto",tier:4,max:3,name:"Earthliving",d:r=>`Healing Wave also heals you for an additional ${10*r}% of its amount over 6 sec.`},
    {id:"s_tide",tree:"sresto",tier:5,max:1,name:"Mana Tide",grants:"manatide",d:()=>`Teaches Mana Tide: restores 30% of your maximum mana over 12 sec. 3 min cooldown.`}]

};

export const AB_ICON = {
  sprint:["boot","#5fc8e8"], bloodrage:["flame","#d8302a"], meld:["moon","#7a5ab0"], stoneform:["shield","#9a9488"], willdead:["skull","#5ab04a"],
  fireball:["orb","#ff8a3a"], frostbolt:["shard","#8fd8ff"], fireblast:["burst","#ff5a2a"], frostnova:["snowflake","#bfe9ff"], blizzard:["storm","#5fa8e0"],
  pyroblast:["flame","#ffb02e"], sparkrain:["spark","#d38cff"], icearmor:["crystal","#7fd0e8"], icebarrier:["shield","#bfe9ff"], meteor:["meteor","#d8482a"],
  dismisspet:["dismiss","#8a9199"], intimidate:["roar","#e0a050"], bestialwrath:["fang","#ff5a3a"],
  heroic:["sword","#c9ced4"], charge:["dash","#e0a060"], shout:["horn","#d8b070"], rend:["drop","#d0453a"], whirlwind:["whirl","#9fb0bc"],
  execute:["axe","#b03a2e"], shieldbash:["shield","#8a96a2"], secondwind:["heart","#e05a6a"], quake:["quake","#a07850"],
  steady:["arrow","#c8b48a"], firearrow:["firearrow","#ff7a2e"], icearrow:["icearrow","#6fc6f0"], disengage:["leap","#9ccf8a"], multishot:["multi","#d8c08a"],
  aimed:["aim","#e8d070"], poison:["poison","#8fd04a"], snare:["trap","#a8946a"], stormarrow:["bolt","#7fb8ff"],
  resurrection:["halo","#fff2b0"], revive:["halo","#9cf07a"], redemption:["halo","#ffd890"], smite:["sun","#ffe37a"], heal:["cross","#fff2b0"], swp:["skull","#a77bff"], pws:["shield","#f2ecc8"], mindblast:["mind","#c08cff"],
  holynova:["nova","#ffd84a"], renew:["halo","#f0dc90"], darkpulse:["pulse","#7a4ad0"], judgment:["eye","#ffbf3a"],
  wrath:["leaf","#7fdc5a"], touch:["heart","#5fd890"], moonfire:["moon","#d38cff"], rejuv:["sprout","#9cf07a"], roots:["roots","#a0b860"],
  starfire:["star","#e6b8ff"], hurricane:["tornado","#8fd8c8"], bark:["tree","#b08a58"], bloom:["bloom","#ff9ad0"],
  bear:["bear","#c89a68"], cat:["cat","#9cb0c0"], leopard:["paw","#ffd36b"],
  maul:["maul","#d08050"], swipe:["swipe","#c8a070"], frenzy:["plus","#e06060"], bash:["fist","#b89070"], roar:["roar","#e0b050"],
  claw:["claw","#e2e2e2"], rake:["rake","#c84a4a"], bite:["fang","#f0e0c0"], dash:["boot","#7fd8e8"], pounce:["leap","#e8a050"],
  palstrike:["sword","#ffe37a"], palheal:["cross","#ffd890"], hammer:["hammer","#ffd060"], holyshield:["shield","#ffe9a0"], crusader:["axe","#f0c040"],
  consecrate:["ground","#ffd84a"], avenging:["wings","#ffb84a"], bubble:["bubble","#fff6d0"], judge:["scales","#ffcf4a"],
  shadowbolt:["orb","#8a5ad0"], summonimp:["imp","#e0603a"], immolate:["flame","#ff6a2a"], corruption:["drop","#7a4ad0"], agony:["skull","#9a6ae0"], lifetap:["heart","#8a5ad0"],
  drainlife:["drop","#5ad06a"], summonvoid:["void","#6a4ab0"], dismissdemon:["imp","#7a7a8a"], healthfunnel:["heart","#5ad06a"], weakness:["skull","#7a7a8a"],
  rainfire:["meteor","#ff7a2a"], soulfire:["flame","#ff3a1a"], deathcoil:["skull","#5a3a8a"], demonfrenzy:["fang","#b04ae0"],
  sinister:["sword","#e8d84a"], eviscerate:["fang","#d84a42"], stealth:["moon","#5a5a6a"], gouge:["fist","#d8a040"], backstab:["dagger","#e0e0e0"], slicedice:["swipe","#e8d84a"],
  rupture:["rake","#c83a3a"], evasion:["leap","#e8d84a"], ambush:["dagger","#b03a3a"], fanknives:["multi","#d8d8d8"], kidney:["fist","#e0803a"], vanish:["moon","#3a3a4a"], adrenaline:["bolt","#ffd84a"],
  lightning:["bolt","#9fd0ff"], healwave:["wave","#5fc0ff"], earthshock:["quake","#9ad06a"], searing:["totem","#ff7a2a"], flameshock:["flame","#ff8a3a"], stoneskin:["totem","#a89a80"],
  hstream:["totem","#5fc0ff"], lshield:["bubble","#cfe8ff"], chain:["bolt","#e8f4ff"], frostshock:["snowflake","#8fd8ff"], strengthtotem:["totem","#c8a060"], magma:["totem","#d84a1a"], graceair:["totem","#bfe8ff"],
  heroism:["horn","#ffb84a"], stormstrike:["bolt","#7fb8ff"],
};
export function abIcon(id){ const a = AB[id], x = AB_ICON[id]; return x || [a.icon, SCHOOL_COLOR[a.school]==="#f2f2f2"?"#8c939a":SCHOOL_COLOR[a.school]]; }
export function drawIcon(cv, icon, color){
  const g = cv.getContext("2d"), s = cv.width; g.clearRect(0,0,s,s);
  const bg = g.createRadialGradient(s*0.35,s*0.3,2,s/2,s/2,s*0.75); bg.addColorStop(0, color); bg.addColorStop(1, "#0d1216"); g.fillStyle = bg; g.fillRect(0,0,s,s);
  g.save(); g.translate(s/2, s/2); g.scale(s/48, s/48);
  g.strokeStyle = "#fff"; g.fillStyle = "rgba(255,255,255,.92)"; g.lineWidth = 3; g.lineCap = "round"; g.lineJoin = "round";
  const P_ = (pts, fill) => { g.beginPath(); pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y)); if(fill){ g.closePath(); g.fill(); } else g.stroke(); };
  const C = (x,y,r,fill) => { g.beginPath(); g.arc(x,y,r,0,7); fill?g.fill():g.stroke(); };
  switch(icon){
    case "orb": C(4,-3,9,true); P_([[-4,3],[-16,14]]); P_([[0,7],[-10,16]]); break;
    case "shard": P_([[0,-16],[8,0],[0,16],[-8,0]], true); break;
    case "burst": for(let i=0;i<8;i++){ const a=i*Math.PI/4; P_([[Math.cos(a)*5,Math.sin(a)*5],[Math.cos(a)*15,Math.sin(a)*15]]); } break;
    case "nova": C(0,0,5,true); C(0,0,11); C(0,0,17); break;
    case "storm": C(-5,-6,7,true); C(5,-7,8,true); for(let i=-1;i<=1;i++) P_([[i*7,6],[i*7-4,16]]); break;
    case "meteor": C(5,5,10,true); P_([[-3,-3],[-16,-16]]); P_([[2,-6],[-8,-17]]); P_([[-6,2],[-17,-8]]); break;
    case "sword": P_([[-12,12],[12,-12]]); P_([[-14,6],[-6,14]]); break;
    case "axe": P_([[-12,14],[8,-10]]); g.beginPath(); g.arc(8,-10,9,-2.4,0.8); g.fill(); break;
    case "dash": P_([[-14,-10],[-2,0],[-14,10]]); P_([[0,-10],[12,0],[0,10]]); break;
    case "horn": g.beginPath(); g.moveTo(-14,8); g.quadraticCurveTo(0,-14,14,-6); g.lineTo(12,4); g.quadraticCurveTo(0,-4,-10,12); g.closePath(); g.fill(); break;
    case "claw": for(let i=-1;i<=1;i++) P_([[i*8-6,-14],[i*8+6,14]]); break;
    case "whirl": g.beginPath(); for(let a=0;a<12;a+=0.2){ const r=2+a*1.3; const x=Math.cos(a)*r, y=Math.sin(a)*r; a?g.lineTo(x,y):g.moveTo(x,y);} g.stroke(); break;
    case "arrow": case "firearrow": case "icearrow": P_([[-14,14],[12,-12]]); P_([[12,-12],[2,-12],[12,-12],[12,-2]]); P_([[-14,14],[-14,7]]); P_([[-14,14],[-7,14]]);
      if(icon==="firearrow"){ g.fillStyle="#ffd060"; g.beginPath(); g.moveTo(4,-14); g.quadraticCurveTo(0,-20,6,-22); g.quadraticCurveTo(16,-16,14,-4); g.quadraticCurveTo(8,-6,4,-14); g.fill(); }
      if(icon==="icearrow"){ g.fillStyle="#e8fbff"; P_([[12,-18],[16,-12],[12,-6],[8,-12]], true); } break;
    case "multi": for(let i=-1;i<=1;i++) P_([[-12+i*6,12+i*0],[8+i*6,-12]]); break;
    case "leap": g.beginPath(); g.moveTo(12,12); g.quadraticCurveTo(0,-20,-12,4); g.stroke(); P_([[-12,4],[-12,-6],[-12,4],[-3,6]]); break;
    case "aim": C(0,0,11); P_([[0,-17],[0,-6]]); P_([[0,6],[0,17]]); P_([[-17,0],[-6,0]]); P_([[6,0],[17,0]]); C(0,0,2.5,true); break;
    case "sun": C(0,0,7,true); for(let i=0;i<8;i++){ const a=i*Math.PI/4; P_([[Math.cos(a)*11,Math.sin(a)*11],[Math.cos(a)*16,Math.sin(a)*16]]); } break;
    case "cross": g.fillRect(-4,-15,8,30); g.fillRect(-15,-4,30,8); break;
    case "skull": C(0,-3,11,true); g.fillRect(-6,6,12,7); g.fillStyle = "#222"; C(-4,-3,3,true); C(4,-3,3,true); break;
    case "shield": P_([[-12,-13],[12,-13],[11,2],[0,15],[-11,2]], true); break;
    case "mind": C(0,0,13); g.beginPath(); g.ellipse(0,0,13,6,0,0,7); g.stroke(); C(0,0,4,true); break;
    case "leaf": g.beginPath(); g.moveTo(-13,13); g.quadraticCurveTo(-12,-12,13,-13); g.quadraticCurveTo(12,12,-13,13); g.fill(); g.strokeStyle = "#2c5a24"; g.lineWidth = 2; P_([[-11,11],[9,-9]]); break;
    case "moon": C(0,0,13,true); g.globalCompositeOperation = "destination-out"; C(7,-4,11,true); g.globalCompositeOperation = "source-over"; break;
    case "bloom": for(let i=0;i<5;i++){ const a=i*Math.PI*0.4; C(Math.cos(a)*8,Math.sin(a)*8,6,true); } g.fillStyle = "#f2e86b"; C(0,0,4,true); break;
    case "roots": for(let i=-1;i<=1;i++){ g.beginPath(); g.moveTo(i*9,16); g.quadraticCurveTo(i*9+8,0,i*9-2,-15); g.stroke(); } break;
    case "star": { g.beginPath(); for(let i=0;i<10;i++){ const r=i%2?6:16, a=i*Math.PI/5-Math.PI/2; const x=Math.cos(a)*r, y=Math.sin(a)*r; i?g.lineTo(x,y):g.moveTo(x,y);} g.closePath(); g.fill(); } break;
    case "dismiss":   // a small bear and a small wolf side by side
      g.save(); g.translate(-9,2); g.scale(0.55,0.55); C(-10,-9,5.5,true); C(10,-9,5.5,true); C(0,2,13,true); g.fillStyle="#3a3f45"; C(-5,-1,2.2,true); C(5,-1,2.2,true); g.beginPath(); g.ellipse(0,7,5,3.5,0,0,7); g.fill(); g.restore();
      g.save(); g.translate(10,2); g.scale(0.62,0.62); g.fillStyle="rgba(255,255,255,.92)"; P_([[-13,-14],[-6,-4],[6,-4],[13,-14],[13,4],[0,14],[-13,4]], true); g.fillStyle="#3a3f45"; C(-5,1,2.2,true); C(5,1,2.2,true); g.restore(); break;
    case "bear": C(-10,-9,5.5,true); C(10,-9,5.5,true); C(0,2,13,true); g.fillStyle="#3a2a1a"; C(-5,-1,2,true); C(5,-1,2,true); g.beginPath(); g.ellipse(0,7,5,3.5,0,0,7); g.fill(); break;
    case "cat": P_([[-13,-14],[-6,-4],[6,-4],[13,-14],[13,4],[0,14],[-13,4]], true); g.fillStyle = "#222"; C(-5,1,2,true); C(5,1,2,true); break;
    case "fist": g.beginPath(); g.roundRect(-11,-10,22,20,5); g.fill(); g.strokeStyle = "#555"; g.lineWidth = 1.5; for(let i=-1;i<=1;i++) P_([[i*6,-10],[i*6,-2]]); break;
    case "fang": P_([[-14,-10],[14,-10],[8,-10],[4,10],[0,-10],[-4,10],[-8,-10]], true); break;
    case "flask": g.fillRect(-3,-15,6,8); g.beginPath(); g.moveTo(-3,-7); g.lineTo(-12,10); g.quadraticCurveTo(0,17,12,10); g.lineTo(3,-7); g.closePath(); g.fill(); break;
    case "snowflake": for(let i=0;i<6;i++){ const a=i*Math.PI/3, c=Math.cos(a), s2=Math.sin(a); P_([[0,0],[c*16,s2*16]]); P_([[c*9-s2*5,s2*9+c*5],[c*12,s2*12],[c*9+s2*5,s2*9-c*5]]); } break;
    case "flame": g.beginPath(); g.moveTo(0,16); g.bezierCurveTo(-14,12,-12,-2,-4,-8); g.bezierCurveTo(-4,-2,0,0,2,-2); g.bezierCurveTo(0,-8,4,-14,2,-17); g.bezierCurveTo(12,-10,15,6,0,16); g.fill(); g.fillStyle="#ffcf70"; g.beginPath(); g.ellipse(0,9,4,6,0,0,7); g.fill(); break;
    case "spark": for(const [x,y,r] of [[-7,-7,7],[7,-2,5],[-2,9,6]]){ g.beginPath(); for(let i=0;i<8;i++){ const rr=i%2?r*0.3:r, a=i*Math.PI/4; i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);} g.closePath(); g.fill(); } break;
    case "crystal": P_([[0,-17],[11,-6],[7,15],[-7,15],[-11,-6]], true); g.strokeStyle="#3a7a9a"; g.lineWidth=1.5; P_([[0,-17],[0,15]]); P_([[-11,-6],[11,-6]]); break;
    case "drop": g.beginPath(); g.moveTo(0,-16); g.bezierCurveTo(6,-6,12,0,12,6); g.arc(0,6,12,0,Math.PI); g.bezierCurveTo(-12,0,-6,-6,0,-16); g.fill(); break;
    case "heart": g.beginPath(); g.moveTo(0,14); g.bezierCurveTo(-18,2,-14,-16,0,-6); g.bezierCurveTo(14,-16,18,2,0,14); g.fill(); break;
    case "plus": C(0,0,15); g.fillRect(-3,-10,6,20); g.fillRect(-10,-3,20,6); break;
    case "quake": g.fillRect(-17,8,34,4); P_([[-12,8],[-6,-2],[-2,4],[3,-10],[7,0],[12,-6]]); P_([[-4,12],[-2,17]]); P_([[6,12],[9,17]]); break;
    case "poison": g.beginPath(); g.moveTo(0,-16); g.bezierCurveTo(6,-6,12,0,12,6); g.arc(0,6,12,0,Math.PI); g.bezierCurveTo(-12,0,-6,-6,0,-16); g.fill(); g.fillStyle="#2a3a1a"; C(-4,4,2.5,true); C(4,4,2.5,true); g.fillRect(-4,10,8,2); break;
    case "trap": g.beginPath(); g.arc(0,2,13,Math.PI,0); g.stroke(); for(let i=-2;i<=2;i++) P_([[i*5,2-Math.sqrt(169-(i*5)**2)],[i*5,-2]]); g.fillRect(-16,2,32,4); break;
    case "bolt": P_([[4,-17],[-8,2],[0,2],[-4,17],[9,-3],[1,-3]], true); break;
    case "halo": g.beginPath(); g.ellipse(0,-9,12,4,0,0,7); g.stroke(); C(0,5,7,true); break;
    case "pulse": C(0,0,5,true); for(const r of [10,16]){ g.beginPath(); for(let i=0;i<=16;i++){ const a=i*Math.PI/8, rr=r+(i%2?2:-2); i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);} g.stroke(); } break;
    case "eye": g.beginPath(); g.moveTo(-16,0); g.quadraticCurveTo(0,-14,16,0); g.quadraticCurveTo(0,14,-16,0); g.fill(); g.fillStyle="#3a2a10"; C(0,0,5,true); for(let i=0;i<5;i++){ const a=-Math.PI*0.15-i*Math.PI*0.175; P_([[Math.cos(a)*12,Math.sin(a)*12-2],[Math.cos(a)*17,Math.sin(a)*17-2]]); } break;
    case "sprout": P_([[0,16],[0,-2]]); g.beginPath(); g.moveTo(0,0); g.quadraticCurveTo(-14,-2,-12,-14); g.quadraticCurveTo(-2,-12,0,0); g.fill(); g.beginPath(); g.moveTo(0,4); g.quadraticCurveTo(14,2,13,-9); g.quadraticCurveTo(3,-8,0,4); g.fill(); break;
    case "tornado": for(let i=0;i<5;i++){ const w=16-i*3, y=-13+i*6; g.beginPath(); g.ellipse(i*1.2-2,y,w,2.6,0,0,7); g.stroke(); } break;
    case "tree": g.fillRect(-4,2,8,15); C(0,-6,10,true); C(-8,0,6,true); C(8,0,6,true); break;
    case "paw": C(0,6,7,true); C(-9,-3,3.6,true); C(-4,-9,3.6,true); C(4,-9,3.6,true); C(9,-3,3.6,true); P_([[-16,14],[-11,14]]); P_([[11,14],[16,14]]); break;
    case "maul": C(0,7,9,true); for(let i=-1;i<=1;i++){ g.beginPath(); g.moveTo(i*7-3,-2); g.lineTo(i*8,-17); g.lineTo(i*7+3,-2); g.fill(); } break;
    case "swipe": g.beginPath(); g.arc(-4,8,18,-Math.PI*0.55,-Math.PI*0.05); g.stroke(); g.beginPath(); g.arc(-4,8,11,-Math.PI*0.55,-Math.PI*0.05); g.stroke(); P_([[12,0],[15,-6],[8,-4]]); break;
    case "roar": g.beginPath(); g.moveTo(-14,-8); g.lineTo(-2,-2); g.lineTo(-2,2); g.lineTo(-14,8); g.closePath(); g.fill(); for(const r of [6,11,16]){ g.beginPath(); g.arc(-2,0,r,-0.7,0.7); g.stroke(); } break;
    case "rake": for(let i=-1;i<=1;i++){ g.beginPath(); g.moveTo(i*7-8,-14); g.quadraticCurveTo(i*7+4,-2,i*7+4,12); g.stroke(); } g.fillStyle="#7a1a1a"; C(10,14,2.5,true); C(-1,15,2,true); break;
    case "boot": g.beginPath(); g.moveTo(-6,-15); g.lineTo(4,-15); g.lineTo(4,4); g.lineTo(14,8); g.lineTo(14,14); g.lineTo(-6,14); g.closePath(); g.fill(); P_([[-16,-6],[-10,-6]]); P_([[-17,1],[-10,1]]); P_([[-16,8],[-10,8]]); break;
    case "hammer": g.fillRect(-2,-4,4,20); g.beginPath(); g.roundRect(-13,-15,26,11,2); g.fill(); break;
    case "ground": g.fillRect(-17,10,34,5); for(let i=-2;i<=2;i++) P_([[i*6,7],[i*8,-12+Math.abs(i)*4]]); break;
    case "wings": for(const sx of [-1,1]){ g.beginPath(); g.moveTo(sx*2,4); g.quadraticCurveTo(sx*10,-16,sx*17,-12); g.quadraticCurveTo(sx*15,-2,sx*17,0); g.quadraticCurveTo(sx*12,6,sx*15,10); g.quadraticCurveTo(sx*8,10,sx*2,4); g.fill(); } C(0,4,3,true); break;
    case "bubble": C(0,0,15); g.globalAlpha=0.35; C(0,0,15,true); g.globalAlpha=1; g.beginPath(); g.arc(0,0,10,Math.PI*1.1,Math.PI*1.45); g.stroke(); break;
    case "scales": P_([[0,-14],[0,14]]); P_([[-9,14],[9,14]]); P_([[-13,-8],[13,-8]]); P_([[-13,-8],[-17,4],[-9,4],[-13,-8]]); P_([[13,-8],[9,4],[17,4],[13,-8]]); C(0,-14,2.5,true); break;
    case "imp": C(0,3,10,true); P_([[-8,-4],[-13,-16],[-3,-7]], true); P_([[8,-4],[13,-16],[3,-7]], true); g.fillStyle="#3a1a10"; C(-4,2,2.2,true); C(4,2,2.2,true); g.fillRect(-4,8,8,2); break;
    case "void": C(0,0,14); g.beginPath(); for(let a=0;a<10;a+=0.2){ const r=1+a*1.3; const x=Math.cos(a)*r, y=Math.sin(a)*r; a?g.lineTo(x,y):g.moveTo(x,y);} g.stroke(); break;
    case "dagger": P_([[-12,12],[6,-6],[12,-14],[4,-8]], true); P_([[-12,12],[6,-6]]); P_([[-10,2],[2,14]]); break;
    case "totem": g.fillRect(-6,-16,12,32); g.fillStyle="#222"; g.fillRect(-4,-11,3,3); g.fillRect(1,-11,3,3); g.fillRect(-3,-4,6,2); P_([[-12,-14],[-6,-10]]); P_([[12,-14],[6,-10]]); break;
    case "sheep": for(const [x,y] of [[-5,-3],[3,-5],[9,0],[-1,3],[6,5],[-8,4]]) C(x,y,6.5,true); g.fillStyle="#2e2a28"; g.beginPath(); g.ellipse(-14,-3,4.5,5.5,0,0,7); g.fill(); g.fillRect(-6,9,3,7); g.fillRect(4,9,3,7); break;
    case "fear": C(0,0,13,true); g.fillStyle="#2a1030"; g.beginPath(); g.ellipse(-5,-4,2.6,3.6,0,0,7); g.fill(); g.beginPath(); g.ellipse(5,-4,2.6,3.6,0,0,7); g.fill(); g.beginPath(); g.ellipse(0,6,3.8,5.2,0,0,7); g.fill(); P_([[-12,-16],[-8,-11]]); P_([[12,-16],[8,-11]]); break;
    case "wave": for(const y of [-7,1,9]){ g.beginPath(); g.moveTo(-16,y); g.quadraticCurveTo(-8,y-8,0,y); g.quadraticCurveTo(8,y+8,16,y); g.stroke(); } break;
    default: g.font = "800 20px sans-serif"; g.textAlign = "center"; g.fillText("?",0,7);
  }
  g.restore();
}
