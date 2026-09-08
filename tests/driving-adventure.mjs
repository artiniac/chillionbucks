import assert from 'node:assert/strict';
import {CHECKPOINTS,crossedCheckpoints} from '../driving-adventure.js';
assert.equal(crossedCheckpoints(0,100,100).length,5);
assert.deepEqual(crossedCheckpoints(80,120,100),[{lap:0,index:4},{lap:1,index:0}]);
assert.deepEqual(crossedCheckpoints(0,15,100),[{lap:0,index:0}]);
assert.deepEqual(crossedCheckpoints(15,16,100),[],'A boundary cannot award twice');
for(const step of [.1,.6,7,43]){
 const hits=[];for(let before=0;before<300;before+=step)hits.push(...crossedCheckpoints(before,Math.min(300,before+step),100));
 assert.equal(hits.length,15);assert.equal(new Set(hits.map(h=>h.lap+':'+h.index)).size,15);
}
for(const args of [[0,1,0],[0,1,Infinity],[NaN,1,100],[2,1,100],[-1,1,100]])assert.deepEqual(crossedCheckpoints(...args),[]);
assert.equal(CHECKPOINTS.length,5);
console.log('PASS: five checkpoints per lap, finish-line wrap, exact boundaries, frame-rate independence, and invalid input.');
