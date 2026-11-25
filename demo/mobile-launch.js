/* Touch-only launch controls. No save storage, routing shell or battle state. */
(()=>{
 'use strict';
 if(window!==window.top||window.ShenluMobileLaunch)return;
 const touch=matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0;
 if(!touch)return;
 const scriptURL=document.currentScript?.src||new URL('demo/mobile-launch.js',location.href).href;
 const base=new URL('../',scriptURL),intro=!!document.body?.dataset.page||location.pathname===base.pathname||location.pathname===new URL('index.html',base).pathname;
 const packs={
  'zh-Hant':{start:'全螢幕開始',movie:'觀看開場動畫',title:'橫向，走進《神籙》',body:'建議將手機轉橫，再以全螢幕遊玩。你也可以先觀看開場動畫。',continue:'以目前畫面繼續',full:'全螢幕',rotate:'請將手機轉橫，完整顯示遊戲。',suggest:'建議使用全螢幕遊玩。',unsupported:'目前無法開啟全螢幕，仍可轉橫手機繼續。',loading:'開場正在載入…',retry:'開場動畫尚未就緒，可先開始遊戲，稍後從選單播放。'},
  en:{start:'Start fullscreen',movie:'Watch the opening',title:'Turn your phone. Enter Shenlu.',body:'Play in landscape and fullscreen for a clearer view. You can also watch the opening first.',continue:'Continue in this view',full:'Fullscreen',rotate:'Turn your phone sideways for the full game view.',suggest:'Fullscreen is recommended.',unsupported:'Fullscreen is unavailable. You can still turn your phone sideways and continue.',loading:'Loading the opening…',retry:'The opening movie is not ready. Start playing, or watch it later from the menu.'},
  ja:{start:'全画面で始める',movie:'オープニングを見る',title:'スマートフォンを横向きにして、神籙へ',body:'横向き・全画面でのプレイをおすすめします。先にオープニングを見ることもできます。',continue:'この画面のまま進む',full:'全画面',rotate:'スマートフォンを横向きにしてください。',suggest:'全画面でのプレイをおすすめします。',unsupported:'全画面にできません。端末を横向きにして、そのまま続けられます。',loading:'オープニングを読み込み中…',retry:'動画の準備ができていません。先にゲームを始め、後でメニューから再生できます。'},
  ko:{start:'전체 화면으로 시작',movie:'오프닝 보기',title:'휴대전화를 가로로 돌려 《神籙》을 시작하세요',body:'가로 모드와 전체 화면을 권장합니다. 오프닝 영상을 먼저 볼 수도 있습니다.',continue:'현재 화면으로 계속',full:'전체 화면',rotate:'게임 화면이 잘 보이도록 휴대전화를 가로로 돌려 주세요.',suggest:'전체 화면으로 플레이하는 것을 권장합니다.',unsupported:'전체 화면을 열 수 없습니다. 휴대전화를 가로로 돌려 계속할 수 있습니다.',loading:'오프닝을 불러오는 중…',retry:'오프닝 영상이 아직 준비되지 않았습니다. 게임을 먼저 시작하거나 나중에 메뉴에서 볼 수 있습니다.'},
  'zh-Hans':{start:'全屏开始',movie:'观看开场动画',title:'横向，走进《神籙》',body:'建议将手机转横，再以全屏游玩。你也可以先观看开场动画。',continue:'以当前画面继续',full:'全屏',rotate:'请将手机转横，完整显示游戏。',suggest:'建议使用全屏游玩。',unsupported:'当前无法开启全屏，仍可转横手机继续。',loading:'开场正在加载…',retry:'开场动画尚未就绪，可先开始游戏，稍后从菜单播放。'}
 };
 const locale=()=>{const key=window.ShenluDemoI18n?.locale||document.documentElement.lang;return packs[key]?key:(key.startsWith('zh-Hans')?'zh-Hans':'zh-Hant');};
 const words=()=>packs[locale()];
 const make=(tag,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;return el;};
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('demo/mobile-launch.css?v=launch2',base);document.head.append(css);
 if(intro){
  const play=document.getElementById('play-demo')||document.querySelector('.nav-play');if(!play)return;
  const movie=make('a','mobile-opening-link');movie.dataset.mobileMovie='';if(play.classList.contains('nav-play'))movie.hidden=true;movie.href=play.href;play.after(movie);
  function refresh(){movie.textContent=words().movie;const u=new URL(play.href);u.searchParams.set('launch','movie');movie.href=u.href;}
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();
  document.addEventListener('click',event=>{
   const a=event.target.closest('a');if(!a||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname!==new URL('preview/opening.html',base).pathname)return;
   u.searchParams.set('launch',a.hasAttribute('data-mobile-movie')?'movie':'play');a.href=u.href;
  });
  window.ShenluMobileLaunch={intro:true};return;
 }
 document.documentElement.classList.add('demo-launch-controls');
 const bar=make('aside','mobile-launch-bar'),hint=make('span'),full=make('button');hint.setAttribute('role','status');full.type='button';bar.append(hint,full);document.documentElement.append(bar);
 let failed=false,locked=false,gate;
 const api=window.ShenluMobileLaunch={reservedTop:0,enterFullscreen};
 function refresh(){
  const portrait=innerHeight>innerWidth,w=words();full.textContent=w.full;
  full.textContent=document.fullscreenElement?({'zh-Hant':'結束全螢幕',en:'Exit fullscreen',ja:'全画面を終了',ko:'전체 화면 종료','zh-Hans':'退出全屏'}[locale()]):w.full;
  hint.textContent=failed?w.unsupported:portrait?w.rotate:document.fullscreenElement?'':w.suggest;
  bar.classList.toggle('is-fullscreen',!!document.fullscreenElement);
  bar.hidden=false;
  full.hidden=false;
  if(gate){gate.lang=locale();gate.querySelector('h2').textContent=w.title;gate.querySelector('.mobile-launch-description').textContent=w.body;gate.querySelector('[data-start]').textContent=w.start;gate.querySelector('[data-movie]').textContent=w.movie;gate.querySelector('[data-continue]').textContent=w.continue;}
 }
 async function enterFullscreen(){
  failed=false;
  try{
   if(!document.fullscreenElement){if(!document.documentElement.requestFullscreen)throw Error('unsupported');await document.documentElement.requestFullscreen({navigationUI:'hide'});}
   try{if(screen.orientation?.lock){await screen.orientation.lock('landscape');if(document.fullscreenElement)locked=true;else screen.orientation.unlock();}}catch(_){}
  }catch(_){failed=true;}
  refresh();
 }
 full.addEventListener('click',()=>{if(document.fullscreenElement){document.exitFullscreen().catch(()=>{});}else enterFullscreen();});
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&locked){try{screen.orientation.unlock();}catch(_){}locked=false;}refresh();});
 addEventListener('resize',refresh);addEventListener('demo-language',refresh);
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 new ResizeObserver(()=>{const height=bar.hidden?0:Math.ceil(bar.getBoundingClientRect().height);if(api.reservedTop!==height){api.reservedTop=height;dispatchEvent(new Event('resize'));}}).observe(bar);
 const url=new URL(location.href);
 if(location.pathname===new URL('preview/opening.html',base).pathname&&['play','movie'].includes(url.searchParams.get('launch'))){
  gate=make('dialog','mobile-launch-gate');gate.setAttribute('aria-labelledby','mobile-launch-title');
  const title=make('h2');title.id='mobile-launch-title';const body=make('p','mobile-launch-description'),start=make('button'),movie=make('button'),cont=make('button','mobile-launch-continue'),status=make('p','mobile-launch-status');
  start.type=movie.type=cont.type='button';start.dataset.start='';movie.dataset.movie='';cont.dataset.continue='';status.setAttribute('role','status');gate.append(title,body,start,movie,cont,status);document.documentElement.append(gate);
  function consume(){url.searchParams.delete('launch');history.replaceState(history.state,'',url);gate.close();}
  start.onclick=()=>{consume();enterFullscreen();};cont.onclick=consume;
  movie.onclick=()=>{
   let trigger;try{trigger=document.getElementById('shenluSharedMenu')?.contentDocument?.querySelector('.opening-animation');}catch(_){}
   if(!trigger){status.textContent=words().retry;return;}
   consume();trigger.click();
  };
  gate.addEventListener('cancel',()=>{url.searchParams.delete('launch');history.replaceState(history.state,'',url);});
  refresh();gate.showModal();(url.searchParams.get('launch')==='movie'?movie:start).focus();
 }
 refresh();
})();
