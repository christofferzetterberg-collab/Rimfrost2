// The game clock: a full day passes in CYCLE_MIN real minutes. It runs on the computer's clock, so everyone in co-op sees the same time of day.
// Night is a quarter of the day (21:00–03:00); dawn (03–06) and dusk (18–21) blend between them.
export const CYCLE_MIN = 80;
let offset = 0;                                             // hours added (the dev tools use it to jump to a time of day)
export const setHour = h => { offset = 0; offset = ((h - gameHour()) % 24 + 24) % 24; };
export function gameHour(){ return ((Date.now() / 60000 / CYCLE_MIN * 24) + 7 + offset) % 24; }
export const isNight = (h = gameHour()) => h >= 21 || h < 3;
// how much daylight there is: 1 = full day, 0 = full night
export function daylight(h = gameHour()){ if(h >= 6 && h < 18) return 1; if(h >= 21 || h < 3) return 0;
  const t = h >= 18 ? 1 - (h - 18) / 3 : (h - 3) / 3; return t * t * (3 - 2 * t); }
// real minutes until night starts (0 while it is night)
export function minutesToNight(h = gameHour()){ if(isNight(h)) return 0; return ((21 - h + 24) % 24) * CYCLE_MIN / 24; }
export function minutesToDay(h = gameHour()){ if(!isNight(h)) return 0; return ((3 - h + 24) % 24) * CYCLE_MIN / 24; }
export function clockText(h = gameHour()){ const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; }
// monsters that come out in greater numbers at night: wolves, the undead, spirits and grave robbers
export const NIGHT_KINDS = new Set(["wolf", "shadewolf", "plaguewolf", "frostwolf", "rat", "shambler", "boneguard", "robber", "ghoul", "wisp", "wisplight"]);
