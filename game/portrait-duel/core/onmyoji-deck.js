(function(root){const D=root.TW09Data,country="JP",cards={},decks={"JP-N-HERO":["JP-N01","JP-N01","JP-N01","JP-N02","JP-N02","JP-N02","JP-N03","JP-N03","JP-N03","JP-N04","JP-N04","JP-N04","JP-N05","JP-N05","JP-N06","JP-N06","JP-N07","JP-N08","JP-N09","JP-N09","JP24-S03","JP24-S03","JP24-S03","JP24-S07","JP24-S07","JP24-S06","JP-N10","JP-N10","JP-N10","JP-N11","JP-N11","JP-N12","JP-N12","JP-N12","JP24-T01","JP24-T01","JP24-T02","JP24-T02","JP-N13","JP-N13"]},names={"JP-N-HERO":"月城朔"},data={cards,decks,names};const api={cards,decks,names,install:function install(H){const {C,sp,face,active,locate,move,used,pick,shuffle,capacity,summon,queueDestroy,canSpecial}=H;
 const jp=c=>!!c,shiki=c=>!!c&&/^JP-N0[1-9]$/.test(c.id),low=c=>shiki(c)&&sp(c)&&C(c).level<=3,spell=c=>!!c&&/^JP-N1[0-2]$/.test(c.id),live=(s,c)=>active(c)&&!(c.noEffectsUntil>=s.turn),ev=(s,e)=>s.jobs.push({kind:'event',event:e});
 const stamp=(s,uid)=>{const l=locate(s,uid);return l?{uid,zone:l.zone,side:l.side,entity:l.c.entity||0,v:s.jpVersions?.[uid]||0}:null;},valid=(s,t,visible=false)=>{if(!t)return null;const l=locate(s,t.uid);return l&&l.zone===t.zone&&l.side===t.side&&(l.c.entity||0)===t.entity&&(s.jpVersions?.[t.uid]||0)===t.v&&(!visible||face(l.c))?l.c:null;};
 const boost=(s,t,key,n,attack=null)=>{t.jpNBoosts=[...(t.jpNBoosts||[]),{key,n,turn:s.turn,attack}];};
 function effects(s,side,ctx){const p=s.players[side],q=s.players[1-side],own=p.slots.filter(face),enemy=q.slots.filter(face),out=[],main=s.side===side&&['main','main2'].includes(s.phase)&&!ctx,disc=(c,fn=()=>true)=>p.hand.filter(t=>t.uid!==c.uid&&fn(t)),noble=()=>own.find(t=>t.id==='JP-N09'&&live(s,t));
  const add=(c,code,args={},cost=null)=>{if(!c||used(s,side,c)||!live(s,{...c,hidden:false})||c.cnBlockedUntil>=s.turn)return;const locks={};for(const k of ['target','source','enemy','noble'])if(args[k])locks[k]=stamp(s,args[k]);out.push({kind:'effect',side,uid:c.uid,code:'ONM_'+code,args:{...args,locks},cost,key:'effect',label:C(c).name+'：'+({"owl": "調整牌組頂端順序", "seekNoble": "尋找天一貴人", "seekSpell": "尋找式法", "recoverSpell": "取回行法，再將另一張手牌洗回牌組", "recoverLow": "取回三星以下式神", "invite": "從手牌以守備表示特殊出場", "breakCharm": "本回合攻擊＋500", "starGuard": "本次戰鬥守備＋500", "shingen": "本回合攻擊＋500", "honda": "本回合守備＋400", "sanada": "本回合攻擊＋400", "yoshitsune": "本回合攻擊－400"}[code]||'發動效果')+(args.enemy?'，並破壞指定後排':'')+(code==='starGuard'&&args.noble?'，並轉為守備':'')});};
  for(const c of [...p.hand,...p.back].filter(c=>c&&cards[c.id]&&!sp(c))){const back=locate(s,c.uid).zone==='back';if(c.id==='JP-N13'&&(!back||c.setTurn>=s.turn))continue;if(!back&&!p.back.includes(null))continue;
   if(main){
    if(c.id==='JP-N10'&&p.deck.some(t=>t.id==='JP-N09'))for(const t of p.hand.filter(shiki))add(c,'seekNoble',{reveal:t.uid});
    if(c.id==='JP-N11'&&own.some(t=>sp(t)&&live(s,t))&&capacity(s,side)&&p.hand.some(t=>sp(t)&&C(t).level<=3&&canSpecial(s,side,t)))add(c,'invite');
    if(c.id==='JP-N12')for(const t of own.filter(sp)){add(c,'breakCharm',{target:t.uid});if(noble())for(const e of q.back.filter(Boolean))add(c,'breakCharm',{target:t.uid,enemy:e.uid,noble:noble().uid});}
   }
   if(c.id==='JP-N13'&&ctx?.kind==='attack'&&ctx.side!==side){const t=locate(s,ctx.t);if(t?.side===side&&t.zone==='slots'&&face(t.c)&&sp(t.c)){add(c,'starGuard',{target:t.c.uid,attack:ctx.id});if(noble())add(c,'starGuard',{target:t.c.uid,attack:ctx.id,noble:noble().uid});}}
  }
  for(const c of own.filter(c=>cards[c.id]&&sp(c))){
   if(main&&c.id==='JP-N07')for(const t of own.filter(t=>sp(t)&&t.uid!==c.uid))add(c,'shingen',{target:t.uid,source:c.uid});
   if(ctx?.kind==='onmSpell'&&ctx.side===side&&['JP-N04','JP-N05'].includes(c.id))add(c,c.id==='JP-N04'?'honda':'sanada',{target:c.uid});
   if(ctx?.kind==='worldSummon'&&ctx.side===side&&ctx.uid===c.uid&&ctx.entity===c.entity){
    if(c.id==='JP-N01'&&ctx.normal&&p.deck.length)add(c,'owl');
    if(c.id==='JP-N02'&&ctx.normal&&p.deck.some(spell))for(const t of disc(c,jp))add(c,'seekSpell',{}, {kind:'shuffleHand',uid:t.uid});
    if(c.id==='JP-N03'&&ctx.normal&&p.hand.length)for(const t of p.grave.filter(spell))add(c,'recoverSpell',{target:t.uid});
    if(c.id==='JP-N06'&&ctx.normal)for(const t of enemy)add(c,'yoshitsune',{target:t.uid});
    if(c.id==='JP-N08')for(const t of p.grave.filter(t=>sp(t)&&C(t).level<=3))add(c,'recoverLow',{target:t.uid});
   }
  }return out;
 }
 function resolve(s,f){if(!f.code.startsWith('ONM_'))return undefined;const p=s.players[f.side],a=f.args,k=f.code.slice(4),get=(n='target',v=true)=>valid(s,a.locks[n],v),choose=(name,list)=>pick(s,f,name,list,C(f.id).name+'：選擇');
  if(k==='owl'){const top=p.deck.slice(0,2);if(top.length===2){const uid=choose('first',top);if(uid===undefined)return false;if(uid===top[1].uid)p.deck.splice(0,2,top[1],top[0]);}}
  else if(k==='seekNoble'||k==='seekSpell'){const fn=k==='seekNoble'?t=>t.id==='JP-N09':spell;const uid=choose('search',p.deck.filter(fn));if(uid===undefined)return false;const l=locate(s,uid);if(l?.side===f.side&&l.zone==='deck'&&fn(l.c)){move(s,uid,'hand',f.side);shuffle(s,p.deck);f.onmyojiApplied=true;}}
  else if(k==='recoverSpell'){if(!f.step){const t=get('target',false);if(!t)return true;move(s,t.uid,'hand',f.side);locate(s,t.uid).c.cnBlockedUntil=s.turn;f.acquired=t.uid;f.step=1;}const others=p.hand.filter(t=>t.uid!==f.acquired);if(others.length){const uid=choose('return',others);if(uid===undefined)return false;const l=locate(s,uid);if(l?.zone==='hand'&&l.side===f.side&&uid!==f.acquired){move(s,uid,'deck',f.side);shuffle(s,p.deck);}}}
  else if(k==='recoverLow'){const t=get('target',false);if(t)move(s,t.uid,'hand',f.side);}
  else if(k==='invite'){if(p.slots.some(t=>sp(t)&&live(s,t))&&capacity(s,f.side)){const uid=choose('invite',p.hand.filter(t=>sp(t)&&C(t).level<=3&&canSpecial(s,f.side,t)));if(uid===undefined)return false;const l=locate(s,uid);if(l?.side===f.side&&l.zone==='hand'&&sp(l.c)&&C(l.c).level<=3&&canSpecial(s,f.side,l.c)&&p.slots.some(t=>sp(t)&&live(s,t))&&capacity(s,f.side)){summon(s,f.side,uid,'def',{noEffectsUntil:s.turn});f.onmyojiApplied=true;}}}
  else {const t=get();if(t){if(k==='breakCharm'){boost(s,t,'atk',500);f.onmyojiApplied=true;const n=get('noble'),e=get('enemy',false);if(n&&live(s,n)&&e)queueDestroy(s,[e.uid],'effect',f.side);}else if(k==='starGuard'){if(s.attack?.id===a.attack&&s.attack.t===t.uid){boost(s,t,'def',500,a.attack);const n=get('noble');if(n&&live(s,n)&&!H.positionLocked(s,t))t.mode='def';}}else if(k==='shingen')boost(s,t,'atk',500);else if(k==='honda'){if(live(s,t))boost(s,t,'def',400);}else if(k==='sanada'){if(live(s,t))boost(s,t,'atk',400);}else if(k==='yoshitsune')boost(s,t,'atk',-400);else throw Error('Unknown Onmyoji effect '+k);}}
  return true;
 }
 function onMove(s,l,c){s.jpVersions=s.jpVersions||{};s.jpVersions[c.uid]=(s.jpVersions[c.uid]||0)+1;}
 function onSummon(s,side,c,normal){if(cards[c.id]&&sp(c)&&face(c))ev(s,{kind:'worldSummon',side,uid:c.uid,entity:c.entity,normal:!!normal});}
 function beforeActivate(s,a){if(a.code==='ONM_seekNoble'){const c=locate(s,a.args.reveal)?.c;if(c)H.log(s,'公開手牌'+C(c).name+'。',c.id);}if(a.code==='ONM_shingen'){const c=locate(s,a.uid)?.c;if(c)c.noDirectUntil=s.turn;}}
 function beforeResolve(s,f){if(!/^JP24-S0[1-7]$/.test(f.id))return;const p=s.players[f.side],t=locate(s,f.args?.target),h=locate(s,f.args?.host),src=locate(s,f.uid);const v={
 'JP24-S01':()=>!!src,
 'JP24-S02':()=>p.deck.some(c=>['JP24-S01','JP24-S03'].includes(c.id)),
 'JP24-S03':()=>p.deck.some(c=>sp(c)&&C(c).level<=4),
 'JP24-S04':()=>active(p.field)&&capacity(s,f.side)>0&&p.hand.some(c=>['JP19-M01','JP19-M04','JP19-M06','JP19-M07'].includes(c.id)&&canSpecial(s,f.side,c)),
 'JP24-S05':()=>src?.zone==='back'&&active(src.c)&&h?.side===f.side&&h.zone==='slots'&&face(h.c)&&t?.side===1-f.side&&t.zone==='slots'&&face(t.c)&&p.back.includes(null)&&!s.links.some(l=>l.side===f.side)&&t.c.releasedTurn!==s.turn&&s.released?.[t.c.uid]!==s.turn,
 'JP24-S06':()=>t?.side===f.side&&t.zone==='grave',
 'JP24-S07':()=>t?.side===1-f.side&&['back','field'].includes(t.zone)&&face(t.c)};f.onmyojiCommonValid=!!v[f.id]();}
 function afterResolve(s,f){if(f.negated||!C(f.id)?.subtype.includes('spell'))return;if(f.onmyojiApplied||f.onmyojiCommonValid||C(f.id).country!=='JP')ev(s,{kind:'onmSpell',side:f.side});}
 function value(s,c,key){return face(c)?(c.jpNBoosts||[]).filter(b=>b.key===key&&b.turn===s.turn&&(!b.attack||s.attack?.id===b.attack)).reduce((n,b)=>n+b.n,0):0;}
 return {effects,resolve,onMove,onSummon,beforeActivate,beforeResolve,afterResolve,value};
}};root.OnmyojiDeck=api;})(globalThis);