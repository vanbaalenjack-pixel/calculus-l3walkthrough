/* URL context validation and order regression checks, no browser dependencies. */
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const raw=fs.readFileSync('question-catalogue.js','utf8');
const catalogue=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));
const location=new URL('https://calc.nz/1a2025.html');
const ctx={window:{CALC_NZ_QUESTION_CATALOGUE:catalogue},location,URL,URLSearchParams,btoa,atob,escape,unescape,encodeURIComponent,decodeURIComponent,document:{addEventListener(){}},addEventListener(){},history:{state:null},requestAnimationFrame(){}};
vm.runInNewContext(fs.readFileSync('practice-context.js','utf8'),ctx);
const api=ctx.window.CalcNzPractice;
(async()=>{
 for(const value of [null,'','invalid!', 'x'.repeat(12001),api.encode({kind:'unknown'}),api.encode({kind:'skill',slug:'../../bad'}),api.encode({kind:'set',keys:[]}),api.encode({kind:'set',keys:['untrusted']})])assert.equal(api.decode(value),null);
 const keys=['level-3-differentiation-2025:1a','level-3-integration-2024:3e','level-3-complex-2025:2a'];
 const token=api.encode({kind:'set',keys});
 const sequence=await api.resolve(token,keys[1]);assert.deepEqual(Array.from(sequence.entries,e=>e.key),keys);
 assert.equal(await api.resolve(token,'level-3-complex-2025:1a'),null);
 assert.equal(await api.resolve(api.encode({kind:'set',keys:[keys[0],keys[0]]}),keys[0]),null);
 assert.equal(await api.resolve(api.encode({kind:'set',keys:['level-3-differentiation-2099:1a']}),'level-3-differentiation-2099:1a'),null);
 assert.equal(await api.resolve(api.encode({kind:'search',keys,return:'https://external.example/search.html'}),keys[0]),null);
 const skill=await api.resolve(api.encode({kind:'skill',slug:'chain-rule',at:1000}),keys[0]);assert(skill.entries.length>10);assert(skill.entries.every(e=>e.question.skillSlugs.includes('chain-rule')));assert.equal(skill.returnHref,'/skill-chain-rule.html?at=1000');
 assert.equal(await api.resolve(api.encode({kind:'skill',slug:'not-a-skill'}),keys[0]),null);
 const href=api.withContext('complex-2017.html?q=3c',token);const url=new URL(href,location);assert.equal(url.pathname,'/complex-2017.html');assert.equal(url.searchParams.get('q'),'3c');assert.equal(url.searchParams.get('practice'),token);
 assert.equal(api.withContext('https://external.example/',token),'https://external.example/');
 const search=await api.resolve(api.encode({kind:'search',keys,return:'/search.html?q=chain+rule&year=2025',at:850}),keys[0]);assert.equal(new URL(search.returnHref,location).searchParams.get('year'),'2025');assert.equal(new URL(search.returnHref,location).searchParams.get('at'),'850');
 console.log('Practice context checks passed: validation, membership, immutable set order, skill mapping, return state, legacy query URLs, and external-URL rejection.');
})().catch(e=>{console.error(e);process.exit(1);});
