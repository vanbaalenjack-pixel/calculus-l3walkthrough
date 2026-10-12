#!/usr/bin/env python3
"""Verify the same query-aware handler over HTTP, not a response-file mapping alone."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from urllib.request import Request,urlopen
from urllib.error import HTTPError, URLError
import time
ROOT=Path(__file__).resolve().parents[1]
REVIEW=Path(os.environ.get('CALC_REVIEW_DIR',ROOT/'.review/2026-10-12-final'))
spec=importlib.util.spec_from_file_location('initial_metadata',ROOT/'scripts/check-complex-initial-metadata.py')
meta=importlib.util.module_from_spec(spec);spec.loader.exec_module(meta)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--origin',default='http://127.0.0.1:8005');args=parser.parse_args()
    if urlsplit(args.origin).hostname in ('127.0.0.1', 'localhost'):
        for attempt in range(30):
            try:
                with urlopen(args.origin+'/', timeout=2): pass
                break
            except URLError:
                if attempt == 29: raise
                time.sleep(0.1)
    records=json.loads((REVIEW/'complex-response-preview/responses.json').read_text())
    by_key={(r['paperId'][-4:],r['partId']):r for r in records}
    results=[]
    def read(path,record,headers=None,method='GET'):
        with urlopen(Request(args.origin+path,headers=headers or {},method=method),timeout=20) as response:
            source=response.read().decode()
            assert response.status==200
            assert response.headers.get('ETag')=='"'+record['sha256']+'"'
            assert response.headers.get('Cache-Control')=='no-store'
            if method!='HEAD':
                assert hashlib.sha256(source.encode()).hexdigest()==record['sha256']
                assert meta.matches(source,record),path
            else:assert not source
        results.append({'request':path,'expected':record['url'],'pass':True,'method':method})
    for record in records:
        year=record['paperId'][-4:];part=record['partId'];path=f'/complex-{year}.html'
        other=by_key[(year,'1a' if part!='1a' else '3e')]
        # Populate the asset cache with another question, then present its ETag.
        read(path+'?q='+other['partId'],other)
        read(path+'?q='+part,record,{'If-None-Match':'"'+other['sha256']+'"'})
        read(path+'?q='+other['partId'],other)
        read(path+'?q='+part+'&mode=guided&tag=a%2Bb&tag=&name=M%C4%81ori',record)
        read(path+'?q='+''.join('%'+format(ord(c),'02X') for c in part),record)
        read(path+'?%71='+part.upper()+'&q=3d',record)
        read(path+'?q='+part+'&q=invalid',record)
    for year in map(str,range(2017,2025)):
        default=by_key[(year,'1a')];path=f'/complex-{year}.html'
        for suffix in ['', '?q=', '?q=invalid', '?q=__proto__', '?q=constructor', '?q=4a', '?q=%00', '?q=%ZZ', '?Q=1b', '?q=1b%20', '?q=invalid&q=1b', '?q=&q=1b', '?q=%26q%3D1b']:
            read(path+suffix,default)
        read(path+'?q=1b',by_key[(year,'1b')],method='HEAD')
    private=['/__questions/'+records[0]['response'],'/worker.mjs','/serve.mjs','/release.mjs','/wrangler.json','/response-manifest.json',
             '/scripts/test-query-http.py','/READINESS_FIXES_2026-10-02.md','/READINESS_FIXES_2026-10-02.html','/HOSTING_MIGRATION.md','/HOSTING_MIGRATION.html']
    for path in private:
        try:
            with urlopen(args.origin+path,timeout=20) as response:status=response.status
        except HTTPError as e:status=e.code
        assert status==404,(path,status)
    report={'origin':args.origin,'uniqueQuestionIdentities':120,'requests':results,'privatePaths404':private,
            'scope':'HTTP initial title/descriptions/canonical/sharing/structured identity/H1/full question content; alternate/cache/extra/default/encoded/repeated queries and HEAD.'}
    (REVIEW/'query-http.json').write_text(json.dumps(report,indent=2)+'\n')
    print(f'Query-aware HTTP: {len(results)} requests passed for 120 identities; {len(private)} private paths return 404.')
if __name__=='__main__':main()
