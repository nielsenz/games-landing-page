# Working on the arcade

- Run `papercut -m <model> "what happened"` when you encounter friction. Use the CLI to append; do not hand-edit the journals.
- Dreadworks is maintained in `projects/dreadworks/index.html`, with its harness and regression tests beside it.
- Idle Farm is maintained in `projects/idle-farm/`, including its vendored Three.js library/license and save tests.
- The copies in sibling `hostile-architect/` and `farm-idle/` directories are historical. Do not import them over the maintained sources.
- The six original standalone games are maintained in `public/<slug>/play.html`. Blackwater and Pinecone Pass retain separate sibling source projects.
- After edits, run `npm run sync` to update Dreadworks/Idle Farm's public copies and all catalog hashes. Use `npm run sync -- --from-siblings` only when deliberately importing rebuilt Blackwater/Pinecone Pass artifacts.
- `npm ci && npm test` works from a fresh checkout. It checks the arcade, Dreadworks, Idle Farm saves, and DOM onboarding behavior. Canvas/WebGL rendering is not established by these tests.
- GitHub runs the tests on pushes and pull requests. Netlify runs the same tests before publishing. Do not bypass the build with a direct unchecked production upload.
- After deployment, run `npm run check:live` to compare published files with the checkout. Use browser playtesting separately for layout, input feel, and fullscreen.
- Roofline's gameplay was accepted by the owner in September 2026; do not rebalance it without a new request.
- Night Relay was rebalanced in October 2026 at the owner's request: spread multi-squad waves, a random seed per run, crew radio and debriefs, and mission 3 (Dead Air) with tanks. It awaits the owner's playtest. The GBC cartridge in `../gbc/night-relay` still uses the older two-mission balance.
