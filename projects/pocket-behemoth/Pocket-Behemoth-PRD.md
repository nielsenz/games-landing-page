# Pocket Behemoth
## Product requirements document

**Version:** 0.1 — playable combat prototype  
**Date:** September 24, 2026  
**Premise:** A compact, original monster-hunting game with a 16-bit-inspired presentation. One hunter, one clearing, one memorable creature. No errands before the interesting part.

> The good moment: You bait Brambleback into a wall, step into the opening, and land the heavy strike that finally breaks its horn. The next rush is visibly weaker. You did not win because your equipment number went up; you learned the creature.

<!-- preview -->

**Core promise:** Read the creature, choose a position, commit to an attack, and decide whether there is time for one more hit.

**Build status:** The accompanying HTML implements a complete first fight, original procedural pixel art, synthesized sound effects, keyboard/mouse and touch controls, practice mode, part-breaking, win/loss screens, and immediate replay. Crafting is not implemented.

<!-- page -->

# 1. Product shape and boundaries

## The experience

This is a small action game, not a compressed role-playing campaign. The player should begin fighting within a few seconds, understand a mistake without consulting a wiki, and be able to retry immediately. A successful fight should feel earned through timing and positioning rather than repeated resource collection.

Use a fixed, top-down arena with a slightly elevated pixel-art presentation. Both the hunter and the monster stay visible. This is a 16-bit visual inspiration, not a claim of authentic SNES hardware limits or a recreation of licensed assets.

The first encounter is Brambleback, a moss-covered, stone-horned creature. A broad silhouette, pale forward horn, long tail, and four clawed feet communicate its orientation. One cleaver is sufficient to test the entire combat proposition.

## Preserve the interesting decisions

The three decisions are where to stand, when to dodge, and how much attack recovery to risk. A quick cut is relatively safe. A heavy strike is better at breaking the horn, but commits the hunter. Being near the head is dangerous during a rush and useful during a tail sweep. The correct position changes with the attack.

The monster is not a permanently active damage field. Merely touching it does not hurt the player. Only its explicit, telegraphed attacks deal damage. This makes moving close enough to fight understandable.

## Scope contract

| Included in version 0.1 | Deliberately excluded |
| --- | --- |
| One arena and one complete boss encounter | Open world, tracking, travel, gathering, town hub |
| One weapon; cut, heavy strike, dodge | Weapon classes, long move lists, equipment statistics |
| Three monster attacks and one breakable horn | Multiple breakable limbs, elements, status builds |
| Standard and no-defeat practice modes | Difficulty ladders, account progression, daily chores |
| Results, local best time, instant retry | Leaderboards, accounts, multiplayer, monetization |
| Original pixel art and lightweight sound | Licensed monsters, characters, music, or copied assets |

There is no stamina bar, potion menu, sharpening, weapon durability, inventory sorting, hunger system, corpse-carving interaction, or crafting screen in this build. Deliberate attack timing remains; maintenance tasks do not.

## Success targets, not measured outcomes

Aim for a first learned clear of roughly 60–120 seconds, with faster mastery runs. There is no countdown or failure caused by taking too long. Target comprehension of movement, attacking, and dodging within 30 seconds. A useful qualitative gate is whether a player voluntarily asks for another hunt before any progression reward exists. These targets require human playtesting; automated checks do not establish them.

<!-- page -->

# 2. The playable loop and controls

## Encounter flow

The title screen offers Standard or Practice and one prominent start button. The hunter enters the clearing already equipped. Brambleback approaches, telegraphs a move, commits, and recovers. The player moves clear or dodges, then uses the opening for damage or horn-breaking. Repeat until either health bar is empty.

Winning shows hunt time, hits taken, horn status, and clean dodges. A normal win can set a local personal best. Losing identifies the final attack and offers a relevant tip. Both outcomes offer a direct retry and a route back to mode selection. A retry restores both characters completely; it does not consume a life, resource, or currency.

## Inputs

| Action | Keyboard | Mouse / touch |
| --- | --- | --- |
| Move | WASD or arrow keys | Touch joystick; mouse alone does not move |
| Cut | Hold J; Z also works | Hold left mouse or CUT |
| Heavy strike | Press K; X also works | Right-click or tap HEAVY |
| Dodge | Space; Shift or L also works | Tap DODGE while steering |
| Pause / resume | P or Escape | On-screen Pause / Resume |
| Restart | R | On-screen Restart / replay |
| Sound | M | Sound checkbox |

Keyboard and touch attacks automatically face the monster when an attack starts. Mouse attacks face the pointer. The chosen direction then stays committed for that attack. Pressing a keyboard attack returns to automatic facing; an idle mouse cursor does not silently override it.

Movement supports normalized diagonals. Without directional input, a dodge follows the hunter's facing. Movement plus dodge is the reliable way to choose an escape direction. Holding CUT chains attacks; a heavy strike or dodge is a separate press, not an operating-system key-repeat action.

## Modes and comfort

Standard starts with 100 health and permits defeat. Practice uses the same monster, damage feedback, and timing, but hunter health cannot fall below 1. Practice clears never count as personal records. Practice is a way to learn, not a hidden difficulty adjustment.

The game pauses on window blur or tab hiding and clears held inputs. Returning to the page does not resume the fight unexpectedly. Pausing freezes the timer. Sound and reduced-motion preferences are stored locally when browser storage is available. Reduced motion removes camera shake, dodge afterimages, and ambient drifting particles; it is not a blanket removal of every combat animation or flash.

Touch controls remain outside the danger area and support moving while holding CUT. In phone landscape, the controls sit to either side of the arena. Portrait remains playable, but its smaller playfield and text still need real-device usability testing.

<!-- page -->

# 3. Hunter combat and part-breaking

## Shipped tuning values

All values below are implemented defaults, not evidence of final balance. Distances are internal game pixels and times are simulation seconds. Keep them centralized in CONFIG rather than scattering alternative numbers through the renderer.

| Mechanic | Implemented default |
| --- | --- |
| Hunter health / movement | 100 health; 126 pixels per second |
| Cut chain | 20 / 24 / 32 base damage; 0.34 seconds per attack |
| Cut timing / reach | Impact at 0.10 seconds; 46-pixel sector reach |
| Heavy strike | 94 base damage; 0.88 seconds total |
| Heavy timing / reach | Impact at 0.46 seconds; 61-pixel sector reach |
| Dodge | 0.26 seconds; speed 266 pixels per second |
| Dodge protection / reuse | 0.22 seconds invulnerability; 0.64-second start-to-start cooldown |
| Protection after taking damage | 0.95 seconds |
| Input buffer | 0.16 seconds for heavy and dodge edges |

Light-attack movement is 58% of normal speed; heavy-attack movement is 30%. A light attack can be canceled into a dodge after 0.16 seconds. A heavy cannot be canceled until 0.70 seconds. This difference is the main commitment cost; do not replace it with a stamina tax.

Each swing can damage the monster once. A hit requires intersection with the attack sector and a valid body or horn circle. Attacks do not hit behind the hunter or at arbitrary screen distance. The airborne portion of a body slam cannot be struck.

## A horn, not a second health bar to grind

The pale forward horn has 178 part health. Valid frontal cuts deal 15 part damage; heavy strikes deal 69. A recovery or stagger window increases part damage by 20%, so three exposed heavy hits break it. Rear body hits damage the creature but do not secretly damage the horn.

Against the intact head, cut health damage is multiplied by 0.70 and heavy damage by 0.90. Recovery and stagger multiply health damage by 1.25. After the horn breaks, head health damage gains a 1.30 multiplier. Breaking the horn is valuable but never required to finish the hunt.

A break removes the horn from the sprite, interrupts the current action into a 2.6-second stagger, restores up to 16 hunter health, and changes the rush's damage, speed, width, and maximum travel duration. Health restoration happens once and cannot exceed 100. No pickup or carving action is required.

## Feedback requirements

A connected cut receives a short sound, damage number, and small hit pause. A heavy gets stronger impact feedback; a horn break has its own sound, debris, stagger animation, and message. Effects must not hide the next warning. Combat messages sit outside the playfield. Damage must register when the visual swing connects, not at button-down or after the animation has visibly ended.

<!-- page -->

# 4. Brambleback: behavior and readable danger

## Encounter controller

Brambleback has 3,000 health. Its controller uses an explicit attack pattern with a distance substitution: a tail sweep selected while the hunter is far away becomes a slam. Repetition is limited. This is a learnable opponent, not a predictive system that reads future inputs.

Below 45% health it becomes furious. Warning durations and some recovery intervals shorten, but the attack vocabulary stays the same. An in-progress warning is never shortened by the transition. No new off-screen hazard or surprise projectile is introduced at low health.

| Attack | Warning and impact | Counterplay |
| --- | --- | --- |
| Horn rush | 1.02-second warning; 0.82 when furious. Direction locks for the last 0.43 seconds. Then a straight rush. | Move perpendicular after the lock, or roll through the actual danger interval. Bait a boundary crash. |
| Tail sweep | 0.96-second warning; 0.78 when furious. A roughly 223-degree rear sector hits once as the sweep begins. | Stay near the front, exit its 99-pixel radius, or time a dodge. |
| Body slam | A fixed circle appears for a 0.79-second windup, or 0.65 when furious, followed by a 0.43-second leap. Impact occurs on landing. | Leave the 78-pixel circle before landing, or dodge at impact. The target does not follow the hunter after selection. |

Rush deals 24 damage, sweep 20, and slam 28. The intact rush travels at 324 pixels per second for at most 0.88 seconds with a 28-pixel collision radius. With a broken horn, those values become 16 damage, 252 pixels per second, 0.72 seconds, and 22 pixels.

## The wall is a tactical tool

The arena has a real movement boundary, not just decorative stones. A rush reaching it ends in a wall crash and stagger: 1.9 seconds with an intact horn, or 1.5 seconds after a break. The creature recoils 32 pixels so the horn remains reachable from inside the clearing. A wall crash creates an opening but does not itself subtract horn health.

There are no extra collision obstacles in the center. Flagstones and background pillars are scenery. This avoids confusing visual clutter while preserving a useful environmental interaction.

## Fairness contract

The warning shows the monster attack footprint. A hunter whose circular collision body overlaps that footprint can be hit; the center need not cross the outline. Rush uses swept segment collision to prevent tunneling at high speed, and its rendered warning includes rounded end caps. Sweep damage uses the same sector geometry as its warning. Slam damage uses the marked landing circle.

A rush stops steering before it begins. Slam targeting stays fixed. No passive body-contact damage is allowed. An attack cannot repeatedly damage the hunter during the post-hit protection window. A clean dodge counts when invulnerability actually prevents an attack overlap; pressing dodge in empty space does not score one.

<!-- page -->

# 5. Presentation, implementation, and persistence

## Visual direction

Use warm dirt, moss greens, weathered stone, pale bone, and restrained amber danger markings. The hunter's teal clothing separates them from the monster. Shape, attack labels, and visible progress communicate danger alongside color. Keep the player, horn, tail, and warning readable before increasing decorative detail.

The prototype renders to a 640 × 400 Canvas 2D surface and scales it with pixelated sampling. Monster and hunter art is generated into small offscreen canvases. A cached background reduces per-frame drawing work. Rotated sprites are a practical prototype compromise; hand-authored directional frames would be a polish task, not a reason to postpone testing the fight.

Sound effects are generated through Web Audio after a user gesture. There are no downloaded samples, fonts, art assets, analytics scripts, or background music streams. Core play cannot depend on audio being available.

## Code and execution

The browser build is a single index.html with embedded JavaScript and CSS. It uses no framework, package install, build server, account, or network API at runtime. Open the file directly in a compatible browser, or serve the folder as a static site. Python is only an optional development/build convenience; it is not part of the game runtime.

The editable sources are src/game.js and src/shell.html. tools/build.py combines them into index.html. The game engine can also be loaded by Node without creating a browser document, which allows direct automated combat tests.

| Component | Responsibility |
| --- | --- |
| CONFIG and geometry helpers | Balance, arena bounds, sectors, swept paths |
| Hunt | Player state, boss states, damage, breaks, results |
| Renderer and procedural art | Arena, sprites, warnings, impact effects, HUD |
| Input adapter and Sound | Keyboard, pointer, multitouch, audio gestures |
| Browser shell | Start/pause/results dialogs, settings, responsive layout |

Simulation uses fixed 1/120-second steps and requestAnimationFrame rendering. Long frame delays are capped rather than producing a large catch-up burst. Decorative particle counts are bounded. Browser events are drained once per frame. Audio failure and storage failure must not prevent play.

## Local-only data and limits

Optional storage uses the pocketbehemoth.v1 namespace for a best standard clear time and sound/reduced-motion settings. There are no names, emails, accounts, telemetry, or server records. A clear time is an informal personal record, not a cheat-resistant score. Local file persistence can vary by browser; clearing browser data can remove it.

The package exposes the engine for tests. Adding ?debug=1 exposes the running instance for development. This is intentional in a local prototype, not a production leaderboard security model. All combat artwork and naming are original to this project.

<!-- page -->

# 6. Acceptance, validation, and next playtest

## Functional acceptance

A fresh run must initialize the correct health, horn, timers, and input state. Every damage event must originate from the documented attack geometry. A heavy cannot become a freely cancelable, zero-risk cut. Horn-breaking must change the live rush behavior and its warning width, not just the health bar or sprite.

A player can complete a standard hunt using only legitimate movement and attack inputs. Both no-defeat practice and real defeat work. Results support immediate replay and mode selection. Pausing, backgrounding, or canceling a touch gesture must not leave movement or attacks stuck on. The interface must not create horizontal overflow at the tested screen sizes or distort pointer-to-canvas coordinates.

Touch controls must support steering while attacking. Menus must expose actual buttons and keyboard focus, rather than requiring the player to click painted text. Combat remains a visual action game; this prototype is not a screen-reader-accessible alternative to that action.

## Validation performed on this build

The shipped test suite passes 32 engine tests covering geometry, movement, attack timing, damage, horn-breaking, dodge protection, input buffering, wall recoil, telegraph locks, practice, results, pause behavior, and deterministic replay.

A Chromium smoke run passes 62 checks, including actual keyboard and mouse inputs, multitouch joystick-plus-attack input, touch cancellation, blur pause, practice/result behavior, and responsive dialogs. Viewports include 1400 × 1000, 390 × 844, 375 × 667, 844 × 390, 667 × 375, and 768 × 1024. The run reported no JavaScript errors or external network requests.

That browser run executed the HTML in memory because this environment blocks direct file and localhost navigation. The only test instrumentation changed the debug-exposure condition. It did not replace the renderer, controls, or combat engine. Therefore direct file launching and deployment hosting remain target-environment checks rather than claims established by this run.

An input-only diagnostic policy completes the encounter in about 44 seconds without editing combat state. It has perfect access to telegraph state and is not a human player. Repeating it with different particle seeds does not create independent difficulty evidence. Simple approach-and-hold-CUT and approach-and-repeat-HEAVY diagnostics lose in the current tuning; that is a useful sanity check, not proof of optimal balance.

## What still needs a person

Test the actual file or a static deployment in the user's browser, then check Safari/iPhone and a midrange Android device. Real-device touch feel, mobile audio behavior, browser persistence, sustained frame rate, and accessibility comfort have not been validated by the emulated run. Performance targets remain targets until measured on that hardware.

After three attempts, ask: Which tell did you understand? Which hit felt unfair? Did heavy strikes feel worth their recovery? Did the break change how you fought? Did you want another attempt before seeing a reward? Watch for attacks that appear to connect but miss, warnings that disappear under effects, and finger coverage of the hunter.

If the fight feels slow, adjust approach speed, recovery access, or damage before adding progression. If it feels like button holding, improve the positional risk or change the attack mix. Do not use equipment upgrades to compensate for combat that is not yet enjoyable.

<!-- page -->

# 7. Crafting later, without rebuilding the chores

## The decision gate

Do not add crafting to make this first fight feel worthwhile. Add it only after the fight is enjoyable on its own and there is a reason to change how the next encounter plays. The next content experiment should usually be a second monster with a contrasting positional puzzle, not a larger version of the same health bar.

A useful expansion order is combat-feel polish, a second encounter, then one small equipment-choice experiment. No work on progression is required to use or extend the shipped prototype.

## A minimal forge experiment

On the first victory, award one guaranteed Brambleplate automatically. It unlocks a two-card forge, not an inventory grid. Offer a recognizable choice such as a Shattercleaver that trades more commitment for stronger part-breaking, or Mossstep Wraps that favor repositioning at a damage cost. These are proposed sidegrades, not implemented items or tuned numerical bonuses.

The first forge interaction should take seconds: see the monster part, understand two tradeoffs, choose one, and enter another fight. Allow free switching between unlocked alternatives outside combat. Do not require repeating the same encounter merely to undo an experiment.

Keep the existing horn break useful in combat. A later cosmetic horn trophy can acknowledge the accomplishment without making basic progression depend on a precise break or a rare drop. The first crafting experiment needs no quantities, rarity colors, upgrade percentages, success chances, storage capacity, or multi-material recipes.

The test is whether the equipment choice changes the player's plan: where they stand, which opening they exploit, or how much attack commitment they accept. If it merely changes time-to-kill, it is not yet earning the extra menu.

## Milestones and stop rules

| Milestone | Deliverable and exit condition |
| --- | --- |
| 0.1 — fight first | The supplied encounter and tests. Human playtest identifies the largest feel or readability problem. |
| 0.1.1 — polish | Fix that problem without expanding the action list. Validate desktop and real-phone controls. |
| 0.2 — another quarry | One monster with different safe positioning, readable tells, and a mechanically meaningful break. Keep the same input vocabulary. |
| 0.3 — optional forge | One guaranteed unlock and two clear sidegrades. Remove it if it adds menu time without changing decisions. |

Do not start with multiplayer, procedural hunts, an equipment database, quests, a town, or a campaign. If a second monster cannot remain interesting with this small action vocabulary, solve that combat-design problem before multiplying progression systems.

## Handoff rule

Treat the editable sources as canonical. Read README.md, this PRD, and AGENTS.md before changing the prototype. Adjust CONFIG first for balance changes, rebuild index.html, run the engine and browser checks, and inspect screenshots after layout or artwork edits. Never claim that a test passed merely because it exists. Keep planned features separate from implemented behavior.
