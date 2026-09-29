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
