import assert from 'node:assert/strict';
import {TOWN_BOUNDS,TOWN_LOTS,availableLots,fitsTown,lotAt,footprint} from '../town-plots.js';
const measure=()=>({w:7.6,d:8.6}),defs={house:{solid:true},car:{vehicle:true}};
assert.ok(TOWN_BOUNDS.x*TOWN_BOUNDS.z/(56*44)>=5);
assert.ok(TOWN_LOTS.length>=40,'Expanded map has ample defined lots');
const item={kind:'house',s:1,rot:0},free=availableLots(item,[],measure,defs);assert.ok(free.length>=40);
for(const l of free){assert.ok(fitsTown(l.x,l.z,item,[],measure,defs));assert.equal(lotAt(l.x,l.z,item,[],measure,defs)?.id,l.id);}
const l=free[0],built={...item,uid:'existing',x:l.x,z:l.z};assert.equal(lotAt(l.x,l.z,item,[built],measure,defs),null,'Occupied parcel must not redirect a drop into another yard');
assert.equal(fitsTown(l.x+2,l.z,item,[built],measure,defs),false);assert.equal(lotAt(l.x+11,l.z,item,[],measure,defs),null,'Road and gap drops do not snap to a distant lot');
assert.ok(fitsTown(l.x,l.z,built,[built],measure,defs),'Moving a home does not collide with itself');
assert.equal(lotAt(l.x,l.z,{kind:'car'},[{...built,kind:'car'}],measure,defs),null,'A parked car reserves its construction space');
const turn=footprint({...item,rot:Math.PI/2},measure);assert.ok(Math.abs(turn.w-8.6)<1e-8&&Math.abs(turn.d-7.6)<1e-8);
assert.equal(fitsTown(130,0,item,[],measure,defs),false);
console.log(TOWN_LOTS.length+' defined lots; area, boundaries, rotated footprints, and occupied-yard protection verified.');

const {fitsTownGround,fitsRoadPlacement,fitsAssignedLot,repairTownPlacements}=await import('../town-plots.js');
const offsetMeasure=()=>({w:4,d:6,cx:3,cz:-2});
for(const rot of [0,Math.PI/2,Math.PI,Math.PI*1.5,.37])for(const s of [.6,1,1.6]){
 const candidate={kind:'house',s,rot},lot=availableLots(candidate,[],offsetMeasure,defs)[0],placed={...candidate,x:lot.originX,z:lot.originZ,lotId:lot.id};
 assert.ok(fitsAssignedLot(placed,offsetMeasure));
 const f=footprint(candidate,offsetMeasure);assert.ok(Math.abs(placed.x+f.dx-lot.x)<1e-8&&Math.abs(placed.z+f.dz-lot.z)<1e-8,'Off-center property, not its origin, is centered inside the parcel');
 assert.ok(!fitsAssignedLot({...placed,x:placed.x+9},offsetMeasure),'Full property stays inside its assigned lot');
}
const tiny=()=>({w:1,d:1});
assert.equal(fitsTownGround(0,25.7,{kind:'house'},tiny),false,'A home clear of asphalt but on the sidewalk must be rejected');
const road={uid:'road',kind:'road',x:l.x,z:l.z};assert.equal(fitsTown(l.x,l.z,item,[road],tiny,{...defs,road:{road:true}}),false,'Player-built roads reserve pavement too');
const bad={uid:'bad',kind:'house',x:0,z:23,s:1,rot:0,constructionStep:7,constructionPieces:2,constructionVersion:2,paid:0},good={...built};
const originalGood=structuredClone(good),list=[bad,good],repaired=repairTownPlacements(list,measure,defs);
assert.deepEqual(repaired,{moved:['bad'],unresolved:[]});assert.deepEqual(good,originalGood,'Safe homes are not relocated');
assert.equal(bad.constructionStep,7);assert.equal(bad.constructionPieces,2);assert.equal(bad.constructionVersion,2);assert.equal(bad.uid,'bad');assert.equal(bad.paid,0);
assert.deepEqual(bad.placementBeforeRoadFix,{x:0,z:23,lotId:undefined});
assert.ok(fitsTown(bad.x,bad.z,bad,list,measure,defs));assert.ok(fitsAssignedLot(bad,measure));
const saved=JSON.parse(JSON.stringify(list));assert.deepEqual(repairTownPlacements(saved,measure,defs),{moved:[],unresolved:[]},'Reload does not repeatedly move repaired homes');
const crowded=TOWN_LOTS.map((l,i)=>({...item,uid:'full'+i,x:l.x,z:l.z}));const stuck={...bad,uid:'no-space',x:0,z:23};const beforeStuck=structuredClone(stuck);assert.deepEqual(repairTownPlacements([stuck,...crowded],measure,defs).unresolved,['no-space']);assert.deepEqual(stuck,beforeStuck,'A full town never deletes or resizes an existing home');
console.log('Off-center lots, sidewalk clearance, custom roads, safe transforms, and saved-progress repair verified.');

assert.equal(fitsRoadPlacement(l.x,l.z,{kind:'road'},[built],measure,{...defs,road:{road:true}}),false,'Road placement cannot cut through an existing home');
assert.equal(fitsRoadPlacement(0,23,{kind:'road'},[],measure,{...defs,road:{road:true}}),true,'Road pieces can still join the street network');
