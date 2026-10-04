import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Kita larang Google mengindeks rute API mentah
    },
    sitemap: 'https://jakscope.my.id/sitemap.xml',
  }
}
