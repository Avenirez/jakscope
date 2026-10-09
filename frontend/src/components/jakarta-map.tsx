"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, AlertCircle, Loader2, X, LocateFixed, Clock } from "lucide-react";

export default function JakartaMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeError, setShakeError] = useState(false);

  // Search States
  const [villagesList, setVillagesList] = useState<Array<{ id: number; name: string; districtName: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<Array<{ id: number; name: string; districtName: string }>>([]);



  // Fetch villages list for search
  useEffect(() => {
    fetch("/api/villages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVillagesList(data);
        }
      })
      .catch(console.error);
      
    // Load recent searches
    const saved = localStorage.getItem("jakscope_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Handle click outside to close the search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (id: number, name: string, districtName: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const newRecent = [{id, name, districtName}, ...filtered].slice(0, 5);
      localStorage.setItem("jakscope_recent_searches", JSON.stringify(newRecent));
      return newRecent;
    });
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 1. Strict bounds restricted to DKI Jakarta area only
    const jakartaBounds = L.latLngBounds(
      [-6.39, 106.67], // Southwest corner (Kalideres / Jagakarsa border)
      [-6.06, 106.99]  // Northeast corner (Tanjung Priok / Marunda / Cakung border)
    );

    // Centered precisely at Jakarta City
    const map = L.map(mapContainerRef.current, {
      center: [-6.21, 106.8456],
      zoom: 13,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: jakartaBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    // Official OpenStreetMap (OSM) tiles
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    // Dark Masking Overlay (Dims & hides all outer city labels like Tangerang, Bekasi, Depok)
    const jakartaOuterMask = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.30, -5.50],
            [107.40, -5.50],
            [107.40, -6.60],
            [106.30, -6.60],
            [106.30, -5.50]
          ],
          [
            [106.68, -6.08],
            [106.97, -6.08],
            [106.97, -6.37],
            [106.68, -6.37],
            [106.68, -6.08]
          ]
        ]
      }
    };

    L.geoJSON(jakartaOuterMask as any, {
      style: {
        fillColor: "#0f172a",
        fillOpacity: 0.85,
        color: "#38bdf8",
        weight: 1.5,
        opacity: 0.8,
      },
      interactive: false,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    // Handle Map Click
    const onMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Client-side Jakarta boundary check (instant, no network needed)
      if (lat < -6.38 || lat > -6.08 || lng < 106.68 || lng > 106.97) {
        triggerError("Koordinat berada di luar batas wilayah DKI Jakarta.");
        return;
      }

      setLoading(true);
      setErrorMessage(null);
      setStatusMessage("Mendeteksi kelurahan dari koordinat...");

      try {
        // Query our server-side detection and lookup API
        const response = await fetch(`/api/villages/detect?lat=${lat}&lng=${lng}`);
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Koordinat berada di luar batas Kelurahan DKI Jakarta atau tidak terdaftar.");
        }

        const lookupData = await response.json();
        setStatusMessage(`Ditemukan: Kelurahan ${lookupData.name}! Mengalihkan ke dashboard...`);
        
        if (lookupData.id && lookupData.name && lookupData.district_name) {
          saveRecentSearch(lookupData.id, lookupData.name, lookupData.district_name);
        }

        // Navigate
        const slug = lookupData.name.toLowerCase().replace(/[\s_]+/g, '-');
        router.push(`/dashboard/${slug}`);
      } catch (err: any) {
        console.error(err);
        triggerError(err.message || "Terjadi kesalahan koneksi.");
        setLoading(false);
      }
    };

    map.on("click", onMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", onMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [router]);

  // Handle Search Result Select
  const handleSelectVillage = async (id: number, name: string, districtName: string) => {
    setSearchQuery(name);
    setIsSearchOpen(false);
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage(`Mencari titik koordinat Kelurahan ${name}...`);
    
    saveRecentSearch(id, name, districtName);

    try {
      // Fetch coordinates of the village boundary center
      const response = await fetch(`/api/villages/facilities?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memuat koordinat kelurahan.");
      }
      
      const data = await response.json();
      const center = data.center;
      const facilities = data.facilities || [];

      if (facilities.length === 0) {
        throw new Error(`Kelurahan '${name}' tidak memiliki fasilitas publik terdaftar di OpenStreetMap (0 fasilitas).`);
      }

      if (center && mapRef.current) {
        // Fly to coordinate center of the village
        mapRef.current.flyTo(center, 14.5, {
          animate: true,
          duration: 1.5
        });

        // Clear previous selection marker
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Custom selecting marker
        const customIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-8 h-8 rounded-full bg-sky-400/30 animate-ping"></div>
              <div class="w-4.5 h-4.5 rounded-full border-2 border-slate-900 bg-sky-400 shadow-lg"></div>
            </div>
          `,
          className: "custom-select-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(center, { icon: customIcon }).addTo(mapRef.current);
        markerRef.current = marker;

        setStatusMessage(`Menemukan Kelurahan ${name}! Mengalihkan ke dashboard...`);
        
        // Wait for visual flying animation
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // Navigate
      const slug = name.toLowerCase().replace(/[\s_]+/g, '-');
      router.push(`/dashboard/${slug}`);
    } catch (err: any) {
      console.error("Search selection error:", err);
      const isExplicitBlock = err.message && err.message.includes("0 fasilitas");
      if (isExplicitBlock) {
        triggerError(err.message);
        setLoading(false);
      } else {
        // Fallback: If OSM API is down or times out, proceed to dashboard anyway
        const slug = name.toLowerCase().replace(/[\s_]+/g, '-');
        router.push(`/dashboard/${slug}`);
      }
    }
  };

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      triggerError("Browser Anda tidak mendukung deteksi lokasi. Silakan cari manual.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Meminta izin lokasi...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatusMessage("Mendeteksi kelurahan dari lokasi Anda...");

        try {
          const response = await fetch(`/api/villages/detect?lat=${latitude}&lng=${longitude}`);

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(
              errData.error || "Lokasi Anda berada di luar batas Kelurahan DKI Jakarta atau tidak terdaftar."
            );
          }

          const lookupData = await response.json();
          setStatusMessage(`Ditemukan: Kelurahan ${lookupData.name}! Mengalihkan ke dashboard...`);
          
          if (lookupData.id && lookupData.name && lookupData.district_name) {
            saveRecentSearch(lookupData.id, lookupData.name, lookupData.district_name);
          }

          const slug = lookupData.name.toLowerCase().replace(/[\s_]+/g, '-');
          router.push(`/dashboard/${slug}`);
        } catch (err: any) {
          console.error(err);
          triggerError(err.message || "Gagal mendeteksi kelurahan dari lokasi Anda.");
          setLoading(false);
        }
      },
      (geoError) => {
        setLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          triggerError("Izin lokasi ditolak. Silakan cari kelurahan Anda secara manual.");
        } else if (geoError.code === geoError.TIMEOUT) {
          triggerError("Waktu deteksi lokasi habis. Silakan coba lagi atau cari manual.");
        } else {
          triggerError("Tidak dapat mengambil lokasi Anda. Silakan cari manual.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  };

  // Filter list of villages based on query input
  const filteredVillages = searchQuery.trim() === ""
    ? []
    : villagesList.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.districtName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);

  return (
    <div className="relative w-full h-[530px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10 cursor-crosshair focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-jakarta-blue/50" tabIndex={0} aria-label="Peta Interaktif Jakarta" />

      {/* Floating Helper overlay */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl px-5 py-4 shadow-xl max-w-sm pointer-events-none hidden sm:block">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-jakarta-blue/20 text-jakarta-blue-light mt-0.5">
            <MapPin size={18} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Eksplorasi Peta DKI Jakarta</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Silakan **klik pada titik mana saja** di peta Jakarta. Sistem akan langsung mendeteksi Kelurahannya dan memuat dashboard fasilitas publiknya.
            </p>
          </div>
        </div>
      </div>



      {/* Floating Search Dropdown overlay */}
      <div className="absolute top-4 right-4 z-20 w-[calc(100vw-2rem)] sm:w-80 max-w-sm" ref={searchRef}>
        <div className={`relative bg-slate-900/90 backdrop-blur-md border transition-all rounded-xl shadow-xl p-1 flex items-center ${shakeError ? 'border-rose-500 animate-shake' : 'border-slate-800 focus-within:border-jakarta-blue/50'}`}>
          <Search size={18} className="text-slate-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            placeholder="Cari atau tap peta langsung..."
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            className="w-full bg-transparent text-slate-200 placeholder-slate-400 text-xs px-3 py-2.5 focus:outline-none"
            aria-label="Cari kelurahan"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(true);
                searchRef.current?.querySelector('input')?.focus();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors mr-1 focus:outline-none focus:ring-2 focus:ring-jakarta-blue"
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={handleUseMyLocation}
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-jakarta-blue/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white shadow-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-jakarta-blue"
          aria-label="Gunakan lokasi saya"
        >
          <LocateFixed size={15} className="text-jakarta-blue-light" />
          Klik di sini untuk melihat lokasi Anda
        </button>

        {/* Search Results Dropdown List */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {searchQuery.trim() === "" && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} />
                  Pencarian Terakhir
                </div>
                {recentSearches.map((v) => (
                  <button
                    key={'recent-' + v.id}
                    onClick={() => handleSelectVillage(v.id, v.name, v.districtName)}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800/60 transition-colors flex flex-col gap-0.5 focus:outline-none focus:bg-slate-800/80"
                  >
                    <span className="text-xs font-medium text-slate-300">
                      Kelurahan {v.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Kecamatan {v.districtName}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {searchQuery.trim() !== "" && filteredVillages.length > 0 && (
              <div className="py-1">
                {filteredVillages.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVillage(v.id, v.name, v.districtName)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-800/60 border-b border-slate-800/40 last:border-0 transition-colors flex flex-col gap-0.5 focus:outline-none focus:bg-slate-800/80"
                  >
                    <span className="text-xs font-semibold text-white">
                      Kelurahan {v.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Kecamatan {v.districtName}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() !== "" && filteredVillages.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Kelurahan tidak ditemukan
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
          <div className="text-center p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-xs shadow-2xl">
            <Loader2 className="w-9 h-9 text-jakarta-blue-light animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-200 font-semibold">{statusMessage}</p>
            <p className="text-xs text-slate-400 mt-1.5">Mohon tunggu sebentar...</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 backdrop-blur-md border border-rose-500/30 text-rose-200 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-lg max-w-md animate-fade-in-up">
          <AlertCircle size={18} className="text-rose-400 shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-[10px] uppercase font-bold tracking-wider text-rose-400 hover:text-white ml-2 focus:outline-none focus:underline"
            aria-label="Tutup pesan error"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
