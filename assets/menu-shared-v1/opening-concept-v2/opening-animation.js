(()=>{'use strict';
const menu=document.querySelector('.menu');
if(!menu||menu.querySelector('.opening-animation'))return;
const source=new URL('opening-v6-native720-first6s-1920x1080-web-v1.mp4',document.currentScript.src).href;
const style=document.createElement('style');
style.textContent=`
.menu>.opening-animation{position:relative;display:flex;align-items:center;width:100%;min-height:168px;padding:0 0 0 74px;font-family:inherit;font-weight:400;font-size:64px;letter-spacing:12px;line-height:1.2;color:#c8c1b0;text-shadow:0 3px 8px #010811,0 0 20px #010811;border:0;background:none;text-align:left;cursor:pointer}
.menu>.opening-animation:hover{color:#fff0c5}
#opening-animation-dialog{position:fixed;inset:0;margin:0!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;padding:0!important;border:0!important;outline:0!important;box-shadow:none!important;overflow:hidden;background:#000!important;color:#f5e3bf}
#opening-animation-dialog::backdrop{background:#000}
#opening-animation-dialog .opening-animation-screen{position:relative;width:100%;height:100%;background:#000}
#opening-animation-dialog video{display:block;width:100%;height:100%;object-fit:contain;background:#000}
#opening-animation-dialog button{position:absolute;z-index:2;font-family:inherit;font-size:22px;min-height:48px;min-width:112px;padding:8px 18px;cursor:pointer}
#opening-animation-dialog [data-close]{top:16px;right:16px}
#opening-animation-dialog [data-play]{bottom:32px;left:50%;transform:translateX(-50%)}
#opening-animation-dialog [hidden]{display:none!important}
#opening-animation-dialog .opening-animation-status{position:absolute;z-index:2;bottom:96px;left:0;width:100%;text-align:center;font-size:18px;line-height:1.4;margin:0;padding:8px;background:#000b}
#opening-animation-dialog .opening-animation-status:empty{display:none}
`;
document.head.append(style);
const trigger=document.createElement('button');
trigger.type='button';trigger.className='opening-animation';trigger.textContent='開場動畫';
trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','opening-animation-dialog');
menu.insertBefore(trigger,menu.querySelector('.minor'));
const dialog=document.createElement('dialog');
dialog.id='opening-animation-dialog';dialog.setAttribute('aria-labelledby','opening-animation-title');
dialog.innerHTML='<div class="opening-animation-screen"><h2 id="opening-animation-title" hidden>開場動畫</h2><video playsinline preload="none" aria-label="神籙開場動畫"></video><p class="opening-animation-status" role="status"></p><button type="button" data-play hidden>播放</button><button type="button" data-close>返回選單</button></div>';
document.body.append(dialog);
const screen=dialog.querySelector('.opening-animation-screen'),video=dialog.querySelector('video'),status=dialog.querySelector('[role=status]'),retry=dialog.querySelector('[data-play]');
let ownsFullscreen=false;
video.src=source;
function play(){
 status.textContent='';retry.hidden=true;video.currentTime=0;
 video.play().catch(()=>{if(dialog.open){status.textContent='請按播放鍵觀看。';retry.hidden=false;}});
}
trigger.addEventListener('click',()=>{
 dialog.showModal();
 if(screen.requestFullscreen&&document.fullscreenEnabled)screen.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
 play();
});
retry.addEventListener('click',play);
dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{
 video.pause();ownsFullscreen=false;
 if(document.fullscreenElement===screen)document.exitFullscreen().catch(()=>{});
 trigger.focus();
});
document.addEventListener('fullscreenchange',()=>{
 if(document.fullscreenElement===screen){ownsFullscreen=true;if(!dialog.open)document.exitFullscreen().catch(()=>{});}
 else if(ownsFullscreen&&dialog.open)dialog.close();
});
video.addEventListener('ended',()=>dialog.close());
video.addEventListener('error',()=>{status.textContent='影片暫時無法播放，請返回選單後再試。';});
})();
