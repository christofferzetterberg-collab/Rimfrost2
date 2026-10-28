// Rimfrost 1's world, brought into 3D: the same zones, towns, camps, roads, lairs and places to explore.
// Positions are written in Rimfrost 1 tiles (tx, ty) and turned into world units here: 1 tile = 1.4 units.
export const TS = 1.4;
export const W = (tx, ty) => ({x: (tx + 0.5 - 220) * TS, z: (ty + 0.5 - 178) * TS});

// Zones: the land is split between the zone centres (c, in tiles); w makes a zone bigger. t = what the land looks like.
export const ZONES = {
  frostang: {name: "Frost Meadows", lv: [1, 5], c: [48, 148], w: 0, t: "meadow", race: "human"},
  skugg:    {name: "Shadowwood", lv: [5, 10], c: [104, 168], w: 0, t: "forest", race: "human"},
  silver:   {name: "Silver Grove", lv: [1, 5], c: [60, 48], w: 0, t: "elfwood", race: "elf"},
  manskog:  {name: "Moonwood", lv: [5, 10], c: [124, 88], w: 0, t: "moonwood", race: "elf"},
  koppar:   {name: "Copper Cliffs", lv: [1, 5], c: [208, 32], w: 0, t: "highland", race: "dwarf"},
  snodal:   {name: "Snowvale", lv: [5, 10], c: [196, 92], w: 0, t: "snowhigh", race: "dwarf"},
  rod:      {name: "Red Plains", lv: [1, 5], c: [60, 256], w: 0, t: "steppe", race: "orc"},
  damm:     {name: "Dust Canyon", lv: [5, 10], c: [128, 228], w: 0, t: "canyon", race: "orc"},
  jarn:     {name: "Iron Ridge", lv: [10, 15], c: [204, 168], w: 16, t: "rock"},
  dimma:    {name: "Mistmarsh", lv: [15, 20], c: [280, 248], w: 12, t: "swamp"},
  aska:     {name: "Ashfields", lv: [20, 25], c: [304, 80], w: 16, t: "ash"},
  frost:    {name: "Frostcrown", lv: [25, 30], c: [384, 184], w: 20, t: "snow"},
  gravmark: {name: "Gravelands", lv: [1, 5], c: [100, 328], w: 0, t: "blight", race: "undead"},
  benfalt:  {name: "Bonefields", lv: [5, 10], c: [184, 304], w: 0, t: "gloom", race: "undead"}
};
// Towns and camps (safe places). kind: town = a village, camp = a small camp, city = Rimhaven.
export const HUBS = {
  frostvik:     {name: "Frostwick", tx: 48, ty: 148, r: 7, kind: "town", race: "human"},
  holgerstuga:  {name: "Forester's Cabin", tx: 108, ty: 172, r: 4, kind: "camp"},
  lovhem:       {name: "Leafhome", tx: 60, ty: 48, r: 7, kind: "town", race: "elf"},
  manglanta:    {name: "Moonglade", tx: 124, ty: 92, r: 4, kind: "camp"},
  bergsdal:     {name: "Mountdale", tx: 208, ty: 36, r: 7, kind: "town", race: "dwarf"},
  snostugan:    {name: "Snow Cabin", tx: 196, ty: 96, r: 4, kind: "camp"},
  brannmark:    {name: "Burnmark", tx: 60, ty: 252, r: 7, kind: "town", race: "orc"},
  kanjonlagret: {name: "Canyon Camp", tx: 128, ty: 224, r: 4, kind: "camp"},
  jarnfastet:   {name: "Rimhaven", tx: 200, ty: 174, r: 14, kind: "city"},
  traskvakten:  {name: "Marshwatch", tx: 276, ty: 236, r: 5, kind: "camp"},
  askvakten:    {name: "Ashwatch", tx: 300, ty: 88, r: 5, kind: "camp"},
  isporten:     {name: "Icegate", tx: 376, ty: 180, r: 5, kind: "camp"},
  bleksted:     {name: "Palestead", tx: 100, ty: 328, r: 7, kind: "town", race: "undead"},
  benvakten:    {name: "Bonewatch", tx: 184, ty: 304, r: 4, kind: "camp"}
};
// Rimhaven's districts (tile offsets from the centre) with a sign each
export const CITY_SIGNS = [["Mage & Priest Quarter", 0, -7.5], ["The Barracks", 7.5, 0], ["Hunters' Lodge & Grove", 0, 7.5], ["The Market", -7.5, 0]];
export const RACE_HUB = {human: "frostvik", elf: "lovhem", dwarf: "bergsdal", orc: "brannmark", undead: "bleksted"};
export const ROADS = [["frostvik", "holgerstuga"], ["lovhem", "manglanta"], ["bergsdal", "snostugan"], ["brannmark", "kanjonlagret"],
  ["holgerstuga", "jarnfastet"], ["manglanta", "jarnfastet"], ["snostugan", "jarnfastet"], ["kanjonlagret", "jarnfastet"],
  ["frostvik", "lovhem"], ["frostvik", "brannmark"], ["lovhem", "bergsdal"], ["manglanta", "snostugan"], ["holgerstuga", "kanjonlagret"],
  ["jarnfastet", "traskvakten"], ["jarnfastet", "askvakten"], ["askvakten", "isporten"], ["traskvakten", "isporten"], ["bergsdal", "askvakten"],
  ["bleksted", "benvakten"], ["bleksted", "brannmark"], ["benvakten", "kanjonlagret"], ["benvakten", "traskvakten"], ["benvakten", "jarnfastet"]];
// Lairs: cleared spots for the elites and bosses, each with a road from a camp
export const LAIRS = {
  banditcamp: {tx: 84, ty: 192, r: 6, from: "holgerstuga"}, morvel: {tx: 136, ty: 64, r: 4, from: "manglanta"}, snorre: {tx: 172, ty: 108, r: 4, from: "snostugan"},
  garuk: {tx: 148, ty: 248, r: 4, from: "kanjonlagret"}, magma: {tx: 320, ty: 28, r: 5, from: "askvakten"}, giant: {tx: 412, ty: 224, r: 6, from: "isporten"},
  vex: {tx: 224, ty: 332, r: 4, from: "benvakten"}
};
// Places quests send you to
export const EXPLORE = {
  windmill: {name: "the Old Windmill", tx: 74, ty: 150}, wolfhill: {name: "Wolf Hill", tx: 30, ty: 176}, hunterscairn: {name: "the Hunter's Cairn", tx: 126, ty: 152},
  stones: {name: "the Whispering Stones", tx: 84, ty: 60}, moonwell: {name: "the Moon Well", tx: 146, ty: 106}, oldshaft: {name: "the Abandoned Shaft", tx: 184, ty: 50},
  frozenfalls: {name: "the Frozen Falls", tx: 204, ty: 76}, skullrock: {name: "Bleached Skull Rock", tx: 84, ty: 278}, rustcaravan: {name: "the Rusted Caravan", tx: 108, ty: 204},
  cryptdoor: {name: "the Sealed Crypt Door", tx: 78, ty: 308}, barrow: {name: "the Hollow Barrow", tx: 208, ty: 326},
  watchtower: {name: "the Broken Watchtower", tx: 236, ty: 134}, minershrine: {name: "the Miner's Shrine", tx: 178, ty: 198},
  witchhut: {name: "the Witch's Hut", tx: 256, ty: 224}, sunkenbell: {name: "the Sunken Bell", tx: 300, ty: 268},
  obelisk: {name: "the Cinder Obelisk", tx: 328, ty: 102}, scorchbridge: {name: "the Scorched Bridge", tx: 282, ty: 58},
  frozencamp: {name: "the Frozen Camp", tx: 404, ty: 160}, giantprint: {name: "the Giant's Footprint", tx: 364, ty: 208}
};
// Dungeon doors in the world (tiles) and the camp whose road leads there
export const DG_DOORS = {
  d_mine: {tx: 232, ty: 150, hub: "jarnfastet", name: "The Iron Mine", lv: "12–16"}, d_temple: {tx: 294, ty: 250, hub: "traskvakten", name: "The Drowned Temple", lv: "17–21"},
  d_forge: {tx: 314, ty: 76, hub: "askvakten", name: "The Ember Forge", lv: "22–26"}, d_vault: {tx: 394, ty: 168, hub: "isporten", name: "The Frost Vault", lv: "27–31"},
  d_crypt: {tx: 280, ty: 276, hub: "traskvakten", name: "The Draug King's Crypt", lv: "20"}
};
// world positions (units) and sizes for everything above
for(const o of [...Object.values(HUBS), ...Object.values(LAIRS), ...Object.values(EXPLORE), ...Object.values(DG_DOORS)]){ Object.assign(o, W(o.tx, o.ty)); if(o.r) o.R = o.r * TS; }
for(const z of Object.values(ZONES)) Object.assign(z, {cx: W(z.c[0], z.c[1]).x, cz: W(z.c[0], z.c[1]).z, wu: (z.w || 0) * TS});
for(const [id, h] of Object.entries(HUBS)) h.id = id;
