# BOOSTBALL 16
## Product requirements document

**Working title:** BOOSTBALL 16 — Midnight Motor League  
**Version:** 1.1 / prototype 0.2.0  
**Date:** September 24, 2026  
**Platform:** Browser; desktop keyboard first  
**Product:** Original, 16-bit-inspired car soccer  
**Status:** Playable prototype delivered; not a production release

> Small cars. Big overtime energy.

A compact, top-down arcade game about driving into the right place, committing to a boost, and knocking a ball into a goal. The desired feeling is car-soccer momentum and last-second saves, translated into a readable pixel-art game rather than a miniature 3D simulation.

**The first product decision:** preserve acceleration, steering, collisions, boost management, bank shots and competitive scoring. Do not attempt aerial control, a chase camera or online matchmaking in the first release.

**Included with this specification:** a self-contained playable HTML file, editable JavaScript/CSS/HTML, a browser-independent simulation, automated tests, build instructions and an implementation handoff. This document distinguishes what the prototype already does from the work required for a public release.

**One-sentence experience:** Open the page, choose an opponent, play a two-minute match, and immediately want a rematch.

<!-- pagebreak -->

# 1. Product direction

## Player and use case

Design for someone taking a short break at a laptop, a casual player who likes retro sports games, or two people sharing a keyboard. The game should require neither familiarity with car-soccer games nor an account. The initial product is a small, replayable arcade toy, not a live-service platform.

The user request establishes a browser game with a SNES-like appearance and car-soccer mechanics. Top-down presentation, a two-minute clock, single-player priority and the working title are proposed design choices, not previously approved constraints.

## Why top-down

Top-down keeps the whole pitch, both goals and both cars visible. The intended skill is lining up a shot and controlling momentum. A side-view alternative would make jumping more prominent but remove much of the lateral positioning. Full 3D would make camera control, depth perception and aerial physics central workstreams. For the first playable version, choose top-down and validate its feel before adding another dimension.

The game is inspired by the broad car-soccer premise, with an original venue, teams, interface, sprites and audio. Do not import another game's name, logos, vehicle designs, music, voice lines or extracted assets. The working title has not been cleared for commercial use.

## Experience principles

**Readable before elaborate.** The player must locate the ball and identify their car instantly. The camera stays fixed. Visual effects must not conceal the ball or scoreboard.

**Momentum with recovery.** Driving should have weight without long, helpless slides. Releasing the accelerator and braking should make correcting a mistake practical.

**Skill before upgrades.** Position, contact angle and boost timing decide a match. All cars share the same physical parameters. No stat progression or paid advantages.

**Fast return to play.** Opening a match requires one mode choice and one button. Rematching requires one button. Goals have a short celebration, not a lengthy replay.

## Validation targets — not observed results

In an initial five-person test, aim for four players to make intentional ball contact within 30 seconds and understand the scoring direction without coaching. Aim for three to voluntarily start another match. Ask players to separate complaints about steering, ball contact, difficulty and readability. These are small-sample product gates, not statistically established retention benchmarks.

**Out of scope:** accounts, online play, ranked ladders, chat, monetization, elaborate car customization, aerials, wall driving, 2v2 teams, controller support and a season mode in prototype 0.2.

<!-- pagebreak -->

# 2. Match rules and core loop

## The loop

Choose Solo, Local 2 Player or Free Practice. Read the control hints, start the match, contest the kickoff, approach the ball from a useful angle, choose whether to spend boost or dash, and recover into the next play. After a goal, celebrate briefly and reset. At full time, offer an immediate rematch or return to the menu.

## Modes in the prototype

| Mode | Participants | Clock | Purpose |
| --- | --- | --- | --- |
| Solo | One human and one CPU | 120 seconds | Default quick match |
| Local 2 Player | Two humans, one keyboard | 120 seconds | Shared-device competition |
| Free Practice | One human; no active opponent | Untimed | Learn driving and ball contact |
| Attract demo | Two CPUs behind the menu | Internal match clock | A moving, representative background |

Practice records goals for feedback but does not declare a winner. Resetting the practice ball preserves the practice score. Changing modes starts a fresh game.

## Scoring and boundaries

Cyan starts on the left and attacks the orange goal on the right. Orange attacks left. Award one point when the entire ball crosses a goal line through the clear opening. Own goals count for the opposing side; a player's last touch is not used to decide the scoring team.

Cars stay within the main field, including at the goal mouth. Only the ball can enter the recessed nets. Goalposts are solid. The side walls outside the goal openings and the top/bottom walls produce rebounds. There are no out-of-bounds restarts, fouls or power-ups. Boost demolitions are enabled by default; see section 12.

A goal transitions immediately out of active play, preventing duplicate scoring. Freeze the competitive clock and show a 1.5-second celebration. Reset ball and car positions, refill boost, reset dash cooldowns and restore pads, then run a 2.4-second countdown. A displayed 3–2–1 uses 0.8 seconds per count.

## Clock and overtime

The clock runs only during active play, not countdowns, celebrations or pause. If the clock expires with a lead, end the match. If tied, continue the current play in unlimited golden-goal overtime. The next goal wins after its celebration.

Resolve collisions and any goal in the final simulation tick before deciding the final result. This means a goal crossing during that last tick counts. There is no extra “keep the ball airborne” rule because the prototype has no gameplay height.

## State contract

The simulation owns `countdown → playing → goal → countdown`, with `finished` as the terminal state. Overtime is a flag on active play. The browser layer owns menu visibility and pause; pausing stops calls into the simulation. Returning to the menu starts a separate attract demo. Resuming never silently begins a new match.

<!-- pagebreak -->

# 3. Driving, boost and contact

## Control model

Use car-relative steering: forward accelerates along the vehicle's nose; left/right rotate the car rather than moving it sideways. Reverse steering behaves like a reversing car. Steering remains available at low speed to reduce frustrating recovery loops. There is no automatic aiming or magnetic ball attachment.

| Action | Solo / practice / P1 | Local P2 |
| --- | --- | --- |
| Accelerate | W; Up Arrow also works outside local mode | Up Arrow |
| Brake, then reverse | S; Down Arrow also works outside local mode | Down Arrow |
| Steer | A / D; arrows also work outside local mode | Left / Right Arrow |
| Boost | Space or Left Shift | Enter or Right Shift |
| Dash | E or X | / |
| Pause | P or Escape | Shared |
| Reset practice ball | R | Not applicable |
| Sound | M | Shared |

In local mode, arrows exclusively control P2. The touch buttons control P1 only. Some keyboards may miss simultaneous key combinations; physical-keyboard compatibility and controller fallback remain release work.

## Initial tuning values

| Parameter | Prototype value | Intended effect |
| --- | --- | --- |
| Ordinary speed ceiling | 170 logical pixels/second | Controllable baseline pace |
| Boosted speed ceiling | 260 pixels/second | Meaningful commitment and recovery tool |
| Absolute car speed ceiling | 315 pixels/second | Bounds dash and collision behavior |
| Forward acceleration | 245 pixels/second² | Quick, but not instantaneous, launch |
| Steering rate | 3.65 radians/second, reduced at speed | Responsive low-speed turns |
| Boost pool / use / recharge | 100 / 34 per second / 11 per second | Limited sustained boost |
| Pad refill / respawn | 38 boost / 4 seconds | Reward routing through space |
| Dash impulse / active window | 115 pixels/second / 0.17 seconds | A short forward lunge |
| Dash cooldown | 1.25 seconds | Prevent continuous dash spam |
| Ball maximum speed | 400 pixels/second | Readable fast shots |
| Ball wall restitution | 0.86 | Lively but damped bank shots |

These numbers live in `CONFIG` in `src/core.js`. They are starting values, not empirically optimized settings. Change a small set at a time and rerun the collision suite.

## Contact and recovery

Cars and the ball use circular colliders. Cars have four times the ball's mass. Resolve overlap, then apply a normal impulse only when bodies are approaching. A boost or dash creates a harder shot by increasing contact speed, not by invoking a separate shot button or random damage roll.

Dash is edge-triggered: holding the key cannot repeatedly activate it. A released and pressed key is still blocked until the cooldown expires. Releasing boost begins passive regeneration; touching a ready pad provides a separate refill. Ordinary contact cannot steal boost.

Lateral grip damps sliding; forward drag slows coasting. Speed above the ordinary ceiling bleeds down after a dash instead of disappearing instantly. Full 3D jumps, aerial dodge directions, spin-controlled shots and an explicit handbrake are deferred.

<!-- pagebreak -->

# 4. Arena, art and sound

## Aesthetic direction

The visual target is a 16-bit sports cartridge seen through a modern browser, not strict SNES hardware emulation. Use a low-resolution canvas, chunky sprite shapes, limited shading, a compact pixel font and a restrained stadium palette. A modern 16:9 layout is intentional.

The prototype's venue is Night Shift Arena: dark grandstands, alternating green pitch strips, cyan and orange ends, cream markings and gold boost pads. Maintain a quiet field so the ball remains the brightest gameplay object. Teams have numeric markers as well as colors.

## Arena specification

Render to a 640 × 360 logical-pixel canvas. The playing field runs from x=50 to x=590 and y=76 to y=302. Goal openings run from y=146 to y=232; visual nets extend 20 pixels beyond the side lines. The ball collider has radius 6 and car colliders radius 9. Six boost pads are arranged in two rows of three.

The entire field remains visible. Scale with CSS and preserve the aspect ratio; use letterboxing where the surrounding layout has a different ratio. Integer scaling is preferable when it fits, but the prototype allows responsive non-integer scaling. Disabling canvas image smoothing preserves sharp scaled sprite pixels; this behavior is documented by MDN [S1].

## Asset direction

The initial cars are generated from a small original pixel matrix with 32 baked rotation frames per team. Stadium markings, crowd pixels, goals, ball, particles and the 5×7-style canvas lettering are generated in code. The browser shell uses system fonts. There are no external art, font or audio downloads.

A production art pass should start with the car silhouette, nose identification and ball readability, not additional decorative content. Preserve the collider-to-sprite relationship or consciously retune it. A longer-looking car with the same circular collider can feel inconsistent at its corners.

## Feedback budget

Show exhaust while boosting, a small ring during a dash, a short ball trail at speed, contact sparks, tire marks during significant slip and a restrained goal burst. Cap transient particles at 320 and skid marks at 240. Do not let goal effects cover the scoreboard.

The effects switch disables CRT scanlines, camera shake and goal flashes. It does not remove every particle or trail. A reduced-motion preference switches these effects off by default. A stronger low-effects mode remains a useful follow-up.

## Audio direction

Use short synthesized sounds for kickoff, contact, dash, boost collection and goals. Sound starts off and is explicitly toggled by the player. Initialize or resume audio after a user gesture rather than relying on autoplay; MDN describes this requirement and recommendation [S2].

No soundtrack, engine loop or crowd recording is included. Playback failures must never block gameplay. Add a volume slider and conduct an actual listening pass before release; automated tests only verify that the toggle and audio code do not throw errors.

<!-- pagebreak -->

# 5. Opponents, difficulty and onboarding

## CPU behavior

The CPU receives the same public game state and produces the same throttle, steering, boost and dash inputs available to a human. It uses the same resource pool, speed limits, collision model and cooldowns. It cannot teleport during play or directly move the ball; it uses the same demolition and respawn rules as a human.

Predict a short future ball position, choose the less-defended half of the opponent's goal, and approach from behind the intended shot. When on the wrong side of the ball, route around rather than deliberately pushing toward the CPU's own goal. Apply turning-dependent throttle reduction and boost only when approximately aligned.

| Preset | Decision interval | Behavior differences |
| --- | --- | --- |
| Rookie | 0.16 seconds | Lower throttle; no boost or dash |
| Club | 0.09 seconds | Higher throttle and aligned boost |
| Pro | 0.055 seconds | Full throttle range; selective, aligned near-goal dash |

These are implemented presets, not validated skill ratings. A more aggressive CPU is not guaranteed to win more often. Basic idle-opponent scenarios pass for all three, but moving-player defense, recovery and difficulty ordering still require testing.

## Required AI improvements before a competitive claim

Record representative cases involving a moving attacker, a ball in each corner, a ball moving toward the CPU's goal and two opposing cars meeting head-on. Test whether the CPU recovers within a reasonable interval rather than circling indefinitely. Make intentional defending and unsticking explicit states if the current steering heuristic is insufficient.

Do not replace an AI weakness with hidden speed, unlimited boost or a moving ball teleport. A weaker but understandable opponent is preferable to invisible cheating.

## First-time experience

The menu identifies the human as cyan and tells them to score in the orange goal. Show the basic controls next to the arena, and provide Free Practice without a timer or opponent. Use a visible countdown to establish that the match has started.

The first useful tutorial should be playable, not a wall of text: drive through a gate, touch a stationary ball, collect a pad, then score once. Treat this as a follow-up task; the delivered build has hints and practice, not a scripted tutorial.

## Difficulty and touch release gate

Watch at least five new players before deciding whether the default is Club or Rookie. Ask whether failures feel like a steering problem or an opponent problem. Tune handling before making the bot weaker to hide an unintuitive control scheme.

Touch controls are an experimental convenience, not a mobile-first design. The small pitch and car-relative steering may be awkward on a phone. Test sustained multi-touch, pointer cancellation, orientation changes and the practical visibility of the pitch while pressing buttons on actual devices before advertising mobile support.

<!-- pagebreak -->

# 6. Functional requirements

**P0** means necessary for the proposed public MVP. **P1** means a useful follow-up. “Prototype” indicates implemented starter behavior, not full release certification.

| ID | Priority | Requirement and acceptance condition | Status |
| --- | --- | --- | --- |
| F01 | P0 | Start a solo match without an account or network dependency | Prototype |
| F02 | P0 | Drive, reverse, steer, boost and dash with visible resource feedback | Prototype |
| F03 | P0 | Resolve car/car, car/ball, wall and post contact without invalid state | Prototype + tests |
| F04 | P0 | Award a goal only after the whole ball crosses; never award twice | Prototype + tests |
| F05 | P0 | Freeze clock during non-playing states; resolve expiry and overtime | Prototype + tests |
| F06 | P0 | Play against a CPU using the same physical constraints | Prototype |
| F07 | P0 | Pause manually and automatically on focus loss; resume explicitly | Prototype + browser checks |
| F08 | P0 | Rematch resets score, time and resources | Prototype + browser checks |
| F09 | P0 | Untimed practice with ball reset and no opponent | Prototype |
| F10 | P0 | Read score, timer, team and boost without relying only on color | Prototype; human review pending |
| F11 | P0 | Complete the browser/device and human-playtest release matrix | Not completed |
| F12 | P1 | Two humans use separate controls on the same keyboard | Prototype; hardware testing pending |
| F13 | P1 | Touch buttons permit basic P1 play and release safely | Experimental prototype |
| F14 | P1 | Controller input, rebinding and volume control | Not implemented |
| F15 | P1 | Scripted first-play tutorial and better CPU recovery | Not implemented |
| F16 | Later | Private online matches with an authoritative server | Not implemented |

## Acceptance rules that must remain explicit

Pressing a control while a menu select is focused must not drive a car. Gameplay controls should not scroll the page during active play. Losing focus must clear held keys and touch state; returning to a tab must not continue an old throttle or automatically resume.

Menus and buttons must remain native focusable HTML controls. Important match events should be announced through a polite status region. Do not claim the real-time canvas game is fully screen-reader accessible merely because its menus and status messages are accessible.

In practice, no inactive CPU collider may affect the ball. In local mode, arrow inputs must not move P1. A missing sound API, denied fullscreen request or unavailable local storage must not prevent a match.

**Definition of prototype completion:** the executable opens, the principal loop works, current automated checks pass, and remaining limits are disclosed. **Definition of public MVP completion:** additionally meet the human-playtest, device and deployment gates in Sections 9–10.

<!-- pagebreak -->

# 7. Technical architecture

## Runtime and boundaries

Use plain JavaScript, HTML Canvas 2D and CSS for the first implementation. The small entity count and simple 2D rules make a heavyweight framework unnecessary for this prototype. This is a scope choice, not a claim that the stack is superior for every later feature.

| File | Responsibility |
| --- | --- |
| `src/core.js` | Configuration, state machine, controls-to-motion, collisions, CPU and gameplay events |
| `src/game.js` | Pixel rendering, keyboard/touch input, DOM menus, sound, effects and animation loop |
| `styles.css` | Responsive arcade shell and accessible menu styling |
| `index.html` | Markup and editable-source entry point |
| `tools/build_standalone.py` | Inline CSS and scripts into a single portable HTML |
| `tests/physics.test.cjs` | Node-based deterministic simulation checks |
| `tests/browser_smoke.py` | Optional Playwright integration checks |

`core.js` is independent of the browser and exports to both Node and the browser. Renderers and tests can instantiate a `Game`, call `step`, read state and drain gameplay events. Do not add DOM or audio calls to the simulation. `game.js` is deliberately compact starter code; split it into renderer/input/audio/UI modules as it grows.

## Time and collision strategy

Accumulate elapsed animation time and advance the simulation in fixed 1/120-second steps. Each step has two movement/collision microsteps. Render with `requestAnimationFrame`; MDN notes that callback timing depends on the display and usually pauses in hidden tabs, so callback count must not be treated as game time [S3].

The prototype caps incoming frame delta at 0.1 seconds and processing at 12 steps per frame to prevent an unbounded catch-up loop. Under sustained overload the simulation can run slower than wall time. This tradeoff is acceptable for an offline prototype, not a networking time source.

At the configured 400-pixel/second ball cap and 315-pixel/second car cap, the maximum straight-line relative travel per microstep is approximately 2.98 pixels: `(400 + 315) / 240`. This is a bounded-speed mitigation tested with representative collisions, not a mathematical guarantee covering all geometry. Revisit swept collision detection before raising speeds or adding smaller obstacles.

Use overlap correction, approach-only normal impulses, explicit speed caps and circular posts. Rendering must not change the physics state. Cosmetic randomness is separate. Replay with identical input steps is tested in one runtime; cross-browser bit-identical determinism is not established.

## Performance targets

Target a responsive 60-frame/second presentation on representative modern laptops, not a guaranteed frame rate on every browser. The standalone prototype is approximately 61 KB uncompressed because assets are procedural. Initial release budgets: under 1 MB compressed total payload; no post-load asset fetches; no recurring long stalls during a five-minute play session. Measure on real hardware before claiming these targets are met.

There is no render interpolation yet. Evaluate whether interpolating between previous and current simulation states improves smoothness before adding complexity elsewhere.

<!-- pagebreak -->

# 8. UX, accessibility, privacy and distribution

## Layout and navigation

Keep the arena as the dominant element. The menu offers mode, CPU preset and Kick Off. The header offers sound; the frame offers pause and fullscreen. During play, keep score, clock, boost and dash availability above the field. Results show the final score and ball-touch counts, followed by Rematch and Return to Menu.

The existing page adapts to narrow viewports and exposes on-screen controls on touch-capable devices. Desktop keyboard is the recommended first-run experience. Fullscreen is optional and may be unavailable or denied; normal-window play is always the fallback.

## Accessibility requirements

Retain visible focus styles, descriptive labels, keyboard-operable menus and non-color team markers. Preserve the ball's high contrast against the field. Sound is off initially, and settings must be reversible without restarting. The effects switch should remain easy to find.

A reduced-motion preference disables the CRT/shake/flash option by default. Gameplay still includes moving cars, a ball and cosmetic particles. Additional low-effects options, remappable controls, a volume slider and a thorough accessibility review remain on the backlog.

## Data and storage

The delivered game has no account system, backend, analytics SDK, advertising, chat, multiplayer or external requests. It does not transmit player activity. It attempts to remember effects, demolition and respawn preferences in local storage. These preferences are not a cloud save and may not persist in restricted browser contexts.

Do not quietly add third-party fonts, tracking pixels, error-reporting scripts or analytics during polish. A hosting provider can generate ordinary access logs independently of the game's code; do not describe a future hosted deployment as having no data collection without checking its configuration.

The explicit test hook is enabled by `?test=1` or `window.__BB_TEST__ = true`. It exposes local mutable state for tests. It is not a secure competitive interface and must not be trusted for future leaderboards or paid rewards.

## Packaging and deployment

The portable build is `dist/index.html`. A player can open it as a local HTML file in a browser that allows local scripts, or play it from a static web host. There is no application server or runtime installation. Some chat clients preview HTML as text rather than execute it; save the file and open it in a browser instead.

For development, open the root `index.html` alongside its source files, or run `python -m http.server 8080` from the project directory. The build helper inlines the sources without minification. Regenerate the portable file after every source change; do not edit both copies independently.

No live website, domain, repository or hosting account is created as part of this delivery. Before publishing, verify the actual deployed URL, content type, error handling, caching, mobile layout and browser behavior. HTTPS hosting and a restrictive deployment configuration are follow-up operational work, not features already tested here.

<!-- pagebreak -->

# 9. QA evidence and remaining risks

## Executed checks

**80 simulation tests passed (43 original + 37 demolition regressions).** Coverage includes initialization, countdown, acceleration, steering, braking, boost refill and cooldowns, dash edge handling, boundaries, wall/post interactions, goal-line checks, overlap resolution, high-speed opposing contact, resets, final-tick scoring, overtime, practice isolation and repeatable local simulation.

The suite also checks each CPU preset against an idle player and includes a 30,000-step bounded-state run. These scenarios do not establish that the AI is strong, that all possible collision states are safe, or that the game is fun.

**71 browser checks passed (29 original + 42 demolition integration checks).** Chromium checks cover menu/start flow, keyboard input, boost and dash, pause and resume, focus loss, practice reset, separate local-player input, results/rematch, overtime, sound/effects controls, narrow layout, reduced-motion behavior, on-screen input, absence of JavaScript errors and absence of external network requests in the tested session.

The browser harness injects the generated standalone HTML into a blank Chromium page with its test hook enabled. File-URL and localhost navigation were blocked by the test environment's browser policy. Therefore the checks validate execution and interactions, not a real hosted deployment or an end-to-end double-click launch. The standalone file uses no runtime fetches or external scripts.

## Release test matrix

| Environment or activity | Current evidence | Remaining work |
| --- | --- | --- |
| Node simulation | 80 passing tests | Add regressions with every physics change |
| Headless Chromium | 71 passing integration checks | Repeat on final artifact |
| Desktop Chrome / Edge on hardware | Not certified | Play full matches; test key combinations |
| macOS Safari / desktop Firefox | Not tested | Full flow, audio, pause, resizing |
| iPhone / Android browser | Narrow touch-capable viewport checks only | Real-device multi-touch and orientation |
| Gamepad | Not implemented | Add adapter and hardware tests |
| Audio quality | Toggle and code execution checked | Listen for volume, clipping and overlap |
| Public host / local-file navigation | Not exercised end-to-end | Test the actual distribution paths |
| Enjoyment and difficulty | No external playtest | Five-player observation and iteration |

## Main known risks

**Handling may still feel too slippery or too rotational.** Tune acceleration, grip, turn rate and braking before adding content. Circle colliders are readable and simple but not precise car-body geometry.

**CPU behavior is heuristic.** Faster decisions do not imply a stronger opponent. Defensive rotation, corner recovery and difficulty ordering remain incomplete.

**The 16-bit look is a prototype art pass.** Procedural assets communicate direction but do not replace custom animation, sound design and a polished tutorial.

**Online play is not a small switch.** Local simulation and offline test determinism do not provide synchronization, latency handling, cheating resistance or a matchmaking service.

**Automation is not a playtest.** No claims about retention, commercial demand, complete compatibility or measured 60 FPS are made from these tests.

<!-- pagebreak -->

# 10. Build plan and release gates

## Stage A — delivered vertical slice

The current package establishes one arena, original procedural visuals, the driving/contact loop, solo CPU play, local play, practice, scoring/overtime and testing. Keep this executable as the baseline. Record changes to physics rather than replacing its architecture before testing the feel.

## Stage B — handling and comprehension

Use one or two focused implementation sessions as a planning allowance, followed by player observation. Adjust a small set of handling constants, improve nose/ball visibility and clarify which goal to attack. Add regression fixtures for any observed physics failure. Do not simultaneously retune the bot, field size and speed system; doing so obscures which change helped.

**Exit gate:** most first-time testers can intentionally steer into the ball, understand boost versus dash, and recover from missing a shot. At least three of five initial testers choose another round without being prompted. The exact sample and gate are provisional product decisions.

## Stage C — practical public MVP

Add a short playable tutorial, controller input, rebinding, volume control and explicit AI recovery/defense where observation warrants it. Keep local keyboard play but test real hardware. Complete desktop browser checks and make the actual hosted URL work reliably. Start with a free, accountless release; do not add monetization infrastructure before validating repeat play.

**Exit gate:** complete a full match and rematch in the supported browser matrix, no game-breaking issues during sustained play, clear handling feedback, no unexplained CPU advantages, and verified static deployment. Decide whether mobile remains experimental or becomes a supported platform based on device testing.

## Stage D — depth without unnecessary services

Evaluate additional cosmetic arenas, car paint options, challenge drills, a local tournament or a small cup mode. Prefer variations that reuse the validated controls. Treat a pseudo-height jump or flip as a new design experiment with its own collision and readability tests; it is not already represented by the current dash.

## Stage E — optional online branch

Only after repeated demand, prototype private 1v1 rooms. Use an authoritative server for score and simulation decisions, client prediction for local responsiveness, snapshots/interpolation for remote state, and explicit reconnect/disconnect behavior. Define latency and packet-loss test conditions before claiming acceptable online feel.

Do not use browser local storage as an authoritative score store, assume cross-browser deterministic lockstep, or begin with ranked matchmaking. A later online version needs deployment, session security, abuse controls, monitoring and ongoing operating decisions. Those workstreams are outside the current implementation estimate.

## Next implementation task

Start with a bounded feel-and-onboarding pass, using `CODEX_HANDOFF.md` in this package. Preserve the single-file build, keep the simulation independent of the browser, run both test suites, and document exactly what changed. Do not make a framework migration, 3D rewrite or network backend part of that first pass.

<!-- pagebreak -->

# 11. Decisions, success measures and handoff

## Decisions to validate next

**Presentation:** keep top-down as the baseline. Revisit side-view or pseudo-3D only if playtesting shows that jumps and aerial control matter more than readable ground positioning.

**Default difficulty:** Club is the current default; switch to Rookie only after observing first-time players. Keep the presets but avoid describing them as calibrated difficulty tiers.

**Feel:** test whether dash should remain a simple forward lunge or later become a directional dodge. An actual jump requires new mechanics and visual communication; a sprite lift alone should not imply an airborne collision rule.

**Audience:** launch desktop-first unless real mobile testing shows that the small field and simultaneous controls work well. Touch support in starter code is not enough to settle this decision.

**Business model:** validate enjoyment before selecting one. The initial recommendation is no accounts, no paywalls and no advertising interruptions. Cosmetic monetization or a downloadable edition can be explored later, but no revenue forecast is justified by the current evidence.

## Measurement plan

For the first tests, observe manually: time to intentional first touch, whether players identify their car and goal, accidental own goals, boost/dash confusion, match completion, voluntary rematch and the player's own explanation of a loss. Keep notes about the exact tuning version.

For a future public build, consider minimal aggregate events for game start, tutorial completion, match completion, rematch and fatal error only after deciding consent, data handling and retention. Such instrumentation is not in the delivered code. Do not create a user identifier or add advertising telemetry as an incidental development step.

## Deliverable checklist

The package contains source HTML/CSS/JavaScript, a generated standalone HTML, this specification in Markdown, a Word copy, a README, an implementation handoff, Node simulation tests, an optional Playwright smoke harness and a QA report. Code parameters are centralized for tuning, and the build does not require downloading game assets.

The deliverable is initial code with a playable loop, not a production service. No external account, repository, live site, custom domain or multiplayer server has been provisioned.

## Technical references

These primary documentation references support browser API behavior only; the game design, tuning values and roadmap are proposed here.

**[S1] MDN: CanvasRenderingContext2D.imageSmoothingEnabled.** Disabling smoothing keeps scaled pixel artwork sharp. Accessed September 24, 2026.  
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled

**[S2] MDN: Web Audio API best practices.** Guidance on user gestures, audio context startup and playback controls. Accessed September 24, 2026.  
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices

**[S3] MDN: Window.requestAnimationFrame.** Animation timestamps, display-dependent callbacks and background-tab behavior. Accessed September 24, 2026.  
https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame


<!-- pagebreak -->

# 12. Boost demolitions and respawning

## Defaults and player settings

Enabled by default in solo, local and attract-demo modes. The menu offers Demolitions On/Off and Respawn Time of 1, 1.5, 2 or 3 seconds. Default: 1.5 seconds. Settings apply to new matches and rematches; disabled controls preserve the chosen values in practice. Browser storage is optional and failure-safe.

## What counts as a demolition

A car must be actively boosting when its front hits the other car. Minimum speed is 140 logical pixels/second; closing speed and the attacker’s velocity toward the victim must each be at least 50 pixels/second. Nose alignment must have a dot product of at least 0.5 toward the victim. All thresholds live in CONFIG.

Unboosted dash impacts, slow bumps, sideswipes, separating contact and being rear-ended are not attacking demolitions. With demolitions off, normal momentum-based collisions remain. Both attacks are checked before either car is removed, so qualifying head-on boost collisions demolish both cars.

## Absence and return to play

The victim disappears immediately and cannot move, collide with cars or the ball, or collect pads. Velocity, boost, dash and cached CPU commands are cleared. The ball and match clock keep running. Demolition and respawn events drive presentation; each car tracks demolitions and deaths.

After the selected active-play delay, respawn in the home half facing the opponent’s goal, with zero velocity, 60 boost and a 0.75-second shield. Choose from six home-half locations by maximizing clearance from the live rival and ball, including their projected positions 0.25 seconds ahead.

The shield prevents both incoming and outgoing car collisions and demolitions. The returning player can drive and hit the ball immediately. Pausing, goal celebrations and kickoff countdowns freeze respawn timers. A goal reset restores both cars; a finished match cannot respawn them. A rematch resets all demolition counts.

## Feedback and acceptance

Show a pixel explosion, optional synthesized impact sound and brief camera shake, plus a demolition banner, per-team respawn countdown/progress bar, visible spawn-shield rings and match-end demolition counts. Disabling effects removes the large explosion rings and shake but keeps a small debris cue, countdown and shield readable.

The update adds 37 simulation regressions and 42 Chromium integration checks. Coverage includes all four delays, no dead-car collisions or pad pickups, double knockouts, shield fairness, reset/overtime interactions, keyboard-triggered demolition, pause timing, menu settings and 320–1440 pixel layouts. Human tuning of the 1.5-second default, threshold and shield remains outstanding.

