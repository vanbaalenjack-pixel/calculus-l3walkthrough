/* Internal review export. Not part of the public artifact. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),catalogue=JSON.parse(fs.readFileSync(path.join(root,'question-catalogue.js'),'utf8').split(/=([\s\S]*)/)[1].trim().replace(/;$/,''));
const data={},audit=fs.readFileSync(path.join(root,'walkthrough-audit-data.js'),'utf8');
for(const file of fs.readdirSync(root).filter(f=>/-data\.js$/.test(f)&&f!=='walkthrough-audit-data.js')){const context={window:{},console};vm.createContext(context);vm.runInContext(audit,context);vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);const found=Object.entries(context.window).find(([k])=>k.endsWith('Walkthroughs'));if(found)data[file]=found[1];}
const result=[];
for(const level of catalogue.levels)for(const standard of level.standards)for(const paper of standard.papers)for(const q of paper.questions){const html=fs.readFileSync(path.join(root,q.href.split('?')[0]),'utf8');const src=[...html.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(m=>m[1].split('?')[0]).find(s=>data[s]);let config;
 if(src)config=data[src][q.id];else{const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];const script=scripts.map(m=>m[1]).find(s=>s.includes('initializeProgressiveWalkthrough({'));if(!script)throw Error('No config: '+q.href);const context={window:{},document:{addEventListener:(_,fn)=>fn()},initializeProgressiveWalkthrough:c=>config=c};context.window.initializeProgressiveWalkthrough=context.initializeProgressiveWalkthrough;vm.runInNewContext(script,context);}
 if(!config)throw Error('Missing '+q.href);result.push({href:q.href,id:q.id,label:q.label,standard:standard.code,year:paper.year,source:src||q.href,config});}
const output=path.join(root,'.review/2026-09-24/content-export.json');fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log('Exported '+result.length+' author configurations to '+output);
