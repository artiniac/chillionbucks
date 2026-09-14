import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {streetScene,intersections,nearStreet} from '../town-streets.js';
import {grottoApproach} from '../park-promenade.js';
import {curveFor,START_ROUTE} from '../park-geometry.js';
const streets=streetScene();assert.ok(intersections().length>=10);assert.ok(nearStreet(0,14.5));assert.ok(!nearStreet(-4,8));
assert.ok(streets.children.length<15,'Street furniture must be batched rather than thousands of draw calls');
for(const m of streets.children){assert.ok(m.geometry.attributes.position.count>0);for(const n of m.geometry.attributes.position.array)assert.ok(Number.isFinite(n));m.geometry.dispose();m.material.dispose();}
for(const scale of [1.5,3.8]){const river=curveFor(START_ROUTE.map(p=>p.map(v=>v*scale))),g=grottoApproach(river),p=g.attributes.position;for(const n of p.array)assert.ok(Number.isFinite(n));const end=new T.Vector3().fromBufferAttribute(p,p.count-1).add(new T.Vector3().fromBufferAttribute(p,p.count-2)).multiplyScalar(.5);assert.ok(Math.abs(end.x)<.01&&Math.abs(end.z+41)<.01,'Approach must reach the grotto promenade for both saved and expanded routes');g.dispose();}
console.log('PASS: batched streets, finite scenery, and connected grotto approaches for old and expanded river routes.');
