const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");

const oldUrl = "https://www.beltoneholding.com/ar/business-line/bltwn-lidart-alaswl-1";
const newUrl = "https://www.beltoneholding.com/business-line/asset-management-1";
const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};
const filter = encodeURIComponent(`eq.${oldUrl}`);

for (const table of ["sources", "funds"]) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${table === "sources" ? "source_url" : "price_update_url"}=${filter}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(table === "sources" ? { source_url: newUrl } : { price_update_url: newUrl }),
  });
  if (!response.ok) throw new Error(`${table} update failed: ${response.status} ${await response.text()}`);
  console.log(`${table} Beltone URL updated`);
}
