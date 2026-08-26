import fs from "node:fs/promises";
const html = await fs.readFile("/tmp/ci-fundprice.html", "utf8");
const stripTags = (value) => value.replace(/<[^>]+>/g, " ").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const rows = [...html.matchAll(new RegExp(String.raw`<tr\b[\s\S]*?</tr>`, "gi"))].map((match) => match[0]);
console.log(JSON.stringify(rows.map((row, index) => {
  const cells = [...row.matchAll(new RegExp(String.raw`<td\b[^>]*>([\s\S]*?)</td>`, "gi"))].map((cell) => stripTags(cell[1] ?? ""));
  return { index, cells, nav: cells[2] ? Number(cells[2].replace(/,/g, "")) : null };
}), null, 2));
