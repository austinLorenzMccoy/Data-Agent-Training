import { Suspense } from 'react'
import { SiteNav } from '@/components/site-nav'
import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <SiteNav />
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md agency-card">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
