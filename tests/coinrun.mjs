import assert from 'node:assert/strict';
import {buildLevel,placeCoins,createRunner,stepRunner,runnerPosition,loopPoint,stars,sanitizeSave,SPEEDS,STEP,SIDE,HALF,JUMP,GRAVITY,LOOP_SHIFT} from '../coinrun-level.js?v=1';

const level=buildLevel();
assert.ok(level.length>800&&level.length<1000,'Sunny Hills is a one to two minute run');
assert.ok(level.finish<level.goal&&level.goal<level.length);
assert.equal(level.loops.length,1);assert.ok(level.gaps.length>=3&&level.springs.length>=1&&level.dashes.length>=4&&level.logs.length>=2);
for(const g of level.gaps){assert.ok(g.to>g.from&&g.from>20&&g.to<level.finish);assert.equal(level.groundAt((g.from+g.to)/2),null);assert.notEqual(level.groundAt(g.from-.5),null);assert.notEqual(level.groundAt(g.to+.5),null);}
for(const c of level.checkpoints){assert.notEqual(level.groundAt(c+1),null,'Every checkpoint respawns on solid ground');assert.ok(!level.gaps.some(g=>c+1>g.from-3&&c+1<g.to+3));}
// Normal gaps fit one jump at the slowest speed; the long gap has a spring right before it.
const reach=SPEEDS.easy*2*JUMP/GRAVITY;
for(const g of level.gaps){const spring=level.springs.find(s=>s.s<g.from&&g.from-s.s<4);if(!spring)assert.ok(g.to-g.from<reach-1.5,'A gap can be jumped at Easy speed');}
// The loop sits on a flat, straight stretch and closes on itself sideways.
for(const loop of level.loops){const a=level.frame(loop.s-8),b=level.frame(loop.s+8);assert.ok(Math.abs(a.p[1]-b.p[1])<.3&&a.t[0]*b.t[0]+a.t[2]*b.t[2]>.99);
 const p0=loopPoint(level,loop,0),p1=loopPoint(level,loop,Math.PI*2),top=loopPoint(level,loop,Math.PI);assert.ok(Math.abs(top[1]-p0[1]-loop.r*2)<1e-6);assert.ok(Math.abs(Math.hypot(p1[0]-p0[0],p1[2]-p0[2])-LOOP_SHIFT*2)<1e-6);}

// Every coin is over solid path or in the air on a jump arc, within reach sideways.
for(const speed of Object.keys(SPEEDS)){const coins=placeCoins(level,SPEEDS[speed]);assert.ok(coins.length>=110);
 for(const c of coins){assert.ok(c.pos.every(Number.isFinite));if(c.loop)continue;const f=level.frame(c.s),x=(c.pos[0]-f.p[0])*f.n[0]+(c.pos[2]-f.p[2])*f.n[2];assert.ok(Math.abs(x)<=SIDE+1e-6,'Coins stay inside the path');assert.ok(c.pos[1]-f.p[1]<7,'Coins are within spring height');}}

function run(speed,{helper=true,chase=false,jumpEarly=false,dt=STEP}={}){
 const coins=placeCoins(level,SPEEDS[speed]),taken=new Uint8Array(coins.length),r=createRunner(level,speed),seen={};
 assert.deepEqual(stepRunner(r,level,coins,taken,{jump:true},dt),[],'Nothing moves before GO');r.mode='run';
 let t=0;while(!r.finished&&t<300){t+=dt;let steer=0,jump=false;
  if(chase){const next=coins.find((c,i)=>!taken[i]&&!c.loop&&c.s>r.s-.5&&c.s<r.s+25);if(next){const f=level.frame(next.s),x=(next.pos[0]-f.p[0])*f.n[0]+(next.pos[2]-f.p[2])*f.n[2];steer=Math.max(-1,Math.min(1,(x-r.x)*3));if(next.pos[1]-f.p[1]>1.6&&next.s-r.s<r.v*.35&&next.s-r.s>0)jump=true;}}
  if(jumpEarly){const g=level.gapAhead(r.s,6);if(g&&g.from-r.s>4.5)jump=true;}
  for(const e of stepRunner(r,level,coins,taken,{steer,jump,helper},dt)){seen[e.type]=(seen[e.type]||0)+1;assert.ok(!(e.type==='coin'&&!taken[e.index]));}
  const p=runnerPosition(r,level);assert.ok(p.every(Number.isFinite));if(r.mode==='run')assert.ok(Math.abs(r.x)<=SIDE+1e-9);
 }
 assert.ok(r.finished,speed+' run finishes');assert.equal(r.coins,taken.reduce((a,b)=>a+b,0));
 assert.equal(seen.loop,1);assert.equal(seen.loopDone,1);assert.ok(seen.spring>=1);assert.equal(seen.checkpoint,level.checkpoints.length-1);
 return {r,coins,seen,t};
}
for(const speed of Object.keys(SPEEDS)){
 const easyRide=run(speed,{helper:true});assert.equal(easyRide.r.falls,0,'The jump helper never lets a runner fall');
 const handsOff=run(speed,{helper:false});assert.ok(handsOff.r.falls>=1&&handsOff.r.falls<=level.gaps.length,'Without the helper, each gap is missed at most once, then assisted');
 const early=run(speed,{helper:true,jumpEarly:true});assert.equal(early.r.falls,0,'The helper rescues an early jump');
 const chase=run(speed,{helper:true,chase:true});assert.equal(stars(chase.r.coins,chase.coins.length),3,'Chasing coins can earn three stars');
 assert.ok(stars(easyRide.r.coins,easyRide.coins.length)<3,'Steering matters for three stars');
 assert.ok(easyRide.t<(speed==='easy'?100:75),'A run stays short');
}
// Frame-rate independence of the fixed step used by the page.
const a=run('fast',{dt:STEP}),b=run('fast',{dt:STEP/2});assert.ok(Math.abs(a.t-b.t)<.6&&Math.abs(a.r.coins-b.r.coins)<=3);

assert.equal(stars(0,100),1);assert.equal(stars(60,100),2);assert.equal(stars(90,100),3);assert.equal(stars(0,0),1);
const clean=sanitizeSave({runner:'hacker',speed:'warp',helper:false,best:{easy:{coins:-4,stars:9},fast:{coins:1e9},super:{coins:88,stars:2}}});
assert.deepEqual(clean,{v:1,runner:'leo',speed:'easy',helper:false,best:{easy:{coins:0,stars:0},fast:{coins:0,stars:0},super:{coins:88,stars:2}}},'Impossible saved values reset to zero');
assert.equal(sanitizeSave(null).helper,true);
console.log('PASS: level layout, reachable coins, loop geometry, whole runs at every speed with and without the helper, three-star runs, fixed-step consistency, and save cleanup.');
