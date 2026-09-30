# Arcade follow-up — September 2026

## Changes

- Dreadworks and Idle Farm now have maintained source, tests, and supporting files in this repository. Idle Farm's Three.js library and MIT license are included. Old sibling folders are historical copies.
- Idle Farm is the tenth arcade game. Its first-field guide follows actual grain/coin balances through harvest, sell, and buy, and stays hidden for established farms. Guided purchase buys one field regardless of bulk-buy mode.
- Dreadworks has a toggleable tap-to-sell mode, refund preview, keyboard shortcut, and automatic exit when choosing a card or starting a wave. Desktop right-click selling remains available.
- Crumb Command has an optional guide that progresses through selecting bugs, issuing an order, capturing the Cracker, and recruiting a unit. It highlights the target, allows skipping, and remembers completion locally. It does not change combat/economy rules or pause the rival.
- Pocket Behemoth's Escape key only pauses. Previously, exiting fullscreen with Escape could also resume a paused hunt. P and the Resume button still toggle/resume normally. Combat balance is unchanged.
- Night Relay and Roofline's game files are unchanged, as requested.
- GitHub Actions runs tests on pushes and pull requests. Netlify runs the same suite before publishing. Normal source synchronization and tests work without sibling checkouts.
- `npm run check:live` compares deployed game HTML and linked bundles/vendor files with the checkout.

## Verification

Automated coverage includes both Dreadworks campaigns, touch selling and refund behavior, the entire Crumb Command guide, skipping, help/focus pause, guide persistence, Pocket Behemoth pause controls, and Idle Farm's actual harvest/sell/buy DOM flow and save reload. Rendering is mocked or excluded in these tests.

On the previously published build, Safari loaded Pocket Behemoth, started practice mode, accepted dodge/heavy input, displayed the marked tail-sweep danger zone and wall-crash opening, and entered/exited fullscreen. These checks exposed the Escape/resume issue above. The previous deployed commit was confirmed through Netlify's published-deploy record.

Phone verification remains incomplete: Safari computer-use automation failed with `native pipe startup failed` while entering Responsive Design Mode, and reconnecting did not restore it. No physical phone session was available. This also prevented visual checks of the new onboarding layouts. Before changing balance, play Pocket Behemoth on a phone and confirm that the danger zones, dodge control, and horn opening remain readable.

## Remaining manual pass

Use a fresh/private session to avoid altering an existing save. Open each game, test the wrapper's fullscreen and Open game controls, and check pause after switching away. For Idle Farm, buy the first field and reload; for Pinecone Pass, finish a day and reload its recap. On a phone, check Dreadworks selling and the Crumb Command guide in portrait and landscape. Night Relay and Roofline need no balance changes based on the owner's feedback.
