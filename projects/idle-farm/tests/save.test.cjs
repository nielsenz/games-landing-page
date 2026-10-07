const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function fixture() {
  const html = fs.readFileSync(`${__dirname}/../index.html`, 'utf8');
  const source = html.slice(html.indexOf('      const CONST ='), html.indexOf('      // ─── Best Buy'));
  const data = new Map(); let time = 100000;
  const context = { Date: { now: () => time }, document: { getElementById: () => null },
    localStorage: { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) },
    render() {}, updateFarmVisuals() {} };
  vm.createContext(context);
  vm.runInContext(source + '\nglobalThis.api = {normalizeSave,load,save,importSave,harvestValue, get state(){return S}, hide(){pausedSince=now()}, resume(){save();pausedSince=null}}', context);
  return { ...context.api, api: context.api, data, context, advance: ms => time += ms };
}
test('hidden autosaves and reload credit production exactly once', () => {
  const f = fixture(), g = f.api; g.state.producers.field = 2;
  g.hide(); f.advance(10000); g.save();
  assert.equal(g.state.grain,10);
  f.advance(10000); g.save(); assert.equal(g.state.grain,20);
  f.advance(5000); assert.equal(g.load().grain,25);
  g.resume(); assert.equal(g.state.grain,25);
  g.save(); assert.equal(g.state.grain,25);
});
test('invalid imported numbers do not replace a working save', () => {
  const {api:g} = fixture(); g.state.coins=50;
  for (const obj of [null, [], {coins:-1}, {grain:'oops'}, {producers:null}, {producers:{field:1.5}}, {fertilizerLevel:Infinity}]) {
    assert.throws(()=>g.importSave(obj)); assert.equal(g.state.coins,50);
  }
  g.importSave({fields:3, coins:7});
  assert.equal(g.state.producers.field,3); assert.equal(g.state.producers.barn,0);
  assert.equal(g.state.fertilizerLevel,0);
});
test('unavailable storage never interrupts play or reset', () => {
  const f=fixture(); f.context.localStorage.setItem=()=>{throw Error('blocked')};
  assert.doesNotThrow(()=>f.api.save()); assert.doesNotThrow(()=>f.api.importSave({coins:4}));
  assert.equal(f.api.state.coins,4);
});
test('legacy saves migrate and future timestamps do not subtract grain', () => {
  const f=fixture(); f.data.set('idle_farm_save_v1',JSON.stringify({fields:2,grain:5,lastSavedTs:90000}));
  assert.equal(f.api.load().grain,15);
  f.data.set('idle_farm_save_v2',JSON.stringify({fields:2,grain:5,lastSavedTs:200000}));
  assert.equal(f.api.load().grain,5);
});
test('harvests gather at least 1 grain and scale with production', () => {
  const {api:g} = fixture();
  assert.equal(g.harvestValue(g.state),1);
  g.state.producers.field = 10; assert.equal(g.harvestValue(g.state),1);
  g.state.producers.tractor = 3; assert.equal(g.harvestValue(g.state),15);
  g.state.prestigeTokens = 10; assert.equal(g.harvestValue(g.state),31);
});
