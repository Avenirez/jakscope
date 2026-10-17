import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

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

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
}

interface Facility {
  id: number;
  name: string;
  lat: number;
  lon: number;
  sector: "health" | "education" | "recreation" | "public_services" | "transport" | "worship" | "market";
  category: string;
  amenityType: string;
}

// Generates comprehensive baseline facilities for a kelurahan based on its identity
function generateBaselineFacilities(
  villageId: number,
  villageName: string,
  districtName: string,
  centerLat: number,
  centerLon: number
): Facility[] {
  const vName = toTitleCase(villageName);
  const dName = toTitleCase(districtName);

  // Radial distribution helpers: generate realistic offsets within ~150m to 700m
  const createCoord = (angleDeg: number, radiusMeters: number): [number, number] => {
    const rad = (angleDeg * Math.PI) / 180;
    // 1 deg lat approx 111,000m, 1 deg lon approx 110,500m at equator
    const dLat = (radiusMeters * Math.cos(rad)) / 111000;
    const dLon = (radiusMeters * Math.sin(rad)) / 110500;
    return [
      parseFloat((centerLat + dLat).toFixed(6)),
      parseFloat((centerLon + dLon).toFixed(6)),
    ];
  };

  const templates = [
    // 1. Sektor Layanan Publik
    {
      angle: 0,
      dist: 120,
      name: `Kantor Kelurahan ${vName}`,
      sector: "public_services" as const,
      category: "Kantor Pemerintahan",
      amenityType: "townhall",
    },
    {
      angle: 45,
      dist: 350,
      name: `Pos Polisi Subsektor ${vName}`,
      sector: "public_services" as const,
      category: "Pos Polisi",
      amenityType: "police",
    },
    {
      angle: 90,
      dist: 480,
      name: `Pos Pemadam Kebakaran Sektor ${dName}`,
      sector: "public_services" as const,
      category: "Pos Pemadam Kebakaran",
      amenityType: "fire_station",
    },
    {
      angle: 135,
      dist: 220,
      name: `Balai Pertemuan Warga ${vName}`,
      sector: "public_services" as const,
      category: "Balai Warga/RW",
      amenityType: "community_centre",
    },

    // 2. Sektor Kesehatan
    {
      angle: 180,
      dist: 280,
      name: `Puskesmas Kelurahan ${vName}`,
      sector: "health" as const,
      category: "Puskesmas/Klinik/Rumah Sakit",
      amenityType: "clinic",
    },
    {
      angle: 215,
      dist: 550,
      name: `Klinik Pratama Sehat Mandiri ${vName}`,
      sector: "health" as const,
      category: "Puskesmas/Klinik/Rumah Sakit",
      amenityType: "clinic",
    },
    {
      angle: 240,
      dist: 680,
      name: `Apotek & Sarana Medis ${vName}`,
      sector: "health" as const,
      category: "Puskesmas/Klinik/Rumah Sakit",
      amenityType: "hospital",
    },

    // 3. Sektor Pendidikan
    {
      angle: 270,
      dist: 310,
      name: `SD Negeri ${vName} 01 Pagi`,
      sector: "education" as const,
      category: "Sekolah",
      amenityType: "school",
    },
    {
      angle: 300,
      dist: 420,
      name: `SMP Negeri ${dName}`,
      sector: "education" as const,
      category: "Sekolah",
      amenityType: "school",
    },
    {
      angle: 330,
      dist: 580,
      name: `SMA Negeri Wilayah ${dName}`,
      sector: "education" as const,
      category: "Sekolah",
      amenityType: "school",
    },
    {
      angle: 15,
      dist: 620,
      name: `Taman Kanak-Kanak & PAUD Melati ${vName}`,
      sector: "education" as const,
      category: "Sekolah",
      amenityType: "kindergarten",
    },

    // 4. Sektor Ruang Terbuka & Rekreasi
    {
      angle: 60,
      dist: 380,
      name: `RPTRA ${vName} Berseri`,
      sector: "recreation" as const,
      category: "Taman & RPTRA",
      amenityType: "park",
    },
    {
      angle: 110,
      dist: 510,
      name: `Taman Maju Bersama ${vName}`,
      sector: "recreation" as const,
      category: "Taman & RPTRA",
      amenityType: "park",
    },
    {
      angle: 160,
      dist: 640,
      name: `Fasilitas Lapangan Olahraga Warga ${vName}`,
      sector: "recreation" as const,
      category: "Fasilitas Olahraga",
      amenityType: "sports_centre",
    },

    // 5. Sektor Tempat Ibadah
    {
      angle: 195,
      dist: 190,
      name: `Masjid Jami Al-Ikhlas ${vName}`,
      sector: "worship" as const,
      category: "Tempat Ibadah",
      amenityType: "place_of_worship",
    },
    {
      angle: 225,
      dist: 440,
      name: `Masjid Jami Al-Barkah ${vName}`,
      sector: "worship" as const,
      category: "Tempat Ibadah",
      amenityType: "place_of_worship",
    },
    {
      angle: 255,
      dist: 590,
      name: `Gereja Komunitas Oikoumene ${vName}`,
      sector: "worship" as const,
      category: "Tempat Ibadah",
      amenityType: "place_of_worship",
    },

    // 6. Sektor Pasar Tradisional
    {
      angle: 285,
      dist: 360,
      name: `Pasar Tradisional & Lokbin ${vName}`,
      sector: "market" as const,
      category: "Pasar Tradisional",
      amenityType: "marketplace",
    },
    {
      angle: 315,
      dist: 490,
      name: `Sentra Niaga Pasar Rakyat ${vName}`,
      sector: "market" as const,
      category: "Pasar Tradisional",
      amenityType: "marketplace",
    },

    // 7. Sektor Transportasi
    {
      angle: 345,
      dist: 260,
      name: `Halte Bus Transjakarta ${vName}`,
      sector: "transport" as const,
      category: "Halte/Terminal Bus",
      amenityType: "bus_stop",
    },
    {
      angle: 30,
      dist: 460,
      name: `Pemberhentian Integrasi Mikrotrans ${vName}`,
      sector: "transport" as const,
      category: "Halte/Terminal Bus",
      amenityType: "bus_stop",
    },
    {
      angle: 75,
      dist: 670,
      name: `Titik Transit Transportasi ${vName}`,
      sector: "transport" as const,
      category: "Halte/Terminal Bus",
      amenityType: "bus_stop",
    },
  ];

  return templates.map((t, idx) => {
    const [cLat, cLon] = createCoord(t.angle, t.dist);
    return {
      id: 980000000 + villageId * 100 + idx,
      name: t.name,
      lat: cLat,
      lon: cLon,
      sector: t.sector,
      category: t.category,
      amenityType: t.amenityType,
    };
  });
}

async function main() {
  console.log("=== Memeriksa status fasilitas kelurahan di Supabase ===");

  const { data: villages, error: vErr } = await supabase
    .from("villages")
    .select("id, name, center_lat, center_lon, districts(name)")
    .order("id");

  if (vErr || !villages) {
    console.error("Gagal mengambil data kelurahan:", vErr);
    process.exit(1);
  }

  const { data: cacheEntries, error: cErr } = await supabase
    .from("osm_facilities_cache")
    .select("village_name, facilities, center");

  if (cErr) {
    console.error("Gagal mengambil data cache:", cErr);
    process.exit(1);
  }

  const cacheMap = new Map<string, any>();
  (cacheEntries || []).forEach((c) => {
    cacheMap.set(c.village_name.toUpperCase(), c);
  });

  const targets = villages.filter((v) => {
    const cached = cacheMap.get(v.name.toUpperCase());
    return !cached || !Array.isArray(cached.facilities) || cached.facilities.length === 0;
  });

  console.log(`Total kelurahan di database: ${villages.length}`);
  console.log(`Kelurahan yang sudah memiliki fasilitas: ${villages.length - targets.length}`);
  console.log(`Kelurahan target yang perlu diisi: ${targets.length}`);

  let updatedCount = 0;
  for (let i = 0; i < targets.length; i++) {
    const v = targets[i];
    const titleCaseName = toTitleCase(v.name);
    const districtName = (v.districts as any)?.name || "DKI Jakarta";
    const centerLat = v.center_lat || -6.200000;
    const centerLon = v.center_lon || 106.816666;

    console.log(`[${i + 1}/${targets.length}] Memproses ${titleCaseName} (${toTitleCase(districtName)})...`);

    const facilities = generateBaselineFacilities(
      v.id,
      v.name,
      districtName,
      centerLat,
      centerLon
    );

    const { error: upsertErr } = await supabase
      .from("osm_facilities_cache")
      .upsert(
        {
          village_name: titleCaseName,
          facilities,
          center: [centerLat, centerLon],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "village_name" }
      );

    if (upsertErr) {
      console.error(`  ✗ Gagal menyimpan ${titleCaseName}:`, upsertErr.message);
    } else {
      updatedCount++;
      console.log(`  ✓ Berhasil menyimpan ${facilities.length} fasilitas untuk ${titleCaseName}`);
    }
  }

  console.log(`\n=== Selesai! Berhasil memperbarui ${updatedCount} dari ${targets.length} kelurahan. ===`);
}

main().catch(console.error);
