import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
const context=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({width:128,height:128,getContext:()=>context})};
const {TOWN_CATALOG,townModel,townBlueprint,townConstructionModel,supportsHomeLesson}=await import('../town-models.js');
for(const d of TOWN_CATALOG.filter(d=>supportsHomeLesson(d.id))){
 const parts=townBlueprint(d.id,2),ids=parts.map(p=>p.id);assert.equal(new Set(ids).size,ids.length);
 for(const id of ['foundation','drains','supply','slab','services','shell','underlay','windows','finish','roof','details','driveway','landscape'])assert.ok(ids.includes(id),d.id+' '+id);
 assert.ok(ids.indexOf('drains')<ids.indexOf('slab'));assert.ok(ids.indexOf('services')<ids.indexOf('finish'));assert.ok(ids.indexOf('underlay')<ids.indexOf('windows'));assert.ok(ids.indexOf('roof')<ids.indexOf('driveway'));
 for(const p of parts){assert.ok(p.lesson);assert.ok(Number.isFinite(p.center.length()));p.model.traverse(o=>{if(o.isMesh){for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));if(p.id.startsWith('frame-')||p.id.startsWith('trusses-'))assert.equal(o.material.name,'Unfinished wood');}});}
 const slab=townConstructionModel(d.id,ids.indexOf('slab')+1,2);assert.ok(!slab.children.some(p=>p.userData.lessonPart==='drains'),'Pipes are covered by slab');
 assert.equal(townConstructionModel(d.id,0,2).children.length,0);
 const built=townConstructionModel(d.id,parts.length,2),full=townModel(d.id),a=new T.Box3().setFromObject(built),b=new T.Box3().setFromObject(full);assert.ok(a.min.distanceTo(b.min)<1e-6&&a.max.distanceTo(b.max)<1e-6);
 const v=o=>{let n=0;o.traverse(m=>{if(m.isMesh)n+=m.geometry.attributes.position.count;});return n;};assert.equal(v(built),v(full),'No teaching pipes or studs leak through final facade');
 console.log(d.id+': '+parts.length+' construction assemblies');
}
// Legacy saves remain a distinct rendering path until the player chooses the new lesson.
assert.notDeepEqual(townBlueprint('allentownHome').map(p=>p.id),townBlueprint('allentownHome',2).map(p=>p.id));
console.log('Home construction sequence, wood materials, hidden services, and completed geometry verified.');
const chatsboro=townModel('chatsboroHome'),bounds=new T.Box3().setFromObject(chatsboro);assert.ok(bounds.max.z<=3.21&&bounds.min.z>=-3.21,'Revised Chatsboro fits its existing town block');
let curvedPaving=0;chatsboro.traverse(m=>{if(m.isMesh&&m.userData.groundSurface){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;for(let i=0;i<p.count;i++)if(p.getY(i)>.024&&p.getY(i)<.026){assert.ok(n.getY(i)>.99,'Driveway faces up');curvedPaving++;}}});assert.ok(curvedPaving>0);
