// Items and equipment, ported from Rimfrost 1: qualities, slots, armor and weapon types, random gear with stats, potions and loot.
import {CLASSES} from "./rimdata.js";

export const ITEMS = {
  copper:{name:"Copper Ore", sell:2, kind:"ore"}, iron:{name:"Iron Ore", sell:5, kind:"ore"}, goldore:{name:"Gold Ore", sell:10, kind:"ore"},
  obsidian:{name:"Obsidian", sell:15, kind:"ore"}, rimkr:{name:"Rime Crystal", sell:22, kind:"ore"},
  ang:{name:"Meadow Bloom", sell:2, kind:"herb"}, silver:{name:"Silverweed", sell:5, kind:"herb"}, drake:{name:"Dragon's Eye", sell:10, kind:"herb"},
  fireflower:{name:"Fire Bloom", sell:15, kind:"herb"}, moonbloom:{name:"Moonbloom", sell:9, kind:"herb"}, iceflower:{name:"Ice Bloom", sell:22, kind:"herb"},
  potHp:{name:"Healing Potion", sell:3, kind:"use", desc:"Restores 40% of your health."},
  potHp2:{name:"Greater Healing Potion", sell:8, kind:"use", desc:"Restores 75% of your health."},
  potHp3:{name:"Mighty Healing Potion", sell:20, kind:"use", desc:"Fully restores your health."},
  potMana:{name:"Mana Potion", sell:3, kind:"use", desc:"Restores 50% of your mana."},
  potMana2:{name:"Greater Mana Potion", sell:20, kind:"use", desc:"Fully restores your mana."},
  elixir:{name:"Elixir of Strength", sell:10, kind:"use", desc:"Increases damage dealt by 20% for 5 min."},
  elixirIron:{name:"Elixir of Ironskin", sell:8, kind:"use", desc:"Reduces damage taken by 15% for 10 min."},
  elixirKeen:{name:"Elixir of Keenness", sell:14, kind:"use", desc:"Increases critical strike chance by 5% for 10 min."},
  elixirSage:{name:"Elixir of Wisdom", sell:18, kind:"use", desc:"Increases spell power by 20% for 10 min."},
  pelt:{name:"Wolf Pelt", sell:1, kind:"junk"}, tusk:{name:"Boar Tusk", sell:1, kind:"junk"}, silk:{name:"Spider Silk", sell:3, kind:"junk"},
  ring:{name:"Stolen Ring", sell:6, kind:"junk"}, tooth:{name:"Troll Tooth", sell:5, kind:"junk"}, gobtooth:{name:"Goblin Tooth", sell:4, kind:"junk"}, rune:{name:"Runestone", sell:7, kind:"junk"},
  cloth:{name:"Rotten Cloth", sell:6, kind:"junk"}, dust:{name:"Sprite Dust", sell:8, kind:"junk"}, crown:{name:"The Draug Crown", sell:150, kind:"junk"},
  ember:{name:"Glowing Claw", sell:10, kind:"junk"}, cinder:{name:"Slagstone", sell:12, kind:"junk"}, fur:{name:"Frost Fur", sell:14, kind:"junk"},
  shard:{name:"Ice Shard", sell:16, kind:"junk"},
  fang:{name:"Wolf Fang", sell:2, kind:"junk"}, foxpelt:{name:"Fox Pelt", sell:2, kind:"junk"}, jackalpelt:{name:"Jackal Pelt", sell:2, kind:"junk"},
  harepelt:{name:"Hare Pelt", sell:1, kind:"junk"}, deerhide:{name:"Deer Hide", sell:2, kind:"junk"}, antler:{name:"Stag Antler", sell:4, kind:"junk"},
  bearfur:{name:"Bearskin", sell:5, kind:"junk"}, stinger:{name:"Scorpion Stinger", sell:2, kind:"junk"}, thornspike:{name:"Thorn Spike", sell:1, kind:"junk"},
  glowdust:{name:"Wisp Dust", sell:2, kind:"junk"}, candle:{name:"Kobold Candle", sell:2, kind:"junk"}, shell:{name:"Stone Beetle Shell", sell:2, kind:"junk"}, rattail:{name:"Rat Tail", sell:1, kind:"junk"}, goblinear:{name:"Goblin Ear", sell:6, kind:"junk"}, scale:{name:"Dragon Scale", sell:20, kind:"junk"}, stonewing:{name:"Stone Wing", sell:14, kind:"junk"}, heart:{name:"The Giant's Frozen Heart", sell:300, kind:"junk"}, lantern:{name:"Overseer's Lantern", sell:140, kind:"junk"}
};
// what each monster can drop (besides gold and gear): [item, chance]
export const LOOT = {
  wolf:[["pelt",0.4],["fang",0.15]], oldgray:[["pelt",1],["fang",1]], boar:[["tusk",0.4]], thief:[["ring",0.2]], spider:[["silk",0.4]], bandit:[["ring",0.25]],
  lynx:[["foxpelt",0.4]], thorn:[["thornspike",0.4]], wisplight:[["glowdust",0.35]], shadewolf:[["pelt",0.35],["fang",0.2]], lostdruid:[["cloth",0.25]],
  rocksvin:[["tusk",0.35]], kobold:[["candle",0.3]], beetle:[["shell",0.4]], icebear:[["bearfur",0.4]], frostkobold:[["candle",0.3]],
  jackal:[["jackalpelt",0.4]], bristle:[["tusk",0.35]], scorpion:[["stinger",0.4]], raider:[["ring",0.25]], sandgolem:[["rune",0.3]],
  orcwar:[["ring",0.2],["tooth",0.15]], goblin:[["goblinear",0.4],["ring",0.1]], goblinshaman:[["goblinear",0.4],["dust",0.15]], dragon:[["scale",0.9],["ring",0.4]], gargoyle:[["stonewing",0.35],["rune",0.15]],
  troll:[["gobtooth",0.35]], golem:[["rune",0.35]], ghoul:[["cloth",0.35]], wisp:[["dust",0.35]], hound:[["ember",0.35]], elemental:[["cinder",0.35]],
  frostwolf:[["fur",0.4]], icegolem:[["shard",0.35]], rimtroll:[["tooth",0.35]], hare:[["harepelt",0.35]], rat:[["rattail",0.35]], plaguewolf:[["pelt",0.35],["fang",0.15]], shambler:[["cloth",0.3]],
  robber:[["ring",0.25]], boneguard:[["rune",0.25]], plaguebear:[["bearfur",0.35]], deer:[["deerhide",0.35],["antler",0.15]],
  leader:[["ring",1]], morvel:[["dust",1]], snorre:[["ring",1]], garuk:[["tooth",1]], vex:[["dust",1]], boss:[["crown",1]], magma:[["cinder",1]], giant:[["heart",1]],
  gruvkobold:[["candle",0.3]], gruvspindel:[["silk",0.4]], stenvakt:[["rune",0.35]], krakk:[["candle",1]], grottbjorn:[["bearfur",1]], djuptjur:[["tooth",1],["rune",1]],
  kultist:[["cloth",0.35]], drunknad:[["cloth",0.35]], templebloss:[["glowdust",0.4]], hagga:[["goblinear",1]], templevakt:[["stonewing",1]], profeten:[["dust",1]],
  smedjeorc:[["ember",0.35]], eldhund:[["ember",0.35]], levandeglod:[["cinder",0.35]], ignar:[["cinder",1]], magmagargoyl:[["stonewing",1]], eldtyrann:[["cinder",1],["ember",1]],
  isvaktare:[["shard",0.35]], frostulv:[["fur",0.4]], isande:[["dust",0.35]], valvbjorn:[["fur",1]], skrymer:[["tooth",1]], skadi:[["heart",1],["shard",1]]};
// animals, spirits and golems carry no gold
export const BEASTS = new Set(["wolf","oldgray","boar","lynx","thorn","wisplight","shadewolf","rocksvin","beetle","icebear","jackal","bristle","scorpion","spider",
  "hare","deer","rat","plaguewolf","shambler","boneguard","plaguebear","hound","frostwolf","golem","sandgolem","icegolem","elemental","wisp","magma",
  "gruvspindel","stenvakt","grottbjorn","templebloss","eldhund","levandeglod","frostulv","isande","valvbjorn"]);

export const QUAL = [
  {name:"Poor",       color:"#9d9d9d", mult:0.5},
  {name:"Common",      color:"#ffffff", mult:0.8},
  {name:"Uncommon",     color:"#1eff00", mult:1.0},
  {name:"Rare",    color:"#0070dd", mult:1.25},
  {name:"Epic",       color:"#a335ee", mult:1.55},
  {name:"Legendary", color:"#ff8000", mult:1.9}
];
export const SLOTS = {
  head:{name:"Head", w:0.5}, shoulder:{name:"Shoulders", w:0.4}, chest:{name:"Chest", w:0.6}, hands:{name:"Hands", w:0.35},
  legs:{name:"Legs", w:0.55}, feet:{name:"Feet", w:0.35}, weapon:{name:"Weapon", w:1.0}, offhand:{name:"Off-hand", w:0.4},
  neck:{name:"Neck", w:0.3}, ring:{name:"Ring", w:0.3}
};
export const SLOT_ORDER = ["head","neck","shoulder","chest","hands","legs","feet","ring","weapon","offhand"];
// armor types and which classes may use them
export const ARMOR = {
  cloth:{name:"Cloth", cls:["mage","priest"], def:0.10},
  leather:{name:"Leather", cls:["hunter","druid"], def:0.20},
  plate:{name:"Plate", cls:["warrior","paladin"], def:0.30}
};
export const CLASS_ARMOR = {mage:"cloth", priest:"cloth", hunter:"leather", druid:"leather", warrior:"plate", paladin:"plate"};
// weapon / offhand types
export const WTYPES = {
  sword:{name:"Sword", cls:["warrior","paladin"], icon:"sword", base:["Longsword","Broadsword","Blade"]},
  axe:{name:"Axe", cls:["warrior"], icon:"axeDouble", base:["Battleaxe","Cleaver","Hatchet"]},
  mace:{name:"Mace", cls:["paladin"], icon:"hammer", base:["Warhammer","Cudgel","Maul"]},
  bow:{name:"Bow", cls:["hunter"], icon:"bow", base:["Longbow","Hunting Bow","War Bow"]},
  staff:{name:"Staff", cls:["mage","priest","druid"], icon:"upg_wand", base:["Staff","Walking Staff","Runestaff"]},
  wand:{name:"Wand", cls:["mage","priest"], icon:"wand", base:["Wand","Scepter"]},
  shield:{name:"Shield", cls:["warrior","paladin"], icon:"shield", base:["Shield","Buckler","Tower Shield"], off:true},
  tome:{name:"Tome", cls:["mage","priest","druid"], icon:"tome", base:["Tome","Spellbook","Grimoire"], off:true}
};
export const CLASS_WEAP = {warrior:["sword","axe"], paladin:["sword","mace"], hunter:["bow"], mage:["staff","wand"], priest:["staff","wand"], druid:["staff"]};
export const CLASS_OFF = {warrior:["shield"], paladin:["shield"], mage:["tome"], priest:["tome"], druid:["tome"], hunter:[]};
const ARMOR_BASE = {
  cloth:{head:"Hood", shoulder:"Mantle", chest:"Robe", hands:"Gloves", legs:"Trousers", feet:"Slippers"},
  leather:{head:"Leather Cap", shoulder:"Leather Spaulders", chest:"Leather Vest", hands:"Leather Gloves", legs:"Leather Pants", feet:"Leather Boots"},
  plate:{head:"Helm", shoulder:"Pauldrons", chest:"Breastplate", hands:"Gauntlets", legs:"Greaves", feet:"Sabatons"}
};
const JEWEL_BASE = {neck:["Necklace","Amulet","Pendant"], ring:["Ring","Signet","Band"]};
const SLOT_ICON = {head:"helmet", shoulder:"upg_helmet", chest:"armor", hands:"upg_armor", legs:"armor", feet:"upg_armor", neck:"gemBlue", ring:"gemRed"};
export const STAT_NAME = {str:"Strength", agi:"Agility", int:"Intellect", sta:"Stamina", pow:"Attack Power", sp:"Spell Power", sd:"Spell Damage", sh:"Spell Healing", hp:"Health", mana:"Mana", crit:"Critical Strike", def:"Armor"};
// the stats each class gets the most out of (gear for a class rolls these first)
export const CLASS_MAIN = {warrior:["str","sta"], paladin:["str","int","sta"], hunter:["agi","sta"], mage:["int","sta"], priest:["int","sta"], druid:["int","agi","str","sta"]};
const STAT_SUFFIX = {str:"Strength", agi:"Agility", int:"Intellect", sta:"Stamina", pow:"Power", sp:"Sorcery", sd:"Destruction", sh:"Healing", hp:"Endurance", mana:"Wisdom", crit:"Precision", def:"Protection"};
const PREFIX = [["Beggar's","Thrall's","Apprentice's"], [""], [""], ["Warden's","Master's","Knight's","Huntmaster's"], ["Stormcaller's","Nightfall","Runesmith's","Wolfking's"], ["Rimfrost","Ice Giant's","Draugr King's","Elder"]];
export const GEAR_MAX = 30;

export function mulberry(seed){ return ()=>{ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function hashStr(s){ let h = 2166136261; for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h; }
const pickR = (arr, r) => arr[Math.floor(r()*arr.length)];

// which classes can use an item
export function gearClasses(it){ if(it.arm) return ARMOR[it.arm].cls; if(it.wt) return WTYPES[it.wt].cls; return Object.keys(CLASSES); }
export function canWear(it, cls){ return gearClasses(it).includes(cls); }
export function gearTypeName(it){ return it.arm ? ARMOR[it.arm].name : it.wt ? WTYPES[it.wt].name : "Jewelry"; }

// other stats a class can roll on its gear (besides its main stats)
const EXTRA = {warrior:["agi","crit"], paladin:["sh","crit"], hunter:["crit","str"], mage:["sd","crit"], priest:["sh","sd"], druid:["sh","sd","crit"]};
// make one item. opts: {slot, cls, q, il, r}
export function makeGear(opts){
  const r = opts.r || Math.random, q = opts.q, il = Math.max(1, Math.min(30, Math.round(opts.il)));
  const cls = opts.cls || pickR(Object.keys(CLASSES), r);
  let slot = opts.slot;
  if(!slot){ const pool = SLOT_ORDER.filter(s=>s!=="offhand" || CLASS_OFF[cls].length); slot = pickR(pool, r); }
  const it = {id:Math.random().toString(36).slice(2,10), slot, q, il, st:{}};
  if(slot==="weapon") it.wt = pickR(CLASS_WEAP[cls], r);
  else if(slot==="offhand") it.wt = pickR(CLASS_OFF[cls].length ? CLASS_OFF[cls] : ["shield"], r);
  else if(slot!=="neck" && slot!=="ring") it.arm = CLASS_ARMOR[cls];
  // stat budget
  let pts = (4 + il*1.15) * QUAL[q].mult * SLOTS[slot].w * 2;
  const role = ["warrior","hunter"].includes(cls) ? "phys" : ["mage","priest"].includes(cls) ? "caster" : "hybrid";
  const add = (k, p) => { if(p <= 0) return; it.st[k] = (it.st[k]||0) + p; };
  let defShare = it.arm ? ARMOR[it.arm].def : it.wt==="shield" ? 0.4 : 0;
  add("def", pts*defShare); pts *= 1-defShare;
  // weapons: a big helping of the class's damage stat (Strength / Agility for fighters, Spell Power or Spell Damage for casters)
  if(slot==="weapon"){ const fs = cls==="hunter" ? "agi" : "str"; if(role==="phys") add(fs, pts*0.6 * 0.17/0.4*2); else if(role==="caster") add(cls==="priest" ? "sp" : r() < 0.5 ? "sp" : "sd", pts*0.6); else { add(cls==="druid" ? "agi" : "str", pts*0.3 * 0.17/0.4*2); add(cls==="paladin" ? "sh" : "sp", pts*0.3); } pts *= 0.4; }
  else if(it.wt==="tome"){ add(cls==="mage" ? "sd" : cls==="priest" ? "sh" : "sp", pts*0.4); pts *= 0.6; }
  // spread the rest over 1-3 stats (better items get more): always one of the class's main stats first, then others it can use
  const main = CLASS_MAIN[cls], extra = EXTRA[cls], pool = [...main, ...extra];
  const n = q <= 1 ? 1 : q === 2 ? 2 : 3;
  const chosen = [pickR(main, r)]; while(chosen.length < Math.min(n, pool.length)){ const k = pickR(r() < 0.6 ? main : extra, r); if(!chosen.includes(k)) chosen.push(k); }
  const weights = chosen.map(()=>0.5 + r()); const tot = weights.reduce((a,b)=>a+b,0);
  chosen.forEach((k,i)=>add(k, pts*weights[i]/tot));
  // points -> real numbers
  const conv = {str:0.4, agi:0.4, int:0.4, sta:0.3, pow:0.17, sp:0.17, sd:0.17, sh:0.2, hp:2.4, mana:3, crit:0.07, def:0.1};
  for(const k of Object.keys(it.st)){ let v = it.st[k]*conv[k]; v = (k==="crit"||k==="def") ? Math.round(v*10)/10 : Math.round(v); if(v <= 0) delete it.st[k]; else it.st[k] = v; }
  it.n = gearName(it, r); it.en = 1; it.v = 2;
  return it;
}
// gear from before the new stats: Attack Power becomes Strength (Agility for hunters), Health becomes Stamina, Mana becomes Intellect – worth the same as before
export function upgradeGear(it, cls){ if(!it || !it.st || it.v >= 2) return it; const st = it.st;
  if(st.pow){ const k = cls === "hunter" ? "agi" : "str"; st[k] = (st[k] || 0) + Math.max(1, Math.round(st.pow * 2)); delete st.pow; }
  if(st.hp){ st.sta = (st.sta || 0) + Math.max(1, Math.round(st.hp / 10)); delete st.hp; }
  if(st.mana){ st.int = (st.int || 0) + Math.max(1, Math.round(st.mana / 8)); delete st.mana; }
  it.v = 2; return it; }
// item name: [prefix] base [of Suffix], e.g. "Warden's Longsword of Power"
function gearName(it, r){
  const base = it.wt ? pickR(WTYPES[it.wt].base, r) : (it.slot==="neck"||it.slot==="ring") ? pickR(JEWEL_BASE[it.slot], r) : ARMOR_BASE[it.arm][it.slot];
  const pre = pickR(PREFIX[it.q], r);
  const w = k => k==="crit" ? 40 : ["pow","sp","sd","sh","str","agi","int","sta"].includes(k) ? 10 : 1;
  const top = Object.keys(it.st).filter(k=>k!=="def").sort((a,b)=>it.st[b]*w(b) - it.st[a]*w(a))[0];
  return (pre ? pre+" " : "") + base + (it.q >= 2 && top ? " of " + STAT_SUFFIX[top] : "");
}
// old saves have Swedish item names: give them English names once (stats unchanged)
export function rollQuality(src){
  const r = Math.random();
  const table = src==="boss" ? [[3,0.70],[4,0.26],[5,0.04]] : src==="elite" ? [[2,0.55],[3,0.35],[4,0.09],[5,0.01]]
    : [[0,0.45],[1,0.30],[2,0.20],[3,0.045],[4,0.0045],[5,0.0005]];
  let acc = 0; for(const [q,p] of table){ acc += p; if(r < acc) return q; } return table[table.length-1][0];
}
export const gearPrice = it => Math.max(2, Math.round(Math.pow(it.il, 1.5) * QUAL[it.q].mult * SLOTS[it.slot].w * 3 + 3));
export const gearSell = it => Math.max(1, Math.round(gearPrice(it) / 5));
