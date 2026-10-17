"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  AlertCircle,
  HeartPulse,
  GraduationCap,
  Trees,
  Bus,
  ShieldCheck,
  Church,
  ShoppingBag,
  ChevronDown,
  HelpCircle,
  Navigation,
  Layers,
} from "lucide-react";
import dynamic from "next/dynamic";

import type { DashboardData } from "@/lib/api";
import AuthButton from "@/components/auth-button";
import ReviewSection from "@/components/review-section";
import { fetchFacilitiesFromOSM, type Facility } from "@/lib/overpass";

// Import Leaflet map component dynamically with SSR disabled to prevent Node window error
const InteractiveMap = dynamic(() => import("@/components/interactive-map"), {
  ssr: false,
});

interface SectorCounts {
  health: number;
  education: number;
  recreation: number;
  transport: number;
  public_services: number;
  worship: number;
  market: number;
}

interface DashboardClientProps {
  initialData: DashboardData;
  initialFacilities?: Facility[];
  initialCenter?: [number, number] | null;
  initialSectorCounts?: SectorCounts;
}

export default function DashboardClient({
  initialData,
  initialFacilities = [],
  initialCenter = null,
  initialSectorCounts,
}: DashboardClientProps) {
  const router = useRouter();
  const villageId = initialData.village_id;

  const [data] = useState<DashboardData>(initialData);

  // States for OSM Facilities Map
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [villageCenter, setVillageCenter] = useState<[number, number] | null>(initialCenter);
  const [loadingMap, setLoadingMap] = useState(false);
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>("all");
  const [mapError, setMapError] = useState<string | null>(null);

  // State for Live Tracking
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // State for FAQ accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Watch User Location (Live Tracking)
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("Live tracking err:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Fetch real facilities from OpenStreetMap only if not already provided from server cache
  useEffect(() => {
    if (!data?.village_name) return;
    if (initialFacilities && initialFacilities.length > 0 && initialCenter) {
      return;
    }
    setLoadingMap(true);
    setMapError(null);
    fetchFacilitiesFromOSM(data.village_name)
      .then((res) => {
        setFacilities(res.facilities);
        setVillageCenter(res.center);
      })
      .catch(async (err) => {
        console.error("Error fetching OSM data:", err);
        try {
          const centerRes = await fetch(`/api/villages/${villageId}/center`);
          if (centerRes.ok) {
            const centerData = await centerRes.json();
            if (centerData.center) {
              setVillageCenter(centerData.center);
              setMapError(null);
              return;
            }
          }
        } catch {}
        setMapError(err.message || "Gagal mengambil data dari OpenStreetMap.");
      })
      .finally(() => setLoadingMap(false));
  }, [data?.village_name, villageId, initialFacilities, initialCenter]);

  // Derived sector statistics
  const currentSectorCounts: SectorCounts = initialSectorCounts || {
    health: facilities.filter((f) => f.sector === "health").length,
    education: facilities.filter((f) => f.sector === "education").length,
    recreation: facilities.filter((f) => f.sector === "recreation").length,
    transport: facilities.filter((f) => f.sector === "transport").length,
    public_services: facilities.filter((f) => f.sector === "public_services").length,
    worship: facilities.filter((f) => f.sector === "worship").length,
    market: facilities.filter((f) => f.sector === "market").length,
  };

  const totalFacilities = facilities.length;

  // Filter facilities based on selectedSectorFilter
  const filteredFacilities =
    selectedSectorFilter === "all"
      ? facilities
      : facilities.filter((f) => f.sector === selectedSectorFilter);

  // Sector stats config
  const sectorItems = [
    {
      id: "health",
      label: "Kesehatan",
      count: currentSectorCounts.health,
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      desc: "Puskesmas, RS & Klinik",
      borderColor: "border-rose-500/20",
      bgColor: "bg-rose-500/10",
    },
    {
      id: "education",
      label: "Pendidikan",
      count: currentSectorCounts.education,
      icon: <GraduationCap className="w-5 h-5 text-sky-400" />,
      desc: "SD, SMP, SMA & Kampus",
      borderColor: "border-sky-500/20",
      bgColor: "bg-sky-500/10",
    },
    {
      id: "recreation",
      label: "Taman & RPTRA",
      count: currentSectorCounts.recreation,
      icon: <Trees className="w-5 h-5 text-emerald-400" />,
      desc: "Ruang Terbuka & Olahraga",
      borderColor: "border-emerald-500/20",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "transport",
      label: "Transportasi",
      count: currentSectorCounts.transport,
      icon: <Bus className="w-5 h-5 text-amber-400" />,
      desc: "Halte & Stasiun",
      borderColor: "border-amber-500/20",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "public_services",
      label: "Layanan Publik",
      count: currentSectorCounts.public_services,
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      desc: "Kelurahan, Polisi & Damkar",
      borderColor: "border-purple-500/20",
      bgColor: "bg-purple-500/10",
    },
    {
      id: "worship",
      label: "Tempat Ibadah",
      count: currentSectorCounts.worship,
      icon: <Church className="w-5 h-5 text-indigo-400" />,
      desc: "Masjid, Gereja & Vihara",
      borderColor: "border-indigo-500/20",
      bgColor: "bg-indigo-500/10",
    },
  ];

  // FAQ list tailored to this village
  const faqs = [
    {
      q: `Fasilitas publik apa saja yang terdata di Kelurahan ${data.village_name}?`,
      a: `Berdasarkan data spasial OpenStreetMap dan sistem JakScope, terdapat ${totalFacilities} fasilitas publik terverifikasi di Kelurahan ${data.village_name}, mencakup ${currentSectorCounts.health} sarana kesehatan, ${currentSectorCounts.education} instansi pendidikan, ${currentSectorCounts.recreation} ruang terbuka hijau/RPTRA, ${currentSectorCounts.transport} titik transportasi publik, dan ${currentSectorCounts.public_services} pos layanan keamanan/publik.`,
    },
    {
      q: `Bagaimana cara menemukan rute ke fasilitas di Kelurahan ${data.village_name}?`,
      a: `Anda dapat mengklik salah satu penanda (marker) pada peta interaktif di atas, lalu memilih opsi "Buka di Google Maps". Lokasi tujuan dan koordinat rute akan langsung terbuka secara otomatis di aplikasi peta ponsel Anda.`,
    },
    {
      q: `Dari mana sumber data fasilitas publik Kelurahan ${data.village_name}?`,
      a: `Data dihimpun dari OpenStreetMap (OSM) melalui Overpass API multi-mirror dan dicadangkan secara berkala ke database Supabase JakScope untuk memastikan performa tinggi dan ketersediaan data secara kontinu.`,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* ===== HEADER ===== */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            id="back-button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Beranda</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-white">
              Kelurahan {data.village_name}
            </h1>
            <p className="text-xs text-slate-400">
              Kecamatan {data.district_name} · DKI Jakarta
            </p>
          </div>

          <AuthButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ===== BREADCRUMB NAVIGATION (SEO & Crawl Hierarchy) ===== */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
          <ol className="flex items-center space-x-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-jakarta-blue-light transition-colors">
                Beranda
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="text-slate-300">DKI Jakarta</span>
            </li>
            <li>/</li>
            <li>
              <span className="text-slate-300">Kec. {data.district_name}</span>
            </li>
            <li>/</li>
            <li className="text-jakarta-blue-light font-medium" aria-current="page">
              Kel. {data.village_name}
            </li>
          </ol>
        </nav>

        {/* ===== AI-CITABLE OVERVIEW CARD (GEO: Generative Engine Optimization) ===== */}
        <section
          aria-label="Ringkasan Wilayah Kelurahan"
          className="glass-card p-6 border-l-4 border-l-jakarta-blue-light bg-gradient-to-r from-slate-900/90 to-slate-900/50"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-jakarta-blue/20 text-jakarta-blue-light mt-0.5 shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white mb-1">
                Profil Fasilitas Publik Kelurahan {data.village_name}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Kelurahan <strong>{data.village_name}</strong> berlokasi di wilayah Kecamatan <strong>{data.district_name}</strong>, Provinsi DKI Jakarta. Berdasarkan integrasi data spasial terbuka JakScope dan OpenStreetMap, tercatat <strong>{totalFacilities} fasilitas publik aktif</strong> di kelurahan ini, meliputi sarana kesehatan, pendidikan, ruang terbuka publik (RPTRA), tempat ibadah, dan konektivitas transportasi.
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {sectorItems.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSectorFilter(sec.id)}
                className={`p-3 rounded-xl border text-left transition-all ${sec.borderColor} ${sec.bgColor} hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-1">
                  {sec.icon}
                  <span className="text-lg font-black text-white">{sec.count}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{sec.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{sec.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* ===== INTERACTIVE MAP ===== */}
        <section className="glass-card p-6 opacity-0 animate-fade-in-up animate-delay-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={20} className="text-jakarta-blue-light animate-bounce" />
                Peta Distribusi Fasilitas Publik
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Peta persebaran koordinat nyata fasilitas di Kelurahan {data.village_name}.
              </p>
            </div>

            {/* Filter Sektor */}
            <div className="flex flex-row flex-wrap gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
              {[
                { id: "all", label: "Semua Sektor", activeClass: "bg-slate-800 text-white border-slate-700 shadow-sm" },
                { id: "health", label: `Kesehatan (${currentSectorCounts.health})`, activeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-950" },
                { id: "education", label: `Pendidikan (${currentSectorCounts.education})`, activeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30 shadow-sm shadow-sky-950" },
                { id: "recreation", label: `Taman/RPTRA (${currentSectorCounts.recreation})`, activeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-950" },
                { id: "transport", label: `Transportasi (${currentSectorCounts.transport})`, activeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-950" },
                { id: "public_services", label: `Layanan (${currentSectorCounts.public_services})`, activeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-sm shadow-purple-950" },
                { id: "worship", label: `Ibadah (${currentSectorCounts.worship})`, activeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-950" },
                { id: "market", label: `Pasar (${currentSectorCounts.market})`, activeClass: "bg-orange-500/20 text-orange-300 border-orange-500/30 shadow-sm shadow-orange-950" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedSectorFilter(btn.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent transition-all duration-200 ${
                    selectedSectorFilter === btn.id
                      ? btn.activeClass
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {loadingMap ? (
            <div className="w-full h-[400px] bg-slate-950/40 rounded-2xl flex items-center justify-center border border-slate-800/60 shadow-inner">
              <div className="text-center">
                <div className="w-9 h-9 border-4 border-jakarta-blue-light border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Menghubungi JakScope...</p>
                <p className="text-xs text-slate-600 mt-1">
                  Mengambil koordinat fasilitas kelurahan {data.village_name}
                </p>
              </div>
            </div>
          ) : mapError ? (
            <div className="w-full h-[400px] bg-slate-950/40 rounded-2xl flex items-center justify-center border border-slate-800/60 shadow-inner p-6 text-center">
              <div className="max-w-md">
                <AlertCircle className="w-9 h-9 text-rose-400 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-slate-200 font-semibold">{mapError}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Layanan data peta sedang padat atau mengalami timeout. Silakan klik tombol di bawah untuk memuat ulang data peta.
                </p>
                <button
                  onClick={() => {
                    setLoadingMap(true);
                    setMapError(null);
                    fetchFacilitiesFromOSM(data.village_name)
                      .then((res) => {
                        setFacilities(res.facilities);
                        setVillageCenter(res.center);
                      })
                      .catch((err) => {
                        console.error(err);
                        setMapError(err.message || "Gagal memuat data peta.");
                      })
                      .finally(() => setLoadingMap(false));
                  }}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700/60 transition-colors shadow-md"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : (
            <InteractiveMap
              facilities={facilities}
              selectedSector={selectedSectorFilter}
              villageName={data.village_name}
              center={villageCenter}
              userLocation={userLocation}
            />
          )}
        </section>

        {/* ===== DAFTAR FASILITAS TERDATA (SEO CRAWLABLE CONTENT) ===== */}
        {filteredFacilities.length > 0 && (
          <section className="glass-card p-6" aria-label="Daftar Fasilitas Publik">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-jakarta-emerald" />
                  Daftar Fasilitas Publik di Kelurahan {data.village_name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Menampilkan {filteredFacilities.length} fasilitas terdata di OpenStreetMap
                </p>
              </div>
              {selectedSectorFilter !== "all" && (
                <button
                  onClick={() => setSelectedSectorFilter("all")}
                  className="text-xs text-jakarta-blue-light hover:underline"
                >
                  Lihat Semua Sektor
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => (
                <div
                  key={`${facility.id}-${facility.name}`}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {facility.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 mt-1.5 line-clamp-1">
                      {facility.name || "Fasilitas Tanpa Nama"}
                    </h4>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {facility.lat.toFixed(4)}, {facility.lon.toFixed(4)}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-jakarta-blue-light hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Navigation size={10} /> Rute
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== FAQ SECTION (GEO & AI Rich Snippet Schema) ===== */}
        <section className="glass-card p-6" aria-label="Pertanyaan Umum Wilayah">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={20} className="text-jakarta-blue-light" />
            <h3 className="text-base font-bold text-white">
              Tanya Jawab Seputar Fasilitas Kelurahan {data.village_name}
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 font-semibold text-sm text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform shrink-0 ${
                      expandedFaq === index ? "rotate-180 text-jakarta-blue-light" : "text-slate-500"
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ===== REVIEWS & RATINGS ===== */}
        <ReviewSection villageId={villageId} />
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Jak
        <span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">
          Scope
        </span>{" "}
        · Data spasial dari{" "}
        <a
          href="https://www.openstreetmap.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-jakarta-blue-light hover:underline"
        >
          OpenStreetMap
        </a>
      </footer>
    </main>
  );
}
