import fs from "node:fs/promises";
const html = await fs.readFile("/tmp/aaim-live.html", "utf8");
const links = Array.from(html.matchAll(new RegExp(String.raw`<a[^>]+href="([^"]*/funds/[^"]+)"[^>]*>([\s\S]*?)</a>`, "gi")));
console.log("links", links.length);
const card = links[0]?.[2] ?? "";
console.log(JSON.stringify({ cardLength: card.length, hasName: /<h3 class="name[^>]*>\s*([^<]+?)\s*<\/h3>/i.test(card), hasPrice: /<div class="price">\s*([0-9.,]+)\s*<\/div>/i.test(card), hasCurrency: /<div class="currency[^>]*>\s*([^<]+?)\s*<\/div>/i.test(card), hasDate: /Last update\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i.test(card), sample: card.slice(0, 300), tail: card.slice(-350) }, null, 2));
