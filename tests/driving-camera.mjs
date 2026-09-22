import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {interiorDashcam} from '../driving-camera.js';
const car=new T.Group(),body=new T.Group();car.add(body);const pos=new T.Vector3(),target=new T.Vector3(),up=new T.Vector3();
for(const yaw of [0,.7,2.9])for(const roll of [-.1,0,.1]){
 car.position.set(70,4,-19);car.rotation.set(.12,yaw,roll,'YXZ');body.rotation.x=.07;
 const fov=interiorDashcam(body,1.7,pos,target,up);
 assert.ok(body.worldToLocal(pos.clone()).distanceTo(new T.Vector3(0,1.04,.54))<1e-9);
 assert.ok(body.worldToLocal(target.clone()).distanceTo(new T.Vector3(0,.84,-.30))<1e-9);
 assert.ok(Math.abs(up.length()-1)<1e-9);assert.ok(fov>75&&fov<90);
}
for(const aspect of [1.7,390/720]){
 const camera=new T.PerspectiveCamera(interiorDashcam(body,aspect,pos,target,up),aspect,.025,600);camera.position.copy(pos);camera.up.copy(up);camera.lookAt(target);camera.updateMatrixWorld();
 for(const x of [-.60,.60]){const p=body.localToWorld(new T.Vector3(x,1.1,-.22)).project(camera);assert.ok(Math.abs(p.x)<1,'Both faces fit in landscape and portrait');}
}
console.log('PASS: interior mount follows full car transform, stays inside the cabin, and frames both faces in portrait and landscape.');
