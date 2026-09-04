'use client'

import { usePathname } from 'next/navigation'
import { useSidebar } from '@/components/sidebar-context'
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
      {children}
    </div>
  )
}
