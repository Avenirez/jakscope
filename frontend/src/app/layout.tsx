import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import PwaInstallButton from "@/components/pwa-install-button";

export const metadata: Metadata = {
  title: "JakScope",
  description:
    "Temukan dan pantau sebaran fasilitas publik riil seperti kesehatan, pendidikan, ruang terbuka hijau, hingga layanan keamanan di kelurahan Jakarta menggunakan data OpenStreetMap.",
  openGraph: {
    title: "JakScope",
    description: "Peta Distribusi Fasilitas Publik DKI Jakarta",
    type: "website",
  },
  verification: {
    google: "XLQxg0ud64eUCk1NXi5xGgYrleK5v_yDOMKSOj0oAHI",
  },
  manifest: "/manifest.json",
  themeColor: "#0F172A",
  other: {
    "geo.region": "ID-JK",
    "geo.placename": "DKI Jakarta",
    "geo.position": "-6.200000;106.816666",
    "ICBM": "-6.200000, 106.816666",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <PwaInstallButton />
        <Analytics />
      </body>
    </html>
  );
}
