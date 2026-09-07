import * as T from './vendor/three.module.js';
export const WIDTH=1.65;
export const START_ROUTE=[[-6,-3],[0,-4.5],[6,-3],[7,1],[3,4.5],[-3,4.5],[-7,1]];
export const curveFor=points=>new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,.12,z)),true,'centripetal');
export function frame(curve,t){const p=curve.getPointAt(((t%1)+1)%1),v=curve.getTangentAt(((t%1)+1)%1).normalize();return {p,v,n:new T.Vector3(-v.z,0,v.x)};}
export function validateRoute(points){
 if(!Array.isArray(points)||points.length<4||points.length>18)return 'Use between 4 and 18 river bends.';
 if(points.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isFinite(v)||Math.abs(v)>10)))return 'Keep river bends inside the park.';
 for(let i=0;i<points.length;i++)if(Math.hypot(points[i][0]-points[(i+1)%points.length][0],points[i][1]-points[(i+1)%points.length][1])<2)return 'Give neighboring bends more space.';
 const c=curveFor(points),len=c.getLength();if(len<18)return 'Make a larger loop with room for the water.';
 const count=160,ps=Array.from({length:count},(_,i)=>c.getPointAt(i/count));
 for(let i=0;i<count;i++){
  if(Math.abs(ps[i].x)>10.8||Math.abs(ps[i].z)>10.8)return 'This bend goes outside the park.';
  for(let j=i+1;j<count;j++){
   const separation=Math.min(j-i,count-j+i)*len/count;
   if(separation>WIDTH*2.4&&ps[i].distanceTo(ps[j])<WIDTH+1)return 'Those channels are too close. Move the bend outward.';
  }
  const a=c.getTangentAt((i/count+.995)%1),b=c.getTangentAt((i/count+.005)%1);
  const angle=a.angleTo(b);if(angle>.65)return 'Round that tight bend so tubes can float through.';
 }
 return null;
}
export function ribbon(curve,halfWidth,yOffset=0,steps=240){const pos=[],uv=[],idx=[];for(let i=0;i<=steps;i++){const {p,n}=frame(curve,i/steps);for(const sign of [-1,1]){const v=p.clone().addScaledVector(n,sign*halfWidth);pos.push(v.x,v.y+yOffset,v.z);uv.push(i/steps*curve.getLength(),(sign+1)/2);}}for(let i=0;i<steps;i++){const j=i*2;idx.push(j,j+2,j+1,j+1,j+2,j+3);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
export function slideCurve(river,t,type){
 const {p,n,v}=frame(river,t),start=p.clone().addScaledVector(n,3.6);start.y=type==='spiral'?4.6:3.7;const pts=[];
 for(let i=0;i<=64;i++){
  const q=i/64;let point=start.clone().lerp(p,q);point.y=p.y+(start.y-p.y)*(1-q)**1.25;
  if(type==='wave')point.addScaledVector(v,Math.sin(q*Math.PI*2)*.65);
  if(type==='spiral'){
   if(q<=.8){const a=q/.8*Math.PI*2;point=p.clone().addScaledVector(n,2.1+Math.cos(a)*1.5).addScaledVector(v,Math.sin(a)*1.5);point.y=4.6-q/.8*3.5;}
   else{const k=(q-.8)/.2;point=p.clone().addScaledVector(n,3.6*(1-k));point.y=1.1+(p.y-1.1)*k;}
  }
  pts.push(point);
 }
 return new T.CatmullRomCurve3(pts,false,'centripetal');
}
