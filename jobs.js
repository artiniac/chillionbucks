/* Chillion Jobs: little pieces of real WORK that pay real (game) bucks. Tap, wipe, drag, count. Each job takes a
   kid 20 to 60 seconds of doing, pays $2 to $4, and comes back after a short break. Exposes window.CB_WORK.
   Needs sfx.js. The Builder engine owns the wallet, the payday, and the cooldown clock. */
(() => {
  'use strict';
  const SFX = window.SFX;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const el = (tag, cls, html) => { const d = document.createElement(tag); if (cls) d.className = cls; if (html !== undefined) d.innerHTML = html; return d; };
  const pos = (d, x, y) => { d.style.left = x + '%'; d.style.top = y + '%'; };
  const COLORS = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15', green: '#22c55e', purple: '#a855f7', pink: '#f472b6' };
  const COOLDOWN = 45000;

  /* Every job: start(stage, api) draws into the stage and calls api.progress(have, need) and api.done() */
  const JOBS = [
    { id: 'poolclean', e: '🍂', name: 'Pool Cleaner', pay: 3, how: 'Leaves fell in the pool! Tap every leaf to scoop it out.', bg: 'pool',
      start(stage, api) {
        const need = 12; let have = 0; api.progress(0, need);
        for (let i = 0; i < need; i++) {
          const leaf = el('button', 'wk-leaf', pick(['🍂', '🍁', '🍃'])); leaf.type = 'button'; pos(leaf, 6 + Math.random() * 84, 12 + Math.random() * 70); leaf.style.animationDelay = (-Math.random() * 4) + 's';
          leaf.onpointerdown = e => { e.preventDefault(); if (leaf.classList.contains('gone')) return; leaf.classList.add('gone'); SFX.pop(); have++; api.progress(have, need); api.spark(e.clientX, e.clientY); if (have >= need) setTimeout(api.done, 350); };
          stage.appendChild(leaf);
        }
      } },
    { id: 'carwash', e: '🧽', name: 'Car Wash', pay: 3, how: 'This car is filthy. Rub the mud off with your finger until it shines.', bg: 'garage',
      start(stage, api) {
        const need = 14; let have = 0; api.progress(0, need);
        const car = el('div', 'wk-car', window.CB_ART ? window.CB_ART.VH.skyRacer('wash', { color: pick(['red', 'blue', 'yellow', 'green', 'purple']) }) : '🚗'); stage.appendChild(car);
        for (let i = 0; i < need; i++) { const m = el('div', 'wk-mud'); pos(m, 14 + Math.random() * 68, 26 + Math.random() * 40); m.style.transform = `rotate(${Math.random() * 360}deg) scale(${.8 + Math.random() * .6})`; stage.appendChild(m); }
        const wipe = e => { const t = document.elementFromPoint(e.clientX, e.clientY); if (t && t.classList.contains('wk-mud') && !t.classList.contains('gone')) { t.classList.add('gone'); have++; SFX.tap(); api.progress(have, need); api.spark(e.clientX, e.clientY); if (have >= need) { car.classList.add('shine'); SFX.levelUp(); setTimeout(api.done, 500); } } };
        stage.addEventListener('pointerdown', wipe); stage.addEventListener('pointermove', e => { if (e.pressure > 0 || e.buttons) wipe(e); });
      } },
    { id: 'fence', e: '🖌️', name: 'Paint the Fence', pay: 2, how: 'Swipe across the boards to paint the whole fence one color.', bg: 'yard',
      start(stage, api) {
        const need = 12; let have = 0; api.progress(0, need); const c = pick(Object.values(COLORS));
        const fence = el('div', 'wk-fence'); stage.appendChild(fence);
        for (let i = 0; i < need; i++) { const b = el('div', 'wk-board'); fence.appendChild(b); }
        const paint = e => { const t = document.elementFromPoint(e.clientX, e.clientY); if (t && t.classList.contains('wk-board') && !t.classList.contains('done')) { t.classList.add('done'); t.style.background = c; have++; SFX.tap(); api.progress(have, need); if (have >= need) { SFX.levelUp(); setTimeout(api.done, 400); } } };
        stage.addEventListener('pointerdown', paint); stage.addEventListener('pointermove', e => { if (e.pressure > 0 || e.buttons) paint(e); });
        const brush = el('div', 'wk-brush', '🖌️'); brush.style.color = c; stage.appendChild(brush); stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); pos(brush, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); });
      } },
    { id: 'deliver', e: '📦', name: 'Delivery Driver', pay: 3, how: 'Drag each package to the house with the same color door.', bg: 'street',
      start(stage, api) {
        const need = 8; let have = 0; api.progress(0, need); const keys = ['red', 'blue', 'yellow'];
        keys.forEach((k, i) => { const h = el('div', 'wk-house', `<i style="background:${COLORS[k]}"></i>`); h.dataset.k = k; pos(h, 17 + i * 33, 22); stage.appendChild(h); });
        const queue = shuffle([...keys, ...keys, ...keys].slice(0, need)); let cur = null;
        const next = () => { if (!queue.length) { SFX.levelUp(); setTimeout(api.done, 300); return; } const k = queue.shift(); cur = el('div', 'wk-pkg', `📦<i style="background:${COLORS[k]}"></i>`); cur.dataset.k = k; pos(cur, 50, 78); stage.appendChild(cur); drag(cur); };
        const drag = p => { p.onpointerdown = e => { e.preventDefault(); const r = stage.getBoundingClientRect(); p.classList.add('lift'); const mv = ev => pos(p, (ev.clientX - r.left) / r.width * 100, (ev.clientY - r.top) / r.height * 100); const up = ev => { p.removeEventListener('pointermove', mv); p.removeEventListener('pointerup', up); p.removeEventListener('pointercancel', up); p.classList.remove('lift'); const t = document.elementsFromPoint(ev.clientX, ev.clientY).find(x => x.classList && x.classList.contains('wk-house')); if (t && t.dataset.k === p.dataset.k) { p.classList.add('gone'); t.classList.add('got'); setTimeout(() => t.classList.remove('got'), 400); SFX.chaChing(); have++; api.progress(have, need); api.spark(ev.clientX, ev.clientY); setTimeout(next, 250); } else { if (t) { SFX.buzz(); t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 400); } pos(p, 50, 78); } }; try { p.setPointerCapture(e.pointerId); } catch (err) {} p.addEventListener('pointermove', mv); p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up); }; };
        next();
      } },
    { id: 'feed', e: '🥕', name: 'Feed the Animals', pay: 3, how: 'Each animal is dreaming of a snack. Drag the right food to the right animal.', bg: 'barn',
      start(stage, api) {
        const need = 8; let have = 0; api.progress(0, need);
        const pairs = [['🐶', '🦴'], ['🐱', '🐟'], ['🐰', '🥕'], ['🐔', '🌽']];
        pairs.forEach(([a, f], i) => { const d = el('div', 'wk-animal', `<span class="bub">${f}</span>${a}`); d.dataset.f = f; pos(d, 14 + i * 24, 30); stage.appendChild(d); });
        const tray = el('div', 'wk-tray'); stage.appendChild(tray);
        shuffle([...pairs, ...pairs].map(p => p[1])).forEach(f => { const it = el('div', 'wk-food', f); it.dataset.f = f; tray.appendChild(it); drag(it); });
        function drag(p) { p.onpointerdown = e => { e.preventDefault(); const r = stage.getBoundingClientRect(); const home = p.parentNode; p.classList.add('lift'); stage.appendChild(p); const mv = ev => pos(p, (ev.clientX - r.left) / r.width * 100, (ev.clientY - r.top) / r.height * 100); mv(e); const up = ev => { p.removeEventListener('pointermove', mv); p.removeEventListener('pointerup', up); p.removeEventListener('pointercancel', up); p.classList.remove('lift'); const t = document.elementsFromPoint(ev.clientX, ev.clientY).find(x => x.classList && x.classList.contains('wk-animal')); if (t && t.dataset.f === p.dataset.f) { p.remove(); t.classList.add('yum'); setTimeout(() => t.classList.remove('yum'), 500); SFX.slurp ? SFX.slurp() : SFX.pop(); have++; api.progress(have, need); api.spark(ev.clientX, ev.clientY); if (have >= need) { SFX.levelUp(); setTimeout(api.done, 400); } } else { if (t) { SFX.buzz(); t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 400); } p.style.left = ''; p.style.top = ''; home.appendChild(p); } }; try { p.setPointerCapture(e.pointerId); } catch (err) {} p.addEventListener('pointermove', mv); p.addEventListener('pointerup', up); p.addEventListener('pointercancel', up); }; }
      } },
    { id: 'lemonade', e: '🍋', name: 'Lemonade Stand', pay: 4, how: 'Count the lemons each customer wants. Tap the lemon that many times to make their drink.', bg: 'stand',
      start(stage, api) {
        const need = 6; let have = 0, want = 0, got = 0; api.progress(0, need);
        stage.appendChild(el('div', 'wk-stand', '🍋 LEMONADE 🍋'));
        const cust = el('div', 'wk-cust'); pos(cust, 22, 46); stage.appendChild(cust);
        const cup = el('div', 'wk-cup', '🥤<b>0</b>'); pos(cup, 70, 40); stage.appendChild(cup);
        const lemon = el('button', 'wk-lemon', '🍋'); lemon.type = 'button'; pos(lemon, 70, 78); stage.appendChild(lemon);
        const next = () => { if (have >= need) { SFX.levelUp(); setTimeout(api.done, 300); return; } want = 1 + Math.floor(Math.random() * 3); got = 0; cust.innerHTML = `<span class="bub">${'🍋'.repeat(want)}</span>${pick(['🧒', '👧', '👦', '👩', '👨', '👵', '👴', '🧑‍🚀'])}`; cust.classList.remove('in'); void cust.offsetWidth; cust.classList.add('in'); cup.querySelector('b').textContent = '0'; };
        lemon.onpointerdown = e => { e.preventDefault(); if (got >= want) return; got++; cup.querySelector('b').textContent = got; SFX.tap(); lemon.classList.remove('sq'); void lemon.offsetWidth; lemon.classList.add('sq'); api.spark(e.clientX, e.clientY); if (got === want) { SFX.chaChing(); have++; api.progress(have, need); cust.classList.add('happy'); setTimeout(() => { cust.classList.remove('happy'); next(); }, 700); } };
        next();
      } },
  ];

  const state = (() => { try { return JSON.parse(localStorage.getItem('cb:work') || '{}'); } catch (e) { return {}; } })();
  const saveState = () => { try { localStorage.setItem('cb:work', JSON.stringify(state)); } catch (e) {} };
  const readyAt = id => (state[id] && state[id].last ? state[id].last + COOLDOWN : 0);
  const timesDone = id => (state[id] && state[id].n) || 0;
  function markDone(id) { state[id] = { last: Date.now(), n: timesDone(id) + 1 }; state.total = (state.total || 0) + 1; saveState(); }

  window.CB_WORK = { JOBS, COOLDOWN, readyAt, timesDone, markDone, total: () => state.total || 0 };
})();
