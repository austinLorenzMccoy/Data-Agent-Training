import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://datanerds-aitraining.vercel.app').replace(/\/$/, '')

const ROUTES = ['', '/prep', '/learn', '/learn/review-a-transcript', '/learn/how-a-timed-test-works', '/guidelines', '/training', '/operation', '/dossier', '/rankings', '/login', '/pricing', '/terms', '/privacy', '/verify']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))
}
