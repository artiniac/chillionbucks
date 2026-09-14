import assert from 'node:assert/strict';
import {newGame,launch,step,BUMPERS} from '../pinball-physics.js';
const g=newGame();assert.ok(launch(g));assert.equal(launch(g),false);let hits=0,saves=0;for(let i=0;i<120*120;i++){step(g,1/120,{});for(const e of g.events){if(e.type==='bumper')hits++;if(e.type==='save')saves++;}g.events=[];for(const value of Object.values(g.ball))assert.ok(Number.isFinite(value));}assert.ok(hits>0,'Launching must reach the scoring playfield');assert.ok(!g.over,'Little flippers must not end');
const arcade=newGame(false);for(let i=0;i<3;i++){launch(arcade);arcade.saveTime=0;arcade.ball.y=800;step(arcade,1/120);}assert.equal(arcade.balls,0);assert.ok(arcade.over);
const safe=newGame(false);launch(safe);safe.ball.y=800;step(safe,1/120);assert.equal(safe.balls,3);
const bump=newGame(false);launch(bump);Object.assign(bump.ball,{x:BUMPERS[0].x+32,y:BUMPERS[0].y,vx:-100,vy:0});step(bump,1/120);assert.equal(bump.score,100);assert.ok(bump.ball.vx>0);
const flip=newGame(false);launch(flip);Object.assign(flip.ball,{x:165,y:642,vx:0,vy:100});for(let i=0;i<8;i++)step(flip,1/120,{left:true});assert.ok(flip.ball.vy<0,'Raising a flipper must propel the ball upward');
console.log(`PASS: launch, ${hits} bumper contacts in simulation, flipper impulse, ball saves, finite physics, and three-ball game over.`);
