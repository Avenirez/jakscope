"use client";

import { Map, ListFilter, Database } from "lucide-react";
import dynamic from "next/dynamic";

const JakartaMap = dynamic(() => import("@/components/jakarta-map"), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-jakarta-blue-light/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-jakarta-emerald/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 opacity-0 animate-fade-in-up">
            Jak
            <span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">
              Scope
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-in-up animate-delay-100">
            Peta interaktif untuk memantau sebaran fasilitas publik di seluruh kelurahan DKI Jakarta secara real-time. Cari kelurahan Anda untuk melihat ketersediaan fasilitas publik seperti sekolah, fasilitas kesehatan, hingga ruang terbuka hijau.
          </p>

          {/* ===== INTERACTIVE JAKARTA MAP ===== */}
          <div className="max-w-4xl mx-auto opacity-0 animate-fade-in-up animate-delay-200">
            <JakartaMap />
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Layanan Utama{" "}
          <span className="text-jakarta-blue-light">Jak<span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">Scope</span></span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Map size={28} />,
              title: "Peta Interaktif Wilayah",
              desc: "Pilih wilayah kelurahan pada peta untuk mengetahui persebaran fasilitas publik secara langsung.",
              color: "text-jakarta-blue-light",
            },
            {
              icon: <ListFilter size={28} />,
              title: "Penyaringan Kategori Fasilitas",
              desc: "Temukan sekolah, fasilitas olahraga, klinik, atau pos keamanan dengan mudah melalui fitur penyaringan kategori terintegrasi.",
              color: "text-jakarta-emerald",
            },
            {
              icon: <Database size={28} />,
              title: "Pembaruan Data Terkini",
              desc: "Terintegrasi dengan OpenStreetMap (OSM) untuk menyajikan data yang akurat, transparan, dan dapat diakses oleh seluruh lapisan masyarakat.",
              color: "text-jakarta-amber",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-6 metric-hover"
            >
              <div className={`mb-4 ${feature.color}`}>{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>
          Jak<span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">Scope</span> © {new Date().getFullYear()} JakScope. All rights reserved.
        </p>
        <p className="mt-1">
          Data bersumber dari database kolaboratif{" "}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-jakarta-blue-light hover:underline"
          >
            openstreetmap.org
          </a>
        </p>
      </footer>
    </main>
  );
}
