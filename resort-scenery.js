import * as T from './vendor/three.module.js';
import {block,mesh} from './chilltopia-models.js?v=estates4';
import {scannedMaterial} from './realism.js?v=estates4';
// Fixed promenade furniture is outside the editable river and its ride envelope.
export function resortPromenade(){const g=new T.Group(),stone=scannedMaterial('concrete_pavement',[2,1],'#dfd5bc'),fabric=new T.MeshStandardMaterial({color:'#f0e8d7',roughness:.95}),teak=new T.MeshStandardMaterial({color:'#9c7953',roughness:.8}),metal=new T.MeshStandardMaterial({color:'#c4ccca',metalness:.8,roughness:.26});
 for(const x of [-10,-5,0,5,10]){const bay=new T.Group();bay.position.set(x,0,23);g.add(bay);block(bay,stone,0,-.12,0,4.6,.25,4);for(const a of [-1.65,1.65])for(const b of [-1.4,1.4])block(bay,teak,a,1.25,b,.075,2.5,.075);
  const roof=new T.Mesh(new T.ConeGeometry(2.6,.6,4),fabric);roof.rotation.y=Math.PI/4;roof.scale.z=.9;roof.position.y=2.65;roof.castShadow=true;bay.add(roof);
  for(const a of [-.85,.85]){const chair=new T.Group();chair.position.set(a,0,.25);bay.add(chair);for(const z of [-.65,.65])for(const side of [-.32,.32])block(chair,metal,side,.23,z,.035,.46,.035);block(chair,teak,0,.43,0,.78,.075,1.9);block(chair,fabric,0,.5,.2,.7,.08,1.15);const back=block(chair,fabric,0,.77,-.57,.7,.09,.85);back.rotation.x=.65;block(chair,fabric,0,1.03,-.78,.55,.1,.2);for(const side of [-.42,.42])block(chair,teak,side,.68,.12,.045,.06,.95);}
  mesh(bay,new T.CylinderGeometry(.28,.28,.06,20),teak,0,.58,.45);mesh(bay,new T.CylinderGeometry(.035,.07,.55,10),metal,0,.28,.45);
 }
 // Low resort buildings and tiled roofs establish a believable destination.
 for(const x of [-17,17]){const h=new T.Group();h.position.set(x,0,22);g.add(h);block(h,'#e6dcc6',0,1.45,0,5,2.9,4);const roof=new T.Mesh(new T.ConeGeometry(3.7,1,4),new T.MeshStandardMaterial({color:'#a96848',roughness:.84}));roof.rotation.y=Math.PI/4;roof.position.y=3.25;roof.castShadow=true;h.add(roof);for(const a of [-1.4,0,1.4]){block(h,'#386466',a,1.45,2.03,1.1,1.5,.05);block(h,'#e8dabe',a,2.3,2.1,1.25,.09,.18);}for(const a of [-2.6,2.6])block(h,teak,a,1.35,2.7,.1,2.7,.1);block(h,teak,0,2.7,2.65,5.5,.12,1.35);}
 return g;
}
