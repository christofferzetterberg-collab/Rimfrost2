# Rimfrost 2

A 3D, low-poly follow-up to [Rimfrost](https://github.com/christofferzetterberg-collab/Rimfrost): a WoW-inspired RPG that runs in the browser, seen from an angled top-down camera.

**Status:** prototype – Rimfrost 1's whole world in 3D: one open map with 14 zones (levels 1–30), a starting town for each race, Rimhaven, five dungeons and all of Rimfrost 1's quests; co-op with trading. See [ROADMAP.md](ROADMAP.md).

## Play

Open the GitHub Pages address once Pages is turned on for this repo.

## Controls (PC)

Every character has its own keys, changed in **Key bindings (K)**. The defaults:

- **Move:** W A S D or the arrow keys
- **Mouse:** left click targets (a monster or a friend; clicking the ground clears it) · right click attacks, talks to people and picks things up · hold the right button and move the mouse to turn the camera · wheel (or − / =) zooms
- **Target:** Tab · **Attack:** T · **Talk / pick up:** F when close
- **Action bars:** 1 – 0 and Shift+1 – 0 · arrange them in the **Spellbook (P)** by dragging
- **Quests / Character / Bag / Talents:** L / C / B / N · **Rest:** X · **Potions:** H health, G mana
- **World map:** M · **Mount:** Y (after learning Riding at level 20 in Rimhaven)
- **Hunter pet:** Ctrl+1 attack · Ctrl+2 follow · Ctrl+3 / Ctrl+4 switch the pet's skills on or off
- **Druid forms:** Ctrl+1 Bear · Ctrl+2 Wolf · Ctrl+3 Travel Form
- **Co-op:** Esc → Co-op (or O): host to get a code, or join a friend's code · right-click a friend to trade · Enter to chat
- **Esc:** closes windows, cancels a cast, clears the target, otherwise opens the menu (with Logout)

## Credits and licenses

- **three.js** (`lib/three.module.min.js`): MIT License, Copyright © 2010-2024 three.js authors (see `lib/THREE-LICENSE.txt`).
- **PeerJS** (`lib/peerjs.min.js`): MIT License, Copyright © 2015 Michelle Bu and Eric Zhang (see `lib/PEERJS-LICENSE.txt`).
- Races, classes, abilities and ability icons come from Rimfrost 1 (`src/rimdata.js`); the world, monsters, people and quests too (`src/worlddata.js`, `src/mobs.js`, `src/content.js`).
- Character, monster and weapon models: **KayKit** by Kay Lousberg (www.kaylousberg.com), CC0 (`assets/kaykit`).
- Tree, rock and bush models: **KayKit Forest Nature Pack** by Kay Lousberg, CC0 (`assets/nature`).
- Building and prop models: **KayKit Medieval Hexagon Pack** by Kay Lousberg, CC0 (`assets/buildings`).
- Dungeon models: **KayKit Dungeon Pack** by Kay Lousberg, CC0 (`assets/dungeon`).
- Animal and monster models: **Quaternius** (quaternius.com), CC0: wolf, fox, deer, stag, cat, spider, rat, dragon and goblin (`assets/animals`).
- [Black bear](https://poly.pizza/m/56ym_pyVnel), [Boar](https://poly.pizza/m/57fSWum6F1P), [Beetle](https://poly.pizza/m/4yufxgZ1QQ2) and [Rabbit](https://poly.pizza/m/9OBTRVYUSmt) by [Poly by Google](https://poly.pizza/u/Poly%20by%20Google), [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/), via Poly Pizza. Rigged and animated for the game.
- [Scorpion](https://poly.pizza/m/cJfrRPiSgA4) by [jeremy](https://poly.pizza/u/jeremy), [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/), via Poly Pizza. Rigged and animated for the game.
- The stable, braziers, gates and the remaining scenery are made from simple shapes in code.
