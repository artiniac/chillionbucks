import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';

export const SKYLINE_FINISHES = [
 {id:'artin',name:'Artin’s red R34',color:'#b90920'},
 {id:'brian',name:'Silver + blue stripes',color:'#c3d2df'},
];

// Keep the supplied mesh and its original materials available for the silver car.
// The red finish is a photo-informed variation, not a measured replica.
export function skylineFinish(materials, paint, parent, wheels=[]){
 const customWheels=wheels.map(w=>{
  const old=w.spin.children.filter(o=>o.isMesh&&(/3DWheel1A_Material1\.013$/.test(o.material.name)||o.material.name==='material'));
  const metal=new T.MeshStandardMaterial({color:'#aeb4b8',metalness:.9,roughness:.23});
  const parts=[];const shape=new T.Shape();shape.moveTo(-.020,.052);shape.quadraticCurveTo(-.030,.13,-.010,.232);shape.lineTo(.012,.232);shape.quadraticCurveTo(-.002,.14,.020,.052);shape.closePath();
  const spoke=new T.ExtrudeGeometry(shape,{depth:.020,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.004,bevelThickness:.004,curveSegments:8});
  for(let i=0;i<10;i++)parts.push(spoke.clone().rotateZ(i*Math.PI/5));spoke.dispose();
  for(const z of [0,-.035])parts.push(new T.TorusGeometry(.238,.012,8,64).translate(0,0,z));
  parts.push(new T.CylinderGeometry(.058,.058,.03,32).rotateX(Math.PI/2));
  for(let i=0;i<5;i++){const a=i*Math.PI*.4;parts.push(new T.CylinderGeometry(.009,.009,.033,6).rotateX(Math.PI/2).translate(Math.sin(a)*.040,Math.cos(a)*.040,.010));}
  const geometries=parts.map(g=>{const n=g.index?g.toNonIndexed():g;return n;});
  const geometry=mergeGeometries(geometries);for(const g of new Set([...parts,...geometries]))g.dispose();
  const rim=new T.Mesh(geometry,metal);rim.name='Artin R34 ten-spoke wheel';rim.rotation.y=Math.sign(w.pivot.position.x)*Math.PI/2;rim.position.x=Math.sign(w.pivot.position.x)*.146;rim.castShadow=true;w.spin.add(rim);
  return {old,rim};
 });
 const originals=new Map([...new Set(materials)].map(m=>[m,m.clone()]));
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=224;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#10151b';ctx.fillRect(0,0,512,224);
 ctx.strokeStyle='#616a70';ctx.lineWidth=12;ctx.strokeRect(8,8,496,208);
 ctx.textAlign='center';ctx.fillStyle='#f6f3e5';ctx.font='bold 78px sans-serif';ctx.fillText('NAZLAW',256,142);
 ctx.fillStyle='#c25551';ctx.font='22px sans-serif';ctx.fillText('LOYOLA',256,44);ctx.fillText('LAW SCHOOL',256,196);
 const plate=new T.Mesh(new T.PlaneGeometry(.30,.132),new T.MeshStandardMaterial({map:new T.CanvasTexture(canvas),roughness:.4,metalness:.15}));
 plate.material.map.colorSpace=T.SRGBColorSpace;plate.position.set(0,.506,-2.251);plate.rotation.y=Math.PI;plate.name='Artin NAZLAW rear plate';parent.add(plate);
 return function setFinish(id='artin',color){
  const red=id==='artin';paint.color.set(color||(red?'#b90920':'#c3d2df'));
  for(const [m,original] of originals){
   m.color=m.color.clone();m.copy(original);
   if(m.name.includes('Paint_Material')){
    m.color=paint.color;m.metalness=red?.48:.7;m.roughness=red?.22:.25;
    if(red){m.map=null;m.metalnessMap=null;m.roughnessMap=null;m.clearcoat=1;m.clearcoatRoughness=.12;}
   }
   if(red&&m.name.includes('Coloured_Material')){
    m.map=null;m.metalnessMap=null;m.roughnessMap=null;m.color=paint.color;m.metalness=.38;m.roughness=.26;
   }
   if(red&&(/3DWheel1A_Material1\.013$/.test(m.name)||m.name==='material')){
    m.color.set('#82878b');m.metalness=.86;m.roughness=.27;
   }
   m.needsUpdate=true;
  }
  plate.visible=red;for(const {old,rim} of customWheels){rim.visible=red;for(const mesh of old)mesh.visible=!red;}
 };
}
