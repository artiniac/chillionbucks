import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {loadFamilyHead} from './family-avatar.js?v=2';
import {HALF,LOOP_SHIFT,loopPoint} from './coinrun-level.js?v=1';

// Original Coin Run artwork: runners, coins, springs, arrows, logs, star posts,
// the loop, the piggy-bank goal, and the Sunny Hills islands.
const TAU=Math.PI*2,materials=new Map();
export function mat(color,o={}){const key=color+JSON.stringify(o);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.6,...o}));return materials.get(key);}
function part(parent,geometry,material,x=0,y=0,z=0,{rx=0,ry=0,rz=0,shadow=true}={}){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;}
function canvasTexture(w,h,draw,repeat=false){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;if(repeat)t.wrapS=t.wrapT=T.RepeatWrapping;return t;}

export const RUNNERS={
 leo:{name:'Leo',icon:'👦',head:'leo',shirt:'#3fb36b',shorts:'#24476b',shoes:'#f7f4ea',sole:'#e0483e',skin:'#e7b48f'},
 dad:{name:'Dad',icon:'👨',head:'artin',adult:true,shirt:'#1f7a74',shorts:'#c9b48a',shoes:'#2c3e50',sole:'#f7f4ea',skin:'#d9a27c'},
 buddy:{name:'Buddy',icon:'🧢',head:null,shirt:'#f3c623',shorts:'#2f6e4f',shoes:'#ffffff',sole:'#3867d6',skin:'#c68a5e',cap:'#43a047'}
};

// A rounded cartoon body. Leo and Dad wear their own photo-reconstructed heads;
// Buddy is an original character with a cap.
export function makeRunner(id){
 const def=RUNNERS[id]||RUNNERS.leo,adult=!!def.adult,root=new T.Group(),body=new T.Group();root.add(body);root.name=def.name+' runner';
 const k=adult?1.45:1,skin=mat(def.skin,{roughness:.7}),shirt=mat(def.shirt,{roughness:.8}),shorts=mat(def.shorts,{roughness:.85}),shoe=mat(def.shoes,{roughness:.5}),sole=mat(def.sole);
 const hip=.46*k,legLen=.36*k,torso=.22*k,shoulder=hip+.48*k;
 const legs=[-1,1].map(side=>{const g=new T.Group();g.position.set(side*.1*k,hip,0);body.add(g);
  part(g,new T.CapsuleGeometry(.07*k,legLen-.14*k,4,10),skin,0,-legLen/2,0);
  part(g,new T.CapsuleGeometry(.09*k,.08*k,4,10),shorts,0,-.06*k,0);
  const foot=new T.Group();foot.position.set(0,-legLen-.02*k,.03*k);g.add(foot);part(foot,new T.BoxGeometry(.13*k,.08*k,.24*k),shoe,0,0,.03*k);part(foot,new T.BoxGeometry(.14*k,.03*k,.25*k),sole,0,-.045*k,.03*k);return g;});
 part(body,new T.CylinderGeometry(.19*k,.2*k,.16*k,16),shorts,0,hip+.02*k,0);
 const chest=part(body,new T.CapsuleGeometry(.2*k,torso,6,16),shirt,0,hip+.26*k,0);chest.scale.set(1,1,.82);
 part(body,new T.CylinderGeometry(.075*k,.075*k,.02,20),mat('#ffd23f',{metalness:.3,roughness:.35,emissive:'#b07d00',emissiveIntensity:.6}),0,hip+.3*k,.168*k,{rx:Math.PI/2});
 const arms=[-1,1].map(side=>{const g=new T.Group();g.position.set(side*.25*k,shoulder,0);body.add(g);
  part(g,new T.CapsuleGeometry(.075*k,.06*k,4,10),shirt,0,-.04*k,0);part(g,new T.CapsuleGeometry(.055*k,.2*k,4,10),skin,0,-.19*k,0);part(g,new T.SphereGeometry(.065*k,12,10),skin,0,-.34*k,0);return g;});
 part(body,new T.CylinderGeometry(.07*k,.075*k,.1*k,12),skin,0,shoulder+.06*k,0);
 const head=new T.Group();head.position.set(0,shoulder+(adult?.3:.34)*k/(adult?1.2:1),.01);body.add(head);
 // Placeholder face while a photo head downloads, and the look for Buddy.
 const face=new T.Group();head.add(face);part(face,new T.SphereGeometry(adult?.19:.23,24,18),skin);
 const ink=mat('#1d2430'),white=mat('#ffffff');
 for(const side of [-1,1]){part(face,new T.SphereGeometry(.04,10,8),white,side*.075,.03,.19,{shadow:false});part(face,new T.SphereGeometry(.024,8,6),ink,side*.075,.03,.225,{shadow:false});}
 part(face,new T.TorusGeometry(.06,.013,6,12,Math.PI),ink,0,-.06,.2,{rz:Math.PI,shadow:false});
 if(def.cap){const cap=mat(def.cap,{roughness:.5});part(face,new T.SphereGeometry(.245,24,12,0,TAU,0,Math.PI*.5),cap,0,.02,0,{rx:-.2});part(face,new T.BoxGeometry(.3,.03,.2),cap,0,.08,.21,{rx:-.12});}
 const bubble=part(root,new T.SphereGeometry(adult?1.4:1.05,24,16),new T.MeshStandardMaterial({color:'#bfefff',transparent:true,opacity:.35,roughness:.05,metalness:.1,depthWrite:false}),0,adult?1.1:.75,0,{shadow:false});bubble.visible=false;
 const rig={root,body,legs,arms,head,bubble,def,height:adult?2.1:1.4,ready:Promise.resolve(),phase:0};
 if(def.head){rig.ready=loadFamilyHead(def.head==='leo').then(model=>{if(adult)model.scale.setScalar(1.15);model.position.y+=adult?.02:.03;head.add(model);face.visible=false;}).catch(()=>{});}
 rig.animate=({speed=0,onGround=true,vy=0,mode='run'},dt,time,reduced=false)=>{
  const run=mode==='run'||mode==='loop';rig.phase+=(run&&onGround?speed:0)*dt*.95;const p=rig.phase,s=Math.sin(p);
  bubble.visible=mode==='respawn';if(bubble.visible&&!reduced){bubble.scale.setScalar(1+.04*Math.sin(time*6));}
  if(mode==='finish'||mode==='ready'){const wave=mode==='finish'?Math.sin(time*8)*.4:0;legs.forEach(l=>l.rotation.x*=.85);arms[0].rotation.set(0,0,mode==='finish'?2.6+wave:.1);arms[1].rotation.set(mode==='finish'?0:0,0,mode==='finish'?-.3:-.1);body.position.y=Math.sin(time*2)*.01;body.rotation.x=0;return;}
  if(!onGround&&mode!=='loop'){legs[0].rotation.x=-.9;legs[1].rotation.x=.4;arms.forEach((a,i)=>a.rotation.set(-2.7,0,(i?-1:1)*.25));body.position.y=0;body.rotation.x=vy>0?-.05:.1;return;}
  legs[0].rotation.x=s*.95;legs[1].rotation.x=-s*.95;arms[0].rotation.set(-s*.9,0,.08);arms[1].rotation.set(s*.9,0,-.08);
  body.position.y=reduced?0:Math.abs(Math.cos(p))*.05*(adult?1.3:1);body.rotation.x=.14;head.rotation.y=reduced?0:Math.sin(p*.5)*.05;
 };
 root.traverse(o=>{if(o.isMesh&&o!==bubble)o.castShadow=true;});
 return rig;
}

export function coinTexture(){return canvasTexture(128,128,(x)=>{x.fillStyle='#f5c542';x.fillRect(0,0,128,128);x.strokeStyle='#c9941d';x.lineWidth=10;x.beginPath();x.arc(64,64,50,0,TAU);x.stroke();x.fillStyle='#b98313';x.font='bold 62px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('c.',66,60);});}
export function makeCoins(count){
 const geometry=new T.CylinderGeometry(.45,.45,.1,24).rotateX(Math.PI/2),face=coinTexture();
 // Coins glow a little so they read as gold from far away and in shade.
 const faceMat=new T.MeshStandardMaterial({map:face,emissiveMap:face,emissive:'#ffffff',emissiveIntensity:.45,metalness:.35,roughness:.4});
 const mesh=new T.InstancedMesh(geometry,[mat('#ffcf3f',{metalness:.5,roughness:.3,emissive:'#b07d00',emissiveIntensity:.55}),faceMat,faceMat],Math.max(1,count));
 mesh.frustumCulled=false;mesh.castShadow=true;return mesh;
}

function arrowTexture(){return canvasTexture(64,128,(x)=>{const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#ff9a1f');g.addColorStop(1,'#ffcf3d');x.fillStyle=g;x.fillRect(0,0,64,128);x.fillStyle='#fffbe6';for(const y of [14,78]){x.beginPath();x.moveTo(6,y);x.lineTo(32,y+30);x.lineTo(58,y);x.lineTo(58,y+14);x.lineTo(32,y+44);x.lineTo(6,y+14);x.closePath();x.fill();}},true);}
function earthTexture(){return canvasTexture(64,256,(x,w,h)=>{const bands=['#e5b16a','#c98a4b','#a8693a','#d99e58','#8e5a33','#b8794a'];let y=0,i=0;while(y<h){const band=14+((i*37)%18);x.fillStyle=bands[i%bands.length];x.fillRect(0,y,w,band);y+=band;i++;}x.fillStyle='#4fae4a';x.fillRect(0,0,w,10);x.fillStyle='#3d9440';for(let k=0;k<w;k+=8)x.fillRect(k,8,5,6+(k*7)%6);},true);}
function starShape(outer=.55,inner=.24){const s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?inner:outer;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();return s;}

// A flat strip following the path between two distances.
function strip(level,from,to,inner,outer,lift=0,step=1){
 const pos=[],uv=[],idx=[],n=Math.max(2,Math.ceil((to-from)/step));let row=0;
 for(let i=0;i<=n;i++){const s=from+(to-from)*i/n,f=level.frame(s);for(const w of [inner,outer]){pos.push(f.p[0]+f.n[0]*w,f.p[1]+lift,f.p[2]+f.n[2]*w);uv.push((w-inner)/(outer-inner),s/4);}if(i<n){const a=row*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}row++;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
// A wall hanging down from one path edge to the water.
function wall(level,from,to,side,bottom=-7){
 const pos=[],uv=[],idx=[],n=Math.max(2,Math.ceil(to-from));
 for(let i=0;i<=n;i++){const s=from+(to-from)*i/n,f=level.frame(s),x=f.p[0]+f.n[0]*side,z=f.p[2]+f.n[2]*side;pos.push(x,f.p[1]+.02,z,x,bottom,z);uv.push(s/6,1,s/6,(bottom-f.p[1])/8);if(i<n){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function placeOn(level,group,s,x,lift=0){const f=level.frame(s);group.position.set(f.p[0]+f.n[0]*x,f.p[1]+lift,f.p[2]+f.n[2]*x);group.rotation.set(0,Math.atan2(f.t[0],f.t[2]),0);return group;}

export function buildWorld(scene,level){
 const world=new T.Group(),anim={pads:[],springs:[],posts:[]};scene.add(world);
 // Ground pieces between the gaps, with earth walls and end caps.
 const solid=[];let start=0;for(const g of [...level.gaps].sort((a,b)=>a.from-b.from)){solid.push([start,g.from]);start=g.to;}solid.push([start,level.length]);
 const grass=mat('#6cc24a',{roughness:.9}),lawn=mat('#7fd35a',{roughness:.9}),lip=mat('#4fa53c',{roughness:.9}),earth=new T.MeshStandardMaterial({map:earthTexture(),roughness:.95,side:T.DoubleSide});
 for(const [a,b] of solid){
  part(world,strip(level,a,b,-HALF,HALF),grass,0,0,0,{shadow:false}).receiveShadow=true;
  part(world,strip(level,a,b,-1.2,1.2,.012),lawn,0,0,0,{shadow:false}).receiveShadow=true;
  for(const [i,o] of [[-HALF-.5,-HALF],[HALF,HALF+.5]])part(world,strip(level,a,b,i,o,.06),lip,0,0,0,{shadow:false});
  for(const side of [-HALF-.5,HALF+.5])part(world,wall(level,a,b,side),earth,0,0,0,{shadow:false});
  for(const s of [a,b]){if(s<=0||s>=level.length)continue;const f=level.frame(s),cap=new T.Mesh(new T.PlaneGeometry(HALF*2+1,f.p[1]+7),earth);placeOn(level,cap,s,0,(f.p[1]+7)/2-f.p[1]-7+f.p[1]);cap.position.y=(f.p[1]-7)/2;world.add(cap);}
 }
 // Water and sky.
 const ripple=canvasTexture(128,128,(x)=>{x.fillStyle='#36b6de';x.fillRect(0,0,128,128);for(let i=0;i<260;i++){x.fillStyle=`rgba(255,255,255,${.05+Math.random()*.12})`;x.fillRect(Math.random()*128,Math.random()*128,2+Math.random()*10,1.5);}},true);ripple.repeat.set(60,60);
 const water=part(world,new T.PlaneGeometry(1600,1600),new T.MeshStandardMaterial({map:ripple,roughness:.25,metalness:.15,color:'#bfeaff'}),level.frame(level.length/2).p[0],-6,level.frame(level.length/2).p[2],{rx:-Math.PI/2,shadow:false});water.receiveShadow=false;
 const skyGeo=new T.SphereGeometry(900,32,16),colors=[],top=new T.Color('#4aa8ee'),horizon=new T.Color('#dff4ff');for(let i=0;i<skyGeo.attributes.position.count;i++){const y=skyGeo.attributes.position.getY(i)/900,c=horizon.clone().lerp(top,Math.max(0,y)**.6);colors.push(c.r,c.g,c.b);}skyGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 const sky=new T.Mesh(skyGeo,new T.MeshBasicMaterial({vertexColors:true,side:T.BackSide,fog:false,depthWrite:false}));world.add(sky);anim.sky=sky;
 // Islands with palms and bushes, kept clear of the path.
 const samples=[];for(let s=0;s<=level.length;s+=6)samples.push(level.frame(s).p.slice());
 const clear=(x,z,r)=>samples.every(p=>Math.hypot(p[0]-x,p[2]-z)>r+HALF+6);
 let seed=11;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const dome=new T.SphereGeometry(1,24,12,0,TAU,0,Math.PI/2),islandMat=mat('#63b845',{roughness:.95}),sand=mat('#f1d99b',{roughness:.95});
 const palms=[],bushes=[],beaches=[],isles=[],center=level.frame(level.length/2).p;
 for(let i=0;i<900&&palms.length<70;i++){const x=center[0]+(rand()-.5)*520,z=center[2]+(rand()-.5)*1100,r=8+rand()*22;if(!clear(x,z,r))continue;const h=3+rand()*9;
  beaches.push(dome.clone().scale(r*1.12,h*.55,r*1.12).translate(x,-6.2,z));isles.push(dome.clone().scale(r,h,r).translate(x,-6,z));
  for(let j=0;j<2+Math.floor(rand()*3);j++){const a=rand()*TAU,d=rand()*r*.55,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=-6+h*Math.sqrt(Math.max(0,1-(d/r)**2));palms.push([px,py,pz,.8+rand()*.6,rand()*TAU]);}
  for(let j=0;j<3;j++){const a=rand()*TAU,d=r*(.3+rand()*.5),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=-6+h*Math.sqrt(Math.max(0,1-(d/r)**2));bushes.push([px,py,pz,.8+rand()]);}
 }
 // Islands, beaches, and clouds are merged so the whole backdrop costs a few draw calls.
 if(isles.length){part(world,mergeGeometries(beaches),sand,0,0,0,{shadow:false});part(world,mergeGeometries(isles),islandMat,0,0,0,{shadow:false}).receiveShadow=true;}
 const trunk=mergeGeometries(Array.from({length:6},(_,i)=>new T.CylinderGeometry(.22-.02*i,.25-.02*i,1.2,8).translate(Math.sin(i*.4)*.25*i*.3,.6+i*1.15,0))),leaves=mergeGeometries(Array.from({length:7},(_,i)=>new T.ConeGeometry(.55,3.6,5).rotateZ(Math.PI/2.4).translate(1.5,0,0).rotateY(i/7*TAU).translate(.35,7.1,0)));
 const trunks=new T.InstancedMesh(trunk,mat('#9a6b3f',{roughness:.9}),palms.length),fronds=new T.InstancedMesh(leaves,mat('#2f9a44',{roughness:.8}),palms.length),m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),sc=new T.Vector3();
 palms.forEach(([x,y,z,s,r],i)=>{m.compose(v.set(x,y,z),q.setFromEuler(e.set(0,r,0)),sc.setScalar(s));trunks.setMatrixAt(i,m);fronds.setMatrixAt(i,m);});trunks.castShadow=fronds.castShadow=true;world.add(trunks,fronds);
 const bushMesh=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),mat('#3fa34a',{roughness:.9,flatShading:true}),bushes.length);bushes.forEach(([x,y,z,s],i)=>{m.compose(v.set(x,y+s*.5,z),q.identity(),sc.set(s*1.3,s,s*1.3));bushMesh.setMatrixAt(i,m);});world.add(bushMesh);
 const mountain=mat('#8fb6c9',{roughness:1,flatShading:true});for(let i=0;i<14;i++){const a=i/14*TAU,d=560+rand()*120,c=part(world,new T.ConeGeometry(70+rand()*60,90+rand()*80,7),mountain,center[0]+Math.cos(a)*d,20,center[2]+Math.sin(a)*d,{shadow:false});c.scale.y=.8+rand()*.5;}
 const puffs=[];for(let i=0;i<16;i++){const cx=center[0]+(rand()-.5)*700,cy=55+rand()*40,cz=center[2]+(rand()-.5)*1200;for(let j=0;j<5;j++)puffs.push(new T.SphereGeometry(6+rand()*6,12,8).translate(cx+(j-2)*7,cy+rand()*3,cz+rand()*6));}
 part(world,mergeGeometries(puffs),mat('#ffffff',{roughness:1,emissive:'#ffffff',emissiveIntensity:.35}),0,0,0,{shadow:false});
 // Path features.
 const arrows=arrowTexture(),padMat=new T.MeshBasicMaterial({map:arrows,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,toneMapped:false,side:T.DoubleSide});anim.arrows=arrows;
 for(const d of level.dashes){const g=placeOn(level,new T.Group(),d.s,d.x,.04);const p=new T.Mesh(new T.PlaneGeometry(d.half*2,4).rotateX(-Math.PI/2),padMat);p.renderOrder=2;g.add(p);world.add(g);}
 const red=mat('#e5483e',{roughness:.4}),yellow=mat('#ffd23f',{roughness:.35}),steel=mat('#b9c4cc',{metalness:.8,roughness:.3});
 for(const sp of level.springs){const g=placeOn(level,new T.Group(),sp.s,sp.x);world.add(g);const w=Math.min(sp.half,HALF)*2;part(g,new T.BoxGeometry(w,.14,1.6),red,0,.07,0);for(let i=0;i<3;i++)for(const x of [-w/3,0,w/3])part(g,new T.TorusGeometry(.28,.06,6,14),steel,x,.22+i*.14,0,{rx:Math.PI/2});const pad=part(g,new T.BoxGeometry(w,.14,1.5),yellow,0,.62,0);anim.springs.push({g,pad,s:sp.s,t:9});}
 const bark=mat('#8a5a33',{roughness:.95}),ring=mat('#d8b27a',{roughness:.9}),capRed=mat('#e0483e',{roughness:.6}),dots=mat('#fff8ec');
 for(const log of level.logs){const g=placeOn(level,new T.Group(),log.s,log.x);world.add(g);part(g,new T.CylinderGeometry(.36,.36,log.half*2,14),bark,0,.36,0,{rz:Math.PI/2});for(const x of [-log.half,log.half]){part(g,new T.CircleGeometry(.36,14),ring,x+Math.sign(x)*.002,.36,0,{ry:Math.sign(x)*Math.PI/2,shadow:false});const shroom=new T.Group();shroom.position.set(x+Math.sign(x)*.4,0,.3);g.add(shroom);part(shroom,new T.CylinderGeometry(.08,.1,.3,8),dots,0,.15,0);part(shroom,new T.SphereGeometry(.2,12,8,0,TAU,0,Math.PI/2),capRed,0,.28,0);}}
 const starGeo=new T.ExtrudeGeometry(starShape(),{depth:.12,bevelEnabled:false}).translate(0,0,-.06),pole=mat('#e9eef2',{metalness:.3,roughness:.4});
 for(const [i,s] of level.checkpoints.entries()){if(i===0)continue;const g=placeOn(level,new T.Group(),s,HALF+.25);world.add(g);part(g,new T.CylinderGeometry(.07,.07,2.6,10),pole,0,1.3,0);const star=part(g,starGeo,new T.MeshStandardMaterial({color:'#9fb4c4',emissive:'#000000',roughness:.4}),0,2.9,0);anim.posts.push({s,star,lit:false});}
 // The loop: a ribbon around a vertical circle with golden rails.
 for(const loop of level.loops){
  const pos=[],idx=[],n=120,q=[0,0,0],f=level.frame(loop.s),rails=[[],[]];
  for(let i=0;i<=n;i++){const th=i/n*TAU;loopPoint(level,loop,th,q);for(const w of [-1.7,1.7]){pos.push(q[0]+f.n[0]*w,q[1],q[2]+f.n[2]*w);rails[w<0?0:1].push(new T.Vector3(q[0]+f.n[0]*w*1.02,q[1],q[2]+f.n[2]*w*1.02).addScaledVector(new T.Vector3(Math.sin(th)*f.t[0],-Math.cos(th),Math.sin(th)*f.t[2]),-.12));}if(i<n){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();part(world,g,new T.MeshStandardMaterial({color:'#5fbe4c',roughness:.8,side:T.DoubleSide}),0,0,0,{shadow:false});
  for(const r of rails)part(world,new T.TubeGeometry(new T.CatmullRomCurve3(r),160,.09,6,false),mat('#ffd23f',{metalness:.5,roughness:.3}),0,0,0,{shadow:false});
 }
 // Finish arch and the piggy bank that swallows the coins.
 const arch=placeOn(level,new T.Group(),level.finish,0);world.add(arch);for(const x of [-HALF-.3,HALF+.3])part(arch,new T.CylinderGeometry(.18,.18,5,12),pole,x,2.5,0);
 const banner=canvasTexture(512,96,(x,w,h)=>{for(let i=0;i<16;i++){x.fillStyle=i%2?'#ffffff':'#1d2430';x.fillRect(i*w/16,0,w/16,h/2);x.fillStyle=i%2?'#1d2430':'#ffffff';x.fillRect(i*w/16,h/2,w/16,h/2);}});
 part(arch,new T.BoxGeometry(HALF*2+.8,.9,.12),new T.MeshStandardMaterial({map:banner}),0,4.8,0);
 const pig=placeOn(level,new T.Group(),level.goal,0);world.add(pig);const pink=mat('#f59fb3',{roughness:.45}),dark=mat('#7a3c4b');
 const belly=part(pig,new T.SphereGeometry(1.4,32,24),pink,0,1.9,0);belly.scale.set(1.05,.95,1.25);
 part(pig,new T.CylinderGeometry(.5,.55,.45,24),mat('#f3869f',{roughness:.45}),0,1.9,-1.85,{rx:Math.PI/2});for(const x of [-.17,.17])part(pig,new T.CylinderGeometry(.09,.09,.05,12),dark,x,1.9,-2.09,{rx:Math.PI/2,shadow:false});
 for(const x of [-.55,.55]){part(pig,new T.ConeGeometry(.35,.6,4),pink,x,3.2,-.55,{rz:x>0?-.3:.3});part(pig,new T.SphereGeometry(.12,12,8),mat('#1d2430'),x*.7,2.45,-1.5,{shadow:false});}
 for(const [x,z] of [[-.7,.7],[.7,.7],[-.7,-.7],[.7,-.7]])part(pig,new T.CylinderGeometry(.28,.3,.8,14),pink,x,.4,z);
 part(pig,new T.BoxGeometry(.9,.08,.2),dark,0,3.22,0,{shadow:false});part(pig,new T.TorusGeometry(.2,.06,8,16,Math.PI*1.5),pink,0,2.2,1.75,{ry:Math.PI/2});
 anim.pig=pig;anim.slot=new T.Vector3();pig.updateMatrixWorld(true);pig.localToWorld(anim.slot.set(0,3.25,0));
 world.traverse(o=>{if(o.isMesh&&o.geometry.type==='TubeGeometry')o.castShadow=false;});
 return {group:world,anim,update(dt,time,reduced=false,events=[]){
  arrows.offset.y=(arrows.offset.y+dt*(reduced?.4:1.6))%1;ripple.offset.x=(ripple.offset.x+dt*.01)%1;
  for(const sp of anim.springs){sp.t+=dt;const k=Math.max(0,1-sp.t/.45);sp.pad.position.y=.62-(reduced?0:Math.sin(k*Math.PI)*.35);}
  for(const p of anim.posts)if(p.lit)p.star.rotation.y+=dt*(reduced?.6:3);
 },fireSpring(s){const sp=anim.springs.reduce((a,b)=>Math.abs(b.s-s)<Math.abs(a.s-s)?b:a,anim.springs[0]);if(sp)sp.t=0;},lightPost(s){for(const p of anim.posts)if(Math.abs(p.s-s)<1&&!p.lit){p.lit=true;p.star.material.color.set('#ffd23f');p.star.material.emissive.set('#b8860b');p.star.material.emissiveIntensity=.6;}},resetPosts(){for(const p of anim.posts){p.lit=false;p.star.material.color.set('#9fb4c4');p.star.material.emissive.set('#000000');}}};
}
