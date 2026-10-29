// Rimfrost 1's monsters: names, levels, sizes, speeds and special attacks, turned into 3D models and Rimfrost 2 stats.
import * as THREE from "three";
import {makeAvatar} from "./avatar.js";
import {makeMobAnimal} from "./beasts.js";
import {makeHumanoid, makeBeast, makeSpider, makeTroll, makeCultist, makeSkeleton, makeKobold, makeGolem, makeWisp, makeCritter, makeGhoul, makeDraug, makeDrowned, makeDrake, makeGargoyle} from "./models.js";

// r = size, sp = speed (Rimfrost 1 pixels), elite = strength, special = a big attack you must step away from
const ELITE_HP = 1.5, BOSS_HP = 1.5;   // extra health for elites (on top of their strength) and bosses
const MOBS = {
  // human start zones
  wolf: {name: "Gray Wolf", lv: [1, 3], color: "#8b9196", r: 11, sp: 95, shape: "wolf"},
  boar: {name: "Wild Boar", lv: [2, 4], color: "#80543a", r: 12, sp: 85, shape: "boar"},
  thief: {name: "Barn Thief", lv: [3, 5], color: "#6a5a3a", r: 11, sp: 90, shape: "humanoid"},
  oldgray: {name: "Old Gray", lv: [5, 5], color: "#d5d9dc", r: 14, sp: 100, shape: "wolf", elite: 2},
  spider: {name: "Forest Spider", lv: [5, 8], color: "#3e3a4a", r: 11, sp: 100, shape: "spider"},
  bandit: {name: "Bandit", lv: [6, 9], color: "#8a2f2f", r: 11, sp: 92, shape: "humanoid"},
  leader: {name: "Chieftain Grimm", lv: [10, 10], color: "#b0241f", r: 15, sp: 92, shape: "humanoid", elite: 4, special: {name: "Whirling Slash", every: 9, r: 95, windup: 1.4, mult: 2.2}},
  // elf
  lynx: {name: "Forest Fox", lv: [1, 3], color: "#c4a070", r: 11, sp: 100, shape: "wolf"},
  thorn: {name: "Thorn Creeper", lv: [2, 4], color: "#5f8a3a", r: 11, sp: 90, shape: "spider"},
  wisplight: {name: "Will-o'-Wisp", lv: [3, 5], color: "#a8f0c0", r: 9, sp: 85, shape: "wisp", ranged: 200},
  shadewolf: {name: "Shadow Wolf", lv: [5, 8], color: "#4a3d66", r: 12, sp: 100, shape: "wolf"},
  lostdruid: {name: "Lost Druid", lv: [6, 9], color: "#3d6a5a", r: 11, sp: 88, shape: "humanoid", ranged: 200},
  morvel: {name: "Morvel the Nightwatcher", lv: [10, 10], color: "#6b5a9a", r: 15, sp: 90, shape: "ghoul", elite: 4, special: {name: "Shadow Wave", every: 9, r: 100, windup: 1.4, mult: 2.2}},
  // dwarf
  rocksvin: {name: "Crag Boar", lv: [1, 3], color: "#8a8f96", r: 12, sp: 85, shape: "boar"},
  kobold: {name: "Cave Kobold", lv: [2, 5], color: "#c9a24a", r: 9, sp: 95, shape: "humanoid"},
  beetle: {name: "Stone Beetle", lv: [3, 5], color: "#7a5a3a", r: 11, sp: 80, shape: "spider"},
  icebear: {name: "Ice Bear", lv: [5, 8], color: "#e8eef2", r: 14, sp: 90, shape: "boar"},
  frostkobold: {name: "Frost Kobold", lv: [6, 9], color: "#8ab0c8", r: 9, sp: 95, shape: "humanoid"},
  snorre: {name: "Snorre the Kobold King", lv: [10, 10], color: "#e0b040", r: 14, sp: 92, shape: "humanoid", elite: 4, special: {name: "Avalanche", every: 9, r: 100, windup: 1.4, mult: 2.2}},
  // orc
  jackal: {name: "Steppe Jackal", lv: [1, 3], color: "#c49a5a", r: 11, sp: 100, shape: "wolf"},
  bristle: {name: "Bristleboar", lv: [2, 4], color: "#6a4a30", r: 12, sp: 85, shape: "boar"},
  scorpion: {name: "Scorpion", lv: [3, 5], color: "#b0402a", r: 11, sp: 90, shape: "spider"},
  raider: {name: "Canyon Raider", lv: [5, 8], color: "#8a6a3a", r: 11, sp: 92, shape: "humanoid"},
  sandgolem: {name: "Sand Golem", lv: [6, 9], color: "#c8a870", r: 14, sp: 72, shape: "golem"},
  garuk: {name: "Warlord Garuk", lv: [10, 10], color: "#5a7a3a", r: 15, sp: 92, shape: "troll", elite: 4, special: {name: "War Stomp", every: 9, r: 100, windup: 1.4, mult: 2.2}},
  // undead
  rat: {name: "Grave Rat", lv: [1, 3], color: "#5a5a5a", r: 8, sp: 105, shape: "critter"},
  plaguewolf: {name: "Plague Wolf", lv: [2, 4], color: "#7a9a40", r: 11, sp: 100, shape: "wolf"},
  shambler: {name: "Shambling Skeleton", lv: [3, 5], color: "#c8c8b0", r: 11, sp: 80, shape: "humanoid"},
  robber: {name: "Grave Robber", lv: [5, 8], color: "#6a5a4a", r: 11, sp: 92, shape: "humanoid"},
  boneguard: {name: "Bone Guardian", lv: [6, 9], color: "#d8d8c8", r: 12, sp: 85, shape: "humanoid"},
  plaguebear: {name: "Plague Bear", lv: [6, 9], color: "#6a8a40", r: 14, sp: 90, shape: "boar"},
  vex: {name: "Vex the Necromancer", lv: [10, 10], color: "#7a5aa0", r: 15, sp: 88, shape: "humanoid", elite: 4, ranged: 200, special: {name: "Death Wave", every: 9, r: 100, windup: 1.4, mult: 2.2}},
  // critters (they only fight back)
  hare: {name: "Hare", lv: [1, 2], color: "#a07850", r: 7, sp: 110, shape: "critter", passive: true},
  deer: {name: "Red Deer", lv: [3, 6], color: "#7a5a40", r: 13, sp: 100, shape: "critter", passive: true},
  // shared zones
  orcwar: {name: "Ironclan Warrior", lv: [11, 14], color: "#6a8a3a", r: 12, sp: 92, shape: "humanoid"},
  troll: {name: "Goblin", lv: [10, 13], color: "#7a8a3a", r: 10, sp: 98, shape: "humanoid"},
  golem: {name: "Stone Golem", lv: [12, 15], color: "#878275", r: 15, sp: 70, shape: "golem"},
  ghoul: {name: "Marsh Ghoul", lv: [15, 18], color: "#62744a", r: 12, sp: 100, shape: "ghoul"},
  wisp: {name: "Mist Sprite", lv: [16, 19], color: "#b4d6e4", r: 10, sp: 90, shape: "wisp", ranged: 220},
  goblin: {name: "Marsh Goblin", lv: [15, 18], color: "#7a8a3a", r: 10, sp: 100, shape: "humanoid"},
  goblinshaman: {name: "Goblin Shaman", lv: [16, 19], color: "#a77bff", r: 10, sp: 92, shape: "humanoid", ranged: 200},
  dragon: {name: "Marsh Drake", lv: [19, 20], color: "#3a8a4a", r: 18, sp: 88, shape: "drake", elite: 2, special: {name: "Venom Breath", every: 10, r: 90, windup: 1.4, mult: 1.8}},
  gargoyle: {name: "Ash Gargoyle", lv: [21, 24], color: "#6a6a70", r: 12, sp: 100, shape: "humanoid"},
  hound: {name: "Ash Hound", lv: [20, 23], color: "#8a3a2a", r: 12, sp: 105, shape: "wolf"},
  elemental: {name: "Ember Spirit", lv: [22, 25], color: "#ff9a4a", r: 10, sp: 85, shape: "wisp", ranged: 220},
  magma: {name: "The Magma Lord", lv: [25, 25], color: "#c2451f", r: 18, sp: 85, shape: "golem", elite: 5, boss: true, special: {name: "Lava Eruption", every: 8, r: 110, windup: 1.5, mult: 2.4}},
  frostwolf: {name: "Frost Wolf", lv: [25, 28], color: "#cfe3ee", r: 12, sp: 105, shape: "wolf"},
  icegolem: {name: "Ice Golem", lv: [26, 29], color: "#8fc4dc", r: 15, sp: 72, shape: "golem"},
  rimtroll: {name: "Rime Troll", lv: [27, 30], color: "#9ab8c8", r: 14, sp: 88, shape: "troll"},
  giant: {name: "Hrimgar the Ice Giant", lv: [30, 30], color: "#a8d8ec", r: 22, sp: 85, shape: "troll", elite: 7, boss: true, special: {name: "Glacier Crush", every: 7, r: 135, windup: 1.5, mult: 2.6}},
  // the Draug King's crypt
  boss: {name: "The Draug King", lv: [20, 20], color: "#7cb3c4", r: 20, sp: 85, shape: "draug", elite: 6, boss: true, dg: 1, special: {name: "Grave Strike", every: 8, r: 125, windup: 1.6, mult: 2.6}},
  cryptguard: {name: "Draug Warrior", lv: [19, 20], color: "#8aa4ac", r: 12, sp: 88, shape: "humanoid", dg: 1, hpm: 1.25, dmm: 1.1},
  cryptpriest: {name: "Crypt Priest", lv: [19, 20], color: "#4a5a6a", r: 11, sp: 85, shape: "humanoid", ranged: 210, dg: 1, hpm: 1.25, dmm: 1.1},
  cryptghoul: {name: "Crypt Ghoul", lv: [19, 20], color: "#6a7a6a", r: 12, sp: 100, shape: "ghoul", dg: 1, hpm: 1.25, dmm: 1.1},
  // the Iron Mine
  gruvkobold: {name: "Mine Kobold", lv: [12, 14], color: "#c9a24a", r: 9, sp: 95, shape: "humanoid", dg: 1, hpm: 1.25, dmm: 1.1},
  gruvspindel: {name: "Mine Spider", lv: [12, 14], color: "#4a4038", r: 11, sp: 100, shape: "spider", dg: 1, hpm: 1.25, dmm: 1.1},
  stenvakt: {name: "Stone Sentinel", lv: [13, 14], color: "#8a8478", r: 14, sp: 72, shape: "golem", dg: 1, hpm: 1.25, dmm: 1.1},
  krakk: {name: "Foreman Krakk", lv: [15, 15], color: "#e0b040", r: 12, sp: 92, shape: "humanoid", elite: 3, dg: 1, hpm: 1.3, special: {name: "Pickaxe Strike", every: 9, r: 85, windup: 1.3, mult: 2.0}},
  grottbjorn: {name: "The Cave Bear", lv: [15, 15], color: "#5a4a3a", r: 15, sp: 92, shape: "boar", elite: 3, dg: 1, hpm: 1.3, special: {name: "Rampage", every: 9, r: 90, windup: 1.3, mult: 2.0}},
  djuptjur: {name: "The Bull from the Deep", lv: [16, 16], color: "#7a2a1a", r: 20, sp: 88, shape: "troll", elite: 4, boss: true, dg: 1, hpm: 1.5, special: {name: "Mountain Slam", every: 8, r: 115, windup: 1.5, mult: 2.4}},
  // the Drowned Temple
  kultist: {name: "Marsh Cultist", lv: [17, 19], color: "#4a6a4a", r: 11, sp: 90, shape: "humanoid", ranged: 200, dg: 1, hpm: 1.25, dmm: 1.1},
  drunknad: {name: "The Drowned One", lv: [17, 19], color: "#7a9a7a", r: 11, sp: 82, shape: "humanoid", dg: 1, hpm: 1.25, dmm: 1.1},
  templebloss: {name: "Temple Wisp", lv: [18, 19], color: "#9ef0b0", r: 9, sp: 85, shape: "wisp", ranged: 210, dg: 1, hpm: 1.25, dmm: 1.1},
  hagga: {name: "Hagga the Marsh Witch", lv: [20, 20], color: "#a77bff", r: 12, sp: 90, shape: "humanoid", elite: 3, ranged: 220, dg: 1, hpm: 1.3, special: {name: "Curse", every: 9, r: 90, windup: 1.3, mult: 2.0}},
  templevakt: {name: "Temple Guardian", lv: [20, 20], color: "#5a8a6a", r: 13, sp: 95, shape: "humanoid", elite: 3, dg: 1, hpm: 1.3, special: {name: "Stone Rain", every: 9, r: 95, windup: 1.3, mult: 2.0}},
  profeten: {name: "The Sunken Prophet", lv: [21, 21], color: "#3a8a6a", r: 18, sp: 85, shape: "humanoid", elite: 4, boss: true, ranged: 220, dg: 1, hpm: 1.5, special: {name: "Tidal Surge", every: 8, r: 120, windup: 1.5, mult: 2.4}},
  // the Ember Forge
  smedjeorc: {name: "Forge Slave", lv: [22, 24], color: "#aa4a2a", r: 12, sp: 92, shape: "humanoid", dg: 1, hpm: 1.25, dmm: 1.1},
  eldhund: {name: "Ember Hound", lv: [22, 24], color: "#d0441a", r: 12, sp: 105, shape: "wolf", dg: 1, hpm: 1.25, dmm: 1.1},
  levandeglod: {name: "Living Ember", lv: [23, 24], color: "#ff9a4a", r: 10, sp: 85, shape: "wisp", ranged: 220, dg: 1, hpm: 1.25, dmm: 1.1},
  ignar: {name: "Forgemaster Ignar", lv: [25, 25], color: "#ff7a3a", r: 15, sp: 80, shape: "golem", elite: 3, dg: 1, hpm: 1.3, special: {name: "Forge Hammer", every: 9, r: 90, windup: 1.3, mult: 2.0}},
  magmagargoyl: {name: "The Magma Gargoyle", lv: [25, 25], color: "#c84a1a", r: 13, sp: 100, shape: "humanoid", elite: 3, dg: 1, hpm: 1.3, special: {name: "Lava Rain", every: 9, r: 95, windup: 1.3, mult: 2.0}},
  eldtyrann: {name: "The Fire Tyrant", lv: [26, 26], color: "#ff4a1a", r: 20, sp: 85, shape: "golem", elite: 4, boss: true, dg: 1, hpm: 1.5, special: {name: "Inferno Wave", every: 8, r: 120, windup: 1.5, mult: 2.4}},
  // the Frost Vault
  isvaktare: {name: "Vault Guardian", lv: [27, 29], color: "#bfe6ff", r: 12, sp: 85, shape: "humanoid", dg: 1, hpm: 1.25, dmm: 1.1},
  frostulv: {name: "Frost Warg", lv: [27, 29], color: "#e0f0ff", r: 12, sp: 105, shape: "wolf", dg: 1, hpm: 1.25, dmm: 1.1},
  isande: {name: "Ice Spirit", lv: [28, 29], color: "#b4d6e4", r: 10, sp: 90, shape: "wisp", ranged: 220, dg: 1, hpm: 1.25, dmm: 1.1},
  valvbjorn: {name: "Vault Ice Bear", lv: [30, 30], color: "#ffffff", r: 15, sp: 92, shape: "boar", elite: 3, dg: 1, hpm: 1.3, special: {name: "Frost Claw", every: 9, r: 90, windup: 1.3, mult: 2.0}},
  skrymer: {name: "Skrymer the Rime Troll", lv: [30, 30], color: "#9ab8c8", r: 15, sp: 88, shape: "troll", elite: 3, dg: 1, hpm: 1.3, special: {name: "Ice Quake", every: 9, r: 95, windup: 1.3, mult: 2.0}},
  skadi: {name: "Skadi the Ice Queen", lv: [31, 31], color: "#a8d8ec", r: 18, sp: 85, shape: "humanoid", elite: 4, boss: true, ranged: 220, dg: 1, hpm: 1.5, special: {name: "Eternal Winter", every: 8, r: 125, windup: 1.5, mult: 2.5}}
};
const hx = s => parseInt(s.slice(1), 16);
const shade = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
const scaled = (g, s) => { g.scale.multiplyScalar(s); g.userData.height *= s; return g; };
const bandit = (shirt, o = {}) => makeHumanoid(Object.assign({shirt, pants: 0x3a3028, hair: 0x2a2a2a, cape: null, mask: 0x2a2020, weapon: 0x9aa0a6}, o));
// people and other two-legged monsters: their own look
const LOOKS = {
  thief: c => bandit(c, {weaponType: "dagger"}), bandit: c => bandit(c), raider: c => bandit(c, {mask: 0x6a4a2a, weaponType: "axe", tusks: true, skin: 0x7a9a5a}),
  robber: c => bandit(c, {weaponType: "dagger", skin: 0xc8b8a8}),
  leader: c => makeHumanoid({shirt: 0x3a2a20, pants: 0x2a2420, hair: 0x5a2a1a, beard: true, cape: c, shoulders: 0x4a4a4a, weapon: 0xc8ced4, belt: 0x1a1410}),
  lostdruid: c => makeHumanoid({shirt: c, robe: true, cape: 0x2a4a3a, hair: 0x6a5a3a, beard: true, weaponType: "staff", weapon: 0x7fdc5a, mask: 0x2a3a2a}),
  kobold: c => makeKobold({shirt: c}), frostkobold: c => makeKobold({shirt: c, skin: 0x8ab0c8, helm: {type: "leather", color: 0xdfe8ee}}),
  gruvkobold: c => makeKobold({shirt: 0x4a3a2a, helm: {type: "leather", color: c}}),
  krakk: c => makeKobold({scale: 1.15, shirt: 0x6a2a2a, shoulders: c, weaponType: "hammer", weapon: 0x8a8f96, helm: {type: "plate", color: 0x8a8f96}}),
  snorre: c => { const g = makeKobold({scale: 1.2, shirt: 0x3a5a8a, shoulders: c, cape: 0x8a1a1a, weaponType: "mace", weapon: c, helm: {type: "plate", color: c}}); return g; },
  shambler: c => makeSkeleton({shirt: c, pants: c, weaponType: "none"}), boneguard: c => makeSkeleton({shoulders: c, weaponType: "sword", weapon: 0x8a8f96, offhand: "shield", offColor: 0x6a6a5a}),
  vex: c => makeCultist({shirt: c, cape: 0x2a1a3a, weapon: 0x7aff6a, mask: 0xd8d0c0}),
  orcwar: c => makeHumanoid({skin: 0x6a8a3a, shirt: 0x5a4a3a, pants: 0x3a3028, shoulders: 0x6a6a6a, hair: 0x1a1a1a, tusks: true, stocky: true, cape: null, weaponType: "axe", weapon: 0x9aa0a6, helm: {type: "plate", color: 0x5a5a5a}}),
  troll: c => makeKobold({skin: c, shirt: 0x5a4a3a, ears: true, noCandle: true, helm: null, weaponType: "dagger", scale: 0.82}),
  goblin: c => makeKobold({skin: c, shirt: 0x3a4a2a, ears: true, noCandle: true, helm: null, weaponType: "axe", scale: 0.85}),
  goblinshaman: c => makeKobold({skin: 0x7a8a3a, shirt: c, robe: true, ears: true, noCandle: true, helm: null, weaponType: "staff", weapon: c, scale: 0.85}),
  gargoyle: c => makeGargoyle({color: c, dark: shade(c, 0.6), wing: shade(c, 0.75), eyes: 0xff6a3a}),
  magmagargoyl: c => makeGargoyle({color: 0x4a3a34, dark: 0x2a2220, wing: c, eyes: 0xffd060}),
  kultist: c => makeCultist({shirt: c, cape: 0x1a2a1a, weapon: 0x7aff9a, mask: 0x1a2a1a}),
  drunknad: c => makeDrowned({shirt: c}),
  cryptguard: c => makeHumanoid({skin: 0x9ab0b8, shirt: 0x3a4a52, pants: 0x2a3238, boots: 0x1a2228, shoulders: 0x6a7a82, helm: {type: "plate", color: 0x5a6a72}, eyes: 0x9aff8a, cape: 0x1a2a2a, weaponType: "sword", weapon: 0x8a9aa0, offhand: "shield", offColor: 0x3a4a4a}),
  cryptpriest: c => makeCultist({shirt: c, cape: 0x1a2a2a, mask: null, skin: 0x9ab0a8, hair: 0x2a2a2a, weapon: 0x9aff8a}),
  hagga: c => makeCultist({shirt: 0x3a2a3a, cape: 0x2a1a2a, hair: 0x8a8a8a, mask: null, skin: 0x8a9a6a, weapon: c}),
  templevakt: c => makeHumanoid({skin: c, shirt: c, pants: shade(c, 0.8), boots: shade(c, 0.6), shoulders: shade(c, 1.2), helm: {type: "plate", color: c}, cape: null, stocky: true, weaponType: "hammer", weapon: 0x6a7a6a}),
  profeten: c => makeCultist({shirt: c, cape: 0x1a3a3a, shoulders: 0x7fffd4, weapon: 0x7fffd4, mask: null, skin: 0x7a9a8a, hair: 0x2a4a3a, beard: true}),
  smedjeorc: c => makeHumanoid({skin: 0x6a7a4a, shirt: c, pants: 0x2a2220, hair: 0x1a1a1a, tusks: true, stocky: true, cape: null, weaponType: "hammer", weapon: 0x4a4a4a}),
  isvaktare: c => makeHumanoid({skin: 0xbfe6ff, shirt: c, pants: 0x8ab0c8, boots: 0x6a8aa0, shoulders: 0xdff4ff, helm: {type: "plate", color: 0xdff4ff}, eyes: 0x9fd6ff, cape: null, weaponType: "sword", weapon: 0xdff4ff, offhand: "shield", offColor: 0xa8d8ec}),
  skadi: c => makeHumanoid({skin: 0xd8eef6, shirt: c, robe: true, cape: 0xdff4ff, hair: 0xf4f8fa, shoulders: 0xbfe6ff, weaponType: "staff", weapon: 0x9fd6ff, helm: {type: "cloth", color: 0xbfe6ff}})
};
// the new models (KayKit and Quaternius): animals in the monster's colour, people and skeletons on the KayKit rig
// kobolds and goblins: the goblin model, tinted for the kobolds (h = height at size 10)
const GOBLINS = {troll: {h: 1.7}, goblin: {h: 1.75}, goblinshaman: {h: 1.75, tint: 0xb0a0e0}, kobold: {h: 1.8, tint: 0xd8b860}, frostkobold: {h: 1.8, tint: 0x9ac0d8}, gruvkobold: {h: 1.8, tint: 0xc9a24a}, krakk: {h: 1.9, tint: 0xe0b040}, snorre: {h: 1.95, tint: 0xe8c050}};
const WOLVES = new Set(["wolf", "oldgray", "shadewolf", "plaguewolf", "hound", "frostwolf", "eldhund", "frostulv"]);
const PEOPLE = {
  thief: {char: "Rogue", alt: "rogue_texture_alt_B", right: "dagger", left: "dagger", melee: "DW"},
  bandit: {char: "Rogue_Hooded", alt: "rogue_texture_alt_B", right: "sword_1handed", left: "dagger", melee: "DW"},
  robber: {char: "Rogue_Hooded", right: "dagger", left: "dagger", melee: "DW"},
  leader: {char: "Barbarian_Large", right: "axe_2handed", size: 15},
  raider: {race: "orc", char: "Barbarian", alt: "barbarian_texture_alt_A", right: "axe_1handed"},
  lostdruid: {race: "elf", char: "Druid", alt: "druid_texture_alt_A", right: "druid_staff", caster: true},
  orcwar: {race: "orc", char: "Knight", alt: "knight_texture_alt_B", right: "axe_1handed", left: "shield_spikes", helm: true},
  shambler: {char: "Skeleton_Minion"},
  boneguard: {char: "Skeleton_Warrior", right: "Skeleton_Blade", left: "Skeleton_Shield_Small_A", helm: true},
  vex: {char: "Necromancer", right: "Skeleton_Staff", helm: true, caster: true},
  cryptguard: {char: "Skeleton_Warrior", alt: "skeleton_texture_B", right: "Skeleton_Axe", left: "Skeleton_Shield_Small_A", helm: true},
  cryptpriest: {char: "Skeleton_Mage", alt: "skeleton_texture_B", right: "Skeleton_Staff", helm: true, caster: true},
  // golems (the Frost Golem in the stone, sand or fire of their kind)
  golem: {char: "FrostGolem", tint: [40, 0.08, 0.75], size: 15}, stenvakt: {char: "FrostGolem", tint: [30, 0.1, 0.7], size: 15}, sandgolem: {char: "FrostGolem", tint: [38, 0.35, 0.9], size: 15},
  icegolem: {char: "FrostGolem", size: 15}, ignar: {char: "FrostGolem", tint: [18, 0.7, 0.55], glow: 0x3a0e00, size: 15},
  magma: {char: "FrostGolem", tint: [12, 0.8, 0.5], glow: 0x5a1000, size: 15}, eldtyrann: {char: "FrostGolem", tint: [8, 0.85, 0.55], glow: 0x6a1600, size: 15},
  // trolls and giants
  garuk: {char: "OrcBrute", right: "Orc_Axe_Large", size: 14}, rimtroll: {char: "OrcBrute", tint: [200, 0.3, 0.85], size: 14}, skrymer: {char: "OrcBrute", tint: [200, 0.3, 0.85], right: "Orc_Axe_Large", size: 14},
  giant: {char: "OrcBrute", tint: [195, 0.35, 0.95], alt: "orcbrute_texture_B", size: 14}, djuptjur: {char: "OrcBrute", tint: [8, 0.55, 0.55], size: 14},
  // ghouls
  ghoul: {char: "Monstrosity", size: 14}, cryptghoul: {char: "Monstrosity", alt: "monstrosity_texture_B", size: 14}, morvel: {char: "Monstrosity", tint: [265, 0.3, 0.6], right: "Monstrosity_Pitchfork_Large", size: 14},
  // casters, guardians and the dungeon bosses
  kultist: {char: "Witch", tint: [120, 0.25, 0.5], helm: true, caster: true}, hagga: {char: "Witch", right: "Broom", helm: true, caster: true},
  skadi: {char: "Witch", tint: [200, 0.4, 0.9], helm: true, caster: true}, profeten: {char: "Lorekeeper", tint: [165, 0.4, 0.62], right: "Lorekeeper_Staff", caster: true},
  drunknad: {char: "Skeleton_Rogue", tint: [140, 0.3, 0.7], helm: true}, smedjeorc: {char: "OrcRaider", alt: "orc_texture_A", right: "Orc_Axe"},
  templevakt: {char: "BlackKnight", tint: [150, 0.3, 0.6], right: "BlackKnight_Sword_Large", left: "BlackKnight_Shield_Large", size: 15},
  isvaktare: {char: "Knight", tint: [200, 0.3, 1.0], right: "sword_1handed", left: "shield_square", helm: true},
  boss: {char: "BlackKnight", alt: "blackknight_texture_alt", right: "BlackKnight_Sword_Large", left: "BlackKnight_Shield_Large", size: 15},
};
function newModel(kind, d, c){
  if(WOLVES.has(kind)) return makeMobAnimal("wolf2", 2.2 * d.r / 11, c);
  if(kind === "lynx") return makeMobAnimal("fox", 1.6 * d.r / 11, null);
  if(kind === "jackal") return makeMobAnimal("fox", 1.7 * d.r / 11, c);
  if(kind === "deer") return makeMobAnimal(Math.random() < 0.4 ? "stag" : "deer", 2.5, null);
  if(d.shape === "boar") return /Bear/.test(d.name) ? makeMobAnimal("bear", 2.6 * d.r / 14, /Ice|Vault/.test(d.name) ? 0xe4ecf0 : kind === "plaguebear" ? 0x6a8a40 : null, {flat: /Ice|Vault|Plague/.test(d.name)})
    : makeMobAnimal("boar", 2.1 * d.r / 12, kind === "rocksvin" ? 0x9aa0a8 : null);
  if(kind === "beetle") return makeMobAnimal("beetle", 2.0, 0xd8b890);
  if(kind === "scorpion") return makeMobAnimal("scorpion", 2.0, c);
  if(d.shape === "spider") return makeMobAnimal("spider", 2.1 * d.r / 11, kind === "thorn" ? 0x5f8a3a : null);
  if(kind === "hare") return makeMobAnimal("hare", 0.85, null);
  if(kind === "rat") return makeMobAnimal("rat", 1.1, null);
  if(d.shape === "drake") return makeMobAnimal("dragon", 3.4 * d.r / 18, c);
  if(kind === "gargoyle" || kind === "magmagargoyl") return makeMobAnimal("dragon", 2.4 * d.r / 12, c);
  if(GOBLINS[kind]) return makeMobAnimal("goblin", 0, GOBLINS[kind].tint ?? null, {height: GOBLINS[kind].h * d.r / 10});
  const P = PEOPLE[kind]; if(!P) return null;
  const g = makeAvatar(P.race || "human", null, {}, {...P, scale: d.r / (P.size || 11)}); if(g && P.caster) g.userData.caster = true; return g;
}
function makeModel(kind, d){
  const c = hx(d.color), s = d.r / 11;
  { const kk = newModel(kind, d, c); if(kk) return kk; }
  switch(d.shape){
    case "wolf": return scaled(makeBeast({w: 0.5, h: 0.5, l: 1.2, legH: 0.5, head: 0.42, color: c, snout: shade(c, 0.8), leg: shade(c, 0.8), ears: true, tail: 0.6}), s);
    case "boar": return /Bear/.test(d.name) ? scaled(makeBeast({w: 0.9, h: 0.85, l: 1.45, legH: 0.48, head: 0.58, color: c, snout: shade(c, 0.75), leg: shade(c, 0.8), ears: true, tail: 0.15}), s * 0.9)
      : scaled(makeBeast({w: 0.75, h: 0.7, l: 1.3, legH: 0.38, head: 0.55, color: c, snout: shade(c, 1.3), leg: shade(c, 0.7), tusks: true, tail: 0.25}), s * 0.92);
    case "spider": return makeSpider({color: shade(c, 0.8), belly: c, size: s * (kind === "beetle" ? 0.9 : 1), eyes: kind === "thorn" ? 0xd8ff6a : 0xff4a3a});
    case "wisp": return makeWisp({color: c, size: s * 1.1});
    case "ghoul": return makeGhoul({skin: c, shirt: shade(c, 0.6), scale: s * 0.95});
    case "golem": return makeGolem({skin: c, shirt: shade(c, 0.9), pants: shade(c, 0.8), boots: shade(c, 0.7), hair: shade(c, 0.9), gloves: shade(c, 1.1), shoulders: shade(c, 1.1), scale: 1.8 * d.r / 15, eyes: kind === "icegolem" ? 0x9fd6ff : 0xffb04a});
    case "troll": return makeTroll({skin: c, scale: 1.35 * d.r / 14, ...(kind === "garuk" ? {shirt: 0x3a2a1a, shoulders: 0x6a6a6a, helm: {type: "plate", color: 0x5a5a5a}} : {})});
    case "drake": return scaled(makeDrake({color: c, dark: shade(c, 0.55), belly: shade(c, 1.6), wing: shade(c, 0.75)}), 1.25);
    case "critter": return scaled(makeCritter(kind === "deer" ? "deer" : kind === "rat" ? "rat" : "hare", c), kind === "deer" ? 1.1 : 1);
    case "draug": return makeDraug();
    default: { const look = LOOKS[kind]; const g = look ? look(c) : makeHumanoid({shirt: c, cape: null}); return s > 1.05 ? scaled(g, s) : g; }
  }
}
// the dungeon bosses' extra mechanics (main.js runs them):
//  zones: glowing circles that erupt after a warning (under each player, or scattered around the boss)
//  adds: helpers called at these health levels; enrage: below this health the boss hits harder and faster
export const BOSS_MECH = {
  djuptjur: {zones: {name: "Cave-in", every: 11, warn: 2, r: 2.6, dmg: 2.2, under: true, color: 0xd8b070}, enrage: 0.3},
  profeten: {zones: {name: "Drowning Pool", every: 12, warn: 2.2, r: 3, dmg: 1.8, scatter: 4, color: 0x3fb0e0}, adds: {kind: "drunknad", at: [0.7, 0.35], n: 2, say: "rise from the depths"}, enrage: 0.2},
  eldtyrann: {zones: {name: "Flame Pillar", every: 9, warn: 1.8, r: 2.4, dmg: 2.4, scatter: 5, under: true, color: 0xff6a1a}, adds: {kind: "eldhund", at: [0.5], n: 2, say: "leap from the flames"}, enrage: 0.3},
  skadi: {zones: {name: "Frozen Tomb", every: 10, warn: 2, r: 2.4, dmg: 2.2, under: true, color: 0x9fd6ff}, adds: {kind: "frostulv", at: [0.66, 0.33], n: 2, say: "answer her call"}, enrage: 0.2},
  boss: {zones: {name: "Grave Rot", every: 12, warn: 2, r: 2.6, dmg: 1.8, scatter: 3, color: 0x7aff6a}, adds: {kind: "cryptguard", at: [0.66, 0.33], n: 2, say: "rise from their tombs"}, enrage: 0.2}
};
// Rimfrost 2 stats: health and damage multipliers like Rimfrost 1; sizes and speeds turned into world units
export const KINDS = {};
for(const [id, d] of Object.entries(MOBS)){ const ru = d.r / 20;
  KINDS[id] = {id, name: d.name, lv: d.lv, make: () => makeModel(id, d), hp: (d.elite ? d.elite * ELITE_HP : 1) * (d.boss ? BOSS_HP : 1) * (d.hpm || 1), dmg: (d.elite ? 1.25 : 1) * (d.passive ? 0.6 : 1) * (d.dmm || 1),
    speed: d.sp * 0.068, r: ru, reach: 1.4 + ru, elite: !!d.elite, boss: !!d.boss, passive: !!d.passive, dg: !!d.dg,
    ranged: d.ranged ? {range: d.ranged >= 220 ? 12 : 11, color: d.color} : null,
    nova: d.special ? {every: d.special.every, r: d.special.r / 23, warn: d.special.windup, dmg: d.special.mult, name: d.special.name, she: /Queen|Witch/.test(d.name)} : null, mech: BOSS_MECH[id] || null}; }
// how many of each live in each zone (Rimfrost 1's numbers; the big end zones get more)
export const SPAWNS = [
  ["wolf", 12, "frostang"], ["boar", 10, "frostang"], ["thief", 9, "frostang"],
  ["spider", 13, "skugg"], ["bandit", 9, "skugg", "banditcamp"],
  ["lynx", 12, "silver"], ["thorn", 10, "silver"], ["wisplight", 8, "silver"],
  ["shadewolf", 12, "manskog"], ["lostdruid", 9, "manskog"],
  ["rocksvin", 12, "koppar"], ["kobold", 11, "koppar"], ["beetle", 8, "koppar"],
  ["icebear", 10, "snodal"], ["frostkobold", 11, "snodal"],
  ["jackal", 12, "rod"], ["bristle", 10, "rod"], ["scorpion", 9, "rod"],
  ["raider", 11, "damm"], ["sandgolem", 9, "damm"],
  ["hare", 5, "frostang"], ["hare", 5, "silver"], ["hare", 4, "koppar"], ["hare", 4, "rod"], ["deer", 4, "frostang"], ["deer", 5, "silver"], ["deer", 4, "skugg"], ["deer", 4, "manskog"],
  ["troll", 14, "jarn"], ["golem", 12, "jarn"], ["orcwar", 10, "jarn"],
  ["ghoul", 10, "dimma"], ["wisp", 7, "dimma"], ["goblin", 9, "dimma"], ["goblinshaman", 5, "dimma"], ["dragon", 3, "dimma"],
  ["hound", 11, "aska"], ["elemental", 8, "aska"], ["gargoyle", 10, "aska"],
  ["frostwolf", 12, "frost"], ["icegolem", 12, "frost"], ["rimtroll", 12, "frost"],
  ["rat", 12, "gravmark"], ["plaguewolf", 9, "gravmark"], ["shambler", 10, "gravmark"], ["robber", 10, "benfalt"], ["boneguard", 10, "benfalt"], ["plaguebear", 7, "benfalt"]
];
export const ZONE_MOB_MULT = {dimma: 1.9, aska: 2.9, frost: 2.2, rod: 1.3, jarn: 1.2, gravmark: 1.2, benfalt: 1.2};
// the elites in their lairs (and Old Gray, somewhere far out in Frost Meadows)
export const FIXED = [["oldgray", {zone: "frostang", far: "frostvik", d: 45}], ["leader", {lair: "banditcamp"}], ["morvel", {lair: "morvel"}], ["snorre", {lair: "snorre"}],
  ["garuk", {lair: "garuk"}], ["magma", {lair: "magma"}], ["giant", {lair: "giant"}], ["vex", {lair: "vex"}]];
