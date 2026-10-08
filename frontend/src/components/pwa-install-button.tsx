"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Tangkap event saat browser siap memunculkan prompt install
    const handleBeforeInstallPrompt = (e: Event) => {
      // Cegah prompt bawaan muncul secara otomatis
      e.preventDefault();
      // Simpan event sehingga bisa kita panggil nanti
      setDeferredPrompt(e);
      setIsReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Cek apakah aplikasi sudah di-install (standalone mode)
    window.addEventListener("appinstalled", () => {
      setIsReady(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Munculkan prompt instalasi PWA
    deferredPrompt.prompt();

    // Tunggu pilihan user (install atau cancel)
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsReady(false);
      setDeferredPrompt(null);
    }
  };

  if (!isReady) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up lg:hidden">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-jakarta-blue/40 hover:border-jakarta-blue px-4 py-2.5 rounded-full shadow-xl hover:shadow-jakarta-blue/20 transition-all text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-jakarta-blue-light group"
      >
        <Download size={16} className="text-jakarta-blue-light group-hover:-translate-y-0.5 transition-transform" />
        Download Aplikasi
      </button>
    </div>
  );
}
