"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { HOME_FAQS } from "@/core/constants/faqs";

export default function HomeFaq() {

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-4xl mx-auto px-6 py-16" aria-label="Pertanyaan yang Sering Diajukan">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jakarta-emerald/10 border border-jakarta-emerald/20 text-jakarta-emerald text-xs font-semibold mb-3">
          <HelpCircle size={14} />
          FAQ
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Semua hal yang perlu Anda ketahui tentang pemantauan fasilitas publik di JakScope.
        </p>
      </div>

      <div className="space-y-3">
        {HOME_FAQS.map((faq, idx) => (
          <div
            key={faq.q}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-slate-200 hover:text-white"
            >
              <span>{faq.q}</span>
              <ChevronDown
                size={18}
                className={`transition-transform shrink-0 ${
                  openIndex === idx ? "rotate-180 text-jakarta-blue-light" : "text-slate-500"
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
