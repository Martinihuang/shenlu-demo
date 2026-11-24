(function(){'use strict';
if(new URLSearchParams(location.search).get('campaign')!=='1')return;
const bridge=window.ShenluCampaignIntro,screen=document.getElementById('screen');
if(bridge&&!bridge.error&&(bridge.ally.video||bridge.enemy.video)&&window.ShenluEntranceVideoPlayer&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
 document.documentElement.classList.remove('campaign-loading');
 const scene=bridge.run.config.nether?{background:bridge.enemy.arena}:window.ShenluLandscapeStages?.resolve({opponent:bridge.run.config.enemy,expedition:bridge.run.config.expedition});
 ShenluEntranceVideoPlayer.playScene({ally:bridge.ally,enemy:bridge.enemy,first:bridge.run.config.first,background:scene?.background,onEnter:played=>bridge.enter(played),cancelLabel:bridge.run.state?'返回旅程':'取消本次挑戰',onCancel:async()=>{if(bridge.run.state||await ShenluSaves.ask('取消尚未開戰的本次挑戰？收藏、通關與存檔會保留。')){bridge.cancel();return true;}return false;}});
 return;
}
document.documentElement.classList.add('landscape-intro');screen.setAttribute('aria-label','橫版決鬥串場');
const fit=()=>document.documentElement.style.setProperty('--intro-scale',Math.min(innerWidth/1920,innerHeight/1080));fit();addEventListener('resize',fit);
function el(tag,text,parent,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;}
const originalAlly=document.getElementById('ally'),originalEnemy=document.getElementById('enemy');screen.replaceChildren();
const heading=el('header',null,screen,'intro-title');el('small','決鬥序章',heading);el('h1','神籙',heading);
const center=el('div',null,screen,'intro-center');el('strong','對決',center);
const status=el('p','',center);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const footer=el('footer',null,screen,'intro-actions');
function button(text,fn){const b=el('button',text,footer);b.onclick=async()=>{try{await fn();}catch(e){status.textContent=globalThis.ShenluPlayerCopy.error(e,'intro');}};return b;}
if(!bridge||bridge.error){document.documentElement.classList.remove('campaign-loading');status.textContent=bridge?.error||'挑戰無法載入';button('返回旅程',()=>location.href='../../preview/journey.html');return;}
let frame=0,elapsed=0,last=0,playing=false,loaded=false,paused=false,leaving=false,staticOnly=false,points=[];
const stop=()=>{playing=false;cancelAnimationFrame(frame);};
const scene=bridge.run.config.nether?{background:bridge.enemy.arena}:window.ShenluLandscapeStages?.resolve({opponent:bridge.run.config.enemy,expedition:bridge.run.config.expedition});
if(scene){const bg=el('img',null,screen,'intro-background');bg.src=scene.background;bg.alt='';bg.onerror=()=>bg.remove();}
const heroes=[];
for(const[hero,image,label,first]of [[bridge.ally,originalAlly,'我方',bridge.run.config.first===0],[bridge.enemy,originalEnemy,'敵方',bridge.run.config.first===1]]){
 const panel=el('section',null,screen,'intro-hero');panel.setAttribute('aria-label',label);panel.append(image);image.className='intro-person';image.removeAttribute('style');image.style.opacity='0';
 const caption=el('div',null,panel,'intro-caption');el('small',label+' · '+hero.label,caption);el('h2',hero.name,caption);
 const order=el('strong',first?'先手':'後手',caption,'intro-order');order.hidden=true;heroes.push({panel,image,order});
}
const canvas=el('canvas',null,screen,'intro-particles');canvas.width=1920;canvas.height=1080;canvas.setAttribute('aria-hidden','true');
let entrance=null;
let ctx=null;try{ctx=canvas.getContext('2d');}catch(_){}
function showStatic(){entrance?.clear();screen.classList.remove('assembling');heroes.forEach(h=>{h.image.style.clipPath='none';h.image.style.opacity='1';h.order.hidden=false;});try{ctx?.clearRect(0,0,1920,1080);}catch(_){}}
function enter(){if(leaving||paused)return;stop();showStatic();leaving=true;try{bridge.enter();}catch(e){leaving=false;status.textContent=globalThis.ShenluPlayerCopy.error(e,'intro');}}
button(bridge.run.state?'返回旅程':'取消本次挑戰',async()=>{
 if(bridge.run.state){if(!leaving){bridge.cancel();leaving=true;}return;}
 if(leaving||paused)return;paused=true;stop();
 try{if(await ShenluSaves.ask('取消尚未開戰的本次挑戰？收藏、通關與存檔會保留。')){bridge.cancel();leaving=true;return;}}
 finally{paused=false;if(!leaving&&loaded)resume();}
});
const skip=button('略過串場，進入決鬥',enter);skip.className='primary';
function sample(image,index){
 if(!ctx||!image.naturalWidth)return [];
 const off=document.createElement('canvas');off.width=72;off.height=96;const c=off.getContext('2d');if(!c)return [];
 c.drawImage(image,0,0,72,96);const pixels=c.getImageData(0,0,72,96).data;
 const scale=Math.min(740/image.naturalWidth,820/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 const left=(index===0?450:1470)-w/2,top=970-h,result=[];
 for(let y=1;y<96;y+=4)for(let x=1;x<72;x+=4){const at=(y*72+x)*4;if(pixels[at+3]>100)result.push({x:left+x/72*w,y:top+y/96*h,index,phase:(x*17+y*11)*.19,level:y/96,color:`rgb(${pixels[at]},${pixels[at+1]},${pixels[at+2]})`});}
 return result;
}
// Local-file pages may display images while denying canvas pixel reads.
// Keep the entrance animation without reading or bypassing protected pixels.
function fallbackPoints(image,index){
 const scale=Math.min(740/image.naturalWidth,820/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 const cx=index===0?450:1470,top=970-h,result=[];
 for(let row=0;row<24;row++)for(let col=0;col<12;col++){
  const level=(row+.5)/24,spread=level<.2?.18:level<.55?.34:.46;
  result.push({x:cx+((col+.5)/12*2-1)*w*spread,y:top+level*h,index,phase:(col*17+row*11)*.19,level,color:index===0?'#ffdfa0':'#a8e0ff'});
 }
 return result;
}
const clamp=x=>Math.max(0,Math.min(1,x));
function resume(){if(paused||leaving)return;last=performance.now();playing=true;frame=requestAnimationFrame(tick);}
function vortex(now){entrance.render(elapsed);}

function tick(now){
 if(!playing||paused||leaving)return;
 if(document.hidden){last=now;frame=requestAnimationFrame(tick);return;}
 elapsed+=Math.min(now-last,80);last=now;
 if(!staticOnly){try{vortex(elapsed);}catch(_){staticOnly=true;elapsed=0;showStatic();status.textContent='先後手已確認';}}
 if(!staticOnly&&elapsed>=2800){showStatic();status.textContent='先後手已確認';}
 if(elapsed>=(staticOnly?1000:3000)){status.textContent='準備進入決鬥';enter();return;}
 frame=requestAnimationFrame(tick);
}
async function load(){
 status.textContent='人物載入中，亦可略過串場。';
 const results=await Promise.all(heroes.map(async({image})=>{let timer;try{await Promise.race([image.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),4000);})]);return true;}catch(_){return false;}finally{clearTimeout(timer);}}));
 if(leaving)return;
 results.forEach((ok,i)=>{heroes[i].image.hidden=!ok;if(ok){let sampled=[];try{sampled=sample(heroes[i].image,i);}catch(_){/* No pixel access is needed by the geometric fallback. */}points.push(...(sampled.length?sampled:fallbackPoints(heroes[i].image,i)));}});
 loaded=true;staticOnly=matchMedia('(prefers-reduced-motion: reduce)').matches||!ctx||!points.length;
 if(staticOnly)showStatic();else{entrance=ShenluEntranceEffects.create({heroes,canvas,points});screen.classList.add('assembling');}
 status.textContent=results.every(Boolean)?(staticOnly?'先後手已確認':'雙方聚形'): '部分人物圖片未載入，將直接銜接決鬥。';
 if(!paused)resume();
}
document.documentElement.classList.remove('campaign-loading');addEventListener('pagehide',()=>{leaving=true;stop();});load();
})();
