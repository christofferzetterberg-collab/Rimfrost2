# Rimfrost 2 – Release notes

## v0.51.1

### Fixed
- Right bars 1 and 2 now move beside an open window (bag, character, spellbook and others), so you can drag abilities onto them.

## v0.51.0

### New
- **Verdant Surge (Druid, level 12):** Heals the target instantly and again over 9 sec. Learn it from your trainer.

### Changed
- **Lifebloom (Druid):** Now a heal over time that blooms for an extra heal when it ends. No cooldown.
- **Improved Lifebloom:** Now increases the final bloom of Lifebloom by 25% per rank.
- **Ability icons:** Abilities of the same class that shared an icon now have their own (all classes).

## v0.50.1

### Changed
- **Cooldowns on the action bars:** Cooldowns longer than 1 minute now show in minutes (e.g. "3m") and switch to seconds for the last minute.

## v0.50.0

### New
- **Dev tools – Healing test:** Simulates each healer keeping a Protection warrior alive against a dungeon boss for 3 minutes, at the chosen level and gear. Shows how much each heal restores, whether the tank survives, when the healer runs out of mana and how much healing is wasted.

### Changed
- **Healing rebalanced (all healers):** Direct heals, heals over time and shields restore about 30% less. For example, Nature's Touch and Healing Light now heal 24% of the target's maximum health before bonuses (was 35%).
- **Tranquility (Druid):** Now a channeled spell that heals you and group members within 10 m, including companions, for 6% of their maximum health every second for 8 sec.
- **Intensity (Druid):** Now increases mana regeneration in combat by up to 100% (was 150%).
- **Wild Growth:** Now benefits from your healing bonuses on group members as well.

## v0.49.0

### Changed
- **Talent window redesign:**
  - Talents are shown as icons with their rank, arranged in tiers.
  - The points a tier needs are shown next to it, and locked tiers are dimmed.
  - Arrows show which talent unlocks another, and a red line under a talent names the talent it needs.
  - Hover over a talent to see its current and next rank.
- **Druid talents:** Most talents that grow with each point now have 5 ranks. Druids get their talent points back.

### Fixed
- Talent tooltips now appear on hover instead of only after clicking.

## v0.48.3

### Changed
- **Talent window:** Cleaner tier headers.

## v0.48.2

### Changed
- **Quest markers:** A quest giver whose quests are 6 or more levels below you now shows a gray "!" over their head and on the maps.

## v0.48.1

### Changed
- **Travel Form:** Druids now take the shape of a stag.

## v0.48.0

### New
- **New talent window:** Each tier is a row of up to three talents. Arrows show which talents need another first. Locked tiers are marked. Hover over a talent to see its current and next rank.
- **Druid talent trees reworked:** Each tree now has more choices per tier, talents that change how core abilities work, and a final talent at 25 points:
  - **Balance:** Lingering Moonlight, Brambles, Lunar Guidance, Gale Winds, Insect Swarm, Shooting Stars and Balance of Power. Final talent: **Celestial Alignment**.
  - **Feral:** Sharpened Claws, Feral Swiftness, Brutal Impact, Shredding Attacks, Mangle, Savage Fury and Survival of the Fittest. Final talent: **Survival Instincts**.
  - **Restoration:** Furor, Nurturing Touch, Tranquil Spirit, Empowered Lifebud, Swiftmend, Nature's Bounty and Gift of the Earthmother. Final talent: **Wild Growth**, which also heals friends and companions.
- Druids get all their talent points back.

### Changed
- Group heals and buffs such as War Cry and Holy Wave now also reach companions.

## v0.47.0

### New
- **Prowl (Druid, level 15):** Wolf Form only. Conceals you until cancelled and reduces movement speed by 30%. Attacking, taking damage or leaving Wolf Form breaks Prowl. Learn it from your trainer.

### Changed
- **Stealth and Prowl:** Monsters now spot you much later from the front. From behind, they only notice you when you are right on top of them. This works the same in co-op.
- **Ambush (Druid):** Now requires Prowl, has no cooldown, deals more damage and awards 2 combo points.

## v0.46.0

### New
- **Aura tooltips:** Hover over a buff or debuff to see what it does and how long it lasts.
- **Friends' auras:** Buffs, heals over time and shields on a targeted friend or companion are now shown on the target frame.

### Changed
- **Release Spirit:** In a dungeon, you can no longer release your spirit while your group is in combat.
- **Companion healers:** Companion healers now stay with the group and only heal members close to them.

### Fixed
- Monsters near friends now move and attack as normal, even when the host is far away.
- Co-op is smoother: less data is sent per second, which removes delays in monster movement and boss mechanics.
- Boss ground effects now hit friends based on where they stand on their own screen.
- Friends' jumps are now smooth.

## v0.45.0

### New
- **Heal and buff companions:** Click a companion's party frame or model to target it. Heals, shields and buffs work on companions for every group member.
- **Resurrect released friends:** After a friend releases their spirit, their body stays where they died and can still be resurrected. Companion healers resurrect them too.

### Changed
- **Threat in co-op:** Monsters only attack players on their threat list. You join the list by attacking the monster, by healing or buffing someone it is fighting, or by coming close. A player who dies is removed from the list. If no one is left on the list, the monster resets.
- **Healing threat:** Healing now causes threat equal to half the amount healed, split across the monsters in the fight.
- **Combo points:** Combo points stay on their target until it dies or resets, even when another player holds its attention.

## v0.44.0

### New
- **Companions in co-op:** The group leader can hire companions from the Companion Master. A dungeon group has at most 3 members: 2 players get 1 companion, 3 players get none. Companions heal and resurrect every group member, appear in the threat meter, and leave when a new player needs the spot.

### Changed
- **Buffs on friends:** Thorns, Power Infusion, Pain Suppression and Guardian Spirit can now be cast on a selected friend.
- **Backstab:** Now requires you to be behind the target.

### Fixed
- Friends in co-op are now shown jumping.

## v0.43.1

### Changed
- **Dev tools:** Adding ?dev to the address now only opens the dev tools for the developer's account. Other players see no dev tools.

## v0.43.0

### New
- **Co-op dev tools (host only):** With dev tools open (F8), the host can pick a friend or everyone in the group and set level, give gold, fully heal, teach all abilities, equip a gear set, grant riding and mounts, complete quests, reset cooldowns or talents, remove Resurrection Sickness, resurrect, or summon them to the host.

## v0.42.2

### Fixed
- Elves no longer have round human ears next to their pointed ones.

## v0.42.1

### Changed
- **Smoother ground:** colours now flow gradually across the land instead of changing triangle by triangle, with soft transitions between grass, dirt, rock and roads.
- **Painted ground detail:** the ground has a hand-painted pattern of grass strokes, small specks and pebbles, tinted by each zone's colour.

## v0.42.0

### New
- **Grass:** clumps of grass now grow in patches across grassy land, coloured to match each zone, from Frost Meadows to the Verdant Tangle. Grass is drawn near you; how far depends on the graphics setting.
- **Richer ground:** the land has soft lighter and darker patches, steep slopes show bare rock, the ground is shaded under thick woods, and the earth is worn along roads and around towns and camps.

## v0.41.2

### Changed
- **Tank abilities generate more threat:** Maul ×2, Swipe ×1.5, Mighty Strike ×1.8, Shield Bash ×2, Earthquake ×1.5, Holy Shield ×2, Hallowed Ground ×1.5, Avenger's Shield ×2 and Hammer of Judgment ×1.5.
- **Companions:**
  - Damage dealers generate less threat.
  - A damage dealer that pulls a monster off the tank stops attacking and runs to the tank until the tank takes it back.
  - Companions take damage according to their armor: cloth wearers (Mage, Warlock, Priest) take the most and plate wearers the least.
  - Healer and damage companions have less health than before.

## v0.41.1

### Changed
- **Dungeon monsters hit much harder:** all monsters in dungeons are now elites, shown with the Elite frame and label. Their damage is increased by about 65% for a group of three.

## v0.41.0

### New
- **Companion bar:** while you have companions, a bar above the action bars lets you command them.
  - **Attack:** attack your target now, without waiting for the tank.
  - **Assist** (default): fight what you fight.
  - **Stay:** hold the current position and only fight enemies that come close.
  - **Follow:** follow you without attacking. Healers still heal.

### Changed
- **Companions act more like players:**
  - Damage dealers and healers give the tank (you, or a tank companion) a moment to gain a monster's attention before they attack. Until then they keep their distance and wait.
  - Out of combat they follow a few steps behind you at your own pace, and only set off once you have moved away.

## v0.40.1

### Changed
- **Companions use mana like players.** Mana returns only slowly during a fight, so long fights can drain them. After a fight they sit down and drink until their mana is restored, unless you move on.
- **Companion healers** cast their class's own heals (for example Heal and Flash Heal, Healing Touch and Regrowth, Holy Light and Flash of Light, Healing Wave and Lesser Healing Wave). When nobody needs healing, they attack with their class's spells but keep their mana above 60% for healing. Paladin healers fight in melee instead.
- **Companion casters** use their class's spells: Frostbolt and Fire Blast, Shadow Bolt and Corruption (with Life Tap when low on mana), Smite and Shadow Word: Pain, Wrath and Moonfire, Lightning Bolt and Earth Shock. When out of mana they fall back to a weak wand.
- Companions show a cast bar above their heads, and their party frames show mana and when they are drinking.

## v0.40.0

### New
- **Taunts:** Warriors learn **Taunt**, Paladins **Hand of Reckoning** and Druids **Growl** (Bear Form) at level 10. The target attacks you for 3 sec and your threat is raised above everyone else's. 8 sec cooldown.
- **Hunter companions** bring a wolf that fights alongside them.

### Changed
- **Dungeons are made for groups of three.** Monsters always have at least the health and damage of a three-player group. Companions count as group members, so a dungeon can no longer be cleared alone unless you are far above its level.
- **Threat with companions:** companions now build real threat and can pull monsters off you if you don't hold them. Tanks (Bear Form, or Protection Warriors and Paladins) generate 50% more threat. To take a monster from its current target you need 110% of that target's threat in melee range, or 130% from range.
- Companions now appear in the threat meter.

### Fixed
- A companion healer now walks to your body and offers to resurrect you after the fight, also when you died to the environment.

## v0.39.2

### Changed
- **Wolf Form (Druid):** movement speed bonus reduced from 30% to 20%.
- **Dash (Druid):** movement speed bonus reduced from 70% to 50%.

## v0.39.1

### Changed
- **Charge (Warrior) and Feral Charge (Druid):** range increased from 3–11 m to 8–20 m, the charge itself is slower, and both can no longer be used in combat.

## v0.39.0 – Dungeon Companions

### New
- **Dungeon companions:** every dungeon has a Companion Master next to the entrance. When playing alone, hire up to two companions for that dungeon. Choose a role for each (Tank, Healer or Damage) and a random class of that role joins you at your level.
  - **Tanks** (Warrior, Paladin or a Druid in Bear Form) pick up monsters attacking you or the healer and taunt them back.
  - **Healers** (Priest, Druid, Paladin or Shaman) heal whoever is most hurt, including you, your pet and each other, and attack when nobody needs healing. A healer can resurrect you after the fight.
  - **Damage dealers** (Mage, Warlock, Hunter, Rogue or Warrior) attack your target, or the tank's target.
  - Companions move out of glowing danger circles, get back up after a fight if they die, and are shown with name plates and frames under yours.
  - They take no experience or loot, are free, and leave when you leave the dungeon.
  - If you tank yourself (Bear Form, or a Protection Warrior or Paladin), monsters stay on you instead of your companions.
  - Companions are not available in co-op yet.

### Fixed
- Friends in co-op could not see your drake or ship while you travelled.

## v0.38.1

### Changed
- **Voidwalker:** maximum health increased by about 50% (140% of your maximum health, up from 95%) and it takes 10% less damage.
- **Health Funnel:** heals your demon for 6% of its maximum health per second (up from 4%).
- **Demonology:** the Tier 7 talent is now Improved Health Funnel (3 ranks, +25% Health Funnel healing per rank). The Tier 6 talent is renamed Demonic Power.

## v0.38.0

### New
- Druids learn Feral Charge at level 12: in Bear Form, charge an enemy, stun it for 1 sec and gain 15 rage.
- New bear model with its own walk, run, attack and death animations, used for Bear Form, the bear pet, the Ice Bear and the Plague Bear.
- Druids learn Thorns at level 8: melee attackers take Nature damage each time they hit you. Lasts 10 min.
- **Auto-logout:** after 10 minutes without using the keyboard or mouse, your characters are saved and you are logged out. A warning comes one minute before.
- **Remember my e-mail:** a box on the login screen fills in your e-mail next time, so you only type your password.
- **Neutral monsters:** some monsters only fight back when you attack them, and don't bring their friends along. Their health bar is yellow and the tooltip says "Neutral".
  - Peaceful animals are always neutral: boars, Crag Boars, Bristleboars, Forest Foxes, Stone Beetles, Grave Rats and Tidecrawlers.
  - In the starting zones, every animal up to level 5 is neutral too, so the area around each home town is calmer.
- **Grey monsters,** six or more levels below you, no longer attack you on sight.
- **Hover tooltips:** pointing at a monster shows its name, level and health, and the cursor turns into a sword. Pointing at a person shows their name and title. Herbs and ore show the skill they need (in red if yours is too low), quest items say "Quest item", and dungeon doors show the dungeon's name.
- **Both mouse buttons:** holding the left and right mouse buttons together walks you forward, as in WoW.
- **Jumping:** press Space to jump. A running jump carries you forward in the direction you ran (you can't steer in the air); a jump from standing goes straight up, and pressing a direction key while in the air drifts you a little that way. In the air you get over low rocks and short, steep bumps. Houses, trees, cliffs and big rocks still block the way. The key can be changed in Key bindings (K).

### Fixed
- The rogue's right-hand dagger is no longer held upside down.
- The boar's snout no longer flaps up and down when it walks.
- The loading bar now follows the real download size of the models and keeps moving while the world is built.
- Quest objects that look like herbs (and other quest pick-ups) only appear while one of your quests needs them, so you no longer find things you can't pick up.
- Staffs (Mage, Priest, Warlock, Druid and caster monsters) are held pointing forward at an angle, and keep that angle when running instead of tipping back or spinning in the hand.
- One-handed axes are no longer held upside down (Canyon Raiders, Ironclan Warriors, and Warriors and Shamans with an axe).
- **Only one browser at a time:** logging in on a new browser now logs out any other browser that is still open, so an old window can no longer overwrite your characters with older progress.
- Pressing the left and right mouse buttons at the same time no longer leaves the camera stuck turning.

## v0.37.1

### Changed
- **Shaman totems** are placed in a square around you, based on where you face: Earth front left, Fire front right, Water back left and Air back right.

## v0.37.0

### New
- **Deeper talent trees:** every tree has two new tiers. Tier 6 (14 points in the tree) has a 5-rank talent and Tier 7 (19 points) a 3-rank talent. A full tree now takes 24 points, so 31 points at level 40 fill one tree and leave a few for another.
- **Proc alerts:** when a talent makes your next spell instant or free (for example Maelstrom Weapon, Hot Streak, Clearcasting or Nightfall), a glowing ring surrounds your character, a large alert with the time left appears above the action bars, and the empowered spells light up on your bar.
- The places to explore in the Southern Reaches now have proper landmarks: the Old Lighthouse, the Wreck of the Gull, the Overgrown Idol, the Sunken Spire, the Bleached Bones and the Void Rift.

## v0.36.0

### New
- **Totem bar (Shaman):** your totems now have their own bar above the action bars, like druid forms and the pet bar.
- **Grace of Air Totem (Shaman, level 24):** a new Air totem that increases the critical strike chance of you and nearby allies by 3%. Learn it from your trainer.
- Totems are grouped into four elements (Fire, Earth, Water and Air); only one totem of each element can be active.
- Active totems are shown as buffs under your portrait. Right-click one to cancel it.
- **Elite, rare and boss frames:** the target frame now has its own border and label for elite, rare and boss enemies.
- **World map:** drag the map to look around when zoomed in. The mouse wheel zooms towards the cursor.
- **Gear vendors** now offer a limited selection that changes every 10 minutes, sometimes including a rare item. Items you buy are gone until the next delivery.

### Changed
- **Lightning Shield:** now costs more mana and can damage an attacker at most once every 5 sec (still 3 charges).
- **Potions:** healing and mana potions share a 2 min cooldown.
- **Elixirs:** much more expensive. Only one elixir can be active at a time; drinking a new one replaces the old one. Elixirs do not share a cooldown with potions.
- The ranged slot is now called Relic (Paladin), Totem (Shaman) and Idol (Druid).

### Fixed
- Melee and ranged auto attacks did not play an attack animation.
- Drakes did not flap their wings while moving or flying.
- Arriving by ship, you now step ashore on open ground instead of at the water's edge.

## v0.35.2

### Changed
- Flights are slower, but still faster than riding a mount.

## v0.35.1

### Changed
- Flight Masters are now found in towns only (Frostwick, Leafhome, Mountdale, Burnmark, Palestead, Rimhaven, Stormhaven and Port Solace), no longer in camps.

### Fixed
- As a spirit, you can now enter a dungeon to reach your corpse; you are no longer reported as being in combat.
- Resurrection Sickness is now shown as a debuff under your character frame.

## v0.35.0 – The Southern Reaches

### New
- **A new continent:** the Southern Reaches lie across the sea, south of Rimfrost. Five new zones for levels 30–40: Saltwind Shore, Verdant Tangle, Sunscorch Dunes, Thornreach and Dreadspire Peaks.
- **Ships:** the new harbour town of **Stormhaven**, on Rimfrost's south coast, sails to **Port Solace** and back. Speak with the ship captain at the pier (5 gold).
- **Level cap raised to 40.** Talent points continue up to 31, and equipment now goes up to item level 40.
- New towns and camps: Port Solace, Vinewatch, Sunwell Oasis, Thornhold and Lastlight, each with a Flight Master. Flight paths connect the towns and camps of the same continent.
- 15 new monster types and 5 elite lords, including **Malakar the Dread Lord** (level 40).
- 35 new quests, starting with *Across the Sea* from Commander Halvard in Rimhaven at level 30.
- The south coast of Rimfrost is now a coastline with beaches instead of mountains.

### Fixed
- Monsters near you could appear as sheep for a few seconds after logging in.

## v0.34.0

### New
- **Flight paths:** every town and camp now has a Flight Master with a drake. Speak with a Flight Master to discover that flight path, then fly to any discovered destination for a small fee.
- Your home town's flight path is known from the start.
- While flying you cannot be attacked and cannot use abilities. Your pet travels with you.
- Flight Masters are marked on the world map; discovered ones are highlighted.

## v0.33.2

### Changed
- **Strafing on a mount:** holding the right mouse button and pressing A or D now turns your mount partly towards where it runs, instead of it galloping sideways while facing forward.

## v0.33.1

### Fixed
- On the Dire Wolf you now sit over its shoulders instead of far back.

## v0.33.0

### New
- **New mount models:** the Brown Horse and Gray Stallion are now animated horses that gallop, and the Dire Wolf is an animated wolf.
- The Mountain Ram is replaced by the **Great Stag**. If you own the Ram, you now ride the Great Stag.

### Changed
- **Resurrecting at your corpse** brings you back where you stand, as long as you are within reach of your body.
- **Pets** regain health more slowly out of combat (about 1.5 min from empty to full).
- **Holding the left mouse button** and moving the mouse now turns only the camera. Holding the right mouse button still turns your character and the camera.

## v0.32.1

### Changed
- **Pets** keep attacking the enemy they started on when you change target. Use **Attack** to send your pet after your new target.

## v0.32.0

### New
- **Ranged slot:** a new equipment slot for every class. Ranged items drop from monsters, are sold by blacksmiths and can be quest rewards.
  - **Warrior and Rogue:** bows, rifles and crossbows, with the new **Shoot** ability (30 m, 6 sec cooldown) for pulling monsters to you.
  - **Hunter:** the bow (or rifle or crossbow) moves to the ranged slot, and the main hand now holds a sword, axe or dagger. Bows you already have move there automatically.
  - **Mage, Priest and Warlock:** wands move to the ranged slot. **Shoot** fires the wand every 1.5 sec until you move, cast a spell or use Shoot again. Wands you already have move there automatically.
  - **Druid, Paladin and Shaman:** idols, relics and totems. Besides their stats, each one makes one ability stronger, for example "Increases the damage of Moonfire by 12%".
- **Two more action bars** along the right edge of the screen. Turn them on or off in the menu (Esc → Right bar 1 / Right bar 2). Fill them from the Spellbook, and give them keys in Key bindings (K).
- **Placing area spells:** Rain of Fire, Blizzard, Tempest and Meteor Fall are now placed where you choose. Press the spell, move the circle with the mouse, and left-click to cast it there. Right-click or Esc cancels. The circle turns red when the spot is out of range.
- **Warlock – Drain Life** is now channeled: it drains the target and heals you every second for 8 sec while you stand still. No cooldown. Each hit you take while channeling shortens it by 1 sec.
- **Talents reworked for every class:** most plain "+X% damage" talents are replaced by effects and new abilities. Talent points are refunded for every class except the Warlock, so you can choose again.
  - **Mage:** Arcane Concentration, Presence of Mind, Arcane Power, Archmage · Impact, Combustion · Frost Channeling, Frostbite, Cold Snap, Deep Freeze.
  - **Warrior:** Sweeping Strikes, Sudden Death, Mortal Strike · Unbridled Wrath, Blood Craze, Enrage, Flurry, Recklessness · Shield Specialization, Last Stand, Improved Shield Bash, Shield Wall.
  - **Hunter:** Beast Mastery unchanged · Improved Steady Shot, Concussive Barrage, Master Marksman, Rapid Fire, Chimera Shot · Improved Disengage, Counterattack, Thrill of the Hunt, Explosive Shot.
  - **Priest:** Borrowed Time, Mental Agility, Inner Focus, Power Infusion, Pain Suppression · Surge of Light, Desperate Prayer, Empowered Healing, Guardian Spirit · Vampiric Embrace, Shadow Affinity, Void Eruption.
  - **Druid:** Omen of Clarity, Starsurge, Owlkin Frenzy, Eclipse · Primal Fury, Leader of the Pack, Infected Wounds, Berserk · Intensity, Nature's Swiftness, Improved Lifebloom, Tranquility.
  - **Paladin:** Illumination, Divine Favor, Holy Shock · Redoubt, Ardent Defender, Reckoning, Avenger's Shield · Vengeance, Vindication, The Art of War, Divine Storm.
  - **Rogue:** Ruthlessness, Seal Fate, Cold Blood · Blade Flurry, Combat Potency · Camouflage, Elusiveness, Premeditation, Initiative, Shadow Dance.
  - **Shaman:** Elemental Focus, Elemental Mastery, Lightning Overload · Flurry, Maelstrom Weapon · Ancestral Swiftness, Earthliving, Mana Tide.
  - Paladin and Shaman deal a little more damage, to keep up with the other classes.
- **Warlock talents reworked:** fewer plain damage bonuses, more effects that change how you play. Your Warlock talent points are refunded so you can choose again.
  - **Affliction:** Improved Life Tap, Fel Concentration (less casting time lost when hit), Nightfall (Corruption and Curse of Agony can make your next Shadow Bolt instant), Soul Siphon (your damage over time heals you) and Unstable Affliction (a new damage-over-time spell that spreads to a nearby enemy when the target dies).
  - **Demonology:** Fel Domination (faster summoning), Soul Link (your demon takes 20% of the damage you take) and Master Demonologist (more damage with the Imp, less damage taken with the Voidwalker).
  - **Destruction:** Cataclysm (cheaper Destruction spells), Backlash (being hit can make your next Shadow Bolt or Soul Fire instant), Shadowburn (a new instant finisher), Aftermath (Rain of Fire slows) and Conflagrate (a new spell that hits hard on a target burning with Immolate).
- **Mage – Polymorph** (level 8, from the class trainer): transforms an enemy into a sheep for 1 min. The sheep cannot attack and regenerates health quickly. Any damage breaks the effect. Only one target at a time, no cooldown.
- **Warlock – Fear** (level 8, from the class trainer): the enemy runs away in terror in random directions for 8 sec. 25 sec cooldown.
  - Bosses are immune to both.
- **Accounts use e-mail:** create an account and log in with your e-mail and password.
  - **Forgot password?** on the login screen sends a link for choosing a new password.
  - Accounts made with only a name still log in with that name. Choose **Add e-mail** on the character screen and click the link in the mail. After that, you log in with the e-mail, and your characters stay the same.

### Changed
- **Hunter – Mend Pet** and **Warlock – Health Funnel** are now channeled: they heal your pet for 4% of its health every second for 10 sec (40% in all) while you stand still. No cooldown. Health Funnel costs 1.5% of your health each second.
- **Warlock – Voidwalker:** less health, takes more damage, deals half as much damage and holds enemies a little less firmly. The Imp's Firebolt deals more damage, so the Imp is the choice for damage and the Voidwalker for safety.
- **Class balance** (from the balance test at level 30):
  - All mana costs are lower, so casters no longer run out of mana in long fights.
  - Less damage for Warrior, Rogue, Mage, Priest, Druid and Hunter, which were well ahead of the other classes.
  - Hunter – Mortal Shots: critical strike damage increased by 5% per rank (was 10%).
- **Balance test:** shows how much mana is left after each fight, and the test Hunter now steps back out of minimum range when the pet holds the monster.
- **Turning with the mouse:** holding the right mouse button and moving the mouse now turns your character as well as the camera, as in WoW. Your arrow on the world map turns with it.
  - While turning this way, A and D strafe sideways with a side-step run, W with A or D runs diagonally, and S backs off facing forward.
- **Minimap:** N, E, S and W round the edge show the directions and turn with the camera.

- **Warlock – Imp:** Scorch is gone. The Imp's ability on the pet bar is now **Firebolt**, which you can switch on or off.
  - Firebolt has a 1.5 sec cast (was 1.6) and deals the same damage as before. Its damage grows with your Intellect.
- **Pet bar:** pet abilities that are switched on have a glowing ring. The "OFF" label and the "is now on/off" message are gone.
- **Health and mana out of combat:** regeneration is much slower while standing (about 1.5 min from empty to full). Sitting down with **Rest** fills you up in about 15 sec. Health and mana now come in a tick every 3 sec. Mana regeneration in combat is lower than before (1.5% every 3 sec).
- **Walking through things:** you can now walk through people, campfires, braziers, poles and small props like barrels and crates. Buildings, tents, walls, fountains, rocks and trees still block the way.
- **Spellbook:** the list of abilities you have not learned yet is gone. The class trainer shows them.
- **Tooltips:** shorter and cleaner. Pet abilities show their cost, cast time and cooldown on their own line, like other abilities, and instructions such as "Select the friend first" and "Use again to return to normal form" are removed.

### Fixed
- The threat meter showed the Imp and Voidwalker as "undefined".
- Small rocks no longer block line of sight. Only rocks taller than the line between you and your target do.
- Dying while mounted no longer leaves your spirit sitting down as it walks back to your corpse.
- Monsters no longer appear squeezed into narrow gaps between cliffs, where they got stuck and could not be defeated (such as a Sand Golem in Dust Canyon).
- **Warlock – Imp:** the Imp no longer looks like it shoots twice. Its shooting animation now plays only when the Firebolt leaves.

## v0.31.0

### New
- **Accounts:** log in with a name and password. Your characters and world progress are saved online, so you can play them in any browser.
  - **Create account** makes a new account. The characters already saved in your browser move into it the first time.
  - You stay logged in until you choose **Log out** on the character screen.

## v0.30.0

### Fixed
- Clicking in the world no longer makes the game stutter.
- Clicking a herb or ore node again while gathering no longer restarts the gathering.
- If your target dies while you cast a spell on it, the cast stops at once. Heals are not affected.

### Changed
- **Warlock – Imp:**
  - Scorch deals twice as much damage and costs 15 mana (was 30).
  - The Imp attacks from further away.
  - A cast bar over the Imp shows when it casts Firebolt.

## v0.29.3

### Changed
- Quests that repeated another quest's task now ask for something new:
  - **Scout Reports** (Holger): bring 5 reports from bandit scouts.
  - **Thorn Roots** (Herbmaster Faelin): bring 6 roots from thorn creepers.
  - **Charms of the Lost** (Lyra): bring 5 charms from Lost Druids.
  - **Crag Boar Hides** (Torvald): bring 5 hides from crag boars.
  - **Stolen Traps** (Sune): take back 5 traps from frost kobolds.
  - **Swallowed Cargo** (Kruk): recover 5 crates of cargo from sand golems.
  - **Stolen Grave Goods** (Ulvar): take back 6 grave goods from grave robbers.
  - **Tainted Glands** (Ulvar): bring 5 glands from plague bears.
- If you already have one of these quests, its new objective starts from zero.

## v0.29.2

### New
- A loading bar on the start screen shows how far the game has loaded.

### Improved
- The game loads faster: all models now load at the same time.

## v0.29.1

### Changed
- When a hunter or warlock dies, their pet dies or their demon vanishes. After coming back to life, call it again.
- **Resurrection, Revive and Redemption** now ask the dead player first: Accept or Decline (the offer lasts 1 minute).

### Note
- Everyone in a co-op group must run the same version of the game for resurrection to work. Reload the page after updating.

## v0.29.0

### New
- **Resurrection spells** for co-op: **Resurrection** (Priest, level 10), **Revive** (Druid, level 10) and **Redemption** (Paladin, level 12). Select a dead friend and cast for 10 sec out of combat; they return at your side with 20% health and mana. Learn them from your class trainer.
- **Boss mechanics** in every dungeon:
  - **The Bull from the Deep:** Cave-in – the ceiling falls on every player. Enrages at 30% health.
  - **The Sunken Prophet:** Drowning Pools around him, and the Drowned Ones rise at 70% and 35% health. Enrages at 20% health.
  - **The Fire Tyrant:** Flame Pillars under every player and around him, and Ember Hounds leap from the flames at 50% health. Enrages at 30% health.
  - **Skadi the Ice Queen:** Frozen Tomb under every player, and Frost Wargs answer her call at 66% and 33% health. Enrages at 20% health.
  - **The Draug King:** Grave Rot around him, and Draug Warriors rise at 66% and 33% health. Enrages at 20% health.
  - Step out of the glowing circles before they erupt. An enraged boss hits harder, attacks faster and casts more often.

### Changed
- **Deadly dungeon hazards:** mine carts, falling rocks and fire vents now kill instantly along the way. In a boss's hall they still only hurt. The tide in the Drowned Temple and the gusts in the Frost Vault are unchanged.
- **Rogue – Stealth:**
  - No time limit. It ends when you attack, use it again, take any damage (traps too) or are discovered.
  - Enemies can still notice you, but only at close range.
  - You look faded while in Stealth, and so do friends in co-op.
  - The cooldown starts when Stealth ends.
- **Warlock – Imp:** uses mana. It stands still and casts Firebolt (1.6 sec cast) when in range, and follows its target when out of range. It no longer jumps back to you during a fight. Scorch costs 30 mana, 6 sec cooldown.
- **Warlock – Voidwalker:** uses mana. Suffering costs 20 mana (8 sec cooldown) and Void Strike 10 mana (5 sec cooldown).
- The game title no longer shows at the top of the screen while you play.

## v0.28.0

### New
- **New dungeon walls, floors and pillars** in all five dungeons:
  - **The Iron Mine:** packed earth floors and rough stone walls.
  - **The Drowned Temple:** green-tinted tiles and carved pillars.
  - **The Ember Forge:** heat-stained tiles and walls.
  - **The Frost Vault:** pale, frosted stone.
  - **The Draug King's Crypt:** grey tombstone walls with candle niches.
- Barrels, crates, mining tools, rubble, candles, chests and broken arms now line the dungeon walls.
- Dungeon models by Kay Lousberg (KayKit Dungeon Pack, CC0).

## v0.27.0

### Improved
- **Much better performance:** monsters, people, trees and rocks far away or off screen are no longer drawn, and distant characters animate less often.
- Lighter shadows.

### New
- **Graphics setting** in the Esc menu: Low, Medium (default) or High. Low turns off shadows; High gives sharper shadows and draws characters further away.

### Fixed
- The Threat meter setting in the Esc menu now always shows its current state.

## v0.26.1

### Fixed
- Rogues now see their combo points under the health bar.

## v0.26.0

### New
- **New buildings** in every town and camp:
  - **Human towns and Rimhaven:** timbered houses, taverns, smithies and chapels with blue and red roofs.
  - **Elven towns:** houses, a chapel and a tavern with green roofs.
  - **Dwarven towns:** stone halls, workshops, smithies and a mine.
  - **Orc towns:** large hide tents and lookout towers.
  - **Undead towns:** faded, crumbling houses and a ruined building.
  - **Rimhaven:** a new stone city wall and gate towers.
  - **Camps:** new tents; the Forester's Cabin and the Witch's Hut have new houses.
- Barrels, crates, hay bales and other goods stand beside many houses.
- Building models by Kay Lousberg (KayKit Medieval Hexagon Pack, CC0).

## v0.25.0

### New
- **New trees, rocks and bushes** across the world: leafy trees in the meadows, pines in the forests and highlands, birches in the elven woods, violet trees in the Moonwood, snow-covered pines in the north and bare trees in the swamps and ash lands.
- Bushes now grow in the meadows, forests and woods.
- Nature models by Kay Lousberg (KayKit Forest Nature Pack, CC0).

## v0.24.0

### New
- **Bear Form** and the hunter's bear have a new animated bear model.
- **New monster models:**
  - **Bears:** Ice Bears, Plague Bears, the Cave Bear and the Vault Ice Bear.
  - **Boars:** Wild Boars, Bristleboars and Crag Boars.
  - **Spiders and insects:** Forest and Mine Spiders, Thorn Creepers, Stone Beetles and Scorpions.
  - **Drakes:** the Marsh Drake, and winged drakes for the Ash and Magma Gargoyles.
  - **Kobolds and goblins:** every kobold and goblin, including Foreman Krakk and Snorre the Kobold King.
  - **Critters:** hares and Grave Rats.
- Bear, boar, beetle and rabbit models by Poly by Google, and scorpion model by jeremy (CC-BY 3.0, via Poly Pizza). Spider, rat, dragon and goblin models by Quaternius (CC0).

## v0.23.0

### New
- **More monsters with new models:**
  - **Golems:** Stone, Sand and Ice Golems, the Stone Sentinel, Forgemaster Ignar, the Magma Lord and the Fire Tyrant, each in its own stone, sand, ice or fire.
  - **Trolls and giants:** Warlord Garuk, Rime Trolls, Skrymer, Hrimgar the Ice Giant and the Bull from the Deep.
  - **Ghouls:** Marsh Ghouls, Crypt Ghouls and Morvel the Nightwatcher.
  - **Casters:** Marsh Cultists, Hagga the Marsh Witch, Skadi the Ice Queen and the Sunken Prophet.
  - **Others:** the Drowned One, Forge Slaves, Temple Guardians, Vault Guardians and the Draug King.

## v0.22.0

### New
- **Town folk** now use the new character models, with models matching their trade and varied colours.
- **New monster models:**
  - All wolves, including Old Gray, Shadow Wolves, Plague Wolves, Ash Hounds, Frost Wolves, Ember Hounds and Frost Wargs, coloured to match their kind.
  - Forest Foxes, Steppe Jackals and Red Deer (does and stags).
  - Barn Thieves, Bandits, Grave Robbers, Canyon Raiders, Lost Druids and Ironclan Warriors.
  - Chieftain Grimm, now a towering barbarian.
  - Shambling Skeletons, Bone Guardians, Vex the Necromancer, Draug Warriors and Crypt Priests.
- Monsters with new models play a death animation when slain.

## v0.21.0

### New
- **Druids** have their own model: an antlered hood and a druid staff.
- **Imp:** new animated model with horns and a tail.
- **Voidwalker:** new animated model, a hulking shadow golem.
- **Wolves:** a new model for the hunter's wolf and Wolf Form, with running and bite animations.

## v0.20.2

### Fixed
- Orc and undead characters now have dark hair on every model. Hair was sometimes coloured like the skin.
- Bows are held the right way round, with the string facing the archer.

## v0.20.1

### New
- New animated models for the hunter's wolf and the druid's Wolf Form and Leopard Form.
- Druid forms are coloured by race: humans have a dark grey wolf and a golden leopard, elves a silver wolf and a snow leopard.
- Animal models by Quaternius (Animal Pack Vol. 2, CC0).

## v0.20.0

### New
- Every class now uses the new character models:
  - **Warrior and Paladin:** knight armor; paladins in blue with a crested shield.
  - **Shaman:** barbarian build with axe and round wooden shield.
  - **Mage, Priest, Warlock and Druid:** robed casters, each in its own colours.
  - **Hunter:** ranger with a bow and bow animations.
  - **Rogue:** hooded, with a dagger in each hand.
- Weapons and shields shown match your equipped gear. Off-hand tomes appear as spellbooks.
- Staves are held upright.

## v0.19.1

### New
- Warriors of every race now use the new character models:
  - **Orcs:** green skin, dark hair, tusks and a broader build.
  - **Elves:** pointed ears and a slimmer, taller build.
  - **Dwarves:** short and stocky, with a full beard.
  - **Undead:** pale grey-green skin and glowing eyes.
- Helmets are only shown while you wear head armor.

## v0.19.0

### New
- **New character models (first test):** human warriors now use a new animated model with idle, running, sword attacks, spellcasting, sitting and death animations. The other races and classes follow in later updates.
- Character models by Kay Lousberg (KayKit Adventurers and KayKit Character Animations, CC0).

## v0.18.0

### New
- **New class: Warlock** (Human, Orc, Undead). Curses, damage over time, and Shadow and Fire magic. Summons an Imp that hurls Firebolts, and from level 10 a Voidwalker that holds the attention of enemies. Abilities include Shadow Bolt, Immolate, Corruption, Curse of Agony, Curse of Weakness, Life Tap, Drain Life, Health Funnel, Rain of Fire, Soul Fire and Death Coil.
- **New class: Rogue** (Human, Orc, Elf, Dwarf, Undead). Fights with a weapon in each hand, attacks quickly and uses energy and combo points. Abilities include Sinister Strike, Eviscerate, Stealth, Ambush, Backstab, Gouge, Slice and Dice, Rupture, Evasion, Fan of Knives, Kidney Shot and Vanish.
- **New class: Shaman** (Orc, Dwarf). Nature magic, shocks and totems. Abilities include Lightning Bolt, Chain Lightning, Earth Shock, Flame Shock, Frost Shock, Healing Wave, Lightning Shield and Heroism, plus Searing, Magma, Stoneskin, Strength of Earth and Healing Stream Totems. One totem of each element (Fire, Earth, Water) can be active at a time.
- Each new class has three talent specializations, with Demonic Frenzy, Adrenaline Rush and Stormstrike as their talent abilities.
- New trainers in Rimhaven and in the race starting towns. Daggers can now drop for rogues.
- **Pets can be selected:** click your pet or its frame. Its health and active effects are shown, and your healing spells go to it.

### Changed
- Combo points (Wolf Form and rogues) now belong to the target they were built on and are lost when combat ends.

### Fixed
- Effects on your pet, such as Bestial Wrath, are now shown on its frame.

## v0.17.1

### Fixed
- Dungeon packs now fight together: attacking one monster pulls the whole pack.
- Monsters now notice pets that come close, as they do players.

## v0.17.0

### New
- **All five dungeons have new, larger layouts, each with its own mechanic:**
  - **The Iron Mine:** mine carts roll along the tracks, and rocks fall from unstable ceilings. Watch for the dust circles.
  - **The Drowned Temple:** water slows movement. When the water starts to glow, the tide is about to surge and damages everyone standing in it.
  - **The Ember Forge:** rivers of lava divide the halls. Fire vents glow before they erupt.
  - **The Frost Vault:** ice floors are slippery. Freezing gusts blow through the wind tunnels, pushing you along and reducing movement speed by 40%.
  - **The Draug King's Crypt:** three gated chambers guarded by Draug Warriors, Crypt Priests and Crypt Ghouls. Each gate opens when every monster before it is defeated.
- Every dungeon now has enough monsters to complete all of its quests in one run.

### Changed
- Stone Sentinels drop Sentinel Hearts more often (60%, was 50%).
- The Draug King's Crypt is now a level 19–20 dungeon.
- Dungeon progress saved before this update has been reset.

## v0.16.4

### Changed
- **Hunter:** Spirit Bond now heals you and your pet every 5 sec instead of every second.
- **Hunter:** Improved bow animation. The bow is held upright, and the string is drawn back while shooting.
- **Druid:** Entangling Roots now has a 20 sec cooldown.
- **Mage:** The Ice Barrier talent now teaches Ice Barrier: absorbs damage for 1 min. Self only. 1 min cooldown. It no longer increases maximum health.
- **Mage:** Shatter now only applies to frozen targets, not rooted or slowed ones.
- **Mage:** Frost Ring now freezes enemies for 8 sec (was 4 sec). Cooldown increased to 25 sec (was 20 sec). Frozen enemies show a Frozen effect.

### Fixed
- Racial abilities (Sprint, Bloodrage, Shadowmeld, Stoneform and Will of the Dead) were missing after v0.16.0 and have been restored.

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

## v0.15.3

### New
- **Racial abilities.** Every race has a racial ability from level 1. It appears in the spellbook under "Racial" and is placed on your action bar automatically. Racial abilities cost nothing and do not trigger the global cooldown.
  - **Human – Sprint:** Increases movement speed by 40%. Lasts 8 sec. 2 min cooldown.
  - **Orc – Bloodrage:** Increases damage dealt by 20%. Lasts 8 sec. 2 min cooldown.
  - **Elf – Shadowmeld:** Enemies lose track of you and you leave combat. Lasts up to 60 sec. Moving or acting cancels the effect. 2 min cooldown. In co-op, an enemy only resets if no other player has fought it.
  - **Dwarf – Stoneform:** Reduces damage taken by 20%. Lasts 8 sec. 2 min cooldown.
  - **Undead – Will of the Dead:** Returns you to life at your corpse with 30% of your health, without Resurrection Sickness. Usable only while dead. 30 min cooldown. Also available from the death window.
- Each racial ability has its own visual effect: a coloured ring around your character, plus a speed trail (Sprint), a red glow (Bloodrage), a stone skin (Stoneform), a shadowy fade (Shadowmeld) or a column of green light (Will of the Dead).
- Ability tooltips now show long cooldowns in minutes.

### Changed
- **Racial bonuses lowered:**
  - Human: experience +5% (was 10%).
  - Orc: damage +3% (was 10%).
  - Elf: dodge +3% (was +5% critical strike, +10% mana and +1% dodge).
  - Dwarf: maximum health +8% (was 15%); no longer starts with Mining 25.
  - Undead: unchanged (health and mana regeneration out of combat +50%).

### Fixed
- Loading a character could skip setting up its quest log and quest items (a code comment had swallowed that line).

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
