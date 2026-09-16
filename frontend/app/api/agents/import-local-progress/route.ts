import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Best-effort, one-shot import of pre-signup localStorage progress. This is
// an unverifiable, client-asserted claim (same trust level as the existing
// proficiency-exam cookie) — sanity-clamped, and only ever applied once,
// onto an agent row that hasn't earned any real XP yet.
const MAX_PLAUSIBLE_XP = 500_000

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { xp, bestStreak } = await request.json()
  const importedXp = Math.min(Math.max(0, Number(xp) || 0), MAX_PLAUSIBLE_XP)
  const importedStreak = Math.min(Math.max(0, Number(bestStreak) || 0), 1000)

  const { data: agentRow, error: fetchError } = await supabase
    .from('agents').select('total_xp, best_streak').eq('id', user.id).single()
  // See lib/entitlements.ts — the generated client types collapse to
  // `never` here for reasons unrelated to this feature; cast at the boundary.
  const agent = agentRow as unknown as { total_xp: number; best_streak: number } | null
  if (fetchError || !agent) {
    return NextResponse.json({ error: 'agent not found' }, { status: 404 })
  }

  if (agent.total_xp !== 0) {
    return NextResponse.json({ error: 'import already applied or account not fresh' }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from('agents')
    .update({ total_xp: importedXp, best_streak: Math.max(agent.best_streak, importedStreak) } as never)
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, importedXp })
}
