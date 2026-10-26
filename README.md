# Rimfrost 2

A 3D, low-poly follow-up to [Rimfrost](https://github.com/christofferzetterberg-collab/Rimfrost): a WoW-inspired RPG that runs in the browser, seen from an angled top-down camera.

**Status:** prototype – stage 1 (walk around a 3D world). See [ROADMAP.md](ROADMAP.md).

## Play

Open the GitHub Pages address once Pages is turned on for this repo, or run it locally (see below).

## Controls (PC)

- **Move:** W A S D or the arrow keys, or left-click the ground
- **Camera:** mouse wheel to zoom, Q / E to turn

## Run locally

The game loads its code as modules, so it needs a small web server instead of opening `index.html` directly.
In the Rimfrost2 folder, run `python3 -m http.server 8000` in Terminal and open http://localhost:8000 in your browser.

## Credits and licenses

- **three.js** (`lib/three.module.min.js`): MIT License, Copyright © 2010-2024 three.js authors (see `lib/THREE-LICENSE.txt`).
- All 3D models in stage 1 are made from simple shapes in code.
