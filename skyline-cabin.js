import * as T from './vendor/three.module.js';
import {loft,part,clothTexture,curvedPart} from './family-body.js?v=1';

// The licensed car has one racing seat and three cylinders in the passenger
// bay. Remove only their connected components after normalization to metres.
// Retain the rear bench, dashboard, doors, steering wheel, and center console.
export function replaceableCabinGeometry(geometry,material){
 if(!/^(seat)$|InteriorA_Material1$|TexturedA_Material1$/.test(material))return geometry;
 const p=geometry.attributes.position,n=p.count,roots=Array.from({length:n},(_,i)=>i),positions=new Map();
 const root=i=>{while(roots[i]!==i){roots[i]=roots[roots[i]];i=roots[i];}return i;};const join=(a,b)=>roots[root(b)]=root(a);
 for(let i=0;i<n;i++){const k=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');if(positions.has(k))join(i,positions.get(k));else positions.set(k,i);}
 for(let i=0;i<n;i+=3){join(i,i+1);join(i,i+2);}
 const boxes=new Map();for(let i=0;i<n;i++){const k=root(i);if(!boxes.has(k))boxes.set(k,new T.Box3());boxes.get(k).expandByPoint(new T.Vector3().fromBufferAttribute(p,i));}
 const remove=new Set();for(const [k,b] of boxes){
  const a=b.min,z=b.max;
  const driver=a.x>-.64&&z.x<-.07&&a.y>.27&&z.y<1.2&&a.z>-.45&&z.z<.28&&(z.y<.68||z.z<-.13);
  const passenger=a.x>.10&&z.x<.65&&a.y>.25&&z.y<.91&&a.z>-.5&&z.z<.28;
  if(material==='seat'?a.z>-.46:driver||passenger)remove.add(k);
 }
 if(!remove.size)return geometry;
 const keep=[];for(let i=0;i<n;i++)if(!remove.has(root(i)))keep.push(i);
 const clean=new T.BufferGeometry();for(const [name,attr] of Object.entries(geometry.attributes)){const data=new attr.array.constructor(keep.length*attr.itemSize);keep.forEach((i,j)=>{for(let c=0;c<attr.itemSize;c++)data[j*attr.itemSize+c]=attr.array[i*attr.itemSize+c];});clean.setAttribute(name,new T.BufferAttribute(data,attr.itemSize,attr.normalized));}
 geometry.dispose();return clean;
}
function outline(){const s=new T.Shape();s.moveTo(-.205,0);s.quadraticCurveTo(-.245,.10,-.214,.28);s.lineTo(-.265,.52);s.quadraticCurveTo(-.272,.59,-.215,.63);s.lineTo(-.155,.76);s.quadraticCurveTo(-.149,.81,0,.815);s.quadraticCurveTo(.149,.81,.155,.76);s.lineTo(.215,.63);s.quadraticCurveTo(.272,.59,.265,.52);s.lineTo(.214,.28);s.quadraticCurveTo(.245,.10,.205,0);s.closePath();
 for(const x of [-.094,.094]){const h=new T.Path();h.absellipse(x,.62,.037,.061,0,Math.PI*2,true);s.holes.push(h);}return s;}
function embroidery(){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,512,128);ctx.font='italic bold 76px sans-serif';ctx.textAlign='left';ctx.fillStyle='#eeeae3';ctx.fillText('nism',44,90);const w=ctx.measureText('nism').width;ctx.fillStyle='#cc233b';ctx.fillText('o',44+w,90);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
export function addNismoSeats(parent){
 const group=new T.Group();group.name='Black and red Nismo front seats';parent.add(group);
 const weave=clothTexture();const black=new T.MeshStandardMaterial({color:'#1c1e22',roughness:.96,bumpMap:weave,bumpScale:.0014});
 const red=new T.MeshStandardMaterial({color:'#b50a24',roughness:.92,bumpMap:weave,bumpScale:.0018});
 const carbon=new T.MeshPhysicalMaterial({color:'#1b2027',metalness:.28,roughness:.32,clearcoat:.7,bumpMap:weave,bumpScale:.0008});
 const edge=new T.MeshStandardMaterial({color:'#65636a',roughness:.84}),steel=new T.MeshStandardMaterial({color:'#45494e',metalness:.8,roughness:.4});
 const label=new T.MeshStandardMaterial({map:embroidery(),transparent:true,depthWrite:false,roughness:.85});
 for(const x of [-.39,.39]){
  const seat=new T.Group();seat.name=x<0?'Artin Nismo bucket seat':'Leo Nismo bucket seat';seat.position.set(x,0,-.26);group.add(seat);
  const back=new T.Group();back.position.set(0,.41,-.15);back.rotation.x=-.16;seat.add(back);
  const shell=part(back,'carbon shell with two harness openings',new T.ExtrudeGeometry(outline(),{depth:.025,steps:1,bevelEnabled:true,bevelSize:.009,bevelThickness:.008,bevelSegments:3,curveSegments:20}),carbon);
  const upholstery=part(back,'black padded upper back',new T.ExtrudeGeometry(outline(),{depth:.020,steps:1,bevelEnabled:true,bevelSize:.008,bevelThickness:.010,bevelSegments:3,curveSegments:20}),black);upholstery.position.z=.034;upholstery.scale.set(.965,.982,1);
  for(const [y,h] of [[.105,.135],[.265,.135]]){const cushion=part(back,'red lower back cushion',loft([{y:y-h/2,w:.157,d:.010,z:.075},{y:y-h/2+.016,w:.162,d:.024,z:.080},{y:y+h/2-.016,w:.153,d:.027,z:.082},{y:y+h/2,w:.148,d:.010,z:.075}]),red);}
  const badge=part(back,'Nismo embroidery',new T.PlaneGeometry(.153,.038),label);badge.position.set(0,.48,.072);
  for(const side of [-1,1]){
   curvedPart(back,'sculpted side bolster',[[side*.193,.045,.07],[side*.21,.21,.096],[side*.225,.39,.12],[side*.247,.52,.075]],[.033,.047,.038,.009],black,.8);
   curvedPart(back,'contrast piping',[[side*.21,.04,.09],[side*.238,.25,.097],[side*.264,.51,.083],[side*.194,.65,.061]],[.002,.002,.002,.002],edge);
   const rail=part(seat,'seat rail',new T.BoxGeometry(.027,.04,.47),steel);rail.position.set(side*.16,.34,.035);
  }
  const base=part(seat,'carbon seat base',loft([{y:.34,w:.19,d:.225,z:.035},{y:.36,w:.218,d:.25,z:.035},{y:.39,w:.219,d:.25,z:.035},{y:.405,w:.197,d:.23,z:.035}]),carbon);
  const pad=part(seat,'red seat cushion',loft([{y:.395,w:.175,d:.220,z:.038},{y:.416,w:.180,d:.223,z:.04},{y:.444,w:.173,d:.21,z:.045},{y:.449,w:.163,d:.199,z:.045}]),red);
  for(const side of [-1,1])curvedPart(seat,'raised thigh bolster',[[side*.201,.40,-.135],[side*.216,.456,.015],[side*.213,.456,.185],[side*.19,.42,.255]],[.025,.030,.034,.010],black,1.2);
 }
 return group;
}
