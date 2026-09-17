// Keep native scrolling inside deliberate drawers and preserve the desktop controls.
(() => {
 const file=location.pathname.split('/').pop(),phone=matchMedia('(max-width:800px), (max-height:520px) and (pointer:coarse)');
 if(['build.html','driving.html','waterpark.html','blocks.html'].includes(file))document.body.classList.add('cb-phone-game');
 if(file==='seafood.html')document.body.classList.add('cb-phone-seafood');
 if(file==='pinball.html')document.body.classList.add('cb-phone-pinball');
 const play=e=>e.target.closest?.('#game,.park,.studio,.machine,#ocean,#parkViewport,#viewport,.game');
 for(const type of ['contextmenu','selectstart','dragstart','dblclick'])document.addEventListener(type,e=>{if(play(e)&&!e.target.closest('input,textarea'))e.preventDefault();});
 for(const type of ['gesturestart','gesturechange'])document.addEventListener(type,e=>{if(play(e))e.preventDefault();},{passive:false});
 if(!['build.html','driving.html','waterpark.html','blocks.html'].includes(file))return;
 const b=document.createElement('button');b.className='cb-play-tools';b.textContent='⋯';b.setAttribute('aria-label','Open game options');b.setAttribute('aria-expanded','false');const header=document.querySelector('body>header'),sound=header?.querySelector('#sound,#parkSound,#soundBtn,#blockSound');if(sound)sound.before(b);else(header||document.body).append(b);
 function open(value){document.body.classList.toggle('tools-open',value);b.textContent=value?'×':'⋯';b.setAttribute('aria-expanded',String(value));b.setAttribute('aria-label',value?'Close game options':'Open game options');}
 b.onclick=()=>open(!document.body.classList.contains('tools-open'));
 const drawer=document.createElement('section');drawer.className='cb-phone-options';drawer.setAttribute('aria-label','Game options');
 const heading=document.createElement('h2');heading.textContent='Game options';drawer.append(heading);
 let selectors=[];
 if(file==='build.html'){document.body.append(drawer);selectors=['#collectionBtn','#workBtn','#helpBtn','#motionBtn','#grownupsBtn'];}
 if(file==='driving.html'){document.getElementById('garage').prepend(drawer);selectors=['#familyView','#restart','.coach label','#coachMode','#build','#help'];}
 if(file==='waterpark.html'){document.querySelector('.park-tools').prepend(drawer);selectors=['#pause','#help'];}
 if(file==='blocks.html'){document.querySelector('.workshop').prepend(drawer);selectors=[];}
 const moves=selectors.map(s=>{const el=document.querySelector(s),marker=document.createComment('desktop control');el?.before(marker);return {el,marker};});
 function layout(){for(const {el,marker} of moves)if(el){if(phone.matches)drawer.append(el);else marker.after(el);}if(!phone.matches)open(false);}
 layout();phone.addEventListener('change',layout);
 drawer.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#build'))open(false);});
 document.getElementById('buildPark')?.addEventListener('click',()=>open(true));
 document.querySelector('.park-tools')?.addEventListener('click',e=>{if(e.target.closest('button[data-add],#ride,#grottoView,#grottoFloat,#grottoSlide,#waterView,#cabanaView,#move,#interact,#care'))open(false);});
 document.getElementById('edit')?.addEventListener('click',()=>{document.body.classList.add('phone-route-edit');open(false);requestAnimationFrame(()=>{document.querySelector('.park-tools').scrollTop=0;if(phone.matches)document.getElementById('view')?.click();});});
 for(const id of ['applyRoute','cancelRoute'])document.getElementById(id)?.addEventListener('click',()=>document.body.classList.remove('phone-route-edit'));
 document.getElementById('done')?.addEventListener('click',()=>open(false));
 document.getElementById('tracks')?.addEventListener('click',e=>{if(e.target.closest('button'))open(false);});
 if(file==='blocks.html'){
  document.addEventListener('click',e=>{if(phone.matches&&e.target.closest('#openPieces')){e.preventDefault();e.stopImmediatePropagation();open(true);document.querySelector('.workshop').scrollTop=0;}},true);
  document.getElementById('partShelf')?.addEventListener('click',e=>{if(e.target.closest('button'))open(false);});
 }
})();
