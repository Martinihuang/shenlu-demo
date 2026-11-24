/* Display-only full-message compiler. No DOM, engine, storage, eval, or property-path evaluation. */
(function(root){'use strict';
const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),tokenRE=/\$\{[A-Za-z][A-Za-z0-9]*\}/g;
const aliases=values=>[...values.keys()].sort((a,b)=>b.length-a.length).map(esc).join('|');
const pairs=rows=>{const m=new Map();for(const pair of rows||[])if(Array.isArray(pair)&&pair.length===2&&pair.every(v=>typeof v==='string'))m.set(pair[0],pair[1]);return m;};
function create(pack){
 if(!pack||!Array.isArray(pack.entries)||!['zh-Hant','en','ja','ko','zh-Hans'].includes(pack.locale))throw Error('dynamic-copy:invalid-pack');
 const maps=new Map(Object.entries(pack.maps||{}).map(([key,value])=>[key,pairs(value)])),managed=new Set(),entries=[];
 function domain(spec){
  if(!spec||typeof spec.kind!=='string')throw Error('dynamic-copy:missing-domain');
  if(spec.kind==='integer-text')return {pattern:'(?:0|[1-9][0-9]*)',resolve(value){if(!/^(0|[1-9][0-9]*)$/.test(value))return null;const n=BigInt(value);return (spec.min===undefined||n>=BigInt(spec.min))&&(spec.max===undefined||n<=BigInt(spec.max))?value:null;}};
  if(spec.kind==='user-display-name'||spec.kind==='user-save-name'||spec.kind==='formatted-date-text'){const max=spec.kind==='user-display-name'?20:spec.kind==='user-save-name'?200:160;return {pattern:'[^\\r\\n]{1,'+max+'}',resolve:value=>[...value].length<=max?(spec.kind==='user-display-name'?(maps.get('deck')?.get(value)||value):value):null};}
  if(spec.kind==='card-title-list'){
   const m=maps.get('card')||new Map(),alts=aliases(m);return {pattern:alts?'(?:'+alts+')(?:、(?:'+alts+'))*':'(?!)',resolve(value){const p=value.split('、');if(p.some(x=>!m.has(x)))return null;return p.map(x=>m.get(x)).join(pack.locale==='ja'||pack.locale==='zh-Hans'||pack.locale==='zh-Hant'?'、':', ');}};
  }
  const kindToMap={'finite-card-title':'card','finite-hero-name':'hero','finite-country-name':'country','finite-route-title':'title','finite-route-story-title':'story','finite-chapter-label':'chapter'};
  let m;
  if(spec.kind==='finite-enum'){
   m=new Map();const values=spec.values,targets=pack.locale==='zh-Hant'?values:spec.translations?.[pack.locale];if(!Array.isArray(values)||!Array.isArray(targets)||targets.length!==values.length)throw Error('dynamic-copy:invalid-enum');
   values.forEach((v,i)=>{m.set(v,targets[i]);m.set(targets[i],targets[i]);});
  }else if(Object.hasOwn(kindToMap,spec.kind)){
   m=new Map(maps.get(kindToMap[spec.kind])||[]);
   // A narrower field domain (e.g. TW/NO Expedition) must not accept all country previews.
   if(Array.isArray(spec.values)){const narrowed=new Map();for(const value of spec.values)if(m.has(value)){const target=m.get(value);narrowed.set(value,target);narrowed.set(target,target);}m=narrowed;}
  }else throw Error('dynamic-copy:unsupported-domain:'+spec.kind);
  const a=aliases(m);return {pattern:a?'(?:'+a+')':'(?!)',resolve:value=>m.has(value)?m.get(value):null};
 }
 for(const item of pack.entries){
  if(typeof item.source!=='string'||typeof item.target!=='string')throw Error('dynamic-copy:invalid-entry');const tokens=item.source.match(tokenRE)||[];
  if(item.source.replace(tokenRE,'').includes('${'))throw Error('dynamic-copy:opaque-expression-not-supported');
  const targetTokens=item.target.match(tokenRE)||[];if(JSON.stringify(tokens.slice().sort())!==JSON.stringify(targetTokens.slice().sort()))throw Error('dynamic-copy:placeholder-drift');
  if(new Set(tokens).size!==tokens.length)throw Error('dynamic-copy:duplicate-placeholder');
  const ds=tokens.map(t=>{const key=t.slice(2,-1);if(!Object.hasOwn(item.domains,key))throw Error('dynamic-copy:missing-domain');return domain(item.domains[key]);});
  for(const source of new Set([item.source,...(item.aliases||[])])){
   if(typeof source!=='string'||JSON.stringify((source.match(tokenRE)||[]))!==JSON.stringify(tokens))throw Error('dynamic-copy:invalid-alias');
   managed.add(source);const parts=source.split(tokenRE),re=new RegExp('^'+parts.map((p,i)=>esc(p)+(i<ds.length?'('+ds[i].pattern+')':'')).join('')+'$','u');
   entries.push({id:item.id,tokens,ds,re,target:item.target,specificity:parts.join('').length,source});
  }
 }
 entries.sort((a,b)=>b.specificity-a.specificity||b.source.length-a.source.length);
 function display(text){if(typeof text!=='string')return null;for(const item of entries){const match=item.re.exec(text);if(!match||match[0]!==text)continue;const values=new Map();let valid=true;for(let i=0;i<item.tokens.length;i++){const value=item.ds[i].resolve(match[i+1]);if(value===null){valid=false;break}values.set(item.tokens[i],value);}if(valid)return item.target.replace(tokenRE,t=>values.get(t));}return null;}
 return {display,managesSource:source=>managed.has(source),get sources(){return [...managed]},get count(){return entries.length},locale:pack.locale};
}
const api={create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ShenluDynamicCopy=api;
})(typeof globalThis!=='undefined'?globalThis:this);
