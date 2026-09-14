// Metres, seconds, and m/s. Assisted steering with a distance-based braking plan.
const wrap=(i,n)=>(i%n+n)%n;
export function cornerSpeed(curvature,grip=8.8){return Math.sqrt(grip/Math.max(1e-6,Math.abs(curvature)));}
export function makeSpeedPlan(path,parameterLength,maximum,{grip=8.8,braking=5.4,count=1024}={}){
 const p=Array.from({length:count},(_,i)=>path.getPointAt(i/count));
 const distance=p.map((v,i)=>Math.hypot(v.x-p[(i+1)%count].x,v.z-p[(i+1)%count].z));
 const curvature=p.map((b,i)=>{const a=p[wrap(i-3,count)],c=p[(i+3)%count],ab=Math.hypot(b.x-a.x,b.z-a.z),bc=Math.hypot(c.x-b.x,c.z-b.z),ac=Math.hypot(c.x-a.x,c.z-a.z);return 2*Math.abs((b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x))/Math.max(1e-8,ab*bc*ac);});
 const speeds=curvature.map(k=>Math.min(maximum,cornerSpeed(k,grip)));
 // Several circuits propagate braking across the start/finish seam.
 for(let pass=0;pass<3;pass++)for(let i=count-1;i>=0;i--)speeds[i]=Math.min(speeds[i],Math.sqrt(speeds[(i+1)%count]**2+2*braking*distance[i]));
 return {at(t){const f=wrap(t,1)*count,i=Math.floor(f),j=(i+1)%count,a=f-i;return {limit:speeds[i]*(1-a)+speeds[j]*a,curvature:curvature[i]*(1-a)+curvature[j]*a,parameterScale:parameterLength/count/Math.max(.001,distance[i])};}};
}
export function motionStep(speed,target,dt,{curvature=0,grip=9.81}={}){
 const lateral=speed*speed*Math.abs(curvature),available=Math.sqrt(Math.max(0,grip*grip-Math.min(grip*.98,lateral)**2));
 const resistance=.14+.0018*speed*speed;
 const desired=(target-speed)*2.8;
 const acceleration=Math.max(-Math.min(6.2,available),Math.min(Math.min(4.3,70/Math.max(8,speed),available)-resistance,desired));
 const next=Math.max(0,speed+acceleration*dt);
 return {speed:next,distance:(speed+next)*.5*dt,acceleration,throttle:Math.max(0,Math.min(1,(acceleration+resistance)/4.3)),braking:Math.max(0,-acceleration/6.2)};
}
