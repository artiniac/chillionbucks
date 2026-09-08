import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const code=fs.readFileSync(new URL('../wallet.js',import.meta.url),'utf8');
const data=new Map(),events=[];let queue=Promise.resolve();
function context(){const c={localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},document:{dispatchEvent:e=>events.push(e)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},navigator:{locks:{request:(name,fn)=>{const next=queue.then(fn);queue=next.catch(()=>{});return next;}}},Date,Math,Number,JSON};c.window={addEventListener(){}};vm.createContext(c);vm.runInContext(code,c);return c.window.Wallet;}
const a=context(),b=context();assert.equal(a.workInfo('seafood').pay,10);assert.equal(a.workInfo('seafood').left,1);const paid=await Promise.all([a.completeWork('seafood'),b.completeWork('seafood')]);assert.equal(paid.reduce((s,n)=>s+n,0),10);assert.equal(a.get(),0,'Paycheck must wait for deposit');assert.equal(a.bills().b5,2);assert.equal(await a.completeWork('seafood'),0);
assert.equal(await a.completeWork('feed'),5);assert.equal(await a.completeWork('clean'),10);assert.equal(await a.completeWork('delivery'),10);assert.equal(await a.completeWork('delivery'),10);assert.equal(await a.completeWork('park'),0,'Shared cap is 45 including seafood');assert.equal(a.workInfo('seafood').left,0);assert.equal(JSON.parse(data.get('cb:wallet')).workPay,45);console.log('PASS: seafood pays 10 once, concurrent claims cannot double-pay, bills precede saving, and shared daily cap remains 45.');
