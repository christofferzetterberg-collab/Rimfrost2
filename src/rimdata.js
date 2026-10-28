// Rimfrost's game data, copied from Rimfrost 1 (races, classes, abilities, action bars, talents and the ability icons).
// Generated: positions inside the ability code use px/py (Rimfrost pixels), the engine converts to 3D units.
/* eslint-disable */
import {P, E, mobs} from "./state.js";
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
const hot = (...a) => E.hot(...a);
const addCP = (...a) => E.addCP(...a);
const addRes = (...a) => E.addRes(...a);
const shieldP = (...a) => E.shieldP(...a);
const pdist = (...a) => E.pdist(...a);
const fmt = (...a) => E.fmt(...a);
const T = (...a) => E.T(...a);
const coopGroupFx = (...a) => E.coopGroupFx(...a);
const petCallCheck = (...a) => E.petCallCheck(...a), petCall = (...a) => E.petCall(...a), petMend = (...a) => E.petMend(...a), petDismiss = (...a) => E.petDismiss(...a), petFight = (...a) => E.petFight(...a), PET_CAST = 10;
const MAX_LVL = 30;
export const HUNTER_MIN = 138;      // bows need at least 6 m to the target (in Rimfrost pixels; 23 px = 1 m)
export const RACES = {
  human:{name:"Human", skin:"#e2b48e", desc:"Experience gained increased by 10%.", hair:"#5b3a22"},
  orc:{name:"Orc", skin:"#6f9a4a", desc:"Damage dealt increased by 10%.", hair:"#1e1e1e"},
  elf:{name:"Elf", skin:"#efd8c8", desc:"Critical strike chance increased by 5%. Maximum mana increased by 10%.", hair:"#e7dca0"},
  dwarf:{name:"Dwarf", skin:"#d9a07c", desc:"Maximum health increased by 15%. Starts with Mining 25.", hair:"#a2462a"},
  undead:{name:"Undead", skin:"#b8c4a8", desc:"Health and mana regeneration out of combat increased by 50%.", hair:"#3a3a3a"}
};

// which classes each race may choose
export const RACE_CLASSES = {
  human:["mage","warrior","priest","druid"],
  orc:["warrior","hunter","mage"],
  elf:["mage","warrior","hunter","priest","druid"],
  dwarf:["warrior","hunter","paladin"],
  undead:["mage","warrior","priest","paladin"]
};
export const CLASSES = {
  mage:{name:"Mage", color:"#4a7be0", res:"mana", hp:0.9, armor:1},
  warrior:{name:"Warrior", color:"#b0763a", res:"rage", hp:1.25, armor:0.80},
  hunter:{name:"Hunter", color:"#5f8f3e", res:"focus", hp:1.05, armor:0.92},
  priest:{name:"Priest", color:"#ecebe2", res:"mana", hp:0.95, armor:1},
  druid:{name:"Druid", color:"#b8742f", res:"mana", hp:1.05, armor:0.95},
  paladin:{name:"Paladin", color:"#e0c050", res:"mana", hp:1.15, armor:0.88}
};
// Balance: damage multiplier per class (applies to direct hits and damage-over-time). 1 = unchanged. Tune these after running the dev balance test.
// Balance: PLAYER_DMG scales ALL player damage (every class). MANA_COST_MULT scales every mana cost, so you can cast more before running dry.
export const PLAYER_DMG = 0.8, MANA_COST_MULT = 0.7;
export const CLASS_DMG = {mage:1.15, warrior:1.15, hunter:1, priest:1, druid:1.10, paladin:0.70};
export const RES_COLOR = {mana:"var(--mana)", rage:"var(--rage)", focus:"var(--focus)", energy:"var(--energy)"};
export const RES_NAME = {mana:"Mana", rage:"Rage", focus:"Focus", energy:"Energy"};
export const SCHOOL_COLOR = {fire:"#ff8a3a", frost:"#8fd8ff", arcane:"#d38cff", nature:"#7fdc5a", holy:"#ffe37a", shadow:"#a77bff", phys:"#f2f2f2"};

// Abilities. run(t) fires when the cast finishes. Helpers (pow, hit, proj, dot...) live in the engine.

export const AB = {
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
  frostnova:{name:"Frost Ring", lvl:6, cost:25, cd:20, range:0, school:"frost", icon:"nova", tgt:"self",
    desc:()=>`Freezes enemies within 4 m in place for 4 sec and deals ${fmt(spow()*0.5)} Frost damage.`,
    run:()=>{ring(P.px,P.py,100,"#bfe9ff");aoe(P.px,P.py,100,m=>{hit(m,spow()*0.5,"frost","frostnova");root(m,4);});}},
  blizzard:{name:"Blizzard", lvl:10, cost:45, cd:12, range:300, school:"frost", icon:"storm", tgt:"enemy",
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
  meteor:{name:"Meteor Fall", lvl:26, cost:60, cd:20, cast:2.5, range:300, school:"fire", icon:"meteor", tgt:"enemy",
    desc:()=>`Calls down a meteor that deals ${fmt(spow()*4.0)} Fire damage to enemies within 4 m of the target.`,
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
    check:t=>t.hp/t.maxHp<0.25||"The target must be below 25% health",
    desc:()=>`Attempts to finish off a wounded enemy, dealing ${fmt(pow()*4.5)} damage. Only usable on enemies below 25% health.`,
    run:t=>{slash(t);hit(t,pow()*4.5,"phys","execute");}},
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
    desc:()=>`Deals ${fmt(pow()*0.8)} damage and slows the target by 60% for 8 sec. Melee range.`,
    run:t=>{ hit(t,pow()*0.8,"phys","wingclip"); slow(t,0.6,8); }},
  steady:{name:"Steady Shot", lvl:1, cost:0, cast:1.5, minRange:HUNTER_MIN, range:320, school:"phys", icon:"arrow", tgt:"enemy",
    desc:()=>`A steady shot that deals ${fmt(pow()*1.3)} damage and generates 12 focus.`,
    run:t=>{ addRes("focus", 12); proj(t,"#e9e2c8",4,()=>hit(t,pow()*1.3,"phys","steady"),"arrow"); }},
  firearrow:{name:"Fire Arrow", lvl:2, cost:30, cd:6, minRange:HUNTER_MIN, range:320, school:"fire", icon:"firearrow", tgt:"enemy",
    desc:()=>`Fires a burning arrow that deals ${fmt(pow()*1.1)} Fire damage and an additional ${fmt(pow()*1.4)} over 6 sec.`,
    run:t=>proj(t,"#ff7a2e",5,()=>{hit(t,pow()*1.1,"fire","firearrow");dot(t,"burn",pow()*1.4*(1+0.15*T("fireArrows")),6,"fire");},"arrow")},
  icearrow:{name:"Cripple Shot", lvl:4, cost:20, cd:8, minRange:HUNTER_MIN, range:320, school:"phys", icon:"icearrow", tgt:"enemy",
    desc:()=>`Cripples the target, reducing its movement speed by ${50+5*T("iceArrows")}% for 8 sec. Deals no damage.`,
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
  touch:{name:"Nature's Touch", lvl:1, cost:25, cast:2.5, range:0, school:"nature", icon:"cross", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.35*(1+0.1*T("impRejuv")))}.`,
    run:()=>{healP(P.maxHp*0.35*(1+0.1*T("impRejuv")));burst(P.px,P.py,"#9cf07a",12);}},
  rejuv:{name:"Lifebud", lvl:4, cost:22, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Heals the target for ${fmt(P.maxHp*0.35*(1+0.1*T("impRejuv")))} over 12 sec.`,
    run:()=>{hot("rejuv",P.maxHp*0.35*(1+0.1*T("impRejuv")),12);burst(P.px,P.py,"#9cf07a",10);}},
  roots:{name:"Entangling Roots", lvl:6, cost:20, cast:1.2, range:290, school:"nature", icon:"roots", tgt:"enemy",
    desc:()=>`Roots the target in place for 8 sec and deals ${fmt(spow()*0.6)} Nature damage.`,
    run:t=>{root(t,8);dot(t,"roots",spow()*0.6,8,"nature");burst(t.px,t.py,"#6a9a3a",10);}},
  starfire:{name:"Starfall", lvl:12, cost:40, cast:3.0, range:300, school:"arcane", icon:"star", tgt:"enemy",
    desc:()=>`Calls down starlight that deals ${fmt(spow()*3.8)} Arcane damage.`,
    run:t=>{burst(t.px,t.py,"#e6b3ff",18);hit(t,spow()*3.8,"arcane","starfire");}},
  hurricane:{name:"Tempest", lvl:16, cost:50, cd:15, range:300, school:"nature", icon:"storm", tgt:"enemy",
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
    desc:()=>`Shapeshift into a bear. Increases health by 60%, reduces damage taken and uses rage. Use again to return to normal form.`,
    run:()=>setForm(P.form==="bear"?null:"bear")},
  cat:{name:"Wolf Form", lvl:15, cost:0, range:0, school:"nature", icon:"cat", tgt:"self", offGcd:true, form:true,
    desc:()=>`Shapeshift into a wolf. Increases movement speed by 30% and uses energy. Use again to return to normal form.`,
    run:()=>setForm(P.form==="cat"?null:"cat")},
  leopard:{name:"Travel Form", lvl:20, cost:0, range:0, school:"nature", icon:"dash", tgt:"self", offGcd:true, form:true,
    desc:()=>`Shapeshift into travel form. Increases movement speed by 60%. Cannot attack or cast spells. Use again to return to normal form.`,
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
  mendpet:{name:"Mend Pet", lvl:7, cost:20, cd:12, range:0, school:"nature", icon:"bloom", tgt:"self",
    desc:()=>`Heals your pet for 40% of its health.`,
    check:()=>(E.pet && !E.pet.dead) ? true : "You have no pet", run:()=>petMend()},
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

export const BARS = {
  mage:["fireball","frostbolt","fireblast","frostnova","blizzard","pyroblast","sparkrain","icearmor","meteor"],
  warrior:["heroic","charge","shout","rend","whirlwind","execute","shieldbash","secondwind","quake"],
  hunter:["steady","raptor","wingclip","firearrow","icearrow","disengage","multishot","aimed","poison","snare","stormarrow","callbear","dismisspet","mendpet","callwolf","intimidate","bestialwrath"],
  priest:["smite","heal","swp","pws","mindblast","holynova","renew","darkpulse","judgment"],
  druid:["wrath","touch","moonfire","rejuv","roots","starfire","hurricane","bark","bloom","bear","cat","leopard"],
  druid_bear:["maul","swipe","frenzy","bash","roar","bear","cat","leopard"],
  druid_cat:["claw","rake","bite","dash","pounce","bear","cat","leopard"],
  druid_leopard:["leopard","bear","cat"],
  paladin:["palstrike","palheal","hammer","holyshield","crusader","consecrate","avenging","bubble","judge"]
};

// the healing abilities: their strength grows with spell healing (and spell power) on your gear and with healing talents
export const HEAL_AB = new Set(["heal", "pws", "holynova", "renew", "touch", "rejuv", "bloom", "palheal"]);
// longer reach for bows and spells: every ranged attack of mages, hunters, priests and druids reaches 25% further
for(const c of ["mage", "hunter", "priest", "druid"]) for(const id of BARS[c]){ const a = AB[id]; if(a && a.tgt === "enemy" && a.range >= 150) a.range = Math.round(a.range * 1.25); }

// Talents: every class has three specializations (trees). A tier opens when you have spent enough points IN THAT TREE: 1:0, 2:3, 3:6, 4:8, 5:10.
// eff = generic bonus per rank: dmg, crit, dodge, parry, def (less damage taken), hp, mana, heal (healing done), form (damage in Bear/Wolf Form),
// petdmg / pethp (hunter pets), and a school name (fire, frost, arcane, nature, holy, shadow, phys) for more damage with that school.
export const TIER_NEED = {1:0, 2:3, 3:6, 4:8, 5:10};
export const TALENT_VERSION = 2;
export const TALENT_CLASS_VER = {hunter: 3};           // a class whose talents changed again gets its points back once more
export const TREES = {
  mage:[{id:"arcane",name:"Arcane",d:"Mana, critical strikes and arcane power."},{id:"fire",name:"Fire",d:"Fire damage and Hot Streak."},{id:"frost",name:"Frost",d:"Control, Shatter and survivability."}],
  warrior:[{id:"arms",name:"Arms",d:"Powerful strikes and bleeds."},{id:"fury",name:"Fury",d:"Sustained damage and critical strikes."},{id:"prot",name:"Protection",d:"Tanking, health and damage reduction."}],
  hunter:[{id:"beast",name:"Beast Mastery",d:"Pet damage, survivability and pet abilities."},{id:"marks",name:"Marksmanship",d:"Critical strikes and Aimed Shot."},{id:"surv",name:"Survival",d:"Elemental arrows and survivability."}],
  priest:[{id:"disc",name:"Discipline",d:"Shields, mana and survivability."},{id:"holy",name:"Holy",d:"Healing."},{id:"shadow",name:"Shadow",d:"Shadow damage and Shadowform."}],
  druid:[{id:"balance",name:"Balance",d:"Nature and Arcane spells."},{id:"feral",name:"Feral",d:"Wolf Form damage and Bear Form tanking."},{id:"resto",name:"Restoration",d:"Healing."}],
  paladin:[{id:"pholy",name:"Holy",d:"Healing and mana."},{id:"pprot",name:"Protection",d:"Tanking, health and damage reduction."},{id:"ret",name:"Retribution",d:"Holy and physical damage."}]
};
export const TALENTS = {
  mage:[
    {id:"arcMind",tree:"arcane",tier:1,max:3,name:"Arcane Mind",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"m_arcfocus",tree:"arcane",tier:1,max:3,name:"Arcane Focus",eff:{arcane:0.08},d:r=>`Increases Arcane spell damage by ${8*r}%.`},
    {id:"m_sharp",tree:"arcane",tier:2,max:3,name:"Keen Mind",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"m_dodge",tree:"arcane",tier:2,max:3,name:"Blink Reflexes",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"m_presence",tree:"arcane",tier:3,max:1,name:"Presence of Mind",eff:{dmg:0.05},d:()=>`Increases all damage dealt by 5%.`},
    {id:"m_arcpow",tree:"arcane",tier:4,max:3,name:"Arcane Power",eff:{arcane:0.05,crit:0.01},d:r=>`Increases Arcane spell damage by ${5*r}% and critical strike chance by ${r}%.`},
    {id:"m_arch",tree:"arcane",tier:5,max:1,name:"Archmage",eff:{dmg:0.1,crit:0.05},d:()=>`Increases all damage dealt by 10% and critical strike chance by 5%.`},
    {id:"impFire",tree:"fire",tier:1,max:3,name:"Burning Soul",d:r=>`Increases Fire spell damage by ${8*r}%.`},
    {id:"quickCast",tree:"fire",tier:1,max:2,name:"Quick Casting",d:r=>`Reduces the cast time of Fireball, Ice Lance and Sunflare by ${(0.25*r).toFixed(2)} sec.`},
    {id:"ignite",tree:"fire",tier:2,max:3,name:"Ignite",d:r=>`Your Fire critical strikes burn the target for an additional ${15*r}% of the damage over 4 sec.`},
    {id:"m_critmass",tree:"fire",tier:2,max:3,name:"Critical Mass",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"hotStreak",tree:"fire",tier:3,max:1,name:"Hot Streak",d:()=>`Critical strikes with Fireball or Ember Blast make your next Sunflare instant.`},
    {id:"m_power",tree:"fire",tier:4,max:3,name:"Elemental Power",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"m_pyro",tree:"fire",tier:5,max:1,name:"Pyromaniac",eff:{fire:0.1,crit:0.03},d:()=>`Increases Fire spell damage by 10% and critical strike chance by 3%.`},
    {id:"iceShards",tree:"frost",tier:1,max:3,name:"Ice Shards",d:r=>`Increases Frost spell damage by ${8*r}%.`},
    {id:"m_frostarmor",tree:"frost",tier:1,max:3,name:"Frost Warding",eff:{def:0.02},d:r=>`Reduces damage taken by ${2*r}%.`},
    {id:"shatter",tree:"frost",tier:2,max:3,name:"Shatter",d:r=>`Increases critical strike chance against slowed or frozen targets by ${12*r}%.`},
    {id:"m_pierce",tree:"frost",tier:2,max:2,name:"Piercing Ice",eff:{frost:0.04},d:r=>`Increases Frost spell damage by ${4*r}%.`},
    {id:"m_barrier",tree:"frost",tier:3,max:1,name:"Ice Barrier",eff:{hp:0.08},d:()=>`Increases maximum health by 8%.`},
    {id:"m_winter",tree:"frost",tier:4,max:3,name:"Winter's Chill",eff:{frost:0.02,crit:0.02},d:r=>`Increases Frost spell damage by ${2*r}% and critical strike chance by ${2*r}%.`},
    {id:"m_icy",tree:"frost",tier:5,max:1,name:"Heart of Winter",eff:{frost:0.1,def:0.05},d:()=>`Increases Frost spell damage by 10% and reduces damage taken by 5%.`}],
  warrior:[
    {id:"impHS",tree:"arms",tier:1,max:3,name:"Improved Strike",d:r=>`Increases the damage of Mighty Strike by ${10*r}%.`},
    {id:"w_weapon",tree:"arms",tier:1,max:3,name:"Weapon Mastery",eff:{phys:0.03},d:r=>`Increases physical damage by ${3*r}%.`},
    {id:"deepWounds",tree:"arms",tier:2,max:3,name:"Deep Wounds",d:r=>`Your critical strikes cause the target to bleed for an additional ${15*r}% of the damage over 4 sec.`},
    {id:"impCharge",tree:"arms",tier:2,max:2,name:"Swift Feet",d:r=>`Charge generates ${10*r} additional rage.`},
    {id:"w_sweep",tree:"arms",tier:3,max:1,name:"Sweeping Strikes",eff:{dmg:0.05},d:()=>`Increases all damage dealt by 5%.`},
    {id:"bloodFury",tree:"arms",tier:4,max:3,name:"Blood Fury",d:r=>`Increases the damage of Whirlwind and Stroke of Mercy by ${10*r}%.`},
    {id:"w_mortal",tree:"arms",tier:5,max:1,name:"Mortal Strikes",eff:{dmg:0.1,crit:0.03},d:()=>`Increases all damage dealt by 10% and critical strike chance by 3%.`},
    {id:"cruelty",tree:"fury",tier:1,max:3,name:"Cruelty",d:r=>`Increases critical strike chance by ${3*r}%.`},
    {id:"w_unbridled",tree:"fury",tier:1,max:3,name:"Unbridled Wrath",eff:{dmg:0.02},d:r=>`Increases all damage dealt by ${2*r}%.`},
    {id:"w_rage",tree:"fury",tier:2,max:3,name:"Warrior's Fury",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"w_enrage",tree:"fury",tier:2,max:3,name:"Enrage",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"bloodthirst",tree:"fury",tier:3,max:1,name:"Bloodthirst",d:()=>`Killing an enemy restores 15% of your maximum health.`},
    {id:"w_flurry",tree:"fury",tier:4,max:3,name:"Flurry",eff:{dmg:0.03},d:r=>`Increases all damage dealt by ${3*r}%.`},
    {id:"w_rampage",tree:"fury",tier:5,max:1,name:"Rampage",eff:{dmg:0.08,crit:0.05},d:()=>`Increases all damage dealt by 8% and critical strike chance by 5%.`},
    {id:"toughness",tree:"prot",tier:1,max:3,name:"Toughness",d:r=>`Increases maximum health by ${6*r}%.`},
    {id:"w_parry",tree:"prot",tier:1,max:3,name:"Art of Parrying",eff:{parry:0.01},d:r=>`Increases parry chance by ${r}%.`},
    {id:"w_will",tree:"prot",tier:2,max:3,name:"Will of Steel",eff:{def:0.03},d:r=>`Reduces damage taken by ${3*r}%.`},
    {id:"w_shield",tree:"prot",tier:2,max:3,name:"Shield Specialization",eff:{parry:0.01,def:0.01},d:r=>`Increases parry chance by ${r}% and reduces damage taken by ${r}%.`},
    {id:"w_last",tree:"prot",tier:3,max:1,name:"Last Stand",eff:{hp:0.1},d:()=>`Increases maximum health by 10%.`},
    {id:"w_defiance",tree:"prot",tier:4,max:3,name:"Defiance",eff:{def:0.02,hp:0.03},d:r=>`Reduces damage taken by ${2*r}% and increases maximum health by ${3*r}%.`},
    {id:"w_unb",tree:"prot",tier:5,max:1,name:"Unconquerable",eff:{hp:0.1,def:0.05},d:()=>`Increases maximum health by 10% and reduces damage taken by 5%.`}],
  hunter:[
    {id:"h_pethp",tree:"beast",tier:1,max:3,name:"Endurance Training",eff:{pethp:0.08},d:r=>`Increases your pet\'s health by ${8*r}%.`},
    {id:"h_throat",tree:"beast",tier:1,max:3,name:"Go for the Throat",d:r=>`Your critical strikes grant your pet ${10*r} rage or energy.`},
    {id:"h_frenzy",tree:"beast",tier:2,max:3,name:"Frenzy",d:r=>`Increases your pet\'s attack speed by ${7*r}%.`},
    {id:"h_mend",tree:"beast",tier:2,max:2,name:"Improved Mend Pet",d:r=>`Increases the healing of Mend Pet by ${25*r}%. Mend Pet also heals you for ${15*r}% of the amount.`},
    {id:"h_intim",tree:"beast",tier:3,max:1,name:"Intimidation",grants:"intimidate",d:()=>`Teaches Intimidation: your pet stuns its target for 3 sec. 30 sec cooldown.`},
    {id:"h_bond",tree:"beast",tier:4,max:3,name:"Spirit Bond",d:r=>`You and your pet regenerate ${(0.6*r).toFixed(1)}% of maximum health every second.`},
    {id:"h_bestial",tree:"beast",tier:5,max:1,name:"Bestial Wrath",grants:"bestialwrath",d:()=>`Teaches Bestial Wrath: your pet deals 50% more damage and attacks 30% faster for 10 sec. 1 min cooldown.`},
    {id:"lethal",tree:"marks",tier:1,max:3,name:"Lethal Shots",d:r=>`Increases critical strike chance by ${3*r}%.`},
    {id:"efficiency",tree:"marks",tier:1,max:2,name:"Efficiency",d:r=>`Reduces the focus cost of your shots by ${10*r}%.`},
    {id:"mortal",tree:"marks",tier:2,max:3,name:"Mortal Shots",d:r=>`Increases critical strike damage by ${10*r}%.`},
    {id:"h_eye",tree:"marks",tier:2,max:3,name:"Eagle Eye",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"trueshot",tree:"marks",tier:3,max:1,name:"Master Marksman",d:()=>`Increases all damage dealt by 10% and reduces the cast time of Aimed Shot by 1 sec.`},
    {id:"h_inst",tree:"marks",tier:4,max:3,name:"Hunter's Instinct",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"h_master",tree:"marks",tier:5,max:1,name:"Master of the Hunt",eff:{dmg:0.1,crit:0.03},d:()=>`Increases all damage dealt by 10% and critical strike chance by 3%.`},
    {id:"fireArrows",tree:"surv",tier:1,max:3,name:"Glowing Arrowheads",d:r=>`Increases the damage of Fire Arrow by ${15*r}%.`},
    {id:"iceArrows",tree:"surv",tier:1,max:3,name:"Crippling Arrows",d:r=>`Increases the slowing effect of Cripple Shot by ${5*r}%.`},
    {id:"h_dodge",tree:"surv",tier:2,max:3,name:"Nimbleness",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"h_survivalist",tree:"surv",tier:2,max:3,name:"Survivalist",eff:{hp:0.03,def:0.01},d:r=>`Increases maximum health by ${3*r}% and reduces damage taken by ${r}%.`},
    {id:"h_venom",tree:"surv",tier:3,max:1,name:"Venom Mastery",eff:{nature:0.15},d:()=>`Increases the damage of Nature shots by 15%.`},
    {id:"h_tactics",tree:"surv",tier:4,max:3,name:"Survival Tactics",eff:{def:0.02},d:r=>`Reduces damage taken by ${2*r}%.`},
    {id:"h_elemental",tree:"surv",tier:5,max:1,name:"Elemental Arrows",eff:{nature:0.1,fire:0.1,frost:0.1},d:()=>`Increases the damage of Fire, Frost and Nature shots by 10%.`}],
  priest:[
    {id:"spiritual",tree:"disc",tier:1,max:3,name:"Spiritual Strength",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"impShield",tree:"disc",tier:1,max:2,name:"Reinforced Barrier",d:r=>`Increases the damage absorbed by Barrier of Light by ${15*r}%.`},
    {id:"p_inner",tree:"disc",tier:2,max:3,name:"Inner Light",eff:{hp:0.05},d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"p_dodge",tree:"disc",tier:2,max:3,name:"Light on Your Feet",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"p_focus",tree:"disc",tier:3,max:1,name:"Inner Focus",eff:{mana:0.1},d:()=>`Increases maximum mana by 10%.`},
    {id:"p_mental",tree:"disc",tier:4,max:3,name:"Mental Strength",eff:{heal:0.03,def:0.02},d:r=>`Increases healing done by ${3*r}% and reduces damage taken by ${2*r}%.`},
    {id:"p_saint",tree:"disc",tier:5,max:1,name:"Saint's Grace",eff:{dmg:0.08,def:0.08},d:()=>`Increases all damage dealt by 8% and reduces damage taken by 8%.`},
    {id:"holySpec",tree:"holy",tier:1,max:3,name:"Holy Specialization",d:r=>`Increases critical strike chance with Holy spells by ${3*r}%.`},
    {id:"impHeal",tree:"holy",tier:1,max:3,name:"Improved Healing",d:r=>`Increases healing done by ${10*r}%.`},
    {id:"p_reach",tree:"holy",tier:2,max:3,name:"Holy Reach",eff:{holy:0.05},d:r=>`Increases Holy spell damage by ${5*r}%.`},
    {id:"p_grace",tree:"holy",tier:2,max:3,name:"Divine Grace",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"p_spirit",tree:"holy",tier:3,max:1,name:"Spirit of Redemption",eff:{heal:0.1},d:()=>`Increases healing done by 10%.`},
    {id:"p_light",tree:"holy",tier:4,max:3,name:"Blessed Light",eff:{heal:0.03,holy:0.03},d:r=>`Increases healing done by ${3*r}% and Holy damage by ${3*r}%.`},
    {id:"p_guardian",tree:"holy",tier:5,max:1,name:"Guardian Spirit",eff:{heal:0.15},d:()=>`Increases healing done by 15%.`},
    {id:"impSWP",tree:"shadow",tier:1,max:3,name:"Improved Pain",d:r=>`Increases the damage of Shadow Pain by ${10*r}%.`},
    {id:"p_dark",tree:"shadow",tier:1,max:3,name:"Darkness",eff:{shadow:0.03},d:r=>`Increases Shadow spell damage by ${3*r}%.`},
    {id:"shadowWeave",tree:"shadow",tier:2,max:3,name:"Shadow Weave",d:r=>`Increases Shadow spell damage by ${6*r}%.`},
    {id:"p_soul",tree:"shadow",tier:2,max:3,name:"Soul Power",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"shadowform",tree:"shadow",tier:3,max:1,name:"Shadowform",d:()=>`Increases Shadow damage by 15% and reduces damage taken by 15%.`},
    {id:"p_misery",tree:"shadow",tier:4,max:3,name:"Misery",eff:{shadow:0.03,crit:0.01},d:r=>`Increases Shadow spell damage by ${3*r}% and critical strike chance by ${r}%.`},
    {id:"p_void",tree:"shadow",tier:5,max:1,name:"Embrace of the Void",eff:{shadow:0.1,hp:0.05},d:()=>`Increases Shadow spell damage by 10% and maximum health by 5%.`}],
  druid:[
    {id:"moonfury",tree:"balance",tier:1,max:3,name:"Moonfury",d:r=>`Increases the damage of Nature's Wrath, Moonfire and Starfall by ${8*r}%.`},
    {id:"naturesGrace",tree:"balance",tier:1,max:3,name:"Nature's Grace",d:r=>`Reduces the cast time of Nature's Wrath and Starfall by ${(0.15*r).toFixed(2)} sec.`},
    {id:"d_starlight",tree:"balance",tier:2,max:3,name:"Starlight",eff:{arcane:0.04,nature:0.04},d:r=>`Increases Arcane and Nature spell damage by ${4*r}%.`},
    {id:"d_vengeance",tree:"balance",tier:2,max:3,name:"Vengeance",eff:{crit:0.02},d:r=>`Increases critical strike chance by ${2*r}%.`},
    {id:"d_moonkin",tree:"balance",tier:3,max:1,name:"Moonkin Spirit",eff:{dmg:0.05,def:0.05},d:()=>`Increases all damage dealt by 5% and reduces damage taken by 5%.`},
    {id:"d_prim",tree:"balance",tier:4,max:3,name:"Primal Power",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"d_eclipse",tree:"balance",tier:5,max:1,name:"Eclipse",eff:{arcane:0.1,nature:0.1},d:()=>`Increases Arcane and Nature spell damage by 10%.`},
    {id:"feral",tree:"feral",tier:1,max:3,name:"Feral Instinct",d:r=>`Increases damage dealt in Bear Form and Wolf Form by ${8*r}%.`},
    {id:"d_dodge",tree:"feral",tier:1,max:3,name:"Wolf Reflexes",eff:{dodge:0.01},d:r=>`Increases dodge chance by ${r}%.`},
    {id:"thickHide",tree:"feral",tier:2,max:2,name:"Thick Hide",d:r=>`Reduces damage taken in Bear Form by ${5*r}%.`},
    {id:"d_claws",tree:"feral",tier:2,max:3,name:"Sharpened Claws",eff:{form:0.05},d:r=>`Increases damage dealt in Bear Form and Wolf Form by ${5*r}%.`},
    {id:"heartWild",tree:"feral",tier:3,max:1,name:"Heart of the Wild",d:()=>`Increases all damage dealt by 10% and health in Bear Form by 10%.`},
    {id:"d_oak",tree:"feral",tier:4,max:3,name:"Strength of the Oak",eff:{hp:0.05},d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"d_primal",tree:"feral",tier:5,max:1,name:"Primal Fury",eff:{form:0.1,def:0.05},d:()=>`Increases damage dealt in Bear Form and Wolf Form by 10% and reduces damage taken by 5%.`},
    {id:"impRejuv",tree:"resto",tier:1,max:3,name:"Improved Rejuvenation",d:r=>`Increases healing done by ${10*r}%.`},
    {id:"naturalist",tree:"resto",tier:1,max:3,name:"Naturalist",d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"d_gift",tree:"resto",tier:2,max:3,name:"Gift of Nature",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"d_intensity",tree:"resto",tier:2,max:3,name:"Intensity",eff:{mana:0.05},d:r=>`Increases maximum mana by ${5*r}%.`},
    {id:"d_swift",tree:"resto",tier:3,max:1,name:"Nature's Swiftness",eff:{heal:0.08},d:()=>`Increases healing done by 8%.`},
    {id:"d_living",tree:"resto",tier:4,max:3,name:"Living Spirit",eff:{heal:0.03,hp:0.02},d:r=>`Increases healing done by ${3*r}% and maximum health by ${2*r}%.`},
    {id:"d_grove",tree:"resto",tier:5,max:1,name:"Tree of Life",eff:{heal:0.12,hp:0.08},d:()=>`Increases healing done by 12% and maximum health by 8%.`}],
  paladin:[
    {id:"palWis",tree:"pholy",tier:1,max:3,name:"Wisdom",d:r=>`Increases maximum mana by ${10*r}%.`},
    {id:"palHeal",tree:"pholy",tier:1,max:3,name:"Improved Mending",d:r=>`Increases the healing of Light's Mending by ${10*r}%.`},
    {id:"palQuick",tree:"pholy",tier:2,max:2,name:"Swift Prayer",d:r=>`Reduces the cast time of Light's Mending by ${(0.3*r).toFixed(1)} sec.`},
    {id:"pal_hlight",tree:"pholy",tier:2,max:3,name:"Healing Light",eff:{heal:0.04},d:r=>`Increases healing done by ${4*r}%.`},
    {id:"pal_illum",tree:"pholy",tier:3,max:1,name:"Illumination",eff:{mana:0.1},d:()=>`Increases maximum mana by 10%.`},
    {id:"pal_divine",tree:"pholy",tier:4,max:3,name:"Divine Favor",eff:{heal:0.03,holy:0.02},d:r=>`Increases healing done by ${3*r}% and Holy damage by ${2*r}%.`},
    {id:"pal_beacon",tree:"pholy",tier:5,max:1,name:"Beacon of Light",eff:{heal:0.15},d:()=>`Increases healing done by 15%.`},
    {id:"palTough",tree:"pprot",tier:1,max:3,name:"Hardened Faith",eff:{hp:0.05},d:r=>`Increases maximum health by ${5*r}%.`},
    {id:"pal_parry",tree:"pprot",tier:1,max:3,name:"Shield Practice",eff:{parry:0.01},d:r=>`Increases parry chance by ${r}%.`},
    {id:"pal_bastion",tree:"pprot",tier:2,max:3,name:"Bastion",eff:{def:0.03},d:r=>`Reduces damage taken by ${3*r}%.`},
    {id:"pal_redoubt",tree:"pprot",tier:2,max:3,name:"Redoubt",eff:{def:0.01,hp:0.02},d:r=>`Reduces damage taken by ${r}% and increases maximum health by ${2*r}%.`},
    {id:"pal_ardent",tree:"pprot",tier:3,max:1,name:"Ardent Defender",eff:{hp:0.1},d:()=>`Increases maximum health by 10%.`},
    {id:"pal_guard",tree:"pprot",tier:4,max:3,name:"Guarded by the Light",eff:{def:0.02},d:r=>`Reduces damage taken by ${2*r}%.`},
    {id:"pal_aegis",tree:"pprot",tier:5,max:1,name:"Aegis",eff:{def:0.06,hp:0.06},d:()=>`Reduces damage taken by 6% and increases maximum health by 6%.`},
    {id:"palHoly",tree:"ret",tier:1,max:3,name:"Power of the Light",d:r=>`Increases Holy damage by ${8*r}%.`},
    {id:"pal_conv",tree:"ret",tier:1,max:3,name:"Conviction",eff:{crit:0.01},d:r=>`Increases critical strike chance by ${r}%.`},
    {id:"pal_zeal",tree:"ret",tier:2,max:3,name:"Holy Zeal",eff:{dmg:0.04},d:r=>`Increases all damage dealt by ${4*r}%.`},
    {id:"pal_vindic",tree:"ret",tier:2,max:3,name:"Vindication",eff:{phys:0.04},d:r=>`Increases physical damage by ${4*r}%.`},
    {id:"lightbringer",tree:"ret",tier:3,max:1,name:"Lightbringer",d:()=>`Your Holy critical strikes heal you for 30% of the damage dealt.`},
    {id:"pal_sanct",tree:"ret",tier:4,max:3,name:"Sanctified Wrath",eff:{holy:0.03,dmg:0.02},d:r=>`Increases Holy damage by ${3*r}% and all damage dealt by ${2*r}%.`},
    {id:"pal_champ",tree:"ret",tier:5,max:1,name:"Champion of the Light",eff:{dmg:0.08,hp:0.08},d:()=>`Increases all damage dealt by 8% and maximum health by 8%.`}]
};

export const AB_ICON = {
  fireball:["orb","#ff8a3a"], frostbolt:["shard","#8fd8ff"], fireblast:["burst","#ff5a2a"], frostnova:["snowflake","#bfe9ff"], blizzard:["storm","#5fa8e0"],
  pyroblast:["flame","#ffb02e"], sparkrain:["spark","#d38cff"], icearmor:["crystal","#7fd0e8"], meteor:["meteor","#d8482a"],
  dismisspet:["dismiss","#8a9199"], intimidate:["roar","#e0a050"], bestialwrath:["fang","#ff5a3a"],
  heroic:["sword","#c9ced4"], charge:["dash","#e0a060"], shout:["horn","#d8b070"], rend:["drop","#d0453a"], whirlwind:["whirl","#9fb0bc"],
  execute:["axe","#b03a2e"], shieldbash:["shield","#8a96a2"], secondwind:["heart","#e05a6a"], quake:["quake","#a07850"],
  steady:["arrow","#c8b48a"], firearrow:["firearrow","#ff7a2e"], icearrow:["icearrow","#6fc6f0"], disengage:["leap","#9ccf8a"], multishot:["multi","#d8c08a"],
  aimed:["aim","#e8d070"], poison:["poison","#8fd04a"], snare:["trap","#a8946a"], stormarrow:["bolt","#7fb8ff"],
  smite:["sun","#ffe37a"], heal:["cross","#fff2b0"], swp:["skull","#a77bff"], pws:["shield","#f2ecc8"], mindblast:["mind","#c08cff"],
  holynova:["nova","#ffd84a"], renew:["halo","#f0dc90"], darkpulse:["pulse","#7a4ad0"], judgment:["eye","#ffbf3a"],
  wrath:["leaf","#7fdc5a"], touch:["heart","#5fd890"], moonfire:["moon","#d38cff"], rejuv:["sprout","#9cf07a"], roots:["roots","#a0b860"],
  starfire:["star","#e6b8ff"], hurricane:["tornado","#8fd8c8"], bark:["tree","#b08a58"], bloom:["bloom","#ff9ad0"],
  bear:["bear","#c89a68"], cat:["cat","#9cb0c0"], leopard:["paw","#ffd36b"],
  maul:["maul","#d08050"], swipe:["swipe","#c8a070"], frenzy:["plus","#e06060"], bash:["fist","#b89070"], roar:["roar","#e0b050"],
  claw:["claw","#e2e2e2"], rake:["rake","#c84a4a"], bite:["fang","#f0e0c0"], dash:["boot","#7fd8e8"], pounce:["leap","#e8a050"],
  palstrike:["sword","#ffe37a"], palheal:["cross","#ffd890"], hammer:["hammer","#ffd060"], holyshield:["shield","#ffe9a0"], crusader:["axe","#f0c040"],
  consecrate:["ground","#ffd84a"], avenging:["wings","#ffb84a"], bubble:["bubble","#fff6d0"], judge:["scales","#ffcf4a"],
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
    default: g.font = "800 20px sans-serif"; g.textAlign = "center"; g.fillText("?",0,7);
  }
  g.restore();
}
