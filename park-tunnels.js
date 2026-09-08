import * as T from './vendor/three.module.js';
import {frame} from './park-geometry.js?v=expansion2';
export function riverTunnel(curve,t,kind='cave'){
 const group=new T.Group(),positions=[],indices=[],steps=24,sides=20,length=kind==='cave'?6:8,radius=1.48,height=2.15;
 for(let layer=0;layer<2;layer++)for(let i=0;i<=steps;i++){
  const {p,n}=frame(curve,t+(i/steps-.5)*length/curve.getLength());
  for(let j=0;j<=sides;j++){const a=j/sides*Math.PI,rough=kind==='cave'&&layer?Math.sin(i*2.1+j*3.7)*.10:0,r=radius+layer*.35+rough;const q=p.clone().addScaledVector(n,Math.cos(a)*r);q.y+=.06+Math.sin(a)*(height+layer*.35+rough);positions.push(q.x,q.y,q.z);}
 }
 const stride=sides+1,layerSize=(steps+1)*stride;
 for(let layer=0;layer<2;layer++)for(let i=0;i<steps;i++)for(let j=0;j<sides;j++){const a=layer*layerSize+i*stride+j;indices.push(a,a+1,a+stride,a+1,a+stride+1,a+stride);}
 for(const i of [0,steps])for(let j=0;j<sides;j++){const a=i*stride+j,b=a+layerSize;indices.push(a,b,a+1,a+1,b,b+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const shell=new T.Mesh(geo,new T.MeshStandardMaterial({color:kind==='cave'?'#766e5e':'#b9c3c0',roughness:kind==='cave'?.97:.48,side:T.DoubleSide}));shell.castShadow=true;shell.receiveShadow=true;group.add(shell);
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=steps;i++){const {p,n}=frame(curve,t+(i/steps-.5)*length/curve.getLength());pts.push(p.addScaledVector(n,side*1.40).add(new T.Vector3(0,.58,0)));}group.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),steps,.025,5,false),new T.MeshStandardMaterial({color:kind==='cave'?'#f2d29b':'#8de4dd',emissive:kind==='cave'?'#e9a44b':'#32bab5',emissiveIntensity:.6})));}
 if(kind==='cave')for(const end of [-.5,.5]){const {p,n}=frame(curve,t+end*length/curve.getLength());for(let j=0;j<=12;j++){const a=j/12*Math.PI;const rock=new T.Mesh(new T.DodecahedronGeometry(.32,0),new T.MeshStandardMaterial({color:j%2?'#8d8370':'#797260',roughness:1}));rock.position.copy(p).addScaledVector(n,Math.cos(a)*1.76);rock.position.y+=.08+Math.sin(a)*2.46;rock.scale.set(1.1,.8,1);rock.castShadow=true;rock.receiveShadow=true;group.add(rock);}}
 group.userData.tunnelLength=length;return group;
}
