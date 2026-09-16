import * as T from './vendor/three.module.js';
// Teaching assemblies follow the exterior footprint, not undisclosed structural plans.
const V=(x,y,z)=>new T.Vector3(x,y,z);
const cache=new Map();
function mat(name,color){if(!cache.has(name)){const m=new T.MeshStandardMaterial({color,roughness:.86,metalness:0});m.name=name;m.userData.shared=true;cache.set(name,m);}return cache.get(name);}
const wood=()=>mat('Unfinished wood','#c99b60'),concrete=()=>mat('Foundation concrete','#a8aaa0');
function beam(g,a,b,width,material,depth=width){const delta=b.clone().sub(a),m=new T.Mesh(new T.BoxGeometry(width,delta.length(),depth),material);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());g.add(m);return m;}
function block(g,x,y,z,w,h,d,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);g.add(m);return m;}
function pipe(g,a,b,color,r=.033){const delta=b.clone().sub(a),m=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),8),mat('Pipe '+color,color));m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),delta.normalize());g.add(m);}
function classify(mesh,b){const role=mesh.userData.constructionRole;if(role)return role;const s=b.getSize(V()),c=mesh.material.color;
 if(b.max.y<.16)return c&&c.g>c.r*1.1&&c.g>c.b*1.1?'landscape':'driveway';
 if(mesh.material.metalness>.3)return 'windows';
 if(c&&c.g>c.r*1.13&&c.g>c.b*1.08)return 'landscape';
 if(mesh.geometry.type==='ConeGeometry'||b.min.y>1.5&&s.y<.35)return 'roof';
 if(s.y>.7&&s.x>.6&&s.z>.6)return 'finish';
 return 'details';
}
export function createHomeLesson(raw,compact,id){raw.updateMatrixWorld(true);const buckets=Object.fromEntries(['finish','roof','windows','details','driveway','landscape'].map(k=>[k,new T.Group()])),masses=[],openings=[];
 raw.traverse(o=>{if(!o.isMesh)return;const b=new T.Box3().setFromObject(o),s=b.getSize(V());let role=classify(o,b);for(let p=o.parent;p&&p!==raw;p=p.parent)if(p.userData.blueprintStage==='roof')role='roof';
 const m=o.clone();m.geometry=o.geometry.clone();m.geometry.applyMatrix4(o.matrixWorld);m.position.set(0,0,0);m.quaternion.identity();m.scale.set(1,1,1);buckets[role].add(m);
 if(role==='finish'&&o.geometry.type==='BoxGeometry'&&b.min.y<.11&&s.y>1&&s.x>.5&&s.z>.5)masses.push(b);
 if((role==='windows'&&o.material.metalness>.3||o.userData.constructionOpening)&&b.max.y>.3)openings.push(b.clone().expandByScalar(.055));
 });
 if(!masses.length){const bounds=new T.Box3().setFromObject(buckets.finish);if(!bounds.isEmpty())masses.push(bounds);}
 const parts=[];
 function add(id,name,lesson,g,until=null){if(!g.children.length)return;
 const pieces=[];
 if(/^(foundation|drains|supply|services|frame-|trusses-)/.test(id)){
  // Preserve the published major stage order. Smaller placements have their own saved counter.
  const batch=Math.max(1,Math.ceil(g.children.length/8));
  for(let i=0;i<g.children.length;i+=batch){const group=new T.Group();for(const child of g.children.slice(i,i+batch)){const clone=child.clone();clone.geometry=child.geometry.clone();group.add(clone);}const model=compact(group),bounds=new T.Box3().setFromObject(model);pieces.push({id:id+'-piece-'+pieces.length,name:name+' • piece '+(pieces.length+1),model,center:bounds.getCenter(V()),size:bounds.getSize(V())});}
 }
 const model=compact(g),bounds=new T.Box3().setFromObject(model);parts.push({id,name,lesson,model,until,pieces,center:bounds.getCenter(V()),size:bounds.getSize(V())});}
 const footings=new T.Group(),drains=new T.Group(),supply=new T.Group(),slab=new T.Group(),services=new T.Group();
 masses.forEach((b,i)=>{const {min:a,max:z}=b,w=z.x-a.x,d=z.z-a.z,c=b.getCenter(V()),h=z.y,base=.09;
 // Concrete strip footings are visible before the slab conceals the below-floor work.
 for(const zz of [a.z,z.z])block(footings,c.x,-.02,zz,w+.1,.13,.17,concrete());for(const xx of [a.x,z.x])block(footings,xx,-.02,c.z,.17,.13,d,concrete());
 pipe(drains,V(c.x,.035,a.z),V(c.x,.035,z.z),'#555b57',.052);for(const side of [-1,1]){const px=c.x+side*w*.3;pipe(drains,V(c.x,.035,c.z),V(px,.035,c.z),'#555b57',.052);pipe(drains,V(px,.035,c.z),V(px,.32,c.z),'#555b57',.052);}
 for(const [k,color] of ['#438aba','#d16a4e'].entries()){const px=a.x+.2+k*.12;pipe(supply,V(px,.09,a.z+.2),V(px,.09,z.z-.2),color,.024);pipe(supply,V(px,.09,c.z),V(c.x,.09,c.z),color,.024);pipe(services,V(px,.1,c.z),V(px,h*.72,c.z),color,.024);}
 pipe(services,V(a.x+.12,h*.55,a.z+.12),V(z.x-.12,h*.55,a.z+.12),'#dcb750',.018);
 block(slab,c.x,.02,c.z,w,.1,d,concrete());
 const frame=new T.Group();
 const floors=h>2.1?2:1,level=h/floors;
 for(let f=0;f<floors;f++){const bottom=base+f*level,top=(f+1)*level;
 for(const [p,q] of [[V(a.x,0,a.z),V(z.x,0,a.z)],[V(a.x,0,z.z),V(z.x,0,z.z)],[V(a.x,0,a.z),V(a.x,0,z.z)],[V(z.x,0,a.z),V(z.x,0,z.z)]]){
  const length=p.distanceTo(q),n=Math.ceil(length/.23);
  for(const yy of [bottom,top-.045,top])beam(frame,V(p.x,yy,p.z),V(q.x,yy,q.z),.045,wood(),.085);
  for(let j=0;j<=n;j++){const pt=p.clone().lerp(q,j/n),cuts=openings.filter(o=>pt.x>=o.min.x-.045&&pt.x<=o.max.x+.045&&pt.z>=o.min.z-.045&&pt.z<=o.max.z+.045&&o.max.y>bottom&&o.min.y<top);
   let ranges=[[bottom,top]];for(const cut of cuts)ranges=ranges.flatMap(([lo,hi])=>cut.max.y<=lo||cut.min.y>=hi?[[lo,hi]]:[[lo,Math.max(lo,cut.min.y)],[Math.min(hi,cut.max.y),hi]]);
   for(const [lo,hi] of ranges)if(hi-lo>.04)beam(frame,V(pt.x,lo,pt.z),V(pt.x,hi,pt.z),.043,wood(),.07);
  }
  for(const o of openings){const oc=o.getCenter(V());const alongX=Math.abs(q.x-p.x)>.1;if(oc.y<bottom||oc.y>top)continue;if(alongX?Math.abs(oc.z-p.z)>.16:Math.abs(oc.x-p.x)>.16)continue;
   const lo=alongX?Math.max(a.x,o.min.x):Math.max(a.z,o.min.z),hi=alongX?Math.min(z.x,o.max.x):Math.min(z.z,o.max.z);if(hi<=lo)continue;
   for(const yy of [o.min.y,o.max.y+.045])beam(frame,alongX?V(lo,yy,p.z):V(p.x,yy,lo),alongX?V(hi,yy,p.z):V(p.x,yy,hi),.07,wood(),.09);
  }
 }
 if(f>0)for(let xx=a.x;xx<=z.x;xx+=.25)beam(frame,V(xx,bottom,a.z),V(xx,bottom,z.z),.055,wood(),.1);
 }
 add('frame-'+i,'Wood framing: section '+(i+1),'Studs hold up the walls. Headers bridge the window openings; plates tie the studs together.',frame,'finish');
 const truss=new T.Group(),ridge=h+(['modernEstate','midcenturyEstate','contemporaryEstate'].includes(id)?.08:Math.min(.8,Math.min(w,d)*.24)),acrossX=w<d;
 const count=Math.max(2,Math.ceil((acrossX?d:w)/.35));for(let j=0;j<=count;j++){const t=j/count;const p=acrossX?V(a.x,h,a.z+t*d):V(a.x+t*w,h,a.z),q=acrossX?V(z.x,h,a.z+t*d):V(a.x+t*w,h,z.z),r=p.clone().add(q).multiplyScalar(.5);r.y=ridge;
 for(const [u,v] of [[p,q],[p,r],[q,r],[p.clone().lerp(q,.5),r]])beam(truss,u,v,.055,wood());}
 add('trusses-'+i,'Wood roof framing: section '+(i+1),'Wood rafters and ties support the roof. The roof covering comes later.',truss,'roof');
 });
 // Reorder by trade so every wing reaches the same milestone before the next trade starts.
 const frames=parts.filter(p=>p.id.startsWith('frame-')),trusses=parts.filter(p=>p.id.startsWith('trusses-'));parts.length=0;
 add('foundation','Foundation footings','The foundation spreads the weight of the house into the ground. A builder checks the layout and reinforcing before concrete is poured.',footings,'finish');
 add('drains','Underground drain pipes','These pipes carry used water away. We place and test them before covering them with the floor.',drains,'slab');
 add('supply','Water supply pipes','Blue marks cold water and red marks hot water in our teaching model. Real pipe routes depend on the plans.',supply,'slab');
 add('slab','Concrete floor slab','The checked pipes are now below the floor. Concrete makes a firm base for our wood walls.',slab,'finish');
 parts.push(...frames,...trusses);
 add('services','Rough plumbing and electrical','Pipes and wiring run through the open walls. Builders inspect and test this work before covering it.',services,'finish');
 const shell=new T.Group();for(const child of buckets.finish.children){const m=child.clone();m.geometry=child.geometry.clone();m.material=mat('Wall sheathing and weather barrier','#bbbca3');shell.add(m);}add('shell','Sheathing and weather barrier','Sheathing braces the frame. A weather barrier and flashing help keep rain outside.',shell,'finish');
 const underlay=new T.Group();for(const child of buckets.roof.children){const m=child.clone();m.geometry=child.geometry.clone();m.material=mat('Roof underlayment','#6b766c');underlay.add(m);}add('underlay','Roof decking and underlayment','The roof gets a weather-resistant base before the final tiles or shingles.',underlay,'roof');
 add('windows','Windows and flashing','Windows fit into framed openings. Flashing guides water back outside instead of into the wall.',buckets.windows);
 add('finish','Insulation, walls, and exterior finish','Insulation helps rooms stay comfortable. Interior wallboard and exterior stucco or brick cover the checked structure.',buckets.finish);
 add('roof','Roof tiles or shingles','Overlapping roof pieces shed rain. Gutters and flashings help direct it away.',buckets.roof);
 add('details','Doors, trim, and finishing touches','Doors, trim, and fixtures complete the house. Builders check that everything works.',buckets.details);
 add('driveway','Driveway, paths, and pool deck','Outdoor paving comes after the heavy building work. It needs drainage so water flows away from the house.',buckets.driveway);
 add('landscape','Landscaping and final walkthrough','Plant the garden, finish the outdoor spaces, and check the completed home together.',buckets.landscape);
 return parts;
}
export function homeLessonModel(parts,step,pieceCount=0){const g=new T.Group(),n=Math.max(0,Math.min(parts.length,Math.floor(step)));for(let i=0;i<n;i++){const p=parts[i],end=p.until?parts.findIndex(x=>x.id===p.until):-1;if(end>=0&&n>end)continue;const piece=p.model.clone();piece.userData.lessonPart=p.id;g.add(piece);}const active=parts[n];if(active?.pieces)for(const p of active.pieces.slice(0,Math.max(0,Math.floor(pieceCount)||0))){const piece=p.model.clone();piece.userData.lessonPart=p.id;g.add(piece);}return g;}
