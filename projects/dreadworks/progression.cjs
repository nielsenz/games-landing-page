// Legal shop purchases and normal castle HP; a reproducible survival check, not optimal play.
const {game}=require('./game-harness.cjs');
function progression(seed, waves=12, level=0) {
 const g=game(seed*7919);
 if(level)g.resetGame(level);
 const roadPlans=[[['saw',16,144],['spikes',128,144],['spring',80,144]],[['saw',240,144],['spring',192,144]],[['saw',64,144],['saw',144,144]],[['saw',256,144],['saw',288,144]],[['saw',304,144],['spikes',224,144]],[['cannon',272,144],['cannon',176,144]]];
 const roadAir=[[288,112],[272,112],[176,80],[192,80],[80,96],[64,96],[256,112],[160,80],[48,96],[112,144],[336,144],[32,144]];
 const plans=level===0?roadPlans:[
   [['saw',16,144],['spikes',272,144],['spring',208,144]],
   [['saw',96,144],['spring',128,144]],
   [['saw',176,144],['saw',256,144]],
   [['saw',288,144],['saw',48,144]],
   [['spikes',240,144],['saw',320,144]],
   [['cannon',304,144],['cannon',192,144]]
 ];
 const airPositions=level===0?roadAir:[[304,80],[288,80],[144,80],[128,80],[224,96],[240,96],[48,96],[64,96],[112,80],[320,80],[32,96],[208,96]];
 const results=[];
 for(let wave=1;wave<=waves;wave++){
   const plan=plans[wave-1]||airPositions.map(([x,y])=>['cannon',x,y]);
   for(const[type,x,y]of plan){
     if(!g.state.shop.includes(type))throw Error('unavailable trap');
     if(wave>6&&(!g.placementValid(type,x,y)||g.state.gold<g.TRAP_DEFS[type].cost))continue;
     const count=g.state.traps.length;g.state.selected=type;g.placeSelectedAt(x,y);
     if(g.state.traps.length!==count+1)throw Error('unaffordable/invalid purchase');
   }
   g.startWave();for(let f=0;f<3600&&g.state.mode==='wave';f++)g.update(1/60);
   if(g.state.mode==='wave')throw Error('unresolved wave');
   results.push({wave,mode:g.state.mode,hp:g.state.castleHp,cleared:['build','victory'].includes(g.state.mode)});
   if(g.state.mode==='gameover')break;
   if(g.state.mode==='victory' && wave<waves)g.continueEndless();
 }
 return results;
}
if(require.main===module){const runs=Array.from({length:30},(_,i)=>progression(i+1));for(let wave=1;wave<=12;wave++){const r=runs.map(run=>run.find(x=>x.wave===wave)).filter(Boolean);console.log({wave,cleared:r.filter(x=>x.cleared).length,outOf:30,minHp:Math.min(...r.map(x=>x.hp))});}}
module.exports={progression};
