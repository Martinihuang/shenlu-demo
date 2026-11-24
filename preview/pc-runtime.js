(function(){'use strict';
 const game=new URL('../game/',document.currentScript.src);let store;
 function getStore(){if(!store){store=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});store.load();}return store;}
 function profile(){return getStore().getProfile();}
 function current(){return ShenluStorage.getItem(ShenluCampaignStore.KEY)===null?null:profile();}
 function go(path){location.href=new URL(path,game).href;}
 function resume(){const p=current();if(!p?.heroChosen){location.href='character-selection.html';return;}const path=ShenluSaves.resume(p);if(path==='journey.html'||path.startsWith('journey.html?'))location.href=path;else if(path==='world-portrait.html')location.href='journey.html?mode=world';else go(path);}
 function report(e){let d=document.getElementById('runtime-error');if(!d){d=document.createElement('dialog');d.id='runtime-error';const p=document.createElement('p');p.setAttribute('role','alert');const next=document.createElement('button');next.textContent='繼續當前旅程';next.onclick=resume;const form=document.createElement('form');form.method='dialog';const close=document.createElement('button');close.textContent='返回';form.append(close);d.append(p,next,form);document.body.append(d);}d.querySelector('p').textContent=e.message+'。既有進度與存檔保留。';d.showModal();}
 function guard(fn){return()=>{try{fn()}catch(e){report(e)}};}
 function choose(key){const s=getStore();s.selectHero(key,{preserveDeck:profile().heroChosen===true});s.setResume('journey.html');}
 function meeting(region){return window[region==='TW'?'ShenluMeetingStoryData':'Shenlu'+region+'MeetingStoryData'];}
 window.ShenluPC={getStore,profile,current,go,resume,report,guard,choose,meeting};
})();
