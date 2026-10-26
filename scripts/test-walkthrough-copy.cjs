/* Focused content-model regressions. No browser or third-party packages needed. */
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert');
const os=require('os'), cp=require('child_process');
const root=path.resolve(__dirname,'..');
const document={body:null,readyState:'loading',addEventListener(){},querySelector(){return null;},
  createElement(){return {set innerHTML(v){this.textContent=v.replace(/<[^>]*>/g,'');}};}};
const ctx={window:{},document,URL,URLSearchParams,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'walkthrough-gate.js'),'utf8'),ctx);
const retired='Retired response feedback must stay out of instructional content';
const old={title:'Differentiate',successMessage:retired,correctFeedback:retired,genericMessage:retired,targetedFeedback:[retired]};
const missing=ctx.normaliseGuidedStep(old,0);
assert.equal(missing.previewHtml,'');assert.equal(missing.workingHtml,'');
const empty=ctx.renderProgressiveStep(missing,0);
for(const s of [retired,'walkthrough-step-preview','walkthrough-step-working','walkthrough-step-actions','undefined','null'])assert(!empty.includes(s),s);
const whitespace=ctx.renderProgressiveStep(ctx.normaliseGuidedStep({title:'Check',previewHtml:'  ',workingHtml:'\n '},0),0);
assert(!whitespace.includes('walkthrough-step-preview'));assert(!whitespace.includes('step-working-btn'));
const authored=ctx.normaliseGuidedStep({...old,previewHtml:'Use the chain rule.',workingHtml:'<p>Multiply the derivatives.</p>'},0);
assert.equal(authored.previewHtml,'Use the chain rule.');assert(!ctx.renderProgressiveStep(authored,0).includes(retired));
assert.equal(ctx.normaliseGuidedStep({title:'Plan',previewHtml:'Which rule applies?'},0).predictionPrompt,'');
assert.equal(ctx.normaliseGuidedStep({title:'Plan',predictionPrompt:''},0).predictionPrompt,'');
// Browser behaviour is covered by browser-minimal-ux.cjs; retain mathematical
// content checks here without simulating the retired per-working reveal controls.
const ids={}; document.getElementById=id=>ids[id];
// SVG screen coordinates increase downwards: the path strip must have a
// positive height while the five measured garden ordinates stay unchanged.
vm.runInContext(fs.readFileSync(path.join(root,'walkthrough-audit-data.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'integration-2023-data.js'),'utf8'),ctx);
const garden={};ids['question-graph-3a-int-2023']=garden;
ctx.window.Integration2023Walkthroughs['3a'].afterRender();
const strip=garden.innerHTML.match(/<rect class="graph-soil"[^>]+>/)[0];
assert(Number(strip.match(/height="([^"]+)"/)[1])>0);
for(const n of [10,13,16,15,14])assert(garden.innerHTML.includes(n+' metres'));
// Check every instructional field in both author configurations and a built artifact.
// This terminology guard complements contextual editorial review, not replaces it.
const obsolete=/\b(?:that is exactly right|that is (?:the )?correct (?:match|substitution|distance form)|both sides have been integrated correctly|each coefficient has been simplified correctly|not quite|almost there|accepted answer|we were looking for|you entered|when you type|check your input|press enter to check|(?:enter|type|submit) your answer|use the answer box|you forgot|you made (?:an?|the) (?:error|mistake))\b/i;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'calc-copy-'));
let total=0,steps=0;
try {
  for(const directory of [root,...(fs.existsSync(path.join(root,'_site'))?[path.join(root,'_site')]:[])]){
    cp.execFileSync(process.execPath,[path.join(root,'scripts/export-review-content.cjs')],{env:{...process.env,CALC_CONTENT_ROOT:directory,CALC_REVIEW_DIR:temp}});
    const configs=JSON.parse(fs.readFileSync(path.join(temp,'content-export.json'),'utf8'));
    for(const q of configs){
      assert(!obsolete.test(JSON.stringify(q.config)),q.href+' has obsolete response feedback');
      for(const s of q.config.guidedSteps){
        assert(s.workingHtml.trim(),q.href+' has empty authored working');
        assert(!/Reveal the explanation and working for this step/.test(s.previewHtml),q.href+' has a placeholder preview');
      }
    }
    total+=configs.length;steps+=configs.reduce((n,q)=>n+q.config.guidedSteps.length,0);
    const example=configs.find(q=>q.href==='1a2024.html').config.guidedSteps[2];
    assert(example.previewHtml.includes('chain rule'));
    for(const math of [String.raw`\frac{1}{2}(4-9x^4)^{-1/2}(-36x^3)`,String.raw`-\frac{18x^3}{\sqrt{4-9x^4}}`,String.raw`4-9x^4&gt;0`])assert(example.workingHtml.includes(math),math);
  }
} finally {fs.rmSync(temp,{recursive:true,force:true});}
// Independently check equivalence and the chain-rule value inside the real domain.
for(const x of [-.7,-.2,0,.3,.7]){
  const u=4-9*x**4,h=1e-6;
  const negativePower=-18*x**3*u**(-.5),denominator=-18*x**3/Math.sqrt(u);
  const difference=(Math.sqrt(4-9*(x+h)**4)-Math.sqrt(4-9*(x-h)**4))/(2*h);
  assert(u>0);assert(Math.abs(negativePower-denominator)<1e-12);assert(Math.abs(difference-denominator)<1e-6);
}
console.log(`Walkthrough copy/model checks passed: ${total} configurations, ${steps} authored steps across source/artifact.`);
