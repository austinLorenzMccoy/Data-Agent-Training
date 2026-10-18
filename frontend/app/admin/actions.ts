'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/server/http'
import { isPlatformAdmin } from '@/lib/server/orgs'
import { ensureBank, questionById } from '@/lib/server/bank'
import { validateQuestion } from '@/lib/exam/validate'

export interface SaveResult {
  ok?: string
  errors?: string[]
  id?: string
}

async function requireAdmin() {
  const user = await currentUser()
  if (!user || !isPlatformAdmin(user)) throw new Error('Not allowed')
  return user
}

export async function saveQuestion(json: string, status: 'draft' | 'live'): Promise<SaveResult> {
  const user = await requireAdmin()
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (err) {
    return { errors: [`Not valid JSON: ${(err as Error).message}`] }
  }
  const checked = validateQuestion(parsed)
  if (!checked.ok) return { errors: checked.errors }
  const q = checked.question

  const { error } = await createAdminClient()
    .from('bank_questions' as never)
    .upsert(
      { id: q.id, type: q.type, data: q, status, updated_by: user.id, updated_at: new Date().toISOString() } as never,
      { onConflict: 'id' },
    )
  if (error) return { errors: [`Could not save: ${error.message}`] }
  await ensureBank(true)
  revalidatePath('/admin/questions')
  return { ok: status === 'live' ? 'Published. New tests and practice sets use it within a minute.' : 'Saved as draft.', id: q.id }
}

export async function retireQuestion(id: string): Promise<SaveResult> {
  const user = await requireAdmin()
  await ensureBank(true)
  const q = questionById(id)
  if (!q) return { errors: ['No question with that id.'] }
  const { error } = await createAdminClient()
    .from('bank_questions' as never)
    .upsert({ id, type: q.type, data: q, status: 'retired', updated_by: user.id, updated_at: new Date().toISOString() } as never, {
      onConflict: 'id',
    })
  if (error) return { errors: [error.message] }
  await ensureBank(true)
  revalidatePath('/admin/questions')
  return { ok: 'Retired. It will not be drawn again.', id }
}

/** Drop the database copy so a built-in question goes back to the shipped version. */
export async function revertQuestion(id: string): Promise<SaveResult> {
  await requireAdmin()
  const { error } = await createAdminClient().from('bank_questions' as never).delete().eq('id', id)
  if (error) return { errors: [error.message] }
  await ensureBank(true)
  revalidatePath('/admin/questions')
  return { ok: 'Removed the edit.', id }
}
