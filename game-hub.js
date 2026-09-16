// Shared, on-device game navigation. This never reads or changes game saves.
(() => {
  const games = [
    ['drive','Chill Drive','Follow the arrows. Find your flow.','driving.html'],
    ['park','Water park','Slides, caves, and a lazy river.','waterpark.html'],
    ['town','Your town','Build a neighborhood. Visit your homes.','build.html?world=town'],
    ['blocks','Snap Blocks','Follow a build or dream up your own.','blocks.html'],
    ['reef','Aquarium','Build a home for your fish.','build.html?world=reef'],
    ['pinball','Piggy Pop','Flip, bounce, and light up the table.','pinball.html'],
    ['piggy','Piggy bank','Pick a bank. Drop in your money.','index.html#gPiggy'],
    ['needs','Need or want?','Make a choice. Hear the next card.','index.html#gNW'],
    ['seafood','Seafood Scoop','Aim your claw and collect a catch.','seafood.html'],
    ['coins','Coin Counter','Count the coins. Choose the total.','index.html#gCoins'],
    ['grow','Chill-o-Meter','See how a little saving can grow.','index.html#gMeter'],
    ['classic','Classic creations','Return to your original worlds.','classic.html'],
  ];
  const icon=(id,cls='')=>`<img class="cb-illustration ${cls}" src="assets/icons/${id}.svg" alt="" aria-hidden="true" width="80" height="80">`;
  const filename = location.pathname.split('/').pop() || 'index.html';
  const isHome = filename === 'index.html';
  function currentGame() {
    if(filename === 'build.html') return document.querySelector('#townWorld')?.getAttribute('aria-pressed') === 'true' ? 'town' : 'reef';
    return games.find(g => g[3] === filename || g[3] === filename + location.hash)?.[0];
  }
  let recent = [];
  try { const data=JSON.parse(localStorage.getItem('cb:recent-games:v1') || '[]'); if(Array.isArray(data)) recent=data.filter(id=>games.some(g=>g[0]===id)).slice(0,3); } catch {}
  function remember(id) {
    if(!id)return;
    recent=[id,...recent.filter(x=>x!==id)].slice(0,3);
    try { localStorage.setItem('cb:recent-games:v1',JSON.stringify(recent)); } catch {}
  }
  if(filename!=='build.html'&&(!isHome||location.hash))remember(currentGame());
  if(isHome)window.addEventListener('hashchange',()=>remember(currentGame()));
  const dialog=document.createElement('dialog');
  dialog.id='cbGameMenu';dialog.setAttribute('aria-labelledby','cbMenuTitle');
  dialog.innerHTML='<div class="cb-menu-heading"><div><small>CHILLION BUCKS</small><h2 id="cbMenuTitle">What shall we play?</h2></div><button class="cb-menu-close" aria-label="Close game chooser">✕</button></div><div class="cb-game-grid"></div><div class="cb-menu-footer"><a href="index.html"><img class="cb-utility-icon" src="assets/icons/home.svg" width="20" height="20" alt="">Home</a><span>Your creations stay on this device.</span></div>';
  const grid=dialog.querySelector('.cb-game-grid');
  for(const [id,title,description,url] of games){
    const a=document.createElement('a');a.href=url;a.dataset.game=id;
    a.innerHTML=`<span class="cb-game-icon" aria-hidden="true">${icon(id)}</span><span><b>${title}</b><small>${description}</small></span><span class="cb-game-play" aria-hidden="true">${icon('arrow')}</span>`;
    a.addEventListener('click',()=>{remember(id);dialog.close();});grid.append(a);
  }
  document.body.append(dialog);
  function openMenu(e){
    // Keep normal open-in-new-tab behavior for the original navigation links.
    if(e?.metaKey||e?.ctrlKey||e?.shiftKey||e?.altKey)return;
    e?.preventDefault();
    for(const a of grid.children){if(a.dataset.game===currentGame())a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
    document.documentElement.classList.add('cb-menu-open');
    document.dispatchEvent(new Event('cb:menu-open'));
    dialog.showModal();
  }
  dialog.querySelector('button').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('cb-menu-open');document.dispatchEvent(new Event('cb:menu-close'));});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  // Modal keys keep their native behavior, but cannot reach a game's shortcuts.
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{if(dialog.open)e.stopPropagation();},true);
  const header=document.querySelector('body > header');
  const original=header?.querySelector('a[href="index.html#worlds"]:not(.brand),a.back');
  if(original){original.innerHTML=icon('games')+'<span>Games</span>';original.classList.add('cb-games-link');original.setAttribute('aria-haspopup','dialog');original.addEventListener('click',openMenu);}
  else if(header){const b=document.createElement('button');b.className='cb-games-button';b.innerHTML=icon('games')+'<span>Games</span>';b.setAttribute('aria-haspopup','dialog');b.onclick=openMenu;(isHome?header:(header.querySelector('nav')||header)).append(b);}
  if(isHome&&recent.length){
    const section=document.createElement('section');section.className='cb-recent';section.setAttribute('aria-label','Recently played');
    const label=document.createElement('b');label.textContent='Jump back in';section.append(label);
    for(const id of recent){const g=games.find(g=>g[0]===id);const a=document.createElement('a');a.href=g[3];a.innerHTML=icon(g[0])+'<span>'+g[1]+'</span>';section.append(a);}
    document.querySelector('#worlds')?.prepend(section);
  }
  for(const [selector,id] of [['#gPiggy .game-emoji','piggy'],['#gNW .game-emoji','needs'],['#gCoins .game-emoji','coins'],['#gMeter .game-emoji','grow'],['.world-card.pinball .learning-art','pinball'],['.world-card.learning .learning-art','piggy']]){
    const target=document.querySelector(selector);if(target){target.innerHTML=icon(id);target.classList.add('cb-illustrated');}
  }
  if(filename==='build.html')window.addEventListener('load',()=>remember(currentGame()));
  if(filename==='build.html')for(const id of ['townWorld','reefWorld'])document.getElementById(id)?.addEventListener('click',()=>remember(currentGame()));
})();
