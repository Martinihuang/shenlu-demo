(function(root){const D=root.TW09Data,country="TH",cards={},decks={"TH-LUANGPOR":["TH-L01","TH-L01","TH-L01","TH-L02","TH-L02","TH-L02","TH-L03","TH-L03","TH-L03","TH-L04","TH-L04","TH-L04","TH-L05","TH-L05","TH-L06","TH-L06","TH-L07","TH-L07","TH-L08","TH-L09","TH-S01","TH-S01","TH-S01","TH-S02","TH-S02","TH-S03","TH-S03","TH-S04","TH-S04","TH-S05","TH-S05","TH-S06","TH-S06","TH-T01","TH-T01","TH-T01","TH-T02","TH-T02","TH-T03","TH-T03"],"TH-AJARN":["TH-M01","TH-M01","TH-M01","TH-M02","TH-M02","TH-M02","TH-M03","TH-M03","TH-M03","TH-M04","TH-M04","TH-M04","TH-M05","TH-M05","TH-M06","TH-M06","TH-M07","TH-M07","TH-M08","TH-M09","TH-S01","TH-S01","TH-S01","TH-S02","TH-S02","TH-S03","TH-S03","TH-S04","TH-S04","TH-S05","TH-S05","TH-S06","TH-S06","TH-T01","TH-T01","TH-T01","TH-T02","TH-T02","TH-T03","TH-T03"]},names={"TH-LUANGPOR":"龍婆頌猜","TH-AJARN":"阿贊瑪莉"},data={cards,decks,names};const api={cards,decks,names,install:function install(H){
 const {C,sp,face,locate,move,used,pick,shuffle,capacity,canSpecial,summon,material,queueDestroy,value,log}=H;
 const th=c=>!!c,low=(c,n=4)=>th(c)&&sp(c)&&C(c).level<=n;
 const live=(s,c)=>face(c)&&!c.negated&&!(c.noEffectsUntil>=s.turn)&&!(c.thNegatedUntil>=s.turn);
 const defenseIds=['TH-L04','TH-L06','TH-L07','TH-L09'];
 const loc=(s,uid,side,zone,visible=false)=>{const l=locate(s,uid);return l&&l.side===side&&l.zone===zone&&(!visible||face(l.c))?l.c:null;};
 const ref=(s,c)=>{const l=locate(s,c.uid);return {target:c.uid,targetEntity:c.entity??null,targetEpoch:c.thEpoch??0,targetZone:l.zone};};
 const target=(s,a,side,visible=false)=>{const c=loc(s,a.target,side,a.targetZone,visible);return c&&(c.entity??null)===a.targetEntity&&(c.thEpoch??0)===a.targetEpoch?c:null;};
 const own=s=>s.players.map(p=>p.slots.filter(face));
 const endNext=(s,side)=>s.turn+(s.side===side?2:1);
 function bonus(s,c,key,amount){const stamp=key==='atk'?'thAtk':'thDef';if(c[stamp+'Turn']!==s.turn)c[stamp]=0;c[stamp]=(c[stamp]||0)+amount;c[stamp+'Turn']=s.turn;}
 function effects(s,side,ctx){
  const p=s.players[side],q=s.players[1-side],out=[],mine=p.slots.filter(face),enemy=q.slots.filter(face),main=s.side===side&&['main','main2'].includes(s.phase)&&!ctx;
  const add=(c,code,label,args={},cost=null,key='effect',extra={})=>{if(used(s,side,c,key)||!live(s,{...c,hidden:false})||c.cnBlockedUntil>=s.turn)return;out.push({kind:'effect',side,uid:c.uid,code:'TH_'+code,args,cost,key,label:C(c).name+'：'+label,...extra});};
  const disc=c=>p.hand.filter(t=>t.uid!==c.uid);
  const shiftable=c=>c.mode==='atk'&&!H.positionLocked(s,c);
  for(const c of [...p.hand,...p.back].filter(c=>c&&cards[c.id]&&!sp(c))){
   const l=locate(s,c.uid),isTrap=C(c).kind==='trap';if(l.zone==='back'&&!c.hidden)continue;if(isTrap&&(l.zone!=='back'||c.setTurn>=s.turn))continue;if(l.zone==='hand'&&!p.back.includes(null))continue;
   if(main&&!isTrap){
    if(c.id==='TH-S01')for(const high of p.hand.filter(t=>sp(t)&&C(t).level>=5&&C(t).level<=8&&canSpecial(s,side,t))){
     const mats=[...p.hand,...mine].filter(t=>t.uid!==high.uid&&sp(t)&&material(s,t));
     const combinations=[...mats.map(t=>[t]),...mats.flatMap((t,i)=>mats.slice(i+1).map(u=>[t,u]))];
     for(const ms of combinations)if(ms.reduce((n,t)=>n+C(t).level,0)>=C(high).level&&(capacity(s,side)||ms.some(t=>locate(s,t.uid).zone==='slots')))for(const mode of ['atk','def'])
      add(c,'ritual','以'+ms.map(t=>C(t).name).join('＋')+'請神'+C(high).name+'（'+(mode==='atk'?'攻':'守')+'）',{...ref(s,high),mode},{kind:'multi',costs:ms.map(t=>({kind:'send',uid:t.uid}))});
    }
    if(c.id==='TH-S02'&&p.deck.some(t=>low(t)))for(const cost of disc(c).filter(sp))add(c,'searchLow','換伴',{}, {kind:'shuffleHand',uid:cost.uid});
    if(c.id==='TH-S03')for(const t of p.grave.filter(t=>th(t)&&C(t).subtype==='normal_spell'&&t.id!==c.id))add(c,'recoverSpell','回收'+C(t).name,ref(s,t));
    if(c.id==='TH-S04')for(const t of [...q.back,q.field].filter(Boolean))for(const cost of disc(c))add(c,'break','破壞敵方行法／伏兵／場地',{...ref(s,t)},{kind:'discard',uid:cost.uid});
    if(c.id==='TH-S05')for(const t of mine.filter(th))add(c,'atk500','攻擊＋500',ref(s,t));
    if(c.id==='TH-S06')for(const t of mine.filter(th))add(c,'equip','裝備河岸護符',ref(s,t),null,'effect',{persistent:true});
   }
   if(isTrap&&ctx?.kind==='attack'&&ctx.side!==side&&s.attack?.id===ctx.id&&!s.attack.cancel){
    const t=loc(s,ctx.t,side,'slots',true);
    if(c.id==='TH-T01'&&t&&(t.mode==='def'||shiftable(t)))add(c,'nagaGuard','轉守並加防600',{...ref(s,t),attack:ctx.id});
    if(c.id==='TH-T03')for(const t of p.grave.filter(sp))add(c,'cancel','餘儀取消本次攻擊',{attack:ctx.id},{kind:'shuffleGrave',uid:t.uid});
   }
   if(c.id==='TH-T02'&&ctx?.kind==='effect'&&ctx.frame.side!==side){
    const ids=[ctx.frame.args.target,...(ctx.frame.args.targets||[])].map(t=>typeof t==='string'?t:t?.uid).filter(Boolean);
    for(const uid of [...new Set(ids)]){const t=loc(s,uid,side,'slots',true);if(th(t))add(c,'retreat','指定者回手，可守備招援',ref(s,t));}
   }
  }
  for(const c of mine.filter(th)){
   if(main&&c.id==='TH-L05')for(const t of mine.filter(t=>t.uid!==c.uid&&th(t)&&shiftable(t)))add(c,'ownShift','伙伴轉守',ref(s,t));
   if(main&&c.id==='TH-L08'&&!c.attacks&&!(c.noAttackUntil>=s.turn))for(const t of mine.filter(t=>t.uid!==c.uid&&th(t)))add(c,'ward','放棄自身攻擊，保護伙伴',ref(s,t),{kind:'thNoAttack',uid:c.uid});
   if(main&&c.id==='TH-L09'&&!c.attacks)for(const cost of disc(c))add(c,'pierce','本回合下次有效守備攻擊貫穿',{}, {kind:'discard',uid:cost.uid});
   if(ctx?.kind==='battleStart'&&ctx.side===side){
    if(c.id==='TH-M07')add(c,'double','本戰階最多攻擊兩體不同目標');
    if(c.id==='TH-M09')for(const t of mine.filter(t=>t.uid!==c.uid&&th(t)))add(c,'atk400','另一伙伴攻擊＋400',ref(s,t),null,'boost');
    if(c.id==='TH-L06'&&mine.some(t=>t.uid!==c.uid&&th(t)&&t.mode==='def'))add(c,'def200','伙伴協防＋200');
   }
   if(ctx?.kind==='worldSummon'&&ctx.side===side&&ctx.uid===c.uid&&ctx.entity===c.entity){
    if(ctx.normal&&c.id==='TH-M02'&&p.deck.some(t=>t.id==='TH-S01'))for(const cost of p.hand.filter(th))add(c,'searchRitual','準備奉儀',{}, {kind:'shuffleHand',uid:cost.uid});
    if(ctx.normal&&c.id==='TH-M03'&&p.deck.some(t=>th(t)&&sp(t)&&t.id!=='TH-M03'))for(const cost of p.hand.filter(t=>th(t)&&sp(t)))add(c,'searchSpirit','尋找不同伙伴',{}, {kind:'shuffleHand',uid:cost.uid});
    if(c.id==='TH-M06')for(const t of p.grave.filter(t=>th(t)&&C(t).kind==='spell'))add(c,'recoverSpell','回收行法',ref(s,t));
    if(c.id==='TH-M08')for(const t of [...q.back,q.field].filter(face))add(c,'bounce','敵方公開行法／伏兵／場地回手',ref(s,t));
    if(c.id==='TH-M09')for(const t of enemy)add(c,'negateSpirit','敵方靈體本回合無效',ref(s,t),null,'negate');
    if(ctx.normal&&c.id==='TH-L01'&&shiftable(c))add(c,'ownShift','自身轉守',ref(s,c));
    if(ctx.normal&&c.id==='TH-L03'&&p.deck.some(t=>/^TH-L0[6-9]$/.test(t.id)))for(const cost of p.hand.filter(th))add(c,'searchHigh','尋找高星龍婆伙伴',{}, {kind:'shuffleHand',uid:cost.uid});
    if(c.id==='TH-L07')for(const t of enemy.filter(shiftable))add(c,'enemyShift','敌方轉守',ref(s,t));
   }
  }
  if(main&&capacity(s,side)&&mine.some(t=>t.mode==='def'))for(const c of p.hand.filter(c=>c.id==='TH-L02'&&canSpecial(s,side,c)))if(mine.some(t=>t.mode==='def'))add(c,'waterElephant','有守備伙伴，手牌招援',{sourceEpoch:c.thEpoch??0});
  if(ctx?.kind==='worldTHMaterial'&&ctx.side===side){const c=loc(s,ctx.uid,side,'grave');if(c&&(c.thEpoch??0)===ctx.epoch){
   if(c.id==='TH-M04')for(const t of mine.filter(th))add(c,'materialWard','材料那伽守護伙伴',ref(s,t));
   if(c.id==='TH-M05')for(const t of p.grave.filter(t=>low(t,2)))add(c,'materialRecover','材料瑪查努回收伙伴',ref(s,t));
  }}
  return out;
 }
 function resolve(s,f){if(!f.code.startsWith('TH_'))return undefined;const code=f.code.slice(3),p=s.players[f.side],side=f.side,a=f.args,src=locate(s,f.uid),choose=(k,list,label,optional=false)=>pick(s,f,k,list,label,optional);let t;
  if(code==='ritual'){t=target(s,a,side);if(t&&t.id!==f.id&&canSpecial(s,side,t)&&capacity(s,side))summon(s,side,t.uid,a.mode,{noDirectUntil:s.turn});}
  else if(['searchLow','searchRitual','searchSpirit','searchHigh'].includes(code)){
   const pred=code==='searchLow'?t=>low(t):code==='searchRitual'?t=>t.id==='TH-S01':code==='searchHigh'?t=>/^TH-L0[6-9]$/.test(t.id):t=>th(t)&&sp(t)&&t.id!=='TH-M03';
   const uid=choose('find',p.deck.filter(pred),'選擇加入手牌的卡');if(uid===undefined)return false;t=loc(s,uid,side,'deck');if(t&&pred(t)){move(s,uid,'hand',side);log(s,'公開搜尋 '+C(t).name,t.id);shuffle(s,p.deck);}
  }
  else if(['recoverSpell','materialRecover'].includes(code)){t=target(s,a,side);if(t){move(s,t.uid,'hand',side);if(code==='recoverSpell')loc(s,t.uid,side,'hand').cnBlockedUntil=s.turn;}}
  else if(code==='break'){t=target(s,a,1-side);if(t)queueDestroy(s,[t.uid],'effect',side);}
  else if(code==='bounce'){t=target(s,a,1-side,true);if(t)H.returnCard(s,t.uid);}
  else if(code==='atk500'||code==='atk400'){t=target(s,a,side,true);if(th(t))bonus(s,t,'atk',code==='atk500'?500:400);}
  else if(code==='equip'){t=target(s,a,side,true);if(src?.zone==='back'&&live(s,src.c)&&th(t)){src.c.thEquip={uid:t.uid,entity:t.entity,side};}else if(src)move(s,f.uid,'grave');}
  else if(code==='nagaGuard'){t=target(s,a,side,true);if(t&&s.attack?.id===a.attack&&s.attack.t===t.uid&&!s.attack.cancel&&(t.mode==='def'||!H.positionLocked(s,t))){t.mode='def';bonus(s,t,'def',600);t.thDefenseAttackUntil=endNext(s,side);}}
  else if(code==='cancel'){if(s.attack?.id===a.attack&&!s.attack.cancel)s.attack.cancel=true;}
  else if(code==='retreat'){
   if(!f.step){t=target(s,a,side,true);if(!th(t))return true;move(s,t.uid,'hand');f.step=1;if(!loc(s,t.uid,side,'hand'))return true;}
   if(capacity(s,side)){const uid=choose('deploy',p.hand.filter(c=>low(c)&&canSpecial(s,side,c)),'可守備招援低星伙伴',true);if(uid===undefined)return false;t=loc(s,uid,side,'hand');if(t&&low(t)&&canSpecial(s,side,t))summon(s,side,uid,'def',{noEffectsUntil:s.turn,negated:true,candidateNegatedBase:false,candidateNegatedUntil:s.turn});}
  }
  else if(code==='ownShift'||code==='enemyShift'){t=target(s,a,code==='enemyShift'?1-side:side,true);if(t&&t.mode==='atk'&&!H.positionLocked(s,t))t.mode='def';}
  else if(code==='ward'||code==='materialWard'){t=target(s,a,side,true);if(th(t))t.thBattleWard=endNext(s,side);}
  else if(code==='pierce'){if(src?.zone==='slots'&&src.side===side&&face(src.c)&&src.c.entity===f.snapshot.entity)src.c.thPierceTurn=s.turn;}
  else if(code==='double'){if(src?.zone==='slots'&&src.side===side&&src.c.entity===f.snapshot.entity){src.c.thDoubleTurn=s.turn;src.c.noDirectUntil=s.turn;}}
  else if(code==='def200'){if(src?.zone==='slots'&&src.side===side&&src.c.entity===f.snapshot.entity&&live(s,src.c)&&p.slots.some(c=>c?.uid!==f.uid&&face(c)&&th(c)&&c.mode==='def'))bonus(s,src.c,'def',200);}
  else if(code==='negateSpirit'){t=target(s,a,1-side,true);if(t){if(t.candidateNegatedUntil===undefined)t.candidateNegatedBase=!!t.negated;t.candidateNegatedUntil=Math.max(t.candidateNegatedUntil||0,s.turn);t.negated=true;t.thNegatedUntil=s.turn;t.noEffectsUntil=Math.max(t.noEffectsUntil||0,s.turn);}}
  else if(code==='waterElephant'){if(src?.zone==='hand'&&src.side===side&&(src.c.thEpoch??0)===a.sourceEpoch&&capacity(s,side)&&canSpecial(s,side,src.c)&&p.slots.some(c=>face(c)&&c.mode==='def'))summon(s,side,f.uid,'def');}
  else throw Error('Unknown Thai effect '+code);
  return true;
 }
 function beforeActivate(s,a){if(a.code==='TH_ward'){const c=loc(s,a.uid,a.side,'slots',true);if(c)c.noAttackUntil=s.turn;}if(a.code==='TH_ritual')log(s,'公開請神對象 '+C(loc(s,a.args.target,a.side,'hand')).name);}
 function onMove(s,l,c,to){c.thEpoch=(l.c.thEpoch??0)+1;if(to==='grave'&&['hand','slots'].includes(l.zone)&&['TH-M04','TH-M05'].includes(c.id)&&(s.moveCause?.kind==='material'||s.moveCause?.kind==='cost'&&s.moveCause.cardId==='TH-S01'))s.jobs.push({kind:'event',event:{kind:'worldTHMaterial',side:l.side,uid:c.uid,epoch:c.thEpoch}});}
 function onSummon(s,side,c,normal){if(th(c)&&face(c))s.jobs.push({kind:'event',event:{kind:'worldSummon',side,uid:c.uid,entity:c.entity,normal}});}
 function onCleanup(s){for(const p of s.players)for(const b of [...p.back])if(b?.thEquip){const r=b.thEquip,t=loc(s,r.uid,r.side,'slots',true);if(!t||t.entity!==r.entity)move(s,b.uid,'grave');}}
 function valueHook(s,c,key){const l=locate(s,c.uid);if(l?.zone!=='slots'||!face(c))return 0;let n=0;const p=s.players[l.side];if(key==='def'&&th(c)){
  if(p.slots.some(t=>t&&t.uid!==c.uid&&t.id==='TH-M01'&&live(s,t)))n+=200;
  if(p.back.some(b=>b?.id==='TH-S06'&&live(s,b)&&b.thEquip?.uid===c.uid&&b.thEquip.entity===c.entity))n+=400;
 }const k=key==='atk'?'thAtk':'thDef';if(c[k+'Turn']===s.turn)n+=c[k]||0;return n;}
 function canAttack(s,side,c){if(c.thDefenseAttackUntil>=s.turn&&face(c)&&c.mode==='def'&&!(c.noAttackUntil>=s.turn))return true;if(!c||C(c).country!=='TH')return undefined;if(!face(c)||c.noAttackUntil>=s.turn)return false;if(c.mode==='atk')return true;return c.mode==='def'&&defenseIds.includes(c.id)&&live(s,c);}
 function attackLimit(s,side,c){if(th(c))return c.id==='TH-M07'&&c.thDoubleTurn===s.turn?2:1;}
 function attackTargetLegal(s,b,t,phase='declare'){const c=loc(s,b.a,b.side,'slots',true);if(!c||C(c).country!=='TH')return undefined;if(c.thDoubleTurn===s.turn){if(!t)return false;if(phase!=='damage'&&(c.thTargets||[]).some(x=>x.turn===s.turn&&x.uid===t.uid&&x.entity===t.entity))return false;}return true;}
 function onAttack(s,side,a,c){if(th(c)&&a.target){const t=locate(s,a.target)?.c;if(t){c.thTargets=c.thTargets||[];c.thTargets.push({turn:s.turn,uid:t.uid,entity:t.entity});}}}
 function validateAttack(s,b){const c=loc(s,b.a,b.side,'slots',true);if(c?.thDefenseAttackUntil>=s.turn&&b.mode==='def')return c.mode==='def'&&c.entity===b.entity&&!(c.noAttackUntil>=s.turn);if(!c||C(c).country!=='TH')return undefined;if(c.entity!==b.entity||c.noAttackUntil>=s.turn)return false;if(b.mode==='def')return c.mode==='def'&&defenseIds.includes(c.id)&&live(s,c);return c.mode==='atk';}
 function attackValue(s,c){if(face(c)&&c.mode==='def'&&c.thDefenseAttackUntil>=s.turn)return value(s,c,'def');if(th(c)&&c.mode==='def'&&defenseIds.includes(c.id)&&live(s,c))return value(s,c,'def');}
 function piercing(s,c){return th(c)&&c.mode==='def'&&c.id==='TH-L09'&&live(s,c)&&c.thPierceTurn===s.turn;}
 function onDamage(s,b){const c=loc(s,b.a,b.side,'slots',true);if(c?.id==='TH-L09'&&b.mode==='def'&&c.thPierceTurn===s.turn)delete c.thPierceTurn;}
 function destructionOptions(s,l,reason,by,job){const c=l.c;if(l.zone!=='slots'||!face(c))return [];const out=[];
  if(reason==='battle'&&c.thBattleWard>s.turn)out.push({key:'TH_WARD',label:'使用那伽／尊者守護避免一次戰破（傷害照算）',code:'TH_WARD',args:{uid:c.uid,entity:c.entity}});
  if(reason==='effect')for(const b of s.players[l.side].back.filter(b=>b?.id==='TH-S06'&&live(s,b)&&b.thEquip?.uid===c.uid&&b.thEquip.entity===c.entity&&!job?.ids.includes(b.uid)))out.push({key:'TH_EQUIP_'+b.uid,label:'破壞河岸護符替代效果破壞',code:'TH_EQUIP',args:{uid:b.uid,target:c.uid,entity:c.entity}});
  return out;
 }
 function replaceDestruction(s,choice,l,reason,by){if(choice.code==='TH_WARD'){if(reason==='battle'&&l.c.entity===choice.args.entity&&l.c.thBattleWard>s.turn){delete l.c.thBattleWard;return true;}return false;}
  if(choice.code==='TH_EQUIP'){const b=loc(s,choice.args.uid,l.side,'back',true);if(b&&live(s,b)&&b.thEquip?.uid===l.c.uid&&l.c.entity===choice.args.entity)return !!H.destroyed(s,b.uid,'replacement',by);return false;}
 }
 function endTurn(s){for(const p of s.players)for(const c of p.slots.filter(Boolean)){delete c.thAtkTurn;delete c.thAtk;delete c.thDefTurn;delete c.thDef;delete c.thTargets;delete c.thDoubleTurn;delete c.thPierceTurn;}}
 const onRetarget=(s,b,t)=>{const c=loc(s,b.a,b.side,'slots',true);if(th(c)&&t){c.thTargets=c.thTargets||[];c.thTargets.push({turn:s.turn,uid:t.uid,entity:t.entity});}};
 const destructionTargets=(s,f)=>f.code==='TH_break'&&target(s,f.args,1-f.side)?[f.args.target]:[];
 return {effects,resolve,beforeActivate,onMove,onSummon,onCleanup,value:valueHook,canAttack,attackLimit,attackTargetLegal,onAttack,onRetarget,validateAttack,attackValue,piercing,onDamage,destructionOptions,replaceDestruction,destructionTargets,endTurn};
}};root.ThaiDeck=api;})(globalThis);