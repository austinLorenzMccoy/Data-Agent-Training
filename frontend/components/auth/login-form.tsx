'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'

export function LoginForm() {
  const { signInWithGoogle, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Sign in
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to save practice and test scores.
        </p>
      </div>

      {error === 'auth_failed' && (
        <div className="w-full p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm text-center">
          Authentication failed. Please try again.
        </div>
      )}

      <button
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="
          flex items-center gap-3 px-6 py-3 rounded-lg
          bg-primary hover:bg-primary/80 active:scale-95
          text-primary-foreground font-medium text-sm
          transition-all duration-150 cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          w-full max-w-xs justify-center
        "
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path fill="currentColor" opacity="0.9" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
          <path fill="currentColor" opacity="0.7" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
          <path fill="currentColor" opacity="0.5" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
          <path fill="currentColor" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
        </svg>
        {isLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      <p className="text-muted-foreground text-xs text-center max-w-xs">
        Your profile, XP, and rank are tied to your Google account.
        Your data is private and only visible to you.
      </p>
    </div>
  )
}
