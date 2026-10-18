/* Real controls and disposable storage; this file is excluded from publication. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const folder=process.env.CALC_REVIEW_DIR||path.resolve(__dirname,'../.review/2026-10-12');
const checks=[],errors=[],requests=[];
let browser;
(async()=>{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const p=await context.newPage(); p.setDefaultTimeout(10000);
 p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>requests.push(r.url()));
 p.on('response',r=>{if(r.status()>=400)requests.push(r.status()+' '+r.url());});
 await p.goto(origin+'3b2023.html',{waitUntil:'networkidle'});
 const dates=await p.evaluate(()=>({authored:window.CALC_NZ_PAGE_RECORD.question.updatedDate,
   rendered:JSON.parse(document.querySelector('#seo-structured-data').textContent)['@graph'].find(x=>x['@type']==='LearningResource').dateModified}));
 assert.equal(dates.rendered,dates.authored);assert.equal(dates.authored,'2026-10-18');
 await p.locator('#walkthrough-next-btn').focus();await p.keyboard.press('Enter');
 await p.waitForFunction(()=>document.activeElement===document.querySelector('#walkthrough-step-2 h2'));
 await p.getByRole('button',{name:'Next step: Read the limit as x approaches 6',exact:true}).waitFor();
 assert.equal(await p.locator('#walkthrough-next-btn').getAttribute('aria-label'),'Next step: Read the limit as x approaches 6');
 await p.locator('#walkthrough-step-2 .step-working-btn').click();
 const text=await p.locator('#walkthrough-step-2').innerText();assert(text.includes('horizontal tangent'));assert(text.includes('concave-down shape shown'));assert(text.includes('local maximum alone'));
 await p.locator('#walkthrough-next-btn').click();
 assert.equal(await p.locator('#walkthrough-previous-btn').getAttribute('aria-label'),'Previous step: Find the local maximum');
 await p.locator('#walkthrough-previous-btn').click();
 assert.equal(await p.locator('#walkthrough-next-btn').getAttribute('aria-label'),'Next step: Read the limit as x approaches 6');
 await p.locator('#walkthrough-previous-btn').click();
 const hiddenHeadingName=await p.evaluate(()=>{
   const steps=normaliseProgressiveWalkthroughConfig({guidedSteps:[{title:'Compare \\(x=6\\)'},{title:'Find \\(\\frac{dy}{dx}\\)'},{title:'Differentiate \\(\\sqrt{x}\\)'},{title:'Evaluate at \\(x=\\frac{\\pi}{2}\\)'}]}).guidedSteps;
   return steps.map(s=>s.accessibleTitle);
 });
 assert.deepEqual(hiddenHeadingName,['Compare x equals 6','Find the derivative of y with respect to x','Differentiate square root of x','Evaluate at x equals pi divided by 2']);
 checks.push({name:'Authored mathematical labels and both navigation directions after typesetting',names:hiddenHeadingName,keyboardFocus:true});
 for(const [url,index,prohibited] of [['2c2025.html',1,[-6,-2]],['complex-2023.html?q=1d',2,['z+2']]]){
  await p.goto(origin+url,{waitUntil:'networkidle'});
  for(let i=0;i<index;i++)await p.locator('#walkthrough-next-btn').click();
  const preview=p.locator('.walkthrough-step-card:not(.hidden) .walkthrough-step-preview');
  const tex=await preview.locator('annotation').allTextContents(); const copy=await preview.innerText();
  for(const value of prohibited){assert(!tex.join(' ').includes(String(value)));}
  await p.locator('.walkthrough-step-card:not(.hidden) .step-working-btn').click();
  const working=p.locator('.walkthrough-step-card:not(.hidden) .walkthrough-step-working');assert(await working.isVisible());
  if(url.startsWith('2c'))assert((await working.locator('annotation').allTextContents()).join(' ').includes('x=-6'));
  else assert((await working.locator('annotation').allTextContents()).join(' ').includes('z+2'));
  checks.push({name:'Strategic preview with result retained in working',url,preview:copy});
 }
 for(const url of ['int-2b2019.html','3b2025-l2.html']){
  await p.goto(origin+url,{waitUntil:'networkidle'});
  const labels=await p.locator('[data-seo-related-skills] a').allTextContents();
  const slugs=await p.locator('[data-seo-related-skills] a').evaluateAll(es=>es.map(e=>e.getAttribute('href').replace('skill-','').replace('.html','')));
  const expected=await p.evaluate(slugs=>slugs.map(s=>window.CALC_NZ_SKILL_LABELS[s]),slugs);
  assert.deepEqual(labels,expected);checks.push({name:'Skill label matches authoritative catalogue',url,labels});
 }
 await p.goto(origin+'about.html',{waitUntil:'networkidle'});
 assert.equal(await p.locator('a[href*="github.com/vanbaalenjack-pixel"]').count(),0);
 assert.equal(await p.locator('.page-updated time').getAttribute('datetime'),'2026-10-12');
 await p.goto(origin+'complex-2023.html?q=2e',{waitUntil:'networkidle'});
 await p.locator('.step-working-btn').first().click();
 const first=await p.locator('#walkthrough-step-1').innerText();assert(first.includes('radius'));assert((await p.locator('#walkthrough-step-1 annotation').allTextContents()).some(s=>s==='\\sqrt{3}'));
 const ico=await context.request.get(origin+'favicon.ico');assert.equal(ico.status(),200);
 await p.goto(origin+'favicon.ico',{waitUntil:'networkidle'});
 const icon=p.locator('img');await icon.waitFor();assert.deepEqual(await icon.evaluate(e=>({w:e.naturalWidth,h:e.naturalHeight})),{w:48,h:48});
 await p.screenshot({path:folder+'/screenshots/favicon-browser.png'});
 checks.push({name:'Correct circle radius in preview and working; browser decodes icon',decodedIcon:'48×48'});
 // Rehearsal: home -> skill -> question -> hint -> working -> final -> related -> saved retry.
 await p.goto(origin,{waitUntil:'networkidle'});await p.locator('.home-browse-links a[href="skills.html"]').click();
 await p.locator('a[href="skill-complex-loci-modulus.html"]').first().click();
 const group=p.locator('details[data-skill-group]').filter({has:p.locator('a[href="complex-2023.html?q=2e"]')});
 if(!(await group.evaluate(e=>e.open))) await group.locator('summary').first().click();
 await p.locator('a[href="complex-2023.html?q=2e"]').first().click();
 await p.locator('.walkthrough-tip-toggle').first().click();
 const count=await p.locator('.walkthrough-step-card').count();
 for(let i=0;i<count;i++){await p.locator('.walkthrough-step-card:not(.hidden) .step-working-btn').click();await p.locator('#walkthrough-next-btn').click();}
 assert.equal(await p.locator('#walkthrough-next-btn').getAttribute('aria-label'),'Walkthrough reviewed');
 const related=await p.locator('[data-related-practice] a').getAttribute('href');assert(related);
 await p.locator('#bookmark-question-btn').click();await p.locator('#retry-question-btn').click();
 await p.locator('[data-related-practice] a').click();
 assert.equal(await p.locator('.step-working-btn[aria-expanded="true"]').count(),0);
 await p.goto(origin+'complex-2023.html?q=2e',{waitUntil:'networkidle'});
 assert.equal(await p.locator('#bookmark-question-btn').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#retry-question-btn').getAttribute('aria-pressed'),'true');
 const progress=await p.evaluate(()=>JSON.parse(localStorage.getItem('calc.nz.walkthroughProgress')));
 assert(!JSON.stringify(progress).includes('solved-independently'));
 checks.push({name:'Complete rehearsal and saved retry; related question starts independently',steps:count,related});
 for(const width of [320,390,768,1440]){
  await p.setViewportSize({width,height:900});
  for(const url of ['','3b2023.html','complex-2023.html?q=2e','2c2025.html','alg-1b2025-l2.html','int-2b2019.html']){
   await p.goto(origin+url,{waitUntil:'networkidle'});
   if(url==='3b2023.html'){await p.locator('#walkthrough-next-btn').click();await p.locator('#walkthrough-step-2 .step-working-btn').click();}
   if(url==='complex-2023.html?q=2e'){await p.locator('.authored-support summary').click();await p.locator('.step-working-btn').first().click();}
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),url+' overflow at '+width);
   assert.equal(await p.locator('.katex-error').count(),0);
   await p.screenshot({path:folder+'/screenshots/presentation-'+width+'-'+(url||'home').replace(/[^a-z0-9]/gi,'_')+'.png',fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 await browser.close();fs.writeFileSync(folder+'/browser-presentation.json',JSON.stringify({checks,errors,requests,layouts:24},null,2));console.log(JSON.stringify({checks:checks.length,layouts:24,errors,requests}));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
