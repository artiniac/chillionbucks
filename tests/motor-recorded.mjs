import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Motor} from '../motor-sound.js';
const voices=[];
const param=()=>({value:0,setTargetAtTime(v){assert.ok(Number.isFinite(v));this.value=v;},cancelScheduledValues(){}});
const node=()=>({gain:param(),threshold:param(),ratio:param(),connect(){return this;},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}});
class Context{constructor(){this.currentTime=0;this.destination=node();}createGain(){return node();}createDynamicsCompressor(){return node();}createBufferSource(){const n=node();voices.push(n);return n;}async decodeAudioData(data){assert.ok(data.byteLength>100);return {bytes:data.byteLength};}async resume(){}}
global.window={AudioContext:Context,SFX:{on:true}};global.document={hidden:false};global.fetch=async url=>({ok:true,arrayBuffer:async()=>{const b=fs.readFileSync(url);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
const m=new Motor();m.start();
m.update(3,false,true,0,{throttle:1});assert.equal(m.armed,true,'Loading must not consume throttle trigger');
await m.loading;assert.equal(m.pulls.length,4);assert.ok(m.releaseBuffer);
assert.ok(m.pulls.every(b=>b.bytes>24000*2*5),'Each pull retains more than five seconds');
m.update(3,false,true,0,{throttle:1});assert.equal(voices.length,1);assert.equal(voices[0].loop,false);
for(let i=0;i<1000;i++){m.a.currentTime+=.016;m.update(i%25,false,true,i*.016,{throttle:.7});}
assert.equal(voices.length,1,'Holding throttle and shifting must not restart clips');
voices[0].onended();m.update(20,false,true,17,{throttle:1});assert.equal(voices.length,1,'Natural clip end must not cause repeat');
m.update(20,false,true,18,{throttle:0});m.update(20,false,true,19,{throttle:1});assert.equal(voices.length,2);assert.notEqual(voices[0].buffer,voices[1].buffer,'Next acceleration uses another full recording');
m.update(20,false,true,20,{throttle:0});assert.ok(!voices[1].stopped,'Automatic throttle lift must preserve recorded shifts');assert.equal(voices.length,2,'No duplicate release layered onto real shift');
m.update(20,false,true,20.1,{throttle:1});assert.equal(voices.length,2,'Throttle recovery must not interrupt the playing pull');
voices[1].onended();m.update(20,false,true,20.2,{throttle:1});assert.equal(voices.length,3);assert.equal(voices[2].buffer,m.pulls[2]);
m.update(20,false,true,20.3,{throttle:0});voices[2].onended();m.update(20,false,true,20.4,{throttle:1});assert.equal(voices.length,4);assert.equal(voices[3].buffer,m.pulls[3],'All four supplied videos participate');
m.update(10,false,true,21,{throttle:1});window.SFX.on=false;m.update(10,false,true,22,{throttle:1});assert.equal(m.master.gain.value,0);assert.equal(m.pull,null);
window.SFX.on=true;document.hidden=true;m.update(10,false,true,23,{throttle:1});assert.equal(m.master.gain.value,0);
document.hidden=false;m.update(10,false,false,24,{throttle:1});assert.equal(m.master.gain.value,0);
m.quiet();assert.equal(m.master.gain.value,0);
console.log('PASS: full recordings, loading race, throttle triggers, no held-throttle repeats, all four pulls, uninterrupted recorded shifts, mute, pause, and hidden tab.');
