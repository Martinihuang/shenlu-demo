(function(root){'use strict';
const node=typeof module!=='undefined',E=node?require('./core/duel-engine.js'):root.TW09Engine,D=node?require('./core/data.js'):root.TW09Data;
const lessons=[['az','TW','TW-YUAN','林予安'],['yuan','TW-YUAN','TW','阿澤']].map(([key,country,enemy,opponent])=>({id:'tw-meet-'+key,country,enemyRoute:enemy,opponent,story:true,mission:'meeting',title:'雙籙相逢・與'+opponent+'切磋',hand:[],goal:'使用自己的牌組，與'+opponent+'切磋並取得勝利。',setup:'雙方生命都是六千，從完整牌組開始。你使用目前的出戰牌組，'+opponent+'使用自己的標準牌組；由你先手，沒有額外借用卡或指定出牌順序。',hints:['可先觀察對方場上的武、防與效果，再安排進攻。','可以自由混搭各國牌組，也能認輸後調整牌組再來。'],explanation:'這是一場友善切磋，依一般決鬥規則判定勝負。'}));
function create(lesson,options={}){const state=E.create(2026092409+(lesson.country==='TW'?0:1),{country:lesson.country,enemy:lesson.enemyRoute,first:0,lp:6000,enemyLP:6000,playerRecipe:options.playerRecipe||{main:D.deckFor(lesson.country),extra:D.extraFor(lesson.country)},enemyRecipe:{main:D.deckFor(lesson.enemyRoute),extra:D.extraFor(lesson.enemyRoute)}});return {lesson,state,hero:null,targets:[],startedTurn:1,hint:0,hiddenHint:true,effects:[],combats:[],attacks:[],requiredCards:[],outcome:null};}
function evaluate(t){if(t.outcome)return t.outcome;if(t.state.winner===null)return null;return t.outcome={pass:t.state.winner===0,summary:t.state.winner===0?'切磋獲勝，兩人也從彼此的守護方式得到新的啟發。':'這次切磋尚未獲勝，可以調整牌組再來。',explanation:t.lesson.explanation};}
function enemyAction(t){return E.ai(t.state,1);}
const api={lessons,create,evaluate,enemyAction};if(node)module.exports=api;else root.PortraitMeetingLessons=api;
})(globalThis);
