# Rimfrost 2 – Roadmap

Tick items off with `[x]` when they are done. Add new items at the bottom of the right section.

**Decided:** three.js in the browser · angled top-down camera · PC first · stylized low-poly art

## Done

(Stages 4b–7 built zones of their own; stage 8 replaced them with Rimfrost 1's world.)

### Stage 1 – walk around the world
- [x] Low-poly terrain with meadows, hills, mountains around the edge, a road and a lake (water only in the lake)
- [x] Village with houses and a fountain; trees and rocks
- [x] Player character with walk animation
- [x] Movement with W A S D / arrow keys, collision with trees, rocks, houses, water and steep slopes
- [x] Angled top-down camera that follows you, zoom with the mouse wheel, turn with Q / E
- [x] Houses between the camera and you turn see-through
- [x] Shadows, fog and zone names (Frostwick, Mirror Lake, Frost Meadows, Iron Foothills)

### Stage 2 – monsters and combat
- [x] Gray Wolves (level 1–2), Wild Boars (2–3) and Bandits (3–4), each in their own areas so the levels don't mix
- [x] Monsters wander, notice you (with line of sight), call nearby friends, chase, attack, give up and return home
- [x] Line of sight: hills, mountains, houses and big rocks block it (trees don't)
- [x] Targeting (click, Tab), selection ring, auto-attack, Strike (1), target frame, nameplates with health bars, floating damage numbers
- [x] XP, level ups, health regeneration out of combat
- [x] Death, Release Spirit back in Frostwick; monsters respawn after 3 minutes (as in Rimfrost)

### Stage 3 – races, classes and spells
- [x] Monsters (and click-to-move) find their way around houses, rocks, trees and water instead of walking straight into them
- [x] Character creation and selection: name, 5 races (Human, Orc, Elf, Dwarf, Undead) with their Rimfrost bonuses and class limits, saved in the browser
- [x] Race and class looks: elf ears, orc tusks, dwarf beard and stocky build, undead glowing eyes; robes, armor, staff, sword, bow or hammer by class
- [x] All 6 classes with every Rimfrost ability: Mage, Warrior, Hunter, Priest, Druid, Paladin
- [x] Resources: mana, rage, focus and energy (with combo points); global cooldown, cooldowns, cast bar that is interrupted when you move
- [x] Druid forms: Bear, Wolf and Leopard, with their own models and action bars
- [x] Action bar with Rimfrost's ability icons, keys 1 – 9, 0, −, = and tooltips; new abilities are learned from the trainer
- [x] Hunter ranged auto-attack with arrows; Charge, Disengage, stuns, roots, slows, damage and healing over time, shields, ground effects
- [x] 3D spell effects: projectiles, arrows, rings, bursts, slashes and ground zones
- [x] Monster health, damage and XP use Rimfrost's formulas

### Stage 3b – character
- [x] Talents from level 10 (N): all of Rimfrost's talent trees, with their effects
- [x] Character sheet (C) with equipment slots and stats; bag (B) with equipment (30 places), potions and loot
- [x] Random equipment from Rimfrost (6 qualities, armor and weapon types per class, stat comparison in the tooltip)
- [x] Loot: gold from bandits, pelts, tusks and rings, and equipment drops
- [x] Hunter pets: Call Bear (tank, Growl and Sweep) and Call Wolf (damage, Claw), Mend Pet, Dismiss Pet; monsters attack the pet by threat
- [x] Resting (X) for 2.5× faster health and mana; healing (H) and mana (G) potions with a shared cooldown
- [x] File versions in `index.html` (the `?v=` numbers) so the browser never mixes old and new game files, and a visible error message instead of a stuck loading screen if the game fails to start
- [x] `serve.py`: local web server that stops the browser from using old, cached game files (that made the new buttons and resting seem broken)

### Stage 4a – Frostwick and Frost Meadows (levels 1–5)
- [x] Six people in Frostwick: Elder Maren, Captain Holt, Tova (merchant), Brokk (blacksmith), Aslaug (trainer), Lina (herbalist); names, titles and quest marks (! and ?) over their heads
- [x] Talk to people and pick things up: click them or press F when close
- [x] 10 quests: kill, loot and pick-up quests, a quest chain ending with the elite bandit leader Rurik the Scarred; XP, gold, potions and equipment rewards
- [x] Quest tracker on the right, quest log (L) with abandon
- [x] Frostleaf by Mirror Lake, Tova's overturned cart on the east road, a bandit camp with tents and a campfire
- [x] Trainer: you now learn abilities from Aslaug for gold (no longer automatically); talent reset costs gold there
- [x] Merchant (potions and elixirs, sell loot) and blacksmith (equipment for your class, sell equipment)
- [x] Drop rates back to Rimfrost's: equipment 8% from bandits, 2% from animals, 60% from elites; no random potion drops

### Controls and interface
- [x] No click-to-move: you move with the keys only, and the character never walks to an enemy by itself
- [x] Mouse: left click targets; right click attacks a monster, talks to people and picks things up (when close); hold the right button and move the mouse to turn and tilt the camera
- [x] Two action bars of 10 slots: keys 1 – 0 and Shift+1 – 0, with the cast bar above them; Q and E are free for abilities
- [x] Spellbook (P): drag abilities, Attack, potions and Rest onto any slot; drag slots to swap them or off the bars to empty them; each druid form has its own bar layout
- [x] Key bindings (K): every action can have two keys of your choice (also Shift / Ctrl / Alt combinations), saved in the browser
- [x] Esc: closes a window, cancels a cast, clears the target, otherwise opens the menu (Quests, Character, Bag, Spellbook, Talents, Key bindings, Logout)
- [x] Minimap in the top right corner that turns with the camera: monsters, people with quest marks, quest objects, your pet
- [x] Global cooldown starts when you press an ability; cancelling or interrupting a cast (moving or Esc) frees it again
- [x] Spell pushback: every hit while casting sets the cast back 0.5 sec, at most 3 times per cast
- [x] Buff and debuff icons with time left: under your frame (buffs, heals over time, shields, elixirs, resting, potion cooldown) and under the target frame (damage over time, stun, root, slow, taunt)

### Stage 4b – the Darkpine Forest (levels 5–10)
- [x] One big map: a mountain ridge north of Frost Meadows with a pass (Frostgate Pass) and a road into the new zone
- [x] Darkpine Forest: dense pine forest, Hollow Pine Camp (lumber camp), the Spider Thicket, Troll Hollow and the Ashen Ruins
- [x] New people: Foreman Bjarne, Sigrid the huntress, and Olav the quartermaster (potions and equipment up to level 11)
- [x] 12 new quests (d1–d12), from Captain Holt's lead to the end boss of the Hollow Crypt; amber resin and the scout's journal to find
- [x] New monsters: Darkpine Spiders, Forest Trolls, Ashen Cultists (spellcasters that shoot bolts from range) and the elite Grukk the Rootbreaker
- [x] You wake up at the nearest village or camp when you die

### Stage 4c – the Hollow Crypt (first dungeon, levels 10–12)
- [x] A separate dungeon map under the Ashen Ruins, entered through the crypt door (right-click or F); a glowing doorway leads out
- [x] Dark, torch-lit halls and chapels with braziers; its own minimap
- [x] Ashen Acolytes, Crypt Guardians, the elite Bonewarden and the boss Morvane the Ashen, whose Ashen Nova must be dodged (a red circle grows – get out)
- [x] Monsters inside never respawn while you are in it; everything comes back the next time you enter after leaving
- [x] Built for groups: in co-op everyone visits the host's crypt together

### Stage 4d – equipment you can see
- [x] Your equipped helmet, shoulders, chest, gloves, legs, boots, weapon (sword, axe, mace, staff, wand, bow) and shield or tome show on your character, tinted by quality

### Stage 5 – co-op
- [x] Ported from Rimfrost 1 (PeerJS, now included in the game folder): one player hosts and gets a code, friends join with it (Esc → Co-op, or O)
- [x] Shared monsters run by the host; XP is split between everyone nearby; loot is personal; monsters pick targets by threat (warriors and bears hold it better)
- [x] Heal and shield friends: left-click a friend or their frame to select them; War Cry and Holy Wave also reach friends nearby
- [x] Pets in co-op (monsters can attack friends' pets, a bear's Growl works for everyone), party frames, friends on the minimap

### Stage 6 – the Frostpeak Highlands, trading and the world map
- [x] Frostpeak Highlands (levels 10–15) east of the Darkpine Forest, through Eastgate Pass: snowfields, snowy pines, the Yeti Peaks and the Kobold Dig
- [x] Stonehold, a dwarf outpost: Thane Haldor and Brunhild (quests), Ragna (potions, elixirs, equipment up to level 17) and Ulfar (a second trainer)
- [x] 12 new quests (h1–h12): Frost Wolves, Yetis, Coldiron Kobolds and Kobold Geomancers, glacier lilies, the lost survey map, and the elite Frostmaw
- [x] The Coldiron Mine (levels 14–17), a second dungeon: Coldiron Diggers, Kobold Earthshapers, the elite Iron Golem and the boss Overseer Grizzik, whose Cave-in drops a red circle under his target – step out of it
- [x] Trading in co-op: right-click a friend close to you; both put in equipment, items and gold, and the trade happens only when both have accepted
- [x] World map (M): the whole world with zone names, quest marks, quest objects, dungeon doors, friends and you; zoom with the mouse wheel (only the map zooms); inside a dungeon it shows the dungeon
- [x] Names and quest marks over people no longer lag behind when the camera turns

### Stage 7 – the Mirewood Marsh (levels 15–20)
- [x] A third ridge south of Frost Meadows with Southfen Pass; a road down to the marsh: pools, mud, reeds, willows, causeways and a green mist
- [x] Bogmere, a fishing village with a dock: Elder Wenna and Fisher Tor (quests), Hilde (potions, elixirs, equipment up to level 21) and Sven (a third trainer); you wake up in Bogmere when you die nearby
- [x] 12 new quests (m1–m12): Bog Lurkers, Mirefin and Mirefin Tidecallers, the Drowned, bog myrtle, mire pearls, tidestones, the drowned idol and the elite Old Gnasher
- [x] The Sunken Temple (levels 19–22), a third dungeon: Temple Drowned, Mirefin Zealots, the elite Drowned Priestess and the boss the Tidemother, whose Tidal Surge must be dodged
- [x] New zone names and labels on the world map and minimap

### Stage 8 – Rimfrost 1's world
- [x] The whole map from Rimfrost 1 as one open 3D world: 14 zones from levels 1 to 30, laid out the same way, joined by the same roads
- [x] A starting zone for each race: Frost Meadows and Shadowwood (human), Silver Grove and Moonwood (elf), Copper Cliffs and Snowvale (dwarf), Red Plains and Dust Canyon (orc), Gravelands and Bonefields (undead); new characters start in their race's town
- [x] Shared zones: Iron Ridge (10–15), Mistmarsh (15–20), Ashfields (20–25), Frostcrown (25–30)
- [x] Each kind of land has its own look: meadows, pine forest, birch groves with ponds, violet moonwood, rocky cliffs, snowfields, red mesas and cactus, canyon walls, marsh, ash with lava pools, ice, blighted fields and gloomy bogs; the sky and mist change with the zone
- [x] Five race towns in their own style, eight camps and the walled city of Rimhaven with its districts, gates and signs
- [x] All of Rimfrost 1's people: quest givers, merchants, alchemists, smiths, and a trainer for each class in every race town and in Rimhaven (each trainer teaches only their own class)
- [x] All of Rimfrost 1's monsters (about 70 kinds) and its elites in their lairs: Old Gray, Chieftain Grimm, Morvel, Snorre, Warlord Garuk, Vex, the Marsh Drake, the Magma Lord and Hrimgar the Ice Giant, each with their big attack to dodge; hares and deer only fight back
- [x] All 202 of Rimfrost 1's quests, including "find this place" quests (19 places, with sign posts and marks on the maps) and quests where you choose one of three pieces of equipment as the reward
- [x] Rimfrost 1's dungeons: the Iron Mine, the Drowned Temple, the Ember Forge, the Frost Vault and the Draug King's crypt
- [x] Ore and herbs from quests are picked up in the world (no gathering skills yet)
- [x] Characters from the old map move to their race's home town with a fresh quest log (level, gear and gold stay)

## Planned

### Next
- [ ] Sound effects (CC0 sounds from Rimfrost 1)
- [ ] Rimfrost 1's dungeon puzzles (levers, runes and gates) and group scaling
- [ ] Gathering skills (mining and herbalism) and the smith's weapon upgrades

### Art
- [ ] Replace the shape-built characters and monsters with free CC0 low-poly models with animations (for example Quaternius, KayKit or Kenney)

## Ideas to investigate

- [ ] Mobile support (touch controls)
- [ ] Day and night cycle
