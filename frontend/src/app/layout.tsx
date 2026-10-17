import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import PwaInstallButton from "@/components/pwa-install-button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jakscope.my.id";

export const viewport: Viewport = {
  themeColor: "#0F172A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JakScope - Pantau & Peta Fasilitas Publik DKI Jakarta",
    template: "%s | JakScope",
  },
  description:
    "Pantau persebaran fasilitas publik riil seperti puskesmas, rumah sakit, sekolah, taman RPTRA, transportasi publik, hingga pos keamanan di 267 kelurahan DKI Jakarta secara real-time.",
  applicationName: "JakScope",
  authors: [{ name: "JakScope", url: siteUrl }],
  creator: "JakScope",
  publisher: "JakScope",
  category: "Government & Public Services",
  formatDetection: {
    email: false,
    address: true,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "JakScope",
    "fasilitas publik jakarta",
    "peta jakarta",
    "kelurahan jakarta",
    "puskesmas jakarta",
    "rumah sakit dki jakarta",
    "sekolah jakarta",
    "RPTRA jakarta",
    "taman kota jakarta",
    "transportasi jakarta",
    "pos pemadam jakarta",
    "kantor kelurahan",
    "open data jakarta",
    "openstreetmap dki jakarta",
    "pantau jakarta",
    "civic tech indonesia",
  ],
  openGraph: {
    title: "JakScope - Pantau & Peta Fasilitas Publik DKI Jakarta",
    description: "Peta distribusi dan direktori 267 kelurahan DKI Jakarta untuk memantau fasilitas kesehatan, pendidikan, ruang terbuka hijau, dan transportasi publik.",
    url: siteUrl,
    siteName: "JakScope",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JakScope - Pantau Fasilitas Publik DKI Jakarta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JakScope - Pantau & Peta Fasilitas Publik DKI Jakarta",
    description: "Peta distribusi dan direktori 267 kelurahan DKI Jakarta untuk memantau fasilitas kesehatan, pendidikan, ruang terbuka hijau, dan transportasi publik.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "XLQxg0ud64eUCk1NXi5xGgYrleK5v_yDOMKSOj0oAHI",
  },
  manifest: "/manifest.json",
  other: {
    "geo.region": "ID-JK",
    "geo.placename": "DKI Jakarta, Indonesia",
    "geo.position": "-6.200000;106.816666",
    "ICBM": "-6.200000, 106.816666",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JakScope",
    url: siteUrl,
    description: "Platform visualisasi interaktif dan pemantauan fasilitas publik tingkat Kelurahan di DKI Jakarta.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/dashboard/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id-ID",
  };

  return (
    <html lang="id" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <PwaInstallButton />
        <Analytics />
      </body>
    </html>
  );
}

