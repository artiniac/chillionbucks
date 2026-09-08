import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {GROTTO_Z,parkGroundGeometry,canWalkParkExtension} from '../park-grotto-geometry.js';
const geo=parkGroundGeometry(),ground=new T.Mesh(geo,new T.MeshBasicMaterial({side:T.DoubleSide}));ground.updateMatrixWorld();
function groundAt(x,z){return new T.Raycaster(new T.Vector3(x,5,z),new T.Vector3(0,-1,0)).intersectObject(ground).length>0;}
for(const x of [-6,0,6])for(const z of [GROTTO_Z-12,GROTTO_Z,GROTTO_Z+12])assert.equal(groundAt(x,z),false,'pool excavation must stay open');
for(const p of [[0,0],[0,-45],[10,GROTTO_Z],[0,GROTTO_Z-20]])assert.ok(groundAt(...p),'continuous surrounding land');
for(let z=-40;z>=-55;z-=.25)assert.ok(canWalkParkExtension(0,z),'walk through north gate to pool deck');
for(let x=0;x<=10;x+=.25)assert.ok(canWalkParkExtension(x,-55),'walk around southern coping');
for(let z=-55;z>=GROTTO_Z-13;z-=.25)assert.ok(canWalkParkExtension(10,z),'walk along pool side');
assert.equal(canWalkParkExtension(0,GROTTO_Z),false,'walking cannot enter deep pool');
assert.equal(canWalkParkExtension(0,-95),false);assert.equal(canWalkParkExtension(25,-70),false);
console.log('PASS: open pool excavation, connected north path, walkable deck, and pool boundaries.');
