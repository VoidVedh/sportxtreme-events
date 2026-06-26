import { createClient } from "@supabase/supabase-js";
import { getSupabaseClientConfig } from "./scripts/env.mjs";

const { url, key } = getSupabaseClientConfig();
const supabase = createClient(url, key);

console.log("Checking tables...");

const tables = ["contacts", "proposals", "events", "gallery", "testimonials"];

for (const table of tables) {
  try {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`❌ Table [${table}] Error:`, error.message, "| Code:", error.code);
    } else {
      console.log(`✅ Table [${table}] Exists. Columns:`, data.length > 0 ? Object.keys(data[0]) : "No rows, but table accessible");
    }
  } catch (err) {
    console.log(`❌ Table [${table}] Exception:`, err.message);
  }
}
