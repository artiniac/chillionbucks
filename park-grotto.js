import * as T from './vendor/three.module.js';
import {mergeVertices} from './vendor/BufferGeometryUtils.js';
import {scannedMaterial} from './realism.js';
import {GROTTO_Z} from './park-grotto-geometry.js';
// One attraction in the existing park scene, renderer, audio, and animation loop.
export function createParkGrotto(scene,renderer){
const root=new T.Group();root.name='Grotto Springs';root.position.z=GROTTO_Z;scene.add(root);const cameraClips=new T.Vector2(.1,250);
let seed=3729;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const stone=scannedMaterial('concrete_pavement',[2,2],'#b7a98d');
const wood=new T.MeshStandardMaterial({color:'#73614a',roughness:.86}),metal=new T.MeshStandardMaterial({color:'#a1b0af',metalness:.85,roughness:.24});
function mesh(geo,mat,x=0,y=0,z=0){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
function box(w,h,d,x,y,z,mat=stone){return mesh(new T.BoxGeometry(w,h,d),mat,x,y,z);}
// The deck is built around an open excavation. Nothing fills the pool volume.

box(6,.45,32,-10,-.18,0);box(6,.45,32,10,-.18,0);box(14,.45,3,0,-.18,14.5);box(14,.45,3,0,-.18,-14.5);
const tile=new T.MeshStandardMaterial({color:'#b7d3c4',roughness:.37});tile.onBeforeCompile=s=>{s.uniforms.clock={value:0};tile.userData.shader=s;s.vertexShader='varying vec3 tileP;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\ntileP=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader='varying vec3 tileP;uniform float clock;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 q=tileP.xz+vec2(tileP.y*.7);vec2 f=abs(fract(q*4.)-.5);float grout=smoothstep(.465,.495,max(f.x,f.y));diffuseColor.rgb*=mix(1.,.67,grout);float a=sin(q.x*5.+sin(q.y*4.+clock*.6));float b=sin(q.y*5.-sin(q.x*3.-clock*.5));float c=pow(max(0.,1.-abs(a+b)*2.5),4.);diffuseColor.rgb+=c*.13;`);};
box(14,.2,26,0,-1.65,0,tile);box(.22,1.7,26,-6.9,-.78,0,tile);box(.22,1.7,26,6.9,-.78,0,tile);box(14,1.7,.22,0,-.78,12.9,tile);box(14,1.7,.22,0,-.78,-12.9,tile);
for(let i=0;i<5;i++)box(5,.24*(5-i),.65,0,-1.53+.12*(5-i),11.9-i*.64,tile);
// Individual coping stones and narrow joints establish a readable human scale.
for(let z=-12.5;z<13;z+=.8)for(const x of [-7,7])box(.65,.16,.77,x,.11,z);
for(let x=-6.4;x<7;x+=.8)for(const z of [-13,13])box(.77,.16,.65,x,.11,z);
const waterMat=new T.MeshPhysicalMaterial({color:'#c9f2ee',roughness:.065,metalness:0,transmission:0,thickness:1.4,ior:1.333,attenuationColor:'#369da5',attenuationDistance:7,envMapIntensity:1.4,side:T.DoubleSide});
const refraction=new T.WebGLRenderTarget(Math.round(innerWidth*.65),Math.round(innerHeight*.65));refraction.depthTexture=new T.DepthTexture(refraction.width,refraction.height);const screenSize=new T.Vector2();renderer.getDrawingBufferSize(screenSize);const clipUnderwater=new T.Plane(new T.Vector3(0,-1,0),-.115);
waterMat.onBeforeCompile=s=>{s.uniforms.poolRefraction={value:refraction.texture};s.uniforms.poolDepth={value:refraction.depthTexture};s.uniforms.poolScreen={value:screenSize};s.uniforms.cameraClips={value:cameraClips};s.uniforms.clock={value:0};waterMat.userData.shader=s;s.vertexShader='varying vec3 waterP;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nwaterP=(modelMatrix*vec4(transformed,1.)).xyz;');s.fragmentShader='varying vec3 waterP;uniform float clock;uniform sampler2D poolRefraction;uniform sampler2D poolDepth;uniform vec2 poolScreen;uniform vec2 cameraClips;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
vec2 p=waterP.xz;vec2 slope=vec2(cos(p.x*3.1+p.y*1.3+clock*.85)*.027+cos(p.x*8.1-p.y*3.-clock*1.5)*.012,cos(p.y*3.7-p.x*.8-clock*.7)*.024+sin(p.y*9.+p.x*2.+clock)*.009);normal=normalize(mat3(viewMatrix)*vec3(-slope.x,1.,-slope.y));`);s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`vec2 poolUV=gl_FragCoord.xy/poolScreen+slope*.075;float dep=texture2D(poolDepth,poolUV).x;float floorDistance=(cameraClips.x*cameraClips.y)/(cameraClips.y-dep*(cameraClips.y-cameraClips.x));float path=max(0.,floorDistance-vViewPosition.z)*length(vViewPosition)/max(.01,vViewPosition.z);vec3 absorb=exp(-vec3(.24,.055,.035)*min(path,8.));vec3 beneath=texture2D(poolRefraction,poolUV).rgb*absorb+vec3(.02,.17,.18)*(1.-absorb);float fresnel=.0204+.9796*pow(1.-max(0.,dot(normal,normalize(vViewPosition))),5.);outgoingLight=beneath*(1.-fresnel)+reflectedLight.directSpecular+reflectedLight.indirectSpecular;
#include <opaque_fragment>`);};
const water=mesh(new T.PlaneGeometry(13.6,25.6,1,1).rotateX(-Math.PI/2),waterMat,0,-.12,0);water.castShadow=false;
// Weathered rock mass has a traversable vaulted interior rather than a solid mound.
const rockMat=scannedMaterial('rock_face',[1,1],'#c6c1b5');
function rock(x,y,z,sx,sy,sz){let geo=new T.IcosahedronGeometry(1,5);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i),c=p.getZ(i),n=1+.09*Math.sin(a*9+b*7)*Math.cos(c*8)+.045*Math.sin(b*23+c*12);p.setXYZ(i,a*n,b*n,c*n);}geo.deleteAttribute('normal');geo=mergeVertices(geo);geo.computeVertexNormals();const r=mesh(geo,rockMat,x,y,z);r.scale.set(sx,sy,sz);r.rotation.set(rand()*.25,rand()*6,rand()*.2);return r;}
for(let z=-12;z<-4;z+=1.75)for(let i=0;i<=8;i++){const a=i/8*Math.PI;rock(Math.cos(a)*5,Math.sin(a)*3.8+.2,z,1.25+rand()*.5,.9+rand()*.45,1.4);}
for(let i=0;i<30;i++){const side=i%2?1:-1;rock(side*(7.6+rand()*3),.25+rand()*.35,-13+rand()*13,1+rand(),.5+rand()*.9,.8+rand());}
for(const z of [-10,-6]){const lamp=new T.PointLight('#ffe0a2',14,7,2);lamp.position.set(4.1,.9,z);root.add(lamp);mesh(new T.SphereGeometry(.07,12,8),new T.MeshBasicMaterial({color:'#ffe1a3'}),4.1,.9,z);}
// Fine leaf silhouettes, varied branches, and dense low planting soften the rock boundary.
const leafGeo=new T.SphereGeometry(1,8,4),leafMat=new T.MeshStandardMaterial({color:'#496743',roughness:.92});const leaves=new T.InstancedMesh(leafGeo,leafMat,6200);leaves.castShadow=true;leaves.receiveShadow=true;root.add(leaves);let li=0;const dummy=new T.Object3D();
function leaf(x,y,z,s=.2){dummy.position.set(x,y,z);dummy.scale.set(s,s*.06,s*.38);dummy.rotation.set(rand()*3,rand()*6,rand()*3);dummy.updateMatrix();leaves.setMatrixAt(li,dummy.matrix);leaves.setColorAt(li,new T.Color().setHSL(.22+rand()*.1,.22+rand()*.2,.17+rand()*.17));li++;}
function branch(a,b,r){const v=b.clone().sub(a),m=mesh(new T.CylinderGeometry(r*.35,r,v.length(),7),wood);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
for(let i=0;i<16;i++){const x=(i%2?1:-1)*(12+rand()*7),z=-19+rand()*38,h=3+rand()*4;branch(new T.Vector3(x,0,z),new T.Vector3(x,h,z),.14);for(let k=0;k<8;k++){const a=k*2.4,r=1+rand(),end=new T.Vector3(x+Math.cos(a)*r,h+rand()*1.2,z+Math.sin(a)*r);branch(new T.Vector3(x,h*.7,z),end,.045);for(let j=0;j<42;j++){const aa=rand()*Math.PI*2,rr=Math.sqrt(rand())*.9;leaf(end.x+Math.cos(aa)*rr,end.y+rand()*.65,end.z+Math.sin(aa)*rr,.12+rand()*.14);}}}
for(let i=li;i<6200;i++){const x=(i%2?1:-1)*(7.6+rand()*4),z=-15+rand()*29;leaf(x,.2+rand()*.55,z,.13+rand()*.1);}leaves.instanceMatrix.needsUpdate=true;
// Pool house, open pergola, and restrained furniture frame the south terrace.
box(8,3.5,4,-9,1.65,19,new T.MeshStandardMaterial({color:'#d6cebb',roughness:.95}));box(8.7,.22,4.8,-9,3.5,19,wood);for(const x of [-11,-8])box(1.9,2.6,.08,x,1.3,16.95,new T.MeshPhysicalMaterial({color:'#314e49',roughness:.14,metalness:.3}));
for(const x of [4,11])for(const z of [14.6,20])box(.19,3.3,.19,x,1.55,z,wood);for(let x=3.5;x<12;x+=.42)box(.12,.2,6.3,x,3.2,17.4,wood);
const fabric=new T.MeshStandardMaterial({color:'#d7d4bd',roughness:1});for(const x of [-10,10])for(const z of [2,6,10]){box(.85,.13,2,x,.4,z,fabric);const back=box(.85,.13,.9,x,.7,z-.9,fabric);back.rotation.x=.55;for(const dz of [-.6,.6])box(.65,.4,.07,x,.15,z+dz,wood);}
// A smooth flume curves down from a platform and empties above the real pool.
const slidePath=new T.CatmullRomCurve3([new T.Vector3(11,5,-3),new T.Vector3(9,4.7,0),new T.Vector3(10,3,4),new T.Vector3(7,1.7,6),new T.Vector3(4,.15,5)]);
const pos=[],uv=[],idx=[];for(let i=0;i<=100;i++){const t=i/100,p=slidePath.getPoint(t),v=slidePath.getTangent(t),n=new T.Vector3(v.z,0,-v.x).normalize();for(let j=0;j<=20;j++){const a=j/20*Math.PI,q=p.clone().addScaledVector(n,Math.cos(a)*.62);q.y+=.62-Math.sin(a)*.62;pos.push(q.x,q.y,q.z);uv.push(t*12,j/20);if(i<100&&j<20){const k=i*21+j;idx.push(k,k+21,k+1,k+1,k+21,k+22);}}}const flume=new T.BufferGeometry();flume.setAttribute('position',new T.Float32BufferAttribute(pos,3));flume.setAttribute('uv',new T.Float32BufferAttribute(uv,2));flume.setIndex(idx);flume.computeVertexNormals();mesh(flume,new T.MeshPhysicalMaterial({color:'#759f95',roughness:.24,clearcoat:1,side:T.DoubleSide}));box(2,.22,2,11,4.9,-3,wood);for(const t of [0,.3,.6]){const p=slidePath.getPoint(t);mesh(new T.CylinderGeometry(.09,.12,p.y,12),metal,p.x,p.y/2,p.z);}for(let i=0;i<16;i++)box(1,.12,.33,12,.3+i*.3,-3-i*.26,stone);
const ring=mesh(new T.TorusGeometry(.48,.14,16,48),new T.MeshPhysicalMaterial({color:'#e2c381',roughness:.35,clearcoat:.7}),1,.02,3);ring.rotation.x=Math.PI/2;

const frustum=new T.Frustum(),projection=new T.Matrix4(),bounds=new T.Box3(new T.Vector3(-22,-2,GROTTO_Z-22),new T.Vector3(22,12,GROTTO_Z+24));
let targetWidth=0,targetHeight=0;
function renderRefraction(camera,time){
 for(const m of [tile,waterMat])if(m.userData.shader)m.userData.shader.uniforms.clock.value=time;
 ring.position.y=.03+Math.sin(time*1.2)*.025;
 camera.updateMatrixWorld();frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));if(!frustum.intersectsBox(bounds))return;
 renderer.getDrawingBufferSize(screenSize);const width=Math.max(1,Math.round(screenSize.x*.55)),height=Math.max(1,Math.round(screenSize.y*.55));if(width!==targetWidth||height!==targetHeight){refraction.setSize(width,height);targetWidth=width;targetHeight=height;}cameraClips.set(camera.near,camera.far);
 const hidden=[];scene.traverse(o=>{if(o.visible&&(o.isWater||o===water)){hidden.push(o);o.visible=false;}});
 const background=scene.background,target=renderer.getRenderTarget(),planes=renderer.clippingPlanes,auto=renderer.shadowMap.autoUpdate,needs=renderer.shadowMap.needsUpdate;
 try{scene.background=new T.Color('#2e8487');renderer.clippingPlanes=[clipUnderwater];renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=false;renderer.setRenderTarget(refraction);renderer.render(scene,camera);}
 finally{renderer.setRenderTarget(target);renderer.clippingPlanes=planes;renderer.shadowMap.autoUpdate=auto;renderer.shadowMap.needsUpdate=needs;scene.background=background;hidden.forEach(o=>o.visible=true);}
}
function rideCamera(camera,kind,progress){
 if(kind==='slide'){const t=Math.min(progress/7,1);camera.position.copy(slidePath.getPoint(t)).add(new T.Vector3(0,.48,GROTTO_Z));camera.lookAt(slidePath.getPoint(Math.min(t+.07,1)).add(new T.Vector3(-.05,.1,GROTTO_Z-.1)));return t===1;}
 const t=(progress*.045)%1,z=6-t*17;camera.position.set(Math.sin(t*4)*.8,.38,z+GROTTO_Z);camera.lookAt(0,.5,z+GROTTO_Z-4);ring.position.set(camera.position.x,-.02,z-.3);return false;
}
return {root,renderRefraction,rideCamera,dispose(){refraction.dispose();scene.remove(root);root.traverse(o=>{o.geometry?.dispose();if(o.material&&!o.material.userData.shared)o.material.dispose();});}};
}
