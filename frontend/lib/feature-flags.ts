import type { AssignmentType } from './types'

export const CORE_TYPES: AssignmentType[] = ['alpha', 'beta', 'gamma', 'delta']
export const V4_TYPES: AssignmentType[] = ['epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa']

/** Unset means on, so shipped builds show the v4 tracks. Set `false` to hide one. */
function flag(name: string): boolean {
  const value = process.env[name]
  if (value === undefined || value === '') return true
  return value === 'true'
}

export const TRACK_FLAGS = {
  epsilon: flag('NEXT_PUBLIC_TRACK_EPSILON'),
  zeta: flag('NEXT_PUBLIC_TRACK_ZETA'),
  eta: flag('NEXT_PUBLIC_TRACK_ETA'),
  theta: flag('NEXT_PUBLIC_TRACK_THETA'),
  iota: flag('NEXT_PUBLIC_TRACK_IOTA'),
  kappa: flag('NEXT_PUBLIC_TRACK_KAPPA'),
} as const

export const FEATURE_PROFICIENCY_GATE = flag('NEXT_PUBLIC_FEATURE_PROFICIENCY_GATE')

/** Optional global exam id (e.g. 'en-CA'). Empty = no org-level gate. */
export const REQUIRED_PROFICIENCY_EXAM =
  process.env.NEXT_PUBLIC_REQUIRED_PROFICIENCY_EXAM?.trim() || ''

/** Comma-separated types gated by the proficiency exam. Default: theta. */
export function getProficiencyGatedTypes(): AssignmentType[] {
  if (!FEATURE_PROFICIENCY_GATE || !REQUIRED_PROFICIENCY_EXAM) return []
  const raw = process.env.NEXT_PUBLIC_PROFICIENCY_GATED_TYPES?.trim()
  if (!raw) return ['theta']
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is AssignmentType =>
      (V4_TYPES as string[]).includes(s) || (CORE_TYPES as string[]).includes(s),
    )
}

export function isTrackEnabled(type: AssignmentType): boolean {
  if ((CORE_TYPES as string[]).includes(type)) return true
  if (type === 'epsilon') return TRACK_FLAGS.epsilon
  if (type === 'zeta') return TRACK_FLAGS.zeta
  if (type === 'eta') return TRACK_FLAGS.eta
  if (type === 'theta') return TRACK_FLAGS.theta
  if (type === 'iota') return TRACK_FLAGS.iota
  if (type === 'kappa') return TRACK_FLAGS.kappa
  return false
}

export function getEnabledTypes(): AssignmentType[] {
  return [...CORE_TYPES, ...V4_TYPES.filter(isTrackEnabled)]
}

export function isV4Type(type: AssignmentType): boolean {
  return (V4_TYPES as string[]).includes(type)
}
