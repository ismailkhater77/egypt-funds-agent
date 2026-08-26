import fs from "node:fs";
const html = fs.readFileSync("/tmp/mubasher8482.html", "utf8");
const text = html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
const date = text.match(/بتاريخ\s+(\d{1,2})\s+(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)(?:\s+(\d{4}))?/);
const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)];
const cells = tables[0] ? [...tables[0][0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].slice(0, 8).map(m=>m[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/\s+/g," ").trim()) : [];
const rows = tables[0] ? [...tables[0][0].matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].slice(0, 4).map(row => [...row[0].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/\s+/g," ").trim())) : [];
console.log(JSON.stringify({date, tables:tables.length, cells, rows, textAround:text.slice(text.indexOf("بتاريخ")-60,text.indexOf("بتاريخ")+130)},null,2));
