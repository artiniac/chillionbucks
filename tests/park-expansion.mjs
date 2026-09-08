import assert from 'node:assert/strict';
import {expandPark,PARK_LIMIT} from '../park-expansion.js';
import {curveFor,START_ROUTE,validateRoute} from '../park-geometry.js';
import {riverTunnel} from '../park-tunnels.js';
import * as T from '../vendor/three.module.js';
const original={type:'pool',x:36,z:0};const s={items:[original],route:START_ROUTE.map(p=>[...p]),adventures:{ride:true}};const route=JSON.stringify(s.route);expandPark(s);assert.equal(s.items[0],original);assert.equal(s.items.filter(i=>i.x===36&&i.z===0).length,1);assert.equal(JSON.stringify(s.route),route);assert.equal(s.adventures.ride,true);const n=s.items.length;expandPark(s);assert.equal(s.items.length,n);
assert.equal(validateRoute(START_ROUTE.map(p=>p.map(v=>v*4))),null);assert.ok(validateRoute([[PARK_LIMIT+1,0],[0,5],[-5,0],[0,-5]]));
for(const kind of ['cave','riverTunnel']){const g=riverTunnel(curveFor(START_ROUTE),.4,kind);const shell=g.children[0],p=shell.geometry.attributes.position;for(const v of p.array)assert.ok(Number.isFinite(v));const bounds=new T.Box3().setFromObject(g);assert.ok(bounds.max.y>2);assert.ok(p.count>100);g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
console.log('PASS: expanded route bounds, saved park preservation, idempotent expansion, and finite open tunnel meshes.');
