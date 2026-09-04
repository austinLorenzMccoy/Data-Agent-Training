'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SidebarContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = 'sidebar-open'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(true)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored !== null) setOpenState(stored === 'true')
    } catch {
      // ignore
    }
  }, [])

  const setOpen = (value: boolean) => {
    setOpenState(value)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // ignore
    }
  }

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle: () => setOpen(!open) }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
