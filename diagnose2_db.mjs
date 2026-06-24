/**
 * Additional Supabase key / role diagnostics.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
 */

import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();

console.log("[INFO] Key format:", key.startsWith("sb_publishable_") ? "publishable" : key.startsWith("eyJ") ? "JWT anon" : "unknown");

console.log("\n[INFO] Fetching auth settings...");
try {
  const response = await fetch(`${url}/auth/v1/settings`, {
    headers: { apikey: key },
  });
  console.log("Auth settings status:", response.status);
  const data = await response.json();
  if (data) console.log("Settings keys:", Object.keys(data).join(", "));
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n[INFO] Testing INSERT without Authorization header...");
try {
  const response = await fetch(`${url}/rest/v1/contacts`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "Test User",
      phone: "9999999999",
      email: "test@sportxtreme.com",
      message: "Verification Test",
    }),
  });
  console.log("Status:", response.status);
  console.log("Response:", (await response.text()).substring(0, 300));
} catch (e) {
  console.log("Error:", e.message);
}
