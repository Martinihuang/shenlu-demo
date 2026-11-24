(function(root){'use strict';
function frame(video,entry){
 const f=root.ShenluEntranceFraming?.[entry.file];if(!f||f.top===0&&f.bottom===0)return ()=>{};
 const original=video.style.cssText,wrap=document.createElement('div');wrap.className=video.className+' entrance-crop-frame';wrap.style.setProperty('overflow','hidden','important');wrap.style.setProperty('background','transparent','important');video.before(wrap);wrap.append(video);
 function fit(){const w=wrap.clientWidth,h=wrap.clientHeight;if(!w||!h)return;const valid=!video.videoWidth||video.videoWidth===f.width&&video.videoHeight===f.height,k=Math.min(w/f.width,h/(f.height-f.top-f.bottom));const values=valid?{position:'absolute',width:f.width*k+'px',height:f.height*k+'px',left:(w-f.width*k)/2+'px',top:(h-(f.height-f.top-f.bottom)*k)/2-f.top*k+'px',transform:'none','object-fit':'fill'}:{position:'absolute',width:'100%',height:'100%',left:'0',top:'0',transform:'none','object-fit':'contain'};for(const [key,value]of Object.entries(values))video.style.setProperty(key,value,'important');}
 const observer=new ResizeObserver(fit);observer.observe(wrap);video.addEventListener('loadedmetadata',fit);fit();return ()=>{observer.disconnect();video.removeEventListener('loadedmetadata',fit);if(wrap.parentNode)wrap.replaceWith(video);video.style.cssText=original;};
}
function create({parent,entry,poster,className,onFallback=()=>{}}){
 const video=document.createElement('video');video.className=className||'';video.src=entry.src;video.poster=poster||'';video.muted=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-label',entry.name+'登場影片');video.style.opacity='0';parent.append(video);
 const clearFrame=frame(video,entry);
 let failed=false,closed=false,done=false,raf=0,lastTime=-1,lastProgress=0,resolveReady,resolveFinished;
 const ready=new Promise(r=>resolveReady=r),finished=new Promise(r=>resolveFinished=r);
 const settleReady=ok=>{if(resolveReady){resolveReady(ok);resolveReady=null;}clearTimeout(timer);};
 function fail(){if(closed||failed)return;failed=true;video.pause();video.hidden=true;cancelAnimationFrame(raf);settleReady(false);onFallback();resolveFinished(false);}
 const timer=setTimeout(fail,8000);
 video.addEventListener('loadeddata',()=>settleReady(true),{once:true});video.addEventListener('error',fail);
 video.addEventListener('ended',()=>{done=true;cancelAnimationFrame(raf);resolveFinished(true);},{once:true});
 function watch(now){if(closed||failed||done)return;if(document.hidden||video.paused||video.currentTime!==lastTime){lastTime=video.currentTime;lastProgress=now;}else if(now-lastProgress>6000){fail();return;}raf=requestAnimationFrame(watch);}
 async function start(){if(closed||failed||done||!await ready||closed)return false;try{await video.play();if(closed){video.pause();return false;}video.style.opacity='1';lastProgress=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(watch);return true;}catch(_){fail();return false;}}
 function pause(){video.pause();}
 function dispose(){if(closed)return;closed=true;pause();clearTimeout(timer);cancelAnimationFrame(raf);if(resolveReady){resolveReady(false);resolveReady=null;}resolveFinished(false);clearFrame();video.removeAttribute('src');video.load();video.remove();}
 return {video,ready,finished,start,pause,dispose,get done(){return done||failed||closed;},get failed(){return failed;}};
}
async function playScene({ally,enemy,first=null,background,onEnter,onCancel,cancelLabel='取消本次挑戰'}){
 const overlay=document.createElement('div');overlay.className='video-duel-scene';overlay.setAttribute('aria-label','敵我登場影片');
 overlay.innerHTML='<style>.video-duel-scene{position:fixed;inset:0;z-index:10000;overflow:hidden;background:#060a10;color:#ffe4b1;font-family:system-ui,"Microsoft JhengHei"}.video-duel-screen{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:center;background:radial-gradient(ellipse at center,#253348,#070b13 85%)}.video-duel-background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.22}.video-duel-title{position:absolute;top:24px;width:100%;text-align:center;font:48px serif;letter-spacing:8px}.video-duel-person{position:absolute;top:120px;left:100px;width:650px;height:840px}.video-duel-person.enemy{left:1170px}.video-duel-art{position:absolute;top:0;left:0;width:650px;height:750px;object-fit:contain;object-position:center;filter:none}.video-duel-person.has-video .video-duel-art{background:transparent}.video-duel-caption{position:absolute;top:770px;width:100%;text-align:center;font:34px serif}.video-duel-caption small{font:24px system-ui;margin-right:18px;color:#d5bf96}.video-duel-center{position:absolute;top:460px;left:760px;width:400px;text-align:center;font:60px serif}.video-duel-status{font:23px system-ui;margin-top:24px;line-height:1.5}.video-duel-actions{position:absolute;bottom:22px;left:40px;right:40px;display:flex;gap:20px}.video-duel-actions button{font:28px system-ui;min-height:58px;padding:10px 26px;background:#243044;border:1px solid #b79657;color:#ffe4b1;border-radius:4px;cursor:pointer}.video-duel-actions .primary{margin-left:auto;background:#705127}</style><div class="video-duel-screen"><div class="video-duel-title">神籙・對決</div><div class="video-duel-center">對決<p class="video-duel-status" role="status">登場影片載入中…</p></div><div class="video-duel-actions"></div></div>';
 const screen=overlay.querySelector('.video-duel-screen'),status=overlay.querySelector('.video-duel-status'),actions=overlay.querySelector('.video-duel-actions');
 const fit=()=>screen.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;fit();addEventListener('resize',fit);
 if(background){const bg=document.createElement('img');bg.className='video-duel-background';bg.src=background;bg.alt='';screen.prepend(bg);}
 const clips=[],playedVideoIds=new Set();
 for(const [hero,i]of [[ally,0],[enemy,1]]){
  const panel=document.createElement('section');panel.className='video-duel-person'+(i?' enemy':'');panel.setAttribute('aria-label',i?'敵方':'我方');
  const image=document.createElement('img');image.src=hero.src||hero.portrait;image.alt=hero.name;image.className='video-duel-art';panel.append(image);
  const caption=document.createElement('div');caption.className='video-duel-caption';const label=document.createElement('small');label.textContent=(i?'敵方':'我方')+([0,1].includes(first)?'・'+(first===i?'先手':'後手'):'');caption.append(label,document.createTextNode(hero.name));panel.append(caption);screen.append(panel);
  if(hero.video){panel.classList.add('has-video');const clip=create({parent:panel,entry:hero.video,poster:image.src,className:'video-duel-art',onFallback:()=>{image.hidden=false;panel.classList.remove('has-video');status.textContent='部分影片無法播放，已改用原圖。';}});clip.ready.then(ok=>{if(ok)image.hidden=true;});clip.finished.then(ok=>{if(ok)playedVideoIds.add(hero.video.id)});clips.push(clip);}
 }
 document.body.append(overlay);
 return new Promise(resolve=>{
  let raf=0,last=0,elapsed=0,closed=false,paused=false,loaded=false,advancing=false;
  function cleanup(result){if(closed)return;closed=true;cancelAnimationFrame(raf);clips.forEach(c=>c.dispose());removeEventListener('resize',fit);removeEventListener('pagehide',unload);removeEventListener('visibilitychange',visibility);overlay.remove();resolve(result);}
  const unload=()=>cleanup(false);addEventListener('pagehide',unload,{once:true});
  async function advance(){if(closed||advancing||paused)return;advancing=true;cancelAnimationFrame(raf);clips.forEach(c=>c.pause());try{if(onEnter)await onEnter([...playedVideoIds]);cleanup(true);}catch(error){advancing=false;status.textContent=globalThis.ShenluPlayerCopy.error(error,'intro');}}
  if(onCancel){const cancel=document.createElement('button');cancel.textContent=cancelLabel;cancel.onclick=async()=>{if(paused||closed||advancing)return;paused=true;clips.forEach(c=>c.pause());try{if(await onCancel()){cleanup(false);return;}}catch(error){status.textContent=globalThis.ShenluPlayerCopy.error(error,'intro');}finally{paused=false;if(!closed&&loaded)resume();}};actions.append(cancel);}
  const skip=document.createElement('button');skip.className='primary';skip.textContent='略過串場，進入決鬥';skip.onclick=advance;actions.append(skip);
  async function resume(){if(closed||paused||advancing||document.hidden)return;await Promise.all(clips.map(c=>c.start()));if(closed||paused||advancing)return;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
  function tick(now){if(closed||paused||advancing)return;if(!document.hidden)elapsed+=Math.min(now-last,80);last=now;if(elapsed>=3000&&clips.every(c=>c.done)){advance();return;}raf=requestAnimationFrame(tick);}
  function visibility(){clips.forEach(c=>c.pause());cancelAnimationFrame(raf);if(!document.hidden&&loaded&&!paused&&!closed)resume();}addEventListener('visibilitychange',visibility);
  Promise.all(clips.map(c=>c.ready)).then(()=>{if(closed)return;loaded=true;status.textContent=clips.some(c=>c.failed)?'部分影片無法播放，已改用原圖。':'先後手已確認';resume();});
 });
}
root.ShenluEntranceVideoPlayer={create,playScene,frame};
})(globalThis);
