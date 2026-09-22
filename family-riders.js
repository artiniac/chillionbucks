import * as T from './vendor/three.module.js';
import {loadFamilyHead} from './family-avatar.js?v=2';
import {createSeatedBody,part} from './family-body.js?v=1';
import {addNismoSeats} from './skyline-cabin.js?v=1';
// Preserve the accepted reconstructed faces and fit complete seated bodies to
// the photo-referenced pair of front bucket seats.
export function addFamilyRiders(parent){
 const group=new T.Group();group.name='Artin driving with Leo';parent.add(group);addNismoSeats(group);
 const heads=[],bodies=[],pending=[];
 for(const [i,x] of [-.39,.39].entries()){
  const child=i===1,g=new T.Group();g.position.set(x,0,-.26);g.name=child?'Leo passenger':'Artin driver';group.add(g);
  const body=createSeatedBody(child);g.add(body.group);bodies.push(body);
  const head=new T.Group();head.position.set(0,child?1.11:1.09,.04);g.add(head);heads.push(head);pending.push(loadFamilyHead(child,{fitShirt:true}).then(model=>head.add(model)));
  if(child){const booster=part(g,'Leo fitted booster cushion',new T.BoxGeometry(.31,.075,.29,2,2,2),new T.MeshStandardMaterial({color:'#22252a',roughness:.95}));booster.position.set(0,.492,.035);}
 }
 return {group,ready:Promise.all(pending),update(time,turn){heads[0].rotation.y=turn*.18;heads[1].rotation.y=Math.sin(time*.7)*.08;heads[1].rotation.z=Math.sin(time*.9)*.015;for(const body of bodies)body.update(time);}};
}
