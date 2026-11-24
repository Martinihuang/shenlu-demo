/* Single-card fullscreen viewer, sharing gallery zoom and pan behavior. */
(function(root){'use strict';
const base=new URL('../portrait-duel/',document.currentScript.src);
async function show(id,fallback){
 const card=root.TW09Data?.cards?.[id],art=root.PortraitArt?.[id]||{},binding=root.ShenluSpiritDetail?.resolve(id),focus=document.activeElement;
 const front=art.front?new URL(art.front,base).href:null;
 const candidates=[binding?.mode==='premium'?binding.image:null,art.portrait,art.premium,art.card].filter(Boolean).map(src=>new URL(src,base).href);
 let image=front||fallback?.src||new URL(art.card,base).href;
 for(const src of new Set(candidates)){if(src===front)continue;const probe=new Image();probe.src=src;try{await probe.decode();if(probe.naturalHeight>probe.naturalWidth){image=src;break;}}catch(_){}}
 return root.ShenluExpeditionGallery.showImages({id,name:card?.name||fallback?.alt||'',images:[image],title:'卡牌展示',includeVideos:false,showName:true,returnFocus:()=>focus?.focus()});
}
root.ShenluCardShowcase={show};
})(globalThis);
