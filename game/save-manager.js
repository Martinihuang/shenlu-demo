(function(root){'use strict';
const base=new URL('./',document.currentScript.src),routes={'VA-SOFIA':['sofiaStory','va-sofia'],'VA-MATTEO':['matteoStory','va-matteo'],'NO-INGRID':['ingridStory','no-ingrid'],'NO-EINAR':['einarStory','no-einar'],'EG-HERO':['salmaStory','eg-salma'],'EG-P-HERO':['karimStory','eg-karim'],'IN-MIRA':['miraStory','in-mira'],'IN-ARUL':['arulStory','in-arul'],'TH-AJARN':['mariStory','th-mari'],'TH-LUANGPOR':['songchaiStory','th-songchai'],TW:['story','tw-az'], 'TW-YUAN':['yuanStory','tw-yuan'],CN:['chengStory','cn-cheng'],YUN:['yunStory','cn-yun'],'JP-N-HERO':['tsukiStory','jp-tsuki'],JP:['yukiStory','jp-yuki'],KR:['haryeongStory','kr-haryeong'],'KR-N-HERO':['doyunStory','kr-doyun']};
const generationKey='demo-v2:shenlu-save-generation',generation=root.ShenluStorage.getItem(generationKey);
let dbPromise,queue=Promise.resolve(),lastTick=Date.now(),failure='',resetting=false;
const currentGeneration=()=>root.ShenluStorage.getItem(generationKey)===generation;
function writable(){if(resetting)throw Error('正在回復初始，請稍候');if(!currentGeneration())throw Error('旅程已在其他分頁回復初始，請重新載入');}
function db(){return dbPromise||(dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open('demo-v2:shenlu-save-slots',1);r.onupgradeneeded=()=>r.result.createObjectStore('slots',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>{dbPromise=null;reject(r.error);};}));}
async function transaction(mode,action){if(root.ShenluNativeSlots)return root.ShenluNativeSlots.transaction(mode,action);const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('slots',mode),s=t.objectStore('slots');let value;action(s,v=>value=v);t.oncomplete=()=>resolve(value);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||Error('存檔未完成'));});}
const list=()=>transaction('readonly',(s,done)=>{s.getAll().onsuccess=e=>done(e.target.result);});
const put=value=>transaction('readwrite',s=>s.put(value));
function error(e){failure=globalThis.ShenluPlayerCopy.error(e,'save')+'。目前旅程仍保留，請匯出備份。';let n=document.getElementById('slotSaveError');if(!n){n=document.createElement('p');n.id='slotSaveError';n.setAttribute('role','alert');n.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#421e23;color:white;padding:10px;z-index:10000';document.body.append(n);}n.textContent=failure;}
function story(p){const pair=routes[p.country];if(!pair)return null;const own=p[pair[0]],meeting=p.country.startsWith('NO-')?p.noMeetingStory:p.country.startsWith('VA-')?p.vaMeetingStory:p.country.startsWith('EG-')?p.egMeetingStory:p.country.startsWith('IN-')?p.inMeetingStory:p.country.startsWith('TH-')?p.thMeetingStory:p.country.startsWith('KR')?p.krMeetingStory:p.country.startsWith('JP')?p.jpMeetingStory:null;return {route:pair[1],cursor:meeting?.run?.status==='active'?'L9':own?.cursor,state:meeting?.run?.status==='active'||(own?.cursor==='L9'&&meeting)?meeting:own};}
function safePath(path){return typeof path==='string'&&/^(story\.html|journey\.html|world-portrait\.html|expedition\.html|campaign\/index\.html)(\?[^#]*)?$/.test(path)&&!/[<>\\]/.test(path)?path:null;}
function resume(p){const s=story(p),r=s?.state?.run;if(r?.status==='active')return 'portrait-duel/index.html?story='+(r.lessonId==='no-meeting-final'?'no-meeting':r.lessonId==='va-meeting-final'?'va-meeting':r.lessonId==='eg-meeting-final'?'eg-meeting':r.lessonId==='in-meeting-final'?'in-meeting':r.lessonId==='th-meeting-final'?'th-meeting':r.lessonId==='kr-meeting-final'?'kr-meeting':s.route)+'&lesson='+encodeURIComponent(r.lessonId);
 if(p.run?.status==='active'&&p.run.config?.expedition)return 'duel-intro/index.html?campaign=1&run='+encodeURIComponent(p.run.id);
 if(p.run?.status==='active')return 'duel-intro/index.html'+'?campaign=1&run='+encodeURIComponent(p.run.id);
 if(r?.status==='passed'&&!s.state.claimed.includes(r.chapterId))return 'story.html?chapter='+r.chapterId+'&after=1';
 if(p.run?.status==='completed')return 'campaign/index.html?view=result';
 const path=safePath(p.resumePath);if(path?.startsWith('story.html')&&!path.includes('view=chapters')&&s?.cursor)return 'story.html?chapter='+s.cursor+(s.state.scene>=10?'&after=1':'');
 return path||'journey.html';}
function prepare(p){const now=Date.now();p.savedAt=now;const data={'VA-SOFIA':root.ShenluSofiaStoryData,'VA-MATTEO':root.ShenluMatteoStoryData,'NO-INGRID':root.ShenluIngridStoryData,'NO-EINAR':root.ShenluEinarStoryData,'EG-HERO':root.ShenluSalmaStoryData,'EG-P-HERO':root.ShenluKarimStoryData,'IN-MIRA':root.ShenluMiraStoryData,'IN-ARUL':root.ShenluArulStoryData,'TH-AJARN':root.ShenluMariStoryData,'TH-LUANGPOR':root.ShenluSongchaiStoryData,TW:root.ShenluStoryData,'TW-YUAN':root.ShenluYuanStoryData,CN:root.ShenluChengStoryData,YUN:root.ShenluYunStoryData,'JP-N-HERO':root.ShenluTsukiStoryData,JP:root.ShenluYukiStoryData,KR:root.ShenluHaryeongStoryData,'KR-N-HERO':root.ShenluDoyunStoryData}[p.country],sp=story(p),id=sp?.cursor;const meeting=p.country.startsWith('NO-')?root.ShenluNOMeetingStoryData:p.country.startsWith('VA-')?root.ShenluVAMeetingStoryData:p.country.startsWith('EG-')?root.ShenluEGMeetingStoryData:p.country.startsWith('IN-')?root.ShenluINMeetingStoryData:p.country.startsWith('TH-')?root.ShenluTHMeetingStoryData:p.country.startsWith('KR')?root.ShenluKRMeetingStoryData:p.country.startsWith('JP')?root.ShenluJPMeetingStoryData:['CN','YUN'].includes(p.country)?root.ShenluCNMeetingStoryData:root.ShenluMeetingStoryData;const chapter=id==='L9'?meeting?.chapter(sp.route):data?.chapters.find(c=>c.id===id);if(chapter)p.saveScene={country:p.country,title:chapter.title,art:id==='L9'?chapter.background:chapter.art};p.playMs=(Number.isFinite(p.playMs)&&p.playMs>=0?p.playMs:0)+(document.hidden?0:Math.max(0,now-lastTick));lastTick=now;return p;}
function summary(p){const hero=root.ShenluHeroBindings?.[p.country],s=story(p),r=s?.state?.run;const path=resume(p);let state=path.includes('view=collection')?'牌組編輯':path.includes('world-portrait')?'九國巡禮':path.includes('view=chapters')?'章節選擇':path.includes('view=result')?'戰果待結算':'旅程選擇';if(path.includes('story=')||path.startsWith('story.html?chapter='))state=(r?.chapterId||s?.cursor||'').replace('L','第')+'章'+(r?.status==='active'?'・對局中':s?.state?.scene>=10?'・戰後串場':'・串場');if(p.run?.status==='active'&&!r?.status?.includes('active'))state='九國巡禮・對局中';if(p.saveScene?.country===p.country&&state.includes('章'))state+='・'+p.saveScene.title;return {hero:hero?.name||p.country,label:hero?.label||p.country,state,art:p.saveScene?.country===p.country&&/^(story\/|campaign\/)/.test(p.saveScene.art)&&!p.saveScene.art.includes('..')?new URL(p.saveScene.art,base).href:hero?new URL(hero.arena,new URL('portrait-duel/',base)).href:null};}
function record(id,name,p){return {id,name,profile:JSON.parse(JSON.stringify(p)),savedAt:Date.now()};}
function auto(p){if(!p.heroChosen||resetting||!currentGeneration())return;const snapshot=record(p.country+'::auto-0','自動保存',p);queue=queue.then(()=>{if(resetting||!currentGeneration())return;return transaction('readwrite',s=>{const request=s.getAll();request.onsuccess=()=>{const old=request.result.filter(x=>x.id.startsWith(p.country+'::')&&/^auto-[0-2]$/.test(x.id.split('::')[1])).sort((a,b)=>a.id.localeCompare(b.id));for(const item of old){const n=Number(item.id.slice(-1));if(n<2)s.put({...item,id:p.country+'::auto-'+(n+1)});}if(currentGeneration())s.put(snapshot);};});}).catch(error);}
async function save(store,id,name){writable();if(!/^manual-[0-7]$/.test(id))throw Error('請選擇 1～8 號欄位');await queue;writable();const p=store.getProfile();if(!p.heroChosen)throw Error('請先開始旅程');await put(record(p.country+'::'+id,name,p));}
async function restore(store,item){writable();store.validateSave(JSON.stringify(item.profile));await queue;writable();const p=store.getProfile();if(p.heroChosen)await put(record(p.country+'::before-load','讀檔前備份',p));store.importSave(JSON.stringify(item.profile));location.href=root.ShenluLandscapeSaves?root.ShenluLandscapeSaves.destination(store.getProfile()):new URL(resume(store.getProfile()),base).href;}
function ask(title,value){return new Promise(resolve=>{const d=document.createElement('dialog');d.setAttribute('aria-label',title);const p=document.createElement('p');p.textContent=title;d.append(p);let input;if(value!==undefined){input=document.createElement('input');input.value=value;input.maxLength=40;input.setAttribute('aria-label','存檔名稱');d.append(input);}let result=null;for(const label of ['確認','取消']){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(label==='確認')result=input?input.value:true;d.close();};d.append(b);}d.addEventListener('close',()=>{d.remove();resolve(result);});document.body.append(d);d.showModal();input?.focus();});}

async function resetJourney(store){
 writable();
 const confirmed=await new Promise(resolve=>{
  const d=document.createElement('dialog');d.setAttribute('aria-label','回復初始');d.className='reset-journey-dialog';
  const title=document.createElement('h2');title.textContent='確定要重頭遊玩？';d.append(title);
  const p=document.createElement('p');p.textContent='將清除此裝置的所有主角章節、收藏、牌組、手動與自動存檔及讀檔前備份，回到選擇主角。此操作無法復原；需要保留進度，請先取消並匯出備份。';d.append(p);
  let result=false;
  for(const label of ['取消','清除並重新開始']){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{result=label==='清除並重新開始';d.close();};d.append(b);}
  d.addEventListener('close',()=>{d.remove();resolve(result);});document.body.append(d);d.showModal();d.querySelector('button').focus();
 });
 if(!confirmed)return false;
 writable();resetting=true;let previous,cleared=false,changedGeneration=false;
 try{
  await queue;previous=await list();
  root.ShenluStorage.setItem(generationKey,root.crypto.randomUUID());changedGeneration=true;
  await transaction('readwrite',s=>s.clear());cleared=true;
  lastTick=Date.now();store.resetJourney();failure='';
 }catch(e){
  try{if(cleared)await transaction('readwrite',s=>{for(const item of previous)s.put(item);});}
  finally{if(changedGeneration){if(generation===null)root.ShenluStorage.removeItem(generationKey);else root.ShenluStorage.setItem(generationKey,generation);}resetting=false;}
  throw e;
 }
 location.href=new URL(root.ShenluLandscapeSaves?'../preview/character-selection.html':'selection-portrait-v1/index.html',base).href;return true;
}

function render(host,store,backup){let tab='manual',page=0,generation=0;const draw=async()=>{const revision=++generation;host.replaceChildren();const make=(tag,text,parent=host)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};const button=(text,fn,parent=host)=>{const b=make('button',text,parent);b.onclick=()=>Promise.resolve().then(fn).catch(e=>{status.textContent=globalThis.ShenluPlayerCopy.error(e,'save');});return b;};make('h1','儲存／讀取旅程');const tabs=make('div','');tabs.className='save-tabs';for(const [id,label] of [['manual','手動存檔'],['auto','自動存檔'],['backup','備份與移轉']])button(label,()=>{tab=id;page=0;draw();},tabs);const status=make('p',failure||'目前主角獨立存檔；讀取會恢復此主角的收藏、牌組與進度。');status.setAttribute('role','status');
 let entries;try{await queue;entries=(await list()).filter(x=>x.profile?.country===store.getProfile().country).sort((a,b)=>Number(b.id.includes('::'))-Number(a.id.includes('::'))).map(x=>({...x,id:x.id.includes('::')?x.id.split('::')[1]:x.id}));}catch(e){status.textContent=globalThis.ShenluPlayerCopy.error(e,'save');return;}
 if(!host.isConnected||revision!==generation)return;
 if(entries.some(x=>/^manual-[89]$/.test(x.id)))button('舊版存檔',()=>{tab='legacy';page=0;draw();},tabs);
 if(tab==='backup'){backup(host);return;}
 const grid=make('div','');grid.className='save-slot-list';const ids=tab==='manual'?Array.from({length:8},(_,i)=>'manual-'+i).slice(page*4,page*4+4):tab==='legacy'?['manual-8','manual-9']:['auto-0','auto-1','auto-2','before-load'];
 for(const id of ids){const item=entries.find(x=>x.id===id),card=make('article','',grid);card.className='save-slot';if(item){const info=summary(item.profile);if(info.art){const img=make('img','',card);img.src=info.art;img.alt='';}make('strong',id.startsWith('auto-')?['自動保存・最新','自動保存・前一次','自動保存・前兩次'][Number(id.slice(-1))]:item.name,card);make('span',info.label+'・'+info.hero+'｜'+info.state,card);make('small',new Date(item.savedAt).toLocaleString('zh-TW')+'｜'+Math.floor((item.profile.playMs||0)/60000)+' 分鐘',card);}
 else make('strong',id==='before-load'?'讀檔前備份（空）':id.startsWith('auto')?'自動存檔（空）':'欄位 '+(Number(id.split('-')[1])+1)+'（空）',card);
 const actions=make('div','',card);if(tab==='manual')button(item?'覆寫':'儲存',async()=>{const name=item?.name||'旅程 '+(Number(id.split('-')[1])+1);if(item&&!await ask('覆寫「'+name+'」？'))return;await save(store,id,name);draw();},actions);
 if(item)button('讀取',async()=>{if(await ask('讀取「'+item.name+'」？目前旅程會先保存為讀檔前備份。'))await restore(store,item);},actions);
 }
 if(tab==='manual'){const nav=make('div','');nav.className='save-tabs';button('上一頁',()=>{page--;draw();},nav).disabled=page===0;make('span',(page+1)+' / 2',nav);button('下一頁',()=>{page++;draw();},nav).disabled=page===1;}
 button('繼續旅程',()=>location.href=new URL(resume(store.getProfile()),base).href);
 };draw();}
document.addEventListener('visibilitychange',()=>{lastTick=Date.now();});
root.ShenluSaves={ask,prepare,auto,resume,summary,render,save,restore,resetJourney,list,safePath};
})(globalThis);
