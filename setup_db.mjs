/**
 * SportXtreme — Database Setup & Verification
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

console.log("=".repeat(60));
console.log("  SportXtreme — Database Setup & Verification");
console.log("=".repeat(60));

console.log("\n[STEP 1] Testing Supabase connectivity...");
try {
  const { error } = await supabase.from("contacts").select("id").limit(1);
  if (error && error.code === "PGRST205") {
    console.log("❌ Table contacts does not exist — apply schema.sql first.");
    console.log("   Error:", error.message);
  } else if (error) {
    console.log("⚠️  Unexpected error:", error.message, "| code:", error.code);
  } else {
    console.log("✅ Table contacts exists");
  }
} catch (e) {
  console.log("❌ Connection error:", e.message);
}

console.log("\n[STEP 2] Attempting test insert into contacts...");
try {
  const { data, error } = await supabase
    .from("contacts")
    .insert([
      {
        name: "Test User",
        phone: "9999999999",
        email: "test@sportxtreme.com",
        message: "Verification Test",
      },
    ])
    .select("id, name, email, created_at");

  if (error) {
    console.log("❌ Insert failed:", error.message, "| code:", error.code);
    if (error.code === "PGRST205") {
      console.log("   → Apply schema.sql in Supabase SQL Editor.");
    }
  } else {
    console.log("✅ Contact insert succeeded");
    console.log("   ID:", data[0]?.id);
    console.log("   Name:", data[0]?.name);
    console.log("   Email:", data[0]?.email);
    console.log("   Created:", data[0]?.created_at);
  }
} catch (e) {
  console.log("❌ Exception:", e.message);
}

console.log("\n[STEP 3] Attempting test insert into proposals...");
try {
  const { data, error } = await supabase
    .from("proposals")
    .insert([
      {
        company_name: "Test Company",
        event_type: "Corporate League",
        participants: "100",
        budget: "50000",
        description: "Verification Test",
      },
    ])
    .select("id, company_name, event_type, created_at");

  if (error) {
    console.log("❌ Insert failed:", error.message, "| code:", error.code);
    if (error.code === "PGRST205") {
      console.log("   → Apply schema.sql in Supabase SQL Editor.");
    }
  } else {
    console.log("✅ Proposal insert succeeded");
    console.log("   ID:", data[0]?.id);
    console.log("   Company:", data[0]?.company_name);
    console.log("   Type:", data[0]?.event_type);
    console.log("   Created:", data[0]?.created_at);
  }
} catch (e) {
  console.log("❌ Exception:", e.message);
}

console.log("\n[STEP 4] Checking expected tables...");
const tables = ["contacts", "proposals", "events", "gallery", "testimonials"];
for (const table of tables) {
  try {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error && error.code === "PGRST205") {
      console.log(`❌ Table ${table} — MISSING`);
    } else if (error) {
      console.log(`⚠️  Table ${table} — Error: ${error.message}`);
    } else {
      console.log(`✅ Table ${table} — EXISTS`);
    }
  } catch (e) {
    console.log(`❌ Table ${table} — Exception: ${e.message}`);
  }
}

console.log("\n" + "=".repeat(60));
console.log("  Setup script complete");
console.log("=".repeat(60));
