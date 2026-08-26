import fs from "node:fs/promises";

const html = await fs.readFile("/tmp/ci-fundprice.html", "utf8");
const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((match) => match[0]);
const strip = (value) => value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
console.log(JSON.stringify({
  bytes: html.length,
  tableCount: tables.length,
  tables: tables.map((table, index) => ({
    index,
    rows: [...table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((row) => strip(row[0])).filter(Boolean),
  })),
}, null, 2));
