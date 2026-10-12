/* Pixel-composited contrast checks; preserves decorations and layout. */
const {chromium}=require('playwright'),{PNG}=require('pngjs'),fs=require('fs'),path=require('path'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const folder=process.env.CALC_REVIEW_DIR||'.review/2026-10-12-final';
const luminance=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const results=[],errors=[];let browser;
async function measure(p,summary,name){
 await summary.scrollIntoViewIfNeeded();
 await summary.evaluate(e=>{if(!e.querySelector('[data-contrast-ink]')){const span=document.createElement('span');span.dataset.contrastInk='';const node=[...e.childNodes].find(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());node.replaceWith(span);span.append(node);}});
 const regions=await summary.evaluate(e=>{const span=e.querySelector('[data-contrast-ink]'),node=span.firstChild,base=e.getBoundingClientRect(),words=[];for(const m of node.textContent.matchAll(/\S+/g)){const r=document.createRange();r.setStart(node,m.index);r.setEnd(node,m.index+m[0].length);for(const rect of r.getClientRects())words.push({word:m[0],x:rect.x-base.x,y:rect.y-base.y,w:rect.width,h:rect.height});}return words;});
 const ink=PNG.sync.read(await summary.screenshot());
 await summary.locator('[data-contrast-ink]').evaluate(e=>e.style.color='transparent');
 const background=PNG.sync.read(await summary.screenshot());
 await summary.locator('[data-contrast-ink]').evaluate(e=>e.style.color='');
 assert.equal(ink.width,background.width);assert.equal(ink.height,background.height);
 const observations=regions.map(r=>{const pixels=[];for(let y=Math.max(0,Math.floor(r.y));y<Math.min(ink.height,Math.ceil(r.y+r.h));y++)for(let x=Math.max(0,Math.floor(r.x));x<Math.min(ink.width,Math.ceil(r.x+r.w));x++){const i=(y*ink.width+x)*4,a=[...ink.data.slice(i,i+3)],b=[...background.data.slice(i,i+3)];const difference=a.reduce((s,c,k)=>s+Math.abs(c-b[k]),0);if(difference>30)pixels.push({difference,ratio:ratio(a,b),ink:a,background:b});}assert(pixels.length,r.word+' has no measured strokes');const peak=Math.max(...pixels.map(x=>x.difference));const core=pixels.filter(x=>x.difference>=peak*.95);return {word:r.word,solidPixels:core.length,minimum:Math.min(...core.map(x=>x.ratio)),peakDelta:peak};});
 const rect=await summary.boundingBox();await p.screenshot({path:folder+'/screenshots/'+name+'.png',clip:{x:Math.max(0,rect.x-10),y:Math.max(0,rect.y-10),width:rect.width+20,height:rect.height+20}});
 return {minimum:Math.min(...observations.map(x=>x.minimum)),words:observations};
}
(async()=>{
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 for(const width of [320,390,768])for(const baseline of [true,false]){
  if(baseline&&width===768)continue;
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  if(baseline)await context.route('**/style.css*',r=>r.fulfill({contentType:'text/css',body:fs.readFileSync(folder+'/baseline-style.css','utf8')}));
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(origin,{waitUntil:'networkidle'});
  const summary=p.locator('.home-how-details > summary');
  for(const state of baseline?['collapsed']:['collapsed','expanded','hover','focus','expanded-hover','expanded-focus']){
   const expanded=state.startsWith('expanded');await p.locator('.home-how-details').evaluate((e,open)=>e.open=open,expanded);await p.mouse.move(0,0);await summary.evaluate(e=>e.blur());
   if(state.includes('hover'))await summary.hover();
   if(state.includes('focus')){await summary.focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab');assert(await summary.evaluate(e=>e===document.activeElement&&e.matches(':focus-visible')));}
   const observation=await measure(p,summary,`disclosure-${baseline?'baseline':'fixed'}-${width}-${state}`);
   const styles=await summary.evaluate(e=>({before:getComputedStyle(e.closest('aside'),'::before').display,outline:getComputedStyle(e).outline,color:getComputedStyle(e).color,height:e.getBoundingClientRect().height}));
   if(!baseline){assert(observation.minimum>=4.5,JSON.stringify(observation));assert.equal(styles.before,'none');if(state.includes('focus'))assert(styles.outline.includes('solid 3px')&&!styles.outline.includes('rgba'),JSON.stringify(styles));}
   results.push({width,baseline,state,...observation,styles});
  }
  // Expanded explanatory copy is above its own decorations.
  if(!baseline){await p.locator('.home-how-details').evaluate(e=>e.open=true);const z=await p.locator('.home-hero-visual-intro,.home-hero-visual-steps,.home-hero-summary').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),z:getComputedStyle(e).zIndex})));assert(z.every(x=>x.z==='1'));}
  await context.close();
 }
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});const p=await desktop.newPage();await p.goto(origin,{waitUntil:'networkidle'});assert(!(await p.locator('.home-how-details > summary').isVisible()));assert(await p.locator('.home-hero-visual').isVisible());assert.notEqual(await p.locator('.home-hero-aside').evaluate(e=>getComputedStyle(e,'::before').display),'none');await p.screenshot({path:folder+'/screenshots/disclosure-desktop.png',fullPage:true});await desktop.close();
 assert.deepEqual(errors,[]);await browser.close();fs.writeFileSync(folder+'/disclosure-contrast.json',JSON.stringify({method:'Each word: strongest 95% colour-delta stroke pixels against same-pixel background with text ink hidden; all pseudo-elements preserved. No computed-colour contrast inference.',results,errors},null,2));console.log(JSON.stringify(results.map(({words,styles,...r})=>r)));
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
