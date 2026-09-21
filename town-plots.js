import {STREETS,nearStreet,SIDEWALK_WIDTH} from './town-streets.js?v=lots2';
export const TOWN_BOUNDS={x:130,z:110};
export const TOWN_DISTRICTS=[{name:'Leo’s neighborhood',x:0,z:7},{name:'North gardens',x:0,z:-75},{name:'School district',x:-84,z:-63},{name:'West hills',x:-84,z:9},{name:'East village',x:84,z:9},{name:'South town',x:0,z:71}];
export const TOWN_LOTS=[];
for(const z of [-87,-63,-39,-15,9,35,59,83])for(const x of [-107,-83,-59,-35,-11,11,35,59,83,107]){if(nearStreet(x,z,9.5))continue;TOWN_LOTS.push({id:'lot:'+x+':'+z,x,z,w:18,d:18});}
const CLEARANCE=.2,EPS=1e-6;
export const requiresTownLot=(kind,defs)=>!defs[kind]?.vehicle&&(defs[kind]?.solid||kind==='townhouse'||kind==='tower');
// Keep the real local center: wings, gardens, and driveways need not be symmetric
// around a model's origin. Rotate the center along with its complete footprint.
export function footprint(item,measure){const b=measure(item.kind),s=item.s||1,a=item.rot||0,c=Math.cos(a),n=Math.sin(a),cx=b.cx||0,cz=b.cz||0;return {w:(b.w*Math.abs(c)+b.d*Math.abs(n))*s,d:(b.w*Math.abs(n)+b.d*Math.abs(c))*s,dx:(cx*c+cz*n)*s,dz:(cz*c-cx*n)*s};}
export function overlaps(x,z,size,it,other,pad=.6){return Math.abs(x+size.dx-it.x-other.dx)<(size.w+other.w)/2+pad-EPS&&Math.abs(z+size.dz-it.z-other.dz)<(size.d+other.d)/2+pad-EPS;}
export function fitsTownGround(x,z,item,measure){const size=footprint(item,measure),cx=x+size.dx,cz=z+size.dz;if(Math.abs(cx)+size.w/2>TOWN_BOUNDS.x||Math.abs(cz)+size.d/2>TOWN_BOUNDS.z)return false;
 const pad=SIDEWALK_WIDTH+CLEARANCE;
 return !STREETS.some(r=>Math.abs(cx-r.x)<(size.w+r.w)/2+pad-EPS&&Math.abs(cz-r.z)<(size.d+r.d)/2+pad-EPS);
}
export function fitsTown(x,z,item,items,measure,defs){if(!fitsTownGround(x,z,item,measure))return false;const size=footprint(item,measure);
 return !items.some(it=>it!==item&&(!item.uid||it.uid!==item.uid)&&overlaps(x,z,size,it,footprint(it,measure),defs[it.kind]?.road?CLEARANCE:.6));
}
// Roads may connect to roads, but cannot be drawn through a saved property.
export function fitsRoadPlacement(x,z,item,items,measure,defs){const b=footprint(item,measure);return Math.abs(x+b.dx)+b.w/2<=TOWN_BOUNDS.x&&Math.abs(z+b.dz)+b.d/2<=TOWN_BOUNDS.z&&!items.some(it=>requiresTownLot(it.kind,defs)&&overlaps(x,z,b,it,footprint(it,measure),CLEARANCE));}
export function fitsAssignedLot(item,measure){const lot=TOWN_LOTS.find(l=>l.id===item.lotId);if(!lot)return true;const b=footprint(item,measure);return Math.abs(item.x+b.dx-lot.x)+b.w/2<=lot.w/2+EPS&&Math.abs(item.z+b.dz-lot.z)+b.d/2<=lot.d/2+EPS;}
export function availableLots(item,items,measure,defs){const size=footprint(item,measure);return TOWN_LOTS.filter(l=>size.w<=l.w+EPS&&size.d<=l.d+EPS&&fitsTown(l.x-size.dx,l.z-size.dz,item,items,measure,defs)).map(l=>({...l,originX:l.x-size.dx,originZ:l.z-size.dz}));}
export function nearestLot(x,z,item,items,measure,defs,maxDistance=Infinity){return availableLots(item,items,measure,defs).reduce((best,l)=>{const distance=Math.hypot(l.x-x,l.z-z);return distance<=maxDistance&&(!best||distance<best.distance)?{...l,distance}:best;},null);}
export function lotAt(x,z,item,items,measure,defs){return availableLots(item,items,measure,defs).find(l=>Math.abs(x-l.x)<=l.w/2&&Math.abs(z-l.z)<=l.d/2)||null;}

// Repair older layouts when opened, including unfinished houses. Keep identifiers,
// scale, orientation, and every construction step. Valid homes stay where they are.
export function repairTownPlacements(items,measure,defs){const moved=[],unresolved=[];
 for(const item of items){if(!requiresTownLot(item.kind,defs))continue;
  const blockers=items.filter(it=>it!==item&&(requiresTownLot(it.kind,defs)||defs[it.kind]?.road));
  if(fitsTown(item.x,item.z,item,blockers,measure,defs)&&fitsAssignedLot(item,measure))continue;
  const b=footprint(item,measure),lot=nearestLot(item.x+b.dx,item.z+b.dz,item,items,measure,defs);
  if(!lot){unresolved.push(item.uid);continue;}
  item.placementBeforeRoadFix??={x:item.x,z:item.z,lotId:item.lotId};
  item.x=lot.originX;item.z=lot.originZ;item.lotId=lot.id;moved.push(item.uid);
 }
 return {moved,unresolved};
}
