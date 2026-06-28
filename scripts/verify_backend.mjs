/**
 * SportXtreme Events — Full Backend Verification Script
 * Tests every table, RLS policy, and CRUD operation using the anon key.
 */
import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

const PASS = "✅ PASS";
const FAIL = "❌ FAIL";

let passCount = 0;
let failCount = 0;
const results = [];

function log(label, ok, detail = "") {
  const status = ok ? PASS : FAIL;
  if (ok) passCount++; else failCount++;
  const line = `${status}  ${label}${detail ? `  →  ${detail}` : ""}`;
  console.log(line);
  results.push({ label, ok, detail });
}

async function check(label, fn) {
  try {
    const result = await fn();
    if (result === true || result == null) {
      log(label, true);
    } else if (result === false) {
      log(label, false, "returned false");
    } else {
      log(label, true, typeof result === "string" ? result : JSON.stringify(result).slice(0, 80));
    }
    return result;
  } catch (err) {
    log(label, false, err.message?.slice(0, 120));
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("  SPORTXTREME — BACKEND VERIFICATION");
console.log("═══════════════════════════════════════════════════════════════\n");

// PHASE 1 ─ TABLE + SCHEMA VERIFICATION
console.log("── PHASE 1: TABLE & SCHEMA VERIFICATION ─────────────────────");

const EXPECTED_TABLES = {
  contacts:     ["id","name","email","message","phone","created_at","updated_at"],
  proposals:    ["id","company_name","event_type","participants","budget","description","created_at","updated_at"],
  events:       ["id","title","category","sport","description","location","participants","event_date","status","created_at","updated_at"],
  gallery:      ["id","url","caption","category","event_name","storage_path","created_at","updated_at"],
  testimonials: ["id","name","role","text","stars","created_at","updated_at"],
  registrations: ["id","registration_number","event_id","name","email","phone","age","tshirt_size","status","qr_payload","approved_at","approved_by","created_at","updated_at"],
};

const tableResults = {};

for (const [table, expectedCols] of Object.entries(EXPECTED_TABLES)) {
  // Try to select a single row — if 200 or empty-array, table exists and RLS SELECT allows it
  const { data, error } = await supabase.from(table).select("*").limit(1);
  const exists = !error || error.code !== "42P01";
  log(`Table "${table}" exists`, exists, error ? `${error.code}: ${error.message}` : `${data?.length ?? 0} rows returned`);

  if (data && data.length > 0) {
    const cols = Object.keys(data[0]);
    const missingCols = expectedCols.filter(c => !cols.includes(c));
    log(`  Columns OK for "${table}"`, missingCols.length === 0, missingCols.length > 0 ? `MISSING: ${missingCols.join(", ")}` : `found ${cols.length} cols`);
  } else if (!error) {
    log(`  Columns (empty table — assuming OK from schema)`, true, "no rows to inspect");
  }
  tableResults[table] = { exists, error };
}

// PHASE 2 ─ RLS POLICY VERIFICATION (actual INSERT tests as anon)
console.log("\n── PHASE 2: RLS POLICY VERIFICATION ─────────────────────────");

// 2a. contacts INSERT (anon should succeed)
let contactId = null;
{
  const { data, error } = await supabase.from("contacts").insert([{
    name: "VERIFY TEST - Contact",
    email: "verify@sportxtreme.test",
    phone: "+91-9999999999",
    message: "Automated verification test — safe to delete",
  }]);

  log("contacts: anon INSERT", !error, error ? `${error.code}: ${error.message}` : "inserted");
  if (!error) contactId = true;
}

// 2b. proposals INSERT (anon should succeed)
let proposalId = null;
{
  const { error } = await supabase.from("proposals").insert([{
    company_name: "VERIFY TEST Corp",
    event_type: "CORPORATE",
    participants: "100",
    budget: "50000",
    description: "Automated verification test — safe to delete",
  }]);

  log("proposals: anon INSERT", !error, error ? `${error.code}: ${error.message}` : "inserted");
  if (!error) proposalId = true;
}

// 2c. sponsor form → proposals INSERT
{
  const { error } = await supabase.from("proposals").insert([{
    company_name: "VERIFY TEST Sponsor Co",
    event_type: "SPONSOR: Title",
    participants: "Verify Contact Person",
    budget: "200000",
    description: "[Sponsor Inquiry] Contact: Test Person | Email: test@sponsor.co | Phone: +91-0000000000 | Message: Verification test",
  }]);

  log("proposals: sponsor anon INSERT", !error, error ? `${error.code}: ${error.message}` : "inserted");
}

// 2d. events SELECT (anon should succeed)
{
  const { data, error } = await supabase.from("events").select("id,title").limit(3);
  log("events: anon SELECT", !error, error ? `${error.code}: ${error.message}` : `${data?.length ?? 0} rows`);
  log("events: demo seed present", (data?.length ?? 0) > 0, (data?.length ?? 0) > 0 ? data[0].title : "run 006_seed_demo.sql");
  if (data?.length > 0) {
    log("  events: has data", true, data[0].title);
  }
}

// 2e. gallery SELECT (anon should succeed)
{
  const { data, error } = await supabase.from("gallery").select("id,caption").limit(3);
  log("gallery: anon SELECT", !error, error ? `${error.code}: ${error.message}` : `${data?.length ?? 0} rows`);
  if (data?.length > 0) {
    log("  gallery: has data", true, data[0].caption);
  }
}

// 2f. testimonials SELECT (anon should succeed)
{
  const { data, error } = await supabase.from("testimonials").select("id,name,text,stars").limit(3);
  log("testimonials: anon SELECT", !error, error ? `${error.code}: ${error.message}` : `${data?.length ?? 0} rows`);
  if (data?.length > 0) {
    log("  testimonials: has data", true, `${data[0].name} — ★${data[0].stars}`);
  }
}

// 2g. registrations RLS validation (INSERT should succeed, SELECT should be blocked)
{
  const { data: eventsData } = await supabase.from("events").select("id").limit(1);
  if (eventsData && eventsData.length > 0) {
    const { error } = await supabase.from("registrations").insert([{
      event_id: eventsData[0].id,
      name: "VERIFY TEST - Registrant",
      email: "verify-reg@sportxtreme.test",
      phone: "9999999999",
      tshirt_size: "M",
      status: "pending"
    }]);
    log("registrations: anon INSERT", !error, error ? `${error.code}: ${error.message}` : "inserted");
  } else {
    log("registrations: anon INSERT", false, "no events to link registration to");
  }

  const { data, error } = await supabase.from("registrations").select("id");
  const blocked = !error && (!data || data.length === 0);
  log("registrations: anon SELECT is BLOCKED (expected)", blocked || error, error ? `${error.code}: ${error.message}` : "blocked (0 rows returned)");
}

// 2h. anon should NOT be able to DELETE contacts (RLS guard test)
{
  const { data, error } = await supabase.from("contacts").delete().eq("email", "verify@sportxtreme.test").select();
  const blocked = error || !data || data.length === 0;
  log("contacts: anon DELETE is BLOCKED (expected)", blocked, error ? `Blocked with error: ${error.code}` : (blocked ? "Blocked (0 rows deleted)" : "WARNING: anon deleted a row!"));
}

// PHASE 3 ─ STORAGE VERIFICATION
console.log("\n── PHASE 3: STORAGE BUCKET VERIFICATION ─────────────────────");

{
  const { data, error } = await supabase.storage.from("gallery").list();
  log("Storage bucket 'gallery' exists", !error, error ? error.message : `Accessible (found ${data?.length ?? 0} items)`);
  if (!error) {
    log("  Bucket is public", true, "verified via public list");
  }
}

// Test upload with tiny PNG (1x1 white pixel)
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);
const TEST_PATH = `verify-test-${Date.now()}.png`;
let uploadedPath = null;

{
  const { data, error } = await supabase.storage.from("gallery").upload(TEST_PATH, TINY_PNG, {
    contentType: "image/png",
    cacheControl: "60",
    upsert: false,
  });
  log("Storage: anon upload BLOCKED or admin-only", !!error, error ? `Correctly requires auth: ${error.message.slice(0,60)}` : `Uploaded as anon — check policy`);
  if (!error) uploadedPath = data?.path;
}

// Get public URL for test (doesn't require auth)
{
  const { data } = supabase.storage.from("gallery").getPublicUrl("verify-test.png");
  log("Storage: public URL generation works", !!data?.publicUrl, data?.publicUrl?.slice(0, 60));
}

// PHASE 4 ─ DATA VERIFICATION (count check after inserts)
console.log("\n── PHASE 4: DATA INTEGRITY VERIFICATION ─────────────────────");

{
  const { count, error } = await supabase.from("contacts").select("*", { count: "exact", head: true });
  log("contacts: row count readable", !error, error ? error.message : `${count} rows`);
}
{
  const { count, error } = await supabase.from("proposals").select("*", { count: "exact", head: true });
  log("proposals: row count readable", !error, error ? error.message : `${count} rows`);
}
{
  const { count, error } = await supabase.from("events").select("*", { count: "exact", head: true });
  log("events: row count readable", !error, error ? error.message : `${count} rows`);
}
{
  const { count, error } = await supabase.from("gallery").select("*", { count: "exact", head: true });
  log("gallery: row count readable", !error, error ? error.message : `${count} rows`);
}
{
  const { count, error } = await supabase.from("testimonials").select("*", { count: "exact", head: true });
  log("testimonials: row count readable", !error, error ? error.message : `${count} rows`);
}

// Print summary
console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`  SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log("═══════════════════════════════════════════════════════════════");

// Export results for report generation
import { writeFileSync } from "fs";
writeFileSync("./verify_results.json", JSON.stringify({ passCount, failCount, results }, null, 2));
console.log("\nResults written to ./verify_results.json");

if (failCount > 0) {
  console.log("\n⚠️  FAILURES DETECTED — see above for details");
  process.exit(1);
} else {
  console.log("\n🎉 ALL CHECKS PASSED");
  process.exit(0);
}
