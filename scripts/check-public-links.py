#!/usr/bin/env python3
"""Check real HTML links and static fragment destinations in the exact artifact."""
from html.parser import HTMLParser
import json
import os
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'_site'; REVIEW=Path(os.environ.get('CALC_REVIEW_DIR',ROOT/'.review/2026-10-12'))
class Page(HTMLParser):
    def __init__(self,source):
        super().__init__(); self.ids=set(); self.links=[];self.feed(source)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])

def check():
    pages={p.relative_to(OUTPUT).as_posix():Page(p.read_text()) for p in OUTPUT.rglob('*.html')}
    failures=[]; targets=set();fragments=set()
    for name,page in pages.items():
        for link in page.links:
            url=urlsplit(urljoin('https://calc.nz/'+name,link))
            if url.netloc!='calc.nz' or url.scheme not in ['http','https']:continue
            target=unquote(url.path).lstrip('/') or 'index.html'
            targets.add(target+('?' + url.query if url.query else ''))
            if not (OUTPUT/target).is_file():failures.append({'page':name,'link':link,'reason':'missing target'})
            elif url.fragment:
                fragments.add((target,unquote(url.fragment)))
                if target in pages and unquote(url.fragment) not in pages[target].ids:
                    failures.append({'page':name,'link':link,'reason':'missing static fragment'})
    report={'htmlFiles':len(pages),'uniqueInternalTargets':len(targets),'staticFragments':len(fragments),'failures':failures}
    (REVIEW/'public-links.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report if failures else {k:v for k,v in report.items() if k!='failures'}))
    if failures:raise SystemExit(1)
if __name__=='__main__':check()
