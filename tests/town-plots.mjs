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
