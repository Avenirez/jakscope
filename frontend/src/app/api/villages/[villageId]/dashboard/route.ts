import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ villageId: string }> }
) {
  try {
    const { villageId } = await params;
    const decodedVillageId = decodeURIComponent(villageId);
    const isNumeric = /^\d+$/.test(decodedVillageId);

    let info;
    let error;

    if (isNumeric) {
      const vilId = Number(decodedVillageId);
      ({ data: info, error } = await supabase
        .from("villages")
        .select("id, name, districts(name)")
        .eq("id", vilId)
        .single());
    } else {
      const nameQuery = decodedVillageId.replace(/-/g, ' ');
      ({ data: info, error } = await supabase
        .from("villages")
        .select("id, name, districts(name)")
        .ilike("name", nameQuery)
        .single());
    }

    if (error || !info) {
      return NextResponse.json(
        { error: "Kelurahan tidak ditemukan di database" },
        { status: 404 }
      );
    }

    const villageName = info.name;
    const districtName = (info.districts as any)?.name || "—";

    return NextResponse.json({
      village_id: info.id,
      village_name: villageName,
      district_name: districtName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
