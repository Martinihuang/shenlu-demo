(function(root){'use strict';
const E=typeof module!=='undefined'?require('./core/duel-engine.js'):root.TW09Engine,D=typeof module!=='undefined'?require('./core/data.js'):root.TW09Data;
const baseLessons=typeof module!=='undefined'?require('./lesson-data.js'):root.PortraitLessonData,Story=typeof module!=='undefined'?require('./story-lessons.js'):root.PortraitStoryLessons;
const Yuan=typeof module!=='undefined'?require('./yuan-story-lessons.js'):root.PortraitYuanStoryLessons;
const Meeting=typeof module!=='undefined'?require('./meeting-lessons.js'):root.PortraitMeetingLessons;
const Cheng=typeof module!=='undefined'?require('./cheng-story-lessons.js'):root.PortraitChengStoryLessons;
const Yun=typeof module!=='undefined'?require('./yun-story-lessons.js'):root.PortraitYunStoryLessons;
const CNMeeting=typeof module!=='undefined'?require('./cn-meeting-lessons.js'):root.PortraitCNMeetingLessons;
const Tsuki=typeof module!=='undefined'?require('./tsuki-story-lessons.js'):root.PortraitTsukiStoryLessons;
const Yuki=typeof module!=='undefined'?require('./yuki-story-lessons.js'):root.PortraitYukiStoryLessons;
const JPMeeting=typeof module!=='undefined'?require('./jp-meeting-lessons.js'):root.PortraitJPMeetingLessons;
const Haryeong=typeof module!=='undefined'?require('./haryeong-story-lessons.js'):root.PortraitHaryeongStoryLessons;
const Doyun=typeof module!=='undefined'?require('./doyun-story-lessons.js'):root.PortraitDoyunStoryLessons;
const KRMeeting=typeof module!=='undefined'?require('./kr-meeting-lessons.js'):root.PortraitKRMeetingLessons;
const Songchai=typeof module!=='undefined'?require('./songchai-story-lessons.js'):root.PortraitSongchaiStoryLessons;
const Mari=typeof module!=='undefined'?require('./mari-story-lessons.js'):root.PortraitMariStoryLessons;
const THMeeting=typeof module!=='undefined'?require('./th-meeting-lessons.js'):root.PortraitTHMeetingLessons;
const Arul=typeof module!=='undefined'?require('./arul-story-lessons.js'):root.PortraitArulStoryLessons;
const Mira=typeof module!=='undefined'?require('./mira-story-lessons.js'):root.PortraitMiraStoryLessons;
const INMeeting=typeof module!=='undefined'?require('./in-meeting-lessons.js'):root.PortraitINMeetingLessons;
const Karim=typeof module!=='undefined'?require('./karim-story-lessons.js'):root.PortraitKarimStoryLessons;
const Salma=typeof module!=='undefined'?require('./salma-story-lessons.js'):root.PortraitSalmaStoryLessons;
const EGMeeting=typeof module!=='undefined'?require('./eg-meeting-lessons.js'):root.PortraitEGMeetingLessons;
const Einar=typeof module!=='undefined'?require('./einar-story-lessons.js'):root.PortraitEinarStoryLessons;
const Ingrid=typeof module!=='undefined'?require('./ingrid-story-lessons.js'):root.PortraitIngridStoryLessons;
const NOMeeting=typeof module!=='undefined'?require('./no-meeting-lessons.js'):root.PortraitNOMeetingLessons;
const Matteo=typeof module!=='undefined'?require('./matteo-story-lessons.js'):root.PortraitMatteoStoryLessons;
const Sofia=typeof module!=='undefined'?require('./sofia-story-lessons.js'):root.PortraitSofiaStoryLessons;
const VAMeeting=typeof module!=='undefined'?require('./va-meeting-lessons.js'):root.PortraitVAMeetingLessons;
const storyFor=l=>l.id.startsWith('va-meeting-')?VAMeeting:l.id.startsWith('va-sofia-')?Sofia:l.id.startsWith('va-matteo-')?Matteo:l.id.startsWith('no-meeting-')?NOMeeting:l.id.startsWith('no-ingrid-')?Ingrid:l.id.startsWith('no-einar-')?Einar:l.id.startsWith('eg-meeting-')?EGMeeting:l.id.startsWith('eg-salma-')?Salma:l.id.startsWith('eg-karim-')?Karim:l.id.startsWith('in-meeting-')?INMeeting:l.id.startsWith('in-mira-')?Mira:l.id.startsWith('in-arul-')?Arul:l.id.startsWith('th-meeting-')?THMeeting:l.id.startsWith('th-mari-')?Mari:l.id.startsWith('th-songchai-')?Songchai:l.id.startsWith('kr-meeting-')?KRMeeting:l.id.startsWith('kr-doyun-')?Doyun:l.id.startsWith('kr-haryeong-')?Haryeong:l.id.startsWith('jp-meet-')?JPMeeting:l.id.startsWith('jp-yuki-')?Yuki:l.id.startsWith('jp-tsuki-')?Tsuki:l.id.startsWith('cn-meet-')?CNMeeting:l.id.startsWith('cn-yun-')?Yun:l.id.startsWith('cn-cheng-')?Cheng:l.id.startsWith('tw-meet-')?Meeting:l.id.startsWith('tw-yuan-')?Yuan:Story;
const lessons=[...baseLessons,...(VAMeeting?.lessons||[]),...(Sofia?.lessons||[]),...(Matteo?.lessons||[]),...(NOMeeting?.lessons||[]),...(Ingrid?.lessons||[]),...(Einar?.lessons||[]),...(EGMeeting?.lessons||[]),...(Salma?.lessons||[]),...(Karim?.lessons||[]),...(INMeeting?.lessons||[]),...(Mira?.lessons||[]),...(Arul?.lessons||[]),...(THMeeting?.lessons||[]),...(Mari?.lessons||[]),...(Songchai?.lessons||[]),...(Story?.lessons||[]),...(Yuan?.lessons||[]),...(Meeting?.lessons||[]),...(Cheng?.lessons||[]),...(Yun?.lessons||[]),...(CNMeeting?.lessons||[]),...(Tsuki?.lessons||[]),...(Yuki?.lessons||[]),...(JPMeeting?.lessons||[]),...(Haryeong?.lessons||[]),...(Doyun?.lessons||[]),...(KRMeeting?.lessons||[])];
const countries={CN:'中國',TW:'台灣',JP:'日本',KR:'韓國',EG:'埃及',TH:'泰國',IN:'印度',VA:'梵諦岡',NO:'北歐'};
function countryFor(route){if(route==='YUN')return 'CN';return String(route).split('-')[0];}
function forCountry(route){return lessons.filter(l=>!l.story&&countryFor(l.country)===countryFor(route));}
function create(id,options={}){const lesson=lessons.find(x=>x.id===id);if(!lesson)throw Error('未知練習');if(lesson.story){const custom=storyFor(lesson).create(lesson,options);if(custom)return custom;}const s=E.create(913001+({"tw-clear":7,"tw-seal":8,"no-boost":19,"no-ward":20,"tw-timing":21,"no-timing":28,"tw-reclaim":29,"no-revive":36,"tw-combo":37,"no-combo":44}[lesson.id]??lessons.indexOf(lesson)),{country:lesson.country,enemy:lesson.practiceEnemy||lesson.country,first:0,lp:4000,enemyLP:4000,...(lesson.story?{enemyRecipe:Story.enemyRecipe()}:{})});
// Relocate actual deck instances into a declared mid-game fixture; no generated cards or rule overrides.
for(const p of s.players){p.lp=3000;p.deck.push(...p.hand);p.hand=[];}
function take(side,id,zone,slot){const p=s.players[side],i=p.deck.findIndex(c=>c.id===id);if(i<0)throw Error('牌組缺少 '+id);const c=p.deck.splice(i,1)[0];if(zone==='slots'){Object.assign(c,{hidden:false,mode:'atk',entered:1,attacks:side===0&&lesson.defend?1:0,changed:0,entity:++s.serial});p.slots[slot]=c;}else p[zone].push(c);return c.uid;}
const hero=take(0,lesson.hero,lesson.heroZone||(lesson.recover?'grave':'slots'),2),targets=lesson.enemy.map((id,i)=>take(1,id,'slots',i+1));lesson.hand.forEach(id=>take(0,id,'hand'));s.turn=3;s.phase=lesson.phase||(lesson.defend?'main2':'main');s.normalUsed=lesson.normalUsed??!lesson.recover;s.log=[];
for(const id of lesson.extraGrave||[])take(0,id,'grave');
if(lesson.field){const uid=take(0,lesson.field,'hand');const c=s.players[0].hand.find(c=>c.uid===uid);s.players[0].hand=s.players[0].hand.filter(c=>c.uid!==uid);s.players[0].field={...c,hidden:false,entity:++s.serial};}
if(lesson.initialAttacks!==undefined)E.locate(s,hero).c.attacks=lesson.initialAttacks;
if(['no-boost','no-ward','no-timing','no-combo'].includes(lesson.id)){for(const id of ['NO-M01','NO-M02'])take(0,id,'slots',s.players[0].slots.indexOf(null));}
return {lesson,state:s,hero,targets,startedTurn:3,hint:1,hiddenHint:false,effects:[],combats:[],requiredCards:lesson.requiredCards||[lesson.hand[0]],attacks:[],outcome:null};}
const stable=s=>!s.pending&&!s.window&&!s.resolving&&!s.stack.length&&!s.jobs.length&&!s.attack;
function record(t,side,a,events){if(t.lesson.heroZone==='deck'&&E.locate(t.state,t.hero)?.zone==='deck'){const c=[...t.state.players[0].hand,...t.state.players[0].slots.filter(Boolean)].find(c=>c.id===t.lesson.hero);if(c)t.hero=c.uid;}if(a.kind==='effect'&&side===0)t.effects.push({code:a.code,uid:a.uid,cardId:a.cardId||E.locate(t.state,a.uid)?.c.id,turn:t.state.turn,opponentTurn:t.state.side===1});if(a.kind==='attack')t.attacks.push({uid:a.uid,target:a.target,side,turn:t.state.turn});for(const e of events||[])if(e.visual?.kind==='combat')t.combats.push(e.visual);evaluate(t);}
function evaluate(t){if(t.lesson.story&&t.lesson.mission)return storyFor(t.lesson).evaluate(t);if(t.outcome||!stable(t.state))return t.outcome;const s=t.state,lesson=t.lesson,l=E.locate(s,t.hero),alive=l?.side===0&&l.zone==='slots'&&s.players[0].lp>0;
const used=t.effects.some(a=>a.code===lesson.code)&&t.requiredCards.every(id=>t.effects.filter(a=>a.cardId===id).length>=(lesson.requiredCounts?.[id]||1)),killed=t.targets.every(uid=>E.locate(s,uid)?.zone==='grave'&&(lesson.effectKill||t.combats.some(v=>v.from?.uid===t.hero&&v.target?.uid===uid||v.from?.uid===uid&&v.target?.uid===t.hero)));
const heroLost=!alive&&(!(lesson.recover||lesson.heroZone==='deck')||t.combats.some(v=>v.from?.uid===t.hero||v.target?.uid===t.hero));const pass=alive&&used&&killed&&(!lesson.deadline||s.turn===lesson.deadline);let reason='';
if(!pass){if(heroLost||s.players[0].lp<=0||s.winner!==null)reason='需要保住我方目標靈體並完成擊破，本局未達成。';else if(lesson.defend&&!lesson.deadline&&(s.turn>4||s.side===1&&s.phase==='main2'))reason='對手攻擊已結束，尚未完成指定的伏兵反擊。';else if((!lesson.defend||lesson.deadline)&&(s.turn>(lesson.deadline||3)||s.turn===(lesson.deadline||3)&&s.side!==0))reason='指定回合已結束，尚未完成目標。';
if(!reason){if(lesson.id==='protect'&&t.combats.length)t.feedback='護身已結算，我方生命'+s.players[0].lp+'。還未通過：下回合讓湘夫人出場，再由湘君擊破白龍馬。';if(lesson.id==='timing'&&t.combats.length===1)t.feedback='第一擊已結算，保留伏兵回應下一名攻擊者。';return null;}}
const names=t.targets.filter(uid=>E.locate(s,uid)?.zone==='grave').map(uid=>D.cards[E.locate(s,uid).c.id].name);return t.outcome={pass,summary:'已擊破：'+(names.join('、')||'尚無')+'。我方生命 '+s.players[0].lp+'，對手生命 '+s.players[1].lp+'。',explanation:(pass?'':reason+' ')+lesson.explanation};}
function enemyAction(t){if(t.lesson.story){const custom=storyFor(t.lesson).enemyAction(t);if(custom!==undefined)return custom;}const s=t.state,a=E.choices(s,1);if(t.outcome)return null;if(s.pending)return a[0]||null;if(s.window)return a.find(x=>x.kind==='pass')||null;if(s.phase==='battle'){for(const uid of t.targets){const attack=a.find(x=>x.kind==='attack'&&x.uid===uid&&x.target===t.hero);if(attack)return attack;}return a.find(x=>x.kind==='main2')||null;}return a.find(x=>['draw','advance','battle','end'].includes(x.kind))||null;}
const api={lessons,countries,countryFor,forCountry,create,record,evaluate,enemyAction,stable,forCard:id=>lessons.find(l=>l.hand.includes(id))};if(typeof module!=='undefined')module.exports=api;else root.PortraitLessons=api;
})(globalThis);
