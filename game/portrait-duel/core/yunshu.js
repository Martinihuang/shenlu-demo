(function(root){'use strict';
const node=typeof module!=='undefined',cn=node?require('./cn.js'):root.CNDeck,cards={},deck=[];
const prefix='CN-YUN-';
function card(n,name,copies,level,atk,def,text,subtype='effect_spirit',tags=[]){const id=prefix+n;cards[id]={id,name,country:'CN',hero:'YUN',level,atk,def,subtype,tags,text,playerText:text,quickText:text.split('。')[0],effectCost:level?'無。':undefined,sourceStatus:'LOCAL_PLAYTEST_CANDIDATE'};for(let i=0;i<copies;i++)deck.push(id);}
card('M01','何仙姑',3,1,500,1400,'本卡公開在場且效果有效時，我方其他靈體守備力增加200。多體何仙姑的加成不重複。');
card('M02','山鬼',3,2,900,1000,'出場成功時，可將敵方1體公開攻擊靈體轉為守備。同名卡每回合限用1次。');
card('M03','青鳥',3,2,1000,800,'通常出場成功時，可看牌組最上方最多3張，選其中1張符籙留在牌頂；其餘依原順序置底。不選就全部置底。同名卡每回合限用1次。');
card('M04','湘君',2,3,1400,1200,'本卡公開在場且效果有效，且我方有另一體公開有效的湘夫人時，本卡攻擊力增加300。');
card('M05','湘夫人',2,3,1100,1600,'出場成功時，可將棄牌區1體原始2星以下靈體拿回手牌。同名卡每回合限用1次。');
card('M06','雲中君',2,3,1300,1300,'出場成功時，可抽1張牌，再棄1張手牌。棄牌是效果，無效時不抽不棄。同名卡每回合限用1次。');
card('M07','瑤姬',3,4,1700,1800,'自己主要階段，本卡公開在場時，可將棄牌區1張中國通常符籙拿回手牌；拿回的該張牌本回合不能發動。同名卡每回合限用1次。');
card('M08','共工',1,6,2400,2100,'出場成功時，可將敵方1體公開攻擊靈體轉為守備，並使其守備力降低400直到回合結束。同名卡每回合限用1次。');
card('M09','祝融',1,6,2500,1800,'自己戰鬥階段開始時，可使本卡攻擊力增加300直到回合結束。同名卡每回合限用1次。');
card('M10','女媧',1,8,2600,3000,'出場成功時，可將棄牌區1體原始4星以下靈體拿回手牌；再可選我方另1體公開靈體，使其免於1次效果破壞，直到下次自己準備階段。不免戰鬥破壞。同名卡每回合限用1次。');
// Same-country common cards keep their original IDs, rules and once-per-name limits.
for(const [id,count] of [['CN40-S01',2],['CN40-S03',2],['CN40-S04',1],['CN40-S07',2],['CN40-T02',2]])for(let i=0;i<count;i++)deck.push(id);
card('S01','疏川引流',2,null,null,null,'自己主要階段，將敵方1體公開攻擊靈體轉為守備，並使其守備力降低400直到回合結束。同名卡每回合限用1次。','normal_spell',['talisman']);
card('S02','巫山雲契',2,null,null,null,'自己主要階段，先將手牌另1體靈體洗回牌組作為費用，再從牌組將1體原始4星以下靈體加入手牌。同名卡每回合限用1次；效果無效不退費。','normal_spell',['talisman']);
card('S03','五彩補缺',2,null,null,null,'自己主要階段，將棄牌區1體原始4星以下靈體拿回手牌，成功拿回才回復300生命值。同名卡每回合限用1次。','normal_spell',['talisman']);
card('T01','雲回護身',2,null,null,null,'敵方攻擊我方公開靈體時，使該靈體免於本次戰鬥的1次破壞。戰鬥與傷害照常處理，保護不延續到後續攻擊。同名卡每回合限用1次。','normal_trap');
card('T02','鎮石止瀾',2,null,null,null,'敵方靈體宣告攻擊時，使該攻擊靈體攻擊力降低700直到回合結束；不取消攻擊。同名卡每回合限用1次。','normal_trap');
const supportFiles={S01:'channel',S02:'cloud-pact',S03:'mend',T01:'cloud-guard',T02:'stone-calm'};
for(const [id,file] of Object.entries(supportFiles))cards[prefix+id].art='../assets/yunshu-v1/support/'+file+'.lossless.webp';
function install(H){const {C,sp,face,active,normalSpell,trap,locate,move,draw,used,pick,shuffle}=H;
 const chinese=c=>!!c,low=(c,n=4)=>chinese(c)&&sp(c)&&C(c).level<=n,talisman=c=>chinese(c)&&normalSpell(c)&&C(c).tags?.includes('talisman');
 const valid=(s,uid,side,zone,visible=false)=>{const l=locate(s,uid);return l&&l.side===side&&l.zone===zone&&(!visible||face(l.c))?l.c:null;};
 function effects(s,side,ctx){const p=s.players[side],q=s.players[1-side],own=p.slots.filter(face),enemy=q.slots.filter(face),out=[],main=s.side===side&&['main','main2'].includes(s.phase)&&!ctx;
  const add=(c,code,label,args={},cost=null)=>{if(used(s,side,c)||c.negated||c.noEffectsUntil>=s.turn||c.cnBlockedUntil>=s.turn)return;out.push({kind:'effect',side,uid:c.uid,code:'YUN_'+code,args,cost,key:'effect',label:C(c).name+'：'+label});};
  for(const c of [...p.hand,...p.back].filter(c=>c&&cards[c.id]&&!sp(c))){const back=locate(s,c.uid).zone==='back';if(trap(c)&&(!back||c.setTurn>=s.turn))continue;if(!back&&!p.back.includes(null))continue;
   if(main&&!trap(c)){
    if(c.id===prefix+'S01')for(const t of enemy.filter(t=>t.mode==='atk'&&!H.positionLocked(s,t)))add(c,'channel','轉守並降防',{target:t.uid});
    if(c.id===prefix+'S02'&&p.deck.some(t=>low(t)))for(const t of p.hand.filter(t=>t.uid!==c.uid&&sp(t)))add(c,'search','洗回'+C(t).name+'，尋低星伙伴',{}, {kind:'shuffleHand',uid:t.uid});
    if(c.id===prefix+'S03')for(const t of p.grave.filter(t=>low(t)))add(c,'mend','回收'+C(t).name+'並回復300',{target:t.uid});
   }
   if(ctx?.kind==='attack'&&ctx.side!==side){const t=valid(s,ctx.t,side,'slots',true),attacker=valid(s,ctx.a,1-side,'slots',true);
    if(c.id===prefix+'T01'&&chinese(t))add(c,'guard','保護'+C(t).name,{target:t.uid,attack:ctx.id});
    if(c.id===prefix+'T02'&&attacker)add(c,'calm','攻擊者降攻700',{target:attacker.uid});
   }
  }
  for(const c of own.filter(c=>cards[c.id])){
   if(main&&c.id===prefix+'M07')for(const t of p.grave.filter(talisman))add(c,'recoverSpell','回收'+C(t).name,{target:t.uid});
   if(ctx?.kind==='battleStart'&&ctx.side===side&&c.id===prefix+'M09')add(c,'flame','本回合攻擊力增加300');
   if(ctx?.kind==='cnSummon'&&ctx.side===side&&ctx.uid===c.uid){
    if(c.id===prefix+'M02'||c.id===prefix+'M08')for(const t of enemy.filter(t=>t.mode==='atk'&&!H.positionLocked(s,t)))add(c,c.id===prefix+'M02'?'shift':'channel','轉換'+C(t).name,{target:t.uid});
    if(c.id===prefix+'M03'&&ctx.normal&&p.deck.length)add(c,'bird','看頂3張安排符籙');
    if(c.id===prefix+'M05')for(const t of p.grave.filter(t=>low(t,2)))add(c,'recover','回收'+C(t).name,{target:t.uid});
    if(c.id===prefix+'M06'&&p.deck.length)add(c,'cycle','抽1後棄1');
    if(c.id===prefix+'M10'&&(p.grave.some(t=>low(t))||own.some(t=>t.uid!==c.uid&&chinese(t))))add(c,'nuwa','回收低星與補缺守護');
   }
  }return out;
 }
 function resolve(s,f){if(!f.code.startsWith('YUN_'))return undefined;const p=s.players[f.side],a=f.args,code=f.code.slice(4),choose=(k,list,title,optional=false)=>pick(s,f,k,list,title,optional),target=()=>valid(s,a.target,1-f.side,'slots',true);
  if(code==='shift'||code==='channel'){const t=target();if(t&&t.mode==='atk'&&!H.positionLocked(s,t)){t.mode='def';if(code==='channel'){t.yunDefTurn=s.turn;t.yunDefAmount=(t.yunDefAmount||0)-400;}}}
  else if(code==='search'){const uid=choose('find',p.deck.filter(t=>low(t)),'巫山雲契：選低星伙伴');if(uid===undefined)return false;if(valid(s,uid,f.side,'deck')){move(s,uid,'hand',f.side);shuffle(s,p.deck);}}
  else if(['recover','recoverSpell','mend'].includes(code)){const t=valid(s,a.target,f.side,'grave');if(t){move(s,t.uid,'hand',f.side);if(code==='recoverSpell')valid(s,t.uid,f.side,'hand').cnBlockedUntil=s.turn;if(code==='mend')p.lp+=300;}}
  else if(code==='bird'){const top=p.deck.slice(0,3),uid=choose('top',top.filter(talisman),'青鳥：選符籙留頂，或全置底',true);if(uid===undefined)return false;const list=p.deck.splice(0,top.length),selected=list.find(t=>t.uid===uid);if(selected)p.deck.unshift(selected);p.deck.push(...list.filter(t=>t!==selected));}
  else if(code==='cycle'){if(!f.step){draw(s,f.side);f.step=1;if(s.winner!==null)return true;}const uid=choose('discard',p.hand,'雲中君：抽牌後棄1張');if(uid===undefined)return false;if(valid(s,uid,f.side,'hand'))move(s,uid,'grave');}
  else if(code==='flame'){const t=valid(s,f.uid,f.side,'slots',true);if(t){t.yunAtkTurn=s.turn;t.yunAtkAmount=(t.yunAtkAmount||0)+300;}}
  else if(code==='calm'){const t=target();if(t){t.yunAtkTurn=s.turn;t.yunAtkAmount=(t.yunAtkAmount||0)-700;}}
  else if(code==='guard'){const t=valid(s,a.target,f.side,'slots',true);if(t&&s.attack?.id===a.attack)t.yunAttackWard=a.attack;}
  else if(code==='nuwa'){
   if(!f.step){const uid=choose('recover',p.grave.filter(t=>low(t)),'女媧：可回收低星伙伴',true);if(uid===undefined)return false;if(valid(s,uid,f.side,'grave'))move(s,uid,'hand',f.side);f.step=1;}
   const uid=choose('ward',p.slots.filter(t=>face(t)&&chinese(t)&&t.uid!==f.uid),'女媧：可保護另一伙伴免1次效果破壞',true);if(uid===undefined)return false;const t=valid(s,uid,f.side,'slots',true);if(t)t.yunEffectWard=s.turn+(s.side===f.side?2:1);
  }else throw Error('Unknown Yunshu effect '+code);
  return true;
 }
 function value(s,c,key){const l=locate(s,c.uid);if(l?.zone!=='slots'||!face(c))return 0;let n=0;
  if(key==='def'&&chinese(c)&&s.players[l.side].slots.some(t=>t?.uid!==c.uid&&active(t)&&t.id===prefix+'M01'))n+=200;
  if(key==='atk'&&c.id===prefix+'M04'&&active(c)&&s.players[l.side].slots.some(t=>active(t)&&t.id===prefix+'M05'))n+=300;
  if(key==='atk'&&c.yunAtkTurn===s.turn)n+=c.yunAtkAmount||0;if(key==='def'&&c.yunDefTurn===s.turn)n+=c.yunDefAmount||0;return n;
 }
 function preventDestroy(s,l,reason){if(!face(l.c))return false;if(reason==='battle'&&l.c.yunAttackWard===s.attack?.id&&s.attack){delete l.c.yunAttackWard;return true;}if(reason==='effect'&&l.c.yunEffectWard>s.turn){delete l.c.yunEffectWard;return true;}return false;}
 function endTurn(s){for(const p of s.players)for(const c of p.slots.filter(Boolean)){delete c.yunAtkTurn;delete c.yunAtkAmount;delete c.yunDefTurn;delete c.yunDefAmount;delete c.yunAttackWard;}}
 return {effects,resolve,value,preventDestroy,endTurn};
}
const api={cards,deck,install};if(node)module.exports=api;else root.YunshuDeck=api;
})(globalThis);
