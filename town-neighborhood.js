import * as T from './vendor/three.module.js';
import {streetScene,nearStreet} from './town-streets.js?v=lots2';
import {block,mesh} from './chilltopia-models.js?v=garage2';
import {naturalTree} from './natural-tree.js?v=expansion2';
import {scannedMaterial,worldUV} from './realism.js?v=expansion2';
import {TOWN_BOUNDS} from './town-plots.js?v=lots2';
export {TOWN_BOUNDS};
export const ESTATE_STARTERS=[
 ['chatsboroHome',-12,8],['allentownHome',-4,8],['spanishEstate',4,8],['santaBarbaraEstate',12,8],
 ['tudorEstate',-12,-9],['frenchEstate',-4,-9],['haciendaEstate',4,-9],['warnerTowers',13,-9,.85]
];
export const CITY_STARTERS=[['school',-36,-35],['library',-20,-35],['mall',20,-35],['restaurant',-36,30],['store',-25,30],['supermarket',-10,30],['restaurant',20,30],['cityPark',37,30]];
// Add the new neighborhood once, without replacing or moving the child's collection.
export function expandNeighborhood(state,makeEntry){if(state.neighborhoodVersion>=3)return;const town=state.worlds.town;const previous=state.neighborhoodVersion||0;
 for(const [kind,x,z,s=1] of [...(previous>=1?[]:ESTATE_STARTERS),...(previous>=2?[]:CITY_STARTERS),['riderwoodHome',-11,-63],['caritinaHome',11,-63],['oakdaleHome',35,-63],['agbuSchool',-83,-63]]){if(town.length>=750)break;if(town.some(i=>i.kind===kind))continue;if(town.some(i=>Math.hypot(i.x-x,i.z-z)<(z===-63?16:4)))continue;town.push(makeEntry(kind,x,z,s));}
 state.neighborhoodVersion=3;
}
export function townLandscape(items=[]){const g=new T.Group();const grass=scannedMaterial('leafy_grass',[1,1],'#b1ce86'),paving=scannedMaterial('concrete_pavement',[1,1],'#e2ded0');
 mesh(g,worldUV(new T.PlaneGeometry(264,224).rotateX(-Math.PI/2),.22),grass,0,-.09,0);g.add(streetScene());
 const occupied=(x,z,r=1)=>items.some(it=>{const size=it.kind==='warnerTowers'?6:it.kind.endsWith('Home')?4:it.kind.endsWith('Estate')?3.5:2;return Math.hypot(it.x-x,it.z-z)<size+r;});
 // Driveways meet the front street of each established residential row.
 for(const [kind,x,z] of ESTATE_STARTERS){if(kind==='warnerTowers'||!items.some(it=>it.kind===kind&&Math.abs(it.x-x)<.01&&Math.abs(it.z-z)<.01))continue;block(g,paving,x,-.025,z<0?-5.55:12.9,1.55,.07,z<0?1.25:1.5);}
 // Planted buffers and pedestrian furniture make the neighborhood edges feel finished.
 for(const z of [-19,19]){block(g,'#719052',0,-.025,z,31,.07,2);for(let i=0;i<10;i++){const x=-15+i*3.3;if(occupied(x,z,.25))continue;const tree=naturalTree();tree.position.set(x,0,z);tree.scale.setScalar(1.15+(i%3)*.15);g.add(tree);}}
 for(const x of [-41,41])for(let z=-20;z<23;z+=7){if(occupied(x,z,1))continue;const tree=naturalTree();tree.position.set(x,0,z);tree.scale.setScalar(1.6);g.add(tree);block(g,'#c8c7b1',x,.005,z,2.4,.12,2.4);}
 for(const x of [-13,-5,5,13])for(const z of [-1,19]){if(occupied(x,z,.5)||nearStreet(x,z,.5))continue;for(const offset of [-.15,.15])block(g,'#8c7255',x,.35,z+offset,1.1,.065,.13);block(g,'#8c7255',x,.59,z-.23,1.1,.38,.045);for(const dx of [-.4,.4])block(g,'#4c5951',x+dx,.17,z,.045,.34,.4);}
 // A planted edge replaces the visually abrupt wall around a flat board.
 for(let i=0;i<70;i++){const a=i/70*Math.PI*2,x=Math.cos(a)*134,z=Math.sin(a)*114;const tree=naturalTree();tree.position.set(x,-.1,z);tree.scale.setScalar(1.5+(i%4)*.35);g.add(tree);}
 for(const z of [-110,110])block(g,'#819568',0,-.1,z,260,.08,1.4);
 return g;
}
