import { readFile } from "node:fs/promises";

const payload = JSON.parse(await readFile("/tmp/azimut_fund_list.json", "utf8"));
const first = payload?.response?.funds?.dataList?.[0];
console.log(JSON.stringify({ topLevelKeys: Object.keys(first ?? {}), first }, null, 2));
