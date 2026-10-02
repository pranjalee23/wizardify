import type { MetadataRoute } from 'next'

// What search engines may crawl: the public pages, not the admin, reservation steps, unsubscribe
// links or the API
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/reserve', '/unsubscribe', '/api'] },
    sitemap: 'https://www.wizardify.me/sitemap.xml',
    host: 'https://www.wizardify.me',
  }
}
