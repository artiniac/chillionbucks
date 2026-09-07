import * as T from './vendor/three.module.js';
import {DEF,COLORS,LAYER} from './blocks-engine.js';
const cache=new Map(),materials=new Map();
export function brickMaterial(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color:COLORS[color]||COLORS.mint,roughness:.32,metalness:.02}));return materials.get(color);}
function merge(geometries){const positions=[],normals=[],uvs=[];for(const geo of geometries){const g=geo.index?geo.toNonIndexed():geo;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);if(g.attributes.uv)uvs.push(...g.attributes.uv.array);else uvs.push(...Array(g.attributes.position.count*2).fill(0));if(g!==geo)g.dispose();geo.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeBoundingSphere();return g;}
export function brickGeometry(kind){if(cache.has(kind))return cache.get(kind);const d=DEF[kind],geos=[],h=d.h*LAYER;const box=(x,y,z,w,hh,depth)=>{const g=new T.BoxGeometry(w,hh,depth);g.translate(x,y,z);geos.push(g);};
 if(['arch','window','door'].includes(kind)){
  box(-d.w/2+.48,h/2,0,.94,h-.025,d.d-.06);box(d.w/2-.48,h/2,0,.94,h-.025,d.d-.06);box(0,h-LAYER/2,0,d.w-.06,LAYER-.025,d.d-.06);if(kind==='window')box(0,LAYER/2,0,d.w-.06,LAYER-.025,d.d-.06);
 }else if(kind==='round'){const g=new T.CylinderGeometry(.96,.96,h-.025,24);g.translate(0,h/2,0);geos.push(g);}
 else if(kind==='roof'||kind==='slope'){
  const shape=new T.Shape();shape.moveTo(-d.w/2,0);shape.lineTo(d.w/2,0);if(kind==='roof'){shape.lineTo(0,h);}else{shape.lineTo(-d.w/2,h);}shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:d.d-.06,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.02,bevelThickness:.02});g.translate(0,.02,-(d.d-.06)/2);geos.push(g);
 }else box(0,h/2,0,d.w-.06,h-.025,d.d-.06);
 if(!d.smooth)for(let x=0;x<d.w;x++)for(let z=0;z<d.d;z++){const g=new T.CylinderGeometry(.225,.25,.14,8);g.translate(x-(d.w-1)/2,h+.045,z-(d.d-1)/2);geos.push(g);}
 const g=merge(geos);cache.set(kind,g);return g;
}
export function brickMesh(piece,override){const m=new T.Mesh(brickGeometry(piece.kind),override||brickMaterial(piece.color));const d=DEF[piece.kind],w=piece.rot%2?d.d:d.w,depth=piece.rot%2?d.w:d.d;m.position.set(piece.x+w/2,piece.y*LAYER,piece.z+depth/2);m.rotation.y=-(piece.rot||0)*Math.PI/2;m.castShadow=true;m.receiveShadow=true;m.userData.id=piece.id;return m;}
