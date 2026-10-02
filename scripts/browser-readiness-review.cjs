/* Disposable Chromium lab measurements; run after build-public.py. */
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const fs=require('fs'),assert=require('assert');
const origin=process.env.CALC_PREVIEW||'http://127.0.0.1:8004/';
const baseline=process.argv.includes('--baseline');
const savedOnly=process.argv.includes('--saved-only');
const folder='.review/2026-10-02';fs.mkdirSync(folder,{recursive:true});
const lum=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const measurements=[],contrast=[];
 for(const width of baseline?[390]:[320,390,768,1440])for(const saved of baseline?[false]:savedOnly?[true]:[false,true]){
  const context=await browser.newContext({viewport:{width,height:844}});
  await context.addInitScript(saved=>{
   window.shifts=[];new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.shifts.push({value:e.value,time:e.startTime,sources:e.sources.map(s=>({node:s.node?.id||s.node?.className,from:s.previousRect.toJSON(),to:s.currentRect.toJSON()}))});}).observe({type:'layout-shift',buffered:true});
   if(saved){localStorage.setItem('calc.nz.practiceSet', JSON.stringify({minutes:10,scope:'level:level-3',questions:[{paperId:'level-3-complex-2025',partId:'2e'},{paperId:'level-3-differentiation-2025',partId:'3e'},{paperId:'level-3-integration-2025',partId:'1e'}]}));localStorage.setItem('calc.nz.lastWalkthrough',JSON.stringify({paperId:'level-3-complex-2025',partId:'2e',href:'complex-2e2025.html'}));}
  },saved);
  const p=await context.newPage();const cdp=await context.newCDPSession(p);
  await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  for(let run=0;run<(baseline?3:4);run++){
   const cold=run<3;await cdp.send('Network.setCacheDisabled',{cacheDisabled:cold});if(cold)await cdp.send('Network.clearBrowserCache');
   if(!cold){await p.goto(origin,{waitUntil:'networkidle'});await p.waitForTimeout(1300);}
   await p.goto(origin,{waitUntil:'networkidle'});await p.waitForTimeout(1300);
   if(saved){assert.equal(await p.locator('.home-practice-set-link').count(),3);assert.equal(await p.locator('.home-continue-button').getAttribute('href'),'complex-2e2025.html');}
   const data=await p.evaluate(()=>({shifts:window.shifts,overflow:document.documentElement.scrollWidth>innerWidth+2}));
   // CLS uses the largest session window (one-second gaps, maximum five seconds).
   let cls=0,total=0,start=0,last=-Infinity;for(const e of data.shifts){if(e.time-last>1000||e.time-start>5000){total=0;start=e.time;}total+=e.value;cls=Math.max(cls,total);last=e.time;}
   measurements.push({width,saved,cache:cold?'cold':'warm',run,cls,...data});
   console.log(`CLS ${width}px ${saved?'saved':'fresh'} ${cold?'cold':'warm'} #${run}: ${cls}`);
   if(!baseline){assert(cls<=.1,JSON.stringify(measurements.at(-1)));assert(!data.overflow);}
  }
  if(width===390&&!saved){
   const button=p.locator('.home-cta');
   for(const state of ['normal','hover','focus']){
    await p.mouse.move(0,0);await button.evaluate(e=>e.blur());if(state==='hover')await button.hover();if(state==='focus')await button.focus();await p.waitForTimeout(350);
    const styles=await button.evaluate(e=>{const s=getComputedStyle(e),b=getComputedStyle(e,'::before');return {background:s.backgroundImage,color:s.color,fontSize:s.fontSize,highlight:b.backgroundImage,outline:s.outline,minHeight:s.minHeight};});
    // Suppress ink only: retain the button background, highlight and geometry.
    await button.evaluate(e=>{for(const s of e.children)s.style.visibility='hidden';});
    const png=PNG.sync.read(await button.screenshot());await button.evaluate(e=>{for(const s of e.children)s.style.visibility='';});
    let worst=Infinity,labelWorst=Infinity;
    for(let y=4;y<png.height-4;y++)for(let x=24;x<png.width-24;x++){const i=(y*png.width+x)*4;const ratio=1.05/(lum([...png.data.slice(i,i+3)])+.05);worst=Math.min(worst,ratio);if(y>png.height*.3&&y<png.height*.7)labelWorst=Math.min(labelWorst,ratio);}
    contrast.push({state,...styles,worst,labelWorst});if(!baseline)assert(worst>=4.5,JSON.stringify(contrast.at(-1)));
   }
  }
  await context.close();
 }
 await browser.close();const report={conditions:'Chromium, 150ms latency, 1.6Mbps down, 0.75Mbps up, 4x CPU, 844px height; lab CLS session windows',measurements,contrast};fs.writeFileSync(folder+'/'+(baseline?'baseline':savedOnly?'readiness-saved':'readiness')+'.json',JSON.stringify(report,null,2));console.log(JSON.stringify({measurements:measurements.map(({shifts,...r})=>r),contrast},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
