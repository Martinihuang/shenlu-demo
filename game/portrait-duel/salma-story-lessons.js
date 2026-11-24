(function(root){'use strict';
const node=typeof module!=='undefined',N=node?require('./core/salma-story-enemies.js'):root.PortraitSalmaStoryEnemies,E=node?require('./core/duel-engine.js'):root.TW09Engine;
const defs=[
{title:'河岸被抹去的名字',hero:'EG-M04',enemy:['EG-SL-E01'],hand:['EG-S05'],goal:'隼翼俯衝讓巴絲特1700加600至2300，戰破納迪婭2100並存活。',hints:['強化只限本回合；通常出場已用。']},
{title:'先把門留下',hero:'EG-M04',enemy:['EG-SL-E02'],hand:['EG-T01'],phase:'main2',deadline:5,goal:'蓋門前守衛，下一敵方回合宣攻時降攻700，巴絲特1700戰破莎米拉1400。',hints:['剛蓋下的伏兵不能在同一回合使用。','降攻不取消攻擊，讓戰鬥結算。']},
{title:'不是每聲呼喊都要追',hero:'EG-M04',enemy:['EG-SL-E03','EG-SL-E02'],hand:['EG-T01'],phase:'main2',deadline:5,goal:'先承接莉姆1500的攻擊，再對莎米拉2100使用門前守衛。兩敵戰破，巴絲特留下。',hints:['不要把唯一伏兵用在第一位較弱敵方。']},
{title:'回來，也需要時間',hero:'EG-M06',heroZone:'hand',enemy:['EG-SL-E04'],hand:[],normalUsed:false,deadline:5,goal:'解放沙布提俑請阿努比斯2200，回收門前守衛並蓋下；敵回合讓哈拉2500降至1800，反擊並存活。',hints:['5星需要一份祭品。','回收只到手中；蓋下後等下一回合。']},
{title:'勇氣的背後',hero:'EG-M07',heroZone:'hand',enemy:['EG-SL-E05'],hand:['EG-T03'],normalUsed:false,goal:'解放沙布提俑請荷魯斯2500，蓋神殿餘火；戰鬥開始以荷魯斯降攻500，擊破薩爾瓦2300。',hints:['6星需要一份祭品。','神殿餘火只作蓋牌條件，這次不發動它。']},
{title:'把面具留在門外',hero:'EG-M08',heroZone:'hand',enemy:['EG-SL-E06'],hand:['EG-S04','EG-M01'],normalUsed:false,goal:'解放貝斯與托特請伊西絲，讓棄牌區巴絲特守備回場；日輪照破另棄沙布提俑，破壞名字鎖印，再由伊西絲2500戰破守衛2400。',hints:['名字鎖印正面留在後場時，守衛不會被戰鬥破壞。','伊西絲接回的巴絲特暫時無效，且到下次自己回合開始前不能作祭品。']},
{title:'撤回，不是失去',hero:'EG-M08',enemy:['EG-SL-E06'],hand:['EG-T02','EG-S06','EG-T03'],phase:'main2',deadline:5,goal:'蓋封棺護名，敵方偽名束縛指定巴絲特時將她回手；伊西絲2600守住2400攻。下回合神殿守衛送手牌神殿餘火作代價，巴絲特守備出場；伊西絲轉攻2500戰破守衛。',hints:['封棺護名不無效術式，只讓指定者離開。','神殿守衛要等自己的主要階段，另付一張手牌埃及伏兵。']},
{title:'名字後面的空白',hero:'EG-M09',heroZone:'hand',enemy:['EG-SL-E07'],hand:['EG-S05'],normalUsed:false,goal:'兩份祭品請歐西里斯，回收巴絲特與門前守衛並蓋好伏兵；隼翼俯衝使2800變3400，戰破賽特3000守備，巴絲特留在手中。',hints:['本回合只有一次通常出場，巴絲特不再通常出場。','回收兩類資源各自結算；重新蓋的伏兵當回合不能使用。']}
];
const lessons=defs.map((l,i)=>({country:'EG-HERO',story:true,id:'eg-salma-'+String(i+1).padStart(2,'0'),mission:i+1,phase:'main',normalUsed:true,deadline:3,setup:'挑戰從第3回合開始；已在場的伙伴不會再次發動出場效果。',explanation:'本關使用40張教學牌組，不改動收藏或你的牌組。請完成指定卡片效果與戰鬥，並保住目標伙伴。',...l}));
function enemyRecipe(){return {main:[...Object.keys(N.cards).flatMap(id=>Array(3).fill(id)),...['EG-S01','EG-S02','EG-S04','EG-S05'].flatMap(id=>Array(3).fill(id)),'EG-S03'],extra:[]};}
function create(l){const s=E.create(2026093000+l.mission,{country:'EG-HERO',enemy:'EG-P-HERO',first:0,lp:6000,enemyLP:6000,enemyRecipe:enemyRecipe()}),t={lesson:l,state:s,hero:null,targets:[],startedTurn:3,hint:0,hiddenHint:true,effects:[],combats:[],attacks:[],outcome:null};for(const p of s.players){p.deck.push(...p.hand);p.hand=[];}s.turn=3;s.phase=l.phase;s.normalUsed=l.normalUsed;s.log=[];s.salmaStoryMission=l.id;s.salmaStoryEvidence=[];
function take(side,id,zone='hand',mode='atk'){const p=s.players[side],i=p.deck.findIndex(c=>c.id===id);if(i<0)throw Error('莎爾瑪借卡不足 '+id);const c=p.deck.splice(i,1)[0];if(['slots','back'].includes(zone)){Object.assign(c,{hidden:false,mode,entered:1,setTurn:1,changed:0,attacks:0,entity:++s.serial});p[zone][p[zone].indexOf(null)]=c;}else p[zone].push(c);return c.uid;}
t.hero=take(0,l.hero,l.heroZone||'slots',l.mission===7?'def':'atk');l.hand.forEach(id=>take(0,id));t.targets=l.enemy.map(id=>take(1,id,'slots',l.mission===8?'def':'atk'));
if([4,5].includes(l.mission))t.materials=[take(0,'EG-M01','slots')];
if([6,8].includes(l.mission))t.materials=[take(0,'EG-M02','slots'),take(0,'EG-M05','slots')];
if([4,8].includes(l.mission))t.trap=take(0,'EG-T01','grave');
if([6,8].includes(l.mission))t.partner=take(0,'EG-M04','grave');
if(l.mission===6)t.back=take(1,'EG-SL-SEAL','back');
if(l.mission===7){t.partner=take(0,'EG-M04','slots');t.back=take(1,'EG-SL-CURSE','back');}
return t;}
function evaluate(t){const s=t.state,n=t.lesson.mission;if(t.outcome||s.pending||s.window||s.resolving||s.stack.length||s.jobs.length||s.attack)return t.outcome;
const ev=s.salmaStoryEvidence,loc=u=>E.locate(s,u),alive=u=>loc(u)?.side===0&&loc(u)?.zone==='slots',res=(code,target)=>ev.some(e=>e.kind==='resolved'&&e.side===0&&e.code===code&&(!target||e.args.target===target)),kill=u=>loc(u)?.zone==='grave'&&t.combats.some(e=>e.from?.uid===t.hero&&e.target?.uid===u||e.from?.uid===u&&e.target?.uid===t.hero),summon=()=>ev.some(e=>e.kind==='summon'&&e.uid===t.hero&&e.normal),paid=()=>t.materials.every(u=>loc(u)?.zone==='grave'),set=u=>loc(u)?.zone==='back'&&loc(u).c.hidden&&loc(u).c.setTurn===3;let pass=false;
if(n===1)pass=res('EG_atk600',t.hero)&&kill(t.targets[0]);
if([2,3].includes(n))pass=res('EG_atkMinus700',t.targets[n===3?1:0])&&t.targets.every(kill);
if(n===4)pass=summon()&&paid()&&res('EG_recover',t.trap)&&res('EG_atkMinus700',t.targets[0])&&kill(t.targets[0]);
if(n===5)pass=summon()&&paid()&&res('EG_horus',t.targets[0])&&s.players[0].back.some(c=>c?.id==='EG-T03'&&c.hidden)&&kill(t.targets[0]);
if(n===6)pass=summon()&&paid()&&res('EG_isis',t.partner)&&alive(t.partner)&&loc(t.partner).c.mode==='def'&&res('EG_break',t.back)&&loc(t.back)?.zone==='grave'&&kill(t.targets[0]);
if(n===7)pass=res('EG_return',t.partner)&&res('EG_deployHand')&&ev.some(e=>e.kind==='summon'&&e.uid===t.partner&&!e.normal&&e.turn===5)&&ev.some(e=>e.kind==='damage'&&e.target===t.hero&&e.targetMode==='def'&&e.turn===4)&&alive(t.partner)&&loc(t.partner).c.mode==='def'&&s.turn===5&&kill(t.targets[0]);
if(n===8)pass=summon()&&paid()&&ev.some(e=>e.kind==='resolved'&&e.code==='EG_osiris'&&e.args.target===t.partner&&e.args.other===t.trap)&&loc(t.partner)?.zone==='hand'&&set(t.trap)&&res('EG_atk600',t.hero)&&kill(t.targets[0]);
if(alive(t.hero)&&s.players[0].lp>0&&pass)return t.outcome={pass:true,summary:n===8?'真名已找回，名字後面也留下了明天。':'同伴留下了選擇，也留下了歸途。',explanation:t.lesson.explanation};
if(s.winner!==null||s.turn>t.lesson.deadline||s.turn===t.lesson.deadline&&s.side!==0)return t.outcome={pass:false,summary:'尚未完成卡效、戰鬥或存活目標，可重新挑戰。',explanation:t.lesson.explanation};return null;}
function enemyAction(t){const s=t.state,a=E.choices(s,1),n=t.lesson.mission;if(s.pending)return a[0]||null;if(s.window)return a.find(a=>a.kind==='pass')||null;if(n===7){const x=a.find(a=>a.code==='EG_SL_destroy'&&a.args.target===t.partner);if(x)return x;}
if(s.phase==='battle'){if([2,3,4,7].includes(n)){for(const uid of t.targets){const x=a.find(a=>a.kind==='attack'&&a.uid===uid&&a.target===t.hero);if(x)return x;}}return a.find(a=>a.kind==='main2')||null;}return a.find(a=>['draw','advance','battle','end'].includes(a.kind))||null;}
const api={lessons,create,evaluate,enemyAction,enemyRecipe};if(node)module.exports=api;else root.PortraitSalmaStoryLessons=api;
})(globalThis);
