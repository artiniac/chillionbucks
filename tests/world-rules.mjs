import assert from 'node:assert/strict';
import {placementError,autoLayer,settle,validProject,IDEAS,size} from '../blocks-engine.js';
import {START_ROUTE,curveFor,slideCurve,validateRoute} from '../park-geometry.js';
const part=(kind,x=0,y=0,z=0,rot=0,id='a')=>({kind,x,y,z,rot,id,color:'mint'});
const base=part('wide');
assert.equal(placementError([],base),null);
assert.match(placementError([base],part('one')),/already/);
assert.match(placementError([],part('one',0,4)),/studs/);
assert.equal(autoLayer([base],part('one')),1);
assert.match(placementError([part('tile')],part('one',0,1)),/Smooth/);
assert.deepEqual(size(part('four',0,0,0,1)),{w:1,d:4,h:1});
assert.equal(placementError([part('arch')],part('one',1,0)),null);
assert.equal(settle([part('one',0,3)])[0].y,0);
assert.equal(validProject([base,part('one',0,1,0,0,'b')]),true);
assert.equal(validProject([base,{...base}]),false);
for(const idea of Object.values(IDEAS)){const built=[];for(const [i,p] of idea.parts.entries()){assert.equal(placementError(built,p),null,idea.name+' step '+i);built.push({...p,id:String(i)});}assert.equal(validProject(built),true);}
for(const scale of [1,1.5,1.6]){const route=START_ROUTE.map(p=>p.map(v=>v*scale));assert.equal(validateRoute(route),null);const c=curveFor(route);for(const type of ['straight','wave','spiral','tube','raft','speed'])for(const t of [0,.17,.55,.99]){const slide=slideCurve(c,t,type);assert.ok(slide.getPoint(1).distanceTo(c.getPointAt(t))<.001,type+' connects');for(let i=0;i<=100;i++)assert.ok(slide.getPoint(i/100).toArray().every(Number.isFinite));}}
console.log('PASS: snap support, overlap, rotation, hollow arches, settling, saves, three guided builds, and all six connected slides.');
