import { NextResponse } from 'next/server'

// Daily ping so the linked Supabase project counts as active and is not paused.
export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'supabase env missing' }, { status: 500 })
  }

  const res = await fetch(`${url}/rest/v1/rank_tiers?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const detail = await res.text()
    return NextResponse.json(
      { ok: false, status: res.status, detail: detail.slice(0, 200) },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
  })
}
