export const PARK_LIMIT=42, PARK_ITEM_LIMIT=180;
export function expandPark(state){
 if(state.expansionVersion===1)return;
 const additions=[{type:'pool',x:36,z:0},{type:'pool',x:-36,z:0},{type:'bucket',x:30,z:-13},{type:'mushroom',x:-30,z:-13},{type:'icecream',x:29,z:14},{type:'burger',x:-29,z:14},{type:'umbrella',x:35,z:14},{type:'umbrella',x:-35,z:14}];
 for(const item of additions){if(state.items.length>=PARK_ITEM_LIMIT)break;if(state.items.some(i=>Number.isFinite(i.x)&&Math.hypot(i.x-item.x,i.z-item.z)<7))continue;state.items.push({...item,t:0,rot:0});}
 const connected=['straight','wave','spiral','tube','raft','speed','bridge','cave','riverTunnel'];
 const perimeter=state.route.reduce((n,p,i)=>{const q=state.route[(i+1)%state.route.length];return n+Math.hypot(p[0]-q[0],p[1]-q[1]);},0);
 for(const type of ['cave','riverTunnel']){if(state.items.some(i=>i.type===type)||state.items.length>=PARK_ITEM_LIMIT)continue;for(let j=0;j<120;j++){const t=j/120;if(state.items.every(i=>!connected.includes(i.type)||Math.min(Math.abs(i.t-t),1-Math.abs(i.t-t))*perimeter>(type==='cave'?3:4)+(i.type==='cave'?3:i.type==='riverTunnel'?4:2)+.5)){state.items.push({type,t,x:0,z:0,rot:0});break;}}}
 state.expansionVersion=1;return state;
}
