import * as T from './vendor/three.module.js';
import {RESPAWN} from './driving-race.js?v=1';

// Original go-karts and race props. Geometry and materials are shared between
// karts and marked shared so no kart can dispose another kart's parts.
const SCALE=1.3,geometries=new Map(),materials=new Map();
function geo(key,make){if(!geometries.has(key)){const g=make();g.userData.shared=true;geometries.set(key,g);}return geometries.get(key);}
function mat(color,options={}){const key=color+JSON.stringify(options);if(!materials.has(key)){const m=new T.MeshStandardMaterial({color,roughness:.45,metalness:.05,...options});m.userData.shared=true;materials.set(key,m);}return materials.get(key);}
function glow(color,opacity=.85){const key='glow'+color+opacity;if(!materials.has(key)){const m=new T.MeshBasicMaterial({color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});m.userData.shared=true;materials.set(key,m);}return materials.get(key);}
function rounded(w,l,r){const s=new T.Shape(),x=-w/2,y=-l/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+l-r);s.quadraticCurveTo(x+w,y+l,x+w-r,y+l);s.lineTo(x+r,y+l);s.quadraticCurveTo(x,y+l,x,y+l-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
// A rounded top-view outline extruded upward.
function pod(w,l,h,r,b){const g=new T.ExtrudeGeometry(rounded(w,l,r),{depth:h,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:5});g.rotateX(-Math.PI/2);return g;}
function part(parent,geometry,material,x,y,z,{rx=0,ry=0,rz=0,shadow=true}={}){const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=shadow;o.receiveShadow=shadow;parent.add(o);return o;}
function limb(parent,material,from,to,radius){const a=new T.Vector3(...from),b=new T.Vector3(...to),d=b.clone().sub(a),o=part(parent,geo('limb'+radius,()=>new T.CapsuleGeometry(radius,1,3,8)),material,0,0,0);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.y=d.length()/(1+radius*2);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}

export function boostFlames(points){
 const group=new T.Group(),flames=[];group.visible=false;
 const cone=geo('flame',()=>new T.ConeGeometry(.1,.6,10,1,true).rotateX(-Math.PI/2).translate(0,0,-.3));
 for(const [x,y,z] of points){const outer=part(group,cone,glow('#ff7a1a'),x,y,z,{shadow:false}),inner=part(group,cone,glow('#ffe36b',.95),x,y,z,{shadow:false});inner.scale.set(.55,.55,.7);flames.push(outer,inner);}
 return {group,set(amount,time=0){group.visible=amount>.02;if(!group.visible)return;flames.forEach((f,i)=>{const flicker=.8+.25*Math.sin(time*38+i*1.7);const inner=i%2;f.scale.set((inner?.55:1)*(.75+.25*amount),(inner?.55:1)*(.75+.25*amount),(inner?.7:1)*amount*flicker*1.4);});}};
}

export function makeKart(r){
 const car=new T.Group(),body=new T.Group(),s=new T.Group();car.name=r.name+' kart';s.scale.setScalar(SCALE);car.add(body);body.add(s);
 const paint=mat(r.color,{roughness:.3,metalness:.18}),accent=mat(r.accent,{roughness:.5}),dark=mat('#23282d',{roughness:.75}),metal=mat('#9aa3aa',{metalness:.75,roughness:.3}),chrome=mat('#dfe4e8',{metalness:1,roughness:.16}),suit=mat(r.suit,{roughness:.8}),skin=mat(r.skin,{roughness:.7}),rubber=mat('#15171a',{roughness:.92}),white=mat('#fffdf5',{roughness:.4}),ink=mat('#1d2430',{roughness:.5}),blush=mat('#f28b8b',{roughness:.8});
 part(s,geo('floor',()=>pod(1.25,2.3,.08,.3,.03)),dark,0,.14,0);
 part(s,geo('tub',()=>pod(1.02,1.95,.24,.4,.08)),paint,0,.2,.05);
 part(s,geo('nose',()=>pod(.74,.55,.16,.26,.06)),paint,0,.2,1.12);
 for(const side of [-1,1])part(s,geo('sidepod',()=>pod(.3,1.05,.2,.13,.05)),accent,side*.66,.19,-.05);
 const bumper=geo('bumper',()=>new T.CapsuleGeometry(.075,1.15,4,8).rotateZ(Math.PI/2));part(s,bumper,accent,0,.3,1.42);part(s,bumper,dark,0,.32,-1.3);
 part(s,geo('plate',()=>new T.CylinderGeometry(.17,.17,.03,24)),white,0,.45,1.1);
 part(s,geo('seat',()=>new T.BoxGeometry(.56,.12,.5)),dark,0,.46,-.36);part(s,geo('seatBack',()=>new T.BoxGeometry(.56,.55,.12)),dark,0,.72,-.64,{rx:-.2});
 part(s,geo('engine',()=>new T.BoxGeometry(.62,.34,.4)),metal,0,.46,-1);
 for(const x of [-.18,.18])part(s,geo('pipe',()=>new T.CylinderGeometry(.055,.065,.36,12).rotateX(Math.PI/2)),chrome,x,.56,-1.3);
 part(s,geo('column',()=>new T.CylinderGeometry(.03,.03,.5,8)),dark,0,.62,.3,{rx:-.95});
 part(s,geo('steer',()=>new T.TorusGeometry(.16,.032,8,20)),dark,0,.8,.12,{rx:-.95});
 const wheels=[];
 for(const [front,x,z,radius,width] of [[1,.72,.8,.26,.22],[1,-.72,.8,.26,.22],[0,.76,-.82,.31,.3],[0,-.76,-.82,.31,.3]]){
  const pivot=new T.Group(),spin=new T.Group();pivot.position.set(x,radius,z);pivot.add(spin);s.add(pivot);
  part(spin,geo('tire'+radius,()=>new T.CylinderGeometry(radius,radius,width,20).rotateZ(Math.PI/2)),rubber,0,0,0);
  part(spin,geo('hub'+radius,()=>new T.CylinderGeometry(radius*.52,radius*.52,width+.02,12).rotateZ(Math.PI/2)),paint,0,0,0);
  wheels.push({pivot,spin,front:!!front,radius:radius*SCALE});
 }
 // A rounded cartoon driver with an open-face helmet.
 const driver=new T.Group();driver.position.set(0,0,-.38);s.add(driver);
 part(driver,geo('torso',()=>new T.CapsuleGeometry(.2,.26,4,10)),suit,0,.8,0,{rx:-.15});
 for(const side of [-1,1]){limb(driver,suit,[side*.2,.93,.05],[side*.15,.8,.47],.065);part(driver,geo('hand',()=>new T.SphereGeometry(.065,10,8)),skin,side*.15,.8,.48);}
 const head=new T.Group();head.position.set(0,1.2,.04);driver.add(head);
 part(head,geo('head',()=>new T.SphereGeometry(.22,20,14)),skin,0,0,0);
 part(head,geo('helmet',()=>new T.SphereGeometry(.25,24,14,0,Math.PI*2,0,Math.PI*.55)),paint,0,0,0,{rx:-.45});
 part(head,geo('brim',()=>new T.BoxGeometry(.38,.035,.12)),accent,0,.12,.19,{rx:-.3});
 for(const side of [-1,1]){part(head,geo('eye',()=>new T.SphereGeometry(.045,10,8)),white,side*.075,.01,.185,{shadow:false});part(head,geo('pupil',()=>new T.SphereGeometry(.026,8,6)),ink,side*.075,.01,.222,{shadow:false});const cheek=part(head,geo('cheek',()=>new T.SphereGeometry(.036,8,6)),blush,side*.13,-.06,.165,{shadow:false});cheek.scale.z=.45;}
 part(head,geo('smile',()=>new T.TorusGeometry(.055,.012,6,12,Math.PI)),ink,0,-.07,.205,{rz:Math.PI,shadow:false});
 const flames=boostFlames([[-.18,.56,-1.48],[.18,.56,-1.48]]);s.add(flames.group);
 return {car,body,paint,wheels,flames,racer:r,kart:true,loaded:true,ready:Promise.resolve(),update(time,turn){head.rotation.y=turn*.35;head.rotation.z=Math.sin(time*1.3+r.color.length)*.04;}};
}

// Chevron arrows drawn pointing toward the bottom of the canvas, which faces
// forward once the plane lies on the road.
function arrowTexture(){
 const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#ff9a1f');g.addColorStop(1,'#ffcf3d');x.fillStyle=g;x.fillRect(0,0,64,128);
 x.fillStyle='#fffbe6';for(const y of [14,78]){x.beginPath();x.moveTo(6,y);x.lineTo(32,y+30);x.lineTo(58,y);x.lineTo(58,y+14);x.lineTo(32,y+44);x.lineTo(6,y+14);x.closePath();x.fill();}
 const t=new T.CanvasTexture(c);t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;
}
function coinTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#f5c542';x.fillRect(0,0,128,128);x.strokeStyle='#c9941d';x.lineWidth=10;x.beginPath();x.arc(64,64,50,0,Math.PI*2);x.stroke();x.fillStyle='#b98313';x.font='bold 62px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('c.',66,60);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}

export function raceProps(curve,layout){
 const L=layout.length,group=new T.Group(),owned=[],frame=(at,lane,lift)=>{const t=at/L,p=curve.getPointAt(t),d=curve.getTangentAt(t),n=new T.Vector3(-d.z,0,d.x).normalize(),g=new T.Group();g.position.copy(p).addScaledVector(n,lane);g.position.y+=lift;g.rotation.set(-Math.asin(d.y),Math.atan2(d.x,d.z),0,'YXZ');group.add(g);return g;};
 const own=x=>{owned.push(x);return x;};
 const arrows=own(arrowTexture()),padGeo=own(new T.PlaneGeometry(3,4.4).rotateX(-Math.PI/2)),padMat=own(new T.MeshBasicMaterial({map:arrows,transparent:true,opacity:.95,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:T.DoubleSide,toneMapped:false}));
 for(const pad of layout.pads){const g=frame(pad.at,pad.lane,.07);const m=new T.Mesh(padGeo,padMat);m.renderOrder=2;g.add(m);}
 const boxGeo=own(new T.BoxGeometry(1,1,1)),ribbonA=own(new T.BoxGeometry(1.04,1.04,.2)),ribbonB=own(new T.BoxGeometry(.2,1.04,1.04)),bowGeo=own(new T.TorusGeometry(.16,.05,8,16)),boxMat=own(new T.MeshStandardMaterial({color:'#ff6fb1',emissive:'#ff6fb1',emissiveIntensity:.25,roughness:.35,transparent:true,opacity:.92})),ribbonMat=own(new T.MeshStandardMaterial({color:'#fffdf2',roughness:.4}));
 const boxes=layout.boxes.map(row=>row.lanes.map(lane=>{const g=frame(row.at,lane,0),spin=new T.Group();g.add(spin);for(const [geometry,material] of [[boxGeo,boxMat],[ribbonA,ribbonMat],[ribbonB,ribbonMat]]){const m=new T.Mesh(geometry,material);m.castShadow=true;spin.add(m);}for(const r of [-.6,.6]){const bow=new T.Mesh(bowGeo,ribbonMat);bow.position.set(0,.6,0);bow.rotation.set(0,Math.PI/2,r);spin.add(bow);}return {g,spin};}));
 const coinGeo=own(new T.CylinderGeometry(.42,.42,.1,24).rotateX(Math.PI/2)),face=own(coinTexture()),edge=own(new T.MeshStandardMaterial({color:'#e2ae2f',metalness:.85,roughness:.28,emissive:'#6b4a00',emissiveIntensity:.25})),faceMat=own(new T.MeshStandardMaterial({map:face,metalness:.55,roughness:.35,emissive:'#5a3d00',emissiveIntensity:.2}));
 const coins=new T.InstancedMesh(coinGeo,[edge,faceMat,faceMat],Math.max(1,layout.coins.length));coins.count=layout.coins.length;coins.castShadow=true;coins.frustumCulled=false;group.add(coins);
 const bases=layout.coins.map(c=>{const g=frame(c.at,c.lane,1);g.updateMatrixWorld(true);group.remove(g);return {position:g.position.clone(),quaternion:g.quaternion.clone()};});
 const m=new T.Matrix4(),q=new T.Quaternion(),spinQ=new T.Quaternion(),up=new T.Vector3(0,1,0),scale=new T.Vector3(),pos=new T.Vector3();
 return {group,update(dt,time,core,reduced=false){
  arrows.offset.y=(arrows.offset.y+dt*(reduced?.4:1.6))%1;
  boxMat.color.setHSL((time*.08)%1,.75,.62);boxMat.emissive.copy(boxMat.color);
  boxes.forEach((row,r)=>row.forEach((b,i)=>{const wait=core?.boxes[r]?.wait[i]||0,taken=RESPAWN.box-wait;b.g.visible=wait<=0||taken<.25;b.spin.scale.setScalar(wait>0?Math.max(.01,1.3-taken*4):1);b.spin.position.y=1.1+(reduced?0:Math.sin(time*2+i+r)*.12);b.spin.rotation.y=reduced?.5:time*1.3+i;}));
  bases.forEach((b,i)=>{const wait=core?.coins[i]?.wait||0,taken=RESPAWN.coin-wait,lift=wait>0?Math.min(1,taken/.35):0;const visible=wait<=0||taken<.35;spinQ.setFromAxisAngle(up,reduced?0:time*3+i*.5);q.copy(b.quaternion).multiply(spinQ);pos.copy(b.position);pos.y+=lift*1.4+(reduced?0:Math.sin(time*3+i)*.08);scale.setScalar(visible?1-lift*.8:0);m.compose(pos,q,scale);coins.setMatrixAt(i,m);});
  coins.instanceMatrix.needsUpdate=true;
 },dispose(){group.removeFromParent();for(const x of owned)x.dispose();}};
}
