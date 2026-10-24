import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServerClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { village_id, rating, comment } = body;

    // Server-side validation
    if (!village_id || typeof village_id !== "number") {
      return NextResponse.json({ error: "Invalid village_id" }, { status: 400 });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating harus bernilai 1 sampai 5" }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
      return NextResponse.json({ error: "Ulasan minimal 10 karakter" }, { status: 400 });
    }

    // Enforce verified identity from authenticated Supabase session to prevent display name & avatar spoofing
    const verifiedName = 
      user.user_metadata?.full_name || 
      user.user_metadata?.name || 
      (user.email ? user.email.split("@")[0] : null) || 
      "Warga Jakarta";

    const verifiedAvatar = 
      user.user_metadata?.avatar_url || 
      user.user_metadata?.picture || 
      null;

    const { error: dbError } = await supabase
      .from("reviews")
      .upsert(
        {
          village_id,
          user_id: user.id, // Enforce verified user id from token
          user_name: verifiedName,
          user_avatar: verifiedAvatar,
          rating: ratingNum,
          comment: comment.trim().slice(0, 1000),
        },
        { onConflict: "village_id,user_id" }
      );

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Ulasan berhasil disimpan" });
  } catch (error: any) {
    console.error("Reviews API POST Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient(token);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Row Level Security (RLS) handles authorization on deletion (user_id must match auth.uid())
    const { error: dbError } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Ulasan berhasil dihapus" });
  } catch (error: any) {
    console.error("Reviews API DELETE Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
