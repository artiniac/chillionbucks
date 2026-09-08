import * as T from './vendor/three.module.js';
import {Water} from './vendor/Water.js';

// A recessed pool appearance without an extra refraction render pass. The
// submerged tile field is shaded analytically; above-water reflections are real.
let reflectionActive=false;
export function poolWater(geometry,{sun=new T.Vector3(-22,32,14),height=.12,lagoon=false}={}){
 geometry.translate(0,-height,0).rotateX(Math.PI/2);
 const water=new Water(geometry,{textureWidth:lagoon?256:innerWidth<650?384:768,textureHeight:lagoon?256:innerWidth<650?384:768,sunDirection:sun.clone().normalize(),sunColor:'#fff4df',fog:true});
 water.rotation.x=-Math.PI/2;water.position.y=height;
 const m=water.material;m.uniforms.lagoon={value:lagoon?1:0};m.uniforms.rippleCount={value:0};m.uniforms.ripples={value:Array.from({length:8},()=>new T.Vector2())};m.name='Clear resort pool water';m.transparent=false;m.depthWrite=true;m.side=T.DoubleSide;
 m.vertexShader=m.vertexShader.replace('varying vec4 mirrorCoord;','varying vec4 mirrorCoord;\nvarying vec2 poolUv;').replace('mirrorCoord = modelMatrix','poolUv = uv;\nmirrorCoord = modelMatrix');
 const pre=m.fragmentShader.slice(0,m.fragmentShader.indexOf('void main()'));
 m.fragmentShader=pre+`
 varying vec2 poolUv;
 uniform float lagoon;
 uniform int rippleCount;
 uniform vec2 ripples[8];
 vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
 float caustic(vec2 p){
  vec2 cell=floor(p),f=fract(p);float first=8.0,second=8.0;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
   vec2 q=vec2(float(x),float(y)),h=hash2(cell+q);
   vec2 delta=q+.5+.29*sin(time*.65+6.2831*h)-f;float d=dot(delta,delta);
   if(d<first){second=first;first=d;}else{second=min(second,d);}
  }
  return pow(1.0-smoothstep(.0,.19,second-first),3.0);
 }
 void main(){
  #include <logdepthbuf_fragment>
  vec2 p=worldPosition.xz;
  // Independent waves at several wavelengths, in world meters.
  vec2 slope=vec2(.025, .012)*cos(dot(p,vec2(2.7,1.3))-time*1.25)
   +vec2(-.018,.032)*cos(dot(p,vec2(-4.1,7.2))-time*1.7)
   +vec2(.014,.009)*cos(dot(p,vec2(12.3,7.9))+time*2.1)
   +vec2(.006,-.012)*cos(dot(p,vec2(22.1,-31.4))-time*2.8);
  for(int i=0;i<8;i++){if(i>=rippleCount)break;vec2 delta=p-ripples[i];float radius=length(delta);float envelope=exp(-max(0.0,radius-.35)*2.8)*smoothstep(.25,.45,radius);slope+=delta/max(radius,.01)*cos(radius*22.0-time*5.5)*.024*envelope;}
  vec3 n=normalize(vec3(-slope.x,1.0,-slope.y));
  vec3 view=normalize(eye-worldPosition.xyz);
  float facing=clamp(dot(n,view),0.0,1.0);
  float fresnel=.0204+.9796*pow(1.0-facing,5.0);
  float edge=lagoon>.5?(1.0-length((poolUv-.5)*2.0))*2.7:min(poolUv.y,1.0-poolUv.y)*2.1;
  float depth=mix(.28,1.15,smoothstep(0.0,.30,edge));
  vec3 refracted=refract(-view,n,1.0/1.333);
  float travel=depth/max(.25,-refracted.y);
  vec2 floorP=p+refracted.xz*travel;
  vec2 tileP=floorP*9.0,grid=abs(fract(tileP)-.5);
  vec2 aa=max(fwidth(tileP),vec2(.008));
  float grout=max(smoothstep(.47-aa.x,.49+aa.x,grid.x),smoothstep(.47-aa.y,.49+aa.y,grid.y));
  float variation=hash2(floor(tileP)).x;
  vec3 tile=mix(vec3(.34,.70,.69),vec3(.62,.85,.78),variation*.55);
  tile=mix(tile,vec3(.28,.48,.44),grout*.45);
  float lightPattern=caustic(floorP*2.7+vec2(sin(floorP.y*3.1+time*.4),cos(floorP.x*2.8-time*.3))*.28);
  float shadow=mix(.35,1.0,getShadowMask());
  tile*=shadow*(.80+lightPattern*.28);
  vec3 transmittance=exp(-vec3(.53,.105,.065)*travel);
  vec3 transmitted=tile*transmittance+vec3(.015,.29,.32)*(1.0-transmittance);
  vec2 reflectedUv=mirrorCoord.xy/mirrorCoord.w+slope*.018;
  vec3 reflected=texture2D(mirrorSampler,clamp(reflectedUv,vec2(.002),vec2(.998))).rgb;
  vec3 halfVector=normalize(view+sunDirection);
  float glint=pow(max(dot(n,halfVector),0.0),420.0)*2.2;
  vec3 color=mix(transmitted,reflected,fresnel)+sunColor*glint*shadow;
  // Quiet, thin waterline highlight rather than a strip of white foam.
  color+=vec3(.05,.10,.09)*(1.0-smoothstep(.0,.025,edge));
  gl_FragColor=vec4(color,alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
 }`;
 const reflect=water.onBeforeRender;let rendering=false;
 water.onBeforeRender=function(renderer,scene,camera,...rest){if(rendering||reflectionActive)return;rendering=true;reflectionActive=true;try{reflect.call(this,renderer,scene,camera,...rest);}finally{rendering=false;reflectionActive=false;}};
 water.userData.disturbances=points=>{m.uniforms.rippleCount.value=Math.min(8,points.length);points.slice(0,8).forEach((p,i)=>m.uniforms.ripples.value[i].set(p.x,p.z));};
 water.userData.tick=t=>{m.uniforms.time.value=t;};
 return water;
}
