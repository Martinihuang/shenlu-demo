(function(root){'use strict';
const art={arrival:'story/tw-meeting/arrival.lossless.webp',reunion:'story/tw-meeting/reunion.lossless.webp',arena:'campaign/art/TW-portrait.webp?sizev=20261005'};
function missing(profile){return [['story','阿澤'],['yuanStory','林予安']].filter(([key])=>!root.ShenluStoryProgress.completed(profile,key,'L8')).map(([,name])=>name);}
function unlocked(profile){return root.ShenluStageAccess?.allOpen===true||missing(profile).length===0;}
function chapter(routeId){const yuan=routeId==='tw-yuan';return {id:'L9',title:'雙籙相逢',subtitle:'共同後日談',lesson:yuan?'tw-meet-yuan':'tw-meet-az',enemy:yuan?'TW':'TW-YUAN',art:'story/landscape/tw-az/TW-AZ-L9-v1.jpg',afterArt:'story/landscape/tw-az/TW-AZ-L9-v1.jpg',background:art.arena,reward:null,
before:yuan?[["旁白","予安剛走進廟埕，符令就亮起來。對面青年的紅繩也有了回應，虎爺先湊向雲豹。"],["阿澤","牠們倒先認識了。我叫阿澤。"],["林予安","我是予安。看來，你也被神籙帶著走了很遠。"],["阿澤","是啊。牠陪我找回一條回家的路。"],["林予安","來切磋一場？我想看看，你和虎爺怎麼一起應敵。"]]:[
['旁白','進香隊伍回到廟埕，虎爺先停下腳步。牠輕晃尾巴，迎向帶著一位女孩走來的雲豹。'],
['阿澤','紅繩又亮了……這次不是引我上山，是帶我遇見你們？'],
['林予安','我是予安。我的符令也有回應。看來，我們都曾答應，要把同伴一起帶回來。'],
['阿澤','我叫阿澤。來切磋一場吧！不用拘泥招式，讓我見識你和同伴一路累積的默契。']
],after:yuan?[["林予安","剛才若是在山裡，我就不用一直回頭找人了。"],["阿澤","下次叫上我們。多個人，總能替你看著後面。"],["旁白","雲豹挨著虎爺坐下，紅繩與符令的光慢慢合在一起。予安這才笑了。"],["林予安","好。下次有人迷路，我們一起去找。"]]:[
['阿澤','你總能替同伴留一條退路。這趟山路若早點遇見你，我應該能少逞強幾次。'],
['林予安','你也讓我看見，守護不是一直等待。有時候，我們得先替同伴踏出那一步。'],
['旁白','紅繩與符令的光慢慢相合。虎爺與雲豹在兩人身旁坐下，廟埕重新響起平安的笑聲。'],
['阿澤','往後若有人迷了路，就一起去找吧。有你們接應，回家的路一定會更亮。']
]};}

const chapterBeforeVoxCPMMale=chapter;
chapter=function(routeId){const scene=chapterBeforeVoxCPMMale(routeId);if(routeId==="tw-az"){Object.assign(scene,{"before":[["旁白","回到廟埕，紅繩再次發亮。這次沒有山裡的催促聲，只有一隻雲豹帶著女孩走近。"],["阿澤","牠們倒先認識了。我叫阿澤，剛才這道光也是妳的？"],["林予安","我是予安。符令把我帶過來，沒想到會遇見你們。"],["阿澤","來切磋一場？我想看看，你和雲豹怎麼互相照應。"]],"after":[["阿澤","剛才你一往前，牠就補到側邊。在山裡，我總要回頭找虎爺好幾次。"],["林予安","牠也一直看著你。下次需要接應，叫上我們。"],["旁白","虎爺挨著雲豹坐下，紅繩與符令的光慢慢相合。"],["阿澤","說好了。有人迷路，就一起去找。"]]});}return scene;};
const api={art,missing,unlocked,chapter};if(typeof module==='object')module.exports=api;else root.ShenluMeetingStoryData=api;
})(globalThis);
;(()=>{const api=globalThis.ShenluMeetingStoryData,chapter=api.chapter;api.missing=()=>[];api.unlocked=()=>true;api.chapter=route=>{const c=chapter(route);if(c.rules)c.rules=c.rules.map(line=>/皆完成|第八章後|兩位主角的第八章/.test(line)?'Demo交會關可直接進入，不需完成雙主角第八章。':line);return c;};})();