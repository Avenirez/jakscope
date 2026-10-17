# JakScope - Pantau Jakarta

JakScope adalah platform interaktif modern yang memungkinkan warga DKI Jakarta untuk memantau, menemukan, dan mengulas fasilitas publik (kesehatan, pendidikan, ruang terbuka hijau, tempat ibadah, layanan keamanan, dan transportasi) di tingkat Kelurahan, menggunakan data waktu-nyata (real-time) dari OpenStreetMap.

Website Live: [jakscope.my.id](https://www.jakscope.my.id)

---

## Fitur Unggulan

### 1. Peta Interaktif, Navigasi, dan Live Tracking
- Live Tracking: Pengguna dapat melacak lokasi mereka secara real-time di atas peta berbekal API navigator.geolocation untuk menemukan arah secara presisi saat berada di lapangan.
- Arahkan Rute: Integrasi deep-link sekali klik yang otomatis membuka Google Maps dari kotak info peta, lengkap dengan koordinat tujuan yang sudah terisi.
- Deteksi Otomatis dan Strict Bounds: Klik area manapun di peta Jakarta atau gunakan GPS, sistem akan mendeteksi nama kelurahan secara otomatis. Dilengkapi 3 lapis validasi koordinat (maxBounds, Client-side, dan Server-side) agar bebas dari anomali lokasi di luar Jakarta.
- Visualisasi Glassmorphism: Antarmuka modern dengan gaya dark mode berbasis filter CSS murni pada peta OpenStreetMap agar bebas watermark API pihak ketiga.

### 2. Arsitektur Resilient dan Caching
- Overpass API Multi-Mirror: Menggunakan sistem fallback 4 server mirror (Jerman, Swiss, Rusia) untuk mencegah kegagalan (timeout) saat mengambil data fasilitas OSM.
- Sistem Caching Supabase: Data fasilitas OSM disimpan di cache database (Supabase). Jika API Overpass mengalami gangguan, aplikasi tetap menyajikan data dari cache secara cepat (Graceful Degradation).
- GitHub Actions Automation:
  - prewarm-cache: Memperbarui data peta secara berkala ke 267 kelurahan.
  - db-backup: Mencadangkan basis data SQL ke repositori secara berkala.
  - keep-alive: Mencegah cold start pada serverless hosting.

### 3. Keamanan dan Optimasi Performa
- Self-Clearing Rate Limiting: Melindungi API dari beban berlebih dengan algoritme pembersihan riwayat IP lama setiap 2 menit untuk menjaga stabilitas memori server.
- Clean Architecture dan Memoization: Konfigurasi peta dipisahkan ke lapisan domain constants, sementara kalkulasi hitungan sektor dan filter dioptimalkan menggunakan useMemo.
- Paginasi Render DOM: Daftar fasilitas pada halaman kelurahan menggunakan paginasi bertahap untuk mencegah perlambatan browser (DOM thrashing) saat memuat ratusan titik data.
- Nonaktifkan Link Prefetching Massal: Tautan direktori menggunakan prefetch false agar browser tidak menembakkan ratusan permintaan latar belakang sekaligus.
- Row Level Security (RLS): Pengamanan basis data di tingkat baris memastikan ulasan warga hanya dapat diubah atau dihapus oleh pemilik aslinya.

### 4. Search Engine Optimization (SEO) dan Generative Engine Optimization (GEO)
- Direktori Wilayah Terpadu: Halaman beranda memuat struktur hierarki lengkap 5 Kota Administrasi, 44 Kecamatan, dan 267 Kelurahan untuk memastikan seluruh halaman terhubung secara alami bagi perayap mesin pencari.
- Dynamic Metadata dan Hyper-Local Geo Tags: Setiap kelurahan memiliki tag meta kanonis, judul terstruktur, dan koordinat spasial presisi (geo.position, ICBM, geo.region, geo.placename) berbasis titik tengah OpenStreetMap.
- Structured Data (Schema.org / JSON-LD): Dilengkapi skema AdministrativeArea, CivicStructure, BreadcrumbList, FAQPage, dan WebSite dengan SearchAction.
- Standar AI Crawling (llms.txt dan llms-full.txt): Menyediakan berkas ringkasan terstruktur sesuai spesifikasi llmstxt.org agar mudah dikutip oleh mesin penjawab AI (Perplexity, ChatGPT Search, Claude, Gemini).
- Konfigurasi robots.ts dan sitemap.xml: Sitemap dinamis berbasis database dengan tautan gambar terverifikasi serta izin perayapan eksplisit untuk bot AI terkemuka.
- Open Graph Sosial: Kartu pratinjau sosial beresolusi 1200x630 piksel (og-image.png) untuk kebutuhan share di WhatsApp, Telegram, dan media sosial.
- Progressive Web App (PWA): Dilengkapi manifest.json sehingga dapat dipasang langsung pada layar utama perangkat seluler.

### 5. Sistem Komunitas dan Ulasan
- Autentikasi Pengguna: Masuk dengan akun Google melalui OAuth Supabase.
- Riwayat Ulasan: Halaman profil pengguna untuk melacak ulasan dan penilaian bintang yang pernah diberikan di berbagai kelurahan.

---

## Tech Stack

- Framework: Next.js (App Router), React
- Styling: Tailwind CSS
- Peta dan Visualisasi: Leaflet.js
- Database dan Auth: Supabase (PostgreSQL)
- Eksternal API: Overpass API (OpenStreetMap)
- Deployment dan Hosting: Vercel

---

## Cara Menjalankan Secara Lokal (Development)

1. Clone Repository:
   ```bash
   git clone https://github.com/Avenirez/jakscope.git
   cd jakscope/frontend
   ```

2. Install Dependensi:
   ```bash
   npm install
   ```

3. Atur Environment Variables:
   Buat file `.env.local` di folder `frontend`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. Jalankan Server Development:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser.

---

Dibuat untuk memajukan tata kelola kota Jakarta yang lebih terbuka.
