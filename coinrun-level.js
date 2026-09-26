import * as T from './vendor/three.module.js';

// Coin Run: the Sunny Hills level and the runner's rules. No rendering, so tests
// can play whole runs in Node. Game coins are play points and never touch Wallet.
export const SPEEDS={easy:10,fast:14,super:18};
export const GRAVITY=30,JUMP=11.5,SPRING=18,SPRING_PUSH=1.55,COYOTE=.12,BUFFER=.15,LATERAL=7,RADIUS=1.35,STEP=1/120;
export const HALF=3.5,SIDE=HALF-.7,LOOP_SHIFT=1.6,CHEST=.8;
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=u=>u*u*(3-2*u);

// The path is drawn like a turtle: [length, total turn in degrees, total rise].
export const SEGMENTS=[[40,0,0],[60,0,0],[50,-35,3],[60,0,0],[60,50,-3],[80,0,0],[70,-60,4],[60,0,0],[60,40,-5],[70,0,0],[60,-45,2],[60,0,0],[50,30,-1],[60,0,0],[45,0,0]];
// Distances below are measured along that turtle path, then mapped onto the curve.
export const FEATURES=[
 {coins:'line',from:50,to:90,x:0},
 {coins:'zigzag',from:108,to:150},
 {dash:160,x:0},
 {gap:185,length:5},{coins:'arc',at:184},
 {coins:'line',from:200,to:230,x:1.5},
 {checkpoint:250},
 {dash:285,x:-1.5},{dash:285,x:1.5},
 {loop:330,radius:7},{coins:'loop',at:330},
 {coins:'line',from:345,to:372,x:-1.5},
 {log:395,x:0,half:2.2},{coins:'arc',at:393},
 {checkpoint:425},
 {spring:459,x:0,half:HALF},{coins:'spring',at:459},{gap:461,length:10},
 {checkpoint:500},
 {dash:520,x:-1.5},{dash:560,x:1.5},{coins:'zigzag',from:525,to:578},
 {log:610,x:-1.6,half:1.6},{log:632,x:1.6,half:1.6},{coins:'line',from:604,to:616,x:1.6},{coins:'line',from:626,to:638,x:-1.6},
 {gap:680,length:5.5},{coins:'arc',at:679},
 {checkpoint:700},
 {coins:'zigzag',from:720,to:760},{dash:740,x:0},{coins:'line',from:775,to:805,x:0},
 {coins:'line',from:812,to:842,x:-1.4},{coins:'line',from:812,to:842,x:1.4}
];

export function turtle(segments=SEGMENTS){
 let x=0,y=0,z=0,h=0,d=0;const points=[[0,0,0]],dist=[0];
 for(const [len,turn,rise] of segments){
  const n=Math.max(1,Math.round(len/10)),y0=y,step=len/n;
  for(let i=1;i<=n;i++){h+=turn*Math.PI/180/n;x+=Math.sin(h)*step;z+=Math.cos(h)*step;y=y0+rise*ease(i/n);d+=step;points.push([x,y,z]);dist.push(d);}
 }
 return {points,dist};
}

export function buildLevel({segments=SEGMENTS,features=FEATURES}={}){
 const {points,dist}=turtle(segments),curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
 const per=20,lengths=curve.getLengths((points.length-1)*per),length=lengths[lengths.length-1];
 // Map a turtle distance onto true arc length along the smoothed curve.
 const arc=d=>{if(d<=0)return 0;for(let i=1;i<dist.length;i++)if(d<=dist[i]){const f=(d-dist[i-1])/(dist[i]-dist[i-1]);return lengths[(i-1)*per]+f*(lengths[i*per]-lengths[(i-1)*per]);}return length;};
 const count=Math.ceil(length/.5)+1,P=new Float32Array(count*3),D=new Float32Array(count*3);
 for(let i=0;i<count;i++){const u=Math.min(1,i*.5/length),p=curve.getPointAt(u),t=curve.getTangentAt(u);P.set([p.x,p.y,p.z],i*3);D.set([t.x,t.y,t.z],i*3);}
 const level={length,finish:length-25,goal:length-14,curve,gaps:[],springs:[],dashes:[],logs:[],loops:[],checkpoints:[0],patterns:[],arc};
 // Position, tangent, and the right-hand lateral direction at distance s.
 level.frame=(s,out={p:[0,0,0],t:[0,0,1],n:[-1,0,0]})=>{
  const f=clamp(s,0,length)/.5,i=Math.min(count-2,Math.floor(f)),k=f-i;
  for(let a=0;a<3;a++){out.p[a]=P[i*3+a]*(1-k)+P[i*3+3+a]*k;out.t[a]=D[i*3+a]*(1-k)+D[i*3+3+a]*k;}
  const l=Math.hypot(out.t[0],out.t[2])||1;out.n[0]=-out.t[2]/l;out.n[1]=0;out.n[2]=out.t[0]/l;return out;
 };
 for(const f of features){
  if(f.gap!==undefined)level.gaps.push({from:arc(f.gap),to:arc(f.gap)+f.length});
  else if(f.spring!==undefined)level.springs.push({s:arc(f.spring),x:f.x,half:f.half});
  else if(f.dash!==undefined)level.dashes.push({s:arc(f.dash),x:f.x,half:1.6});
  else if(f.log!==undefined)level.logs.push({s:arc(f.log),x:f.x,half:f.half});
  else if(f.loop!==undefined)level.loops.push({s:arc(f.loop),r:f.radius});
  else if(f.checkpoint!==undefined)level.checkpoints.push(arc(f.checkpoint));
  else if(f.coins)level.patterns.push({...f,from:f.from!==undefined?arc(f.from):undefined,to:f.to!==undefined?arc(f.to):undefined,at:f.at!==undefined?arc(f.at):undefined});
 }
 level.checkpoints.sort((a,b)=>a-b);
 level.groundAt=s=>{if(s<0||s>length)return null;for(const g of level.gaps)if(s>g.from&&s<g.to)return null;return level.frame(s).p[1];};
 level.gapAhead=(s,reach)=>level.gaps.find(g=>g.from>s&&g.from-s<=reach)||null;
 return level;
}

// A point on a loop: forward and up around a vertical circle, drifting sideways
// so the exit runs beside the entry.
export function loopPoint(level,loop,theta,out=[0,0,0]){
 const f=level.frame(loop.s),r=loop.r,side=-LOOP_SHIFT+2*LOOP_SHIFT*theta/TAU,fw=Math.sin(theta)*r,up=r*(1-Math.cos(theta));
 for(let a=0;a<3;a++)out[a]=f.p[a]+f.t[a]*fw+f.n[a]*side;out[1]+=up;return out;
}

// Coins follow the jump arcs for the chosen speed, so every coin can be reached.
export function placeCoins(level,speed){
 const coins=[],add=(s,x,h)=>{const f=level.frame(s);coins.push({s,pos:[f.p[0]+f.n[0]*x,f.p[1]+h,f.p[2]+f.n[2]*x]});};
 const flight=(at,vy,push=1)=>{const air=2*vy/GRAVITY,out=[];for(let k=1;k<=7;k++){const t=air*k/8;out.push({s:at+speed*push*t,h:vy*t-GRAVITY*t*t/2+CHEST});}return out;};
 for(const p of level.patterns){
  if(p.coins==='line')for(let s=p.from;s<=p.to+1e-6;s+=4)add(s,p.x,CHEST);
  if(p.coins==='zigzag'){let k=0;for(let s=p.from;s<=p.to+1e-6;s+=4)add(s,Math.sin(k++*.9)*SIDE*.8,CHEST);}
  if(p.coins==='arc')for(const c of flight(p.at,JUMP).slice(1,6))add(c.s,0,c.h);
  if(p.coins==='spring')for(const c of flight(p.at,SPRING,SPRING_PUSH))add(c.s,0,c.h);
  if(p.coins==='loop'){const loop=level.loops.find(l=>Math.abs(l.s-p.at)<1),q=[0,0,0];for(let k=1;k<=11;k++){const th=k/12*TAU;loopPoint(level,loop,th,q);const inward=[-Math.sin(th)*level.frame(loop.s).t[0],Math.cos(th),-Math.sin(th)*level.frame(loop.s).t[2]];coins.push({s:loop.s,loop:true,theta:th,pos:q.map((v,a)=>v+inward[a]*CHEST)});}}
 }
 return coins.sort((a,b)=>a.s-b.s);
}

export function stars(coins,total){return !total?1:coins/total>=.9?3:coins/total>=.6?2:1;}

export function createRunner(level,speedName='fast'){
 const base=SPEEDS[speedName]||SPEEDS.fast;
 return {s:2,x:0,y:level.groundAt(2),vy:0,v:0,base,onGround:true,air:0,buffer:0,jumped:false,boost:0,stumble:0,mode:'ready',theta:0,loop:null,checkpoint:0,respawn:0,assist:new Set(),lastGround:level.groundAt(2),coins:0,time:0,falls:0,finished:false};
}

const passes=(a,b,at)=>a<at&&b>=at;
// One fixed step. Input: steer -1 to 1, jump pressed, helper on. Events describe
// what happened so the page can play sounds and effects.
export function stepRunner(r,level,coins,taken,input,dt,events=[]){
 if(r.mode==='ready')return events;
 r.time+=dt;
 if(r.mode==='respawn'){r.respawn-=dt;if(r.respawn<=0){r.mode='run';r.s=r.checkpoint+1;r.x=0;r.y=level.groundAt(r.s);r.vy=0;r.v=r.base*.6;r.onGround=true;r.boost=r.stumble=0;events.push({type:'back'});}return events;}
 if(r.mode==='finish'){r.v=Math.max(0,r.v-12*dt);r.s=Math.min(level.length-2,r.s+r.v*dt);r.y=level.groundAt(r.s)??r.y;return events;}
 const target=r.base*(r.boost>0?1.55:1)*(r.stumble>0?.45:1);
 r.v+=clamp(target-r.v,-14*dt,9*dt);r.boost=Math.max(0,r.boost-dt);r.stumble=Math.max(0,r.stumble-dt);
 if(r.mode==='loop'){
  r.theta+=Math.max(9,r.v)/r.loop.r*dt;
  if(r.theta>=TAU){r.mode='run';r.s=r.loop.s+.05;r.x=LOOP_SHIFT;r.y=level.groundAt(r.s);r.vy=0;r.onGround=true;events.push({type:'loopDone'});}
  collect(r,level,coins,taken,events);return events;
 }
 r.x=clamp(r.x+clamp(input.steer||0,-1,1)*LATERAL*dt,-SIDE,SIDE);
 const before=r.s;r.s+=r.v*dt;
 if(input.jump)r.buffer=BUFFER;else r.buffer=Math.max(0,r.buffer-dt);
 let ground=level.groundAt(r.s);
 if(r.onGround){if(ground===null){r.onGround=false;r.air=0;r.vy=Math.min(r.vy,0);}else{r.y=ground;r.lastGround=ground;}}else r.air+=dt;
 // The helper, and a second try after a fall, jump at the edge automatically.
 const gap=level.gapAhead(r.s,r.v*.05+.4);
 if(r.onGround&&gap&&(input.helper||r.assist.has(gap)))r.buffer=BUFFER;
 if(r.onGround&&input.helper)for(const log of level.logs)if(log.s-r.s>0&&log.s-r.s<r.v*.12+.6&&Math.abs(r.x-log.x)<log.half+.35)r.buffer=BUFFER;
 if(r.buffer>0&&(r.onGround||(r.air<COYOTE&&!r.jumped))){r.vy=JUMP;r.onGround=false;r.jumped=true;r.buffer=0;r.air=COYOTE;events.push({type:'jump'});}
 // With the helper on, one rescue hop saves an early jump that would drop into a gap.
 if(!r.onGround&&input.helper&&!r.rescued&&ground===null&&r.vy<0&&r.y<r.lastGround+.3){r.vy=JUMP;r.rescued=true;events.push({type:'jump',rescue:true});}
 if(!r.onGround){r.vy-=GRAVITY*dt;r.y+=r.vy*dt;
  // Below the far ledge: the runner meets the wall and drops into the water.
  if(ground!==null&&r.y<ground-.6){const g=level.gaps.find(g=>r.s>=g.from-2&&r.s<=g.to+2);if(g)r.assist.add(g);r.falls++;r.mode='respawn';r.respawn=.9;events.push({type:'fall'});return events;}
  if(ground!==null&&r.y<=ground&&r.vy<=0){r.y=ground;r.lastGround=ground;r.vy=0;r.onGround=true;r.jumped=false;r.rescued=false;events.push({type:'land'});}}
 const lift=r.y-(ground??r.lastGround);
 for(const sp of level.springs)if(passes(before,r.s,sp.s)&&lift<2.5&&Math.abs(r.x-sp.x)<sp.half){r.vy=SPRING;r.onGround=false;r.jumped=true;r.y=Math.max(r.y,ground??r.y);r.boost=Math.max(r.boost,1.3);r.v=Math.max(r.v,r.base*SPRING_PUSH);events.push({type:'spring'});}
 for(const d of level.dashes)if(passes(before,r.s,d.s)&&lift<.6&&Math.abs(r.x-d.x)<d.half){r.boost=1.6;r.v=Math.max(r.v,r.base*1.55);events.push({type:'dash'});}
 for(const log of level.logs)if(passes(before,r.s,log.s)&&lift<.55&&Math.abs(r.x-log.x)<log.half+.35){r.stumble=.8;r.v*=.5;r.vy=4.5;r.onGround=false;r.jumped=true;events.push({type:'bonk'});}
 for(const loop of level.loops)if(passes(before,r.s,loop.s)){r.mode='loop';r.loop=loop;r.theta=0;r.x=-LOOP_SHIFT;r.onGround=true;r.vy=0;events.push({type:'loop'});collect(r,level,coins,taken,events);return events;}
 for(const c of level.checkpoints)if(passes(before,r.s,c)&&c>r.checkpoint){r.checkpoint=c;events.push({type:'checkpoint',s:c});}
 if(ground===null&&r.y<r.lastGround-5){const g=level.gaps.find(g=>r.s>=g.from-2&&r.s<=g.to+2);if(g)r.assist.add(g);r.falls++;r.mode='respawn';r.respawn=.9;events.push({type:'fall'});return events;}
 if(r.s>=level.finish){r.mode='finish';r.finished=true;events.push({type:'finish'});}
 collect(r,level,coins,taken,events);
 return events;
}

export function runnerPosition(r,level,out=[0,0,0]){
 if(r.mode==='loop')return loopPoint(level,r.loop,r.theta,out);
 const f=level.frame(r.s);out[0]=f.p[0]+f.n[0]*r.x;out[1]=r.y;out[2]=f.p[2]+f.n[2]*r.x;return out;
}
const chest=[0,0,0];
function collect(r,level,coins,taken,events){
 runnerPosition(r,level,chest);
 if(r.mode==='loop'){const th=r.theta,t=level.frame(r.loop.s).t;chest[0]+=-Math.sin(th)*t[0]*CHEST;chest[1]+=Math.cos(th)*CHEST;chest[2]+=-Math.sin(th)*t[2]*CHEST;}else chest[1]+=CHEST;
 for(let i=0;i<coins.length;i++){if(taken[i])continue;const c=coins[i];if(!c.loop&&Math.abs(c.s-r.s)>4)continue;if(c.loop&&r.mode!=='loop')continue;
  if(Math.hypot(c.pos[0]-chest[0],c.pos[1]-chest[1],c.pos[2]-chest[2])<RADIUS){taken[i]=1;r.coins++;events.push({type:'coin',index:i});}}
}

export function sanitizeSave(raw){
 const s=raw&&typeof raw==='object'?raw:{},best=s.best&&typeof s.best==='object'?s.best:{};
 const num=(v,max)=>Number.isFinite(v)&&v>=0&&v<=max?Math.floor(v):0;
 return {v:1,runner:['leo','dad','buddy'].includes(s.runner)?s.runner:'leo',speed:SPEEDS[s.speed]?s.speed:'easy',helper:s.helper!==false,best:Object.fromEntries(Object.keys(SPEEDS).map(k=>[k,{coins:num(best[k]?.coins,999),stars:Math.min(3,num(best[k]?.stars,3))}]))};
}
