import assert from 'node:assert/strict';
import {newGame,launch,step,BUMPERS} from '../pinball-physics.js';
const g=newGame();assert.ok(launch(g));assert.equal(launch(g),false);let hits=0,saves=0;for(let i=0;i<120*120;i++){step(g,1/120,{});for(const e of g.events){if(e.type==='bumper')hits++;if(e.type==='save')saves++;}g.events=[];for(const value of Object.values(g.ball))assert.ok(Number.isFinite(value));}assert.ok(hits>0,'Launching must reach the scoring playfield');assert.ok(!g.over,'Little flippers must not end');
const arcade=newGame(false);for(let i=0;i<3;i++){launch(arcade);arcade.saveTime=0;arcade.ball.y=800;step(arcade,1/120);}assert.equal(arcade.balls,0);assert.ok(arcade.over);
const safe=newGame(false);launch(safe);safe.ball.y=800;step(safe,1/120);assert.equal(safe.balls,3);
const bump=newGame(false);launch(bump);Object.assign(bump.ball,{x:BUMPERS[0].x+32,y:BUMPERS[0].y,vx:-100,vy:0});step(bump,1/120);assert.equal(bump.score,100);assert.ok(bump.ball.vx>0);
const flip=newGame(false);launch(flip);Object.assign(flip.ball,{x:165,y:642,vx:0,vy:100});for(let i=0;i<8;i++)step(flip,1/120,{left:true});assert.ok(flip.ball.vy<0,'Raising a flipper must propel the ball upward');
console.log(`PASS: launch, ${hits} bumper contacts in simulation, flipper impulse, ball saves, finite physics, and three-ball game over.`);
const {TARGETS,nudge,award}=await import('../pinball-physics.js');
const bonus=newGame(false);launch(bonus);bonus.events=[];
for(const p of TARGETS){bonus.targetCool=0;Object.assign(bonus.ball,{x:p.x,y:p.y,vx:0,vy:0});step(bonus,1/120);}
assert.ok(bonus.gold>19);assert.ok(bonus.events.some(e=>e.type==='gold'));assert.ok(bonus.targets.every(v=>!v));
const combo=newGame();award(combo,100,'test');award(combo,100,'test');assert.equal(combo.score,300);combo.time=4;award(combo,100,'test');assert.equal(combo.combo,1);combo.gold=1;combo.lastScore=-10;award(combo,100,'test');assert.equal(combo.events.at(-1).points,300);
assert.equal(nudge(combo),false);launch(combo);assert.equal(nudge(combo),true);assert.equal(nudge(combo),false);combo.nudgeCool=0;assert.equal(nudge(combo),true);
console.log('PASS: six targets trigger Gold Rush, combos expire, triple scoring, and nudge cooldown.');
// The former right target/wall pocket repeatedly awarded points without travel.
const jam=newGame();launch(jam);Object.assign(jam.ball,{x:356.8449,y:329.0774,vx:216.53,vy:-339.025});let escaped=false;
for(let i=0;i<1200;i++){step(jam,1/120);if(Math.hypot(jam.ball.x-356.8449,jam.ball.y-329.0774)>60)escaped=true;jam.events=[];}
assert.ok(escaped,'Ball must leave the former target/wall trap');assert.ok(jam.score<100000,'One trapped contact must not farm points');
console.log('PASS: former wall trap escapes without runaway scoring.');
