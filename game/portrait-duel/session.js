(function(root){'use strict';
const E=typeof module==='object'?require('./core/duel-engine.js'):root.TW09Engine;
const D=typeof module==='object'?require('./core/data.js'):root.TW09Data,copy=x=>JSON.parse(JSON.stringify(x));
const L=typeof module==='object'?require('./lessons.js'):root.PortraitLessons;
function createSession(){let state=null,revision=0,locked=false,entered=false,token=null,lesson=null,lessonRun=null;
 function lessonView(){if(!lessonRun)return lesson?{...lesson}:null;const l=lessonRun.lesson,o=lessonRun.outcome;return {id:l.id,region:L.countryFor(l.country),title:l.title,goal:l.goal,status:o?(o.pass?'passed':'failed'):'active',reason:o?o.summary+' '+o.explanation:lessonRun.feedback||'',hints:[...l.hints],setup:l.setup,story:!!l.story,progress:lessonRun.progress??null,threat:lessonRun.feedback||''};}
 function beginLesson(id,options={}){lessonRun=L.create(id,options);state=lessonRun.state;(typeof module==='object'?require('./core/nether.js'):root.ShenluNether).attachItems(state,options.underworldItems);state.ack=Number.MAX_SAFE_INTEGER;revision++;locked=false;entered=true;token='lesson:'+id;lesson=null;return snapshot();}
 function begin(config){if(!config||![0,1].includes(config.first)||!Number.isInteger(config.seed)||typeof config.token!=='string')throw Error('先後手或對局資料不完整');
  for(const k of ['country','enemy'])if(config[k]&&!D.availableRoutes.includes(config[k]))throw Error('不支援的對戰角色');
  lesson=null;lessonRun=null;state=E.create(config.seed,{...(config.expedition?{expedition:config.expedition,enemyNoShuffle:config.enemyNoShuffle}:{}),...(config.nether?{nether:config.nether}:{}),underworldItems:config.underworldItems,country:config.country||'CN',enemy:config.enemy||'TW-YUAN',lp:config.lp??6000,enemyLP:config.enemyLP,ruleSet:config.ruleSet,first:config.first,...(config.playerRecipe?{playerRecipe:config.playerRecipe}:{}),...(config.enemyRecipe?{enemyRecipe:config.enemyRecipe}:{})});state.ack=Number.MAX_SAFE_INTEGER;revision++;locked=false;entered=false;token=config.token;return snapshot();}
 function serialize(){if(!state)return null;return {schema:1,dataVersion:D.sourceSHA,state:copy(state),revision,token,lesson:lesson?copy(lesson):null,...(lessonRun?{lessonProgress:copy({...lessonRun,state:undefined})}:{})};}
 function restore(payload,expectedConfig){
  if(!payload||payload.schema!==1||payload.dataVersion!==D.sourceSHA)throw Error('對局存檔版本不相容；原存檔仍保留，請先匯出備份。');
  if(JSON.stringify(payload.state).includes('"TW43-M07"')){const error=Error('這份對局含已停用角色，不能在戰鬥中途替換效果；請從旅程存檔重新開始本場，已完成章節與獎勵保留。');error.code='RETIRED_CARD_RESTART';throw error;}
  const next=copy(payload.state),cfg=next?.config;
  /* DEMO_TW_ENEMY_IDENTITY: migrate only isolated Taiwan story metadata. */
  if(cfg?.enemy==='CN'&&['TW','TW-YUAN'].includes(cfg.country)&&/^tw-(az|yuan)-/.test(payload.lessonProgress?.lesson?.id||''))cfg.enemy='TW';
  if(!cfg||!D.availableRoutes.includes(cfg.country)||!D.availableRoutes.includes(cfg.enemy)||next.version!==2||!Number.isInteger(next.turn)||next.turn<1||![0,1].includes(next.side)||![null,0,1,2].includes(next.winner)||!['draw','standby','main','battle','main2','end','result'].includes(next.phase)||!Array.isArray(next.players)||next.players.length!==2)throw Error('對局存檔資料不完整');
  if(expectedConfig){for(const k of ['country','enemy','playerRecipe','first','lp','ruleSet','expedition','enemyNoShuffle'])if(expectedConfig[k]!==undefined&&JSON.stringify(cfg[k])!==JSON.stringify(expectedConfig[k]))throw Error('對局資料與已鎖定的挑戰設定不符');if(JSON.stringify(cfg.enemyRecipe)!==JSON.stringify(expectedConfig.expedition||expectedConfig.nether?expectedConfig.enemyRecipe:{main:D.deckFor(expectedConfig.enemy),extra:D.extraFor(expectedConfig.enemy)}))throw Error('對手牌組與關卡不符');}
  for(const k of ['jobs','stack','log'])if(!Array.isArray(next[k]))throw Error('對局流程資料不完整');
  if(next.pending&&(![0,1].includes(next.pending.side)||typeof next.pending.title!=='string'||!Array.isArray(next.pending.options)||!next.pending.options.length||next.pending.options.some(o=>!o||typeof o.label!=='string')||typeof next.pending.context?.kind!=='string'))throw Error('待回應選項資料不完整');
  if(next.window&&(![0,1].includes(next.window.side)||typeof next.window.kind!=='string'||![0,1].includes(next.window.passes)))throw Error('回應窗口資料不完整');
  const uids=new Set();for(const p of next.players){if(!Number.isFinite(p.lp)||!Array.isArray(p.slots)||p.slots.length!==5||!Array.isArray(p.back)||p.back.length!==5)throw Error('對局場面資料不完整');for(const zone of ['slots','back','hand','deck','grave','banished','extra','reserve']){if(!Array.isArray(p[zone])||p[zone].length>1000)throw Error('對局區域資料不完整');for(const c of p[zone].filter(Boolean)){if(!D.cards[c.id]||typeof c.uid!=='string'||uids.has(c.uid))throw Error('對局卡片資料不完整');uids.add(c.uid);}}if(p.field){if(!D.cards[p.field.id]||typeof p.field.uid!=='string'||uids.has(p.field.uid))throw Error('對局場地資料不完整');uids.add(p.field.uid);}}
  D.validateRecipe(cfg.playerRecipe);D.validateRecipe(cfg.enemyRecipe,{expeditionEnemy:!!cfg.expedition});
  E.create(cfg.seed??next.seed,{...(cfg.expedition?{expedition:cfg.expedition,enemyNoShuffle:cfg.enemyNoShuffle}:{}),...(cfg.nether?{nether:cfg.nether}:{}),underworldItems:cfg.underworldItems,country:cfg.country,enemy:cfg.enemy,lp:cfg.lp??6000,enemyLP:cfg.enemyLP,first:cfg.first,ruleSet:cfg.ruleSet,playerRecipe:cfg.playerRecipe,enemyRecipe:cfg.enemyRecipe});
  try{const opts=E.choices(next,next.pending?.side??next.window?.side??next.side);if(next.winner===null&&!opts.length)throw Error('沒有可接續操作');}catch(_){throw Error('對局流程無法接續；請匯出備份後恢復先前存檔。');}
  state=next;revision=Number.isInteger(payload.revision)?payload.revision+1:1;token=typeof payload.token==='string'?payload.token:'restored';lesson=payload.lesson?copy(payload.lesson):null;lessonRun=null;if(payload.lessonProgress){const progress=copy(payload.lessonProgress),definition=L.lessons.find(l=>l.id===progress.lesson?.id);if(!definition)throw Error('殘局資料不完整');lessonRun={...progress,lesson:definition,state};}locked=false;entered=true;return snapshot();
 }
 function actor(){return state?.pending?.side??state?.window?.side??state?.side;}
 function snapshot(){if(!state)return null;const v=E.view(state,0);for(let side=0;side<2;side++)for(const c of v.players[side].slots)if(c?.id){const original=E.locate(state,c.uid)?.c;c.publicATK=E.value(state,original,'atk');c.publicDEF=E.value(state,original,'def');}return v;}
 function finished(){return state?.winner!==null&&state!==null||lesson?.status==='failed'||!!lessonRun?.outcome}
 function assess(){if(!lesson||lesson.status!=='active')return;if(state.winner===0&&state.turn===lesson.turn){lesson.status='passed';lesson.reason='目標達成：在指定回合內擊敗敵方。'}else if(state.winner!==null||state.turn>lesson.turn){lesson.status='failed';lesson.reason=state.winner===1?'未達成：我方已敗北或認輸。':state.winner===2?'未達成：和局不符合擊敗敵方的目標。':'未達成：指定回合已結束，敵方仍未被擊敗。'}}
 function options(side=0){return !state||finished()||locked||!entered?[]:E.choices(state,side);}
 function commit(action,side,expectedRevision=revision){if(!entered||finished()||locked||expectedRevision!==revision)throw Error('請等待演出完成或重新選擇操作');const events=[],engineerHandHistory=[],cardId=E.locate(state,action.uid)?.c.id;E.command(state,side,action,{publicEvents:events,engineerHandHistory});if(lessonRun)L.record(lessonRun,side,{...action,cardId},events);else assess();revision++;locked=true;return {events,engineerHandHistory,revision,state:snapshot()};}
 function enter(t){if(t!==token||entered)return false;entered=true;return true;}
 function settle(r){if(r!==revision)return false;locked=false;return true;}
 function surrender(){if(!entered||locked)return false;E.surrender(state,0);if(lessonRun)L.evaluate(lessonRun);else assess();revision++;return true;}
 return {setLesson(){lesson={goal:'本回合擊敗敵方',turn:state.turn,status:'active',reason:''}},get lesson(){return lessonView()},get finished(){return !!finished()},begin,beginLesson,restore,serialize,enter,actor,snapshot,options,commit,settle,surrender,pause(){entered=false},get revision(){return revision},get state(){return state},get locked(){return locked},get entered(){return entered},ai(){return entered&&!locked&&!finished()?(lessonRun&&actor()===1?L.enemyAction(lessonRun):E.ai(state,actor())):null}};
}
function practice(session,kind='ally'){
 session.begin({seed:20260922,first:kind==='enemy'?1:0,token:'practice'});session.enter('practice');const s=session.state;
 function take(side,id,slot,mode='atk'){const p=s.players[side];for(const z of ['hand','deck']){const i=p[z].findIndex(c=>c.id===id);if(i>=0){const c=p[z].splice(i,1)[0];p.slots[slot]={...c,mode,hidden:false,entered:0,attacks:0,entity:++s.serial};return p.slots[slot]}}throw Error('練習卡不存在 '+id)}
 s.turn=3;s.side=kind==='enemy'?1:0;s.phase='battle';
 const a=take(0,kind==='enemy'?'CN40-M01':'CN40-M07',0),b=take(1,kind==='enemy'?'TW-J-M09':'TW-J-M10',0);
 if(kind==='rear'){s.players[1].slots[3]=b;s.players[1].slots[0]=null;}
 if(kind==='roster'){s.players[0].slots[3]=a;s.players[0].slots[0]=null;}
 if(kind==='defense')b.mode='def';
 if(kind==='direct'){s.players[1].slots[0]=null;s.players[1].hand.push(b);}
 if(['summon','set','hand7'].includes(kind)){s.phase='main';const c=take(0,kind==='summon'?'CN40-M06':'CN40-M05',4);s.players[0].slots[4]=null;s.players[0].hand.push(c);while(s.players[0].hand.length<7)s.players[0].hand.push(s.players[0].deck.shift());}
 if(kind==='lesson')session.setLesson();
 if(['victory','lesson'].includes(kind))s.players[1].lp=1000;
 return {attacker:s.side?b:a,target:kind==='direct'?null:s.side?a:b};
}
const api={createSession,practice};if(typeof module==='object')module.exports=api;else root.PortraitSession=api;
})(globalThis);
