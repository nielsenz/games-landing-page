# Papercuts

Small frictions logged in the moment — dead-end tool calls, misleading errors,
undocumented setup steps, flaky commands. Not blocking on their own; together
they show where this repo needs sanding down. Append-only, newest at the bottom.

2026-09-29T05:03:27.796Z - gpt-6-astra - znielsen

The games workspace is a parent folder, not a Git repository; git status fails there and papercut falls back to the sandbox-blocked global log. Run repository commands inside an individual game or landing-page checkout.

2026-09-29T05:03:27.830Z - gpt-6-astra - znielsen

Cloning games-landing-page initially failed with Could not resolve host inside the sandbox; retrying with approved network access succeeded.

2026-09-29T05:06:40.664Z - gpt-6-astra - znielsen

The Netlify CLI is authenticated, but the freshly cloned landing-page repo has no linked Netlify project; netlify status exits with an error until a site is selected or created.

2026-09-29T05:06:52.483Z - gpt-6-astra - znielsen

netlify sites:list --json returns full deploy and site metadata, overflowing the output limit; filter to IDs, names, domains, and repository settings before displaying.

2026-09-29T05:07:01.090Z - gpt-6-astra - znielsen

Netlify does not expose listDnsZones as a CLI API method; discover the exact DNS operation names with netlify api --list before calling them.

2026-09-29T05:08:14.002Z - gpt-6-astra - znielsen

Requesting the TLS certificate immediately after attaching games.zacharynielsen.com returned an uninformative 422 Unprocessable Entity; check DNS propagation and certificate state before retrying.

2026-09-29T05:08:28.404Z - gpt-6-astra - znielsen

After Netlify created the games DNS record, dig resolved it but curl still reported Could not resolve host, consistent with a cached negative DNS result. Verify HTTPS against a resolved Netlify address while the local resolver refreshes.

2026-09-29T05:15:10.199Z - gpt-6-astra - znielsen

The custom domain resolves through authoritative, Google, Cloudflare, and default dig queries, while macOS system resolution still fails. dscacheutil -flushcache alone did not clear this negative lookup.

2026-09-29T23:46:07.565Z - gpt-6 - znielsen

Reviewing input and persistence across the arcade: ripgrep matched minified single-line CSS and truncated the useful JavaScript results. Limit matching line length or extract script sections for cross-game searches.

2026-09-29T23:50:59.636Z - gpt-6 - znielsen

Adding arcade asset checks: scanning raw HTML also matched src attributes inside JavaScript template strings (Riverward's generated icons). Strip inline scripts before checking static asset references.

2026-09-29T23:50:59.675Z - gpt-6 - znielsen

Adding cross-game simulation checks: Roofline uses mode time, not timed, and Night Relay exposes summary(), not snapshot(). Read each engine API before assuming shared test conventions.

2026-09-29T23:51:10.745Z - gpt-6 - znielsen

Correction to the prior test note: Roofline does accept timed. The smoke test assumed a 130-second completion window without using the game's configured scoreRunSeconds and overtime allowance.

2026-09-30T03:34:32.324Z - gpt-6 - znielsen

Live Pocket Behemoth check: Escape exits iframe fullscreen but also reaches the game's pause toggle, resuming a paused hunt during the transition. Pause on fullscreen changes so leaving fullscreen cannot restart combat.

2026-09-30T03:35:04.777Z - gpt-6 - znielsen

Trying Safari phone-layout checks: Command-Option-R reloads the page instead of entering Responsive Design Mode. Use the Develop menu's explicit Enter Responsive Design Mode item.

2026-09-30T03:35:24.157Z - gpt-6 - znielsen

Selecting Safari's Responsive Design Mode failed with 'native pipe startup failed' from computer-use automation. Refreshing app state before attempting any further UI actions.

2026-09-30T03:40:19.798Z - gpt-6 - znielsen

The live-file checker found Netlify rewrites HTML anchor hrefs from play.html to absolute extensionless paths, so a correct deployed wrapper has a different byte hash. Compare HTML after normalizing only equivalent same-origin anchor URLs; keep asset hashes exact.

2026-10-04T03:27:28.554Z - gpt-6 - znielsen

Inspecting Roofline for a GBC adaptation: the PRD references src/core.js and 37 standalone regression tests, but projects/roofline contains only the PRD. The maintained implementation is embedded in public/roofline/play.html; current coverage is the arcade smoke test.

2026-10-04T03:28:35.089Z - gpt-6 - znielsen

Preparing original GBC pixel assets: the default python3 has no Pillow installed. Use an isolated uv environment for asset generation and emulator test dependencies instead of relying on the system interpreter.

2026-10-04T03:29:43.544Z - gpt-6 - znielsen

GB Studio 4.3.2 engine inspection: core C files are under gbvm/src/core, and templates store scene/sprite data in split .gbsres resources rather than a single .gbsproj. Several older-looking source paths do not exist; enumerate files before adapting plugin examples.

2026-10-04T03:39:44.248Z - gpt-6 - znielsen

Building the GB Studio CLI with npm --ignore-scripts succeeds, but running it still imports Electron and fails if Electron has no installed binary. Point ELECTRON_OVERRIDE_DIST_PATH at the downloaded GB Studio app's Contents instead of downloading another Electron copy.

2026-10-04T03:40:26.139Z - gpt-6 - znielsen

Replacing GB Studio's Platformer controller compiled, but linking failed because the generated bootstrap initializes stock plat_* engine fields even when the controller is replaced. The adapter must retain those ABI globals (or replace the engine field schema), not only platform_init/update.

2026-10-04T03:41:48.005Z - gpt-6 - znielsen

Generating the replacement controller ABI: GB Studio's engine schema mixes field records with heading records that have no key, and platform states use a custom enum. Filter by optional key and preserve the one-byte state ABI rather than assuming every entry is a numeric field.

2026-10-04T03:43:54.755Z - gpt-6 - znielsen

The first headless PyBoy launch spends extra time initializing SDL/emulator modules before producing a screenshot. The process had yielded, so attempting to open the screenshot immediately failed; wait for the emulator process to finish first.

2026-10-04T03:44:40.121Z - gpt-6 - znielsen

First ROM screenshot showed the skater and camera at half their intended coordinates. GB Studio 4.3 GBVM uses 1/32-pixel actor positions; the skating controller intentionally uses 1/16, so the scene adapter must multiply positions by two.

2026-10-04T03:46:30.336Z - gpt-6 - znielsen

GB Studio sprite palettes are remapped through the OBP index configuration: putting green in palette color 0 made the skater's light pixels green rather than transparent. Transparency comes from the source image; use cream/coral/dark palette entries for visible sprite shades.

2026-10-04T03:47:59.825Z - gpt-6 - znielsen

ROM timing tests found only about 40 simulation updates per second despite native physics being cheap. Reformatting six-digit scores with repeated 32-bit division and redrawing the full HUD every four frames consumed the frame budget; switched to subtraction-based formatting and dirty tile updates.

2026-10-04T03:54:58.710Z - gpt-6 - znielsen

Starting the Roofline web emulator preview on localhost:8765 failed because another process already owns that port. Use a separate preview port instead of stopping an unrelated server.

2026-10-04T03:55:53.046Z - gpt-6 - znielsen

Checking the web emulator through computer use: the in-app browser is unavailable, and Safari interaction was rejected with 'Computer Use was not approved to use Safari'. Continue verification through the ROM emulator and the exported WebAssembly runtime without controlling Safari.

2026-10-04T03:57:53.678Z - gpt-6 - znielsen

Comparing GB Studio's ROM and web exports byte-for-byte failed even though they used the same source: separate builds embed different generated save/build signatures. Package the verified normal ROM into the exported web shell so the web preview runs exactly the tested cartridge bytes.

2026-10-04T03:58:24.242Z - gpt-6 - znielsen

Running GB Studio's exported binjgb WASM directly under Node requires the web shell's emulator.serialCallback bridge, even with no serial features in the game. Supply a no-op serial callback in the headless runtime test.

2026-10-04T04:05:29.958Z - gpt-6 - znielsen

The final whitespace check flagged trailing spaces in GB Studio's generated web template and JavaScript. Keep vendor exports unchanged and mark generated web files exempt from whitespace lint; source files still pass the normal diff check.

2026-10-04T04:05:59.978Z - gpt-6 - znielsen

Committing the new sibling GBC project succeeded, but Git reported that author/committer identity was inferred from the local username and hostname because no explicit identity is configured. No global Git settings were changed.

2026-10-04T04:08:51.437Z - gpt-6 - znielsen

Inspecting scene transitions for Roofline expansion: GBVM has no include/scene.h; scene loading is declared in data_manager.h and transitions are VM exceptions. Read the existing vm_scene implementation before wiring a controller-driven transition.

2026-10-04T04:18:55.149Z - gpt-6 - znielsen

The expanded Roofline ROM route test only watched transient bail-event bits and missed failures across emulator frame boundaries. Assert the persistent bail counter as well, and save the event trace on failure so route tuning cannot silently pass a reset loop.

2026-10-04T04:20:29.495Z - gpt-6 - znielsen

Roofline expansion testing found the first Garden transfer worked on lap one but failed with the slightly different carried speed on lap two. Bring the receiving rail eight pixels closer so the intended pop works across normal grind speeds, and keep multi-lap route coverage.

2026-10-04T04:43:45.739Z - gpt-6 - znielsen

Catalog inspection searched root index.html, but this arcade's entry page is public/index.html. README and projects/catalog.json identify the maintained layout.

2026-10-07T03:05:41.744Z - claude-opus-5-5 - znielsen

grep in this shell is aliased to ugrep, which rejects context regexes like '.{0,80}(a|b).{0,80}' with 'exceeds complexity limits'; use command grep or perl for context extraction from minified play.html files.
