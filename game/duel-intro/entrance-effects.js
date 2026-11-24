/* Lightweight pre-duel effects; each side chooses once per entrance. */
(function(root){'use strict';
const types=['vortex','float','shadow'],clamp=x=>Math.max(0,Math.min(1,x));
function create({heroes,canvas,points=[]}){
 const ctx=canvas.getContext('2d'),choices=heroes.map(()=>types[crypto.getRandomValues(new Uint32Array(1))[0]%types.length]);
 const shadows=heroes.map((h,i)=>{h.panel.dataset.entranceEffect=choices[i];if(choices[i]!=='shadow')return null;const img=h.image.cloneNode();img.removeAttribute('id');img.alt='';img.setAttribute('aria-hidden','true');img.classList.add('entrance-shadow');Object.assign(img.style,{pointerEvents:'none',opacity:'0',filter:'brightness(0) invert(.6) sepia(1) saturate(5) hue-rotate(215deg) drop-shadow(0 0 18px #bd83ff)',mixBlendMode:'screen'});h.panel.insertBefore(img,h.image);return img;});
 function clear(){heroes.forEach((h,i)=>{Object.assign(h.image.style,{clipPath:'none',opacity:'1',transform:'none'});if(shadows[i])shadows[i].style.opacity='0';});ctx?.clearRect(0,0,1920,1080);}
 function render(elapsed){
  ctx?.clearRect(0,0,1920,1080);
  const gather=clamp((elapsed-1100)/1700),ease=gather*gather*(3-2*gather),fade=clamp(elapsed/380)*(1-clamp((elapsed-2500)/500));
  if(ctx)ctx.globalCompositeOperation='lighter';
  heroes.forEach((h,side)=>{
   const kind=choices[side],cx=side===0?450:1470,dir=side===0?1:-1,gold=side===0?'255,207,115':'136,207,255';
   if(kind==='vortex'){
    if(ctx){
     for(let strand=0;strand<3;strand++){
      ctx.beginPath();for(let j=0;j<=70;j++){const t=j/70,angle=t*Math.PI*5+elapsed*.003*dir+strand*Math.PI*2/3,radius=(75+245*t)*(1-ease*.84),x=cx+Math.cos(angle)*radius,y=940-t*740+Math.sin(angle)*radius*.16;if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
      ctx.strokeStyle=`rgba(${gold},${fade*(strand===0?.42:.2)})`;ctx.lineWidth=strand===0?3:1.5;ctx.stroke();
     }
     ctx.beginPath();ctx.ellipse(cx,940,245*(1-ease*.35),40,0,0,Math.PI*2);ctx.strokeStyle=`rgba(${gold},${fade*.65})`;ctx.lineWidth=2;ctx.stroke();
     for(const p of points){if(p.index!==side)continue;const level=(p.level+elapsed/3100)%1,angle=p.phase+elapsed*.006*dir+level*Math.PI*5,radius=70+250*level,sx=cx+Math.cos(angle)*radius,sy=940-level*740+Math.sin(angle)*radius*.17;ctx.globalAlpha=fade*(.45+.55*(1+Math.sin(angle))/2);ctx.fillStyle=gather>.6?p.color:(side===0?'#ffdfa0':'#a8e0ff');ctx.beginPath();ctx.arc(sx+(p.x-sx)*ease,sy+(p.y-sy)*ease,1.5+(1-gather)*2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    }
    const reveal=clamp((elapsed-900)/1850);Object.assign(h.image.style,{clipPath:`inset(${(1-reveal)*100}% 0 0 0)`,opacity:String(reveal),transform:'none'});
   }else{
    const p=clamp((elapsed-250)/2450),smooth=p*p*(3-2*p);Object.assign(h.image.style,{clipPath:'none',opacity:String(smooth),transform:kind==='float'?`translateY(${-75*(1-smooth)}px)`:'none'});
    if(kind==='shadow'){const glow=shadows[side];Object.assign(glow.style,{clipPath:'none',opacity:String(Math.sin(p*Math.PI)*.85),transform:`translateX(${dir*95*(1-smooth)}px) scale(${1+.16*(1-smooth)})`});}
   }
  });
  if(ctx){ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
 }
 return {choices,render,clear,destroy(){clear();shadows.forEach(s=>s?.remove());}};
}
async function playStory({ally,enemy,background}){
 const av=root.ShenluEntranceVideos?.hero(ally.id),bv=root.ShenluEntranceVideos?.hero(enemy.id),a={...ally,video:av?.name===ally.name?av:null},b={...enemy,video:bv?.name===enemy.name?bv:null};
 if((a.video||b.video)&&root.ShenluEntranceVideoPlayer&&!matchMedia('(prefers-reduced-motion: reduce)').matches)return root.ShenluEntranceVideoPlayer.playScene({ally:a,enemy:b,background});
 const overlay=document.createElement('div');overlay.className='story-entrance';overlay.style.cssText='position:fixed;inset:0;z-index:10000;background:#060a10;overflow:hidden';
 const screen=document.createElement('div');screen.style.cssText='position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:center';overlay.append(screen);
 const fit=()=>screen.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;fit();addEventListener('resize',fit);
 if(background){const bg=document.createElement('img');bg.src=background;bg.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.4';screen.append(bg);}
 const heroes=[ally,enemy].map((hero,i)=>{const panel=document.createElement('section');panel.setAttribute('aria-label',i?'敵方':'我方');panel.style.cssText=`position:absolute;left:${i?1100:80}px;top:150px;width:740px;height:820px`;
  const image=document.createElement('img');image.src=hero.src;image.alt=hero.name;image.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;opacity:0';panel.append(image);
  const caption=document.createElement('div');caption.textContent=(i?'敵方・':'我方・')+hero.name;caption.style.cssText='position:absolute;bottom:0;width:100%;text-align:center;font:40px serif;color:#ffe4b1;text-shadow:0 2px 8px #000';panel.append(caption);screen.append(panel);return {panel,image};});
 const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;canvas.style.cssText='position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen';screen.append(canvas);
 const label=document.createElement('div');label.textContent='神籙　對決';label.style.cssText='position:absolute;top:60px;width:100%;text-align:center;font:54px serif;color:#ffe4b1';screen.append(label);
 const skip=document.createElement('button');skip.textContent='略過串場，進入決鬥';skip.style.cssText='position:absolute;right:40px;bottom:24px;padding:12px 28px;background:#715025;color:#ffe4b1;border:1px solid #d6b468;font:28px serif';screen.append(skip);document.body.append(overlay);
 await new Promise(resolve=>{
  let frame=0,last=0,elapsed=0,finished=false,effect=null;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(frame);effect?.destroy();removeEventListener('resize',fit);removeEventListener('pagehide',finish);overlay.remove();resolve();};skip.onclick=finish;addEventListener('pagehide',finish,{once:true});
  Promise.all(heroes.map(async h=>{let timer;try{await Promise.race([h.image.decode(),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('timeout')),4000))]);}catch(_){h.image.hidden=true;}finally{clearTimeout(timer);}})).then(()=>{
   if(finished)return;effect=create({heroes,canvas});if(reduced)effect.clear();
   const tick=now=>{if(finished)return;if(last&&!document.hidden)elapsed+=Math.min(now-last,80);last=now;if(!reduced){effect.render(elapsed);if(elapsed>=2800)effect.clear();}if(elapsed>=(reduced?1000:4000)){finish();return;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
  });
 });
}
root.ShenluEntranceEffects={create,playStory};
})(globalThis);
