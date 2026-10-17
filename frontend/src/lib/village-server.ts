import { supabase } from "@/lib/supabase";
import type { Facility } from "@/lib/overpass";

export interface VillageDetail {
  village_id: number;
  village_name: string;
  district_name: string;
  facilities: Facility[];
  center: [number, number] | null;
  updated_at: string | null;
  ratingAverage: number | null;
  ratingCount: number;
  sectorCounts: {
    health: number;
    education: number;
    recreation: number;
    transport: number;
    public_services: number;
    worship: number;
    market: number;
  };
}

export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
}

export async function getVillageDetailsServer(villageParam: string): Promise<VillageDetail | null> {
  const decoded = decodeURIComponent(villageParam).trim();
  const isNumeric = /^\d+$/.test(decoded);

  let village: any = null;

  if (isNumeric) {
    const { data } = await supabase
      .from("villages")
      .select("id, name, districts(name)")
      .eq("id", Number(decoded))
      .maybeSingle();
    village = data;
  } else {
    const nameQuery = decoded.replace(/-/g, " ");
    const { data } = await supabase
      .from("villages")
      .select("id, name, districts(name)")
      .ilike("name", nameQuery)
      .maybeSingle();
    village = data;
  }

  if (!village) return null;

  const villageName = toTitleCase(village.name);
  const districtName = toTitleCase((village.districts as any)?.name || "DKI Jakarta");

  // Fetch facilities & center from cache
  const { data: cacheData } = await supabase
    .from("osm_facilities_cache")
    .select("facilities, center, updated_at")
    .ilike("village_name", village.name)
    .maybeSingle();

  const facilities: Facility[] = Array.isArray(cacheData?.facilities)
    ? cacheData.facilities
    : [];
  const center: [number, number] | null = Array.isArray(cacheData?.center)
    ? (cacheData.center as [number, number])
    : null;

  // Fetch reviews count & rating
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("village_id", village.id);

  const reviewList = reviews || [];
  const ratingCount = reviewList.length;
  const ratingAverage =
    ratingCount > 0
      ? Number(
          (
            reviewList.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
            ratingCount
          ).toFixed(1)
        )
      : null;

  // Calculate sector counts
  const sectorCounts = {
    health: facilities.filter((f) => f.sector === "health").length,
    education: facilities.filter((f) => f.sector === "education").length,
    recreation: facilities.filter((f) => f.sector === "recreation").length,
    transport: facilities.filter((f) => f.sector === "transport").length,
    public_services: facilities.filter((f) => f.sector === "public_services").length,
    worship: facilities.filter((f) => f.sector === "worship").length,
    market: facilities.filter((f) => f.sector === "market").length,
  };

  return {
    village_id: village.id,
    village_name: villageName,
    district_name: districtName,
    facilities,
    center,
    updated_at: cacheData?.updated_at || null,
    ratingAverage,
    ratingCount,
    sectorCounts,
  };
}
