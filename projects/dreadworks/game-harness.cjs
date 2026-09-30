const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function game(seed = 1, options = {}) {
  const html = readFileSync(process.env.QC_HTML || `${__dirname}/index.html`, 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ctx = options.context || new Proxy({}, { get: (o, k) => o[k] || (() => {}), set: (o, k, v) => (o[k] = v, true) });
  const math = Object.create(Math);
  math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const elements = new Map();
  const getElementById = id => {
    if (!elements.has(id)) elements.set(id, {
      width: 384, height: 216, getContext: () => ctx,
      getBoundingClientRect: () => ({left:0,top:0,width:384,height:216}),
      events: {}, attributes: {}, textContent: '',
      addEventListener(name, fn) { this.events[name] = fn; },
      setAttribute(name, value) { this.attributes[name] = value; }
    });
    return elements.get(id);
  };
  const windowEvents = {}, documentEvents = {};
  const sandbox = {
    Math: math, performance: { now: () => options.time || 0 }, setTimeout() {}, requestAnimationFrame() {},
    window: { addEventListener(name, fn) { windowEvents[name] = fn; } },
    document: { getElementById, hidden: false, addEventListener(name, fn) { documentEvents[name] = fn; } }
  };
  vm.createContext(sandbox);
  vm.runInContext(script.replace(/\}\)\(\);\s*$/, `globalThis.qc = {
    get state() { return state; }, resetGame, spawnHero, updateHero, update, render,
    startWave, damageHero, placeSelectedAt, sellAt, updateCannon, updateProjectiles, rollShop, HERO_DEFS, TRAP_DEFS, LEVELS, placementValid, continueEndless, nextLevel
  }; })();`), sandbox);
  sandbox.qc.elements = elements;
  sandbox.qc.windowEvents = windowEvents;
  sandbox.qc.documentEvents = documentEvents;
  sandbox.qc.document = sandbox.document;
  return sandbox.qc;
}

module.exports = { game };
