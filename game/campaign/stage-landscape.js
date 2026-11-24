(function(root){'use strict';
const base=new URL('../portrait-duel/',document.currentScript.src);
function el(tag,text,parent,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;parent.append(n);return n;}
root.ShenluLandscapeChallenge={render(host,a){
 const {profile,s,node,btn,start,resume,result,collection,back,cancel}=a,run=profile.run;
 host.className='challenge-landscape';
 const top=el('header',null,host,'challenge-top');el('h1','出戰確認',top);el('span',s.name,top);
 const scene=el('div',null,host,'challenge-scene');const background=root.ShenluLandscapeStages.resolve({nether:s.nether,opponent:s.enemy});
 if(background)scene.style.backgroundImage=`linear-gradient(90deg,#07101b66,#07101b99,#07101b66),url("${background.background}")`;
 const versus=el('div','對決',scene,'challenge-versus');versus.setAttribute('aria-hidden','true');
 for(const [route,label]of [[profile.country,'我方'],[s.enemy,'對手']]){
  const hero=label==='對手'&&s.nether?root.ShenluUnderworldUI.hero(s.nether):root.ShenluHeroBindings[route],panel=el('section',null,scene,'challenge-hero');panel.setAttribute('aria-label',label);
  const image=el('img',null,panel);image.src=new URL(hero.portrait,base);image.alt=hero.name;image.onerror=()=>{image.hidden=true;};
  const crop=root.ShenluPortraitCrops?.crops?.[route];if(crop&&!(label==='對手'&&s.nether)){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),art=document.createElementNS(ns,'image'),b=crop.alphaBBox;svg.setAttribute('viewBox',[b[0],b[1],b[2]-b[0],b[3]-b[1]].join(' '));svg.setAttribute('preserveAspectRatio','xMidYMax meet');svg.setAttribute('aria-label',hero.name);Object.assign(svg.style,{width:'100%',height:'100%',display:'block'});art.setAttribute('href',image.src);art.setAttribute('width',crop.size[0]);art.setAttribute('height',crop.size[1]);svg.append(art);image.replaceWith(svg);}
  const copy=el('div',null,panel,'challenge-name');globalThis.ShenluDemoRewards.bindFormat(el('small','',copy),'heroCaption',{label,heroLabel:hero.label});el('h2',hero.name,copy);el('p','生命值 '+(label==='對手'&&s.nether?root.ShenluNether.byId[s.nether].lp:s.ruleSet?8000:6000),copy);
 }
 const info=el('div',null,host,'challenge-info');
 el('p','出戰牌組：'+profile.deckSlots[profile.activeDeckSlot].name+' · 主牌組 '+profile.activeRecipe.main.length+' 張／額外 '+profile.activeRecipe.extra.length+' 張',info);
 el('p',s.nether?root.ShenluNether.byId[s.nether].text:s.country==='DM'?'異世界可隨時挑戰，不發放卡片獎勵':profile.clearedStages.includes(s.id)?'已擊敗此主角，可再次挑戰':'擊敗該國男女主角後開放女妖入口；卡片由女妖關取得',info);
 if(s.ruleSet)el('p','異世界規則 · 先手不抽牌 · 可使用九國混搭牌組',info);
 if(run?.status==='active'){const name=(run.config.nether?root.ShenluUnderworldUI.hero(run.config.nether.queen):root.ShenluHeroBindings[run.config.enemy])?.name||'對手';if(run.state)el('p','尚有 '+name+' 的挑戰進行中',info,'challenge-pending');else{const pending=el('p',null,info,'challenge-pending');el('span',name,pending);pending.append(document.createTextNode(' · '));el('span','等待開戰',pending);}}
 /* DEMO_REWARD_GUIDANCE */ const ordinary=!s.nether&&['TW','EG','NO'].includes(s.country)&&!s.number;if(ordinary){const old=info.children[1];if(old)old.remove();globalThis.ShenluDemoRewards.paragraph(info,'normalChallengeUnlock');}
 const actions=el('footer',null,host,'challenge-actions');
 btn(s.nether?'返回幽冥世界':s.country==='DM'?'返回異世界':'返回九國',back,actions);
 const rewardInfo=btn(ordinary?globalThis.ShenluDemoRewards.text('viewUnlockButton'):'查看獎勵',()=>{if(ordinary){const d=el('dialog',null,document.body,'challenge-rewards');globalThis.ShenluDemoRewards.bind(el('h2','',d),'unlockProgressTitle');d.setAttribute('aria-label',globalThis.ShenluDemoRewards.text('unlockProgressTitle'));globalThis.ShenluDemoRewards.normal(d,s.country);btn('關閉',()=>d.close(),d);d.onclose=()=>d.remove();d.showModal();return;}const d=el('dialog',null,document.body,'challenge-rewards');d.setAttribute('aria-label','首勝獎勵');el('h2','首勝獎勵',d);const grid=el('div',null,d);for(const[id,count]of Object.entries(s.rewards.first.cards))el('p',root.TW09Data.cards[id].name+' × '+count,grid);el('p',s.nether?'每次勝利可得對應魔王物品1件（2次）；結算時仍滿3件則無新物品。':'相同首勝獎勵只發放一次。',d);btn('關閉',()=>d.close(),d);d.onclose=()=>d.remove();d.showModal();},actions);if(ordinary)globalThis.ShenluDemoRewards.bind(rewardInfo,'viewUnlockButton');
 btn('選擇牌組',a.chooseDeck,actions);btn('調整牌組',collection,actions);
 if(run?.status==='active'&&run.state===null)btn('取消本次挑戰',cancel,actions);
 const primary=btn(!profile.heroChosen?'先選擇主角':run?.status==='active'?'繼續目前挑戰':run?.status==='completed'?'查看上一場戰果':'確認出戰',!profile.heroChosen?()=>location.href='../../preview/character-selection.html':run?.status==='active'?resume:run?.status==='completed'?result:start,actions,'primary');
 if(!run||run.status==='claimed')primary.disabled=!a.unlocked;
}};
})(window);
