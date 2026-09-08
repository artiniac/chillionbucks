import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {poolWater} from '../pool-water.js';
import {curveFor,ribbon,START_ROUTE,WIDTH} from '../park-geometry.js';
globalThis.innerWidth=390;
for(const route of [START_ROUTE,START_ROUTE.map(([x,z])=>[x*1.6,z*1.6])]){
 const geo=ribbon(curveFor(route),WIDTH/2),before=new T.Box3().setFromBufferAttribute(geo.attributes.position),surface=poolWater(geo);
 surface.updateMatrixWorld(true);const after=new T.Box3().setFromObject(surface);
 assert.ok(before.min.distanceTo(after.min)<1e-5,'River surface must stay aligned with its editable channel');
 assert.ok(before.max.distanceTo(after.max)<1e-5,'River surface must retain bounds');
 surface.userData.disturbances(Array.from({length:12},(_,i)=>new T.Vector3(i,0,i+1)));assert.equal(surface.material.uniforms.rippleCount.value,8);
 surface.userData.tick(2.5);assert.equal(surface.material.uniforms.time.value,2.5);
 surface.disposeReflection();surface.geometry.dispose();surface.material.dispose();
}
const lagoon=poolWater(new T.CircleGeometry(3.85,64).rotateX(-Math.PI/2).scale(1,1,.7).translate(0,.345,0),{height:.345,lagoon:true});
lagoon.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(lagoon);assert.ok(Math.abs(bounds.min.y-.345)<1e-5);assert.ok(Math.abs(bounds.max.y-.345)<1e-5);lagoon.disposeReflection();lagoon.geometry.dispose();lagoon.material.dispose();
console.log('PASS: river alignment after route edits, lagoon height, bounded disturbances, animation, and disposal.');
