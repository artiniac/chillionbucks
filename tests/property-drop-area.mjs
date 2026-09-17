import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {constructionFootprint,projectConstructionFootprint,acceptsConstructionDrop} from '../property-drop-area.js';
const slab=new T.Mesh(new T.BoxGeometry(8,.1,12));slab.position.set(2,0,-1);
const pipe=new T.Mesh(new T.BoxGeometry(.1,.1,1));
const bounds=constructionFootprint([{model:slab},{model:pipe}]);
assert.ok(bounds.minX< -2&&bounds.maxX>6&&bounds.minZ< -7&&bounds.maxZ>5,'The drop area covers the entire finished property, not only the next pipe');
const viewport={left:12,top:48,width:390,height:500};
for(const angle of [0,.7,Math.PI/2,Math.PI])for(const scale of [.6,1,1.6]){
 const item={x:24,y:0,z:-35,rot:angle,s:scale};
 const camera=new T.PerspectiveCamera(58,viewport.width/viewport.height,.1,200);
 camera.position.set(35,24,-5);camera.lookAt(24,0,-35);camera.updateMatrixWorld();
 const polygon=projectConstructionFootprint(bounds,item,camera,viewport);
 const center={x:polygon.reduce((n,p)=>n+p.x,0)/4,y:polygon.reduce((n,p)=>n+p.y,0)/4};
 assert.ok(acceptsConstructionDrop(center,polygon,viewport),'Whole-property drop follows rotation and scale');
 const offCenter={x:polygon[0].x*.65+center.x*.35,y:polygon[0].y*.65+center.y*.35};
 assert.ok(acceptsConstructionDrop(offCenter,polygon,viewport),'Drop away from the next part still places it');
 assert.equal(acceptsConstructionDrop({x:viewport.left-1,y:center.y},polygon,viewport),false,'Outside the play surface does not place');
 assert.equal(acceptsConstructionDrop({x:400,y:49},polygon,viewport),false,'Dropping on unrelated land does not place');
 assert.equal(acceptsConstructionDrop(center,polygon.map(p=>({...p,depth:2})),viewport),false,'Behind-camera geometry does not accept a drop');
}
const square=[{x:30,y:60,depth:0},{x:150,y:60,depth:0},{x:150,y:180,depth:0},{x:30,y:180,depth:0}];
assert.ok(acceptsConstructionDrop({x:155,y:120},square,viewport),'Near-edge drops allow a small finger tolerance');
assert.equal(acceptsConstructionDrop({x:175,y:120},square,viewport),false,'Tolerance does not extend to another lot');
console.log('PASS: full-property targets, off-center drops, rotations, scales, viewport clipping, missed drops, and finger tolerance.');
