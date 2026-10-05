import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Deteksi kelurahan berdasarkan koordinat klik peta.
 *
 * Versi sebelumnya memanggil Overpass API `is_in` untuk menentukan
 * kelurahan, yang memakan waktu 3–15 detik karena bergantung pada
 * server publik OSM. Sekarang, deteksi dilakukan sepenuhnya di
 * database Supabase menggunakan nearest-neighbor lookup terhadap
 * kolom center_lat/center_lon yang sudah terisi di tabel villages.
 *
 * Waktu respons: ~100ms (vs 3–15 detik sebelumnya).
 */

// Ambang batas jarak maksimum (dalam derajat, ~0.03 ≈ ~3.3km).
// Jika titik klik lebih jauh dari ini ke kelurahan terdekat,
// kemungkinan besar user mengklik area tanpa data (laut, dll).
const MAX_DISTANCE_DEG = 0.02;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Query parameters 'lat' and 'lng' are required" },
        { status: 400 }
      );
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return NextResponse.json(
        { error: "Query parameters 'lat' and 'lng' must be valid finite numbers" },
        { status: 400 }
      );
    }

    // Rentang geografis DKI Jakarta ketat (daratan utama saja, tanpa Kep. Seribu)
    if (latNum < -6.38 || latNum > -6.08 || lngNum < 106.68 || lngNum > 106.97) {
      return NextResponse.json(
        { error: "Koordinat berada di luar batas wilayah DKI Jakarta." },
        { status: 400 }
      );
    }

    // 1. Ambil semua kelurahan yang memiliki koordinat pusat dari database
    const { data: villages, error: dbError } = await supabase
      .from("villages")
      .select("id, name, center_lat, center_lon")
      .not("center_lat", "is", null)
      .not("center_lon", "is", null);

    if (dbError) {
      throw dbError;
    }

    if (!villages || villages.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data kelurahan dengan koordinat pusat di database." },
        { status: 500 }
      );
    }

    // 2. Cari kelurahan terdekat menggunakan jarak Euclidean
    //    (akurat untuk area kecil seperti Jakarta tanpa perlu PostGIS)
    let nearest: any = null;
    let minDist = Infinity;

    for (const v of villages) {
      const dLat = v.center_lat - latNum;
      const dLng = v.center_lon - lngNum;
      const dist = dLat * dLat + dLng * dLng;

      if (dist < minDist) {
        minDist = dist;
        nearest = v;
      }
    }

    const actualDist = Math.sqrt(minDist);

    if (!nearest || actualDist > MAX_DISTANCE_DEG) {
      return NextResponse.json(
        { error: "Koordinat berada di luar batas Kelurahan DKI Jakarta" },
        { status: 404 }
      );
    }

    // 4. Best-effort check fasilitas di cache (cepat, pure DB read)
    const titleCaseName = nearest.name
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (m: string) => m.toUpperCase());

    try {
      const { data: cacheData, error: cacheError } = await supabase
        .from("osm_facilities_cache")
        .select("facilities")
        .eq("village_name", titleCaseName)
        .maybeSingle();

      if (!cacheError && cacheData) {
        const facilities = cacheData.facilities || [];
        if (facilities.length === 0) {
          return NextResponse.json(
            { error: `Kelurahan '${nearest.name}' tidak memiliki fasilitas publik terdaftar di OpenStreetMap (0 fasilitas).` },
            { status: 400 }
          );
        }
      }
    } catch (cacheErr) {
      console.warn("Failed to check OSM facilities cache in detect route:", cacheErr);
    }

    return NextResponse.json({ id: nearest.id, name: nearest.name });
  } catch (error: any) {
    console.error("Detect Kelurahan Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
