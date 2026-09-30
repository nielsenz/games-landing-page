const {test} = require('node:test');
const assert = require('node:assert/strict');
const {game} = require('./game-harness.cjs');
test('focus loss pauses an active wave until explicitly resumed', () => {
 const g=game(); g.startWave(); g.update(.1);
 g.windowEvents.blur(); const remaining=g.state.spawnLeft;
 for(let i=0;i<120;i++)g.update(1/60);
 assert.equal(g.state.paused,true); assert.equal(g.state.spawnLeft,remaining);
 g.elements.get('pause-game').events.click(); assert.equal(g.state.paused,false);
 g.document.hidden=true; g.documentEvents.visibilitychange(); assert.equal(g.state.paused,true);
 g.document.hidden=false; g.documentEvents.visibilitychange(); assert.equal(g.state.paused,true);
});
test('holding P cannot toggle pause repeatedly', () => {
 const g=game();g.startWave();
 const key={code:'KeyP',preventDefault(){}};
 g.windowEvents.keydown(key); assert.equal(g.state.paused,true);
 g.windowEvents.keydown({...key,repeat:true}); assert.equal(g.state.paused,true);
 g.windowEvents.keydown(key); assert.equal(g.state.paused,false);
});
test('tap-to-sell refunds once, never places, and exits when a card or wave is chosen', () => {
 const g=game();g.state.selected='spikes';
 let spot;
 for(let y=32;y<176&&!spot;y+=16)for(let x=16;x<352;x+=16)if(g.placementValid('spikes',x,y)){spot={x,y};break;}
 assert.ok(spot);g.placeSelectedAt(spot.x,spot.y);
 const before=g.state.gold;
 g.elements.get('sell-mode').events.click();assert.equal(g.state.sellMode,true);
 const pointer={clientX:spot.x+8,clientY:spot.y+8,button:0,pointerType:'touch',preventDefault(){}};
 g.elements.get('game').events.pointerdown(pointer);
 assert.equal(g.state.traps.length,0);assert.equal(g.state.gold,before+Math.ceil(g.TRAP_DEFS.spikes.cost*.6));
 g.elements.get('game').events.pointerdown(pointer);assert.equal(g.state.traps.length,0);
 g.elements.get('game').events.pointerdown({...pointer,clientX:20,clientY:190});assert.equal(g.state.sellMode,false);
 g.elements.get('sell-mode').events.click();g.startWave();assert.equal(g.state.sellMode,false);
 g.elements.get('sell-mode').events.click();assert.equal(g.state.sellMode,false);
});
