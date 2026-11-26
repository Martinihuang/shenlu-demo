/* Four aggregate visit metrics; no player/profile/save data. */
(()=>{'use strict';
 if(globalThis.ShenluDemoStatistics)return;
 const root=new URL('../',document.currentScript.src),params=new URLSearchParams(location.search);
 const titles={'site-visit':'官網造訪','play-click':'點擊立即試玩','menu-ready':'遊戲選單載入成功','play-start':'實際開始故事／挑戰'};
 const pending=new Set(),sent=new Set();let ready;
 const campaignKey='shenlu-demo:campaign',qaKey='shenlu-demo:statistics-qa',embedKey='shenlu-demo:itch-embed';
 const valid=c=>c==='shenlu-threads'||/^shenlu-threads-(0[1-9]|10)$/.test(c||'')||['shenlu-itchio','shenlu-reddit','shenlu-reddit-aigamedev','shenlu-reddit-playmygame'].includes(c);
 const sourceOf=c=>c==='shenlu-itchio'?'itchio':c.startsWith('shenlu-reddit')?'reddit':'threads';
 let campaign='',qa=params.has('qa'),storageAvailable=true,itchEmbed=false;
 try{
  // Only the itch.io HTML host may enable embedded analytics. Same-origin
  // navigation retains this context in browsers without ancestorOrigins.
  if(window!==window.top){
   const parentOrigin=location.ancestorOrigins?.[0],ref=document.referrer?new URL(document.referrer):null;
   itchEmbed=parentOrigin?parentOrigin==='https://html-classic.itch.zone':ref?.origin==='https://html-classic.itch.zone'||(sessionStorage.getItem(embedKey)==='1'&&ref?.origin===location.origin);
   if(itchEmbed)sessionStorage.setItem(embedKey,'1');
  }
  if(qa)sessionStorage.setItem(qaKey,'1');
  qa=qa||sessionStorage.getItem(qaKey)==='1';
  if(valid(params.get('utm_campaign'))&&params.get('utm_source')===sourceOf(params.get('utm_campaign')))campaign=params.get('utm_campaign');
  else if(!params.has('utm_source')&&!params.has('utm_campaign')){
   const old=sessionStorage.getItem(campaignKey);if(valid(old))campaign=old;
   if(!campaign&&document.referrer){const host=new URL(document.referrer).hostname;if(['threads.com','www.threads.com','threads.net','www.threads.net'].includes(host))campaign='shenlu-threads';else if(['reddit.com','www.reddit.com','old.reddit.com','new.reddit.com'].includes(host))campaign='shenlu-reddit';else if(host==='martinihuang.itch.io')campaign='shenlu-itchio';}
  }
  if(itchEmbed)campaign='shenlu-itchio';
  if(campaign)sessionStorage.setItem(campaignKey,campaign);
 }catch(_){storageAvailable=false;}
 const production=location.hostname==='martinihuang.github.io'&&location.pathname.startsWith('/shenlu-demo/')&&(window===window.top||itchEmbed)&&!qa;
 const excluded=()=>!production||!storageAvailable||navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true;
 function flush(){if(excluded()||!ready?.count)return;for(const path of pending){if(sent.has(path))continue;sent.add(path);try{ready.count({path,title:titles[path],event:true,referrer:campaign?sourceOf(campaign):''});}catch(_){}}}
 function track(path){if(!titles[path]||excluded())return;pending.add(path);flush();}
 globalThis.ShenluDemoStatistics={start(){track('play-start');}};
 // Carry only fixed campaign values and the QA exclusion through same-site navigation.
 document.addEventListener('click',event=>{
  const a=event.target.closest?.('a[href]');if(!a||event.defaultPrevented||event.button>0)return;
  try{const u=new URL(a.href,location.href);if(u.origin!==root.origin||!u.pathname.startsWith(root.pathname))return;
   if(campaign){u.searchParams.set('utm_source',sourceOf(campaign));u.searchParams.set('utm_campaign',campaign);}
   if(qa)u.searchParams.set('qa','1');a.href=u.href;
   if(document.body?.dataset.page&&u.pathname===new URL('preview/opening.html',root).pathname)track('play-click');
  }catch(_){}
 },true);
 function pageReady(){if(document.body?.dataset.page)track('site-visit');}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pageReady,{once:true});else pageReady();
 // The child sends painted only after binding its controls and completing fonts.
 // Also require parent runtime/actions, both locale packs, and actual menu artwork.
 async function menuReady(event){
  if(location.pathname!==new URL('preview/opening.html',root).pathname||event.data?.channel!=='shenlu-menu-v1'||event.data.type!=='painted')return;
  const frame=document.getElementById('shenluSharedMenu');if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;
  try{
   const child=frame.contentWindow,doc=frame.contentDocument,api=globalThis.ShenluDemoI18n;
   const ok=await Promise.all([api?.ready,child.ShenluDemoI18n?.ready]);
   const art=doc.querySelector('.plate'),start=doc.querySelector('.option.start');
   if(ok.some(v=>v===false)||!api||api.error||!child.ShenluDemoI18n||child.ShenluDemoI18n.error||!globalThis.ShenluPC?.go||globalThis.ShenluMenuHost?.kind!=='opening'||typeof document.querySelector('.menu>.row button:nth-child(2)')?.onclick!=='function'||doc.documentElement.dataset.menuConnected!=='true'||!start||start.disabled||frame.hidden||!art)return;
   await art.decode();if(!art.naturalWidth)return;
   document.documentElement.dataset.demoMenuReady='true';track('menu-ready');
  }catch(_){}
 }
 addEventListener('message',menuReady);
 if(excluded())return;
 fetch(new URL('demo/community-config.json',root),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(config=>{
  const gc=config.goatcounter;if(!gc?.enabled||!/^[a-z0-9-]+$/.test(gc.site))return;
  globalThis.goatcounter={no_onload:true,allow_frame:itchEmbed};
  const script=document.createElement('script');script.async=true;script.src='https://gc.zgo.at/count.js';script.dataset.goatcounter='https://'+gc.site+'.goatcounter.com/count';
  script.onload=()=>{ready=globalThis.goatcounter;
   // count.js normally sends location.search. Restrict it to our fixed campaign
   // allowlist before any event; never send arbitrary URL query data or referrers.
   const getData=ready.get_data;if(typeof getData!=='function'){ready=null;return;}
   ready.get_data=function(vars){const data=getData(vars);data.q=campaign?'?utm_source='+sourceOf(campaign)+'&utm_campaign='+encodeURIComponent(campaign):'';data.r=campaign?sourceOf(campaign):'';data.s='';return data;};
   flush();
  };document.head.append(script);
 }).catch(()=>{});
})();
