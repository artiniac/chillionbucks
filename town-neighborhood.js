import * as T from './vendor/three.module.js';
import {block,mesh} from './chilltopia-models.js?v=expansion2';
import {naturalTree} from './natural-tree.js?v=expansion2';
import {scannedMaterial,worldUV} from './realism.js?v=expansion2';
export const TOWN_BOUNDS={x:56,z:44};
export const ESTATE_STARTERS=[
 ['chatsboroHome',-12,8],['allentownHome',-4,8],['spanishEstate',4,8],['santaBarbaraEstate',12,8],
 ['tudorEstate',-12,-9],['frenchEstate',-4,-9],['haciendaEstate',4,-9],['warnerTowers',13,-9,.85]
];
export const CITY_STARTERS=[['school',-36,-35],['library',-20,-35],['mall',20,-35],['restaurant',-36,30],['store',-25,30],['supermarket',-10,30],['restaurant',20,30],['cityPark',37,30]];
// Add the new neighborhood once, without replacing or moving the child's collection.
export function expandNeighborhood(state,makeEntry){if(state.neighborhoodVersion>=2)return;const town=state.worlds.town;
 for(const [kind,x,z,s=1] of [...(state.neighborhoodVersion===1?[]:ESTATE_STARTERS),...CITY_STARTERS]){if(town.length>=180)break;if(town.some(i=>i.kind===kind))continue;if(town.some(i=>Math.hypot(i.x-x,i.z-z)<4))continue;town.push(makeEntry(kind,x,z,s));}
 state.neighborhoodVersion=2;
}
export function townLandscape(){const g=new T.Group();const grass=scannedMaterial('leafy_grass',[1,1],'#a9b790'),paving=scannedMaterial('concrete_pavement',[1,1],'#e2ded0');
 mesh(g,worldUV(new T.PlaneGeometry(116,92).rotateX(-Math.PI/2),.32),grass,0,-.09,0);
 const road=(x,z,w,d)=>{block(g,paving,x,-.075,z,w+1.15,.055,d+1.15);block(g,'#555951',x,-.04,z,w,.04,d);if(w>d){for(let a=-w/2+.5;a<w/2;a+=1.25)block(g,'#e7dbb0',x+a,-.015,z,.55,.008,.035);}else for(let a=-d/2+.5;a<d/2;a+=1.25)block(g,'#e7dbb0',x,-.015,z+a,.035,.008,.55);};
 road(0,-27,104,3);road(0,23,104,3);road(-47,0,3,78);road(47,0,3,78);road(-18,-17,2.4,23);road(18,-17,2.4,23);road(-18,14,2.4,21);road(18,14,2.4,21);
 road(0,-4,38,2.4);road(0,3,38,2.4);road(-18,0,2.4,27);road(18,0,2.4,27);road(0,-.5,2,6);
 for(const z of [-4,3])for(const x of [-16,16])for(let i=0;i<6;i++)block(g,'#ebe7d4',x,-.005,z-1+i*.4,.65,.012,.15);
 for(const [kind,x,z] of ESTATE_STARTERS){if(kind==='warnerTowers')continue;block(g,paving,x,-.05,z<0?-5.75:5.1,1.45,.06,z<0?1.8:2.1);}
 for(let i=0;i<24;i++){if(i>=12&&i%3!==0)continue;const x=-20+i%12*3.6,z=i<12?-15:16;const tree=naturalTree();tree.position.set(x,-.08,z);tree.scale.setScalar(1.1+(i%3)*.12);g.add(tree);}
 for(const x of [-57,57])block(g,'#acaa90',x,.35,0,.18,.85,90,'stone');
 for(const z of [-45,45])block(g,'#acaa90',0,.35,z,114,.85,.18);
 // Open gate provides an unobstructed entrance for walking and driving.
 for(const x of [-2.8,2.8]){block(g,'#b8ae94',x,1,14.5,.65,2,.65);block(g,'#e1d4b4',x,2.05,14.5,.85,.14,.85);for(let i=0;i<10;i++)block(g,'#42483a',x+Math.sign(x)*(.5+i*.17),.9,14.5,.026,1.65,.026);}
 for(const x of [-16,0,16])for(const z of [-5.65,4.7]){mesh(g,new T.CylinderGeometry(.025,.045,2.1,8),'#464c42',x,1,z);block(g,'#5f6557',x,2.12,z,.24,.1,.24);block(g,'#e9d5a0',x,2,z,.16,.17,.16);}
 return g;
}
