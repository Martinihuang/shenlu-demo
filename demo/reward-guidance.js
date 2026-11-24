// Display-only guidance. This module never grants cards or changes progression.
(()=>{'use strict';
const source={"countryUnlockShort":"擊敗雙主角 → 女妖取卡","countryUnlock":"擊敗{country}兩位主角，開放女妖挑戰，取得當地卡牌。","closedPreview":"本國僅供預覽，尚未開放挑戰。","normalChallengeUnlock":"普通挑戰不送卡；擊敗當地兩位主角，開放女妖取卡。","claimToHeroCollection":"擊敗女妖後，記得領獎。卡片會加入{hero}的收藏。","editDeckHint":"到「卡庫與牌組」，將領到的卡編入牌組。","unlockProgressTitle":"解鎖進度","viewUnlockButton":"查看解鎖","separateHeroCollections":"每位主角都有自己的基本牌組與收藏。","claimedToHero":"已加入{hero}的收藏。"};
const api=()=>globalThis.ShenluDemoI18n;
function text(key,values={}){const a=api(),copy=a?.t('rewardGuide.'+key,source[key])||source[key];return copy.replace(/\{(hero|country)\}/g,(_,name)=>name==='country'?(a?.country(values[name])||({TW:'台灣',EG:'埃及',NO:'北歐'}[values[name]])||''):(a?.display(values[name]||'目前主角')||values[name]||'目前主角'));}
function bind(element,key,values={}){element.dataset.rewardGuide=key;element.dataset.noLocalize='true';element._rewardGuideValues=values;element.textContent=text(key,values);return element;}
function paragraph(parent,key,values={}){const p=bind(document.createElement('p'),key,values);parent.append(p);return p;}
const display=s=>api()?.display(s)||s;
function cardName(id){return api()?.card(id)?.displayName||globalThis.TW09Data?.cards[id]?.name||display('卡片');}
const count=n=>Number.isInteger(n)&&n>=0?String(n):'0';
function format(key,v={}){if(key==='heroCaption')return display(v.label)+' · '+display(v.heroLabel);if(key==='poolCounts')return display('符合篩選 ')+count(v.matching)+display(' 種／未滿三張 ')+count(v.available)+display(' 種');const card=cardName(v.card),owned=' ('+display('持有')+' '+count(v.owned)+')';switch(key){
 case 'cardName':return card;
 case 'ownedCard':return card+owned;
 case 'cardCopies':return card+' ×'+count(v.count)+(v.owned===undefined?'':owned);
 case 'locked':return display(v.active?'本場獎勵已鎖定：':'本場待領獎：')+(v.card?card:display('無自選卡'));
 case 'selected':return display('本次預選：')+(v.card?card:display('尚無可選卡片'));
 case 'stageReward':return v.eighth?display('每次通關・自選卡片 ×1'):display('首通・')+card+' ×1'+(v.claimed?display('　已領取'):'');
 case 'firstReward':return display('首次獎勵：')+card+' ×1'+(v.claimed?display('（已領取；重打不重複發放）'):'');
 case 'ready':return display('出戰：')+v.deck+(v.eighth?'　｜'+display(v.locked?'本場鎖定：':'預選獎勵：')+(v.card?card:display(v.locked?'無自選卡':'尚無可選卡片')):'');
 default:throw Error('Unknown reward display format');}}
function bindFormat(element,key,values={}){element.dataset.rewardFormat=key;element.dataset.noLocalize='true';element._rewardFormatValues={...values};element.textContent=format(key,values);return element;}
function formatted(key,values={}){return bindFormat(document.createElement('span'),key,values);}
function effect(element,id){element.dataset.rewardEffect=id;element.dataset.noLocalize='true';element.textContent=api()?.card(id)?.effect||globalThis.TW09Data?.cards[id]?.playerText||globalThis.TW09Data?.cards[id]?.text||'';return element;}
function cardsLine(element){const snapshot=element._rewardCards;element.textContent=Object.entries(snapshot.cards).filter(([,n])=>n>0).map(([id,n])=>format('cardCopies',{card:id,count:n,owned:snapshot.collection[id]||0})).join(' · ');}
function refresh(){for(const e of document.querySelectorAll('[data-reward-guide]'))e.textContent=text(e.dataset.rewardGuide,e._rewardGuideValues);for(const e of document.querySelectorAll('[data-reward-cards]'))cardsLine(e);for(const e of document.querySelectorAll('[data-reward-format]'))e.textContent=format(e.dataset.rewardFormat,e._rewardFormatValues);for(const e of document.querySelectorAll('[data-reward-effect]'))effect(e,e.dataset.rewardEffect);}
function hero(profile){return globalThis.ShenluHeroBindings?.[profile.country]?.name||'目前主角';}
function normal(parent,country){paragraph(parent,'normalChallengeUnlock');paragraph(parent,'separateHeroCollections');}
function claimHint(parent,reward,profile,country){
 if(!['TW','EG','NO'].includes(country)||!Object.values(reward?.cards||{}).some(n=>n>0))return null;
 const list=parent.querySelector(':scope>span');
 if(list){list.dataset.rewardCards='true';list.dataset.noLocalize='true';list._rewardCards={cards:{...reward.cards},collection:{...profile.collection}};cardsLine(list);}
 const group=document.createElement('div');group.className='demo-reward-claim';paragraph(group,'claimedToHero',{hero:hero(profile)});
 const link=bind(document.createElement('a'),'editDeckHint');link.className='demo-reward-edit';link.href='campaign/index.html?view=collection&returnCountry='+country;group.append(link);parent.append(group);return group;
}
globalThis.ShenluDemoRewards={text,bind,paragraph,hero,normal,claimHint,display,cardName,format,bindFormat,formatted,effect};
addEventListener('demo-language',refresh);document.addEventListener('DOMContentLoaded',()=>api()?.ready?.then(refresh),{once:true});
})();
