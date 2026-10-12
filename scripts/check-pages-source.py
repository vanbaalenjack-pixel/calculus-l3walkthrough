#!/usr/bin/env python3
"""Fail closed if the release workflow is not the configured Pages source."""
import json
import os
from urllib.request import Request, urlopen

repo = os.environ['GITHUB_REPOSITORY']
request = Request(f'https://api.github.com/repos/{repo}/pages', headers={
    'Authorization': 'Bearer ' + os.environ['GITHUB_TOKEN'],
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
})
with urlopen(request, timeout=30) as response:
    state = json.load(response)
if state.get('build_type') != 'workflow':
    raise SystemExit('Release blocked: Pages is still configured to publish a branch. '
                     'The owner must select GitHub Actions as the Pages source before '
                     'this workflow can publish its verified _site artifact.')
print('Pages source verified: GitHub Actions; publication uses _site only.')
