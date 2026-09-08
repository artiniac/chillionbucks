import * as T from './vendor/three.module.js';
export const WIDTH=8,MAX_POINTS=24;
export const PRESETS={
 meadow:{name:'Sunshine loop',icon:'🌼',points:[[-38,0,-22],[-10,0,-32],[26,0,-27],[43,0,-4],[30,0,24],[-6,0,30],[-38,0,19],[-46,0,0]]},
 coast:{name:'Seaside sweep',icon:'🌊',points:[[-48,0,-22],[-18,0,-38],[20,1,-32],[45,3,-14],[46,2,18],[19,0,30],[0,0,12],[-25,0,29],[-49,0,14]]},
 corkscrew:{name:'Corkscrew canyon',icon:'🏔️',points:[[-52,0,-30],[-18,0,-40],[27,1,-34],[54,4,-12],[44,9,20],[19,14,35],[-3,15,28],[-17,10,13],[-33,4,19],[-52,1,8]]}
};
export const copy=p=>p.map(a=>a.slice());
class TrackCurve extends T.CatmullRomCurve3 {getPoint(t,target=new T.Vector3()){const p=super.getPoint(t,target);p.y=Math.max(.32,p.y);return p;}}
export function curveFor(points){return new TrackCurve(points.map(p=>new T.Vector3(p[0],p[1]+.32,p[2])),true,'centripetal');}
export function validate(points){
 if(!Array.isArray(points)||points.length<4||points.length>MAX_POINTS)return 'Use 4 to 24 track pieces.';
 if(points.some(p=>!Array.isArray(p)||p.length!==3||p.some(n=>!Number.isFinite(n))||Math.abs(p[0])>100||Math.abs(p[2])>100||p[1]<0||p[1]>18))return 'Keep your track inside the building field.';
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],d=Math.hypot(a[0]-b[0],a[2]-b[2]);if(d<9)return 'Those pieces are too close. Try another spot.';if(Math.abs(a[1]-b[1])/d>.6)return 'That hill is too steep. Make the road longer first.';}
 const c=curveFor(points),samples=c.getSpacedPoints(180),length=c.getLength();
 for(let i=0;i<180;i++)for(let j=i+1;j<180;j++){if(Math.min(j-i,180-j+i)*length/180<17)continue;const a=samples[i],b=samples[j];if(Math.hypot(a.x-b.x,a.z-b.z)<WIDTH+1&&Math.abs(a.y-b.y)<5)return 'The roads would overlap. Try a different shape.';}
 return '';
}
export function editPoints(points,index,action){const p=copy(points),i=((index%p.length)+p.length)%p.length,a=p[i],b=p[(i+1)%p.length];
 if(action==='remove'){if(p.length<=4)return {error:'Keep at least four pieces to make a loop.'};p.splice(i,1);}
 else if(action==='hill')a[1]=Math.min(18,a[1]+3);
 else if(action==='lower')a[1]=Math.max(0,a[1]-3);
 else if(action==='widen'||action==='shrink'){const center=p.reduce((s,q)=>[s[0]+q[0]/p.length,s[1]+q[2]/p.length],[0,0]);const dx=a[0]-center[0],dz=a[2]-center[1],l=Math.hypot(dx,dz)||1,k=action==='widen'?8:-8;a[0]+=dx/l*k;a[2]+=dz/l*k;}
 else {if(p.length>=MAX_POINTS)return {error:'Your track has 24 pieces. Change one, or undo a piece.'};const dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),k=action==='left'?14:action==='right'?-14:0;p.splice(i+1,0,[(a[0]+b[0])/2-dz/l*k,(a[1]+b[1])/2,(a[2]+b[2])/2+dx/l*k]);}
 return {points:p,index:action==='remove'?Math.min(i,p.length-1):['straight','left','right'].includes(action)?i+1:i,error:validate(p)};
}
export function ribbon(curve,inner,outer,steps=600,lift=0){const pos=[],uv=[],idx=[];for(let i=0;i<=steps;i++){const t=i/steps,p=curve.getPointAt(t),d=curve.getTangentAt(t),n=new T.Vector3(-d.z,0,d.x).normalize();for(const w of [inner,outer]){pos.push(p.x+n.x*w,p.y+lift,p.z+n.z*w);uv.push(w,i/steps*curve.getLength()/4);}if(i<steps){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
