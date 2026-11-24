(function(root){'use strict';const node=typeof module!=='undefined',N=node?require('./core/einar-story-enemies.js'):root.PortraitEinarStoryEnemies,E=node?require('./core/duel-engine.js'):root.TW09Engine;
const defs=[
{title:'沒被唱到的名字',hero:'NO-B-M04',enemy:['NO-EI-E01'],hand:['NO-B-M02','NO-B-M01','NO-S03'],goal:'通常出場夏爾維，棄神木庇蔭讓古爾托普守備特殊出場；埃吉爾加成至2000戰破希爾妲1900，三位伙伴存活。',hints:['不能把唯一出場候選當費用。','古爾托普本回合效果無效，不立刻轉姿。']},
{title:'換個站位，也在同行',hero:'NO-B-M04',enemy:['NO-EI-E02'],hand:[],normalUsed:true,goal:'古爾托普將埃吉爾由守備轉攻，埃吉爾2000戰破阿絲特麗1900，兩位伙伴存活。',hints:['使用伙伴的表示切換，不刷新攻擊次數、不繞過表示鎖。']},
{title:'太完美的傳言',hero:'NO-B-M04',enemy:['NO-EI-E03'],hand:['NO-S05','NO-S03'],normalUsed:true,goal:'斷縛之矛棄神木庇蔭，破壞完美戰歌；埃吉爾2000戰破薇爾妲1900，伙伴存活。',hints:['公開的完美戰歌留場時，薇爾妲不被戰鬥破壞。','破壞後場不等於無效已發動效果。']},
{title:'先問誰願意同行',hero:'NO-B-M04',enemy:['NO-EI-E04'],hand:['NO-B-M05','NO-S03'],goal:'史基尼爾通常出場，洗回神木庇蔭搜尋海姆達爾入手；蘿絲克瓦給埃吉爾+300，合計2300戰破艾莉絲2200。',hints:['搜尋只入手，不免費出場。海姆達爾留手。']},
{title:'守望者也會受傷',hero:'NO-B-M06',heroZone:'hand',enemy:['NO-EI-E05'],hand:[],deadline:5,goal:'解放古爾托普請海姆達爾；敵2400攻埃吉爾2000時，海姆達爾保護並實際免去戰破，仍受400傷害。下回合蘿絲克瓦強化海姆達爾至2500戰破敵方，三位伙伴存活。',hints:['海姆達爾不保護自己。出場後先交回合。','保護提示須選擇使用；不是只發動就算完成。']},
{title:'把返航寫進歌裡',hero:'NO-B-M07',heroZone:'hand',enemy:['NO-EI-E06'],hand:[],goal:'解放史基尼爾請海宴巨人艾吉爾，回收古爾托普入手；巨人2300戰破2200守衛，埃吉爾留下。',hints:['詩人埃吉爾與海宴巨人艾吉爾是不同伙伴。','回收只回手，古爾托普今天先休息。']},
{title:'不必唱成同一個聲音',hero:'NO-B-M04',enemy:['NO-EI-E05B'],hand:['NO-B-M08'],goal:'場上已有兩體以上靈體，解放夏爾維讓布拉吉攻擊表示通常出場，保留古爾托普、埃吉爾與蘿絲克瓦；埃吉爾1700＋伙伴300＋布拉吉300＋蘿絲克瓦300＝2600，戰破西格妮2500。',hints:['布拉吉在我方已有兩體以上靈體時，攻擊表示通常出場只需解放一體。本關解放夏爾維，其餘伙伴留場。','布拉吉不給自己加成，同名來源不能無限疊加。']},
{title:'號角之外的回答',hero:'NO-B-M09',heroZone:'hand',enemy:['NO-EI-E07'],hand:[],goal:'場上已有兩體以上靈體，解放夏爾維讓索爾攻擊表示通常出場，保留埃吉爾與蘿絲克瓦；蘿絲克瓦+300、索爾自身+600，使2900→3800，戰破洛基3600守備。',hints:['索爾發動與結算時，除自己外須有兩體彼此不同名伙伴。','成功加600後伙伴離場不撤回加成；本關仍須保留兩位伙伴。']}
];const lessons=defs.map((l,i)=>({country:'NO-EINAR',story:true,id:'no-einar-'+String(i+1).padStart(2,'0'),mission:i+1,phase:'main',normalUsed:false,deadline:3,setup:'挑戰從第3回合開始；已在場的伙伴不會再次發動出場效果。',explanation:'本關使用40張教學牌組，不改動你的牌組。請完成指定卡片效果與戰鬥，並保住目標伙伴。',...l}));
function enemyRecipe(){return {main:[...Object.keys(N.cards).flatMap(id=>Array(3).fill(id)),...['NO-S01','NO-S02','NO-S05','NO-S06'].flatMap(id=>Array(3).fill(id)),'NO-S03'],extra:[]};}
function create(l){const s=E.create(2026100100+l.mission,{country:'NO-EINAR',enemy:'NO-INGRID',first:0,lp:6000,enemyLP:6000,enemyRecipe:enemyRecipe()}),t={lesson:l,state:s,hero:null,targets:[],startedTurn:3,hint:0,hiddenHint:true,effects:[],combats:[],attacks:[],outcome:null};for(const p of s.players){p.deck.push(...p.hand);p.hand=[];}s.turn=3;s.phase='main';s.normalUsed=l.normalUsed;s.log=[];s.einarStoryMission=l.id;s.einarStoryEvidence=[];
function take(side,id,zone='hand',mode='atk'){const p=s.players[side],i=p.deck.findIndex(c=>c.id===id);if(i<0)throw Error('艾納借卡不足 '+id);const c=p.deck.splice(i,1)[0];if(['slots','back'].includes(zone)){Object.assign(c,{hidden:false,mode,entered:1,setTurn:1,changed:0,attacks:0,entity:++s.serial});p[zone][p[zone].indexOf(null)]=c;}else p[zone].push(c);return c.uid;}
t.hero=take(0,l.hero,l.heroZone||'slots',l.mission===2?'def':'atk');l.hand.forEach(id=>take(0,id));t.targets=l.enemy.map(id=>take(1,id,'slots',l.mission===8?'def':'atk'));t.materials=[];
if(l.mission===2)t.partner=take(0,'NO-B-M01','slots');
if([3,4,5,7,8].includes(l.mission))t.support=take(0,'NO-B-M03','slots');
if([5,6,8].includes(l.mission))t.poet=take(0,'NO-B-M04','slots');
if(l.mission===5)t.materials=[take(0,'NO-B-M01','slots')];
if(l.mission===6){t.materials=[take(0,'NO-B-M05','slots')];t.partner=take(0,'NO-B-M01','grave');}
if([7,8].includes(l.mission))t.materials=[take(0,'NO-B-M02','slots'),take(0,'NO-B-M01','slots')];
if(l.mission===3)t.back=take(1,'NO-EI-SEAL','back');return t;}
function evaluate(t){const s=t.state,n=t.lesson.mission;if(t.outcome||s.pending||s.window||s.resolving||s.stack.length||s.jobs.length||s.attack)return t.outcome;const ev=s.einarStoryEvidence,loc=u=>E.locate(s,u),alive=u=>loc(u)?.side===0&&loc(u)?.zone==='slots',live=id=>s.players[0].slots.some(c=>c?.id===id),res=(code,id,target)=>ev.some(e=>e.kind==='resolved'&&e.side===0&&e.code===code&&(!id||e.id===id)&&(!target||e.args.target?.uid===target)),sum=id=>ev.some(e=>e.kind==='summon'&&e.side===0&&e.id===id&&e.normal),paid=()=>t.materials.every(u=>loc(u)?.zone==='grave'),kill=()=>loc(t.targets[0])?.zone==='grave'&&t.combats.some(e=>e.from?.uid===t.hero&&e.target?.uid===t.targets[0]);let pass=false;
if(n===1)pass=sum('NO-B-M02')&&res('NO_deploy','NO-B-M02')&&ev.some(e=>e.kind==='summon'&&e.id==='NO-B-M01'&&!e.normal&&e.mode==='def')&&live('NO-B-M01')&&live('NO-B-M02');
if(n===2)pass=res('NO_switch','NO-B-M01',t.hero)&&alive(t.partner);
if(n===3)pass=res('NO_destroy','NO-S05',t.back)&&loc(t.back)?.zone==='grave'&&alive(t.support);
if(n===4)pass=sum('NO-B-M05')&&res('NO_search','NO-B-M05')&&s.players[0].hand.some(c=>c.id==='NO-B-M06')&&res('NO_boost','NO-B-M03',t.hero)&&alive(t.support)&&live('NO-B-M05');
if(n===5)pass=sum('NO-B-M06')&&paid()&&res('NO_ward','NO-B-M06',t.poet)&&alive(t.poet)&&alive(t.support)&&s.turn===5&&s.players[0].lp===5600&&ev.some(e=>e.kind==='damage'&&e.target===t.poet&&e.turn===4)&&res('NO_boost','NO-B-M03',t.hero);
if(n===6)pass=sum('NO-B-M07')&&paid()&&res('NO_recover','NO-B-M07',t.partner)&&loc(t.partner)?.zone==='hand'&&alive(t.poet);
if(n===7)pass=sum('NO-B-M08')&&loc(t.materials[0])?.zone==='grave'&&alive(t.materials[1])&&live('NO-B-M08')&&alive(t.support)&&res('NO_boost','NO-B-M03',t.hero);
if(n===8)pass=sum('NO-B-M09')&&loc(t.materials[0])?.zone==='grave'&&alive(t.poet)&&alive(t.support)&&res('NO_boost','NO-B-M03',t.hero)&&res('NO_thor','NO-B-M09',t.hero);
if(pass&&alive(t.hero)&&kill()&&s.players[0].lp>0)return t.outcome={pass:true,summary:n===8?'號角之外，每個伙伴的聲音都留下了。':'你聽見了伙伴，也讓同行成為實際的力量。',explanation:t.lesson.explanation};if(s.winner!==null||s.turn>t.lesson.deadline||s.turn===t.lesson.deadline&&s.side!==0)return t.outcome={pass:false,summary:'尚未完成伙伴配合、戰鬥或存活目標，可重新挑戰。',explanation:t.lesson.explanation};return null;}
function enemyAction(t){const s=t.state,a=E.choices(s,1);if(s.pending)return a[0]||null;if(s.window)return a.find(a=>a.kind==='pass')||null;if(s.phase==='battle')return a.find(a=>a.kind==='attack'&&t.lesson.mission===5&&a.uid===t.targets[0]&&a.target===t.poet)||a.find(a=>a.kind==='main2')||null;return a.find(a=>['draw','advance','battle','end'].includes(a.kind))||null;}
const api={lessons,create,evaluate,enemyAction,enemyRecipe};if(node)module.exports=api;else root.PortraitEinarStoryLessons=api;})(globalThis);
