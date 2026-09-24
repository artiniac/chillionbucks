import * as T from './vendor/three.module.js';
import {RaceCore,raceLayout,ITEMS,FIELD,place,racerPortrait} from './driving-race.js?v=1';
import {makeKart,raceProps} from './driving-kart.js?v=1';
import {makeSpeedPlan} from './driving-physics.js?v=1';

const PACE_MAX={gentle:8,cruise:13,zoom:19},ITEM_KINDS=Object.keys(ITEMS);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Connects the race rules to the 3D scene and the race HUD. Computer racers
// never block the player: they steer around, and the player can always drive on.
export class RaceMode {
 constructor(scene,{ui,reduced=false,tell=()=>{},onGo=()=>{},onFinish=()=>{}}){
  Object.assign(this,{scene,ui,reduced,tell,onGo,onFinish});this.core=null;this.karts=new Map();this.hudClock=0;this.orderKey='';this.rollClock=0;this.coinSound=0;
 }
 get active(){return !!this.core;}
 get phase(){return this.core?.phase;}
 get held(){return !!this.core?.held;}
 start({curve,length,width,line,pace,laps,playerId}){
  this.end();
  const max=PACE_MAX[pace]||13,plans=new Map(),lineAt=t=>line.at(t).offset;
  const planFor=grip=>{const key=grip.toFixed(3);if(!plans.has(key))plans.set(key,makeSpeedPlan(line,length,max,{grip:8.8*grip}));return plans.get(key);};
  const layout=raceLayout(curve,width,lineAt);
  Object.assign(this,{curve,length,width});
  this.core=new RaceCore({length,laps,width,layout,playerId,pace,lineAt,planFor});
  this.props=raceProps(curve,layout);this.scene.add(this.props.group);
  for(const cpu of this.core.cpus){if(!this.karts.has(cpu.id))this.karts.set(cpu.id,makeKart(cpu.racer));const rig=this.karts.get(cpu.id);this.scene.add(rig.car);this.pose(cpu,rig,0,0);}
  const u=this.ui;u.hud.hidden=false;u.order.hidden=false;u.results.hidden=true;u.laps.textContent=this.core.laps;u.field.textContent='of '+FIELD;this.orderKey='';
  this.countdown('3',0);this.refresh(true);
  return {travel:this.core.player.travel,lane:this.core.player.lane};
 }
 end(){
  if(!this.core)return;
  for(const rig of this.karts.values())rig.car.removeFromParent();
  this.props?.dispose();this.props=null;this.core=null;clearTimeout(this.goTimer);clearTimeout(this.resultTimer);
  const u=this.ui;u.hud.hidden=u.order.hidden=u.countdown.hidden=u.results.hidden=true;u.item.hidden=true;
 }
 hold(){if(this.core?.phase==='countdown'){this.core.hold();this.countdown('Tap GO',0);}}
 resume(){if(this.core?.held){this.core.resume();this.countdown('3',0);}}
 playerFactor(){return this.core?this.core.playerFactor():1;}
 takeKick(){return this.core?this.core.takeKick():0;}
 playerCap(){return this.core?this.core.playerCap():Infinity;}
 takeNudge(){return this.core?this.core.takeNudge():0;}
 boostAmount(){const p=this.core?.player;return !p||p.finished?0:p.boost>0?1:p.rainbow>0?.55:0;}
 rainbow(){return this.core?.player.rainbow>0;}
 mapDots(){if(!this.core)return [];const L=this.length;return this.core.cpus.map(c=>({t:((c.travel%L)+L)%L/L,color:c.color}));}
 playerMoved(before,after,lane){if(this.core)this.handle(this.core.playerMoved(before,after,lane));}
 useItem(){if(this.core)this.handle(this.core.useItem());}
 miniTurbo(){if(this.core)this.handle(this.core.miniTurbo());}
 update(dt,{running,time,lane}){
  if(!this.core)return;
  this.handle(this.core.update(dt,{running,playerLane:lane}));
  if(!this.core)return;
  for(const cpu of this.core.cpus)this.pose(cpu,this.karts.get(cpu.id),dt,time);
  this.props?.update(dt,time,this.core,this.reduced);
  this.hudClock+=dt;this.rollClock+=dt;this.coinSound=Math.max(0,this.coinSound-dt);
  if(this.hudClock>.12){this.hudClock=0;this.refresh();}
 }
 pose(cpu,rig,dt,time){
  const L=this.length,t=(((cpu.travel%L)+L)%L)/L,p=this.curve.getPointAt(t),d=this.curve.getTangentAt(t),n=new T.Vector3(-d.z,0,d.x).normalize();
  rig.car.position.copy(p).addScaledVector(n,cpu.lane);rig.car.position.y+=.04;
  // A positive yaw turns a +Z-facing car left, while positive lane offsets move right.
  rig.car.rotation.set(-Math.asin(d.y),Math.atan2(d.x,d.z)-cpu.yaw,0,'YXZ');
  for(const w of rig.wheels){w.spin.rotation.x+=cpu.speed*dt/w.radius;if(w.front)w.pivot.rotation.y=-cpu.yaw*2;}
  rig.flames.set(cpu.boost>0?1:0,time);rig.update(time,-cpu.yaw);
 }
 countdown(text,light){
  const u=this.ui;u.countdown.hidden=false;u.countdown.classList.toggle('go',text==='GO!');u.countNumber.textContent=text;
  [...u.lights.children].forEach((bulb,i)=>{bulb.className=text==='GO!'?'green':i<light?'red':'';});
  if(!this.reduced){u.countNumber.classList.remove('pop');void u.countNumber.offsetWidth;u.countNumber.classList.add('pop');}
 }
 handle(events){
  const SFX=window.SFX,core=this.core;
  for(const e of events){
   if(e.type==='count'){this.countdown(String(e.n),4-e.n);SFX?.ding?.();}
   if(e.type==='go'){this.countdown('GO!',3);SFX?.levelUp?.();this.goTimer=setTimeout(()=>{this.ui.countdown.hidden=true;},800);this.tell('Go, go, go! Grab the gift boxes 🎁 and zip over the arrows.');this.onGo();}
   if(e.type==='coin'&&this.coinSound<=0){SFX?.clink?.();this.coinSound=.08;}
   if(e.type==='box'&&e.player)SFX?.pop?.();
   if(e.type==='item'){this.rollClock=0;}
   if(e.type==='boost'&&e.player){SFX?.whoosh?.();if(e.kind==='drift')this.tell('✨ Mini turbo! Great drift.');}
   if(e.type==='magnet')this.tell('🧲 Coin magnet! Coins jump right in.');
   if(e.type==='rainbow')this.tell('🌈 Rainbow ride! Sparkly speed.');
   if(e.type==='lap'){SFX?.ding?.();this.tell(e.final?'🏁 Final lap! You can do it!':'Lap '+e.lap+'! Keep going.');}
   if(e.type==='lead')this.tell('👑 You are in first place!');
   if(e.type==='finish'){SFX?.fanfare?.();this.tell(e.place===1?'🏆 You won the race!':'🏁 You finished '+place(e.place)+'!');this.refresh(true);this.resultTimer=setTimeout(()=>this.showResults(),1200);this.onFinish(e.place);}
  }
  if(events.length&&core)this.refresh(events.some(e=>['item','used','coin','finish'].includes(e.type)));
 }
 refresh(force=false){
  const core=this.core;if(!core)return;const u=this.ui,p=core.player,now=core.place();
  u.place.textContent=place(now);u.lap.textContent=core.lap();u.coins.textContent=p.coins;
  // The item slot spins through the helpers for a moment before it lands.
  const item=u.item;item.hidden=false;
  const rolling=p.rolling>0&&p.item,kind=rolling&&!this.reduced?ITEM_KINDS[Math.floor(this.rollClock*10)%ITEM_KINDS.length]:p.item?.kind;
  const label=kind?ITEMS[kind].name+(p.item?.uses>1&&!rolling?' × '+p.item.uses:''):'Gift box';
  const key=(kind||'none')+label+!!rolling;
  if(force||item.dataset.key!==key){item.dataset.key=key;item.innerHTML='<span class="item-icon" aria-hidden="true">'+(kind?ITEMS[kind].icon:'🎁')+'</span><span class="item-name">'+esc(label)+'</span>';item.disabled=!p.item||!!rolling||core.phase!=='racing';item.classList.toggle('ready',!!p.item&&!rolling);item.setAttribute('aria-label',p.item&&!rolling?'Use '+ITEMS[p.item.kind].name+'. '+ITEMS[p.item.kind].hint:'No helper yet. Drive through a gift box.');}
  else item.disabled=!p.item||!!rolling||core.phase!=='racing';
  const order=core.standings(),orderKey=order.map(r=>r.id).join();
  if(force||orderKey!==this.orderKey){this.orderKey=orderKey;u.order.innerHTML=order.map((r,i)=>'<li class="'+(r.player?'you':'')+'" style="--racer:'+r.color+'"><b>'+(i+1)+'</b>'+racerPortrait(r.racer)+'<span>'+esc(r.player?'You':r.name)+'</span></li>').join('');}
 }
 showResults(){
  const core=this.core;if(!core?.results)return;const u=this.ui,me=core.results.find(r=>r.player),n=me.place,p=core.player;
  u.resultTitle.textContent=n===1?'🏆 You won!':n===2?'Second place!':n===3?'Third place!':place(n)+' place!';
  u.resultNote.textContent=n===1?'First across the line. Wonderful driving!':n<=3?'So close! Hold DRIFT in the turns for mini turbos.':'Every finish gets a cheer! Try the boost arrows and the gift boxes.';
  u.resultStats.textContent='🪙 '+p.coins+' race coins · ✨ '+p.miniTurbos+' mini turbos';
  u.resultList.innerHTML=core.results.map(r=>'<li class="'+(r.player?'you':'')+'" style="--racer:'+r.color+'"><b>'+place(r.place)+'</b>'+racerPortrait(core.racers.find(x=>x.id===r.id).racer)+'<span>'+esc(r.player?'You':r.name)+'</span></li>').join('');
  u.results.hidden=false;u.results.querySelector('button')?.focus({preventScroll:true});
 }
}
