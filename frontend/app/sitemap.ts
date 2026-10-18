import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://datanerds-aitraining.vercel.app').replace(/\/$/, '')

const ROUTES = ['', '/prep', '/prep/rating', '/prep/transcripts', '/prep/replies', '/prep/extra-tracks', '/learn', '/learn/review-a-transcript', '/learn/how-a-timed-test-works', '/learn/rate-ai-responses', '/learn/pick-the-best-reply', '/guidelines', '/training', '/operation', '/dossier', '/rankings', '/login', '/pricing', '/terms', '/privacy', '/verify']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))
}
