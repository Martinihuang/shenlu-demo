// Story initialization waits for the selected subtitle language pack.
(()=>{'use strict';const script=document.currentScript,url=new URL('story.js?fixv=9b71ca715062&statsv=community2',script.src);Promise.resolve(globalThis.ShenluDemoI18n?.ready).catch(()=>false).then(()=>{const entry=document.createElement('script');entry.src=url.href;document.body.append(entry);});})();
