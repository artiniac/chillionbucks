import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {laneStep,driftStep} from '../driving-car.js';
import {interiorDashcam} from '../driving-camera.js';
// Assert directions in rendered space, not just the sign of an internal scalar.
for(const heading of [0,.6,1.5,2.8,4,5.6])for(const direction of [-1,1])for(const followLine of [true,false])for(const drifting of [false,true]){
 const tangent=new T.Vector3(Math.sin(heading),0,Math.cos(heading)),right=new T.Vector3().crossVectors(tangent,new T.Vector3(0,1,0));
 const camera=new T.PerspectiveCamera(48,1.6,.1,200);camera.position.copy(tangent).multiplyScalar(-14);camera.position.y=7;camera.lookAt(new T.Vector3().copy(tangent).multiplyScalar(3));camera.updateMatrixWorld();
 let lane=0,slide={angle:0,seconds:0,awarded:false,velocity:0};
 for(let i=0;i<60;i++){slide=driftStep(slide,{held:drifting,running:true,turn:0,steer:direction,dt:1/60});lane=laneStep(lane,{followLine,offset:0,steer:direction,drift:slide.angle,speed:10,width:16,dt:1/60});}
 const projected=right.clone().multiplyScalar(lane).project(camera),center=new T.Vector3().project(camera);assert.equal(Math.sign(projected.x-center.x),direction,'The selected arrow must move to that side in chase view on every track heading');
 if(drifting){const nose=tangent.clone().applyAxisAngle(new T.Vector3(0,1,0),slide.angle);assert.equal(Math.sign(nose.dot(right)),direction,'Manual drift must point toward the selected side');}
 // Switching to the rear-facing cabin camera must not change driver-relative input.
 const body=new T.Group();body.rotation.y=heading+slide.angle;const p=new T.Vector3(),target=new T.Vector3(),up=new T.Vector3();interiorDashcam(body,1,p,target,up);assert.equal(Math.sign(lane),direction);
}
for(const sign of [-1,1]){let lane=0;for(let i=0;i<600;i++)lane=laneStep(lane,{followLine:false,offset:0,steer:sign,drift:0,speed:19,width:8,dt:1/30});assert.ok(Math.abs(lane)<=2.7,'Steering stays within the road');assert.equal(laneStep(lane,{followLine:false,offset:0,steer:0,drift:0,speed:19,width:8,dt:1/30}),lane,'Releasing stops manual lane movement');}
console.log('PASS: left/right rendered directions across six headings, both lesson modes, manual drifting, camera independence, road bounds, and input release.');
