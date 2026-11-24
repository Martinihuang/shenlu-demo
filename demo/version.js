/* Entry/manual checks only; never reloads automatically or writes journey storage. */
(()=>{'use strict';if(window.top!==window.self)return;
 const root=new URL('../',document.currentScript.src),current='2026.11.25.1';
 const copy={
 'zh-Hant':['網站版本','檢查更新','已有新版本。請先完成對局並存檔，再返回開場更新。','目前已是最新版。','暫時無法檢查；仍可繼續遊玩。','存檔後回開場更新','稍後'],
 'en':['Web version','Check updates','A new version is available. Finish your duel and save before updating from the opening menu.','You have the latest version.','Cannot check now. You can keep playing.','Saved — update at opening','Later'],
 'ja':['ウェブ版','更新を確認','新しいバージョンがあります。対戦を終えて保存してから、オープニングで更新してください。','最新バージョンです。','確認できません。引き続き遊べます。','保存済み・オープニングで更新','あとで'],
 'ko':['웹 버전','업데이트 확인','새 버전이 있어요. 대전을 마치고 저장한 뒤 시작 화면에서 업데이트하세요.','최신 버전이에요.','확인할 수 없어요. 계속 플레이할 수 있어요.','저장 완료 · 시작 화면에서 업데이트','나중에'],
 'zh-Hans':['网站版本','检查更新','已有新版本。请先完成对局并存档，再返回开场更新。','目前已是最新版。','暂时无法检查；仍可继续游玩。','存档后回开场更新','稍后']};
 let box,version,button,status,link,later,newVersion=false,statusKind=null;
 const locale=()=>copy[document.documentElement.lang]||copy['zh-Hant'];
 function refresh(){const t=locale();version.textContent=t[0]+' '+current;button.textContent=t[1];link.textContent=t[5];later.textContent=t[6];if(statusKind!==null)status.textContent=t[statusKind];}
 async function check(manual=false){button.disabled=true;try{
  const response=await fetch(new URL('version.json',root),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const data=await response.json();
  if(typeof data.version!=='string'||!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(data.version))throw Error();
  newVersion=data.version.localeCompare(current,undefined,{numeric:true})>0;
  statusKind=newVersion?2:manual?3:null;status.textContent=statusKind===null?'':locale()[statusKind];link.hidden=later.hidden=!newVersion;if(newVersion)box.open=true;
 }catch(_){if(manual){statusKind=4;status.textContent=locale()[4];}}finally{button.disabled=false;}}
 function build(){
  // Android's bundled content uses the native/Play update controls, not this web catalog.
  if(globalThis.ShenluNativeStorage||!['','index.html','preview/opening.html'].includes(location.pathname.slice(root.pathname.length)))return;
  box=document.createElement('details');box.className='demo-version';const summary=document.createElement('summary');version=document.createElement('span');summary.append(version);
  button=document.createElement('button');button.type='button';button.onclick=()=>check(true);
  status=document.createElement('p');status.setAttribute('role','status');
  link=document.createElement('a');const destination=new URL('preview/opening.html',root);destination.searchParams.set('lang',document.documentElement.lang||'zh-Hant');destination.searchParams.set('webv',Date.now());link.href=destination;link.hidden=true;
  link.onclick=event=>{const destination=new URL('preview/opening.html',root);destination.searchParams.set('lang',document.documentElement.lang||'zh-Hant');destination.searchParams.set('webv',Date.now());link.href=destination;};
  later=document.createElement('button');later.type='button';later.hidden=true;later.onclick=()=>{box.open=false;};
  box.append(summary,button,status,link,later);(document.querySelector('.foot')||document.body).append(box);
  const style=document.createElement('style');style.textContent='.demo-version{position:fixed;bottom:max(6px,env(safe-area-inset-bottom));right:max(8px,env(safe-area-inset-right));z-index:10020;max-width:min(360px,85vw);font:13px/1.6 system-ui;color:#eee5cf;background:#0b1727ee;border:1px solid #807055;border-radius:8px;padding:5px 9px}.demo-version summary{cursor:pointer}.demo-version button,.demo-version a{font:inherit;color:inherit;background:#203149;border:1px solid #807055;border-radius:5px;padding:5px 9px;margin:4px;text-decoration:none;cursor:pointer}.demo-version [hidden]{display:none!important}.demo-version p:empty{display:none}@media(max-height:400px){.demo-version:not([open]){font-size:11px;padding:2px 5px}}';document.head.append(style);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();check();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();
