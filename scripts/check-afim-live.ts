function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

const listingUrl = "https://www.afim.com.eg/public/index.php/investment";
const listingResponse = await fetch(listingUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
if (!listingResponse.ok) throw new Error(`AFIM listing returned HTTP ${listingResponse.status}`);
const listing = await listingResponse.text();
const cards = Array.from(listing.matchAll(/<a\s+href="([^"]*get-service\/\d+)"[\s\S]*?<div class="info text-center">\s*<p>([^<]+)<\/p>[\s\S]*?fundPrice[\s\S]*?<span>([0-9.,]+)\s*جنيه/gi));
const records: Array<{ name: string; nav: number; valuationDate: string; detailUrl: string }> = [];
for (const card of cards) {
  const detailUrl = new URL(card[1], listingUrl).href;
  const detailResponse = await fetch(detailUrl, { headers: { "User-Agent": "EgyptFundsPriceAgent/1.0" } });
  if (!detailResponse.ok) continue;
  const detail = stripTags(await detailResponse.text());
  const date = detail.match(/التاريخ:\s*(\d{1,2}\/\d{1,2}\/\d{4})/)?.[1];
  const price = detail.match(/سعر الوثيقة:\s*([0-9.,]+)\s*جنيه/)?.[1];
  if (!date || !price) continue;
  const [month, day, year] = date.split("/").map(Number);
  records.push({ name: stripTags(card[2]), nav: Number(price.replace(/,/g, "")), valuationDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, detailUrl });
}
console.log(JSON.stringify({ listingCards: cards.length, records: records.length, sample: records.slice(0, 5) }, null, 2));
if (!records.length) process.exit(1);
