import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** Load KEY=VALUE pairs from .env into process.env (does not override existing). */
function loadDotEnv() {
  const envPath = resolve(ROOT, ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

export function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseClientConfig() {
  const url = requireEnv("VITE_SUPABASE_URL");
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY"
    );
  }
  return { url, key };
}

export function getProjectRef(url = requireEnv("VITE_SUPABASE_URL")) {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) throw new Error("Could not parse project ref from VITE_SUPABASE_URL");
  return match[1];
}

export { ROOT };
