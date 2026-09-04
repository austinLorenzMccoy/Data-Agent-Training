import type { MetadataRoute } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://datanerds-ai-training.vercel.app').replace(/\/$/, '')

const ROUTES = ['', '/prep', '/guidelines', '/training', '/operation', '/dossier', '/rankings', '/login']

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }))
}
