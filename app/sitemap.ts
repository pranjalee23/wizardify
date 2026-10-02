import type { MetadataRoute } from 'next'
import { houses } from '@/lib/houses'
import { routes } from '@/lib/routes'

const site = 'https://www.wizardify.me'

// The pages Google should know about. Reservation steps, the admin and other private pages are left
// out (and kept out by robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    [routes.home, 1],
    [routes.frame, 0.9],
    [routes.drop, 0.9],
    [routes.howItWorks, 0.8],
    [routes.houses, 0.8],
    ...houses.map((h): [string, number] => [routes.house(h.id), 0.7]),
    [routes.gallery, 0.7],
    [routes.faq, 0.6],
    [routes.privacy, 0.2],
    [routes.terms, 0.2],
  ]
  return pages.map(([path, priority]) => ({ url: `${site}${path === '/' ? '' : path}`, changeFrequency: 'weekly', priority }))
}
