import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { queryOverpass } from "@/lib/overpass-server";
import {
  getFriendlyCategoryName,
  mapTagsToSectorAndCategory,
  toTitleCase,
import {
  getFriendlyCategoryName,
  mapTagsToSectorAndCategory,
  toTitleCase,
} from "@/lib/overpass";

// Basic In-Memory Rate Limiter Map (IP -> Timestamp array)
// Note: In serverless (Vercel), this only protects individual instances, 
// but it's enough to stop basic request flooding/DoS.
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Max 15 requests per minute per IP

export async function GET(request: Request) {
  try {
    // 0. Rate Limiting Check
    const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    
    if (ip !== "unknown-ip") {
      const userRequests = rateLimitMap.get(ip) || [];
      const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW_MS);
      
      if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        return NextResponse.json(
          { error: "Terlalu banyak permintaan (Rate Limit). Silakan tunggu beberapa saat lagi." },
          { status: 429 }
        );
      }
      
      recentRequests.push(now);
      rateLimitMap.set(ip, recentRequests);
      
      // Cleanup map to prevent memory leaks (keep only recent)
      if (rateLimitMap.size > 10000) rateLimitMap.clear();
    }

    const { searchParams } = new URL(request.url);
    const villageName = searchParams.get("name");

    if (!villageName) {
      return NextResponse.json(
        { error: "Query parameter 'name' is required" },
        { status: 400 }
      );
    }

    const cleanName = villageName
      .replace(/^kelurahan\s+/i, "")
      .trim();

    // Allowlist, bukan denylist: nama kelurahan cuma boleh huruf/spasi/.,'-,
    // maksimal 50 karakter. Nilai ini masuk langsung ke query Overpass di
    // bawah, jadi apa pun di luar pola ini ditolak — bukan dibersihin diam-diam.
    if (!/^[a-zA-Z\s.'-]{1,50}$/.test(cleanName)) {
      return NextResponse.json(
        { error: "Nama kelurahan tidak valid" },
        { status: 400 }
      );
    }

    const titleCaseName = toTitleCase(cleanName);

    let cachedFallback: any = null;

    // 1. Try cache lookup from Supabase first (fresh within 30 days)
    try {
      const { data: cacheData, error: cacheError } = await supabase
        .from("osm_facilities_cache")
        .select("facilities, center, updated_at")
        .eq("village_name", titleCaseName)
        .maybeSingle();

      if (!cacheError && cacheData) {
        cachedFallback = cacheData;
        const updatedAt = new Date(cacheData.updated_at).getTime();
        const now = new Date().getTime();
        const cacheAgeDays = (now - updatedAt) / (1000 * 60 * 60 * 24);

        if (cacheAgeDays < 30 && searchParams.get("nocache") !== "true") {
          return NextResponse.json({
            facilities: cacheData.facilities,
            center: cacheData.center,
            _cached: true,
          });
        }
      }
    } catch (cacheErr) {
      console.warn("Failed to check OSM facilities cache in Supabase:", cacheErr);
    }

    // 2. Try the permanent center stored on the village row (boundaries never
    //    change, so this skips a full relation query to Overpass entirely).
    let center: [number, number] | null = null;
    try {
      const { data: villageRow } = await supabase
        .from("villages")
        .select("center_lat, center_lon")
        .eq("name", cleanName.toUpperCase())
        .maybeSingle();

      if (villageRow?.center_lat && villageRow?.center_lon) {
        center = [villageRow.center_lat, villageRow.center_lon];
      }
    } catch (villageErr) {
      console.warn("Failed to read permanent village center:", villageErr);
    }

    // 3. If no stored center, fetch it from Overpass once and persist it.
    if (!center) {
      const relationQuery = `
        [out:json][timeout:8];
        relation["name"="${titleCaseName}"]["admin_level"~"7|8"];
        out center;
      `;

      try {
        const relationData = await queryOverpass(relationQuery);
        const relationEl = (relationData.elements || []).find((el: any) => el.type === "relation" && el.center);
        if (relationEl && relationEl.center) {
          center = [relationEl.center.lat, relationEl.center.lon];

          supabaseAdmin
            .from("villages")
            .update({ center_lat: center[0], center_lon: center[1] })
            .eq("name", cleanName.toUpperCase())
            .then(({ error }) => {
              if (error) console.warn("Failed to persist village center:", error);
            });
        }
      } catch (relationErr) {
        console.warn("Failed to fetch relation center for", titleCaseName, relationErr);
      }
    }

    // 4. Query facilities using whichever center we ended up with.
    let query = "";
    if (center) {
      const [lat, lon] = center;
      query = `
        [out:json][timeout:25];
        (
          nwr["amenity"~"school|kindergarten|college|university|library"](around:900,${lat},${lon});
          nwr["amenity"~"clinic|hospital"](around:900,${lat},${lon});
          nwr["leisure"~"park|playground|sports_centre"](around:900,${lat},${lon});
          nwr["amenity"~"fire_station|police|townhall|community_centre|post_office"](around:900,${lat},${lon});
          
          /* New Optimized Exact Match Queries */
          nwr["amenity"="place_of_worship"](around:900,${lat},${lon});
          nwr["amenity"="marketplace"](around:900,${lat},${lon});
          node["highway"="bus_stop"](around:900,${lat},${lon});
          nwr["amenity"="bus_station"](around:900,${lat},${lon});
          nwr["public_transport"="station"](around:900,${lat},${lon});
          nwr["railway"="station"](around:900,${lat},${lon});
        );
        out center;
      `;
    } else {
      query = `
        [out:json][timeout:30];
        area["name"="${titleCaseName}"]["admin_level"~"7|8"]->.a;
        (
          nwr["amenity"~"school|kindergarten|college|university|library"](area.a);
          nwr["amenity"~"clinic|hospital"](area.a);
          nwr["leisure"~"park|playground|sports_centre"](area.a);
          nwr["amenity"~"fire_station|police|townhall|community_centre|post_office"](area.a);
          
          nwr["amenity"="place_of_worship"](area.a);
          nwr["amenity"="marketplace"](area.a);
          node["highway"="bus_stop"](area.a);
          nwr["amenity"="bus_station"](area.a);
          nwr["public_transport"="station"](area.a);
          nwr["railway"="station"](area.a);
        );
        out center;
      `;
    }

    try {
      const data = await queryOverpass(query, 25000);
      
      
      if (!data.elements) {
        return NextResponse.json({ facilities: [], center });
      }
      const facilities: any[] = [];

      data.elements.forEach((el: any) => {
        if (el.type === "relation" && el.center) {
          center = [el.center.lat, el.center.lon];
          return;
        }

        const tags = el.tags || {};
        const name = tags.name || tags.operator || `${getFriendlyCategoryName(tags)} (Tanpa Nama)`;
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;

        if (!lat || !lon) return;

        const { sector, category } = mapTagsToSectorAndCategory(tags);

        facilities.push({
          id: el.id,
          name,
          lat,
          lon,
          sector,
          category,
          amenityType: tags.amenity || tags.leisure || tags.waterway || tags.highway || tags.railway || "unknown",
        });
      });

      // 5. Cache the result in Supabase asynchronously
      try {
        await supabaseAdmin.from("osm_facilities_cache").upsert({
          village_name: titleCaseName,
          facilities,
          center,
          updated_at: new Date().toISOString()
        }, { onConflict: "village_name" });
      } catch (cacheErr) {
        console.warn("Failed to write OSM facilities cache to Supabase:", cacheErr);
      }

      return NextResponse.json({ facilities, center });
    } catch (overpassErr: any) {
      console.warn("Overpass query failed, checking cached fallback:", overpassErr);
      if (cachedFallback) {
        return NextResponse.json({
          facilities: cachedFallback.facilities,
          center: cachedFallback.center,
          _cached: true,
          _stale: true,
        });
      }
      // No cache available — return empty facilities with center so the
      // dashboard map can still render (just without markers).
      return NextResponse.json({
        facilities: [],
        center,
        _overpass_down: true,
      });
    }
  } catch (error: any) {
    console.error("Facilities API Route Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server. Silakan coba beberapa saat lagi." },
      { status: 500 }
    );
  }
}
