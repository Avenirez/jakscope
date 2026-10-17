import { MetadataRoute } from 'next';
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jakscope.my.id';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      images: [`${baseUrl}/og-image.png`],
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  try {
    // Ambil data kelurahan untuk di-index oleh Google & crawler AI
    const { data: villages } = await supabase
      .from("villages")
      .select("name, created_at");

    if (!villages) return staticRoutes;

    const dynamicRoutes: MetadataRoute.Sitemap = villages.map((village) => {
      const slug = village.name.toLowerCase().replace(/[\s_]+/g, '-');
      return {
        url: `${baseUrl}/dashboard/${slug}`,
        lastModified: village.created_at ? new Date(village.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        images: [`${baseUrl}/og-image.png`],
      };
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (err) {
    return staticRoutes;
  }
}
