import * as T from './vendor/three.module.js';
import {scannedMaterial} from './realism.js?v=estates4';
const cache=new Map();
function copyReef(source){const copy=source.clone(true);if(source.userData.portal)copy.userData.portal=source.userData.portal.clone();return copy;}
export function reefExtra(id){if(!['reefarch','coralgarden','reefledge','pineapplehome','stonefacehome'].includes(id))return null;if(cache.has(id))return copyReef(cache.get(id));const g=new T.Group();
 const rock=scannedMaterial('concrete_pavement',[1,1],'#a2a293');function mat(c){const m=new T.MeshStandardMaterial({color:c,roughness:.83});m.userData.shared=true;return m;}
 function obj(geo,m,p,s=[1,1,1]){geo.userData.shared=true;const o=new T.Mesh(geo,typeof m==='string'?mat(m):m);o.position.set(...p);o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
 function stone(x,y,z,sx,sy,sz){const geo=new T.IcosahedronGeometry(1,2),p=geo.attributes.position;for(let i=0;i<p.count;i++){const k=1+.11*Math.sin(p.getX(i)*17+p.getY(i)*11+p.getZ(i)*7);p.setXYZ(i,p.getX(i)*k,p.getY(i)*k,p.getZ(i)*k);}geo.computeVertexNormals();return obj(geo,rock,[x,y,z],[sx,sy,sz]);}
 function branch(a,b,r,c){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.sub(av),o=obj(new T.CylinderGeometry(r*.58,r,d.length(),7),c,av.clone().addScaledVector(d,.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 function coral(x,y,z,size,c){for(let i=0;i<7;i++){const a=i*2.399,tip=[x+Math.sin(a)*size*.35,y+size*(.6+i*.045),z+Math.cos(a)*size*.35];branch([x,y,z],tip,size*.04,c);for(let j=0;j<3;j++)branch([tip[0],tip[1]-.2*size,tip[2]],[tip[0]+Math.sin(a+j)*size*.2,tip[1]+size*.2,tip[2]+Math.cos(a+j)*size*.2],size*.023,c);}}
 if(id==='reefarch'){stone(-.85,.58,0,.48,.7,.55);stone(.85,.58,0,.48,.7,.55);for(let i=0;i<7;i++){const a=i/6*Math.PI;stone(Math.cos(a)*.85,.7+Math.sin(a)*.68,0,.36,.26,.48);}coral(-.9,1,.1,.8,'#d996a1');coral(.95,1,0,.55,'#dcae72');g.userData.portal=new T.Vector3(0,.65,0);}
 if(id==='reefledge'){for(let i=0;i<4;i++)stone(i%2?.2:-.15,.18+i*.27,0,1-i*.12,.19,.66-i*.08);for(let i=0;i<6;i++){const a=i*2.4;obj(new T.SphereGeometry(1,16,8),'#9ba9b8',[Math.sin(a)*.7,.8+Math.cos(a)*.25,Math.cos(a)*.5],[.38,.035,.28]);}coral(.1,1,0,.65,'#cb9c7b');}
 if(id==='coralgarden'){stone(0,.15,0,1.1,.2,.7);for(let i=0;i<9;i++)coral(Math.sin(i*2.4)*.75,.22,Math.cos(i*2.4)*.5,.55+(i%3)*.22,['#e7aa95','#b6aacb','#d6be76'][i%3]);}
 if(id==='pineapplehome'){
 // Open central door, framed by many individual diamond scales.
 for(let row=0;row<9;row++)for(let col=0;col<16;col++){const a=col/16*Math.PI*2+(row%2?Math.PI/16:0),y=.18+row*.17,r=.55*Math.sin((row/10+.13)*Math.PI);if(Math.cos(a)>.65&&Math.abs(Math.sin(a)*r)<.22&&y<.7)continue;const o=obj(new T.SphereGeometry(1,8,6),row%2?'#d7a84f':'#e9b958',[Math.sin(a)*r,y,Math.cos(a)*r],[.145,.13,.12]);o.rotation.z=.7;}
 for(let i=0;i<10;i++){const a=i*2.4;branch([0,1.6,0],[Math.sin(a)*.5,1.85+(i%3)*.2,Math.cos(a)*.5],.1,'#658f58');}
 for(const x of [-.26,.26])branch([x,0,.46],[x,.63,.46],.05,'#b5ceca');const arch=obj(new T.TorusGeometry(.26,.05,8,24,Math.PI),'#b5ceca',[0,.62,.46]);for(const x of [-.35,.35]){const win=obj(new T.TorusGeometry(.12,.04,8,24),'#94b3b7',[x,.99,.39]);win.rotation.y=x;obj(new T.CircleGeometry(.105,20),'#254958',[x,.99,.397]);}g.userData.portal=new T.Vector3(0,.35,0);
 }
 if(id==='stonefacehome'){
 stone(-.42,.7,0,.24,.85,.48);stone(.42,.7,0,.24,.85,.48);stone(0,1.58,0,.58,.59,.48);stone(0,.98,-.3,.52,.66,.21);stone(0,1.32,.49,.12,.37,.16);for(const x of [-.26,.26]){stone(x,1.69,.45,.25,.07,.12);obj(new T.SphereGeometry(1,12,8),'#335963',[x,1.52,.48],[.13,.09,.035]);}for(const x of [-.22,.22])branch([x,0,.38],[x,.6,.38],.05,'#809197');obj(new T.TorusGeometry(.22,.05,8,24,Math.PI),'#809197',[0,.6,.38]);g.userData.portal=new T.Vector3(0,.32,.05);
 }
 cache.set(id,g);return copyReef(g);
}
