import * as T from './vendor/three.module.js';
import {loadFamilyHead} from './family-avatar.js?v=1';
// Fully modeled seated family characters with sculpted, animated heads.
export function addFamilyRiders(parent){
 const group=new T.Group();group.name='Artin driving with Leo';parent.add(group);
 const hair=new T.MeshStandardMaterial({color:'#251b16',roughness:.94}),skin=new T.MeshStandardMaterial({color:'#c89372',roughness:.8}),belt=new T.MeshStandardMaterial({color:'#252a30',roughness:.86});
 function ellipsoid(g,material,pos,scale){const o=new T.Mesh(new T.SphereGeometry(1,24,16),material);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;g.add(o);return o;}
 function limb(g,a,b,r,material){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=new T.Mesh(new T.CylinderGeometry(r*.85,r,d.length(),12),material);o.position.copy(new T.Vector3(...a).addScaledVector(d,.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.add(o);}
 const heads=[],pending=[];
 for(const [i,x] of [-.39,.39].entries()){
  const child=i===1,g=new T.Group();g.position.set(x,0,-.26);g.name=child?'Leo passenger':'Artin driver';group.add(g);
  const shirt=new T.MeshStandardMaterial({color:child?'#dfddd1':'#eee9df',roughness:.9});
  ellipsoid(g,shirt,[0,.70,0],[child?.135:.19,child?.18:.23,.12]);
  ellipsoid(g,skin,[0,.91,.02],[.06,.07,.06]);
  const head=new T.Group();head.position.set(0,child?1.11:1.09,.04);g.add(head);heads.push(head);
  pending.push(loadFamilyHead(child).then(model=>head.add(model)));
  const handZ=child?.16:.39,handY=child?.61:.75;
  for(const side of [-1,1]){const shoulder=[side*(child?.115:.16),.81,.015],elbow=[side*.16,.64,.18],hand=[side*.12,handY,handZ];limb(g,shoulder,elbow,.043,shirt);limb(g,elbow,hand,.033,skin);ellipsoid(g,skin,hand,[.037,.03,.045]);}
  limb(g,[-.12,.88,.115],[.12,.51,.13],.017,belt);
  if(child){const booster=new T.Mesh(new T.BoxGeometry(.32,.07,.30),belt);booster.position.set(0,.47,0);g.add(booster);}
 }
 return {group,ready:Promise.all(pending),update(time,turn){heads[0].rotation.y=turn*.18;heads[1].rotation.y=Math.sin(time*.7)*.08;heads[1].rotation.z=Math.sin(time*.9)*.015;}};
}
