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
