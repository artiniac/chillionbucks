// Quiet generated soundscapes, shuffled without immediate repeats. The existing
// synthesized water bed continues between clips, so pauses are not dead silence.
export function parkAmbience(){
 const clips=['waterpark-calm-1.mp3','waterpark-calm-2.mp3','waterpark-calm-3.mp3'];
 const audio=new Audio();audio.hidden=true;audio.setAttribute('aria-hidden','true');audio.volume=.09;audio.preload='none';document.body.append(audio);
 let unlocked=false,timer=null,bag=[],last=null;
 const allowed=()=>unlocked&&window.SFX?.on&&!document.hidden;
 function choose(){if(!bag.length){bag=[...clips];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}last=bag.pop();audio.src=new URL('./assets/audio/'+last,import.meta.url).href;}
 function play(){timer=null;if(!allowed())return;if(!audio.src||audio.ended)choose();audio.play().catch(()=>{});}
 function sync(){clearTimeout(timer);timer=null;if(!allowed()){audio.pause();return;}play();}
 audio.addEventListener('ended',()=>{if(allowed())timer=setTimeout(()=>{choose();play();},3500+Math.random()*8500);});
 audio.addEventListener('error',()=>{if(allowed())timer=setTimeout(()=>{choose();play();},12000);});
 const unlock=()=>{unlocked=true;sync();};document.addEventListener('pointerdown',unlock,{once:true,passive:true});document.addEventListener('keydown',unlock,{once:true});document.addEventListener('soundchange',sync);document.addEventListener('visibilitychange',sync);addEventListener('pagehide',()=>{clearTimeout(timer);audio.pause();});addEventListener('pageshow',()=>{if(unlocked)sync();});
 return audio;
}
