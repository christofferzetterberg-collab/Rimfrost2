# Rimfrost 2 – Release notes

## v0.16.3

### Changed
- Monster health now scales more steeply with level. Low-level monsters are nearly unchanged; level 15 monsters have about 90% more health and level 25 monsters about 150% more.
- Elite monsters have 50% more health, and bosses an additional 50%.

## v0.16.2

### Fixed
- You can no longer get stuck in pits or on ledges below steep slopes. If you cannot move for a few seconds, you are moved to the nearest open ground.

## v0.16.1

### Changed
- All equipment now carries additional Stamina based on item level, quality and slot. A full set of level 17 Uncommon gear gives about 40 Stamina (+400 health).
- Equipment you already own has been updated with the new Stamina bonus.

## v0.16.0

### New
- **Maul** (hunter bear): costs 25 rage. A heavy strike against a single target that causes a high amount of threat. Can be toggled on the pet bar (default key Ctrl+5).
- **Threat meter:** shows the threat of everyone fighting your target, below the target frame. Toggle it in the menu (Esc → Threat meter).

### Changed
- Monsters now always attack whoever has the most threat. Warriors and Bear Form still generate extra threat.

## v0.15.2

### New
- Rimhaven now has a stable. Stablemaster Hrafn stands in front of it, with horses in the stalls.

## v0.15.1

### Changed
- All ability, talent, item, quest, dungeon and interface texts rewritten to be clearer and more concise.

## v0.15.0

### New
- **Dungeons scale with your group.** Every extra player inside gives the monsters +70% health and +10% damage. It updates as friends come and go, but monsters never get weaker in the middle of a fight.
- **Loot rolls in dungeons.** Elites and bosses drop one piece of gear for the whole group. Everyone gets a window with **Need**, **Greed** or **Pass** and 30 seconds to choose. Need beats Greed, the highest roll wins, and everyone sees the rolls. Alone, the item is simply yours. Gold and other loot stay personal.
- **Dungeon quests are marked:** a quest whose monsters live in a dungeon has a "Dungeon: name" tag in the quest window, at the quest giver and in the tracker.

### Changed
- Dungeon monsters are tougher: 60% more health and 30% more damage. You can still solo a dungeon, but it is easier a few levels above its level or with good gear.

## v0.14.0

### Changed
- **Dungeons keep their state.** Monsters you defeat stay defeated when you leave and come back, and even after reloading the page.
  - At the door you now get a choice: **Enter**, or **Reset and enter** to bring every monster back. The door window shows how many are already defeated.
  - In co-op, only the host can reset a dungeon, and only when nobody is inside.
- **Dying in a dungeon:** you now appear as a spirit at the nearest graveyard outside. Walk back to the dungeon door and go in to come back to life at the entrance with half your health and mana, or ask the Spirit Guide. The dungeon is not reset.
- **Dungeon entrances** have a sign with the dungeon's name and levels.
- The Broken Watchtower is now a little north of the Iron Mine, so the mine door and the quest spot are no longer in the same place.
- **New look for gargoyles:** Ash Gargoyles and the Magma Gargoyle are now hunched stone beasts with bat wings, horns, claws and glowing eyes.
- No welcome message when you log in.
- The talent window no longer has the line about resetting at your trainer.
- Hunter: Raptor Strike's tooltip now says "A quick melee strike".

## v0.13.3

### Changed
- The Marsh Drake looks like a real drake now: a long neck, a horned head with glowing eyes, leathery wings that beat as it moves, spikes down its back and a long swaying tail. It lunges with its head when it attacks.

## v0.13.2

### Changed
- **Hunter: bows need range.** Shots and the bow auto-attack only work 6 m or more from the target, up to 17 m. Tooltips show this as "6–17 m range", and the button turns red when you are too close.
- **Hunter melee auto-attack:** it only hits within melee reach and does clearly less damage than the bow, about 60% of the bow's damage per second. Between melee reach and 6 m you can't attack at all, so step back, or use Raptor Strike, Wing Clip or Disengage.

## v0.13.1

### Changed
- Hunter: Fire Arrow, Poison Arrow and Storm Arrow now grow with your attack power (Agility), like the hunter's other shots. Before, they only grew with your level.
- Paladin: Holy Strike, Crusader Strike, Hammer of Judgment, Hallowed Ground and Heavenly Judgment now grow with both Strength and Intellect.

## v0.13.0

### New
- **Co-op:** you now see your friends' spells and arrows: projectiles flying to their target, rings and ground effects like Blizzard.
- **Co-op:** when a friend near you finds a place a quest sends you to, it counts for you too.

### Changed
- Co-op: herbs, ore and quest items stay personal. Each player picks up their own, and quest loot drops for each player separately. Kills already counted for everyone nearby.

## v0.12.4

### Fixed
- Clicking your own portrait now targets you, and your portrait and the target portrait no longer overlap, even if the browser kept an older copy of the page.

## v0.12.3

### Changed
- **Gear uses the new stats everywhere:**
  - Weapons give Strength (Agility for hunters) instead of Attack Power, or Spell Power, Spell Damage or Spell Healing for casters.
  - Older gear you already have changes over: Attack Power becomes Strength (Agility for hunters), Health becomes Stamina and Mana becomes Intellect. It is worth the same as before.
- People in towns no longer turn to follow you as you walk by. They only face you while you talk to them.
- **Target yourself:** click your own portrait. Clicking the ground or pressing Esc clears it. Heals and buffs without a friendly target still go to you.

### Fixed
- Your portrait and the target portrait no longer overlap.

## v0.12.2

### Fixed
- Reloading the page or logging out no longer brings you back to life. If you were dead or a spirit, you still are, and your body stays where it fell.
- Your health and mana stay as they were when you reload, and Resurrection Sickness keeps counting down.
- Monsters you killed and herbs or ore you gathered no longer come back when you reload. They return when their normal respawn time is up, even after a reload.

## v0.12.1

### Fixed
- The spirit world looks better:
  - A dim blue mist instead of a white haze.
  - A faint ring on the ground at the graveyard instead of a big pillar of light.
  - A soft, thin light above your body.
- The "You are a spirit" bar sits above the action bars, so it no longer covers windows.

## v0.12.0

### New
- **Hunter – Beast Mastery remade** with more interesting talents:
  - Endurance Training: your pet has more health.
  - Go for the Throat: your critical hits give your pet rage or energy.
  - Frenzy: your pet attacks faster.
  - Improved Mend Pet: Mend Pet heals more and heals you too.
  - Spirit Bond: you and your pet slowly heal, even in combat.
  - Two new abilities that go into your spellbook: **Intimidation** (your pet stuns its target for 3 sec) and **Bestial Wrath** (your pet gets +50% damage and attacks faster for 10 sec).
  - Hunters get their talent points back once to try them out.
- **Hunter – Cripple Shot** replaces Ice Arrow. It deals no damage but slows the target for 8 sec, with an 8 sec cooldown. The Survival talent Crippling Arrows makes the slow stronger.

### Changed
- Shots and weapon attacks also start auto-attack. Spells don't.
- Quest items, herbs, ore and monsters are spread over the whole zone instead of bunching up near the towns.
- **As a spirit:** you see less far, and monsters and people only show up when you are close. The maps only show your body, the graveyards and dungeon doors.
- Talents can only be reset at your class trainer, and it costs more gold the higher your level (50 gold at level 10, 170 at level 20, 370 at level 30).
- Hunter: Dismiss Pet now takes 5 sec to cast.
- New characters start with their first abilities already learned and on the action bar: Mighty Strike (Warrior), Smite and Healing Light (Priest), Holy Strike and Light's Mending (Paladin). Characters who didn't have them get them now.
- **Co-op:** the extra line under a targeted friend is gone.

### Fixed
- You can now right-click the Spirit Guide to be brought back.
- People in towns no longer turn to face you when you are dead.
- New characters started without their first abilities.

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
