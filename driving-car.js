import * as T from './vendor/three.module.js';
export {makeCar} from './skyline-import.js?v=1';
export {Motor} from './motor-sound.js?v=recorded3';

export function driftStep(state,{held,running,turn,steer=0,dt}){
 const direction=Math.abs(steer)>.15?Math.sign(steer):Math.sign(turn),sliding=held&&running&&(Math.abs(turn)>.025||Math.abs(steer)>.15);
 const target=sliding?direction*(.32+Math.min(.3,Math.abs(turn))):0;
 const velocity=(state.velocity||0)+(target-state.angle)*32*dt-(state.velocity||0)*8*dt;
 const angle=Math.max(-.65,Math.min(.65,state.angle+velocity*dt));
 let seconds=state.seconds,awarded=state.awarded,award=false;if(sliding){seconds+=dt;if(seconds>1&&!awarded){awarded=true;award=true;}}else if(!held){seconds=0;awarded=false;}
 return {angle,velocity,seconds,awarded,award,sliding};
}
