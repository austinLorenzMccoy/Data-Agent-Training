import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ROUTES = ['/login']

function proficiencyRedirect(request: NextRequest): NextResponse | null {
  const gateOn = process.env.NEXT_PUBLIC_FEATURE_PROFICIENCY_GATE === 'true'
  const requiredExam = process.env.NEXT_PUBLIC_REQUIRED_PROFICIENCY_EXAM?.trim()
  const pathname = request.nextUrl.pathname
  if (!gateOn || !requiredExam || pathname.startsWith('/proficiency')) return null
  const gated = (process.env.NEXT_PUBLIC_PROFICIENCY_GATED_TYPES || 'theta')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const hitsGatedTrack = gated.some(
    (t) => pathname === `/training/${t}` || pathname.startsWith(`/training/${t}/`),
  )
  const passed = request.cookies.get(`dna_proficiency_${requiredExam}`)?.value === 'passed'
  if (hitsGatedTrack && !passed) {
    const examUrl = new URL(`/proficiency/${requiredExam}`, request.url)
    examUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(examUrl)
  }
  return null
}

export async function proxy(request: NextRequest) {
  const gated = proficiencyRedirect(request)
  if (gated) return gated

  // If Supabase is not configured, skip auth checks
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Practice, tests, progress, and rankings stay usable without Google.
  // Sign-in is optional and only needed to persist a cloud profile.
  if (user && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
