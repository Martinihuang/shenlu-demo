(function(){'use strict';
 const row=document.querySelector('.menu>.row'),buttons=row.querySelectorAll('button'),note=document.getElementById('save-note');
 buttons[1].disabled=false;buttons[1].onclick=()=>ShenluPC.go('campaign/index.html?view=saves&from=opening&layout=landscape-v1');
 try{const p=ShenluPC.current();buttons[0].disabled=!p?.heroChosen;buttons[0].onclick=ShenluPC.guard(ShenluPC.resume);note.textContent=p?.heroChosen?'目前旅程：'+(ShenluHeroBindings[p.country]?.name||p.country)+'・進度自動保存':'選擇主角後開始旅程';}catch(e){note.textContent='存檔讀取失敗，請由讀取旅程恢復';}
 document.querySelector('#help-dialog .subtle').textContent='完成故事與挑戰可獲得靈體；旅程會自動保存，也可手動儲存及讀取。';
 const reset=document.createElement('button');reset.textContent='刪除所有存檔並重新開始';reset.onclick=()=>ShenluSaves.resetJourney(ShenluPC.getStore()).catch(ShenluPC.report);const advanced=document.createElement('details');advanced.className='settings-storage';const summary=document.createElement('summary');summary.textContent='存檔管理';advanced.append(summary,reset);document.querySelector('#settings-dialog form').before(advanced);
 document.querySelector('#settings-dialog .subtle').textContent='手機請橫向使用，點選選項操作；電腦可使用滑鼠或鍵盤。旅程會自動保存，也可由「讀取旅程」管理存檔。';
})();
