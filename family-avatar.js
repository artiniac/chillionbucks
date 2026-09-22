import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';

// Trim the open bottom of a reconstructed bust at its clothing/neck boundary.
// Existing facial positions, normals, UVs, textures, and source files remain intact.
export function trimBust(geometry,matrix,worldY){
 const source=geometry.index?geometry.toNonIndexed():geometry,attrs=source.attributes,out=Object.fromEntries(Object.keys(attrs).map(k=>[k,[]])),p=new T.Vector3();
 for(let i=0;i<attrs.position.count;i+=3){let polygon=[];for(let j=0;j<3;j++){const v={};for(const [name,a] of Object.entries(attrs))v[name]=Array.from(a.array.subarray((i+j)*a.itemSize,(i+j+1)*a.itemSize));v.height=p.fromArray(v.position).applyMatrix4(matrix).y;polygon.push(v);}
  const clipped=[];for(let j=0;j<polygon.length;j++){const a=polygon[j],b=polygon[(j+1)%polygon.length],inside=a.height>=worldY;if(inside)clipped.push(a);if(inside!==(b.height>=worldY)){const t=(worldY-a.height)/(b.height-a.height),v={height:worldY};for(const name of Object.keys(attrs))v[name]=a[name].map((n,k)=>T.MathUtils.lerp(n,b[name][k],t));clipped.push(v);}}
  for(let j=1;j<clipped.length-1;j++)for(const v of [clipped[0],clipped[j],clipped[j+1]])for(const name of Object.keys(attrs))out[name].push(...v[name]);
 }
 const clean=new T.BufferGeometry();for(const [name,a] of Object.entries(attrs))clean.setAttribute(name,new T.BufferAttribute(new a.array.constructor(out[name]),a.itemSize,a.normalized));clean.computeBoundingBox();clean.computeBoundingSphere();if(source!==geometry)source.dispose();return clean;
}
// Reconstructed textured head meshes from the family's own photo references.
export async function loadFamilyHead(child=false,{fitShirt=false}={}){
 const {scene}=await new GLTFLoader().loadAsync(child?'./assets/family/leo-head.glb':'./assets/family/artin-head.glb');
 scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 const height=child?.50:.37,scale=height/size.y;
 if(fitShirt){const boundary=center.y+((child?.91:.935)-(child?1.02:1.09))/scale;scene.traverse(o=>{if(o.isMesh){const old=o.geometry;o.geometry=trimBust(old,o.matrixWorld,boundary);old.dispose();}});}
 const pivot=new T.Group();pivot.name=child?'Leo photo-reconstructed 3D head':'Artin photo-reconstructed 3D head';
 scene.position.set(-center.x*scale,-center.y*scale,-center.z*scale);scene.scale.setScalar(scale);scene.rotation.y=-Math.PI/2;if(child)scene.position.y-=.09;
 scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){m.roughness=Math.max(.65,m.roughness??.65);m.metalness=0;}}});
 pivot.add(scene);return pivot;
}
