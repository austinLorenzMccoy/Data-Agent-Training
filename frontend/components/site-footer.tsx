'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const COLUMNS = [
  {
    title: 'Learn',
    links: [
      { href: '/prep', label: 'Study guide' },
      { href: '/guidelines', label: 'Guidelines' },
      { href: '/training', label: 'Practice' },
      { href: '/operation', label: 'Timed tests' },
    ],
  },
  {
    title: 'Progress',
    links: [
      { href: '/dossier', label: 'Your progress' },
      { href: '/rankings', label: 'Rankings' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/pricing', label: 'Pricing' },
      { href: '/billing', label: 'Billing' },
      { href: '/login', label: 'Sign in' },
    ],
  },
]

export function SiteFooter() {
  const pathname = usePathname()
  if (pathname?.startsWith('/operation/run')) return null

  return (
    <footer className="ink-band relative overflow-hidden">
      <div className="relative mx-auto grid max-w-5xl gap-10 px-4 pb-10 pt-14 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-heading text-xl italic leading-none text-ink-foreground">Datanerds</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink-accent">Annotation</span>
          </Link>
          <p className="mt-4 max-w-xs font-heading text-lg italic leading-snug text-ink-foreground/90">
            Study the rules. Practice the calls. Pass the test.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-accent">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-muted transition-colors hover:text-ink-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative mx-auto flex max-w-5xl flex-col gap-2 border-t border-white/10 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Datanerds Annotation</p>
        <a href="#top" className="hover:text-ink-foreground">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
