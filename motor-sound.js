// Complete owner recordings, streamed at their original speed. No lap or
// throttle trigger can cut a recorded shift or leave the playlist waiting.
export const SKYLINE_RECORDINGS = [
 {file:'drive-gh014025.mp3',name:'GH014025 full drive',gain:.470},
 {file:'pull-a.wav',name:'IMG_3066 full pull',gain:.428},
 {file:'drive-img0647.mp3',name:'IMG_0647 full drive',gain:.674},
 {file:'pull-b.wav',name:'IMG_3067 full pull',gain:.550},
 {file:'pull-c.wav',name:'IMG_7599 full pull',gain:1},
 {file:'pull-d.wav',name:'IMG_0113 full pull',gain:1},
];
export class Motor {
 constructor(){this.a=null;this.active=false;this.index=0;this.failed=new Set();this.blocked=false;this.pending=false;this.prefetched=null;this.currentBlob=null;}
 build(){
  const a=this.a=new(window.AudioContext||window.webkitAudioContext)();
  this.master=a.createGain();this.master.gain.value=0;
  this.level=a.createGain();
  const limiter=a.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=3;
  this.level.connect(this.master).connect(limiter).connect(a.destination);
  const media=this.media=document.createElement('audio');media.preload='auto';media.loop=false;media.hidden=true;media.setAttribute('playsinline','');media.dataset.skylineAudio='true';document.body.append(media);
  a.createMediaElementSource(media).connect(this.level);
  media.addEventListener('ended',()=>{if(this.active)this.advance();});
  media.addEventListener('error',()=>{this.failed.add(this.index);if(this.active)this.advance();});
  this.loadTrack(0);
 }
 url(index){return new URL('./assets/audio/skyline/'+SKYLINE_RECORDINGS[index].file,import.meta.url).href;}
 loadTrack(index){
  this.index=index;const track=SKYLINE_RECORDINGS[index];
  if(this.currentBlob)URL.revokeObjectURL(this.currentBlob);
  this.currentBlob=this.prefetched?.index===index?this.prefetched.url:null;
  if(this.prefetched&&!this.currentBlob)URL.revokeObjectURL(this.prefetched.url);
  this.prefetched=null;
  this.media.src=this.currentBlob||this.url(index);this.media.dataset.recording=track.file;
  this.level.gain.value=track.gain;
  this.preloadNext();
 }
 preloadNext(){
  this.preloadAbort?.abort();const controller=this.preloadAbort=new AbortController();
  const index=(this.index+1)%SKYLINE_RECORDINGS.length;
  // Cache only one compressed recording ahead, not minutes of decoded PCM on phones.
  this.loading=fetch(this.url(index),{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.blob();}).then(blob=>{
   if(!controller.signal.aborted)this.prefetched={index,url:URL.createObjectURL(blob)};
  }).catch(()=>{});
 }
 play(){
  if(!this.active||this.pending||this.blocked||!this.media.paused)return;
  this.pending=true;
  Promise.resolve(this.media.play()).then(()=>{if(!this.active)this.media.pause();}).catch(error=>{
   if(error.name==='NotAllowedError')this.blocked=true;
  }).finally(()=>{this.pending=false;});
 }
 advance(){
  if(this.failed.size===SKYLINE_RECORDINGS.length){this.quiet();return;}
  let next=(this.index+1)%SKYLINE_RECORDINGS.length;
  while(this.failed.has(next))next=(next+1)%SKYLINE_RECORDINGS.length;
  this.loadTrack(next);this.play();
 }
 start(){
  if(!window.SFX?.on||document.hidden)return;
  try{if(!this.a)this.build();this.active=true;this.blocked=false;this.a.resume().catch(()=>{});
   if(this.media.ended)this.advance();else this.play();
  }catch{this.active=false;}
 }
 update(speed,drift,running){
  if(!this.a)return;
  if(this.failed.size===SKYLINE_RECORDINGS.length){this.quiet();return;}
  const active=running&&window.SFX?.on&&!document.hidden;
  if(!active){this.quiet();return;}
  this.active=true;
  if(this.media.ended)this.advance();else this.play();
  this.master.gain.setTargetAtTime(.48,this.a.currentTime,.04);
 }
 quiet(){
  this.active=false;if(!this.a)return;
  this.media.pause();this.master.gain.cancelScheduledValues(this.a.currentTime);this.master.gain.setTargetAtTime(0,this.a.currentTime,.025);
 }
}
