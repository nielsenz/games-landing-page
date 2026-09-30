// Seeded full-map balance report. QC_HTML=/path/to/index.html compares revisions.
const { game } = require('./game-harness.cjs');
const layouts = {
  'empty': [],
  'three spikes': [['spikes',16],['spikes',32],['spikes',48]],
  'two saws': [['saw',16],['saw',64]],
  'saw + spike + spring': [['saw',16],['spikes',128],['spring',80]],
  'saw + reverse + spike': [['saw',16],['conveyor',64],['spikes',128]],
  'spaced spikes': [['spikes',16],['spikes',128],['spikes',240]],
  'saw + two springs': [['saw',16],['spring',80],['spring',192]],
  'cannon + spike': [['cannon',80],['spikes',128]],
  'crusher + spike': [['crusher',32,96],['spikes',128]],
  'saw + two blocks': [['saw',16],['block',64],['block',128]],
};
function run(layout, seed, wave=1, dt=1/60) {
  const g=game(seed*7919);
  g.state.wave=wave;
  g.state.castleHp=100;
  const start=g.state.gold;
  for (const [type,x,y=144] of layout) {
    g.state.selected=type;
    g.placeSelectedAt(x,y);
  }
  if (g.state.traps.length !== layout.length) throw Error('Invalid/unaffordable layout');
  const cost=start-g.state.gold;
  const before=g.state.gold;
  g.startWave();
  for(let frame=0;frame<60/dt && g.state.mode==='wave';frame++)g.update(dt);
  if(g.state.mode!=='build') throw Error('Wave did not finish');
  return {hits:g.state.totalEscaped, income:g.state.gold-before,cost};
}
if(require.main===module) {
  for(const wave of [1,2,3,4,6]) {
    console.log(`Wave ${wave}, 60 seeds, unchanged opening layouts (no reinvestment)`);
    for(const [name,layout] of Object.entries(layouts)) {
      const r=Array.from({length:60},(_,i)=>run(layout,i+1,wave));
      console.log(`${name.padEnd(27)} ${r[0].cost}g | hits ${(r.reduce((s,x)=>s+x.hits,0)/60).toFixed(2)} | perfect ${r.filter(x=>!x.hits).length}/60 | income ${(r.reduce((s,x)=>s+x.income,0)/60).toFixed(1)}g`);
    }
  }
}
module.exports={run,layouts};
