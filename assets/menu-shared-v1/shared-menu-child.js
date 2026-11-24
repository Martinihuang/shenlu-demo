(()=>{'use strict';
if(parent===window)return;
let started=false;
addEventListener('message',event=>{
 if(event.source!==parent||event.data?.channel!=='shenlu-menu-v1'||event.data.type!=='init'||started)return;
 started=true;initialise({kind:event.data.kind,state:()=>event.data.state});
});
parent.postMessage({channel:'shenlu-menu-v1',type:'ready'},'*');
function initialise(host){
const $=s=>document.querySelector(s),send=(a,v)=>parent.postMessage({channel:'shenlu-menu-v1',type:'action',action:a,value:v},'*');
function bind(selector,action,value){const e=$(selector);if(!e)return;e.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();if(host.kind==='nether'&&['challenge','gallery'].includes(action)){const name=$('#queens [aria-pressed=true]')?.getAttribute('aria-label');send('select',NetherMenuCandidate.find(q=>q.name===name)?.id);}if(host.kind==='nations'&&action==='enter')send('select',$('#countries [aria-pressed=true]')?.dataset.country);send(action,typeof value==='function'?value():value);},true);}
function button(e){const b=document.createElement('button');b.type='button';b.className=e.className;b.innerHTML=e.innerHTML;e.replaceWith(b);b.style.cssText='font-family:inherit;font-weight:400;border:0;background:none;text-align:left;cursor:pointer';return b;}
const state=host.state();
const readable=document.createElement('style');
const readableRules={
 opening:'.subtitle{font-size:56px}.option{min-height:168px}.minor{font-size:56px}.minor button{min-height:168px!important;min-width:168px!important}',
 nations:'.back{height:168px;top:17px}.back,.mode,.description,.utility{font-size:56px}.mode{top:187px;height:168px}.utility{top:845px;height:168px}.utility::before{top:34px}.enter{top:592px;height:168px}.otherworld{top:760px;height:168px}.country-button .country-caption{height:69px}.country-button .country-caption svg{height:64px}',
 worlds:'.back{font-size:56px;height:168px;top:28px;left:235px;width:665px;isolation:isolate}.return-frame{position:absolute;left:0;top:7px;width:665px;height:150px;z-index:-1;pointer-events:none}.nameplate p{font-size:56px}.enter{font-size:64px}',
 game:'.information{height:240px;background:radial-gradient(ellipse at 50% 40%,#261426,#130d1d 80%)}.information h2{top:26px}.information #theme{top:135px;font-size:40px!important}.signature-label,#signature,#availability,.information .rules{display:none!important}.information #availability{top:189px}.rules{top:232px!important}.game-actions-cover{position:absolute;left:105px;top:448px;width:580px;height:207px;background:#150d20;z-index:2;pointer-events:none}.art-button .button-surface{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}#deck,#reward,#challenge{isolation:isolate}#deck{padding-left:50px!important;left:125px!important;width:290px!important;top:452px!important}#reward{font-size:33px!important;padding-left:50px!important;left:415px!important;width:270px!important;top:452px!important}#challenge{left:110px!important;top:552px!important;width:576px!important}.subtitle{font-size:34px}#back{font-size:36px;height:98px;top:6px}#allCards{font-size:36px;height:98px;top:149px}#deck,#reward{font-size:34px;height:98px;top:459px}#challenge{height:98px;top:546.5px}#theme,#signature,#availability,.rules,.opponent strong,#pageNumber,.signature-label{font-size:34px!important}.rules{left:50px;width:480px}dialog,.deck-card span{font-size:18px}.modal-heading button,.dialog-button,.deck-card{min-height:48px}',
 nether:'.world-title{display:none!important}.information{top:280px!important}.queen-heading-cover{position:absolute;left:205px;top:195px;width:1035px;height:433px;z-index:2;background:#170d16;pointer-events:none}.queen-heading-frame{position:absolute;left:210px;top:220px;width:1030px;height:380px;z-index:2;pointer-events:none}.back{font-size:56px;height:168px;top:26px}.inventory{font-size:56px}.art-button{height:165px!important;isolation:isolate;text-shadow:0 2px 5px #10040c}.primary{top:631px!important}#details{top:799px!important}#gallery{top:967px!important}.secondary-material{display:none}.button-surface{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}.menu-button-cover{position:absolute;left:205px;top:628px;width:1035px;height:508px;background:#170d16;z-index:2;pointer-events:none}'
};
readable.textContent=readableRules[host.kind]+'dialog button{min-height:48px;min-width:48px}';document.head.append(readable);
if(host.kind==='game'){
 const cover=document.createElement('div');cover.className='game-actions-cover';$('#scene').append(cover);
 for(const [id,x,y,w,h]of [['deck',125,460,290,96],['reward',415,460,270,96],['challenge',110,548,576,95]]){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','button-surface');svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');const im=document.createElementNS(svg.namespaceURI,'image');im.setAttribute('href','assets/menu-plate-unbranded-v1.png');im.setAttribute('width','1844');im.setAttribute('height','853');svg.append(im);$('#'+id).prepend(svg);
 }
 $('#allCards').textContent='卡牌圖鑑';$('#allCards').setAttribute('aria-label','全部異世界卡牌');

}
if(host.kind==='nether'){
 const headingCover=document.createElement('div');headingCover.className='queen-heading-cover';$('#scene').append(headingCover);
 const headingFrame=document.createElementNS('http://www.w3.org/2000/svg','svg');headingFrame.setAttribute('class','queen-heading-frame');headingFrame.setAttribute('viewBox','210 320 1030 310');headingFrame.setAttribute('preserveAspectRatio','none');headingFrame.setAttribute('aria-hidden','true');const headingImage=document.createElementNS(headingFrame.namespaceURI,'image');headingImage.setAttribute('href','menu-plate-unbranded-v1.png');headingImage.setAttribute('width','3120');headingImage.setAttribute('height','1440');headingFrame.append(headingImage);$('#scene').append(headingFrame);
 const cover=document.createElement('div');cover.className='menu-button-cover';$('#scene').append(cover);
 for(const [id,y,h]of [['challenge',647,160],['details',807,152],['gallery',960,152]]){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','button-surface');svg.setAttribute('viewBox',`210 ${y} 1030 ${h}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');
  const im=document.createElementNS(svg.namespaceURI,'image');im.setAttribute('href','menu-plate-unbranded-v1.png');im.setAttribute('width','3120');im.setAttribute('height','1440');svg.append(im);$('#'+id).prepend(svg);
 }
}
if(host.kind==='opening'){
 const style=document.createElement('style');style.textContent='.option,.minor button{font-family:inherit;font-weight:400;border:0;background:none;text-align:left;cursor:pointer}.option{width:100%}.option:disabled{opacity:.45;cursor:default}.minor button{font-size:inherit;letter-spacing:inherit;min-height:150px;padding:0;color:inherit}button:focus-visible{outline:3px solid #efcc80;outline-offset:8px}.option.start{color:#fff0c5}.option:not(.start){color:#c8c1b0}';document.head.append(style);
 const options=[...document.querySelectorAll('.option')].map(button);options[1].disabled=!state.canContinue;
 [...document.querySelectorAll('.minor span')].forEach(button);
 [['.start','start'],['.option:nth-child(2)','continue'],['.option:nth-child(3)','load'],['.minor button:first-child','help'],['.minor button:last-child','settings']].forEach(([s,a])=>bind(s,a));
}
if(host.kind==='nations'){
 const i=NationsCandidate.findIndex(c=>c.name===state.country);if(i>=0)select(i);
 $('#countries').addEventListener('click',e=>{const b=e.target.closest('[data-country]');if(b)send('select',b.dataset.country);});
 [['#back','back'],['#story','story'],['#world','world'],['#enter','enter'],['#heroGallery','gallery'],['#collection','collection'],['#saves','saves'],['.otherworld','otherworld']].forEach(([s,a])=>bind(s,a));
}
if(host.kind==='worlds'){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('class','return-frame');svg.setAttribute('viewBox','235 35 520 150');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');const im=document.createElementNS(svg.namespaceURI,'image');im.setAttribute('href','portal-plate-v2-r1.png');im.setAttribute('width','3120');im.setAttribute('height','1440');svg.append(im);$('#back').prepend(svg);
 [['#back','back'],['#game','game'],['#nether','nether']].forEach(([s,a])=>bind(s,a));
}
if(host.kind==='game'){
 if(state.opponent){const i=OtherworldCandidate.opponents.findIndex(o=>o.id===state.opponent);if(i>=5)$('#next').click();const b=$('[data-index="'+i+'"]');b?.click();}
 $('#opponents').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(b)send('select',OtherworldCandidate.opponents[+b.dataset.index].id);});
 [['#back','back'],['#challenge','challenge'],['#deck','deck'],['#allCards','cards']].forEach(([s,a])=>bind(s,a));
}
if(host.kind==='nether'){
 const i=NetherMenuCandidate.findIndex(q=>q.id===state.queen);if(i>=0)paint(i);
 $('#queens').addEventListener('click',e=>{const b=e.target.closest('button');if(b)send('select',NetherMenuCandidate.find(q=>q.name===b.getAttribute('aria-label')).id);});
 [['.back','back'],['#challenge','challenge'],['#gallery','gallery']].forEach(([s,a])=>bind(s,a));
}

function centerLabels(){
 const anchors={nations:[['#back',475,112],['#story',460,273],['#world',944,273],['#enter',700,676],['.otherworld',700,829]],worlds:[['#back',575,112]],nether:[['.back',510,110]]}[host.kind];
 if(!anchors)return;
 for(const [selector,x,y]of anchors){const e=$(selector);let label=e.querySelector('.button-label,.enter-label,.frame-label');if(!label){label=document.createElement('span');label.className='frame-label';for(const n of [...e.childNodes])if(n.nodeType===Node.TEXT_NODE)label.append(n);e.append(label);}const c=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=`${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;const m=ctx.measureText(label.textContent),dy=((m.actualBoundingBoxAscent||0)-(m.actualBoundingBoxDescent||0)-(m.fontBoundingBoxAscent||0)+(m.fontBoundingBoxDescent||0))/2;Object.assign(label.style,{position:'absolute',left:(x-e.offsetLeft)+'px',top:(y-e.offsetTop+dy)+'px',width:'max-content',height:'auto',lineHeight:'1',transform:'translate(-50%,-50%)',pointerEvents:'none',whiteSpace:'nowrap'});const arrow=e.querySelector('.button-chevron,.chevron');if(arrow)arrow.style.top=(y-e.offsetTop)+'px';}
}
document.fonts.ready.then(centerLabels);

// Background plates fill the viewport; foreground figures and lettering keep their proportions.
const scene=$('#scene');
const foreground={opening:'.logo,.subtitle,.talisman,.menu',nations:'.back,h1,.mode,#countryName,.description,.enter,.otherworld,.utility,#countries,.opening-brand',worlds:'.back,.opening-brand,h1,.nameplate,.enter',game:'.opening-brand,.hero-window,#back,#allCards,.information,#deck,#reward,#challenge,#opponents,#previous,#next,#pageNumber',nether:'.opening-brand,.back,.information,.art-button,#queens,#hero'}[host.kind];
function fillViewport(){const w=document.documentElement.clientWidth,h=document.documentElement.clientHeight,sx=w/scene.offsetWidth,sy=h/scene.offsetHeight,k=Math.min(sx,sy);scene.style.left=w/2+'px';scene.style.top=h/2+'px';scene.style.transform='translate(-50%,-50%) scale('+sx+','+sy+')';scene.style.setProperty('--foreground-y',sx/sy);for(const e of scene.querySelectorAll(foreground)){e.style.transform='scale('+k/sx+','+k/sy+')';e.style.transformOrigin='center';}if(host.kind==='nether'){const image=$('#hero'),baseWidth=Number(image.dataset.layoutWidth),baseLeft=Number(image.dataset.layoutLeft);if(baseWidth){const width=baseWidth*Math.max(1,sy/k);image.style.width=width+'px';image.style.left=(baseLeft-(width-baseWidth)/2)+'px';image.style.transformOrigin='top center';}}}
if(host.kind==='nether'){const image=$('#hero'),remember=()=>{image.dataset.layoutWidth=parseFloat(image.style.width)||1973;image.dataset.layoutLeft=parseFloat(image.style.left)||0;fillViewport();};new MutationObserver(remember).observe(image,{attributes:true,attributeFilter:['src']});remember();}
addEventListener('resize',fillViewport);visualViewport?.addEventListener('resize',fillViewport);fillViewport();
document.documentElement.dataset.menuConnected='true';
document.fonts.ready.then(()=>requestAnimationFrame(()=>parent.postMessage({channel:'shenlu-menu-v1',type:'painted'},'*')));
}
})();
