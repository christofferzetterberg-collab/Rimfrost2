# Rimfrost 2

A 3D, low-poly follow-up to [Rimfrost](https://github.com/christofferzetterberg-collab/Rimfrost): a WoW-inspired RPG that runs in the browser, seen from an angled top-down camera.

**Status:** prototype – Rimfrost 1's whole world in 3D: one open map with 14 zones (levels 1–30), a starting town for each race, Rimhaven, five dungeons and all of Rimfrost 1's quests; co-op with trading. See [ROADMAP.md](ROADMAP.md).

## Play

Open the GitHub Pages address once Pages is turned on for this repo, or run it locally (see below).

## Controls (PC)

All keys can be changed in **Key bindings (K)**. The defaults:

- **Move:** W A S D or the arrow keys
- **Mouse:** left click targets · right click attacks, talks to people and picks things up · hold the right button and move the mouse to turn the camera · wheel (or − / =) zooms
- **Target:** Tab · **Attack:** T · **Talk / pick up:** F when close
- **Action bars:** 1 – 0 and Shift+1 – 0 · arrange them in the **Spellbook (P)** by dragging
- **Quests / Character / Bag / Talents:** L / C / B / N · **Rest:** X · **Potions:** H health, G mana
- **World map:** M
- **Co-op:** Esc → Co-op (or O): host to get a code, or join a friend's code · right-click a friend to trade
- **Esc:** closes windows, cancels a cast, clears the target, otherwise opens the menu (with Logout)

## Run locally

The game loads its code as modules, so it needs a small web server instead of opening `index.html` directly.
In Terminal, run `cd ~/Documents/GitHub/Rimfrost2 && python3 serve.py` and open http://localhost:8000 in your browser.
`serve.py` tells the browser not to keep old copies of the game files, so a normal reload always gives you the newest version. Press Ctrl+C in Terminal to stop it.

## Credits and licenses

- **three.js** (`lib/three.module.min.js`): MIT License, Copyright © 2010-2024 three.js authors (see `lib/THREE-LICENSE.txt`).
- **PeerJS** (`lib/peerjs.min.js`): MIT License, Copyright © 2015 Michelle Bu and Eric Zhang (see `lib/PEERJS-LICENSE.txt`).
- Races, classes, abilities and ability icons come from Rimfrost 1 (`src/rimdata.js`); the world, monsters, people and quests too (`src/worlddata.js`, `src/mobs.js`, `src/content.js`).
- All 3D models (characters, monsters, houses, trees) are made from simple shapes in code.
