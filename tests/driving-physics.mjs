import assert from 'node:assert/strict';
import {cornerSpeed,makeSpeedPlan,motionStep} from '../driving-physics.js';
import {curveFor,PRESETS} from '../driving-track.js';
import {teachingLine} from '../racing-line.js';
assert.ok(cornerSpeed(1/100)>19,'Broad bends retain full Zoom speed');
assert.ok(cornerSpeed(1/12)<cornerSpeed(1/30));
function run(dt){let v=0,x=0;for(let t=0;t<10-1e-8;t+=dt){const m=motionStep(v,19,dt);v=m.speed;x+=m.distance;assert.ok(m.acceleration<=4.3&&m.acceleration>=-6.2);}return {v,x};}
const a=run(1/60),b=run(1/120);assert.ok(Math.abs(a.v-b.v)<.03&&Math.abs(a.x-b.x)<.15,'Frame-rate independent motion');
for(const def of Object.values(PRESETS)){const curve=curveFor(def.points,def.smooth),line=teachingLine(curve,def.width||8),plan=makeSpeedPlan(line,curve.getLength(),19);let v=0,t=0;for(let i=0;i<18000;i++){const p=plan.at(t),m=motionStep(v,p.limit,1/60,{curvature:p.curvature});assert.ok(Number.isFinite(m.speed)&&m.speed>=0&&m.speed<=19.01);v=m.speed;t=(t+m.distance*p.parameterScale/curve.getLength())%1;}assert.deepEqual(plan.at(0),plan.at(1));}
const circle={getPointAt(t){return {x:100*Math.cos(t*Math.PI*2),z:100*Math.sin(t*Math.PI*2)}}};assert.equal(makeSpeedPlan(circle,200*Math.PI,19).at(.5).limit,19);
const academy=curveFor(PRESETS.academy.points,true),planned=makeSpeedPlan(teachingLine(academy,16),academy.getLength(),19);assert.ok(Array.from({length:1024},(_,i)=>planned.at(i/1024)).some(p=>p.limit<17&&cornerSpeed(p.curvature)>19),'Braking begins before tight bends, while still on the approach');
console.log('PASS: radius-based grip, broad-bend speed, bounded forces, timestep consistency, and all-course simulation.');
