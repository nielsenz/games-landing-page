const {game}=require('./game-harness.cjs');
function airRun(seed,wave,positions,dt=1/60){
 const g=game(seed*7919);g.state.wave=wave;g.state.gold=positions.length*16;g.state.castleHp=100;
 for(const[x,y]of positions){g.state.selected='cannon';g.placeSelectedAt(x,y);}
 if(g.state.traps.length!==positions.length)throw Error('invalid cannon position');
 let flyers=0, escaped=0;g.startWave();
 const seen=new Set();
 for(let f=0;f<60/dt&&g.state.mode==='wave';f++){
  const before=g.state.heroes.slice();g.update(dt);
  for(const h of [...before,...g.state.heroes]){
   if(h.flying&&!seen.has(h.id)){seen.add(h.id);flyers++;}
   if(h.flying&&h.dead&&h.hp>0&&h.x+h.w>=354&&!h.countedEscape){escaped++;h.countedEscape=true;}
  }
 }
 if(g.state.mode==='wave')throw Error('unresolved air wave');
 return{flyers,escaped};
}
const positions=[[80,96],[288,112]];
if(require.main===module)for(const wave of[6,9,12])for(const pair of[positions,[[176,80],[272,112]],[[272,144],[176,144]]]){
 const runs=Array.from({length:30},(_,i)=>airRun(i+1,wave,pair));
 console.log({wave,pair,flyers:runs.reduce((s,r)=>s+r.flyers,0),escaped:runs.reduce((s,r)=>s+r.escaped,0)});
}
module.exports={airRun,positions};
