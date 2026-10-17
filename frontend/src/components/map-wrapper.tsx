"use client";

import dynamic from "next/dynamic";

const JakartaMap = dynamic(() => import("@/components/jakarta-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-950/40 rounded-3xl border border-slate-800/80 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-jakarta-blue-light border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-300 font-medium">Menyiapkan Peta Interaktif Jakarta...</p>
        <p className="text-xs text-slate-500 mt-1">Memuat koordinat 267 kelurahan</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <JakartaMap />;
}
