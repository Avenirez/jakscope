export interface FaqItem {
  q: string;
  a: string;
}

export const HOME_FAQS: FaqItem[] = [
  {
    q: "Apa itu JakScope dan bagaimana cara menggunakannya?",
    a: "JakScope adalah platform pemantauan fasilitas publik real-time untuk DKI Jakarta. Anda cukup memilih kelurahan melalui peta interaktif atau mencari nama kelurahan Anda di direktori untuk melihat lokasi puskesmas, rumah sakit, sekolah, taman kota/RPTRA, sarana transportasi, tempat ibadah, dan kantor layanan publik.",
  },
  {
    q: "Dari mana data fasilitas publik JakScope berasal?",
    a: "Seluruh data spasial bersumber dari komunitas terbuka OpenStreetMap (OSM) dan diverifikasi melalui sistem caching berkecepatan tinggi di Supabase. Data diperbarui secara berkala menggunakan automasi GitHub Actions.",
  },
  {
    q: "Berapa banyak wilayah yang dicakup oleh JakScope?",
    a: "JakScope mencakup seluruh 267 kelurahan dan 44 kecamatan di 5 wilayah Kota Administrasi DKI Jakarta (Jakarta Pusat, Jakarta Utara, Jakarta Barat, Jakarta Selatan, dan Jakarta Timur).",
  },
  {
    q: "Bagaimana cara menuju lokasi fasilitas yang ditemukan?",
    a: "Setiap penanda fasilitas pada peta dilengkapi tombol navigasi rute sekali klik yang langsung terhubung ke Google Maps dengan koordinat presisi.",
  },
  {
    q: "Apakah JakScope dapat diinstal di ponsel pintar (HP)?",
    a: "Ya! JakScope mendukung Progressive Web App (PWA). Anda dapat memasang aplikasi langsung ke layar utama (homescreen) ponsel tanpa perlu mengunduh dari toko aplikasi.",
  },
];
