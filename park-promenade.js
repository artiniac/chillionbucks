import * as T from './vendor/three.module.js';
import {palm} from './park-attractions.js';
import {batchScene} from './town-streets.js';
// This public garden occupies the connection outside the editable attraction area.
export function parkPromenade(){
 const root=new T.Group(),solid=new T.Group(),materials=new Map();
 const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.75}));return materials.get(color);};
 function box(color,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(color));m.position.set(x,y,z);m.castShadow=h>.15;m.receiveShadow=true;solid.add(m);return m;}
 // Broad promenade with alternating paving bays and narrow stone borders.
 box('#d4cbb8',0,-.15,-48,16,.18,14);
 for(const x of [-7.8,7.8])box('#ac987a',x,-.035,-48,.16,.08,14);
 for(let z=-54;z<=-42;z+=2)box('#b9ad98',0,-.048,z,15.6,.025,.06);
 for(const x of [-5.2,5.2])for(const z of [-52,-44]){
  box('#d1c2a4',x,.04,z,2.4,.45,2.4);box('#64764b',x,.28,z,2.16,.05,2.16);
  const tree=palm();tree.position.set(x,.28,z);tree.scale.setScalar(1.15);root.add(tree);
 }
 for(const x of [-5.5,5.5]){
  for(let i=0;i<5;i++)box('#957657',x,.36,-48+(i-2)*.12,2,.09,.09);
  for(const dx of [-.75,.75])box('#485b58',x+dx,.12,-48,.08,.5,.6);
  box('#485b58',x,.56,-48.28,2,.35,.07);
 }
 // A readable gateway, with open space below for walking into the grotto.
 for(const x of [-3.4,3.4])box('#b6a184',x,1.1,-44,.45,2.6,.45);
 box('#477b74',0,2.35,-44,7.3,.5,.28);
 for(const x of [-8.6,8.6])for(const z of [-53,-47,-41]){
  box('#3f5655',x,1.1,z,.09,2.8,.09);box('#3f5655',x,2.53,z,.42,.09,.42);box('#f4e7ba',x,2.35,z,.24,.3,.24);
 }
 // Palm groves beyond the playable boundary hide the edge of the world.
 for(const side of [-1,1])for(let i=0;i<22;i++){
  const z=38-i*6,x=side*(z < -45?27:49)+(i%3)*side*2;
  const tree=palm();tree.position.set(x,-.28,z);tree.scale.setScalar(1.4+(i%4)*.2);tree.rotation.y=i*2.4;root.add(tree);
 }
 root.add(batchScene(solid));return root;
}
// Recompute the approach whenever the player reshapes the lazy river.
export function grottoApproach(river){
 const north=river.getPoints(240).reduce((a,b)=>a.z<b.z?a:b).clone();north.z-=2.1;north.y=0;
 const path=new T.CatmullRomCurve3([north,new T.Vector3(north.x*.65,0,(north.z-41)/2),new T.Vector3(0,0,-41)],false,'centripetal');
 const positions=[],indices=[];
 for(let i=0;i<=48;i++){const p=path.getPoint(i/48),t=path.getTangent(i/48),n=new T.Vector3(-t.z,0,t.x).normalize();for(const side of [-1,1]){const q=p.clone().addScaledVector(n,side*1.7);positions.push(q.x,-.255,q.z);}if(i<48){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
