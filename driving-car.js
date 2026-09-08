import * as T from './vendor/three.module.js';
export {skylineCoupe as makeCar} from './skyline-model.js';
export class Motor{
 constructor(){this.a=null;this.on=false;}
 start(){if(!window.SFX?.on)return;try{if(!this.a){const a=this.a=new(window.AudioContext||window.webkitAudioContext)(),master=this.master=a.createGain();master.gain.value=0;const compressor=a.createDynamicsCompressor();master.connect(compressor).connect(a.destination);this.oscs=[1,2,3].map((n,i)=>{const o=a.createOscillator(),g=a.createGain();const real=new Float32Array(33),imag=new Float32Array(33);for(let h=1;h<33;h++)imag[h]=(h%3===0?1.3:.75)*Math.exp(-h*.14)/Math.sqrt(h);o.setPeriodicWave(a.createPeriodicWave(real,imag));g.gain.value=[.19,.08,.035][i];const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=850;o.connect(g).connect(f).connect(master);o.start();return o;});const buffer=a.createBuffer(1,a.sampleRate*2,a.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const n=a.createBufferSource();n.buffer=buffer;n.loop=true;const filter=a.createBiquadFilter();filter.type='bandpass';filter.frequency.value=2400;filter.Q.value=2;this.hiss=a.createGain();this.hiss.gain.value=0;n.connect(filter).connect(this.hiss).connect(master);n.start();this.turbo=a.createOscillator();this.turbo.type='sine';this.turboGain=a.createGain();this.turboGain.gain.value=.007;this.turbo.connect(this.turboGain).connect(master);this.turbo.start();}this.a.resume().catch(()=>{});}catch{}}
 update(speed,drift,running,time){if(!this.a)return;const t=this.a.currentTime,active=running&&window.SFX?.on&&!document.hidden;this.master.gain.setTargetAtTime(active?.38:0,t,.12);const gear=Math.min(4,Math.floor(speed/5)),rev=80+(speed%5)*22+Math.sin(time*8)*1.3+(drift?16:0);this.oscs.forEach((o,i)=>o.frequency.setTargetAtTime(rev*[1,1.004,.5][i],t,.07));this.turbo.frequency.setTargetAtTime(1100+speed*65,t,.12);this.hiss.gain.setTargetAtTime(drift?.13:.013,t,.12);if(this.gear!==undefined&&gear!==this.gear&&active)window.SFX?.noise(.12,.02,1400);this.gear=gear;}
 quiet(){if(this.a){this.master.gain.setValueAtTime(0,this.a.currentTime);this.a.suspend().catch(()=>{});}}
}

export function driftStep(state,{held,running,turn,steer=0,dt}){
 const direction=Math.abs(steer)>.15?Math.sign(steer):Math.sign(turn),sliding=held&&running&&(Math.abs(turn)>.025||Math.abs(steer)>.15);
 const target=sliding?direction*(.32+Math.min(.3,Math.abs(turn))):0;
 const velocity=(state.velocity||0)+(target-state.angle)*32*dt-(state.velocity||0)*8*dt;
 const angle=Math.max(-.65,Math.min(.65,state.angle+velocity*dt));
 let seconds=state.seconds,awarded=state.awarded,award=false;if(sliding){seconds+=dt;if(seconds>1&&!awarded){awarded=true;award=true;}}else if(!held){seconds=0;awarded=false;}
 return {angle,velocity,seconds,awarded,award,sliding};
}
