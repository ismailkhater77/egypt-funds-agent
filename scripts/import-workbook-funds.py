from pathlib import Path
from hashlib import sha256
from html import unescape
import json, os, re, requests

REPORT = Path('/tmp/upload-coverage-report.json')
BASE_URL = os.environ.get('SUPABASE_URL')
SECRET = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not BASE_URL or not SECRET:
    raise RuntimeError('Supabase server configuration is missing')
headers = {'apikey': SECRET, 'Authorization': f'Bearer {SECRET}', 'Content-Type': 'application/json'}

def normalize(value):
    value = unescape(str(value or '')).casefold()
    value = re.sub(r'[()\[\]{}.,:/\\"\'“”‘’]', ' ', value)
    value = re.sub(r'[‐‑‒–—―-]', ' ', value)
    return re.sub(r'\s+', ' ', value).strip()

report = json.loads(REPORT.read_text(encoding='utf-8'))
missing = [item for item in report['not_covered'] if not item.get('fund_id')]
existing_response = requests.get(f'{BASE_URL}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&limit=1000', headers=headers, timeout=60)
if not existing_response.ok:
    raise RuntimeError(f'Existing funds lookup failed: {existing_response.status_code} {existing_response.text[:300]}')
existing = existing_response.json()
existing_keys = {normalize(row.get('canonical_name')) for row in existing} | {normalize(row.get('eima_name_raw')) for row in existing}
rows = []
for item in missing:
    name = item['file_name']
    key = normalize(name)
    if key in existing_keys:
        continue
    fund_id = 'fund_catalog_' + sha256((key + '|' + item.get('company', '')).encode('utf-8')).hexdigest()[:16]
    rows.append({
        'fund_id': fund_id,
        'canonical_name': name,
        'eima_name_raw': name,
        'management_company_raw': item.get('company') or None,
        'category': None,
        'confidence': 0.5,
        'price_update_url': None,
        'fund_info_url': None,
        'source_id': None,
        'notes': 'Imported from uploaded Egyptian funds workbook; official price source discovery pending.',
        'active': True,
    })
if rows:
    response = requests.post(f'{BASE_URL}/rest/v1/funds', headers={**headers, 'Prefer': 'return=minimal'}, json=rows, timeout=120)
    if not response.ok:
        raise RuntimeError(f'Workbook fund import failed: {response.status_code} {response.text[:500]}')
print(json.dumps({'workbook_unmatched_candidates': len(missing), 'inserted': len(rows), 'skipped_existing': len(missing) - len(rows), 'names': [row['canonical_name'] for row in rows]}, ensure_ascii=False, indent=2))
