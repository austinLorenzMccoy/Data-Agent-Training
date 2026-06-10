import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rankTierId = searchParams.get('rank')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100)

  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('leaderboard')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(limit)

  if (rankTierId) {
    query = query.eq('rank_tier_id', parseInt(rankTierId))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
  })
}
