'use client'

import { usePathname } from 'next/navigation'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hasSidebar = !!pathname && pathname !== '/' && pathname !== '/login'

  return <div className={hasSidebar ? 'md:pl-64' : undefined}>{children}</div>
}
