/* Chillion Bucks: all the fun lives here. Plain JavaScript, no build step, no libraries.
   Shared pieces: sfx.js (sounds) and wallet.js (the bucks saved in the piggy, spent in the Builder). */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + Math.round(n).toLocaleString('en-US');
  const SFX = window.SFX, Wallet = window.Wallet;

  SFX.bind($('#soundBtn'));

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
        ctx.save(); ctx.translate(c.x, c.y); ctx.globalAlpha = c.alpha;
        const sx = Math.max(.15, Math.abs(Math.cos(c.a))); ctx.scale(sx, 1);
        const g = ctx.createRadialGradient(-c.r * .3, -c.r * .3, c.r * .1, 0, 0, c.r);
        g.addColorStop(0, '#fef3c7'); g.addColorStop(.6, '#fbbf24'); g.addColorStop(1, '#b45309');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, c.r, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#b45309'; ctx.stroke();
        if (sx > .55) { ctx.fillStyle = '#b45309'; ctx.font = `900 ${c.r * 1.2}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1); }
        ctx.restore();
      }
    }
    function step() {
      for (const c of coins) { c.y += c.vy; c.a += c.va; c.sw += .02; c.x += Math.sin(c.sw) * .4; if (c.y > H + 40) Object.assign(c, mk(true)); }
      draw(); raf = requestAnimationFrame(step);
    }
    addEventListener('resize', resize, { passive: true }); resize();
    if (!reduced) new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(step); } else if (raf) { cancelAnimationFrame(raf); raf = null; } }).observe(cv);
  })();

  /* ---------------- bouncy title ---------------- */
  (function title() {
    const t = $('#heroTitle'); if (!t) return;
    const words = t.textContent.trim().split(/\s+/); t.textContent = ''; let i = 0;
    words.forEach(w => { const ws = document.createElement('span'); ws.className = 'w'; [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'l'; s.textContent = ch; s.style.setProperty('--d', (i++ * .06) + 's'); ws.appendChild(s); }); t.appendChild(ws); });
  })();

  /* ---------------- scroll reveal ---------------- */
  {
    if (!('IntersectionObserver' in window)) { $$('[data-reveal]').forEach(el => el.classList.add('in')); }
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .05 });
      $$('[data-reveal]').forEach(el => io.observe(el));
    }
  }

  /* ---------------- confetti ---------------- */
  const confetti = (() => {
    const cv = $('#confetti'); const ctx = cv.getContext('2d');
    let parts = [], raf = null;
    const cols = ['#22c55e', '#a3e635', '#fbbf24', '#4ade80', '#ffffff', '#f472b6'];
    function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr; p.life--;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    return function burst(n = 140, at) {
      if (reduced) return;
      cv.width = innerWidth; cv.height = innerHeight;
      const ox = at ? at.x : innerWidth / 2, oy = at ? at.y : innerHeight * .45;
      for (let i = 0; i < n; i++) parts.push({ x: ox + (Math.random() - .5) * 120, y: oy, vx: (Math.random() - .5) * 14, vy: -(6 + Math.random() * 10), r: 5 + Math.random() * 6, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 110 + Math.random() * 40 });
      if (!raf) tick();
    };
  })();

  /* ---------------- game 1: Piggy Bank Power (drag the coins in!) ---------------- */
  (function piggy() {
    // Real things to save for come from goals.js (a grown-up edits it: picture, price, store link)
    const normGoal = g => ({ id: String(g.id), e: g.e || '🎁', n: g.name || g.n || g.id, c: Math.round(+g.price || +g.c || 0), img: g.img || '', url: g.url || '', mine: !!g.mine });
    const readParentGoals = () => { try { const a = JSON.parse(localStorage.getItem('cb:goals') || '[]'); return Array.isArray(a) ? a.map(g => normGoal({ ...g, mine: true })).filter(g => g.c > 0) : []; } catch (e) { return []; } };
    const GOALS = [];
    function loadGoals() { GOALS.length = 0; readParentGoals().forEach(g => GOALS.push(g)); (window.CHILLION_GOALS || []).filter(g => g && g.id && g.price > 0).forEach(g => { if (!GOALS.some(x => x.id === g.id)) GOALS.push(normGoal(g)); }); if (!GOALS.length) GOALS.push({ id: 'scooter', e: '🛴', n: 'Scooter', c: 50 }, { id: 'bike', e: '🚲', n: 'Bike', c: 120 }); }
    loadGoals();
    const TEMPTS = [
      { e: '🍭', n: 'Candy', c: 3 }, { e: '🍦', n: 'Ice cream', c: 4 }, { e: '🎈', n: 'Balloon', c: 2 },
      { e: '🧃', n: 'Juice box', c: 2 }, { e: '🍩', n: 'Donut', c: 3 }, { e: '🎁', n: 'Mystery toy', c: 5 },
    ];
    const COMBO = ['Nice!', 'Sweet!', 'Great job!', 'Awesome!', 'Amazing!', 'On fire! 🔥', 'Unstoppable!', 'CHILLION MODE! 😎'];
    const CHEERS = ['Saving is a superpower.', 'Future you says thanks.', 'Every buck counts!', 'Keep stacking!', 'Chill level rising…', 'You are a saver!'];
    const stage = $('#piggyStage'); if (!stage) return;
    const tray = $('#coinTray'), piggyEl = $('#piggyWrap'), svg = $('.piggy-svg'), pupil = $('#pupil'),
      amtEl = $('#piggyAmt'), barEl = $('#piggyBar'), labelEl = $('#piggyGoalLabel'), msgEl = $('#piggyMsg'),
      tempt = $('#tempt'), goalRow = $('#goalRow'), builderLink = $('#piggyBuild');
    let goal = GOALS.find(g => g.id === Wallet.goal()) || GOALS.find(g => g.n === Wallet.goal()) || GOALS[0];
    let picked = !!localStorage.getItem('cb:goalPicked');
    let saved = Wallet.get(), done = saved >= goal.c, cur = null, combo = 0, lastDrop = 0, dragging = false;

    const say = (t, bad) => { msgEl.textContent = t; msgEl.classList.toggle('bad', !!bad); msgEl.classList.remove('pop'); void msgEl.offsetWidth; msgEl.classList.add('pop'); };
    function renderGoals() {
      goalRow.innerHTML = '';
      GOALS.forEach(g => {
        const b = document.createElement('button'); b.className = 'goal-card' + (saved >= g.c ? ' reached' : ''); b.type = 'button';
        b.innerHTML = `<span class="gimg">${g.img ? `<img src="${esc(g.img)}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('${g.e}'))">` : g.e}</span><b>${esc(g.n)}</b><i>$${g.c}</i>${g.mine ? '<em class="gmine" title="Added by a grown-up">👨‍👩‍👧</em>' : ''}`;
        b.setAttribute('aria-pressed', g === goal); b.setAttribute('aria-label', `${g.n}, $${g.c}`);
        b.onclick = () => { goal = g; Wallet.setGoal(g.id); done = saved >= goal.c; picked = true; try { localStorage.setItem('cb:goalPicked', '1'); } catch (e) {} renderGoals(); update(); SFX.tap(); say(`You are saving for the ${g.n}! ${g.e} $${g.c}. Let’s go!`); };
        goalRow.appendChild(b);
      });
      $('#goalHint').hidden = picked;
    }
    function renderGoalDone() {
      const box = $('#goalDone'); if (!box) return;
      if (saved < goal.c) { box.hidden = true; return; }
      box.hidden = false; box.innerHTML = `<span class="gbig">${goal.img ? `<img src="${esc(goal.img)}" alt="">` : goal.e}</span><div><b>You saved $${goal.c} for the ${esc(goal.n)}! 🎉</b><small>That took real work. Make your certificate and show a grown-up.</small></div><div class="row"><button type="button" class="btn btn-sm" id="certBtn">🏅 Make my certificate</button>${goal.url ? `<a class="btn btn-sm btn-alt" href="${esc(goal.url)}" target="_blank" rel="noopener noreferrer">🛒 Grown-up: open the store</a>` : ''}</div>`;
      $('#certBtn').onclick = () => makeCertificate(goal);
    }
    // ---- grown-ups add REAL goals: a store link, a name, a price, and (optionally) the product photo's link ----
    const form = $('#goalForm');
    if (form) form.addEventListener('submit', e => {
      e.preventDefault();
      const url = form.url.value.trim(), name = form.gname.value.trim(), price = Math.round(+form.price.value), img = form.img.value.trim();
      if (!name || !(price > 0)) { say('Give the goal a name and a price.', true); return; }
      if (url && !/^https?:\/\//i.test(url)) { say('The store link has to start with https://', true); return; }
      if (img && !/^https?:\/\/.+\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(img) && !/^https?:\/\/m\.media-amazon\.com\//i.test(img)) { say('The photo link should end in .jpg or .png (long-press the product photo and copy its address).', true); return; }
      const asin = (url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i) || [])[1];
      const g = { id: 'g_' + (asin || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) + '-' + Date.now().toString(36)), name, price, url, img, e: '🎁' };
      const mine = readParentGoals().map(x => ({ id: x.id, name: x.n, price: x.c, url: x.url, img: x.img, e: x.e })); mine.unshift(g);
      try { localStorage.setItem('cb:goals', JSON.stringify(mine)); } catch (err) {}
      form.reset(); loadGoals(); goal = GOALS[0]; Wallet.setGoal(goal.id); done = saved >= goal.c; renderGoals(); update(); SFX.levelUp(); say(`Added: ${name} for $${price}. Tap it to save for it! 🎯`);
    });
    goalRow.addEventListener('click', e => {
      const x = e.target.closest('.gmine'); if (!x) return; e.stopPropagation(); e.preventDefault();
      const card = x.closest('.goal-card'); const idx = [...goalRow.children].indexOf(card); const g = GOALS[idx]; if (!g || !g.mine) return;
      if (!confirm(`Remove the goal "${g.n}"?`)) return;
      try { localStorage.setItem('cb:goals', JSON.stringify(readParentGoals().filter(p => p.id !== g.id).map(p => ({ id: p.id, name: p.n, price: p.c, url: p.url, img: p.img, e: p.e })))); } catch (err) {}
      loadGoals(); if (goal.id === g.id) { goal = GOALS[0]; Wallet.setGoal(goal.id); } renderGoals(); update(); SFX.pop();
    });
    // ---- the certificate: proof for the grown-up that the money was really saved ----
    const loadPic = src => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
    async function makeCertificate(g) {
      let kid = localStorage.getItem('cb:kidName') || ''; if (!kid) { kid = (prompt('Whose certificate is this? (first name)', 'Leo') || '').trim().slice(0, 24); if (!kid) return; try { localStorage.setItem('cb:kidName', kid); } catch (e) {} }
      const W = 1200, H = 850; const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.fillStyle = '#fffbeb'; x.fillRect(0, 0, W, H); x.strokeStyle = '#052e16'; x.lineWidth = 14; x.strokeRect(28, 28, W - 56, H - 56); x.strokeStyle = '#22c55e'; x.lineWidth = 6; x.strokeRect(52, 52, W - 104, H - 104);
      const F = 'Fredoka, Nunito, Arial, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#052e16';
      x.font = `700 62px ${F}`; x.fillText('CERTIFICATE OF SAVING', W / 2, 150);
      x.font = `600 30px ${F}`; x.fillStyle = '#166534'; x.fillText('chillionbucks.com', W / 2, 195);
      x.fillStyle = '#052e16'; x.font = `500 34px ${F}`; x.fillText('This certifies that', W / 2, 290);
      x.font = `700 80px ${F}`; x.fillStyle = '#15803d'; x.fillText(kid, W / 2, 380);
      x.fillStyle = '#052e16'; x.font = `500 34px ${F}`; x.fillText('saved', W / 2, 450);
      x.font = `700 72px ${F}`; x.fillStyle = '#b45309'; x.fillText('$' + g.c.toLocaleString('en-US'), W / 2, 530);
      x.fillStyle = '#052e16'; x.font = `500 34px ${F}`; x.fillText(`for the ${g.n}`, W / 2, 590);
      const work = (() => { try { return JSON.parse(localStorage.getItem('cb:work') || '{}').total || 0; } catch (e) { return 0; } })(); const coins = +localStorage.getItem('cb:coins') || 0;
      x.font = `600 26px ${F}`; x.fillStyle = '#374151'; x.fillText(`Earned by real work: ${work} job${work === 1 ? '' : 's'} finished and ${coins} coin${coins === 1 ? '' : 's'} saved, one at a time.`, W / 2, 660);
      x.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, 705);
      x.font = `700 28px ${F}`; x.fillStyle = '#052e16'; x.fillText('Signed: the Chillion Piggy 🐷    Grown-up: ____________________', W / 2, 770);
      // ribbon + the goal picture (or its emoji) in the corner
      x.fillStyle = '#facc15'; x.beginPath(); x.arc(130, 130, 56, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#052e16'; x.lineWidth = 6; x.stroke(); x.fillStyle = '#052e16'; x.font = `700 46px ${F}`; x.fillText('★', 130, 147);
      x.font = `120px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.fillText(g.e, W - 170, 330);
      if (g.img) { try { const im = await loadPic(g.img); const s = Math.min(220 / im.naturalWidth, 220 / im.naturalHeight); x.fillStyle = '#fff'; x.fillRect(W - 290, 230, 240, 240); x.drawImage(im, W - 280 + (220 - im.naturalWidth * s) / 2, 240 + (220 - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s); x.strokeStyle = '#052e16'; x.lineWidth = 5; x.strokeRect(W - 290, 230, 240, 240); } catch (e) {} }
      let data; try { data = c.toDataURL('image/png'); } catch (e) { say('The store photo blocked saving, so here is the certificate without it.'); return makeCertificateNoPic(g, kid); }
      $('#certImg').src = data; $('#certSheet').hidden = false; SFX.cheer(); confetti(200);
    }
    function makeCertificateNoPic(g, kid) { const saveImg = g.img; g.img = ''; makeCertificate(g).finally(() => { g.img = saveImg; }); }
    $('#certClose').onclick = () => { $('#certSheet').hidden = true; };
    $('#certSheet').addEventListener('click', e => { if (e.target.id === 'certSheet') $('#certSheet').hidden = true; });
    function update() {
      amtEl.textContent = '$' + saved;
      barEl.style.width = Math.min(100, saved / goal.c * 100) + '%';
      labelEl.textContent = saved >= goal.c ? `${goal.e} ${goal.n}: GOT IT! 🎉` : `${goal.e} ${goal.n}: $${saved} of $${goal.c}`;
      svg.style.setProperty('--fat', (1 + Math.min(.14, saved / Math.max(goal.c, 1) * .14)).toFixed(3));
      if (builderLink) builderLink.textContent = saved > 0 ? `🏗️ Spend your $${saved} in Chilltopia` : '🏝️ Open Chilltopia';
      renderGoalDone(); $$('.goal-card', goalRow).forEach((b, i) => b.classList.toggle('reached', saved >= GOALS[i].c));
      if (saved >= goal.c && !done) {
        done = true; SFX.cheer(); confetti(220);
        svg.classList.add('dance'); setTimeout(() => svg.classList.remove('dance'), 2400);
        say(`YOU DID IT! You saved $${goal.c} for the ${goal.n}! ${goal.e} Pick a new goal or keep stacking.`);
      }
    }
    Wallet.setGoal(goal.id);

    // ---- the coin tray: five coins, each one drags; a dropped coin refills a moment later ----
    const N_COINS = 5;
    for (let i = 0; i < N_COINS; i++) {
      const c = document.createElement('button'); c.className = 'dcoin'; c.type = 'button'; c.textContent = '$1';
      c.setAttribute('aria-label', 'A one-dollar coin. Drag it into the piggy, or press Enter to drop it in.');
      c.style.setProperty('--i', i);
      c.addEventListener('pointerdown', e => startDrag(e, c));
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!c.classList.contains('spent')) deposit(null, c); } });
      c.addEventListener('click', e => { if (!dragging && !c.classList.contains('spent') && e.detail) { c.classList.remove('nudge'); void c.offsetWidth; c.classList.add('nudge'); say('Drag the coin into the piggy! 🐷👉'); } });
      tray.appendChild(c);
    }

    // ---- the bill tray: paychecks from Jobs in the Builder wait here until the kid drags them in ----
    const BILL_TEXT = { b5: '$5', b20: '$20', b50: '$50', b100: '$100', stack: '$5,000', pot: '$10,000' };
    const billTray = $('#billTray');
    function renderBills() {
      if (!billTray) return; billTray.innerHTML = ''; const bills = Wallet.bills(); let n = 0;
      ['pot', 'stack', 'b100', 'b50', 'b20', 'b5'].forEach(k => { for (let i = 0; i < (bills[k] || 0); i++) { const b = document.createElement('div'); b.className = 'dbill ' + k; b.dataset.kind = k; b.innerHTML = `<span>${BILL_TEXT[k]}</span>`; b.setAttribute('role', 'button'); b.setAttribute('aria-label', `${Wallet.BILLS[k].name}. Drag it into the piggy.`); b.addEventListener('pointerdown', e => startDrag(e, b, k)); billTray.appendChild(b); n++; } });
      billTray.hidden = !n; $('#billLabel').hidden = !n;
    }
    const slotPoint = () => { const r = svg.getBoundingClientRect(); return { x: r.left + r.width * .455, y: r.top + r.height * .24 }; };
    const overPiggy = (x, y) => { const r = piggyEl.getBoundingClientRect(); return x > r.left - 24 && x < r.right + 24 && y > r.top - 40 && y < r.bottom + 16; };
    function eyesAt(x, y) {
      if (!pupil) return;
      const r = svg.getBoundingClientRect(); const ex = r.left + r.width * (160 / 220), ey = r.top + r.height * (72 / 170);
      const a = Math.atan2(y - ey, x - ex); pupil.setAttribute('transform', `translate(${(Math.cos(a) * 2).toFixed(2)} ${(Math.sin(a) * 2).toFixed(2)})`);
    }
    const eyesRest = () => pupil && pupil.setAttribute('transform', '');

    // A ghost coin follows the finger. Every way a drag can end (up, cancel, lost capture, page hide) cleans it up,
    // and the fly animations remove it on a timer too, so a missed animation event can never leave a stray coin behind.
    const sweepGhosts = (force) => document.querySelectorAll('.dcoin.ghost').forEach(g => { if (force || performance.now() - (+g.dataset.t || 0) > 1600) g.remove(); });
    function glide(ghost, x, y, scale, opacity, dur, rot) {
      const d = reduced ? 1 : dur;
      try { ghost.style.transition = `left ${d}ms cubic-bezier(.3,1.3,.5,1), top ${d}ms cubic-bezier(.3,1.3,.5,1), transform ${d}ms ease, opacity ${d}ms ease`; ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; ghost.style.transform = `translate(-50%,-50%) scale(${scale})${rot ? ` rotate(${rot}deg)` : ''}`; ghost.style.opacity = opacity; } catch (err) {}
      setTimeout(() => ghost.remove(), d + 60);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) sweepGhosts(true); });
    function startDrag(e, coin, kind) {
      if (coin.classList.contains('spent') || e.button > 0) return;
      if (!tempt.classList.contains('hidden')) { say('Decide first: spend or keep saving?'); return; }
      e.preventDefault(); dragging = true; sweepGhosts(false);
      const ghost = kind ? coin.cloneNode(true) : document.createElement('div'); if (!kind) { ghost.className = 'dcoin'; ghost.textContent = '$1'; } ghost.classList.add('ghost'); ghost.dataset.t = performance.now();
      document.body.appendChild(ghost);
      const move = (x, y) => { ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; const over = overPiggy(x, y); piggyEl.classList.toggle('hot', over); eyesAt(x, y); };
      move(e.clientX, e.clientY); coin.classList.add('lifted'); SFX.whoosh();
      let lastX = e.clientX, lastY = e.clientY, ended = false;
      const onMove = ev => { lastX = ev.clientX; lastY = ev.clientY; move(lastX, lastY); };
      const onUp = ev => {
        if (ended) return; ended = true;
        coin.removeEventListener('pointermove', onMove); coin.removeEventListener('pointerup', onUp); coin.removeEventListener('pointercancel', onUp); coin.removeEventListener('lostpointercapture', onLost);
        try { coin.releasePointerCapture(ev.pointerId); } catch (err) {}
        coin.classList.remove('lifted'); piggyEl.classList.remove('hot'); eyesRest();
        setTimeout(() => { dragging = false; }, 0);
        const x = ev.clientX || lastX, y = ev.clientY || lastY;
        if (ev.type === 'pointerup' && overPiggy(x, y)) deposit(ghost, coin, kind);
        else flyBack(ghost, coin);
      };
      const onLost = ev => setTimeout(() => { if (!ended) onUp({ type: 'lostpointercapture', pointerId: ev.pointerId, clientX: lastX, clientY: lastY }); }, 0);
      try { coin.setPointerCapture(e.pointerId); } catch (err) {}
      coin.addEventListener('pointermove', onMove); coin.addEventListener('pointerup', onUp); coin.addEventListener('pointercancel', onUp); coin.addEventListener('lostpointercapture', onLost);
    }
    function flyBack(ghost, coin) {
      const r = coin.getBoundingClientRect();
      glide(ghost, r.left + r.width / 2, r.top + r.height / 2, 1, 0, 320);
      SFX.pop(); say(pick(['Almost! Drop it ON the piggy.', 'Aim for the piggy! 🐷', 'So close! Try again.']));
    }
    function deposit(ghost, coin, kind) {
      const sp = slotPoint();
      if (ghost) glide(ghost, sp.x, sp.y, .35, .2, 260, 180);
      // combo: drops within 3 seconds of each other climb the ladder
      const now = performance.now(); combo = (now - lastDrop < 3000) ? Math.min(combo + 1, COMBO.length - 1) : 0; lastDrop = now;
      let v = 1;
      if (kind) { v = Wallet.depositBill(kind); saved = Wallet.get(); coin.remove(); renderBills(); if (v >= 1000) { SFX.cheer(); confetti(260); } else if (v >= 50) confetti(120); }
      else { saved++; Wallet.set(saved); try { localStorage.setItem('cb:coins', String((+localStorage.getItem('cb:coins') || 0) + 1)); } catch (e) {} }
      SFX.clink(kind ? Math.min(COMBO.length - 1, combo + (v >= 100 ? 4 : 2)) : combo); setTimeout(() => SFX.slurp(), 120);
      svg.classList.remove('gulp'); void svg.offsetWidth; svg.classList.add('gulp');
      sparkle(sp.x, sp.y); floatText('+$' + v.toLocaleString('en-US'), sp.x, sp.y);
      // refill: the tray coin goes dark for a beat, then pops back (bills do not refill: they were earned)
      if (!kind) { coin.classList.add('spent'); coin.disabled = true; setTimeout(() => { coin.classList.remove('spent'); coin.disabled = false; coin.classList.remove('refill'); void coin.offsetWidth; coin.classList.add('refill'); }, 1100); }
      update();
      if (saved < goal.c) {
        if (saved % 10 === 0) { SFX.levelUp(); confetti(70, sp); setTimeout(showTempt, 700); say(`$${saved}! Level up! 🎉`); }
        else if (saved % 5 === 0) { SFX.levelUp(); confetti(50, sp); say(`$${saved} saved! ${pick(CHEERS)}`); }
        else say(combo > 0 ? COMBO[combo] : pick(['Ka-ching!', 'Yes!', 'Into the piggy!', 'Cha-ching!']));
      }
    }
    function sparkle(x, y) {
      if (reduced) return;
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('div'); s.className = 'spark'; s.textContent = pick(['✨', '⭐', '💛', '✨']);
        s.style.left = x + 'px'; s.style.top = y + 'px'; document.body.appendChild(s);
        const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 60;
        s.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(1.2)`, opacity: 0 }], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => s.remove();
      }
    }
    function floatText(t, x, y) {
      const f = document.createElement('div'); f.className = 'floaty'; f.textContent = t; f.style.left = x + 'px'; f.style.top = y + 'px'; document.body.appendChild(f);
      f.animate([{ transform: 'translate(-50%,-50%) scale(.8)', opacity: 1 }, { transform: 'translate(-50%,-260%) scale(1.3)', opacity: 0 }], { duration: reduced ? 1 : 900, easing: 'ease-out' }).onfinish = () => f.remove();
    }
    function showTempt() {
      if (saved >= goal.c) return;
      cur = pick(TEMPTS);
      $('#temptEmoji').textContent = cur.e; $('#temptText').textContent = `${cur.n} for $${cur.c}!`; $('#temptSpend').textContent = `Spend $${cur.c}`;
      tempt.classList.remove('hidden'); say('Uh oh… temptation!');
    }
    $('#temptSpend').onclick = () => { saved = Math.max(0, saved - cur.c); Wallet.set(saved); SFX.buzz(); tempt.classList.add('hidden'); say(`Yum! But now you’re $${cur.c} further from the ${goal.n}. ${goal.e}`, true); update(); };
    $('#temptKeep').onclick = () => { saved += 1; Wallet.set(saved); SFX.levelUp(); tempt.classList.add('hidden'); say('Patience pays! Waiting earned you a bonus buck. 💚'); confetti(40); update(); };
    $('#piggyReset').onclick = () => { if (saved > 0 && !confirm(`Start over? This empties the piggy ($${saved}) and your Builder wallet.`)) return; saved = 0; done = false; combo = 0; Wallet.set(0); tempt.classList.add('hidden'); update(); say('Drag a coin into the piggy!'); };
    document.addEventListener('wallet', e => { const v = e.detail && typeof e.detail.saved === 'number' ? e.detail.saved : Wallet.get(); if (v !== saved) { saved = v; done = saved >= goal.c; update(); } renderBills(); });
    window.addEventListener('storage', ev => { if (ev.key === 'cb:wallet') location.reload(); });

    const gain = Wallet.interest();
    renderGoals(); renderBills(); update();
    if (gain) { say(`🌱 Baby money! Your savings made $${gain} while you were away.`); setTimeout(() => { SFX.levelUp(); confetti(60); }, 600); }
    else if (Wallet.billCount()) say(`You have ${Wallet.billCount()} paycheck${Wallet.billCount() > 1 ? 's' : ''} from your jobs! Drag them into the piggy. 💵`);
    else say(picked ? 'Drag a coin into the piggy!' : '👉 Tap the thing you want to save for!');
  })();

  /* ---------------- game 2: Need or Want (100 cards) ---------------- */
  (function needWant() {
    const N = 'need', W = 'want';
    const ITEMS = [
      ['🍎', 'An apple', N, 'Food keeps your body going.'],
      ['💧', 'Water', N, 'Your body needs water every single day.'],
      ['🏠', 'A home', N, 'Everyone needs a safe place to sleep.'],
      ['🧥', 'A warm coat in winter', N, 'Staying warm keeps you healthy.'],
      ['🪥', 'A toothbrush', N, 'Healthy teeth are a must.'],
      ['👟', 'Shoes that fit', N, 'Your feet need protecting.'],
      ['💊', 'Medicine when you’re sick', N, 'Getting better matters.'],
      ['📚', 'School books', N, 'Learning helps you grow.'],
      ['🥦', 'Vegetables', N, 'Healthy food is a need (yes, even broccoli).'],
      ['🛏️', 'A bed to sleep in', N, 'Sleep is how you grow and recharge.'],
      ['🧼', 'Soap', N, 'Clean hands keep germs away.'],
      ['🥛', 'Milk', N, 'Drinks that help you grow strong.'],
      ['🍞', 'Bread', N, 'Everyday food fills your belly.'],
      ['🧦', 'Socks', N, 'Warm, dry feet every day.'],
      ['👕', 'A plain T-shirt', N, 'Clothes to wear are a need.'],
      ['🩹', 'A bandage for a cut', N, 'Taking care of an ouch matters.'],
      ['🍌', 'A banana', N, 'Healthy snacks power your day.'],
      ['🥚', 'Eggs', N, 'Food for growing bodies.'],
      ['🍚', 'Rice', N, 'Everyday food is a need.'],
      ['🧴', 'Sunscreen at the beach', N, 'Protecting your skin is a need.'],
      ['🪮', 'A hairbrush', N, 'Taking care of yourself is a need.'],
      ['🚌', 'A ride to school', N, 'Getting to school matters.'],
      ['👓', 'Glasses if you can’t see well', N, 'Seeing clearly is a need.'],
      ['🧑‍⚕️', 'A doctor checkup', N, 'Staying healthy is a need.'],
      ['🦷', 'A dentist visit', N, 'Healthy teeth need a checkup.'],
      ['🧣', 'A blanket on a cold night', N, 'Staying warm keeps you healthy.'],
      ['🚰', 'A sink to wash your hands', N, 'Clean hands fight germs.'],
      ['🧻', 'Toilet paper', N, 'Definitely a need!'],
      ['🍲', 'Soup when you’re sick', N, 'Food that helps you get better.'],
      ['🎒', 'A backpack for school', N, 'Carrying your books is a need.'],
      ['✏️', 'A pencil for school', N, 'You need something to write with.'],
      ['🧢', 'A hat on a sunny day', N, 'Protecting your head from the sun.'],
      ['🪑', 'A chair at the table', N, 'A place to sit and eat.'],
      ['🔑', 'A key to your house', N, 'Getting home safe is a need.'],
      ['🚿', 'A shower or bath', N, 'Staying clean keeps you healthy.'],
      ['🧀', 'Cheese', N, 'Food that helps you grow.'],
      ['🥕', 'Carrots', N, 'Healthy food for a growing body.'],
      ['🩺', 'Help from a nurse when hurt', N, 'Getting care matters.'],
      ['💡', 'A light at night', N, 'Seeing where you walk is a need.'],
      ['🧤', 'Gloves when it’s freezing', N, 'Warm hands are a need.'],
      ['🥤', 'Water on a hot day', N, 'Staying hydrated is a need.'],
      ['🏫', 'A school to learn at', N, 'Learning helps you grow.'],
      ['🚑', 'An ambulance in an emergency', N, 'Help when you’re hurt is a need.'],
      ['🍽️', 'Dinner', N, 'Everyone needs to eat dinner.'],
      ['🩲', 'Underwear', N, 'Yes, you need it.'],
      ['🧸', 'A new teddy bear', W, 'Fun to have, but you can live without it.'],
      ['🍦', 'Ice cream', W, 'Yummy treat, not a must-have.'],
      ['🎮', 'A video game', W, 'Super fun, and totally a want.'],
      ['🍭', 'A lollipop', W, 'Sweet! And definitely a want.'],
      ['🚀', 'A rocket toy', W, 'Blast off… into the want pile.'],
      ['🎈', 'A balloon', W, 'Fun for a day, not a need.'],
      ['🍕', 'Pizza every Friday', W, 'Food is a need, but pizza EVERY Friday is a want.'],
      ['🐶', 'A puppy', W, 'Adorable, and a big responsibility. A want.'],
      ['🎂', 'A giant birthday cake', W, 'Delicious want!'],
      ['🎧', 'Fancy headphones', W, 'Cool, but a want.'],
      ['🍫', 'A chocolate bar', W, 'Sweet treat, not a need.'],
      ['🎢', 'A trip to a theme park', W, 'Super fun day, still a want.'],
      ['🚲', 'A brand-new bike when yours works', W, 'Your old one still rides!'],
      ['👑', 'A sparkly crown', W, 'Fun to wear, not a need.'],
      ['🎁', 'A present just because', W, 'Presents are wants.'],
      ['🍩', 'A donut', W, 'Yummy want.'],
      ['🧁', 'Cupcakes', W, 'Treats are wants.'],
      ['🏰', 'A giant castle playset', W, 'Amazing, but a want.'],
      ['🛹', 'A skateboard', W, 'Fun ride, still a want.'],
      ['🎸', 'An electric guitar', W, 'Rock on… in the want pile.'],
      ['📱', 'The newest phone', W, 'Wants can be shiny.'],
      ['🕶️', 'Cool sunglasses', W, 'Fun, but a want.'],
      ['🪁', 'A kite', W, 'Fun on a windy day, not a need.'],
      ['🎪', 'Circus tickets', W, 'A fun show is a want.'],
      ['🍿', 'Movie popcorn', W, 'A snack at the movies is a want.'],
      ['🦖', 'A dinosaur toy', W, 'RAWR… a want.'],
      ['🎨', 'A giant art set when you have crayons', W, 'Your crayons still work!'],
      ['🏎️', 'A remote-control car', W, 'Fun to zoom, still a want.'],
      ['🧃', 'Juice box instead of water', W, 'Water does the job; juice is a want.'],
      ['🎠', 'A pony ride', W, 'Fun for a day, not a need.'],
      ['🍬', 'A bag of candy', W, 'Sweet want.'],
      ['🛴', 'A scooter', W, 'Fun ride, not a need.'],
      ['🐻', 'A second teddy bear', W, 'One is already plenty!'],
      ['✨', 'Light-up sneakers when your shoes fit', W, 'Shoes are a need; the lights are a want.'],
      ['🎬', 'Going to the movies', W, 'Fun, but a want.'],
      ['🍔', 'A burger from a restaurant', W, 'Eating out is a want.'],
      ['🐠', 'A pet fish', W, 'Cute, and a want.'],
      ['🎹', 'A piano', W, 'Music is wonderful, and a want.'],
      ['🏄', 'A surfboard', W, 'Cowabunga… a want.'],
      ['🧩', 'Another puzzle', W, 'Fun, but a want.'],
      ['🍨', 'A sundae with sprinkles', W, 'A treat is a want.'],
      ['🪀', 'A yo-yo', W, 'Fun little want.'],
      ['🎯', 'A dartboard', W, 'Game time is a want.'],
      ['🚁', 'A toy helicopter', W, 'Fun flyer, still a want.'],
      ['🌮', 'Tacos from a food truck', W, 'Food is a need, but takeout is a want.'],
      ['🍪', 'Cookies', W, 'Yummy want.'],
      ['🎤', 'A karaoke machine', W, 'Fun, but a want.'],
      ['🛶', 'A canoe', W, 'Cool adventure, still a want.'],
      ['🧑‍🚀', 'An astronaut costume', W, 'Fun to wear, not a need.'],
      ['🏀', 'A new basketball when yours bounces fine', W, 'Your old one works!'],
      ['🪆', 'A collectible toy', W, 'Fun to collect, still a want.'],
      ['🎿', 'A ski trip', W, 'Fun trip, not a need.'],
      ['🥤', 'A giant soda', W, 'A sugary drink is a want.'],
      ['🎲', 'A new board game', W, 'Fun with friends, still a want.'],
      ['🐈', 'A kitten', W, 'Cute, and a big responsibility. A want.'],
    ].map(([e, n, a, w], i) => ({ id: i, e, n, a, w }));
    let deck = [], idx = 0, score = 0, streak = 0, locked = false;
    let used = new Set();
    const card = $('#nwCard'), msg = $('#nwMsg'), bNeed = $('#nwNeed'), bWant = $('#nwWant');
    if (!card) return;
    const say = (t, bad) => { msg.textContent = t; msg.classList.toggle('bad', !!bad); };
    $('#nwPool').textContent = ITEMS.length;
    function draw10() {
      let pool = ITEMS.filter(it => !used.has(it.id));
      if (pool.length < 10) { used = new Set(); pool = ITEMS; }
      const d = shuffle(pool).slice(0, 10); d.forEach(it => used.add(it.id)); return d;
    }
    const stamp = $('#nwStamp'), nextLbl = $('#nwNext');
    const HOLD = 600, SLIDE = 180; // the stamp lands, then the next card pops right in
    function unlock() { locked = false; bNeed.disabled = false; bWant.disabled = false; card.classList.remove('ok', 'bad', 'locked'); nextLbl.hidden = true; }
    function show() {
      const it = deck[idx]; unlock();
      card.classList.remove('in', 'out'); void card.offsetWidth; card.classList.add('in');
      $('#nwEmoji').textContent = it.e; $('#nwName').textContent = it.n; $('#nwCount').textContent = `${idx + 1} / ${deck.length}`;
    }
    function start() { deck = draw10(); idx = 0; score = 0; streak = 0; $('#nwScore').textContent = 0; $('#nwStreak').textContent = 0; $('#nwTotal').textContent = deck.length; say(''); show(); }
    function answer(a) {
      if (locked) return; locked = true; const it = deck[idx];
      // Lock the buttons right away so a second tap does nothing, then stamp the card so the kid sees the answer landed.
      bNeed.disabled = true; bWant.disabled = true; card.classList.add('locked'); nextLbl.hidden = false;
      const ok = a === it.a;
      stamp.innerHTML = ok ? '<b>✓</b>' : '<b>✗</b>'; card.classList.add(ok ? 'ok' : 'bad');
      if (ok) { score++; streak++; SFX.ding(); say(`✅ ${it.a.toUpperCase()}! ${it.w}`); if (streak && streak % 5 === 0) { SFX.levelUp(); confetti(60); } }
      else { streak = 0; SFX.buzz(); say(`❌ It’s a ${it.a.toUpperCase()}. ${it.w}`, true); }
      $('#nwScore').textContent = score; $('#nwStreak').textContent = streak;
      setTimeout(() => {
        idx++;
        if (idx >= deck.length) { end(); return; }
        card.classList.remove('in'); card.classList.add('out'); SFX.whoosh && SFX.whoosh();
        setTimeout(show, SLIDE);
      }, HOLD);
    }
    function end() {
      const perfect = score === deck.length;
      $('#nwEmoji').textContent = perfect ? '🏆' : (score >= 7 ? '🌟' : '💪'); $('#nwName').textContent = `You got ${score} of ${deck.length}!`;
      say(perfect ? 'PERFECT! You know your needs from your wants. 😎' : (score >= 7 ? 'Great job! Play again for a fresh set of cards.' : 'Good try! Needs keep you safe and healthy. Wants are the fun extras.'));
      if (perfect) { SFX.cheer(); confetti(); }
      card.classList.remove('ok', 'bad', 'out'); card.classList.add('in'); nextLbl.hidden = true;
      locked = true; bNeed.disabled = true; bWant.disabled = true;
    }
    bNeed.onclick = () => answer(N); bWant.onclick = () => answer(W); $('#nwReset').onclick = start; start();
  })();

  /* ---------------- game 3: Coin Counter ---------------- */
  (function coinCounter() {
    const COINS = [{ n: 'penny', v: 1 }, { n: 'nickel', v: 5 }, { n: 'dime', v: 10 }, { n: 'quarter', v: 25 }];
    const DELTAS = [1, 4, 5, 9, 10, 15, 20, 25];
    let score = 0, locked = false;
    const tray = $('#coinTray2'), row = $('#coinAnswers'), msg = $('#coinMsg'); if (!tray) return;
    const say = (t, bad) => { msg.textContent = t; msg.classList.toggle('bad', !!bad); };
    function round() {
      locked = false; say('');
      const n = 1 + Math.floor(Math.random() * 4); const set = Array.from({ length: n }, () => pick(COINS)); const total = set.reduce((s, c) => s + c.v, 0);
      tray.innerHTML = '';
      set.forEach((c, i) => { const d = document.createElement('div'); d.className = 'coin ' + c.n; d.textContent = c.v + '¢'; d.title = c.n; d.style.animationDelay = (i * .08) + 's'; tray.appendChild(d); });
      const opts = new Set([total]); let guard = 0;
      while (opts.size < 3 && guard++ < 60) { const v = total + pick(DELTAS) * (Math.random() < .5 ? -1 : 1); if (v > 0) opts.add(v); }
      row.innerHTML = '';
      shuffle([...opts]).forEach(v => {
        const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = v + '¢';
        b.onclick = () => {
          if (locked) return; locked = true;
          if (v === total) { score++; SFX.ding(); say(`✅ Yes! ${total}¢${total >= 100 ? ', that’s a whole dollar or more!' : ''}`); if (score % 5 === 0) { SFX.fanfare(); confetti(90); } }
          else { score = 0; SFX.buzz(); say(`❌ Not quite. Count again: it’s ${total}¢.`, true); }
          $('#coinScore').textContent = score; setTimeout(round, 1800);
        };
        row.appendChild(b);
      });
    }
    round();
  })();

  /* ---------------- game 4: The Chill-o-Meter ---------------- */
  (function meter() {
    const wk = $('#wk'), yr = $('#yr'); if (!wk || !yr) return; const DAYS = 365;
    const RATE = 1.07, CHILLION = 1e6; const tower = $('#tower');
    for (let i = 0; i < 24; i++) tower.appendChild(document.createElement('i'));
    function count(el, to) {
      const from = +el.dataset.v || 0; el.dataset.v = to;
      if (reduced) { el.textContent = money(to); return; }
      const t0 = performance.now(), dur = 380;
      (function f(now) { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = money(from + (to - from) * e); if (p < 1) requestAnimationFrame(f); })(t0);
    }
    function calc() {
      const w = +wk.value, y = +yr.value; $('#wkOut').textContent = '$' + w; $('#yrOut').textContent = y;
      const put = w * DAYS * y; let bal = 0; for (let i = 0; i < y; i++) bal = (bal + w * DAYS) * RATE;
      count($('#putIn'), put); count($('#grew'), bal - put); count($('#total'), bal);
      const pct = Math.max(4, Math.min(100, Math.log10(Math.max(10, bal)) / 6 * 100)); $('#chillFill').style.width = pct + '%';
      $('#chillLabel').textContent = bal < 1e3 ? 'Kinda chill 🙂' : bal < 1e4 ? 'Pretty chill 😌' : bal < 1e5 ? 'Very chill 🏖️' : bal < CHILLION ? 'Super chill 🌴' : 'CHILLION MODE 😎💚';
      let b2 = 0, n = 0; while (b2 < CHILLION && n < 200) { b2 = (b2 + w * DAYS) * RATE; n++; }
      $('#chillYears').textContent = n >= 200 ? `At $${w} a day it would take more than 200 years to reach a game Chillion ($1,000,000). Try saving a little more!` : `Keep saving $${w} a day (that is $${String(w * DAYS).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} a year) and you would reach a game Chillion ($1,000,000) in about ${n} years.${n <= y ? ' You’re already there in this game! 🎉' : ''}`;
      [...tower.children].forEach((bar, i) => { bar.style.height = Math.max(6, pct * (0.35 + 0.65 * (i + 1) / 24)) + '%'; });
    }
    wk.addEventListener('input', calc); yr.addEventListener('input', calc); calc();
  })();

  /* ---------------- videos (from videos.js) ---------------- */
  (function videos() {
    const vids = Array.isArray(window.CHILLION_VIDEOS) ? window.CHILLION_VIDEOS.filter(v => v && v.id && v.topic) : [];
    const tabs = $('#videoTabs'), grid = $('#videoGrid'); if (!tabs || !grid) return;
    if (!vids.length) { grid.innerHTML = '<p class="watch-note">No videos yet. Add some in videos.js.</p>'; return; }
    const topics = [...new Set(vids.map(v => v.topic))]; let cur = topics[0], playing = null;
    function renderTabs() { tabs.innerHTML = ''; topics.forEach(tp => { const b = document.createElement('button'); b.className = 'tab'; b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = tp; b.setAttribute('aria-selected', tp === cur); b.onclick = () => { cur = tp; playing = null; renderTabs(); renderGrid(); }; tabs.appendChild(b); }); }
    const thumb = v => `<img loading="lazy" src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt=""><button class="play" type="button" aria-label="Play ${esc(v.title)}"><span>▶</span></button>`;
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

  /* ---------------- phone tab bar: highlight the section on screen ---------------- */
  (function tabbar() {
    const links = $$('.tabbar a[href^="#"]'); if (!links.length) return;
    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('active')); const a = byId.get(e.target.id); if (a) a.classList.add('active'); } }); }, { rootMargin: '-45% 0px -45% 0px' });
    byId.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
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
      b.onclick = () => { b.classList.toggle('flipped'); SFX.tap(); }; g.appendChild(b);
    });
  })();
})();
