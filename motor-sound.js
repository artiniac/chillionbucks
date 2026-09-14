// Layered inline-six synthesis: exhaust pulses, intake texture, turbo, and tire slip.
export class Motor{
 constructor(){this.a=null;this.gear=0;this.previousSpeed=0;this.shiftUntil=0;}
 start(){if(!window.SFX?.on)return;try{if(!this.a)this.build();this.a.resume().catch(()=>{});}catch{}}
 build(){const a=this.a=new(window.AudioContext||window.webkitAudioContext)();this.master=a.createGain();this.master.gain.value=0;const limiter=a.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=5;this.master.connect(limiter).connect(a.destination);
 const noise=a.createBuffer(1,a.sampleRate*4,a.sampleRate),d=noise.getChannelData(0);let brown=0;for(let i=0;i<d.length;i++){brown=(brown+.045*(Math.random()*2-1))/1.025;d[i]=brown*3+(Math.random()*2-1)*.12;}
 const makeNoise=(freq,q)=>{const src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();src.buffer=noise;src.loop=true;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=q;gain.gain.value=0;src.connect(filter).connect(gain).connect(this.master);src.start();return {src,filter,gain};};
 this.intake=makeNoise(440,.7);this.tires=makeNoise(1700,1.3);this.air=makeNoise(4400,.5);
 this.exhaustFilter=a.createBiquadFilter();this.exhaustFilter.type='lowpass';this.exhaustFilter.frequency.value=950;this.exhaustGain=a.createGain();this.exhaustGain.gain.value=.16;this.exhaustFilter.connect(this.exhaustGain).connect(this.master);
 this.oscs=[1,.5,2].map((ratio,i)=>{const o=a.createOscillator(),g=a.createGain();const re=new Float32Array(48),im=new Float32Array(48);for(let h=1;h<48;h++){im[h]=Math.exp(-h*.095)*(h%2?.8:.3)/Math.pow(h,.65);re[h]=Math.sin(h*1.71)*im[h]*.24;}o.setPeriodicWave(a.createPeriodicWave(re,im));g.gain.value=[.7,.22,.08][i];o.connect(g).connect(this.exhaustFilter);o.start();return {o,ratio};});
 this.turbo=a.createOscillator();this.turbo.type='sine';this.turboGain=a.createGain();this.turboGain.gain.value=0;this.turbo.connect(this.turboGain).connect(this.master);this.turbo.start();
 }
 update(speed,drift,running,time){if(!this.a)return;const t=this.a.currentTime,active=running&&window.SFX?.on&&!document.hidden,s=Math.max(0,speed),gear=Math.min(4,Math.floor(s/4.4)),accel=s-this.previousSpeed;this.previousSpeed=s;
 if(gear!==this.gear&&active&&s>3){this.shiftUntil=t+.16;window.SFX?.noise(.11,.012,1150);}
 this.gear=gear;const shifting=t<this.shiftUntil,load=Math.max(.15,Math.min(1,.4+accel*18+(drift?.2:0))),rpm=1100+(s-gear*4.4)*820+gear*260+(drift?650:0),pulse=rpm/20;
 this.master.gain.setTargetAtTime(active?.48:0,t,.12);this.oscs.forEach(({o,ratio})=>o.frequency.setTargetAtTime(pulse*ratio*(1+Math.sin(time*17)*.002),t,.055));this.exhaustGain.gain.setTargetAtTime(shifting?.045:.13+load*.11,t,.035);this.exhaustFilter.frequency.setTargetAtTime(550+rpm*.24*load,t,.09);this.intake.filter.frequency.setTargetAtTime(160+rpm*.095,t,.08);this.intake.gain.gain.setTargetAtTime(shifting?.015:.06+load*.13,t,.05);this.turbo.frequency.setTargetAtTime(1500+rpm*.65,t,.09);this.turboGain.gain.setTargetAtTime(shifting?0:load*.008,t,.09);this.air.gain.gain.setTargetAtTime(Math.min(.06,s*.003),t,.2);
 const slip=drift?Math.min(1,s/9):0;this.tires.filter.frequency.setTargetAtTime(1200+slip*1150+Math.sin(time*21)*110,t,.06);this.tires.gain.gain.setTargetAtTime(slip*.30,t,.10);
 }
 quiet(){if(this.a){this.master.gain.cancelScheduledValues(this.a.currentTime);this.master.gain.setTargetAtTime(0,this.a.currentTime,.025);}}
}
