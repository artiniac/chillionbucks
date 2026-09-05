/* Chillion Bucks sound engine: tiny synthesized blips, no audio files. Shared by every page. */
window.SFX = (() => {
  let on = true;
  try { on = localStorage.getItem('cb:sound') !== 'off'; } catch (e) { /* storage blocked: default on */ }
  let actx = null;
  const ctx = () => { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; };

  function tone(freq, dur = .12, type = 'sine', gain = .07, when = 0, glideTo = null) {
    if (!on) return;
    try {
      const a = ctx(); const o = a.createOscillator(), g = a.createGain();
      o.type = type; const t = a.currentTime + when;
      o.frequency.setValueAtTime(freq, t);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
    } catch (e) { /* no audio, no problem */ }
  }
  function noise(dur = .25, gain = .04, freq = 1800, when = 0) {
    if (!on) return;
    try {
      const a = ctx(); const buf = a.createBuffer(1, Math.ceil(a.sampleRate * dur), a.sampleRate);
      const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(); s.buffer = buf;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .8;
      const g = a.createGain(); const t = a.currentTime + when;
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f).connect(g).connect(a.destination); s.start(t);
    } catch (e) { /* silent */ }
  }
  const api = {
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('cb:sound', on ? 'on' : 'off'); } catch (e) {} if (on) api.ding(); return on; },
    tone, noise,
    ding() { tone(880, .08); tone(1320, .14, 'sine', .07, .08); },
    buzz() { tone(150, .2, 'square', .04); },
    tap() { tone(660, .06, 'sine', .04); },
    fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .09)); },
    // coin drop: metallic clink that climbs with the combo
    clink(combo = 0) { const f = 1100 * Math.pow(1.05, Math.min(combo, 12)); tone(f, .07, 'sine', .08); tone(f * 1.5, .12, 'triangle', .05, .03); tone(f * 2.02, .2, 'sine', .025, .02); },
    slurp() { tone(700, .2, 'sine', .06, 0, 180); },
    whoosh() { noise(.18, .03, 900); },
    pop() { tone(400, .08, 'sine', .06, 0, 900); },
    levelUp() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .16, 'triangle', .07, i * .07)); noise(.3, .03, 3000, .2); },
    cheer() { for (let i = 0; i < 7; i++) noise(.14, .035, 1200 + Math.random() * 1800, i * .07); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .22, 'triangle', .06, .1 + i * .08)); },
    chaChing() { tone(1568, .06, 'square', .03); tone(2093, .25, 'sine', .07, .06); tone(2637, .3, 'sine', .04, .08); },
    bind(btn) { if (!btn) return; const paint = () => { btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-pressed', on); }; btn.addEventListener('click', () => { api.toggle(); paint(); }); paint(); },
  };
  return api;
})();
