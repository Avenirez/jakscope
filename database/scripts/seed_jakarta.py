import os
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
# Catatan Keamanan: Gunakan SUPABASE_SERVICE_ROLE_KEY untuk seeding jika RLS diaktifkan
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Please configure SUPABASE_URL and SUPABASE_KEY in your environment.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Complete list of 44 Kecamatan and 267 Kelurahan in DKI Jakarta, grouped by City
JAKARTA_DATA = {
    "JAKARTA PUSAT": {
        "GAMBIR": ["GAMBIR", "CIDENG", "PETOJO UTARA", "PETOJO SELATAN", "KEBON KELAPA", "DURI PULO"],
        "SENEN": ["SENEN", "KWITANG", "KENARI", "PASEBAN", "KRAMAT", "BUNGUR"],
        "SAWAH BESAR": ["PASAR BARU", "GUNUNG SAHARI UTARA", "MANGGA DUA SELATAN", "KARANG ANYAR", "KARTINI"],
        "KEMAYORAN": ["KEMAYORAN", "GUNUNG SAHARI SELATAN", "UTAN PANJANG", "HARAPAN MULYA", "KEBON KOSONG", "CEMPAKA BARU", "SUMUR BATU", "SERDANG"],
        "MENTENG": ["MENTENG", "PEGANGSAAN", "CIKINI", "GONDANGDIA", "KEBON SIRIH"],
        "TANAH ABANG": ["BENDUNGAN HILIR", "KARET TENGSIN", "KEBON MELATI", "KEBON KACANG", "KAMPUNG BALI", "PETAMBURAN", "GELORA"],
        "CEMPAKA PUTIH": ["CEMPAKA PUTIH TIMUR", "CEMPAKA PUTIH BARAT", "RAWASARI"],
        "JOHAR BARU": ["JOHAR BARU", "KAMPUNG RAWA", "GALUR", "TANAH TINGGI"]
    },
    "JAKARTA UTARA": {
        "PENJARINGAN": ["PENJARINGAN", "PEJAGALAN", "PLUIT", "KAPUK MUARA", "KAMAL MUARA"],
        "TANJUNG PRIOK": ["TANJUNG PRIOK", "KEBON BAWANG", "SUNGAI BAMBU", "PAPANGGO", "WARAKAS", "SUNTER AGUNG", "SUNTER JAYA"],
        "KOJA": ["KOJA", "LAGOA", "RAWA BADAK UTARA", "RAWA BADAK SELATAN", "TUGU UTARA", "TUGU SELATAN"],
        "CILINCING": ["CILINCING", "KALIBARU", "MARUNDA", "SEMPER TIMUR", "SEMPER BARAT", "SUKAPURA", "ROROTAN"],
        "PADEMANGAN": ["PADEMANGAN TIMUR", "PADEMANGAN BARAT", "ANCOL"],
        "KELAPA GADING": ["KELAPA GADING TIMUR", "KELAPA GADING BARAT", "PEGANGSAAN DUA"]
    },
    "JAKARTA BARAT": {
        "CENGKARENG": ["CENGKARENG BARAT", "CENGKARENG TIMUR", "DURI KOSAMBI", "KAPUK", "KEDAUNG KALI ANGKE", "RAWA BUAYA"],
        "GROGOL PETAMBURAN": ["GROGOL", "JELAMBAR", "JELAMBAR BARU", "WIJAYA KUSUMA", "TANJUNG DUREN UTARA", "TANJUNG DUREN SELATAN", "TOMANG"],
        "KALIDERES": ["KALIDERES", "SEMANAN", "PEGADUNGAN", "TEGAL ALUR", "KAMAL"],
        "KEBON JERUK": ["KEBON JERUK", "DURI KEPA", "KEDOYA UTARA", "KEDOYA SELATAN", "SUKABUMI UTARA", "SUKABUMI SELATAN", "KELAPA DUA"],
        "KEMBANGAN": ["KEMBANGAN UTARA", "KEMBANGAN SELATAN", "MERUYA UTARA", "MERUYA SELATAN", "SRENGSENG", "JOGLO"],
        "PALMERAH": ["PALMERAH", "SLIPI", "KOTA BAMBU UTARA", "KOTA BAMBU SELATAN", "JATIPULO", "KEMANGGISAN"],
        "TAMAN SARI": ["TAMAN SARI", "KRUKUT", "MAPHAR", "TANGKI", "MANGGA BESAR", "KEAGUNGAN", "GLODOK", "PINANGSIA"],
        "TAMBORA": ["TAMBORA", "TANAH SEREAL", "ROA MALAKA", "PEKOJAN", "JEMBATAN LIMA", "JEMBATAN BESI", "ANGKE", "DURI UTARA", "DURI SELATAN", "KRENDANG", "KALI ANYAR"]
    },
    "JAKARTA SELATAN": {
        "CILANDAK": ["CILANDAK BARAT", "GANDARIA SELATAN", "PONDOK LABU", "CIPETE SELATAN", "LEBAK BULUS"],
        "KEBAYORAN BARU": ["SELONG", "GUNUNG", "KRAMAT PELA", "GANDARIA UTARA", "CIPETE UTARA", "PULO", "MELAWAI", "PETOGOGAN", "RAWA BARAT", "SENAYAN"],
        "KEBAYORAN LAMA": ["KEBAYORAN LAMA UTARA", "KEBAYORAN LAMA SELATAN", "PONDOK PINANG", "PONDOK INDAH", "CIPULIR", "GROGOL UTARA", "GROGOL SELATAN"],
        "MAMPANG PRAPATAN": ["MAMPANG PRAPATAN", "BANGKA", "PELA MAMPANG", "TEGAL PARANG", "KUNINGAN BARAT"],
        "PANCORAN": ["PANCORAN", "KALIBATA", "RAWAJATI", "DUREN TIGA", "CIKOKO", "PENGADEGAN"],
        "PASAR MINGGU": ["PASAR MINGGU", "PEJATEN BARAT", "PEJATEN TIMUR", "JATI PADANG", "RAGUNAN", "CILANDAK TIMUR", "KEBAGUSAN"],
        "PESANGGRAHAN": ["PESANGGRAHAN", "BINTARO", "PETUKANGAN UTARA", "PETUKANGAN SELATAN", "ULUJAMI"],
        "SETIABUDI": ["SETIABUDI", "KARET", "KARET SEMANGGI", "KARET KUNINGAN", "KUNINGAN TIMUR", "MENTENG ATAS", "PASAR MANGGIS", "GUNTUR"],
        "TEBET": ["TEBET BARAT", "TEBET TIMUR", "KEBON BARU", "BUKIT DURI", "MANGGARAI", "MANGGARAI SELATAN", "MENTENG DALAM"],
        "JAGAKARSA": ["JAGAKARSA", "SRENGSENG SAWAH", "CIGANJUR", "LENTENG AGUNG", "TANJUNG BARAT", "CIPEDAK"]
    },
    "JAKARTA TIMUR": {
        "CAKUNG": ["CAKUNG BARAT", "CAKUNG TIMUR", "RAWA TERATE", "PENGGILINGAN", "PULO GEBANG", "UJUNG MENTENG", "JATINEGARA"],
        "DUREN SAWIT": ["DUREN SAWIT", "PONDOK BAMBU", "PONDOK KELAPA", "PONDOK KOPI", "MALAKA JAYA", "MALAKA SARI", "KLENDER"],
        "JATINEGARA": ["BALIMESTER", "KAMPUNG MELAYU", "BIDARACINA", "CIPINANG CEMPEDAK", "CIPINANG MUARA", "CIPINANG BESAR UTARA", "CIPINANG BESAR SELATAN", "RAWA BUNGA"],
        "KRAMAT JATI": ["KRAMAT JATI", "BATU AMPAR", "BALEKAMBANG", "DUKUH", "CAWANG", "CILILITAN", "TENGAH"],
        "MAKASAR": ["MAKASAR", "PINANG RANTI", "HALIM PERDANAKUSUMA", "CIPINANG MELAYU", "KEBON PALA"],
        "MATRAMAN": ["PISANGAN BARU", "UTAN KAYU SELATAN", "UTAN KAYU UTARA", "KAYU MANIS", "PAL MERIAM", "KEBON MANGGIS"],
        "PASAR REBO": ["PEKAYON", "GEDONG", "CIJANTUNG", "KALISARI", "BARU"],
        "PULO GADUNG": ["PULO GADUNG", "KAYU PUTIH", "JATI", "RAWAMANGUN", "PISANGAN TIMUR", "CIPINANG", "JATINEGARA KAUM"],
        "CIRACAS": ["CIRACAS", "CIBUBUR", "KELAPA DUA WETAN", "SUSUKAN", "RAMBUTAN"],
        "CIPAYUNG": ["CIPAYUNG", "CILANGKAP", "PONDOK RANGGON", "MUNJUL", "SETU", "BAMBU APUS", "LUBANG BUAYA", "CEGER"]
    }
}

def seed_database():
    print("Memulai seeding data lengkap DKI Jakarta (Kecamatan & Kelurahan)...")
    
    district_count = 0
    village_count = 0
    
    # Enable clean insert by ignoring duplicates or checking before insertion
    for city, districts in JAKARTA_DATA.items():
        for dist_name, villages in districts.items():
            # 1. Insert District (Kecamatan)
            dist_name = dist_name.strip().upper()
            dist_id = None
            
            # Check exist first to avoid unique key error
            existing_dist = supabase.table("districts").select("id").eq("name", dist_name).execute()
            if existing_dist.data:
                dist_id = existing_dist.data[0]["id"]
            else:
                insert_dist = supabase.table("districts").insert({"name": dist_name}).execute()
                dist_id = insert_dist.data[0]["id"]
                district_count += 1
                
            print(f"Menginjeksi Kecamatan: {dist_name} ...")
            
            # 2. Insert Villages (Kelurahan)
            for vil_name in villages:
                vil_name = vil_name.strip().upper()
                vil_id = None
                
                existing_vil = supabase.table("villages").select("id").eq("district_id", dist_id).eq("name", vil_name).execute()
                if existing_vil.data:
                    vil_id = existing_vil.data[0]["id"]
                else:
                    insert_vil = supabase.table("villages").insert({
                        "district_id": dist_id,
                        "name": vil_name
                    }).execute()
                    vil_id = insert_vil.data[0]["id"]
                    village_count += 1
                        
    print(f"\nSukses besar! Seeding selesai:")
    print(f"- {district_count} Kecamatan Baru Berhasil Dimasukkan")
    print(f"- {village_count} Kelurahan Baru Berhasil Dimasukkan")

if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"Gagal melakukan seeding: {e}")
