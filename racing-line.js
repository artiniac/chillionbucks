import * as T from './vendor/three.module.js';
const wrap=t=>(t%1+1)%1;
// Minimize integrated squared curvature within a car-width corridor. Neighboring
// corners share one closed trajectory, so a chicane is solved as a whole.
export function teachingLine(curve,width=8){
 const length=curve.getLength(),limit=Math.max(.5,width/2-1.7);
 const probes=Math.ceil(length/2),roadTurns=Array.from({length:probes},(_,i)=>{const a=curve.getTangentAt(wrap(i/probes-5/length)),b=curve.getTangentAt(wrap(i/probes+5/length));return Math.atan2(a.z*b.x-a.x*b.z,a.x*b.x+a.z*b.z);}),candidates=[];
 for(let i=0;i<probes;i++)if(Math.abs(roadTurns[i])>.32&&Math.abs(roadTurns[i])>=Math.abs(roadTurns[(i+probes-1)%probes])&&Math.abs(roadTurns[i])>Math.abs(roadTurns[(i+1)%probes]))candidates.push({t:i/probes,strength:Math.abs(roadTurns[i]),sign:Math.sign(roadTurns[i])});
 const corners=[];for(const c of candidates.sort((a,b)=>b.strength-a.strength))if(corners.every(q=>Math.min(wrap(c.t-q.t),wrap(q.t-c.t))*length>30))corners.push(c);corners.sort((a,b)=>a.t-b.t);
 let offsets=[];
 for(const spacing of [8,4,2]){
  const count=Math.ceil(length/spacing),old=offsets;
  offsets=Array.from({length:count},(_,i)=>{if(!old.length)return 0;const u=i/count*old.length,k=Math.floor(u);return old[k]*(1-u+k)+old[(k+1)%old.length]*(u-k);});
  const centers=Array.from({length:count},(_,i)=>curve.getPointAt(i/count)),normals=Array.from({length:count},(_,i)=>{const d=curve.getTangentAt(i/count);return new T.Vector3(-d.z,0,d.x).normalize();}),positions=centers.map((p,i)=>p.clone().addScaledVector(normals[i],offsets[i]));
  const pins=new Map(corners.map(c=>[Math.round(c.t*count)%count,-c.sign*limit*.88]));for(const [i,value] of pins){offsets[i]=value;positions[i].copy(centers[i]).addScaledVector(normals[i],value);}
  const index=i=>(i+count)%count;
  function bend(i){const a=positions[index(i-1)],b=positions[index(i)],c=positions[index(i+1)],ux=b.x-a.x,uz=b.z-a.z,vx=c.x-b.x,vz=c.z-b.z,ab=Math.hypot(ux,uz),bc=Math.hypot(vx,vz),ac=Math.hypot(c.x-a.x,c.z-a.z);const curvature=2*(ux*vz-uz*vx)/Math.max(.001,ab*bc*ac);return curvature*curvature*(ab+bc)/2;}
  function local(i,value){positions[i].copy(centers[i]).addScaledVector(normals[i],value);return bend(i-1)+bend(i)+bend(i+1);}
  for(let sweep=0;sweep<450;sweep++){let change=0;for(let j=0;j<count;j++){const i=sweep%2?count-j-1:j;if(pins.has(i))continue;const x=offsets[i],e=.06,f=local(i,x),plus=local(i,x+e),minus=local(i,x-e),gradient=(plus-minus)/(2*e),hessian=(plus+minus-2*f)/(e*e);let delta=hessian>1e-10?-gradient/hessian:-Math.sign(gradient)*.2;delta=Math.max(-.8,Math.min(.8,delta));let next=Math.max(-limit,Math.min(limit,x+delta)),cost=local(i,next);for(let back=0;cost>f&&back<7;back++){next=(next+x)/2;cost=local(i,next);}if(cost<=f){offsets[i]=next;change+=Math.abs(next-x);}else{local(i,x);}}
   if(change<count*.00002)break;
  }
 }
 const count=offsets.length;for(const c of corners)c.t=Math.round(c.t*count)%count/count;
 function offsetAt(t){const u=wrap(t)*count,i=Math.floor(u),f=u-i,a=offsets[(i+count-1)%count],b=offsets[i],c=offsets[(i+1)%count],d=offsets[(i+2)%count];return Math.max(-limit,Math.min(limit,b+.5*f*(c-a+f*(2*a-5*b+4*c-d+f*(3*(b-c)+d-a)))));}
 function point(t){const p=curve.getPointAt(wrap(t)),d=curve.getTangentAt(wrap(t));return p.addScaledVector(new T.Vector3(-d.z,0,d.x).normalize(),offsetAt(t));}
 function tangent(t){return point(t+.3/length).sub(point(t-.3/length)).normalize();}
 // Actual road apex constraints anchor the lesson. The remaining trajectory is
 // optimized jointly, rather than forcing an outside position between every bend.
 const knots=[];corners.forEach((c,i)=>{const previous=corners[(i+corners.length-1)%corners.length],next=corners[(i+1)%corners.length],span=Math.min(25,wrap(c.t-previous.t)*length*.35,wrap(next.t-c.t)*length*.35)||20;for(const [shift,phase] of [[-span,'entry'],[0,'apex'],[span,'exit']]){const t=wrap(c.t+shift/length);knots.push({t,phase,corner:i+1,offset:offsetAt(t)});}});knots.sort((a,b)=>a.t-b.t);
 function at(t){t=wrap(t);let phase='straight',corner=0,best=Infinity;for(const k of knots){const d=Math.min(wrap(t-k.t),wrap(k.t-t))*length;if(d<best){best=d;phase=k.phase;corner=k.corner;}}if(best>20)phase='straight';return {offset:offsetAt(t),phase,corner};}
 return {at,knots,corners,getPointAt:point,getTangentAt:tangent,getLength:()=>length};
}
