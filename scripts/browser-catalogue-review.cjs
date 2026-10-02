/* Inventory-driven rendering tests. Run with Playwright available in NODE_PATH. */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const origin = process.env.CALC_PREVIEW || 'http://127.0.0.1:8004/';
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'question-catalogue.js'), 'utf8').split(/=([\s\S]*)/)[1].trim().replace(/;$/, ''));
const inventory = catalogue.levels.flatMap(l => l.standards.flatMap(s => s.papers.flatMap(p => p.questions.map(q => ({...q, year:p.year, standard:s.id, paper:p.id})))));
const runtime = fs.readFileSync(path.join(root, '_site/walkthrough-gate.js'), 'utf8') + `
const __reviewInitialize = initializeProgressiveWalkthrough;
initializeProgressiveWalkthrough = function(config) {
  __reviewInitialize(config);
  window.__reviewConfig = normaliseProgressiveWalkthroughConfig(protectWalkthroughMath(applyWalkthroughAuditRemediation(config)));
};`;
const report = [];

async function inspect(page, record) {
  const errors = [], failedRequests = [];
  const onError = e => errors.push(e.message);
  const onResponse = r => { if(r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); };
  const onFailed = r => failedRequests.push(r.url() + ' ' + JSON.stringify(r.failure()));
  page.on('requestfailed', onFailed);
  page.on('pageerror', onError); page.on('response', onResponse);
  try {
    await page.goto(origin + record.href, {waitUntil:'load'});
    await page.waitForFunction(() => window.__reviewConfig && document.querySelector('#question-card'));
    // Use the real reveal handlers. Other states remain in the DOM for mathematical comparisons.
    await page.evaluate(() => {
      const exam = document.querySelector('#exam-mode-setting');
      if (exam && exam.checked) exam.click();
      document.querySelectorAll('.walkthrough-tip-toggle').forEach(b => b.click());
      const count = document.querySelectorAll('.walkthrough-step-card').length;
      for (let i=0; i<count; i++) {
        const current = document.querySelector('.walkthrough-step-card:not(.hidden)');
        if (!current) throw new Error('No visible step at ' + i);
        current.querySelector('.step-working-btn').click();
        const panel=current.querySelector('.walkthrough-step-working');
        if(panel.getAttribute('aria-hidden') !== 'false' || !panel.textContent.trim()) throw new Error('Working did not reveal at ' + i);
        document.querySelector('#walkthrough-next-btn').click();
      }
    });
    const result = await page.evaluate(() => {
      const scope = document.querySelector('main');
      const config = window.__reviewConfig;
      const source = [config.questionHtml, ...config.tips.map(t=>t.html), ...config.guidedSteps.flatMap(s=>[s.title,s.previewHtml,s.workingHtml])].join('\n');
      const normal = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/\s/g,'');
      const expected = [...source.matchAll(/\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g)].map(m=>normal(m[1]||m[2]||m[3]));
      const actual = [...scope.querySelectorAll('annotation[encoding="application/x-tex"]')].map(e=>normal(e.textContent));
      const counts = new Map(); actual.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
      const missing=[]; expected.forEach(v=>{const n=counts.get(v)||0; if(!n)missing.push(v);else counts.set(v,n-1);});
      const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT), raw=[];
      while(walker.nextNode()) {const n=walker.currentNode;if(!n.parentElement.closest('script,style,noscript,.katex') && /\\(?:frac|sqrt|operatorname|boxed|overline|left|right|mathbb|quad|begin|end|\(|\)|\[|\])/.test(n.textContent))raw.push(n.textContent.trim().slice(0,180));}
      const valid = new Set('a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script search section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr'.split(' '));
      const malformed=[...scope.querySelectorAll('*')].filter(e=>e.namespaceURI==='http://www.w3.org/1999/xhtml'&&!valid.has(e.localName)).map(e=>e.outerHTML.slice(0,200));
      const brokenImages=[...scope.querySelectorAll('img')].filter(i=>i.loading!=='lazy'&&(!i.complete||!i.naturalWidth)).map(i=>i.src);
      const mathErrors=[...scope.querySelectorAll('.katex-error')].map(e=>e.textContent);
      const links=[...scope.querySelectorAll('a[href]')].map(e=>e.getAttribute('href'));
      return {title:document.title,canonical:document.querySelector('link[rel=canonical]').href,h1:document.querySelector('h1').textContent,overflow:document.documentElement.scrollWidth>innerWidth+2,steps:config.guidedSteps.length,hints:config.tips.length,expectedMath:expected.length,actualMath:actual.length,missing,raw,malformed,brokenImages,mathErrors,links,questionText:document.querySelector('#question-card').textContent};
    });
    assert(!result.overflow, "Page-wide horizontal overflow");
    assert.equal(result.canonical, record.canonical);
    assert(result.h1.includes('Q'+record.label.replace('Question ','')), 'wrong question label');
    for(const link of result.links){const url=new URL(link,origin);if(url.origin===new URL(origin).origin){const f=path.join(root,'_site',decodeURIComponent(url.pathname)==='/'?'index.html':decodeURIComponent(url.pathname));assert(fs.existsSync(f),'missing local link '+link);}}
    const issues = ['missing','raw','malformed','brokenImages','mathErrors'].flatMap(k=>result[k].map(v=>({kind:k,value:v})));
    report.push({href:record.href,steps:result.steps,hints:result.hints,expectedMath:result.expectedMath,actualMath:result.actualMath,issues,errors,failedRequests});
  } catch(error) { report.push({href:record.href,error:String(error),errors,failedRequests}); }
  finally { page.off('pageerror',onError);page.off('response',onResponse);page.off('requestfailed',onFailed); }
}

(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  let next=0, done=0;
  const selected=process.env.CALC_ROUTES ? inventory.filter(q=>process.env.CALC_ROUTES.split(',').includes(q.href)) : inventory;
  await Promise.all(Array.from({length:4},async()=>{
    const context=await browser.newContext({viewport:{width:Number(process.env.CALC_WIDTH)||390,height:900},reducedMotion:'reduce'});
    await context.addInitScript(()=>{localStorage.setItem('calc.nz.examMode','false');});
    await context.route('**/walkthrough-gate.js*', route=>route.fulfill({contentType:'text/javascript',body:runtime}));
    const page=await context.newPage();page.setDefaultTimeout(10000);
    while(next<selected.length){const q=selected[next++];await inspect(page,q);done++;if(done%25===0)console.log(`${done}/${selected.length} routes checked`);}
    await context.close();
  }));
  await browser.close();
  report.sort((a,b)=>a.href.localeCompare(b.href));
  fs.mkdirSync(path.join(root,'.review/2026-09-24'),{recursive:true});
  fs.writeFileSync(path.join(root,'.review/2026-09-24/' + (process.env.CALC_ROUTES ? 'browser-catalogue-subset.json' : 'browser-catalogue.json')),JSON.stringify({browser:'Chrome via Playwright',routes:report},null,2));
  const failed=report.filter(r=>r.error||r.errors.length||r.failedRequests.length||r.issues.length);
  console.log(JSON.stringify({checked:report.length,failed:failed.length,examples:failed.slice(0,8)},null,2));
  process.exitCode=failed.length?1:0;
})();
