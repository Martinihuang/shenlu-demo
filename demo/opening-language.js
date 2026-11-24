(async function(){
 'use strict';
 const api=window.ShenluDemoI18n;
 if(!api)return;
 await api.ready;
 const localeAPI=window.ShenluDemoLocale;if(!localeAPI)return;
 const nav=document.createElement('nav');nav.className='opening-languages';nav.setAttribute('aria-label','Language');
 const orientation=document.createElement('p');orientation.className='opening-orientation';
 const orientationCopy={'zh-Hant':'請將手機橫向，完整顯示遊戲開場。',en:'Turn your phone sideways for the game opening.',ja:'スマートフォンを横向きにしてください。',ko:'게임 시작 화면은 휴대전화 가로 모드를 권장합니다.','zh-Hans':'请将手机横向，完整显示游戏开场。'};
 for(const locale of localeAPI.supported){
  const button=document.createElement('button');button.type='button';button.lang=locale;button.textContent=localeAPI.labels[locale];button.dataset.locale=locale;
  button.addEventListener('click',async()=>{
   const buttons=[...nav.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
   try{let target=api;try{if(parent!==window&&parent.ShenluDemoI18n)target=parent.ShenluDemoI18n;}catch(_){}
    await target.ready;await target.set(locale);
   }finally{buttons.forEach(b=>b.disabled=false);refresh();}
  });nav.append(button);
 }
 function refresh(){for(const b of nav.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.locale===api.locale));orientation.textContent=orientationCopy[api.locale];}
 nav.append(orientation);document.body.append(nav);addEventListener('demo-language',refresh);refresh();
})();
