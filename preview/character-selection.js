(() => {
 'use strict';
 const heroes = window.SHENLU_SELECTION;
 const $ = id => document.getElementById(id);
 const asset = hero => '../assets/character-selection/' + hero.file;
 const ns = 'http://www.w3.org/2000/svg';
 let clipIndex = 0;
 function word(target, group, index, label) {
  const data = window.SHENLU_TYPE[group], [x,y,right,bottom] = data.rects[index];
  const width = right-x, height = bottom-y, id = 'word-clip-' + (++clipIndex);
  const svg = document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); svg.setAttribute('aria-hidden','true');
  const defs = document.createElementNS(ns,'defs'), clip = document.createElementNS(ns,'clipPath'), rect = document.createElementNS(ns,'rect');
  clip.id = id; rect.setAttribute('width',width); rect.setAttribute('height',height); clip.append(rect); defs.append(clip);
  const image = document.createElementNS(ns,'image');
  image.setAttribute('href','../assets/selection-type-v1/'+(data.file||group)+'.webp?typev=20261005-restored'); image.setAttribute('x',-x); image.setAttribute('y',-y); image.setAttribute('width',data.size[0]); image.setAttribute('height',data.size[1]); image.setAttribute('clip-path',`url(#${id})`);
  svg.append(defs,image); target.replaceChildren(svg); target.classList.add('word-art'); target.setAttribute('aria-label',label);
  if (group === 'shortNames') {
   // Normalize the painted name, independent of crop padding and character count.
   const scale = 7.4 / data.inkHeights[index];
   svg.style.width = `${width * scale}cqw`;
   svg.style.height = `${height * scale}cqw`;
  }
 }
 word(document.querySelector('.logo'),'ui',0,'神籙');
 const storageKey = 'demo-v2:shenlu.pc.selection.preview';
 let selected = 0;
 try { const saved = sessionStorage.getItem(storageKey); const index = heroes.findIndex(h => h.id === saved); if(index >= 0) selected = index; } catch {}
 const countries = heroes.filter((_, i) => i % 2 === 0);
 countries.forEach(hero => {
  const button = document.createElement('button');
  button.textContent = hero.country; button.dataset.region = hero.region;
  button.onclick = () => { selected = heroes.findIndex(h => h.region === hero.region); render(); };
  $('countries').append(button);
 });
 function render() {
  const hero = heroes[selected];
  $('scene').src = asset(hero); $('scene').alt = hero.country + '・' + hero.name + '完整人物場景';
  document.querySelector('.scene-fill').style.backgroundImage = `url("${asset(hero)}")`;
  $('country').textContent = hero.country; globalThis.ShenluDemoMenu?.selection(hero);
  word($('hero-name'),'shortNames',selected,hero.name); $('job').textContent = hero.label;
  $('country-emblem').src = '../assets/character-selection/country-marks/'+hero.region+'.svg'; $('country-emblem').alt = hero.country+'輪廓';
  word($('story-title'),'stories',selected,hero.title);
  $('story-title').classList.toggle('long-title', hero.title.length > 8);
  document.querySelector('.hero-info').classList.toggle('long-copy', hero.title.length > 8);
  $('summary').replaceChildren();
  const clauses = hero.summary.split('，');
  clauses.forEach((clause, i) => { if(i) $('summary').append(document.createElement('br')); $('summary').append(document.createTextNode(clause + (i < clauses.length - 1 ? '，' : ''))); });
  $('portraits').replaceChildren();
  heroes.forEach((candidate, index) => {
   if (candidate.region !== hero.region) return;
   const button = document.createElement('button'); button.className = 'portrait';
   button.setAttribute('aria-label', '選擇' + candidate.name); button.setAttribute('aria-pressed', String(index === selected));
   const figure = document.createElementNS(ns,'svg'), img = document.createElementNS(ns,'image');
   const [x,y,r,b] = candidate.cutoutBounds;
   figure.setAttribute('viewBox',`${x} ${y} ${r-x} ${b-y}`); figure.setAttribute('preserveAspectRatio','xMidYMax meet'); figure.setAttribute('aria-hidden','true'); figure.classList.add('figure');
   img.setAttribute('href','../assets/character-selection/'+candidate.cutout); img.setAttribute('width',candidate.cutoutSize[0]); img.setAttribute('height',candidate.cutoutSize[1]); figure.append(img);
   const name = document.createElement('span'); name.className = 'portrait-name'; name.textContent = candidate.name;
   button.append(figure, name); button.onclick = () => { selected = index; render(); }; $('portraits').append(button);
  });
  document.querySelectorAll('#countries button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.region === hero.region)));
  try { sessionStorage.setItem(storageKey, hero.id); } catch {}
 }
 const step = direction => { selected = (selected + direction + heroes.length) % heroes.length; render(); };
 $('prev').onclick = () => step(-1); $('next').onclick = () => step(1);
 $('random').onclick = () => step(1 + Math.floor(Math.random() * (heroes.length - 1)));
 $('confirm').onclick = ShenluPC.guard(() => {
  if(!['TW','TW-YUAN','EG-P-HERO','EG-HERO','NO-EINAR','NO-INGRID'].includes(heroes[selected].key))return; ShenluPC.choose(heroes[selected].key);
  location.href = 'journey.html?hero=' + encodeURIComponent(heroes[selected].id);
 });
 document.addEventListener('keydown', event => {
  if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
 });
 $('scene').onload = () => { $('load-error').hidden = true; };
 $('scene').onerror = () => { $('load-error').hidden = false; };
 render();
})();
