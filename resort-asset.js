import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
// One download and shared GPU resources for repeated fixed scenery.
let cabanaPromise;
function loadCabana(){
 return cabanaPromise ||= new GLTFLoader().loadAsync(new URL('./assets/models/resort-cabana.glb',import.meta.url).href).then(({scene})=>{
  const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  if(!Number.isFinite(size.length())||Math.min(size.x,size.y,size.z)<=0)throw Error('Invalid cabana bounds');
  const scale=Math.min(3.6/Math.max(size.x,size.z),3.2/size.y),root=new T.Group();
  scene.scale.setScalar(scale);scene.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);root.add(scene);
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.userData.shared=true;for(const key of ['map','normalMap','roughnessMap','metalnessMap'])if(m[key])m[key].anisotropy=4;}}});
  return root;
 });
}
export async function upgradeResortCabanas(bays,onReady=()=>{}){
 try{const prototype=await loadCabana();for(const bay of bays){if(!bay.parent)continue;bay.getObjectByName('cabana-fallback').visible=false;bay.add(prototype.clone(true));}onReady();return true;}catch(error){console.warn('Detailed cabanas unavailable; using built-in scenery.',error);return false;}
}
