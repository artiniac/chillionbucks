import * as T from './vendor/three.module.js';

// Soft air, resonant bell partials, and a short harmonic tail. These are reward
// sounds, separate from the unedited engine recordings.
export class GateAudio {
 constructor(context){this.context=context;this.voices=new Set();this.last=-10;}
 ready(){
  const a=this.context();if(!a||!window.SFX?.on||document.hidden)return null;
  if(!this.bus){this.bus=a.createGain();const limiter=a.createDynamicsCompressor();limiter.threshold.value=-15;limiter.ratio.value=3;this.bus.connect(limiter).connect(a.destination);
   this.noise=a.createBuffer(1,Math.ceil(a.sampleRate*.8),a.sampleRate);const samples=this.noise.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.65;
  }
  this.bus.gain.cancelScheduledValues(a.currentTime);this.bus.gain.setValueAtTime(.48,a.currentTime);return a;
 }
 play(index=0,drifting=false,finish=false){
  const a=this.ready();if(!a||a.currentTime-this.last<.15)return;this.last=a.currentTime;
  const t=a.currentTime,root=440*Math.pow(2,[0,2,4,7,9][index%5]/12),notes=finish?[0,4,7,12]:drifting?[0,7,12]:[0,7];
  const noise=a.createBufferSource(),band=a.createBiquadFilter(),air=a.createGain();noise.buffer=this.noise;band.type='bandpass';band.Q.value=.65;
  band.frequency.setValueAtTime(drifting?600:850,t);band.frequency.exponentialRampToValueAtTime(3000,t+.16);band.frequency.exponentialRampToValueAtTime(650,t+.48);
  air.gain.setValueAtTime(0,t);air.gain.linearRampToValueAtTime(drifting?.24:.15,t+.065);air.gain.exponentialRampToValueAtTime(.0001,t+.52);
  noise.connect(band).connect(air).connect(this.bus);this.track(noise,[noise,band,air]);noise.start(t);noise.stop(t+.55);
  notes.forEach((semitone,n)=>{
   const start=t+.045+n*.065,f=root*Math.pow(2,semitone/12);
   for(const [ratio,weight,decay] of [[1,.13,.7],[2.005,.032,.28],[3.98,.009,.16]]){
    const osc=a.createOscillator(),gain=a.createGain();osc.type='sine';osc.frequency.setValueAtTime(f*ratio,start);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(weight,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+decay);
    osc.connect(gain).connect(this.bus);this.track(osc,[osc,gain]);osc.start(start);osc.stop(start+decay+.02);
   }
  });
 }
 track(source,nodes){this.voices.add(source);source.onended=()=>{this.voices.delete(source);for(const node of nodes)node.disconnect();};}
 quiet(){if(this.bus)this.bus.gain.setValueAtTime(0,this.context().currentTime);for(const source of this.voices){try{source.stop();}catch{}}this.voices.clear();}
}

export class DriveRewards {
 constructor(scene,context,{reduced=false}={}){
  this.audio=new GateAudio(context);this.reduced=reduced;this.next=0;
  this.particleGeometry=new T.OctahedronGeometry(.075);this.ringGeometry=new T.TorusGeometry(1,.012,6,64,Math.PI);this.matrix=new T.Matrix4();this.q=new T.Quaternion();this.scale=new T.Vector3();
  this.pool=Array.from({length:3},()=>{
   const group=new T.Group();group.visible=false;scene.add(group);
   const ring=new T.Mesh(this.ringGeometry,new T.MeshBasicMaterial({color:'#ffe19a',transparent:true,depthWrite:false}));group.add(ring);
   const particles=new T.InstancedMesh(this.particleGeometry,new T.MeshBasicMaterial({color:'#ffe2a0',transparent:true,depthWrite:false}),48);particles.instanceMatrix.setUsage(T.DynamicDrawUsage);particles.frustumCulled=false;group.add(particles);
   const lineGeometry=new T.BufferGeometry();lineGeometry.setAttribute('position',new T.Float32BufferAttribute(new Float32Array(48*6),3));
   const trails=new T.LineSegments(lineGeometry,new T.LineBasicMaterial({color:'#fff1bd',transparent:true,depthWrite:false}));trails.frustumCulled=false;group.add(trails);
   return {group,ring,particles,trails,age:2,seeds:[]};
  });
 }
 burst(position,heading,width,drifting=false){
  const fx=this.pool[this.next++%this.pool.length];fx.group.position.copy(position);fx.group.rotation.y=heading;fx.group.visible=true;fx.age=0;fx.width=width;fx.drifting=drifting;
  fx.seeds=Array.from({length:48},(_,i)=>{const angle=(i+.5)/48*Math.PI,r=width/2+.6;return {x:Math.cos(angle)*r,y:Math.sin(angle)*r+.15,z:0,vx:Math.cos(angle)*1.3,vy:.8+Math.sin(angle)*1.8,vz:drifting?5:3};});
  this.update(0);
 }
 gate(position,heading,width,index,drifting){this.burst(position,heading,width,drifting);this.audio.play(index,drifting,index===4);}
 drift(position,heading){this.burst(position,heading,3,true);this.audio.play(2,true);}
 update(dt){
  if(!window.SFX?.on||document.hidden)this.audio.quiet();
  for(const fx of this.pool){if(!fx.group.visible)continue;fx.age+=dt;const t=fx.age,duration=this.reduced?.35:1.15;if(t>duration){fx.group.visible=false;continue;}
   const fade=Math.pow(1-t/duration,2),r=fx.width/2+.6;
   fx.ring.scale.setScalar(r*(1+(this.reduced?0:t*.24)));fx.ring.material.opacity=fade*.8;fx.ring.position.z=this.reduced?0:t*.6;
   fx.particles.visible=fx.trails.visible=!this.reduced;fx.particles.material.opacity=fade;fx.trails.material.opacity=fade*.42;
   if(this.reduced)continue;
   const vertices=fx.trails.geometry.attributes.position;
   for(const [i,p] of fx.seeds.entries()){
    const x=p.x+p.vx*t,y=p.y+p.vy*t-t*t*1.5,z=p.vz*t;
    this.scale.setScalar((fx.drifting?1.25:1)*(1-t/duration));this.matrix.compose(new T.Vector3(x,y,z),this.q,this.scale);fx.particles.setMatrixAt(i,this.matrix);
    vertices.setXYZ(i*2,x,y,z);vertices.setXYZ(i*2+1,x-p.vx*.12,y-p.vy*.12,z-.55);
   }
   fx.particles.instanceMatrix.needsUpdate=true;vertices.needsUpdate=true;
  }
 }
 quiet(){this.audio.quiet();}
 clear(){for(const fx of this.pool)fx.group.visible=false;this.quiet();}
}
