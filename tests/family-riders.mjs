import assert from 'node:assert/strict';
import fs from 'node:fs';
for(const name of ['artin-head','leo-head']){
 const b=fs.readFileSync(new URL('../assets/family/'+name+'.glb',import.meta.url));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.ok(j.images.length>=1,'Embedded facial textures are required');
 let vertices=0;for(const mesh of j.meshes)for(const p of mesh.primitives){const a=j.accessors[p.attributes.POSITION];vertices+=a.count;assert.ok(p.attributes.TEXCOORD_0!==undefined);assert.ok(a.min.every(Number.isFinite)&&a.max.every(Number.isFinite));const spans=a.max.map((n,i)=>n-a.min[i]);assert.ok(Math.min(...spans)>.2*Math.max(...spans),'Head must have full 3D volume');}
 assert.ok(vertices>10000,'Preserve reconstructed facial geometry');assert.ok(b.length<12000000,'Mobile download budget');
}
console.log('PASS: both volumetric head meshes, embedded face textures, detailed geometry, and bounded downloads.');
