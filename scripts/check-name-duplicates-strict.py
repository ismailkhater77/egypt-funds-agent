from collections import defaultdict
from html import unescape
import json, os, re, requests
from urllib.parse import quote

base = os.environ.get('SUPABASE_URL')
secret = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not base or not secret:
    raise RuntimeError('Supabase server configuration is missing')
headers = {'apikey': secret, 'Authorization': f'Bearer {secret}'}
url = f'{base}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw&limit=1000'
r = requests.get(url, headers=headers, timeout=90)
if not r.ok:
    raise RuntimeError(f'funds lookup failed: {r.status_code} {r.text[:300]}')
funds = r.json()

def groups(values):
    result = defaultdict(list)
    for f in funds:
        value = f.get(values) if isinstance(values, str) else values(f)
        if value is not None and str(value).strip():
            result[value].append({'fund_id': f['fund_id'], 'canonical_name': f.get('canonical_name'), 'eima_name_raw': f.get('eima_name_raw')})
    return {str(k): v for k, v in result.items() if len({x['fund_id'] for x in v}) > 1}

def norm(v):
    v = unescape(str(v or '')).casefold().strip()
    v = re.sub(r'[()\[\]{}.,:/\\"\'“”‘’]', ' ', v)
    v = re.sub(r'[‐‑‒–—―-]', ' ', v)
    return re.sub(r'\s+', ' ', v).strip()

exact_canonical = groups('canonical_name')
trimmed_canonical = groups(lambda f: str(f.get('canonical_name') or '').strip().casefold())
normalized_canonical = groups(lambda f: norm(f.get('canonical_name')))
all_names = defaultdict(list)
for f in funds:
    for field in ('canonical_name', 'eima_name_raw'):
        key = norm(f.get(field))
        if key:
            all_names[key].append({'fund_id': f['fund_id'], 'field': field, 'name': f.get(field), 'canonical_name': f.get('canonical_name')})
normalized_any = {k: v for k, v in all_names.items() if len({x['fund_id'] for x in v}) > 1}
result = {
    'fund_count': len(funds),
    'exact_canonical_duplicate_groups': exact_canonical,
    'trimmed_casefold_canonical_duplicate_groups': trimmed_canonical,
    'normalized_canonical_duplicate_groups': normalized_canonical,
    'normalized_canonical_or_raw_cross_field_duplicate_groups': normalized_any,
}
print(json.dumps({'fund_count': len(funds), 'exact_canonical_groups': len(exact_canonical), 'trimmed_casefold_groups': len(trimmed_canonical), 'normalized_canonical_groups': len(normalized_canonical), 'cross_field_groups': len(normalized_any), 'has_any_name_duplicate': bool(exact_canonical or trimmed_canonical or normalized_canonical or normalized_any)}, ensure_ascii=False, indent=2))
