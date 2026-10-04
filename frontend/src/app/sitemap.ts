import { MetadataRoute } from 'next'
import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jakscope.my.id';

  // Rute statis (Halaman utama dan profil)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Ambil semua kelurahan dari Supabase untuk di-index oleh Google
    const { data: villages } = await supabase
      .from("villages")
      .select("name");

    if (!villages) return staticRoutes;

    const dynamicRoutes = villages.map((village) => {
      const slug = village.name.toLowerCase().replace(/[\s_]+/g, '-');
      return {
        url: `${baseUrl}/dashboard/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (err) {
    return staticRoutes;
  }
}
