import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Motor} from '../motor-sound.js';
const param=()=>({value:0,setTargetAtTime(v){assert.ok(Number.isFinite(v));this.value=v;},cancelScheduledValues(){}});
const node=()=>({gain:param(),threshold:param(),ratio:param(),playbackRate:param(),connect(){return this;},disconnect(){},start(){}});
class Context{constructor(){this.currentTime=0;this.destination=node();}createGain(){return node();}createDynamicsCompressor(){return node();}createBufferSource(){return node();}async decodeAudioData(data){assert.ok(data.byteLength>100);return {};}async resume(){}}
global.window={AudioContext:Context,SFX:{on:true}};global.document={hidden:false};global.fetch=async url=>({ok:true,arrayBuffer:async()=>{const b=fs.readFileSync(url);return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);}});
const m=new Motor();m.start();await m.loading;assert.equal(m.layers.length,3);assert.ok(m.releaseBuffer);
m.update(12,false,true,0,{throttle:.8});assert.ok(m.master.gain.value>0);window.SFX.on=false;m.update(12,false,true,0,{throttle:.8});assert.equal(m.master.gain.value,0);window.SFX.on=true;document.hidden=true;m.update(12,false,true,0);assert.equal(m.master.gain.value,0);document.hidden=false;m.update(12,false,false,0);assert.equal(m.master.gain.value,0);
m.a.currentTime=10;m.release(10);m.release(10.5);assert.equal(m.lastRelease,10);m.release(12);assert.equal(m.lastRelease,12);
for(let i=0;i<1000;i++){m.a.currentTime+=.016;m.update(i%25,false,true,i*.016,{throttle:.7});}assert.ok(m.layers.every(l=>l.source.playbackRate.value>=.72&&l.source.playbackRate.value<=1.45));m.quiet();assert.equal(m.master.gain.value,0);
console.log('PASS: all recorded buffers, bounded playback, mute, pause, hidden tab, and release cooldown.');
