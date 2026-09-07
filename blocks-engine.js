// Pure grid rules shared by the workshop and its tests. One layer is 0.64 world units.
export const LAYER=.64,MIN=-10,MAX=10,CEILING=16,LIMIT=180;
export const COLORS={mint:'#65bda4',green:'#338669',gold:'#e9bf55',coral:'#df796c',blue:'#659ac4',purple:'#aa8fc5',cream:'#f3e8cc',charcoal:'#415853',orange:'#e59b55',pink:'#e3a2bb'};
export const PARTS=[
 {id:'one',name:'Little cube',w:1,d:1,h:1,group:'Bricks'},
 {id:'two',name:'Two-stud brick',w:2,d:1,h:1,group:'Bricks'},
 {id:'three',name:'Three-stud brick',w:3,d:1,h:1,group:'Bricks'},
 {id:'four',name:'Long brick',w:4,d:1,h:1,group:'Bricks'},
 {id:'square',name:'Square brick',w:2,d:2,h:1,group:'Bricks'},
 {id:'wide',name:'Wide brick',w:4,d:2,h:1,group:'Bricks'},
 {id:'pillar',name:'Tall pillar',w:1,d:1,h:3,group:'Build'},
 {id:'arch',name:'Open arch',w:4,d:1,h:3,group:'Build'},
 {id:'window',name:'Window frame',w:3,d:1,h:3,group:'Build'},
 {id:'door',name:'Door frame',w:3,d:1,h:4,group:'Build'},
 {id:'roof',name:'Pitched roof',w:4,d:3,h:2,group:'Roof & details',smooth:true},
 {id:'slope',name:'Ramp',w:3,d:2,h:2,group:'Roof & details',smooth:true},
 {id:'round',name:'Round tower',w:2,d:2,h:2,group:'Roof & details'},
 {id:'tile',name:'Smooth paving',w:2,d:2,h:1,group:'Roof & details',smooth:true},
];
export const DEF=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export function size(part){const d=DEF[part.kind];return part.rot%2?{w:d.d,d:d.w,h:d.h}:{w:d.w,d:d.d,h:d.h};}
export function localCells(kind){const d=DEF[kind],out=[];for(let y=0;y<d.h;y++)for(let x=0;x<d.w;x++)for(let z=0;z<d.d;z++){if(['arch','window','door'].includes(kind)&&x>0&&x<d.w-1&&y<d.h-1&&(kind!=='window'||y>0))continue;out.push([x,y,z]);}return out;}
function rotateCell(x,z,w,d,rot){for(let i=0;i<rot;i++){[x,z]=[d-1-z,x];[w,d]=[d,w];}return [x,z];}
export function cells(p){const d=DEF[p.kind];return localCells(p.kind).map(([x,y,z])=>{const [rx,rz]=rotateCell(x,z,d.w,d.d,p.rot||0);return [p.x+rx,p.y+y,p.z+rz];});}
export const key=c=>c.join(',');
export function occupied(parts){const map=new Map();for(const p of parts)for(const c of cells(p))map.set(key(c),p);return map;}
function hasStudSupport(p,c,map){if(c[1]===0)return true;const under=map.get(key([c[0],c[1]-1,c[2]]));return !!under&&!DEF[under.kind].smooth&&under.y+DEF[under.kind].h===c[1];}
export function placementError(parts,p){if(!DEF[p.kind]||![p.x,p.y,p.z,p.rot].every(Number.isInteger)||p.rot<0||p.rot>3)return 'Choose a valid piece and grid position.';const shape=size(p);if(p.x<MIN||p.z<MIN||p.x+shape.w>MAX||p.z+shape.d>MAX)return 'Keep every part of the piece on the building mat.';if(p.y<0||p.y+shape.h>CEILING)return 'Build between the mat and layer '+CEILING+'.';const map=occupied(parts),own=cells(p),ownKeys=new Set(own.map(key));if(own.some(c=>map.has(key(c))))return 'That space already has a piece. Move it or try a higher layer.';const bottom=own.filter(c=>!ownKeys.has(key([c[0],c[1]-1,c[2]])));if(!bottom.some(c=>hasStudSupport(p,c,map)))return 'Snap onto the mat or onto exposed studs. Smooth tops cannot hold another piece.';return null;}
export function autoLayer(parts,p){for(let y=CEILING-size(p).h;y>=0;y--){const candidate={...p,y};if(!placementError(parts,candidate))return y;}return 0;}
export function settle(parts){const placed=[];for(const p of [...parts].sort((a,b)=>a.y-b.y)){let next={...p};for(let y=0;y<=p.y;y++){const q={...p,y};if(!placementError(placed,q)){next=q;break;}}placed.push(next);}return placed;}
export function validProject(parts){if(!Array.isArray(parts)||parts.length>LIMIT)return false;const built=[];for(const p of [...parts].sort((a,b)=>a.y-b.y)){if(typeof p.id!=='string'||!COLORS[p.color]||placementError(built,p))return false;built.push(p);}return new Set(parts.map(p=>p.id)).size===parts.length;}
const b=(kind,x,y,z,color='mint',rot=0)=>({kind,x,y,z,color,rot});
export const IDEAS={
 bridge:{name:'Rainbow bridge',hint:'Build the banks, then span the gap with arches.',parts:[b('square',-4,0,0,'coral'),b('square',2,0,0,'blue'),b('arch',-3,1,0,'gold'),b('four',-3,4,0,'mint'),b('two',1,1,0,'purple'),b('pillar',-4,1,0,'cream'),b('pillar',3,1,0,'cream'),b('one',-4,4,0,'gold'),b('one',3,4,0,'gold')]},
 house:{name:'Garden cottage',hint:'Make a doorway, add walls, and finish with the roof.',parts:[b('door',-2,0,1,'coral'),b('four',-2,0,-1,'mint'),b('four',-2,1,-1,'mint'),b('four',-2,2,-1,'mint'),b('four',-2,3,-1,'mint'),b('pillar',1,0,1,'cream'),b('one',1,3,1,'cream'),b('roof',-2,4,-1,'gold')]},
 tower:{name:'Sky lookout',hint:'Stack wide foundations and finish with a colorful lookout.',parts:[b('wide',-2,0,-1,'blue'),b('wide',-2,1,-1,'mint'),b('square',-1,2,-1,'gold'),b('square',-1,3,-1,'coral'),b('square',-1,4,-1,'purple'),b('wide',-2,5,-1,'cream'),b('round',-1,6,-1,'blue'),b('square',-1,8,-1,'gold')]},
};
