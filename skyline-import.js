import {addFamilyRiders} from './family-riders.js?v=4';
import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {skylineCoupe} from './skyline-model.js';
export function makeCar(){
 const result=skylineCoupe();
 result.ready=new GLTFLoader().loadAsync('./assets/cars/skyline-r34.glb').then(async ({scene})=>{
  scene.updateMatrixWorld(true);const box=new T.Box3().setFromObject(scene),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=4.6/size.z;
  const transform=new T.Matrix4().makeScale(scale,scale,scale).multiply(new T.Matrix4().makeTranslation(-center.x,-box.min.y,-center.z));
  const buckets=new Map(),wheelCenters=new Map();scene.traverse(o=>{if(/^3DWheel_(Front|Rear)_[LR]_/.test(o.name)){const b=new T.Box3().setFromObject(o).applyMatrix4(transform);wheelCenters.set(o.name,b.getCenter(new T.Vector3()));}});
  scene.traverse(o=>{if(!o.isMesh)return;let parent=o,wheel='body';while(parent){if(wheelCenters.has(parent.name)){wheel=parent.name;break;}parent=parent.parent;}
   let geometry=o.geometry.clone().applyMatrix4(transform.clone().multiply(o.matrixWorld));if(geometry.index){const old=geometry;geometry=geometry.toNonIndexed();old.dispose();}for(const key of Object.keys(geometry.attributes))if(!['position','normal','uv','uv1'].includes(key))geometry.deleteAttribute(key);if(!geometry.attributes.normal)geometry.computeVertexNormals();
   const material=o.material,key=wheel+'|'+material.uuid+'|'+Object.keys(geometry.attributes).sort().join(',');if(!buckets.has(key))buckets.set(key,{wheel,material,geometries:[]});buckets.get(key).geometries.push(geometry);
  });
  const replacement=new T.Group(),wheels=[];for(const [name,center] of wheelCenters){const pivot=new T.Group(),spin=new T.Group();pivot.position.copy(center);pivot.add(spin);replacement.add(pivot);wheels.push({name,pivot,spin,front:name.includes('Front'),radius:.32});}
  for(const {wheel,material,geometries} of buckets.values()){
   const geometry=mergeGeometries(geometries);for(const g of geometries)g.dispose();if(!geometry)throw Error('Skyline geometry could not be combined');
   if(material.name.includes('Paint_Material')){material.color=result.paint.color;material.metalness=.7;material.roughness=.25;}
   if(material.transparent)material.depthWrite=false;if(material.name.includes('Window_Material')){material.transparent=true;material.opacity=.13;material.depthWrite=false;material.roughness=.12;}
   const object=new T.Mesh(geometry,material);object.castShadow=true;object.receiveShadow=true;
   if(wheel==='body')replacement.add(object);else{const w=wheels.find(w=>w.name===wheel);geometry.translate(-w.pivot.position.x,-w.pivot.position.y,-w.pivot.position.z);w.spin.add(object);}
  }
  const oldMaterials=new Set();result.body.traverse(o=>{if(o.isMesh){o.geometry.dispose();oldMaterials.add(o.material);}});for(const material of oldMaterials)if(material!==result.paint)material.dispose();result.body.clear();result.body.add(replacement);result.family=addFamilyRiders(result.body);result.wheels.splice(0,result.wheels.length,...wheels);scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});await result.family.ready;return {meshes:buckets.size,wheels:wheels.length};
 });
 return result;
}
