import * as T from './vendor/three.module.js';
export const GARAGE_BAYS=Array.from({length:8},(_,i)=>({id:'garage:'+i,x:-112+i*5,z:-105}));
export function nextGarageBay(items){return GARAGE_BAYS.find(b=>!items.some(it=>Math.abs(it.x-b.x)<2.4&&Math.abs(it.z-b.z)<3.3));}
export function garageScene(){
 const g=new T.Group(),materials=new Map();
 function box(c,x,y,z,w,h,d){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.65,metalness:c==='#33464a'?.4:.08}));const m=new T.Mesh(new T.BoxGeometry(w,h,d),materials.get(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;g.add(m);}
 box('#88928e',-94.5,-.012,-105,43,.14,8.5);
 box('#485859',-94.5,.068,-105,42,.025,7.8);
 for(const b of GARAGE_BAYS){
  for(const x of [-1.8,1.8])box('#ebd28a',b.x+x,.088,b.z,.06,.01,6.5);
  box('#ebd28a',b.x,.088,b.z-3.25,3.65,.01,.06);
  for(const x of [-.65,.65])box('#617d75',b.x+x,.11,b.z,.24,.05,3.3);
  box('#33464a',b.x,.75,b.z-3.65,2.0,1.4,.45);
  box('#b5c5bd',b.x,1.46,b.z-3.65,2.14,.07,.55);
  for(let i=0;i<4;i++){box('#758b85',b.x,.3+i*.26,b.z-3.40,1.84,.20,.025);box('#c0c9bb',b.x,.32+i*.26,b.z-3.37,.8,.02,.035);}
 }
 return g;
}
