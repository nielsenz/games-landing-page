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
- `projects/catalog.json`: build inventory, routes, and original game hashes.

Nine playable games: Night Relay v0.2, Boostball 16 v0.2, Roofline, Pocket Behemoth, Crumb Command, Riverward Exchange, Dreadworks, Pinecone Pass, and Blackwater.

Blackwater is the game developed in the sibling `../pirates-redo/` repository. Its complete production build is included at `public/blackwater/`, with the arcade wrapper at `index.html` and the game entry at `play.html`. To update it, run `npm run build` in `../pirates-redo`, copy `dist/index.html` to `public/blackwater/play.html`, and copy the complete `dist/assets/` directory to `public/blackwater/assets/`. Update its HTML SHA-256 in `projects/catalog.json` after replacing the build. The HTML in `projects/blackwater/` is the original supplied reference, not the served game. No Thronefall build was available.

No installation or build step is required. For local preview, run `python3 -m http.server 8000 --directory public`, then open http://localhost:8000/.

## Checks

Verified local gallery and wrapper links and the original game file hashes. A full gameplay test has not been performed.
