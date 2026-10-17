import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export const alt = "JakScope - Peta Fasilitas Publik Kelurahan";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
}

export default async function Image({
  params,
}: {
  params: Promise<{ villageId: string }>;
}) {
  const { villageId } = await params;
  const decodedSlug = decodeURIComponent(villageId);
  const cleanName = toTitleCase(decodedSlug.replace(/-/g, " "));

  let districtName = "DKI Jakarta";
  let facilityCount = null;

  try {
    // Lookup real village details and cache
    const { data: village } = await supabase
      .from("villages")
      .select("id, name, districts(name)")
      .ilike("name", cleanName)
      .maybeSingle();

    if (village) {
      if ((village.districts as any)?.name) {
        districtName = `Kecamatan ${(village.districts as any).name}`;
      }

      // Check facility count from cache
      const { data: cache } = await supabase
        .from("osm_facilities_cache")
        .select("facilities")
        .eq("village_name", village.name)
        .maybeSingle();

      if (cache && Array.isArray(cache.facilities)) {
        facilityCount = cache.facilities.length;
      }
    }
  } catch (err) {
    // Graceful fallback to slug
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0F172A",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(56, 189, 248, 0.2) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 45%)",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284c7, #10b981)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                fontWeight: "900",
                color: "#ffffff",
              }}
            >
              J
            </div>
            <span style={{ fontSize: "28px", fontWeight: "800" }}>
              Jak<span style={{ color: "#38BDF8" }}>Scope</span>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              fontSize: "16px",
              color: "#34D399",
              fontWeight: "600",
            }}
          >
            <span>📍 Peta Fasilitas Publik Terverifikasi</span>
          </div>
        </div>

        {/* Center Main Card Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "22px",
              color: "#38BDF8",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "8px",
            }}
          >
            {districtName} · DKI Jakarta
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: "1.1",
              margin: 0,
              color: "#F8FAFC",
              letterSpacing: "-1.5px",
            }}
          >
            Kelurahan {cleanName}
          </h1>

          <p
            style={{
              fontSize: "24px",
              color: "#94A3B8",
              marginTop: "18px",
              lineHeight: "1.4",
            }}
          >
            {facilityCount !== null
              ? `Memiliki ${facilityCount} fasilitas publik terdata (Kesehatan, Sekolah, RPTRA, Transportasi, & Ibadah)`
              : "Pantau sebaran fasilitas kesehatan, sekolah, RPTRA, dan rute navigasi real-time."}
          </p>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(148, 163, 184, 0.15)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ fontSize: "17px", color: "#CBD5E1" }}>
              🏥 Puskesmas & RS
            </span>
            <span style={{ fontSize: "17px", color: "#CBD5E1" }}>
              🏫 Sekolah & Kampus
            </span>
            <span style={{ fontSize: "17px", color: "#CBD5E1" }}>
              🌳 Taman & RPTRA
            </span>
            <span style={{ fontSize: "17px", color: "#CBD5E1" }}>
              🚌 Transportasi
            </span>
          </div>

          <span
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#38BDF8",
            }}
          >
            jakscope.my.id
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
