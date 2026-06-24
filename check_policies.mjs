/**
 * Check actual RLS policies using direct SQL queries
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

console.log("=".repeat(70));
console.log("  RLS POLICY INSPECTION");
console.log("=".repeat(70));

// Use pg_catalog.pg_policies which is accessible via RPC
async function checkPoliciesViaRPC() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename IN ('contacts', 'proposals', 'events')
      ORDER BY tablename, policyname;
    `
  });

  if (error) {
    console.log("\nRPC method failed:", error.message);
    return false;
  }

  console.log("\nCurrent RLS Policies:");
  console.log(JSON.stringify(data, null, 2));
  return true;
}

// Alternative: use a direct query if RPC fails
async function checkPoliciesDirect() {
  const { data, error } = await supabase
    .from('pg_policies')
    .select('*')
    .in('tablename', ['contacts', 'proposals', 'events']);

  if (error) {
    console.log("\nDirect query failed:", error.message);
    return false;
  }

  console.log("\nCurrent RLS Policies (direct):");
  console.log(JSON.stringify(data, null, 2));
  return true;
}

// Check if RLS is enabled
async function checkRLSEnabled() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('contacts', 'proposals', 'events');
    `
  });

  if (error) {
    console.log("\nRLS status check failed:", error.message);
    return;
  }

  console.log("\nRLS Enabled Status:");
  console.log(JSON.stringify(data, null, 2));
}

// Try to get policy info using a simpler approach
async function getPolicyInfo() {
  console.log("\n" + "─".repeat(70));
  console.log("ATTEMPTING TO RETRIEVE POLICY INFORMATION");
  console.log("─".repeat(70));
  
  // Try different approaches
  const methods = [
    { name: "RPC exec_sql", fn: checkPoliciesViaRPC },
    { name: "Direct query", fn: checkPoliciesDirect },
  ];

  for (const method of methods) {
    console.log(`\nTrying ${method.name}...`);
    try {
      const success = await method.fn();
      if (success) {
        console.log(`✅ ${method.name} succeeded`);
        return;
      }
    } catch (e) {
      console.log(`❌ ${method.name} failed:`, e.message);
    }
  }

  console.log("\n⚠️  Could not retrieve policy information via API");
  console.log("   This requires direct database access via SQL Editor");
}

// Check RLS status
await checkRLSEnabled();

// Get policy info
await getPolicyInfo();

// Test if we can at least read from the tables
console.log("\n" + "─".repeat(70));
console.log("READ ACCESS TEST");
console.log("─".repeat(70));

const tables = ['contacts', 'proposals', 'events'];
for (const table of tables) {
  const { data, error } = await supabase.from(table).select('*').limit(1);
  console.log(`\n[${table}] Read:`, error ? `❌ ${error.message}` : `✅ OK (${data.length} rows)`);
}

console.log("\n" + "=".repeat(70));
