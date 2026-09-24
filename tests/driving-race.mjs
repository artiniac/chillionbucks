import assert from 'node:assert/strict';
import {PRESETS,curveFor,editPoints,copy} from '../driving-track.js';
import {makeSpeedPlan,motionStep} from '../driving-physics.js?v=1';
import {teachingLine} from '../racing-line.js';
import {RACERS,ITEMS,FIELD,RaceCore,raceLayout,laneLimit,passes,trackGap,rollItem,standings,catchUp,coinPower,tuning,laneGoal,gridSlots,place,racerPortrait} from '../driving-race.js?v=1';

// Racers: original names, fair stat totals, valid colors.
assert.equal(new Set(RACERS.map(r=>r.id)).size,RACERS.length);
assert.ok(RACERS.length>=FIELD);
for(const r of RACERS){
 assert.equal(r.speed+r.grip+r.boost,10,r.name+' has a fair stat total');
 for(const k of ['speed','grip','boost'])assert.ok(r[k]>=1&&r[k]<=5);
 for(const k of ['color','accent','suit','skin'])assert.match(r[k],/^#[0-9a-f]{6}$/i);
 assert.doesNotMatch(r.name,/mario|luigi|peach|toad|yoshi|bowser|koopa|sonic|kart/i,'No borrowed character names');
 const t=tuning(r);assert.ok(t.top>.98&&t.top<1.02&&t.grip>.98&&t.grip<1.11&&t.boost>.9&&t.boost<1.2);
 assert.ok(!/undefined|NaN/.test(racerPortrait(r)));
}
assert.deepEqual([1,2,3,4,6].map(place),['1st','2nd','3rd','4th','6th']);

// Track marks work across the finish line, at any frame rate, and only once.
assert.ok(passes(95,105,2,100));assert.ok(passes(0,10,10,100));assert.ok(!passes(10,20,10,100));assert.ok(!passes(5,5,5,100));
for(const bad of [[NaN,1,1,100],[0,1,1,0],[3,1,2,100]])assert.ok(!passes(...bad));
for(const step of [.07,.9,6]){let hits=0;for(let x=0;x<500;x+=step)if(passes(x,Math.min(500,x+step),42,100))hits++;assert.equal(hits,5);}
assert.equal(trackGap(90,10,100),20);assert.equal(trackGap(10,90,100),-20);
assert.ok(catchUp(-500)>=.95&&catchUp(500)<=1.12&&catchUp(-10)<1&&catchUp(10)>1&&catchUp(0)===1);
assert.equal(coinPower(0),1);assert.equal(coinPower(50),coinPower(10));
for(const slot of gridSlots(FIELD,8))assert.ok(slot.back>0&&Math.abs(slot.lane)<=laneLimit(8));

// Items: always valid, and racers further back roll the bigger helpers more often.
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const counts=(position)=>{const r=rng(7),c={};for(let i=0;i<4000;i++){const k=rollItem(position,FIELD,r);assert.ok(ITEMS[k]);c[k]=(c[k]||0)+1;}return c;};
const leader=counts(1),last=counts(FIELD);
assert.ok((last.rainbow||0)>(leader.rainbow||0)*3&&(leader.turbo||0)>(last.turbo||0));

// Finished racers rank by time, then everyone else by distance.
assert.deepEqual(standings([{id:'a',travel:900},{id:'b',finished:true,finishTime:40,travel:500},{id:'c',finished:true,finishTime:38,travel:400},{id:'d',travel:950}]).map(r=>r.id),['c','b','d','a']);

// Computer racers stay on the road, go around a car ahead, and make room for the player.
const env={length:300,limit:2.7};
for(let i=0;i<200;i++){const me={pos:Math.random()*300,lane:(Math.random()-.5)*5.4,home:(Math.random()-.5)*4},others=Array.from({length:5},()=>({pos:Math.random()*300,lane:(Math.random()-.5)*5.4,speed:10,player:Math.random()<.2}));const g=laneGoal(me,others,env).goal;assert.ok(Math.abs(g)<=2.7);}
assert.ok(Math.abs(laneGoal({pos:10,lane:0,home:0},[{pos:14,lane:0,speed:9}],env).goal)>=2.2,'Passes around a car just ahead');
assert.ok(laneGoal({pos:10,lane:0,home:0},[{pos:13,lane:0,speed:9}],env).cap<=9,'Never drives through a car just ahead');
assert.ok(Math.abs(laneGoal({pos:10,lane:0,home:0},[{pos:4,lane:0,speed:12,player:true}],env).goal)>=2.2,'Makes room for the player');

// Layouts on every course, plus edited courses, keep items on the road and clear of the grid.
function layoutCheck(curve,width){
 const line=teachingLine(curve,width),layout=raceLayout(curve,width,t=>line.at(t).offset),L=curve.getLength(),limit=laneLimit(width);
 const marks=[...layout.pads.map(p=>p.at),...layout.boxes.map(b=>b.at),...layout.coins.map(c=>c.at)];
 for(const at of marks){assert.ok(at>=0&&at<L);assert.ok(at>=Math.min(28,L*.1)-1e-9&&at<=L-Math.min(36,L*.13)+1e-9,'Items stay clear of the start line and grid');}
 for(const p of layout.pads)assert.ok(Math.abs(p.lane)+1.5<=width/2);
 for(const b of layout.boxes)for(const lane of b.lanes)assert.ok(Math.abs(lane)<=limit);
 for(const c of layout.coins)assert.ok(Math.abs(c.lane)<=limit);
 const starts=[...layout.pads.map(p=>p.at),...layout.boxes.map(b=>b.at)];
 for(let i=0;i<starts.length;i++)for(let j=i+1;j<starts.length;j++)assert.ok(Math.abs(trackGap(starts[i],starts[j],L))>=29,'Boost arrows and gift boxes are spaced apart');
 return {line,layout,L};
}
for(const [key,def] of Object.entries(PRESETS)){const {layout}=layoutCheck(curveFor(def.points,def.smooth),def.width||8);assert.ok(layout.boxes.length===2&&layout.pads.length>=2&&layout.coins.length>=10,key+' has boxes, arrows, and coins');}
const random=rng(3);
for(let n=0;n<12;n++){let pts=copy(PRESETS.meadow.points);for(let k=0;k<6;k++){const r=editPoints(pts,Math.floor(random()*pts.length),['straight','left','right','widen','hill','shrink'][Math.floor(random()*6)]);if(!r.error)pts=r.points;}layoutCheck(curveFor(pts),8);}

// Whole races: everyone finishes, the pack stays close, and pickups follow the rules.
function race(track,{pace='cruise',laps=2,active=false,racer='crew',seed=1}={}){
 const def=PRESETS[track],curve=curveFor(def.points,def.smooth),width=def.width||8,{line,layout,L}=layoutCheck(curve,width),max={gentle:8,cruise:13,zoom:19}[pace],plans=new Map();
 const planFor=g=>{if(!plans.has(g))plans.set(g,makeSpeedPlan(line,L,max,{grip:8.8*g}));return plans.get(g);};
 const lineAt=t=>line.at(t).offset,core=new RaceCore({length:L,laps,width,layout,playerId:racer,pace,lineAt,planFor,random:rng(seed)}),p=core.player,dt=1/60;
 assert.equal(core.cpus.length,FIELD-1);assert.ok(!core.cpus.some(c=>c.id===racer||c.id==='crew'),'Computer racers are kart drivers');assert.equal(core.phase,'countdown');
 let speed=0,travel=p.travel,lane=p.lane,counts=[],coins=0,guard=0,overlap=0,frames=0;
 while(core.phase!=='finished'&&guard++<120000){
  const e=core.update(dt,{running:true,playerLane:lane});lane+=core.takeNudge();counts.push(...e.filter(x=>x.type==='count').map(x=>x.n));
  if(core.phase==='countdown'){assert.equal(core.cpus.every(c=>c.speed===0),true,'Nobody moves before GO');continue;}frames++;
  const t=travel/L%1,m=planFor(p.tune.grip).at(t),k=core.takeKick(),cap=core.playerCap();if(k)speed=Math.max(speed,Math.min(cap,m.limit*p.tune.top*k));
  const mo=motionStep(speed,Math.min(cap,m.limit*core.playerFactor()),dt,{curvature:m.curvature}),before=travel;speed=mo.speed;travel+=mo.distance*m.parameterScale;
  let goal=lineAt(t);if(active){const next=[...layout.pads,...layout.coins].map(x=>({x,g:((x.at-travel%L)+L)%L})).filter(o=>o.g<25).sort((a,b)=>a.g-b.g)[0];if(next)goal=next.x.lane;if(guard%420===0)core.miniTurbo();if(p.item&&p.rolling<=0)core.useItem();}
  lane+=(goal-lane)*(1-Math.exp(-dt*4));
  for(const ev of core.playerMoved(before,travel,lane))if(ev.type==='coin')coins++;
  const pos=((travel%L)+L)%L;if(core.cpus.some(c=>Math.abs(trackGap(pos,((c.travel%L)+L)%L,L))<2.6&&Math.abs(c.lane-lane)<1.5))overlap++;
 }
 assert.equal(core.phase,'finished','The race finishes');assert.ok(overlap/frames<.01,track+': the player and the karts rarely touch ('+(overlap/frames*100).toFixed(2)+'% of frames)');assert.deepEqual(counts,[3,2,1],'Countdown says 3, 2, 1');assert.equal(p.coins,coins);
 assert.equal(core.results.length,FIELD);assert.deepEqual(core.results.map(r=>r.place),[1,2,3,4,5,6]);
 for(let i=0;i<60*40;i++)core.update(dt,{running:true});
 assert.ok(core.cpus.every(c=>c.finished),'Every computer racer crosses the line soon after');
 assert.ok(Math.max(...core.cpus.map(c=>c.finishTime))<p.finishTime*1.35,'The pack stays close');
 return core.place();
}
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
for(const track of ['meadow','corkscrew','family']){
 const passive=[1,2,3].map(seed=>race(track,{seed})),active=[1,2,3].map(seed=>race(track,{seed,active:true}));
 assert.ok(avg(active)<avg(passive),track+': drifting, boosts, and helpers improve your place');
 assert.ok(avg(active)<=2,track+': an active driver usually reaches the podium at Cruise');
}
assert.ok(avg([1,2].map(seed=>race('coast',{pace:'gentle',seed})))<=3,'Gentle races are friendly even without steering');
race('meadow',{laps:1,racer:'nova',pace:'zoom',active:true});race('coast',{laps:3,racer:'pickle'});

// Pauses freeze the race, a held countdown restarts from 3, and helpers only work while racing.
{
 const curve=curveFor(PRESETS.meadow.points),line=teachingLine(curve,8),L=curve.getLength(),plan=makeSpeedPlan(line,L,13);
 const core=new RaceCore({length:L,laps:1,width:8,layout:raceLayout(curve,8),lineAt:t=>line.at(t).offset,planFor:()=>plan,random:rng(1)});
 core.update(1.5,{running:true});core.hold();assert.ok(core.held);core.update(5,{running:true});assert.equal(core.phase,'countdown');core.resume();
 const e=[];for(let i=0;i<5;i++)e.push(...core.update(1,{running:true}));assert.deepEqual(e.filter(x=>x.type==='count').map(x=>x.n),[3,2,1]);assert.equal(core.phase,'racing');
 const before=core.cpus.map(c=>c.travel);core.update(1,{running:false});assert.deepEqual(core.cpus.map(c=>c.travel),before,'Paused racers stay put');
 assert.deepEqual(core.useItem(),[]);core.player.item={kind:'triple',uses:3};core.useItem();assert.equal(core.player.item.uses,2);assert.ok(core.player.boost>0);
}
console.log('PASS: fair racers, finish-line math, item odds, standings, lane manners, layouts on every course, and whole races that finish together.');
