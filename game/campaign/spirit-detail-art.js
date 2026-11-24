// Android: use the current battlefield front or the existing premium illustration.
(function(root){
 const countries=new Set(['TW','CN','JP','KR','TH','IN','EG','NO','VA']);
 function resolve(id){
  const card=root.TW09Data?.cards?.[id],art=root.PortraitArt?.[id];
  if(!card?.level||!art?.front)return null;
  if((/^UW-Q-(blood|mirror|frost|hunt|night|fate|seal|rift|pact)$/.test(id)||/^UW-(blood|mirror|frost|hunt|night|fate|seal|rift|pact)-[0-2]$/.test(id))&&art.premium&&art.premium!==art.front)return {mode:'premium',image:art.premium};
  if(art.artRolePolicy){return art.portrait?{mode:'premium',image:art.portrait}:{mode:'front',image:art.front};}
  const country=countries.has(card.country)?card.country:id.slice(0,2);
  if(!countries.has(country))return {mode:'front',image:art.front};
  const binding=root['Shenlu'+country+'DetailArt']?.[id];
  const premium=binding?.mode==='premium'?binding.image:art.premium;
  // A cutout reused as "premium" is still a front, not a complete illustration.
  if(premium&&premium!==art.front&&id!=='TW43-M10')return {mode:'premium',image:premium};
  return {mode:'composite',image:art.front,background:'../entrances/'+country+'-entrance.webp'};
 }
 function apply(image,id,base){
  const binding=resolve(id);if(!binding)return;
  image.src=new URL(binding.image,base).href;
  image.dataset.binding=id;image.dataset.artMode=binding.mode;
  image.style.backgroundImage=binding.background?'url("'+new URL(binding.background,base).href+'")':'';
  image.style.backgroundSize='cover';image.style.backgroundPosition='center';
  image.style.objectFit='contain';image.style.objectPosition='center';
 }
 root.ShenluSpiritDetail={resolve,apply};
})(globalThis);
