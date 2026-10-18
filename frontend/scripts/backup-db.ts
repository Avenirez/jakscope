import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Load .env.local if present
const envPath = path.resolve(process.cwd(), ".env.local");
let env: Record<string, string> = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
      }
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "https://urezyxwovgycpzcfvwko.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || "your-supabase-service-role-key";

if (typeof (globalThis as any).WebSocket === "undefined") {
  (globalThis as any).WebSocket = class {};
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
  if (typeof val === "number") return val.toString();
  if (typeof val === "object") {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

export async function runBackup(outputFilePath?: string) {
  const dateStr = new Date().toISOString().split("T")[0];
  const targetFile = outputFilePath || path.resolve(process.cwd(), `jakscope-backup-${dateStr}.sql`);

  console.log(`Starting Supabase backup for project: ${SUPABASE_URL}`);
  const stream = fs.createWriteStream(targetFile, { encoding: "utf-8" });

  stream.write(`-- JakScope Database Automated Backup\n`);
  stream.write(`-- Generated: ${new Date().toISOString()}\n\n`);
  stream.write(`SET client_encoding = 'UTF8';\n`);
  stream.write(`SET standard_conforming_strings = on;\n\n`);

  const tables = ["districts", "villages", "reviews", "osm_facilities_cache"];

  for (const tableName of tables) {
    console.log(`Exporting table ${tableName}...`);
    stream.write(`-- Table: ${tableName}\n`);

    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    let totalRows = 0;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error(`Error querying ${tableName}:`, error.message);
        break;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      totalRows += data.length;

      for (const row of data) {
        const columns = Object.keys(row).map((k) => `"${k}"`).join(", ");
        const values = Object.values(row).map(escapeSqlValue).join(", ");
        stream.write(`INSERT INTO "${tableName}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`);
      }

      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log(`  -> Exported ${totalRows} rows from ${tableName}.`);
    stream.write(`\n`);
  }

  stream.end();
  console.log(`Backup completed successfully! Saved to: ${targetFile}`);
  const stats = fs.statSync(targetFile);
  console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
}

if (require.main === module || process.argv[1]?.includes("backup-db")) {
  runBackup().catch((err) => {
    console.error("Backup failed:", err);
    process.exit(1);
  });
}
