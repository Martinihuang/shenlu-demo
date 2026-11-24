(function(root){'use strict';
const KEY='shenlu.current-battle-record.v1',FILE='current-battle.json',FOLDER='battle-records',VERSION='20260929-battle-record-v4';
let record=null,session=null,handle=null,pendingText=null,writing=false,issue='',fileIssue='尚未選擇對戰紀錄的儲存資料夾。';
const clone=x=>JSON.parse(JSON.stringify(x));
const storage=()=>root.ShenluStorage||root.localStorage;
let recordDB,recordPending=null,recordWriting=false;
function recordStore(mode,action){return new Promise((resolve,reject)=>{const tx=recordDB.transaction('records',mode),req=action(tx.objectStore('records'));tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('對戰紀錄未完成'));});}
const ready=(async()=>{
 try{
  const legacy=storage().getItem(KEY);
  if(legacy)record=JSON.parse(legacy);
  recordDB=await new Promise((resolve,reject)=>{const req=indexedDB.open('shenlu-demo-v2-battle-record-data',1);req.onupgradeneeded=()=>req.result.createObjectStore('records');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  if(record){await recordStore('readwrite',s=>s.put(record,'current'));if(storage().getItem(KEY)===legacy)storage().removeItem(KEY);}
  else record=await recordStore('readonly',s=>s.get('current'))||null;
 }catch(e){issue=globalThis.ShenluPlayerCopy.error(e,'record');}
})();
async function saveRecord(){
 if(recordWriting)return;
 recordWriting=true;
 try{await ready;if(!recordDB)throw Error('無法開啟這台裝置上的對戰紀錄。');while(recordPending!==null){const next=recordPending;recordPending=null;try{await recordStore('readwrite',s=>s.put(next,'current'));issue='';}catch(e){if(recordPending===null)recordPending=next;throw e;}}}
 catch(e){issue=globalThis.ShenluPlayerCopy.error(e,'record');}
 finally{recordWriting=false;}
}
function dbHandle(mode,value){return new Promise((resolve,reject)=>{const req=indexedDB.open('shenlu-demo-v2-battle-record-file',1);req.onupgradeneeded=()=>req.result.createObjectStore('handles');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('handles',mode),store=tx.objectStore('handles');const q=mode==='readonly'?store.get('current-in-subfolder'):store.put(value,'current-in-subfolder');let result;q.onsuccess=()=>{result=q.result;};tx.oncomplete=()=>{db.close();resolve(result);};tx.onerror=()=>{db.close();reject(tx.error);};};});}
async function flush(){if(writing||!handle||pendingText===null)return;writing=true;try{while(pendingText!==null){if(await handle.queryPermission({mode:'readwrite'})!=='granted'){fileIssue='請重新連接紀錄資料夾，並允許儲存。';break;}const text=pendingText;pendingText=null;const stream=await handle.createWritable();await stream.write(text);await stream.close();fileIssue=globalThis.ShenluPlayerCopy.text('tc-copy.extra.recordSynced');}}catch(e){fileIssue=globalThis.ShenluPlayerCopy.error(e,'record');}finally{writing=false;}}
function persist(){if(!record)return;record.updatedAt=new Date().toISOString();const text=JSON.stringify(record,null,2);recordPending=clone(record);void saveRecord();pendingText=text;void flush();}
dbHandle('readonly').then(h=>{if(h){handle=h;void flush();}}).catch(()=>{});
function stateView(s){return {turn:s.turn,side:s.side,phase:s.phase,winner:s.winner,attack:clone(s.attack),pending:clone(s.pending),window:clone(s.window),players:s.players.map(p=>({lp:p.lp,handCount:p.hand.length,hand:clone(p.hand),deckCount:p.deck.length,slots:clone(p.slots),back:clone(p.back),field:clone(p.field),grave:clone(p.grave)}))};}
function ensure(s,kind){if(!s)return false;if(!record||record.run!==s.run){record={schema:1,version:VERSION,run:s.run,startedAt:new Date().toISOString(),url:location.href,userAgent:navigator.userAgent,config:clone(s.config),initialState:clone(s),entries:[],lastEventNo:0};}record.latestState=clone(s);record.cardNames=Object.fromEntries(Object.entries(root.TW09Data.cards).map(([id,c])=>[id,c.name]));return true;}
function capture(kind,extra={}){try{const s=session?.state;if(!ensure(s,kind))return;const logs=s.log.filter(e=>(e.eventNo||0)>record.lastEventNo);if(logs.length)record.lastEventNo=Math.max(...logs.map(e=>e.eventNo||0));record.entries.push({sequence:record.entries.length+1,time:new Date().toISOString(),kind,revision:session.revision,hidden:document.hidden,...clone(extra),state:stateView(s),logs:clone(logs)});persist();}catch(e){issue=globalThis.ShenluPlayerCopy.error(e,'record');console.warn(issue);}}
function attach(s){session=s;for(const name of ['begin','beginLesson','restore','commit','settle','surrender']){const original=s[name];s[name]=function(...args){if(name==='commit')capture('action-before',{side:args[1],action:args[0]});try{const result=original.apply(s,args);capture(name==='commit'?'action-after':name,name==='commit'?{engineerHandHistory:clone(result.engineerHandHistory||[]),events:(result.events||[]).map(e=>({eventNo:e.eventNo,text:e.text,visual:e.visual}))}:{});return result;}catch(e){capture('error',{operation:name,message:e.message});throw e;}};}return s;}
async function connect(){if(!root.showDirectoryPicker)throw Error('此瀏覽器無法直接儲存到資料夾，請改用「下載詳細對戰紀錄」。');if(!handle){const selected=await root.showDirectoryPicker({id:'shenlu-battle-records',mode:'readwrite'});const folder=selected.name===FOLDER?selected:await selected.getDirectoryHandle(FOLDER,{create:true});handle=await folder.getFileHandle(FILE,{create:true});}if(await handle.requestPermission({mode:'readwrite'})!=='granted')throw Error('尚未允許儲存到紀錄資料夾。');await dbHandle('readwrite',handle);if(record)pendingText=JSON.stringify(record,null,2);await flush();}

function download(){const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=FILE;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function mount(body){const el=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;body.append(n);return n;};el('p','自動保留目前這一場；新對戰開始覆寫，續戰則接續。');el('p','畫面只顯示公開行動；下載的詳細紀錄另含雙方手牌變化。');const status=el('p',issue||fileIssue);el('p','首次使用時，請按「連接紀錄資料夾」選擇儲存位置。連接成功後會自動更新本場的對戰紀錄，也可按「下載詳細對戰紀錄」另存。');el('button','連接紀錄資料夾').onclick=async()=>{try{await connect();status.textContent=fileIssue;}catch(e){status.textContent=globalThis.ShenluPlayerCopy.error(e,'record');}};el('button','下載詳細對戰紀錄').onclick=download;const table=el('table','');table.style='width:100%;font-size:16px;text-align:left';for(const text of ['回合｜行動紀錄',...(record?.entries||[]).flatMap(e=>e.logs.map(l=>'第 '+l.turn+' 回合｜'+l.text))]){const tr=document.createElement('tr'),td=document.createElement('td');td.textContent=text;tr.append(td);table.append(tr);}if(!(record?.entries.length))el('p','尚無對戰紀錄');globalThis.ShenluPlayerCopy.foldRecord(body);}
addEventListener('error',e=>capture('browser-error',{message:e.message}));addEventListener('unhandledrejection',e=>capture('unhandled-rejection',{message:String(e.reason)}));document.addEventListener('visibilitychange',()=>capture('visibility-change'));addEventListener('pagehide',()=>capture('pagehide'));
root.ShenluBattleRecord={attach,capture,mount,ready,version:VERSION};
})(window);
