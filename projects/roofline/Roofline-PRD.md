# ROOFLINE
## Product requirements document · Playable prototype v0.1

**Product promise:** A tiny, side-on rooftop skate game where the satisfying part is discovering a line, carrying momentum through it, and deciding whether to land safely or risk the next transfer.

**Platform:** Browser; keyboard-first with touch controls.  
**Format:** Original 16-bit-inspired pixel art, Canvas 2D, one self-contained HTML file.  
**Default experience:** Free skate. An optional 90-second score run uses the same course and rules.  
**Status:** Implemented prototype. Automated correctness checks passed; human fun, balance, and physical-device validation remain open.

> **The good moment:** You notice that the rail beside the air conditioner points straight toward the next roof. You jump later this time, catch the rooftop rail instead of landing, and realize the whole block can become one line.

---

## 1. Product intent

This is not a compressed career-mode skate simulator. It is one expressive movement toy with enough geometry to reward learning. The player should understand the three main actions immediately and discover better routes through repetition, not through a trick encyclopedia, stat upgrades, or quest instructions.

The reference is a side-on, SNES-era interpretation of the momentum and combo tension of a skate game. The graphics, character, sound effects, course, and branding are original; this is not an emulator or a recreation of a licensed game.

### Design pillars

1. **Movement before systems.** An ollie, a rail catch, and a clean transfer must feel good with the score display hidden.
2. **The environment teaches the line.** Rails, roof edges, ramps, and recognizable rooftop objects reveal opportunities. The camera shows the next decision before the current landing.
3. **Safety is an active choice.** Staying on a roof banks the combo. Jumping again or finding another rail preserves the unbanked risk.
4. **Failure has a short memory.** Lose the current combo, keep previously banked points, and resume rolling after a brief tumble. No life counter or long walk back.

### Target session

The target is a two-to-five-minute browser break, with meaningful play in the first few seconds. Free skate has no deadline. A score run is 90 seconds plus, when applicable, a capped final-combo landing opportunity. These are design targets, not measured retention results.

### Success criterion

The most important playtest observation is a voluntary second attempt at a route: “I nearly connected that; let me try it again.” More content is not the remedy for a jump or grind that does not feel good.

## 2. Scope and exclusions

### Implemented in v0.1

One automatically repeating, 4,200-unit rooftop circuit contains eight named areas, nine rails, six named gaps, and two lower service-route alternatives. The game includes automatic forward rolling; optional push and brake; variable-height jumps; forgiving rail catches; two context-selected air tricks on a single button; combos, banking, and fast respawns; free skate and a 90-second score mode; session goals; local records; synthesized sound effects; pause/restart; and multi-pointer touch controls.

### Explicitly out of scope

No career, missions that unlock content, character statistics, upgrade currency, inventory, licensed skaters, licensed music, elaborate trick inputs, park editor, multiplayer, accounts, global leaderboard, backend, or advertising. No rail-balance minigame, manual button, reverse-direction navigation, or realistic board-orientation simulation in the initial build.

The three session goals are passive teaching prompts, not a progression system. They reset with the run and never gate access.

## 3. Core play loop

**Roll → choose a route → jump → trick or catch a rail → carry speed → land to bank, or jump again → repeat.**

The skater automatically travels right. This keeps the three primary inputs available for timing rather than requiring the player to hold an additional movement key continuously. Optional push and brake retain some control over approach speed. The trade-off is deliberate: this version gives up free-direction exploration to make line finding immediate.

An airborne trick creates unbanked points. Landing on a rail while holding grind extends the line. Riding off or jumping from a rail keeps those points at risk. A safe roof landing starts a 0.22-second bank window; remaining grounded banks the total. A buffered or quickly timed ollie during that window continues the same combo without a separate manual input.

A trick that has not finished when the board contacts a surface causes a bail, subject to a small end-of-animation catch grace. Missing all available roofs and falling below the play area also causes a bail. A bail removes only the current unbanked combo.

## 4. Controls and onboarding

| Action | Keyboard | Touch | Behavior |
|---|---|---|---|
| Jump / ollie | Space or Z | Jump | Press to jump. Hold for the full arc; releasing early shortens the jump. |
| Grind | Hold X | Hold Grind | Catch a nearby rail while descending. Continue holding to stay on it. Release to drop; jump to pop off. |
| Trick | Tap C | Tap Trick | Kickflip first, shuv-it second within the same airborne phase. No directional combination. |
| Brake | Left / Down / A / S | Brake | Reduce speed without stopping or reversing. Optional. |
| Push | Right / D | Not a required touch action | Raise approach speed while grounded; limited influence in the air. Optional. |
| Pause / resume | P or Escape | Pause button | Freeze the run. Focus loss also pauses. |
| Restart | R | Pause → Restart | Reset the current run and resume immediately. |
| Sound | M | Sound button | Toggle synthesized effects. Off initially. |

Jump input is buffered for 0.14 seconds. Coyote time permits an ollie for 0.11 seconds after rolling off a roof. Rail capture has a seven-unit assist band and only works on descent; holding grind cannot pull a skater up from far below a rail.

The first roof includes a visible “HOLD X” sign. The start card explains the three main actions without a tutorial dialog. Below the game, three passive goals invite the player to catch a rail, bank a 1,000-point combo, and find the AC express. A small bar above the board shows a flip finishing; text also distinguishes “finish the flip” from “ready to land.”

**First-play teaching sequence:** Try an ollie. Catch the first rail. Stay on a roof long enough to see the score bank. Then try the air-conditioner route. Do not require a perfect route before allowing the player to enjoy the game.

## 5. Movement, landings, and recovery

### Physical model

The simulation advances in fixed 1/120-second steps, independent of rendering. World positions use a continuous horizontal coordinate; the authored course repeats by offset rather than teleporting the player at a lap boundary.

| Tuning parameter | Current value | Purpose |
|---|---:|---|
| Normal cruise speed | 218 units/second | Automatic forward motion |
| Optional push target | 282 units/second | Faster approaches |
| Maximum carried speed | 345 units/second | Bounds jump reach and camera demand |
| Brake target | 78 units/second | A slower, still-moving recovery option |
| Gravity | 900 units/second² | Snappy aerial arc |
| Ground jump impulse | 362 units/second upward | Full-height ollie |
| Rail jump impulse | 355 units/second upward | Rail-to-roof transfer |
| Rail jump speed bonus | 22 units/second | Preserves and rewards a connected line |
| Bank delay | 0.22 seconds | Safe landing versus quick extension |
| Trick animation | 0.40 seconds | Creates a simple landing-timing risk |
| Final catch grace | 0.045 seconds | Avoids overly punitive near-complete flips |
| Bail-to-respawn delay | 0.80 seconds | Fast return to play |

These are baseline tuning values, not character statistics. They are shared by every run and editable in `src/core.js`.

### Ground and rail behavior

Ground surfaces and service ramps use top-surface collision. Rails have separate line geometry and capture rules. Swept downward crossing tests prevent ordinary high-speed landings from tunneling through platforms. A released rail is briefly ignored so the skater does not immediately snap back onto it.

Grinds build speed gradually, with a small slope effect. A jump off a rail adds a bounded speed boost. Ground coasting dissipates excess speed slowly instead of snapping immediately back to cruise. Riding off the end of a rail gives a small automatic pop, but deliberately timed jumps reach farther.

Rooftop air conditioners, plants, laundry, signs, and water towers are scenery. They do not have hidden body-collision hazards. Decks, service ramps, rails, and gaps define the interactive route. This top-surface arcade model is a scope choice, not a full solid-body skate simulation.

### Safe landings

Landing is valid when the skater crosses a roof top downward and the trick is complete, allowing the final 0.045-second catch grace. The board is automatically aligned; there are no manual rotation controls. The bank timer then begins. Jumping during that short window or using a pre-landing buffered jump preserves the combo.

### Failure and respawn

During an ordinary bail, show a short tumble, the reason, and the points lost. Previously banked points remain intact. After 0.80 seconds, place the skater at a recent supported checkpoint with runway ahead and restore forward speed to 190 units/second. The checkpoint updates during stable grounded travel, not in midair or mid-grind. Camera recovery should be immediate enough that the player can read the next obstacle.

The 0.80-second delay begins when a bail is detected; falling off a roof can take additional time to reach the out-of-bounds threshold. Bailing during final-combo overtime ends the score run instead of respawning into an expired round.

## 6. Scoring and combo economy

**Banked combo = floor(sum of base points × current multiplier).**

The first scoring action creates multiplier ×1. Further valid scoring links increase it to a maximum of ×8. Continuous grind time adds base points, not repeated multiplier increments. An ollie by itself does not score.

| Event | Base points | Link behavior |
|---|---:|---|
| First air trick: kickflip | 150 | One link |
| Second air trick in the same flight: shuv-it | 210 | One link |
| New rail catch | 160 | One link for that rail in the current combo |
| Grinding time | 90 per second | No additional multiplier link |
| Alley Oop | 180 | Named gap link |
| AC Express Gap | 350 | Named gap link; must reach the high line |
| Antenna Transfer | 250 | Named gap link |
| Laundry Leap | 230 | Named gap link |
| Water Tower Gap | 400 | Named gap link |
| One More Roof | 200 | Named gap link |

Repeating the same trick among the last five action labels reduces its base award by 25 points per repeat, with a floor of 70. There are at most two tricks in one airborne phase; pressing during an active animation does nothing. Catching the same rail again during one combo does not award another rail entry or multiplier link, although actual grind time still scores.

Named gaps are awarded only after successful surface or rail contact across the authored gap. Merely passing horizontally over a void is not sufficient. Each named gap scores once per combo for that circuit instance.

**Illustrative choice:** A completed kickflip followed by a new rail catch starts from 310 base points at ×2, before grind-time points. The player can jump to a roof and bank, or carry the unbanked total into another trick or transfer. The HUD must make the total at risk unmistakable.

Local storage retains the best banked combo, the best completed timed-run score, and sound/motion preferences. Current free-skate session totals are not a permanent cumulative currency. Storage failure must never prevent play.

## 7. Course design

### Course structure

| Area | Main purpose | Route character |
|---|---|---|
| The Depot | Learn the ollie, first grind, first bank | Broad roof, raised practice rail, short first gap |
| Machine Room | Establish the signature landmark | AC units beside a rising rail |
| The Relay | Reward the first discovered transfer | High roof and another catchable rail; lower service walkway beneath |
| Rooftop Garden | Offer an understandable bank point | Broad landing and a further optional rail |
| Laundry Lane | Rebuild or continue momentum | Clear roof spacing, a rising rail, laundry as a landmark |
| The High Line | Prepare a longer transfer | Elevated approach, upward rail, visible next roof |
| Water Tower | Repeat the high-versus-low choice | Longer gap and a foreground service route |
| Home Stretch | End in a satisfying repeatable rhythm | Two separated rails, final gap, seamless return to the Depot |

### The signature AC line

Approach the Machine Room rail from the roof. Ollie early enough to descend onto the rising rail while holding grind. Carry its speed. Jump near its far end. A later pop can line up with the next roof’s rail instead of touching down on the roof, allowing the player to keep the combo live. A more conservative landing on the roof banks the points. A lower service walkway offers another way through the district, though it is not a guarantee that every failed trick will be saved.

The next rail and landing roof are visible together. The AC units make the takeoff location recognizable. The goal text hints at the opportunity without giving exact jump coordinates.

### Course authoring rules

Keep coordinates in the `SURFACES`, `RAILS`, and `GAPS` arrays. A new rail must have a clear takeoff, visible end, and reachable landing or deliberate failure zone. Change camera lookahead, speeds, and geometry together when tuning gaps. Test both an ordinary cruise-speed approach and a fast grind-linked approach. Never assume that the existence of a collision surface proves it is reachable.

## 8. Presentation and feedback

Use a 768×432 logical canvas, nearest-neighbor scaling, and deliberately blocky original artwork. The sunset palette separates the skater and rails from lavender city layers. Buildings, windows, rooftop signs, antennas, fans, laundry, and the water tower give the small course identity. The game uses no downloaded sprite sheets, web fonts, or licensed soundtrack.

The skater should read in silhouette: a cap, warm jacket, dark trousers, and a high-contrast board. Simple poses distinguish rolling, airborne tricks, grinds, and tumbles. A landing shadow helps judge contact height. Rail sparks and short synthesized effects confirm catches; a rising bank sound confirms points are safe. Sound is optional and gameplay information is also visual.

The HUD distinguishes banked total, unbanked combo, multiplier, recent links, and readiness to land. On phones, the combo panel sits in sky space away from the skater’s landing line. Menus are DOM controls for readable text, keyboard focus, and touch targets. The game offers reduced shake and reduced particle effects and respects the system reduced-motion preference on first launch.

A screen reader cannot fully play this real-time spatial prototype. Semantic menus, button labels, visible control instructions, and event status text are included, but they are not a claim of full nonvisual accessibility.

## 9. Modes, persistence, and privacy

**Free skate:** The default. No run deadline, no lives, and no progression gates. Bank points, discover routes, and restart whenever desired.

**90-second score run:** Same map and mechanics. At time zero, finish immediately when there is no active combo. With an active combo, allow a final landing opportunity, capped at 12 additional seconds. A bank finishes and counts it; a bail or overtime expiry loses it and ends the run. Pausing freezes the clock.

**Local-only state:** `roofline-v1-records` stores two record values and two preferences. No account, analytics beacon, server, remote asset request, or cloud save is implemented. Browser storage may be unavailable or may vary by origin, browser, privacy mode, and file handling; the game catches failures and continues. A file opened locally and the same file hosted later may not share records.

The standalone build is designed to open directly in a normal desktop browser. For phone sharing, serve `index.html` from any ordinary static host; the game itself needs no backend. Opening an HTML attachment inside a mail or files preview is not equivalent to opening it in a full browser.

## 10. Technical design and handoff

| File | Responsibility |
|---|---|
| `src/core.js` | DOM-free fixed-step simulation, course data, combo economy, recovery, timed mode |
| `src/render.js` | Original pixel art, camera, world drawing, skater animation, particles |
| `src/app.js` | Keyboard/touch input, DOM HUD, menus, audio, local storage, frame loop |
| `src/style.css` | Responsive layout and controls |
| `src/shell.html` | HTML structure with build placeholders |
| `scripts/build.py` | Inline the editable sources into `index.html` |
| `tests/core.test.cjs` | Deterministic Node simulation regression tests |
| `tests/browser_smoke.py` | Optional Playwright browser interaction and layout checks |
| `index.html` | Self-contained playable distribution |

Rebuild with `python scripts/build.py`. Run the dependency-free simulation suite with `node --test tests/core.test.cjs`. Browser QA requires Playwright and Chromium; it is not a dependency of the shipped game.

The render loop caps accumulated real-frame time to avoid a large simulation jump after a stall. Background-tab and focus-loss handling pause the game and clear held inputs. Input edges are separate from held buttons so a held trick does not automatically repeat. Multiple pointer IDs may independently hold jump, grind, and brake.

`?debug` explicitly exposes a small test interface. It is off in normal play. The simulation is deterministic for a fixed input stream; visual particle variation and sound texture are intentionally not seeded. Debug behavior, results, and coordinate-based route tests are not player-facing features.

## 11. Acceptance and validation

### Automated acceptance

- A real keyboard jump becomes airborne; an early trick completes and banks; holding grind catches the first rail and releasing it exits.
- A missed landing loses all unbanked points while preserving previously banked score; a normal bail returns a moving player to supported ground after the declared delay.
- Rail jumps preserve momentum, duplicate rail catches cannot farm multiplier, coyote time and jump buffering work, and continuous course seams remain supported.
- A scripted full circuit reaches the AC express, connects the subsequent lines, completes a lap, and banks without bailing.
- Pause freezes physics and time; restart, timed results, final-combo overtime, focus loss, and touch cancellation behave consistently.
- Desktop and simulated phone viewports render without horizontal overflow; the standalone build makes no runtime network requests.

### Evidence from this build

The delivered build passed **37 simulation tests** and **24 browser checks** in headless Chromium. The full scripted circuit reached the signature route without a bail. Browser checks used the self-contained HTML loaded into an in-memory page because browser URL navigation in the build environment was restricted. No uncaught page errors or runtime network requests were observed.

This is not a certification for every browser. Direct `file://` opening, physical iPhone/iPad/Android behavior, real-world audio quality, older browsers, local-record persistence across launches, and long-session device performance still need hands-on validation. Storage-denial tolerance was exercised in the browser environment; persistent records across actual browsing sessions were not independently verified.

### Human playtest gate

Run short sessions with three to five people unfamiliar with the controls. Observe first deliberate jump, first rail catch, first bank, first voluntary route retry, and whether the reason for a bail is understood. Ask each player to show the safer route and the riskier route after several minutes.

Initial hypotheses: first rail catch within roughly one minute; at least one voluntary retry of the AC route; the player can explain how to keep or lose the combo without reopening instructions. These are proposed usability targets, not observed outcomes. Do not add a second course until the movement and risk/reward loop clear this gate.

## 12. Next iteration and guardrails

Tune feel in this order: jump readability, rail capture forgiveness, camera lookahead, bank-window clarity, recovery placement, then trick timing and score balance. Make one meaningful change at a time and rerun the route and input tests.

After human validation, a sensible small expansion is one alternate course or a replay of the player’s best line. Neither is part of the current build. A career tree, collectible hunt, character upgrades, trick encyclopedia, or park editor would change the product rather than improve this premise.

**Release principle:** The player should leave thinking about a line they almost connected, not a menu they still need to unlock.
