import * as T from './vendor/three.module.js';

// Shaped cross-sections give clothing a chest, waist, folds, and a hem rather
// than stretching a sphere. All measurements use the car's metre scale.
export function loft(rings,segments=32){
 const pos=[],uv=[],idx=[];
 for(const [j,r] of rings.entries())for(let i=0;i<=segments;i++){
  const a=i/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a),fold=1+(r.fold||0)*Math.sin(a*7+j*.8);
  pos.push(Math.sign(c)*Math.abs(c)**.8*r.w*fold,r.y,(r.z||0)+Math.sign(s)*Math.abs(s)**.8*r.d*fold);uv.push(i/segments,j/(rings.length-1));
  if(j<rings.length-1&&i<segments){const k=j*(segments+1)+i;idx.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2);}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
export function clothTexture(){
 const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#acacac';x.fillRect(0,0,128,128);
 for(let y=0;y<128;y+=2)for(let i=0;i<128;i+=2){const v=155+((i*17+y*23)%39);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,y,1,(i+y)%4?1:2);}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(8,8);return t;
}
export function part(parent,name,geometry,material){const m=new T.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function curvedPart(parent,name,points,radii,material,depth=1){
 const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),steps=28,radial=16,frames=path.computeFrenetFrames(steps,false),pos=[],uv=[],idx=[];
 for(let i=0;i<=steps;i++){const t=i/steps,p=path.getPointAt(t),u=t*(radii.length-1),k=Math.min(radii.length-2,Math.floor(u)),r=T.MathUtils.lerp(radii[k],radii[k+1],u-k);
  for(let j=0;j<=radial;j++){const a=j/radial*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*depth);pos.push(v.x,v.y,v.z);uv.push(j/radial,t);if(i<steps&&j<radial){const q=i*(radial+1)+j;idx.push(q,q+1,q+radial+1,q+1,q+radial+2,q+radial+1);}}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return part(parent,name,g,material);
}
function seam(parent,name,points,material,r=.0015){return part(parent,name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,5,false),material);}
function small(parent,name,pos,scale,material){const m=part(parent,name,new T.SphereGeometry(1,16,12),material);m.position.set(...pos);m.scale.set(...scale);return m;}
function hand(parent,name,position,rotation,scale,skin){
 const g=new T.Group();g.name=name;g.position.set(...position);g.rotation.set(...rotation);g.scale.setScalar(scale);parent.add(g);
 // Wrist, flattened palm, four separate articulated fingers, and opposing thumb.
 part(g,'palm',loft([{y:.023,w:.019,d:.013},{y:0,w:.030,d:.015},{y:-.037,w:.034,d:.015},{y:-.057,w:.027,d:.012},{y:-.060,w:.003,d:.004}],20),skin);
 for(let i=0;i<4;i++){const x=(i-1.5)*.016,length=[.044,.057,.053,.039][i];curvedPart(g,'finger '+(i+1),[[x,-.042,0],[x,-.064,.002],[x,-.047-length*.55,.014],[x,-.042-length,.033]],[.010,.009,.008,.003],skin,.85);}
 curvedPart(g,'thumb',[[.027,-.002,0],[.046,-.014,.009],[.043,-.037,.033],[.026,-.044,.039]],[.013,.012,.010,.004],skin,.9);
 return g;
}
function strap(parent,name,points,width,material){
 const p=points.map(v=>new T.Vector3(...v)),pos=[],idx=[];
 p.forEach((v,i)=>{const d=p[Math.min(i+1,p.length-1)].clone().sub(p[Math.max(0,i-1)]).normalize(),n=new T.Vector3(d.y,-d.x,0).normalize().multiplyScalar(width/2);for(const sign of [-1,1])pos.push(v.x+n.x*sign,v.y+n.y*sign,v.z);if(i<p.length-1){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}});
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();return part(parent,name,geo,material);
}
export function createSeatedBody(child=false){
 const group=new T.Group();group.name=child?'Leo complete seated body':'Artin complete seated body';const weave=clothTexture();
 const shirt=new T.MeshStandardMaterial({color:child?'#c4c4b9':'#d8d3c8',roughness:.94,bumpMap:weave,bumpScale:.0012});
 const skin=new T.MeshStandardMaterial({color:child?'#c9a28a':'#bd9278',roughness:.72});
 const pants=new T.MeshStandardMaterial({color:child?'#303944':'#25323d',roughness:.93,bumpMap:weave,bumpScale:.0015});
 const stitch=new T.MeshStandardMaterial({color:'#6b7172',roughness:.95}),hem=new T.MeshStandardMaterial({color:child?'#bdbcb0':'#cbc6bb',roughness:.95});
 const shoe=new T.MeshStandardMaterial({color:'#e7e5dc',roughness:.8}),sole=new T.MeshStandardMaterial({color:'#333b42',roughness:.95});
 const belt=new T.MeshStandardMaterial({color:'#232930',roughness:.9,side:T.DoubleSide}),metal=new T.MeshStandardMaterial({color:'#818891',metalness:.7,roughness:.35});
 const hip=child?.56:.47,shoulder=child?.895:.87,half=child?.16:.18;
 const torso=part(group,'tailored shirt torso',loft([
  {y:hip-.012,w:half*.78,d:.072,z:.025},{y:hip+.01,w:half*.87,d:.079,z:.02,fold:.022},
  {y:hip+.07,w:half*.85,d:.083,z:.012,fold:.035},{y:hip+.15,w:half*.86,d:.088,z:0,fold:.018},
  {y:shoulder-.07,w:half,d:child?.075:.094,z:-.012},{y:shoulder-.025,w:half*.99,d:.070,z:-.01},
  {y:shoulder+.002,w:half*.82,d:.060,z:-.01},{y:shoulder+.038,w:.058,d:.048,z:-.012}
 ]),shirt);
 // Leo's scanned bust already contains his collar and shirt shoulders.
 if(!child){const neck=part(group,'neck',loft([{y:.89,w:.049,d:.043},{y:.938,w:.050,d:.044},{y:.958,w:.054,d:.046}],24),skin);
  const collar=part(group,'ribbed collar',new T.TorusGeometry(.055,.009,8,32),hem);collar.position.set(0,.903,-.012);collar.rotation.x=Math.PI/2;
 }
 const placket=part(group,'shirt button placket',new T.BoxGeometry(.013,.095,.002),hem);placket.position.set(0,shoulder-.065,.087);
 for(let i=0;i<3;i++)small(group,'shirt button',[0,shoulder-.04-i*.033,.092],[.0024,.0024,.0012],shoe);
 seam(group,'shirt hem',[[-half*.79,hip+.014,.065],[0,hip+.012,.104],[half*.79,hip+.014,.065]],hem);
 // Hips join two individually shaped thighs, knees, calves, and cuffs.
 const hips=part(group,'trouser waist',loft([{y:hip-.07,w:half*.86,d:.088,z:.052},{y:hip-.015,w:half*.88,d:.087,z:.035},{y:hip+.018,w:half*.77,d:.069,z:.023}]),pants);
 for(const side of [-1,1]){
  const x=side*(child?.069:.093),knee=[side*(child?.088:.12),child?.51:.43,child?.28:.44],ankle=[side*(child?.09:.12),child?.30:.16,child?.37:.71];
  curvedPart(group,(side<0?'left':'right')+' trouser leg',[[x,hip-.035,.05],[x,hip-.033,child?.17:.26],knee,[ankle[0],ankle[1]+.065,ankle[2]-.025],ankle],child?[.065,.061,.050,.038,.035]:[.083,.078,.066,.045,.039],pants,1.04);
  seam(group,'trouser side seam',[[x+side*.067,hip-.025,.09],[knee[0]+side*.053,knee[1]+.01,knee[2]],[ankle[0]+side*.035,ankle[1],ankle[2]]],stitch);
  for(let j=0;j<3;j++)seam(group,'knee fabric crease',[[knee[0]-.043,knee[1]+.018+j*.015,knee[2]-.038],[knee[0],knee[1]+.027+j*.014,knee[2]-.025],[knee[0]+.04,knee[1]+.02+j*.013,knee[2]-.041]],stitch,.0009);
  const shoeGroup=new T.Group();shoeGroup.name=(side<0?'left':'right')+' sneaker';shoeGroup.position.set(ankle[0],ankle[1]-.034,ankle[2]+.035);shoeGroup.scale.setScalar(child?.78:1);group.add(shoeGroup);
  const upper=part(shoeGroup,'shaped sneaker upper',loft([{y:-.025,w:.043,d:.090,z:.024},{y:0,w:.045,d:.092,z:.027},{y:.022,w:.039,d:.071,z:.015},{y:.046,w:.025,d:.039,z:-.019},{y:.052,w:.014,d:.023,z:-.023}],24),shoe);
  const rubber=part(shoeGroup,'rubber sole',loft([{y:-.04,w:.041,d:.087,z:.024},{y:-.033,w:.047,d:.096,z:.024},{y:-.023,w:.047,d:.096,z:.024}],24),sole);
  for(let j=0;j<4;j++)seam(shoeGroup,'shoelace',[[-.026,.025+j*.003,.045-j*.014],[0,.036+j*.003,.041-j*.014],[.026,.025+j*.003,.038-j*.014]],shoe,.002);
  const sh=[side*half*.86,shoulder-.03,.005],el=child?[side*.19,.67,.17]:[side*.225,.69,.26],wrist=child?[side*.112,.62,.31]:[side*.145+.028,.81,.535];
  const cuff=[sh[0]*.65+el[0]*.35,sh[1]*.65+el[1]*.35,sh[2]*.65+el[2]*.35];
  curvedPart(group,(side<0?'left':'right')+' fitted sleeve',[sh,[(sh[0]+cuff[0])/2,(sh[1]+cuff[1])/2,(sh[2]+cuff[2])/2],cuff],child?[.058,.059,.050]:[.069,.071,.057],shirt,.92);
  curvedPart(group,(side<0?'left':'right')+' shaped arm',[cuff,el,[(el[0]+wrist[0])*.5,(el[1]+wrist[1])*.5,(el[2]+wrist[2])*.5],wrist],child?[.035,.032,.029,.021]:[.044,.042,.038,.025],skin,.88);
  hand(group,(side<0?'left':'right')+' hand with five fingers',wrist,child?[-Math.PI*.35,0,side*.10]:[-.20,side*.38,side*.28],child?.72:.92,skin);
 }
 // Proper flat webbing with shoulder and lap runs, plus a visible buckle.
 const outer=child?1:-1;
 strap(group,'shoulder seat belt',[[outer*(half+.03),shoulder+.03,-.015],[outer*half*.45,shoulder-.10,.105],[-outer*half*.65,hip+.015,.12]],.037,belt);
 strap(group,'lap seat belt',[[-half*.95,hip-.02,.13],[0,hip-.03,.155],[half*.95,hip-.02,.13]],.034,belt);
 const buckle=part(group,'seat belt buckle',new T.BoxGeometry(.036,.042,.018),metal);buckle.position.set(-outer*half*.7,hip,.125);small(group,'buckle release',[buckle.position.x,hip,.137],[.011,.012,.003],new T.MeshStandardMaterial({color:'#a31526'}));
 return {group,torso,update(time){torso.scale.z=1+Math.sin(time*1.6)*.006;}};
}
