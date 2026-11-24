(function(){'use strict';
const previews={"TW":{"name":"阿澤","label":"台灣乩童"},"TW-YUAN":{"name":"林予安","label":"台灣女乩童"},"JP-N-HERO":{"name":"月城朔","label":"日本陰陽師"},"JP":{"name":"由紀子","label":"日本巫女"},"CN":{"name":"程硯舟","label":"中國道士"},"YUN":{"name":"雲舒","label":"中國神女"},"KR-N-HERO":{"name":"韓道允","label":"韓國陰間使者"},"KR":{"name":"文河鈴","label":"韓國薩滿"},"EG-P-HERO":{"name":"卡里姆","label":"埃及法老"},"EG-HERO":{"name":"莎爾瑪","label":"埃及祭司"},"TH-LUANGPOR":{"name":"頌猜","label":"泰國龍婆"},"TH-AJARN":{"name":"瑪莉","label":"泰國阿贊"},"IN-ARUL":{"name":"阿魯爾","label":"印度上師"},"IN-MIRA":{"name":"米拉","label":"印度長老"},"VA-MATTEO":{"name":"馬泰奧","label":"梵蒂岡神父"},"VA-SOFIA":{"name":"索菲亞","label":"梵蒂岡修女"},"NO-EINAR":{"name":"艾納","label":"維京吟遊者"},"NO-INGRID":{"name":"英格麗","label":"維京女巫"}};const allowed=new Set(['TW','TW-YUAN','EG-P-HERO','EG-HERO','NO-EINAR','NO-INGRID']);const trigger=document.getElementById('changeHero');if(!trigger)return;
const rows=[['TW','TW-YUAN'],['CN','YUN'],['JP-N-HERO','JP'],['KR-N-HERO','KR'],['EG-P-HERO','EG-HERO'],['TH-LUANGPOR','TH-AJARN'],['IN-ARUL','IN-MIRA'],['VA-MATTEO','VA-SOFIA'],['NO-EINAR','NO-INGRID']];
const progressKeys={'VA-SOFIA':'sofiaStory','VA-MATTEO':'matteoStory','NO-INGRID':'ingridStory','NO-EINAR':'einarStory','EG-HERO':'salmaStory','EG-P-HERO':'karimStory','IN-MIRA':'miraStory','IN-ARUL':'arulStory','TH-AJARN':'mariStory','TH-LUANGPOR':'songchaiStory',TW:'story','TW-YUAN':'yuanStory',CN:'chengStory',YUN:'yunStory','JP-N-HERO':'tsukiStory',JP:'yukiStory',KR:'haryeongStory','KR-N-HERO':'doyunStory'};
function node(tag,text,parent){const n=document.createElement(tag);if(text)n.textContent=text;parent.append(n);return n;}
trigger.setAttribute('aria-haspopup','dialog');
trigger.onclick=function(event){event.preventDefault();
 const dialog=document.createElement('dialog');dialog.id='heroSwitchDialog';dialog.setAttribute('aria-labelledby','heroSwitchTitle');
 const head=node('div',null,dialog);head.className='hero-switch-head';node('h2','更換主角',head).id='heroSwitchTitle';
 const close=node('button','關閉',head);close.type='button';close.onclick=()=>dialog.close();
 const grid=node('div',null,dialog);grid.className='hero-switch-grid';
 const message=node('p','各主角有獨立收藏、牌組與進度；切換時保存目前旅程。',dialog);message.setAttribute('role','status');
 document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();trigger.focus();});
 try{
  const store=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog}),profile=store.load();
  const countries=['台灣','中國','日本','韓國','埃及','泰國','印度','梵蒂岡','北歐'];
  for(const [i,pair] of rows.entries()){
   const group=node('section',null,grid);group.className='hero-switch-country';group.setAttribute('aria-label',countries[i]);
   for(const route of pair){
   const hero=ShenluHeroBindings[route]||previews[route],key=progressKeys[route],current=profile.country===route;let own=current?profile:null;if(!own){try{own=JSON.parse(ShenluStorage.getItem('demo-v2:shenlu-campaign-v1-hero-'+route)||'null');}catch(_){}}
   const button=node('button',null,group);button.type='button';button.setAttribute('aria-pressed',String(current));
   node('strong',hero.label,button);const count=(own?.[key]?.completed||[]).filter(id=>/^L[1-8]$/.test(id)).length;
   node('small',hero.name+' · '+(current?'目前主角 · ':'')+(key?count+'/8章':'故事準備中'),button);
   button.disabled=!allowed.has(route);if(button.disabled)button.querySelector('small').textContent=hero.name+' · Demo 未開放';
   button.onclick=()=>{try{store.selectHero(route,{preserveDeck:true});location.href='story.html?view=chapters';}catch(error){message.textContent=error.message;}};
   }
  }
 }catch(error){message.textContent=error.message+'。請關閉後重新載入。';}
 dialog.showModal();
};
})();
