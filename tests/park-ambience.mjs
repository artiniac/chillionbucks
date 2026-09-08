import assert from 'node:assert/strict';
const events=new Map();globalThis.document={hidden:false,body:{append(){}},addEventListener:(k,f)=>events.set(k,f)};globalThis.window={SFX:{on:true}};globalThis.addEventListener=()=>{};
let pending;globalThis.setTimeout=f=>(pending=f,1);globalThis.clearTimeout=()=>{pending=null;};
class TestAudio {constructor(){this.listeners={};this.paused=true;this.ended=false;this._src='';}setAttribute(){}addEventListener(k,f){this.listeners[k]=f;}set src(v){this._src=v;this.ended=false;}get src(){return this._src;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
globalThis.Audio=TestAudio;
const {parkAmbience}=await import('../park-ambience.js');const a=parkAmbience();assert.equal(a.paused,true,'No autoplay before interaction');events.get('pointerdown')();assert.equal(a.paused,false);assert.ok(a.volume<=.1);let previous=a.src;
for(let i=0;i<12;i++){a.ended=true;a.listeners.ended();assert.equal(typeof pending,'function');const next=pending;next();assert.notEqual(a.src,previous,'No immediate repeated clip');previous=a.src;}
window.SFX.on=false;events.get('soundchange')();assert.equal(a.paused,true);window.SFX.on=true;events.get('soundchange')();assert.equal(a.paused,false);document.hidden=true;events.get('visibilitychange')();assert.equal(a.paused,true);assert.equal(pending,null);
console.log('PASS: quiet volume, gesture-gated playback, varied clip rotation, mute, and hidden-tab pause.');
