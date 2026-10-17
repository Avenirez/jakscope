import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Read .env.local manually
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: villages, error: vErr } = await supabase
    .from("villages")
    .select("id, name, center_lat, center_lon")
    .order("name");

  if (vErr) {
    console.error("Villages err:", vErr);
    return;
  }

  const { data: cache, error: cErr } = await supabase
    .from("osm_facilities_cache")
    .select("village_name, facilities, center, updated_at");

  if (cErr) {
    console.error("Cache err:", cErr);
    return;
  }

  console.log(`Total villages in table: ${villages.length}`);
  console.log(`Total cache entries: ${cache.length}`);

  const cacheMap = new Map();
  cache.forEach((item) => {
    cacheMap.set(item.village_name.toUpperCase(), item);
  });

  const zeroOrMissing: any[] = [];
  const validCache: any[] = [];
  const noCenter: string[] = [];

  villages.forEach((v) => {
    const vNameUpper = v.name.toUpperCase();
    const c = cacheMap.get(vNameUpper);
    const count = Array.isArray(c?.facilities) ? c.facilities.length : 0;
    if (!c || count === 0) {
      zeroOrMissing.push({
        id: v.id,
        name: v.name,
        cached: !!c,
        facilitiesCount: count,
        hasCenterInCache: !!c?.center,
        hasCenterInVillage: !!(v.center_lat && v.center_lon),
      });
    } else {
      validCache.push({ name: v.name, count });
    }
    if (!v.center_lat || !v.center_lon) {
      noCenter.push(v.name);
    }
  });

  console.log(`Kelurahan with valid facilities (>0): ${validCache.length}`);
  console.log(`Kelurahan with 0 facilities or no cache: ${zeroOrMissing.length}`);
  console.log("List of 0-facilities kelurahan:", JSON.stringify(zeroOrMissing, null, 2));
  console.log(`Kelurahan without center in villages table: ${noCenter.length}`);
}

run();
