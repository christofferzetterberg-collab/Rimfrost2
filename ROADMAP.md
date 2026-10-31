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

### Stage 9 – gathering, quest help and polish
- [x] Mining and Herbalism (skill 1–150): every zone has herbs and ore veins you can gather; rarer ones need more skill; gathered herbs and ore are trade goods you can sell
- [x] Gathering quests from the smiths and alchemists of the race towns and from Rimhaven's smith and apothecary (reach skill 15, 40, 80 and 110)
- [x] Quest help: a pillar of light over things your quests need, a ✦ on the name of monsters you need, gold dots on the minimap, quest areas on the world map and minimap, and where to go in the quest tracker
- [x] Longer range for bows and spells (mages, hunters, priests and druids, 25% further)
- [x] Race towns only have trainers for the classes that race can be
- [x] Merchants have separate Buy and Sell tabs, with "Sell all junk" (gray loot and poor equipment, never quest items)
- [x] Starting zones: the weakest monsters live closest to town and get stronger further out
- [x] Hunter pet bar: Attack (Ctrl+1), Follow (Ctrl+2) and the pet's skills, which can be switched on and off; pet health and rage / energy under your frame and in co-op party frames

## To fix

Numbered so we can refer to them. Tick them off as they get done.

### Co-op
- [x] 1. Show friends' mana, rage, energy and focus bars on their party frames
- [x] 2. Target friends by clicking them in the world (not only their frame); clicking on nothing clears the target
- [x] 3. Chat while in co-op (only then): Enter opens the chat box, Enter again sends

### General
- [x] 4. Spells cost a bit more mana, mostly felt at low level until you have gear with spell power and stats
- [x] 5. Stats: Stamina, Intellect, Strength and Agility, plus gear with spell damage and spell healing
- [x] 6. Every class has main stats to strive for, which give it the most benefit
- [x] 7. Riding from level 20: one riding trainer and mount seller for all classes; mounts make you 60% faster; druids get Travel Form at 20 and can also buy a mount
- [x] 8. Make it clearer when auto-attack is on (for example a pulsing red circle under the target)
- [x] 9. Monsters getting stuck in the mountains
- [x] 10. Players, monsters and pets can't climb hills that are too steep (a pet got stuck on a cliff edge)
- [x] 11. Monsters you attack from range don't notice you until hit by the spell or arrow (they still notice you by level and when you get too close)
- [x] 12. Death: press "Release Spirit" to appear at the zone's graveyard (one per zone, not always at a camp, only visible while dead). A spirit there offers to bring you back at once with a debuff (75% lower damage, healing, health, mana and stats for a while), or you walk back to your body and come back with 50% health and mana and no debuff

### Classes
- [x] 13. Talents split into specializations per class (at least two each), for example Druid: Balance (caster), Feral (wolf damage, bear tank) and Restoration (healing)
- [x] 14. Hunter: Dismiss Pet costs no gold, but can only be learned after Call Bear
- [x] 15. Druid: a quick bar for the shapeshifts, with changeable keys (default Ctrl+1 Bear, Ctrl+2 Wolf, Ctrl+3 Travel Form)

### General (added)
- [x] 16. Key bindings are saved per character
- [x] 17. Dev tools (?dev, F8): cheats, teleports and a class balance test

### To fix – list 2

#### Co-op
- [x] 18. Remove the description line under a targeted friend in the target frame

#### General
- [x] 19. Every shot or melee attack also starts auto-attack (not spells)
- [x] 20. Use more of each zone: spread quests and objectives out instead of keeping them close to the start
- [x] 21. While dead (a spirit): reduced vision, showing only the land and your body's marker; monsters and people only show when a few yards away (also on the maps)
- [x] 22. Talent reset only at the class trainer, for gold based on level (remove the free reset in the talent window)

#### Bugs
- [x] 23. You can't talk to the Spirit Guide to be resurrected with Resurrection Sickness
- [x] 24. While dead, people in towns shouldn't turn to face you

#### Classes
- [x] 25. Hunter: replace Ice Arrow with Cripple Shot (no damage, slows the target for 8 sec, 8 sec cooldown)
- [x] 26. Hunter: Dismiss Pet takes 5 sec to cast instead of being instant
- [x] 27. Hunter: remake Beast Mastery with more fun talents than plain % bonuses, for example an active pet skill added to the spellbook
- [x] 28. Paladin: start with Light's Mending, placed on the action bar
- [x] 29. Warrior: start with Mighty Strike (no need to learn it)
- [x] 30. Priest: start with Smite and Healing Light (no need to learn them)

### To fix – list 3

#### Co-op
- [x] 31. Friends see your spells and arrows (projectiles, rings and ground effects)
- [x] 32. Herbs, ore and quest items you pick up are your own; found places and kills count for friends nearby too

#### General (done in v0.12.3 / v0.12.4)
- [x] 33. People only look at you while you talk to them
- [x] 34. Dev tools only through F8 (not in the menu)
- [x] 35. Spells and buffs without a target go to yourself; click your own portrait to target yourself
- [x] 36. Your portrait and the target portrait no longer overlap
- [x] 37. Gear uses Stamina, Intellect, Agility, Strength, Spell Power and Spell Healing

### To fix – list 4

#### Dungeons
- [x] 38. Dungeons keep their state: defeated monsters stay dead (also after leaving or reloading) until you choose "Reset and enter" at the door; you get a prompt before going in
- [x] 39. Dying in a dungeon takes you to the nearest graveyard outside; entering the dungeon as a spirit brings you back to life at its entrance (or use the Spirit Guide); the dungeon is not reset

#### General
- [x] 40. No welcome message when you log in
- [x] 41. No "reset at your class trainer" line in the talent window
- [x] 42. Clear dungeon entrances with a sign (name, "Dungeon", levels); the Broken Watchtower moved away from the Iron Mine's door
- [x] 43. Ash Gargoyles (and the Magma Gargoyle) look like gargoyles

#### Classes
- [x] 44. Hunter: Raptor Strike's text is "A quick melee strike"

### To fix – list 5

#### Dungeons
- [x] 45. A unique layout for every dungeon, larger than today, with its own mechanics where possible
- [x] 46. Every dungeon quest can be completed in one run (enough monsters inside, or larger dungeons)

#### Classes
- [x] 47. Hunter: Spirit Bond heals every 5 sec instead of every second
- [x] 48. Hunter: better bow animation; the bow is held upright while shooting
- [x] 49. Druid: Entangling Roots has a 20 sec cooldown
- [x] 50. Mage: Ice Barrier talent teaches an active self-only absorb shield (lasts 1 min, 1 min cooldown)
- [x] 51. Mage: Shatter only applies to frozen targets (not rooted or slowed)
- [x] 52. Mage: Frost Ring freezes for 8 sec, 25 sec cooldown

### To fix – list 6

#### General
- [x] 53. Combo points (Wolf Form and rogues) belong to one target and are lost when the fight ends

#### Bugs
- [x] 54. Effects on your pet (such as Bestial Wrath) are shown; your pet can be selected, and your heals go to it

#### New classes
- [x] 55. Warlock: curses, damage over time, Shadow and Fire magic; an Imp (Firebolt, no taunt) and a Voidwalker (tank, like the hunter's bear)
- [x] 56. Rogue: two weapons, fast attacks, energy and combo points, Stealth
- [x] 57. Shaman: Nature magic, shocks and totems (Fire, Earth and Water)

### To fix – list 7

#### Dungeons
- [x] 58. Hazards along the way are deadly (mine carts, lava, fire vents and more); nothing that must be passed to finish a dungeon kills instantly
- [x] 59. More boss mechanics

#### General
- [x] 60. Remove "Rimfrost 2" at the top of the screen while playing

#### Classes
- [x] 61. Druid (level 10), Priest (level 10) and Paladin (level 12): a resurrect spell for co-op – 10 sec cast, out of combat only; the friend returns at the caster with 20% health and mana
- [x] 62. Warlock: the Imp uses mana, stands still and casts Firebolt when in range and follows you when out of range; the Voidwalker uses mana and its abilities have cooldowns instead of rage costs
- [x] 63. Rogue Stealth: no time limit (still shown as a buff); ends when you attack, use it again, take damage (also from traps) or are discovered; enemies notice you from a shorter range; you look faded (also to friends); the cooldown starts when Stealth ends

### To fix – list 8

#### Feature
- [x] 64. Accounts: log in with a name (and password) and keep your characters online, so they can be played from any browser

#### Bugs
- [x] 65. Clicking a herb or ore node again while gathering should not restart the gathering
- [x] 66. Clicking in the world (the ground, or anything) makes the game stutter for a moment
- [x] 67. If the target dies while you cast a spell on it, the cast stops (not for heals)

#### Classes
- [x] 68. Warlock: the Imp's Scorch does twice the damage and costs half the mana, and its tooltip no longer mentions a cooldown
- [x] 69. Warlock: a cast bar over the Imp while it casts, and a longer attack range

### Stage 10 – day and night
- [x] Game clock: a day lasts 80 minutes (night 20), the same for everyone in co-op; light, sky, mist, town firelight and a small light around you at night
- [x] More wolves, undead and spirits at night (a level higher); monsters see you from a bit shorter range in the dark
- [x] Moonbloom, a night-only herb, and the optional quest "Moonbloom"; the quest tracker and world map show what is better or only possible at night

### Stage 11 – racial abilities
- [x] Lower racial bonuses: Human +5% XP, Orc +3% damage, Elf +3% dodge, Dwarf +8% health, Undead faster regeneration
- [x] A racial ability for each race with its own visual effect: Sprint (Human), Bloodrage (Orc), Shadowmeld (Elf), Stoneform (Dwarf), Will of the Dead (Undead)

## Planned

### Next
- [ ] Sound effects (CC0 sounds from Rimfrost 1)
- [x] Dungeon group scaling: tougher dungeon monsters, +70% health and +10% damage per extra player, one gear drop per elite/boss with Need / Greed / Pass rolls
- [ ] Rimfrost 1's dungeon puzzles (levers, runes and gates)
- [ ] A raid for level 30 only (3–5 players): a new, bigger dungeon with bosses that have mechanics, and better rewards
- [ ] The smith's weapon upgrades and other crafting (on hold)

### Art
- [ ] Replace the shape-built characters and monsters with free CC0 low-poly models with animations: KayKit Adventurers and KayKit Character Animations (CC0, Kay Lousberg)
  - [x] Step 1: style test (the six KayKit characters in the game's lighting)
  - [x] Step 2: one character in the game: human warriors (Knight) with idle, run, attack, cast, sit and death animations
  - [x] Step 3: the races (skin, size, ears, tusks, beards) – on warriors
  - [x] Step 4: every class with its own model, colours and weapons; equipped gear changes the look
  - [x] Step 5: pets and druid forms
    - [x] Hunter wolf, Wolf Form and Leopard Form (Quaternius Animal Pack Vol. 2, CC0), druid forms coloured by race
    - [x] Druid model, Imp (KayKit Tiefling), Voidwalker (KayKit Frost Golem, recoloured), new wolf (Quaternius Ultimate Animals)
    - [x] Bear (hunter pet and Bear Form)
  - [x] Step 6: NPCs and monsters, zone by zone
    - [x] Town NPCs; wolves, foxes, jackals and deer; bandits, thieves, robbers, raiders, Lost Druids, Ironclan Warriors, Chieftain Grimm; skeletons and crypt undead
    - [x] Golems, trolls and giants, ghouls, cultists and witches, guardians and the dungeon bosses (KayKit Mystery Monthly characters)
    - [x] Bears (and Bear Form), boars, spiders, beetles, scorpions, drakes and gargoyles, kobolds and goblins, hares and rats
    - [ ] Wisps and spirits stay as glowing effects
  - [x] Step 7: environment (trees, rocks, buildings, dungeon walls)
    - [x] Trees, rocks and bushes (KayKit Forest Nature Pack)
    - [x] Buildings (KayKit Medieval Hexagon Pack)
    - [x] Dungeon walls and props (KayKit Dungeon Pack)

## Ideas to investigate

- [ ] A rare night-only elite in some zones
