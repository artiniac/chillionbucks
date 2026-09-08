import assert from 'node:assert/strict';
import {PRESETS,copy,curveFor,validate,editPoints,ribbon,MAX_POINTS} from '../driving-track.js';
const actions=['straight','left','right','widen','hill','lower','shrink','remove'];
let accepted=0,rejected=0;
for(const {points} of Object.values(PRESETS)){
 assert.equal(validate(points),'');const c=curveFor(points);assert.ok(c.getPointAt(0).distanceTo(c.getPointAt(1))<1e-6);assert.ok(c.getTangentAt(0).dot(c.getTangentAt(1))>.999);
 for(let i=0;i<=500;i++){const p=c.getPointAt(i/500),t=c.getTangentAt(i/500);assert.ok(p.toArray().every(Number.isFinite));assert.ok(p.y>=.32);assert.ok(t.toArray().every(Number.isFinite));assert.ok(Math.abs(t.length()-1)<1e-6);}
 const g=ribbon(c,-4,4);assert.ok([...g.attributes.position.array,...g.attributes.normal.array].every(Number.isFinite));g.dispose();
 for(let i=0;i<points.length;i++)for(const action of actions){const before=JSON.stringify(points),result=editPoints(points,i,action);assert.equal(JSON.stringify(points),before,'Edits must not mutate saved routes');if(result.error){rejected++;continue;}accepted++;assert.equal(validate(result.points),'');assert.ok(result.index>=0&&result.index<result.points.length);assert.ok(curveFor(result.points).getPointAt(0).distanceTo(curveFor(result.points).getPointAt(1))<1e-6);}
}
assert.ok(validate(null));assert.ok(validate([[0,0,0],[0,0,0],[20,0,0],[20,0,20]]));assert.ok(validate([[0,0,0],[30,0,30],[0,0,30],[30,0,0]]),'Crossing roads must be rejected');assert.ok(validate([[0,0,0],[40,Infinity,0],[40,0,40],[0,0,40]]));assert.ok(validate(Array(MAX_POINTS+1).fill([0,0,0])));
const original=copy(PRESETS.meadow.points),hill=editPoints(original,0,'hill');assert.equal(hill.error,'');assert.equal(hill.points[0][1],3);assert.equal(original[0][1],0);
// Repeated edits either preserve a playable route or leave the prior route intact.
let p=original;for(let i=0;i<100;i++){const r=editPoints(p,i%p.length,actions[(i*7)%actions.length]);if(!r.error)p=r.points;assert.equal(validate(p),'');}
console.log(`Driving rules passed: ${accepted} valid edits, ${rejected} unsafe edits rejected, closed courses, hills, finite geometry, and 100 sequential edits.`);

const {driftStep}=await import('../driving-car.js');
let drift={angle:0,seconds:0,awarded:false},awards=0;for(let i=0;i<300;i++){drift=driftStep(drift,{held:true,running:true,turn:.2,dt:1/60});awards+=Number(drift.award);}assert.equal(awards,1,'Holding drift must award once, not every frame');assert.ok(drift.angle>.5&&drift.angle<=.53);for(let i=0;i<120;i++)drift=driftStep(drift,{held:false,running:true,turn:.2,dt:1/60});assert.ok(Math.abs(drift.angle)<.001,'Releasing drift recenters the car');assert.equal(drift.awarded,false);assert.equal(driftStep(drift,{held:true,running:false,turn:.2,dt:.1}).sliding,false);assert.equal(driftStep(drift,{held:true,running:true,turn:0,dt:.1}).sliding,false);console.log('PASS: drift hold, one award per hold, release recovery, parked input, and straight-road behavior.');
for(const direction of [-1,1]){let s={angle:0,seconds:0,awarded:false,velocity:0};for(let i=0;i<120;i++)s=driftStep(s,{held:true,running:true,turn:.2*direction,dt:1/60});assert.equal(Math.sign(s.angle),direction,'Corners must drift both ways');let manual={angle:0,seconds:0,awarded:false};for(let i=0;i<120;i++)manual=driftStep(manual,{held:true,running:true,turn:-.2*direction,steer:direction,dt:1/60});assert.equal(Math.sign(manual.angle),direction,'Steering must override automatic drift direction');}
console.log('PASS: both corner directions and explicit left/right steering override.');
