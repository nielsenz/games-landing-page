const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root=path.resolve(__dirname,'..');
function scripts(slug) { return [...fs.readFileSync(path.join(root,'public',slug,'play.html'),'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src=')).map(m=>m[2]); }
function core(slug,index=0,requireModule) {
 const sandbox={module:{exports:{}},require:()=>requireModule};vm.createContext(sandbox);
 vm.runInContext(scripts(slug)[index],sandbox);return sandbox.module.exports;
}
function finiteTree(obj) {
 if(typeof obj==='number')assert.ok(Number.isFinite(obj),'simulation must keep numbers finite');
 else if(obj&&typeof obj==='object')for(const val of Object.values(obj))finiteTree(val);
}
test('every catalog build has valid scripts, matching hash and existing local assets/links',()=>{
 const publicDir=path.join(root,'public');
 const catalog=JSON.parse(fs.readFileSync(path.join(root,'projects/catalog.json'),'utf8'));
 const files=[path.join(publicDir,'index.html'),...catalog.flatMap(g=>['index.html','play.html'].map(f=>path.join(publicDir,g.slug,f)))];
 for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  for(const m of html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, m => m.slice(0,m.indexOf('>')+1)).matchAll(/(?:src|href)="([^"]+)"/g)){
   if(/^(?:https?:|data:|#|mailto:)/.test(m[1]))continue;
   const relative=m[1].split(/[?#]/)[0];
   const target=relative.startsWith('/')?path.join(publicDir,relative):path.resolve(path.dirname(file),relative);
   assert.ok(fs.existsSync(target),`${file}: missing ${relative}`);
  }
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!m[1].includes('src='))new vm.Script(m[2],{filename:file});
 }
 for(const g of catalog)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(publicDir,g.slug,'play.html'))).digest('hex'),g.sha256,g.slug);
});
test('Boostball maintains finite physics and bounded boost during extended AI play',()=>{
 const {Game,CONFIG}=core('boostball-16');const g=new Game({mode:'demo',seed:123});
 for(let i=0;i<Math.ceil(300/CONFIG.STEP);i++){g.step(CONFIG.STEP);g.drainEvents();}
 finiteTree(g);for(const c of g.cars)assert.ok(c.boost>=0&&c.boost<=100);
 assert.ok(g.elapsed>0);
});
test('Roofline timed run finishes and free ride stays finite',()=>{
 const {Game,C}=core('roofline');
 for(const mode of ['timed','free']){
  const g=new Game({mode});for(let i=0;i<Math.ceil((C.scoreRunSeconds+30)/C.step);i++)g.step(C.step,{push:true,jump:i%90===0});
  finiteTree(g.snapshot());if(mode==='timed')assert.equal(g.finished,true);
 }
});
test('Pocket Behemoth resolves an undefended hunt and resets cleanly',()=>{
 const {Hunt,CONFIG}=core('pocket-behemoth');const g=new Hunt({seed:123});g.reset(false,true);
 for(let i=0;i<60*300&&g.scene==='playing';i++)g.update(CONFIG.step);
 assert.equal(g.scene,'lost');finiteTree(g);g.reset(false,true);assert.equal(g.player.hp,CONFIG.player.hp);
});
test('Crumb Command pauses its economy and resolves a full match',()=>{
 const {Game,C}=core('crumb-command');const g=new Game({seed:123});g.start();g.paused=true;
 const before=JSON.stringify(g);g.step(C.STEP);assert.equal(JSON.stringify(g),before);g.paused=false;
 for(let i=0;i<60*301&&g.status==='playing';i++)g.step(C.STEP);
 assert.notEqual(g.status,'playing');finiteTree(g);
});
test('Night Relay both missions complete without enemies and remain finite',()=>{
 const world=core('night-relay');const {Mission}=core('night-relay',1,world);
 for(const mission of ['home','floodgate']){
  const g=new Mission({mission,seed:123,spawns:false});g.start();
  for(let i=0;i<60*600&&g.status==='playing';i++)g.update(1/60);
  assert.equal(g.status,'won',mission);finiteTree(g.summary());
 }
});
test('Riverward survives a year of economy/save round trips and rejects malformed markets',()=>{
 const E=core('riverward-exchange');let s=E.createGame('ARCADE-REVIEW');
 for(let day=0;day<365;day++){E.endDay(s);s=JSON.parse(JSON.stringify(s));assert.equal(E.validate(s),true);}
 finiteTree(s);s.markets[0]=null;assert.equal(E.validate(s),false);
});
