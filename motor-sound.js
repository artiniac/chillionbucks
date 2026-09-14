// Full owner-supplied pulls, triggered by acceleration, never repeated on a timer.
export class Motor {
 constructor(){this.a=null;this.previousLoad=0;this.lastRelease=-10;this.nextPull=0;this.pull=null;this.armed=true;this.releaseBuffer=null;this.pulls=[];}
 start(){if(!window.SFX?.on)return;try{if(!this.a)this.build();this.a.resume().catch(()=>{});}catch{}}
 build(){
  const a=this.a=new(window.AudioContext||window.webkitAudioContext)();
  this.master=a.createGain();this.master.gain.value=0;
  const limiter=a.createDynamicsCompressor();limiter.threshold.value=-16;limiter.ratio.value=4;
  this.master.connect(limiter).connect(a.destination);
  this.loading=Promise.all(['pull-a','pull-b','pull-c','pull-d','release'].map(async name=>{
   const response=await fetch(new URL('./assets/audio/skyline/'+name+'.wav',import.meta.url));
   if(!response.ok)throw Error('Audio unavailable');
   const buffer=await a.decodeAudioData(await response.arrayBuffer());
   if(name==='release')this.releaseBuffer=buffer;else this.pulls['abcd'.indexOf(name.slice(-1))]=buffer;
  })).catch(()=>{});
 }
 play(buffer,volume){
  const source=this.a.createBufferSource(),gain=this.a.createGain();
  source.buffer=buffer;source.loop=false;gain.gain.value=0;
  source.connect(gain).connect(this.master);gain.gain.setTargetAtTime(volume,this.a.currentTime,.035);
  const voice={source,gain};source.onended=()=>{source.disconnect();gain.disconnect();if(this.pull===voice)this.pull=null;};
  source.start();return voice;
 }
 stopPull(){if(!this.pull)return;const voice=this.pull;this.pull=null;
  voice.gain.gain.setTargetAtTime(0,this.a.currentTime,.045);voice.source.stop(this.a.currentTime+.25);
 }
 release(t){if(!this.releaseBuffer||t-this.lastRelease<1.5)return;this.lastRelease=t;this.play(this.releaseBuffer,.18);}
 update(speed,drift,running,time,motion={}){
  if(!this.a)return;
  const t=this.a.currentTime,active=running&&window.SFX?.on&&!document.hidden;
  const load=Math.max(0,Math.min(1,motion.throttle??0));
  if(!active){this.stopPull();this.armed=true;this.previousLoad=0;}
  else {
   // Assisted driving eases throttle at cruise and through corners. That is
   // not a request to cut the recorded shift or append a second fake lift-off.
   if(load<.15)this.armed=true;
   // Wait for buffers if acceleration begins while audio is loading.
   // The original pull contains its own RPM rise and shifts. Do not restart it
   // for simulated gear changes or stretch it into a recurring engine loop.
   if(load>.35&&this.armed&&!this.pull&&this.pulls.filter(Boolean).length===4){
    this.stopPull();this.pull=this.play(this.pulls[this.nextPull++%4],.46);this.armed=false;
   }
   // Keep the recording's original dynamics, including every gear change.
   if(this.pull)this.pull.gain.gain.setTargetAtTime(.46,t,.08);
   this.previousLoad=load;
  }
  this.master.gain.setTargetAtTime(active?.65:0,t,.06);
 }
 quiet(){if(!this.a)return;this.stopPull();this.previousLoad=0;this.armed=true;this.master.gain.cancelScheduledValues(this.a.currentTime);this.master.gain.setTargetAtTime(0,this.a.currentTime,.025);}
}
