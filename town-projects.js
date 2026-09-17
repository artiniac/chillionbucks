export const TOWN_PROJECTS_KEY='cb:town-projects:v1';
const copy=value=>JSON.parse(JSON.stringify(value));
const nameOf=(value,fallback)=>String(value||'').trim().slice(0,40)||fallback;

// One atomic library write. Reading again before saving preserves other towns
// edited in another tab. Wallet and aquarium state never enter this library.
export function createTownProjects(storage,legacy,makeId,sanitize=copy){
 let activeId,initial;
 function read(){
  const raw=storage.getItem(TOWN_PROJECTS_KEY);
  if(!raw)return initial;
  const data=JSON.parse(raw);
  if(data?.v!==1||!Array.isArray(data.projects)||!data.projects.length||data.projects.some(p=>typeof p.id!=='string'||!Array.isArray(p.items)))throw Error('Town saves could not be read. They have not been replaced.');
  return data;
 }
 const existing=read();
 if(existing)activeId=existing.projects.some(p=>p.id===existing.activeId)?existing.activeId:existing.projects[0].id;
 else{
  activeId=makeId();
  initial={v:1,activeId,projects:[{id:activeId,name:'My first town',items:copy(legacy.items),neighborhoodVersion:legacy.neighborhoodVersion,updatedAt:Date.now()}]};
  // Keep the original town separately before the first migration write.
  if(!storage.getItem('cb:town-original:v1'))storage.setItem('cb:town-original:v1',JSON.stringify(legacy));
  storage.setItem(TOWN_PROJECTS_KEY,JSON.stringify(initial));
 }
 function write(data){storage.setItem(TOWN_PROJECTS_KEY,JSON.stringify(data));initial=data;}
 function current(){const p=read().projects.find(p=>p.id===activeId);if(!p)throw Error('This town is unavailable.');return {...copy(p),items:sanitize(p.items)};}
 return {
  current,
  list:()=>read().projects.map(({id,name,items,updatedAt})=>({id,name,count:items.length,updatedAt,active:id===activeId})),
  save(items,neighborhoodVersion){const data=read(),p=data.projects.find(p=>p.id===activeId);if(!p)throw Error('This town is unavailable.');p.items=copy(items);p.neighborhoodVersion=neighborhoodVersion;p.updatedAt=Date.now();write(data);},
  switch(id){const data=read();if(!data.projects.some(p=>p.id===id))throw Error('This town is unavailable.');data.activeId=id;write(data);activeId=id;return current();},
  create(name){const data=read();if(data.projects.length>=12)throw Error('You have 12 towns. Open one to keep building.');const id=makeId();data.projects.push({id,name:nameOf(name,'Town '+(data.projects.length+1)),items:[],neighborhoodVersion:3,updatedAt:Date.now()});data.activeId=id;write(data);activeId=id;return current();},
  rename(name){const data=read(),p=data.projects.find(p=>p.id===activeId);p.name=nameOf(name,p.name);write(data);return p.name;}
 };
}
