const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {JSDOM,VirtualConsole} = require('jsdom');
const root=path.resolve(__dirname,'..');
function crumb(saved={},slug='crumb-command') {
 const errors=[];
 const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'public',slug,'play.html'),'utf8'),{
  url:`https://arcade.test/${slug}/play.html?debug#debug`,runScripts:'dangerously',virtualConsole,
  beforeParse(w){
   for(const [k,v] of Object.entries(saved))w.localStorage.setItem(k,v);
   w.matchMedia=()=>({matches:false,addEventListener(){}});
   w.requestAnimationFrame=()=>1;w.cancelAnimationFrame=()=>{};
   const context=new Proxy({measureText:s=>({width:String(s).length*6}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),createPattern:()=>({})},{get:(o,k)=>k in o?o[k]:(()=>{})});
   w.HTMLCanvasElement.prototype.getContext=()=>context;
   w.HTMLCanvasElement.prototype.getBoundingClientRect=()=>({left:0,top:0,width:960,height:600});
   w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
   w.HTMLCanvasElement.prototype.hasPointerCapture=()=>false;
  }
 });
 assert.deepEqual(errors.map(e=>e.message),[]);
 return {dom,w:dom.window,$:id=>dom.window.document.getElementById(id),errors};
}
test('Crumb guide teaches selection, a real capture, and recruitment; completion persists',()=>{
 const {dom,w,$,errors}=crumb();try{
  $('startBtn').click();assert.match($('guideTitle').textContent,/Select/);
  const activate=new w.KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true});
  $('guideAction').dispatchEvent(activate);assert.equal(activate.defaultPrevented,false,'buttons retain native keyboard activation');
  $('guideAction').click();assert.equal(w.CrumbDebug.selected.length,4);assert.match($('guideTitle').textContent,/Cracker/);
  $('guideAction').click();
  $('field').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:292,clientY:176,button:0}));
  assert.match($('guideTitle').textContent,/Hold/);
  w.CrumbDebug.advance(12);
  assert.equal(w.CrumbDebug.game.nodes[0].owner,0);assert.match($('guideTitle').textContent,/Grow/);
  $('guideAction').click();w.CrumbDebug.advance(8);
  assert.equal($('firstCapture').hidden,true);assert.equal(w.localStorage.getItem('crumb-command:guide-complete'),'1');
  assert.deepEqual(errors.map(e=>e.message),[]);
 }finally{dom.window.close();}
 const again=crumb({'crumb-command:guide-complete':'1'});try{assert.equal(again.$('guidedStart').checked,false);}finally{again.dom.window.close();}
});
test('skipping guide preserves the match; focus loss cannot be undone by closing help',()=>{
 const {dom,w,$}=crumb();try{
  $('startBtn').click();$('skipGuide').click();assert.equal($('firstCapture').hidden,true);
  assert.equal(w.CrumbDebug.game.status,'playing');
  $('helpBtn').click();w.dispatchEvent(new w.Event('blur'));$('closeHelpBtn').click();
  assert.equal(w.CrumbDebug.game.paused,true);
  $('resumeBtn').click();assert.equal(w.CrumbDebug.game.paused,false);
 }finally{dom.window.close();}
});
test('Idle Farm goal follows harvest/sell/buy and stays hidden for established farms',()=>{
 const html=fs.readFileSync(path.join(root,'projects/idle-farm/index.html'),'utf8');
 const constants=html.slice(html.indexOf('      const CONST ='),html.indexOf('      function showToast'));
 const goal=html.slice(html.indexOf('      function firstFieldGoal('),html.indexOf('      function renderFirstFieldGoal('));
 const c=vm.createContext({});vm.runInContext(constants+goal+';globalThis.api={firstFieldGoal,defaultState};',c);
 const s=c.api.defaultState(),read=()=>c.api.firstFieldGoal(s);
 assert.equal(read().phase,'harvest');s.grain=14.9;assert.equal(read().progress,14);
 s.grain=15;assert.equal(read().phase,'sell');s.grain=0;s.coins=15;assert.equal(read().phase,'buy');
 s.coins=0;s.producers.field=1;assert.equal(read().phase,'done');
 s.producers.field=0;s.prestigeTokens=1;assert.equal(read().phase,'done');
});
test('Dreadworks source matches its served build; farm scripts and vendor files are present',()=>{
 assert.equal(fs.readFileSync(path.join(root,'projects/dreadworks/index.html'),'utf8'),fs.readFileSync(path.join(root,'public/dreadworks/play.html'),'utf8'));
 const html=fs.readFileSync(path.join(root,'projects/idle-farm/index.html'),'utf8');
 assert.equal(html,fs.readFileSync(path.join(root,'public/idle-farm/play.html'),'utf8'));
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(m[1].includes('src=')){
   const asset=m[1].match(/src="([^"]+)"/)[1];
   assert.equal(fs.readFileSync(path.join(root,'projects/idle-farm',asset),'utf8'),fs.readFileSync(path.join(root,'public/idle-farm',asset),'utf8'));
  }
  else new vm.Script(m[2]);
 }
});

test('Pocket Behemoth Escape pauses without resuming a hunt during fullscreen exit',()=>{
 const {dom,w,$,errors}=crumb({},'pocket-behemoth');try{
  $('start').click();assert.equal(w.__hunt.game.scene,'playing');
  const escape=()=>w.dispatchEvent(new w.KeyboardEvent('keydown',{code:'Escape',bubbles:true}));
  escape();assert.equal(w.__hunt.game.scene,'paused');
  escape();assert.equal(w.__hunt.game.scene,'paused');
  $('resume').click();assert.equal(w.__hunt.game.scene,'playing');
  w.dispatchEvent(new w.Event('blur'));assert.equal(w.__hunt.game.scene,'paused');
  assert.deepEqual(errors.map(e=>e.message),[]);
 }finally{dom.window.close();}
});
test('Idle Farm first-field buttons complete the economy loop and preserve it on reload',()=>{
 let html=fs.readFileSync(path.join(root,'projects/idle-farm/index.html'),'utf8');
 // WebGL and animation are excluded; the real economy, DOM, events and storage run.
 html=html.replace(/<script src="[^"]+"><\/script>/,'');
 const from=html.indexOf('      // ─── THREE.JS FARM VISUALS');
 const to=html.indexOf('      // ─── Events');
 html=html.slice(0,from)+'function updateFarmVisuals(){} function spawnFloatingText(){} function spawnGrainParticles(){} function startLoop(){} function stopLoop(){}\n'+html.slice(to);
 function open(saved){
  const errors=[];const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM(html,{url:'https://arcade.test/idle-farm/play.html',runScripts:'dangerously',virtualConsole:console,beforeParse(w){w.THREE={};if(saved)w.localStorage.setItem('idle_farm_save_v2',saved);}});
  return {dom,w:dom.window,$:id=>dom.window.document.getElementById(id),errors};
 }
 const f=open();let saved;try{
  assert.deepEqual(f.errors,[]);assert.equal(f.$('firstFieldGoal').hidden,false);
  for(let i=0;i<15;i++)f.$('harvestBtn').click();
  assert.equal(f.$('firstFieldAction').textContent,'Sell grain');f.$('firstFieldAction').click();
  assert.equal(f.$('coins').textContent,'15');
  // The guided purchase is exactly one field regardless of the bulk-purchase selector.
  f.$('buyMode').value='10';f.$('firstFieldAction').click();
  assert.equal(f.$('firstFieldGoal').hidden,true);assert.equal(f.$('count_field').textContent,'1');
  assert.equal(f.$('coins').textContent,'0');assert.equal(f.$('pps').textContent,'0.50');
  saved=f.w.localStorage.getItem('idle_farm_save_v2');assert.deepEqual(f.errors,[]);
 }finally{f.dom.window.close();}
 const reloaded=open(saved);try{assert.equal(reloaded.$('firstFieldGoal').hidden,true);assert.equal(reloaded.$('count_field').textContent,'1');}finally{reloaded.dom.window.close();}
});
