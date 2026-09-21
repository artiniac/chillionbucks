import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
// Pavement clearance and rendered sidewalks share this width.
export const SIDEWALK_WIDTH=.825;
export const STREETS=[{x:0,z:-27,w:97,d:3.2},{x:0,z:23,w:97,d:3.2},{x:-47,z:-2,w:3.2,d:53},{x:47,z:-2,w:3.2,d:53},{x:-18,z:-2,w:3,d:53},{x:18,z:-2,w:3,d:53},{x:0,z:-4,w:39,d:3},{x:0,z:3,w:39,d:3},{x:0,z:14.5,w:39,d:3}];
// New districts surround the original streets so saved homes do not move.
for(const z of [-99,-75,-51,47,71,95])STREETS.push({x:0,z,w:248,d:3.2});
for(const x of [-119,-95,-71,71,95,119])STREETS.push({x,z:-2,w:3.2,d:198});
for(const x of [-47,47]){STREETS.push({x,z:-63.5,w:3.2,d:73});STREETS.push({x,z:59,w:3.2,d:72});}
export function intersections(){const out=[];for(const a of STREETS.filter(r=>r.w>r.d))for(const b of STREETS.filter(r=>r.d>r.w))if(Math.abs(b.x-a.x)<=a.w/2&&Math.abs(a.z-b.z)<=b.d/2)out.push({x:b.x,z:a.z});return out;}
export function nearStreet(x,z,pad=0){return STREETS.some(r=>Math.abs(x-r.x)<r.w/2+pad&&Math.abs(z-r.z)<r.d/2+pad);}
export function streetScene(){const g=new T.Group(),mats=new Map(),crossings=intersections();
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.87}));return mats.get(c);};
 function box(c,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=h>.1;m.receiveShadow=true;g.add(m);return m;}
 function post(x,z){const m=new T.Mesh(new T.CylinderGeometry(.025,.045,1.65,8),mat('#45525a'));m.position.set(x,.81,z);g.add(m);box('#45525a',x+.14,1.64,z,.32,.045,.05);box('#eee6bc',x+.28,1.61,z,.13,.055,.10);}
 const junction=(x,z,pad=2.2)=>crossings.some(p=>Math.abs(p.x-x)<pad&&Math.abs(p.z-z)<pad);
 // Full sidewalk slabs form continuous junctions beneath the asphalt grid.
 for(const r of STREETS)box('#c9c9b9',r.x,-.04,r.z,r.w+SIDEWALK_WIDTH*2,.10,r.d+SIDEWALK_WIDTH*2);
 for(const r of STREETS){const horizontal=r.w>r.d;box('#343e43',r.x,.018,r.z,r.w,.016,r.d);
 const length=horizontal?r.w:r.d,width=horizontal?r.d:r.w;
 for(let t=-length/2+.2;t<length/2;t+=.6){const x=horizontal?r.x+t:r.x,z=horizontal?r.z:r.z+t;if(junction(x,z))continue;
  for(const side of [-1,1]){const xx=x+(horizontal?0:side*(width/2+.045)),zz=z+(horizontal?side*(width/2+.045):0);box('#deded0',xx,.04,zz,horizontal?.59:.09,.11,horizontal?.09:.59);}
 }
 for(let t=-length/2+.7;t<length/2;t+=1.1){const x=horizontal?r.x+t:r.x,z=horizontal?r.z:r.z+t;if(junction(x,z,2.5))continue;box('#d9cf98',x,.032,z,horizontal?.52:.034,.007,horizontal?.034:.52);}
 for(let t=-length/2+3;t<length/2-1;t+=6){const x=horizontal?r.x+t:r.x,z=horizontal?r.z:r.z+t;if(junction(x,z,3))continue;for(const side of [-1,1])post(x+(horizontal?0:side*(width/2+.55)),z+(horizontal?side*(width/2+.55):0));}
 }
 for(const p of crossings){for(const axis of [0,1])for(const sign of [-1,1]){
  for(let i=0;i<7;i++){const t=-1.22+i*.4;box('#efeee0',p.x+(axis?sign*2.1:t),.038,p.z+(axis?t:sign*2.1),axis?.65:.2,.008,axis?.2:.65);}
  box('#efeee0',p.x+(axis?sign*2.7:0),.038,p.z+(axis?0:sign*2.7),axis?.08:2.7,.008,axis?2.7:.08);
 }
 // Small signal poles retain the scale of the surrounding buildings.
 for(const sign of [-1,1]){const x=p.x+sign*2.1,z=p.z-sign*2.1;box('#4c5655',x,.7,z,.05,1.4,.05);box('#303d3e',x,1.3,z,.13,.3,.1);box('#b2c979',x,1.34,z+.055,.065,.065,.012);}}
 // Fine asphalt aggregate is a shading detail, not thousands of extra meshes.
 const asphalt=mat('#343e43');asphalt.onBeforeCompile=s=>{s.vertexShader='varying vec3 asphaltP;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nasphaltP=position;');s.fragmentShader='varying vec3 asphaltP;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=fract(sin(dot(floor(asphaltP.xz*90.),vec2(127.1,311.7)))*43758.5453);diffuseColor.rgb*=.94+grain*.12;');};
 return batchScene(g);
}
export function batchScene(root){root.updateMatrixWorld(true);const buckets=new Map();for(const o of [...root.children]){if(!o.isMesh||o.isInstancedMesh)continue;const geometry=o.geometry.clone().applyMatrix4(o.matrix),key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;if(!buckets.has(key))buckets.set(key,{material:o.material,cast:o.castShadow,receive:o.receiveShadow,geometries:[]});buckets.get(key).geometries.push(geometry);o.geometry.dispose();root.remove(o);}for(const {material,cast,receive,geometries} of buckets.values()){const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());const m=new T.Mesh(geometry,material);m.castShadow=cast;m.receiveShadow=receive;root.add(m);}return root;}
