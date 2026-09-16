/* Chillion Bucks sound engine: tiny synthesized blips, no audio files. Shared by every page. */
window.SFX = (() => {
  let on = true, menuOpen = false;
  try { on = localStorage.getItem('cb:sound') !== 'off'; } catch (e) { /* storage blocked: default on */ }
  let actx = null, master = null, ambient = null, ambientMode = 'off', unlocked = false;
  const ctx = () => { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if(!master){master=actx.createGain();master.gain.value=on&&!menuOpen?1:0;master.connect(actx.destination);}if (actx.state === 'suspended') actx.resume().catch(()=>{});return actx; };

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
      o.connect(g).connect(master); o.start(t); o.stop(t + dur + .02);
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
      s.connect(f).connect(g).connect(master); s.start(t);
    } catch (e) { /* silent */ }
  }
  const api = {
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('cb:sound', on ? 'on' : 'off'); } catch (e) {} if(master)master.gain.setValueAtTime(on&&!menuOpen?1:0,actx.currentTime);if(on){api.unlock();api.ding();}document.dispatchEvent(new CustomEvent('soundchange'));return on; },
    unlock() { if(!on)return;try{unlocked=true;ctx();api.ambience(ambientMode);}catch{} },
    ambience(mode='off') { ambientMode=mode;if(!actx||!master)return;if(!ambient){const a=actx,buffer=a.createBuffer(1,a.sampleRate*3,a.sampleRate),data=buffer.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=(smooth+Math.random()*.08-.04)/1.02;data[i]=smooth;}const source=a.createBufferSource();source.buffer=buffer;source.loop=true;const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=750;const gain=a.createGain();gain.gain.value=0;source.connect(filter).connect(gain).connect(master);source.start();ambient=gain;}ambient.gain.setTargetAtTime(mode==='water'?.045:0,actx.currentTime,.2); },
    splash() { noise(.45,.065,1100);tone(380,.13,'sine',.03,0,130);tone(640,.16,'sine',.025,.1,240); },
    snap() { noise(.045,.035,2400);tone(540,.06,'triangle',.055);tone(810,.07,'sine',.025,.045); },
    tone, noise,
    ding() { tone(880, .08); tone(1320, .14, 'sine', .07, .08); },
    buzz() { tone(150, .2, 'square', .04); },
    tap() { tone(660, .06, 'sine', .04); },
    fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .09)); },
    // coin drop: metallic clink that climbs with the combo
    clink(combo = 0) { const f = 1100 * Math.pow(1.05, Math.min(combo, 12)); tone(f, .07, 'sine', .08); tone(f * 1.5, .12, 'triangle', .05, .03); tone(f * 2.02, .2, 'sine', .025, .02); },
    // Slot contact, a short fall, then several diminishing inharmonic metal impacts.
    coinDrop(delay = 0) {
      const f = 1550 + Math.random() * 450;
      noise(.035,.022,3400,delay);tone(f*1.4,.045,'sine',.025,delay);
      const fall=.18+Math.random()*.04;
      // The hollow ceramic shell resonates underneath the metallic pile.
      tone(185+Math.random()*45,.19,'sine',.027,delay+fall,125);
      tone(430+Math.random()*80,.12,'sine',.012,delay+fall+.013);
      [0,.075,.135,.18,.215].forEach((offset,i)=>{
        const t=delay+fall+offset,amp=.075*Math.pow(.58,i),pitch=f*(.88+Math.random()*.24);
        tone(pitch,.22-i*.025,'sine',amp,t);
        tone(pitch*2.37,.12,'sine',amp*.33,t);
        tone(pitch*3.91,.075,'sine',amp*.12,t);
        tone(290+Math.random()*90,.085,'sine',amp*.25,t);
        noise(.025,amp*.23,4500,t);
      });
    },
    cashDrop(delay = 0) {
      [0,.055,.12,.19].forEach((t,i)=>noise(.075,.035-i*.005,1300+Math.random()*1600,delay+t));
      tone(190,.13,'sine',.055,delay+.23,85);
      tone(660,.12,'sine',.025,delay+.32);tone(880,.16,'sine',.022,delay+.43);
    },
    flipper() { noise(.025,.028,1700);tone(130,.045,'triangle',.035); },
    bumper(index=0) { tone([659,784,988][index%3],.16,'sine',.065);tone(160,.05,'triangle',.025); },
    slurp() { tone(700, .2, 'sine', .06, 0, 180); },
    whoosh() { noise(.18, .03, 900); },
    pop() { tone(400, .08, 'sine', .06, 0, 900); },
    levelUp() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .16, 'triangle', .07, i * .07)); noise(.3, .03, 3000, .2); },
    cheer() { for (let i = 0; i < 7; i++) noise(.14, .035, 1200 + Math.random() * 1800, i * .07); [784, 988, 1175, 1568].forEach((f, i) => tone(f, .22, 'triangle', .06, .1 + i * .08)); },
    chaChing() { tone(1568, .06, 'square', .03); tone(2093, .25, 'sine', .07, .06); tone(2637, .3, 'sine', .04, .08); },
    bind(btn) { if (!btn) return; const paint = () => { btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-pressed', on); }; btn.addEventListener('click', () => { api.toggle(); paint(); });document.addEventListener('soundchange',paint);paint(); },
  };
  document.addEventListener('pointerdown',()=>api.unlock(),{once:true,passive:true});document.addEventListener('keydown',()=>api.unlock(),{once:true});document.addEventListener('visibilitychange',()=>{if(!actx)return;if(document.hidden)actx.suspend();else if(unlocked&&on)actx.resume().catch(()=>{});});
  document.addEventListener('cb:menu-open',()=>{menuOpen=true;if(master)master.gain.setValueAtTime(0,actx.currentTime);});
  document.addEventListener('cb:menu-close',()=>{menuOpen=false;if(master)master.gain.setValueAtTime(on?1:0,actx.currentTime);});
  return api;
})();
