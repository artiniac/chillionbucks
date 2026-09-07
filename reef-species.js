import * as T from './vendor/three.module.js';
// Original procedural artwork, informed by the references in WORLD-RESEARCH.md.
export const SPECIES={
 clown:{name:'Clown anemonefish',latin:'Amphiprion ocellaris',habitat:'Saltwater reef',note:'Three pale bands wrap around an orange body.',color:'#e97b1e',height:.29,width:.15},
 tang:{name:'Palette blue tang',latin:'Paracanthurus hepatus',habitat:'Saltwater reef',note:'Look for the dark palette pattern and yellow tail.',color:'#176acb',height:.42,width:.12},
 yellow:{name:'Yellow tang',latin:'Zebrasoma flavescens',habitat:'Saltwater reef',note:'A tall, thin body and a pointed snout help you spot this tang.',color:'#f0ce17',height:.45,width:.105},
 chromis:{name:'Blue-green chromis',latin:'Chromis viridis',habitat:'Saltwater reef',note:'Its blue-green body shimmers as it turns.',color:'#5cbca9',height:.25,width:.12},
 butterfly:{name:'Copperband butterflyfish',latin:'Chelmon rostratus',habitat:'Saltwater reef',note:'Copper-colored bands, a long snout, and a false eye spot.',color:'#e8dec7',height:.46,width:.095},
 royal:{name:'Royal gramma',latin:'Gramma loreto',habitat:'Saltwater reef',note:'Purple at the head, golden yellow toward the tail.',color:'#9344b5',height:.24,width:.13}
};
const bodyCache=new Map(),materialCache=new Map();
function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!materialCache.has(key)){const m=new T.MeshPhysicalMaterial({color,roughness:.5,clearcoat:.2,clearcoatRoughness:.4,...extra});m.userData.shared=true;materialCache.set(key,m);}return materialCache.get(key);}
function colorAt(kind,u,v){let hex=SPECIES[kind].color;const y=Math.cos(v),side=Math.abs(Math.sin(v));
 if(kind==='clown'){const band=Math.min(Math.abs(u-.22),Math.abs(u-.53),Math.abs(u-.82));hex=band<.037?'#f7eddd':band<.051?'#352c24':hex;}
 if(kind==='tang'){const patch=((u-.51)/.29)**2+((y-.26)/.51)**2;const hole=((u-.53)/.16)**2+((y-.12)/.26)**2;if(side>.3&&((patch<1&&hole>1)||(u<.34&&Math.abs(y)<.22)))hex='#10212e';}
 if(kind==='royal')hex=u<.43?'#e5b62c':hex;
 if(kind==='butterfly'){const band=Math.min(...[.2,.43,.69,.88].map(x=>Math.abs(u-x)));if(band<.04)hex='#bb7729';else if(band<.055)hex='#e5a352';if(((u-.23)/.065)**2+((y-.65)/.17)**2<1)hex='#242b29';}
 const c=new T.Color(hex);const scale=.92+.08*Math.sin(u*155+Math.floor(v*10)*1.4)*Math.sin(v*30);c.multiplyScalar(scale*(.9+.1*(1-y)));return c;
}
function bodyGeometry(kind){if(bodyCache.has(kind))return bodyCache.get(kind);const d=SPECIES[kind],p=[],n=[],col=[],ix=[],nu=120,nv=48;
 for(let i=0;i<=nu;i++){const u=i/nu,x=-.61+1.2*u,profile=Math.pow(Math.sin(Math.PI*u),.72)*( .65+.35*u);for(let j=0;j<=nv;j++){const v=j/nv*Math.PI*2,y=Math.cos(v)*d.height*profile,z=Math.sin(v)*d.width*profile;p.push(x,y,z);const c=colorAt(kind,u,v);col.push(c.r,c.g,c.b);}}
 for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=i*(nv+1)+j,b=a+nv+1;ix.push(a,a+1,b,b,a+1,b+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.setIndex(ix);geo.computeVertexNormals();geo.userData.shared=true;bodyCache.set(kind,geo);return geo;
}
function add(g,geo,m,x=0,y=0,z=0){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;}
const eyeGeo=new T.SphereGeometry(1,14,10);eyeGeo.userData.shared=true;
function eye(g,c,x,y,z,sx,sy,sz){const o=add(g,eyeGeo,mat(c),x,y,z);o.scale.set(sx,sy,sz);return o;}
function fin(g,points,color,z=0){const shape=new T.Shape();shape.moveTo(...points[0]);for(let i=1;i<points.length;i++){const p=points[i],next=points[(i+1)%points.length];shape.quadraticCurveTo(p[0],p[1],(p[0]+next[0])/2,(p[1]+next[1])/2);}shape.lineTo(...points[0]);shape.closePath();const o=add(g,new T.ShapeGeometry(shape),mat(color,{side:T.DoubleSide,transparent:true,opacity:.8,depthWrite:false}),0,0,z);
 const ribs=[];for(let i=1;i<points.length-1;i++){ribs.push(points[0][0],points[0][1],z+.002,points[i][0],points[i][1],z+.002);}const lines=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(ribs,3)),new T.LineBasicMaterial({color,transparent:true,opacity:.65}));g.add(lines);return o;}
export function realisticFish(kind){const d=SPECIES[kind],g=new T.Group();add(g,bodyGeometry(kind),mat('#ffffff',{vertexColors:true}));
 const tail=new T.Group();tail.position.x=-.55;g.add(tail);const tc=['tang','royal'].includes(kind)?'#e1bc2d':d.color;
 const fork=['tang','yellow','chromis'].includes(kind);fin(tail,(fork?[[.04,0],[-.34,.27],[-.27,.13],[-.20,0],[-.27,-.13],[-.34,-.27]]:[[.04,0],[-.3,.22],[-.36,.16],[-.39,0],[-.36,-.16],[-.3,-.22]]),tc);g.userData.tail=tail;
 const h=d.height;fin(g,[[-.49,.05],[-.43,h*.94],[-.29,h*1.22],[-.13,h*1.24],[.04,h*1.14],[.24,h*.89],[.39,h*.5],[.23,h*.42]],d.color);
 fin(g,[[-.48,-.04],[-.4,-h*.98],[-.24,-h*1.17],[-.08,-h*1.07],[.17,-h*.65]],d.color);
 const fins=[];for(const side of [-1,1]){const f=new T.Group();f.position.set(.12,-.06,side*d.width*.86);g.add(f);fin(f,[[.05,.08],[-.15,-.09],[-.26,-.2],[-.08,-.21],[.08,-.06]],kind==='clown'?'#cb651b':d.color);f.rotation.y=side*.6;fins.push(f);
 const ex=.38,ey=h*.25,ez=side*d.width*.69;eye(g,'#b4a975',ex,ey,ez,.046,.05,.02);eye(g,'#071a1a',ex+.005,ey,ez+side*.016,.028,.033,.014);eye(g,'#e5f9ef',ex+.012,ey+.012,ez+side*.026,.008,.008,.004);
 const curve=new T.EllipseCurve(.22,0,.06,h*.53,-1.2,1.2);const pts=curve.getPoints(18).map(p=>new T.Vector3(p.x,p.y,side*d.width*.96));g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:kind==='clown'?'#9e4d18':'#5c766a',transparent:true,opacity:.5})));
 }
 if(['butterfly','yellow'].includes(kind)){const snout=add(g,new T.ConeGeometry(kind==='butterfly'?.095:.09,kind==='butterfly'?.3:.15,16),mat(d.color),.57,-.06,0);snout.rotation.z=-Math.PI/2;snout.scale.z=.6;}
 g.userData.fins=fins;return g;
}
