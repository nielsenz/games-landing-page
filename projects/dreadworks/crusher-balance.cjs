const {game}=require('./game-harness.cjs');
function crusherRun(seed, wave, positions, dt=1/60) {
 const g=game(seed*7919);g.state.wave=wave;g.state.gold=28;g.state.castleHp=100;
 for(const [x,y] of positions){g.state.selected='crusher';g.placeSelectedAt(x,y);}
 if(g.state.traps.length!==2)throw Error('invalid crusher pair');
 g.startWave();for(let i=0;i<60/dt&&g.state.mode==='wave';i++)g.update(dt);
 if(g.state.mode!=='build')throw Error('unresolved wave');
 return g.state.totalEscaped;
}
const pairs=[[[16,112],[48,112]],[[16,96],[48,96]],[[32,112],[128,112]],[[32,96],[128,96]],[[64,112],[240,112]]];
if(require.main===module)for(const wave of [1,3,4,6])for(const positions of pairs){const hits=Array.from({length:20},(_,i)=>crusherRun(i+1,wave,positions));console.log(JSON.stringify({wave,positions,hits:hits.reduce((a,b)=>a+b,0),perfect:hits.filter(x=>!x).length}));}
module.exports={crusherRun,pairs};
