const token = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!token) throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
const parts = token.split(".");
const payload = parts.length === 3 ? JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) : {};
const now = Math.floor(Date.now() / 1000);
console.log(JSON.stringify({ now, nowIso: new Date(now * 1000).toISOString(), iat: payload.iat ?? null, iatIso: payload.iat ? new Date(payload.iat * 1000).toISOString() : null, exp: payload.exp ?? null, expIso: payload.exp ? new Date(payload.exp * 1000).toISOString() : null, deltaSeconds: payload.iat ? payload.iat - now : null }, null, 2));
