import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Newsreader, Public_Sans, IBM_Plex_Mono } from 'next/font/google'
import { AgentProvider } from '@/components/providers/agent-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { AgentProvider as SupabaseAgentProvider } from '@/contexts/AgentContext'
import { SiteNav } from '@/components/site-nav'
import { AppShell } from '@/components/app-shell'
import { SidebarProvider } from '@/components/sidebar-context'
import { ImportProgressDialog } from '@/components/billing/import-progress-dialog'
import './globals.css'

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})
const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
})
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://datanerds-ai-training.vercel.app').replace(/\/$/, '')
const SITE_TITLE = 'Datanerds Annotation'
const SITE_DESCRIPTION =
  'Practice rating AI responses, maps, search results, and transcripts. Earn XP and climb the ranks.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    images: [{ url: '/landing/desk.jpg', width: 1280, height: 720 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/landing/desk.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  themeColor: '#f3eee4',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-background ${newsreader.variable} ${publicSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <SupabaseAgentProvider>
            <AgentProvider>
              <SidebarProvider>
                <SiteNav />
                <AppShell>{children}</AppShell>
                <ImportProgressDialog />
              </SidebarProvider>
            </AgentProvider>
          </SupabaseAgentProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
