export interface Facility {
  id: number;
  name: string;
  lat: number;
  lon: number;
  sector: "health" | "education" | "recreation" | "public_services" | "transport" | "worship" | "market";
  category: string; // e.g., 'Sekolah', 'Puskesmas', 'Taman', 'Pos Damkar'
  amenityType: string;
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
}

export interface FetchFacilitiesResult {
  facilities: Facility[];
  center: [number, number] | null;
}

export async function fetchFacilitiesFromOSM(villageName: string): Promise<FetchFacilitiesResult> {
  const response = await fetch(`/api/villages/facilities?name=${encodeURIComponent(villageName)}`);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Gagal memuat data dari OpenStreetMap (Status ${response.status})`);
  }

  const data = await response.json();
  return {
    facilities: data.facilities || [],
    center: data.center || null,
  };
}

export function getFriendlyCategoryName(tags: any): string {
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

export function mapTagsToSectorAndCategory(tags: any): { 
  sector: "health" | "education" | "recreation" | "public_services" | "transport" | "worship" | "market"; 
  category: string 
} {
  const category = getFriendlyCategoryName(tags);

  // 1. Sektor Kesehatan (health)
  if (
    tags.amenity === "clinic" ||
    tags.amenity === "hospital"
  ) {
    return { sector: "health", category };
  }

  // 2. Sektor Pendidikan (education)
  if (
    tags.amenity === "school" ||
    tags.amenity === "kindergarten" ||
    tags.amenity === "college" ||
    tags.amenity === "university" ||
    tags.amenity === "library"
  ) {
    return { sector: "education", category };
  }

  // 3. Sektor Ruang Terbuka & Rekreasi (recreation)
  if (
    tags.leisure === "park" ||
    tags.leisure === "playground" ||
    tags.leisure === "sports_centre"
  ) {
    return { sector: "recreation", category };
  }

  // 4. Transportasi
  if (tags.highway === "bus_stop" || tags.amenity === "bus_station" || tags.public_transport === "station" || tags.railway === "station") {
    return { sector: "transport", category };
  }

  // 5. Tempat Ibadah
  if (tags.amenity === "place_of_worship") {
    return { sector: "worship", category };
  }

  // 6. Pasar Tradisional
  if (tags.amenity === "marketplace") {
    return { sector: "market", category };
  }

  // 7. Sektor Keamanan & Administrasi Publik (public_services)
  return { sector: "public_services", category };
}
