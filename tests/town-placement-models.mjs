import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {availableLots,repairTownPlacements,fitsTownGround} from '../town-plots.js';
import {STREETS,SIDEWALK_WIDTH} from '../town-streets.js';
const context=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>context})};
const {TOWN_CATALOG,townModel,townBlueprint,supportsHomeLesson}=await import('../town-models.js');
const {ESTATE_STARTERS,CITY_STARTERS}=await import('../town-neighborhood.js');
const defs=Object.fromEntries(TOWN_CATALOG.map(d=>[d.id,d])),bounds=new Map();
const measure=id=>{if(!bounds.has(id)){const b=new T.Box3().setFromObject(townModel(id));if(supportsHomeLesson(id))for(const part of townBlueprint(id,2))b.union(new T.Box3().setFromObject(part.model));bounds.set(id,b);}const b=bounds.get(id),c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3());return {w:s.x,d:s.z,cx:c.x,cz:c.z};};
function checkActualGeometry(item){
 const root=townModel(item.kind);root.position.set(item.x,0,item.z);root.rotation.y=item.rot||0;root.scale.setScalar(item.s||1);const b=new T.Box3().setFromObject(root);
 for(const road of STREETS){const p=new T.Box3(new T.Vector3(road.x-road.w/2-SIDEWALK_WIDTH,-10,road.z-road.d/2-SIDEWALK_WIDTH),new T.Vector3(road.x+road.w/2+SIDEWALK_WIDTH,100,road.z+road.d/2+SIDEWALK_WIDTH));assert.ok(!b.intersectsBox(p),item.kind+' actual geometry must clear all pavement');}
}
let placements=0;
for(const def of TOWN_CATALOG.filter(d=>d.solid))for(const rot of [0,Math.PI/2,Math.PI,Math.PI*1.5,.35])for(const s of [.6,1,1.6]){
 const item={kind:def.id,rot,s};const lots=availableLots(item,[],measure,defs);
 if(s===1&&rot===0)assert.ok(lots.length,def.id+' has a buildable lot');
 for(const lot of lots){const placed={...item,x:lot.originX,z:lot.originZ};checkActualGeometry(placed);placements++;}
}
const saved=[...ESTATE_STARTERS,...CITY_STARTERS].map(([kind,x,z,s=1],i)=>({uid:'saved'+i,kind,x,z,s,rot:0,constructionVersion:2,constructionStep:5,constructionPieces:1}));
// Regression matching a legacy Allentown origin on the west street.
saved.push({uid:'over-pavement',kind:'allentownHome',x:-18,z:8,s:1,rot:0,constructionVersion:1,constructionStep:1});
const original=structuredClone(saved),result=repairTownPlacements(saved,measure,defs);assert.deepEqual(result.unresolved,[]);assert.ok(result.moved.includes('over-pavement'));
for(const it of saved){checkActualGeometry(it);const before=original.find(b=>b.uid===it.uid);assert.equal(it.constructionVersion,before.constructionVersion);assert.equal(it.constructionStep,before.constructionStep);assert.equal(it.constructionPieces,before.constructionPieces);assert.ok(fitsTownGround(it.x,it.z,it,measure));}
assert.deepEqual(repairTownPlacements(saved,measure,defs),{moved:[],unresolved:[]});
console.log(placements+' real model placements checked; legacy homes repaired without resetting construction.');
