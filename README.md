# JakScope — Peta Distribusi Fasilitas Publik DKI Jakarta

**JakScope** adalah platform web interaktif untuk memetakan sebaran fasilitas publik (pendidikan, kesehatan, taman & olahraga, keamanan, dan layanan publik) di 267 Kelurahan DKI Jakarta secara real-time menggunakan data OpenStreetMap dan Supabase.

---

## Fitur Utama

- **Peta Dark-Mode Interaktif**: Visualisasi peta modern dengan tema gelap (pitch-black), masking batas wilayah luar DKI Jakarta, dan penanda (*marker*) fasilitas publik per kelurahan.
- **Deteksi Koordinat Cepat (~100ms)**: Fitur *nearest-neighbor lookup* berbasis koordinat pusat kelurahan saat pengguna mengklik area mana saja di peta Jakarta.
- **Cakupan Full 267 Kelurahan**: Akses penuh ke seluruh 267 Kelurahan di 44 Kecamatan DKI Jakarta tanpa hambatan.
- **Pre-warm Cache Fasilitas OSM**: Sistem caching dua tingkat (Supabase Database + Overpass API) dilengkapi skrip otomatisasi pre-warm agar peta dapat dimuat secara instan (<1 detik).
- **Sistem Rating & Ulasan Kelurahan**: Fitur penilaian dan ulasan fasilitas publik per kelurahan yang terintegrasi dengan **Supabase Auth** serta kebijakan keamanan Row Level Security (RLS).
- **Donasi QRIS Dinamis**: Gateway donasi dengan generator QR Code dinamis berbasis standar EMVCo TLV untuk mendukung operasional server.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router) · React 19 |
| **Language & Styling** | TypeScript · Tailwind CSS · CSS Custom Properties |
| **Map Rendering** | Leaflet · React-Leaflet · OpenStreetMap Tiles |
| **Database & Auth** | Supabase (PostgreSQL) · Supabase Auth (RLS Enabled) |
| **Data Provider** | OpenStreetMap via Overpass API Engine |
| **QRIS Generator** | EMVCo TLV Parser + `qrcode` SVG/PNG Renderer |

---

## Struktur Folder

```
jakscope/
├── database/
│   ├── migration.sql              # Skema utama database (Districts, Villages, Cache, Reviews, RLS)
│   ├── fix_cache_and_villages_rls.sql # Skrip hardening RLS policy
│   └── scripts/
│       └── seed_jakarta.py        # Skrip Python untuk seeding 44 Kecamatan & 267 Kelurahan
├── frontend/
│   ├── scripts/
│   │   └── prewarm-osm-cache.ts   # Skrip pre-warm cache fasilitas OSM ke Supabase
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Landing page pencarian & peta interaktif Jakarta
│   │   │   ├── globals.css        # Custom CSS, map styling, & dark mode overlay
│   │   │   ├── api/
│   │   │   │   ├── villages/      # Endpoint list kelurahan & deteksi koordinat
│   │   │   │   ├── reviews/       # Endpoint ulasan & rating kelurahan
│   │   │   │   └── donate/qris/   # Endpoint proxy generator QRIS dinamis
│   │   │   └── dashboard/[villageId]/ # Halaman detail fasilitas & ulasan kelurahan
│   │   ├── components/
│   │   │   ├── jakarta-map.tsx    # Peta interaktif landing page dengan GeoJSON mask
│   │   │   ├── interactive-map.tsx # Peta sebaran fasilitas di halaman detail
│   │   │   ├── auth-button.tsx    # Komponen Supabase Auth (Login/Logout)
│   │   │   ├── review-section.tsx # Komponen ulasan, rating bintang, & input ulasan
│   │   │   └── donate-modal.tsx   # Modal donasi QRIS dinamis
│   │   └── lib/
│   │       ├── api.ts             # Type definition & helper API
│   │       ├── supabase.ts        # Inisialisasi Supabase Client
│   │       └── overpass.ts        # Client & Server fetcher fasilitas OpenStreetMap
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
└── README.md
```

---

## Pre-warm Cache Fasilitas OSM

Agar halaman detail kelurahan dapat dibuka secara instan oleh pengguna tanpa harus menunggu *live query* ke Overpass API, jalankan skrip pre-warm cache:

```bash
cd frontend
npm run prewarm-osm
```

*Catatan: Disarankan untuk mengkonfigurasi skrip ini secara berkala (misal: mingguan via cron job) agar data sebaran fasilitas publik di Supabase tetap mutakhir.*

---

## API Endpoints

### Internal API Routes (Next.js App Router)

- `GET /api/villages` — Mengambil daftar kelurahan dan kecamatan di DKI Jakarta.
- `GET /api/villages/detect?lat={lat}&lng={lng}` — Deteksi kelurahan terdekat dari koordinat klik peta.
- `GET /api/villages/[villageId]/dashboard` — Mengambil informasi detail kelurahan.
- `GET /api/villages/facilities?village={name}` — Mengambil data sebaran fasilitas publik (dari cache database / live Overpass API).
- `GET /api/reviews?village_id={id}` — Mengambil daftar ulasan & rating untuk kelurahan tertentu.
- `POST /api/reviews` — Mengirimkan ulasan & rating baru (membutuhkan sesi login Supabase Auth).
- `GET /api/donate/qris?amount={nominal}` — Menghasilkan image QR Code QRIS dinamis berbasis EMVCo.

---

## Lisensi

Proyek ini dirilis di bawah lisensi **MIT**.
