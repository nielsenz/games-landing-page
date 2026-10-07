// Chiptab: a plain-text chip music format and a Web Audio player for it.
// The parser is pure and runs in Node (for validation) and in the browser.

(function (root) {
  'use strict';

  const META_KEYS = new Set(['title', 'game', 'mood', 'tempo', 'steps', 'bar', 'swing', 'echo', 'song', 'volume', 'gb']);
  const WAVES = new Set(['square', 'triangle', 'saw', 'sine', 'noise', 'fm', 'drums']);
  const DRUM_CHARS = 'kshoctTpbBwx';
  const NOTE_INDEX = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  const INST_DEFAULTS = {
    wave: 'square', duty: 0.5, vol: 0.3, env: [0.005, 0.1, 0.7, 0.08], gate: 0.92,
    vib: [0, 0, 0], detune: 0, lp: 0, pan: 0, echo: 0.25, oct: 0, arp: 0.045, glide: 0.06,
    ratio: 2, index: 2, idecay: 0.3, isus: 0.2,
  };

  function num(v, line, errors, name) {
    const n = Number(v);
    if (!Number.isFinite(n)) errors.push({ line, msg: `${name} expects a number, got "${v}"` });
    return Number.isFinite(n) ? n : 0;
  }

  function parseInst(rest, line, errors, insts) {
    const parts = rest.trim().split(/\s+/);
    const name = parts.shift();
    if (!name || !/^[a-zA-Z][\w]*$/.test(name)) {
      errors.push({ line, msg: `instrument needs a name made of letters and digits` });
      return;
    }
    let inst = { ...INST_DEFAULTS, env: [...INST_DEFAULTS.env], vib: [...INST_DEFAULTS.vib] };
    for (const p of parts) {
      const m = p.match(/^(\w+)=(.+)$/);
      if (!m) { errors.push({ line, msg: `"${p}" should look like key=value` }); continue; }
      const [, k, v] = m;
      if (k === 'like') {
        if (!insts[v]) { errors.push({ line, msg: `like=${v}: no instrument named ${v} above this line` }); continue; }
        inst = { ...insts[v], env: [...insts[v].env], vib: [...insts[v].vib] };
      } else if (k === 'wave') {
        if (!WAVES.has(v)) errors.push({ line, msg: `unknown wave "${v}" (use ${[...WAVES].join(', ')})` });
        inst.wave = v;
      } else if (k === 'env' || k === 'vib') {
        const arr = v.split(',').map((x) => num(x, line, errors, k));
        if (k === 'env' && arr.length !== 4) errors.push({ line, msg: `env needs 4 values: attack,decay,sustain,release` });
        if (k === 'vib') while (arr.length < 3) arr.push(0);
        inst[k] = arr;
      } else if (k in INST_DEFAULTS) {
        inst[k] = num(v, line, errors, k);
      } else {
        errors.push({ line, msg: `unknown instrument setting "${k}"` });
      }
    }
    inst.name = name;
    insts[name] = inst;
  }

  function expandRepeats(text) {
    const re = /\(([^()]*)\)\s*x(\d+)/;
    let guard = 0;
    while (re.test(text) && guard++ < 200) {
      text = text.replace(re, (_, body, n) => Array(Math.min(64, +n)).fill(body).join(' '));
    }
    return text;
  }

  // Turns one voice's text into events. Voices continue across lines, so state persists.
  function scanVoice(voice, text, line, bar, errors) {
    text = expandRepeats(text);
    const isDrums = voice.inst.wave === 'drums';
    let i = 0;
    const last = () => voice.events[voice.events.length - 1];
    while (i < text.length) {
      const ch = text[i];
      if (/\s/.test(ch)) { i++; continue; }
      if (ch === '|') {
        const inBar = voice.steps - voice.barStart;
        // A bar line may close several bars at once (after a repeat), so check for a whole number of bars.
        if (inBar === 0 || inBar % bar !== 0) {
          errors.push({ line, msg: `${voice.name}: bar ${voice.barNo + 1} has ${inBar % bar || inBar} steps, expected ${bar}` });
        }
        voice.barStart = voice.steps;
        voice.barNo += Math.max(1, Math.round(inBar / bar));
        i++;
        continue;
      }
      if (ch === '.') { voice.steps++; voice.lastWasRest = true; i++; continue; }
      if (ch === '-') {
        if (!isDrums && !voice.lastWasRest && last()) last().len++;
        voice.steps++;
        i++;
        continue;
      }
      if (isDrums) {
        if (DRUM_CHARS.includes(ch)) {
          let vel = 1;
          if (text[i + 1] === '!') { vel = 1.35; i++; } else if (text[i + 1] === '?') { vel = 0.5; i++; }
          voice.events.push({ step: voice.steps, len: 1, drum: ch, vel });
          voice.steps++;
          voice.lastWasRest = false;
          i++;
          continue;
        }
        errors.push({ line, msg: `${voice.name}: "${ch}" is not a drum (use ${DRUM_CHARS.split('').join(' ')})` });
        i++;
        continue;
      }
      const m = text.slice(i).match(/^(\/)?([A-G])([#b]?)(-?\d)(\{[0-9a-fA-F]+\})?([!?])?/);
      if (m) {
        const [whole, slide, letter, acc, oct, arp, accent] = m;
        let midi = 12 * (+oct + 1) + NOTE_INDEX[letter] + (acc === '#' ? 1 : acc === 'b' ? -1 : 0);
        midi += 12 * voice.inst.oct;
        voice.events.push({
          step: voice.steps, len: 1, midi, slide: !!slide,
          arp: arp ? arp.slice(1, -1).split('').map((d) => parseInt(d, 16)) : null,
          vel: accent === '!' ? 1.3 : accent === '?' ? 0.55 : 1,
        });
        voice.steps++;
        voice.lastWasRest = false;
        i += whole.length;
        continue;
      }
      errors.push({ line, msg: `${voice.name}: can't read "${text.slice(i, i + 6)}"` });
      i++;
    }
  }

  function parse(src) {
    const song = {
      meta: { title: 'Untitled', game: '', mood: '', tempo: 120, steps: 4, bar: 16, swing: 0, echo: [0.3, 0.3, 0.25], volume: 0.8 },
      insts: {}, patterns: {}, order: [], loopAt: 0, errors: [], warnings: [],
    };
    const { meta, insts, patterns, errors } = song;
    let pat = null;
    let songLine = null;
    const lines = src.split(/\r?\n/);
    lines.forEach((raw, idx) => {
      const line = idx + 1;
      const text = raw.replace(/;.*$/, '').trim();
      if (!text) return;
      let m;
      if ((m = text.match(/^inst\s+(.*)$/))) { parseInst(m[1], line, errors, insts); return; }
      if ((m = text.match(/^pattern\s+(\S+)\s*$/))) {
        pat = { name: m[1], voices: {}, line };
        if (patterns[m[1]]) errors.push({ line, msg: `pattern ${m[1]} is defined twice` });
        patterns[m[1]] = pat;
        return;
      }
      if (!(m = text.match(/^([a-zA-Z]\w*)\s*:\s*(.*)$/))) {
        errors.push({ line, msg: `can't read this line; expected "key: value", "inst …" or "pattern …"` });
        return;
      }
      const [, key, val] = m;
      if (META_KEYS.has(key)) {
        if (key === 'song') { songLine = { val, line }; return; }
        if (key === 'echo') { meta.echo = val.split(/[\s,]+/).map((x) => num(x, line, errors, 'echo')); return; }
        if (['tempo', 'steps', 'bar', 'swing', 'volume'].includes(key)) { meta[key] = num(val, line, errors, key); return; }
        meta[key] = val;
        return;
      }
      if (!pat) { errors.push({ line, msg: `"${key}:" appears before any pattern` }); return; }
      if (!insts[key]) { errors.push({ line, msg: `no instrument named "${key}"` }); return; }
      const voice = pat.voices[key] || (pat.voices[key] = { name: key, inst: insts[key], events: [], steps: 0, barStart: 0, barNo: 0, lastWasRest: true });
      scanVoice(voice, val, line, meta.bar, errors);
    });

    for (const p of Object.values(patterns)) {
      const lens = Object.values(p.voices).map((v) => v.steps);
      p.length = Math.max(0, ...lens);
      for (const v of Object.values(p.voices)) {
        if (v.steps !== p.length) errors.push({ line: p.line, msg: `pattern ${p.name}: ${v.name} is ${v.steps} steps but the longest voice is ${p.length}` });
      }
      p.byStep = Array.from({ length: p.length }, () => []);
      for (const v of Object.values(p.voices)) for (const e of v.events) p.byStep[e.step].push({ voice: v.name, e });
    }

    if (songLine) {
      const toks = songLine.val.replace(/\[/g, ' [ ').replace(/\]/g, ' ').trim().split(/\s+/);
      for (const t of toks) {
        if (t === '[') { song.loopAt = song.order.length; continue; }
        const mm = t.match(/^([^*]+)(?:\*(\d+))?$/);
        const name = mm ? mm[1] : t;
        if (!patterns[name]) { errors.push({ line: songLine.line, msg: `song uses pattern "${name}", which isn't defined` }); continue; }
        for (let r = 0; r < (mm && mm[2] ? +mm[2] : 1); r++) song.order.push(name);
      }
    } else {
      song.order = Object.keys(patterns);
    }
    if (!song.order.length) errors.push({ line: lines.length, msg: 'nothing to play: add a pattern and a song line' });
    song.voiceNames = Object.keys(insts).filter((n) => song.order.some((p) => patterns[p].voices[n]));
    song.stepDur = 60 / meta.tempo / meta.steps;
    const total = song.order.reduce((s, p) => s + patterns[p].length, 0);
    const intro = song.order.slice(0, song.loopAt).reduce((s, p) => s + patterns[p].length, 0);
    song.seconds = total * song.stepDur;
    song.loopSeconds = (total - intro) * song.stepDur;
    return song;
  }

  // Walks the song forward in time; calls onEvent for each note. Used for audio and for the piano roll.
  function makeCursor(song, startTime) {
    let oi = 0, step = 0, t = startTime, absStep = 0;
    const sd = song.stepDur;
    return {
      get time() { return t; },
      advance(until, onEvent, onStep) {
        if (!song.order.length) return;
        let guard = 0;
        while (t < until && guard++ < 4096) {
          const p = song.patterns[song.order[oi]];
          if (step >= p.length) {
            oi++; step = 0;
            if (oi >= song.order.length) oi = song.loopAt;
            continue;
          }
          const swingOff = absStep % 2 === 1 ? song.meta.swing * sd : 0;
          if (onStep) onStep(t, song.order[oi], step, oi);
          for (const { voice, e } of p.byStep[step]) onEvent(voice, e, t + swingOff, e.len * sd);
          step++; absStep++; t += sd;
        }
      },
    };
  }

  // ---------- Audio ----------

  function Player() {
    this.ctx = null;
    this.muted = new Set();
    this.listeners = [];
  }

  Player.prototype.init = function () {
    if (this.ctx) return;
    const AC = root.AudioContext || root.webkitAudioContext;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.attack.value = 0.003; this.comp.release.value = 0.2;
    this.master.connect(this.comp).connect(ctx.destination);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.comp.connect(this.analyser);
    // SNES-style echo: a feedback delay with a darkening filter in the loop.
    this.echoIn = ctx.createGain();
    this.delay = ctx.createDelay(1.5);
    this.fb = ctx.createGain();
    this.echoLp = ctx.createBiquadFilter();
    this.echoLp.type = 'lowpass'; this.echoLp.frequency.value = 2600;
    this.wet = ctx.createGain();
    this.echoIn.connect(this.delay);
    this.delay.connect(this.echoLp).connect(this.fb).connect(this.delay);
    this.echoLp.connect(this.wet).connect(this.master);
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.waves = {};
  };

  Player.prototype.wave = function (inst) {
    const key = inst.wave === 'square' ? 'sq' + inst.duty : inst.wave;
    if (this.waves[key]) return this.waves[key];
    const N = 64, real = new Float32Array(N), imag = new Float32Array(N);
    if (inst.wave === 'square') {
      for (let n = 1; n < N; n++) real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * inst.duty);
    } else if (inst.wave === 'saw') {
      for (let n = 1; n < N; n++) imag[n] = ((n % 2 ? 1 : -1) * 2) / (n * Math.PI) * 0.8;
    } else if (inst.wave === 'triangle') {
      // 4-bit stepped triangle, like the NES channel: build it, then take its Fourier series.
      const S = 512, s = new Float32Array(S);
      for (let i = 0; i < S; i++) {
        const ph = i / S, tri = ph < 0.5 ? ph * 2 : 2 - ph * 2;
        s[i] = Math.round(tri * 15) / 7.5 - 1;
      }
      for (let n = 1; n < N; n++) {
        let re = 0, im = 0;
        for (let i = 0; i < S; i++) { const a = (2 * Math.PI * n * i) / S; re += s[i] * Math.cos(a); im += s[i] * Math.sin(a); }
        real[n] = (2 * re) / S; imag[n] = (2 * im) / S;
      }
    } else {
      imag[1] = 1;
    }
    return (this.waves[key] = this.ctx.createPeriodicWave(real, imag));
  };

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  Player.prototype.voiceOut = function (inst) {
    const ctx = this.ctx;
    if (!this.chans) this.chans = {};
    if (this.chans[inst.name]) return this.chans[inst.name];
    const g = ctx.createGain();
    let node = g;
    if (inst.lp) {
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = inst.lp; f.Q.value = 0.8;
      node.connect(f); node = f;
    }
    let out = node;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = inst.pan; node.connect(p); out = p;
    }
    out.connect(this.master);
    const send = ctx.createGain();
    send.gain.value = inst.echo;
    out.connect(send).connect(this.echoIn);
    return (this.chans[inst.name] = g);
  };

  Player.prototype.playNote = function (inst, e, t, dur, prevMidi) {
    const ctx = this.ctx, out = this.voiceOut(inst);
    const [a, d, s, r] = inst.env;
    const gateEnd = t + Math.max(0.02, dur * inst.gate);
    const end = gateEnd + r * 3 + 0.05;
    const peak = inst.vol * e.vel;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + a);
    env.gain.setTargetAtTime(peak * s, t + a, Math.max(0.001, d / 3));
    env.gain.setTargetAtTime(0, gateEnd, Math.max(0.001, r / 3));
    env.connect(out);

    const base = mtof(e.midi);
    const setFreq = (param, mult) => {
      if (e.slide && prevMidi != null) {
        param.setValueAtTime(mtof(prevMidi) * mult, t);
        param.exponentialRampToValueAtTime(base * mult, t + inst.glide);
      } else param.setValueAtTime(base * mult, t);
      if (e.arp) {
        let k = 0;
        for (let tt = t; tt < gateEnd; tt += inst.arp, k++) param.setValueAtTime(base * mult * Math.pow(2, e.arp[k % e.arp.length] / 12), tt);
      }
    };

    const oscs = [];
    if (inst.wave === 'noise') {
      const src = ctx.createBufferSource();
      src.buffer = this.noise; src.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = base; bp.Q.value = 2;
      src.connect(bp).connect(env);
      src.start(t); src.stop(end);
      return;
    }
    const detunes = inst.detune ? [-inst.detune, inst.detune] : [0];
    for (const dt of detunes) {
      const o = ctx.createOscillator();
      if (inst.wave === 'sine' || inst.wave === 'fm') o.type = 'sine';
      else o.setPeriodicWave(this.wave(inst));
      o.detune.value = dt;
      setFreq(o.frequency, 1);
      const g = ctx.createGain();
      g.gain.value = 1 / detunes.length;
      o.connect(g).connect(env);
      oscs.push(o);
      if (inst.wave === 'fm') {
        const mod = ctx.createOscillator();
        const mg = ctx.createGain();
        setFreq(mod.frequency, inst.ratio);
        const depth = base * inst.index;
        mg.gain.setValueAtTime(depth, t);
        mg.gain.setTargetAtTime(depth * inst.isus, t + 0.002, Math.max(0.005, inst.idecay / 3));
        mod.connect(mg).connect(o.frequency);
        oscs.push(mod);
      }
    }
    if (inst.vib[1]) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = inst.vib[0];
      lg.gain.setValueAtTime(0, t);
      lg.gain.linearRampToValueAtTime(inst.vib[1] * 100, t + inst.vib[2] + 0.12);
      lfo.connect(lg);
      for (const o of oscs) lg.connect(o.detune);
      oscs.push(lfo);
    }
    for (const o of oscs) { o.start(t); o.stop(end); }
  };

  Player.prototype.playDrum = function (inst, e, t) {
    const ctx = this.ctx, out = this.voiceOut(inst), v = inst.vol * e.vel;
    const tone = (f0, f1, dec, type, gain) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dec * 0.6);
      g.gain.setValueAtTime(v * gain, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dec);
      o.connect(g).connect(out); o.start(t); o.stop(t + dec + 0.02);
    };
    const hiss = (type, freq, q, dec, gain, at) => {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = this.noise;
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      const t0 = t + (at || 0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(v * gain, t0 + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0008, t0 + dec);
      s.connect(f).connect(g).connect(out);
      s.start(t0, Math.random()); s.stop(t0 + dec + 0.02);
    };
    switch (e.drum) {
      case 'k': tone(170, 42, 0.28, 'sine', 1.6); hiss('lowpass', 1200, 0.5, 0.012, 0.6); break;
      case 's': tone(210, 150, 0.09, 'triangle', 0.7); hiss('bandpass', 2200, 0.6, 0.17, 1.1); break;
      case 'h': hiss('highpass', 7500, 0.7, 0.045, 0.45); break;
      case 'o': hiss('highpass', 6500, 0.7, 0.3, 0.4); break;
      case 'c': hiss('highpass', 4200, 0.4, 1.3, 0.5); break;
      case 't': tone(150, 82, 0.3, 'sine', 1.2); break;
      case 'T': tone(230, 130, 0.25, 'sine', 1.1); break;
      case 'p': for (const at of [0, 0.011, 0.022]) hiss('bandpass', 1300, 1.2, 0.09 + at * 4, 0.9, at); break;
      case 'b': tone(420, 360, 0.12, 'sine', 0.9); break;
      case 'B': tone(290, 240, 0.2, 'sine', 1.0); break;
      case 'w': tone(1250, 1150, 0.05, 'triangle', 0.6); break;
      case 'x': hiss('highpass', 5200, 0.6, 0.06, 0.3); break;
    }
  };

  Player.prototype.load = function (song) {
    const wasPlaying = this.playing;
    this.stop();
    this.song = song;
    this.chans = {};
    if (wasPlaying) this.play();
  };

  Player.prototype.play = function () {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.song || this.song.errors.length) return;
    const song = this.song, ctx = this.ctx;
    this.chans = {};
    const [dt, fb, mix] = song.meta.echo;
    this.delay.delayTime.setValueAtTime(dt || 0.3, ctx.currentTime);
    this.fb.gain.setValueAtTime(Math.min(0.85, fb || 0), ctx.currentTime);
    this.wet.gain.setValueAtTime(mix || 0, ctx.currentTime);
    this.master.gain.setValueAtTime(song.meta.volume, ctx.currentTime);
    const start = ctx.currentTime + 0.08;
    this.startTime = start;
    this.audio = makeCursor(song, start);
    this.viz = makeCursor(song, start);
    this.vizNotes = [];
    this.steps = [];
    this.lastMidi = {};
    this.playing = true;
    const tick = () => {
      if (!this.playing) return;
      this.audio.advance(ctx.currentTime + 0.15, (voice, e, t, dur) => {
        if (this.muted.has(voice)) return;
        const inst = song.insts[voice];
        if (inst.wave === 'drums') this.playDrum(inst, e, t);
        else { this.playNote(inst, e, t, dur, this.lastMidi[voice]); this.lastMidi[voice] = e.midi; }
      });
      this.viz.advance(ctx.currentTime + 4, (voice, e, t, dur) => {
        this.vizNotes.push({ voice, midi: e.midi, drum: e.drum, t0: t, t1: t + dur * (song.insts[voice].wave === 'drums' ? 0.5 : 1), vel: e.vel });
      }, (t, pat, step) => this.steps.push({ t, pat, step }));
      const cut = ctx.currentTime - 3;
      while (this.vizNotes.length && this.vizNotes[0].t1 < cut) this.vizNotes.shift();
      while (this.steps.length > 1 && this.steps[1].t < ctx.currentTime) this.steps.shift();
      this.timer = setTimeout(tick, 25);
    };
    tick();
    this.listeners.forEach((f) => f('play'));
  };

  Player.prototype.stop = function () {
    this.playing = false;
    clearTimeout(this.timer);
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(0, now, 0.02);
      // Old notes are already scheduled; fade them out, then rebuild the bus.
      const old = this.master;
      this.master = this.ctx.createGain();
      this.master.connect(this.comp);
      this.wet.disconnect(); this.wet.connect(this.master);
      setTimeout(() => { try { old.disconnect(); } catch (_) { /* already gone */ } }, 200);
      this.fb.gain.setValueAtTime(0, now);
    }
    this.listeners.forEach((f) => f('stop'));
  };

  const api = { parse, makeCursor, Player, DRUM_CHARS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Chiptab = api;
})(typeof window !== 'undefined' ? window : globalThis);

// GameMusic: plays a Chiptab score behind an arcade game.
// The game owns the on/off setting. It calls GameMusic.set(on) whenever its sound setting is known or
// changes. A game with no sound setting adds <button data-music="storage-key" hidden>, which appears once
// this script loads, toggles music and remembers the choice.
// Browsers only start audio after a click or key press, so music waits for the first one.

(function (root) {
  'use strict';
  const { parse, Player } = root.Chiptab;
  const LEVEL = 0.4; // Music sits under each game's sound effects.
  const songs = {};
  let current = null, wanted = null, enabled = false, player = null, buttons = [];

  const activated = () => !root.navigator.userActivation || root.navigator.userActivation.hasBeenActive;

  function start() {
    if (!enabled || !wanted || document.hidden || !activated()) return;
    try {
      if (!player) player = new Player();
      player.init();
      if (player.ctx.state === 'suspended') player.ctx.resume().catch(() => {});
      if (current !== wanted) {
        current = wanted;
        player.load(songs[current]);
      }
      if (!player.playing) player.play();
    } catch (_) { /* Audio is optional. */ }
  }

  function hush() {
    if (player && player.ctx && player.ctx.state === 'running') player.ctx.suspend().catch(() => {});
  }

  function render() {
    for (const b of buttons) {
      b.textContent = enabled ? 'Music on' : 'Music off';
      b.setAttribute('aria-pressed', String(enabled));
    }
  }

  const api = {
    // Registers a score. The first one registered plays unless the game picks another.
    add(id, src) {
      const song = parse(src);
      if (song.errors.length) return;
      song.meta.volume *= LEVEL;
      songs[id] = song;
      if (!wanted) wanted = id;
    },
    // Switches scores, e.g. to a battle theme. Does nothing if that score is already playing.
    track(id) {
      if (!songs[id] || wanted === id) return;
      wanted = id;
      if (enabled && player && player.playing) start();
    },
    set(on) {
      enabled = !!on;
      render();
      if (enabled) start(); else hush();
    },
    get enabled() { return enabled; },
    // For games without a sound setting: a button that toggles music and remembers the choice.
    bind(button, key) {
      if (!button) return;
      let on = true;
      try { const saved = localStorage.getItem(key); if (saved) on = saved === '1'; } catch (_) { /* Storage is optional. */ }
      buttons.push(button);
      button.hidden = false;
      button.addEventListener('click', () => {
        api.set(!enabled);
        try { localStorage.setItem(key, enabled ? '1' : '0'); } catch (_) { /* Storage is optional. */ }
      });
      api.set(on);
    },
  };

  // <button data-music="storage-key"> binds itself, so a game needs no script of its own.
  document.addEventListener('DOMContentLoaded', () => {
    for (const b of document.querySelectorAll('button[data-music]')) api.bind(b, b.dataset.music);
  });
  for (const type of ['pointerdown', 'keydown', 'touchend']) root.addEventListener(type, start, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); else start(); });
  root.GameMusic = api;
})(window);
