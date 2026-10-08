import { Map, Loader2 } from "lucide-react";

export default function LoadingDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 pb-20 pt-8 px-4 sm:px-6">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto mb-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800"></div>
              <div className="w-32 h-4 rounded bg-slate-800"></div>
            </div>
            <div className="w-64 h-8 rounded-md bg-slate-800 mb-2"></div>
            <div className="w-48 h-4 rounded bg-slate-800"></div>
          </div>
          <div className="w-full sm:w-48 h-10 rounded-xl bg-slate-800"></div>
        </div>
      </div>

      {/* Main Grid Skeleton */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area Skeleton */}
        <div className="lg:col-span-2 space-y-6 animate-pulse">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="w-full h-[500px] bg-slate-800/50 rounded-xl flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-slate-700 animate-spin" />
            </div>
          </div>
        </div>

        {/* Sidebar Sidebar */}
        <div className="space-y-6 animate-pulse">
          {/* Stats Card Skeleton */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
            <div className="w-40 h-6 bg-slate-800 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                    <div className="w-24 h-4 bg-slate-800 rounded"></div>
                  </div>
                  <div className="w-8 h-6 bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
