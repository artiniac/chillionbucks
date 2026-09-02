/* Chillion Bucks: all the fun lives here. Plain JavaScript, no build step, no libraries. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');

  /* ---------------- sound (synthesized, no audio files) ---------------- */
  let soundOn = localStorage.getItem('cb:sound') !== 'off';
  let actx = null;
  function tone(freq, dur = .12, type = 'sine', gain = .07, when = 0) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      o.connect(g).connect(actx.destination);
      const t = actx.currentTime + when;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + .01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + .02);
    } catch (e) { /* no audio, no problem */ }
  }
  const ding = () => { tone(880, .08); tone(1320, .14, 'sine', .07, .08); };
  const buzz = () => tone(150, .2, 'square', .04);
  const fanfare = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .2, 'triangle', .07, i * .09));
  const soundBtn = $('#soundBtn');
  function paintSound() { soundBtn.textContent = soundOn ? '🔊' : '🔇'; soundBtn.setAttribute('aria-pressed', soundOn); }
  soundBtn.addEventListener('click', () => { soundOn = !soundOn; localStorage.setItem('cb:sound', soundOn ? 'on' : 'off'); paintSound(); if (soundOn) ding(); });
  paintSound();

  /* ---------------- coin rain in the hero ---------------- */
  (function coinRain() {
    const cv = $('#coinRain'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, coins = [], raf = null;
    const count = () => Math.max(10, Math.min(30, Math.floor(innerWidth / 45)));
    const mk = (fresh) => ({
      x: Math.random() * W, y: fresh ? -40 : Math.random() * H,
      r: 10 + Math.random() * 12, vy: .6 + Math.random() * 1.2,
      a: Math.random() * Math.PI * 2, va: .02 + Math.random() * .04,
      sw: Math.random() * Math.PI * 2, alpha: .55 + Math.random() * .45,
    });
    function resize() {
      const r = cv.parentElement.getBoundingClientRect();
      W = cv.width = Math.max(1, Math.floor(r.width)); H = cv.height = Math.max(1, Math.floor(r.height));
      coins = Array.from({ length: count() }, () => mk(false));
      if (reduced) draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const c of coins) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.globalAlpha = c.alpha;
        const sx = Math.max(.15, Math.abs(Math.cos(c.a)));
        ctx.scale(sx, 1);
        const g = ctx.createRadialGradient(-c.r * .3, -c.r * .3, c.r * .1, 0, 0, c.r);
        g.addColorStop(0, '#fef3c7'); g.addColorStop(.6, '#fbbf24'); g.addColorStop(1, '#b45309');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#b45309'; ctx.stroke();
        if (sx > .55) { ctx.fillStyle = '#b45309'; ctx.font = `900 ${c.r * 1.2}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1); }
        ctx.restore();
      }
    }
    function step() {
      for (const c of coins) {
        c.y += c.vy; c.a += c.va; c.sw += .02; c.x += Math.sin(c.sw) * .4;
        if (c.y > H + 40) Object.assign(c, mk(true));
      }
      draw();
      raf = requestAnimationFrame(step);
    }
    addEventListener('resize', resize, { passive: true });
    resize();
    if (!reduced) {
      // pause when the hero is off screen
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(step); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; }
      }).observe(cv);
    }
  })();

  /* ---------------- bouncy title ---------------- */
  (function title() {
    const t = $('#heroTitle'); if (!t) return;
    const words = t.textContent.trim().split(/\s+/);
    t.textContent = '';
    let i = 0;
    words.forEach(w => {
      const ws = document.createElement('span'); ws.className = 'w';
      [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'l'; s.textContent = ch; s.style.setProperty('--d', (i++ * .06) + 's'); ws.appendChild(s); });
      t.appendChild(ws);
    });
  })();

  /* ---------------- scroll reveal ---------------- */
  {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
    $$('[data-reveal]').forEach(el => io.observe(el));
  }

  /* ---------------- confetti ---------------- */
  const confetti = (() => {
    const cv = $('#confetti'); const ctx = cv.getContext('2d');
    let parts = [], raf = null;
    const cols = ['#22c55e', '#a3e635', '#fbbf24', '#4ade80', '#ffffff', '#f472b6'];
    function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    return function burst(n = 140) {
      if (reduced) return;
      cv.width = innerWidth; cv.height = innerHeight;
      for (let i = 0; i < n; i++) parts.push({ x: innerWidth / 2 + (Math.random() - .5) * 240, y: innerHeight * .45, vx: (Math.random() - .5) * 14, vy: -(6 + Math.random() * 10), r: 5 + Math.random() * 6, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 110 + Math.random() * 40 });
      if (!raf) tick();
    };
  })();

  /* ---------------- game 1: Piggy Bank Power ---------------- */
  (function piggy() {
    const GOALS = [
      { e: '🧸', n: 'Big Teddy', c: 25 }, { e: '🛴', n: 'Scooter', c: 50 },
      { e: '🎮', n: 'Video Game', c: 60 }, { e: '🚲', n: 'Bike', c: 100 },
    ];
    const TEMPTS = [
      { e: '🍭', n: 'Candy', c: 3 }, { e: '🍦', n: 'Ice cream', c: 4 }, { e: '🎈', n: 'Balloon', c: 2 },
      { e: '🧃', n: 'Juice box', c: 2 }, { e: '🍩', n: 'Donut', c: 3 }, { e: '🎁', n: 'Mystery toy', c: 5 },
    ];
    const CHEERS = ['Nice stack!', 'Keep going!', 'Saving is a superpower.', 'Chill level rising…', 'Ka-ching!', 'Future you says thanks.'];
    let goal = GOALS[1], saved = 0, done = false, cur = null;
    const goalRow = $('#goalRow'), amtEl = $('#piggyAmt'), barEl = $('#piggyBar'), labelEl = $('#piggyGoalLabel'),
      msgEl = $('#piggyMsg'), tempt = $('#tempt'), btn = $('#piggyBtn'), svg = $('.piggy-svg');
    const say = (t, bad) => { msgEl.textContent = t; msgEl.classList.toggle('bad', !!bad); };
    function renderGoals() {
      goalRow.innerHTML = '';
      GOALS.forEach(g => {
        const b = document.createElement('button'); b.className = 'goal'; b.type = 'button';
        b.textContent = `${g.e} ${g.n} $${g.c}`; b.setAttribute('aria-pressed', g === goal);
        b.onclick = () => { goal = g; done = false; renderGoals(); update(); say(`New goal: ${g.e} ${g.n} for $${g.c}!`); };
        goalRow.appendChild(b);
      });
    }
    function update() {
      amtEl.textContent = '$' + saved;
      barEl.style.width = Math.min(100, saved / goal.c * 100) + '%';
      labelEl.textContent = saved >= goal.c ? `${goal.e} ${goal.n}: GOT IT! 🎉` : `${goal.e} ${goal.n}: $${saved} of $${goal.c}`;
      if (saved >= goal.c && !done) {
        done = true; fanfare(); confetti();
        say(`YOU DID IT! You saved $${goal.c} for the ${goal.n}! ${goal.e} Pick a new goal or keep stacking.`);
      }
    }
    function fly(e) {
      const box = svg.getBoundingClientRect();
      const fromX = e.clientX || (box.left + box.width / 2), fromY = e.clientY || (box.top + box.height);
      const toX = box.left + box.width * .45, toY = box.top + box.height * .2;
      const c = document.createElement('div'); c.className = 'fly'; c.textContent = '$';
      c.style.left = (fromX - 17) + 'px'; c.style.top = (fromY - 17) + 'px';
      document.body.appendChild(c);
      const anim = c.animate(
        [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${toX - fromX}px,${toY - fromY}px) scale(.35)`, opacity: .3 }],
        { duration: reduced ? 1 : 420, easing: 'cubic-bezier(.2,.8,.3,1)' });
      anim.onfinish = () => c.remove();
    }
    btn.addEventListener('click', e => {
      if (!tempt.classList.contains('hidden')) { say('Decide first: spend or keep saving?'); return; }
      saved++; ding(); fly(e);
      svg.classList.remove('wiggle'); void svg.offsetWidth; svg.classList.add('wiggle');
      update();
      if (saved < goal.c) {
        if (saved % 10 === 0) showTempt();
        else if (saved % 5 === 0) say(pick(CHEERS));
      }
    });
    function showTempt() {
      cur = pick(TEMPTS);
      $('#temptEmoji').textContent = cur.e;
      $('#temptText').textContent = `${cur.n} for $${cur.c}!`;
      $('#temptSpend').textContent = `Spend $${cur.c}`;
      tempt.classList.remove('hidden');
      say('Uh oh… temptation!');
    }
    $('#temptSpend').onclick = () => { saved = Math.max(0, saved - cur.c); buzz(); tempt.classList.add('hidden'); say(`Yum! But now you’re $${cur.c} further from the ${goal.n}. ${goal.e}`, true); update(); };
    $('#temptKeep').onclick = () => { saved += 1; ding(); tempt.classList.add('hidden'); say('Patience pays! Waiting earned you a bonus buck. 💚'); update(); };
    $('#piggyReset').onclick = () => { saved = 0; done = false; tempt.classList.add('hidden'); update(); say('Tap tap tap!'); };
    renderGoals(); update();
  })();

  /* ---------------- game 2: Need or Want ---------------- */
  (function needWant() {
    const ITEMS = [
      { e: '🍎', n: 'An apple', a: 'need', w: 'Food keeps your body going.' },
      { e: '🧸', n: 'A new teddy bear', a: 'want', w: 'Fun to have, but you can live without it.' },
      { e: '💧', n: 'Water', a: 'need', w: 'Your body needs water every single day.' },
      { e: '🍦', n: 'Ice cream', a: 'want', w: 'Yummy treat, not a must-have.' },
      { e: '🏠', n: 'A home', a: 'need', w: 'Everyone needs a safe place to sleep.' },
      { e: '🎮', n: 'A video game', a: 'want', w: 'Super fun, and totally a want.' },
      { e: '🧥', n: 'A warm coat in winter', a: 'need', w: 'Staying warm keeps you healthy.' },
      { e: '🍭', n: 'A lollipop', a: 'want', w: 'Sweet! And definitely a want.' },
      { e: '🪥', n: 'A toothbrush', a: 'need', w: 'Healthy teeth are a must.' },
      { e: '🚀', n: 'A rocket toy', a: 'want', w: 'Blast off… into the want pile.' },
      { e: '👟', n: 'Shoes that fit', a: 'need', w: 'Your feet need protecting.' },
      { e: '🎈', n: 'A balloon', a: 'want', w: 'Fun for a day, not a need.' },
      { e: '💊', n: 'Medicine when you’re sick', a: 'need', w: 'Getting better matters.' },
      { e: '🍕', n: 'Pizza every Friday', a: 'want', w: 'Food is a need, but pizza EVERY Friday is a want.' },
      { e: '📚', n: 'School books', a: 'need', w: 'Learning helps you grow.' },
      { e: '🐶', n: 'A puppy', a: 'want', w: 'Adorable, and a big responsibility. A want.' },
      { e: '🥦', n: 'Vegetables', a: 'need', w: 'Healthy food is a need (yes, even broccoli).' },
      { e: '🎂', n: 'A giant birthday cake', a: 'want', w: 'Delicious want!' },
      { e: '🛏️', n: 'A bed to sleep in', a: 'need', w: 'Sleep is how you grow and recharge.' },
      { e: '🎧', n: 'Fancy headphones', a: 'want', w: 'Cool, but a want.' },
    ];
    let deck = [], idx = 0, score = 0, streak = 0, locked = false;
    const card = $('#nwCard'), msg = $('#nwMsg'), bNeed = $('#nwNeed'), bWant = $('#nwWant');
    const say = (t, bad) => { msg.textContent = t; msg.classList.toggle('bad', !!bad); };
    function show() {
      const it = deck[idx];
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      $('#nwEmoji').textContent = it.e; $('#nwName').textContent = it.n;
    }
    function start() {
      deck = shuffle(ITEMS).slice(0, 10); idx = 0; score = 0; streak = 0; locked = false;
      $('#nwScore').textContent = 0; $('#nwStreak').textContent = 0; $('#nwTotal').textContent = deck.length;
      bNeed.disabled = false; bWant.disabled = false; say(''); show();
    }
    function answer(a) {
      if (locked) return; locked = true;
      const it = deck[idx];
      if (a === it.a) { score++; streak++; ding(); say(`✅ ${it.a.toUpperCase()}! ${it.w}`); }
      else { streak = 0; buzz(); say(`❌ It’s a ${it.a.toUpperCase()}. ${it.w}`, true); }
      $('#nwScore').textContent = score; $('#nwStreak').textContent = streak;
      setTimeout(() => { locked = false; idx++; if (idx >= deck.length) end(); else show(); }, 1500);
    }
    function end() {
      const perfect = score === deck.length;
      $('#nwEmoji').textContent = perfect ? '🏆' : (score >= 7 ? '🌟' : '💪');
      $('#nwName').textContent = `You got ${score} of ${deck.length}!`;
      say(perfect ? 'PERFECT! You know your needs from your wants. 😎' : (score >= 7 ? 'Great job! Play again and go for perfect.' : 'Good try! Needs keep you safe and healthy. Wants are the fun extras.'));
      if (perfect) { fanfare(); confetti(); }
      bNeed.disabled = true; bWant.disabled = true;
    }
    bNeed.onclick = () => answer('need'); bWant.onclick = () => answer('want');
    $('#nwReset').onclick = start;
    start();
  })();

  /* ---------------- game 3: Coin Counter ---------------- */
  (function coinCounter() {
    const COINS = [{ n: 'penny', v: 1 }, { n: 'nickel', v: 5 }, { n: 'dime', v: 10 }, { n: 'quarter', v: 25 }];
    const DELTAS = [1, 4, 5, 9, 10, 15, 20, 25];
    let score = 0, locked = false;
    const tray = $('#coinTray'), row = $('#coinAnswers'), msg = $('#coinMsg');
    const say = (t, bad) => { msg.textContent = t; msg.classList.toggle('bad', !!bad); };
    function round() {
      locked = false; say('');
      const n = 1 + Math.floor(Math.random() * 4);
      const set = Array.from({ length: n }, () => pick(COINS));
      const total = set.reduce((s, c) => s + c.v, 0);
      tray.innerHTML = '';
      set.forEach((c, i) => { const d = document.createElement('div'); d.className = 'coin ' + c.n; d.textContent = c.v + '¢'; d.title = c.n; d.style.animationDelay = (i * .08) + 's'; tray.appendChild(d); });
      const opts = new Set([total]); let guard = 0;
      while (opts.size < 3 && guard++ < 60) { const v = total + pick(DELTAS) * (Math.random() < .5 ? -1 : 1); if (v > 0) opts.add(v); }
      row.innerHTML = '';
      shuffle([...opts]).forEach(v => {
        const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = v + '¢';
        b.onclick = () => {
          if (locked) return; locked = true;
          if (v === total) { score++; ding(); say(`✅ Yes! ${total}¢${total >= 100 ? ', that’s a whole dollar or more!' : ''}`); if (score % 5 === 0) { fanfare(); confetti(90); } }
          else { score = 0; buzz(); say(`❌ Not quite. Count again: it’s ${total}¢.`, true); }
          $('#coinScore').textContent = score;
          setTimeout(round, 1800);
        };
        row.appendChild(b);
      });
    }
    round();
  })();

  /* ---------------- game 4: The Chill-o-Meter ---------------- */
  (function meter() {
    const wk = $('#wk'), yr = $('#yr'); if (!wk || !yr) return;
    const RATE = 1.07, CHILLION = 1e6;
    const tower = $('#tower');
    for (let i = 0; i < 24; i++) tower.appendChild(document.createElement('i'));
    function count(el, to) {
      const from = +el.dataset.v || 0; el.dataset.v = to;
      if (reduced) { el.textContent = money(to); return; }
      const t0 = performance.now(), dur = 380;
      (function f(now) { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = money(from + (to - from) * e); if (p < 1) requestAnimationFrame(f); })(t0);
    }
    function calc() {
      const w = +wk.value, y = +yr.value;
      $('#wkOut').textContent = '$' + w; $('#yrOut').textContent = y;
      const put = w * 52 * y;
      let bal = 0; for (let i = 0; i < y; i++) bal = (bal + w * 52) * RATE;
      count($('#putIn'), put); count($('#grew'), bal - put); count($('#total'), bal);
      const pct = Math.max(4, Math.min(100, Math.log10(Math.max(10, bal)) / 6 * 100));
      $('#chillFill').style.width = pct + '%';
      $('#chillLabel').textContent = bal < 1e3 ? 'Kinda chill 🙂' : bal < 1e4 ? 'Pretty chill 😌' : bal < 1e5 ? 'Very chill 🏖️' : bal < CHILLION ? 'Super chill 🌴' : 'CHILLION MODE 😎💚';
      let b2 = 0, n = 0; while (b2 < CHILLION && n < 200) { b2 = (b2 + w * 52) * RATE; n++; }
      $('#chillYears').textContent = n >= 200
        ? `At $${w} a week it would take more than 200 years to reach a game Chillion ($1,000,000). Try saving a little more!`
        : `Keep saving $${w} a week and you would reach a game Chillion ($1,000,000) in about ${n} years.${n <= y ? ' You’re already there in this game! 🎉' : ''}`;
      [...tower.children].forEach((bar, i) => { bar.style.height = Math.max(6, pct * (0.35 + 0.65 * (i + 1) / 24)) + '%'; });
    }
    wk.addEventListener('input', calc); yr.addEventListener('input', calc);
    calc();
  })();

  /* ---------------- videos (from videos.js) ---------------- */
  (function videos() {
    const vids = Array.isArray(window.CHILLION_VIDEOS) ? window.CHILLION_VIDEOS.filter(v => v && v.id && v.topic) : [];
    const tabs = $('#videoTabs'), grid = $('#videoGrid'); if (!tabs || !grid) return;
    if (!vids.length) { grid.innerHTML = '<p class="watch-note">No videos yet. Add some in videos.js.</p>'; return; }
    const topics = [...new Set(vids.map(v => v.topic))];
    let cur = topics[0], playing = null;
    function renderTabs() {
      tabs.innerHTML = '';
      topics.forEach(tp => {
        const b = document.createElement('button'); b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab');
        b.textContent = tp; b.setAttribute('aria-selected', tp === cur);
        b.onclick = () => { cur = tp; playing = null; renderTabs(); renderGrid(); };
        tabs.appendChild(b);
      });
    }
    function thumb(v) {
      return `<img loading="lazy" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt=""><button class="play" type="button" aria-label="Play ${esc(v.title)}"><span>▶</span></button>`;
    }
    function renderGrid() {
      grid.innerHTML = '';
      vids.filter(v => v.topic === cur).forEach((v, i) => {
        const el = document.createElement('article'); el.className = 'vid'; el.style.animationDelay = (i * .05) + 's';
        el.innerHTML = `<div class="media">${thumb(v)}</div><div class="info"><div class="t">${esc(v.title)}</div><div class="by">${esc(v.by || 'YouTube')}</div></div>`;
        el.querySelector('.play').onclick = () => {
          if (playing && playing !== el) { playing.querySelector('.media').innerHTML = thumb(playing._v); playing.querySelector('.play').onclick = playing._play; }
          playing = el; el._v = v; el._play = el.querySelector('.play').onclick;
          el.querySelector('.media').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(v.id)}?autoplay=1&rel=0&modestbranding=1" title="${esc(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
        };
        grid.appendChild(el);
      });
    }
    renderTabs(); renderGrid();
  })();

  /* ---------------- glossary flip cards ---------------- */
  (function glossary() {
    const WORDS = [
      { w: 'Earn', e: '💪', d: 'Getting money by doing work, like chores or a lemonade stand.' },
      { w: 'Save', e: '🐷', d: 'Keeping money for later instead of spending it right now.' },
      { w: 'Spend', e: '🛒', d: 'Trading your money for something you need or want.' },
      { w: 'Share', e: '💝', d: 'Giving some money to help people or causes you care about.' },
      { w: 'Budget', e: '📋', d: 'A plan for your money: some to save, some to spend, some to share.' },
      { w: 'Interest', e: '🌱', d: 'Baby money your money makes when you let it grow in a bank or investment.' },
      { w: 'Goal', e: '🎯', d: 'Something you are saving up for. Goals make saving fun!' },
      { w: 'Chillion', e: '😎', d: 'When you can chill all day and STILL have a lot of money. Leo made this word.' },
    ];
    const g = $('#glossary'); if (!g) return;
    WORDS.forEach(x => {
      const b = document.createElement('button'); b.className = 'card'; b.type = 'button'; b.setAttribute('aria-label', `${x.w}: tap to flip`);
      b.innerHTML = `<div class="in"><div class="face front"><div><span class="e">${x.e}</span>${esc(x.w)}</div></div><div class="face back">${esc(x.d)}</div></div>`;
      b.onclick = () => { b.classList.toggle('flipped'); tone(660, .06, 'sine', .04); };
      g.appendChild(b);
    });
  })();
})();
