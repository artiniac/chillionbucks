import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
// Geometry tests need a canvas texture source, but no browser or GPU.
const context=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>context})};
const {TOWN_CATALOG,townModel,townBlueprint,townConstructionModel,hasBlueprint}=await import('../town-models.js');
assert.equal(new Set(TOWN_CATALOG.map(d=>d.id)).size,TOWN_CATALOG.length);
function vertices(root){let n=0;root.traverse(o=>{if(o.isMesh){const a=o.geometry.attributes.position.array;for(const v of a)assert.ok(Number.isFinite(v));n+=a.length/3;}});return n;}
let count=0;
for(const d of TOWN_CATALOG.filter(d=>hasBlueprint(d.id))){const full=townModel(d.id),parts=townBlueprint(d.id),built=townConstructionModel(d.id,parts.length);assert.ok(parts.length>1);assert.equal(vertices(full),vertices(built),d.id+' must assemble every visible triangle');const a=new T.Box3().setFromObject(full),b=new T.Box3().setFromObject(built);assert.ok(a.min.distanceTo(b.min)<1e-5&&a.max.distanceTo(b.max)<1e-5,d.id+' completed bounds');assert.equal(townConstructionModel(d.id,0).children.length,0);assert.equal(townConstructionModel(d.id,-10).children.length,0);assert.equal(townConstructionModel(d.id,9999).children.length,parts.length);assert.equal(townConstructionModel(d.id,1).children.length,1);assert.ok(vertices(full)<350000,d.id+' geometry budget');count++;}
assert.equal(hasBlueprint('unknown'),false);assert.equal(hasBlueprint('sportscar'),false);
console.log('Construction geometry verified for '+count+' properties.');

const {expandNeighborhood}=await import('../town-neighborhood.js');
const original={uid:'kept',kind:'tree',x:-12,z:8,paid:12};const state={worlds:{town:[original],reef:[{kind:'clown'}]},jobs:4};
expandNeighborhood(state,(kind,x,z,s)=>({kind,x,z,s}));assert.equal(state.worlds.town[0],original);assert.equal(state.jobs,4);assert.deepEqual(state.worlds.reef,[{kind:'clown'}]);assert.ok(!state.worlds.town.some(i=>i.kind==='chatsboroHome'));const countAfter=state.worlds.town.length;expandNeighborhood(state,()=>{throw Error('must not repeat migration')});assert.equal(state.worlds.town.length,countAfter);console.log('Saved collection, occupied lots, and one-time migration verified.');
