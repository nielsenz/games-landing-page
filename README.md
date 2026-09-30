# Zach Nielsen Games

Static arcade at https://games.zacharynielsen.com/ with ten playable games: Night Relay, Boostball 16, Roofline, Pocket Behemoth, Crumb Command, Riverward Exchange, Dreadworks, Pinecone Pass, Blackwater, and Idle Farm.

## Develop and check

```sh
npm ci
npm run sync
npm test
python3 -m http.server 8000 --directory public
```

Open http://localhost:8000/. Node 22 or newer runs the checks; GitHub and Netlify use Node 24. Games run without an npm install in the browser. `jsdom` is a development-only dependency for testing controls and saved state.

`npm test` covers static links/assets, script syntax, catalog hashes, the six standalone game simulations, Dreadworks campaigns and controls, Idle Farm persistence, and onboarding DOM flows. Canvas and WebGL are mocked or excluded in automated tests; rendering and gameplay feel need browser checks.

## Source ownership

| Game | Maintained source | Served build |
| --- | --- | --- |
| Dreadworks | `projects/dreadworks/index.html`, adjacent tests and balance tools | `public/dreadworks/play.html` |
| Idle Farm | `projects/idle-farm/`, including tests and `vendor/` | `public/idle-farm/play.html` and `vendor/` |
| Blackwater | Sibling `../pirates-redo/` repository | `public/blackwater/play.html` and `assets/` |
| Pinecone Pass | Sibling `../pinecone-pass/pinecone-pass-prototype/` repository | `public/pinecone-pass/play.html` |
| Other six games | `public/<game>/play.html` | Same file |

The sibling `hostile-architect/` and `farm-idle/` folders are historical copies. Make new changes to the versioned sources here. `projects/<game>/` also contains design documents; `projects/catalog.json` records routes and the current served HTML hashes.

Run `npm run sync` after editing games. It copies maintained Dreadworks and Idle Farm sources into `public/` and updates catalog hashes. It needs no sibling directories.

To import external updates, first run `npm run check` in Blackwater and `node build.cjs` in Pinecone Pass, then run `npm run sync -- --from-siblings` here. Blackwater's old hashed assets are retained; its entry point references the current build. `projects/blackwater/index.html` is an original reference, not the served game.

## Deployment

Netlify project: `zach-nielsen-games` (`089cb42d-8d90-4914-8237-fa020683b347`). It follows GitHub `main`, runs `npm test`, and publishes `public/`. A failing check stops the new build from being published. This is a separate project from zacharynielsen.com.

GitHub Actions also runs the suite for each push and pull request. Its workflow uses pinned official checkout/setup-node actions. Tests use no deployment credentials.

After a successful deployment, run `npm run check:live`. It checks every game wrapper and play file against the local checkout, including linked Blackwater bundles and Idle Farm's renderer. HTML comparisons normalize Netlify's equivalent pretty-URL anchor rewrites; asset comparisons are byte-for-byte. An alternate origin can be passed as `npm run check:live -- https://example.netlify.app`.

## Review notes

`REVIEW.md` records the initial review. `FOLLOWUP.md` records the source migration, onboarding changes, verification, and remaining phone playtest. No Thronefall build was available.
