from pathlib import Path
import re, json
from bs4 import BeautifulSoup
path = Path('/home/ubuntu/browser_html/egx_com_eg_GoldCompanyDataPageAll.aspx_1787753043417.html')
html = path.read_text(encoding='utf-8', errors='ignore')
soup = BeautifulSoup(html, 'html.parser')
print(json.dumps({'bytes': len(html), 'scripts': len(soup.find_all('script')), 'forms': len(soup.find_all('form'))}, ensure_ascii=False))
for script in soup.find_all('script'):
    text = script.get_text(' ', strip=True)
    src = script.get('src')
    combined = f'{src or ""} {text}'
    if re.search(r'gold|fund|ajax|json|api|indicator|price', combined, re.I):
        print('---')
        print(combined[:5000])
for tag in soup.find_all(['a','form','input','button']):
    combined = str(tag)
    if re.search(r'gold|fund|ajax|json|api|indicator|price', combined, re.I):
        print('TAG', combined[:1200])
