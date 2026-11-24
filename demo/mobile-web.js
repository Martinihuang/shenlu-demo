/* Demo-only browser adapter. Canonical story, battle and save state stay untouched. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else api.install(root);
})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const managed='#cinematicAudio, #demoGuideAudio, #shenluSpiritGallery video, #opening-animation-dialog video';
 const portraitText='手機請橫向使用，點選選項操作；電腦可使用滑鼠或鍵盤。旅程會自動保存，也可由「讀取旅程」管理存檔。';
 function safeRect(width,height,viewport,insets){
  const v=viewport||{offsetLeft:0,offsetTop:0,width,height};
  const x=Math.max(v.offsetLeft||0,insets.left||0),y=Math.max(v.offsetTop||0,insets.top||0);
  const right=Math.min((v.offsetLeft||0)+v.width,width-(insets.right||0));
  const bottom=Math.min((v.offsetTop||0)+v.height,height-(insets.bottom||0));
  return {x,y,width:Math.max(1,right-x),height:Math.max(1,bottom-y)};
 }
 function source(media){return media.getAttribute('src')||media.currentSrc||'';}
 function eligible(media){const dialog=media.closest('dialog');return media.isConnected&&!!source(media)&&!media.ended&&(!dialog||dialog.open);}
 function createMediaLifecycle(doc){
  const suspended=new Map(),retries=new Map();
  const control=media=>media.id==='cinematicAudio'?doc.getElementById('cinematicStart'):media.id==='demoGuideAudio'?doc.getElementById('demoGuidePlay'):media.closest('#opening-animation-dialog')?.querySelector('[data-play]')||media.closest('#shenluSpiritGallery')?.querySelector('.spirit-left-tools button:nth-child(2)');
  function expose(media,record){
   const button=control(media);if(!button)return;
   button.hidden=false;retries.set(button,{media,record});
  }
  async function resume(media,record){
   if(doc.hidden||!eligible(media)||source(media)!==record.source)return false;
   try{
    await media.play();
    if(doc.hidden||!eligible(media)||source(media)!==record.source){media.pause();return false;}
    const button=control(media);retries.delete(button);
    if(button&&(media.id==='cinematicAudio'||media.closest('#opening-animation-dialog')))button.hidden=true;
    return true;
   }catch(_){if(eligible(media)&&source(media)===record.source)expose(media,record);return false;}
  }
  function hide(){
   for(const media of doc.querySelectorAll(managed))if(eligible(media)&&!media.paused){
    if(!suspended.has(media))suspended.set(media,{source:source(media)});
    media.pause();
   }
  }
  async function show(){
   const entries=[...suspended];suspended.clear();
   await Promise.all(entries.map(([media,record])=>resume(media,record)));
  }
  function visibility(){return doc.hidden?hide():show();}
  function pagehide(){hide();suspended.clear();retries.clear();}
  function retry(event){
   const button=event.target?.closest('button'),entry=retries.get(button);if(!entry)return;
   if(!eligible(entry.media)||source(entry.media)!==entry.record.source){retries.delete(button);return;}
   event.preventDefault();event.stopImmediatePropagation();
   // Retry the paused media directly: the original opening button restarts at zero.
   return resume(entry.media,entry.record);
  }
  return {visibility,pagehide,retry};
 }
 function restoreOpeningFallback(doc,frame){
  for(const node of doc.querySelectorAll('[data-demo-fallback-src],[data-demo-fallback-href]')){
   for(const name of ['src','href']){const saved=node.getAttribute('data-demo-fallback-'+name);if(saved&&!node.getAttribute(name))node.setAttribute(name,saved);}
  }
  if(frame)frame.hidden=true;
  doc.body.classList.remove('shared-menu-active');
  const stage=doc.querySelector('main.stage');if(stage)stage.inert=false;
 }
 function openingFallback(win){
  const doc=win.document;if(!doc.querySelector('[data-demo-fallback-src]'))return;
  const frame=doc.getElementById('shenluSharedMenu');let restored=false;
  function restore(){if(restored)return;restored=true;restoreOpeningFallback(doc,frame);win.ShenluMenuBoot?.ready();}
  if(!frame){restore();return;}
  function check(){
   // A 404 also fires iframe load. Check the actual same-origin menu and its
   // initialized button, after the queued ready/init message has been handled.
   try{const child=frame.contentDocument;if(!child||(child.readyState==='complete'&&child.URL!=='about:blank'&&(!child.getElementById('scene')||!child.querySelector('button.option.start'))))restore();}catch(_){restore();}
  }
  frame.addEventListener('error',restore,{once:true});
  frame.addEventListener('load',()=>win.setTimeout(check,250));
  // The initial about:blank document is complete while the real page is still
  // loading. It is not evidence of a failed iframe and must not start fallback.
  if(frame.contentDocument?.readyState==='complete'&&frame.contentDocument.URL!=='about:blank')win.setTimeout(check,250);
 }
 function install(win){
  const doc=win.document,html=doc.documentElement;if(html.dataset.demoMobileWeb)return;
  html.dataset.demoMobileWeb='v1';
  openingFallback(win);
  if(win===win.top&&(win.matchMedia("(pointer: coarse)").matches||win.navigator.maxTouchPoints>0)){const script=doc.createElement("script");script.src=new URL("mobile-launch.js?v=launch2",doc.currentScript.src).href;doc.head.append(script);}
  const lifecycle=createMediaLifecycle(doc);
  doc.addEventListener('visibilitychange',lifecycle.visibility);
  win.addEventListener('pagehide',lifecycle.pagehide);
  doc.addEventListener('click',lifecycle.retry,true);
  const probe=doc.createElement('div');probe.className='demo-safe-area-probe';probe.setAttribute('aria-hidden','true');html.append(probe);
  let hint,scheduled=false,dismissedPortrait=false;
  function embeddedSafe(){try{return !!win.frameElement?.hasAttribute('data-demo-safe-viewport');}catch(_){return false;}}
  function touchDevice(){return win.matchMedia('(pointer: coarse)').matches||win.navigator.maxTouchPoints>0;}
  function refreshHint(portrait){
   if(!hint){
    hint=doc.createElement('aside');hint.id='demoMobileOrientation';hint.setAttribute('role','status');
    const text=doc.createElement('span'),close=doc.createElement('button');close.type='button';close.textContent='×';
    hint.append(text,close);html.append(hint);close.onclick=()=>{dismissedPortrait=true;hint.hidden=true;};
   }
   const api=win.ShenluDemoI18n,text=api?.display(portraitText)||portraitText;
   if(hint.firstChild.textContent!==text)hint.firstChild.textContent=text;
   hint.lastChild.setAttribute('aria-label',api?.display('關閉提示')||'關閉提示');
   hint.hidden=!portrait||dismissedPortrait||!!win.frameElement;
   if(!portrait)dismissedPortrait=false;
  }
  function refresh(){
   scheduled=false;const touch=touchDevice(),v=win.visualViewport;
   refreshHint(touch&&html.clientHeight>html.clientWidth);
   // Pinch zoom belongs to the browser. Do not fit an already zoomed viewport again.
   if(v&&Math.abs((v.scale||1)-1)>.01)return;
   html.classList.toggle('demo-mobile-safe',touch);
   if(!touch)return;
   const style=win.getComputedStyle(probe),insets={};
   for(const side of ['top','right','bottom','left'])insets[side]=embeddedSafe()?0:parseFloat(style.getPropertyValue('padding-'+side))||0;
   insets.top=Math.max(insets.top,win.ShenluMobileLaunch?.reservedTop||0);
   const rect=safeRect(html.clientWidth,html.clientHeight,v,insets);
   for(const [key,value]of Object.entries(rect))html.style.setProperty('--demo-safe-'+key,value+'px');
   for(const [key,value]of Object.entries(insets))html.style.setProperty('--demo-inset-'+key,value+'px');
   const iframe=doc.getElementById('shenluSharedMenu');if(iframe)iframe.setAttribute('data-demo-safe-viewport','');
   if(html.classList.contains('pc-shared-layout')){
    const scale=rect.width/1040;
    html.style.setProperty('--pc-layout-scale',scale);
    html.style.setProperty('--pc-layout-left',rect.x/scale+'px');
    html.style.setProperty('--pc-layout-top',rect.y/scale+'px');
    html.style.setProperty('--pc-layout-h',rect.height/scale/100+'px');
    html.style.setProperty('--pc-intro-scale',Math.min(1040/1920,rect.height/scale/1080));
   }
  }
  function schedule(){if(!scheduled){scheduled=true;win.requestAnimationFrame(refresh);}}
  win.addEventListener('resize',schedule);win.addEventListener('pageshow',schedule);win.addEventListener('demo-language',schedule);
  vListen('resize');vListen('scroll');function vListen(type){win.visualViewport?.addEventListener(type,schedule);}
  new win.MutationObserver(schedule).observe(doc.body,{childList:true,subtree:true});
  refresh();
 }
 return {install,safeRect,createMediaLifecycle,restoreOpeningFallback,openingFallback,managed,portraitText};
});
