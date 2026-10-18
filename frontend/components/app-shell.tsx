'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/sidebar-context'
import { SiteFooter } from '@/components/site-footer'
import { cn, pathHasSidebar } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { open } = useSidebar()
  const hasSidebar = pathHasSidebar(pathname)

  return (
    <div
      className={cn(
        'transition-[padding] duration-300',
        hasSidebar && open && 'md:pl-64',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div id="main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}
