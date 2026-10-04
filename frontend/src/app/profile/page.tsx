"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Star, MapPin, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface MyReview {
  id: string;
  village_id: number;
  rating: number;
  comment: string;
  created_at: string;
  villages: {
    name: string;
    slug: string;
  };
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user) {
      fetchMyReviews();
    }
  }, [user, router]);

  const fetchMyReviews = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id, rating, comment, created_at, village_id,
        villages ( name )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map the data to generate slugs based on village name
      const mappedData = data.map((r: any) => ({
        ...r,
        villages: {
          name: r.villages?.name || "Tidak diketahui",
          slug: (r.villages?.name || "").toLowerCase().replace(/[\s_]+/g, "-"),
        },
      }));
      setReviews(mappedData);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-jakarta-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center gap-6 animate-fade-in-up">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full border-4 border-slate-700 shadow-xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-xl">
            <UserIcon size={40} className="text-slate-400" />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-white mb-1">
            {user.user_metadata?.full_name || "Warga Jakarta"}
          </h1>
          <p className="text-slate-400 text-sm mb-4">{user.email}</p>
          <button
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors font-medium"
          >
            <LogOut size={16} /> Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Star className="text-jakarta-amber" /> Riwayat Ulasan Saya
      </h2>

      {reviews.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-400 animate-fade-in-up animate-delay-100">
          Belum ada ulasan yang kamu berikan. Silakan cari kelurahan dan bagikan ulasanmu!
        </div>
      ) : (
        <div className="grid gap-4 animate-fade-in-up animate-delay-100">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <Link
                  href={`/dashboard/${review.villages.slug}`}
                  className="flex items-center gap-1.5 text-jakarta-blue-light hover:underline font-semibold"
                >
                  <MapPin size={16} /> Kelurahan {review.villages.name}
                </Link>
                <div className="flex gap-0.5 text-jakarta-amber">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= review.rating ? "fill-current" : "text-slate-700 fill-transparent"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 leading-relaxed">
                "{review.comment}"
              </p>
              <p className="text-xs text-slate-500 text-right mt-1">
                {new Date(review.created_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
