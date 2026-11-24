/* Counts successful story/challenge entry only. No player/profile data is sent. */
(()=>{'use strict';
 const root=new URL('../',document.currentScript.src);
 const production=location.hostname==='martinihuang.github.io'&&location.pathname.startsWith('/shenlu-demo/')&&!new URLSearchParams(location.search).has('qa');
 let pending=false,sent=false,ready;
 function send(){if(!pending||sent||!ready?.count)return;sent=true;try{ready.count({path:'play-start',title:'Journey started',event:true,referrer:''});}catch(_){}}
 globalThis.ShenluDemoStatistics={start(){pending=true;send();}};
 if(!production||navigator.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;
 fetch(new URL('demo/community-config.json',root),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(config=>{
  const gc=config.goatcounter;if(!gc?.enabled||!/^[a-z0-9-]+$/.test(gc.site))return;
  globalThis.goatcounter={no_onload:true};
  const script=document.createElement('script');script.async=true;script.src='https://gc.zgo.at/count.js';script.dataset.goatcounter='https://'+gc.site+'.goatcounter.com/count';
  script.onload=()=>{ready=globalThis.goatcounter;send();};document.head.append(script);
 }).catch(()=>{});
})();
