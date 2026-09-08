// Arc-distance checkpoints work across the finish line and at every frame rate.
export const CHECKPOINTS=[.15,.32,.49,.66,.83];
export function crossedCheckpoints(before,after,length){
 if(!Number.isFinite(before)||!Number.isFinite(after)||!Number.isFinite(length)||length<=0||before<0||after<=before)return [];
 const hits=[];
 for(let lap=Math.floor(before/length);lap<=Math.floor(after/length);lap++){
  CHECKPOINTS.forEach((fraction,index)=>{const at=(lap+fraction)*length;if(at>before&&at<=after)hits.push({lap,index});});
 }
 return hits;
}
