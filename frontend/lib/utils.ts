import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Pages that render without the app sidebar/header chrome. */
export function pathHasSidebar(pathname: string | null | undefined) {
  return !!pathname && pathname !== '/' && pathname !== '/login'
}
