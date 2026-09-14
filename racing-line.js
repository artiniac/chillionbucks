import * as T from './vendor/three.module.js';
const wrap=t=>(t%1+1)%1;
const distance=(a,b,length)=>Math.min(wrap(a-b),wrap(b-a))*length;
// A teaching line: outside entry, inside apex, outside exit. It is not a lap-time optimizer.
export function teachingLine(curve,width=8){
 const length=curve.getLength(),count=Math.ceil(length/2),samples=[];
 for(let i=0;i<count;i++){const t=i/count,a=curve.getTangentAt(wrap(t-9/length)),b=curve.getTangentAt(wrap(t+9/length));samples.push(Math.atan2(a.z*b.x-a.x*b.z,a.x*b.x+a.z*b.z));}
 const candidates=[];for(let i=0;i<count;i++){const strength=Math.abs(samples[i]);if(strength>.24&&strength>=Math.abs(samples[(i+count-1)%count])&&strength>Math.abs(samples[(i+1)%count]))candidates.push({t:i/count,strength,sign:Math.sign(samples[i])});}
 const corners=[];for(const c of candidates.sort((a,b)=>b.strength-a.strength))if(corners.every(q=>distance(c.t,q.t,length)>48))corners.push(c);corners.sort((a,b)=>a.t-b.t);
 const offset=Math.max(.5,width/2-2.2),knots=[];
 corners.forEach((c,i)=>{const prev=corners[(i+corners.length-1)%corners.length],next=corners[(i+1)%corners.length];const span=Math.min(25,wrap(c.t-prev.t)*length*.28,wrap(next.t-c.t)*length*.28)||25;
 for(const [delta,side,phase] of [[-span,1,'entry'],[0,-1,'apex'],[span,1,'exit']])knots.push({t:wrap(c.t+delta/length),offset:c.sign*offset*side,phase,corner:i+1});});knots.sort((a,b)=>a.t-b.t);
 function at(t){t=wrap(t);if(!knots.length)return {offset:0,phase:'straight',corner:0};let i=knots.findIndex(k=>k.t>t);if(i<0)i=0;const a=knots[(i+knots.length-1)%knots.length],b=knots[i],f=wrap(t-a.t)/wrap(b.t-a.t),ease=(1-Math.cos(Math.PI*f))/2;return {offset:a.offset+(b.offset-a.offset)*ease,phase:f<.5?a.phase:b.phase,corner:f<.5?a.corner:b.corner};}
 function point(t){const p=curve.getPointAt(wrap(t)),d=curve.getTangentAt(wrap(t));return p.addScaledVector(new T.Vector3(-d.z,0,d.x).normalize(),at(t).offset);}
 function tangent(t){return point(t+.25/length).sub(point(t-.25/length)).normalize();}
 return {at,knots,corners,getPointAt:point,getTangentAt:tangent,getLength:()=>length};
}
