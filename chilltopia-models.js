import {TOWN_CATALOG,townModel} from './town-models.js?v=homes4';
import {reefExtra} from './reef-extras.js?v=expansion2';
import * as T from './vendor/three.module.js';
import {human} from './living-models.js';
import {reefHabitat} from './reef-habitat.js?v=expansion2';
import {naturalTree} from './natural-tree.js?v=expansion2';
import {realisticFish,SPECIES} from './reef-species.js?v=20260907-sunlit';
const mats=new Map();
export function material(color,roughness=.65){const key=color+':'+roughness;if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness,metalness:.03}));return mats.get(key)}
export function mesh(g,geo,color,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,typeof color==='object'?color:material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
const sphere=new T.SphereGeometry(1,20,14), box=new T.BoxGeometry(1,1,1);sphere.userData.shared=true;box.userData.shared=true;
export function disposeModel(g){g.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared)o.geometry.dispose();if(o.material&&!o.material.userData?.shared&&!Array.from(mats.values()).includes(o.material))o.material.dispose();});g.clear();}
export function orb(g,c,x,y,z,sx,sy= sx,sz=sx){return mesh(g,sphere,c,x,y,z,sx,sy,sz)}
export function block(g,c,x,y,z,sx,sy,sz){return mesh(g,box,c,x,y,z,sx,sy,sz)}
function branch(g,a,b,r,c){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const m=mesh(g,new T.CylinderGeometry(r*.65,r,d.length(),8),c);m.position.copy(new T.Vector3(...a).addScaledVector(d,.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m}
export const CATALOG=[
...TOWN_CATALOG,
{id:'reefarch',name:'Living reef arch',category:'Habitat',world:'reef',price:18,r:1.2},
{id:'coralgarden',name:'Branching coral garden',category:'Habitat',world:'reef',price:20,r:1.2},
{id:'reefledge',name:'Layered reef ledges',category:'Habitat',world:'reef',price:15,r:1.1},
{id:'pineapplehome',name:'Pineapple hideaway',category:'Hideouts',world:'reef',price:18,r:.75},
{id:'stonefacehome',name:'Stone-face hideaway',category:'Hideouts',world:'reef',price:18,r:.8},
{id:'rock',name:'River stones',category:'Habitat',world:'reef',price:0,r:.65},
{id:'grass',name:'Ribbon garden',category:'Habitat',world:'reef',price:0,r:.35},
{id:'cave',name:'Hideaway cave',category:'Habitat',world:'reef',price:0,r:1.05,portal:true},
{id:'pinkcoral',name:'Candy coral',category:'Habitat',world:'reef',price:5,r:.6},
{id:'fan',name:'Sea fan',category:'Habitat',world:'reef',price:10,r:.55},
{id:'anemone',name:'Waving anemone',category:'Habitat',world:'reef',price:8,r:.5},
{id:'clown',name:'Clownfish',category:'Fish',world:'reef',price:5,fish:true,color:'#f68c26'},
{id:'tang',name:'Blue tang',category:'Fish',world:'reef',price:12,fish:true,color:'#157ee9'},
{id:'yellow',name:'Yellow tang',category:'Fish',world:'reef',price:10,fish:true,color:'#ffd653'},
{id:'chromis',name:'Green chromis',category:'Fish',world:'reef',price:4,fish:true,color:'#4bd9ba'},
{id:'butterfly',name:'Butterflyfish',category:'Fish',world:'reef',price:15,fish:true,color:'#fff2a5'},
{id:'royal',name:'Royal gramma',category:'Fish',world:'reef',price:10,fish:true,color:'#9b65df'},
{id:'lobster',name:'Reef lobster',category:'Crawlers',world:'reef',price:15,r:.5,fish:true,crawler:true,color:'#c45945'},
{id:'bluecray',name:'Blue crayfish',category:'Crawlers',world:'reef',price:10,r:.5,fish:true,crawler:true,color:'#398fe0'},
{id:'redcray',name:'Red crayfish',category:'Crawlers',world:'reef',price:10,r:.5,fish:true,crawler:true,color:'#d74d49'},
{id:'whitecray',name:'White crayfish',category:'Crawlers',world:'reef',price:10,r:.5,fish:true,crawler:true,color:'#e9e4d5'},
{id:'orangecray',name:'Orange crayfish',category:'Crawlers',world:'reef',price:10,r:.5,fish:true,crawler:true,color:'#ec983e'},
{id:'hermit',name:'Hermit crab',category:'Crawlers',world:'reef',price:8,r:.5,fish:true,crawler:true,color:'#b88059'},
{id:'fiddler',name:'Fiddler crab',category:'Crawlers',world:'reef',price:8,r:.5,fish:true,crawler:true,color:'#c8924e'},
{id:'redcrab',name:'Red reef crab',category:'Crawlers',world:'reef',price:12,r:.5,fish:true,crawler:true,color:'#d65d54'},
{id:'house',name:'Seaside cottage',category:'Hideouts',world:'reef',price:15,r:1,portal:true},
{id:'castle',name:'Coral castle',category:'Hideouts',world:'reef',price:25,r:1.25,portal:true},
{id:'arch',name:'Moon gate',category:'Hideouts',world:'reef',price:8,r:.9,portal:true},
{id:'ship',name:'Sunken sailboat',category:'Hideouts',world:'reef',price:20,r:1.3},
{id:'bubbles',name:'Bubble fountain',category:'Water',world:'reef',price:0,r:.3},
{id:'shell',name:'Pearl shell',category:'Water',world:'reef',price:8,r:.5},
{id:'tree',name:'Shade tree',category:'Garden',world:'town',price:0,r:.65},
{id:'flowers',name:'Flower patch',category:'Garden',world:'town',price:0,r:.4},
{id:'bench',name:'Chill bench',category:'Garden',world:'town',price:0,r:.7},
{id:'townhouse',name:'Little cottage',category:'Build',world:'town',price:0,r:1.2},
{id:'tower',name:'Lookout tower',category:'Build',world:'town',price:0,r:.8},
{id:'pool',name:'Splash pool',category:'Build',world:'town',price:15,r:1.2},
{id:'car',name:'Sunny roadster',category:'Play',world:'town',price:20,r:.6},
{id:'fountain',name:'Town fountain',category:'Play',world:'town',price:12,r:.8},
];
export const DEFINITIONS=Object.fromEntries(CATALOG.map(d=>[d.id,d]));
for(const [id,info] of Object.entries(SPECIES))Object.assign(DEFINITIONS[id],info);
export function makeFish(kind){return realisticFish(kind)}
export function makeModel(id){const town=townModel(id);if(town)return town;const extra=reefExtra(id);if(extra)return extra;const habitat=reefHabitat(id);if(habitat)return habitat;if(id==='tree')return naturalTree();if(DEFINITIONS[id]?.crawler)return makeCrawler(id);if(DEFINITIONS[id]?.fish)return makeFish(id);const g=new T.Group();
if(id==='rock'){for(let i=0;i<4;i++){const m=mesh(g,new T.DodecahedronGeometry(1,1),['#799a92','#9ab2a4','#b0bdb0','#697e76'][i],(i%2-.5)*.65,.2+i*.04,(Math.floor(i/2)-.5)*.6,.5,.32,.45);m.rotation.set(i*.4,i*.8,0)}}
if(id==='cave'||id==='arch'){const c=id==='cave'?'#839d8b':'#d4b490';const arch=mesh(g,new T.TorusGeometry(.76,.24,8,24,Math.PI),c,0,.22,0);arch.scale.z=2;for(const x of [-.76,.76])orb(g,c,x,.16,0,.3,.25,.48);g.userData.portal=new T.Vector3(0,.58,0);}
if(id==='grass'){for(let i=0;i<9;i++){const a=i*2.4,h=.8+(i%4)*.24;const curve=new T.CatmullRomCurve3([new T.Vector3(Math.cos(a)*.16,0,Math.sin(a)*.16),new T.Vector3(Math.cos(a)*.25,h*.5,Math.sin(a)*.25),new T.Vector3(Math.cos(a)*.4,h,Math.sin(a)*.3)]);mesh(g,new T.TubeGeometry(curve,8,.045,4,false),i%2?'#389d79':'#79b95b');}orb(g,'#809f89',0,.08,0,.3,.13,.3)}
if(id==='pinkcoral'||id==='fan'){const color=id==='fan'?'#a87bdb':'#ed8f91';for(let i=0;i<6;i++){const x=(i-2.5)*.16,h=.7+Math.sin(i*2)*.25;branch(g,[0,.05,0],[x,h,.08*Math.sin(i)],.075,color);branch(g,[x*.65,h*.65,0],[x+.16,h+.23,.05],.055,color);branch(g,[x*.65,h*.65,0],[x-.13,h+.15,-.07],.045,color);orb(g,color,x,h,0,.07)}orb(g,'#c7aa9a',0,.05,0,.4,.12,.3)}
if(id==='anemone'){orb(g,'#ae86ab',0,.12,0,.47,.15,.4);for(let i=0;i<20;i++){const a=i*2.4,r=.15+(i%3)*.1;branch(g,[Math.cos(a)*r,.1,Math.sin(a)*r],[Math.cos(a)*r*1.3,.45+(i%4)*.07,Math.sin(a)*r*1.3],.035,'#c29fcc');orb(g,'#e6bbdf',Math.cos(a)*r*1.3,.45+(i%4)*.07,Math.sin(a)*r*1.3,.06)}}
if(id==='house'||id==='townhouse'){const c=id==='house'?'#d9c8a6':'#f2df9a';for(const x of [-.57,.57])block(g,c,x,.55,0,.34,1.1,1.1);block(g,c,0,1.04,0,1.5,.22,1.1);block(g,c,0,.65,-.48,1.5,1.3,.16);const roof=mesh(g,new T.ConeGeometry(1.17,.75,4),'#cf7971',0,1.5,0,1,1,.95);roof.rotation.y=Math.PI/4;for(const x of [-.54,.54])orb(g,'#3f8f9b',x,.62,.57,.16,.2,.025);g.userData.portal=new T.Vector3(0,.45,.06);}
if(id==='castle'){for(const x of [-.8,.8]){mesh(g,new T.CylinderGeometry(.32,.38,1.3,12),'#b9b1d3',x,.65,0);mesh(g,new T.ConeGeometry(.48,.65,12),'#809dc9',x,1.61,0);orb(g,'#ecd48d',x,1.98,0,.07);}block(g,'#d2c3d9',0,1.05,0,1.5,.3,.65);for(const x of [-.45,.45])block(g,'#d2c3d9',x,.45,0,.3,.9,.65);for(let i=0;i<5;i++)block(g,'#d2c3d9',(i-2)*.27,1.29,0,.16,.2,.65);g.userData.portal=new T.Vector3(0,.46,0);}
if(id==='ship'){orb(g,'#99785d',0,.2,0,1.1,.28,.36);block(g,'#c5a079',0,.42,0,1.8,.09,.6);branch(g,[0,.4,0],[0,1.8,0],.045,'#917253');const sail=mesh(g,new T.ConeGeometry(.62,1.1,3),'#e4dec7',.22,1.22,0,1,1,.03);sail.rotation.z=-.25;for(const x of [-.55,0,.55])for(const z of [-.33,.33])orb(g,'#453e32',x,.24,z,.095,.095,.02);}
if(id==='bubbles'||id==='fountain'){mesh(g,new T.CylinderGeometry(id==='fountain'?.8:.35,id==='fountain'?.85:.4,.2,24),'#91b8ad',0,.1,0);if(id==='fountain'){mesh(g,new T.CylinderGeometry(.63,.63,.07,24),'#55bfbe',0,.23,0);mesh(g,new T.CylinderGeometry(.16,.23,.8,12),'#c8d8ba',0,.65,0);}g.userData.bubbler=true;}
if(id==='shell'){for(let i=0;i<7;i++){let s=orb(g,'#e7bfab',(i-3)*.085,.14,0,.13,.09,.43);s.rotation.y=(i-3)*.12;}orb(g,'#fff6e2',0,.23,.02,.16)}
if(id==='tree'){mesh(g,new T.CylinderGeometry(.1,.17,1.2,8),'#aa8362',0,.6,0);orb(g,'#5d9961',0,1.5,0,.7,.8,.62);orb(g,'#87b367',-.36,1.35,.16,.5,.55,.5);orb(g,'#99c97a',.32,1.65,.06,.42,.5,.45)}
if(id==='flowers'){for(let i=0;i<7;i++){const a=i*2.4,x=Math.cos(a)*.35,z=Math.sin(a)*.35,h=.25+i%3*.1;branch(g,[x,0,z],[x,h,z],.018,'#4d9160');for(let j=0;j<5;j++)orb(g,i%2?'#f1bda7':'#f1df87',x+Math.cos(j*1.26)*.07,h,z+Math.sin(j*1.26)*.07,.065,.04,.065);orb(g,'#d6a34a',x,h+.02,z,.035)}}
if(id==='bench'){block(g,'#b5966e',0,.4,0,1.3,.1,.4);block(g,'#b5966e',0,.7,-.17,1.3,.45,.09);for(const x of [-.45,.45])block(g,'#5f7970',x,.2,0,.09,.4,.35)}
if(id==='tower'){for(const x of [-.4,.4])for(const z of [-.4,.4])block(g,'#ab9870',x,.75,z,.12,1.5,.12);block(g,'#d8bd84',0,1.45,0,1.1,.15,1.1);mesh(g,new T.ConeGeometry(.95,.6,4),'#7a9f80',0,2.15,0).rotation.y=Math.PI/4;for(let i=0;i<5;i++)block(g,'#a79065',0,.2+i*.26,.48,.55,.07,.08)}
if(id==='pool'){mesh(g,new T.CylinderGeometry(1,1.1,.3,40),'#d5e3cd',0,.15,0,1,1,.75);mesh(g,new T.CylinderGeometry(.88,.88,.04,40),'#69cccd',0,.32,0,1,1,.75)}
if(id==='car'){block(g,'#e1ad47',0,.4,0,1.25,.4,.66);block(g,'#f4cb65',-.06,.72,0,.68,.32,.61);block(g,'#78a7a5',.24,.76,0,.04,.2,.55);for(const x of [-.42,.42])for(const z of [-.34,.34]){let w=mesh(g,new T.CylinderGeometry(.21,.21,.12,16),'#314943',x,.23,z);w.rotation.x=Math.PI/2;orb(g,'#d9d4b0',x,.23,z*1.18,.1,.1,.025)}for(const z of [-.2,.2])orb(g,'#fff1b6',.64,.43,z,.025,.07,.09)}
return g;}
export function makePerson(variant=0){return human(variant)}

function makeCrawler(id){
 const g=new T.Group(),c=DEFINITIONS[id].color,crab=['hermit','fiddler','redcrab'].includes(id),legs=[];
 orb(g,c,0,.24,0,crab?.32:.48,.19,crab?.34:.19);
 if(!crab){for(let i=0;i<5;i++)orb(g,c,-.32-i*.12,.19,0,.13,.12,.17-i*.017);for(let i=-1;i<=1;i++)orb(g,c,-.93,.15,i*.12,.18,.04,.1);}
 if(id==='hermit'){orb(g,'#e1c9a2',-.18,.38,0,.33,.3,.3);const sh=mesh(g,new T.TorusGeometry(.18,.05,8,18),'#a17d59',-.19,.44,.24);sh.rotation.y=.3;}
 for(const z of [-1,1]){branch(g,[.2,.3,z*.12],[.33,.48,z*.18],.025,c);orb(g,'#193c37',.33,.49,z*.18,.045);
 for(let i=0;i<4;i++){const leg=new T.Group();g.add(leg);const x=.18-i*.14;branch(leg,[x,.2,z*.13],[x-.1,.18,z*.4],.025,c);branch(leg,[x-.1,.18,z*.4],[x-.02,.025,z*.57],.02,c);legs.push(leg);}
 const large=id==='fiddler'&&z===1?1.6:1;branch(g,[.27,.23,z*.16],[.52,.2,z*.35],.06,c);orb(g,c,.69,.22,z*.38,.23*large,.09*large,.13*large);orb(g,c,.87,.22,z*.32,.13*large,.06,.045);orb(g,c,.85,.22,z*.47,.13*large,.06,.045);
 if(!crab)branch(g,[.39,.3,z*.08],[1.12,.39,z*.28],.012,c);
 }
 g.userData.legs=legs;return g;
}
