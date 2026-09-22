import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {ENGINE_STEPS,FIRING_ORDER,cylinderState,readEngineProgress,writeEngineProgress,engineSaveKey} from '../engine-lesson.js';
import {createTeachingEngine} from '../engine-model.js';
const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
assert.equal(new Set(ENGINE_STEPS.map(s=>s.id)).size,ENGINE_STEPS.length);
assert.equal(readEngineProgress(storage,'A').step,0);
writeEngineProgress(storage,'A',12);writeEngineProgress(storage,'B',3);
assert.equal(readEngineProgress(storage,'A').step,12);assert.equal(readEngineProgress(storage,'B').step,3);
writeEngineProgress(storage,'A',ENGINE_STEPS.length);assert.equal(readEngineProgress(storage,'A').step,41);
for(const n of [-1,42,NaN,1.2])assert.throws(()=>writeEngineProgress(storage,'A',n));
data.set(engineSaveKey('bad'),'bad JSON');assert.throws(()=>readEngineProgress(storage,'bad'));assert.equal(data.get(engineSaveKey('bad')),'bad JSON');
assert.throws(()=>writeEngineProgress({setItem(){throw Error('quota');}},'A',4));
const engine=createTeachingEngine();assert.equal(engine.pistons.length,6);assert.equal(engine.valves.length,24);assert.equal(engine.camRotors.length,2);
for(let stage=0;stage<=41;stage++){engine.setProgress(stage);assert.equal([...engine.parts.values()].filter(g=>g.visible).length,stage);}
engine.setCutaway(true);assert(engine.parts.get('block').visible,'Cutaway retains half of the block');assert(!engine.parts.get('covers').visible);engine.setCutaway(false);assert(engine.parts.get('covers').visible);
let meshes=0,triangles=0;engine.root.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;for(const v of p.array)assert(Number.isFinite(v));triangles+=(o.geometry.index?.count||p.count)/3;});assert(triangles<150000);assert(meshes<400);
// Six equally spaced ignition events per 720-degree cycle, paired piston motion,
// valves closed during power/compression, and geometrically fixed rod length.
for(let n=0;n<720;n++){
 const theta=n/720*Math.PI*4;engine.update(theta,true);
 assert.equal(engine.crank.rotation.z,-theta);assert.equal(engine.camRotors[0].rotation.z,-theta/2);
 for(let i=0;i<6;i++){const s=cylinderState(theta,i);assert(s.pistonY>=1.12-1e-8&&s.pistonY<=1.59+1e-8);assert(s.intake>=0&&s.exhaust>=0);if(s.stroke===0||s.stroke===3)assert.equal(s.intake+s.exhaust,0);assert(Math.abs(cylinderState(theta,5-i).pistonY-s.pistonY)<1e-8);assert(Math.abs(Math.hypot(s.crankX,s.pistonY-.66-s.crankY)-.70)<1e-8);}
}
for(let i=0;i<6;i++)assert(cylinderState(i*Math.PI*2/3+.01,FIRING_ORDER[i]).spark);
engine.setExploded(true);engine.root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(engine.root);assert(Number.isFinite(bounds.max.y));engine.dispose();
console.log('PASS: 41 stages, isolated town saves, corruption/quota handling, six pistons, 24 valves, half-speed cams, four-stroke timing, crank geometry, cutaway, and mobile mesh budget.');
