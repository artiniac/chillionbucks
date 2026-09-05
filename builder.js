/* Chillion Builder engine: Leo's imagination board. Pick a place (or a photo of your room), spend saved bucks on
   blocks, building parts, and stickers, snap them to a grid, drag them anywhere, draw on top, finish jobs to EARN
   bucks back, and save every finished world. Everything stays in this browser. No libraries.
   Depends on sfx.js, wallet.js, builder-art.js, builder-catalog.js. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SFX = window.SFX, Wallet = window.Wallet, ART = window.CB_ART, CAT = window.CB_CATALOG;
  const { SCENES, PAL, COLOR_KEYS, esc } = ART;
  const { KITS, ITEMS, DEF, JOBS } = CAT;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const GRID = 24; // grid cells across the stage; one Snap Block stud column is one cell

  /* ============================== STATE ============================== */
  const KEY = 'cb:world', GKEY = 'cb:worlds';
  const fresh = () => ({ v: 2, bg: { type: 'scene', id: 'bedroom' }, items: [], strokes: [], jobsDone: {}, finished: false, born: Date.now() });
  const upgrade = w => { w.v = 2; w.strokes = w.strokes || []; w.jobsDone = w.jobsDone || {}; w.finished = !!w.finished; w.born = w.born || Date.now(); w.items = (w.items || []).filter(it => DEF[it.kind]).map(it => ({ rot: 0, color: DEF[it.kind].color, ...it })); return w; };
  let world = (() => { try { const w = JSON.parse(localStorage.getItem(KEY) || 'null'); if (w && Array.isArray(w.items)) return upgrade(w); } catch (e) {} return fresh(); })();
  let selected = null, drawing = false, eraser = false, color = '#2563eb', brush = .014, shopColor = 'red';
  const undo = [];

  const STAGE = $('#stage'), BG = $('#bg'), LAYER = $('#items'), DRAW = $('#draw'), HINT = $('#hint'), TOOLS = $('#tools'), SHELF = $('#shelf'), CATSEL = $('#cats'), GRIDEL = $('#grid');
  const stageRect = () => LAYER.getBoundingClientRect(); // the layer sits inside the stage border, so the grid math lines up with what the kid sees

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(world)); }
    catch (e) {
      if (world.bg.type === 'photo') { try { localStorage.setItem(KEY, JSON.stringify({ ...world, bg: { type: 'scene', id: 'bedroom' } })); toast('That photo is too big to remember. It stays until you leave this page.'); } catch (e2) {} }
    }
    refreshJobs();
  }
  const val = it => it.free ? 0 : DEF[it.kind].price;
  const refundValue = () => world.items.reduce((s, it) => s + val(it), 0);
  function pushUndo() { undo.push(JSON.stringify({ items: world.items, strokes: world.strokes, wallet: Wallet.get() })); if (undo.length > 40) undo.shift(); }

  /* ============================== GEOMETRY + SNAP GRID ============================== */
  const vbCache = {};
  function aspect(def, it) { // height / width of the art
    if (def.e) return 1;
    if (vbCache[def.id] !== undefined) return vbCache[def.id];
    const m = def.svg('vb', it || { color: def.color, label: def.def }).match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    return (vbCache[def.id] = m ? +m[2] / +m[1] : 1);
  }
  const rotated = it => it.rot === 90 || it.rot === 270;
  /* Snap the piece's left and top edges to the grid. Blocks snap their BODY (the studs poke above the line). */
  function snapItem(it) {
    const def = DEF[it.kind]; if (!def.snap) return;
    const r = stageRect(); if (!r.width) return;
    const cell = r.width / GRID;
    const wpx = def.w * r.width * it.s, hpx = wpx * aspect(def, it);
    const bw = rotated(it) ? hpx : wpx, bh = rotated(it) ? wpx : hpx;
    const studPx = (def.block && it.rot === 0) ? hpx * (10 / (def.rows * 40 + 10)) : 0;
    const left = it.x * r.width - bw / 2, top = it.y * r.height - bh / 2 + studPx;
    const sl = Math.round(left / cell) * cell, st = Math.round(top / cell) * cell;
    it.x = clamp((sl + bw / 2) / r.width, 0, 1); it.y = clamp((st - studPx + bh / 2) / r.height, 0, 1);
  }
  function showGrid(on) { GRIDEL.classList.toggle('on', on); }

  /* ============================== RENDER ============================== */
  function renderBg() {
    if (world.bg.type === 'photo') { BG.innerHTML = `<img alt="" src="${world.bg.data}">`; }
    else { const sc = SCENES[world.bg.id] || SCENES.bedroom; BG.innerHTML = sc.svg; }
  }
  function placeEl(d, it) {
    const def = DEF[it.kind]; const W = stageRect().width; const w = def.w * W;
    d.style.width = w + 'px'; d.style.left = (it.x * 100) + '%'; d.style.top = (it.y * 100) + '%'; d.style.zIndex = 10 + it.z;
    d.style.transform = `translate(-50%,-50%) rotate(${it.rot || 0}deg) scale(${it.s})${it.flip ? ' scaleX(-1)' : ''}`;
    const em = d.querySelector('.em'); if (em) em.style.fontSize = (w * .85) + 'px';
  }
  function art(def, it, u) { return def.svg ? def.svg(u, it) : `<span class="em">${def.e}</span>`; }
  function makeEl(it) {
    const def = DEF[it.kind]; const d = document.createElement('div'); d.className = 'it' + (def.snap ? ' snap' : ''); d.dataset.uid = it.uid;
    d.innerHTML = art(def, it, it.uid); placeEl(d, it); return d;
  }
  function paintTools() {
    TOOLS.hidden = !selected; if (!selected) return;
    const def = DEF[selected.kind];
    $('#sellPrice').textContent = val(selected);
    $('#tools [data-act="color"]').hidden = !def.colorable;
    $('#tools [data-act="color"] i').style.background = PAL[selected.color] || PAL.red;
    const wb = $('#tools [data-act="words"]'); wb.hidden = !(def.label || def.pal); wb.querySelector('small').textContent = def.pal ? 'Dress up' : 'Words';
  }
  function render() {
    world.items.sort((a, b) => a.z - b.z).forEach((it, i) => { it.z = i; });
    LAYER.innerHTML = '';
    world.items.forEach(it => { const d = makeEl(it); if (selected && selected.uid === it.uid) d.classList.add('sel'); LAYER.appendChild(d); });
    paintTools();
    HINT.hidden = world.items.length > 0 || world.strokes.length > 0;
  }
  function replaceAll() { $$('.it', LAYER).forEach(d => { const it = world.items.find(x => x.uid === d.dataset.uid); if (it) placeEl(d, it); }); }
  function redrawOne(it) { const d = LAYER.querySelector(`[data-uid="${it.uid}"]`); if (d) { d.innerHTML = art(DEF[it.kind], it, it.uid); placeEl(d, it); } }
  function select(it) { selected = it; $$('.it', LAYER).forEach(d => d.classList.toggle('sel', !!it && d.dataset.uid === it.uid)); paintTools(); }

  // drawing layer
  const dctx = DRAW.getContext('2d');
  function sizeDraw() { const r = stageRect(); const dpr = Math.min(2, devicePixelRatio || 1); DRAW.width = Math.round(r.width * dpr); DRAW.height = Math.round(r.height * dpr); redraw(); }
  function strokePath(st, W, H) {
    dctx.globalCompositeOperation = st.c === 'erase' ? 'destination-out' : 'source-over';
    dctx.strokeStyle = st.c === 'erase' ? '#000' : st.c; dctx.lineWidth = Math.max(2, st.w * W); dctx.lineCap = 'round'; dctx.lineJoin = 'round';
    dctx.beginPath(); st.pts.forEach(([x, y], i) => { if (i === 0) dctx.moveTo(x * W, y * H); else dctx.lineTo(x * W, y * H); }); if (st.pts.length === 1) dctx.lineTo(st.pts[0][0] * W + .1, st.pts[0][1] * H); dctx.stroke();
  }
  function redraw() { const W = DRAW.width, H = DRAW.height; dctx.clearRect(0, 0, W, H); world.strokes.forEach(st => strokePath(st, W, H)); dctx.globalCompositeOperation = 'source-over'; }

  new ResizeObserver(() => { replaceAll(); sizeDraw(); }).observe(STAGE);

  /* ============================== DRAG & SELECT ============================== */
  LAYER.addEventListener('pointerdown', e => {
    if (drawing) return;
    const d = e.target.closest('.it');
    if (!d) { select(null); return; }
    e.preventDefault();
    const it = world.items.find(x => x.uid === d.dataset.uid); if (!it) return;
    select(it); pushUndo(); SFX.tap();
    const def = DEF[it.kind]; if (def.snap) showGrid(true);
    const r = stageRect(); const ox = e.clientX - (r.left + it.x * r.width), oy = e.clientY - (r.top + it.y * r.height);
    let moved = false;
    const mv = ev => { moved = true; it.x = clamp((ev.clientX - ox - r.left) / r.width, 0, 1); it.y = clamp((ev.clientY - oy - r.top) / r.height, 0, 1); placeEl(d, it); };
    const up = () => {
      d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up); showGrid(false);
      if (moved) { if (def.snap) { snapItem(it); placeEl(d, it); d.classList.remove('snapped'); void d.offsetWidth; d.classList.add('snapped'); SFX.clink ? SFX.clink(1) : SFX.pop(); } else SFX.pop(); save(); }
      else undo.pop();
    };
    try { d.setPointerCapture(e.pointerId); } catch (err) {}
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
  });
  TOOLS.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !selected) return;
    const it = selected; const def = DEF[it.kind]; const act = b.dataset.act;
    if (act === 'sell') { sell(it); return; }
    if (act === 'copy') { copyItem(it); return; }
    if (act === 'words') { if (def.pal) { openPal(it); return; } const t = (prompt('What should it say?', it.label || def.def || '') || '').trim(); if (!t) return; pushUndo(); it.label = t.slice(0, 18); redrawOne(it); save(); SFX.ding(); return; }
    pushUndo();
    if (act === 'bigger') it.s = def.snap ? Math.min(3, Math.floor(it.s) + 1) : Math.min(3, it.s * 1.18);
    if (act === 'smaller') it.s = def.snap ? Math.max(1, Math.ceil(it.s) - 1) : Math.max(.35, it.s / 1.18);
    if (act === 'flip') it.flip = !it.flip;
    if (act === 'rotate') it.rot = ((it.rot || 0) + 90) % 360;
    if (act === 'front') it.z = Math.max(-1, ...world.items.map(x => x.z)) + 1;
    if (act === 'back') it.z = Math.min(0, ...world.items.map(x => x.z)) - 1;
    if (act === 'color') { it.color = COLOR_KEYS[(COLOR_KEYS.indexOf(it.color || def.color) + 1) % COLOR_KEYS.length]; if (it.pal) it.pal.suit = it.color; shopColor = it.color; paintSwatches(); }
    if (def.snap && (act === 'bigger' || act === 'smaller' || act === 'rotate')) snapItem(it);
    SFX.tap(); render(); save();
  });
  function copyItem(it) {
    const def = DEF[it.kind];
    if (Wallet.get() < def.price) { refuse(def); return; }
    pushUndo(); Wallet.add(-def.price);
    const r = stageRect(); const step = def.snap ? (def.w * it.s) : .06;
    const c = { ...it, uid: uid(), free: false, x: clamp(it.x + step, 0, 1), y: it.y, z: world.items.length };
    if (c.x === it.x) c.y = clamp(it.y + .06, 0, 1);
    if (def.snap) snapItem(c);
    world.items.push(c); selected = c; render(); save(); flashDrop(c); if (def.price) SFX.chaChing(); else SFX.pop();
    toast(def.price ? `Copied the ${def.name} for $${def.price}. Drag it! 👆` : `Copied the ${def.name}! Drag it. 👆`);
  }
  function flashDrop(it) { const d = LAYER.querySelector(`[data-uid="${it.uid}"]`); if (d) d.classList.add('drop'); }

  /* ============================== SHOP ============================== */
  let kit = KITS[0].id;
  function renderCats() {
    CATSEL.innerHTML = '';
    KITS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', c.id === kit); b.dataset.kit = c.id; b.innerHTML = `${c.e}<small>${esc(c.name)}</small>`; b.onclick = () => { kit = c.id; SFX.tap(); renderCats(); renderShelf(); }; CATSEL.appendChild(b); });
  }
  const SWATCHES = $('#swatches');
  function paintSwatches() { $$('button', SWATCHES).forEach(b => b.classList.toggle('on', b.dataset.c === shopColor)); }
  COLOR_KEYS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.dataset.c = c; b.style.background = PAL[c]; b.setAttribute('aria-label', c + ' blocks'); b.onclick = () => { shopColor = c; paintSwatches(); SFX.tap(); if (selected && DEF[selected.kind].colorable) { pushUndo(); selected.color = c; redrawOne(selected); paintTools(); save(); } renderShelf(); }; SWATCHES.appendChild(b); });
  function renderShelf() {
    SHELF.innerHTML = ''; const bucks = Wallet.get();
    const list = ITEMS.filter(d => d.kit === kit);
    $('#swatchRow').hidden = !list.some(d => d.colorable);
    paintSwatches();
    list.forEach((d, i) => {
      const t = document.createElement('button'); t.type = 'button'; t.className = 'tile' + (d.price === 0 ? ' free' : '') + (d.price > bucks ? ' locked' : '') + (d.snap ? ' snapt' : ''); t.dataset.id = d.id; t.style.animationDelay = (Math.min(i, 24) * .02) + 's';
      t.innerHTML = `<span class="thumb">${art(d, { color: d.colorable ? shopColor : d.color, label: d.def }, 't' + d.id)}</span><span class="nm">${esc(d.name)}</span><span class="pr">${d.price === 0 ? 'FREE' : '$' + d.price}</span>`;
      t.setAttribute('aria-label', `${d.name}, ${d.price === 0 ? 'free' : '$' + d.price}`);
      t.onclick = () => buy(d, t); SHELF.appendChild(t);
    });
    const kd = KITS.find(k => k.id === kit); $('#kitTip').textContent = KIT_TIPS[kit] || `Build a ${kd.name.toLowerCase()} and check 💼 Jobs to get paid for it.`;
  }
  const KIT_TIPS = {
    blocks: 'Snap Blocks click onto the grid. Stack them, tap 🎨 to change colors, 🔄 to turn one, 📋 to copy it. 15 blocks = the Block Master job.',
    pieces: 'Walls, roofs, floors, and fences snap to the grid. Put a roof on two walls and you built a house!',
    waterpark: 'Pools, slides, and rivers. Six water things finishes the Water Park job for $15.',
    themepark: 'Snap coaster tracks together, add the loop, park a car on top. Six rides = the Theme Park job.',
    zoo: 'Pens and zoo bars keep the animals in. Put a habitat sign by each one!',
    city: 'Roads snap end to end. Add buildings, a school, lights, and people crossing the street.',
    castle: 'Castle walls and towers snap together. Every kingdom needs a king or queen.',
    space: 'Tubes connect the modules. Plant a flag and light the rocket pad!',
    beach: 'Sand, a pier, a lifeguard tower, and lots of sea friends.',
    people: 'Every world needs people! Kids for the school, a king for the castle, an astronaut for space.',
  };
  function refreshLocks() { const bucks = Wallet.get(); $$('.tile', SHELF).forEach(t => t.classList.toggle('locked', DEF[t.dataset.id].price > bucks)); $('#needBucks').hidden = bucks >= 1; }
  function refuse(def, tile) {
    SFX.buzz(); const w = $('#wallet'); w.classList.remove('sad'); void w.offsetWidth; w.classList.add('sad');
    if (tile) { tile.classList.remove('shake'); void tile.offsetWidth; tile.classList.add('shake'); }
    const ready = collectable().length;
    toast(ready ? `Need $${def.price - Wallet.get()} more. You have ${ready} finished job${ready > 1 ? 's' : ''} to collect! 💼` : `Need $${def.price - Wallet.get()} more for the ${def.name}. Finish a job 💼 or fill the piggy 🐷`);
    $('#needBucks').hidden = false;
  }
  function buy(def, tile, pal) {
    if (Wallet.get() < def.price) { refuse(def, tile); return; }
    if (def.pal && !pal) { openPal(null); return; }
    let label;
    if (def.label) { label = (prompt('What should it say?', def.def) || '').trim(); if (!label) return; label = label.slice(0, 18); }
    pushUndo(); Wallet.add(-def.price);
    const it = { uid: uid(), kind: def.id, x: .5 + (Math.random() - .5) * .14, y: .55 + (Math.random() - .5) * .14, s: 1, flip: false, rot: 0, z: world.items.length, label, color: def.colorable ? shopColor : def.color };
    if (pal) { it.pal = pal; it.color = pal.suit; }
    if (def.snap) { it.x = .5; it.y = .6; snapItem(it); }
    world.items.push(it); selected = it; render(); save(); flashDrop(it);
    if (def.price > 0) SFX.chaChing(); else SFX.pop();
    if (def.price >= 15) { SFX.cheer(); confetti(120); } else if (def.price >= 8) confetti(50);
    const n = world.items.filter(x => x.kind === def.id).length;
    toast(pal ? `Your pal is here! Drag them into your world. Tap ✏️ Dress up to change the costume. 🦸` : def.snap ? `${def.name} snapped in! Drag it onto other pieces, they click together. 🧱` : def.price ? `You bought a ${def.name} for $${def.price}! Drag it anywhere. 👆` : `Free ${def.name}! Drag it anywhere. 👆`);
    if (def.block && n === 1 && world.items.filter(x => DEF[x.kind].block).length === 1) setTimeout(() => toast('Tip: tap 📋 Copy to add the same block again, fast. 🧱'), 2800);
  }
  function sell(it) {
    const def = DEF[it.kind]; const v = val(it); pushUndo();
    world.items = world.items.filter(x => x !== it); selected = null; Wallet.add(v); render(); save();
    SFX.chaChing(); toast(v ? `Sold the ${def.name} for $${v}. Your bucks are back! 💰` : `Removed the ${def.name}.`);
  }
  $('#surpriseBtn').onclick = () => {
    const bucks = Wallet.get(); let pool = ITEMS.filter(d => d.price <= bucks && !d.label); const paid = pool.filter(d => d.price > 0); if (paid.length) pool = paid;
    if (!pool.length) { toast('Nothing in the shop for $0 yet. Finish a job or fill the piggy first! 🐷'); return; }
    buy(pick(pool));
  };

  /* ============================== JOB BOARD: build things, get paid ============================== */
  function kitCounts() { const c = {}; world.items.forEach(it => { const k = DEF[it.kind].kit; c[k] = (c[k] || 0) + 1; }); return c; }
  function jobProgress(job) {
    const c = kitCounts(); let have = 0, need = 0;
    if (job.strokes) { have += Math.min(world.strokes.filter(s => s.c !== 'erase').length, job.strokes); need += job.strokes; }
    for (const k in (job.need || {})) { have += Math.min(c[k] || 0, job.need[k]); need += job.need[k]; }
    return { have, need, done: have >= need };
  }
  const collectable = () => JOBS.filter(j => !world.jobsDone[j.id] && jobProgress(j).done);
  let lastReady = new Set();
  function refreshJobs() {
    const ready = collectable(); const badge = $('#jobsBadge'); badge.textContent = ready.length; badge.hidden = !ready.length;
    $('#jobsBtn').classList.toggle('ready', ready.length > 0);
    for (const j of ready) if (!lastReady.has(j.id)) { toast(`🎉 Job done: ${j.name}! Tap 💼 Jobs to collect your $${j.pay} paycheck.`); SFX.levelUp(); confetti(60); break; }
    lastReady = new Set(ready.map(j => j.id));
    if (!$('#jobsSheet').hidden) renderJobs();
    const fin = $('#finishBtn'); fin.classList.toggle('ready', !world.finished && world.items.length >= 5); fin.disabled = false;
  }
  function renderJobs() {
    const box = $('#jobs'); box.innerHTML = '';
    const list = [...JOBS].sort((a, b) => (world.jobsDone[a.id] ? 1 : 0) - (world.jobsDone[b.id] ? 1 : 0) || jobProgress(b).have / jobProgress(b).need - jobProgress(a).have / jobProgress(a).need);
    list.forEach(j => {
      const p = jobProgress(j); const paid = !!world.jobsDone[j.id];
      const card = document.createElement('div'); card.className = 'job' + (paid ? ' paid' : p.done ? ' done' : ''); card.dataset.job = j.id;
      card.innerHTML = `<div class="je">${j.e}</div><div class="jb"><b>${esc(j.name)}</b><small>${esc(j.how)}</small><div class="jbar"><i style="width:${Math.round(100 * p.have / p.need)}%"></i><span>${p.have} / ${p.need}</span></div></div>
        <div class="jr">${paid ? '<span class="jpaid">PAID ✓</span>' : p.done ? `<button type="button" class="collect">Collect $${j.pay} 💵</button>` : `<span class="jpay">$${j.pay}</span>`}</div>`;
      if (p.done && !paid) card.querySelector('.collect').onclick = () => collect(j, card);
      box.appendChild(card);
    });
    const c = collectable().length; $('#jobsTitle').textContent = c ? `Payday! ${c} job${c > 1 ? 's' : ''} ready 💵` : 'Job Board 💼';
  }
  function collect(job, card) {
    if (world.jobsDone[job.id] || !jobProgress(job).done) return;
    world.jobsDone[job.id] = Date.now(); Wallet.add(job.pay); save();
    if (card) { card.classList.add('paid', 'cash'); card.querySelector('.jr').innerHTML = '<span class="jpaid">PAID ✓</span>'; }
    payday(job.pay, `${job.e} ${job.name} built!`); setTimeout(renderJobs, 900);
  }
  function payday(amt, why) {
    SFX.cheer(); SFX.chaChing(); confetti(160);
    const el = $('#payday'); el.innerHTML = `<b>+$${amt}</b><span>${esc(why)}</span><small>You built it, you earned it. 💪</small>`; el.hidden = false; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
    clearTimeout(payday.t); payday.t = setTimeout(() => { el.hidden = true; }, 2600);
    const w = $('#wallet'); w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump');
  }
  $('#jobsBtn').onclick = () => { renderJobs(); $('#jobsSheet').hidden = false; SFX.tap(); };
  $('#jobsClose').onclick = () => { $('#jobsSheet').hidden = true; };
  $('#jobsSheet').addEventListener('click', e => { if (e.target.id === 'jobsSheet') $('#jobsSheet').hidden = true; });

  /* ============================== FINISH MY WORLD: the big paycheck + the gallery ============================== */
  function worldPay() { const kits = new Set(world.items.map(it => DEF[it.kind].kit)); return clamp(2 * kits.size + Math.floor(world.items.length / 3), 3, 30); }
  const readGallery = () => { try { const g = JSON.parse(localStorage.getItem(GKEY) || '[]'); return Array.isArray(g) ? g : []; } catch (e) { return []; } };
  function writeGallery(g) { try { localStorage.setItem(GKEY, JSON.stringify(g)); return true; } catch (e) { try { g = g.map(w => ({ ...w, world: w.world.bg.type === 'photo' ? { ...w.world, bg: { type: 'scene', id: 'bedroom' } } : w.world })); localStorage.setItem(GKEY, JSON.stringify(g)); return true; } catch (e2) { return false; } } }
  const sceneName = () => world.bg.type === 'photo' ? 'My room' : (SCENES[world.bg.id] || SCENES.bedroom).name;
  async function finishWorld() {
    if (world.finished) { toast('This world already paid out. Tap 🧹 New world to start another and earn again!'); SFX.buzz(); return; }
    if (world.items.length < 5) { toast(`Put at least 5 things in your world first (you have ${world.items.length}). 🏗️`); SFX.buzz(); return; }
    const pay = worldPay(); const btn = $('#finishBtn'); btn.disabled = true; toast('Taking a picture of your world… 📸');
    let thumb = null; try { thumb = await snapshot(420, 'image/jpeg', .72); } catch (e) {}
    const g = readGallery(); const n = g.length + 1;
    const entry = { id: uid(), name: `${sceneName()} #${n}`, when: Date.now(), pay, items: world.items.length, thumb, world: { ...world, finished: true } };
    world.finished = true; world.jobsDone = world.jobsDone || {}; Wallet.add(pay); save();
    g.unshift(entry); while (g.length > 12) g.pop(); const kept = writeGallery(g);
    payday(pay, `🏆 ${entry.name} finished!`);
    setTimeout(() => toast(kept ? `Saved to 📚 My worlds. Tap 🧹 New world to build another and earn again!` : 'Paid! (This browser is out of room to save the picture.)'), 1500);
    btn.disabled = false; refreshJobs();
  }
  $('#finishBtn').onclick = () => { SFX.tap(); finishWorld(); };
  function renderWorlds() {
    const box = $('#worlds'); const g = readGallery(); box.innerHTML = '';
    if (!g.length) { box.innerHTML = '<p class="empty">No finished worlds yet. Build one, then tap 🏆 Finish to get paid and save it here!</p>'; return; }
    g.forEach(w => {
      const card = document.createElement('div'); card.className = 'wcard';
      card.innerHTML = `${w.thumb ? `<img src="${w.thumb}" alt="">` : '<div class="nothumb">🏗️</div>'}<b>${esc(w.name)}</b><small>${w.items} things · earned $${w.pay}</small><div class="row"><button type="button" class="btn btn-sm open">Open</button><button type="button" class="btn btn-sm btn-alt del">🗑️</button></div>`;
      card.querySelector('.open').onclick = () => loadWorld(w);
      card.querySelector('.del').onclick = () => { if (!confirm(`Delete ${w.name} from the gallery?`)) return; writeGallery(readGallery().filter(x => x.id !== w.id)); renderWorlds(); SFX.pop(); };
      box.appendChild(card);
    });
  }
  function loadWorld(w) {
    if (world.items.length && !confirm('Open this saved world? Your current world gets sold back first (you keep the bucks).')) return;
    Wallet.add(refundValue());
    world = upgrade(JSON.parse(JSON.stringify(w.world))); world.finished = true; world.items.forEach(it => { it.free = true; }); selected = null; undo.length = 0;
    renderBg(); render(); redraw(); save(); $('#worldsSheet').hidden = true; SFX.levelUp(); toast(`${w.name} is back! You can keep building it (it already paid out).`);
  }
  $('#worldsBtn').onclick = () => { renderWorlds(); $('#worldsSheet').hidden = false; SFX.tap(); };
  $('#worldsClose').onclick = () => { $('#worldsSheet').hidden = true; };
  $('#worldsSheet').addEventListener('click', e => { if (e.target.id === 'worldsSheet') $('#worldsSheet').hidden = true; });

  /* ============================== MAKE-A-PAL: the dress-up sheet ============================== */
  const { PAL_OPTS, PAL_DEFAULT, OUTFIT_DEFAULTS, SKINS, HAIRC } = ART;
  const PAL_LABELS = {
    outfit: { hero: '🦸 Hero', tee: '👕 Everyday', space: '🧑‍🚀 Astronaut', knight: '🛡️ Knight', pirate: '🏴‍☠️ Pirate', chef: '👩‍🍳 Chef', swim: '🩳 Swimmer', royal: '👑 Royal', wizard: '🧙 Wizard', builder: '👷 Builder' },
    hair: { none: 'None', short: 'Short', spiky: 'Spiky', long: 'Long', curly: 'Curly', ponytail: 'Ponytail', bun: 'Bun', mohawk: 'Mohawk' },
    hat: { none: 'None', cap: '🧢 Cap', crown: '👑 Crown', space: '🪖 Space helmet', knight: '⚔️ Knight helmet', pirate: '🏴‍☠️ Pirate hat', chef: '👩‍🍳 Chef hat', wizard: '🧙 Wizard hat', hardhat: '👷 Hard hat', headband: 'Headband', bow: '🎀 Bow' },
    mask: { none: 'None', domino: '🎭 Hero mask', cowl: '🦇 Night cowl', goggles: '🥽 Goggles', eyepatch: '🏴‍☠️ Eye patch' },
    emblem: { none: 'None', star: '⭐', bolt: '⚡', heart: '❤️', letter: '🔤 My letter', gem: '💎', skull: '💀', paw: '🐾' },
    eyes: { dots: '• •', big: '👀 Big', happy: '^ ^', stars: '⭐ Stars', wink: '😉 Wink' },
    mouth: { smile: '🙂 Smile', grin: '😁 Grin', oh: '😮 Oh!', tongue: '😛 Tongue' },
  };
  let palDraft = null, palTarget = null;
  const PALSHEET = $('#palSheet'), PALPREV = $('#palPreview'), PALOPTS = $('#palOpts');
  function openPal(it) {
    palTarget = it; palDraft = it ? JSON.parse(JSON.stringify({ ...PAL_DEFAULT, ...it.pal, suit: it.color || it.pal.suit })) : { ...PAL_DEFAULT, suit: shopColor, letter: (localStorage.getItem('cb:palLetter') || 'L') };
    $('#palTitle').textContent = it ? 'Dress up your pal ✏️' : 'Make a pal! 🦸';
    $('#palMake').textContent = it ? '✓ Done' : `Make it! $${DEF.pal.price}`;
    renderPal(); PALSHEET.hidden = false; SFX.tap();
  }
  function renderPal() {
    PALPREV.innerHTML = ART.palSVG('prev', { pal: palDraft, color: palDraft.suit });
    const rows = [];
    const chips = (key, list, lab) => `<div class="prow"><b>${lab}</b><div class="chips">${list.map(v => `<button type="button" data-k="${key}" data-v="${esc(String(v))}" class="${String(palDraft[key]) === String(v) ? 'on' : ''}">${PAL_LABELS[key] ? PAL_LABELS[key][v] || v : v}</button>`).join('')}</div></div>`;
    const sw = (key, cols, lab, keys) => `<div class="prow"><b>${lab}</b><div class="chips sw">${cols.map((c, i) => { const v = keys ? keys[i] : i; return `<button type="button" data-k="${key}" data-v="${v}" class="${String(palDraft[key]) === String(v) ? 'on' : ''}" style="background:${c}" aria-label="${lab} ${v}"></button>`; }).join('')}</div></div>`;
    rows.push(chips('outfit', PAL_OPTS.outfit, 'Costume'));
    rows.push(sw('suit', COLOR_KEYS.map(k => PAL[k]), 'Suit color', COLOR_KEYS));
    rows.push(`<div class="prow"><b>Cape</b><div class="chips"><button type="button" data-k="cape" data-v="true" class="${palDraft.cape ? 'on' : ''}">🦸 Cape on</button><button type="button" data-k="cape" data-v="false" class="${!palDraft.cape ? 'on' : ''}">No cape</button></div></div>`);
    rows.push(chips('mask', PAL_OPTS.mask, 'Mask'));
    rows.push(chips('hat', PAL_OPTS.hat, 'Hat'));
    rows.push(chips('emblem', PAL_OPTS.emblem, 'Chest badge') + (palDraft.emblem === 'letter' ? `<div class="prow"><b>Letter</b><div class="chips"><input id="palLetter" maxlength="1" value="${esc(palDraft.letter || 'L')}" aria-label="Badge letter"></div></div>` : ''));
    rows.push(sw('skin', SKINS, 'Skin'));
    rows.push(chips('hair', PAL_OPTS.hair.map((_, i) => i), 'Hair').replace(/data-v="(\d+)"[^>]*>(\d+)</g, (m, i) => m.replace(`>${i}<`, `>${PAL_LABELS.hair[PAL_OPTS.hair[+i]]}<`)));
    rows.push(sw('hairC', HAIRC, 'Hair color'));
    rows.push(chips('eyes', PAL_OPTS.eyes.map((_, i) => i), 'Eyes').replace(/data-v="(\d+)"[^>]*>(\d+)</g, (m, i) => m.replace(`>${i}<`, `>${PAL_LABELS.eyes[PAL_OPTS.eyes[+i]]}<`)));
    rows.push(chips('mouth', PAL_OPTS.mouth.map((_, i) => i), 'Mouth').replace(/data-v="(\d+)"[^>]*>(\d+)</g, (m, i) => m.replace(`>${i}<`, `>${PAL_LABELS.mouth[PAL_OPTS.mouth[+i]]}<`)));
    PALOPTS.innerHTML = rows.join('');
    const li = $('#palLetter'); if (li) li.oninput = () => { palDraft.letter = (li.value || 'L').slice(0, 1).toUpperCase(); localStorage.setItem('cb:palLetter', palDraft.letter); PALPREV.innerHTML = ART.palSVG('prev', { pal: palDraft, color: palDraft.suit }); };
  }
  PALOPTS.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b) return;
    const k = b.dataset.k; let v = b.dataset.v;
    if (k === 'cape') v = v === 'true'; else if (['skin', 'hairC', 'hair', 'eyes', 'mouth'].includes(k)) v = +v;
    palDraft[k] = v;
    if (k === 'outfit') Object.assign(palDraft, OUTFIT_DEFAULTS[v] || {});
    SFX.tap(); renderPal();
    PALPREV.classList.remove('pop'); void PALPREV.offsetWidth; PALPREV.classList.add('pop');
  });
  $('#palRandom').onclick = () => {
    const r = a => a[Math.floor(Math.random() * a.length)];
    palDraft = { ...palDraft, outfit: r(PAL_OPTS.outfit), suit: r(COLOR_KEYS), skin: Math.floor(Math.random() * SKINS.length), hair: Math.floor(Math.random() * PAL_OPTS.hair.length), hairC: Math.floor(Math.random() * HAIRC.length), eyes: Math.floor(Math.random() * PAL_OPTS.eyes.length), mouth: Math.floor(Math.random() * PAL_OPTS.mouth.length) };
    Object.assign(palDraft, OUTFIT_DEFAULTS[palDraft.outfit]); palDraft.hat = r(PAL_OPTS.hat); palDraft.mask = r(PAL_OPTS.mask); palDraft.emblem = r(PAL_OPTS.emblem); palDraft.cape = Math.random() < .5;
    SFX.whoosh ? SFX.whoosh() : SFX.pop(); renderPal();
  };
  $('#palMake').onclick = () => {
    const pal = JSON.parse(JSON.stringify(palDraft));
    if (palTarget) { pushUndo(); palTarget.pal = pal; palTarget.color = pal.suit; redrawOne(palTarget); paintTools(); save(); SFX.ding(); PALSHEET.hidden = true; toast('Looking good! 😎'); return; }
    if (Wallet.get() < DEF.pal.price) { refuse(DEF.pal); return; }
    PALSHEET.hidden = true; shopColor = pal.suit; paintSwatches(); buy(DEF.pal, null, pal);
  };
  $('#palClose').onclick = () => { PALSHEET.hidden = true; };
  PALSHEET.addEventListener('click', e => { if (e.target.id === 'palSheet') PALSHEET.hidden = true; });

  /* ============================== SCENES + PHOTO ============================== */
  function renderScenes() {
    const box = $('#scenes'); box.innerHTML = '';
    Object.entries(SCENES).forEach(([id, sc]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'scene'; b.setAttribute('aria-pressed', world.bg.type === 'scene' && world.bg.id === id);
      b.innerHTML = `<span class="prev">${sc.svg}</span><b>${sc.e} ${esc(sc.name)}</b>`;
      b.onclick = () => { world.bg = { type: 'scene', id }; renderBg(); save(); SFX.ding(); $('#sceneSheet').hidden = true; toast(`Welcome to the ${sc.name}! 🎉`); };
      box.appendChild(b);
    });
  }
  $('#sceneBtn').onclick = () => { renderScenes(); $('#sceneSheet').hidden = false; SFX.tap(); };
  $('#sceneClose').onclick = () => { $('#sceneSheet').hidden = true; };
  $('#sceneSheet').addEventListener('click', e => { if (e.target.id === 'sceneSheet') $('#sceneSheet').hidden = true; });
  const openPhoto = () => { $('#sceneSheet').hidden = true; $('#photoInput').value = ''; $('#photoInput').click(); };
  $('#photoBtn').onclick = openPhoto; $('#sheetPhoto').onclick = openPhoto;
  $('#photoInput').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    toast('Getting your photo ready… 📷');
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        const MAX = 1400; const k = Math.min(1, MAX / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        world.bg = { type: 'photo', data: c.toDataURL('image/jpeg', .82) }; renderBg(); save(); SFX.levelUp(); confetti(80);
        toast('Your room is the world now! Buy stuff and drag it in. 🏠');
      };
      im.onerror = () => toast('That picture did not open. Try another one.');
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  });

  /* ============================== DRAW MODE ============================== */
  const COLORS = ['#052e16', '#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#2563eb', '#a855f7', '#f472b6', '#ffffff'];
  const colorsEl = $('#colors');
  COLORS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + c); b.classList.toggle('on', c === color); b.onclick = () => { color = c; eraser = false; $('#eraserBtn').classList.remove('on'); $$('button', colorsEl).forEach(x => x.classList.toggle('on', x === b)); SFX.tap(); }; colorsEl.appendChild(b); });
  $$('.sizes button').forEach(b => b.onclick = () => { brush = +b.dataset.size; $$('.sizes button').forEach(x => x.classList.toggle('on', x === b)); SFX.tap(); });
  $('#eraserBtn').onclick = () => { eraser = !eraser; $('#eraserBtn').classList.toggle('on', eraser); SFX.tap(); };
  function setDrawing(on) { drawing = on; STAGE.classList.toggle('drawing', on); $('#drawbar').hidden = !on; $('#drawBtn').classList.toggle('on', on); if (on) { select(null); toast('Draw with your finger! Tap ✓ Done when you finish. ✏️'); } }
  $('#drawBtn').onclick = () => setDrawing(!drawing); $('#drawDone').onclick = () => setDrawing(false);
  DRAW.addEventListener('pointerdown', e => {
    if (!drawing) return; e.preventDefault(); pushUndo();
    const r = stageRect(); const st = { c: eraser ? 'erase' : color, w: eraser ? brush * 2.2 : brush, pts: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] };
    world.strokes.push(st); redraw();
    const mv = ev => { st.pts.push([clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1)]); redraw(); };
    const up = () => { DRAW.removeEventListener('pointermove', mv); DRAW.removeEventListener('pointerup', up); DRAW.removeEventListener('pointercancel', up); save(); HINT.hidden = true; };
    try { DRAW.setPointerCapture(e.pointerId); } catch (err) {}
    DRAW.addEventListener('pointermove', mv); DRAW.addEventListener('pointerup', up); DRAW.addEventListener('pointercancel', up);
  });

  /* ============================== UNDO / NEW WORLD / SNAPSHOT ============================== */
  $('#undoBtn').onclick = () => {
    const s = undo.pop(); if (!s) { SFX.buzz(); toast('Nothing to undo yet.'); return; }
    const st = JSON.parse(s); world.items = st.items.filter(it => DEF[it.kind]); world.strokes = st.strokes; Wallet.set(st.wallet); selected = null; render(); redraw(); save(); SFX.pop(); toast('Undone! ↩️');
  };
  $('#newBtn').onclick = () => {
    const refund = refundValue();
    const unpaid = !world.finished && world.items.length >= 5;
    if ((world.items.length || world.strokes.length || world.bg.type === 'photo') && !confirm(`Start a brand-new world?${unpaid ? ' (Tip: tap 🏆 Finish first to get PAID for this one.)' : ''} Everything here gets sold back${refund ? ` (you get $${refund} back)` : ''}.`)) return;
    pushUndo(); Wallet.add(refund); world = fresh(); selected = null; undo.length = 0; lastReady = new Set(); renderBg(); render(); redraw(); save(); SFX.levelUp(); toast(refund ? `Fresh start! $${refund} came back to your wallet. 💰` : 'Fresh start! 🧹');
  };
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  function drawCover(x, im, W, H, anchorBottom) { const k = Math.max(W / im.naturalWidth, H / im.naturalHeight); const w = im.naturalWidth * k, h = im.naturalHeight * k; x.drawImage(im, (W - w) / 2, anchorBottom ? H - h : (H - h) / 2, w, h); }
  async function snapshot(targetW, mime = 'image/png', q) {
    const r = stageRect(); const W = Math.round(targetW || r.width * 2), H = Math.round(W * r.height / r.width);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#bae6fd'; x.fillRect(0, 0, W, H);
    try { const im = await loadImg(world.bg.type === 'photo' ? world.bg.data : svgUrl((SCENES[world.bg.id] || SCENES.bedroom).svg.replace('preserveAspectRatio="xMidYMax slice"', '').replace('<svg ', '<svg width="1200" height="800" '))); drawCover(x, im, W, H, world.bg.type !== 'photo'); } catch (e) {}
    x.drawImage(DRAW, 0, 0, W, H);
    for (const it of [...world.items].sort((a, b) => a.z - b.z)) {
      const def = DEF[it.kind]; const w = def.w * W * it.s; const cx = it.x * W, cy = it.y * H;
      x.save(); x.translate(cx, cy); if (it.rot) x.rotate(it.rot * Math.PI / 180); if (it.flip) x.scale(-1, 1);
      if (def.svg) { try { const s = def.svg('snap' + it.uid, it); const vb = s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const ar = vb ? +vb[2] / +vb[1] : 1; const im = await loadImg(svgUrl(s.replace('<svg ', `<svg width="${vb ? vb[1] : 200}" height="${vb ? vb[2] : 200}" `))); x.drawImage(im, -w / 2, -w * ar / 2, w, w * ar); } catch (e) {} }
      else { x.font = `${w * .85}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(def.e, 0, w * .04); }
      x.restore();
    }
    x.font = `700 ${Math.round(W / 38)}px Fredoka, Nunito, sans-serif`; x.fillStyle = 'rgba(5,46,22,.75)'; x.textAlign = 'right'; x.textBaseline = 'bottom'; x.fillText('chillionbucks.com 😎', W - 16, H - 12);
    return c.toDataURL(mime, q);
  }
  $('#snapBtn').onclick = async () => { SFX.tap(); toast('Saving your picture… 📸'); try { $('#snapImg').src = await snapshot(); $('#snapSheet').hidden = false; SFX.levelUp(); confetti(70); } catch (e) { toast('Could not make the picture. Try again.'); } };
  $('#snapClose').onclick = () => { $('#snapSheet').hidden = true; };
  $('#snapSheet').addEventListener('click', e => { if (e.target.id === 'snapSheet') $('#snapSheet').hidden = true; });

  /* ============================== WALLET DISPLAY, TOAST, CONFETTI ============================== */
  function paintWallet(bump) { const el = $('#walletAmt'); el.textContent = '$' + Wallet.get(); if (bump) { const w = $('#wallet'); w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump'); } refreshLocks(); }
  document.addEventListener('wallet', () => paintWallet(true));
  let toastT = null;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2800); }
  const confetti = (() => {
    const cv = $('#confetti'); const ctx = cv.getContext('2d'); let parts = [], raf = null;
    const cols = ['#22c55e', '#a3e635', '#fbbf24', '#38bdf8', '#ffffff', '#f472b6'];
    function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(p => p.life > 0);
      for (const p of parts) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr; p.life--; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore(); }
      if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    return function burst(n = 100) {
      if (reduced) return; cv.width = innerWidth; cv.height = innerHeight; const r = stageRect(); const ox = r.left + r.width / 2, oy = r.top + r.height * .4;
      for (let i = 0; i < n; i++) parts.push({ x: ox + (Math.random() - .5) * 160, y: oy, vx: (Math.random() - .5) * 14, vy: -(6 + Math.random() * 10), r: 5 + Math.random() * 6, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 100 + Math.random() * 40 });
      if (!raf) tick();
    };
  })();

  /* ============================== INIT ============================== */
  SFX.bind($('#soundBtn'));
  const gain = Wallet.interest();
  renderBg(); render(); renderCats(); renderShelf(); paintWallet(false); sizeDraw(); lastReady = new Set(collectable().map(j => j.id)); refreshJobs();
  if (gain) setTimeout(() => { toast(`🌱 Baby money! Your savings made $${gain} while you were away.`); SFX.levelUp(); confetti(60); }, 500);
  else if (Wallet.get() === 0 && !world.items.length) setTimeout(() => toast('Wallet empty? Grab the FREE things, then finish a 💼 Job to earn. Building pays! 🏗️'), 900);
})();
