// Key bindings: every action can have two keys. Saved in this browser (the same for all characters).
// A key is written like "KeyW", "Digit1" or "Shift+Digit1" (the browser's name for the physical key, plus Shift / Ctrl / Alt).
export const ACTIONS = [
  ["Movement", [["up", "Move forward"], ["down", "Move back"], ["left", "Move left"], ["right", "Move right"]]],
  ["Camera", [["zoomIn", "Zoom in"], ["zoomOut", "Zoom out"]]],
  ["Combat", [["attack", "Start / stop attacking"], ["target", "Target nearest enemy"], ["interact", "Talk / pick up"], ["rest", "Rest (sit down)"], ["potHp", "Healing potion"], ["potMana", "Mana potion"]]],
  ["Windows", [["map", "World map"], ["quests", "Quest log"], ["char", "Character"], ["bag", "Bag"], ["spells", "Spellbook"], ["tal", "Talents"], ["keys", "Key bindings"], ["coop", "Co-op"]]],
  ["Action bar", Array.from({length: 10}, (_, i) => ["b" + (i + 1), `Action bar slot ${i + 1}`])],
  ["Second action bar", Array.from({length: 10}, (_, i) => ["s" + (i + 1), `Second bar slot ${i + 1}`])]
];
const digit = i => "Digit" + ((i + 1) % 10);
export const DEFAULTS = {
  up: ["KeyW", "ArrowUp"], down: ["KeyS", "ArrowDown"], left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"],
  zoomIn: ["Equal"], zoomOut: ["Minus"],
  attack: ["KeyT"], target: ["Tab"], interact: ["KeyF"], rest: ["KeyX"], potHp: ["KeyH"], potMana: ["KeyG"],
  map: ["KeyM"], quests: ["KeyL"], char: ["KeyC"], bag: ["KeyB"], spells: ["KeyP"], tal: ["KeyN"], keys: ["KeyK"], coop: ["KeyO"]
};
for(let i = 0; i < 10; i++){ DEFAULTS["b" + (i + 1)] = [digit(i)]; DEFAULTS["s" + (i + 1)] = ["Shift+" + digit(i)]; }

const STORE = "rimfrost2-keys";
export let binds = load();
function load(){ let saved = null; try{ saved = JSON.parse(localStorage.getItem(STORE)); }catch(e){}
  const b = {}; for(const k in DEFAULTS) b[k] = (saved && saved[k]) ? saved[k].slice(0, 2) : DEFAULTS[k].slice(); return b; }
function save(){ try{ localStorage.setItem(STORE, JSON.stringify(binds)); }catch(e){} }
export function resetKeys(){ binds = {}; for(const k in DEFAULTS) binds[k] = DEFAULTS[k].slice(); save(); }
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
