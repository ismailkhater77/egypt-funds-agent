import os, requests, json
from urllib.parse import quote
base=os.environ.get('SUPABASE_URL'); secret=os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not base or not secret: raise RuntimeError('Supabase server configuration is missing')
r=requests.get(f'{base}/rest/v1/funds?select=fund_id,canonical_name,eima_name_raw,management_company_raw,price_update_url,source_id&limit=1000',headers={'apikey':secret,'Authorization':f'Bearer {secret}'},timeout=90)
if not r.ok: raise RuntimeError(f'funds lookup failed: {r.status_code} {r.text[:300]}')
rows=[x for x in r.json() if 'mubasher' in ' '.join(str(x.get(k) or '') for k in ('canonical_name','eima_name_raw','management_company_raw')).casefold() or 'مباشر' in ' '.join(str(x.get(k) or '') for k in ('canonical_name','eima_name_raw','management_company_raw'))]
print(json.dumps({'count':len(rows),'funds':rows},ensure_ascii=False,indent=2))
