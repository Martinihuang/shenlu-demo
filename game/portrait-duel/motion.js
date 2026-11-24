(function(root){'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
function cardDebut(event,cards,seen){const v=event.visual,c=cards[event.card],side=event.actor??v?.side;if(v?.kind!=='effect'||v.stage!=='activation'||!c||![0,1].includes(side))return null;const kind=/spell/.test(c.subtype)?'spell':/trap/.test(c.subtype)?'trap':null;if(!kind||kind==='trap'&&!(v.sourceZone==='back'&&v.fromHidden))return null;const key=side+':'+c.name;if(seen.has(key))return null;seen.add(key);return {id:event.card,name:c.name,kind,side};}
function frame(progress,side,dead=false,reduced=false){const t=clamp(progress),out=smooth((t-.12)/.32),back=smooth((t-.60)/.32),travel=reduced?0:out*(dead?1:1-back);
 const approach=side===0?.40:2.05,windup=reduced?0:Math.sin(clamp(t/.12)*Math.PI)*(side===0?.07:-.05);
 return {travel,scale:reduced?1:1+(approach-1)*travel+windup,opacity:dead?1-smooth((t-.52)/.32):1,hit:t>=.44,flash:t>=.44&&t<.60?1-(t-.44)/.16:0,done:t>=1};}
function toStageRect(stageBox,elementBox,width,height){const sx=stageBox.width/width,sy=stageBox.height/height;return {x:(elementBox.left-stageBox.left)/sx,y:(elementBox.top-stageBox.top)/sy,w:elementBox.width/sx,h:elementBox.height/sy};}
function createPlayer({stage,layer,reduced=()=>false}){let finishActive=null;
 function cancel(){finishActive?.();}
 function run(ms,draw){cancel();return new Promise((resolve,reject)=>{let raf,done=false;const start=performance.now();function fail(error){if(done)return;done=true;cancelAnimationFrame(raf);if(finishActive===finish)finishActive=null;reject(error)}function finish(){if(done)return;done=true;cancelAnimationFrame(raf);try{draw(1);resolve()}catch(error){reject(error)}finally{if(finishActive===finish)finishActive=null}}finishActive=finish;function tick(now){if(done)return;try{const p=clamp((now-start)/ms);draw(p);if(p>=1)finish();else raf=requestAnimationFrame(tick)}catch(error){fail(error)}}try{raf=requestAnimationFrame(tick)}catch(error){fail(error)}});}
 function landscape(){return stage.clientWidth>stage.clientHeight;}
 function rect(el){return toStageRect(stage.getBoundingClientRect(),el.getBoundingClientRect(),stage.clientWidth||1920,stage.clientHeight||1080);}
 function source(part){return stage.querySelector(`[data-side="${part.side}"][data-slot="${part.slot}"] img[data-spirit]`)}
 function ghost(part){const original=source(part);if(!original)return null;const box=rect(original),img=original.cloneNode();img.removeAttribute('id');img.className='combat-spirit';Object.assign(img.style,{background:'none',border:'0',borderRadius:'0',boxShadow:'none',maxWidth:'none',maxHeight:'none',objectFit:'contain',left:box.x+'px',top:box.y+'px',width:box.w+'px',height:box.h+'px'});layer.append(img);const opacity=original.style.opacity;original.style.opacity=0;return {box,img,restore:()=>{original.style.opacity=opacity;img.remove()}};}
 function expandRoster(g,part){if(g&&!landscape()&&!reduced()&&part.side===0&&part.slot>=2){g.thumbnail={...g.box};g.box={x:247,y:825,w:360,h:500};}}
 function placeRoster(g,p,dead){if(!g?.thumbnail)return;const u=smooth(p/.12)*(dead?1:1-smooth((p-.9)/.1)),a=g.thumbnail,b=g.box;Object.assign(g.img.style,{left:(a.x+(b.x-a.x)*u)+'px',top:(a.y+(b.y-a.y)*u)+'px',width:(a.w+(b.w-a.w)*u)+'px',height:(a.h+(b.h-a.h)*u)+'px'});}
 async function attackVideo(part,{name,video,fitStage=false}){
  if(!video||!globalThis.ShenluEntranceVideoPlayer||reduced())return false;
  stage.classList.add('attack-video-active');
  const box=document.createElement('div');box.className='attack-video-show';box.dataset.side=part.side;box.setAttribute('aria-label',name+'首次攻擊影片');
  Object.assign(box.style,{position:'absolute',inset:'0',background:'#060a10',zIndex:10});if(fitStage)Object.assign(box.style,{right:'auto',bottom:'auto',width:stage.clientWidth+'px',height:stage.clientHeight+'px'});layer.append(box);
  const clip=ShenluEntranceVideoPlayer.create({parent:box,entry:video,className:'attack-video-art'});
  clip.video.setAttribute('aria-label',name+'首次攻擊影片');Object.assign(clip.video.style,{width:'100%',height:'100%',objectFit:'contain'});
  const finish=()=>clip.dispose();finishActive=finish;
  try{if(await clip.start())return await clip.finished;return false;}
  finally{if(finishActive===finish)finishActive=null;clip.dispose();box.remove();stage.classList.remove('attack-video-active');}
 }
 async function combat(v,dead,onHit){const a=ghost(v.from),b=v.target?ghost(v.target):null;if(!a){onHit();return;}
  if(v.from.side!==0)expandRoster(a,v.from);if(b)expandRoster(b,v.target);
  const target=b?.box||(landscape()?rect(stage.querySelector(v.from.side===0?'#enemyHUD':'#ownHUD')):(v.from.side===0?{x:317,y:408,w:220,h:195}:rect(document.getElementById('ownHUD'))));
  const dx=target.x+target.w/2-(a.box.x+a.box.w/2),dy=target.y+target.h/2-(a.box.y+a.box.h/2);
  // Friendly spirits cast from their slot; slots 3–5 share slot 3's launch point.
  const launchSlot=Math.min(v.from.slot,2),launchNode=v.from.side===0?stage.querySelector(`[data-side="0"][data-slot="${launchSlot}"]`):null;
  const launchBox=launchNode?rect(launchNode):a.box,start={x:launchBox.x+launchBox.w/2,y:Math.max(32,launchBox.y-36)};
  const end={x:target.x+target.w/2,y:target.y+target.h/2},orb=v.from.side===0?document.createElement('span'):null;
  if(orb){orb.className='combat-orb';Object.assign(orb.style,{position:'absolute',width:'52px',height:'52px',borderRadius:'50%',background:'radial-gradient(circle,#fff 0%,#e4fbff 25%,#65dfff 55%,#288aff00 75%)',boxShadow:'0 0 18px #a9efff,0 0 40px #40bfff',pointerEvents:'none',zIndex:3});layer.append(orb);}
  const killA=dead.has(v.from.uid),killB=!!v.target&&dead.has(v.target.uid);let impact=false;a.img.style.zIndex=2;if(b)b.img.style.zIndex=1;
  const numbers=[];for(let i=0;i<2;i++)if(v.damage?.[i]>0){const box=rect(document.getElementById(i?'enemyHUD':'ownHUD')),n=document.createElement('span');n.className='damage';n.textContent='−'+v.damage[i];n.style.left=(box.x+box.w/2-40)+'px';n.style.top=Math.min(landscape()?stage.clientHeight-70:1260,box.y+box.h)+'px';n.style.zIndex=3;layer.append(n);numbers.push(n)}
  try{await run(reduced()?120:1050,p=>{const f=frame(p,v.from.side,killA,reduced());if(landscape())f.scale=1+(Math.max(.15,Math.min(3.5,target.h/a.box.h))-1)*f.travel;placeRoster(a,p,killA);placeRoster(b,p,killB);a.img.style.transform=`translate(${dx*f.travel*(v.target ? .85 : 1)}px,${dy*f.travel*(v.target ? .85 : 1)}px) scale(${f.scale})`;a.img.style.opacity=f.opacity;
   if(orb){const travel=smooth((p-.12)/.32),stop=v.target?.85:1,charge=smooth(p/.12),burst=smooth((p-.44)/.16);orb.style.left=(start.x+(end.x-start.x)*travel*stop-26)+'px';orb.style.top=(start.y+(end.y-start.y)*travel*stop-26)+'px';orb.style.opacity=String(p<.44?charge:1-burst);orb.style.transform=`scale(${p<.44?.45+.55*charge:1+burst*1.8})`;a.img.style.transform=reduced()?'none':`translateY(${-5*Math.sin(Math.min(p/.44,1)*Math.PI)}px)`;a.img.style.filter=`brightness(${1+.3*(1-travel)*charge})`;}
   if(!landscape()&&v.from.side===0&&v.from.slot<2)a.img.style.clipPath=`inset(0 0 ${Math.max(0,(a.box.y+a.box.h-1332)/a.box.h*100)*(1-f.travel)}% 0)`;
   if(b){b.img.style.opacity=killB?1-smooth((p-.52)/.32):1;b.img.style.transform=`translateX(${reduced()?0:Math.sin(p*90)*f.flash*9}px)`;b.img.style.filter=`brightness(${1+f.flash})`;if(!landscape()&&v.target.side===0&&v.target.slot<2)b.img.style.clipPath=`inset(0 0 ${Math.max(0,(b.box.y+b.box.h-1332)/b.box.h*100)}% 0)`;}
   for(const n of numbers){n.style.opacity=f.hit?String(1-smooth((p-.65)/.35)):'0';n.style.transform=`translateY(${-35*p}px)`}if(f.hit&&!impact){impact=true;onHit()}
  });}finally{orb?.remove();a.restore();b?.restore();for(const n of numbers)n.remove();}
 }
 async function destroy(v){const g=ghost(v);if(!g)return;try{await run(reduced()?1:260,p=>{g.img.style.opacity=1-p;g.img.style.transform=`scale(${1-p*.08})`})}finally{g.restore()}}
 async function summon(part,{level,name,src,video}){
  if(video&&globalThis.ShenluEntranceVideoPlayer&&!reduced()){
   stage.classList.add('entrance-video-active');
   const box=document.createElement('div');box.className='summon-show high';box.style.height=stage.clientHeight+'px';box.dataset.side=part.side;box.setAttribute('aria-label',name+'首登場影片');
   const title=document.createElement('div');title.className='summon-caption';title.textContent=name+'\n'+'★'.repeat(level);box.append(title);layer.append(box);
   const clip=ShenluEntranceVideoPlayer.create({parent:box,entry:video,poster:src,className:'summon-art'});clip.video.style.transform='translateX(-50%)';box.style.opacity='1';let cancelled=false;
   const finish=()=>{cancelled=true;clip.dispose();};finishActive=finish;
   let played=false;
   try{if(await clip.start()){played=await clip.finished;}}finally{if(finishActive===finish)finishActive=null;clip.dispose();box.remove();stage.classList.remove('entrance-video-active');}
   if(played||cancelled)return;
  }
const high=level>=5,box=document.createElement('div');box.className='summon-show '+(high?'high':'normal');box.dataset.side=part.side;box.setAttribute('aria-label',name+'首登場');const ring=document.createElement('div');ring.className='summon-ring';if(!high)box.append(ring);const art=document.createElement('img');art.className='summon-art';art.src=src;art.alt='';box.append(art);const title=document.createElement('div');title.className='summon-caption';title.textContent=name+'\n'+'★'.repeat(level);box.append(title);for(let i=0;i<(high?0:8);i++){const dot=document.createElement('i');dot.className='summon-particle';dot.style.setProperty('--angle',(i*360/(high?0:8))+'deg');box.append(dot)}layer.append(box);try{await run(2500,p=>{const appear=smooth(p/.22),fade=1-smooth((p-.78)/.22);box.style.opacity=high?(p<.9?1:fade):appear*fade;box.style.setProperty('--spread',(reduced()?0:40+p*(high?350:180))+'px');art.style.transform=`translateX(-50%) scale(${reduced()?1:.75+appear*.25})`;ring.style.transform=`translate(-50%,-50%) rotate(${reduced()?0:p*70}deg) scale(${.7+appear*.3})`})}finally{box.remove()}}
 async function cardReveal({name,kind,side,src},duration){duration=2500;const box=document.createElement('div'),art=document.createElement('img'),title=document.createElement('div');box.className='card-debut';box.dataset.side=side;box.setAttribute('aria-label',(kind==='trap'?'伏兵首次翻開：':'行法首次發動：')+name);const height=Math.min(stage.clientHeight*.72,stage.clientWidth*.62*1.5)*.8;Object.assign(box.style,{position:'absolute',left:'50%',top:'45%',transform:'translate(-50%,-50%)',width:height*2/3+'px',height:height+'px',pointerEvents:'none',zIndex:5});art.src=src;art.alt=name;Object.assign(art.style,{width:'100%',height:'100%',objectFit:'contain',borderRadius:'8px',boxShadow:'0 0 36px '+(kind==='trap'?'#c889ee':'#e8c778')});title.textContent=(kind==='trap'?'伏兵翻開':'行法發動')+' · '+name;Object.assign(title.style,{position:'absolute',left:'-20%',bottom:'-44px',width:'140%',textAlign:'center',font:'26px serif',color:'#fff0cc',textShadow:'0 2px 6px #000'});box.append(art,title);layer.append(box);try{await run(duration,p=>{const elapsed=p*duration,fade=1-smooth((elapsed-2150)/350);box.style.opacity=smooth(elapsed/150)*fade;art.style.transform='scale('+(reduced()?1:.92+smooth(elapsed/220)*.08)+')'})}finally{box.remove()}}
 return {combat,attackVideo,destroy,summon,cardReveal,cancel,wait:ms=>run(ms,()=>{}),get busy(){return !!finishActive}};
}
const api={frame,createPlayer,toStageRect,cardDebut};if(typeof module==='object')module.exports=api;else root.PortraitMotion=api;
})(globalThis);
