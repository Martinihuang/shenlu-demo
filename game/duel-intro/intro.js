(() => {
 'use strict';
 if(new URLSearchParams(location.search).get('campaign')==='1')return;
 const campaign=new URLSearchParams(location.search).get('campaign')==='1',bridge=window.ShenluCampaignIntro;if(campaign&&(!bridge||bridge.error))return;
 const $=id=>document.getElementById(id), clamp=x=>Math.max(0,Math.min(1,x));
 const ally=$('ally'),enemy=$('enemy'),canvas=$('particles'),ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // Keep filters off the 3D container so browsers preserve both card faces.
 for(const card of [$('cardA'),$('cardB')]){card.style.filter='none';card.parentElement.style.filter='drop-shadow(0 5px 18px #000)'}
 const state={elapsed:0,duration:3000,playing:false,started:false,first:null,mode:'random',last:0,raf:0,skipUntil:null,token:null,initialized:false,entered:false};
 const targetOrigin=location.origin==='null'?'*':location.origin;
 function send(message){$('duel').contentWindow.postMessage(message,targetOrigin)}
 function enterDuel(){if(campaign){if(state.entered)return;try{bridge.enter();state.entered=true;}catch(e){$('ready').hidden=false;$('ready').querySelector('p').textContent=globalThis.ShenluPlayerCopy.error(e,'intro');$('play').textContent='返回九國入口';$('play').onclick=()=>location.href='../world-portrait.html';}return;}if(!state.initialized||state.entered)return;state.entered=true;send({type:'SHENLU_DUEL_ENTER',token:state.token});$('duel').style.pointerEvents='auto';$('seek').disabled=true;for(const b of $('shots').children)b.disabled=true;$('screen').classList.add('duelLive');$('status').textContent=orderText()+'｜決鬥已開始；重播將放棄本場。'}
 addEventListener('message',e=>{if(e.source!==$('duel').contentWindow||e.origin!==location.origin)return;if(e.data?.type==='SHENLU_DUEL_INITIALIZED'&&e.data.token===state.token){state.initialized=true;if(state.elapsed>=state.duration)enterDuel()}else if(e.data?.type==='SHENLU_DUEL_ERROR')$('status').textContent='決鬥未能開始：'+e.data.message});
 let points=[[],[]];const heroRects=new WeakMap();
 function frameHero(img,route){const box=globalThis.ShenluHeroFraming?.rect?.(route,480,1040,600,884);if(!box)return;heroRects.set(img,box);Object.assign(img.style,{left:box.left/480*100+'%',top:box.top/1040*100+'%',width:box.width/480*100+'%',height:box.height/1040*100+'%',objectFit:'fill'});}
 function sample(img){
  const c=document.createElement('canvas');c.width=96;c.height=208;const k=Math.min(432/img.naturalWidth,697/img.naturalHeight),w=img.naturalWidth*k,h=img.naturalHeight*k,g=c.getContext('2d'),r=heroRects.get(img)||{left:(480-w)/2,top:884-h,width:w,height:h};
  g.drawImage(img,r.left/5,r.top/5,r.width/5,r.height/5);
  try{const pix=g.getImageData(0,0,96,208).data,out=[];for(let y=2;y<208;y+=5)for(let x=2;x<96;x+=5)if(pix[(y*96+x)*4+3]>100)out.push({x:x*5,y:y*5,seed:(x*17+y*31)%97/97});return out.filter((_,i)=>i%Math.max(1,Math.ceil(out.length/160))===0)}
  catch{return Array.from({length:90},(_,i)=>({x:24+(i*37%89)/89*432,y:284+i/90*600,seed:(i*29%97)/97}))}
 }
 function timing(){return state.duration===3000?[720,1440,2280,3000]:[550,1100,1950,2600]}
 function title(side,name,sub){$('side').textContent=side;$('name').textContent=name;$('subtitle').textContent=sub}
 function resetFrame(){for(const e of [ally,enemy,$('cards'),$('halo'),$('duel'),$('result'),$('flash')])e.style.opacity=0;ctx.clearRect(0,0,480,1040);for(const e of [ally,enemy,$('cards'),$('duel')])e.setAttribute('aria-hidden','true');$('duel').style.pointerEvents='none';}
 function drawHero(img,index,t){
  const reveal=clamp(t/.63),fade=1-clamp((t-.88)/.12);img.style.opacity=fade;img.setAttribute('aria-hidden','false');
  const box=heroRects.get(img),revealY=884-reveal*600;img.style.clipPath=reduced?'none':`inset(${box?Math.max(0,(revealY-box.top)/box.height*100):(1-reveal)*100}% 0 0 0)`;
  img.style.transform=reduced?'none':`translateY(${(1-reveal)*9}px)`;
  $('halo').style.opacity=fade*.65;
  if(reduced||reveal>=1)return;
  for(const p of points[index]){const progress=clamp((reveal-p.y/1040*.08)/.95),tx=p.x,ty=p.y,spread=1-progress;
   const x=tx+Math.sin(p.seed*29)*spread*200,y=ty+spread*(160+p.seed*260);
   ctx.globalAlpha=(.25+.75*Math.sin(progress*Math.PI))*fade;
   ctx.fillStyle=index?'#ffb392':'#ffe1a1';ctx.beginPath();ctx.arc(x,y,1+p.seed*1.5,0,Math.PI*2);ctx.fill();
  }ctx.globalAlpha=1;
 }
 function orderText(){const owner=state.first==='ally'?'我方先手 · 敵方後手':'敵方先手 · 我方後手';return (state.mode==='random'?'抽籤結果：':'教學固定：')+owner}
 function render(){
  resetFrame();const [a,b,c,end]=timing(),t=state.elapsed;let label;
  if(t<a){title(campaign?'我方 · '+bridge.ally.label:'我方 · 中國道士',campaign?bridge.ally.name:'程硯舟','凝神聚形');drawHero(ally,0,t/a);label='我方聚形'}
  else if(t<b){title(campaign?'敵方 · '+bridge.enemy.label:'敵方 · 台灣女乩童',campaign?bridge.enemy.name:'林予安','請神臨壇');drawHero(enemy,1,(t-a)/(b-a));label='敵方聚形'}
  else if(t<c){const p=(t-b)/(c-b),flip=clamp((p-.2)/.32);title('神籙定序','翻籙定先後',state.mode==='random'?'雙方等機率抽籤':'依教學題目固定先後手');
   $('cards').style.opacity=clamp(p/.12);$('cards').setAttribute('aria-hidden','false');
   for(const id of ['cardA','cardB'])$(id).style.transform=`rotateY(${(reduced?(flip>=.5?1:0):flip)*180}deg)`;
   if(flip>=1){$('result').textContent=orderText();$('result').style.opacity=1}label='雙卡翻面';
  }else{const p=clamp((t-c)/(end-c));title('','','');$('duel').style.opacity=clamp(p/.65);$('duel').setAttribute('aria-hidden','false');$('flash').style.opacity=reduced?0:Math.sin(p*Math.PI)*.45;
   $('result').textContent=orderText();$('result').style.opacity=1-clamp((p-.65)/.35);label=p===1?'決鬥舞台':campaign?'進入決鬥舞台':'進入台灣舞台';}
  $('status').textContent=label+' · '+(t/1000).toFixed(1)+' / '+(end/1000).toFixed(1)+' 秒'+(t>=c?'｜'+orderText():'');$('seek').value=t;
 }
 function stop(){state.playing=false;cancelAnimationFrame(state.raf);$('pause').textContent='繼續';}
 function frame(now){if(!state.playing)return;state.elapsed=Math.min(state.duration,state.elapsed+Math.min(now-state.last,80));state.last=now;
  if(state.skipUntil!==null&&now>=state.skipUntil){state.elapsed=state.duration;state.skipUntil=null}
  render();if(state.elapsed>=state.duration){stop();$('pause').disabled=true;$('skip').hidden=true;enterDuel();return}state.raf=requestAnimationFrame(frame);
 }
 function resume(){state.playing=true;state.last=performance.now();$('pause').textContent='暫停';state.raf=requestAnimationFrame(frame)}
 function start(){stop();state.duration=($('speed').value==='short'||reduced)?2600:3000;state.mode=$('mode').value;
  state.first=campaign?(bridge.run.config.first===0?'ally':'enemy'):state.mode==='random'?(crypto.getRandomValues(new Uint32Array(1))[0]%2===0?'ally':'enemy'):state.mode;
  state.started=true;state.elapsed=0;state.skipUntil=null;
  state.initialized=campaign;state.entered=false;state.token=campaign?bridge.run.id:crypto.randomUUID();$('screen').classList.remove('duelLive');if(!campaign)send({type:'SHENLU_DUEL_INIT',token:state.token,first:state.first==='ally'?0:1,seed:crypto.getRandomValues(new Uint32Array(1))[0]});
  $('orderA').textContent=state.first==='ally'?'先手':'後手';$('orderB').textContent=state.first==='enemy'?'先手':'後手';
  $('ready').hidden=true;$('skip').hidden=false;$('pause').disabled=false;$('seek').disabled=false;$('seek').max=state.duration;
  $('speed').disabled=true;$('mode').disabled=true;$('replay').disabled=false;for(const b of $('shots').children)b.disabled=false;render();resume();
 }
 $('play').onclick=start;
 $('replay').onclick=()=>{stop();send({type:'SHENLU_DUEL_STOP'});state.entered=false;state.initialized=false;$('screen').classList.remove('duelLive');state.skipUntil=null;$('speed').disabled=false;$('mode').disabled=false;$('ready').hidden=false;$('play').textContent='重新抽籤並播放';$('skip').hidden=true;$('pause').disabled=true;$('seek').disabled=true;resetFrame();title('決鬥序章','神籙','程硯舟　對　林予安');$('status').textContent='可調整模式，按播放開始新一輪。'};
 $('pause').onclick=()=>state.playing?stop():resume();
 $('skip').onclick=()=>{if(state.skipUntil!==null)return;stop();state.elapsed=timing()[2];state.skipUntil=performance.now()+850;$('skip').hidden=true;render();resume()};
 $('seek').oninput=()=>{stop();state.skipUntil=null;state.elapsed=Number($('seek').value);$('pause').disabled=state.elapsed>=state.duration;$('skip').hidden=state.elapsed>=state.duration;render()};
 for(const b of $('shots').children)b.onclick=()=>{const [a,c,d,end]=timing();$('seek').value=[a*.8,a+(c-a)*.8,c+(d-c)*.8,end][Number(b.dataset.shot)];$('seek').oninput();if(Number(b.dataset.shot)===3)enterDuel();$('screen').scrollIntoView({block:'start',behavior:'instant'})};
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.playing){stop();$('status').textContent+=' · 已暫停';if(campaign){$('ready').hidden=false;$('ready').querySelector('p').textContent='串場已暫停';$('play').textContent='繼續串場';$('play').onclick=()=>{$('ready').hidden=true;resume();};}}});
 const loaded=img=>img.decode();
 const frameReady=campaign?Promise.resolve():new Promise(resolve=>{const f=$('duel');const ready=e=>{if(e.source===f.contentWindow&&e.origin===location.origin&&e.data?.type==='SHENLU_DUEL_READY'){removeEventListener('message',ready);resolve()}};addEventListener('message',ready);const ping=()=>send({type:'SHENLU_DUEL_PING'});f.addEventListener('load',ping,{once:true});ping()});
 Promise.all([...document.images].map(loaded).concat(frameReady)).then(()=>{if(campaign){frameHero(ally,bridge.run.config.country);frameHero(enemy,bridge.run.config.enemy)}points=[sample(ally),sample(enemy)];$('play').disabled=false;$('play').textContent=campaign?'開始決鬥':'播放決鬥串場';$('status').textContent=reduced?'已依系統偏好降低動態，採簡短串場。':'素材已就緒。按播放後才抽定先後手。';}).catch(()=>{$('play').textContent='素材載入失敗';$('status').textContent='請使用完整素材資料夾重新開啟。'});
})();
