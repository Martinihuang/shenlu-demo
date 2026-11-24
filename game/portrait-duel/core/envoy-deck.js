(function(root){const D=root.TW09Data,country="KR",cards={"KR40-S06":{"id":"KR40-S06","name":"天書破障","level":null,"atk":null,"def":null,"subtype":"normal_spell","country":"KR","text":"同名每回合一次。自己主要階段，棄一張其他手牌，破壞任一方行法、伏兵區或場地區的一張卡。可選尚未揭示的卡，但不能預看內容。若成功破壞尚未揭示的卡，抽一張牌。","playerText":"同名每回合一次。自己主要階段，棄一張其他手牌，破壞任一方行法、伏兵區或場地區的一張卡。可選尚未揭示的卡，但不能預看內容。若成功破壞尚未揭示的卡，抽一張牌。","art":null,"sourceStatus":"LOCAL_PLAYTEST_CANDIDATE","quickText":"同名每回合一次"}},decks={"KR-N-HERO":["KR-N01","KR-N01","KR-N01","KR-N02","KR-N02","KR-N02","KR-N03","KR-N03","KR-N03","KR-N04","KR-N04","KR-N04","KR-N05","KR-N06","KR-N07","KR-N08","KR-N09","KR-N10","KR-N11","KR-N12","KR-N13","KR-N14","KR-N15","KR-N16","KR-N16","KR-N16","KR-N17","KR-N17","KR-N18","KR-N18","KR-N19","KR-N19","KR40-S06","KR40-S06","KR40-S02","KR40-S02","KR40-T02","KR40-T02","KR40-T03","KR40-T03"]},names={"KR-N-HERO":"韓道允"},data={cards,decks,names};const api={cards,decks,names,install:function install(H){
 const {C,sp,face,locate,move,draw,used,use,pick,shuffle,capacity,canSpecial,summon,queueDestroy,value}=H;
 const state=s=>s[country+'Runtime']||(s[country+'Runtime']={visits:{},wards:[],delayed:[]});
 const ours=c=>!!c, low=(c,n=4)=>ours(c)&&sp(c)&&C(c).level<=n;
 const live=(s,c)=>face(c)&&!c.negated&&!(c.noEffectsUntil>=s.turn);
 const spell=c=>ours(c)&&/spell/.test(C(c).subtype);
 const stamp=(s,c)=>{const l=locate(s,c.uid);return l?{uid:c.uid,side:l.side,zone:l.zone,entity:c.entity??null,visit:state(s).visits[c.uid]||0}:null;};
 const valid=(s,r,visible=false,effective=false)=>{if(!r)return null;const l=locate(s,r.uid);return l&&l.side===r.side&&l.zone===r.zone&&(l.c.entity??null)===r.entity&&(state(s).visits[r.uid]||0)===r.visit&&(!visible||face(l.c))&&(!effective||live(s,l.c))?l.c:null;};
 const yard=(s,side)=>{const c=s.players[side].field;return c?.id==='IN-S02'&&live(s,c);};
 const handSpecial=(s,side,n,exclude=[])=>capacity(s,side)?s.players[side].hand.filter(c=>!exclude.includes(c.uid)&&low(c,n)&&canSpecial(s,side,c)):[];
 const addBuff=(s,c,key,amount,until=s.turn)=>{(c.worldBuffs||(c.worldBuffs=[])).push({country,key,amount,until});};
 const buffValue=(s,c,key)=>(c.worldBuffs||[]).filter(b=>b.country===country&&b.key===key&&b.until>=s.turn).reduce((v,b)=>v+b.amount,0);
 const nextStart=(s,side)=>s.turn+(s.side===side?2:1);
 const source=(s,f)=>!f.args.source||valid(s,f.args.source,true,true);
 function deploy(s,f,n,flags={}){const list=handSpecial(s,f.side,n),uid=pick(s,f,'deploy',list,'選擇手牌靈體');if(uid===undefined)return false;const c=list.find(c=>c.uid===uid);if(c&&capacity(s,f.side)&&canSpecial(s,f.side,c))summon(s,f.side,uid,'def',flags);return true;}
 function search(s,f,test){const p=s.players[f.side],list=p.deck.filter(test),uid=pick(s,f,'search',list,'選擇公開加入手牌的卡');if(uid===undefined)return false;if(list.some(c=>c.uid===uid)){const c=move(s,uid,'hand',f.side);H.log(s,'公開取得'+C(c).name+'。',c.id);shuffle(s,p.deck);}return true;}
 function reorder(s,f){const p=s.players[f.side],top=p.deck.slice(0,2),uid=pick(s,f,'top',top,'選擇置於最上方的卡');if(uid===undefined)return false;const i=top.findIndex(c=>c.uid===uid);if(i>0){p.deck.splice(0,top.length,...[top[i],...top.filter((_,j)=>j!==i)]);}return true;}
 function discard(s,f,key='discard'){const list=s.players[f.side].hand,uid=pick(s,f,key,list,'選擇棄置手牌');if(uid===undefined)return false;if(list.some(c=>c.uid===uid))move(s,uid,'grave');return true;}
 function cycle(s,f){if(!f.step){const p=s.players[f.side];if(!p.deck.length)return true;draw(s,f.side);f.step=1;if(s.winner!==null)return true;}return discard(s,f);}
 function recover(s,f,after){const t=valid(s,f.args.target);if(!f.step){if(!t)return true;move(s,t.uid,'hand',f.side);f.step=1;if(after==='block'){const c=locate(s,t.uid)?.c;if(c)c.cnBlockedUntil=s.turn;}}return after==='discard'?discard(s,f):true;}
 function baseEffects(s,side,ctx){const p=s.players[side],q=s.players[1-side],out=[],own=p.slots.filter(face),enemy=q.slots.filter(face),main=s.side===side&&['main','main2'].includes(s.phase)&&!ctx;
  const add=(c,code,args={},cost=null,key='effect',options={})=>{const l=locate(s,c.uid);if(!l||used(s,side,c,key)||c.negated||c.noEffectsUntil>=s.turn||c.cnBlockedUntil>=s.turn||(['slots','field'].includes(l.zone)&&!face(c)))return;out.push({kind:'effect',side,uid:c.uid,code:country+'_'+code,args:{...args},cost,key,label:C(c).name+'：'+(options.label||C(c).quickText),...options});};
  const targeted=(c,code,t,args={},cost=null,key='effect',options={})=>add(c,code,{...args,target:stamp(s,t)},cost,key,options);
  const srcArgs=c=>({source:stamp(s,c)});
  const costHands=c=>p.hand.filter(t=>t.uid!==c.uid);
  const supports=[...p.hand,...p.back].filter(c=>c&&cards[c.id]&&!sp(c)&&!c.attached).filter(c=>{const l=locate(s,c.uid);return C(c).subtype.includes('trap')?l.zone==='back'&&c.setTurn<s.turn:l.zone==='back'||capacityBack(s,side,c);});
  return {p,q,out,own,enemy,main,add,targeted,srcArgs,costHands,supports};
 }
 function capacityBack(s,side,c){return C(c).subtype==='field_spell'||s.players[side].back.includes(null);}
 function onSummon(s,side,c,normal){if(cards[c.id]&&face(c))s.jobs.push({kind:'event',event:{kind:'worldSummon',country,side,uid:c.uid,normal,source:stamp(s,c)}});}
 function onMove(s,l,moved,zone){const st=state(s);st.visits[l.c.uid]=(st.visits[l.c.uid]||0)+1;st.wards=st.wards.filter(w=>w.target.uid!==l.c.uid);st.delayed=st.delayed.filter(w=>w.target.uid!==l.c.uid);onCountryMove(s,l,moved,zone);}
 function onDestroyed(s,l,card,reason,by){if(l.zone!=='slots')return;const grave=locate(s,card.uid);if(ours(card)&&grave?.zone==='grave'&&grave.side===l.side)s.jobs.push({kind:'event',event:{kind:'worldDestroyed',country,side:l.side,card,source:stamp(s,grave.c),reason,by}});onCountryDestroyed(s,l,card,reason,by);}
 function startTurn(s){s.jobs.push({kind:'event',event:{kind:'worldStart',country,side:s.side}});}
 function endTurn(s){s.jobs.push({kind:'event',event:{kind:'worldEnd',country,side:s.side}});}
 function beforeBattle(s){state(s).battleTurn=s.turn;}
 function onAttack(s,side){state(s).attackTurn=s.turn;}
 function filter(s,side,actions){return actions.filter(a=>!(a.kind==='battle'&&state(s).noBattle?.[side]===s.turn)&&!(a.kind==='effect'&&locate(s,a.uid)?.c.cnBlockedUntil>=s.turn));}
 const under=c=>!!c&&sp(c), lowUnder=(c,n=4)=>under(c)&&C(c).level<=n;
 const newest=id=>/^KR-N/.test(id);
 const combos=(list,n,start=0,chosen=[])=>n===0?[chosen]:list.slice(start).flatMap((c,i)=>chosen.some(t=>t.id===c.id)?[]:combos(list,n-1,start+i+1,[...chosen,c]));
 function effects(s,side,ctx){if(s.damageCalculation)return [];const {p,q,out,own,enemy,main,add,targeted,srcArgs,costHands,supports}=baseEffects(s,side,ctx),ownUnder=own.filter(under),g=p.grave.filter(under);
  const give=(c,code,t,args={},cost=null,key='effect')=>targeted(c,code,t,args,cost,key),shuffleCost=t=>({kind:'shuffleGrave',uid:t.uid});
  if(main&&capacity(s,side))for(const c of p.hand.filter(c=>['KR-N09','KR-N14','KR-N15'].includes(c.id)&&canSpecial(s,side,c)))for(const group of combos(g,c.id==='KR-N15'?2:3))add(c,'register',{handSource:stamp(s,c)},{kind:'multi',costs:group.map(shuffleCost)},'register');
  for(const c of ownUnder){
   if(main){
    if(c.id==='KR-N04')for(const t of g.filter(t=>t.uid!==c.uid))give(c,'boost',c,{...srcArgs(c),key:'atk',amount:400},shuffleCost(t));
    if(c.id==='KR-N07')for(const t of enemy.filter(t=>!H.positionLocked(s,t)))for(const cost of g)give(c,'switch',t,{targetMode:t.mode},shuffleCost(cost));
    if(c.id==='KR-N08')for(const t of q.back.filter(face))for(const h of p.hand)give(c,'destroy',t,{visible:true},{kind:'discard',uid:h.uid});
    if(c.id==='KR-N12'&&enemy.length>own.length)for(const t of enemy)give(c,'equal',t);
    if(c.id==='KR-N13')for(const t of q.back.filter(Boolean))for(const group of combos(g,2))give(c,'destroy',t,{}, {kind:'multi',costs:group.map(shuffleCost)});
    if(c.id==='KR-N14'&&p.hand.length)for(const t of g.filter(t=>lowUnder(t)))give(c,'recoverShuffle',t);
    if(c.id==='KR-N15'&&capacity(s,side))for(const t of g.filter(t=>lowUnder(t)&&canSpecial(s,side,t)))for(const h of p.hand)give(c,'revive',t,{}, {kind:'discard',uid:h.uid});
   }
   if(ctx?.kind==='worldSummon'&&ctx.country===country&&ctx.side===side&&ctx.uid===c.uid&&valid(s,ctx.source,true,true)){
    if(c.id==='KR-N01'&&ctx.normal&&p.deck.some(t=>lowUnder(t)&&t.id!==c.id))for(const h of p.hand.filter(t=>ours(t)&&sp(t)))add(c,'search',{different:c.id},{kind:'send',uid:h.uid});
    if(c.id==='KR-N03'&&ctx.normal&&p.deck.length)add(c,'reorder');
    if(c.id==='KR-N05'&&ctx.normal&&p.deck.some(t=>t.id==='KR-N16'))for(const h of p.hand.filter(ours))add(c,'search',{searchId:'KR-N16'},{kind:'shuffleHand',uid:h.uid});
    if(c.id==='KR-N06'&&ctx.normal)for(const t of ownUnder.filter(t=>t.uid!==c.uid))give(c,'boost',t,{key:'def',amount:500,until:nextStart(s,side)-1});
    if(c.id==='KR-N09')for(const t of enemy)for(const cost of g)give(c,'boost',t,{key:'atk',amount:-700},shuffleCost(cost));
    if(c.id==='KR-N11'&&ctx.normal)for(const t of enemy)give(c,'lock',t);
   }
  }
  if(ctx?.kind==='worldDestroyed'&&ctx.country===country&&ctx.side===side&&ctx.reason==='battle'&&ctx.by===1-side&&ctx.card.id==='KR-N02'){
   const original=ctx.card,c={id:original.id,uid:original.uid,owner:side};
   for(const t of g.filter(t=>t.uid!==c.uid&&lowUnder(t)))if(!used(s,side,c))out.push({kind:'effect',side,uid:c.uid,card:c,code:'KR_recover',args:{target:stamp(s,t)},key:'effect',label:C(c).name+'：回收冥府伙伴'});
  }
  for(const c of supports.filter(c=>newest(c.id))){if(main&&!C(c).subtype.includes('trap')){
   if(c.id==='KR-N16')for(const h of p.hand.filter(under))if(p.deck.some(t=>lowUnder(t)&&t.id!==h.id))add(c,'registry',{revealed:h.id,revealedUID:h.uid});
   if(c.id==='KR-N17')for(const t of g.filter(t=>lowUnder(t)))give(c,'recover',t);
   if(c.id==='KR-N18'&&p.deck.some(t=>under(t)&&C(t).level>=5&&C(t).level<=8))for(const h of costHands(c).filter(ours))add(c,'search',{high:true},{kind:'shuffleHand',uid:h.uid});
  }
   if(c.id==='KR-N19'&&ctx?.kind==='attack'&&ctx.side!==side&&locate(s,ctx.t)?.side===side){const t=locate(s,ctx.a);if(t?.zone==='slots'&&face(t.c))for(const cost of g)give(c,'attackReduce',t.c,{attack:ctx.id},shuffleCost(cost));}
  }return out;
 }
 function resolve(s,f){if(!f.code.startsWith('ENV_'))return undefined;const a=f.args,p=s.players[f.side],code=f.code.slice(4),current=locate(s,f.uid);
  if(current?.zone==='slots'&&current.c.entity===f.snapshot?.entity&&!live(s,current.c))return true;
  if(a.source&&!source(s,f))return true;
  if(code==='search')return search(s,f,c=>a.searchId?c.id===a.searchId:a.high?under(c)&&C(c).level>=5&&C(c).level<=8:lowUnder(c)&&c.id!==a.different);
  if(code==='reorder')return reorder(s,f);if(code==='recover')return recover(s,f);
  if(code==='register'){const c=valid(s,a.handSource);if(c&&capacity(s,f.side)&&canSpecial(s,f.side,c))summon(s,f.side,c.uid,'atk',{noDirectUntil:s.turn});}
  else if(code==='boost'){const t=valid(s,a.target,true);if(t)addBuff(s,t,a.key,a.amount,a.until??s.turn);}
  else if(code==='equal'){const t=valid(s,a.target,true);if(t&&s.players[1-f.side].slots.filter(face).length>p.slots.filter(face).length)addBuff(s,t,'atk',-500);}
  else if(code==='switch'){const t=valid(s,a.target,true);if(t&&t.mode===a.targetMode&&!H.positionLocked(s,t))t.mode=t.mode==='atk'?'def':'atk';}
  else if(code==='destroy'){const t=valid(s,a.target,!!a.visible);if(t)queueDestroy(s,[t.uid],'effect',f.side);}
  else if(code==='lock'){const t=valid(s,a.target,true);if(t){if(!t.positionLocked)t.envPositionLock=s.turn;t.positionLocked=true;}}
  else if(code==='revive'){const t=valid(s,a.target);if(t&&capacity(s,f.side)&&canSpecial(s,f.side,t))summon(s,f.side,t.uid,'def',{noEffectsUntil:s.turn,noMaterialUntil:nextStart(s,f.side)-1});}
  else if(code==='recoverShuffle'){
   if(!f.step){const t=valid(s,a.target);if(!t||!p.hand.length)return true;move(s,t.uid,'hand',f.side);f.recovered=t.uid;f.step=1;}
   const list=p.hand.filter(t=>t.uid!==f.recovered),uid=pick(s,f,'shuffle',list,'洗回另一張手牌');if(uid===undefined)return false;if(list.some(t=>t.uid===uid)){move(s,uid,'deck',f.side);shuffle(s,p.deck);}
  }
  else if(code==='registry'){
   if(!f.step){const list=p.deck.filter(t=>lowUnder(t)&&t.id!==a.revealed),uid=pick(s,f,'search',list,'搜尋與公開卡不同名的低星冥府');if(uid===undefined)return false;if(!list.some(t=>t.uid===uid))return true;const c=move(s,uid,'hand',f.side);f.added=c.uid;H.log(s,'公開取得'+C(c).name+'。',c.id);shuffle(s,p.deck);f.step=1;}
   const list=p.hand.filter(t=>t.uid!==f.added);if(!list.length){const l=locate(s,f.added);if(l?.zone==='hand'&&l.side===f.side)move(s,f.added,'grave');return true;}
   const uid=pick(s,f,'send',list,'送入棄牌區另一張手牌（不是費用）');if(uid===undefined)return false;if(list.some(t=>t.uid===uid))move(s,uid,'grave');
  }
  else if(code==='attackReduce'){const t=valid(s,a.target,true);if(t&&s.attack?.id===a.attack&&!s.attack.cancel)t.envAttackDebuff={target:a.target,attack:a.attack,amount:-700};}
  else throw Error('Unknown envoy effect '+code);return true;
 }
 function beforeActivate(s,a){if(a.code==='ENV_registry')H.log(s,'公開手牌'+C(a.args.revealed).name+'。',a.args.revealed);}
 function countryValue(s,c,key){let n=buffValue(s,c,key);if(key==='atk'&&c.envAttackDebuff&&face(c)&&valid(s,c.envAttackDebuff.target,true)&&s.attack?.id===c.envAttackDebuff.attack)n+=c.envAttackDebuff.amount;return n;}
 function attackTargetLegal(s,b,t){const l=locate(s,b.a);if(!t&&l?.c.id==='KR-N10'&&live(s,l.c)&&!s.players[l.side].grave.some(under))return false;return true;}
 function onCountryMove(){}
 function onCountryDestroyed(){}
 function endEnvoy(s){for(const p of s.players)for(const c of p.slots.filter(Boolean)){if(c.envPositionLock===s.turn){delete c.envPositionLock;delete c.positionLocked;}delete c.envAttackDebuff;}}
 function destructionTargets(s,f){return f.code==='ENV_destroy'&&valid(s,f.args.target)?[f.args.target.uid]:[];}
 // The original KR module owns KR_* effects; this module uses a separate namespace.
 function envoyEffects(s,side,ctx){return effects(s,side,ctx).map(a=>({...a,code:a.code.replace(/^KR_/,'ENV_'),...(a.code==='KR_revive'?{label:C(locate(s,a.uid).c).name+'：棄手牌，守備接回冥府伙伴'}:{})}));}
 return {effects:envoyEffects,resolve,value:countryValue,onSummon,onMove,onDestroyed,beforeActivate,attackTargetLegal,endTurn:endEnvoy,destructionTargets};
}};root.EnvoyDeck=api;})(globalThis);