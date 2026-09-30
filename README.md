# Zach Nielsen Games

Standalone static arcade for https://games.zacharynielsen.com/.

## Netlify setup

Production: https://games.zacharynielsen.com/

Netlify project: `zach-nielsen-games` (`089cb42d-8d90-4914-8237-fa020683b347`). The site uses branch `main`, an empty build command, and publish directory `public`, as set in `netlify.toml`. The custom subdomain uses Netlify DNS.

To link another checkout, run `netlify link --id 089cb42d-8d90-4914-8237-fa020683b347`. For a direct production deployment, run `netlify deploy --prod --dir public`.

The arcade is a separate Netlify project from the existing zacharynielsen.com website.

## Contents

- `public/index.html`: responsive square game grid.
- `public/<game>/index.html`: game wrapper with All games and full-screen controls.
- `public/<game>/play.html`: playable build (Blackwater also uses its adjacent `assets/` directory).
- `projects/<game>/`: available project documents.
- `projects/catalog.json`: build inventory, routes, and current served HTML hashes.

Nine playable games: Night Relay v0.2, Boostball 16 v0.2, Roofline, Pocket Behemoth, Crumb Command, Riverward Exchange, Dreadworks, Pinecone Pass, and Blackwater.

Blackwater is the game developed in the sibling `../pirates-redo/` repository. Its complete production build is included at `public/blackwater/`, with the arcade wrapper at `index.html` and the game entry at `play.html`. To update it, run `npm run build` in `../pirates-redo`, copy `dist/index.html` to `public/blackwater/play.html`, and copy the complete `dist/assets/` directory to `public/blackwater/assets/`. Update its HTML SHA-256 in `projects/catalog.json` after replacing the build. The HTML in `projects/blackwater/` is the original supplied reference, not the served game. No Thronefall build was available.

No installation or build step is required. For local preview, run `python3 -m http.server 8000 --directory public`, then open http://localhost:8000/.

## Updating sibling games

Build Pinecone Pass with `node build.cjs` in its source directory and Blackwater with `npm run check` in `../pirates-redo`. Dreadworks is already standalone HTML. Then run `node scripts/sync-games.cjs` here to copy all three into the arcade and refresh every catalog HTML hash. This does not deploy. The sibling directories must be present; the script checks its inputs before copying.

The other six games are maintained directly in `public/<game>/play.html`. Run the sync script after editing them too, so their catalog hashes stay current. Blackwater's old hashed assets are retained; its entry point references the current build.

## Checks

Run `node --test tests/arcade.test.cjs`. It checks every catalog entry's scripts, static local links/assets, and HTML hash, plus simulation regressions for Night Relay, Boostball, Roofline, Pocket Behemoth, Crumb Command, and Riverward Exchange. Source projects have their own suites for the remaining games.

See `REVIEW.md` for the September 2026 findings, changes, and test limits. These checks do not replace browser playtesting.
