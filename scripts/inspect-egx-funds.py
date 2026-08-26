import requests, re, json
from bs4 import BeautifulSoup
url='https://www.egx.com.eg/en/GoldCompanyDataPageAll.aspx'
r=requests.get(url,timeout=60,headers={'User-Agent':'Mozilla/5.0'})
print(json.dumps({'status':r.status_code,'bytes':len(r.content),'final_url':r.url},ensure_ascii=False))
soup=BeautifulSoup(r.text,'html.parser')
text=' '.join(soup.stripped_strings)
for needle in ['Mubasher','Gold Fund','Fund','NAV']:
    positions=[]
    start=0
    while True:
        i=text.casefold().find(needle.casefold(),start)
        if i<0: break
        positions.append(text[max(0,i-180):i+300])
        start=i+len(needle)
    print(needle, json.dumps(positions[:10],ensure_ascii=False))
print('tables',len(soup.find_all('table')))
for idx,table in enumerate(soup.find_all('table')):
    table_text=' | '.join(table.stripped_strings)
    if 'Mubasher' in table_text or 'Gold' in table_text or idx<3:
        print('TABLE',idx,table_text[:4000])
print('scripts', [s.get('src') for s in soup.find_all('script') if s.get('src')])
