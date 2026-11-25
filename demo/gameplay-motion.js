(()=>{'use strict';
 const image=document.querySelector('[data-site-screen="duel"]');
 if(!image)return;
 const figure=image.closest('figure'),caption=figure.querySelector('figcaption');
 const video=document.createElement('video'),button=document.createElement('button');
 video.className='duel-motion';video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.hidden=true;
 video.id='duel-motion';video.setAttribute('aria-describedby','duel-motion-caption');
 caption.id='duel-motion-caption';button.type='button';button.className='motion-toggle';button.setAttribute('aria-controls',video.id);button.hidden=true;
 image.before(video);caption.append(button);
 const words={
  'zh-Hant':{play:'播放示範',pause:'暫停示範'},en:{play:'Play clip',pause:'Pause clip'},
  ja:{play:'動画を再生',pause:'動画を一時停止'},ko:{play:'영상 재생',pause:'영상 일시 정지'},
  'zh-Hans':{play:'播放演示',pause:'暂停演示'}
 };
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const media={'zh-Hant':'duel-zh-Hant-aze-vs-salma-v1',en:'duel-en-aze-vs-salma-v1'};
 let current='',available=false,visible=false,manualPause=false,failed=false;
 function label(){const p=words[current]||words['zh-Hant'];button.textContent=video.paused?p.play:p.pause;}
 function mayAutoplay(){return !reduced.matches&&!navigator.connection?.saveData&&!manualPause;}
 function play(){if(!available||failed)return;video.play().catch(()=>{label();});}
 function refresh(){
  const locale=document.documentElement.lang;if(locale===current)return;
  video.pause();video.removeAttribute('src');video.load();current=locale;failed=false;manualPause=false;
  available=!!media[locale];
  image.hidden=available;video.hidden=!available;button.hidden=!available;
  if(available){video.poster=new URL('demo/motion/'+media[locale]+'-poster.jpg',location.href).href;
   image.src=video.poster;
   video.src=new URL('demo/motion/'+media[locale]+'.mp4',location.href).href;
   video.setAttribute('aria-label',image.alt);if(visible&&mayAutoplay())play();}
  label();
 }
 button.addEventListener('click',()=>{if(video.paused){manualPause=false;play();}else{manualPause=true;video.pause();}});
 video.addEventListener('play',label);video.addEventListener('pause',label);
 video.addEventListener('error',()=>{failed=true;video.hidden=true;image.hidden=false;button.hidden=true;});
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible&&mayAutoplay())play();else video.pause();},{threshold:0.15});
 observer.observe(figure);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(visible&&mayAutoplay())play();});
 reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();else if(visible&&mayAutoplay())play();});
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();
})();
