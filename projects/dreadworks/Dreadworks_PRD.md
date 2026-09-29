# DREADWORKS — Product Requirements Document

**Working title:** Dreadworks  
**Genre:** Reverse platformer / trap-building tower defense / light roguelite  
**Platform:** Desktop web browser first; tablet/mobile later  
**Visual target:** SNES-era 16-bit pixel art, 16:9 presentation, chunky animation, limited palette  
**Core promise:** Build the deadly side-scrolling level instead of playing through it, then watch a swarm of imperfect little heroes try to survive what you made.

---

## 1. Product vision

Dreadworks is a compact browser strategy game inspired by the core fantasy of *Hostile Architect*: the player is the villain behind a platformer level. During a short build phase, the player spends gold placing blocks, traps, launchers, guns, and movement modifiers. Then the player releases a wave of autonomous heroes. The fun comes from watching the level behave as a physical system: heroes jump too early, collide with each other, get launched into hazards, survive unexpectedly, and occasionally expose a flaw in the player's design.

The browser version should not attempt to reproduce a large PC game's full content set. It should focus on the strongest 10–20 minutes of play and make that loop immediately legible:

**Build → Release → Watch chaos → Earn → Adapt → Escalate.**

The design should feel like a mixture of a tower defense game, a Mario-style platformer editor, and a physics toy.

---

## 2. Design pillars

### 2.1 The level is the weapon
The player is not aiming a character or directly fighting. Their primary agency is spatial: placement, timing, funnels, launch angles, and trap combinations.

### 2.2 Heroes are readable but imperfect
Heroes move right and understand basic platforming rules, but they are not perfect bots. Different hero archetypes have different timing, jump ability, speed, armor, and routes. A crowd should feel like water flowing through a dangerous machine.

### 2.3 Short build phases, entertaining simulations
The player should spend roughly 20–40 seconds making choices, then 15–35 seconds watching those choices resolve. The game should avoid repair chores or constant clicking during the action phase.

### 2.4 Emergent combos beat raw DPS
The best moments should come from combinations: springboard → ceiling saw, reverse conveyor → crusher, block → forced jump → spikes, cannon knockback → pit.

### 2.5 Small enough for the web
A run should load instantly, use no account, save locally, and remain playable on an ordinary laptop. The simulation should favor hundreds of simple entities rather than a handful of expensive AI agents.

---

## 3. Reference learnings from Hostile Architect

The current public description of *Hostile Architect* centers on an inverted 2D side-scroller: players buy from a limited trap selection, build a level, and then unleash increasing waves of heroes. Its Steam description highlights 30+ traps, upgrades, powers, and combinations such as conveyors, springboards, lava, spikes, and saws.

Public comments on the original game point to several useful product lessons for a browser reinterpretation:

- Players want a clear, separate build phase rather than enemies arriving while they are still learning placement.
- Trap removal / selling matters because an early mistake can otherwise poison the whole run.
- Manual repair becomes busywork at higher waves; auto-resetting traps between waves is cleaner.
- A single entrance can produce an overly dominant bottleneck.
- More enemy archetypes and stage variation are important to prevent the same crusher/gun strategy from solving every wave.
- The developers described heroes as moving right with basic hazard navigation and imperfect jump timing rather than following a fixed path. That model is computationally cheap and produces readable chaos.

Dreadworks intentionally uses these lessons while creating its own visual identity, progression, balance, names, and implementation.

---

## 4. Target player

A player who likes:

- Tower defense but wants less passive “place turret on node” play.
- Physics sandboxes and chain reactions.
- SNES aesthetics and quick browser games.
- Roguelite runs with clear, compact decisions.
- Watching simulated agents attempt a problem they designed.

The game should be understandable without a tutorial video.

---

## 5. Session structure

### 5.1 MVP run
A normal run lasts approximately 12–20 minutes.

1. Start with 30 gold, 10 castle integrity, and a tiny trap catalog.
2. Build a defensive course.
3. Release wave 1.
4. Earn bounty for defeated heroes and a wave-clear bonus.
5. Receive a refreshed shop.
6. Every third wave, choose one upgrade.
7. New hero archetypes appear over time.
8. At wave 10, face a boss / siege wave.
9. Continue endless mode after wave 10 for score.

### 5.2 Failure
The run ends when castle integrity reaches zero.

### 5.3 Score
Score combines:

- Highest wave reached.
- Heroes defeated.
- Gold retained.
- Combo kills.
- Castle integrity remaining.

---

## 6. Core game loop

### BUILD PHASE
The game pauses. The player sees the full arena and shop.

Actions:

- Select a trap card.
- Place it on the 16×16 grid.
- Right-click / secondary tap a placed item to sell it for 60% of cost.
- Inspect trap radius / direction by hovering.
- Start the wave at any time.

Rules:

- No manual repair.
- All reusable traps reset automatically between waves.
- Traps may have cooldowns during a wave.
- Blocks can alter the physical route.
- The player can never fully seal the entrance or castle tile.

### WAVE PHASE
Building locks. Heroes spawn in bursts and attempt to reach the castle.

The player may:

- Pause.
- Change speed (later milestone).
- Observe.

The player does **not** click traps to activate them in the MVP. The fun should come from architecture, not twitch maintenance.

### REWARD PHASE
When all heroes are dead or escaped:

- Add kill bounty.
- Add wave-clear bonus.
- Refill / reset trap state.
- Refresh shop.
- On milestone waves, present a three-choice upgrade.
- Return to build phase.

---

## 7. Arena layout

### 7.1 Logical resolution
Use a 384×216 internal canvas and scale with CSS using `image-rendering: pixelated`.

This is not a literal SNES output mode, but it produces an authentic low-resolution 16-bit presentation while fitting modern 16:9 screens.

### 7.2 Tile grid
- Base grid: 16×16.
- Small sprites: 8–12 px wide.
- Large traps: 16–32 px.
- HUD occupies roughly 24 px at the top and 40 px at the bottom.

### 7.3 Arena shape
For the first level:

- Entrance at far left.
- Castle core at far right.
- Broken ground with two or three pits.
- A few raised platforms.
- Enough open air for launch / knockback combos.

Future arenas should not simply be reskins. Each should constrain placement differently.

Examples:

- **Keep Gate:** broad flat floor, beginner-friendly.
- **Foundry:** moving belts and lava channels.
- **Bell Tower:** vertical platforms and falling hazards.
- **Aqueduct:** narrow bridges over lethal drops.
- **Catacombs:** multiple entry lanes.

---

## 8. Hero simulation

Heroes should appear intelligent enough to be entertaining, but simple enough to run in large numbers.

### 8.1 Baseline behavior
Each hero:

1. Moves toward the right.
2. Detects a nearby gap or obstacle.
3. Makes a jump decision based on archetype skill and a small random error.
4. Uses ordinary gravity and collision.
5. Can be launched or pushed by traps.
6. Dies when HP reaches zero or when falling out of the arena.
7. Damages the castle when reaching the exit.

No global A* pathfinding is required for the MVP.

### 8.2 Imperfect navigation
The important trick is that a hero should make one noisy decision per hazard rather than rerolling every frame. Otherwise every hero eventually succeeds.

Suggested model:

- Detect threat 8–14 px ahead.
- On first detection, roll against jump skill.
- If successful, jump with archetype-specific power and timing noise.
- If unsuccessful, commit to the mistake until that hazard is passed or the hero dies.

### 8.3 Archetypes

| Hero | First wave | HP | Speed | Jump skill | Special |
|---|---:|---:|---:|---:|---|
| Recruit | 1 | 1 | Medium | 72% | Baseline |
| Rogue | 3 | 1 | Very fast | 82% | Harder for slow traps to catch |
| Knight | 4 | 3 | Slow | 58% | Survives light traps |
| Acrobat | 5 | 1 | Medium | 97% | High jump; ignores simple pit setups |
| Ballooner | 6 | 1 | Medium | N/A | Flies; bypasses floor traps |
| Sapper | 8 | 2 | Medium | 70% | Temporarily disables first trap hit |
| Champion | 10 | 10+ | Slow | 90% | Boss; resistant to repeated same damage type |

The MVP prototype implements a smaller subset.

---

## 9. Trap catalog

### MVP traps

#### BLOCK — 4g
A solid 16×16 brick tile.

Purpose:
- Route shaping.
- Creating jump checks.
- Building launch ramps / upper routes.

#### FLOOR SPIKES — 6g
Low-cost contact damage.

Purpose:
- Punish bad jump timing.
- Finish damaged heroes.

Weakness:
- Poor against armored enemies.
- Useless against flying enemies.

#### SPRING — 7g
Launches heroes upward and slightly forward.

Purpose:
- Combo engine.
- Can accidentally help heroes if placed badly.

#### REVERSE CONVEYOR — 6g
Pushes heroes left while they stand on it.

Purpose:
- Increase trap dwell time.
- Feed enemies back into saws or crushers.

#### SAW — 10g
High repeated contact damage.

Purpose:
- Strong against armored units.
- Expensive, short range.

#### CANNON — 16g
Automatically fires at heroes in a horizontal radius.

Purpose:
- Reliable ranged damage.
- Essential response to flying units.

#### CRUSHER — 14g
Suspended trap that slams downward when a hero passes under it.

Purpose:
- Area burst damage.
- Strong with slow / conveyor setups.

### Later traps

- Pendulum blade.
- Fire jet.
- Ice tile.
- Rotating hammer.
- Fake floor.
- Teleporter pair.
- Boulder chute.
- Fan / wind tunnel.
- Tar puddle.
- Bomb barrel.
- Guillotine gate.
- Mimic treasure.
- Lightning coil.
- Portal cannon.

---

## 10. Synergy system

Synergies should be discoverable through behavior, not hard-coded recipe popups.

Examples:

- **Spring + spikes overhead:** launch heroes into ceiling damage.
- **Reverse conveyor + saw:** hold enemies in sustained damage.
- **Block + pit:** force a late jump at the edge.
- **Spring + cannon:** expose launched heroes to ranged fire longer.
- **Crusher + reverse conveyor:** increase the chance a second slam lands.
- **Ice + hammer:** slide heroes into a knockback trap.

Later, a combo label can appear when two different traps damage the same hero within 0.75 seconds.

---

## 11. Economy

### 11.1 Starting values
- Gold: 30.
- Castle integrity: 10.
- Wave clear bonus: 10 + 2 × wave.
- Kill bounty: 1 gold for most heroes; 2–5 for special units.
- Sell value: 60% of purchase price.

### 11.2 Shop
At the beginning of each build phase:

- Block and spikes are guaranteed.
- 2–3 additional trap cards are rolled from the unlocked pool.
- Once flying heroes enter the pool, at least one anti-air option is guaranteed.

This preserves adaptation without letting shop RNG make a run unwinnable.

### 11.3 Economy design objective
A player should usually be able to buy one meaningful trap per wave, but not every trap they want.

Gold should create tradeoffs between:

- Improving a working kill box.
- Covering a new hero type.
- Rebuilding a flawed section.
- Saving for an expensive trap.

---

## 12. Upgrades and roguelite progression

Every three waves, present three upgrade choices and let the player choose one.

Example upgrades:

- **Barbed Teeth:** spikes deal +1 damage.
- **Hair Trigger:** cannon reload time −25%.
- **Overcranked Springs:** springs launch 25% higher.
- **Industrial Belt:** reverse conveyors push 30% harder.
- **Salvager:** sell refund rises from 60% to 80%.
- **Bounty Board:** elite heroes award +2 gold.
- **Reinforced Core:** +2 maximum castle integrity and heal 2.
- **Cheap Masonry:** blocks cost 1 less.
- **Chain Reaction:** a trap kill briefly speeds nearby trap cooldowns.
- **Bad Landing:** airborne heroes take bonus saw / spike damage after landing.

Avoid permanent stat grinding in the first version. Runs should be won by architecture and adaptation, not meta progression.

---

## 13. Difficulty curve

### Waves 1–2: Teach
Mostly recruits. The level's natural pits can kill some heroes, demonstrating imperfect jump timing.

### Waves 3–5: Break simple setups
Introduce rogues, knights, and acrobats.

### Waves 6–8: Force coverage
Introduce flying and trap-disabling enemies. The player must diversify.

### Wave 9: Stress test
Large mixed swarm.

### Wave 10: Boss
A champion plus supporting units. The boss should not merely be a huge HP sponge; it should resist repeated identical damage, encouraging multiple trap categories.

### Endless
Increase:

- Spawn count.
- Special-unit probability.
- Hero HP slowly.
- Movement variance.

Do **not** only increase HP. That creates boring stat inflation.

---

## 14. Visual direction

### 14.1 Style
- SNES-era fantasy-industrial pixel art.
- 16×16 environment tiles.
- 8×12-ish hero sprites.
- Four-frame run cycles in the production version.
- Strong silhouettes and exaggerated trap motion.
- Minimal antialiasing.

### 14.2 Palette
Suggested 20–28-color working palette:

- Night sky: deep indigo, violet, dusty blue.
- Castle: charcoal, slate, cool gray.
- Ground: burnt orange, brown, ochre.
- Hazards: cream, bone, red-orange.
- Magic / UI accents: cyan and warm gold.

### 14.3 Presentation
- Nearest-neighbor scaling only.
- Optional CRT / scanline filter, disabled by default.
- Screen shake only for crushers, boss hits, and castle damage.
- Tiny 1–3 px particles rather than smooth modern effects.

### 14.4 Hero tone
Keep the tiny heroes visually simple and slightly anonymous. The comedy comes from the swarm behaving like a determined stream of platformer protagonists, not from gore.

---

## 15. Audio direction

### MVP
Synthesized WebAudio SFX are sufficient:

- Place.
- Sell.
- Spike hit.
- Cannon shot.
- Crusher impact.
- Hero defeat.
- Castle hit.
- Wave start / clear.

### Later
- 16-bit percussion loop during build.
- Faster arrangement during waves.
- Trap-combo stingers.
- Boss layer at wave 10.

Music must have independent volume and mute controls.

---

## 16. Controls

### Desktop
- Mouse: select and place traps.
- Right-click: sell placed trap during build.
- 1–5: select current shop cards.
- Space: release next wave.
- P: pause / resume wave.
- R: restart after game over.

### Mobile later
- Tap trap card.
- Tap tile to place.
- Long press placed trap to sell.
- Large “Release” button.
- No hover-only information.

---

## 17. UX requirements

The player should always know:

- Current wave.
- Gold.
- Castle integrity.
- Build vs. wave phase.
- Selected trap and cost.
- Whether the hovered tile is valid.
- Why a trap cannot be placed.
- Which enemies are entering this wave by wave 3+.

The first screen should not resemble a title menu if the game has already begun. Use a clear “BUILD PHASE” banner and an obvious “RELEASE” button.

---

## 18. Technical architecture

### MVP stack
- Plain HTML5.
- One `<canvas>` element.
- Vanilla JavaScript.
- No dependency or build step.
- WebAudio for procedural SFX.
- `localStorage` for options and best wave later.

This makes the prototype easy to open, host on GitHub Pages / Netlify, and hand to coding agents.

### Production recommendation
If scope grows substantially, move to **Phaser 3** while preserving deterministic game-state logic separately from rendering.

Suggested module split:

```text
src/
  game.js
  config.js
  state/
    RunState.js
  systems/
    HeroSystem.js
    PhysicsSystem.js
    TrapSystem.js
    WaveSystem.js
    EconomySystem.js
    UpgradeSystem.js
  entities/
    Hero.js
    Trap.js
    Projectile.js
  render/
    Renderer.js
    PixelArt.js
    UI.js
  audio/
    Audio.js
```

### Performance rules
- Fixed logical canvas resolution.
- Object pools for heroes, projectiles, and particles once counts grow.
- Broad-phase spatial bins if trap / hero count exceeds a few hundred.
- Avoid per-hero pathfinding.
- Cap expensive particles.
- Keep collision shapes axis-aligned in the MVP.

Target: stable 60 fps with 150 simultaneous heroes on an ordinary laptop; stretch target 300.

---

## 19. Data model

### Trap definition

```js
{
  id: "saw",
  name: "Saw",
  cost: 10,
  category: "contact",
  size: [16, 16],
  requiresSupport: true,
  damage: 2,
  cooldown: 0.18
}
```

### Hero definition

```js
{
  id: "knight",
  hp: 3,
  speed: 19,
  jumpSkill: 0.58,
  jumpPower: 68,
  flying: false,
  bounty: 2
}
```

### Run state

```js
{
  wave: 6,
  gold: 31,
  castleHp: 7,
  traps: [],
  upgrades: [],
  totalKills: 143,
  score: 0
}
```

---

## 20. MVP scope

The attached prototype should demonstrate:

- Browser launch with no build tooling.
- Pixelated 384×216 canvas.
- Build and wave phases.
- Grid placement.
- Selling traps.
- Gold economy.
- Seven trap / block types.
- Several hero archetypes.
- Imperfect jump decisions.
- Basic platform collision.
- Pits.
- Cannon projectiles.
- Crusher cooldown / slam.
- Wave scaling.
- Castle integrity and game over.
- Procedural pixel visuals.
- Basic synthesized SFX.

It does **not** need:

- Full animation sheets.
- Meta progression.
- Save / load.
- Multiple arenas.
- Full upgrade draft.
- Controller support.
- Mobile-specific UI.
- Hundreds of simultaneous heroes.

---

## 21. Prototype acceptance criteria

The prototype is successful if a fresh player can:

1. Understand within 30 seconds that they are building the hazard course.
2. Place at least two traps without instructions.
3. Start a wave and immediately see the consequences of placement.
4. Discover at least one two-trap interaction in the first five waves.
5. Sell and rebuild a bad choice.
6. Encounter a hero type that invalidates a previously dominant strategy.
7. Want to try one more wave after a failure.

---

## 22. Milestone plan

### Milestone 0 — Playable toy
**1–2 coding sessions**

- One arena.
- 5–7 traps.
- 4 hero types.
- Build/wave loop.
- Basic economy.

### Milestone 1 — “Actually fun” vertical slice
**3–7 sessions**

- Upgrade draft every 3 waves.
- Better hero animation.
- More satisfying hit feedback.
- 10-wave authored difficulty curve.
- Champion boss.
- Better placement preview.
- Wave preview icons.

### Milestone 2 — Replayable browser game

- Three arenas.
- 12–16 traps.
- 7–8 hero types.
- Daily seeded challenge.
- Local high score.
- 2× / 4× simulation speed.
- Sound / music settings.
- Mobile layout.

### Milestone 3 — Expand only if retention supports it

- Unlockable trap pool.
- Mutators.
- Endless leaderboard.
- Shareable level seeds.
- Community challenge codes.

---

## 23. Important product restraint

Do not turn this into a full platformer editor, colony sim, or action game.

The enjoyable fantasy is very specific:

> “I built a nasty little machine, released a crowd into it, and watched the machine either work brilliantly or fail in a hilarious way.”

Every feature should strengthen that sentence.

---

## 24. Next implementation priorities after the attached prototype

1. Add the three-choice upgrade draft every third wave.
2. Make springs and knockback more physical so trap chains become the star.
3. Add an anti-trap Sapper and a Champion boss to force adaptation.
4. Add a second map with two entrance heights to eliminate one-bottleneck dominance.
5. Add simple four-frame hero animation and 2-frame trap animation.
6. Add a compact wave-preview strip.
7. Add localStorage high score and daily seed.

