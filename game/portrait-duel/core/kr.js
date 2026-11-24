(function(root){const D=root.TW09Data,country="KR",cards={"KR40-S03":{"id":"KR40-S03","name":"整鼓待機","level":null,"atk":null,"def":null,"subtype":"normal_spell","country":"KR","text":"發動條件：自己主要階段，本回合尚未特召成功，牌組至少2張。\n要做什麼：通常：棄1張其他手牌。逆境：沒有其他手牌、我方至多1體且敵方靈體更多時，每局可1次免棄。\n得到什麼：抽2張。\n限制：每回合同名1次；從發動起本回合禁特召。被無效仍支付成本、保留禁特召；逆境免棄次數亦消耗。","playerText":"發動條件：自己主要階段，本回合尚未特召成功，牌組至少2張。\n要做什麼：通常：棄1張其他手牌。逆境：沒有其他手牌、我方至多1體且敵方靈體更多時，每局可1次免棄。\n得到什麼：抽2張。\n限制：每回合同名1次；從發動起本回合禁特召。被無效仍支付成本、保留禁特召；逆境免棄次數亦消耗。","art":null,"sourceStatus":"LOCAL_PLAYTEST_CANDIDATE","quickText":"棄1抽2；逆境每局1次免棄"},"KR40-S06":{"id":"KR40-S06","name":"天書破障","level":null,"atk":null,"def":null,"subtype":"normal_spell","country":"KR","text":"同名每回合一次。自己主要階段，棄一張其他手牌，破壞任一方行法、伏兵區或場地區的一張卡。可選尚未揭示的卡，但不能預看內容。若成功破壞尚未揭示的卡，抽一張牌。","playerText":"同名每回合一次。自己主要階段，棄一張其他手牌，破壞任一方行法、伏兵區或場地區的一張卡。可選尚未揭示的卡，但不能預看內容。若成功破壞尚未揭示的卡，抽一張牌。","art":null,"sourceStatus":"LOCAL_PLAYTEST_CANDIDATE","quickText":"同名每回合一次"}},decks={},names={},data={cards,decks,names};const api={cards,decks,names,install:function install(H){
 const {C,clone,sp,face,active,rng,shuffle,locate,remove,move,draw,used,use,capacity,material,summon,queueDestroy,pick,log,returnCard,canSpecial}=H;
 const kr=c=>!!c,low=c=>kr(c)&&sp(c)&&C(c).level<=4,high=c=>kr(c)&&sp(c)&&C(c).level>=5;
 const live=(s,uid,side,zone='slots')=>{const l=locate(s,uid);return l&&l.side===side&&l.zone===zone&&face(l.c)?l:null;};
 const available=(s,side,c)=>canSpecial(s,side,c)&&!(s.players[side].krNoSpecialUntil>=s.turn)&&!(s.players[side].krNoSpecialNames?.[c.id]>=s.turn);
 const usable=(s,c)=>!c.negated&&!(c.noEffectsUntil>=s.turn);
 const targets=(context,side,s)=>context?.kind==='effect'&&context.frame?.side!==side?[context.frame.args?.target,...(context.frame.args?.targets||[])].filter(uid=>live(s,uid,side)):[];
 function negate(s,c){if(c.candidateNegatedUntil===undefined)c.candidateNegatedBase=!!c.negated;c.candidateNegatedUntil=Math.max(c.candidateNegatedUntil??0,s.turn);c.negated=true;}
 function mod(s,c,n){if(c.krAttackTurn!==s.turn){c.krAttackTurn=s.turn;c.krAttackAmount=0;}c.krAttackAmount+=n;}
 function event(s,e){s.jobs.push({kind:'event',event:e});}
 function effects(s,side,context){
  const p=s.players[side],q=s.players[1-side],out=[],main=side===s.side&&['main','main2'].includes(s.phase)&&!context;
  const own=p.slots.filter(face),enemy=q.slots.filter(face),targeted=targets(context,side,s);
  function add(c,code,label,args={},cost=null,key='effect',fromEvent=false){
   if(!c||used(s,side,c,key)||!usable(s,c))return;
   out.push({kind:'effect',side,uid:c.uid,code,args,cost,key,label:C(c).name+'：'+label,...(fromEvent?{card:clone(c)}:{})});
  }
  const discard=(c,cb,pred=()=>true)=>p.hand.filter(t=>t.uid!==c.uid&&pred(t)).forEach(t=>cb({kind:'discard',uid:t.uid},'（棄'+C(t).name+'）'));
  for(const c of own.filter(kr)){
   if(main&&c.id==='KR40-M02'&&p.deck.length)add(c,'KR_order','看牌頂2張並排序');
   if(c.id==='KR40-M05'&&targeted.includes(c.uid))add(c,'KR_fox','回手避開指定，本回合禁同名特召',{}, {kind:'return',uid:c.uid});
   if(main&&c.id==='KR40-M06')discard(c,(cost,label)=>{for(const t of enemy)add(c,'KR_jeon','令'+C(t).name+'降700攻並無效'+label,{target:t.uid},cost);},t=>!sp(t));
   if(main&&c.id==='KR40-M07'&&!c.attacks&&q.slots.filter(Boolean).length>=2)add(c,'KR_double','本回合攻擊2體不同靈體，不能直攻');
  }
  if(context?.kind==='krSummon'&&context.side===side){const current=live(s,context.uid,side); const c=current?.c; if(!c||!usable(s,c))return out;
   if(c.id==='KR40-M01'&&context.normal&&p.deck.length)add(c,'KR_magpie','整理牌頂3張',{},null,'effect',true);
   if(c.id==='KR40-M08')for(const t of p.grave.filter(low))add(c,'KR_bari','回收'+C(t).name,{target:t.uid},null,'effect',true);
   if(c.id==='KR40-M09'&&context.normal&&capacity(s,side)&&p.hand.some(t=>low(t)&&available(s,side,t)))add(c,'KR_dangun','手牌低星守備出場',{},null,'effect',true);
  }
  if(context?.kind==='krCost'&&context.side===side&&p.deck.length)add(context.card,'KR_rabbit','抽1再棄1',{},null,'effect',true);
  for(const [zone,list] of [['hand',p.hand],['back',p.back.filter(Boolean)]])for(const c of list){
   if(!kr(c)||sp(c)||c.attached)continue;const d=C(c),isTrap=d.subtype==='normal_trap',isQuick=d.subtype==='quickplay_spell';
   if(zone==='back'&&!c.hidden)continue;if(zone==='back'&&(isTrap||isQuick)&&c.setTurn>=s.turn)continue;
   if(isTrap&&zone==='hand')continue;if(isQuick&&zone==='hand'&&side!==s.side)continue;
   if(!isTrap&&!isQuick&&!main)continue;if(isQuick&&context?.kind==='damage')continue;
   if(zone==='hand'&&!p.back.includes(null))continue;
   if(c.id==='KR40-S01'&&main&&p.krAttackedTurn!==s.turn){
    for(const h of p.hand.filter(t=>high(t)&&C(t).level<=8&&available(s,side,t)))for(const t of own.filter(t=>low(t)&&material(s,t))){
     for(const mode of ['atk','def']){
      const args={summonUid:h.uid,mode};if(C(h).level<=6)add(c,'KR_borrow','借出'+C(h).name+(mode==='atk'?'（攻擊）':'（守備）'),args,{kind:'tribute',uid:t.uid});
      else for(const x of p.hand.filter(x=>x.uid!==c.uid&&x.uid!==h.uid))add(c,'KR_borrow','借出'+C(h).name+'；棄'+C(x).name+(mode==='atk'?'（攻擊）':'（守備）'),args,{kind:'multi',costs:[{kind:'tribute',uid:t.uid},{kind:'discard',uid:x.uid}]});
     }
    }
   }
   if(c.id==='KR40-S02'&&main)for(const t of own.filter(t=>t.mode==='atk'))for(const mode of ['steady','risk'])add(c,'KR_yut',(mode==='steady'?'穩行+400：':'搏運單投：')+C(t).name,{target:t.uid,mode});
   if(c.id==='KR40-S03'&&main&&p.krSpecialTurn!==s.turn&&p.deck.length>=2){
    discard(c,(cost,label)=>add(c,'KR_prepare','抽2張，本回合禁特召'+label,{},cost));
    if(!p.krRecoveryUsed&&!p.hand.some(t=>t.uid!==c.uid)&&p.slots.filter(Boolean).length<=1&&q.slots.filter(Boolean).length>p.slots.filter(Boolean).length)add(c,'KR_prepare','逆境整補：每局一次免棄抽2，本回合禁特召',{recovery:true});
   }
   if(c.id==='KR40-S04'&&main&&p.deck.some(low))for(const t of p.hand.filter(high))add(c,'KR_seek','將'+C(t).name+'洗回搜尋低星',{}, {kind:'shuffleHand',uid:t.uid});
   if(c.id==='KR40-S05'&&p.hand.some(t=>sp(t)&&C(t).level<=4&&available(s,side,t)))for(const uid of targeted){const l=locate(s,uid);if(sp(l.c)&&C(l.c).level>=4&&l.c.mode==='atk')add(c,'KR_retreat','退回'+C(l.c).name+'，手牌低星補位',{target:uid},{kind:'return',uid});}
   if(c.id==='KR40-S06'&&main)discard(c,(cost,label)=>{for(let owner=0;owner<2;owner++)for(const t of [...s.players[owner].back,s.players[owner].field].filter(Boolean))if(t.uid!==c.uid)add(c,'KR_break','破壞'+(t.hidden?'蓋放後排':C(t).name)+label,{target:t.uid,entity:t.entity,zone:locate(s,t.uid).zone},cost);});
   if(c.id==='KR40-T01'&&context?.kind==='attack'&&context.side!==side){const t=live(s,context.t,side);if(t&&kr(t.c)&&t.c.mode==='atk'&&!H.positionLocked(s,t.c))add(c,'KR_step','令被攻擊者轉守備',{target:t.c.uid,attackId:context.id});}
   if(context?.kind==='krDestroyed'&&context.side===side&&context.by===1-side&&context.zone==='slots'){
    if(c.id==='KR40-T02'&&kr(context.card)&&context.reason==='battle'&&side!==s.side&&capacity(s,side)&&p.hand.some(t=>low(t)&&available(s,side,t)))add(c,'KR_echo','手牌低星守備出場');
    if(c.id==='KR40-T03'&&context.reason==='effect'&&sp(context.card)&&C(context.card).level>=4&&locate(s,context.uid)?.zone==='grave')add(c,'KR_soul','將剛被破壞的'+C(context.card).name+'回手',{target:context.uid});
   }
   if(c.id==='KR40-T04'&&context?.kind==='attack'&&context.side!==side&&!context.t&&p.hand.some(t=>kr(t)&&sp(t)&&available(s,side,t)))add(c,'KR_fire','手牌三星承接直接攻擊',{attackId:context.id});
  }
  return out;
 }
 function resolve(s,f){
  if(!f.code.startsWith('KR_'))return undefined;
  const p=s.players[f.side],q=s.players[1-f.side],a=f.args||{},src=locate(s,f.uid);
  const select=(key,list,title,optional=false)=>pick(s,f,key,list,title,optional);
  const deploy=(uid,flags={})=>{const l=locate(s,uid);return l?.side===f.side&&l.zone==='hand'&&low(l.c)&&available(s,f.side,l.c)&&capacity(s,f.side)?summon(s,f.side,uid,'def',flags):null;};
  switch(f.code){
   case'KR_magpie':{const top=p.deck.slice(0,3),chosen=select('top',top.filter(c=>kr(c)&&C(c).subtype.endsWith('_spell')),'選行法置頂，其他依原序置底',true);if(chosen===undefined)return false;const ids=new Set(top.map(c=>c.uid));p.deck=p.deck.filter(c=>!ids.has(c.uid));const kept=top.find(c=>c.uid===chosen);if(kept)p.deck.unshift(kept);p.deck.push(...top.filter(c=>c.uid!==chosen));log(s,'喜鵲整理牌頂，未抽牌。',f.id);break;}
   case'KR_order':{const top=p.deck.slice(0,2),uid=select('first',top,'選擇下一張抽到的牌');if(uid===undefined)return false;if(uid){const i=p.deck.findIndex(c=>c.uid===uid);if(i>=0&&i<2)p.deck.unshift(p.deck.splice(i,1)[0]);}log(s,'三足烏調整牌頂順序。',f.id);break;}
   case'KR_rabbit':{if(!f.step){draw(s,f.side);f.step=1;if(s.winner!==null)return true;}const uid=select('discard',p.hand,'自請妃：抽牌後棄1張');if(uid===undefined)return false;if(uid&&locate(s,uid)?.zone==='hand')move(s,uid,'grave');break;}
   case'KR_fox':break; // Return and same-name restriction were paid/committed before response.
   case'KR_jeon':{const l=live(s,a.target,1-f.side);if(l){mod(s,l.c,-700);negate(s,l.c);log(s,C(l.c).name+'本回合降700攻且效果無效。',f.id);}break;}
   case'KR_double':if(src?.zone==='slots'&&src.side===f.side&&face(src.c)&&q.slots.filter(Boolean).length>=2){src.c.krDoubleTurn=s.turn;src.c.krAttackTargets=[];src.c.noDirectUntil=s.turn;}break;
   case'KR_bari':case'KR_soul':{const l=locate(s,a.target);if(l?.side===f.side&&l.zone==='grave'&&(f.code==='KR_bari'?low(l.c):sp(l.c)&&C(l.c).level>=4))returnCard(s,a.target);break;}
   case'KR_dangun':case'KR_echo':case'KR_retreat':case'KR_fire':{
    if(f.code==='KR_fire'&&(!s.attack||s.attack.id!==a.attackId||s.attack.cancel))break;
    if(!capacity(s,f.side))break;
    const list=p.hand.filter(c=>(f.code==='KR_fire'?kr(c)&&sp(c):f.code==='KR_retreat'?sp(c)&&C(c).level<=4:low(c))&&available(s,f.side,c));
    const uid=select('deploy',list,'選手牌低星守備出場');if(uid===undefined)return false;
    const flags=f.code==='KR_retreat'?{negated:true,candidateNegatedBase:false,candidateNegatedUntil:s.turn,noMaterialUntil:s.turn+(s.side===f.side?1:0)}:{};
    const c=uid?deploy(uid,flags):null;
    if(c&&f.code==='KR_fire'&&s.attack?.id===a.attackId){s.attack.t=c.uid;log(s,C(c).name+'承接直接攻擊，戰鬥照常。',f.id);}break;
   }
   case'KR_borrow':{const l=locate(s,a.summonUid);if(l?.side!==f.side||l.zone!=='hand'||!high(l.c)||C(l.c).level>8||!available(s,f.side,l.c)||!capacity(s,f.side))break;const c=summon(s,f.side,l.c.uid,a.mode,{krBorrowReturn:s.turn,noDirectUntil:s.turn});if(c){p.krBorrowUid=c.uid;p.krBorrowEntity=c.entity;}break;}
   case'KR_yut':{const l=live(s,a.target,f.side);if(!l||l.c.mode!=='atk'||f.krApplied)break;let amount=400;if(a.mode==='risk'){
     const bits=Array.from({length:4},()=>rng(s)<.5?1:0),n=bits.reduce((x,y)=>x+y,0);amount=[1200,0,300,600,900][n];f.yut={bits,flat:n,amount};log(s,'擲柶單投：'+['mo','do','gae','geol','yut'][n]+'，加攻'+amount+'。',f.id);
    }else log(s,'擲柶穩行：加攻400。',f.id);mod(s,l.c,amount);l.c.krTurnDefense=s.turn;f.krApplied=true;break;}
   case'KR_prepare':draw(s,f.side);if(s.winner===null)draw(s,f.side);break;
   case'KR_seek':{const uid=select('search',p.deck.filter(low),'選韓國低星加入手牌');if(uid===undefined)return false;if(uid&&locate(s,uid)?.zone==='deck'){move(s,uid,'hand',f.side);shuffle(s,p.deck);}break;}
   case'KR_break':{const l=locate(s,a.target);if(l&&l.zone===a.zone&&l.c.entity===a.entity){l.c.krBreakDraw={side:f.side,hidden:!!l.c.hidden};queueDestroy(s,[a.target],'effect',f.side);}break;}
   case'KR_step':{const l=live(s,a.target,f.side);if(l&&kr(l.c)&&!H.positionLocked(s,l.c)&&s.attack?.id===a.attackId){l.c.mode='def';l.c.changed=s.turn;log(s,C(l.c).name+'轉守備，攻擊仍繼續。',f.id);}break;}
   default:throw Error('KR candidate effect missing: '+f.code);
  }
  return true;
 }
 function beforeActivate(s,a){const p=s.players[a.side];
  if(a.code==='KR_borrow'){p.krBorrowTurn=s.turn;p.krBorrowUid=null;p.krBorrowEntity=null;const h=locate(s,a.args.summonUid);if(h)log(s,'公開降神候選：'+C(h.c).name+'；本回合鎖定唯一攻擊者。',h.c.id);}
  if(a.code==='KR_prepare'){p.krNoSpecialUntil=s.turn;if(a.args?.recovery)p.krRecoveryUsed=true;}
  if(a.code==='KR_fox'){p.krNoSpecialNames=p.krNoSpecialNames||{};p.krNoSpecialNames['KR40-M05']=s.turn;}
 }
 function onAttack(s,side,a,c){const p=s.players[side];p.krAttackedTurn=s.turn;if(c.id==='KR40-M07'){if(c.krTargetsTurn!==s.turn){c.krTargetsTurn=s.turn;c.krAttackTargets=[];}if(a.target)c.krAttackTargets.push(a.target);}}
 function filter(s,side,actions){
  const p=s.players[side];let out=actions.slice();
  if(side===s.side&&s.phase==='battle'&&!s.window&&!s.pending&&!s.resolving&&!s.jobs.length){
   for(const c of p.slots.filter(c=>active(c)&&c.mode==='atk'&&c.id==='KR40-M07'&&c.krDoubleTurn===s.turn&&c.attacks===1&&!(c.noAttackUntil>=s.turn)))for(const t of s.players[1-side].slots.filter(Boolean))if(!(c.krAttackTargets||[]).includes(t.uid))out.push({kind:'attack',uid:c.uid,target:t.uid,label:C(c).name+'第二擊 → '+(t.hidden?'隱藏靈體':C(t).name)});
  }
  out=out.filter(a=>{
   if(a.kind!=='attack')return true;const l=locate(s,a.uid);if(!l)return false;
   if(p.krBorrowTurn===s.turn&&(a.uid!==p.krBorrowUid||l.c.entity!==p.krBorrowEntity||!a.target))return false;
   if(l.c.krDoubleTurn===s.turn&&(!a.target||(l.c.krAttackTargets||[]).includes(a.target)))return false;
   return true;
  });return out;
 }
 function onSummon(s,side,c,isNormal){if(!isNormal)s.players[side].krSpecialTurn=s.turn;if(!kr(c)||c.hidden||!usable(s,c))return;
  if(c.id==='KR40-M08'||isNormal&&['KR40-M01','KR40-M09'].includes(c.id))event(s,{kind:'krSummon',side,uid:c.uid,card:clone(c),normal:isNormal});
 }
 function onMove(s,l,moved,toZone){const cause=s.moveCause;if(l.zone==='slots'&&toZone==='grave'&&l.c.id==='KR40-M03'&&face(l.c)&&usable(s,l.c)&&cause?.side===l.side&&['cost','material'].includes(cause.kind))event(s,{kind:'krCost',side:l.side,uid:moved.uid,card:clone(l.c)});}
 function onDestroyed(s,l,c,reason,by){if(reason==='effect'&&c.krBreakDraw?.hidden&&by===c.krBreakDraw.side)draw(s,by);if(l.zone==='slots'&&sp(c))event(s,{kind:'krDestroyed',side:l.side,uid:c.uid,card:clone(c),reason,by,zone:l.zone});}
 function preventDestroy(s,l,reason,by){if(reason!=='effect'||by===l.side||l.zone!=='back'||!l.c.hidden)return false;const c=s.players[l.side].slots.find(c=>active(c)&&usable(s,c)&&c.id==='KR40-M04'&&!used(s,l.side,c,'guard'));if(!c)return false;use(s,l.side,c,'guard');log(s,'處容保留一張蓋放後排。',c.id);return true;}
 function endTurn(s){
  for(const p of s.players)for(const c of p.slots.filter(Boolean)){
   if(c.krTurnDefense===s.turn){if(face(c)&&!H.positionLocked(s,c))c.mode='def';delete c.krTurnDefense;}
   if(c.krAttackTurn<=s.turn){delete c.krAttackTurn;delete c.krAttackAmount;}
   if(c.candidateNegatedUntil<=s.turn){c.negated=!!c.candidateNegatedBase;delete c.candidateNegatedUntil;delete c.candidateNegatedBase;}
   if(c.krDoubleTurn<=s.turn){delete c.krDoubleTurn;delete c.krAttackTargets;delete c.krTargetsTurn;}
  }
  const ids=s.players.flatMap(p=>p.slots.filter(c=>c?.krBorrowReturn<=s.turn).map(c=>c.uid));for(const uid of ids)returnCard(s,uid);
 }
 function afterChain(s){for(const p of s.players)for(const c of [...p.back,p.field].filter(Boolean))delete c.krBreakDraw;}
 return {afterChain,effects,resolve,beforeActivate,onAttack,filter,onSummon,onMove,onDestroyed,preventDestroy,endTurn,value:(s,c,key)=>key==='atk'&&face(c)&&c.krAttackTurn===s.turn?(c.krAttackAmount||0):0};
}};root.KRDeck=api;})(globalThis);