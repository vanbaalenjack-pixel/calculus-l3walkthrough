#!/usr/bin/env python3
"""Validate prepared raw responses and quantify the legacy static-host limitation."""
from html.parser import HTMLParser
import html
import json
import os
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
REVIEW = Path(os.environ.get('CALC_REVIEW_DIR', ROOT/'.review/2026-10-12'))

class Head(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.meta={}; self.canonical=None; self.title=''; self.in_title=False
        self.feed(source)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag=='meta': self.meta[attrs.get('name',attrs.get('property'))]=attrs.get('content')
        if tag=='link' and attrs.get('rel')=='canonical': self.canonical=attrs.get('href')
        if tag=='title': self.in_title=True
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
    def handle_data(self,text):
        if self.in_title: self.title+=text


def matches(source, record):
    head=Head(source)
    structured=json.loads(re.search(r'<script id="seo-structured-data"[^>]*>(.*?)</script>',source,re.S)[1])
    resource=structured['@graph'][0]
    heading = html.unescape(re.sub(r'<[^>]+>', '', re.search(r'<h1[^>]*>(.*?)</h1>', source, re.S)[1])).strip()
    prompt = record['questionHtml'].strip()
    accessible_prompt = re.sub(r'<div(?=[^>]*\baria-label=)(?![^>]*\brole=)', '<div role="group"', prompt)
    contains_question = any(re.sub(r'\s+', ' ', value) in re.sub(r'\s+', ' ', source)
                            for value in (prompt, accessible_prompt))
    return (heading == record['heading'] and contains_question
        and head.title==record['title'] and head.canonical==record['url']
        and head.meta['description']==record['description']
        and head.meta['og:url']==record['url']
        and head.meta['og:title']==record['title']
        and head.meta['og:description']==record['description']
        and head.meta['twitter:title']==record['title']
        and head.meta['twitter:description']==record['description']
        and resource['url']==record['url'] and resource['name']==record['title']
        and resource['description']==record['description']
        and structured['@graph'][1]['itemListElement'][-1]['item']==record['url'])


def check():
    directory=REVIEW/'complex-response-preview'
    records=json.loads((directory/'responses.json').read_text())
    assert len(records)==len({r['url'] for r in records})==120
    prepared=[]; legacy=[]
    for record in records:
        prepared.append({'url':record['url'],'pass':matches((directory/record['response']).read_text(),record)})
        source=(ROOT/'_site'/urlsplit(record['url']).path.lstrip('/')).read_text()
        legacy.append({'url':record['url'],'correctQuestionInInitialHTML':matches(source,record)})
    assert all(x['pass'] for x in prepared), 'Prepared metadata is inconsistent'
    assert sum(x['correctQuestionInInitialHTML'] for x in legacy)==8
    report={'preparedResponses':prepared,'staticPagesLegacyResponses':legacy,
            'scope':'Raw HTML, before JavaScript: title, descriptions, canonical, sharing metadata and structured identity.',
            'status':'Preparation verified. 112 non-default legacy queries still require a query-aware origin or edge; no production migration activated.'}
    (REVIEW/'initial-metadata.json').write_text(json.dumps(report,indent=2)+'\n')
    print('Prepared raw metadata: 120/120 correct. Current static artifact: 8 default queries correct; 112 legacy queries unresolved.')

if __name__=='__main__': check()
