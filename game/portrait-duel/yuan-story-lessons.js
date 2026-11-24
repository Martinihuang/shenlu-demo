(function(root){'use strict';
const node=typeof module!=='undefined',D=node?require('./core/data.js'):root.TW09Data,E=node?require('./core/duel-engine.js'):root.TW09Engine,N=node?require('./core/yuan-story-enemies.js'):root.PortraitYuanStoryEnemies;
const common={country:'TW-YUAN',story:true,hand:[],explanation:'僅依公開任務目標判定，不要求固定出牌順序。借用靈體與手牌只在本場使用，不加入收藏。',hints:['先查看冒險目標與敵方下一步。','提示提供其中一種解法，也可以自己安排牌組與攻擊順序。']};
const lessons=[
{...common,id:'tw-yuan-omen',title:'初現・蛇祟徵兆',mission:'prepare',enemy:['TW-SNK-M01'],goal:'在本回合結束前，讓花婆留在場上，並讓一張原始五星以上的護壇靈體加入手牌。',setup:'護壇雲豹已在場；手牌是花婆與護壇雲豹，通常出場尚未使用。蛇祟暫時守備。',hints:['先讓花婆通常出場。','把手上的雲豹洗回牌組，搜尋高星護壇加入手牌；搜尋不會讓高星靈體直接出場。']},
{...common,id:'tw-yuan-nightcry',title:'再訪・夜啼',mission:'shelter',enemy:['TW-SNK-M02'],goal:'守住場上這張花婆，直到下一個我方回合開始。花婆離場即失敗。',setup:'花婆以攻擊姿態在場；手牌有護壇雲豹。敵方夜啼會優先攻擊花婆。通常出場尚未使用。',hints:['夜啼的武高於花婆。','讓雲豹通常出場，選擇保護花婆；也可以先擊退夜啼或調整防守。']},
{...common,id:'tw-yuan-pincer',title:'竹林兩難',mission:'clear',enemy:['TW-SNK-M01','TW-SNK-M03'],goal:'在第九回合結束前清空敵方靈體區，我方仍須存活。',setup:'土地婆在場；手牌為護壇雲豹、花婆及四方請援。通常出場尚未使用。敵方只使用場上蛇祟進攻，優先攻擊武或防最低者。',hints:['土地婆能擊退蛇祟，雲豹可以保護同伴。','結束回合時也能交替休息；不是一定要交替才能通關。']},
{...common,id:'tw-yuan-review',title:'驅祟複習',mission:'clear',enemy:['TW-SNK-M03'],goal:'在第九回合結束前清空敵方靈體區，我方仍須存活。',setup:'土地婆在場；手牌為花婆、護壇雲豹及四方請援。通常出場尚未使用。蛇祟只使用場上靈體進攻。'},
{...common,id:'tw-yuan-training',title:'顯影・學法閭山',mission:'guard',enemy:['TW-SNK-M04'],goal:'保住場上這張花婆，度過兩個敵方回合；或在花婆仍在場時先贏得對戰。花婆離場即失敗。',setup:'使用自己的牌組。臨時同行為林紗娘與攻擊姿態的花婆；借用護壇雲豹及驅障開路。試煉靈不補兵，優先攻擊花婆。',hints:['試煉靈的武高於花婆。','可用雲豹保護、改變花婆姿態配合其他手段，或清除威脅。林紗娘的反制只適用指定其他護壇的敵方行法，本場不必強行發動。']},
{...common,id:'tw-yuan-rescue',title:'顯影・守護之誓',mission:'guard',enemy:['TW-SNK-M05'],goal:'保住場上這張護壇雲豹，度過兩個敵方回合；或在雲豹仍在場時先贏得對戰。雲豹離場即失敗。',setup:'使用自己的牌組。臨時同行為臨水夫人、攻擊姿態的雲豹及花婆；借用土地婆及驅障開路。長坑鬼不補兵，優先攻擊雲豹。',hints:['臨水夫人能把另一張場上的護壇收回手牌，讓攻擊者這場戰鬥的武變為零。','被攻擊的雲豹不能支付這次費用；手牌也不能當成場上費用。清除威脅同樣有效。']},
{...common,id:'tw-yuan-final',title:'終戰・封印之夜',mission:'boss',enemy:['TW-SNK-M06'],goal:'使用自己的完整牌組，依正常勝利條件擊敗長坑鬼真身。',setup:'雙方生命為六千。真身以武二千四百、防三千守備在場；敵方使用蛇祟徵兆、夜啼、雙頭蛇祟、長坑鬼原身與真身各三張，搭配整籙符、五行轉位符、破障符、整鼓待機、天書破障、預置援策、守境封阻與行旅法壇各三張，以及驅障開路一張，會正常出場與攻擊。沒有隱藏復活或額外生命。',hints:['先累積場上同伴，再依手牌選擇高星出場或行法突破。','九天玄女、西王母及跨國牌組都能使用，不限定獲勝方式。']}
];
function enemyRecipe(boss=false){const support=['CN40-S01','CN40-S03','CN40-S04','KR40-S03','KR40-S06','TW43-S07','TW43-T03'];if(boss)support.push('CN40-S05');return {main:[...Object.keys(N.cards).filter(id=>!boss||id!=='TW-SNK-M04').flatMap(id=>[id,id,id]),...support.flatMap(id=>[id,id,id]),'TW43-S09'],extra:[]};}
function place(s,side,id,zone='slots',mode='atk',borrow=false){const p=s.players[side];let c;if(borrow)c={id,uid:'yuan'+(++s.serial),owner:side};else for(const z of ['deck','hand']){const i=p[z].findIndex(c=>c.id===id);if(i>=0){c=p[z].splice(i,1)[0];break;}}if(!c)throw Error('關卡缺少卡片 '+id);if(zone==='slots'){Object.assign(c,{hidden:false,mode,entered:1,attacks:0,changed:0,entity:++s.serial});const slot=p.slots[2]===null?2:p.slots[1]===null?1:p.slots.indexOf(null);p.slots[slot]=c;}else p[zone].push(c);return c.uid;}
function create(lesson,options={}){const free=['guard','boss'].includes(lesson.mission),s=E.create(20260926+lessons.indexOf(lesson),{country:'TW-YUAN',enemy:'TW',first:0,lp:6000,enemyLP:6000,playerRecipe:free&&options.playerRecipe?options.playerRecipe:{main:D.deckFor('TW-YUAN'),extra:D.extraFor('TW-YUAN')},enemyRecipe:enemyRecipe(lesson.mission==='boss')});
const t={lesson,state:s,hero:null,targets:[],startedTurn:3,lastTurn:3,hint:0,hiddenHint:true,effects:[],combats:[],attacks:[],requiredCards:[],outcome:null,progress:0};
if(lesson.mission==='boss'){t.targets=[place(s,1,lesson.enemy[0],'slots','def')];t.startedTurn=t.lastTurn=1;return t;}
for(const side of [0,1]){if(side===0&&free)continue;const p=s.players[side];p.deck.push(...p.hand);p.hand=[];}s.turn=3;s.phase='main';s.normalUsed=false;s.log=[];
t.targets=lesson.enemy.map(id=>place(s,1,id,'slots',lesson.mission==='prepare'?'def':'atk'));
const give=(id,zone='hand',mode='atk')=>place(s,0,id,zone,mode,free);
if(lesson.mission==='prepare'){t.hero=give('TW-J-M10','slots');give('TW-J-M04');give('TW-J-M10');}
else if(lesson.mission==='shelter'){t.hero=give('TW-J-M04','slots');give('TW-J-M10');}
else if(lesson.mission==='clear'){t.hero=give('TW-J-M11','slots');give('TW-J-M10');give('TW-J-M04');give('TW43-S03');}
else if(lesson.id.endsWith('training')){give('TW-J-M07','slots');t.hero=give('TW-J-M04','slots');give('TW-J-M10');give('TW43-S09');}
else{give('TW-J-M09','slots');t.hero=give('TW-J-M10','slots');give('TW-J-M04','slots');give('TW-J-M11');give('TW43-S09');}
return t;}
const stable=s=>!s.pending&&!s.window&&!s.resolving&&!s.stack.length&&!s.jobs.length&&!s.attack;
function evaluate(t){const s=t.state,l=t.lesson;if(t.outcome||!stable(s))return t.outcome;const done=(pass,summary)=>t.outcome={pass,summary,explanation:l.explanation};
if(['shelter','guard'].includes(l.mission)&&E.locate(s,t.hero)?.zone!=='slots')return done(false,'需要守護的同伴已離場，任務未完成。');
if(s.winner!==null)return done(s.winner===0,s.winner===0?'對戰勝利，任務完成。':'對戰結束，任務未完成。');
if(l.mission==='boss')return null;
if(l.mission==='prepare'){if(s.players[0].slots.some(c=>c?.id==='TW-J-M04')&&s.players[0].hand.some(c=>c.id.startsWith('TW-J-')&&D.cards[c.id].level>=5))return done(true,'花婆已請來高星援手，可以繼續調查。');if(s.turn>3)return done(false,'尚未備妥援手，請再試一次。');}
if(l.mission==='clear'&&!s.players[1].slots.some(Boolean))return done(true,'蛇祟已退，通路恢復。');
if(s.turn!==t.lastTurn){const ended=t.lastTurn;t.lastTurn=s.turn;if(['guard','shelter'].includes(l.mission)&&ended%2===0)t.progress++;if(t.progress>=(l.mission==='shelter'?1:2))return done(true,'同伴平安，守護任務完成。');}
if(s.turn>9)return done(false,'未能及時完成任務。');t.feedback=['guard','shelter'].includes(l.mission)?'已守住 '+t.progress+' 個敵方回合。敵方下一步：優先攻擊需要守護的同伴。':'敵方下一步：以現有靈體進攻，不再補兵。';return null;}
function enemyAction(t){const s=t.state;if(t.lesson.mission==='boss')return E.ai(s,1);const a=E.choices(s,1);if(s.pending)return a[0]||null;if(s.window)return a.find(x=>x.kind==='pass')||null;if(s.phase==='battle'){const attacks=a.filter(x=>x.kind==='attack');attacks.sort((a,b)=>{const score=x=>['guard','shelter'].includes(t.lesson.mission)&&x.target===t.hero?-100000:x.target?E.value(s,E.locate(s,x.target).c,E.locate(s,x.target).c.mode==='def'?'def':'atk'):-1;return score(a)-score(b);});return attacks[0]||a.find(x=>x.kind==='main2')||null;}return a.find(x=>['draw','advance','battle','end'].includes(x.kind))||null;}
const api={lessons,create,evaluate,enemyAction,enemyRecipe};if(node)module.exports=api;else root.PortraitYuanStoryLessons=api;
})(globalThis);

