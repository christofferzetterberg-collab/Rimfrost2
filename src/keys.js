// Key bindings: every action can have two keys. Each character has its own bindings (saved with the character).
// A key is written like "KeyW", "Digit1" or "Shift+Digit1" (the browser's name for the physical key, plus Shift / Ctrl / Alt).
export const ACTIONS = [
  ["Movement", [["up", "Move forward"], ["down", "Move back"], ["left", "Move left"], ["right", "Move right"]]],
  ["Camera", [["zoomIn", "Zoom in"], ["zoomOut", "Zoom out"]]],
  ["Combat", [["attack", "Start / stop attacking"], ["target", "Target nearest enemy"], ["interact", "Talk / pick up"], ["rest", "Rest (sit down)"], ["potHp", "Healing potion"], ["potMana", "Mana potion"], ["mount", "Mount / dismount"], ["chat", "Co-op chat"]]],
  ["Pet", [["petAttack", "Pet: attack your target"], ["petFollow", "Pet: stop attacking and follow"], ["petSkill1", "Pet: switch skill 1 on / off"], ["petSkill2", "Pet: switch skill 2 on / off"], ["petSkill3", "Pet: switch skill 3 on / off"]], ["hunter", "warlock"]],
  ["Shapeshift", [["formBear", "Bear Form"], ["formCat", "Wolf Form"], ["formTravel", "Travel Form"]], "druid"],
  ["Windows", [["map", "World map"], ["quests", "Quest log"], ["char", "Character"], ["bag", "Bag"], ["spells", "Spellbook"], ["tal", "Talents"], ["keys", "Key bindings"], ["coop", "Co-op"]]],
  ["Action bar", Array.from({length: 10}, (_, i) => ["b" + (i + 1), `Action bar slot ${i + 1}`])],
  ["Second action bar", Array.from({length: 10}, (_, i) => ["s" + (i + 1), `Second bar slot ${i + 1}`])]
];
const digit = i => "Digit" + ((i + 1) % 10);
export const DEFAULTS = {
  up: ["KeyW", "ArrowUp"], down: ["KeyS", "ArrowDown"], left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"],
  zoomIn: ["Equal"], zoomOut: ["Minus"],
  attack: ["KeyT"], target: ["Tab"], interact: ["KeyF"], rest: ["KeyX"], potHp: ["KeyH"], potMana: ["KeyG"],
  mount: ["KeyY"], chat: ["Enter"],
  map: ["KeyM"], quests: ["KeyL"], char: ["KeyC"], bag: ["KeyB"], spells: ["KeyP"], tal: ["KeyN"], keys: ["KeyK"], coop: ["KeyO"]
};
for(let i = 0; i < 10; i++){ DEFAULTS["b" + (i + 1)] = [digit(i)]; DEFAULTS["s" + (i + 1)] = ["Shift+" + digit(i)]; }

// class keys: hunters order their pet, druids change shape (Ctrl+1, Ctrl+2, ...)
const PET_KEYS = {petAttack: ["Ctrl+Digit1"], petFollow: ["Ctrl+Digit2"], petSkill1: ["Ctrl+Digit3"], petSkill2: ["Ctrl+Digit4"], petSkill3: ["Ctrl+Digit5"]};
const CLASS_DEFAULTS = {hunter: PET_KEYS, warlock: PET_KEYS,
  druid: {formBear: ["Ctrl+Digit1"], formCat: ["Ctrl+Digit2"], formTravel: ["Ctrl+Digit3"]}};
const ALL_IDS = ACTIONS.flatMap(g => g[1].map(a => a[0]));
export function defaultsFor(cls){ const b = {}; for(const k of ALL_IDS) b[k] = (DEFAULTS[k] || []).slice(); Object.assign(b, JSON.parse(JSON.stringify(CLASS_DEFAULTS[cls] || {}))); return b; }
export const groupsFor = cls => ACTIONS.filter(g => !g[2] || [].concat(g[2]).includes(cls));
const OLD_STORE = "rimfrost2-keys";                      // before: one set of keys for everyone in this browser
let cur = null; export let onSave = null; export const setOnSave = f => { onSave = f; };
export let binds = defaultsFor(null);
// switch to a character's own keys (a character from before gets the old shared keys once, plus its class keys)
export function useChar(c){ cur = c; const def = defaultsFor(c.cls); let saved = c.keys;
  if(!saved){ try{ saved = JSON.parse(localStorage.getItem(OLD_STORE)); }catch(e){} }
  binds = {}; for(const k in def) binds[k] = saved && saved[k] ? saved[k].slice(0, 2) : def[k].slice();
  if(saved) for(const k in def) if(!saved[k]) binds[k] = binds[k].filter(combo => !Object.keys(binds).some(o => o !== k && saved[o] && binds[o].includes(combo)));   /* new actions: skip keys already in use */
  if(!c.keys){ for(const k in CLASS_DEFAULTS[c.cls] || {}) for(const combo of def[k]) for(const o in binds) if(o !== k && binds[o].includes(combo)) binds[o] = binds[o].filter(x => x !== combo); }
  save(); }
function save(){ if(cur){ cur.keys = JSON.parse(JSON.stringify(binds)); if(onSave) onSave(); } }
export function resetKeys(){ binds = defaultsFor(cur && cur.cls); save(); }
// set key slot (0 or 1) of an action; a key can only do one thing, so it is taken away from any other action. Returns the action it was taken from.
export function setBind(action, slot, combo){
  let took = null;
  if(combo) for(const k in binds){ const i = binds[k].indexOf(combo); if(i >= 0 && !(k === action && i === slot)){ binds[k].splice(i, 1); took = k; } }
  const list = binds[action].slice(); if(combo) list[slot] = combo; else list.splice(slot, 1);
  binds[action] = list.filter(Boolean).slice(0, 2); save(); return took;
}
const MOD_CODES = new Set(["ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight"]);
export function comboOf(e){ if(MOD_CODES.has(e.code)) return null; return (e.ctrlKey ? "Ctrl+" : "") + (e.altKey ? "Alt+" : "") + (e.shiftKey ? "Shift+" : "") + e.code; }
export function actionFor(combo){ for(const k in binds) if(binds[k].includes(combo)) return k; return null; }
export const isMoveAction = a => ["up", "down", "left", "right"].includes(a);
// is one of this action's keys held down right now (modifiers ignored, so Shift+W still walks)
export function held(action, down){ return binds[action].some(c => down.has(c.split("+").pop())); }
// how a key is shown: "Shift+Digit1" → "Shift+1", short: "S1"
const NAMES = {Space: "Space", Minus: "-", Equal: "=", Backquote: "`", BracketLeft: "[", BracketRight: "]", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/", Backslash: "\\",
  ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right", Tab: "Tab", Enter: "Enter", Backspace: "Backspace", CapsLock: "Caps Lock", IntlBackslash: "<"};
export function keyName(code){ if(!code) return ""; if(NAMES[code]) return NAMES[code]; if(code.startsWith("Key")) return code.slice(3); if(code.startsWith("Digit")) return code.slice(5);
  if(code.startsWith("Numpad")) return "Num " + code.slice(6); return code; }
export function pretty(combo){ if(!combo) return ""; const parts = combo.split("+"); return [...parts.slice(0, -1), keyName(parts[parts.length - 1])].join("+"); }
export function short(combo){ if(!combo) return ""; const parts = combo.split("+"), k = keyName(parts.pop()); return parts.map(m => m[0]).join("") + k; }
export const keyOf = action => binds[action] && binds[action][0] ? pretty(binds[action][0]) : "–";
