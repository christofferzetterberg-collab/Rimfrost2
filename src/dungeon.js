// Dungeons: each is its own small map far away from the open world (x > 500), built from square tiles (floor or wall).
// You get in through a door in the world and out through a glowing doorway inside.
// Rimfrost 1's dungeons: the Iron Mine (x from 1000, Iron Ridge), the Drowned Temple (2000, Mistmarsh), the Ember Forge (3000, Ashfields),
// the Frost Vault (4000, Frostcrown) and the Draug King's crypt (5000, Mistmarsh).
import * as THREE from "three";
import {DG_DOORS} from "./worlddata.js";

export const inDungeon = x => x > 500;
export const regionOf = x => x > 500 ? Math.floor(x / 1000) : 0;          // 0 = the open world, 1–5 = a dungeon
// tile kinds in the grid: 0 floor, 1 wall, 2 lava (can't walk, can see across), 3 gate (a wall while it is shut)
function makeDungeon(def){
  const d = Object.assign({T: 2.5, floorY: 2}, def), rows = d.map; d.W = rows[0].length; d.H = rows.length;
  const grid = new Uint8Array(d.W * d.H), ch = (i, j) => rows[j][i];
  d.lights = []; d.packs = []; d.gates = []; const spots = {};
  for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++){ const c = ch(i, j), k = j * d.W + i;
    grid[k] = c === "#" || c === "o" ? 1 : c === "L" ? 2 : c === "G" ? 3 : 0;
    if(c === "*") d.lights.push([i, j]); else if(c === "S") d.start = [i, j]; else if(c === "E") d.exit = [i, j]; else if(c === "p") d.packs.push([i, j]); else if("abK".includes(c)) spots[c] = [i, j]; }
  // gates: each run of G tiles in a row is one gate (it opens when every monster that starts above it is dead)
  for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++) if(ch(i, j) === "G" && (i === 0 || ch(i - 1, j) !== "G")){ let i1 = i; while(i1 + 1 < d.W && ch(i1 + 1, j) === "G") i1++; d.gates.push({j, i0: i, i1, open: false}); }
  d.kind = (i, j) => i < 0 || j < 0 || i >= d.W || j >= d.H ? "#" : ch(i, j);
  d.tileAt = (x, z) => [Math.floor((x - d.x0) / d.T), Math.floor((z - d.z0) / d.T)];
  d.kindAt = (x, z) => d.kind(...d.tileAt(x, z));
  const g = (i, j) => i < 0 || j < 0 || i >= d.W || j >= d.H ? 1 : grid[j * d.W + i];
  d.wallTile = (i, j) => { const v = g(i, j); return v === 1 || v === 3; };                     // blocks sight
  d.solidTile = (i, j) => g(i, j) !== 0;                                                         // blocks walking
  d.lavaTile = (i, j) => g(i, j) === 2;
  d.setGate = (gt, open) => { gt.open = open; for(let i = gt.i0; i <= gt.i1; i++) grid[gt.j * d.W + i] = open ? 0 : 3; };
  for(const gt of d.gates) d.setGate(gt, false);
  d.tileCenter = (i, j) => ({x: d.x0 + (i + 0.5) * d.T, z: d.z0 + (j + 0.5) * d.T});
  d.blocked = (x, z, r) => { const [ci, cj] = d.tileAt(x, z);
    for(let j = cj - 1; j <= cj + 1; j++) for(let i = ci - 1; i <= ci + 1; i++){ if(!d.solidTile(i, j)) continue;
      const x0 = d.x0 + i * d.T, z0 = d.z0 + j * d.T, nx = Math.max(x0, Math.min(x, x0 + d.T)), nz = Math.max(z0, Math.min(z, z0 + d.T));
      if((x - nx) ** 2 + (z - nz) ** 2 < r * r) return true; }
    return false; };
  d.los = (ax, az, bx, bz) => { const n = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
    for(let k = 1; k < n; k++){ const t = k / n; if(d.wallTile(...d.tileAt(ax + (bx - ax) * t, az + (bz - az) * t))) return false; } return true; };
  d.navGrid = () => { const w = Math.ceil(d.W * d.T), h = Math.ceil(d.H * d.T), gr = new Uint8Array(w * h);
    for(let j = 0; j < h; j++) for(let i = 0; i < w; i++) gr[j * w + i] = d.blocked(d.x0 + i + 0.5, d.z0 + j + 0.5, 0.6) ? 1 : 0;
    return {x0: d.x0, z0: d.z0, w, h, grid: gr, hgt: new Float32Array(w * h).fill(d.floorY)}; };
  // the monsters: each pack is three monsters of different kinds on and next to its tile, then the elites and the boss
  d.mobs = []; const used = new Set();
  const free = (i, j) => !d.solidTile(i, j) && !used.has(i + "," + j) && !"=|".includes(ch(i, j));
  d.packs.forEach(([i, j], n) => { let k = 0;
    for(const [di, dj] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [-2, 0], [0, 2]]){ if(k >= 3) break;
      if(!free(i + di, j + dj)) continue; used.add((i + di) + "," + (j + dj)); d.mobs.push([d.pack[(n + k) % 3], i + di, j + dj]); k++; } });
  if(spots.a && d.elites[0]) d.mobs.push([d.elites[0], ...spots.a]);
  if(spots.b && d.elites[1]) d.mobs.push([d.elites[1], ...spots.b]);
  if(spots.K) d.mobs.push([d.boss, ...spots.K]);
  // features for the dungeon mechanics (dgmech.js)
  const runs = (c, vertical) => { const out = [];
    if(!vertical){ for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++) if(ch(i, j) === c && (i === 0 || ch(i - 1, j) !== c)){ let i1 = i; while(i1 + 1 < d.W && ch(i1 + 1, j) === c) i1++; if(i1 > i) out.push({a: [i, j], b: [i1, j]}); } }
    else { for(let i = 0; i < d.W; i++) for(let j = 0; j < d.H; j++) if(ch(i, j) === c && (j === 0 || ch(i, j - 1) !== c)){ let j1 = j; while(j1 + 1 < d.H && ch(i, j1 + 1) === c) j1++; if(j1 > j) out.push({a: [i, j], b: [i, j1]}); } }
    return out; };
  const groups = c => { const seen = new Set(), out = [];
    for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++){ if(ch(i, j) !== c || seen.has(i + "," + j)) continue; const tiles = [], st = [[i, j]]; seen.add(i + "," + j);
      while(st.length){ const [a, b] = st.pop(); tiles.push([a, b]); for(const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const na = a + da, nb = b + db, key = na + "," + nb; if(!seen.has(key) && d.kind(na, nb) === c){ seen.add(key); st.push([na, nb]); } } }
      out.push(tiles); } return out; };
  d.tracks = [...runs("="), ...runs("|", true)];
  d.rockZones = groups("r");
  d.vents = []; for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++) if(ch(i, j) === "v") d.vents.push([i, j]);
  d.lanes = groups("w").map(tiles => { const is = tiles.map(t => t[0]), js = tiles.map(t => t[1]), i0 = Math.min(...is), i1 = Math.max(...is), j0 = Math.min(...js), j1 = Math.max(...js);
    return {tiles, i0, i1, j0, j1, horiz: i1 - i0 >= j1 - j0}; });
  return d;
}

const MINE = [
    "##############################################",
    "####################*..E..*###################",
    "####################.......###################",
    "####################...S...###################",
    "####################*.....*###################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######*.....p.......*...................*#####",
    "######..===============================..#####",
    "######*...................*...p.........*#####",
    "###*........*########.....#######*.........*##",
    "###..........########..|..#######...........##",
    "###...p......########..|..#######...........##",
    "###..rrrrrr..########..|..#######...p.......##",
    "###..rrrrrr..########..|..#######...........##",
    "###..rrrrrr..########..|..#######...........##",
    "###..rrrrrr..########..|..#######...........##",
    "###..rrrrrr..########..|..#######...........##",
    "###......p...########.p|..#######...........##",
    "###..........########..|..#######.......p...##",
    "###*........*########..|..#######...........##",
    "#####...#############..|..#######...........##",
    "#####...#############..|..#######*.........*##",
    "#####...#############..|..##########*.....*###",
    "#####...#############..|..##########.......###",
    "#####...#############..|..##########...a...###",
    "#####.p.#############..|..##########.......###",
    "#####...#############..|..##########*.....*###",
    "#####...#############.....##########...#######",
    "#####...######*.................*###.|.#######",
    "#####...######..rrrrrr...........###.|.#######",
    "#####...######..rrrrrr......p....###.|.#######",
    "#####...######..rrprrr...........###.|.#######",
    "#####...######..rrrrrr...........###.|.#######",
    "####............rrrrrr...........###.p.#######",
    "####..........*.................*###.|.#######",
    "####..........######################.|.#######",
    "##*.........*#######################.|.#######",
    "##...........#######################.|.#######",
    "##...........#*.................*###.|.#######",
    "##...p.......#...........rrrrrr..###.|.#######",
    "##................p......rrrrrr..###.|.#######",
    "##.......................rrrrrr........#######",
    "##.......................rrrrrr......#########",
    "##....b......#...........rrprrr......#########",
    "##...........#...........rrrrrr..#############",
    "##*.........*#*.................*#############",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################.p.#####################",
    "######################...#####################",
    "######################...#####################",
    "############*.....................*###########",
    "############.......................###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############..rrrrrr...K...rrrrrr..###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############..rrrrrr.......rrrrrr..###########",
    "############*.....................*###########",
    "##############################################"];
const TEMPLE = [
    "##############################################",
    "####################*..E..*###################",
    "####################.......###################",
    "####################...S...###################",
    "####################*.....*###################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "##############*.................*#############",
    "##############...................#############",
    "##############...o...........o...#############",
    "######.............p.....................#####",
    "######.....................p.............#####",
    "######...........o...........o...........#####",
    "###*........*#...................#*........*##",
    "###..p.......#*.................*#......p...##",
    "###..........########.....########..........##",
    "###..~~~~~~..########.....########..~~~~~~..##",
    "###..~~~~~~..##*...............*##..~~~~~~..##",
    "###..~~~~~~..##.................##..~~~~~~..##",
    "###..~~~~~~..##.~~~~~~~~~~~~~~~.##..~~~~~~..##",
    "###..~~~~~~..##.~~~~p~~~~~~~~~~.##..~~~~~~..##",
    "###..~~~~~~..##.~o~~~~~~~~~~~o~.##..~~~~~~..##",
    "###..~~~~~~..##.~~~~~~~~~~~~~~~.##..~~~~~~..##",
    "###.............~~~~~~~~~~~~~~~.............##",
    "###......p......~~~~~~~~~~p~~~~......p......##",
    "###*........*...~~~~~~~~~~~~~~~...*........*##",
    "######...######.~~~~~~~~~~~~~~~.######...#####",
    "######...######.~o~~~~~~~~~~~o~.######...#####",
    "######...######.~~~~~~~~~~~~~~~.######...#####",
    "######...######.~~~~~~~~~~~~~~~.######...#####",
    "###*........*##.~~~~p~~~~~~~~~~.##*........*##",
    "###..p.......##.~~~~~~~~~~~~~~~.##......p...##",
    "###..........##.~~~~~~~~~~~~~~~.##..........##",
    "###.~~~~~....##.~o~~~~~~~~~~~o~.##....~~~~~.##",
    "###.~~~~~....##.~~~~~~~~~~p~~~~.##....~~~~~.##",
    "###.~~~~a....##.~~~~~~~~~~~~~~~.##....b~~~~.##",
    "###.~~~~~....##.................##....~~~~~.##",
    "###.~~~~~....##*...............*##....~~~~~.##",
    "###..........########.....########..........##",
    "###*........*########.....########*........*##",
    "##########*.........................*#########",
    "##########....p......................#########",
    "##########..~~~~~~~~~~~~~~~~~~~~~~~..#########",
    "##########..~~~~~~~~~~~~~~~~~~~~~~~..#########",
    "##########.............p........p....#########",
    "##########*.........................*#########",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "############*.....................*###########",
    "############.~~~~~~~~~~~~~~~~~~~~~.###########",
    "############.~~~~~~~~~~~~~~~~~~~~~.###########",
    "############.~~~...............~~~.###########",
    "############.~~~.o...........o.~~~.###########",
    "############.~~~.......K.......~~~.###########",
    "############.~~~...............~~~.###########",
    "############.~~~.o...........o.~~~.###########",
    "############.~~~~~~~~~~~~~~~~~~~~~.###########",
    "############.~~~~~~~~~~~~~~~~~~~~~.###########",
    "############*.....................*###########",
    "##############################################"];
const FORGE = [
    "##############################################",
    "####################*..E..*###################",
    "####################.......###################",
    "####################...S...###################",
    "####################*.....*###################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "########*.............................*#######",
    "########...............................#######",
    "########....v.......v.........v........#######",
    "########...............p...............#######",
    "########...p...........................#######",
    "########........v.................v....#######",
    "########..................v............#######",
    "########.........................p.....#######",
    "########......v........v........v......#######",
    "########*.............................*#######",
    "####LLLLLL..LLLLLLLLLLLLLLLLLLLLLL..LLLLLLL###",
    "####LLLLLL..LLLLLLLLLLLLLLLLLLLLLL..LLLLLLL###",
    "####LLLLLL..LLLLLLLLLLLLLLLLLLLLLL..LLLLLLL###",
    "####LLLLLL..LLLLLLLLLLLLLLLLLLLLLL..LLLLLLL###",
    "####LLLLLL..LLLLLLLLLLLLLLLLLLLLLL..LLLLLLL###",
    "####*.....................................*###",
    "####...v........p.......v..................###",
    "####....p...................p.......v......###",
    "####.........v....p........................###",
    "####..........................v............###",
    "####................LLLLLLL................###",
    "####.............v..LLLLLLL...........p....###",
    "####......v.........LLLLLLL................###",
    "####................LLLLLLL......p......v..###",
    "####.........p................v............###",
    "####*.....................................*###",
    "#####...#############.....#############...####",
    "##*........*####LLL.........LLL####*........*#",
    "##..........####LLL.........LLL####..........#",
    "##......p...####LLL....p....LLL####...p..v...#",
    "##..........####LLL..v......LLL####..........#",
    "##..v...........LLL.........LLL......v.......#",
    "##..............LLL.v.......LLL..............#",
    "##.......v......LLL......v..LLL...........v..#",
    "##....a.....####LLL.........LLL####.....b....#",
    "##...v......####LLL..p......LLL####..........#",
    "##..........####LLL....v....LLL####..........#",
    "##*........*####LLL.........LLL####*........*#",
    "#####################.....####################",
    "#####################.....####################",
    "#####################.....####################",
    "#####################..p..####################",
    "#####################.....####################",
    "#####################.....####################",
    "##########*.........................*#########",
    "##########...........................#########",
    "##########..LLLL...............LLLL..#########",
    "##########..LLLL.......v.......LLLL..#########",
    "##########..LLLL...............LLLL..#########",
    "##########........v.........v........#########",
    "##########...........................#########",
    "##########.............K.............#########",
    "##########..LLLL...............LLLL..#########",
    "##########..LLLL..v.........v..LLLL..#########",
    "##########..LLLL.......v.......LLLL..#########",
    "##########*.........................*#########",
    "##############################################"];
const VAULT = [
    "##############################################",
    "####################*..E..*###################",
    "####################.......###################",
    "####################...S...###################",
    "####################*.....*###################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######################...#####################",
    "######*.................................*#####",
    "######..iiiiiiiiiiiiiiiiiiiiiiiiiiiiiii..#####",
    "######..iiiiiiipiiiiiiiiiiiiiiipiiiiiii..#####",
    "######..iiiiiiiiiiiiiiiiiiiiiiiiiiiiiii..#####",
    "######..iiiioiiiiiiiiiiiiiiiiiiiiioiiii..#####",
    "######..iiiiiiiiiiiiiiipiiiiiiiiiiiiiii..#####",
    "######..iiiiiiiiiiiiiiiiiiiiiiiiiiiiiii..#####",
    "######..iiiiiiiiiiiiiiiiiiiiiiiiiiiiiii..#####",
    "######..iiiioiiiiiiiiiiiiiiiiiiiiioiiii..#####",
    "######..iiiiiiiiiiiiiiiiiiiiiiiiiiiiiii..#####",
    "######..iiiiiiipiiiiiiiiiiiiiiipiiiiiii..#####",
    "######*.................................*#####",
    "#####################.....####################",
    "####wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww###",
    "####wwwwwwpwwwwwwwwwwwwwwwwwwwwwwwwwpwwwwww###",
    "####wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww###",
    "##*.........*########wwwww########*.........*#",
    "##...........########wwwww########...........#",
    "##...p.......########wwwww########......p....#",
    "##..iiiiiii..########wwwww########..iiiiiii..#",
    "##..iiiiiii..########wwwww########..iiiiiii..#",
    "##..iiiiiii..########wwwww########..iiiiiii..#",
    "##..iiiiiii..########wwwww########..iiiiiii..#",
    "##..iiiiiii..########wwpww########..iiiiiii..#",
    "##..iiiiiii..########wwwww########..iiiiiii..#",
    "##..iiiiipi..########wwwww########..ipiiiii..#",
    "##...........########wwwww########...........#",
    "##*.........*########wwwww########*.........*#",
    "######...############wwwww############...#####",
    "##*.........*########wwwww########*.........*#",
    "##...........########wwwww########...........#",
    "##...........########wwwww########...........#",
    "##......*.............................*......#",
    "##........iiiiiiiiiiiiiiiiiiiiiiiiiii........#",
    "##.....a..iiiiiiiiiiiiiiiiiiiiiiiiiii..b.....#",
    "##........iiiipiiiiiiiiiiiiiiiiipiiii........#",
    "##........iiiiiiiiiiiiiiiiiiiiiiiiiii........#",
    "##*.......iiiiiiiiiiiiipiiiiiiiiiiiii.......*#",
    "########..iiiiiiiiiiiiiiiiiiiiiiiiiii..#######",
    "########*.............................*#######",
    "##########wwwwwwwwwwwwwwwwwwwwwwwwwww#########",
    "##########wwwwwwwwwwwwwwwwwwwwwwwwwww#########",
    "#####################.....####################",
    "#####################.....####################",
    "#####################.....####################",
    "##########*.........................*#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########..iiioiiiiiiiiiiiiiiioiii..#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########..iiiiiiiiiiiKiiiiiiiiiii..#########",
    "##########..iiioiiiiiiiiiiiiiiioiii..#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########..iiiiiiiiiiiiiiiiiiiiiii..#########",
    "##########*.........................*#########",
    "##############################################"];
const CRYPT = [
    "##############################",
    "############*..E..*###########",
    "############.......###########",
    "############...S...###########",
    "############*.....*###########",
    "##############...#############",
    "##############...#############",
    "##############...#############",
    "######*.................*#####",
    "######...................#####",
    "######....p.........p....#####",
    "######...................#####",
    "######...o...........o...#####",
    "######...................#####",
    "######...o...........o...#####",
    "######...................#####",
    "######*.................*#####",
    "##############GGG#############",
    "##############...#############",
    "##############...#############",
    "####*.....................*###",
    "####.......................###",
    "####....p.............p....###",
    "####.......................###",
    "####.......................###",
    "####....o...o.....o...o....###",
    "####.......................###",
    "####.......................###",
    "####......p.........p......###",
    "####.......................###",
    "####*.....................*###",
    "##############GGG#############",
    "##############...#############",
    "##############...#############",
    "######*.................*#####",
    "######...................#####",
    "######....p.........p....#####",
    "######...................#####",
    "######...................#####",
    "######...................#####",
    "######*.................*#####",
    "##############GGG#############",
    "##############...#############",
    "####*.....................*###",
    "####.......................###",
    "####.......................###",
    "####....o.............o....###",
    "####...........K...........###",
    "####.......................###",
    "####.......................###",
    "####*.....................*###",
    "##############################"];
// Each dungeon is drawn as a map, one character per tile:
//  # wall   . floor   o pillar   * brazier   S start   E way out   p a pack of 3 monsters   a / b the two elites   K the boss
//  = | mine-cart track (Iron Mine)   r unstable ceiling: falling rocks (Iron Mine)   ~ water: slows, and the tide surges (Drowned Temple)
//  L lava (can't be crossed, doesn't block sight)   v fire vent: erupts now and then (Ember Forge)
//  i ice: slippery (Frost Vault)   w wind tunnel: freezing gusts push you along (Frost Vault)   G gate: opens when every monster before it is dead (crypt)
export const DG_VER = 2;                                   // bump when the maps change (saved dungeon progress from older maps is ignored)
export const DUNGEONS = [
  makeDungeon({id: "d_mine", name: "The Iron Mine", sub: "Kobolds, spiders and the creatures of the deep", x0: 1000, z0: 0, lv: [12, 16], mech: "mine",
    door: DG_DOORS.d_mine, floor: [0.08, 0.12, 0.32], wall: [0.07, 0.1, 0.38], fire: 0xffb060,
    pack: ["gruvkobold", "gruvspindel", "stenvakt"], elites: ["krakk", "grottbjorn"], boss: "djuptjur", map: MINE}),
  makeDungeon({id: "d_temple", name: "The Drowned Temple", sub: "A sunken temple ruled by an undying prophet", x0: 2000, z0: 0, lv: [17, 21], mech: "temple",
    door: DG_DOORS.d_temple, floor: [0.42, 0.12, 0.3], wall: [0.4, 0.1, 0.34], fire: 0x7fffd4,
    pack: ["kultist", "drunknad", "templebloss"], elites: ["hagga", "templevakt"], boss: "profeten", map: TEMPLE}),
  makeDungeon({id: "d_forge", name: "The Ember Forge", sub: "The forge of the Fire Tyrant", x0: 3000, z0: 0, lv: [22, 26], mech: "forge",
    door: DG_DOORS.d_forge, floor: [0.03, 0.22, 0.17], wall: [0.02, 0.16, 0.22], fire: 0xff5a1a,
    pack: ["smedjeorc", "eldhund", "levandeglod"], elites: ["ignar", "magmagargoyl"], boss: "eldtyrann", map: FORGE}),
  makeDungeon({id: "d_vault", name: "The Frost Vault", sub: "The frozen halls of Skadi the Ice Queen", x0: 4000, z0: 0, lv: [27, 31], mech: "vault",
    door: DG_DOORS.d_vault, floor: [0.55, 0.22, 0.62], wall: [0.56, 0.28, 0.74], fire: 0x9fd6ff,
    pack: ["isvaktare", "frostulv", "isande"], elites: ["valvbjorn", "skrymer"], boss: "skadi", map: VAULT}),
  makeDungeon({id: "d_crypt", name: "The Draug King's Crypt", sub: "The tomb of the Draug King", x0: 5000, z0: 0, lv: [19, 20], mech: "crypt",
    door: DG_DOORS.d_crypt, floor: [0.25, 0.08, 0.26], wall: [0.25, 0.06, 0.32], fire: 0x9aff8a,
    pack: ["cryptguard", "cryptpriest", "cryptghoul"], elites: [], boss: "boss", map: CRYPT})
];
export const dungeonAt = x => x > 500 ? DUNGEONS.find(d => x >= d.x0 - 50 && x < d.x0 + 900) || null : null;
export const dgBlocked = (x, z, r) => { const d = dungeonAt(x); return !d || d.blocked(x, z, r); };
export const dgLos = (ax, az, bx, bz) => { const d = dungeonAt(ax); return !!d && d === dungeonAt(bx) && d.los(ax, az, bx, bz); };
export const dgNavGrids = () => DUNGEONS.map(d => d.navGrid());

// build every dungeon's floor, walls, braziers and features (once)
export function buildDungeons(scene){
  const out = [], lam = c => new THREE.MeshLambertMaterial({color: c, flatShading: true});
  for(const d of DUNGEONS){
    const g = new THREE.Group(), T = d.T, Y = d.floorY, floors = [], walls = [], pillars = [], lava = [], water = [];
    for(let j = 0; j < d.H; j++) for(let i = 0; i < d.W; i++){ const c = d.kind(i, j);
      if(c === "o"){ pillars.push([i, j]); floors.push([i, j]); continue; }
      if(c === "L"){ lava.push([i, j]); continue; }
      if(c !== "#"){ floors.push([i, j]); if(c === "~") water.push([i, j]); continue; }
      let near = false; for(let dj = -1; dj <= 1; dj++) for(let di = -1; di <= 1; di++){ const k = d.kind(i + di, j + dj); if(k !== "#") near = true; } if(near) walls.push([i, j]); }
    const o = new THREE.Object3D(), col = new THREE.Color();
    const inst = (geo, mat, list, place) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); m.count = list.length; list.forEach((t, k) => { place(t, k); o.updateMatrix(); m.setMatrixAt(k, o.matrix); }); g.add(m); return m; };
    const tint = {"~": [0.55, 0.35, 0.22], i: [0.55, 0.35, 0.82], w: [0.56, 0.3, 0.74], r: [0.09, 0.14, 0.24], v: [0.02, 0.1, 0.12], "=": [0.08, 0.16, 0.24], "|": [0.08, 0.16, 0.24]};
    const fm = inst(new THREE.BoxGeometry(T, 0.2, T), lam(0xffffff), floors, ([i, j], k) => { const c = d.tileCenter(i, j); o.position.set(c.x, Y - 0.1, c.z); o.scale.set(1, 1, 1); o.rotation.set(0, 0, 0); });
    const fm_col = []; floors.forEach(([i, j]) => { const t = tint[d.kind(i, j)] || d.floor; fm_col.push(new THREE.Color().setHSL(t[0], t[1], t[2] + ((i * 7 + j * 13) % 5) * 0.015)); });
    fm_col.forEach((c, k) => fm.setColorAt(k, c)); fm.receiveShadow = true;
    const wm = inst(new THREE.BoxGeometry(T, 2.2, T), lam(0xffffff), walls, ([i, j]) => { const c = d.tileCenter(i, j); o.position.set(c.x, Y + 1.1, c.z); o.scale.set(1, 1 + ((i * 5 + j * 3) % 4) * 0.06, 1); });
    walls.forEach(([i, j], k) => { col.setHSL(d.wall[0], d.wall[1], d.wall[2] + ((i * 3 + j * 11) % 5) * 0.02); wm.setColorAt(k, col); }); wm.castShadow = true; wm.receiveShadow = true;
    if(pillars.length){ const pm = inst(new THREE.CylinderGeometry(0.75, 0.9, 3, 8), lam(new THREE.Color().setHSL(d.wall[0], d.wall[1], d.wall[2] + 0.08).getHex()), pillars, ([i, j]) => { const c = d.tileCenter(i, j); o.scale.set(1, 1, 1); o.position.set(c.x, Y + 1.5, c.z); }); pm.castShadow = true; }
    let lavaMat = null; if(lava.length){ lavaMat = new THREE.MeshLambertMaterial({color: 0xff5a1a, emissive: 0xff3a0a, emissiveIntensity: 0.9, flatShading: true});
      inst(new THREE.BoxGeometry(T, 0.2, T), lavaMat, lava, ([i, j]) => { const c = d.tileCenter(i, j); o.scale.set(1, 1, 1); o.position.set(c.x, Y - 0.35, c.z); }); }
    let waterMat = null; if(water.length){ waterMat = new THREE.MeshLambertMaterial({color: 0x2f7fb0, emissive: 0x0a3050, emissiveIntensity: 0.3, transparent: true, opacity: 0.6, depthWrite: false});
      inst(new THREE.BoxGeometry(T, 0.08, T), waterMat, water, ([i, j]) => { const c = d.tileCenter(i, j); o.scale.set(1, 1, 1); o.position.set(c.x, Y + 0.12, c.z); }); }
    // mine-cart tracks: two rails and the sleepers
    for(const tr of d.tracks){ const a = d.tileCenter(...tr.a), b = d.tileCenter(...tr.b), len = Math.hypot(b.x - a.x, b.z - a.z) + T, horiz = tr.a[1] === tr.b[1], mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
      for(const s of [-0.5, 0.5]){ const r = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 0.1, 0.1, horiz ? 0.1 : len), lam(0x6a6a70)); r.position.set(mx + (horiz ? 0 : s), Y + 0.06, mz + (horiz ? s : 0)); g.add(r); }
      for(let k = 0; k <= len / 0.9; k++){ const t = -len / 2 + k * 0.9, sl = new THREE.Mesh(new THREE.BoxGeometry(horiz ? 0.25 : 1.5, 0.06, horiz ? 1.5 : 0.25), lam(0x4a3220)); sl.position.set(mx + (horiz ? t : 0), Y + 0.02, mz + (horiz ? 0 : t)); g.add(sl); } }
    // unstable ceilings: timber props
    for(const z of d.rockZones) for(const [i, j] of z) if((i * 3 + j * 5) % 11 === 0){ const c = d.tileCenter(i, j), p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 0.2), lam(0x5a3e24)); p.position.set(c.x + 0.9, Y + 1.1, c.z + 0.9); p.rotation.z = 0.12; g.add(p); }
    // fire vents: a grate with a glow (dgmech.js lights them up before they erupt)
    const vents = d.vents.map(([i, j]) => { const c = d.tileCenter(i, j), v = new THREE.Group();
      v.add(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.12, 8), lam(0x2a2220)));
      const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 8), new THREE.MeshBasicMaterial({color: 0x6a1a0a})); glow.position.y = 0.02; v.add(glow);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.75, 3.4, 8, 1, true), new THREE.MeshBasicMaterial({color: 0xff8a2a, transparent: true, opacity: 0.85, side: THREE.DoubleSide})); flame.position.y = 1.7; flame.visible = false; v.add(flame);
      v.position.set(c.x, Y, c.z); g.add(v); return {i, j, x: c.x, z: c.z, glow, flame}; });
    // crypt gates: iron bars
    const gates = d.gates.map(gt => { const bars = new THREE.Group(), a = d.tileCenter(gt.i0, gt.j), b = d.tileCenter(gt.i1, gt.j), w = b.x - a.x + T;
      for(let k = 0; k <= w / 0.35; k++){ const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.6, 0.09), lam(0x3a3a42)); bar.position.set(a.x - T / 2 + k * 0.35, Y + 1.3, a.z); bars.add(bar); }
      for(const y of [0.3, 2.4]){ const rail = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.14), lam(0x2a2a30)); rail.position.set((a.x + b.x) / 2, Y + y, a.z); bars.add(rail); }
      g.add(bars); return {gt, bars}; });
    const braziers = [];
    for(const [i, j] of d.lights){ const c = d.tileCenter(i, j), b = new THREE.Group();
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.2, 0.4, 8), new THREE.MeshLambertMaterial({color: 0x3a3430})); bowl.position.y = 0.9;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.8, 6), new THREE.MeshLambertMaterial({color: 0x2a2420})); leg.position.y = 0.4;
      const fire = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 6), new THREE.MeshBasicMaterial({color: d.fire})); fire.position.y = 1.35;
      b.add(bowl, leg, fire); b.position.set(c.x, Y, c.z); g.add(b); braziers.push({x: c.x, z: c.z, fire}); }
    { const c = d.tileCenter(...d.exit); const door = new THREE.Mesh(new THREE.BoxGeometry(2, 2.6, 0.3), new THREE.MeshBasicMaterial({color: 0x9fd6e8, transparent: true, opacity: 0.55}));
      door.position.set(c.x, Y + 1.3, c.z - 0.9); g.add(door); }
    scene.add(g); out.push({d, braziers, vents, gates, waterMat, lavaMat, group: g}); }
  return out;
}
