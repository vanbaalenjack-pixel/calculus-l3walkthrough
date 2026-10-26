/* Behavioural regression coverage for the minimalist workspace. Run against _site. */
const {chromium}=require('playwright');
const fs=require('fs'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const folder=process.env.CALC_REVIEW_DIR||'.review/ux-redesign';
const checks=[],errors=[],requests=[];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const p=await context.newPage();p.setDefaultTimeout(7000);
 p.on('pageerror',e=>errors.push(e.stack));p.on('response',r=>{if(r.status()>=400)requests.push(r.url());});
 for(const [w,h] of [[390,844],[1366,768],[320,700],[768,1024]]){
  await p.setViewportSize({width:w,height:h});
  for(const [name,path] of [['home',''],['question','1a2025.html'],['skills','skills.html'],['skill','skill-chain-rule.html'],['search','search.html?q=chain+rule'],['paper','level-3-complex-numbers-2025.html'],['diagram','complex-2a2025.html'],['long','int-3e2024.html'],['level2','1a2025-l2.html'],['algebra','alg-1a2025-l2.html']]){
   await p.goto(origin+path,{waitUntil:'networkidle'});
   await p.screenshot({path:`${folder}/screenshots/after-${name}-${w}.png`});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`Overflow ${path} at ${w}`);
   assert.equal(await p.locator('.katex-error').count(),0,`KaTeX ${path}`);
   if(name==='question'){
    assert(await p.locator('#walkthrough-content').isHidden());
    const top=await p.locator('#question-card .question-prompt').evaluate(e=>e.getBoundingClientRect().top);assert(top<=200,`Question top ${top}`);
    assert(await p.locator('#walkthrough-part-navigation a[rel="next"]').isVisible());
   }
   if(name==='skill'&&w===390) assert((await p.locator('[data-skill-group] a').first().boundingBox()).y<844);
   if(name==='search') {assert(await p.locator('.search-filter-disclosure').evaluate(e=>!e.open));assert((await p.locator('.home-search-result').first().boundingBox()).y<700);}
  }
  checks.push(`Responsive surfaces at ${w}×${h}`);
 }
 await p.setViewportSize({width:390,height:844});
 await p.goto(origin);await p.locator('[data-standard="level-3-differentiation"]').click();await p.locator('[data-paper="level-3-differentiation-2025"]').click();await p.locator('[data-selection-stage] a.index-link-card[href="1a2025.html"]').click();await p.waitForLoadState('networkidle');
 assert(p.url().endsWith('1a2025.html'));checks.push('Home → subject → year → question in three selections');
 await p.locator('#walkthrough-part-navigation [rel="next"]').click();await p.waitForLoadState('networkidle');assert(p.url().endsWith('1b2025.html'));assert(await p.locator('#walkthrough-content').isHidden());checks.push('Next question available with solution hidden');
 await p.goto(origin+'1a2025.html',{waitUntil:'networkidle'});
 const y=await p.evaluate(()=>scrollY);await p.locator('#question-hint-btn').click();assert.equal(await p.evaluate(()=>scrollY),y);assert(await p.locator('#walkthrough-content').isHidden());assert(await p.locator('#walkthrough-tip-1').isVisible());
 await p.locator('#guided-start-btn').click();assert(await p.locator('#walkthrough-step-1-working').isVisible());assert(await p.locator('#walkthrough-step-2').isHidden());await p.locator('#walkthrough-next-btn').click();assert(await p.locator('#walkthrough-step-2-working').isVisible());checks.push('Hints preserve position and guided working reveals by step');
 await p.locator('#question-solution-btn').click();assert.equal(await p.locator('.walkthrough-step-card.hidden').count(),0);assert.equal(await p.locator('.walkthrough-step-working.hidden').count(),0);assert(await p.locator('.walkthrough-step-navigation').isHidden());checks.push('One action reveals every worked step');
 await p.locator('#recall-question-btn').click();assert(await p.locator('.question-recall-dialog').isVisible());await p.keyboard.press('Escape');assert(await p.locator('#recall-question-btn').evaluate(e=>document.activeElement===e));checks.push('Original-question dialog closes with Escape and restores focus');
 await p.goto(origin+'1a2025.html',{waitUntil:'networkidle'});await p.locator('#walkthrough-sidebar-open-toggle').click();assert(await p.locator('#practice-drawer-questions a').first().isVisible());assert(await p.locator('.change-paper').evaluate(e=>!e.open));await p.keyboard.press('Escape');assert(await p.locator('#walkthrough-sidebar-open-toggle').evaluate(e=>document.activeElement===e));checks.push('Questions-first drawer and keyboard focus restoration');
 await p.goto(origin+'skill-chain-rule.html',{waitUntil:'networkidle'});await p.locator('[data-skill-group] a').first().click();await p.waitForLoadState('networkidle');await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.toLowerCase().includes('chain rule'));
 const token=new URL(p.url()).searchParams.get('practice');for(let i=0;i<3;i++){await p.locator('#walkthrough-part-navigation [rel="next"]').click();await p.waitForLoadState('networkidle');await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.toLowerCase().includes('chain rule'));assert.equal(new URL(p.url()).searchParams.get('practice'),token);}
 await p.reload({waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.toLowerCase().includes('chain rule'));checks.push('Skill sequence survives consecutive questions and refresh');
 await p.goto(origin+'search.html?q=chain+rule&year=2025',{waitUntil:'networkidle'});await p.locator('.home-search-result[href*="practice="]').first().click();await p.waitForLoadState('networkidle');await p.goBack({waitUntil:'networkidle'});assert.equal(await p.locator('#global-search-input').inputValue(),'chain rule');assert.equal(await p.locator('[data-search-filter="year"]').inputValue(),'2025');checks.push('Search query and filters survive question and browser back');
 await p.goto(origin+'1a2025.html?practice=invalid',{waitUntil:'networkidle'});assert((await p.locator('#walkthrough-part-navigation [rel="next"]').getAttribute('href')).includes('1b2025.html'));checks.push('Invalid context falls back to paper');
 await p.locator('.attempt-record summary').click();await p.locator('input[value="solved-independently"]').check();await p.locator('#bookmark-question-btn').click();await p.locator('#retry-question-btn').click();assert(await p.locator('#walkthrough-content').isHidden());await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('#bookmark-question-btn').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#retry-question-btn').getAttribute('aria-pressed'),'true');checks.push('Independent attempt, bookmark and retry persist without revealing solution');
 await p.goto(origin);assert((await p.locator('.home-continue-button').boundingBox()).y<844);checks.push('Returning Continue appears in first viewport');
 await p.evaluate(()=>localStorage.setItem('calc.nz.practiceSet',JSON.stringify({minutes:10,scope:'level:level-3',questions:[{paperId:'level-3-complex-2025',partId:'2a'},{paperId:'level-3-integration-2024',partId:'3e'},{paperId:'level-3-differentiation-2025',partId:'1a'}]})));
 await p.reload({waitUntil:'networkidle'});await p.locator('#resume-practice-set').click();await p.waitForLoadState('networkidle');await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.includes('Practice set'));await p.locator('#walkthrough-part-navigation [rel="next"]').click();await p.waitForLoadState('networkidle');assert(p.url().includes('int-3e2024.html'));await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.includes('2 of 3'));await p.locator('#walkthrough-part-navigation [rel="next"]').click();await p.waitForLoadState('networkidle');await p.waitForFunction(()=>document.querySelector('#practice-context-indicator').textContent.includes('3 of 3'));assert((await p.locator('#walkthrough-part-navigation').innerText()).includes('Finish practice'));checks.push('Existing stored practice set retains exact order and finishes without looping');
 await p.goto(origin+'1a2025.html',{waitUntil:'networkidle'});await p.evaluate(()=>localStorage.setItem('calc.nz.examMode','true'));await p.reload({waitUntil:'networkidle'});assert(await p.locator('#walkthrough-content').isHidden());await p.locator('#question-solution-btn').click();assert.equal(await p.locator('.walkthrough-step-card.hidden').count(),0);assert.equal(await p.evaluate(()=>localStorage.getItem('calc.nz.examMode')),'true');checks.push('Exam preference remains saved after intentional reveal');
 await p.evaluate(()=>document.documentElement.style.fontSize='200%');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await p.screenshot({path:`${folder}/screenshots/text-200-percent.png`});checks.push('200% text enlargement without page overflow');
 await browser.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);fs.writeFileSync(folder+'/browser-results.json',JSON.stringify({checks,errors,requests},null,2));console.log(JSON.stringify({passed:checks.length,checks}));
})().catch(error=>{console.error(error);console.error(JSON.stringify({errors,requests}));process.exit(1);});
