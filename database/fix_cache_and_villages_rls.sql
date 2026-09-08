-- Fix RLS Policies for osm_facilities_cache and villages
-- Jalankan di Supabase SQL Editor.

-- 1) Tutup celah public write di cache fasilitas.
--    Read tetap publik — "Public read osm_facilities_cache" dari
--    migration_cache.sql tidak perlu diubah, datanya memang open data.
DROP POLICY IF EXISTS "Public insert osm_facilities_cache" ON osm_facilities_cache;
DROP POLICY IF EXISTS "Public update osm_facilities_cache" ON osm_facilities_cache;

-- 2) villages: sengaja TIDAK ditambah policy UPDATE publik baru.
--    Menambah policy publik di sini akan membuka celah yang persis sama
--    seperti osm_facilities_cache di atas.
