import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiter dasar berbasis memory untuk API routes.
 *
 * Catatan penting: di Vercel serverless, tiap instance function punya
 * memori sendiri-sendiri, jadi limit ini TIDAK presisi di skala besar
 * (bisa "reset" kalau request nyasar ke instance yang beda).
 * Cukup buat proteksi dasar dari bot/flood sederhana.
 *
 * Buat proteksi yang lebih serius & konsisten di production, ganti dengan
 * Upstash Redis: npm i @upstash/ratelimit @upstash/redis
 */

const WINDOW_MS = 60_000; // jendela waktu: 1 menit
const MAX_REQUESTS = 30; // maksimal request per IP per jendela waktu

const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

export function middleware(request: NextRequest) {
  // Cuma batasi API routes, biar halaman/peta statis tetap cepat diakses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = (request as any).ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak request. Coba lagi sebentar lagi.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
