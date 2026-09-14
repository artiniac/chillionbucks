// Recorded engine layers from the owner's Skyline. No synthetic engine oscillator.
export class Motor{
 constructor(){this.a=null;this.gear=0;this.shiftUntil=0;this.lastRelease=-10;this.previousLoad=0;this.layers=[];this.wasRunning=false;this.lastEngine=-10;}
 start(){if(!window.SFX?.on)return;try{if(!this.a)this.build();this.a.resume().catch(()=>{});}catch{}}
 build(){const a=this.a=new(window.AudioContext||window.webkitAudioContext)();this.master=a.createGain();this.master.gain.value=0;const limiter=a.createDynamicsCompressor();limiter.threshold.value=-16;limiter.ratio.value=4;this.master.connect(limiter).connect(a.destination);
 this.loading=Promise.all(['low','mid','high','release'].map(async name=>{const response=await fetch(new URL('./assets/audio/skyline/'+name+'.wav',import.meta.url));if(!response.ok)throw Error('Audio unavailable');const buffer=await a.decodeAudioData(await response.arrayBuffer());if(name==='release'){this.releaseBuffer=buffer;return;}const source=a.createBufferSource(),gain=a.createGain();source.buffer=buffer;source.loop=false;gain.gain.value=0;source.connect(gain).connect(this.master);this.layers.push({name,source,gain,buffer});})).catch(()=>{});
 }
 release(t){if(!this.releaseBuffer||t-this.lastRelease<1.5)return;this.lastRelease=t;const source=this.a.createBufferSource(),gain=this.a.createGain();source.buffer=this.releaseBuffer;gain.gain.value=.22;source.connect(gain).connect(this.master);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();}
 update(speed,drift,running,time,motion={}){if(!this.a)return;const t=this.a.currentTime,active=running&&window.SFX?.on&&!document.hidden,load=motion.throttle??.4;
 // Hysteresis prevents gear chatter near shift thresholds.
 let gear=this.gear;const up=[6,11,17,25],down=[0,4,8.5,14];if(gear<3&&speed>up[gear])gear++;else if(gear>0&&speed<down[gear])gear--;
 if(active&&((gear>this.gear&&load>.2)||(this.previousLoad>.55&&load<.15&&speed>7))){this.release(t);this.shiftUntil=t+.14;}this.gear=gear;this.previousLoad=active?load:0;
 const rpm=Math.max(1000,Math.min(7200,1200+speed*[610,390,285,215][gear])),blend=Math.max(0,Math.min(2,(rpm-1200)/2600)),shift=t<this.shiftUntil?.48:1;
 // Never repeat a short driving recording continuously. Play a brief recorded
 // acceleration only when starting; let the transient finish naturally.
 if(active&&!this.wasRunning&&t-this.lastEngine>2){const layer=this.layers.find(l=>l.name==='high');if(layer){const source=this.a.createBufferSource(),gain=this.a.createGain();source.buffer=layer.buffer;gain.gain.value=.28;source.connect(gain).connect(this.master);source.onended=()=>{source.disconnect();gain.disconnect();};source.start();this.lastEngine=t;}}
 this.wasRunning=active;

 this.master.gain.setTargetAtTime(active?.65:0,t,.09);
 }
 quiet(){if(this.a){this.previousLoad=0;this.wasRunning=false;this.master.gain.cancelScheduledValues(this.a.currentTime);this.master.gain.setTargetAtTime(0,this.a.currentTime,.025);}}
}
