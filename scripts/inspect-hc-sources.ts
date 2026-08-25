const baseUrl = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !secret) throw new Error("Supabase server configuration is missing");
const response = await fetch(`${baseUrl}/rest/v1/sources?select=source_id,source_url,source_name&source_url=ilike.*hc*`, {
  headers: { apikey: secret, Authorization: `Bearer ${secret}` },
});
if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
console.log(JSON.stringify(await response.json(), null, 2));
