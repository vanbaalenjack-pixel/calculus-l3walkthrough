/* Query-aware initial HTML plus enhanced identity and disposable saved-state migration. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8005/';
const folder=process.env.CALC_REVIEW_DIR||'.review/2026-10-12-final';
const records=JSON.parse(fs.readFileSync(folder+'/complex-response-preview/responses.json'));
const checks=[],errors=[],failed=[];let browser;
(async()=>{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'});const p=await context.newPage();p.setDefaultTimeout(10000);
 p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('response',r=>{if(r.status()>=400)failed.push(r.status()+' '+r.url());});
 const verify=async(record,suffix='?q='+record.partId)=>{
  const response=await p.goto(origin+'complex-'+record.paperId.slice(-4)+'.html'+suffix,{waitUntil:'load'});
  const raw=await response.text();assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),record.sha256);
  await p.waitForFunction(()=>window.__walkthroughCurrentContext&&document.querySelector('#walkthrough-next-btn'));
  const state=await p.evaluate(()=>({part:window.__walkthroughCurrentContext.partId,paper:window.__walkthroughCurrentContext.paper.id,
    canonical:document.querySelector('link[rel=canonical]').href,title:document.title,h1:document.querySelector('h1').textContent.trim(),
    mathErrors:document.querySelectorAll('.katex-error').length,overflow:document.documentElement.scrollWidth>innerWidth+2}));
  assert.equal(state.part,record.partId);assert.equal(state.paper,record.paperId);assert.equal(state.canonical,record.url);
  assert.equal(state.title,record.title);assert.equal(state.h1,record.heading);assert.equal(state.mathErrors,0);assert(!state.overflow);
  checks.push({request:p.url(),part:state.part,initialAndEnhancedAgree:true});
 };
 for(const record of records)await verify(record);
 for(const year of Array.from({length:8},(_,i)=>String(2017+i))){
  const first=records.find(r=>r.paperId.endsWith(year)&&r.partId==='1a');
  const second=records.find(r=>r.paperId.endsWith(year)&&r.partId==='1b');
  for(const q of ['', '?q=invalid&q=1b','?q=&q=1b','?q=%00','?q=__proto__','?q=constructor','?q=1b%20'])await verify(first,q);
  for(const q of ['?%71=%31%62&tag=a%2Bb&tag=','?q=1B&q=3d','?q=1b&mode=guided'])await verify(second,q);
 }
 // Create saved state through the old static response, then switch its delivery
 // at the same origin. No storage migration or key changes should be required.
 const record=records.find(r=>r.paperId==='level-3-complex-2024'&&r.partId==='1b');
 await context.route('**/complex-2024.html*',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync(path.resolve('_site/complex-2024.html'),'utf8')}));
 await p.goto(origin+'complex-2024.html?q=1b',{waitUntil:'networkidle'});
 await p.locator('#bookmark-question-btn').click();await p.locator('#retry-question-btn').click();await p.locator('.step-working-btn').first().click();
 await p.locator('.attempt-record summary').click();await p.locator('input[value="solved-with-hint"]').check();
 const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('calc.nz.walkthroughProgress'))['level-3-complex-2024:1b']);
 await context.unroute('**/complex-2024.html*');await verify(record,'?q=1B&tag=preserved');
 assert.equal(await p.locator('#bookmark-question-btn').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#retry-question-btn').getAttribute('aria-pressed'),'true');
 assert(await p.locator('input[value="solved-with-hint"]').isChecked());
 const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('calc.nz.walkthroughProgress'))['level-3-complex-2024:1b']);
 assert.equal(after.assessment,before.assessment);assert.equal(after.reviewed,before.reviewed);assert.notEqual(after.assessment,'solved-independently');
 await p.goto(origin,{waitUntil:'networkidle'});await p.locator('.home-continue-button').waitFor();assert.equal(await p.locator('.home-continue-button').getAttribute('href'),'complex-2024.html?q=1b');
 await p.locator('[data-library-view="bookmarks"]').click();assert(await p.locator('#home-library-results a[href="complex-2024.html?q=1b"]').count());
 const nojs=await browser.newContext({javaScriptEnabled:false});const n=await nojs.newPage();await n.goto(origin+'complex-2024.html?q=1b',{waitUntil:'load'});assert.equal(await n.locator('h1').innerText(),record.heading);assert.equal(await n.locator('link[rel=canonical]').getAttribute('href'),record.url);assert((await n.locator('#question-card').innerText()).length>40);await nojs.close();
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 await browser.close();fs.writeFileSync(folder+'/browser-query-metadata.json',JSON.stringify({checks,errors,failed,savedState:{before,after,restored:true},javaScriptDisabled:true},null,2));console.log(JSON.stringify({initialAndEnhancedChecks:checks.length,errors,failed,savedStateRestored:true,javaScriptDisabled:true}));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
