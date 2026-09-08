import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client dengan SERVICE ROLE KEY — bypass Row Level Security.
 *
 * ATURAN KETAT:
 * - HANYA dipakai di server-side code (route handlers / API routes).
 * - JANGAN PERNAH di-import dari file "use client" atau apa pun yang
 *   bisa ikut ke-bundle ke browser.
 * - SUPABASE_SERVICE_ROLE_KEY di-set TANPA prefix NEXT_PUBLIC_, supaya
 *   Next.js tidak meng-inline-kannya ke kode client. Ambil dari
 *   Supabase Dashboard → Settings → API → service_role key.
 *
 * Dipakai untuk operasi tulis yang memang seharusnya cuma boleh
 * dilakukan server kalian sendiri: upsert ke osm_facilities_cache dan
 * update villages.center_lat/center_lon di
 * src/app/api/villages/facilities/route.ts.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    "WARNING: SUPABASE_SERVICE_ROLE_KEY belum di-set — write ke osm_facilities_cache/villages akan gagal (RLS menolak)."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-key",
  { auth: { persistSession: false } }
);
