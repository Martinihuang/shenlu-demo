(async () => {'use strict';
await globalThis.ShenluBattleRecord?.ready;

const E=TW09Engine,D=TW09Data,S=PortraitSession.createSession(),$=id=>document.getElementById(id),stage=$('stage');
globalThis.ShenluBattleRecord?.attach(S);

const landscape=globalThis.ShenluLandscapeLayout;let focusSlots=[],nextFocus=0;
if(landscape)document.documentElement.classList.add('pc-battlefield');
const motion=PortraitMotion.createPlayer({stage,layer:$('fx'),reduced:()=>matchMedia('(prefers-reduced-motion: reduce)').matches});

let computerControl=false;
let victoryVideoGeneration=-1;

let generation=0,display=null,targeting=null,selected=null,autoTimer=null,practiceName='',suppressed=new Set(),paintRevision=0,seenDebuts=new Set(),seenCardDebuts=new Set(),queuedAttack=null;

const requestedLesson=new URLSearchParams(location.search).get('lesson');

const storyRoute=new URLSearchParams(location.search).get('story');

const storyMode=['tw-az','tw-yuan','cn-cheng','cn-yun','jp-tsuki','jp-yuki','kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute);

const storyData=storyRoute==='va-meeting'?{chapters:[globalThis.ShenluVAMeetingStoryData.chapter('va-meeting')]}:storyRoute==='va-sofia'?globalThis.ShenluSofiaStoryData:storyRoute==='va-matteo'?globalThis.ShenluMatteoStoryData:storyRoute==='no-meeting'?{chapters:[globalThis.ShenluNOMeetingStoryData.chapter('no-meeting')]}:storyRoute==='no-ingrid'?globalThis.ShenluIngridStoryData:storyRoute==='no-einar'?globalThis.ShenluEinarStoryData:storyRoute==='eg-meeting'?{chapters:[globalThis.ShenluEGMeetingStoryData.chapter('eg-meeting')]}:storyRoute==='eg-salma'?globalThis.ShenluSalmaStoryData:storyRoute==='eg-karim'?globalThis.ShenluKarimStoryData:storyRoute==='in-meeting'?{chapters:[globalThis.ShenluINMeetingStoryData.chapter('in-meeting')]}:storyRoute==='in-mira'?globalThis.ShenluMiraStoryData:storyRoute==='in-arul'?globalThis.ShenluArulStoryData:storyRoute==='th-meeting'?{chapters:[globalThis.ShenluTHMeetingStoryData.chapter('th-meeting')]}:storyRoute==='th-mari'?globalThis.ShenluMariStoryData:storyRoute==='th-songchai'?globalThis.ShenluSongchaiStoryData:storyRoute==='kr-meeting'?{chapters:[globalThis.ShenluKRMeetingStoryData.chapter('kr-meeting')]}:storyRoute==='kr-doyun'?globalThis.ShenluDoyunStoryData:storyRoute==='kr-haryeong'?globalThis.ShenluHaryeongStoryData:storyRoute==='jp-yuki'?globalThis.ShenluYukiStoryData:storyRoute==='jp-tsuki'?globalThis.ShenluTsukiStoryData:storyRoute==='cn-yun'?globalThis.ShenluYunStoryData:storyRoute==='cn-cheng'?globalThis.ShenluChengStoryData:storyRoute==='tw-yuan'?globalThis.ShenluYuanStoryData:globalThis.ShenluStoryData;

const storyChapterByLesson=['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute)?Object.fromEntries(storyData.chapters.map(c=>[c.lesson,c.id])):['jp-tsuki','jp-yuki'].includes(storyRoute)?{...Object.fromEntries(storyData.chapters.filter(c=>c.lesson).map(c=>[c.lesson,c.id])),[storyRoute==='jp-yuki'?'jp-meet-yuki':'jp-meet-tsuki']:'L9'}:['cn-cheng','cn-yun'].includes(storyRoute)?{...Object.fromEntries(storyData.chapters.filter(c=>c.lesson).map(c=>[c.lesson,c.id])),[storyRoute==='cn-yun'?'cn-meet-yun':'cn-meet-cheng']:'L9'}:storyRoute==='tw-yuan'?{'tw-meet-yuan':'L9','tw-yuan-omen':'L2','tw-yuan-nightcry':'L3','tw-yuan-pincer':'L4','tw-yuan-review':'B1','tw-yuan-training':'L6','tw-yuan-rescue':'L7','tw-yuan-final':'L8'}:{'tw-meet-az':'L9','tw-az-clear':'L2','tw-az-seal':'L3','tw-az-timing':'L4','tw-az-reclaim':'B1','tw-az-combo':'L5','tw-az-mazu':'L6','tw-az-koxinga':'L7','tw-az-final':'L8'};

let storyRun=null;

const campaignMode=!storyMode&&!requestedLesson&&new URLSearchParams(location.search).get('campaign')==='1';

let campaignStore=null,campaignRun=null,campaignSaveError=null,itemStore=null,itemSnapshot=null;
function attachOwnedItems(){if(S.state.nether)return;if(!campaignStore&&!itemStore){itemStore=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});itemStore.load();}const owner=campaignStore||itemStore;ShenluNether.attachItems(S.state,ShenluUnderworldLedger.items(owner.getProfile()));itemSnapshot=JSON.stringify(S.state.nether?.items||[]);}
function saveLooseItems(){if(!itemStore||!S.state?.nether)return true;const next=JSON.stringify(S.state.nether.items);if(next===itemSnapshot)return true;try{itemStore.checkpointItems(S.serialize());itemSnapshot=next;campaignSaveError=null;document.getElementById('saveFailure')?.remove();return true;}catch(error){campaignSaveError=error;clearTimeout(autoTimer);showSaveFailure(error);return false;}}

let otherworld=new URLSearchParams(location.search).get('world')==='DM';

if(otherworld){stage.classList.add('otherworld');const bg=stage.querySelector('.background');bg.src='../arenas/DM-portrait-v1.lossless.webp?sizev=20261005';bg.alt='異世界階梯競技場';}

const choiceText=PortraitChoiceText.create(E,D);

const chinese=(text,actor=null)=>{let value=String(text??'').replace(/表側/g,'正面').replace(/裏側|裡側/g,'背面').replace(/反轉召喚/g,'翻面召喚').replace(/投降/g,'認輸');if(storyMode&&S.state&&(storyRun?.chapterId!=='L9'||['cn-cheng','cn-yun','jp-tsuki','jp-yuki','kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute))){const enemyName=D.routeNames[S.state.config.enemy]||'程硯舟';if(enemyName===D.routeNames[S.state.config.country]){if(actor===0||actor===1)value=value.replaceAll(enemyName,actor===0?'我方':'敵方');}else value=value.replaceAll(enemyName,'敵方');}return value;};

const phaseNames={draw:'抽牌',standby:'準備',main:'主要階段',battle:'戰鬥階段',main2:'主要二',end:'結束',result:'勝負已定'};

const placements=landscape?landscape.enemy:[{x:182,y:535,w:268,h:280},{x:432,y:535,w:268,h:280},{x:699,y:535,w:268,h:280},{x:225,y:408,w:220,h:195},{x:635,y:412,w:220,h:193}];

const key=p=>`${p.side}:${p.slot}:${p.id}`;

function el(tag,text,parent,cls){const n=document.createElement(tag);if(text!==null)n.textContent=chinese(text);if(cls)n.className=cls;if(parent)parent.append(n);return n}

function art(c,side,field=false){if(c?.uwPhantom?.source&&c.uwPhantom.source!=='UW-PHANTOM')return art({...c,id:c.uwPhantom.source,uwPhantom:null},side,field);if(!c||!c.id||c.hidden&&(side===1||field))return '../duel-intro/cardback.lossless.webp';const a=PortraitArt[c.id]||{};if(field)return PortraitStance.fieldArt(c,side,PortraitArt,!!S.state.expedition||storyMode);return (a.card||a.front)||'../duel-intro/cardback.lossless.webp'}

function name(c,side=0){return !c||!c.id||c.hidden&&side===1?'未公開卡片':D.cards[c.id]?.name||'靈體'}

function image(c,side,parent,field=false){const im=el('img',null,parent);im.src=art(c,side,field);im.alt=field?(c.hidden?'蓋牌靈體':name(c,side)+'，'+PortraitStance.label(c)):name(c,side);if(field&&c.hidden)im.classList.add('set-spirit');if(field)im.dataset.spirit='1';if(c?.uwPhantom){im.classList.add('uw-phantom');im.style.opacity='.65';im.style.filter='hue-rotate(35deg) drop-shadow(0 0 18px #c7eaff)';}if(field&&!c.hidden&&['nearUnits','enemyUnits'].includes(parent.parentElement?.id))globalThis.PortraitSpiritFraming?.apply(im);if(!field&&parent.classList.contains('card-art')&&D.cards[c?.id]?.level&&globalThis.PortraitSpiritFraming?.hasTransparency(im.src)){const country=D.cards[c.id].country,bg=country?.startsWith('DM-')?'../arenas/DM-portrait-v1.lossless.webp?sizev=20261005':Object.values(globalThis.ShenluHeroBindings||{}).find(h=>h.arena.includes('/'+country+'-portrait.webp'))?.arena;if(bg){parent.style.backgroundImage=`linear-gradient(#10182244,#10182266),url("${bg}")`;parent.style.backgroundSize='cover';parent.style.backgroundPosition='50% 40%';}}return im}

function note(text,actor=null){$('notice').textContent=(practiceName?'演出練習｜':'')+chinese(text,actor)}

function fit(){motion.cancel();const w=landscape?.width||1920,vw=visualViewport?.width||innerWidth,vh=visualViewport?.height||innerHeight,h=landscape?landscape.height:1080,scale=Math.min(vw/w,vh/h),host=document.querySelector('.viewport');stage.style.height=h+'px';stage.style.setProperty('--duel-bottom-shift',h-(landscape?.height||1080)+'px');const lowerEdge=Math.max(h,...[$('view'),$('primary'),$('end')].map(el=>el.offsetTop+el.offsetHeight));stage.style.setProperty('--pc-lower-shift',((vh-h*scale)/2-4)/scale-(lowerEdge-h)+'px');document.documentElement.style.setProperty('--scene-width',w*scale+'px');document.documentElement.style.setProperty('--scene-height',h*scale+'px');host.style.width=w*scale+'px';host.style.height=h*scale+'px';stage.style.transform=`scale(${scale})`;fitSummonPanel();layoutPCBattlefield()}

// The PC stage uses the mobile aspect ratio and the same three-front/two-rear formation.
function layoutPCBattlefield(){
 if(!landscape)return;
 const panel=$('mobileActions'),expanded=panel?.classList.contains('choosing-summon'),right=expanded?1236-20:1900,factor=expanded?(right-350)/1340:1,center=expanded?(350+right)/2:960;
 const place=(node,p,value)=>{Object.assign(node.style,{left:p.x+'px',top:p.y+'px',width:p.w+'px',height:p.h+'px'});node.style.setProperty('--field-slot-top',p.y+'px');node.style.setProperty('--field-slot-width',p.w+'px');node.style.setProperty('--field-slot-height',p.h+'px');node.dataset.pcBounds=node.dataset.side==='0'?'close':'full';for(const image of node.querySelectorAll(':scope>img[data-spirit]'))globalThis.PortraitSpiritFraming?.apply(image);const badge=$('values').querySelector('[data-side="'+node.dataset.side+'"][data-slot="'+node.dataset.slot+'"]');if(badge)Object.assign(badge.style,{left:value.x+'px',top:value.y+'px',width:value.w+'px'});};
 const ownFloor=Math.max(886,...[$('view'),$('primary'),$('end')].map(el=>el.offsetTop+el.offsetHeight));
 [...$('nearUnits').querySelectorAll(':scope>.cardUnit')].forEach((node,i)=>{const cx=i?(expanded?right-160:1670):255,hidden=node.classList.contains('hidden'),h=hidden?160:604,frame=globalThis.PortraitSpiritFraming?.get(node.querySelector(':scope>img[data-spirit]')?.src),box=frame?.bbox,w=!hidden&&box?Math.min(expanded&&i?365:500,Math.max(365,8+(h-4)*(box[2]-box[0])/(box[3]-box[1]))):365;place(node,{x:cx-w/2,y:(hidden?550:ownFloor+4)-h,w,h},{x:i?(expanded?right-55:1830):90,y:expanded?490:390,w:110});});
 for(const node of $('enemyUnits').querySelectorAll(':scope>.cardUnit')){const slot=+node.dataset.slot,p=landscape.enemy[slot],w=p.w*factor,h=p.h*factor,x=center+(p.x-960)*factor-w/2,y=65+(p.y-65)*factor;node.style.zIndex=slot<3?'2':'1';place(node,{x,y,w,h},{x:x+w/2,y:y+h+6,w:Math.min(220,w)});}
 const background=stage.querySelector('[data-landscape-scenery] .stage-backdrop')||stage.querySelector('.background');if(background)document.body.style.backgroundImage='url('+JSON.stringify(background.src)+')';
}

function isTarget(c){return targeting&&c?.uid&&S.options().some(a=>a.kind==='attack'&&a.uid===targeting&&a.target===c.uid)}

function clickCard(c,side,zone,slot){if(computerControl||S.locked||!S.entered)return;if(targeting&&side===1&&zone==='slots'){const a=S.options().find(a=>a.kind==='attack'&&a.uid===targeting&&a.target===c?.uid);if(a){prepareAttack(a);return}}selected=c?.uid||null;if(landscape)for(const card of $('hand').querySelectorAll('.card'))card.classList.toggle('selected',card.dataset.uid===selected);if(side===0&&zone==='hand')mobileSelection(c);else inspect(c,side,zone,slot)}

function liveCard(side,zone,slot){return S.snapshot()?.players[side][zone]?.[slot]}

function unit(c,side,slot,place,parent){const b=el('button',null,parent,'unit cardUnit'+(c.hidden?' hidden':'')+(isTarget(c)?' targetable':''));Object.assign(b.style,{left:place.x+'px',top:place.y+'px',width:place.w+'px',height:place.h+'px'});b.style.setProperty('--field-slot-top',place.y+'px');b.style.setProperty('--field-slot-width',place.w+'px');b.style.setProperty('--field-slot-height',place.h+'px');b.dataset.side=side;b.dataset.slot=slot;if(place.artHeight)b.dataset.artHeight=place.artHeight;image(c,side,b,true);if(otherworld||(side===1&&(S.state.expedition||storyMode))){if(side===1&&(S.state.expedition||storyMode))b.classList.add("front-defense-marker");PortraitStance.apply(b,c);}b.onclick=()=>clickCard(liveCard(side,'slots',slot),side,'slots',slot);b.disabled=S.locked;b.setAttribute('aria-label',(side?'敵方':'我方')+'第'+(slot+1)+'格 '+(c.hidden?'蓋牌靈體':name(c,side)+'，'+PortraitStance.label(c)));if(suppressed.has(key({side,slot,id:c.id})))b.style.visibility='hidden';return b}

function drawValues(c,side,slot,x,y,cls){if(c.hidden)return;const n=el('button',null,$('values'),cls+(isTarget(c)?' targetable':''));n.dataset.position=c.mode==='def'?'def':'atk';n.dataset.side=side;n.dataset.slot=slot;if(side===1&&S.state.expedition){el('small',name(c,side),n,'enemy-unit-name');el('small',PortraitStance.label(c),n,'enemy-unit-stance');}el('span',String(c.mode==='def'?c.publicDEF:c.publicATK),n,'stance-value');n.style.left=x+'px';n.style.top=y+'px';n.disabled=S.locked;n.setAttribute('aria-label',(side?'敵方':'我方')+'第'+(slot+1)+'格 '+PortraitStance.label(c)+' '+String(c.mode==='def'?c.publicDEF:c.publicATK));n.onclick=()=>clickCard(liveCard(side,'slots',slot),side,'slots',slot)}

function render(frame=S.snapshot()){if(S.state?.nether?.queen)globalThis.ShenluUnderworldUI.status(S.state,stage);if(S.state?.expedition)updateExpeditionStatus();

 if(!frame)return;display=frame;paintRevision++;if(landscape)ShenluLandscapeStages.apply(stage,{nether:S.state.nether,story:storyRoute,lesson:requestedLesson,chapter:storyRun?.chapterId,country:S.state.config.country,expedition:S.state.expedition,opponent:otherworld?'DM':S.state.config.enemy});for(const id of ['enemyUnits','nearUnits','values','roster','hand','back0','back1'])$(id).replaceChildren();

 const enemyPlaces=landscape&&S.state.expedition?landscape.expeditionEnemy(S.state.expedition):storyMode&&!landscape?ShenluStoryLayout.enemy(frame.players[1].slots,placements):placements;

 frame.players[1].slots.forEach((c,i)=>{if(!c)return;const p=enemyPlaces[i];unit(c,1,i,p,$('enemyUnits'));drawValues(c,1,i,p.x,landscape||p!==placements[i]||i<3?p.y+p.h+5:p.y-39,'enemybadge')});

 const allies=landscape?landscape.allies(frame.players[0].slots,focusSlots):storyMode?ShenluStoryLayout.allies(frame.players[0].slots):{front:[0,1],roster:[2,3,4]};if(landscape)focusSlots=allies.front.slice();

 allies.front.forEach((slot,index)=>{const c=frame.players[0].slots[slot];if(!c)return;unit(c,0,slot,landscape?landscape.near[index]:{x:index?622:210,y:855,w:730,h:880},$('nearUnits'));drawValues(c,0,slot,landscape?(index?1830:90):index?803:46,landscape?457:1010,'ally-number')});

 for(const i of allies.roster){const c=frame.players[0].slots[i],row=el('button',null,$('roster'),'roster-row');row.dataset.side=0;row.dataset.slot=i;row.disabled=S.locked;

  if(c){const holder=otherworld?el('span',null,row,'roster-face-wrap'):row;const im=image(c,0,holder,true);if(otherworld)PortraitStance.apply(holder,c);im.classList.add('roster-face');const info=el('div',null,row,'roster-info');el('span',c.hidden?'蓋牌':name(c),info);el('div',c.hidden?'？':PortraitStance.label(c)+' '+String(c.mode==='def'?c.publicDEF:c.publicATK),info);row.onclick=()=>{if(landscape){focusSlots[nextFocus]=i;nextFocus=1-nextFocus;render();}clickCard(liveCard(0,'slots',i),0,'slots',i)}}else el('span','空格 '+(i+1),row,'empty-roster')}

 for(let side=0;side<2;side++){const p=frame.players[side];$('lp'+side).textContent=p.lp;

  if(landscape){
   if(side===1){let count=$('enemyHandCount');if(!count){count=el('div',null,stage,'enemy-hand-count');count.id='enemyHandCount';count.setAttribute('role','status');}count.textContent='敵方手牌：'+p.hand.length+' 張';}
   let fieldBox=$('field'+side);if(!fieldBox){fieldBox=el('button',null,stage,'field-display');fieldBox.id='field'+side;fieldBox.type='button';}
   fieldBox.replaceChildren();const card=p.field,label=side?'敵方場地':'我方場地';
   fieldBox.hidden=!card;
   if(card&&!card.hidden)image(card,side,fieldBox);
   fieldBox.title=label+'：'+(card?name(card,side):'')+(card&&(card.negated||card.noEffectsUntil>=frame.turn)?'（效果無效）':'')+' · 點選查看效果';
   fieldBox.disabled=S.locked;fieldBox.setAttribute('aria-label',label+'：'+(card?name(card,side)+'，查看效果':'無場地'));
   fieldBox.onclick=card?()=>{const live=S.state.players[side].field;if(live?.uid===card.uid)inspect(live,side,'field',0);}:()=>el('p','目前沒有場地卡。',dialog(label));
   let graveBox=$('grave'+side);if(!graveBox){graveBox=el('button',null,stage,'discard-display');graveBox.id='grave'+side;graveBox.type='button';}
   graveBox.replaceChildren();el('span','棄牌區',graveBox,'discard-label');el('b',String(p.grave.length),graveBox,'discard-count');
   graveBox.title=(side?'敵方':'我方')+'棄牌區：'+p.grave.length+' 張 · 點選查詢';graveBox.setAttribute('aria-label',graveBox.title);graveBox.disabled=S.locked;
   graveBox.hidden=p.grave.length===0;graveBox.onclick=()=>showDiscard(side);

  }

  let ambush=$('ambush'+side);if(!ambush){ambush=el('button',null,stage,'mobile-ambush');ambush.id='ambush'+side;ambush.setAttribute('aria-label',(side?'敵方':'我方')+'伏兵區');const icon=el('img',null,ambush);icon.src='../duel-intro/cardback.lossless.webp';icon.alt='伏兵區';}ambush.hidden=!p.back.some(Boolean);const pile=$('back'+side);ambush.onclick=pile.onclick=()=>{const body=dialog((side?'敵方':'我方')+'伏兵區');const cards=S.snapshot().players[side].back;if(!cards.some(Boolean)){el('p','目前沒有伏兵。',body);return;}cards.forEach((c,i)=>{if(c)el('button',name(c,side),body).onclick=()=>inspect(liveCard(side,'back',i),side,'back',i);});};
  p.back.forEach((c,i)=>{const b=el('button',null,$('back'+side),c?'':'empty');b.setAttribute('aria-label',(side?'敵方':'我方')+'伏兵格'+(i+1)+(c?'':' 空'));b.disabled=!c||S.locked;if(c){image(c.hidden?{hidden:true}:c,side,b);b.onclick=()=>{}}});

 }

 const hand=frame.players[0].hand;if(!hand.length)el('div','手牌 0 張',$('hand'),'nohand');hand.forEach((c,i)=>{const b=el('button',null,$('hand'),'card');b.disabled=computerControl||S.locked;b.dataset.uid=c.uid;b.classList.toggle('selected',selected===c.uid);b.setAttribute('aria-label','手牌 '+name(c));const n=hand.length,step=n>1?Math.min(154,650/(n-1)):0,t=i-(n-1)/2;const fan=landscape?.hand(i,n);b.style.left=(fan?fan.left:426.5+t*step-75)+'px';b.style.top=(fan?fan.top:12+Math.pow(n>1?t/((n-1)/2):0,2)*15)+'px';b.style.setProperty('--fan-angle',(fan?fan.angle:n>1?t/((n-1)/2)*5:0)+'deg');b.style.zIndex=i+1;const inner=el('div',null,b,'card-inner'),d=D.cards[c.id],type=d?.level?'spirit':d?.subtype.includes('trap')?'trap':'spell';b.dataset.kind=type;b.setAttribute('aria-label','手牌 '+name(c)+' · '+({spirit:'靈體',trap:'伏兵',spell:'行法'}[type]));if(d?.level){const stars=el('div','★'.repeat(d.level),inner,'card-stars');stars.setAttribute('aria-label',d.level+'星')}image(c,0,el('div',null,inner,'card-art'));el('div',name(c),inner,'card-name');el('div',d?.level?(document.documentElement.classList.contains("shenlu-mobile")?`攻${d.atk}/防${d.def}`:`${d.atk} / ${d.def}`):'點選查看卡文',inner,'card-stats');b.onclick=()=>clickCard(liveCard(0,'hand',i),0,'hand',i)});

 $('phaseText').textContent='第 '+frame.turn+' 回合 · '+(phaseNames[frame.phase]||frame.phase);

 const opts=S.options(),pending=S.state?.pending||S.state?.window;$('primaryText').textContent=pending&&S.actor()===0?'回應':frame.phase==='draw'?(S.state?.config.ruleSet==='ocg-dm'&&frame.turn===1?'開始回合':'抽牌'):frame.phase==='standby'?'主要階段':frame.phase==='battle'?'攻擊':document.documentElement.classList.contains('shenlu-mobile')&&opts.some(a=>a.kind==='battle')?'戰鬥':selected?'行動':opts.some(a=>a.kind==='battle')?'戰鬥':'行動';

 for(const id of ['primary','end','phase'])$(id).disabled=computerControl||S.locked||!S.entered||S.finished||S.actor()!==0;

 $('end').disabled=$('end').disabled||!opts.some(a=>a.kind==='end');$('view').disabled=computerControl||S.locked||!S.entered;$('menu').disabled=false;

 if(!S.locked){note(S.lesson&&S.lesson.status!=='active'?S.lesson.reason:frame.winner!==null?frame.winner===2?'雙方和局':frame.winner===0?'我方勝利':'敵方勝利':targeting?'請點選敵方靈體或數值；查看可取消':`${frame.side===0?'我方':'敵方'} · ${S.actor()===0?(computerControl?'電腦代為操作':'請操作'):'敵方行動中'}`)}

 const lesson=S.lesson;$('lessonGoal').hidden=!lesson;if(lesson){$('lessonGoal').textContent=storyMode?'冒險目標':'殘局目標';$('lessonGoal').onclick=()=>showLessonGoal();}$('editDeck').hidden=frame.winner!==0||!!S.lesson;updateResult(frame);mobileSelection(frame.players[0].hand.find(c=>c.uid===selected));layoutPCBattlefield();globalThis.PortraitBoot.reveal(stage,drive);

}

function pendingExpeditionReward(run=campaignRun){return !!(run?.rewardChoice?.version===1&&run.status==='completed'&&run.outcome==='win'&&run.rewardChoice.selected===null);}
function expeditionRewardCopy(key,fallback){return globalThis.ShenluDemoI18n?.t('expReward.'+key,fallback)||fallback;}
function updateResult(frame){const lesson=S.lesson,winner=lesson?.status==='passed'?0:lesson?.status==='failed'?1:frame.winner,finished=(winner!==null)&&!S.locked,box=$('result');box.hidden=!finished;stage.classList.toggle('defeated',finished&&winner!==0);if(!finished)return;const reason=chinese(lesson?.status!=='active'&&lesson?lesson.reason:S.state.log.at(-1)?.text||'');box.className=winner===0?'result victory':'result loss';$('resultTitle').textContent=winner===0?'本場通關':winner===2?'本場和局':reason.includes('認輸')?'已認輸':'挑戰失敗';$('resultReason').textContent=reason;$('resultDetail').textContent=`第 ${frame.turn} 回合 · 我方 ${frame.players[0].lp} / 敵方 ${frame.players[1].lp}\n${practiceName?'演出練習完成':'本機測試對局'}，未計入旅程進度。`;if(lesson){$('resultTitle').textContent=lesson.status==='passed'?'殘局通關':'殘局未完成';$('resultDetail').textContent=chinese(lesson.title||lesson.goal);$('retry').textContent='重新練習';$('resultHome').textContent=lessonReturnChapter?'返回故事章節':'返回九國教學';}if(storyMode){saveCampaign();$('editDeck').hidden=true;$('resultTitle').textContent=lesson?.status==='passed'?'篇章通關':'尚未達成目標';$('retry').textContent=lesson?.status==='passed'?'繼續故事':['eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(storyRoute)?'重新挑戰':'換牌組再挑戰';$('resultHome').textContent='返回章節';$('resultDetail').textContent=campaignSaveError?'結果尚未儲存，請重試存檔。':'進度已儲存。'+(lesson?.status==='passed'?'回到故事查看後續與領取獎勵。':['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute)?'可返回章節複習提示，再次挑戰。':'可返回章節調整牌組，再次挑戰。');}if(campaignMode){saveCampaign();$('editDeck').hidden=true;const expedition=!!S.state.expedition,choicePending=pendingExpeditionReward(),hasReward=Object.keys(campaignRun?.reward?.cards||{}).length>0||choicePending;$('editDeck').hidden=!expedition||hasReward;$('editDeck').textContent='調整牌組';$('retry').textContent=expedition?(choicePending?expeditionRewardCopy('confirmVictory','確認勝利・選擇獎勵'):hasReward?'前往領取獎勵':'再挑戰本關'):'前往結算';$('resultHome').textContent=expedition?'返回八關':'返回旅程';$('resultDetail').textContent=campaignSaveError?'結果尚未儲存，請重試存檔。':expedition?(choicePending?expeditionRewardCopy('savedWin','勝利已儲存；確認後選擇一張獎勵卡。'):hasReward?'對戰結果已儲存；返回女妖關領取獎勵。':winner===0?'本關已通關；重打不重複發放首次獎勵。':'對戰結果已儲存；返回女妖關後可調整牌組，再次挑戰。'):'對戰結果已儲存；前往結算確認本場獎勵。';}}

function dialog(title){$('dialog').classList.remove('deck-mode');$('dialogTitle').textContent=chinese(title);$('dialogBody').classList.remove('goal-content');$('dialogBody').replaceChildren();if(!$('dialog').open)$('dialog').showModal();return $('dialogBody')}

function showLessonGoal(page=0){const lesson=S.lesson;if(!lesson)return;const storyPages=storyMode?ShenluStoryGoals.pages(storyRun.chapterId,lesson,storyRoute):[];const status=lesson.status==='active'?'挑戰進行中。':lesson.reason;const pages=storyPages.length?storyPages.map(p=>({...p,paragraphs:p.paragraphs.map(t=>t==='尚未進入對局。'?status:t)})):[{title:'這次要做什麼',paragraphs:[lesson.goal,lesson.status==='active'?'挑戰進行中。':lesson.reason]},{title:'起始局面',paragraphs:[lesson.setup]}];const current=pages[page],body=dialog((storyMode?'冒險目標':'殘局目標')+' · '+current.title);body.classList.add('goal-content');for(const text of current.paragraphs)el('p',text,body);const nav=el('div',null,body,'goal-pages');const previous=el('button','上一頁',nav);previous.disabled=page===0;previous.onclick=()=>showLessonGoal(page-1);el('span',(page+1)+' / '+pages.length,nav);const next=el('button','下一頁',nav);next.disabled=page===pages.length-1;next.onclick=()=>showLessonGoal(page+1);}

function actionButton(a,parent){const revision=S.revision,details=choiceText.describe(S.state,a),b=el('button',choiceText.label(S.state,a)+(details?'\n'+details:''),parent);if(details)b.title=details;b.classList.add('action-choice');b.onclick=()=>{if(revision!==S.revision){$('dialog').close();return}if(a.kind==='attack'){$('dialog').close();prepareAttack(a,true);return}if(a.kind==='summon'&&a.tributes?.length){if(parent.closest('#mobileActions')){const box=$('mobileActions');box.replaceChildren();box.classList.add('choosing-summon');fitSummonPanel();el('strong','確認祭品召喚',box);el('p',a.label+'\n確認後才解放祭品。',box);const choices=el('div',null,box,'mobile-choice-row');el('button','確認召喚',choices).onclick=()=>execute(a,0,revision);el('button','取消',choices).onclick=()=>{selected=null;mobileSelection(null);};return;}const body=dialog('確認祭品召喚');el('p',a.label+'\n確認後才解放祭品。',body);el('button','確認召喚',body).onclick=()=>{ $('dialog').close();execute(a,0,revision)};return}$('dialog').close();execute(a,0,revision)}}

function showDiscard(side){const cards=S.snapshot()?.players[side].grave||[],body=dialog((side?'敵方':'我方')+'棄牌區 · '+cards.length+' 張');
 if(!cards.length){el('p','棄牌區目前沒有卡片。',body);return;}
 el('p','點選卡片查看效果。'+(side===0?'符合條件的效果可在卡片詳情發動。':''),body);
 for(let i=cards.length-1;i>=0;i--){const card=cards[i];el('button',name(card,side),body).onclick=()=>{const live=S.state.players[side].grave.find(c=>c.uid===card.uid);if(live)inspect(live,side,'grave',i);else showDiscard(side);};}
}

function fitSummonPanel(){const box=$('mobileActions');if(!box?.classList.contains('choosing-summon'))return;const scale=stage.getBoundingClientRect().width/(landscape?.width||1920),portrait=document.querySelector('#enemyHUD .portrait'),hud=$('enemyHUD');const edge=Math.max(hud.getBoundingClientRect().bottom,portrait?.getBoundingClientRect().bottom||0);box.style.setProperty('--choice-top',Math.ceil((edge-stage.getBoundingClientRect().top)/scale+16)+'px');layoutPCBattlefield();}
function unavailableText(c,opts){const info=E.availability(S.state,0,c.uid);if(info.activationReasons?.length)return '無法發動：'+info.activationReasons.join('；');return !opts.length?(S.actor()!==0?'目前等待敵方行動。':info.reasons.join('；')||'目前沒有合法行動；請確認階段與本回合使用次數。'):'';}
function mobileSelection(c){let box=$('mobileActions');if(!box){box=el('section',null,stage,'panel');box.id='mobileActions';}box.classList.remove('choosing-summon');box.replaceChildren();if(!c){el('strong','選擇手牌',box);el('p','點選卡片，再選擇可用行動。',box);layoutPCBattlefield();return;}const d=D.cards[c.id];el('strong',name(c),box);el('small',d?.level?'靈體':d?.subtype?.includes('trap')?'伏兵':'行法',box);const detail=el('button','完整效果',box);detail.onclick=()=>inspect(c,0,'hand',S.snapshot().players[0].hand.findIndex(x=>x.uid===c.uid));const opts=S.options().filter(a=>a.uid===c.uid);if(opts.some(a=>a.kind==='summon')){box.classList.add('choosing-summon');fitSummonPanel();}const actions=el('div',null,box,'mobile-choice-row');for(const a of opts){actionButton(a,actions);}const reason=unavailableText(c,opts);if(reason)el('p',reason,box);layoutPCBattlefield();}
function inspect(c,side,zone,slot){const body=dialog(name(c,side));if(!c)return;

 if(!c.id||c.hidden&&side===1){el('p','這張卡尚未公開。',body);return}

 const d=D.cards[c.id];const detailImage=image(c,side,body);detailImage.className='detailArt';ShenluSpiritDetail.apply(detailImage,c.id,new URL('./',location.href));const copy=globalThis.ShenluDemoI18n?.card(c.id),paragraph=el('p',null,body);if(d.level){const stats=document.createElement('span');stats.textContent=`${d.level}星　${d.atk} / ${d.def}\n`;paragraph.append(stats);}const effect=document.createElement('span');effect.textContent=copy?.effectLocalized?copy.effect:chinese(d.playerText||d.text||'');paragraph.append(effect);

 const showcase=el('button','卡牌展示',body);showcase.onclick=()=>ShenluCardShowcase.show(c.id,detailImage);if(globalThis.ShenluExpeditionGallery?.entrance(c.id)){const media=el('div',null,body,'card-showcase-actions');media.append(showcase);el('button','首登場展示',media).onclick=()=>ShenluExpeditionGallery.showEntrance(c.id,d.name,detailImage.src);}

 if(side!==0)return;const opts=S.options().filter(a=>a.uid===c.uid),attacks=opts.filter(a=>a.kind==='attack');

 if(attacks.length){el('button','攻擊 → 選擇目標',body).onclick=()=>{const direct=attacks.find(a=>a.target===null);$('dialog').close();if(direct)prepareAttack(direct);else{targeting=c.uid;render()}}}

 for(const a of opts.filter(a=>a.kind!=='attack'))actionButton(a,body);

 const reason=unavailableText(c,opts);if(reason)el('p',reason,body);

}

function clearAttack(){queuedAttack=null;$('attackRoute').setAttribute('hidden','');$('attackConfirm').hidden=true;}

function prepareAttack(action,costSelected=false){const revision=S.revision;if(action.dmTribute&&!costSelected){const options=S.options().filter(a=>a.kind==='attack'&&a.uid===action.uid&&a.target===action.target&&a.dmTribute);if(options.length>1){const body=dialog('選擇本次攻擊要解放的靈體');for(const a of options)actionButton(a,body);return;}}if(!S.options().some(a=>JSON.stringify(a)===JSON.stringify(action)))return;clearAttack();targeting=null;execute(action,0,revision);}

$('attackYes').onclick=()=>{const q=queuedAttack;clearAttack();if(q){targeting=null;execute(q.action,0,q.revision)}};$('attackNo').onclick=()=>{clearAttack();targeting=null;render();drive()};

function actions(){if(computerControl||S.locked||!S.entered)return;const opts=S.options();const body=dialog(S.state.pending?.side===0?S.state.pending.title:S.state.window?.side===0?'回應窗口':'合法行動');

 for(const side of [0,1]){const field=S.state.players[side].field;if(field){const b=el('button',(side?'敵方':'我方')+'場地：'+D.cards[field.id].name,body);b.append(document.createTextNode(' · '+(globalThis.ShenluDemoI18n?.t('battle.viewEffect','查看效果')||'查看效果')));b.onclick=()=>inspect(field,side,'field',0);}}

 const attackContext=choiceText.attackContext(S.state);if(attackContext)el('p',attackContext,body,'choice-context');
 const context=choiceText.prompt(S.state);if(context)el('p',context,body,'choice-context');

 if(targeting){el('button','取消選擇攻擊目標',body).onclick=()=>{targeting=null;$('dialog').close();render()}}

 if(S.state.nether)globalThis.ShenluUnderworldUI.items(S,body,{dialog,el,execute});if(!opts.length)el('p','請等待敵方行動或演出完成。',body);for(const a of opts.filter(a=>!a.args?.itemId))actionButton(a,body);

}

async function play(events,revision,gen){
 globalThis.ShenluBattleRecord?.capture('animation-start',{revision,eventCount:events.length});

 for(let i=0;i<events.length;i++){if(gen!==generation)return;const e=events[i],v=e.visual;

  const debuts=[];for(let side=0;side<2;side++)e.frame.players[side].slots.forEach((c,slot)=>{if(c?.id&&!c.hidden&&!seenDebuts.has(side+':'+c.id)){seenDebuts.add(side+':'+c.id);debuts.push({side,slot,id:c.id})}});

  if(debuts.length){render(e.frame);for(const part of debuts){const d=D.cards[part.id];note((d.level>=5?'高星靈體首登場：':'靈體首登場：')+d.name);$('skipFX').hidden=false;const video=globalThis.ShenluEntranceVideos?.boss(part.id);if(video&&part.id.startsWith('UW-Q-')){const seen=S.state.queenEntranceVideoIds||(S.state.queenEntranceVideoIds=[]);if(seen.includes(part.id))continue;seen.push(part.id);if(!saveCampaign()){S.settle(revision);return;}}await motion.summon(part,{level:d.level,name:d.name,video,src:PortraitArt[part.id]?.entrance||(d.level>=5?PortraitArt[part.id]?.premium:null)||PortraitArt[part.id]?.front||PortraitArt[part.id]?.card||'../duel-intro/cardback.lossless.webp'});if(gen!==generation)return}}

  if(v?.kind==='combat'){

   const pre=JSON.parse(JSON.stringify(e.frame));v.damage?.forEach((d,side)=>{pre.players[side].lp+=d});render(pre);note('靈體交鋒');$('skipFX').hidden=false;

   const dead=new Set();for(let j=i+1;j<events.length&&events[j].visual?.kind!=='combat';j++){const d=events[j].visual;if(d?.kind==='destroy'&&d.reason==='battle'&&[v.from.uid,v.target?.uid].includes(d.uid))dead.add(d.uid)}

   const attackVideo=globalThis.ShenluAttackVideos?.get(e.firstAttackVideoId);
   if(attackVideo){note(attackVideo.name+'首次攻擊');await motion.attackVideo(v.from,{name:attackVideo.name,video:attackVideo});if(gen!==generation)return;note('靈體交鋒');}

   await motion.combat(v,dead,()=>{if(gen===generation)for(let side=0;side<2;side++)$('lp'+side).textContent=e.frame.players[side].lp});

   if(gen!==generation)return;for(const p of [v.from,v.target])if(p&&dead.has(p.uid))suppressed.add(key(p));render(e.frame);

   }else if(v?.kind==='effect'){
   render(e.frame);const side=e.actor??v.side,who=side===1?'敵方':side===0?'我方':'',hint=$('effectHint');
   const text=v.stage==='activation'?who+'發動【'+D.cards[e.card].name+'】'+(e.text.includes('；')?'\n'+e.text.split('；').slice(1).join('；'):''):who+' '+chinese(e.text,side);
   const duration=text.length>36||text.split('\n').length>2?3000:2000;
   hint.textContent=text;hint.dataset.side=String(side);hint.hidden=false;$('skipFX').hidden=false;
   globalThis.ShenluBattleRecord?.capture('effect-notice',{eventNo:e.eventNo,side,stage:v.stage||'resolution',text,duration});
   const debut=PortraitMotion.cardDebut(e,D.cards,seenCardDebuts),src=debut&&PortraitArt[debut.id]?.card;
   if(debut&&src)await motion.cardReveal({...debut,src},duration);else await motion.wait(duration);if(gen!==generation)return;hint.hidden=true;
  }else if(v?.kind==='destroy'){

   if(!suppressed.has(key(v)))await motion.destroy(v);if(gen!==generation)return;render(e.frame);suppressed.delete(key(v));

  }else{render(e.frame);note(e.text.replace(/ 武/g,' ').replace(/ 防/g,' '),e.actor);if(e.card&&e.text.includes('發動')){ $('skipFX').hidden=false;await motion.wait(550)}}

 }

 if(gen!==generation)return;
 const heroVictoryVideo=globalThis.ShenluAttackVideos?.heroVictory(S.state,storyMode?S.lesson:null);
 if(heroVictoryVideo&&victoryVideoGeneration!==gen){
  victoryVideoGeneration=gen;note(heroVictoryVideo.name+'・勝利一擊');$('skipFX').hidden=false;
  try{const played=await motion.attackVideo({side:0},{name:heroVictoryVideo.name,video:heroVictoryVideo,fitStage:true});globalThis.ShenluBattleRecord?.capture('hero-victory-video',{id:heroVictoryVideo.id,played});}
  catch(error){globalThis.ShenluBattleRecord?.capture('hero-victory-video-error',{id:heroVictoryVideo.id,message:error.message});}
  if(gen!==generation)return;
 }
 if(gen!==generation)return;globalThis.ShenluBattleRecord?.capture('animation-complete',{revision});suppressed.clear();$('skipFX').hidden=true;S.settle(revision);render();drive();

}

function recoverAnimation(err,batch){if(batch.revision!==S.revision)return;const message=typeof err?.message==='string'?err.message:String(err);try{globalThis.ShenluBattleRecord?.capture('animation-error',{message,revision:batch.revision})}catch(_){}try{motion.cancel()}catch(error){try{globalThis.ShenluBattleRecord?.capture('animation-cancel-error',{message:String(error?.message??error),revision:batch.revision})}catch(_){}}finally{if(batch.revision===S.revision){S.settle(batch.revision);suppressed.clear();$('effectHint').hidden=true;$('skipFX').hidden=true;render();note('演出已中止，保留已結算狀態：'+message);drive()}}}
function execute(action,side=0,revision=S.revision){if(campaignSaveError||S.locked||S.finished)return;clearAttack();let batch;try{batch=S.commit(action,side,revision);globalThis.ShenluAttackVideos?.claim(S.state,batch.events);if(!saveCampaign()){S.settle(batch.revision);return;}targeting=null;selected=null;play(batch.events,batch.revision,generation).catch(err=>recoverAnimation(err,batch))}catch(err){if(batch)recoverAnimation(err,batch);else note(err.message)}}

function drive(){clearTimeout(autoTimer);if($('duelBoot')||campaignSaveError||!S.entered||S.locked||S.finished||$('dialog').open||queuedAttack||document.hidden)return;const gen=generation;

 const actor=S.actor(),opts=S.options(actor);if(actor===1||computerControl){autoTimer=setTimeout(()=>{if(!document.hidden&&!campaignSaveError&&gen===generation&&!S.locked&&!$('dialog').open){const a=S.ai();if(a)execute(a,actor)}},550)}

 else if(opts.length===1&&['pass','advance'].includes(opts[0].kind)){autoTimer=setTimeout(()=>{if(!document.hidden&&!campaignSaveError&&gen===generation&&!S.locked&&!$('dialog').open)execute(opts[0])},220)}

 else if(S.state.pending?.side===0||S.state.window?.side===0)actions();

}

function reset(){focusSlots=[];nextFocus=0;clearAttack();$('effectHint').hidden=true;generation++;clearTimeout(autoTimer);motion.cancel();$('dialog').close();$('fx').replaceChildren();targeting=null;selected=null;suppressed.clear();seenDebuts.clear();seenCardDebuts.clear();$('result').hidden=true;stage.classList.remove('defeated');$('skipFX').hidden=true;}

function begin(config){reset();practiceName='';const recipe=PortraitDeckDraft.validRecipe();S.begin({...config,...(recipe?{playerRecipe:recipe}:{})});if(!new URLSearchParams(location.search).has('practice'))attachOwnedItems();render();note('先後手已確定，等待串場完成。')}

const lessonReturnChapter=(()=>{const q=new URLSearchParams(location.search),id=q.get('chapter'),route=q.get('returnStory');if(storyMode||!['cn-cheng','cn-yun','jp-tsuki','jp-yuki','kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(route))return null;const c=id==='L9'?(['va-matteo','va-sofia','va-meeting'].includes(route)?globalThis.ShenluVAMeetingStoryData:['no-einar','no-ingrid','no-meeting'].includes(route)?globalThis.ShenluNOMeetingStoryData:['eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(route)?globalThis.ShenluEGMeetingStoryData:['in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(route)?globalThis.ShenluINMeetingStoryData:['th-songchai','th-mari','th-meeting'].includes(route)?globalThis.ShenluTHMeetingStoryData:['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(route)?globalThis.ShenluKRMeetingStoryData:['jp-tsuki','jp-yuki'].includes(route)?globalThis.ShenluJPMeetingStoryData:globalThis.ShenluCNMeetingStoryData)?.chapter(route):(route==='eg-salma'?globalThis.ShenluSalmaStoryData:route==='va-sofia'?globalThis.ShenluSofiaStoryData:route==='va-matteo'?globalThis.ShenluMatteoStoryData:route==='no-ingrid'?globalThis.ShenluIngridStoryData:route==='no-einar'?globalThis.ShenluEinarStoryData:route==='eg-karim'?globalThis.ShenluKarimStoryData:route==='in-mira'?globalThis.ShenluMiraStoryData:route==='in-arul'?globalThis.ShenluArulStoryData:route==='th-mari'?globalThis.ShenluMariStoryData:route==='th-songchai'?globalThis.ShenluSongchaiStoryData:route==='kr-doyun'?globalThis.ShenluDoyunStoryData:route==='kr-haryeong'?globalThis.ShenluHaryeongStoryData:route==='jp-yuki'?globalThis.ShenluYukiStoryData:route==='jp-tsuki'?globalThis.ShenluTsukiStoryData:route==='cn-yun'?globalThis.ShenluYunStoryData:globalThis.ShenluChengStoryData)?.chapters.find(c=>c.id===id);return c?.learning?.some(x=>x.id===requestedLesson)?id:null;})();

function lessonHome(){if(lessonReturnChapter)return '../story.html?chapter='+encodeURIComponent(lessonReturnChapter);if(storyMode)return '../story.html?chapter='+encodeURIComponent(storyRun?.chapterId||storyChapterByLesson[requestedLesson]||'L1')+(S.lesson?.status==='passed'?'&after=1':'');return new URL('../world-portrait.html?country='+encodeURIComponent(S.lesson?.region||'TW')+'&view=learn',location.href).href;}

function startLesson(id){if(storyMode){startStory();return;}reset();practiceName='';otherworld=false;stage.classList.remove('otherworld');try{S.beginLesson(id);attachOwnedItems();applyDuelHeroes(S.state.config.country,S.state.config.enemy);for(let side=0;side<2;side++)for(const c of S.snapshot().players[side].slots)if(c?.id&&!c.hidden)seenDebuts.add(side+':'+c.id);render();drive();}catch(error){const body=dialog('無法開啟殘局');el('p',globalThis.ShenluPlayerCopy.error(error,'duel'),body);el('button','返回九國',body).onclick=()=>location.href='../world-portrait.html';}}

function startPractice(kind){reset();practiceName=kind;PortraitSession.practice(S,kind);for(let side=0;side<2;side++)for(const c of S.snapshot().players[side].slots)if(c?.id&&!c.hidden)seenDebuts.add(side+':'+c.id);render();drive()}

function openDeckEditor(){if(campaignMode){if(S.state.expedition&&S.finished){if(saveCampaign())location.href='../expedition.html?country='+S.state.expedition.country+'&stage='+S.state.expedition.number+'&panel=deck';}else leaveCampaign();return;}const body=dialog('戰後牌組調整');$('dialog').classList.add('deck-mode');PortraitDeckDraft.mount(body,S.state,{close:()=>{$('dialog').close();$('dialog').classList.remove('deck-mode')},rematch:()=>{$('dialog').close();begin({seed:crypto.getRandomValues(new Uint32Array(1))[0],first:0,token:'edited'});S.enter('edited');render();drive()},opening:()=>{(parent!==window?parent:window).location.href=new URL('../duel-intro/index.html',location.href).href},home:()=>{(parent!==window?parent:window).location.href=new URL('../world-portrait.html',location.href).href}});}

function autoControl(body){if(S.finished)return;el('button',computerControl?'恢復手動操作':'電腦接手',body).onclick=()=>{computerControl=!computerControl;clearAttack();targeting=null;$('dialog').close();render();drive();};}

function menu(){if(storyMode){storyMenu();return;}if(campaignMode){campaignMenu();return;}const body=dialog('決鬥選單');autoControl(body);el('p',S.lesson?(S.lesson.title+'\n'+S.lesson.goal):(D.routeNames[S.state.config.country]+' 對 '+D.routeNames[S.state.config.enemy]),body);if(S.lesson?.id){let shown=0;const hints=el('button','查看提示',body);hints.onclick=()=>{const hint=S.lesson.hints[shown++];if(hint)el('p',hint,body);hints.disabled=shown>=S.lesson.hints.length;};el('button','重新練習本題',body).onclick=()=>{$('dialog').close();startLesson(S.lesson.id)};el('button',lessonReturnChapter?'返回故事章節':'返回九國教學',body).onclick=()=>location.href=lessonHome();}

 el('button','查看場地、棄牌區與戰鬥紀錄',body).onclick=()=>{const b=dialog('公開戰況');const v=S.snapshot();for(let side=0;side<2;side++){el('p',(side?'敵方':'我方')+'牌組 '+v.players[side].deck.length+' 張 · 手牌 '+v.players[side].hand.length+' 張\n場地：'+(v.players[side].field?name(v.players[side].field,side):'無'),b);const f=v.players[side].field;if(f)el('button',name(f,side),b).onclick=()=>inspect(f,side,'field',0);for(const z of ['grave','banished','extra']){el('small',({grave:'棄牌區',banished:'除外',extra:'額外'})[z],b);for(const c of v.players[side][z])el('button',name(c,side),b).onclick=()=>inspect(c,side,z,0)}}el('h3','最近戰況',b);for(const l of v.log.slice(-8))el('div',chinese(l.text,l.actor),b,'log');if(v.log.length>8)el('button','展開完整戰況',b).onclick=()=>{b.querySelectorAll('.log').forEach(n=>n.remove());for(const l of v.log)el('div',chinese(l.text,l.actor),b,'log');}};

 if(!S.finished)el('button','投降本場',body).onclick=()=>{const b=dialog('確認投降');el('p','結束目前這場決鬥。',b);const confirm=el('button','確認投降',b);confirm.disabled=S.locked;confirm.onclick=()=>{if(S.locked)return;$('dialog').close();clearTimeout(autoTimer);S.surrender();render()}};

 if(!S.lesson?.id)el('button','攻擊演出練習（離開本場）',body).onclick=()=>{const b=dialog('演出練習：取代本場，不計獎勵');for(const [id,label]of [['ally','我方出擊：往遠處縮小'],['enemy','敵方出擊：往近處放大'],['rear','攻擊敵方後排'],['roster','我方橫列靈體展開出擊'],['defense','攻擊守備靈體'],['direct','直接攻擊主角'],['summon','五星首登場與七張手牌'],['set','蓋放靈體與一般首登場'],['victory','勝利結算演出'],['lesson','直式殘局：本回合通關']])el('button',label,b).onclick=()=>startPractice(id)};

 if(!S.lesson?.id)el('button','回到串場（離開本場）',body).onclick=()=>{reset();if(parent!==window)parent.location.href='../duel-intro/index.html';else location.href='../duel-intro/index.html'};

}

 $('view').onclick=actions;$('phase').onclick=actions;$('primary').onclick=()=>{const opts=S.options(),quick=opts.find(a=>['draw','advance'].includes(a.kind));if(quick)execute(quick);else if(document.documentElement.classList.contains('shenlu-mobile')&&opts.some(a=>a.kind==='battle'))execute(opts.find(a=>a.kind==='battle'));else actions()};$('end').onclick=()=>{const a=S.options().find(a=>a.kind==='end');if(a){const b=dialog('結束回合');el('p','確認交由敵方行動？',b);actionButton(a,b)}};

 $('editDeck').onclick=()=>openDeckEditor();

 $('retry').onclick=()=>{if(storyMode){if(!saveCampaign())return;if(S.lesson?.status==='passed'){location.href=lessonHome();return;}try{campaignStore.storyRetry(storyRun.chapterId);location.href='../story.html?chapter='+encodeURIComponent(storyRun.chapterId)+'&restart=1';}catch(e){showSaveFailure(e);}return;}if(campaignMode){if(pendingExpeditionReward()){if(saveCampaign())location.href='../expedition.html?country='+(S.state.expedition.country||'TW')+'&stage=8&reward=1';}else leaveCampaign();return;}if(S.lesson){if(S.lesson.id)startLesson(S.lesson.id);else startPractice('lesson');return}const first=S.state.config.first??0;begin({seed:crypto.getRandomValues(new Uint32Array(1))[0],first,token:'retry'});S.enter('retry');render();drive()};$('resultHome').onclick=()=>{if(S.lesson?.id){if(storyMode&&!saveCampaign())return;location.href=lessonHome();return;}if(campaignMode){if(S.state.expedition){if(saveCampaign())location.href='../expedition.html?country='+S.state.expedition.country;}else leaveCampaign();return;}reset();(parent!==window?parent:window).location.href=new URL('../world-portrait.html',location.href).href};$('resultReview').onclick=menu;

 $('menu').onclick=()=>{menu();el('button','目前對戰紀錄',$('dialogBody')).onclick=()=>globalThis.ShenluBattleRecord.mount(dialog('目前對戰紀錄'));};$('closeDialog').onclick=()=>$('dialog').close();$('dialog').addEventListener('close',()=>{if(S.entered&&!computerControl&&S.actor()===0&&(S.state?.pending||S.state?.window))return;drive();});$('skipFX').onclick=()=>{globalThis.ShenluBattleRecord?.capture('animation-skipped');motion.cancel();};

 addEventListener('resize',fit);visualViewport?.addEventListener('resize',fit);if(landscape)addEventListener('load',fit,{once:true});document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;motion.cancel();clearTimeout(autoTimer);suppressed.clear();$('effectHint').hidden=true;$('skipFX').hidden=true;clearAttack();targeting=null;S.settle(S.revision);saveCampaign();}else{render();drive()}});addEventListener('pagehide',()=>saveCampaign());

 addEventListener('message',event=>{if(campaignMode||storyMode)return;if(event.source!==parent||event.origin!==location.origin)return;const m=event.data;if(!m||!['SHENLU_DUEL_INIT','SHENLU_DUEL_ENTER','SHENLU_DUEL_STOP','SHENLU_DUEL_PING'].includes(m.type))return;

  const origin=location.origin==='null'?'*':location.origin;

  try{if(m.type==='SHENLU_DUEL_PING'){parent.postMessage({type:'SHENLU_DUEL_READY'},origin);return}if(m.type==='SHENLU_DUEL_STOP'){reset();S.pause();return}if(m.type==='SHENLU_DUEL_INIT'){begin(m);parent.postMessage({type:'SHENLU_DUEL_INITIALIZED',token:m.token},origin)}else if(S.enter(m.token)){render();drive()}}catch(err){note(err.message);parent.postMessage({type:'SHENLU_DUEL_ERROR',message:err.message},origin)}

 });



function saveCampaign(){

 if(storyMode)return saveStory();

 if(!campaignMode||!campaignStore||!campaignRun||!S.state)return saveLooseItems();

 try{

  if(campaignRun.status==='active'){

   campaignRun=campaignStore.checkpoint(campaignRun.id,S.serialize());

   if(S.finished){const reason=chinese(S.state.log.at(-1)?.text||'');campaignRun=campaignStore.completeRun(campaignRun.id,S.state.winner===0?'win':S.state.winner===2?'draw':reason.includes('認輸')?'surrender':'loss');}

  }

  campaignSaveError=null;document.getElementById('saveFailure')?.remove();return true;

 }catch(error){campaignSaveError=error;clearTimeout(autoTimer);showSaveFailure(error);return false;}

}

function showSaveFailure(error){

 let box=document.getElementById('saveFailure');if(!box){box=el('section',null,document.body);box.id='saveFailure';box.setAttribute('role','alert');Object.assign(box.style,{position:'fixed',inset:'15% 5% auto',zIndex:10000,background:'#17202f',color:'white',padding:'24px',border:'2px solid #f2c779',borderRadius:'16px'});}

 box.replaceChildren();el('h2','進度尚未儲存',box);el('p',globalThis.ShenluPlayerCopy.error(error,'save')+'。已暫停對戰，避免繼續消耗未保存的進度。',box);

 if(error.code==='CONFLICT')el('button','重新載入已儲存進度',box).onclick=()=>location.reload();

 el('button','重試存檔',box).onclick=()=>{if(saveCampaign()){render();drive();}};

 el('button','匯出目前進度',box).onclick=()=>{const p=(campaignStore||itemStore).getProfile();if(storyMode&&p[storyRun?.chapterId==='L9'&&['jp-yuki','jp-tsuki'].includes(storyRoute)?'jpMeetingStory':storyRoute==='no-meeting'?'noMeetingStory':storyRoute==='va-meeting'?'vaMeetingStory':storyRoute==='eg-meeting'?'egMeetingStory':storyRoute==='in-meeting'?'inMeetingStory':storyRoute==='th-meeting'?'thMeetingStory':storyRoute==='kr-meeting'?'krMeetingStory':storyRoute==='eg-salma'?'salmaStory':storyRoute==='va-sofia'?'sofiaStory':storyRoute==='va-matteo'?'matteoStory':storyRoute==='no-ingrid'?'ingridStory':storyRoute==='no-einar'?'einarStory':storyRoute==='eg-karim'?'karimStory':storyRoute==='in-mira'?'miraStory':storyRoute==='in-arul'?'arulStory':storyRoute==='th-mari'?'mariStory':storyRoute==='th-songchai'?'songchaiStory':storyRoute==='kr-doyun'?'doyunStory':storyRoute==='kr-haryeong'?'haryeongStory':storyRoute==='jp-yuki'?'yukiStory':storyRoute==='jp-tsuki'?'tsukiStory':storyRoute==='cn-yun'?'yunStory':storyRoute==='cn-cheng'?'chengStory':storyRoute==='tw-yuan'?'yuanStory':'story']?.run)p[storyRun?.chapterId==='L9'&&['jp-yuki','jp-tsuki'].includes(storyRoute)?'jpMeetingStory':storyRoute==='no-meeting'?'noMeetingStory':storyRoute==='va-meeting'?'vaMeetingStory':storyRoute==='eg-meeting'?'egMeetingStory':storyRoute==='in-meeting'?'inMeetingStory':storyRoute==='th-meeting'?'thMeetingStory':storyRoute==='kr-meeting'?'krMeetingStory':storyRoute==='eg-salma'?'salmaStory':storyRoute==='va-sofia'?'sofiaStory':storyRoute==='va-matteo'?'matteoStory':storyRoute==='no-ingrid'?'ingridStory':storyRoute==='no-einar'?'einarStory':storyRoute==='eg-karim'?'karimStory':storyRoute==='in-mira'?'miraStory':storyRoute==='in-arul'?'arulStory':storyRoute==='th-mari'?'mariStory':storyRoute==='th-songchai'?'songchaiStory':storyRoute==='kr-doyun'?'doyunStory':storyRoute==='kr-haryeong'?'haryeongStory':storyRoute==='jp-yuki'?'yukiStory':storyRoute==='jp-tsuki'?'tsukiStory':storyRoute==='cn-yun'?'yunStory':storyRoute==='cn-cheng'?'chengStory':storyRoute==='tw-yuan'?'yuanStory':'story'].run.state=S.serialize();else if(p.run?.status==='active')p.run.state=S.serialize();const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(p)],{type:'application/json'}));a.href=url;a.download='神籙-復原存檔.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};

}

function leaveCampaign(){if(!saveCampaign())return;if(campaignRun?.config?.nether){location.href='../campaign/index.html?view='+(campaignRun.status==='completed'?'result':'nether');return;}if(campaignRun?.config?.expedition){const x=campaignRun.config.expedition;location.href='../expedition.html?country='+(x.country||'TW')+'&stage='+x.number;return;}const opponentCountry=globalThis.ShenluCampaignCatalog?.stages.find(stage=>stage.id===campaignRun?.stageId)?.country;location.href=campaignRun?.status==='completed'?'../campaign/index.html?view=result':['TW','EG','NO'].includes(opponentCountry)?'../world-portrait.html?country='+opponentCountry:'../../preview/journey.html?mode=world';}

function campaignMenu(){const body=dialog(S.state.nether?.queen?'幽冥世界':S.state.expedition?'怪談遠征':'旅程決鬥');if(S.state.nether?.queen)globalThis.ShenluUnderworldUI.rules(S.state,body,el);if(S.state.expedition){const x=S.state.expedition,st=ShenluExpedition.stageFor(x);el('p',st.name+'・'+({single:'女妖關',deputies:'副將',boss:'主女妖',remnant:'骨玉殘影',true:'真身'}[x.phase]),body);if(campaignStore.getProfile().expeditionLosses?.[st.id])el('p',st.hint,body);el('p','現行規則：'+(x.sources.map(a=>ShenluExpedition.moduleText(x,a.module)).join('；')||'女妖尚未現身或規則已解除'),body);if((campaignStore.getProfile().expeditionLosses?.[st.id]||0)>=2){el('button',x.peek?'關閉看破':'開啟看破',body).onclick=()=>{x.peek=!x.peek;saveCampaign();updateExpeditionStatus();campaignMenu();};if(x.peek)el('p','敵方牌組頂：'+(D.cards[S.state.players[1].deck[0]?.id]?.name||'沒有卡片'),body);}}autoControl(body);el('p',(D.routeNames?.[S.state.config.country]||S.state.config.country)+' 對 '+(S.state.nether?.queen?ShenluNether.byId[S.state.nether.queen].name:S.state.expedition?ShenluExpedition.stageFor(S.state.expedition).name:(D.routeNames?.[S.state.config.enemy]||S.state.config.enemy))+'\n每次行動後自動存檔。',body);el('button',S.state.nether?.queen?(S.finished?'前往結算':'儲存並返回幽冥世界'):S.state.expedition?(S.finished?'返回女妖關':'儲存並返回女妖關'):S.finished?'前往結算':'儲存並返回旅程',body).onclick=leaveCampaign;if(!S.finished)el('button','認輸本場',body).onclick=()=>{const b=dialog('確認認輸');el('p','本場將以認輸結束，不發放勝利獎勵。',b);const confirm=el('button','確認認輸',b);confirm.disabled=S.locked;confirm.onclick=()=>{if(S.locked)return;$('dialog').close();clearTimeout(autoTimer);S.surrender();saveCampaign();render();};};}

function applyDuelHeroes(country,enemyRoute){

  const bindings=globalThis.ShenluHeroBindings||{},enemy=bindings[enemyRoute],ally=bindings[country];

  if(!enemy||!ally)throw Error('對戰角色資料尚未載入。');

  const background=stage.querySelector('.background');background.src=enemy.arena;background.alt=enemy.name+'的決鬥舞台';

  for(const im of [$('enemyHero'),document.querySelector('#enemyHUD .portrait img')]){im.src=enemy.portrait;im.alt=enemy.name;}

  globalThis.ShenluHeroFraming?.applyStage($('enemyHero'),enemyRoute);

  const enemyLabel=document.querySelector('.enemy-title');enemyLabel.firstChild.textContent=enemy.label;enemyLabel.querySelector('span').textContent=enemy.name;

  const ownImage=document.querySelector('#ownHUD .portrait img');ownImage.src=ally.portrait;ownImage.alt=ally.name+'半身';

  globalThis.ShenluPortraitCrops?.apply(document.querySelector('#enemyHUD .portrait img'),enemyRoute,'enemy');

  globalThis.ShenluPortraitCrops?.apply(ownImage,country,'ally');

  const ownLabel=document.querySelector('.own-title');ownLabel.firstChild.textContent=ally.label;ownLabel.querySelector('span').textContent=ally.name;

}



function saveStory(){

 if(!campaignStore||!storyRun||!S.state)return true;

 try{

  if(storyRun.status==='active'){

   campaignStore.storyCheckpoint(storyRun.lessonId,S.serialize());

   if(S.finished)campaignStore.storyComplete(storyRun.lessonId,S.lesson?.status==='passed');

   storyRun=campaignStore.storyGet().run;

  }

  campaignSaveError=null;document.getElementById('saveFailure')?.remove();return true;

 }catch(error){campaignSaveError=error;clearTimeout(autoTimer);showSaveFailure(error);return false;}

}

function applyStoryHeroes(){

 if(storyRun.chapterId==='L9'&&!['cn-cheng','cn-yun','jp-tsuki','jp-yuki','kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute)){

  const own=['va-meeting','no-meeting','eg-meeting','in-meeting','kr-meeting','th-meeting'].includes(storyRoute)?campaignStore.getProfile().country:storyRoute==='eg-salma'?'EG-HERO':storyRoute==='va-sofia'?'VA-SOFIA':storyRoute==='va-matteo'?'VA-MATTEO':storyRoute==='no-ingrid'?'NO-INGRID':storyRoute==='no-einar'?'NO-EINAR':storyRoute==='eg-karim'?'EG-P-HERO':storyRoute==='in-mira'?'IN-MIRA':storyRoute==='in-arul'?'IN-ARUL':storyRoute==='th-mari'?'TH-AJARN':storyRoute==='th-songchai'?'TH-LUANGPOR':storyRoute==='kr-doyun'?'KR-N-HERO':storyRoute==='kr-haryeong'?'KR':storyRoute==='jp-yuki'?'JP':storyRoute==='jp-tsuki'?'JP-N-HERO':storyRoute==='cn-yun'?'YUN':storyRoute==='cn-cheng'?'CN':storyRoute==='tw-yuan'?'TW-YUAN':'TW',opponent=own==='TW'?'TW-YUAN':'TW';

  applyDuelHeroes(own,opponent);stage.classList.add('story-duel');$('enemyHero').hidden=true;

  const chapter=ShenluMeetingStoryData.chapter(storyRoute),bg=stage.querySelector('.background');bg.src='../'+chapter.background;bg.alt='雙籙相逢・廟埕切磋舞台';return;

 }

 applyDuelHeroes(['va-meeting','no-meeting','eg-meeting','in-meeting','kr-meeting','th-meeting'].includes(storyRoute)?campaignStore.getProfile().country:storyRoute==='eg-salma'?'EG-HERO':storyRoute==='va-sofia'?'VA-SOFIA':storyRoute==='va-matteo'?'VA-MATTEO':storyRoute==='no-ingrid'?'NO-INGRID':storyRoute==='no-einar'?'NO-EINAR':storyRoute==='eg-karim'?'EG-P-HERO':storyRoute==='in-mira'?'IN-MIRA':storyRoute==='in-arul'?'IN-ARUL':storyRoute==='th-mari'?'TH-AJARN':storyRoute==='th-songchai'?'TH-LUANGPOR':storyRoute==='kr-doyun'?'KR-N-HERO':storyRoute==='kr-haryeong'?'KR':storyRoute==='jp-yuki'?'JP':storyRoute==='jp-tsuki'?'JP-N-HERO':storyRoute==='cn-yun'?'YUN':storyRoute==='cn-cheng'?'CN':storyRoute==='tw-yuan'?'TW-YUAN':'TW','TW');

 stage.classList.add('story-duel');

 const ids=storyRoute==='tw-yuan'?{'L2':'M01','L3':'M02','L4':'M03','B1':'M03','L6':'M04','L7':'M05','L8':'M06'}:{'L2':'M01','L3':'M01','L4':'M02','B1':'M02','L5':'M03','L6':'M04','L7':'M05','L8':'M06'},id=['cn-cheng','cn-yun','jp-tsuki','jp-yuki','kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute)?(storyRun.chapterId==='L9'?(storyRoute==='va-meeting'?ShenluVAMeetingStoryData:storyRoute==='no-meeting'?ShenluNOMeetingStoryData:storyRoute==='eg-meeting'?ShenluEGMeetingStoryData:storyRoute==='in-meeting'?ShenluINMeetingStoryData:storyRoute==='th-meeting'?ShenluTHMeetingStoryData:['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(storyRoute)?ShenluKRMeetingStoryData:['jp-tsuki','jp-yuki'].includes(storyRoute)?ShenluJPMeetingStoryData:ShenluCNMeetingStoryData).chapter(storyRoute):storyData.chapters.find(c=>c.id===storyRun.chapterId)).enemy:(storyRoute==='tw-yuan'?'TW-SNK-':'TW-RED-')+ids[storyRun.chapterId],a=PortraitArt[id]||{},d=D.cards[id];

 const portrait=document.querySelector('#enemyHUD .portrait img');

 portrait.src=a.premium||a.card;portrait.alt=d?.name||'故事敵方';portrait.removeAttribute('style');$('enemyHero').src=a.front||a.card||a.premium;$('enemyHero').alt=d?.name||'故事敵方';

 // The enemy spirits on the battlefield already identify the encounter.

 $('enemyHero').hidden=true;

 const label=document.querySelector('.enemy-title');label.firstChild.textContent='神話冒險';label.querySelector('span').textContent=d?.name||'異象';

 const chapter=storyRun.chapterId==='L9'?(storyRoute==='va-meeting'?ShenluVAMeetingStoryData:storyRoute==='no-meeting'?ShenluNOMeetingStoryData:storyRoute==='eg-meeting'?ShenluEGMeetingStoryData:storyRoute==='in-meeting'?ShenluINMeetingStoryData:storyRoute==='th-meeting'?ShenluTHMeetingStoryData:['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting'].includes(storyRoute)?ShenluKRMeetingStoryData:['jp-tsuki','jp-yuki'].includes(storyRoute)?ShenluJPMeetingStoryData:ShenluCNMeetingStoryData).chapter(storyRoute):storyData.chapters.find(c=>c.id===storyRun.chapterId);

 const bg=stage.querySelector('.background');bg.src='../'+chapter.background;bg.alt=chapter.title+'・故事決鬥舞台';

}

async function startStory(){

 reset();practiceName='';otherworld=false;computerControl=false;stage.classList.remove('otherworld');

 try{

  const chapter=storyChapterByLesson[requestedLesson];if(!chapter)throw Error('找不到故事關卡');

  campaignStore=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});campaignStore.load();

  if(storyRoute==='no-meeting'&&!['NO-EINAR','NO-INGRID'].includes(campaignStore.getProfile().country))throw Error('請使用艾納或英格麗進入交會');

  if(storyRoute==='va-meeting'&&!['VA-MATTEO','VA-SOFIA'].includes(campaignStore.getProfile().country))throw Error('請使用馬泰奧或索菲亞進入交會');

  if(storyRoute==='eg-meeting'&&!['EG-P-HERO','EG-HERO'].includes(campaignStore.getProfile().country))throw Error('請使用卡里姆或莎爾瑪進入交會');

  if(storyRoute==='in-meeting'&&!['IN-ARUL','IN-MIRA'].includes(campaignStore.getProfile().country))throw Error('請使用阿魯爾或米拉進入交會');

  if(storyRoute==='th-meeting'&&!['TH-LUANGPOR','TH-AJARN'].includes(campaignStore.getProfile().country))throw Error('請使用頌猜或瑪莉進入交會');

  if(storyRoute==='kr-meeting'&&!['KR','KR-N-HERO'].includes(campaignStore.getProfile().country))throw Error('請使用文河鈴或韓道允進入交會');

  if(campaignStore.getProfile().country!==(['va-meeting','no-meeting','eg-meeting','in-meeting','kr-meeting','th-meeting'].includes(storyRoute)?campaignStore.getProfile().country:storyRoute==='eg-salma'?'EG-HERO':storyRoute==='va-sofia'?'VA-SOFIA':storyRoute==='va-matteo'?'VA-MATTEO':storyRoute==='no-ingrid'?'NO-INGRID':storyRoute==='no-einar'?'NO-EINAR':storyRoute==='eg-karim'?'EG-P-HERO':storyRoute==='in-mira'?'IN-MIRA':storyRoute==='in-arul'?'IN-ARUL':storyRoute==='th-mari'?'TH-AJARN':storyRoute==='th-songchai'?'TH-LUANGPOR':storyRoute==='kr-doyun'?'KR-N-HERO':storyRoute==='kr-haryeong'?'KR':storyRoute==='jp-yuki'?'JP':storyRoute==='jp-tsuki'?'JP-N-HERO':storyRoute==='cn-yun'?'YUN':storyRoute==='cn-cheng'?'CN':storyRoute==='tw-yuan'?'TW-YUAN':'TW'))throw Error('目前主角與這條故事路線不同，請返回旅程選擇');

  const existing=campaignStore.storyGet().run;if(existing?.lessonId===requestedLesson&&existing.status==='passed'&&!existing.state){location.replace('../story.html?chapter='+chapter+'&after=1');return;}storyRun=existing?.lessonId===requestedLesson&&existing.state?existing:campaignStore.storyStart(chapter);campaignSaveError=null;

  const restartNote=!storyRun.state&&storyRun.restartNote;

  if(storyRun.state)S.restore(storyRun.state);else S.beginLesson(requestedLesson,{playerRecipe:storyRun.recipe,borrowNuwa:storyRun.borrowNuwa===true});

  attachOwnedItems();
  if(S.lesson?.id!==requestedLesson)throw Error('故事對局與章節不符');

  applyStoryHeroes();

  for(let side=0;side<2;side++)for(const c of S.snapshot().players[side].slots)if(c?.id&&!c.hidden)seenDebuts.add(side+':'+c.id);

  const bootLink=document.querySelector('#duelBoot a');if(bootLink){bootLink.href=lessonHome();bootLink.textContent='返回章節';}

  saveStory();render();await ShenluEntranceEffects.playStory({ally:{id:campaignStore.getProfile().country,src:document.querySelector('#ownHUD .portrait img').src,name:document.querySelector('#ownHUD .portrait img').alt.replace(/半身$/,'')||'我方'},enemy:{id:ShenluHeroBindings[S.state.config.enemy]?.name===$('enemyHero').alt?S.state.config.enemy:null,src:$('enemyHero').src,name:$('enemyHero').alt||'敵方'},background:stage.querySelector('.background').src});drive();if(restartNote){const body=dialog('牌組已更新');el('p',restartNote,body);el('button','繼續',body).onclick=()=>$('dialog').close();}

 }catch(error){clearTimeout(autoTimer);const boot=$('duelBoot');if(boot)boot.remove();document.documentElement.classList.remove('duel-loading');const body=dialog('無法開啟故事對局');el('p',globalThis.ShenluPlayerCopy.error(error,'duel')+'。原存檔保留。',body);el('button','返回故事章節',body).onclick=()=>location.href='../story.html';}

}

function storyMenu(){

 const body=dialog(S.lesson?.title||'神話冒險');

 el('button','冒險目標',body).onclick=()=>showLessonGoal();el('button','查看起始局面與任務規則',body).onclick=()=>{const b=dialog('起始局面');el('p',S.lesson?.setup||'',b);};if(S.lesson?.progress)el('p',S.lesson.progress,body);if(S.lesson?.threat)el('p',S.lesson.threat,body);

 let shown=0;const hints=el('button','需要提示',body);hints.onclick=()=>{const hint=S.lesson?.hints[shown++];if(hint)el('p',hint,body);hints.disabled=shown>=(S.lesson?.hints.length||0);};

 autoControl(body);

 el('button','儲存並返回章節',body).onclick=()=>{if(saveStory())location.href=lessonHome();};

 el('button','查看戰鬥紀錄',body).onclick=()=>{const b=dialog('戰鬥紀錄');for(const l of S.state.log.slice(-25))el('div',chinese(l.text,l.actor),b,'log');};

 if(!S.finished)el('button',['kr-haryeong','kr-doyun','kr-meeting','th-meeting','th-songchai','th-mari','in-arul','in-mira','in-meeting','eg-karim','eg-salma','eg-meeting','no-einar','no-ingrid','no-meeting','va-matteo','va-sofia','va-meeting'].includes(storyRoute)?'認輸並重新挑戰':'認輸並調整牌組',body).onclick=()=>{const b=dialog('確認認輸');el('p','本關可重新挑戰；已完成的章節保留。',b);const yes=el('button','確認認輸',b);yes.disabled=S.locked;yes.onclick=()=>{if(S.locked)return;$('dialog').close();clearTimeout(autoTimer);S.surrender();saveStory();render();};};

}



function applyExpedition(){
 const x=S.state.expedition,st=ShenluExpedition.stageFor(x);stage.classList.add('story-duel','expedition-duel');$('enemyHero').hidden=true;
 const img=document.querySelector('#enemyHUD .portrait img'),a=PortraitArt[st.artSource]||{},bossArt=PortraitArt[st.boss]||{};img.src=bossArt.front||a.front||a.premium||a.card;img.alt=st.name;img.removeAttribute('style');globalThis.ShenluPortraitCrops?.apply(img,st.boss,'enemy');
 const label=document.querySelector('.enemy-title');label.firstChild.textContent='第'+x.number+'關';label.querySelector('span').textContent=st.name;
 if(!$('expeditionStatus')){const n=el('div','',stage);n.id='expeditionStatus';n.setAttribute('role','status');n.style.cssText='position:absolute;left:112px;top:18px;max-width:1000px;padding:8px 18px;background:#142024ed;color:#f2d69d;border:1px solid #9b7958;border-radius:10px;font:18px/1.4 sans-serif;z-index:8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none';}
 setupExpeditionView();updateExpeditionStatus();
}
function setupExpeditionView(){if($('handToggle'))return;const toggle=el('button','收合手牌',stage);toggle.id='handToggle';toggle.className='expedition-hand-toggle';toggle.setAttribute('aria-expanded','true');toggle.onclick=()=>{const hidden=stage.classList.toggle('expedition-hand-collapsed');toggle.textContent=hidden?'展開手牌':'收合手牌';toggle.setAttribute('aria-expanded',String(!hidden));};}
function expeditionRuleLabel(text){let depth=0;for(let i=0;i<text.length;i++){const c=text[i];if(c==='（'||c==='(')depth++;else if(c==='）'||c===')')depth=Math.max(0,depth-1);else if(c==='：'&&depth===0)return text.slice(0,i);}return text;}
function updateExpeditionStatus(){const x=S.state.expedition,n=$('expeditionStatus');if(!n)return;const active=x.sources.filter(a=>E.locate(S.state,a.uid)?.zone==='slots').map(a=>expeditionRuleLabel(ShenluExpedition.moduleText(x,a.module)));n.textContent='規則：'+(active.join('、')||'目前無特殊規則')+(x.country==='JP'&&x.number===8?'｜骨片 '+(x.bones||0)+'／4'+(x.boneSummoned?'・已召出骨甲女妖':''):'')+(x.country==='NO'&&x.fatePhase===2?'｜公開：'+(S.state.players[0].hand.filter(c=>x.fateRevealed?.includes(c.uid)).map(c=>D.cards[c.id].name).join('、')||'無'):'')+(x.peek?'｜看破：'+(D.cards[S.state.players[1].deck[0]?.id]?.name||'牌組已空'):'');n.title=n.textContent;}
function startCampaign(){

 try{

  campaignStore=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});campaignStore.load();campaignRun=campaignStore.resume();

  const requested=new URLSearchParams(location.search).get('run');if(!campaignRun||campaignRun.id!==requested){location.replace('../world-portrait.html');return;}if(campaignRun.status!=='active'){leaveCampaign();return;}

  const restartNote=!campaignRun.state&&campaignRun.restartNote;

  reset();otherworld=campaignRun.config.enemy.startsWith('DM-');stage.classList.toggle('otherworld',otherworld);if(campaignRun.state)S.restore(campaignRun.state,campaignRun.config);else{S.begin({...campaignRun.config,token:campaignRun.id});S.enter(campaignRun.id);}

  attachOwnedItems();
  for(const id of campaignRun.introVideoIds||[])seenDebuts.add('1:'+id);
  applyDuelHeroes(S.state.config.country,S.state.config.enemy);if(S.state.expedition)applyExpedition();if(S.state.nether?.queen)globalThis.ShenluUnderworldUI.apply(S.state,stage);

  saveCampaign();render();globalThis.ShenluDemoStatistics?.start();drive();if(restartNote){const body=dialog('牌組已更新');el('p',restartNote,body);el('button','繼續',body).onclick=()=>$('dialog').close();}

 }catch(error){clearTimeout(autoTimer);const body=dialog('無法恢復挑戰');el('p',globalThis.ShenluPlayerCopy.error(error,'duel')+'。原存檔已保留。',body);el('button','返回旅程與備份',body).onclick=()=>location.href='../campaign/index.html?view=saves';}

}



 if(!storyMode&&!campaignMode&&!requestedLesson){globalThis.ShenluHeroFraming?.applyStage($('enemyHero'),'TW-YUAN');globalThis.ShenluPortraitCrops?.apply(document.querySelector('#enemyHUD .portrait img'),'TW-YUAN','enemy');globalThis.ShenluPortraitCrops?.apply(document.querySelector('#ownHUD .portrait img'),'CN','ally');}

 fit();if(parent!==window)parent.postMessage({type:'SHENLU_DUEL_READY'},location.origin==='null'?'*':location.origin);if(storyMode){startStory();}else if(campaignMode){startCampaign();}else if(requestedLesson){startLesson(requestedLesson);}else if(parent===window){const kind=new URLSearchParams(location.search).get('practice');if(['ally','enemy','rear','roster','defense','direct','summon','set','hand7','victory','lesson'].includes(kind))startPractice(kind);else{begin({seed:crypto.getRandomValues(new Uint32Array(1))[0],first:0,token:'standalone'});S.enter('standalone');render();drive()}}

})();






