(function(){'use strict';
const $=id=>document.getElementById(id);
let active=null;
function stop(){
  if(active){active.audio.pause();active.audio.removeAttribute('src');active.audio.load();active.panel.remove();active=null;}
  $('storyApp').classList.remove('cinematic-story');$('dialogueText').hidden=false;
}
function render(ctx){
  const voice=window.ShenluDemoStoryAudio,word=(key,fallback)=>['show','hide'].includes(key)?(window.ShenluDemoI18n?.t('voice-preview.'+key,voice?.text(key)||fallback)||voice?.text(key)||fallback):(voice?.text(key)||fallback);
  const binding=(window.ShenluDemoStoryAudioSource||window.ShenluStoryAudioBindings)?.[ctx.routeId]?.chapters[ctx.chapter.id];
  if(!binding||ctx.finished){stop();return false;}
  const key=ctx.routeId+':'+ctx.chapter.id+':'+ctx.after;
  if(active?.key===key)return true;
  stop();
  const panel=document.createElement('div');panel.id='cinematicPanel';
  const audio=document.createElement('audio');audio.id='cinematicAudio';audio.controls=false;audio.hidden=true;audio.preload='metadata';audio.setAttribute('aria-label','串場旁白');
  const start=document.createElement('button');start.id='cinematicStart';start.textContent='聆聽旁白';start.hidden=true;start.onclick=()=>audio.play().catch(()=>{status.textContent='請再點一下聆聽旁白，或略過串場。';});
  audio.onplaying=()=>{start.hidden=true;};
  audio.onpause=()=>{if(active?.audio===audio&&audio.paused&&!audio.ended&&!active.manual&&active.stage!=='choice'){start.hidden=false;start.textContent=word('resume','繼續聆聽');}};
  const status=document.createElement('p');status.id='cinematicStatus';status.setAttribute('role','status');
  const timed=Array.isArray((ctx.after?binding.after:binding.before)?.timings);
  const subtitleToggle=document.createElement('button');
  const subtitle=document.createElement('div');subtitle.hidden=true;subtitle.className='cinematic-subtitles';
  const refreshSubtitleToggle=()=>{subtitleToggle.textContent=word(subtitle.hidden?'show':'hide',subtitle.hidden?'顯示字幕':'隱藏字幕');subtitleToggle.setAttribute('aria-pressed',String(!subtitle.hidden));};
  if(timed)subtitle.hidden=false;refreshSubtitleToggle();
  const sentence=document.createElement('p'),previous=document.createElement('button'),next=document.createElement('button'),page=document.createElement('span');
  previous.textContent='上一句';next.textContent='下一句';subtitle.append(sentence,previous,page,next);
  panel.append(audio,start,status,subtitleToggle,subtitle);$('dialogueText').after(panel);
  const state=active={key,audio,panel,stage:'main',line:0,lines:[],playToken:0,selected:ctx.progress.choices?.[ctx.chapter.id]};
  $('storyApp').classList.add('cinematic-story');$('dialogueText').hidden=true;
  $('speaker').textContent=ctx.after?'章後串場':'章前串場';$('pageCount').textContent='';$('rewardInfo').textContent='';$('deckLink').hidden=true;
  if($('borrowSupport'))$('borrowSupport').hidden=true;
  let choices=$('storyChoices');if(!choices){choices=document.createElement('div');choices.id='storyChoices';panel.after(choices);}choices.replaceChildren();choices.hidden=true;
  const showSubtitle=()=>{const label=state.clip?.label||(ctx.after?'章後串場':'章前串場');$('speaker').textContent=window.ShenluDemoI18n?.storyLine(label)||window.ShenluDemoI18n?.display(label)||label;const l=state.lines[state.line];sentence.replaceChildren();if(l){const speaker=document.createElement('span'),body=document.createElement('span');speaker.textContent=window.ShenluDemoI18n?.display(l.speaker)||l.speaker;body.textContent=window.ShenluDemoI18n?.storyLine(l.text)||l.text;sentence.append(speaker,document.createTextNode('：'),body);}page.textContent=(state.line+1)+' / '+state.lines.length;previous.disabled=state.line===0;previous.textContent=word('previous','上一句');next.disabled=!state.manual&&state.line>=state.lines.length-1;next.textContent=state.manual&&state.line>=state.lines.length-1?word('continue','繼續'):word('next','下一句');};
  const moveLine=delta=>{state.line=Math.max(0,Math.min(state.lines.length-1,state.line+delta));if(state.timings)audio.currentTime=state.timings[state.line].start;showSubtitle();};
  previous.onclick=()=>moveLine(-1);next.onclick=()=>moveLine(1);
  audio.ontimeupdate=()=>{if(active!==state||!state.timings||audio.seeking)return;let line=0;for(let i=0;i<state.timings.length;i++)if(audio.currentTime>=state.timings[i].start)line=i;if(line!==state.line){state.line=line;showSubtitle();}};
  subtitleToggle.onclick=()=>{subtitle.hidden=!subtitle.hidden;refreshSubtitleToggle();};
  state.refreshSubtitle=()=>{showSubtitle();refreshSubtitleToggle();binding.options.forEach((option,i)=>{const button=choices.children[i];if(button)button.textContent=window.ShenluDemoI18n?.storyLine(option.label)||window.ShenluDemoI18n?.display(option.label)||option.label;});};
  const finish=()=>{if(active!==state)return;stop();ctx.finish();};
  const play=(clip,done)=>{
    if(!clip){done();return;}
    const token=++state.playToken;state.clip=clip;state.done=done;state.manual=true;audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();
    start.onclick=()=>audio.play().catch(()=>{if(active===state&&state.playToken===token){status.textContent=word('error','音檔暫時無法播放，可閱讀字幕。');}});
    const spoken=voice?voice.resolve(clip):(window.ShenluDemoVoiceLocale==='none'?null:clip);
    // Canonical Traditional Chinese lines remain the only subtitle source.
    state.lines=clip.lines;state.timings=spoken?.timings||null;state.manual=!spoken?.file;state.line=0;
    previous.onclick=()=>moveLine(-1);next.onclick=()=>state.manual&&state.line>=state.lines.length-1?done():moveLine(1);
    const manual=(reason)=>{state.manual=true;state.timings=null;audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();start.hidden=true;subtitle.hidden=false;refreshSubtitleToggle();status.textContent=word(reason,'請閱讀字幕，按下一句繼續。');showSubtitle();};
    showSubtitle();
    
    if(state.manual){manual(voice?.selected()==='none'?'silent':'missing');return;}
    audio.onended=()=>{if(active===state&&state.playToken===token)done();};
    audio.onerror=()=>{if(active===state&&state.playToken===token)manual('error');};
    audio.src=spoken.file;status.textContent=spoken.candidate?word('previewNote',"配音與字幕語言可分別選擇。"):'';
    subtitle.hidden=false;refreshSubtitleToggle();
    audio.play().catch(error=>{if(active===state&&state.playToken===token){manual('error');if(error?.name==='NotAllowedError')status.textContent='';start.hidden=false;start.textContent=word('listen','聆聽旁白');start.onclick=()=>play(clip,done);}});
  };
  state.restartVoice=()=>{if(state.stage!=='choice'&&state.clip)play(state.clip,state.done);};
  const choose=()=>{
    state.stage='choice';audio.pause();start.hidden=true;choices.replaceChildren();choices.hidden=false;
    status.textContent='你想怎麼回應？';$('next').hidden=false;$('next').textContent='繼續';$('next').disabled=!Number.isInteger(state.selected);
    $('next').onclick=finish;$('skip').hidden=true;
    binding.options.forEach((option,i)=>{const b=document.createElement('button');b.textContent=window.ShenluDemoI18n?.storyLine(option.label)||window.ShenluDemoI18n?.display(option.label)||option.label;b.setAttribute('aria-pressed',String(state.selected===i));b.onclick=()=>{
      ctx.choose(i);state.selected=i;state.stage='reply';
      for(const [n,button] of [...choices.children].entries())button.setAttribute('aria-pressed',String(n===i));
      $('next').disabled=false;$('skip').hidden=false;$('skip').textContent='略過串場';
      play(option.reply,()=>{status.textContent='準備好後，繼續旅程。';});
    };choices.append(b);});
  };
  $('next').hidden=true;$('next').disabled=false;$('skip').hidden=false;$('skip').disabled=false;$('skip').textContent='略過串場';
  $('skip').onclick=()=>{if(!ctx.after&&state.stage==='main'&&binding.options.length)choose();else finish();};
  if(ctx.after)play(binding.after,()=>play(binding.options[state.selected]?.afterReply,finish));
  else play(binding.before,()=>binding.options.length?choose():finish());
  return true;
}
window.addEventListener('pagehide',stop);window.addEventListener('demo-language',()=>active?.refreshSubtitle?.());window.addEventListener('demo-voice',()=>active?.restartVoice?.());
document.getElementById('changeHero')?.addEventListener('click',()=>active?.audio.pause());
document.getElementById('goal')?.addEventListener('click',()=>active?.audio.pause());
window.ShenluStoryCinematics={render,stop};
})();
