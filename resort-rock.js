import * as T from './vendor/three.module.js';
import {scannedMaterial} from './realism.js?v=estates4';
// Layered, weathered stone with continuous deformation across UV seams.
export function resortRock(seed=0){
 const geo=new T.SphereGeometry(1,36,22),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const broad=Math.sin(x*3.8+seed)*Math.cos(z*4.1-seed*.7)*.13;
  const strata=Math.sin(y*15+x*1.9+z*2.2+seed)*.032;
  const grain=Math.sin(x*23+z*17+seed)*Math.cos(y*21-z*12)*.013;
  const radius=1+broad+strata+grain;
  p.setXYZ(i,x*radius,Math.max(-.68,y*radius),z*radius);
 }
 geo.computeVertexNormals();const mesh=new T.Mesh(geo,scannedMaterial('rock_face',[1.5,1],'#d2c6aa'));mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
