/**
 * Phase 1 verification — insert test rows and report IDs.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

const stamp = Date.now();

console.log("=".repeat(60));
console.log("  Phase 1 — Insert Verification");
console.log("=".repeat(60));

async function verifyTable(name) {
  const { error } = await supabase.from(name).select("id").limit(1);
  if (error?.code === "PGRST205") return { exists: false, error: "table missing" };
  if (error) return { exists: false, error: error.message };
  return { exists: true };
}

for (const table of ["contacts", "proposals", "events"]) {
  const result = await verifyTable(table);
  console.log(`\n[${table}] ${result.exists ? "✅ accessible" : "❌ " + result.error}`);
}

console.log("\n[INSERT] contacts...");
const contactPayload = {
  name: "Phase1 Verify",
  phone: "9000000001",
  email: `phase1-contact-${stamp}@verify.local`,
  message: "Phase 1 automated verification insert",
};
const contactRes = await supabase.from("contacts").insert([contactPayload]).select("id, email, created_at");
if (contactRes.error) {
  console.log("❌ FAILED:", contactRes.error.message, "| code:", contactRes.error.code);
} else {
  console.log("✅ SUCCESS");
  console.log("   Row ID:", contactRes.data[0].id);
  console.log("   Email:", contactRes.data[0].email);
}

console.log("\n[INSERT] proposals...");
const proposalPayload = {
  company_name: "Phase1 Verify Co",
  event_type: "Corporate League",
  participants: "50",
  budget: "100000",
  description: `Phase 1 automated verification insert ${stamp}`,
};
const proposalRes = await supabase.from("proposals").insert([proposalPayload]).select("id, company_name, created_at");
if (proposalRes.error) {
  console.log("❌ FAILED:", proposalRes.error.message, "| code:", proposalRes.error.code);
} else {
  console.log("✅ SUCCESS");
  console.log("   Row ID:", proposalRes.data[0].id);
  console.log("   Company:", proposalRes.data[0].company_name);
}

console.log("\n[SELECT] events (public read)...");
const eventsRes = await supabase.from("events").select("id, title").limit(5);
if (eventsRes.error) {
  console.log("❌ FAILED:", eventsRes.error.message);
} else {
  console.log(`✅ OK — ${eventsRes.data.length} row(s) visible`);
  eventsRes.data.forEach((row) => console.log(`   • ${row.id} — ${row.title}`));
}

console.log("\n" + "=".repeat(60));
