import fs from "node:fs";
const report = JSON.parse(fs.readFileSync("reports/upload-coverage-report.json", "utf8"));
const noSource = report.not_covered.filter((row) => !row.price_update_url);
const sourceNoPrice = report.not_covered.filter((row) => row.price_update_url);
console.log(JSON.stringify({ noSource: noSource.map(({ row, file_name, company }) => ({ row, file_name, company })), sourceNoPrice: sourceNoPrice.map(({ row, file_name, company, price_update_url }) => ({ row, file_name, company, price_update_url })) }, null, 2));
