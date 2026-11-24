(() => {
 'use strict';
 const country = new URLSearchParams(location.search).get('country');
 const stages = ShenluCampaignCatalog.stages.filter(s => s.country === country && !s.number);
 if(stages.length !== 2) return;
 const app=document.getElementById('app');
 const store=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});
 let profile=null;
 try { if(ShenluStorage.getItem(ShenluCampaignStore.KEY)!==null) profile=store.load(); }
 catch(e){app.textContent='旅程讀取失敗，請返回存檔管理恢復。';return;}
 const preservedNav=app.querySelector('.journey-links');
 const key='shenlu.pc.opponent.'+country;
 let selected=stages.find(s=>s.id===profile?.lastStage)||stages[0];
 try {selected=stages.find(s=>s.id===sessionStorage.getItem(key))||selected;}catch{}
 const $=id=>document.getElementById(id), hero=s=>ShenluHeroBindings[s.enemy];
 const heroBounds={"TW":{"size":[1024,1536],"bbox":[30,93,993,1443]},"TW-YUAN":{"size":[1024,1536],"bbox":[0,0,905,1410]},"JP-N-HERO":{"size":[620,930],"bbox":[114,30,505,906]},"JP":{"size":[1024,1536],"bbox":[0,42,1000,1483]},"CN":{"size":[1024,1536],"bbox":[59,210,965,1477]},"YUN":{"size":[1024,1536],"bbox":[11,10,1024,1485]},"KR-N-HERO":{"size":[1024,1536],"bbox":[277,529,746,1436]},"KR":{"size":[1024,1536],"bbox":[0,16,1024,1501]},"EG-P-HERO":{"size":[1024,1536],"bbox":[176,555,847,1436]},"EG-HERO":{"size":[1024,1536],"bbox":[0,27,983,1457]},"TH-LUANGPOR":{"size":[1024,1536],"bbox":[337,586,687,1436]},"TH-AJARN":{"size":[1024,1536],"bbox":[232,29,783,1470]},"IN-ARUL":{"size":[1024,1536],"bbox":[361,552,663,1436]},"IN-MIRA":{"size":[1024,1536],"bbox":[276,268,780,1497]},"VA-MATTEO":{"size":[1024,1536],"bbox":[299,554,725,1436]},"VA-SOFIA":{"size":[1024,1536],"bbox":[75,58,816,1450]},"NO-EINAR":{"size":[1024,1536],"bbox":[82,336,941,1436]},"NO-INGRID":{"size":[1024,1536],"bbox":[0,0,871,1426]}};
 const ns='http://www.w3.org/2000/svg';
 const element=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
 const button=(text,fn,cls)=>{const b=element('button',text,cls);b.type='button';b.onclick=fn;return b;};
 const claimed=s=>!!profile?.clearedStages.includes(s.id);
 document.documentElement.classList.add('landscape-world');
 app.className='world-selection';
 app.innerHTML='<header class="world-header"><button id="world-back">◀　返回九國</button><h1></h1></header><section id="content" aria-label="本國對手"></section><footer class="world-footer"><div class="world-selected" aria-live="polite">已選對手：<strong id="world-selected-name"></strong></div><div class="world-prize">✧ 巡禮進度</div><p class="world-hint">擊敗男女主角，開放該國女妖入口</p><button id="world-deck">查看對手牌組</button><button id="world-reward">查看通關進度</button><button id="world-confirm" class="world-primary">確認挑戰</button></footer>';
 app.querySelector('h1').textContent=stages[0].name+'・選擇對手';
 app.style.setProperty('--country-art',`url("${new URL(hero(stages[0]).arena,new URL('portrait-duel/',location.href)).href}")`);
 if(preservedNav){preservedNav.className='world-tools';app.append(preservedNav);for(const a of preservedNav.querySelectorAll('a')){if(a.textContent==='殘局教學')a.remove();else{a.style.removeProperty('display');a.style.removeProperty('margin-top');}}}
 function fit(){app.style.setProperty('--world-scale',Math.min(innerWidth/1920,innerHeight/1080));}
 addEventListener('resize',fit);fit();
 $('world-back').onclick=()=>{location.href='../preview/journey.html?mode=world&country='+country;};
 function select(s){selected=s;try{sessionStorage.setItem(key,s.id);}catch{}for(const b of app.querySelectorAll('.world-person'))b.setAttribute('aria-pressed',String(b.dataset.stage===s.id));$('world-selected-name').textContent=hero(s).name;$('world-confirm').disabled=!s.enabled;mobilePreview(s);}
function mobilePreview(s){let box=$('mobileWorldDetail');if(!box){box=element('aside',null,'mobile-world-detail');box.id='mobileWorldDetail';app.append(box);}box.replaceChildren();const h=hero(s);const art=element('img',null,'mobile-world-art');art.src=new URL(h.portrait,new URL('portrait-duel/',location.href)).href;art.alt=h.name;const bounds=heroBounds[s.enemy];if(bounds){const [x0,y0,x1,y1]=bounds.bbox;const svg=document.createElementNS(ns,'svg');svg.classList.add('mobile-world-art');svg.setAttribute('viewBox',`${(x0+x1)/2-(y1-y0)*.39} ${y0} ${(y1-y0)*.78} ${y1-y0}`);svg.setAttribute('preserveAspectRatio','xMidYMax meet');svg.setAttribute('aria-label',h.name);const image=document.createElementNS(ns,'image');image.setAttribute('href',art.src);image.setAttribute('width',bounds.size[0]);image.setAttribute('height',bounds.size[1]);svg.append(image);box.append(svg);}else box.append(art);const info=element('div',null,'mobile-world-info');const caption=element('small',null);caption.append(element('span',stages[0].name),document.createTextNode('・'),element('span',h.label));info.append(caption,element('h2',h.name),element('p',claimed(s)?'已擊敗此主角':'尚未擊敗此主角'));box.append(info);}
 function fight(){const content=$('content');content.replaceChildren();content.dataset.view='fight';
  for(const s of stages){const h=hero(s), b=button('',()=>select(s),'world-person');b.dataset.stage=s.id;b.setAttribute('aria-label',h.name+'・'+h.label);const scene=element('div',null,'world-person-scene');b.append(scene);
   const crop=h.worldCrop||ShenluPortraitCrops.crops[s.enemy],scale=710/crop.height;
   const svg=document.createElementNS(ns,'svg');svg.classList.add('world-person-art');svg.setAttribute('viewBox',`${crop.centerX-424/scale} ${crop.top} ${848/scale} ${730/scale}`);svg.setAttribute('aria-hidden','true');
   const image=document.createElementNS(ns,'image');image.setAttribute('href',new URL(h.worldPortrait||h.portrait,new URL('portrait-duel/',location.href)));image.setAttribute('width',crop.size[0]);image.setAttribute('height',crop.size[1]);svg.append(image);b.append(svg);
   const badge=element('span',claimed(s)?'已擊敗':'尚未擊敗','world-badge');badge.classList.toggle('claimed',claimed(s));b.append(badge);
   const plate=element('span',null,'world-nameplate');plate.append(element('strong',h.name),element('small',h.label));b.append(plate,element('span','✓','world-check'));content.append(b);
  }select(selected);
 }
 function modal(title){const d=element('dialog',null,'world-modal');d.setAttribute('aria-label',title);const head=element('header');head.append(element('h2',title),button('關閉',()=>d.close()));d.append(head);document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal();return d;}
 function showList(rewards){if(rewards){const d=modal('巡禮進度');d.append(element('p',claimed(selected)?'已擊敗此主角。':'尚未擊敗此主角。'));globalThis.ShenluDemoRewards.normal(d,country);if(country==='TW'){const ready=(globalThis.ShenluStageAccess?.expeditionAllOpen??globalThis.ShenluStageAccess?.allOpen)===true||stages.every(claimed);d.append(element('p',ready?'台灣女妖入口已開放。':'擊敗阿澤與林予安後開放台灣女妖入口。'));}return;}const s=selected,h=hero(s),recipe=ShenluCampaignCatalog.heroes[s.enemy].recipe;
  const entries=rewards?Object.entries(s.rewards.first.cards):['main','extra'].flatMap(zone=>Object.entries(recipe[zone].reduce((a,id)=>(a[id]=(a[id]||0)+1,a),{})).map(([id,n])=>[id,n,zone]));
  const d=modal(h.name+(rewards?'・首勝獎勵':'・對手牌組'));
  d.append(element('p',rewards?(claimed(s)?'首勝獎勵已領取；再次挑戰不重複發放。':'首勝可取得以下卡片，依既有配方張數發放。'):`主牌組 ${recipe.main.length} 張／額外牌組 ${recipe.extra.length} 張`));
  const list=element('div',null,'world-card-list'),nav=element('nav');d.append(list,nav);let page=0;const total=Math.max(1,Math.ceil(entries.length/8));
  function render(){list.replaceChildren();for(const [id,n,zone]of entries.slice(page*8,page*8+8)){const card=TW09Data.cards[id],localizedName=globalThis.ShenluDemoI18n?.card(id)?.displayName||card.name;const row=button(localizedName+' × '+n+(zone==='extra'?'　額外':''),()=>{const detail=modal(localizedName);if(card.level)detail.append(element('p',`★${card.level}　攻擊 ${card.atk}／守備 ${card.def}`));detail.append(element('p',globalThis.ShenluDemoI18n?.card(id)?.effect||card.playerText||card.text||'沒有額外效果。','world-card-effect'));});row.dataset.card=id;list.append(row);}nav.replaceChildren();const prev=button('上一頁',()=>{page--;render();}),next=button('下一頁',()=>{page++;render();});prev.disabled=page===0;next.disabled=page===total-1;nav.append(prev,element('span',`${page+1}／${total}`),next);}render();
 }
 $('world-deck').onclick=()=>showList(false);$('world-reward').onclick=()=>showList(true);
 $('world-confirm').onclick=()=>{try{if(!profile?.heroChosen){location.href='../preview/character-selection.html';return;}store.setLastStage(selected.id);location.href='campaign/index.html?view=stage&stage='+encodeURIComponent(selected.id);}catch(e){modal('無法開始挑戰').append(element('p',e.message));}};
 if(['TW','EG','NO'].includes(country)){const progress=button('✧ 巡禮進度',()=>showList(true));progress.id='world-progress';app.querySelector('.world-header').append(progress);const enter=button('',()=>{location.href='expedition.html?country='+country;});enter.id='expedition-entry';enter.append(element('span',({TW:'台灣',CN:'中國',JP:'日本',KR:'韓國',TH:'泰國',IN:'印度',EG:'埃及',VA:'梵蒂岡',NO:'北歐'}[country])+'女妖挑戰'),element('small','首次通關可獲'+({TW:'台灣',CN:'中國',JP:'日本',KR:'韓國',TH:'泰國',IN:'印度',EG:'埃及',VA:'梵蒂岡',NO:'北歐'}[country])+'卡片'));enter.disabled=(globalThis.ShenluStageAccess?.expeditionAllOpen??globalThis.ShenluStageAccess?.allOpen)!==true&&!stages.every(claimed);if(enter.disabled)enter.title=country==='NO'?'擊敗艾納與英格麗後開放':country==='VA'?'擊敗馬泰奧與索菲亞後開放':country==='EG'?'擊敗卡里姆與莎爾瑪後開放':country==='CN'?'擊敗程硯舟與雲舒後開放':country==='IN'?'擊敗阿魯爾與米拉後開放':country==='TH'?'擊敗頌猜與瑪莉後開放':country==='KR'?'擊敗文河鈴與韓道允後開放':country==='JP'?'擊敗由紀子與月城朔後開放':'擊敗阿澤與林予安後開放';app.querySelector('.world-prize').replaceWith(enter);app.querySelector('.world-hint').remove();}
 function refreshLocale(){const display=text=>globalThis.ShenluDemoI18n?.display(text)||text;for(const b of app.querySelectorAll('.world-person')){const s=stages.find(s=>s.id===b.dataset.stage);if(s){const h=hero(s);b.setAttribute('aria-label',display(h.name)+'・'+display(h.label));}}const enter=$('expedition-entry');if(enter?.disabled&&globalThis.ShenluDemoRewards)enter.title=globalThis.ShenluDemoRewards.text('normalChallengeUnlock');}
 addEventListener('demo-language',refreshLocale);globalThis.ShenluDemoI18n?.ready.then(refreshLocale);
 fight();refreshLocale();
 app.classList.add("mobile-world-rebuilt");
})();
