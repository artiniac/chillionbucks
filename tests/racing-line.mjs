import assert from 'node:assert/strict';
import {PRESETS,curveFor} from '../driving-track.js';
import {teachingLine} from '../racing-line.js';
for(const def of Object.values(PRESETS)){
 const c=curveFor(def.points,def.smooth),width=def.width||8,line=teachingLine(c,width);
 assert.ok(line.corners.length>=3);
 for(let i=0;i<=3000;i++){const t=i/3000,p=line.getPointAt(t),d=line.getTangentAt(t);assert.ok(p.toArray().every(Number.isFinite));assert.ok(d.toArray().every(Number.isFinite));assert.ok(d.dot(c.getTangentAt(t))>.1,'Line must never curl backward on the road');assert.ok(p.distanceTo(c.getPointAt(t))<=width/2-1.69);}
 assert.ok(line.getPointAt(0).distanceTo(line.getPointAt(1))<1e-8);

 for(const corner of line.corners)assert.equal(Math.sign(line.at(corner.t).offset),-corner.sign,'Apex must be on the inside of its actual road bend');
 for(const k of line.knots){assert.ok(Math.abs(line.at(k.t).offset-k.offset)<1e-6);}
}
const c=curveFor(PRESETS.academy.points,true),samples=c.getSpacedPoints(720),length=c.getLength();
for(let i=0;i<720;i++)for(let j=i+1;j<720;j++){if(Math.min(j-i,720-j+i)*length/720<35)continue;assert.ok(samples[i].distanceTo(samples[j])>17,'Wide Academy roads must not overlap');}
assert.ok(teachingLine(c,16).corners.length>=4);
console.log('PASS: line clearance, finite geometry, inside apexes, loop continuity, and wide-road separation.');
