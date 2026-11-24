(function(root){const D=root.TW09Data,country="IN",cards={},decks={"IN-ARUL":["IN-A01","IN-A01","IN-A01","IN-A02","IN-A02","IN-A02","IN-A03","IN-A03","IN-A03","IN-A04","IN-A04","IN-A04","IN-A05","IN-A05","IN-A06","IN-A06","IN-A07","IN-A07","IN-A08","IN-A09","IN-S01","IN-S01","IN-S01","IN-S02","IN-S02","IN-S03","IN-S03","IN-S04","IN-S04","IN-S05","IN-S05","IN-S06","IN-S06","IN-T01","IN-T01","IN-T01","IN-T02","IN-T02","IN-T03","IN-T03"],"IN-MIRA":["IN-B01","IN-B01","IN-B01","IN-B02","IN-B02","IN-B02","IN-B03","IN-B03","IN-B03","IN-B04","IN-B04","IN-B04","IN-B05","IN-B05","IN-B06","IN-B06","IN-B07","IN-B07","IN-B08","IN-B09","IN-S01","IN-S01","IN-S01","IN-S02","IN-S02","IN-S03","IN-S03","IN-S04","IN-S04","IN-S05","IN-S05","IN-S06","IN-S06","IN-T01","IN-T01","IN-T01","IN-T02","IN-T02","IN-T03","IN-T03"]},names={"IN-ARUL":"阿魯爾","IN-MIRA":"米拉"},data={cards,decks,names};const api={cards,decks,names,install:function install(H){
 const {C,sp,face,locate,move,draw,used,use,pick,shuffle,capacity,canSpecial,summon,queueDestroy,value}=H;
 const state=s=>s[country+'Runtime']||(s[country+'Runtime']={visits:{},wards:[],delayed:[]});
 const ours=c=>!!c, low=(c,n=4)=>ours(c)&&sp(c)&&C(c).level<=n;
 const live=(s,c)=>face(c)&&!c.negated&&!(c.noEffectsUntil>=s.turn);
 const spell=c=>ours(c)&&/spell/.test(C(c).subtype);
 const stamp=(s,c)=>{const l=locate(s,c.uid);return l?{uid:c.uid,side:l.side,zone:l.zone,entity:c.entity??null,visit:state(s).visits[c.uid]||0}:null;};
 const valid=(s,r,visible=false,effective=false)=>{if(!r)return null;const l=locate(s,r.uid);return l&&l.side===r.side&&l.zone===r.zone&&(l.c.entity??null)===r.entity&&(state(s).visits[r.uid]||0)===r.visit&&(!visible||face(l.c))&&(!effective||live(s,l.c))?l.c:null;};
 const yard=(s,side)=>{const c=s.players[side].field;return !!c&&live(s,c);};
 const handSpecial=(s,side,n,exclude=[])=>capacity(s,side)?s.players[side].hand.filter(c=>!exclude.includes(c.uid)&&low(c,n)&&canSpecial(s,side,c)):[];
 const addBuff=(s,c,key,amount,until=s.turn)=>{(c.worldBuffs||(c.worldBuffs=[])).push({country,key,amount,until});};
 const buffValue=(s,c,key)=>(c.worldBuffs||[]).filter(b=>b.country===country&&b.key===key&&b.until>=s.turn).reduce((v,b)=>v+b.amount,0);
 const nextStart=(s,side)=>s.turn+(s.side===side?2:1);
 const source=(s,f)=>!f.args.source||valid(s,f.args.source,true,true);
 function deploy(s,f,n,flags={}){const list=handSpecial(s,f.side,n),uid=pick(s,f,'deploy',list,'選擇手牌靈體');if(uid===undefined)return false;const c=list.find(c=>c.uid===uid);if(c&&capacity(s,f.side)&&canSpecial(s,f.side,c))summon(s,f.side,uid,'def',flags);return true;}
 function search(s,f,test){const p=s.players[f.side],list=p.deck.filter(test),uid=pick(s,f,'search',list,'選擇公開加入手牌的卡');if(uid===undefined)return false;if(list.some(c=>c.uid===uid)){const c=move(s,uid,'hand',f.side);H.log(s,'公開取得'+C(c).name+'。',c.id);shuffle(s,p.deck);}return true;}
 function reorder(s,f){const p=s.players[f.side],top=p.deck.slice(0,2),uid=pick(s,f,'top',top,'選擇置於最上方的卡');if(uid===undefined)return false;const i=top.findIndex(c=>c.uid===uid);if(i>0){p.deck.splice(0,top.length,...[top[i],...top.filter((_,j)=>j!==i)]);}return true;}
 function discard(s,f,key='discard'){const list=s.players[f.side].hand,uid=pick(s,f,key,list,'選擇棄置手牌');if(uid===undefined)return false;if(list.some(c=>c.uid===uid))move(s,uid,'grave');return true;}
 function cycle(s,f){if(!f.step){draw(s,f.side);f.step=1;if(s.winner!==null)return true;}return discard(s,f);}
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
 function effects(s,side,ctx){if(s.damageCalculation)return [];const {p,q,out,own,enemy,main,add,targeted,srcArgs,costHands,supports}=baseEffects(s,side,ctx);
  const oursOwn=own.filter(ours), garden=yard(s,side), normal=ctx?.kind==='worldSummon'&&ctx.country===country&&ctx.side===side;
  const summonEvent=c=>normal&&ctx.uid===c.uid&&valid(s,ctx.source,true,true);
  const give=(c,code,t,args={},cost=null)=>targeted(c,code,t,{...srcArgs(c),...args},cost);
  for(const c of oursOwn){const stance={...srcArgs(c),mode:c.mode};
   if(main){
    if(c.id==='IN-A01'){if(c.mode==='atk')for(const t of oursOwn.filter(t=>t.uid!==c.uid))give(c,'boost',t,{mode:c.mode,key:'atk',amount:300});else if(p.deck.length)add(c,'reorder',stance);}
    if(c.id==='IN-A02'){if(c.mode==='atk')give(c,'boost',c,{mode:c.mode,key:'atk',amount:400});else if(p.deck.some(t=>t.id==='IN-S03'))for(const t of p.hand.filter(ours))add(c,'search', {...stance,searchId:'IN-S03'},{kind:'shuffleHand',uid:t.uid});}
    if(c.id==='IN-A05')for(const t of oursOwn.filter(t=>t.uid!==c.uid&&t.mode!==c.mode&&!H.positionLocked(s,t)))give(c,'match',t,{mode:c.mode,targetMode:t.mode});
    if(c.id==='IN-A07'){if(c.mode==='atk')for(const t of enemy)for(const h of p.hand)give(c,'boost',t,{mode:c.mode,key:'atk',amount:-600},{kind:'discard',uid:h.uid});else for(const t of oursOwn.filter(t=>t.uid!==c.uid))give(c,'boost',t,{mode:c.mode,key:'def',amount:500,until:nextStart(s,side)-1});}
    if(c.id==='IN-A08'){if(c.mode==='atk'){for(const h of p.hand)if(handSpecial(s,side,4,[h.uid]).length)add(c,'deploy',{...stance,n:4},{kind:'discard',uid:h.uid});}else for(const t of p.grave.filter(t=>low(t)))for(const h of p.hand)give(c,'recover',t,{mode:c.mode},{kind:'discard',uid:h.uid});}
    if(c.id==='IN-A09'){if(c.mode==='atk'){for(const t of [...q.back,q.field].filter(Boolean))for(const h of p.hand)give(c,'destroy',t,{mode:c.mode},{kind:'discard',uid:h.uid});}else for(const t of p.grave.filter(t=>low(t)))give(c,'recover',t,{mode:c.mode,after:'discard'});}
    if(c.id==='IN-B03'&&garden)for(const t of oursOwn.filter(t=>t.uid!==c.uid&&low(t)))give(c,'boost',t,{garden:true,key:'def',amount:500,until:nextStart(s,side)-1});
    if(c.id==='IN-B05'&&garden&&handSpecial(s,side,3).length)add(c,'deploy',{...srcArgs(c),garden:true,n:3,negate:true,material:true});
    if(c.id==='IN-B09'&&garden&&s.phase==='main'&&s.battleEnteredTurn!==s.turn&&state(s).battleTurn!==s.turn&&state(s).attackTurn!==s.turn&&handSpecial(s,side,4).length)add(c,'krishna',{...srcArgs(c),garden:true,n:4});
   }
   if(summonEvent(c)){
    if(c.id==='IN-A06'){if(c.mode==='atk'&&p.deck.some(t=>t.id==='IN-S03'))for(const h of p.hand)add(c,'search',{...stance,searchId:'IN-S03'},{kind:'discard',uid:h.uid});if(c.mode==='def')for(const t of p.grave.filter(t=>low(t)))for(const h of p.hand)give(c,'recover',t,{mode:c.mode},{kind:'discard',uid:h.uid});}
    if(c.id==='IN-B01'&&ctx.normal&&p.deck.length)add(c,garden?'cycle':'reorder',{...srcArgs(c),garden:!!garden});
    if(c.id==='IN-B02'&&ctx.normal&&p.deck.some(t=>t.id==='IN-S02'))for(const h of p.hand.filter(ours))add(c,'search',{...srcArgs(c),searchId:'IN-S02'},{kind:'shuffleHand',uid:h.uid});
    if(c.id==='IN-B06')for(const t of [...p.deck,...p.grave].filter(H.field))give(c,'recover',t);
   }
   if(ctx?.country===country&&ctx.side===side){
    if(ctx.kind==='worldStart'&&c.id==='IN-B07'&&garden)give(c,'boost',c,{garden:true,key:'atk',amount:500});
    if(ctx.kind==='worldEnd'&&c.id==='IN-B08'&&garden)for(const t of p.grave.filter(t=>low(t)))for(const h of p.hand)give(c,'recover',t,{garden:true},{kind:'discard',uid:h.uid});
    if(ctx.kind==='worldBattleWin'&&c.id==='IN-A03'&&c.uid===ctx.uid&&c.mode==='atk'&&valid(s,ctx.source,true,true))for(const t of p.grave.filter(t=>low(t,1)))give(c,'recover',t,{mode:'atk'});
   }
  }
  if(ctx?.kind==='worldDestroyed'&&ctx.country===country&&ctx.side===side&&valid(s,ctx.source)){
   const c=valid(s,ctx.source);if(c.id==='IN-A04'&&ctx.reason==='battle'&&ctx.by!==side&&ctx.card.mode==='def'&&live(s,ctx.card)&&handSpecial(s,side,3).length)add(c,'deploy',{graveSource:ctx.source,n:3});
   if(c.id==='IN-B04'&&ctx.reason==='effect'&&ctx.by===1-side&&garden)for(const t of p.grave.filter(t=>t.uid!==c.uid&&low(t,3)))targeted(c,'recover',t,{graveSource:ctx.source,garden:true});
  }
  for(const c of supports){if(main&&!C(c).subtype.includes('trap')){
   if(c.id==='IN-S01'&&p.deck.some(t=>low(t)))for(const h of p.hand.filter(t=>ours(t)&&sp(t)))add(c,'search',{}, {kind:'shuffleHand',uid:h.uid});
   if(c.id==='IN-S03'){const a=own.filter(t=>!H.positionLocked(s,t)),b=enemy.filter(t=>!H.positionLocked(s,t));for(const t of a)targeted(c,'switch',t,{mode:t.mode});for(const t of b)targeted(c,'switch',t,{mode:t.mode});for(const t of a)for(const u of b)targeted(c,'switch',t,{mode:t.mode,other:stamp(s,u),otherMode:u.mode});}
   if(c.id==='IN-S04')for(const h of costHands(c))if(handSpecial(s,side,3,[h.uid]).length)add(c,'deploy',{n:3,negate:true},{kind:'discard',uid:h.uid});
   if(c.id==='IN-S05')for(const t of [...q.back,q.field].filter(Boolean))for(const h of costHands(c))targeted(c,'destroy',t,{}, {kind:'discard',uid:h.uid});
   if(c.id==='IN-S06')for(const t of p.grave.filter(t=>low(t)))targeted(c,'recover',t);
  }
   if(c.id==='IN-T01'&&ctx?.kind==='attack'&&ctx.side!==side){const t=locate(s,ctx.t);if(t?.side===side&&t.zone==='slots'&&face(t.c)&&ours(t.c)&&t.c.mode==='atk'&&!H.positionLocked(s,t.c))targeted(c,'attackSwitch',t.c,{attack:ctx.id,targetMode:'atk'});}
   if(c.id==='IN-T02'&&ctx?.kind==='effect'&&ctx.frame.side!==side&&!s.damageCalculation){for(const uid of H.destructionTargets(s,ctx.frame)){const l=locate(s,uid);if(l?.side===side&&['slots','back','field'].includes(l.zone))for(const h of costHands(c))targeted(c,'chainWard',l.c,{}, {kind:'discard',uid:h.uid});}}
   if(c.id==='IN-T03'&&ctx?.kind==='worldDestroyed'&&ctx.country===country&&ctx.side===side&&ctx.reason==='battle'&&ctx.by===1-side&&s.side!==side&&handSpecial(s,side,3).length)add(c,'deploy',{n:3});
  }
  const f=p.field;if(f?.id==='IN-S02'&&garden&&ctx?.kind==='worldEnd'&&ctx.country===country&&ctx.side===side&&oursOwn.some(t=>low(t)))add(f,'yardHeal',srcArgs(f),'', 'yardHeal');
  return out;
 }
 function resolve(s,f){if(!f.code.startsWith('IN_'))return undefined;const a=f.args,p=s.players[f.side],code=f.code.slice(3);
  if(!source(s,f)||(a.source&&a.mode&&valid(s,a.source)?.mode!==a.mode)||(a.garden&&!yard(s,f.side))||(a.graveSource&&!valid(s,a.graveSource)))return true;
  if(code==='search')return search(s,f,c=>a.searchId?c.id===a.searchId:low(c));
  if(code==='reorder')return reorder(s,f);
  if(code==='cycle')return cycle(s,f);
  if(code==='recover'&&f.id!=='IN-B06')return recover(s,f,a.after);
  if(code==='recover'){const t=valid(s,a.target);if(t&&H.field(t)){move(s,t.uid,'hand',f.side);if(a.target.zone==='deck')shuffle(s,p.deck);}return true;}
  if(code==='switch'){for(const [r,mode] of [[a.target,a.mode],[a.other,a.otherMode]]){const t=valid(s,r,true);if(t&&t.mode===mode&&!H.positionLocked(s,t))t.mode=mode==='atk'?'def':'atk';}return true;}
  if(code==='deploy'||code==='krishna'){const flags={};if(a.negate)flags.noEffectsUntil=s.turn;if(a.material)flags.noMaterialUntil=nextStart(s,f.side)-1;return deploy(s,f,a.n,flags);}
  if(code==='boost'){const t=valid(s,a.target,true);if(t)addBuff(s,t,a.key,a.amount,a.until??s.turn);}
  else if(code==='switch'||code==='match'||code==='attackSwitch'){const t=valid(s,a.target,true);if(t&&ours(t)&&t.mode===a.targetMode&&!H.positionLocked(s,t)&&(code!=='attackSwitch'||s.attack?.id===a.attack&&!s.attack.cancel&&s.attack.t===t.uid))t.mode=code==='match'?a.mode:t.mode==='atk'?'def':'atk';}
  else if(code==='destroy'){const t=valid(s,a.target);if(t)queueDestroy(s,[t.uid],'effect',f.side);}
  else if(code==='chainWard'){const t=valid(s,a.target);if(t&&['slots','back','field'].includes(a.target.zone))state(s).wards.push({target:a.target,side:f.side});}
  else if(code==='yardHeal'){if(p.slots.some(t=>face(t)&&low(t)))p.lp+=300;}
  else throw Error('Unknown India effect '+code);return true;
 }
 function beforeActivate(s,a){if(a.code==='IN_krishna'){const st=state(s);(st.noBattle||(st.noBattle={}))[a.side]=s.turn;}}
 function countryValue(s,c,key){let n=buffValue(s,c,key);if(key==='atk'&&c.id==='IN-A04'&&live(s,c)&&c.mode==='atk'&&s.damageCalculation&&s.attack?.a===c.uid){const t=locate(s,s.attack.t);if(t?.c.mode==='def')n+=400;}return n;}
 function destructionOptions(s,l,reason){if(reason!=='battle'||l.zone!=='slots'||l.c.id!=='IN-A03'||l.c.mode!=='def'||!live(s,l.c)||used(s,l.side,l.c))return [];return s.players[l.side].hand.map(c=>({key:'IN-A03-'+c.uid,label:'棄'+C(c).name+'免除戰破',code:'IN_REPLACE',args:{source:stamp(s,l.c),cost:stamp(s,c)}}));}
 function replaceDestruction(s,choice,l){if(choice.code!=='IN_REPLACE')return undefined;const c=valid(s,choice.args.source,true,true),h=valid(s,choice.args.cost);if(!c||!h||used(s,l.side,c)||c.mode!=='def')return false;move(s,h.uid,'grave');use(s,l.side,c);return true;}
 function preventDestroy(s,l,reason,by){if(reason!=='effect'||by!==1-l.side)return false;const wards=state(s).wards,i=wards.findIndex(w=>w.side===l.side&&valid(s,w.target)&&['slots','back','field'].includes(l.zone)&&w.target.uid===l.c.uid);if(i<0)return false;wards.splice(i,1);return true;}
 function onCountryDestroyed(s,l,card,reason,by){if(reason!=='battle')return;const b=s.attack,other=b&&(l.c.uid===b.a?b.t:l.c.uid===b.t?b.a:null),a=locate(s,other);if(a&&a.zone==='slots'&&a.side!==l.side&&a.c.id==='IN-A03'&&a.c.mode==='atk'&&live(s,a.c))s.jobs.push({kind:'event',event:{kind:'worldBattleWin',country,side:a.side,uid:a.c.uid,source:stamp(s,a.c)}});}
 function onCountryMove(){}
 function afterChain(s){state(s).wards=[];}
 function destructionTargets(s,f){return f.code==='IN_destroy'&&valid(s,f.args.target)?[f.args.target.uid]:[];}
 return {effects,resolve,value:countryValue,onSummon,onMove,onDestroyed,startTurn,endTurn,beforeActivate,beforeBattle,onAttack,filter,destructionOptions,replaceDestruction,preventDestroy,afterChain,destructionTargets};
}};root.IndiaDeck=api;})(globalThis);