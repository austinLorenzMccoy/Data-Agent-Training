import type { Question } from '@/lib/types'
import type { Permutation } from './public'

type Rng = () => number

export function shuffled<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Option count a question's choices can be shuffled over (0 = not shuffled). */
export function optionCount(q: Question): number {
  if ((q.type === 'delta' || q.type === 'kappa') && q.responses) return q.responses.length
  if ((q.type === 'beta' || q.type === 'iota') && q.responseA !== undefined && q.responseB !== undefined) return 2
  return 0
}

/** A random shown→original mapping for the question's options, or [] if it has none. */
export function randomPermutation(q: Question, rng: Rng = Math.random): Permutation {
  const n = optionCount(q)
  if (n === 0) return []
  return shuffled(
    Array.from({ length: n }, (_, i) => i),
    rng,
  )
}

function isSwapped(perm: Permutation): boolean {
  return perm.length === 2 && perm[0] === 1
}

/** The question as the candidate sees it: options reordered by `perm`. */
export function applyPermutation(q: Question, perm: Permutation): Question {
  if (perm.length === 0) return q
  if (q.type === 'delta' || q.type === 'kappa') {
    return { ...q, responses: perm.map((i) => q.responses![i]) }
  }
  if ((q.type === 'beta' || q.type === 'iota') && isSwapped(perm)) {
    return {
      ...q,
      responseA: q.responseB,
      responseB: q.responseA,
      ratingA: q.ratingB,
      ratingB: q.ratingA,
    }
  }
  return q
}

/** Map a selection made on the shown question back to the original option order. */
export function canonicalSelection(q: Question, perm: Permutation, selection: unknown): unknown {
  if (perm.length === 0) return selection
  if (q.type === 'delta' || q.type === 'kappa') {
    return typeof selection === 'number' && Number.isInteger(selection) && selection >= 0 && selection < perm.length
      ? perm[selection]
      : selection
  }
  if ((q.type === 'beta' || q.type === 'iota') && isSwapped(perm)) {
    if (selection === 'A') return 'B'
    if (selection === 'B') return 'A'
  }
  return selection
}
