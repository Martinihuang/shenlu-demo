(function(root){
'use strict';
const D=typeof module!=='undefined'?require('./data.js'):root.TW09Data;
const OCG=typeof module!=='undefined'?require('./ocg-rules.js'):root.OCGDMRules;
const ocg=s=>s?.config?.ruleSet==='ocg-dm';
const clone=x=>JSON.parse(JSON.stringify(x)),C=x=>{const c=D.cards[typeof x==='string'?x:x.id]||((x?.aiUnknown||x==='AI_UNKNOWN'||x?.id==='AI_UNKNOWN')?aiUnknown:undefined);return x?.dmMessage?{...c,subtype:'normal_spirit',level:1,atk:0,def:0,race:'Fiend',attribute:'DARK'}:c;},sp=x=>!!x&&/spirit|fusion|synchro/.test(C(x).subtype),tw=x=>!!x&&sp(x),extra=x=>!!x&&/fusion|synchro/.test(C(x).subtype),normal=x=>!!x&&C(x).subtype==='normal_spirit',field=x=>!!x&&C(x).subtype==='field_spell',normalSpell=x=>!!x&&C(x).subtype==='normal_spell',trap=x=>!!x&&C(x).subtype.includes('trap'),face=x=>!!x&&!x.hidden,active=x=>face(x)&&!x.negated,opp=s=>1-s;
function rng(s){if(s.aiPreviewContext)s.aiPreviewContext.unknown('random');let x=s.seed;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/4294967296;}
function shuffle(s,a){if(s.aiPreviewContext){const ctx=s.aiPreviewContext;if(!ctx.decks.has(a))ctx.unknown('random-shuffle');const raw=ctx.raw.get(a);raw.sort((x,y)=>x.uid.localeCompare(y.uid));return a;}for(let i=a.length-1;i>0;i--){let j=Math.floor(rng(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let mods=[];
function emitHook(key,...args){for(const m of mods)m[key]?.(...args);}
function filterActions(s,side,a){for(const m of mods)if(m.filter)a=m.filter(s,side,a);return a;}
function create(seed=Date.now(),options={}){
 if(options.ruleSet===undefined&&([options.country,options.enemy].some(x=>typeof x==='string'&&x.startsWith('DM-'))||[options.playerRecipe,options.enemyRecipe].some(r=>(Array.isArray(r)?r:r?.main||[]).some(id=>typeof id==='string'&&id.startsWith('DM-')))))options={...options,ruleSet:'ocg-dm'};
 if(options.ruleSet==='ocg-dm'){if(!OCG)throw Error('OCG rules module must load before engine');options={...options,lp:8000,enemyLP:8000};}
 D.configure(options.country||'TW',options.enemy|| ({TW:'JP',JP:'TW',CN:'KR',KR:'CN',YUN:'KR'}[options.country||'TW']),options.lp??6000,options.enemyLP??options.lp??6000,options);
 if(options.ruleSet==='ocg-dm')D.policy={...D.policy,playerOpeningHand:5,enemyOpeningHand:5,highDefSupportUses:0};
 const s={version:2,stageId:'TW09',run:String(seed)+'-'+Date.now(),seed:seed>>>0||1,serial:0,turn:1,side:0,phase:'draw',normalUsed:false,winner:null,log:[],stack:[],window:null,pending:null,resolving:null,jobs:[],uses:{},links:[],ack:0,attack:null,chain:0};
 const playerDeck=shuffle(s,D.playerDeck.map(id=>({id,uid:'c'+(++s.serial),owner:0}))),enemyReserve=D.enemyDeck.map(id=>({id,uid:'c'+(++s.serial),owner:1}));if(!options.enemyNoShuffle)shuffle(s,enemyReserve);
 s.players=[
  {lp:D.policy.playerLP,deck:playerDeck,hand:playerDeck.splice(0,D.policy.playerOpeningHand),reserve:[],slots:Array(5).fill(null),back:Array(5).fill(null),field:null,grave:[],banished:[],extra:D.extras[0].map(id=>({id,uid:'c'+(++s.serial),owner:0})),lockUntil:0,spellShield:0},
  {lp:D.policy.enemyLP,deck:enemyReserve,hand:enemyReserve.splice(0,D.policy.enemyOpeningHand),reserve:[],slots:Array(5).fill(null),back:Array(5).fill(null),field:null,grave:[],banished:[],extra:D.extras[1].map(id=>({id,uid:'c'+(++s.serial),owner:1})),lockUntil:0,spellShield:0}
 ];
 s.side=options.first===0||options.first===1?options.first:(rng(s)<.5?0:1);s.stageId='TW09';s.config={...(options.expedition?{expedition:clone(options.expedition),enemyNoShuffle:!!options.enemyNoShuffle}:{}),...(options.ruleSet!==undefined?{ruleSet:options.ruleSet}:{}),country:D.countries[0],enemy:D.countries[1],lp:D.policy.playerLP,enemyLP:D.policy.enemyLP,seed:seed>>>0,playerRecipe:clone(D.recipes[0]),enemyRecipe:clone(D.recipes[1]),...(['mirror','guardian'].includes(options.battleKind)?{battleKind:options.battleKind}:{}),...(options.battleKind==='mirror'?{mirrorBoost:options.mirrorBoost===true,normalEnemyLP:[4000,6000,8000].includes(+options.normalEnemyLP)?+options.normalEnemyLP:D.policy.enemyLP}:{}),...([0,1].includes(options.first)?{first:options.first}:{})};log(s,D.names[s.side]+'先手。雙方起手'+D.policy.playerOpeningHand+'張，'+(ocg(s)?'先手首回合不抽牌。':'正常抽牌。'),null,null,s.side);emitHook('onCreate',s,options);return s;
}
const publicEventSinks=new WeakMap();
const engineerHandSinks=new WeakMap();
function log(s,text,card=null,visual=null,actor=null){s.logSerial=(s.logSerial||0)+1;const eventActor=actor??visual?.side??s.resolving?.side??s.side;s.log.push({eventNo:s.logSerial,turn:s.turn,text,card,actor:eventActor});if(s.log.length>240)s.log.shift();const history=engineerHandSinks.get(s);if(history)history.push({eventNo:s.logSerial,turn:s.turn,side:s.side,phase:s.phase,text,enemyHand:clone(s.players[1].hand)});const sink=publicEventSinks.get(s);if(sink)sink.push({eventNo:s.logSerial,turn:s.turn,text,card,visual,...([0,1].includes(eventActor)?{actor:eventActor}:{}),frame:publicFrame(s)});}
function locate(s,uid){uid=typeof uid==='object'?uid?.uid:uid;if(typeof uid!=='string')return null;for(let side=0;side<2;side++){const p=s.players[side];for(const zone of ['hand','deck','reserve','slots','back','grave','banished','extra']){const i=p[zone].findIndex(c=>c?.uid===uid);if(i>=0)return {side,zone,i,c:aiDeckCard(s,p[zone],i)};}if(p.field?.uid===uid)return {side,zone:'field',i:0,c:p.field};}return null;}
function remove(s,uid){const l=locate(s,uid);if(!l)return null;if(s.aiPreviewContext&&(l.c.aiUnknown||l.c.id==='AI_UNKNOWN'))s.aiPreviewContext.unknown('hidden-card-removal');emitHook('onRemove',s,l);if(l.zone==='field')s.players[l.side].field=null;else if(['slots','back'].includes(l.zone))s.players[l.side][l.zone][l.i]=null;else aiDeckRemove(s,s.players[l.side][l.zone],l.i);return l.c;}
function positionLocked(s,c){return !!c?.positionLocked||mods.some(m=>m.positionLocked?.(s,c));}
function clean(c){return {id:c.id,uid:c.uid,owner:c.owner,proper:!!c.proper,...(c.cnBlockedUntil?{cnBlockedUntil:c.cnBlockedUntil}:{})};}
function move(s,uid,zone,side){const l=locate(s,uid);if(!l)return null;if(s.aiPreviewContext&&(l.c.aiUnknown||l.c.id==='AI_UNKNOWN'))s.aiPreviewContext.unknown('hidden-card-transition');const c=remove(s,uid),p=s.players[side??c.owner];if(['hand','deck'].includes(zone)&&extra(c))zone='extra';const moved=clean(c);p[zone].push(moved);emitHook('onMove',s,l,moved,zone);return c;}
function alive(s){return s.winner===null;}
function finish(s,w,why,actor=null){if(!alive(s))return;s.winner=w;s.phase='result';s.jobs=[];s.stack=[];s.window=null;s.pending=null;s.resolving=null;s.attack=null;log(s,why,null,null,actor);}
function checkLP(s){emitHook('beforeCheckLP',s);if(s.players.every(p=>p.lp<=0))finish(s,2,'雙方生命值歸零，本局和局。');else for(let i=0;i<2;i++)if(s.players[i].lp<=0)finish(s,1-i,D.names[i]+'生命值歸零。',i);}
function draw(s,side){if(s.aiPreviewContext&&s.players[side].deck.length)s.aiPreviewContext.unknown('draw');const p=s.players[side];if(!p.deck.length&&side===1&&(s.expedition?.number===8||s.nether?.bossBody)){log(s,'敵方牌組已空，略過抽牌；仍須擊敗真身。');return;}if(!p.deck.length){finish(s,1-side,D.names[side]+'需要抽牌但牌組已空。',side);return;}p.hand.push(remove(s,p.deck[0].uid));log(s,D.names[side]+'抽1張牌。',null,null,side);}
function used(s,side,c,key='effect',perCard=false){return !!s.uses[[side,perCard?c.uid:c.id,key,s.turn].join(':')];}
function use(s,side,c,key='effect',perCard=false){s.uses[[side,perCard?c.uid:c.id,key,s.turn].join(':')]=true;}
function fieldEffects(s,side){return !mods.some(m=>m.fieldEffects?.(s,side)===false);}
function validField(s,side,id){const f=s.players[side].field;return active(f)&&(!id||f.id===id&&fieldEffects(s,side));}
function capacity(s,side){return s.players[side].slots.filter(x=>!x).length;}
function canSpecial(s,side,c,source){return !mods.some(m=>m.canSummon?.(s,side,c,false,source)===false)&&!(s.players[side].cnHighLock>=s.turn&&C(c).level>=7)&&!(s.players[side].krNoSpecialUntil>=s.turn)&&!(s.players[side].krNoSpecialNames?.[c.id]>=s.turn)&&sp(c)&&(c.id!=='TW43-M09'||source==='TW43-S03')&&(!extra(c)||c.proper)&&(!(s.players[side].lockUntil>=s.turn)||C(c).country===(s.players[side].lockCountry||'TW'));}
function material(s,c){return !!c&&!mods.some(m=>m.canMaterial?.(s,c)===false)&&!c.noMaterial&&!(c.noMaterialUntil>=s.turn)&&!s.links.some(l=>l.host===c.uid)&&!s.players.some(p=>p.back.some(b=>active(b)&&b.id==='JP24-T03'&&b.target===c.uid));}
function tributeNeed(s,side,c,set=false){if(!set&&c.id==='JP19-M07'&&validField(s,side))return 1;if(!set&&['NO-B-M08','NO-B-M09'].includes(c.id)&&s.players[side].slots.filter(Boolean).length>=2)return 1;if(!set&&['VA-M08','VA-M09','VA-N08'].includes(c.id)&&s.players[1-side].slots.filter(Boolean).length>s.players[side].slots.filter(Boolean).length)return 1;return c.id==='TW-J-M13'?3:!set&&C(c).level===5&&validField(s,side,'TW43-S04')?0:C(c).level>=7?2:C(c).level>=5?1:0;}
function pairs(a,n){if(!n)return [[]];if(n===1)return a.map(x=>[x]);return a.flatMap((x,i)=>pairs(a.slice(i+1),n-1).map(rest=>[x,...rest]));}
function summon(s,side,uid,mode='def',flags={},source){const l=locate(s,uid);if(!l||!capacity(s,side)||mods.some(m=>m.canSummon?.(s,side,l.c,false,source)===false))return null;const p=s.players[side],c=remove(s,uid);const u={...clean(c),hidden:false,mode,entered:s.turn,attacks:0,changed:0,entity:++s.serial,...flags};p.slots[p.slots.indexOf(null)]=u;log(s,D.names[side]+'特殊召喚'+C(c).name+'。',c.id,null,side);s.jobs.unshift({kind:'event',event:{kind:'special',side,uid:u.uid}});emitHook('onSummon',s,side,u,false);return u;}
function summonBatch(s,side,uids,mode='def',flags={}){const p=s.players[side],deployed=[];emitHook('beforeSummonBatch',s,side);try{for(const uid of [...new Set(uids.filter(Boolean))]){const l=locate(s,uid);if(!l||!capacity(s,side)||!canSpecial(s,side,l.c))continue;const c=remove(s,uid),u={...clean(c),hidden:false,mode,entered:s.turn,attacks:0,changed:0,entity:++s.serial,...flags};p.slots[p.slots.indexOf(null)]=u;deployed.push(u);emitHook('onSummon',s,side,u,false);log(s,D.names[side]+'特殊召喚'+C(c).name+'。',c.id,null,side);}}finally{emitHook('afterSummonBatch',s,side);}if(deployed.length)s.jobs.unshift({kind:'event',event:{kind:'special',side,uids:deployed.map(c=>c.uid),batch:true}});return deployed;}
function value(s,c,key='atk'){if(!c)return 0;if(c.zero&&key==='atk')return 0;let n=C(c)[key]||0;if(key==='atk'){if(s.links.some(l=>l.host===c.uid))n+=500;if(s.attack?.a===c.uid)n-=s.attack.reduction||0;}for(const m of mods)n+=m.value?.(s,c,key)||0;for(const m of mods){const v=m.finalValue?.(s,c,key,n);if(Number.isFinite(v))n=v;}return Math.max(0,n);}
function returnCard(s,uid){const c=move(s,uid,'hand');if(c)log(s,C(c).name+'回到擁有者手牌／額外牌組。',c.id);cleanup(s);return !!c;}
function endLink(s,link){s.links=s.links.filter(l=>l!==link);s.released=s.released||{};s.released[link.attached]=s.turn;const attached=locate(s,link.attached);if(attached&&attached.zone==='back'){const c=remove(s,link.attached),p=s.players[link.original];c.releasedTurn=s.turn;if(capacity(s,link.original)){const u={...clean(c),releasedTurn:s.turn,hidden:false,mode:'def',entered:s.turn,entity:++s.serial,attacks:0};p.slots[p.slots.indexOf(null)]=u;}else p[extra(c)?'extra':'hand'].push({...clean(c),releasedTurn:s.turn});log(s,C(c).name+'解除附屬，返回原控制者。',c.id);}if(locate(s,link.spell))move(s,link.spell,'grave');}
function cleanup(s){for(const l of [...s.links]){const h=locate(s,l.host),a=locate(s,l.attached),b=locate(s,l.spell);if(!h||h.side!==l.side||h.zone!=='slots'||!face(h.c)||!a||a.zone!=='back'||!b||b.zone!=='back'||!active(b.c)||a.c.negated)endLink(s,l);}for(const p of s.players)for(const b of [...p.back])if(b?.id==='JP24-T03'&&!b.hidden){const t=locate(s,b.target);if(!active(b)||!t||t.zone!=='slots'||!face(t.c)||t.side!==b.targetSide)move(s,b.uid,'grave');}emitHook('onCleanup',s);}
function queueDestroy(s,ids,reason,by,after=null){s.jobs.unshift({kind:'destroy',ids:[...new Set(ids)],reason,by:typeof by==='object'?null:by,byMap:typeof by==='object'?by:null,after});}
function ask(s,side,title,options,context){if(s.aiPreviewContext)options=s.aiPreviewContext.raw.get(options)||options;s.pending={side,title,options,context};return false;}
function pick(s,f,key,cards,title,optional=false){if(Object.hasOwn(f.picks,key))return f.picks[key];const opts=cards.map(c=>({label:C(c).name,value:c.uid}));if(optional)opts.push({label:'不使用',value:null});if(!opts.length){f.picks[key]=null;return null;}ask(s,f.side,title,opts,{kind:'resolvePick',key});return undefined;}
function name(s,uid){const l=locate(s,uid);return l?C(l.c).name:'已離場';}
function frame(c,side,code,args={}){return {side,id:c.id,uid:c.uid,code,args,picks:{},step:0};}
function effectChoicesRaw(s,side,context=null){
 const p=s.players[side],q=s.players[1-side],out=[],main=side===s.side&&['main','main2'].includes(s.phase)&&!context,quick=context?.kind!=='damage',space=capacity(s,side),own=p.slots.filter(face),enemy=q.slots.filter(face);
 function add(c,code,label,args={},cost=null,key='effect',perCard=false){const unlimited=code==='field'||code==='continuous'||['TW43-S02','TW43-S08','TW43-S09'].includes(c.id)||c.id==='TW43-T03'&&code==='seal';if((!unlimited&&used(s,side,c,key,perCard))||c.noEffectsUntil>=s.turn||c.negated)return;out.push({kind:'effect',side,uid:c.uid,code,args,cost,key,perCard,label:C(c).name+'：'+label});}
 for(const c of own)if(c.id==='TW43-M06'&&context?.kind==='special'&&context.side===side&&(context.uid===c.uid||context.uids?.includes(c.uid)))for(const t of enemy.filter(t=>t.mode==='atk'))add(c,'tigerGuard','鎮煞：限制'+C(t).name+'攻擊',{target:t.uid,entity:t.entity});
 const discards=exclude=>p.hand.filter(c=>c.uid!==exclude);
 const fieldCards=p.deck.filter(field),legalTw=arr=>arr.filter(c=>tw(c)&&canSpecial(s,side,c));
 const costs=(c,fn)=>discards(c.uid).forEach(cost=>fn({kind:'discard',uid:cost.uid},'（棄'+C(cost).name+'）'));
 for(const c of p.hand){if(sp(c)){
  if(main&&c.id==='TW43-M04'&&fieldCards.length)add(c,'searchField','棄自身搜尋場地',{}, {kind:'discard',uid:c.uid});
  if(main&&c.id==='TW43-M09'&&space+own.length>0)for(const t of own.filter(x=>x.mode==='atk'&&C(x).level===5&&material(s,x)))add(c,'zheng','解放'+C(t).name+'程序出場',{tribute:t.uid},{kind:'tribute',uid:t.uid},'summon');
  if((main||quick)&&c.id==='TW43-M03'&&space&&validField(s,side)&&q.slots.some(Boolean))for(const a of own.filter(t=>t.mode==='atk'))for(const b of q.slots.filter(Boolean))add(c,'liao','招援；回手'+C(a).name+'、破壞'+(b.hidden?'敵方隱藏靈體':C(b).name),{own:a.uid,target:b.uid});
  if(main&&space&&validField(s,side)&&c.id==='JP19-M01'){const g=p.grave.filter(normalSpell);for(const pair of pairs(g,2).filter(a=>a[0].id!==a[1].id))add(c,'selfHigh','除外兩張不同名通常行法出場',{}, {kind:'banish',uids:pair.map(x=>x.uid)},'summon');}
  if(main&&space&&validField(s,side)&&c.id==='JP19-M06'&&own.some(x=>C(x).level<=4))for(const cost of p.hand.filter(normalSpell))add(c,'selfHigh','棄'+C(cost).name+'出場',{}, {kind:'discard',uid:cost.uid},'summon');
  continue;
 }
 }
 const sources=[...p.hand.map(c=>({c,zone:'hand'})),...p.back.filter(Boolean).map(c=>({c,zone:'back'}))];
 for(const {c,zone}of sources){if(sp(c)||c.attached)continue;const st=C(c).subtype,isTrap=trap(c),isQuick=st==='quickplay_spell',isField=field(c);
  if(zone==='back'&&!c.hidden)continue;
  if(zone==='back'&&(isTrap||isQuick)&&c.setTurn>=s.turn)continue;
  if(isTrap&&zone==='hand')continue;
  if(!isTrap&&!isQuick&&!main)continue;
  if(zone==='hand'&&!isField&&!p.back.includes(null))continue;
  if(isField&&main){add(c,'field','發動場地');continue;}
  if(c.id==='TW43-S01'&&main)add(c,'continuous','發動永續行法');
  if(['TW43-S02','JP24-S02'].includes(c.id)&&main&&p.deck.some(t=>c.id==='TW43-S02'?field(t):['JP24-S01','JP24-S03'].includes(t.id)))add(c,'search','搜尋牌組');
  if(c.id==='TW43-S03'&&main&&p.deck.some(t=>sp(t)&&!extra(t)&&C(t).level<=7))add(c,'four','搜尋並依場地追加');
  if(c.id==='TW43-S07'&&main&&p.deck.some(t=>!sp(t)))add(c,'burySpell','從牌組將行法／伏兵送入棄牌區');
  if(c.id==='TW43-S08'&&context?.kind==='special'&&context.side!==side&&fieldCards.length&&(zone==='back'||side===s.side))add(c,'emergencyField','對方特召後發動牌組場地');
  if(c.id==='TW43-S09'&&main&&q.slots.some(Boolean))add(c,'wipe','破壞敵方全部靈體');
  if(c.id==='TW43-S10'&&main&&p.lp>1000&&space&&p.extra.some(t=>C(t).level<=6)&&!(p.lockUntil>=s.turn))add(c,'fusion','付1000LP合契出場',{}, {kind:'lp',amount:1000});
  if(c.id==='TW43-T01'&&(main||quick))add(c,'continuous','發動巡境守陣');
  if(c.id==='TW43-T02'&&(main||quick)&&validField(s,side)&&space&&[...p.hand,...p.deck].some(t=>canSpecial(s,side,t)))add(c,'rally','送入棄牌區場地並招援',{}, {kind:'field',uid:p.field.uid});
  if(c.id==='TW43-T03'&&context?.kind==='attack'&&(context.side!==side||context.t)){const t=locate(s,context.side===side?context.t:context.a);if(t?.zone==='slots')add(c,'seal','使交戰敵方武0、效果無效',{target:t.c.uid});}
  if(c.id==='JP24-S03'&&main)for(const cost of p.hand.filter(sp))if(p.deck.some(t=>sp(t)&&C(t).level<=4)||C(cost).level<=4)add(c,'contract','洗回'+C(cost).name+'，搜尋低星',{}, {kind:'shuffleHand',uid:cost.uid});
  if(c.id==='JP24-S04'&&main&&validField(s,side)&&p.hand.some(t=>['JP19-M01','JP19-M04','JP19-M06','JP19-M07'].includes(t.id)))for(const t of own.filter(t=>C(t).level<=4&&material(s,t)))add(c,'sunGate','解放'+C(t).name+'招援高星',{}, {kind:'tribute',uid:t.uid});
  if(c.id==='JP24-S05'&&main&&!s.links.some(l=>l.side===side)&&p.back.filter(x=>!x).length+(zone==='back'?1:0)>=2)for(const h of own.filter(t=>t.mode==='atk'&&C(t).level>=7))for(const t of enemy.filter(t=>t.mode==='atk'&&C(t).level<=5&&t.releasedTurn!==s.turn&&s.released?.[t.uid]!==s.turn))costs(c,(cost,label)=>add(c,'absorb','大蛇吸收'+C(t).name+label,{host:h.uid,target:t.uid},cost));
  if(c.id==='JP24-S06'&&main)for(const t of p.grave.filter(t=>sp(t)&&C(t).level<=4))costs(c,(cost,label)=>add(c,'recoverLow','回收'+C(t).name+label,{target:t.uid},cost));
  if(c.id==='JP24-S07'&&main)for(const t of [...q.back,q.field].filter(face))costs(c,(cost,label)=>add(c,'breakSpell','破壞'+C(t).name+label,{target:t.uid},cost));
  if(c.id==='JP24-T01'&&context?.kind==='attack'&&context.side!==side&&context.t)add(c,'reduce','本次戰鬥攻擊者降600',{target:context.a,amount:600});
  if(c.id==='JP24-T02'&&context?.kind==='effect'&&context.frame.side!==side&&['wipe','liao','synchroWipe'].includes(context.frame.code))for(const t of own)for(const cost of p.grave.filter(normalSpell))add(c,'paper','本鏈保護'+C(t).name,{target:t.uid},{kind:'banish',uids:[cost.uid]});
  if(c.id==='JP24-T03'&&(main||quick)&&!p.back.some(b=>active(b)&&b.id===c.id))for(const t of enemy.filter(t=>C(t).level<=5))costs(c,(cost,label)=>add(c,'rope','禁止'+C(t).name+'作祭品／素材'+label,{target:t.uid},cost));
  if(c.id==='JP24-T04'&&context?.kind==='effect'&&context.frame.side!==side&&isTargetedSpirit(s,context.frame,side)&&s.links.some(l=>l.side===side))add(c,'negate','解除蛇影連結，無效此效果',{frameUid:context.frame.activation},{kind:'unlink',side});
  if(c.id==='JP24-T05'&&context?.kind==='attack'&&context.side!==side&&context.t){const target=locate(s,context.t);if(target&&face(target.c))for(const t of own.filter(t=>t.id==='JP19-M02'&&t.uid!==context.t))add(c,'lanternGuard','提燈回手，無效攻擊',{target:context.t,lantern:t.uid});}
 }
 for(const c of own){
  if(main&&c.id==='TW43-M05'&&space&&legalTw(p.hand).length)for(const t of [...p.hand,...p.deck,p.field].filter(field))add(c,'windSummon','送入棄牌區'+C(t).name+'，手牌招援',{}, {kind:'send',uid:t.uid},'summon');
  if(main&&c.id==='TW43-M07'&&p.deck.some(t=>field(t)||['TW43-S01','TW43-T01','TW43-T02'].includes(t.id)))add(c,'zhuSearch','搜尋場地／固定號令集合');
  if(main&&c.id==='TW43-M08'){const targets=own.filter(t=>t.uid!==c.uid&&tw(t));for(const ts of [...pairs(targets,1),...pairs(targets,2)])costs(c,(cost,label)=>add(c,'bless','護佑'+ts.map(C).map(c=>c.name).join('、')+label,{targets:ts.map(t=>t.uid)},cost,'bless'));}
  if(main&&c.id==='TW43-M12')for(const t of p.grave.filter(field))add(c,'tower','解放自身回收'+C(t).name,{target:t.uid},{kind:'tribute',uid:c.uid});
  if(main&&c.id==='JP19-M01')for(const t of [...q.back,q.field].filter(face))costs(c,(cost,label)=>add(c,'sunBounce','將'+C(t).name+'回手'+label,{target:t.uid},cost));
  if(main&&c.id==='JP19-M03')for(const t of enemy.filter(t=>t.mode==='atk'))add(c,'tengu','令'+C(t).name+'轉守備',{target:t.uid});
  if(main&&c.id==='JP19-M05'&&material(s,c)&&p.deck.some(t=>t.id==='JP19-M04'))costs(c,(cost,label)=>add(c,'egg','解放卵招援大蛇'+label,{}, {kind:'egg',uid:c.uid,discard:cost.uid}));
  if(main&&c.id==='JP19-M06'&&p.deck.some(t=>['JP24-S03','JP24-T02'].includes(t.id)))for(const cost of p.grave.filter(normalSpell))add(c,'seimeiSearch','除外'+C(cost).name+'搜尋',{},{kind:'banish',uids:[cost.uid]});
  if(context?.kind==='attack'&&context.side!==side){
   if(c.id==='TW43-M01'&&!context.t)add(c,'redirect','承接直接攻擊',{target:c.uid},null,'redirect',true);
   if(c.id==='TW43-M03')add(c,'liaoCancel','回手自身，無效攻擊',{},null,'cancel');
   if(c.id==='TW43-M04')costs(c,(cost,label)=>add(c,'reduce','攻擊者本次降800'+label,{target:context.a,amount:800},cost));
  }
  if(context?.kind==='effect'&&context.frame.side!==side){const f=context.frame;
   if(c.id==='TW43-M02'&&!trap({id:f.id})&&p.field?.uid===f.args.target)costs(c,(cost,label)=>add(c,'negate','保場地；無效效果'+label,{frameUid:f.activation},cost));
   if(c.id==='TW43-M05'&&!sp({id:f.id})&&isTargetedSpirit(s,f,side,c.uid))costs(c,(cost,label)=>add(c,'negate','保護其他協作；無效效果'+label,{frameUid:f.activation},cost,'negate'));
  }
 }
 if(main&&p.field?.id==='TW43-S05'&&active(p.field)&&space)costs(p.field,(cost,label)=>{if(p.hand.some(t=>t.uid!==cost.uid&&sp(t)&&C(t).level===5&&canSpecial(s,side,t)))add(p.field,'village','手牌五星招援'+label,{},cost);});
 if(context?.kind==='battleStart'&&validField(s,side)&&space)for(const c of p.back.filter(c=>active(c)&&c.id==='TW43-S01')){if(p.hand.some(t=>canSpecial(s,side,t)))add(c,'escort','鎖定手牌來源',{source:'hand'},null);for(const t of p.grave.filter(t=>canSpecial(s,side,t)))add(c,'escort','鎖定棄牌區 '+C(t).name,{source:'grave',target:t.uid},null);}
 for(const c of p.back.filter(c=>active(c)&&c.id==='TW43-T01'))if((main||quick)&&validField(s,side))for(const t of own.filter(t=>t.mode==='atk'))add(c,'shield','暫除外'+C(t).name+'保護本回合公開行法／伏兵',{}, {kind:'temporary',uid:t.uid},'shield',true);
 if(main)for(const c of p.grave.filter(c=>c.id==='TW43-T03'))if(p.deck.some(t=>sp(t)&&C(t).level>=5&&!extra(t)))add(c,'sealGrave','除外自身，牌組送入棄牌區後可回收',{},{kind:'banish',uids:[c.uid]},'grave');
 for(const m of mods)out.push(...(m.effects?.(s,side,context)||[]));
 return out.filter(a=>{const source=locate(s,a.uid)?.c||a.card;if(ocg(s)&&context&&!context.kind?.startsWith('world')&&source&&sp(source)&&!source.id.startsWith('DM-')&&a.speed===undefined&&!a.trigger)a.speed=2;if(ocg(s)&&!OCG.legalResponse(s,a,C,locate,context))return false;const c=locate(s,a.uid)?.c||a.card;return !mods.some(m=>m.canEffect?.(s,c)===false)&&costAllowed(s,a.cost);});
}
function isTargetedSpirit(s,f,side,exclude){return [f.args.target,...(f.args.targets||[])].filter(Boolean).some(uid=>{const l=locate(s,uid);return l&&l.side===side&&l.zone==='slots'&&face(l.c)&&l.c.uid!==exclude&&(exclude?tw(l.c):true);});}
function costAllowed(s,cost){if(!cost)return true;const link=cost.kind==='unlink'?s.links.find(l=>l.side===cost.side):null;const ids=[cost.uid,cost.discard,...(cost.uids||[]),...(link?[link.attached,link.spell]:[])].filter(Boolean);return ids.every(uid=>{const c=locate(s,uid)?.c;return c&&!mods.some(m=>m.canPay?.(s,c)===false);})&&(cost.costs||[]).every(c=>costAllowed(s,c));}
function pay(s,side,cost){if(!cost)return;if(!costAllowed(s,cost))throw Error('費用受持續限制，不能支付');if(mods.some(m=>m.payCost?.(s,side,cost)===true))return;const p=s.players[side];switch(cost.kind){case'multi':cost.costs.forEach(c=>pay(s,side,c));break;case'return':returnCard(s,cost.uid);break;case'lp':p.lp-=cost.amount;break;case'discard':case'tribute':case'send':case'field':move(s,cost.uid,'grave');break;case'banish':cost.uids.forEach(uid=>move(s,uid,'banished'));break;case'shuffleGrave':case'shuffleHand':move(s,cost.uid,'deck',side);shuffle(s,p.deck);break;case'egg':move(s,cost.uid,'grave');move(s,cost.discard,'grave');break;case'unlink':{const l=s.links.find(l=>l.side===side);if(l)endLink(s,l);break;}case'temporary':{const mode=locate(s,cost.uid)?.c.mode;const c=move(s,cost.uid,'banished',side);if(c){const b=p.banished.find(t=>t.uid===c.uid);b.returnAt=s.turn;b.returnSide=side;b.returnMode=mode;}break;}}cleanup(s);}
function publicCost(s,cost){if(!cost)return '';const n=uid=>name(s,uid);switch(cost.kind){case'tjReturn':return '將'+n(cost.uid)+'回持有者手牌';case'tjBottom':return '將'+n(cost.uid)+'放回牌組底';case'lp':return '支付'+cost.amount+'LP';case'discard':return '棄'+n(cost.uid);case'tribute':return '解放'+n(cost.uid);case'send':case'field':return '送入棄牌區'+n(cost.uid);case'banish':return '除外'+cost.uids.map(n).join('、');case'shuffleGrave':return '將棄牌區的'+n(cost.uid)+'洗回牌組';case'shuffleHand':return '將一張符合條件的手牌洗回牌組（不公開暗牌）';case'egg':return '解放'+n(cost.uid)+'並棄'+n(cost.discard);case'temporary':return '暫除外'+n(cost.uid);case'unlink':return '解除蛇影連結並歸還附卡';default:return '支付卡面成本';}}
function activate(s,a,collect=false){const l=locate(s,a.uid),c=l?.c||a.card;if(!c)throw Error('來源已離場');const f=frame(c,a.side,a.code,a.args);f.activation=++s.serial;if(ocg(s)){f.speed=OCG.speed(C(c),a);f.trigger=!!a.trigger;f.mandatory=!!a.mandatory;}f.snapshot=clone(c);f.origin=l?.zone;f.persistent=!!a.persistent||['continuous','rope','absorb'].includes(a.code);f.sourceMustLive=!!a.sourceMustLive||['village','escort','shield'].includes(a.code);f.perCard=a.perCard;f.key=a.key;const paidText=publicCost(s,a.cost);emitHook('beforeActivate',s,a);use(s,a.side,c,a.key||'effect',a.perCard);s.moveCause={side:a.side,kind:'cost',cardId:c.id};try{pay(s,a.side,a.cost);}finally{delete s.moveCause;}if(l&&!sp(c)&&['hand','back'].includes(l.zone)){
 if(f.persistent){const current=locate(s,c.uid);if(current?.zone==='hand'){const card=remove(s,c.uid),p=s.players[a.side];p.back[p.back.indexOf(null)]={...card,hidden:false,entity:++s.serial};}else if(current)current.c.hidden=false;}
 else if(a.code==='field'){/* move to field only at resolution */}
 else if(ocg(s)){const current=locate(s,c.uid);if(current?.zone==='hand'){const card=remove(s,c.uid),p=s.players[a.side],slot=p.back.indexOf(null);if(slot<0)throw Error('No spell/trap zone for activation');p.back[slot]={...card,hidden:false,entity:++s.serial};}else if(current)current.c.hidden=false;s.ocgChainCards=s.ocgChainCards||[];const placed=locate(s,c.uid);s.ocgChainCards.push({uid:c.uid,entity:placed?.c.entity});}
 else if(locate(s,c.uid))move(s,c.uid,'grave');
 }
 if(['tengu','sunBounce'].includes(a.code)){const source=locate(s,c.uid);if(source)source.c.noDirectUntil=s.turn;}

 log(s,D.names[a.side]+'發動'+C(c).name+(a.cost?'；'+paidText+'。':'。'),c.id,{kind:'effect',source:c.id,side:a.side,stage:'activation',sourceZone:f.origin,fromHidden:!!f.snapshot.hidden},a.side);
 if(['zheng','selfHigh'].includes(a.code)){s.resolving=f;drain(s);return;}
 s.worldChainPending=true;s.stack.push(f);s.chain++;if(!collect)s.window={kind:'effect',frame:f,side:1-a.side,passes:0};
}
function syncAttackTarget(s){const b=s.attack;if(b&&b.targetUid!==b.t){b.targetUid=b.t;b.targetEntity=locate(s,b.t)?.c.entity;}}
function resolvePresented(s,f){
 const sink=publicEventSinks.get(s);if(!sink)return resolve(s,f);
 const stats=()=>s.players.flatMap((p,side)=>p.slots.flatMap((c,slot)=>c&&!c.hidden?[{uid:c.uid,id:c.id,side,slot,atk:value(s,c,'atk'),def:value(s,c,'def'),mode:c.mode,ward:JSON.stringify(c.ward),negated:!!c.negated}]:[]));
 const before=stats(),start=sink.length,done=resolve(s,f),changes=[];
 for(const c of stats()){const old=before.find(b=>b.uid===c.uid);if(!old)continue;const parts=[];
  if(old.atk!==c.atk)parts.push('攻擊力 '+old.atk+' → '+c.atk);
  if(old.def!==c.def)parts.push('防禦力 '+old.def+' → '+c.def);
  if(old.mode!==c.mode)parts.push(c.mode==='def'?'轉為守備':'轉為攻擊');
  if(old.ward!==c.ward&&c.ward)parts.push('獲得破壞保護');
  if(!old.negated&&c.negated)parts.push('效果被無效');
  if(parts.length)changes.push(C(c).name+'：'+parts.join('、'));
 }
 const details=sink.slice(start).filter(e=>!e.visual).map(e=>e.text);
 if(done||changes.length){const result=f.negated?'效果被無效':done?'效果結算完畢':'效果處理中';
  const text='【'+C(f.id).name+'】'+result+(details.length||changes.length?'\n'+[...new Set([...details,...changes])].join('\n'):'');
  log(s,text,f.id,{kind:'effect',source:f.id,side:f.side,stage:'resolution'},f.side);
 }
 return done;
}
function resolve(s,f){const p=s.players[f.side],q=s.players[1-f.side],src=locate(s,f.uid),args=f.args;const get=uid=>locate(s,uid);const target=uid=>{const l=get(uid);return l?.c;};const select=(key,list,title,optional=false)=>pick(s,f,key,list,title,optional);const deploy=(uid,flags={})=>{const l=get(uid),source=f.id==='TW43-S03'&&f.code==='four'?'TW43-S03':undefined;return l&&canSpecial(s,f.side,l.c,source)?summon(s,f.side,uid,'def',flags,source):null;};
 if(src?.zone==='field'&&!fieldEffects(s,src.side)&&f.code!=='field'&&f.code!=='emergencyField'){log(s,C(f.id).name+'受咒林影響，場地效果暫停。');return true;}
 if(f.negated){log(s,C(f.id).name+'效果被無效；成本與使用次數不退。');if(!ocg(s)&&f.persistent&&src&&f.code!=='CN_altarSwap')move(s,f.uid,'grave');return true;}
 if(f.sourceMustLive&&(!src||!active(src.c))){log(s,C(f.id).name+'來源失效，不繼續處理。');return true;}
 if(!f.worldResolutionStarted){f.worldResolutionStarted=true;emitHook('beforeResolve',s,f);}
 for(const m of mods){s.moveCause={side:f.side,kind:'effect',cardId:f.id};let done;try{done=m.resolve?.(s,f);}finally{delete s.moveCause;}if(done!==undefined){if(done){if(C(f.id).subtype.includes('spell')&&!f.negated)s.players[f.side].resolvedSpellTurn=s.turn;emitHook('afterResolve',s,f);syncAttackTarget(s);cleanup(s);checkLP(s);}return done;}}
 switch(f.code){
 case'field':case'emergencyField':{let uid=f.uid;if(f.code==='emergencyField'){uid=select('field',p.deck.filter(field),'選擇發動的場地');if(uid===undefined)return false;}if(uid&&get(uid)){if(p.field)move(s,p.field.uid,'grave');const c=remove(s,uid);p.field={...clean(c),hidden:false,entity:++s.serial};log(s,C(c).name+'成為己方場地。',c.id);}break;}
 case'continuous':if(f.id==='TW43-T01'){const uid=select('field',[...p.hand,...p.grave].filter(field),'可從手牌／棄牌區發動場地',true);if(uid===undefined)return false;if(uid&&src&&active(src.c)&&get(uid)){if(p.field)move(s,p.field.uid,'grave');p.field={...clean(remove(s,uid)),hidden:false,entity:++s.serial};}}break;
 case'searchField':case'search':case'zhuSearch':case'seimeiSearch':{const filter=c=>f.code==='searchField'?field(c):f.code==='zhuSearch'?field(c)||['TW43-S01','TW43-T01','TW43-T02'].includes(c.id):f.code==='seimeiSearch'?['JP24-S03','JP24-T02'].includes(c.id):f.id==='TW43-S02'?field(c):['JP24-S01','JP24-S03'].includes(c.id);const uid=select('search',p.deck.filter(filter),'選擇加入手牌的卡');if(uid===undefined)return false;if(uid&&get(uid)?.zone==='deck'){const c=move(s,uid,'hand',f.side);log(s,'將'+C(c).name+'加入手牌。',c.id);shuffle(s,p.deck);}break;}
 case'four':if(!f.step){const uid=select('search',p.deck.filter(c=>sp(c)&&!extra(c)&&C(c).level<=7),'四方請援：搜尋七星以下靈體');if(uid===undefined)return false;if(!uid||get(uid)?.zone!=='deck')break;const c=move(s,uid,'hand',f.side);log(s,'搜尋'+C(c).name+'成功。',c.id);shuffle(s,p.deck);f.step=1;}if(validField(s,f.side)&&capacity(s,f.side)){const uid=select('tiger',p.deck.filter(c=>sp(c)&&!extra(c)&&C(c).level<=5&&canSpecial(s,f.side,c,'TW43-S03')),'從牌組選擇五星以下靈體',true);if(uid===undefined)return false;if(uid&&get(uid)?.zone==='deck')deploy(uid);}break;
 case'burySpell':{const uid=select('send',p.deck.filter(c=>!sp(c)),'選擇從牌組送入棄牌區的行法／伏兵');if(uid===undefined)return false;if(uid&&get(uid)?.zone==='deck')move(s,uid,'grave');break;}
 case'wipe':case'synchroWipe':queueDestroy(s,q.slots.filter(c=>c&&(f.code==='wipe'||c.mode==='atk')).map(c=>c.uid),'effect',f.side);break;
 case'fusion':{const uid=select('extra',p.extra.filter(c=>C(c).level<=6),'選擇無效果融合體');if(uid===undefined)return false;if(uid&&capacity(s,f.side)&&!(p.lockUntil>=s.turn))summon(s,f.side,uid,'def',{proper:true,noAttackUntil:s.turn,destroyEnd:s.turn,destroyEndBy:f.side});break;}
 case'contract':if(!f.step){const uid=select('search',p.deck.filter(c=>sp(c)&&C(c).level<=4),'約帖請援：搜尋低星靈體');if(uid===undefined)return false;if(!uid||get(uid)?.zone!=='deck')break;move(s,uid,'hand',f.side);shuffle(s,p.deck);f.acquired=uid;f.step=1;}if(!s.normalUsed&&capacity(s,f.side)&&get(f.acquired)?.zone==='hand'){const uid=select('deploy',[target(f.acquired)],'可將取得者表守招援並用盡本回合通招',true);if(uid===undefined)return false;if(uid&&deploy(uid))s.normalUsed=true;}break;
 case'windSummon':case'village':case'sunGate':case'egg':{const list=f.code==='egg'?p.deck.filter(c=>c.id==='JP19-M04'):p.hand.filter(c=>f.code==='village'?C(c).level===5&&canSpecial(s,f.side,c):f.code==='sunGate'?['JP19-M01','JP19-M04','JP19-M06','JP19-M07'].includes(c.id):tw(c)&&canSpecial(s,f.side,c));if(['sunGate','village'].includes(f.code)&&!validField(s,f.side))break;const uid=select('deploy',list,'選擇合法招援靈體');if(uid===undefined)return false;if(uid&&capacity(s,f.side)){const restricted=f.code==='sunGate';if(f.code==='egg'&&canSpecial(s,f.side,get(uid).c))summon(s,f.side,uid,'atk',{noDirectUntil:s.turn});else deploy(uid,restricted?{noAttackUntil:s.turn,noEffectsUntil:s.turn,noMaterialUntil:s.turn+1}:{});}break;}
 case'zheng':{if(!f.step){if(!src||src.zone!=='hand'||!capacity(s,f.side))break;summon(s,f.side,f.uid,'atk',{noDirectUntil:s.turn,proper:true});f.step=1;}const uid=select('bounce',q.slots.filter(face),'鄭成功可將敵方公開靈體回手',true);if(uid===undefined)return false;if(uid&&face(target(uid)))returnCard(s,uid);break;}
 case'selfHigh':if(src?.zone==='hand'&&capacity(s,f.side)&&validField(s,f.side))summon(s,f.side,f.uid,'def',{noAttackUntil:s.turn});break;
 case'liao':if(src?.zone==='hand'&&capacity(s,f.side)){const self=summon(s,f.side,f.uid,'def');const own=get(args.own),enemy=get(args.target);if(self&&own?.side===f.side&&own.zone==='slots'&&returnCard(s,args.own)&&enemy?.side===1-f.side&&enemy.zone==='slots')queueDestroy(s,[args.target],'effect',f.side);}break;
 case'liaoCancel':if(src?.zone==='slots'&&src.side===f.side&&returnCard(s,f.uid)&&s.attack)s.attack.cancel=true;break;
 case'redirect':if(s.attack&&!s.attack.t&&src?.zone==='slots'&&active(src.c))s.attack.t=f.uid;break;
 case'reduce':if(s.attack?.a===args.target&&face(target(args.target)))s.attack.reduction=(s.attack.reduction||0)+args.amount;break;
 case'seal':{const t=target(args.target);if(t&&get(args.target)?.zone==='slots'){t.zero=true;t.negated=true;t.positionLocked=true;}break;}
 case'bless':for(const uid of args.targets){const l=get(uid);if(l?.side===f.side&&l.zone==='slots'&&face(l.c))l.c.ward={until:s.turn+2,used:false};}break;
 case'tower':case'recoverLow':case'mazuRecover':case'fudoRecover':{const l=get(args.target);if(l?.side===f.side&&l.zone==='grave')move(s,args.target,'hand',f.side);break;}
 case'sunBounce':if(get(args.target)?.side===1-f.side&&face(target(args.target)))returnCard(s,args.target);break;
 case'tengu':{const t=target(args.target);if(get(args.target)?.side===1-f.side&&face(t)&&t.mode==='atk')t.mode='def';break;}
 case'breakSpell':if(get(args.target)?.side===1-f.side&&face(target(args.target)))queueDestroy(s,[args.target],'effect',f.side);break;
 case'negate':{const prior=s.stack.find(t=>t.activation===args.frameUid);if(prior)prior.negated=true;break;}
 case'paper':{const t=target(args.target);if(get(args.target)?.side===f.side&&face(t))t.chainShield=true;break;}
 case'rope':{const t=get(args.target);if(src&&active(src.c)&&t?.side===1-f.side&&t.zone==='slots'&&face(t.c)){src.c.target=args.target;src.c.targetSide=t.side;src.c.expiresStandby=s.turn+(f.side===s.side?2:1);}else if(src)move(s,f.uid,'grave');break;}
 case'lanternGuard':{const t=get(args.target),l=get(args.lantern);if(t?.side===f.side&&t.zone==='slots'&&face(t.c)&&l?.side===f.side&&l.zone==='slots'&&face(l.c)&&returnCard(s,args.lantern)&&s.attack)s.attack.cancel=true;break;}
 case'shield':p.spellShield=s.turn;break;
 case'escort':if(!validField(s,f.side)||!capacity(s,f.side))break;{let uid=args.target;if(args.source==='hand'){uid=select('deploy',p.hand.filter(c=>canSpecial(s,f.side,c)),'沿途接駕：結算時選手牌靈體');if(uid===undefined)return false;}const l=get(uid);if(l?.side===f.side&&l.zone===args.source&&canSpecial(s,f.side,l.c))deploy(uid,{destroyBattle:s.turn,destroyBattleBy:f.side});break;}
 case'rally':if(!f.step){const list=[...p.hand,...p.deck].filter(c=>canSpecial(s,f.side,c));const uid=select('first',list,'護駕集結：選擇第一體');if(uid===undefined)return false;if(!uid||!capacity(s,f.side)||!get(uid))break;f.first=uid;f.step=1;}if(f.step===1){const first=get(f.first);if(!first)break;const list=[...p.hand,...p.deck].filter(c=>c.id!==first.c.id&&canSpecial(s,f.side,c));let uid=null;if(capacity(s,f.side)>=2){uid=select('second',list,'可選第二體不同名靈體',true);if(uid===undefined)return false;}f.deployed=summonBatch(s,f.side,[f.first,uid]).length;f.step=2;}if(f.deployed&&q.slots.some(Boolean)&&capacity(s,f.side)){const uid=select('extra',[...p.hand,...p.deck].filter(c=>normal(c)&&C(c).level<=6&&canSpecial(s,f.side,c)),'可追加六星以下無效果靈體',true);if(uid===undefined)return false;if(uid)deploy(uid);}break;
 case'sealGrave':if(!f.step){const uid=select('send',p.deck.filter(c=>sp(c)&&C(c).level>=5&&!extra(c)),'從牌組將原始五星以上靈體送入棄牌區');if(uid===undefined)return false;if(!uid||get(uid)?.zone!=='deck')break;p.lockCountry=C(get(uid).c).country;p.lockUntil=s.turn+(f.side===s.side?2:1);move(s,uid,'grave');f.step=1;} {const uid=select('recover',p.grave.filter(sp),'可回收棄牌區靈體',true);if(uid===undefined)return false;if(uid&&get(uid)?.zone==='grave')move(s,uid,'hand',f.side);}break;
 case'absorb':{const h=get(args.host),t=get(args.target);if(src?.zone==='back'&&active(src.c)&&h?.side===f.side&&h.zone==='slots'&&face(h.c)&&t?.side===1-f.side&&t.zone==='slots'&&face(t.c)&&p.back.includes(null)&&!s.links.some(l=>l.side===f.side)&&t.c.releasedTurn!==s.turn&&s.released?.[t.c.uid]!==s.turn){const c=remove(s,args.target);p.back[p.back.indexOf(null)]={...clean(c),hidden:false,attached:true};s.links.push({side:f.side,original:t.side,host:args.host,attached:c.uid,spell:f.uid,expires:s.turn+2});}else if(src)move(s,f.uid,'grave');break;}
 case'tigerGuard':{const t=get(args.target);if(t?.side===1-f.side&&t.zone==='slots'&&face(t.c)&&t.c.mode==='atk'&&t.c.entity===args.entity)t.c.noAttackUntil=Math.max(t.c.noAttackUntil||0,s.turn+(s.side===t.side?2:1));break;}
 case'krBreakDraw':case'lanternDraw':draw(s,f.side);break;
 case'whaleRevive':if(src?.zone==='grave'&&src.c.proper&&capacity(s,f.side)&&canSpecial(s,f.side,src.c))summon(s,f.side,f.uid,'def',{proper:true,tuner:true});break;
 default:throw Error('未定義卡效處理：'+f.code);
 }
 if(C(f.id).subtype.includes('spell')&&!f.negated)s.players[f.side].resolvedSpellTurn=s.turn;emitHook('afterResolve',s,f);syncAttackTarget(s);cleanup(s);checkLP(s);return true;
}
function destroyed(s,uid,reason,by){const l=locate(s,uid);if(!l)return false;const card=clone(l.c),wasSlot=l.zone==='slots';move(s,uid,'grave');emitHook('onDestroyed',s,l,card,reason,by);log(s,C(card).name+'被'+(reason==='battle'?'戰鬥':reason==='replacement'?'替代':'效果')+'破壞。',card.id,wasSlot?{kind:'destroy',side:l.side,slot:l.i,id:card.id,uid:card.uid,reason}:null);if(wasSlot&&!card.negated){if(card.id==='TW43-M08')s.jobs.push({kind:'trigger',side:l.side,card,code:'mazuRecover'});if(card.id==='TW43-E03'&&by!==l.side&&card.proper)s.jobs.push({kind:'trigger',side:l.side,card,code:'whaleRevive'});}cleanup(s);return true;}
function destroyJob(s,j){if(!j.ids.length){if(j.after)s.jobs.unshift(j.after);return;}const uid=j.ids[0],l=locate(s,uid);if(!l){j.ids.shift();s.jobs.unshift(j);return;}const p=s.players[l.side],c=l.c,by=j.byMap?.[uid]??j.by;const skip=j.skip||{};if(!j.worldSkip?.[uid]&&mods.some(m=>m.chooseDestruction?.(s,l,j.reason,by))){const opts=combinedProtectionOptions(s,l,j,by);ask(s,l.side,'選擇一項破壞保護（只消耗所選項）',opts.map(o=>({label:o.label,value:o})).concat([{label:'不使用靈體保護，依其他既有保護處理',value:null}]),{kind:'worldProtection',job:j,uid,entity:c.entity,by});return;}let protectionName='';let saved=mods.some(m=>m.preventDestroy?.(s,l,j.reason,by));
 if(j.reason==='effect'&&l.zone!=='slots'&&face(c)&&p.spellShield>=s.turn&&by!==l.side)saved=true;
 if(j.reason==='effect'&&l.zone==='slots'&&face(c)&&c.chainShield&&by!==l.side)saved=true;
 if(j.reason==='battle'&&face(c)&&C(c).level<=4&&validField(s,l.side,'TW43-S06')&&!used(s,l.side,p.field,'mountain')){use(s,l.side,p.field,'mountain');saved=true;protectionName='【山路】保護：';}
 if(!saved&&c.ward&&!c.ward.used&&['effect','battle','replacement'].includes(j.reason)){c.ward.used=true;saved=true;}
 if(!saved&&!j.worldSkip?.[uid]){const options=mods.flatMap(m=>m.destructionOptions?.(s,l,j.reason,by,j)||[]);if(options.length){ask(s,l.side,'選擇此次破壞的替代方式',options.map(o=>({label:o.label,value:o})).concat([{label:'不使用替代',value:null}]),{kind:'worldProtection',job:j,uid,entity:c.entity,by});return;}}
 if(!saved&&!skip[uid]&&j.reason==='effect'&&l.zone==='slots'&&face(c)&&C(c).level<=4&&by!==l.side&&validField(s,l.side,'JP24-S01')&&!used(s,l.side,p.field,'protect')&&p.hand.some(t=>costAllowed(s,{uid:t.uid}))){ask(s,l.side,'鈴代影座：可棄1手免除本體效果破壞',[...p.hand.filter(t=>costAllowed(s,{uid:t.uid})).map(t=>({label:'棄'+C(t).name+'保護'+C(c).name,value:t.uid})),{label:'不保護',value:null}],{kind:'fieldProtection',job:j,uid});return;}
 if(!saved&&!skip[uid]&&j.reason==='battle'&&l.zone==='slots'&&face(c)&&tw(c)){const swords=p.slots.filter(t=>active(t)&&t.uid!==uid&&t.id==='TW43-M10'&&costAllowed(s,{uid:t.uid})&&!used(s,l.side,t,'replace',true));if(swords.length){ask(s,l.side,'劍獅可替代此次戰破',[...swords.map(t=>({label:'由劍獅替代',value:t.uid})),{label:'不替代',value:null}],{kind:'swordProtection',job:j,uid,by});return;}}
 if(saved)log(s,protectionName+C(c).name+'免除此次破壞。',c.id,{kind:'effect',side:l.side,stage:'protection'},l.side);else{const did=destroyed(s,uid,j.reason,j.reason==='battle'?1-l.side:by);if(did&&j.reason==='battle'&&s.attack){const a=locate(s,s.attack.a);if(a&&a.side!==l.side&&a.c.id==='JP19-M07'&&!a.c.negated)s.jobs.push({kind:'trigger',side:a.side,card:clone(a.c),code:'fudoRecover'});}}
 j.ids.shift();s.jobs.unshift(j);
}
function combinedProtectionOptions(s,l,j,by){
 const c=l.c,p=s.players[l.side],out=mods.flatMap(m=>m.destructionOptions?.(s,l,j.reason,by,j)||[]);
 for(let i=0;i<mods.length;i++)if(mods[i].preventDestroy){const copy=clone(s),cl=locate(copy,c.uid);if(mods[i].preventDestroy(copy,cl,j.reason,by))out.push({code:'CORE_AUTO',index:i,label:'使用既有卡片保護 '+(i+1)});}
 if(j.reason==='battle'&&face(c)&&C(c).level<=4&&validField(s,l.side,'TW43-S06')&&!used(s,l.side,p.field,'mountain'))out.push({code:'CORE_MOUNTAIN',label:'使用山路保護（保留其他次數）'});
 if(c.ward&&!c.ward.used&&['effect','battle','replacement'].includes(j.reason))out.push({code:'CORE_WARD',label:'使用既有護佑（保留其他次數）'});
 if(j.reason==='effect'&&c.chainShield&&by!==l.side)out.push({code:'CORE_CHAIN',label:'使用本鏈保護'});
 if(j.reason==='effect'&&C(c).level<=4&&by!==l.side&&validField(s,l.side,'JP24-S01')&&!used(s,l.side,p.field,'protect'))for(const t of p.hand.filter(t=>costAllowed(s,{uid:t.uid})))out.push({code:'CORE_FIELD',uid:t.uid,label:'棄'+C(t).name+'使用鈴代影座保護'});
 if(j.reason==='battle'&&tw(c))for(const t of p.slots.filter(t=>active(t)&&t.uid!==c.uid&&t.id==='TW43-M10'&&costAllowed(s,{uid:t.uid})&&!used(s,l.side,t,'replace',true)))out.push({code:'CORE_SWORD',uid:t.uid,label:'由劍獅替代戰破'});
 return out;
}
function applyCombinedProtection(s,o,l,reason,by){const p=s.players[l.side];
 if(o.code==='CORE_AUTO')return !!mods[o.index].preventDestroy(s,l,reason,by);
 if(o.code==='CORE_MOUNTAIN'){use(s,l.side,p.field,'mountain');return true;}
 if(o.code==='CORE_WARD'){l.c.ward.used=true;return true;}
 if(o.code==='CORE_CHAIN')return true;
 if(o.code==='CORE_FIELD'){if(!costAllowed(s,{uid:o.uid}))return false;move(s,o.uid,'grave');use(s,l.side,p.field,'protect');return true;}
 if(o.code==='CORE_SWORD'){const t=locate(s,o.uid)?.c;if(!t||!costAllowed(s,{uid:o.uid}))return false;use(s,l.side,t,'replace',true);if(t.ward&&!t.ward.used){t.ward.used=true;return false;}return destroyed(s,t.uid,'replacement',by);}
 return false;
}
function trigger(s,j){const p=s.players[j.side],c=j.card,actions=[];if(j.code!=='whaleRevive'&&used(s,j.side,c,j.code))return;
 const add=(args={},cost=null)=>actions.push({kind:'effect',side:j.side,uid:c.uid,card:c,code:j.code,args,cost,key:j.code,label:C(c).name+'：'+(args.target?'回收'+name(s,args.target):cost?.kind==='shuffleHand'?'洗回一張原始7／8星並抽1':j.code==='whaleRevive'?'除外另一協作，蘇生自身':'使用召喚誘發')});
 if(j.code==='searchField'&&p.deck.some(field))add();
 if(j.code==='lanternDraw')for(const t of p.hand.filter(t=>sp(t)&&[7,8].includes(C(t).level)))add({}, {kind:'shuffleHand',uid:t.uid});
 if(j.code==='mazuRecover')for(const t of p.grave.filter(t=>tw(t)&&sp(t)&&C(t).level<=5))add({target:t.uid});
 if(j.code==='fudoRecover')for(const t of p.grave.filter(t=>sp(t)&&C(t).level<=4))for(const cost of p.grave.filter(normalSpell))add({target:t.uid},{kind:'banish',uids:[cost.uid]});
 if(j.code==='whaleRevive'&&capacity(s,j.side))for(const t of p.grave.filter(t=>tw(t)&&sp(t)&&t.uid!==c.uid))add({}, {kind:'banish',uids:[t.uid]});
 if(j.code==='synchroWipe'&&s.players[1-j.side].slots.some(t=>t&&t.mode==='atk'))add();
 if(actions.length)ask(s,j.side,'可選誘發效果',actions.map(a=>({label:a.label,value:a})).concat([{label:'不發動',value:null}]),{kind:'trigger'});
}
function attackEligible(s,side,c){if(!face(c)||c.noAttackUntil>=s.turn)return false;const votes=mods.map(m=>m.canAttack?.(s,side,c));return !votes.includes(false)&&(c.mode==='atk'||votes.includes(true));}
function attackLimit(s,side,c){const limits=mods.map(m=>m.attackLimit?.(s,side,c)).filter(Number.isFinite);return limits.length?Math.max(...limits):c.id==='TW43-E03'&&!c.negated?2:1;}
function affectedBy(s,card,f){return !mods.some(m=>m.affectedBy?.(s,card,f)===false);}
function legalAttackTarget(s,b,target,phase="declare"){const a=locate(s,b.a);if(!a||a.zone!=='slots'||a.side!==b.side||!attackEligible(s,a.side,a.c))return false;const t=typeof target==='string'?locate(s,target):target?.c?target:target?locate(s,target.uid):null;if(target&&(!t||t.side===a.side||t.zone!=='slots'))return false;if(!target&&((s.players[1-a.side].slots.some(Boolean)&&!(ocg(s)&&mods.some(m=>m.directAllowed?.(s,a.c)===true)))||a.c.noDirectUntil>=s.turn||s.links.some(l=>l.host===a.c.uid)))return false;return !mods.some(m=>m.attackTargetLegal?.(s,b,t?.c||null,phase)===false);}
function attackPower(s,c){for(const m of mods){const v=m.battleAttackOverride?.(s,c);if(Number.isFinite(v))return Math.max(0,v);}for(const m of mods){const v=m.attackValue?.(s,c);if(Number.isFinite(v))return Math.max(0,v);}return value(s,c);}
function destructionTargets(s,f){const ids=[];const target=f.args.target&&locate(s,f.args.target);if(f.code==='KR_break'&&target&&['back','field'].includes(target.zone))ids.push(target.c.uid);if(f.code==='CN_break'&&target&&target.side!==f.side&&['back','field'].includes(target.zone)&&face(target.c))ids.push(target.c.uid);if(['wipe','synchroWipe'].includes(f.code))ids.push(...s.players[1-f.side].slots.filter(c=>c&&(f.code==='wipe'||c.mode==='atk')).map(c=>c.uid));if(['liao','breakSpell'].includes(f.code)&&f.args.target)ids.push(f.args.target);for(const m of mods)ids.push(...(m.destructionTargets?.(s,f)||[]));return [...new Set(ids)];}
function combatMath(s,a,t){
 const side=locate(s,a.uid).side,atk=attackPower(s,a),damage=[0,0],victims=[];
 // Actual rules read attacker strength before revealing a hidden target.
 let calc=s,target=t;
 if(t?.hidden){target={...t,hidden:false};const l=locate(s,t.uid);calc={...s,players:s.players.map((p,i)=>i===l.side?{...p,slots:p.slots.map(c=>c?.uid===t.uid?target:c)}:p)};}
 const power=target?value(calc,target,target.mode==='def'?'def':'atk'):0,diff=atk-power;
 if(!target)damage[1-side]=atk;
 else if(target.mode==='def'){if(diff>0){victims.push(target.uid);if(!a.negated&&(['JP19-M04','TW43-E03'].includes(a.id)||mods.some(m=>m.piercing?.(calc,a,target))))damage[1-side]=diff;}else if(diff<0)damage[side]=-diff;}
 else if(diff>0){victims.push(target.uid);damage[1-side]=diff;}else if(diff<0){victims.push(a.uid);damage[side]=-diff;}else if(atk>0)victims.push(a.uid,target.uid);
 return {atk,power,damage,victims};
}
function battleJob(s){const b=s.attack;if(!b)return;const a=locate(s,b.a);if(!a||a.zone!=='slots'||!face(a.c)||!attackEligible(s,a.side,a.c)||(b.entity!==undefined&&a.c.entity!==b.entity)||mods.some(m=>m.validateAttack?.(s,b)===false)||b.cancel){s.attack=null;log(s,'本次攻擊結束。');return;}const q=s.players[1-a.side];let t=b.t?locate(s,b.t):null;
 if((b.t&&(!t||t.zone!=='slots'||t.side===a.side||(b.targetEntity!==undefined&&t.c.entity!==b.targetEntity)||!legalAttackTarget(s,b,t.c,'damage')))||(!b.t&&!legalAttackTarget(s,b,null,'damage'))){const opts=q.slots.filter(c=>c&&legalAttackTarget(s,b,c,'replay')).map(c=>({label:'改選'+(c.hidden?'隱藏靈體':C(c).name),value:c.uid}));if(legalAttackTarget(s,b,null,'replay'))opts.push({label:'直接攻擊',value:'direct'});opts.push({label:'放棄本次攻擊（不退次數）',value:null});ask(s,a.side,'目標已離場，依同次攻擊重選',opts,{kind:'replay'});return;}
 if(ocg(s)&&!b.damageWindowDone){b.damageWindowDone=true;b.damageStage='beforeCalculation';if(t?.c.hidden){t.c.hidden=false;emitHook('onFlip',s,t.side,t.c,{battle:true});}s.jobs.unshift({kind:'battle'});s.rootEvent={kind:'damage',stage:'beforeCalculation',side:a.side,attack:b.id};s.window={kind:'damage',stage:'beforeCalculation',eventSide:a.side,side:s.side,attack:b.id,passes:0};emitHook('damageStep',s,b);return;}
 if(ocg(s)&&!b.calculationWindowDone){b.calculationWindowDone=true;b.damageStage='calculation';s.jobs.unshift({kind:'battle'});s.rootEvent={kind:'damage',stage:'calculation',side:a.side,attack:b.id};s.window={kind:'damage',stage:'calculation',eventSide:a.side,side:s.side,attack:b.id,passes:0};return;}
 const priorLP=s.players.map(p=>p.lp),victims=[];b.battleDamage=[0,0];const battleHurt=(side,n)=>{b.battleDamage[side]+=n;s.players[side].lp=Math.max(0,s.players[side].lp-n);};s.damageCalculation=true;try{const result=combatMath(s,a.c,t?.c||null);if(t)t.c.hidden=false;victims.push(...result.victims);for(let i=0;i<2;i++)if(result.damage[i])battleHurt(i,result.damage[i]);if(t)log(s,C(a.c).name+' 武'+result.atk+' → '+C(t.c).name+(t.c.mode==='def'?' 防':' 武')+result.power+'。',a.c.id);else log(s,C(a.c).name+'直接攻擊，造成'+result.atk+'傷害。',a.c.id);}finally{delete s.damageCalculation;}if(ocg(s)){b.damageStage='afterCalculation';b.victims=victims;emitHook('beforeDamage',s,b,priorLP);}emitHook('onDamage',s,b);if(ocg(s))emitHook('afterDamage',s,b,priorLP);
 if(b.cnNoDamageSide===0||b.cnNoDamageSide===1){s.players[b.cnNoDamageSide].lp=priorLP[b.cnNoDamageSide];b.battleDamage[b.cnNoDamageSide]=0;log(s,'九環錫杖免除我方本次戰鬥傷害；靈體仍判定戰破。');}
 log(s,'靈體交鋒。',null,{kind:'combat',from:{side:a.side,slot:a.i,id:a.c.id,uid:a.c.uid},target:t?{side:t.side,slot:t.i,id:t.c.id,uid:t.c.uid}:null,damage:s.players.map((p,i)=>priorLP[i]-p.lp)});
 emitHook('afterBattleDamage',s,b,priorLP);
 for(let i=0;i<2;i++)if(b.battleDamage[i]>0)log(s,D.names[i]+'受到'+b.battleDamage[i]+'戰鬥傷害，剩餘'+s.players[i].lp+'LP。',null,null,i);checkLP(s);if(!alive(s))return;if(victims.length)queueDestroy(s,victims,'battle',a.side,{kind:'battleDone'});else {emitHook('expeditionBattleEnd',s,b);if(ocg(s))emitHook('afterBattle',s,b);s.attack=null;}
}
function endBattle(s){const ids=s.players.flatMap(p=>p.slots.filter(c=>c?.destroyBattle===s.turn).map(c=>c.uid));for(const p of s.players)for(const c of p.slots)if(c)delete c.destroyBattle;if(ids.length)queueDestroy(s,ids,'effect',Object.fromEntries(s.players.flatMap(p=>p.slots.filter(c=>c&&ids.includes(c.uid)).map(c=>[c.uid,c.destroyBattleBy??c.owner]))),{kind:'phase',phase:'main2'});else s.phase='main2';}
function enterStandby(s,side){s.phase='standby';emitHook('startTurn',s);for(const c of s.players[side].slots)if(c){if(c.ward?.until<=s.turn)delete c.ward;if(c.noMaterialUntil<s.turn)delete c.noMaterialUntil;}for(const c of [...s.players[side].back])if(c?.expiresStandby<=s.turn)move(s,c.uid,'grave');cleanup(s);}
function ocgPhaseRequest(s,kind){s.jobs.push({kind:'event',event:{kind:'phaseExit',phase:s.phase,side:s.side}},{kind:'ocgTransition',action:kind});}
function nextTurn(s){s.side=1-s.side;s.turn++;s.phase='draw';s.normalUsed=false;for(const p of s.players)for(const c of p.slots)if(c){c.attacks=0;c.changed=0;}if(s.turn>1&&(s.turn-1)%10===0&&s.ack<s.turn){ask(s,0,'已完成'+(s.turn-1)+'回合，是否繼續這場決鬥？',[{label:'繼續決鬥',value:'continue'}],{kind:'boundary'});}log(s,'第'+s.turn+'回合，'+D.names[s.side]+'的回合。',null,null,s.side);}
function endTurn(s){emitHook('endTurn',s);const p=s.players[s.side];s.phase='end';s.jobs.push({kind:'endLinks'},...s.players.map((_,side)=>({kind:'returnTemporary',side})),{kind:'endDestroy'},{kind:'discardEnd'},{kind:'nextTurn'});}
// Capture legal trigger candidates before any of this batch resolves.
function beginWorldTriggers(s,first){const events=[first.event];while(s.jobs[0]?.kind==='event'&&s.jobs[0].event.kind.startsWith('world'))events.push(s.jobs.shift().event);if(ocg(s)&&['normal','flip','special'].includes(s.jobs[0]?.event?.kind)){const ctx=s.jobs.shift().event;s.rootEvent=ctx;events.push({...ctx,ocgTriggerCollection:true});}const seenSummons=new Set(),uniqueEvents=events.filter(e=>{if(e.kind!=='worldSummon')return true;const key=JSON.stringify(e);if(seenSummons.has(key))return false;seenSummons.add(key);return true;});const rows=[],seenLiaoStarts=new Set();for(const side of [s.side,1-s.side])for(const ctx of uniqueEvents)for(const action of effectChoices(s,side,ctx)){if(ctx.ocgTriggerCollection&&!action.trigger)continue;if(ctx.kind==='worldStart'&&action.code==='liao'){const key=JSON.stringify({side,action});if(seenLiaoStarts.has(key))continue;seenLiaoStarts.add(key);}rows.push({side,ctx,action});}if(!rows.length)return;s.worldTriggers={rows,side:s.side,stage:0,...(ocg(s)?{ocg:true}:{})};continueWorldTriggers(s);}
function continueWorldTriggers(s){const b=s.worldTriggers;if(!b)return;
 if(b.ocg){for(;;){const side=b.stage%2===0?s.side:1-s.side,mandatory=b.stage<2;const candidates=b.rows.filter(r=>r.side===side&&!!r.action.mandatory===mandatory&&effectChoices(s,r.side,r.ctx).some(a=>JSON.stringify(a)===JSON.stringify(r.action)));if(candidates.length){ask(s,side,mandatory?'選擇必須發動效果的順序':'選擇可選觸發效果的順序',candidates.map(r=>({label:r.action.label,value:r})).concat(mandatory?[]:[{label:'放棄此組其餘可選觸發',value:null}]),{kind:'worldTriggerOrder'});b.side=side;return;}b.stage++;if(b.stage<4)continue;delete s.worldTriggers;if(s.stack.length){const f=s.stack.at(-1);s.window={kind:'effect',frame:f,side:1-f.side,passes:0};}return;}}
 for(;;){const candidates=b.rows.filter(r=>r.side===b.side&&effectChoices(s,r.side,r.ctx).some(a=>JSON.stringify(a)===JSON.stringify(r.action)));if(candidates.length){ask(s,b.side,'選擇同時觸發效果的入鏈順序',candidates.map(r=>({label:r.action.label,value:r})).concat([{label:'放棄其餘觸發',value:null}]),{kind:'worldTriggerOrder'});return;}if(b.stage===0){b.stage=1;b.side=1-s.side;continue;}delete s.worldTriggers;if(s.stack.length){const f=s.stack.at(-1);s.window={kind:'effect',frame:f,side:1-f.side,passes:0};}return;}}
function drain(s){let guard=0;while(alive(s)&&!s.pending&&!s.window&&guard++<300){
 if(s.resolving){const f=s.resolving;if(!resolvePresented(s,f))return;s.resolving=null;continue;}
 // Destruction and its replacement choices settle before the next chain link.
 if(s.stack.length&&s.jobs[0]?.kind!=='destroy'){s.resolving=s.stack.pop();continue;}
 if(!s.stack.length&&s.jobs[0]?.kind!=='destroy'){for(const p of s.players)for(const c of p.slots)if(c)delete c.chainShield;s.rootEvent=null;if(s.worldChainPending){delete s.worldChainPending;if(ocg(s)){const spent=s.ocgChainCards||[];delete s.ocgChainCards;for(const item of spent){const l=locate(s,item.uid);if(l?.zone==='back'&&l.c.entity===item.entity)move(s,item.uid,'grave');}}emitHook('afterChain',s);}}
 if(!s.jobs.length){emitHook('idle',s);if(!alive(s)||s.pending||s.window)break;}const j=s.jobs.shift();if(!j)break;
 if(j.kind==='destroy'){destroyJob(s,j);continue;}
 if(j.kind==='trigger'){trigger(s,j);continue;}
 if(j.kind==='event'&&j.event.kind.startsWith('world')){beginWorldTriggers(s,j);continue;}
 if(j.kind==='event'){s.rootEvent=j.event;if(ocg(s)){const ctx={...j.event,ocgTriggerCollection:true},rows=[];for(const side of [s.side,1-s.side])for(const action of effectChoices(s,side,ctx))if(action.trigger)rows.push({side,ctx,action});if(rows.length){s.worldTriggers={rows,side:s.side,stage:0,ocg:true};continueWorldTriggers(s);continue;}}s.window={...j.event,side:ocg(s)?s.side:1-j.event.side,eventSide:j.event.side,passes:0};continue;}
 if(j.kind==='battle'){battleJob(s);continue;}
 if(j.kind==='battleDone'){if(s.attack)emitHook('expeditionBattleEnd',s,s.attack);if(ocg(s)&&s.attack)emitHook('afterBattle',s,s.attack);s.attack=null;continue;}
 if(j.kind==='ocgStandby'){enterStandby(s,j.side);s.jobs.push({kind:'event',event:{kind:'standby',side:j.side}});continue;}
 if(j.kind==='ocgTransition'){if(j.action==='advance')s.phase='main';else if(j.action==='battle'){s.phase='battle';s.battleEnteredTurn=s.turn;s.jobs.push({kind:'event',event:{kind:'battleStart',side:s.side}});}else if(j.action==='main2')endBattle(s);else if(j.action==='end'){if(s.phase==='battle'){endBattle(s);s.jobs.push({kind:'endTurn'});}else endTurn(s);}continue;}
 if(j.kind==='phase'){s.phase=j.phase;continue;}
 if(j.kind==='endTurn'){endTurn(s);continue;}
 if(j.kind==='endLinks'){for(const l of [...s.links])if(l.expires<=s.turn)endLink(s,l);continue;}
 if(j.kind==='endDestroy'){const ids=s.players.flatMap(p=>p.slots.filter(c=>c?.destroyEnd<=s.turn).map(c=>c.uid));for(const p of s.players)for(const c of p.slots)if(c)delete c.destroyEnd;if(ids.length)queueDestroy(s,ids,'effect',Object.fromEntries(s.players.flatMap(p=>p.slots.filter(c=>c&&ids.includes(c.uid)).map(c=>[c.uid,c.destroyEndBy??c.owner]))));continue;}
 if(j.kind==='returnTemporary'){const p=s.players[j.side],cards=p.banished.filter(c=>c.returnAt<=s.turn);if(!cards.length)continue;const free=capacity(s,j.side);if(free&&free<cards.length){ask(s,j.side,'暫離靈體競格：選擇返回者，其餘送入棄牌區（非破壞）',cards.map(c=>({label:C(c).name,value:c.uid})),{kind:'returnSelection',side:j.side,uids:cards.map(c=>c.uid),selected:[],needed:free});continue;}for(const c of cards){if(capacity(s,j.side)){const v=remove(s,c.uid);p.slots[p.slots.indexOf(null)]={...clean(v),mode:v.returnMode||'atk',hidden:false,entered:s.turn,entity:++s.serial,attacks:0};}else move(s,c.uid,'grave');}continue;}
 if(j.kind==='discardEnd'){const p=s.players[s.side];if(p.hand.length>6){ask(s,s.side,'手牌超過6張，選擇丟棄',p.hand.map(c=>({label:C(c).name,value:c.uid})),{kind:'discardEnd'});}continue;}
 if(j.kind==='nextTurn'){nextTurn(s);continue;}
 emitHook('onJob',s,j);
 }
 if(guard>=300)throw Error('結算未收束，已停止以保護狀態');
}
function choicesRaw(s,side){if(!alive(s))return [];if(s.pending)return s.pending.side===side?s.pending.options.map((o,index)=>({kind:'answer',index,label:o.label})):[];
 if(s.window){if(s.window.side!==side)return [];const w={...s.window,side:s.window.eventSide??s.window.frame?.side??s.attack?.side};const list=effectChoices(s,side,w);if(s.rootEvent&&w.kind==='effect')list.push(...effectChoices(s,side,s.rootEvent));const unique=[...new Map(list.map(a=>[JSON.stringify(a),a])).values()];return [...unique,{kind:'pass',label:s.attack?'不發動，繼續結算本次攻擊':'不發動，繼續結算'}];}
 if(side!==s.side||s.resolving||s.jobs.length)return [];const p=s.players[side],out=[];
 if(s.phase==='draw')return [{kind:'draw',label:ocg(s)&&OCG.skipDraw(s)?'先手首回合不抽牌，開始回合':'抽牌，開始回合'}];
 if(s.phase==='standby')return [{kind:'advance',label:'進入主要階段'}];
 if(['main','main2'].includes(s.phase)){
  for(const c of p.hand){if(sp(c)&&!extra(c)&&c.id!=='TW43-M09'&&!s.normalUsed&&!mods.some(m=>m.canSummon?.(s,side,c,true)===false)){for(const mode of ['atk','set']){const need=tributeNeed(s,side,c,mode==='set');const materials=p.slots.filter(t=>t&&material(s,t));for(const ts of pairs(materials,need)){if(!capacity(s,side)&&!ts.length)continue;out.push({kind:'summon',uid:c.uid,mode,tributes:ts.map(t=>t.uid),label:(mode==='set'?'蓋放 ':'召喚 ')+C(c).name+(need?'（祭品：'+ts.map(C).map(c=>c.name).join('、')+'）':'')});}}}
   if(!sp(c)&&!field(c)&&p.back.includes(null))out.push({kind:'set',uid:c.uid,label:'覆蓋 '+C(c).name});
  }
  for(const c of p.slots.filter(Boolean))if(c.entered!==s.turn&&!c.changed&&!c.attacks&&!H.positionLocked(s,c))out.push({kind:'position',uid:c.uid,label:(c.hidden?'反轉召喚 ':c.mode==='atk'?'轉守備 ':'轉攻擊 ')+C(c).name});
  out.push(...effectChoices(s,side));if(ocg(s))for(const m of mods)out.push(...(m.procedures?.(s,side)||[]));
  const tuners=p.slots.filter(c=>face(c)&&tw(c)&&material(s,c)&&(c.tuner||C(c).subtype==='fusion_tuner'));
  const nons=p.slots.filter(c=>face(c)&&tw(c)&&material(s,c)&&!c.tuner&&C(c).subtype!=='fusion_tuner');
  for(const t of tuners)for(let mask=1;mask<(1<<nons.length);mask++){const ns=nons.filter((_,i)=>mask&(1<<i));if(C(t).level+ns.reduce((n,c)=>n+C(c).level,0)===8&&!(p.lockUntil>=s.turn&&!tw(t))&&p.extra.some(c=>c.id==='TW43-E03'))out.push({kind:'synchro',tributes:[t.uid,...ns.map(c=>c.uid)],label:'同步玄天上帝（'+[t,...ns].map(C).map(c=>c.name).join('＋')+'）'});}
  if(s.phase==='main'&&s.turn>1)out.push({kind:'battle',label:'進入戰鬥階段'});out.push({kind:'end',label:'結束回合'});
 }
 if(s.phase==='battle'){const q=s.players[1-side];for(const c of p.slots.filter(c=>attackEligible(s,side,c))){const max=attackLimit(s,side,c);if((c.attacks||0)>=max)continue;const targets=q.slots.filter(Boolean);if(targets.length)for(const t of targets.filter(t=>legalAttackTarget(s,{a:c.uid,side,entity:c.entity,mode:c.mode},t)))out.push({kind:'attack',uid:c.uid,target:t.uid,label:C(c).name+' → '+(t.hidden?'隱藏靈體':C(t).name)});if(!c.attacks&&legalAttackTarget(s,{a:c.uid,side,entity:c.entity,mode:c.mode},null))out.push({kind:'attack',uid:c.uid,target:null,label:C(c).name+'直接攻擊'});}out.push({kind:'main2',label:'進入主要階段二'});out.push({kind:'end',label:'結束回合'});}
 return filterActions(s,side,out);
}
function answer(s,index){const pending=s.pending,o=pending.options[index];if(!o)throw Error('選項已失效');const c=pending.context;s.pending=null;
 if(c.kind==='worldTriggerOrder'){const b=s.worldTriggers;if(o.value){const r=o.value;b.rows=b.rows.filter(x=>JSON.stringify(x)!==JSON.stringify(r));activate(s,r.action,true);}else b.rows=b.rows.filter(r=>r.side!==b.side||(b.ocg&&!!r.action.mandatory!==(b.stage<2)));continueWorldTriggers(s);}
 if(c.kind==='resolvePick'){s.resolving.picks[c.key]=o.value;}
 if(c.kind==='trigger'&&o.value)activate(s,o.value);
 if(c.kind==='fieldProtection'){const l=locate(s,c.uid);if(o.value&&l){move(s,o.value,'grave');use(s,l.side,s.players[l.side].field,'protect');c.job.ids.shift();log(s,C(l.c).name+'由鈴代影座免除破壞。',l.c.id);}else{c.job.skip={...(c.job.skip||{}),[c.uid]:true};}s.jobs.unshift(c.job);}
 if(c.kind==='swordProtection'){let saved=false;if(o.value){const l=locate(s,o.value);if(l){use(s,l.side,l.c,'replace',true);if(l.c.ward&&!l.c.ward.used){l.c.ward.used=true;log(s,'劍獅被護佑保留，未成功替代；原靈體仍戰破。');}else saved=destroyed(s,o.value,'replacement',c.by);}}if(saved)c.job.ids.shift();else c.job.skip={...(c.job.skip||{}),[c.uid]:true};s.jobs.unshift(c.job);}
 if(c.kind==='worldProtection'){const l=locate(s,c.uid);let saved=false;if(o.value&&l&&l.c.entity===c.entity)saved=applyCombinedProtection(s,o.value,l,c.job.reason,c.by)||mods.some(m=>m.replaceDestruction?.(s,o.value,l,c.job.reason,c.by)===true);if(saved){c.job.ids.shift();log(s,(o.value?.code==='CORE_MOUNTAIN'?'【山路】保護：':'')+C(l.c).name+'免除此次破壞。',l.c.id,{kind:'effect',side:l.side,stage:'protection'},l.side);}else c.job.worldSkip={...(c.job.worldSkip||{}),[c.uid]:true};s.jobs.unshift(c.job);}
 if(c.kind==='replay'){if(o.value===null)s.attack=null;else{s.attack.t=o.value==='direct'?null:o.value;s.attack.targetUid=s.attack.t;s.attack.targetEntity=locate(s,s.attack.t)?.c.entity;emitHook('onRetarget',s,s.attack,locate(s,s.attack.t)?.c||null);s.jobs.unshift({kind:'battle'});}}
 if(c.kind==='discardEnd'){move(s,o.value,'grave');s.jobs.unshift({kind:'discardEnd'});}
 if(c.kind==='returnSelection'){c.selected.push(o.value);if(c.selected.length<c.needed){ask(s,c.side,'繼續選擇可返回靈體',c.uids.filter(uid=>!c.selected.includes(uid)).map(uid=>({label:name(s,uid),value:uid})),c);}else for(const uid of c.uids){const l=locate(s,uid);if(l?.zone!=='banished')continue;if(c.selected.includes(uid)){const card=remove(s,uid),p=s.players[c.side];p.slots[p.slots.indexOf(null)]={...clean(card),mode:card.returnMode||'atk',hidden:false,entered:s.turn,entity:++s.serial,attacks:0};}else move(s,uid,'grave');}}
 if(c.kind==='boundary')s.ack=s.turn;
}

// A real public-log boundary, captured while the engine is at that boundary.
// No UID, RNG, deck order, opponent hand, pending payload or private work queue.
function publicFrame(s){
 const show=(c,side)=>!c?null:side===1&&c.hidden?{hidden:true,mode:c.mode}:{id:c.id,hidden:!!c.hidden,...(c.mode?{mode:c.mode}:{}),attacks:c.attacks||0,negated:!!c.negated,attached:!!c.attached,publicATK:value(s,c,'atk'),publicDEF:value(s,c,'def')};
 return {turn:s.turn,side:s.side,phase:s.phase,winner:s.winner,inputActor:s.pending?.side??s.window?.side??s.side,responseActor:s.pending?.side??s.window?.side??null,
  players:s.players.map((p,side)=>({lp:p.lp,deck:p.deck.map(()=>({hidden:true})),reserve:p.reserve.map(()=>({hidden:true})),hand:p.hand.map(c=>side?{hidden:true}:show(c,side)),slots:p.slots.map(c=>show(c,side)),back:p.back.map(c=>show(c,side)),field:show(p.field,side),grave:p.grave.map(c=>show(c,side)),extra:p.extra.map(c=>show(c,side)),banished:p.banished.map(c=>show(c,side))})),log:s.log.map(l=>({...l}))};
}
// Explain these summon activations without changing their legality.
function summonActivationReasons(s,side,c,l,base){
 const code={'TW43-M09':'zheng','CN40-S07':'CN_invite','TH-S01':'TH_ritual'}[c.id];if(!code)return null;
 if(choices(s,side).some(a=>a.kind==='effect'&&a.uid===c.uid&&a.code===code))return [];
 const p=s.players[side],reasons=[...base],add=text=>{if(!reasons.includes(text))reasons.push(text);};
 if(s.winner!==null)add('本場決鬥已結束');
 if(s.side!==side||!['main','main2'].includes(s.phase))add('須在自己的主要階段發動');
 if(s.pending||s.window||s.resolving||s.jobs.length||s.stack.length)add('尚有待回應或結算中的事件，請先完成結算');
 if(c.cnBlockedUntil>=s.turn)add('這張卡回收後，本回合不能發動');
 if(c.id==='TH-S01'&&c.thNegatedUntil>=s.turn)add('此卡效果目前無效');
 if(mods.some(m=>m.canEffect?.(s,c)===false))add('此卡目前受效果限制，不能發動效果');
 if(c.id==='TW43-M09')return reasons.length?reasons:['目前受效果或費用限制，不能進行鄭成功的出場程序'];
 if(!['hand','back'].includes(l.zone))add('須從手牌或我方覆蓋的行法格發動');
 const highs=p.hand.filter(t=>sp(t)&&C(t).level>=5&&C(t).level<=8);
 if(!highs.length)add('手牌沒有原始5～8星的靈體可作出場對象');
 const legal=highs.filter(t=>canSpecial(s,side,t));
 if(!legal.length)for(const t of highs){
  const why=t.id==='TW43-M09'?'須使用自身專屬出場程序，不能由本行法特殊出場':t.id==='TW-J-M12'?'不能特殊出場':/不能特殊出場/.test(C(t).playerText||C(t).text||'')?'不能由本行法特殊出場':'目前受出場限制，不能由本行法特殊出場';add(C(t).name+'：'+why);
 }
 const canPayMaterial=t=>material(s,t)&&costAllowed(s,{uid:t.uid});
 const own=p.slots.filter(face),failed=[];
 for(const t of legal){
  if(c.id==='CN40-S07'){
   const need=C(t).level>=7&&p.resolvedSpellTurn!==s.turn?2:1,mats=own.filter(t=>t.mode==='atk'&&canPayMaterial(t));
   if(mats.length<need)failed.push(C(t).name+'：須解放'+need+'張正面採攻擊且可作材料的靈體，目前只有'+mats.length+'張');
  }else{
   const mats=[...p.hand,...own].filter(x=>x.uid!==t.uid&&sp(x)&&canPayMaterial(x));
   const sets=[...mats.map(x=>[x]),...pairs(mats,2)],enough=sets.filter(ms=>ms.reduce((n,x)=>n+C(x).level,0)>=C(t).level);
   if(!enough.length)failed.push(C(t).name+'：須以其他1～2張手牌或正面場上靈體作材料，原始星數合計至少'+C(t).level+'星；目前材料不足（不能用出場對象本身）');
   else if(!capacity(s,side)&&!enough.some(ms=>ms.some(x=>locate(s,x.uid).zone==='slots')))failed.push(C(t).name+'：靈體格已滿，須以場上靈體作材料釋出空格');
  }
 }
 // Material failures only block activation when no candidate can pay its cost.
 if(legal.length&&failed.length===legal.length)failed.forEach(add);
 return reasons.length?reasons:['目前受效果或費用限制，無法發動此行法'];
}

// Read-only diagnostics use the same tribute/material/usage predicates as legality.
function availability(s,side,uid){const l=locate(s,uid);if(!l||l.side!==side)return {reasons:['請選擇自己的卡片']};const c=l.c,p=s.players[side],q=s.players[1-side],d=C(c),reasons=[];
 const need=sp(c)?tributeNeed(s,side,c):0,materials=p.slots.filter(t=>t&&material(s,t)).map(t=>t.uid),slots=p.slots.flatMap((t,i)=>!t?[i]:[]);
 if(c.negated||c.noEffectsUntil>=s.turn)reasons.push('此卡效果目前無效');
 if(l.zone==='back'&&c.hidden&&(trap(c)||d.subtype==='quickplay_spell')&&c.setTurn>=s.turn)reasons.push('剛蓋放的伏兵／速攻行法，本回合不能發動');
 if(trap(c)&&l.zone==='hand')reasons.push('伏兵須先蓋放，等待合法時機');
 if(l.zone==='hand'&&!sp(c)&&!field(c)&&!p.back.includes(null))reasons.push('行法／伏兵格已滿');
 const keys=c.id==='TW43-M08'?['bless']:c.id==='TW43-M09'||['JP19-M01','JP19-M06'].includes(c.id)&&l.zone==='hand'?['summon']:c.id==='TW43-M05'?['summon','negate']:['effect'];
 const unlimited=field(c)||['TW43-S01','TW43-S02','TW43-S08','TW43-S09','TW43-T01','TW43-T03'].includes(c.id);
 if(!unlimited&&keys.some(k=>used(s,side,c,k)))reasons.push('此卡已有本回合使用紀錄，對應效果不能再次使用');
 const target=(ok,text)=>{if(!ok)reasons.push(text);};
 let zhengChecks=null;
 if(c.id==='TW43-M09'){
  const inHand=l.zone==='hand',noPending=!s.pending&&!s.window&&!s.resolving&&!s.jobs.length,ownMain=side===s.side&&['main','main2'].includes(s.phase)&&noPending;
  const occupied=p.slots.filter(Boolean),eligible=occupied.filter(t=>face(t)&&t.mode==='atk'&&tw(t)&&C(t).level===5&&material(s,t)&&costAllowed(s,{uid:t.uid}));
  const materialDetail=eligible.length?'合格：'+eligible.map(t=>C(t).name).join('、'):!occupied.length?'我方場上沒有靈體':occupied.map(t=>C(t).name+'：'+(t.hidden?'尚未揭示，須為正面採攻擊':!tw(t)?'不是靈體':C(t).level!==5?'原始星數不是5星':t.mode!=='atk'?'目前採守備，須改採攻擊':!material(s,t)||!costAllowed(s,{uid:t.uid})?'目前不能作素材或支付費用':'合格')).join('；');
  const unused=!used(s,side,c,'summon'),room=capacity(s,side)>0||eligible.length>0;
  zhengChecks=[
   {key:'inHand',ok:inHand,label:'鄭成功在我方手牌',detail:inHand?'目前位於我方手牌':'目前不在我方手牌'},
   {key:'ownMain',ok:ownMain,label:'我方主階段且無待回應／結算',detail:ownMain?'目前可開始程序':!noPending?'尚有待回應或結算中的事件':'目前不是我方主要階段'},
   {key:'material',ok:eligible.length>0,label:'有正面・採攻擊・原始5星・可作素材靈體',detail:materialDetail},
   {key:'unused',ok:unused,label:'本回合尚未使用同名程序',detail:unused?'尚未使用':'同名程序本回合已使用'},
   {key:'room',ok:room,label:'解放後有召喚格',detail:room?'現有空格或由合格素材釋出':'沒有可用靈體格'}
  ];
  for(const check of zhengChecks)if(!check.ok&&!reasons.includes(check.detail))reasons.push(check.detail);
 }
 if(c.id==='TW43-S02')target(p.deck.some(field),'牌組已無可搜尋的場地');
 if(c.id==='TW43-S09')target(q.slots.some(Boolean),'敵方場上沒有可破壞的靈體');
 if(c.id==='TW43-S10'){target(p.lp>1000,'生命值不足：支付1000LP後必須仍有生命值');target(capacity(s,side)>0,'沒有可特殊召喚的靈體空格');target(p.extra.some(t=>C(t).level<=6),'額外牌組沒有符合條件的靈體');if(p.lockUntil>=s.turn)reasons.push('本回合受招援限制');}
 if(c.id==='TW43-S03')target(p.deck.some(t=>sp(t)&&!extra(t)&&C(t).level<=7),'牌組沒有可搜尋的七星以下靈體');
 if(c.id==='TW43-S07')target(p.deck.some(t=>!sp(t)),'牌組沒有可送入棄牌區的行法／伏兵');
 if(c.id==='TW43-M08'&&l.zone==='slots'){target(p.slots.some(t=>face(t)&&t.uid!==uid&&tw(t)),'沒有其他公開台灣靈體可護佑');target(p.hand.length>0,'沒有可棄的手牌支付成本');}
 if(['JP24-S05','JP24-S06','JP24-S07','JP24-T03'].includes(c.id)||['JP19-M01','JP19-M05'].includes(c.id)&&l.zone==='slots')target(p.hand.some(t=>t.uid!==uid),'沒有另一張手牌可支付棄牌成本');
 if(c.id==='JP24-S06')target(p.grave.some(t=>sp(t)&&C(t).level<=4),'棄牌區沒有四星以下靈體可回收');
 if(c.id==='JP24-S07'||c.id==='JP19-M01'&&l.zone==='slots')target([...q.back,q.field].some(face),'敵方沒有公開行法／伏兵或場地可選');
 if(c.id==='JP19-M03'&&l.zone==='slots')target(q.slots.some(t=>face(t)&&t.mode==='atk'),'敵方沒有公開攻擊表示靈體可選');
 if(c.id==='TW43-M12'&&l.zone==='slots')target(p.grave.some(field),'棄牌區沒有可回收的場地');
 const activationReasons=summonActivationReasons(s,side,c,l,reasons);
 return {tributeNeed:need,tributeNeedSet:sp(c)?tributeNeed(s,side,c,true):0,materialUIDs:materials,emptySlots:slots,reasons,...(zhengChecks?{zhengChecks}:{}),...(activationReasons?{activationReasons}:{})};
}

function command(s,side,action,options={}){if(!alive(s))throw Error('決鬥已結束');const legal=choices(s,side);const a=legal.find(a=>JSON.stringify(a)===JSON.stringify(action));if(!a)throw Error('操作非法或選項已過期；未扣成本');const destination=options.slot;if(destination!==undefined&&(a.kind!=='summon'||!Number.isInteger(destination)||destination<0||destination>=5||s.players[side].slots[destination]&&!a.tributes.includes(s.players[side].slots[destination].uid)))throw Error('召喚目的格非法；未扣祭品或額度');const backup=clone(s),events=[],engineerHandHistory=[];if(Array.isArray(options.engineerHandHistory))engineerHandSinks.set(s,engineerHandHistory);if(Array.isArray(options.publicEvents))publicEventSinks.set(s,events);try{
 if(a.kind==='answer')answer(s,a.index);
 else if(a.kind==='pass'){s.window.passes++;if(s.window.passes>=2)s.window=null;else s.window.side=1-side;}
 else if(a.kind==='effect')activate(s,a);
 else if(a.kind==='draw'){const skipped=ocg(s)&&OCG.skipDraw(s);if(skipped)log(s,'先手第一回合略過通常抽牌。');else draw(s,side);if(alive(s)){if(ocg(s))s.jobs.push({kind:'event',event:{kind:'drawPhase',side,skipped}},{kind:'ocgStandby',side});else enterStandby(s,side);}}
 else if(a.kind==='enemyPrepare'){s.phase='main';log(s,D.names[side]+'不抽牌，從有限預備池進入主要階段。',null,null,side);}
 else if(ocg(s)&&['advance','battle','main2','end'].includes(a.kind))ocgPhaseRequest(s,a.kind);
 else if(a.kind==='advance'){s.phase='main';emitHook('enterMain',s);}
 else if(a.kind==='reserveDeploy'){const p=s.players[side],l=locate(s,a.uid);if(side!==1||l?.zone!=='reserve'||l.i!==0||s.normalUsed||!capacity(s,side))throw Error('有限預備部署條件已失效；未消耗儲備或召喚額度');const c=remove(s,a.uid),u={...clean(c),mode:a.mode==='atk'?'atk':'def',hidden:a.mode==='set',entered:s.turn,attacks:0,entity:++s.serial};p.slots[p.slots.indexOf(null)]=u;s.normalUsed=true;log(s,D.names[side]+(u.hidden?'部署一體隱藏契影。':'部署'+C(c).name+'。'),u.hidden?null:c.id,null,side);}
 else if(a.kind==='procedure'){if(!ocg(s)||!mods.some(m=>m.resolveProcedure?.(s,a)===true))throw Error('Unsupported special summon procedure');}
 else if(a.kind==='summon'){const p=s.players[side];if(a.summonLP)p.lp-=a.summonLP;s.moveCause={side,kind:'material',cardId:locate(s,a.uid).c.id};try{a.tributes.forEach(uid=>move(s,uid,'grave'));}finally{delete s.moveCause;}const c=remove(s,a.uid),u={...clean(c),mode:a.mode==='atk'?'atk':'def',hidden:a.mode==='set',entered:s.turn,attacks:0,entity:++s.serial};p.slots[destination??p.slots.indexOf(null)]=u;s.normalUsed=true;log(s,D.names[side]+(u.hidden?'蓋放一體靈體。':'通常召喚'+C(c).name+'。'),u.hidden?null:c.id,null,side);emitHook('onSummon',s,side,u,true);if(ocg(s))s.jobs.push({kind:'event',event:{kind:u.hidden?'setMonster':'normal',side,uid:u.uid}});if(D.policy.highDefSupportUses&&side===1&&!u.hidden&&!s.highDefSupportUsed&&c.id!=='JP-J1-C02'){s.highDefSupportUsed=true;u.mode='def';u.changed=s.turn;log(s,'界尺支援：'+C(c).name+'公開轉為守備。',c.id);}if(!u.hidden&&['TW43-M11','JP-J1-C01','JP19-M02'].includes(c.id))s.jobs.push({kind:'trigger',side,card:clone(u),code:c.id==='JP19-M02'?'lanternDraw':'searchField'});}
 else if(a.kind==='set'){const p=s.players[side],c=remove(s,a.uid);p.back[p.back.indexOf(null)]={...clean(c),hidden:true,setTurn:s.turn,entity:++s.serial};log(s,D.names[side]+'覆蓋一張行法／伏兵。',null,null,side);}
 else if(a.kind==='position'){const c=locate(s,a.uid).c,wasHidden=c.hidden;c.mode=c.hidden?'atk':c.mode==='atk'?'def':'atk';c.hidden=false;c.changed=s.turn;log(s,C(c).name+'改為'+(c.mode==='atk'?'攻擊':'守備')+'表示。',c.id);if(ocg(s)){if(wasHidden)emitHook('onFlip',s,side,c,{battle:false});s.jobs.push({kind:'event',event:{kind:wasHidden?'flip':'position',side,uid:c.uid}});}cleanup(s);}
 else if(a.kind==='synchro'){a.tributes.forEach(uid=>move(s,uid,'grave'));const c=s.players[side].extra.find(c=>c.id==='TW43-E03');const u=summon(s,side,c.uid,'atk',{proper:true});if(u)s.jobs.push({kind:'trigger',side,card:clone(u),code:'synchroWipe'});}
 else if(a.kind==='battle'){s.phase='battle';s.battleEnteredTurn=s.turn;s.jobs.push({kind:'event',event:{kind:'battleStart',side}});}
 else if(a.kind==='attack'){const c=locate(s,a.uid).c;emitHook('onAttack',s,side,a,c);c.attacks=(c.attacks||0)+1;s.attack={a:a.uid,t:a.target,side,id:++s.serial,reduction:0,entity:c.entity,mode:c.mode,targetUid:a.target,targetEntity:locate(s,a.target)?.c.entity};log(s,C(c).name+'宣告'+(a.target?'攻擊。':'直接攻擊。'),c.id);s.rootEvent={kind:'attack',...s.attack};if(ocg(s))s.jobs.push({kind:'event',event:s.rootEvent});else s.window={kind:'attack',...s.attack,side:1-side,eventSide:side,passes:0};s.jobs.push({kind:'battle'});}
 else if(a.kind==='main2')endBattle(s);
 else if(a.kind==='end'){if(s.phase==='battle'){endBattle(s);s.jobs.push({kind:'endTurn'});}else endTurn(s);}
 drain(s);if(Array.isArray(options.publicEvents))options.publicEvents.push(...events);if(Array.isArray(options.engineerHandHistory))options.engineerHandHistory.push(...engineerHandHistory);return s;
 }catch(e){for(const key of Object.keys(s))delete s[key];Object.assign(s,backup);throw e;}finally{publicEventSinks.delete(s);engineerHandSinks.delete(s);}}
function view(s,viewer=0){const safe=clone(s);delete safe.expedition;delete safe.seed;delete safe.uses;delete safe.tj;delete safe.jobs;delete safe.stack;delete safe.resolving;delete safe.links;delete safe.window;delete safe.pending;for(let side=0;side<2;side++){const p=safe.players[side];p.deck=p.deck.map(()=>({hidden:true}));p.reserve=p.reserve.map(()=>({hidden:true}));if(side!==viewer)p.hand=p.hand.map(c=>mods.some(m=>m.publicHand?.(s,side,c))?c:{hidden:true});for(const zone of ['slots','back'])p[zone]=p[zone].map(c=>c?.hidden&&side!==viewer?{uid:c.uid,hidden:true,mode:c.mode}:c);}return safe;}
function aiLegacy(s,side=1){const opts=choices(s,side);if(!opts.length)return null;for(const m of mods){const chosen=m.ai?.(s,side,opts);if(chosen&&opts.includes(chosen))return chosen;}const score=a=>{if(a.kind==='enemyPrepare')return 100;if(a.kind==='reserveDeploy')return a.mode==='atk'?75:70;if(a.kind==='answer'){const p=s.pending,o=p.options[a.index];if(o.value===null)return 0;if(typeof o.value==='object')return 70;const c=locate(s,o.value)?.c;return c?(p.context.kind==='discardEnd'?-C(c).atk||0:(C(c).atk||0)/100+20):20;}if(a.kind==='pass')return -10;if(a.kind==='effect'){const l=locate(s,a.uid);let n=25;if(['search','searchField','four','contract','sunGate','egg','selfHigh','fusion','rally','escort','zhuSearch','seimeiSearch'].includes(a.code))n=65;if(['wipe','absorb','reduce','seal','negate','paper','lanternGuard','liaoCancel'].includes(a.code))n=80;if(a.code==='field')n=s.players[side].field?-5:60;if(a.code==='continuous')n=35;if(a.code==='shield')n=-6;if(a.code==='breakSpell')n=50;if(a.code==='tower')n=5;if(a.cost?.kind==='discard')n-=(C(locate(s,a.cost.uid)?.c||'JP19-M01').atk||0)/1000;return n;}if(a.kind==='summon'){const c=locate(s,a.uid).c;return 35+(C(c).atk||0)/100-a.tributes.reduce((n,uid)=>n+value(s,locate(s,uid).c)/150,0)+(a.mode==='atk'?3:0);}if(a.kind==='synchro')return 70;if(a.kind==='set')return 10;if(a.kind==='attack'){const c=locate(s,a.uid).c,t=a.target?locate(s,a.target).c:null;if(!t)return 100;if(t.hidden)return 20;return value(s,c)>value(s,t,t.mode==='def'?'def':'atk')?80:-30;}if(a.kind==='position'){const c=locate(s,a.uid).c;return c.mode==='def'&&C(c).atk>=1400?12:-20;}if(a.kind==='battle')return 5;if(a.kind==='end'||a.kind==='main2')return -2;return 1;};return opts.map((a,i)=>({a,i,n:score(a)})).sort((a,b)=>b.n-a.n||a.i-b.i)[0].a;}
// Hero AI: every returned action remains an original legal option.
// Forecasts use independent visible-information copies, never a game-state rollback.
const aiUnknown={name:'未知牌',subtype:'normal_spirit',country:'',level:0,atk:0,def:0};
function aiOpaque(c){return !!c&&(c.aiUnknown||c.id==='AI_UNKNOWN');}
function aiGuardPreview(s){
 const raw=new WeakMap(),decks=new WeakSet(),ctx={raw,decks,unknown(kind){const e=Error('Unobserved preview outcome: '+kind);e.aiUnknown=true;e.kind=kind;e.snapshot=clone(s);throw e;}};
 const check=callback=>{if(callback.length>1)ctx.unknown('indexed-deck-query');};
 const visibleCard=card=>aiOpaque(card)?new Proxy(card,{get(c,key){if(['uid','owner','hidden','aiUnknown'].includes(key))return c[key];if(ctx.checkingLegality){ctx.legalityUnknown=true;return c[key];}ctx.unknown('unknown-card-pool');}}):card;
 const wrap=(array,isDeck=false)=>{
  if(raw.has(array)){if(isDeck)decks.add(array);return array;}
  const proxy=new Proxy(array,{get(a,key){
   if(key==='toJSON')return ()=>a;
   if(typeof key==='string'&&/^\d+$/.test(key))ctx.unknown('deck-position');
   if(['slice','at','shift','pop','splice','reverse','sort'].includes(key))return ()=>ctx.unknown('deck-order-operation');
   if(key===Symbol.iterator)return ()=>ctx.unknown('deck-order-iteration');
   if(key==='filter')return callback=>{check(callback);return wrap(a.filter(card=>callback(visibleCard(card),undefined,proxy)));};
   if(['map','flatMap'].includes(key))return callback=>{check(callback);return wrap(Array.prototype[key].call(a,card=>callback(visibleCard(card),undefined,proxy)));};
   if(key==='find')return callback=>{check(callback);const list=a.filter(card=>callback(visibleCard(card),undefined,proxy));if(list.some(aiOpaque))ctx.unknown('unknown-card-pool');if(new Set(list.map(c=>c.id)).size>1)ctx.unknown('ambiguous-deck-find');return list[0];};
   if(['some','every','findIndex','forEach'].includes(key))return callback=>{check(callback);return Array.prototype[key].call(a,(card)=>callback(visibleCard(card),undefined,proxy));};
   if(key==='reduce')return (callback,initial)=>a.reduce((acc,card)=>callback(acc,visibleCard(card),undefined,proxy),initial);
   const v=Reflect.get(a,key);return typeof v==='function'?v.bind(a):v;
  }});raw.set(proxy,array);if(isDeck)decks.add(proxy);return proxy;
 };
 Object.defineProperty(s,'aiPreviewContext',{value:ctx,enumerable:false,configurable:true});
 for(const p of s.players){let deck=wrap(p.deck,true);Object.defineProperty(p,'deck',{enumerable:true,configurable:true,get:()=>deck,set:value=>{deck=wrap(raw.get(value)||value,true);}});}
 return ctx;
}
function aiDeckCard(s,array,index){return (s.aiPreviewContext?.raw.get(array)||array)[index];}
function aiDeckRemove(s,array,index){return (s.aiPreviewContext?.raw.get(array)||array).splice(index,1);}
function choices(s,side){
 const ctx=s.aiPreviewContext;if(!ctx)return choicesRaw(s,side);
 const previous=ctx.checkingLegality;ctx.checkingLegality=true;
 try{return choicesRaw(s,side);}finally{ctx.checkingLegality=previous;}
}
function effectChoices(s,side,context=null){
 const ctx=s.aiPreviewContext;if(!ctx)return effectChoicesRaw(s,side,context);
 const previous=ctx.checkingLegality;ctx.checkingLegality=true;
 try{return effectChoicesRaw(s,side,context);}finally{ctx.checkingLegality=previous;}
}
function aiPreviewUnknown(s,snapshot,side,kind){
 const t=clone(snapshot||s);t.pending=null;t.window=null;t.resolving=null;t.jobs=[];
 // Economic values share the terminal evaluator's units; unknown gains get no credit.
 const beforeBattle=aiBattleOpportunity(s,side),afterBattle=aiBattleOpportunity(t,side);
 const score=aiEvaluate(t,side)-afterBattle+Math.min(beforeBattle,afterBattle);
 return {state:null,score,unknown:true,kind,uncertainty:{knownEconomicsScore:score,extraGainAssumed:0,notAProvenBound:true},turnChanged:false};
}
function aiObservation(s,side){
 const t=clone(s);delete t.log;delete t.run;t.log=[];t.seed=1;if(t.config)delete t.config.seed;
 for(let i=0;i<2;i++){
  const p=t.players[i];
  if(i===side)p.deck.sort((a,b)=>a.id.localeCompare(b.id)||a.uid.localeCompare(b.uid));
  else {
   for(const z of ['deck','reserve'])p[z]=p[z].map(c=>({uid:c.uid,owner:i,hidden:true,id:'AI_UNKNOWN',aiUnknown:true})).sort((a,b)=>a.uid.localeCompare(b.uid));
   p.hand=p.hand.map(c=>mods.some(m=>m.publicHand?.(s,i,c))?c:{uid:c.uid,owner:i,hidden:true,id:'AI_UNKNOWN',aiUnknown:true});
   for(const z of ['slots','back'])p[z]=p[z].map(c=>c?.hidden?{uid:c.uid,owner:i,hidden:true,mode:c.mode,entity:c.entity,id:'AI_UNKNOWN',aiUnknown:true}:c);
  }
 }
 return t;
}
function aiCombat(s,a){
 const l=locate(s,a.uid||a.a),target=a.target??a.t,t=target?locate(s,target):null;
 if(!l)return null;
 if(t&&(t.c.hidden||aiOpaque(t.c)))return {unknown:true,damage:[0,0],victims:[]};
 const b={...(s.attack||{}),a:l.c.uid,t:target||null,side:l.side,mode:l.c.mode,reduction:s.attack?.a===l.c.uid?s.attack.reduction||0:0,id:s.attack?.id||s.serial+1};
 const projected={...s,attack:b,damageCalculation:true};
 const result=combatMath(projected,l.c,t?.c||null),protectedUIDs=[],optionalProtection=[];
 for(const uid of result.victims){
  // Read protection availability, without invoking consuming preventDestroy hooks.
  const query={...projected},victim=locate(query,uid);if(!victim)continue;const c=victim.c,p=query.players[victim.side];
  const auto=face(c)&&(c.cnBattleWard>query.turn||c.yunAttackWard===b.id||c.ward&&!c.ward.used||C(c).level<=4&&validField(query,victim.side,'TW43-S06')&&!used(query,victim.side,p.field,'mountain'));
  const options=mods.flatMap(m=>m.destructionOptions?.(query,victim,'battle',1-victim.side,{ids:[uid]})||[]);
  if(auto)protectedUIDs.push(uid);
  for(const option of options){
   const cost=option.cost||(option.args?.cost?.uid?{kind:'discard',uid:option.args.cost.uid}:option.args?.equip?.uid?{kind:'send',uid:option.args.equip.uid}:null);
   optionalProtection.push({uid,side:victim.side,code:option.code,cost,free:!cost,kind:'battle-destruction',window:'destruction-choice',resource:'one-use-or-replacement'});
  }
  if(tw(c))for(const sword of p.slots.filter(t=>active(t)&&t.uid!==uid&&t.id==='TW43-M10'&&costAllowed(query,{uid:t.uid})&&!used(query,victim.side,t,'replace',true)))optionalProtection.push({uid,side:victim.side,code:'CORE_SWORD',cost:{kind:'tribute',uid:sword.uid},free:false,kind:'battle-destruction',window:'destruction-choice',resource:'replacement-body'});
 }
 return {...result,protectedUIDs,optionalProtection,unknown:false};
}
function aiPublicExposure(s,side){
 const p=s.players[side],q=s.players[1-side];let danger=0;
 for(const c of q.slots.filter(face)){
  if(c.aiUnknown)continue;
  const future={...s,turn:s.turn+(s.side===side?1:0)};
  if(!attackEligible(future,1-side,c))continue;
  const targets=p.slots.filter(Boolean);
  if(!targets.length){if(legalAttackTarget(future,{a:c.uid,side:1-side},null))danger=Math.max(danger,attackPower({...future,damageCalculation:true},c));continue;}
  for(const t of targets.filter(face)){
   if(!legalAttackTarget(future,{a:c.uid,side:1-side},t))continue;
   const r=aiCombat(future,{uid:c.uid,target:t.uid});if(r&&!r.unknown)danger=Math.max(danger,r.damage[side]);
  }
 }
 return danger;
}
function aiCardWorthBase(s,side,c){
 if(!c||aiOpaque(c))return 12;
 const d=C(c),p=s.players[side];
 if(sp(c)){
  const level=d.level||d.stars||0;
  let n=14+(d.atk||0)/200;
  if(level<=4&&!s.normalUsed)n+=p.slots.some(Boolean)?9:32;
  if(level>=5&&!s.normalUsed){const body=p.slots.filter(c=>c&&material(s,c)).length;if(body>=tributeNeed(s,side,c,false))n+=38;}
  return n;
 }
 if(field(c))return p.field?12:(['IN-ARUL','IN-MIRA','TW','TW-YUAN','JP'].includes(side===0?s.config.country:s.config.enemy)?45:30);
 if(/search|名冊|搜尋|請援/.test(d.text||''))return 27;
 return trap(c)?20:16;
}
function aiCost(s,side,cost){
 if(!cost)return 0;
 if(Array.isArray(cost)){
  const flat=cost.flatMap(c=>c.costs||[c]),life=flat.filter(c=>c.kind==='lp').reduce((n,c)=>n+c.amount,0);
  return flat.filter(c=>c.kind!=='lp').reduce((n,c)=>n+aiCost(s,side,c),0)+(life?aiCost(s,side,{kind:'lp',amount:life}):0);
 }
 if(cost.costs)return aiCost(s,side,cost.costs);
 if(cost.kind==='multi')return aiCost(s,side,cost.items||cost.parts||[]);
 if(cost.kind==='lp'){
  const remain=s.players[side].lp-cost.amount,danger=aiPublicExposure(s,side);
  return cost.amount/160+(remain<=0?100000:danger>0&&remain<=danger?450:0);
 }
 const link=cost.kind==='unlink'?s.links.find(l=>l.side===side):null;
 const ids=cost.uids||[cost.uid,cost.discard,...(link?[link.attached,link.spell]:[])].filter(Boolean);
 return ids.reduce((n,uid)=>{const l=locate(s,uid);if(!l)return n;let v=aiCardWorth(s,side,l.c);if(l.zone==='grave')v=6+aiRoleCardWorth(s,side,l.c);if(l.zone==='slots')v+=20;if(l.zone==='field')v+=20;return n+v;},0);
}
function aiUnwrap(s,a){if(a.kind!=='answer')return a;const v=s.pending?.options[a.index]?.value;return v?.action||v;}
function aiUnknownInterference(s,side){const p=s.players[1-side];return p.hand.some(aiOpaque)||p.back.some(c=>c?.hidden||aiOpaque(c))||p.slots.some(c=>c?.hidden||aiOpaque(c));}
function aiFollowupStrike(s,side,a,uid){
 return choices(s,side).some(next=>{
  if(next.kind!=='attack'||next.uid===a.uid||next.target!==uid)return false;
  const r=aiCombat(s,next);return r&&!r.unknown&&!r.damage[side]&&r.victims.includes(uid);
 });
}
function aiFastBase(s,side,a){
 const x=aiUnwrap(s,a),p=s.players[side];
 if(a.kind==='answer'){
  if(x===null)return 0;
  if(typeof x==='object'&&x?.code)return aiFast(s,side,{...x,kind:'effect'});
  if(typeof x==='object')return 12;
  const l=locate(s,x);if(!l)return 1;
  const key=s.pending.context?.key||'',code=s.resolving?.code||'';
  const spending=s.pending.context?.kind==='discardEnd'||/discard|cost|pay|shuffle|banish/i.test(key)||l.zone==='hand'&&!/deploy|krishna|escort|guard|rally|revive|special|fire/.test(code);
  return (spending?-1:1)*aiCardWorth(s,side,l.c);
 }
 if(a.kind==='pass')return 0;
 if(a.kind==='end'||a.kind==='main2')return 0;
 if(a.kind==='battle')return 2;
 if(a.kind==='draw'||a.kind==='advance'||a.kind==='enemyPrepare')return 100;
 if(a.kind==='set')return trap(locate(s,a.uid).c)?5:1;
 if(a.kind==='attack'){
  const r=aiCombat(s,a);if(!r)return -100;if(r.unknown){const source=locate(s,a.uid)?.c;return source&&value(s,source,'atk')<=0?-1:3;}
  const gain=r.damage[1-side]-r.damage[side];
  return gain/80+r.victims.reduce((n,uid)=>{
   const l=locate(s,uid),options=r.optionalProtection?.filter(o=>o.uid===uid)||[];
   if(r.protectedUIDs?.includes(uid))return n+(l.side!==side&&aiFollowupStrike(s,side,a,uid)?6:0);
   // Conservative branch: an enemy may choose a free protection; it is not certain.
   if(l.side!==side&&options.some(o=>o.free))return n+(aiFollowupStrike(s,side,a,uid)?6:0);
   if(l.side===side&&options.some(o=>o.free))return n-1;
   const valueOfVictim=25+value(s,l.c)/150;
   return n+(l.side===side?-1:1)*valueOfVictim*(l.side!==side&&options.length ? .5 : 1);
  },0)+(r.damage[1-side]>=s.players[1-side].lp?(aiUnknownInterference(s,side)?25:100000):0)-(r.damage[side]>=p.lp?100000:0)-.25;
 }
 if(a.kind==='summon'||a.kind==='reserveDeploy'){
  const c=locate(s,a.uid).c,mat=(a.tributes||[]).reduce((n,uid)=>n+aiCardWorth(s,side,locate(s,uid)?.c)*.6,0);
  return 24+(C(c).atk||0)/150-mat+(a.mode==='atk'?2:0)-(a.summonLP?aiCost(s,side,{kind:'lp',amount:a.summonLP}):0);
 }
 if(a.kind==='position')return 1;
 if(a.kind==='synchro')return 30;
 if(a.kind!=='effect')return 1;
 let n=10;
 if(/search|contract|invite|registry|four|summon|deploy|rally|escort|fusion/.test(a.code))n=24;
 if(/cycle|draw/.test(a.code))n=locate(s,a.uid)?.zone==='hand'?-8:3;
 if(a.code==='field')n=p.field?-8:24;
 if(/shield|ward|guard/.test(a.code))n=4;
 if(/negate|cancel|reduce|redirect|seal|paper/.test(a.code))n=20;
 if(a.code==='continuous')n=12;
 if(a.code==='ONM_breakCharm'&&a.args?.enemy)n+=8;
 if(a.code==='EG_osiris')n+=(a.args?.target?5:0)+(a.args?.other?5:0);
 return n-aiCost(s,side,a.cost);
}
function aiBattleOpportunity(s,side){
 if(s.side!==side||!['main','battle'].includes(s.phase)||s.pending||s.window)return 0;
 const t=clone(s);t.phase='battle';
 if(s.phase==='main'&&!choices(s,side).some(a=>a.kind==='battle'))return 0;
 const attacks=choices(t,side).filter(a=>a.kind==='attack'),best=new Map();
 for(const a of attacks){const n=aiFast(t,side,a);best.set(a.uid,Math.max(best.get(a.uid)||0,n));}
 // A conservative single legal strike, not a sum that kills the same target twice.
 return Math.max(0,...best.values());
}
function aiEvaluate(s,side){
 if(s.winner!==null){if(s.winner===side&&aiUnknownInterference(s,side))return aiEvaluate({...s,winner:null},side)+25;return s.winner===side?1000000:s.winner===2?0:-1000000;}
 let n=0;
 for(let i=0;i<2;i++){
  const p=s.players[i],sign=i===side?1:-1;
  n+=sign*(p.lp/180+Math.min(p.hand.length,6)*12+(p.field?18:0)+p.back.filter(Boolean).reduce((v,c)=>v+(c.aiUnknown||trap(c)?20:10),0));
  n+=sign*p.grave.reduce((v,c)=>v+(sp(c)?2:1),0);
  for(const c of p.slots.filter(Boolean))n+=sign*(c.hidden?32:32+aiRoleBoardStrength(s,c,i===side)/140);
  if(i===side){
   const names=new Set(p.grave.filter(c=>/^KR-N(0[1-9]|1[0-5])$/.test(c.id)).map(c=>c.id));
   if(capacity(s,i)&&p.hand.some(c=>['KR-N09','KR-N14','KR-N15'].includes(c.id)&&names.size>=(c.id==='KR-N15'?2:3)&&canSpecial(s,i,c)&&!used(s,i,c,'register')))n+=24;
   if(new Set(p.grave.filter(trap).map(c=>c.id)).size>=2&&p.back.some(c=>c?.id==='EG-S03'&&active(c)&&!used(s,i,c,'draw')))n+=14;
  }
  if(i===side){const danger=aiPublicExposure(s,side);if(danger>0&&p.lp<=danger)n-=450;}
 }
 return n+aiBattleOpportunity(s,side)+aiRoleState(s,side).value;
}
function aiPreview(s,side,a){
 const t=clone(s),startTurn=t.turn,trace=[],x=aiUnwrap(t,a);
 const hiddenTarget=[x?.target,x?.args?.target,x?.args?.enemy].filter(Boolean).some(uid=>{const l=locate(t,uid);return l&&l.side!==side&&(l.c.hidden||aiOpaque(l.c));});
 if(hiddenTarget)return aiPreviewUnknown(s,t,side,'hidden-target');
 try{
  const legal=choices(t,side).find(b=>JSON.stringify(b)===JSON.stringify(a));if(!legal)return null;
  aiGuardPreview(t);
  command(t,side,legal);trace.push(a);
  for(let k=0;k<60&&(t.pending||t.window||t.resolving||t.jobs.length);k++){
   if(t.winner!==null)break;
   if(!t.pending&&!t.window){drain(t);continue;}
   const who=t.pending?.side??t.window?.side??t.side,opts=choices(t,who);if(!opts.length)return null;
   // Do not assume an opponent declines a known available counter.
   if(who!==side&&opts.some(a=>a.kind!=='pass'&&!(a.kind==='answer'&&t.pending?.options[a.index]?.value===null)))return aiPreviewUnknown(s,t,side,'opponent-response');
   const next=who===side?opts.map((a,i)=>({a,i,n:aiFast(t,side,a)})).sort((a,b)=>b.n-a.n||a.i-b.i)[0].a:opts.find(a=>a.kind==='pass')||opts.find(a=>a.kind==='answer'&&t.pending.options[a.index].value===null);
   if(!next)return null;
   command(t,who,next);
  }
  if(t.pending||t.window||t.resolving||t.jobs.length)return null;
  const conditional=aiUnknownInterference(s,side)||!!t.aiPreviewContext.legalityUnknown;
  const score=conditional&&t.winner===side?aiEvaluate({...t,winner:null},side)+25:aiEvaluate(t,side);
  return {state:t,score,conditional,turnChanged:t.turn!==startTurn,trace};
 }catch(error){if(error.aiUnknown)return aiPreviewUnknown(s,error.snapshot,side,error.kind);return null;}
}
// Unknown follow-up legality ends this speculative branch; never unwrap hidden deck order.
function aiPreviewChoices(s,side){
 try{return choices(s,side);}catch(error){if(error.aiUnknown)return [];throw error;}
}
function aiDependencyStarts(s,side,opts){
 const p=s.players[side],rank=actions=>actions.sort((a,b)=>aiFast(s,side,b)-aiFast(s,side,a));
 if(p.hand.some(c=>c.id==='CN40-S07')&&p.hand.some(c=>sp(c)&&C(c).level>=7)&&p.slots.some(c=>face(c)&&c.mode==='atk'&&material(s,c))){
  const candidates=rank(opts.filter(a=>a.kind==='effect'&&a.code!=='CN_invite'&&locate(s,a.uid)&&normalSpell(locate(s,a.uid).c))).slice(0,6);
  for(const a of candidates){const result=aiPreview(s,side,a);if(result&&!result.unknown&&!result.turnChanged&&aiPreviewChoices(result.state,side).some(a=>a.code==='CN_invite'))return {action:a,kind:'invite'};}
 }
 const high=opts.find(a=>a.code==='NO_search'&&a.args?.high);if(high&&!s.normalUsed)return {action:high,kind:'search-normal'};
 const fieldAction=opts.find(a=>a.code==='field');if(fieldAction&&!s.normalUsed&&p.hand.some(c=>sp(c)&&C(c).level===5))return {action:fieldAction,kind:'field-normal'};
 return null;
}
function aiDependencyFollow(s,side,kind,opts){
 if(kind==='invite')return opts.filter(a=>a.code==='CN_invite');
 if(kind==='search-normal')return opts.filter(a=>a.kind==='summon'&&C(locate(s,a.uid).c).level>=7);
 if(kind==='field-normal')return opts.filter(a=>a.kind==='summon'&&C(locate(s,a.uid).c).level===5);
 return [];
}
function tacticalAI(s,side,opts){
 const o=aiObservation(s,side),ranked=opts.map((a,i)=>({a,i,n:aiFast(o,side,a)})).sort((a,b)=>b.n-a.n||a.i-b.i);
 if(opts.length===1)return opts[0];
 if(s.phase==='battle'&&!s.pending&&!s.window)return ranked[0].a;
 if(s.pending&&ranked.every(r=>typeof aiUnwrap(o,r.a)!=='object'||aiUnwrap(o,r.a)===null))return ranked[0].a;
 const base=aiEvaluate(o,side),trials=[];
 const add=a=>{if(a&&!trials.includes(a))trials.push(a);};
 // At most four dependency routes. Immediate battle/pass/end stay available.
 const dependency=aiDependencyStarts(o,side,opts);if(dependency)add(dependency.action);
 ranked.filter(r=>['effect','summon','position','answer','set'].includes(r.a.kind)).slice(0,dependency?3:4).forEach(r=>add(r.a));
 aiRoleCandidates(o,side,opts).forEach(add);
 add(ranked[0].a);
 add(opts.find(a=>a.kind==='battle'));add(opts.find(a=>a.kind==='pass'));add(opts.find(a=>a.kind==='end'||a.kind==='main2'));
 let best=ranked[0],bestN=-Infinity;
 for(const a of trials){
  const first=aiPreview(o,side,a);if(!first)continue;
  let n=first.score-base-.25;
  if(!first.unknown&&!first.turnChanged&&first.state.winner===null&&!first.state.pending&&!first.state.window){
   let t=first.state;
   for(let step=1;step<3;step++){
    const nexts=aiPreviewChoices(t,side).filter(a=>['effect','summon','position','battle','attack'].includes(a.kind));
    const chain=dependency?.action===a&&step===1?aiDependencyFollow(t,side,dependency.kind,nexts):[];
    const next=(chain.length?chain:nexts).map((a,i)=>({a,i,n:aiFast(t,side,a)})).sort((a,b)=>b.n-a.n||a.i-b.i).slice(0,3);
    let follow=null;
    for(const r of next){const q=aiPreview(t,side,r.a);if(q&&(!follow||q.score>follow.score))follow=q;}
    if(!follow||!chain.length&&follow.score<=aiEvaluate(t,side))break;
    n=Math.max(n,follow.score-base-.25*(step+1));if(follow.unknown)break;t=follow.state;if(t.winner!==null||follow.turnChanged)break;
   }
  }
  // Keep abstract draw/card-information estimates; never inspect the unknown draw.
  const i=opts.indexOf(a);if(n>bestN||(n===bestN&&i<best.i)){best={a,i};bestN=n;}
 }
 return best.a;
}
// Role policies operate on the same visible state and original legal actions as shared AI.
// Values express revocable preparation/retention, never new legality or future draws.
const aiHeroPolicies={
 TW:{goal:'場地與五星轉換',codes:['four','contract','fusion','zheng']},
 'TW-YUAN':{goal:'護壇伙伴與精確反制',codes:['TJ_revive','TJ_repel','TJ_counter','TJ_battleZero']},
 CN:{goal:'符籙結算後請援',codes:['CN_invite']},
 YUN:{goal:'低星回收與伙伴交換',codes:['YUN_recover','YUN_recoverSpell','YUN_mend','YUN_channel','YUN_shift']},
 JP:{goal:'場地、墓地行法與主從',codes:['absorb','selfHigh','seimeiSearch','sunGate','field']},
 'JP-N-HERO':{goal:'對應式法與貴人附加',codes:['ONM_seekSpell','ONM_invite','ONM_breakCharm']},
 KR:{goal:'整鼓或降神的回合取捨',codes:['KR_borrow','KR_prepare','KR_yut']},
 'KR-N-HERO':{goal:'不同名墓地歸籍與轉位突破',codes:['ENV_register','ENV_switch','ENV_recoverShuffle']},
 'TH-LUANGPOR':{goal:'合資格守備攻擊陣形',codes:['TH_ownShift','TH_waterElephant','TH_nagaGuard']},
 'TH-AJARN':{goal:'請神準備與材料後效',codes:['TH_ritual','TH_searchRitual','TH_materialRecover','TH_materialWard']},
 'IN-ARUL':{goal:'姿態分支與有效切換',codes:['IN_search','IN_boost','IN_recover','IN_switch','IN_match']},
 'IN-MIRA':{goal:'庭院伙伴與戰階取捨',codes:['field','IN_search','IN_deploy','IN_krishna']},
 'EG-HERO':{goal:'伏兵回收與次輪布防',codes:['EG_recover','EG_osiris','EG_searchTrap','EG_chamberDraw']},
 'EG-P-HERO':{goal:'生命支付換有效突破',codes:['EG_defMinus800','EG_raBoost','EG_raDestroy','EG_khepri']},
 'VA-MATTEO':{goal:'伙伴分層保護與犧牲窗口',codes:['VA_michael','VA_martin','VA_revive']},
 'VA-SOFIA':{goal:'低星免破與降守貫穿',codes:['VA_CLARE','VA_boost']},
 'NO-INGRID':{goal:'女武神通常解放與墓地費用',codes:['NO_search','NO_recover','NO_odin']},
 'NO-EINAR':{goal:'不同名集結與團隊支點',codes:['NO_deploy','NO_boost']}
};
function aiRoleState(s,side){
 const key=side===0?s.config?.country:s.config?.enemy,policy=aiHeroPolicies[key];
 if(!policy)return {key,goal:'共用戰術',ready:false,value:0,reserve:{}};
 const p=s.players[side],own=p.slots.filter(face),live=own.filter(c=>active(c)&&!(c.noEffectsUntil>=s.turn)),hand=p.hand.filter(c=>!aiOpaque(c));
 const enemy=s.players[1-side].slots.filter(c=>face(c)&&!aiOpaque(c)),normal=s.side===side&&!s.normalUsed;
 const low=c=>sp(c)&&C(c).level<=4,high=c=>sp(c)&&C(c).level>=5,usable=c=>!(c.cnBlockedUntil>=s.turn||c.noEffectsUntil>=s.turn);
 const h=id=>hand.filter(c=>c.id===id),f=id=>live.filter(c=>c.id===id),all=[...hand,...own,...p.grave],reserve={};
 let valueOfPlan=0,ready=false;
 const keep=(cards,n,credit=0)=>{for(const c of cards){reserve[c.uid]=Math.max(reserve[c.uid]||0,n);}if(cards.length)valueOfPlan+=credit;};
 const fieldReady=validField(s,side),materials=own.filter(c=>material(s,c)),has=(list,id)=>list.some(c=>c.id===id);
 const specialHigh=hand.filter(c=>high(c)&&C(c).level<=8&&canSpecial(s,side,c));
 switch(key){
 case 'TW':{
  const five=hand.filter(c=>sp(c)&&C(c).level===5),fiveField=materials.filter(c=>c.mode==='atk'&&C(c).level===5);
  ready=normal&&five.length>0&&validField(s,side,'TW43-S04')||fiveField.length>0&&h('TW43-M09').length>0;
  if(five.length||fiveField.length){keep(hand.filter(field),18);if(fieldReady)valueOfPlan+=8;}
  if(fieldReady){keep(five,18,normal?5:1);keep(fiveField,18,6);}
  if(materials.length>=2)keep(h('TW43-S10'),14,3);
  break;}
 case 'TW-YUAN':{
  const guards=live.filter(c=>c.id.startsWith('TW-J-M')),counter=guards.filter(c=>['TW-J-M07','TW-J-M08','TW-J-M09'].includes(c.id));
  ready=guards.length>=2&&counter.length>0&&!used(s,side,{id:'TJ_COUNTER'},'effect');
  if(ready){keep(counter,20,6);keep(guards.filter(c=>!counter.includes(c)),8);valueOfPlan+=Math.min(guards.length-1,2)*3;}
  if(normal&&!guards.length)keep(hand.filter(c=>low(c)&&c.id.startsWith('TW-J-M')),10,2);
  break;}
 case 'CN':{
  const atk=materials.filter(c=>c.mode==='atk'),invite=h('CN40-S07'),target=specialHigh.filter(c=>C(c).country==='CN');
  ready=!!invite.length&&target.some(c=>atk.length>=(C(c).level>=7&&p.resolvedSpellTurn!==s.turn?2:1));
  if(invite.length&&target.length&&atk.length){keep(invite,22,4);keep(target,14,3);keep(atk,9);if(p.resolvedSpellTurn===s.turn)valueOfPlan+=6;}
  break;}
 case 'YUN':{
  const grave=p.grave.filter(c=>C(c).country==='CN'&&(low(c)||normalSpell(c))),yaoji=f('CN-YUN-M07');
  ready=grave.length>0&&(yaoji.length>0||normal&&hand.some(c=>['CN-YUN-M05','CN-YUN-M07'].includes(c.id)));
  if(ready){keep(yaoji,16,5);keep(grave,6);}
  const pair=['CN-YUN-M04','CN-YUN-M05'];for(const id of pair)if(has(own,pair.find(x=>x!==id)))keep([...h(id),...f(id)],12,4);
  keep(hand.filter(c=>low(c)&&C(c).country==='CN'&&usable(c)),normal?9:4,normal?2:1);
  break;}
 case 'JP':{
  const spells=p.grave.filter(c=>normalSpell(c)&&C(c).country==='JP'),targets=hand.filter(c=>high(c)&&C(c).country==='JP');
  ready=fieldReady&&targets.some(c=>c.id==='JP19-M01'&&new Set(spells.map(c=>c.id)).size>=2||c.id==='JP19-M06'&&own.some(c=>C(c).level<=4)&&hand.some(normalSpell));
  if(targets.length&&spells.length&&(fieldReady||hand.some(field))){keep(hand.filter(field),17);if(fieldReady)valueOfPlan+=8;keep(spells,12,2);keep(targets,13,2);}
  const links=(s.links||[]).filter(l=>l.side===side);for(const l of links)keep(own.filter(c=>c.uid===l.host),18,5);
  break;}
 case 'JP-N-HERO':{
  const noble=f('JP-N09'),spells=hand.filter(c=>/^JP-N1[0-2]$/.test(c.id)&&usable(c));
  ready=noble.length>0&&spells.length>0;
  if(ready){keep(noble,20);keep(spells,10,2);}
  if(normal&&!spells.length&&hand.length>=2)keep(h('JP-N02'),20,5);
  if(!normal&&!own.length)keep(h('JP-N10'),0); // Finding another unplayable high is not readiness.
  break;}
 case 'KR':{
  const cost=materials.filter(low),spell=h('KR40-S01'),targets=specialHigh.filter(c=>C(c).country==='KR');
  ready=spell.length>0&&cost.length>0&&targets.some(c=>C(c).level<=6||hand.length>=3)&&!(p.krNoSpecialUntil>=s.turn);
  if(spell.length&&cost.length&&targets.length&&p.krNoSpecialUntil!==s.turn){keep(spell,16,3);keep(targets,14,2);keep(cost,8);}
  if(!ready&&hand.length<=2)keep(h('KR40-S03'),8,2);
  break;}
 case 'KR-N-HERO':{
  const grave=p.grave.filter(c=>/^KR-N(0[1-9]|1[0-5])$/.test(c.id)),names=new Set(grave.map(c=>c.id));
  const targets=hand.filter(c=>['KR-N09','KR-N14','KR-N15'].includes(c.id)&&canSpecial(s,side,c)&&!used(s,side,c,'register'));
  const minimum=targets.length?Math.min(...targets.map(c=>c.id==='KR-N15'?2:3)):Infinity;
  ready=capacity(s,side)>0&&names.size>=minimum;
  if(ready){keep(targets,18,4);keep(grave.filter(c=>grave.filter(t=>t.id===c.id).length===1),18,2);}
  break;}
 case 'TH-LUANGPOR':{
  const qualified=c=>['TH-L04','TH-L06','TH-L07','TH-L09'].includes(c.id)||c.thDefenseAttackUntil>=s.turn;
  const defenders=live.filter(c=>qualified(c)&&c.mode==='def');ready=s.side===side&&defenders.some(c=>attackEligible(s,side,c)&&!c.attacks);
  keep(defenders,12,5);if(defenders.length)keep(live.filter(c=>c.mode==='def'&&!qualified(c)),4,1);
  if(normal)keep(hand.filter(c=>qualified(c)),12,2);
  break;}
 case 'TH-AJARN':{
  const ritual=[...hand,...p.back.filter(Boolean)].some(c=>c.id==='TH-S01'&&usable(c)&&!c.negated&&!used(s,side,c)&&((locate(s,c.uid)?.zone==='back'&&c.hidden)||locate(s,c.uid)?.zone==='hand'&&p.back.includes(null)));
  const searching=s.resolving?.code==='TH_searchRitual'||s.pending?.side===side&&s.pending.options.some(o=>(o.value?.action||o.value)?.code==='TH_searchRitual');
  const preparing=normal&&h('TH-M02').some(usable)&&hand.length>=3&&p.deck.some(c=>c.id==='TH-S01');
  // thai-deck.js uses this same material predicate for hand AND field. It has no zone gate.
  const mats=[...hand,...materials].filter(c=>sp(c)&&material(s,c));
  const viable=specialHigh.filter(t=>{const list=mats.filter(c=>c.uid!==t.uid),sets=[...list.map(c=>[c]),...list.flatMap((c,i)=>list.slice(i+1).map(b=>[c,b]))];return sets.some(set=>set.reduce((n,c)=>n+C(c).level,0)>=C(t).level&&(capacity(s,side)||set.some(c=>own.some(t=>t.uid===c.uid))));});
  ready=ritual&&viable.length>0;
  if((ritual||searching||preparing)&&viable.length){keep(viable,(ritual||searching)&&viable.length===1?42:12,ritual||searching?4:1);keep(h('TH-S01'),28,4);keep(mats.filter(c=>!viable.includes(c)),8);if(ritual)valueOfPlan+=6;}
  if(normal&&!ritual&&viable.length)keep(h('TH-M02'),18,3);
  // A ward is one expiring protection, not permanent immunity.
  keep(live.filter(c=>c.thBattleWard>s.turn),5,3);
  break;}
 case 'IN-ARUL':{
  const shift=h('IN-S03').filter(usable),sources=live.filter(c=>/^IN-A/.test(c.id));
  ready=sources.length>0&&shift.length>0;
  if(ready){keep(shift,10,2);keep(sources,8,1);}
  if(normal&&!shift.length)keep(h('IN-A02'),hand.length>1?14:0,hand.length>1?3:0);
  if(normal&&p.grave.some(c=>low(c)&&C(c).country==='IN')&&hand.length>1)keep(h('IN-A06'),12,3);
  break;}
 case 'IN-MIRA':{
  const partners=live.filter(c=>/^IN-B/.test(c.id));ready=fieldReady&&partners.length>=2;
  if(partners.length||hand.some(c=>/^IN-B/.test(c.id))){if(!fieldReady)keep(h('IN-S02').slice(0,1),18,3);if(fieldReady)valueOfPlan+=8;}
  if(fieldReady){keep(partners,9,Math.min(3,partners.length));keep(hand.filter(c=>low(c)&&/^IN-B/.test(c.id)&&usable(c)),8,1);}
  if(normal&&!fieldReady)keep(h('IN-B02'),hand.length>1?20:0,hand.length>1?4:0);
  break;}
 case 'EG-HERO':{
  const traps=p.grave.filter(trap),space=p.back.filter(c=>!c).length;ready=traps.length>0&&space>0;
  if(ready){keep(f('EG-M06'),12,4);keep(h('EG-M06'),normal?18:4,normal?3:0);}
  if(space)keep(hand.filter(trap),7,1); // Future back-row value, never an immediate extra counter.
  const names=new Set(traps.map(c=>c.id));if(names.size>=2){keep(traps,7);keep(p.back.filter(c=>c?.id==='EG-S03'&&active(c)),10,3);}
  if(normal&&!hand.some(trap)&&hand.length>1)keep(h('EG-M05'),16,3);
  break;}
 case 'EG-P-HERO':{
  ready=enemy.length>0&&live.some(c=>['EG-P-M07','EG-P-M09'].includes(c.id));
  // No passive credit for having paid LP or for an unused pre-emptive shield.
  if(normal&&own.length&&capacity(s,side)&&p.lp>400)keep(h('EG-P-M01'),8,1);
  if(enemy.some(c=>value(s,c,'def')>1800))keep([...h('EG-P-M07'),...f('EG-P-M07')],8,1);
  break;}
 case 'VA-MATTEO':{
  const others=live.filter(c=>c.id!=='VA-M04');ready=others.length>0&&f('VA-M04').length>0;
  if(ready){keep(f('VA-M04'),14,5);keep(others,5);}
  if(p.grave.some(c=>low(c)&&C(c).country==='VA'))keep([...f('VA-M07'),...(normal?h('VA-M07'):[])],10,2);
  if(live.length>=2)keep(f('VA-M09'),16,3);
  break;}
 case 'VA-SOFIA':{
  const clare=f('VA-N04').filter(c=>!used(s,side,c,'protect')),pierce=f('VA-N09'),lower=f('VA-N06');
  ready=clare.length>0||pierce.length>0&&lower.length>0&&enemy.some(c=>c.mode==='def');
  keep(clare,10,3);if(pierce.length&&enemy.some(c=>c.mode==='def'))keep(lower,14,5);
  if(normal&&!own.length)keep(h('VA-N04'),14,3);
  break;}
 case 'NO-INGRID':{
  const valk=live.filter(c=>c.id==='NO-M04'&&material(s,c)&&!(c.noTributeUntil>=s.turn)),targets=hand.filter(c=>sp(c)&&C(c).level>=7&&C(c).level<=8);
  ready=normal&&valk.length>0&&targets.length>0;
  if(normal&&valk.length){keep(valk,20,5);keep(targets,12,3);keep(h('NO-S02'),18,targets.length?0:3);}
  if(normal&&targets.length)keep(h('NO-M04'),18,3);
  if(f('NO-M09').length)keep(p.grave.filter(c=>low(c)&&C(c).country==='NO'),16,2);
  break;}
 case 'NO-EINAR':{
  const peers=live.filter(c=>C(c).country==='NO'),names=new Set(peers.map(c=>c.id));ready=names.size>=2;
  if(ready){for(const c of peers)if(peers.filter(t=>t.id===c.id).length===1)keep([c],8,2);keep(f('NO-B-M08'),18,peers.length>1?5:0);}
  if(normal&&hand.length>=3&&capacity(s,side))keep(h('NO-B-M02'),16,3);
  // Thor needs TWO different OTHER peers; it is not a two-body party bonus.
  if(f('NO-B-M09').some(thor=>new Set(own.filter(c=>c.uid!==thor.uid).map(c=>c.id)).size>=2))valueOfPlan+=6;
  if(peers.length>=2)keep(h('NO-S06'),10,2);
  break;}
 }
 return {key,goal:policy.goal,ready:!!ready,stage:ready?'ready':Object.keys(reserve).length?'preparing':'inactive',value:Math.min(55,valueOfPlan),reserve};
}
function aiRoleCardWorth(s,side,c){
 if(!c||aiOpaque(c))return 0;
 const role=aiRoleState(s,side),p=s.players[side],loc=locate(s,c.uid);let n=role.reserve[c.uid]||0;
 if(loc?.zone==='deck'){
  // Search choices are evaluated by the role's currently missing known ingredients.
  const t=clone(s);t.players[side].deck=t.players[side].deck.filter(t=>t.uid!==c.uid);t.players[side].hand.push({...c});n=Math.max(n,Math.min(20,(aiRoleState(t,side).value-role.value)*2));
 }
 if(c.cnBlockedUntil>=s.turn)n*=.35;
 return n;
}
function aiRoleBoardStrength(s,c,own){
 let atk=value(s,c);
 // Expiring world ATK buffs earn value through actual battle opportunities, not fake next-turn strength.
 if(own)atk-=Math.min(atk,(c.worldBuffs||[]).filter(b=>b.key==='atk'&&b.amount>0&&b.until===s.turn).reduce((n,b)=>n+b.amount,0));
 return Math.max(atk,value(s,c,'def'));
}
function aiCardWorth(s,side,c){return aiCardWorthBase(s,side,c)+aiRoleCardWorth(s,side,c);}
function aiRoleOrder(s,side,a){
 const x=aiUnwrap(s,a);if(!x||typeof x!=='object')return 0;
 const r=aiRoleState(s,side),p=s.players[side],src=locate(s,x.uid)?.c,enemy=s.players[1-side].slots.filter(c=>face(c)&&!aiOpaque(c));
 let n=0;
 if(x.kind==='summon'&&src){
  // A reserve is not automatically a reason to summon it now. Reward actual starter uses separately.
  if(r.key==='JP-N-HERO'&&src.id==='JP-N02'&&p.hand.length>=2&&!p.hand.some(c=>/^JP-N1[0-2]$/.test(c.id)))n+=12;
  if(r.key==='EG-HERO'&&src.id==='EG-M06'&&p.grave.some(trap))n+=12;
  if(r.key==='NO-EINAR'&&src.id==='NO-B-M02'&&p.hand.length>=3)n+=10;
  if(r.key==='IN-MIRA'&&src.id==='IN-B02'&&!validField(s,side)&&p.hand.length>=2)n+=10;
  if(r.key==='NO-INGRID'&&C(src).level>=7&&x.tributes?.some(uid=>locate(s,uid)?.c.id==='NO-M04'))n+=8;
 }
 if(x.kind==='position'&&src&&r.key==='TH-LUANGPOR'&&['TH-L04','TH-L06','TH-L07','TH-L09'].includes(src.id)&&src.mode==='atk'&&active(src))n+=8;
 if(r.key==='JP-N-HERO'&&x.code==='ONM_breakCharm'&&x.args?.enemy)n+=8;
 if(r.key==='TH-AJARN'&&x.code==='TH_ritual')n+=8;
 if(r.key==='KR-N-HERO'&&x.code==='ENV_register')n+=10;
 if(r.key==='KR-N-HERO'&&x.code==='ENV_boost'){
  const t=src;const usable=t&&t.mode==='atk'&&enemy.some(e=>e.mode==='atk'&&value(s,e)>=value(s,t)&&value(s,e)<value(s,t)+400||e.mode==='def'&&value(s,e,'def')>=value(s,t)&&value(s,e,'def')<value(s,t)+400);
  if(!usable)n-=28;
 }
 if(r.key==='NO-INGRID'&&x.code==='NO_search'&&x.args?.high&&!s.normalUsed)n+=12;
 if(r.key==='EG-P-HERO'&&['EG_ward','EG_selfWard'].includes(x.code)&&!s.window&&!s.pending)n-=18;
 if(r.key==='IN-MIRA'&&x.code==='IN_krishna'&&aiBattleOpportunity(s,side)>20)n-=20;
 if(r.key==='KR'&&x.code==='KR_prepare'&&r.ready)n-=14;
 if(r.key==='KR'&&x.code==='KR_yut'&&x.args?.mode==='risk'){
  const t=locate(s,x.args.target)?.c;
  // Random outcomes remain unknown to previews. Only public, meaningful thresholds earn a candidate.
  if(t&&enemy.some(e=>{const gap=value(s,e,e.mode==='def'?'def':'atk')-value(s,t);return gap>=400&&gap<1200;}))n+=12;else n-=16;
 }
 return n;
}
function aiFast(s,side,a){
 // Object answers recurse through aiFastBase; do not add the same role hint twice.
 const x=aiUnwrap(s,a);return aiFastBase(s,side,a)+(a.kind==='answer'&&x&&typeof x==='object'&&x.code?0:aiRoleOrder(s,side,a));
}
function aiRoleCandidates(s,side,opts){
 const role=aiRoleState(s,side),policy=aiHeroPolicies[role.key];if(!policy)return [];
 const seen=new Set(),ranked=opts.map((a,i)=>({a,i,x:aiUnwrap(s,a),n:aiFast(s,side,a)})).filter(r=>r.x&&typeof r.x==='object').filter(r=>{
  if(r.x.kind!=='summon'&&!policy.codes.includes(r.x.code)&&r.x.code!=='TH_ritual')return false;
  const signature=JSON.stringify(r.x);if(seen.has(signature))return false;seen.add(signature);return true;
 }).sort((a,b)=>b.n-a.n||a.i-b.i);
 if(ranked.length<=2)return ranked.map(r=>r.a);
 const first=ranked[0],payment=x=>JSON.stringify({tributes:[...(x.tributes||[])].sort(),cost:x.cost}),aftermath=x=>{
  const items=x.cost?.items||x.cost?.costs||[x.cost],paid=items.flatMap(c=>c?.uids||[c?.uid]).filter(Boolean).map(uid=>locate(s,uid)?.c.id);
  return ['TH-M04','TH-M05'].filter(id=>paid.includes(id)).join('|');
 };
 // Bounded search must still prune; novelty is a ranking tie-break, NEVER a claim of equivalence.
 // Only byte-identical action payloads were deduplicated above. Payments, targets and poses survive.
 const rest=ranked.slice(1).map(r=>({...r,priority:r.n+(payment(r.x)!==payment(first.x)?4:0)+(aftermath(r.x)!==aftermath(first.x)?8:0)+(r.x.args?.mode!==first.x.args?.mode||r.x.mode!==first.x.mode?1:0)})).sort((a,b)=>b.priority-a.priority||a.i-b.i);
 return [first.a,rest[0].a];
}
// Internal diagnostic helper. Not exported by the production API or rendered in the player UI.
function aiRoleStatus(s,side=1){const r=aiRoleState(aiObservation(s,side),side);return {...r,reservedUIDs:Object.keys(r.reserve)};}

function ai(s,side=1){
 // Hero AI is read-only even when modules lazily initialise bookkeeping. Special modes retain their original hooks.
 if(!ocg(s)&&!s.expedition&&!s.nether?.queen&&[s.config?.country,s.config?.enemy].every(c=>D.heroRoutes.includes(c)))s=clone(s);
 const opts=choices(s,side);if(!opts.length)return null;
 // Story/queen/expedition/OCG hooks retain their existing scope and behavior.
 if(ocg(s)||s.expedition||s.nether?.queen||![s.config?.country,s.config?.enemy].every(c=>D.heroRoutes.includes(c)))return aiLegacy(s,side);
 for(const m of mods){const chosen=m.ai?.(s,side,opts);if(chosen&&opts.includes(chosen))return chosen;}
 return tacticalAI(s,side,opts);
}

function surrender(s,side=0){finish(s,1-side,D.names[side]+'投降，本場結束。',side);}
function forcePlayerWin(s){if(!s||s.winner!==null)return s;finish(s,0,'強制通關：依玩家勝利結算。');return s;}
const H={D,C,positionLocked,finish,checkLP,cleanup,activate,emitHook,affectedBy,pay,frame,summonBatch,clone,sp,face,active,normalSpell,field,trap,rng,shuffle,locate,remove,move,clean,draw,used,use,capacity,material,pairs,summon,queueDestroy,ask,pick,log,returnCard,value,canSpecial,destroyed,legalAttackTarget,destructionTargets};
mods=[typeof module!=='undefined'?require('./cn.js'):root.CNDeck,typeof module!=='undefined'?require('./kr.js'):root.KRDeck,typeof module!=='undefined'?require('./yunshu.js'):root.YunshuDeck,typeof module!=='undefined'?require('./cn-story-enemies.js'):root.PortraitChengStoryEnemies,typeof module!=='undefined'?require('./yun-story-enemies.js'):root.PortraitYunStoryEnemies,typeof module!=='undefined'?require('./jp-story-enemies.js'):root.PortraitJPStoryEnemies,typeof module!=='undefined'?require('./kr-story-enemies.js'):root.PortraitKRStoryEnemies,typeof module!=='undefined'?require('./th-story-enemies.js'):root.PortraitTHStoryEnemies,typeof module!=='undefined'?require('./mari-story-enemies.js'):root.PortraitMariStoryEnemies,typeof module!=='undefined'?require('./arul-story-enemies.js'):root.PortraitArulStoryEnemies,typeof module!=='undefined'?require('./mira-story-enemies.js'):root.PortraitMiraStoryEnemies,typeof module!=='undefined'?require('./karim-story-enemies.js'):root.PortraitKarimStoryEnemies,typeof module!=='undefined'?require('./salma-story-enemies.js'):root.PortraitSalmaStoryEnemies,typeof module!=='undefined'?require('./einar-story-enemies.js'):root.PortraitEinarStoryEnemies,typeof module!=='undefined'?require('./ingrid-story-enemies.js'):root.PortraitIngridStoryEnemies,typeof module!=='undefined'?require('./matteo-story-enemies.js'):root.PortraitMatteoStoryEnemies,typeof module!=='undefined'?require('./sofia-story-enemies.js'):root.PortraitSofiaStoryEnemies,...(D.worldModules||[]),typeof module!=='undefined'?require('./nether.js'):root.ShenluNether,typeof module!=='undefined'?require('./expedition.js'):root.ShenluExpedition].filter(Boolean).map(m=>m.install(H));
const api={create,choices,command,view,ai,aiLegacy,aiObservation,aiCombat,surrender,forcePlayerWin,value,locate,card:C,clone,drain,effectChoices,availability};if(typeof module!=='undefined')module.exports=api;else root.TW09Engine=api;
})(globalThis);

