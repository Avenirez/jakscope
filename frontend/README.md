# 🏙️ JakScope - Pantau Jakarta

**JakScope** adalah platform interaktif modern yang memungkinkan warga DKI Jakarta untuk memantau, menemukan, dan mengulas fasilitas publik (kesehatan, pendidikan, ruang terbuka hijau, tempat ibadah, layanan keamanan, dll) di tingkat Kelurahan, menggunakan data waktu-nyata (*real-time*) dari OpenStreetMap.

🌐 **Website Live:** [jakscope.my.id](https://jakscope.my.id)

---

## 🚀 Fitur Unggulan (Production Ready)

### 1. 🗺️ Peta Interaktif & Eksplorasi Cerdas
- **Deteksi Otomatis:** Klik area manapun di peta Jakarta atau gunakan *Geolocation* (GPS), sistem akan mendeteksi nama kelurahan secara otomatis.
- **Visualisasi Glassmorphism:** Antarmuka modern dengan gaya *dark mode* sejati (CartoDB Dark Matter tiles) dipadukan dengan aksen tembus pandang (*glassmorphism*).

### 2. ⚡ Arsitektur Resilient & Anti-Jatuh
- **Overpass API Multi-Mirror:** Menggunakan sistem *fallback* 4 *server mirror* (Jerman, Swiss, Rusia) untuk mencegah kegagalan (*timeout*) saat mengambil data fasilitas OSM.
- **Sistem Caching Supabase:** Data OSM yang berat disimpan di *cache* database (Supabase). Jika API Overpass sedang *down*, aplikasi akan menyajikan data dari *cache* sehingga layar putih (blank) tidak pernah terjadi (*Graceful Degradation*).
- **GitHub Actions Automation:**
  - `prewarm-cache`: Memperbarui data peta secara otomatis ke 267 kelurahan setiap bulan tanpa membebani pengunjung pertama.
  - `db-backup`: Mencadangkan (*backup*) basis data SQL otomatis ke repositori secara berkala.
  - `keep-alive`: Mencegah server Vercel mengalami *Cold Start* (*sleep*).

### 3. 🛡️ Keamanan Skala Industri
- **In-Memory Rate Limiting:** Melindungi API dari serangan beban palsu (*DoS/DDoS*) dan meminimalisir penalti *Rate Limit* dari server OSM.
- **Row Level Security (RLS):** Pengamanan basis data di tingkat sel (Supabase) memastikan komentar dan ulasan (*reviews*) hanya bisa diubah atau dihapus oleh pemilik aslinya (berbasis Token Autentikasi JWT).
- **Anti-XSS & Information Disclosure:** Menutup rapat celah keamanan injeksi Javascript (XSS) dan mencegah log server (*stack trace error*) bocor ke sisi klien.

### 4. 📈 SEO (Auto-Pilot) & PWA
- **Hyper-Local SEO (GEO):** Menerapkan Next.js *Dynamic Metadata & Open Graph*, mengubah ke-267 kelurahan menjadi halaman terpisah yang terbaca unik oleh Google dan memiliki pratinjau yang indah saat dibagikan ke WhatsApp / X.
- **Auto Sitemap & Robots.txt:** Menghasilkan `sitemap.xml` dinamis langsung dari database.
- **Progressive Web App (PWA):** Dilengkapi `manifest.json` agar website dapat dipasang (*install*) di *Homescreen* HP seperti aplikasi biasa.

### 5. 👥 Sistem Komunitas & Ulasan
- **Autentikasi Mudah:** Login dengan sekali klik menggunakan akun Google (OAuth Supabase).
- **Dashboard Pengguna:** Halaman profil khusus tempat pengguna bisa melacak jejak ulasan bintang yang pernah mereka berikan di berbagai kelurahan.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router), React
- **Styling:** Tailwind CSS
- **Peta & Visualisasi:** Leaflet.js
- **Database & Auth:** Supabase (PostgreSQL)
- **Eksternal API:** Overpass API (OpenStreetMap)
- **Deployment & Analytics:** Vercel

---

## 💻 Cara Menjalankan Secara Lokal (Development)

1. **Clone Repository:**
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/jakscope.git
   cd jakscope/frontend
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Atur Environment Variables:**
   Buat file `.env.local` di root folder `frontend` dan isikan:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

---

*Dibuat untuk memajukan tata kelola kota Jakarta yang lebih terbuka.* 🏙️
