import * as T from './vendor/three.module.js';
import {scannedMaterial} from './realism.js';
import {BLUEPRINT_LAYOUT} from './town-blueprint-layout.js';
export const ESTATE_STYLES={
 capeCodEstate:{name:'Westchester Cape Cod estate',wall:'#d9ddd5',roof:'#777a73',form:'capeCod'},
 spanishEstate:{name:'Spanish courtyard estate',wall:'#e8ddc6',roof:'#a66040',form:'spanish'},
 missionEstate:{name:'California Mission mansion',wall:'#f2e8cf',roof:'#b3744c',form:'mission'},
 haciendaEstate:{name:'Hacienda with an arcade',wall:'#dfc6a0',roof:'#994f34',form:'hacienda'},
 santaBarbaraEstate:{name:'Santa Barbara villa',wall:'#f2eadc',roof:'#b76e49',form:'spanish',tower:true},
 tudorEstate:{name:'English Tudor mansion',wall:'#e0d4bd',roof:'#716954',form:'tudor'},
 frenchEstate:{name:'French country chateau',wall:'#d8c7a6',roof:'#727166',form:'french'},
 colonialEstate:{name:'Colonial revival estate',wall:'#d6d1bb',roof:'#625e55',form:'colonial'},
 contemporaryEstate:{name:'1980s hillside contemporary',wall:'#ddd2bf',roof:'#807666',form:'contemporary'},
 allentownHome:{name:'20171 Allentown Dr',wall:'#e4dfd1',roof:'#716b60',form:'ranch',note:'3,671 sq ft, built in 1961. Exterior massing follows the public floor plan and aerial photos: broad front, rear wing, bay windows, solar garage roof, and pool garden. Game scale is approximate.'},
 chatsboroHome:{name:'20536 Chatsboro Dr',wall:'#e1dac7',roof:'#877f62',form:'chatsboro',note:'6,362 sq ft, built in 1988. Exterior inspired by the public listing photograph: brick, cream gables, steep roofs, turret, and garage wing. Game proportions are approximate.'}
};
export const TOWN_CATALOG=[
...Object.entries(ESTATE_STYLES).map(([id,d])=>({id,name:d.name,category:id.endsWith('Home')?'Leo’s homes':'Mansions',r:3.2,solid:true,note:d.note||'Woodland Hills estate architecture, with landscaped grounds and detailed exterior materials.'})),
{id:'warnerTowers',name:'Douglas Emmett: Warner Center Towers',category:'Landmarks',r:5.8,solid:true,note:'Five reflective glass towers and a landscaped plaza, inspired by the Warner Center campus.'},
{id:'modernEstate',name:'Modern glass estate',category:'Mansions',r:2.8,solid:true,note:'Contemporary modern: floating roof planes, broad glazing, stone, and a pool terrace.'},
{id:'midcenturyEstate',name:'Mid-century pavilion',category:'Mansions',r:2.7,solid:true,note:'Mid-century inspired: low horizontal rooms, a butterfly roof, warm wood, and indoor-outdoor living.'},
{id:'georgianEstate',name:'Georgian manor',category:'Mansions',r:2.6,solid:true,note:'Georgian inspired: a balanced facade, paired chimneys, sash windows, and a central portico.'},
{id:'mediterraneanEstate',name:'Mediterranean villa',category:'Mansions',r:2.7,solid:true,note:'Mediterranean Revival inspired: pale stucco, clay roof tiles, arches, and a shaded courtyard.'},
{id:'school',name:'Chillion community school',category:'City',r:5,solid:true,note:'Classroom wings, a shaded entry, and an outdoor play court.'},
{id:'mall',name:'Chillion shopping mall',category:'City',r:6,solid:true,note:'A shopping center with storefronts, glass entrances, and an outdoor plaza.'},
{id:'library',name:'Community library',category:'City',r:3,solid:true,note:'A public place to read, learn, and explore.'},
{id:'supermarket',name:'Fresh food supermarket',category:'City',r:3.5,solid:true,note:'A larger market for groceries and everyday supplies.'},
{id:'bank',name:'Neighborhood bank',category:'City',r:1.6,solid:true,note:'A place to talk about saving. Your piggy bank still holds all your pretend bucks.'},
{id:'restaurant',name:'Garden restaurant',category:'City',r:1.6,solid:true,note:'A restaurant serves meals. Work, supplies, and customers all matter.'},
{id:'apartments',name:'Terrace apartments',category:'City',r:1.6,solid:true,note:'Several homes share one building and outdoor spaces.'},
{id:'skyscraper',name:'Sky garden tower',category:'City',r:1.6,solid:true,note:'A tall glass tower with planted terraces and a public plaza.'},
{id:'store',name:'Corner market',category:'City',r:1.5,solid:true,note:'A neighborhood shop. Saving helps us choose what to buy.'},
{id:'townRow',name:'Brick row houses',category:'Homes',r:1.9,solid:true},
{id:'ranch',name:'Garden ranch house',category:'Homes',r:1.9,solid:true},
{id:'roadStraight',name:'Straight road',category:'Streets',r:1.5,road:true},
{id:'roadCorner',name:'Road corner',category:'Streets',r:1.5,road:true},
{id:'roadCross',name:'Crossroads',category:'Streets',r:1.5,road:true},
{id:'sidewalk',name:'Town sidewalk',category:'Streets',r:.6},
{id:'sportscar',name:'Electric sport coupe',category:'Cars',r:.7,vehicle:true},
{id:'classiccar',name:'Vintage cruiser',category:'Cars',r:.8,vehicle:true},
{id:'familycar',name:'Family wagon',category:'Cars',r:.8,vehicle:true},
{id:'cityPark',name:'Neighborhood park',category:'Parks',r:2},
{id:'playground',name:'Adventure playground',category:'Parks',r:1.8}
].map(d=>({...d,world:'town',price:0}));
const defs=Object.fromEntries(TOWN_CATALOG.map(d=>[d.id,d])),templates=new Map(),mats=new Map();
function material(color,type='plain'){const key=color+type;if(mats.has(key))return mats.get(key);if(typeof document.createElementNS==='function'&&['brick','roof'].includes(type)){const m=scannedMaterial(type==='brick'?'red_brick':'roof_slates_02',[1,1],type==='brick'?'#dbcbc1':'#'+new T.Color(color).lerp(new T.Color('#ffffff'),.3).getHexString());m.normalScale.set(.65,.65);mats.set(key,m);return m;}const m=new T.MeshStandardMaterial({color,roughness:type==='glass'?.18:.78,metalness:type==='glass'?.45:.03});if(type==='glass'){m.roughness=.12;m.metalness=.7;m.envMapIntensity=1.4;}if(['stone','brick','wood','stucco','roof'].includes(type)){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#dad4c7';ctx.fillRect(0,0,128,128);for(let i=0;i<2000;i++){ctx.fillStyle=i%2?'#ffffff15':'#00000012';ctx.fillRect((i*43.13)%128,(i*17.37)%128,1,type==='wood'?12:1);}if(type==='brick'){ctx.strokeStyle='#eee5d580';ctx.lineWidth=1;for(let y=0;y<128;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(128,y);ctx.stroke();for(let x=(y/16)%2?16:0;x<128;x+=32){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+16);ctx.stroke();}}}if(type==='roof'){ctx.fillStyle='#9f9f96';ctx.fillRect(0,0,128,128);for(let row=0;row<10;row++){for(let col=-1;col<8;col++){const v=135+((row*43+col*31+311)%43);ctx.fillStyle='rgb('+v+','+v+','+(v-5)+')';ctx.fillRect(col*19+(row%2)*9,row*13,18,11);ctx.fillStyle='#00000028';ctx.fillRect(col*19+(row%2)*9,row*13+10,18,2);}}}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;m.map=tex;m.bumpMap=tex;m.bumpScale=type==='stucco'?.015:.035;tex.anisotropy=8;}m.userData.shared=true;mats.set(key,m);return m;}
function box(g,c,x,y,z,w,h,d,type='plain'){const geo=new T.BoxGeometry(w,h,d);if(['brick','stone','wood','roof','stucco'].includes(type)){const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv,scale=type==='brick'?1.5:type==='roof'?1.2:1;for(let i=0;i<p.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,(nx>.5?p.getZ(i):p.getX(i))*scale,(ny>.5?p.getZ(i):p.getY(i))*scale);}}const m=new T.Mesh(geo,material(c,type));m.position.set(x,y,z);g.add(m);return m;}
function cylinder(g,c,x,y,z,r,h,top=r){const m=new T.Mesh(new T.CylinderGeometry(top,r,h,16),material(c));m.position.set(x,y,z);g.add(m);return m;}
function sphere(g,c,x,y,z,sx,sy=sx,sz=sx){const m=new T.Mesh(new T.SphereGeometry(1,12,8),material(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);g.add(m);return m;}
function window(g,x,y,z,w=.55,h=.8,sash=false){
 // Recessed dark backing, reflective glazing, and separate jambs remain legible close up.
 box(g,'#222c29',x,y,z,w+.075,h+.075,.025);box(g,'#647b78',x,y,z+.021,w,h,.012,'glass');
 for(const side of [-1,1]){box(g,'#d8d6cb',x+side*(w/2+.022),y,z+.055,.044,h+.08,.085);box(g,'#d8d6cb',x,y+side*(h/2+.018),z+.055,w+.08,.036,.085);}
 box(g,'#d1d0c4',x,y,z+.068,.021,h,.025);if(sash){box(g,'#d1d0c4',x,y,z+.068,w,.021,.025);for(const side of [-1,1])box(g,'#d1d0c4',x+side*w*.25,y,z+.068,.014,h,.019);}
 box(g,'#e2dece',x,y-h/2-.045,z+.06,w+.15,.06,.17);
}
function hedge(g,x,z,w=1){
 // Irregular clipped foliage, with individual leaf silhouettes instead of rows of spheres.
 for(let i=0;i<Math.ceil(w*5);i++){const shrub=new T.Mesh(new T.IcosahedronGeometry(1,1),material(i%2?'#385333':'#425e39'));shrub.position.set(x-w/2+(i+.5)/Math.ceil(w*5)*w,.24+Math.sin(i*4+x)*.018,z);shrub.scale.set(.16,.22,.18);g.add(shrub);}
 for(let i=0;i<Math.ceil(w*70);i++){const a=i*2.39996,u=(i*.618033)%1,px=x+(u-.5)*w,py=.23+Math.sin(a)*.20,pz=z+Math.cos(a)*.18;const sh=new T.Shape();sh.moveTo(0,-.055);sh.quadraticCurveTo(.045,0,0,.055);sh.quadraticCurveTo(-.045,0,0,-.055);const leaf=new T.Mesh(new T.ShapeGeometry(sh,2),material(i%3?'#4a663e':'#667b4e'));leaf.material.side=T.DoubleSide;leaf.position.set(px,py,pz);leaf.rotation.set(a*.6,a,Math.sin(i)*.6);g.add(leaf);}
}
function pool(g,x,z,w,d){box(g,'#c6c6b6',x,.045,z,w+.24,.1,d+.24,'stone');box(g,'#286f78',x,.104,z,w,.035,d,'glass');for(let i=0;i<6;i++)box(g,'#abd7d5',x-w*.45+i*w*.16,.124,z,.012,.002,d*.85);}
function pergola(g,x,z,w,d){for(const a of [-1,1])for(const b of [-1,1])box(g,'#8d7658',x+a*w/2,1,z+b*d/2,.07,2,.07,'wood');for(let i=0;i<12;i++)box(g,'#9b8261',x-w/2+i*w/11,2,z,.065,.08,d+.2,'wood');}
function hipRoof(g,x,y,z,w,d,h,color){const geo=new T.CylinderGeometry(.65,1,h,4,1);const m=new T.Mesh(geo,material(color,'roof'));m.rotation.y=Math.PI/4;m.scale.set(w/1.414,1,d/1.414);m.position.set(x,y,z);g.add(m);return m;}
function arch(g,x,y,z,w,h,color){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(-w/2,h);shape.lineTo(w/2,h);shape.lineTo(w/2,0);shape.lineTo(w/2-.13,0);shape.lineTo(w/2-.13,h-w/2);shape.absarc(0,h-w/2,w/2-.13,0,Math.PI,false);shape.lineTo(-w/2+.13,0);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false,curveSegments:12});const m=new T.Mesh(geo,material(color,'stucco'));m.position.set(x,y,z);g.add(m);}
function label(g,text,x,y,z,w=2){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#204a3d';ctx.fillRect(0,0,512,128);ctx.fillStyle='#efe8cb';ctx.font='bold 56px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,85);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mat=new T.MeshStandardMaterial({map:tex,roughness:.8});mat.userData.shared=true;const m=new T.Mesh(new T.PlaneGeometry(w,w/4),mat);m.position.set(x,y,z);g.add(m);}
function mansion(g,id){box(g,'#c2b9a1',0,.025,0,5.8,.08,4.8,'stone');
 if(id==='modernEstate'){
  box(g,'#deded0',-.7,1.1,-.55,3.8,2.1,2.8,'stone');box(g,'#6a726a',-.7,1.1,.88,3.55,1.75,.08,'glass');for(let i=0;i<6;i++)box(g,'#323d38',-2.3+i*.62,1.1,.95,.035,1.8,.06);box(g,'#e4e1d5',-.7,2.2,-.45,4.4,.16,3.35,'stone');
  box(g,'#f0eee3',1.3,2.5,-.5,2.2,1.1,2.4,'stucco');box(g,'#46645c',1.3,2.5,.73,1.95,.9,.045,'glass');box(g,'#e0ded0',1.3,3.12,-.4,2.55,.14,2.75,'stone');for(let i=0;i<16;i++)box(g,'#947c5c',2.48,1.65,-1.45+i*.12,.055,2.8,.045,'wood');
  box(g,'#d5ccb8',-.7,.28,.95,2.9,.32,.13);pool(g,-1.1,1.7,2.7,1);pergola(g,1.8,1.2,1.1,1.4);hedge(g,-2.65,-.4,.35);
 }else if(id==='midcenturyEstate'){
  box(g,'#d4c9b0',0,.72,-.3,4.9,1.35,2.6,'stucco');box(g,'#41666a',0,.8,1.03,4.2,1.13,.07,'glass');for(let i=0;i<7;i++)box(g,'#5b493a',-2+i*.66,.8,1.08,.035,1.2,.035,'wood');for(const x of [-1.35,1.35]){const r=box(g,'#817d6b',x,1.63,-.35,2.85,.12,3.1);r.rotation.z=Math.sign(x)*.13;}box(g,'#9f7257',-1.55,1.3,-.6,.5,2.5,.7,'brick');box(g,'#544937',-1.55,2.6,-.6,.62,.08,.82);pool(g,.4,1.85,2.7,.8);for(let i=0;i<7;i++)box(g,'#bdbaa8',2.65,.025,-1.5+i*.55,.35,.04,.32);hedge(g,-2.45,1.8,.65);
 }else if(id==='georgianEstate'){
  box(g,'#b5a184',0,1.35,-.3,4.7,2.65,2.8,'brick');hipRoof(g,0,3.02,-.3,5.1,3.2,.65,'#585f58');for(const x of [-1.85,1.85])box(g,'#a48d72',x,3.25,-.5,.36,.9,.55,'brick');for(const y of [.75,2.03])for(const x of [-1.75,-.86,0,.86,1.75]){if(y<1&&x===0)continue;window(g,x,y,1.13,.5,.86,true);}box(g,'#e1d8be',0,1.41,1.65,1.5,.13,1.1);for(const x of [-.6,.6]){cylinder(g,'#ddd8c7',x,.72,1.9,.085,1.35);box(g,'#ddd8c7',x,.08,1.9,.25,.12,.25);}hipRoof(g,0,1.64,1.65,1.7,1.25,.4,'#b0aa93');box(g,'#344f43',0,.6,1.16,.51,1.16,.08);for(let i=0;i<3;i++)box(g,'#d7d0bd',0,.04+i*.06,2.1-i*.12,1.2-i*.1,.1,.5);hedge(g,-1.8,1.65,1.3);hedge(g,1.8,1.65,1.3);
 }else{
  box(g,'#d9c6a5',0,1.05,-.6,4.9,2.05,2.1,'stucco');hipRoof(g,0,2.38,-.6,5.3,2.5,.7,'#ad6d4c');for(let i=0;i<25;i++){const a=box(g,i%2?'#b47b55':'#a56849',-2.45+i*.205,2.43,.18,.11,.07,1.1);a.rotation.x=.38;}
  for(const x of [-1.6,-.53,.53,1.6])arch(g,x,.1,1.22,.95,1.68,'#e2d0af');box(g,'#c4b291',0,1.8,1.32,4.65,.12,.8,'stone');for(const x of [-1.6,-.55,.55,1.6])window(g,x,1.23,.48,.5,.75);cylinder(g,'#c9bea1',0,.22,1.88,.48,.18);cylinder(g,'#82aead',0,.33,1.88,.4,.02);cylinder(g,'#d7ccb5',0,.56,1.88,.08,.5);hedge(g,-2.5,1.25,.4);hedge(g,2.5,1.25,.4);
 }
}
// Pitched, closed roofs and repeated details remain true geometry from every view.
function gable(g,x,y,z,w,d,h,c,infill='#d9d2bf',infillType='stucco'){const sh=new T.Shape();sh.moveTo(-w/2,0);sh.lineTo(w/2,0);sh.lineTo(0,h);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);const m=new T.Mesh(geo,material(infill,infillType));m.position.set(x,y,z);g.add(m);for(const side of [-1,1]){const slope=box(g,c,x+side*w/4,y+h/2,z,Math.hypot(w/2,h),.055,d+.08,'roof');slope.rotation.z=-side*Math.atan2(h,w/2);const fascia=box(g,'#c8c1ae',x+side*w/4,y+h/2-.035,z+d/2+.052,Math.hypot(w/2,h)+.03,.065,.055);fascia.rotation.z=slope.rotation.z;box(g,'#a8a28e',x+side*w/2,y-.035,z,.045,.065,d+.13);}return m;}
function rail(g,x,y,z,w){for(let i=0;i<=12;i++)box(g,'#373b34',x-w/2+i*w/12,y,z,.022,.45,.022);box(g,'#373b34',x,y+.23,z,w,.035,.035);box(g,'#373b34',x,y-.2,z,w,.025,.025);}
function garage(g,x,z,w=1.4){box(g,'#544c3c',x,.62,z,w,1.1,.06,'wood');for(let i=0;i<6;i++)box(g,'#9a8c70',x,.15+i*.18,z+.04,w,.016,.025);}
function estate(g,id){const d=ESTATE_STYLES[id],spanish=['spanish','mission','hacienda'].includes(d.form),ranch=d.form==='ranch'||d.form==='hacienda',h=ranch?1.45:2.75;
 box(g,'#8a9a6a',0,-.04,0,6.6,.1,5.7);box(g,'#d2c5ae',0,.02,1.45,5.9,.07,2.65,'stone');
 box(g,d.wall,0,h/2,-.65,4.7,h,2.5,'stucco');
 if(d.form==='capeCod'){gable(g,0,h,-.65,5.1,2.9,1.05,d.roof);for(const x of [-1.6,0,1.6]){box(g,'#e8e6da',x,h+.3,.53,.72,.75,.65,'wood');gable(g,x,h+.66,.53,.91,.85,.42,d.roof);window(g,x,h+.34,.89,.4,.52,true);}for(const x of [-1.75,-.9,.9,1.75])for(const side of [-1,1])box(g,'#4f625b',x+side*.31,2.08,.64,.1,.76,.045,'wood');}
 else if(d.form==='contemporary'){for(const x of [-1.25,1.25]){const roof=box(g,d.roof,x,h+.16,-.65,2.7,.12,2.9,'wood');roof.rotation.z=x>0?-.18:.18;}box(g,'#a48c71',1.6,1.45,-.7,.45,3.2,.65,'stone');}
 else gable(g,0,h,-.65,5.1,2.9,ranch?.6:spanish?.72:1.2,d.roof);
 // Side elevations, including the rear, are finished rather than blank boxes.
 for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const wall=new T.Group();const side=Math.abs(Math.sin(angle))>.5;const span=side?2.35:4.45;for(const y of ranch?[.83]:[.85,2.08])for(let i=0;i<(side?2:5);i++){if(angle===0&&i===2&&y<1)continue;window(wall,-span/2+.45+i*(span-.9)/(side?1:4),y,side?2.36:1.26,.48,.72,!spanish);}wall.rotation.y=angle;wall.position.z=-.65;g.add(wall);}
 box(g,'#493c2c',0,.69,.645,.6,1.3,.07,'wood');sphere(g,'#be9c5a',.19,.65,.7,.03,.03,.025);
 if(spanish){
  for(const x of [-1.6,-.8,0,.8,1.6])arch(g,x,.06,1.45,.76,1.55,d.wall);
  box(g,d.wall,0,1.67,1.45,4.45,.13,1.35,'stucco');
  if(!ranch)rail(g,0,1.96,2.09,4.4);
  // Barrel-tile ridges along both roof faces.
  for(let i=0;i<36;i++)for(const side of [-1,1]){const tile=cylinder(g,i%3?'#b17650':'#9d5d3d',-2.48+i*.142,h+.36,-.65+side*.68,.035,1.52);tile.rotation.x=side*Math.PI/2-side*Math.atan2(.72,1.45);}
  if(d.form==='mission'){box(g,d.wall,0,h+.25,.82,1.4,.85,.2,'stucco');sphere(g,d.wall,0,h+.72,.82,.7,.45,.1);sphere(g,'#665749',0,h+.5,.94,.17,.2,.02);}
  if(d.tower){cylinder(g,d.wall,1.95,1.8,-.6,.65,3.6);const cone=new T.Mesh(new T.ConeGeometry(.85,.85,24),material(d.roof));cone.position.set(1.95,4.02,-.6);g.add(cone);}
 }else if(['tudor','chatsboro','french'].includes(d.form)){
  for(const x of [-1.7,1.7]){box(g,d.wall,x,h/2,.45,1.3,h,1.1,'stucco');gable(g,x,h,.55,1.55,1.4,1.2,d.roof);window(g,x,2.13,1.03,.64,.86,true);if(d.form!=='french'){box(g,'#554532',x,h+.5,1.27,.055,1,.04,'wood');box(g,'#554532',x,h+.05,1.27,1.3,.06,.04);}}
  box(g,'#9b7055',0,.65,.65,4.7,1.3,.04,'brick');for(const x of [-1.7,1.7])window(g,x,.75,.7,.64,.7,true);
  cylinder(g,d.wall,-.63,1.7,.85,.49,3.4);const roof=new T.Mesh(new T.ConeGeometry(.67,1.55,8),material(d.roof,'stone'));roof.position.set(-.63,4.17,.85);g.add(roof);window(g,-.63,2.35,1.36,.35,.65,true);
  if(d.form==='chatsboro'){box(g,'#a37860',-2.25,.8,1,1.5,1.6,2.1,'brick');gable(g,-2.25,1.6,1,1.7,2.35,.9,d.roof);garage(g,-2.25,2.07,1.35);}
 }else if(d.form==='colonial'){for(const x of [-1.2,-.4,.4,1.2]){cylinder(g,'#e9e4d3',x,1.4,1.2,.075,2.8);box(g,'#e9e4d3',x,.13,1.2,.24,.18,.24);}gable(g,0,2.8,1.05,3,1,.7,d.roof);}
 if(ranch){box(g,d.wall,-1.8,.7,1.05,1.55,1.4,1.4,'stucco');gable(g,-1.8,1.4,1.05,1.8,1.65,.48,d.roof);garage(g,-1.8,1.77,1.25);pool(g,1.65,1.7,1.55,1.1);}
 else if(!spanish){pool(g,1.65,-2.28,1.65,.55);}
 // Masonry chimney, stepped entry, lanterns, and planted perimeter.
 box(g,spanish?d.wall:'#9b7b61',1.6,h+.32,-1.25,.38,1.25,.48,'brick');box(g,'#6f6859',1.6,h+.97,-1.25,.48,.07,.58);
 for(let i=0;i<3;i++)box(g,'#d3c9b6',0,.035+i*.045,2.25-i*.2,1.2-i*.12,.08,.5,'stone');
 for(const x of [-.5,.5]){box(g,'#453e31',x,.97,.75,.08,.18,.08);box(g,'#f1dba0',x,.97,.8,.055,.12,.018);}
 for(const x of [-3.05,3.05])for(let i=0;i<9;i++)hedge(g,x,-2.45+i*.57,.48);
 for(const x of [-2.1,2.1])hedge(g,x,2.48,1.2);
 if(id.endsWith('Home'))label(g,id==='allentownHome'?'20171 ALLENTOWN':'20536 CHATSBORO',0,.29,2.78,2.3);
}
// Exterior massing traced from the public floor-plan and aerial, with no invented room dimensions.
function chatsboro(g){const cream='#ded7c5',roof='#777261',brick='#996d54';
 box(g,'#8a9a6a',0,-.04,0,7.6,.08,6.4);box(g,'#c2bbab',0,.02,1.9,7,.05,2.45,'stone');
 // An offset, two-level garage wing and taller entrance mass follow the front photograph.
 box(g,cream,-1.8,1.18,.15,3.5,2.36,2.8,'stucco');const garageRoof=new T.Group();gable(garageRoof,0,2.36,0,3.05,3.8,1.05,roof);garageRoof.userData.blueprintStage='roof';garageRoof.rotation.y=Math.PI/2;garageRoof.position.set(-1.8,0,.15);g.add(garageRoof);
 box(g,brick,-1.8,.62,1.57,3.5,1.24,.10,'brick');for(const x of [-2.65,-1.05])garage(g,x,1.66,1.4);for(const x of [-2.95,-1.8,-.65]){box(g,cream,x,2.66,1.38,.78,.7,.72,'stucco');gable(g,x,3.01,1.38,.96,.95,.55,roof);window(g,x,2.7,1.76,.48,.56,true);}
 box(g,brick,1.18,1.36,-.2,2.9,2.72,3.1,'brick');gable(g,1.18,2.72,-.2,3.18,3.35,1.42,roof);
 for(const x of [.825,1.895])box(g,brick,x,.75,1.14,.41,1.5,1.05,'brick');box(g,brick,1.36,2.22,1.14,1.48,1.44,1.05,'brick');gable(g,1.36,2.94,1.14,1.73,1.28,1.18,roof,brick,'brick');
 box(g,'#302b22',1.35,.75,1.39,.65,1.46,.04,'wood');for(const x of [1.16,1.54]){box(g,'#51452e',x,.75,1.418,.29,1.38,.025,'wood');window(g,x,1.05,1.445,.20,.61,true);}box(g,'#aa9362',1.35,.66,1.46,.024,.095,.028);window(g,1.35,2.28,1.69,.48,.78,true);
 cylinder(g,brick,-.2,.62,1.09,.51,1.24);cylinder(g,cream,-.2,2.44,1.09,.51,2.4);const cap=new T.Mesh(new T.ConeGeometry(.69,1.43,8),material(roof,'roof'));cap.position.set(-.2,4.32,1.09);g.add(cap);window(g,-.2,2.6,1.62,.32,.66,true);
 for(const x of [-3.2,-2.2,1,2]){const w=new T.Group();for(const y of [.83,2.02])window(w,0,y,0,.55,.72,true);w.position.set(x,0,-1.79);w.rotation.y=Math.PI;g.add(w);}
 for(const x of [2.67,-3.57]){const side=new T.Group();for(const z of [-.9,.1,.85])for(const y of [.83,1.95])window(side,z,y,0,.44,.66,true);side.position.x=x;side.rotation.y=x>0?Math.PI/2:-Math.PI/2;g.add(side);}
 box(g,brick,2.12,3.14,-1.05,.34,1.4,.48,'brick');box(g,'#615d51',2.12,3.88,-1.05,.46,.1,.6);
 for(let i=0;i<3;i++)box(g,'#d2c9b7',1.35,.045+i*.055,2.12-i*.16,1.2,.09,.48,'stone');
 propertyDetails(g,'chatsboro');pool(g,1.7,-2.64,2.25,.7);for(const x of [-3.6,3.6])for(let i=0;i<10;i++)hedge(g,x,-2.65+i*.57,.42);hedge(g,2.8,2.65,1.1);label(g,'20536 CHATSBORO',.15,.27,3.05,2.1);
}
function allentown(g){const wall='#e2e0d8',roof='#656962';box(g,'#8eab70',0,-.04,0,7.4,.08,7.4);box(g,'#bbbdb2',-2.4,.02,2.3,2.35,.05,2.6,'stone');box(g,'#c9c9ba',.15,.025,2.3,.85,.05,2.7,'stone');
 // Broad front bar with the rear bedroom wing forming an L.
 box(g,wall,-1.725,.67,.45,3.25,1.34,2.05,'stucco');box(g,wall,1.925,.67,.45,2.85,1.34,2.05,'stucco');box(g,wall,.2,.67,.1,.6,1.34,1.35,'stucco');box(g,wall,.2,1.24,1.12,.6,.2,.7,'stucco');box(g,wall,2.35,.67,-1.18,1.95,1.34,2.8,'stucco');
 const frontRoof=new T.Group();gable(frontRoof,0,1.34,0,2.35,7.05,.22,roof);frontRoof.userData.blueprintStage='roof';frontRoof.rotation.y=Math.PI/2;frontRoof.position.z=.45;g.add(frontRoof);const wing=new T.Group();gable(wing,0,1.34,0,2.18,3.15,.43,roof);wing.position.set(2.35,0,-1.2);g.add(wing);
 garage(g,-2.45,1.51,1.55);box(g,'#302f2b',.2,.61,.805,.48,1.16,.07);window(g,.2,.75,.85,.22,.54);box(g,'#c4bdad',.2,.045,1.18,.57,.08,.85,'stone');
 // The two projecting bay windows and long shuttered window band are characteristic of the front.
 for(const x of [-1.28,-.55]){box(g,wall,x,.72,1.57,.56,1.04,.29,'stucco');window(g,x,.79,1.74,.46,.62,true);for(const side of [-1,1]){const w=new T.Group();window(w,0,.79,0,.2,.62,true);w.position.set(x+side*.3,0,1.61);w.rotation.y=side*Math.PI/3;g.add(w);}box(g,'#ededdf',x,1.29,1.6,.7,.08,.44);}
 for(let i=0;i<5;i++)window(g,1.1+i*.43,.87,1.51,.35,.45,true);
 for(let i=0;i<4;i++){const panel=box(g,'#344555',-2.95+i*.46,1.59,.98,.43,.018,.79);panel.rotation.x=.13;for(let j=0;j<3;j++)box(g,'#5b6b73',-3.1+i*.46+j*.145,1.66,.98,.008,.008,.7);}
 for(const x of [-1.1,.1]){const w=new T.Group();window(w,0,.8,0,1.05,.86,true);w.position.set(x,0,-.6);w.rotation.y=Math.PI;g.add(w);}
 const poolShape=new T.Shape();poolShape.moveTo(-1.7,-.75);poolShape.lineTo(.85,-.75);poolShape.quadraticCurveTo(1.5,-.6,1.45,.12);poolShape.lineTo(.72,.76);poolShape.lineTo(-1.25,.76);poolShape.quadraticCurveTo(-1.9,.5,-1.7,-.75);const poolGeo=new T.ShapeGeometry(poolShape,24);poolGeo.rotateX(-Math.PI/2);const coping=new T.Mesh(poolGeo.clone(),material('#c9c7b5','stone'));coping.position.set(-.7,.04,-1.8);coping.scale.set(1.12,1,1.2);g.add(coping);const water=new T.Mesh(poolGeo,material('#488e99','glass'));water.position.set(-.7,.07,-1.8);g.add(water);
 for(let i=0;i<3;i++)box(g,'#aaccc5',-.7,.074+i*.01,-1.08-i*.14,.8,.013,.18);
 for(const x of [-3.55,3.55])for(let i=0;i<12;i++)hedge(g,x,-3.2+i*.55,.45);
 for(const x of [-1,1.25])for(let i=0;i<5;i++)hedge(g,x,1.8+i*.36,.23);
 propertyDetails(g,'allentown');box(g,'#dcded2',0,.32,3.65,7.4,.62,.14,'stucco');garage(g,-2.4,3.74,2.05);label(g,'20171 ALLENTOWN',.5,.39,3.74,1.6);
}
function propertyDetails(g,kind){
 const ranch=kind==='allentown',trim=ranch?'#e7e5dc':'#b9af97';
 if(ranch){
  for(let row=0;row<17;row++)box(g,row%2?'#d5d5cb':'#dcdcd2',2.15,.09+row*.07,1.486,2.4,.014,.021);
  for(const x of [-3.32,.65,3.32]){cylinder(g,'#a6aaa0',x,.63,1.53,.021,1.24);box(g,trim,x,1.31,1.55,.085,.075,.1);}
  for(const x of [-.08,.48])box(g,trim,x,.65,1.62,.045,1.3,.07);box(g,trim,.2,1.32,1.62,.75,.09,.35);
  for(const x of [1.1,1.96,2.82])for(let j=0;j<6;j++)box(g,'#d9dccf',x,.65+j*.07,1.57,.74,.011,.012);
  for(const x of [-.5,.5,1.5])box(g,'#85877f',x,1.92,.3,.035,.35,.035);
 }else{
  for(const x of [-3.57,-.3,2.66])cylinder(g,'#7a7567',x,1.3,1.47,.021,2.6);
  for(const x of [-3.1,-1.45])for(let row=0;row<4;row++)for(let col=0;col<4;col++)box(g,'#5f5142',x+col*.28,.22+row*.23,1.715,.24,.17,.015,'wood');
  for(const x of [.85,1.85]){box(g,'#292b25',x,1.08,1.75,.07,.17,.08);box(g,'#dbcba4',x,1.08,1.8,.04,.1,.025);}
  // Leaded panes on the entrance window, visible in the listing reference.
  for(const x of [1.22,1.48])for(const y of [2.02,2.27,2.52]){const lead=box(g,'#aaa994',x,y,1.77,.016,.24,.014);lead.rotation.z=.45;}
 }
 // Low planting beds, paving joints, and small path lights give the approach a human scale.
 for(const side of [-1,1])for(let i=0;i<8;i++){const x=ranch?side*.62:side*3.3,z=1.9+i*.18;for(let j=0;j<3;j++){const leaf=sphere(g,j%2?'#526947':'#687b51',x+Math.sin(i*3+j)*.10,.15+j*.04,z,.055,.14,.035);leaf.rotation.z=Math.sin(i+j)*.7;}if(i%3===0){cylinder(g,'#434a3e',x,.12,z,.016,.2);box(g,'#d9d7bc',x,.23,z,.05,.025,.05);}}
 for(let i=0;i<9;i++)box(g,'#9a9c8e',ranch?.15:0,.053,1.65+i*.17,ranch?.84:6.8,.005,.009);
}
function warner(g){box(g,'#b3b8a7',0,.04,0,11.8,.12,8.5,'stone');
 const glass=material('#9daea8','glass');glass.color.set('#d3dfdc');glass.metalness=.8;glass.roughness=.09;glass.envMapIntensity=2;
 for(const [i,[x,z,h]] of [[-3.7,-1.8,8.4],[0,-2,10],[3.7,-1.5,8.8],[-2.35,2,5.8],[2.15,2,7.4]].entries()){
  const tower=new T.Group();tower.position.set(x,0,z);g.add(tower);
  // Chamfered corners and offset bays capture the campus's faceted silhouette.
  const pts=[[-1.2,-1.1],[.85,-1.1],[1.2,-.75],[1.2,.75],[.85,1.1],[-.85,1.1],[-1.2,.75]];
  const shape=new T.Shape(pts.map(p=>new T.Vector2(...p)));const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});geo.rotateX(-Math.PI/2);const body=new T.Mesh(geo,glass);body.castShadow=body.receiveShadow=true;tower.add(body);
  for(let j=0;j<pts.length;j++){const a=pts[j],b=pts[(j+1)%pts.length],len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);const facade=new T.Group();facade.position.set((a[0]+b[0])/2,0,-(a[1]+b[1])/2);facade.rotation.y=-angle;
   for(let y=.3;y<h;y+=.38)box(facade,'#414f4e',0,y,0,len,.021,.025);
   for(let k=0;k<=Math.ceil(len/.3);k++)box(facade,'#465553',-len/2+k*len/Math.ceil(len/.3),h/2,0,.018,h,.026);
   tower.add(facade);
  }
  box(tower,'#68736b',0,.15,0,2.7,.3,2.5,'stone');box(tower,'#68746f',0,h+.025,0,2.45,.05,2.25);box(tower,'#b3bdb2',0,.9,1.32,1.35,.1,.65);}
 pool(g,0,1.2,1.35,2.5);for(const x of [-5.4,5.4])for(const z of [-3,0,3])hedge(g,x,z,.8);label(g,'WARNER CENTER',0,.55,4.28,4);}
function city(g,id){const tall=id==='skyscraper',apt=id==='apartments',height=tall?7.5:apt?3.8:1.65;box(g,'#c9c6b5',0,.04,0,3.2,.1,3.1,'stone');box(g,tall?'#728a86':apt?'#c6b598':'#cbbf9f',0,height/2,-.25,2.6,height,2.3,tall?'plain':'stucco');
 if(tall){for(let y=.4;y<7.3;y+=.44)for(let x=-1;x<=1.01;x+=.5){window(g,x,y,.93,.4,.34);const side=new T.Group();window(side,x,y,.93,.4,.34);side.rotation.y=Math.PI/2;g.add(side);}box(g,'#647c72',0,7.6,-.25,2.9,.15,2.6);hedge(g,0,1.25,2.5);cylinder(g,'#bec6bb',0,8.1,-.3,.025,1);}
 else if(apt){for(const y of [.7,1.8,2.9])for(const x of [-.75,.75]){window(g,x,y,.94,.65,.78);box(g,'#d2cbb8',x,y-.45,1.2,1.05,.07,.5);for(let j=0;j<6;j++)box(g,'#63756e',x-.5+j*.2,y-.24,1.43,.018,.4,.018);box(g,'#63756e',x,y-.04,1.43,1,.035,.035);}hedge(g,0,-1.55,2.8);}
 else{window(g,-.73,.85,.94,.95,1.1);window(g,.73,.85,.94,.95,1.1);box(g,'#254c43',0,.6,.99,.42,1.2,.06);label(g,id==='bank'?'BANK':id==='restaurant'?'GARDEN CAFE':'MARKET',0,1.5,1.04,2.3);if(id==='bank'){for(const x of [-1.3,1.3])cylinder(g,'#ded9c9',x,.75,1.25,.09,1.5);hipRoof(g,0,1.91,-.15,3,2.8,.42,'#687d70');}else{for(let i=0;i<12;i++)box(g,i%2?'#ece1c8':id==='restaurant'?'#6f8a60':'#bc8965',-1.38+i*.25,1.36,1.45,.25,.07,.9);for(const x of [-.85,.85]){cylinder(g,'#a58f68',x,.4,1.85,.27,.06);cylinder(g,'#687466',x,.2,1.85,.03,.4);}}}
}
function vehicle(g,id){const vintage=id==='classiccar',wagon=id==='familycar',color=vintage?'#914f3b':wagon?'#668270':'#b4bcbc';box(g,color,0,.27,0,1.6,.3,.72);const roof=box(g,color,-.08,.52,0,wagon?1.05:.78,.26,.65);box(g,'#334e50',.28,.54,0,.035,.23,.61,'glass');box(g,'#334e50',-.16,.55,.336,.64,.17,.02,'glass');box(g,'#334e50',-.16,.55,-.336,.64,.17,.02,'glass');for(const x of [-.52,.52])for(const z of [-.38,.38]){const wheel=cylinder(g,'#263330',x,.18,z,.19,.11);wheel.rotation.x=Math.PI/2;const hub=cylinder(g,'#a3aaa4',x,.18,z*1.1,.1,.012);hub.rotation.x=Math.PI/2;}for(const z of [-.23,.23])sphere(g,'#eee4bf',.805,.3,z,.015,.06,.08);box(g,'#bcc1b5',.82,.2,0,.04,.06,.67);if(vintage){box(g,'#c1c1ad',-.5,.48,0,.18,.02,.7);for(const z of [-.29,.29])box(g,'#c4c3ab',.65,.43,z,.32,.02,.035);}}
function road(g,id){box(g,'#777a6b',0,-.015,0,3,.035,3);box(g,'#414c46',0,.012,0,2.35,.022,3);if(id==='roadCross')box(g,'#414c46',0,.014,0,3,.025,2.35);if(id==='roadCorner'){box(g,'#777a6b',0,.04,1.18,3,.03,.65);box(g,'#414c46',.6,.04,0,1.8,.035,2.35);}for(let i=0;i<4;i++){if(id!=='roadCorner'||i<2)box(g,'#e6d9a9',0,.065,-1.2+i*.75,.035,.006,.33);if(id!=='roadStraight')box(g,'#e6d9a9',.55+i*.3,.065,0,.16,.006,.035);}}
// Merge static geometry by material so richly detailed houses remain practical on phones.
function compact(root){root.updateMatrixWorld(true);const buckets=new Map();root.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);let b=buckets.get(o.material);if(!b)buckets.set(o.material,b={p:[],n:[],uv:[]});for(const v of geo.attributes.position.array)b.p.push(v);for(const v of geo.attributes.normal.array)b.n.push(v);for(const v of geo.attributes.uv.array)b.uv.push(v);geo.dispose();o.geometry.dispose();});const result=new T.Group();for(const [m,b] of buckets){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(b.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));geo.userData.shared=true;const mesh=new T.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;result.add(mesh);}return result;}
function civic(g,id){
 const school=id==='school',mall=id==='mall',w=mall?10:school?8:5.4,d=mall?5:school?4:3.4;
 box(g,'#d4cbb9',0,.05,0,w+2,.12,d+3,'stone');box(g,school?'#c9bda5':'#ded9cb',0,1.15,0,w,2.2,d,'stucco');
 box(g,'#687473',0,2.3,0,w+.25,.2,d+.25);for(let x=-w/2+.6;x<w/2;x+=1.2)window(g,x,1.2,d/2+.025,.88,1.3);
 box(g,'#3c6668',0,1,d/2+.08,1.3,1.9,.08);box(g,'#a29a86',0,2.15,d/2+.65,2.8,.16,1.4);
 for(const x of [-1.2,1.2])cylinder(g,'#d2c7b0',x,1,d/2+1,.065,2);
 label(g,school?'CHILLION SCHOOL':mall?'CHILLION MALL':id==='library'?'LIBRARY':'FRESH MARKET',0,2.05,d/2+.17,mall?5:3.2);
 if(school){for(const x of [-3.1,3.1]){box(g,'#bdb099',x,.9,-2.8,1.8,1.8,2,'brick');hipRoof(g,x,1.95,-2.8,2,2.2,.32,'#7c8273');}box(g,'#779381',0,.13,-3.5,3.8,.04,2.5);for(const x of [-1.7,1.7])box(g,'#e9e1c6',x,.16,-3.5,.025,.015,2.2);}
 if(mall){for(const x of [-4,-2,2,4]){box(g,'#a69177',x,1.8,2.95,1.8,.14,1);label(g,x<0?'SHOP':'CAFE',x,1.65,3.03,1.3);}for(const x of [-4.8,4.8]){box(g,'#79905e',x,.25,3.7,1,.4,.6);}}
}
function rawTownModel(id){if(!defs[id])return null;const g=new T.Group();if(['school','mall','library','supermarket'].includes(id))civic(g,id);else if(id==='allentownHome')allentown(g);else if(id==='chatsboroHome')chatsboro(g);else if(ESTATE_STYLES[id])estate(g,id);else if(id==='warnerTowers')warner(g);else if(id.endsWith('Estate'))mansion(g,id);else if(['bank','restaurant','apartments','skyscraper','store'].includes(id))city(g,id);else if(defs[id].vehicle)vehicle(g,id);else if(defs[id].road)road(g,id);else if(id==='sidewalk'){box(g,'#c5c4b4',0,.012,0,1,.05,3,'stone');for(let i=0;i<5;i++)box(g,'#999c8e',0,.04,-1.2+i*.6,1,.005,.014);}else if(id==='townRow'){for(const [i,c] of ['#b48e76','#c4b294','#a17c66'].entries()){const h=new T.Group();box(h,c,0,1,0,1.1,2,1.65,'brick');for(const y of [.62,1.5])window(h,0,y,.85,.53,.55,true);hipRoof(h,0,2.2,0,1.24,1.8,.4,'#60675d');h.position.x=(i-1)*1.15;g.add(h);}}else if(id==='ranch'){box(g,'#c4bc9f',0,.65,0,3.6,1.3,2,'stucco');hipRoof(g,0,1.48,0,3.9,2.3,.38,'#82775e');for(const x of [-1.2,0,1.2])window(g,x,.7,1.03,.75,.65);hedge(g,0,1.4,2.7);}else{box(g,'#7e9860',0,.025,0,3.6,.08,3.6);box(g,'#c8c0a5',0,.08,0,.65,.025,3.6,'stone');for(const x of [-1.2,1.2])hedge(g,x,-1.1,1);if(id==='cityPark'){pool(g,0,0,1.1,1.1);for(const x of [-1.2,1.2]){box(g,'#9d855f',x,.4,.7,.6,.08,.28);box(g,'#61765f',x,.2,.7,.08,.4,.28);}}else{for(const x of [-1,1])box(g,'#8c7959',x,.9,0,.08,1.8,.08);box(g,'#8c7959',0,1.8,0,2.2,.08,.08);for(const x of [-.4,.4]){cylinder(g,'#788277',x,1.12,0,.016,1.3);box(g,'#d1a864',x,.5,0,.48,.07,.25);}hipRoof(g,1.1,1.2,1,1.1,1.1,.4,'#668769');}}
return g;}
export function townModel(id){if(!defs[id])return null;if(!templates.has(id))templates.set(id,compact(rawTownModel(id)));return templates.get(id).clone();}


const blueprintCache=new Map();
export function hasBlueprint(id){return !!(defs[id]?.solid&&!defs[id]?.vehicle);}
// Group the actual model's geometry into reusable construction assemblies. No image substitutes.
export function townBlueprint(id){if(!hasBlueprint(id))return null;if(blueprintCache.has(id))return blueprintCache.get(id);const raw=rawTownModel(id),groups=new Map();raw.updateMatrixWorld(true);
 for(const child of [...raw.children]){const b=new T.Box3().setFromObject(child),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3());let stage='details';
  if(b.max.y<.16)stage='foundation';
  else if(child.isGroup)stage='windows';
  else if(child.material?.color){const c=child.material.color;if(c.g>c.r*1.13&&c.g>c.b*1.08)stage='garden';else if(child.material.metalness>.3)stage='windows';else if(size.y>.7&&size.x>.65&&size.z>.65)stage='walls';else if(b.min.y>1.5)stage='roof';}
  if(child.geometry?.type==='ExtrudeGeometry'&&b.min.y>1)stage='roof';
  if(child.userData.blueprintStage)stage=child.userData.blueprintStage;
  const zone=stage==='foundation'?'base':center.x<-.65?'left':center.x>.65?'right':'center';let key=stage+':'+zone;const layout=BLUEPRINT_LAYOUT[id];if(layout&&!layout.includes(key)){key=layout.find(k=>k===stage+':center')||layout.find(k=>k.startsWith(stage+':'))||layout.find(k=>k==='details:'+zone)||layout[0];}if(!groups.has(key))groups.set(key,new T.Group());groups.get(key).add(child);
 }
 const names={foundation:'Lot and paving',walls:'Building section',roof:'Roof and upper details',windows:'Windows and frames',details:'Entry and trim',garden:'Garden and hedges'},order=['foundation','walls','roof','windows','details','garden'],parts=[];
 for(const stage of order)for(const zone of ['base','left','center','right']){const group=groups.get(stage+':'+zone);if(!group)continue;const model=compact(group),bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3());parts.push({id:stage+':'+zone,name:names[stage]+(zone==='base'?'':' · '+zone),model,center,size:bounds.getSize(new T.Vector3())});}
 blueprintCache.set(id,parts);return parts;
}
export function townConstructionModel(id,step){const parts=townBlueprint(id);if(!parts)return townModel(id);const group=new T.Group();for(const part of parts.slice(0,Math.max(0,Math.min(parts.length,Math.floor(step)))))group.add(part.model.clone());return group;}
