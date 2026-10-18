import { PageHero } from '@/components/page-hero'

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || ''
export const LEGAL_UPDATED = '18 October 2026'

export function LegalPage({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen">
      <PageHero eyebrow={eyebrow} title={title} accent={accent}>
        Last updated {LEGAL_UPDATED}.
      </PageHero>
      <article className="legal-prose mx-auto max-w-2xl px-4 py-14">{children}</article>
    </main>
  )
}

export function ContactLine() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
  ) : (
    <span>the support contact listed on the site</span>
  )
}
