# CRUMB COMMAND
## Product requirements document
**Version:** 0.1 | **Status:** Playable prototype + small-release specification | **Date:** September 24, 2026

**Tiny armies. Big picnic.** Command a backyard bug colony, capture picnic scraps, recruit a small mixed army, and topple the rival nest. A complete match has a five-minute ceiling. The game should deliver the resource control, army composition, and maneuvering of an RTS without workers, construction, research, or a campaign.

### 1. Product brief
The player is the commander of the mint colony. A coral rival colony wants the same cracker, donut, and slice of watermelon. Food generates crumbs; crumbs recruit bugs. Holding everything is attractive, but spreading too thin leaves an opening at home. Occasional falling cookies create a reason to leave a comfortable defensive position.

The central decision is **where to commit a limited army**, not how to manage a settlement. Three deliberately different units, one timed ability, and one open battlefield are enough for the first release. Unit selection, independent orders, economy, and an active opponent make this an RTS rather than a tower-defense game or an idle battler.

| Product decision | Requirement |
| --- | --- |
| Audience | Players looking for a quick strategy break, including people intimidated by large RTS games |
| Primary device | Desktop or laptop with mouse or trackpad |
| Session | Target roughly 2–5 minutes of human play; hard limit of 300 simulation seconds; faster losses are possible |
| Mode | One human versus one local AI colony |
| Complexity budget | One map, one resource, three unit classes, one active ability |
| Army size | At most 16 living or queued bugs per colony |
| Presentation | Readable, playful pixel-style backyard art; no graphic violence |
| Delivery | A self-contained HTML file; modular source and tests included |
| Working title | Crumb Command; naming and trademark clearance are not part of this prototype |

### Design principles
**Decisions over chores.** Food collection is automatic after capture. The player spends attention on positioning, reinforcement, and timing.

**Readable before elaborate.** Distinct bug silhouettes, ownership labels, selection rings, visible nests, and a fully visible map take priority over effects or environmental detail.

**Short matches with a finish.** A nest can fall before the timer ends. Otherwise, nest health and food control settle the result. There is no endless cleanup phase.

### Success definition
The first useful result is a player who understands the objective, makes a meaningful split-army decision, and chooses to play again. The current build verifies functioning systems, not enjoyment, fairness, retention, or commercial demand. These require human playtesting.

<!-- PAGEBREAK -->
## 2. Scope and the player experience
### The first playable release
The included prototype implements the entire basic match loop: start screen, two difficulties, selectable units, recruitment, food capture, combat, reinforcement rallying, forced retreats, Sugar Rush, cookie bonuses, nest destruction, timed results, pause, and replay. It uses generated pixel artwork and optional synthesized sound rather than downloaded assets.

| Included now | Deliberately excluded |
| --- | --- |
| One fixed, fully visible arena | Fog of war, scrolling camera, minimap |
| One nest per colony | Building placement, repairs, production buildings |
| Automatic food income | Worker units, carrying resources, supply chains |
| Three shared unit classes | Faction rosters, heroes, equipment, veterancy |
| One local heuristic AI | Human multiplayer, matchmaking, servers |
| One ability and recurring cookie bonuses | Tech tree, upgrade choices, spell inventory |
| A complete local match | Accounts, cloud saves, persistent unlocks, campaign |
| Responsive layout and basic touch interactions | A validated phone-first interface or gamepad support |

Do not add a fourth unit or a second resource to solve a balance problem. First adjust costs, speeds, capture times, damage, positioning, or AI behavior within this scope.

### Core loop
**Select a squad → claim food → spend crumbs → reinforce or raid → exploit an opening → finish the match.** Each food point remains owned after the army leaves. This makes detached scouts useful and allows a player to shift forces without abandoning all income.

### Intended opening minute
At the start, the player has three scouts, one beetle, and 80 crumbs. All four bugs are preselected. An initial message suggests taking the nearby Cracker; the field manual explains all controls.

A simple first game is to move the starting army to the Cracker, recruit a spitter, and then decide whether to take the Donut or intercept the rival. A more practiced player can send scouts to separate objectives while leaving the beetle in a safer position. Neither opening is prescribed by a scripted tutorial.

By approximately the first cookie landing, the player should face a tradeoff: reinforce the contested food, collect the temporary bonus, or push toward the rival nest. Five minutes is a ceiling, not a mandatory match length.

### Desired tactical moments
A scout circles around a fight and removes the rival's income. A beetle protects a fragile spitter from scouts. A damaged squad retreats to heal rather than being replaced. A player saves Sugar Rush for a decisive engagement or a timely escape. Winning should feel connected to these choices, not merely to clicking recruitment faster.

### First-release boundary
This is a single-player prototype with test coverage, not a public production launch. Human balance testing, broader browser verification, a fully accessible alternative to spatial mouse commands, and production deployment checks remain release work.

<!-- PAGEBREAK -->
## 3. Battlefield, food, and recruitment
### Arena layout
The world is 960 × 600 logical pixels. The whole map is visible at once. Nests sit at (86, 300) and (874, 300). The Cracker is at (292, 176), Donut at (480, 428), and Melon at (668, 176). These locations mirror horizontally and create a near objective, a distant objective, and a lower central contest.

The blanket and grass are traversable surfaces. Border flowers and stones are decoration, not cover or movement blockers. There is no hidden terrain advantage. Movement uses direct destinations and soft separation; obstacle-aware pathfinding is intentionally absent.

### Economy values
| Parameter | Initial value |
| --- | --- |
| Starting crumbs | 80 per colony |
| Permanent nest income | 1.25 crumbs per second |
| Each productive food point | +1.75 crumbs per second |
| Total income with 0 / 1 / 2 / 3 food points | 1.25 / 3.00 / 4.75 / 6.50 per second |
| Capture radius | 47 logical pixels, measured from a bug's center |
| Capture time | 4 seconds with one uncontested bug |
| Living + queued population cap | 16 per colony; every unit uses one place |
| Recruit queue | Five entries maximum; one unit trains at a time |

Resources are stored as fractional numbers; the HUD displays whole spendable crumbs and rounds the income rate to one decimal place. The permanent income source allows recovery after losing food, but does not guarantee a comeback.

### Capture rules
A neutral or hostile food point captures when only one side occupies its radius. Two bugs shorten capture to about 2.96 seconds; three or more shorten it to about 2.35 seconds. Additional bugs beyond three do not improve capture speed. The formula is `4 / (1 + 0.35 × min(2, bugCount - 1))` seconds.

Both sides present means capture progress freezes. A hostile bug inside an owned point blocks that owner's food income immediately, even before ownership changes. Once captured, a point stays owned without a garrison. On an abandoned partial capture, progress decays; the owning side can also clear hostile progress by occupying the point unopposed. There is no separate neutralization phase before a hostile point flips.

### Recruitment contract
Crumbs are charged once, at queue entry. The future population slot is reserved immediately. Unaffordable orders, a full queue, and a full population cap must be rejected without spending resources. Dead units free their population slots.

New units spawn beside their nest and attack-move toward the current rally flag. The flag is read when the recruit finishes, not when it is purchased. Existing bugs keep their current orders when the rally flag moves. There is no queue cancellation or refund interface in version 0.1.

<!-- PAGEBREAK -->
## 4. Units, combat, and home defense
### Initial unit balance
All numbers are starting tuning values, not established competitive balance. Both colonies use identical unit definitions.

| Unit | Cost | HP | Train | Speed | Damage / interval | Range |
| --- | --- | --- | --- | --- | --- | --- |
| Scout | 24 | 48 | 1.6s | 70 px/s | 7.5 / 0.72s | 14 px |
| Beetle | 52 | 156 | 3.8s | 40 px/s | 18 / 1.10s | 15 px |
| Spitter | 38 | 66 | 2.7s | 50 px/s | 11 / 1.25s | 116 px |

**Scout:** Cheap, quick, and useful for detached capture or a flank. Deals 1.5× damage to spitters. Fragility makes frontal attacks into beetles expensive.

**Beetle:** Slow, durable front-line pressure. Deals 1.5× damage to scouts. It should protect support units rather than reach every objective on its own.

**Spitter:** Fragile ranged support. Deals 1.8× damage to beetles. It requires protection against a scout that reaches its position.

Counters are damage advantages, not automatic duel guarantees. Numbers, formation, range, reinforcement timing, and nest fire can outweigh them. No additional armor, splash damage, elemental resistance, or upgrade system exists.

### Targeting and movement
Normal ground commands are attack-move orders: bugs travel toward their formation positions but acquire nearby enemies along the way. Scouts and beetles acquire targets at roughly 104 pixels beyond the target radius; spitters use 157. Units prefer enemy bugs over a nest during automatic acquisition.

An explicit enemy click assigns a focus target. Bugs pursue it until it dies or a new order replaces the command. Attack ranges are measured to the target's edge. If the explicit target dies, the order becomes a normal move-and-fight order toward its stored destination.

The Retreat command sends selected bugs toward home without stopping to acquire enemies. Alt + right-click similarly creates a forced move to an arbitrary location. After reaching the destination, normal automatic combat resumes. Units can take damage while retreating.

### Damage and presentation
Attacks selected during one simulation tick resolve as a batch, so a bug killed during that batch still lands an attack it already committed. Health cannot fall below zero, and each death increments kill/loss statistics once. Spitter and nest projectiles are visual effects: damage is applied when the attack fires, not when the drawn projectile arrives. Dodging projectiles is not a mechanic.

### Nest defense and recovery
Each nest has 700 HP and fires 14 damage every 0.9 seconds at the nearest rival within 165 pixels. Nests do not regenerate or recruit automatically. Damaged friendly bugs within 90 pixels of home heal at 4 HP per second after four seconds without taking damage. Healing never exceeds maximum HP.

<!-- PAGEBREAK -->
## 5. Controls and the two timing mechanics
### Command scheme
| Input | Behavior |
| --- | --- |
| Left-click a friendly bug | Select it |
| Drag a rectangle | Select friendly bugs inside |
| Shift + click / drag | Toggle an individual bug / add bugs to the selection |
| Left-click empty ground | Clear the selection, unless a command mode is active |
| Right-click ground or food | Move and fight; standing bugs capture food automatically |
| Right-click a rival bug or nest | Focus that target |
| A, then left-click | Right-click command alternative for trackpads |
| Space; 1 / 2 / 3 | Select all; select scouts / beetles / spitters |
| Q / W / E | Recruit scout / beetle / spitter |
| D; Alt + right-click | Retreat home; force movement without acquiring enemies |
| R, then left-click | Set the rally flag for future recruits |
| F | Activate Sugar Rush on selected friendly bugs |
| P or Escape; H or ? | Pause/resume; open the field manual |

Escape cancels an armed command/rally mode before pausing. Button equivalents are supplied for the essential actions. Holding a recruitment key does not repeatedly enqueue units. The native context menu is disabled only over the battlefield.

### Sugar Rush
Sugar Rush is the only active ability. It affects the selected living friendly bugs for five seconds, multiplying movement speed by 1.6 and attack cooldown recovery by 1.35. The colony-wide cooldown is 28 seconds from activation. It costs no crumbs.

The ability must fail without starting its cooldown when nothing valid is selected. Newly recruited bugs do not inherit an earlier cast. Gold selection rings communicate the effect; a visible countdown communicates availability. The decision is whether to use it for a fight, escape, or movement to a contested objective.

### Cookie drops
The first warning appears at 45 seconds; the cookie lands five seconds later. Further warnings appear every 55 seconds. Locations alternate between (480, 142) and (480, 315), and both sides see the same warning.

A landed cookie lasts 30 seconds. An uncontested colony inside its 38-pixel collection radius collects it after 2.4 seconds and receives 55 crumbs once. More bugs do not speed collection. Rival presence freezes progress; abandoned progress decays, and a different collecting side starts new progress. The cookie then disappears, or expires unclaimed.

Cookies are resource bonuses, not victory points. No player can predictably win merely by ignoring nests and collecting cookies. They exist to produce an occasional spatial decision within the existing economy, not to introduce another resource.

<!-- PAGEBREAK -->
## 6. Opponent, victory, and player feedback
### Small, understandable AI
The AI uses the same resources, unit statistics, queue, recruitment costs, and population cap as the player. It has the same full-map information because there is no fog of war. It does not receive invisible units, free reinforcements, extra income, or damage bonuses.

The Standard AI evaluates strategy every 2.6 seconds. Chill evaluates every 4.5 seconds, waits for a larger army before an early push, and does not use Sugar Rush. Recruitment follows a simple cycle of unit preferences; the bot saves for its chosen unit when it cannot afford it.

On each strategic evaluation, the bot first checks for enemies within 215 pixels of home and redirects its army to defense. Otherwise, it can send two bugs to an active cookie, detach small groups to the closest uncaptured food points, and use the remainder to stage or push. Standard normally considers a push at seven living units, Chill at ten; after 100 seconds, either can push with five. Standard may rush a group of at least three nearby combatants after the opening 30 seconds.

This is a heuristic opponent, not a learning system. Its recruitment and reassignment can be exploited. Improving the fairness and legibility of these decisions is preferable to compensating with resource cheats.

### Win, loss, and ties
Destroy the rival nest to win immediately. Destroying the player's nest causes a loss. Two nests destroyed in the same tick produce a draw.

At 300 simulation seconds, compare remaining nest HP. If health is equal within 0.01 HP, compare the number of owned food points. If those are also equal, declare a draw. A blocked but still-owned food point still counts for this tiebreaker. Bugs, unspent crumbs, and collected cookies do not otherwise affect the result.

The result screen reports the outcome and reason, units recruited, rivals defeated, cookies collected, and battle duration. Another Picnic returns to the start panel, where the player can choose a difficulty and begin a fresh match.

### Feedback and accessibility
The HUD displays crumbs, income, living population, owned food points, time, recruitment queue, selected composition, and ability cooldown. Queue reservations are explained even though the main population number counts only living bugs. Disabled buttons prevent invalid purchases; keyboard requests receive short explanatory messages.

Friendly mint and rival coral colors are reinforced by nest labels, ownership text, and distinct class silhouettes. Small live-status announcements cover major events. Reduced-motion preference suppresses leg animation and some particles. There is no camera shake. Sound is off by default and opt-in.

The field manual pauses an active match and restores the prior pause state on close. Switching tabs pauses the match and requires explicit resumption. Basic touch selection exists, but phone ergonomics, screen-reader battlefield control, and keyboard-only spatial commands are not validated release features.

<!-- PAGEBREAK -->
## 7. Technical design and included files
### Runtime architecture
Use native JavaScript and Canvas 2D. There is no runtime framework, game-engine dependency, package download, external font, image CDN, backend, or API call. This choice keeps the initial game inspectable, portable, and small. It is a scope decision for this game, not a general claim that native Canvas is always the best engine.

`src/engine.js` owns simulation state and gameplay rules without touching the DOM. `src/app.js` owns input, UI, procedural artwork, animation, and optional sound. `src/styles.css` and `src/template.html` own page layout. A small Node build script combines them into `index.html`.

The simulation advances in fixed 1/30-second steps. Rendering follows the browser's animation frames. Long render frames are clamped to 0.1 seconds, avoiding an unlimited catch-up loop; very slow devices can therefore make the simulation run more slowly than wall time. The five-minute limit is measured in simulation time.

### State and determinism
The state contains two players, two nests, an array of units, three food points, the current cookie drop, match time, and a bounded event queue. The lifecycle is ready → playing → ended, with a pause flag while playing. All match state is recreated on restart.

A seeded pseudorandom generator supports repeatable simulations. Identical seeds and commands are tested for equality in the same JavaScript runtime. This is not a guarantee of cross-browser deterministic lockstep, replay compatibility across code versions, or multiplayer readiness.

### Core interfaces
| Engine interface | Responsibility |
| --- | --- |
| `new Game({seed, difficulty, ai})` | Create an isolated match |
| `start()`; `step(dt)` | Start and advance the fixed-step simulation |
| `recruit(type, team)` | Validate, charge, and queue a recruit |
| `command(ids, x, y, targetId, team, forcedMove)` | Assign formation movement or a focus target |
| `retreat(ids, team)`; `setRally(x, y, team)` | Disengage selected bugs; set future reinforcement destination |
| `rush(ids, team)` | Validate and apply the selected-squad ability |
| `drainEvents()`; `snapshot()` | Supply UI events and a test/debug snapshot |

### Privacy, storage, and deployment
There is no application telemetry, login, third-party tracking, or match upload. Only the sound preference is attempted in localStorage; failure is caught. Matches are not saved and refreshing loses the current battle. The prototype's zero-request browser test concerns application activity, not the browser's own internal behavior.

The built HTML is intended to run directly from a local file or from a static host. It uses no module imports or fetches that require an HTTP server. Public hosting, domain setup, HTTPS verification, cache behavior, and hosted Content Security Policy are not supplied. A host that blocks inline scripts/styles will need hashes, nonces, or a separately packaged build.

<!-- PAGEBREAK -->
## 8. Quality gates and validation status
### Automated simulation coverage
The included Node test suite has 31 passing tests. It covers equal starting conditions, ready/pause behavior, step validation, passive income, solo/group capture, persistent ownership, contesting and recapture, recruitment charging and timing, queue/population limits, valid commands, rallying, ability lifecycle, retreat, healing, counter damage, nest defense, simultaneous attack accounting, cookie rules, victory, draws, the timer, and deterministic reproduction.

The suite also runs six complete bot-versus-bot matches across different seeds and checks resource, health, population, and finite-position invariants. These are robustness probes, not six human playtests or evidence of balanced win rates.

### Browser coverage
The optional Playwright test passes 31 checks in headless Chromium 144.0.7559.96. It exercises start/restart, selection hotkeys, drag and Shift-add, recruitment, actual capture after a command, rallying, trackpad commands, Sugar Rush, pause/resume, help pause restoration, retreat, forced movement, sound toggling, victory UI, difficulty reset, narrow layouts, and the hidden-tab handler. It observes zero uncaught JavaScript errors and zero application network requests.

The built HTML was mounted using Playwright `set_content`. Managed browser policy in the test environment blocked navigation to local files and localhost, so direct `file://` loading and an actual hosted URL were not end-to-end tested. Static inspection confirms the artifact is self-contained. This is a verification boundary, not a known dependency on a server.

### Manual release acceptance
| Area | Required release check |
| --- | --- |
| Desktop input | One complete human match with both mouse and trackpad |
| Browser coverage | Open the downloaded HTML in target Chrome, Safari, and Firefox; verify local audio and storage failures are harmless |
| First-use comprehension | Player can identify their colony, select bugs, and capture food without coaching |
| Command trust | Retreat reliably moves away; selection and focus-fire targets are visually clear |
| Match completion | Human win, human loss, timeout, draw, pause, and replay all have clear outcomes |
| Responsiveness | Smooth enough at 32 living bugs on the actual target laptop; profile before setting a performance claim |
| Presentation | Food bars, unit health, result overlays, and buttons remain readable at the intended viewport |
| Hosted build | Verify a real HTTPS URL, refresh behavior, no asset failures, and no unintended network calls |

### Human playtest targets, not measured results
Run an initial round with five to eight players. Aim for at least 80% to capture food within 45 seconds without spoken help. Ask each to explain what made one unit different and what they would change on a rematch. Observe whether a detached scout, mixed army, or retreat changes a decision.

The desired median human match is roughly two to four minutes, with a five-minute ceiling. Do not infer this pacing from automated play. A local, consent-based test sheet is sufficient; analytics instrumentation is not part of version 0.1.

<!-- PAGEBREAK -->
## 9. Delivery plan, risks, and next-build brief
### Current delivery
The package contains the playable `index.html`, editable source, build script, simulation tests, optional browser tests, this PRD, a quick-start README, and a constrained next-build brief. No repository, domain, or public deployment has been created. The game needs no paid service to run locally.

### Milestones
**A — Validate the present loop.** Conduct the small human playtest described above. Fix input confusion and obvious exploits. Tune the three existing units, home defense, capture, and economy; preserve the core scope. A balance change must update code, the relevant PRD values, and regression tests together.

**B — Polish one arena.** Improve hover feedback, small-screen text and hit areas, recruitment cues, and the first-match hints. Refine sprite readability and sound only after input is trusted. A tiny guided opening is allowed; an extensive tutorial campaign is not.

**C — Share a static build.** Test local opening on target browsers, then publish to a chosen static host and run a real hosted smoke test. Only after stable human matches should an optional second fixed map be considered. Online multiplayer is a separate product decision, not a hidden next task.

### Principal risks
| Risk | Response within the existing scope |
| --- | --- |
| Food snowball makes the first fight decisive | Tune income, capture speed, home fire, or AI aggression; keep one resource |
| One mixed blob solves every match | Tune travel speeds and point spacing; encourage small capture detachments |
| Retreat or target selection feels unreliable | Improve command feedback and hit-testing before adding content |
| AI repeatedly sends weak squads into a losing fight | Add limited tactical commitment or retreat logic, not free units |
| Soft separation looks crowded | Tune radii and formations; do not add obstacles until navigation is deliberately redesigned |
| Ranged effects imply dodging that does not exist | Keep impacts readable; document or later change hit timing explicitly |
| Features crowd out the short-match promise | Enforce one map, three units, one resource, and one ability |

### Handoff instructions for the next coding pass
Read `README.md`, this PRD, `docs/BUILD_NEXT.md`, and both source modules before editing. Run the existing tests and preserve the working single-file build. First fix a reproducible issue or implement a small validated playtest improvement; do not rewrite the project around a new framework.

Keep simulation rules out of the renderer. Use the engine constants as the balance source of truth. Preserve equal resources and unit stats for both teams. Add a regression test for every rules change. Rebuild and inspect the actual HTML after UI changes. State clearly which checks were run and which browsers or deployment routes remain untested.

### Explicitly not next
Do not add multiplayer networking, accounts, monetization, procedural world generation, permanent progression, worker management, base construction, or a large tech tree. The next release should be a better version of this small game, not the first fraction of a much larger one.
