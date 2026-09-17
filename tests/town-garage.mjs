import assert from 'node:assert/strict';
import {GARAGE_BAYS,nextGarageBay,garageScene} from '../town-garage.js';
import {TOWN_BOUNDS,TOWN_LOTS} from '../town-plots.js';
const cars=[];for(const bay of GARAGE_BAYS){assert.equal(nextGarageBay(cars).id,bay.id);assert.ok(Math.abs(bay.x)+2<TOWN_BOUNDS.x&&Math.abs(bay.z)+3<TOWN_BOUNDS.z);assert.ok(!TOWN_LOTS.some(l=>Math.abs(l.x-bay.x)<l.w/2+1.2&&Math.abs(l.z-bay.z)<l.d/2+2.4));cars.push({...bay,kind:'f430'});}assert.equal(nextGarageBay(cars),undefined);cars.splice(2,1);assert.equal(nextGarageBay(cars).id,GARAGE_BAYS[2].id);assert.ok(garageScene().children.length>40);
console.log('PASS: eight workshop bays, no overlap with home lots, full garage handling, and reusable cleared bays.');
