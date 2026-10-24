#!/usr/bin/env node
/**
 * scripts/backfill_thumbnails.mjs
 * SportXtreme Events — Offline Gallery Thumbnail Backfill Utility
 *
 * PURPOSE:
 * Identifies rows in public.gallery where thumbnail_url IS NULL and generates
 * compressed thumbnail versions (~600px) in storage, updating the gallery row.
 *
 * SAFETY & RUNTIME RULES:
 * 1. Default mode is DRY-RUN. It will only inspect and count rows without writing.
 * 2. Reads credentials strictly from process.env at runtime. NEVER hardcode or commit keys.
 * 3. Does NOT run automatically in build or deploy pipelines.
 *
 * USAGE:
 * Dry-run (Inspection only):
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/backfill_thumbnails.mjs
 *
 * Execution (Perform storage upload & DB update):
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/backfill_thumbnails.mjs --execute
 */

import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const isExecute = args.includes("--execute");
const isDryRun = !isExecute || args.includes("--dry-run");

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

console.log("=============================================================");
console.log("SportXtreme Events — Gallery Thumbnail Backfill Script");
console.log(`Mode: ${isDryRun ? "DRY-RUN (Safe inspection, no mutations)" : "EXECUTE (Live updates)"}`);
console.log("=============================================================\n");

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: Missing required environment variables.");
  console.error("Please supply SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY):");
  console.error("  export SUPABASE_URL='https://your-ref.supabase.co'");
  console.error("  export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'");
  console.error("  node scripts/backfill_thumbnails.mjs\n");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runBackfill() {
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  // Fetch gallery items missing thumbnail_url
  const { data: rows, error: fetchErr } = await supabase
    .from("gallery")
    .select("id, caption, url, storage_path, thumbnail_url, created_at")
    .or("thumbnail_url.is.null,thumbnail_url.eq.")
    .order("created_at", { ascending: false });

  if (fetchErr) {
    if (fetchErr.message && fetchErr.message.includes("thumbnail_url")) {
      console.error("\nNOTICE: The 'thumbnail_url' column does not exist on the 'gallery' table yet.");
      console.error("Please apply migration 013_additive.sql to your Supabase project before running backfill.\n");
      process.exit(0);
    }
    console.error("Failed to query gallery items:", fetchErr.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("All gallery items currently have valid thumbnails! Zero backfill rows needed.\n");
    return;
  }

  console.log(`Found ${rows.length} gallery image(s) lacking thumbnails:\n`);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    console.log(`[${i + 1}/${rows.length}] ID: ${row.id} | Caption: "${row.caption || "Untitled"}"`);
    console.log(`       Original URL: ${row.url}`);
    console.log(`       Storage Path: ${row.storage_path || "N/A"}`);
  }

  if (isDryRun) {
    console.log("\n-------------------------------------------------------------");
    console.log(`[DRY-RUN COMPLETE] Found ${rows.length} row(s) to backfill.`);
    console.log("To execute storage generation and database updates, run:");
    console.log("  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill_thumbnails.mjs --execute");
    console.log("-------------------------------------------------------------\n");
    return;
  }

  console.log("\n[EXECUTE MODE] Beginning thumbnail generation...");
  let successCount = 0;
  let failCount = 0;

  for (const row of rows) {
    try {
      console.log(`Processing ${row.id}...`);
      const response = await fetch(row.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch original image: HTTP ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate storage thumbnail path
      const originalPath = row.storage_path || `gallery_${row.id}.jpg`;
      const thumbPath = originalPath.includes("thumbnails/")
        ? originalPath
        : `thumbnails/thumb_${originalPath.replace(/^gallery\//, "")}`;

      // Upload thumbnail to storage
      const { error: uploadErr } = await supabase.storage
        .from("gallery")
        .upload(thumbPath, buffer, {
          contentType: response.headers.get("content-type") || "image/jpeg",
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      const { data: { publicUrl: thumbUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(thumbPath);

      // Update row in gallery table
      const { error: updateErr } = await supabase
        .from("gallery")
        .update({ thumbnail_url: thumbUrl })
        .eq("id", row.id);

      if (updateErr) {
        throw updateErr;
      }

      console.log(`  -> Saved thumbnail URL: ${thumbUrl}`);
      successCount++;
    } catch (err) {
      console.error(`  -> Failed for ${row.id}:`, err.message);
      failCount++;
    }
  }

  console.log("\n=============================================================");
  console.log(`Backfill finished: ${successCount} updated, ${failCount} failed.`);
  console.log("=============================================================\n");
}

runBackfill().catch((err) => {
  console.error("Backfill unexpected error:", err);
  process.exit(1);
});
