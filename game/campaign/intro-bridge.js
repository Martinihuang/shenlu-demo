(function(){'use strict';
const query=new URLSearchParams(location.search);if(query.get('campaign')!=='1')return;
document.documentElement.classList.add('campaign-intro');
try{
 const store=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});store.load();const run=store.resume();
 if(!run||run.id!==query.get('run'))throw Error('找不到這次挑戰，請返回九國入口');
 const battle='../portrait-duel/index.html?campaign=1&run='+encodeURIComponent(run.id);
 if(run.status!=='active'){location.replace('../campaign/index.html?view=result');return;}
 if(![0,1].includes(run.config.first))throw Error('尚未確認本場的先後手，暫時無法開始決鬥。');
 const ally=ShenluHeroBindings[run.config.country]?{...ShenluHeroBindings[run.config.country],video:globalThis.ShenluEntranceVideos?.hero(run.config.country)}:null;
 const expedition=globalThis.ShenluExpedition?.stages.find(st=>st.id===run.stageId);
 let enemy=ShenluHeroBindings[run.config.enemy]?{...ShenluHeroBindings[run.config.enemy],video:globalThis.ShenluEntranceVideos?.hero(run.config.enemy)}:null;
 if(run.config.nether)enemy=ShenluUnderworldUI.hero(run.config.nether.queen);if(expedition){const selectedVideo=globalThis.ShenluEntranceVideos?.boss(expedition.boss)||globalThis.ShenluEntranceVideos?.stage(expedition.country,expedition.number),front=globalThis.PortraitArt?.[selectedVideo?.id||expedition.boss]?.front;if(!front)throw Error('缺少女妖的出場圖片，暫時無法開始決鬥。');const scene=ShenluLandscapeStages.resolve({expedition:run.config.expedition}),video=selectedVideo;enemy={name:expedition.country==='NO'&&video?video.name:expedition.name,label:'第 '+expedition.number+' 關',portrait:new URL(front,new URL('../portrait-duel/',location.href)).href,arena:scene.background,video};}
 if(enemy?.video&&(run.introVideoIds||[]).includes(enemy.video.id))enemy={...enemy,video:null};
 if(!ally||!enemy)throw Error('無法載入對戰角色資料。');
 for(const [id,hero] of [['ally',ally],['enemy',enemy]]){const img=document.getElementById(id);img.src=hero.portrait;img.alt=hero.label+' '+hero.name;}
 const backdrop=document.querySelector('.backdrop');backdrop.src=enemy.arena;backdrop.alt=enemy.label+'決鬥舞台';
 document.querySelector('#cardA .face span').textContent=ally.name;document.querySelector('#cardB .face span').textContent=enemy.name;document.getElementById('subtitle').textContent=ally.name+'　對　'+enemy.name;
 window.ShenluCampaignIntro={run,ally,enemy,cancel(){const current=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});current.load();if(!run.state)current.cancelUnstartedRun(run.id);location.replace(expedition?'../expedition.html?country='+expedition.country:'../campaign/index.html?view=stage&stage='+encodeURIComponent(run.stageId));},enter(playedVideoIds=[]){const current=ShenluCampaignStore.create({storage:ShenluStorage,catalog:ShenluCampaignCatalog});current.load();const active=current.resume();if(!active||active.id!==run.id||active.status!=='active')throw Error('挑戰已由其他分頁更新，請返回旅程');if(enemy.video&&/^(YAO-|UW-Q-)/.test(enemy.video.id)&&playedVideoIds.includes(enemy.video.id))current.recordIntroVideos(run.id,[enemy.video.id]);location.replace(battle);}};
}catch(error){window.ShenluCampaignIntro={error:globalThis.ShenluPlayerCopy.error(error,'intro')};document.getElementById('status').textContent= globalThis.ShenluPlayerCopy.error(error,'intro');const ready=document.getElementById('ready');ready.querySelector('p').textContent= globalThis.ShenluPlayerCopy.error(error,'intro');const button=document.getElementById('play');button.textContent='返回九國入口';button.disabled=false;button.onclick=()=>location.href='../world-portrait.html';}
})();
