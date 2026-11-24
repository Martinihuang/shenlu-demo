(function(){
 'use strict';
 const base=new URL('../',document.currentScript.src);
 const mount=document.getElementById('intro-details');
 if(!mount)return;
 const make=(tag,className,text)=>{const element=document.createElement(tag);if(className)element.className=className;if(text)element.textContent=text;return element;};
 let data;
 const copyNodes=[];
 const bind=(element,key)=>{copyNodes.push([element,key]);return element;};
 const read=(pack,key)=>key.split('.').reduce((value,part)=>value[part],pack);
 function refresh(){
  const locale=data.locales[document.documentElement.lang]?document.documentElement.lang:'zh-Hant';
  const pack=data.locales[locale];
  for(const [element,key]of copyNodes)element.textContent=read(pack,key);
  for(const image of mount.querySelectorAll('[data-detail-hero]'))image.alt=pack.heroes[image.dataset.detailHero].name+' '+pack.imageSuffix;
  const url=new URL('preview/opening.html',base);url.searchParams.set('lang',locale);
  mount.querySelector('.detail-play').href=url.href;
  mount.dataset.locale=locale;
 }
 function build(){
  const cast=make('section','intro-cast');cast.id='intro-cast';cast.setAttribute('aria-labelledby','intro-cast-title');
  const heading=make('div','detail-heading');const title=bind(make('h2'),'castTitle');title.id='intro-cast-title';heading.append(title,bind(make('p'),'castLead'));cast.append(heading);
  for(const realm of data.realms){
   const section=make('section','detail-realm');section.id='intro-realm-'+realm.id.toLowerCase();
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
  gameplay.append(modes,footer);mount.replaceChildren(cast,gameplay);refresh();
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  mount.dataset.ready='true';
 }
 fetch(new URL('demo/intro-details-copy.json?v=details1',base)).then(response=>{if(!response.ok)throw Error('Introduction details unavailable');return response.json();}).then(value=>{data=value;build();}).catch(error=>{mount.dataset.ready='false';console.warn(error);});
})();
