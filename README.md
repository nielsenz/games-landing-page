# Zach Nielsen Games

Standalone static arcade for https://games.zacharynielsen.com/.

## Netlify setup

Connect this repository to a new Netlify site, use branch `main`, leave the build command empty, and publish `public`. The included `netlify.toml` sets that publish directory. Assign `games.zacharynielsen.com` to that new site and follow Netlify's DNS instructions for the subdomain.

This project does not require changes to the existing zacharynielsen.com website. Hosting and domain setup are left to the owner.

## Contents

- `public/index.html`: responsive square game grid.
- `public/<game>/index.html`: game wrapper with All games and full-screen controls.
- `public/<game>/play.html`: original self-contained playable build.
- `projects/<game>/`: available project documents.
- `projects/catalog.json`: build inventory, routes, and original game hashes.

Eight playable games: Night Relay v0.2, Boostball 16 v0.2, Roofline, Pocket Behemoth, Crumb Command, Riverward Exchange, Dreadworks, and Pinecone Pass.

Blackwater has a non-clickable Build needed tile because its uploaded HTML references missing JavaScript and CSS assets. Supply its complete build before enabling it. No Thronefall build was available.

No installation or build step is required. For local preview, run `python3 -m http.server 8000 --directory public`, then open http://localhost:8000/.

## Checks

Verified local gallery and wrapper links and the original game file hashes. A full gameplay test has not been performed.
