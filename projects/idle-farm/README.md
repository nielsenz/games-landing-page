# Idle Farm

An incremental farm with manual harvesting, four producer types, fertilizer, auto-selling, and prestige. Harvest grain, sell it for coins, then buy production. A new season resets the farm in exchange for a lasting production multiplier.

Open `index.html` in a modern browser, or run `python3 -m http.server 8080` in this directory. Keep `vendor/` beside the HTML: it contains Three.js 0.160.0 and its license. No network connection or build step is required. The renderer needs WebGL.

## Saves

Progress autosaves every ten seconds and when you leave the page. Hidden-tab production is settled before each save, so reloading a background tab preserves those earnings. Saves use `idle_farm_save_v2`; older `idle_farm_save_v1` saves migrate when no v2 save exists.

Use the Data controls to export, import, or reset progress. Imports validate numbers and fill missing fields before replacing the current farm. If browser storage is blocked, play continues and a toast asks you to export before closing.

## Checks

Run `node --test tests/save.test.cjs`. These regression tests cover hidden-tab saves, offline earnings, invalid imports, blocked storage, legacy migration, and future timestamps. Safari rendering and manual harvesting were checked during the September 2026 review; automated tests do not exercise WebGL.

## Maintained copy and first-field guide

This directory is now the maintained source in the arcade repository. The old sibling `farm-idle/` folder is historical. Run `npm run sync` from the repository root to update the public game and its vendor assets.

New farms get a first-field guide: harvest 15 grain, sell it, and buy one field. The guided buy always purchases exactly one field, even if the bulk selector is set to x10. The guide disappears once any producer is owned or prestige has been earned. Existing saves use the same storage keys. The guide's complete DOM flow and reload behavior are checked by the arcade's onboarding suite.
