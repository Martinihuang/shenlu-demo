(function(){
 'use strict';
 const base=new URL('../',document.currentScript.src);
 const mount=document.getElementById('intro-details');
 if(!mount)return;
 const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;};
 let data,selectedRealm='TW';
 const compact=matchMedia('(max-width:700px)');
 const copyNodes=[];
 const bind=(element,key)=>{copyNodes.push([element,key]);return element;};
 const read=(pack,key)=>key.split('.').reduce((value,part)=>value[part],pack);
 function chooseRealm(id){selectedRealm=id;updateRealms();}
 function updateRealms(){
  const tabs=mount.querySelector('.realm-tabs');if(!tabs)return;tabs.hidden=!compact.matches;
  for(const button of tabs.querySelectorAll('button')){const selected=button.dataset.realm===selectedRealm;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;}
  for(const panel of mount.querySelectorAll('.detail-realm')){const id=panel.dataset.realm;panel.hidden=compact.matches&&id!==selectedRealm;if(compact.matches){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','realm-tab-'+id);}else{panel.removeAttribute('role');panel.setAttribute('aria-labelledby',panel.id+'-title');}}
 }
 function refresh(){
  const locale=data.locales[document.documentElement.lang]?document.documentElement.lang:'zh-Hant';
  const pack=data.locales[locale];
  for(const [element,key]of copyNodes)element.textContent=read(pack,key);
  for(const image of mount.querySelectorAll('[data-detail-hero]'))image.alt=pack.heroes[image.dataset.detailHero].name+' '+pack.imageSuffix;
  const url=new URL('preview/opening.html',base);url.searchParams.set('lang',locale);
  mount.querySelector('.detail-play').href=url.href;
  mount.querySelector('.realm-tabs').setAttribute('aria-label',pack.realmPicker);
  mount.dataset.locale=locale;
 }
 function build(){
  const cast=make('section','intro-cast');cast.id='intro-cast';cast.setAttribute('aria-labelledby','intro-cast-title');
  const heading=make('div','detail-heading');const title=bind(make('h2'),'castTitle');title.id='intro-cast-title';heading.append(title,bind(make('p'),'castLead'));cast.append(heading);
  const jumps=make('nav','detail-jumps');for(const [key,href]of [['jumpCast','#intro-cast'],['jumpGameplay','#intro-gameplay']]){const a=bind(make('a'),key);a.href=href;jumps.append(a);}cast.append(jumps);
  const tabs=make('div','realm-tabs');tabs.setAttribute('role','tablist');
  for(const realm of data.realms){const tab=bind(make('button'),'realms.'+realm.id+'.name');tab.type='button';tab.id='realm-tab-'+realm.id;tab.dataset.realm=realm.id;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','intro-realm-'+realm.id.toLowerCase());tab.onclick=()=>chooseRealm(realm.id);tab.onkeydown=event=>{let index=data.realms.findIndex(r=>r.id===realm.id);if(event.key==='ArrowRight')index=(index+1)%data.realms.length;else if(event.key==='ArrowLeft')index=(index+data.realms.length-1)%data.realms.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=data.realms.length-1;else return;event.preventDefault();chooseRealm(data.realms[index].id);tabs.querySelectorAll('button')[index].focus();};tabs.append(tab);}cast.append(tabs);
  for(const realm of data.realms){
   const section=make('section','detail-realm');section.id='intro-realm-'+realm.id.toLowerCase();section.dataset.realm=realm.id;
   const label=bind(make('h3'),'realms.'+realm.id+'.name');label.id=section.id+'-title';section.setAttribute('aria-labelledby',label.id);
   const description=make('div','realm-introduction');description.append(label,bind(make('p'),'realms.'+realm.id+'.lead'));section.append(description);
   const pair=make('div','realm-pair');
   for(const id of realm.heroes){
    const article=make('article','detail-hero'),figure=make('figure','detail-portrait');
    const image=make('img');image.src=new URL(data.heroes.find(hero=>hero.id===id).image,base).href;image.loading='lazy';image.decoding='async';image.width=1024;image.height=1536;image.dataset.detailHero=id;figure.append(image);
    const bio=make('div','detail-bio');bio.append(bind(make('h4'),'heroes.'+id+'.name'),bind(make('p','detail-role'),'heroes.'+id+'.label'),bind(make('p'),'heroes.'+id+'.summary'));
    article.append(figure,bio);pair.append(article);
   }
   section.append(pair);cast.append(section);
  }
  const gameplay=make('section','intro-gameplay');gameplay.id='intro-gameplay';gameplay.setAttribute('aria-labelledby','intro-gameplay-title');
  const gameHeading=make('div','detail-heading'),gameTitle=bind(make('h2'),'gameplayTitle');gameTitle.id='intro-gameplay-title';gameHeading.append(gameTitle,bind(make('p'),'gameplayLead'));gameplay.append(gameHeading);
  const modes=make('div','detail-modes');
  for(let i=0;i<3;i++){const mode=make('article','detail-mode');mode.append(bind(make('h3'),'modes.'+i+'.title'),bind(make('p'),'modes.'+i+'.body'));modes.append(mode);}
  const footer=make('div','detail-scope');footer.append(bind(make('p'),'scopeNote'),bind(make('a','detail-play'),'play'));
  gameplay.append(modes,footer);mount.replaceChildren(cast,gameplay);refresh();updateRealms();compact.addEventListener('change',updateRealms);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  mount.dataset.ready='true';
 }
 fetch(new URL('demo/intro-details-copy.json?v=polish1',base)).then(response=>{if(!response.ok)throw Error('Introduction details unavailable');return response.json();}).then(value=>{data=value;build();}).catch(error=>{mount.dataset.ready='false';console.warn(error);});
})();
