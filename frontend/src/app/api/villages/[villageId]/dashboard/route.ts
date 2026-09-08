import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ villageId: string }> }
) {
  try {
    const { villageId } = await params;
    const vilId = Number(villageId);

    if (isNaN(vilId)) {
      return NextResponse.json(
        { error: "Invalid village ID parameter" },
        { status: 400 }
      );
    }

    const { data: info, error } = await supabase
      .from("villages")
      .select("name, districts(name)")
      .eq("id", vilId)
      .single();

    if (error || !info) {
      return NextResponse.json(
        { error: "Kelurahan tidak ditemukan di database" },
        { status: 404 }
      );
    }

    const villageName = info.name;
    const districtName = (info.districts as any)?.name || "—";

    return NextResponse.json({
      village_id: vilId,
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
