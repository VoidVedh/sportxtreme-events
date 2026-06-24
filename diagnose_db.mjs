/**
 * Diagnose Supabase RLS and REST API behavior.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

console.log("\n[DEBUG] Testing REST API SELECT on contacts...");
try {
  const response = await fetch(`${url}/rest/v1/contacts?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text.substring(0, 200));
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n[DEBUG] Testing REST API INSERT on contacts...");
try {
  const response = await fetch(`${url}/rest/v1/contacts`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
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
  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text.substring(0, 500));
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n[DEBUG] Testing supabase-js INSERT on proposals...");
try {
  const { data, error } = await supabase
    .from("proposals")
    .insert([
      {
        company_name: "Diagnose Co",
        event_type: "Test",
        description: "RLS diagnose",
      },
    ])
    .select("id");
  if (error) {
    console.log("❌ Failed:", error.message, "| code:", error.code);
  } else {
    console.log("✅ OK — id:", data[0]?.id);
  }
} catch (e) {
  console.log("Error:", e.message);
}
