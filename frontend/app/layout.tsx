import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { AgentProvider } from '@/components/providers/agent-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { AgentProvider as SupabaseAgentProvider } from '@/contexts/AgentContext'
import { SiteNav } from '@/components/site-nav'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Datanerds Annotation · codename DNA',
  description:
    'An intelligence-agency training programme for Data Agents. Evaluate AI intelligence, earn XP, climb the rank ladder, and get your Clearance Badge.',
  generator: 'v0.app',
}

export const viewport = {
  themeColor: '#0d0c1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark bg-background ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <SupabaseAgentProvider>
            <AgentProvider>
              <SiteNav />
              {children}
            </AgentProvider>
          </SupabaseAgentProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
