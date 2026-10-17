import type { Metadata } from "next";
import Link from "next/link";
import DashboardClient from "./DashboardClient";
import { getVillageDetailsServer } from "@/lib/village-server";

type Props = {
  params: Promise<{ villageId: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jakscope.my.id";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { villageId } = await params;
  const village = await getVillageDetailsServer(villageId);

  if (!village) {
    return {
      title: "Kelurahan Tidak Ditemukan | JakScope",
      description: "Peta sebaran fasilitas publik tingkat Kelurahan di DKI Jakarta.",
    };
  }

  const { village_name, district_name, center, facilities, sectorCounts } = village;
  const totalCount = facilities.length;
  const pageUrl = `${baseUrl}/dashboard/${villageId}`;

  const lat = center ? center[0] : -6.200000;
  const lon = center ? center[1] : 106.816666;

  const title = `Kelurahan ${village_name}, ${district_name} - Fasilitas Publik & Peta`;
  const description = totalCount > 0
    ? `Peta interaktif & data lengkap ${totalCount} fasilitas publik di Kelurahan ${village_name}, Kec. ${district_name}, DKI Jakarta. Termasuk ${sectorCounts.health} faskes, ${sectorCounts.education} sekolah, ${sectorCounts.recreation} taman/RPTRA, dan rute navigasi.`
    : `Peta interaktif dan persebaran fasilitas publik (kesehatan, pendidikan, RPTRA, transportasi) di Kelurahan ${village_name}, Kec. ${district_name}, DKI Jakarta.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Peta Fasilitas Publik Kel. ${village_name}, Kec. ${district_name}`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "JakScope",
      locale: "id_ID",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `Peta Fasilitas Publik Kelurahan ${village_name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Kelurahan ${village_name} - Fasilitas Publik & Peta | JakScope`,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    other: {
      "geo.region": "ID-JK",
      "geo.placename": `Kelurahan ${village_name}, Kecamatan ${district_name}, DKI Jakarta, Indonesia`,
      "geo.position": `${lat};${lon}`,
      "ICBM": `${lat}, ${lon}`,
    },
  };
}

export default async function VillageDashboardPage({ params }: Props) {
  const { villageId } = await params;
  const village = await getVillageDetailsServer(villageId);

  if (!village) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-rose-400 mb-4 font-semibold">
            Data Kelurahan tidak ditemukan di database.
          </p>
          <Link
            href="/"
            className="text-jakarta-blue-light hover:underline font-medium"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const {
    village_id,
    village_name,
    district_name,
    facilities,
    center,
    sectorCounts,
    ratingAverage,
    ratingCount,
  } = village;

  const pageUrl = `${baseUrl}/dashboard/${villageId}`;

  // Structured Data 1: BreadcrumbList (Rich Snippet)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "DKI Jakarta",
        item: `${baseUrl}/#direktori-wilayah`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Kecamatan ${district_name}`,
        item: `${baseUrl}/#kecamatan-${district_name.toLowerCase().replace(/[\s_]+/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `Kelurahan ${village_name}`,
        item: pageUrl,
      },
    ],
  };

  // Structured Data 2: AdministrativeArea / Place (GEO Knowledge Graph)
  const placeSchema: any = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    name: `Kelurahan ${village_name}`,
    description: `Wilayah administrasi Kelurahan ${village_name}, Kecamatan ${district_name}, Provinsi DKI Jakarta dengan ${facilities.length} fasilitas publik terdata.`,
    url: pageUrl,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: `Kecamatan ${district_name}`,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "DKI Jakarta",
        containedInPlace: {
          "@type": "Country",
          name: "Indonesia",
        },
      },
    },
  };

  if (center) {
    placeSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: center[0],
      longitude: center[1],
    };
    placeSchema.hasMap = pageUrl;
  }

  if (ratingAverage && ratingCount > 0) {
    placeSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingAverage,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Structured Data 3: FAQPage Schema (For AI Overviews & Featured Snippets)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Fasilitas publik apa saja yang terdata di Kelurahan ${village_name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Berdasarkan data spasial OpenStreetMap dan sistem JakScope, terdapat ${facilities.length} fasilitas publik terverifikasi di Kelurahan ${village_name}, mencakup ${sectorCounts.health} sarana kesehatan (Puskesmas/Rumah Sakit), ${sectorCounts.education} instansi pendidikan, ${sectorCounts.recreation} ruang terbuka hijau/RPTRA, ${sectorCounts.transport} titik transportasi publik, dan ${sectorCounts.public_services} pos layanan keamanan/publik.`,
        },
      },
      {
        "@type": "Question",
        name: `Bagaimana cara menemukan rute ke fasilitas di Kelurahan ${village_name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Anda dapat mengklik salah satu penanda (marker) pada peta interaktif JakScope, lalu memilih opsi "Buka di Google Maps" untuk langsung membuka navigasi GPS menuju fasilitas yang dituju.`,
        },
      },
      {
        "@type": "Question",
        name: `Dari mana sumber data fasilitas publik Kelurahan ${village_name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Data dihimpun dari OpenStreetMap (OSM) melalui Overpass API multi-mirror dan dicadangkan secara berkala ke database Supabase JakScope untuk memastikan performa tinggi dan data yang mutakhir.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <DashboardClient
        initialData={{
          village_id,
          village_name,
          district_name,
        }}
        initialFacilities={facilities}
        initialCenter={center}
        initialSectorCounts={sectorCounts}
      />
    </>
  );
}
