import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
// Reconstructed textured head meshes from the family's own photo references.
export async function loadFamilyHead(child=false){
 const {scene}=await new GLTFLoader().loadAsync(child?'./assets/family/leo-head.glb':'./assets/family/artin-head.glb');
 scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const height=child?.50:.37,scale=height/size.y;
 const pivot=new T.Group();pivot.name=child?'Leo photo-reconstructed 3D head':'Artin photo-reconstructed 3D head';
 scene.position.set(-center.x*scale,-center.y*scale,-center.z*scale);scene.scale.setScalar(scale);scene.rotation.y=-Math.PI/2;if(child)scene.position.y-=.09;
 scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.roughness=Math.max(.65,m.roughness??.65);m.metalness=0;}}});
 pivot.add(scene);return pivot;
}
