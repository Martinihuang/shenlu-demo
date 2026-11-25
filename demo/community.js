(()=>{'use strict';const root=new URL('../',document.currentScript.src);let packs,config,total;
 const mount=document.getElementById('community'),stats=document.getElementById('community-stat');if(!mount&&!stats)return;
 const node=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
 function refresh(){if(!packs||!config)return;const lang=document.documentElement.lang,copy=packs[lang]||packs['zh-Hant'];
  if(mount){const title=node('h1',copy.title);title.id='community-title';const lead=node('p',copy.lead),link=node('a',copy.ask);link.href=config.feedback;link.target='_blank';link.rel='noopener noreferrer';link.className='question-link';
  mount.replaceChildren(title,lead);for(const [q,a]of copy.faq){const details=node('details');details.append(node('summary',q),node('p',a));mount.append(details);}mount.append(link,node('p',copy.private));}

  if(stats&&total!==undefined){const count=node('strong',copy.stat.replace('{n}',new Intl.NumberFormat(lang).format(total))),note=node('p',copy.statNote);note.className='stat-note';stats.replaceChildren(count,note);stats.hidden=false;}
 }
 Promise.all(['community-copy.json','community-config.json'].map(path=>fetch(new URL('demo/'+path,root),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json();}))).then(([p,c])=>{packs=p;config=c;refresh();
  if(!c.goatcounter?.enabled||!/^[a-z0-9-]+$/.test(c.goatcounter.site))return;
  return fetch('https://'+c.goatcounter.site+'.goatcounter.com/counter/'+encodeURIComponent('play-start')+'.json',{credentials:'omit',signal:AbortSignal.timeout(8000)}).then(async r=>{if(!r.ok&&r.status!==404)throw Error();const data=await r.json();if(r.status===404&&String(data.count)!=='0')throw Error();return data;}).then(data=>{const raw=String(data.count??'').replace(/,/g,'');if(!/^\d+$/.test(raw))throw Error();total=Number(raw);if(!Number.isSafeInteger(total))throw Error();refresh();});
 }).catch(()=>{});
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
