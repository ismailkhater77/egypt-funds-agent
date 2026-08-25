import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

describe("Supabase server secret", () => {
  it("can read one source using the server-only key", async () => {
    expect(supabaseUrl).toBeTruthy();
    expect(supabaseKey).toBeTruthy();

    const response = await fetch(
      `${supabaseUrl}/rest/v1/sources?select=source_id&limit=1`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    expect(response.ok).toBe(true);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  }, 15_000);
});
