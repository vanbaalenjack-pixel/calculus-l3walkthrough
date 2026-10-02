/* Targeted progressive enhancement, focus, metadata and computed-style checks. */
const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const results=[],errors=[],failed=[];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});const p=await context.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  await p.goto(origin,{waitUntil:'networkidle'});
  if(width===1440)assert(await p.locator('.home-hero-visual').isVisible(),'Desktop explanation must be visible');
  await p.screenshot({path:`.review/2026-10-02/home-${width}.png`,fullPage:true});
  await p.locator('[data-standard="level-3-complex"]').focus();await p.keyboard.press('Enter');
  const headingVisible=async()=>{await p.waitForTimeout(100);const r=await p.locator('#selection-stage-heading').evaluate(e=>({top:e.getBoundingClientRect().top,header:document.querySelector('.site-header').getBoundingClientRect().bottom,focused:e===document.activeElement}));assert(r.focused);assert(r.top>=r.header+7,JSON.stringify(r));};
  await headingVisible();await p.locator('[data-paper="level-3-complex-2025"]').click();await headingVisible();await p.locator('[data-paper-start-specific]').click();await headingVisible();
  await p.goBack();await p.waitForTimeout(100);assert(await p.locator('[data-paper-start-specific]').isVisible());await p.goForward();await p.waitForTimeout(100);
  await p.locator('[data-selection-stage] a[href="complex-2e2025.html"]').click();await p.waitForLoadState('networkidle');
  for(let i=0;i<4;i++){await p.locator('.walkthrough-step-card:not(.hidden) .step-working-btn').click();if(i<3)await p.locator('#walkthrough-next-btn').click();}
  const step=p.locator('.walkthrough-step-card:not(.hidden)');assert((await step.innerText()).includes('common denominator can be cancelled'));assert((await step.locator('annotation').allTextContents()).some(t=>t.includes('\\frac{-5d}{1+d^2}')));
  assert.equal(await p.locator('.katex-error').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  const primary=p.locator('.nav-btn:not(.secondary):not(.index-link-card):visible').filter({hasNot:p.locator('[disabled]')});
  const styles=await primary.evaluateAll(es=>es.filter(e=>!e.disabled).map(e=>({text:e.textContent.trim(),color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundImage,height:e.getBoundingClientRect().height})));
  for(const s of styles){if(s.background.includes('linear-gradient')){assert(s.background.includes('49, 91, 181')||s.background.includes('41, 79, 159'),JSON.stringify(s));assert.equal(s.color,'rgb(255, 255, 255)');}}
  results.push({width,journey:true,keyboardFocus:true,history:true,correctedComplexStep:true,sharedPrimaryStyles:styles});
  await context.close();
  const nojs=await browser.newContext({viewport:{width,height:844},javaScriptEnabled:false});const q=await nojs.newPage();await q.goto(origin,{waitUntil:'networkidle'});
  assert((await q.locator('#catalogue-availability').innerText()).startsWith('420 '));assert.equal(await q.locator('[data-selection-stage] a').count(),3);await q.locator('[data-standard="level-3-integration"]').click();await q.waitForLoadState('networkidle');assert(q.url().includes('level-3-integration.html'));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await nojs.close();
 }
 const c=await browser.newContext({viewport:{width:390,height:844}});await c.addInitScript(()=>{window.shifts=[];new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.shifts.push(e.value);}).observe({type:'layout-shift',buffered:true});for(const key of ['localStorage','sessionStorage'])Object.defineProperty(window,key,{get(){throw new DOMException('Blocked','SecurityError')}});});
 const p=await c.newPage();await p.goto(origin,{waitUntil:'networkidle'});await p.evaluate(()=>window.loadCalcNzHomepageTools());await p.waitForTimeout(500);assert((await p.locator('[data-storage-description]').innerText()).includes('unavailable'));const blockedCLS=await p.evaluate(()=>window.shifts.reduce((a,b)=>a+b,0));assert(blockedCLS<=.1);await p.locator('[data-practice-set="10"]').click();assert.equal(await p.locator('.home-practice-set-link').count(),3);results.push({blockedStorage:true,blockedCLS});
 await c.close();
 const saved=await browser.newContext({viewport:{width:390,height:844}});
 await saved.addInitScript(()=>{
  localStorage.setItem('calc.nz.lastWalkthrough',JSON.stringify({paperId:'level-3-complex-2025',partId:'2e',href:'complex-2e2025.html'}));
  localStorage.setItem('calc.nz.practiceSet',JSON.stringify({minutes:10,scope:'level:level-3',questions:[{paperId:'level-3-complex-2025',partId:'2e'},{paperId:'level-3-differentiation-2025',partId:'3e'},{paperId:'level-3-integration-2025',partId:'1e'}]}));
 });
 const sp=await saved.newPage();await sp.goto(origin,{waitUntil:'networkidle'});await sp.locator('.home-continue-button').waitFor();assert.equal(await sp.locator('.home-continue-button').getAttribute('href'),'complex-2e2025.html');assert.equal(await sp.locator('.home-practice-set-link').count(),3);results.push({savedContinueAndPracticeRestored:true});await saved.close();
 await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);fs.writeFileSync('.review/2026-10-02/interactions.json',JSON.stringify({results,errors,failed},null,2));console.log(JSON.stringify({passed:results.length,errors,failed}));
})().catch(e=>{console.error(e);process.exitCode=1;});
