/* The accepted v11 stage geometry, shared by live battles and layout checks. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ShenluLandscapeLayout=api;})(globalThis,function(){
 'use strict';
 const width=1920,height=886;
 const enemy=[{x:485,y:65,w:390,h:370},{x:960,y:65,w:390,h:370},{x:1435,y:65,w:390,h:370},{x:705,y:122,w:293,h:278},{x:1215,y:122,w:293,h:278}];
 // Per-stage contact correction; story battles and other expedition stages retain their geometry.
 function expeditionEnemy(context){return enemy.map(p=>({...p}));}
 const near=[{x:255,y:390,w:365,h:160,artHeight:850},{x:1670,y:390,w:365,h:160,artHeight:850}];
 function hand(index,count){return {left:8+index*(count>1?Math.min(154,650/(count-1)):0),top:0,angle:0};
 }
 function allies(slots,focus){
  const occupied=slots.map((c,i)=>c?i:null).filter(i=>i!==null);
  const front=focus.filter((i,n,a)=>slots[i]&&a.indexOf(i)===n).slice(0,2);
  for(const i of [...occupied.filter(i=>!slots[i].hidden),...occupied])if(front.length<2&&!front.includes(i))front.push(i);
  for(let i=0;front.length<2&&i<slots.length;i++)if(!front.includes(i))front.push(i);
  return {front,roster:slots.map((_,i)=>i).filter(i=>!front.includes(i))};
 }
 return {width,height,enemy,near,hand,allies,expeditionEnemy};
});
