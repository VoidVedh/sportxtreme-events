/**
 * Apply migrations/FIX_apply_rls_storage_seed.sql via Supabase Management API
 * or direct Postgres connection.
 *
 * Requires one of:
 *   SUPABASE_ACCESS_TOKEN  — Supabase personal access token (Management API)
 *   SUPABASE_DB_URL        — Postgres connection string (direct SQL)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { getProjectRef, requireEnv, ROOT } from "./scripts/env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATION = resolve(ROOT, "migrations/FIX_apply_rls_storage_seed.sql");
const sql = readFileSync(MIGRATION, "utf8");

async function applyViaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;

  const projectRef = getProjectRef();
  console.log(`Applying migration via Management API (project: ${projectRef})...`);

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Management API ${response.status}: ${body}`);
  }

  console.log("✅ Migration applied via Management API");
  if (body) console.log(body);
  return true;
}

async function applyViaPostgres() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) return false;

  console.log("Applying migration via direct Postgres connection...");
  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log("✅ Migration applied via Postgres");
    return true;
  } finally {
    await client.end();
  }
}

console.log("=".repeat(60));
console.log("  Apply RLS Fix Migration");
console.log("=".repeat(60));
console.log(`\nFile: ${MIGRATION}\n`);

// Ensure project URL is configured
requireEnv("VITE_SUPABASE_URL");

let applied = false;
try {
  applied = await applyViaManagementApi();
} catch (e) {
  console.error("Management API failed:", e.message);
}

if (!applied) {
  try {
    applied = await applyViaPostgres();
  } catch (e) {
    console.error("Postgres apply failed:", e.message);
  }
}

if (!applied) {
  console.log("\n⚠️  Could not apply automatically.");
  console.log("Set SUPABASE_ACCESS_TOKEN or SUPABASE_DB_URL in .env, then re-run:");
  console.log("  node fix_rls.mjs");
  console.log("\nOr paste this SQL into Supabase SQL Editor:\n");
  console.log("-".repeat(60));
  console.log(sql);
  console.log("-".repeat(60));
  process.exit(1);
}

console.log("\n" + "=".repeat(60));
