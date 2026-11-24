(function(root){
 'use strict';
 const supported=['zh-Hant','en','ja','ko','zh-Hans'];
 const labels={'zh-Hant':'繁體中文',en:'English',ja:'日本語',ko:'한국어','zh-Hans':'简体中文'};
 function normalize(value){
  const tag=String(value||'').replace(/_/g,'-').toLowerCase();
  if(tag==='zh'||/^zh-(hant|tw|hk|mo)(-|$)/.test(tag))return 'zh-Hant';
  if(/^zh-(hans|cn|sg)(-|$)/.test(tag))return 'zh-Hans';
  for(const short of ['en','ja','ko'])if(tag===short||tag.startsWith(short+'-'))return short;
  return null;
 }
 function choose({search='',stored=null,languages=[]}={}){
  const explicit=normalize(new URLSearchParams(search).get('lang'));
  if(explicit)return explicit;
  const previous=normalize(stored);if(previous)return previous;
  for(const language of languages){const found=normalize(language);if(found)return found;}
  return 'zh-Hant';
 }
 function current(){let stored;try{stored=root.localStorage.getItem('shenlu-demo:locale');}catch(_){}
  return choose({search:root.location.search,stored,languages:root.navigator.languages||[root.navigator.language]});
 }
 function remember(locale){try{root.localStorage.setItem('shenlu-demo:locale',locale);return true;}catch(_){return false;}}
 function setURL(locale){try{const url=new URL(root.location.href);url.searchParams.set('lang',locale);root.history.replaceState(null,'',url.href);}catch(_){} }
 const api={supported,labels,normalize,choose,current,remember,setURL};
 root.ShenluDemoLocale=api;
 if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
