# Riverward Exchange — Product Requirements

**Status:** playable v0.2 river-edition design hypothesis, not a finished or player-validated game  
**Format:** browser-first, single-player, self-contained static HTML  
**Pitch:** a stationary riverside trading house with a legible, reactive economy  
**Design priority:** enjoyable trading decisions before progression, content volume, or simulation completeness

## 1. The game in one paragraph

You run a small trading house at the stone quay of a small river town. Farmers, couriers, wholesalers, and buyers come to your counter. You buy lots, judge prices, book freight to other towns, and keep enough cash and warehouse space free for the next opportunity. Your physical location never changes. The world is expressed through arrivals, shortages, production, consumption, and the news. The pleasure is identifying a good deal and deciding how much to commit—not repeatedly navigating between known locations.

**The good moment:** a cloth wholesaler needs her hold emptied. You negotiate a modest discount, notice that an outlying town is short of cloth, and sell the lot into a committed delivery order. Tomorrow’s payment arrives just in time to buy tools from the mining town. The pieces connect because of your decisions, not because you clicked through a fixed quest chain.

## 2. Inspiration: preserve the decisions, not the feature lists

Dealer’s Life Legend emphasizes studying customers, negotiating, trading distinctive wares, and travelling among cities. Preserve the personal interaction and satisfaction of securing a deal. Do not inherit movement, companion management, potions, character statistics, or an elaborate campaign merely because the reference contains them.

Merchant of the Skies combines trading, regional routes, production, and an appealing airborne world. Preserve regional specialization, cargo economics, and atmosphere, but use grounded river towns and canals rather than the reference’s airborne setting. Remove piloting, fuel chores, manual loading, and production-estate management from this first version.

Developer-authored references consulted:

- Abyte Entertainment, *Dealer’s Life Legend*: https://www.abyteentertainment.com/dealers-life-legend
- Coldwild Games, *Merchant of the Skies*, official Steam description: https://store.steampowered.com/app/1040070/Merchant_of_the_Skies/

These games are references, not asset sources. All prototype artwork is original procedural pixel art. No names, characters, maps, audio, sprites, or interfaces are copied.

## 3. Product pillars

### Trading is the activity

The player directly chooses the good, lot size, counterparty, timing, and offer. Avoid an automatic shop simulation where the only real decisions are buying upgrades and watching numbers rise. Visitors and requests are optional trading opportunities, not mandatory errands.

### Deep enough to reason about, small enough to understand

Six goods, three markets, one physical manufacturing link, and a few visible events are enough to test the idea. More commodities are not a substitute for meaningful differences among them. Explain why a price changed in plain language, with details available but not compulsory.

### Consequences without chores

Warehouse space, cash, market depth, freight fees, and settlement time constrain the player. No cleaning, walking to customers, dragging individual crates, durability repair, fuel collection, or real-time waiting. Buying and selling are batch actions. Animation expresses state; it is never a gate on progress.

### Skill means understanding a deal

Good results should come from reading supply, identifying a willing buyer, negotiating sensibly, and committing the right amount. Avoid invisible “merchant level” bonuses, success-percentage dice rolls on every trade, or reloadable random prices.

## 4. Intended experience

A day is a small decision loop, often three to six meaningful commitments, plus as much free inspection as the player wants. The initial target is a 15–30 minute first season and satisfying two-to-five-minute partial sessions. These are design targets, not measured completion times.

The opening must provide a recognizable opportunity in under one minute. The introductory visitor and prices are fixed to teach a real route. Later events and visitors vary deterministically by seed.

Start with 360g, 40 warehouse spaces, and 28 freight spaces per day. A 900g cash milestone during days 1–14 earns a permanent trading charter. Cash is deliberately distinct from inventory cost, estimated resale value, and outstanding receipts. After day 14, show a report and continue the same business. Missing the target is not bankruptcy. No rent or upkeep is charged in this prototype.

## 5. Core loop

**Read → compare → commit → settle → understand.**

Read the river gazette and the merchant’s clue. Inspect current market quotes and available buyers. Choose a lot and preview its exact total. Negotiate, buy, sell, fulfill a request, or leave the opportunity alone. Close the day when ready. Review changed stock and arrivals, then make the next decision with the resulting cash and inventory.

There is no artificial “three actions per day” restriction. Hard constraints already exist in buying budgets, daily freight capacity, warehouse size, finite supply, and negotiation patience. Adding another action currency would make the same decisions harder to explain.

## 6. World and goods

The three locations are order-book tabs, not destinations that the avatar must visit.

| Market | Identity | Connection to the player |
|---|---|---|
| Riverward | Home river quay; coastal traders bring cloth and tea | Immediate local trading |
| Mossmere | Farms and sawmills; needs finished goods | Normally one day upriver by barge |
| Emberforge | Mines and tool workshops; needs food and imports | Normally two days by canal, through locks |

| Good | Role in a decision |
|---|---|
| Grain | Low-value staple. Useful volume and harvest opportunities, but freight can erase the margin. |
| Timber | Bulky workshop input. Cheap units can still be an inefficient use of space. |
| Iron | Bulky mined input. Regional specialization and maintenance affect availability. |
| Cloth | Compact wholesale cargo. A natural visitor-trade and festival-demand good. |
| Tea | High-value, compact cargo with shallow markets. A large apparent spread saturates quickly. |
| Tools | Manufactured from actual timber and iron. Their supply links back to input availability and workshop economics. |

Goods do not spoil in this slice. Space and tied-up capital already penalize hoarding without adding another hidden loss mechanism.

### River setting guardrail

The player runs a fixed shop, not a boat. Riverward connects coastal importers to Mossmere’s upstream farms and Emberforge’s canal-side ironworks. Barges carry freight and a small passenger ferry animates the waterfront. Stone quays, a bridge, towpaths, warm warehouse lamps, and timber-framed buildings establish the locale. No floating islands, airborne vehicles, boat piloting, water-level management, fuel, or added travel chores. Storms keep the existing production and freight effects; there is no new weather-risk system.

## 7. Trading and freight requirements

Every order previews quantity, goods subtotal, freight fee, total paid or net received, occupied space, and settlement day. The table shows the next unit; the checkout sums the changing price of every unit in the lot.

Home purchases settle immediately. Remote purchases remove stock at origin immediately, charge the full landed cost, reserve warehouse space, and deliver later. Goods in transit cannot be sold.

Home sales deliver goods and cash immediately. Remote sales remove the player’s goods now and charge outward freight now. The destination reserves its buying budget and order quantity immediately; payment occurs on delivery at the already-agreed gross price. Incoming committed goods reduce subsequent buying bids, so another identical export cannot exploit an unchanged quote.

Importing and holding uncommitted inventory involves resale-price risk. Exporting into an accepted order does not. Keep this distinction explicit; “uncertainty” need not mean every transaction can arbitrarily change after acceptance.

Mossmere freight normally costs 2g per booking plus 1g per cargo space; Emberforge costs 2g plus 2g per space. Timber and iron occupy two spaces per unit. Other goods occupy one. The same freight capacity is shared by incoming and outgoing bookings.

## 8. Negotiation requirements

One visitor appears each day with a finite lot, a buy-or-sell intention, a quoted total, a contextual clue, and an already-determined reservation price. Offer, accept, or pass. There are at most two rejected counteroffers; invalid unaffordable offers do not consume patience.

Acceptance depends on the stored reservation price, not a fresh roll. Reloading or changing screens never changes the merchant. A completed lot cannot be traded twice. The prototype uses small recurring-name archetypes; actual relationship memory is deferred.

The initial visitor sells four cloth, asks 92g, and signals a need to free cargo space. An 80g offer succeeds. The useful lesson is not an optimal universal discount: another merchant can be firmer, can be a buyer, or can offer a lot that should simply be declined.

## 9. Requests, news, and competition

Town requests are finite, optional, fixed-price bids with deadlines. They consume the delivered goods rather than putting them back into a resale market. There is no penalty for ignoring them. This is not yet a futures or debt system. Initial requests teach supplying food locally and sourcing tools remotely. New requests appear every third day.

Confirmed events change physical flows, not a disconnected price multiplier:

- Lantern Fair increases home demand for grain, cloth, and tea.
- River storms reduce Mossmere timber production and add a day to new freight bookings.
- Mine maintenance reduces Emberforge iron output.
- The harvest increases Mossmere grain output.

One rival, Lark Trading, uses its own finite capital to take a small profitable route at day close. It buys actual stock and books actual cargo. It does not know hidden future outcomes or receive arbitrary “catch-up” gold. Its purpose is to let unattended discrepancies narrow, not to overwhelm the player with rival management.

## 10. Interface and art

The fixed trading house remains visible: warm wood, a small merchant counter, tiny goods, a visiting trader, stone quays, timber-framed houses on the far bank, a cargo barge, and a passenger ferry. Render the scene at 640×168 internal pixels, scaled with image smoothing disabled. Treat it as original SNES-inspired art direction, not a claim of actual SNES hardware constraints.

Use readable conventional text for economic information rather than forcing all numbers into a decorative pixel font. Gold marks expenditure and purchasing; mint marks sale proceeds. Never communicate direction only through color: explicit Buy, Sell, paid now, and receives later labels are required.

Desktop is the primary layout. Touch-capable mobile uses stacked panels without horizontal overflow. All substantive decisions use buttons and number inputs, not dragging. Full keyboard play through focusable controls should remain possible. Dialogs support Escape. Respect reduced-motion preference in decorative animation.

Provide “Why this price?” detail, recent indicative price sparklines, average landed inventory cost, pending shipments, an executable local liquidation estimate, and a readable transaction ledger. Avoid making players maintain a spreadsheet merely to remember purchase cost.

## 11. Implemented slice versus deferred design

**Implemented:** six goods, three markets, finite stock and buying budgets, marginal lot pricing, warehouse and freight constraints, fixed-price export settlement, physical input/tool production, local consumption, visible scheduled events, one rival, one visitor per day, two-counteroffer negotiation, optional requests, two capacity upgrades, local saving, a seeded world, and the 14-day assessment with continuation.

**Deliberately absent:** avatar movement, combat, production ownership, fuel, staff management, player levels, large crafting trees, rarity inflation, unique-item appraisal, debt, route-loss dice rolls, real-time timers, multiplayer, music, cloud saves, and microtransactions.

A later unique-item layer could be useful, but it must add a different decision: uncertain appraisal, a specific buyer, scarce liquidity, and a choice to hold or sell. Do not add fifty cosmetic items that all behave like tea.

## 12. Acceptance criteria and validation

Economic invariants: all player transactions are atomic; rejected trades do not mutate state; cash, stock, capacity, and settlement constraints are respected; inventory cost is carried into realized margin correctly; immediate round trips lose money; bulk quotes equal the sum of marginal unit prices; transfers preserve the location of physical goods; scheduled deliveries occur exactly once; fixed bids cannot pay twice; saving does not reroll events or negotiation thresholds.

This build passes 40 automated simulation tests. The randomized test covers 100 seeds and 60 days per seed. A browser DOM harness checks the initial bargain, remote delivery, save serialization/restore, controls, report, restart, and a mobile import. The river edition also checks legacy-save migration, current-save priority, updated scene labels, and storm rendering. A 50-seed comparison against the previous engine matched 3,000 economic-state snapshots after excluding display text. See the README for the environment’s navigation and native-storage test limitation.

Four heuristic policies across 30 seeds produced median end-of-season cash of 360g for waiting, 506g for a local counter/request trader, 501.5g for a repeated tea-export policy, and 911.5g for a mixed trader. The mixed trader reached the milestone in 18/30 seeds. These are sanity checks only, not a calibrated difficulty curve or proof that a human will enjoy the game.

## 13. The next playtest, before adding features

Observe whether a new player can complete the opening deal, identify the total margin after freight, explain one overnight price change, and distinguish cash from goods in transit. Ask which choice was interesting and which felt like arithmetic or interface work.

The most important question is whether the player enjoys comparing ordinary market orders or wants more emphasis on individual merchants and unusual goods. Both are valid games; do not build both into a large system before testing the small version.

If the first session feels like repeatedly clicking the largest green number, improve regional identities, lot-size tradeoffs, information timing, and counterparty motives before adding content. If it feels like a dashboard, strengthen merchant presentation and transaction feedback before adding more statistics.

The first expansion should address the largest observed weakness, not add a map, a crafting tree, and a relic system simultaneously.
