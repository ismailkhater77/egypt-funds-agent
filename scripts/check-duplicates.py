from collections import defaultdict
from html import unescape
from pathlib import Path
import json, os, re, requests
from urllib.parse import quote

base = os.environ.get('SUPABASE_URL')
secret = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not base or not secret:
    raise RuntimeError('Supabase server configuration is missing')
headers = {'apikey': secret, 'Authorization': f'Bearer {secret}'}

def get(table, select, limit):
    url = f'{base}/rest/v1/{table}?select={quote(select, safe=",")}&limit={limit}'
    r = requests.get(url, headers=headers, timeout=90)
    if not r.ok:
        raise RuntimeError(f'{table}: {r.status_code} {r.text[:300]}')
    return r.json()

def norm(v):
    v = unescape(str(v or '')).casefold()
    v = re.sub(r'[()\[\]{}.,:/\\"\'“”‘’]', ' ', v)
    v = re.sub(r'[‐‑‒–—―-]', ' ', v)
    return re.sub(r'\s+', ' ', v).strip()

funds = get('funds', 'fund_id,canonical_name,eima_name_raw,active', 1000)
prices = get('fund_prices', 'id,fund_id,valuation_date,status,nav', 10000)
by_canonical = defaultdict(list)
by_any_name = defaultdict(list)
for f in funds:
    key = norm(f.get('canonical_name'))
    if key: by_canonical[key].append(f)
    for field in ('canonical_name', 'eima_name_raw'):
        key2 = norm(f.get(field))
        if key2: by_any_name[key2].append({'fund_id': f['fund_id'], 'field': field, 'name': f.get(field), 'canonical_name': f.get('canonical_name')})
price_keys = defaultdict(list)
for p in prices:
    price_keys[(p.get('fund_id'), p.get('valuation_date'))].append(p)
result = {
    'fund_count': len(funds),
    'price_count': len(prices),
    'duplicate_canonical_name_groups': {k: v for k, v in by_canonical.items() if len(v) > 1},
    'duplicate_normalized_name_groups': {k: v for k, v in by_any_name.items() if len({x['fund_id'] for x in v}) > 1},
    'duplicate_price_snapshot_groups': {f'{k[0]}|{k[1]}': v for k, v in price_keys.items() if len(v) > 1},
}
result['has_fund_duplicates'] = bool(result['duplicate_canonical_name_groups'] or result['duplicate_normalized_name_groups'])
result['has_price_duplicates'] = bool(result['duplicate_price_snapshot_groups'])
print(json.dumps({
    'fund_count': result['fund_count'],
    'price_count': result['price_count'],
    'duplicate_canonical_name_group_count': len(result['duplicate_canonical_name_groups']),
    'duplicate_normalized_name_group_count': len(result['duplicate_normalized_name_groups']),
    'duplicate_price_snapshot_group_count': len(result['duplicate_price_snapshot_groups']),
    'has_fund_duplicates': result['has_fund_duplicates'],
    'has_price_duplicates': result['has_price_duplicates'],
}, ensure_ascii=False, indent=2))
Path('/tmp/duplicate-check.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
