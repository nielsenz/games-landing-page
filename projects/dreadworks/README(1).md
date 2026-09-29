# Dreadworks browser prototype

A dependency-free browser prototype for a compact SNES-style reverse-platformer / trap-defense game inspired by the core idea of *Hostile Architect*.

## Run it

The game is a single file.

### Simplest
Open `index.html` in a modern desktop browser.

### Better local dev workflow
From this folder run:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- **Mouse / pointer:** select a shop card and place traps.
- **Right click:** sell a placed trap for 60% during build phase.
- **1–5:** select a visible shop card.
- **Space:** release the wave.
- **P:** pause / resume during the wave.
- **R:** restart after game over.

## Prototype systems

- Build phase separated from wave phase.
- Grid snapping and placement preview.
- Randomized shop with guaranteed basics.
- Seven placeables: block, spikes, spring, reverse conveyor, saw, cannon, crusher.
- Recruits, rogues, knights, acrobats, and ballooners.
- Imperfect hero jump decisions rather than full pathfinding.
- Pits, static platforms, collision, projectiles, trap cooldowns, particles, and WebAudio SFX.
- Automatic trap reset between waves; no repair chores.

## Recommended next changes

1. Upgrade draft every 3 waves.
2. Better sprite animation and authored pixel assets.
3. Second map with multiple entrances.
4. Sapper and boss archetypes.
5. 2× / 4× sim speed.
6. Wave preview strip.
7. Local high score + daily seed.

The full product direction is in `Dreadworks_PRD.md`.
