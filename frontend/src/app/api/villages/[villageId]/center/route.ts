import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/villages/[villageId]/center
 * 
 * Returns just the center coordinates for a village.
 * Used as a fallback when Overpass is down so the map can still render.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ villageId: string }> }
) {
  try {
    const { villageId } = await params;
    const decodedVillageId = decodeURIComponent(villageId);
    const isNumeric = /^\d+$/.test(decodedVillageId);

    let villageRow;

    if (isNumeric) {
      const { data } = await supabase
        .from("villages")
        .select("center_lat, center_lon")
        .eq("id", Number(decodedVillageId))
        .maybeSingle();
      villageRow = data;
    } else {
      const nameQuery = decodedVillageId.replace(/-/g, " ");
      const { data } = await supabase
        .from("villages")
        .select("center_lat, center_lon")
        .ilike("name", nameQuery)
        .maybeSingle();
      villageRow = data;
    }

    if (villageRow?.center_lat && villageRow?.center_lon) {
      return NextResponse.json({
        center: [villageRow.center_lat, villageRow.center_lon],
      });
    }

    return NextResponse.json({ center: null });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
