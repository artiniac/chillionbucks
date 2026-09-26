import * as T from './vendor/three.module.js';
import {buildLevel,placeCoins,createRunner,stepRunner,runnerPosition,stars,sanitizeSave,SPEEDS,STEP,HALF} from './coinrun-level.js?v=1';
import {RUNNERS,makeRunner,makeCoins,buildWorld} from './coinrun-models.js?v=1';

const $=s=>document.querySelector(s),KEY='cb:coinrun:v1',TAU=Math.PI*2,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let save=sanitizeSave(null);try{save=sanitizeSave(JSON.parse(localStorage.getItem(KEY)));}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save));}catch{}}
const SFX=window.SFX;SFX?.bind($('#sound'));SFX?.ambience?.('off');

const host=$('#view');let renderer;
try{renderer=new T.WebGLRenderer({antialias:true});}catch{$('#loading').textContent='This device could not start 3D. Try the piggy bank game instead.';throw Error('WebGL unavailable');}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
renderer.domElement.setAttribute('aria-label','Coin Run. Space or the up arrow jumps. Left and right arrows steer.');renderer.domElement.tabIndex=0;host.append(renderer.domElement);
const scene=new T.Scene();scene.fog=new T.Fog('#d9f2ff',150,560);
const camera=new T.PerspectiveCamera(58,1,.1,1800);
scene.add(new T.HemisphereLight('#e6f6ff','#6fae4f',1.5));
const sun=new T.DirectionalLight('#fff3d6',2.4);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:140});sun.shadow.bias=-.0006;scene.add(sun,sun.target);

const level=buildLevel(),world=buildWorld(scene,level);
const pourMesh=makeCoins(30);pourMesh.count=0;scene.add(pourMesh);
let coinMesh=null,coins=[],taken=new Uint8Array(0),takenAt=new Float32Array(0),yaw=[],runner=createRunner(level,save.speed),rig=null,phase='menu',paused=false,clock=0,acc=0,count=0,finishAt=0,pour=[],coinSound=0,toastTimer=0;
const input={left:false,right:false,jump:false};

function toast(text,seconds=1.6){$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=seconds;}
function setRunner(id){
 save.runner=RUNNERS[id]?id:'leo';persist();
 if(rig)scene.remove(rig.root);rig=makeRunner(save.runner);scene.add(rig.root);
 const card=$(`#runners [data-runner="${save.runner}"]`);for(const b of $('#runners').children)b.setAttribute('aria-pressed',String(b===card));
 if(RUNNERS[save.runner].head){$('#runnerNote').textContent='Getting '+RUNNERS[save.runner].name+' ready…';rig.ready.then(()=>{if(rig.def===RUNNERS[save.runner])$('#runnerNote').textContent=RUNNERS[save.runner].name+' is ready to run!';});}
 else $('#runnerNote').textContent='Buddy is ready to run!';
}
function renderMenu(){
 $('#runners').replaceChildren(...Object.entries(RUNNERS).map(([id,r])=>{const b=document.createElement('button');b.type='button';b.dataset.runner=id;b.className='runner-card';b.style.setProperty('--shirt',r.shirt);b.innerHTML='<span class="runner-icon" aria-hidden="true">'+r.icon+'</span><b>'+r.name+'</b>';b.onclick=()=>setRunner(id);return b;}));
 const names={easy:'🐢 Easy',fast:'⭐ Fast',super:'⚡ Super fast'};
 $('#speeds').replaceChildren(...Object.keys(SPEEDS).map(k=>{const b=document.createElement('button');b.type='button';b.textContent=names[k];b.setAttribute('aria-pressed',String(k===save.speed));b.onclick=()=>{save.speed=k;persist();for(const x of $('#speeds').children)x.setAttribute('aria-pressed',String(x===b));showBest();};return b;}));
 $('#helper').checked=save.helper;$('#helper').onchange=e=>{save.helper=e.target.checked;persist();};showBest();
}
function starText(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function showBest(){const b=save.best[save.speed];$('#best').textContent=b.coins?'Best here: '+b.coins+' coins · '+starText(b.stars):'No run yet at this speed. Go for it!';}

function startRun(){
 coins=placeCoins(level,SPEEDS[save.speed]);taken=new Uint8Array(coins.length);takenAt=new Float32Array(coins.length);
 yaw=coins.map(c=>{const t=level.frame(c.s).t;return Math.atan2(t[0],t[2]);});
 if(coinMesh){scene.remove(coinMesh);coinMesh.dispose();}coinMesh=makeCoins(coins.length);scene.add(coinMesh);
 runner=createRunner(level,save.speed);world.resetPosts();pour=[];pourMesh.count=0;acc=0;paused=false;
 $('#coinTotal').textContent=coins.length;$('#coinCount').textContent='0';$('#progress').value=0;
 $('#menu').hidden=true;$('#results').hidden=true;$('#pauseCard').hidden=true;document.body.classList.add('running');
 phase='count';count=1.8;$('#count').hidden=false;$('#count').textContent='Ready…';SFX?.unlock?.();SFX?.ding?.();
 renderer.domElement.focus({preventScroll:true});
}
function openMenu(){phase='menu';paused=false;document.body.classList.remove('running');$('#menu').hidden=false;$('#results').hidden=true;$('#pauseCard').hidden=true;$('#count').hidden=true;runner=createRunner(level,save.speed);world.resetPosts();if(coinMesh)coinMesh.count=0;pourMesh.count=0;showBest();$('#run').focus({preventScroll:true});}
function setPaused(value){if(phase!=='run'&&phase!=='count')return;paused=value;$('#pauseCard').hidden=!paused;$('#pause').setAttribute('aria-pressed',String(paused));input.left=input.right=false;if(paused)$('#resume').focus({preventScroll:true});else renderer.domElement.focus({preventScroll:true});}

function handle(events){
 for(const e of events){
  if(e.type==='coin'){takenAt[e.index]=clock;$('#coinCount').textContent=runner.coins;if(coinSound<=0){SFX?.clink?.();coinSound=.06;}}
  if(e.type==='jump')SFX?.tap?.();
  if(e.type==='spring'){world.fireSpring(runner.s);SFX?.pop?.();toast('Boing!',1);}
  if(e.type==='dash'){SFX?.whoosh?.();toast('Zoom!',.9);}
  if(e.type==='bonk'){SFX?.tap?.();toast('Bonk! Jump over the logs.',1.6);}
  if(e.type==='loop'){SFX?.levelUp?.();toast('Loop de loop!',1.4);}
  if(e.type==='checkpoint'){world.lightPost(e.s);SFX?.ding?.();toast('⭐ Checkpoint!',1.2);}
  if(e.type==='fall'){SFX?.splash?.();toast('🫧 Splash! Bubble back. I will help with that jump.',2.4);}
  if(e.type==='finish'){phase='finish';finishAt=clock;SFX?.fanfare?.();toast('🐷 Into the piggy bank!',2);}
 }
}

// Coins leave the runner in a stream and drop into the piggy's slot.
function startPour(){const from=new T.Vector3(...runnerPosition(runner,level));from.y+=1;const n=Math.min(30,runner.coins);pour=Array.from({length:n},(_,i)=>({from:from.clone().add(new T.Vector3((Math.random()-.5)*.6,Math.random()*.4,(Math.random()-.5)*.6)),delay:i*.05,done:false}));pourMesh.count=n;}
function updatePour(dt){
 const m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3(),slot=world.anim.slot,t=clock-finishAt-.7;let active=false;
 pour.forEach((c,i)=>{const k=Math.min(1,Math.max(0,(t-c.delay)/.6));if(k<1)active=true;if(k>=1&&!c.done){c.done=true;if(i%3===0)SFX?.coinDrop?.();}
  p.copy(c.from).lerp(slot,k);p.y+=Math.sin(k*Math.PI)*2.2;q.setFromAxisAngle(new T.Vector3(0,1,0),clock*6+i);s.setScalar(k>=1?0:.8);m.compose(p,q,s);pourMesh.setMatrixAt(i,m);});
 pourMesh.instanceMatrix.needsUpdate=true;return active||t<0;
}
function showResults(){
 phase='results';document.body.classList.remove('running');const n=stars(runner.coins,coins.length),best=save.best[save.speed];
 const better=runner.coins>best.coins;if(better||n>best.stars){save.best[save.speed]={coins:Math.max(best.coins,runner.coins),stars:Math.max(best.stars,n)};persist();}
 $('#resultStars').textContent=starText(n);$('#resultStars').setAttribute('aria-label',n+' of 3 stars');
 $('#resultTitle').textContent=n===3?'Wow! Almost every coin!':n===2?'Great run!':'You made it!';
 $('#resultCoins').textContent='🪙 '+runner.coins+' of '+coins.length+' coins';
 $('#resultNote').textContent=(better&&best.coins?'New best! ':'')+(n===3?'That is a super saver run.':'Steer left and right to grab even more coins.')+' Time: '+Math.round(runner.time)+' seconds.';
 $('#results').hidden=false;$('#again').focus({preventScroll:true});
}

// Input: keys, big buttons, and a tap anywhere on the game to jump.
addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||$('#help').open)return;
 if(['ArrowLeft','KeyA'].includes(e.code)){input.left=true;e.preventDefault();}
 if(['ArrowRight','KeyD'].includes(e.code)){input.right=true;e.preventDefault();}
 if(['Space','ArrowUp','KeyW'].includes(e.code)&&!e.target.matches('button')){e.preventDefault();if(!e.repeat)input.jump=true;}
 if(['KeyP','Escape'].includes(e.code)&&(phase==='run'||phase==='count')){e.preventDefault();setPaused(!paused);}});
addEventListener('keyup',e=>{if(['ArrowLeft','KeyA'].includes(e.code))input.left=false;if(['ArrowRight','KeyD'].includes(e.code))input.right=false;});
for(const [id,key] of [['left','left'],['right','right']]){const b=$('#'+id);b.onpointerdown=e=>{e.preventDefault();input[key]=true;b.setPointerCapture(e.pointerId);};for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>input[key]=false);}
$('#jump').onpointerdown=e=>{e.preventDefault();input.jump=true;};$('#jump').onkeydown=e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();input.jump=true;}};
renderer.domElement.addEventListener('pointerdown',e=>{if(phase==='run'&&!paused){e.preventDefault();input.jump=true;}});
$('#run').onclick=startRun;$('#again').onclick=startRun;$('#change').onclick=openMenu;$('#pause').onclick=()=>setPaused(!paused);$('#resume').onclick=()=>setPaused(false);$('#quit').onclick=openMenu;
$('#helpButton').onclick=()=>{setPaused(true);$('#help').showModal();};$('#closeHelp').onclick=()=>$('#help').close();
function away(){if(phase==='run'||phase==='count')setPaused(true);}
addEventListener('blur',away);document.addEventListener('visibilitychange',()=>{if(document.hidden)away();});document.addEventListener('cb:menu-open',away);

function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?68:58;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(host);resize();

const pos=[0,0,0],v=new T.Vector3(),fw=new T.Vector3(),up=new T.Vector3(),rt=new T.Vector3(),basis=new T.Matrix4(),camPos=new T.Vector3(),camLook=new T.Vector3(),wantPos=new T.Vector3(),wantLook=new T.Vector3(),cm=new T.Matrix4(),cq=new T.Quaternion(),cp=new T.Vector3(),cs=new T.Vector3(),Y=new T.Vector3(0,1,0);
let last=0,cameraReady=false;
function poseRunner(dt){
 runnerPosition(runner,level,pos);v.set(...pos);
 if(runner.mode==='loop'){const f=level.frame(runner.loop.s),th=runner.theta;fw.set(f.t[0]*Math.cos(th),Math.sin(th),f.t[2]*Math.cos(th)).normalize();up.set(-f.t[0]*Math.sin(th),Math.cos(th),-f.t[2]*Math.sin(th)).normalize();}
 else{const f=level.frame(runner.s);fw.set(f.t[0],0,f.t[2]).normalize();up.copy(Y);}
 rt.crossVectors(up,fw).normalize();basis.makeBasis(rt,up,fw);rig.root.quaternion.setFromRotationMatrix(basis);rig.root.position.copy(v);
 rig.root.visible=true;if(runner.mode==='respawn'){rig.root.position.y+=Math.min(3,(0.9-runner.respawn)*4);}
 rig.animate({speed:runner.v,onGround:runner.onGround,vy:runner.vy,mode:phase==='menu'||phase==='count'?'ready':phase==='finish'||phase==='results'?'finish':runner.mode},dt,clock,reduced);
}
function aimCamera(dt){
 // On the start screen the camera faces the runner; on wide screens the runner sits right of the menu card.
 if(phase==='menu'){const f=level.frame(runner.s),sway=reduced?0:Math.sin(clock*.4)*.8,wide=camera.aspect>1.2?1.9:0,h=rig.height;wantPos.set(v.x+f.t[0]*(h*3.4)+f.n[0]*sway,v.y+h*.95,v.z+f.t[2]*(h*3.4)+f.n[2]*sway);wantLook.set(v.x+f.n[0]*wide*h/1.4,v.y+h*.72,v.z+f.n[2]*wide*h/1.4);}
 else if(runner.mode==='loop'){const f=level.frame(runner.loop.s),r=runner.loop.r;wantLook.set(f.p[0],f.p[1]+r,f.p[2]);wantPos.set(f.p[0]+f.n[0]*r*2.6-f.t[0]*r*.4,f.p[1]+r*1.1,f.p[2]+f.n[2]*r*2.6-f.t[2]*r*.4);}
 else if(phase==='finish'||phase==='results'){const f=level.frame(level.goal);wantLook.set(f.p[0],f.p[1]+2,f.p[2]);wantPos.set(f.p[0]-f.t[0]*9+f.n[0]*5,f.p[1]+4,f.p[2]-f.t[2]*9+f.n[2]*5);}
 else{const f=level.frame(runner.s),a=level.frame(runner.s+10),lat=runner.x*.45;wantPos.set(f.p[0]-f.t[0]*7.5+f.n[0]*lat,Math.max(f.p[1],runner.y)+3.4,f.p[2]-f.t[2]*7.5+f.n[2]*lat);wantLook.set(a.p[0]+a.n[0]*runner.x*.3,Math.max(a.p[1],runner.y*.5+a.p[1]*.5)+1.2,a.p[2]+a.n[2]*runner.x*.3);}
 if(!cameraReady){camPos.copy(wantPos);camLook.copy(wantLook);cameraReady=true;}
 const k=1-Math.exp(-dt*(runner.mode==='loop'?3:reduced?8:6));camPos.lerp(wantPos,k);camLook.lerp(wantLook,k);camera.position.copy(camPos);camera.lookAt(camLook);
 sun.position.set(v.x+30,v.y+55,v.z+20);sun.target.position.copy(v);
}
function drawCoins(){
 if(!coinMesh)return;coinMesh.count=coins.length;
 for(let i=0;i<coins.length;i++){const c=coins[i];let lift=reduced?0:Math.sin(clock*3+i)*.1,scale=1;
  if(taken[i]){const k=(clock-takenAt[i])/.3;if(k>1)scale=0;else{lift+=k*1.2;scale=1-k*.6;}}
  cq.setFromAxisAngle(Y,yaw[i]+(reduced?0:clock*3+i*.4));cp.set(c.pos[0],c.pos[1]+lift,c.pos[2]);cs.setScalar(scale);cm.compose(cp,cq,cs);coinMesh.setMatrixAt(i,cm);}
 coinMesh.instanceMatrix.needsUpdate=true;
}
function frame(now){
 requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(document.hidden)return;clock+=dt;coinSound-=dt;
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('#toast').hidden=true;}
 if(phase==='count'&&!paused){const before=count;count-=dt;if(before>1.2&&count<=1.2){$('#count').textContent='Set…';SFX?.ding?.();}if(before>.6&&count<=.6){$('#count').textContent='Go!';SFX?.levelUp?.();}if(count<=0){$('#count').hidden=true;phase='run';runner.mode='run';}}
 if(phase==='run'&&!paused){acc+=dt;while(acc>=STEP&&phase==='run'){acc-=STEP;const events=stepRunner(runner,level,coins,taken,{steer:(input.right?1:0)-(input.left?1:0),jump:input.jump,helper:save.helper},STEP);input.jump=false;handle(events);}$('#progress').value=Math.min(1,runner.s/level.finish);}
 if(phase==='finish'){stepRunner(runner,level,coins,taken,{},dt);if(clock-finishAt>.7&&!pour.length&&runner.coins)startPour();if(pour.length?!updatePour(dt):clock-finishAt>1.2)showResults();}
 if(rig){poseRunner(dt);aimCamera(dt);}
 drawCoins();world.update(dt,clock,reduced);
 const r=host.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)renderer.render(scene,camera);
}
renderMenu();setRunner(save.runner);
const ticks=level.checkpoints.slice(1).map(s=>{const i=document.createElement('i');i.style.left=(s/level.finish*100)+'%';return i;});$('#ticks').replaceChildren(...ticks);
$('#loading').remove();$('#game').removeAttribute('aria-busy');requestAnimationFrame(frame);
