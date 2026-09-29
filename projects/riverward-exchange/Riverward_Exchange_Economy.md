# Riverward Exchange — Economy Specification & Audit Notes

## Purpose

This is a **bounded open economy**, not a closed simulation of every household, workshop, wage, and coin. Stock, player inventory, cargo, dealer buying commitments, player cash, cost basis, and rival trading capital are explicit. Regional primary production/imports, household consumption, arriving visitor lots, fixed-price requests, and daily dealer allowances cross the modeled boundary.

The aim is causal, readable prices and defensible accounting. Do not imply that the prototype proves macroeconomic realism, competitive equilibrium, absence of every possible exploit, or optimal game balance.

## 1. State and clocks

All meaningful state lives in one serializable object. The RNG uses an integer state derived from the seed. Random draws occur on world creation or day progression, not rendering, price inspection, order previews, or negotiation attempts.

Player actions commit immediately. Autonomous production, consumption, rival decisions, and arrivals advance only when the day closes. The scene’s animation loop has no access to an economic clock.

A day close runs in this order:

1. Resolve that day’s outside production, workshops, and household demand using current stocks and active events.
2. Let the rival place one small profitable shipment, paying from its own cash and reserving destination buying demand.
3. At the close of day 14, capture the cash-based season report.
4. Increment the day, reset player freight use, and settle due player/rival shipments exactly once.
5. Refresh outside dealers’ daily buying allowances; expire past-deadline requests; create the day’s visitor and any new request; append indicative price history.

The order matters. Production and demand are not silently re-simulated after every player click. Trade previews and quote checks never advance the RNG.

## 2. Goods and regional parameters

| Good | Reference value | Space per unit | Riverward normal stock | Mossmere normal stock | Emberforge normal stock |
|---|---:|---:|---:|---:|---:|
| Grain | 10g | 1 | 40 | 60 | 30 |
| Timber | 16g | 2 | 28 | 46 | 30 |
| Iron | 26g | 2 | 26 | 20 | 38 |
| Cloth | 32g | 1 | 26 | 18 | 18 |
| Tea | 45g | 1 | 22 | 15 | 14 |
| Tools | 58g | 1 | 22 | 18 | 30 |

Normal stock is a scale for scarcity, not inventory that reappears daily. Initial stock creates a clear opening: Mossmere has abundant food/timber, Emberforge has abundant iron/tools, and Riverward has plentiful imported cloth/tea.

Base production/consumption flows per day, before price response, event modifiers, variation, and stock limits:

| Market | Grain | Timber | Iron | Cloth | Tea | Tools |
|---|---:|---:|---:|---:|---:|---:|
| Riverward production | 8 | 3 | 4 | 8 | 6 | 0 |
| Riverward household demand | 11 | 4 | 3 | 6 | 4 | 3 |
| Mossmere production | 17 | 12 | 2 | 3 | 2 | 0 |
| Mossmere household demand | 11 | 5 | 3 | 4 | 3 | 4 |
| Emberforge production | 4 | 4 | 13 | 3 | 1 | 0 |
| Emberforge household demand | 7 | 5 | 3 | 5 | 3 | 3 |

Tools are produced separately by workshops. Outside primary supply includes imports; it does not imply each location manufactures everything it supplies.

## 3. Price formation

For good `g`, market `m`, and stock level `S`, the indicative midpoint is:

```text
mid(S) = reference_value × clamp(exp(0.85 × (normal_stock − S) / normal_stock), 0.42, 2.5)
```

The normal stock level and reference value are design parameters. The lower/upper clamps are explicit stability boundaries. They are not claims about realistic price limits.

Every unit trades at a different point along this curve. For unit index `k = 0 .. quantity−1`:

```text
player-buy unit k:
  ceil(mid(physical_stock − k − 0.5) × 1.09)

player-sell unit k:
  max(1, floor(mid(physical_stock + committed_incoming_sales + k + 0.5) × 0.91))
```

The lot’s goods subtotal is the sum of these integer unit prices. Player purchases use physical stock because incoming cargo cannot be bought yet. Player sales include committed incoming cargo in the bid basis because those deliveries already satisfy some future dealer demand. Incoming stock is shown separately in the UI.

The 9% margins and integer rounding create a transaction spread. Buy-then-sell retraces the same stock interval at worse execution prices. Large lots move the quote against the player, and splitting a local lot into singles does not change its total cost. Remote splitting additionally incurs repeated fixed freight fees.

A hypothetical illustration: the next five units might sell for 30, 29, 28, 27, and 26g. That lot is worth 140g before freight, not the 150g implied by multiplying the first bid by five. This illustration explains the rule; the displayed game quotes come from the actual formula.

## 4. Physical production and demand

Primary producers scale their base output by `clamp(mid / reference_value, 0.55, 1.5)`. A small seeded variation is applied, then output is converted to integer goods. Higher prices encourage output but cannot create infinite stock in one day. Stock is never reset directly to its normal level.

Household demand scales by `clamp((mid / reference_value)^−0.5, 0.45, 1.5)`, with small seeded variation, then is capped by physical stock. Households consume goods and remove them from this modeled market. Their complete cash accounts are outside scope.

Each tool recipe consumes **one timber and one iron to create one tool**. Workshop capacities are three units in Riverward, one in Mossmere, and six in Emberforge. A workshop operates when the current tool midpoint covers timber midpoint + iron midpoint + a 7g notional processing hurdle. It is also limited by actual input units. The processing hurdle is a production decision parameter, not a player cash transaction or a fully modeled NPC wage account.

This is deliberately one visible production connection, not a whole factory game. Supplying inputs can enable output; withholding inputs can limit it. The player cannot compel a workshop to convert goods immediately or create free tools by issuing an order.

## 5. Liquidity, money, and the model boundary

Each regional dealer pool has a daily buying allowance: 1,000g in Riverward, 800g in Mossmere, and 1,200g in Emberforge. Its daily per-good buying quantity is `ceil(normal_stock × 0.8)`. Selling goods to the player adds proceeds to that day’s dealer pool; buying player or rival exports reserves allowance and order quantity immediately. Outside daily allowances refresh at the next dawn.

These pools are buying limits with external funding, not a conserved banking system. Once an export is accepted, its payment obligation is retained on that shipment and paid once at delivery. A refreshed daily allowance does not cancel an older commitment or permit the same committed cargo to be sold again.

Sources across the boundary include primary output/imports, visitors’ imported lots, household funding represented by the dealer pools, and funded town requests. Sinks include household/request consumption, freight charges, and capacity upgrades. Visitor sellers leave with unpurchased lots. Visitor buyers leave with purchased lots.

Player cash is integer and may not go negative. There is no borrowing, interest, tax, upkeep, or bankruptcy system in this version. Waiting creates no player income. A full economy accounting ledger for every NPC is explicitly out of scope.

## 6. Freight and inventory accounting

Riverward trades have no freight fee and settle now. A remote booking costs:

```text
freight = 2g per booking + unit_quantity × spaces_per_unit × route_rate
Mossmere route_rate = 1g; usual delivery = 1 day
Emberforge route_rate = 2g; usual delivery = 2 days
```

Player inbound and outbound bookings share 28 spaces per day, upgradeable to 40. Warehouse capacity is 40 spaces, upgradeable to 60. New purchases in transit reserve warehouse space immediately. Outbound sales release warehouse space immediately but remain physical cargo until delivery.

For a purchase, landed inventory cost includes inward freight. For a partial sale, cost basis is released proportionally at weighted average landed cost. When an export settles:

```text
realized trading margin = gross sale payment − released landed cost − outward freight
```

Goods and cash move only once. A failed order never partially charges freight, changes inventory, or consumes capacity. No phantom player goods may be created from a destination’s anticipated arrival.

An export price is locked at booking. The prototype offers no buyer defaults, loss rolls, or surprise changes to already-booked arrival dates. The storm affects only new Mossmere bookings. This makes forward-sale commitments legible. Unsold imports still face future resale-price uncertainty.

## 7. Actual opening-deal audit

For the shared initial state:

```text
Starting cash                            360g
Buy Nara's four cloth for                 −80g
Outward freight to Mossmere               −6g
Cash immediately after booking           274g
Mossmere's committed gross payment       +120g
Cash on the next morning                 394g
Realized margin                            34g
```

The four cloth are removed from the player immediately at dispatch. Mossmere does not receive physical stock until arrival, but reserves its 120g buying obligation and four-unit order quantity on booking. The goods cannot be duplicated or resold while in transit. Browser interaction tests reproduce this sequence through the normal controls.

Selling that same lot immediately at home produces 82g gross and no outward freight: 2g margin instead of 34g. The player is choosing between immediate liquidity and a better one-day committed sale.

## 8. Events, information, and competition

The event schedule is generated before relevant player decisions, with announcements available ahead of effects. Effects modify production, demand, or new booking time—not the last-traded price directly. A festival may take time to deplete a market’s existing surplus; “festival soon” is not a guarantee that a speculative position will earn money.

Visitors have fixed reservation prices drawn before the player’s offers. Their clues signal flexibility. The player can learn from rejection, but cannot repeatedly reroll acceptance. Quotes for requests use reference values and predetermined generation, not a player-manipulated current midpoint; buying all tea cannot instantly generate a new inflated request in the same day.

Lark Trading starts with 320g. At close it checks public current quotes and, when feasible, chooses one small route with at least 5g margin after freight. It buys at the same marginal-quote function, removes real goods, reserves the buyer’s budget and demand, and carries physical cargo. It receives payment on arrival. Its freight capacity is intentionally small; this is a rebalancing agent, not a competitive player AI.

## 9. Score and reporting

The charter requires the player to reach 900g **cash** during the first 14 days. It is not awarded for theoretical market value or an inflated acquisition-cost total. Earning the charter does not spend the 900g. It remains recorded even after a later voluntary purchase.

The closing report separately shows cash, realized margin, inventory at cost, completed requests, and outstanding gross receipts. These figures must not be added together and called profit. Capacity upgrades reduce cash but are not deducted from the trading-margin statistic; that statistic is not comprehensive business net income.

The warehouse’s “sellable here now” estimate walks the local marginal bid for available inventory, respects per-good order limits, and shares the current buying budget across all goods in a fixed order. It is an executable sequential local-sale estimate, not a claim to maximize liquidation proceeds or to value every unsellable unit. It excludes in-transit goods and is never used for the cash target.

## 10. Tests actually run

The simulation suite passes 40 tests, including deterministic replay, read-only previews, invalid inputs, insufficient funds, empty stock, budget/depth limits, lot price impact, round-trip losses, weighted cost basis, import reservations, export escrow-style commitments, arrival timing, physical transfer conservation, recipe inputs, scheduled production effects, negotiation limits, request atomicity/expiration, upgrades, scoring, corrupted saves, and sandbox continuation.

One randomized test performs eight attempted trades a day for 60 days across 100 seeds, checking state invariants after each attempted trade and day close. It finds a broad class of accounting defects but is not exhaustive adversarial search.

The browser harness checks desktop and mobile interactions using the real built HTML. Because this environment blocks file and HTTP navigation, it uses in-memory document rendering and a test Storage shim. Native URL loading and localStorage persistence remain deployment smoke-test items. The river edition adds legacy-save migration and save-priority checks. A differential run against the previous build matched 3,000 economic-state snapshots over 50 seeds × 30 days after excluding display text only; price quotes matched exactly. Exact outputs are included.

## 11. Preliminary balance observations

Thirty shared seeds were tested with four simple public-information policies:

| Policy | Median cash at close | Range | Charter achieved |
|---|---:|---:|---:|
| Wait without trading | 360g | 360–360g | 0/30 |
| Local requests and counter trades | 506g | 425–633g | 0/30 |
| Repeated local-tea exports only | 501.5g | 486–532g | 0/30 |
| Mixed requests, visitors, exports, and cautious imports | 911.5g | 799–1,052g | 18/30 |

The mixed policy makes a median 37 ordinary trades over the season. It does not inspect hidden reservation prices or future random draws. Its import forecast naively uses today’s local bids and can therefore be wrong; exports use available committed prices.

These results suggest that waiting does not create free cash, the opening tea discrepancy is not an unlimited money machine, and one elementary diversified policy can reach the milestone. They do **not** show that the milestone is correctly calibrated for humans, that the mixed policy is optimal, or that every strategy has equal value. The local-only policies missing the charter is a tuning choice to examine, not automatically a success.

## 12. Highest-value next checks

First test whether a human can explain one profitable and one rejected trade without guessing. Measure actual clicks and time, not only net worth. Inspect whether tea or tools dominate sensible routes after accounting for capacity, risk, and delays. Compare counter-heavy and freight-heavy play before tuning the shared target.

Then stress search for repeated cross-market cycles, cash timing exploits, new-request price manipulation, artificial value creation from pending inventory, split-order behavior, and pathological long-run saturation. Extend property-based tests as mechanics change. Preserve both gross revenue and realized landed-cost margin in any analysis.

Defer a fully closed economy, elaborate rival strategy, player-owned factories, and credit markets until the existing small system feels good. Each would multiply balancing and explanation work before demonstrating additional player value.
