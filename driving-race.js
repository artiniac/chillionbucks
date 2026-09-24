import {motionStep} from './driving-physics.js?v=1';

// Friendly races for Chill Drive. Pure rules with no rendering, so tests can run
// whole races in Node. Race coins are play points: nothing here touches Wallet.
export const RACERS=[
 {id:'crew',name:'Leo and Dad',ride:'Skyline',color:'#b90920',accent:'#fff1dc',suit:'#223038',skin:'#e7b48f',speed:4,grip:3,boost:3},
 {id:'mango',name:'Mango',ride:'Kart',color:'#f08a24',accent:'#ffe6a8',suit:'#8a4210',skin:'#f1c29a',speed:3,grip:4,boost:3},
 {id:'pickle',name:'Pickle',ride:'Kart',color:'#43a047',accent:'#e4f7c8',suit:'#1f5a22',skin:'#c68a5e',speed:2,grip:5,boost:3},
 {id:'blueberry',name:'Blueberry',ride:'Kart',color:'#3867d6',accent:'#d6e4ff',suit:'#1b2f6b',skin:'#8d5a3b',speed:4,grip:2,boost:4},
 {id:'bubblegum',name:'Bubblegum',ride:'Kart',color:'#e45da6',accent:'#ffe0f0',suit:'#7a1d52',skin:'#f3d2b5',speed:3,grip:3,boost:4},
 {id:'sunny',name:'Sunny',ride:'Kart',color:'#f3c623',accent:'#fff7cc',suit:'#7a5c00',skin:'#e0a878',speed:5,grip:2,boost:3},
 {id:'nova',name:'Nova',ride:'Kart',color:'#6c4fd1',accent:'#e6dcff',suit:'#2e1f66',skin:'#b77b55',speed:3,grip:2,boost:5}
];
export const RACE_LAPS=[1,2,3],FIELD=6,PLAYER_SLOT=3,COUNTDOWN=3.4;
export const GAP=2.3,PAD_HALF=1.5,PAD_HIT=1.85,BOX_HIT=1.3,COIN_HIT=1.2,COIN_SPACING=2.6;
export const ITEMS={
 turbo:{name:'Turbo',icon:'🚀',uses:1,hint:'One big whoosh!'},
 triple:{name:'Triple turbo',icon:'🔥',uses:3,hint:'Three whooshes. Tap three times!'},
 magnet:{name:'Coin magnet',icon:'🧲',uses:1,hint:'Every coin you pass jumps in.'},
 rainbow:{name:'Rainbow ride',icon:'🌈',uses:1,hint:'Six sparkly seconds of extra speed.'}
};
export const BOOSTS={pad:{seconds:1.1,factor:1.3},drift:{seconds:.8,factor:1.24},turbo:{seconds:1.5,factor:1.34}};
// A box a computer racer takes returns almost at once, so there is always one left for the player.
const RAINBOW={seconds:6,factor:1.2},MAGNET=8,BOX_RESPAWN=3,CPU_BOX_RESPAWN=.6,COIN_RESPAWN=12,ROLL=.9;
export const RESPAWN={box:BOX_RESPAWN,coin:COIN_RESPAWN};
const CPU_SKILL={gentle:1,cruise:1.03,zoom:1.03},CPU_JITTER=[0,.012,-.01,.006,-.004,.003];

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const stat=(r,key)=>clamp(Math.round(Number(r?.[key])||3),1,5);
export const racerById=id=>RACERS.find(r=>r.id===id)||RACERS[0];
// Small, honest differences: every racer can win.
export function tuning(r){return {top:.975+stat(r,'speed')*.008,grip:.92+stat(r,'grip')*.035,boost:.85+stat(r,'boost')*.06};}
export function laneLimit(width){return Math.max(.8,width/2-1.3);}
export function place(n){return n===1?'1st':n===2?'2nd':n===3?'3rd':n+'th';}
export function coinPower(coins){return 1+Math.min(10,Math.max(0,coins))*.003;}
// Positive when the player is ahead. Racers far ahead ease off and racers far
// behind try a little harder, so the pack stays close without taking control away.
export function catchUp(gap){return gap<0?Math.max(.95,1+gap*.0015):Math.min(1.12,1+gap*.004);}
// Signed distance from one track position to another, in [-length/2, length/2).
export function trackGap(from,to,length){let g=((to-from)%length+length)%length;if(g>=length/2)g-=length;return g;}
// True when a racer moving from before to after passes the track mark at, on any lap.
export function passes(before,after,at,length){
 if(![before,after,at,length].every(Number.isFinite)||length<=0||after<=before)return false;
 const first=at+(Math.floor((before-at)/length)+1)*length;return first<=after;
}
export function gridSlots(count,width){
 const side=Math.min(1.8,laneLimit(width));
 return Array.from({length:count},(_,i)=>({back:5+Math.floor(i/2)*6.5+(i%2)*2.6,lane:i%2?side:-side}));
}
// Leaders mostly roll simple turbos; racers further back roll the bigger helpers.
export function rollItem(position,count,random=Math.random){
 const back=count>1?clamp((position-1)/(count-1),0,1):0;
 const weights=[['turbo',1.3-back*.7],['magnet',.8],['triple',.25+back*.85],['rainbow',.08+back*.9]];
 let pick=random()*weights.reduce((s,[,w])=>s+w,0);
 for(const [kind,w] of weights){pick-=w;if(pick<0)return kind;}
 return 'turbo';
}
export function standings(racers){
 return [...racers].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.travel-a.travel);
}

// Deterministic item placement on the straightest parts of any closed track.
export function raceLayout(curve,width=8,lineAt=()=>0){
 const length=curve.getLength(),limit=laneLimit(width),n=Math.max(80,Math.round(length/2)),step=length/n;
 const heading=Array.from({length:n},(_,i)=>{const d=curve.getTangentAt(i/n);return Math.atan2(d.x,d.z);});
 const reach=Math.max(1,Math.round(6/step)),win=Math.max(1,Math.round(12/step));
 const turn=heading.map((_,i)=>{const a=heading[(i+reach)%n]-heading[(i-reach+n)%n];return Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));});
 const bend=turn.map((_,i)=>{let m=0;for(let k=-win;k<=win;k++)m=Math.max(m,turn[(i+k+n)%n]);return m;});
 const startClear=Math.min(28,length*.1),gridClear=Math.min(36,length*.13),taken=[];
 function pick(fraction,gap,span=0){
  for(const most of [.2,.35,.6,Infinity]){
   let best=null;
   for(let i=0;i<n;i++){const at=i*step;if(at<startClear||at+span>length-gridClear||bend[i]>most)continue;if(taken.some(x=>Math.abs(trackGap(x,at,length))<gap+span))continue;const score=Math.abs(trackGap(fraction*length,at,length))/length+bend[i]*.15;if(!best||score<best.score)best={at,score};}
   if(best){taken.push(best.at);return best.at;}
  }
  return null;
 }
 const across=width>=14?5:3,spread=k=>-limit*.8+limit*1.6*k/(across-1),padLane=width/2-PAD_HALF-.25;
 const boxes=[.3,.7].map(f=>pick(f,40)).filter(v=>v!==null).map(at=>({at,lanes:Array.from({length:across},(_,k)=>spread(k))}));
 const short=length<350,pads=(short?[.15,.6]:[.15,.52,.86]).map(f=>pick(f,30)).map((at,k)=>at===null?null:{at,lane:clamp(k===0?lineAt(at/length):(k%2?-1:1)*limit*.5,-padLane,padLane)}).filter(Boolean);
 const coins=[];
 (short?[.45,.88]:[.42,.64,.94]).map(f=>pick(f,14,COIN_SPACING*4)).forEach((at,k)=>{if(at===null)return;for(let j=0;j<5;j++){const x=(at+j*COIN_SPACING)%length,diagonal=(j/2-1)*limit*.6;coins.push({at:x,lane:clamp(k===0?lineAt(x/length):k===1?diagonal:-diagonal,-limit,limit)});}});
 return {length,width,limit,pads,boxes,coins};
}

// Choose where a computer racer steers: its own lane, around anyone just ahead,
// out of the player's way, and sometimes onto a boost arrow.
export function laneGoal(me,others,{length,limit,line=0,pads=[],seeksPads=false}){
 let goal=me.home*.55+line*.45,cap=Infinity,urgent=false;
 if(seeksPads)for(const p of pads){const g=trackGap(me.pos,p.at,length);if(g>4&&g<30){goal=p.lane;break;}}
 for(const o of others){
  const g=trackGap(me.pos,o.pos,length),side=Math.abs(o.lane-me.lane);
  if(g>0&&g<8&&side<2.2){const left=o.lane-2.4,right=o.lane+2.4,leftOk=left>=-limit,rightOk=right<=limit;goal=leftOk&&(!rightOk||Math.abs(left-me.lane)<=Math.abs(right-me.lane))?left:rightOk?right:goal;if(g<4.2)cap=Math.min(cap,o.speed*.98);}
  if(o.player&&g<3.5&&g>-12&&Math.abs(o.lane-goal)<2.4){goal=o.lane+(me.lane>=o.lane?2.6:-2.6);urgent=true;if(Math.abs(goal)>limit+.1&&g>-4)cap=Math.min(cap,o.speed*.9);}
 }
 return {goal:clamp(goal,-limit,limit),cap,urgent};
}

export class RaceCore {
 constructor({length,laps=2,width=8,layout,playerId='crew',pace='cruise',lineAt=()=>0,planFor,random=Math.random}){
  Object.assign(this,{length,laps:RACE_LAPS.includes(laps)?laps:2,width,layout,pace,lineAt,planFor,random});
  this.limit=laneLimit(width);this.finishTravel=(this.laps+1)*length;this.phase='countdown';this.countdown=COUNTDOWN;this.held=false;this.clock=0;this.lastCount=4;
  const me=racerById(playerId),slots=gridSlots(FIELD,width),homes=[-.7,.7,-.25,.25,0];
  // Leo and Dad always ride in the Skyline, so computer racers are the kart drivers.
  const rivals=RACERS.filter(r=>r.id!==me.id&&r.id!=='crew');while(rivals.length>FIELD-1)rivals.splice(Math.floor(random()*rivals.length),1);
  this.player={id:me.id,name:me.name,color:me.color,racer:me,player:true,tune:tuning(me),travel:length-slots[PLAYER_SLOT].back,lane:slots[PLAYER_SLOT].lane,speed:0,coins:0,item:null,rolling:0,boost:0,boostFactor:1,rainbow:0,magnet:0,kick:0,finished:false,finishTime:0,lap:0,miniTurbos:0};
  const open=slots.filter((_,i)=>i!==PLAYER_SLOT);
  this.cpus=rivals.map((r,i)=>({id:r.id,name:r.name,color:r.color,racer:r,player:false,tune:tuning(r),skill:(CPU_SKILL[pace]||CPU_SKILL.cruise)+CPU_JITTER[i],home:homes[i]*this.limit,seeksPads:i%2===0,travel:length-open[i].back,lane:open[i].lane,speed:0,boost:0,boostFactor:1,pending:-1,finished:false,finishTime:0,yaw:0}));
  this.boxes=(layout?.boxes||[]).map(row=>({...row,wait:row.lanes.map(()=>0)}));
  this.coins=(layout?.coins||[]).map(c=>({...c,wait:0}));
  this.results=null;this.bestPlace=this.place();
 }
 get racers(){return [this.player,...this.cpus];}
 standings(){return standings(this.racers);}
 place(){return this.standings().indexOf(this.player)+1;}
 lap(){return clamp(Math.floor(this.player.travel/this.length),1,this.laps);}
 hold(){if(this.phase==='countdown'){this.held=true;this.countdown=COUNTDOWN;this.lastCount=4;}}
 resume(){this.held=false;}
 boostFactor(){const p=this.player;if(p.finished)return .65;return p.boost>0?p.boostFactor:p.rainbow>0?RAINBOW.factor:1;}
 playerFactor(){const p=this.player;return p.tune.top*(p.finished?1:coinPower(p.coins))*this.boostFactor();}
 takeKick(){const k=this.player.kick;this.player.kick=0;return k;}
 // The player matches a kart just ahead in the same lane until it moves aside.
 playerCap(){const L=this.length,p=this.player,pos=((p.travel%L)+L)%L;let cap=Infinity;if(p.finished)return cap;for(const c of this.cpus){const g=trackGap(pos,((c.travel%L)+L)%L,L);if(g>0&&g<4.6&&Math.abs(c.lane-p.lane)<1.9)cap=Math.min(cap,c.speed);}return cap;}
 boost(r,kind,events){const b=BOOSTS[kind];r.boost=Math.max(r.boost,b.seconds*r.tune.boost);r.boostFactor=Math.max(r.boostFactor||1,b.factor);r.kick=Math.max(r.kick||0,b.factor);events?.push({type:'boost',kind,id:r.id,player:r.player});}
 miniTurbo(){const e=[];if(this.phase!=='racing'||this.player.finished)return e;this.player.miniTurbos++;this.boost(this.player,'drift',e);return e;}
 useItem(){
  const p=this.player,e=[];if(this.phase!=='racing'||p.finished||!p.item||p.rolling>0)return e;
  const kind=p.item.kind;
  if(kind==='turbo'||kind==='triple')this.boost(p,'turbo',e);
  if(kind==='magnet'){p.magnet=MAGNET;e.push({type:'magnet'});}
  if(kind==='rainbow'){p.rainbow=RAINBOW.seconds*p.tune.boost;p.kick=Math.max(p.kick,RAINBOW.factor);e.push({type:'rainbow'});}
  p.item.uses--;if(p.item.uses<=0)p.item=null;e.push({type:'used',kind});return e;
 }
 // Player pickups use the lane the car drove across, then laps and the finish.
 playerMoved(before,after,lane){
  const p=this.player,e=[],L=this.length;if(this.phase==='countdown'||!(after>before))return e;
  p.travel=after;p.lane=lane;
  if(!p.finished){
   this.layout?.pads?.forEach((pad,i)=>{if(passes(before,after,pad.at,L)&&Math.abs(lane-pad.lane)<PAD_HIT){this.boost(p,'pad',e);e.push({type:'pad',index:i});}});
   this.boxes.forEach((row,r)=>{if(!passes(before,after,row.at,L))return;row.lanes.forEach((x,i)=>{if(row.wait[i]<=0&&Math.abs(lane-x)<BOX_HIT){row.wait[i]=BOX_RESPAWN;e.push({type:'box',row:r,index:i,player:true});if(!p.item){const kind=rollItem(this.place(),FIELD,this.random);p.item={kind,uses:ITEMS[kind].uses};p.rolling=ROLL;e.push({type:'item',kind});}}});});
   this.coins.forEach((c,i)=>{if(c.wait<=0&&passes(before,after,c.at,L)&&(p.magnet>0||Math.abs(lane-c.lane)<COIN_HIT)){c.wait=COIN_RESPAWN;p.coins++;e.push({type:'coin',index:i,coins:p.coins});}});
  }
  const lap=Math.floor(after/L);
  if(!p.finished&&lap>p.lap){p.lap=lap;if(after>=this.finishTravel)this.finish(p,e);else if(lap>1)e.push({type:'lap',lap:Math.min(lap,this.laps),final:lap===this.laps});}
  return e;
 }
 finish(r,e){
  r.finished=true;r.finishTime=this.clock;
  if(r.player){this.phase='finished';this.results=this.standings().map((x,i)=>({id:x.id,name:x.name,color:x.color,player:x.player,place:i+1,finished:x.finished}));e.push({type:'finish',place:this.place()});}
  else e.push({type:'cpuFinish',id:r.id});
 }
 update(dt,{running=true,playerLane}={}){
  const e=[];if(!(dt>0))return e;if(Number.isFinite(playerLane))this.player.lane=playerLane;
  if(this.phase==='countdown'){
   if(this.held)return e;
   if(this.lastCount>3){this.lastCount=3;e.push({type:'count',n:3});return e;}
   this.countdown-=dt;const n=Math.ceil(this.countdown-.4);
   if(n<this.lastCount&&n>=1){this.lastCount=n;e.push({type:'count',n});}
   if(this.countdown<=.4){this.phase='racing';e.push({type:'go'});}
   return e;
  }
  if(!running)return e;
  this.clock+=dt;const p=this.player;
  for(const r of this.racers){r.boost=Math.max(0,r.boost-dt);if(r.boost<=0)r.boostFactor=1;}
  p.rainbow=Math.max(0,p.rainbow-dt);p.magnet=Math.max(0,p.magnet-dt);p.rolling=Math.max(0,p.rolling-dt);
  for(const row of this.boxes)row.wait=row.wait.map(w=>Math.max(0,w-dt));
  for(const c of this.coins)c.wait=Math.max(0,c.wait-dt);
  for(const cpu of this.cpus)this.stepCpu(cpu,dt,e);
  this.separate(dt);
  const now=this.place();if(this.phase==='racing'&&now<this.bestPlace&&now===1)e.push({type:'lead'});if(this.phase==='racing')this.bestPlace=Math.min(this.bestPlace,now);
  return e;
 }
 // Cars side by side ease apart like a gentle bump. Computer racers give most of
 // the room; the player is nudged a little and only when a kart cannot move.
 separate(dt){
  const L=this.length,limit=this.limit,k=1,all=this.racers,pos=r=>((r.travel%L)+L)%L,before=this.player.lane;
  // A few passes settle karts squeezed between two others; player pairs come last.
  const pairs=[];for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)pairs.push([all[i],all[j]]);pairs.sort((x,y)=>(x[0].player?1:0)-(y[0].player?1:0));
  for(let pass=0;pass<3;pass++)for(const [a,b] of pairs){if(Math.abs(trackGap(pos(a),pos(b),L))>=3.8)continue;
   const d=b.lane-a.lane,need=GAP-Math.abs(d);if(need<=0)continue;
   const dir=d?Math.sign(d):(b.lane<=0?-1:1),share=a.player?.15:b.player?.85:.5,move=need*k;
   const moveA=-dir*move*share,moveB=dir*move*(1-share),na=clamp(a.lane+moveA,-limit,limit),nb=clamp(b.lane+moveB,-limit,limit),left=Math.abs(moveA-(na-a.lane))+Math.abs(moveB-(nb-b.lane));
   a.lane=na;b.lane=nb;
   if(left>1e-6){if(Math.abs(na)<limit)a.lane=clamp(a.lane-dir*left,-limit,limit);else b.lane=clamp(b.lane+dir*left,-limit,limit);}
  }
  this.player.nudge=(this.player.nudge||0)+this.player.lane-before;
 }
 takeNudge(){const n=this.player.nudge||0;this.player.nudge=0;return n;}
 stepCpu(cpu,dt,e){
  const L=this.length,pos=((cpu.travel%L)+L)%L,t=pos/L,plan=this.planFor(cpu.tune.grip).at(t);
  // The player comes last so making room for the player wins over passing another kart.
  const others=[...this.cpus.filter(r=>r!==cpu),this.player].map(r=>({pos:((r.travel%L)+L)%L,lane:r.lane,speed:r.speed,player:r.player}));
  const steer=laneGoal({pos,lane:cpu.lane,home:cpu.home},others,{length:L,limit:this.limit,line:this.lineAt(t),pads:this.layout?.pads||[],seeksPads:cpu.seeksPads&&!cpu.finished});
  const band=cpu.finished?.6:cpu.skill*catchUp(this.player.travel-cpu.travel);
  let target=plan.limit*cpu.tune.top*band*(cpu.boost>0?cpu.boostFactor:1);target=Math.min(target,steer.cap);
  if(cpu.kick){cpu.speed=Math.max(cpu.speed,Math.min(plan.limit*cpu.tune.top*cpu.kick,steer.cap));cpu.kick=0;}
  const motion=motionStep(cpu.speed,target,dt,{curvature:plan.curvature}),before=cpu.travel;
  cpu.speed=motion.speed;cpu.travel+=motion.distance*plan.parameterScale;
  const lane=cpu.lane+(steer.goal-cpu.lane)*(1-Math.exp(-dt*(steer.urgent?5:2.2)));cpu.yaw=Math.atan2((lane-cpu.lane)/dt,Math.max(2,cpu.speed));cpu.lane=lane;
  if(cpu.finished)return;
  this.layout?.pads?.forEach(pad=>{if(passes(before,cpu.travel,pad.at,L)&&Math.abs(cpu.lane-pad.lane)<PAD_HIT)this.boost(cpu,'pad',e);});
  this.boxes.forEach((row,r)=>{if(!passes(before,cpu.travel,row.at,L))return;row.lanes.forEach((x,i)=>{if(row.wait[i]<=0&&Math.abs(cpu.lane-x)<BOX_HIT){row.wait[i]=CPU_BOX_RESPAWN;e.push({type:'box',row:r,index:i,player:false});if(cpu.pending<0&&this.random()<.6)cpu.pending=1+this.random()*2;}});});
  if(cpu.pending>=0){cpu.pending-=dt;if(cpu.pending<0)this.boost(cpu,'turbo',e);}
  if(cpu.travel>=this.finishTravel)this.finish(cpu,e);
 }
}

// Original helmet portraits for the racer cards. Leo and Dad use the car icon.
export function racerPortrait(r){
 if(r.id==='crew')return '<img src="assets/icons/drive.svg" width="72" height="72" alt="" aria-hidden="true">';
 return `<svg viewBox="0 0 100 100" width="72" height="72" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="${r.accent}"/><path d="M18 58a32 32 0 0 1 64 0v6H18z" fill="${r.color}"/><circle cx="50" cy="60" r="21" fill="${r.skin}"/><path d="M26 48h48a4 4 0 0 1 0 8H26a4 4 0 0 1 0-8z" fill="#1d2b36" opacity=".9"/><path d="M30 50h14" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/><circle cx="42" cy="63" r="3" fill="#1d2430"/><circle cx="58" cy="63" r="3" fill="#1d2430"/><path d="M43 71q7 6 14 0" fill="none" stroke="#1d2430" stroke-width="2.6" stroke-linecap="round"/><circle cx="36" cy="69" r="3.4" fill="#f28b8b" opacity=".55"/><circle cx="64" cy="69" r="3.4" fill="#f28b8b" opacity=".55"/><path d="M48 27h4v18h-4z" fill="${r.accent}" opacity=".8"/></svg>`;
}
