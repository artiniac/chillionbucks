export const W=420,H=740,R=9;
export const BUMPERS=[{x:130,y:215,r:29},{x:280,y:215,r:29},{x:205,y:325,r:32}];
export const TARGETS=Array.from({length:6},(_,i)=>({x:i<3?64:332,y:300+(i%3)*45,r:12}));
export const WALLS=[[26,140,45,70],[45,70,105,35],[105,35,320,35],[320,35,390,75],[390,75,398,160],[26,140,26,570],[26,570,110,636],[398,160,398,720],[371,170,371,570],[371,570,310,636],[55,472,105,540],[105,540,65,570],[355,472,315,540],[315,540,355,570]];
export function newGame(little=true){return {little,ball:{x:385,y:685,vx:0,vy:0},ready:true,over:false,score:0,balls:3,hits:0,saveTime:0,stuck:0,combo:0,lastScore:-10,gold:0,targets:Array(6).fill(false),targetTouch:Array(6).fill(false),jamX:385,jamY:685,jamTime:0,targetCool:0,spinnerCool:0,nudgeCool:0,flips:[.35,Math.PI-.35],cool:[0,0,0],events:[],time:0};}
export function launch(g){if(g.over||!g.ready)return false;g.ready=false;Object.assign(g.ball,{x:385,y:685,vx:-8,vy:-970});g.saveTime=7;g.jamX=385;g.jamY=685;g.jamTime=0;g.targetTouch.fill(false);g.events.push({type:'launch'});return true;}
export function award(g,value,type,extra={}){g.combo=g.time-g.lastScore<2.5?Math.min(5,g.combo+1):1;g.lastScore=g.time;const points=value*g.combo*(g.gold>0?3:1);g.score+=points;g.events.push({type,points,...extra});}
export function nudge(g){if(g.ready||g.over||g.nudgeCool>0)return false;g.nudgeCool=3;g.ball.vy-=180;g.ball.vx+=g.ball.x<205?85:-85;g.events.push({type:'nudge'});return true;}
export function segmentContact(b,x1,y1,x2,y2,r=R){const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/(dx*dx+dy*dy))),px=x1+t*dx,py=y1+t*dy,dist=Math.hypot(b.x-px,b.y-py);if(dist>=r)return null;return {nx:dist?(b.x-px)/dist:0,ny:dist?(b.y-py)/dist:-1,depth:r-dist,t};}
export function step(g,dt,input={}){
 if(g.over)return;g.time+=dt;for(const k of ['gold','targetCool','spinnerCool','nudgeCool'])g[k]=Math.max(0,g[k]-dt);if(g.time-g.lastScore>2.5)g.combo=0;g.saveTime=Math.max(0,g.saveTime-dt);g.cool=g.cool.map(v=>Math.max(0,v-dt));const b=g.ball;
 for(let i=0;i<2;i++){
  const auto=g.little&&!g.ready&&b.y>515&&b.y<690&&Math.sin(g.time*14)>-.6&&(i===0?b.x<232:b.x>188);
  const pressed=!!(i?input.right:input.left)||auto,target=i?(pressed?Math.PI+.48:Math.PI-.35):(pressed?-.48:.35),old=g.flips[i],delta=Math.max(-dt*15,Math.min(dt*15,target-old));g.flips[i]+=delta;
  if(g.ready)continue;
  const x=i?308:112,y=636,ex=x+Math.cos(g.flips[i])*83,ey=y+Math.sin(g.flips[i])*83,c=segmentContact(b,x,y,ex,ey,R+8);
  if(c){b.x+=c.nx*c.depth;b.y+=c.ny*c.depth;const along=(b.vx*c.nx+b.vy*c.ny);if(along<0){b.vx-=1.65*along*c.nx;b.vy-=1.65*along*c.ny;}if(pressed&&delta!==0&&b.y<665){b.vy=-560-220*c.t;b.vx+=(i?-1:1)*95;}}
 }
 if(g.ready)return;
 b.vy+=610*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
 // A one-way launch gate feeds the upper playfield.
 if(b.x>365&&b.y<170&&b.vy<0){b.vx=-245;b.vy=Math.min(b.vy,-420);}
 for(const [wi,wall] of WALLS.entries()){const c=segmentContact(b,...wall);if(!c)continue;b.x+=c.nx*c.depth;b.y+=c.ny*c.depth;const v=b.vx*c.nx+b.vy*c.ny;if(v<0){b.vx-=1.78*v*c.nx;b.vy-=1.78*v*c.ny;if(wi>=10&&g.spinnerCool===0){b.vx+=b.x<205?170:-170;b.vy-=180;g.spinnerCool=.12;g.events.push({type:'sling',index:b.x<205?0:1});}}}
 // Upper side kickers keep slow balls moving back toward the coin bumpers.
 for(let i=0;i<BUMPERS.length;i++){const p=BUMPERS[i],dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy),r=p.r+R;if(d<r){const nx=d?dx/d:0,ny=d?dy/d:1;b.x=p.x+nx*(r+.1);b.y=p.y+ny*(r+.1);b.vx=nx*430;b.vy=ny*430;if(!g.cool[i]){g.cool[i]=.15;g.hits++;award(g,100,'bumper',{index:i,x:p.x,y:p.y});if(g.hits%10===0){award(g,1000,'bonus');}}}}
 for(let i=0;i<TARGETS.length;i++){const p=TARGETS[i],dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d>p.r+R+5)g.targetTouch[i]=false;if(d<p.r+R){const nx=d?dx/d:1,ny=d?dy/d:0;b.x=p.x+nx*(p.r+R+.1);b.y=p.y+ny*(p.r+R+.1);b.vx=nx*330;b.vy=ny*330-90;if(g.targetCool===0&&!g.targetTouch[i]){g.targetTouch[i]=true;g.targetCool=.15;g.targets[i]=true;award(g,250,'target',{index:i,x:p.x,y:p.y});if(g.targets.every(Boolean)){g.gold=20;g.targets.fill(false);award(g,1500,'gold');}}}}
 const spinner=segmentContact(b,173,145,237,145,R+3);if(spinner&&g.spinnerCool===0){g.spinnerCool=.3;award(g,75,'spinner',{x:205,y:145});}
 const speed=Math.hypot(b.vx,b.vy);if(speed>1100){b.vx*=1100/speed;b.vy*=1100/speed;}
 if(Math.hypot(b.x-g.jamX,b.y-g.jamY)>28){g.jamX=b.x;g.jamY=b.y;g.jamTime=0;}else g.jamTime+=dt;
 g.stuck=speed<18?g.stuck+dt:0;if(g.stuck>2||g.jamTime>1.5){b.x=Math.max(90,Math.min(320,b.x));b.y=Math.max(90,b.y-35);g.jamX=b.x;g.jamY=b.y;g.jamTime=0;g.targetTouch.fill(false);b.vx=b.x<205?180:-180;b.vy=-480;g.stuck=0;g.events.push({type:'unstick'});}
 if(b.y>H+20){if(g.little||g.saveTime>0){g.events.push({type:'save'});g.ready=true;launch(g);}else{g.balls--;g.ready=true;if(g.balls===0){g.over=true;g.events.push({type:'over'});}else g.events.push({type:'drain'});}}
}
