import * as T from './vendor/three.module.js';

// Use the completed property's footprint, so even the first pipe has a generous target.
export function constructionFootprint(parts) {
 const bounds=new T.Box3();
 for(const part of parts)bounds.union(new T.Box3().setFromObject(part.model));
 if(bounds.isEmpty())return {minX:-1,maxX:1,minZ:-1,maxZ:1,y:.08};
 const center=bounds.getCenter(new T.Vector3()),halfX=Math.max(1,(bounds.max.x-bounds.min.x)/2+.22),halfZ=Math.max(1,(bounds.max.z-bounds.min.z)/2+.22);
 return {minX:center.x-halfX,maxX:center.x+halfX,minZ:center.z-halfZ,maxZ:center.z+halfZ,y:.08};
}

export function projectConstructionFootprint(bounds,item,camera,viewport) {
 const scale=item.s||1,angle=item.rot||0,c=Math.cos(angle),s=Math.sin(angle);
 return [[bounds.minX,bounds.minZ],[bounds.maxX,bounds.minZ],[bounds.maxX,bounds.maxZ],[bounds.minX,bounds.maxZ]].map(([x,z])=>{
  const p=new T.Vector3(item.x+scale*(x*c+z*s),(item.y||0)+bounds.y*scale,item.z+scale*(-x*s+z*c)).project(camera);
  return {x:viewport.left+(p.x+1)*viewport.width/2,y:viewport.top+(1-p.y)*viewport.height/2,depth:p.z};
 });
}

export function acceptsConstructionDrop(point,polygon,viewport,padding=14) {
 if(point.x<viewport.left||point.x>viewport.left+viewport.width||point.y<viewport.top||point.y>viewport.top+viewport.height)return false;
 if(polygon.length!==4||polygon.some(p=>!Number.isFinite(p.x+p.y+p.depth)||Math.abs(p.depth)>1))return false;
 let positive=false,negative=false,nearest=Infinity,area=0;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b.x-a.x,dy=b.y-a.y;
  const cross=dx*(point.y-a.y)-dy*(point.x-a.x);
  positive ||= cross>0;negative ||= cross<0;area+=a.x*b.y-b.x*a.y;
  const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  nearest=Math.min(nearest,Math.hypot(point.x-a.x-t*dx,point.y-a.y-t*dy));
 }
 return Math.abs(area)>4&&(!(positive&&negative)||nearest<=padding);
}
