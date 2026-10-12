#!/usr/bin/env python3
"""Prepare query-aware HTML responses outside the publication artifact.

This does not activate routing or change catalogue links or saved identities.
A future query-aware origin/edge can select these responses at existing URLs.
"""
import importlib.util
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('calc_seo', ROOT / 'scripts/build-seo.py')
seo = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = seo
spec.loader.exec_module(seo)


def prepare():
    directory = Path(os.environ.get('CALC_REVIEW_DIR', ROOT / '.review/2026-10-12')) / 'complex-response-preview'
    if directory.resolve().is_relative_to((ROOT / '_site').resolve()):
        raise ValueError('Metadata preparation must remain outside the public artifact')
    directory.mkdir(parents=True, exist_ok=True)
    routes = seo.discover_routes(seo.load_catalogue())
    selected = [r for r in routes if r.standard_key == 'level-3-complex' and 2017 <= r.year <= 2024]
    content = seo.load_walkthrough_content()
    records = []
    for route in selected:
        siblings = [r for r in selected if r.year == route.year]
        response = seo.update_question_page((ROOT / route.source_file).read_text(), route, siblings,
                                            content[route.route_path], seo.load_guides())
        filename = f'complex-{route.year}-{route.question_id}.html'
        (directory / filename).write_text(response)
        records.append({'url': route.canonical, 'response': filename,
                        'paperId': f'level-3-complex-{route.year}', 'partId': route.question_id,
                        'title': seo.question_browser_title(route),
                        'description': seo.question_description(route)})
    assert len(records) == len({r['url'] for r in records}) == 120
    (directory / 'responses.json').write_text(json.dumps(records, indent=2) + '\n')
    print(f'Prepared 120 question-specific initial responses in {directory}; routing remains inactive.')
    return records


if __name__ == '__main__':
    prepare()
