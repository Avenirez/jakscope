"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Info } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  
  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-jakarta-blue-light rounded-lg px-2 py-1 -ml-2"
          aria-label="Kembali ke Beranda JakScope"
        >
          <span className="font-bold text-xl tracking-tight text-white">
            Jak<span className="bg-gradient-to-r from-jakarta-blue-light to-jakarta-emerald bg-clip-text text-transparent">Scope</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-jakarta-blue-light rounded-md px-2 py-1 ${pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Beranda
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-jakarta-blue-light rounded-md px-2 py-1"
          >
            <Info className="w-4 h-4" />
            Tentang
          </Link>
        </div>
      </div>
    </nav>
  );
}
