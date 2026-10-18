'use server'

import { revalidatePath } from 'next/cache'
import { currentUser } from '@/lib/server/http'
import { overrideGrade } from '@/lib/server/review'
import type { ActionState } from './actions'

export async function overrideGradeAction(logId: string, path: string, _: ActionState, form: FormData): Promise<ActionState> {
  const user = await currentUser()
  if (!user) return { error: 'Sign in again.' }
  const score = Number(form.get('score'))
  if (![0, 1, 2].includes(score)) return { error: 'Pick 0, 1 or 2.' }
  const note = String(form.get('note') ?? '').trim()
  try {
    const out = await overrideGrade(user, logId, score as 0 | 1 | 2, note)
    revalidatePath(path)
    return {
      ok: out.rescored
        ? `Saved. The result is now ${out.score}% (${out.passed ? 'pass' : 'below pass'}).`
        : 'Saved.',
    }
  } catch (err) {
    return { error: (err as Error).message === 'Not allowed' ? 'You cannot review this grade.' : 'Could not save the review.' }
  }
}
