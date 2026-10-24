import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Helper to parse .env file simply without external dependencies
function loadEnv() {
  const env = { ...process.env };
  const envFiles = [".env", ".env.local", ".env.production"];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx > 0) {
              const key = trimmed.slice(0, eqIdx).trim();
              let val = trimmed.slice(eqIdx + 1).trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              if (!env[key]) {
                env[key] = val;
              }
            }
          }
        }
      } catch {
        // Silently continue
      }
    }
  }
  return env;
}

const env = loadEnv();
const SITE_URL = (env.VITE_SITE_URL || "https://sportxtreme-events.vercel.app").replace(/\/$/, "");
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/events", priority: "0.9", changefreq: "daily" },
  { path: "/gallery", priority: "0.7", changefreq: "weekly" },
  { path: "/register", priority: "0.8", changefreq: "daily" },
];

async function fetchDynamicEventRoutes() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/events?select=id,event_date&status=eq.active&order=event_date.asc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((ev) => ({
      path: `/register?event=${encodeURIComponent(ev.id)}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: ev.event_date ? ev.event_date.split("T")[0] : undefined,
    }));
  } catch (err) {
    console.warn("[sitemap-generator] Notice: Could not fetch dynamic events, falling back to static routes.", err.message);
    return [];
  }
}

async function run() {
  const dynamicRoutes = await fetchDynamicEventRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  const today = new Date().toISOString().split("T")[0];

  const xmlEntries = allRoutes
    .map((r) => {
      const loc = `${SITE_URL}${r.path}`;
      const lastmod = r.lastmod || today;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
    })
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;

  const publicDir = path.join(rootDir, "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemapXml, "utf-8");
  console.log(`[sitemap-generator] Generated ${allRoutes.length} URLs in ${sitemapPath}`);

  // Also ensure robots.txt has the correct sitemap location & admin block
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /checkin
Disallow: /checkin/

Sitemap: ${SITE_URL}/sitemap.xml
`;
  const robotsPath = path.join(publicDir, "robots.txt");
  fs.writeFileSync(robotsPath, robotsTxt, "utf-8");
  console.log(`[sitemap-generator] Updated ${robotsPath}`);
}

run().catch((err) => {
  console.error("[sitemap-generator] Fatal error:", err);
  process.exit(0); // Never break build on sitemap generator failure
});
