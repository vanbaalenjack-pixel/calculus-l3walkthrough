/* Request/Response behaviour for the packaged production handler, without accounts. */
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const directory=path.resolve(process.env.CALC_REVIEW_DIR||'.review/2026-10-12-final','query-release');
 const {default:worker}=await import(pathToFileURL(path.join(directory,'worker.mjs')));
 const records=JSON.parse(await fs.readFile(path.join(directory,'response-manifest.json')));
 const env={ASSETS:{async fetch(request){try{return new Response(await fs.readFile(path.join(directory,'assets',new URL(request.url).pathname)));}catch{return new Response('',{status:404});}}}};
 let checks=0;
 for(const record of records){
  const request=new Request(record.url+'&q=invalid&tag=a%2Bb',{headers:{'If-None-Match':'"other-question"'}});
  const response=await worker.fetch(request,env);assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(response.headers.get('ETag'),'"'+record.sha256+'"');checks++;
 }
 for(const path of ['/scripts/test-query-http.py','/__questions/complex-2024-1b.html','/HOSTING_MIGRATION.html','/wrangler.json','/release.mjs']){assert.equal((await worker.fetch(new Request('https://calc.nz'+path),env)).status,404);checks++;}
 const staticRequest=new Request('https://calc.nz/style.css');const first=await worker.fetch(staticRequest,env);assert.equal(first.status,200);
 assert.equal((await worker.fetch(new Request(staticRequest,{headers:{'If-None-Match':first.headers.get('ETag')}}),env)).status,304);checks++;
 assert.equal((await worker.fetch(new Request('https://calc.nz/',{method:'POST'}),env)).status,405);checks++;
 console.log(`Packaged routing behaviour: ${checks} checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
