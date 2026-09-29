# NIGHT RELAY — v0.2 specification

**Version:** 0.2.0  
**Release scope:** Second mission, shared terrain collision/cover, and touch controls.  
**Status:** Implemented playable build; browser-emulated mobile QA complete. Physical-device playtesting and public deployment remain outstanding.

This document is the current implementation contract. `docs/archive/PRD-v0.1.md` retains the original broader concept and baseline design. Where the two conflict, use this v0.2 document. Numerical weapon settings are fictional arcade balance, not real equipment specifications.

## 1. Product promise and constraints

Night Relay is a short, single-player browser gunship game built around protecting the vulnerable courier Rook-1. The player controls the targeting camera and three weapons, not the aircraft or the courier's route. Deliver the satisfaction of powerful overhead support without making indiscriminate large explosions the best choice.

Keep the original pixel-art thermal-feed identity, visible projectile delays, scarce heavy ammunition, friendly-fire consequences, radio text and immediate replay. The expansion must improve spatial decisions without becoming a realistic simulator or adding an unrelated management layer.

The game remains dependency-free at runtime, playable from a standalone HTML file on desktop, and suitable for static hosting. No accounts, analytics SDK, backend or external art/audio/font fetch is introduced. Browser audio is synthesized locally and starts muted. Reduced-effects preferences are retained.

## 2. Player flow

The mission selector sits above the targeting feed. Both missions are selectable from briefing immediately; there is no unlock grind. Selecting a mission loads its own map, route, objective text, stops, timing and seed. Start or Relaxed Run begins that selected mission. Mission buttons are disabled during active play and pause, preventing accidental loss of a live run.

The common lifecycle is:

`briefing → transit → checkpoint → transit → checkpoint → transit → extraction → victory/defeat`

Pause overlays the current state without advancing any simulation clocks. Returning to briefing resets the chosen mission. Retry preserves the selected mission and difficulty but resets health, ammunition, enemies, shots, checkpoint timers, gates, visual effects and held input. Completing mission one adds a Next Mission action that opens Floodgate's briefing; it does not silently launch another run.

Damage resolves before final extraction success in a shared simulation tick. Fatal damage on the final tick therefore remains defeat. End-state updates cannot award score twice or keep resolving shots.

## 3. Mission definitions

### Mission 01 — Bring them home

The original escort structure is retained: a road through the blackout district, a 14-second relay-station defense, an 18-second bridge-gate stop, and a 22-second extraction hold. The map remains 1,800 × 1,000 world units. Transit speed is 11 units per second. Optional escort hold reserve is 16 seconds; the deadline is 300 seconds.

The important change is physical terrain. The canal is now water geometry, and the crossing is a real traversable bridge. Buildings occupy the same footprints in rendering, movement and cover calculations. The courier's route is deliberately clear, but movement is still checked rather than exempted from the collision system.

An uncontested 60 Hz simulation completes at approximately 213.7 seconds. That is a computed baseline, not a measured average for players.

### Mission 02 — Floodgate

**Pitch:** Two canals. One repair crew. No way around.

Rook-1 travels through an industrial district, stops at the floodgate controls to repair a sealed crossing, moves through the warehouse district to an uplink stop, crosses the second canal and reaches the east-bank extraction pad.

| Parameter | Implemented setting |
|---|---|
| World | 1,800 × 1,000 units; independent building layout and route |
| Route nodes | 11 authored waypoints |
| Transit speed | 13.5 units/second |
| Stop 1 | Floodgate controls, 20 seconds; opens the sealed bridge gate |
| Stop 2 | Relay uplink, 18 seconds |
| Extraction | 28 seconds after reaching the pad |
| Optional escort hold | 20 seconds total |
| Mission deadline | 360 seconds |
| Normal uncontested completion | Approximately 249.5 seconds, plus optional holds |

The first canal has a gated main bridge and an always-open southern service bridge. Before the repair completes, the gate blocks both movement and ground-fire line of sight. Enemies can use the service bridge to approach from the other bank. At the end of the first checkpoint timer, the gate opens, the navigation cache is invalidated, the visual barrier changes, and a radio/flash message announces the crossing.

Opening the gate does not teleport units or move the courier forward. The courier resumes normal movement and all units continue obeying terrain. Shooting the gate does not repair or destroy it. The second canal has a single traversable bridge leading toward extraction.

Launcher and raider introductions are eligible earlier than in mission one. The final hold is longer. These are initial escalation settings, not evidence that the second mission is correctly balanced for all players.

## 4. Terrain, navigation and cover

### Single source of truth

`world.js` owns the mission geometry. The renderer consumes the mission's actual building, water, bridge and gate data. It must not independently generate a second visual building layout. Gate changes update the same simulation object that the renderer observes.

Buildings use rectangular footprints. Water is represented by canal rectangles split around bridge openings. A closed gate is a narrow solid rectangle; opening removes it from the blocking set. Ground texture, shadows, painted route markings and small decoration are not extra collision shapes.

The collision model is 2D and intentionally conservative. Entity radii provide clearance; it is not a rotated truck-body physics simulation. Enemies do not block one another and may overlap while moving through a lane. This release does not add pushing, crowd physics, deformable terrain, destructible buildings or roof interiors.

### Movement

Water, buildings and closed gates block movement. Bridges restore traversable space through water; they are not shortcuts that bypass adjacent collision tests. The courier follows its authored route, but a segment blocked by unexpected geometry stops its progress rather than allowing clipping or teleporting.

Enemies move directly when their full clearance path to the courier is open. Otherwise they use A* on a 20-unit grid. Navigation uses an eight-unit clearance class for infantry and a twelve-unit class for vehicles. Graph edges are checked against geometry, so a thin wall between free grid centers still blocks passage. The grid uses cardinal connections; path smoothing removes unnecessary corners only when the complete straight segment retains clearance.

Movement uses swept segment tests plus short substeps and axis sliding. Endpoint-only collision tests are insufficient because fast movement could cross a thin wall between samples. New path requests are staggered by unit and refreshed as the target moves; opening the gate invalidates cached grids and triggers replanning.

Spawn lanes are authored per mission. The seeded director selects lanes near the courier, then validates individual spawn positions for clearance, distance and reachability. A rejected position is searched locally or skipped; it is not placed inside a building. Every spawned enemy retains the three-second warning grace.

### Ground fire and overhead fire

Enemy attacks require range and unobstructed line of sight through solid cover. An enemy within range but behind a building repositions rather than attacking through the wall. Enemy projectile impacts also check the stored firing line and local splash visibility.

Water blocks movement, not line of sight. A launcher on the far bank can fire across open water when no building or gate intervenes. This makes canals tactically meaningful without making them universal shields.

Player rounds arrive from above at the selected world coordinate. They do not collide with buildings merely because an on-screen decorative tracer crosses a roof. A direct impact *on* a roof or closed gate is absorbed and shows impact particles without damaging nearby units. The reticle labels this situation `ROOF / SHOT ABSORBED`.

For impacts on exposed ground, radial damage applies only to targets with an unblocked segment from the impact point. Buildings and closed gates therefore shield both enemies and the courier from blast propagation. This is a simplified binary cover model, not a blast-pressure simulation.

### Required invariants

Every visible building footprint must block movement. No unit may walk through canal water. Closed gates must block their bridge lane, and opening must change both geometry and navigation. No ground shot or ground-level blast may damage a target through a solid building. An unobstructed overhead shot remains usable near buildings. Every authored courier route must remain completable when its objective-operated gate opens.

## 5. Combat and resource continuity

No additional weapon is introduced. Needle, Hammer and Thunder preserve the baseline cooldown, impact-delay, ammunition and damage rules.

| Weapon | Fire interval / delay | Radius | Resource |
|---|---|---|---|
| Needle | 0.12s / 0.20s | 14 units | Unlimited rounds; +7 heat per shot; overheat lock |
| Hammer | 0.85s / 0.55s | 36 units | Eight-round reservoir; one round per 3.2s recharge |
| Thunder | 3.8s / 1.0s | 76 units | Six rounds per mission, no refill |

Center-hit hostile damage remains 38 / 115 / 280; friendly damage remains 5 / 28 / 82, before falloff. Raider armor scales Needle damage to 28%; area weapons retain full pre-falloff damage. Needle cools at 19 heat per second and unlocks at 30 heat. Changing weapons does not reset cooldowns.

The existing runner, launcher and armored-raider types remain. Mission differences come from approaches, cover, crossing geometry and timing rather than an expanded enemy roster.

Relaxed mode scales damage to the courier to 55%, including friendly damage. It does not disable collision or friendly fire, change route speed, or alter the gate objective. The score structure remains kill points plus a successful-escort bonus, minus friendly-fire penalties.

The danger-close reticle still evaluates the courier's current position. It is not a promise that a delayed impact will remain safe. Predictive friendly-position warnings remain future work.

## 6. Touch interaction contract

### Aim and fire

Touch play separates aiming from firing. Tap or drag the feed to select a ground coordinate; doing so never fires. The target is stored in world space, so lifting a finger or following the courier does not silently turn it into a different ground target. Hold FIRE to repeat at the selected weapon's normal cadence. Release FIRE to stop immediately.

Allow either sequential one-finger use—aim, lift, hold FIRE—or simultaneous aiming and firing with two fingers. Track the aiming and firing pointer IDs independently. A pointer-up, cancellation or lost capture releases only its owning continuous action. Lifting an aiming finger must not release another finger still pressing FIRE. A browser cancellation must never leave autofire running.

There is no automatic enemy tracking or touch aim assist in v0.2. The player still needs to lead moving enemies when projectile delay matters. The reticle remains visible after lifting the aiming finger.

### Other touch controls

PAN toggles the feed gesture from aiming to camera dragging; firing is disabled while this mode is active. FOLLOW restores courier tracking and exits PAN. ZOOM toggles the same wide/detail camera scales as the desktop Q key. Weapon cards select the corresponding weapon.

HOLD is a toggle rather than a third required held finger. It stops the courier during transit while reserve remains and relabels itself MOVE. Mandatory stops, extraction, exhausted reserve, pause and reset clear the toggle. The hold does not freeze enemies or the mission clock.

Use explicit touch-button activation with duplicate-click suppression so touch actions do not depend solely on compatibility mouse-click behavior after captured drags. Preserve regular mouse and keyboard activation for menu buttons.

### Layout and interruption handling

Enable the touch cockpit by default for coarse-pointer devices. Desktop users can expose it manually with TOUCH. In phone portrait mode, place health/objective/time above the playfield and controls below it. Short portrait screens reduce nonessential chrome and playfield height so FIRE stays reachable. Landscape places the weapon and action deck beside the feed. Tablets use the same landscape structure when appropriate.

Resize the Canvas backing resolution to the actual viewport aspect ratio rather than stretching a fixed image. When that ratio changes during play, clear input and pause; the player resumes intentionally. Focus loss and hidden tabs also pause and clear held input. Honor safe-area inset padding without disabling the browser's general zoom setting.

The normal desktop controls remain available: mouse fire, 1/2/3, WASD/arrows, Q, F, Space, P/Escape, M and result-screen R.

## 7. Persistence, packaging and architecture

Version 2 storage contains preferences and best scores keyed by mission ID and difficulty. Migrate available v1 scores into mission one's records. A storage exception switches to a local-save-unavailable message without blocking play. No application network requests or personal data uploads are introduced.

Deliver a standalone `Night-Relay-v0.2.html`, editable source, and identical `dist/index.html` for static hosting. `build.cjs` must embed scripts in world → simulation → renderer order. The build requires Node; the produced game does not. Keep tests and their evidence with the source.

A new mission should be added through a mission definition rather than by copying the entire game. The current world size is shared by both missions; arbitrary world-size support is not promised. Rendering is cached for static terrain and redrawn when the gate version changes. Navigation is independent of render-frame timing.

## 8. Acceptance and release status

The implemented release passed 56 Node gameplay/terrain checks and 48 Chromium browser checks. Coverage includes route clearance, both mission completions, closed/open gates, alternative bridge navigation, roof absorption, splash cover, enemy repositioning, spawn validity, touch pointer ownership, cancellation, pan/follow/zoom, hold/resume, portrait/landscape layout and score-key separation.

The browser suite includes explicitly labeled no-spawn accelerated fixtures for victory UI, and in-memory storage for migration checks. Those fixtures do not certify human difficulty or real-origin persistence. Full-route geometry soak runs restore courier HP to keep the observation window open; 98,172 sampled enemy positions produced no terrain penetrations and no six-second movement stalls under that test definition.

**Still required before claiming a public release:** physical iPhone and Android sessions, real hosted-origin loading and storage, Safari/Firefox checks, human audio audition, and difficulty/readability playtesting. This environment blocked local-file navigation; browser validation used HTML injection. No live site has been deployed by this update.

Do not interpret automated exact-position bot victories as a player win-rate estimate. The next work should emphasize input feel, small-screen identification and fair encounter tuning, rather than adding a third mission or multiplayer immediately.

## 9. Implementation references

Consulted primary browser documentation for pointer identity/capture/cancellation, touch gesture handling and safe-area values:

- MDN Pointer events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN touch-action: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- MDN env(): https://developer.mozilla.org/en-US/docs/Web/CSS/env

These references explain browser mechanisms; they do not substitute for the physical-device QA listed above.
