import assert from 'node:assert/strict';
import {sceneryPlan} from '../circuit-scenery.js';
import {PRESETS,curveFor} from '../driving-track.js';
for(const def of Object.values(PRESETS)){const curve=curveFor(def.points,def.smooth),p=sceneryPlan(curve,def.width||8);assert.ok(p.trees.length>50);for(const t of p.trees)assert.ok(p.clearance(t.x,t.z,t.r));assert.ok(p.pavilion.z+7<p.bounds.minZ-(def.width||8)/2-18,'Pavilion remains outside camera clearance');}
assert.equal(PRESETS.family.width,20);assert.ok(curveFor(PRESETS.family.points,true).getLength()>curveFor(PRESETS.academy.points,true).getLength()*1.49);
console.log('PASS: scenery avoids track and camera corridor on every course; expanded family circuit.');
