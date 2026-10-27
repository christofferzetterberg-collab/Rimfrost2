# Rimfrost 2 – Release notes

## v0.11.0

### New
- **Day and night:** a full day in Rimfrost lasts 80 minutes, and night takes 20 of them.
  - The light, sky and mist change through dawn, day, dusk and night.
  - At night towns and camps glow with firelight, and a small light follows you.
  - In co-op, everyone sees the same time of day.
- **The clock** under the minimap shows the time, and at night how long is left until dawn.
- **At night**, more wolves, undead and spirits come out, a level stronger than in the day. They go back into hiding at dawn. Monsters also notice you from a bit shorter range in the dark.
- **Moonbloom:** a new herb (Herbalism 20) that only opens at night, in Iron Ridge, Moonwood, the Bonefields and Mistmarsh.
- **New optional quest:** "Moonbloom" from Yrsa the Apothecary in Rimhaven (level 10).
- **Quest tracker:**
  - It says when a quest monster has more of its kind out at night.
  - For night-only objectives it shows how long until night falls.
  - At night, the world map marks those areas in blue.

## v0.10.1

### New
- Testing tools for development, including a class balance test. They are hidden in normal play.

## v0.10.0

### New
- **Talent specializations.** Every class now has three talent trees: Mage (Arcane, Fire, Frost), Warrior (Arms, Fury, Protection), Hunter (Beast Mastery, Marksmanship, Survival), Priest (Discipline, Holy, Shadow), Druid (Balance, Feral, Restoration) and Paladin (Holy, Protection, Retribution). A tier opens when you have spent enough points in that tree (3, 6, 8 and 10). Your old talent points are given back once, so you can choose again.
- **Stats:** Strength, Agility, Intellect and Stamina, plus Spell Damage and Spell Healing on gear.
  - Strength gives attack power. Warriors, paladins and druids get the most from it.
  - Agility gives attack power to hunters (and to druids in Bear and Wolf Form), plus attack crit and dodge.
  - Intellect gives mana and spell crit, and spell power to mana users.
  - Stamina gives 10 health per point.
  - Spell Damage makes damage spells stronger. Spell Healing makes heals and shields stronger.
- **Main stats per class:** gear always rolls at least one of your class's main stats, and the Character sheet shows them (Warrior: Strength and Stamina, Hunter: Agility and Stamina, Mage and Priest: Intellect and Stamina, Paladin: Strength, Intellect and Stamina, Druid: Intellect, Agility, Strength and Stamina).
- **Riding:** at level 20, Stablemaster Hrafn in Rimhaven teaches Riding (120 gold) and sells mounts: Brown Horse, Gray Stallion, Mountain Ram and Dire Wolf. Mounts make you 60% faster. Press Y (or the Mount button) to mount; it takes 1.5 seconds and can't be done in combat or in dungeons. Attacking or using an ability gets you off. Friends in co-op see you riding.
- **Travel Form:** the druid's Leopard Form is now Travel Form (level 20), 60% faster. Druids can also buy a mount.
- **Death and graveyards.** When you die, press Release Spirit and you appear as a spirit at the nearest graveyard. Every zone has one, and you can only see them while dead. From there you have two choices:
  - Walk back to your body (a white light, also shown on your maps) and press Resurrect (or F) to come back with half your health and mana.
  - Ask the Spirit Guide to bring you back right away. You then get Resurrection Sickness: your damage, healing, health, mana and stats are 75% lower for 3 minutes.
  - If you die in a dungeon, you appear as a spirit at the dungeon entrance.
- **Co-op chat:** press Enter to open the chat box and Enter again to send. It only works in co-op.
- **Druid shapeshift bar:** Bear Form (Ctrl+1), Wolf Form (Ctrl+2) and Travel Form (Ctrl+3) on a small bar above your action bars.
- **Every character has its own key bindings.** Hunters get the pet keys (Ctrl+1–4) and druids the form keys (Ctrl+1–3), without clashing.

### Changed
- Spells cost about 40% more mana. Intellect on gear gives you a bigger mana pool to make up for it.
- Monsters you attack from range (spells, arrows, Hunter shots) only notice you when the attack hits them. They still notice you if you come too close, depending on their level.
- **Co-op:**
  - Friends' party frames now show their mana, rage, focus or energy.
  - Click a friend in the world to target them. They show in the target frame and your heals go to them.
  - Clicking empty ground clears your target.
- The ring under your target pulses red while you are attacking it, is yellow when you are not, and green for a friend.
- Hunter: Dismiss Pet is now free, and the trainer teaches it after Call Bear.
- Dwarves start with Mining 25.

### Fixed
- Steep hills can't be walked up anymore, by you, monsters or pets. You can still go down slopes that are too steep to climb.
- Monsters that can't reach you (for example over a cliff) give up and go home instead of getting stuck in the mountains.
- A pet that gets stuck (for example on a cliff edge) comes back to you.

## v0.9.1

### New
- **Pet bar (Hunter):** a small bar above your action bars while your bear or wolf is out:
  - **Attack** (Ctrl+1): your pet attacks your target.
  - **Follow** (Ctrl+2): your pet stops attacking and comes back to you. It stays out of the fight until the fight is over or you give it a new attack order.
  - **Pet skills:** Growl and Sweep for the bear, Claw for the wolf. Click a skill (or press Ctrl+3 / Ctrl+4) to switch it off, so your pet stops using it, and click again to switch it back on. Skills that are off are grayed out and marked OFF.
- **Pet frame:** your pet's health and its rage (bear) or energy (wolf) show under your own frame, along with what it is doing (Assisting, Attacking, Following).
- In co-op, friends see your pet's health and rage or energy under your party frame, and you see theirs.
- The pet keys can be changed in Key bindings (K) under "Pet".

## v0.9.0

### New
- **Mining and Herbalism.** Every zone now has herbs and ore veins to gather (right-click or press F). Your skill goes from 1 to 150 and rises as you gather. Rarer herbs and ore need more skill: Iron Ore and Silverweed need 15, Gold Ore 40, Dragon's Eye 55, Obsidian and Fire Bloom 80, and Rime Crystal and Ice Bloom 110. Herbs and ore you don't need for a quest go into your bag, and you can sell them.
- **Gathering quests.** The smiths and alchemists in every race town ask you to reach skill 15. In Rimhaven, Hakon the Smith and Yrsa the Apothecary have harder ones (40, 80 and 110).
- Your Mining and Herbalism skills show on the Character sheet (C).
- **Quest help:**
  - A pillar of golden light rises over things your quests need you to pick up, and over places you need to find.
  - Monsters you need for a quest have a gold ✦ before their name and can be seen from further away.
  - The world map (M) and the minimap show golden circles where your quest monsters and items can be found.
  - The quest tracker tells you which zone to go to, and which town to return to.
- On the minimap, herbs (green) and ore veins (orange) you can gather show up as small dots. Quest items and quest monsters are gold.

### Changed
- Bows and spells reach 25% further (Mage, Hunter, Priest and Druid ranged abilities, and the Hunter's auto shot). You can also heal friends from further away.
- Race towns only have trainers for the classes their race can be. For example, Burnmark no longer has a Druid trainer. Rimhaven still has every trainer.
- Merchants now have separate **Buy** and **Sell** tabs. The Sell tab has **Sell all junk**, which sells gray loot and poor-quality equipment but never quest items, potions, elixirs, herbs or ore. You can also sell a whole stack of an item at once.

### Fixed
- In the starting zones, the weakest monsters now live closest to town and get stronger the further out you go. High-level monsters no longer wait right outside town.
