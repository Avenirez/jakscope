/**
 * Pre-warm script for the OSM facilities cache.
 *
 * Run this ONCE before publishing the site (and again periodically, e.g.
 * weekly via a cron job) so that real visitors never have to wait on a
 * live Overpass API call — they always hit a warm Supabase cache instead.
 *
 * Usage:
 *   cd frontend
 *   npm install        # make sure devDependencies (tsx, dotenv) are installed
 *   npm run prewarm-osm
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be
 * set in frontend/.env.local. Pakai service role key (bukan anon key) —
 * osm_facilities_cache dan villages tidak lagi bisa ditulis publik sejak
 * fix RLS (lihat database/fix_cache_and_villages_rls.sql), jadi script
 * ini butuh akses yang sama seperti API route (supabase-admin.ts).
 */
 
import "dotenv/config";
import { config as loadEnvLocal } from "dotenv";
loadEnvLocal({ path: ".env.local" });
 
import { createClient } from "@supabase/supabase-js";
 
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://urezyxwovgycpzcfvwko.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "your-supabase-service-role-key";
 
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}
 
// Service role: script ini jalan sebagai trusted admin task lokal/CI,
// bukan kode yang ke-ship ke browser, jadi aman pakai key ini langsung.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];
 
const DELAY_BETWEEN_VILLAGES_MS = 1500;
 
function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
}
 
function getFriendlyCategoryName(tags: any): string {
  if (tags.amenity === "school" || tags.amenity === "kindergarten") return "Sekolah";
  if (tags.amenity === "college" || tags.amenity === "university") return "Universitas/Perguruan Tinggi";
  if (tags.amenity === "library") return "Perpustakaan";
  if (tags.amenity === "clinic" || tags.amenity === "hospital") return "Puskesmas/Klinik/Rumah Sakit";
  if (tags.leisure === "park" || tags.leisure === "playground") return "Taman & RPTRA";
  if (tags.leisure === "sports_centre") return "Fasilitas Olahraga";
  if (tags.amenity === "fire_station") return "Pos Pemadam Kebakaran";
  if (tags.amenity === "police") return "Pos Polisi";
  if (tags.amenity === "townhall") return "Kantor Pemerintahan";
  if (tags.amenity === "community_centre") return "Balai Warga/RW";
  if (tags.amenity === "post_office") return "Kantor Pos";
  if (tags.highway === "bus_stop" || tags.amenity === "bus_station" || tags.public_transport === "station") return "Halte/Terminal Bus";
  if (tags.railway === "station") return "Stasiun Kereta";
  if (tags.amenity === "place_of_worship") return "Tempat Ibadah";
  if (tags.amenity === "marketplace") return "Pasar Tradisional";
  return "Fasilitas Publik";
}
 
function mapTagsToSectorAndCategory(tags: any) {
  const category = getFriendlyCategoryName(tags);
  if (tags.amenity === "clinic" || tags.amenity === "hospital") {
    return { sector: "health", category };
  }
  if (["school", "kindergarten", "college", "university", "library"].includes(tags.amenity)) {
    return { sector: "education", category };
  }
  if (["park", "playground", "sports_centre"].includes(tags.leisure)) {
    return { sector: "recreation", category };
  }
  if (tags.highway === "bus_stop" || tags.amenity === "bus_station" || tags.public_transport === "station" || tags.railway === "station") {
    return { sector: "transport", category };
  }
  if (tags.amenity === "place_of_worship") {
    return { sector: "worship", category };
  }
  if (tags.amenity === "marketplace") {
    return { sector: "market", category };
  }
  return { sector: "public_services", category };
}
 
async function queryOverpass(query: string, timeoutMs = 20000): Promise<any> {
  const controllers = OVERPASS_MIRRORS.map(() => new AbortController());
  const attempts = OVERPASS_MIRRORS.map((url, i) =>
    fetch(url, {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "JakScope/1.0 (contact@jakscope.org)",
      },
      signal: controllers[i].signal,
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Mirror ${url} returned ${res.status}`);
      return res.json();
    })
  );
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Overpass timeout")), timeoutMs)
  );
  try {
    const result = await Promise.race([Promise.any(attempts), timeoutPromise]);
    controllers.forEach((c) => c.abort());
    return result;
  } catch (err: any) {
    controllers.forEach((c) => c.abort());
    throw err;
  }
}
 
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
async function prewarmVillage(villageName: string): Promise<"ok" | "skip" | "fail"> {
  const titleCaseName = toTitleCase(villageName);
 
  const { data: existing } = await supabase
    .from("osm_facilities_cache")
    .select("updated_at")
    .eq("village_name", titleCaseName)
    .maybeSingle();
 
  if (existing) {
    const ageDays = (Date.now() - new Date(existing.updated_at).getTime()) / 86400000;
    if (ageDays < 7) {
      return "skip";
    }
  }
 
  try {
    let center: [number, number] | null = null;

    // 1. Check permanent center from villages table first
    const { data: vRow } = await supabase
      .from("villages")
      .select("center_lat, center_lon")
      .eq("name", villageName.toUpperCase())
      .maybeSingle();

    if (vRow?.center_lat && vRow?.center_lon) {
      center = [vRow.center_lat, vRow.center_lon];
    } else {
      const relationQuery = `
        [out:json][timeout:10];
        relation["name"="${titleCaseName}"]["admin_level"~"7|8"];
        out center;
      `;
      try {
        const relationData = await queryOverpass(relationQuery);
        const relationEl = (relationData.elements || []).find((el: any) => el.type === "relation" && el.center);
        if (relationEl?.center) {
          center = [relationEl.center.lat, relationEl.center.lon];
          const { error: centerError } = await supabase
            .from("villages")
            .update({ center_lat: center[0], center_lon: center[1] })
            .eq("name", villageName.toUpperCase());
          if (centerError) {
            console.warn(`  ! Gagal simpan center untuk ${titleCaseName}:`, centerError.message);
          }
        }
      } catch (relErr: any) {
        console.warn(`  ! Query relation gagal untuk ${titleCaseName}:`, relErr.message);
      }
    }

    if (!center) {
      console.warn(`  ! No center found for ${titleCaseName}, skipping facilities fetch`);
      return "fail";
    }
 
    const [lat, lon] = center;
    const facilitiesQuery = `
      [out:json][timeout:25];
      (
        nwr["amenity"~"school|kindergarten|college|university|library"](around:900,${lat},${lon});
        nwr["amenity"~"clinic|hospital"](around:900,${lat},${lon});
        nwr["leisure"~"park|playground|sports_centre"](around:900,${lat},${lon});
        nwr["amenity"~"fire_station|police|townhall|community_centre|post_office"](around:900,${lat},${lon});
        
        nwr["amenity"="place_of_worship"](around:900,${lat},${lon});
        nwr["amenity"="marketplace"](around:900,${lat},${lon});
        node["highway"="bus_stop"](around:900,${lat},${lon});
        nwr["amenity"="bus_station"](around:900,${lat},${lon});
        nwr["public_transport"="station"](around:900,${lat},${lon});
        nwr["railway"="station"](around:900,${lat},${lon});
      );
      out center;
    `;
    const data = await queryOverpass(facilitiesQuery);
    const facilities: any[] = [];
 
    (data.elements || []).forEach((el: any) => {
      const tags = el.tags || {};
      const name = tags.name || tags.operator || `${getFriendlyCategoryName(tags)} (Tanpa Nama)`;
      const flat = el.lat ?? el.center?.lat;
      const flon = el.lon ?? el.center?.lon;
      if (!flat || !flon) return;
      const { sector, category } = mapTagsToSectorAndCategory(tags);
      facilities.push({
        id: el.id,
        name,
        lat: flat,
        lon: flon,
        sector,
        category,
        amenityType: tags.amenity || tags.leisure || tags.highway || tags.railway || "unknown",
      });
    });
 
    const { error: cacheError } = await supabase.from("osm_facilities_cache").upsert(
      {
        village_name: titleCaseName,
        facilities,
        center,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "village_name" }
    );
    if (cacheError) {
      console.error(`  ✗ Gagal simpan cache untuk ${titleCaseName}:`, cacheError.message);
      return "fail";
    }
 
    console.log(`  ✓ ${titleCaseName}: ${facilities.length} fasilitas`);
    return "ok";
  } catch (err: any) {
    console.error(`  ✗ ${titleCaseName}: ${err.message || err}`);
    return "fail";
  }
}
 
async function main() {
  console.log("Mengambil seluruh daftar kelurahan...");
  const { data: villages, error } = await supabase
    .from("villages")
    .select("name")
    .order("name");
 
  if (error) {
    console.error("Gagal mengambil daftar kelurahan:", error);
    process.exit(1);
  }
 
  const targets = villages || [];
  console.log(`Ditemukan ${targets.length} kelurahan untuk di-prewarm.\n`);
 
  let ok = 0, skip = 0, fail = 0;
  for (const v of targets) {
    console.log(`[${ok + skip + fail + 1}/${targets.length}] ${v.name}`);
    const result = await prewarmVillage(v.name);
    if (result === "ok") ok++;
    else if (result === "skip") { skip++; console.log("  → sudah fresh di cache, dilewati"); }
    else fail++;
    await sleep(DELAY_BETWEEN_VILLAGES_MS);
  }
 
  console.log(`\nSelesai. Berhasil: ${ok}, Dilewati (sudah cache): ${skip}, Gagal: ${fail}`);
}
 
main();
