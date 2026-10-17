"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Building2, ChevronRight, Compass } from "lucide-react";
import { JAKARTA_HIERARCHY, slugify } from "@/core/constants/jakarta-hierarchy";

export default function VillageDirectory() {
  const cities = Object.keys(JAKARTA_HIERARCHY);
  const [selectedCity, setSelectedCity] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<string, Record<string, string[]>> = {};

    for (const [city, districts] of Object.entries(JAKARTA_HIERARCHY)) {
      if (selectedCity !== "Semua" && city !== selectedCity) {
        continue;
      }

      const matchedDistricts: Record<string, string[]> = {};

      for (const [district, villages] of Object.entries(districts)) {
        if (!q) {
          matchedDistricts[district] = villages;
        } else {
          const matchedVillages = villages.filter(
            (v) =>
              v.toLowerCase().includes(q) ||
              district.toLowerCase().includes(q) ||
              city.toLowerCase().includes(q)
          );
          if (matchedVillages.length > 0) {
            matchedDistricts[district] = matchedVillages;
          }
        }
      }

      if (Object.keys(matchedDistricts).length > 0) {
        result[city] = matchedDistricts;
      }
    }

    return result;
  }, [selectedCity, searchQuery]);

  return (
    <section id="direktori-wilayah" className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jakarta-blue/10 border border-jakarta-blue/20 text-jakarta-blue-light text-xs font-semibold mb-3">
          <Compass size={14} />
          Direktori Lengkap Wilayah
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white">
          Jelajahi 267 Kelurahan di DKI Jakarta
        </h2>
        <p className="text-sm md:text-base text-slate-400 mt-2">
          Pilih kota administrasi atau cari kelurahan Anda untuk melihat sebaran fasilitas publik, sekolah, rumah sakit, puskesmas, dan ruang terbuka hijau.
        </p>

        {/* Search input */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kelurahan atau kecamatan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-jakarta-blue-light transition-colors"
          />
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {["Semua", ...cities].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCity === city
                  ? "bg-jakarta-blue-light text-slate-950 border-jakarta-blue-light shadow-md shadow-jakarta-blue/20"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="space-y-10">
        {Object.entries(filteredData).map(([city, districts]) => (
          <div key={city} className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building2 size={20} className="text-jakarta-blue-light" />
              {city}
              <span className="text-xs font-normal text-slate-500">
                ({Object.keys(districts).length} Kecamatan)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(districts).map(([district, villages]) => (
                <div
                  key={district}
                  id={`kecamatan-${slugify(district)}`}
                  className="glass-card p-4 rounded-2xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin size={14} className="text-jakarta-emerald" />
                      Kecamatan {district}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                      {villages.length} Kelurahan
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {villages.map((vil) => (
                      <Link
                        key={vil}
                        href={`/dashboard/${slugify(vil)}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-jakarta-blue-light/50 transition-all group"
                      >
                        <span>{vil}</span>
                        <ChevronRight
                          size={12}
                          className="text-slate-500 group-hover:text-jakarta-blue-light transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
