"""Download official sources to an internal review folder; never a public asset."""
import concurrent.futures
import json
from pathlib import Path
import urllib.request

root = Path(__file__).resolve().parents[1]
folder = root / '.review/2026-09-24/sources'
folder.mkdir(parents=True, exist_ok=True)
catalogue = json.loads((root / 'question-catalogue.js').read_text().split('=', 1)[1].strip().rstrip(';'))
urls = set()
for level in catalogue['levels']:
    for standard in level['standards']:
        for paper in standard['papers']:
            code, year = standard['code'][2:], paper['year']
            for directory, kind in [('exams', 'exm'), ('schedules', 'ass')]:
                urls.add(f'https://www.nzqa.govt.nz/nqfdocs/ncea-resource/{directory}/{year}/{code}-{kind}-{year}.pdf')
urls.add('https://www.nzqa.govt.nz/nqfdocs/ncea-resource/specifications/2026/91578-spc-2026.pdf')

def fetch(url):
    destination = folder / url.rsplit('/', 1)[1]
    try:
        if not destination.exists():
            with urllib.request.urlopen(url, timeout=35) as response:
                data = response.read()
            if not data.startswith(b'%PDF'):
                raise ValueError('Response is not a PDF')
            destination.write_bytes(data)
        return {'url': url, 'status': 'downloaded', 'bytes': destination.stat().st_size}
    except Exception as error:
        return {'url': url, 'status': 'unavailable', 'error': str(error)}

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
    results = list(executor.map(fetch, sorted(urls)))
(folder.parent / 'source-fetch.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps({'downloaded': sum(r['status'] == 'downloaded' for r in results), 'unavailable': sum(r['status'] != 'downloaded' for r in results)}))
