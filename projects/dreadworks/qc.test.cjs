// Run with: node --test qc.test.cjs
const { game } = require('./game-harness.cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');

test('cannons shoot approaching heroes to the left and ignore heroes behind them', () => {
  const g = game();
  const cannon = { x: 80, y: 144, cooldown: 0 };
  g.spawnHero();
  const h = g.state.heroes[0];
  h.x = 110;
  g.updateCannon(cannon);
  assert.equal(g.state.projectiles.length, 0);
  h.x = 40;
  g.updateCannon(cannon);
  assert.equal(g.state.projectiles.length, 1);
  assert.equal(g.state.projectiles[0].x, 78);
  assert.ok(g.state.projectiles[0].vx < 0);
  g.updateCannon(cannon);
  assert.equal(g.state.projectiles.length, 1, 'cooldown prevents duplicate shots');
  for (let frame = 0; frame < 60 && !h.dead; frame++) g.updateProjectiles(1 / 60);
  assert.equal(h.dead, true, 'leftward projectile hits the approaching hero');
});

test('all walking hero types enter on the floor across seeds and frame rates', () => {
  for (const dt of [1 / 120, 1 / 60, .033]) {
    for (let seed = 1; seed <= 100; seed++) {
      const g = game(seed);
      g.state.wave = 10;
      g.spawnHero();
      const h = g.state.heroes[0];
      for (let t = 0; t < 1.5; t += dt) g.updateHero(h, dt);
      assert.equal(h.dead, false, `seed ${seed}, dt ${dt}: entrance death`);
      assert.ok(h.x > 20, 'hero must advance into map');
      if (!h.flying) assert.equal(h.y + h.h, 160);
    }
  }
});

test('a hero killed near the castle cannot move, damage it, or earn another bounty', () => {
  const g = game();
  g.spawnHero();
  const h = g.state.heroes[0];
  h.x = 347;
  g.damageHero(h, 100, 'test');
  const gold = g.state.gold;
  g.updateHero(h, .033);
  assert.equal(g.state.castleHp, 10);
  assert.equal(g.state.totalEscaped, 0);
  assert.equal(g.state.gold, gold);
});

test('empty waves resolve with heroes reaching the castle', () => {
  let escaped = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const g = game(seed);
    g.startWave();
    for (let frame = 0; frame < 3600 && g.state.mode === 'wave'; frame++) g.update(1 / 60);
    assert.notEqual(g.state.mode, 'wave', 'wave must finish within 60 seconds');
    escaped += g.state.totalEscaped;
    g.render();
  }
  assert.ok(escaped > 0, 'undefended castle must be reachable');
});

test('placement, sale, pause, trap kills, and restart', () => {
  const g = game();
  g.state.selected = 'spikes';
  g.placeSelectedAt(32, 144);
  assert.equal(g.state.traps.length, 1);
  assert.equal(g.state.gold, 16);
  g.sellAt(32, 144);
  assert.equal(g.state.traps.length, 0);
  assert.equal(g.state.gold, 21);
  g.placeSelectedAt(32, 144);
  g.startWave();
  g.state.paused = true;
  const remaining = g.state.spawnLeft;
  g.update(1 / 60);
  assert.equal(g.state.spawnLeft, remaining);
  g.state.paused = false;
  for (let frame = 0; frame < 3600 && g.state.mode === 'wave'; frame++) g.update(1 / 60);
  assert.ok(g.state.kills > 0 && g.state.kills < 16, 'one spike cannot clear a wave');
  assert.ok(g.state.castleHp < 10, 'some heroes reach the castle');
  assert.equal(g.state.mode, 'build');
  assert.equal(g.state.wave, 2);
  g.render();
  g.resetGame();
  assert.equal(g.state.wave, 1);
  assert.equal(g.state.gold, 24);
  assert.equal(g.state.traps.length, 0);
});

test('a single early saw becomes less reliable as heroes learn to dodge', () => {
  for (const dt of [1 / 60, .033]) {
    for (const x of [16, 32, 64]) {
      const rates = [];
      for (const wave of [1, 2, 3, 4, 5]) {
        let passed = 0;
        for (let seed = 1; seed <= 100; seed++) {
          const g = game(seed * 7919);
          g.state.wave = wave;
          g.state.traps.push({ id: 999, type: 'saw', x, y: 144, cooldown: 0 });
          g.spawnHero();
          const h = g.state.heroes[0];
          g.state.mode = 'wave';
          for (let frame = 0; frame < 600 && !h.dead && h.x < x + 16; frame++) g.update(dt);
          if (!h.dead && h.x >= x + 16) passed++;
        }
        rates.push(passed);
      }
      console.log(`Saw x=${x}, dt=${dt.toFixed(3)}, survivors/100 in waves 1–5: ${rates.join(', ')}`);
      assert.equal(rates[0], 0, 'wave 1 remains forgiving');
      assert.ok(rates[1] >= 10, 'dodging starts in wave 2');
      assert.ok(rates[4] >= 45, 'a lone saw cannot dominate wave 5');
      assert.ok(rates[4] > rates[1] + 20, 'later waves are noticeably smarter');
      assert.ok(rates[4] < 95, 'traps still catch inattentive heroes');
    }
  }
});

test('armored knights survive four spikes, but mixed damage stops them', () => {
  for (const dt of [1 / 60, .033]) {
    for (const mixed of [false, true]) {
      const g = game(71);
      g.state.wave = 4;
      let h;
      do { g.spawnHero(); h = g.state.heroes.at(-1); } while (h.type !== 'knight');
      g.state.heroes = [h];
      g.state.traps = [16, 32, 48, 64].map((x, i) => ({
        id: 1000 + i, type: mixed && i === 3 ? 'saw' : 'spikes', x, y: 144, cooldown: 0
      }));
      // Isolate armor from randomized evasion: make this knight walk the carpet.
      for (const t of g.state.traps) h.checkedTraps.add(t.id);
      g.state.mode = 'wave';
      for (let frame = 0; frame < 600 && !h.dead && h.x < 80; frame++) g.update(dt);
      assert.equal(h.dead, mixed, mixed ? 'saw finishes spike-wounded knight' : 'spikes alone must not stop armor');
      if (!mixed) assert.ok(h.hp > 0 && h.hp < h.maxHp, 'spikes wear armor down without killing');
    }
  }
});

test('armor only reduces spikes, and knight waves offer a counter', () => {
  const g = game();
  g.state.wave = 4;
  let h;
  do { g.spawnHero(); h = g.state.heroes.at(-1); } while (h.type !== 'knight');
  g.damageHero(h, 1, 'spikes');
  assert.equal(h.hp, 2.75);
  g.damageHero(h, 1, 'cannon');
  assert.equal(h.hp, 1.75);
  g.damageHero(h, 2, 'crusher');
  assert.equal(h.dead, true);
  for (const wave of [4, 5, 6, 10]) {
    g.state.wave = wave;
    g.rollShop();
    assert.ok(g.state.shop.includes('saw') || g.state.shop.includes('cannon'));
    assert.equal(new Set(g.state.shop).size, 5);
  }
});

test('four opening spikes no longer solve complete ground waves', () => {
  let escaped = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const g = game(seed * 7919);
    g.state.wave = 4; // No flying enemies in this wave.
    g.state.castleHp = 100;
    g.state.traps = [16, 32, 48, 64].map((x, i) => ({ id: 1000 + i, type: 'spikes', x, y: 144, cooldown: 0 }));
    g.startWave();
    for (let frame = 0; frame < 3600 && g.state.mode === 'wave'; frame++) g.update(1 / 60);
    assert.equal(g.state.mode, 'build', 'ground wave resolves');
    escaped += g.state.totalEscaped;
  }
  console.log(`Ground heroes reaching castle past four spikes: ${escaped} across 20 wave-4 simulations`);
  assert.ok(escaped >= 20, 'surviving the carpet translates into real castle pressure');
});

test('opening budget rewards complementary defenses across frame rates', () => {
  const { run, layouts } = require('./balance.cjs');
  for (const dt of [1 / 60, .033]) {
    const results = {};
    for (const name of ['three spikes', 'two saws', 'saw + spike + spring', 'saw + two springs']) {
      results[name] = Array.from({ length: 30 }, (_, i) => run(layouts[name], i + 1, 1, dt));
      assert.ok(results[name].every(r => r.cost <= 24));
    }
    const hits = name => results[name].reduce((sum, r) => sum + r.hits, 0);
    assert.ok(hits('three spikes') >= 30, 'spike spam leaks early');
    assert.ok(hits('two saws') >= 5, 'saw spam also has throughput limits');
    for (const name of ['saw + spike + spring', 'saw + two springs']) {
      assert.ok(hits(name) < 10, 'terrain combinations provide reliable openings');
      assert.ok(results[name].every(r => r.income <= 18), 'wave one cannot repay the whole opening');
    }
  }
});

test('opening shop guarantees a terrain combination and cannot buy a fourth spike', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const g = game(seed);
    for (const type of ['saw', 'spring', 'spikes']) assert.ok(g.state.shop.includes(type));
    g.state.selected = 'spikes';
    for (const x of [16, 32, 48, 64]) g.placeSelectedAt(x, 144);
    assert.equal(g.state.traps.length, 3);
    assert.equal(g.state.gold, 0);
  }
});

test('stranded heroes breach blocks and complete the wave', () => {
  const { run, layouts } = require('./balance.cjs');
  for (let seed = 1; seed <= 30; seed++) {
    run(layouts['saw + two blocks'], seed);
  }
});

test('reinvestment keeps the normal castle viable through the first air wave', () => {
  const plans = [
    [['saw', 16], ['spikes', 128], ['spring', 80]],
    [['saw', 240], ['spring', 192]],
    [['saw', 64], ['saw', 144]],
    [['saw', 256], ['saw', 288]],
    [['saw', 304], ['spikes', 224]],
    [['cannon', 272], ['cannon', 176]]
  ];
  for (let seed = 1; seed <= 60; seed++) {
    const g = game(seed * 7919);
    for (const plan of plans) {
      for (const [type, x] of plan) {
        assert.ok(g.state.shop.includes(type));
        const count = g.state.traps.length;
        g.state.selected = type;
        g.placeSelectedAt(x, 144);
        assert.equal(g.state.traps.length, count + 1, 'upgrade must be affordable and legal');
      }
      g.startWave();
      for (let frame = 0; frame < 3600 && g.state.mode === 'wave'; frame++) g.update(1 / 60);
      assert.equal(g.state.mode, 'build', `seed ${seed}: survives wave ${g.state.wave - 1}`);
    }
    assert.equal(g.state.wave, 7);
  }
});

test('level buttons start fresh runs, switch terrain, and restart preserves the level', () => {
  const g = game();
  assert.equal(g.state.level, 0);
  assert.equal(g.placementValid('spikes', 96, 144), false);
  g.state.selected = 'saw';
  g.placeSelectedAt(16, 144);
  g.startWave();
  g.state.paused = true;
  g.elements.get('level-1').events.click();
  assert.equal(g.state.level, 1);
  assert.equal(g.state.wave, 1);
  assert.equal(g.state.gold, 24);
  assert.equal(g.state.castleHp, 10);
  assert.equal(g.state.mode, 'build');
  assert.equal(g.state.paused, false);
  for (const list of ['traps', 'heroes', 'projectiles']) assert.equal(g.state[list].length, 0);
  assert.equal(g.placementValid('spikes', 96, 144), true);
  assert.equal(g.placementValid('spikes', 144, 144), false);
  assert.equal(g.placementValid('spikes', 224, 144), false);
  assert.equal(g.placementValid('cannon', 128, 80), true, 'gantry supports elevated weapons');
  assert.equal(g.elements.get('level-1').attributes['aria-pressed'], 'true');
  assert.equal(g.elements.get('level-0').attributes['aria-pressed'], 'false');
  assert.ok(g.elements.get('level-description').textContent.includes('furnace'));
  g.resetGame();
  assert.equal(g.state.level, 1);
  g.render();
  g.elements.get('level-0').events.click();
  assert.equal(g.state.level, 0);
  assert.equal(g.placementValid('spikes', 96, 144), false);
  g.render();
});

test('foundry rewards a terrain opening and supports reinvestment through wave six', () => {
  const plans = [
    [['saw', 16], ['spikes', 272], ['spring', 208]],
    [['saw', 96], ['spring', 128]],
    [['saw', 176], ['saw', 256]],
    [['saw', 288], ['saw', 48]],
    [['spikes', 240], ['saw', 320]],
    [['cannon', 304], ['cannon', 192]]
  ];
  for (const dt of [1 / 60, .033]) {
    for (let seed = 1; seed <= 30; seed++) {
      const g = game(seed * 7919);
      g.resetGame(1);
      for (const plan of plans) {
        for (const [type, x] of plan) {
          assert.ok(g.state.shop.includes(type));
          const count = g.state.traps.length;
          g.state.selected = type;
          g.placeSelectedAt(x, 144);
          assert.equal(g.state.traps.length, count + 1, 'legal affordable upgrade');
        }
        g.startWave();
        for (let f = 0; f < 60 / dt && g.state.mode === 'wave'; f++) g.update(dt);
        assert.equal(g.state.mode, 'build', 'foundry wave resolves without defeat');
        if (g.state.wave === 2) assert.equal(g.state.castleHp, 10, 'well-placed opening clears wave one');
      }
      assert.equal(g.state.wave, 7);
      g.render();
    }
  }
});

test('foundry entrance and gaps let undefended heroes reach the castle', () => {
  let hits = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const g = game(seed * 7919);
    g.resetGame(1);
    g.state.castleHp = 100;
    g.startWave();
    for (let f = 0; f < 3600 && g.state.mode === 'wave'; f++) g.update(1 / 60);
    assert.equal(g.state.mode, 'build');
    hits += g.state.totalEscaped;
  }
  assert.ok(hits > 150, 'foundry terrain alone must not defend the castle');
});

test('two crushers leave meaningful gaps during recovery', () => {
  const {crusherRun, pairs} = require('./crusher-balance.cjs');
  for(const dt of [1/60,.033]) for(const positions of [pairs[0],pairs[2],pairs[4]]) {
    const hits=Array.from({length:20},(_,i)=>crusherRun(i+1,1,positions,dt));
    assert.ok(hits.reduce((a,b)=>a+b,0)>=20, 'crusher pairs cannot reliably clear the first wave');
    assert.ok(hits.reduce((a,b)=>a+b,0)<70, 'crushers still remove substantial pressure');
  }
});

test('Broken Road has a legal survival route through wave twelve', () => {
  const {progression}=require('./progression.cjs');
  for(let seed=1;seed<=30;seed++) {
    const rounds=progression(seed);
    assert.equal(rounds.length,12);
    assert.ok(rounds.every(r=>r.cleared));
    assert.ok(rounds.at(-1).hp>=6);
  }
});

test('victory waits for the last hero, settles once, and endless resumes at wave 13', () => {
  const g=game();
  g.state.wave=12;g.state.mode='wave';g.state.spawnLeft=0;
  g.spawnHero();
  const last=g.state.heroes[0];
  g.update(1/60);
  assert.equal(g.state.mode,'wave');
  g.damageHero(last,100,'test');
  const gold=g.state.gold;
  g.update(1/60);
  assert.equal(g.state.mode,'victory');
  assert.equal(g.state.wave,13);
  assert.equal(g.state.gold,gold+12);
  assert.equal(g.elements.get('victory-actions').hidden,false);
  const wonGold=g.state.gold;
  for(let i=0;i<120;i++)g.update(1/60);
  g.startWave();
  assert.equal(g.state.mode,'victory');
  assert.equal(g.state.gold,wonGold);
  g.render();
  g.elements.get('continue-endless').events.click();
  assert.equal(g.state.mode,'build');
  assert.equal(g.state.endless,true);
  assert.equal(g.state.wave,13);
  assert.equal(g.elements.get('victory-actions').hidden,true);
  assert.equal(g.state.gold,wonGold);
  g.startWave();
  assert.equal(g.state.mode,'wave');
  assert.equal(g.state.spawnLeft,49);
  g.state.spawnLeft=0;g.state.heroes=[];
  g.update(1/60);
  assert.equal(g.state.mode,'build');
  assert.equal(g.state.wave,14);
});

test('victory choices reset the next map, and defeat takes precedence', () => {
  const g=game();
  for(const level of [0,1]){
    g.resetGame(level);g.state.wave=12;g.state.mode='wave';g.state.spawnLeft=0;
    g.update(1/60);
    assert.equal(g.state.mode,'victory');
    g.elements.get('next-level').events.click();
    assert.equal(g.state.level,(level+1)%2);
    assert.equal(g.state.wave,1);
    assert.equal(g.state.gold,24);
    assert.equal(g.state.endless,false);
    assert.equal(g.elements.get('victory-actions').hidden,true);
  }
  g.state.wave=12;g.state.mode='wave';g.state.spawnLeft=0;g.state.castleHp=1;
  g.spawnHero();g.state.heroes[0].x=354;
  g.update(1/60);
  assert.equal(g.state.mode,'gameover');
  assert.equal(g.elements.get('victory-actions').hidden,true);
});

test('reinforced late flyers need more coverage than two cannons', () => {
  const {airRun}=require('./air-balance.cjs');
  const pair=[[176,80],[272,112]];
  const reinforced=[...pair,[192,80],[288,112],[160,80],[256,112]];
  for(const dt of [1/60,.033]) {
    const totals=positions=>Array.from({length:20},(_,i)=>airRun(i+1,9,positions,dt))
      .reduce((s,r)=>({flyers:s.flyers+r.flyers,escaped:s.escaped+r.escaped}),{flyers:0,escaped:0});
    const two=totals(pair),six=totals(reinforced);
    assert.ok(two.escaped/two.flyers>.3,'two cannons cannot solve late air waves');
    assert.ok(six.escaped/six.flyers<.25,'additional coverage is effective');
  }
});

test('both campaigns can reach victory with legal purchases', () => {
  const {progression}=require('./progression.cjs');
  for(const level of [0,1])for(let seed=1;seed<=30;seed++) {
    const rounds=progression(seed,12,level);
    assert.equal(rounds.at(-1).mode,'victory',`level ${level}, seed ${seed}`);
    assert.equal(rounds.at(-1).wave,12);
  }
});
