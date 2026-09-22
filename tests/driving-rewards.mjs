import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {DriveRewards,GateAudio} from '../driving-rewards.js';
const params=[];const param=()=>{const p={value:0,events:[],setValueAtTime(v,t){this.events.push([v,t]);},linearRampToValueAtTime(v,t){this.events.push([v,t]);},exponentialRampToValueAtTime(v,t){assert.ok(v>0);this.events.push([v,t]);},cancelScheduledValues(){}};params.push(p);return p;};
const voices=[];const node=()=>({gain:param(),frequency:param(),Q:param(),threshold:param(),ratio:param(),connect(dest){return dest;},disconnect(){this.disconnected=true;},start(t){this.startTime=t;voices.push(this);},stop(t){this.stopTime=t;}});
const a={currentTime:10,sampleRate:24000,destination:node(),createGain:node,createDynamicsCompressor:node,createBiquadFilter:node,createOscillator:node,createBufferSource:node,createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}};
global.window={SFX:{on:true}};global.document={hidden:false};
const sound=new GateAudio(()=>a);sound.play(0);assert.equal(voices.length,7,'Whoosh plus two three-part bell notes');assert.ok(voices.every(v=>v.stopTime>v.startTime));
sound.play(1);assert.equal(voices.length,7,'Duplicate events are coalesced');a.currentTime+=1;sound.play(4,true,true);assert.equal(voices.length,20,'Final hoop adds a four-note finish');
for(const p of params)for(const [v,t] of p.events){assert.ok(Number.isFinite(v)&&Number.isFinite(t));}
window.SFX.on=false;sound.play(0);assert.equal(voices.length,20);sound.quiet();assert.equal(sound.voices.size,0);
for(const v of voices)v.onended();assert.ok(voices.every(v=>v.disconnected));
window.SFX.on=true;const scene=new T.Scene(),fx=new DriveRewards(scene,()=>a);fx.gate(new T.Vector3(12,0,30),.7,20,1,true);
assert.equal(scene.children.filter(g=>g.visible).length,1);assert.equal(fx.pool[0].ring.scale.x,10.6);
for(let i=0;i<100;i++)fx.update(.016);assert.equal(scene.children.filter(g=>g.visible).length,0,'Effect finishes and vanishes');
for(let i=0;i<100;i++)fx.burst(new T.Vector3(),0,16,true);assert.equal(scene.children.length,3,'Particle pool stays bounded');
for(const f of fx.pool)assert.ok([...f.particles.instanceMatrix.array].every(Number.isFinite));fx.clear();assert.equal(scene.children.filter(g=>g.visible).length,0);
const calm=new DriveRewards(new T.Scene(),()=>a,{reduced:true});calm.burst(new T.Vector3(),0,16);assert.equal(calm.pool[0].particles.visible,false);calm.update(.4);assert.equal(calm.pool[0].group.visible,false);
console.log('PASS: layered hoop and drift sounds, soft attack envelopes, duplicate suppression, mute/cleanup, pooled gate trails, full road width, finite transforms, and reduced motion.');
