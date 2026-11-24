(function(root,factory){const layout=factory();if(typeof module==='object'&&module.exports)module.exports=layout;else root.ShenluStoryLayout=layout;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function enemy(slots,defaults){
  const occupied=slots.map((card,slot)=>card?slot:null).filter(slot=>slot!==null);
  if(occupied.length>2)return defaults;
  const result=defaults.slice();
  occupied.forEach((slot,index)=>{result[slot]=occupied.length===1?{x:426.5,y:425,w:470,h:510}:{x:index?622:231,y:455,w:380,h:460};});
  return result;
 }
 function allies(slots){
  const occupied=slots.map((card,slot)=>card?slot:null).filter(slot=>slot!==null);
  // Keep revealed companions in the foreground; a newly set card stays in the roster.
  const front=[...occupied.filter(slot=>!slots[slot].hidden),...occupied.filter(slot=>slots[slot].hidden)].slice(0,2);
  for(let slot=0;front.length<2&&slot<slots.length;slot++)if(!front.includes(slot))front.push(slot);
  return {front,roster:slots.map((_,slot)=>slot).filter(slot=>!front.includes(slot))};
 }
 return {enemy,allies};
});
