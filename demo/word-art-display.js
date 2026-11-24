(()=>{'use strict';
const base=new URL('../',document.currentScript.src),ns='http://www.w3.org/2000/svg';let serial=0;
globalThis.ShenluWordArt={mount(target,data,locale,id,label,align='xMidYMid meet'){
 const spec=data.locales[locale]||data.locales['zh-Hant'],r=spec.rects[id];
 target.replaceChildren();target.setAttribute('aria-label',label);
 const fallback=document.createElement('span');fallback.className='sr-only';fallback.textContent=label;target.append(fallback);
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',r.join(' '));svg.setAttribute('preserveAspectRatio',align);svg.setAttribute('aria-hidden','true');svg.classList.add('country-word');
 const defs=document.createElementNS(ns,'defs'),clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect'),clipId='word-art-clip-'+(++serial);clip.id=clipId;clip.setAttribute('clipPathUnits','userSpaceOnUse');for(const [key,value]of Object.entries({x:r[0],y:r[1],width:r[2],height:r[3]}))rect.setAttribute(key,value);clip.append(rect);defs.append(clip);svg.append(defs);const image=document.createElementNS(ns,'image');image.setAttribute('href',new URL(spec.sheet,base).href);image.setAttribute('clip-path','url(#'+clipId+')');image.setAttribute('width',spec.size[0]);image.setAttribute('height',spec.size[1]);svg.append(image);target.append(svg);return target;
}};
})();
