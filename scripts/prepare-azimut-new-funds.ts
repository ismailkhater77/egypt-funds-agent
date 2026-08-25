import { readFile } from "node:fs/promises";

const raw = await readFile("/tmp/azimut_matches.json", "utf8");
const matches = JSON.parse(raw.slice(raw.indexOf("{")));
const mappedNames = new Set(matches.mapped.map((f: { canonical_name: string }) => f.canonical_name.toLowerCase()));
const missing = matches.extracted.filter((r: { name: string }) => {
  const n = r.name.toLowerCase();
  return ![...mappedNames].some((m) => m === n || m.includes(n) || n.includes(m));
});
console.log(JSON.stringify({ missing }, null, 2));
