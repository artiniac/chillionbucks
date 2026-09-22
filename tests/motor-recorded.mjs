import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Motor,SKYLINE_RECORDINGS} from '../motor-sound.js';
const param=()=>({value:0,setTargetAtTime(v){assert.ok(Number.isFinite(v));this.value=v;},cancelScheduledValues(){}});
const node=()=>({gain:param(),threshold:param(),ratio:param(),connect(){return this;}});
class Media{
 constructor(){this.paused=true;this.ended=false;this.dataset={};this.events={};this.currentTime=0;this.plays=0;}
 set src(v){this.url=v;this.currentTime=0;this.ended=false;this.paused=true;}
 get src(){return this.url;}
 setAttribute(){}addEventListener(k,fn){this.events[k]=fn;}
 async play(){this.paused=false;this.plays++;}pause(){this.paused=true;}
 end(){this.ended=true;this.paused=true;this.events.ended();}
 fail(){this.paused=true;this.events.error();}
}
class Context{constructor(){this.currentTime=0;this.destination=node();}createGain(){return node();}createDynamicsCompressor(){return node();}createMediaElementSource(){return node();}async resume(){}}
global.window={AudioContext:Context,SFX:{on:true}};global.document={hidden:false,createElement:()=>new Media(),body:{append(){}}};
global.fetch=async url=>({ok:true,blob:async()=>new Blob([fs.readFileSync(new URL(url))])});
const settle=async()=>{for(let i=0;i<6;i++)await Promise.resolve();};
assert.equal(SKYLINE_RECORDINGS.length,6);for(const {file} of SKYLINE_RECORDINGS)assert.ok(fs.statSync(new URL('../assets/audio/skyline/'+file,import.meta.url)).size>200000);
const m=new Motor();m.start();await settle();m.update(4,false,true,0,{throttle:1});
assert.equal(m.media.dataset.recording,'drive-gh014025.mp3');assert.equal(m.media.loop,false);
for(let i=0;i<1000;i++)m.update(i%25,i%2===0,true,i*.016,{throttle:i%2});
assert.equal(m.media.plays,1,'Shifts, throttle changes, and laps must not restart playback');
const heard=[m.media.dataset.recording];
for(let i=0;i<6;i++){await m.loading;m.media.end();await settle();heard.push(m.media.dataset.recording);assert.equal(m.media.paused,false,'Next file starts without a throttle or lap trigger');}
assert.equal(new Set(heard).size,6,'All six supplied recordings participate');assert.equal(heard[6],heard[0]);
m.media.currentTime=43.2;m.quiet();assert.equal(m.media.paused,true);m.start();await settle();assert.equal(m.media.currentTime,43.2,'Pause resumes instead of repeating the start');
window.SFX.on=false;m.update(20,false,true);assert.equal(m.media.paused,true);assert.equal(m.master.gain.value,0);
window.SFX.on=true;m.start();await settle();document.hidden=true;m.update(20,false,true);assert.equal(m.media.paused,true);
document.hidden=false;m.start();await settle();m.update(10,false,false);assert.equal(m.media.paused,true);
m.start();await settle();const before=m.index;m.media.fail();await settle();assert.notEqual(m.index,before,'Bad audio file advances to another recording');
// A pause while play() is still resolving cannot leak sound back into a hidden tab.
m.media.pause();m.start();m.quiet();await settle();assert.equal(m.media.paused,true);
await m.loading;m.quiet();m.preloadAbort?.abort();if(m.prefetched)URL.revokeObjectURL(m.prefetched.url);if(m.currentBlob)URL.revokeObjectURL(m.currentBlob);
console.log('PASS: six full files, automatic transitions, full playlist rotation, uninterrupted shifts, pause/resume, mute, hidden tab, load failure, and asynchronous pause.');
