import {STREETS,nearStreet} from './town-streets.js?v=phone1';
export const TOWN_BOUNDS={x:130,z:110};
export const TOWN_DISTRICTS=[{name:'Leo’s neighborhood',x:0,z:7},{name:'North gardens',x:0,z:-75},{name:'School district',x:-84,z:-63},{name:'West hills',x:-84,z:9},{name:'East village',x:84,z:9},{name:'South town',x:0,z:71}];
export const TOWN_LOTS=[];
for(const z of [-87,-63,-39,-15,9,35,59,83])for(const x of [-107,-83,-59,-35,-11,11,35,59,83,107]){if(nearStreet(x,z,9.5))continue;TOWN_LOTS.push({id:'lot:'+x+':'+z,x,z,w:18,d:18});}
// Measured model footprints include gardens and pools. Legacy items also reserve their existing space.
export function footprint(item,measure){const b=measure(item.kind),s=item.s||1,a=item.rot||0,c=Math.abs(Math.cos(a)),n=Math.abs(Math.sin(a));return {w:(b.w*c+b.d*n)*s,d:(b.w*n+b.d*c)*s};}
export function overlaps(x,z,size,it,other,pad=.6){return Math.abs(x-it.x)<(size.w+other.w)/2+pad&&Math.abs(z-it.z)<(size.d+other.d)/2+pad;}
export function fitsTown(x,z,item,items,measure,defs){const size=footprint(item,measure);if(Math.abs(x)+size.w/2>TOWN_BOUNDS.x||Math.abs(z)+size.d/2>TOWN_BOUNDS.z)return false;
 if(STREETS.some(r=>Math.abs(x-r.x)<(size.w+r.w)/2+.5&&Math.abs(z-r.z)<(size.d+r.d)/2+.5))return false;
 return !items.some(it=>it.uid!==item.uid&&!defs[it.kind]?.road&&overlaps(x,z,size,it,footprint(it,measure)));
}
export function availableLots(item,items,measure,defs){const size=footprint(item,measure);return TOWN_LOTS.filter(l=>size.w<=l.w&&size.d<=l.d&&fitsTown(l.x,l.z,item,items,measure,defs));}
export function nearestLot(x,z,item,items,measure,defs,maxDistance=Infinity){return availableLots(item,items,measure,defs).reduce((best,l)=>{const distance=Math.hypot(l.x-x,l.z-z);return distance<=maxDistance&&(!best||distance<best.distance)?{...l,distance}:best;},null);}

export function lotAt(x,z,item,items,measure,defs){const lot=TOWN_LOTS.find(l=>Math.abs(x-l.x)<=l.w/2&&Math.abs(z-l.z)<=l.d/2);return lot&&availableLots(item,items,measure,defs).some(l=>l.id===lot.id)?lot:null;}
