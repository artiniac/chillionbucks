import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

export const CAR_ASSETS={f430:'f430-higgsfield.glb',aventador:'aventador-higgsfield.glb',bmwE30:'e30-higgsfield.glb',skylineR34:'skyline-r34.glb'};
const models=new Map(),requests=new Map();
export function detailedCarParts(id){return models.get(id);}
export function loadDetailedCar(id){
 if(requests.has(id))return requests.get(id);
 const job=new GLTFLoader().loadAsync('assets/cars/'+CAR_ASSETS[id]).then(({scene})=>{
  scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  const height=id==='aventador'?1.2:id==='f430'?1.3:1.42,width=id==='aventador'?2.12:1.98;
  const transform=new T.Matrix4().makeScale(width/size.x,height/size.y,4.6/size.z).multiply(new T.Matrix4().makeTranslation(-center.x,-bounds.min.y,-center.z));
  const groups={body:new T.Group(),wheels:new T.Group(),glass:new T.Group(),lights:new T.Group()},buckets=new Map();
  scene.traverse(o=>{
   if(!o.isMesh)return;
   let geo=o.geometry.clone().applyMatrix4(transform.clone().multiply(o.matrixWorld));if(!geo.attributes.normal)geo.computeVertexNormals();if(geo.index){const previous=geo;geo=geo.toNonIndexed();previous.dispose();}
   const position=geo.attributes.position,normal=geo.attributes.normal,uv=geo.attributes.uv;
   const material=o.material;material.userData.shared=true;material.flatShading=false;material.needsUpdate=true;material.roughness=Math.min(material.roughness,.46);material.metalness=Math.max(material.metalness,.12);
   if(material.map){material.map.colorSpace=T.SRGBColorSpace;material.map.anisotropy=4;}
   for(let i=0;i<position.count;i+=3){
    const x=(position.getX(i)+position.getX(i+1)+position.getX(i+2))/3,y=(position.getY(i)+position.getY(i+1)+position.getY(i+2))/3,z=(position.getZ(i)+position.getZ(i+1)+position.getZ(i+2))/3;
    const ny=(normal.getY(i)+normal.getY(i+1)+normal.getY(i+2))/3;
    let stage='body';
    if(Math.abs(x)>.67&&y<.77&&Math.min(Math.abs(z-1.42),Math.abs(z+1.36))<.57)stage='wheels';
    else if(y>.90&&y<height-.08&&Math.abs(z)<1.02&&Math.abs(ny)<.85)stage='glass';
    else if(Math.abs(z)>2.05&&y>.42&&y<.9&&Math.abs(x)>.4)stage='lights';
    const key=stage+'|'+material.uuid;if(!buckets.has(key))buckets.set(key,{stage,material,p:[],n:[],uv:[]});const b=buckets.get(key);
    for(let j=i;j<i+3;j++){b.p.push(position.getX(j),position.getY(j),position.getZ(j));b.n.push(normal.getX(j),normal.getY(j),normal.getZ(j));if(uv)b.uv.push(uv.getX(j),uv.getY(j));}
   }
   geo.dispose();o.geometry.dispose();
  });
  for(const b of buckets.values()){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));if(b.uv.length)geo.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geo.userData.shared=true;const mesh=new T.Mesh(geo,b.material);mesh.castShadow=mesh.receiveShadow=true;groups[b.stage].add(mesh);}
  for(const [stage,g] of Object.entries(groups))g.userData.lessonPart=stage;
  models.set(id,groups);return groups;
 }).catch(error=>{requests.delete(id);throw error;});requests.set(id,job);return job;
}
