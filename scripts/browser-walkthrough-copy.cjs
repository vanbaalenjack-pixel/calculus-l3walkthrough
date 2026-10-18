/* Real disclosure/state regressions, using a disposable profile. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const folder=process.env.CALC_REVIEW_DIR||path.resolve(__dirname,'../.review/2026-10-18-cleanup');
const checks=[],errors=[];let browser;
(async()=>{
 browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const c=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 fs.mkdirSync(folder+'/screenshots',{recursive:true});
 for(const url of ['1a2024.html','1a2025-l2.html','alg-1b2025-l2.html','int-3c2025.html','complex-2024.html?q=2a']){
  await p.goto(origin+url,{waitUntil:'networkidle'});
  const first=p.locator('#walkthrough-step-1');
  const toggle=first.locator('.step-working-btn');
  const prompt=first.locator('.walkthrough-prediction');
  const initial=await p.evaluate(()=>localStorage.getItem('calc.nz.walkthroughProgress'));
  await toggle.focus();await p.keyboard.press('Enter');
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  assert(await first.locator('.walkthrough-step-working').isVisible());
  if(await prompt.count())assert(!(await prompt.isVisible()));
  assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
  await p.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  if(await prompt.count())assert(await prompt.isVisible());
  await p.locator('#walkthrough-next-btn').click();
  await p.waitForFunction(()=>document.activeElement===document.querySelector('#walkthrough-step-2 h2'));
  await p.locator('#walkthrough-previous-btn').click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  await p.locator('#bookmark-question-btn').click();await p.locator('#retry-question-btn').click();
  await p.locator('label[for="exam-mode-setting"]').click();
  assert(!(await p.locator('#walkthrough-content').isVisible()));
  assert((await p.locator('#exam-mode-setting-status').innerText()).includes('hidden'));
  await p.locator('#exam-mode-reveal-btn').click();assert(await p.locator('#walkthrough-content').isVisible());
  assert((await p.locator('#exam-mode-setting-status').innerText()).includes('Revealed'));
  await p.reload({waitUntil:'networkidle'});
  assert(!(await p.locator('#walkthrough-content').isVisible()));
  assert.equal(await p.locator('#bookmark-question-btn').getAttribute('aria-pressed'),'true');
  assert.equal(await p.locator('#retry-question-btn').getAttribute('aria-pressed'),'true');
  await p.locator('#exam-mode-off-btn').click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  if(await prompt.count())assert(await prompt.isVisible());
  const n=await p.locator('.walkthrough-step-card').count();
  for(let i=0;i<n;i++)await p.locator('#walkthrough-next-btn').click();
  assert.equal(await p.locator('#walkthrough-next-btn').innerText(),'Walkthrough reviewed');
  const progress=await p.evaluate(()=>JSON.parse(localStorage.getItem('calc.nz.walkthroughProgress')));
  assert(!JSON.stringify(progress).includes('solved-independently'));
  await p.reload({waitUntil:'networkidle'});
  assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert(!(await p.locator('#walkthrough-progress-status').innerText()).includes('Reviewed'));
  checks.push({url,keyboard:true,exam:true,returning:true,steps:n,progressBefore:initial});
 }
 // Optional fields cannot repurpose checker messages, or create empty panels.
 await p.goto(origin+'1a2024.html',{waitUntil:'networkidle'});
 const optional=await p.evaluate(()=>{
  const config=normaliseProgressiveWalkthroughConfig({guidedSteps:[{title:'Check',successMessage:'Old checker response',correctFeedback:'Old checker response'}]});
  const mount=document.createElement('div');mount.innerHTML=renderProgressiveStep(config.guidedSteps[0],0);
  return {text:mount.textContent,panels:mount.querySelectorAll('.walkthrough-step-preview,.walkthrough-step-working,.walkthrough-step-actions').length};
 });
 assert(!/Old checker|undefined|null/.test(optional.text));assert.equal(optional.panels,0);
 for(const width of [320,390,1440]){
  await p.setViewportSize({width,height:1000});await p.goto(origin+'1a2024.html',{waitUntil:'networkidle'});
  await p.locator('#walkthrough-next-btn').click();await p.locator('#walkthrough-next-btn').click();
  const card=p.locator('#walkthrough-step-3');await card.scrollIntoViewIfNeeded();
  assert((await card.innerText()).includes('Apply the chain rule'));
  assert(!(await card.innerText()).includes('exactly right'));
  await p.screenshot({path:`${folder}/screenshots/2024-q1a-step3-${width}-closed.png`,fullPage:true});
  await card.screenshot({path:`${folder}/screenshots/step3-${width}-closed.png`});
  await card.locator('.step-working-btn').click();
  assert(!(await card.locator('.walkthrough-prediction').isVisible()));
  const tex=await card.locator('annotation[encoding="application/x-tex"]').allTextContents();
  assert(tex.some(s=>s.includes(String.raw`-\frac{18x^3}{\sqrt{4-9x^4}}`)));
  assert((await card.innerText()).includes('equivalent'));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await p.screenshot({path:`${folder}/screenshots/2024-q1a-step3-${width}-open.png`,fullPage:true});
  await card.screenshot({path:`${folder}/screenshots/step3-${width}-open.png`});
  await card.locator('.step-working-btn').click();assert(await card.locator('.walkthrough-prediction').isVisible());
 }
 assert.deepEqual(errors,[]);
 await browser.close();fs.writeFileSync(folder+'/browser-walkthrough-copy.json',JSON.stringify({checks,optional,screenshots:6,errors},null,2));
 console.log(`Walkthrough copy browser checks passed: ${checks.length} subject/level journeys; 6 screenshots.`);
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
