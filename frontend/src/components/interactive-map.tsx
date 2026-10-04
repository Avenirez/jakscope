"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@/lib/overpass";
import { renderToString } from "react-dom/server";
import { HeartPulse, GraduationCap, TreePine, ShieldCheck, MapPin, Bus, Church, Store } from "lucide-react";

interface InteractiveMapProps {
  facilities: Facility[];
  selectedSector: string; // 'all' | 'health' | 'education' | 'recreation' | 'public_services'
  villageName: string;
  center?: [number, number] | null;
}

export default function InteractiveMap({
  facilities,
  selectedSector,
  villageName,
  center = null,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Filter facilities based on selected sector
  const filteredFacilities = facilities.filter((f) => {
    if (selectedSector === "all") return true;
    return f.sector === selectedSector;
  });

  // Create custom marker icons for each sector with distinctive colors
  const createCustomIcon = (
    sector: "health" | "education" | "recreation" | "public_services" | string,
    category: string
  ) => {
    let color = "#3b82f6"; // Default Blue (Education)
    let glowColor = "rgba(59, 130, 246, 0.5)";
    let IconComponent = MapPin;

    if (sector === "health") {
      color = "#f43f5e"; // Rose / Red
      glowColor = "rgba(244, 63, 94, 0.6)";
      IconComponent = HeartPulse;
    } else if (sector === "education") {
      color = "#38bdf8"; // Sky Blue
      glowColor = "rgba(56, 189, 248, 0.6)";
      IconComponent = GraduationCap;
    } else if (sector === "recreation") {
      color = "#10b981"; // Emerald / Green
      glowColor = "rgba(16, 185, 129, 0.6)";
      IconComponent = TreePine;
    } else if (sector === "public_services") {
      color = "#a855f7"; // Purple
      glowColor = "rgba(168, 85, 247, 0.6)";
      IconComponent = ShieldCheck;
    } else if (sector === "transport") {
      color = "#f59e0b"; // Amber
      glowColor = "rgba(245, 158, 11, 0.6)";
      IconComponent = Bus;
    } else if (sector === "worship") {
      color = "#6366f1"; // Indigo
      glowColor = "rgba(99, 102, 241, 0.6)";
      IconComponent = Church;
    } else if (sector === "market") {
      color = "#f97316"; // Orange
      glowColor = "rgba(249, 115, 22, 0.6)";
      IconComponent = Store;
    }

    const iconHtml = renderToString(<IconComponent size={12} color="white" />);

    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 group">
          <div class="absolute w-6 h-6 rounded-full animate-ping opacity-25" style="background-color: ${color}"></div>
          <div class="flex items-center justify-center w-5 h-5 rounded-full border border-slate-900 shadow-lg transition-transform duration-200 group-hover:scale-125" style="background-color: ${color}; box-shadow: 0 0 10px 4px ${glowColor}">
            ${iconHtml}
          </div>
        </div>
      `,
      className: "custom-leaflet-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10],
    });
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Use center prop as initial center if provided, otherwise default to Jakarta
    const initialCenter = center || [-6.2088, 106.8456];
    const initialZoom = center ? 14 : 13;

    // 1. Strict bounds restricted to DKI Jakarta area only
    const jakartaBounds = L.latLngBounds(
      [-6.39, 106.67], // Southwest corner (Kalideres / Jagakarsa border)
      [-6.06, 106.99]  // Northeast corner (Tanjung Priok / Marunda / Cakung border)
    );

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: jakartaBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    // 2. CartoDB Dark Matter tiles (Perfect for Dark Mode)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    const markersGroup = L.featureGroup().addTo(map);

    mapRef.current = map;
    markersGroupRef.current = markersGroup;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers & Fit Bounds
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    if (filteredFacilities.length === 0) {
      // Fallback to village center if provided, otherwise default general Jakarta center
      if (center) {
        map.setView(center, 14);
      } else {
        map.setView([-6.2088, 106.8456], 12);
      }
      return;
    }

    // Add new markers
    filteredFacilities.forEach((facility) => {
      const marker = L.marker([facility.lat, facility.lon], {
        icon: createCustomIcon(facility.sector, facility.category),
      });

      // Map sector keys to human labels for visual polish
      const sectorLabels: Record<string, string> = {
        health: "Kesehatan",
        education: "Pendidikan",
        recreation: "Taman & Rekreasi",
        public_services: "Layanan Keamanan & Publik",
        transport: "Transportasi Publik",
        worship: "Tempat Ibadah",
        market: "Pasar Tradisional",
      };

      const sectorColors: Record<string, string> = {
        health: "#f43f5e",
        education: "#38bdf8",
        recreation: "#10b981",
        public_services: "#a855f7",
        transport: "#f59e0b",
        worship: "#6366f1",
        market: "#f97316",
      };

      // HTML inside Popup
      const popupContent = `
        <div class="p-2 text-slate-100 font-sans" style="min-width: 160px;">
          <h4 class="font-bold text-sm text-white mb-1">${facility.name}</h4>
          <div class="text-[11px] text-slate-400 mt-1">${facility.category}</div>
          <div class="flex items-center gap-1.5 mt-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full" style="background-color: ${
              sectorColors[facility.sector] || "#3b82f6"
            }"></span>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              ${sectorLabels[facility.sector] || facility.sector}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-leaflet-popup",
        closeButton: false,
      });

      markersGroup.addLayer(marker);
    });

    // Fit bounds to show all markers beautifully
    try {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 16,
          animate: true,
          duration: 1.5,
        });
      } else if (center) {
        map.setView(center, 14);
      }
    } catch (e) {
      console.error("Error setting map bounds", e);
      if (center) {
        map.setView(center, 14);
      }
    }
  }, [filteredFacilities, center]);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Info Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 shadow-lg max-w-xs pointer-events-none">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Peta Fasilitas Riil
        </p>
        <h3 className="text-sm font-bold text-white truncate mt-0.5">
          Kelurahan {villageName}
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Menampilkan {filteredFacilities.length} fasilitas dari seluruh sektor
        </p>
      </div>

      {/* Custom Styles for Leaflet Dark theme compatibility */}
      <style jsx global>{`
        .leaflet-container {
          background-color: #0f172a !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          border: 1px solid #334155 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border-left: 1px solid #334155 !important;
          border-bottom: 1px solid #334155 !important;
        }
      `}</style>
    </div>
  );
}
