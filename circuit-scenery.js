import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
export function sceneryPlan(curve,width){
 const samples=curve.getSpacedPoints(700),xs=samples.map(p=>p.x),zs=samples.map(p=>p.z),bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)};
 const clearance=(x,z,r=0)=>samples.every(p=>Math.hypot(p.x-x,p.z-z)>width/2+18+r);
 // Pavilion outside the track's complete bounding rectangle, not just one sample.
 const pavilion={x:(bounds.minX+bounds.maxX)/2,z:bounds.minZ-36};
 const trees=[];let seed=7391;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<900;i++){const x=bounds.minX-95+rand()*(bounds.maxX-bounds.minX+190),z=bounds.minZ-95+rand()*(bounds.maxZ-bounds.minZ+190),r=2.2+rand()*2;if(clearance(x,z,r)&&Math.hypot(x-pavilion.x,z-pavilion.z)>27)trees.push({x,z,r,height:6+rand()*5,angle:rand()*Math.PI*2});}
 return {bounds,pavilion,trees,clearance};
}
export function buildCircuitScenery(group,curve,width){
 const plan=sceneryPlan(curve,width),bark=material('#645544'),leaf=material('#ffffff'),steel=material('#58656a',.4,.6),stone=material('#c4c0b1');
 const trunkGeo=new T.CylinderGeometry(.12,.28,1,9),trunks=new T.InstancedMesh(trunkGeo,bark,plan.trees.length),branches=new T.InstancedMesh(new T.CylinderGeometry(.035,.10,1,6),bark,plan.trees.length*5);
 // Open textured leaf clusters, not solid spherical crowns.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');let seed=451;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<230;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*55,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle=['#506b38','#738649','#344f2e','#8e9e57'][i%4];ctx.beginPath();ctx.ellipse(0,0,3+rand()*3,1.5+rand()*2,0,0,7);ctx.fill();ctx.restore();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;leaf.map=texture;leaf.alphaTest=.4;leaf.side=T.DoubleSide;leaf.roughness=1;
 const foliage=new T.InstancedMesh(new T.PlaneGeometry(1,1),leaf,plan.trees.length*18),dummy=new T.Object3D();
 plan.trees.forEach((tree,i)=>{dummy.position.set(tree.x,tree.height*.32,tree.z);dummy.rotation.set(0,tree.angle,0);dummy.scale.set(1,tree.height*.64,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
 for(let k=0;k<5;k++){const a=k*2.4+tree.angle,start=new T.Vector3(tree.x,tree.height*.40,tree.z),end=new T.Vector3(tree.x+Math.sin(a)*tree.r*.55,tree.height*(.65+k*.045),tree.z+Math.cos(a)*tree.r*.55),d=end.clone().sub(start);dummy.position.copy(start).addScaledVector(d,.5);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());dummy.scale.set(1,d.length(),1);dummy.updateMatrix();branches.setMatrixAt(i*5+k,dummy.matrix);}
 for(let k=0;k<18;k++){const a=k*2.399+tree.angle,r=tree.r*Math.sqrt((k+.5)/18);dummy.position.set(tree.x+Math.sin(a)*r*.65,tree.height*.65+Math.sin(k*3.1)*tree.r*.45,tree.z+Math.cos(a)*r*.65);dummy.rotation.set((k%3-1)*.65,a,(k%2)*.3);dummy.scale.set(tree.r*1.4,tree.r*1.4,1);dummy.updateMatrix();foliage.setMatrixAt(i*18+k,dummy.matrix);foliage.setColorAt(i*18+k,new T.Color().setHSL(.23+(i%4)*.008,.22,.72+(k%4)*.055));}});
 for(const o of [trunks,branches,foliage]){o.castShadow=true;o.receiveShadow=true;group.add(o);}
 const place=(geo,mat,x,y,z)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o;};
 const plaza=place(new T.BoxGeometry(46,.1,23),stone,plan.pavilion.x,-.1,plan.pavilion.z);plaza.name='Pavilion forecourt';
 // Keep async load attached only to the group belonging to this course.
 new GLTFLoader().load('./assets/circuit/pavilion.glb',({scene})=>{scene.updateMatrixWorld(true);const buckets=new Map();scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld),key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,geo:[]});buckets.get(key).geo.push(g);});const pavilion=new T.Group();pavilion.name='Higgsfield circuit pavilion';for(const {mat,geo} of buckets.values()){const compatible=geo.map(g=>{const n=g.index?g.toNonIndexed():g;for(const k of Object.keys(n.attributes))if(!['position','normal','uv'].includes(k))n.deleteAttribute(k);return n;});const merged=mergeGeometries(compatible);if(merged){const m=new T.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;pavilion.add(m);}for(const g of compatible)g.dispose();}pavilion.rotation.y=0;pavilion.position.set(plan.pavilion.x,0,plan.pavilion.z);group.add(pavilion);},undefined,()=>{});
 // Long planting beds and perimeter lights make the setting coherent.
 for(let i=0;i<10;i++){const x=plan.pavilion.x-22+i*4.8,z=plan.pavilion.z+11;place(new T.BoxGeometry(2.8,.45,1.2),stone,x,.2,z);const hedge=place(new T.BoxGeometry(2.65,.7,1),material('#415b38'),x,.75,z);}
 for(let i=0;i<8;i++){const x=plan.pavilion.x-25+i*7,z=plan.pavilion.z+15;place(new T.CylinderGeometry(.055,.08,5,8),steel,x,2.5,z);place(new T.BoxGeometry(.75,.12,.28),steel,x,5,z);}
 return plan;
}
