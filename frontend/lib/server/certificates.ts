import 'server-only'
import { createAdminClient } from '@/lib/supabase/server'

export interface PublicCertificate {
  code: string
  displayName: string
  operationName: string
  track: string
  score: number
  integrityVerified: boolean
  issuedAt: string
  revokedAt: string | null
  revokedReason: string | null
}

export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^(.{5})(.+)$/, '$1-$2')
}

export async function findCertificate(rawCode: string): Promise<PublicCertificate | null> {
  const code = normalizeCode(rawCode)
  if (!/^[0-9A-Z]{5}-[0-9A-Z]{5}$/.test(code)) return null
  const { data, error } = await createAdminClient()
    .from('certificates' as never)
    .select('code, display_name, operation_name, track, score, integrity_verified, issued_at, revoked_at, revoked_reason')
    .eq('code', code)
    .maybeSingle()
  if (error) {
    console.error('findCertificate:', error.message)
    return null
  }
  const row = data as unknown as {
    code: string
    display_name: string
    operation_name: string
    track: string
    score: number
    integrity_verified: boolean
    issued_at: string
    revoked_at: string | null
    revoked_reason: string | null
  } | null
  if (!row) return null
  return {
    code: row.code,
    displayName: row.display_name,
    operationName: row.operation_name,
    track: row.track,
    score: row.score,
    integrityVerified: row.integrity_verified,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at,
    revokedReason: row.revoked_reason,
  }
}
