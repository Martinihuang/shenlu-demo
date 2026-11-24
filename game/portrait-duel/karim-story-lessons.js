(function(root){'use strict';
const node=typeof module!=='undefined',D=node?require('./core/data.js'):root.TW09Data,N=node?require('./core/karim-story-enemies.js'):root.PortraitKarimStoryEnemies,E=node?require('./core/duel-engine.js'):root.TW09Engine;
const defs=[
{title:'付出之前，先留一個位置',hero:'EG-P-M04',enemy:['EG-KR-E01'],hand:['EG-P-M01'],goal:'凱布利支付400LP守備特殊出場，烏普瓦烏特1700戰破奈伊拉1100，兩位伙伴存活。',hints:['先確認場上已有正面埃及伙伴與空格。','支付400不增加通常出場次數。']},
{title:'保護不是一句保證',hero:'EG-P-M04',enemy:['EG-KR-E02'],hand:[],deadline:5,goal:'瓦吉特支付300LP保護烏普瓦烏特，敵回合實際擋下蝕日咒印破壞；烏普瓦烏特1700承接莎迪雅1200攻並戰破她。',hints:['瓦吉特與烏普瓦烏特已在場。先付費保護，再結束回合。','保護必須真正擋下一次效果破壞；不保戰破、回手或其他移除。']},
{title:'退守不會讓黎明更遠',hero:'EG-P-M04',enemy:['EG-KR-E03'],hand:['EG-P-M03'],normalUsed:false,deadline:5,goal:'通常出場奈赫貝特，讓烏普瓦烏特轉守1200＋300＝1500，守住莉姆1400攻；下回合轉攻1700反擊。',hints:['本章通常出場可用；選另一體攻擊表示伙伴。','轉守不取消攻擊。下一自己回合轉攻，再戰破敵人。']},
{title:'求援不是把人叫來承擔',hero:'EG-P-M04',heroZone:'hand',enemy:['EG-KR-E04'],hand:['EG-P-M01','EG-S05'],normalUsed:false,goal:'烏普瓦烏特通常出場，洗回凱布利搜尋卜塔入手；隼翼俯衝加600至2300，戰破哈娜2100，卜塔留在手中。',hints:['搜尋卜塔只入手，不免費出場。','1700不能直接撞2100，須先強化。']},
{title:'回復，也是一段行動',hero:'EG-P-M06',enemy:['EG-KR-E04'],hand:['EG-P-M05'],normalUsed:false,initialLP:4000,goal:'庫努姆通常出場，場上另有埃及伙伴，實際回復400LP至4400；卜塔2200戰破哈娜2100，三位伙伴存活。',hints:['中途殘局：卜塔與烏普瓦烏特已在場，不重新觸發卜塔出場能力。','庫努姆要通常出場；特殊出場不觸發回復。']},
{title:'接回來，不必立刻向前',hero:'EG-P-M06',heroZone:'hand',enemy:['EG-KR-E06'],hand:[],normalUsed:false,goal:'解放場上凱布利請卜塔，回收原已在棄牌區的另一張凱布利；支付400LP讓回收者守備特殊出場，卜塔2200戰破鎖衛2100。',hints:['烏普瓦烏特留在場上。請解放場上的凱布利。','棄牌區有兩張同名時，選本來就在棄牌區的那張，不是剛解放的素材。','回收與出場是兩步，回收者須實際支付400LP並守備出場。']},
{title:'力量要有去處',hero:'EG-P-M07',heroZone:'hand',enemy:['EG-KR-E05'],hand:[],normalUsed:false,goal:'解放一體凱布利請塞赫麥特，支付600LP令娜芙拉守備3000減至2200，再2500戰破，伙伴存活。',hints:['只對正面守備靈體降守800。','不降低攻擊，不給予貫穿；擊破守備靈體不會自動造成差額傷害。']},
{title:'今夜，仍有人同行',hero:'EG-P-M09',enemy:['EG-APEP-M03'],hand:[],initialLP:2000,deadline:5,goal:'第3回合阿蒙支付600自保；敵回合實際擋住指定阿蒙的夜咒。第5回合拉神支付800加攻至3600，戰破巨蛇3000守備；兩位伙伴存活、LP保留600。',hints:['中途殘局：阿蒙與拉神已在場。阿蒙只保護自己。','先保護再交回合。不要第3回合先用拉神加攻，否則加成過期後LP不夠再支付。','第5回合選拉神加攻，不以效果破壞代替戰破；两項共用本回合能力次數。']}
];
const lessons=defs.map((l,i)=>({country:'EG-P-HERO',story:true,id:'eg-karim-'+String(i+1).padStart(2,'0'),mission:i+1,phase:'main',normalUsed:true,deadline:3,setup:'挑戰從第3回合開始，高星伙伴已在場；之後的出場仍須依卡片規則支付代價。',explanation:'本關使用40張教學牌組，不改動收藏或你的牌組。支付生命後須仍有餘額，並完成指定卡片效果、戰鬥與存活目標。',...l}));
function enemyRecipe(){return {main:[...Object.keys(N.cards).flatMap(id=>Array(3).fill(id)),...['EG-S01','EG-S02','EG-S04','EG-S05','EG-T01'].flatMap(id=>Array(3).fill(id)),'EG-S03'],extra:[]};}
function create(l){const s=E.create(2026092900+l.mission,{country:'EG-P-HERO',enemy:'EG-HERO',first:0,lp:6000,enemyLP:6000,enemyRecipe:enemyRecipe()}),t={lesson:l,state:s,hero:null,targets:[],startedTurn:3,hint:0,hiddenHint:true,effects:[],combats:[],attacks:[],outcome:null};for(const p of s.players){p.deck.push(...p.hand);p.hand=[];}s.turn=3;s.phase='main';s.normalUsed=l.normalUsed;s.players[0].lp=l.initialLP||6000;s.log=[];s.karimStoryMission=l.id;s.karimStoryEvidence=[];
function take(side,id,zone='hand',mode='atk'){const p=s.players[side],i=p.deck.findIndex(c=>c.id===id);if(i<0)throw Error('卡里姆借卡不足 '+id);const c=p.deck.splice(i,1)[0];if(['slots','back'].includes(zone)){Object.assign(c,{hidden:false,mode,entered:1,setTurn:1,changed:0,attacks:0,entity:++s.serial});p[zone][p[zone].indexOf(null)]=c;}else p[zone].push(c);return c.uid;}
t.hero=take(0,l.hero,l.heroZone||'slots');l.hand.forEach(id=>take(0,id));t.targets=l.enemy.map(id=>take(1,id,'slots',l.mission>=7?'def':'atk'));
if(l.mission===2)t.partner=take(0,'EG-P-M02','slots');
if([5,6,7].includes(l.mission))t.partner=take(0,'EG-P-M04','slots');
if([6,7].includes(l.mission))t.material=take(0,'EG-P-M01','slots');
if(l.mission===6)t.recover=take(0,'EG-P-M01','grave');
if(l.mission===8)t.partner=take(0,'EG-P-M08','slots');
if([2,8].includes(l.mission))t.back=take(1,'EG-KR-CURSE','back');return t;}
function evaluate(t){const s=t.state,n=t.lesson.mission;if(t.outcome||s.pending||s.window||s.resolving||s.stack.length||s.jobs.length||s.attack)return t.outcome;const ev=s.karimStoryEvidence,loc=u=>E.locate(s,u),alive=u=>loc(u)?.side===0&&loc(u)?.zone==='slots',res=(code,id,target)=>ev.some(e=>e.kind==='resolved'&&e.side===0&&e.code===code&&(!id||e.id===id)&&(!target||e.args.target===target)),kill=()=>loc(t.targets[0])?.zone==='grave'&&t.combats.some(e=>e.from?.uid===t.hero&&e.target?.uid===t.targets[0]||e.from?.uid===t.targets[0]&&e.target?.uid===t.hero),summon=(id,normal)=>ev.some(e=>e.kind==='summon'&&e.side===0&&e.id===id&&e.normal===normal),liveId=id=>s.players[0].slots.some(c=>c?.id===id);let pass=false;
if(n===1)pass=res('EG_khepri')&&summon('EG-P-M01',false)&&liveId('EG-P-M01')&&s.players[0].lp===5600&&kill();
if(n===2)pass=res('EG_ward','EG-P-M02',t.hero)&&ev.some(e=>e.kind==='wardProtection'&&e.uid===t.hero)&&alive(t.partner)&&s.players[0].lp===5700&&kill();
if(n===3)pass=summon('EG-P-M03',true)&&res('EG_nekhbet','EG-P-M03',t.hero)&&liveId('EG-P-M03')&&ev.some(e=>e.kind==='damage'&&e.target===t.hero&&e.targetMode==='def')&&s.turn===5&&kill();
if(n===4)pass=summon('EG-P-M04',true)&&res('EG_searchRoyal')&&s.players[0].hand.some(c=>c.id==='EG-P-M06')&&res('EG_atk600','EG-S05',t.hero)&&kill();
if(n===5)pass=summon('EG-P-M05',true)&&res('EG_khnum')&&s.players[0].lp===4400&&alive(t.partner)&&liveId('EG-P-M05')&&kill();
if(n===6)pass=summon('EG-P-M06',true)&&res('EG_recover','EG-P-M06',t.recover)&&res('EG_khepri','EG-P-M01',t.recover)&&alive(t.recover)&&alive(t.partner)&&loc(t.material)?.zone==='grave'&&s.players[0].lp===5600&&kill();
if(n===7)pass=summon('EG-P-M07',true)&&res('EG_defMinus800','EG-P-M07',t.targets[0])&&alive(t.partner)&&loc(t.material)?.zone==='grave'&&s.players[0].lp===5400&&s.players[1].lp===6000&&kill();
if(n===8)pass=res('EG_selfWard','EG-P-M08',t.partner)&&ev.some(e=>e.kind==='wardProtection'&&e.uid===t.partner&&e.turn===4)&&res('EG_raBoost','EG-P-M09',t.hero)&&alive(t.partner)&&s.turn===5&&s.players[0].lp===600&&kill();
if(alive(t.hero)&&s.players[0].lp>0&&pass)return t.outcome={pass:true,summary:n===8?'今夜的通道已守住，伙伴仍有力量一起走向黎明。':'伙伴接住了這一步，也為下一步留下力量。',explanation:t.lesson.explanation};if(s.winner!==null||s.turn>t.lesson.deadline||s.turn===t.lesson.deadline&&s.side!==0)return t.outcome={pass:false,summary:'尚未完成費用、保護、戰鬥或存活目標，可重新挑戰。',explanation:t.lesson.explanation};return null;}
function enemyAction(t){const s=t.state,a=E.choices(s,1),n=t.lesson.mission;if(s.pending)return a[0]||null;if(s.window)return a.find(a=>a.kind==='pass')||null;if([2,8].includes(n)){const x=a.find(a=>a.code==='EG_KR_destroy'&&a.args.target===(n===8?t.partner:t.hero));if(x)return x;}if(s.phase==='battle'){if([2,3].includes(n)){const x=a.find(a=>a.kind==='attack'&&a.uid===t.targets[0]&&a.target===t.hero);if(x)return x;}return a.find(a=>a.kind==='main2')||null;}return a.find(a=>['draw','advance','battle','end'].includes(a.kind))||null;}
const api={lessons,create,evaluate,enemyAction,enemyRecipe};if(node)module.exports=api;else root.PortraitKarimStoryLessons=api;
})(globalThis);
