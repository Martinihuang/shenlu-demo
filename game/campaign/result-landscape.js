(function(root){'use strict';
const base=new URL('../portrait-duel/',document.currentScript.src);
function el(tag,text,parent,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;}
root.ShenluLandscapeResult={render(host,{run,stage,btn,finish,resume}){
 host.className='result-landscape';const active=run.status==='active',ally=root.ShenluHeroBindings[run.config.country],enemy=(run.config.nether?root.ShenluUnderworldUI.hero(run.config.nether.queen):root.ShenluHeroBindings[run.config.enemy]);
 const art=el('section',null,host,'result-art');art.setAttribute('aria-label','本場對戰');
 const background=root.ShenluLandscapeStages.resolve({opponent:run.config.enemy});if(background)art.style.backgroundImage=`linear-gradient(0deg,#07101be8,transparent 65%),url("${background.background}")`;
 const image=el('img',null,art);image.src=new URL(ally.portrait,base);image.alt=ally.name;image.onerror=()=>image.hidden=true;
 const caption=el('div',null,art,'result-caption');el('small',stage?.name||'本場對戰',caption);el('h2',ally.name,caption);el('p','對手 · '+enemy.name,caption);
 const copy=el('section',null,host,'result-copy');el('small','決鬥戰果',copy);
 el('h1',active?'決鬥進行中':({win:'挑戰勝利',loss:'挑戰落敗',surrender:'已認輸',draw:'平手'}[run.outcome]||'本場結束'),copy);
 el('p',active?'這場決鬥尚未結束，可以繼續挑戰。':run.outcome==='win'?'勝利已記錄，帶著新的收穫繼續旅程。':run.outcome==='surrender'?'本次挑戰已結束，可調整牌組後再次出發。':run.outcome==='draw'?'本場平手，可再次挑戰。':'本次挑戰已結束，整備後再來挑戰。',copy,'result-summary');
 const rewards=el('section',null,copy,'result-rewards');const entries=Object.entries(run.reward?.cards||{});el('h2',run.config.nether&&!active?'魔王物品結算':entries.length?(run.status==='claimed'?'已領取獎勵':'本次獎勵'):(active?'挑戰尚未結算':'本次未獲得獎勵'),rewards);
 if(entries.length){el('p',entries.length+' 種卡／共 '+entries.reduce((n,[,v])=>n+v,0)+' 張',rewards);const grid=el('div',null,rewards,'result-reward-grid'),pager=el('div',null,rewards,'result-pager');let page=0;const total=Math.ceil(entries.length/8);const prev=btn('上一頁',()=>{page--;draw();},pager),count=el('span','',pager),next=btn('下一頁',()=>{page++;draw();},pager);function draw(){grid.replaceChildren();for(const[id,n]of entries.slice(page*8,page*8+8))el('p',root.TW09Data.cards[id].name+' × '+n,grid);count.textContent=(page+1)+'／'+total;prev.disabled=page===0;next.disabled=page===total-1;}draw();}
 else el('p',run.config.nether?root.ShenluUnderworldLedger.rewardText(run):active?'每次行動後會保存對局進度。':'收藏與既有通關紀錄保留。',rewards);
 if(!active)el('p',run.status==='claimed'?'本場戰果已保存。':'選擇下方去向時，會一併確認並保存戰果。',copy,'result-note');
 const actions=el('footer',null,host,'challenge-actions result-actions');
 if(active){btn('返回旅程',()=>location.href='../../preview/journey.html?mode=world',actions);btn('繼續決鬥',resume,actions,'primary');}
 else{btn('換牌組再挑戰',()=>finish('retry'),actions);btn('調整牌組',()=>finish('collection'),actions);btn(stage?.nether?'返回幽冥世界':stage?.country==='DM'?'返回異世界':'返回九國',()=>finish(stage?.country==='DM'?'otherworld':'world'),actions);btn('返回旅程',()=>finish('journey'),actions,'primary');}
}};
})(window);
