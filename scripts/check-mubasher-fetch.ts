const url = "https://mubasherfunds.info/8482";
const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36", Accept: "text/html,application/xhtml+xml", "Accept-Language": "ar,en;q=0.8", Referer: "https://mubasherfunds.info/" } });
const body = await response.text();
console.log(JSON.stringify({ status: response.status, finalUrl: response.url, bytes: body.length, hasTable: body.includes("<table"), hasCash: body.includes("كاش مباشر"), first: body.slice(0, 180) }, null, 2));
