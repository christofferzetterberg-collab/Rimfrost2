// Shared game state. Rimfrost 1's ability code (rimdata.js) reads P, mobs and the helper table E from here.
export const P = {};            // the player (world units: x, z; Rimfrost pixels: px, py)
export const S = {cur: null};   // the saved character: name, race, cls, level, xp, learned
export const E = {};            // helper functions the abilities call (filled in by engine.js)
export const mobs = [];         // all monsters
export const PXU = 23;          // Rimfrost pixels per world unit (52 px melee range ≈ 2.3 units)
