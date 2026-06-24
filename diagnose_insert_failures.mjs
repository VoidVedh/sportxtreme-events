/**
 * Comprehensive diagnostic for insert failures
 * Captures exact errors, payloads, and table schemas
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

console.log("=".repeat(70));
console.log("  INSERT FAILURE DIAGNOSTIC");
console.log("=".repeat(70));

// Helper to log complete error
function logError(label, error) {
  console.log(`\n${label}:`);
  console.log("  Code:", error.code);
  console.log("  Message:", error.message);
  console.log("  Details:", error.details || "none");
  console.log("  Hint:", error.hint || "none");
  console.log("  Full object:", JSON.stringify(error, null, 2));
}

// Helper to log payload
function logPayload(label, payload) {
  console.log(`\n${label}:`);
  console.log(JSON.stringify(payload, null, 2));
}

// 1. Get table schemas
console.log("\n" + "─".repeat(70));
console.log("TABLE SCHEMAS");
console.log("─".repeat(70));

async function getSchema(tableName) {
  const { data, error } = await supabase
    .rpc('get_table_schema', { table_name: tableName })
    .select();
  
  if (error) {
    // Fallback: use information_schema
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');
    
    if (colError) {
      console.log(`\n[${tableName}] Schema fetch failed:`, colError.message);
      return null;
    }
    
    console.log(`\n[${tableName}] Columns:`);
    columns.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    return columns;
  }
  
  return data;
}

await getSchema('contacts');
await getSchema('proposals');

// 2. Test Contact Form Insert (exact payload from Contact.jsx)
console.log("\n" + "─".repeat(70));
console.log("CONTACT FORM INSERT TEST");
console.log("─".repeat(70));

const contactPayload = {
  name: "Test Contact",
  phone: "+91 8976571622",
  email: "test@example.com",
  message: "This is a test message from diagnostic script"
};

logPayload("Contact Payload", contactPayload);

const contactResult = await supabase.from("contacts").insert([contactPayload]).select();
if (contactResult.error) {
  logError("Contact Insert Failed", contactResult.error);
} else {
  console.log("\n✅ Contact Insert SUCCESS");
  console.log("  Inserted ID:", contactResult.data[0].id);
  // Cleanup
  await supabase.from("contacts").delete().eq("id", contactResult.data[0].id);
  console.log("  Cleanup: deleted test row");
}

// 3. Test Proposal Form Insert (exact payload from Contact.jsx)
console.log("\n" + "─".repeat(70));
console.log("PROPOSAL FORM INSERT TEST");
console.log("─".repeat(70));

const proposalPayload = {
  company_name: "Test Company",
  event_type: "Corporate Sports League",
  participants: "50",
  budget: "100000",
  description: "This is a test proposal from diagnostic script"
};

logPayload("Proposal Payload", proposalPayload);

const proposalResult = await supabase.from("proposals").insert([proposalPayload]).select();
if (proposalResult.error) {
  logError("Proposal Insert Failed", proposalResult.error);
} else {
  console.log("\n✅ Proposal Insert SUCCESS");
  console.log("  Inserted ID:", proposalResult.data[0].id);
  // Cleanup
  await supabase.from("proposals").delete().eq("id", proposalResult.data[0].id);
  console.log("  Cleanup: deleted test row");
}

// 4. Test Sponsor Inquiry Insert (exact payload from SponsorModal.jsx)
console.log("\n" + "─".repeat(70));
console.log("SPONSOR INQUIRY INSERT TEST");
console.log("─".repeat(70));

const sponsorPayload = {
  company_name: "Sponsor Company",
  event_type: "SPONSOR: Title Sponsor",
  participants: "John Doe",
  budget: "500000",
  description: "[Sponsor Inquiry] Contact: John Doe | Email: sponsor@example.com | Phone: +91 8976571622 | Message: We want to sponsor"
};

logPayload("Sponsor Payload", sponsorPayload);

const sponsorResult = await supabase.from("proposals").insert([sponsorPayload]).select();
if (sponsorResult.error) {
  logError("Sponsor Insert Failed", sponsorResult.error);
} else {
  console.log("\n✅ Sponsor Insert SUCCESS");
  console.log("  Inserted ID:", sponsorResult.data[0].id);
  // Cleanup
  await supabase.from("proposals").delete().eq("id", sponsorResult.data[0].id);
  console.log("  Cleanup: deleted test row");
}

// 5. Check existing RLS policies
console.log("\n" + "─".repeat(70));
console.log("EXISTING RLS POLICIES");
console.log("─".repeat(70));

async function getPolicies(tableName) {
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', tableName);
  
  if (error) {
    console.log(`\n[${tableName}] Policy fetch failed:`, error.message);
    return;
  }
  
  console.log(`\n[${tableName}] Policies:`);
  if (data && data.length > 0) {
    data.forEach(policy => {
      console.log(`  • ${policy.policyname}`);
      console.log(`    Command: ${policy.cmd}`);
      console.log(`    Roles: ${policy.roles}`);
    });
  } else {
    console.log("  No policies found");
  }
}

await getPolicies('contacts');
await getPolicies('proposals');

console.log("\n" + "=".repeat(70));
console.log("  DIAGNOSTIC COMPLETE");
console.log("=".repeat(70));
