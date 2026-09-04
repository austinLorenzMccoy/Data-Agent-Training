import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Newsreader, Public_Sans, IBM_Plex_Mono } from 'next/font/google'
import { AgentProvider } from '@/components/providers/agent-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { AgentProvider as SupabaseAgentProvider } from '@/contexts/AgentContext'
import { SiteNav } from '@/components/site-nav'
import { AppShell } from '@/components/app-shell'
import { SidebarProvider } from '@/components/sidebar-context'
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

export const metadata: Metadata = {
  title: 'Datanerds Annotation',
  description:
    'Practice rating AI responses, maps, search results, and transcripts. Earn XP and climb the ranks.',
  generator: 'v0.app',
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
              </SidebarProvider>
            </AgentProvider>
          </SupabaseAgentProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
