import type { Metadata } from "next";
import { Map, ListFilter, Database, Compass, Sparkles, Shield, HeartPulse, GraduationCap } from "lucide-react";
import MapWrapper from "@/components/map-wrapper";
import VillageDirectory from "@/components/village-directory";
import HomeFaq from "@/components/home-faq";
import { HOME_FAQS } from "@/core/constants/faqs";


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jakscope.my.id";

export const metadata: Metadata = {
  title: "JakScope - Pantau & Peta Fasilitas Publik 267 Kelurahan DKI Jakarta",
  description:
    "Eksplorasi peta interaktif dan direktori fasilitas publik terlengkap di DKI Jakarta. Temukan puskesmas, rumah sakit, sekolah, RPTRA, transportasi, dan kantor layanan di 267 kelurahan.",
  alternates: {
    canonical: siteUrl,
  },
};

export default function LandingPage() {
  // FAQ Schema for Homepage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  // WebApplication Schema
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JakScope",
    url: siteUrl,
    applicationCategory: "GovernmentApplication",
    operatingSystem: "All",
    description: "Peta distribusi dan pemantauan fasilitas publik tingkat Kelurahan di DKI Jakarta berbasis OpenStreetMap.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <main className="min-h-screen">
        {/* ===== HERO SECTION ===== */}
        <section className="hero-gradient relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-jakarta-blue-light/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-jakarta-emerald/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-white tracking-tight">
              Jak
              <span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">
                Scope
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Peta interaktif untuk memantau sebaran fasilitas publik di seluruh kelurahan DKI Jakarta secara real-time. Temukan puskesmas, rumah sakit, sekolah, taman RPTRA, transportasi, dan pos keamanan terdekat.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <a
                href="#explore-map"
                className="inline-flex items-center justify-center bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-jakarta-blue/50 transition-all hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-jakarta-blue-light/50"
              >
                Mulai Eksplorasi Peta
              </a>
              <a
                href="#direktori-wilayah"
                className="inline-flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold px-6 py-4 rounded-full border border-slate-700 transition-all"
              >
                Lihat Direktori Kelurahan
              </a>
            </div>

            {/* ===== INTERACTIVE JAKARTA MAP ===== */}
            <div id="explore-map" className="max-w-4xl mx-auto">
              <MapWrapper />
            </div>
          </div>
        </section>

        {/* ===== HIGHLIGHT STATS SECTION (GEO / AI Context) ===== */}
        <section className="border-y border-slate-800/80 bg-slate-950/60 py-12">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl md:text-4xl font-black text-white">267</div>
              <div className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                Kelurahan DKI Jakarta
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl md:text-4xl font-black text-jakarta-blue-light">44</div>
              <div className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                Kecamatan Terpetakan
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl md:text-4xl font-black text-jakarta-emerald">7+</div>
              <div className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                Sektor Fasilitas Publik
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl md:text-4xl font-black text-jakarta-amber">100%</div>
              <div className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                Data Terbuka & Real-Time
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Layanan Utama{" "}
              <span>
                Jak
                <span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">
                  Scope
                </span>
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Dirancang untuk mempermudah warga memantau dan mengakses infrastruktur publik kota Jakarta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Map size={28} />,
                title: "Peta Interaktif Wilayah",
                desc: "Pilih wilayah kelurahan pada peta untuk mengetahui persebaran fasilitas publik secara langsung dengan live GPS tracking.",
                color: "text-jakarta-blue-light",
              },
              {
                icon: <ListFilter size={28} />,
                title: "Penyaringan Multi-Kategori",
                desc: "Temukan sekolah, fasilitas olahraga, klinik, rumah sakit, halte, pos polisi, hingga tempat ibadah melalui filter sektor terintegrasi.",
                color: "text-jakarta-emerald",
              },
              {
                icon: <Database size={28} />,
                title: "Pembaruan Terkini OpenStreetMap",
                desc: "Terhubung ke basis data OpenStreetMap dengan caching cerdas di Supabase untuk menyajikan informasi yang cepat dan transparan.",
                color: "text-jakarta-amber",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 metric-hover rounded-2xl"
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

        {/* ===== DIREKTORI WILAYAH (267 KELURAHAN CRAWLABLE INTERNAL LINKS) ===== */}
        <VillageDirectory />

        {/* ===== FAQ SECTION (GEO & AI SNIPPETS) ===== */}
        <HomeFaq />

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-slate-800 py-10 text-center text-sm text-slate-400">
          <div className="max-w-5xl mx-auto px-6 space-y-3">
            <p className="font-medium text-slate-300">
              <span className="text-white">Jak</span>
              <span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">
                Scope
              </span>{" "}
              (c) {new Date().getFullYear()} JakScope. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Data spasial bersumber dari database kolaboratif{" "}
              <a
                href="https://www.openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-jakarta-blue-light hover:underline"
              >
                OpenStreetMap.org
              </a>{" "}
              (ODbL).
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
