(function(root){const D=root.TW09Data,country="VA",cards={},decks={"VA-MATTEO":["VA-M01","VA-M01","VA-M01","VA-M02","VA-M02","VA-M02","VA-M03","VA-M03","VA-M03","VA-M04","VA-M04","VA-M04","VA-M05","VA-M05","VA-M06","VA-M06","VA-M07","VA-M07","VA-M08","VA-M09","VA-S01","VA-S01","VA-S01","VA-S02","VA-S02","VA-S03","VA-S03","VA-S04","VA-S04","VA-S05","VA-S05","VA-S06","VA-S06","VA-T01","VA-T01","VA-T01","VA-T02","VA-T02","VA-T03","VA-T03"],"VA-SOFIA":["VA-S01","VA-S01","VA-S01","VA-S02","VA-S02","VA-S03","VA-S03","VA-S04","VA-S04","VA-S05","VA-S05","VA-S06","VA-S06","VA-T01","VA-T01","VA-T01","VA-T02","VA-T02","VA-T03","VA-T03","VA-N01","VA-N01","VA-N01","VA-N02","VA-N02","VA-N02","VA-N03","VA-N03","VA-N03","VA-N04","VA-N04","VA-N04","VA-N05","VA-N05","VA-N06","VA-N06","VA-N07","VA-N07","VA-N08","VA-N09"]},names={"VA-MATTEO":"馬泰奧","VA-SOFIA":"索菲亞"},data={cards,decks,names};const api={cards,decks,names,install:function install(H){
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
 function onDestroyed(s,l,card,reason,by){if(l.zone!=='slots')return;const grave=locate(s,card.uid);if(sp(card)&&grave?.zone==='grave'&&grave.side===l.side)s.jobs.push({kind:'event',event:{kind:'worldDestroyed',country,side:l.side,card,source:stamp(s,grave.c),reason,by}});onCountryDestroyed(s,l,card,reason,by);}
 function startTurn(s){s.jobs.push({kind:'event',event:{kind:'worldStart',country,side:s.side}});}
 function endTurn(s){s.jobs.push({kind:'event',event:{kind:'worldEnd',country,side:s.side}});}
 function beforeBattle(s){state(s).battleTurn=s.turn;}
 function onAttack(s,side){state(s).attackTurn=s.turn;}
 function filter(s,side,actions){return actions.filter(a=>!(a.kind==='battle'&&state(s).noBattle?.[side]===s.turn)&&!(a.kind==='effect'&&locate(s,a.uid)?.c.cnBlockedUntil>=s.turn));}
 function effects(s,side,ctx){if(s.damageCalculation)return [];const {p,q,out,own,enemy,main,add,targeted,srcArgs,costHands,supports}=baseEffects(s,side,ctx),ownVA=own.filter(ours);
  const give=(c,code,t,args={},cost=null)=>targeted(c,code,t,{...srcArgs(c),...args},cost);
  for(const c of ownVA){
   if(main){
    if(c.id==='VA-M05')for(const t of ownVA.filter(t=>t.uid!==c.uid&&t.mode==='atk'&&!H.positionLocked(s,t)))give(c,'peace',t);
    if(c.id==='VA-N03')for(const t of ownVA.filter(t=>t.uid!==c.uid&&low(t,2)))give(c,'boost',t,{key:'atk',amount:500});
   }
   if(ctx?.kind==='worldSummon'&&ctx.country===country&&ctx.side===side&&ctx.uid===c.uid&&valid(s,ctx.source,true,true)){
    if(['VA-M02','VA-N02'].includes(c.id)&&ctx.normal&&p.deck.some(t=>low(t)&&t.id!==c.id))for(const h of p.hand.filter(t=>t.uid!==c.uid&&ours(t)))add(c,'search',{...srcArgs(c),different:c.id},{kind:'shuffleHand',uid:h.uid});
    if(c.id==='VA-M03'&&ctx.normal)for(const t of p.grave.filter(t=>low(t,2)))give(c,'recover',t);
    if(c.id==='VA-M07'&&capacity(s,side))for(const t of p.grave.filter(t=>sp(t)&&C(t).level<=3&&canSpecial(s,side,t)))give(c,'revive',t);
    if(c.id==='VA-M08'&&p.deck.some(spell))add(c,'search',{...srcArgs(c),spell:true});
    if(c.id==='VA-N01'&&ctx.normal)add(c,'heal',{...srcArgs(c),amount:300});
    if(c.id==='VA-N05'&&ctx.normal)for(const t of p.grave.filter(t=>low(t)&&t.id!==c.id))for(const h of p.hand)give(c,'recover',t,{}, {kind:'discard',uid:h.uid});
    if(c.id==='VA-N08')for(const t of p.grave.filter(spell))give(c,'recover',t,{after:'block'});
   }
   if(ctx?.kind==='battleStart'&&ctx.side===side){
    if(c.id==='VA-M06'&&enemy.some(t=>value(s,t)>value(s,c)))give(c,'george',c);
    if(c.id==='VA-N06')for(const t of enemy.filter(t=>t.mode==='def'))give(c,'boost',t,{key:'def',amount:-700,targetMode:'def'});
   }
   if(c.id==='VA-M04'&&ctx?.kind==='attack'&&ctx.side!==side&&value(s,c)>=500){const l=locate(s,ctx.t);if(l?.side===side&&l.zone==='slots'&&face(l.c)&&ours(l.c)&&l.c.uid!==c.uid)give(c,'martin',l.c,{attack:ctx.id});}
   if(c.id==='VA-M09'&&ctx?.kind==='effect'&&ctx.frame.side!==side&&s.stack[s.stack.length-1]?.activation===ctx.frame.activation&&!s.damageCalculation&&H.material(s,c)&&H.destructionTargets(s,ctx.frame).some(uid=>{const l=locate(s,uid);return l?.side===side&&['slots','back','field'].includes(l.zone);})){
    const enemySource=locate(s,ctx.frame.uid);add(c,'michael',{frame:ctx.frame.activation,enemySource:enemySource?stamp(s,enemySource.c):null,paidVisit:(state(s).visits[c.uid]||0)+1},{kind:'tribute',uid:c.uid});
   }
  }
  if(ctx?.kind==='worldDestroyed'&&ctx.country===country&&ctx.side===side&&ctx.reason==='battle'&&ctx.by===1-side){const c=valid(s,ctx.source);if(c?.id==='VA-M01'&&handSpecial(s,side,4).length)add(c,'deploy',{graveSource:ctx.source,n:4,negate:true});}
  for(const c of supports){if(main&&!C(c).subtype.includes('trap')){
   if(c.id==='VA-S01'&&ownVA.length&&handSpecial(s,side,3).length)add(c,'deploy',{n:3,negate:true,requiresOwn:true});
   if(c.id==='VA-S02'&&p.deck.some(t=>low(t)))for(const h of costHands(c).filter(sp))add(c,'search',{}, {kind:'shuffleHand',uid:h.uid});
   if(c.id==='VA-S03')for(const t of p.grave.filter(t=>low(t)))targeted(c,'recover',t);
   if(c.id==='VA-S04'&&!c.vaEquip)for(const t of own)targeted(c,'equip',t,{},null,'effect',{persistent:true});
   if(c.id==='VA-S05')for(const t of ownVA)targeted(c,'boost',t,{key:'atk',amount:600});
   if(c.id==='VA-S06')for(const t of [...q.back,q.field].filter(Boolean))for(const h of costHands(c))targeted(c,'destroy',t,{}, {kind:'discard',uid:h.uid});
  }
   if(ctx?.kind==='attack'&&ctx.side!==side){const attack=locate(s,ctx.a),target=locate(s,ctx.t);
    if(c.id==='VA-T01'&&target?.side===side&&target.zone==='slots'&&face(target.c)&&ours(target.c)&&attack?.zone==='slots'&&face(attack.c))targeted(c,'boost',attack.c,{key:'atk',amount:-600});
    if(c.id==='VA-T02'&&target?.side===side&&target.zone==='slots')for(const t of own.filter(t=>t.uid!==ctx.t&&H.legalAttackTarget(s,s.attack,t)))targeted(c,'redirect',t,{attack:ctx.id,attacker:stamp(s,attack.c)});
   }
   if(c.id==='VA-T03'&&ctx?.kind==='worldDestroyed'&&ctx.country===country&&ctx.side===side&&ctx.reason==='battle'&&ctx.by===1-side&&capacity(s,side)&&p.hand.some(t=>sp(t)&&C(t).level<=4&&canSpecial(s,side,t)))add(c,'openDeploy',{n:4,negate:true});
  }
  if(ctx?.kind==='worldEnd'&&ctx.country===country){for(const d of state(s).delayed.filter(d=>d.side===side&&d.turn===s.turn)){const c=valid(s,d.target);if(c)add(c,'delayed',{delayed:d.target},null,'delayed');}}
  return out;
 }
 function resolve(s,f){if(!f.code.startsWith('VA_'))return undefined;const a=f.args,p=s.players[f.side],code=f.code.slice(3);
  const current=locate(s,f.uid);
  // Ordinary activated effects survive departure; only Martin/George explicitly require the source to remain.
  if(current?.zone==='slots'&&current.c.entity===f.snapshot?.entity&&!live(s,current.c))return true;
  if(['martin','george'].includes(code)&&!source(s,f))return true;
  if(code==='search')return search(s,f,c=>a.spell?spell(c):low(c)&&c.id!==a.different);
  if(code==='recover')return recover(s,f,a.after);
  if(code==='openDeploy'){const list=p.hand.filter(t=>sp(t)&&C(t).level<=4&&canSpecial(s,f.side,t)),uid=pick(s,f,'deploy',list,'選擇四星以下靈體');if(uid===undefined)return false;if(list.some(t=>t.uid===uid)&&capacity(s,f.side))summon(s,f.side,uid,'def',{noEffectsUntil:s.turn});return true;}
  if(code==='deploy'){if(a.requiresOwn&&!p.slots.some(c=>face(c)&&ours(c)))return true;return deploy(s,f,a.n,a.negate?{noEffectsUntil:s.turn}:{});}
  if(code==='revive'){const t=valid(s,a.target);if(t&&capacity(s,f.side)&&canSpecial(s,f.side,t))summon(s,f.side,t.uid,'def',{noEffectsUntil:nextStart(s,f.side)-1,noMaterialUntil:nextStart(s,f.side)-1});}
  else if(code==='boost'){const t=valid(s,a.target,true);if(t&&(!a.targetMode||t.mode===a.targetMode))addBuff(s,t,a.key,a.amount);}
  else if(code==='heal')p.lp+=a.amount;
  else if(code==='peace'){const t=valid(s,a.target,true);if(t&&t.mode==='atk'&&!H.positionLocked(s,t)){t.mode='def';p.lp+=400;}}
  else if(code==='george'){const t=valid(s,a.target,true);if(t&&s.players[1-f.side].slots.some(c=>face(c)&&value(s,c)>value(s,t)))addBuff(s,t,'atk',500);}
  else if(code==='martin'){const c=valid(s,a.source,true,true),t=valid(s,a.target,true),b=s.attack;if(c&&t&&value(s,c)>=500&&b?.id===a.attack&&!b.cancel&&b.t===t.uid&&H.legalAttackTarget(s,b,t)){addBuff(s,c,'atk',-500);state(s).wards.push({kind:'martin',target:a.target,attack:a.attack});}}
  else if(code==='equip'){const t=valid(s,a.target,true),l=locate(s,f.uid);if(t&&l?.zone==='back'&&live(s,l.c)&&(f.origin==='hand'?l.c.entity===f.activation+1:l.c.entity===f.snapshot.entity)){l.c.vaEquip=a.target;}else if(l)move(s,f.uid,'grave');}
  else if(code==='destroy'){const t=valid(s,a.target);if(t)queueDestroy(s,[t.uid],'effect',f.side);}
  else if(code==='redirect'){const t=valid(s,a.target,true),attacker=valid(s,a.attacker,true),b=s.attack;if(t&&attacker&&b?.id===a.attack&&!b.cancel&&b.a===attacker.uid&&H.legalAttackTarget(s,b,t)){b.t=t.uid;addBuff(s,t,'def',500);state(s).wards.push({kind:'martin',target:a.target,attack:a.attack});}}
  else if(code==='michael'){const frame=s.stack.find(g=>g.activation===a.frame);if(frame&&!frame.negated){frame.negated=true;const g=locate(s,f.uid);if(g?.zone==='grave'&&g.side===f.side&&(state(s).visits[f.uid]||0)===a.paidVisit)state(s).delayed.push({side:f.side,turn:s.turn,target:stamp(s,g.c)});const t=valid(s,a.enemySource);if(t&&['slots','back','field'].includes(a.enemySource.zone))queueDestroy(s,[t.uid],'effect',f.side);}}
  else if(code==='delayed'){const t=valid(s,a.delayed);if(t)move(s,t.uid,'hand',f.side);}
  else throw Error('Unknown clergy effect '+code);return true;
 }
 function countryValue(s,c,key){let n=buffValue(s,c,key);const l=locate(s,c.uid);if(l?.zone!=='slots'||!face(c))return 0;
  if(key==='def')for(const p of s.players)for(const e of p.back)if(e?.id==='VA-S04'&&live(s,e)&&e.vaEquip?.uid===c.uid&&valid(s,e.vaEquip,true))n+=400;
  if(key==='atk'&&c.id==='VA-N07'&&live(s,c)&&s.damageCalculation&&s.attack){if(s.attack.a===c.uid&&locate(s,s.attack.t)?.zone==='slots')n+=500;else if(s.attack.t===c.uid)n-=500;}return n;
 }
 function destructionOptions(s,l,reason){if(reason!=='battle'||l.zone!=='slots'||!face(l.c))return [];const out=[];
  if(l.c.id==='VA-N04'&&live(s,l.c)&&!used(s,l.side,l.c,'protect'))out.push({key:'VA-Clare',label:'嘉勒防護',code:'VA_CLARE',args:{target:stamp(s,l.c)}});
  for(const w of state(s).wards)if(w.kind==='martin'&&w.target.uid===l.c.uid&&valid(s,w.target,true)&&s.attack?.id===w.attack&&s.attack.t===l.c.uid)out.push({key:'VA-Martin',label:'聖馬丁守護',code:'VA_MARTIN',args:{target:w.target,attack:w.attack}});
  for(const e of s.players[l.side].back)if(e?.id==='VA-S04'&&live(s,e)&&e.vaEquip?.uid===l.c.uid&&valid(s,e.vaEquip,true))out.push({key:'VA-Cloak-'+e.uid,label:'破壞庇護披風替代',code:'VA_CLOAK',args:{target:stamp(s,l.c),equip:stamp(s,e)}});
  return out;
 }
 function replaceDestruction(s,choice,l,reason,by){if(!choice.code.startsWith('VA_'))return undefined;const t=valid(s,choice.args.target,true);if(!t||reason!=='battle')return false;
  if(choice.code==='VA_CLARE'){if(!live(s,t)||used(s,l.side,t,'protect'))return false;use(s,l.side,t,'protect');return true;}
  if(choice.code==='VA_MARTIN'){const st=state(s),i=st.wards.findIndex(w=>w.target.uid===t.uid&&w.attack===choice.args.attack);if(i<0||s.attack?.id!==choice.args.attack||s.attack.t!==t.uid)return false;st.wards.splice(i,1);return true;}
  if(choice.code==='VA_CLOAK'){const e=valid(s,choice.args.equip,true,true);if(!e||!valid(s,e.vaEquip,true))return false;return !!H.destroyed(s,e.uid,'replacement',l.side);}
  return false;
 }
 function onCountryMove(s,l){if(l.zone==='slots')for(const p of s.players)for(const e of [...p.back])if(e?.vaEquip?.uid===l.c.uid)move(s,e.uid,'grave');}
 function afterResolve(s){for(const p of s.players)for(const e of [...p.back])if(e?.vaEquip&&!valid(s,e.vaEquip,true))move(s,e.uid,'grave');}
 function onCountryDestroyed(){}
 function piercing(s,c,t){return c?.id==='VA-N09'&&live(s,c)&&t?.mode==='def';}
 function destructionTargets(s,f){if(f.code==='VA_destroy'&&valid(s,f.args.target))return [f.args.target.uid];if(f.code==='VA_michael'&&valid(s,f.args.enemySource))return [f.args.enemySource.uid];return [];}
 return {effects,resolve,value:countryValue,onSummon,onMove,onDestroyed,startTurn,endTurn,beforeBattle,onAttack,filter,destructionOptions,replaceDestruction,afterResolve,piercing,destructionTargets};
}};root.ClergyDeck=api;})(globalThis);