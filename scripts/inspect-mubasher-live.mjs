const response = await fetch('https://mubasherfunds.info/', { headers: { 'User-Agent': 'EgyptFundsPriceAgent/1.0', Accept: 'text/html' } });
const html = await response.text();
console.log(JSON.stringify({ status: response.status, bytes: html.length, finalUrl: response.url, hasMubasher: html.includes('Mubasher'), absoluteArticleLinks: (html.match(/https?:\/\/mubasherfunds\.info\/[^"']*article/g) || []).length, relativeArticleLinks: (html.match(/href=["'][^"']*article[^"']*["']/gi) || []).length, preview: html.slice(0, 300) }, null, 2));
