// Short layered mechanical transients, tuned bells, and a restrained room tail.
export function pinballAudio(s){let lastHit=-1;const bell=(f,g=.045,t=0)=>{s.tone(f,.24,'sine',g,t);s.tone(f*2.76,.10,'sine',g*.24,t);s.tone(f,.18,'sine',g*.13,t+.07);};return {
 flipper(){s.noise(.018,.04,2100);s.tone(95,.065,'triangle',.06,0,48);s.noise(.035,.012,600,.025);},
 bumper(i=0){const f=[740,932,1109][i%3]*(.985+Math.random()*.03);s.noise(.025,.028,1700);s.tone(140,.065,'sine',.055,0,65);bell(f);},
 target(){s.noise(.035,.025,3400);bell(1480,.035);},
 spinner(){const now=performance.now();if(now-lastHit<85)return;lastHit=now;s.noise(.012,.025,3600);bell(1850,.023);},
 launch(){s.noise(.14,.03,700);s.tone(115,.18,'sawtooth',.017,0,320);s.noise(.045,.04,2300,.13);},
 jackpot(){[523,659,784,1046,1318].forEach((f,i)=>bell(f,.045,i*.085));s.coinDrop(.45);},
 save(){bell(659,.035);bell(988,.035,.1);},
 nudge(){s.noise(.08,.035,320);s.tone(70,.1,'sine',.04);}
};}
