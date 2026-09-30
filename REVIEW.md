# Games review — September 29, 2026

Reviewed all nine arcade games and the separate Base Capture and Idle Farm projects. The changes below are local. Existing Blackwater work was preserved; its build, lint, and tests passed without source edits in this review.

## Fixed

| Game | Finding and change |
| --- | --- |
| Idle Farm | The Three.js CDN URL returned 404, preventing startup. Bundled the matching library and license locally. |
| Idle Farm | Autosaving while hidden advanced the save timestamp without recording production. Hidden earnings now settle before saving, preventing loss on reload. |
| Idle Farm | Imports accepted malformed numeric state, and blocked storage could interrupt actions. Imports now validate before replacing state; failed writes warn without stopping play. Added v1 migration and disposal of expired particle/building GPU resources. |
| Dreadworks | The arcade served an older build, missing the current two-level campaign and balance fixes. Synced the maintained source. |
| Dreadworks | Waves continued after focus loss, and holding P toggled pause repeatedly. Added automatic pause, repeat-key protection, a visible pause/resume button, and canvas focus/label support. Fixed a Safari click issue caused by replacing the button label every frame. |
| Pinecone Pass | The arcade copy differed from the current standalone source. Rebuilt and synced it after the seven-day progression/save suite passed. |
| Crumb Command | Changing browser tabs paused play, but moving focus outside the game did not. Both now pause, cancel selection drags, and keep help-dialog dismissal from resuming accidentally. Lost pointer capture also clears a drag. |
| Riverward Exchange | A null market in a malformed save threw inside validation. Validation now rejects it normally. |
| Arcade | Sibling games required manual copying, which allowed served builds to fall behind. Added a sync script and checks for catalog hashes, script syntax, and static local links/assets. |

## Per-game assessment

| Game | Evidence from this review | Worth considering next |
| --- | --- | --- |
| Night Relay | Both missions reach victory with enemy spawning disabled; mission state remains finite. Reviewed touch release, key release, focus pause, and preference recovery. | Playtest combat difficulty and aiming on a physical phone before changing weapon balance. |
| Boostball 16 | Extended AI simulation keeps physics finite and boost within limits. Reviewed pause, pointer cancellation, and settings persistence. | Compare rookie/club/pro match outcomes and local two-player control comfort with players. |
| Roofline | Timed runs finish; free riding and timed state remain finite. Reviewed combo banking, input release, saved records, and pause handling. | First-time-player testing of grind timing and combo banking would be more useful than adding more tricks immediately. |
| Pocket Behemoth | An undefended hunt reaches defeat; reset restores health. Reviewed touch capture cleanup, pause, and stored settings. | Check whether new players distinguish the boss's attack tells before tuning damage. |
| Crumb Command | Pause freezes the simulation; a full match resolves with valid numeric state. Reviewed selection, orders, help, and pointer handling. | A short guided first capture could help players learn select → command → recruit. |
| Riverward Exchange | A simulated year survives daily save round trips with valid accounting state. Reviewed save validation and day advancement. | Observe whether players understand freight reservations and cash versus inventory value. |
| Dreadworks | Campaign, trap, economy, terrain, victory/endless, and input regressions pass. Safari renders the updated campaign and its pause button responds. | Add a touch-friendly sell mode; selling still depends on right-click. Run saves between waves would be a separate feature. |
| Pinecone Pass | All daily challenges are reachable; seven-day progression, upgrade choices, recap recovery, reset confirmation, and skip behavior pass. | Playtest whether forecasts reveal too much or help players learn; keep the existing deterministic checks when tuning rewards. |
| Blackwater | Build and lint pass, plus 162 tests covering simulation, navigation, saves, planning, geography, and UI lifecycle. Built assets match the arcade entry. | Manual longer voyages remain useful for map readability and pacing; headless simulation does not establish either. |
| Base Capture | All 13 tests pass, including generated-map symmetry/spacing, reserves, group orders, last-army recapture, timing, and defensive AI. Build passes. | A tutorial map would give new players a safer place to learn persistent routes and garrison reserves. |
| Idle Farm | Four save regressions pass. Safari renders the farm and harvesting increases grain. | The opening farm is visually empty; an initial goal such as “Harvest and sell 15 grain for your first field” would make the first minute clearer. |

These follow-ups are design suggestions, not confirmed defects. No balance changes were made to the six games maintained directly in the arcade.

## Verification limits

The automated checks cover game logic, persistence, source/build consistency, and static assets. Safari checks covered the gallery, Idle Farm rendering/harvesting, and Dreadworks rendering/pause. This was not a full manual playthrough of every game, and phone layouts, audio, and accessibility need dedicated playtesting. The pure simulation tests do not render canvas output.

## Commands

- Arcade: `node --test tests/arcade.test.cjs`
- Blackwater: `npm run check` in `../pirates-redo`
- Base Capture: `npm test && npm run build` in `../base-capture`
- Pinecone Pass: `node --test tests/game.test.cjs && node build.cjs` in `../pinecone-pass/pinecone-pass-prototype`
- Dreadworks: `node --test qc.test.cjs input.test.cjs` in `../hostile-architect`
- Idle Farm: `node --test tests/save.test.cjs` in `../farm-idle`
- Refresh arcade copies after source builds: `node scripts/sync-games.cjs`
