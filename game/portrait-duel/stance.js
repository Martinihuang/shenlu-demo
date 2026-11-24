/* Visual state only. hidden remains the authority for card information. */
(function(root){
 const back='../duel-intro/cardback.lossless.webp';
 function apply(node,card){
  const concealed=!!card.hidden,guarding=!concealed&&card.mode==='def';
  node.classList.toggle('faceup-defense',guarding);
  node.classList.toggle('hidden',concealed);
  node.dataset.position=concealed?'set':guarding?'def':'atk';
  let guard=node.querySelector('.defense-screen');
  if(!guard){guard=document.createElement('span');guard.className='defense-screen';guard.setAttribute('aria-hidden','true');const img=document.createElement('img');img.src=back;img.alt='';img.onload=()=>{if(img.naturalWidth&&img.naturalHeight)guard.style.setProperty('--cardback-ratio',img.naturalHeight/img.naturalWidth);};guard.append(img);node.append(guard);}
  guard.hidden=concealed;
 }
 function label(card){return card?.hidden?'蓋牌':card?.mode==='def'?'守備':'攻擊';}
 function fieldArt(card,side,atlas,expedition=false){if(!card?.id||card.hidden)return back;const entry=atlas[card.id]||{};return ((side===0&&card.mode!=='def')||(side===1&&card.mode==='def'&&!expedition)?entry.back:entry.front)||entry.front||back;}
 const api={apply,label,fieldArt};if(typeof module!=='undefined')module.exports=api;else root.PortraitStance=api;
})(globalThis);
