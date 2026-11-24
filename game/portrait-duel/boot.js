/* Keep the initial template covered until the current battle art has decoded. */
globalThis.PortraitBoot = (() => {
 let revision = 0;
 async function reveal(stage, ready) {
  const panel = document.getElementById('duelBoot');
  if (!panel) return;
  const current = ++revision;
  let timer;
  try {
   await Promise.race([
    Promise.all(Array.from(stage.querySelectorAll('img[src]')).filter(img => !(stage.dataset.landscapeBackground && img.classList.contains('background') && img.style.display === 'none')).map(img => img.decode())),
    new Promise((_, reject) => { timer = setTimeout(() => reject(Error('timeout')), 15000); })
   ]);
   if (current !== revision) return;
   document.documentElement.classList.remove('duel-loading');
   panel.remove();
   ready();
  } catch {
   if (current === revision) panel.querySelector('p').textContent = '舞台圖片尚未載入完成，請重新載入，或返回旅程。';
  } finally { clearTimeout(timer); }
 }
 return { reveal };
})();
